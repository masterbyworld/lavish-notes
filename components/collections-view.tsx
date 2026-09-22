'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { collectionsCatalog } from '@/lib/products'

export function CollectionsView() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-medium text-foreground md:text-5xl">All Collections</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {collectionsCatalog.length} curated collections — inspired by the world&apos;s most coveted fragrances.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {collectionsCatalog.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.4) }}
          >
            <Link
              href={`/shop?c=${c.key}`}
              className="group flex h-full flex-col items-center justify-between gap-4 border border-border p-6 text-center transition-colors hover:border-foreground/40"
            >
              <div className="flex h-28 w-full items-center justify-center">
                <span className="text-lg font-medium tracking-tight text-foreground transition-transform duration-300 group-hover:scale-105">
                  {c.displayName}
                </span>
              </div>
              <div>
                <p className="text-base font-medium text-foreground">{c.displayName}</p>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                  {c.count} fragrances
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
