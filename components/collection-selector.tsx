'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, Search, Tag } from 'lucide-react'
import { collections, productsByRouteKey } from '@/lib/products'
import { ProductCard } from '@/components/product-card'

// Order the brand collections so Creed is always the first / default option,
// then by catalog depth so the biggest houses surface first.
const ordered = [...collections].sort((a, b) => {
  if (a.brand === 'Creed') return -1
  if (b.brand === 'Creed') return 1
  return b.count - a.count
})

export function CollectionSelector() {
  const [activeKey, setActiveKey] = useState(ordered[0]?.key ?? '')
  const [open, setOpen] = useState(false)
  const [houseQuery, setHouseQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const active = ordered.find((c) => c.key === activeKey) ?? ordered[0]

  // Home page NEVER shows sold-out scents — only in-stock products appear.
  const inStockItems = useMemo(
    () => (active ? productsByRouteKey(active.key).filter((p) => p.inStock) : []),
    [active],
  )
  const items = useMemo(() => inStockItems.slice(0, 10), [inStockItems])

  const houses = useMemo(() => {
    const q = houseQuery.trim().toLowerCase()
    if (!q) return ordered
    return ordered.filter((c) => c.displayName.toLowerCase().includes(q))
  }, [houseQuery])

  // Close the dropdown when clicking outside or pressing Escape.
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
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-amber-400">Select Your Brand Fragrance</p>
        <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-tight text-foreground md:text-6xl">
          Shop by Collection
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Explore authentic-inspired fragrances crafted after the world&apos;s most renowned perfume houses. Switch
          between houses below to discover their signature scents.
        </p>
        <div className="mt-5 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-sale px-4 py-1.5 text-xs font-semibold text-white">
            <Tag className="h-3.5 w-3.5" />
            <span>
              <span className="font-bold uppercase tracking-wide">Special Offer</span> — Buy 2, Get 1 Free applied at
              checkout
            </span>
          </span>
        </div>
      </div>

      {/* Selected brand dropdown */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div ref={menuRef} className="relative w-full max-w-sm">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex w-full items-center justify-between gap-3 border border-border bg-card px-5 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:border-foreground"
          >
            <span className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Selected brand</span>
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
                className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-auto border border-border bg-popover py-1 shadow-lg"
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
          </span>{' '}
          <span className="text-xs">({inStockItems.length} scents available)</span>
        </p>
      </div>

      {/* Brand house pills + search */}
      <div className="mt-10 border-t border-border pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Switch Brand House <span className="text-foreground/60">[{ordered.length} Houses]</span>
          </p>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={houseQuery}
              onChange={(e) => setHouseQuery(e.target.value)}
              placeholder="Find house..."
              aria-label="Search brand houses"
              className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>
        </div>

        <div className="no-scrollbar mt-4 flex gap-2.5 overflow-x-auto pb-1">
          {houses.map((c) => {
            const selected = c.key === active.key
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveKey(c.key)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground/85 hover:border-foreground/50'
                }`}
              >
                {c.displayName}
                <span
                  className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                    selected ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {c.count}
                </span>
              </button>
            )
          })}
          {houses.length === 0 && (
            <p className="py-2 text-sm text-muted-foreground">No houses match “{houseQuery}”.</p>
          )}
        </div>
      </div>

      {/* Products for the selected collection */}
      <div className="mt-8 flex items-baseline gap-3 border-b border-border pb-3">
        <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-foreground">
          {active.displayName} Fragrance Line
        </h3>
        <span className="text-xs text-muted-foreground">Showing {items.length} products</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {items.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {items.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          No in-stock scents in this house right now — check back soon.
        </p>
      )}

      <div className="mt-12 flex justify-center">
        <Link
          href={`/shop?c=${active.key}`}
          className="flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          View all {active.displayName} products ({active.count}) <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
