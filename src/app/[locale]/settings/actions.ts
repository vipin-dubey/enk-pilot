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

export async function updateNotificationSettings(settings: {
  emailEnabled: boolean
  pushEnabled: boolean
  leadDays: number[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({
      email_notifications_enabled: settings.emailEnabled,
      push_notifications_enabled: settings.pushEnabled,
      reminder_lead_days: settings.leadDays
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'notificationUpdateError' }
  }

  revalidatePath('/[locale]/settings', 'page')
  return { success: true }
}

export async function softDeleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'unauthorized' }

  // Set deleted_at timestamp
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    return { error: 'deleteAccountError' }
  }

  // Sign out the user
  await supabase.auth.signOut()

  return { success: true }
}
