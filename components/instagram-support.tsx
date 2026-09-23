'use client'

import { motion } from 'framer-motion'

export function InstagramSupport() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Response Time 1 to 4 Hours</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-medium text-foreground md:text-5xl">
          Visit Lavish Notes Instagram For Any Support
        </h2>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center border border-foreground px-10 py-4 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          Visit Now
        </a>
      </motion.div>
    </section>
  )
}
