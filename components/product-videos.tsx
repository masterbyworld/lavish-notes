'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { videos } from '@/lib/products'

export function ProductVideos() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-medium text-foreground md:text-4xl">Straight From Our Warehouse</h2>
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-foreground text-foreground" />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">Rated 4.9/5 by 20,000+ happy customers</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {videos.map((v, i) => (
          <motion.div
            key={v.src}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            className="group overflow-hidden bg-muted"
          >
            <div className="relative aspect-[9/16] overflow-hidden">
              <video
                src={v.src}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
