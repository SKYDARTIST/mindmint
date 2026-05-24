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
                            At MindMint, we believe in keeping things simple and transparent. Here is exactly how we handle your information:
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">What We Collect</h3>
                        <p>
                            In the public demo, we process the text you paste only to return sample study materials for that request. The demo does not require an account, does not save your notes to a database, and does not collect payment information.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">How Data is Used</h3>
                        <p>
                            Your input text is used solely to generate the output you request, such as a mind map, flashcards, quiz, summary, or infographic. We do not use your data for advertising or unrelated tracking.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Third-Party Services</h3>
                        <p>
                            The public demo is hosted on Vercel and uses local sample generation, so your pasted text is not sent to OpenAI, Gemini, or another paid AI provider. The codebase still contains a production-style OpenAI and Firebase path for future authenticated deployments; if that mode is enabled, pasted text would be sent server-side to the configured AI provider to generate the requested result.
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
