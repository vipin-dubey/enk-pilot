'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslations } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Save, CheckCircle2, AlertCircle, FileUp } from 'lucide-react'
import { useRef } from 'react'

interface BusinessSettingsProps {
  initialSettings: {
    isMvaRegistered: boolean
    ytdGrossIncome: number
    ytdExpenses: number
    externalSalary: number
    estimatedAnnualProfit: number
    annualPrepaidTaxAmount: number
  }
}

export function BusinessSettings({ initialSettings }: BusinessSettingsProps) {
  const t = useTranslations('settingsPage')
  const [isMvaRegistered, setIsMvaRegistered] = useState(initialSettings.isMvaRegistered)
  const [ytdGrossIncome, setYtdGrossIncome] = useState(initialSettings.ytdGrossIncome.toString())
  const [ytdExpenses, setYtdExpenses] = useState(initialSettings.ytdExpenses.toString())
  const [externalSalary, setExternalSalary] = useState(initialSettings.externalSalary.toString())
  const [estimatedAnnualProfit, setEstimatedAnnualProfit] = useState(initialSettings.estimatedAnnualProfit.toString())
  const [annualPrepaidTaxAmount, setAnnualPrepaidTaxAmount] = useState(initialSettings.annualPrepaidTaxAmount.toString())
  const [isSaving, setIsSaving] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setStatus('idle')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          is_mva_registered: isMvaRegistered,
          ytd_gross_income: parseFloat(ytdGrossIncome) || 0,
          ytd_expenses: parseFloat(ytdExpenses) || 0,
          external_salary_income: parseFloat(externalSalary) || 0,
          estimated_annual_profit: parseFloat(estimatedAnnualProfit) || 0,
          annual_prepaid_tax_amount: parseFloat(annualPrepaidTaxAmount) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error('Failed to update business settings:', err)
      setStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleScanPdf = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    try {
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      
      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n'
      }

      // Look for Forskuddsskatt amounts
      // Pattern: "Å betale" or "Beløp" followed by a number
      const patterns = [
        /(?:Å betale|Beløp|Total|Sum|Forskuddsskatt)\s*[:\-]?\s*(\d+[\s\d]*)/i,
        /KR\s*(\d+[\s\d]*)/i
      ]

      let detected = null
      for (const pattern of patterns) {
        const match = fullText.match(pattern)
        if (match && match[1]) {
          detected = match[1].replace(/\s+/g, '')
          // Usually prepaid tax is a round/large number, let's pick the first big one
          if (parseInt(detected) > 100) break
        }
      }

      if (detected) {
        setAnnualPrepaidTaxAmount(detected)
        setStatus('success')
      } else {
        alert(t('prepaidNotFound'))
      }
    } catch (error) {
      console.error('Error scanning prepaid PDF:', error)
      alert('Failed to scan PDF locally.')
    } finally {
      setIsScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="mva-status" className="font-bold">{t('mvaStatus')}</Label>
            <p className="text-xs text-slate-500">{t('mvaDescription')}</p>
          </div>
          <Checkbox 
            id="mva-status" 
            checked={isMvaRegistered} 
            onCheckedChange={(checked) => setIsMvaRegistered(checked as boolean)}
            className="h-5 w-5"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ytd-income" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('ytdIncome')}
            </Label>
            <div className="relative">
              <Input
                id="ytd-income"
                type="number"
                value={ytdGrossIncome}
                onChange={(e) => setYtdGrossIncome(e.target.value)}
                className="font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">NOK</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ytd-expenses" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('ytdExpenses')}
            </Label>
            <div className="relative">
              <Input
                id="ytd-expenses"
                type="number"
                value={ytdExpenses}
                onChange={(e) => setYtdExpenses(e.target.value)}
                className="font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">NOK</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="external-salary" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t('externalSalary')}
          </Label>
          <div className="relative">
            <Input
              id="external-salary"
              type="number"
              value={externalSalary}
              onChange={(e) => setExternalSalary(e.target.value)}
              className="font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">NOK / YEAR</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="estimated-profit" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('estimatedAnnualProfit')}
            </Label>
            <div className="relative">
              <Input
                id="estimated-profit"
                type="number"
                value={estimatedAnnualProfit}
                onChange={(e) => setEstimatedAnnualProfit(e.target.value)}
                className="font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">NOK / YEAR</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap min-h-[28px]">
              <Label htmlFor="annual-prepaid" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 py-1">
                {t('annualPrepaidTax')}
              </Label>
              <div className="relative shrink-0">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleScanPdf}
                  ref={fileInputRef}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  disabled={isScanning}
                />
                <Button variant="ghost" size="sm" className="h-7 text-[10px] text-blue-600 font-bold hover:bg-blue-50 px-2 gap-1.5 whitespace-nowrap">
                  {isScanning ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileUp className="h-3 w-3" />}
                  {t('scanPrepaid')}
                </Button>
              </div>
            </div>
            <div className="relative">
              <Input
                id="annual-prepaid"
                type="number"
                value={annualPrepaidTaxAmount}
                onChange={(e) => setAnnualPrepaidTaxAmount(e.target.value)}
                className="font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">NOK / YEAR</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex-1">
            {status === 'success' && (
              <div className="flex items-center gap-2 text-sm text-green-600 animate-in fade-in slide-in-from-left-2 transition-all">
                <CheckCircle2 className="h-4 w-4" />
                {t('saveSuccess')}
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {t('saveError')}
              </div>
            )}
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2 px-8 font-bold rounded-xl"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
