import { Truck } from 'lucide-react'
import { ProductCarousel } from '@/components/product-carousel'
import type { Product } from '@/lib/products'

const MARQUEE_ITEMS = 8

export function ShippingMarquee() {
  const items = Array.from({ length: MARQUEE_ITEMS })
  return (
    <div className="overflow-hidden bg-muted py-3" aria-label="Free express US shipping on orders over $80">
      <div className="marquee-track flex w-max" aria-hidden>
        {[...items, ...items].map((_, i) => (
          <span key={i} className="flex shrink-0 items-center gap-3 px-6 text-sm uppercase md:text-base">
            <Truck className="h-5 w-5 fill-foreground" />
            Free express US shipping on orders over $80
          </span>
        ))}
      </div>
    </div>
  )
}

export function RelatedByBrand({ products }: { products: Product[]; brand?: string }) {
  return (
    <section className="border-t border-border bg-background pt-14 md:pt-20">
      {products.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-14 md:px-8 md:pb-16">
          <h2 className="mb-8 text-3xl md:mb-12 md:text-4xl">You Might Also Like</h2>
          <ProductCarousel products={products} label="You might also like" itemClassName="w-1/2 md:w-1/3 lg:w-1/4" dots={false} />
        </div>
      )}
      <ShippingMarquee />
    </section>
  )
}
