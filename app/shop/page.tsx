import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ShopView } from '@/components/shop-view'

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; q?: string }>
}) {
  const { c, q } = await searchParams
  return (
    <main>
      <SiteHeader />
      <ShopView initialCollection={c} initialQuery={q ?? ''} />
      <SiteFooter />
    </main>
  )
}
