
import React from 'react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center p-6">
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
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Thank you for upgrading to MindMint Pro.
                    </p>
                </div>

                {/* Activation Note */}
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-2xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Your Pro subscription is being processed and will activate shortly. Please refresh the app in a few moments.
                    </p>
                </div>

                {/* Back Button */}
                <div className="pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center w-full py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
