import React from 'react';
import { AppMode } from '../types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AppMode;
  onSelect: (text: string) => void;
}

const TEMPLATES: Record<AppMode, { title: string; content: string; icon?: React.ReactNode }[]> = {
  [AppMode.MINDMAP]: [
    { 
      title: "Study Topic Breakdown", 
      content: "Create a detailed mindmap breaking down [Topic] into core concepts, sub-concepts, and key examples for a study guide." 
    },
    { 
      title: "Startup Idea Map", 
      content: "Map out a startup business model for [Idea]. Include Value Proposition, Customer Segments, Revenue Streams, and Key Resources." 
    },
    { 
      title: "Marketing Strategy", 
      content: "Create a marketing strategy mindmap for [Product/Service]. Include Channels (Social, SEO, Email), Content Types, Metrics, and Goals." 
    },
    { 
      title: "Research Paper Outline", 
      content: "Generate a structured outline for a research paper on [Subject]. Include Introduction, Literature Review, Methodology, Results, and Discussion." 
    },
    { 
      title: "Book Concept Map", 
      content: "Map out the characters, core themes, and plot progression for a book about [Premise]." 
    }
  ],
  [AppMode.FLASHCARDS]: [
    { 
      title: "Biology Chapter", 
      content: "Create a set of flashcards for a Biology chapter on [Topic]. Focus on definitions, cellular processes, and functions." 
    },
    { 
      title: "Vocabulary Builder", 
      content: "Generate vocabulary flashcards for [Language/Topic]. Include the word/term on the front and definition/translation on the back." 
    },
    { 
      title: "Programming Concepts", 
      content: "Create flashcards for learning [Language/Framework]. Focus on syntax, design patterns, and common interview questions." 
    },
    { 
      title: "History Timeline", 
      content: "Create timeline flashcards for [Historical Event/Period]. Front: Date/Event Name, Back: Significance and Details." 
    },
    { 
      title: "Book Chapter Revision", 
      content: "Create revision cards for Chapter [Number] of [Book]. Focus on key takeaways, quotes, and summary points." 
    }
  ],
  [AppMode.QUIZ]: [
    { 
      title: "Multiple Choice Practice", 
      content: "Create a multiple-choice quiz about [Topic] with 4 options per question. Provide clear explanations for the correct answer." 
    },
    { 
      title: "True/False Revision", 
      content: "Generate a True/False quiz to test knowledge on [Topic]. Include tricky edge cases to really test understanding." 
    },
    { 
      title: "Concept Mastery", 
      content: "Create deep conceptual questions about [Topic] to test understanding of the underlying principles, not just memorization." 
    },
    { 
      title: "Exam Prep Style", 
      content: "Create exam-style questions for [Subject/Certification]. Mimic the format and difficulty of the real exam." 
    },
    { 
      title: "Quick 5-Question Drill", 
      content: "Generate a quick 5-question drill on [Topic] to assess current knowledge level. Keep questions short and punchy." 
    }
  ],
  [AppMode.SUMMARY]: [
    { 
      title: "TL;DR Summary", 
      content: "Provide a 'Too Long; Didn't Read' summary of the following text. Keep it under 50 words and focus on the main conclusion." 
    },
    { 
      title: "Executive Summary", 
      content: "Write a formal executive summary of the text, highlighting business impact, key risks, and strategic recommendations." 
    },
    { 
      title: "Academic Summary", 
      content: "Summarize the following academic text, preserving technical accuracy, citing key arguments, and outlining the methodology." 
    },
    { 
      title: "Bullet-Point List", 
      content: "Convert the text into a clean, hierarchical bullet-point list for easy reading. Group related points together." 
    },
    { 
      title: "Social Media Thread", 
      content: "Summarize the text into a thread of 3-5 engaging posts suitable for social media. Use emojis and punchy sentences." 
    }
  ],
  [AppMode.INFOGRAPHIC]: [
    { 
      title: "Key Takeaways", 
      content: "Create an infographic structure highlighting the top 5 key takeaways from the text. Suggest icons for each takeaway." 
    },
    { 
      title: "Step-by-Step Process", 
      content: "Visualize the text as a step-by-step process flow. Number the steps clearly and describe the action for each." 
    },
    { 
      title: "Comparison Chart", 
      content: "Create a comparison infographic (Pros vs Cons or Option A vs Option B) based on the text. Use a split layout." 
    },
    { 
      title: "Do's & Don'ts", 
      content: "Extract 'Dos and Don'ts' from the text and structure them as a visual list with green checks and red crosses." 
    },
    { 
      title: "Concept Breakdown", 
      content: "Break down the complex concept in the text into visual components (Core, Layers, Outcomes) for a diagram." 
    }
  ]
};

const TemplateIcon = () => (
  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose, mode, onSelect }) => {
  if (!isOpen) return null;

  const currentTemplates = TEMPLATES[mode] || [];

  return (
    <div className="pricing-overlay animate-in-fade" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1C1C1F] w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 relative animate-in-zoom flex flex-col max-h-[85vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="capitalize">{mode}</span> Templates
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select a template to auto-fill your content.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-1">
          {currentTemplates.map((template, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(template.content)}
              className="group flex flex-col items-start p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#202023] hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2 w-full">
                <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                  <TemplateIcon />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {template.title}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {template.content}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;