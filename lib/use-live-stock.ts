'use client'

import useSWR from 'swr'

type InventoryResponse = { stock: Record<string, boolean>; error?: string }

const fetcher = (url: string): Promise<InventoryResponse> =>
  fetch(url).then((r) => r.json())

/**
 * Live inventory hook. Fetches Shopify-resolved stock keyed by White SKU and
 * returns a resolver that overrides the catalog's baseline `inStock` with the
 * live value when known. Falls back to the baseline while loading or if the
 * sync is unavailable, so the storefront never blanks out.
 */
export function useLiveStock() {
  const { data } = useSWR<InventoryResponse>('/api/inventory', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 60_000,
    refreshInterval: 120_000,
  })

  const stock = data?.stock

  return {
    ready: Boolean(stock),
    isInStock(whiteSku: string, fallback: boolean): boolean {
      if (!stock) return fallback
      const live = stock[whiteSku]
      return live === undefined ? fallback : live
    },
  }
}
