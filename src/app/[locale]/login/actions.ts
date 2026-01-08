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

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error.message)
    redirect({ href: `/login?error=${encodeURIComponent(error.message)}`, locale: 'nb' })
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
  redirect({ href: '/', locale: preferredLocale as any })
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const headersList = await (await import('next/headers')).headers()
  const origin = headersList.get('origin')

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
  const origin = headersList.get('origin')
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

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect({ href: '/login', locale: 'nb' })
}
