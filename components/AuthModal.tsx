'use client';

import React from 'react';
import BrandLogo from './BrandLogo';
import GoogleSignInButton from './auth/GoogleSignInButton';
import EmailSignIn from './auth/EmailSignIn';
import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [showEmailInput, setShowEmailInput] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowEmailInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in-fade" onClick={handleClose}>
      <div
        className="bg-white dark:bg-[#1C1C1F] w-full max-w-[420px] rounded-2xl p-10 shadow-2xl border border-gray-100 dark:border-gray-800 relative animate-in-zoom flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Back Button (only when email input is shown) */}
        {showEmailInput && (
          <button
            onClick={() => setShowEmailInput(false)}
            className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        )}

        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center gap-6 w-full">
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            <BrandLogo variant="icon" size="xl" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {showEmailInput ? 'Sign in with Email' : 'Welcome to MindMint'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {showEmailInput
                ? 'We’ll send a magic link to your inbox'
                : 'Mindmaps, flashcards, summaries — powered by AI'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          {!showEmailInput ? (
            <>
              {/* Primary Google Button */}
              <GoogleSignInButton />

              {/* Secondary Email Button */}
              <button
                onClick={() => setShowEmailInput(true)}
                className="w-full flex items-center justify-center gap-3 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>Continue with Email</span>
              </button>
            </>
          ) : (
            <EmailSignIn />
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-600 text-center leading-relaxed px-4">
          By continuing you agree to the <button className="underline hover:text-gray-600 dark:hover:text-gray-300">Terms</button> and <button className="underline hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</button>.
        </p>

      </div>
    </div>
  );
};

export default AuthModal;