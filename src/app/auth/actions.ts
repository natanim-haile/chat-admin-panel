'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: signInResult, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    // Check that this email is an admin
    const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('email', data.email)
        .maybeSingle()

    if (!admin) {
        await supabase.auth.signOut()
        return { error: 'Not an admin. Please use an admin account.' }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                name: formData.get('name') as string,
            }
        }
    }

    // Create the user
    const { data: signUpData, error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    // Add to admins table (simple, no extra security)
    const authUserId = signUpData.user?.id
    await supabase.from('admins').insert({
        email: data.email,
        name: (data.options?.data as any)?.name ?? null,
        auth_user_id: authUserId,
    }).single()

    // If email confirmation is enabled, we should probably tell the user to check their email.
    // For now, we'll redirect to a page ensuring them to check email or directly to login.
    // If email confirmation is disabled, they are logged in.

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/login')
}
