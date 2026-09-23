'use client'

// GA4 enhanced-ecommerce + Meta (Facebook) mirroring on top of the GTM
// dataLayer. Every ecommerce action pushes a single object carrying BOTH a GA4
// `ecommerce` block (clean item array) and a `meta` mirror so a Meta pixel tag
// in GTM can fire off the same event. Nothing here talks to GTM directly — it
// only populates `window.dataLayer`; the GTM container (once its ID is set)
// picks the events up.

import type { CartItem } from '@/lib/cart-context'
import type { Product } from '@/lib/products'

type DataLayerObject = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: DataLayerObject[]
  }
}

const CURRENCY = 'USD'

// Actions handled as first-class GA4 ecommerce events. The generic click
// tracker refuses to re-emit any of these so one interaction can't be counted
// twice (once as ecommerce, once as a raw click).
const MANAGED_ECOMMERCE_EVENTS = new Set(['view_item', 'add_to_cart', 'begin_checkout'])

function push(obj: DataLayerObject): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(obj)
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function itemFromProduct(product: Product, quantity: number): DataLayerObject {
  return {
    item_id: product.whiteSku,
    item_name: product.name,
    item_brand: product.brand,
    item_category: product.family,
    item_variant: product.sizeLabel,
    price: round(product.price),
    quantity,
  }
}

function itemFromCart(item: CartItem): DataLayerObject {
  return {
    item_id: item.whiteSku,
    item_name: item.name,
    item_variant: item.size,
    price: round(item.price),
    quantity: item.quantity,
  }
}

/** GA4 `view_item` + Meta `ViewContent`. */
export function trackViewItem(product: Product): void {
  const value = round(product.price)
  // GA4 requires clearing the previous ecommerce object before a new push.
  push({ ecommerce: null })
  push({
    event: 'view_item',
    ecommerce: { currency: CURRENCY, value, items: [itemFromProduct(product, 1)] },
    meta: {
      event: 'ViewContent',
      content_type: 'product',
      content_ids: [product.whiteSku],
      content_name: product.name,
      value,
      currency: CURRENCY,
    },
  })
}

/** GA4 `add_to_cart` + Meta `AddToCart`. */
export function trackAddToCart(product: Product, quantity = 1): void {
  const value = round(product.price * quantity)
  push({ ecommerce: null })
  push({
    event: 'add_to_cart',
    ecommerce: { currency: CURRENCY, value, items: [itemFromProduct(product, quantity)] },
    meta: {
      event: 'AddToCart',
      content_type: 'product',
      content_ids: [product.whiteSku],
      content_name: product.name,
      value,
      currency: CURRENCY,
    },
  })
}

/** GA4 `begin_checkout` + Meta `InitiateCheckout`. */
export function trackInitiateCheckout(items: CartItem[], value: number): void {
  const ecommerceItems = items.map(itemFromCart)
  const total = round(value)
  push({ ecommerce: null })
  push({
    event: 'begin_checkout',
    ecommerce: { currency: CURRENCY, value: total, items: ecommerceItems },
    meta: {
      event: 'InitiateCheckout',
      content_type: 'product',
      content_ids: items.map((i) => i.whiteSku),
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      value: total,
      currency: CURRENCY,
    },
  })
}

/**
 * Generic click tracker for non-ecommerce interactions (nav, banners, CTAs).
 * It deliberately suppresses the managed GA4 ecommerce events so callers can't
 * accidentally double-count an add-to-cart or checkout as a raw click.
 */
export function trackClick(name: string, detail: DataLayerObject = {}): void {
  const event = typeof detail.event === 'string' ? detail.event : ''
  if (MANAGED_ECOMMERCE_EVENTS.has(event)) return
  push({ event: 'click', click_name: name, ...detail })
}
