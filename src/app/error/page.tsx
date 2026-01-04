'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Sorry, something went wrong'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-2">Authentication Error</h1>
      <p className="text-slate-600 mb-6">{message}</p>
      <Button asChild>
        <Link href="/login">Back to Login</Link>
      </Button>
    </div>
  )
}
