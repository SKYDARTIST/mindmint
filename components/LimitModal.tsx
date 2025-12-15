import React from 'react';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const LockIcon = () => (
  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="pricing-overlay animate-in-fade" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-[360px] rounded-2xl p-8 shadow-2xl relative animate-in-zoom text-center" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
           <LockIcon />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">You’ve used your free runs</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 px-2">
          Upgrade to continue generating unlimited mindmaps, flashcards, and summaries.
        </p>

        <button 
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-[#6E56CF] to-[#8B5CF6] text-white font-medium py-2.5 px-4 rounded-lg hover:opacity-90 transition-all shadow-md shadow-indigo-100 transform active:scale-[0.98] mb-3"
        >
          Upgrade to Pro
        </button>

        <button 
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default LimitModal;