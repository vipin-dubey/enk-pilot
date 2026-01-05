/**
 * Norwegian Store Recognition Database
 * Comprehensive list of Norwegian retail stores for vendor extraction
 */

export const NORWEGIAN_STORES = {
  // Grocery Stores
  grocery: [
    'REMA 1000',
    'KIWI',
    'MENY',
    'BUNNPRIS',
    'EXTRA',
    'COOP',
    'COOP MEGA',
    'COOP PRIX',
    'COOP OBS',
    'JOKER',
    'SPAR',
    'EUROPRIS',
  ],

  // Electronics & Tech
  electronics: [
    'ELKJØP',
    'POWER',
    'KOMPLETT',
    'LEFDAL',
    'EXPERT',
    'MULTICOM',
    'DUSTIN HOME',
  ],

  // Hardware & DIY
  hardware: [
    'CLAS OHLSON',
    'BILTEMA',
    'JERNIA',
    'BYGGMAKKER',
    'MAXBO',
    'OBS BYGG',
    'MONTÉR',
  ],

  // Fashion & Clothing
  fashion: [
    'H&M',
    'CUBUS',
    'LINDEX',
    'KappAhl',
    'DRESSMANN',
    'CARLINGS',
    'GINA TRICOT',
    'BIK BOK',
    'VERO MODA',
    'JACK & JONES',
    'VOLT',
    'SKORINGEN',
    'SKORINGEN', // Common OCR variation
    'DIN SKO',
    'EURO SKO',
    'NILSON GROUP',
  ],

  // Pharmacies
  pharmacy: [
    'APOTEK 1',
    'BOOTS',
    'VITUSAPOTEK',
    'APOTEK HJERTE',
  ],

  // Gas Stations
  fuel: [
    'CIRCLE K',
    'SHELL',
    'ESSO',
    'YX',
    'ST1',
    'BEST',
    'UNO-X',
  ],

  // Restaurants & Fast Food
  food: [
    'MCDONALD',
    'BURGER KING',
    'PEPPES PIZZA',
    'DOLLY DIMPLE',
    'PIZZA HUT',
    'SUBWAY',
    'KFC',
    'EGON',
    'OLIVIA',
    'PEPPE',
  ],

  // Coffee Shops
  coffee: [
    'STARBUCKS',
    'ESPRESSO HOUSE',
    'KAFFEBRENNERIET',
    'WAYNE',
    'STOCKFLETHS',
  ],

  // Bookstores & Office
  books: [
    'ARK',
    'NORLI',
    'TANUM',
    'AKADEMIKA',
  ],

  // Furniture & Home
  furniture: [
    'IKEA',
    'JYSK',
    'SKEIDAR',
    'BOHUS',
    'MØBELRINGEN',
    'FAGMØBLER',
  ],

  // Sports & Outdoor
  sports: [
    'XXL',
    'INTERSPORT',
    'G-SPORT',
    'STADIUM',
    'SPORTSHUSET',
    'ANTON SPORT',
  ],

  // Online Services
  online: [
    'KOMPLETT.NO',
    'ZALANDO',
    'BOOZT',
    'AMAZON',
    'EBAY',
    'ALIEXPRESS',
    'WISH',
  ],

  // Transportation
  transport: [
    'VY',
    'NSB',
    'RUTER',
    'KOLUMBUS',
    'SKYSS',
    'ATB',
    'BRAKAR',
  ],

  // Hotels
  hotels: [
    'THON',
    'SCANDIC',
    'RADISSON',
    'CLARION',
    'COMFORT',
    'QUALITY',
  ],

  // Other Retail
  other: [
    'NILLE',
    'NORMAL',
    'FLYING TIGER',
    'SØSTRENE GRENE',
    'RUSTA',
    'PLANTASJEN',
    'MESTER GRØNN',
  ],
}

// Flatten all stores into a single searchable array and ensure uniqueness
export const ALL_STORES = [...new Set(Object.values(NORWEGIAN_STORES).flat())]

// Create regex patterns for vendor detection
export const VENDOR_PATTERNS = ALL_STORES.map(store => ({
  name: store,
  pattern: new RegExp(store.replace(/\s+/g, '\\s*'), 'i')
}))

/**
 * Extract vendor name from OCR text
 * Searches only the top portion of the receipt where store names typically appear
 * Uses word boundaries to avoid false matches (e.g., "spar" in "Du sparer")
 */
export function extractVendor(text: string): string | null {
  // Split text into lines and take only the first 20% (header section)
  const lines = text.split('\n')
  const headerLines = Math.max(5, Math.ceil(lines.length * 0.2))
  const headerText = lines.slice(0, headerLines).join('\n')

  const matches: { name: string; length: number; position: number }[] = []

  for (const { name, pattern } of VENDOR_PATTERNS) {
    // Create a word-boundary pattern to avoid partial matches
    // e.g., "SPAR" should match "SPAR" but not "Du sparer"
    const wordBoundaryPattern = new RegExp(`\\b${name.replace(/\s+/g, '\\s*')}\\b`, 'i')

    const match = headerText.match(wordBoundaryPattern)
    if (match && match.index !== undefined) {
      matches.push({
        name,
        length: name.length,
        position: match.index
      })
    }
  }

  // Return the match that appears earliest in the header (closest to top)
  // If multiple matches at same position, prefer the longest
  if (matches.length > 0) {
    matches.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position - b.position // Earlier position wins
      }
      return b.length - a.length // Longer name wins if same position
    })
    return matches[0].name
  }

  return null
}

/**
 * Auto-detect category based on vendor
 */
export function detectCategory(vendor: string | null): string {
  if (!vendor) return 'Other'

  const vendorUpper = vendor.toUpperCase()

  // Check each category
  if (NORWEGIAN_STORES.grocery.some(s => vendorUpper.includes(s))) return 'Food'
  if (NORWEGIAN_STORES.electronics.some(s => vendorUpper.includes(s))) return 'Equipment'
  if (NORWEGIAN_STORES.hardware.some(s => vendorUpper.includes(s))) return 'Equipment'
  if (NORWEGIAN_STORES.fuel.some(s => vendorUpper.includes(s))) return 'Travel'
  if (NORWEGIAN_STORES.transport.some(s => vendorUpper.includes(s))) return 'Travel'
  if (NORWEGIAN_STORES.hotels.some(s => vendorUpper.includes(s))) return 'Travel'
  if (NORWEGIAN_STORES.books.some(s => vendorUpper.includes(s))) return 'Office'
  if (NORWEGIAN_STORES.coffee.some(s => vendorUpper.includes(s))) return 'Food'
  if (NORWEGIAN_STORES.food.some(s => vendorUpper.includes(s))) return 'Food'
  if (NORWEGIAN_STORES.online.some(s => vendorUpper.includes(s))) return 'Equipment'

  return 'Other'
}
