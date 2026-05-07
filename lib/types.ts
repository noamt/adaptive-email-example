export type WorkspaceKind =
  | "ContractView"
  | "DealView"
  | "EventView"
  | "PlainThreadView";

export type Message = {
  id: string;
  from: { name: string; email: string };
  to: { name: string; email: string }[];
  cc?: { name: string; email: string }[];
  date: string; // ISO
  subject?: string; // only on first message of a forwarded/scheduling sub-thread
  body: string; // plain text, can include "> " quoted lines
  attachments?: { filename: string; size_kb: number }[];
};

export type Thread = {
  id: string;
  subject: string;
  participants: string[]; // display names
  messages: Message[];
  preview: string; // last-message snippet for the inbox list
  unread?: boolean;
  starred?: boolean;
};

export type Constraint = {
  id: string;
  label: string;
  description: string;
};

export type ClassificationResult = {
  workspace: WorkspaceKind;
  rationale: string;
  constraints_applied: string[]; // constraint ids
};

export type InterpretationResult = {
  classification: ClassificationResult;
  state: unknown | null; // matches one of the workspace schemas, or null for PlainThreadView
  meta: {
    model: string;
    classify_latency_ms: number;
    extract_latency_ms: number | null;
    cached: boolean;
    cached_at?: string;
  };
};
