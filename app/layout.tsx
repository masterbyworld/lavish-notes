import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Jost } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import { CartDrawer } from '@/components/cart-drawer'
import { AnnouncementProvider } from '@/lib/announcement-context'
import './globals.css'

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: 'Lavish Notes — Luxury Designer Inspired Perfumes',
  description:
    'Lavish Notes offers premium designer-inspired perfumes — Baccarat, Creed, Sospiro, Parfums de Marly and more. Buy 2 Get 1 Free. Free shipping over $80.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jost.variable} bg-background`}>
      <body className="antialiased">
        <AnnouncementProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AnnouncementProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
