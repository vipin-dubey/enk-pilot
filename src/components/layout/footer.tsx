'use client'

import { Link } from '@/navigation'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ShieldCheck, Globe } from 'lucide-react'

export function PublicFooter() {
  const { locale } = useParams() as { locale: string }

  return (
    <footer className="mt-auto py-12 px-6">
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Stored in EU</span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                {locale === 'en' ? 'Privacy Policy' : 'Personvern'}
              </Link>
              <Link href="/terms" className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                {locale === 'en' ? 'Terms' : 'Vilkår'}
              </Link>
              <Link href="/terms#refund-policy" className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                {locale === 'en' ? 'Refund Policy' : 'Refusjon'}
              </Link>
              <a href="mailto:support@enkpilot.com" className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                {locale === 'en' ? 'Support' : 'Kontakt'}
              </a>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt=""
                  width={60}
                  height={12}
                  className="h-3 w-auto grayscale opacity-50"
                />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  ENK Pilot &copy; 2026 • Norway
                </p>
              </div>
              <p className="text-[8px] text-slate-500 opacity-70">
                {locale === 'en' ? 'A modern tax tool for sole proprietors' : 'Et moderne skatteverktøy for enkeltpersonforetak'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
