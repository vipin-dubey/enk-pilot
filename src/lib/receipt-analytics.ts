/**
 * Receipt Analytics Utilities
 * Calculate statistics and prepare data for visualization
 */

export interface Receipt {
  id: string
  created_at: string
  vendor: string
  category: string
  amount: number
}

export interface CategoryTotal {
  category: string
  amount: number
  count: number
  percentage: number
}

export interface MonthlyTotal {
  month: string
  total: number
  count: number
}

export interface ReceiptStats {
  totalSpent: number
  receiptCount: number
  averageAmount: number
  categoryTotals: CategoryTotal[]
  monthlyTotals: MonthlyTotal[]
}

/**
 * Calculate category totals and percentages
 */
export function calculateCategoryTotals(receipts: Receipt[]): CategoryTotal[] {
  const categoryMap = new Map<string, { amount: number; count: number }>()
  let grandTotal = 0

  receipts.forEach(receipt => {
    const category = receipt.category || 'Other'
    const existing = categoryMap.get(category) || { amount: 0, count: 0 }
    categoryMap.set(category, {
      amount: existing.amount + receipt.amount,
      count: existing.count + 1
    })
    grandTotal += receipt.amount
  })

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: grandTotal > 0 ? (data.amount / grandTotal) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Calculate monthly totals
 */
export function calculateMonthlyTotals(receipts: Receipt[]): MonthlyTotal[] {
  const monthMap = new Map<string, { total: number; count: number }>()

  receipts.forEach(receipt => {
    const date = new Date(receipt.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('nb-NO', { year: 'numeric', month: 'long' })

    const existing = monthMap.get(monthKey) || { total: 0, count: 0 }
    monthMap.set(monthKey, {
      total: existing.total + receipt.amount,
      count: existing.count + 1
    })
  })

  return Array.from(monthMap.entries())
    .map(([key, data]) => {
      const [year, month] = key.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return {
        month: date.toLocaleDateString('nb-NO', { year: 'numeric', month: 'long' }),
        total: data.total,
        count: data.count
      }
    })
    .sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })
}

/**
 * Calculate overall statistics
 */
export function calculateReceiptStats(receipts: Receipt[]): ReceiptStats {
  const totalSpent = receipts.reduce((sum, r) => sum + r.amount, 0)
  const receiptCount = receipts.length
  const averageAmount = receiptCount > 0 ? totalSpent / receiptCount : 0

  return {
    totalSpent,
    receiptCount,
    averageAmount,
    categoryTotals: calculateCategoryTotals(receipts),
    monthlyTotals: calculateMonthlyTotals(receipts)
  }
}

/**
 * Filter receipts by date range
 */
export function filterReceiptsByDateRange(
  receipts: Receipt[],
  range: 'month' | '3months' | '6months' | 'year' | 'all'
): Receipt[] {
  if (range === 'all') return receipts

  const now = new Date()
  const cutoffDate = new Date()

  switch (range) {
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1)
      break
    case '3months':
      cutoffDate.setMonth(now.getMonth() - 3)
      break
    case '6months':
      cutoffDate.setMonth(now.getMonth() - 6)
      break
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1)
      break
  }

  return receipts.filter(r => new Date(r.created_at) >= cutoffDate)
}
