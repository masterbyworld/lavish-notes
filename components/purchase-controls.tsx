'use client'

import { Minus, Plus } from 'lucide-react'
import type { Product } from '@/lib/products'
import type { useProductPurchase } from '@/lib/use-product-purchase'
import { cn } from '@/lib/utils'

type Purchase = ReturnType<typeof useProductPurchase>

export function SizePicker({ product, purchase }: { product: Product; purchase: Purchase }) {
  if (product.variants.length === 0) return null
  return (
    <div>
      <p className="mb-3 text-base">
        <span className="font-medium">Size:</span> {purchase.sizeLabel}
      </p>
      <div role="radiogroup" aria-label="Size" className="flex flex-wrap gap-3">
        {product.variants.map((v) => {
          const selected = v.sku === purchase.variant?.sku
          const state = purchase.liveFor(v)
          return (
            <button
              key={v.sku}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => purchase.setVariantSku(v.sku)}
              className={cn(
                'min-w-20 rounded-md border px-4 py-3 text-base transition-colors',
                selected ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground',
                !state.inStock && 'line-through opacity-50',
              )}
            >
              {v.sizeLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function QuantityStepper({
  value,
  onChange,
  disabled,
  compact,
}: {
  value: number
  onChange: (n: number) => void
  disabled?: boolean
  compact?: boolean
}) {
  return (
    <div className={cn('flex shrink-0 items-center justify-between rounded-md bg-muted', compact ? 'h-11 w-32' : 'h-12 w-36')}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
        className="flex h-full w-11 items-center justify-center hover:text-muted-foreground disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center tabular-nums" aria-live="polite" aria-label={`Quantity ${value}`}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        aria-label="Increase quantity"
        className="flex h-full w-11 items-center justify-center hover:text-muted-foreground disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
