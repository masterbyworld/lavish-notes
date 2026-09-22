'use client'

import { motion } from 'framer-motion'
import { RotateCcw, ShieldCheck, Headphones } from 'lucide-react'

const items = [
  {
    icon: RotateCcw,
    title: '30 Days Return',
    desc: 'Enjoy a seamless shopping experience, facilitated by our complimentary shipping.',
  },
  {
    icon: ShieldCheck,
    title: 'Lifetime Warranty',
    desc: 'Our dedicated team provides timely assistance, committed to addressing your queries.',
  },
  {
    icon: Headphones,
    title: 'Customers Services',
    desc: 'Shop our fragrances with absolute confidence, backed by our 30-day satisfaction guarantee.',
  },
]

export function WhyVelvaroma() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
      <h2 className="text-center text-4xl font-medium text-foreground md:text-5xl">Why Velvaroma?</h2>
      <div className="mt-14 grid gap-12 md:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="flex flex-col items-center text-center"
          >
            <it.icon className="h-12 w-12 text-foreground" strokeWidth={1.4} />
            <h3 className="mt-5 text-xl font-medium text-foreground">{it.title}</h3>
            <p className="mt-3 max-w-xs text-pretty leading-relaxed text-muted-foreground">{it.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
