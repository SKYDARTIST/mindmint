import { toPng } from 'html-to-image';
import React from 'react';
import { createRoot } from 'react-dom/client';
import MindmapExportTemplate from '@/components/export/MindmapExportTemplate';
import DocumentExportTemplate from '@/components/export/DocumentExportTemplate';

interface ExportOptions {
    content: string | Record<string, unknown> | unknown[];
    title: string;
    theme: 'light' | 'dark';
    appMode: string;
    onProgress?: (msg: string) => void;
}

/**
 * Universal Client-Side PNG Generation:
 * - Powered by high-resolution React templates
 * - Captures at 1480px base width
 * - Optimized for single-image sharing
 */
export const generateImage = async (options: ExportOptions) => {
    const { content, title, theme, appMode } = options;

    // Helper to get items
    const getItems = () => {
        if (appMode === 'mindmap') return [content];
        if (appMode === 'infographic') return (content as Record<string, unknown>).steps as unknown[] || [];
        if (Array.isArray(content)) return content;
        return [content]; // fallback
    };

    const allItems = getItems();

    // 1. Create a hidden container for the template
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1480px';
    container.style.height = 'auto'; // Let content define height
    container.style.overflow = 'visible';
    document.body.appendChild(container);

    options.onProgress?.('Preparing high-resolution image...');

    try {
        const root = createRoot(container);

        // For multi-page modes, PNG export usually captures just the first "context"
        // or the entire diagram for mindmaps.
        let batchContent: unknown[] | Record<string, unknown> = allItems;
        if (appMode === 'infographic') {
            batchContent = { ...(content as Record<string, unknown>), steps: allItems };
        }

        // Render template
        await new Promise<void>((resolve) => {
            root.render(
                <React.StrictMode>
                    {appMode === 'mindmap' ? (
                        <MindmapExportTemplate
                            content={content as string}
                            title={title}
                            theme={theme}
                        />
                    ) : (
                        <DocumentExportTemplate
                            content={batchContent}
                            title={title}
                            appMode={appMode}
                            theme={theme}
                            pageNumber={1}
                            totalPages={1}
                            itemOffset={0}
                        />
                    )}
                </React.StrictMode>
            );

            const interval = setInterval(() => {
                const element = container.querySelector('#export-template-root');
                if (element) {
                    clearInterval(interval);
                    setTimeout(resolve, 1500); // Wait for fonts/diagrams
                }
            }, 100);
        });

        const templateRoot = container.querySelector('#export-template-root') as HTMLElement;
        const actualHeight = templateRoot.offsetHeight;
        const actualWidth = templateRoot.offsetWidth || 1480;

        options.onProgress?.('Capturing image...');

        // Capture high resolution PNG
        const dataUrl = await toPng(templateRoot, {
            quality: 1.0,
            pixelRatio: 2.0, // Good balance for web images
            width: actualWidth,
            height: actualHeight,
            cacheBust: true,
            skipFonts: false,
        });

        // Download the image
        const fileName = `${title.replace(/\s+/g, '-').toLowerCase()}-export.png`;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();

        options.onProgress?.('Export complete!');

        // Cleanup
        root.unmount();
        if (container.parentNode) {
            document.body.removeChild(container);
        }

    } catch (error) {
        console.error("Client-Side PNG Export failed:", error);
        if (container.parentNode) {
            document.body.removeChild(container);
        }
        throw error;
    }
};
