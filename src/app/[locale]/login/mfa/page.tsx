'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyMfaChallenge } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function MfaPage() {
  const t = useTranslations('mfa')
  const searchParams = useSearchParams()
  const factorId = searchParams.get('factorId')
  const errorMsg = searchParams.get('error')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorMsg || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!factorId || code.length !== 6) return
    
    setLoading(true)
    setError('')
    try {
      await verifyMfaChallenge(factorId, code)
    } catch (err: any) {
      // Ignore NEXT_REDIRECT error as it's intended behavior for a redirect
      if (err.message?.includes('NEXT_REDIRECT')) return
      
      setError(err.message || 'Verification failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="text-center bg-white pb-2 pt-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-black font-outfit tracking-tight">
            {t('challengeTitle')}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium px-4">
            {t('challengeDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white pt-6 pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder={t('challengePlaceholder')}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                className="text-center font-mono text-3xl h-16 tracking-[0.4em] rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black text-lg rounded-xl shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98]"
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                t('challengeButton')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
