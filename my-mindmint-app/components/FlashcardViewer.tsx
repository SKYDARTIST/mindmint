'use client';

import React, { useState } from 'react';
import { Flashcard, FlashcardLayout } from '../types';

interface FlashcardViewerProps {
  cards: Flashcard[];
  layout?: FlashcardLayout;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ cards, layout = 'qa' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  // --- Design System for Layouts ---

  const getLayoutStyles = (currentLayout: string) => {
    switch (currentLayout) {
      case 'minimal':
        return {
          front: 'bg-white dark:bg-[#1C1C1F] border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center text-center',
          back: 'bg-gray-50 dark:bg-[#222226] border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center text-center',
          questionClass: 'text-2xl md:text-3xl font-light tracking-tight text-gray-800 dark:text-gray-100',
          answerClass: 'text-lg md:text-xl font-normal text-gray-600 dark:text-gray-300',
          indicator: 'hidden'
        };
      
      case 'keyword':
        return {
          front: 'bg-stone-50 dark:bg-[#1A1A1A] border-2 border-stone-200 dark:border-stone-800 flex flex-col justify-center items-center text-center',
          back: 'bg-stone-100 dark:bg-[#202020] border-2 border-stone-200 dark:border-stone-800 flex flex-col justify-center items-center text-center p-12',
          questionClass: 'text-4xl md:text-5xl font-black tracking-tighter text-stone-900 dark:text-stone-100',
          answerClass: 'text-xl md:text-2xl font-serif italic text-stone-700 dark:text-stone-400',
          indicator: 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
        };

      case 'chunked':
        return {
          // Updated to Premium Grey/Monochrome
          front: 'bg-white dark:bg-[#1C1C1F] border-l-[6px] border-gray-200 dark:border-gray-700 flex flex-col justify-center items-start text-left pl-12 pr-8',
          back: 'bg-gray-50 dark:bg-[#222225] border-l-[6px] border-gray-400 dark:border-gray-500 flex flex-col justify-center items-start text-left pl-12 pr-8',
          questionClass: 'text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight',
          answerClass: 'text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300',
          indicator: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
        };

      case 'scenario':
        return {
          front: 'bg-gradient-to-br from-indigo-50 to-white dark:from-[#201C2E] dark:to-[#18181B] border border-indigo-100 dark:border-indigo-900 flex flex-col justify-center items-center text-center',
          back: 'bg-white dark:bg-[#1C1C1F] border border-indigo-100 dark:border-indigo-900 flex flex-col justify-center items-center text-center',
          questionClass: 'text-xl md:text-2xl font-medium text-indigo-900 dark:text-indigo-100 italic',
          answerClass: 'text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200',
          indicator: 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200'
        };

      case 'qa':
      default:
        // Classic Look
        return {
          front: 'bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-800 flex flex-col justify-center items-center text-center',
          back: 'bg-indigo-50 dark:bg-[#201C2E] border border-indigo-200 dark:border-indigo-800 flex flex-col justify-center items-center text-center',
          questionClass: 'text-lg md:text-2xl font-semibold text-gray-800 dark:text-white',
          answerClass: 'text-lg md:text-xl text-gray-800 dark:text-white',
          indicator: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        };
    }
  };

  const styles = getLayoutStyles(layout);

  if (!cards || cards.length === 0) return <div>No cards generated.</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-8 fade-in p-4 md:p-8">
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-center text-sm font-medium">
        <span className="text-gray-400 dark:text-gray-500">
          Card {currentIndex + 1} <span className="text-gray-300 dark:text-gray-700">/</span> {cards.length}
        </span>
        
        {currentCard.tag && (
          <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-bold ${styles.indicator || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
            {currentCard.tag}
          </span>
        )}
      </div>

      {/* Card Container */}
      <div 
        className="relative w-full aspect-[3/2] perspective-1000 cursor-pointer group"
        onClick={handleFlip}
      >
        <div className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front Side */}
          <div className={`absolute w-full h-full backface-hidden rounded-3xl p-8 md:p-12 shadow-sm transition-colors ${styles.front}`}>
            {layout === 'qa' && <h3 className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest mb-6 font-bold">Question</h3>}
            {layout === 'chunked' && <div className="mb-4 w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>}
            
            <p className={`${styles.questionClass} overflow-y-auto max-h-full no-scrollbar`}>
              {currentCard.question}
            </p>
            
            <div className="mt-auto pt-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 dark:text-gray-500 font-medium">
               Click to flip
            </div>
          </div>

          {/* Back Side */}
          <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-3xl p-8 md:p-12 shadow-sm ${styles.back}`}>
             {layout === 'qa' && <h3 className="text-indigo-400 dark:text-indigo-300 text-xs uppercase tracking-widest mb-6 font-bold">Answer</h3>}
             
             <p className={`${styles.answerClass} overflow-y-auto max-h-full no-scrollbar`}>
              {currentCard.answer}
            </p>
          </div>

        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-sm active:scale-95"
          title="Previous Card"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div className="h-1.5 w-32 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
           <div 
             className="h-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-300" 
             style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} 
           />
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
          title="Next Card"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

    </div>
  );
};

export default FlashcardViewer;