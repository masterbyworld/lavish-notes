'use client'

import { motion } from 'framer-motion'
import { Mail, MessageCircle, Truck, ArrowUpRight, Clock } from 'lucide-react'

const SUPPORT_EMAIL = 'Support@lavishnotes.com'
const INSTAGRAM_URL = 'https://www.instagram.com/lavishnotes'
const FACEBOOK_URL = 'https://web.facebook.com/profile.php?id=61594224966224#'

const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  'Lavish Notes — Support Request',
)}&body=${encodeURIComponent(
  "Hi Lavish Notes team,\n\nI'd love some help with the following:\n\n",
)}`

const highlights = [
  { icon: Clock, title: 'Fast Replies', detail: 'We respond within 1 to 4 hours' },
  { icon: MessageCircle, title: 'Real People', detail: 'Scent advice from our team' },
  { icon: Truck, title: 'Free Shipping', detail: 'On every order over $80' },
]

export function ContactView() {
  return (
    <div className="relative overflow-hidden">
      {/* Soft ambient glow anchored to theme */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-secondary/40 to-transparent" />

      <div className="relative mx-auto max-w-5xl px-4 py-20 md:px-8 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">We&apos;re Here To Help</p>
          <h1 className="mt-4 text-balance text-4xl font-medium text-foreground md:text-6xl">
            Let&apos;s Talk Fragrance
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Questions about an order, a scent, or a recommendation? Reach out and one of our fragrance specialists will
            get back to you personally.
          </p>
        </motion.div>

        {/* Interactive email action card */}
        <motion.a
          href={mailtoHref}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="group relative mt-14 block overflow-hidden rounded-2xl border border-border bg-card p-8 text-card-foreground transition-colors hover:border-foreground md:p-12"
        >
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform group-hover:scale-105">
                <Mail className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Email Us Directly</p>
                <p className="mt-2 text-2xl font-medium text-foreground md:text-3xl">{SUPPORT_EMAIL}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tap to open your email app with a message ready to send.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 self-stretch rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground transition-transform group-hover:scale-[1.02] md:self-auto">
              Send a Message
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </motion.a>

        {/* Highlights */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {highlights.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
              className="flex flex-col gap-3 rounded-2xl border border-border p-6"
            >
              <c.icon className="h-6 w-6 text-foreground" />
              <div>
                <p className="font-medium text-foreground">{c.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-14 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-sm text-muted-foreground">Prefer social? Message us anytime.</p>
          <div className="flex items-center gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Instagram
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Facebook
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
