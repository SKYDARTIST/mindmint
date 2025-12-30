'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { sanitizeMermaidContent } from '@/lib/export/sanitizer';

interface PresentationRendererProps {
    chart: string;
    theme?: 'light' | 'dark';
    isExport?: boolean; // If true, optimizes for static high-res output
}

/**
 * Presentation-First Renderer:
 * - Fit-to-page logic (No zoom required)
 * - Sharp, readable text at 100%
 * - Unified logic for Screen and PDF
 */
const ZoomButton: React.FC<{ onClick: () => void; children: React.ReactNode; title: string }> = ({ onClick, children, title }) => (
    <button
        onClick={onClick}
        title={title}
        className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-all active:scale-90"
    >
        {children}
    </button>
);

const PresentationRenderer: React.FC<PresentationRendererProps> = ({
    chart,
    theme = 'light',
    isExport = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.2));
    const handleReset = useCallback(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
            e.preventDefault(); // Prevent page scroll when zooming
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(prev => Math.min(Math.max(prev + delta, 0.2), 5));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left-click for dragging
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const renderChart = useCallback(async () => {
        if (!chart) return;

        try {
            const isDark = theme === 'dark';
            const sanitized = sanitizeMermaidContent(chart);

            mermaid.initialize({
                startOnLoad: false,
                theme: isDark ? 'dark' : 'default',
                securityLevel: 'loose',
                fontFamily: 'Inter, sans-serif',
                themeVariables: isDark ? {
                    primaryColor: '#1e1b4b',
                    primaryTextColor: '#FFFFFF',
                    primaryBorderColor: '#818CF8',
                    lineColor: '#FFFFFF',
                    secondaryColor: '#312e81',
                    tertiaryColor: '#1e1b4b',
                    mainBkg: 'transparent',
                    nodeBorder: '#818CF8',
                    mindmapLineColor: '#FFFFFF',
                    nodeBkg: '#1e1b4b',
                    nodeTextColor: '#FFFFFF',
                    fontSize: '16px',
                } : {
                    primaryColor: '#EEF2FF',
                    primaryTextColor: '#1E1B4B',
                    primaryBorderColor: '#4F46E5',
                    lineColor: '#4F46E5',
                    secondaryColor: '#F5F3FF',
                    tertiaryColor: '#FFFFFF',
                    mainBkg: 'transparent',
                    nodeBorder: '#4F46E5',
                    mindmapLineColor: '#4F46E5',
                    nodeBkg: '#EEF2FF',
                    nodeTextColor: '#1E1B4B',
                    fontSize: '16px',
                },
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis',
                    padding: isExport ? 60 : 30,
                },
                mindmap: {
                    useMaxWidth: true,
                    padding: isExport ? 60 : 30,
                }
            });

            const id = `p-${Math.random().toString(36).substr(2, 5)}`;
            const { svg: svgContent } = await mermaid.render(id, sanitized);

            const parser = new DOMParser();
            const doc = parser.parseFromString(svgContent, "image/svg+xml");
            const svgEl = doc.documentElement;

            // Fit-to-Page SVG Optimization
            svgEl.setAttribute('width', '100%');
            svgEl.setAttribute('height', '100%');
            svgEl.style.maxWidth = '100%';
            svgEl.style.maxHeight = '100%';
            svgEl.style.display = 'block';
            svgEl.style.margin = 'auto';

            // Force viewBox to maintain aspect ratio but fill space
            svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            const finalSvg = new XMLSerializer().serializeToString(svgEl);
            setSvg(finalSvg);
            setError(null);
        } catch (err: any) {
            console.error("Presentation Render Error:", err);
            setError("Failed to render diagram.");
        }
    }, [chart, theme, isExport]);

    useEffect(() => {
        renderChart();
    }, [renderChart]); // Re-render chart when renderChart callback changes (which happens if its dependencies change)

    // Reset zoom when chart changes
    useEffect(() => {
        handleReset();
    }, [chart, handleReset]); // Reset zoom and position when chart or handleReset changes

    return (
        <div
            className="w-full h-full flex items-center justify-center overflow-hidden relative select-none"
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={e => e.preventDefault()} // Prevent context menu on right-click for panning
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {error ? (
                <div className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</div>
            ) : (
                <div
                    className={`w-full h-full flex items-center justify-center animate-in fade-in duration-700 p-4 ${isDragging ? '' : 'transition-transform duration-200'}`}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                        transformOrigin: 'center center'
                    }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            )}

            {/* ZOOM CONTROLS */}
            {!isExport && !error && (
                <div className="absolute top-2 left-2 bottom-auto md:top-auto md:bottom-8 md:right-8 flex flex-row md:flex-col items-center md:items-end gap-1.5 md:gap-3 z-50 scale-90 md:scale-100 origin-top-left md:origin-bottom-right" onClick={e => e.stopPropagation()}>
                    <div className="flex flex-row md:flex-col bg-white/90 dark:bg-[#1C1C1F]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl md:rounded-2xl shadow-2xl p-1 gap-1 shadow-indigo-500/10">
                        <ZoomButton onClick={handleZoomIn} title="Zoom In (+)">
                            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </ZoomButton>
                        <div className="w-px h-4 md:w-auto md:h-px bg-gray-200 dark:bg-white/10 mx-1 md:mx-2" />
                        <ZoomButton onClick={handleZoomOut} title="Zoom Out (-)">
                            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </ZoomButton>
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="px-2 py-1.5 md:px-3 md:py-2 bg-white/90 dark:bg-[#1C1C1F]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl shadow-xl text-[9px] md:text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400">
                            {Math.round(zoom * 100)}%
                        </div>
                        <button
                            onClick={handleReset}
                            className="bg-white/90 dark:bg-[#1C1C1F]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl shadow-xl px-2.5 py-1.5 md:px-4 md:py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-1.5 md:gap-2 shadow-indigo-500/10"
                        >
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                            Reset
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
        /* ZERO-ZOOM LEGIBILITY ENGINE */
        
        .mermaid .node rect, 
        .mermaid .node polygon, 
        .mermaid .node circle, 
        .mermaid .node ellipse,
        .mermaid .node path,
        .mermaid .mindmap-node rect,
        .mermaid .mindmap-node path {
          stroke-width: ${isExport ? '4px' : '3px'} !important;
          rx: 20px !important;
          ry: 20px !important;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
        }

        .mermaid .node .label, 
        .mermaid .node text,
        .mermaid .mindmap-node text {
          font-family: 'Inter', sans-serif !important;
          font-weight: 800 !important;
          font-size: ${isExport ? '20px' : '16px'} !important;
          letter-spacing: -0.02em !important;
        }

        /* High-Contrast Connections */
        .mermaid .edgePath path,
        .mermaid .mindmap-edge {
          stroke-width: ${isExport ? '5px' : '3.5px'} !important;
          stroke: ${theme === 'dark' ? '#FFFFFF' : '#4F46E5'} !important;
          opacity: 1 !important;
        }

        /* Marker/Arrowhead Scaling */
        .mermaid .marker {
          fill: ${theme === 'dark' ? '#FFFFFF' : '#4F46E5'} !important;
          stroke: none !important;
          scale: 1.2;
        }

        /* Root Node Premium Emphasis */
        .mermaid .node:first-child rect,
        .mermaid .node:first-child path,
        .mermaid .mindmap-node.mindmap-node--root rect,
        .mermaid .mindmap-node.mindmap-node--root path {
          stroke-width: ${isExport ? '8px' : '5px'} !important;
          filter: drop-shadow(0 0 15px ${theme === 'dark' ? 'rgba(129, 140, 248, 0.6)' : 'rgba(79, 70, 229, 0.3)'}) !important;
        }

        .mermaid .node:first-child text,
        .mermaid .mindmap-node.mindmap-node--root text {
          font-size: ${isExport ? '28px' : '20px'} !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
      `}</style>
        </div>
    );
};

export default PresentationRenderer;
