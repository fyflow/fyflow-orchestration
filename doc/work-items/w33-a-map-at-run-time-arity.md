# W33 — A map at run-time arity: the driver, the three policies, and N = 0

**Status:** done - author pass, BOTH READERS, rule 8's re-run with their edits checked in, and
the gate re-run after acting on them are all complete.
**Plan:** [P10](../plans/p10-is-fan-out-one-feature-or-two.md) — *is fan-out one feature or two?*

```
Spec:       spec/join-policy.md sections 2-4, spec/run-state.md section 3,
            spec/flow-definition.md section 4 (W32's, read not written)
Owns:       src/driver/driver.ts, src/driver/events.ts, src/driver/policy.ts,
            src/fold/**, spec/join-policy.md, test/driver/**, test/fold/**
Inputs:     W32's definition shape and branchPath contract, from W32's own file.
            P10 section 2 facts 3, 4 and 5 — one of three policies reads
            region.branches; arrival-count fires EARLY at run-time arity; N=0 is
            `waiting` in all three.
Outputs:    A driver that opens N branches from a previous node's output and
            dispatches N distinct task ids.
            A verdict for each of the three policies at run-time arity, and for N=0,
            in spec/join-policy.md — a rule, a restatement, or a stated refusal to
            add one.
            The region event stream for a map, asserted against spec/join-policy.md
            section 2's vocabulary rather than against what the driver emitted.
            RunState for a map run, through fold(driver.foldInputs()).
Depends on: W32
Blocks:     W34
Tests:      test/driver/** at ladder L2 — a fixture log of outcomes in, an asserted
            node sequence and event stream out, no scheduler.
            test/fold/** for the fold and for L3.
            The L5 matrix is W34's; this item asserts the policies directly.
Gate:       L0-L3, plus `check:policies`, then the spec-conformity pass (two
            readers). **L5 is W34's — see "The gate line said L5" below**
Reserves:   Q160-Q163
```

## The gate line said L5, and it was wrong twice — settled before anything was built

**This item's `Gate:` line read `L0-L3, L5` and its Verification table mapped L5 onto
`npm run check:policies`, calling it *"`JP-R9`'s two halves"*. Both halves of that are false, and
finding it out took one `grep`.** `doc/workflow.md` section 1 rule 4 — *a skipped check reported as
passed makes the whole ladder worthless* — is why this is settled in writing rather than absorbed.

| the claim | measured |
|---|---|
| *"`JP-R9`'s two halves"* | `scripts/check-policies.mjs` reports under **three** clause ids, `P1`, `P2` and `P3` (`scripts/check-policies.mjs:165-167`). `JP-R9` is the **spec rule** they enforce, not an id any of them reports. Two is the count of *sets compared*, and the check is more than that comparison |
| *"`check:policies` is L5"* | `doc/workflow.md` section 4 defines **L5 as the join/failure matrix** — *"every Q5 case … against every join policy"* — which lives in `test/matrix/**`. `check:policies` is a **static** consistency check: does `POLICIES` agree with `spec/join-policy.md` section 3, both ways. It reads two files and runs no flow. It is a `check:*` gate entry and **not a ladder rung at all** |
| *"this item runs L5"* | **`test/matrix/**` is W34's** — this item's own Scope/Out says so, and P10's index row does not give it to W33 |

**So the gate is `L0-L3` plus `check:policies`, and L5 is W34's.** Stated in one sentence because
the honest answer was the one the prompt named:

> **L5 RUNS in this item's gate and is not EXTENDED by it.** `test/runner.ts` globs
> `test/**/*.test.ts` (`test/runner.ts:28`), so `test/matrix/**`'s four suites execute inside
> `npm run test` whatever this item does. **That makes L5 a regression this item must not break and
> not a rung it climbs**: a map produces no new matrix row here, and every existing row must answer
> exactly as it did. Reporting it as a rung this item *climbed* would be claiming coverage for the
> case a map makes new, which is precisely what W34 is for.

**`check:policies` earns its place in the gate for a different reason than the declaration gave**,
and the reason is real: this item changes `spec/join-policy.md` section 3 **and** `src/fold/policies.ts`,
which are the two halves `P1` compares. An item that edits one and not the other is exactly `JP-R9`'s
defect, and `check:policies` is what refuses it. That is worth running; it is not L5.

**This is the twelfth time a declaration row has been found wrong by trying to act on it**, and the
second running — [W31](w31-the-self-list-check-policies-never-had.md)'s `Reserves` collided with W29,
and P10's four work-item blocks collided with P10's own declaration. **The pattern in all three is
the same: the row was written from the item's SHAPE rather than from the artefact it names.** L5 was
written here because a policy question sounds like a matrix question.

## Scope

**In**

1. **The driver opens N branches**, N taken from the previous node's output, and dispatches **N
   distinct task ids**. P10 fact 2 measured that the ids are already expressible — 500 distinct at
   500 indices — so this is the derivation W32 changed being used, not a new id format.
2. **`JP-R5` at run-time arity.** *Every `branch.opened` for a region precedes any other event for
   it* is what makes a live-token count meaningful, and the shipped `fanout` arm emits them all
   before dispatching any. **A map must not lose that** — the arity is known only once the previous
   node settles, which is a different point in the traversal.
3. **The three policies.** P10 fact 3 measured that **only `arrival-count` reads
   `region.branches`**, and that `live-token` and `live-token-requiring-arrival` answer identically
   at N=3, N=7 and N=1. **This item is where that stops being a measurement over hand-built event
   streams and becomes one over a real region**, which is the gap P10 prediction 2 names: *"it does
   not follow that nothing else about it is arity-dependent."*
4. **`arrival-count`'s early fire — P10 fact 4, and it is the sharp one.** With `need` fixed from a
   branch list the run does not use, the join reports `satisfied` on the **first** arrival with two
   branches still live. **A join fired while its branches are still running is not the hang W4's
   matrix recorded**; it routes the successor over an unfinished region. `arrival-count` is not what
   an application passes (ADR 0003 rule 1) and it **is** a matrix column that must keep answering, so
   this item decides what it answers and writes it in `spec/join-policy.md` rather than leaving the
   column to mean two things.
5. **N = 0 — P10 fact 5.** An empty input list opens no branch and is `waiting` in **all three**
   policies, because ADR 0003's *"having been positive"* is false. **`FD-V9`'s arity floor means the
   static feature can never produce it**; a map produces it the first time a filter returns nothing.
   This is the one place a map is not the static feature at a different arity. Its answer is a
   decision — a fourth region event, a verdict, or a definition-level refusal — and **it is taken
   here, in the document that owns the policies**, not invented in the matrix.
6. **The fold.** `RunState.outcome` for a map run, including the N=0 run, through
   `fold(driver.foldInputs())` — the whole of turning a run into run state
   ([ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)).

**Out** — named rather than left implicit, with where it goes instead

- **What the join carries.** It stays **`null`**, deliberately: P10's decision 2 puts
  [Q36](../questions/q36.md) in **W34**, *after* this item runs, so the rule is written from cases
  rather than from a mechanism. **This item must not quietly pick a payload**, and `settleJoin` still
  taking no payload parameter is what keeps that visible.
- **What a branch receives**, and [Q154](../questions/q154.md)'s sibling aliasing. **W34.**
- **The matrix.** `test/matrix/**` is W34's. This item asserts the policies directly, which is the
  half W15 found a rule-written set blind to.
- **Real workers.** **W35.** Nothing here needs a scheduler, and if L2 is hard to write for a map
  *"the driver has reached for the scheduler somewhere it should not have"* (`doc/workflow.md`
  section 4) — **that is this item's first review question of itself.**
- **[Q37](../questions/q37.md)** — who asks whether a join is stuck. A map makes the poll no worse
  and no better.

## Exceptions declared

`doc/workflow.md` section 7 rule 2. Files this item edits outside its `Owns` and outside section 1
rule 5's record step, named with the reason. **The record-step six are not exceptions**: this file,
the plan's Record, `doc/README.md`, `CLAUDE.md`, `README.md`, `doc/open-questions.md` and
`doc/decisions/**`.

**NINE, all LATE, and not one found by reading** - W32 took five and argued that was evidence its
`Owns` was drawn one layer too narrow for what a new node kind reaches. **This is the second data
point and it is nearly double**, which is P10's retro's to judge. Two were found by running a check,
five by the gate, and two by acting on a reader. **Seven of the nine are `scripts/**` or a `spec/**`
document this item does not own** - P8's *"paths in nobody's `Owns`"* on a product plan, which is
exactly [Q157](../questions/q157.md)'s shape widened past `AGENTS.md`.

| file | why | when |
|---|---|---|
| `spec/run-state.md` | **The `regionEntered` input is a change to this document, and the claim it makes true is one this document has made since v0.1.** Section 2's shape says `regions` holds *"one entry per fan-out region ENTERED"*, and every producer of an entry was a region EVENT — so *entered* and *opened at least one branch* were the same thing, because `FD-V9`'s floor makes a `fanout` open at least two. A map of zero items separates them and **is the only thing that can**. Measured before the fix: such a run appends nothing, `RN-R10` iterates nothing, and it folds to **`completed`** having reached no `end` node. Landed as **section 5's fifth row** — that table's whole subject is *what this document claimed that its own inputs could not supply* — and the document goes **v0.3 → v0.4** | **late** — after the N=0 measurement |
| `spec/README.md` | `check-spec`'s **`C8`** makes the version row a consequence of any `spec/**` bump, and this item bumps **two** documents. **It fired for real** before the edit, naming `join-policy.md`. W32 had this file in its `Owns` for exactly this reason (W16's finding); P10's index row does not give it to W33 | **late** — after `C8` reported it |
| `scripts/check-spec-selftest.mjs` | **Two `C8` probes are pinned to the literal `**Status:** v0.3` in `spec/run-state.md`**, which this item bumps. Probe 1 then matched nothing; probe 2 became a **no-op**, replacing v0.3 with v0.4 in a document already reading v0.4 — so it would have reported a disagreement it had not created. **Rule 7 (b) firing correctly rather than passing**, and [Q142](../questions/q142.md)'s sentence one file across. Both made **version-agnostic** rather than re-pinned, so the next bump does not reproduce it. `scripts/**` is in nobody's `Owns` — P8's shape | **late** — after the gate reported `16/18 probes caught` |
| `scripts/check-policies-selftest.mjs` | The same class again: one `P1` probe is anchored on `` | `arrival-count` | `N` is fixed `` and this item re-sources that row. Re-anchored on the **id cell alone**, which is what the probe is about — renaming a row's id — measured to occur exactly once in the document. `scripts/**`, again in nobody's `Owns` | **late** — after the gate reported `1 FAILURE` under `check:policies:selftest` |
| `spec/flow-definition.md` | **A SIXTH, and the document itself addressed the question to this item BY NAME.** Section 2's `map` subsection says *"what happens when `over` names a key that is absent, or holds something that is not an array, is a RUN-TIME question and **no rule id is reserved for it here**. It is W33's."* W33 built the refusal, gave it a class, tested it five ways - and shipped it with **no rule anywhere in `spec/`**, which `doc/workflow.md` section 1 rule 3 refuses by name: *a decision not in `spec/`, an ADR or a plan did not happen*. Found by the conformity reader. **`FD-R2`** is taken beside `FD-R1`, this document's own precedent for a rule about what a RUN does; **no `FD-V` changed and no node kind changed**, and the document goes **v0.8 -> v0.9** | **late** - after the conformity reader |
| `scripts/build-browser-tests.mjs` | **A SEVENTH, and it is W32's exception reproducing on the same file for the same reason** - a suite reading a `spec/**` document the browser bundle does not inline. The adequacy reader's finding A5 forced a bind on `spec/join-policy.md` section 3's row text, and `npm run test:browser` then failed. **The failure mode was BETTER than W32's and that is the half worth recording**: W32's read was at MODULE SCOPE, so the throw happened while the bundle loaded and took **all twenty suites** down at `0 file(s), 1 assertion`; this read is inside a `test()`, so it failed **one** test naming its own path - `fixture not inlined in the browser bundle: spec/join-policy.md`, at 21 files / 553 assertions. Same defect, same check, and the difference is entirely WHERE the read happens | **late** - after `npm run test:browser` measured it red |
| `scripts/check-markdown.mjs` and `scripts/check-markdown-selftest.mjs` | **AN EIGHTH AND NINTH - [Q142](../questions/q142.md)'s two-sided window, in an instance its own row does not describe.** Every earlier occurrence is *an item that adds DOCUMENTS must retune a constant in a file it does not own*; **this item added no document**. It added **links** to documents that already existed - a spec rule, a section, register rows, index paragraphs - and the `doc/decisions + doc/plans removed` fixture rose **1507 to 1754**, past `M4`'s floor of **1720**. The probe went silent and the gate reported `wanted [M1,M3,M4], got [M1,M3]`. **So the obligation is on writing PROSE, which no item can avoid, rather than on adding FILES.** Retuned to **2050** from a fresh three-count measurement on a scratch copy outside the repository - whole tree **73 / 2419 / 119**, one directory removed **56 / 2205 / 119**, both removed **45 / 1754 / 119** - so the window is `(1754, 2419]`. `M3` at 64 was still inside `(56, 73]` and `M5` is fired by a probe no `removes` cut reaches, so **only `M4` moved**. **And its `META` entry went inert for the SECOND time** (rule 7 (b) firing correctly, as at P10's declaration), so it is now **anchor-agnostic** rather than re-pinned | **late** - after the gate reported `36/37 probes caught` |
| `AGENTS.md` | **[Q157](../questions/q157.md)'s SECOND occurrence, and it was predicted before it fired.** `index.ts` re-exports `src/driver/driver.ts` with `export *`, so `UnresolvedMapArity` reaches the package root and section 9's executed snippet enumerates every `Error` subclass the root exports — `X4` at `AGENTS.md:775`, exit 1. **And two other blocks became FALSE the moment a map ran**: §3's *"NOTHING DISPATCHES ONE YET"* and §9's *"no `Driver` opens one"*. The edit is the minimum that is not a lie — the class, and the two corrections — and is **not the feature write-up**, which Q157 gives to W35 | **late** — after `check:docs` reported it |

**In `Owns` and NOT edited:** `src/driver/events.ts` and `src/driver/policy.ts`. Recorded rather
than omitted, and it is a result: **a map needed no new region event and no change to the policy
seam.** `spec/join-policy.md` section 2's six events describe a map's stream exactly as they describe
a fanout's, and `Region` keeps its four fields — which is [Q159](../questions/q159.md)'s answer
showing up as two untouched files.

## Verification

| Clause | How it is run |
|---|---|
| **L0** | `npm run lint`, `npm run typecheck` |
| **L1** | `npm run test`, `npm run test:deno`, `npm run test:browser` — unit tests over the policies and the fold. **chromium only** unless `test:browser:all` is named |
| **L2** | `test/driver/**` — a fixture log in, an asserted node sequence and region-event stream out, **no scheduler**. The cheap rung and the important one |
| **L3** | determinism — fold the same log twice and deep-compare. **[Q155](../questions/q155.md) applies**: routing is already decided by the time the fold sees anything, so L3 here is a statement about the fold and not about the map's arity decision. Say so rather than reporting L3 green as though it covered it |
| **`check:policies`** | `npm run check:policies` and `npm run check:policies:selftest` — **three clause ids, `P1`/`P2`/`P3`**, enforcing `JP-R9`. It goes red if `POLICIES` and `spec/join-policy.md` section 3 disagree either way, which is the exact hazard of an item that edits both. **Not a ladder rung** — see *"The gate line said L5"* above |
| **L5** | **NOT CLIMBED — W34's.** `test/matrix/**`'s suites run inside `npm run test` regardless, so L5 is asserted here as a **regression that must not move**, and the Record reports it as such rather than as a rung this item covered |
| **conformity** | spec first, code second |
| **adequacy** | mutation in an isolated copy, walking the rule ids |

**Routing cases** (`doc/workflow.md` section 5 rule 6): a branch **routed away from its join**
([Q4](../questions/q4.md)) is covered and is the case a map makes newly interesting, because the
branches routed away are ones nothing declared. **`user_action`** ([Q17](../questions/q17.md)) is
covered — a suspended branch is still live and a map must not change that. A **duplicate task id**
([Q13](../questions/q13.md)) is covered at the dispatch layer, which is `ID-R1`'s refusal and the
thing P10 fact 2 measured firing. A **nested fan-out** ([Q6](../questions/q6.md)) is covered to the
extent of not regressing ADR 0030. **No matching decision edge** ([Q10](../questions/q10.md)) is
**not applicable** — a map's arity is not a decision edge.

**Rule 8, all five obligations, re-run after the readers with their edits checked in.** Two to
instantiate deliberately: **(d), the LOOP BOUNDS** — a map is a loop whose bound is the whole point,
and *"can one entry leave, can the whole list leave, does anything count it from a source other than
itself"* is this item's central question about its own tests; and **(e), the WIRING** — P10
prediction 3. A policy that is opened and never stepped, a region event emitted to the observer and
not to the policy, and an `arrival-count` column that is registered and never run are its three
shapes here.

## Record

**Gate - what ran.** Commands under `eval "$(fnm env --shell bash)" && fnm use 24`.

| Clause | Verdict | Notes |
|---|---|---|
| **L0** | **RAN - green** | `npm run lint` - 45 files, 0 findings. `npm run typecheck` - **all five projects**, exit 0 |
| **L1** | **RAN - green in all FIVE runtimes** | **21 files / 553 cases**, from 20 / 517. node 24.20.0, deno 2.9.6, and - via **`npm run test:browser:all`** rather than the gate's chromium-only `test:browser` - chromium, firefox and webkit, each reporting *parity with node*. Sub-suites **derived by running the filter**, never subtracted: driver **8 / 193**, fold **5 / 124**, matrix **4 / 135**, definition **5 / 118** |
| **L2** | **RAN - green** | `test/driver/map.test.ts` is new and is the bulk of it: a fixture log of outcomes in, an asserted node sequence and region-event stream out, **no scheduler**. The fake is `driver.test.ts`'s twelve-line one unchanged - **a map's arity comes from a settled outcome and a fixture log carries settled outcomes**, so the new feature cost this rung nothing, which is this item's answer to its own first review question |
| **L3** | **RAN - green, and reported for what it covers** | Folding one log twice is deep-equal, over a prefix too. **[Q155](../questions/q155.md) applies and is stated rather than glossed**: a `FoldInput` carries an outcome record and a region event, so routing is already decided before the fold sees anything - L3 here is a statement about the FOLD and **not** about the map's arity decision. A second case does what Q155's own *"what would close it"* names: **re-runs the DRIVER over one fixture log twice** and compares dispatches and region events, which folding one log twice structurally cannot reach |
| **`check:policies`** | **RAN - green** | `P1`, `P2`, `P3`, and `check:policies:selftest` at **14/14 bounded**. **It fired for real twice**: once when an explanatory table was placed above section 3's names table (the parser reads the FIRST table after the heading, and its own header says so), and once at `P1` when a probe renamed the row's id |
| **L5** | **NOT CLIMBED - ran as a REGRESSION, and unmoved** | `test/matrix/**` is W34's. All four suites / 135 cases green and **not one of the 36 cells moved**, which is the load-bearing evidence that `arrival-count`'s re-sourcing is a re-sourcing and not `JP-R7`'s refinement. Reported as a rung this item did **not** climb - see *"The gate line said L5"* above |
| **L6** | **NOT CLIMBED - and unmoved** | **489 assertions, 0 failed, in node and deno**, exactly as declared. W35's rung |
| **rule 8 set** | **RAN THREE TIMES in the author pass and ONCE MORE after the readers - 43 provocations, 39 caught, 4 survivors, 0 aborted**, with **twelve of the readers' own edits checked back in** | `node dev-dist/w33/provoke.mjs`, graded on the **failure LINES** rather than the exit code. Every entry declares the exact set of check ids it must trip and a substring that must appear among the failing test names, and **both** must match |
| conformity reader | **RAN - 15 findings, 3 blocking** | spec first, code second, expected values re-derived independently. All fifteen acted on |
| adequacy reader | **RAN - 37 mutations, 23 caught, 10 survivors, 4 vacuous, plus 4 constructed positive probes; 7 blocking** | mutation walking the rule ids, in a copy off the shared tree. All ten survivors acted on or classified |
| **overlap** | **2** | the sixteenth measurement, inside the settled 0-4 band, **both readers unprimed** |
| **full `npm run gate`** | **RAN - `GATE EXIT=0`, ZERO FAIL lines**, at the completed state | Read from the log's own `GATE EXIT` line. **19 chain entries, 361 s wall** - a sixth reading beside P9's 366 s and 438 s, P10's 9m40 and W32's 6m21 and 7m18, and this item's own 464 s one run earlier, so it is quoted as a **band** rather than a constant. `spec` **7 documents / 33 examples / 78 rules**; `markdown` **73 documents / 2420 relative links / 119 anchored**; L1 **21 / 553** with parity in node, deno and chromium; **L6 unmoved at 489 assertions / 25 real runs** in node and deno |

**`Owns` audit - 24 paths, ZERO undeclared, NINE late exceptions.** By `git status --short` against
the `Owns` block, by hand. **Derived in one expression**: `git status --short | wc -l` is **24** - 23
modified and 1 new, and it is **9 `Owns` + 6 record-step + 9 exceptions**, which sums.

| | files |
|---|---|
| **`Owns`** | `src/driver/driver.ts`, `src/fold/policies.ts`, `src/fold/run-state.ts`, `spec/join-policy.md`, `test/driver/map.test.ts` (new), `test/driver/driver.test.ts`, `test/driver/outbound.test.ts`, `test/fold/fold-rules.test.ts`, `test/fold/policies.test.ts` |
| **record step** | this file, plus `doc/open-questions.md`, `doc/README.md`, `CLAUDE.md`, `README.md` and the plan's Record |
| **declared exceptions** | **NINE, all LATE**: `spec/run-state.md`, `spec/README.md`, `spec/flow-definition.md`, `scripts/check-spec-selftest.mjs`, `scripts/check-policies-selftest.mjs`, `scripts/build-browser-tests.mjs`, `scripts/check-markdown.mjs`, `scripts/check-markdown-selftest.mjs`, `AGENTS.md` |
| **in `Owns` and NOT edited** | **`src/driver/events.ts` and `src/driver/policy.ts`.** Recorded rather than omitted, and it is a **result**: a map needed **no new region event and no change to the policy seam**. Section 2's six events describe a map's stream exactly as they describe a fanout's, and `Region` keeps its four fields - which is [Q159](../questions/q159.md)'s answer showing up as two untouched files |

**Outputs - what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **A driver that opens N branches and dispatches N distinct task ids** | **yes** - `enter`'s `map` arm, with `itemIndices` threaded through `enter`/`dispatch`/`pathOf`/`settleJoin` and recovered in `advance` by `indicesFrom` | probes `b1`, `b2`, `d1`, `d2`, `d3`, `e2`, `c4`, `c5` - eight. `b1` (dispatch one instead of N) costs **13** cases; `b2` (every instance at index 0) costs **12**, because `ID-R1` refuses the second id |
| **A verdict for each of the three policies at run-time arity, and for N=0, in `spec/join-policy.md`** | **yes** - section 3's `arrival-count` row re-sourced, and section 5's **N = 0 ruling** | probe `b3` (rename the row's id) costs exactly `{P1}`; probe `r3` (**revert the row's TEXT**) costs 1 case. **`r3` is the adequacy reader's, and before it that cell was a blank one**: `check:policies` compares the id SET only, so the sentence that IS this output could be reverted with `check-policies`, `check-spec` and all 543 cases green |
| **The region event stream for a map, asserted against section 2's vocabulary** | **yes** | probes `b4`, `d3`, `c5`, `r7` and the two the adequacy reader named as untested - **`branch.lost` and `branch.resumed` at a map ITEM INDEX**, which were correct and unasserted while `Outputs` row 3 claimed the vocabulary |
| **`RunState` for a map run, through `fold(driver.foldInputs())`** | **yes** - including the new **`regionEntered`** input | probes `a5`, `a8`, `a9`, `e3`, `b5`, `r6`. **`e3`** (the fold arm made unreachable) costs 31 cases; **`b5`** (drop the kind on the way out of `foldInputs`) costs 4 |

**What broke.**

**1. A naive map arm folds an empty map to `completed`, and that is what decided N = 0.** With
nothing dispatched and no event emitted, the fold's `regions` is `{}`, `RN-R10` iterates nothing, and
`withOutcome` falls through to its final arm - a run that reached no `end` node reported as success.
**Measured before the design was fixed, not argued**, and it is character for character the false
statement [ADR 0015](../decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) exists to
remove. The `regionEntered` input is the answer, and it closes a claim `spec/run-state.md` section 2
has made **since v0.1** - *"one entry per fan-out region ENTERED"* - which no input could supply for
a region that opened nothing, because `FD-V9`'s floor makes a `fanout` open at least two. It lands as
that document's **fifth row of section 5**, whose whole subject is *what this document claimed that
its own inputs could not supply*.

**2. The first measurement of `arrival-count`'s early fire measured the wrong thing.** The probe
compared positions in the **settlement** order and reported *"publish ran before every score settled?
false"* - and `publish` is settled last because it is dispatched last, which says nothing about what
was in flight. Re-taken against the real question - *at the moment the join routed out, how many
branches of its region were still live* - it reads **4 of 6 region events, two branches still live**.
`doc/workflow.md` v0.10's *fires for the reason it names*, applied to a measurement rather than to a
probe.

**3. A batched edit aborted before writing, and that is the mechanism working.** A substitution
anchored on `-` where the file has an em-dash matched zero times; the script raised before any write,
so nothing landed half-done. `CLAUDE.md` names the opposite case - a batch that fails **halfway** and
writes nothing while every other file moves on - and the difference is entirely whether the writes
happen at the end.

**4. Three test files' expected values had to move, and two of them were fixtures that violated
`JP-R5`.** Only **one verdict** changed, on a deliberately non-conformant stream. The other two
stepped `branch.arrived` having never stepped `branch.opened` - a branch arriving at a join it never
entered - and the old `arrival-count` could not tell, because `need` came from the `Region`. The
re-sourcing makes the opening phase load-bearing, so those fixtures are now conformant streams, which
is `JP-R5` being exercised rather than assumed.

**5. Two `check-spec-selftest` probes and one `check-policies-selftest` probe went inert on this
item's own edits.** Both `C8` probes were pinned to the literal `**Status:** v0.3` in
`spec/run-state.md`; the second was worse than inert, replacing `v0.3` with `v0.4` in a document that
now READS v0.4 - it would have reported a disagreement it had not created. The `P1` probe was pinned
to `` | `arrival-count` | `N` is fixed ``. **All three are rule 7 (b) firing correctly rather than
passing**, and all three were made **anchor-agnostic** rather than re-pinned, so the next bump does
not reproduce it.

**6. And the browser bundle went red, exactly as W32's did, with a better failure mode.** See the
seventh exception row. **L1 was green in node and deno and failing in all three browsers**, and
section 4's *"a rung reported green without saying which runtimes it ran in is a rung that ran in
one"* is what caught it - `npm run test:browser:all` was run rather than inferred.

**What this taught.**

**P10 prediction 2 - `live-token` needs NO change - is CONFIRMED, and the sharper form is that
NOTHING reads the region any more.** `liveToken` and `liveTokenRequiringArrival` are byte-unchanged.
After `arrival-count`'s re-sourcing **not one shipped policy reads the `Region` it is opened with** -
which showed up as `deno lint` reporting the `Region` import unused in `src/fold/policies.ts`. That
is the strongest form of [Q159](../questions/q159.md)'s answer: the interface need not say which node
kind opened a region **because nothing reads the region**. P10 fact 3 measured two of three; it is now
three of three.

**P10 prediction 3 - rule 8's fifth obligation FIRES on a `src/` item - CONFIRMED, and in a shape a
definition item could not produce.** W32 answered yes for a definition item. Here obligation (e)
produced `e3` (the fold's `regionEntered` arm present, correct and never entered - **31 cases**),
`e2` (the map arm reached and unable to do anything - **22 cases**), `e5` (the manifest, caught by
`S11` and **invisible to this item's own harness**, which invokes scripts directly rather than through
npm - measured separately), and `e1`, which is [Q158](../questions/q158.md) and still open. **The
shape a driver item adds is a guard that RUNS and cannot reach its subject**, which is not what a
self-test's wiring holes look like.

**P10 decision 4 HELD, and this item took the one thing it reserved the right to take.** *"No policy
refusal, no construction check and no new error class, because every candidate for one is a
measurement W33 has not taken yet."* W33 took the measurements and then took **two** of the three,
each named with the measurement that forced it:

| taken | the measurement |
|---|---|
| **a new error class**, `UnresolvedMapArity` | a map that reads a missing `over` as zero items produces a `stuck` run with **no diagnosis**, and the validator cannot see it - `FD-V25` checks a key NAME. `InvalidDefinition` would be a lie in the direction that matters: the definition is valid and the DATA is wrong, which is a different person's bug |
| **a construction check** - a region opener inside a `map` region is refused | a definition the validator accepts with **zero findings** ran seven tasks, settled every one `done`, and reported **`stuck`**: `open()` ran twice for one opener and the second discarded the first, `firedJoins` made the second join unreachable, and two regions merged into one fold entry |
| **no policy refusal** | not taken, and not needed: no policy needed a clause for a map at any arity |

**The finding to carry, and it is [ADR 0036](../decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
own central finding one layer down.** The ADR decided *two features* because `branchOf` is a
`Map` **keyed by branch node id**, so a repeated entry collapses and the encoding cannot express N
branches to the layer that would have to honour it. **Every piece of per-region RUN-TIME state in the
driver is keyed the same way** - `joinState`, `firedJoins`, `RegionEvent.regionId`, and the fold's
`regions` - and a `map` is the first construct in this library that enters one opener node **more than
once in a run**. The definition layer's collapse was measured by W32 and decided the ADR; the driver
layer's collapse was measured by W33's conformity reader and is refused here pending a decision on
what a region's IDENTITY is ([Q160](../questions/q160.md)). *The same fact, found twice, one layer
apart, by two different readers.*

**And the second finding is that a ruling written at one depth was wrong at both the others.**
Section 5's N = 0 ruling and its four-row *"why not"* table were written entirely from a map at depth
1 reached through an already-dispatched task. **Both other shapes a map can be in were wrong**: at the
`entry` node the run reported **`running`** rather than `stuck`, so `RN-R12` called an unfinishable
run unfinished and a clock-free harness would wait on it forever; **nested in a branch**, the
enclosing branch was opened with **no terminal event at all**, which `JP-R5`'s own enumeration does
not admit and which `JP-R10` could not reach, because `JP-R10` triggers on a policy answering
`unsatisfiable` and this ruling is that no policy can. Neither shape is exotic and the item's own file
names the first one. **`doc/workflow.md` section 1 rule 5's writing clause is the rule that was
broken** - the ruling stated no scope - and both are fixed, with the scope now written into the
document.

**The methodological finding is that this item's own gate line over-claimed what a check binds.**
*"`check:policies` goes red if `POLICIES` and section 3 disagree either way, which is the exact hazard
of an item that edits both."* It compares the **id set**. The sentence that IS this item's second
`Outputs` row - the definition text - was bound by nothing, and reverting it left three checks and 543
cases green. **A check that compares two halves does not necessarily compare the half you changed**,
and the item had written the justification from the check's PURPOSE rather than from its clauses.
[Q162](../questions/q162.md).

**Rule 8 - 43 provocations, 39 caught, 4 survivors, 0 aborted**, run four times: three in the author
pass, each after acting on the previous, and once more after the readers with **twelve of their exact
edits checked in**. All twelve fire. The four survivors, each classified rather than counted:

| | why it survived |
|---|---|
| `e1` **still open** | the whole map suite renamed out of the runner's glob - **26 cases gone, exit 0, no line printed**. [Q158](../questions/q158.md), `test/runner.ts` and `scripts/**` are in nobody's `Owns`, and W32's adequacy reader sharpened it: a suite BODY can `return` before registering a case, so counting files would not catch it |
| `e5` **caught, by something outside this harness** | the manifest edit (`check:policies` no longer running its check) is invisible to a harness that invokes scripts directly. Measured separately through `check-source`: **`S11` fires**, naming both the entry and the substitution. Recorded as a limit of the harness rather than a hole in the item |
| `e4` **VACUOUS, not a survivor** | `mapItems` called for its throw with the arity read from an identical expression beside it. The mutation changes **no observable**, and rule 8's own definition says a survivor is one only once a second route confirms the clause was reachable |
| `b6` **a ceiling** | retitling a spec SECTION HEADING. No check opens a spec document's prose, which is `C4`'s own stated limit one document across, and the `Outputs` cell says so rather than the probe being dropped |

**The two reader passes.** Both ran with a fresh context, **spec first and the artifact second**, and
both reported rather than fixed. The adequacy reader worked in a full copy at
`%LOCALAPPDATA%\Temp\claude\w33-adequacy`, **off the shared tree**, verified green before it started
and containing **zero symlinks and zero reparse points** - measured before the copy was made, inside
it, and **again before it was removed** (ADR 0029).

**Neither was primed.** They were given the spec, the method and the environment hazards, and **not** a
list of claims the author was least sure of - so this measurement is comparable with the thirteen
unprimed ones before it, and with W32's.

| | found | blocking |
|---|---|---|
| **conformity** | **15** | **3** |
| **adequacy** | **10 survivors** of 37 mutations, + 4 constructed positive probes | **7** |
| **overlap** | **2** | |

**The overlap is 2, the SIXTEENTH measurement, and inside the settled 0-4 band.** Both shared
subjects were reached from opposite ends:

| subject | conformity got there by | adequacy got there by |
|---|---|---|
| **nesting and a map** | asking what happens when one opener node is entered twice - a **region-identity** question, from the spec's own *"one region per opener"* | running a nested map at **N = 0** and finding a branch with no terminal event - a **coverage** question, from `JP-R5`'s clauses |
| **section 5's ruling states no scope** | reading *"adds no mechanism"* against the `regionEntered` input the ruling itself required | constructing the two shapes the ruling was not measured at, and finding it false in both |

**Their split is the one the two roles predict.** The conformity reader found **claims that were
false** - a refusal with no rule id anywhere in `spec/`, a pin whose stated reason the same item's own
other change had falsified, two `AGENTS.md` sentences a running map contradicts, and a `??` in a
comment explaining a line that has no `??`. The adequacy reader found **bounds that were not there** -
and **five of its seven blocking findings are (c) provenance or (d) loop bounds**, with the other two
being spec claims measured at one depth. **Not one of its blocking findings was reachable by a probe
that breaks a VALUE**, and 23 of its 37 mutations were caught by the author's value-probes.

**The sharpest single thing either reader found is that a closure can bound the LIST where the probe
cuts the LOOP.** The author's `d4` mutated `[1, 3, 7]` to `[3]` and closed it with
`equal(arities, [1, 3, 7])` - **a list compared to a copy of itself in the same snippet**, which is
[Q101](../questions/q101.md)'s shape, and which says nothing about how many entries the `for`
consumed. `for (const n of arities.slice(0, 1))` then cost **0**. Three loops had it; the pattern that
holds was already three tests away, in the `shapes` loop, which counts what it DID and compares that
to the list. **Knowing the axis is not instantiating it**, which is rule 8's own recurring lesson.

**Questions raised.**

- **[Q160](../questions/q160.md)** - a region's IDENTITY is its opener's node id, and a `map` makes one
  opener reachable N times per run. **Refused at construction** by W33 rather than run wrong;
  un-refusing it means region identity becomes (opener, enclosing path), which changes what
  `RegionEvent.regionId` means and what the fold's `regions` is keyed by. Subsumes the mechanism
  behind [Q156](../questions/q156.md).
- **[Q161](../questions/q161.md)** - at N = 0 the driver must act on a fact **no policy can see**, which
  sharpens the fourth-event question `spec/join-policy.md` section 5 rejected. For whoever answers
  [Q97](../questions/q97.md).
- **[Q162](../questions/q162.md)** - `check:policies` binds the policy id SET, and **nothing binds
  section 3's definition TEXT**. Closed here for one row by a test; the class is open.
- **[Q163](../questions/q163.md)** - a policy's `describe` is observable **mid-burst** through
  `onRegionEvent` + `joinStatusOf`, and `arrival-count`'s moved on a static region without any verdict
  moving.
- **[Q142](../questions/q142.md) gains a fourth instance rather than a new id**, because it is that
  row's mechanism reached by a road the row does not name: **an item that adds no document at all**
  still moved the fixture past `M4`'s floor, by writing prose. Recorded on Q142 rather than raised
  separately, and the `META` entry is now anchor-agnostic so the *"pinned to a magic number"* half
  does not recur.

**All four of Q160-Q163 used.** **No ADR**: 0037 is W34's ([Q36](../questions/q36.md)), and every
decision here is a spec rule with its rationale stated in place, which `doc/decisions/README.md`
prefers to a rule plus an ADR restating it.
