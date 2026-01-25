import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import React from 'react';
import { createRoot } from 'react-dom/client';
import MindmapExportTemplate from '@/components/export/MindmapExportTemplate';

import DocumentExportTemplate from '@/components/export/DocumentExportTemplate';

interface ExportOptions {
    content: string | Record<string, unknown> | unknown[];
    title: string;
    theme: 'light' | 'dark';
    appMode: string;
    pageSize?: 'a4' | 'letter';
    onProgress?: (msg: string) => void;
}

/**
 * Universal Client-Side PDF Generation:
 * - Powered by high-resolution React templates
 * - Captures at 2400px base width
 * - Consistent Zero-Zoom Legibility across all modes
 */
export const generatePDF = async (options: ExportOptions) => {
    const { content, title, theme, appMode, pageSize = 'a4' } = options;

    // 1. Setup multi-page config
    const ITEMS_PER_PAGE: Record<string, number> = {
        'flashcards': 4,
        'quiz': 3,
        'infographic': 4,
        'summary': 1
    };

    // Helper to get items
    const getItems = () => {
        if (appMode === 'mindmap') return [content];
        if (appMode === 'infographic') return (content as Record<string, unknown>).steps as unknown[] || [];
        if (Array.isArray(content)) return content;
        return [content]; // fallback
    };

    const allItems = getItems();
    const batchSize = ITEMS_PER_PAGE[appMode] || 1;
    const totalPages = appMode === 'mindmap' ? 1 : Math.ceil(allItems.length / batchSize);

    // 2. Create a hidden container for the template
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1480px';
    container.style.height = 'auto'; // Let content define height
    container.style.overflow = 'visible'; // Prevent clipping during capture
    document.body.appendChild(container);

    options.onProgress?.('Initializing professional multi-page engine...');

    try {
        const root = createRoot(container);
        const pdf = new jsPDF({
            orientation: appMode === 'mindmap' ? 'landscape' : 'portrait',
            unit: 'mm',
            format: pageSize
        });

        for (let i = 0; i < totalPages; i++) {
            const pageNum = i + 1;
            const startIdx = i * batchSize;
            const endIdx = startIdx + batchSize;
            const itemOffset = startIdx;

            // Slice content for this batch
            let currentBatchContent: unknown[] | Record<string, unknown> = allItems;
            if (appMode !== 'mindmap' && appMode !== 'summary') {
                currentBatchContent = allItems.slice(startIdx, endIdx);
                // For infographic, we need to wrap steps back in the data object
                if (appMode === 'infographic') {
                    currentBatchContent = { ...(content as Record<string, unknown>), steps: currentBatchContent };
                }
            }

            options.onProgress?.(`Rendering page ${pageNum} of ${totalPages}...`);

            // Render current page
            await new Promise<void>((resolve) => {
                root.render(
                    <React.StrictMode>
                        {appMode === 'mindmap' ? (
                            <MindmapExportTemplate
                                content={content}
                                title={title}
                                theme={theme}
                            />
                        ) : (
                            <DocumentExportTemplate
                                content={currentBatchContent}
                                title={title}
                                appMode={appMode}
                                theme={theme}
                                pageNumber={pageNum}
                                totalPages={totalPages}
                                itemOffset={itemOffset}
                            />
                        )}
                    </React.StrictMode>
                );

                const interval = setInterval(() => {
                    const element = container.querySelector('#export-template-root');
                    if (element) {
                        clearInterval(interval);
                        setTimeout(resolve, 1500); // Increased wait for complex mindmaps, fonts & gradients
                    }
                }, 100);
            });

            const templateRoot = container.querySelector('#export-template-root') as HTMLElement;

            // Wait a bit more for layout to settle if needed
            await new Promise(resolve => setTimeout(resolve, 500));

            const actualHeight = templateRoot.offsetHeight;
            const actualWidth = templateRoot.offsetWidth || 1480;

            options.onProgress?.(`Capturing page ${pageNum}...`);

            // Capture at high resolution (3x) for crystal clear results
            const dataUrl = await toPng(templateRoot, {
                quality: 1.0,
                pixelRatio: 2.5, // Reduced slightly to manage memory at high res
                width: actualWidth,
                height: actualHeight,
                cacheBust: true,
                skipFonts: false,
            });

            // Add to PDF
            if (i > 0) pdf.addPage();

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 12; // Professional margin
            const availableWidth = pageWidth - (margin * 2);
            const availableHeight = pageHeight - (margin * 2);

            // Calculate scaling factors for width and height
            const scaleX = availableWidth / actualWidth;
            const scaleY = availableHeight / actualHeight;

            // USE FIT-TO-PAGE SCALING: Smaller of the two scales to ensure no clipping
            const scale = Math.min(scaleX, scaleY);

            const targetWidth = actualWidth * scale;
            const targetHeight = actualHeight * scale;

            // PROFESSIONAL CENTERING: Center both horizontally and vertically
            const xPos = (pageWidth - targetWidth) / 2;
            const yPos = (pageHeight - targetHeight) / 2;

            pdf.addImage(dataUrl, 'PNG', xPos, yPos, targetWidth, targetHeight, undefined, 'FAST');
        }

        // 5. Finalize
        options.onProgress?.('Finalizing PDF document...');
        const fileName = `${title.replace(/\s+/g, '-').toLowerCase()}-export.pdf`;
        pdf.save(fileName);

        options.onProgress?.('Export complete!');

        // 6. Cleanup
        root.unmount();
        if (container.parentNode) {
            document.body.removeChild(container);
        }

    } catch (error) {
        console.error("Client-Side PDF Export failed:", error);
        if (container.parentNode) {
            document.body.removeChild(container);
        }
        throw error;
    }
};
