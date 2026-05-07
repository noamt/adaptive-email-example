import { CONSTRAINTS } from "./constraints";
import {
  CONTRACT_SCHEMA_FOR_LLM,
  DEAL_SCHEMA_FOR_LLM,
  EVENT_SCHEMA_FOR_LLM,
} from "./schemas";
import type { Thread } from "./types";

const constraintsBlock = () =>
  CONSTRAINTS.map(
    (c) => `- ${c.id}: ${c.label}. ${c.description}`,
  ).join("\n");

export const CLASSIFY_SYSTEM = `You decide which workspace an email thread should render as.

You have four workspaces:

- ContractView: a document workspace. Use this when the thread is fundamentally *about a document* — a contract, agreement, or other artifact with versioned text and proposed changes. The emails are evidence; the document is the thing.

- DealView: a deal/CRM-style workspace. Use this when the thread is a sales process with multiple stakeholders, a stage progression, and substantive commercial back-and-forth. Use it when the emails describe an evolving deal state, not a document.

- EventView: an event-planning workspace. Use this when the thread is coordinating a real-world or virtual event — a meetup, dinner, offsite, recurring meeting series — with substantive structure: a date being negotiated, a venue, attendees with RSVPs, a run-of-show, dietary or logistical asks. The emails describe an evolving plan whose current state is what matters. Do NOT use this for a single one-off scheduling ping ("are you free Tuesday?") — that's a PlainThreadView.

- PlainThreadView: render the thread as plain messages. Use this for personal notes, one-off conversational threads, brief scheduling pings, or anything where structuring the content would be over-applying. When in doubt between PlainThreadView and a richer workspace, choose PlainThreadView.

You must obey the following developer constraints. Cite the constraint id in your rationale when it applied:

${constraintsBlock()}

Return ONLY a single JSON object matching this shape, no prose, no code fences:

{
  "workspace": "ContractView" | "DealView" | "PlainThreadView",
  "rationale": "one or two sentences explaining the choice, citing constraint ids where they applied",
  "constraints_applied": ["constraint_id_1", ...]
}`;

export const classifyUserMessage = (thread: Thread) => {
  const messageSummaries = thread.messages
    .map((m) => {
      const date = m.date.slice(0, 10);
      return `[${m.id}] ${date} from ${m.from.name}: ${m.body.slice(0, 320)}${m.body.length > 320 ? "…" : ""}`;
    })
    .join("\n\n");

  const attachmentList = thread.messages
    .flatMap((m) => (m.attachments ?? []).map((a) => a.filename))
    .join(", ");

  return `Thread subject: ${thread.subject}
Participants: ${thread.participants.join(", ")}
Message count: ${thread.messages.length}
Attachments: ${attachmentList || "none"}

Messages (truncated):

${messageSummaries}`;
};

// ─── Extraction prompts ─────────────────────────────────────────────────────

export const extractSystem = (
  workspace: "ContractView" | "DealView" | "EventView",
) => {
  const schema =
    workspace === "ContractView"
      ? CONTRACT_SCHEMA_FOR_LLM
      : workspace === "DealView"
        ? DEAL_SCHEMA_FOR_LLM
        : EVENT_SCHEMA_FOR_LLM;

  const topActionsGuidance = `Every workspace must populate top_actions — the constraint surface_open_items_at_top is in effect. These render as a uniform open-items banner at the top of the workspace.
  • Maximum five items. Order most-urgent first.
  • Each item: a short title (under 60 chars), a one-sentence detail, the owner we are waiting on, and a due date if one is stated or strongly implied.
  • Do not repeat clause names or stakeholder names in the detail when the title already conveys them.
  • If nothing is pressing, return an empty array — do not invent items.`;

  const guidance =
    workspace === "ContractView"
      ? `Extract the document state behind this email thread. The thread is about a contract being negotiated; your job is to surface the *document*, not summarize the emails.

Specifically:
  • For each substantively discussed clause, capture the latest agreed text and any unresolved redlines.
  • Mark redlines as "open" by default. Only mark "accepted" if the counterparty has explicitly agreed to that exact text — the constraint never_auto_resolve_redlines is in effect.
  • Use stable clause ids derived from section numbers and topics (e.g. "sec-11-2-indemnification-cap").
  • Cite source message ids on redlines and comments so the document remains traceable.
  • open_items should reflect what is currently blocking signature, with a specific person to chase.

${topActionsGuidance}`
      : workspace === "DealView"
        ? `Extract the deal state behind this email thread. The thread is a sales process; surface the *deal*, not the emails.

Specifically:
  • Pick the stage that best reflects the most recent state. If progress has clearly stalled (waiting on review, unresponded pricing pushback), use "stalled".
  • For each stakeholder, infer role functionally (champion, economic buyer, technical evaluator, security gatekeeper, etc.) — don't just copy job titles.
  • Open blockers must each have a person who raised them and a date — flag_sentiment_drops and extract_blockers_with_owners are in effect.
  • next_step should be concrete and actionable, with an owner. If there's no clear next step, set owner to whoever is currently holding the deal.
  • key_moments are the 3–6 inflection points an AE would call out in a forecast review.

${topActionsGuidance}`
        : `Extract the event state behind this email thread. The thread is coordinating an event; surface the *plan*, not the emails.

Specifically:
  • current_plan reflects whatever is currently locked in. Set fields to null if still moving.
  • status: 'scheduling' while date or venue still moving; 'confirmed' once both are locked; 'completed' once the event has happened; 'cancelled' if explicitly called off.
  • schedule: only populate if a specific run-of-show is discussed (talk times, breaks). Skip if the thread hasn't gotten there.
  • attendees: include everyone whose attendance is mentioned — organizers, speakers, confirmed attendees, venue contacts. Use the 'note' field for anything an organizer would need to remember (dietary, late arrival, AV needs).
  • decisions_log: capture decisions made (with resolution + decided_on date) and decisions still open (resolution null). Includes things like "which date", "which venue", "what format".

${topActionsGuidance}`;

  return `${guidance}

Return ONLY a single JSON object matching this exact JSON Schema. No prose, no code fences, no commentary.

${JSON.stringify(schema, null, 2)}`;
};

export const extractUserMessage = (thread: Thread) => {
  const fullThread = thread.messages
    .map((m) => {
      const headers = [
        `Message id: ${m.id}`,
        `Date: ${m.date}`,
        `From: ${m.from.name} <${m.from.email}>`,
        `To: ${m.to.map((t) => `${t.name} <${t.email}>`).join(", ")}`,
        m.cc?.length
          ? `Cc: ${m.cc.map((t) => `${t.name} <${t.email}>`).join(", ")}`
          : null,
        m.subject ? `Subject: ${m.subject}` : null,
        m.attachments?.length
          ? `Attachments: ${m.attachments.map((a) => `${a.filename} (${a.size_kb}kb)`).join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      return `${headers}\n\n${m.body}`;
    })
    .join("\n\n---\n\n");

  return `Thread subject: ${thread.subject}

Full thread below. Extract structured state per the schema in the system prompt.

${fullThread}`;
};
