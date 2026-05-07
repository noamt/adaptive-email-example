import type { DealState } from "@/lib/schemas";
import { OpenItemsBanner } from "@/components/open-items-banner";

const STAGES: DealState["stage"][] = [
  "discovery",
  "evaluation",
  "negotiation",
  "closed-won",
];

const sentimentDot = (s: string) => {
  if (s === "positive") return "bg-emerald-500";
  if (s === "neutral") return "bg-zinc-400";
  if (s === "negative") return "bg-rose-500";
  return "bg-zinc-300";
};

const sentimentLabel = (s: string) =>
  s === "unknown" ? "—" : s;

export function DealView({ state }: { state: DealState }) {
  const isStalled = state.stage === "stalled";
  const isLost = state.stage === "closed-lost";
  const stageIndex = STAGES.indexOf(state.stage);

  return (
    <div className="h-full overflow-y-auto bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-10 pb-7 pt-9">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {state.account_name}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={
                "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider " +
                (isStalled
                  ? "bg-rose-100 text-rose-800"
                  : isLost
                    ? "bg-zinc-200 text-zinc-700"
                    : "bg-indigo-100 text-indigo-800")
              }
            >
              {state.stage}
            </span>
          </div>
        </div>

        {/* Stage tracker */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            {STAGES.map((s, i) => {
              const reached = !isStalled && !isLost && stageIndex >= i;
              const current = !isStalled && !isLost && stageIndex === i;
              return (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <div
                    className={
                      "h-1.5 flex-1 rounded-full " +
                      (reached ? "bg-indigo-500" : "bg-zinc-200")
                    }
                  />
                  <div
                    className={
                      "text-[10px] font-medium uppercase tracking-wider " +
                      (current
                        ? "text-indigo-700"
                        : reached
                          ? "text-zinc-700"
                          : "text-zinc-400")
                    }
                  >
                    {s}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-sm italic text-zinc-600">
            {state.stage_rationale}
          </p>
        </div>
      </div>

      <OpenItemsBanner items={state.top_actions} />

      {/* Body grid */}
      <div className="grid grid-cols-[1fr_320px] gap-6 p-8">
        <div className="space-y-6">
          {/* Timeline */}
          <Card title="Key moments">
            <ol className="relative ml-2 space-y-4 border-l border-zinc-200 pl-5">
              {state.key_moments.map((m, i) => (
                <li key={i} className="relative">
                  <span
                    className={
                      "absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-2 ring-white " +
                      (m.sentiment_delta > 0
                        ? "bg-emerald-500"
                        : m.sentiment_delta < 0
                          ? "bg-rose-500"
                          : "bg-zinc-400")
                    }
                  />
                  <div className="font-mono text-[11px] text-zinc-500">
                    {m.date.slice(0, 10)}
                  </div>
                  <div className="text-sm text-zinc-800">{m.summary}</div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Right column: stakeholders */}
        <div>
          <Card title="Stakeholders" count={state.stakeholders.length}>
            <ul className="divide-y divide-zinc-100">
              {state.stakeholders.map((s) => (
                <li key={s.name} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div
                    className={
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full " + sentimentDot(s.sentiment)
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-800">
                      {s.name}
                    </div>
                    <div className="truncate text-xs text-zinc-500">
                      {s.role} · {s.company}
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-400">
                      sentiment: {sentimentLabel(s.sentiment)} · last active{" "}
                      {s.last_active.slice(0, 10)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {title}
        </h3>
        {typeof count === "number" && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-2 text-sm italic text-zinc-400">{children}</div>;
}
