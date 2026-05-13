"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { InboxList, type InboxMode } from "@/components/inbox-list";
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

// Client-side interpretation cache. Lives in-memory for fast in-session
// navigation and is mirrored to localStorage so reloads don't re-burn
// LLM calls. On serverless deployments where /tmp is per-container and
// gets wiped on cold starts, this is the only cache that actually works
// across requests for the same user.
const CACHE_KEY = "adaptive-inbox-interpret-cache-v1";

const readClientCache = (): Record<string, InterpretationResult> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, InterpretationResult>) : {};
  } catch {
    return {};
  }
};

const writeClientCache = (cache: Record<string, InterpretationResult>) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* quota exceeded or storage disabled — ignore */
  }
};

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [interpretation, setInterpretation] =
    useState<InterpretationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("workspace");
  const [differCollapsed, setDifferCollapsed] = useState(false);
  const [inboxMode, setInboxMode] = useState<InboxMode>("today");
  const [leftWidth, setLeftWidth] = useState(300);
  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(
    null,
  );

  // Per-session cache. Starts empty on first render to keep SSR-safe;
  // hydrated from localStorage on mount.
  const clientCacheRef = useRef<Record<string, InterpretationResult>>({});
  useEffect(() => {
    clientCacheRef.current = readClientCache();
  }, []);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragStateRef.current = { startX: e.clientX, startWidth: leftWidth };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        if (!dragStateRef.current) return;
        const delta = ev.clientX - dragStateRef.current.startX;
        const next = Math.min(
          520,
          Math.max(220, dragStateRef.current.startWidth + delta),
        );
        setLeftWidth(next);
      };
      const onUp = () => {
        dragStateRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [leftWidth],
  );

  const fetchInterpretation = useCallback(
    async (threadId: string, forceRefresh = false) => {
      setError(null);

      // Client cache hit — return synchronously, no network, no loading flash.
      if (!forceRefresh) {
        const cached = clientCacheRef.current[threadId];
        if (cached) {
          setInterpretation({
            ...cached,
            meta: { ...cached.meta, cached: true },
          });
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setInterpretation(null);
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
        // Mirror to client cache (in-memory + localStorage) so subsequent
        // clicks of this thread don't hit the network or LLM again.
        clientCacheRef.current = {
          ...clientCacheRef.current,
          [threadId]: data,
        };
        writeClientCache(clientCacheRef.current);
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
      setError(null);
      setView("thread");
      fetchInterpretation(selectedId);
    }
  }, [selectedId, fetchInterpretation]);

  const thread = selectedId ? THREADS_BY_ID[selectedId] : null;
  const workspace = interpretation?.classification.workspace ?? null;
  // top_actions is shared across all rich workspace states (Contract / Deal /
  // Event) so we can pluck it generically and pass to the reply context.
  const topActions =
    interpretation?.state &&
    typeof interpretation.state === "object" &&
    "top_actions" in interpretation.state
      ? (interpretation.state as { top_actions?: unknown }).top_actions
      : undefined;
  const topActionsArray = Array.isArray(topActions)
    ? (topActions as ContractState["top_actions"])
    : undefined;

  return (
    <div
      className="grid h-screen overflow-hidden"
      style={{
        gridTemplateColumns: differCollapsed
          ? `${leftWidth}px 1fr 44px`
          : `${leftWidth}px 1fr 360px`,
      }}
    >
      <aside className="relative overflow-hidden border-r border-zinc-200">
        <InboxList
          threads={THREADS}
          selectedId={selectedId}
          onSelect={setSelectedId}
          mode={inboxMode}
          onMode={setInboxMode}
        />
        {/* Resize handle — narrow strip on the right edge */}
        <div
          role="separator"
          aria-label="Resize inbox panel"
          aria-orientation="vertical"
          onMouseDown={startDrag}
          className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-indigo-500/30"
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
            <PlainThreadView thread={thread} topActions={topActionsArray} />
          ) : loading || !interpretation ? (
            <WorkspaceLoading />
          ) : workspace === "ContractView" && interpretation.state ? (
            <ContractView state={interpretation.state as ContractState} />
          ) : workspace === "DealView" && interpretation.state ? (
            <DealView state={interpretation.state as DealState} />
          ) : workspace === "EventView" && interpretation.state ? (
            <EventView state={interpretation.state as EventState} />
          ) : (
            <PlainThreadView thread={thread} topActions={topActionsArray} />
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
          inboxMode={inboxMode}
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
