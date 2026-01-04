'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  console.log('--- LOGIN TRACE ---')
  console.log('Email:', `[${data.email}]`)
  console.log('Password length:', data.password.length)

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error.message)
    console.log('-------------------')
    redirect(`/error?message=${encodeURIComponent(error.message)}`)
  }

  console.log('Login successful')
  console.log('-------------------')
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('full_name') as string,
  }

  console.log('--- SIGNUP TRACE ---')
  console.log('Email:', `[${data.email}]`)
  console.log('Full Name:', data.fullName)

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
      }
    }
  })

  if (error) {
    console.error('Signup error:', error.message)
    console.log('--------------------')
    redirect(`/error?message=${encodeURIComponent(error.message)}`)
  }

  console.log('Signup initial success (check email)')
  console.log('--------------------')
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  console.log('Log out successful')
  revalidatePath('/', 'layout')
  redirect('/login')
}
