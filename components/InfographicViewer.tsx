"use client";

import React from "react";
import type { InfographicContent } from "@/types";

interface Props {
  data: InfographicContent;
}

export default function InfographicViewer({ data }: Props) {
  const layout = data.layout || "step_by_step";

  // 1. CHRONICLE (Vertical Roadmap)
  const renderChronicle = () => (
    <div className="max-w-4xl mx-auto space-y-16 py-12 relative">
      <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500/0 via-purple-500/50 to-pink-500/0 hidden md:block" />
      {data.steps.map((step, i) => (
        <div key={i} className={`flex flex-col md:flex-row items-center gap-10 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
          <div className="md:w-1/2 w-full flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white dark:bg-[#1C1C1F] p-8 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20">0{i + 1}</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-none">{step.title}</h3>
                </div>
                {step.description && <p className="text-gray-500 dark:text-gray-400 text-sm leading-7 font-medium">{step.description}</p>}
              </div>
            </div>
          </div>
          <div className="shrink-0 w-[60px] h-[60px] bg-white dark:bg-[#09090b] rounded-full border-4 border-indigo-500 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-8 ring-indigo-500/10">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
          </div>
          <div className="md:w-1/2 hidden md:block" />
        </div>
      ))}
    </div>
  );

  // 2. MOMENTUM (Flow Graph Nodes)
  const renderMomentum = () => (
    <div className="py-20 flex flex-wrap justify-center items-center gap-x-12 gap-y-16 max-w-7xl mx-auto px-4">
      {data.steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="relative group w-full md:w-[300px]">
            <div className="absolute -top-10 left-0 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/60">Stage // 0{i + 1}</div>
            <div className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-[#1C1C1F] dark:to-[#161619] p-8 rounded-[40px] border border-gray-100 dark:border-white/10 shadow-xl dark:shadow-none hover:-translate-y-2 transition-transform duration-500">
              <div className="w-12 h-12 bg-white dark:bg-[#09090b] rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center mb-6 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-4 tracking-tighter">{step.title}</h3>
              {step.description && <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold leading-relaxed tracking-wide opacity-70 italic">{step.description}</p>}
            </div>
          </div>
          {i < data.steps.length - 1 && (
            <div className="hidden lg:flex items-center text-indigo-500/20">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // 3. SPECTRUM (High-End Mesh Comparison)
  const renderSpectrum = () => (
    <div className="max-w-5xl mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.steps.map((step, i) => (
          <div key={i} className="relative group overflow-hidden rounded-[2.5rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-[#111113] p-10 min-h-[300px] flex flex-col justify-end">
            <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-purple-500'}`} />
            <div className="relative z-10 space-y-6">
              <div className={`w-8 h-1 rounded-full ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-purple-500'}`} />
              <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{step.title}</h3>
              {step.description && <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-tight opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">{step.description}</p>}
            </div>
            <div className="absolute top-8 right-8 text-4xl font-black text-gray-100 dark:text-white/5 italic">#{i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 animate-in fade-in zoom-in-95 duration-700">
      {/* Dynamic Background Element */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <div className="text-center space-y-6 mb-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{layout.replace('_', ' ')}</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.9]">
          {data.title.split(' ').map((word, i) => (
            <span key={i} className={i % 2 === 0 ? '' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}>{word} </span>
          ))}
        </h1>
        <p className="max-w-xl mx-auto text-xl text-gray-400 dark:text-gray-500 font-medium leading-relaxed uppercase tracking-tighter">{data.tagline}</p>
      </div>

      {/* Main Layout Area */}
      <div className="relative">
        {layout === "step_by_step" && renderChronicle()}
        {layout === "process_flow" && renderMomentum()}
        {layout === "comparison" && renderSpectrum()}
      </div>
    </div>
  );
}
