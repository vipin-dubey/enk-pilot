'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'

export function DashboardHeaderActions({ showSettings = true }: { showSettings?: boolean }) {
  const t = useTranslations('dashboard')
  const [hasHiddenInsights, setHasHiddenInsights] = useState(false)
  const [insightCount, setInsightCount] = useState(0)

  useEffect(() => {
    const checkHidden = () => {
      const hidden = localStorage.getItem('hide_tax_insights') === 'true'
      const count = parseInt(localStorage.getItem('tax_insight_count') || '0', 10)
      setHasHiddenInsights(hidden)
      setInsightCount(count)
    }
    
    checkHidden()
    // Listen for storage changes in the same window
    const interval = setInterval(checkHidden, 1000)
    return () => clearInterval(interval)
  }, [])

  const restoreInsights = () => {
    localStorage.removeItem('hide_tax_insights')
    setHasHiddenInsights(false)
    window.location.reload() // Quickest way to refresh all components
  }

  return (
    <div className="flex items-center gap-2 mr-1">
      {hasHiddenInsights && insightCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={restoreInsights}
          className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold group"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="hidden lg:inline text-[10px] uppercase tracking-wider">Show Insights</span>
          <Badge className="h-4 px-1 bg-blue-600 text-[8px] animate-in zoom-in">{insightCount}</Badge>
        </Button>
      )}

      {showSettings && (
        <Link href="/settings">
          <Button variant="outline" size="sm" className="hidden md:flex gap-2">
            <Settings className="h-4 w-4" />
            {t('settings')}
          </Button>
        </Link>
      )}
    </div>
  )
}
