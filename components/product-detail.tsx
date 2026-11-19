'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpDown,
  ChevronRight,
  Gift,
  Heart,
  HelpCircle,
  Package,
  RotateCcw,
  Share2,
  ShieldCheck,
  SprayCan,
  Star,
  Truck,
} from 'lucide-react'
import { formatMoney, seededNumber, type Product } from '@/lib/products'
import { useProductPurchase } from '@/lib/use-product-purchase'
import { useSaved } from '@/lib/saved-context'
import { trackViewItem } from '@/lib/tracking'
import { ProductGallery } from '@/components/winning-spotlight'
import { QuantityStepper, SizePicker } from '@/components/purchase-controls'
import { cn } from '@/lib/utils'

const AVATARS = ['IC', 'JM', 'NS']

function deliveryWindow() {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  const from = new Date()
  from.setDate(from.getDate() + 3)
  const to = new Date()
  to.setDate(to.getDate() + 7)
  return `${fmt(from)} - ${fmt(to)}`
}

export function TrustStars({ className }: { className?: string }) {
  return (
    <span className={cn('flex gap-0.5', className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="flex h-5 w-5 items-center justify-center bg-trust">
          <Star className="h-3.5 w-3.5 fill-primary-foreground text-primary-foreground" />
        </span>
      ))}
    </span>
  )
}

export function ProductDetail({ product }: { product: Product }) {
  const p = useProductPurchase(product)
  const { isWished, toggleWish, isCompared, toggleCompare } = useSaved()
  const [delivery, setDelivery] = useState('')
  const [shared, setShared] = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const ctaRef = useRef<HTMLDivElement>(null)
  const orders = seededNumber(product.slug, 1800, 3900)
  const wished = isWished(product.slug)

  useEffect(() => {
    setDelivery(deliveryWindow())
    trackViewItem(product)
  }, [product])

  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      /* user dismissed the share sheet */
    }
  }

  const addButton = (
    <button
      type="button"
      onClick={p.add}
      disabled={!p.inStock}
      className="h-12 flex-1 rounded-full border border-foreground text-base font-medium transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
    >
      {p.inStock ? 'Add to cart' : 'Sold out'}
    </button>
  )

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 md:px-8 md:pt-10">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-center gap-3 text-sm md:mb-10 md:text-base">
        <Link href="/" className="hover:text-muted-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-muted-foreground">Catalog</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span aria-current="page" className="line-clamp-1 text-muted-foreground">{product.name}</span>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="lg:sticky lg:top-28">
          <ProductGallery product={product} thumbsSide />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-pretty text-3xl md:text-4xl">{product.name}</h1>
            <button
              type="button"
              onClick={() => toggleWish(product.slug)}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground"
            >
              <Heart className={cn('h-5 w-5', wished && 'fill-sale text-sale')} />
            </button>
          </div>

          <a href="#reviews" className="flex flex-wrap items-center gap-3 text-sm md:text-base">
            <TrustStars />
            <span>
              Trustscore <strong className="font-semibold">4.9</strong> | <strong className="font-semibold">1,500+</strong> reviews
            </span>
          </a>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl text-sale">{formatMoney(p.price)}</span>
            {p.compareAt > p.price && <span className="text-muted-foreground line-through">{formatMoney(p.compareAt)}</span>}
            {p.off > 0 && <span className="rounded-full bg-sale px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">Save {p.off}%</span>}
          </div>

          <p className="self-center bg-sale/10 px-3 py-1 text-xs font-semibold text-sale md:text-sm">
            {'\u2605 \u2605 \u2605'} Last 30 days orders: {orders} {'\u2605 \u2605 \u2605'}
          </p>

          <div className="flex items-center justify-center gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground">
            <span className="flex -space-x-2" aria-hidden>
              {AVATARS.map((a) => (
                <span key={a} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-primary-foreground text-[10px] font-semibold text-primary">
                  {a}
                </span>
              ))}
            </span>
            <span className="font-semibold">10,000+ Happy Customers!</span>
          </div>

          <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-primary-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                <Gift className="h-3.5 w-3.5" /> Limited bundle offer
              </span>
              <span className="text-xs text-primary-foreground/70">Auto-Applied at Cart</span>
            </div>
            <p className="mt-4 text-lg font-semibold">Buy 2 Fragrances, Get 1 FREE!</p>
            <p className="mt-1 text-sm text-primary-foreground/70">Add any 3 scents to your cart and get the 3rd one completely on us.</p>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center rounded-xl border border-primary-foreground/15 px-3 py-4 text-center text-xs font-semibold">
              {['Scent #1', '+', 'Scent #2', '=', '3rd FREE!'].map((label, i) =>
                i % 2 === 1 ? (
                  <span key={i} className="text-primary-foreground/50">{label}</span>
                ) : (
                  <span key={i} className="flex flex-col items-center gap-2">
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-full', i === 4 ? 'bg-primary-foreground text-primary' : 'bg-primary-foreground/15')}>
                      {i === 4 ? <Gift className="h-4 w-4" /> : <SprayCan className="h-4 w-4" />}
                    </span>
                    {label}
                  </span>
                ),
              )}
            </div>
          </div>

          <SizePicker product={product} purchase={p} />

          <div ref={ctaRef}>
            <p className="mb-3 font-medium">Quantity</p>
            <div className="flex gap-3">
              <QuantityStepper value={p.qty} onChange={p.setQty} disabled={!p.inStock} />
              {addButton}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 rounded-full bg-primary px-4 py-3 text-sm text-primary-foreground">
            <Truck className="h-5 w-5" />
            <span><strong className="font-semibold">Free Express Shipping</strong> on Orders Over $80</span>
          </div>

          <ul className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { Icon: ShieldCheck, label: 'Premium Quality Fragrances' },
              { Icon: SprayCan, label: 'Freshly Bottled to Order' },
              { Icon: RotateCcw, label: '30-Day Easy Returns' },
            ].map(({ Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-3 rounded-2xl bg-primary px-2 py-5 text-center text-xs font-semibold text-primary-foreground md:text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 text-sm md:text-base">
            <p className="flex items-center gap-3">
              <Package className="h-5 w-5" />
              <span><strong className="font-medium">Free Shipping & Returns:</strong> On orders over $80</span>
            </p>
            <p className="flex items-center gap-3 text-muted-foreground">
              <Truck className="h-5 w-5" />
              <span><strong className="font-medium text-foreground">Estimated Delivery:</strong> {delivery || '\u2014'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border pb-6">
            <button type="button" onClick={() => toggleCompare(product.slug)} aria-pressed={isCompared(product.slug)} className="flex items-center gap-2 hover:text-muted-foreground">
              <ArrowUpDown className="h-5 w-5" /> {isCompared(product.slug) ? 'Added to compare' : 'Compare'}
            </button>
            <Link href={`/contact?product=${encodeURIComponent(product.name)}`} className="flex items-center gap-2 hover:text-muted-foreground">
              <HelpCircle className="h-5 w-5" /> Ask a question
            </Link>
            <button type="button" onClick={share} className="flex items-center gap-2 hover:text-muted-foreground">
              <Share2 className="h-5 w-5" /> {shared ? 'Link copied' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background shadow-[0_-6px_20px_rgba(0,0,0,0.06)]"
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-8">
              <div className="relative h-12 w-12 shrink-0 md:h-14 md:w-14">
                <Image src={product.image || '/placeholder.svg'} alt="" fill sizes="56px" className="object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm md:text-base">{product.name}</p>
                <p className="flex items-baseline gap-2 text-sm">
                  <span className="text-sale">{formatMoney(p.price)}</span>
                  {p.compareAt > p.price && <span className="text-xs text-muted-foreground line-through">{formatMoney(p.compareAt)}</span>}
                </p>
              </div>
              <div className="hidden sm:block">
                <QuantityStepper value={p.qty} onChange={p.setQty} disabled={!p.inStock} compact />
              </div>
              <button
                type="button"
                onClick={p.add}
                disabled={!p.inStock}
                className="h-11 shrink-0 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-40 md:px-10"
              >
                {p.inStock ? 'Add to cart' : 'Sold out'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
