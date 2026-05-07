import type { ContractState } from "@/lib/schemas";
import { OpenItemsBanner } from "@/components/open-items-banner";

export function ContractView({ state }: { state: ContractState }) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Document header */}
      <div className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white px-12 pb-8 pt-10">
        <h1 className="text-3xl text-zinc-900">{state.document_title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
          <span className="font-mono text-xs text-zinc-500">
            v{state.current_version}
          </span>
          <span className="text-zinc-300">·</span>
          {state.parties.map((p, i) => (
            <span key={p.name}>
              {p.name}{" "}
              <span className="text-zinc-400">({p.role})</span>
              {i < state.parties.length - 1 && (
                <span className="ml-3 text-zinc-300">·</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <OpenItemsBanner items={state.top_actions} />

      {/* Document body */}
      <div className="grid grid-cols-[1fr_240px] gap-10 px-12 py-10">
        <article className="space-y-10">
          {state.clauses.map((clause) => (
            <section key={clause.id} className="scroll-mt-8">
              <h2 className="mb-2 text-xl text-zinc-900">{clause.heading}</h2>

              <p className="text-[15px] leading-7 text-zinc-800">
                {clause.text}
              </p>

              {clause.redlines.length > 0 && (
                <div className="mt-4 space-y-2">
                  {clause.redlines.map((r, i) => (
                    <div
                      key={i}
                      className={
                        "rounded-md px-3 py-2 " +
                        (r.status === "open"
                          ? "bg-amber-50/70"
                          : r.status === "accepted"
                            ? "bg-emerald-50/60"
                            : "bg-zinc-50")
                      }
                    >
                      <div className="flex items-center gap-2 text-[11px]">
                        <span
                          className={
                            "rounded-sm px-1.5 py-0.5 font-medium uppercase tracking-wider " +
                            (r.status === "open"
                              ? "bg-amber-200/60 text-amber-900"
                              : r.status === "accepted"
                                ? "bg-emerald-200/60 text-emerald-900"
                                : "bg-zinc-200/60 text-zinc-600")
                          }
                        >
                          {r.status}
                        </span>
                        <span className="text-zinc-500">
                          proposed by {r.proposed_by}
                        </span>
                        <span className="text-zinc-300">·</span>
                        <span className="font-mono text-zinc-400">
                          {r.message_id}
                        </span>
                      </div>
                      <p className="mt-1 text-[14px] leading-6 text-zinc-800">
                        {r.proposed_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {clause.comments.length > 0 && (
                <div className="mt-3 space-y-1.5 border-l border-zinc-200 pl-4">
                  {clause.comments.map((c, i) => (
                    <div key={i} className="text-[13px] text-zinc-600">
                      <span className="font-medium text-zinc-700">
                        {c.author}:
                      </span>{" "}
                      {c.text}{" "}
                      <span className="font-mono text-[10px] text-zinc-400">
                        {c.message_id}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </article>

        {/* Right rail: version history only */}
        <aside className="self-start text-sm">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Version history
          </div>
          <ol className="space-y-2 border-l border-zinc-200 pl-4">
            {[...state.version_history].reverse().map((v) => (
              <li key={v.version} className="relative">
                <span className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-zinc-400" />
                <div className="font-mono text-xs text-zinc-500">
                  v{v.version} · {v.date}
                </div>
                <div className="text-[13px] text-zinc-700">{v.summary}</div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
