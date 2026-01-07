'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { calculateAnnualTax } from '@/lib/tax-calculations'
import { useTranslations, useLocale } from 'next-intl'
import { TrendingUp, TrendingDown, Wallet, Receipt, ShieldCheck, Scale, Info, AlertCircle } from 'lucide-react'

export function DashboardSummary() {
  const t = useTranslations('dashboardSummary')
  const locale = useLocale()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setIsLoading(false)
    }
    fetchProfile()
  }, [])

  if (isLoading || !profile) return null

  // Calculations
  const gross = profile.ytd_gross_income || 0
  const expenses = profile.ytd_expenses || 0
  const externalSalary = profile.external_salary_income || 0
  const netProfit = gross - expenses
  
  // Project annual profit for tax context
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const daysPassed = Math.max(1, Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)))
  const smoothedDays = Math.max(14, daysPassed)
  
  const projectedBusinessProfit = (netProfit / smoothedDays) * 365
  const totalAnnualProjectedProfit = projectedBusinessProfit + externalSalary
  const totalTaxableProfit = totalAnnualProjectedProfit
  
  // Virtual Deductions
  const homeOffice = profile.has_home_office ? 2050 : 0
  const mileage = (profile.estimated_annual_mileage || 0) * 3.50
  const totalVirtualDeductions = homeOffice + mileage

  // Tax with and without deductions to find savings
  const annualTaxBase = calculateAnnualTax(totalTaxableProfit)
  const annualTaxWithDeductions = calculateAnnualTax(Math.max(0, totalTaxableProfit - totalVirtualDeductions))
  const annualTaxSavings = Math.max(0, annualTaxBase - annualTaxWithDeductions)
  
  // Effective Rate
  const effectiveRate = totalTaxableProfit > 0 ? (annualTaxWithDeductions / totalTaxableProfit) * 100 : 0
  
  // MVA (Pending)
  const pendingMva = profile.is_mva_registered ? (gross * 0.2) : 0 // Simplified estimate

  // Liquidity (Safe to Spend is approximately net profit minus tax buffer)
  const safeToSpend = Math.max(0, netProfit - (annualTaxWithDeductions * (netProfit / (totalTaxableProfit || 1))))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'nb' ? 'nb-NO' : 'en-US', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Net Profit Card */}
      <Card className="border-none shadow-premium bg-white overflow-hidden relative group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
              <Info className="h-3.5 w-3.5 text-slate-300" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('netProfit')}</p>
            <h3 className="text-2xl font-black font-outfit text-slate-900">{formatCurrency(netProfit)}</h3>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
            <span className="h-1 w-1 rounded-full bg-emerald-600 animate-pulse" />
            {Math.round((netProfit / (gross || 1)) * 100)}% {t('profitMargin')}
          </div>
        </CardContent>
      </Card>

      {/* Effective Tax Rate Card */}
      <Card className="border-none shadow-premium bg-white overflow-hidden relative group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Scale className="h-5 w-5" />
            </div>
            <div className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
              <Info className="h-3.5 w-3.5 text-slate-300" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('effectiveTax')}</p>
            <h3 className="text-2xl font-black font-outfit text-slate-900">{effectiveRate.toFixed(1)}%</h3>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {t('taxSavings')}: <span className="text-indigo-600">{formatCurrency(annualTaxSavings)}</span>
          </p>
        </CardContent>
      </Card>

      {/* Safe to Spend Card */}
      <Card className="border-none shadow-premium bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-blue-100 uppercase tracking-wider">{t('safeToSpend')}</p>
            <h3 className="text-2xl font-black font-outfit text-white">{formatCurrency(safeToSpend)}</h3>
          </div>
          <p className="mt-4 text-[10px] text-blue-200 font-bold uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Post-Tax Liquidity
          </p>
        </CardContent>
      </Card>

      {/* Pending MVA Card */}
      <Card className="border-none shadow-premium bg-white overflow-hidden relative group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
              <Info className="h-3.5 w-3.5 text-slate-300" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('pendingMva')}</p>
            <h3 className="text-2xl font-black font-outfit text-slate-900">{formatCurrency(pendingMva)}</h3>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-full">
            Estimated Output VAT
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
