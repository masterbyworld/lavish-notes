import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BrandsView } from '@/components/brands-view'

export const metadata: Metadata = {
  title: 'Shop With Brand — Lavish Notes',
  description: 'Explore designer-inspired fragrances by house — Creed, Parfums de Marly, Louis Vuitton, Giorgio Armani, Bond No.9 and more.',
}

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ b?: string }>
}) {
  const { b } = await searchParams
  return (
    <main>
      <SiteHeader />
      <BrandsView initialBrand={b} />
      <SiteFooter />
    </main>
  )
}
