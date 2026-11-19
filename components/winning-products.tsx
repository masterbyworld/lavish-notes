'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Plus, ShoppingBag, Star } from 'lucide-react'
import { winningProducts, DEFAULT_SIZE, discountPercent, formatPrice } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { useLiveStock } from '@/lib/use-live-stock'
import { trackAddToCart } from '@/lib/tracking'

const hardShadow =
  'transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--foreground)]'

export function WinningProducts() {
  const { addItem } = useCart()
  const { resolve } = useLiveStock()
  const withLive = (p: (typeof winningProducts)[number]) => {
    const live = resolve(p.blackSku, { price: p.price, compareAt: p.compareAt, inStock: p.inStock })
    return { ...p, price: live.price, compareAt: live.compareAt, inStock: live.inStock }
  }
  const [hero, ...rest] = winningProducts.map(withLive).filter((p) => p.inStock)
  const runners = rest.slice(0, 4)

  if (!hero) return null

  function add(p: ReturnType<typeof withLive>) {
    const size = p.variants[0]?.sizeLabel ?? DEFAULT_SIZE
    addItem({
      id: `${p.slug}-${p.blackSku}`,
      slug: p.slug,
      name: p.name,
      image: p.image,
      size,
      price: p.price,
      whiteSku: p.whiteSku,
      blackSku: p.blackSku,
    })
    trackAddToCart(p, 1, size)
  }

  const heroOff = discountPercent(hero)

  return (
    <section className="bg-background py-16 text-foreground md:py-24" aria-labelledby="winning-heading">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-6 border-b-2 border-foreground pb-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-background">
              <Star className="h-3.5 w-3.5 fill-background" aria-hidden="true" />
              Best of Lavish Notes
            </span>
            <h2
              id="winning-heading"
              className="text-balance text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl lg:text-7xl"
            >
              Our Winning Products
            </h2>
          </div>
          <div className="flex flex-col gap-4 md:max-w-xs md:items-end md:text-right">
            <p className="text-pretty text-sm font-medium leading-relaxed text-muted-foreground">
              The scents our customers reorder the most. Proven performers with unbeatable value.
            </p>
            <Link
              href="/shop"
              className="inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-wide underline-offset-4 hover:underline"
            >
              Shop all scents <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="group col-span-2 flex flex-col overflow-hidden rounded-2xl bg-foreground text-background lg:row-span-2"
          >
            <Link
              href={`/product/${hero.slug}`}
              className="relative m-3 block aspect-[4/3] overflow-hidden rounded-xl bg-muted lg:aspect-square"
            >
              <span className="absolute left-4 top-4 z-10 rounded-full bg-foreground px-3 py-1 text-xs font-black uppercase tracking-wider text-background">
                #1 Best Seller
              </span>
              {heroOff > 0 && (
                <span className="absolute right-4 top-4 z-10 rounded-full bg-sale px-3 py-1 text-xs font-bold text-white">
                  -{heroOff}%
                </span>
              )}
              <Image
                src={hero.image || '/placeholder.svg'}
                alt={hero.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-10 transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-3 md:px-8 md:pb-8">
              <div className="flex items-center gap-1" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-background text-background" aria-hidden="true" />
                ))}
                <span className="ml-1.5 text-sm font-semibold text-background/70">({hero.reviews} reviews)</span>
              </div>
              <Link href={`/product/${hero.slug}`}>
                <h3 className="text-balance text-2xl font-black uppercase leading-tight tracking-tight md:text-3xl">
                  {hero.name}
                </h3>
              </Link>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black">{formatPrice(hero.price)}</span>
                  {hero.compareAt > hero.price && (
                    <span className="text-base font-semibold text-background/50 line-through">
                      {formatPrice(hero.compareAt)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => add(hero)}
                  className="flex items-center justify-center gap-2 rounded-full bg-background px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-foreground transition-transform hover:scale-[1.03]"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Add to cart
                </button>
              </div>
            </div>
          </motion.article>

          {runners.map((p, i) => {
            const off = discountPercent(p)
            return (
              <motion.article
                key={p.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className={`group flex flex-col overflow-hidden rounded-2xl border-2 border-foreground bg-background ${hardShadow}`}
              >
                <Link href={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
                  <span className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-black text-background">
                    #{i + 2}
                  </span>
                  {off > 0 && (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-sale px-2.5 py-1 text-[11px] font-bold text-white">
                      -{off}%
                    </span>
                  )}
                  <Image
                    src={p.image || '/placeholder.svg'}
                    alt={p.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col gap-2 border-t-2 border-foreground p-3 md:p-4">
                  <Link href={`/product/${p.slug}`}>
                    <h3 className="line-clamp-2 text-[13px] font-bold uppercase leading-snug tracking-tight md:text-sm">
                      {p.name}
                    </h3>
                  </Link>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-sale md:text-lg">{formatPrice(p.price)}</span>
                      {p.compareAt > p.price && (
                        <span className="text-[11px] font-semibold text-muted-foreground line-through md:text-xs">
                          {formatPrice(p.compareAt)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => add(p)}
                      aria-label={`Add ${p.name} to cart`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:rotate-90"
                    >
                      <Plus className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
