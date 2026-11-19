'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useSaved } from '@/lib/saved-context'
import { useAnnouncement } from '@/lib/announcement-context'
import { SearchOverlay } from '@/components/search-overlay'
import { FACEBOOK_URL, INSTAGRAM_URL, FacebookIcon, InstagramIcon } from '@/components/social-icons'

const nav = [
  { label: 'Home', href: '/' },
  { label: 'Catalog', href: '/shop' },
  { label: 'Brands', href: '/brands' },
  { label: 'Contact', href: '/contact' },
]

const announcements = [
  'Premium Designer-Inspired Scents — Trusted by Fragrance Lovers',
  'Buy 2 Fragrances, Get the 3rd One Free — Auto-Applied at Cart',
  'Long-Lasting Formulas, Freshly Bottled for Every Order',
]

const ROTATE_MS = 5000

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export function SiteHeader() {
  const { count, openCart } = useCart()
  const { wishlist } = useSaved()
  const { barVisible, hideBar } = useAnnouncement()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % announcements.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [slide])

  const step = (dir: 1 | -1) => setSlide((s) => (s + dir + announcements.length) % announcements.length)

  return (
    <>
      {barVisible && (
        <div className="relative bg-muted text-foreground">
          <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-2 px-2 md:h-14 md:px-8">
            <button onClick={() => step(-1)} aria-label="Previous announcement" className="flex h-8 w-8 items-center justify-center hover:text-muted-foreground md:ml-16">
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <div className="relative h-6 flex-1 overflow-hidden text-center" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={slide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="truncate text-xs leading-6 md:text-lg"
                >
                  {announcements[slide]}
                </motion.p>
              </AnimatePresence>
            </div>
            <button onClick={() => step(1)} aria-label="Next announcement" className="flex h-8 w-8 items-center justify-center hover:text-muted-foreground">
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button onClick={hideBar} aria-label="Dismiss announcement" className="flex h-8 w-8 items-center justify-center hover:text-muted-foreground md:ml-8">
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-border bg-background">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-4 md:h-14 md:px-8">
          <div className="hidden w-40 items-center gap-8 md:flex">
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-muted-foreground">
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-muted-foreground">
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
          <Link href="/shop" className="flex-1 truncate text-center text-xs hover:text-muted-foreground md:text-lg">
            Complimentary Express Shipping On Orders Over $80 <span className="hidden sm:inline">| Shop Now</span>
          </Link>
          <div className="hidden w-40 justify-end md:flex">
            <label className="relative flex items-center gap-1 text-lg">
              <span className="sr-only">Language</span>
              <select className="cursor-pointer appearance-none bg-transparent pr-6 outline-none" defaultValue="en">
                <option value="en">English</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4" />
            </label>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:h-24 md:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </button>
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="lg:hidden">
              <Search className="h-5 w-5" />
            </button>
            <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative text-xl text-foreground transition-colors hover:text-muted-foreground"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="flex items-center gap-2" aria-label="Lavish Notes home">
            <Image
              src="/lavish-notes-symbol.png"
              alt=""
              width={52}
              height={52}
              priority
              className="h-9 w-9 object-contain invert md:h-14 md:w-14"
            />
            <span className="flex flex-col leading-none">
              <span className="text-base font-semibold uppercase tracking-[0.2em] md:text-2xl">Lavish</span>
              <span className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground md:text-xs">Notes</span>
            </span>
          </Link>

          <div className="flex items-center justify-end gap-4 md:gap-7">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="hidden hover:text-muted-foreground lg:block">
              <Search className="h-6 w-6" />
            </button>
            <Link href="/contact" aria-label="Account" className="hidden hover:text-muted-foreground sm:block">
              <User className="h-6 w-6" />
            </Link>
            <Link href="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`} className="relative hover:text-muted-foreground">
              <Heart className="h-5 w-5 md:h-6 md:w-6" />
              <CountBadge count={wishlist.length} />
            </Link>
            <button onClick={openCart} className="relative hover:text-muted-foreground" aria-label={`Open cart, ${count} items`}>
              <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
              <CountBadge count={count} />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-background lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="text-lg font-semibold uppercase tracking-[0.2em]">Menu</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav aria-label="Mobile" className="flex flex-col px-5">
                {[...nav, { label: 'Collections', href: '/collections' }, { label: 'Wishlist', href: '/wishlist' }].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between border-b border-border py-4 text-lg"
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex items-center gap-6 border-t border-border px-5 py-5">
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FacebookIcon className="h-5 w-5" />
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <Link href="/contact" onClick={() => setMobileOpen(false)} className="ml-auto flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" /> Account
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
