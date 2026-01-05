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

type DateRange = 'month' | '3months' | '6months' | 'year' | 'all'

const CATEGORY_COLORS: Record<string, string> = {
  'Office': '#3b82f6',
  'Travel': '#8b5cf6',
  'Food': '#10b981',
  'Equipment': '#f97316',
  'Marketing': '#ec4899',
  'Other': '#6b7280',
}

export function ReceiptAnalytics() {
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
      Date: new Date(r.created_at).toLocaleDateString('nb-NO'),
      Vendor: r.vendor || 'Unknown',
      Category: r.category || 'Other',
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
    return <div className="text-center py-8 text-slate-400">Loading analytics...</div>
  }

  if (receipts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-400">
          <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No receipts yet. Upload your first receipt to see analytics!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and export */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Receipt Analytics</h3>
          <p className="text-sm text-slate-500">Track your spending by category</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
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
            Upload Receipt
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent.toLocaleString('nb-NO')} NOK</div>
            <p className="text-xs text-slate-500 mt-1">
              {filteredReceipts.length} receipt{filteredReceipts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipt Count</CardTitle>
            <Receipt className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.receiptCount}</div>
            <p className="text-xs text-slate-500 mt-1">
              {dateRange === 'all' ? 'All time' : `Last ${dateRange === 'month' ? 'month' : dateRange}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAmount.toLocaleString('nb-NO', { maximumFractionDigits: 0 })} NOK</div>
            <p className="text-xs text-slate-500 mt-1">Per receipt</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Bar Chart */}
      {stats.categoryTotals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Breakdown of expenses across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryTotals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  tickFormatter={(value) => `${value.toLocaleString()} kr`}
                />
                <Tooltip 
                  formatter={(value: number | undefined) => value ? [`${value.toLocaleString('nb-NO')} NOK`, 'Amount'] : ['0 NOK', 'Amount']}
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
