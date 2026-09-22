'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { reviews } from '@/lib/products'

const PER_PAGE = 3
const AUTOPLAY_MS = 5000
// Show a total of 6 customer reviews, auto-rotating through the pages.
const featured = reviews.slice(0, 6)

export function HappyCustomers() {
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)
  const totalPages = Math.ceil(featured.length / PER_PAGE)
  const slice = featured.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  useEffect(() => {
    if (paused || totalPages <= 1) return
    const id = setInterval(() => setPage((p) => (p + 1) % totalPages), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, totalPages])

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-16 md:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-10 flex flex-col items-center gap-4">
        <h2 className="text-3xl font-medium text-foreground md:text-4xl">Happy Customers</h2>
        <div className="flex items-center gap-3 rounded-full border border-border px-3 py-1.5">
          <button onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)} aria-label="Previous reviews">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {page + 1}/{totalPages}
          </span>
          <button onClick={() => setPage((p) => (p + 1) % totalPages)} aria-label="Next reviews">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="grid gap-8 md:grid-cols-3"
        >
          {slice.map((r) => (
            <div key={r.name} className="flex flex-col">
              <p className="font-medium text-foreground">{r.name}</p>
              <div className="mt-2 flex">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />
                ))}
              </div>
              <p className="mt-3 font-semibold text-foreground">{r.title}</p>
              <p className="mt-2 leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
