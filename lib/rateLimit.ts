/**
 * Daily Limit Configuration
 */
export const DAILY_GENERATION_LIMIT = 5;

/**
 * Checks if a user is allowed to generate content based on their daily usage.
 * @param dailyUsageCount The number of generations the user has made today.
 * @returns 'ALLOWED' or a user-friendly error message.
 */
export function checkDailyLimit(
    dailyUsageCount: number
): string {
    if (dailyUsageCount >= DAILY_GENERATION_LIMIT) {
        return `You've reached your limit of ${DAILY_GENERATION_LIMIT} generations for today. Come back tomorrow!`;
    }

    return "ALLOWED";
}

/**
 * Helper to check if a timestamp belongs to "today" (UTC).
 */
export function isToday(timestamp: number): boolean {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    const today = new Date();
    return (
        date.getUTCFullYear() === today.getUTCFullYear() &&
        date.getUTCMonth() === today.getUTCMonth() &&
        date.getUTCDate() === today.getUTCDate()
    );
}
