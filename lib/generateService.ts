import OpenAI from "openai";
import { UserPlan } from "./rateLimit";
import {
    AppMode,
    MindmapLayout,
    FlashcardLayout,
    QuizLayout,
    SummaryLayout,
    InfographicLayout,
    Flashcard,
    QuizItem,
    InfographicContent
} from "../types";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const cleanJsonOutput = (text: string): string => {
    if (!text) return "";
    return text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
};

const sanitizeMermaid = (raw: string): string => {
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

export const generateContent = async (
    mode: AppMode,
    inputText: string,
    layout: any = 'classic',
    userPlan: UserPlan = 'free'
): Promise<any> => {
    if (!inputText || typeof inputText !== 'string') throw new Error("Input text is required");
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const isPro = userPlan === 'pro';

    let systemInstruction = `You are MindMint AI, an educational assistant designed to convert content into structured learning materials.

RULES:
1. Do NOT mention advertising, sponsors, likes, comments, or unrelated chatter.
2. Focus only on the educational or informational core of the content.
3. Remove filler speech, repetition, greetings, and tangents.
4. Use clear, student-friendly language.
5. Structure content for learning, not entertainment.

WORD LIMIT HANDLING:
- If user plan is FREE:
  - Generate output using ONLY the most important concepts.
  - Final output must NOT exceed 600 words.
  - Prioritize: Core ideas, Key explanations, Main conclusions.
  - Intelligently compress long content without losing meaning.

- If user plan is PRO:
  - No word limit.
  - Provide full depth and complete coverage.
  - Include examples, breakdowns, and structured expansion.`;

    let userPrompt = "";
    let isJson = false;

    switch (mode) {
        case "summary":
            const summaryPrompts: Record<string, string> = {
                concept_overview: `Requested output type: SUMMARY (CONCEPT OVERVIEW)
- Explain the core idea clearly and intuitively for a beginner.
- Start with a short paragraph explaining WHAT the concept is and WHY it matters.
- Focus on big-picture understanding, not details.
- Length: 2–4 short paragraphs.
- Output Format: Title, then clear paragraphs.`,
                bullet: `Requested output type: SUMMARY (BULLET)
- Help students revise or skim content quickly.
- Extract 6-12 most important factual points.
- Use concise bullet points only. No long explanations.
- Use bold keywords where helpful.
- Output Format: Title, then bullet list only.`,
                study_notes: `Requested output type: SUMMARY (STUDY NOTES)
- Create structured, detailed notes for long-term understanding.
- Organize content into clear sections with headings.
- Explain concepts step by step.
- Use bullet points within sections where appropriate.
- Include definitions, processes, and key distinctions.
- Maintain an academic but simple tone.
- Output Format: Title, Section headings, then bullets and short explanations.`
            };

            userPrompt = `${summaryPrompts[layout] || summaryPrompts.concept_overview}

Content:
${inputText}`;
            break;

        case "mindmap":
            systemInstruction += `\n\nIf output type = MINDMAP:
- Return a hierarchical structure: Central topic -> Main branches -> Sub-branches.
- Keep labels short and scannable.
- Use ONLY Mermaid.js syntax. For 'classic' use 'mindmap' keyword. For others use 'graph TD'.`;

            const mindmapPrompts: Record<string, string> = {
                classic: "mindmap (Radial layout). Use the 'mindmap' keyword.",
                categorized: "graph TD. Use subgraphs to group related nodes.",
                flow: "graph LR. Left-to-right progression."
            };

            userPrompt = `Generate a valid Mermaid.js diagram for the following: ${mindmapPrompts[layout] || mindmapPrompts.classic}
Content:\n${inputText}`;
            break;

        case "flashcards":
            isJson = true;
            userPrompt = `Requested output type: FLASHCARDS
- Generate question–answer pairs.
- Questions should test understanding, not memorization.
- Aim for 6-10 high-quality cards.

Output Format (JSON array):
[
  {
    "question": "Front of card",
    "answer": "Back of card", 
    "tag": "Brief topic keyword"
  }
]

Content:
${inputText}`;
            break;

        case "quiz":
            isJson = true;
            userPrompt = `Requested output type: QUIZ
- Generate 5–10 items.
- Mix of multiple-choice and true-false or short-answer based on layout.
- Include correct answers and explanations.

Layout Preference: ${layout} (classic: MCQ, speed: T/F, scenario: applied)

Output Format (JSON array):
[
  {
    "type": "multiple-choice" | "true-false" | "short-answer",
    "question": "...",
    "options": ["..."],
    "correctAnswer": "...",
    "explanation": "..."
  }
]

Content:
${inputText}`;
            break;

        case "infographic":
            isJson = true;
            userPrompt = `Requested output type: INFOGRAPHIC
- Output a numbered or step-based visual outline.
- Each step should be short, bold, and visually clear.

Output Format (JSON object):
{
  "title": "...",
  "tagline": "...",
  "layout": "step_by_step" | "process_flow" | "comparison",
  "steps": [
    { "title": "...", "description": "..." }
  ]
}

Content:
${inputText}`;
            break;
    }

    const completion = await openai.chat.completions.create({
        model: isPro ? "gpt-4o" : "gpt-4o-mini",
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
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
export const formatForExport = async (
    mode: AppMode,
    content: any,
    exportMode: 'PDF' | 'IMAGE'
): Promise<string> => {
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
        model: "gpt-4o", // Using a stronger model for better formatting consistency
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
        ],
        temperature: 0, // Set to 0 for maximum fidelity/consistency
    });

    return completion.choices[0]?.message?.content || "";
};
