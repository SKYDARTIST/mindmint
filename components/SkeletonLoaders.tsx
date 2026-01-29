import React from 'react';

export const MindmapSkeleton = () => (
    <div className="w-full h-full flex items-center justify-center animate-pulse">
        <div className="relative w-64 h-64">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-12 bg-white/10 rounded-xl border border-white/10" />
            <div className="absolute top-1/4 left-1/4 w-16 h-8 bg-white/5 rounded-lg border border-white/5" />
            <div className="absolute top-1/4 right-1/4 w-16 h-8 bg-white/5 rounded-lg border border-white/5" />
            <div className="absolute bottom-1/4 left-1/4 w-16 h-8 bg-white/5 rounded-lg border border-white/5" />
            <div className="absolute bottom-1/4 right-1/4 w-16 h-8 bg-white/5 rounded-lg border border-white/5" />
            {/* Connector lines simulation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-full -translate-y-full w-px h-16 bg-white/10 rotate-45" />
            <div className="absolute top-1/2 left-1/2 translate-x-0 -translate-y-full w-px h-16 bg-white/10 -rotate-45" />
        </div>
    </div>
);

export const ListSkeleton = () => (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center px-6 gap-4">
                <div className="h-10 w-10 bg-white/10 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-white/10 rounded" />
                    <div className="h-2 w-2/3 bg-white/5 rounded" />
                </div>
            </div>
        ))}
    </div>
);

export const SummarySkeleton = () => (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-pulse p-8">
        <div className="h-8 w-1/2 bg-white/10 rounded-lg mx-auto mb-12" />
        <div className="space-y-3">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-11/12 bg-white/5 rounded" />
            <div className="h-4 w-4/5 bg-white/5 rounded" />
        </div>
        <div className="pt-8 space-y-6">
            {[1, 2].map(i => (
                <div key={i} className="space-y-3">
                    <div className="h-5 w-1/4 bg-white/10 rounded" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                </div>
            ))}
        </div>
    </div>
);
