import { NextResponse } from 'next/server'
import { getProductByWhiteSku } from '@/lib/products'
import { blackToWhiteSku, getVariantIdByWhiteSku, createShopifyCart } from '@/lib/shopify'

// Builds a real Shopify cart from the shopper's replica (Black SKU) items and
// returns the secure Shopify checkout URL.
//
// Flow per line:
//   Black SKU (…-B)  ->  White SKU (…-W)  ->  live Shopify variant GID  ->  cart line
// The shopper then checks out on Shopify against the clean White-SKU catalog.

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

  // Merge quantities per resolved variant so duplicate lines collapse cleanly.
  const variantQuantities = new Map<string, number>()
  let totalUnits = 0

  for (const raw of items) {
    // Determine the clean White SKU. Prefer the White SKU the client sent, but
    // always fall back to deriving it from the Black SKU (…-B -> …-W).
    const whiteSku =
      (raw.whiteSku && raw.whiteSku.trim()) ||
      (raw.blackSku ? blackToWhiteSku(raw.blackSku.trim()) : '')

    if (!whiteSku) {
      return NextResponse.json({ error: 'Missing product SKU' }, { status: 422 })
    }

    // Confirm the SKU is a product we actually sell before hitting Shopify.
    if (!getProductByWhiteSku(whiteSku)) {
      return NextResponse.json({ error: `Unknown product SKU: ${whiteSku}` }, { status: 422 })
    }

    const quantity = Math.floor(Number(raw.quantity))
    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 422 })
    }
    const cappedQty = Math.min(quantity, MAX_QTY_PER_LINE)

    let variantId: string | null
    try {
      variantId = await getVariantIdByWhiteSku(whiteSku)
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Shopify lookup failed' },
        { status: 502 },
      )
    }
    if (!variantId) {
      return NextResponse.json(
        { error: `Product is not available for checkout: ${whiteSku}` },
        { status: 409 },
      )
    }

    totalUnits += cappedQty
    variantQuantities.set(variantId, (variantQuantities.get(variantId) ?? 0) + cappedQty)
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

  // Bypass the store password screen for the Vercel storefront sales channel.
  const url = new URL(checkoutUrl)
  url.searchParams.set('channel', 'online_store')

  return NextResponse.json({ checkoutUrl: url.toString() })
}
