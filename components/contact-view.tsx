'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, Truck, Check } from 'lucide-react'

const info = [
  { icon: Mail, title: 'Email Us', detail: 'Support@lavishnotes.com' },
  { icon: MessageCircle, title: 'Live Chat', detail: '24/7 customer support' },
  { icon: Truck, title: 'Shipping', detail: 'Free on orders over $80' },
]

export function ContactView() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-medium text-foreground md:text-5xl">Get In Touch</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Questions about an order, a scent, or a recommendation? Our team is here to help.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {info.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex flex-col items-center gap-3 border border-border p-6 text-center"
          >
            <c.icon className="h-7 w-7 text-foreground" />
            <p className="font-medium text-foreground">{c.title}</p>
            <p className="text-sm text-muted-foreground">{c.detail}</p>
          </motion.div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
        className="mx-auto mt-12 max-w-2xl"
      >
        {sent ? (
          <div className="flex flex-col items-center gap-3 border border-border bg-secondary/50 p-10 text-center">
            <Check className="h-10 w-10 text-foreground" />
            <p className="text-xl font-medium text-foreground">Thank you, {form.name || 'friend'}!</p>
            <p className="text-sm text-muted-foreground">We&apos;ve received your message and will reply to {form.email || 'your inbox'} shortly.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-foreground"
                aria-label="Your name"
              />
              <input
                required
                type="email"
                placeholder="Your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-foreground"
                aria-label="Your email"
              />
            </div>
            <textarea
              required
              rows={6}
              placeholder="How can we help?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-foreground"
              aria-label="Message"
            />
            <button type="submit" className="bg-primary py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]">
              Send Message
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
