'use client'

import React from 'react'

export function ObfuscatedMailto({ email, className, children }: { email: string, className?: string, children: React.ReactNode }) {
    const handleClick = () => {
        window.location.href = `mailto:${email}`
    }

    return (
        <button
            onClick={handleClick}
            className={className}
        >
            {children}
        </button>
    )
}
