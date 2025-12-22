"use client";

import { useState } from "react";
import EditorShell from "./EditorShell";
import type { AppMode } from "@/types";

export default function MindMintApp() {
  const [mode, setMode] = useState<AppMode>("summary");

  return (
    <>
      <div className="fixed top-3 right-3 z-50 flex gap-2 text-xs">
        <button
          onClick={() => setMode("summary")}
          className={`px-3 py-1 rounded ${
            mode === "summary"
              ? "bg-white text-black"
              : "bg-neutral-800 text-neutral-400"
          }`}
        >
          Summary
        </button>

        <button
          onClick={() => setMode("mindmap")}
          className={`px-3 py-1 rounded ${
            mode === "mindmap"
              ? "bg-white text-black"
              : "bg-neutral-800 text-neutral-400"
          }`}
        >
          Mindmap
        </button>
      </div>

      <EditorShell
        mode={mode}
        layout={mode === "summary" ? "executive" : "classic"}
      />
    </>
  );
}
