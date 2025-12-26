'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function EmailSignIn() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setMessage(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Check your email for the magic link!' });
        }
        setLoading(false);
    };

    if (message?.type === 'success') {
        return (
            <div className="w-full p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                <p className="text-indigo-400 text-sm font-medium">{message.text}</p>
                <button
                    onClick={() => setMessage(null)}
                    className="mt-3 text-xs text-indigo-400/60 hover:text-indigo-400 underline transition-colors"
                >
                    Try a different email
                </button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div className="relative">
                    <input
                        type="email"
                        placeholder="Enter your email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-3 px-4 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-600/20"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Send Magic Link</span>
                        </>
                    )}
                </button>
            </form>
            {message?.type === 'error' && (
                <p className="text-red-500 text-xs text-center font-medium animate-in-fade">{message.text}</p>
            )}
        </div>
    );
}
