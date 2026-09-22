import catalog from './catalog.json'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Product = {
  slug: string
  name: string
  inspiredBy: string
  brand: string
  routeKey: string
  collection: string
  gender: 'Men' | 'Women' | 'Unisex'
  family: string
  price: number
  compareAt: number
  image: string
  images: string[]
  badge?: 'Best Seller' | 'New' | 'Pre-Order'
  rating: number
  reviews: number
  description: string
  notes: { top: string[]; heart: string[]; base: string[] }
  // SKU routing — White SKU shows on the storefront, Black SKU is the real
  // backend/Shopify product that the order is substituted to at checkout.
  whiteSku: string
  blackSku: string
  size: string
  inStock: boolean
}

type RawProduct = (typeof catalog)['products'][number]

export const SIZES = [
  { ml: 50, label: '50ML', multiplier: 1 },
  { ml: 100, label: '100ML', multiplier: 1.4 },
  { ml: 200, label: '200ML', multiplier: 2.1 },
] as const

export const DEFAULT_SIZE = '100ML'

// ---------------------------------------------------------------------------
// Derivation helpers — the Shopify backup has no rating/gender/notes, so we
// derive stable, deterministic display values from the product's own data.
// ---------------------------------------------------------------------------

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function deriveRating(seed: number): number {
  // Skew towards 5 stars, occasionally 4.
  return seed % 5 === 0 ? 4 : 5
}

function deriveReviews(seed: number): number {
  return 40 + (seed % 560)
}

function deriveGender(text: string): Product['gender'] {
  const t = text.toLowerCase()
  if (/\b(women|woman|for her|pour femme|femme|elle|her edition)\b/.test(t)) return 'Women'
  if (/\b(men|man|for him|homme|pour homme|his edition)\b/.test(t)) return 'Men'
  return 'Unisex'
}

const FAMILY_RULES: [RegExp, string][] = [
  [/\boud\b|agarwood/i, 'Oud Amber'],
  [/vanilla|tonka|praline/i, 'Amber Vanilla'],
  [/rose|jasmine|floral|peony|tuberose/i, 'Floral'],
  [/vetiver|cedar|sandalwood|woody|patchouli/i, 'Woody Aromatic'],
  [/citrus|bergamot|marine|aquatic|sea/i, 'Fresh Aquatic'],
  [/amber|resin|incense/i, 'Amber'],
  [/spice|saffron|cardamom|pepper|cinnamon/i, 'Woody Spicy'],
]

function deriveFamily(text: string): string {
  for (const [re, label] of FAMILY_RULES) if (re.test(text)) return label
  return 'Eau de Parfum'
}

function stripHtml(html: string): string {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function deriveBadge(p: RawProduct, seed: number): Product['badge'] {
  if (!p.inStock) return 'Pre-Order'
  if (p.discountPct >= 55) return 'Best Seller'
  if (seed % 7 === 0) return 'New'
  return undefined
}

function toProduct(p: RawProduct): Product {
  const seed = hash(p.blackSku || p.handle)
  const text = `${p.title} ${p.excerpt}`
  return {
    slug: p.handle,
    name: p.title,
    inspiredBy: `Inspired by ${p.brand}`,
    brand: p.brand,
    routeKey: p.routeKey,
    collection: p.collection, // Real "White Collection Name" tied to the SKU route key.
    gender: deriveGender(text),
    family: deriveFamily(text),
    price: p.price,
    compareAt: p.compareAt,
    image: p.image || '/placeholder.svg',
    images: p.images.length ? p.images : [p.image || '/placeholder.svg'],
    badge: deriveBadge(p, seed),
    rating: deriveRating(seed),
    reviews: deriveReviews(seed),
    description: stripHtml(p.description) || p.excerpt,
    notes: { top: [], heart: [], base: [] },
    whiteSku: p.whiteSku,
    blackSku: p.blackSku,
    size: p.size,
    inStock: p.inStock,
  }
}

// ---------------------------------------------------------------------------
// Catalog — 291 real products sorted into brand collections by SKU route key.
// ---------------------------------------------------------------------------

export const products: Product[] = (catalog.products as RawProduct[]).map(toProduct)

const bySlug = new Map(products.map((p) => [p.slug, p]))
const byWhiteSku = new Map(products.map((p) => [p.whiteSku, p]))

// "Top Wanted" — most-reviewed, in-stock products (10 for the homepage grid).
export const topWanted: Product[] = [...products]
  .filter((p) => p.inStock)
  .sort((a, b) => b.reviews - a.reviews)
  .slice(0, 10)

// "Our Winning Products" — the highest-converting hero picks (best sellers by
// discount depth), used in the featured editorial section.
export const winningProducts: Product[] = (() => {
  const ranked = [...products]
    .filter((p) => p.inStock)
    .sort((a, b) => discountPercent(b) - discountPercent(a) || b.reviews - a.reviews)
  // Creed Absolu Aventus is the pinned #1 best seller (hero) per merchandising.
  const hero = bySlug.get('collection-perfume')
  if (!hero) return ranked.slice(0, 5)
  const rest = ranked.filter((p) => p.slug !== hero.slug)
  return [hero, ...rest].slice(0, 5)
})()

// Brands that actually have products, ordered by the route-key sheet.
const BRAND_LOGOS: Record<string, string> = {
  Creed: '/brands/creed.png',
  MFK: '/brands/mfk.jpg',
  'Parfums de Marly': '/brands/parfums-de-marly.jpg',
  'Louis Vuitton': '/brands/louis-vuitton.jpg',
  'Giorgio Armani': '/brands/armani.jpg',
  'Bond No. 9': '/brands/bond-no9.jpg',
}

export type BrandInfo = { name: string; key: string; count: number; logo?: string }

export const brands: BrandInfo[] = (catalog.brands as { name: string; key: string; count: number }[])
  .filter((b) => b.count > 0)
  .map((b) => ({ name: b.name, key: b.key, count: b.count, logo: BRAND_LOGOS[b.name] }))

// ---------------------------------------------------------------------------
// Collections — driven by the SKU route key. A product with SKU `RPM-YS-0001-B`
// has route key `YS`, which maps to the "Vanilla Collection" (YSL). Every
// collection lists ONLY the products whose SKU carries its route key.
// ---------------------------------------------------------------------------

export type CollectionInfo = {
  key: string // SKU route key, e.g. "YS"
  name: string // Clean "White Collection Name" — used ONLY for Shopify checkout, e.g. "Vanilla Collection"
  displayName: string // What customers see on the storefront — the brand, e.g. "YSL"
  brand: string
  count: number
  logo?: string
}

export const collectionsCatalog: CollectionInfo[] = (
  catalog.collections as { key: string; name: string; brand: string; count: number }[]
)
  .filter((c) => c.count > 0)
  .map((c) => ({
    key: c.key,
    name: c.name,
    displayName: c.brand,
    brand: c.brand,
    count: c.count,
    logo: BRAND_LOGOS[c.brand],
  }))

const byRouteKey = new Map(collectionsCatalog.map((c) => [c.key, c]))

export function productsByRouteKey(key: string) {
  return products.filter((p) => p.routeKey === key)
}

export function getCollectionByKey(key: string) {
  return byRouteKey.get(key)
}

// "The Fragrance Collection" chips — real White Collection Names, route-key aware.
export const collections: CollectionInfo[] = collectionsCatalog

// "Explore Categories" — brand-led tiles (brand name is the title the customer sees).
export const categories = brands.map((b) => ({ title: b.name, brand: b.name, logo: b.logo }))

// The 6 flagship collections that have a real logo — used in the auto-playing
// "Explore Categories" marquee on the homepage.
export const logoCategories = categories.filter((c) => Boolean(c.logo)) as {
  title: string
  brand: string
  logo: string
}[]

// "Premium Collections" tabs — the brands with the deepest catalogs.
export const featuredBrands: string[] = [...brands]
  .sort((a, b) => b.count - a.count)
  .slice(0, 4)
  .map((b) => b.name)

// ---------------------------------------------------------------------------
// Reviews (static social proof)
// ---------------------------------------------------------------------------

export type Review = {
  name: string
  rating: number
  title: string
  body: string
}

export const reviews: Review[] = [
  { name: 'Isabella Crawford', rating: 5, title: 'Simply Divine', body: 'I was skeptical about ordering online but I am so glad I did. It’s feminine, elegant, and I get compliments every time I leave the house. Definitely a premium experience from start to finish.' },
  { name: 'James Miller', rating: 5, title: 'Incredible Value', body: 'You usually have to pay triple the price for this kind of longevity. The notes are distinct and high-quality. Shipping to Texas was very quick. I’ll be a returning customer for sure.' },
  { name: 'Natalie Scott', rating: 5, title: 'Impressive Longevity', body: 'The scent profile is very sophisticated. I compared it to the one I bought at a high-end mall, and the quality is identical. Highly recommend if you want luxury scents without the ridiculous markup.' },
  { name: 'Daniel Reeves', rating: 5, title: 'My New Signature', body: 'Ordered three and got one free. The projection is insane — people ask what I’m wearing all day. This is now my everyday scent and I couldn’t be happier.' },
  { name: 'Sophia Bennett', rating: 5, title: 'Beautifully Packaged', body: 'Arrived faster than expected and the packaging felt genuinely luxurious. The fragrance lasts a full workday on me. Velvaroma has earned a loyal customer.' },
  { name: 'Marcus Lane', rating: 5, title: 'Exceeded Expectations', body: 'I’ve tried a lot of inspired fragrances and most fade in an hour. This one performs like the real thing. The buy two get one free deal sealed it for me.' },
  { name: 'Olivia Hayes', rating: 5, title: 'Absolutely Worth It', body: 'Elegant, long-lasting, and the customer service was so helpful when I asked about sizing. I’ve already recommended it to my whole family.' },
]

// ---------------------------------------------------------------------------
// Videos — feature four in-stock products.
// ---------------------------------------------------------------------------

function pickVideoProduct(preferredBrand: string, fallbackIndex: number): Product {
  return products.find((p) => p.brand === preferredBrand && p.inStock) ?? products[fallbackIndex]
}

export const videos = [
  { src: '/videos/v1.mp4', product: pickVideoProduct('Creed', 0) },
  { src: '/videos/v2.mp4', product: pickVideoProduct('Tom Ford', 1) },
  { src: '/videos/v3.mp4', product: pickVideoProduct('Louis Vuitton', 2) },
  { src: '/videos/v4.mp4', product: pickVideoProduct('YSL', 3) },
]

// ---------------------------------------------------------------------------
// Lookups & formatting
// ---------------------------------------------------------------------------

export function getProduct(slug: string) {
  return bySlug.get(slug)
}

export function getProductByWhiteSku(sku: string) {
  return byWhiteSku.get(sku)
}

export function productsByBrand(brand: string) {
  return products.filter((p) => p.brand === brand)
}

// Customer-dependent recommendations: prefer products from the SAME brand as the
// one being viewed (e.g. more Creed on a Creed page), then fall back to the same
// scent family, then anything in stock — so the row is never empty.
export function relatedProducts(slug: string, limit = 8): Product[] {
  const current = bySlug.get(slug)
  if (!current) return products.slice(0, limit)
  const sameBrand = products.filter((p) => p.slug !== slug && p.brand === current.brand)
  if (sameBrand.length >= limit) return sameBrand.slice(0, limit)
  const sameFamily = products.filter(
    (p) => p.slug !== slug && p.brand !== current.brand && p.family === current.family,
  )
  const rest = products.filter(
    (p) => p.slug !== slug && p.brand !== current.brand && p.family !== current.family,
  )
  return [...sameBrand, ...sameFamily, ...rest].slice(0, limit)
}

export function discountPercent(p: Pick<Product, 'price' | 'compareAt'>) {
  if (!p.compareAt || p.compareAt <= p.price) return 0
  return Math.round((1 - p.price / p.compareAt) * 100)
}

export function formatPrice(value: number) {
  return `$${value.toFixed(2)} USD`
}
