'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, ShieldAlert, Loader2, QrCode, Smartphone, Check } from 'lucide-react'
import { enrollMfa, verifyMfaAndEnable, unenrollMfa, getMfaFactors } from './mfa-actions'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/navigation'

interface MfaSettingsProps {
  isPro: boolean
}

export function MfaSettings({ isPro }: MfaSettingsProps) {
  const t = useTranslations('mfa')
  const [factors, setFactors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollData, setEnrollData] = useState<any>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    loadFactors()
  }, [])

  async function loadFactors() {
    try {
      const data = await getMfaFactors()
      setFactors(data.totp || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const activeFactor = factors.find(f => f.status === 'verified')

  async function handleStartEnroll() {
    setBusy(true)
    setError('')
    try {
      const data = await enrollMfa()
      setEnrollData(data)
    } catch (err: any) {
      setError(err.message || 'Enrollment failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleVerifyAndEnable() {
    if (!enrollData || !verificationCode) return
    setBusy(true)
    setError('')
    try {
      await verifyMfaAndEnable(enrollData.id, verificationCode)
      setEnrollData(null)
      setVerificationCode('')
      await loadFactors()
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDisable() {
    if (!activeFactor) return
    if (!confirm(t('disable') + '?')) return
    setBusy(true)
    setError('')
    try {
      await unenrollMfa(activeFactor.id)
      await loadFactors()
    } catch (err: any) {
      setError(err.message || 'Unenrollment failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking 2FA status...</span>
      </div>
    )
  }

  if (!isPro) {
    return (
      <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-blue-100/50 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-blue-50">
            <Smartphone className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-slate-900 font-outfit">{t('title')}</h4>
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none text-[9px] uppercase font-black px-2 py-0.5 shadow-sm">
                Pro
              </Badge>
            </div>
            <p className="text-xs text-slate-500 leading-normal mb-4">
              {t('proFeatureDesc')}
            </p>
            <Button size="sm" disabled className="bg-slate-900 hover:bg-black text-white font-bold h-9 text-xs px-4 rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98]">
              {t('upgradeNow') || 'Upgrade to Enable'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (enrollData) {
    return (
      <div className="p-6 bg-white rounded-2xl border-2 border-blue-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg">{t('enrollTitle')}</h4>
          <Button variant="ghost" size="sm" onClick={() => setEnrollData(null)}>Cancel</Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-white p-2 rounded-xl border-4 border-slate-50 shadow-sm">
              <img
                src={enrollData.totp.qr_code}
                alt="2FA QR Code"
                className="w-40 h-40"
              />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('enrollStep1')}
              </p>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Manual Key</span>
                <code className="bg-slate-50 px-2 py-1 rounded text-xs font-mono text-slate-700 break-all">
                  {enrollData.totp.secret}
                </code>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm font-bold text-slate-900 mb-2">{t('enrollStep2')}</p>
            <div className="flex gap-2">
              <Input
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center font-mono text-lg tracking-[0.5em] h-12"
              />
              <Button
                onClick={handleVerifyAndEnable}
                disabled={busy || verificationCode.length !== 6}
                className="px-8 h-12 bg-blue-600 hover:bg-blue-700"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t('verify')}
              </Button>
            </div>
            {error && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> {error}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-xl border transition-all ${activeFactor ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${activeFactor ? 'bg-emerald-100' : 'bg-slate-200'}`}>
            {activeFactor ? <ShieldCheck className="h-5 w-5 text-emerald-600" /> : <Smartphone className="h-5 w-5 text-slate-500" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-slate-900">{t('title')}</h4>
              {activeFactor && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[8px] uppercase font-black uppercase">Active</Badge>}
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">
              {activeFactor ? t('statusEnabled') : t('statusDisabled')}
            </p>
            {!activeFactor ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEnroll}
                disabled={busy}
                className="font-bold text-xs"
              >
                {busy && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                <QrCode className="h-3 w-3 mr-2" />
                {t('enable')}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisable}
                disabled={busy}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs"
              >
                {busy && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                {t('disable')}
              </Button>
            )}
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-2 flex items-center gap-1 pl-14"><ShieldAlert className="h-3 w-3" /> {error}</p>}
    </div>
  )
}
