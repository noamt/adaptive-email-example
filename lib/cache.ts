import { promises as fs } from "node:fs";
import path from "node:path";
import type { InterpretationResult } from "./types";

const CACHE_DIR = path.join(process.cwd(), "data", "cache");

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
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cachePath(threadId), JSON.stringify(result, null, 2));
}
