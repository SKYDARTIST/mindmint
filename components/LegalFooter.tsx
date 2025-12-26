"use client";

import React from "react";
import Link from "next/link";

interface LegalFooterProps {
    variant?: "full" | "compact";
}

const LegalFooter: React.FC<LegalFooterProps> = ({ variant = "full" }) => {
    if (variant === "compact") {
        return (
            <div className="flex flex-col gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <Link href="/privacy" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                        Privacy
                    </Link>
                    <Link href="/terms" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                        Terms
                    </Link>
                    <Link href="/disclaimer" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                        AI Disclaimer
                    </Link>
                </div>
                <div className="opacity-50">
                    © {new Date().getFullYear()} MindMint
                </div>
            </div>
        );
    }

    return (
        <footer className="w-full py-8 mt-12 border-t border-gray-100 dark:border-white/5">
            <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                    <Link href="/privacy" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                        Terms of Service
                    </Link>
                    <Link href="/disclaimer" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                        AI Disclaimer
                    </Link>
                </div>
                <div className="opacity-50 text-center md:text-right">
                    © {new Date().getFullYear()} MindMint. Built by Cryptobulla.
                </div>
            </div>
        </footer>
    );
};

export default LegalFooter;
