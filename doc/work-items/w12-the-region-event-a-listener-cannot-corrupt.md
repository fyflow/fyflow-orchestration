# W12 — The region event a listener cannot corrupt

**Status:** done — built, gate green, both readers RUN and every finding acted on. *(This read `in review ... both readers owed` until 2026-10-03, while this file's own Record read *"built, both readers run, every finding acted on, gate re-run"*. Found by `npm run state`. [W114](w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md))*
**Plan:** [P4](../plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) — the first of its
three items, and the only one with nothing to decide

```
Spec:       spec/outcome-record.md OR-R7, and ADR 0014's rule that every element
            of the fold's input sequence leaves as a frozen copy. This item
            writes no spec and changes none: the rules already say what the code
            must do, and the code does not do it. That is why it needs no ADR
Owns:       src/driver/driver.ts, test/driver/**
            — taken over from W3, which is done. P4's "Which files this plan
            takes over" table is the declaration; W13 takes the same two files
            AFTER this item, never concurrently
            plus two declared exceptions (doc/workflow.md section 7 rule 2):
              - AGENTS.md, for section 10 only. It is W9's file and W13's Owns,
                and its sentence is WRONG the moment this ships, so correcting it
                is part of the fix rather than follow-up
              - doc/open-questions.md, for the rows this item's Reserves block
                allocates. Section 1 rule 5's record-step list does NOT include
                this file, yet a Reserves: line obliges every item to write to
                it — every item back to W4 has edited it undeclared. Declared
                here, and raised for P4's retro as a gap in rule 5 rather than
                as this item's lapse (W12's conformity reader, N1)
Inputs:     Q73, as measured rather than as written: onRegionEvent's argument is
            not frozen, and a listener writing e.branchPath makes the driver's
            own foldInputs() read the mutated value. Reproduced against the
            code before this item was declared. The three outbound paths that
            DO freeze — snapshot(), foldInputs(), onFoldInput via freezeInput —
            are the shape to match
Outputs:    (1) onRegionEvent receives a frozen copy; (2) a test that fails if
            it stops being one, for EACH of the four outbound paths rather than
            only the one being fixed; (3) AGENTS.md section 10's exception to
            "anything the driver gives you is safe" deleted — the sentence is
            wrong once this ships
Depends on: nothing. It is one line of src/ and does not touch the surface
Blocks:     W13, which rewrites the same file
Tests:      L1. The expected value comes from OR-R7 and ADR 0014, not from the
            code: every value the driver hands outward is a frozen copy, so the
            assertion is Object.isFrozen on what the listener receives, PLUS a
            mutation attempt whose failure is observed in foldInputs(). A test
            that only checks isFrozen would pass against a frozen alias of the
            live object, which is the mistake OR-R1 exists to name
Gate:       L0 (typecheck, lint, check:docs — the reference is edited) and L1.
            All five runtimes, since no scheduler is involved. Then pass 2 as
            doc/workflow.md section 6 defines it — TWO readers
Reserves:   Q81-Q83, ADR — none. See Spec above
```

**Every line is fillable.** The one that had to be settled first was `Inputs:` — whether Q73 is true
at all — and P4 reproduced it before this was declared.

---

## Scope

**In**

1. **`emit()` hands `onRegionEvent` a frozen copy** — the same object it stores, so a listener and
   a later `foldInputs()` reader cannot be shown different values. *(This clause originally argued
   "two copies would be two truths". **That argument does not apply and is withdrawn**: `freezeInput`
   already makes a second copy for `onFoldInput` and for every `foldInputs()` reader, and did so
   before this item. W12's conformity reader, N3. The real reason to store the frozen one is that
   `append` would otherwise store a live object behind a frozen wrapper.)*
2. **A test per outbound path, not per bug.** *(This clause said there were **four** paths and that
   **none** of the three already-correct ones had a guard. **Both halves are false and both readers
   found it.** There are **eleven** — `OR-R7` ranges over the whole surface, not over the four
   ADR 0014 names — and `test/driver/fold-inputs.test.ts` and `surface.test.ts` already caught three
   of this item's five provocations. What was genuinely missing is the **alias-vs-copy and deep-copy**
   half on most paths, and **all six region-event variants**: a fixture emitting only
   `branch.opened` cannot guard the other five, which the adequacy reader demonstrated with three
   surviving mutations. The suite now covers eleven paths, six variants and two distinct region ids.)*
3. **`AGENTS.md` section 10's exception is deleted** (line 656: *"`onRegionEvent` is the exception —
   it hands you the driver's own live object"*). The gate re-runs the reference's snippets, so the
   deletion is checked.

**Out** — named rather than left implicit, with where it goes instead

- **`Object.freeze` being shallow.** A `RegionEvent`'s six fields are all primitives
  (`spec/join-policy.md` section 2), so a shallow freeze is the whole copy. **If that stops being
  true, `freezeInput` is already wrong in the same way** and it is a finding for the Record, not a
  fix here.
- **The surface change** — `start`, `hasFailed`, `failedRuns`. That is [W13](w13-one-driver-one-run-fixed-at-construction.md).
- **Freezing what a `JoinPolicy` sees.** `emit()` steps the policy with `e` before appending. A
  policy is *ours* in a way a listener is not, and whether the seam should freeze there too is a
  question this item may raise but not answer.

## Verification

| Clause | How it is run |
|---|---|
| L0 | `npm run check:spec`, `check:source`, `check:scheduler`, `check:docs`, `check:docs:selftest`, `npm run lint`, `npm run typecheck` (six configs), `deno publish --dry-run` |
| L1 | `npm test`, `npm run test:deno`, `npm run test:browser:all` — 288 assertions plus this item's, in five runtimes |
| **rule 8** | **this item is a fix for a review finding, so the fix is broken and the gate watched go red**: revert the freeze and the new test must fail; freeze a *copy* while still handing out the live object and the mutation test must fail. Both provocations recorded in the Record beside the fix |
| L2-L6 | **NOT RUN as this item's gate** — it changes no routing and no dispatch. They run anyway as part of `npm run gate`, and a failure there is this item's problem |
| pass 2 | two readers |

**Routing cases** (`TEMPLATE.md` asks each in turn): **none apply.** A branch routed away from its
join (Q4), `user_action` (Q17), no matching decision edge (Q10), a duplicate task id (Q13) and a
nested fan-out (Q6) are all unaffected — this item changes what a listener *receives*, not what the
driver does. Stated rather than left silent.


## Record

**Status: built, both readers run, every finding acted on, gate re-run.**

**Gate — what ran.**

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | **RAN** — pass | Node, Deno | `check-spec` (8), `check-source` (10), `check-scheduler` (5), **`check-docs` (16 snippets: 12 `run`, 4 `check`, 0 untagged — was 15/11/4)**, `check-docs-selftest` (**12/12**), `deno lint`, `tsc` × 6 configs, `deno check`, `deno publish --dry-run` |
| **X5 — the DOM lib pass** | **RAN** — reported | Node | **1 of 16**, `AGENTS.md:743`, unchanged in count. [Q71](../questions/q71.md); it fails the gate if it ever exceeds one, and the snippet this item added does **not** fail under the DOM lib |
| L1 | **RAN** — pass | **all five** — Node 24, Deno, chromium, firefox, webkit | **301 assertions, was 288.** `test/driver/outbound.test.ts` is **13 assertions in 5 suites** |
| **rule 8 — the provocations** | **RAN** — **11 of 12 red**, plus the reference snippet | Node | table below. **The first set of five was incomplete and both readers proved it** |
| L2-L6 | **RAN** — pass, and not this item's gate | all five; L6 in two | 219 at L6 in Node and Deno, unchanged |
| **conformity reader** | **RAN** — **0 blocking, 5 defect, 5 note** | n/a | derived the outbound contract from `OR-R7` + ADR 0014 **before opening the code**, and that derivation is what found the biggest finding |
| **adequacy reader** | **RAN** — **40 edits, 36 scored, 11 survivors, 4 blocking** | n/a | mutations chosen by walking the rule ids. Caught and corrected **its own** harness bug mid-pass — an empty filter argument silently re-ran one file instead of sixteen — and rescored before reporting |
| re-run after acting on both | **RAN** — pass | all five, both L6 runtimes | `npm run gate` exit 0. Plus **15 consecutive `node test/runner.ts` runs** for [Q83](../questions/q83.md) |

**Rule 8 — the provocations, and the readers' verdict on them.** The first set was five edits run
against **one file** (`node test/runner.ts outbound`), and both readers falsified what was concluded
from it. Re-run against the **full** suite, with the readers' surviving mutations added:

| provocation | killed by `outbound.test.ts` | also caught elsewhere |
|---|---|---|
| `onRegionEvent`: no freeze at all — Q73 verbatim | **3 cases** | — |
| `onRegionEvent`: frozen copy stored, live object handed out | 1 | — |
| `snapshot()`: live array of live records | 2 | `surface.test.ts` |
| `foldInputs()`: live array | 3 | `fold-inputs.test.ts` |
| `onFoldInput`: hand the listener the stored element | 1 | `fold-inputs.test.ts` |
| **freeze only `branch.opened`** *(adequacy — survived the first suite)* | **1** | — |
| **freeze only `opened` + `arrived`** *(adequacy — survived)* | **1** | — |
| **freeze only when `regionId === 'split'`** *(adequacy — survived)* | **1** | — |
| **`freezeInput`: flat kinds returned as a frozen ALIAS** *(adequacy — survived)* | **1** | — |
| `cloneRecord`: `result` aliased | 4 | 3 elsewhere |
| `freezeInput`: record frozen in place | 2 | `fold-inputs.test.ts` |
| **`freezeInput`: region arm does not freeze** *(adequacy — survives)* | **0 — and it is meant to** | — |
| **`AGENTS.md` §10's new `run` snippet**, with `emit`'s freeze reverted | **`check:docs` X4 refuses the reference** | — |

**The one survivor is deliberate and both readers found it independently.** After this fix `emit()`
freezes *before* `append`, so `freezeInput`'s region arm is dead as a guard and removing it leaves
the suite green. **Kept as defence in depth against a future second producer of a `region` input, and
recorded as unfalsifiable rather than deleted** — `spec/join-policy.md` section 2 does the same for
`JP-R5`'s ordering clause. The assertion that names it carries that note in the test file.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| `onRegionEvent` receives a frozen copy | **yes** — one `Object.freeze({ ...e })` in `emit()`, stored **and** handed out | provocation 1: three cases, plus `check:docs` X4 |
| a test for **each** outbound path | **yes, and the declaration was wrong about how many there are** — 5 suites, 13 assertions, covering **eleven** paths, **six** event variants and **two** region ids | provocations 6-9, every one of which survived the first version |
| `AGENTS.md` §10's exception deleted | **yes, and replaced with something true and executed** — a `run` snippet asserting all four sequence handles are frozen, plus an honest statement that the other accessors return copies that are **not** frozen | `check:docs` X4, verified by reverting the fix |

## What broke

**1. The item's own thesis was false, stated in three places, and one `grep` falsified it.** *"Three
of the four are already correct and none of them has a test that would notice if they stopped
being."* `test/driver/fold-inputs.test.ts:227,316-317` and `test/driver/surface.test.ts:137` already
guarded three of the five provocations. **The Record measured against one file and reported it as
"the gate went red".** Found by the conformity reader; verified here by re-running every provocation
against the full suite. The corrected claim is narrower and still worth the item: what those guards
do not cover is the **alias-vs-copy and deep-copy** half, and **five of the six event variants**.

**2. `AGENTS.md`'s replacement sentence was false — written in this item, while arguing against
putting it behind an assertion.** *"Everything it hands you is a frozen copy… There is no
exception."* Measured: `dispatchedIds()`, `regionsForPolicies()`, `effectiveOutcomeOf()`,
`terminalStateOf()` and `joinStatusOf()` are all unfrozen. **Both readers found it independently.**
The argument for leaving it unchecked — *nobody writes code from "there is no exception"* — was the
wrong argument: the failure mode is not a consumer writing bad code, it is **the reference asserting
something false**, which is this repository's most-named defect class. §10 now carries the
reference's first snippet, and it fails when the fix is reverted.

**3. One fixture cannot guard six variants, and the provocation set was shaped by the bug.** All five
original provocations remove freezing *wholesale*; the adequacy reader's three remove it
*selectively*, and every one survived. The suite now drives `matrix-six-events` (all six types in one
run) and `matrix-two-regions` (the only fixture whose fan-out is not called `split`) — both W4's,
imported rather than copied, so they cannot drift from the flows L5 runs.

**4. [Q82](../questions/q82.md) is the one that could actually bite a consumer.**
`joinStatusOf().describe` returns whatever the policy returned, verbatim. `JP-R1` makes `describe`
*"the only way its contents leave"*, so a policy returning its own state is the natural
implementation — and the adequacy reader measured a caller flipping a join from `waiting` to
`satisfied` by writing to it. Both shipped policies return fresh literals, so nothing is live today.
**Not fixed**: it is a decision about where the obligation sits (the driver, or `JP-R1`) and about a
cost on a path a UI would poll. Raised, and `AGENTS.md` §10 now warns about it.

**5. [Q83](../questions/q83.md) — an unreproducible red gate.** The conformity reader's *first*
`npm run gate` failed with four failures in `seam-paths.test.ts` and an **uncaught** `policy exploded`
escaping `policy.step`. Three further gates by that reader, five by this author and **15 consecutive
`node test/runner.ts` runs** are all green at 301. Raised rather than dismissed: the runner imports
all sixteen suites into one process, so cross-file interference is structurally possible, and *an
unreproducible red gate is indistinguishable from a real one*.

**6. `doc/open-questions.md` was edited undeclared — by this item and by every item back to W4.**
Section 1 rule 5's record-step list names four files and does not include the register, yet a
`Reserves:` line obliges every item to write to it. Declared here as an exception, and raised for
P4's retro as a **gap in rule 5** rather than as this item's lapse. *And the census line this item
rewrote was self-contradictory when written* — it stated 55/39 while the arithmetic beside it proved
54/38, because Q81 was added in the same edit and counted in one half of the sentence only. Caught by
the conformity reader; the count now holds at **57 ids, 41 open, 16 resolved** and is verified by two
independent derivations that agree.

## What this taught

- **Six reader-passes have now measured the two-reader overlap, and W12 is the first SMALL item.**
  18 findings between the two, **3 clean overlaps ≈ 17%** — against W4 1/13, W5 3/~35, W6 3/~25,
  W9 3/~30, all roughly 10%. **The absolute overlap count is stable at 1-3 and it is the denominator
  that moves**, which suggests the two readers converge on a small shared core regardless of how big
  the item is. If that holds on W13, `doc/workflow.md` section 6's flat-10% framing should become
  *"1-3 findings, whatever the item's size"*. **For P4's retro.**
- **Rule 8's provocations are not checked in, and this is the second occurrence of the harm.** Rule 7
  made a *check's* probes checked-in because a set run once rots and is incomplete. This item's five
  provocations were run once, by hand, against one file — and were **both incomplete and
  misinterpreted**, which is the same failure one level over. P3's retro flagged the asymmetry as a
  question; W12 is the evidence for it. **Section 6 pass 3 rule 2 asks for two occurrences in
  different work items: W9 and W12 are two.**
- **The conformity reader's derivation was worth more than its reading.** Its largest finding — that
  `OR-R7` ranges over eleven outbound paths, not the four ADR 0014 names — came from writing down
  what the rule requires *before* opening the code. That is exactly the method section 6 prescribes,
  and this is the clearest case of it paying for itself.
- **A reader can catch its own instrument, and should say so.** The adequacy reader's first pass
  reported 13/13 survivors because an empty filter argument silently re-ran one file instead of
  sixteen. It found that, rescored, and reported both numbers. W6's Record made the opposite choice
  with a malformed probe and it became that Record's most confident false claim.
- **A one-line fix took three rounds to be worth shipping, and the two extra rounds were the value.**
  The fix itself never changed. What changed is everything asserted around it.

## Questions raised

**Q81-Q83** from P4's block — the whole reserved block, spent.

| Q | | raised by |
|---|---|---|
| Q81 | **Should the join seam see a frozen event too?** `emit()` steps the policy with the unfrozen `e`. `JP-R1` says a policy is a **pure** state machine and nothing enforces it. *Its first wording claimed a mutating policy would corrupt the sequence "the same way Q73 did" — **false after this item's own fix**, and corrected by the conformity reader: `emit` steps with `e` and appends a different, frozen object* | W12, writing `emit()` |
| Q82 | **`joinStatusOf().describe` and `onUnsatisfiableJoin` hand out whatever the policy returned**, and a policy returning its own state hands out its own state. Measured: a caller flipped a join to `satisfied` | W12's adequacy reader |
| Q83 | **The test runner imports every suite into one process**, and one unreproduced red gate says that may matter | W12's conformity reader |
