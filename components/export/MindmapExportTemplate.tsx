import React from 'react';
import ExportMindmapRenderer from './ExportMindmapRenderer';

interface MindmapExportTemplateProps {
    content: string;
    title: string;
    theme?: 'light' | 'dark';
}

/**
 * Premium Presentation Export Template:
 * - Powered by ExportMindmapRenderer (Static / High-Res)
 * - Natural Title Wrapping (No Truncation)
 * - Auto-Height Canvas
 * - Designed for "Instant Readability" at 100% Zoom
 */
const MindmapExportTemplate: React.FC<MindmapExportTemplateProps> = ({
    content,
    title,
    theme = 'dark'
}) => {
    const isDark = theme === 'dark';

    // Helper for alternating word gradients
    const renderGradientTitle = (text: string) => {
        return text.split(' ').map((word, i) => (
            <span key={i} className={i % 2 === 0 ? (isDark ? 'text-white' : 'text-gray-900') : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}>
                {word}{' '}
            </span>
        ));
    };

    return (
        <div
            className={`min-w-[1480px] w-[1480px] h-auto ${isDark ? 'bg-[#09090b] text-white' : 'bg-white text-gray-900'} p-16 pb-20 flex flex-col relative overflow-hidden`}
            id="export-template-root"
        >
            {/* Mesh Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-0 left-0 w-full h-full ${isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'}`}
                    style={{
                        backgroundImage: isDark ? 'radial-gradient(#fff 2px, transparent 2px)' : 'radial-gradient(#000 2px, transparent 2px)',
                        backgroundSize: '80px 80px'
                    }}
                />
                <div className={`absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-100/40'}`} />
                <div className={`absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] ${isDark ? 'bg-purple-600/10' : 'bg-purple-100/40'}`} />
            </div>

            {/* Premium Header */}
            <div className={`relative z-10 flex flex-col items-center text-center mb-10 border-b-4 ${isDark ? 'border-white/5' : 'border-indigo-100/50'} pb-10`}>
                <div className="inline-flex items-center gap-4 px-8 py-3 bg-indigo-500/10 border-2 border-indigo-500/20 rounded-full mb-8 shadow-xl">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xl font-black text-indigo-400 uppercase tracking-[0.5em]">MindMint Professional</span>
                </div>

                {/* NATURAL WRAPPING TITLE - NO TRUNCATION */}
                <h1 className="text-[64px] font-black tracking-[-0.04em] leading-[1.1] mb-6 max-w-[1300px] mx-auto break-words whitespace-normal px-4">
                    {renderGradientTitle(title)}
                </h1>

                <div className="flex items-center gap-10 mt-6">
                    <div className="text-2xl font-black uppercase tracking-[0.3em] text-gray-500 italic">
                        Mindmap Analysis
                    </div>
                    <div className="w-2 h-2 rounded-full bg-gray-700" />
                    <div className="text-3xl font-bold tracking-tight text-gray-400">
                        {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            {/* Main Diagram Area - Static and Presentation Ready */}
            <div
                className={`relative z-10 w-full rounded-[60px] border-4 ${isDark ? 'border-white/5 bg-[#111116]' : 'border-gray-100 bg-gray-50'} p-12 overflow-visible shadow-[0_40px_80px_rgba(0,0,0,0.3)]`}
                id="export-mermaid-container"
            >
                <ExportMindmapRenderer chart={content} theme={theme} />
            </div>

            {/* Premium Footer */}
            <div className={`relative z-10 mt-16 flex justify-between items-end border-t-4 ${isDark ? 'border-white/5' : 'border-gray-100'} pt-16 px-12 pb-8`}>
                <div className="flex flex-col gap-4">
                    <div className="text-4xl font-black text-indigo-500 uppercase tracking-[0.4em]">MindMint.app</div>
                    <div className="text-3xl font-bold text-gray-500 tracking-tight max-w-[900px] leading-relaxed">
                        Visualized by Artificial Intelligence. <br />
                        Optimized for Infinite Human Clarity.
                    </div>
                </div>
                <div className="text-right flex flex-col gap-3">
                    <div className="text-xl font-black text-gray-400 uppercase tracking-widest bg-indigo-500/5 px-4 py-1 rounded-lg border border-indigo-500/10">Authenticated Digital Export</div>
                    <div className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'} opacity-30 px-2 leading-none whitespace-nowrap`}>MM-PRO-MP-2025</div>
                </div>
            </div>

            <style jsx global>{`
                #export-mermaid-container svg {
                    filter: drop-shadow(0 40px 80px rgba(0,0,0,0.4));
                }
            `}</style>
        </div>
    );
};

export default MindmapExportTemplate;
