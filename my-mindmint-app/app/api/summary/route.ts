import { NextResponse } from "next/server";
import OpenAI from "openai";

// TASK 1: Rate Limiting (5 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

// TASK 4: Duplicate Rapid Request Protection (same input within 10 seconds)
const duplicateRequestMap = new Map<string, { input: string; timestamp: number }>();

function getClientIP(request: Request): string {
  // Get IP from headers (works with Vercel, Netlify, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  return forwarded?.split(',')[0]?.trim() ||
         realIP ||
         clientIP ||
         'unknown';
}

export async function POST(req: Request) {
  const clientIP = getClientIP(req);
  const now = Date.now();

  try {
    const { input, layout } = await req.json();

    // TASK 3: Empty / Invalid Input Protection
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { ok: false, error: "Input is required." },
        { status: 400 }
      );
    }

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return NextResponse.json(
        { ok: false, error: "Input is required." },
        { status: 400 }
      );
    }

    // TASK 2: Input Length Guardrail (5,000 characters max)
    if (trimmedInput.length > 5000) {
      return NextResponse.json(
        { ok: false, error: "Input too long. Please shorten your text." },
        { status: 400 }
      );
    }

    // TASK 1: Rate Limiting (5 requests per minute per IP)
    const rateLimit = rateLimitMap.get(clientIP);
    if (rateLimit) {
      // Reset counter if more than 1 minute has passed
      if (now - rateLimit.timestamp > 60000) {
        rateLimitMap.set(clientIP, { count: 1, timestamp: now });
      } else if (rateLimit.count >= 5) {
        return NextResponse.json(
          { ok: false, error: "Too many requests. Please wait a moment." },
          { status: 429 }
        );
      } else {
        rateLimit.count++;
      }
    } else {
      rateLimitMap.set(clientIP, { count: 1, timestamp: now });
    }

    // TASK 4: Duplicate Rapid Request Protection (same input within 10 seconds)
    const duplicateKey = `${clientIP}:${trimmedInput}`;
    const lastDuplicate = duplicateRequestMap.get(duplicateKey);
    if (lastDuplicate && now - lastDuplicate.timestamp < 10000) {
      return NextResponse.json(
        { ok: false, error: "Duplicate request. Please wait before retrying." },
        { status: 429 }
      );
    }
    duplicateRequestMap.set(duplicateKey, { input: trimmedInput, timestamp: now });

    // All validations passed - proceed with OpenAI call
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPromptMap: Record<string, string> = {
      executive:
        "Write a concise executive summary in 3–4 sentences. No bullets.",
      bullet:
        "Write 5–7 concise bullet points highlighting key ideas.",
      notes:
        "Write informal study notes with short lines and clear takeaways.",
      infostructured:
        "Write a structured summary with headings and sections.",
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPromptMap[layout] ?? systemPromptMap.executive,
        },
        {
          role: "user",
          content: trimmedInput,
        },
      ],
    });

    return NextResponse.json({
      ok: true,
      data: {
        content: completion.choices[0].message.content,
        layout: layout
      }
    });
  } catch (err) {
    console.error("SUMMARY API ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
