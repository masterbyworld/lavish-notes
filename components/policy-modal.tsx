'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

export type PolicyKey = 'shipping' | 'faq' | 'privacy' | 'refund'

type Block =
  | { type: 'lead'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'qa'; q: string; a: string }
  | { type: 'bullet'; label?: string; text: string }

type Policy = {
  title: string
  subtitle: string
  blocks: Block[]
}

const POLICIES: Record<PolicyKey, Policy> = {
  shipping: {
    title: 'Shipping',
    subtitle: 'Shipping Policy – Velvaroma',
    blocks: [
      { type: 'lead', text: 'At Velvaroma, we aim to process and ship all orders as quickly and efficiently as possible.' },
      { type: 'heading', text: 'Processing Time' },
      { type: 'paragraph', text: 'Orders are typically processed within 1–3 business days after payment confirmation. During high-demand periods, processing times may vary slightly.' },
      { type: 'heading', text: 'Shipping Time' },
      { type: 'paragraph', text: 'Estimated delivery times depend on the destination and shipping carrier. Once your order has been shipped, tracking information will be provided via email.' },
      { type: 'heading', text: 'Shipping Carriers' },
      { type: 'paragraph', text: 'We primarily use trusted carriers such as USPS, UPS, FedEx, and other reliable shipping providers depending on the destination and service availability.' },
      { type: 'heading', text: 'Tracking Information' },
      { type: 'paragraph', text: 'Customers will receive a tracking number once the shipment has been dispatched. Please allow some time for tracking updates to appear within the courier’s system.' },
      { type: 'heading', text: 'Delivery Delays & Courier Issues' },
      { type: 'paragraph', text: 'While we ensure that all orders are shipped on time, Velvaroma is not responsible for delays, lost packages, or delivery issues caused by the shipping carrier after the package has been handed over and accepted by the courier.' },
      { type: 'paragraph', text: 'We maintain proof of shipment and tracking confirmation for every order. If a shipment is delayed or encounters issues while in transit, customers may need to contact the courier directly for further assistance regarding the delivery status.' },
      { type: 'heading', text: 'Incorrect Shipping Information' },
      { type: 'paragraph', text: 'Customers are responsible for providing accurate shipping details at checkout. Velvaroma is not responsible for orders shipped to incorrectly entered addresses.' },
      { type: 'heading', text: 'Contact Us' },
      { type: 'paragraph', text: 'If you have any questions regarding your order or shipping status, please contact us through our website support page.' },
      { type: 'paragraph', text: 'email: support@velvaroma.com\nemail: velvaroma.com@gmail.com\nPhone: +1 213 581 8266' },
    ],
  },
  faq: {
    title: 'FAQ',
    subtitle: 'FAQs – Velvaroma',
    blocks: [
      { type: 'lead', text: 'We want to make your shopping experience as smooth as possible. Below are answers to the most common questions our customers ask.' },
      { type: 'heading', text: 'Product Authenticity' },
      { type: 'qa', q: 'Are your fragrances original?', a: 'Absolutely. We take pride in offering only 100% authentic and genuine designer fragrances. No fakes, no imitations.' },
      { type: 'qa', q: 'How long does the scent typically last?', a: 'Longevity varies by fragrance concentration and skin type, but we curate our collection to prioritize high-quality, long-lasting performance.' },
      { type: 'heading', text: 'Orders & Shipping' },
      { type: 'qa', q: 'How long will it take to receive my order?', a: 'Standard shipping within the USA typically takes 3–7 business days, depending on your location.' },
      { type: 'qa', q: 'Can I change my shipping address after placing an order?', a: 'Please contact us immediately at support@velvaroma.com. If the order hasn’t been processed yet, we will do our best to update it for you.' },
      { type: 'heading', text: 'Returns & Exchanges' },
      { type: 'qa', q: 'What is your return policy?', a: 'We accept returns within 48 hours of delivery only if the product is damaged, defective, or incorrect. Items must be unopened and in original packaging.' },
      { type: 'qa', q: 'Do you offer exchanges?', a: 'Due to the nature of our products, we only replace items if they are defective or damaged upon arrival.' },
      { type: 'heading', text: 'Customer Support' },
      { type: 'qa', q: 'How can I contact you?', a: 'You can reach our support team any time at support@velvaroma.com and we will get back to you as soon as possible.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Privacy Policy – Velvaroma',
    blocks: [
      { type: 'lead', text: 'At Velvaroma, we value your privacy and are committed to protecting your personal information. This policy outlines how we collect, use, and safeguard your data when you visit our store.' },
      { type: 'heading', text: 'Information We Collect' },
      { type: 'bullet', text: 'When you make a purchase, we collect personal information such as your name, shipping address, and email address.' },
      { type: 'bullet', text: 'We automatically receive your computer’s internet protocol (IP) address to help us learn about your browser and operating system.' },
      { type: 'heading', text: 'Consent' },
      { type: 'bullet', label: 'How do you get my consent?', text: 'When you provide personal information to complete a transaction, verify your credit card, or place an order, we imply that you consent to our collecting it and using it for that specific reason only.' },
      { type: 'bullet', label: 'How do I withdraw my consent?', text: 'You may withdraw your consent at any time by contacting us at support@velvaroma.com.' },
      { type: 'heading', text: 'Security' },
      { type: 'bullet', text: 'To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, or altered.' },
      { type: 'bullet', text: 'Your credit card information is encrypted using secure socket layer technology (SSL) and stored with AES-256 encryption.' },
    ],
  },
  refund: {
    title: 'Refund policy',
    subtitle: 'Return, Refund, and Exchange Policy',
    blocks: [
      { type: 'heading', text: 'Detailed Fragrance Return Conditions' },
      { type: 'paragraph', text: 'At our store, your satisfaction is extremely important to us. However, due to strict public health, hygiene, and safety regulations surrounding personal care products, fragrances are subject to specific return guidelines. We can only accept returns, refunds, or exchanges if the product meets the following strict criteria:' },
      { type: 'bullet', label: '100% Unopened & Unused:', text: 'The fragrance must be completely untouched, unsprayed, and unaltered. We cannot accept any bottle that has been sprayed even once, as this compromises the product.' },
      { type: 'bullet', label: 'Original Factory Sealed Packaging:', text: 'The item must be returned in its original retail box with the manufacturer’s cellophane protective plastic wrap fully intact and unbroken. If the seal or plastic wrap is torn, removed, or tampered with, the item is no longer eligible for a return.' },
      { type: 'bullet', label: 'Perfect Resalable Condition:', text: 'The outer packaging, labels, and bottle must show no signs of handling, wear, or damage. It must arrive back at our warehouse in the exact same pristine condition it was delivered to you.' },
      { type: 'heading', text: 'The Return Process & Inspection' },
      { type: 'bullet', label: 'Mandatory Quality Inspection:', text: 'Please note that all returned items undergo a thorough inspection process by our quality assurance team upon arrival. If our team detects that the fragrance has been opened, sprayed, or that the original packaging has been compromised, the return will be rejected, and no refund or exchange will be authorized. In such cases, the item can be shipped back to the customer at their own expense.' },
      { type: 'bullet', label: 'Timeframe:', text: 'To initiate a return, you must contact our customer support team within 30 days of receiving your delivery. Any requests made after this period will unfortunately not be accepted.' },
      { type: 'bullet', label: 'Return Shipping:', text: 'Unless the item arrived damaged during transit, customers are responsible for paying their own return shipping costs. We highly recommend using a trackable shipping service, as we cannot guarantee that we will receive your returned item.' },
    ],
  },
}

export function PolicyModal({
  policy,
  onClose,
}: {
  policy: PolicyKey | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!policy) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [policy, onClose])

  if (!policy) return null
  const data = POLICIES[policy]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 py-10 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={data.title}
    >
      <div
        className="relative w-full max-w-xl rounded-lg bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b border-foreground/10 bg-background px-6 py-4">
          <h2 className="text-lg font-medium text-foreground">{data.title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <h3 className="text-base font-semibold text-foreground">{data.subtitle}</h3>
          <div className="mt-4 space-y-4">
            {data.blocks.map((block, i) => (
              <PolicyBlock key={i} block={block} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PolicyBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'lead':
      return <p className="text-sm leading-relaxed text-foreground/70">{block.text}</p>
    case 'heading':
      return <h4 className="pt-1 text-sm font-semibold text-foreground">{block.text}</h4>
    case 'paragraph':
      return <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/70">{block.text}</p>
    case 'qa':
      return (
        <p className="text-sm leading-relaxed text-foreground/70">
          <span className="font-semibold text-foreground">{block.q}</span> {block.a}
        </p>
      )
    case 'bullet':
      return (
        <div className="flex gap-2.5 text-sm leading-relaxed text-foreground/70">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/40" aria-hidden />
          <p>
            {block.label ? <span className="font-semibold text-foreground">{block.label} </span> : null}
            {block.text}
          </p>
        </div>
      )
    default:
      return null
  }
}
