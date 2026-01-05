import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: string
  className?: string
}

const CATEGORY_COLORS = {
  'Office': 'bg-blue-100 text-blue-700 border-blue-200',
  'Travel': 'bg-purple-100 text-purple-700 border-purple-200',
  'Food': 'bg-green-100 text-green-700 border-green-200',
  'Equipment': 'bg-orange-100 text-orange-700 border-orange-200',
  'Marketing': 'bg-pink-100 text-pink-700 border-pink-200',
  'IT': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Other': 'bg-gray-100 text-gray-700 border-gray-200',
}

const KNOWN_CATEGORIES = ['all', 'office', 'travel', 'food', 'equipment', 'marketing', 'it', 'other']

import { useTranslations } from 'next-intl'

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const t = useTranslations('categories')
  const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other
  const lowerCategory = category.toLowerCase()
  const isKnown = KNOWN_CATEGORIES.includes(lowerCategory)

  return (
    <Badge 
      variant="outline" 
      className={cn(colorClass, 'font-medium', className)}
    >
      {isKnown ? t(lowerCategory as any) : category}
    </Badge>
  )
}
