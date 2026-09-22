'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/products'

export function RelatedByBrand({ products, brand }: { products: Product[]; brand: string }) {
  const trackRef = useRef<HTMLDivElement>(null)

  if (products.length === 0) return null

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-medium text-foreground md:text-4xl">You Might Also Like</h2>
          <p className="mt-2 text-sm text-muted-foreground">More from the {brand} collection</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous products"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next products"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="no-scrollbar flex snap-x gap-5 overflow-x-auto pb-2">
        {products.map((p, i) => (
          <div key={p.slug} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}
