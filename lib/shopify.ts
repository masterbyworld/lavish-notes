import 'server-only'
import { skuBase, sizeKey } from './sku'

// Shopify Storefront API client. Variants are matched to the catalog by SKU
// base (see lib/live-catalog.ts), so -B and -W listings both resolve.

const API_VERSION = '2024-10'

// The Storefront GraphQL API only authenticates on the `*.myshopify.com` host.
// A public/custom domain (lavishnotes.com, shop.lavishnotes.com) returns 401
// UNAUTHORIZED even with a valid token — so we ALWAYS resolve to the myshopify
// host. The env var is honored only when it already points at a myshopify
// domain; otherwise we fall back to the known store. (The checkout URL Shopify
// returns is still on the primary domain, which is correct.)
const FALLBACK_MYSHOPIFY = 'lavish-notes.myshopify.com'

function storeDomain(): string {
  // Read ONLY the exact env var name set in Vercel — no legacy aliases.
  const raw = (process.env.Lavish_Notes_Checkout || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
  // Always resolve to the myshopify host: honor the env value only when it is
  // already a myshopify domain, otherwise use the hardcoded fallback.
  return raw.toLowerCase().endsWith('.myshopify.com') ? raw : FALLBACK_MYSHOPIFY
}

// Read the token at call time (not module load) and trim it. A trailing space
// or newline in the stored env value is the classic cause of a Storefront 401,
// because the malformed header gets rejected by Shopify.
//
// The key is assembled at runtime instead of written as a static
// `process.env.NEXT_PUBLIC_…` expression on purpose: Next.js/Turbopack INLINES
// static `NEXT_PUBLIC_*` references at compile time, so if the module compiled
// before the env var was injected it would be baked in as an empty string.
// A computed key can't be inlined, forcing a true runtime process.env lookup.
function storefrontToken(): string {
  const key = 'NEXT_PUBLIC_' + 'LAVISH_Notes_STOREFRONT_ACCESS_TOKEN'
  const token = (process.env[key] || '').trim()
  if (!token) throw new Error('Shopify Storefront token is not configured')
  return token
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Shopify throttles bursts of Storefront requests and surfaces it inconsistently
// (429/430, sometimes 401, or 5xx). These are transient — retry with backoff
// rather than failing the whole checkout on a single throttled response.
const TRANSIENT_STATUSES = new Set([429, 430, 500, 502, 503, 504])

async function storefront<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const endpoint = `https://${storeDomain()}/api/${API_VERSION}/graphql.json`
  const maxAttempts = 4
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken(),
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    })

    if (res.ok) {
      const json = (await res.json()) as { data?: T; errors?: { message: string }[] }
      if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '))
      if (!json.data) throw new Error('Shopify returned no data')
      return json.data
    }

    const detail = await res.text().catch(() => '')
    const hint =
      res.status === 401
        ? ' — token/store rejected. Verify NEXT_PUBLIC_LAVISH_Notes_STOREFRONT_ACCESS_TOKEN and Lavish_Notes_Checkout.'
        : ''
    lastError = new Error(
      `Shopify request failed (${res.status})${hint}${detail ? ` ${detail.slice(0, 200)}` : ''}`,
    )

    // Retry transient/throttle responses with exponential backoff; fail fast on
    // genuine client errors (e.g. 400/404) that won't change on retry.
    if (!TRANSIENT_STATUSES.has(res.status) || attempt === maxAttempts) break
    await sleep(300 * 2 ** (attempt - 1))
  }

  throw lastError ?? new Error('Shopify request failed')
}

/** Live state of one Shopify variant, as returned by the Storefront API. */
export type ShopifyVariant = {
  variantId: string
  sku: string
  size: string
  price: number
  compareAt: number
  availableForSale: boolean
  // Null when the token lacks the `unauthenticated_read_product_inventory` scope.
  quantity: number | null
}

/**
 * Indexed snapshot of every Shopify variant, for SKU-base matching:
 *   bySku         exact SKU                       "RPM-CR-0011-W"
 *   byBase        SKU base (-B/-W stripped)       "RPM-CR-0011"
 *   byProductSize product's main SKU base + size  "RPM-CR-0011|75"
 */
export type ShopifyIndex = {
  bySku: Map<string, ShopifyVariant>
  byBase: Map<string, ShopifyVariant>
  byProductSize: Map<string, ShopifyVariant>
  variantCount: number
  inventoryScope: boolean
}

// Shopify's `products(query:"sku:…")` search is relevance-based and does NOT
// reliably return an exact SKU match, so we paginate the whole catalog once and
// cache the index briefly. Concurrent callers share the same in-flight build.
let indexPromise: Promise<ShopifyIndex> | null = null
let indexBuiltAt = 0
const INDEX_TTL_MS = 60_000

type VariantNode = {
  id: string
  sku: string | null
  availableForSale: boolean
  quantityAvailable?: number | null
  price: { amount: string }
  compareAtPrice: { amount: string } | null
  selectedOptions: { name: string; value: string }[]
}

type CatalogPage = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    edges: { node: { variants: { edges: { node: VariantNode }[] } } }[]
  }
}

const catalogQuery = (withQty: boolean) => `query Catalog($cursor: String) {
  products(first: 100, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    edges { node { variants(first: 50) { edges { node {
      id sku availableForSale ${withQty ? 'quantityAvailable' : ''}
      price { amount } compareAtPrice { amount }
      selectedOptions { name value }
    } } } } }
  }
}`

async function fetchAllVariants(withQty: boolean): Promise<VariantNode[][]> {
  const products: VariantNode[][] = []
  let cursor: string | null = null
  for (let page = 0; page < 60; page++) {
    const data: CatalogPage = await storefront<CatalogPage>(catalogQuery(withQty), { cursor })
    for (const p of data.products.edges) products.push(p.node.variants.edges.map((e) => e.node))
    if (!data.products.pageInfo.hasNextPage) break
    cursor = data.products.pageInfo.endCursor
    await sleep(150)
  }
  return products
}

function sizeOf(v: VariantNode): string {
  const opt =
    v.selectedOptions.find((o) => /size|volume|ml/i.test(o.name)) ?? v.selectedOptions[0]
  return opt?.value ?? ''
}

async function buildIndex(): Promise<ShopifyIndex> {
  let inventoryScope = true
  let products: VariantNode[][]
  try {
    products = await fetchAllVariants(true)
  } catch (e) {
    // Tokens without the inventory scope reject the whole query — retry without it.
    if (!/quantityAvailable|access|scope/i.test(e instanceof Error ? e.message : '')) throw e
    inventoryScope = false
    products = await fetchAllVariants(false)
  }

  const index: ShopifyIndex = {
    bySku: new Map(),
    byBase: new Map(),
    byProductSize: new Map(),
    variantCount: 0,
    inventoryScope,
  }

  for (const variants of products) {
    const mainBase = skuBase(variants.find((v) => v.sku)?.sku)
    for (const v of variants) {
      if (!v.sku) continue
      const entry: ShopifyVariant = {
        variantId: v.id,
        sku: v.sku.toUpperCase(),
        size: sizeOf(v),
        price: Number(v.price.amount) || 0,
        compareAt: Number(v.compareAtPrice?.amount) || 0,
        availableForSale: v.availableForSale,
        quantity: typeof v.quantityAvailable === 'number' ? v.quantityAvailable : null,
      }
      index.variantCount++
      index.bySku.set(entry.sku, entry)
      const base = skuBase(entry.sku)
      // Prefer the -W listing when both -B and -W share a base.
      if (!index.byBase.has(base) || /-W$/.test(entry.sku)) index.byBase.set(base, entry)
      if (mainBase) index.byProductSize.set(`${mainBase}|${sizeKey(entry.size)}`, entry)
    }
  }
  return index
}

/** Shopify variant index. `fresh` bypasses the 60s cache (used by the Meta feed). */
export async function getShopifyIndex({ fresh = false } = {}): Promise<ShopifyIndex> {
  const stale = Date.now() - indexBuiltAt > INDEX_TTL_MS
  if (!indexPromise || stale || fresh) {
    indexPromise = buildIndex()
      .then((index) => {
        indexBuiltAt = Date.now()
        return index
      })
      .catch((e) => {
        indexPromise = null
        throw e
      })
  }
  return indexPromise
}

type CartCreate = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null
    userErrors: { field: string[] | null; message: string }[]
  }
}

/** Create a Shopify cart from resolved variant lines and return its checkout URL. */
export async function createShopifyCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<string> {
  const data = await storefront<CartCreate>(
    `mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }`,
    { lines },
  )

  if (data.cartCreate.userErrors.length) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join('; '))
  }
  const url = data.cartCreate.cart?.checkoutUrl
  if (!url) throw new Error('Shopify did not return a checkout URL')
  return url
}
