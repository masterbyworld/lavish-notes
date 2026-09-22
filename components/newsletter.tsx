'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <section className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-medium text-foreground md:text-4xl">Get 10% off your first order</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Subscribe for early access to new arrivals, exclusive drops and members-only pricing.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (email) setDone(true)
            }}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 border border-border bg-background px-5 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              aria-label="Email address"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              {done ? (
                <>
                  <Check className="h-4 w-4" /> Subscribed
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
