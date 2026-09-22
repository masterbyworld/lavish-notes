'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { featuredBrands, products, productsByBrand, type Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'

function tabProducts(brand: string): Product[] {
  const own = productsByBrand(brand)
  if (own.length >= 4) return own.slice(0, 4)
  const fillers = products.filter((p) => !own.includes(p)).slice(0, 4 - own.length)
  return [...own, ...fillers]
}

export function PremiumCollections() {
  const [tab, setTab] = useState(featuredBrands[0])
  const list = tabProducts(tab)

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 text-center md:px-8">
      <h2 className="mx-auto max-w-3xl text-balance text-3xl font-medium text-foreground md:text-4xl">
        Define Your Signature With Our Premium Collections
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
        &quot;Discover the scents that everyone is talking about. Handpicked, timeless luxury crafted to make your presence unforgettable.&quot;
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {featuredBrands.map((b) => (
          <button
            key={b}
            onClick={() => setTab(b)}
            className={`relative pb-1 text-base transition-colors ${
              tab === b ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {b}
            {tab === b && <motion.span layoutId="premium-underline" className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-foreground" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="mt-12 grid grid-cols-2 gap-x-5 gap-y-8 text-left md:grid-cols-4"
        >
          {list.map((p, i) => (
            <ProductCard key={`${tab}-${p.slug}`} product={p} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
