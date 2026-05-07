"use client";

import { useState } from "react";
import { CONSTRAINTS, CONSTRAINTS_BY_ID } from "@/lib/constraints";
import type { InterpretationResult } from "@/lib/types";

export function DifferPanel({
  interpretation,
  loading,
  onRerun,
  collapsed,
  onToggleCollapsed,
}: {
  interpretation: InterpretationResult | null;
  loading: boolean;
  onRerun: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const [stateOpen, setStateOpen] = useState(false);

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center gap-3 border-l border-zinc-200 bg-zinc-950 py-4">
        <button
          onClick={onToggleCollapsed}
          aria-label="Expand developer panel"
          className="rounded border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 4l-4 4 4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Differ
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border-l border-zinc-200 bg-zinc-950 text-zinc-200">
      <div className="flex items-start justify-between border-b border-zinc-800 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Developer panel
          </div>
          <div className="mt-0.5 text-base font-medium text-zinc-100">
            Differ
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
            Demo-only window into the system's interpretation — not part of
            the end-user experience.
          </p>
        </div>
        <button
          onClick={onToggleCollapsed}
          aria-label="Collapse developer panel"
          className="ml-2 rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Section 1 — constraints */}
        <Section title="Developer Intent">
          <ul className="space-y-2.5">
            {CONSTRAINTS.map((c) => {
              const applied = interpretation?.classification.constraints_applied.includes(
                c.id,
              );
              return (
                <li
                  key={c.id}
                  className={
                    "rounded-md border px-3 py-2 transition-colors " +
                    (applied
                      ? "border-indigo-500/40 bg-indigo-500/10"
                      : "border-zinc-800 bg-zinc-900/40")
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <code className="font-mono text-[11px] text-zinc-300">
                      {c.id}
                    </code>
                    {applied && (
                      <span className="rounded-sm bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-indigo-300">
                        applied
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[12px] leading-snug text-zinc-400">
                    {c.description}
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* Section 2 — workspace decision */}
        <Section title="Workspace Decision">
          {loading ? (
            <Loading label="Interpreting thread…" />
          ) : !interpretation ? (
            <Empty>Select a thread to see the decision.</Empty>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  workspace
                </div>
                <div className="mt-0.5 font-mono text-sm text-emerald-400">
                  {interpretation.classification.workspace}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  rationale
                </div>
                <div className="mt-0.5 text-[13px] leading-relaxed text-zinc-200">
                  {interpretation.classification.rationale}
                </div>
              </div>

              {interpretation.classification.constraints_applied.length > 0 && (
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    constraints cited
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {interpretation.classification.constraints_applied.map((id) => (
                      <li key={id} className="text-[12px]">
                        <code className="font-mono text-indigo-300">{id}</code>
                        <span className="ml-2 text-zinc-500">
                          {CONSTRAINTS_BY_ID[id]?.label ?? "(unknown)"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Section 3 — extracted state log */}
        <Section title="Extracted State">
          {loading ? (
            <Loading label="Extracting structured state…" />
          ) : !interpretation ? (
            <Empty>—</Empty>
          ) : (
            <div className="space-y-3">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px]">
                <dt className="text-zinc-500">model</dt>
                <dd className="text-zinc-300">{interpretation.meta.model}</dd>
                <dt className="text-zinc-500">classify</dt>
                <dd className="text-zinc-300">
                  {interpretation.meta.classify_latency_ms}ms
                </dd>
                <dt className="text-zinc-500">extract</dt>
                <dd className="text-zinc-300">
                  {interpretation.meta.extract_latency_ms === null
                    ? "—"
                    : `${interpretation.meta.extract_latency_ms}ms`}
                </dd>
                <dt className="text-zinc-500">cached</dt>
                <dd className="text-zinc-300">
                  {interpretation.meta.cached ? "yes" : "no"}
                </dd>
              </dl>

              {interpretation.state != null && (
                <div>
                  <button
                    onClick={() => setStateOpen((o) => !o)}
                    className="font-mono text-[11px] text-indigo-300 hover:text-indigo-200"
                  >
                    {stateOpen ? "▾" : "▸"} structured state ({JSON.stringify(interpretation.state).length} bytes)
                  </button>
                  {stateOpen && (
                    <pre className="mt-2 max-h-72 overflow-auto rounded-md border border-zinc-800 bg-black/40 p-3 font-mono text-[10.5px] leading-snug text-zinc-300">
                      {JSON.stringify(interpretation.state, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              <button
                onClick={onRerun}
                disabled={loading}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-[11px] text-zinc-200 transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                Re-run
              </button>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-zinc-800/80 px-5 py-4">
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-zinc-400">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
      {label}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] italic text-zinc-500">{children}</div>;
}
