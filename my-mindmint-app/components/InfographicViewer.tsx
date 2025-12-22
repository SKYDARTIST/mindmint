"use client";

import type { InfographicContent } from "@/types";

interface Props {
  data: InfographicContent;
}

export default function InfographicViewer({ data }: Props) {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <p className="text-gray-500">{data.tagline}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.steps.map((step, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <h3 className="font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
