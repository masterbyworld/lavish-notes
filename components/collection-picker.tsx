'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { collections, productsByRouteKey } from '@/lib/products'
import { ProductCard } from '@/components/product-card'

// A brand/collection browser: shows one house by default and lets the shopper
// switch to any other via a dropdown, always surfacing which one is selected.
export function CollectionPicker({
  defaultBrand,
  eyebrow,
  heading,
  description,
  limit = 8,
}: {
  defaultBrand: string
  eyebrow?: string
  heading: string
  description?: string
  limit?: number
}) {
  // Order the collections so the requested default brand is always first.
  const ordered = useMemo(
    () =>
      [...collections].sort((a, b) => {
        if (a.brand === defaultBrand) return -1
        if (b.brand === defaultBrand) return 1
        return b.count - a.count
      }),
    [defaultBrand],
  )

  const [activeKey, setActiveKey] = useState(ordered[0]?.key ?? '')
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const active = ordered.find((c) => c.key === activeKey) ?? ordered[0]
  const items = useMemo(() => (active ? productsByRouteKey(active.key).slice(0, limit) : []), [active, limit])

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!active) return null

  return (
    <div>
      <div className="text-center">
        {eyebrow && <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>}
        <h2 className="mt-3 text-3xl font-medium text-foreground md:text-4xl">{heading}</h2>
        {description && <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">{description}</p>}
      </div>

      {/* Selected brand + dropdown to pick any other house */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div ref={menuRef} className="relative w-full max-w-xs">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex w-full items-center justify-between gap-3 border border-border bg-background px-5 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-foreground"
          >
            <span className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Selected brand</span>
              <span className="text-base">{active.displayName}</span>
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-auto border border-border bg-background py-1 shadow-lg"
              >
                {ordered.map((c) => {
                  const selected = c.key === active.key
                  return (
                    <li key={c.key} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveKey(c.key)
                          setOpen(false)
                        }}
                        className={`flex w-full items-center justify-between gap-2 px-5 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                          selected ? 'font-semibold text-foreground' : 'text-foreground/80'
                        }`}
                      >
                        <span>
                          {c.displayName}
                          <span className="ml-2 text-xs text-muted-foreground">({c.count})</span>
                        </span>
                        {selected && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    </li>
                  )
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <p className="text-sm text-muted-foreground">
          Now viewing{' '}
          <span className="inline-flex items-center gap-1.5 bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            {active.displayName}
          </span>
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
        >
          {items.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex justify-center">
        <Link
          href={`/shop?c=${active.key}`}
          className="flex items-center gap-2 bg-primary px-10 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          View all {active.displayName} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
