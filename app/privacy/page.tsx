"use client";

import React from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#09090b] text-gray-900 dark:text-white px-6 py-20 transition-colors duration-500 bg-dot-pattern">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="flex flex-col items-center gap-8">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <BrandLogo size="md" />
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-center">
                        Privacy Policy
                    </h1>
                </div>

                <div className="prose prose-indigo dark:prose-invert max-w-none space-y-8 font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-lg font-black uppercase tracking-[0.2em] text-indigo-500">How we handle your data</h2>
                        <p>
                            At MindMint, we believe in keeping thing simple and transparent. Here is exactly how we handle your information:
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">What We Collect</h3>
                        <p>
                            Currently, we only process the text you paste into the app to generate your study materials. If you choose to upgrade to our Pro plan, we may collect your email address for account management and payment purposes.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">How Data is Used</h3>
                        <p>
                            Your input text is used solely for the purpose of generating the outputs you request (mindmaps, flashcards, etc.). We do not use your data for advertising or any other unrelated purposes.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Third-Party Services</h3>
                        <p>
                            We use OpenAI to power the AI logic and Vercel to host the application. Your input text is sent to OpenAI's models to generate the results. These services have their own privacy practices which we encourage you to review.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">No Selling of Data</h3>
                        <p className="font-bold text-gray-900 dark:text-white">
                            We do not sell, trade, or rent your personal information to third parties. Period.
                        </p>
                    </section>
                </div>

                <div className="pt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-full transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
