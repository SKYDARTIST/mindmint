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

  // 1. Classic Layout (Linear, standard styling)
  const renderClassic = () => (
    <div className="space-y-8">
      {quizItems.map((item, idx) => {
        const userAnswer = answers[idx];
        const isCorrect = submitted && isCorrectAnswer(idx);
        
        return (
          <div key={idx} className="bg-white dark:bg-[#18181B] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex gap-3">
              <span className="text-gray-400 dark:text-gray-500 font-mono text-sm mt-1">{String(idx + 1).padStart(2, '0')}</span>
              {item.question}
            </h3>
            
            <div className="space-y-2">
               {/* Handle standard options if present, or text input if fill-gap/short-answer */}
               {item.options && item.options.length > 0 ? (
                 item.options.map((option, optIdx) => {
                   let btnClass = "w-full text-left p-3 rounded-lg border transition-all text-sm md:text-base flex items-center justify-between group ";
                   if (submitted) {
                     if (option === item.correctAnswer) {
                         btnClass += "bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 font-medium";
                     } else if (option === userAnswer && option !== item.correctAnswer) {
                         btnClass += "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300";
                     } else {
                         btnClass += "opacity-50 grayscale";
                     }
                   } else {
                     if (userAnswer === option) {
                         btnClass += "bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-200";
                     } else {
                         btnClass += "bg-white border-gray-200 hover:bg-gray-50 text-gray-700 dark:bg-[#202023] dark:border-gray-700 dark:hover:bg-[#27272a] dark:text-gray-300";
                     }
                   }

                   return (
                     <button key={optIdx} className={btnClass} onClick={() => handleSelect(idx, option)} disabled={submitted}>
                       <span>{option}</span>
                       {submitted && option === item.correctAnswer && <CheckIcon />}
                       {submitted && option === userAnswer && option !== item.correctAnswer && <XIcon />}
                     </button>
                   );
                 })
               ) : (
                  // Fallback for short answer/fill gap in classic mode
                  <div className="mt-4">
                     {!submitted ? (
                       <button onClick={() => handleSelect(idx, "revealed")} className="text-sm text-indigo-600 font-medium underline">Reveal Answer</button>
                     ) : (
                       <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">Correct Answer: {item.correctAnswer}</div>
                     )}
                  </div>
               )}
            </div>

            {submitted && (
              <div className={`mt-4 p-4 rounded-lg text-sm border-l-4 ${isCorrect ? 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20' : 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20'}`}>
                <p className="font-bold mb-1 text-xs uppercase tracking-wider">{isCorrect ? 'Correct' : 'Explanation'}</p>
                <p>{item.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // 2. MCQ-Heavy (Grid Layout, emphasized options)
  const renderMCQHeavy = () => (
    <div className="space-y-12">
      {quizItems.map((item, idx) => {
        const userAnswer = answers[idx];
        
        return (
          <div key={idx} className="bg-white dark:bg-[#1C1C1F] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
               <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 block">Question {idx + 1}</span>
               <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{item.question}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.options?.map((option, optIdx) => {
                 const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                 let btnClass = "relative p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ";
                 
                 if (submitted) {
                    if (option === item.correctAnswer) {
                        btnClass += "bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300";
                    } else if (option === userAnswer) {
                        btnClass += "bg-red-50 border-red-500 text-red-900 dark:bg-red-900/20 dark:text-red-300";
                    } else {
                        btnClass += "border-gray-100 text-gray-400 dark:border-gray-800 dark:text-gray-600 opacity-50";
                    }
                 } else {
                    if (userAnswer === option) {
                        btnClass += "bg-indigo-50 border-indigo-600 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-200 shadow-md transform scale-[1.02]";
                    } else {
                        btnClass += "bg-gray-50 border-transparent hover:bg-white hover:border-gray-300 text-gray-700 dark:bg-[#252529] dark:hover:bg-[#2A2A2E] dark:text-gray-300";
                    }
                 }

                 return (
                   <button key={optIdx} onClick={() => handleSelect(idx, option)} disabled={submitted} className={btnClass}>
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${userAnswer === option || (submitted && option === item.correctAnswer) ? 'bg-current text-white dark:text-black opacity-100' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                        {letter}
                      </span>
                      <span className="font-medium">{option}</span>
                   </button>
                 )
              })}
            </div>
            
            {submitted && (
               <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-4">
                  {item.explanation}
               </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // 3. True/False Speed (Giant buttons, minimalist)
  const renderTFSpeed = () => (
    <div className="grid grid-cols-1 gap-6">
      {quizItems.map((item, idx) => {
        const userAnswer = answers[idx];
        
        return (
          <div key={idx} className="bg-white dark:bg-[#1C1C1F] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
             <div className="p-8 text-center bg-gray-50 dark:bg-[#202023] border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">{item.question}</h3>
             </div>
             
             <div className="flex h-24 md:h-32">
                {['True', 'False'].map((opt) => {
                   const isSelected = userAnswer === opt;
                   const isRealAnswer = item.correctAnswer.toLowerCase().includes(opt.toLowerCase());
                   
                   let bgClass = "";
                   if (submitted) {
                      if (isRealAnswer) bgClass = "bg-emerald-500 text-white";
                      else if (isSelected && !isRealAnswer) bgClass = "bg-red-500 text-white opacity-50";
                      else bgClass = "bg-gray-100 dark:bg-[#252529] text-gray-300 dark:text-gray-600";
                   } else {
                      if (isSelected) bgClass = "bg-indigo-600 text-white";
                      else bgClass = opt === 'True' ? "bg-white dark:bg-[#1C1C1F] hover:bg-green-50 dark:hover:bg-green-900/10 text-gray-900 dark:text-white" : "bg-white dark:bg-[#1C1C1F] hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-900 dark:text-white";
                   }

                   return (
                     <button 
                        key={opt}
                        onClick={() => handleSelect(idx, opt)} 
                        disabled={submitted}
                        className={`flex-1 font-bold text-2xl uppercase tracking-widest transition-all ${bgClass} border-r last:border-r-0 border-gray-200 dark:border-gray-800`}
                     >
                        {opt}
                     </button>
                   );
                })}
             </div>
             {submitted && (
                <div className="p-4 bg-gray-50 dark:bg-[#151515] text-center text-sm text-gray-600 dark:text-gray-400">
                   {item.explanation}
                </div>
             )}
          </div>
        );
      })}
    </div>
  );

  // 4. Scenario (Card based, storytelling vibe)
  const renderScenario = () => (
    <div className="space-y-12">
       {quizItems.map((item, idx) => {
          const userAnswer = answers[idx];

          return (
             <div key={idx} className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/2 bg-indigo-50 dark:bg-[#201C2E] p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/50">
                   <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">Scenario {idx + 1}</div>
                   <p className="text-lg md:text-xl font-medium text-indigo-900 dark:text-indigo-100 leading-relaxed italic">
                      "{item.question}"
                   </p>
                   {item.meta?.skill && (
                      <div className="mt-6 inline-block bg-white dark:bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-indigo-500 dark:text-indigo-300">
                         Skill: {item.meta.skill}
                      </div>
                   )}
                </div>

                <div className="w-full md:w-1/2 space-y-3 pt-4">
                   <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">What is the best course of action?</h4>
                   {item.options?.map((option, optIdx) => {
                      let btnClass = "w-full text-left p-4 rounded-xl border transition-all text-sm font-medium ";
                      if (submitted) {
                         if (option === item.correctAnswer) btnClass += "bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20 dark:text-green-300";
                         else if (option === userAnswer) btnClass += "bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:text-red-300";
                         else btnClass += "opacity-50 border-gray-100 dark:border-gray-800";
                      } else {
                         if (userAnswer === option) btnClass += "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black shadow-lg transform -translate-y-1";
                         else btnClass += "bg-white dark:bg-[#1C1C1F] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300";
                      }

                      return (
                         <button key={optIdx} onClick={() => handleSelect(idx, option)} disabled={submitted} className={btnClass}>
                            {option}
                         </button>
                      )
                   })}
                   {submitted && (
                      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                         <strong>Analysis:</strong> {item.explanation}
                      </div>
                   )}
                </div>
             </div>
          )
       })}
    </div>
  );

  // 5. Mixed (Adaptive based on type, refined for premium dark mode visibility)
  const renderMixed = () => (
    <div className="space-y-10">
       {quizItems.map((item, idx) => {
          const isTF = item.type === 'true-false';
          const isGap = item.type === 'fill-gap' || item.type === 'short-answer';
          const userAnswer = answers[idx];
          const isCorrect = submitted && isCorrectAnswer(idx);

          return (
             <div key={idx} className="bg-white dark:bg-[#1C1C1F] border-b border-gray-100 dark:border-gray-800 pb-10 last:border-0 last:pb-0">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-1 rounded uppercase tracking-wider">
                      {item.type?.replace('-', ' ') || 'Question'}
                   </span>
                   {submitted && (
                      <span className={`text-xs font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                         {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                   )}
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
                  {item.question}
                </h3>

                {isTF ? (
                   <div className="flex gap-4">
                      {['True', 'False'].map(opt => {
                         const isSelected = userAnswer === opt;
                         let btnClass = "flex-1 py-4 rounded-xl font-bold border-2 transition-all duration-200 text-sm md:text-base tracking-wide ";
                         
                         if (submitted) {
                            if (opt === item.correctAnswer) {
                               btnClass += "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-300";
                            } else if (isSelected) {
                               btnClass += "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 opacity-60";
                            } else {
                               btnClass += "border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-700 opacity-40";
                            }
                         } else {
                            if (isSelected) {
                               btnClass += "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300";
                            } else {
                               btnClass += "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5";
                            }
                         }

                         return (
                           <button
                             key={opt}
                             onClick={() => handleSelect(idx, opt)}
                             disabled={submitted}
                             className={btnClass}
                           >
                              {opt}
                           </button>
                         );
                      })}
                   </div>
                ) : isGap ? (
                   <div className="bg-gray-50 dark:bg-[#252529] border border-gray-100 dark:border-gray-800 p-6 rounded-xl text-center">
                      {!submitted ? (
                         <button 
                           onClick={() => handleSelect(idx, "revealed")} 
                           className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-sm"
                         >
                           Click to Reveal Answer
                         </button>
                      ) : (
                         <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Answer</span>
                            <div className="text-lg font-mono font-medium text-gray-900 dark:text-white bg-white dark:bg-black/20 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                               {item.correctAnswer}
                            </div>
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="grid grid-cols-1 gap-2.5">
                      {item.options?.map((option, optIdx) => {
                         const isSelected = userAnswer === option;
                         let btnClass = "w-full p-4 rounded-xl text-left text-sm font-medium border transition-all duration-200 flex items-center justify-between group ";
                         
                         if (submitted) {
                            if (option === item.correctAnswer) {
                               btnClass += "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300";
                            } else if (isSelected) {
                               btnClass += "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300";
                            } else {
                               btnClass += "bg-transparent border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600 opacity-50";
                            }
                         } else {
                            if (isSelected) {
                               btnClass += "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none";
                            } else {
                               // Explicit text colors for dark/light modes to ensure visibility
                               btnClass += "bg-white dark:bg-[#252529] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2E2E33] hover:border-gray-300 dark:hover:border-gray-600";
                            }
                         }

                         return (
                           <button 
                             key={optIdx} 
                             onClick={() => handleSelect(idx, option)}
                             disabled={submitted}
                             className={btnClass}
                           >
                              <span>{option}</span>
                              {!submitted && isSelected && (
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                              )}
                           </button>
                         )
                      })}
                   </div>
                )}
                
                {submitted && (
                   <div className="mt-6 p-4 bg-gray-50 dark:bg-[#202023] border border-gray-100 dark:border-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      <span className="font-bold text-gray-900 dark:text-gray-200 block mb-1">Explanation</span>
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
    <div className="max-w-4xl mx-auto py-8 px-4 fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-12 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
           <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
             {layout === 'mcq-heavy' ? 'Multiple Choice Exam' : layout === 'tf-speed' ? 'Speed Round' : layout === 'scenario' ? 'Applied Scenarios' : 'Knowledge Check'}
           </h2>
           <p className="text-gray-500 dark:text-gray-400 mt-2">
             {submitted ? 'Review your results below.' : `Answer all ${quizItems.length} questions.`}
           </p>
        </div>
        
        {submitted && (
          <div className="text-right">
             <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
               {Math.round((calculateScore() / quizItems.length) * 100)}%
             </div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Score</div>
          </div>
        )}
      </div>

      {/* Dynamic Content based on Layout */}
      <div className="mb-16">
         {layout === 'classic' && renderClassic()}
         {layout === 'mcq-heavy' && renderMCQHeavy()}
         {layout === 'tf-speed' && renderTFSpeed()}
         {layout === 'scenario' && renderScenario()}
         {layout === 'mixed' && renderMixed()}
      </div>

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-[#0F0F11]/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-center z-40 md:static md:bg-transparent md:border-0 md:p-0">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length === 0}
            className="w-full md:w-auto px-10 py-4 bg-[#6E56CF] dark:bg-[#7C66DC] text-white rounded-full font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:transform hover:-translate-y-1 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="w-full md:w-auto px-10 py-4 bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-50 dark:hover:bg-[#252529] transition-all"
          >
            Retake Quiz
          </button>
        )}
      </div>
      
      {/* Spacer for mobile fixed footer */}
      <div className="h-20 md:hidden"></div>

    </div>
  );
};

export default QuizViewer;