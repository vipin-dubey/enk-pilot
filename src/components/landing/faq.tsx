'use client'

import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'

export function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between gap-4 text-left group"
            >
                <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm lg:text-base">{question}</span>
                <ChevronRight className={`h-5 w-5 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-90 text-blue-600' : ''}`} />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                aria-hidden={!isOpen}
            >
                <p className="text-slate-600 leading-relaxed font-medium text-sm lg:text-base">
                    {answer}
                </p>
            </div>
        </div>
    )
}

export function LandingFaq({ title, items }: {
    title: React.ReactNode,
    items: Array<{ question: string, answer: string }>
}) {
    return (
        <section className="py-20 lg:py-32 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight text-slate-900 mb-3">
                        {title}
                    </h2>
                </div>
                <div className="space-y-6">
                    {items.map((item, i) => (
                        <FaqItem key={i} question={item.question} answer={item.answer} />
                    ))}
                </div>
            </div>
        </section>
    )
}
