'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const features = [
  { icon: '/icons/free-delivery.png', title: 'Free Shipping', desc: 'Enjoy free shipping on all orders over $80.' },
  { icon: '/icons/satisfaction.png', title: 'Money Guarantee', desc: 'Within 30 days for an exchange.' },
  { icon: '/icons/customer-service.png', title: 'Online Support', desc: '24 hours a day, 7 days a week' },
  { icon: '/icons/payment.png', title: 'Flexible Payment', desc: 'Pay with Multiple Credit Cards' },
]

export function FeatureStrip() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4 md:px-8">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex items-center gap-4 text-left"
          >
            <Image src={f.icon || '/placeholder.svg'} alt="" width={56} height={56} className="h-14 w-14 shrink-0 object-contain" />
            <div>
              <p className="text-lg font-medium text-foreground">{f.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
