'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { signup } from '@/app/[locale]/login/actions'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import {
    AlertCircle,
    Handshake,
    Info,
    Scale,
    User,
    CreditCard,
    RefreshCw,
    Mail,
    Globe,
    Gavel
} from 'lucide-react'
import { SubmitButton } from './submit-button'

// Note: Using a simplified version of the Terms content for the dialog
// In a real app, this might be fetched or shared via a component

export function SignupForm({ locale }: { locale: string }) {
    const t = useTranslations('auth.signup')
    const tLegal = useTranslations('legal')
    const [accepted, setAccepted] = useState(false)
    const [canAccept, setCanAccept] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget
        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10 // 10px buffer
        if (isAtBottom && !canAccept) {
            setCanAccept(true)
        }
    }

    return (
        <form className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-600 font-semibold">E-post</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ola@norman.no"
                    required
                    className="h-11 border-slate-200"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" title="password" className="text-slate-600 font-semibold">Passord</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-11 border-slate-200"
                />
            </div>

            <div className="flex items-start space-x-2 py-2">
                <Checkbox
                    id="terms"
                    name="termsAccepted"
                    checked={accepted}
                    onCheckedChange={(checked) => {
                        if (checked && !accepted) {
                            setDialogOpen(true)
                        } else {
                            setAccepted(checked === true)
                        }
                    }}
                    className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                    <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 cursor-pointer"
                    >
                        {t('termsLabel')}{' '}
                        <button
                            type="button"
                            onClick={() => setDialogOpen(true)}
                            className="text-blue-600 hover:underline font-bold"
                        >
                            {t('termsLink')}
                        </button>
                    </label>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter">
                            {t('termsDialogTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            {t('termsDialogDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <div
                        className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
                        onScroll={handleScroll}
                        ref={scrollRef}
                    >
                        <div className="space-y-8 text-slate-600 text-sm">
                            <section className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h3 className="text-slate-900 font-bold m-0 p-0">
                                        {locale === 'en' ? 'Important Disclaimer' : 'Viktig ansvarsfraskrivelse'}
                                    </h3>
                                    <p className="m-0 p-0 leading-relaxed">
                                        {locale === 'en' ? (
                                            'ENK Pilot is an educational tool. We are not accountants or tax advisors.'
                                        ) : (
                                            'ENK Pilot er et pedagogisk verktøy. Vi er ikke regnskapsførere eller skatterådgivere.'
                                        )}
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Handshake className="h-4 w-4 text-blue-600" />
                                    <h2 className="font-bold text-slate-900 m-0">
                                        1. {locale === 'en' ? 'Acceptance' : 'Godtakelse'}
                                    </h2>
                                </div>
                                <p>Ved å bruke ENK Pilot godtar du disse vilkårene.</p>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <h2 className="font-bold text-slate-900 m-0">
                                        2. {locale === 'en' ? 'No Advice' : 'Ingen rådgivning'}
                                    </h2>
                                </div>
                                <p>Alt innhold er kun for veiledning. Verifiser alltid med Skatteetaten.</p>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-blue-600" />
                                    <h2 className="font-bold text-slate-900 m-0">
                                        3. {locale === 'en' ? 'Liability' : 'Ansvar'}
                                    </h2>
                                </div>
                                <p>Bruk av tjenesten skjer på eget ansvar. Vi er ikke ansvarlige for dine skattevalg.</p>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-600" />
                                    <h2 className="font-bold text-slate-900 m-0">
                                        4. {locale === 'en' ? 'User Data' : 'Brukerdata'}
                                    </h2>
                                </div>
                                <p>Du er ansvarlig for at tallene du legger inn er korrekte.</p>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-blue-600" />
                                    <h2 className="font-bold text-slate-900 m-0">
                                        5. {locale === 'en' ? 'Privacy' : 'Personvern'}
                                    </h2>
                                </div>
                                <p>Vi respekterer ditt personvern og følger GDPR.</p>
                            </section>

                            <div className="h-4" /> {/* Extra spacing at bottom */}
                        </div>
                    </div>

                    <DialogFooter className="p-6 border-t bg-slate-50">
                        <Button
                            type="button"
                            onClick={() => {
                                setAccepted(true)
                                setDialogOpen(false)
                            }}
                            disabled={!canAccept}
                            className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                        >
                            {t('accept')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="pt-2">
                <SubmitButton
                    formAction={signup}
                    disabled={!accepted}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('submit')}
                </SubmitButton>
            </div>
        </form>
    )
}
