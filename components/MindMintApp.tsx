"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import LegalFooter from "./LegalFooter";
import type { AppMode, MindmapLayout, FlashcardLayout, QuizLayout, SummaryLayout, InfographicLayout, Flashcard, QuizItem, InfographicContent } from "@/types";
import { getWordCount, LIMITS } from "@/lib/validation";
import BrandLogo from "./BrandLogo";
const SummaryViewer = dynamic(() => import("./SummaryViewer"));
const PresentationRenderer = dynamic(() => import("./PresentationRenderer"));
const FlashcardViewer = dynamic(() => import("./FlashcardViewer"));
const QuizViewer = dynamic(() => import("./QuizViewer"));
const InfographicViewer = dynamic(() => import("./InfographicViewer"));
const ExportModal = dynamic(() => import("./ExportModal"));
const AuthModal = dynamic(() => import("./AuthModal"));
const Toast = dynamic(() => import("./Toast"));
import { useSearchParams } from 'next/navigation';
import { auth } from "@/lib/firebase/config";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { MindmapSkeleton, ListSkeleton, SummarySkeleton } from "./SkeletonLoaders";

// Icons
const Icons = {
  Mindmap: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C7 2 2.5 5 2.5 5M21.5 5C21.5 5 17 2 12 2" /><path d="M12 22C17 22 21.5 19 21.5 19M2.5 19C2.5 19 7 22 12 22" /><circle cx="12" cy="12" r="3" /><path d="M12 9V5" /><path d="M12 15v4" /><path d="M15 12h4" /><path d="M5 12h4" /></svg>,
  Flashcards: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 6V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" /></svg>,
  Quiz: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
  Summary: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  Infographic: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  Google: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333 .533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.107-2.107 2.733-5.333 2.733-7.933 0-.52-.053-1.04-.133-1.48H12.48z" /></svg>,
  Export: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  Save: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Lock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Templates: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></svg>,
  Bolt: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  Folder: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" /></svg>,
  Close: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>,
};

const STARTER_TEMPLATES = [
  { id: "study", title: "Study Notes", desc: "Turn class notes or textbook content into clear, structured understanding.", placeholder: "Paste your study notes, textbook content, or lecture material here…" },
  { id: "exam", title: "Exam Revision", desc: "Generate revision-ready summaries.", placeholder: "Paste topics or syllabus points here…" },
  { id: "concept", title: "Concept Explainer", desc: "Understand any topic with clear, step-by-step explanations.", placeholder: "Paste the concept or complex topic you want explained simply here…" },
];

interface MindMintAppProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function MindMintApp({ theme, toggleTheme }: MindMintAppProps) {
  const [mode, setMode] = useState<AppMode>("summary");
  const [isInputMode, setIsInputMode] = useState(false);
  const [inputText, setInputText] = useState("");
  const [activePlaceholder, setActivePlaceholder] = useState("Paste your notes here…");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [output, setOutput] = useState<string | Record<string, unknown> | unknown[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mindmapLayout, setMindmapLayout] = useState<MindmapLayout>("classic");
  const [flashcardLayout, setFlashcardLayout] = useState<FlashcardLayout>("classic");
  const [quizLayout, setQuizLayout] = useState<QuizLayout>("classic");
  const [summaryLayout, setSummaryLayout] = useState<SummaryLayout>("concept_overview");
  const [infographicLayout, setInfographicLayout] = useState<InfographicLayout>("step_by_step");
  const { user } = useSubscription();
  const [generationsLeft, setGenerationsLeft] = useState(5);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const searchParams = useSearchParams();

  // No more demo mode - everything is user-bound or blocked

  // Auto-close auth modal when user is detected
  useEffect(() => {
    if (user) setShowAuthModal(false);
  }, [user]);

  // Load real daily usage from Firestore on login/refresh
  useEffect(() => {
    if (!user) {
      setGenerationsLeft(5);
      return;
    }
    const fetchUsage = async () => {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      try {
        const docRef = doc(db, 'user_plan_usage', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const lastAt = data?.last_generation_at ? new Date(data.last_generation_at).getTime() : null;
          const isToday = lastAt ? (() => {
            const d = new Date(lastAt), t = new Date();
            return d.getUTCFullYear() === t.getUTCFullYear() && d.getUTCMonth() === t.getUTCMonth() && d.getUTCDate() === t.getUTCDate();
          })() : false;
          const usedToday = isToday ? (data?.daily_count || 0) : 0;
          setGenerationsLeft(Math.max(0, 5 - usedToday));
        } else {
          setGenerationsLeft(5);
        }
      } catch {
        // If fetch fails, keep display at 5 — server will enforce the real limit
      }
    };
    fetchUsage();
  }, [user]);

  // Handle loading note from URL
  useEffect(() => {
    const noteId = searchParams.get('noteId');
    if (!noteId || !user) return;

    const fetchNote = async () => {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');

      try {
        const docRef = doc(db, 'user_content', noteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Verify ownership before displaying
          if (data.user_id !== user.uid) {
            setToast({ message: "Access denied.", type: "error" });
            return;
          }
          setMode(data.type as AppMode);
          setOutput(data.content);
          // Clear the URL
          const url = new URL(window.location.href);
          url.searchParams.delete('noteId');
          window.history.replaceState({}, '', url);

          setToast({ message: `Loaded: ${data.title}`, type: "info" });
        } else {
          setToast({ message: "Note not found.", type: "error" });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error("Error fetching note:", message);
        setToast({ message: "Failed to load note.", type: "error" });
      }
    };

    fetchNote();
  }, [searchParams, user]);

  const handleSignOut = async () => {
    await auth.signOut();
    window.location.reload();
  };


  const handleTemplateSelect = (tpl: typeof STARTER_TEMPLATES[0]) => {
    // Allow demo users to use templates
    setActivePlaceholder(tpl.placeholder);
    setIsInputMode(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleReset = () => {
    setIsInputMode(false);
    setInputText("");
    setOutput(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      // Guest handling
      if (!user) {
        setShowAuthModal(true);
        setToast({ message: "Sign up free to start generating!", type: "info" });
        setIsLoading(false);
        return;
      }

      // Authenticated user flow
      if (generationsLeft <= 0) {
        setToast({ message: "Daily limit reached! Come back tomorrow.", type: "info" });
        setIsLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          input: inputText,
          mode,
          layout: mode === "mindmap" ? mindmapLayout : mode === "flashcards" ? flashcardLayout : mode === "quiz" ? quizLayout : mode === "summary" ? summaryLayout : mode === "infographic" ? infographicLayout : "classic",
        }),
      });

      const result = await res.json();
      if (result.ok) {
        setOutput(result.data);
        setGenerationsLeft(result.usageRemaining ?? (generationsLeft - 1));

        // Auto-save to Firestore
        const savedTitle = await saveToFirestore(result.data, mode, inputText);
        setCurrentTitle(savedTitle || "");
      } else {
        setError(result.error || "Failed to generate content");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred during generation";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToFirestore = async (generatedContent: string | Record<string, unknown> | unknown[], contentType: string, originalInput: string, isManual = false): Promise<string | null> => {
    if (!generatedContent || !user) return null;

    try {
      const { addDoc, collection, query, where, getCountFromServer } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');

      // Count existing rows
      const coll = collection(db, 'user_content');
      const q = query(coll, where('user_id', '==', user.uid));
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;

      if (count >= 50) { // New higher generic limit for experiment
        setToast({ message: "Library limit reached (50 items).", type: "info" });
        return null;
      }

      // Derive a title
      let title = "Untitled Generation";
      if (generatedContent && typeof generatedContent === 'object' && 'title' in generatedContent && typeof generatedContent.title === 'string') {
        title = generatedContent.title;
      } else if (Array.isArray(generatedContent)) {
        const prefix = contentType === 'flashcards' ? 'Flashcards' : 'Quiz';
        title = `${prefix}: ${originalInput.split('\n')[0].substring(0, 30).trim() || "Untitled"}`;
      } else if (originalInput) {
        title = originalInput.split('\n')[0].substring(0, 50).trim() || "Untitled Generation";
      }

      await addDoc(collection(db, 'user_content'), {
        user_id: user.uid,
        title: title,
        content: generatedContent,
        type: contentType,
        created_at: new Date().toISOString()
      });

      if (isManual) setToast({ message: "Project saved successfully!", type: 'success' });
      return title;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error("Error saving to Firestore:", message);
      if (isManual) setToast({ message: "An unexpected error occurred while saving.", type: 'error' });
      return null;
    }
  };

  // Layout change clears output so user must explicitly regenerate
  // (prevents silently burning daily generations)
  useEffect(() => {
    if (output && !isLoading) {
      setOutput(null);
      setToast({ message: "Layout changed. Click Generate to regenerate.", type: "info" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mindmapLayout, flashcardLayout, quizLayout, summaryLayout, infographicLayout]);

  return (
    <div className={`min-h-screen flex flex-col bg-dot-pattern transition-colors duration-500 ${theme === "dark" ? "dark bg-[#09090b] text-white" : "bg-white text-black"}`}>

      {/* FLOATING TOP BAR */}
      <div className="pt-6 px-6">
        <nav className="max-w-[1600px] mx-auto glass-nav rounded-2xl border px-6 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-6">
            <BrandLogo variant="full" size="sm" />
            <div className="hidden md:flex h-6 w-px bg-white/10" />
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-400">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              MindMint v1.0
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 sm:p-2.5 rounded-xl hover:bg-white/5 transition-all text-gray-400 hover:text-white">
              {theme === "light" ? <Icons.Moon /> : <Icons.Sun />}
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
            >
              <Icons.Templates />
            </button>
            {user && (
              <div
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg border bg-indigo-500/10 border-indigo-500/20"
                title="Total daily generations across all tools"
              >
                <Icons.Bolt />
                <span className="text-[10px] sm:text-xs font-bold text-indigo-400 whitespace-nowrap">
                  {generationsLeft} <span className="hidden sm:inline">Runs left</span>
                </span>
              </div>
            )}

            {user ? (
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-sm transition text-gray-400 hover:text-white"
              >
                <Icons.Logout />
                <span>Sign Out</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-sm transition text-gray-400 hover:text-white"
                >
                  <Icons.Google />
                  <span>Sign in</span>
                </button>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                    }`}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </nav>
      </div>


      {/* NO BANNER NEEDED IN APP MODE */}


      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col md:flex-row max-w-[1700px] mx-auto w-full gap-4 md:gap-8 p-4 md:p-6 overflow-hidden">

        {/* SIDEBAR - Desktop and Mobile */}
        <aside className={`${showMobileMenu ? 'flex' : 'hidden'} md:flex absolute md:relative inset-0 md:inset-auto z-[20] md:z-auto bg-white dark:bg-[#09090b] md:bg-transparent w-full md:w-56 shrink-0 flex-col justify-between py-8 md:py-4 px-6 md:px-0 scrollbar-hide overflow-y-auto`}>
          <div className="space-y-8">
            <div className="md:hidden flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <BrandLogo variant="full" size="sm" />
                <button onClick={() => setShowMobileMenu(false)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl">
                  <Icons.Close />
                </button>
              </div>

              {user && (
                <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-lg text-white">
                      <Icons.Bolt />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Daily Usage</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">{generationsLeft} / 5 remaining</p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full border-2 border-indigo-500/20 flex items-center justify-center">
                    <span className="text-xs font-black text-indigo-500">{generationsLeft}</span>
                  </div>
                </div>
              )}
              {!user && (
                <div className="flex flex-col gap-3 p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                      <Icons.Bolt />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white">Join MindMint</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Save your work instantly</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-sm shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    Create Free Account
                  </button>
                  <button
                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                    className="w-full py-2 text-center text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-4">Generate</div>
              <nav className="space-y-1">
                {(["mindmap", "summary", "flashcards", "quiz", "infographic"] as AppMode[]).map((m) => {
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m);
                        setOutput(null);
                        setError(null);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${mode === m
                        ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {m === "mindmap" && <Icons.Mindmap />}
                        {m === "flashcards" && <Icons.Flashcards />}
                        {m === "quiz" && <Icons.Quiz />}
                        {m === "summary" && <Icons.Summary />}
                        {m === "infographic" && <Icons.Infographic />}
                        <span className="capitalize text-sm font-medium">{m}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-4">Library & Export</div>
              <nav className="space-y-1">
                {[
                  { id: 'notes', label: 'My Notes', icon: <Icons.Folder />, onClick: () => { window.location.href = '/notes'; }, visible: true },
                  { id: 'export', label: 'Export PDF/PNG', icon: <Icons.Export />, onClick: () => { setShowExportModal(true); setShowMobileMenu(false); }, visible: true },
                ].filter(i => i.visible).map((item) => {
                  return (
                    <button
                      key={item.id}
                      onClick={!user ? () => {
                        setShowAuthModal(true);
                        setToast({ message: "Sign up to access this feature!", type: "info" });
                      } : item.onClick}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="text-[10px] text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Open</div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="px-4 space-y-4">
            {user && (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 md:hidden"
              >
                <Icons.Logout />
                <span className="text-sm font-bold">Sign Out</span>
              </button>
            )}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-gray-500 dark:text-gray-600 font-medium tracking-tight">Built by <span className="text-gray-900 dark:text-gray-400 font-bold">Cryptobulla</span></div>
                <a
                  href="https://x.com/Cryptobullaaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:text-indigo-500 transition-all hover:-translate-y-0.5"
                  title="Contact on X"
                >
                  <Icons.X />
                </a>
              </div>
              <LegalFooter variant="compact" />
            </div>
          </div>
        </aside>

        {/* CARDS CONTAINER */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden">

          {/* INPUT CARD */}
          <div className="w-full md:w-[480px] shrink-0 flex flex-col premium-card overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{mode}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                {mode === "mindmap" || mode === "flashcards" || mode === "quiz" || mode === "summary" || mode === "infographic" ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                      className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/5 hover:border-indigo-500/50 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {(mode === "mindmap" ? mindmapLayout : mode === "flashcards" ? flashcardLayout : mode === "quiz" ? quizLayout : mode === "summary" ? summaryLayout : infographicLayout).replace("_", " ")}
                      </span>
                      <Icons.ChevronDown />
                    </button>

                    {showLayoutMenu && (
                      <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                        {(mode === "mindmap"
                          ? ["classic", "categorized", "flow"]
                          : mode === "flashcards"
                            ? ["classic", "concept", "cloze"]
                            : mode === "quiz"
                              ? ["classic", "speed", "scenario"]
                              : mode === "summary"
                                ? ["concept_overview", "bullet", "study_notes"]
                                : ["step_by_step", "process_flow", "comparison"]
                        ).map((l) => (
                          <button
                            key={l}
                            onClick={() => {
                              if (mode === "mindmap") setMindmapLayout(l as MindmapLayout);
                              else if (mode === "flashcards") setFlashcardLayout(l as FlashcardLayout);
                              else if (mode === "quiz") setQuizLayout(l as QuizLayout);
                              else if (mode === "summary") setSummaryLayout(l as SummaryLayout);
                              else setInfographicLayout(l as InfographicLayout);
                              setShowLayoutMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${(mode === "mindmap" ? mindmapLayout : mode === "flashcards" ? flashcardLayout : mode === "quiz" ? quizLayout : mode === "summary" ? summaryLayout : infographicLayout) === l
                              ? "bg-indigo-600/10 text-indigo-500"
                              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                              }`}
                          >
                            {l.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/5">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default</span>
                    <Icons.ChevronDown />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6 scrollbar-hide min-h-[300px] md:min-h-0">
              {isInputMode ? (
                <div className="h-full flex flex-col space-y-6">
                  <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 group">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Templates
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activePlaceholder}
                    className="flex-1 w-full bg-transparent text-sm resize-none focus:outline-none leading-relaxed text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <span>{getWordCount(inputText)}</span>
                      <span className="mx-1">/</span>
                      <span>{LIMITS.free} words</span>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-bold text-sm text-white shadow-2xl shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    {isLoading ? "Generating..." : `Generate ${mode}`}
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Start with a template</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Choose a starter to auto-focus your content.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {STARTER_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => handleTemplateSelect(tpl)}
                        className={`p-5 rounded-2xl border transition-all text-left group ${theme === "dark"
                          ? "bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5"
                          : "bg-white border-gray-100 hover:border-indigo-200 hover:shadow-xl"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                            {tpl.id === 'study' && <Icons.Summary />}
                            {tpl.id === 'exam' && <Icons.Quiz />}
                            {tpl.id === 'concept' && <Icons.Flashcards />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">{tpl.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{tpl.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CANVAS CARD */}
          <div className="flex-1 flex flex-col premium-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">Canvas</span>
              </div>
              <div className="px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {isLoading ? 'Processing' : 'Waiting'}
                </span>
              </div>
            </div>

            <div className="flex-1 relative overflow-auto">
              <div className="h-full w-full flex items-center justify-center p-8">
                {error ? (
                  <div className="text-center space-y-4 max-w-sm animate-in">
                    <div className="text-4xl">⚠️</div>
                    <p className="text-red-400 font-medium text-sm">{error}</p>
                    <button onClick={handleGenerate} className="px-8 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all">Try Again</button>
                  </div>
                ) : output ? (
                  <div className="w-full h-full scale-100 animate-in overflow-auto custom-scrollbar">
                    {mode === "summary" && <SummaryViewer data={output as string} />}
                    {mode === "mindmap" && <PresentationRenderer chart={output as string} theme={theme} />}
                    {mode === "flashcards" && <FlashcardViewer cards={output as Flashcard[]} />}
                    {mode === "quiz" && <QuizViewer quizItems={output as QuizItem[]} layout={quizLayout} />}
                    {mode === "infographic" && <InfographicViewer data={output as unknown as InfographicContent} />}
                  </div>
                ) : isLoading ? (
                  <div className="w-full h-full animate-in fade-in duration-500 overflow-auto custom-scrollbar pt-8">
                    {mode === "mindmap" && <MindmapSkeleton />}
                    {(mode === "flashcards" || mode === "quiz" || mode === "infographic") && <ListSkeleton />}
                    {mode === "summary" && <SummarySkeleton />}
                  </div>
                ) : (
                  <div className="text-center space-y-8 max-w-sm animate-in">
                    <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-indigo-500/10 rounded-2xl animate-[spin_12s_linear_infinite]" />
                      <div className="absolute inset-3 border border-indigo-500/30 rounded-xl animate-[spin_6s_linear_infinite_reverse]" />
                      <div className="h-4 w-4 bg-indigo-500 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.6)]" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
                        {mode === "mindmap" ? "Your thinking space" : "Visualize your thoughts"}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed font-medium">
                        {mode === "mindmap"
                          ? "Paste text to generate a structured mind map instantly."
                          : `Paste your notes to build a structured ${mode} instantly with our AI brain.`}
                      </p>
                    </div>
                    <div className="inline-flex flex-col gap-6 items-center">
                      <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-full">
                        <span className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">
                          {isLoading ? "Thinking..." : "WAITING FOR INPUT"}
                        </span>
                      </div>

                      {!user && !isLoading && (
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="flex flex-col items-center gap-4 group p-8 rounded-3xl border border-dashed border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 transition-all animate-in fade-in zoom-in duration-500"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <Icons.Lock />
                          </div>
                          <div className="text-center">
                            <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1">Login Required</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Join MindMint for free to start generating and saving your projects.</p>
                          </div>
                          <div className="mt-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-500/20">
                            Sign In Free
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div >
      </main >

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        mode={mode}
        content={output || ''}
        isPro={true} // Export is intentionally free for all users
        title={currentTitle}
        onUpgradeClick={() => { }}
      />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {
        toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )
      }
    </div >
  );
}