import { NextResponse } from 'next/server';
import { adminAuth, getAdminDb } from '@/lib/firebase/admin';

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

        const adminDb = getAdminDb();
        const results = [];

        for (const sub of subscriptions) {
            const { email, plan = 'pro' } = sub;

            if (!email) {
                results.push({ email: 'unknown', status: 'error', message: 'Email missing' });
                continue;
            }

            // 1. Resolve user ID by email using Firebase Admin SDK
            try {
                const userRecord = await adminAuth.getUserByEmail(email);
                const userId = userRecord.uid;

                // 2. Upsert into user_plans collection
                await adminDb.collection('user_plans').doc(userId).set({
                    user_id: userId,
                    plan: plan,
                    updated_at: new Date().toISOString()
                }, { merge: true });

                results.push({ email, status: 'success', userId });
                console.log(`Reconciled legacy subscription for ${email} -> ${userId}`);
            } catch (error) {
                const firebaseError = error as { code?: string; message?: string };
                if (firebaseError.code === 'auth/user-not-found') {
                    results.push({ email, status: 'error', message: `User ${email} not found in Firebase Auth` });
                } else {
                    results.push({ email, status: 'error', message: `Operation failed: ${firebaseError.message || 'Unknown error'}` });
                }
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Reconciliation Error:', message);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
