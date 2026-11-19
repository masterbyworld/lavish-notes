'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { products } from '@/lib/products'
import { useSaved } from '@/lib/saved-context'
import { ProductCard } from '@/components/product-card'

export function WishlistView() {
  const { wishlist, compare } = useSaved()
  const wished = products.filter((p) => wishlist.includes(p.slug))
  const compared = products.filter((p) => compare.includes(p.slug))

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="text-center text-4xl md:text-5xl">Wishlist</h1>
      {wished.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <Heart className="h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">Your wishlist is empty. Tap the heart on any fragrance to save it here.</p>
          <Link href="/shop" className="rounded-full bg-primary px-8 py-3 text-primary-foreground hover:opacity-85">
            Shop All Products
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
          {wished.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      )}

      {compared.length > 0 && (
        <section id="compare" className="mt-20 scroll-mt-28">
          <h2 className="text-center text-3xl">Compare</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
            {compared.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
