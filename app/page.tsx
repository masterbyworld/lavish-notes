import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HeroCarousel } from '@/components/hero-carousel'
import { UrgencySection } from '@/components/urgency-section'
import { TotalInventory } from '@/components/total-inventory'
import { BrandStats } from '@/components/brand-stats'
import { WinningProducts } from '@/components/winning-products'
import { BrandSplit } from '@/components/brand-split'
import { CollectionSelector } from '@/components/collection-selector'
import { VideoRatings } from '@/components/video-ratings'
import { HappyCustomers } from '@/components/happy-customers'
import { InstagramSupport } from '@/components/instagram-support'
import { FeatureStrip } from '@/components/feature-strip'
import { MobileTabBar } from '@/components/mobile-tab-bar'

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <HeroCarousel />
      <UrgencySection />
      <TotalInventory />
      <CollectionSelector />
      <BrandStats />
      <UrgencySection />
      <WinningProducts />
      <BrandSplit />
      <VideoRatings />
      <section id="reviews">
        <HappyCustomers />
      </section>
      <InstagramSupport />
      <FeatureStrip />
      <SiteFooter />
      <MobileTabBar />
    </main>
  )
}
