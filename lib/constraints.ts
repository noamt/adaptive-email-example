import type { Constraint } from "./types";

export const CONSTRAINTS: Constraint[] = [
  {
    id: "surface_open_items_at_top",
    label: "Surface open items at the top",
    description:
      "Every workspace surfaces its most pressing open items at the top, in a consistent treatment. Each item names what's needed, who's holding it up, and any deadline. Maximum five items.",
  },
  {
    id: "respect_minimal_threads",
    label: "Respect minimal threads",
    description:
      "Personal notes, one-off questions, and short conversational threads render as plain messages, not workspaces. Do not over-apply structure.",
  },
  {
    id: "never_auto_resolve_redlines",
    label: "Never auto-resolve redlines",
    description:
      "The system may surface unresolved redlines and proposals but must never mark them as accepted on the user's behalf.",
  },
  {
    id: "surface_counterparty_last_ask",
    label: "Surface counterparty's last ask",
    description:
      "When a thread is in active negotiation, the most recent counterparty proposal must be visible above the fold.",
  },
  {
    id: "extract_blockers_with_owners",
    label: "Extract blockers with owners",
    description:
      "Any obstacle blocking a deal or document must be attributed to a specific person and a date when it was raised.",
  },
  {
    id: "flag_sentiment_drops",
    label: "Flag sentiment drops",
    description:
      "If a deal thread's sentiment trajectory turns negative — late stakeholder pushback, unanswered questions — promote it to an open blocker.",
  },
  {
    id: "prefer_document_over_thread_when_redlines_present",
    label: "Prefer document workspace when redlines are present",
    description:
      "If a thread contains substantive contract redlines or proposed clause text, render the document — not the email — as the primary surface.",
  },
];

export const CONSTRAINTS_BY_ID = Object.fromEntries(
  CONSTRAINTS.map((c) => [c.id, c]),
);
