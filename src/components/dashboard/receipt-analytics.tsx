'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, Receipt, DollarSign, Download, Calendar, Upload } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { calculateReceiptStats, filterReceiptsByDateRange, type Receipt as ReceiptType } from '@/lib/receipt-analytics'
import Papa from 'papaparse'
import { useTranslations, useLocale } from 'next-intl'

type DateRange = 'month' | '3months' | '6months' | 'year' | 'all'

const CATEGORY_COLORS: Record<string, string> = {
  'Office': '#3b82f6',
  'Travel': '#8b5cf6',
  'Food': '#10b981',
  'Equipment': '#f97316',
  'Marketing': '#ec4899',
  'IT': '#6366f1',
  'Software': '#06b6d4',
  'Other': '#6b7280',
}

const KNOWN_CATEGORIES = ['all', 'office', 'travel', 'food', 'equipment', 'marketing', 'it', 'software', 'other']

export function ReceiptAnalytics() {
  const t = useTranslations('analytics')
  const tReceipts = useTranslations('receipts')
  const tCategories = useTranslations('categories')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [receipts, setReceipts] = useState<ReceiptType[]>([])
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchReceipts()
  }, [])

  async function fetchReceipts() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setReceipts(data)
    } catch (error) {
      console.error('Error fetching receipts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredReceipts = useMemo(
    () => filterReceiptsByDateRange(receipts, dateRange),
    [receipts, dateRange]
  )

  const stats = useMemo(
    () => calculateReceiptStats(filteredReceipts),
    [filteredReceipts]
  )

  function exportToCSV() {
    const csvData = filteredReceipts.map(r => ({
      Date: new Date(r.created_at).toLocaleDateString(locale === 'nb' ? 'nb-NO' : 'en-US'),
      Vendor: r.vendor || 'Unknown',
      Category: r.category ? (KNOWN_CATEGORIES.includes(r.category.toLowerCase()) ? tCategories(r.category.toLowerCase() as any) : r.category) : tCategories('other'),
      Amount: r.amount.toFixed(2)
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipts-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <div className="text-center py-8 text-slate-400">{tCommon('loading')}</div>
  }

  if (receipts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-400">
          <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{tReceipts('noReceipts')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and export */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{tReceipts('analytics')}</h3>
          <p className="text-sm text-slate-500">{tReceipts('analyticsDescription')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t('lastMonth')}</SelectItem>
              <SelectItem value="3months">{t('last3Months')}</SelectItem>
              <SelectItem value="6months">{t('last6Months')}</SelectItem>
              <SelectItem value="year">{t('lastYear')}</SelectItem>
              <SelectItem value="all">{t('allTime')}</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => {
              const uploadSection = document.getElementById('receipt-upload')
              uploadSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {tReceipts('uploadButton')}
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {tReceipts('exportCSV')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSpent')}</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US')} NOK</div>
            <p className="text-xs text-slate-500 mt-1">
              {tReceipts('receiptsCount', { count: filteredReceipts.length })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('receiptCount')}</CardTitle>
            <Receipt className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.receiptCount}</div>
            <p className="text-xs text-slate-500 mt-1">
              {dateRange === 'all' ? t('allTime') : t(`last${dateRange === 'month' ? 'Month' : dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}`)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('averageAmount')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAmount.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US', { maximumFractionDigits: 0 })} NOK</div>
            <p className="text-xs text-slate-500 mt-1">{t('perReceipt')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Bar Chart */}
      {stats.categoryTotals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('spendingByCategory')}</CardTitle>
            <CardDescription>{t('categoryBreakdown')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryTotals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  tickFormatter={(value) => {
                    const lower = value.toLowerCase()
                    return KNOWN_CATEGORIES.includes(lower) ? tCategories(lower as any) : value
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  tickFormatter={(value) => `${value.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US')} kr`}
                />
                <Tooltip 
                  formatter={(value: number | undefined) => value ? [`${value.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US')} NOK`, t('totalSpent')] : [`0 NOK`, t('totalSpent')]}
                  labelFormatter={(label) => {
                    const lower = label.toLowerCase()
                    return KNOWN_CATEGORIES.includes(lower) ? tCategories(lower as any) : label
                  }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {stats.categoryTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Other} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
