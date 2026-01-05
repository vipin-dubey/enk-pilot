'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'passwordsDoNotMatch' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: 'passwordUpdateError' }
  }

  return { success: true }
}

export async function updateDefaultLocale(locale: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ default_locale: locale })
    .eq('id', user.id)

  if (error) {
    return { error: 'localeUpdateError' }
  }

  revalidatePath('/[locale]/settings', 'page')
  return { success: true }
}
