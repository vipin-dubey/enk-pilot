'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    className?: string
    disabled?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function SubmitButton({ children, className, disabled, variant, ...props }: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            disabled={pending || disabled}
            className={className}
            variant={variant}
            {...props}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {children}
                </>
            ) : (
                children
            )}
        </Button>
    )
}
