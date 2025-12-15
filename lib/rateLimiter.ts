// Server-side rate limiter utility
// Pure functions only - no side effects on import

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage - initialized lazily
let storage: Map<string, RateLimitEntry> | null = null;

// Initialize storage if needed
function getStorage(): Map<string, RateLimitEntry> {
  if (!storage) {
    storage = new Map();
  }
  return storage;
}

/**
 * Check if a key is rate limited
 * @param key - Unique identifier (e.g., IP address or fallback)
 * @param maxRequests - Maximum requests allowed (default: 8)
 * @param windowMs - Time window in milliseconds (default: 60000)
 * @returns object with rate limit status and remaining info
 */
export function checkRateLimit(
  key: string, 
  maxRequests: number = 8, 
  windowMs: number = 60000
): { limited: boolean; remaining: number; resetTime: number } {
  try {
    const now = Date.now();
    const store = getStorage();
    const entry = store.get(key);

    // If no entry exists, allow the request
    if (!entry) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs
      };
      store.set(key, newEntry);
      return {
        limited: false,
        remaining: maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }

    // If window has expired, reset the counter
    if (now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs
      };
      store.set(key, newEntry);
      return {
        limited: false,
        remaining: maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }

    // Increment counter and check if limit exceeded
    entry.count++;
    if (entry.count > maxRequests) {
      return {
        limited: true,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    return {
      limited: false,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  } catch (error) {
    // If anything goes wrong, allow the request to prevent blocking
    console.warn('Rate limit check failed:', error);
    return {
      limited: false,
      remaining: maxRequests,
      resetTime: Date.now() + 60000
    };
  }
}

/**
 * Get remaining requests for a key
 */
export function getRemainingRequests(key: string, maxRequests: number = 8): number {
  try {
    const store = getStorage();
    const entry = store.get(key);
    
    if (!entry) {
      return maxRequests;
    }

    const now = Date.now();
    if (now > entry.resetTime) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - entry.count);
  } catch (error) {
    console.warn('Get remaining requests failed:', error);
    return maxRequests;
  }
}

/**
 * Get reset time for a key
 */
export function getResetTime(key: string): number {
  try {
    const store = getStorage();
    const entry = store.get(key);
    return entry ? entry.resetTime : Date.now();
  } catch (error) {
    console.warn('Get reset time failed:', error);
    return Date.now();
  }
}

/**
 * Clean up expired entries to prevent memory leaks
 */
export function cleanupRateLimitStore(): void {
  try {
    const store = getStorage();
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  } catch (error) {
    console.warn('Rate limit cleanup failed:', error);
  }
}

/**
 * Generate safe fallback content for rate limit exceeded
 */
export function generateRateLimitFallback(
  mode: string, 
  layout: string, 
  resetTime: number
): any {
  try {
    const waitSeconds = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
    const message = `Please slow down and try again in ${waitSeconds} seconds.`;
    
    // Return safe, serializable fallback content based on mode
    switch (mode) {
      case 'mindmap':
        return `graph TD\nA[Rate Limited]\nB[${message}]\nA --> B`;
        
      case 'flashcards':
        return [
          { 
            question: "Rate limit exceeded", 
            answer: message, 
            tag: "rate-limit" 
          }
        ];
        
      case 'quiz':
        return [
          {
            type: "multiple-choice",
            question: "What's happening?",
            options: ["A. Rate limited", "B. System error", "C. Try again", "D. Wait"],
            correctAnswer: "A. Rate limited",
            explanation: message,
            meta: { difficulty: "easy", style: layout }
          }
        ];
        
      case 'infographic':
        return {
          title: "Rate Limited",
          tagline: message,
          layout: layout,
          steps: [
            { title: "Rate Limit", description: "Too many requests", icon: "clock", accent: "orange" }
          ]
        };
        
      case 'summary':
        return `## Rate Limited\n\n${message}`;
        
      default:
        return message;
    }
  } catch (error) {
    console.warn('Generate rate limit fallback failed:', error);
    return "Please slow down and try again shortly.";
  }
}