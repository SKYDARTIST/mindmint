import React, { useState, useEffect } from 'react';
import { AppMode, Flashcard, QuizItem, InfographicContent } from '@/types';
import QuizViewer from './QuizViewer';
import InfographicViewer from './InfographicViewer';
import { generatePDF } from '@/lib/export/pdfExport';
import { generateImage } from '@/lib/export/imageExport';
import MindmapExportTemplate from './export/MindmapExportTemplate';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AppMode;
  content: string | Record<string, unknown> | unknown[];
  isPro: boolean;
  title?: string;
  onUpgradeClick?: () => void;
}

const Icons = {
  PDF: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Image: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Minus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
};

interface PreviewContainerProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
}

const PreviewContainer: React.FC<PreviewContainerProps> = ({ children, theme }) => {
  return (
    <div className={`w-full ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
      {children}
    </div>
  );
};


const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, mode, content, isPro, title, onUpgradeClick }) => {
  const [format, setFormat] = useState<'pdf' | 'png'>('pdf');
  const [exportTheme, setExportTheme] = useState<'light' | 'dark'>('light');
  const [isExporting, setIsExporting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(60);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setZoomLevel(40);
    }
  }, []);

  if (!isOpen) return null;

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(30, prev + delta), 200));
  };

  const handleExport = async () => {
    if (!isPro || isExporting) return;
    setIsExporting(true);

    try {
      if (format === 'pdf') {
        await generatePDF({
          content,
          title: title || `MindMint ${mode}`,
          theme: exportTheme,
          appMode: mode,
          pageSize: 'a4',
          onProgress: (msg) => setStatusMessage(msg)
        });
        setStatusMessage(null);
        onClose();
        return;
      }

      if (format === 'png') {
        await generateImage({
          content,
          title: title || `MindMint ${mode}`,
          theme: exportTheme,
          appMode: mode,
          onProgress: (msg) => setStatusMessage(msg)
        });
        setStatusMessage(null);
        onClose();
        return;
      }
    } catch (err) {
      console.error("Export Error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during export.";
      alert(message);
    } finally {
      setIsExporting(false);
    }
  };

  // -- Preview Renderers --
  const renderPreviewContent = () => {
    if (mode === "mindmap") {
      return (
        <PreviewContainer theme={exportTheme}>
          <div className="relative w-full h-auto bg-gray-50 dark:bg-black/20 flex flex-col items-center">
            <div id="preview-render-root" className="w-full">
              <MindmapExportTemplate content={content as string} title={title || "Untitled Mindmap"} theme={exportTheme} />
            </div>
          </div>
        </PreviewContainer>
      );
    }

    if (mode === "summary") {
      return (
        <PreviewContainer theme={exportTheme}>
          <div className="p-12 prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap font-sans text-sm">{content as string}</div>
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

    if (mode === "quiz") {
      return (
        <PreviewContainer theme={exportTheme}>
          <div className="p-8">
            <QuizViewer quizItems={content as QuizItem[]} />
          </div>
        </PreviewContainer>
      );
    }

    if (mode === "infographic") {
      return (
        <PreviewContainer theme={exportTheme}>
          <div className="p-4 origin-top">
            <InfographicViewer data={content as unknown as InfographicContent} />
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 animate-in-fade">
      <div
        className="bg-white dark:bg-[#18181B] w-full max-w-5xl h-[90vh] md:h-[85vh] max-h-[800px] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in-zoom border border-gray-200 dark:border-gray-800"
        onClick={e => e.stopPropagation()}
      >

        {/* LEFT PANEL: Controls */}
        <div className={`w-full md:w-[320px] flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#18181B] z-10 ${activeTab === 'settings' ? 'flex' : 'hidden md:flex'}`}>

          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Preview</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <Icons.Close />
            </button>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex md:hidden bg-gray-100 dark:bg-[#202023] p-1 rounded-xl mx-6 mt-6">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'settings'
                ? 'bg-white dark:bg-[#27272A] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'preview'
                ? 'bg-white dark:bg-[#27272A] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              Preview
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">

            {/* Format Selection */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat('pdf')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${format === 'pdf'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300'
                    : 'bg-white dark:bg-[#202023] border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <Icons.PDF />
                  <span className="text-xs font-semibold mt-2">PDF Document</span>
                </button>
                <button
                  onClick={() => setFormat('png')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${format === 'png'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300'
                    : 'bg-white dark:bg-[#202023] border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <Icons.Image />
                  <span className="text-xs font-semibold mt-2">PNG Image</span>
                </button>
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

            {/* Pro Features List (for free users) */}
            {!isPro && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Pro Features</label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <Icons.Check />
                    <span className="font-medium">High-quality exports</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <Icons.Check />
                    <span className="font-medium">No watermarks</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <Icons.Check />
                    <span className="font-medium">PDF & PNG formats</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <Icons.Check />
                    <span className="font-medium">Custom themes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <Icons.Check />
                    <span className="font-medium">Unlimited exports</span>
                  </div>
                </div>
              </div>
            )}
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
                    <span>{statusMessage || 'Exporting...'}</span>
                  </>
                ) : (
                  <>
                    <span>Download {format.toUpperCase()}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                >
                  <Icons.Lock />
                  <span>Unlock Pro Exports</span>
                </button>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Starting at <span className="text-indigo-600 dark:text-indigo-400 font-bold">$4.99/month</span> or <span className="text-indigo-600 dark:text-indigo-400 font-bold">$29.99/year</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Preview */}
        <div className={`flex-1 bg-gray-50 dark:bg-[#09090b] relative overflow-y-auto flex flex-col items-center p-4 md:p-8 custom-scrollbar ${activeTab === 'preview' ? 'flex' : 'hidden md:flex'}`}>

          {/* Mobile Back Button (to settings) */}
          <button
            onClick={() => setActiveTab('settings')}
            className="md:hidden absolute top-4 left-4 z-40 bg-white/90 dark:bg-[#1C1C1F]/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            Settings
          </button>

          {/* Background Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          <div
            className={`relative transition-all duration-500 ease-spring shadow-2xl shrink-0 w-[794px] ${exportTheme === 'dark' ? 'bg-[#1C1C1F]' : 'bg-white'} min-h-full`}
            style={{
              transformOrigin: 'top center',
              transform: `scale(${(zoomLevel / 100) * (794 / 1480)})`,
              marginBottom: `${(zoomLevel / 100) * 100}px`, // Add space at bottom based on zoom
              boxShadow: '0 20px 50px -12px rgba(0,0,0,0.25)'
            }}
          >
            {/* Preview Banner for Free Users */}
            {!isPro && (
              <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  <span className="text-white font-bold text-sm uppercase tracking-wider">Preview - Upgrade to Download</span>
                </div>
                <div className="text-white/90 text-xs font-medium">
                  From <span className="font-bold">$4.99/mo</span>
                </div>
              </div>
            )}

            {/* Content Rendering */}
            <div className="w-full p-12">
              {/* Internal Content without PreviewContainer if we want full scroll */}
              {renderPreviewContent() /* Wait, renderPreviewContent uses PreviewContainer */}
            </div>

            {/* Enhanced Watermark Overlay for Free users */}
            {!isPro && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/5 dark:bg-black/20 backdrop-blur-[2px]">
                <div className="bg-white/95 dark:bg-[#1C1C1F]/95 backdrop-blur-xl px-8 py-6 rounded-3xl border-2 border-indigo-200 dark:border-indigo-800 shadow-2xl max-w-md mx-4 pointer-events-auto">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Preview Mode</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4">
                    This is what you&apos;ll get with Pro
                  </h3>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Icons.Check />
                      </div>
                      <span className="font-medium">High-quality PDF & PNG exports</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Icons.Check />
                      </div>
                      <span className="font-medium">No watermarks or branding</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Icons.Check />
                      </div>
                      <span className="font-medium">Custom light & dark themes</span>
                    </div>
                  </div>

                  <button
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUpgradeClick) {
                        onUpgradeClick();
                      }
                    }}
                  >
                    Upgrade to Pro
                  </button>

                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                    From <span className="font-bold text-indigo-600 dark:text-indigo-400">$4.99/month</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-white dark:bg-[#1C1C1F] p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-30 group animate-in-slide-up">
            <button
              onClick={() => handleZoom(-10)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <Icons.Minus />
            </button>
            <div className="relative flex items-center gap-2 group/slider">
              <input
                type="range"
                min="30"
                max="200"
                step="5"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                className="w-24 accent-indigo-500 cursor-pointer"
              />
              <div className="w-10 text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                {zoomLevel}%
              </div>
            </div>
            <button
              onClick={() => handleZoom(10)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <Icons.Plus />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;