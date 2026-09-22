import { NextResponse } from 'next/server'
import { products } from '@/lib/products'
import { getLiveStockByWhiteSkus } from '@/lib/shopify'

// Live inventory sync endpoint. Resolves every storefront product's White SKU
// against Shopify and returns its purchasable status, so the client can flip
// products to "out of stock" the moment Shopify unlists or zeroes them out.
export const dynamic = 'force-dynamic'

export async function GET() {
  const whiteSkus = products.map((p) => p.whiteSku).filter(Boolean)

  try {
    const stock = await getLiveStockByWhiteSkus(whiteSkus)
    return NextResponse.json(
      { stock },
      // Cache at the edge for a minute; serve stale while revalidating so a
      // burst of shoppers never all trigger a fresh catalog scan at once.
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    )
  } catch (err) {
    // Fail open: if Shopify is unreachable, return an empty map so the client
    // falls back to the catalog's baseline inStock rather than hiding the store.
    console.error('[v0] inventory sync failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ stock: {}, error: 'inventory_unavailable' }, { status: 200 })
  }
}
