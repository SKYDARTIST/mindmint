import { NextResponse } from "next/server";
import { generateContent } from "@/lib/generateService";
import { validateInputLength } from "@/lib/validation";
import { checkCooldown, UserPlan } from "@/lib/rateLimit";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { sanitizeInput } from "@/lib/security";
import {
    getClientIP,
    checkDemoLimit,
    decrementDemoTries,
    isDemoModeAllowed
} from "@/lib/demoTracking";

export async function POST(req: Request) {
    try {
        const { input, mode, layout, currentTimestamp, isDemo } = await req.json();

        if (!input || !mode) {
            return NextResponse.json(
                { ok: false, error: "Input and mode are required." },
                { status: 400 }
            );
        }

        // 🛡️ Sanitize user input against prompt injection
        const sanitizedInput = sanitizeInput(input);

        // 1. Authenticate and verify plan server-side
        const authHeader = req.headers.get("Authorization");
        let user: { uid: string } | null = null;

        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                user = await adminAuth.verifyIdToken(token);
            } catch (err) {
                console.error("Auth Token Verification Failed:", err);
            }
        }

        let userPlan: UserPlan = 'free';
        let dbLastTimestamp: number | null = null;

        if (user) {
            const docRef = adminDb.collection('user_plans').doc(user.uid);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                const planData = docSnap.data();
                userPlan = (planData?.plan as UserPlan) || 'free';
                if (planData?.last_generation_at) {
                    dbLastTimestamp = new Date(planData.last_generation_at).getTime();
                }
            }
        }

        // Demo Mode Handling
        if (!user && (isDemo || !authHeader)) {
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
            const { allowed } = checkDemoLimit(clientIP);
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
            const validation = validateInputLength(sanitizedInput, 'free');
            if (!validation.valid) {
                return NextResponse.json(
                    { ok: false, error: validation.message },
                    { status: 400 }
                );
            }

            // Generate content for demo user
            const data = await generateContent(mode, sanitizedInput, layout, 'free');

            // Decrement demo tries
            const newRemaining = decrementDemoTries(clientIP);

            return NextResponse.json({
                ok: true,
                data,
                isDemo: true,
                demoTriesRemaining: newRemaining
            });
        }

        // Reverify auth if not in demo mode
        if (!user) {
            return NextResponse.json(
                { ok: false, error: "Session expired. Please sign in again." },
                { status: 401 }
            );
        }

        // 🛡️ Cooldown Check using Database Timestamp (prevents spoofing)
        const cooldownResult = checkCooldown(userPlan, dbLastTimestamp, currentTimestamp || Date.now());

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

        // Validate input length based on verified plan
        const validation = validateInputLength(sanitizedInput, userPlan);
        if (!validation.valid) {
            return NextResponse.json(
                { ok: false, error: validation.message },
                { status: 400 }
            );
        }

        const data = await generateContent(mode, sanitizedInput, layout, userPlan);

        // 🛡️ Update the database timestamp after successful generation
        await adminDb.collection('user_plans').doc(user.uid).update({
            last_generation_at: new Date().toISOString()
        });

        return NextResponse.json({
            ok: true,
            data
        });
    } catch (err) {
        console.error("GENERATE API ERROR:", err);
        const message = err instanceof Error ? err.message : "Failed to generate content";
        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 }
        );
    }
}
