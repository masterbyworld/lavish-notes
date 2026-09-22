'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { brands, products } from '@/lib/products'
import { ProductCard } from '@/components/product-card'

export function BrandsView({ initialBrand }: { initialBrand?: string }) {
  const valid = brands.find((b) => b.name === initialBrand)?.name
  const [active, setActive] = useState<string>(valid ?? brands[0].name)

  // Filter strictly by the active brand's SKU route key — never fall back to
  // showing all products, which would mislabel unrelated scents as this brand.
  const activeKey = brands.find((b) => b.name === active)?.key
  const shown = products.filter((p) => p.routeKey === activeKey)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-medium text-foreground md:text-5xl">Shop With Brand</h1>
        <p className="mt-3 text-sm text-muted-foreground">Explore our curated houses — inspired by the world&apos;s most coveted fragrances.</p>
      </div>

      <div className="mb-12 grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-6">
        {brands.map((b) => (
          <button
            key={b.name}
            onClick={() => setActive(b.name)}
            className={`flex h-24 flex-col items-center justify-center gap-1 border p-4 text-center transition-all ${
              active === b.name ? 'border-foreground' : 'border-border hover:border-foreground/50'
            }`}
            aria-pressed={active === b.name}
          >
            <span className={`text-sm font-medium leading-tight transition-opacity ${active === b.name ? 'text-foreground opacity-100' : 'text-foreground/80 opacity-70'}`}>
              {b.name}
            </span>
            <span className="text-[11px] tabular-nums text-muted-foreground">{b.count}</span>
          </button>
        ))}
      </div>

      <h2 className="mb-8 text-center text-2xl font-medium text-foreground">{active}</h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
        >
          {shown.map((p, i) => (
            <ProductCard key={`${active}-${p.slug}`} product={p} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
