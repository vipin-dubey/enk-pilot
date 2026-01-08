'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false,
        opt_out_capturing_by_default: true, // Start opted out
      })

      // Check for existing consent
      const consent = localStorage.getItem('cookie-consent')
      if (consent === 'all') {
        posthog.opt_in_capturing()
      }

      // Listen for future consent changes
      const handleConsent = () => {
        posthog.opt_in_capturing()
      }

      window.addEventListener('cookie-consent-all', handleConsent)
      return () => window.removeEventListener('cookie-consent-all', handleConsent)
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
