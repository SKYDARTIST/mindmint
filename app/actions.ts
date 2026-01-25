'use server'

import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Ensures that a user has a row in the user_plans collection.
 * If the doc doesn't exist, it creates one with the 'free' plan.
 */
export async function ensureUserPlan(userId: string) {
    if (!userId) return { success: false, error: 'User ID is required' };

    try {
        const docRef = doc(db, 'user_plans', userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                user_id: userId,
                plan: 'free',
                updated_at: new Date().toISOString()
            });
            console.log(`Created default 'free' plan for user: ${userId}`);
        }

        return { success: true };
    } catch (err) {
        console.error('Unexpected error in ensureUserPlan:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: message };
    }
}
