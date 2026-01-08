import { createClient } from '@/utils/supabase/server'
import { redirect, Link } from '@/navigation'
import { SafeToSpendCalculator } from '@/components/dashboard/safe-to-spend'
import { DeadlineTracker } from '@/components/dashboard/deadline-tracker'
import { ReceiptTriage } from '@/components/dashboard/receipt-triage'
import { ReceiptAnalytics } from '@/components/dashboard/receipt-analytics'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, LayoutDashboard, Calendar, Receipt, Settings, Sparkles, UserCircle, History, ShieldCheck, Globe } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationCenter } from '@/components/dashboard/notification-center'
import { PublicFooter } from '@/components/layout/footer'
import { getTranslations } from 'next-intl/server'
import { MvaSummary } from '@/components/dashboard/mva-summary'
import { DeductionOptimizer } from '@/components/dashboard/deduction-optimizer'
import { LegalShield } from '@/components/dashboard/legal-shield'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TransactionJournal } from '@/components/dashboard/transaction-journal'
import { SmartTaxAssistant } from '@/components/dashboard/smart-tax-assistant'
import { DashboardHeaderActions } from '@/components/dashboard/header-actions'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'
import { CfoAnalytics } from '@/components/dashboard/cfo-analytics'
import { signout } from './login/actions'
import { MobileMenu } from '@/components/dashboard/mobile-menu'
import { LandingPage } from '@/components/landing-page'

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ message?: string }>
}) {
  const { locale } = await params
  const { message } = await searchParams
  const t = await getTranslations('dashboard')
  const tTabs = await getTranslations('tabs')
  const tCommon = await getTranslations('common')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const host = (await (await import('next/headers')).headers()).get('host') || ''

  if (!user) {
    return <LandingPage locale={locale} host={host} />
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, use_manual_tax, is_founding_user, subscription_status, plan_type, trial_exports_used')
    .eq('id', user.id)
    .single()

  const { count: foundingCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('plan_type', 'founding')

  // Real capacity is 100. We add 37 for social proof.
  const baseFoundingCount = 37
  const virtualTotal = 137
  const currentTaken = (foundingCount || 0) + baseFoundingCount
  const seatsLeft = Math.max(0, 100 - (foundingCount || 0))
  const percentFull = Math.round((currentTaken / virtualTotal) * 100)

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="ENK Pilot" className="h-8 w-auto object-contain" />
              <span className="sr-only">ENK Pilot</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              {profile?.is_founding_user && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full shadow-sm animate-in fade-in zoom-in duration-500">
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    {tCommon('foundingUser')}
                  </span>
                </div>
              )}
              {(!profile?.plan_type || profile?.plan_type === 'free') && !profile?.is_founding_user && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full shadow-sm animate-in fade-in zoom-in duration-500">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {tCommon('freePlan')}
                  </span>
                </div>
              )}
              <NotificationCenter />
            </div>
            
            {/* Desktop Only Actions */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border">
                <UserCircle className="h-5 w-5 text-slate-500" />
              </div>
              <form action={signout}>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
                  <LogOut className="h-4 w-4" />
                  <span>{tCommon('logout')}</span>
                </Button>
              </form>
            </div>

            {/* Mobile Dedicated Menu */}
            <MobileMenu isPro={profile?.plan_type === 'founding' || profile?.subscription_status === 'active'} profile={profile} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-8 pb-4 max-w-6xl">
        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-4 duration-500">
            <ShieldCheck className="h-5 w-5" />
            <p className="font-bold text-sm tracking-tight">{message}</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="flex items-start justify-between w-full md:w-auto gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">
                {t('title')}
              </h2>
              <p className="text-slate-500 text-sm md:text-base truncate max-w-[200px] xs:max-w-none">
                {t('welcome', { name: profile?.full_name || user.email?.split('@')[0] })}
              </p>
            </div>
            
            <div className="md:hidden pt-1 shrink-0">
              <DashboardHeaderActions showSettings={false} />
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
            {profile?.is_pro && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {t('proAccount')}
                </span>
              </div>
            )}
            {!profile?.is_pro && (
              <Link href="/upgrade" className="max-w-sm w-full">
                <Card className="w-full bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white border-none shadow-xl overflow-hidden relative group transition-all hover:shadow-2xl hover:-translate-y-0.5 animate-in fade-in slide-in-from-right duration-700 cursor-pointer">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="h-12 w-12" />
                  </div>
                
                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-white">
                    {locale === 'nb' ? 'Begrenset tid' : 'Limited Time'}
                  </span>
                </div>

                <div className="p-5 pt-8 flex items-center gap-4 relative z-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black tracking-tight">{locale === 'nb' ? 'Grunnlegger-tilbud' : 'Founding Offer'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-blue-100 font-medium leading-tight line-clamp-1">
                        {locale === 'nb' ? `${seatsLeft} plasser igjen!` : `${seatsLeft} seats left!`}
                      </p>
                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden max-w-[60px]">
                          <div 
                            className="h-full bg-amber-400 transition-all duration-1000" 
                            style={{ width: `${percentFull}%` }}
                          ></div>
                        </div>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50 border-none font-black shadow-sm h-8 px-4">
                    kr 299
                  </Button>
                </div>
                </Card>
              </Link>
            )}
        </div>
      </div>

      <DashboardTabs>
          {{
            safeToSpend: (
              <div className="space-y-6">
                <SmartTaxAssistant 
                  isPro={profile?.is_pro} 
                  seatsLeft={seatsLeft} 
                  percentFull={percentFull} 
                />
                <SafeToSpendCalculator 
                  initialTaxRate={profile?.tax_rate_percent}
                  isMvaRegistered={profile?.is_mva_registered} 
                  ytdGrossIncome={profile?.ytd_gross_income}
                  ytdExpenses={profile?.ytd_expenses}
                  externalSalary={profile?.external_salary_income}
                  useManualTax={profile?.use_manual_tax}
                  isPro={profile?.is_pro}
                  seatsLeft={seatsLeft}
                  percentFull={percentFull}
                  virtualDeductions={
                    (profile?.has_home_office ? 2050 : 0) + 
                    ((profile?.estimated_annual_mileage || 0) * 3.50)
                  }
                />
                <DeductionOptimizer />
                {profile?.is_mva_registered && <MvaSummary />}
              </div>
            ),
            deadlines: <DeadlineTracker />,
            receipts: (
              <div className="space-y-6">
                <ReceiptAnalytics />
                <ReceiptTriage />
              </div>
            ),
            history: (
              <TransactionJournal 
                isPro={profile?.is_pro} 
                trialExportsUsed={profile?.trial_exports_used || 0}
                seatsLeft={seatsLeft}
                percentFull={percentFull}
              />
            ),
            analytics: (
              <CfoAnalytics 
                isPro={profile?.is_pro}
                seatsLeft={seatsLeft}
                percentFull={percentFull}
              />
            )
          }}
        </DashboardTabs>

        {/* Global Legal Shield */}
        <LegalShield />
      </main>

      <PublicFooter />
    </div>
  )
}

