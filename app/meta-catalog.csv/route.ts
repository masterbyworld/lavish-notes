import { products } from '@/lib/products'
import { getLiveCatalog } from '@/lib/live-catalog'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE = 'https://shop.lavishnotes.com'

const HEADERS = [
  'id',
  'item_group_id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'sale_price',
  'link',
  'image_link',
  'additional_image_link',
  'brand',
  'size',
  'quantity_to_sell_on_facebook',
  'google_product_category',
  'product_type',
  'gender',
]

function cell(value: string | number): string {
  const s = String(value ?? '')
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function money(n: number) {
  return `${n.toFixed(2)} USD`
}

function absolute(src: string) {
  if (!src) return ''
  return src.startsWith('http') ? src : `${SITE}${src.startsWith('/') ? '' : '/'}${src}`
}

export async function GET() {
  const live = await getLiveCatalog({ fresh: true })
  const rows: string[] = [HEADERS.join(',')]

  for (const p of products) {
    const multi = p.variants.length > 1
    for (const v of p.variants) {
      const lv = live.variants.get(v.sku)
      const price = lv?.price ?? v.price
      const compareAt = lv?.compareAt ?? v.compareAt
      const inStock = lv?.inStock ?? v.inStock
      const quantity = lv?.quantity ?? v.quantity
      const hasSale = compareAt > price
      const link = `${SITE}/product/${p.slug}${multi ? `?sku=${encodeURIComponent(v.sku)}` : ''}`
      const description = (p.description || `${p.name} — inspired by ${p.inspiredBy}`).replace(/\s+/g, ' ').trim()

      rows.push(
        [
          v.whiteSku || v.sku,
          p.whiteSku || p.slug,
          multi ? `${p.name} - ${v.sizeLabel}` : p.name,
          description,
          inStock ? 'in stock' : 'out of stock',
          'new',
          money(hasSale ? compareAt : price),
          hasSale ? money(price) : '',
          link,
          absolute(p.image),
          p.images.slice(1, 10).map(absolute).join(','),
          p.brand || 'Lavish Notes',
          v.sizeLabel,
          Math.max(0, quantity),
          'Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne',
          p.collection || p.family,
          p.gender === 'Men' ? 'male' : p.gender === 'Women' ? 'female' : 'unisex',
        ]
          .map(cell)
          .join(','),
      )
    }
  }

  return new Response(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Catalog-Source': live.source,
      'X-Catalog-Matched': `${live.report.matched}/${live.report.totalVariants}`,
    },
  })
}
