'use client'

import React from 'react'
import {
    PieChart,
    Receipt,
    Target,
    ShieldCheck,
    TrendingUp,
    ArrowUpRight,
    TrendingDown,
    Calendar
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'

interface OverviewPulseProps {
    totalSafeToSpend: number
    totalTaxReserved: number
    totalMvaReserved: number
    ytdProfit: number
    ytdExpenses: number
    nextDeadline?: {
        type: string
        date: Date
        label: string
    }
    isPro?: boolean
}

export function OverviewPulse({
    totalSafeToSpend,
    totalTaxReserved,
    totalMvaReserved,
    ytdProfit,
    ytdExpenses,
    nextDeadline,
    isPro
}: OverviewPulseProps) {
    const t = useTranslations('overview')
    const locale = useLocale()

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(locale === 'nb' ? 'nb-NO' : 'en-US', {
            style: 'currency',
            currency: 'NOK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val)
    }

    // Calculate percentage for gauge (Safe to spend vs YTD Profit)
    const safePercentage = ytdProfit > 0 ? (totalSafeToSpend / ytdProfit) : 0
    const dashArrayValue = Math.round(safePercentage * 283) // 283 is approx circumference

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Gauge Card */}
                <Card className="lg:col-span-2 overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-slate-50/50 relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <TrendingUp className="h-32 w-32 text-blue-600" />
                    </div>

                    <CardContent className="p-8 lg:p-12">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="relative w-64 h-64 shrink-0">
                                {/* Gauge SVG - Restored to original exactly */}
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                                    <circle
                                        cx="50%" cy="50%" r="45%"
                                        className="fill-none stroke-slate-100 stroke-[12]"
                                    />
                                    <circle
                                        cx="50%" cy="50%" r="45%"
                                        className="fill-none stroke-blue-600 stroke-[14] transition-all duration-1500 ease-out"
                                        strokeDasharray={`${dashArrayValue} 283`}
                                        strokeLinecap="round"
                                        style={{ filter: 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.3))' }}
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-14">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('safeToSpend')}</span>
                                    <span className="text-lg sm:text-xl lg:text-2xl font-black font-outfit text-slate-900 tracking-tighter leading-none whitespace-nowrap">
                                        {formatCurrency(totalSafeToSpend)}
                                    </span>
                                    <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Real-time</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-8">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black font-outfit text-slate-900 tracking-tight">{t('businessHealth')}</h3>
                                    <p className="text-slate-500 font-medium text-sm">{t('healthDescription')}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ytdProfit')}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-slate-900">{formatCurrency(ytdProfit)}</span>
                                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ytdExpenses')}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-slate-900">{formatCurrency(ytdExpenses)}</span>
                                            <TrendingDown className="h-4 w-4 text-rose-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('taxReserved')}</span>
                                        <span className="font-bold text-blue-600">{formatCurrency(totalTaxReserved)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('mvaReserved')}</span>
                                        <span className="font-bold text-indigo-600">{formatCurrency(totalMvaReserved)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    {/* Deadline Card */}
                    <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group">
                        <CardContent className="p-6">
                            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('nextDeadline')}</span>
                                    </div>
                                    <h4 className="text-2xl font-black font-outfit tracking-tight">
                                        {nextDeadline?.type === 'mva' ? 'MVA' : 'Forskuddsskatt'}
                                    </h4>
                                    <p className="text-sm text-slate-300 font-medium">
                                        {nextDeadline ? (
                                            locale === 'nb' ?
                                                `Forfaller ${nextDeadline.date.toLocaleDateString('nb-NO')}` :
                                                `Due on ${nextDeadline.date.toLocaleDateString('en-US')}`
                                        ) : t('noDeadlines')}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors cursor-pointer">
                                    <span>View Details</span>
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                                <Target className="h-32 w-32" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions / Info */}
                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">{t('taxProtection')}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Auto-calculations active</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Receipt className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">{t('receiptTracker')}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{t('matchingData')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
