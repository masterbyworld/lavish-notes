'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLiveStock } from '@/lib/use-live-stock'
import { type Product, DEFAULT_SIZE, discountPercent, formatMoney } from '@/lib/products'
import { trackAddToCart } from '@/lib/tracking'
import { cn } from '@/lib/utils'

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart()
  const { resolve } = useLiveStock()
  const [added, setAdded] = useState(false)
  const variant = product.variants[0]
  const live = resolve(product.blackSku, {
    price: product.price,
    compareAt: product.compareAt,
    inStock: product.inStock,
  })
  const inStock = live.inStock
  const priced = { ...product, price: live.price, compareAt: live.compareAt }
  const off = discountPercent(priced)
  const sizeLabel = variant?.sizeLabel ?? DEFAULT_SIZE
  const href = `/product/${product.slug}`

  function quickAdd() {
    if (!inStock) return
    addItem({
      id: `${product.slug}-${product.blackSku}`,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: sizeLabel,
      price: live.price,
      whiteSku: product.whiteSku,
      blackSku: product.blackSku,
    })
    trackAddToCart(priced, 1, sizeLabel)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.05 }}
      className="group relative flex h-full flex-col bg-card p-1.5 transition-shadow duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] md:p-3"
    >
      <div className="relative aspect-square overflow-hidden bg-card">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={cn(
              'object-contain p-2 transition-transform duration-500 group-hover:scale-105 md:p-3',
              !inStock && 'opacity-50 grayscale',
            )}
          />
        </Link>

        {off > 0 && (
          <span className="pointer-events-none absolute left-0 top-0 rounded-full bg-sale px-2 py-0.5 text-[11px] font-semibold text-primary-foreground md:left-1 md:top-1 md:px-2.5 md:text-xs">
            -{off}%
          </span>
        )}
        {!inStock && (
          <span className="pointer-events-none absolute right-0 top-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground md:right-1 md:top-1">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center px-0.5 pt-3 text-center md:px-1 md:pt-4">
        <Link href={href} className="w-full">
          <h3 className="line-clamp-1 text-xs font-normal uppercase tracking-wide text-foreground transition-colors hover:text-muted-foreground md:text-base">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-1.5 text-sm md:mt-1.5 md:gap-x-2 md:text-base">
          <span className="text-sale">
            {product.variants.length > 1 ? 'From ' : ''}
            {formatMoney(priced.price)}
          </span>
          {priced.compareAt > priced.price && (
            <span className="text-xs text-muted-foreground line-through md:text-sm">{formatMoney(priced.compareAt)}</span>
          )}
        </div>

        <div className="mt-auto w-full pt-3">
          <button
            type="button"
            onClick={quickAdd}
            disabled={!inStock}
            aria-label={inStock ? `Add ${product.name} to cart` : `${product.name} is sold out`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-foreground bg-background text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-background md:h-11 md:text-sm"
          >
            {added ? <Check className="h-4 w-4" aria-hidden /> : <ShoppingBag className="h-4 w-4" aria-hidden />}
            <span>{!inStock ? 'Sold out' : added ? 'Added' : 'Add to cart'}</span>
          </button>
        </div>
        <span className="sr-only" aria-live="polite">
          {added ? `${product.name} added to cart` : ''}
        </span>
      </div>
    </motion.article>
  )
}
