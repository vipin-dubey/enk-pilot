import { createClient } from '@/utils/supabase/server'
import { redirect, Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Calendar, Receipt, Settings, Sparkles, UserCircle, History, ShieldCheck, Globe } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { PublicFooter } from '@/components/layout/footer'
import { getTranslations, getMessages } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import { signout } from '../login/actions'
import { getUpcomingDeadlines } from '@/lib/deadlines'
import { Metadata } from 'next'
import Image from 'next/image'
import { NextIntlClientProvider } from 'next-intl'

// Dynamic imports for dashboard components
const NotificationCenter = dynamic(() => import('@/components/dashboard/notification-center').then(mod => mod.NotificationCenter))
const MobileMenu = dynamic(() => import('@/components/dashboard/mobile-menu').then(mod => mod.MobileMenu))
const DashboardHeaderActions = dynamic(() => import('@/components/dashboard/header-actions').then(mod => mod.DashboardHeaderActions))
const SafeToSpendCalculator = dynamic(() => import('@/components/dashboard/safe-to-spend').then(mod => mod.SafeToSpendCalculator))
const DeadlineTracker = dynamic(() => import('@/components/dashboard/deadline-tracker').then(mod => mod.DeadlineTracker))
const ReceiptTriage = dynamic(() => import('@/components/dashboard/receipt-triage').then(mod => mod.ReceiptTriage))
const ReceiptAnalytics = dynamic(() => import('@/components/dashboard/receipt-analytics').then(mod => mod.ReceiptAnalytics))
const MvaSummary = dynamic(() => import('@/components/dashboard/mva-summary').then(mod => mod.MvaSummary))
const DeductionOptimizer = dynamic(() => import('@/components/dashboard/deduction-optimizer').then(mod => mod.DeductionOptimizer))
const LegalShield = dynamic(() => import('@/components/dashboard/legal-shield').then(mod => mod.LegalShield))
const TransactionJournal = dynamic(() => import('@/components/dashboard/transaction-journal').then(mod => mod.TransactionJournal))
const SmartTaxAssistant = dynamic(() => import('@/components/dashboard/smart-tax-assistant').then(mod => mod.SmartTaxAssistant))
const DashboardTabs = dynamic(() => import('@/components/dashboard/dashboard-tabs').then(mod => mod.DashboardTabs))
const CfoAnalytics = dynamic(() => import('@/components/dashboard/cfo-analytics').then(mod => mod.CfoAnalytics))
const OverviewPulse = dynamic(() => import('@/components/dashboard/overview-pulse').then(mod => mod.OverviewPulse))

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'dashboard' })

    return {
        title: `${t('title')} | ENK Pilot`,
        robots: { index: false, follow: false } // Keep dashboard out of search engines
    }
}

export default async function DashboardPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ message?: string; restored?: string }>
}) {
    const { locale } = await params
    const { message, restored } = await searchParams
    const t = await getTranslations('dashboard')
    const tTabs = await getTranslations('tabs')
    const tCommon = await getTranslations('common')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const messages = await getMessages({ locale })

    if (!user) {
        redirect({ href: '/login', locale: locale as any })
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, use_manual_tax, is_founding_user, subscription_status, plan_type, trial_exports_used')
        .eq('id', user!.id)
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

    // Fetch aggregate data for Overview Pulse
    const currentYear = new Date().getFullYear()
    const startDate = `${currentYear}-01-01`

    const { data: allocations } = await supabase
        .from('allocations')
        .select('gross_amount, safe_to_spend, tax_reserved, mva_reserved')
        .eq('user_id', user!.id)
        .gte('date', startDate)

    const { data: receipts } = await supabase
        .from('receipts')
        .select('amount')
        .eq('user_id', user!.id)
        .eq('is_processed', true)
        .gte('receipt_date', startDate)

    const totals = (allocations || []).reduce((acc, curr) => ({
        grossIncome: acc.grossIncome + (Number(curr.gross_amount) || 0),
        safeToSpend: acc.safeToSpend + (Number(curr.safe_to_spend) || 0),
        taxReserved: acc.taxReserved + (Number(curr.tax_reserved) || 0),
        mvaReserved: acc.mvaReserved + (Number(curr.mva_reserved) || 0),
    }), { grossIncome: 0, safeToSpend: 0, taxReserved: 0, mvaReserved: 0 })

    const totalExpenses = (receipts || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

    // Real-time Safe to Spend should subtract actual expenses
    const adjustedSafeToSpend = Math.max(0, totals.safeToSpend - totalExpenses)

    const upcomingDeadlines = getUpcomingDeadlines()
    const actualNextDeadline = upcomingDeadlines.filter(d => d.date.getTime() >= new Date().setHours(0, 0, 0, 0))[0]

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'ENK Pilot',
        description: tTabs('overview'),
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'NOK',
        },
    }

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <div className="min-h-screen bg-slate-50/50">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur-md">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link href="/dashboard" className="flex items-center">
                                <Image
                                    src="/logo.png"
                                    alt="ENK Pilot"
                                    width={120}
                                    height={32}
                                    className="h-8 w-auto object-contain"
                                    priority
                                />
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
                            <div className="hidden md:flex items-center gap-2 lg:gap-3">
                                <LanguageSwitcher />

                                <Link href="/settings">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                        <Settings className="h-5 w-5" />
                                        <span className="sr-only">{tCommon('settings')}</span>
                                    </Button>
                                </Link>

                                <form action={signout}>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                                        <LogOut className="h-5 w-5" />
                                        <span className="sr-only">{tCommon('logout')}</span>
                                    </Button>
                                </form>

                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                    <UserCircle className="h-5 w-5 text-slate-500" />
                                </div>
                            </div>

                            {/* Mobile Dedicated Menu */}
                            <MobileMenu isPro={profile?.plan_type === 'founding' || profile?.subscription_status === 'active'} profile={profile} />
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 pt-8 pb-4 max-w-6xl">
                    {(message || restored === 'true') && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-4 duration-500">
                            <ShieldCheck className="h-5 w-5" />
                            <p className="font-bold text-sm tracking-tight">
                                {restored === 'true' ? tCommon('accountRestored') : message}
                            </p>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                        <div className="flex items-start justify-between w-full md:w-auto gap-4">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">
                                    {t('title')}
                                </h2>
                                <p className="text-slate-500 text-sm md:text-base truncate max-w-[200px] xs:max-w-none">
                                    {t('welcome', { name: profile?.full_name || user!.email?.split('@')[0] })}
                                </p>
                            </div>

                            <div className="md:hidden pt-1 shrink-0">
                                <Link href="/settings">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 rounded-full">
                                        <Settings className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-3">
                            <DashboardHeaderActions />

                            <div className="flex flex-col items-center md:items-end gap-4">
                                {profile?.is_pro && (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            {t('proAccount')}
                                        </span>
                                    </div>
                                )}
                                {/* Upgrade card removed - service is free */}
                            </div>
                        </div>
                    </div>

                    <DashboardTabs>
                        {{
                            overview: (
                                <OverviewPulse
                                    totalSafeToSpend={adjustedSafeToSpend}
                                    totalTaxReserved={totals.taxReserved}
                                    totalMvaReserved={totals.mvaReserved}
                                    ytdProfit={totals.grossIncome}
                                    ytdExpenses={totalExpenses}
                                    nextDeadline={actualNextDeadline ? {
                                        type: actualNextDeadline.type,
                                        date: actualNextDeadline.date,
                                        label: actualNextDeadline.label
                                    } : undefined}
                                    isPro={profile?.plan_type === 'founding'}
                                />
                            ),
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
                                        ytdGrossIncome={totals.grossIncome}
                                        ytdExpenses={totalExpenses}
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
        </NextIntlClientProvider>
    )
}
