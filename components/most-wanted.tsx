'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { discountPercent, formatMoney, products, type Product } from '@/lib/products'
import { useLiveStock } from '@/lib/use-live-stock'
import { cn } from '@/lib/utils'

const SLIDE_MS = 6000

const MOST_WANTED_SLUGS = [
  'louis-vuitton-ombre-nomade',
  'gucci-by-gucci-pour-homme-edt',
  'creed-orignal-santal',
  'le-labo-santal-33-edp',
]

const slides: Product[] = MOST_WANTED_SLUGS.map((slug) => products.find((p) => p.slug === slug)).filter(
  (p): p is Product => Boolean(p),
)

export function MostWanted() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const { resolve } = useLiveStock()

  useEffect(() => {
    if (paused || slides.length < 2) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS)
    return () => clearTimeout(id)
  }, [index, paused, slides.length])

  const product = slides[index]
  if (!product) return null
  const live = resolve(product.blackSku, { price: product.price, compareAt: product.compareAt, inStock: product.inStock })
  const off = discountPercent({ ...product, price: live.price, compareAt: live.compareAt })
  const href = `/product/${product.slug}`

  return (
    <section
      className="border-t border-border bg-background py-14 md:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl md:text-5xl">Most-Wanted Luxury Scents</h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground md:text-lg">
            Handpicked luxury masterpieces from the world&apos;s finest perfumery houses, offered at exceptional prices while stocks last.
          </p>
        </header>

        <div className="mt-10 flex flex-col-reverse items-center gap-8 md:mt-14 md:flex-row md:gap-6">
          <div role="tablist" aria-label="Featured scents" className="flex gap-3 md:flex-col">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${s.name}`}
                onClick={() => setIndex(i)}
                className="flex h-7 w-7 items-center justify-center"
              >
                <span className={cn('block rounded-full', i === index ? 'h-4 w-4 border border-foreground' : 'h-2 w-2 bg-foreground')} />
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.45 }}
              className="grid w-full flex-1 items-center gap-8 md:grid-cols-[1fr_1.3fr]"
            >
              <Link href={href} className="group order-2 flex flex-col items-center md:order-1 md:items-start md:pl-16">
                <div className="relative h-52 w-52">
                  {off > 0 && (
                    <span className="absolute left-0 top-0 z-10 rounded-full bg-sale px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                      -{off}%
                    </span>
                  )}
                  <Image src={product.image || '/placeholder.svg'} alt="" fill sizes="208px" className="object-contain" />
                </div>
                <h3 className="mt-6 text-base font-normal uppercase tracking-wide group-hover:text-muted-foreground md:text-lg">{product.name}</h3>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="text-sale">{formatMoney(live.price)}</span>
                  {live.compareAt > live.price && <span className="text-sm text-muted-foreground line-through">{formatMoney(live.compareAt)}</span>}
                </p>
                <span className="mt-5 rounded-full border border-foreground px-6 py-2.5 text-sm transition-colors group-hover:bg-foreground group-hover:text-background">
                  Shop now
                </span>
              </Link>
              <Link href={href} className="relative order-1 aspect-square w-full md:order-2" aria-label={product.name}>
                <Image
                  src={product.images[1] || product.image || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 50vw"
                  className="object-contain"
                />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
