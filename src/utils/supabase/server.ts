// FORCE SSL BYPASS
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const host = (await (await import('next/headers')).headers()).get('host') || ''

  const isLocalhost = host.includes('localhost')
  const domain = isLocalhost ? undefined : '.enkpilot.com'

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                ...(domain ? { domain } : {}),
                path: '/',
                sameSite: 'lax'
              })
            )
          } catch {
            // Server Component ignore
          }
        },
      },
    }
  )
}
