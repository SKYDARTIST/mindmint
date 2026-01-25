'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { sendSignInLinkToEmail } from 'firebase/auth';

export default function EmailSignIn() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleEmailSignIn = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!email) return;

        setLoading(true);
        setMessage(null);

        try {
            const actionCodeSettings = {
                url: `${window.location.origin}/`,
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);

            // Save email locally to complete sign-in on return
            window.localStorage.setItem('emailForSignIn', email);

            setMessage({ type: 'success', text: 'Check your email for the sign-in link!' });
        } catch (error) {
            console.error('Sign-in error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to send sign-in link.';
            setMessage({ type: 'error', text: errorMessage });
        }
        setLoading(false);
    };

    if (message?.type === 'success') {
        return (
            <div className="w-full py-8 flex flex-col items-center justify-center space-y-4 animate-in-zoom">
                <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="text-center px-4">
                    <p className="text-green-500 font-bold mb-1">Check your inbox!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">We&apos;ve sent a magic link to <span className="font-bold">{email}</span></p>
                    <p className="text-[10px] text-gray-400 mt-4">Click the link in your email to log in instantly. You can close this tab if you want.</p>
                </div>
                <button
                    onClick={() => setMessage(null)}
                    className="text-xs text-indigo-500 font-bold hover:underline"
                >
                    Enter a different email
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
