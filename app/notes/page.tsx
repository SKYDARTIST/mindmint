import { redirect } from 'next/navigation';
import Link from 'next/link';
import NotesClient from '@/components/NotesClient';

export default async function NotesPage() {
    return (
        <div className="min-h-screen bg-[#09090b] bg-dot-pattern text-white px-6 py-12">
            <div className="max-w-[1400px] mx-auto space-y-12">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-4 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 hover:border-white/20 transition-all group shadow-2xl">
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black tracking-tighter uppercase italic">My Notes</h1>
                            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Vault // Storage // MindMint v1.0</p>
                        </div>
                    </div>

                    <Link href="/" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/20 text-center active:scale-[0.98]">
                        Create New Content
                    </Link>
                </header>

                {/* Client Side Logic (Filter/Search/Grid) */}
                <NotesClient />

            </div>
        </div>
    );
}
