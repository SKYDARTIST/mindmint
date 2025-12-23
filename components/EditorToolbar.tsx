"use client";

interface EditorToolbarProps {
  input: string;
  setInput: (value: string) => void;
  onGenerate: () => void;
  loading?: boolean;
}

export default function EditorToolbar({
  input,
  setInput,
  onGenerate,
  loading = false,
}: EditorToolbarProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex gap-4 items-center">
      
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your notes here..."
        className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151518] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        rows={3}
      />

      <button
        onClick={onGenerate}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium disabled:opacity-50"
        disabled={!input.trim() || loading}
      >
        {loading ? "Generating…" : "Generate"}
      </button>
    </div>
  );
}
