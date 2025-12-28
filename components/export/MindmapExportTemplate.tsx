import React from 'react';
import PresentationRenderer from '@/components/PresentationRenderer';

interface MindmapExportTemplateProps {
    content: string;
    title: string;
    theme?: 'light' | 'dark';
}

/**
 * Phase 2 Export Template:
 * - Powered by PresentationRenderer
 * - Dynamic Fit-to-Page
 * - 2400x1600 High-Res Canvas
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
            className={`w-[2400px] min-h-[1600px] ${isDark ? 'bg-[#09090b] text-white' : 'bg-white text-gray-900'} p-32 flex flex-col relative overflow-hidden`}
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
                <div className={`absolute top-[-500px] left-[-500px] w-[1500px] h-[1500px] rounded-full blur-[300px] ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-100/50'}`} />
                <div className={`absolute bottom-[-500px] right-[-500px] w-[1500px] h-[1500px] rounded-full blur-[300px] ${isDark ? 'bg-purple-600/10' : 'bg-purple-100/50'}`} />
            </div>

            {/* Premium Header */}
            <div className={`relative z-10 flex flex-col items-center text-center mb-32 border-b-8 ${isDark ? 'border-white/5' : 'border-indigo-100/50'} pb-24`}>
                <div className="inline-flex items-center gap-4 px-8 py-3 bg-indigo-500/10 border-4 border-indigo-500/20 rounded-full mb-12 shadow-2xl">
                    <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-2xl font-black text-indigo-400 uppercase tracking-[0.5em]">MindMint Professional</span>
                </div>

                <h1 className="text-[160px] font-black tracking-[-0.05em] leading-[0.85] mb-8">
                    {renderGradientTitle(title)}
                </h1>

                <div className="flex items-center gap-12 mt-12">
                    <div className="text-3xl font-black uppercase tracking-[0.3em] text-gray-500 italic">
                        Mindmap Analysis
                    </div>
                    <div className="w-2 h-2 rounded-full bg-gray-700" />
                    <div className="text-4xl font-bold tracking-tight text-gray-400">
                        {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            {/* Main Diagram Area */}
            <div
                className={`relative z-10 flex-1 flex items-center justify-center rounded-[80px] border-8 ${isDark ? 'border-white/5 bg-[#111116]' : 'border-gray-100 bg-gray-50'} p-24 overflow-hidden shadow-2xl`}
                id="export-mermaid-container"
            >
                <div className="w-full h-full">
                    <PresentationRenderer chart={content} theme={theme} isExport={true} />
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-40 flex justify-between items-end border-t-8 border-white/5 pt-24 px-12 pb-8">
                <div>
                    <div className="text-3xl font-black text-indigo-500 uppercase tracking-[0.4em] mb-4">MindMint.app</div>
                    <div className="text-4xl font-bold text-gray-500 tracking-tight max-w-[1200px] leading-relaxed">
                        Visualized by Artificial Intelligence. Designed for human clarity.
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-gray-600 uppercase tracking-widest mb-2">Authenticated Export</div>
                    <div className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white opacity-40' : 'text-gray-900 opacity-20'}`}>MM-PRO-MP-2025</div>
                </div>
            </div>

            <style jsx global>{`
                #export-mermaid-container svg {
                    filter: drop-shadow(0 40px 80px rgba(0,0,0,0.6));
                }
            `}</style>
        </div>
    );
};

export default MindmapExportTemplate;
