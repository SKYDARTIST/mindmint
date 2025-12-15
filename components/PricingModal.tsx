import React, { useState } from 'react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckIcon = () => (
  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  return (
    <div className="pricing-overlay animate-in-fade" onClick={onClose}>
      <div className="pricing-modal animate-in-zoom" onClick={(e) => e.stopPropagation()}>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Choose the plan that fits your workflow.</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center items-center gap-3 mb-10">
          <span className={`text-sm font-medium transition-colors cursor-pointer ${billing === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`} onClick={() => setBilling('monthly')}>Monthly</span>
          <button 
            className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors focus:outline-none"
            onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
            style={{ backgroundColor: billing === 'yearly' ? '#6E56CF' : undefined }}
          >
            <div 
              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-spring"
              style={{ transform: billing === 'yearly' ? 'translateX(24px)' : 'translateX(0)' }}
            />
          </button>
          <span className={`text-sm font-medium transition-colors cursor-pointer ${billing === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`} onClick={() => setBilling('yearly')}>
            Yearly <span className="text-indigo-600 dark:text-indigo-400 text-xs bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md ml-1 font-semibold">Save 20%</span>
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Free Plan */}
          <div className="pricing-card">
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Free</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-500 dark:text-gray-500 ml-1 text-sm">/forever</span>
              </div>
              <p className="text-xs text-transparent mt-1 select-none">Spacer</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Great for quick schoolwork or testing the tool.</p>
            </div>
            
            <button className="w-full py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mb-6">
              Current Plan
            </button>

            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-3"><CheckIcon /> 3 free generations</li>
              <li className="flex items-center gap-3"><CheckIcon /> Mindmap, flashcards, quiz</li>
              <li className="flex items-center gap-3"><CheckIcon /> Summary mode</li>
              <li className="flex items-center gap-3 opacity-50"><CrossIcon /> No export (PDF/PNG)</li>
              <li className="flex items-center gap-3 opacity-50"><CrossIcon /> No saved drafts</li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card pro">
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                Pro
                <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">Recommended</span>
              </h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${billing === 'monthly' ? '4.99' : '49'}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">/{billing === 'monthly' ? 'month' : 'year'}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-1">
                {billing === 'yearly' ? 'Billed annually ($4.08/mo)' : 'Billed monthly'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Perfect for students, creators, and researchers.</p>
            </div>

            <button className="w-full py-2 px-4 rounded-lg bg-[#6E56CF] dark:bg-[#7C66DC] text-white font-medium text-sm hover:bg-[#5e4ab5] dark:hover:bg-[#6c55cc] shadow-md shadow-indigo-200 dark:shadow-none transition-all transform active:scale-95 mb-6">
              Upgrade to Pro
            </button>

            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
              <li className="flex items-center gap-3"><CheckIcon /> Unlimited generations</li>
              <li className="flex items-center gap-3"><CheckIcon /> Export PDF / PNG</li>
              <li className="flex items-center gap-3"><CheckIcon /> Saved drafts</li>
              <li className="flex items-center gap-3"><CheckIcon /> Priority processing</li>
              <li className="flex items-center gap-3"><CheckIcon /> Early access to new tools</li>
            </ul>
          </div>

        </div>

        <div className="mt-10 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
          <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
             Built by Cryptobulla <span className="text-red-400">❤️</span>
          </p>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default PricingModal;