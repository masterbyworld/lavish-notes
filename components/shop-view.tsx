'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, Check } from 'lucide-react'
import { products, collections, getCollectionByKey, type Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'
import { OfferShowcase } from '@/components/offer-showcase'

const sorts = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
] as const

function haystack(p: Product) {
  return `${p.name} ${p.brand} ${p.inspiredBy} ${p.collection} ${p.family}`.toLowerCase()
}

// Rank a product against the query. Higher = a more complete match, so the
// scents that fully satisfy the shopper's demand surface first.
function scoreProduct(p: Product, phrase: string, tokens: string[]) {
  if (!tokens.length) return 0
  const h = haystack(p)
  const name = p.name.toLowerCase()
  const brand = p.brand.toLowerCase()
  let s = 0
  if (phrase && h.includes(phrase)) s += 200
  for (const t of tokens) {
    if (name.includes(t)) s += 40
    else if (brand.includes(t)) s += 30
    else if (h.includes(t)) s += 12
  }
  if (tokens.every((t) => h.includes(t))) s += 60
  return s
}

export function ShopView({
  initialCollection,
  initialQuery = '',
}: {
  initialCollection?: string
  initialQuery?: string
}) {
  const router = useRouter()
  const collection = initialCollection ? getCollectionByKey(initialCollection) : undefined
  const query = initialQuery.trim()
  const searchMode = query.length > 0

  const [sort, setSort] = useState<string>('featured')
  const [showSoldOut, setShowSoldOut] = useState(false)
  const [term, setTerm] = useState<string>(query)
  const [switchOpen, setSwitchOpen] = useState(false)
  const switchRef = useRef<HTMLDivElement>(null)

  // Ranked search matches — the fragrances that match the shopper's demand.
  const matches = useMemo(() => {
    if (!searchMode) return []
    const phrase = query.toLowerCase()
    const tokens = phrase.split(/\s+/).filter(Boolean)
    return products
      .map((p) => ({ p, score: scoreProduct(p, phrase, tokens) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.p.reviews - a.p.reviews)
      .map((x) => x.p)
  }, [searchMode, query])

  // Second section: similar products by demand — drawn from the same brands and
  // scent families as the matches, ranked by how many shoppers love them.
  const related = useMemo(() => {
    if (!searchMode) return []
    const matchSlugs = new Set(matches.map((p) => p.slug))
    const brands = new Set(matches.map((p) => p.brand))
    const families = new Set(matches.map((p) => p.family))
    const pool = products.filter(
      (p) => !matchSlugs.has(p.slug) && (brands.has(p.brand) || families.has(p.family)),
    )
    const ranked = (pool.length ? pool : products.filter((p) => !matchSlugs.has(p.slug)))
      .filter((p) => p.inStock)
      .sort((a, b) => b.reviews - a.reviews)
    return ranked.slice(0, 8)
  }, [searchMode, matches])

  const filtered = useMemo(() => {
    const base = searchMode ? matches : products
    let list = base.filter((p) => !collection || p.routeKey === collection.key)
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
        break
    }
    return list
  }, [sort, collection, searchMode, matches])

  // Sold-out scents are hidden by default; the shopper opts in via the toggle.
  const soldOutCount = useMemo(() => filtered.filter((p) => !p.inStock).length, [filtered])
  const inStockCount = filtered.length - soldOutCount
  const visible = useMemo(
    () => (showSoldOut ? filtered : filtered.filter((p) => p.inStock)),
    [filtered, showSoldOut],
  )

  // Close the collection switcher when clicking outside or pressing Escape.
  useEffect(() => {
    if (!switchOpen) return
    function onClick(e: MouseEvent) {
      if (switchRef.current && !switchRef.current.contains(e.target as Node)) setSwitchOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSwitchOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [switchOpen])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = term.trim()
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      {!searchMode && (
        <div className="mb-8">
          <OfferShowcase />
        </div>
      )}

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-medium text-foreground md:text-5xl">
          {searchMode
            ? `Found ${visible.length} result${visible.length === 1 ? '' : 's'} for "${query}"`
            : collection
              ? collection.displayName
              : 'Shop All Fragrances'}
        </h1>

        {searchMode ? (
          <form onSubmit={submitSearch} className="mx-auto mt-6 max-w-xl">
            <div className="flex items-center gap-3 rounded-lg bg-muted px-4">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search"
                aria-label="Search products"
                className="h-13 w-full bg-transparent py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button type="submit" aria-label="Search" className="text-foreground hover:text-muted-foreground">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {inStockCount} designer-inspired scent{inStockCount === 1 ? '' : 's'} available · Buy 2 Get 1 Free
          </p>
        )}
      </div>

      {/* Collection switcher — always available so shoppers can jump between
          houses easily, and the current collection is clearly badged. */}
      {!searchMode && (
        <div className="mb-8 flex flex-col items-center gap-3">
          <div ref={switchRef} className="relative w-full max-w-xs">
            <button
              type="button"
              onClick={() => setSwitchOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={switchOpen}
              className="flex w-full items-center justify-between gap-3 border border-border bg-background px-5 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              <span className="flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Collection</span>
                <span className="text-base">{collection ? collection.displayName : 'All Fragrances'}</span>
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${switchOpen ? 'rotate-180' : ''}`} />
            </button>

            {switchOpen && (
              <ul
                role="listbox"
                className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-auto border border-border bg-background py-1 shadow-lg"
              >
                <li role="option" aria-selected={!collection}>
                  <button
                    type="button"
                    onClick={() => {
                      setSwitchOpen(false)
                      router.push('/shop')
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-5 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                      !collection ? 'font-semibold text-foreground' : 'text-foreground/80'
                    }`}
                  >
                    <span>All Fragrances</span>
                    {!collection && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
                {collections.map((c) => {
                  const selected = collection?.key === c.key
                  return (
                    <li key={c.key} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        onClick={() => {
                          setSwitchOpen(false)
                          router.push(`/shop?c=${c.key}`)
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
              </ul>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Now viewing{' '}
            <span className="inline-flex items-center gap-1.5 bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
              {collection ? collection.displayName : 'All Fragrances'}
            </span>
          </p>
        </div>
      )}

      <div className="mb-10 flex flex-col gap-4 border-y border-border py-4 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          role="switch"
          aria-checked={showSoldOut}
          onClick={() => setShowSoldOut((v) => !v)}
          disabled={soldOutCount === 0}
          className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-foreground disabled:opacity-40"
        >
          <span
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              showSoldOut ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform ${
                showSoldOut ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </span>
          Show Sold Out ({soldOutCount})
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-foreground"
            aria-label="Sort products"
          >
            {sorts.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          {searchMode
            ? `No exact matches for "${query}". Explore the picks below that shoppers love.`
            : 'No fragrances match your filters. Try adjusting your selection.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      )}

      {searchMode && related.length > 0 && (
        <section className="mt-20 border-t border-border pt-14">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-medium text-foreground md:text-4xl">You Might Also Like</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Similar fragrances shoppers love, based on your search
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
