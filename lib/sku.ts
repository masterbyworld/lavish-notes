// SKU base = the SKU without whitespace and without its -B / -W channel suffix.
// "RPM-CR-0011-B" and "RPM-CR-0011-W" share the base "RPM-CR-0011".
export function skuBase(sku: string | null | undefined): string {
  return String(sku || '')
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/-[BW]$/, '')
}

// Comparable size key: "100 ML" | "100ml" | "100" -> "100". Non-volume labels lowercase.
export function sizeKey(size: string | null | undefined): string {
  const s = String(size || '').trim()
  const volume = s.match(/(\d+)\s*(ml)?/i)
  if (volume) return volume[1]
  return /^default title$/i.test(s) ? '' : s.toLowerCase()
}
