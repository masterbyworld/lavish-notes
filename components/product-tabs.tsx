'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Product } from '@/lib/products'

const TABS = [
  { id: 'desc', label: 'Product description' },
  { id: 'ship', label: 'Shipping-Return' },
] as const

type TabId = (typeof TABS)[number]['id']

export function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<TabId>('desc')
  const hasNotes = product.notes.top.length + product.notes.heart.length + product.notes.base.length > 0

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <div className="flex items-center justify-center gap-10 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative -mb-px pb-3 text-lg transition-colors ${
              tab === t.id ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="pt-10"
        >
          {tab === 'desc' ? (
            <div className="space-y-6">
              <p className="leading-relaxed text-muted-foreground">{product.description}</p>
              {hasNotes && (
                <div className="space-y-3">
                  {(
                    [
                      ['Top', product.notes.top],
                      ['Heart', product.notes.heart],
                      ['Base', product.notes.base],
                    ] as const
                  )
                    .filter(([, notes]) => notes.length > 0)
                    .map(([label, notes]) => (
                      <div key={label} className="flex flex-wrap items-center gap-3">
                        <span className="w-14 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
                        <div className="flex flex-wrap gap-2">
                          {notes.map((n) => (
                            <span key={n} className="border border-border bg-secondary/60 px-3 py-1 text-xs text-foreground/90">{n}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <p>
                We process all orders within the same business day. Shipping time is 1-4 days. Once your order is
                shipped, you will receive a tracking number via email. For any shipping-related inquiries, contact us at{' '}
                <span className="font-semibold text-foreground">support@velvaroma.com</span>.
              </p>
              <p>
                We accept returns within 30 <span className="font-semibold text-foreground">days</span> of delivery.
                Items must be unused and in original condition. To initiate a return or refund, please email us at{' '}
                <span className="font-semibold text-foreground">support@velvaroma.com</span> with your order number and
                reason for return.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
