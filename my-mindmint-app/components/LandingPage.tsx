"use client";

import React from "react";
import BrandLogo from "./BrandLogo";

interface LandingPageProps {
  onStart: () => void;
  onExample: () => void;
  toggleTheme: () => void;
  theme: "light" | "dark";
}

const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  onExample,
  toggleTheme,
  theme,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-20 pb-16 transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[50%] transform -translate-x-1/2 w-[800px] h-[800px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/10 transition-all text-gray-600 dark:text-gray-300"
        >
          {theme === "light" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2" />
              <path d="M12 21v2" />
              <path d="M4.22 4.22l1.42 1.42" />
              <path d="M18.36 18.36l1.42 1.42" />
              <path d="M1 12h2" />
              <path d="M21 12h2" />
              <path d="M4.22 19.78l1.42-1.42" />
              <path d="M18.36 5.64l1.42-1.42" />
            </svg>
          )}
        </button>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        
        {/* Brand Logo */}
        <div className="mb-8">
          <BrandLogo variant="stacked" size="xl" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
          Turn any text into <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            study tools instantly.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Paste notes, articles, or textbook content and instantly get mind maps,
          flashcards, and quizzes.
          <span className="text-gray-400 dark:text-gray-600 text-sm mt-2 block">
            Built by Cryptobulla.
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={onStart}
            className="px-8 py-3.5 bg-[#6E56CF] hover:bg-[#5E4AB5] dark:bg-[#7C66DC] dark:hover:bg-[#6c55cc] text-white text-base font-semibold rounded-full shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
          >
            Start Free (no signup)
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>

          <button
            onClick={onExample}
            className="px-8 py-3.5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 text-base font-medium rounded-full transition-all flex items-center justify-center gap-2"
          >
            Try Example
            <span className="text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500 dark:text-gray-300">
              PRO
            </span>
          </button>
        </div>

        {/* Helper */}
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-20">
          Try it with class notes, blog posts, or any study material.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
