"use client";

import React from "react";

interface DemoLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignUp: () => void;
    onUpgrade: () => void;
}

const DemoLimitModal: React.FC<DemoLimitModalProps> = ({
    isOpen,
    onClose,
    onSignUp,
    onUpgrade,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-[#1C1C1F] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-in zoom-in duration-300">
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-b border-gray-200 dark:border-white/10">
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                            <span className="text-3xl">🎉</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                            You've Tried MindMint!
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Ready to unlock the full experience?
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Free Plan */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 border-indigo-200 dark:border-indigo-500/30 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                FREE PLAN
                            </h3>
                            <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-black rounded-full">
                                RECOMMENDED
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-green-500">✓</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    3 generations per day
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-green-500">✓</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Save to "My Notes"
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-green-500">✓</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Access history anytime
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-green-500">✓</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    All formats (Mindmap, Flashcards, Quiz, Summary)
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onSignUp}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                        >
                            Sign Up Free →
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-white dark:bg-[#1C1C1F] text-xs font-bold text-gray-500 uppercase tracking-wider">
                                or upgrade
                            </span>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-500/20 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                PRO PLAN
                            </h3>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-amber-600 dark:text-amber-500">
                                    $5
                                </span>
                                <span className="text-xs text-gray-500 font-bold">
                                    /month
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-amber-500">★</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Everything in Free
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-amber-500">★</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Unlimited generations
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-amber-500">★</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Export to PDF & PNG
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-amber-500">★</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    2500 words per input
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-amber-500">★</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Infographics unlocked
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onUpgrade}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl shadow-xl shadow-amber-500/20 transition-all active:scale-95"
                        >
                            Upgrade to Pro →
                        </button>

                        <p className="text-center text-xs text-gray-500 font-medium">
                            Or save 50% with yearly: <span className="font-black text-amber-600">$30/year</span>
                        </p>
                    </div>

                    {/* Back button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        ← Back to Demo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DemoLimitModal;
