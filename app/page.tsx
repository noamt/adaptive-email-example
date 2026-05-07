"use client";

import { useCallback, useEffect, useState } from "react";
import { InboxList } from "@/components/inbox-list";
import { DifferPanel } from "@/components/differ-panel";
import { WorkspaceToolbar } from "@/components/workspace-toolbar";
import { ContractView } from "@/components/workspaces/contract-view";
import { DealView } from "@/components/workspaces/deal-view";
import { EventView } from "@/components/workspaces/event-view";
import { PlainThreadView } from "@/components/workspaces/plain-thread-view";
import { THREADS, THREADS_BY_ID } from "@/lib/threads";
import type {
  ContractState,
  DealState,
  EventState,
} from "@/lib/schemas";
import type { InterpretationResult } from "@/lib/types";

type ViewMode = "workspace" | "thread";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [interpretation, setInterpretation] =
    useState<InterpretationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("workspace");
  const [differCollapsed, setDifferCollapsed] = useState(false);

  const fetchInterpretation = useCallback(
    async (threadId: string, forceRefresh = false) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId, forceRefresh }),
        });
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(data.error ?? `HTTP ${resp.status}`);
        }
        const data = (await resp.json()) as InterpretationResult;
        setInterpretation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setInterpretation(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (selectedId) {
      // Reset state for the new thread: clear stale interpretation, default to
      // showing messages immediately while interpretation runs.
      setInterpretation(null);
      setError(null);
      setView("thread");
      fetchInterpretation(selectedId);
    }
  }, [selectedId, fetchInterpretation]);

  const thread = selectedId ? THREADS_BY_ID[selectedId] : null;
  const workspace = interpretation?.classification.workspace ?? null;

  return (
    <div
      className="grid h-screen overflow-hidden transition-[grid-template-columns] duration-200"
      style={{
        gridTemplateColumns: differCollapsed
          ? "300px 1fr 44px"
          : "300px 1fr 360px",
      }}
    >
      <aside className="overflow-hidden border-r border-zinc-200">
        <InboxList
          threads={THREADS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>

      <main className="flex h-full flex-col overflow-hidden">
        {thread && (
          <WorkspaceToolbar
            workspace={workspace}
            messageCount={thread.messages.length}
            view={view}
            onView={setView}
            loading={loading}
          />
        )}
        <div className="flex-1 overflow-hidden">
          {!thread ? (
            <EmptyState />
          ) : error ? (
            <ErrorState
              error={error}
              onRetry={() => fetchInterpretation(thread.id, true)}
            />
          ) : view === "thread" ? (
            <PlainThreadView thread={thread} />
          ) : loading || !interpretation ? (
            <WorkspaceLoading />
          ) : workspace === "ContractView" && interpretation.state ? (
            <ContractView state={interpretation.state as ContractState} />
          ) : workspace === "DealView" && interpretation.state ? (
            <DealView state={interpretation.state as DealState} />
          ) : workspace === "EventView" && interpretation.state ? (
            <EventView state={interpretation.state as EventState} />
          ) : (
            <PlainThreadView thread={thread} />
          )}
        </div>
      </main>

      <aside className="overflow-hidden">
        <DifferPanel
          interpretation={interpretation}
          loading={loading}
          onRerun={() => selectedId && fetchInterpretation(selectedId, true)}
          collapsed={differCollapsed}
          onToggleCollapsed={() => setDifferCollapsed((v) => !v)}
        />
      </aside>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
        Adaptive Inbox
      </div>
      <h2 className="mt-2 max-w-md text-2xl text-zinc-700">
        Select a thread to see the system decide.
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
        The right pane will render a workspace shaped by what kind of work the
        thread represents — not by the fact that it arrived as email.
      </p>
    </div>
  );
}

function WorkspaceLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <div className="flex items-center gap-2.5 font-mono text-[12px] text-zinc-500">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
        Building workspace…
      </div>
      <p className="mt-2 max-w-md text-[12px] text-zinc-400">
        Classifying, then extracting structured state.
      </p>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <div className="font-mono text-[11px] uppercase tracking-wider text-rose-600">
        Interpretation failed
      </div>
      <p className="mt-2 max-w-md text-sm text-zinc-700">{error}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-mono text-[12px] text-zinc-700 hover:bg-zinc-100"
      >
        Retry
      </button>
    </div>
  );
}
