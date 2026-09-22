import { NextResponse } from 'next/server'
import { getProductByWhiteSku, SIZES } from '@/lib/products'

// Checkout substitution: the storefront sends the WHITE SKUs the shopper
// browsed. The server is authoritative — it looks each White SKU up, swaps it
// for the real backend BLACK SKU + product data, and recomputes every price
// and the Buy-2-Get-1 discount so the order processes correctly on the backend.

type IncomingItem = { whiteSku: string; size: string; quantity: number }

const MAX_QTY_PER_LINE = 20
const MAX_UNITS_PER_ORDER = 60

function sizeMultiplier(label: string): number {
  return SIZES.find((s) => s.label === label)?.multiplier ?? 1
}

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

  const lineItems: {
    whiteSku: string
    blackSku: string
    title: string
    brand: string
    size: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }[] = []

  let totalUnits = 0

  for (const raw of items) {
    const product = getProductByWhiteSku(raw.whiteSku)
    if (!product) {
      return NextResponse.json(
        { error: `Unknown product SKU: ${raw.whiteSku}` },
        { status: 422 },
      )
    }

    // Validate quantity server-side — positive integer, capped.
    const quantity = Math.floor(Number(raw.quantity))
    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 422 })
    }
    const cappedQty = Math.min(quantity, MAX_QTY_PER_LINE)
    totalUnits += cappedQty

    // Recompute price from the authoritative catalog value, never the client's.
    const unitPrice = Math.round(product.price * sizeMultiplier(raw.size) * 100) / 100

    lineItems.push({
      whiteSku: product.whiteSku,
      blackSku: product.blackSku, // <-- the real backend product
      title: product.name,
      brand: product.brand,
      size: raw.size,
      unitPrice,
      quantity: cappedQty,
      lineTotal: Math.round(unitPrice * cappedQty * 100) / 100,
    })
  }

  if (totalUnits > MAX_UNITS_PER_ORDER) {
    return NextResponse.json(
      { error: `Order exceeds the ${MAX_UNITS_PER_ORDER}-unit limit` },
      { status: 422 },
    )
  }

  // Buy 2 Get 1 Free — the cheapest unit in every group of 3 is free.
  const units: number[] = []
  for (const li of lineItems) for (let n = 0; n < li.quantity; n++) units.push(li.unitPrice)
  units.sort((a, b) => a - b)
  const freeCount = Math.floor(units.length / 3)
  let discount = 0
  for (let n = 0; n < freeCount; n++) discount += units[n]
  discount = Math.round(discount * 100) / 100

  const rawSubtotal = Math.round(lineItems.reduce((n, li) => n + li.lineTotal, 0) * 100) / 100
  const total = Math.round((rawSubtotal - discount) * 100) / 100

  return NextResponse.json({
    // The backend order references BLACK SKUs only.
    lineItems,
    rawSubtotal,
    freeCount,
    discount,
    total,
    currency: 'USD',
  })
}
