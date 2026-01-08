'use client'

import { AlertTriangle, Gavel, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@/navigation'
import { useParams } from 'next/navigation'

export function LegalShield() {
  const t = useTranslations('legal')
  const { locale } = useParams() as { locale: string }

  return (
    <Card className="border-none shadow-premium bg-slate-50 border border-slate-200 mt-8 mb-4 overflow-hidden">
      <div className="bg-slate-200 h-1.5 w-full" />
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
            <Gavel className="h-5 w-5 text-white" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black uppercase tracking-tighter text-slate-900 font-outfit">
                {t('disclaimerTitle')}
              </h4>
              <div className="px-1.5 py-0.5 rounded bg-slate-900 text-[8px] font-bold text-white uppercase tracking-tighter">
                Final & Binding
              </div>
            </div>
            
            <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
              {t('disclaimerText')}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 border-t border-slate-200 mt-2">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <AlertTriangle className="h-3 w-3" />
                <span>NO FINANCIAL LIABILITY</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <AlertTriangle className="h-3 w-3" />
                <span>NO TAX RESPONSIBILITY</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <AlertTriangle className="h-3 w-3" />
                <span>AS-IS SERVICE</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>RIGHT TO ERASURE</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
                {locale === 'en' ? 'Read full privacy policy' : 'Les full personvernserklæring'}
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
                {locale === 'en' ? 'Read full terms' : 'Les fullstendige vilkår'}
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
