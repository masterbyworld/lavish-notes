'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Star } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLiveStock } from '@/lib/use-live-stock'
import { type Product, DEFAULT_SIZE, discountPercent, formatPrice } from '@/lib/products'
import { trackAddToCart } from '@/lib/tracking'

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart()
  const { isInStock } = useLiveStock()
  const [wished, setWished] = useState(false)
  const off = discountPercent(product)
  const inStock = isInStock(product.whiteSku, product.inStock)

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!inStock) return
    addItem({
      id: `${product.slug}-${DEFAULT_SIZE}`,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: DEFAULT_SIZE,
      price: product.price,
      whiteSku: product.whiteSku,
      blackSku: product.blackSku,
    })
    trackAddToCart(product, 1)
  }

  function toggleWish(e: React.MouseEvent) {
    e.preventDefault()
    setWished((v) => !v)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.05 }}
      className="group flex flex-col border border-border bg-card transition-colors hover:border-foreground/30"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-white">
          {off > 0 && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-sale px-2.5 py-1 text-[11px] font-bold text-white">
              -{off}%
            </span>
          )}
          <button
            onClick={toggleWish}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={wished}
            className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-sm transition-colors hover:bg-white"
          >
            <Heart className={`h-4 w-4 ${wished ? 'fill-sale text-sale' : ''}`} />
          </button>
          {!inStock && (
            <span className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-neutral-900/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Sold Out
            </span>
          )}
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            className={`object-contain p-5 transition-transform duration-500 group-hover:scale-105 ${
              inStock ? '' : 'opacity-50 grayscale'
            }`}
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{product.brand}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-[2.2rem] text-[13px] font-semibold uppercase leading-tight tracking-wide text-foreground transition-colors group-hover:text-muted-foreground">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5 text-foreground">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
          <span aria-hidden>·</span>
          <span className="truncate">{product.family}</span>
        </div>

        <div className="mt-1.5 flex items-center justify-center gap-2">
          <span className="text-sm font-bold text-sale">{formatPrice(product.price)}</span>
          {product.compareAt > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>

        <div className="mt-3">
          {inStock ? (
            <button
              onClick={quickAdd}
              className="flex w-full items-center justify-center gap-2 border border-foreground/25 bg-transparent py-2.5 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
            </button>
          ) : (
            <span className="flex w-full items-center justify-center bg-muted py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
