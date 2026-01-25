"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
            const docRef = doc(db, 'user_plans', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const currentPlan = data.plan as Plan;
                setPlan(currentPlan);
                setIsPro(currentPlan === 'pro');
            } else {
                setPlan('free');
                setIsPro(false);
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
            await fetchUserPlan(user.uid);
        }
    }, [user, fetchUserPlan]);

    useEffect(() => {
        const { isSignInWithEmailLink, signInWithEmailLink } = import('firebase/auth').then(m => m);

        const handleMagicLink = async () => {
            const { isSignInWithEmailLink, signInWithEmailLink } = await import('firebase/auth');
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');
                if (!email) {
                    email = window.prompt('Please provide your email for confirmation');
                }
                if (email) {
                    try {
                        await signInWithEmailLink(auth, email, window.location.href);
                        window.localStorage.removeItem('emailForSignIn');
                        // Redirect to clean up the URL
                        const url = new URL(window.location.href);
                        url.search = '';
                        window.history.replaceState({}, '', url.toString());
                    } catch (err) {
                        console.error("Error signing in with email link:", err);
                    }
                }
            }
        };

        handleMagicLink();

        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            setUser(currentUser);
            if (currentUser) {
                // Ensure the user has a plan record in Firestore
                const { ensureUserPlan } = await import('@/app/actions');
                await ensureUserPlan(currentUser.uid);
                await fetchUserPlan(currentUser.uid);
            } else {
                setPlan('free');
                setIsPro(false);
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
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
