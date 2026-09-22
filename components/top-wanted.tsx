import { CollectionPicker } from '@/components/collection-picker'

export function TopWanted() {
  return (
    <section className="bg-secondary/40 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <CollectionPicker
          defaultBrand="Louis Vuitton"
          eyebrow="Loved by thousands"
          heading="Top Wanted Collection"
        />
      </div>
    </section>
  )
}
