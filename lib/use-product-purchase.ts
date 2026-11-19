'use client'

import { useState } from 'react'
import { discountPercent, type Product, type ProductVariant } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { useLiveStock } from '@/lib/use-live-stock'
import { trackAddToCart } from '@/lib/tracking'

const MAX_QTY = 20

export function useProductPurchase(product: Product) {
  const { addItem } = useCart()
  const { resolve } = useLiveStock()
  const [variantSku, setVariantSku] = useState(product.blackSku)
  const [qty, setQtyState] = useState(1)

  const variant = product.variants.find((v) => v.sku === variantSku) ?? product.variants[0]
  const liveFor = (v: ProductVariant) =>
    resolve(v.sku, { price: v.price, compareAt: v.compareAt, inStock: v.inStock })
  const live = variant
    ? liveFor(variant)
    : { price: product.price, compareAt: product.compareAt, inStock: product.inStock }

  const sizeLabel = variant?.sizeLabel ?? product.sizeLabel
  const priced = {
    ...product,
    price: live.price,
    compareAt: live.compareAt,
    whiteSku: variant?.whiteSku ?? product.whiteSku,
    blackSku: variant?.sku ?? product.blackSku,
  }

  const setQty = (next: number) => setQtyState(Math.min(MAX_QTY, Math.max(1, Math.floor(next) || 1)))

  const add = () => {
    if (!live.inStock) return
    addItem(
      {
        id: `${product.slug}-${priced.blackSku}`,
        slug: product.slug,
        name: product.name,
        image: product.image,
        size: sizeLabel,
        price: live.price,
        whiteSku: priced.whiteSku,
        blackSku: priced.blackSku,
      },
      qty,
    )
    trackAddToCart(priced, qty, sizeLabel)
  }

  return {
    variant,
    setVariantSku,
    liveFor,
    price: live.price,
    compareAt: live.compareAt,
    inStock: live.inStock,
    off: discountPercent(priced),
    sizeLabel,
    qty,
    setQty,
    add,
  }
}
