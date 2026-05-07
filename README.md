# Adaptive Inbox

An inbox where layout reflects the *kind of work* a thread represents, not the
fact that it arrived as email. The same set of messages renders as a document
workspace, a deal dashboard, an event-planning view, or a plain thread —
chosen by an LLM and constrained by developer-defined rules visible in the
right-hand "Differ" panel.

Hackathon-scope prototype. Three rich workspaces (`ContractView`, `DealView`,
`EventView`) plus a `PlainThreadView` fallback. Four seeded threads.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

The first click on each thread runs two LLM calls (classify + extract) and may
take 20–40s. Results are cached on disk under `data/cache/`, so subsequent
clicks are instant. To force a fresh run on one thread, hit "Re-run" in the
Differ panel; to wipe everything, `rm data/cache/*.json`.

## Architecture

- **`lib/threads.ts`** — hand-authored thread fixtures.
- **`lib/constraints.ts`** — developer-defined rules the model must obey and
  cite. Visible in the Differ panel.
- **`lib/schemas.ts`** — Zod runtime validators + JSON schemas the LLM sees
  for each workspace's structured output.
- **`lib/prompts.ts`** — classify and extract prompts.
- **`app/api/interpret/route.ts`** — proxy that runs the two LLM calls,
  validates against the matching schema, falls back to `PlainThreadView` on
  validation failure, caches the result on disk.
- **`components/workspaces/`** — one component per workspace.
- **`components/open-items-banner.tsx`** — shared "open items at top" surface
  that renders consistently across all rich workspaces (per the
  `surface_open_items_at_top` constraint).
- **`components/differ-panel.tsx`** — collapsible developer panel showing
  active constraints, the model's chosen workspace + rationale, and the
  extracted structured state.

## Seeded threads

| Thread | Workspace | What it tests |
|---|---|---|
| Hartwell MSA | `ContractView` | Multi-version contract with redlines on three clauses |
| Mercer & Vail eval | `DealView` | Multi-stakeholder sales process, currently stalled |
| AI dev tools meetup | `EventView` | Date negotiation, venue swap, RSVPs, run-of-show |
| Saturday brunch? | `PlainThreadView` | The system declining to over-structure |

## Adding a new workspace

1. Add a `WorkspaceKind` entry in `lib/types.ts`.
2. Add a Zod schema and matching JSON schema in `lib/schemas.ts`.
3. Update `CLASSIFY_SYSTEM` and `extractSystem` in `lib/prompts.ts` to teach
   the LLM about the new workspace.
4. Add the case in `app/api/interpret/route.ts` (`extract` function).
5. Build a component under `components/workspaces/`.
6. Wire it into `app/page.tsx` and the toolbar `LABEL` map.
