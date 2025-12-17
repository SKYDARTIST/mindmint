'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
  theme?: 'light' | 'dark';
}

// --- Icons ---
const Icons = {
  ZoomIn: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  ZoomOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  Fit: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>,
  Reset: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  Center: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
};

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart, theme = 'light' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Interaction State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Limits
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3.0;

  // Track screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- Rendering Logic ---
  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chart) return;
      
      try {
        const isDark = theme === 'dark';
        const hasClusters = chart.includes('subgraph');

        // Responsive Chart Transformation
        let processedChart = chart;
        
        if (isMobile) {
          if (!hasClusters) {
             processedChart = processedChart
              .replace(/^\s*graph TD/i, 'graph LR')
              .replace(/^\s*graph TB/i, 'graph LR');
          } else {
             processedChart = processedChart
              .replace(/^\s*graph LR/i, 'graph TD')
              .replace(/^\s*graph RL/i, 'graph TD');
          }
        }

        mermaid.initialize({ 
          startOnLoad: false, 
          theme: 'base',
          securityLevel: 'loose',
          fontFamily: 'Satoshi, Inter, sans-serif',
          themeVariables: isDark ? {
            primaryColor: '#27272A', 
            primaryTextColor: '#FFFFFF',
            primaryBorderColor: '#6E56CF',
            lineColor: '#71717A',
            secondaryColor: '#3F3F46',
            tertiaryColor: '#18181B',
            mainBkg: 'transparent',
            nodeBorder: '#6E56CF',
            clusterBkg: 'rgba(255, 255, 255, 0.05)', 
            clusterBorder: '#8B5CF6', 
            titleColor: '#F4F4F5',
            edgeLabelBackground: '#18181B',
          } : {
            primaryColor: '#f5f3ff',
            primaryTextColor: '#4c1d95',
            primaryBorderColor: '#a78bfa',
            lineColor: '#94a3b8',
            secondaryColor: '#fffbeb',
            tertiaryColor: '#ffffff',
            mainBkg: 'transparent',
            nodeBorder: '#a78bfa',
            clusterBkg: '#fafafa',
            clusterBorder: '#a78bfa',
            titleColor: '#333',
            edgeLabelBackground: '#ffffff',
          },
          flowchart: {
            curve: 'basis',
            padding: 20,
            useMaxWidth: false, 
            htmlLabels: true,
          }
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: svgContent } = await mermaid.render(id, processedChart);
        
        // Post-Processing for Size
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, "image/svg+xml");
        const svgEl = doc.documentElement;

        // Ensure fixed dimensions are set based on viewBox for accurate scaling
        const viewBox = svgEl.getAttribute('viewBox');
        if (viewBox) {
            const [_, __, w, h] = viewBox.split(/[\s,]+/).map(Number);
            svgEl.setAttribute('width', `${w}px`);
            svgEl.setAttribute('height', `${h}px`);
        }
        svgEl.removeAttribute('style');
        svgEl.style.maxWidth = 'none'; // Prevent CSS constraints

        const finalSvg = new XMLSerializer().serializeToString(svgEl);
        
        if (isMounted) {
          setSvg(finalSvg);
          setError(null);
        }
      } catch (err: any) {
        console.error("Mermaid Error:", err);
        if (isMounted) setError("Failed to render diagram.");
      }
    };

    renderChart();
    return () => { isMounted = false; };
  }, [chart, theme, isMobile]);

  // --- Auto-Fit Logic ---
  const handleFit = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    // Find SVG dimensions
    const svgEl = contentRef.current.querySelector('svg');
    if (!svgEl) return;

    // Use viewBox or getBoundingClientRect
    const viewBox = svgEl.getAttribute('viewBox')?.split(/[\s,]+/).map(Number);
    let contentW = 0, contentH = 0;
    
    if (viewBox && viewBox.length >= 4) {
      contentW = viewBox[2];
      contentH = viewBox[3];
    } else {
      contentW = svgEl.clientWidth;
      contentH = svgEl.clientHeight;
    }
    
    if (!contentW || !contentH) return;

    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;
    const padding = 40;

    // Calculate scale to fit
    const scaleX = (containerW - padding) / contentW;
    const scaleY = (containerH - padding) / contentH;
    let newZoom = Math.min(scaleX, scaleY);

    // Constraint: Never shrink text below readable size (approx 0.5 scale minimum preference)
    // If it's a huge map, we accept scrolling instead of tiny text.
    newZoom = Math.max(newZoom, 0.5);
    newZoom = Math.min(newZoom, 1.2); // Don't over-zoom initially

    // Center it
    const newX = (containerW - contentW * newZoom) / 2;
    const newY = (containerH - contentH * newZoom) / 2;

    setZoom(newZoom);
    setPan({ x: newX, y: newY });
  }, [svg]);

  // Trigger Fit on SVG load
  useEffect(() => {
    if (svg) {
        // Short timeout to ensure DOM render
        const t = setTimeout(handleFit, 50);
        return () => clearTimeout(t);
    }
  }, [svg, handleFit]);

  // --- Controls Handlers ---
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));
  };

  const handleReset = () => {
    setZoom(1);
    handleCenter();
  };

  const handleCenter = () => {
    if (!containerRef.current || !contentRef.current) return;
    const svgEl = contentRef.current.querySelector('svg');
    if (!svgEl) return;
    
    const rect = svgEl.getBoundingClientRect();
    // Current rendered size is rect.width / rect.height
    // But better to calculate from base dimensions * zoom
    const viewBox = svgEl.getAttribute('viewBox')?.split(/[\s,]+/).map(Number);
    if (!viewBox) return;
    
    const w = viewBox[2] * zoom;
    const h = viewBox[3] * zoom;
    
    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;
    
    setPan({
        x: (containerW - w) / 2,
        y: (containerH - h) / 2
    });
  };

  // --- Pan Interactions ---
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with left click or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // --- Wheel Zoom ---
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
       // Pinch zoom gesture or Ctrl+Wheel
       e.preventDefault();
       const delta = -e.deltaY * 0.002;
       setZoom(prev => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));
    } else {
       // Standard scroll wheel -> Pan
       // Optional: Pan on wheel if desired, but dragging is implemented.
       // Let's allow vertical wheel to pan vertical, shift+wheel horizontal
       // But 'overflow: hidden' prevents native behavior.
       // Implement custom pan:
       // setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900 text-sm">
        <div className="font-semibold mb-2">Render Error</div>
        {error}
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full bg-white dark:bg-[#1C1C1F] rounded-xl overflow-hidden group select-none"
      ref={containerRef}
      onWheel={handleWheel}
    >
        {/* Canvas Content */}
        <div 
          ref={contentRef}
          className="origin-top-left cursor-grab active:cursor-grabbing w-full h-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out' 
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        {/* Floating Controls */}
        <div className={`
          absolute top-4 right-4 flex flex-col gap-2 
          bg-white/90 dark:bg-[#27272A]/90 backdrop-blur-md 
          p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm
          transition-opacity duration-300
          ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
          <button onClick={() => handleZoom(0.2)} className="control-btn" title="Zoom In">
             <Icons.ZoomIn />
          </button>
          <button onClick={() => handleZoom(-0.2)} className="control-btn" title="Zoom Out">
             <Icons.ZoomOut />
          </button>
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-0.5"></div>
          <button onClick={handleFit} className="control-btn" title="Fit to Screen">
             <Icons.Fit />
          </button>
          <button onClick={handleCenter} className="control-btn" title="Recenter">
             <Icons.Center />
          </button>
          <button onClick={handleReset} className="control-btn" title="Reset 100%">
             <Icons.Reset />
          </button>
        </div>
        
        {/* Helper text for empty canvas */}
        {!svg && (
           <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              {error ? "Error loading diagram" : "Loading..."}
           </div>
        )}

        <style>{`
          .control-btn {
            padding: 6px;
            border-radius: 6px;
            color: #71717A;
            transition: all 0.2s;
          }
          .control-btn:hover {
            background-color: rgba(0,0,0,0.05);
            color: #18181B;
          }
          :global(.dark) .control-btn:hover {
            background-color: rgba(255,255,255,0.1);
            color: #FFFFFF;
          }
        `}</style>
    </div>
  );
};

export default MermaidRenderer;