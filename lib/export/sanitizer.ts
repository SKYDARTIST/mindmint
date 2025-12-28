/**
 * Robust utility to clean Mermaid labels by decoding HTML entities 
 * and ensuring stable parsing for various layouts (Classic, Flow, Categorized).
 */
export const sanitizeMermaidContent = (content: string): string => {
    if (!content) return "";

    // 1. Deep Decode HTML Entities
    let decoded = content
        .replace(/&quot;/gi, '"')
        .replace(/&amp;quot;/gi, '"')
        .replace(/&amp;amp;/gi, '&')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#39;/gi, "'")
        .replace(/&#34;/gi, '"')
        .replace(/&apos;/gi, "'");

    // 2. Keyword Awareness
    // We must not wrap these in quotes as they are Mermaid syntax structure
    const mermaidKeywords = [
        'graph', 'flowchart', 'subgraph', 'end', 'direction',
        'mindmap', 'TD', 'LR', 'TB', 'BT', 'RL', 'click'
    ];

    // 3. Fix Formatting for stable parsing
    const lines = decoded.split('\n');
    let hasDirection = false;
    let isFlowchart = false;

    // First pass: detection
    lines.forEach(l => {
        const t = l.trim().toLowerCase();
        if (t.startsWith('direction') || t.startsWith('graph td') || t.startsWith('graph lr')) hasDirection = true;
        if (t.startsWith('graph') || t.startsWith('flowchart')) isFlowchart = true;
    });

    const fixedLines = lines.map(line => {
        let trimmed = line.trim();
        if (!trimmed) return line;

        // Preserve indentation
        const indent = line.match(/^\s*/)?.[0] || '';

        // Check if line starts with a keyword or structural command
        const startsWithKeyword = mermaidKeywords.some(k =>
            trimmed.toLowerCase().startsWith(k.toLowerCase())
        );

        // Smart Orientation Injection
        if (isFlowchart && !hasDirection && (trimmed.toLowerCase().startsWith('graph') || trimmed.toLowerCase().startsWith('flowchart'))) {
            return line + '\n' + indent + '    direction TD'; // Force vertical stack for better fit
        }

        // Check if it's a flow connection (A --> B)
        if (trimmed.includes('-->') || trimmed.includes('---') || trimmed.includes('-.')) {
            return line;
        }

        if (startsWithKeyword) {
            return line;
        }

        // Pattern Matcher for Shapes (nodes with labels)
        const shapes = [
            { open: '((', close: '))' },
            { open: '(', close: ')' },
            { open: '[', close: ']' },
            { open: '{{', close: '}}' }
        ];

        for (const shape of shapes) {
            if (trimmed.includes(shape.open) && trimmed.includes(shape.close)) {
                const shapeIdx = trimmed.indexOf(shape.open);
                const nodeID = trimmed.substring(0, shapeIdx).trim();
                const start = shapeIdx + shape.open.length;
                const end = trimmed.lastIndexOf(shape.close);
                let label = trimmed.substring(start, end).trim();

                // Strip visual double-quotes inside shapes (often added by AI)
                label = label.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');

                // Wrap label in single double-quotes for Mermaid safety
                return indent + nodeID + shape.open + '"' + label.replace(/"/g, "'") + '"' + shape.close;
            }
        }

        // Logic for raw labels (root nodes or unshaped nodes in mindmap)
        // If it's a mindmap leaf/node (not a connection), wrap it
        let cleanRoot = trimmed.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');

        // Ensure we don't double wrap or leave structural artifacts
        if (cleanRoot.toLowerCase() === 'mindmap' && lines[0].trim().toLowerCase().startsWith('mindmap')) {
            return ''; // Remove redundant mindmap keywords
        }

        return indent + '"' + cleanRoot.replace(/"/g, "'") + '"';
    }).filter(l => l !== '');

    return fixedLines.join('\n');
};
