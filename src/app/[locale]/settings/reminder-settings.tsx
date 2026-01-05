'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Loader2, AlertCircle, Bell, Mail, Monitor, Calendar } from 'lucide-react'
import { updateNotificationSettings } from './actions'

interface ReminderSettingsProps {
  initialSettings: {
    emailEnabled: boolean
    pushEnabled: boolean
    leadDays: number[]
  }
}

export function ReminderSettings({ initialSettings }: ReminderSettingsProps) {
  const t = useTranslations('reminderSettings')
  const [emailEnabled, setEmailEnabled] = useState(initialSettings.emailEnabled)
  const [pushEnabled, setPushEnabled] = useState(initialSettings.pushEnabled)
  const [leadDays, setLeadDays] = useState<number[]>(initialSettings.leadDays)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const toggleLeadDay = (day: number) => {
    setLeadDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    setStatus('idle')
    const result = await updateNotificationSettings({
      emailEnabled,
      pushEnabled,
      leadDays
    })
    setIsSaving(false)
    if (result.success) {
      setStatus('success')
    } else {
      setStatus('error')
    }
  }

  const isChanged = 
    emailEnabled !== initialSettings.emailEnabled || 
    pushEnabled !== initialSettings.pushEnabled || 
    JSON.stringify(leadDays) !== JSON.stringify(initialSettings.leadDays)

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <Label className="text-base font-semibold">{t('title')}</Label>
        </div>
        <p className="text-sm text-slate-500">{t('description')}</p>
      </div>

      <div className="space-y-4 pt-2">
        {/* Email Reminders */}
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="pt-0.5">
            <Checkbox 
              id="emailReminders" 
              checked={emailEnabled} 
              onCheckedChange={(checked) => setEmailEnabled(!!checked)}
            />
          </div>
          <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => setEmailEnabled(!emailEnabled)}>
            <label htmlFor="emailReminders" className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              {t('emailReminders')}
            </label>
            <p className="text-xs text-slate-500">
              {t('emailDescription')}
            </p>
          </div>
        </div>

        {/* Push Reminders */}
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="pt-0.5">
            <Checkbox 
              id="pushReminders" 
              checked={pushEnabled} 
              onCheckedChange={(checked) => setPushEnabled(!!checked)}
            />
          </div>
          <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => setPushEnabled(!pushEnabled)}>
            <label htmlFor="pushReminders" className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer">
              <Monitor className="h-3.5 w-3.5 text-slate-400" />
              {t('pushReminders')}
            </label>
            <p className="text-xs text-slate-500">
              {t('pushDescription')}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-semibold">{t('leadDays')}</h4>
          </div>
          <p className="text-xs text-slate-500 mb-3">{t('leadDaysDescription')}</p>
          
          <div className="flex flex-wrap gap-2">
            {[1, 3, 7, 14, 30].map((day) => (
              <Badge
                key={day}
                variant={leadDays.includes(day) ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 text-sm font-medium transition-all"
                onClick={() => toggleLeadDay(day)}
              >
                {day === 1 ? t('day', { count: day }) : t('days', { count: day })}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !isChanged} 
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t('saveSuccess').replace('saved', 'Update').replace('lagret', 'Oppdater')}
        </Button>
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="h-4 w-4" />
          {t('saveSuccess')}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-in shake">
          <AlertCircle className="h-4 w-4" />
          {t('saveError')}
        </div>
      )}
    </div>
  )
}
