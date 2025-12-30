import React from 'react';
import { Flashcard, QuizItem } from '@/types';

interface DocumentExportTemplateProps {
    content: any;
    title: string;
    appMode: string;
    theme?: 'light' | 'dark';
    pageNumber?: number;
    totalPages?: number;
    itemOffset?: number;
}

const DocumentExportTemplate: React.FC<DocumentExportTemplateProps> = ({
    content,
    title,
    appMode,
    theme = 'dark',
    pageNumber = 1,
    totalPages = 1,
    itemOffset = 0
}) => {
    const isDark = theme === 'dark';
    const isFirstPage = pageNumber === 1;

    // Smart truncation: respects word boundaries and removes trailing connectors
    const smartTruncate = (text: string, limit: number) => {
        if (text.length <= limit) return text;
        let truncated = text.substring(0, limit);
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) truncated = truncated.substring(0, lastSpace);

        const connectors = ['of', 'the', 'and', 'a', 'is', 'in', 'with', 'from', 'to', 'for', 'by', 'on', 'at'];
        const words = truncated.split(' ');
        while (words.length > 0 && connectors.includes(words[words.length - 1].toLowerCase())) {
            words.pop();
        }
        return words.join(' ').replace(/[.,:;!?&]$/, '') + '...';
    };

    const displayTitle = smartTruncate(title, 32);
    // Even shorter for inner pages
    const shortTitle = smartTruncate(title, 22);

    // Helper for alternating word gradients
    const renderGradientTitle = (text: string) => {
        return text.split(' ').map((word, i) => (
            <span key={i} className={i % 2 === 0 ? (isDark ? 'text-white' : 'text-gray-900') : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}>
                {word}{' '}
            </span>
        ));
    };

    const renderContent = () => {
        if (appMode === 'summary') {
            return (
                <div className="max-w-[1800px] mx-auto py-24">
                    <div className={`p-20 rounded-[64px] border-4 ${isDark ? 'bg-[#111116]/80 border-white/5 shadow-2xl shadow-indigo-500/10' : 'bg-gray-50 border-gray-200'} relative overflow-hidden`}>
                        {/* Mesh background for summary cards */}
                        <div className={`absolute inset-0 opacity-10 ${isDark ? 'bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20' : ''}`} />
                        <div className="relative z-10 whitespace-pre-wrap leading-[1.6] text-[32px] font-medium tracking-tight max-w-[1300px] mx-auto">
                            {content}
                        </div>
                    </div>
                </div>
            );
        }

        if (appMode === 'infographic') {
            const data = content as any;
            const layout = data.layout || 'step_by_step';

            if (layout === 'step_by_step') {
                return (
                    <div className="max-w-[1800px] mx-auto py-12 relative">
                        {/* Vertical Track (Chronicle Layout) */}
                        <div className="absolute left-[100px] top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-500/0 via-indigo-500/50 to-purple-500/0 shadow-[0_0_20px_rgba(99,102,241,0.2)]" />

                        <div className="space-y-24">
                            {data.steps?.map((step: any, i: number) => (
                                <div key={i} className="flex gap-20 items-center relative z-10">
                                    {/* Glowing Step Indicator */}
                                    <div className={`shrink-0 w-[200px] h-[200px] ${isDark ? 'bg-[#09090b]' : 'bg-white'} rounded-full border-8 border-indigo-500 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.4)] ring-[16px] ring-indigo-500/10`}>
                                        <span className="text-2xl font-black text-indigo-400 uppercase tracking-widest mb-1">Step</span>
                                        <span className={`text-7xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>0{i + 1 + itemOffset}</span>
                                    </div>

                                    <div className={`flex-1 p-10 rounded-[40px] border-4 ${isDark ? 'bg-[#1C1C1F] border-white/5 shadow-2xl' : 'bg-gray-50 border-gray-200'}`}>
                                        <h3 className="text-[48px] font-black mb-4 leading-none tracking-tighter uppercase">{step.title}</h3>
                                        <p className="text-[28px] text-gray-400 font-medium leading-[1.4] tracking-tight">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            if (layout === 'process_flow') {
                return (
                    <div className="max-w-[2000px] mx-auto py-20 flex flex-wrap justify-center gap-16">
                        {data.steps?.map((step: any, i: number) => (
                            <div key={i} className="w-[500px] relative">
                                <div className="absolute -top-6 left-0 text-xl font-black uppercase tracking-[0.4em] text-indigo-500">Node // 0{i + 1 + itemOffset}</div>
                                <div className={`h-full p-12 rounded-[64px] border-4 ${isDark ? 'bg-gradient-to-br from-[#1C1C1F] to-[#161619] border-white/10 shadow-3xl' : 'bg-white border-gray-200'} flex flex-col items-center text-center`}>
                                    <div className="w-12 h-12 bg-indigo-500 rounded-full mb-6 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                                    <h3 className="text-[36px] font-black mb-4 leading-tight tracking-tighter">{step.title}</h3>
                                    <p className="text-[22px] text-gray-400 font-bold leading-relaxed opacity-70 italic">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            if (layout === 'comparison') {
                return (
                    <div className="max-w-[2000px] mx-auto py-12 grid grid-cols-2 gap-12">
                        {data.steps?.map((step: any, i: number) => (
                            <div key={i} className={`relative overflow-hidden rounded-[80px] border-4 ${isDark ? 'bg-[#111113] border-white/5 shadow-2xl' : 'bg-white border-gray-200'} p-16 min-h-[500px] flex flex-col justify-end`}>
                                <div className={`absolute top-0 right-0 w-96 h-96 blur-[150px] opacity-20 ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-purple-500'}`} />
                                <div className="relative z-10 space-y-6">
                                    <div className={`w-12 h-2 rounded-full ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-purple-500'}`} />
                                    <h3 className="text-[44px] font-black uppercase tracking-tighter leading-none">{step.title}</h3>
                                    <p className="text-[24px] text-gray-400 font-bold leading-tight">{step.description}</p>
                                </div>
                                <div className="absolute top-12 right-12 text-7xl font-black opacity-10 italic">#{i + 1 + itemOffset}</div>
                            </div>
                        ))}
                    </div>
                );
            }
        }

        if (appMode === 'quiz') {
            const items = content as QuizItem[];
            return (
                <div className="max-w-[1800px] mx-auto py-12 space-y-20">
                    {items.map((item, i) => (
                        <div key={i} className={`p-20 rounded-[64px] border-4 ${isDark ? 'bg-white/[0.03] border-white/5 shadow-2xl backdrop-blur-3xl' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-10">
                                <span className="text-2xl font-black text-indigo-500 uppercase tracking-[0.4em]">Question // 0{i + 1 + itemOffset}</span>
                                <div className="w-16 h-1 px-1 bg-indigo-500/20 rounded-full" />
                            </div>

                            <h3 className="text-[42px] font-bold leading-tight mb-12 tracking-tight">{item.question}</h3>

                            {item.options && (
                                <div className="grid grid-cols-1 gap-6 mb-16">
                                    {item.options.map((opt, idx) => (
                                        <div key={idx} className={`p-8 rounded-2xl border-2 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'} text-[28px] font-semibold flex items-center`}>
                                            <span className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mr-6 font-black text-xl">{String.fromCharCode(65 + idx)}</span>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-12 pt-12 border-t-4 border-dashed border-white/10">
                                <div className="text-[28px] font-black text-emerald-400 mb-3 flex items-center gap-4">
                                    <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />
                                    Correct: {item.correctAnswer}
                                </div>
                                <div className="text-[24px] text-gray-400 leading-relaxed font-medium italic opacity-80">
                                    Analysis: {item.explanation}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (appMode === 'flashcards') {
            const cards = content as Flashcard[];
            return (
                <div className="grid grid-cols-1 gap-20 py-12 max-w-[1800px] mx-auto">
                    {cards.map((card, i) => (
                        <div key={i} className={`p-16 rounded-[60px] border-4 ${isDark ? 'bg-[#111116] border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.5)]' : 'bg-gray-50 border-gray-200'} relative overflow-hidden group`}>
                            {/* Card Accent */}
                            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                            <div className="flex flex-col items-center text-center">
                                <div className="text-2xl font-black text-indigo-500 tracking-[0.6em] uppercase mb-12">Knowledge Node // {i + 1 + itemOffset}</div>

                                <div className="space-y-12 w-full">
                                    <div>
                                        <div className="text-xl font-black text-gray-500 uppercase tracking-widest mb-4">Prompt</div>
                                        <div className={`text-[48px] font-black leading-none tracking-tighter ${isDark ? 'text-white brightness-125' : 'text-gray-900'}`}>{card.question}</div>
                                    </div>

                                    <div className={`p-10 rounded-[40px] ${isDark ? 'bg-white/5' : 'bg-white'} border-2 border-white/5 shadow-inner`}>
                                        <div className="text-xl font-black text-gray-500 uppercase tracking-widest mb-4">Resolution</div>
                                        <div className={`text-[32px] font-bold leading-snug ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{card.answer}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div
            className={`w-[1480px] h-auto ${isDark ? 'bg-[#09090b] text-white' : 'bg-white text-gray-900'} p-16 flex flex-col relative overflow-hidden`}
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
            {isFirstPage ? (
                <div className={`relative z-10 flex flex-col items-center text-center mb-16 border-b-8 ${isDark ? 'border-white/5' : 'border-indigo-100/50'} pb-12`}>
                    <div className="inline-flex items-center gap-4 px-8 py-3 bg-indigo-500/10 border-4 border-indigo-500/20 rounded-full mb-8 shadow-2xl">
                        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-2xl font-black text-indigo-400 uppercase tracking-[0.5em]">MindMint Professional</span>
                    </div>

                    <h1 className="text-[64px] font-black tracking-[-0.05em] leading-[1.1] mb-4 max-w-[1300px] mx-auto break-words">
                        {renderGradientTitle(displayTitle)}
                    </h1>

                    <div className="flex items-center gap-12 mt-12">
                        <div className="text-2xl font-black uppercase tracking-[0.3em] text-gray-500 italic">
                            {appMode} Analysis
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
            ) : (
                <div className={`relative z-10 flex justify-between items-center mb-24 border-b-8 ${isDark ? 'border-white/5' : 'border-indigo-100/50'} pb-12`}>
                    <div className="flex items-center gap-6">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        <span className="text-3xl font-black text-indigo-400 uppercase tracking-[0.3em]">MindMint</span>
                    </div>
                    <div className="text-4xl font-black tracking-tight opacity-40 uppercase italic">
                        {shortTitle}
                    </div>
                    <div className="text-3xl font-bold text-gray-500">
                        {appMode} Cont...
                    </div>
                </div>
            )}

            {/* Content Container */}
            <div className="relative z-10 flex-1">
                {renderContent()}
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-24 flex justify-between items-end border-t-4 border-white/5 pt-16 px-8 pb-4">
                <div>
                    <div className="text-2xl font-black text-indigo-500 uppercase tracking-[0.4em] mb-3">MindMint.app</div>
                    <div className="text-3xl font-bold text-gray-500 tracking-tight max-w-[900px] leading-relaxed">
                        Curated by Artificial Intelligence. Designed for Human Mastery.
                    </div>
                </div>
                <div className="flex flex-col items-end gap-4 text-right">
                    <div className="flex items-center gap-4">
                        <div className="text-2xl font-black text-gray-500 uppercase tracking-widest italic">Page</div>
                        <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-100'} flex items-center justify-center text-3xl font-black`}>
                            {pageNumber}
                        </div>
                        <div className="text-2xl font-bold text-gray-600">/ {totalPages}</div>
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-600 uppercase tracking-widest mb-1">Authenticated Export</div>
                        <div className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white opacity-40' : 'text-gray-900 opacity-20'}`}>MM-PRO-SS-2025</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentExportTemplate;
