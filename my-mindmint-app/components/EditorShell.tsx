"use client";

import { useState, useEffect, useRef } from "react";
import type { AppMode, SummaryLayout, MindmapLayout } from "@/types";
import SummaryViewer from "./SummaryViewer";

interface EditorShellProps {
  mode: AppMode;
  layout: SummaryLayout | MindmapLayout;
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
    useState<SummaryLayout>("executive");
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
      } catch {}
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
      // ESC → back to templates
      if (e.key === "Escape" && isInputMode && !loading && !showHelp) {
        e.preventDefault();
        handleReset();
      }

      // CMD / CTRL + ENTER → generate
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

      // ? or CMD/CTRL + / → toggle help
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
  if (mode !== "summary") return;

  const map: Record<MindmapLayout, SummaryLayout> = {
    classic: "executive",
    flow: "bullet",
    layered: "notes",
    chain: "infostructured",
  };

  setSummaryLayout(map[layout as MindmapLayout] ?? "executive");
  setResult(null);
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
              <option value="executive">Executive</option>
              <option value="bullet">Bullet</option>
              <option value="notes">Notes</option>
              <option value="infostructured">Structured</option>
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

              <div className="space-y-3 pt-4">
                <div className="text-xs uppercase tracking-wide text-neutral-400">
                  Start with a template
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <TemplateCard
                    title="Study Notes"
                    desc="Turn class notes into structured understanding."
                    onClick={() =>
                      handleTemplateSelect(
                        "Paste your study notes, textbook content, or lecture material here…"
                      )
                    }
                  />
                  <TemplateCard
                    title="YouTube Summary"
                    desc="Summarize long videos into key ideas."
                    onClick={() =>
                      handleTemplateSelect(
                        "Paste the YouTube transcript or notes here…"
                      )
                    }
                  />
                  <TemplateCard
                    title="Exam Revision"
                    desc="Generate revision-ready summaries."
                    onClick={() =>
                      handleTemplateSelect(
                        "Paste topics or syllabus points here…"
                      )
                    }
                  />
                  <TemplateCard
                    title="Meeting Notes"
                    desc="Convert meetings into clear action items."
                    onClick={() =>
                      handleTemplateSelect(
                        "Paste meeting notes here…"
                      )
                    }
                  />
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
{mode === "summary" && (
  <div className="flex-1 flex flex-col items-center justify-center gap-3">
    {loading ? (
      <div className="text-neutral-400 animate-pulse">
        Generating summary…
      </div>
    ) : result ? (
      <div className="w-full max-w-3xl space-y-6">
    {/* Result title */}
    <h2 className="text-lg font-semibold text-white">
      Summary
    </h2>

    {/* Generated content */}
    {mode === "summary" && <SummaryViewer data={result} />}

    {/* Action buttons */}
    <div className="flex gap-4 text-xs text-neutral-400">
      <button
        onClick={copyPlain}
        className="hover:text-white transition"
      >
        {copied ? "Copied!" : "Copy text"}
      </button>

      <button
        onClick={copyMarkdown}
        className="hover:text-white transition"
      >
        Copy Markdown
      </button>

      <button
        onClick={downloadTxt}
        className="hover:text-white transition"
      >
        Download .txt
      </button>

      <button
        onClick={downloadMd}
        className="hover:text-white transition"
      >
        Download .md
      </button>
    </div>
  </div>
) : (
  <div className="text-neutral-500 text-sm">
  {isInputMode
    ? "Paste your text and generate a summary"
    : "Select a template to begin"}
</div>

)}
  </div>
)}

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

function TemplateCard({
  title,
  desc,
  onClick,
}: {
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-neutral-900 border border-neutral-700 rounded p-4 text-left hover:border-indigo-500 transition"
    >
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs text-neutral-400 mt-1">{desc}</div>
    </button>
  );
}
