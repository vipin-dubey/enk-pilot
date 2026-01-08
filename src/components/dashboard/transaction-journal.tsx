'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  Lock,
  FileBox
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/navigation'
import { ACCOUNTING_MAPPINGS, escapeCSV, getMvaPeriod } from '@/lib/accounting-utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Transaction {
  id: string
  type: 'income' | 'expense'
  date: string
  vendor: string
  amount: number
  mva: number
  category?: string
  originalCurrency?: string
  originalAmount?: number
}

interface TransactionJournalProps {
  isPro?: boolean
  trialExportsUsed?: number
  seatsLeft?: number
  percentFull?: number
}

export function TransactionJournal({ isPro = false, trialExportsUsed = 0, seatsLeft = 100, percentFull = 37 }: TransactionJournalProps) {
  const t = useTranslations('journal')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [showAccountantView, setShowAccountantView] = useState(false)

  const currentMonthKey = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${d.toLocaleString('en-US', { month: 'long' }).toLowerCase()}`
  }, [])

  const [expandedGroups, setExpandedGroups] = useState<string[]>([currentMonthKey])

  const supabase = createClient()

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: allocations } = await supabase
        .from('allocations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: receipts } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_processed', true)
        .order('receipt_date', { ascending: false })

      const income: Transaction[] = (allocations || []).map(a => ({
        id: a.id,
        type: 'income',
        date: a.date || a.created_at,
        vendor: t('income'),
        amount: Number(a.gross_amount),
        mva: Number(a.mva_reserved || 0),
        category: 'Revenue',
        originalCurrency: a.original_currency,
        originalAmount: a.original_amount ? Number(a.original_amount) : undefined
      }))

      const expenses: Transaction[] = (receipts || []).map(r => ({
        id: r.id,
        type: 'expense',
        date: r.receipt_date || r.created_at,
        vendor: r.vendor || 'Unknown Vendor',
        amount: Number(r.amount),
        mva: Number(r.mva_amount || 0),
        category: r.category
      }))

      const combined: Transaction[] = [...income, ...expenses].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setTransactions(combined)
    } catch (error) {
      console.error('Error fetching journal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!isPro && trialExportsUsed >= 1) {
      router.push('/upgrade')
      return
    }

    if (transactions.length === 0) {
      alert(t('noTransactions'))
      return
    }

    setIsExporting(true)
    try {
      const headers = [
        'Date',
        'Type',
        'Vendor',
        'Category',
        'Account #',
        'MVA Code',
        'MVA Period',
        'Original Amount',
        'Currency',
        'NOK Gross',
        'NOK Net',
        'MVA Amount'
      ]

      const rows = transactions.map(tr => {
        const transDate = new Date(tr.date)
        const mapping = ACCOUNTING_MAPPINGS[tr.category || 'Other']?.[tr.type] || ACCOUNTING_MAPPINGS['Other'][tr.type]

        return [
          transDate.toISOString().split('T')[0],
          tr.type === 'income' ? (locale === 'nb' ? 'Inntekt' : 'Income') : (locale === 'nb' ? 'Utgift' : 'Expense'),
          escapeCSV(tr.vendor),
          escapeCSV(tr.category || 'Other'),
          mapping.account,
          mapping.mvaCode,
          getMvaPeriod(transDate),
          tr.originalAmount?.toFixed(2) || tr.amount.toFixed(2),
          tr.originalCurrency || 'NOK',
          tr.amount.toFixed(2),
          (tr.amount - tr.mva).toFixed(2),
          tr.mva.toFixed(2)
        ]
      })

      const csvContent = [headers, ...rows].map(e => e.join(';')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `enk-pilot-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      if (!isPro) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({ trial_exports_used: trialExportsUsed + 1 })
            .eq('id', user.id)

          // Refresh session to update UI state
          router.refresh()
        }
      }

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      alert(t('exportError'))
    } finally {
      setIsExporting(false)
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery) ||
        (t.category?.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = typeFilter === 'all' || t.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [transactions, searchQuery, typeFilter])

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Record<string, Transaction[]>> = {}
    filteredTransactions.forEach(tr => {
      const d = new Date(tr.date)
      const year = d.getFullYear().toString()
      const month = d.toLocaleString('en-US', { month: 'long' }).toLowerCase()
      if (!groups[year]) groups[year] = {}
      if (!groups[year][month]) groups[year][month] = []
      groups[year][month].push(tr)
    })
    return groups
  }, [filteredTransactions])

  const sortedYears = useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => parseInt(b) - parseInt(a))
  }, [groupedTransactions])

  const getSortedMonths = (year: string) => {
    const monthOrder = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    return Object.keys(groupedTransactions[year]).sort((a, b) => {
      return monthOrder.indexOf(b) - monthOrder.indexOf(a)
    })
  }

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  async function handleDelete() {
    if (!transactionToDelete) return
    setIsDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const table = transactionToDelete.type === 'income' ? 'allocations' : 'receipts'
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', transactionToDelete.id)
        .eq('user_id', user.id)

      if (error) throw error
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id))
      setDeleteConfirmOpen(false)
      setTransactionToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert(t('deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCurrency = (val: number) => {
    return val.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0
    })
  }

  if (loading) {
    return (
      <Card className="border-none shadow-premium bg-white">
        <CardContent className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">{tCommon('loading')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-premium bg-white overflow-hidden">
      <CardHeader className="border-b bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold font-outfit text-slate-900">{t('title')}</CardTitle>
            <CardDescription className="text-slate-500">{t('description')}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Button
              variant={(!isPro && trialExportsUsed >= 1) ? "secondary" : "default"}
              size="sm"
              className={`gap-2 font-bold shadow-md transition-all h-10 ${(!isPro && trialExportsUsed >= 1) ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-900 hover:bg-black text-white'}`}
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : exportSuccess ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (!isPro && trialExportsUsed >= 1) ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {t('export')}
              {!isPro && (
                <Badge className={`ml-1 text-[10px] px-1.5 py-0 border-none font-black ${trialExportsUsed >= 1 ? 'bg-slate-200 text-slate-500' : 'bg-blue-600 text-white shadow-sm animate-pulse uppercase'}`}>
                  {trialExportsUsed >= 1 ? (locale === 'nb' ? 'Låst' : 'Locked') : (locale === 'nb' ? 'Gratis prøve' : 'Free Trial')}
                </Badge>
              )}
            </Button>
            {!isPro && trialExportsUsed >= 1 && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight text-right flex items-center gap-1">
                <FileBox className="h-3 w-3" />
                {locale === 'nb'
                  ? 'Lås opp SAF-T koder & regnskapsformater'
                  : 'Unlock SAF-T codes & Accountant formats'}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={tCommon('search') || "Search transactions..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 border-slate-200"
            />
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1 border shadow-inner self-start">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${typeFilter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${typeFilter === 'income' ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-emerald-600"
                }`}
            >
              <ArrowUpRight className="h-3 w-3" />
              {t('income')}
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${typeFilter === 'expense' ? "bg-amber-600 text-white shadow-sm" : "text-slate-500 hover:text-amber-600"
                }`}
            >
              <ArrowDownRight className="h-3 w-3" />
              {t('expense')}
            </button>
          </div>

          <div className="flex-1 flex flex-col items-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAccountantView(!showAccountantView)}
              className={`gap-2 font-bold transition-all h-9 ${showAccountantView ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-200' : 'text-slate-400 hover:text-slate-900'}`}
            >
              <FileBox className="h-4 w-4" />
              {locale === 'nb' ? 'Regnskap-visning' : 'Accountant View'}
              {showAccountantView && <Badge className="bg-blue-600 text-white border-none ml-1 text-[8px] h-4 px-1 uppercase tracking-tighter shadow-sm">SAF-T</Badge>}
            </Button>
            {showAccountantView && (
              <p className="text-[9px] text-blue-600/60 font-medium tracking-tight animate-in fade-in slide-in-from-right-1">
                {locale === 'nb'
                  ? 'Viser offisielle SAF-T koder for Skatteetaten'
                  : 'Showing official SAF-T codes for Tax Authorities'}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p className="font-medium">{t('noTransactions')}</p>
            </div>
          ) : (
            <div className="divide-y">
              {sortedYears.map(year => (
                <div key={year} className="bg-white">
                  {getSortedMonths(year).map(month => {
                    const groupKey = `${year}-${month}`
                    const isExpanded = expandedGroups.includes(groupKey)
                    const monthTransactions = groupedTransactions[year][month]
                    const monthTotal = monthTransactions.reduce((acc, curr) =>
                      acc + (curr.type === 'income' ? curr.amount : -curr.amount), 0
                    )

                    return (
                      <div key={groupKey} className="group/month">
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-slate-50 ${isExpanded ? 'bg-slate-50/50' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                              <ChevronRight className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span className="font-bold text-slate-900 capitalize">
                                {locale === 'nb' ? (
                                  new Date(parseInt(year), [
                                    'january', 'february', 'march', 'april', 'may', 'june',
                                    'july', 'august', 'september', 'october', 'november', 'december'
                                  ].indexOf(month)).toLocaleString('nb-NO', { month: 'long' })
                                ) : month} {year}
                              </span>
                              <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[10px]">
                                {monthTransactions.length}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-black font-mono ${monthTotal >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {monthTotal >= 0 ? '+' : ''}{formatCurrency(monthTotal)}
                            </p>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t">
                            <Table>
                              <TableHeader className="sr-only">
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Description</TableHead>
                                  {showAccountantView && <TableHead>Accounting</TableHead>}
                                  <TableHead>Type</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {monthTransactions.map((tr) => (
                                  <TableRow key={`${tr.type}-${tr.id}`} className="hover:bg-slate-50/30 transition-colors border-b last:border-b-0">
                                    <TableCell className="text-xs font-medium text-slate-400 w-[100px]">
                                      {new Date(tr.date).toLocaleDateString(locale === 'nb' ? 'nb-NO' : 'en-US', { day: '2-digit', month: 'short' })}
                                    </TableCell>
                                    <TableCell>
                                      <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 text-sm">{tr.vendor}</p>
                                        {tr.category && (
                                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                                            {tr.category}
                                          </p>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="w-[100px]">
                                      {tr.type === 'income' ? (
                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px] gap-1 px-1.5 py-0">
                                          {t('income')}
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-none font-bold text-[10px] gap-1 px-1.5 py-0">
                                          {t('expense')}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    {showAccountantView && (
                                      <TableCell className="w-[120px]">
                                        {(() => {
                                          const mapping = ACCOUNTING_MAPPINGS[tr.category || 'Other']?.[tr.type] || ACCOUNTING_MAPPINGS['Other'][tr.type]
                                          return (
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-fit">
                                                Acc: {mapping.account}
                                              </span>
                                              <span className="text-[9px] font-bold text-slate-500">
                                                MVA: {mapping.mvaCode} ({Math.round(mapping.mvaRate * 100)}%)
                                              </span>
                                            </div>
                                          )
                                        })()}
                                      </TableCell>
                                    )}
                                    <TableCell className="text-right font-mono font-bold text-sm">
                                      <div className="flex flex-col items-end">
                                        <span className={tr.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}>
                                          {tr.type === 'income' ? '+' : '-'}{Math.round(tr.amount).toLocaleString()}
                                        </span>
                                        {tr.originalCurrency && tr.originalCurrency !== 'NOK' && tr.originalAmount && (
                                          <span className="text-[10px] text-slate-400 font-medium">
                                            {tr.originalAmount.toLocaleString()} {tr.originalCurrency}
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right w-[60px]">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setTransactionToDelete(tr)
                                          setDeleteConfirmOpen(true)
                                        }}
                                        className="h-8 w-8 text-slate-200 hover:text-red-500 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-outfit text-xl font-bold">{tCommon('delete')}?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              {t('deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
