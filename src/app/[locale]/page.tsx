import { createClient } from '@/utils/supabase/server'
import { redirect } from '@/navigation'
import { SafeToSpendCalculator } from '@/components/dashboard/safe-to-spend'
import { DeadlineTracker } from '@/components/dashboard/deadline-tracker'
import { ReceiptTriage } from '@/components/dashboard/receipt-triage'
import { ReceiptAnalytics } from '@/components/dashboard/receipt-analytics'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, LayoutDashboard, Calendar, Receipt, Settings } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getTranslations } from 'next-intl/server'

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

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">EP</span>
            </div>
            <h1 className="text-xl font-bold font-outfit uppercase tracking-tighter text-slate-900">ENK Pilot</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-sm font-medium text-slate-600 hidden sm:block">
              {user.email}
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{tCommon('logout')}</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col gap-1 mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">
            {t('welcome', { name: user.user_metadata.full_name || user.email?.split('@')[0] })}
          </h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {t('proAccount')}
            </span>
          </div>
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
            
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 mr-1">
              <Settings className="h-4 w-4" />
              {t('settings')}
            </Button>
          </div>

          <TabsContent value="safe-to-spend" className="mt-0 border-none p-0 focus-visible:ring-0">
            <div className="space-y-6">
              <SafeToSpendCalculator 
                taxRate={user.user_metadata.tax_rate} 
                isMvaRegistered={user.user_metadata.is_mva_registered} 
              />
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
