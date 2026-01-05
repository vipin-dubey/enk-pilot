'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, CheckCircle2, AlertCircle, Clock, Filter } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getUpcomingDeadlines, formatDeadlineDate, type Deadline } from '@/lib/deadlines'
import { useTranslations, useLocale } from 'next-intl'

type DeadlineFilter = 'all' | 'mva' | 'forskuddsskatt'

export function DeadlineTracker() {
  const t = useTranslations('deadlines')
  const tMonths = useTranslations('months')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [filter, setFilter] = useState<DeadlineFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
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
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">{tCommon('loading')}</div>
        ) : filteredDeadlines.length === 0 ? (
          <div className="text-center py-8 text-slate-400">{t('noDeadlines', { defaultValue: 'No deadlines found' })}</div>
        ) : (
          <div className="space-y-2">
            {filteredDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  deadline.isPaid ? 'bg-green-50 border-green-200' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    checked={deadline.isPaid}
                    onCheckedChange={() => toggleDeadline(deadline)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${deadline.isPaid ? 'line-through text-slate-500' : ''}`}>
                      {deadline.type === 'mva' ? 'MVA' : 'Forskuddsskatt'} - {tMonths(deadline.date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase())} {deadline.date.getFullYear()}
                    </p>
                    <p className="text-xs text-slate-500">
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
        )}
      </CardContent>
    </Card>
  )
}
