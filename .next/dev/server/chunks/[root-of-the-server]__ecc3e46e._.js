module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/generateService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatForExport",
    ()=>formatForExport,
    "generateContent",
    ()=>generateContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
;
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
const cleanJsonOutput = (text)=>{
    if (!text) return "";
    return text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
};
const sanitizeMermaid = (raw)=>{
    if (!raw) return "";
    const codeBlock = raw.match(/```(?:mermaid|graph)?\s*([\s\S]*?)```/i);
    let inner = codeBlock ? codeBlock[1].trim() : raw.trim();
    inner = inner.replace(/:::/g, "");
    inner = inner.replace(/<!--[\s\S]*?-->/g, "");
    inner = inner.replace(/^\s*```+/gm, "");
    inner = inner.replace(/\[\[\[(.*?)\]\]\]/g, '["$1"]');
    // Allow 'mindmap' keyword for classic radial layouts if specifically requested
    // but default to graph TD for others if missing structure.
    if (!/^graph\s+(TD|LR|TB|RL)/i.test(inner) && !/^flowchart/i.test(inner) && !/^mindmap/i.test(inner)) {
        if (inner.includes("-->")) inner = `graph TD\n${inner}`;
    }
    return inner.trim();
};
const generateContent = async (mode, inputText, layout = 'classic')=>{
    if (!inputText || typeof inputText !== 'string') throw new Error("Input text is required");
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
    let systemInstruction = "You are a helpful AI assistant.";
    let userPrompt = "";
    let isJson = false;
    switch(mode){
        case "summary":
            systemInstruction = `You are a summarization engine for an educational app called MindMint.

Your goal:
- Produce summaries that are accurate, concise, and strictly grounded in the input text.

Global rules:
- Use ONLY information present in the input.
- Do NOT add new ideas, interpretations, or external knowledge.
- Do NOT change the meaning of the original text.
- If something is unclear or weakly stated, exclude it.
- Accuracy is more important than completeness.

Summary behavior:
- Focus on ideas, not individual actions.
- Merge repetitive or closely related points into a single summary item.
- Preserve the original tone where possible (informative, reflective, or explanatory).
- Avoid academic filler words (e.g., “consequently,” “moreover,” “individuals”).
- Keep language simple and creator-friendly.`;
            const summaryPrompts = {
                executive: `Write 2–3 concise sentences.
- Present the core idea and key message.
- Tone should be clear, neutral, and professional.
- No bullet points.
- No extra explanations.`,
                bullet: `Write 5–8 bullet points.
- Each bullet = one distinct idea from the input.
- Each bullet should be short and factual.
- No repetition.
- No added context beyond the input.`,
                study_notes: `Organize content using short headings.
- Under each heading, add 2–4 concise sub-points.
- Structure must reflect the input text's structure.
- Do not invent headings not supported by the input.`
            };
            userPrompt = `${summaryPrompts[layout] || summaryPrompts.executive}

Text:
${inputText}`;
            break;
        case "mindmap":
            systemInstruction = "You are an expert at Mermaid.js diagrams. You create clean, academic diagrams for study. Focus on hierarchy and clarity.";
            const mindmapPrompts = {
                classic: "mindmap (Radial). Use the 'mindmap' keyword. Best for central concepts with balanced branches.",
                categorized: "graph TD (Categorized). Use subgraphs to group related nodes into vertical blocks. This keeps the diagram compact and avoids horizontal overflow.",
                flow: "graph LR (Linear Flow). Left-to-right progression. Ideal for step-by-step processes or timelines."
            };
            userPrompt = `Generate a valid Mermaid.js diagram for the following layout: ${mindmapPrompts[layout] || mindmapPrompts.classic}.
      RULES:
      1. For classic, use 'mindmap' root. Use indentations for branches.
      2. For tree/flow, use 'graph TD' or 'graph LR'. Use id["Label"] for nodes. Keep labels concise.
      3. Use clear, logical connections (-->).
      4. Output ONLY the code block.
      
      Text:\n${inputText}`;
            break;
        case "flashcards":
            isJson = true;
            systemInstruction = `You are a flashcard generation expert focused on extracting key learnings from text.

Your goal: Help users understand and remember the MOST IMPORTANT points from the input.

Core Rules:
- Extract only information explicitly stated in the input text
- Break down complex ideas into simple, digestible flashcards
- Focus on key insights, main concepts, and important details
- Each flashcard should test ONE specific piece of knowledge
- Use clear, concise language
- DO NOT add external knowledge or examples not in the text
- DO NOT copy entire paragraphs - extract the essence

Quality Guidelines:
- Front: A focused prompt, question, or concept (keep it short and clear)
- Back: The key information or answer (concise but complete)
- Aim for 6-10 high-quality cards that capture the core message`;
            const flashcardPrompts = {
                classic: `Create flashcards that extract the main ideas and important details.
Format: 
- Front: Clear question or prompt about a key concept
- Back: Concise answer with the essential information
Focus on what someone needs to understand and remember from this text.`,
                concept: `Extract the key terms, concepts, and their meanings.
Format:
- Front: The important term, phrase, or concept
- Back: Its definition, explanation, or significance from the text
Perfect for vocabulary, terminology, and core ideas.`,
                cloze: `Create fill-in-the-blank cards from important statements.
Format:
- Front: A key sentence with [...] replacing a critical term or phrase
- Back: Just the missing word(s)
Use complete sentences from the text that contain important information.`
            };
            userPrompt = `${flashcardPrompts[layout] || flashcardPrompts.classic}

Output Format (JSON array):
[
  {
    "question": "Front of card",
    "answer": "Back of card", 
    "tag": "Brief topic keyword from the text"
  }
]

Input text:
${inputText}`;
            break;
        case "quiz":
            isJson = true;
            systemInstruction = `You are a professional assessment creator.
Your goal is to generate 6-10 high-quality quiz items that help users master the input material.
Output MUST be a valid JSON array of objects.`;
            const quizPrompts = {
                classic: `Create standard Multiple Choice Questions (MCQs).
Each item must have:
- "type": "multiple-choice"
- "question": A clear, informative question
- "options": Exactly 4 plausible options
- "correctAnswer": The exact string from "options" that is correct
- "explanation": A helpful sentence explaining why it's correct and why others are wrong.`,
                speed: `Create True/False questions for rapid knowledge verification.
Each item must have:
- "type": "true-false"
- "question": A decisive statement that is either Factually True or False
- "options": ["True", "False"]
- "correctAnswer": Either "True" or "False"
- "explanation": A brief confirmation of the fact.`,
                scenario: `Create thought-provoking scenario-based questions or short-answer insights.
Each item must have:
- "type": "short-answer" or "multiple-choice"
- "question": An applied scenario or a deeper conceptual question
- "options": 4 options if multiple-choice, or empty array if short-answer
- "correctAnswer": The best response
- "explanation": A detailed breakdown of the logic/reasoning.
- "meta": { "skill": "Analysis" or "Application" }`
            };
            userPrompt = `${quizPrompts[layout] || quizPrompts.classic}

Text:
${inputText}`;
            break;
        case "infographic":
            isJson = true;
            systemInstruction = `You are an infographic content engine for an educational app called MindMint.

GLOBAL RULES:
- Use ONLY information present in the input text.
- Do NOT add new facts, explanations, examples, or external knowledge.
- Do NOT infer missing steps or relationships.
- Accuracy is more important than completeness.
- Infographics must simplify structure, not expand content.
- Keep text short, visual, and scannable. No full paragraphs.
- No emojis. No commentary.

Output MUST be a valid JSON object matching:
{
  "title": "Short catchy title",
  "tagline": "Brief secondary line",
  "layout": "step_by_step" | "process_flow" | "comparison",
  "steps": [
    { "title": "...", "description": "1 concise supporting line (optional)" }
  ]
}`;
            const infographicPrompts = {
                step_by_step: `MODE: STEP_BY_STEP
- Extract a linear sequence of steps explicitly stated or clearly ordered in the input.
- Each item represents one concrete action or stage.
- Maintain original order from the input text.
- Do NOT invent steps. Do NOT merge unrelated actions.`,
                process_flow: `MODE: PROCESS_FLOW
- Identify inputs, transformations, and outcomes described in the input.
- Represent relationships as cause → effect or flow stages.
- Each stage describes what changes or happens.
- Do NOT assume hidden processes.`,
                comparison: `MODE: COMPARE_BREAKDOWN
- Identify explicit comparisons, contrasts, or components in the input.
- Output either side-by-side differences or a breakdown of parts.
- Each section must be supported by the input text.
- Do NOT add pros/cons unless explicitly stated.`
            };
            userPrompt = `${infographicPrompts[layout] || infographicPrompts.step_by_step}

INPUT TEXT:
${inputText}`;
            break;
    }
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: systemInstruction
            },
            {
                role: "user",
                content: userPrompt
            }
        ],
        temperature: 0.7
    });
    const content = completion.choices[0]?.message?.content || "";
    if (isJson) {
        try {
            return JSON.parse(cleanJsonOutput(content));
        } catch (e) {
            console.error("JSON Parse Error", e);
            throw new Error("Failed to parse AI output as JSON");
        }
    }
    if (mode === "mindmap") return sanitizeMermaid(content);
    return content;
};
const formatForExport = async (mode, content, exportMode)=>{
    if (!content) throw new Error("Content to export is required");
    const systemInstruction = `You are an export formatting engine for an app called MindMint.

Your task:
- Prepare content for export as a PDF or image.
- Preserve the content exactly as generated.
- Do NOT add, remove, rewrite, or interpret any information.
- Export is a visual snapshot, not a transformation.

GLOBAL RULES:
- Use ONLY the provided content.
- Do NOT introduce titles, captions, footers, or explanations unless explicitly provided.
- Do NOT summarize or expand.
- Do NOT change wording.
- Maintain original structure and order.
- Accuracy and fidelity are mandatory.

EXPORT MODE: ${exportMode}

FORMAT RULES:
- Keep layout clean, readable, and uncluttered.
- Ensure clear spacing between sections.
- Text must be legible at standard zoom levels.
- Avoid decorative elements.
- No emojis.
- No icons unless already present in the content.
- No branding additions.

CONTENT-SPECIFIC RULES:
- Summaries: preserve paragraphs, bullets, or headings exactly.
- Flashcards: export each card distinctly with clear front/back separation.
- Infographics: preserve steps, flows, or comparisons as structured blocks.
- Mindmaps: preserve hierarchy and relationships without reinterpreting them.

FAILURE HANDLING:
- If content is too large, split across pages or frames without altering content.
- Never compress meaning to fit a page.
- Never guess or auto-correct.

OUTPUT:
- Return export-ready structured content only.
- No commentary about the export.
- No UI instructions.`;
    const userPrompt = `CONTENT TO EXPORT:
${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}`;
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: systemInstruction
            },
            {
                role: "user",
                content: userPrompt
            }
        ],
        temperature: 0
    });
    return completion.choices[0]?.message?.content || "";
};
}),
"[project]/app/api/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$generateService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/generateService.ts [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        const { input, mode, layout } = await req.json();
        if (!input || !mode) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: "Input and mode are required."
            }, {
                status: 400
            });
        }
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$generateService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateContent"])(mode, input, layout);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            data
        });
    } catch (err) {
        console.error("GENERATE API ERROR:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: err.message || "Failed to generate content"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ecc3e46e._.js.map