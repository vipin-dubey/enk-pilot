'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function TaxPdfSync() {
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setStatus('idle')
    setMessage('')

    try {
      const supabase = createClient()
      
      // 1. Get the session to pass auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('You must be logged in to sync your tax PDF.')
      }

      // 2. Read file as base64 or send as FormData
      // Since we are not storing the PDF, we send it directly to the Edge Function
      const formData = new FormData()
      formData.append('file', file)

      const { data, error } = await supabase.functions.invoke('parse-tax-pdf', {
        body: formData,
      })

      if (error) throw error

      setStatus('success')
      setMessage(`Successfully extracted tax rate: ${data.tax_rate_percent}%`)
      
      // Optionally trigger a refresh of the dashboard data
      window.location.reload() 

    } catch (err: any) {
      console.error('Error syncing tax PDF:', err)
      setStatus('error')
      setMessage(err.message || 'Failed to parse tax PDF. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="bg-slate-50/50 border-dashed">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileUp className="h-4 w-4 text-blue-600" />
          Sync Tax Rate from PDF
        </CardTitle>
        <CardDescription className="text-xs">
          Upload your "Skattekort" PDF from Skatteetaten to automatically set your tax rate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={isUploading}
            />
            <Button
              variant="outline"
              className="w-full gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Choose Skattekort PDF
                </>
              )}
            </Button>
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {message}
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
              <AlertCircle className="h-3.5 w-3.5" />
              {message}
            </div>
          )}

          <p className="text-[10px] text-slate-400">
            Privacy: Your PDF is processed securely and never stored.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
