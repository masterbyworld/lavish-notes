import { NextResponse } from 'next/server'
import { getVariantBySku } from '@/lib/products'
import { getLiveCatalog } from '@/lib/live-catalog'
import { createShopifyCart } from '@/lib/shopify'

// Builds a real Shopify cart from the shopper's items and returns the Shopify
// checkout URL. Each line is resolved by SKU (exact -> SKU base -> main SKU +
// size) against the live Shopify catalog to get its variant GID.

type IncomingItem = { blackSku?: string; whiteSku?: string; quantity: number }

const MAX_QTY_PER_LINE = 20
const MAX_UNITS_PER_ORDER = 60

export async function POST(req: Request) {
  let body: { items?: IncomingItem[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const items = Array.isArray(body.items) ? body.items : []
  if (items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const live = await getLiveCatalog()
  if (live.source !== 'shopify') {
    return NextResponse.json(
      { error: 'Checkout is temporarily unavailable. Please try again shortly.' },
      { status: 503 },
    )
  }

  const variantQuantities = new Map<string, number>()
  let totalUnits = 0

  for (const raw of items) {
    const found = getVariantBySku(raw.blackSku || '') ?? getVariantBySku(raw.whiteSku || '')
    if (!found) {
      return NextResponse.json(
        { error: `Unknown product SKU: ${raw.blackSku || raw.whiteSku || ''}` },
        { status: 422 },
      )
    }

    const quantity = Math.floor(Number(raw.quantity))
    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 422 })
    }
    const cappedQty = Math.min(quantity, MAX_QTY_PER_LINE)

    const lv = live.variants.get(found.variant.sku)
    if (!lv?.variantId) {
      return NextResponse.json(
        { error: `${found.product.name} (${found.variant.sizeLabel}) is not available for checkout` },
        { status: 409 },
      )
    }
    if (!lv.inStock) {
      return NextResponse.json(
        { error: `${found.product.name} (${found.variant.sizeLabel}) is sold out` },
        { status: 409 },
      )
    }

    totalUnits += cappedQty
    variantQuantities.set(lv.variantId, (variantQuantities.get(lv.variantId) ?? 0) + cappedQty)
  }

  if (totalUnits > MAX_UNITS_PER_ORDER) {
    return NextResponse.json(
      { error: `Order exceeds the ${MAX_UNITS_PER_ORDER}-unit limit` },
      { status: 422 },
    )
  }

  const lines = Array.from(variantQuantities, ([merchandiseId, quantity]) => ({
    merchandiseId,
    quantity: Math.min(quantity, MAX_QTY_PER_LINE),
  }))

  let checkoutUrl: string
  try {
    checkoutUrl = await createShopifyCart(lines)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not create checkout' },
      { status: 502 },
    )
  }

  const url = new URL(checkoutUrl)
  url.searchParams.set('channel', 'online_store')

  return NextResponse.json({ checkoutUrl: url.toString() })
}
