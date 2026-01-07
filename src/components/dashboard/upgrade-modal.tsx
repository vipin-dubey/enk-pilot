'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Globe, FileDown, ShieldCheck, Rocket } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/navigation'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  seatsLeft?: number
  percentFull?: number
}

export function UpgradeModal({ isOpen, onClose, seatsLeft = 100, percentFull = 37 }: UpgradeModalProps) {
  const t = useTranslations('pricing')
  const locale = useLocale()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="sr-only">
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 h-full min-h-[500px]">
          {/* Left Panel: Features/Side Info */}
          <div className="md:col-span-2 bg-slate-900 p-10 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/20">P</div>
                <span className="font-outfit font-black text-2xl tracking-tight">ENK Pilot <span className="text-blue-400">Pro</span></span>
              </div>
              
              <h3 className="text-2xl font-bold mb-8 leading-tight">
                {locale === 'nb' ? 'Gjør regnskapet ditt skuddsikkert' : 'Make your accounting bulletproof'}
              </h3>
              
              <ul className="space-y-6">
                {[
                  { icon: Globe, text: locale === 'nb' ? 'Internasjonale valutaer' : 'International Currencies' },
                  { icon: FileDown, text: locale === 'nb' ? 'Eksport for regnskapsfører' : 'Accountant-Ready Export' },
                  { icon: ShieldCheck, text: locale === 'nb' ? 'AI Skatteinnikter' : 'AI Tax Insights', badge: locale === 'nb' ? 'lokal ai / privat' : 'local-only / privacy safe' },
                  { icon: Rocket, text: locale === 'nb' ? 'Beta-tilgang til nye funksjoner' : 'Beta access to new features' }
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
            
            <div className="pt-8 border-t border-white/10 mt-12">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                  {t('foundingSubtitle')}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                {locale === 'nb' 
                  ? "Som Grunnlegger hjelper du med å forme fremtiden til ENK Pilot. Du får direkte påvirkning på veikartet!" 
                  : "As a Founding Supporter, you help shape the future of ENK Pilot. You get direct influence on the roadmap!"}
              </p>
            </div>
          </div>

          {/* Right Panel: Pricing Options */}
          <div className="md:col-span-3 bg-white p-10 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-3xl font-black font-outfit text-slate-900 tracking-tight mb-2">{t('title')}</h2>
              <p className="text-slate-500 font-medium leading-normal max-w-sm">{t('description')}</p>
            </div>

            <div className="space-y-6">
              {/* Founding Supporter Slot */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-6 shadow-sm transition-all group-hover:shadow-md">
                  <div className="flex justify-between items-start mb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{t('founding')}</span>
                        <Badge className="bg-amber-500 text-white border-none text-[10px] h-5 px-2 uppercase font-black tracking-tighter shadow-sm">
                          {locale === 'nb' ? 'ANBEFALT' : 'BEST VALUE'}
                        </Badge>
                      </div>
                      <p className="text-xs text-amber-700/80 font-bold uppercase tracking-wide">{t('foundingSubtitle')}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-3xl font-black text-slate-900">299 kr</span>
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase font-black leading-tight tracking-widest">{locale === 'nb' ? 'FØRSTE ÅR' : 'FIRST YEAR'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 border border-amber-200">
                        <Check className="h-3 w-3 text-amber-700" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{t('foundingPerks')}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight text-amber-700">
                        <span>{locale === 'nb' ? 'Tilgjengelighet' : 'Availability'}</span>
                        <span>{percentFull}% fullt</span>
                      </div>
                      <div className="h-2 bg-amber-100 rounded-full overflow-hidden border border-amber-200/50">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 flex items-center justify-end px-1" 
                          style={{ width: `${percentFull}%` }}
                        >
                          <div className="h-1 w-1 rounded-full bg-white/50 animate-pulse"></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-amber-600 font-bold text-right pt-0.5">
                        {seatsLeft} {locale === 'nb' ? 'plasser igjen' : 'seats left'}
                      </p>
                    </div>
                  </div>

                  <Link href="/settings" className="block">
                    <Button className="w-full bg-slate-900 hover:bg-black text-white font-black h-14 text-base shadow-lg shadow-black/10 rounded-xl transition-all active:scale-[0.98]">
                      {t('upgradeNow')}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Monthly/Yearly Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all group relative overflow-hidden">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">{t('monthly')}</p>
                  <p className="text-xl font-black text-slate-900 mb-4">39 kr <span className="text-[10px] text-slate-400 font-medium">/{locale === 'nb' ? 'mnd' : 'mo'}</span></p>
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="w-full text-[10px] font-black h-9 uppercase tracking-widest border-slate-200 hover:bg-slate-900 hover:text-white transition-all">
                      {locale === 'nb' ? 'Velg' : 'Select'}
                    </Button>
                  </Link>
                </div>
                <div className="p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-100 text-[8px] font-black text-blue-700 uppercase tracking-tighter rounded-bl-lg">
                    {locale === 'nb' ? 'Gratis prøve' : 'Free Trial'}
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">{t('yearly')}</p>
                  <p className="text-xl font-black text-slate-900 mb-4">349 kr <span className="text-[10px] text-slate-400 font-medium">/{locale === 'nb' ? 'år' : 'yr'}</span></p>
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="w-full text-[10px] font-black h-9 uppercase tracking-widest border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white transition-all">
                      {t('startTrial')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">
                    {locale === 'nb' ? 'Privatlivet ditt er førsteprioritet' : 'Your Privacy is Our Priority'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    {locale === 'nb' 
                      ? 'Lokal in-browser skanning. Ingen data sendes til ekstern AI. All lagring skjer innenfor EU i samsvar med GDPR.' 
                      : 'Local in-browser scanning. No data sent to external AI. All storage remains within the EU in compliance with GDPR.'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-6 font-bold uppercase tracking-widest">
              {t('cancelAnytime')} • Secure Payment by Lemon Squeezy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
