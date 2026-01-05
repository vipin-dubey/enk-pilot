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
  'Other': 'bg-gray-100 text-gray-700 border-gray-200',
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other

  return (
    <Badge 
      variant="outline" 
      className={cn(colorClass, 'font-medium', className)}
    >
      {category}
    </Badge>
  )
}
