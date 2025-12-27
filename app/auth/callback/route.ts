import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/'

    const redirectTo = (path: string) => {
        const forwardHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${path}`)
        } else if (forwardHost) {
            return NextResponse.redirect(`https://${forwardHost}${path}`)
        }
        return NextResponse.redirect(`${origin}${path}`)
    }

    const supabase = await createClient()

    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data.user) {
            const { ensureUserPlan } = await import('@/app/actions')
            await ensureUserPlan(data.user.id)
            return redirectTo(next)
        }
        if (error) {
            return redirectTo(`/?error=auth_failed&message=${encodeURIComponent(error.message)}`)
        }
    } else if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type: type as any,
            token_hash,
        })
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { ensureUserPlan } = await import('@/app/actions')
                await ensureUserPlan(user.id)
            }
            return redirectTo(next)
        }
        if (error) {
            return redirectTo(`/?error=auth_failed&message=${encodeURIComponent(error.message)}`)
        }
    }

    return redirectTo('/?error=auth_failed&message=no_valid_auth_params')
}
