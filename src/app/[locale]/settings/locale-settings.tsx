'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { updateDefaultLocale } from './actions'

export function LocaleSettings({ initialLocale }: { initialLocale: string }) {
  const t = useTranslations('settingsPage')
  const [locale, setLocale] = useState(initialLocale)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    setIsSaving(true)
    setStatus('idle')
    const result = await updateDefaultLocale(locale)
    setIsSaving(false)
    if (result.success) {
      setStatus('success')
    } else {
      setStatus('error')
    }
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
      <div className="space-y-1">
        <Label className="text-base font-semibold">{t('defaultLocale')}</Label>
        <p className="text-sm text-slate-500">{t('defaultLocaleDescription')}</p>
      </div>

      <div className="flex gap-4">
        <Select value={locale} onValueChange={setLocale}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nb">🇳🇴 Norsk</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSave} disabled={isSaving || locale === initialLocale} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t('updateLanguage')}
        </Button>
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
          <CheckCircle2 className="h-4 w-4" />
          {t('localeUpdateSuccess')}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          <AlertCircle className="h-4 w-4" />
          {t('localeUpdateError')}
        </div>
      )}
    </div>
  )
}
