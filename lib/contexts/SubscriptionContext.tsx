"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

type Plan = 'free' | 'pro';

interface SubscriptionContextType {
    user: User | null;
    plan: Plan;
    isPro: boolean;
    isLoading: boolean;
    refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [plan, setPlan] = useState<Plan>('free');
    const [isPro, setIsPro] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserPlan = useCallback(async (userId: string) => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('user_plans')
                .select('plan')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code !== 'PGRST116') {
                    console.error("Error fetching user plan:", error.message);
                }
                setPlan('free');
                setIsPro(false);
            } else if (data) {
                const currentPlan = data.plan as Plan;
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
    }, []);

    const refresh = useCallback(async () => {
        if (user) {
            setIsLoading(true);
            await fetchUserPlan(user.id);
        }
    }, [user, fetchUserPlan]);

    useEffect(() => {
        const supabase = createClient();

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                await fetchUserPlan(user.id);
            } else {
                setPlan('free');
                setIsPro(false);
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
    }, [fetchUserPlan]);

    return (
        <SubscriptionContext.Provider value={{ user, plan, isPro, isLoading, refresh }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
