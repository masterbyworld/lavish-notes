import 'server-only'
import { products, type Product, type ProductVariant } from './products'
import { getShopifyIndex, type ShopifyIndex, type ShopifyVariant } from './shopify'
import { skuBase, sizeKey } from './sku'

export type MatchType = 'sku' | 'sku-base' | 'product-size' | 'none'

/** A catalog variant merged with live Shopify state (or its CSV fallback). */
export type LiveVariant = {
  sku: string
  slug: string
  size: string
  price: number
  compareAt: number
  inStock: boolean
  quantity: number
  variantId: string | null
  matchType: MatchType
  source: 'shopify' | 'csv'
}

export type MatchReport = {
  totalVariants: number
  matched: number
  unmatched: number
  byMatchType: Record<MatchType, number>
  shopifyVariants: number
  inventoryScope: boolean
  unmatchedSkus: string[]
}

export type LiveCatalog = {
  source: 'shopify' | 'csv-fallback'
  error?: string
  variants: Map<string, LiveVariant>
  report: MatchReport
}

function matchVariant(
  index: ShopifyIndex,
  product: Product,
  variant: ProductVariant,
): { entry: ShopifyVariant; type: MatchType } | null {
  const exact = index.bySku.get(variant.sku) ?? index.bySku.get(variant.whiteSku)
  if (exact) return { entry: exact, type: 'sku' }
  const base = index.byBase.get(skuBase(variant.sku))
  if (base) return { entry: base, type: 'sku-base' }
  // Size variant listed under the product's main SKU on Shopify.
  const bySize = index.byProductSize.get(`${skuBase(product.blackSku)}|${sizeKey(variant.size)}`)
  if (bySize) return { entry: bySize, type: 'product-size' }
  return null
}

function csvVariant(product: Product, v: ProductVariant): LiveVariant {
  return {
    sku: v.sku,
    slug: product.slug,
    size: v.sizeLabel,
    price: v.price,
    compareAt: v.compareAt,
    inStock: v.inStock,
    quantity: v.quantity,
    variantId: null,
    matchType: 'none',
    source: 'csv',
  }
}

/**
 * Resolve every catalog variant against Shopify by SKU base. Matched variants
 * take Shopify's live price, compare-at price, and inventory; unmatched ones
 * (or all of them, if Shopify is unreachable) fall back to the CSV values.
 */
export async function getLiveCatalog({ fresh = false } = {}): Promise<LiveCatalog> {
  const variants = new Map<string, LiveVariant>()
  const byMatchType: Record<MatchType, number> = { sku: 0, 'sku-base': 0, 'product-size': 0, none: 0 }
  const unmatchedSkus: string[] = []
  let total = 0

  let index: ShopifyIndex | null = null
  let error: string | undefined
  try {
    index = await getShopifyIndex({ fresh })
  } catch (e) {
    error = e instanceof Error ? e.message : 'Shopify unavailable'
    console.error('[live-catalog] Shopify unavailable, using CSV fallback:', error)
  }

  for (const product of products) {
    for (const v of product.variants) {
      total++
      const match = index ? matchVariant(index, product, v) : null
      if (!match) {
        byMatchType.none++
        unmatchedSkus.push(v.sku)
        variants.set(v.sku, csvVariant(product, v))
        continue
      }
      byMatchType[match.type]++
      const { entry } = match
      const price = entry.price || v.price
      variants.set(v.sku, {
        sku: v.sku,
        slug: product.slug,
        size: v.sizeLabel,
        price,
        compareAt: entry.compareAt > price ? entry.compareAt : 0,
        inStock: entry.availableForSale,
        quantity: entry.quantity ?? (entry.availableForSale ? Math.max(v.quantity, 1) : 0),
        variantId: entry.variantId,
        matchType: match.type,
        source: 'shopify',
      })
    }
  }

  return {
    source: index ? 'shopify' : 'csv-fallback',
    error,
    variants,
    report: {
      totalVariants: total,
      matched: total - byMatchType.none,
      unmatched: byMatchType.none,
      byMatchType,
      shopifyVariants: index?.variantCount ?? 0,
      inventoryScope: index?.inventoryScope ?? false,
      unmatchedSkus,
    },
  }
}
