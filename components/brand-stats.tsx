'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { target: 18, suffix: 'k+', label: 'Happy customers' },
  { target: 12, suffix: 'k+', label: 'Products sold' },
  { target: 6, suffix: 'k+', label: 'Five star reviews' },
  { target: 99, suffix: '%', label: 'Customer satisfaction' },
]

// Animate from 0 to the target once the number scrolls into view.
function CountUp({ target, suffix, duration = 1600 }: { target: number; suffix: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  )
}

export function BrandStats() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          The Essence of Original Luxury, Reimagined
        </p>
        <h2 className="mt-4 text-5xl font-medium tracking-tight text-foreground md:text-6xl">Lavish Notes</h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Discover luxury fragrances at unbeatable prices. From iconic designer scents to rare niche creations,
          Lavish Notes brings you premium perfumes crafted from the finest ingredients. Enjoy exclusive deals, fast
          delivery, and exceptional service.
        </p>
      </motion.div>

      <div className="mt-16 grid grid-cols-2 gap-y-12 border-t border-border pt-14 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-center"
          >
            <p className="text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
              <CountUp target={s.target} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
