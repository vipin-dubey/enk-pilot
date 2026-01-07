'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight, Lightbulb, TrendingUp, AlertCircle, Info, Calculator } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import { Link } from '@/navigation'
import { UpgradeModal } from './upgrade-modal'
import { Lock } from 'lucide-react'

interface Insight {
  id: string
  type: 'opportunity' | 'warning' | 'tip'
  title: string
  description: string
  impact?: string
  actionLabel?: string
  actionHref?: string
}

export function SmartTaxAssistant({ isPro, seatsLeft, percentFull }: { isPro?: boolean, seatsLeft?: number, percentFull?: number }) {
  const t = useTranslations('taxInsights')
  const locale = useLocale()
  const [profile, setProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const hidden = localStorage.getItem('hide_tax_insights')
    if (hidden === 'true') setIsVisible(false)
    fetchData()

    // Polling to keep insights fresh as user adds data
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const dismiss = () => {
    setIsVisible(false)
    localStorage.setItem('hide_tax_insights', 'true')
  }

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, allocationsRes, receiptsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('allocations').select('*').eq('user_id', user.id),
        supabase.from('receipts').select('*').eq('user_id', user.id).eq('is_processed', true)
      ])

      setProfile(profileRes.data)
      
      const combined = [
        ...(allocationsRes.data || []).map(a => ({ ...a, trType: 'income' })),
        ...(receiptsRes.data || []).map(r => ({ ...r, trType: 'expense', amount: Number(r.amount) }))
      ]
      setTransactions(combined)
    } catch (error) {
      console.error('Error fetching data for insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const insights = useMemo(() => {
    if (!profile) return []
    const list: Insight[] = []

    // 1. Depreciation Warning (> 15,000 NOK)
    const expensiveItems = transactions.filter(tr => 
      tr.trType === 'expense' && 
      tr.amount >= 15000 && 
      (
        ['Equipment', 'IT', 'Software', 'Tools', 'Hardware'].includes(tr.category) ||
        tr.vendor?.toLowerCase().includes('apple') ||
        tr.vendor?.toLowerCase().includes('elkjøp') ||
        tr.vendor?.toLowerCase().includes('power') ||
        tr.vendor?.toLowerCase().includes('komplett')
      )
    )
    if (expensiveItems.length > 0) {
      list.push({
        id: 'depreciation',
        type: 'warning',
        title: locale === 'nb' ? 'Husk avskrivning' : 'Hardware Depreciation',
        description: locale === 'nb' 
          ? `Du har kjøp over 15 000 kr (${expensiveItems[0].vendor}). Disse må vanligvis avskrives over flere år i stedet for å fradragsføres med en gang.`
          : `You have purchases over 15,000 NOK (e.g., ${expensiveItems[0].vendor}). These assets typically must be depreciated over several years for tax purposes.`,
        impact: locale === 'nb' ? 'Skatte-etterlevelse' : 'Regulatory Compliance',
        actionLabel: locale === 'nb' ? 'Lær om regler' : 'View Rules'
      })
    }

    // 2. Missed Monthly Internet/Phone
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    const telcoTr = transactions.filter(tr => 
      tr.trType === 'expense' && 
      new Date(tr.receipt_date || tr.created_at) > last30Days &&
      (
        tr.category?.toLowerCase() === 'internet' || 
        tr.category?.toLowerCase() === 'communication' || 
        tr.category?.toLowerCase() === 'phone' ||
        tr.vendor?.toLowerCase().includes('telenor') || 
        tr.vendor?.toLowerCase().includes('telia') || 
        tr.vendor?.toLowerCase().includes('ice') ||
        tr.vendor?.toLowerCase().includes('altibox')
      )
    )
    if (telcoTr.length === 0) {
      list.push({
        id: 'telco',
        type: 'opportunity',
        title: locale === 'nb' ? 'Glemt mobil/internett?' : 'Missed Internet/Phone?',
        description: locale === 'nb'
          ? 'Vi ser ingen utgifter til telefon/nett. Du kan vanligvis fradragsføre 50% av disse (f.eks. ved å føre halve beløpet på kvitteringen).'
          : 'We haven\'t seen any phone/internet bills lately. Pro Tip: You can normally deduct 50% of these for your ENK (just record half the invoice amount).',
        impact: '~NOK 500/mo',
        actionLabel: locale === 'nb' ? 'Før teleregning' : 'Record Internet/Phone Receipt'
      })
    }

    // 3. Professional Membership Cap
    const membershipTr = transactions.filter(tr => 
      tr.trType === 'expense' && 
      (tr.category === 'Membership' || tr.vendor?.toLowerCase().includes('fagforening') || tr.vendor?.toLowerCase().includes('kontingent'))
    )
    const totalMembership = membershipTr.reduce((acc, curr) => acc + curr.amount, 0)
    if (totalMembership === 0) {
      list.push({
        id: 'membership',
        type: 'tip',
        title: locale === 'nb' ? 'Fagforening og medlemskap' : 'Trade Unions & Memberships',
        description: locale === 'nb'
          ? 'Betaler du kontingent til en fagforening? Husk at dette er fradragsberettiget opp til 7 700 kr. Skann kvitteringen hvis du har en.'
          : 'Are you a member of a trade union or professional body? Record the receipt to save tax—you can deduct up to 7,700 NOK/year.',
        impact: 'Up to 7.7k/year',
        actionLabel: locale === 'nb' ? 'Før medlemskontingent' : 'Record Membership Receipt'
      })
    }

    // 4. MVA Threshold Warning
    const ytdGross = profile.ytd_gross_income || 0
    if (!profile.is_mva_registered && ytdGross > 35000 && ytdGross < 50000) {
      list.push({
        id: 'mva-threshold',
        type: 'warning',
        title: locale === 'nb' ? 'Nærmer deg MVA-grensen' : 'Approaching MVA Threshold',
        description: locale === 'nb'
          ? `Du har nå ${ytdGross.toLocaleString()} kr i omsetning. Ved 50 000 kr må du søke om MVA-registrering.`
          : `You've reached ${ytdGross.toLocaleString()} NOK in revenue. You must apply for MVA registration once you hit 50,000 NOK.`,
        impact: 'Legal Requirement',
        actionLabel: locale === 'nb' ? 'Slik søker du' : 'How to apply'
      })
    }

    return list
  }, [profile, transactions, locale])

  // Persist count for the header badge
  useEffect(() => {
    localStorage.setItem('tax_insight_count', insights.length.toString())
  }, [insights.length])

  const handleAction = (insight: Insight) => {
    if (insight.id === 'telco' || insight.id === 'membership') {
      // The ultimate fix: Dispatch a custom event that DashboardTabs is listening for
      window.dispatchEvent(new CustomEvent('switch-dashboard-tab', { 
        detail: { tab: 'receipts' } 
      }))
      window.scrollTo({ top: 150, behavior: 'smooth' })
    } else if (insight.id === 'mva-threshold') {
      window.open('https://www.brreg.no/bedrift/mva-registrering/', '_blank')
    } else if (insight.id === 'depreciation') {
      window.open('https://www.skatteetaten.no/en/business-and-organisation/start-and-run/operating-expenses/depreciation-of-assets/', '_blank')
    }
  }

  if (loading || !isVisible || insights.length === 0) return null

  return (
    <Card className="border-none shadow-premium bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative">
      {!isPro && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mb-3 shadow-lg">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-1">AI Tax Audit Found Insights</h4>
          <p className="text-[10px] text-slate-300 max-w-[200px] mb-4">
            We found {insights.length} ways to optimize your taxes. Upgrade to Pro to see your personalized alerts.
          </p>
          <Button 
            size="sm" 
            onClick={() => setShowUpgrade(true)}
            className="h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold mb-2 w-full max-w-[160px]"
          >
            Unlock Intelligence
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={dismiss}
            className="h-8 text-slate-400 hover:text-white hover:bg-white/10 text-[10px] uppercase font-bold tracking-widest"
          >
            Hide these insights
          </Button>
        </div>
      )}
      
      <CardHeader className="pb-2 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold font-outfit">{t('title')}</CardTitle>
              <CardDescription className="text-slate-400 text-xs">{t('description')}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white border-none uppercase text-[9px] tracking-widest font-black hidden sm:inline-flex">
              {t('proFeature')}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white/10 text-slate-400"
              onClick={dismiss}
            >
              <ArrowRight className="h-4 w-4 rotate-90" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {insights.map(insight => (
            <div key={insight.id} className="p-4 hover:bg-white/5 transition-colors group">
              <div className="flex gap-4">
                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 
                  ${insight.type === 'opportunity' ? 'bg-emerald-500/10 text-emerald-400' : 
                    insight.type === 'warning' ? 'bg-amber-500/10 text-amber-400' : 
                    'bg-blue-500/10 text-blue-400'}`}>
                  {insight.type === 'opportunity' ? <TrendingUp className="h-4 w-4" /> : 
                   insight.type === 'warning' ? <AlertCircle className="h-4 w-4" /> : 
                   <Lightbulb className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                      {insight.title}
                    </h4>
                    {insight.impact && (
                      <span className="text-[10px] font-black bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                        {insight.impact}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.actionLabel && (
                    <div className="pt-1">
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-blue-400 text-xs font-bold group-hover:translate-x-1 transition-transform"
                        onClick={() => handleAction(insight)}
                      >
                        {insight.actionLabel} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-blue-600/10 p-3 text-center border-t border-white/5">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
            Privacy: Local scanning in browser • No data leaves your machine
          </p>
        </div>
      </CardContent>

      {showUpgrade && (
        <UpgradeModal 
          isOpen={showUpgrade} 
          onClose={() => setShowUpgrade(false)} 
          seatsLeft={seatsLeft || 0}
          percentFull={percentFull || 0}
        />
      )}
    </Card>
  )
}
