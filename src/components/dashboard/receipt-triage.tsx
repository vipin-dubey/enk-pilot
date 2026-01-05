'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Camera, FileText, Loader2, Check, X, Search, Filter, Edit2, Save } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { createWorker } from 'tesseract.js'
import { extractVendor, detectCategory, ALL_STORES } from '@/lib/norwegian-stores'
import { CategoryBadge } from '@/components/ui/category-badge'

const CATEGORIES = ['All', 'Office', 'Travel', 'Food', 'Equipment', 'Marketing', 'Other']

export function ReceiptTriage() {
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
  const [isSaving, setIsSaving] = useState(false)
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

  const handleEditReceipt = (receipt: any) => {
    setEditingReceipt(receipt)
    setEditVendor(receipt.vendor || '')
    setEditCategory(receipt.category || 'Other')
    setEditAmount(receipt.amount?.toString() || '')
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
        })
        .eq('id', editingReceipt.id)

      if (error) throw error

      // Update local state
      setReceipts(receipts.map(r => 
        r.id === editingReceipt.id 
          ? { ...r, vendor: editVendor, category: editCategory, amount: parsedAmount }
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
    let file = event.target.files?.[0]
    if (!file) return

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

      // 4. Auto-detect category based on vendor
      const category = detectCategory(vendor)
      console.log('Auto-detected category:', category)

      // 5. Upload to Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (storageError) throw storageError

      // 6. Save metadata with vendor and category
      const { error: dbError } = await supabase.from('receipts').insert({
        user_id: user.id,
        storage_path: storageData.path,
        amount: amount,
        vendor: vendor,
        category: category,
        is_processed: true,
      })

      if (dbError) throw dbError

      setStatus('success')
      fetchReceipts()
    } catch (err: any) {
      console.error('Processing Error:', err)
      setStatus('error')
    } finally {
      setIsProcessing(false)
      if (event.target) event.target.value = ''
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Receipt Upload</CardTitle>
          <CardDescription>Snap or upload a photo of your receipt for instant OCR processing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept="image/*,.heic" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
              {isProcessing ? (
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              ) : (
                <Upload className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <p className="font-medium">
              {isProcessing ? 'Reading Receipt...' : 'Drop your receipt here'}
            </p>
            <p className="text-sm text-slate-500 mb-6">PNG, JPG, HEIC up to 10MB</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                <Camera className="h-4 w-4" /> Use Camera
              </Button>
              <Button size="sm" className="gap-2 pointer-events-none">
                <FileText className="h-4 w-4" /> Choose File
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Receipts</CardTitle>
              <CardDescription>Your recently processed receipts.</CardDescription>
            </div>
            <div className="text-sm text-slate-500">
              {filteredReceipts.length} of {receipts.length} receipts
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by vendor or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Receipts List */}
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>{receipts.length === 0 ? 'No receipts uploaded yet.' : 'No receipts match your filters.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReceipts.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{r.vendor || 'Unknown Vendor'}</p>
                      {r.category && <CategoryBadge category={r.category} />}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={() => handleEditReceipt(r)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString('nb-NO', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{r.amount?.toLocaleString('nb-NO')} NOK</p>
                    <p className="text-[10px] text-green-600 flex items-center gap-1 justify-end">
                      <Check className="h-3 w-3" /> Processed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Receipt Dialog */}
      <Dialog open={!!editingReceipt} onOpenChange={(open: boolean) => !open && setEditingReceipt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Receipt</DialogTitle>
            <DialogDescription>
              Update the vendor name, amount, and category for this receipt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-vendor">Vendor Name</Label>
              <Input
                id="edit-vendor"
                value={editVendor}
                onChange={(e) => setEditVendor(e.target.value)}
                placeholder="Enter vendor name"
                list="vendor-suggestions"
              />
              <datalist id="vendor-suggestions">
                {ALL_STORES.map((store) => (
                  <option key={store} value={store} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount (NOK)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger id="edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReceipt(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
