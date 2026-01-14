'use client'

import { useState } from 'react'
import { Link } from '@/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function LandingHeader({ loginUrl, signupUrl, labels }: {
    loginUrl: string,
    signupUrl: string,
    labels: {
        features: string,
        security: string,
        pricing: string,
        login: string,
        startFree: string
    }
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center transition-transform hover:scale-105">
                    <Image
                        src="/logo.png"
                        alt="ENK Pilot"
                        width={120}
                        height={32}
                        className="h-8 w-auto object-contain"
                        priority
                    />
                    <span className="sr-only">ENK Pilot</span>
                </Link>

                <nav className="hidden lg:flex items-center gap-8">
                    <a href="#features" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider">{labels.features}</a>
                    <a href="#security" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider">{labels.security}</a>
                </nav>

                <div className="flex items-center gap-1 sm:gap-2">
                    <a href={loginUrl}>
                        <Button variant="ghost" className="hidden sm:flex text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl px-4">
                            {labels.login}
                        </Button>
                    </a>
                    <a href={signupUrl}>
                        <Button size="sm" className="bg-slate-900 hover:bg-black text-white font-black px-5 rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98] text-xs">
                            {labels.startFree}
                        </Button>
                    </a>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col p-6 gap-6">
                        <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-black text-slate-900 uppercase tracking-tighter">{labels.features}</a>
                        <a href="#security" onClick={() => setIsMenuOpen(false)} className="text-lg font-black text-slate-900 uppercase tracking-tighter">{labels.security}</a>
                        <hr className="border-slate-100" />
                        <a href={loginUrl} className="text-lg font-black text-blue-600 uppercase tracking-tighter">{labels.login}</a>
                    </nav>
                </div>
            )}
        </header>
    )
}
