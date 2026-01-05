'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { TaxPdfSync } from './tax-pdf-sync'
import { useTranslations, useLocale } from 'next-intl'

interface CalculatorProps {
  taxRate?: number
  isMvaRegistered?: boolean
}

export function SafeToSpendCalculator({ taxRate: initialTaxRate = 35, isMvaRegistered = false }: CalculatorProps) {
  const t = useTranslations('calculator')
  const locale = useLocale()
  const [grossInput, setGrossInput] = useState<string>('')
  const [taxRate, setTaxRate] = useState<number>(initialTaxRate)

  const calculations = useMemo(() => {
    const gross = parseFloat(grossInput) || 0
    let remaining = gross

    // 1. MVA (25% rate means 20% of gross if including MVA, or 25% on top)
    // PRD says: "If user is MVA Registered, subtract 20% (standard 25% rate) from gross"
    const mvaReserved = isMvaRegistered ? gross * 0.20 : 0
    remaining -= mvaReserved

    // 2. Tax (Includes National Insurance / Trygdeavgift)
    // The Skattekort percentage (taxRate) already accounts for base tax + trygdeavgift (~11%)
    const taxReserved = remaining * (taxRate / 100)

    const netProfit = remaining - taxReserved

    return {
      mvaReserved,
      taxReserved,
      netProfit
    }
  }, [grossInput, taxRate, isMvaRegistered])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-2 lg:col-span-3 border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="grid gap-6 md:grid-cols-2 items-start">
            <div className="space-y-4 bg-white border rounded-xl p-6 shadow-sm h-full">
              <div className="space-y-1 mb-2">
                <h3 className="text-lg font-bold font-outfit">{t('incomeEntry')}</h3>
                <p className="text-xs text-slate-500">{t('grossIncomeDescription')}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gross-income" className="text-slate-600 font-semibold">{t('grossIncomeLabel')}</Label>
                <Input
                  id="gross-income"
                  type="number"
                  placeholder="0.00"
                  value={grossInput}
                  onChange={(e) => setGrossInput(e.target.value)}
                  className="text-3xl h-16 font-outfit"
                />
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t('taxRulesHint')}</p>
              </div>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm h-full flex flex-col">
               <TaxPdfSync 
                initialTaxRate={taxRate} 
                onTaxRateChange={(newRate) => setTaxRate(parseFloat(newRate))} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <CardDescription>{t('mvaReserve')}</CardDescription>
          <CardTitle className="text-2xl">
            {calculations.mvaReserved.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US', { style: 'currency', currency: 'NOK' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            {isMvaRegistered ? t('mvaDescription', { percent: 20 }) : t('mvaNotRegistered')}
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardDescription>{t('taxReserve')}</CardDescription>
          <CardTitle className="text-2xl">
            {calculations.taxReserved.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US', { style: 'currency', currency: 'NOK' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            {t('taxDescription')}
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500 bg-green-50/30">
        <CardHeader className="pb-2">
          <CardDescription className="text-green-700">{t('safeToSpend')}</CardDescription>
          <CardTitle className="text-2xl text-green-700">
            {calculations.netProfit.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US', { style: 'currency', currency: 'NOK' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-green-600">
            {t('profitDescription')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
