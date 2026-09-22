'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CountdownBoxes } from '@/components/countdown'

export function UrgencySection() {
  return (
    <section className="bg-secondary/60 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl px-4 text-center md:px-8"
      >
        <h2 className="text-4xl font-medium text-foreground md:text-5xl">Hurry! Prices Increase In…</h2>
        <p className="mt-3 text-muted-foreground">Don&apos;t miss out on this limited-time offer</p>
        <div className="mt-8">
          <CountdownBoxes />
        </div>
        <Link
          href="/shop"
          className="mt-10 inline-flex bg-primary px-10 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          View All Products
        </Link>
      </motion.div>
    </section>
  )
}
