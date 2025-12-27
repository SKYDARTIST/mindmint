import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthCallback() {
    const supabase = await createClient() // ✅ FIX

    // Finalizes the magic-link login
    await supabase.auth.getSession()

    redirect('/') // or '/dashboard'
}
