import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response?: NextResponse) {
  let supabaseResponse = response || NextResponse.next({
    request,
  })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    console.error('Missing Supabase environment variables! Check your .env.local')
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // getUser(). A simple mistake can make it very hard to debug issues with sessions
  // being lost due to race conditions.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- Subdomain Routing Logic ---
  const host = request.headers.get('host') || ''
  const isAppSubdomain = host.startsWith('app.')
  // Treat as marketing if it doesn't start with 'app.'
  const isMarketingHost = !isAppSubdomain

  const marketingDomain = 'enkpilot.com'
  const appDomain = 'app.enkpilot.com'
  const isProd = !host.includes('localhost') && !host.includes('127.0.0.1')

  const pathname = request.nextUrl.pathname
  const isAuthPath = pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.match(/^\/(en|nb)\/(login|auth)/)
  const isMfaPage = pathname.includes('/login/mfa')

  if (isMarketingHost) {
    // 1. If authenticated, always send to app subdomain
    if (user) {
      const url = request.nextUrl.clone()
      if (isProd) {
        url.host = appDomain
      } else {
        url.host = `app.${host}`
      }
      return NextResponse.redirect(url)
    }

    // 2. If path is anything other than root, redirect to app subdomain
    if (pathname !== '/' && !pathname.match(/^\/(en|nb)$/)) {
      const url = request.nextUrl.clone()
      if (isProd) {
        url.host = appDomain
      } else {
        url.host = `app.${host}`
      }
      return NextResponse.redirect(url)
    }
    // 3. If path is root and not authenticated, Landing Page is served
    return supabaseResponse
  }

  // On App Host (app.enkpilot.com or localhost):

  // 1. Not logged in -> Redirect to login
  if (!user && !isAuthPath) {
    // Exception: If they hit root on the app domain, they should be forced to login
    // so they don't see the landing page on app.enkpilot.com
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Get MFA assurance level
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  // 2. Logged in, MFA required (aal1 but next is aal2) -> Redirect to MFA page
  if (user && aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2' && !isMfaPage) {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const activeFactor = factors?.totp?.find(f => f.status === 'verified')

    if (activeFactor) {
      const url = request.nextUrl.clone()
      url.pathname = '/login/mfa'
      url.searchParams.set('factorId', activeFactor.id)
      return NextResponse.redirect(url)
    }
  }

  // 3. Logged in at correct level (aal1 or aal2) and trying to access login, redirect to home
  if (user && isAuthPath && !isMfaPage && !pathname.includes('/auth/callback')) {
    if (aal?.currentLevel === aal?.nextLevel) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as is. If you're creating a
  // new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally: return myNewResponse
  // If not, you may find sessions expiring unexpectedly.

  return supabaseResponse
}
