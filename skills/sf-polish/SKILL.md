---
name: sf-polish
description: "Polish a Salesforce front-end surface after it works and passes review — make it feel right. Stack-aware: detects LWC, Aura, Experience Cloud (LWR), or React/headless clients and applies the matching design, accessibility (WCAG), and copy lens. Use when the user says 'polish this LWC', 'design review', 'make this feel right', 'accessibility pass', 'UX pass', 'clean up the UI', 'SLDS uplift check', or as the back 'bread' of the compound loop before compound. Skips pure Apex/Flow/metadata backend work."
argument-hint: "[blank to polish current branch UI changes, or name a component / app / surface]"
---

# /sf-polish

> **Persona dispatch.** This skill dispatches personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). The reviewers it dispatches (e.g. `sf-lwc-accessibility-guardian`, `sf-aura-migration-advisor`) are review personas referenced from `../sf-review/references/personas/`.

> **Principles enforced:** especially 1 (preserve the quality ceiling — the finished thing must feel right, not merely compile) and 5 (taste over typing — UX and copy are human-judgment calls). See `PRINCIPLES.md`.

This is the back "bread" of the compound loop. Correctness has passed `/sf-review`; now refine the experience: visual design, layout, accessibility, motion, and copy. It is **stack-aware** — it detects the front-end surface in scope and applies the right lens through a profile registry, so new Salesforce front-end stacks are added as profiles rather than rewrites.

Polish is a quality/taste pass, not a bug or governor hunt — that is `/sf-review`. Polish does not change Apex business logic.

## Step 1: Resolve scope and detect the surface

Resolve scope: a user-named component/app, else the branch diff (`git diff origin/main...`, falling back to `git diff HEAD`), else recently edited files.

Classify the changed files into front-end surfaces:

* `*.js` / `*.html` / `*.css` inside an `lwc/` bundle → **LWC**

* `*.cmp` / `*.app` / `*Controller.js` / `*Helper.js` inside `aura/` → **Aura**

* LWR / Experience Cloud bundles (`experiences/`, `digitalExperiences/`, themes/branding sets) → **Experience Cloud (LWR)**

* A React/TS/JSX client that talks to Salesforce via UI API / GraphQL / Lightning Out / a Heroku app → **React / headless**

**If no front-end surface is in scope, stop.** Report that polish does not apply to pure Apex/Flow/metadata work and point to `/sf-review`.

## Step 2: Select the stack profile

Each profile names the lens, the design system, and which existing personas/skills to dispatch. The registry is intentionally a table so new stacks (e.g. a future Salesforce front-end framework) drop in as one more row.

| Profile | Design system & lens | Dispatch |
| -------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LWC** | SLDS2 design tokens & styling hooks, Lightning Design Guidelines, Locker/LWS constraints | `/slds2-uplift` (token/styling-hook uplift) · `Task sf-lwc-accessibility-guardian` · `Task sf-lwc-architecture-strategist` (composition) · `Task sf-lwc-performance-oracle` (perceived performance) |
| **Aura** | Same SLDS lens, plus migration debt | `Task sf-lwc-accessibility-guardian` · `Task sf-aura-migration-advisor` (flag what should move to LWC) |
| **Experience Cloud (LWR)** | SLDS2 + branding sets / theme tokens, responsive + guest-user states | `/slds2-uplift` · `Task sf-lwc-accessibility-guardian` · `Task sf-lwc-performance-oracle` |
| **React / headless** | Design-system-agnostic visual quality + WCAG; respect the app's own design system if one exists | `Task sf-lwc-accessibility-guardian` (WCAG heuristics) — apply the cross-cutting checks below directly |

> **Adding a profile:** when Salesforce ships a new front-end stack, add a row here naming its design system, its accessibility baseline, and the personas/skills to dispatch. Do not branch the skill logic — the cross-cutting checks in Step 3 stay the same.

## Step 3: Apply the polish lens

Run the profile's dispatch in parallel (single message; omit `mode` so user permissions apply), then apply these cross-cutting checks to every profile:

1. **Visual design & composition** — spacing/rhythm, alignment, hierarchy, consistent use of the design system's tokens (no hardcoded hex/px where a token/styling hook exists). Avoid generic AI-slop layouts; match the surrounding Lightning experience.
2. **States** — loading (spinners/skeletons), empty, error, no-access, and overflow/long-text states all designed, not just the happy path.
3. **Accessibility (WCAG A/AA)** — keyboard navigation and focus order, ARIA roles/labels, color contrast, reduced-motion respect, screen-reader labels on icon-only buttons. This is a gate, not a nicety.
4. **Copy & microcopy** — labels, helptext, empty-state guidance, and error messages are clear, specific, and on-tone; errors say what happened and what to do next. Prefer custom labels for translatability.
5. **Motion** — transitions are purposeful and quick; nothing janky or gratuitous.

Apply safe refinements directly. Anything that would change data/business behavior is out of scope — flag it for `/sf-review` instead.

## Step 4: Verify

1. **Accessibility tests** — for LWC, run the accessibility Jest pass (`run_lwc_accessibility_jest_tests` via the salesforce-dx MCP, or the project's axe/jest-axe setup). No WCAG A/AA violations.
2. **Component tests** — run the bundle's Jest tests (`npm run test:unit -- <component>`); they must still pass.
3. **Visual confirmation** — where a preview is available (Local Dev / `sf lightning dev`, an org preview, or browser automation), capture before/after screenshots of the polished surface and the key states from Step 3. Note when no preview was possible.

## Step 5: Gate and output

**Gate (Principle 1):** no WCAG A/AA violations and no obvious UX/copy defects on the changed surface before declaring done.

Output: the detected profile, personas/skills dispatched, refinements applied (with rationale), accessibility result, screenshots (or why none), and anything deferred to `/sf-review` because it crossed into behavior change. In the `sf-lfg` pipeline, polished UI re-enters the TEST stage.