"use client";

interface Props {
  data: string;
}

export default function SummaryViewer({ data }: Props) {
  return (
    <div className="p-8 max-w-3xl space-y-4">
      <h2 className="text-2xl font-bold">Summary</h2>
      <pre className="whitespace-pre-wrap text-gray-600 text-sm">
        {data}
      </pre>
    </div>
  );
}
