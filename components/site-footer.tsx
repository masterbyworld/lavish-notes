'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown, ChevronUp, ArrowRight, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PolicyModal, type PolicyKey } from '@/components/policy-modal'

function Facebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.03 1.46-4.03 4.14v2.31H7.85V13h2.71v8h2.94z" />
    </svg>
  )
}

function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

const informationLinks: { label: string; href?: string; policy?: PolicyKey }[] = [
  { label: 'Search', href: '/shop' },
  { label: 'Customer Support', href: '/contact' },
  { label: 'Shipping Policy', policy: 'shipping' },
  { label: 'FAQ', policy: 'faq' },
  { label: 'Privacy Policy', policy: 'privacy' },
  { label: 'Return & Refund Policy', policy: 'refund' },
]

const paymentMethods = [
  { src: '/payments/american-express.svg', alt: 'American Express' },
  { src: '/payments/apple-pay.svg', alt: 'Apple Pay' },
  { src: '/payments/diners-club.svg', alt: 'Diners Club' },
  { src: '/payments/google-pay.svg', alt: 'Google Pay' },
  { src: '/payments/klarna.svg', alt: 'Klarna' },
  { src: '/payments/maestro.svg', alt: 'Maestro' },
  { src: '/payments/mastercard.svg', alt: 'Mastercard' },
  { src: '/payments/paypal.svg', alt: 'PayPal' },
  { src: '/payments/shopify.svg', alt: 'Shop Pay' },
  { src: '/payments/visa.svg', alt: 'Visa' },
]

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function SiteFooter() {
  // On mobile the columns collapse into accordions. `open` tracks which is
  // expanded; on desktop (md+) everything is always shown regardless.
  const [open, setOpen] = useState<string | null>('Subscribe')
  const toggle = (key: string) => setOpen((prev) => (prev === key ? null : key))
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null)

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
        <div className="grid gap-x-10 gap-y-2 md:grid-cols-[1.5fr_1.3fr_1fr_1fr] md:gap-y-0">
          {/* Brand */}
          <FooterSection title="Define Your Scent By Velvaroma" k="Brand" open={open} toggle={toggle}>
            <Image
              src="/logo.png"
              alt="Velvaroma Fragrance"
              width={160}
              height={80}
              className="mt-2 h-16 w-auto brightness-0 invert"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-background/70">
              Premium ingredients, identical scent profiles, and exceptional lasting power — all priced to fit your everyday budget. Your signature scent shouldn&apos;t cost a fortune.
            </p>
          </FooterSection>

          {/* Subscribe */}
          <FooterSection title="Subscribe" k="Subscribe" open={open} toggle={toggle} heading>
            <p className="max-w-sm text-sm leading-relaxed text-background/70">
              Enter your email below to be the first to know about new collections and product launches.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex items-center border border-background/30 bg-transparent"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-background placeholder:text-background/50 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex h-11 w-11 shrink-0 items-center justify-center text-background transition-opacity hover:opacity-70"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </FooterSection>

          {/* Support */}
          <FooterSection title="For any Support" k="Support" open={open} toggle={toggle}>
            <a
              href="mailto:Support@velvaroma.com"
              className="text-sm text-background/70 transition-colors hover:text-background"
            >
              Support@velvaroma.com
            </a>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Instagram, label: 'Instagram' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-foreground transition-transform hover:scale-105"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </FooterSection>

          {/* Information */}
          <FooterSection title="Information" k="Information" open={open} toggle={toggle}>
            <ul className="space-y-3 pt-1">
              {informationLinks.map((l) => (
                <li key={l.label}>
                  {l.policy ? (
                    <button
                      onClick={() => setActivePolicy(l.policy!)}
                      className="text-left text-sm text-background/70 transition-colors hover:text-background"
                    >
                      {l.label}
                    </button>
                  ) : (
                    <Link href={l.href!} className="text-sm text-background/70 transition-colors hover:text-background">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </FooterSection>
        </div>

        {/* Bottom bar: locale + payments */}
        <div className="mt-12 flex flex-col items-center gap-8 border-t border-background/15 pt-8 md:mt-14 md:flex-row md:justify-between md:gap-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
            <button className="flex items-center gap-1.5 text-sm text-background/80 hover:text-background">
              United States (USD $) <ChevronDown className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-1.5 text-sm text-background/80 hover:text-background">
              English <ChevronDown className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 md:hidden">
              <a href="#" aria-label="Facebook" className="text-background/80 hover:text-background"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="Instagram" className="text-background/80 hover:text-background"><Instagram className="h-4 w-4" /></a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {paymentMethods.map((p) => (
                <span
                  key={p.alt}
                  className="flex h-7 w-11 items-center justify-center rounded bg-background px-1.5"
                >
                  <Image src={p.src || '/placeholder.svg'} alt={p.alt} width={40} height={24} className="h-4 w-auto object-contain" />
                </span>
              ))}
            </div>
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="ml-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-background/30 text-background transition-colors hover:bg-background hover:text-foreground md:flex"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-background/50 md:text-left">
          © {new Date().getFullYear()} Velvaroma Fragrance. Designer-inspired.
        </p>
      </div>

      <PolicyModal policy={activePolicy} onClose={() => setActivePolicy(null)} />
    </footer>
  )
}

function FooterSection({
  title,
  k,
  open,
  toggle,
  heading,
  children,
}: {
  title: string
  k: string
  open: string | null
  toggle: (key: string) => void
  heading?: boolean
  children: React.ReactNode
}) {
  const isOpen = open === k
  return (
    <div className="border-b border-background/15 py-4 md:border-0 md:py-0">
      <button
        onClick={() => toggle(k)}
        className="flex w-full items-center justify-between text-left md:pointer-events-none"
        aria-expanded={isOpen}
      >
        <span className={cn(heading ? 'text-3xl font-medium' : 'text-lg font-medium', 'text-background')}>
          {title}
        </span>
        <span className="md:hidden">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>
      <div className={cn('overflow-hidden md:mt-4 md:block', isOpen ? 'mt-4 block' : 'hidden')}>{children}</div>
    </div>
  )
}
