import { z } from "zod";

// ─── Classification (Call 1) ─────────────────────────────────────────────────

export const ClassificationSchema = z.object({
  workspace: z.enum(["ContractView", "DealView", "EventView", "PlainThreadView"]),
  rationale: z.string().min(10),
  constraints_applied: z.array(z.string()),
});

export type Classification = z.infer<typeof ClassificationSchema>;

// ─── Shared: top_actions (the "open items at top" surface) ──────────────────

const TopActionSchema = z.object({
  title: z.string(),
  detail: z.string(),
  owner: z.string(),
  due: z.string().nullable(),
});

export type TopAction = z.infer<typeof TopActionSchema>;

const TOP_ACTIONS_SCHEMA_FOR_LLM = {
  type: "array",
  description:
    "The most pressing open items, ordered most-urgent first. Maximum five. Each captures what is needed, who must act, and any deadline.",
  maxItems: 5,
  items: {
    type: "object",
    required: ["title", "detail", "owner", "due"],
    properties: {
      title: {
        type: "string",
        description:
          "Short label for the action (e.g. 'Indemnification cap response', 'Send security package'). Under 60 chars.",
      },
      detail: {
        type: "string",
        description:
          "One sentence on what specifically is needed and why it's stuck. No clause-name prefix repetition (the title already says it).",
      },
      owner: {
        type: "string",
        description: "The person we are waiting on.",
      },
      due: {
        type: ["string", "null"],
        description:
          "ISO date if a deadline is explicitly stated or strongly implied; otherwise null.",
      },
    },
  },
} as const;

// ─── ContractView state (Call 2 output for contract threads) ─────────────────

const RedlineSchema = z.object({
  proposed_text: z.string(),
  proposed_by: z.string(),
  status: z.enum(["open", "accepted", "rejected"]),
  message_id: z.string(),
});

const CommentSchema = z.object({
  author: z.string(),
  text: z.string(),
  message_id: z.string(),
});

const ClauseSchema = z.object({
  id: z.string(),
  heading: z.string(),
  text: z.string(),
  redlines: z.array(RedlineSchema),
  comments: z.array(CommentSchema),
});

const OpenItemSchema = z.object({
  description: z.string(),
  waiting_on: z.string(),
});

const VersionEntrySchema = z.object({
  version: z.number(),
  date: z.string(),
  summary: z.string(),
});

const PartySchema = z.object({
  name: z.string(),
  role: z.string(),
});

export const ContractStateSchema = z.object({
  document_title: z.string(),
  current_version: z.number(),
  parties: z.array(PartySchema),
  top_actions: z.array(TopActionSchema).max(5),
  clauses: z.array(ClauseSchema),
  open_items: z.array(OpenItemSchema),
  version_history: z.array(VersionEntrySchema),
});

export type ContractState = z.infer<typeof ContractStateSchema>;

// ─── DealView state (Call 2 output for sales threads) ────────────────────────

const StakeholderSchema = z.object({
  name: z.string(),
  company: z.string(),
  role: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative", "unknown"]),
  last_active: z.string(),
});

const BlockerSchema = z.object({
  description: z.string(),
  raised_by: z.string(),
  raised_on: z.string(),
  status: z.enum(["open", "addressed"]),
});

const NextStepSchema = z.object({
  description: z.string(),
  owner: z.string(),
  due: z.string().nullable(),
});

const KeyMomentSchema = z.object({
  date: z.string(),
  summary: z.string(),
  sentiment_delta: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

export const DealStateSchema = z.object({
  account_name: z.string(),
  stage: z.enum([
    "discovery",
    "evaluation",
    "negotiation",
    "closed-won",
    "closed-lost",
    "stalled",
  ]),
  stage_rationale: z.string(),
  top_actions: z.array(TopActionSchema).max(5),
  stakeholders: z.array(StakeholderSchema),
  open_blockers: z.array(BlockerSchema),
  next_step: NextStepSchema,
  key_moments: z.array(KeyMomentSchema),
});

export type DealState = z.infer<typeof DealStateSchema>;

// ─── EventView state (Call 2 output for scheduling/event threads) ────────────

const PlanSchema = z.object({
  date: z.string().nullable(),
  time: z.string().nullable(),
  location: z.string().nullable(),
  format: z.string().nullable(),
  capacity: z.number().nullable(),
});

const ScheduleItemSchema = z.object({
  time: z.string(),
  item: z.string(),
});

const EventAttendeeSchema = z.object({
  name: z.string(),
  role: z.string().nullable(),
  status: z.enum(["confirmed", "maybe", "declined", "pending"]),
  note: z.string().nullable(),
});

const DecisionSchema = z.object({
  question: z.string(),
  resolution: z.string().nullable(),
  decided_on: z.string().nullable(),
});

export const EventStateSchema = z.object({
  title: z.string(),
  status: z.enum(["scheduling", "confirmed", "completed", "cancelled"]),
  status_rationale: z.string(),
  current_plan: PlanSchema,
  schedule: z.array(ScheduleItemSchema),
  attendees: z.array(EventAttendeeSchema),
  decisions_log: z.array(DecisionSchema),
  top_actions: z.array(TopActionSchema).max(5),
});

export type EventState = z.infer<typeof EventStateSchema>;

export const EVENT_SCHEMA_FOR_LLM = {
  type: "object",
  required: [
    "title",
    "status",
    "status_rationale",
    "current_plan",
    "schedule",
    "attendees",
    "decisions_log",
    "top_actions",
  ],
  properties: {
    title: { type: "string", description: "Short title of the event being planned." },
    status: {
      type: "string",
      enum: ["scheduling", "confirmed", "completed", "cancelled"],
      description:
        "'scheduling' while date/venue still moving; 'confirmed' once both are locked; 'completed' once the event has happened; 'cancelled' if explicitly called off.",
    },
    status_rationale: {
      type: "string",
      description: "One sentence on why this status was picked, citing thread evidence.",
    },
    current_plan: {
      type: "object",
      required: ["date", "time", "location", "format", "capacity"],
      properties: {
        date: { type: ["string", "null"], description: "ISO date if confirmed, else null." },
        time: { type: ["string", "null"], description: "Human-readable time window, e.g. '6:30-9:00pm PT'." },
        location: { type: ["string", "null"] },
        format: { type: ["string", "null"], description: "e.g. 'Talks + social', 'Workshop'." },
        capacity: { type: ["number", "null"], description: "Confirmed capacity ceiling if discussed." },
      },
    },
    schedule: {
      type: "array",
      description:
        "Run of show — only populate if a specific timeline is discussed (talks, breaks, social).",
      items: {
        type: "object",
        required: ["time", "item"],
        properties: {
          time: { type: "string", description: "e.g. '6:00', '6:30', '7:30'." },
          item: { type: "string" },
        },
      },
    },
    attendees: {
      type: "array",
      description:
        "Everyone whose attendance is mentioned — organizers, speakers, confirmed attendees, venue contacts.",
      items: {
        type: "object",
        required: ["name", "role", "status", "note"],
        properties: {
          name: { type: "string" },
          role: { type: ["string", "null"], description: "'organizer', 'speaker', 'attendee', 'venue contact'." },
          status: { type: "string", enum: ["confirmed", "maybe", "declined", "pending"] },
          note: {
            type: ["string", "null"],
            description:
              "Anything notable that an organizer would need to remember (dietary, late arrival, AV needs).",
          },
        },
      },
    },
    decisions_log: {
      type: "array",
      description:
        "Decisions that have been made or are still open: date, venue, format, speakers. Resolution null if still open.",
      items: {
        type: "object",
        required: ["question", "resolution", "decided_on"],
        properties: {
          question: { type: "string" },
          resolution: { type: ["string", "null"] },
          decided_on: { type: ["string", "null"], description: "ISO date the decision was made." },
        },
      },
    },
    top_actions: TOP_ACTIONS_SCHEMA_FOR_LLM,
  },
} as const;

// JSON-schema shapes for the LLM prompt. We hand-write these (rather than
// generating from Zod) so the natural-language descriptions inside the
// schema can be tuned for the model without restructuring the runtime
// validators.

export const CONTRACT_SCHEMA_FOR_LLM = {
  type: "object",
  required: [
    "document_title",
    "current_version",
    "parties",
    "top_actions",
    "clauses",
    "open_items",
    "version_history",
  ],
  properties: {
    document_title: { type: "string", description: "Short title of the contract being negotiated." },
    current_version: { type: "number", description: "Latest version number referenced in the thread." },
    parties: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "role"],
        properties: { name: { type: "string" }, role: { type: "string" } },
      },
    },
    top_actions: TOP_ACTIONS_SCHEMA_FOR_LLM,
    clauses: {
      type: "array",
      description:
        "Clauses that have been substantively discussed in the thread. Skip ones only mentioned in passing.",
      items: {
        type: "object",
        required: ["id", "heading", "text", "redlines", "comments"],
        properties: {
          id: { type: "string", description: "Stable id, e.g. 'sec-11-2-indemnification-cap'." },
          heading: { type: "string" },
          text: {
            type: "string",
            description:
              "The most recent agreed or proposed text for this clause, in plain prose. If still contested, capture the latest accepted baseline.",
          },
          redlines: {
            type: "array",
            items: {
              type: "object",
              required: ["proposed_text", "proposed_by", "status", "message_id"],
              properties: {
                proposed_text: { type: "string" },
                proposed_by: { type: "string" },
                status: { type: "string", enum: ["open", "accepted", "rejected"] },
                message_id: { type: "string", description: "id of the source message" },
              },
            },
          },
          comments: {
            type: "array",
            items: {
              type: "object",
              required: ["author", "text", "message_id"],
              properties: {
                author: { type: "string" },
                text: { type: "string" },
                message_id: { type: "string" },
              },
            },
          },
        },
      },
    },
    open_items: {
      type: "array",
      items: {
        type: "object",
        required: ["description", "waiting_on"],
        properties: {
          description: { type: "string" },
          waiting_on: { type: "string", description: "Person we're waiting on." },
        },
      },
    },
    version_history: {
      type: "array",
      items: {
        type: "object",
        required: ["version", "date", "summary"],
        properties: {
          version: { type: "number" },
          date: { type: "string" },
          summary: { type: "string" },
        },
      },
    },
  },
} as const;

export const DEAL_SCHEMA_FOR_LLM = {
  type: "object",
  required: [
    "account_name",
    "stage",
    "stage_rationale",
    "top_actions",
    "stakeholders",
    "open_blockers",
    "next_step",
    "key_moments",
  ],
  properties: {
    account_name: { type: "string" },
    stage: {
      type: "string",
      enum: ["discovery", "evaluation", "negotiation", "closed-won", "closed-lost", "stalled"],
    },
    stage_rationale: {
      type: "string",
      description: "One sentence on why this stage was picked, citing specific evidence from the thread.",
    },
    top_actions: TOP_ACTIONS_SCHEMA_FOR_LLM,
    stakeholders: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "company", "role", "sentiment", "last_active"],
        properties: {
          name: { type: "string" },
          company: { type: "string" },
          role: { type: "string", description: "Inferred role, not necessarily a title (e.g. 'champion', 'economic buyer')." },
          sentiment: {
            type: "string",
            enum: ["positive", "neutral", "negative", "unknown"],
          },
          last_active: { type: "string", description: "ISO date of the stakeholder's most recent message." },
        },
      },
    },
    open_blockers: {
      type: "array",
      items: {
        type: "object",
        required: ["description", "raised_by", "raised_on", "status"],
        properties: {
          description: { type: "string" },
          raised_by: { type: "string" },
          raised_on: { type: "string", description: "ISO date." },
          status: { type: "string", enum: ["open", "addressed"] },
        },
      },
    },
    next_step: {
      type: "object",
      required: ["description", "owner", "due"],
      properties: {
        description: { type: "string" },
        owner: { type: "string" },
        due: { type: ["string", "null"], description: "ISO date or null if no date is implied." },
      },
    },
    key_moments: {
      type: "array",
      items: {
        type: "object",
        required: ["date", "summary", "sentiment_delta"],
        properties: {
          date: { type: "string" },
          summary: { type: "string" },
          sentiment_delta: { type: "number", enum: [-1, 0, 1] },
        },
      },
    },
  },
} as const;
