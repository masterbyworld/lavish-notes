import 'server-only'

// Shopify Storefront API client.
//
// SKU routing: the storefront shows REPLICA products identified by a BLACK SKU
// (…-B). Every Black SKU has a matching clean WHITE SKU (…-W) that is the real,
// listed product in Shopify. At checkout we translate Black -> White, look up
// the White SKU's live variant ID on Shopify, and add THAT to a Shopify cart so
// the shopper checks out against the clean catalog.

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

/** Translate a Black (replica) SKU to its clean White SKU: …-B -> …-W. */
export function blackToWhiteSku(sku: string): string {
  return sku.replace(/-B$/i, '-W')
}

// One catalog entry per SKU: the variant GID (for checkout) plus its live
// availability (for inventory sync). We rely solely on `availableForSale`,
// which Shopify sets false when a variant is unlisted, drafted, or out of
// stock. We intentionally do NOT request `quantityAvailable`: that field
// requires the `unauthenticated_read_product_inventory` scope, and including
// it rejects the entire query for tokens without that scope.
type SkuEntry = {
  variantId: string
  availableForSale: boolean
}

// Shopify's `products(query:"sku:…")` search is relevance-based and does NOT
// reliably return an exact SKU match, so we instead build one complete
// SKU -> entry map by paginating the whole catalog, then cache it briefly.
// Concurrent callers share the same in-flight build via the promise.
let skuMapPromise: Promise<Map<string, SkuEntry>> | null = null
let skuMapBuiltAt = 0
// Refresh live inventory at most this often so out-of-stock changes on Shopify
// propagate to the storefront without re-scanning the catalog on every request.
const SKU_MAP_TTL_MS = 60_000

type CatalogPage = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    edges: {
      node: {
        variants: {
          edges: {
            node: {
              id: string
              sku: string | null
              availableForSale: boolean
            }
          }[]
        }
      }
    }[]
  }
}

async function buildSkuMap(): Promise<Map<string, SkuEntry>> {
  const map = new Map<string, SkuEntry>()
  let cursor: string | null = null
  // Guard against runaway pagination; 250/page covers thousands of products.
  for (let page = 0; page < 40; page++) {
    const data: CatalogPage = await storefront<CatalogPage>(
      `query Catalog($cursor: String) {
        products(first: 250, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges { node { variants(first: 25) { edges { node { id sku availableForSale } } } } }
        }
      }`,
      { cursor },
    )
    for (const p of data.products.edges) {
      for (const v of p.node.variants.edges) {
        if (v.node.sku) {
          map.set(v.node.sku.toUpperCase(), {
            variantId: v.node.id,
            availableForSale: v.node.availableForSale,
          })
        }
      }
    }
    if (!data.products.pageInfo.hasNextPage) break
    cursor = data.products.pageInfo.endCursor
    // Small gap between pages so the cold-start catalog scan doesn't trip
    // Shopify's Storefront rate limiter (a throttled page fails the map build).
    await sleep(150)
  }
  return map
}

async function getSkuMap(): Promise<Map<string, SkuEntry>> {
  const stale = Date.now() - skuMapBuiltAt > SKU_MAP_TTL_MS
  if (!skuMapPromise || stale) {
    skuMapPromise = buildSkuMap()
      .then((map) => {
        skuMapBuiltAt = Date.now()
        return map
      })
      .catch((e) => {
        // Don't cache a failed build — allow the next call to retry.
        skuMapPromise = null
        throw e
      })
  }
  return skuMapPromise
}

/**
 * Resolve a White SKU to its live Shopify variant GID.
 * Returns null when no matching variant exists in the store.
 */
export async function getVariantIdByWhiteSku(whiteSku: string): Promise<string | null> {
  const map = await getSkuMap()
  return map.get(whiteSku.toUpperCase())?.variantId ?? null
}

/** True when Shopify reports the variant as purchasable (active, listed, in stock). */
function entryInStock(entry: SkuEntry | undefined): boolean {
  return entry?.availableForSale ?? false
}

/**
 * Live in-stock status for a set of White SKUs, resolved against Shopify.
 * A replica (Black) SKU should be translated with `blackToWhiteSku` first.
 * SKUs with no matching Shopify variant resolve to false (out of stock).
 */
export async function getLiveStockByWhiteSkus(
  whiteSkus: string[],
): Promise<Record<string, boolean>> {
  const map = await getSkuMap()
  const result: Record<string, boolean> = {}
  for (const sku of whiteSkus) {
    result[sku] = entryInStock(map.get(sku.toUpperCase()))
  }
  return result
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
