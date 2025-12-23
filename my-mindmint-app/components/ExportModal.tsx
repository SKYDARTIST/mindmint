import React, { useState } from 'react';
import { AppMode, Flashcard, QuizItem } from '../types';
import MermaidRenderer from './MermaidRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AppMode;
  content: any;
  isPro: boolean;
}

const Icons = {
  PDF: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Image: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

interface PreviewContainerProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
}

const PreviewContainer: React.FC<PreviewContainerProps> = ({ children, theme }) => {
  const scaleClass = "origin-top transform scale-[0.6] w-[140%] h-[140%]";
  return (
    <div className={`w-full h-full overflow-hidden ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className={scaleClass}>
        {children}
      </div>
    </div>
  );
};

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, mode, content, isPro }) => {
  const [format, setFormat] = useState<'pdf' | 'png'>('pdf');
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [margin, setMargin] = useState<'normal' | 'narrow'>('normal');
  const [exportTheme, setExportTheme] = useState<'light' | 'dark'>('light');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    if (!isPro) return;
    setIsExporting(true);
    // Simulate export delay
    setTimeout(() => {
      setIsExporting(false);
      onClose();
    }, 1500);
  };

  // -- Preview Renderers --
  const renderPreviewContent = () => {
    if (mode === "mindmap") {
      return (
        <PreviewContainer theme={exportTheme}>
           <div className="p-8">
             <h1 className="text-2xl font-bold mb-4">Mindmap Export</h1>
             <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 h-[600px]">
               <MermaidRenderer chart={content} theme={exportTheme} />
             </div>
           </div>
        </PreviewContainer>
      );
    }

    if (mode === "summary") {
      return (
        <PreviewContainer theme={exportTheme}>
          <div className="p-12 prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap font-sans text-sm">{content}</div>
          </div>
        </PreviewContainer>
      );
    }

    if (mode === "flashcards") {
      const cards = content as Flashcard[];
      return (
        <PreviewContainer theme={exportTheme}>
          <div className="p-12 grid grid-cols-2 gap-4">
            {cards.slice(0, 6).map((c, i) => (
              <div key={i} className={`p-4 rounded-lg border text-xs ${exportTheme === 'dark' ? 'bg-[#27272A] border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="font-bold mb-2 opacity-70">Q: {c.question}</div>
                <div className="opacity-90">A: {c.answer}</div>
              </div>
            ))}
          </div>
        </PreviewContainer>
      );
    }
    
    // Fallback
    return (
       <PreviewContainer theme={exportTheme}>
          <div className="p-12 text-center text-gray-400 mt-20">
            Preview unavailable for this format.
          </div>
       </PreviewContainer>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in-fade">
      <div 
        className="bg-white dark:bg-[#18181B] w-full max-w-5xl h-[85vh] max-h-[700px] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in-zoom border border-gray-200 dark:border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        
        {/* LEFT PANEL: Controls */}
        <div className="w-full md:w-[320px] flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#18181B] z-10">
          
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Preview</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <Icons.Close />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Format Selection */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setFormat('pdf')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    format === 'pdf' 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300' 
                      : 'bg-white dark:bg-[#202023] border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icons.PDF />
                  <span className="text-xs font-semibold mt-2">PDF Document</span>
                </button>
                <button 
                   onClick={() => setFormat('png')}
                   className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    format === 'png' 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300' 
                      : 'bg-white dark:bg-[#202023] border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icons.Image />
                  <span className="text-xs font-semibold mt-2">PNG Image</span>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className={`space-y-6 transition-opacity ${format === 'png' ? 'opacity-50 pointer-events-none' : ''}`}>
              
              {/* Page Size */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Page Size</label>
                <div className="flex bg-gray-100 dark:bg-[#202023] p-1 rounded-lg">
                  {['a4', 'letter'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setPageSize(size as any)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                        pageSize === size 
                          ? 'bg-white dark:bg-[#27272A] text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Margins</label>
                <div className="flex bg-gray-100 dark:bg-[#202023] p-1 rounded-lg">
                  {['normal', 'narrow'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMargin(m as any)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                        margin === m 
                          ? 'bg-white dark:bg-[#27272A] text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

            </div>

             {/* Theme Toggle */}
             <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Export Theme</label>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => setExportTheme('light')}
                     className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${exportTheme === 'light' ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 ring-offset-2 dark:ring-offset-black' : 'border-gray-200 dark:border-gray-700'}`}
                     style={{ background: '#ffffff' }}
                   >
                     {exportTheme === 'light' && <span className="text-indigo-500"><Icons.Check /></span>}
                   </button>
                   <button 
                     onClick={() => setExportTheme('dark')}
                     className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${exportTheme === 'dark' ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 ring-offset-2 dark:ring-offset-black' : 'border-gray-200 dark:border-gray-700'}`}
                     style={{ background: '#1f1f23' }}
                   >
                     {exportTheme === 'dark' && <span className="text-indigo-400"><Icons.Check /></span>}
                   </button>
                   <span className="text-sm text-gray-500 ml-2">{exportTheme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
              </div>
          </div>

          {/* Footer Action */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800">
            {isPro ? (
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <span>Download {format.toUpperCase()}</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-[#202023] text-gray-400 dark:text-gray-500 font-semibold cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Icons.Lock />
                <span>Upgrade to Export</span>
              </button>
            )}
             {!isPro && (
               <p className="text-center text-xs text-gray-400 mt-3">
                 Exporting is available on the <span className="text-indigo-500 font-medium cursor-pointer hover:underline">Pro plan</span>.
               </p>
             )}
          </div>
        </div>

        {/* RIGHT PANEL: Preview */}
        <div className="flex-1 bg-gray-50 dark:bg-[#09090b] relative overflow-hidden flex flex-col items-center justify-center p-8">
          
          {/* Background Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none"
            style={{ 
              backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px' 
            }}
          />

          {/* Paper Mockup */}
          <div 
            className={`relative transition-all duration-500 ease-spring shadow-2xl ${
              pageSize === 'a4' ? 'aspect-[210/297]' : 'aspect-[8.5/11]'
            } ${exportTheme === 'dark' ? 'bg-[#1C1C1F]' : 'bg-white'}`}
            style={{ 
              height: '100%', 
              maxHeight: '100%',
              width: 'auto',
              boxShadow: '0 20px 50px -12px rgba(0,0,0,0.25)' 
            }}
          >
             {/* Content Rendering */}
             <div className={`absolute inset-0 ${margin === 'normal' ? 'p-8' : 'p-4'}`}>
                {renderPreviewContent()}
             </div>

             {/* Watermark for Free users */}
             {!isPro && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                     <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Preview Mode</span>
                  </div>
               </div>
             )}
          </div>

          {/* Zoom controls (Visual only) */}
          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white dark:bg-[#18181B] p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm opacity-50 hover:opacity-100 transition-opacity">
             <div className="px-2 text-xs font-mono text-gray-500">60%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;