"use client";

import type { WorkspaceKind } from "@/lib/types";

type ViewMode = "workspace" | "thread";

const LABEL: Record<WorkspaceKind, string> = {
  ContractView: "Document workspace",
  DealView: "Deal workspace",
  EventView: "Event workspace",
  PlainThreadView: "Plain thread",
};

export function WorkspaceToolbar({
  workspace,
  messageCount,
  view,
  onView,
  loading,
}: {
  workspace: WorkspaceKind | null;
  messageCount: number;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  loading: boolean;
}) {
  const showToggle = workspace !== null && workspace !== "PlainThreadView";
  const workspaceReady = workspace !== null && workspace !== "PlainThreadView";

  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-2 backdrop-blur">
      <div className="flex items-center gap-2.5">
        {loading ? (
          <>
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Interpreting…
            </span>
          </>
        ) : workspace ? (
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {LABEL[workspace]}
          </span>
        ) : null}
      </div>

      {showToggle && (
        <div className="flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-medium">
          <button
            onClick={() => onView("thread")}
            className={
              "rounded px-2.5 py-1 transition-colors " +
              (view === "thread"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700")
            }
          >
            Thread
            <span className="ml-1.5 font-mono text-[10px] text-zinc-400">
              {messageCount}
            </span>
          </button>
          <button
            onClick={() => onView("workspace")}
            disabled={!workspaceReady}
            className={
              "rounded px-2.5 py-1 transition-colors " +
              (view === "workspace"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700") +
              (!workspaceReady ? " cursor-not-allowed opacity-50" : "")
            }
          >
            Workspace
          </button>
        </div>
      )}
    </div>
  );
}
