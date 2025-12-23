import { NextResponse } from "next/server";
import { generateContent } from "@/lib/generateService";

export async function POST(req: Request) {
    try {
        const { input, mode, layout } = await req.json();

        if (!input || !mode) {
            return NextResponse.json(
                { ok: false, error: "Input and mode are required." },
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
