import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const signature = req.headers.get('webhook-signature');
        const id = req.headers.get('webhook-id');
        const timestamp = req.headers.get('webhook-timestamp');
        const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

        if (!signature || !id || !timestamp || !secret) {
            console.error('Webhook Error: Missing signature headers or DODO_PAYMENTS_WEBHOOK_SECRET');
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const rawBody = await req.text();
        const signedPayload = `${id}.${timestamp}.${rawBody}`;

        const hmac = crypto.createHmac('sha256', secret);
        const computedSignature = hmac.update(signedPayload).digest('base64');

        // Dodo Payments/Standard Webhooks format: "v1,BASE64_SIGNATURE"
        // It can have multiple signatures separated by spaces
        const passedSignatures = signature.split(' ');
        let isValid = false;

        for (const sig of passedSignatures) {
            const [version, value] = sig.split(',');
            if (version === 'v1' && value === computedSignature) {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            console.error('Webhook Error: Invalid signature detected');
            return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const { type, data } = payload; // Dodo uses 'type' for event identification

        // 1. Handle both activation and renewal events
        const supportedEvents = ['subscription.active', 'subscription.renewed'];
        if (!supportedEvents.includes(type)) {
            console.log(`Ignoring event: ${type}`);
            return NextResponse.json({ success: true, message: 'Event ignored' });
        }

        console.log(`Processing ${type} event for customer: ${data?.customer?.email}`);

        // 2. Extract Supabase User ID from metadata
        const userId = data.metadata?.user_id || data.metadata?.supabase_user_id;

        if (!userId) {
            console.error('Webhook Error: No user ID found in metadata. Payload:', JSON.stringify(data.metadata));
            return NextResponse.json({
                success: false,
                error: 'User ID missing in metadata',
                received_metadata: data.metadata
            }, { status: 400 });
        }

        console.log(`Processing ${type} for User ID: ${userId}`);

        // 3. Firestore logic using Admin SDK
        const adminDb = getAdminDb();

        try {
            await adminDb.collection('user_plans').doc(userId).set({
                user_id: userId,
                plan: 'pro',
                updated_at: new Date().toISOString()
            }, { merge: true });
        } catch (updateError) {
            console.error('Firestore Upsert Error:', updateError);
            return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
        }

        console.log(`Successfully processed ${type} for user ID: ${userId}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Webhook Processing Error:', message);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
