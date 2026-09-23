'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Slide = {
  desktop: string
  mobile: string
  href: string
  alt: string
}

const slides: Slide[] = [
  {
    desktop: '/banners/creed-spring-flower.png',
    mobile: '/banners/creed-spring-flower.png',
    href: '/shop?c=CR',
    alt: 'Creed Spring Flower — shop the Creed collection',
  },
  {
    desktop: '/banners/mfk-baccarat-apom.png',
    mobile: '/banners/mfk-baccarat-apom.png',
    href: '/shop?c=MF',
    alt: 'Maison Francis Kurkdjian — Baccarat Rouge 540 & APOM',
  },
]

const AUTO_MS = 5500

export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const go = useCallback((next: number) => {
    setIndex((next + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_MS)
    return () => clearInterval(t)
  }, [paused])

  return (
    <section
      className="relative overflow-hidden bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured fragrances"
    >
      <div className="relative aspect-[3/4] w-full sm:aspect-[16/9] md:aspect-[1451/586]">
        <AnimatePresence mode="sync">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Link href={slides[index].href} aria-label={slides[index].alt}>
              {/* Desktop */}
              <img
                src={slides[index].desktop || '/placeholder.svg'}
                alt={slides[index].alt}
                className="hidden h-full w-full object-cover sm:block"
              />
              {/* Mobile */}
              <img
                src={slides[index].mobile || '/placeholder.svg'}
                alt={slides[index].alt}
                className="h-full w-full object-cover sm:hidden"
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={() => go(index - 1)}
        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/60 md:left-6"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(index + 1)}
        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/60 md:right-6"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-1.5 overflow-hidden rounded-full bg-white/40 transition-all"
            style={{ width: i === index ? 36 : 12 }}
          >
            {i === index && !paused && (
              <motion.span
                key={index}
                className="block h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: AUTO_MS / 1000, ease: 'linear' }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
