/**
 * Demo Tracking System
 * Tracks demo usage by IP address to prevent abuse while allowing
 * non-authenticated users to try MindMint features.
 */

const DEMO_LIMIT = 2; // Total demo tries allowed per IP
const DEMO_RESET_HOURS = 24; // Reset demo counter after 24 hours

// In-memory storage for demo usage
// Format: Map<ipAddress, { tries: number, lastUsed: number }>
const demoUsageMap = new Map<string, { tries: number; lastUsed: number }>();

/**
 * Get the client IP address from request headers
 */
export function getClientIP(request: Request): string {
    // Try various headers that might contain the real IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) {
        // x-forwarded-for can be a comma-separated list, take the first one
        return forwarded.split(',')[0].trim();
    }

    // Fallback to a default (shouldn't happen in production)
    return 'unknown';
}

/**
 * Check if demo usage is allowed for this IP
 * Returns { allowed: boolean, remaining: number }
 */
export function checkDemoLimit(ipAddress: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const usage = demoUsageMap.get(ipAddress);

    if (!usage) {
        // First time user
        return { allowed: true, remaining: DEMO_LIMIT };
    }

    // Check if we should reset (24 hours passed)
    const hoursSinceLastUse = (now - usage.lastUsed) / (1000 * 60 * 60);
    if (hoursSinceLastUse >= DEMO_RESET_HOURS) {
        // Reset the counter
        demoUsageMap.delete(ipAddress);
        return { allowed: true, remaining: DEMO_LIMIT };
    }

    // Check if they have tries remaining
    const remaining = DEMO_LIMIT - usage.tries;
    return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining)
    };
}

/**
 * Decrement demo tries for this IP
 * Returns the number of tries remaining
 */
export function decrementDemoTries(ipAddress: string): number {
    const now = Date.now();
    const usage = demoUsageMap.get(ipAddress);

    if (!usage) {
        // First use
        demoUsageMap.set(ipAddress, { tries: 1, lastUsed: now });
        return DEMO_LIMIT - 1;
    }

    // Increment tries and update timestamp
    usage.tries += 1;
    usage.lastUsed = now;
    demoUsageMap.set(ipAddress, usage);

    return Math.max(0, DEMO_LIMIT - usage.tries);
}

/**
 * Get remaining demo tries for this IP
 */
export function getDemoTriesRemaining(ipAddress: string): number {
    const { remaining } = checkDemoLimit(ipAddress);
    return remaining;
}

/**
 * Check if a mode is allowed for demo users
 */
export function isDemoModeAllowed(mode: string): boolean {
    const allowedModes = ['mindmap', 'summary'];
    return allowedModes.includes(mode);
}

/**
 * Cleanup old entries (optional, run periodically)
 * Removes entries older than 48 hours
 */
export function cleanupOldEntries(): void {
    const now = Date.now();
    const maxAge = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

    for (const [ip, usage] of demoUsageMap.entries()) {
        if (now - usage.lastUsed > maxAge) {
            demoUsageMap.delete(ip);
        }
    }
}

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupOldEntries, 60 * 60 * 1000);
}
