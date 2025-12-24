import { NextResponse } from "next/server";
import { generateContent } from "@/lib/generateService";
import { validateInputLength } from "@/lib/validation";
import { checkCooldown, UserPlan } from "@/lib/rateLimit";

export async function POST(req: Request) {
    try {
        const { input, mode, layout, plan, lastTimestamp, currentTimestamp } = await req.json();

        if (!input || !mode) {
            return NextResponse.json(
                { ok: false, error: "Input and mode are required." },
                { status: 400 }
            );
        }

        // 1. Rate Limiting Check
        const userPlan = (plan || 'free') as UserPlan;
        const cooldownResult = checkCooldown(userPlan, lastTimestamp, currentTimestamp || Date.now());

        if (cooldownResult !== "ALLOWED") {
            return NextResponse.json(
                { ok: false, error: cooldownResult },
                { status: 429 }
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

        const data = await generateContent(mode, input, layout);

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
