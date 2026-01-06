'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslations } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react'

interface BusinessSettingsProps {
  initialSettings: {
    isMvaRegistered: boolean
    ytdGrossIncome: number
    ytdExpenses: number
    externalSalary: number
  }
}

export function BusinessSettings({ initialSettings }: BusinessSettingsProps) {
  const t = useTranslations('settingsPage')
  const [isMvaRegistered, setIsMvaRegistered] = useState(initialSettings.isMvaRegistered)
  const [ytdGrossIncome, setYtdGrossIncome] = useState(initialSettings.ytdGrossIncome.toString())
  const [ytdExpenses, setYtdExpenses] = useState(initialSettings.ytdExpenses.toString())
  const [externalSalary, setExternalSalary] = useState(initialSettings.externalSalary.toString())
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    setIsSaving(true)
    setStatus('idle')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          is_mva_registered: isMvaRegistered,
          ytd_gross_income: parseFloat(ytdGrossIncome) || 0,
          ytd_expenses: parseFloat(ytdExpenses) || 0,
          external_salary_income: parseFloat(externalSalary) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error('Failed to update business settings:', err)
      setStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="mva-status" className="font-bold">{t('mvaStatus')}</Label>
            <p className="text-xs text-slate-500">{t('mvaDescription')}</p>
          </div>
          <Checkbox 
            id="mva-status" 
            checked={isMvaRegistered} 
            onCheckedChange={(checked) => setIsMvaRegistered(checked as boolean)}
            className="h-5 w-5"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ytd-income" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('ytdIncome')}
            </Label>
            <div className="relative">
              <Input
                id="ytd-income"
                type="number"
                value={ytdGrossIncome}
                onChange={(e) => setYtdGrossIncome(e.target.value)}
                className="font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">NOK</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ytd-expenses" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('ytdExpenses')}
            </Label>
            <div className="relative">
              <Input
                id="ytd-expenses"
                type="number"
                value={ytdExpenses}
                onChange={(e) => setYtdExpenses(e.target.value)}
                className="font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">NOK</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="external-salary" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t('externalSalary')}
          </Label>
          <div className="relative">
            <Input
              id="external-salary"
              type="number"
              value={externalSalary}
              onChange={(e) => setExternalSalary(e.target.value)}
              className="font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">NOK / YEAR</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex-1">
            {status === 'success' && (
              <div className="flex items-center gap-2 text-sm text-green-600 animate-in fade-in slide-in-from-left-2 transition-all">
                <CheckCircle2 className="h-4 w-4" />
                {t('saveSuccess')}
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {t('saveError')}
              </div>
            )}
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2 px-8 font-bold rounded-xl"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
