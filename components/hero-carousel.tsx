import Link from 'next/link'

const banner = {
  desktop: '/banners/creed-wild-vetiver.png',
  mobile: '/banners/creed-wild-vetiver-mobile.jpg',
  href: '/shop?c=CR',
  alt: 'New Creed Wild Vetiver decant — shop now',
}

export function HeroCarousel() {
  return (
    <section className="relative overflow-hidden bg-background" aria-label="Featured fragrance">
      <Link
        href={banner.href}
        aria-label={banner.alt}
        className="relative block aspect-[3/4] w-full md:aspect-[1445/564]"
      >
        <picture>
          <source media="(min-width: 640px)" srcSet={banner.desktop} />
          <img
            src={banner.mobile}
            alt={banner.alt}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      </Link>
    </section>
  )
}
