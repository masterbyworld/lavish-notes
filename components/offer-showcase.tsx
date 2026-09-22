'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Truck, Zap } from 'lucide-react'

const FACES = ['bundle', 'limited'] as const
const ROTATE_MS = 3500

export function OfferShowcase() {
  const [face, setFace] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setFace((f) => (f + 1) % FACES.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="mx-auto max-w-3xl px-4 py-4 md:px-8">
      <div className="overflow-hidden rounded-2xl bg-foreground text-background">
        <div className="relative flex min-h-[132px] items-center justify-center px-4 py-6 sm:px-8">
          <AnimatePresence mode="wait">
            {FACES[face] === 'bundle' ? (
              <motion.div
                key="bundle"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-3 sm:gap-4"
              >
                <Tile title="Bottle 1" sub="Premium Scent" />
                <span className="text-2xl font-light text-background/50">+</span>
                <Tile title="Bottle 2" sub="Premium Scent" />
                <span className="text-2xl font-light text-background/50">=</span>
                <Tile title="Bottle 3" sub="100% Free" highlight />
              </motion.div>
            ) : (
              <motion.div
                key="limited"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center"
              >
                <span className="rounded-md bg-sale px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                  Limited Time
                </span>
                <span className="text-xl font-bold uppercase tracking-wide sm:text-2xl">Buy 2, Get 1 Free</span>
                <span className="flex items-center gap-1.5 text-sm text-background/60">
                  <Zap className="h-4 w-4 text-sale" /> Only 4 packages left at this price!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-background/10 bg-background/5 py-3 text-center text-sm">
          <Truck className="h-4 w-4 text-sale" />
          <span className="font-bold uppercase tracking-wide">Free Express Shipping</span>
          <span className="uppercase tracking-wide text-background/60">On Buy 2 Get 1 Today</span>
        </div>
      </div>
    </section>
  )
}

function Tile({ title, sub, highlight = false }: { title: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className={`flex w-24 flex-col items-center justify-center rounded-xl px-2 py-4 text-center sm:w-32 ${
        highlight ? 'bg-sale text-white' : 'border border-background/15'
      }`}
    >
      <span className="text-sm font-bold sm:text-base">{title}</span>
      <span className={`mt-0.5 text-[10px] uppercase tracking-wider ${highlight ? 'text-white/80' : 'text-background/50'}`}>
        {sub}
      </span>
    </div>
  )
}
