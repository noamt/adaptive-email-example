import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readCache, writeCache } from "@/lib/cache";
import {
  CLASSIFY_SYSTEM,
  classifyUserMessage,
  extractSystem,
  extractUserMessage,
} from "@/lib/prompts";
import {
  ClassificationSchema,
  ContractStateSchema,
  DealStateSchema,
  EventStateSchema,
} from "@/lib/schemas";
import { THREADS_BY_ID } from "@/lib/threads";
import type { InterpretationResult } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Strip code fences or stray prose so JSON.parse can swallow the body.
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  // Find the first '{' and last '}' to be lenient about leading prose.
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in model output");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

async function classify(threadId: string) {
  const thread = THREADS_BY_ID[threadId];
  const t0 = Date.now();
  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: CLASSIFY_SYSTEM,
    messages: [{ role: "user", content: classifyUserMessage(thread) }],
  });
  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const parsed = ClassificationSchema.parse(extractJson(text));
  return { result: parsed, latency: Date.now() - t0 };
}

async function extract(
  threadId: string,
  workspace: "ContractView" | "DealView" | "EventView",
) {
  const thread = THREADS_BY_ID[threadId];
  const t0 = Date.now();
  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: extractSystem(workspace),
    messages: [{ role: "user", content: extractUserMessage(thread) }],
  });
  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const json = extractJson(text);
  const parsed =
    workspace === "ContractView"
      ? ContractStateSchema.parse(json)
      : workspace === "DealView"
        ? DealStateSchema.parse(json)
        : EventStateSchema.parse(json);
  return { result: parsed, latency: Date.now() - t0 };
}

type Body = {
  threadId: string;
  forceRefresh?: boolean;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { threadId, forceRefresh } = body;
  if (!threadId || !THREADS_BY_ID[threadId]) {
    return NextResponse.json(
      { error: `Unknown threadId: ${threadId}` },
      { status: 400 },
    );
  }

  if (!forceRefresh) {
    const cached = await readCache(threadId);
    if (cached) {
      return NextResponse.json({
        ...cached,
        meta: { ...cached.meta, cached: true },
      } satisfies InterpretationResult);
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  try {
    const classifyOut = await classify(threadId);

    let state: unknown = null;
    let extractLatency: number | null = null;

    if (classifyOut.result.workspace !== "PlainThreadView") {
      try {
        const extractOut = await extract(
          threadId,
          classifyOut.result.workspace,
        );
        state = extractOut.result;
        extractLatency = extractOut.latency;
      } catch (err) {
        // Fall through to PlainThreadView on extraction failure.
        console.error("Extraction failed, falling back to PlainThreadView", err);
        const result: InterpretationResult = {
          classification: {
            workspace: "PlainThreadView",
            rationale:
              "Extraction failed validation — falling back to plain rendering rather than showing partial structured state.",
            constraints_applied: [],
          },
          state: null,
          meta: {
            model: MODEL,
            classify_latency_ms: classifyOut.latency,
            extract_latency_ms: null,
            cached: false,
          },
        };
        await writeCache(threadId, result);
        return NextResponse.json(result);
      }
    }

    const result: InterpretationResult = {
      classification: classifyOut.result,
      state,
      meta: {
        model: MODEL,
        classify_latency_ms: classifyOut.latency,
        extract_latency_ms: extractLatency,
        cached: false,
        cached_at: new Date().toISOString(),
      },
    };

    await writeCache(threadId, result);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Interpret route failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
