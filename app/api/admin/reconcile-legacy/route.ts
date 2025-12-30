import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * STEP 3: Legacy Subscription Reconciliation Utility
 * 
 * This endpoint allows an admin to manually link legacy Dodo subscriptions
 * (which lack metadata.supabase_user_id) to the correct Supabase accounts
 * using email matching.
 * 
 * Security: Uses RECONCILE_SECRET_KEY as a guard.
 */

export async function POST(req: Request) {
    try {
        const secret = req.headers.get('x-reconcile-secret');
        const expectedSecret = process.env.RECONCILE_SECRET_KEY;

        if (!expectedSecret || secret !== expectedSecret) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { subscriptions } = await req.json();

        if (!Array.isArray(subscriptions)) {
            return NextResponse.json({ success: false, error: 'Invalid subscriptions list' }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();
        const results = [];

        for (const sub of subscriptions) {
            const { email, plan = 'pro', status = 'active' } = sub;

            if (!email) {
                results.push({ email: 'unknown', status: 'error', message: 'Email missing' });
                continue;
            }

            // 1. Resolve user_id by email from Supabase Auth
            const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

            if (authError) {
                results.push({ email, status: 'error', message: `Auth lookup failed: ${authError.message}` });
                continue;
            }

            const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

            if (!user) {
                results.push({ email, status: 'error', message: `User with email ${email} not found in Supabase Auth` });
                continue;
            }

            const userId = user.id;

            // 2. Upsert into user_plans
            const { error: upsertError } = await supabaseAdmin
                .from('user_plans')
                .upsert({
                    user_id: userId,
                    plan: plan,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (upsertError) {
                results.push({ email, status: 'error', message: `Upsert failed: ${upsertError.message}` });
            } else {
                results.push({ email, status: 'success', userId });
                console.log(`Reconciled legacy subscription for ${email} -> ${userId}`);
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('Reconciliation Error:', error.message);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
