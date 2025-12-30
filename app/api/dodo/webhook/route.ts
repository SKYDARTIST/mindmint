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

        // Update the profiles table as requested (matching by email)
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                plan: 'pro',
                subscription_status: 'active'
            })
            .eq('email', email);

        if (updateError) {
            console.error('Supabase Update Error:', updateError);
            return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
        }

        console.log(`Successfully activated Pro plan for: ${email}`);

        // 5. Response on success
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Webhook Processing Error:', error.message);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
