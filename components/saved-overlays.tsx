'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Shuffle, X } from 'lucide-react'
import { useSaved } from '@/lib/saved-context'
import { formatMoney, getProduct, type Product } from '@/lib/products'
import { useProductPurchase } from '@/lib/use-product-purchase'
import { SizePicker, QuantityStepper } from '@/components/purchase-controls'

function QuickViewBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const p = useProductPurchase(product)
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="relative aspect-square bg-card">
        {p.off > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-sale px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            -{p.off}%
          </span>
        )}
        <Image src={product.image || '/placeholder.svg'} alt={product.name} fill sizes="(max-width: 768px) 90vw, 400px" className="object-contain p-6" />
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.brand}</p>
          <h2 className="mt-1 text-2xl font-normal md:text-3xl">{product.name}</h2>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl text-sale">{formatMoney(p.price)}</span>
            {p.compareAt > p.price && <span className="text-muted-foreground line-through">{formatMoney(p.compareAt)}</span>}
          </div>
        </div>
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        <SizePicker product={product} purchase={p} />
        <div className="flex gap-3">
          <QuantityStepper value={p.qty} onChange={p.setQty} disabled={!p.inStock} />
          <button
            type="button"
            onClick={() => {
              p.add()
              onClose()
            }}
            disabled={!p.inStock}
            className="h-12 flex-1 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {p.inStock ? 'Add to cart' : 'Sold out'}
          </button>
        </div>
        <Link href={`/product/${product.slug}`} onClick={onClose} className="text-sm underline underline-offset-4 hover:text-muted-foreground">
          View full details
        </Link>
      </div>
    </div>
  )
}

export function SavedOverlays() {
  const { quickView, closeQuickView, compare, clearCompare } = useSaved()
  const product = quickView ? getProduct(quickView) : undefined

  useEffect(() => {
    if (!product) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeQuickView()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [product, closeQuickView])

  return (
    <>
      <AnimatePresence>
        {product && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/50 md:items-center md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeQuickView}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Quick view: ${product.name}`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-background p-5 md:rounded-2xl md:p-8"
            >
              <button
                type="button"
                onClick={closeQuickView}
                aria-label="Close quick view"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
              <QuickViewBody key={product.slug} product={product} onClose={closeQuickView} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {compare.length > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-20 left-4 z-40 flex items-center gap-1 rounded-full bg-primary py-1 pl-4 pr-1 text-sm text-primary-foreground shadow-lg lg:bottom-6"
          >
            <Link href="/wishlist#compare" className="flex items-center gap-2 py-1.5">
              <Shuffle className="h-4 w-4" /> Compare ({compare.length})
            </Link>
            <button
              type="button"
              onClick={clearCompare}
              aria-label="Clear compare list"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-primary-foreground/15"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
