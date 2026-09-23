// Generates lib/catalog.json by joining three source datasets:
//   1. data/source/route-keys.json    -> route key (GA) -> collection + brand
//   2. data/source/sku-map.json        -> White SKU (-W) <-> Black SKU (-B)
//   3. data/source/shopify-backup.json -> real product data keyed by Black SKU
//
// Re-run after updating any source file:  node scripts/build-catalog.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))

const routeRows = read('data/source/route-keys.json')
const skuRows = read('data/source/sku-map.json')
const backup = read('data/source/shopify-backup.json')

// 1. Route key -> { brand, collection }
const routeMap = {}
for (const r of routeRows) {
  const key = String(r['Route Key'] || '').trim().toUpperCase()
  const brand = String(r['Brand Name'] || '').trim()
  const collection = String(r['White Collection Name'] || '').trim()
  if (key && collection) routeMap[key] = { brand, collection }
}

// 2. Black SKU -> White SKU (from explicit map, with -W/-B convention as fallback)
const blackToWhite = {}
for (const r of skuRows) {
  const white = String(r['White Product SKU ID'] || '').trim()
  const black = String(r['Black Product SKU ID'] || '').trim()
  if (/^RPM-.+-W$/.test(white) && /^RPM-.+-B$/.test(black)) blackToWhite[black] = white
}

const cleanHtml = (html) =>
  String(html || '')
    .replace(/<!---->/g, '')
    .replace(/<div class="attachment-container[^>]*>[\s\S]*?<\/div>/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()

const toText = (html) =>
  cleanHtml(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// 3. Walk the backup. A product row carries a Title + Variant SKU (-B);
//    following rows with the same Handle and no Title are extra gallery images.
const products = []
let current = null

for (const row of backup) {
  const handle = String(row['Handle'] || '').trim()
  const sku = String(row['Variant SKU'] || '').trim()
  const title = String(row['Title'] || '').trim()
  const image = String(row['Image Src'] || '').trim()

  if (title && /^RPM-.+-B$/.test(sku)) {
    const m = sku.match(/^RPM-([A-Z0-9]+)-\d+-B$/)
    const routeKey = m ? m[1].toUpperCase() : ''
    const route = routeMap[routeKey] || null
    const status = String(row['Status'] || '').trim()
    if (status !== 'active' && status !== 'unlisted') {
      current = null
      continue
    }
    const price = Number(row['Variant Price']) || 0
    const compareAt = Number(row['Variant Compare At Price']) || 0
    const qty = Number(row['Variant Inventory Qty']) || 0
    const size = row['Option1 Value'] ? `${String(row['Option1 Value']).trim()}ML` : ''
    const whiteSku = blackToWhite[sku] || sku.replace(/-B$/, '-W')

    current = {
      id: handle,
      handle,
      title,
      brand: route?.brand || 'Lavish Notes',
      routeKey,
      collection: route?.collection || 'Shop With ALL',
      whiteSku,
      blackSku: sku,
      price,
      compareAt: compareAt > price ? compareAt : 0,
      discountPct: compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0,
      size,
      image,
      images: image ? [image] : [],
      description: cleanHtml(row['Body (HTML)']),
      excerpt: toText(row['Body (HTML)']).slice(0, 200),
      status,
      inStock: qty > 0,
    }
    products.push(current)
  } else if (current && handle === current.handle && image) {
    if (!current.images.includes(image)) current.images.push(image)
    if (!current.image) current.image = image
  }
}

// Collections index (ordered by the route-key sheet), with product counts
const collections = []
const seen = new Set()
for (const r of routeRows) {
  const key = String(r['Route Key'] || '').trim().toUpperCase()
  const name = String(r['White Collection Name'] || '').trim()
  const brand = String(r['Brand Name'] || '').trim()
  if (!key || !name || seen.has(key)) continue
  seen.add(key)
  const count = products.filter((p) => p.routeKey === key).length
  collections.push({ key, name, brand, count })
}

const brands = collections
  .filter((c) => c.brand && c.brand !== 'All Products' && c.count > 0)
  .map((c) => ({ name: c.brand, key: c.key, collection: c.name, count: c.count }))

const out = {
  generatedAt: new Date().toISOString(),
  productCount: products.length,
  collections,
  brands,
  products,
}

mkdirSync(join(root, 'lib'), { recursive: true })
writeFileSync(join(root, 'lib/catalog.json'), JSON.stringify(out, null, 2))

console.log(`[catalog] ${products.length} products`)
console.log(`[catalog] ${collections.length} collections, ${brands.length} brands`)
const noRoute = products.filter((p) => !routeMap[p.routeKey]).length
console.log(`[catalog] ${noRoute} products with unmapped route key -> Shop With ALL`)
