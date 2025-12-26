export type UserPlan = 'free' | 'pro';

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

export const LIMITS: Record<UserPlan, number> = {
    free: 600,
    pro: 2500,
};

export const MAX_SAVED_ITEMS_FREE = 3;

/**
 * Counts words in a string by splitting on whitespace.
 */
export function getWordCount(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}

/**
 * Validates the length of user's input text based on their plan.
 * Count words by splitting on whitespace.
 */
export function validateInputLength(text: string, plan: UserPlan): ValidationResult {
    if (!text || typeof text !== 'string') {
        return { valid: false, message: "Input text is required." };
    }

    const wordCount = text.trim().split(/\s+/).length;
    const limit = LIMITS[plan] || LIMITS.free;

    if (wordCount > limit) {
        let message = `Your ${plan === 'free' ? 'Free' : 'Pro'} plan is limited to ${limit} words per input.`;

        if (plan === 'free') {
            message = `Your Free plan is limited to 600 words; please upgrade to Pro for longer inputs.`;
        }

        return {
            valid: false,
            message
        };
    }

    return { valid: true };
}
