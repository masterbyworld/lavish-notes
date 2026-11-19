'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { brandKey, brandProducts, brands } from '@/lib/products'
import { brandTagline } from '@/lib/brand-copy'
import { cn } from '@/lib/utils'

export function CuratorsChoice({ defaultBrand = 'Creed' }: { defaultBrand?: string }) {
  const [brand, setBrand] = useState(defaultBrand)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const items = useMemo(() => brandProducts(brand).slice(0, 10), [brand])
  const options = useMemo(() => [...brands].filter((b) => b.count >= 5).sort((a, b) => b.count - a.count), [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <section className="border-t border-border bg-background py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="flex flex-col items-center text-center">
          <p className="mb-3 text-sm md:text-lg">{brandTagline(brand)}</p>
          <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-2">
            <h2 className="text-3xl text-muted-foreground md:text-5xl">{'Curator\u2019s Choice'}</h2>
            <div ref={boxRef} className="relative">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Choose house, currently ${brand}`}
                className="flex min-w-48 items-center justify-between gap-6 border-b-2 border-foreground pb-1 text-3xl md:min-w-60 md:text-5xl"
              >
                {brand}
                <ChevronDown className={cn('h-6 w-6 transition-transform', open && 'rotate-180')} />
              </button>
              {open && (
                <ul role="listbox" className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-auto border border-border bg-background py-1 text-left shadow-lg">
                  {options.map((o) => (
                    <li key={o.key} role="option" aria-selected={o.name === brand}>
                      <button
                        type="button"
                        onClick={() => {
                          setBrand(o.name)
                          setOpen(false)
                        }}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-base hover:bg-muted"
                      >
                        {o.name}
                        {o.name === brand && <Check className="h-4 w-4" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 md:mt-14 md:gap-x-4 lg:grid-cols-5">
          {items.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={`/shop?c=${brandKey(brand) ?? ''}`}
            className="rounded-md border border-foreground px-10 py-4 text-base font-medium transition-colors hover:bg-foreground hover:text-background"
          >
            View All {brand}
          </Link>
        </div>
      </div>
    </section>
  )
}
