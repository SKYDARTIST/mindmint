"use client";

interface Props {
  data: string;
}

export default function SummaryViewer({ data }: Props) {
  return (
    <div className="p-8 w-full animate-in">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
          {data}
        </div>
      </div>
    </div>
  );
}
