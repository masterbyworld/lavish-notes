'use client'

import Image from 'next/image'
import { CountdownInline } from '@/components/countdown'

const messages = [
  'Exclusive Deals',
  'Buy any two of your favourite fragrances',
  'and get One Free',
  'Your favourite luxury scents',
]

export function PromoMarquee() {
  const sequence = [...messages, ...messages]
  return (
    <div className="overflow-hidden border-b border-border bg-primary py-2.5 text-primary-foreground">
      <div className="flex w-max marquee-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {sequence.map((msg, i) => (
              <span key={`${dup}-${i}`} className="flex items-center">
                <span className="whitespace-nowrap px-6 text-sm font-medium tracking-wide">{msg}</span>
                <Image
                  src="/logo.png"
                  alt=""
                  width={90}
                  height={40}
                  className="h-7 w-auto shrink-0 opacity-90 invert"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2 text-xs tracking-wide text-primary-foreground/90">
        <span aria-hidden>⚡</span>
        <span>Flash sale ends in</span>
        <CountdownInline />
      </div>
    </div>
  )
}
