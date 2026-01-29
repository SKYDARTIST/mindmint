---
description: Preventing AI markdown blocks from breaking JSON parsing
---

# HWT-AI-01: Markdown Poisoning & JSON Safety

## The Mistake
Asking an AI to "Return JSON" and it returns:
` ```json `
` { "key": "value" } `
` ``` `
Calling `JSON.parse()` on this will crash the backend.

## The Fix
1.  **System Prompt Force:** Explicitly tell the AI: "Output valid JSON only. Do not include markdown code blocks or additional text."
2.  **The Cleaner Helper:** Always run a regex cleaner on the AI response before parsing.

### Implementation Pattern (Backend)
```typescript
function cleanAIResponse(raw: string): string {
  // Remove Markdown code block syntax if present
  return raw.replace(/```json/g, "").replace(/```/g, "").trim();
}

try {
  const cleaned = cleanAIResponse(aiResponse);
  const data = JSON.parse(cleaned);
} catch (e) {
  console.error("Failed to parse AI response:", aiResponse);
  // Fallback or retry logic
}
```

## Audit Questions
- Am I asking the AI for a structured response (JSON/Array)?
- Is there a `try/catch` around the `JSON.parse`?
- Am I using a "Cleaner" function to strip markdown formatting?
