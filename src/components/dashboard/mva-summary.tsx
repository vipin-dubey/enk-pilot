'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { useTranslations, useLocale } from 'next-intl'
import { Progress } from '@/components/ui/progress'
import { Loader2, ArrowUpRight, ArrowDownRight, Calculator, Calendar } from 'lucide-react'

interface MvaPeriodData {
  period: number
  label: string
  incomeMva: number
  expenseMva: number
  net: number
}

export function MvaSummary() {
  const t = useTranslations('calculator')
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<MvaPeriodData[]>([])
  const [year, setYear] = useState(new Date().getFullYear())
  const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1]

  const periods = [
    { id: 1, label: t('mvaPeriod1') },
    { id: 2, label: t('mvaPeriod2') },
    { id: 3, label: t('mvaPeriod3') },
    { id: 4, label: t('mvaPeriod4') },
    { id: 5, label: t('mvaPeriod5') },
    { id: 6, label: t('mvaPeriod6') },
  ]

  useEffect(() => {
    fetchMvaData()
  }, [year])

  async function fetchMvaData() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      // 1. Fetch Allocations (Output MVA)
      const { data: allocations } = await supabase
        .from('allocations')
        .select('mva_reserved, created_at')
        .eq('user_id', user.id)
        .gte('created_at', `${year}-01-01`)
        .lte('created_at', `${year}-12-31`)

      // 2. Fetch Receipts (Input MVA)
      const { data: receipts } = await supabase
        .from('receipts')
        .select('mva_amount, receipt_date, created_at')
        .eq('user_id', user.id)
        .eq('is_processed', true)
        .or(`receipt_date.gte.${year}-01-01,created_at.gte.${year}-01-01`)

      // 3. Process data into periods
      const periodMap: Record<number, { income: number; expense: number }> = {}
      for (let i = 1; i <= 6; i++) periodMap[i] = { income: 0, expense: 0 }

      allocations?.forEach(a => {
        const month = new Date(a.created_at).getMonth() // 0-11
        const period = Math.floor(month / 2) + 1 // 1-6
        periodMap[period].income += Number(a.mva_reserved || 0)
      })

      receipts?.forEach(r => {
        const date = new Date(r.receipt_date || r.created_at)
        if (date.getFullYear() !== year) return
        const month = date.getMonth()
        const period = Math.floor(month / 2) + 1
        periodMap[period].expense += Number(r.mva_amount || 0)
      })

      const formattedData: MvaPeriodData[] = periods.map(p => ({
        period: p.id,
        label: p.label,
        incomeMva: periodMap[p.id].income,
        expenseMva: periodMap[p.id].expense,
        net: periodMap[p.id].income - periodMap[p.id].expense
      }))

      setData(formattedData)
    } catch (err) {
      console.error('Error fetching MVA summary:', err)
    } finally {
      setLoading(false)
    }
  }

  const totals = useMemo(() => {
    return data.reduce((acc, curr) => ({
      income: acc.income + curr.incomeMva,
      expense: acc.expense + curr.expenseMva,
      net: acc.net + curr.net
    }), { income: 0, expense: 0, net: 0 })
  }, [data])

  if (loading) {
    return (
      <Card className="border-none shadow-none bg-slate-50/50 flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-white">
      <CardHeader className="bg-slate-900 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold font-outfit flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-400" />
              {t('mvaReport')}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {t('mvaReportDescription')}
            </CardDescription>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex bg-white/10 rounded-lg p-1">
              {availableYears.map(y => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                    year === y ? "bg-white text-slate-900 shadow-sm" : "text-white/60 hover:text-white"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            <p className="text-2xl font-black font-mono text-blue-400">
              {totals.net.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US')} <span className="text-xs">NOK</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y border-t">
          {data.map((period) => (
            <div key={period.period} className="flex flex-col md:flex-row items-center p-4 hover:bg-slate-50 transition-colors gap-4">
              <div className="w-full md:w-32 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Period {period.period}</p>
                  <p className="text-sm font-bold text-slate-900 leading-none">{period.label}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" /> {t('outputVat')}
                  </p>
                  <p className="text-sm font-bold font-mono text-slate-700">
                    +{period.incomeMva.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US')}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3 text-amber-500" /> {t('inputVat')}
                  </p>
                  <p className="text-sm font-bold font-mono text-slate-700">
                    -{period.expenseMva.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US')}
                  </p>
                </div>

                <div className="hidden md:block space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t('netToPay')}</p>
                    <p className="text-sm font-black text-slate-900 font-mono">
                      {period.net.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US')}
                    </p>
                  </div>
                  <Progress 
                    value={period.incomeMva > 0 ? (Math.min(period.expenseMva / period.incomeMva, 1) * 100) : 0} 
                    className="h-1.5 bg-slate-100"
                    style={{ '--progress-background': '#3b82f6' } as any}
                  />
                </div>
              </div>
              
              <div className="md:hidden flex items-center justify-between w-full pt-2 border-t mt-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">{t('netToPay')}</p>
                 <p className="text-lg font-black text-slate-900 font-mono">
                   {period.net.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US')}
                 </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
