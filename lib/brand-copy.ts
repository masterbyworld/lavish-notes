const TAGLINES: Record<string, string> = {
  'Tom Ford': 'Bold, Sensual & Unapologetically Modern',
  'Bond No. 9': 'The Spirit of New York in Every Bottle',
  Creed: 'Timeless Elegance & Royal Heritage',
  'Louis Vuitton': 'The Art of Travel, Captured in Scent',
  MFK: 'Parisian Craftsmanship, Pure Radiance',
  'Parfums de Marly': 'Inspired by the Grandeur of Versailles',
  YSL: 'Daring Couture Attitude',
  Chanel: 'Iconic Parisian Sophistication',
  Dior: 'The Essence of French Haute Couture',
  'All Inventory': 'Every House, One Destination',
}

export function brandTagline(name: string) {
  return TAGLINES[name] ?? 'Signature Scents, Exceptional Value'
}
