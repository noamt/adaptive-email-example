import { promises as fs } from "node:fs";
import path from "node:path";
import type { InterpretationResult } from "./types";

// On serverless platforms (Vercel, AWS Lambda, etc) the filesystem outside
// /tmp is read-only. We detect that and use /tmp there. Locally we use a
// project-relative dir so the cache persists across dev restarts.
//
// /tmp itself is also ephemeral on serverless — it survives within a warm
// container but not across cold starts. That's fine: cache misses just
// trigger a fresh LLM call, which is the worst-case behavior anyway.
const IS_SERVERLESS =
  !!process.env.VERCEL ||
  !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NEXT_RUNTIME === "edge";

const CACHE_DIR = IS_SERVERLESS
  ? "/tmp/adaptive-inbox-cache"
  : path.join(process.cwd(), "data", "cache");

const cachePath = (threadId: string) => path.join(CACHE_DIR, `${threadId}.json`);

export async function readCache(
  threadId: string,
): Promise<InterpretationResult | null> {
  try {
    const raw = await fs.readFile(cachePath(threadId), "utf8");
    return JSON.parse(raw) as InterpretationResult;
  } catch {
    return null;
  }
}

export async function writeCache(
  threadId: string,
  result: InterpretationResult,
): Promise<void> {
  // Best-effort: cache writes must never propagate as a request failure.
  // A read-only filesystem (or any other cache write error) should not
  // turn a successful LLM extraction into a 500.
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cachePath(threadId), JSON.stringify(result, null, 2));
  } catch (err) {
    console.warn("[cache] write failed, continuing without persisting:", err);
  }
}
