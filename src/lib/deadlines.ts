/**
 * Norwegian Tax Deadline Utilities
 * Handles MVA and Forskuddsskatt deadline calculations
 */

export interface Deadline {
  id: string
  type: 'mva' | 'forskuddsskatt'
  date: Date
  label: string
  isPaid: boolean
  isOverdue: boolean
  isUpcoming: boolean
}

// MVA deadlines: bi-monthly on the 10th
export const MVA_DEADLINES = [
  { month: 1, day: 10, label: 'MVA - January' },
  { month: 3, day: 10, label: 'MVA - March' },
  { month: 5, day: 10, label: 'MVA - May' },
  { month: 7, day: 10, label: 'MVA - July' },
  { month: 9, day: 10, label: 'MVA - September' },
  { month: 11, day: 10, label: 'MVA - November' },
]

// Forskuddsskatt deadlines: quarterly on the 15th
export const FORSKUDDSSKATT_DEADLINES = [
  { month: 3, day: 15, label: 'Forskuddsskatt - March' },
  { month: 5, day: 15, label: 'Forskuddsskatt - May' },
  { month: 9, day: 15, label: 'Forskuddsskatt - September' },
  { month: 11, day: 15, label: 'Forskuddsskatt - November' },
]

/**
 * Generate all deadlines for a given year
 */
export function generateDeadlinesForYear(year: number): Omit<Deadline, 'isPaid'>[] {
  const deadlines: Omit<Deadline, 'isPaid'>[] = []

  // Add MVA deadlines
  MVA_DEADLINES.forEach(({ month, day, label }) => {
    const date = new Date(year, month - 1, day)
    deadlines.push({
      id: `mva-${year}-${month}-${day}`,
      type: 'mva',
      date,
      label: `${label} ${year}`,
      isOverdue: isOverdue(date),
      isUpcoming: isUpcoming(date, 14),
    })
  })

  // Add Forskuddsskatt deadlines
  FORSKUDDSSKATT_DEADLINES.forEach(({ month, day, label }) => {
    const date = new Date(year, month - 1, day)
    deadlines.push({
      id: `forskuddsskatt-${year}-${month}-${day}`,
      type: 'forskuddsskatt',
      date,
      label: `${label} ${year}`,
      isOverdue: isOverdue(date),
      isUpcoming: isUpcoming(date, 14),
    })
  })

  return deadlines.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * Get upcoming deadlines for current and next year
 */
export function getUpcomingDeadlines(): Omit<Deadline, 'isPaid'>[] {
  const currentYear = new Date().getFullYear()
  const currentDeadlines = generateDeadlinesForYear(currentYear)
  const nextYearDeadlines = generateDeadlinesForYear(currentYear + 1)

  return [...currentDeadlines, ...nextYearDeadlines]
}

/**
 * Check if a deadline is overdue (past date and not paid)
 */
export function isOverdue(deadline: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return deadline < today
}

/**
 * Check if a deadline is upcoming within specified days
 */
export function isUpcoming(deadline: Date, days: number = 14): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const futureDate = new Date(today)
  futureDate.setDate(futureDate.getDate() + days)

  return deadline >= today && deadline <= futureDate
}

/**
 * Format deadline date for database storage (YYYY-MM-DD)
 */
export function formatDeadlineDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
