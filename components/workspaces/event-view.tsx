import type { EventState } from "@/lib/schemas";
import { OpenItemsBanner } from "@/components/open-items-banner";

const STATUS_TONE: Record<EventState["status"], string> = {
  scheduling: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-zinc-200 text-zinc-700",
  cancelled: "bg-rose-100 text-rose-800",
};

const STATUS_DOT: Record<EventState["attendees"][number]["status"], string> = {
  confirmed: "bg-emerald-500",
  maybe: "bg-amber-400",
  declined: "bg-rose-400",
  pending: "bg-zinc-300",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function EventView({ state }: { state: EventState }) {
  const plan = state.current_plan;
  const confirmedCount = state.attendees.filter(
    (a) => a.status === "confirmed",
  ).length;

  return (
    <div className="h-full overflow-y-auto bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-10 pb-7 pt-9">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {state.title}
          </h1>
          <span
            className={
              "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider " +
              STATUS_TONE[state.status]
            }
          >
            {state.status}
          </span>
        </div>

        {/* Plan summary line */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
          {plan.date && (
            <span className="font-medium text-zinc-800">
              {formatDate(plan.date)}
            </span>
          )}
          {plan.time && (
            <>
              <span className="text-zinc-300">·</span>
              <span>{plan.time}</span>
            </>
          )}
          {plan.location && (
            <>
              <span className="text-zinc-300">·</span>
              <span>{plan.location}</span>
            </>
          )}
          {plan.format && (
            <>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-500">{plan.format}</span>
            </>
          )}
          {plan.capacity && (
            <>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-500">
                {confirmedCount} / {plan.capacity}
              </span>
            </>
          )}
        </div>

        <p className="mt-3 text-sm italic text-zinc-600">
          {state.status_rationale}
        </p>
      </div>

      <OpenItemsBanner items={state.top_actions} />

      {/* Body */}
      <div className="grid grid-cols-[1fr_320px] gap-6 p-8">
        <div className="space-y-6">
          {state.schedule.length > 0 && (
            <Card title="Run of show">
              <ol className="divide-y divide-zinc-100">
                {state.schedule.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-baseline gap-4 py-2.5 first:pt-0 last:pb-0"
                  >
                    <span className="w-16 shrink-0 font-mono text-[12px] text-zinc-500">
                      {s.time}
                    </span>
                    <span className="text-sm text-zinc-800">{s.item}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          <Card title="Decisions" count={state.decisions_log.length}>
            <ul className="divide-y divide-zinc-100">
              {state.decisions_log.map((d, i) => {
                const decided = !!d.resolution;
                return (
                  <li
                    key={i}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div
                      className={
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full " +
                        (decided ? "bg-emerald-500" : "bg-amber-400")
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-zinc-800">{d.question}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">
                        {decided ? (
                          <>
                            <span className="text-zinc-700">
                              {d.resolution}
                            </span>
                            {d.decided_on && (
                              <>
                                {" · "}
                                <span className="font-mono text-zinc-400">
                                  {d.decided_on.slice(0, 10)}
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="italic">still open</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Right: attendees */}
        <div>
          <Card title="Attendees" count={state.attendees.length}>
            <ul className="divide-y divide-zinc-100">
              {state.attendees.map((a) => (
                <li
                  key={a.name}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className={
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full " +
                      STATUS_DOT[a.status]
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-800">
                      {a.name}
                    </div>
                    <div className="truncate text-xs text-zinc-500">
                      {a.role ?? a.status}
                      {a.role && (
                        <>
                          {" · "}
                          <span className="text-zinc-400">{a.status}</span>
                        </>
                      )}
                    </div>
                    {a.note && (
                      <div className="mt-0.5 text-[11px] text-zinc-500">
                        {a.note}
                      </div>
                    )}
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
