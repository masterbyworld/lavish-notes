// Generates lib/catalog.json from the Shopify product export (the backup):
//   1. data/source/shopify-backup.csv  -> source of truth (Shopify product CSV export)
//   2. data/source/route-keys.json     -> route key (GA) -> collection + brand
//
// The CSV is also mirrored to data/source/shopify-backup.json so the backup
// stays inspectable in JSON form.
//
// Re-run after replacing the CSV:  node scripts/build-catalog.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parseCsv } from './csv.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))

const csvPath = join(root, 'data/source/shopify-backup.csv')
const backup = existsSync(csvPath)
  ? parseCsv(readFileSync(csvPath, 'utf8'))
  : read('data/source/shopify-backup.json')
if (existsSync(csvPath)) {
  writeFileSync(join(root, 'data/source/shopify-backup.json'), JSON.stringify(backup, null, 2))
}
const routeRows = read('data/source/route-keys.json')

const routeMap = {}
for (const r of routeRows) {
  const key = String(r['Route Key'] || '').trim().toUpperCase()
  const brand = String(r['Brand Name'] || '').trim()
  const collection = String(r['White Collection Name'] || '').trim()
  if (key && collection) routeMap[key] = { brand, collection }
}

const cleanSku = (sku) => String(sku || '').toUpperCase().replace(/\s+/g, '')

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

// "100" | "100 ML" | "100Ml" -> "100ML"; "Default Title" -> "" (single-size product)
function sizeLabel(raw) {
  const s = String(raw || '').trim()
  if (!s || /^default title$/i.test(s)) return ''
  const volume = s.match(/^(\d+)\s*(ml)?$/i)
  return volume ? `${volume[1]}ML` : s
}

function toVariant(row) {
  const sku = cleanSku(row['Variant SKU'])
  const price = Number(row['Variant Price']) || 0
  const compareAt = Number(row['Variant Compare At Price']) || 0
  const qty = Number(row['Variant Inventory Qty']) || 0
  return {
    sku,
    whiteSku: sku.replace(/-B$/, '-W'),
    size: sizeLabel(row['Option1 Value']),
    price,
    compareAt: compareAt > price ? compareAt : 0,
    quantity: qty,
    inStock: qty > 0 || String(row['Variant Inventory Policy']).trim() === 'continue',
  }
}

// A product row carries a Title; following rows with the same Handle add extra
// size variants (Variant SKU set) and/or gallery images.
const products = []
const seenSkus = new Set()
let current = null

for (const row of backup) {
  const handle = String(row['Handle'] || '').trim()
  const title = String(row['Title'] || '').trim()
  const sku = cleanSku(row['Variant SKU'])
  const image = String(row['Image Src'] || '').trim()

  if (title) {
    const status = String(row['Status'] || '').trim()
    if ((status !== 'active' && status !== 'unlisted') || !/^RPM-/.test(sku)) {
      current = null
      continue
    }
    const m = sku.match(/^RPM-([A-Z0-9]+)-/)
    const routeKey = m ? m[1] : ''
    const route = routeMap[routeKey] || null
    current = {
      id: handle,
      handle,
      title,
      brand: route?.brand || 'Lavish Notes',
      routeKey,
      collection: route?.collection || 'Shop With ALL',
      productType: String(row['Type'] || '').trim(),
      category: String(row['Product Category'] || '').trim(),
      image,
      images: image ? [image] : [],
      description: cleanHtml(row['Body (HTML)']),
      excerpt: toText(row['Body (HTML)']).slice(0, 200),
      status,
      variants: [],
    }
    products.push(current)
  }

  if (!current || handle !== current.handle) continue

  if (/^RPM-/.test(sku) && !seenSkus.has(sku)) {
    seenSkus.add(sku)
    current.variants.push(toVariant(row))
  }
  if (image && !current.images.includes(image)) current.images.push(image)
  if (!current.image && image) current.image = image
}

// Default variant (first listed) drives the product-level summary fields.
const catalogProducts = products
  .filter((p) => p.variants.length > 0)
  .map((p) => {
    const d = p.variants[0]
    return {
      ...p,
      whiteSku: d.whiteSku,
      blackSku: d.sku,
      price: d.price,
      compareAt: d.compareAt,
      discountPct: d.compareAt > d.price ? Math.round((1 - d.price / d.compareAt) * 100) : 0,
      size: d.size,
      inStock: p.variants.some((v) => v.inStock),
    }
  })

const collections = []
const seen = new Set()
for (const r of routeRows) {
  const key = String(r['Route Key'] || '').trim().toUpperCase()
  const name = String(r['White Collection Name'] || '').trim()
  const brand = String(r['Brand Name'] || '').trim()
  if (!key || !name || seen.has(key)) continue
  seen.add(key)
  const count = catalogProducts.filter((p) => p.routeKey === key).length
  collections.push({ key, name, brand, count })
}

const brands = collections
  .filter((c) => c.brand && c.brand !== 'All Products' && c.count > 0)
  .map((c) => ({ name: c.brand, key: c.key, collection: c.name, count: c.count }))

const variantCount = catalogProducts.reduce((n, p) => n + p.variants.length, 0)

mkdirSync(join(root, 'lib'), { recursive: true })
writeFileSync(
  join(root, 'lib/catalog.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      productCount: catalogProducts.length,
      variantCount,
      collections,
      brands,
      products: catalogProducts,
    },
    null,
    2,
  ),
)

console.log(`[catalog] ${catalogProducts.length} products, ${variantCount} variants`)
console.log(`[catalog] ${catalogProducts.filter((p) => p.variants.length > 1).length} multi-size products`)
console.log(`[catalog] ${collections.length} collections, ${brands.length} brands`)
console.log(
  `[catalog] ${catalogProducts.filter((p) => !routeMap[p.routeKey]).length} products with unmapped route key -> Shop With ALL`,
)
