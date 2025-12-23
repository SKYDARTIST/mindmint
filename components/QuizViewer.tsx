'use client';

import React, { useState } from 'react';
import { QuizItem, QuizLayout } from '../types';

interface QuizViewerProps {
   quizItems: QuizItem[];
   layout?: QuizLayout;
}

const CheckIcon = () => (
   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
   </svg>
);

const XIcon = () => (
   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
   </svg>
);

const QuizViewer: React.FC<QuizViewerProps> = ({ quizItems, layout = 'classic' }) => {
   const [answers, setAnswers] = useState<Record<number, string>>({});
   const [submitted, setSubmitted] = useState(false);
   const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

   const handleSelect = (index: number, option: string) => {
      if (submitted) return;
      setAnswers(prev => ({ ...prev, [index]: option }));
   };

   const handleReveal = (index: number) => {
      setShowExplanation(prev => ({ ...prev, [index]: true }));
   };

   const handleSubmit = () => {
      setSubmitted(true);
   };

   const handleReset = () => {
      setAnswers({});
      setSubmitted(false);
      setShowExplanation({});
   };

   const calculateScore = () => {
      let score = 0;
      quizItems.forEach((item, idx) => {
         // Simple string match, case-insensitive for robustness
         if (answers[idx]?.toLowerCase().trim() === item.correctAnswer.toLowerCase().trim()) score++;
      });
      return score;
   };

   const isCorrectAnswer = (idx: number) => {
      const userAns = answers[idx]?.toLowerCase().trim();
      const correct = quizItems[idx].correctAnswer.toLowerCase().trim();
      return userAns === correct;
   };

   // --- Layout Renderers ---

   // 1. Classic Layout (Polished MCQs)
   const renderClassic = () => (
      <div className="space-y-6">
         {quizItems.map((item, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = submitted && isCorrectAnswer(idx);

            return (
               <div key={idx} className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-md p-6 md:p-8 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                     <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Question {idx + 1}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                     {item.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                     {item.options?.map((option, optIdx) => {
                        const isSelected = userAnswer === option;
                        let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ";

                        if (submitted) {
                           if (option === item.correctAnswer) {
                              btnClass += "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-bold";
                           } else if (isSelected) {
                              btnClass += "bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400";
                           } else {
                              btnClass += "opacity-30 border-black/5 dark:border-white/5 grayscale";
                           }
                        } else {
                           if (isSelected) {
                              btnClass += "bg-indigo-600 border-indigo-600 text-white shadow-lg transform -translate-y-0.5";
                           } else {
                              btnClass += "bg-white/50 dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-indigo-500/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/[0.05]";
                           }
                        }

                        return (
                           <button key={optIdx} className={btnClass} onClick={() => handleSelect(idx, option)} disabled={submitted}>
                              <span className="text-sm md:text-base">{option}</span>
                              {submitted && option === item.correctAnswer && <CheckIcon />}
                              {submitted && isSelected && option !== item.correctAnswer && <XIcon />}
                           </button>
                        );
                     })}
                  </div>

                  {submitted && (
                     <div className="mt-6 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        <p className="font-black text-[10px] uppercase tracking-widest mb-1 text-gray-400">Analysis</p>
                        {item.explanation}
                     </div>
                  )}
               </div>
            );
         })}
      </div>
   );

   // 2. Speed Round (True/False - Rapid Fire)
   const renderSpeed = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {quizItems.map((item, idx) => {
            const userAnswer = answers[idx];

            return (
               <div key={idx} className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-md rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 flex flex-col items-center">
                  <div className="p-6 text-center flex-1 flex flex-col justify-center min-h-[140px]">
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Fast Fact {idx + 1}</span>
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight px-4">{item.question}</h3>
                  </div>

                  <div className="flex w-full h-16 border-t border-black/5 dark:border-white/5">
                     {['True', 'False'].map((opt) => {
                        const isSelected = userAnswer === opt;
                        const isRealAnswer = item.correctAnswer.toLowerCase() === opt.toLowerCase();

                        let bgClass = "flex-1 font-black text-xs uppercase tracking-[0.2em] transition-all ";
                        if (submitted) {
                           if (isRealAnswer) bgClass += "bg-emerald-500/80 text-white";
                           else if (isSelected && !isRealAnswer) bgClass += "bg-red-500/80 text-white";
                           else bgClass += "bg-black/5 dark:bg-white/5 text-gray-400 grayscale opacity-40";
                        } else {
                           if (isSelected) bgClass += "bg-indigo-600 text-white shadow-inner";
                           else bgClass += "hover:bg-indigo-500/10 text-gray-500 dark:text-gray-400";
                        }

                        return (
                           <button key={opt} onClick={() => handleSelect(idx, opt)} disabled={submitted} className={bgClass}>
                              {opt}
                           </button>
                        );
                     })}
                  </div>
               </div>
            );
         })}
      </div>
   );

   // 3. Scenario Insight (Story-based or Short Answer)
   const renderScenario = () => (
      <div className="space-y-12">
         {quizItems.map((item, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = submitted && isCorrectAnswer(idx);
            const isShortAnswer = item.type === 'short-answer' || !item.options?.length;

            return (
               <div key={idx} className="bg-white/40 dark:bg-white/[0.03] border-l-4 border-indigo-500 p-8 rounded-r-2xl shadow-sm">
                  <div className="flex flex-col md:flex-row gap-8">
                     <div className="flex-1">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-2">Scenario {idx + 1}</span>
                        <p className="text-xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed italic">
                           "{item.question}"
                        </p>
                        {item.meta?.skill && (
                           <div className="mt-4 px-3 py-1 bg-indigo-500/10 rounded-full inline-block">
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.meta.skill}</span>
                           </div>
                        )}
                     </div>

                     <div className="w-full md:w-[40%] space-y-3">
                        {isShortAnswer ? (
                           <div className="bg-black/5 dark:bg-white/5 rounded-xl p-6 text-center">
                              {!submitted ? (
                                 <button onClick={() => handleSelect(idx, "revealed")} className="text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                                    Tap to reveal insight
                                 </button>
                              ) : (
                                 <div className="animate-in fade-in">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">The Insight</span>
                                    <div className="text-indigo-600 dark:text-indigo-300 font-bold">{item.correctAnswer}</div>
                                 </div>
                              )}
                           </div>
                        ) : (
                           item.options?.map((option, optIdx) => {
                              let btnClass = "w-full text-left p-4 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ";
                              if (submitted) {
                                 if (option === item.correctAnswer) btnClass += "bg-emerald-500 border-emerald-500 text-white";
                                 else if (option === userAnswer) btnClass += "bg-red-500/20 border-red-500/50 text-red-500 scale-95 opacity-50";
                                 else btnClass += "opacity-20 border-black/5 dark:border-white/5";
                              } else {
                                 if (userAnswer === option) btnClass += "bg-black text-white dark:bg-white dark:text-black shadow-xl -translate-y-1";
                                 else btnClass += "bg-white/50 dark:bg-white/[0.05] border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 text-gray-600 dark:text-gray-300";
                              }
                              return (
                                 <button key={optIdx} onClick={() => handleSelect(idx, option)} disabled={submitted} className={btnClass}>
                                    {option}
                                 </button>
                              );
                           })
                        )}
                     </div>
                  </div>

                  {submitted && (
                     <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 text-sm text-gray-500 dark:text-gray-400">
                        <p className="font-black text-[10px] uppercase tracking-[0.2em] mb-2">Deep Analysis</p>
                        {item.explanation}
                     </div>
                  )}
               </div>
            );
         })}
      </div>
   );


   // --- Main Render ---

   return (
      <div className="max-w-5xl mx-auto py-8 px-4 fade-in">

         {/* Header */}
         <div className="flex justify-between items-end mb-12 border-b border-black/5 dark:border-white/5 pb-8">
            <div>
               <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                  {layout === 'speed' ? 'Speed Round' : layout === 'scenario' ? 'Insight Analysis' : 'Mastery Check'}
               </h2>
               <p className="text-gray-500 dark:text-gray-400 mt-3 font-medium text-lg">
                  {submitted ? 'Your performance metrics are ready.' : `Challenge yourself with ${quizItems.length} curated questions.`}
               </p>
            </div>

            {submitted && (
               <div className="flex flex-col items-end">
                  <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                     {Math.round((calculateScore() / quizItems.length) * 100)}<span className="text-2xl">%</span>
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Consistency</div>
               </div>
            )}
         </div>

         {/* Dynamic Content based on Layout */}
         <div className="mb-24">
            {layout === 'classic' && renderClassic()}
            {layout === 'speed' && renderSpeed()}
            {layout === 'scenario' && renderScenario()}
         </div>

         {/* Footer Controls */}
         <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border-t border-black/5 dark:border-white/5 flex justify-center z-40 md:sticky md:bottom-8 md:bg-transparent md:border-0 md:p-0">
            <div className="w-full max-w-sm">
               {!submitted ? (
                  <button
                     onClick={handleSubmit}
                     disabled={Object.keys(answers).length === 0}
                     className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                     Submit Results
                  </button>
               ) : (
                  <button
                     onClick={handleReset}
                     className="w-full py-5 bg-white/10 backdrop-blur-md border border-white/20 text-gray-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/20 transition-all active:scale-95 shadow-xl"
                  >
                     Retry Journey
                  </button>
               )}
            </div>
         </div>

         <div className="h-20 md:hidden"></div>
      </div>
   );
};

export default QuizViewer;