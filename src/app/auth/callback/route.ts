import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // Hello, Vercel
      const isLocalEnv = process.env.NODE_ENV === 'development'

      const redirectUrl = isLocalEnv
        ? `${origin}${next}?message=E-posten er bekreftet!`
        : (forwardedHost ? `https://${forwardedHost}${next}?message=E-posten er bekreftet!` : `${origin}${next}?message=E-posten er bekreftet!`)

      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  // If no code is present, it might be an implicit flow (tokens in #hash)
  // which the server cannot see. We redirect to login and let the client-side
  // AuthHashHandler take over.
  return NextResponse.redirect(`${origin}/login`)
}
