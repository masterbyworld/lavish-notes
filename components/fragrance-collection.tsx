'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { collections } from '@/lib/products'

export function FragranceCollection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="text-center">
        <h2 className="text-4xl font-medium text-foreground md:text-5xl">The Fragrance Collection</h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
          &quot;Buy 2, Get 1 FREE! Add any 3 fragrances to your cart and pay only for 2. Limited time offer at Velvaroma.&quot;
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {collections.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
          >
            <Link
              href={`/shop?c=${c.key}`}
              className="flex items-center justify-center bg-muted px-4 py-5 text-center text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {c.displayName}
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/shop"
          className="flex items-center gap-2 bg-primary px-10 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Shop All Collections <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
