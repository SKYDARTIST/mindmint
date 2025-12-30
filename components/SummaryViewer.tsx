"use client";

import React, { useMemo } from "react";

interface Props {
  data: string;
}

export default function SummaryViewer({ data }: Props) {
  // Defensive: strip markdown symbols from the first line if they slip through
  const sanitizedData = useMemo(() => {
    if (!data) return "";
    const lines = data.split('\n');
    if (lines.length > 0) {
      lines[0] = lines[0].replace(/[#*`_~]/g, "").trim();
    }
    return lines.join('\n');
  }, [data]);

  return (
    <div className="p-8 w-full animate-in">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
          {sanitizedData}
        </div>
      </div>
    </div>
  );
}
