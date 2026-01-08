'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enrollMfa() {
  const supabase = await createClient()

  // Security Check: Only Pro/Founding users can enroll
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type, is_founding_user, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialling' || !!profile?.is_founding_user

  if (!isPro) {
    throw new Error('MFA is a Pro feature. Please upgrade to enable.')
  }

  // Clear any existing unverified factors to avoid "already exists" error
  const { data: factors } = await supabase.auth.mfa.listFactors()
  if (factors?.totp) {
    for (const factor of factors.totp) {
      if ((factor as any).status === 'unverified') {
        await supabase.auth.mfa.unenroll({ factorId: factor.id })
      }
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'ENK Pilot',
    friendlyName: user.email
  })

  if (error) throw error

  return data
}

export async function verifyMfaAndEnable(factorId: string, code: string) {
  const supabase = await createClient()

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId
  })

  if (challengeError) throw challengeError

  const { data: verify, error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code
  })

  if (verifyError) throw verifyError

  revalidatePath('/settings')
  return verify
}

export async function unenrollMfa(factorId: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.mfa.unenroll({
    factorId
  })

  if (error) throw error

  revalidatePath('/settings')
  return { success: true }
}

export async function getMfaFactors() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) throw error
  return data
}
