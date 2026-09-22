import Image from 'next/image'
import { brands } from '@/lib/products'

export function BrandMarquee() {
  const loop = [...brands, ...brands]
  return (
    <section className="overflow-hidden border-y border-border py-12">
      <div className="relative flex overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-16 px-8">
          {loop.map((b, i) => (
            <div key={`${b.name}-${i}`} className="flex h-16 w-32 shrink-0 items-center justify-center">
              {b.logo ? (
                <Image
                  src={b.logo || '/placeholder.svg'}
                  alt={b.name}
                  width={128}
                  height={64}
                  className="h-full w-full object-contain opacity-60 transition-opacity hover:opacity-100"
                />
              ) : (
                <span className="whitespace-nowrap text-base font-medium text-foreground/50 transition-colors hover:text-foreground">
                  {b.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
