"use client";

import { useState } from "react";
import type { Thread } from "@/lib/types";

export type InboxMode = "day1" | "today";

const formatDay = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
  });
};

// Hand-tuned "after 6 weeks of use" configuration. In a real product this
// would be derived from a per-user model; for the demo it's the artifact
// the user model would produce.
const ADAPTED_ORDER: string[] = [
  "meetup-ai-dev-tools",      // owns these, responds <15min — top
  "personal-amelia-brunch",   // active personal attention
  "contract-hartwell-msa",    // reads carefully but doesn't drive — observer
  "sales-mercer-vail",        // rarely opens — sinks
];

// Auto-labels inferred from this user's behavior (organizer of meetups,
// observer on legal, low engagement on sales, close personal tie). In a real
// product the model would derive these from the user-model features; here
// they're hand-tuned to match the demo narrative.
type AutoLabel = {
  label: string;
  tone: "indigo" | "emerald" | "amber" | "zinc";
};

const ADAPTED_LABELS: Record<string, AutoLabel> = {
  "meetup-ai-dev-tools": { label: "Events", tone: "indigo" },
  "personal-amelia-brunch": { label: "Personal", tone: "emerald" },
  "contract-hartwell-msa": { label: "Legal", tone: "amber" },
  "sales-mercer-vail": { label: "Sales", tone: "zinc" },
};

const TONE_CLASSES: Record<AutoLabel["tone"], string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-800 ring-amber-100",
  zinc: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

// Follow-up nudges. Triggered when a thread's silence breaks the user's own
// response pattern for that kind of thread.
const ADAPTED_NUDGES: Record<string, string> = {
  "contract-hartwell-msa": "follow up",
};

// Sample of what the system auto-archived this week (newsletters, no-reply
// senders, marketing). In a real product these would be live; here they're
// the artifact the auto-archive model would produce.
const AUTO_ARCHIVED: { sender: string; subject: string; reason: string }[] = [
  {
    sender: "The Pragmatic Engineer",
    subject: "What's in this week's issue",
    reason: "newsletter · never opened in 8w",
  },
  {
    sender: "Linear",
    subject: "Your weekly summary",
    reason: "product digest · 0 opens in 6w",
  },
  {
    sender: "Stripe",
    subject: "May invoice receipt",
    reason: "receipt · auto-filed",
  },
  {
    sender: "noreply@typeform.com",
    subject: "New response on AI tools survey",
    reason: "no-reply sender · marketing pattern",
  },
];
const AUTO_ARCHIVED_COUNT = 12; // total this week, of which 4 shown above

export function InboxList({
  threads,
  selectedId,
  onSelect,
  mode,
  onMode,
}: {
  threads: Thread[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  mode: InboxMode;
  onMode: (m: InboxMode) => void;
}) {
  const [archivedOpen, setArchivedOpen] = useState(false);
  const ordered =
    mode === "today"
      ? ADAPTED_ORDER.map((id) => threads.find((t) => t.id === id)).filter(
          (t): t is Thread => !!t,
        )
      : threads;

  return (
    <div className="flex h-full flex-col bg-zinc-50/60">
      <div className="flex h-[44px] shrink-0 items-center border-b border-zinc-200 bg-white/80 px-4 backdrop-blur">
        <div className="text-sm font-medium text-zinc-900">Inbox</div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto">
        {ordered.map((t) => {
          const last = t.messages[t.messages.length - 1];
          const selected = t.id === selectedId;
          const autoLabel = mode === "today" ? ADAPTED_LABELS[t.id] : null;
          const nudge = mode === "today" ? ADAPTED_NUDGES[t.id] : null;
          return (
            <li key={t.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(t.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(t.id);
                }}
                className={
                  "group relative block w-full cursor-pointer border-b border-zinc-200/70 px-5 py-4 text-left transition-colors " +
                  (selected
                    ? "bg-white shadow-[inset_3px_0_0_rgba(79,70,229,1)]"
                    : "hover:bg-white/90")
                }
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className={
                      "min-w-0 flex-1 truncate text-sm " +
                      (t.unread
                        ? "font-semibold text-zinc-900"
                        : "font-medium text-zinc-700")
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

                  {/* Right side. Date visible off-hover; all four actions
                      reveal on hover (Gmail-style). */}
                  <div className="flex shrink-0 items-center gap-0.5">
                    <div className="hidden items-center gap-0.5 group-hover:flex">
                      <IconButton label="Archive">
                        <ArchiveIcon />
                      </IconButton>
                      <IconButton label="Delete">
                        <DeleteIcon />
                      </IconButton>
                      <IconButton label="Mark as unread">
                        <MarkUnreadIcon />
                      </IconButton>
                      <IconButton label="Snooze">
                        <SnoozeIcon />
                      </IconButton>
                    </div>
                    <span className="ml-1 font-mono text-[10px] text-zinc-400 group-hover:hidden">
                      {formatDay(last.date)}
                    </span>
                  </div>
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
                {(autoLabel || nudge) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {autoLabel && (
                      <span
                        className={
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset " +
                          TONE_CLASSES[autoLabel.tone]
                        }
                      >
                        <span className="opacity-50">▸</span>
                        {autoLabel.label}
                      </span>
                    )}
                    {nudge && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] text-amber-700">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <circle
                            cx="8"
                            cy="8.5"
                            r="5.2"
                            stroke="currentColor"
                            strokeWidth="1.3"
                          />
                          <path
                            d="M8 5.8v3l2 1.5"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {nudge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Auto-archive summary — only meaningful in adapted mode */}
      {mode === "today" && (
        <div className="border-t border-zinc-200 bg-zinc-50/60">
          <button
            onClick={() => setArchivedOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-5 py-2.5 text-left transition-colors hover:bg-zinc-100/70"
          >
            <span className="flex items-center gap-2 text-[11px] text-zinc-600">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <rect
                  x="2"
                  y="3"
                  width="12"
                  height="3"
                  rx="0.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M3 6v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M6.5 9h3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-medium">{AUTO_ARCHIVED_COUNT}</span>{" "}
              <span className="text-zinc-500">
                auto-archived this week
              </span>
            </span>
            <span
              className={
                "font-mono text-[10px] text-zinc-400 transition-transform " +
                (archivedOpen ? "rotate-90" : "")
              }
            >
              ▸
            </span>
          </button>

          {archivedOpen && (
            <ul className="border-t border-zinc-200 bg-white/60 px-5 py-2">
              {AUTO_ARCHIVED.map((a, i) => (
                <li
                  key={i}
                  className="border-b border-zinc-100 py-1.5 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-[12px] text-zinc-700">
                      {a.sender}
                    </span>
                  </div>
                  <div className="truncate text-[11px] text-zinc-500">
                    {a.subject}
                  </div>
                  <div className="mt-0.5 text-[10px] italic text-zinc-400">
                    {a.reason}
                  </div>
                </li>
              ))}
              <li className="pt-1.5 text-center text-[10px] text-zinc-400">
                +{AUTO_ARCHIVED_COUNT - AUTO_ARCHIVED.length} more
              </li>
            </ul>
          )}
        </div>
      )}

      {/* Footer toggle — demo affordance for showing Day-1 vs adapted state */}
      <div className="border-t border-zinc-200 bg-white px-4 py-3">
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
          Inbox view
        </div>
        <div className="flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-medium">
          <button
            onClick={() => onMode("day1")}
            className={
              "flex-1 rounded px-2 py-1 transition-colors " +
              (mode === "day1"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700")
            }
          >
            Day 1
          </button>
          <button
            onClick={() => onMode("today")}
            className={
              "flex-1 rounded px-2 py-1 transition-colors " +
              (mode === "today"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700")
            }
          >
            Today
          </button>
        </div>
        <p className="mt-1.5 text-[10px] leading-snug text-zinc-400">
          {mode === "day1"
            ? "Generic inbox. No user-specific adaptation."
            : "Reordered and enriched from 6 weeks of observed behavior."}
        </p>
      </div>
    </div>
  );
}

// ─── Row action icon button ─────────────────────────────────────────────────

function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
    >
      {children}
    </button>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16">
      <rect x="2" y="3" width="12" height="3" rx="0.5" {...stroke} />
      <path d="M3 6v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V6" {...stroke} />
      <path d="M6.5 9h3" {...stroke} />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16">
      <path
        d="M3 5h10M6.2 5V3.5A.5.5 0 0 1 6.7 3h2.6a.5.5 0 0 1 .5.5V5M5 5l.5 8.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5L11 5M7 7.5v4.5M9 7.5v4.5"
        {...stroke}
      />
    </svg>
  );
}

function MarkUnreadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16">
      <rect x="2" y="4" width="12" height="9" rx="1" {...stroke} />
      <path d="M2.5 4.8l5.5 4 5.5-4" {...stroke} />
    </svg>
  );
}

function SnoozeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16">
      <circle cx="8" cy="8.5" r="5.2" {...stroke} />
      <path d="M8 5.8v3l2 1.5" {...stroke} />
    </svg>
  );
}
