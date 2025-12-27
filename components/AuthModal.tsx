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

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

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
            <EmailSignIn onSuccess={handleClose} />
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