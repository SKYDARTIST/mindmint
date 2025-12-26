'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface Note {
    id: string;
    title: string;
    content: any;
    type: string;
    created_at: string;
}

interface NotesClientProps {
    initialNotes: Note[];
}

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'summary', label: 'Summaries' },
    { id: 'mindmap', label: 'Mindmaps' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'quiz', label: 'Quizzes' },
    { id: 'infographic', label: 'Infographics' },
];

const Icons = {
    Summary: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    Mindmap: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C7 2 2.5 5 2.5 5M21.5 5C21.5 5 17 2 12 2" /><path d="M12 22C17 22 21.5 19 21.5 19M2.5 19C2.5 19 7 22 12 22" /><circle cx="12" cy="12" r="3" /></svg>,
    Flashcards: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 6V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" /></svg>,
    Quiz: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2V5a2 2 0 0 1 2-2h11" /></svg>,
    Infographic: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
};

export default function NotesClient({ initialNotes }: NotesClientProps) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredNotes = useMemo(() => {
        return initialNotes.filter(note => {
            const matchesFilter = filter === 'all' || note.type === filter;
            const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [initialNotes, filter, search]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'summary': return <Icons.Summary />;
            case 'mindmap': return <Icons.Mindmap />;
            case 'flashcards': return <Icons.Flashcards />;
            case 'quiz': return <Icons.Quiz />;
            case 'infographic': return <Icons.Infographic />;
            default: return null;
        }
    };

    const getAccentColor = (type: string) => {
        switch (type) {
            case 'summary': return 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400';
            case 'mindmap': return 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400';
            case 'flashcards': return 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400';
            case 'quiz': return 'from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400';
            case 'infographic': return 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400';
            default: return 'from-gray-500/20 to-gray-500/5 border-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="space-y-8 animate-in-fade">

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === cat.id
                                ? 'bg-white text-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search titles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600"
                    />
                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            {/* Grid */}
            {filteredNotes.length === 0 ? (
                <div className="py-32 text-center space-y-4">
                    <p className="text-gray-500 font-medium italic">No content found matching your search. Try a different filter!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map(note => (
                        <Link
                            key={note.id}
                            href={`/?noteId=${note.id}`}
                            className={`group relative bg-gradient-to-br ${getAccentColor(note.type).split(' ').slice(0, 2).join(' ')} p-8 rounded-[2.5rem] border border-white/5 shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[320px] overflow-hidden`}
                        >
                            {/* Background Glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 blur-[60px] rounded-full group-hover:bg-white/10 transition-colors" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${getAccentColor(note.type).split(' ').pop()}`}>
                                        {getTypeIcon(note.type)}
                                    </div>
                                    <span suppressHydrationWarning className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
                                        {new Date(note.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-white leading-[1.1] tracking-tighter uppercase line-clamp-2 pt-2">
                                    {note.title}
                                </h3>

                                <p className="text-gray-400 text-sm font-medium line-clamp-3 leading-relaxed opacity-60">
                                    {typeof note.content === 'string'
                                        ? note.content.substring(0, 150)
                                        : `Intelligent ${note.type} generation with rich data structure.`}
                                </p>
                            </div>

                            <div className="relative z-10 pt-6 flex justify-between items-center">
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-1 bg-white/10 rounded-full" />)}
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all group-hover:translate-x-1 ${getAccentColor(note.type).split(' ').pop()}`}>
                                    Explore →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
