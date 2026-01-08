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

  // Get MFA assurance level
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  const pathname = request.nextUrl.pathname
  const isAuthPath = pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.match(/^\/(en|nb)\/(login|auth)/)

  const isMfaPage = pathname.includes('/login/mfa')

  // 1. Not logged in -> Redirect to login
  if (!user && !isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Logged in, MFA required (aal1 but next is aal2) -> Redirect to MFA page
  // We allow the MFA page itself and signout path
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
  // BUT: If they are at aal1 and need aal2, they shouldn't be redirected to home yet.
  if (user && isAuthPath && !isMfaPage && !pathname.includes('/auth/callback')) {
    // Only redirect if they actually PASSED MFA (or don't have it)
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
