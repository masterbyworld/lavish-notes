'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'

const FREE_SHIPPING_THRESHOLD = 80

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, subtotal, rawSubtotal, discount, count, freeCount } =
    useCart()

  // Buy 2 Get 1: the 3rd unit in every group of 3 is free.
  const toNextFree = (3 - (count % 3)) % 3
  const bundleStep = count === 0 ? 0 : count % 3 === 0 ? 3 : count % 3
  const dealMessage =
    freeCount > 0
      ? toNextFree === 0
        ? `Unlocked: ${freeCount} item${freeCount === 1 ? '' : 's'} free in your cart`
        : `${freeCount} free unlocked. Add ${toNextFree} more for another`
      : count === 2
        ? 'Add 1 more and your cheapest item is free'
        : 'Add 2 more to unlock Buy 2 Get 1 Free'

  const shippingLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/40"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <h2 className="flex items-baseline gap-2 text-xl font-medium text-foreground">
                Your Cart
                {count > 0 && <span className="text-sm text-muted-foreground">({count})</span>}
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {items.length > 0 && (
              <div className="mx-5 mt-4 rounded-2xl border border-border bg-muted p-4 sm:mx-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-background">
                    <Gift className="h-3 w-3" aria-hidden /> Buy 2 Get 1
                  </span>
                  <p className="text-sm font-medium text-foreground">{dealMessage}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1.5" aria-hidden>
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={`h-1.5 rounded-full ${
                        step <= bundleStep ? (step === 3 ? 'bg-sale' : 'bg-foreground') : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 sm:px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <ShoppingBag className="h-6 w-6 text-foreground" aria-hidden />
                  </span>
                  <p className="mt-2 text-xl text-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground">Discover your next signature scent.</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-3 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Shop Fragrances
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-4 py-4"
                      >
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                          <Image
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 text-sm uppercase leading-snug tracking-wide text-foreground">
                              {item.name}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="shrink-0 text-muted-foreground transition-colors hover:text-sale"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.size}</p>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center rounded-full border border-border">
                              <button
                                onClick={() => setQuantity(item.id, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center text-foreground/70 hover:text-foreground"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                              <button
                                onClick={() => setQuantity(item.id, item.quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center text-foreground/70 hover:text-foreground"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-[15px] text-sale">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-5 py-5 sm:px-6">
                <p className="mb-4 flex items-center justify-center gap-2 rounded-full bg-muted px-4 py-2.5 text-xs text-foreground">
                  <Truck className="h-4 w-4 shrink-0" aria-hidden />
                  {shippingLeft > 0 ? (
                    <span>
                      Add <strong className="font-semibold">{formatPrice(shippingLeft)}</strong> for free express shipping
                    </span>
                  ) : (
                    <span>
                      <strong className="font-semibold">Free express shipping</strong> unlocked
                    </span>
                  )}
                </p>

                {discount > 0 && (
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-sale">Buy 2 Get 1 Free</span>
                    <span className="text-sale">−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-lg text-foreground">Subtotal</span>
                  <span className="flex items-baseline gap-2 text-lg font-medium text-foreground">
                    {discount > 0 && (
                      <span className="text-sm font-normal text-muted-foreground line-through">
                        {formatPrice(rawSubtotal)}
                      </span>
                    )}
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Taxes and shipping calculated at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Check out
                </Link>
                <button
                  onClick={closeCart}
                  className="mt-3 w-full text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
