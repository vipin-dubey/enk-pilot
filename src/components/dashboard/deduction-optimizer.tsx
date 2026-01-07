'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Home, Car, TrendingDown, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import { calculateAnnualTax } from '@/lib/tax-calculations'
import { useRouter } from 'next/navigation'

const DEDUCTION_CONSTANTS = {
  HOME_OFFICE: 2050,
  MILEAGE_RATE: 3.50, // Standard ENK rate for private car usage in Norway
  MAX_MILEAGE_CAP: 6000, // Ceiling for the simplified km-deduction
}

export function DeductionOptimizer() {
  const t = useTranslations('deductions')
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()
  const router = useRouter()

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
      console.error('Error fetching profile for deductions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDeduction = async (field: string, value: any) => {
    setIsUpdating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user.id)

      if (error) {
        console.error('Supabase Update Error:', error.message, error.details)
        alert(`Database Error: ${error.message}. Have you applied the latest SQL migrations?`)
        throw error
      }
      
      setProfile((prev: any) => ({ ...prev, [field]: value }))
      router.refresh()
    } catch (error: any) {
      console.error('Error updating deduction:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) return (
    <Card className="bg-slate-50/50 border-dashed">
      <CardContent className="py-10 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400 mb-2" />
        <p className="text-sm text-slate-500">{t('loading')}</p>
      </CardContent>
    </Card>
  )

  const ytdProfit = (profile?.ytd_gross_income || 0) + (profile?.external_salary_income || 0) - (profile?.ytd_expenses || 0)
  
  // Calculate total virtual deductions
  let virtualDeductions = 0
  if (profile?.has_home_office) virtualDeductions += DEDUCTION_CONSTANTS.HOME_OFFICE
  
  const effectiveMileage = Math.min(profile?.estimated_annual_mileage || 0, DEDUCTION_CONSTANTS.MAX_MILEAGE_CAP)
  const isOverCeiling = (profile?.estimated_annual_mileage || 0) > DEDUCTION_CONSTANTS.MAX_MILEAGE_CAP
  const mileageDeduction = effectiveMileage * DEDUCTION_CONSTANTS.MILEAGE_RATE
  virtualDeductions += mileageDeduction

  // Current annual tax projection (annualized ytd)
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const daysPassed = Math.max(1, Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)))
  const smoothedDays = Math.max(14, daysPassed)
  
  const projectedProfitNoDeductions = (ytdProfit / smoothedDays) * 365
  const projectedProfitWithDeductions = Math.max(0, projectedProfitNoDeductions - virtualDeductions)
  
  const taxNoDeductions = calculateAnnualTax(projectedProfitNoDeductions)
  const taxWithDeductions = calculateAnnualTax(projectedProfitWithDeductions)
  const annualSavings = Math.max(0, taxNoDeductions - taxWithDeductions)

  return (
    <Card className="overflow-hidden border-none shadow-premium bg-gradient-to-br from-indigo-50/50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold font-outfit text-indigo-900">{t('title')}</CardTitle>
            <CardDescription className="text-indigo-700/70">{t('description')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {/* Home Office */}
          <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${profile?.has_home_office ? 'bg-indigo-50 border-indigo-200' : 'bg-white hover:bg-slate-50'}`}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${profile?.has_home_office ? 'bg-indigo-600' : 'bg-slate-100'}`}>
              <Home className={`h-5 w-5 ${profile?.has_home_office ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className={`font-bold ${profile?.has_home_office ? 'text-indigo-900' : 'text-slate-900'}`}>{t('homeOffice')}</p>
                <Checkbox 
                  checked={profile?.has_home_office}
                  onCheckedChange={(checked) => toggleDeduction('has_home_office', !!checked)}
                  disabled={isUpdating}
                  className="h-5 w-5"
                />
              </div>
              <p className="text-xs text-slate-500">{t('homeOfficeDesc', { amount: DEDUCTION_CONSTANTS.HOME_OFFICE })}</p>
              {profile?.has_home_office && (
                <Badge variant="secondary" className="bg-indigo-200/50 text-indigo-700 hover:bg-indigo-200/50 border-none font-bold text-[10px]">
                  {t('applied')}
                </Badge>
              )}
            </div>
          </div>

          {/* Business Mileage */}
          <div className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${profile?.estimated_annual_mileage > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-white hover:bg-slate-50'}`}>
            <div className="flex items-start gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${profile?.estimated_annual_mileage > 0 ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                <Car className={`h-5 w-5 ${profile?.estimated_annual_mileage > 0 ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className={`font-bold ${profile?.estimated_annual_mileage > 0 ? 'text-indigo-900' : 'text-slate-900'}`}>{t('mileage')}</p>
                </div>
                <p className="text-xs text-slate-500">{t('mileageDesc')}</p>
              </div>
            </div>
            
            <div className="pl-14 flex items-center gap-3">
              <div className="relative max-w-[120px]">
                <input 
                  type="number"
                  placeholder="0"
                  value={profile?.estimated_annual_mileage || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    toggleDeduction('estimated_annual_mileage', val as any)
                  }}
                  className="w-full bg-white/50 border rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">KM</span>
              </div>
              <p className="text-[10px] text-indigo-600 font-bold">
                {Math.round(mileageDeduction).toLocaleString()} NOK deduction
              </p>
            </div>

            {isOverCeiling && (
              <div className="pl-14 pr-4">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[9px] text-amber-800 leading-tight">
                    <strong>Ceiling reached (6,000 km).</strong> If you drive more than 6,000 km for business, Skatteetaten considers your car a business asset. Different rules apply.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Savings Card */}
        {virtualDeductions > 0 ? (
          <div className="bg-indigo-900 rounded-2xl p-6 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingDown className="h-20 w-20" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">{t('savings')}</p>
                <h4 className="text-3xl font-bold font-outfit">
                  {Math.round(annualSavings).toLocaleString()} NOK <span className="text-sm font-normal text-indigo-300">saved/year</span>
                </h4>
              </div>
              <div className="flex items-center gap-2 text-sm text-indigo-100 bg-white/10 p-2 rounded-lg border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{t('savingsDesc', { amount: virtualDeductions })}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed text-center space-y-3">
            <p className="text-sm text-slate-500">Enable deductions to see your potential tax savings.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-bold"
              onClick={() => toggleDeduction('has_home_office', true)}
            >
              {t('apply')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
