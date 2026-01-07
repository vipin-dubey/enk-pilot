'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, CheckCircle2, AlertCircle, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getUpcomingDeadlines, formatDeadlineDate, type Deadline } from '@/lib/deadlines'
import { useTranslations, useLocale } from 'next-intl'
import { TaxHealthCheck } from './tax-health-check'

type DeadlineFilter = 'all' | 'mva' | 'forskuddsskatt'

export function DeadlineTracker() {
  const t = useTranslations('deadlines')
  const tMonths = useTranslations('months')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [filter, setFilter] = useState<DeadlineFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showAllDeadlines, setShowAllDeadlines] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchDeadlines()
  }, [])

  async function fetchDeadlines() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all upcoming deadlines
      const allDeadlines = getUpcomingDeadlines()

      // Fetch user's paid submissions
      const { data: submissions } = await supabase
        .from('deadline_submissions')
        .select('deadline_type, deadline_date')
        .eq('user_id', user.id)

      // Merge deadline data with submission status
      const deadlinesWithStatus: Deadline[] = allDeadlines.map(deadline => ({
        ...deadline,
        isPaid: submissions?.some(
          s => s.deadline_type === deadline.type && 
               s.deadline_date === formatDeadlineDate(deadline.date)
        ) || false
      }))

      setDeadlines(deadlinesWithStatus)
    } catch (error) {
      console.error('Error fetching deadlines:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleDeadline(deadline: Deadline) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      if (deadline.isPaid) {
        // Unmark as paid
        await supabase
          .from('deadline_submissions')
          .delete()
          .eq('user_id', user.id)
          .eq('deadline_type', deadline.type)
          .eq('deadline_date', formatDeadlineDate(deadline.date))
      } else {
        // Mark as paid
        await supabase
          .from('deadline_submissions')
          .insert({
            user_id: user.id,
            deadline_type: deadline.type,
            deadline_date: formatDeadlineDate(deadline.date),
            marked_paid_at: new Date().toISOString()
          })
      }

      // Update local state
      setDeadlines(deadlines.map(d =>
        d.id === deadline.id ? { ...d, isPaid: !d.isPaid } : d
      ))
    } catch (error) {
      console.error('Error toggling deadline:', error)
    }
  }

  const filteredDeadlines = deadlines.filter(d => {
    if (filter === 'all') return true
    return d.type === filter
  })

  const groupedDeadlines = useMemo(() => {
    const groups: Record<string, Deadline[]> = {}
    
    // Sort filtered deadlines by date first
    const sorted = [...filteredDeadlines].sort((a, b) => a.date.getTime() - b.date.getTime())
    
    sorted.forEach(d => {
      const month = d.date.getMonth()
      const quarter = Math.floor(month / 3) + 1
      const year = d.date.getFullYear()
      const key = `${year}-Q${quarter}` 
      
      if (!groups[key]) groups[key] = []
      groups[key].push(d)
    })
    
    return groups
  }, [filteredDeadlines])

  function getStatusBadge(deadline: Deadline) {
    if (deadline.isPaid) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {t('paid')}
        </Badge>
      )
    }
    if (deadline.isOverdue) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          {t('overdue')}
        </Badge>
      )
    }
    if (deadline.isUpcoming) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          {t('upcoming')}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-slate-500">
        <Calendar className="h-3 w-3 mr-1" />
        {t('future')}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as DeadlineFilter)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allDeadlines')}</SelectItem>
              <SelectItem value="mva">{t('mvaOnly')}</SelectItem>
              <SelectItem value="forskuddsskatt">{t('forskuddsskattOnly')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <TaxHealthCheck />
        
        <div className="border-t pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">{tCommon('loading')}</div>
          ) : filteredDeadlines.length === 0 ? (
          <div className="text-center py-8 text-slate-400">{t('noDeadlines', { defaultValue: 'No deadlines found' })}</div>
        ) : (
          <div className="space-y-8">
            {(Object.entries(groupedDeadlines) as [string, Deadline[]][]).map(([key, quarterDeadlines]) => {
              const [year, qPart] = key.split('-')
              const qNumber = qPart.replace('Q', '')
              
              const currentMonth = new Date().getMonth()
              const currentQuarter = Math.floor(currentMonth / 3) + 1
              const currentYear = new Date().getFullYear()
              
              const isFuture = Number(year) > currentYear || (Number(year) === currentYear && Number(qNumber) > currentQuarter)
              
              if (isFuture && !showAllDeadlines) return null

              return (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-2">
                       <div className="w-1 h-4 bg-blue-600 rounded-full" />
                       {t('quarter', { number: qNumber })} {year}
                       {Number(year) === currentYear && Number(qNumber) === currentQuarter && (
                         <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[8px] uppercase font-black px-1.5 h-4">
                           Active
                         </Badge>
                       )}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                      {quarterDeadlines.length} {t('deadlinesSuffix')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {quarterDeadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className={`flex items-center justify-between p-3 border rounded-xl transition-all duration-200 ${
                          deadline.isPaid 
                            ? 'bg-slate-50 border-slate-200 opacity-70 grayscale-[0.5]' 
                            : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={deadline.isPaid}
                            onCheckedChange={() => toggleDeadline(deadline)}
                            className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          <div className="flex-1">
                            <p className={`text-sm font-bold font-outfit ${deadline.isPaid ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {deadline.type === 'mva' ? 'MVA' : 'Forskuddsskatt'} - {tMonths(deadline.date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase())}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                              {deadline.date.toLocaleDateString(locale === 'nb' ? 'nb-NO' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(deadline)}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isLoading && filteredDeadlines.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAllDeadlines(!showAllDeadlines)}
              className="group h-10 px-6 rounded-xl font-bold bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all font-outfit uppercase tracking-wider text-[11px]"
            >
              {showAllDeadlines ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                  {t('hideFuture')}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  {t('showFuture')}
                </>
              )}
            </Button>
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  )
}
