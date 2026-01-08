'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogTitle, 
  DialogDescription,
  DialogHeader
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  History, 
  Settings, 
  Sparkles, 
  LogOut, 
  Bell, 
  CreditCard,
  User,
  ChevronRight,
  Globe,
  LineChart,
  ShieldCheck
} from 'lucide-react'
import { Link } from '@/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '../language-switcher'
import { signout } from '@/app/[locale]/login/actions'

export function MobileMenu({ isPro, profile }: { isPro?: boolean, profile?: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const tTabs = useTranslations('tabs')
  const locale = useLocale()
  const handleNavClick = (tab?: string) => {
    setIsOpen(false)
    if (tab && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('switch-dashboard-tab', { detail: { tab } }))
    }
  }

  const navItems = [
    { icon: LayoutDashboard, label: tTabs('safeToSpend'), href: '/#safe-to-spend', tab: 'safe-to-spend' },
    { icon: LineChart, label: tTabs('analytics'), href: '/#analytics', badge: 'Pro', tab: 'analytics' },
    { icon: History, label: tTabs('history'), href: '/#history', tab: 'history' },
    { icon: CreditCard, label: locale === 'nb' ? 'Oppgradering' : 'Upgrade', href: '/upgrade', highlight: !isPro },
    { icon: Settings, label: tCommon('settings'), href: '/settings' },
  ]

  const [hasHiddenInsights, setHasHiddenInsights] = useState(false)
  const [insightCount, setInsightCount] = useState(0)

  useEffect(() => {
    const checkHidden = () => {
      const hidden = typeof window !== 'undefined' && localStorage.getItem('hide_tax_insights') === 'true'
      const count = typeof window !== 'undefined' ? parseInt(localStorage.getItem('tax_insight_count') || '0', 10) : 0
      setHasHiddenInsights(hidden)
      setInsightCount(count)
    }
    
    checkHidden()
    const interval = setInterval(checkHidden, 2000)
    return () => clearInterval(interval)
  }, [])

  const restoreInsights = () => {
    localStorage.removeItem('hide_tax_insights')
    setHasHiddenInsights(false)
    setIsOpen(false)
    window.location.reload()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 rounded-full hover:bg-slate-100 transition-all duration-300">
          <Menu className="h-6 w-6 text-slate-900" />
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        showCloseButton={false}
        className="fixed inset-0 z-[100] w-screen h-screen max-w-none m-0 p-0 border-none bg-white flex flex-col sm:max-w-none translate-x-0 translate-y-0 top-0 left-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-500"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Navigation Menu</DialogTitle>
          <DialogDescription>Access all features of ENK Pilot</DialogDescription>
        </DialogHeader>

        {/* Top Bar - Tightened */}
        <div className="flex items-center justify-between p-4 border-b border-slate-50">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center">
            <img src="/logo.png" alt="ENK Pilot" className="h-7 w-auto object-contain" />
            <span className="sr-only">ENK Pilot</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 transition-all"
          >
            <X className="h-4 w-4 text-slate-900" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">
          {/* User Profile Summary - Tightened */}
          <div className="mb-4 p-3 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white border shadow-sm flex items-center justify-center">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-outfit font-bold text-sm text-slate-900 truncate">
                {profile?.full_name || 'Bruker'}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {isPro ? 'Pro Member' : 'Free Plan'}
                </span>
                {isPro && <Sparkles className="h-2 w-2 text-blue-500 fill-blue-500" />}
              </div>
            </div>
          </div>

          {/* Navigation Links - Ultra compact */}
          <nav className="space-y-2">
            {navItems.map((item, i) => (
              <Link 
                key={i} 
                href={item.href} 
                onClick={() => handleNavClick(item.tab)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  item.highlight 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  item.highlight ? 'bg-white/20' : 'bg-slate-50 border border-slate-100'
                }`}>
                  <item.icon className={`h-4 w-4 ${item.highlight ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <span className="font-outfit font-bold text-sm tracking-tight flex-1">
                  {item.label}
                </span>
                {item.badge && (
                   <span className="text-[7px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded-full shadow-sm">{item.badge}</span>
                )}
                {item.highlight && (
                   <span className="text-[8px] font-black uppercase bg-white text-blue-600 px-1.5 py-0.5 rounded-full">New</span>
                )}
                {!item.highlight && !item.badge && <ChevronRight className="h-3.5 w-3.5 opacity-20" />}
              </Link>
            ))}

            {/* Special Mobile Insight Action - Ultra compact */}
            {hasHiddenInsights && insightCount > 0 && (
              <button 
                onClick={restoreInsights}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
                <span className="font-outfit font-bold text-sm tracking-tight flex-1 text-left">
                  Show Insights
                </span>
                <span className="text-[9px] font-black bg-blue-600 text-white h-4.5 w-4.5 flex items-center justify-center rounded-full">
                  {insightCount}
                </span>
              </button>
            )}
          </nav>

          {/* Bottom Actions - Aligned & Streamlined */}
          <div className="mt-4 md:mt-auto space-y-1.5 pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between px-1 h-10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-slate-500" />
                </div>
                <span className="font-outfit font-bold text-sm text-slate-900">Språk</span>
              </div>
              <LanguageSwitcher />
            </div>

            <form action={signout} className="w-full">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-10 px-1 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent transition-all gap-3"
              >
                <div className="h-8 w-8 rounded-lg bg-rose-100/50 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="font-outfit font-bold text-sm">{tCommon('logout')}</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Unified Branding Footer - Grayscale */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100/50">
          <div className="flex flex-col items-center gap-4 opacity-60 grayscale">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">GDPR</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">EU Data</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Built with 🇳🇴 in Norway</p>
              <p className="text-[8px] text-slate-400 font-medium text-center leading-relaxed px-4">
                No data tracking, no external AI exposure.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
