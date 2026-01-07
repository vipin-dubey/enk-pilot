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
  Search, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Calendar
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
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
}

export function TransactionJournal() {
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

      // 1. Fetch Allocations (Income)
      const { data: allocations } = await supabase
        .from('allocations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // 2. Fetch Receipts (Expenses)
      const { data: receipts } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_processed', true)
        .order('receipt_date', { ascending: false })

      // 3. Merge and normalize
      const income: Transaction[] = (allocations || []).map(a => ({
        id: a.id,
        type: 'income',
        date: a.created_at,
        vendor: 'Income Allocation',
        amount: Number(a.gross_amount),
        mva: Number(a.mva_reserved || 0),
        category: 'Revenue'
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

      const combined = [...income, ...expenses].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setTransactions(combined)
    } catch (error) {
      console.error('Error fetching journal:', error)
    } finally {
      setLoading(false)
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
      return monthOrder.indexOf(b) - monthOrder.indexOf(a) // Newest month first
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
      
      let error;
      if (transactionToDelete.type === 'expense') {
        // For receipts, we just mark as unprocessed so it doesn't count as an expense, 
        // but keeps the OCR data if they want to triage it again later.
        // Actually, the user wants "delete mistakes", so let's delete it or reset it.
        // Resetting is safer, but "Delete" usually means delete.
        // Let's delete the record.
        const { error: err } = await supabase
          .from('receipts')
          .delete()
          .eq('id', transactionToDelete.id)
          .eq('user_id', user.id)
        error = err
      } else {
        const { error: err } = await supabase
          .from('allocations')
          .delete()
          .eq('id', transactionToDelete.id)
          .eq('user_id', user.id)
        error = err
      }

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id))
      setDeleteConfirmOpen(false)
      setTransactionToDelete(null)
      
      // Refresh to update YTD values in other components
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
          
          <div className="flex bg-white rounded-lg p-1 border shadow-sm self-start">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                typeFilter === 'all' ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                typeFilter === 'income' ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-emerald-600"
              }`}
            >
              <ArrowUpRight className="h-3 w-3" />
              {t('income')}
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                typeFilter === 'expense' ? "bg-amber-600 text-white" : "text-slate-500 hover:text-amber-600"
              }`}
            >
              <ArrowDownRight className="h-3 w-3" />
              {t('expense')}
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={tCommon('search') || "Search transactions..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
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
                                  <TableHead>Type</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {monthTransactions.map((tr) => (
                                  <TableRow key={`${tr.type}-${tr.id}`} className="hover:bg-slate-50/30 transition-colors border-b last:border-b-0">
                                    <TableCell className="text-xs font-medium text-slate-400 w-[80px]">
                                      {new Date(tr.date).toLocaleDateString(locale === 'nb' ? 'nb-NO' : 'en-US', {
                                        day: 'numeric'
                                      })}
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
                                    <TableCell className="text-right font-mono font-bold text-sm">
                                      <span className={tr.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}>
                                        {tr.type === 'income' ? '+' : '-'}{Math.round(tr.amount).toLocaleString()}
                                      </span>
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
