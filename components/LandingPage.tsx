"use client";

import React from "react";
import BrandLogo from "@/components/BrandLogo";

interface LandingPageProps {
  onStart: () => void;
  onExample: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onExample, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] flex flex-col items-center justify-center px-6 transition-colors duration-500 bg-dot-pattern">

      {/* Theme Toggle Top Right */}
      <div className="absolute top-8 right-8 animate-in fade-in duration-700">
        <button
          onClick={toggleTheme}
          className="p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all group"
        >
          {theme === "light" ? (
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-amber-500 transition-colors"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dark Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 group-hover:text-amber-300 transition-colors"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Light Mode</span>
            </div>
          )}
        </button>
      </div>

      <div className="w-full max-w-4xl text-center space-y-16">

        {/* Logo */}
        <BrandLogo variant="stacked" size="xl" />

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.85] animate-in">
          Turn any text into
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            study tools instantly.
          </span>
        </h1>

        {/* Subtext */}
        <div className="space-y-4">
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
            Paste notes, articles, or textbook content and instantly get mind maps,
            <br className="hidden md:block" /> flashcards, and quizzes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gray-200 dark:bg-white/10" />
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
              Built by Cryptobulla
            </p>
            <span className="h-px w-8 bg-gray-200 dark:bg-white/10" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button
            onClick={onStart}
            className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-full transition-all flex items-center gap-3 min-w-[300px] shadow-2xl shadow-indigo-600/30 active:scale-95 group"
          >
            <span className="flex-1">Start Generating Free</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            onClick={() => onExample()} // We'll repurpose onExample to show pricing or we can pass a new prop
            className="px-10 py-5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-full transition-all flex items-center gap-4 min-w-[300px] shadow-sm active:scale-95"
          >
            <span className="flex-1 font-bold">Get Pro Version</span>
            <span className="text-[10px] bg-amber-500 text-white px-3 py-1.5 rounded-full font-black tracking-widest leading-none shadow-lg shadow-amber-500/20">PRO</span>
          </button>
        </div>

        {/* Footer text */}
        <div className="space-y-2">
          <p className="text-xs text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest opacity-60">
            3 free generations per day. No signup required.
          </p>
          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.2em] opacity-80">
            Upgrade for unlimited access & pro tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;