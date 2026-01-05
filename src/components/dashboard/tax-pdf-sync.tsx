'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileUp, Loader2, CheckCircle2, AlertCircle, Save, Percent } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface TaxPdfSyncProps {
  initialTaxRate: number
  onTaxRateChange: (rate: string) => void
}

export function TaxPdfSync({ initialTaxRate, onTaxRateChange }: TaxPdfSyncProps) {
  const [taxRate, setTaxRate] = useState<string>(initialTaxRate.toString())
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync internal state if the prop changes from outside (e.g. fresh DB load)
  useEffect(() => {
    setTaxRate(initialTaxRate.toString())
  }, [initialTaxRate])

  // Update parent whenever our local state changes
  const handleRateChange = (val: string) => {
    setTaxRate(val)
    if (!isNaN(parseFloat(val))) {
      onTaxRateChange(val)
    }
  }

  const handleManualSave = async () => {
    if (!taxRate || isNaN(parseFloat(taxRate))) {
      setStatus('error')
      setMessage('Please enter a valid tax rate.')
      return
    }

    setIsSaving(true)
    setStatus('idle')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          tax_rate_percent: parseFloat(taxRate),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setStatus('success')
      setMessage(`Tax rate updated to ${taxRate}%`)
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      console.error('Error saving tax rate:', err)
      setStatus('error')
      setMessage(err.message || 'Failed to update tax rate.')
    } finally {
      setIsSaving(false)
    }
  }

  const scanPdfLocally = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setStatus('idle')
    setMessage('Scanning locally...')

    try {
      // Dynamic import to avoid SSR issues
      // @ts-ignore
      const pdfjs = await import('pdfjs-dist')
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      
      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n'
      }

      console.log('Local Scan Content Length:', fullText.length)

      // Privacy-Safe Regex Patterns for Skattekort
      // Look for "Trekkprosent" followed by a number, or just a standalone %
      const patterns = [
        /Trekkprosent\s*[:\-]?\s*(\d+[.,]\d+|\d+)/i, // Look for Trekkprosent
        /Skattesats\s*[:\-]?\s*(\d+[.,]\d+|\d+)/i,   // Look for Skattesats
        /(\d+[.,]\d+|\d+)\s*%/                       // Look for anything followed by %
      ]

      let foundRate = null
      for (const pattern of patterns) {
        const match = fullText.match(pattern)
        if (match && match[1]) {
          foundRate = match[1].replace(',', '.')
          break
        }
      }

      if (foundRate) {
        handleRateChange(foundRate)
        setStatus('success')
        setMessage(`Detected ${foundRate}% from PDF! Click save to confirm.`)
      } else {
        setStatus('error')
        setMessage('Could not find tax rate in this PDF. Please enter it manually.')
      }
    } catch (err: any) {
      console.error('Local scan error:', err)
      setStatus('error')
      setMessage('Failed to read PDF locally. Please enter tax rate manually.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-1">
        <Percent className="h-4 w-4 text-blue-600" />
        <h3 className="text-lg font-bold font-outfit">Tax Configuration</h3>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Set manually or scan your "Skattekort" PDF locally.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="e.g. 35"
                value={taxRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="pr-8 h-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
            </div>
            <Button 
              onClick={handleManualSave} 
              disabled={isSaving || !taxRate}
              className="gap-2 shrink-0 h-12 px-6 font-bold"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-white px-3 text-slate-300">Or use local scan</span>
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              accept="application/pdf"
              onChange={scanPdfLocally}
              ref={fileInputRef}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={isUploading}
            />
            <Button
              variant="outline"
              className="w-full gap-2 text-xs border-dashed h-12 bg-slate-50/50 hover:bg-slate-100 transition-colors"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Scan Skattekort Locally (Privacy Safe)
                </>
              )}
            </Button>
          </div>

          <div className="mt-auto pt-4">
            {status === 'success' && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mb-2">
                <AlertCircle className="h-4 w-4" />
                {message}
              </div>
            )}

            <p className="text-[10px] text-slate-400 italic leading-tight">
              Note: All PDF processing stays in your browser. We never see your documents.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
