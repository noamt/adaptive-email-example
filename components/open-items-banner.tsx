import type { TopAction } from "@/lib/schemas";

const formatDue = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const diffDays = Math.round(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const dateLabel = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  if (diffDays < 0) return `${dateLabel} (overdue)`;
  if (diffDays === 0) return `${dateLabel} (today)`;
  if (diffDays === 1) return `${dateLabel} (tomorrow)`;
  if (diffDays <= 7) return `${dateLabel} (in ${diffDays}d)`;
  return dateLabel;
};

export function OpenItemsBanner({ items }: { items: TopAction[] }) {
  if (!items.length) return null;

  return (
    <section className="border-b border-zinc-200 bg-zinc-50/60 px-10 py-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Open items
        </h3>
        <span className="font-mono text-[10px] text-zinc-400">
          {items.length}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => {
          const overdue =
            item.due && new Date(item.due).getTime() < Date.now();
          return (
            <li
              key={i}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-zinc-900">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[12px] leading-snug text-zinc-600">
                    {item.detail}
                  </div>
                </div>
                {item.due && (
                  <span
                    className={
                      "shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[10px] " +
                      (overdue
                        ? "bg-rose-100 text-rose-800"
                        : "bg-zinc-100 text-zinc-600")
                    }
                  >
                    {formatDue(item.due)}
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-[11px] text-zinc-500">
                waiting on{" "}
                <span className="text-zinc-700">{item.owner}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
