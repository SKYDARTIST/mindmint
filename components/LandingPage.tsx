import React from 'react';
import BrandLogo from './BrandLogo';

interface LandingPageProps {
  onStart: () => void;
  onExample: () => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onExample, toggleTheme, theme }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-20 pb-16 transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[50%] transform -translate-x-1/2 w-[800px] h-[800px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <button 
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/10 transition-all text-gray-600 dark:text-gray-300"
        >
            {theme === 'light' ? (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
            )}
        </button>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        
        {/* Brand Logo Stacked */}
        <div className="mb-8 animate-in opacity-0 translate-y-4" style={{ animationDelay: '0ms' }}>
           <BrandLogo variant="stacked" size="xl" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6 animate-in opacity-0 translate-y-4" style={{ animationDelay: '100ms' }}>
          Turn any text into <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">study tools instantly.</span>
        </h1>

        {/* Subhead */}
        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed animate-in opacity-0 translate-y-4" style={{ animationDelay: '200ms' }}>
          Paste notes, articles, or textbook content and instantly get mind maps, flashcards, and quizzes. <br className="hidden md:block"/>
          <span className="text-gray-400 dark:text-gray-600 text-sm mt-2 block">Built by Cryptobulla.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-in opacity-0 translate-y-4" style={{ animationDelay: '300ms' }}>
          <button 
            onClick={onStart}
            className="px-8 py-3.5 bg-[#6E56CF] hover:bg-[#5E4AB5] dark:bg-[#7C66DC] dark:hover:bg-[#6c55cc] text-white text-base font-semibold rounded-full shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
          >
            Start Free (no signup)
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          <button 
            onClick={onExample}
            className="px-8 py-3.5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 text-base font-medium rounded-full transition-all flex items-center justify-center gap-2"
          >
            Try Example
            <span className="text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500 dark:text-gray-300">PRO</span>
          </button>
        </div>

        {/* Helper line */}
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-20 animate-in opacity-0 translate-y-4" style={{ animationDelay: '400ms' }}>
          Try it with class notes, blog posts, or any study material.
        </p>

        {/* Product Mockup */}
        <div className="w-full max-w-4xl relative animate-in opacity-0 translate-y-8" style={{ animationDelay: '500ms' }}>
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 dark:opacity-30"></div>
          <div className="relative bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden aspect-[16/10] flex flex-col transition-colors">
            
            {/* Fake Browser Bar */}
            <div className="h-9 bg-gray-50 dark:bg-[#202023] border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
              </div>
              <div className="mx-auto bg-white dark:bg-[#27272A] border border-gray-200 dark:border-gray-700 h-6 w-64 rounded-md flex items-center justify-center">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">mindmint.ai/new-project</span>
              </div>
            </div>

            {/* Fake UI Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Fake Sidebar */}
              <div className="w-48 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1C1C1F] p-4 hidden sm:flex flex-col gap-3">
                <div className="mb-4">
                  <BrandLogo variant="full" size="sm" />
                </div>
                <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-8 w-full bg-white dark:bg-[#27272A] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex items-center px-3 gap-2">
                   <div className="w-4 h-4 rounded-full border border-indigo-200 dark:border-indigo-700"></div>
                   <div className="h-2 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="h-8 w-full rounded-lg flex items-center px-3 gap-2 opacity-50">
                   <div className="w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-700"></div>
                   <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-8 w-full rounded-lg flex items-center px-3 gap-2 opacity-50">
                   <div className="w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-700"></div>
                   <div className="h-2 w-14 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Fake Canvas */}
              <div className="flex-1 bg-white dark:bg-[#151518] p-6 relative flex flex-col items-center justify-center">
                 {/* Decorative Mindmap Lines */}
                 <div className="absolute inset-0 opacity-10" 
                      style={{ backgroundImage: 'radial-gradient(#6E56CF 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                 </div>
                 
                 {/* Fake Mindmap Nodes */}
                 <div className="relative z-10 flex flex-col items-center gap-8 scale-90 sm:scale-100">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 px-6 py-3 rounded-lg font-bold shadow-sm">
                      Biological Energy
                    </div>
                    <div className="flex gap-12 relative">
                        {/* Lines */}
                        <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-300 dark:bg-gray-700"></div>
                        <div className="absolute top-[-32px] left-12 w-[calc(50%-48px)] h-0.5 bg-gray-300 dark:bg-gray-700"></div>
                        <div className="absolute top-[-32px] right-12 w-[calc(50%-48px)] h-0.5 bg-gray-300 dark:bg-gray-700"></div>
                        <div className="absolute top-[-32px] left-12 w-0.5 h-8 bg-gray-300 dark:bg-gray-700"></div>
                        <div className="absolute top-[-32px] right-12 w-0.5 h-8 bg-gray-300 dark:bg-gray-700"></div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-white dark:bg-[#202023] border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium shadow-sm">
                                Photosynthesis
                            </div>
                            <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-700"></div>
                            <div className="flex gap-2">
                                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs text-gray-500 dark:text-gray-400">Light Reactions</div>
                                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs text-gray-500 dark:text-gray-400">Calvin Cycle</div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-white dark:bg-[#202023] border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium shadow-sm">
                                Cellular Respiration
                            </div>
                            <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-700"></div>
                            <div className="flex gap-2">
                                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs text-gray-500 dark:text-gray-400">Glycolysis</div>
                                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-md text-xs text-gray-500 dark:text-gray-400">Krebs Cycle</div>
                            </div>
                        </div>
                    </div>
                 </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;