---
id: ADR 0070
title: "The local gate is the LADDER, and proving the checks can fail belongs to CI"
status: accepted
date: "2026-09-30"
item: W103
raised-by: ""
supersedes: ADR 0039 in part
amends: ""
resolves: ""
---

# ADR 0070 — The local gate is the LADDER, and proving the checks can fail belongs to CI

**Status:** accepted 2026-09-30 — [W103](../work-items/w103-the-local-gate-is-the-ladder.md), an item
outside any plan, asked for by the maintainer on [W96](../work-items/w96-the-counts-and-the-index-a-check-can-compare-and-q394.md)'s
precedent.
**Supersedes in part** [ADR 0039](0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md):
its rule that `npm run gate`'s last entry is the self-test runner no longer holds. Everything else in 0039
stands — the chain still climbs the ladder in order, the eight `:selftest` entries still run
CONCURRENTLY through one runner derived from the manifest, and the two that cannot share the tree still
run alone.
**Answers** the cost half of [Q133](../open-questions.md), which that row has asked since P8 and which
ADR 0039 explicitly did not decide.

## Context

1. **The split, measured on this tree.** `npm run gate` as the ladder alone is **245 s, EXIT 0**;
   `npm run selftests` is **1326 s wall, 2106 s serial-equivalent over 6 lanes**. The self-tests are
   **84% of the 1571 s a human used to wait for**, and the ratio is the point rather than either number.

2. **One lane is almost the whole of it.** *(**Two figures in this paragraph were WRONG and
   [W105](../work-items/w105-the-scratch-directory-is-namespaced.md) measured them**, which is why
   `doc/decisions/**` is in the record step. **`check:wiring:selftest` 3.0 s is 228.2 s** — 3.0 s is the
   cost of that lane EXITING AT ITS CONTROL, which is this item's own **finding 3**: the leftover
   `dev-dist/check-wiring-stub-27708.mjs` glob-matched `check-*.mjs`, `G3` reported a check the manifest
   never declares, and `check-wiring-selftest.mjs` returns `done(1)` immediately. *A lane that fails fast
   still reports a wall clock, and a per-lane table has no column for whether the lane ran.* And
   **`check:source:selftest` 82.7 s is 578.4 s**, 7.0x. Re-measured end to end, `npm run selftests`
   EXIT 0, 8/8 ok: 608.2 / 578.4 / 418.1 / 228.2 / 84.4 / 42.8 / 25.1 / 14.9 s, **wall 851.3 s**, 2000.1 s
   serial-equivalent. So **`check:docs:selftest` is 71% of the wall and not 98%**, and
   `check:source:selftest` is within 5% of it — the binding lane by five percent rather than by a factor,
   which makes the sentence below about ADR 0039 true of a narrower gap than it claims.)* Per lane, same run: `check:docs:selftest` **1298.9 s**,
   `check:markdown:selftest` 477.3 s, `check:spec:selftest` 125.1 s, `check:source:selftest` 82.7 s,
   `check:workers:selftest` 53.8 s, `check:policies:selftest` 43.2 s, `check:scheduler:selftest` 22.2 s,
   `check:wiring:selftest` 3.0 s. **`check:docs:selftest` alone is 98% of the 1324 s wall**, because six
   lanes run at once and it is the longest. *A concurrency win hides behind its slowest lane, and ADR 0039
   bought that win without anybody looking at which lane.*

3. **This cost was NEVER budgeted, and `doc/workflow.md` section 8 says so in its own table.** Three
   budget rows are met and always have been; the fourth reads *Proving the checks can fail — none has
   ever been set*. So there is no budget to breach here, only one to write down.

4. **[P11](../plans/p11-what-should-the-gate-prove.md)'s retro refused exactly this change, for a reason
   that expired today.** Of its five candidates, *move them off the gate* was refused because *"there is
   no CI, no workflow and no git hook — so it is two changes and the second needs a repository this one
   does not have."* The second thing exists as of `da7e6c7`: `.github/workflows/gate.yml` runs on every
   commit. **The refusal is discharged by its own stated condition rather than overruled.**

5. **CI can absorb it and has been measured doing so.** The first run on GitHub — a four-core runner,
   the first time the gate has ever run on Linux — was **33m1s and green**, every step including
   `npm run gate`. Thirty-three minutes costs nobody's attention when nobody is waiting.

6. **FOUR clauses bind the chain, not three, and W103 found three by reading.** `S11`, `S12` and `S13` in
   `scripts/check-source.mjs`; `G3`, `G4` and `G5` in `scripts/check-wiring.mjs`. `S12`, `S13` and `G4`
   were edited first, and then **`S11` fired on all eight `:selftest` entries at once** — *a check
   outside the gate is a check that does not exist*, which is the sentence `S11` was written for,
   catching its own author. It is recorded here because the next person to move an entry will find the
   same four and should not have to find them the same way.

7. **What this does NOT fix is [Q180](../open-questions.md)**, and that row already names the answer:
   ~2 531 process starts, one per probe, 137 s of pure interpreter boot at a healthy 54 ms and far worse
   when a machine's process creation degrades. Moving the cost off the local loop does not remove it.

## Decision

1. **`npm run gate` is the LADDER and nothing else** — `lint`, `typecheck`, the eight checks
   cheapest-first, L1-L5 in three runtimes, and both L6 runtimes. Fifteen entries, in ADR 0039's order.
   It is what a human waits for, and `S12` holds it to `GATE_CHAIN` both ways and in order.

2. **`npm run gate:full` is `npm run gate && npm run selftests`**, and it is what CI runs on every
   commit. `S13` holds that composed list by NAME, both parts, because losing `npm run gate` would run
   the self-tests over a tree no ladder checked and losing `npm run selftests` would mean nothing
   anywhere proves the checks can fail.

3. **Reachability is a property of the FULL chain.** `S11` and `check-wiring.mjs`'s `CHAIN` read
   `gate:full` one level deep — its own parts, with the `gate` part replaced by `gate`'s fifteen. **A
   missing `gate:full` makes the list EMPTY** rather than falling back to `gate`, so `G4` reports that
   nothing names the runner and `S11` that no check is reachable, which is what a deleted `gate:full`
   means.

4. **Nothing is deleted and no bound is lowered.** All eight self-tests, every probe and every grading
   still run in CI — the same property ADR 0039 preserved when it reordered the chain. *(This rule read
   **on every commit** until 2026-10-02, when the maintainer asked for `.github/workflows/gate.yml` to be
   a MANUAL trigger: `workflow_dispatch` alone, no `push` and no `pull_request`. The rule's substance
   stands — nothing is deleted, no bound is lowered, and `gate:full` still runs all eight — but its
   AUTOMATIC half is gone, so what this ADR moved off the local ladder is now something a person chooses
   to run rather than something that happens. Rule 2's reason, *CI is where that proof belongs: nobody is
   watching, and it runs on every commit*, has lost its second clause; consequence 2 below already prices
   exactly this case and is now the live reading rather than a hypothetical one.)*

## Consequences

1. **A human's loop is the ladder.** 245 s measured here, against 1571 s for both halves; on a machine
   whose process spawns are at [Q180](../open-questions.md)'s recorded 54 ms rather than this one's 100 ms
   it is lower again, and the honest form is the RATIO — the self-tests were 84% of the wait.

2. **Proving the checks can fail is now CI's, which makes CI load-bearing.** This is the cost, stated:
   if the workflow is disabled, deleted or never runs on a branch, that proof is simply unrun, and
   **rule 3 above does not detect it** — `S11` and `G4` read the MANIFEST, so they see a `gate:full` that
   composes both halves and cannot see whether anything ever executed it. `npm run gate:full` remains the
   one command that proves it locally, and section 8 names it.

3. **`check:docs:selftest` is the next thing to look at, not the split.** At 1298.9 s it is 98% of the
   self-test wall; halving the other seven would move the total by a few per cent.

   **DISCHARGED by [W104](../work-items/w104-the-snippet-loop-runs-concurrently.md)**, which made
   `check-docs`' own snippet loop concurrent at a declared width of eight: the lane is **1096 s ->
   624 s** (`check:docs` itself 9314 ms -> 4574 ms), measured before and after on one tree with the
   bands not overlapping. Derived from consequence 2's per-lane figures — this ADR's wall is CI's to
   measure and W104 did not re-run it — the self-test wall becomes **~649 s against 1324 s** and
   `gate:full` **~894 s against 1571 s**. **The sentence above stays true and its margin narrowed**:
   `check:docs:selftest` is still the binding lane, now at 624 s against `check:markdown:selftest`'s
   477.3, so what that second lane caps is the NEXT halving rather than this one. Beyond 477 s the
   group stops moving and a further 2x on this lane is worth ~1.3x on the wall.
   *(The 1298.9 s and 98% above are W103's own measurement and are left as it took them; the figures
   here are W104's.)*

4. **ADR 0039's own argument is unharmed.** It chose ORDER and CONCURRENCY as the two properties nobody
   had ever chosen, and both stand. What it did not choose — whether a human should wait for the
   concurrent half at all — is what this decides.
