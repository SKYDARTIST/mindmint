'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { sanitizeMermaidContent } from '@/lib/export/sanitizer';

interface ExportMindmapRendererProps {
    chart: string;
    theme?: 'light' | 'dark';
}

/**
 * Export-Only Mindmap Renderer:
 * - Static layout (No zoom, no pan)
 * - Auto-height container (Fills content)
 * - Maximum readability at 100% zoom
 * - Optimized for PDF/Image capture
 */
const ExportMindmapRenderer: React.FC<ExportMindmapRendererProps> = ({
    chart,
    theme = 'dark'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const renderChart = useCallback(async () => {
        if (!chart) return;

        try {
            const isDark = theme === 'dark';
            const sanitized = sanitizeMermaidContent(chart);

            // Initialize mermaid with specific export-only settings
            mermaid.initialize({
                startOnLoad: false,
                theme: isDark ? 'dark' : 'neutral',
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
                    mindmapLineColor: '#818CF8',
                    nodeBkg: '#1e1b4b',
                    nodeTextColor: '#FFFFFF',
                    fontSize: '24px', // Larger for crisp exports
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
                    fontSize: '24px',
                },
                flowchart: {
                    useMaxWidth: false,
                    htmlLabels: true,
                    curve: 'basis',
                    padding: 40,
                },
                mindmap: {
                    useMaxWidth: false,
                    padding: 40,
                }
            });

            const id = `export-p-${Math.random().toString(36).substr(2, 5)}`;
            const { svg: svgContent } = await mermaid.render(id, sanitized);

            const parser = new DOMParser();
            const doc = parser.parseFromString(svgContent, "image/svg+xml");
            const svgEl = doc.documentElement;

            // Static Export Adjustments
            svgEl.style.width = '100%';
            svgEl.style.height = 'auto';
            svgEl.style.display = 'block';
            svgEl.style.margin = 'auto';
            svgEl.style.maxWidth = '100%';

            const finalSvg = new XMLSerializer().serializeToString(svgEl);
            setSvg(finalSvg);
            setError(null);
        } catch (err: any) {
            console.error("Export Render Error:", err);
            setError("Failed to render export diagram.");
        }
    }, [chart, theme]);

    useEffect(() => {
        renderChart();
    }, [renderChart]);

    return (
        <div
            className="w-full h-auto flex items-center justify-center p-8"
            ref={containerRef}
            id="export-static-canvas"
        >
            {error ? (
                <div className="text-red-500 font-bold uppercase tracking-widest">{error}</div>
            ) : (
                <div
                    className="w-full animate-in fade-in duration-700"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            )}

            <style jsx global>{`
                /* EXPORT OPTIMIZATION ENGINE */
                
                #export-static-canvas .mermaid .node rect, 
                #export-static-canvas .mermaid .node polygon, 
                #export-static-canvas .mermaid .node circle, 
                #export-static-canvas .mermaid .node ellipse,
                #export-static-canvas .mermaid .node path,
                #export-static-canvas .mermaid .mindmap-node rect,
                #export-static-canvas .mermaid .mindmap-node path {
                    stroke-width: 6px !important; /* Thick lines for print */
                    rx: 24px !important;
                    ry: 24px !important;
                    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2));
                }

                #export-static-canvas .mermaid .node .label, 
                #export-static-canvas .mermaid .node text,
                #export-static-canvas .mermaid .mindmap-node text {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 800 !important;
                    font-size: 26px !important; /* Extremely readable */
                    letter-spacing: -0.01em !important;
                }

                /* Thick High-Contrast Connections */
                #export-static-canvas .mermaid .edgePath path,
                #export-static-canvas .mermaid .mindmap-edge {
                    stroke-width: 8px !important;
                    stroke: ${theme === 'dark' ? '#818CF8' : '#4F46E5'} !important;
                    opacity: 1 !important;
                }

                /* Marker/Arrowhead Scaling */
                #export-static-canvas .mermaid .marker {
                    fill: ${theme === 'dark' ? '#818CF8' : '#4F46E5'} !important;
                    scale: 1.5;
                }

                /* Center Node Ultra-premium */
                #export-static-canvas .mermaid .node:first-child rect,
                #export-static-canvas .mermaid .node:first-child path,
                #export-static-canvas .mermaid .mindmap-node.mindmap-node--root rect,
                #export-static-canvas .mermaid .mindmap-node.mindmap-node--root path {
                    stroke-width: 12px !important;
                    fill: ${theme === 'dark' ? '#312e81' : '#EEF2FF'} !important;
                }

                #export-static-canvas .mermaid .node:first-child text,
                #export-static-canvas .mermaid .mindmap-node.mindmap-node--root text {
                    font-size: 36px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.08em !important;
                }
            `}</style>
        </div>
    );
};

export default ExportMindmapRenderer;
