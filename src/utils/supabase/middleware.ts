// FORCE SSL BYPASS
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale } from '@/i18n'

export async function updateSession(request: NextRequest, response?: NextResponse) {
  let supabaseResponse = response || NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return supabaseResponse

  const host = request.headers.get('host') || ''
  const isLocalhost = host.includes('localhost')

  // In localhost, we CAN'T share cookies across subdomains reliably
  // So we'll disable subdomain routing in dev
  const domain = isLocalhost ? undefined : '.enkpilot.com'

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            ...(domain ? { domain } : {}),
            path: '/',
            sameSite: 'lax'
          })
        )
      },
    },
  })

  const originalCookies = new Map(request.cookies.getAll().map(c => [c.name, c.value]))

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const segments = pathname.split('/')
  const currentLocale = locales.includes(segments[1] as any) ? segments[1] : defaultLocale

  const isAppSubdomain = host.startsWith('app.')
  const isMarketingHost = !isAppSubdomain
  const isPublicPath =
    pathname === '/' || pathname === '/en' || pathname === '/nb' ||
    pathname.includes('/terms') ||
    pathname.includes('/privacy')

  const isAuthPath = pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.includes('/auth/callback') ||
    pathname.match(/^\/(en|nb)\/(login|signup|forgot-password|reset-password|auth)/)

  const syncRedirect = (targetUrl: URL | string) => {
    const res = NextResponse.redirect(targetUrl)
    supabaseResponse.cookies.getAll().forEach((c) => {
      res.cookies.set(c.name, c.value, {
        ...(domain ? { domain } : {}),
        path: '/',
        maxAge: c.maxAge,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: 'lax',
        expires: c.expires,
      })
    })
    return res
  }

  // Handle Soft-Delete Reactivation or Blocking
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('deleted_at')
      .eq('id', user.id)
      .single()

    if (profile?.deleted_at) {
      const deletedAt = new Date(profile.deleted_at)
      const now = new Date()
      const daysSinceDeletion = (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceDeletion <= 30) {
        // Automatically reactivate within 30 days
        await supabase
          .from('profiles')
          .update({ deleted_at: null })
          .eq('id', user.id)

        // Redirect to dashboard with success message
        const target = request.nextUrl.clone()
        const dashboardPath = currentLocale === defaultLocale ? '/dashboard' : `/${currentLocale}/dashboard`
        target.pathname = dashboardPath
        target.searchParams.set('restored', 'true')
        return syncRedirect(target)
      } else {
        // Permanent deletion logic: If accessed after 30 days, block and logout
        await supabase.auth.signOut()
        return syncRedirect('/')
      }
    }
  }

  // LOCALHOST DEV MODE: Skip subdomain routing entirely
  if (isLocalhost) {
    const isLandingPage = pathname === '/' || pathname === '/en' || pathname === '/nb'

    // Redirect logged in users from landing page to dashboard
    if (user && isLandingPage) {
      const target = request.nextUrl.clone()
      const dashboardPath = currentLocale === defaultLocale ? '/dashboard' : `/${currentLocale}/dashboard`
      target.pathname = dashboardPath
      return syncRedirect(target)
    }

    // Just protect auth routes - Allow public pages
    if (!user && !isAuthPath && !isPublicPath) {
      const target = request.nextUrl.clone()
      // Construct locale-aware login path
      const loginPath = currentLocale === defaultLocale ? '/login' : `/${currentLocale}/login`
      target.pathname = loginPath
      return syncRedirect(target)
    }

    // Force sync if needed
    const hasRefreshed = supabaseResponse.cookies.getAll().some(c => {
      return originalCookies.get(c.name) !== c.value
    })

    if (user && !isAuthPath && hasRefreshed && !request.nextUrl.searchParams.has('_sync')) {
      const target = request.nextUrl.clone()
      target.searchParams.set('_sync', Date.now().toString())
      return syncRedirect(target)
    }

    return supabaseResponse
  }

  // PRODUCTION MODE: Full subdomain routing
  if (isMarketingHost) {
    if (user) {
      const target = request.nextUrl.clone()
      target.host = 'app.enkpilot.com'
      return syncRedirect(target)
    }
    return supabaseResponse
  }

  if (isAppSubdomain && !user && !isAuthPath) {
    const target = request.nextUrl.clone()
    target.pathname = '/login'
    return syncRedirect(target)
  }

  const hasRefreshed = supabaseResponse.cookies.getAll().some(c => {
    return originalCookies.get(c.name) !== c.value
  })

  if (user && !isAuthPath && hasRefreshed && !request.nextUrl.searchParams.has('_sync')) {
    const target = request.nextUrl.clone()
    target.searchParams.set('_sync', Date.now().toString())
    return syncRedirect(target)
  }

  return supabaseResponse
}
