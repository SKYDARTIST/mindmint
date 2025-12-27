'use server'

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Ensures that a user has a row in the public.user_plans table.
 * If the row doesn't exist, it creates one with the 'free' plan.
 * This is idempotent and safe to call multiple times.
 */
export async function ensureUserPlan(userId: string) {
    if (!userId) return { success: false, error: 'User ID is required' };

    const supabaseAdmin = createAdminClient();

    try {
        // We use upsert with onConflict on user_id to ensure idempotency.
        // If the row exists, it does nothing (or we can just do nothing if we prefer).
        // Since we don't want to overwrite existing plans, we check first or use a specific upsert.

        const { data, error: fetchError } = await supabaseAdmin
            .from('user_plans')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows found"
            console.error('Error checking user plan:', fetchError);
            return { success: false, error: fetchError.message };
        }

        if (!data) {
            const { error: insertError } = await supabaseAdmin
                .from('user_plans')
                .insert({
                    user_id: userId,
                    plan: 'free',
                    updated_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('Error creating user plan:', insertError);
                return { success: false, error: insertError.message };
            }
            console.log(`Created default 'free' plan for user: ${userId}`);
        }

        return { success: true };
    } catch (err: any) {
        console.error('Unexpected error in ensureUserPlan:', err);
        return { success: false, error: err.message };
    }
}
