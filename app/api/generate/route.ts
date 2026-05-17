import { NextResponse } from "next/server";
import { generateContent } from "@/lib/generateService";
import { checkDailyLimit, isToday, DAILY_GENERATION_LIMIT } from "@/lib/rateLimit";
import { sanitizeInput } from "@/lib/security";
import { validateInputLength } from "@/lib/validation";
import { generateDemoContent } from "@/lib/demoContent";
import { isDemoMode } from "@/lib/demoMode";

const VALID_MODES = ['summary', 'mindmap', 'flashcards', 'quiz', 'infographic'];
const VALID_LAYOUTS: Record<string, string[]> = {
    summary: ['concept_overview', 'bullet', 'study_notes'],
    mindmap: ['classic', 'categorized', 'flow'],
    flashcards: ['standard', 'detailed', 'quick'],
    quiz: ['classic', 'speed', 'scenario'],
    infographic: ['step_by_step', 'process_flow', 'comparison'],
};

export async function POST(req: Request) {
    try {
        const { input, mode, layout } = await req.json();

        if (!input || !mode) {
            return NextResponse.json(
                { ok: false, error: "Input and mode are required." },
                { status: 400 }
            );
        }

        // Validate mode against allowlist
        if (!VALID_MODES.includes(mode)) {
            return NextResponse.json(
                { ok: false, error: "Invalid mode." },
                { status: 400 }
            );
        }

        // Validate layout against allowlist per mode
        const validLayouts = VALID_LAYOUTS[mode] || [];
        const safeLayout = validLayouts.includes(layout) ? layout : validLayouts[0];

        // Sanitize user input against prompt injection
        const sanitizedInput = sanitizeInput(input);

        // Validate input length server-side (600-word limit for free tier)
        const lengthCheck = validateInputLength(sanitizedInput, 'free');
        if (!lengthCheck.valid) {
            return NextResponse.json(
                { ok: false, error: lengthCheck.message },
                { status: 400 }
            );
        }

        if (isDemoMode()) {
            return NextResponse.json({
                ok: true,
                data: generateDemoContent(mode, sanitizedInput, safeLayout),
                usageRemaining: DAILY_GENERATION_LIMIT,
                demo: true,
            });
        }

        // Authenticate server-side
        const { adminAuth, adminDb } = await import("@/lib/firebase/admin");
        const { FieldValue } = await import("firebase-admin/firestore");
        const authHeader = req.headers.get("Authorization");
        let user: { uid: string } | null = null;

        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                user = await adminAuth.verifyIdToken(token);
            } catch {
                // Token invalid
            }
        }

        if (!user) {
            return NextResponse.json(
                { ok: false, error: "Authentication required. Please sign in free!", requiresAuth: true },
                { status: 401 }
            );
        }

        // Atomic rate limit check using Firestore transaction (prevents race condition)
        const docRef = adminDb.collection('user_plan_usage').doc(user.uid);

        const transactionResult = await adminDb.runTransaction(async (transaction) => {
            const docSnap = await transaction.get(docRef);

            let dailyUsageCount = 0;

            if (docSnap.exists) {
                const usageData = docSnap.data();
                const lastGenerationAt = usageData?.last_generation_at
                    ? new Date(usageData.last_generation_at).getTime()
                    : null;

                if (lastGenerationAt && isToday(lastGenerationAt)) {
                    dailyUsageCount = usageData?.daily_count || 0;
                }
            }

            const limitResult = checkDailyLimit(dailyUsageCount);
            if (limitResult !== "ALLOWED") {
                return { allowed: false, error: limitResult, count: dailyUsageCount };
            }

            // Atomically increment BEFORE calling OpenAI (optimistic counting)
            transaction.set(docRef, {
                daily_count: FieldValue.increment(1),
                last_generation_at: new Date().toISOString()
            }, { merge: true });

            return { allowed: true, count: dailyUsageCount + 1 };
        });

        if (!transactionResult.allowed) {
            return NextResponse.json(
                { ok: false, error: transactionResult.error },
                { status: 429 }
            );
        }

        // Generate content
        const data = await generateContent(mode, sanitizedInput, safeLayout, 'free');

        return NextResponse.json({
            ok: true,
            data,
            usageRemaining: DAILY_GENERATION_LIMIT - transactionResult.count
        });
    } catch (err) {
        console.error("GENERATE API ERROR:", err);

        return NextResponse.json(
            { ok: false, error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        );
    }
}
