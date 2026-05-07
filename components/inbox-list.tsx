"use client";

import type { Thread } from "@/lib/types";

const formatDay = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export function InboxList({
  threads,
  selectedId,
  onSelect,
}: {
  threads: Thread[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col bg-zinc-50/60">
      <div className="border-b border-zinc-200 bg-white px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
          Inbox
        </div>
        <div className="mt-0.5 text-base font-medium text-zinc-900">
          Adaptive
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {threads.map((t) => {
          const last = t.messages[t.messages.length - 1];
          const selected = t.id === selectedId;
          return (
            <li key={t.id}>
              <button
                onClick={() => onSelect(t.id)}
                className={
                  "block w-full border-b border-zinc-200/70 px-5 py-4 text-left transition-colors " +
                  (selected
                    ? "bg-white shadow-[inset_3px_0_0_rgba(79,70,229,1)]"
                    : "hover:bg-white/70")
                }
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className={
                      "min-w-0 flex-1 truncate text-sm " +
                      (t.unread ? "font-semibold text-zinc-900" : "font-medium text-zinc-700")
                    }
                  >
                    {t.participants.slice(0, 2).join(", ")}
                    {t.participants.length > 2 && (
                      <span className="text-zinc-400">
                        {" "}
                        +{t.participants.length - 2}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-zinc-400">
                    {formatDay(last.date)}
                  </span>
                </div>
                <div
                  className={
                    "mt-0.5 truncate text-[13px] " +
                    (t.unread ? "text-zinc-800" : "text-zinc-600")
                  }
                >
                  {t.subject}
                </div>
                <div className="mt-1 line-clamp-2 text-[12px] leading-snug text-zinc-500">
                  {t.preview}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
