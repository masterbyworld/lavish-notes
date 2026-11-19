import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HeroCarousel } from '@/components/hero-carousel'
import { HouseTabs } from '@/components/house-tabs'
import { WinningSpotlight } from '@/components/winning-spotlight'
import { CuratorsChoice } from '@/components/curators-choice'
import { MostWanted } from '@/components/most-wanted'
import { BrandShowcase } from '@/components/brand-showcase'
import { HappyCustomers } from '@/components/happy-customers'
import { FeatureStrip } from '@/components/feature-strip'
import { MobileTabBar } from '@/components/mobile-tab-bar'

const HOUSES = ['MFK', 'Creed', 'Bond No. 9', 'Louis Vuitton', 'Parfums de Marly', 'Tom Ford', 'All Inventory']
const SCENT_TABS = ['Bond No. 9', 'All Inventory', 'Creed', 'Louis Vuitton', 'MFK', 'Parfums de Marly', 'Tom Ford']

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <HeroCarousel />
      <HouseTabs
        id="houses"
        title="Shop by Iconic Houses"
        subtitle="Browse luxury fragrances categorized by world-renowned perfumery houses. Premium scents delivered right to your door."
        tabs={HOUSES}
        defaultTab="Tom Ford"
      />
      <HouseTabs id="scents" title="Explore Iconic Scents" eyebrowFromBrand tabs={SCENT_TABS} defaultTab="Bond No. 9" large />
      <WinningSpotlight />
      <CuratorsChoice defaultBrand="Creed" />
      <MostWanted />
      <BrandShowcase brand="Louis Vuitton" title="Louis Vuitton Collection" />
      <section id="reviews">
        <HappyCustomers />
      </section>
      <FeatureStrip />
      <SiteFooter />
      <MobileTabBar />
    </main>
  )
}
