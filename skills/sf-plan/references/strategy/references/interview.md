# Salesforce Strategy Interview

Loaded by `SKILL.md` at the start of Phase 1 and revisited per-section in Phase 2. Every section maps one-to-one to a section in `strategy-template.md`.

For each section: ask the opening question, evaluate against the quality bar, push back when the answer hits a named anti-pattern, and capture the final answer in the user's own language.

## Overall Rules

1. **Ask, don't prescribe.** No menu options for open answers (problem, approach, persona). Free-form. Reserve single-select for routing.
2. **Push back once, maybe twice.** Name the specific weakness and ask a sharper question. After two rounds, capture what you have and flag the section for next run. Do not spiral.
3. **Quote the user back at them.** Use their own words when challenging — paraphrasing softens the challenge.
4. **Keep answers to 1–3 sentences.** Longer usually hides vagueness. Ask them to pick the sentence that matters most.
5. **Don't leak anti-pattern names.** Don't say "that's a vanity metric" — just ask the sharper question.
6. **Honor the org context** set in Phase 0 (internal org / consulting engagement / ISV product). The examples below are tagged where the right answer differs by context.

---

## 1. Target Problem

**Opening question:** "What's the core business problem this Salesforce work solves — and what makes it hard right now?"

Strong answers name a specific business situation, identify the crux (a constraint, a broken process, a compliance/scale pressure) that isn't easy to route around, and are falsifiable.

**Anti-patterns and pushback:**

- **Goal stated as problem** ("we need to increase sales") → "That's a goal. What in the current process makes it hard — whose work, which step, breaks down today?"
- **Solution-shaped** ("we need a new LWC for case management" / "we need Agentforce") → "That's a solution. What outcome are reps/agents missing that the build would give them? Describe the world without the tool."
- **Tooling inventory** ("we have too many flows and triggers") → "That's a symptom of the implementation, not the business problem. What business outcome is suffering because of it?"
- **Too broad** ("our org is a mess") → "Narrow it to a situation you can affect this program — which process, which users, when does it hurt most?"
- **Vague wish** ("better reporting") → "Reporting on what, for whom, to make which decision they can't make today?"

**Capture:** One or two sentences naming the business situation and the crux. No solution language.

---

## 2. Our Approach

**Opening question:** "Given that problem, what's your approach — the guiding choice that makes it tractable on the Salesforce platform?"

This is the guiding policy, not the feature list and not the object model. It should rule things out.

Strong answers are a choice (implying alternatives not pursued), direct many downstream decisions, and sound like "we win by [doing X differently]" rather than "we build A, B, and C".

**Anti-patterns and pushback:**

- **Feature/metadata list** ("we'll build 3 objects, 5 flows, and a screen flow") → "That's a build list. What's the bet underneath it? Native-first vs. custom code? Declarative-first vs. Apex? Agentforce-led vs. UI-led? Name the choice that organizes the rest."
- **Platform truism** ("we'll follow Salesforce best practices") → "Everyone says that. What are you choosing that the obvious alternative isn't — clicks-not-code, a single source of truth, an integration-hub pattern, a managed-package boundary?"
- **Product description** ("we use Agentforce to deflect cases") → "That's what it does. What's the choice inside it — which work you're automating vs. deliberately leaving to humans, and why?"
- **Goal restated** ("our approach is to be the system of record") → "Still the goal. How do you get there — what guiding policy makes the daily build decisions?"
- **Multiple approaches at once** ("self-service, agent assist, and a partner portal") → "Pick the one that organizes the rest. Which is load-bearing?"
- **Doesn't connect to the problem** → "Draw the line from the problem you named to this approach. If there isn't one, one of them is wrong."

**Capture:** One or two sentences. Ideally implies "...so that [outcome tied to the problem]".

---

## 3. Who It's For

**Opening question:** "Who is the primary user, and what job are they hiring this for?"

Jobs-to-be-done framing. In Salesforce, name the role *and* the situation. Tag whether they are internal (reps, agents, ops, admins) or external (customers/partners on Experience Cloud), and — for ISV — whether the buyer (subscriber admin) differs from the end user.

Strong answers name one primary persona, identify them by role + situation (not licence type or demographic), and state a concrete job as a verb phrase.

**Anti-patterns and pushback:**

- **Too many primary personas** ("sales, service, marketing, and ops") → "If it's for every cloud, it's for none. Who drives the build decisions? The others can benefit."
- **Licence/demographic framing** ("Sales Cloud users") → "That's a licence, not a situation. What are they trying to do when they reach for this?"
- **Role without situation** ("service agents") → "Agents doing what — triaging a queue at peak, handling an escalation, closing a case on mobile? The situation is where the build matters."
- **Buyer/user conflation (ISV)** → "Who signs the contract vs. who clicks the button daily? Name both if they differ — they want different things."
- **Generic job** ("be more productive") → "Productive at what, specifically? They're hiring this to do *what*?"

**Capture:** Persona name + JTBD sentence, with internal/external tag. Example: "Service agents working a high-volume queue. They're hiring this to resolve routine cases without leaving the console or waiting on a senior."

---

## 4. Key Metrics

**Opening question:** "What 3–5 metrics will tell you whether the approach is working?"

Metrics are the feedback loop. In Salesforce, prefer business-outcome and adoption metrics over build-output counts.

Strong answers stay at 3–5, mix leading and lagging, could plausibly regress if the work got worse, and name where each lives (Lightning Usage App, a report/dashboard, EventLogFile, the data itself).

**Anti-patterns and pushback:**

- **Build-output metrics** ("# of flows shipped, # of objects, story points") → "Those measure the team, not the outcome. If you shipped twice as much and the business didn't move, is that a win?"
- **Go-live as a metric** ("deployed to production") → "That's a milestone, not a metric. What changes for users *after* go-live that you can watch?"
- **Vanity / cumulative** ("total logins, total records created") → "Those go up while the org rots. What's the rate or ratio that can regress — weekly active users in the app, adoption among the target profiles?"
- **Unmeasurable** ("user satisfaction") → "How do you check it on a Tuesday? CSAT survey, a specific report? If nowhere, can you start measuring it?"
- **Org-health confused with product success** ("governor limit headroom") → "Useful guardrail, but is it the point? Keep at most one platform-health metric; the rest should be business outcomes or adoption."

**Capture:** 3–5 metrics, each with a one-line definition and where it's measured. If undefined: "Where does this live today — Lightning Usage, a report, EventLogFile? If nowhere, is it something you can start capturing?"

---

## 5. Tracks

**Opening question:** "What are the 2–4 tracks of work you're investing in to execute the approach?"

Tracks are coherent investment areas, not feature lists and not a metadata inventory. Each is a named *domain of work* that several builds live inside.

Strong answers stay at 2–4, connect back to the approach, and are broad enough to hold multiple features.

**Anti-patterns and pushback:**

- **Feature/metadata list in disguise** ("track 1: Opportunity flow; track 2: a custom object; track 3: a dashboard") → "Those are builds. What investment area does each live inside? 'Lead-to-cash automation' might be one track with several builds under it."
- **Too many tracks** ("7 tracks this quarter") → "Seven starves each one. Which 2–3 are load-bearing? The rest fold in or drop."
- **Doesn't connect to approach** (approach: "clicks-not-code"; track: "a large Apex framework") → "How does that serve the approach? If it's a separate bet, name it as one."
- **Cloud names as tracks** ("Sales Cloud, Service Cloud") → "Those are product areas, not investment choices. What are you actually doing inside them that's different from doing nothing?"
- **One track only** → "With one track there's no real choice. What 2–3 things must this be good at, and how do they differ?"

**Capture:** 2–4 tracks. For each: a name, a one-line purpose, a short note on why it serves the approach.

---

## 6. Milestones (optional)

**Opening question:** "Any dated milestones worth anchoring — a go-live, a release/major-release window, a Salesforce release (Spring/Summer/Winter) dependency, a UAT gate, a contract renewal? Skip if none."

Capture only real, externally visible milestones. Default is to skip; don't invent them. If named, capture verbatim with dates.

---

## 7. Not Working On (optional)

**Opening question:** "Anything you've explicitly decided *not* to do right now — a tempting custom-code path, a premature framework (fflib, a custom permission engine), a cloud you're deferring? This is for things the team keeps being tempted by."

Clarity tool, not a blocker list. Skip by default. One sentence each if named.

---

## 8. Positioning / Enablement (optional)

**Opening question (ISV):** "Any positioning language — a one-liner, the value prop for subscriber admins? Skip if not yet."
**Opening question (internal / consulting):** "Any enablement/adoption message for the rollout — how you'll explain the change to the users who have to adopt it? Skip if not yet."

Skip by default. Keep to 2–3 lines if present.

---

## After the Interview

Once sections 1–5 are captured (plus any optional sections engaged), read `strategy-template.md`, fill it in, present the full draft in chat, offer one edit round, then write to `STRATEGY.md`.
