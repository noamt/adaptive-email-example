import type { Thread } from "./types";

// Hand-authored fixtures. Realism beats volume here — every message earns its
// place. The contract thread carries weight because it sounds like lawyers,
// not chatbots; the sales thread carries weight because the sentiment
// trajectory is non-monotonic; the personal thread carries weight because
// the demo trusts itself to do *less*.

const iris = { name: "Iris ten Teije", email: "iris@northwind.ai" };

// ─── Thread 1 ────────────────────────────────────────────────────────────────
// Contract negotiation: Northwind (vendor) ↔ Hartwell Industries (customer).
// Three live redline threads: indemnification cap, termination for convenience,
// data residency. State on demo open: v4 sent by Hartwell, awaiting Northwind
// response on cap + data residency. Tom from procurement is escalating timing.

const contract: Thread = {
  id: "contract-hartwell-msa",
  subject: "Hartwell MSA — v3 (and counting)",
  participants: [
    "Marcus Webb",
    "Tom Beckett",
    "Priya Raman",
    "Sarah Chen",
    "Jennifer Hayes",
    "David Liu",
  ],
  preview:
    "Sarah — circling back on v4. We need to lock cap and data residency this week to keep procurement on track…",
  unread: true,
  starred: true,
  messages: [
    {
      id: "c1",
      from: { name: "Marcus Webb", email: "marcus@northwind.ai" },
      to: [{ name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" }],
      cc: [{ name: "Sarah Chen", email: "sarah.chen@northwind.ai" }],
      date: "2026-04-14T15:42:00Z",
      subject: "Hartwell MSA — v3",
      body: `Tom,

Per Friday's call, sending MSA v3 with the changes we discussed:
  • Auto-renewal language softened (annual opt-out window)
  • SLA credit cap pulled out into Schedule B
  • Subprocessor list moved to a referenced URL so we can update without re-papering

Looping Sarah (our GC) so she's on thread for any redline pass.

Best,
Marcus`,
      attachments: [{ filename: "Northwind_Hartwell_MSA_v3.docx", size_kb: 184 }],
    },
    {
      id: "c2",
      from: { name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" },
      to: [{ name: "Priya Raman", email: "praman@hartwellindustries.com" }],
      cc: [{ name: "Marcus Webb", email: "marcus@northwind.ai" }],
      date: "2026-04-14T17:08:00Z",
      body: `Priya — passing to you for legal review. Marcus is on thread; ping him directly with anything substantive. Goal is to wrap before quarter-end so let me know if I can unblock anything.

Tom`,
    },
    {
      id: "c3",
      from: { name: "Priya Raman", email: "praman@hartwellindustries.com" },
      to: [{ name: "Marcus Webb", email: "marcus@northwind.ai" }],
      cc: [
        { name: "Sarah Chen", email: "sarah.chen@northwind.ai" },
        { name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" },
      ],
      date: "2026-04-17T19:22:00Z",
      subject: "Re: Hartwell MSA — v3",
      body: `Marcus, Sarah —

Reviewed v3. Most of it is workable. Three substantive items where we can't sign as drafted:

1. §11.2 Indemnification cap. Drafted at 1x annual fees. Per Hartwell standard for vendors handling regulated data we need 2x. Happy to discuss carve-outs (IP infringement, willful breach) but the floor needs to move.

2. §14 Termination. As drafted there is no termination for convenience. We require TFC for any net-new vendor relationship — this isn't negotiable on our side, but the notice period and any wind-down fee is.

3. §6.4 Data residency. Current draft references "primarily US data centers." We need an EU-only option for our UK and DE business units, and an explicit guarantee that customer data is not replicated outside the elected region.

Suggested redlines attached as v3-HW. Happy to jump on a call this week if helpful.

Priya`,
      attachments: [
        { filename: "Northwind_Hartwell_MSA_v3-HW-redlines.docx", size_kb: 192 },
      ],
    },
    {
      id: "c4",
      from: { name: "Sarah Chen", email: "sarah.chen@northwind.ai" },
      to: [{ name: "Priya Raman", email: "praman@hartwellindustries.com" }],
      cc: [
        { name: "Marcus Webb", email: "marcus@northwind.ai" },
        { name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" },
        { name: "David Liu", email: "david@northwind.ai" },
      ],
      date: "2026-04-18T14:11:00Z",
      body: `Priya,

Thanks for the prompt turn. Looping in David (our CRO) for visibility.

On (1): we can move to 1.5x annual fees with the standard carve-outs you noted (IP infringement, willful breach, breach of confidentiality). 2x is outside our policy band and would require board sign-off — given timing I'd suggest 1.5x is the path.

On (2): I'll come back on this separately, want to align internally first.

On (3): EU-only is straightforward and we can commit to no cross-region replication. We'll need to add language around backups (encrypted at rest, region-locked) — Marcus can pull our standard rider.

Best,
Sarah`,
    },
    {
      id: "c5",
      from: { name: "Marcus Webb", email: "marcus@northwind.ai" },
      to: [{ name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" }],
      cc: [{ name: "Sarah Chen", email: "sarah.chen@northwind.ai" }],
      date: "2026-04-18T14:44:00Z",
      body: `Tom — while legal is going back and forth, want to make sure we hold the start date. Friday 2pm for a 30-min sync?

Marcus`,
    },
    {
      id: "c6",
      from: { name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" },
      to: [{ name: "Marcus Webb", email: "marcus@northwind.ai" }],
      date: "2026-04-18T16:02:00Z",
      body: `Friday 2pm works. Sending an invite.

Sent from my phone`,
    },
    {
      id: "c7",
      from: { name: "Priya Raman", email: "praman@hartwellindustries.com" },
      to: [{ name: "Sarah Chen", email: "sarah.chen@northwind.ai" }],
      cc: [
        { name: "Marcus Webb", email: "marcus@northwind.ai" },
        { name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" },
        { name: "Jennifer Hayes", email: "jhayes@hartwellindustries.com" },
      ],
      date: "2026-04-21T13:30:00Z",
      body: `Sarah,

Looping in Jennifer (our VP IT, deal sponsor) on the TFC point so we can resolve directly.

Jennifer — Northwind has pushed back on termination for convenience. Per our policy this is required for net-new vendors. Can you weigh in on whether there's flexibility here or if it's a hard requirement?

Priya`,
    },
    {
      id: "c8",
      from: { name: "Jennifer Hayes", email: "jhayes@hartwellindustries.com" },
      to: [{ name: "Priya Raman", email: "praman@hartwellindustries.com" }],
      cc: [
        { name: "Sarah Chen", email: "sarah.chen@northwind.ai" },
        { name: "Marcus Webb", email: "marcus@northwind.ai" },
        { name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" },
      ],
      date: "2026-04-21T15:18:00Z",
      body: `TFC is a hard requirement — same posture we've held with every vendor onboarded in the last 18 months. We can be flexible on notice period (90+ days is fine) and on a reasonable wind-down/early-termination fee, but the right itself is non-negotiable.

Happy to find a structure that works on the economics. Let's not let this stall the deal.

Jennifer`,
    },
    {
      id: "c9",
      from: { name: "Sarah Chen", email: "sarah.chen@northwind.ai" },
      to: [{ name: "Jennifer Hayes", email: "jhayes@hartwellindustries.com" }],
      cc: [
        { name: "Priya Raman", email: "praman@hartwellindustries.com" },
        { name: "Marcus Webb", email: "marcus@northwind.ai" },
        { name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" },
        { name: "David Liu", email: "david@northwind.ai" },
      ],
      date: "2026-04-22T18:50:00Z",
      body: `Jennifer, Priya —

Understood. We can offer the following structure on §14:

  • Termination for convenience permitted after the end of Year 1
  • 180 days' written notice required
  • Wind-down fee equal to 50% of remaining committed fees, waived if termination is for documented service-level failures

This preserves our committed-revenue posture while giving you a real out. Happy to sit on a call with David and walk through the rationale if useful.

Sarah`,
    },
    {
      id: "c10",
      from: { name: "Priya Raman", email: "praman@hartwellindustries.com" },
      to: [{ name: "Sarah Chen", email: "sarah.chen@northwind.ai" }],
      cc: [
        { name: "Marcus Webb", email: "marcus@northwind.ai" },
        { name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" },
        { name: "Jennifer Hayes", email: "jhayes@hartwellindustries.com" },
      ],
      date: "2026-04-24T20:05:00Z",
      subject: "MSA v4 — proposed close-out language",
      body: `Sarah —

Drafting the structure you proposed into v4 (attached). Two notes:

  • TFC: we accepted the post-Y1, 180-day, 50%-wind-down framing. Tightened wind-down trigger to "material and uncured" service-level failures (>30 days).

  • Data residency: incorporated EU-only election with cross-region replication prohibition. Added explicit DPA reference. Please confirm the encrypted-at-rest / region-locked backup language in §6.4(c) reads correctly on your end.

Still open: indemnification cap. We're at 1.5x in the current draft but that's not signed off on our side — Jennifer wants me to push back to 2x given the regulated-data scope. Can we have one more pass?

Priya`,
      attachments: [
        { filename: "Northwind_Hartwell_MSA_v4.docx", size_kb: 198 },
        { filename: "DPA_Schedule_C.docx", size_kb: 84 },
      ],
    },
    {
      id: "c11",
      from: { name: "Priya Raman", email: "praman@hartwellindustries.com" },
      to: [{ name: "Sarah Chen", email: "sarah.chen@northwind.ai" }],
      cc: [
        { name: "Marcus Webb", email: "marcus@northwind.ai" },
        { name: "Tom Beckett", email: "tbeckett@hartwellindustries.com" },
      ],
      date: "2026-04-26T16:14:00Z",
      body: `Sarah — circling back on v4. We need to lock cap and data residency this week to keep procurement on track. Tom is happy to set up a call. Can you come back with a position on indemnification by Wednesday?

Priya`,
    },
  ],
};

// ─── Thread 2 ────────────────────────────────────────────────────────────────
// Sales thread: Northwind selling to Mercer & Vail. Trajectory:
// discovery → strong eval → CFO pricing pushback → security review delay → stalled.
// State on demo open: awaiting security signoff and pricing resolution.

const sales: Thread = {
  id: "sales-mercer-vail",
  subject: "Mercer & Vail — eval → commercials",
  participants: [
    "Alex Reyes",
    "Dana Pham",
    "Ben Cole",
    "Lisa Park",
    "Raj Mehta",
    "Erin Schulz",
  ],
  preview:
    "FYI security is taking longer than expected. Erin has a backlog. Pricing also still open. Will push for a path forward this week.",
  unread: true,
  messages: [
    {
      id: "s1",
      from: { name: "Alex Reyes", email: "alex@northwind.ai" },
      to: [{ name: "Ben Cole", email: "ben.cole@mercervail.com" }],
      date: "2026-03-15T17:30:00Z",
      subject: "Discovery call — Tuesday 11am?",
      body: `Ben — thanks for the reply on LinkedIn. Tuesday at 11am pacific works on my end. I'll send an invite. Want to make sure we keep this 30 minutes and focused on what you actually care about — happy to get into specifics on the data pipeline side or stay higher-level depending on where you are.

Alex`,
    },
    {
      id: "s2",
      from: { name: "Ben Cole", email: "ben.cole@mercervail.com" },
      to: [{ name: "Alex Reyes", email: "alex@northwind.ai" }],
      date: "2026-03-15T18:14:00Z",
      body: `Sounds good. I'll bring our infra lead — we're actively looking at this space and have done some homework so we'll come with questions.

Ben`,
    },
    {
      id: "s3",
      from: { name: "Alex Reyes", email: "alex@northwind.ai" },
      to: [{ name: "Ben Cole", email: "ben.cole@mercervail.com" }],
      cc: [{ name: "Dana Pham", email: "dana@northwind.ai" }],
      date: "2026-03-18T22:02:00Z",
      subject: "Recap + proposed eval",
      body: `Ben — appreciated the depth of the conversation, your team is clearly further along than most we talk to. Quick recap of what I heard:

  • Current pipeline: Airflow + a custom event bus, breaking down at >200M events/day
  • Pain: lineage and replay, not throughput per se
  • Decision criteria, in order: lineage primitives, ops burden, cost
  • Timeline: want to make a call before end of Q2

Proposing a 3-week structured eval against your top two use cases. Dana (cc) leads our SE team and will own that with you. We'll set up a sandbox by EOW.

Alex`,
    },
    {
      id: "s4",
      from: { name: "Dana Pham", email: "dana@northwind.ai" },
      to: [{ name: "Ben Cole", email: "ben.cole@mercervail.com" }],
      cc: [{ name: "Alex Reyes", email: "alex@northwind.ai" }],
      date: "2026-03-22T16:45:00Z",
      subject: "Sandbox is ready",
      body: `Ben — sandbox provisioned. Creds in the attached doc (one-time link, expires in 48h). Walked through the lineage primitives in Loom, link below. Ping me on Slack-Connect if anything's unclear; I'll be on for the eval period.

Loom: [redacted]
Sandbox: [redacted]

Dana`,
    },
    {
      id: "s5",
      from: { name: "Ben Cole", email: "ben.cole@mercervail.com" },
      to: [{ name: "Dana Pham", email: "dana@northwind.ai" }],
      cc: [
        { name: "Alex Reyes", email: "alex@northwind.ai" },
        { name: "Lisa Park", email: "lisa.park@mercervail.com" },
      ],
      date: "2026-03-28T20:11:00Z",
      body: `Dana — first week of the eval went better than I expected. Lineage replay on the order-events stream worked out of the box, which is the thing my team has been hand-rolling for a year. Good call on the sandbox shape.

Looping in Lisa, my VP. Lisa has been hearing about this from me for a few weeks; want to start aligning on commercial framing in parallel with the eval.

Ben`,
    },
    {
      id: "s6",
      from: { name: "Lisa Park", email: "lisa.park@mercervail.com" },
      to: [{ name: "Alex Reyes", email: "alex@northwind.ai" }],
      cc: [{ name: "Ben Cole", email: "ben.cole@mercervail.com" }],
      date: "2026-04-01T15:22:00Z",
      body: `Alex — Ben has briefed me. Eval is going well from where I sit. Ready to start the commercial conversation in parallel — assume we'll close the eval cleanly.

Lisa`,
    },
    {
      id: "s7",
      from: { name: "Alex Reyes", email: "alex@northwind.ai" },
      to: [{ name: "Lisa Park", email: "lisa.park@mercervail.com" }],
      cc: [{ name: "Ben Cole", email: "ben.cole@mercervail.com" }],
      date: "2026-04-03T14:08:00Z",
      subject: "Pricing proposal",
      body: `Lisa — appreciate the directness. Proposal:

  • $180k ACV, 3-year term
  • Includes the full pipeline + lineage suite, unlimited environments
  • 10% multi-year discount baked in (would be $200k on a single-year)
  • Standard onboarding + named CSM through go-live, then quarterly business reviews

Numbers are based on the volume profile Ben shared. Happy to walk through line by line on a call. We've held this for similar profiles in the last quarter so I'd rather not start from a discount conversation, but I'm always open to the right structure.

Alex`,
    },
    {
      id: "s8",
      from: { name: "Lisa Park", email: "lisa.park@mercervail.com" },
      to: [{ name: "Alex Reyes", email: "alex@northwind.ai" }],
      cc: [{ name: "Raj Mehta", email: "raj.mehta@mercervail.com" }],
      date: "2026-04-08T13:55:00Z",
      body: `Alex — looping in Raj, our CFO. Raj has been part of our infra-tooling budget conversation and will need to weigh in on the commercials. Pricing in Alex's last note.

Lisa`,
    },
    {
      id: "s9",
      from: { name: "Raj Mehta", email: "raj.mehta@mercervail.com" },
      to: [{ name: "Alex Reyes", email: "alex@northwind.ai" }],
      cc: [{ name: "Lisa Park", email: "lisa.park@mercervail.com" }],
      date: "2026-04-10T19:33:00Z",
      body: `Alex,

Stepping in here. The $180k ACV is well above the band we benchmarked when we scoped this initiative. Our reference point for tooling at this layer was $90–110k, based on what comparable vendors quoted us in Q4.

I understand the value the team is seeing in the eval, and I'm not anchoring on the floor of that range. But we're not going to land at $180k. If there's a path to a number that starts with a 1, term length and structure is a conversation; if not, we should regroup.

Raj`,
    },
    {
      id: "s10",
      from: { name: "Alex Reyes", email: "alex@northwind.ai" },
      to: [{ name: "Raj Mehta", email: "raj.mehta@mercervail.com" }],
      cc: [{ name: "Lisa Park", email: "lisa.park@mercervail.com" }],
      date: "2026-04-11T17:01:00Z",
      body: `Raj — appreciate the clarity, this is the kind of conversation I'd rather have early than late.

Couple of structures we could explore:

  • Usage-based model: lower committed floor (~$120k) with tiered overages above your forecasted volume. You pay for what you use, we share risk on the upside.
  • Phased: Year 1 at a reduced rate ($130k) with step-ups in Years 2 and 3 tied to specific expansion criteria.

Either keeps the relationship structurally healthy without distorting our reference price for similar deals. Want to put 30 minutes on the calendar to walk through both?

Alex`,
    },
    {
      id: "s11",
      from: { name: "Erin Schulz", email: "erin.schulz@mercervail.com" },
      to: [{ name: "Alex Reyes", email: "alex@northwind.ai" }],
      cc: [{ name: "Ben Cole", email: "ben.cole@mercervail.com" }],
      date: "2026-04-15T22:40:00Z",
      subject: "Security review — questionnaire",
      body: `Alex —

Erin from infosec at Mercer & Vail. Per our process, before we can proceed to commit we'll need:

  1. Current SOC 2 Type 2 report
  2. List of subprocessors with regions
  3. Most recent third-party pen test summary (executive)
  4. Completed copy of our standard vendor security questionnaire (attached)
  5. Any data residency / regional controls relevant to EU and UK

Heads up — our review queue is currently 2–3 weeks. I'll prioritize once I have a complete package back.

Erin`,
      attachments: [
        { filename: "MV_Vendor_Security_Questionnaire_v9.xlsx", size_kb: 122 },
      ],
    },
    {
      id: "s12",
      from: { name: "Ben Cole", email: "ben.cole@mercervail.com" },
      to: [{ name: "Alex Reyes", email: "alex@northwind.ai" }],
      date: "2026-04-22T23:17:00Z",
      body: `Alex — quick FYI, security is taking longer than I'd hoped. Erin has a backlog from the Q1 audit and we're behind her. Pricing is also still unresolved on Raj's side; he hasn't come back on the structures you offered.

I'm pushing internally for a path forward this week. Just want to be transparent that we're not in great shape on timing and I don't want you guessing.

Ben`,
    },
  ],
};

// ─── Thread 3 ────────────────────────────────────────────────────────────────
// Personal note. The point is the system *not* over-applying.

const personal: Thread = {
  id: "personal-amelia-brunch",
  subject: "saturday?",
  participants: ["Amelia Reed"],
  preview: "11:30? I can grab the table.",
  unread: true,
  messages: [
    {
      id: "p1",
      from: { name: "Amelia Reed", email: "amelia.reed@gmail.com" },
      to: [iris],
      date: "2026-05-04T20:13:00Z",
      subject: "saturday?",
      body: `hey — are you free this saturday? thinking brunch at the place on valencia. been ages.

a x`,
    },
    {
      id: "p2",
      from: iris,
      to: [{ name: "Amelia Reed", email: "amelia.reed@gmail.com" }],
      date: "2026-05-04T22:01:00Z",
      body: `yes!! what time`,
    },
    {
      id: "p3",
      from: { name: "Amelia Reed", email: "amelia.reed@gmail.com" },
      to: [iris],
      date: "2026-05-05T09:40:00Z",
      body: `11:30? i can grab the table`,
    },
  ],
};

// ─── Thread 4 ────────────────────────────────────────────────────────────────
// Meetup planning. A 12-message scheduling thread with the usual pain: date
// conflict, venue swap, speaker confirmation, late attendee logistics, dietary
// roster, deadlines. State on demo open: confirmed for May 21 at Mission
// Workshop; awaiting Sam's title/abstract and dietary list to Maya by May 18.

const meetup: Thread = {
  id: "meetup-ai-dev-tools",
  subject: "AI dev tools meetup — late May?",
  participants: [
    "Iris ten Teije",
    "Mara Yi",
    "Theo Park",
    "Maya Singh",
    "Sam Hartman",
    "Jess Tan",
  ],
  preview:
    "Jess — totally fine, social part starts at 7:45 so even if you're 30 min late you'll catch most of Sam's…",
  unread: true,
  messages: [
    {
      id: "m1",
      from: iris,
      to: [{ name: "Mara Yi", email: "mara@northwind.ai" }],
      cc: [{ name: "Theo Park", email: "theo@northwind.ai" }],
      date: "2026-05-01T21:30:00Z",
      subject: "AI dev tools meetup — late May?",
      body: `Hey both —

Thinking we should do another small AI dev tools meetup this month. Aiming for ~25 people, ideally before EOM. Two date options: Thu May 14 or Thu May 21.

Mara — venue ideas? Was thinking Mission Workshop or Founders Den. Theo — would you be willing to do a 10-min lightning talk on the lineage primitives stuff?

Iris`,
    },
    {
      id: "m2",
      from: { name: "Mara Yi", email: "mara@northwind.ai" },
      to: [iris],
      cc: [{ name: "Theo Park", email: "theo@northwind.ai" }],
      date: "2026-05-01T23:02:00Z",
      body: `+1, let's do this. May 21 conflicts with our offsite, so May 14 if you can swing it. Mission Workshop has been good — I'll reach out tomorrow.

Theo, you on for the LT?`,
    },
    {
      id: "m3",
      from: { name: "Theo Park", email: "theo@northwind.ai" },
      to: [iris, { name: "Mara Yi", email: "mara@northwind.ai" }],
      date: "2026-05-02T16:11:00Z",
      body: `in for the talk! but i can't do may 14 — visa appt that morning. may 21 works tho 🙏`,
    },
    {
      id: "m4",
      from: iris,
      to: [
        { name: "Mara Yi", email: "mara@northwind.ai" },
        { name: "Theo Park", email: "theo@northwind.ai" },
      ],
      date: "2026-05-02T18:40:00Z",
      body: `ok new plan — May 21 it is. Mara, can you flip the venue check? Theo, glad you're in 🎤`,
    },
    {
      id: "m5",
      from: { name: "Mara Yi", email: "mara@northwind.ai" },
      to: [{ name: "Maya Singh", email: "maya@missionworkshop.co" }],
      cc: [iris],
      date: "2026-05-04T17:18:00Z",
      subject: "Mission Workshop — Thu May 21 evening",
      body: `Hi Maya —

Mara from Northwind. We'd like to do a small evening meetup at Mission Workshop, ~25 ppl, Thu May 21, 6-9pm. Standard layout (chairs + standing area). Any AV included?

Thanks,
Mara`,
    },
    {
      id: "m6",
      from: { name: "Maya Singh", email: "maya@missionworkshop.co" },
      to: [{ name: "Mara Yi", email: "mara@northwind.ai" }],
      cc: [iris],
      date: "2026-05-04T22:52:00Z",
      body: `Hi Mara —

May 21 is open, capacity is fine for 25. AV: projector + mic included; we have an HDMI and a USB-C dongle on hand.

One note: we have a 28-person hard cap on weekday evenings (fire code). Catering can be arranged via our partner — let me know dietary needs by Mon May 18 if you go that route. Standard rate is $850 for the evening.

Maya`,
    },
    {
      id: "m7",
      from: iris,
      to: [
        { name: "Mara Yi", email: "mara@northwind.ai" },
        { name: "Theo Park", email: "theo@northwind.ai" },
      ],
      date: "2026-05-05T01:30:00Z",
      body: `Good, $850 we can absorb on the team budget. Mara — let's lock it in with Maya. Going to send the invite list tomorrow; will share dietary roster once RSVPs come back.`,
    },
    {
      id: "m8",
      from: { name: "Sam Hartman", email: "sam.hartman@gmail.com" },
      to: [iris],
      date: "2026-05-05T15:14:00Z",
      subject: "Re: meetup speaker?",
      body: `Iris —

Heard from Mara you're doing the meetup on the 21st — would you want a 20-min talk on agent observability? Happy to drop in. Just need 24h notice on AV needs (have a custom HDMI dongle situation).

Sam`,
    },
    {
      id: "m9",
      from: iris,
      to: [{ name: "Sam Hartman", email: "sam.hartman@gmail.com" }],
      date: "2026-05-05T16:02:00Z",
      body: `Yes! That's perfect. Mission Workshop has projector + mic and standard dongles, so you should be set — but bring your own to be safe.

Plan: 6:00 doors, 6:30 your talk + Q&A (20+10), 7:30 Theo's lightning talk, 7:45 social to 9. Sound good?

Iris`,
    },
    {
      id: "m10",
      from: { name: "Sam Hartman", email: "sam.hartman@gmail.com" },
      to: [iris],
      date: "2026-05-05T16:18:00Z",
      body: `Works. I'll send a title + abstract by Fri so you can put it on the invite.

Sam`,
    },
    {
      id: "m11",
      from: { name: "Jess Tan", email: "jess@nybuilds.dev" },
      to: [iris],
      date: "2026-05-07T05:05:00Z",
      body: `Hi Iris —

Coming in from NYC, my flight lands at SFO 5:30pm that day. Realistic for me to make a 6 start? If not, totally fine to skip — just don't want to be the rude latecomer.

Also: I'm vegetarian if you're tracking that for catering.

Jess`,
    },
    {
      id: "m12",
      from: iris,
      to: [{ name: "Jess Tan", email: "jess@nybuilds.dev" }],
      cc: [{ name: "Mara Yi", email: "mara@northwind.ai" }],
      date: "2026-05-07T16:22:00Z",
      body: `Jess — totally fine, social part starts at 7:45 so even if you're 30 min late you'll catch most of Sam's. Will note vegetarian.

Mara — let's plan to send Maya the dietary list by May 18 (her deadline). I'll start collecting RSVPs.

Iris`,
    },
  ],
};

export const THREADS: Thread[] = [contract, sales, meetup, personal];

export const THREADS_BY_ID = Object.fromEntries(THREADS.map((t) => [t.id, t]));
