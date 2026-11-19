import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCarousel } from '@/components/product-carousel'
import { brandKey, brandProducts } from '@/lib/products'
import { brandTagline } from '@/lib/brand-copy'

export function BrandShowcase({ brand, title }: { brand: string; title: string }) {
  const items = brandProducts(brand).slice(0, 16)
  if (items.length === 0) return null

  return (
    <section className="border-t border-border bg-background py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="mb-8 flex flex-col items-center gap-4 text-center md:mb-12 md:flex-row md:items-end md:justify-between md:text-left">
          <div>
            <p className="mb-3 text-sm md:text-lg">{brandTagline(brand)}</p>
            <h2 className="text-balance text-3xl md:text-5xl">{title}</h2>
          </div>
          <Link
            href={`/shop?c=${brandKey(brand) ?? ''}`}
            className="group flex items-center gap-2 border-b border-foreground pb-1 text-base hover:text-muted-foreground"
          >
            View the collection
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </header>
        <ProductCarousel products={items} label={`${brand} collection`} itemClassName="w-1/2 sm:w-1/3 lg:w-1/4" />
      </div>
    </section>
  )
}
