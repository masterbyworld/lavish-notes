import { NextResponse } from 'next/server'
import { getLiveCatalog } from '@/lib/live-catalog'

// Live price + stock per variant SKU, resolved against Shopify by SKU base with
// CSV fallback. Consumed by the storefront (cards, PDP, cart subtotals).
export const dynamic = 'force-dynamic'

export type LiveVariantState = { price: number; compareAt: number; inStock: boolean; matched: boolean }

export async function GET() {
  const live = await getLiveCatalog()
  const variants: Record<string, LiveVariantState> = {}
  for (const [sku, v] of live.variants) {
    variants[sku] = {
      price: v.price,
      compareAt: v.compareAt,
      inStock: v.inStock,
      matched: v.source === 'shopify',
    }
  }
  return NextResponse.json(
    { source: live.source, variants },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  )
}
