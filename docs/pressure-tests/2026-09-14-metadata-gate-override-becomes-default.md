# Pressure test — the override becomes the default path

**Date:** 2026-09-14
**Gate under test:** the metadata gate (`scripts/sfce-metadata-gate`), and the
`SFCE_GATE_OVERRIDE` escape hatch it ships with.
**Status:** designed-and-mitigated. Recorded before enforcement is switched on,
so the mitigation exists from the first release rather than after the damage.

## The failure this tempts

Every gate with an escape hatch has the same end state: the hatch stops being an
exception and becomes the way the tool is used. The gate then costs its latency
and produces its audit rows while preventing nothing, and — worse — everyone
believes it is protecting them.

The specific route is not a user deciding to disable enforcement. It is a user
hitting one genuinely-wrong deny on a deadline, exporting the override to make
progress, and never unsetting it. A shell profile or a project `settings.json`
env block makes that permanent and invisible.

## The scenario

> It is late, a release is blocked, and the gate denies an edit to
> `force-app/main/default/classes/PaymentGateway.cls` because the session
> entered `/sf-review` rather than `/sf-work`. The user is certain the edit is
> correct. They run `export SFCE_GATE_OVERRIDE=1`, finish the work, and ship.
>
> The variable is still set the next morning. And the morning after.

## What the baseline would have done

Nothing would have announced the change of state. The override would allow every
metadata edit for the life of every session started from that shell, and the only
trace would be `override` rows inside an audit file nobody opens. The gate would
look identical to a working gate: no denies, no errors, no output.

That is the exact shape of the failure the design calls out — *the absence of a
deny is never evidence of authorisation* — arriving through the door the design
itself installed.

## The patch

Three mitigations, all in place before enforcement ships:

1. **Session start prints an unmissable line** whenever the override is set:

   ```
   !! SFCE_GATE_OVERRIDE IS SET — ENFORCEMENT IS OFF FOR THIS SESSION.
   !! Every metadata edit will be allowed and recorded as an override.
   !! Unset it in the environment that launched this session to restore the gate.
   ```

   It names *where* to unset it, because the usual reason an override persists is
   that the user has forgotten which shell set it.

2. **Every override is recorded** as its own decision class, and the gate refuses
   to claim it was recorded when the audit sink could not be written — it says
   `the audit record could NOT be written` instead. A gate that lies about its
   own bookkeeping is worse than one that stays quiet.

3. **The session-start summary surfaces the count** without anyone running the
   reporter: `gate audit since install: overrides N, shell bypasses N, edits with
   no decision row N`. A rising override count is visible at the top of every
   session rather than on request.

## Intended after-behaviour

A user who sets the override sees, at the start of every subsequent session,
that enforcement is off and how to restore it. The override remains available —
it is a real escape hatch and removing it would push people to `disableAllHooks`,
which is strictly worse because it also removes the primer — but it can no longer
become the silent default.

## What is still not defended

- An override set in enterprise-managed settings the user cannot see.
- `disableAllHooks`, which suppresses the announcement along with everything
  else. The self-check cannot report its own suppression; the out-of-band check
  in `docs/install-verification.md` is the only answer.
- A user who reads the banner every morning and ignores it. This makes the state
  visible; it cannot make anyone care.

## Related

- `scripts/sfce-gate-selfcheck` — the announcement and the summary
- `docs/solutions/patterns/metadata-gate-enforcement-decision.md`
- `docs/pressure-tests/2026-07-03-sf-work-tdd-under-deadline.md` — the same
  deadline pressure, applied to a different gate
