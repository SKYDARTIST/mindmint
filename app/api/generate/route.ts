import { NextResponse } from "next/server";
import { generateContent } from "@/lib/generateService";
import { checkDailyLimit, isToday } from "@/lib/rateLimit";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { sanitizeInput } from "@/lib/security";

export async function POST(req: Request) {
    try {
        const { input, mode, layout } = await req.json();

        if (!input || !mode) {
            return NextResponse.json(
                { ok: false, error: "Input and mode are required." },
                { status: 400 }
            );
        }

        // 🛡️ Sanitize user input against prompt injection
        const sanitizedInput = sanitizeInput(input);

        // 1. Authenticate server-side
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

        if (!user) {
            return NextResponse.json(
                { ok: false, error: "Authentication required. Please sign in free!", requiresAuth: true },
                { status: 401 }
            );
        }

        let dailyUsageCount = 0;
        let lastGenerationAt: number | null = null;

        const docRef = adminDb.collection('user_plan_usage').doc(user.uid);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const usageData = docSnap.data();
            lastGenerationAt = usageData?.last_generation_at ? new Date(usageData.last_generation_at).getTime() : null;

            // Reset counter if it's a new day
            if (lastGenerationAt && isToday(lastGenerationAt)) {
                dailyUsageCount = usageData?.daily_count || 0;
            }
        }

        // 🛡️ Daily Limit Check
        const limitResult = checkDailyLimit(dailyUsageCount);

        if (limitResult !== "ALLOWED") {
            return NextResponse.json(
                { ok: false, error: limitResult },
                { status: 429 }
            );
        }

        // Generate content (everyone uses 'free' tier limits for input length but has access to all modes)
        const data = await generateContent(mode, sanitizedInput, layout, 'free');

        // 🛡️ Update the database usage count and timestamp
        const newUsageCount = dailyUsageCount + 1;
        await adminDb.collection('user_plan_usage').doc(user.uid).set({
            daily_count: newUsageCount,
            last_generation_at: new Date().toISOString()
        }, { merge: true });

        return NextResponse.json({
            ok: true,
            data,
            usageRemaining: 5 - newUsageCount
        });
    } catch (err) {
        console.error("GENERATE API ERROR:", err);
        let message = err instanceof Error ? err.message : "Failed to generate content";

        if (message.includes('5 NOT_FOUND') || message.includes('project_id')) {
            message = "Database Error: Please ensure Firestore is enabled in your Firebase Console.";
        }

        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 }
        );
    }
}
