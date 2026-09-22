import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CollectionsView } from '@/components/collections-view'

export const metadata: Metadata = {
  title: 'All Collections — Velvaroma Fragrance',
  description: 'Browse every fragrance collection — designer-inspired houses with hundreds of scents to discover.',
}

export default function CollectionsPage() {
  return (
    <main>
      <SiteHeader />
      <CollectionsView />
      <SiteFooter />
    </main>
  )
}
