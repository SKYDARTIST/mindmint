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

        // 2. Extract Supabase User ID from metadata
        const userId = data.metadata?.supabase_user_id;

        if (!userId) {
            console.error('Webhook Error: supabase_user_id missing from metadata');
            return NextResponse.json({ success: false, error: 'User ID missing in metadata' }, { status: 400 });
        }

        console.log(`Processing subscription.active for User ID: ${userId}`);

        // 3. Supabase logic using Admin Client
        const supabaseAdmin = createAdminClient();

        // Update the user_plans table using upsert for the specific user_id
        // This handles both new users and existing users securely.
        const { error: updateError } = await supabaseAdmin
            .from('user_plans')
            .upsert({
                user_id: userId,
                plan: 'pro',
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (updateError) {
            console.error('Supabase Upsert Error:', updateError);
            return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
        }

        console.log(`Successfully activated Pro plan for user ID: ${userId}`);

        // 5. Response on success
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Webhook Processing Error:', error.message);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
