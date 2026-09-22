'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { logoCategories } from '@/lib/products'

// Duplicate the list so the marquee can loop seamlessly.
const LOOP = [...logoCategories, ...logoCategories]

export function ExploreCategories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-3xl font-medium text-foreground md:text-4xl">Explore Categories</h2>
      </div>

      <div className="group relative overflow-hidden">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

        <motion.div
          className="flex gap-6"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
        >
          {LOOP.map((c, i) => (
            <Link
              key={`${c.brand}-${i}`}
              href={`/brands?b=${encodeURIComponent(c.brand)}`}
              className="group/tile flex w-48 shrink-0 flex-col items-center gap-5 text-center md:w-56"
            >
              <div className="relative flex h-32 w-full items-center justify-center">
                <Image
                  src={c.logo || '/placeholder.svg'}
                  alt={c.brand}
                  width={220}
                  height={130}
                  className="max-h-28 w-auto object-contain transition-transform duration-300 group-hover/tile:scale-110"
                />
              </div>
              <span className="text-lg font-medium text-foreground">{c.title}</span>
            </Link>
          ))}
        </motion.div>
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/collections"
          className="flex items-center gap-2 bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          View all Categories <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
