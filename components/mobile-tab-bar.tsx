'use client'

import Link from 'next/link'
import { Home, LayoutGrid, ShoppingBag, Heart, Search } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export function MobileTabBar() {
  const { count, openCart } = useCart()

  return (
    <>
      {/* Spacer so fixed bar never hides page content */}
      <div className="h-16 lg:hidden" aria-hidden />
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background lg:hidden">
        <Link href="/" aria-label="Home" className="flex flex-col items-center justify-center gap-1 py-3 text-foreground">
          <Home className="h-5 w-5" />
        </Link>
        <Link href="/collections" aria-label="Categories" className="flex flex-col items-center justify-center gap-1 py-3 text-foreground">
          <LayoutGrid className="h-5 w-5" />
        </Link>
        <button onClick={openCart} aria-label={`Open cart, ${count} items`} className="relative flex flex-col items-center justify-center gap-1 py-3 text-foreground">
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute right-[calc(50%-1.25rem)] top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
        <Link href="/shop" aria-label="Wishlist" className="flex flex-col items-center justify-center gap-1 py-3 text-foreground">
          <Heart className="h-5 w-5" />
        </Link>
        <Link href="/shop" aria-label="Search" className="flex flex-col items-center justify-center gap-1 py-3 text-foreground">
          <Search className="h-5 w-5" />
        </Link>
      </nav>
    </>
  )
}
