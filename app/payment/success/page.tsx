"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');

    return (
        <div className="max-w-md w-full text-center space-y-8 animate-in-zoom">
            {/* Success Icon */}
            <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    Welcome to Pro!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed">
                    Your upgrade to {plan ? `MindMint Pro (${plan})` : 'MindMint Pro'} is complete. Get ready to supercharge your learning!
                </p>
            </div>

            {/* Activation Guide */}
            <div className="bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 p-6 rounded-3xl space-y-4">
                <div className="flex items-start gap-4 text-left">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex-shrink-0 flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-500/20">1</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Click the button below to return to the dashboard.</p>
                </div>
                <div className="flex items-start gap-4 text-left border-t border-indigo-100/50 dark:border-indigo-500/5 pt-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex-shrink-0 flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-500/20">2</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Use the <span className="text-indigo-600 dark:text-indigo-400 font-bold">"Refresh Subscription"</span> button in the upgrade window if your status hasn't updated automatically.</p>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
                <Link
                    href="/"
                    className="flex items-center justify-center w-full py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.98] group"
                >
                    Get Started
                    <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </Link>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Instant Activation • Secure Billing</p>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center p-6 text-gray-900 dark:text-white">
            <Suspense fallback={<div className="text-gray-500 font-medium">Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
