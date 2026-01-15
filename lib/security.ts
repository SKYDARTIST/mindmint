/**
 * Security utilities for MindMint AI
 */

/**
 * Strips common LLM instruction hijacking patterns to protect against Prompt Injection.
 */
export function sanitizeInput(text: string): string {
    if (!text) return "";

    // Patterns used to "override" or "ignore" system instructions
    const injectionPatterns = [
        /ignore all (previous|above) instructions/gi,
        /forget all (previous|above) instructions/gi,
        /you are now a(n)?/gi,
        /stop being an assistant/gi,
        /new instruction:/gi,
        /system override/gi,
        /\[SYSTEM\]/g,
        /\{SYSTEM\}/g
    ];

    let sanitized = text;
    for (const pattern of injectionPatterns) {
        sanitized = sanitized.replace(pattern, "[REDACTED_INJECTION_ATTEMPT]");
    }

    // Limit maximum length to prevent DoS via huge inputs
    return sanitized.substring(0, 50000);
}
