import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { WishlistView } from '@/components/wishlist-view'

export const metadata: Metadata = {
  title: 'Wishlist | Lavish Notes',
  description: 'Your saved Lavish Notes fragrances.',
}

export default function WishlistPage() {
  return (
    <main>
      <SiteHeader />
      <WishlistView />
      <SiteFooter />
    </main>
  )
}
