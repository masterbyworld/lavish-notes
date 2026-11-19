'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Gift, Loader2, Lock, RotateCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'
import { trackInitiateCheckout } from '@/lib/tracking'

const FREE_SHIPPING_THRESHOLD = 80

const ASSURANCES = [
  { icon: ShieldCheck, label: 'Secure payment' },
  { icon: Truck, label: 'Express shipping' },
  { icon: RotateCcw, label: 'Easy returns' },
]

export default function CheckoutPage() {
  const { items, rawSubtotal, discount, subtotal, freeCount, count } = useCart()
  const [redirecting, setRedirecting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  async function proceedToShopify() {
    if (items.length === 0 || redirecting) return
    setRedirecting(true)
    setCheckoutError(null)
    // GA4 begin_checkout (+ Meta InitiateCheckout) on the discounted total.
    trackInitiateCheckout(items, subtotal)
    try {
      const res = await fetch('/api/shopify-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            blackSku: i.blackSku,
            whiteSku: i.whiteSku,
            quantity: i.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Could not reach the secure Shopify checkout. Please try again.')
      }
      // The order is NEVER finalized on our frontend. The only success path is
      // landing on the live Shopify checkout. Shopify checkout cannot render
      // inside the v0 preview iframe, so open a new tab when embedded.
      if (window.self !== window.top) {
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer')
        setRedirecting(false)
      } else {
        window.location.href = data.checkoutUrl
      }
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'Checkout failed')
      setRedirecting(false)
    }
  }

  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD

  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>

        <div className="mt-6 text-center">
          <h1 className="text-balance text-3xl font-normal text-foreground md:text-5xl">Secure Checkout</h1>
          <p className="mt-3 text-pretty text-sm text-muted-foreground md:text-base">
            Review your order. Payment is completed on Shopify&apos;s secure checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto mt-12 flex max-w-md flex-col items-center rounded-2xl bg-muted px-6 py-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background">
              <ShoppingBag className="h-6 w-6 text-foreground" aria-hidden />
            </span>
            <p className="mt-5 text-xl text-foreground">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Discover your next signature scent.</p>
            <Link
              href="/shop"
              className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Shop Fragrances
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-5 lg:gap-10">
            <section aria-labelledby="order-items" className="lg:col-span-3">
              <div className="flex items-baseline justify-between border-b border-border pb-4">
                <h2 id="order-items" className="text-lg font-medium text-foreground">
                  Your Order
                </h2>
                <span className="text-sm text-muted-foreground">
                  {count} item{count === 1 ? '' : 's'}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {items.map((item, idx) => (
                  <li key={`${item.blackSku}-${item.size}-${idx}`} className="flex items-center gap-4 py-5">
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
                      <p className="line-clamp-2 text-sm uppercase leading-snug tracking-wide text-foreground">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.size} · Qty {item.quantity}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                    </div>
                    <span className="text-[15px] text-sale">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <aside aria-labelledby="order-summary" className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-muted p-5 md:p-6 lg:sticky lg:top-28">
                <h2 id="order-summary" className="text-lg font-medium text-foreground">
                  Order Summary
                </h2>

                <div className="mt-4 flex items-center gap-3 rounded-xl bg-background p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sale text-primary-foreground">
                    <Gift className="h-4 w-4" aria-hidden />
                  </span>
                  <p className="text-sm text-foreground">
                    {freeCount > 0 ? (
                      <>
                        <strong className="font-semibold">Buy 2 Get 1 Free</strong> applied: {freeCount} item
                        {freeCount === 1 ? '' : 's'} on us
                      </>
                    ) : (
                      <>
                        Add {3 - (count % 3)} more to unlock <strong className="font-semibold">Buy 2 Get 1 Free</strong>
                      </>
                    )}
                  </p>
                </div>

                <dl className="mt-5 flex flex-col gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Items</dt>
                    <dd className="text-foreground">{formatPrice(rawSubtotal)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <dt className="text-sale">Bundle discount</dt>
                      <dd className="text-sale">−{formatPrice(discount)}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="text-foreground">{shippingFree ? 'Free' : 'Calculated at payment'}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-lg">
                    <dt className="text-foreground">Subtotal</dt>
                    <dd className="font-medium text-foreground">{formatPrice(subtotal)}</dd>
                  </div>
                </dl>

                {checkoutError && (
                  <div role="alert" className="mt-5 rounded-xl border border-sale/40 bg-sale/5 p-4 text-sm text-sale">
                    {checkoutError}
                  </div>
                )}

                <button
                  onClick={proceedToShopify}
                  disabled={redirecting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {redirecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Redirecting to secure checkout…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" aria-hidden /> Proceed to Checkout · {formatPrice(subtotal)}
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                  Final price, shipping and taxes are confirmed on Shopify.
                </p>

                <ul className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-5">
                  {ASSURANCES.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex flex-col items-center gap-2 text-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background">
                        <Icon className="h-4 w-4 text-foreground" aria-hidden />
                      </span>
                      <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}
