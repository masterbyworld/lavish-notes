'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ProductCarousel } from '@/components/product-carousel'
import { ALL_INVENTORY, brandKey, brandProducts } from '@/lib/products'
import { brandTagline } from '@/lib/brand-copy'
import { cn } from '@/lib/utils'

export function HouseTabs({
  id,
  title,
  subtitle,
  eyebrowFromBrand,
  tabs,
  defaultTab,
  large,
}: {
  id: string
  title: string
  subtitle?: string
  eyebrowFromBrand?: boolean
  tabs: string[]
  defaultTab: string
  large?: boolean
}) {
  const [active, setActive] = useState(defaultTab)
  const items = useMemo(() => brandProducts(active).slice(0, 15), [active])
  const key = brandKey(active)

  return (
    <section className="bg-background py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="mx-auto max-w-3xl text-center">
          {eyebrowFromBrand && (
            <motion.p key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 text-sm md:text-lg">
              {brandTagline(active)}
            </motion.p>
          )}
          <h2 className="text-balance text-3xl md:text-5xl">{title}</h2>
          {subtitle && <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground md:text-lg">{subtitle}</p>}
        </header>

        <div
          role="tablist"
          aria-label={`${title} houses`}
          className="no-scrollbar -mx-4 mt-8 flex gap-7 overflow-x-auto px-4 md:mx-0 md:mt-10 md:justify-center md:gap-12 md:px-0"
        >
          {tabs.map((t) => {
            const selected = t === active
            return (
              <button
                key={t}
                type="button"
                role="tab"
                id={`${id}-tab-${t}`}
                aria-selected={selected}
                aria-controls={`${id}-panel`}
                onClick={() => setActive(t)}
                className={cn(
                  'relative shrink-0 pb-2 text-base transition-colors md:text-xl',
                  selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t}
                {selected && (
                  <motion.span layoutId={`${id}-underline`} className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
                )}
              </button>
            )
          })}
        </div>

        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} className="mt-8 md:mt-12">
          <ProductCarousel
            products={items}
            label={`${active} fragrances`}
            itemClassName={large ? 'w-1/2 md:w-1/3 lg:w-1/4' : 'w-1/2 sm:w-1/3 lg:w-1/5'}
          />
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={active === ALL_INVENTORY || !key ? '/shop' : `/shop?c=${key}`}
            className="rounded-md bg-primary px-10 py-4 text-base font-medium text-primary-foreground transition-opacity hover:opacity-85"
          >
            {active === ALL_INVENTORY ? 'Shop All Products' : `Shop All ${active}`}
          </Link>
        </div>
      </div>
    </section>
  )
}
