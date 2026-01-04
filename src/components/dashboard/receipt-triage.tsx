'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Camera, FileText, Loader2, Check, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { createWorker } from 'tesseract.js'

export function ReceiptTriage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [receipts, setReceipts] = useState<any[]>([])
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
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

    if (data) setReceipts(data)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setStatus('processing')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthorized')

      // 1. OCR with Tesseract.js
      const worker = await createWorker('eng')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      // 2. Simple regex for amount (look for numbers with 2 decimals)
      const amountMatch = text.match(/[\d\s,]+\.\d{2}/)
      const amount = amountMatch ? parseFloat(amountMatch[0].replace(/\s/g, '').replace(',', '.')) : 0

      // 3. Upload to Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (storageError) throw storageError

      // 4. Save metadata
      const { error: dbError } = await supabase.from('receipts').insert({
        user_id: user.id,
        storage_path: storageData.path,
        amount: amount,
        vendor: 'Pending Extraction', // Could use AI here too
        is_processed: true,
      })

      if (dbError) throw dbError

      setStatus('success')
      fetchReceipts()
    } catch (err) {
      console.error('OCR Error:', err)
      setStatus('error')
    } finally {
      setIsProcessing(false)
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
              accept="image/*" 
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
            <p className="text-sm text-slate-500 mb-6">PNG, JPG up to 10MB</p>
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
          <CardTitle>Recent Receipts</CardTitle>
          <CardDescription>Your recently processed receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No receipts uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receipts.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{r.vendor || 'Unknown Vendor'}</p>
                    <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{r.amount?.toLocaleString()} NOK</p>
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
    </div>
  )
}
