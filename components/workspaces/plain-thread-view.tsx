"use client";

import { useState } from "react";
import type { Thread } from "@/lib/types";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export function PlainThreadView({ thread }: { thread: Thread }) {
  const lastFrom = thread.messages[thread.messages.length - 1].from.name;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-10 pb-12 pt-12">
          <h1 className="text-xl text-zinc-800">{thread.subject}</h1>

          <div className="mt-10 space-y-8">
            {thread.messages.map((m) => (
              <div key={m.id}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <div>
                    <span className="font-medium text-zinc-800">
                      {m.from.name}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    {formatDate(m.date)}
                  </div>
                </div>
                <div className="whitespace-pre-wrap font-sans text-[15px] leading-7 text-zinc-700">
                  {m.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ReplyBox replyingTo={lastFrom} />
    </div>
  );
}

function ReplyBox({ replyingTo }: { replyingTo: string }) {
  const [draft, setDraft] = useState("");

  return (
    <div className="border-t border-zinc-200 bg-zinc-50/60 px-10 py-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-indigo-500/10">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder={`Reply to ${replyingTo}…`}
            className="block w-full resize-none bg-transparent px-3 py-2.5 text-[14px] leading-6 text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
          />
          <div className="flex items-center justify-between border-t border-zinc-100 px-2 py-1.5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Reply
            </div>
            <button
              type="button"
              disabled={draft.trim().length === 0}
              className="rounded-md bg-zinc-900 px-3 py-1 text-[12px] font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
