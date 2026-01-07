'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Camera, FileText, Loader2, Check, X, Search, Filter, Edit2, Save, ChevronDown, ChevronRight, Eye } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { createWorker } from 'tesseract.js'
import { extractVendor, detectCategory, ALL_STORES, CATEGORY_MVA_RATES } from '@/lib/norwegian-stores'
import { extractReceiptDate, groupReceiptsByDate, getSortedYears, getSortedMonths, formatDateForDB } from '@/lib/receipt-grouping'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CategoryBadge } from '@/components/ui/category-badge'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'Office', 'Travel', 'Food', 'Equipment', 'Marketing', 'IT', 'Software', 'Other']

export function ReceiptTriage() {
  const t = useTranslations('receipts')
  const tEdit = useTranslations('receiptEdit')
  const tCategories = useTranslations('categories')
  const tCommon = useTranslations('common')
  const tMonths = useTranslations('months')
  const locale = useLocale()
  const [isProcessing, setIsProcessing] = useState(false)
  const [receipts, setReceipts] = useState<any[]>([])
  const [filteredReceipts, setFilteredReceipts] = useState<any[]>([])
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [editingReceipt, setEditingReceipt] = useState<any | null>(null)
  const [editVendor, setEditVendor] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editMva, setEditMva] = useState('')
  const [editDate, setEditDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [expandedYears, setExpandedYears] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchReceipts()
  }, [])

  async function fetchReceipts() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setReceipts(data)
      setFilteredReceipts(data)
    }
  }

  // Filter receipts based on search and category
  useEffect(() => {
    let filtered = receipts

    // Filter by category
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(r => r.category === categoryFilter)
    }

    // Filter by search query (vendor or amount)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.vendor?.toLowerCase().includes(query) ||
        r.amount?.toString().includes(query)
      )
    }

    setFilteredReceipts(filtered)
  }, [receipts, searchQuery, categoryFilter])

  // Initialize expanded years
  useEffect(() => {
    if (receipts.length > 0 && expandedYears.length === 0) {
      const grouped = groupReceiptsByDate(receipts)
      const years = getSortedYears(grouped)
      const currentYear = new Date().getFullYear().toString()
      if (years.includes(currentYear)) {
        setExpandedYears([currentYear])
      } else if (years.length > 0) {
        setExpandedYears([years[0]])
      }
    }
  }, [receipts, expandedYears.length])

  const handleEditReceipt = (receipt: any) => {
    setEditingReceipt(receipt)
    setEditVendor(receipt.vendor || '')
    setEditCategory(receipt.category || 'Other')
    setEditAmount(receipt.amount?.toString() || '')
    setEditMva(receipt.mva_amount?.toString() || (receipt.amount ? (receipt.amount * 0.2).toFixed(2) : '0'))
    setEditDate(receipt.receipt_date || formatDateForDB(new Date(receipt.created_at)))
  }

  const handleViewReceipt = async (receipt: any) => {
    try {
      const { data } = await supabase.storage
        .from('receipts')
        .createSignedUrl(receipt.storage_path, 3600) // 1 hour expiry
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error viewing receipt:', error)
      alert('Failed to load receipt image')
    }
  }

  const handleSaveEdit = async () => {
    if (!editingReceipt) return

    setIsSaving(true)
    try {
      const parsedAmount = parseFloat(editAmount)
      if (isNaN(parsedAmount)) {
        alert('Please enter a valid amount')
        setIsSaving(false)
        return
      }

      const { error } = await supabase
        .from('receipts')
        .update({
          vendor: editVendor,
          category: editCategory,
          amount: parsedAmount,
          mva_amount: parseFloat(editMva) || 0,
          receipt_date: editDate,
        })
        .eq('id', editingReceipt.id)

      if (error) throw error

      // Update local state
      setReceipts(receipts.map(r => 
        r.id === editingReceipt.id 
          ? { ...r, vendor: editVendor, category: editCategory, amount: parsedAmount, mva_amount: parseFloat(editMva) || 0, receipt_date: editDate }
          : r
      ))

      setEditingReceipt(null)
    } catch (err) {
      console.error('Error updating receipt:', err)
      alert('Failed to update receipt')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) await processFile(file)
    event.target.value = ''
  }

  const processFile = async (file: File) => {

    setIsProcessing(true)
    setStatus('processing')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthorized')

      // Handle HEIC conversion (Native browser support only - works on Safari/Mac)
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        try {
          console.log('Attempting native HEIC conversion for:', file.name)
          
          const convertedFile = await new Promise<File>((resolve, reject) => {
            const url = URL.createObjectURL(file!)
            const img = new Image()
            
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                
                if (!ctx) {
                  URL.revokeObjectURL(url)
                  reject(new Error('Canvas context creation failed'))
                  return
                }
                
                ctx.drawImage(img, 0, 0)
                
                canvas.toBlob((blob) => {
                  URL.revokeObjectURL(url)
                  if (!blob) {
                    reject(new Error('Failed to create JPEG from HEIC'))
                    return
                  }
                  const newFile = new File(
                    [blob], 
                    file!.name.replace(/\.[^/.]+$/, "") + ".jpg", 
                    { type: 'image/jpeg' }
                  )
                  resolve(newFile)
                }, 'image/jpeg', 0.8)
              } catch (err) {
                URL.revokeObjectURL(url)
                reject(err)
              }
            }
            
            img.onerror = () => {
              URL.revokeObjectURL(url)
              reject(new Error('Your browser does not support HEIC files. Please convert to JPG first or use Safari.'))
            }
            
            img.src = url
          })

          file = convertedFile
          console.log('HEIC conversion successful:', file.name)
        } catch (convErr: any) {
          console.error('HEIC conversion failed:', convErr)
          throw new Error(convErr?.message || 'HEIC not supported in this browser. Please use JPG or PNG.')
        }
      }

      // 1. OCR with Tesseract.js
      const worker = await createWorker('eng')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      console.log('=== FULL OCR TEXT ===')
      console.log(text)
      console.log('=== END OCR TEXT ===')

      // 2. Extract vendor name from OCR text
      const vendor = extractVendor(text) || 'Unknown Vendor'
      console.log('Extracted vendor:', vendor)

      // 3. Smart regex for total amount
      // First, try to find "TOTAL" or similar keywords followed by an amount
      let amount = 0
      
      // Pattern 1: Look for TOTAL, SUM, TOTALT (Norwegian), etc. followed by amount
      // Handle various spacing and formatting issues from OCR
      const totalPatterns = [
        // Norwegian "Totalt" with various spacings and OCR errors (fotalt, totalt, etc.)
        /(?:Totalt|TOTALT|Total|TOTAL|fotalt|Fotalt|tota1t)\s*[:\s]*(\d+[\s,.]?\d{3}[.,]\d{2})/i,
        /(?:Totalt|TOTALT|Total|TOTAL|fotalt|Fotalt|tota1t)\s*[:\s]*(\d+[.,]\d{2})/i,
        // English patterns
        /(?:TOTAL|SUM|AMOUNT|GRAND\s*TOTAL)[:\s]*(\d+[\s,.]?\d{3}[.,]\d{2})/i,
        /(?:TOTAL|SUM|AMOUNT)[:\s]*(\d+[.,]\d{2})/i,
        // Norwegian "Beløp"
        /(?:BELØP|Beløp|be10p)[:\s]*(\d+[\s,.]?\d{3}[.,]\d{2})/i,
        /(?:BELØP|Beløp|be10p)[:\s]*(\d+[.,]\d{2})/i,
        // Fallback with more spacing tolerance
        /(?:TOTAL|TOTALT|Total|Totalt|fotalt)[:\s]*[^\d]*(\d+[\s,.]?\d{3}[.,]\d{2})/i,
      ]
      
      for (const pattern of totalPatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          // Remove spaces from the amount (e.g., "1 404,00" -> "1404,00")
          const cleanAmount = match[1].replace(/\s/g, '')
          amount = parseFloat(cleanAmount.replace(',', '.'))
          console.log('Found total using pattern:', pattern, '→', amount, 'from:', match[1])
          break
        }
      }
      
      // Pattern 2: If no TOTAL found, look for amounts near "BankAxcept" or "Terminal" (payment section)
      if (amount === 0) {
        const bankPattern = /(?:BankAxcept|Terminal|Ci\s*hake)[^\d]*(\d+[\s,.]?\d{3}[.,]\d{2}|\d+[.,]\d{2})/i
        const bankMatch = text.match(bankPattern)
        if (bankMatch && bankMatch[1]) {
          const cleanAmount = bankMatch[1].replace(/\s/g, '')
          amount = parseFloat(cleanAmount.replace(',', '.'))
          console.log('Found amount near payment section:', amount)
        }
      }
      
      // Pattern 3: If still no amount, look for the largest amount (likely the total)
      if (amount === 0) {
        const allAmounts = text.match(/\d+[\s,.]?\d{3}[.,]\d{2}|\d+[.,]\d{2}/g)
        if (allAmounts && allAmounts.length > 0) {
          const amounts = allAmounts.map(a => parseFloat(a.replace(/\s/g, '').replace(',', '.')))
          amount = Math.max(...amounts)
          console.log('Using largest amount found:', amount)
        }
      }

      // 4. Extract receipt date from OCR text
      const extractedDate = extractReceiptDate(text)
      const receiptDate = extractedDate ? formatDateForDB(extractedDate) : formatDateForDB(new Date())
      console.log('Extracted receipt date:', receiptDate)

      // 5. Auto-detect category (1. History -> 2. Vendor -> 3. Keywords)
      let category = 'Other'
      if (vendor && vendor !== 'Unknown Vendor') {
        const { data: historicalData } = await supabase
          .from('receipts')
          .select('category')
          .eq('user_id', user.id)
          .eq('vendor', vendor)
          .limit(1)
        
        if (historicalData && historicalData.length > 0) {
          category = historicalData[0].category
          console.log('Using historical category for vendor:', category)
        }
      }

      if (category === 'Other') {
        category = detectCategory(vendor, text)
        console.log('Auto-detected category (vendor/keyword):', category)
      }

      console.log('3. Uploading to Storage...')
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (storageError) {
        console.error('Storage Upload Error:', storageError)
        throw storageError
      }

      // Safety check for NaN and apply smart MVA rates
      const finalAmount = isNaN(amount) ? 0 : amount
      
      // Calculate MVA based on category-specific rates
      const mvaRate = CATEGORY_MVA_RATES[category] || 0.25
      const finalMva = isNaN(amount) ? 0 : (amount - (amount / (1 + mvaRate)))

      console.log('4. Saving metadata to DB...', { vendor, amount: finalAmount, date: receiptDate, mvaRate })
      
      const insertData: any = {
        user_id: user.id,
        storage_path: storageData.path,
        amount: finalAmount,
        vendor: vendor,
        category: category,
        receipt_date: receiptDate,
        mva_amount: finalMva,
        is_processed: true,
      }

      const { error: dbError } = await supabase.from('receipts').insert(insertData)

      if (dbError) {
        console.error('Database Insert Error:', dbError)
        // If it's a column missing error, provide a helpful message
        if (dbError.code === '42703') {
          throw new Error('Database schema out of date. Please run the MVA migration (20260106000001).')
        }
        throw dbError
      }

      console.log('5. Process complete!')
      setStatus('success')
      fetchReceipts()
    } catch (err: any) {
      console.error('FULL Processing Error details:', err)
      setStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic'))) {
      await processFile(file)
    }
  }

  return (
    <div className="grid gap-6">
      <Card id="receipt-upload">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={cn(
              "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 transition-all duration-200 cursor-pointer relative overflow-hidden",
              isDragging 
                ? "border-blue-500 bg-blue-50/50 scale-[0.99] shadow-inner" 
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              accept="image/*,.heic" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            
            {/* Animated Drag Indicator */}
            {isDragging && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-blue-500/5 animate-pulse">
                <div className="bg-blue-600/10 h-32 w-32 rounded-full flex items-center justify-center animate-ping duration-1000" />
              </div>
            )}

            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full shadow-sm mb-4 transition-transform duration-200",
              isDragging ? "bg-blue-600 scale-110 rotate-3" : "bg-white",
              status === 'success' ? "bg-green-50" : ""
            )}>
              {isProcessing ? (
                <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
              ) : status === 'success' ? (
                <Check className="h-7 w-7 text-green-600" />
              ) : isDragging ? (
                <Upload className="h-7 w-7 text-white" />
              ) : (
                <Upload className="h-7 w-7 text-slate-400" />
              )}
            </div>

            <div className="text-center relative z-10">
              <p className={cn(
                "font-bold text-lg mb-1 transition-colors",
                isDragging ? "text-blue-700" : "text-slate-900"
              )}>
                {isProcessing ? t('processing') : isDragging ? "Drop your receipt here!" : t('dragDrop')}
              </p>
              <p className="text-sm text-slate-500 mb-6">PNG, JPG, HEIC up to 10MB</p>
            </div>

            <div className={cn(
              "flex gap-3 transition-opacity duration-200",
              isDragging ? "opacity-0" : "opacity-100"
            )}>
              <Button variant="outline" size="sm" className="gap-2 pointer-events-none bg-white">
                <Camera className="h-4 w-4" /> {t('camera')}
              </Button>
              <Button size="sm" className="gap-2 pointer-events-none shadow-md bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4" /> {t('chooseFile')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('recentTitle')}</CardTitle>
              <CardDescription>{t('recentDescription')}</CardDescription>
            </div>
            <div className="text-sm text-slate-500">
              {t('receiptsCount', { count: filteredReceipts.length })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={tEdit('category')} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {tCategories(cat.toLowerCase() as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grouped Receipts List */}
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>{receipts.length === 0 ? t('noReceipts') : t('noMatch')}</p>
            </div>
          ) : (() => {
            const grouped = groupReceiptsByDate(filteredReceipts)
            const years = getSortedYears(grouped)

            return (
              <div className="space-y-4">
                {years.map((year) => {
                  const yearData = grouped[year]
                  const months = getSortedMonths(yearData)
                  const totalReceipts = Object.values(yearData).flat().length
                  const isYearExpanded = expandedYears.includes(year)

                  return (
                    <div key={year} className="border rounded-lg">
                      <button
                        onClick={() => {
                          setExpandedYears(prev =>
                            prev.includes(year)
                              ? prev.filter(y => y !== year)
                              : [...prev, year]
                          )
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isYearExpanded ? (
                            <ChevronDown className="h-5 w-5 text-slate-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-slate-500" />
                          )}
                          <span className="font-semibold text-lg">{year}</span>
                          <span className="text-sm text-slate-500">({t('receiptsCount', { count: totalReceipts })})</span>
                        </div>
                      </button>

                      {isYearExpanded && (
                        <div className="border-t">
                          {months.map((month) => {
                            const monthReceipts = yearData[month]
                            return (
                              <div key={month} className="border-b last:border-b-0">
                                <div className="bg-slate-50 px-4 py-2 font-medium text-sm text-slate-700">
                                  {tMonths(month.toLowerCase() as any)} ({t('receiptsCount', { count: monthReceipts.length })})
                                </div>
                                <div className="divide-y">
                                  {monthReceipts.map((r: any) => (
                                    <div key={r.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="font-semibold">{r.vendor || 'Unknown Vendor'}</p>
                                          {r.category && <CategoryBadge category={r.category} />}
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                            onClick={() => handleViewReceipt(r)}
                                            title={t('viewReceipt')}
                                          >
                                            <Eye className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                            onClick={() => handleEditReceipt(r)}
                                            title={t('editReceipt')}
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                          {new Date(r.receipt_date || r.created_at).toLocaleDateString(locale === 'nb' ? 'nb-NO' : 'en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                          })}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-lg">{r.amount?.toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US')} NOK</p>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                          {(r.mva_amount || 0).toLocaleString(locale === 'nb' ? 'nb-NO' : 'en-US')} NOK {tEdit('mvaAmount')}
                                        </p>
                                        <p className="text-[10px] text-green-600 flex items-center gap-1 justify-end mt-1">
                                          <Check className="h-3 w-3" /> {t('processed')}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Edit Receipt Dialog */}
      <Dialog open={!!editingReceipt} onOpenChange={(open: boolean) => !open && setEditingReceipt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tEdit('title')}</DialogTitle>
            <DialogDescription>
              {tEdit('description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-vendor">{tEdit('vendorName')}</Label>
              <Input
                id="edit-vendor"
                value={editVendor}
                onChange={(e) => setEditVendor(e.target.value)}
                placeholder={tEdit('vendorPlaceholder')}
                list="vendor-suggestions"
              />
              <datalist id="vendor-suggestions">
                {ALL_STORES.map((store) => (
                  <option key={store} value={store} />
                ))}
              </datalist>
              <p className="text-xs text-slate-500">{tEdit('vendorHint')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">{tEdit('amount')}</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => {
                  setEditAmount(e.target.value)
                  // Auto-calculate 20% MVA on total
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val)) setEditMva((val * 0.2).toFixed(2))
                }}
                placeholder={tEdit('amountPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mva">{tEdit('mvaAmount')}</Label>
              <Input
                id="edit-mva"
                type="number"
                step="0.01"
                value={editMva}
                onChange={(e) => setEditMva(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-[10px] text-slate-500">{tEdit('mvaAmountHint')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">{tEdit('receiptDate')}</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">{tEdit('category')}</Label>
              <Input
                id="edit-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder={tEdit('categoryPlaceholder')}
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              <p className="text-xs text-slate-500">{tEdit('categoryHint')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReceipt(null)} disabled={isSaving}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tEdit('saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {tCommon('save')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
