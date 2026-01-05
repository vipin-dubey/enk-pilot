/**
 * Receipt Date Extraction and Grouping Utilities
 */

export interface GroupedReceipts {
  [year: string]: {
    [month: string]: any[]
  }
}

/**
 * Extract date from OCR text
 * Tries multiple Norwegian and international date formats
 */
export function extractReceiptDate(text: string): Date | null {
  // Norwegian format: DD.MM.YYYY (most common)
  const norwegianPattern = /(\d{2})\.(\d{2})\.(\d{4})/
  const norwegianMatch = text.match(norwegianPattern)
  if (norwegianMatch) {
    const [_, day, month, year] = norwegianMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (isValidDate(date)) return date
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const slashDashPattern = /(\d{2})[-/](\d{2})[-/](\d{4})/
  const slashDashMatch = text.match(slashDashPattern)
  if (slashDashMatch) {
    const [_, day, month, year] = slashDashMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (isValidDate(date)) return date
  }

  // YYYY-MM-DD (ISO format)
  const isoPattern = /(\d{4})[-/](\d{2})[-/](\d{2})/
  const isoMatch = text.match(isoPattern)
  if (isoMatch) {
    const [_, year, month, day] = isoMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (isValidDate(date)) return date
  }

  // Norwegian month names: "5 januar 2026"
  const norwegianMonthPattern = /(\d{1,2})\s+(januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember)\s+(\d{4})/i
  const norwegianMonthMatch = text.match(norwegianMonthPattern)
  if (norwegianMonthMatch) {
    const [_, day, monthName, year] = norwegianMonthMatch
    const monthMap: { [key: string]: number } = {
      januar: 0, februar: 1, mars: 2, april: 3, mai: 4, juni: 5,
      juli: 6, august: 7, september: 8, oktober: 9, november: 10, desember: 11
    }
    const month = monthMap[monthName.toLowerCase()]
    if (month !== undefined) {
      const date = new Date(parseInt(year), month, parseInt(day))
      if (isValidDate(date)) return date
    }
  }

  // English month names: "5 January 2026"
  const englishMonthPattern = /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i
  const englishMonthMatch = text.match(englishMonthPattern)
  if (englishMonthMatch) {
    const [_, day, monthAbbr, year] = englishMonthMatch
    const monthMap: { [key: string]: number } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    }
    const month = monthMap[monthAbbr.toLowerCase().slice(0, 3)]
    if (month !== undefined) {
      const date = new Date(parseInt(year), month, parseInt(day))
      if (isValidDate(date)) return date
    }
  }

  return null
}

/**
 * Validate that a date is reasonable (not in far future/past)
 */
function isValidDate(date: Date): boolean {
  const now = new Date()
  const tenYearsAgo = new Date(now.getFullYear() - 10, 0, 1)
  const oneYearFromNow = new Date(now.getFullYear() + 1, 11, 31)

  return date >= tenYearsAgo && date <= oneYearFromNow
}

/**
 * Group receipts by year and month
 */
export function groupReceiptsByDate(receipts: any[]): GroupedReceipts {
  const grouped: GroupedReceipts = {}

  receipts.forEach(receipt => {
    // Use receipt_date if available, otherwise fall back to created_at
    const dateStr = receipt.receipt_date || receipt.created_at
    const date = new Date(dateStr)

    const year = date.getFullYear().toString()
    const monthNum = date.getMonth()
    const month = date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase()

    if (!grouped[year]) grouped[year] = {}
    if (!grouped[year][month]) grouped[year][month] = []

    grouped[year][month].push(receipt)
  })

  return grouped
}

/**
 * Get sorted years (newest first)
 */
export function getSortedYears(grouped: GroupedReceipts): string[] {
  return Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a))
}

/**
 * Get sorted months for a year (chronological order)
 */
export function getSortedMonths(yearData: { [month: string]: any[] }): string[] {
  const monthOrder = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]

  return Object.keys(yearData).sort((a, b) => {
    const aIndex = monthOrder.findIndex(m => a.toLowerCase().includes(m))
    const bIndex = monthOrder.findIndex(m => b.toLowerCase().includes(m))
    return aIndex - bIndex
  })
}

/**
 * Format date for database storage (YYYY-MM-DD)
 * Uses local date components to avoid timezone shifts
 */
export function formatDateForDB(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
