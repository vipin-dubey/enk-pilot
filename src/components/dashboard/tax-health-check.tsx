'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'
import { AlertTriangle, CheckCircle2, TrendingUp, Settings, ArrowRight, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import { calculateAnnualTax } from '@/lib/tax-calculations'
import { Progress } from '@/components/ui/progress'

export function TaxHealthCheck() {
  const t = useTranslations('deadlines.healthCheck')
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile for health check:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return null

  // If user hasn't set up estimated profit, show setup prompt
  if (!profile?.estimated_annual_profit || profile.estimated_annual_profit <= 0) {
    return (
      <Card className="bg-slate-50 border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Settings className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{t('setupRequired')}</p>
              <p className="text-sm text-slate-500">{t('setupRequiredSubtitle')}</p>
            </div>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-2">
                {t('action')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate Health
  const ytdProfit = (profile.ytd_gross_income || 0) + (profile.external_salary_income || 0) - (profile.ytd_expenses || 0)
  
  // Project annual profit based on how far we are into the year
  // Smoothing: Early in the year (first 30 days), spikes can cause wild projections.
  // We use a minimum divisor of 14 days to stabilize the early trend analysis.
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const daysPassed = Math.max(1, Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)))
  const smoothedDaysPassed = daysPassed < 14 ? 14 : daysPassed
  const projectedAnnualProfit = (ytdProfit / smoothedDaysPassed) * 365
  
  const estimatedProfit = profile.estimated_annual_profit || 1
  const currentPrepaidTax = profile.annual_prepaid_tax_amount || 0
  
  // Calculate projected tax vs original estimated tax
  const projectedAnnualTax = calculateAnnualTax(projectedAnnualProfit)
  const estimatedAnnualTax = calculateAnnualTax(estimatedProfit)
  
  const taxDifference = projectedAnnualTax - estimatedAnnualTax
  const isOverEarning = projectedAnnualProfit > estimatedProfit * 1.1 // Show warning if 10% higher
  
  const progressPercent = Math.min(100, Math.round((ytdProfit / estimatedProfit) * 100))
  
  // Check if settings need review (older than 90 days)
  const lastUpdated = new Date(profile.updated_at || profile.created_at)
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
  const needsReview = daysSinceUpdate > 90

  return (
    <Card className={`overflow-hidden border-none shadow-md ${isOverEarning ? 'bg-amber-50' : 'bg-emerald-50'}`}>
      <div className={`h-1.5 w-full ${isOverEarning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOverEarning ? (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
            <CardTitle className={`text-lg font-bold font-outfit ${isOverEarning ? 'text-amber-900' : 'text-emerald-900'}`}>
              {t('title')}
            </CardTitle>
          </div>
          <Badge variant="outline" className={isOverEarning ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}>
            {progressPercent}% of target
          </Badge>
        </div>
        <CardDescription className={isOverEarning ? 'text-amber-700/80' : 'text-emerald-700/80'}>
          {isOverEarning 
            ? t('projectedConflictSubtitle', { projected: Math.round(projectedAnnualProfit).toLocaleString() })
            : t('onTrackSubtitle')
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>YTD Profit: {Math.round(ytdProfit).toLocaleString()} NOK</span>
            <span>Target: {estimatedProfit.toLocaleString()} NOK</span>
          </div>
          <Progress value={progressPercent} className={`h-2 ${isOverEarning ? 'bg-amber-200' : 'bg-emerald-200'}`} />
        </div>

        {isOverEarning && (
          <div className="p-3 rounded-lg bg-white/50 border border-amber-200 text-sm text-amber-900">
            <p className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <strong>{t('recommendation', { amount: Math.round(taxDifference).toLocaleString() })}</strong>
            </p>
          </div>
        )}

        {!isOverEarning && (
          <div className="p-3 rounded-lg bg-white/50 border border-emerald-200 text-sm text-emerald-900">
            <p className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {t('onTrack')}
            </p>
          </div>
        )}

        {needsReview && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>It's been {daysSinceUpdate} days since you last reviewed your tax estimate.</span>
            </div>
            <Link href="/settings">
              <Button variant="link" size="sm" className="h-auto p-0 text-blue-700 font-bold">
                Review Now
              </Button>
            </Link>
          </div>
        )}

        <p className="text-[10px] text-slate-400 text-center italic">
          {daysPassed < 14 
            ? `* Early year projection based on ${daysPassed} days (using 14-day smoothing).`
            : `* Projection based on ${daysPassed} days of actual data.`
          }
        </p>
      </CardContent>
    </Card>
  )
}
