'use client'

import useSWR from 'swr'
import type { LiveVariantState } from '@/app/api/inventory/route'

type InventoryResponse = { source: string; variants: Record<string, LiveVariantState> }

const fetcher = (url: string): Promise<InventoryResponse> => fetch(url).then((r) => r.json())

type Fallback = { price: number; compareAt: number; inStock: boolean }

/**
 * Live Shopify price/stock per variant SKU. Every resolver takes the CSV
 * catalog value as a fallback, used while loading or when a SKU is unmatched.
 */
export function useLiveStock() {
  const { data } = useSWR<InventoryResponse>('/api/inventory', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 60_000,
    refreshInterval: 120_000,
  })
  const variants = data?.variants

  function resolve(sku: string, fallback: Fallback): Fallback {
    const live = variants?.[sku]
    if (!live) return fallback
    return { price: live.price, compareAt: live.compareAt, inStock: live.inStock }
  }

  return {
    ready: Boolean(variants),
    resolve,
    isInStock(sku: string, fallback: boolean): boolean {
      return variants?.[sku]?.inStock ?? fallback
    },
  }
}
