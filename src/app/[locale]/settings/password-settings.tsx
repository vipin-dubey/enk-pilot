'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, AlertCircle, Save } from 'lucide-react'
import { updatePassword } from './actions'

export function PasswordSettings() {
  const t = useTranslations('settingsPage')
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setStatus('idle')
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)
    const result = await updatePassword(formData)

    setIsSaving(false)
    if (result.success) {
      setStatus('success')
      event.currentTarget.reset()
    } else {
      setStatus('error')
      setErrorMessage(t(result.error as any))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t('newPassword')}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder={t('passwordPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
          />
        </div>

        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t('updatePassword')}
        </Button>
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
          <CheckCircle2 className="h-4 w-4" />
          {t('passwordUpdateSuccess')}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          <AlertCircle className="h-4 w-4" />
          {errorMessage || t('passwordUpdateError')}
        </div>
      )}
    </form>
  )
}
