'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { softDeleteAccount } from './actions'
import { useRouter } from 'next/navigation'

export function DeleteAccount() {
    const t = useTranslations('settingsPage')
    const [isDeleting, setIsDeleting] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleDelete() {
        if (confirmText !== 'DELETE MY ACCOUNT') return

        setIsDeleting(true)
        setError('')

        const result = await softDeleteAccount()

        if (result.success) {
            router.push('/')
            router.refresh()
        } else {
            setIsDeleting(false)
            setError(t('deleteAccountError'))
        }
    }

    return (
        <div className="space-y-6 bg-red-50/50 p-6 rounded-xl border border-red-100 shadow-sm">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="text-lg font-bold">{t('deleteAccount')}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {t('deleteAccountWarning')}
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="confirmDelete" className="text-red-900 font-bold uppercase tracking-tight text-xs">
                        {t('deleteAccountConfirm')}
                    </Label>
                    <Input
                        id="confirmDelete"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                        className="border-red-200 focus-visible:ring-red-500 bg-white"
                    />
                </div>

                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={confirmText !== 'DELETE MY ACCOUNT' || isDeleting}
                    className="w-full font-black uppercase tracking-widest gap-2 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {t('deleteAccountButton')}
                </Button>
            </div>

            {error && (
                <p className="text-sm text-red-600 font-bold bg-white p-3 rounded-lg border border-red-100 italic">
                    {error}
                </p>
            )}

            <p className="text-[10px] text-red-800/60 font-medium italic text-center uppercase tracking-widest">
                {t('deleteAccountReactivate')}
            </p>
        </div>
    )
}
