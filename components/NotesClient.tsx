'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { userContentService } from '@/lib/userContentService';
import Toast from '@/components/Toast';

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
    const [notes, setNotes] = useState(initialNotes);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const matchesFilter = filter === 'all' || note.type === filter;
            const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [notes, filter, search]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this note?')) return;

        setIsDeleting(id);
        try {
            await userContentService.deleteNote(id);
            setNotes(prev => prev.filter(n => n.id !== id));
            setToast({ message: 'Note deleted permanently from vault', type: 'success' });
        } catch (error) {
            console.error('Delete failed:', error);
            setToast({ message: 'Failed to delete note', type: 'error' });
        } finally {
            setIsDeleting(null);
        }
    };

    const handleRename = async (e: React.MouseEvent, id: string, currentTitle: string) => {
        e.preventDefault();
        e.stopPropagation();

        const newTitle = prompt('Enter new title:', currentTitle);
        if (!newTitle || newTitle === currentTitle) return;

        try {
            await userContentService.renameNote(id, newTitle);
            setNotes(prev => prev.map(n => n.id === id ? { ...n, title: newTitle } : n));
            setToast({ message: 'Title updated successfully', type: 'success' });
        } catch (error) {
            console.error('Rename failed:', error);
            setToast({ message: 'Failed to update title', type: 'error' });
        }
    };

    const handleCopy = async (e: React.MouseEvent, note: Note) => {
        e.preventDefault();
        e.stopPropagation();

        let textToCopy = '';
        if (typeof note.content === 'string') {
            textToCopy = note.content;
        } else if (note.type === 'summary') {
            textToCopy = note.content;
        } else if (note.type === 'quiz') {
            textToCopy = note.content.map((q: any, i: number) =>
                `Q${i + 1}: ${q.question}\nOptions: ${q.options?.join(', ')}\nCorrect: ${q.correctAnswer}\nAnalysis: ${q.explanation}`
            ).join('\n\n');
        } else if (note.type === 'flashcards') {
            textToCopy = note.content.map((f: any, i: number) =>
                `Card ${i + 1}\nQ: ${f.question}\nA: ${f.answer}`
            ).join('\n\n');
        } else {
            textToCopy = JSON.stringify(note.content, null, 2);
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            setToast({ message: 'Content copied to clipboard', type: 'success' });
        } catch (err) {
            setToast({ message: 'Failed to copy content', type: 'error' });
        }
    };

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
                            className={`group relative bg-gradient-to-br ${getAccentColor(note.type).split(' ').slice(0, 2).join(' ')} p-8 rounded-[2.5rem] border border-white/5 shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[340px] overflow-hidden ${isDeleting === note.id ? 'opacity-50 grayscale' : ''}`}
                        >
                            {/* Background Glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 blur-[60px] rounded-full group-hover:bg-white/10 transition-colors" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${getAccentColor(note.type).split(' ').pop()}`}>
                                        {getTypeIcon(note.type)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleCopy(e, note)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                            title="Copy Content"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 0 0 2 2h6M8 7V5a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293l4.414 4.414a1 1 0 0 1 .293.707V15a2 2 0 0 1-2 2h-2M8 7H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" /></svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleRename(e, note.id, note.title)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                            title="Rename"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, note.id)}
                                            className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                            title="Delete"
                                            disabled={isDeleting === note.id}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
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

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
