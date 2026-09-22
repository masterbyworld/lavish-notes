'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLiveStock } from '@/lib/use-live-stock'
import { type Product, DEFAULT_SIZE, discountPercent, formatPrice } from '@/lib/products'

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart()
  const { isInStock } = useLiveStock()
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
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {off > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white">
              -{off}%
            </span>
          )}
          {!inStock && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-foreground/85 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-background">
              Sold Out
            </span>
          )}
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            className={`object-contain p-6 transition-transform duration-500 group-hover:scale-105 ${
              inStock ? '' : 'opacity-40 grayscale'
            }`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {inStock ? (
            <button
              onClick={quickAdd}
              className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 bg-primary py-2.5 text-sm font-medium text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
              aria-label={`Quick add ${product.name}`}
            >
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
          ) : (
            <span className="absolute inset-x-3 bottom-3 flex items-center justify-center bg-muted py-2.5 text-sm font-medium text-muted-foreground">
              Out of stock
            </span>
          )}
        </div>
        <div className="pt-3 text-center">
          <h3 className="text-sm font-medium uppercase tracking-wide text-foreground">{product.name}</h3>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="text-sm font-semibold text-sale">{formatPrice(product.price)}</span>
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
