'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from '@/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: signInData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error.message)
    redirect({ href: `/login?error=${encodeURIComponent(error.message)}`, locale: 'nb' })
    return
  }

  // Check for MFA factors
  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
  const activeFactor = factors?.totp?.find(f => f.status === 'verified')

  if (activeFactor) {
    // Redirect to MFA verification page
    redirect({ href: `/login/mfa?factorId=${activeFactor.id}`, locale: 'nb' })
    return
  }

  // Fetch user preference for locale
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_locale')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single()

  const preferredLocale = profile?.default_locale || 'nb'

  revalidatePath('/', 'layout')
  revalidatePath(`/${preferredLocale}`, 'layout')
  redirect({ href: '/', locale: preferredLocale as any })
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const headersList = await (await import('next/headers')).headers()
  const host = headersList.get('host') || ''
  const isLocal = host.includes('localhost')
  const protocol = isLocal ? 'http' : 'https'
  const origin = isLocal ? `${protocol}://${host}` : 'https://app.enkpilot.com'

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    redirect({ href: `/login?error=${encodeURIComponent(error.message)}`, locale: 'nb' })
    return
  }

  // Supabase signUp returns a user object even if email confirmation is required.
  // We should check if the user is "pending" or just tell them to check their email.
  redirect({ href: '/login?message=Check your email to continue', locale: 'nb' })
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
    redirect({ href: '/login?error=Vennligst skriv inn e-postadressen din først', locale: 'nb' })
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
    redirect({ href: `/login?error=${encodeURIComponent(error.message)}`, locale: 'nb' })
    return
  }

  redirect({ href: '/login?message=Ny link er sendt til din e-post', locale: 'nb' })
}

export async function verifyMfaChallenge(factorId: string, code: string) {
  const supabase = await createClient()

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId
  })

  if (challengeError) {
    redirect({ href: `/login/mfa?factorId=${factorId}&error=${encodeURIComponent(challengeError.message)}`, locale: 'nb' })
    return
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code
  })

  if (verifyError) {
    redirect({ href: `/login/mfa?factorId=${factorId}&error=${encodeURIComponent(verifyError.message)}`, locale: 'nb' })
    return
  }

  // Fetch user preference for locale
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_locale')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single()

  const preferredLocale = profile?.default_locale || 'nb'

  revalidatePath('/', 'layout')
  revalidatePath(`/${preferredLocale}`, 'layout')
  redirect({ href: '/', locale: preferredLocale as any })
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
    redirect({ href: '/forgot-password?error=Vennligst skriv inn e-postadressen din', locale: 'nb' })
    return
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) {
    redirect({ href: `/forgot-password?error=${encodeURIComponent(error.message)}`, locale: 'nb' })
    return
  }

  redirect({ href: '/forgot-password?message=Instructions sent to your email', locale: 'nb' })
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 6) {
    redirect({ href: '/reset-password?error=Passordet må være minst 6 tegn', locale: 'nb' })
    return
  }

  if (password !== confirmPassword) {
    redirect({ href: '/reset-password?error=Passordene er ikke like', locale: 'nb' })
    return
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    redirect({ href: `/reset-password?error=${encodeURIComponent(error.message)}`, locale: 'nb' })
    return
  }

  redirect({ href: '/login?message=Passordet ditt er nå oppdatert', locale: 'nb' })
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  revalidatePath('/[locale]', 'layout')
  redirect({ href: '/login', locale: 'nb' })
}
