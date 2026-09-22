'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function BrandSplit() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="order-2 md:order-1"
      >
        <h2 className="text-balance text-4xl font-medium leading-tight text-foreground md:text-5xl">
          Define Your Presence with Parfums de Marly.
        </h2>
        <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
          The essence of the Royal Fragrance Court. Discover noble ingredients crafted into powerful, signature scents for the elite.
        </p>
        <Link
              href="/shop?c=DM"
          className="mt-8 inline-flex bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          View Collection
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative order-1 aspect-square w-full overflow-hidden md:order-2"
      >
        <Image
          src="/brands/parfums-de-marly-kv.jpg"
          alt="Parfums de Marly campaign — a man walking beside the signature bottle"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </motion.div>
    </section>
  )
}
