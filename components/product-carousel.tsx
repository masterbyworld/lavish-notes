'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/products'
import { cn } from '@/lib/utils'

export function ProductCarousel({
  products,
  itemClassName = 'w-1/2 sm:w-1/3 lg:w-1/5',
  label = 'Products',
  dots = true,
}: {
  products: Product[]
  itemClassName?: string
  label?: string
  dots?: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(1)

  const measure = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setPages(Math.max(1, Math.ceil((el.scrollWidth - 4) / el.clientWidth)))
    setPage(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 })
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, products])

  const goTo = (i: number) => {
    const el = trackRef.current
    if (!el) return
    const target = (i + pages) % pages
    el.scrollTo({ left: target * el.clientWidth, behavior: 'smooth' })
  }

  if (products.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">No fragrances available in this house yet.</p>
  }

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={trackRef}
        onScroll={measure}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory overflow-x-auto md:-mx-2"
      >
        {products.map((p, i) => (
          <div key={p.slug} className={cn('shrink-0 snap-start px-1 md:px-2', itemClassName)}>
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>

      {pages > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            aria-label="Previous products"
            className="absolute -left-3 top-[38%] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background md:flex lg:-left-6 lg:h-14 lg:w-14"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            aria-label="Next products"
            className="absolute -right-3 top-[38%] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background md:flex lg:-right-6 lg:h-14 lg:w-14"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {dots && pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === page}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span
                className={cn(
                  'block rounded-full transition-all',
                  i === page ? 'h-4 w-4 border border-foreground bg-transparent' : 'h-2 w-2 bg-foreground',
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
