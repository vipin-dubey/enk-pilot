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
    redirect({ href: '/error', locale: 'nb' })
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

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect({ href: '/error', locale: 'nb' })
    return
  }

  revalidatePath('/', 'layout')
  redirect({ href: '/', locale: 'nb' })
}
