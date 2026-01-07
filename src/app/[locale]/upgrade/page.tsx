'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Globe, FileDown, ShieldCheck, Rocket, ArrowLeft } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, useRouter } from '@/navigation'

export default function UpgradePage() {
  const t = useTranslations('pricing')
  const locale = useLocale()
  const router = useRouter()
  
  // Dummy data for consistency with modal
  const percentFull = 37
  const seatsLeft = 63

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <span className="font-outfit font-black text-lg tracking-tight">ENK Pilot <span className="text-blue-400">Pro</span></span>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 md:flex md:items-center md:justify-center md:py-12">
        <div className="max-w-6xl w-full mx-auto md:px-4">
          <div className="bg-white md:rounded-[2rem] md:shadow-2xl md:overflow-hidden md:border md:border-slate-200">
            <div className="flex flex-col md:grid md:grid-cols-5 md:min-h-[70vh]">
            {/* Left Panel: Features */}
            <div className="md:col-span-2 bg-slate-900 p-8 md:p-10 text-white flex flex-col justify-between">
              <div className="hidden md:block">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20">P</div>
                  <span className="font-outfit font-black text-2xl tracking-tight">ENK Pilot <span className="text-blue-400">Pro</span></span>
                </div>
                
                <h3 className="text-2xl font-bold mb-6 leading-tight">
                  {locale === 'nb' ? 'Gjør regnskapet ditt skuddsikkert' : 'Make your accounting bulletproof'}
                </h3>
                
                <ul className="space-y-6">
                  {[
                    { icon: Globe, text: locale === 'nb' ? 'Internasjonale valutaer' : 'International Currencies' },
                    { icon: FileDown, text: locale === 'nb' ? 'Eksport for regnskapsfører' : 'Accountant-Ready Export' },
                    { icon: ShieldCheck, text: locale === 'nb' ? 'AI Skatteinnikter' : 'AI Tax Insights', badge: locale === 'nb' ? 'lokal / privat' : 'local / private' },
                    { icon: Rocket, text: locale === 'nb' ? 'Beta-tilgang til nye funksjoner' : 'Beta access' }
                  ].map((item: any, i) => (
                    <li key={i} className="flex items-center gap-4 text-slate-300">
                      <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.text}</span>
                          {item.badge && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-500/30 tracking-tighter">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile Features List (More compact) */}
              <div className="md:hidden">
                <h3 className="text-xl font-bold mb-6 leading-tight text-center">
                  {locale === 'nb' ? 'Gjør regnskapet ditt skuddsikkert' : 'Make your accounting bulletproof'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Globe, text: locale === 'nb' ? 'Valuta' : 'Currency' },
                    { icon: FileDown, text: locale === 'nb' ? 'Eksport' : 'Export' },
                    { icon: ShieldCheck, text: locale === 'nb' ? 'Skatte-AI' : 'Tax AI' },
                    { icon: Rocket, text: locale === 'nb' ? 'Beta' : 'Beta' }
                  ].map((item: any, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                      <item.icon className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-bold">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-8 border-t border-white/10 mt-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                    {t('foundingSubtitle')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                  {locale === 'nb' 
                    ? "Som Grunnlegger får du direkte påvirkning på veikartet!" 
                    : "As a Founding Supporter, you get direct influence on the roadmap!"}
                </p>
              </div>
            </div>

            {/* Right Panel: Pricing */}
            <div className="md:col-span-3 bg-white p-6 md:p-8 flex flex-col justify-center">
              <div className="mb-6 text-center md:text-left">
                <h2 className="text-2xl md:text-4xl font-black font-outfit text-slate-900 tracking-tight mb-1">{t('title')}</h2>
                <p className="text-slate-500 text-sm font-medium leading-normal max-w-md mx-auto md:mx-0">{t('description')}</p>
              </div>

              <div className="space-y-6 md:space-y-8">
                {/* Founding Supporter Slot */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-[2.5rem] blur-md opacity-20 transition duration-1000"></div>
                  <div className="relative rounded-[1.5rem] border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-5 md:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{t('founding')}</span>
                          <Badge className="bg-amber-500 text-white border-none text-[9px] h-5 px-2 uppercase font-black tracking-tighter shadow-sm">
                            {locale === 'nb' ? 'ANBEFALT' : 'BEST VALUE'}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-amber-700/80 font-bold uppercase tracking-wide">{t('foundingSubtitle')}</p>
                      </div>
                      <div className="sm:text-right">
                        <div className="flex items-baseline sm:justify-end gap-1">
                          <span className="text-3xl md:text-4xl font-black text-slate-900">299 kr</span>
                        </div>
                        <p className="text-[9px] text-slate-500 uppercase font-black leading-tight tracking-widest">{locale === 'nb' ? 'FØRSTE ÅR' : 'FIRST YEAR'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 border border-amber-200 mt-0.5 shrink-0">
                          <Check className="h-3 w-3 text-amber-700" />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-slate-700 leading-snug">{t('foundingPerks')}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tight text-amber-700">
                          <span>{locale === 'nb' ? 'Tilgjengelighet' : 'Availability'}</span>
                          <span>{percentFull}% fullt</span>
                        </div>
                        <div className="h-2 bg-amber-100 rounded-full overflow-hidden border border-amber-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                            style={{ width: `${percentFull}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <Link href="/settings" className="block">
                      <Button className="w-full bg-slate-900 hover:bg-black text-white font-black h-12 text-base shadow-xl shadow-black/10 rounded-xl transition-all active:scale-[0.98]">
                        {t('upgradeNow')}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Monthly/Yearly Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 md:p-6 rounded-[1.5rem] border-2 border-slate-100 bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{t('monthly')}</p>
                      <p className="text-xl font-black text-slate-900 mb-4">39 kr <span className="text-xs text-slate-400 font-medium">/{locale === 'nb' ? 'mnd' : 'mo'}</span></p>
                    </div>
                    <Link href="/settings">
                      <Button variant="outline" className="w-full text-[10px] font-black h-10 uppercase tracking-tight border-slate-200 hover:bg-slate-900 hover:text-white transition-all rounded-lg">
                        {locale === 'nb' ? 'Velg' : 'Select'}
                      </Button>
                    </Link>
                  </div>
                  <div className="p-4 md:p-6 rounded-[1.5rem] border-2 border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-all relative flex flex-col justify-between">
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-[8px] font-black text-blue-700 uppercase tracking-tighter rounded-full">
                      {locale === 'nb' ? 'Gratis prøve' : 'Free Trial'}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{t('yearly')}</p>
                      <p className="text-xl font-black text-slate-900 mb-4">349 kr <span className="text-xs text-slate-400 font-medium">/{locale === 'nb' ? 'år' : 'yr'}</span></p>
                    </div>
                    <Link href="/settings">
                      <Button variant="outline" className="w-full text-[9px] font-black h-10 uppercase tracking-tight border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white transition-all rounded-lg leading-tight px-2">
                        {t('startTrial')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="bg-emerald-50/50 rounded-2xl p-4 flex items-center gap-4 text-left border border-emerald-100/50">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-0.5">
                      {locale === 'nb' ? 'Privatlivet ditt er førsteprioritet' : 'Your Privacy is Our Priority'}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      {locale === 'nb' 
                        ? 'Lokal in-browser skanning. Ingen data sendes ut. Lagring innenfor EU i samsvar med GDPR.' 
                        : 'Local in-browser scanning. No data sent out. Storage within EU in compliance with GDPR.'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
                {t('cancelAnytime')} • Secure Payment
              </p>
              
              {/* Back to Dashboard Link (Desktop) */}
              <div className="hidden md:block text-center mt-8">
                <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors">
                  {locale === 'nb' ? 'Tilbake til dashbordet' : 'Back to Dashboard'}
                </Link>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
