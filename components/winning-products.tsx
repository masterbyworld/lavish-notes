'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ShoppingBag, Star } from 'lucide-react'
import { winningProducts, DEFAULT_SIZE, discountPercent, formatPrice } from '@/lib/products'
import { useCart } from '@/lib/cart-context'

export function WinningProducts() {
  const { addItem } = useCart()
  const [hero, ...rest] = winningProducts
  const runners = rest.slice(0, 4)

  if (!hero) return null

  function add(p: (typeof winningProducts)[number]) {
    addItem({
      id: `${p.slug}-${DEFAULT_SIZE}`,
      slug: p.slug,
      name: p.name,
      image: p.image,
      size: DEFAULT_SIZE,
      price: p.price,
      whiteSku: p.whiteSku,
      blackSku: p.blackSku,
    })
  }

  const heroOff = discountPercent(hero)

  return (
    <section className="bg-foreground py-20 text-background">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-background/60">Best of Velvaroma</p>
          <h2 className="mt-3 text-4xl font-medium md:text-5xl">Our Winning Products</h2>
          <p className="mt-4 max-w-xl text-pretty text-background/70">
            The scents our customers reorder the most — proven performers with unbeatable value.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Featured hero product */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="group relative flex flex-col overflow-hidden bg-background text-foreground sm:flex-row"
          >
            <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted sm:w-1/2">
              {heroOff > 0 && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-sale px-3 py-1 text-xs font-semibold text-white">
                  -{heroOff}%
                </span>
              )}
              <Image
                src={hero.image || '/placeholder.svg'}
                alt={hero.name}
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-4 p-8">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">#1 Best Seller</span>
              <h3 className="text-2xl font-medium leading-tight">{hero.name}</h3>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />
                ))}
                <span className="ml-1 text-sm text-muted-foreground">({hero.reviews})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold text-sale">{formatPrice(hero.price)}</span>
                <span className="text-base text-muted-foreground line-through">{formatPrice(hero.compareAt)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => add(hero)}
                  className="flex items-center justify-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </button>
                <Link
                  href={`/product/${hero.slug}`}
                  className="flex items-center gap-1 border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  View details <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Runner-up grid */}
          <div className="grid grid-cols-2 gap-6">
            {runners.map((p, i) => {
              const off = discountPercent(p)
              return (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group flex flex-col bg-background text-foreground"
                >
                  <Link href={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
                    {off > 0 && (
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white">
                        -{off}%
                      </span>
                    )}
                    <Image
                      src={p.image || '/placeholder.svg'}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <Link href={`/product/${p.slug}`}>
                      <h3 className="line-clamp-1 text-sm font-medium uppercase tracking-wide">{p.name}</h3>
                    </Link>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-sale">{formatPrice(p.price)}</span>
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(p.compareAt)}</span>
                    </div>
                    <button
                      onClick={() => add(p)}
                      className="mt-3 flex items-center justify-center gap-2 bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
                    >
                      <ShoppingBag className="h-4 w-4" /> Add
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
