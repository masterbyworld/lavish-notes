'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Truck, TicketPercent, X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, subtotal, rawSubtotal, discount, count, freeCount } =
    useCart()

  // Buy 2 Get 1: the 3rd unit in every group of 3 is free. Tell the shopper
  // exactly where they stand — unlocked, or how many units away they are.
  const toNextFree = (3 - (count % 3)) % 3
  const dealMessage =
    freeCount > 0
      ? toNextFree === 0
        ? `Buy 2 Get 1 unlocked — ${freeCount} item${freeCount === 1 ? '' : 's'} FREE in your cart!`
        : `${freeCount} FREE unlocked · add ${toNextFree} more to get another free`
      : count === 2
        ? 'Add 1 more and your cheapest item is FREE!'
        : count === 1
          ? 'Add 1 more to unlock Buy 2 Get 1 Free'
          : 'Buy any 2 fragrances, get 1 free'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
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
            <div className="flex items-center justify-between px-6 pb-4 pt-6">
              <h2 className="text-2xl font-medium text-foreground">Shopping Cart</h2>
              <button onClick={closeCart} aria-label="Close cart" className="text-foreground/70 hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>

            {items.length > 0 && (
              <div className="mx-6 mb-3 flex items-center gap-2 bg-sale/10 px-4 py-3 text-sm font-semibold text-sale">
                <TicketPercent className="h-4 w-4 shrink-0" />
                <span>{dealMessage}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="text-xl text-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground">Discover your next signature scent.</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
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
                        className="flex gap-4 py-5"
                      >
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-muted">
                          <Image src={item.image || '/placeholder.svg'} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <p className="text-[15px] font-medium leading-snug text-foreground">{item.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <span className="text-muted-foreground">Size:</span> {item.size}
                          </p>
                          <p className="mt-1 text-[15px] font-medium text-foreground">{formatPrice(item.price)}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-sale">
                            <span aria-hidden>🏷</span> TODAY SPECIAL : BUY 2 GET 1 FREE.
                          </p>
                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center bg-muted">
                              <button
                                onClick={() => setQuantity(item.id, item.quantity - 1)}
                                className="flex h-9 w-9 items-center justify-center text-foreground/70 hover:text-foreground"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-9 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                              <button
                                onClick={() => setQuantity(item.id, item.quantity + 1)}
                                className="flex h-9 w-9 items-center justify-center text-foreground/70 hover:text-foreground"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5">
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 bg-muted py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                    <Truck className="h-4 w-4" /> Delivery
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-muted py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                    <TicketPercent className="h-4 w-4" /> Coupon
                  </button>
                </div>

                {discount > 0 && (
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-sale">Buy 2 Get 1 Free</span>
                    <span className="font-medium text-sale">−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-foreground">Subtotal</span>
                  <span className="flex items-baseline gap-2 text-lg font-medium text-foreground">
                    {discount > 0 && (
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(rawSubtotal)}</span>
                    )}
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {count} item{count === 1 ? '' : 's'} · shipping &amp; taxes calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="mt-4 flex w-full items-center justify-center bg-primary py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
                >
                  Check out
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
