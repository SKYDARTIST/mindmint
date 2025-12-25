"use client";

import { useState, useEffect, useRef } from "react";
import type {
  AppMode,
  MindmapLayout,
  SummaryLayout,
  FlashcardLayout,
  QuizLayout,
  InfographicLayout,
} from "@/types";

import SummaryViewer from "./SummaryViewer";

interface EditorShellProps {
  mode: AppMode;
  layout:
  | MindmapLayout
  | SummaryLayout
  | FlashcardLayout
  | QuizLayout
  | InfographicLayout;
}

const MAX_CHARS = 5000;

function toMarkdown(text: string) {
  return text
    .split("\n")
    .map((line) =>
      line.startsWith("•") || line.startsWith("-")
        ? `- ${line.replace(/^[-•]\s*/, "")}`
        : line.trim()
    )
    .join("\n");
}

type HistoryItem = {
  id: string;
  layout: SummaryLayout;
  content: string;
};

export default function EditorShell({ mode, layout }: EditorShellProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [summaryLayout, setSummaryLayout] =
    useState<SummaryLayout>("concept_overview");
  const [loading, setLoading] = useState(false);
  const [isInputMode, setIsInputMode] = useState(false);
  const [placeholder, setPlaceholder] = useState("Paste your text here…");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /* ===== LOAD HISTORY ===== */
  useEffect(() => {
    const saved = localStorage.getItem("mindmint-summary-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch { }
    }
  }, []);

  /* ===== SAVE HISTORY ===== */
  useEffect(() => {
    localStorage.setItem(
      "mindmint-summary-history",
      JSON.stringify(history)
    );
  }, [history]);

  /* ===== KEYBOARD SHORTCUTS ===== */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isInputMode && !loading && !showHelp) {
        e.preventDefault();
        handleReset();
      }

      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "Enter" &&
        isInputMode &&
        !loading &&
        input.trim() &&
        input.length <= MAX_CHARS
      ) {
        e.preventDefault();
        handleGenerate();
      }

      if (
        (e.key === "?" && !e.metaKey && !e.ctrlKey) ||
        ((e.metaKey || e.ctrlKey) && e.key === "/")
      ) {
        e.preventDefault();
        setShowHelp((v) => !v);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isInputMode, loading, input, showHelp]);

  /* ===== MAP LAYOUT ===== */
  useEffect(() => {
    if (mode === "summary") {
      setSummaryLayout(layout as SummaryLayout);
      setResult(null);
    }
  }, [layout, mode]);

  const handleTemplateSelect = (nextPlaceholder: string) => {
    setIsInputMode(true);
    setInput("");
    setPlaceholder(nextPlaceholder);
    setResult(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleReset = () => {
    setIsInputMode(false);
    setInput("");
    setResult(null);
    setPlaceholder("Paste your text here…");
  };

  const handleGenerate = async () => {
    if (mode !== "summary") return;
    if (!input.trim() || loading || input.length > MAX_CHARS) return;

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          layout: summaryLayout,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate summary");

      const content = json.data.content as string;
      setResult(content);

      setHistory((h) => [
        { id: crypto.randomUUID(), layout: summaryLayout, content },
        ...h,
      ]);
    } catch (err) {
      setResult(
        err instanceof Error ? `❌ ${err.message}` : "❌ Unknown error"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("mindmint-summary-history");
    setResult(null);
  };

  const copyPlain = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const copyMarkdown = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(toMarkdown(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTxt = () => {
    if (!result) return;
    downloadFile(result, "mindmint-summary.txt");
  };

  const downloadMd = () => {
    if (!result) return;
    downloadFile(toMarkdown(result), "mindmint-summary.md");
  };

  const isOverLimit = input.length > MAX_CHARS;
  const isGenerateDisabled = loading || !input.trim() || isOverLimit;

  if (mode === "mindmap") {
    return (
      <div className="flex h-screen items-center justify-center text-neutral-500">
        Mindmap mode coming soon
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-black text-white">
        {/* LEFT PANEL */}
        <div className="w-[420px] border-r border-neutral-800 p-5 space-y-6 overflow-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isInputMode && (
                <button
                  onClick={handleReset}
                  className="text-neutral-400 hover:text-white transition"
                >
                  ←
                </button>
              )}
              <h2 className="font-semibold text-base">Summary</h2>
            </div>

            <select
              value={summaryLayout}
              onChange={(e) =>
                setSummaryLayout(e.target.value as SummaryLayout)
              }
              className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
            >
              <option value="concept_overview">Concept Overview</option>
              <option value="bullet">Bullet</option>
              <option value="study_notes">Study Notes</option>
            </select>
          </div>

          {!isInputMode ? (
            <>
              {history.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wide text-neutral-400">
                      Recent summaries
                    </div>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-neutral-500 hover:text-red-400 transition"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-1">
                    {history.slice(0, 5).map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setResult(h.content)}
                        className="w-full text-left text-xs text-neutral-300 hover:text-white truncate"
                      >
                        {h.layout.toUpperCase()} —{" "}
                        {h.content.slice(0, 60)}…
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Starter Templates - calm dark cards with icons */}
              <div className="space-y-6 pt-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Start with a template
                  </h3>
                  <p className="text-sm text-gray-400">
                    Choose a starter to auto-focus your content.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Study Notes */}
                  <button
                    onClick={() =>
                      handleTemplateSelect(
                        "Paste your study notes, textbook content, or lecture material here…"
                      )
                    }
                    className="group flex items-start gap-4 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
                  >
                    <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Study Notes</h4>
                      <p className="text-sm text-gray-400">
                        Turn class notes or textbook content into clear, structured understanding.
                      </p>
                    </div>
                  </button>

                  {/* Concept Explainer */}
                  <button
                    onClick={() =>
                      handleTemplateSelect(
                        "Paste the concept or complex topic you want explained simply here…"
                      )
                    }
                    className="group flex items-start gap-4 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
                  >
                    <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Concept Explainer</h4>
                      <p className="text-sm text-gray-400">
                        Understand any topic with clear, step-by-step explanations.
                      </p>
                    </div>
                  </button>

                  {/* Exam Revision */}
                  <button
                    onClick={() =>
                      handleTemplateSelect(
                        "Paste topics or syllabus points here…"
                      )
                    }
                    className="group flex items-start gap-4 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
                  >
                    <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Exam Revision</h4>
                      <p className="text-sm text-gray-400">
                        Generate mindmaps, flashcards, and quizzes for fast revision.
                      </p>
                    </div>
                  </button>

                </div>
              </div>
            </>
          ) : (
            <>
              <textarea
                ref={textareaRef}
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                className="w-full h-48 bg-neutral-900 border border-neutral-700 rounded p-3 text-sm resize-none"
              />

              <div className="flex justify-between text-xs">
                <span
                  className={
                    isOverLimit ? "text-red-400" : "text-neutral-500"
                  }
                >
                  {input.length.toLocaleString()} /{" "}
                  {MAX_CHARS.toLocaleString()} characters
                </span>
                <span className="text-neutral-500">Press ? for help</span>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed py-2 rounded text-sm font-medium"
              >
                {loading ? "Generating…" : "Generate Summary"}
              </button>
            </>
          )}
        </div>

        {/* RIGHT CANVAS */}
        <div className="flex-1 bg-[#0f0f0f] flex items-center justify-center relative overflow-hidden">
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {loading ? (
            <div className="text-neutral-400 animate-pulse text-lg">
              Generating…
            </div>
          ) : result ? (
            <div className="w-full max-w-4xl p-8">
              <SummaryViewer data={result} />

              <div className="flex gap-6 mt-8 text-sm text-neutral-400">
                <button onClick={copyPlain} className="hover:text-white transition">
                  {copied ? "Copied!" : "Copy text"}
                </button>
                <button onClick={copyMarkdown} className="hover:text-white transition">
                  Copy Markdown
                </button>
                <button onClick={downloadTxt} className="hover:text-white transition">
                  Download .txt
                </button>
                <button onClick={downloadMd} className="hover:text-white transition">
                  Download .md
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-2xl font-medium text-white mb-4">
                Visualize your thoughts
              </h3>
              <p className="text-neutral-400 max-w-md mx-auto mb-8">
                Paste your notes to build a structured summary
              </p>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-full px-6 py-3 inline-flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-sm text-neutral-400">WAITING FOR INPUT</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SHORTCUT HELP OVERLAY */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-[360px] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-semibold text-sm">Keyboard shortcuts</div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Generate summary</span>
                <span className="text-neutral-400">⌘ / Ctrl + Enter</span>
              </div>
              <div className="flex justify-between">
                <span>Back to templates</span>
                <span className="text-neutral-400">Esc</span>
              </div>
              <div className="flex justify-between">
                <span>Toggle help</span>
                <span className="text-neutral-400">?</span>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-4 bg-neutral-800 hover:bg-neutral-700 rounded py-1.5 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}