import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthCallback({
    searchParams,
}: {
    searchParams: Promise<{ code?: string; next?: string }>
}) {
    const { code, next = '/' } = await searchParams
    const supabase = await createClient()

    if (code) {
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user) {
            // Ensure the user has a plan entry
            const { ensureUserPlan } = await import('@/app/actions')
            await ensureUserPlan(user.id)
        }
    }

    return redirect(next)
}
