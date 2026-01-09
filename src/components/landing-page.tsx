'use client'

import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  Sparkles,
  Zap,
  Receipt,
  Target,
  PieChart,
  ChevronRight,
  Check,
  Lock,
  Globe,
  ArrowRight,
  Menu,
  X,
  Activity,
  Download,
  BarChart3
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { PublicFooter } from '@/components/layout/footer'

export function LandingPage({ locale, host: serverHost }: { locale: string, host?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Robust absolute URL calculation
  const getAppUrl = () => {
    // Priority 1: Use window if on client
    if (typeof window !== 'undefined') {
      const { protocol, host, hostname } = window.location
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return `${protocol}//app.${host}`
      }
    }

    // Priority 2: Use serverHost if provided (for SEO/SSR)
    if (serverHost) {
      if (serverHost.includes('localhost') || serverHost.includes('127.0.0.1')) {
        return `http://app.${serverHost}`
      }
    }

    return `https://app.enkpilot.com`
  }

  const appBase = mounted ? getAppUrl() : ''
  const loginUrl = mounted ? `${appBase}/${locale}/login` : `/${locale}/login`
  const signupUrl = mounted ? `${appBase}/${locale}/signup` : `/${locale}/signup`

  const t = useTranslations('landing')

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900" suppressHydrationWarning>
      {/* Premium Header */}
      <header className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            <img src="/logo.png" alt="ENK Pilot" className="h-8 w-auto object-contain" />
            <span className="sr-only">ENK Pilot</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider">{t('nav.features')}</a>
            <a href="#security" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider">{t('nav.security')}</a>
            <a href="#pricing" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider">{t('nav.pricing')}</a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <a href={loginUrl}>
              <Button variant="ghost" className="hidden sm:flex text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl px-4">
                {t('nav.login')}
              </Button>
            </a>
            <a href={signupUrl}>
              <Button size="sm" className="bg-slate-900 hover:bg-black text-white font-black px-5 rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98] text-xs">
                {t('nav.startFree')}
              </Button>
            </a>
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col p-6 gap-6">
              <a
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-black font-outfit text-slate-900 uppercase tracking-tighter"
              >
                {t('nav.features')}
              </a>
              <a
                href="#security"
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-black font-outfit text-slate-900 uppercase tracking-tighter"
              >
                {t('nav.security')}
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-black font-outfit text-slate-900 uppercase tracking-tighter"
              >
                {t('nav.pricing')}
              </a>
              <hr className="border-slate-100" />
              <a
                href={loginUrl}
                className="text-lg font-black font-outfit text-blue-600 uppercase tracking-tighter"
              >
                {t('nav.login')}
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-[0.02] pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('hero.badge')}</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black font-outfit tracking-tight text-slate-900 mb-4 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {t.rich('hero.title', {
              highlight: (chunks) => <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{chunks}</span>
            })}
          </h1>

          <p className="max-w-xl mx-auto text-base lg:text-lg text-slate-500 font-medium mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            {t.rich('hero.description', {
              highlight: (chunks) => <span className="text-slate-900 font-bold underline decoration-blue-500 decoration-2 underline-offset-4">{chunks}</span>
            })}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <a href={signupUrl}>
              <Button size="lg" className="h-14 px-8 bg-slate-900 hover:bg-black text-white font-black text-base rounded-2xl shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95">
                {t('hero.joinNow')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:ml-2">
                {t('hero.foundingSeats', { count: 82 })}
              </p>
              <div className="flex -space-x-2 sm:ml-2 mt-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
            </div>
          </div>

          <div className="relative max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            {/* Contextual Glow */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-400 rounded-full blur-[100px] opacity-20" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-400 rounded-full blur-[100px] opacity-20" />

            <div className="rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white/50 backdrop-blur-sm p-2 lg:p-4 relative z-10">
              <div className="rounded-xl border border-slate-100 bg-slate-50 shadow-inner overflow-hidden aspect-[16/9] lg:aspect-auto lg:h-[480px] flex flex-col md:flex-row">
                {/* Mockup Sidebar/Navigation */}
                <div className="hidden md:flex w-16 bg-white border-r border-slate-200 flex-col items-center py-6 gap-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <img src="/logo-mark.png" alt="" className="h-5 w-5 brightness-0 invert" />
                  </div>
                  <div className="space-y-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-600"><PieChart className="h-4 w-4" /></div>
                    <div className="w-8 h-8 rounded-lg text-slate-400 flex items-center justify-center"><Receipt className="h-4 w-4" /></div>
                    <div className="w-8 h-8 rounded-lg text-slate-400 flex items-center justify-center"><Target className="h-4 w-4" /></div>
                  </div>
                </div>

                {/* Mockup Main Content */}
                <div className="flex-1 p-4 lg:p-8 flex flex-col gap-6 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200" />
                      <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* The Gauge Mockup */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-10 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <div className="relative w-48 h-48 lg:w-64 lg:h-64 mb-6">
                        {/* Circular Progress Gauge */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="50%" cy="50%" r="45%"
                            className="fill-none stroke-slate-100 stroke-[8]"
                          />
                          <circle
                            cx="50%" cy="50%" r="45%"
                            className="fill-none stroke-blue-600 stroke-[10] transition-all duration-1000 ease-out"
                            strokeDasharray="210 283"
                            strokeLinecap="round"
                          />
                        </svg>

                        {/* Needle / Value */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('hero.safeToSpend')}</span>
                          <span className="text-2xl lg:text-4xl font-black font-outfit text-slate-900 tracking-tighter">kr 12.450</span>
                          <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">{t('hero.updatedLive')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full flex justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        <span>{t('hero.reservedForTax')}: kr 4.560</span>
                        <span>{t('hero.ytdProfit')}: 125k</span>
                      </div>
                    </div>

                    {/* Side Info Cards */}
                    <div className="space-y-4 flex flex-col">
                      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="h-3 w-20 bg-slate-100 rounded mb-2" />
                          <div className="h-2 w-12 bg-slate-50 rounded" />
                        </div>
                        <span className="font-bold text-sm text-slate-900">kr 1.250</span>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="h-3 w-24 bg-slate-100 rounded mb-2" />
                          <div className="h-2 w-16 bg-slate-50 rounded" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 uppercase">Secure</span>
                      </div>

                      <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white overflow-hidden relative group">
                        <div className="relative z-10">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('hero.nextDeadline')}</p>
                          <h4 className="text-lg font-black font-outfit tracking-tight">Forskuddsskatt</h4>
                          <p className="text-xs text-slate-300 mt-1">{t('hero.dueIn', { days: 14 })}</p>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:rotate-12 transition-transform duration-700">
                          <Target className="h-24 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-y border-slate-100 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('stats.compliant')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('stats.built')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('stats.trusted')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-3xl lg:text-5xl font-black font-outfit tracking-tighter text-slate-900 mb-6">
              {t.rich('howItWorks.title', {
                highlight: (chunks) => <span className="text-blue-600">{chunks}</span>
              })}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
            <Step icon={<Receipt className="h-8 w-8 text-blue-600" />} number="01" title={t('howItWorks.step1.title')} desc={t('howItWorks.step1.desc')} />
            <Step icon={<Activity className="h-8 w-8 text-indigo-600" />} number="02" title={t('howItWorks.step2.title')} desc={t('howItWorks.step2.desc')} />
            <Step icon={<ShieldCheck className="h-8 w-8 text-emerald-600" />} number="03" title={t('howItWorks.step3.title')} desc={t('howItWorks.step3.desc')} />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 lg:py-32 bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black font-outfit tracking-tighter text-slate-900 mb-6">
              {t.rich('features.title', {
                highlight: (chunks) => <span className="text-blue-600 bg-clip-text uppercase">{chunks}</span>
              })}
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-base lg:text-lg leading-relaxed px-4">
              {t.rich('features.description', {
                highlight: (chunks) => <span className="text-slate-900 font-bold">{chunks}</span>
              })}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6 text-blue-600" />}
              title={t('features.safeToSpend.title')}
              description={t('features.safeToSpend.desc')}
              gradient="from-blue-500/10 to-transparent"
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6 text-indigo-600" />}
              title={t('features.aiScan.title')}
              description={t('features.aiScan.desc')}
              gradient="from-indigo-500/10 to-transparent"
            />
            <FeatureCard
              icon={<Activity className="h-6 w-6 text-emerald-600" />}
              title={t('features.pulse.title')}
              description={t('features.pulse.desc')}
              gradient="from-emerald-500/10 to-transparent"
            />
            <FeatureCard
              icon={<Target className="h-6 w-6 text-amber-600" />}
              title={t('features.deadline.title')}
              description={t('features.deadline.desc')}
              gradient="from-amber-500/10 to-transparent"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-cyan-600" />}
              title={t('features.analysis.title')}
              description={t('features.analysis.desc')}
              gradient="from-cyan-500/10 to-transparent"
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6 text-purple-600" />}
              title={t('features.currency.title')}
              description={t('features.currency.desc')}
              gradient="from-purple-500/10 to-transparent"
            />
            <FeatureCard
              icon={<Download className="h-6 w-6 text-slate-600" />}
              title={t('features.exports.title')}
              description={t('features.exports.desc')}
              gradient="from-slate-500/10 to-transparent"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-red-600" />}
              title={t('features.insights.title')}
              description={t('features.insights.desc')}
              gradient="from-red-500/10 to-transparent"
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2rem] p-8 lg:p-16 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 mb-4 font-bold text-[10px] uppercase tracking-widest">
                  {t('security.badge')}
                </div>
                <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight mb-4">
                  {t.rich('security.title', {
                    highlight: (chunks) => <span className="text-blue-400">{chunks}</span>
                  })}
                </h2>
                <p className="text-slate-400 font-medium mb-8 text-base leading-relaxed">
                  {t.rich('security.description', {
                    strong: (chunks) => <strong>{chunks}</strong>
                  })}
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-bold tracking-tight">{t('security.localAI')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    <Lock className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-bold tracking-tight">{t('security.mfa')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-bold tracking-tight">{t('security.gdpr')}</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 relative">
                <div className="h-48 w-48 bg-slate-800 rounded-3xl border border-slate-700 flex items-center justify-center shadow-2xl">
                  <ShieldCheck className="h-24 w-24 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 lg:py-32 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight text-slate-900 mb-3">{t('pricing.title')}</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto text-sm font-bold uppercase tracking-widest">{t('pricing.description')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 rounded-[2rem] border-2 border-slate-100 bg-white flex flex-col h-full bg-slate-50/10">
              <h3 className="text-lg font-black font-outfit text-slate-900 mb-1 uppercase tracking-tighter">{t('pricing.starter.title')}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{t('pricing.starter.price')}</span>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('pricing.starter.unit')}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <PricingItem text={t('pricing.starter.f1')} />
                <PricingItem text={t('pricing.starter.f2')} />
                <PricingItem text={t('pricing.starter.f3')} />
                <PricingItem text={t('pricing.starter.f4')} />
                <PricingItem text={t('pricing.starter.f5')} />
                <PricingItem text={t('pricing.starter.f6')} />
                <PricingItem text={t('pricing.starter.f7')} />
                <PricingItem text={t('pricing.starter.f8')} />
              </ul>
              <a href={signupUrl} className="w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl border-2 border-slate-200 font-black hover:bg-slate-50 transition-all text-xs">
                  {t('pricing.starter.cta')}
                </Button>
              </a>
            </div>

            {/* Monthly Pro Plan */}
            <div className="p-8 rounded-[2rem] border-2 border-slate-200 bg-white flex flex-col h-full relative group hover:border-blue-400 transition-all">
              <h3 className="text-lg font-black font-outfit text-slate-900 mb-1 uppercase tracking-tighter">{t('pricing.pro.title')}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{t('pricing.pro.price')}</span>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('pricing.pro.unit')}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <PricingItem text={t('pricing.pro.f1')} highlighted />
                <PricingItem text={t('pricing.pro.f2')} />
                <PricingItem text={t('pricing.pro.f3')} />
                <PricingItem text={t('pricing.pro.f4')} />
              </ul>
              <a href={signupUrl} className="w-full">
                <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black font-black shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 active:scale-95 text-xs text-white">
                  {t('pricing.pro.cta')}
                </Button>
              </a>
            </div>

            {/* Founding Pro Plan */}
            <div className="p-8 rounded-[2rem] border-2 border-amber-200 bg-amber-50/30 flex flex-col h-full relative shadow-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-0.5 rounded-full font-black text-[8px] uppercase tracking-widest">
                {t('pricing.recommended')}
              </div>
              <h3 className="text-lg font-black font-outfit text-amber-900 mb-1 uppercase tracking-tighter">{t('pricing.founding.title')}</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-amber-900 tracking-tight">{t('pricing.founding.price')}</span>
                  <span className="text-amber-600/70 font-bold uppercase text-[10px] tracking-widest">{t('pricing.founding.unit')}</span>
                </div>
                <p className="text-[9px] text-amber-700/60 font-bold uppercase tracking-widest mt-1">{t('pricing.founding.renews')}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <PricingItem text={t('pricing.founding.f1')} />
                <PricingItem text={t('pricing.founding.f2')} highlighted />
                <PricingItem text={t('pricing.founding.f3')} />
                <PricingItem text={t('pricing.founding.f4')} />
                <PricingItem text={t('pricing.founding.f5')} />
              </ul>
              <a href={signupUrl} className="w-full">
                <Button className="w-full h-12 rounded-xl bg-amber-900 hover:bg-amber-950 font-black shadow-lg shadow-amber-900/30 transition-all hover:-translate-y-0.5 active:scale-95 text-xs text-white">
                  {t('pricing.founding.cta')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-40 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-black font-outfit tracking-tighter mb-8 max-w-2xl mx-auto">
            {t.rich('cta.title', {
              highlight: (chunks) => <span className="text-blue-400">{chunks}</span>
            })}
          </h2>
          <p className="max-w-md mx-auto text-slate-400 font-medium text-lg mb-12">
            {t('cta.description')}
          </p>
          <a href={signupUrl}>
            <Button size="lg" className="h-20 px-16 bg-white text-slate-900 hover:bg-slate-100 font-black text-2xl rounded-2xl shadow-2xl transition-all hover:-translate-y-1 active:scale-95">
              {t('cta.button')}
            </Button>
          </a>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight text-slate-900 mb-3">
              {t.rich('faq.title', {
                highlight: (chunks) => <span className="text-blue-600">{chunks}</span>
              })}
            </h2>
          </div>
          <div className="space-y-6">
            <FaqItem question={t('faq.q1')} answer={t('faq.a1')} />
            <FaqItem question={t('faq.q2')} answer={t('faq.a2')} />
            <FaqItem question={t('faq.q3')} answer={t('faq.a3')} />
            <FaqItem question={t('faq.q4')} answer={t('faq.a4')} />
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode, title: string, description: string, gradient?: string }) {
  return (
    <div className="group relative p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden">
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-xl font-black font-outfit text-slate-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-500 font-medium leading-relaxed text-sm">
          {description}
        </p>
      </div>

      {/* Decorative Corner Element */}
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
        <ArrowRight className="h-5 w-5 text-slate-300" />
      </div>
    </div>
  )
}

function Step({ icon, number, title, desc }: { icon: React.ReactNode, number: string, title: string, desc: string }) {
  return (
    <div className="relative group">
      <div className="absolute -left-4 -top-8 text-[8rem] font-black text-slate-50 select-none group-hover:text-blue-50 transition-colors duration-500 z-0 leading-none">
        {number}
      </div>
      <div className="relative z-10">
        <div className="h-16 w-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between gap-4 text-left group"
      >
        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm lg:text-base">{question}</span>
        <ChevronRight className={`h-5 w-5 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-90 text-blue-600' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-slate-500 leading-relaxed font-medium text-sm lg:text-base">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

function PricingItem({ text, muted, highlighted }: { text: string, muted?: boolean, highlighted?: boolean }) {
  return (
    <li className={`flex items-start gap-2 text-xs font-bold ${muted ? 'opacity-30' : 'text-slate-600'} ${highlighted ? 'text-blue-600' : ''}`}>
      <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${highlighted ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
        <Check className="h-2.5 w-2.5" />
      </div>
      <span>{text}</span>
    </li>
  )
}
