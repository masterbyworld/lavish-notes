'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'
import { trackInitiateCheckout } from '@/lib/tracking'

export default function CheckoutPage() {
  const { items, rawSubtotal, discount, subtotal, freeCount } = useCart()
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

  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <h1 className="text-3xl font-medium text-foreground md:text-4xl">Secure Checkout</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" /> Payment is completed securely on Shopify. No order is ever confirmed on this site.
        </p>

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-lg text-foreground">Your cart is empty.</p>
            <Link href="/shop" className="mt-6 inline-block bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground">
              Shop Fragrances
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <ul className="divide-y divide-border border-y border-border">
              {items.map((item, idx) => (
                <li key={`${item.blackSku}-${item.size}-${idx}`} className="flex gap-4 py-5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-muted">
                    <Image src={item.image || '/placeholder.svg'} alt={item.name} fill className="object-contain p-2" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-[15px] font-medium leading-snug text-foreground">{item.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.size}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Qty {item.quantity} · {formatPrice(item.price)} each</p>
                  </div>
                  <span className="text-[15px] font-medium text-foreground">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 border-t border-border pt-3">
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-sale">
                    Buy 2 Get 1 Free{freeCount > 0 ? ` · ${freeCount} free` : ''}
                  </span>
                  <span className="font-medium text-sale">−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg font-medium text-foreground">
                <span>Subtotal</span>
                <span className="flex items-baseline gap-2">
                  {discount > 0 && (
                    <span className="text-sm text-muted-foreground line-through">{formatPrice(rawSubtotal)}</span>
                  )}
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            {checkoutError && (
              <div className="mt-6 border border-sale/40 bg-sale/5 p-4 text-sm text-sale">
                {checkoutError}
              </div>
            )}

            <button
              onClick={proceedToShopify}
              disabled={redirecting}
              className="mt-8 flex w-full items-center justify-center gap-2 bg-primary py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {redirecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Redirecting to secure checkout…
                </>
              ) : (
                <>Proceed to Secure Checkout · {formatPrice(subtotal)}</>
              )}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Final price, shipping &amp; taxes are calculated on Shopify. You&apos;ll complete payment on Shopify&apos;s secure checkout.
            </p>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}
