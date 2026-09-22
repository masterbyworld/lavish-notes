'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/product-card'
import { products, type Product } from '@/lib/products'

const KEY = 'velvaroma:recently-viewed'

export function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const [items, setItems] = useState<Product[]>([])

  useEffect(() => {
    let stored: string[] = []
    try {
      stored = JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
      stored = []
    }

    // Show what the customer viewed BEFORE this page (exclude the current product).
    const previous = stored.filter((s) => s !== currentSlug)
    const bySlug = new Map(products.map((p) => [p.slug, p]))
    setItems(previous.map((s) => bySlug.get(s)).filter(Boolean).slice(0, 4) as Product[])

    // Record this visit at the front of the history for next time.
    const next = [currentSlug, ...previous].slice(0, 12)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [currentSlug])

  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="mb-8 text-3xl font-medium text-foreground md:text-4xl">Recently Viewed Products</h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>
    </section>
  )
}
