import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import { redirect, Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Lock, Globe, Save, CheckCircle2, AlertCircle, Bell, Briefcase } from 'lucide-react'
import { LocaleSettings } from './locale-settings'
import { PasswordSettings } from './password-settings'
import { ReminderSettings } from './reminder-settings'
import { BusinessSettings } from './business-settings'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('settingsPage')
  const tr = await getTranslations('reminderSettings')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: '/login', locale })
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <h1 className="text-xl font-bold font-outfit text-slate-900">{t('title')}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">{t('title')}</h2>
            <p className="text-slate-500">{t('description')}</p>
          </div>

          <div className="grid gap-8">
            {/* Account Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Globe className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">{t('account')}</h3>
              </div>
              <LocaleSettings initialLocale={profile?.default_locale || locale} />
            </div>

            {/* Business Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">{t('business')}</h3>
              </div>
              <BusinessSettings 
                initialSettings={{
                  isMvaRegistered: profile?.is_mva_registered ?? false,
                  ytdGrossIncome: profile?.ytd_gross_income ?? 0,
                  ytdExpenses: profile?.ytd_expenses ?? 0,
                  externalSalary: profile?.external_salary_income ?? 0,
                  estimatedAnnualProfit: profile?.estimated_annual_profit ?? 0,
                  annualPrepaidTaxAmount: profile?.annual_prepaid_tax_amount ?? 0
                }} 
              />
            </div>

            {/* Notification Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Bell className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">{tr('title')}</h3>
              </div>
              <ReminderSettings 
                initialSettings={{
                  emailEnabled: profile?.email_notifications_enabled ?? true,
                  pushEnabled: profile?.push_notifications_enabled ?? true,
                  leadDays: profile?.reminder_lead_days ?? [1, 7, 14]
                }} 
              />
            </div>

            {/* Security Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Lock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">{t('security')}</h3>
              </div>
              <PasswordSettings />
            </div>
          </div>

          <div className="pt-8">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                {t('backToDashboard')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
