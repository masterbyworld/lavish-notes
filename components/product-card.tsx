'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, Heart, Shuffle, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLiveStock } from '@/lib/use-live-stock'
import { useSaved } from '@/lib/saved-context'
import { type Product, DEFAULT_SIZE, discountPercent, formatMoney } from '@/lib/products'
import { trackAddToCart } from '@/lib/tracking'
import { cn } from '@/lib/utils'

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart()
  const { resolve } = useLiveStock()
  const { isWished, toggleWish, isCompared, toggleCompare, openQuickView } = useSaved()
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
  const wished = isWished(product.slug)
  const compared = isCompared(product.slug)
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
  }

  const actions = [
    {
      label: wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`,
      onClick: () => toggleWish(product.slug),
      pressed: wished,
      icon: <Heart className={cn('h-[18px] w-[18px]', wished && 'fill-sale text-sale')} />,
    },
    {
      label: inStock ? `Add ${product.name} to cart` : `${product.name} is sold out`,
      onClick: quickAdd,
      disabled: !inStock,
      icon: <ShoppingBag className="h-[18px] w-[18px]" />,
    },
    {
      label: `Quick view ${product.name}`,
      onClick: () => openQuickView(product.slug),
      icon: <Eye className="h-[18px] w-[18px]" />,
    },
    {
      label: compared ? `Remove ${product.name} from compare` : `Compare ${product.name}`,
      onClick: () => toggleCompare(product.slug),
      pressed: compared,
      icon: <Shuffle className={cn('h-[18px] w-[18px]', compared && 'text-sale')} />,
    },
  ]

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 5) * 0.05 }}
      className="group relative flex h-full flex-col bg-card p-2 transition-shadow duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] md:p-3"
    >
      <div className="relative aspect-square overflow-hidden bg-card">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className={cn(
              'object-contain p-3 transition-transform duration-500 group-hover:scale-105',
              !inStock && 'opacity-50 grayscale',
            )}
          />
        </Link>

        {off > 0 && (
          <span className="pointer-events-none absolute left-1 top-1 rounded-full bg-sale px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground md:text-xs">
            -{off}%
          </span>
        )}
        {!inStock && (
          <span className="pointer-events-none absolute right-1 top-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
            Sold out
          </span>
        )}

        <div className="absolute inset-x-1 bottom-1 grid grid-cols-4 divide-x divide-border border border-border bg-card shadow-sm transition-all duration-300 md:inset-x-2 md:bottom-2 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              disabled={a.disabled}
              aria-label={a.label}
              title={a.label}
              aria-pressed={a.pressed}
              className="flex h-9 items-center justify-center text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40 md:h-11"
            >
              {a.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-1 pb-2 pt-4 text-center">
        <Link href={href} className="w-full">
          <h3 className="line-clamp-1 text-[13px] font-normal uppercase tracking-wide text-foreground transition-colors hover:text-muted-foreground md:text-base">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5 flex flex-wrap items-baseline justify-center gap-x-2 text-sm md:text-base">
          <span className="text-sale">
            {product.variants.length > 1 ? 'From ' : ''}
            {formatMoney(priced.price)}
          </span>
          {priced.compareAt > priced.price && (
            <span className="text-xs text-muted-foreground line-through md:text-sm">{formatMoney(priced.compareAt)}</span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
