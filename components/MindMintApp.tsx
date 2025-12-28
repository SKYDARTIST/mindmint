"use client";

import React, { useState, useRef, useEffect } from "react";
import LegalFooter from "./LegalFooter";
import type { AppMode, MindmapLayout, FlashcardLayout, QuizLayout, SummaryLayout, InfographicLayout } from "@/types";
import { getWordCount, LIMITS } from "@/lib/validation";
import BrandLogo from "./BrandLogo";
import SummaryViewer from "./SummaryViewer";
import PresentationRenderer from "./PresentationRenderer";
import FlashcardViewer from "./FlashcardViewer";
import QuizViewer from "./QuizViewer";
import InfographicViewer from "./InfographicViewer";
import ExportModal from "./ExportModal";
import PricingModal from "./PricingModal";
import AuthModal from "./AuthModal";
import Toast from "./Toast";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { MAX_SAVED_ITEMS_FREE } from "@/lib/validation";

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
  const [output, setOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mindmapLayout, setMindmapLayout] = useState<MindmapLayout>("classic");
  const [flashcardLayout, setFlashcardLayout] = useState<FlashcardLayout>("classic");
  const [quizLayout, setQuizLayout] = useState<QuizLayout>("classic");
  const [summaryLayout, setSummaryLayout] = useState<SummaryLayout>("concept_overview");
  const [infographicLayout, setInfographicLayout] = useState<InfographicLayout>("step_by_step");
  const [isPro, setIsPro] = useState(false);
  const [generationsLeft, setGenerationsLeft] = useState(3);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [lastGenerationTimestamp, setLastGenerationTimestamp] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();

    const fetchUserPlan = async (userId: string) => {
      const { data, error } = await supabase
        .from('user_plans')
        .select('plan')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("Error fetching user plan:", error.message);
        // If row doesn't exist, we stay as 'free' (default state)
        return;
      }

      if (data) {
        setIsPro(data.plan === 'pro');
      }
    };

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchUserPlan(user.id);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserPlan(currentUser.id);
        setShowAuthModal(false); // Auto-close modal if we detect user
      } else {
        setIsPro(false);
        setGenerationsLeft(3);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle loading note from URL
  useEffect(() => {
    const noteId = searchParams.get('noteId');
    if (!noteId || !user) return;

    const fetchNote = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_content')
        .select('*')
        .eq('id', noteId)
        .single();

      if (error) {
        console.error("Error fetching note:", error.message);
        setToast({ message: "Failed to load note.", type: "error" });
        return;
      }

      if (data) {
        setMode(data.type as AppMode);
        setOutput(data.content);
        // Clear the URL to avoid reloading the note on every render
        const url = new URL(window.location.href);
        url.searchParams.delete('noteId');
        window.history.replaceState({}, '', url);

        setToast({ message: `Loaded: ${data.title}`, type: "info" });
      }
    };

    fetchNote();
  }, [searchParams, user]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload(); // Simplest way to reset everything
  };


  const handleTemplateSelect = (tpl: typeof STARTER_TEMPLATES[0]) => {
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
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      if (!isPro && (generationsLeft <= 0 || mode === "infographic")) {
        setShowPricingModal(true);
        setIsLoading(false);
        if (mode === "infographic") {
          setToast({ message: "Infographics are a Pro feature!", type: "info" });
        }
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: inputText,
          mode,
          plan: isPro ? 'pro' : 'free',
          layout: mode === "mindmap" ? mindmapLayout : mode === "flashcards" ? flashcardLayout : mode === "quiz" ? quizLayout : mode === "summary" ? summaryLayout : mode === "infographic" ? infographicLayout : "classic",
          lastTimestamp: lastGenerationTimestamp,
          currentTimestamp: Date.now()
        }),
      });

      const result = await res.json();
      if (result.ok) {
        setOutput(result.data);
        setLastGenerationTimestamp(Date.now());
        if (!isPro) setGenerationsLeft(prev => Math.max(0, prev - 1));

        // Auto-save to Supabase if user is logged in
        if (user) {
          const savedTitle = await saveToSupabase(result.data, mode, inputText);
          setCurrentTitle(savedTitle || "");
        } else {
          // Derive a temporary title for non-logged in users (though export might be restricted)
          let derivedTitle = result.data?.title || inputText.split('\n')[0].substring(0, 50).trim() || "Untitled Generation";
          setCurrentTitle(derivedTitle);
        }
      } else {
        setError(result.error || "Failed to generate content");
        if (res.status === 429) {
          // Special handling for rate limiting if needed, e.g. local vibration/shake
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during generation");
    } finally {
      setIsLoading(false);
    }
  };

  const saveToSupabase = async (generatedContent: any, contentType: string, originalInput: string, isManual = false): Promise<string | null> => {
    if (!generatedContent || !user) return null;

    try {
      const supabase = createClient();

      if (!isPro) {
        // Count existing rows for free user
        const { count, error: countError } = await supabase
          .from('user_content')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) {
          console.error("Error checking limits:", countError.message);
        } else if (count !== null && count >= MAX_SAVED_ITEMS_FREE) {
          setToast({ message: `Free limit reached (${MAX_SAVED_ITEMS_FREE} items). Upgrade to save more!`, type: "info" });
          setShowPricingModal(true);
          return null;
        }
      }

      // Derive a title: Use title from content if available, otherwise first few words of input
      let title = "Untitled Generation";

      if (generatedContent && typeof generatedContent === 'object' && 'title' in generatedContent && typeof generatedContent.title === 'string') {
        title = generatedContent.title;
      } else if (Array.isArray(generatedContent)) {
        // For Flashcards or Quiz (which are arrays)
        const prefix = contentType === 'flashcards' ? 'Flashcards' : 'Quiz';
        title = `${prefix}: ${originalInput.split('\n')[0].substring(0, 30).trim() || "Untitled"}`;
      } else if (originalInput) {
        title = originalInput.split('\n')[0].substring(0, 50).trim() || "Untitled Generation";
      }

      const { error } = await supabase
        .from('user_content')
        .insert({
          user_id: user.id,
          title: title,
          content: generatedContent,
          type: contentType
        });

      if (error) {
        console.error("Error auto-saving to Supabase:", error.message);
        if (isManual) setToast({ message: "Failed to save: " + error.message, type: 'error' });
      } else {
        console.log("Successfully auto-saved content to Supabase");
        if (isManual) setToast({ message: "Project saved successfully!", type: 'success' });
      }
      return title;
    } catch (err) {
      console.error("Unexpected error during auto-save:", err);
      if (isManual) setToast({ message: "An unexpected error occurred while saving.", type: 'error' });
      return null;
    }
  };

  // Auto-generate on layout switch if we already have content
  useEffect(() => {
    if ((mode === "mindmap" || mode === "flashcards" || mode === "quiz" || mode === "summary" || mode === "infographic") && inputText.trim() && output && !isLoading) {
      handleGenerate();
    }
  }, [mindmapLayout, flashcardLayout, quizLayout, summaryLayout, infographicLayout]);

  return (
    <div className={`min-h-screen flex flex-col bg-dot-pattern transition-colors duration-500 ${theme === "dark" ? "dark bg-[#09090b] text-white" : "bg-white text-black"}`}>

      {/* FLOATING TOP BAR */}
      <div className="pt-6 px-6">
        <nav className="max-w-[1600px] mx-auto glass-nav rounded-2xl border px-6 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-6">
            <BrandLogo variant="full" size="sm" />
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
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
            <button
              onClick={() => {
                if (isPro) setIsPro(false);
                else setShowPricingModal(true);
              }}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 transition-all rounded-lg border ${isPro
                ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                : "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer"
                }`}
            >
              <Icons.Bolt />
              <span className={`text-xs font-bold ${isPro ? "text-amber-500" : "text-indigo-400"}`}>
                {isPro ? "PRO" : `${generationsLeft} Free runs left`}
              </span>
            </button>

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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col md:flex-row max-w-[1700px] mx-auto w-full gap-4 md:gap-8 p-4 md:p-6 overflow-hidden">

        {/* SIDEBAR - Desktop and Mobile */}
        <aside className={`${showMobileMenu ? 'flex' : 'hidden'} md:flex absolute md:relative inset-0 md:inset-auto z-[20] md:z-auto bg-white dark:bg-[#09090b] md:bg-transparent w-full md:w-56 shrink-0 flex-col justify-between py-8 md:py-4 px-6 md:px-0 scrollbar-hide overflow-y-auto`}>
          <div className="space-y-8">
            <div className="md:hidden flex justify-end">
              <button onClick={() => setShowMobileMenu(false)} className="p-2 text-gray-400 hover:text-white">
                <Icons.Save /> {/* Reusing an icon for close or similar */}
              </button>
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-4">Generate</div>
              <nav className="space-y-1">
                {(["mindmap", "flashcards", "quiz", "summary", "infographic"] as AppMode[]).map((m) => {
                  const isLocked = m === "infographic" && !isPro;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        if (isLocked) {
                          setShowPricingModal(true);
                          return;
                        }
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
                      {isLocked && <Icons.Lock />}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-4">Pro Tools</div>
              <nav className="space-y-1">
                {[
                  { id: 'notes', label: 'My Notes', icon: <Icons.Folder />, onClick: () => { window.location.href = '/notes'; }, visible: !!user, pro: false },
                  { id: 'export', label: 'Export PDF', icon: <Icons.Export />, onClick: () => { setShowExportModal(true); setShowMobileMenu(false); }, visible: true, pro: true },
                  { id: 'save', label: 'Save Project', icon: <Icons.Save />, onClick: () => { saveToSupabase(output, mode, inputText, true); setShowMobileMenu(false); }, visible: true, pro: true },
                ].filter(i => i.visible).map((item) => {
                  const isLocked = item.pro && !isPro;
                  return (
                    <button
                      key={item.id}
                      onClick={isLocked ? () => setShowPricingModal(true) : item.onClick}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${!isLocked
                        ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                        : "text-gray-400 dark:text-gray-500 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/5"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {!isLocked ? (
                        <div className="text-[10px] text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Open</div>
                      ) : <Icons.Lock />}
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
              <div className="text-[10px] text-gray-500 dark:text-gray-600 font-medium tracking-tight">Built by <span className="text-gray-900 dark:text-gray-400 font-bold">Cryptobulla</span></div>
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
                      <span className={getWordCount(inputText) > (isPro ? LIMITS.pro : LIMITS.free) ? "text-red-500" : ""}>
                        {getWordCount(inputText)}
                      </span>
                      <span className="mx-1">/</span>
                      <span>{isPro ? LIMITS.pro : LIMITS.free} words</span>
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
                    {mode === "summary" && <SummaryViewer data={output} />}
                    {mode === "mindmap" && <PresentationRenderer chart={output} theme={theme} />}
                    {mode === "flashcards" && <FlashcardViewer cards={output} />}
                    {mode === "quiz" && <QuizViewer quizItems={output} layout={quizLayout} />}
                    {mode === "infographic" && <InfographicViewer data={output} />}
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
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-full">
                      <span className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">
                        {isLoading ? "Thinking..." : "WAITING FOR INPUT"}
                      </span>
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
        content={output}
        isPro={isPro}
        title={currentTitle}
      />
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onUpgrade={() => {
          setIsPro(true);
          setShowPricingModal(false);
        }}
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