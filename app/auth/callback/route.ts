import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user) {
            // Ensure the user has a plan entry
            const { ensureUserPlan } = await import('@/app/actions')
            await ensureUserPlan(user.id)

            const forwardHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that it's localhost:3000
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardHost) {
                return NextResponse.redirect(`https://${forwardHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
