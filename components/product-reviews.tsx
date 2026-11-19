'use client'

import { useState } from 'react'
import { BadgeCheck, Star } from 'lucide-react'
import { reviews, seededNumber, type Product } from '@/lib/products'
import { TrustStars } from '@/components/product-detail'

const DISTRIBUTION = [
  { stars: 5, pct: 92 },
  { stars: 4, pct: 6 },
  { stars: 3, pct: 1 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
]
const INITIAL = 4

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
}

export function ProductReviews({ product }: { product: Product }) {
  const [showAll, setShowAll] = useState(false)
  const offset = seededNumber(product.slug, 0, reviews.length - 1)
  const ordered = [...reviews.slice(offset), ...reviews.slice(0, offset)]
  const visible = showAll ? ordered : ordered.slice(0, INITIAL)
  const count = seededNumber(product.slug, 120, 480)

  return (
    <section id="reviews" className="border-t border-border bg-background py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center text-3xl md:text-4xl">Customer Reviews</h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
          <aside className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <p className="text-6xl">4.9</p>
            <TrustStars />
            <p className="text-sm text-muted-foreground">Based on {count} verified reviews</p>
            <ul className="mt-2 flex w-full flex-col gap-2">
              {DISTRIBUTION.map((d) => (
                <li key={d.stars} className="flex items-center gap-3 text-sm">
                  <span className="flex w-8 items-center gap-1">
                    {d.stars}
                    <Star className="h-3.5 w-3.5 fill-foreground" aria-hidden />
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <span className="block h-full rounded-full bg-trust" style={{ width: `${d.pct}%` }} />
                  </span>
                  <span className="w-10 text-right text-muted-foreground">{d.pct}%</span>
                </li>
              ))}
            </ul>
            <a
              href={`mailto:Support@lavishnotes.com?subject=${encodeURIComponent(`Review: ${product.name}`)}`}
              className="mt-4 w-full rounded-full border border-foreground py-3 text-center text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
            >
              Write a review
            </a>
          </aside>

          <div>
            <ul className="divide-y divide-border border-y border-border">
              {visible.map((r, i) => (
                <li key={r.name} className="flex gap-4 py-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold" aria-hidden>
                    {initials(r.name)}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-2 font-medium">
                        {r.name}
                        <span className="flex items-center gap-1 text-xs text-trust">
                          <BadgeCheck className="h-4 w-4" /> Verified Buyer
                        </span>
                      </p>
                      <span className="text-xs text-muted-foreground">{seededNumber(product.slug + i, 2, 28)} days ago</span>
                    </div>
                    <span className="mt-2 flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={s < r.rating ? 'h-4 w-4 fill-foreground' : 'h-4 w-4 text-muted-foreground'} aria-hidden />
                      ))}
                    </span>
                    <p className="mt-3 font-medium">{r.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            {ordered.length > INITIAL && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="rounded-full border border-border px-8 py-3 text-sm transition-colors hover:border-foreground"
                >
                  {showAll ? 'Show fewer reviews' : 'Load more reviews'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
