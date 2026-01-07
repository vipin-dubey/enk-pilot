import { createClient } from '@/utils/supabase/server'
import { redirect, Link } from '@/navigation'
import { SafeToSpendCalculator } from '@/components/dashboard/safe-to-spend'
import { DeadlineTracker } from '@/components/dashboard/deadline-tracker'
import { ReceiptTriage } from '@/components/dashboard/receipt-triage'
import { ReceiptAnalytics } from '@/components/dashboard/receipt-analytics'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, LayoutDashboard, Calendar, Receipt, Settings, Sparkles, UserCircle } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationCenter } from '@/components/dashboard/notification-center'
import { getTranslations } from 'next-intl/server'
import { MvaSummary } from '@/components/dashboard/mva-summary'
import { DeductionOptimizer } from '@/components/dashboard/deduction-optimizer'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('dashboard')
  const tTabs = await getTranslations('tabs')
  const tCommon = await getTranslations('common')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: '/login', locale })
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, use_manual_tax')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl font-outfit">
              <span className="text-blue-600">ENK</span> Pilot
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <LanguageSwitcher />
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border">
              <UserCircle className="h-5 w-5 text-slate-500" />
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{tCommon('logout')}</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">
              {t('title')}
            </h2>
            <p className="text-slate-500">
              {t('welcome', { name: profile?.full_name || user.email?.split('@')[0] })}
            </p>
          </div>
          
          {profile?.is_pro ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {t('proAccount')}
              </span>
            </div>
          ) : (
            <Card className="max-w-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold">{t('upgradeToPro')}</p>
                  <p className="text-xs text-blue-100">{t('unlockFeatures')}</p>
                </div>
                <Button size="sm" variant="secondary" className="ml-auto bg-white text-blue-700 hover:bg-blue-50 border-none font-bold">
                  {locale === 'nb' ? 'kr 299' : '$29'}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <Tabs defaultValue="safe-to-spend" className="space-y-8">
          <div className="flex items-center justify-between bg-white p-1.5 rounded-xl border shadow-sm sticky top-20 z-10">
            <TabsList className="bg-transparent border-none">
              <TabsTrigger value="safe-to-spend" className="gap-2 px-6 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
                <LayoutDashboard className="h-4 w-4" />
                {tTabs('safeToSpend')}
              </TabsTrigger>
              <TabsTrigger value="deadlines" className="gap-2 px-6 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
                <Calendar className="h-4 w-4" />
                {tTabs('deadlines')}
              </TabsTrigger>
              <TabsTrigger value="receipts" className="gap-2 px-6 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
                <Receipt className="h-4 w-4" />
                {tTabs('receipts')}
              </TabsTrigger>
            </TabsList>
            
            <Link href="/settings">
              <Button variant="outline" size="sm" className="hidden md:flex gap-2 mr-1">
                <Settings className="h-4 w-4" />
                {t('settings')}
              </Button>
            </Link>
          </div>

          <TabsContent value="safe-to-spend" className="mt-0 border-none p-0 focus-visible:ring-0">
            <div className="space-y-6">
              <SafeToSpendCalculator 
                initialTaxRate={profile?.tax_rate_percent}
                isMvaRegistered={profile?.is_mva_registered} 
                ytdGrossIncome={profile?.ytd_gross_income}
                ytdExpenses={profile?.ytd_expenses}
                externalSalary={profile?.external_salary_income}
                useManualTax={profile?.use_manual_tax}
                virtualDeductions={
                  (profile?.has_home_office ? 2050 : 0) + 
                  ((profile?.estimated_annual_mileage || 0) * 3.50)
                }
              />
              <DeductionOptimizer />
              {profile?.is_mva_registered && <MvaSummary />}
            </div>
          </TabsContent>

          <TabsContent value="deadlines" className="mt-0 border-none p-0 focus-visible:ring-0">
            <DeadlineTracker />
          </TabsContent>

          <TabsContent value="receipts" className="mt-0 border-none p-0 focus-visible:ring-0 space-y-6">
            <ReceiptAnalytics />
            <ReceiptTriage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function Card({ children, className, ...props }: any) {
  return <div className={`rounded-xl border bg-white shadow-sm ${className}`} {...props}>{children}</div>
}

function CardHeader({ children, className, ...props }: any) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>
}

function CardTitle({ children, className, ...props }: any) {
  return <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>
}

function CardDescription({ children, className, ...props }: any) {
  return <p className={`text-sm text-slate-500 ${className}`} {...props}>{children}</p>
}

function CardContent({ children, className, ...props }: any) {
  return <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>
}
