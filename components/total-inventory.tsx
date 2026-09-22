import { CollectionPicker } from '@/components/collection-picker'

export function TotalInventory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <CollectionPicker defaultBrand="Bond No. 9" heading="Define Signature" />
    </section>
  )
}
