import React from 'react';
import type { AppMode } from "@/types";
// --- Icons & Illustrations ---

const Icons = {
  Mindmap: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-indigo-500/20 dark:text-indigo-400/20">
      <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="2" className="text-indigo-500 dark:text-indigo-400" />
      <circle cx="32" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="56" cy="32" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="56" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="32" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M32 20V14M44 32H50M32 44V50M20 32H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Flashcards: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-indigo-500 dark:text-indigo-400">
      <rect x="12" y="16" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2" className="opacity-40" />
      <rect x="16" y="20" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2" className="opacity-70" />
      <rect x="20" y="24" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <path d="M30 38H50M30 32H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Quiz: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-indigo-500 dark:text-indigo-400">
      <path d="M46 16H18C15.7909 16 14 17.7909 14 20V44C14 46.2091 15.7909 48 18 48H46C48.2091 48 50 46.2091 50 44V20C50 17.7909 48.2091 16 46 16Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
      <path d="M24 26H26M24 32H26M24 38H26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 26H40M32 32H40M32 38H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60" />
    </svg>
  ),
  Summary: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-indigo-500 dark:text-indigo-400">
      <path d="M20 12H44C46.2091 12 48 13.7909 48 16V48C48 50.2091 46.2091 52 44 52H20C17.7909 52 16 50.2091 16 48V16C16 13.7909 17.7909 12 20 12Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
      <path d="M24 22H40M24 30H40M24 38H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Infographic: () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-indigo-500 dark:text-indigo-400">
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2" className="opacity-20" />
      <path d="M32 32L32 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 32L42 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 32L20 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="18" r="3" fill="currentColor" />
      <circle cx="42" cy="42" r="3" fill="currentColor" />
      <circle cx="20" cy="36" r="3" fill="currentColor" />
    </svg>
  ),
};

// --- Empty State Component ---

export const EmptyState = ({ mode }: { mode: AppMode }) => {
  const getContent = () => {
    switch (mode) {
      case "mindmap":
        return {
          Icon: Icons.Mindmap,
          title: "Visualize your thoughts",
          desc: "Paste your notes to build a structured map",
          tag: "Structure"
        };
      case "flashcards":
        return {
          Icon: Icons.Flashcards,
          title: "Create study decks",
          desc: "Generate study cards instantly",
          tag: "Memorize"
        };
      case "quiz":
        return {
          Icon: Icons.Quiz,
          title: "Test your knowledge",
          desc: "Create interactive questions",
          tag: "Assess"
        };
      case "summary":
        return {
          Icon: Icons.Summary,
          title: "Summarize instantly",
          desc: "Turn long text into clear summaries",
          tag: "Simplify"
        };
      case "infographic":
        return {
          Icon: Icons.Infographic,
          title: "Visual takeaways",
          desc: "Transform your text into a visual layout",
          tag: "Design"
        };
      default:
        return {
          Icon: Icons.Mindmap,
          title: "Ready to generate",
          desc: "Select a mode and paste content.",
          tag: "Create"
        };
    }
  };

  const content = getContent();
  const Icon = content.Icon;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in-fade">
      {/* Decorative background circle */}
      <div className="relative mb-6 group cursor-default">
        <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-500/10 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />
        <div className="relative w-24 h-24 bg-indigo-50 dark:bg-[#222226] rounded-3xl flex items-center justify-center border border-indigo-100 dark:border-white/5 shadow-sm group-hover:-translate-y-2 transition-transform duration-500 ease-spring">
          <Icon />
        </div>
      </div>

      <div className="space-y-2 max-w-xs">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          {content.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {content.desc}
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
           Waiting for input
        </span>
      </div>
    </div>
  );
};


// --- Loading State Component ---

const ShimmerLine = ({ className = "" }: { className?: string }) => (
  <div className={`h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse ${className}`} />
);

const ShimmerBox = ({ className = "" }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse ${className}`} />
);

export const LoadingState = ({ mode }: { mode: AppMode }) => {
  
  const LoadingText = () => (
    <div className="flex items-center gap-2 mt-8 text-indigo-600 dark:text-indigo-400 font-medium text-sm animate-pulse">
       <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
       <span>Generating {mode}...</span>
    </div>
  );

  const renderSkeleton = () => {
    switch (mode) {
      case "mindmap":
        return (
          <div className="relative w-full h-full max-w-lg aspect-square mx-auto flex items-center justify-center opacity-50">
            {/* Central Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-12 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg animate-pulse" />
            
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-1/2 w-px h-24 bg-gray-200 dark:bg-gray-800 -translate-y-full origin-bottom rotate-45" />
            <div className="absolute top-1/2 left-1/2 w-px h-24 bg-gray-200 dark:bg-gray-800 -translate-y-full origin-bottom -rotate-45" />
            <div className="absolute top-1/2 left-1/2 w-px h-24 bg-gray-200 dark:bg-gray-800 origin-top rotate-[135deg]" />
            <div className="absolute top-1/2 left-1/2 w-px h-24 bg-gray-200 dark:bg-gray-800 origin-top -rotate-[135deg]" />

            {/* Child Nodes */}
            <div className="absolute top-[20%] left-[20%] w-24 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="absolute top-[20%] right-[20%] w-24 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="absolute bottom-[20%] left-[20%] w-24 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="absolute bottom-[20%] right-[20%] w-24 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          </div>
        );

      case "flashcards":
        return (
          <div className="w-full max-w-md mx-auto aspect-[3/2] bg-white dark:bg-[#1C1C1F] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm flex flex-col items-center justify-center space-y-4">
             <ShimmerLine className="w-16 h-3 mb-4" />
             <ShimmerLine className="w-3/4 h-4" />
             <ShimmerLine className="w-1/2 h-4" />
             <div className="mt-8 pt-8 w-full flex justify-center opacity-30">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
             </div>
          </div>
        );

      case "quiz":
        return (
          <div className="w-full max-w-lg mx-auto space-y-6">
             <div className="bg-white dark:bg-[#1C1C1F] p-6 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex gap-3">
                   <ShimmerBox className="w-6 h-6 rounded" />
                   <div className="space-y-2 flex-1">
                      <ShimmerLine className="w-3/4" />
                      <ShimmerLine className="w-1/2" />
                   </div>
                </div>
                <div className="space-y-3 pt-2">
                   <ShimmerBox className="w-full h-10 rounded-lg opacity-60" />
                   <ShimmerBox className="w-full h-10 rounded-lg opacity-60" />
                   <ShimmerBox className="w-full h-10 rounded-lg opacity-60" />
                </div>
             </div>
          </div>
        );

      case "infographic":
         return (
            <div className="w-full max-w-2xl mx-auto grid grid-cols-2 gap-6">
               {[1, 2].map(i => (
                  <div key={i} className="bg-white dark:bg-[#1C1C1F] p-6 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                     <div className="flex items-center gap-4">
                        <ShimmerBox className="w-12 h-12 rounded-xl" />
                        <ShimmerLine className="w-24 h-4" />
                     </div>
                     <div className="space-y-2">
                        <ShimmerLine className="w-full" />
                        <ShimmerLine className="w-5/6" />
                        <ShimmerLine className="w-4/6" />
                     </div>
                  </div>
               ))}
            </div>
         );

      case "summary":
      default:
        return (
          <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
             <ShimmerLine className="w-1/3 h-6 mb-8" />
             <div className="space-y-3">
                <ShimmerLine className="w-full" />
                <ShimmerLine className="w-full" />
                <ShimmerLine className="w-5/6" />
                <ShimmerLine className="w-full" />
                <ShimmerLine className="w-4/5" />
             </div>
             <div className="space-y-3 pt-6">
                <ShimmerLine className="w-full" />
                <ShimmerLine className="w-11/12" />
                <ShimmerLine className="w-full" />
             </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 fade-in">
       <div className="w-full flex-1 flex items-center justify-center">
         {renderSkeleton()}
       </div>
       <LoadingText />
    </div>
  );
};