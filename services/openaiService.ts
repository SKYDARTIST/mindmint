import OpenAI from "openai";
import { AppMode, MindmapLayout, FlashcardLayout, QuizLayout, SummaryLayout, InfographicLayout } from "../types";

// Server-side only OpenAI client
// This service should only be used in server actions or API routes

// Check if OpenAI API key is available and valid
const hasValidApiKey = typeof process !== 'undefined' && process.env &&
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY.trim() !== '' &&
  process.env.OPENAI_API_KEY !== 'PLACEHOLDER_OPENAI_API_KEY' &&
  process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' &&
  process.env.OPENAI_API_KEY !== 'your_api_key_here' &&
  process.env.OPENAI_API_KEY !== 'YOUR_API_KEY_HERE';

// Initialize OpenAI client only if we have a valid API key
const openai = hasValidApiKey && typeof process !== 'undefined' && process.env ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// --- Helpers ---

const cleanJsonOutput = (text: string): string => {
  if (!text) return "";
  let clean = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
  return clean;
};

const sanitizeMermaid = (raw: string): string => {
  if (!raw) return "";
  const codeBlock = raw.match(/```(?:mermaid|graph)?\s*([\s\S]*?)```/i);
  let inner = codeBlock ? codeBlock[1].trim() : raw.trim();
  
  // Basic cleanup
  inner = inner.replace(/:::/g, "");
  inner = inner.replace(/<!--[\s\S]*?-->/g, "");
  inner = inner.replace(/^\s*```+/gm, "");
  inner = inner.replace(/\[\[\[(.*?)\]\]\]/g, '["$1"]');
  inner = inner.replace(/^\s*mindmap\s*$/i, "graph TD");
  
  if (/^\s*mindmap\s*\n/i.test(inner)) {
    inner = inner.replace(/^\s*mindmap\s*\n/i, "graph TD\n");
  }
  
  if (!/^graph\s+(TD|LR|TB|RL)/i.test(inner) && !/^flowchart/i.test(inner)) {
    const lines = inner.split("\n").filter(l => l.trim());
    if (lines.length > 0 && lines[0].includes("-->")) {
       inner = `graph TD\n${inner}`;
    }
  }

  return inner.trim();
};

const generateMermaidFallback = (text: string): string => {
  if (!text) return "";
  const parts = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => p.split(/(?<=[.?!])\s+/))
    .map((s) => s.replace(/["'`]/g, "").trim())
    .filter(Boolean)
    .slice(0, 8); 

  if (!parts.length) return "";
  const ids = parts.map((_, i) => `N${i}`);
  const nodes = ids.map((id, i) => `${id}["${parts[i].slice(0, 50)}"]`).join("\n");
  const links = ids.slice(0, -1).map((id, i) => `${id} --> ${ids[i + 1]}`).join("\n");
  return `graph TD\n${nodes}\n${links}`;
};

// Mock data generators for demo mode
const generateMockMindmap = (text: string, layout: string): string => {
  const topics = text.split(/\n+/).filter(line => line.trim()).slice(0, 6);
  const center = topics[0] ? topics[0].slice(0, 30) : "Main Topic";
  
  if (layout === 'radial') {
    return `graph TD
    A[${center}]
    B[${topics[1]?.slice(0, 20) || 'Sub Topic 1'}]
    C[${topics[2]?.slice(0, 20) || 'Sub Topic 2'}]
    D[${topics[3]?.slice(0, 20) || 'Sub Topic 3'}]
    E[${topics[4]?.slice(0, 20) || 'Sub Topic 4'}]
    F[${topics[5]?.slice(0, 20) || 'Sub Topic 5'}]
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F`;
  } else if (layout === 'flow') {
    return `graph LR
    A[${center}]
    B[${topics[1]?.slice(0, 20) || 'Topic 1'}]
    C[${topics[2]?.slice(0, 20) || 'Topic 2'}]
    D[${topics[3]?.slice(0, 20) || 'Topic 3'}]
    A --> B --> C --> D`;
  } else {
    return `graph TD
    A[${center}]
    B[${topics[1]?.slice(0, 20) || 'Key Point 1'}]
    C[${topics[2]?.slice(0, 20) || 'Key Point 2'}]
    D[${topics[3]?.slice(0, 20) || 'Key Point 3'}]
    E[${topics[4]?.slice(0, 20) || 'Detail 1'}]
    F[${topics[5]?.slice(0, 20) || 'Detail 2'}]
    A --> B
    A --> C
    A --> D
    B --> E
    C --> F`;
  }
};

const generateMockFlashcards = (text: string, layout: string) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 10);
  return sentences.map((sentence, i) => ({
    question: `What is the main point about "${sentence.trim().slice(0, 40)}..."?`,
    answer: sentence.trim(),
    tag: `Topic ${Math.floor(i / 3) + 1}`
  }));
};

const generateMockQuiz = (text: string, layout: string) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 8);
  return sentences.map((sentence, i) => ({
    type: i % 3 === 0 ? "true-false" : "multiple-choice",
    question: `Based on the text, what does "${sentence.trim().slice(0, 50)}..." suggest?`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A",
    explanation: sentence.trim(),
    meta: { difficulty: "medium", style: layout }
  }));
};

const generateMockInfographic = (text: string, layout: string) => {
  const topics = text.split(/\n+/).filter(line => line.trim()).slice(0, 5);
  return {
    title: topics[0] || "Demo Infographic",
    tagline: "This is a demo infographic generated from your input text",
    layout: layout,
    steps: topics.map((topic, i) => ({
      title: topic.trim().slice(0, 30) || `Step ${i + 1}`,
      description: `Demo description for step ${i + 1}`,
      icon: ["star", "arrow", "check", "heart", "target"][i % 5],
      accent: ["blue", "green", "purple", "orange", "red"][i % 5]
    }))
  };
};

const generateMockSummary = (text: string, layout: string) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).slice(0, 5);
  const mainPoints = sentences.map(s => s.trim()).join(' ');
  
  switch (layout) {
    case 'bullet':
      return mainPoints.split(/\n/).map(point => `• ${point.trim()}`).join('\n');
    case 'executive':
      return `## Executive Summary\n\n**Main Thesis:** ${mainPoints.slice(0, 100)}...\n\n**Key Findings:**\n${sentences.slice(0, 3).map(s => `- ${s.trim()}`).join('\n')}`;
    case 'story':
      return `## Story Summary\n\n${mainPoints}`;
    default:
      return `## Summary\n\n${mainPoints}`;
  }
};

export const generateContent = async (
  mode: AppMode,
  inputText: string,
  layout: MindmapLayout | FlashcardLayout | QuizLayout | SummaryLayout | InfographicLayout = 'classic'
): Promise<any> => {
  
  // Ensure inputText is valid
  if (!inputText || typeof inputText !== 'string') {
    console.warn("Invalid input text provided");
    return getFallbackContent(mode, layout);
  }
  
  // Use mock data if no valid API key or no OpenAI client
  if (!hasValidApiKey || !openai) {
    return getMockContent(mode, inputText, layout);
  }

  let systemInstruction = "You are a helpful AI assistant.";
  let userPrompt = `Text:\n${inputText}`;
  let isJson = false;

  try {
    switch (mode) {
      case AppMode.MINDMAP:
        systemInstruction = "You are an expert at creating Mermaid.js diagrams.";
        let mindmapInstructions = "";
        
        if (layout === 'flow') mindmapInstructions = "LAYOUT: FLOW (graph LR). Structure: Idea1 --> Idea2.";
        else if (layout === 'radial') mindmapInstructions = "LAYOUT: RADIAL (graph TD). Structure: Main((Center)) --> Sub.";
        else if (layout === 'chain') mindmapInstructions = "LAYOUT: CHAIN (graph TD). Structure: Step1 --> Step2.";
        else if (layout === 'cluster') mindmapInstructions = "LAYOUT: VERTICAL FLOW (graph LR). Root --> Child.";
        else mindmapInstructions = "LAYOUT: CLASSIC (graph TD). Root --> Branch.";

        userPrompt = `Generate a clean, valid Mermaid.js graph code.
        ${mindmapInstructions}
        RULES:
        1. Start with 'graph TD' or 'graph LR'.
        2. Use quotes for labels: id["Label"].
        3. No triple brackets. No 'mindmap' keyword.
        4. Output ONLY the mermaid code block.
        
        Text:\n${inputText}`;
        break;

      case AppMode.FLASHCARDS:
        isJson = true;
        systemInstruction = "You are an expert tutor. Output valid JSON only.";
        let flashcardInst = layout === 'minimal' ? "Simple Q&A." : "Detailed Q&A.";
        userPrompt = `Generate 8-14 flashcards based on the text.
        Style: ${layout}. ${flashcardInst}
        
        Output JSON format only (no markdown):
        [
          { "question": "...", "answer": "...", "tag": "..." }
        ]
        
        Text:\n${inputText}`;
        break;

      case AppMode.QUIZ:
        isJson = true;
        systemInstruction = "You are a quiz master. Output valid JSON only.";
        userPrompt = `Generate 8-12 quiz questions based on the text.
        Layout: ${layout}.
        
        Output JSON format only (no markdown):
        [
          {
            "type": "multiple-choice" | "true-false" | "short-answer" | "fill-gap",
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "...",
            "explanation": "...",
            "meta": { "difficulty": "medium", "style": "${layout}" }
          }
        ]
        
        Text:\n${inputText}`;
        break;
      
      case AppMode.INFOGRAPHIC:
        isJson = true;
        systemInstruction = "You are a data visualization expert. Output valid JSON only.";
        userPrompt = `Generate infographic structured data.
        Layout: ${layout}.
        
        Output JSON format only (no markdown):
        {
          "title": "...",
          "tagline": "...",
          "layout": "${layout}",
          "steps": [
            { "title": "...", "description": "...", "icon": "star|arrow|check|...", "accent": "blue|green|..." }
          ]
        }
        
        Text:\n${inputText}`;
        break;

      case AppMode.SUMMARY:
        systemInstruction = "You are a professional editor. Output clean Markdown.";
        userPrompt = `Summarize the text in this format: ${layout}.
        - executive: Business headers, bold thesis.
        - bullet: Bullet points only.
        - story: Narrative flow.
        - notes: Cornell style (## Headers, - bullets).
        - infostructured: Emoji headers.
        
        Text:\n${inputText}`;
        break;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-efficient model
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: isJson ? 2000 : 1000,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Post-processing
    if (isJson) {
      try {
        const cleanText = cleanJsonOutput(content);
        const parsed = JSON.parse(cleanText);
        // Handle wrapped responses (e.g., if model returns { "cards": [...] } instead of [...])
        if (mode === AppMode.FLASHCARDS && parsed.cards && Array.isArray(parsed.cards)) return parsed.cards;
        if (mode === AppMode.QUIZ && parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
        return parsed;
      } catch (e) {
        console.error("JSON Parse Error", e);
        console.log("Raw OpenAI response:", content);
        // Return fallback content instead of throwing
        return getFallbackContent(mode, layout);
      }
    }

    if (mode === AppMode.MINDMAP) {
      let chart = sanitizeMermaid(content);
      if (!/^graph\s+(TD|LR|TB|RL)/i.test(chart) && !/^flowchart/i.test(chart)) {
         console.warn("Invalid mermaid, using fallback.");
         chart = generateMermaidFallback(inputText);
      }
      return chart;
    }

    return content || getFallbackContent(mode, layout);

  } catch (error) {
    console.error("OpenAI API Error:", error);
    // Return fallback content instead of throwing to prevent crashes
    return getFallbackContent(mode, layout);
  }
};

// Helper function to get mock content
const getMockContent = (mode: AppMode, inputText: string, layout: string) => {
  switch (mode) {
    case AppMode.MINDMAP:
      return generateMockMindmap(inputText, layout);
    case AppMode.FLASHCARDS:
      return generateMockFlashcards(inputText, layout);
    case AppMode.QUIZ:
      return generateMockQuiz(inputText, layout);
    case AppMode.INFOGRAPHIC:
      return generateMockInfographic(inputText, layout);
    case AppMode.SUMMARY:
      return generateMockSummary(inputText, layout);
    default:
      return "Demo content generated successfully.";
  }
};

// Helper function to get fallback content in case of errors
const getFallbackContent = (mode: AppMode, layout: string) => {
  switch (mode) {
    case AppMode.MINDMAP:
      return "graph TD\\nA[Fallback Content]\\nB[Error Handling]\\nA --> B";
    case AppMode.FLASHCARDS:
      return [
        { question: "What happened?", answer: "An error occurred during generation.", tag: "error" }
      ];
    case AppMode.QUIZ:
      return [
        {
          type: "multiple-choice",
          question: "What went wrong?",
          options: ["A. API Error", "B. Network Issue", "C. Unknown Error", "D. All of the above"],
          correctAnswer: "D. All of the above",
          explanation: "An error occurred during content generation.",
          meta: { difficulty: "medium", style: layout }
        }
      ];
    case AppMode.INFOGRAPHIC:
      return {
        title: "Error State",
        tagline: "Content generation failed",
        layout: layout,
        steps: [
          { title: "Error", description: "An error occurred", icon: "error", accent: "red" }
        ]
      };
    case AppMode.SUMMARY:
      return "## Error\\n\\nAn error occurred during content generation. Please try again.";
    default:
      return "Content generation failed. Please try again.";
  }
};