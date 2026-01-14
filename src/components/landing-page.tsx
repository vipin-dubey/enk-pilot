import { Link } from '@/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
    ShieldCheck,
    Sparkles,
    Zap,
    Receipt,
    Target,
    PieChart,
    Lock,
    Globe,
    ArrowRight,
    Activity,
    Download,
    BarChart3,
    Check
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { PublicFooter } from '@/components/layout/footer'
import { LandingHeader } from './landing/header'
import { LandingFaq } from './landing/faq'

export async function LandingPage({ locale, host: serverHost }: { locale: string, host?: string }) {
    const t = await getTranslations({ locale, namespace: 'landing' })

    const getDeterministicAppUrl = () => {
        const host = serverHost || ''
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
            return `http://${host}`
        }
        // Fallback for static generation in dev
        if (process.env.NODE_ENV === 'development') {
            return 'http://localhost:3000'
        }
        return `https://app.enkpilot.com`
    }

    const appBase = getDeterministicAppUrl()
    const loginUrl = `${appBase}/${locale}/login`
    const signupUrl = `${appBase}/${locale}/signup`

    const navLabels = {
        features: t('nav.features'),
        security: t('nav.security'),
        pricing: t('nav.pricing'),
        login: t('nav.login'),
        startFree: t('nav.startFree')
    }

    const faqItems = [
        { question: t('faq.q1'), answer: t('faq.a1') },
        { question: t('faq.q2'), answer: t('faq.a2') },
        { question: t('faq.q3'), answer: t('faq.a3') },
        { question: t('faq.q4'), answer: t('faq.a4') },
        { question: t('faq.q5'), answer: t('faq.a5') },
    ]

    return (
        <>
            <LandingHeader
                loginUrl={loginUrl}
                signupUrl={signupUrl}
                labels={navLabels}
            />

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

                    <h1 className="text-4xl lg:text-6xl font-black font-outfit tracking-tight text-slate-900 mb-2 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        {t('hero.title')}
                    </h1>

                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-700 mb-6 animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-100">
                        {t('hero.subtitle')}
                    </h2>

                    <p className="max-w-2xl mx-auto text-base lg:text-lg text-slate-600 font-medium mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        {t('hero.description')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                        <a href={signupUrl}>
                            <Button size="lg" className="h-14 px-8 bg-slate-900 hover:bg-black text-white font-black text-base rounded-2xl shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95">
                                {t('hero.cta1')} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </a>
                        <a href="#how-it-works">
                            <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-slate-200 font-black text-base rounded-2xl hover:bg-slate-50 transition-all">
                                {t('hero.cta2')}
                            </Button>
                        </a>
                    </div>

                    <p className="text-sm text-slate-500 font-medium mb-16 animate-in fade-in slide-in-from-bottom-11 duration-1000 delay-400">
                        {t('hero.builtInNorway')}
                    </p>

                    <div className="relative max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-400 rounded-full blur-[100px] opacity-20" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-400 rounded-full blur-[100px] opacity-20" />

                        <div className="rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white/50 backdrop-blur-sm p-2 lg:p-4 relative z-10">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 shadow-inner overflow-hidden flex flex-col md:flex-row min-h-[600px] md:min-h-0 md:aspect-video lg:aspect-auto lg:h-[520px]">
                                <div className="hidden md:flex w-16 bg-white border-r border-slate-200 flex-col items-center py-6 gap-6">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                        <Image src="/logo-mark.png" alt="" width={20} height={20} role="presentation" className="h-5 w-5 brightness-0 invert" priority />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-600"><PieChart className="h-4 w-4" /></div>
                                        <div className="w-8 h-8 rounded-lg text-slate-400 flex items-center justify-center"><Receipt className="h-4 w-4" /></div>
                                        <div className="w-8 h-8 rounded-lg text-slate-400 flex items-center justify-center"><Target className="h-4 w-4" /></div>
                                    </div>
                                </div>

                                <div className="flex-1 p-4 lg:p-10 flex flex-col gap-6 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <div className="h-4 w-32 bg-slate-200 rounded" />
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded-full bg-slate-200" />
                                            <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                                        <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-10 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group min-h-[300px]">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                            <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-64 lg:h-64 mb-6">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="50%" cy="50%" r="45%" className="fill-none stroke-slate-100 stroke-[8]" />
                                                    <circle cx="50%" cy="50%" r="45%" className="fill-none stroke-blue-600 stroke-[10] transition-all duration-1000 ease-out" strokeDasharray="210 283" strokeLinecap="round" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('hero.safeToSpend')}</span>
                                                    <span className="text-2xl lg:text-4xl font-black font-outfit text-slate-900 tracking-tighter">kr 12.450</span>
                                                    <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">{t('hero.updatedLive')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full flex justify-between text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                                                <span>{t('hero.reservedForTax')}: kr 4.560</span>
                                                <span>{t('hero.ytdProfit')}: 125k</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 flex flex-col">
                                            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Receipt className="h-5 w-5" /></div>
                                                <div className="flex-1">
                                                    <div className="h-3 w-20 bg-slate-100 rounded mb-2" />
                                                    <div className="h-2 w-12 bg-slate-50 rounded" />
                                                </div>
                                                <span className="font-bold text-sm text-slate-900">kr 1.250</span>
                                            </div>
                                            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><ShieldCheck className="h-5 w-5" /></div>
                                                <div className="flex-1">
                                                    <div className="h-3 w-24 bg-slate-100 rounded mb-2" />
                                                    <div className="h-2 w-16 bg-slate-50 rounded" />
                                                </div>
                                                <span className="text-xs font-bold text-emerald-600 uppercase">Secure</span>
                                            </div>
                                            <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white overflow-hidden relative group">
                                                <div className="relative z-10">
                                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">{t('hero.nextDeadline')}</p>
                                                    <p className="text-lg font-black font-outfit tracking-tight">Forskuddsskatt</p>
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

            {/* Explainer Section - NEW */}
            <section className="py-16 lg:py-24 bg-slate-50/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight text-slate-900 mb-6">
                            {t('explainer.title')}
                        </h2>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed">
                            {t('explainer.description')}
                        </p>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-20 lg:py-32 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 lg:mb-24">
                        <h2 className="text-3xl lg:text-5xl font-black font-outfit tracking-tighter text-slate-900 mb-6">
                            {t('howItWorks.title')}
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
                        <Step icon={<Receipt className="h-8 w-8 text-blue-600" />} number="01" title={t('howItWorks.step1.title')} desc={t('howItWorks.step1.desc')} />
                        <Step icon={<Activity className="h-8 w-8 text-indigo-600" />} number="02" title={t('howItWorks.step2.title')} desc={t('howItWorks.step2.desc')} />
                        <Step icon={<ShieldCheck className="h-8 w-8 text-emerald-600" />} number="03" title={t('howItWorks.step3.title')} desc={t('howItWorks.step3.desc')} />
                    </div>
                </div>
            </section>

            {/* Features - Symmetric Scandinavian Grid */}
            <section id="features" className="py-24 lg:py-32 bg-slate-50">
                <div className="container mx-auto px-4">

                    <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-24">
                        <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight text-slate-900 mb-6">
                            {t('features.title')}
                        </h2>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                            {t('features.description')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">

                        {/* 1. The Buffer */}
                        <div className="bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 shrink-0">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3">{t('features.bufferTitle')}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed mb-4">
                                {t('features.buffer1')}
                            </p>

                            <div className="pt-4 border-t border-slate-50 space-y-4">
                                <ListRow text={t('features.buffer2')} />
                                <ListRow text={t('features.buffer3')} />
                                <ListRow text={t('features.bufferSource')} />
                            </div>
                        </div>

                        {/* 2. Receipts & AI */}
                        <div className="bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                            <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600 shrink-0">
                                <Receipt className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3">{t('features.receiptsTitle')}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed mb-4">
                                {t('features.receiptsSubtitle')}
                            </p>

                            <div className="pt-4 border-t border-slate-50 space-y-4">
                                <ListRow text={t('features.receipts1')} />
                                <ListRow text={t('features.receipts2')} />
                                <ListRow text={t('features.receiptsPrivacy')} />
                            </div>
                        </div>

                        {/* 3. MVA Control */}
                        <div className="bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                            <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600 shrink-0">
                                <Target className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3">{t('features.mvaTitle')}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed mb-4">
                                {t('features.mvaSubtitle')}
                            </p>

                            <div className="pt-4 border-t border-slate-50 space-y-4">
                                <ListRow text={t('features.mva1')} />
                                <ListRow text={t('features.mva2')} />
                                <ListRow text={t('features.reminders1')} />
                            </div>
                        </div>

                        {/* 4. SAF-T & Export */}
                        <div className="bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                            <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-600 shrink-0">
                                <Download className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3">{t('features.saftTitle')}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed mb-4">
                                {t('features.saftSubtitle')}
                            </p>

                            <div className="pt-4 border-t border-slate-50 space-y-4">
                                <ListRow text={t('features.saft1')} />
                                <ListRow text={t('features.saft2')} />
                                <ListRow text={t('features.supplement1')} />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Privacy Section - Redesigned */}
            <section className="py-20 lg:py-32 bg-slate-50/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-100 shadow-sm transition-all duration-300">
                            <h2 className="text-2xl lg:text-3xl font-black font-outfit tracking-tight text-slate-900 mb-8 lg:mb-12 text-center">
                                {t('privacy.title')}
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                                <div className="space-y-6">
                                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                        {t('privacy.subtitle1')}
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-4">
                                            <div className="mt-1 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Check className="h-3 w-3 text-blue-600" />
                                            </div>
                                            <span className="text-slate-600 font-medium leading-relaxed">{t('privacy.privacy1')}</span>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <div className="mt-1 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Check className="h-3 w-3 text-blue-600" />
                                            </div>
                                            <span className="text-slate-600 font-medium leading-relaxed">{t('privacy.privacy2')}</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                        {t('privacy.subtitle2')}
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-4">
                                            <div className="mt-1 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Check className="h-3 w-3 text-blue-600" />
                                            </div>
                                            <span className="text-slate-600 font-medium leading-relaxed">{t('privacy.built1')}</span>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <div className="mt-1 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Check className="h-3 w-3 text-blue-600" />
                                            </div>
                                            <span className="text-slate-600 font-medium leading-relaxed">{t('privacy.built2')}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-20 lg:py-32 bg-slate-50/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2rem] p-8 lg:p-16 text-white relative overflow-hidden shadow-xl">
                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 mb-4 font-bold text-[10px] uppercase tracking-widest">{t('security.badge')}</div>
                                <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight mb-4">
                                    {t.rich('security.title', { highlight: (chunks) => <span className="text-blue-400">{chunks}</span> })}
                                </h2>
                                <p className="text-slate-400 font-medium mb-8 text-base leading-relaxed">{t.rich('security.description', { strong: (chunks) => <strong>{chunks}</strong> })}</p>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                                    <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shrink-0"><ShieldCheck className="h-3.5 w-3.5 text-blue-400" /><span className="text-xs font-bold tracking-tight">{t('security.localAI')}</span></div>
                                    <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shrink-0"><Lock className="h-3.5 w-3.5 text-blue-400" /><span className="text-xs font-bold tracking-tight">{t('security.mfa')}</span></div>
                                    <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 shrink-0"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /><span className="text-xs font-bold tracking-tight">{t('security.gdpr')}</span></div>
                                </div>
                            </div>
                            <div className="shrink-0 relative">
                                <div className="h-48 w-48 bg-slate-800 rounded-3xl border border-slate-700 flex items-center justify-center shadow-2xl"><ShieldCheck className="h-24 w-24 text-blue-500" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* CTA */}
            <section className="py-24 lg:py-40 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl lg:text-6xl font-black font-outfit tracking-tighter mb-8 max-w-2xl mx-auto">
                        {t.rich('cta.title', { highlight: (chunks) => <span className="text-blue-400">{chunks}</span> })}
                    </h2>
                    <p className="max-w-md mx-auto text-slate-200 font-medium text-lg mb-12">{t('cta.description')}</p>
                    <a href={signupUrl}><Button size="lg" className="h-20 px-16 bg-white text-slate-900 hover:bg-slate-100 font-black text-2xl rounded-2xl shadow-2xl transition-all hover:-translate-y-1 active:scale-95">{t('cta.button')}</Button></a>
                </div>
            </section>

            <LandingFaq
                title={t.rich('faq.title', { highlight: (chunks) => <span className="text-blue-600">{chunks}</span> })}
                items={faqItems}
            />

            <PublicFooter />
        </>
    )
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="h-10 w-10 mt-1 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 [&>svg]:h-5 [&>svg]:w-5">
                {icon}
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">{text}</p>
        </div>
    )
}

function ListRow({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1 h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-slate-600" />
            </div>
            <span className="text-slate-600 font-medium">{text}</span>
        </div>
    )
}

function Step({ icon, number, title, desc }: { icon: React.ReactNode, number: string, title: string, desc: string }) {
    return (
        <div className="relative group">
            <div className="absolute -left-4 -top-8 text-[8rem] font-black text-slate-50 select-none group-hover:text-blue-50 transition-colors duration-500 z-0 leading-none">{number}</div>
            <div className="relative z-10">
                <div className="h-16 w-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">{icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    )
}

function PricingItem({ text, muted, highlighted }: { text: string, muted?: boolean, highlighted?: boolean }) {
    return (
        <li className={`flex items-start gap-2 text-xs font-bold ${muted ? 'opacity-30' : 'text-slate-600'} ${highlighted ? 'text-blue-600' : ''}`}>
            <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${highlighted ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Check className="h-2.5 w-2.5" /></div>
            <span>{text}</span>
        </li>
    )
}
