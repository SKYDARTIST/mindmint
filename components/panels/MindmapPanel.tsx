"use client";

import React from "react";

// Icons (matching the original Vite app)
const Icons = {
  FileText: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  Video: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
  Quiz: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Template: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>,
  Structure: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>,
  ChevronDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Sparkles: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" /></svg>,
};

const STARTER_TEMPLATES = [
  {
    id: 'study',
    title: 'Study Notes',
    desc: 'Turn class notes or textbook content into clear, structured understanding.',
    placeholder: 'Paste your study notes or textbook paragraphs here. Focus on key concepts you want to remember.',
    icon: Icons.FileText
  },
  {
    id: 'exam',
    title: 'Exam Revision',
    desc: 'Generate mindmaps, flashcards, and quizzes for fast revision.',
    placeholder: 'Paste exam syllabus topics, notes, or revision material.',
    icon: Icons.Quiz
  },
  {
    id: 'concept',
    title: 'Concept Explainer',
    desc: 'Understand any topic with clear, step-by-step explanations.',
    placeholder: 'Paste the concept or complex topic you want explained simply here.',
    icon: Icons.Sparkles
  }
];

interface MindmapPanelProps {
  input: string;
  setInput: (input: string) => void;
  layout: string;
  setLayout: (layout: string) => void;
  showLayoutMenu: boolean;
  setShowLayoutMenu: (show: boolean) => void;
}

export default function MindmapPanel({
  input,
  setInput
}: MindmapPanelProps) {
  const showStarterTemplates = !input;

  const handleTemplateSelect = () => {
    // Coming soon - no functionality
  };

  return (
    <section className="input-column">
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span className="capitalize">Mindmap</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-colors">
              <Icons.Template />
              <span className="hidden sm:inline">Templates</span>
            </button>
          </div>
        </div>

        {showStarterTemplates ? (
          // --- Empty State: Starter Templates ---
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Start with a template</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose a starter to auto-focus your content.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STARTER_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateSelect()}
                  className="group flex flex-col items-start p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#202023] hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all text-left opacity-60 cursor-not-allowed"
                >
                  <div className="mb-3 p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    <tpl.icon />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{tpl.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // --- Active State: Text Input ---
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <textarea
              className="input-textarea animate-in-fade opacity-60 cursor-not-allowed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mindmap generation coming soon..."
              spellCheck={false}
              disabled
            />
          </div>
        )}

        {/* Generate Button - Disabled for Mindmap */}
        <div className="action-bar animate-in-fade">
          <button
            className="btn-primary opacity-60 cursor-not-allowed"
            disabled
          >
            <Icons.Sparkles />
            <span>Generate Mindmap</span>
          </button>
          <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-3 font-medium tracking-wide opacity-80">
            Mindmap generation coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}