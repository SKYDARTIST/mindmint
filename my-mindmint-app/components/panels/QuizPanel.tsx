"use client";

import React from "react";

// Icons (matching the original Vite app)
const Icons = {
  Sparkles: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>,
};

interface QuizPanelProps {
  input: string;
  setInput: (input: string) => void;
}

export default function QuizPanel({ input, setInput }: QuizPanelProps) {
  return (
    <section className="input-column">
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span className="capitalize">Quiz</span>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <textarea
            className="input-textarea animate-in-fade opacity-60 cursor-not-allowed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Quiz generation coming soon..."
            spellCheck={false}
            disabled
          />
        </div>

        <div className="action-bar animate-in-fade">
          <button
            className="btn-primary opacity-60 cursor-not-allowed"
            disabled
          >
            <Icons.Sparkles />
            <span>Generate Quiz</span>
          </button>
          <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-3 font-medium tracking-wide opacity-80">
            Quiz generation coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}