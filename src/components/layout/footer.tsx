'use client'

import { Link } from '@/navigation'
import { useParams } from 'next/navigation'
import { ShieldCheck, Globe } from 'lucide-react'

export function PublicFooter() {
  const { locale } = useParams() as { locale: string }

  return (
    <footer className="mt-auto py-12 px-6">
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Stored in EU</span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                {locale === 'en' ? 'Privacy' : 'Personvern'}
              </Link>
              <Link href="/terms" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                {locale === 'en' ? 'Terms' : 'Vilkår'}
              </Link>
              <a href="mailto:support@enkpilot.com" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                {locale === 'en' ? 'Support' : 'Kontakt'}
              </a>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">ENK Pilot &copy; 2026 • Built with 🇳🇴</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
