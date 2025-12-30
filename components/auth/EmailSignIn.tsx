'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface EmailSignInProps {
    onSuccess?: () => void;
}

export default function EmailSignIn({ onSuccess }: EmailSignInProps) {
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Manage countdown timer
    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleEmailSignIn = async (e?: React.FormEvent) => {
        e?.preventDefault();
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
            setStep('code');
            setCountdown(30); // Start 30s countdown
            setMessage({ type: 'success', text: 'Check your email for the code!' });
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode || otpCode.length < 6) return;

        setLoading(true);
        setMessage(null);

        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otpCode,
            type: 'magiclink',
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        } else {
            setMessage({ type: 'success', text: 'Logged in successfully!' });
            // Close the modal after a short delay to let the user see the success message
            setTimeout(() => {
                onSuccess?.();
            }, 800);
        }
    };

    if (message?.type === 'success' && step === 'code' && !loading && message.text === 'Logged in successfully!') {
        return (
            <div className="w-full py-8 flex flex-col items-center justify-center space-y-4 animate-in-zoom">
                <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-green-500 font-bold">Logged in!</p>
            </div>
        );
    }

    if (step === 'code') {
        return (
            <div className="w-full space-y-4">
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Enter the code sent to <span className="font-bold text-gray-700 dark:text-gray-200">{email}</span>
                        </p>
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength={6}
                            required
                            disabled={loading}
                            className="w-full bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-3 px-4 rounded-xl text-center text-2xl tracking-[0.5em] font-mono placeholder:text-gray-400 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || otpCode.length < 6}
                        className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-600/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span>Verify & Login</span>
                        )}
                    </button>

                    <div className="flex flex-col items-center gap-3">
                        <button
                            type="button"
                            disabled={countdown > 0 || loading}
                            onClick={() => handleEmailSignIn()}
                            className="text-xs font-bold text-indigo-500 hover:text-indigo-400 disabled:text-gray-500 transition-colors"
                        >
                            {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep('email');
                                setMessage(null);
                                setCountdown(0);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            Change Email
                        </button>
                    </div>

                    <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center px-4 leading-relaxed">
                        Don't see the code? Check your <span className="font-bold">Spam</span> or <span className="font-bold">Promotions</span> folder.
                    </p>
                </form>
                {message?.type === 'error' && (
                    <p className="text-red-500 text-xs text-center font-medium animate-in-fade">{message.text}</p>
                )}
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
                            <span>Send Code</span>
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
