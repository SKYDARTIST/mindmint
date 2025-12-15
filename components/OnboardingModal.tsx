import React, { useState } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Illustration Components ---

const PasteIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="drop-shadow-sm">
    <circle cx="60" cy="60" r="50" className="fill-indigo-50 dark:fill-indigo-900/20" />
    <rect x="40" y="35" width="40" height="50" rx="4" className="fill-white dark:fill-[#27272A] stroke-indigo-200 dark:stroke-indigo-700" strokeWidth="2" />
    <path d="M48 50H72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-300 dark:text-indigo-600" />
    <path d="M48 60H72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-300 dark:text-indigo-600" />
    <path d="M48 70H64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-300 dark:text-indigo-600" />
    {/* Cursor */}
    <path d="M68 76L74 88L77 86L81 81L68 76Z" className="fill-indigo-600 dark:fill-indigo-400" />
  </svg>
);

const ModeIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="drop-shadow-sm">
    <circle cx="60" cy="60" r="50" className="fill-purple-50 dark:fill-purple-900/20" />
    
    {/* Mindmap Node */}
    <circle cx="60" cy="45" r="6" className="fill-white dark:fill-[#27272A] stroke-purple-400 dark:stroke-purple-500" strokeWidth="2" />
    <path d="M60 51V60" stroke="currentColor" strokeWidth="2" className="text-purple-300 dark:text-purple-600" />
    
    {/* Flashcard Rect */}
    <rect x="40" y="65" width="16" height="12" rx="2" className="fill-white dark:fill-[#27272A] stroke-purple-400 dark:stroke-purple-500" strokeWidth="2" />
    
    {/* Quiz Triangle-ish */}
    <path d="M80 65L88 80H72L80 65Z" className="fill-white dark:fill-[#27272A] stroke-purple-400 dark:stroke-purple-500" strokeWidth="2" />
    
    {/* Connection lines */}
    <path d="M60 60L48 65" stroke="currentColor" strokeWidth="2" className="text-purple-300 dark:text-purple-600" />
    <path d="M60 60L80 65" stroke="currentColor" strokeWidth="2" className="text-purple-300 dark:text-purple-600" />
  </svg>
);

const GenerateIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="drop-shadow-sm">
    <circle cx="60" cy="60" r="50" className="fill-teal-50 dark:fill-teal-900/20" />
    
    {/* Graph structure */}
    <path d="M40 70 L55 50 L75 65 L90 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400 dark:text-teal-600" />
    <circle cx="40" cy="70" r="4" className="fill-white dark:fill-[#27272A] stroke-teal-500" strokeWidth="2" />
    <circle cx="55" cy="50" r="4" className="fill-white dark:fill-[#27272A] stroke-teal-500" strokeWidth="2" />
    <circle cx="75" cy="65" r="4" className="fill-white dark:fill-[#27272A] stroke-teal-500" strokeWidth="2" />
    <circle cx="90" cy="45" r="4" className="fill-white dark:fill-[#27272A] stroke-teal-500" strokeWidth="2" />
    
    {/* Sparkles */}
    <path d="M85 30L87 35L92 37L87 39L85 44L83 39L78 37L83 35L85 30Z" className="fill-yellow-400" />
    <path d="M35 50L36 53L39 54L36 55L35 58L34 55L31 54L34 53L35 50Z" className="fill-yellow-400" />
  </svg>
);

const UpgradeIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="drop-shadow-sm">
    <circle cx="60" cy="60" r="50" className="fill-orange-50 dark:fill-orange-900/20" />
    
    {/* Crown/Diamond */}
    <path d="M60 35L75 50L68 75H52L45 50L60 35Z" className="fill-white dark:fill-[#27272A] stroke-orange-400 dark:stroke-orange-500" strokeWidth="2" strokeLinejoin="round" />
    <path d="M60 35V75" stroke="currentColor" strokeWidth="1" className="text-orange-200 dark:text-orange-800" />
    <path d="M45 50L75 50" stroke="currentColor" strokeWidth="1" className="text-orange-200 dark:text-orange-800" />
    
    {/* Rays */}
    <path d="M60 25V30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-400" />
    <path d="M85 40L80 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-400" />
    <path d="M35 40L40 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-400" />
  </svg>
);

const steps = [
  {
    title: "Paste your content",
    description: "Start by pasting your notes, articles, or any text you want to transform into visual knowledge.",
    icon: <PasteIllustration />
  },
  {
    title: "Choose a mode",
    description: "Select how you want to visualize your data: Mindmap, Flashcards, Quiz, or Summary.",
    icon: <ModeIllustration />
  },
  {
    title: "Generate & Edit",
    description: "Watch AI instantly transform your text. Toggle between visual and data views to refine.",
    icon: <GenerateIllustration />
  },
  {
    title: "Upgrade for unlimited",
    description: "Unlock unlimited generations, PDF exports, and save your projects to the cloud.",
    icon: <UpgradeIllustration />
  }
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in-fade">
      <div className="bg-white dark:bg-[#1C1C1F] w-full max-w-[440px] rounded-3xl p-8 shadow-2xl relative border border-gray-100 dark:border-gray-800 flex flex-col min-h-[440px] animate-in-zoom">
        
        {/* Skip Button */}
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase tracking-wider z-10"
        >
            Skip
        </button>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
             {/* Icon Wrapper */}
             <div className="mb-8 transform transition-transform duration-500 hover:scale-105">
                {step.icon}
             </div>
             
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                {step.title}
             </h2>
             <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-[300px] text-sm md:text-base">
                {step.description}
             </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-10">
            {/* Progress Indicators */}
            <div className="flex gap-2">
                {steps.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ease-spring ${
                            idx === currentStep 
                            ? 'w-6 bg-indigo-600 dark:bg-indigo-500' 
                            : 'w-1.5 bg-gray-200 dark:bg-gray-700'
                        }`}
                    />
                ))}
            </div>

            {/* Continue Button */}
            <button 
                onClick={handleNext}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg shadow-gray-200 dark:shadow-none hover:transform hover:-translate-y-0.5 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
                {currentStep === steps.length - 1 ? (
                   <>Get Started <span aria-hidden="true">→</span></>
                ) : (
                   'Continue'
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;