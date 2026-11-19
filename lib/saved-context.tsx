'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const WISH_KEY = 'lavishnotes_wishlist'
const COMPARE_KEY = 'lavishnotes_compare'
const MAX_COMPARE = 4

type SavedContextValue = {
  wishlist: string[]
  compare: string[]
  isWished: (slug: string) => boolean
  isCompared: (slug: string) => boolean
  toggleWish: (slug: string) => void
  toggleCompare: (slug: string) => void
  clearCompare: () => void
  quickView: string | null
  openQuickView: (slug: string) => void
  closeQuickView: () => void
}

const SavedContext = createContext<SavedContextValue | null>(null)

function readList(key: string): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
  } catch {
    return []
  }
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [compare, setCompare] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const [quickView, setQuickView] = useState<string | null>(null)

  useEffect(() => {
    setWishlist(readList(WISH_KEY))
    setCompare(readList(COMPARE_KEY))
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist))
  }, [wishlist, loaded])

  useEffect(() => {
    if (loaded) window.localStorage.setItem(COMPARE_KEY, JSON.stringify(compare))
  }, [compare, loaded])

  const toggleWish = useCallback((slug: string) => {
    setWishlist((list) => (list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list]))
  }, [])

  const toggleCompare = useCallback((slug: string) => {
    setCompare((list) =>
      list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug].slice(-MAX_COMPARE),
    )
  }, [])

  const value = useMemo<SavedContextValue>(
    () => ({
      wishlist,
      compare,
      isWished: (slug) => wishlist.includes(slug),
      isCompared: (slug) => compare.includes(slug),
      toggleWish,
      toggleCompare,
      clearCompare: () => setCompare([]),
      quickView,
      openQuickView: setQuickView,
      closeQuickView: () => setQuickView(null),
    }),
    [wishlist, compare, toggleWish, toggleCompare, quickView],
  )

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved() {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved must be used within SavedProvider')
  return ctx
}
