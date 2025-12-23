import { NextRequest, NextResponse } from "next/server";
import { formatForExport } from "@/lib/generateService";

export async function POST(req: NextRequest) {
    try {
        const { content, mode, appMode } = await req.json();

        if (!content || !mode || !appMode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Note: In a production environment, we would also verify the user's Pro status here 
        // using an auth session and database check.

        const formattedContent = await formatForExport(appMode, content, mode);

        return NextResponse.json({ ok: true, data: formattedContent });
    } catch (error: any) {
        console.error("Export API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to format for export" }, { status: 500 });
    }
}
