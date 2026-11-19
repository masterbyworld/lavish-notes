'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowUp, Check, Mail, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PolicyModal, type PolicyKey } from '@/components/policy-modal'
import { FacebookIcon, InstagramIcon } from '@/components/social-icons'

const FACEBOOK_URL = 'https://web.facebook.com/profile.php?id=61594224966224#'
const INSTAGRAM_URL = 'https://www.instagram.com/lavishnotes'

type FooterLink = { label: string; href?: string; policy?: PolicyKey }

const shopLinks: FooterLink[] = [
  { label: 'All Fragrances', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Brands', href: '/brands' },
  { label: 'Wishlist', href: '/wishlist' },
]

const informationLinks: FooterLink[] = [
  { label: 'Shipping Policy', policy: 'shipping' },
  { label: 'Return & Refund Policy', policy: 'refund' },
  { label: 'Privacy Policy', policy: 'privacy' },
  { label: 'FAQ', policy: 'faq' },
]

const paymentMethods = [
  { src: '/payments/visa.svg', alt: 'Visa' },
  { src: '/payments/mastercard.svg', alt: 'Mastercard' },
  { src: '/payments/american-express.svg', alt: 'American Express' },
  { src: '/payments/paypal.svg', alt: 'PayPal' },
  { src: '/payments/apple-pay.svg', alt: 'Apple Pay' },
  { src: '/payments/google-pay.svg', alt: 'Google Pay' },
  { src: '/payments/klarna.svg', alt: 'Klarna' },
  { src: '/payments/shopify.svg', alt: 'Shop Pay' },
]

export function SiteFooter() {
  const [open, setOpen] = useState<string | null>(null)
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null)
  const [subscribed, setSubscribed] = useState(false)
  const toggle = (key: string) => setOpen((prev) => (prev === key ? null : key))

  const renderLinks = (links: FooterLink[]) => (
    <ul className="flex flex-col gap-3">
      {links.map((l) => (
        <li key={l.label}>
          {l.policy ? (
            <button type="button" onClick={() => setActivePolicy(l.policy!)} className="text-left text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </button>
          ) : (
            <Link href={l.href!} className="text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <footer className="border-t border-border bg-background pb-20 text-foreground md:pb-0">
      <div className="border-b border-border bg-muted">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-12 text-center md:py-16">
          <h2 className="text-balance text-3xl md:text-4xl">Join the Scent List</h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Be the first to hear about new arrivals, restocks, and members-only offers.
          </p>
          {subscribed ? (
            <p className="mt-6 flex items-center gap-2 font-medium" role="status">
              <Check className="h-5 w-5" /> {"You're on the list — welcome!"}
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSubscribed(true)
              }}
              className="mt-6 flex w-full max-w-lg flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-background px-5">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
                <input
                  id="footer-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Your email address"
                  className="h-12 min-w-0 flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <button type="submit" className="h-12 rounded-full bg-primary px-8 font-medium text-primary-foreground transition-opacity hover:opacity-85">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
        <div className="grid md:grid-cols-[1.6fr_1fr_1fr_1.2fr] md:gap-10">
          <div className="flex flex-col items-center pb-8 text-center md:items-start md:pb-0 md:text-left">
            <Link href="/" aria-label="Lavish Notes home">
              <Image src="/lavish-notes-logo-full.png" alt="Lavish Notes" width={200} height={200} className="h-28 w-auto object-contain invert" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Premium ingredients, signature scent profiles, and exceptional lasting power — priced for everyday luxury.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: FacebookIcon, label: 'Facebook', href: FACEBOOK_URL },
                { Icon: InstagramIcon, label: 'Instagram', href: INSTAGRAM_URL },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Shop" k="shop" open={open} toggle={toggle}>
            {renderLinks(shopLinks)}
          </FooterColumn>
          <FooterColumn title="Information" k="info" open={open} toggle={toggle}>
            {renderLinks(informationLinks)}
          </FooterColumn>
          <FooterColumn title="Customer Care" k="care" open={open} toggle={toggle}>
            <div className="flex flex-col gap-3 text-muted-foreground">
              <a href="mailto:Support@lavishnotes.com" className="hover:text-foreground">Support@lavishnotes.com</a>
              <Link href="/contact" className="hover:text-foreground">Contact us</Link>
              <p className="text-sm">Mon – Fri, 9am – 6pm EST</p>
            </div>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-6 md:flex-row md:justify-between md:px-8">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Lavish Notes. All rights reserved.</p>
          <ul className="flex flex-wrap items-center justify-center gap-2" aria-label="Accepted payment methods">
            {paymentMethods.map((p) => (
              <li key={p.alt} className="flex h-7 w-11 items-center justify-center rounded border border-border bg-background px-1">
                <Image src={p.src || '/placeholder.svg'} alt={p.alt} width={40} height={24} className="h-4 w-auto object-contain" />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-sm hover:text-muted-foreground"
          >
            Back to top <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PolicyModal policy={activePolicy} onClose={() => setActivePolicy(null)} />
    </footer>
  )
}

function FooterColumn({
  title,
  k,
  open,
  toggle,
  children,
}: {
  title: string
  k: string
  open: string | null
  toggle: (key: string) => void
  children: React.ReactNode
}) {
  const isOpen = open === k
  return (
    <div className="border-t border-border md:border-0">
      <h3 className="text-base font-medium md:text-lg">
        <button
          type="button"
          onClick={() => toggle(k)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between py-4 text-left md:pointer-events-none md:py-0"
        >
          {title}
          <span className="md:hidden" aria-hidden>{isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
        </button>
      </h3>
      <div className={cn('pb-5 md:mt-5 md:block md:pb-0', isOpen ? 'block' : 'hidden')}>{children}</div>
    </div>
  )
}
