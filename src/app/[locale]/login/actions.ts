'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from '@/navigation'
import { createClient } from '@/utils/supabase/server'
import { getLocale } from 'next-intl/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: signInData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error.message)
    const locale = await getLocale()
    redirect({ href: `/login?error=${encodeURIComponent(error.message)}`, locale: locale as any })
    return
  }

  // Check for MFA factors
  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
  const activeFactor = factors?.totp?.find(f => f.status === 'verified')

  if (activeFactor) {
    // Redirect to MFA verification page
    const locale = await getLocale()
    redirect({ href: `/login/mfa?factorId=${activeFactor.id}`, locale: locale as any })
    return
  }

  // Fetch user preference for locale
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_locale')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single()

  const currentLocale = await getLocale()
  const preferredLocale = profile?.default_locale || currentLocale || 'nb'

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')
  redirect({ href: '/dashboard', locale: preferredLocale as any })
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const headersList = await (await import('next/headers')).headers()
  const host = headersList.get('host') || ''
  const isLocal = host.includes('localhost')
  const protocol = isLocal ? 'http' : 'https'
  const origin = isLocal ? `${protocol}://${host}` : 'https://app.enkpilot.com'

  const termsAccepted = formData.get('termsAccepted') === 'on'

  if (!termsAccepted) {
    const locale = await getLocale()
    redirect({ href: '/signup?error=Du må godta vilkårene for å fortsette', locale: locale as any })
    return
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        terms_accepted_at: new Date().toISOString(),
      }
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    const locale = await getLocale()
    redirect({ href: `/login?error=${encodeURIComponent(error.message)}`, locale: locale as any })
    return
  }

  // Supabase signUp returns a user object even if email confirmation is required.
  // We should check if the user is "pending" or just tell them to check their email.
  const locale = await getLocale()
  redirect({ href: '/login?message=Check your email to continue', locale: locale as any })
}

export async function resendVerification(formData: FormData) {
  const supabase = await createClient()
  const headersList = await (await import('next/headers')).headers()
  const host = headersList.get('host') || ''
  const isLocal = host.includes('localhost')
  const protocol = isLocal ? 'http' : 'https'
  const origin = isLocal ? `${protocol}://${host}` : 'https://app.enkpilot.com'
  const email = formData.get('email') as string

  if (!email) {
    const locale = await getLocale()
    redirect({ href: '/login?error=Vennligst skriv inn e-postadressen din først', locale: locale as any })
    return
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    const locale = await getLocale()
    redirect({ href: `/login?error=${encodeURIComponent(error.message)}`, locale: locale as any })
    return
  }

  const locale = await getLocale()
  redirect({ href: '/login?message=Ny link er sendt til din e-post', locale: locale as any })
}

export async function verifyMfaChallenge(factorId: string, code: string) {
  const supabase = await createClient()

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId
  })

  if (challengeError) {
    const locale = await getLocale()
    redirect({ href: `/login/mfa?factorId=${factorId}&error=${encodeURIComponent(challengeError.message)}`, locale: locale as any })
    return
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code
  })

  if (verifyError) {
    const locale = await getLocale()
    redirect({ href: `/login/mfa?factorId=${factorId}&error=${encodeURIComponent(verifyError.message)}`, locale: locale as any })
    return
  }

  // Fetch user preference for locale
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_locale')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single()

  const currentLocale = await getLocale()
  const preferredLocale = profile?.default_locale || currentLocale || 'nb'

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')
  redirect({ href: '/dashboard', locale: preferredLocale as any })
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const headersList = await (await import('next/headers')).headers()
  const host = headersList.get('host') || ''
  const isLocal = host.includes('localhost')
  const protocol = isLocal ? 'http' : 'https'
  const origin = isLocal ? `${protocol}://${host}` : 'https://app.enkpilot.com'
  const email = formData.get('email') as string

  if (!email) {
    const locale = await getLocale()
    redirect({ href: '/forgot-password?error=Vennligst skriv inn e-postadressen din', locale: locale as any })
    return
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) {
    const locale = await getLocale()
    redirect({ href: `/forgot-password?error=${encodeURIComponent(error.message)}`, locale: locale as any })
    return
  }

  const locale = await getLocale()
  redirect({ href: '/forgot-password?message=Instructions sent to your email', locale: locale as any })
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 6) {
    const locale = await getLocale()
    redirect({ href: '/reset-password?error=Passordet må være minst 6 tegn', locale: locale as any })
    return
  }

  if (password !== confirmPassword) {
    const locale = await getLocale()
    redirect({ href: '/reset-password?error=Passordene er ikke like', locale: locale as any })
    return
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    const locale = await getLocale()
    redirect({ href: `/reset-password?error=${encodeURIComponent(error.message)}`, locale: locale as any })
    return
  }

  const locale = await getLocale()
  redirect({ href: '/login?message=Passordet ditt er nå oppdatert', locale: locale as any })
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const locale = await getLocale()
  revalidatePath('/', 'layout')
  revalidatePath('/[locale]', 'layout')
  redirect({ href: '/login', locale: locale as any })
}
