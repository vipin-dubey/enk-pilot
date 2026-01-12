'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
  Receipt,
  Info,
  Gavel
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/navigation'
import { createClient } from '@/utils/supabase/client'
import { calculateAnnualTax } from '@/lib/tax-calculations'

interface CfoAnalyticsProps {
  isPro: boolean
  seatsLeft: number
  percentFull: number
}

export function CfoAnalytics({ isPro, seatsLeft, percentFull }: CfoAnalyticsProps) {
  const t = useTranslations('cfo')
  const tLegal = useTranslations('legal')
  const locale = useLocale()
  const [profile, setProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, allocationsRes, receiptsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('allocations').select('*').eq('user_id', user.id),
        supabase.from('receipts').select('*').eq('user_id', user.id).eq('is_processed', true)
      ])

      setProfile(profileRes.data)

      const combined = [
        ...(allocationsRes.data || []).map(a => ({
          ...a,
          trType: 'income',
          amount: Number(a.amount) || 0,
          date: new Date(a.created_at)
        })),
        ...(receiptsRes.data || []).map(r => ({
          ...r,
          trType: 'expense',
          amount: Number(r.amount) || 0,
          date: new Date(r.receipt_date || r.created_at)
        }))
      ]
      setTransactions(combined)
    } catch (error) {
      console.error('Error fetching CFO data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentYear = 2026

  const bizGross = useMemo(() => transactions
    .filter(tr => tr.trType === 'income' && tr.date.getFullYear() === currentYear)
    .reduce((acc, tr) => acc + tr.amount, 0), [transactions])

  const expenses = useMemo(() => transactions
    .filter(tr => tr.trType === 'expense' && tr.date.getFullYear() === currentYear)
    .reduce((acc, tr) => acc + tr.amount, 0), [transactions])

  // Monthly breakdown for Bar Chart
  const monthlyData = useMemo(() => {
    const currentYear = 2026 // Based on system instructions
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(currentYear, i, 1)),
      income: 0,
      expenses: 0,
      profit: 0
    }))

    transactions.forEach(tr => {
      if (!tr.date || isNaN(tr.date.getTime())) return

      // Strict year filtering: only show data for the current reporting year
      if (tr.date.getFullYear() !== currentYear) return

      const monthIdx = tr.date.getMonth()
      if (months[monthIdx]) {
        if (tr.trType === 'income') {
          months[monthIdx].income += tr.amount
        } else {
          months[monthIdx].expenses += tr.amount
        }
      }
    })

    return months.map(m => ({
      ...m,
      profit: m.income - m.expenses
    }))
  }, [transactions, locale])

  // Tax Burden for Pie Chart
  const taxBurdenData = useMemo(() => {
    if (!profile) return []

    // CFO View should focus on the BUSINESS revenue distribution
    const externalSalary = Number(profile.external_salary_income) || 0

    // MVA is a direct pass-through
    const mvaReserve = profile.is_mva_registered ? (bizGross / 1.25) * 0.25 : 0
    const bizNetRevenue = bizGross - mvaReserve
    const bizProfit = Math.max(0, bizNetRevenue - expenses)

    // Tax is calculated on the total (Personal income), but we only attribute the business portion here
    const totalTax = calculateAnnualTax(bizProfit + externalSalary)
    const salaryOnlyTax = calculateAnnualTax(externalSalary)
    const bizTaxBurden = Math.max(0, totalTax - salaryOnlyTax)

    const bizTakeHome = Math.max(0, bizProfit - bizTaxBurden)

    return [
      { name: locale === 'nb' ? 'Skattebuffer' : 'Tax Reserve', value: Math.round(bizTaxBurden), color: '#4f46e5' },
      { name: locale === 'nb' ? 'MVA' : 'VAT', value: Math.round(mvaReserve), color: '#06b6d4' },
      { name: locale === 'nb' ? 'Utgifter' : 'Expenses', value: Math.round(expenses), color: '#f59e0b' },
      { name: locale === 'nb' ? 'Lønn fra ENK' : 'Business Take Home', value: Math.round(bizTakeHome), color: '#10b981' }
    ].filter(item => item.value > 0)
  }, [profile, locale])

  // Expense Categories for Analytics
  const expenseCategoryData = useMemo(() => {
    const categories: Record<string, number> = {}

    transactions.forEach(tr => {
      if (tr.trType === 'expense') {
        const cat = tr.category || (locale === 'nb' ? 'Uspesifisert' : 'Uncategorized')
        categories[cat] = (categories[cat] || 0) + tr.amount
      }
    })

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Show top 5
  }, [transactions, locale])

  if (loading) return null

  const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981']
  const EXPENSE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#ecfdf5']

  const formatCurrency = (value: number | undefined) => {
    return new Intl.NumberFormat(locale === 'nb' ? 'nb-NO' : 'en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  const renderLockedOverlay = () => (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
      <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 shadow-xl">
        <Lock className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 font-outfit uppercase tracking-tight">CFO Strategic View</h3>
      <p className="text-slate-600 text-sm max-w-xs mb-6">
        Unlock performance trends, tax burden visualizations, and strategic expense analytics.
      </p>
      <Button
        onClick={() => router.push('/upgrade')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8"
      >
        Upgrade to Pro
      </Button>
    </div>
  )

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card className="border-none shadow-premium relative overflow-hidden">
          {!isPro && renderLockedOverlay()}
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold font-outfit flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  {t('performanceTitle')}
                </CardTitle>
                <CardDescription>{t('performanceDesc')}</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-slate-100 font-bold">2026</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number | undefined) => [formatCurrency(value), '']}
                />
                <Bar dataKey="income" name="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tax Burden Pie */}
        <Card className="border-none shadow-premium relative overflow-hidden">
          {!isPro && renderLockedOverlay()}
          <CardHeader>
            <CardTitle className="text-lg font-bold font-outfit flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-indigo-600" />
              {t('burdenTitle')}
            </CardTitle>
            <CardDescription>{t('burdenDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taxBurdenData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taxBurdenData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | undefined) => formatCurrency(value)} />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ paddingLeft: '20px', fontSize: '12px', fontWeight: 700 }}
                  formatter={(value, entry: any) => (
                    <span className="text-slate-600">
                      {value}: <span className="text-slate-900">{formatCurrency(entry.payload.value)}</span>
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
              <Info className="h-3 w-3 shrink-0" />
              {locale === 'nb'
                ? "Dette viser din ENK som en isolert enhet. Annen lønnsinntekt er filtrert ut for å gi et rent bilde av bedriftens resultat."
                : "This visualizes your ENK as a standalone entity. Other salary income is filtered out to show purely business performance."}
            </div>
          </div>
        </Card>

        {/* Expense Categories */}
        <Card className="border-none shadow-premium relative overflow-hidden lg:col-span-2">
          {!isPro && renderLockedOverlay()}
          <CardHeader>
            <CardTitle className="text-lg font-bold font-outfit flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              {t('expenseTitle')}
            </CardTitle>
            <CardDescription>{t('expenseDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseCategoryData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#1e293b' }}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: '#ecfdf5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number | undefined) => [formatCurrency(value), '']}
                />
                <Bar dataKey="value" name="Amount" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30}>
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tax Return Pre-Check (Selvangivelse) */}
      <Card className="border-none shadow-premium bg-slate-900 text-white relative overflow-hidden">
        {!isPro && renderLockedOverlay()}
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold font-outfit">{t('preCheckTitle')}</CardTitle>
              <CardDescription className="text-slate-400">{t('preCheckDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <span>Box 101</span>
                <span>{t('box101')}</span>
              </div>
              <p className="text-2xl font-bold font-outfit">{formatCurrency(bizGross)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <span>Box 401</span>
                <span>{t('box401')}</span>
              </div>
              <p className="text-2xl font-bold font-outfit">{formatCurrency(expenses)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <span>Box 7.1.1</span>
                <span>{t('box711')}</span>
              </div>
              <p className="text-2xl font-bold font-outfit text-blue-400">{formatCurrency(114210)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <span>Box 440</span>
                <span>{t('box440')}</span>
              </div>
              <p className="text-2xl font-bold font-outfit text-emerald-400">
                {formatCurrency(bizGross - expenses)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Sticky Legal Disclaimer */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/5 rounded-xl border border-slate-900/10 border-dashed mt-6">
        <Gavel className="h-4 w-4 text-slate-400" />
        <p className="text-[10px] text-slate-500 font-medium italic">
          {tLegal('legalFootnote')}
        </p>
      </div>
    </div>
  )
}
