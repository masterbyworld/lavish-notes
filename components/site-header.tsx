'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, ShoppingBag, User, X, Mail, ChevronDown, AtSign } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAnnouncement } from '@/lib/announcement-context'
import { PromoMarquee } from '@/components/promo-marquee'
import { SearchOverlay } from '@/components/search-overlay'

const nav = [
  { label: 'Home', href: '/' },
  { label: 'Shop All', href: '/shop' },
  { label: 'Shop With Brand', href: '/brands' },
  { label: 'Contact', href: '/contact' },
]

export function SiteHeader() {
  const { count, openCart } = useCart()
  const { barVisible, hideBar } = useAnnouncement()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="relative z-40">
      <PromoMarquee />

      {barVisible && (
        <div className="relative border-b border-border bg-background">
          <p className="py-2.5 text-center text-sm text-foreground">
            Enjoy free shipping on all orders over $80.
          </p>
          <button
            onClick={hideBar}
            aria-label="Dismiss announcement"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="hidden border-b border-border bg-background md:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 text-sm text-foreground md:px-8">
          <div className="flex items-center gap-5">
            <a href="mailto:Support@velvaroma.com" className="flex items-center gap-2 hover:text-muted-foreground">
              <Mail className="h-4 w-4" />
              Support@velvaroma.com
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-muted-foreground">
              <AtSign className="h-4 w-4" />
            </a>
          </div>
          <div className="flex items-center gap-6 text-[13px]">
            <button className="flex items-center gap-1 hover:text-muted-foreground">
              English <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button className="flex items-center gap-1 hover:text-muted-foreground">
              United States (USD $) <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky main nav */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <button className="flex items-center lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex shrink-0 items-center lg:flex-none" aria-label="Velvaroma home">
            <Image src="/logo.png" alt="Velvaroma Fragrance" width={150} height={72} className="h-14 w-auto" priority />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative text-[15px] font-medium text-foreground transition-colors hover:text-muted-foreground"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="text-foreground hover:text-muted-foreground">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/contact" aria-label="Account" className="hidden text-foreground hover:text-muted-foreground sm:block">
              <User className="h-5 w-5" />
            </Link>
            <button onClick={openCart} className="relative text-foreground hover:text-muted-foreground" aria-label={`Open cart, ${count} items`}>
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-1 bg-background p-6 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <Image src="/logo.png" alt="Velvaroma Fragrance" width={120} height={58} className="h-11 w-auto" />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-6 w-6" />
                </button>
              </div>
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-border py-3.5 text-lg text-foreground transition-colors hover:text-muted-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <a href="mailto:Support@velvaroma.com" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> Support@velvaroma.com
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
