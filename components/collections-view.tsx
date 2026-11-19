'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { collectionsCatalog, productsByRouteKey } from '@/lib/products'

const tiles = collectionsCatalog.map((c) => {
  const items = productsByRouteKey(c.key)
  const cover = items.find((p) => p.inStock && p.image) ?? items.find((p) => p.image)
  return { ...c, image: cover?.image }
})

export function CollectionsView() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-center gap-3 text-sm md:text-base">
        <Link href="/" className="hover:text-muted-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span aria-current="page" className="text-muted-foreground">Collections</span>
      </nav>

      <header className="mb-10 text-center md:mb-14">
        <h1 className="text-balance text-4xl md:text-5xl">Shop by Iconic Houses</h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          {collectionsCatalog.length} curated houses, every scent inspired by the world&apos;s most coveted fragrances.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
        {tiles.map((c, i) => (
          <motion.li
            key={c.key}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
          >
            <Link
              href={`/shop?c=${c.key}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl bg-muted transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground"
            >
              <div className="relative aspect-square w-full">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-105 md:p-10"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-2xl">{c.displayName}</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 bg-background px-4 py-4 md:px-5">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-medium uppercase tracking-wide md:text-base">{c.displayName}</p>
                  <p className="text-xs tabular-nums text-muted-foreground">{c.count} fragrances</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
