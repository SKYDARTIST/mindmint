export type UserPlan = 'free' | 'pro';

const COOLDOWNS: Record<UserPlan, number> = {
    free: 30000, // 30 seconds in ms
    pro: 5000,   // 5 seconds in ms
};

/**
 * Checks if a user is allowed to generate content based on their plan and the time of their last generation.
 * @param plan The user's membership plan.
 * @param lastTimestamp The timestamp of the last successful generation in milliseconds.
 * @param currentTimestamp The current timestamp in milliseconds.
 * @returns 'ALLOWED' if the cooldown has expired, or a short, user-friendly error message.
 */
export function checkCooldown(
    plan: UserPlan,
    lastTimestamp: number | null,
    currentTimestamp: number
): string {
    if (!lastTimestamp) return "ALLOWED";

    const cooldown = COOLDOWNS[plan] || COOLDOWNS.free;
    const elapsed = currentTimestamp - lastTimestamp;
    const remaining = cooldown - elapsed;

    if (remaining > 0) {
        const secondsRemaining = Math.ceil(remaining / 1000);
        return `Please wait ${secondsRemaining} second${secondsRemaining === 1 ? "" : "s"} before generating again.`;
    }

    return "ALLOWED";
}
