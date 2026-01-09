'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cookie, ShieldCheck, X } from 'lucide-react'
import { Link } from '@/navigation'
export function CookieConsent({ locale }: { locale: string }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie-consent')
      if (!consent) {
        setIsVisible(true)
      }
    } catch (e) {
      // If localStorage is blocked, we might show banner but can't save.
      // Or we just default to visible.
      setIsVisible(true)
    }
  }, [])

  const handleAccept = (type: 'all' | 'necessary') => {
    try {
      localStorage.setItem('cookie-consent', type)
    } catch (e) {
      console.error('Failed to save cookie consent', e)
    }
    setIsVisible(false)

    // Here we would normally initialize/disable tracking scripts
    if (type === 'all') {
      window.dispatchEvent(new Event('cookie-consent-all'))
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[9999] sm:left-auto sm:right-8 sm:w-[400px]">
      <Card className="border-none shadow-2xl overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200">
        <div className="bg-blue-600 h-1.5 w-full" />
        <CardContent className="p-6">
          <div className="flex gap-4 items-start mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Cookie className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 font-outfit">
                {locale === 'en' ? 'Cookie Preferences' : 'Informasjonskapsler'}
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                {locale === 'en'
                  ? 'We use cookies to enhance your experience and analyze our traffic. Choose which cookies you want to allow.'
                  : 'Vi bruker cookies for å forbedre din opplevelse og analysere trafikken vår. Velg hvilke kapsler du vil tillate.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleAccept('all')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-slate-200"
            >
              {locale === 'en' ? 'Accept All Cookies' : 'Godta alle cookies'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleAccept('necessary')}
                variant="outline"
                className="w-full border-slate-200 text-slate-600 font-bold h-10 text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
              >
                {locale === 'en' ? 'Necessary Only' : 'Kun nødvendige'}
              </Button>
              <Link href="/privacy" locale={locale} aria-label={locale === 'en' ? 'Read our privacy policy' : 'Les vår personvernerklæring'}>
                <Button
                  variant="ghost"
                  className="w-full text-slate-400 font-bold h-10 text-[10px] uppercase tracking-widest rounded-xl hover:text-blue-600 transition-all font-outfit"
                >
                  {locale === 'en' ? 'Privacy Policy' : 'Personvern'}
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-outfit">
              GDPR Compliant • Data stored in EU
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
