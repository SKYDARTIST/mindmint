'use client';

import React from 'react';
import { InfographicContent, InfographicStep } from '../types';

interface InfographicViewerProps {
  data: InfographicContent;
  activeLayout?: string;
}

// --- Icons ---
const Icons = {
  Star: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Bulb: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  Cross: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>,
  Arrow: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Target: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  List: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Dot: () => <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" /></svg>
};

const getIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'star': return <Icons.Star />;
    case 'bulb': return <Icons.Bulb />;
    case 'check': return <Icons.Check />;
    case 'cross': return <Icons.Cross />;
    case 'arrow': return <Icons.Arrow />;
    case 'target': return <Icons.Target />;
    case 'list': return <Icons.List />;
    default: return <Icons.Dot />;
  }
};

const getColorClass = (accent?: string) => {
  switch (accent) {
    case 'blue': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'green': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'red': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
    case 'purple': return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  }
};

// --- Layout Components ---

const ThreeColumnLayout: React.FC<{ steps: InfographicStep[] }> = ({ steps }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {steps.map((step, idx) => (
      <div key={idx} className={`p-6 rounded-2xl border ${getColorClass(step.accent)} flex flex-col items-start h-full transition-transform hover:-translate-y-1 duration-300`}>
         <div className="mb-4 p-3 rounded-xl bg-white dark:bg-black/20 shadow-sm">
            {getIcon(step.icon)}
         </div>
         <h3 className="text-lg font-bold mb-2 leading-tight">{step.title}</h3>
         <p className="text-sm opacity-80 leading-relaxed">{step.description}</p>
      </div>
    ))}
  </div>
);

const TimelineLayout: React.FC<{ steps: InfographicStep[] }> = ({ steps }) => (
  <div className="relative pl-8 md:pl-0 space-y-8">
    {/* Central Line (Desktop) */}
    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 -translate-x-1/2"></div>
    {/* Left Line (Mobile) */}
    <div className="md:hidden absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>

    {steps.map((step, idx) => {
       const isEven = idx % 2 === 0;
       return (
         <div key={idx} className={`relative flex items-center md:justify-between ${isEven ? 'md:flex-row-reverse' : ''}`}>
            
            {/* Content Box */}
            <div className="w-full md:w-[calc(50%-2rem)] bg-white dark:bg-[#1C1C1F] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step {idx + 1}</span>
                  {step.accent && <div className={`w-2 h-2 rounded-full ${step.accent === 'blue' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>}
               </div>
               <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{step.title}</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
            </div>

            {/* Dot on Line */}
            <div className="absolute left-[-1.25rem] md:left-1/2 w-6 h-6 rounded-full bg-white dark:bg-[#1C1C1F] border-4 border-gray-200 dark:border-gray-700 md:-translate-x-1/2 z-10 flex items-center justify-center">
               <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
            </div>

            {/* Spacer for other side (Desktop) */}
            <div className="hidden md:block w-[calc(50%-2rem)]"></div>
         </div>
       );
    })}
  </div>
);

const PillarsLayout: React.FC<{ steps: InfographicStep[] }> = ({ steps }) => (
  <div className="flex flex-col md:flex-row gap-4 md:items-end justify-center">
     {steps.map((step, idx) => (
        <div key={idx} className="w-full md:flex-1 flex flex-col group">
           {/* Pillar Body */}
           <div className={`
                flex-1 p-6 rounded-t-2xl relative flex flex-col justify-end transition-all duration-500
                border-x border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-transparent to-gray-50 dark:to-white/5
                md:h-[${300 + (idx % 2) * 40}px] min-h-[200px]
           `}>
              <div className="absolute top-0 inset-x-0 h-2 bg-indigo-500 rounded-t-full opacity-70"></div>
              
              <div className="mb-auto pt-6 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                 <div className="p-3 rounded-full bg-white dark:bg-[#1C1C1F] shadow-sm border border-gray-100 dark:border-gray-700 text-indigo-500">
                    {getIcon(step.icon)}
                 </div>
              </div>

              <div className="text-center mt-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
              </div>
           </div>
           
           {/* Base */}
           <div className="h-3 bg-gray-300 dark:bg-gray-600 mx-2 rounded-b-sm"></div>
           <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded-lg"></div>
        </div>
     ))}
  </div>
);

const FlowLayout: React.FC<{ steps: InfographicStep[] }> = ({ steps }) => (
  <div className="flex flex-col md:flex-row items-stretch gap-4 overflow-x-auto pb-4">
     {steps.map((step, idx) => (
        <div key={idx} className="flex-1 min-w-[200px] relative group">
           <div className="h-full bg-white dark:bg-[#1C1C1F] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col relative z-10 group-hover:border-indigo-200 dark:group-hover:border-indigo-900 transition-colors">
              <div className="flex justify-between items-start mb-3">
                 <span className="text-3xl font-black text-gray-100 dark:text-gray-800 group-hover:text-indigo-50 dark:group-hover:text-indigo-900/20 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                 </span>
                 <div className="text-gray-300 dark:text-gray-600">
                    <Icons.Arrow />
                 </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{step.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
           </div>
           
           {/* Connector (Desktop) */}
           {idx !== steps.length - 1 && (
             <div className="hidden md:block absolute top-1/2 -right-6 w-8 h-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
           )}
           {/* Connector (Mobile) */}
           {idx !== steps.length - 1 && (
             <div className="md:hidden absolute -bottom-6 left-1/2 w-0.5 h-8 bg-gray-200 dark:bg-gray-700 z-0"></div>
           )}
        </div>
     ))}
  </div>
);

const ComparisonLayout: React.FC<{ steps: InfographicStep[] }> = ({ steps }) => {
   const mid = Math.ceil(steps.length / 2);
   const leftSide = steps.slice(0, mid);
   const rightSide = steps.slice(mid);

   return (
     <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
        
        {/* Left Side (Pros / Option A / Primary) - Indigo Theme */}
        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 border-r border-gray-200 dark:border-gray-800">
           <div className="flex items-center justify-center mb-8">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-widest px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                 Primary / Option A
              </span>
           </div>
           <div className="space-y-6">
              {leftSide.map((step, i) => (
                 <div key={i} className="flex gap-4 items-start">
                    <div className="mt-0.5 flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-full text-indigo-600 dark:text-indigo-400">
                       <Icons.Check />
                    </div>
                    <div>
                       <h4 className="font-bold text-gray-900 dark:text-white text-base">{step.title}</h4>
                       <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-snug">{step.description}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
        
        {/* Right Side (Cons / Option B / Secondary) - Gray Theme */}
        <div className="bg-white dark:bg-[#1C1C1F] p-8">
           <div className="flex items-center justify-center mb-8">
              <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                 Alternative / Option B
              </span>
           </div>
           <div className="space-y-6">
              {rightSide.map((step, i) => (
                 <div key={i} className="flex gap-4 items-start">
                    <div className="mt-0.5 flex-shrink-0 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full text-gray-500 dark:text-gray-400">
                       {/* If it looks like a 'Con', stick to neutral icon, or specific cross if mapped */}
                       <Icons.List /> 
                    </div>
                    <div>
                       <h4 className="font-bold text-gray-900 dark:text-white text-base">{step.title}</h4>
                       <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-snug">{step.description}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
     </div>
   );
};

// --- Main Viewer ---

const InfographicViewer: React.FC<InfographicViewerProps> = ({ data, activeLayout }) => {
  if (!data) return null;

  // Prefer activeLayout prop if passed from parent, fallback to data.layout
  const { title, tagline, steps } = data;
  const layoutToRender = activeLayout || data.layout;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 fade-in">
      <div className="text-center mb-16">
         <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">{title}</h2>
         <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">{tagline}</p>
         <div className="w-24 h-1.5 bg-indigo-600 mx-auto mt-8 rounded-full opacity-20"></div>
      </div>

      <div className="mb-16">
         {layoutToRender === 'three_column' && <ThreeColumnLayout steps={steps} />}
         {layoutToRender === 'timeline' && <TimelineLayout steps={steps} />}
         {layoutToRender === 'pillars' && <PillarsLayout steps={steps} />}
         {layoutToRender === 'flow' && <FlowLayout steps={steps} />}
         {layoutToRender === 'comparison' && <ComparisonLayout steps={steps} />}
         {/* Fallback */}
         {!['three_column', 'timeline', 'pillars', 'flow', 'comparison'].includes(layoutToRender) && (
            <ThreeColumnLayout steps={steps} />
         )}
      </div>
      
      <div className="text-center text-xs text-gray-300 dark:text-gray-600 uppercase tracking-widest font-bold">
         Generated by MindMint AI
      </div>
    </div>
  );
};

export default InfographicViewer;