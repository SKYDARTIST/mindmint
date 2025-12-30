"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function useSubscription() {
    const [user, setUser] = useState<User | null>(null);
    const [plan, setPlan] = useState<'free' | 'pro'>('free');
    const [isPro, setIsPro] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserPlan = async (userId: string) => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('user_plans')
                .select('plan')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code !== 'PGRST116') { // PGRST116 is "no rows found", which is fine for free
                    console.error("Error fetching user plan:", error.message);
                }
                setPlan('free');
                setIsPro(false);
            } else if (data) {
                const currentPlan = data.plan as 'free' | 'pro';
                setPlan(currentPlan);
                setIsPro(currentPlan === 'pro');
            }
        } catch (err) {
            console.error("Unexpected error in fetchUserPlan:", err);
            setPlan('free');
            setIsPro(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const supabase = createClient();

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                await fetchUserPlan(user.id);
            } else {
                setIsLoading(false);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchUserPlan(currentUser.id);
            } else {
                setPlan('free');
                setIsPro(false);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, plan, isPro, isLoading, refresh: () => user && fetchUserPlan(user.id) };
}
