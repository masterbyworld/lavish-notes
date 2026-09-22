'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

const POPULAR = ['Creed', 'Tom Ford', 'Parfums de Marly', 'LOUIS VUITTON', 'Lattafa Perfumes']

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  // Focus the field when the popup opens and close it on Escape.
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  function go(term: string) {
    const q = term.trim()
    if (!q) return
    onClose()
    setQuery('')
    router.push(`/shop?q=${encodeURIComponent(q)}`)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    go(query)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-x-0 top-[12vh] z-[61] mx-auto w-[92%] max-w-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            <div className="rounded-xl bg-background p-6 shadow-2xl md:p-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-foreground">Search products</h2>
                <button onClick={onClose} aria-label="Close search" className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={onSubmit}>
                <div className="flex items-center gap-3 rounded-lg bg-muted px-4">
                  <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a fragrance or brand..."
                    className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                    aria-label="Search query"
                  />
                </div>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-sm font-medium text-foreground">Popular Searches:</span>
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    onClick={() => go(term)}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
