'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { calculateNorwegianTax } from '@/lib/tax-calculations'
import { useTranslations, useLocale } from 'next-intl'
import { Info, AlertTriangle, TrendingUp, Save, Loader2, CheckCircle2, Settings as SettingsIcon, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TaxPdfSync } from './tax-pdf-sync'

interface CalculatorProps {
  initialTaxRate?: number
  isMvaRegistered?: boolean
  ytdGrossIncome?: number
  ytdExpenses?: number
  externalSalary?: number
  useManualTax?: boolean
}

export function SafeToSpendCalculator({ 
  initialTaxRate = 35,
  isMvaRegistered = false,
  ytdGrossIncome = 0,
  ytdExpenses = 0,
  externalSalary = 0,
  useManualTax = false
}: CalculatorProps) {
  const t = useTranslations('calculator')
  const locale = useLocale()
  const router = useRouter()
  const [grossInput, setGrossInput] = useState<string>('')
  const [isRecording, setIsRecording] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isManualMode, setIsManualMode] = useState(useManualTax)
  const [manualRate, setManualRate] = useState<string>(initialTaxRate.toString())

  // Sync manual rate if prop changes from outside
  useEffect(() => {
    setManualRate(initialTaxRate.toString())
  }, [initialTaxRate])

  const calculations = useMemo(() => {
    const amount = parseFloat(grossInput) || 0
    return calculateNorwegianTax(
      amount,
      ytdGrossIncome,
      ytdExpenses,
      externalSalary,
      isMvaRegistered,
      isManualMode ? parseFloat(manualRate) : undefined
    )
  }, [grossInput, ytdGrossIncome, ytdExpenses, externalSalary, isMvaRegistered, isManualMode, manualRate])

  const toggleManualMode = async () => {
    const newMode = !isManualMode
    setIsManualMode(newMode)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ use_manual_tax: newMode }).eq('id', user.id)
    }
  }

  const formatCurrency = (val: number) => {
    return val.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US', { 
      style: 'currency', 
      currency: 'NOK',
      maximumFractionDigits: 0
    })
  }

  const handleRecordAllocation = async () => {
    if (!grossInput || parseFloat(grossInput) <= 0) return

    setIsRecording(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // If in manual mode, ensure the rate is saved to profile so it "stays" after refresh
      if (isManualMode) {
        const rateVal = parseFloat(manualRate)
        if (!isNaN(rateVal) && rateVal !== initialTaxRate) {
          await supabase.from('profiles').update({ 
            tax_rate_percent: rateVal,
            use_manual_tax: true 
          }).eq('id', user.id)
        }
      }

      const { error } = await supabase.from('allocations').insert({
        user_id: user.id,
        gross_amount: calculations.grossAmount,
        tax_reserved: calculations.taxBuffer,
        mva_reserved: calculations.mvaPart,
        net_profit: calculations.netRevenue,
        safe_to_spend: calculations.safeToSpend,
        marginal_rate_applied: calculations.marginalRate
      })

      if (error) throw error

      setShowSuccess(true)
      setGrossInput('')
      
      // Refresh to update the YTD profile data
      router.refresh()
      
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to record allocation:', err)
      alert(err instanceof Error ? err.message : 'Failed to record allocation')
    } finally {
      setIsRecording(false)
    }
  }

  const handleMarkAsMvaRegistered = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ is_mva_registered: true }).eq('id', user.id)
      router.refresh()
    }
  }

  const currentProfit = (ytdGrossIncome + externalSalary) - ytdExpenses;

  return (
    <div className="space-y-6">
      {/* Redesigned MVA Warning Card */}
      {calculations.crossesMvaThreshold && (
        <Card className="overflow-hidden border-l-4 border-l-amber-500 border-amber-100 bg-gradient-to-br from-amber-50/50 to-white shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-outfit text-amber-900 leading-tight">
                    {t('mvaThresholdWarning')}
                  </h3>
                  <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                    {t('mvaThresholdDescription')}
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 relative overflow-hidden group">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2 relative z-10">Step 1</p>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed relative z-10">{t('mvaGuideStep1')}</p>
                  </div>
                  <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 relative overflow-hidden group">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2 relative z-10">Step 2</p>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed relative z-10">{t('mvaGuideStep2')}</p>
                  </div>
                  <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 relative overflow-hidden group">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2 relative z-10">Step 3</p>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed relative z-10">{t('mvaGuideStep3')}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button 
                    asChild
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-amber-600/10 active:scale-95 transition-all"
                  >
                    <a href="https://www.skatteetaten.no/en/business-and-organisation/vat/register-a-business-for-vat/" target="_blank" rel="noreferrer">
                      {t('mvaAction')}
                    </a>
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAsMvaRegistered}
                    className="text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 font-bold h-10 px-4 rounded-xl transition-all group/mva flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 opacity-0 group-hover/mva:opacity-100 transition-opacity" />
                    {t('mvaMarkAsRegistered')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Input Section */}
        <Card className="md:col-span-2 lg:col-span-3 border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              <div className="space-y-4 bg-white border rounded-xl p-6 shadow-sm flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-outfit flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      {t('incomeEntry')}
                    </h3>
                    <p className="text-xs text-slate-500">{t('grossIncomeDescription')}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleManualMode}
                      className={`gap-2 h-8 text-[10px] uppercase font-bold tracking-widest ${isManualMode ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
                    >
                      {isManualMode ? <SettingsIcon className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                      {isManualMode ? t('useManualTax') : t('useEngine')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gross-income" className="text-slate-600 font-semibold">{t('grossIncomeLabel')}</Label>
                  <div className="relative">
                    <Input
                      id="gross-income"
                      type="number"
                      placeholder="0"
                      value={grossInput}
                      onChange={(e) => setGrossInput(e.target.value)}
                      className="text-4xl h-20 font-outfit pr-12 font-bold focus:ring-blue-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">NOK</span>
                  </div>
                </div>

                {isManualMode && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="manual-rate" className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">
                      Custom Tax Rate (%)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="manual-rate"
                        type="number"
                        value={manualRate}
                        onChange={(e) => setManualRate(e.target.value)}
                        className="h-10 w-24 font-bold"
                      />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-10 gap-2 text-xs">
                            <SettingsIcon className="h-4 w-4" />
                            {t('configureTax')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{t('configureTax')}</DialogTitle>
                          </DialogHeader>
                          <TaxPdfSync 
                            initialTaxRate={parseFloat(manualRate)} 
                            onTaxRateChange={(rate) => setManualRate(rate)} 
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </div>

              {/* Context Summary Box */}
              <div className="bg-slate-900 text-white border rounded-xl p-6 shadow-sm flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Info className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-widest font-bold">{t('currentTaxContext')}</span>
                  </div>
                  {!isManualMode && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white">
                          <SettingsIcon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{t('configureTax')}</DialogTitle>
                        </DialogHeader>
                        <TaxPdfSync 
                          initialTaxRate={initialTaxRate} 
                          onTaxRateChange={(rate) => setManualRate(rate)} 
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{t('ytdProfit')}</p>
                    <p className="font-outfit text-lg">{formatCurrency(currentProfit)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{t('marginalRate')}</p>
                    <p className="font-outfit text-lg">{(calculations.marginalRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t('mvaStatus')}</p>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isMvaRegistered ? 'bg-green-500' : 'bg-slate-600'}`} />
                    <span className="text-sm font-medium">
                      {isMvaRegistered ? t('registered') : t('notRegistered')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MVA Result */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardDescription>{t('mvaReserve')}</CardDescription>
            <CardTitle className="text-2xl font-outfit">
              {formatCurrency(calculations.mvaPart)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              {isMvaRegistered ? t('mvaDescription', { percent: 25 }) : t('mvaNotRegistered')}
            </p>
          </CardContent>
        </Card>

        {/* Tax Result */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>{t('taxReserve')}</CardDescription>
            <CardTitle className="text-2xl font-outfit">
              {formatCurrency(calculations.taxBuffer)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              {t('taxDescription')}
            </p>
          </CardContent>
        </Card>

        {/* Safe to Spend Result */}
        <Card className="border-l-4 border-l-green-500 bg-green-50/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-700 font-bold">{t('safeToSpend')}</CardDescription>
            <CardTitle className="text-3xl font-outfit text-green-700">
              {formatCurrency(calculations.safeToSpend)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">
              {t('profitDescription')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-xl border border-green-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-bold">Allocation recorded successfully! Your YTD profit has been updated.</p>
        </div>
      )}

      {/* Action Button */}
      {parseFloat(grossInput) > 0 && !showSuccess && (
        <div className="flex justify-end">
          <Button 
            onClick={handleRecordAllocation}
            disabled={isRecording}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            {isRecording ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t('recordAllocation')}
          </Button>
        </div>
      )}

    </div>
  )
}


