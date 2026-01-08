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
  X
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
            <a href="#features" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider">Features</a>
            <a href="#security" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider">Security</a>
            <a href="#pricing" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider">Pricing</a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <a href={loginUrl}>
              <Button variant="ghost" className="hidden sm:flex text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl px-4">
                Login
              </Button>
            </a>
            <a href={loginUrl}>
              <Button size="sm" className="bg-slate-900 hover:bg-black text-white font-black px-5 rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98] text-xs">
                Start Free
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
                Features
              </a>
              <a 
                href="#security" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-black font-outfit text-slate-900 uppercase tracking-tighter"
              >
                Security
              </a>
              <a 
                href="#pricing" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-black font-outfit text-slate-900 uppercase tracking-tighter"
              >
                Pricing
              </a>
              <hr className="border-slate-100" />
              <a 
                href={loginUrl}
                className="text-lg font-black font-outfit text-blue-600 uppercase tracking-tighter"
              >
                Login to App
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
            <span className="text-[10px] font-black uppercase tracking-wider">Built for Norwegian Founders</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black font-outfit tracking-tight text-slate-900 mb-4 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Your ENK on <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Autopilot.</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-base lg:text-lg text-slate-500 font-medium mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Know exactly how much is <span className="text-slate-900 font-bold underline decoration-blue-500 decoration-2 underline-offset-4">safe to spend.</span> ENK Pilot handles MVA and taxes in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <a href={loginUrl}>
              <Button size="lg" className="h-14 px-8 bg-slate-900 hover:bg-black text-white font-black text-base rounded-2xl shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95">
                Join Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:ml-2">
              Claim one of 100 Founding Seats
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute -top-6 -left-6 -right-6 bottom-0 bg-gradient-to-t from-white via-white/0 to-white/0 z-10" />
            <div className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-slate-100 p-1.5 lg:p-2">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3" 
                alt="ENK Pilot Dashboard Mockup" 
                className="rounded-xl shadow-inner border border-slate-200 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 lg:py-24 bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight text-slate-900 mb-3">Everything in one place.</h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm">Automated calculations and tools designed specifically for Norwegian sole proprietors.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}
              title="Safe to Spend™"
              description="Proprietary engine tracks MVA, trinnskatt, and personal allowances in real-time. Protect your profit."
            />
            <FeatureCard 
              icon={<Receipt className="h-5 w-5 text-indigo-600" />}
              title="AI Receipt Scan"
              description="Snap receipts with your phone. We extract vendor, MVA, and category automatically into your journal."
            />
            <FeatureCard 
              icon={<Target className="h-5 w-5 text-emerald-600" />}
              title="Deadline Guard"
              description="Never miss MVA or Forskuddsskatt. Smart reminders based on your business flow."
            />
            <FeatureCard 
              icon={<PieChart className="h-5 w-5 text-amber-600" />}
              title="Real-time Analytics"
              description="Visual summaries of growth, expenses, and tax health. Professional grade insights for your ENK."
            />
            <FeatureCard 
              icon={<Globe className="h-5 w-5 text-purple-600" />}
              title="Multi-Currency"
              description="Selling in USD or EUR? We fetch live Norges Bank rates to calculate your exact NOK income."
            />
            <FeatureCard 
              icon={<Zap className="h-5 w-5 text-red-600" />}
              title="Tax Insights"
              description=" suggerstions on forgotten deductions and warnings before you hit MVA thresholds."
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2rem] p-8 lg:p-16 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 mb-4 font-bold text-[10px] uppercase tracking-widest">
                  Enterprise-Grade Security
                </div>
                <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight mb-4">Privacy first. <br/><span className="text-blue-400">Local-First Intelligence.</span></h2>
                <p className="text-slate-400 font-medium mb-8 text-base leading-relaxed">
                  Encryption for your data and mandatory GDPR compliance. Our <strong>Smart Scanning</strong> and AI tasks happen directly in your browser—we never send your sensitive financial documents to external servers for processing.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-bold tracking-tight">Local-Only AI Scan</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    <Lock className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-bold tracking-tight">2FA Available</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-bold tracking-tight">GDPR Compliant</span>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight text-slate-900 mb-3">Ready to fly?</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto text-sm font-bold uppercase tracking-widest">Pricing designed for every stage.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 rounded-[2rem] border-2 border-slate-100 bg-white flex flex-col h-full bg-slate-50/10">
              <h3 className="text-lg font-black font-outfit text-slate-900 mb-1 uppercase tracking-tighter">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-slate-900 tracking-tight">0</span>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">kr / mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <PricingItem text="Basic Tax Buffer Engine" />
                <PricingItem text="Manual Expense Ledger" />
                <PricingItem text="Standard Security" />
                <PricingItem text="Limited MVA Tracking" />
              </ul>
              <a href={loginUrl} className="w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl border-2 border-slate-200 font-black hover:bg-slate-50 transition-all text-xs">
                  Join Free
                </Button>
              </a>
            </div>

            {/* Monthly Pro Plan */}
            <div className="p-8 rounded-[2rem] border-2 border-slate-200 bg-white flex flex-col h-full relative group hover:border-blue-400 transition-all">
              <h3 className="text-lg font-black font-outfit text-slate-900 mb-1 uppercase tracking-tighter">Pro Monthly</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-slate-900 tracking-tight">39</span>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">kr / mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <PricingItem text="Full Safe to Spend™ Engine" highlighted />
                <PricingItem text="Unlimited AI Scans" />
                <PricingItem text="Multi-Currency Support" />
                <PricingItem text="Two-Factor Auth (2FA)" />
                <PricingItem text="Priority Support" />
              </ul>
              <a href={loginUrl} className="w-full">
                <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black font-black shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 active:scale-95 text-xs text-white">
                  Get Pro
                </Button>
              </a>
            </div>

            {/* Founding Pro Plan */}
            <div className="p-8 rounded-[2rem] border-2 border-amber-200 bg-amber-50/30 flex flex-col h-full relative shadow-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-0.5 rounded-full font-black text-[8px] uppercase tracking-widest">
                Recommended
              </div>
              <h3 className="text-lg font-black font-outfit text-amber-900 mb-1 uppercase tracking-tighter">Founding Pro</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-amber-900 tracking-tight">299</span>
                  <span className="text-amber-600/70 font-bold uppercase text-[10px] tracking-widest">kr / first year</span>
                </div>
                <p className="text-[9px] text-amber-700/60 font-bold uppercase tracking-widest mt-1">Renews at 349 kr / year</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <PricingItem text="All Pro Features" />
                <PricingItem text="Limited to first 100 users" highlighted />
                <PricingItem text="Founding Member Badge" />
                <PricingItem text="Priority Roadmap Influence" />
                <PricingItem text="Special 1-Year Rate" />
              </ul>
              <a href={loginUrl} className="w-full">
                <Button className="w-full h-12 rounded-xl bg-amber-900 hover:bg-amber-950 font-black shadow-lg shadow-amber-900/30 transition-all hover:-translate-y-0.5 active:scale-95 text-xs text-white">
                  Join Founding
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 lg:py-24 bg-slate-100/50 text-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-black font-outfit tracking-tight mb-6">Ready to fly?</h2>
          <p className="max-w-md mx-auto text-slate-500 font-medium text-base mb-10">
            Join other Norwegian founders who have stopped stressing about taxes.
          </p>
          <a href={loginUrl}>
            <Button size="lg" className="h-16 px-12 bg-slate-900 text-white hover:bg-black font-black text-xl rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95">
              Join Now
            </Button>
          </a>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-blue-100 group">
      <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-black font-outfit text-slate-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed text-xs">
        {description}
      </p>
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
