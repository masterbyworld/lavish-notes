'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMoney, winningProducts, type Product } from '@/lib/products'
import { useProductPurchase } from '@/lib/use-product-purchase'
import { QuantityStepper, SizePicker } from '@/components/purchase-controls'
import { cn } from '@/lib/utils'

export function ProductGallery({ product, thumbsSide }: { product: Product; thumbsSide?: boolean }) {
  const images = product.images.length > 0 ? product.images : [product.image]
  const [index, setIndex] = useState(0)
  const step = (dir: 1 | -1) => setIndex((i) => (i + dir + images.length) % images.length)

  return (
    <div className={cn('flex w-full min-w-0 flex-col gap-4', thumbsSide && 'md:flex-row-reverse')}>
      <div className="relative aspect-square w-full min-w-0 overflow-hidden bg-card md:flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={images[index] || '/placeholder.svg'}
              alt={`${product.name} image ${index + 1} of ${images.length}`}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6"
            />
          </motion.div>
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 md:left-6 md:h-14 md:w-14"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 md:right-6 md:h-14 md:w-14"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className={cn('no-scrollbar flex gap-3 overflow-x-auto', thumbsSide && 'md:w-20 md:flex-col md:overflow-visible')}>
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                'relative h-20 w-20 shrink-0 border bg-card transition-colors md:h-24 md:w-24',
                thumbsSide && 'md:h-20 md:w-20',
                i === index ? 'border-foreground' : 'border-transparent hover:border-border',
              )}
            >
              <Image src={src || '/placeholder.svg'} alt="" fill sizes="96px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SpotlightBody({ product }: { product: Product }) {
  const p = useProductPurchase(product)
  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-14">
      <ProductGallery product={product} />
      <div className="flex min-w-0 flex-col gap-6">
        <div>
          <Link href={`/product/${product.slug}`} className="hover:text-muted-foreground">
            <h3 className="text-3xl font-normal md:text-5xl">{product.name}</h3>
          </Link>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl text-sale md:text-3xl">{formatMoney(p.price)}</span>
            {p.compareAt > p.price && <span className="text-muted-foreground line-through">{formatMoney(p.compareAt)}</span>}
          </div>
        </div>
        <SizePicker product={product} purchase={p} />
        <div>
          <p className="mb-3 font-medium">Quantity</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <QuantityStepper value={p.qty} onChange={p.setQty} disabled={!p.inStock} />
            <button
              type="button"
              onClick={p.add}
              disabled={!p.inStock}
              className="h-12 flex-1 rounded-full border border-foreground text-base font-medium transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              {p.inStock ? 'Add to cart' : 'Sold out'}
            </button>
          </div>
        </div>
        <Link href={`/product/${product.slug}`} className="self-start text-sm underline underline-offset-4 hover:text-muted-foreground">
          View full details
        </Link>
      </div>
    </div>
  )
}

export function WinningSpotlight() {
  const [active, setActive] = useState(0)
  const product = winningProducts[active]
  if (!product) return null

  return (
    <section className="border-t border-border bg-background py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="text-center">
          <p className="mb-3 text-sm md:text-lg">Best Sellers This Week</p>
          <h2 className="text-3xl md:text-5xl">Our Winning Products</h2>
        </header>
        <div className="no-scrollbar -mx-4 mt-8 flex gap-3 overflow-x-auto px-4 md:mx-0 md:justify-center md:px-0">
          {winningProducts.slice(0, 6).map((w, i) => (
            <button
              key={w.slug}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={cn(
                'shrink-0 rounded-full border px-5 py-2 text-sm transition-colors',
                i === active ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground',
              )}
            >
              {w.name}
            </button>
          ))}
        </div>
        <div className="mt-10 md:mt-14">
          <SpotlightBody key={product.slug} product={product} />
        </div>
      </div>
    </section>
  )
}
