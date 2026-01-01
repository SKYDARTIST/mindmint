import { NextResponse } from "next/server";
import { generateContent } from "@/lib/generateService";
import { validateInputLength } from "@/lib/validation";
import { checkCooldown, UserPlan } from "@/lib/rateLimit";
import {
    getClientIP,
    checkDemoLimit,
    decrementDemoTries,
    isDemoModeAllowed
} from "@/lib/demoTracking";

export async function POST(req: Request) {
    try {
        const { input, mode, layout, plan, lastTimestamp, currentTimestamp, isDemo } = await req.json();

        if (!input || !mode) {
            return NextResponse.json(
                { ok: false, error: "Input and mode are required." },
                { status: 400 }
            );
        }

        // Demo Mode Handling
        if (isDemo || !plan) {
            const clientIP = getClientIP(req);

            // Check if mode is allowed for demo users
            if (!isDemoModeAllowed(mode)) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "Sign up free to unlock Flashcards, Quizzes, and more!",
                        requiresAuth: true
                    },
                    { status: 403 }
                );
            }

            // Check demo limit
            const { allowed, remaining } = checkDemoLimit(clientIP);
            if (!allowed) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "Demo limit reached! Sign up free to get 3 generations per day.",
                        demoLimitReached: true,
                        remaining: 0
                    },
                    { status: 429 }
                );
            }

            // Validate input length (demo users use free tier limits)
            const validation = validateInputLength(input, 'free');
            if (!validation.valid) {
                return NextResponse.json(
                    { ok: false, error: validation.message },
                    { status: 400 }
                );
            }

            // Generate content for demo user
            const data = await generateContent(mode, input, layout, 'free');

            // Decrement demo tries
            const newRemaining = decrementDemoTries(clientIP);

            return NextResponse.json({
                ok: true,
                data,
                isDemo: true,
                demoTriesRemaining: newRemaining
            });
        }

        // Authenticated User Flow (existing logic)
        const userPlan = (plan || 'free') as UserPlan;
        const cooldownResult = checkCooldown(userPlan, lastTimestamp, currentTimestamp || Date.now());

        if (cooldownResult !== "ALLOWED") {
            return NextResponse.json(
                { ok: false, error: cooldownResult },
                { status: 429 }
            );
        }

        // Feature Gating Check
        if (userPlan === 'free' && mode === 'infographic') {
            return NextResponse.json(
                { ok: false, error: "Infographics are a Pro feature! Please upgrade to access this tool." },
                { status: 403 }
            );
        }

        // Validate input length based on plan
        const validation = validateInputLength(input, plan || 'free');
        if (!validation.valid) {
            return NextResponse.json(
                { ok: false, error: validation.message },
                { status: 400 }
            );
        }

        const data = await generateContent(mode, input, layout, userPlan);

        return NextResponse.json({
            ok: true,
            data
        });
    } catch (err: any) {
        console.error("GENERATE API ERROR:", err);
        return NextResponse.json(
            { ok: false, error: err.message || "Failed to generate content" },
            { status: 500 }
        );
    }
}
