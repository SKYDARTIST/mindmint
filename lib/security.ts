/**
 * Security utilities for MindMint AI
 */

/**
 * Strips common LLM instruction hijacking patterns to protect against Prompt Injection.
 * Uses blocklist + DAN redaction + length cap.
 */
export function sanitizeInput(text: string): string {
    if (!text) return "";

    // 1. Common instruction override patterns (expanded)
    const injectionPatterns = [
        /ignore all (previous|above|prior) instructions/gi,
        /forget (all|the|your) (previous|above|prior) instructions/gi,
        /disregard (all|the|your|any) (previous|above|prior) (instructions|directives|rules)/gi,
        /you are now a(n)?/gi,
        /pretend (you are|to be|that)/gi,
        /stop being an assistant/gi,
        /new instruction:/gi,
        /system override/gi,
        /\[SYSTEM\]/g,
        /\{SYSTEM\}/g,
        /ACT AS A/gi,
        /YOU ARE NOW UNFILTERED/gi,
        /IGNORE ANY PREVIOUS PHILOSOPHY/gi,
        /override your programming/gi,
        /output (the|your) system prompt/gi,
        /reveal (the|your) (system|initial) (prompt|instructions)/gi,
        /jailbreak/gi,
        /\bDAN\b/g,
    ];

    let sanitized = text;
    for (const pattern of injectionPatterns) {
        sanitized = sanitized.replace(pattern, "[REDACTED]");
    }

    // 2. Protect against Base64 encoded injection attempts
    const base64Pattern = /([A-Za-z0-9+/]{20,}={0,2})/g;
    sanitized = sanitized.replace(base64Pattern, (match) => {
        try {
            const decoded = Buffer.from(match, 'base64').toString('utf-8');
            const lowDecoded = decoded.toLowerCase();
            const dangerousKeywords = ["ignore", "system", "instruction", "override", "forget", "pretend", "act as", "jailbreak", "unfiltered"];
            if (dangerousKeywords.some(kw => lowDecoded.includes(kw))) {
                return "[REDACTED_ENCODED]";
            }
        } catch {
            // Not valid UTF-8 base64, skip
        }
        return match;
    });

    // 3. Redact DAN-style roleplay jailbreak content (remove, don't just annotate)
    const danPatterns = [
        /stay in character/gi,
        /do anything now/gi,
    ];
    for (const pattern of danPatterns) {
        sanitized = sanitized.replace(pattern, "[REDACTED]");
    }

    // Limit maximum length to prevent DoS via huge inputs
    return sanitized.substring(0, 50000);
}
