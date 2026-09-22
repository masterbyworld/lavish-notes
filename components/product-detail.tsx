'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Star, Truck, Clock, PackageCheck } from 'lucide-react'
import { SIZES, formatPrice, discountPercent, type Product } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { useLiveStock } from '@/lib/use-live-stock'

const GALLERY_ROTATE_MS = 3000

function deliveryWindow() {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  const from = new Date()
  from.setDate(from.getDate() + 3)
  const to = new Date()
  to.setDate(to.getDate() + 7)
  return `${fmt(from)} - ${fmt(to)}`
}

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { isInStock } = useLiveStock()
  const inStock = isInStock(product.whiteSku, product.inStock)
  const [sizeIdx, setSizeIdx] = useState(1)
  const [qty, setQty] = useState(1)
  const [active, setActive] = useState(0)
  const [delivery, setDelivery] = useState('')

  // Two-face gallery: auto-rotate through the product images.
  const gallery = product.images.length > 0 ? product.images : [product.image]
  useEffect(() => {
    setDelivery(deliveryWindow())
    if (gallery.length < 2) return
    const id = setInterval(() => setActive((a) => (a + 1) % gallery.length), GALLERY_ROTATE_MS)
    return () => clearInterval(id)
  }, [gallery.length])

  const size = SIZES[sizeIdx]
  const unitPrice = Math.round(product.price * size.multiplier * 100) / 100
  const compareAt = Math.round(product.compareAt * size.multiplier * 100) / 100
  const off = discountPercent(product)

  const add = () => {
    if (!inStock) return
    addItem(
      {
        id: `${product.slug}-${size.ml}`,
        slug: product.slug,
        name: product.name,
        image: product.image,
        size: size.label,
        price: unitPrice,
        whiteSku: product.whiteSku,
        blackSku: product.blackSku,
      },
      qty,
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href={`/brands?b=${encodeURIComponent(product.brand)}`} className="hover:text-foreground">{product.brand}</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square overflow-hidden bg-muted">
            {off > 0 && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-sale px-3 py-1 text-xs font-semibold text-white">
                -{off}%
              </span>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <Image
                  src={gallery[active] || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-10"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3">
              {gallery.slice(0, 5).map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActive(i)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden border bg-muted transition-colors ${
                    i === active ? 'border-foreground' : 'border-border hover:border-foreground/50'
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image src={img || '/placeholder.svg'} alt="" fill sizes="80px" className="object-contain p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < product.rating ? 'fill-sale text-sale' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">4.9/5</span> rating based on{' '}
              <span className="font-semibold text-foreground">18,000+</span> reviews
            </span>
          </div>

          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.inspiredBy}</p>
          <h1 className="mt-1 text-3xl font-medium text-foreground md:text-4xl">{product.name}</h1>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-semibold text-sale">{formatPrice(unitPrice)}</span>
            <span className="text-lg text-muted-foreground line-through">{formatPrice(compareAt)}</span>
            {off > 0 && (
              <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white">SAVE {off}%</span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Tax included.</p>

          <div className="mt-6 flex items-center gap-3 border border-border p-4">
            <Truck className="h-6 w-6 shrink-0 text-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">FREE SHIPPING IN USA</p>
              <p className="text-xs text-muted-foreground">Standard delivery (3-5 business days)</p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-md">
            <div className="flex items-center gap-2 bg-sale px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
              <Clock className="h-4 w-4" /> Today&apos;s Special
            </div>
            <div className="border border-t-0 border-border px-4 py-3">
              <p className="text-sm text-foreground">
                Limited Offer: <span className="font-semibold">Buy 2</span> &amp; Get{' '}
                <span className="font-bold text-sale">1 FREE ON ALL PRODUCTS</span>
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-sale">
                <Clock className="h-4 w-4" /> Claim this deal before the timer runs out.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-3 text-sm font-medium text-foreground">Size</p>
            <div className="grid grid-cols-3 gap-3">
              {SIZES.map((s, i) => (
                <button
                  key={s.ml}
                  onClick={() => setSizeIdx(i)}
                  className={`border px-3 py-3 text-center transition-all ${
                    i === sizeIdx ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground/60'
                  }`}
                >
                  <span className="block text-sm font-semibold">{s.ml}ML</span>
                  <span className={`block text-xs ${i === sizeIdx ? 'text-background/70' : 'text-muted-foreground'}`}>
                    {formatPrice(Math.round(product.price * s.multiplier * 100) / 100)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center justify-between bg-muted px-2 sm:w-36">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={!inStock} className="flex h-12 w-11 items-center justify-center text-foreground/70 hover:text-foreground disabled:opacity-40" aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} disabled={!inStock} className="flex h-12 w-11 items-center justify-center text-foreground/70 hover:text-foreground disabled:opacity-40" aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {inStock ? (
              <button
                onClick={add}
                className="flex-1 bg-primary py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
              >
                Add to cart · {formatPrice(unitPrice * qty)}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 cursor-not-allowed bg-muted py-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Out of stock
              </button>
            )}
          </div>

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-foreground" />
              <span><span className="font-semibold text-foreground">Estimated Delivery:</span> {delivery || '—'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-foreground" />
              Enjoy free shipping on all orders over $80.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
