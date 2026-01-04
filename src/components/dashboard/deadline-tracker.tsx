'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'

const deadlines = [
  { id: 'mva-2025-6', title: 'MVA Period 6 (2025)', date: 'Feb 10, 2026', type: 'MVA' },
  { id: 'tax-2026-1', title: 'Forskuddsskatt 1. termin', date: 'Mar 15, 2026', type: 'Tax' },
  { id: 'mva-2026-1', title: 'MVA Period 1 (2026)', date: 'Apr 10, 2026', type: 'MVA' },
  { id: 'tax-2026-2', title: 'Forskuddsskatt 2. termin', date: 'May 15, 2026', type: 'Tax' },
  { id: 'mva-2026-2', title: 'MVA Period 2 (2026)', date: 'June 10, 2026', type: 'MVA' },
]

export function DeadlineTracker() {
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCompletions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('deadline_completions')
        .select('deadline_id')
        .eq('user_id', user.id)

      if (data) {
        setCompletedIds(data.map(d => d.deadline_id))
      }
      setIsLoading(false)
    }

    fetchCompletions()
  }, [])

  const toggleDeadline = async (deadlineId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isCompleted = completedIds.includes(deadlineId)

    if (isCompleted) {
      // Remove
      const { error } = await supabase
        .from('deadline_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('deadline_id', deadlineId)
      
      if (!error) {
        setCompletedIds(prev => prev.filter(id => id !== deadlineId))
      }
    } else {
      // Add
      const { error } = await supabase
        .from('deadline_completions')
        .insert({ user_id: user.id, deadline_id: deadlineId })
      
      if (!error) {
        setCompletedIds(prev => [...prev, deadlineId])
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Keep track of your Norwegian tax deadlines.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Checkbox 
                    id={deadline.id} 
                    checked={completedIds.includes(deadline.id)}
                    onCheckedChange={() => toggleDeadline(deadline.id)}
                  />
                  <div>
                    <p className={`font-medium ${completedIds.includes(deadline.id) ? 'line-through text-slate-400' : ''}`}>
                      {deadline.title}
                    </p>
                    <p className="text-sm text-slate-500">{deadline.date}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${
                  deadline.type === 'MVA' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {deadline.type}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
