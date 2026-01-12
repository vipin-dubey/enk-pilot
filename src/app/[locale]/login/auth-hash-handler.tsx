'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from '@/navigation'

export default function AuthHashHandler() {
  const router = useRouter()
  const supabase = createClient()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const handleHash = async () => {
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        setIsProcessing(true)
        const { data, error } = await supabase.auth.getSession()
        if (data.session && !error) {
          router.push('/dashboard')
          router.refresh()
        } else {
          setIsProcessing(false)
        }
      }
    }

    handleHash()
  }, [supabase, router])

  if (!isProcessing) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="font-medium text-slate-600">Logger deg inn...</p>
      </div>
    </div>
  )
}
