import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { event, data } = payload;

        // 2. Only handle the subscription.active event
        if (event !== 'subscription.active') {
            console.log(`Ignoring event: ${event}`);
            return NextResponse.json({ success: true, message: 'Event ignored' });
        }

        // 2. Extract customer email
        const email = data.customer?.email;

        if (!email) {
            console.error('Webhook Error: Customer email missing from payload');
            return NextResponse.json({ success: false, error: 'Customer email missing' }, { status: 400 });
        }

        console.log(`Processing subscription.active for: ${email}`);

        // 3. Supabase logic using Admin Client
        const supabaseAdmin = createAdminClient();

        // Look up the user_id by email from the profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (profileError || !profile) {
            console.error('Profile Lookup Error:', profileError || 'Profile not found');
            return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
        }

        const userId = profile.id;

        // Update the user_plans table as requested (matching by user_id)
        const { error: updateError } = await supabaseAdmin
            .from('user_plans')
            .update({
                plan: 'pro',
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (updateError) {
            console.error('Supabase Update Error:', updateError);
            return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
        }

        console.log(`Successfully activated Pro plan for user ID: ${userId} (${email})`);

        // 5. Response on success
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Webhook Processing Error:', error.message);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
