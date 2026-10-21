import { NextResponse } from 'next/server'
import { getVariantBySku } from '@/lib/products'
import { getLiveCatalog } from '@/lib/live-catalog'

// Server-authoritative order pricing. Each line is resolved by SKU, priced
// from live Shopify (falling back to the CSV backup price), and the
// Buy-2-Get-1 discount is recomputed here — never trusted from the client.

type IncomingItem = { whiteSku?: string; blackSku?: string; size?: string; quantity: number }

const MAX_QTY_PER_LINE = 20
const MAX_UNITS_PER_ORDER = 60

const round = (n: number) => Math.round(n * 100) / 100

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

  const lineItems: {
    whiteSku: string
    blackSku: string
    variantId: string | null
    title: string
    brand: string
    size: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }[] = []

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
    totalUnits += cappedQty

    const { product, variant } = found
    const lv = live.variants.get(variant.sku)
    const unitPrice = round(lv?.price ?? variant.price)

    lineItems.push({
      whiteSku: variant.whiteSku,
      blackSku: variant.sku,
      variantId: lv?.variantId ?? null,
      title: product.name,
      brand: product.brand,
      size: variant.sizeLabel,
      unitPrice,
      quantity: cappedQty,
      lineTotal: round(unitPrice * cappedQty),
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
  discount = round(discount)

  const rawSubtotal = round(lineItems.reduce((n, li) => n + li.lineTotal, 0))
  const total = round(rawSubtotal - discount)

  return NextResponse.json({
    lineItems,
    rawSubtotal,
    freeCount,
    discount,
    total,
    currency: 'USD',
    priceSource: live.source,
  })
}
