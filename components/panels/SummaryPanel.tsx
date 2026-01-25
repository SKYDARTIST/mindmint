"use client";

import React, { useRef, useState } from "react";

// Define types locally to avoid import issues
type SummaryLayout = 'concept_overview' | 'bullet' | 'study_notes';

// Icons (matching the original Vite app)
const Icons = {
  Structure: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>,
  Template: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>,
  Sparkles: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" /></svg>,
  ChevronDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Refresh: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
};

const SUMMARY_LAYOUTS: { id: SummaryLayout; label: string }[] = [
  { id: 'concept_overview', label: 'Concept Overview' },
  { id: 'bullet', label: 'Bullet' },
  { id: 'study_notes', label: 'Study Notes' },
];

interface SummaryPanelProps {
  input: string;
  setInput: (input: string) => void;
  layout: string;
  setLayout: (layout: string) => void;
  loading: boolean;
  output: string | null;
  onGenerate: () => void;
  showLayoutMenu?: boolean;
  setShowLayoutMenu?: (show: boolean) => void;
}

export default function SummaryPanel({
  input,
  setInput,
  layout,
  setLayout,
  loading,
  output,
  onGenerate,
  showLayoutMenu,
  setShowLayoutMenu
}: SummaryPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use local state for layout dropdown if props are not provided
  const [isLayoutOpen, setIsLayoutOpen] = useState<boolean>(false);
  const isUsingLocalState = showLayoutMenu === undefined || setShowLayoutMenu === undefined;
  const currentShowLayoutMenu = isUsingLocalState ? isLayoutOpen : showLayoutMenu;
  const currentSetShowLayoutMenu = isUsingLocalState ? setIsLayoutOpen : setShowLayoutMenu;

  const currentLayoutLabel = SUMMARY_LAYOUTS.find(opt => opt.id === layout)?.label || 'Layout';

  return (
    <section className="input-column">
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="capitalize">Summary</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Layout Selector */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); currentSetShowLayoutMenu(!currentShowLayoutMenu); }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 font-medium transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                title="Select Layout"
              >
                <Icons.Structure />
                <span className="hidden sm:inline capitalize">{currentLayoutLabel}</span>
                <Icons.ChevronDown />
              </button>

              {currentShowLayoutMenu && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#202023] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 py-1 animate-in-fade">
                  {SUMMARY_LAYOUTS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setLayout(opt.id); currentSetShowLayoutMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2 ${layout === opt.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${layout === opt.id ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-colors">
              <Icons.Template />
              <span className="hidden sm:inline">Templates</span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <textarea
            ref={textareaRef}
            className="input-textarea animate-in-fade"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your notes here to generate a summary..."
            spellCheck={false}
          />
        </div>

        <div className="action-bar animate-in-fade">
          <button
            className="btn-primary"
            onClick={onGenerate}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Icons.Sparkles />
                <span>{output ? `Regenerate Summary` : `Generate Summary`}</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-3 font-medium tracking-wide opacity-80">
            Best results with concise input. Large content is auto-summarized.
          </p>
        </div>
      </div>
    </section>
  );
}