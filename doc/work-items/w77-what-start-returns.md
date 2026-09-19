# W77 — What `start` RETURNS: a completion handle the runtime keeps

**Status:** done
**Plan:** [P20](../plans/p20-what-the-runtime-owes-a-consumer.md)

```
Spec:       none — `Runtime` and `StartOptions` are TypeScript surfaces and appear in no spec/
            document (grepped: `StartOptions` and `runtime.start` occur in AGENTS.md,
            doc/plans/** and doc/work-items/**, and in nothing under spec/). No FD-, RN-, OR-,
            JP-, ID- or RT- rule moves. `RN-R2` is CITED rather than changed — it is what
            licenses the mechanism (see decision 2 below).
Owns:       src/scheduler/runtime.ts, test/scheduler/**, doc/decisions/0058-*,
            package.json + deno.json (the maintainer chose the BREAKING road, so the version
            moves — the plan's row makes those two conditional on exactly that answer)
Inputs:     P20 facts 3, 3b, 4, 5c and 6, RE-RUN here rather than transcribed
            (dev-dist/w77/fact*-rerun.txt) — and fact 5c RE-TAKEN, because W76 moved it;
            W76's item file, which is this item's dependency and whose three suites this item
            must move deliberately; ADR 0014 rules 1-4 and its Correction; P18 decisions 10
            and 14; Q293's row; doc/workflow.md v0.20 rule 8 (a), (b), (c), (d), (e)
Outputs:    (1) `runtime.start` returns a RunHandle `{ driver, done }` — ADR 0058, the BREAKING
                road, with the package version moved in BOTH manifests;
            (2) `done` resolves with the terminal `RunState` and NEVER rejects — the settlement
                rule is terminality and nothing else;
            (3) the mechanism: ONE `RunState`, `step`ped per fold input, terminality tested at
                a MICROTASK — not the inputs kept, and not `fold` re-run over a fresh copy;
            (4) `onFoldInput` COMPOSED rather than replaced, so a consumer's own callback still
                receives every element — with W76's two-road binding extended to THREE roads,
                both ways, and the new road PINNED;
            (5) a test that `done` and a caller's own fold are the SAME expression and that
                neither is downstream of the other — `await done` deep-equals
                `fold(driver.foldInputs())`, computed from the driver's own sequence;
            (6) ADR 0014's `RN-R1`/`RN-R2` re-run at L3: the incremental stepping and the
                whole-sequence fold agree, on every run this suite makes.
Depends on: W76 (DONE)
Blocks:     W78
Tests:      test/scheduler/runtime.test.ts — expected values from P20 facts 4 and 6C, from
            `src/fold/run-state.ts`'s own `isTerminal` (the two non-terminal outcomes are
            `running` and `awaiting_action`), and from THIS item's declaration-step
            measurements taken on the shipped tree before a line was edited
            (dev-dist/w77/decl-probe{,2,3,4,6}.txt). NOT from this module's output.
Gate:       L0 under all five typecheckers, RUN SEPARATELY where a count is wanted;
            L1 on the recorded pool seam and on real inline pools through `runtime.start`;
            L3 — the determinism claim, as (6) above;
            `check:docs`; `check:source`; `check:markdown`;
            then the two spec-conformity reader passes and rule 8 re-run.
            L6 UNMOVED at 1627 / 53 in both runtimes — this item adds no row and changes
            nothing a worker receives (P20 decision 7).
Reserves:   Q320-Q329, ADR 0058-0059 (0059 expected unused)
```

## Scope

**In**

1. **`runtime.start` returns `RunHandle` — `{ driver, done }`.** The BREAKING road, the maintainer's
   answer to P20 stop-and-ask (a), taken on the plan's own lean and on the price re-measured here.
   `0.2.0` → `0.3.0` in both manifests, on [ADR 0048](../decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)/[W67](w67-a-flow-from-documents-on-real-workers.md)'s
   precedent — [Q279](../open-questions.md)'s answer is the procedure.
2. **`done` resolves with the terminal `RunState` and never rejects.** The maintainer's answer to
   stop-and-ask (c), and it **reversed the plan's lean on a measurement** — see finding B.
3. **The mechanism is one `RunState` stepped per input**, not the inputs kept and not `fold`
   re-run over `driver.foldInputs()`. The maintainer's answer to the fourth question this item put,
   and it is a departure from P20 decision 2's LETTER that `RN-R2` licenses — see finding C.
4. **`onFoldInput` is COMPOSED**, so a consumer's own callback still receives every element, and
   W76's binding learns a third road. This is the ratchet W76 built working as designed, and it is
   moved deliberately rather than around.
5. **No deadline, and the reference teaches `Promise.race`.** The maintainer's answer to (b)+(d).

**Out** — named rather than left implicit, with where each goes instead

- **The reference's thirteen copies.** W78, whose row owns `AGENTS.md` and `README.md`. This item
  edits neither except for the record step's one prose claim about the version.
- **An L6 row, and `examples/run-flow.ts` CONVERTING to `done`.** W78, and P20 stop-and-ask (e) is
  that item's. This item makes the **minimal destructure** in `run-flow.ts` that the breaking road
  forces and nothing else — see the Exceptions table.
- **`StartOptions`.** Nothing is added to it: the no-deadline answer is what keeps it at eight, so
  W76's `Pick` binding, its `['joinPolicy','runId']` pin and its behavioural membership are all
  unmoved on the DECLARED side. Only the `start` side gains a road.
- **`src/driver/driver.ts`.** P20's Scope Out makes editing it for more than a type export a
  tripwire. This item does not edit it at all: ADR 0014 rule 3's `onFoldInput` is the push half a
  caller was given, and the runtime is a caller.
- **[Q289](../open-questions.md).** Fact 4C shows a promise is immune to that window; the row is
  about a CLOSURE that needs the driver binding and `done` gives such a closure nothing. Untouched.
- **[Q19](../open-questions.md)/[Q22](../open-questions.md).** Not reopened — but P20's Scope Out
  obliges this item to PRICE what it retains, and finding D is that price.

## What this declaration step MEASURED, and what it corrects

*Every fact P20 handed this item was RE-RUN rather than transcribed (`doc/workflow.md` section 1
rule 5's `Inputs` clause). The tree was held still throughout — digest **`28daa82926af0a24` over 362
files**, identical before the first probe and after the last, `git status` clean at both ends.*

| fact | re-run | verdict |
|---|---|---|
| **3** | `node dev-dist/p20/fact3-terminality.mjs` | **REPRODUCES** — 12 files, 34 `isTerminal` sites, 23 of them folding collected inputs |
| **3b** | `node dev-dist/p20/fact3b-shapes.mjs` | **REPRODUCES EXACTLY** — 13 copies, **135 lines**, three shapes `M--` ×10 / `-PD` ×2 / `M-D` ×1 |
| **4** | `node --experimental-strip-types dev-dist/p20/fact4-done.ts` | **REPRODUCES EXACTLY** — 1 fold input before `start` returns, canonically identical `RunState`, and a `.then` attached fifty macrotask turns late still receiving `completed` |
| **5c** | `node dev-dist/p20/fact5c-breaking.mjs` | **MOVED, and it is the number stop-and-ask (a) is decided on** — see finding A |
| **6** | `node --experimental-strip-types dev-dist/p20/fact6-forward.ts` | **6C REPRODUCES** — `awaiting_action`, `isTerminal` false, `done` unsettled, `completed` after `resolve`. **6A's printed line is now FALSE** — see finding E |

**Five findings. A corrects the number the plan's stop-and-ask is priced on; B REVERSES the plan's
lean on stop-and-ask (c); C is a departure from decision 2's letter; D is the price P20's Scope Out
demands; E is a third instance of [Q253](../open-questions.md).**

### Finding A — **fact 5c is 31, not 30, and the shape matters more than the count**

P20 prices the breaking road at *30 typecheck errors in 2 files — 18 in `test/scheduler/runtime.test.ts`
and 12 in `examples/run-flow.ts`*. W76 added three suites to the first file. Re-taken with the five
lanes RUN SEPARATELY (`dev-dist/w77/fact5c-rerun.txt`):

```
BREAKING  node=green  browser=green  deno=green  tests=EXIT 2 (19)  examples=EXIT 2 (12)
ADDITIVE  green on all five
```

**31 in 2 files — 19 and 12.** The count moved by ONE while the file gained three suites and six
`.start(` call sites, and the reason is worth more than the number: **the price is a count of USES
of the returned value, not of `start` call sites.** `test/scheduler/runtime.test.ts` has 24 `.start(`
occurrences and 19 errors; **22 of the 31 are literally `Property 'runId' does not exist`**
(`dev-dist/w77/fact5d.txt`), and all 12 in `examples/run-flow.ts` descend from ONE `const driver =`
at line 1755, which one edit closed.

**And *two files* is the SCOPE fact 5c measured, not the scope of the work — the conformity reader,
finding 6.** `npm run typecheck` is five lanes; the reference's snippets are a **sixth** lane that no
typechecker reaches, because `check:docs` extracts and compiles them separately. Three `AGENTS.md`
snippets bind the result, so the build went red at `X3`, `X4` and `X5` after the five lanes were
green, and the work was in **three** files. *A price measured over five lanes is a claim about five
lanes.* (`README.md`'s three snippets do not bind the result, so `X8`'s pairs never moved — measured,
not assumed.) The same paragraph also read *24 `start` call sites*: 24 is a grep count, and one of
them is a string literal and one is a `Driver.start`.

*This is [Q317](../open-questions.md)'s shape one level up — a measured PRICE whose inputs a later
item moved — and nothing in rule 8 names it, because a price is not a probe.*

### Finding B — **stop-and-ask (c) REVERSES: a driver refusal is ALREADY terminal, and the reject road KILLS THE CONSUMER'S PROCESS**

P20 leans *resolve with the state, reject only for a driver refusal — the copies' own split, kept.*
Two measurements reverse it.

**First, `failRun` appends the `stopped` fold input BEFORE it calls `onRunFailure`**
(`src/driver/driver.ts`, and the comment above it argues the ordering at length). So by the time
`onRunFailure` fires the fold already says `stopped`, which `isTerminal` calls terminal. Measured
(`dev-dist/w77/decl-probe2.txt`): `at onRunFailure the fold said stopped terminal=true`. **So the
resolve road does not hang on a refusal — it settles with `stopped` and `stoppedBy` carrying the
reason.** Stop-and-ask (c) is not a choice between settling and hanging; it is a choice between two
ways of reporting the same terminal fact, and only one of them throws the `RunState` away.

**Second, and this is what decides it: a refusal reaches a caller in FOUR shapes, not two.**

*(**This table said *"exactly three doors into `failRun`"* and was wrong in both directions — the
conformity reader, finding 2. Class I is **not** a door: its own cell says `failRun` is never
reached, so a row that is not a door cannot be one of three doors, which is W49's
self-contradiction-inside-one-cell shape. And it omitted `resolve()`, `src/driver/driver.ts:1140` —
which is both a door AND the distinct caller-visibility class that matters most here, because
`resolve()` is ADR 0004's road and **the only way out of `awaiting_action`**, the one non-terminal
outcome this item spends a decision on. The file's own comment thirty lines above `failRun` already
documented it. Corrected below, and **class II(b) is now a case** in
`test/scheduler/runtime.test.ts`.)*

`failRun` has **four call sites**: `driver.ts:1048` (`start`), `:1140` (`resolve`), `:1163`
(`onEvent`) and `:1799` (`enter`'s `never` arm, statically unreachable). What a CALLER ends up
holding sorts them into four shapes:

| | door | what the caller sees |
|---|---|---|
| **I** | refused BEFORE the run begins — `InvalidDefinition`, `LanguageNotBuilt`, `BoundaryRefused` at `start`. **Not a `failRun` door at all** | `runtime.start` throws; **no run exists** |
| **II** | refused DURING `start()` — `failRun(e)` **then `throw e`**, because the caller is on the stack | `runtime.start` throws, so **the caller never receives the handle** |
| **II(b)** | refused from **`resolve()`** — `failRun(e)` **then `throw e`** for the same reason | the caller gets the throw **AND holds the handle**, because `start` returned long ago |
| **III** | refused from a LISTENER — `failRun(e)` only, a throw from a listener being discarded | `start` has returned; the caller **holds** the handle |

On class II the reject road rejects a promise nobody can attach to. Measured in a CHILD process with
no `unhandledRejection` listener installed (`dev-dist/w77/decl-probe3.txt`), because a listener
suppresses the default and measures the event rather than the consequence:

```
REJECT road : child exit code 1 — the process DIED
              "CHILD: start() threw UnresolvedMapArity, caught and handled"   <- the consumer did
              Error: UnresolvedMapArity … at Driver.failRun … at Driver.start     everything right
RESOLVE road: child exit code 0 — "CHILD: still alive at the end of the turn"
```

**A flow-authoring error killed the consumer's process, after the consumer correctly caught what
`start` threw.** It is fixable on the reject road with a defensive `done.catch(() => {})` in the
rethrow path — and the maintainer's answer is RESOLVE, on the ground that `done` then has ONE
settlement rule, reports strictly more (the whole `RunState`, not an `Error`), and needs no
defensive line whose absence is invisible until production. *`failed` and `stuck` already resolve on
either road, so rejecting on `stopped` alone splits the failure surface a consumer must learn.*

*(A fourth fixture died on the way to this: the first class-III probe used a decision with no
matching edge, and the validator refused the document by name — **`FD-V7`: a task's edges must
include an unguarded default, so `NoMatchingEdge` is not reachable from a VALID document at all.**
That is W71's `MissingJoinPolicy` finding one refusal over, and it is why class III is a late `map`
over a non-array instead.)*

### Finding C — **the mechanism departs from decision 2's LETTER, and `RN-R2` is what licenses it**

P20 decision 2: *`done` resolves from `fold(inputs)` and `isTerminal` — the two functions the
consumer would have called.* Taken literally that means keeping the inputs. Three mechanisms
measured over a 24-branch fan-out (`dev-dist/w77/decl-probe4.txt`):

| | retained | work | |
|---|---|---|---|
| **A** keep the inputs, `fold()` each time — Q293's own shape | **445.5 KiB** + the 437.3 KiB state | 96 folds over up to 101 elements | 23 ms |
| **B** keep nothing, `fold(driver.foldInputs())` each time | 0 | **5944 elements COPIED and REFROZEN** — `foldInputs()` is `Object.freeze(this.inputs.map(freezeInput))`, so it deep-clones every result per call | 35 ms |
| **C** keep ONE `RunState`, `step` it per input | **437.3 KiB** | 101 steps, no array | **6 ms** |

**C is chosen.** `fold` is *literally* `step` in a loop — `for (const i of inputs) s = step(s, i)` —
and **`RN-R2` is the spec rule that says so**: *folding `n` then applying record `n+1` equals folding
`n+1`*. Measured on a real run: `step`-incrementally `===` `fold(driver.foldInputs())`, canonical
JSON, true. So this is not a second definition of terminality; it is `fold`'s own body with the
prefix kept instead of recomputed, and Outputs (5)+(6) bind it.

**The terminality test stays in a MICROTASK and the `step` does not.** `AGENTS.md:112` calls the
microtask *"load-bearing rather than decoration"* because the driver dispatches the next node
synchronously inside the same listener turn, so **testing** terminality the instant an input arrives
can report a terminal state with the run still going. **Stepping** is correct at every prefix
(`RN-R2` again); only the predicate needs rest.

### Finding D — **what `done` retains, which P20's Scope Out obliges this item to price**

> *"an item that makes the runtime hold the fold INPUTS for the life of the run has added retention
> P15 measured and must price it."*

Mechanism C does not hold the inputs — but `step` writes `result: r.result`, a reference into the
record `freezeInput` handed it, and `freezeInput` builds that record with `structuredClone(r.result)`.
**So the kept `RunState` pins one clone of every result for the life of the run.**

Bytes could not settle this: at 60 concurrent runs `v8.serialize` said 11.3 MiB of retained
`RunState` while `heapUsed` after a forced `gc()` read **x0.97** — noise larger than the signal
(`dev-dist/w77/decl-probe5.txt`). *P15's two-observer method needs large sizes to agree, and this
question does not need bytes at all.* Answered by **identity** instead
(`dev-dist/w77/decl-probe6.txt`):

```
settled records in the driver's log : 5
  RunState.result === the driver's  : 0        <- so there IS a second copy
  RunState.result is a DIFFERENT obj: 5
the kept RunState, serialised       : 87.6 KiB, of which the results it pins: 87.0 KiB (99.4%)
```

**So the price is exactly P15's own quantity again — (tasks settled) × (bytes each returned) — one
extra copy, bounded, and not growing with time.**

**The comparison against the block `done` replaces is ABOUT THE SAME, not half, and the first
version of this finding said half** — the conformity reader, finding 3. The copied block keeps its
`inputs` array AND folds a state out of it, and those two look additive:

```
the consumer's own `inputs` array     : 89.1 KiB
plus the RunState it folds out of it  : 87.6 KiB   <- 176.7 is a DOUBLE COUNT
```

**They share their results.** `step` writes `result: r.result` by reference, so the copied block's
own state points into its own `inputs` array, and `v8.serialize` called on two roots cannot see the
sharing. Taking the block's *non-result* scaffolding once — 0.6 KiB, which this probe printed — the
honest figures are:

```
the copied block : 89.1 (inputs, results included) + 0.6 (state scaffolding) = ~89.7 KiB
`done`           :                                                              87.6 KiB
```

***So `done` retains about the same — ~2% less — and does a fifth of the work (6 ms against 23).***
*The identity measurement that falsifies the sum is printed three lines above it*, which is why the
harness's own closing line said only *LESS* and the upgrade to *HALF* was added on top of it, in this
file, in ADR 0058 and in shipped source.

**And it is bounded per RETAINED HANDLE rather than per live run** — a promise retains its
resolution, which is the property fact 4C celebrates, so a consumer holding N settled handles holds
N `RunState`s. The honest residue is stated rather than hidden: a consumer who used **no** completion
machinery at all now pays one copy they did not before, **and one `structuredClone` per settlement
they did not either**, because `start` installs an `onFoldInput` unconditionally and `freezeInput`
clones only when one is present (the conformity reader's finding 8 — the CPU half, which the first
version of this finding named nowhere). [Q320](../open-questions.md).

### Finding E — **P20 fact 6A's printed line is now FALSE, and it is the third instance of [Q253](../open-questions.md)**

`fact6-forward.ts` prints `the same run via runtime.start() would see: 0 — StartOptions has no
onRegionEvent entry (fact 1)`. W76's finding C established that this is a SENTENCE and not a
measurement. **W76 then shipped the entry, so the sentence is now false**, and the untracked harness
still prints it. Nothing can go red. *Q253's row is about a harness that can be vacuous at exit 0 and
lives in no commit; this is the same row from a third side — a harness whose PROSE a later item
falsifies.*

## Exceptions — seeded from P20's table, then MEASURED

*Every row re-measured at this declaration step.*

| path | seeded as | measured |
|---|---|---|
| `package.json`, `deno.json` | CONDITIONAL on stop-and-ask (a) | **CONFIRMED and they are in `Owns`** — the maintainer chose BREAKING, so the version moves in both, `0.2.0` → `0.3.0`. Grepped: the version literal occurs in exactly those two files plus `doc/**` history, so no third manifest is involved |
| `examples/run-flow.ts` | predicted UNNEEDED — *L6 and run-flow.ts are W78's* | **WRONG, and forced by the maintainer's answer**: the breaking road makes 12 typecheck errors there, so `npm run typecheck` is RED until they are fixed and this item cannot ship green without editing it. **Declared here, before the work starts.** The edit is the MINIMAL destructure at one `const driver =` and nothing else — converting that harness to `done` is W78's, and P20 stop-and-ask (e) warns that a `done` absorbing its `finishedBy` claim would delete the assertion ADR 0014 was corrected to carry |
| `test/definition/l4-corpus.test.ts` | **NOT SEEDED — W76 took it LATE** | the suite CENSUS is a standing obligation on any item adding a suite ([Q102](../open-questions.md)'s shape). **Declared UP FRONT here** rather than found by a reader, which is W76's own lesson |
| `scripts/build-browser-tests.mjs` | **NOT SEEDED — W76 took it LATE** and it now inlines `src/scheduler/runtime.ts` and `src/driver/driver.ts` as TEXT | **PREDICTED ZERO EDITS AND THE PREDICTION WAS WRONG — a FOURTH late exception, and the gate is what said so.** The type-export binding reads `src/scheduler/index.ts`, `bootstrap.ts` and `envelope-worker.ts`, none of which the bundle carried; all three are inlined now and it goes **92 -> 95 fixtures**. *The row above claimed the browsers were green at parity and cited that as "the measurement rather than the assumption" — it was neither: the browser rung had exited **1** and its count line was read instead of its exit code.* The SIXTH time a suite reading a file outside `spec/examples/` has reached this list |
| `scripts/check-docs.mjs` and its self-test | predicted UNNEEDED — no snippet added or removed | **CONFIRMED, and `RUN_FLOOR` MEASURED rather than left**: `check:docs` reports **33 snippets — 27 run, 6 check — UNMOVED**, because this item edits three snippets and adds none. *`check:docs` went RED in between, at `X3`/`X4`/`X5`, which is the sixth lane and not a floor* |
| `scripts/check-source.mjs` | predicted UNNEEDED — no new gate entry, no new published module | **CONFIRMED, MEASURED** — green throughout, including after `src/scheduler/index.ts` gained two type re-exports, which adds no `src/**` file for `S6` and no construction for `S16` |
| `src/driver/driver.ts` | predicted UNNEEDED, and a SCOPE TRIPWIRE | **ZERO edits — the tripwire is clean**, confirmed by the conformity reader's own `git status`. ADR 0014 rule 3's `onFoldInput` is the push half a CALLER was given, and the runtime is a caller, so nothing here needed the driver to change |
| `src/scheduler/index.ts` | **NOT SEEDED — LATE** | the sub-path's type export is an explicit ALLOWLIST, and `RunHandle` — this item's headline type — shipped declared and unexported through the whole author pass. Found by the conformity reader; writing the both-ways binding then found `RuntimeRegistry` missing too |
| `AGENTS.md` | W78's | **WRONG, and it is this item's ONE LATE exception.** The breaking road broke three `AGENTS.md` snippets that BIND the result, so `check:docs` went red at `X3`, `X4` and `X5` and this item cannot ship green without them — the sixth lane finding A now records. Three minimal destructures, plus the two prose claims this item FALSIFIED (§2's *"`start` hands back a `Driver`"* and §12's *"`start` returns a `Driver`, already started"*, the latter one line from a destructure this item wrote). **The thirteen-copy rewrite is still W78's.** *Undeclared until the conformity reader ran `git diff --name-only` by hand — the fourth consecutive item on which that is how it was found, and this item's declaration positively assigned the file to W78* |
| `README.md` | W78's, *"the record step's one prose claim"* | **TAKEN, and for THREE claims rather than one.** §2's snippet comment, which `X8` holds byte-equal to `AGENTS.md`'s (so it is edited identically in both or the check goes red — the tripwire working); the *"hands back a `Driver` per run"* sentence in the opening; and the version banner, which said **`0.2.0`** while the manifests now read `0.3.0`. The last is [Q279](../open-questions.md)'s procedure and is where a consumer reads a breaking change first |
| `scripts/check-markdown.mjs` | predicted UNNEEDED — Q142's window re-measured before the record step | measured at this declaration: **`M3` = 107 against a fixture of 102, margin 5**; `M4` = 4450 against 4279, margin 171. This item adds ONE work-item file (in `doc/work-items`, which the `doc/decisions` probe does NOT cut, so that fixture goes 102 → 103, **margin 4**) and ONE ADR (in `doc/decisions`, which it DOES cut). **Predicted NOT to fire**; re-measured before the record step |

## Verification

How each clause of `Gate:` is run. **Every rung is RUN and redirected to `dev-dist/w77/`, never
piped, and read by `$?`** (`doc/workflow.md` section 4). Node 24 is asserted in every shell.

| clause | command |
|---|---|
| L0, all five typecheckers | `npm run typecheck > … 2>&1; echo "EXIT=$?"` — **and the five lanes RUN SEPARATELY where a count is wanted**, because `typecheck` is five chained by `&&` and a chained rung reported RED reports its FIRST failure and is silent about everything downstream |
| L0, lint | `npm run lint > … 2>&1; echo "EXIT=$?"` |
| L1-L5, three runtimes | `npm test > … 2>&1; echo "EXIT=$?"` |
| L1-L5, the other two browsers | `npm run test:browser:all > … 2>&1; echo "EXIT=$?"` |
| L3 — the determinism claim | inside `npm test`: `await done` deep-equals `fold(driver.foldInputs())`, and the stepped prefix equals the folded prefix at every n |
| `check:docs`, `check:source`, `check:markdown` | each RUN and redirected, expected green |
| L6, both runtimes | `npm run test:l6` and `npm run test:l6:deno` — **expected UNMOVED at 1627 / 53** |
| whole gate | `npm run gate > … 2>&1; echo "GATE EXIT=$?"`, tree held STILL, content digest at both ends |
| rule 8 | `node dev-dist/w77/rule8.mjs`, twice — the author pass and a re-run with the readers' exact edits checked back in |
| **W76's 25 declared probes** | **RE-RUN here**, because this item edits both files their anchors live in — `doc/workflow.md` rule 8's dated-ceiling clause, and [Q317](../open-questions.md) is read before any DECLARED verdict from them is trusted |
| both readers | conformity and adequacy per section 6, adequacy in an isolated copy, both reading P20, ADR 0014 and Q293 before the artifact |

*This item touches routing not at all. A branch routed away from its join (Q4), `user_action` (Q17),
no matching decision edge (Q10), a duplicate task id (Q13) and a nested fan-out (Q6) are **not
applicable**: nothing here changes what is dispatched, what a node receives or what a join decides.
It changes what `start` hands back and adds one observer of the sequence the driver already
produces. The one thing it does reach is `user_action` as an OUTCOME — `awaiting_action` is why
`done` can wait for ever, and that is asserted rather than left to the reference.*

## Record

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w77/`, never piped, read by `$?`,
Node 24.20.0 asserted in every shell.

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint` | **RAN, green** | `deno lint src/ test/ examples/ index.ts`, 109 files. Red once, on a `require-await` in a helper written for the readers |
| L0 — all five typecheckers | **RAN, green** | **run SEPARATELY where a count was wanted**, because `typecheck` is five lanes joined by `&&` and a chained rung reported RED reports its FIRST failure and is silent about everything downstream. It paid twice: fact 5c's re-take needed the per-lane split, and the breaking road's damage was in lanes FOUR and FIVE |
| L1-L5, node | **RAN, green** | **44 files / 1269 assertions**, from 1251 |
| L1-L5, deno / chromium / firefox / webkit | **RAN — RED first, and reported GREEN while it was red**, then green | **1269 in each, `EXIT 0`, ZERO FAIL lines**, bundle **95 fixtures** from 92. *It was `EXIT 1` with three FAIL lines before that, and this Record's first draft called it green* — see *What broke* (11) |
| L3 — the determinism claim | **RAN, green** | `RN-R2` asserted at EVERY prefix rather than once: `step(fold(prefix), next) === fold(prefix + next)` for every n of a real sequence, plus `await done` deep-equal to `fold(driver.foldInputs())` on three shapes and on a real scheduler |
| `check:docs` | **RAN — RED first, then green** | `EXIT 1` at **`X3` (8), `X4` (3) and `X5` (1)** before the reference was touched — the SIXTH lane, which no typechecker reaches. After: **`EXIT 0`, 33 snippets — 27 run, 6 check — UNMOVED**, so `RUN_FLOOR` does not move, and `X8` still compares its three README pairs |
| `check:source` | **RAN, green** | the seeded row's *predicted UNNEEDED* MEASURED — no new gate entry, no new `src/**` file for `S6`, no construction for `S16`, including after `src/scheduler/index.ts` gained three type re-exports |
| `check:markdown` | **RAN, green** | 136 documents / 5878 links / 290 anchored |
| L6, node and deno | **RAN, green** | **1627 assertions, 0 failed, 53 real runs — UNMOVED in BOTH runtimes**, which is what the Gate line declared and what P20 decision 7 requires |
| conformity reader | **RAN** | **11 findings, 6 BLOCKING.** Its central obligation came back **NOT empty — TWO disagreements of five**: the *"exactly three doors into `failRun`"* table (wrong in both directions), and the arithmetic built on the retention identity. (a), (b) and (d) — the terminal/non-terminal split, `failRun`'s ordering, and the `step`/`fold` equality — matched exactly |
| adequacy reader | **RAN** | **48 mutations, 25 real survivors, 4 BLOCKING**, every survivor given as an exact edit with its failure count |
| overlap | **2 — the FORTY-EIGHTH measurement**, inside the 0-4 band, neither reader primed | the two shared subjects are the **real-pool gap** (conformity 7 / adequacy 6, reached by reading a Gate line and by grepping for `done` outside the suites) and **`AGENTS.md:1696`**, which the adequacy reader flagged explicitly *outside its remit* |
| rule 8, author pass | **RAN, and it EARNED its place** | first run: 25 probes, **4 CRASHES and 3 UNDECLARED survivors**. The crashes were unbounded awaits hanging the runner (exit 13, zero FAIL lines); closing them made `done`'s non-settlement a NAMED failure. Two of the three survivors were the invariant and the `RN-R2` comparison re-sourceable to THEMSELVES. Final author pass: **25 probes, 18 caught, 6 declared ceilings, 0 undeclared, 0 crashes, 0 aborts** |
| rule 8, RE-RUN with the readers' exact edits checked back in | **RAN** | **34 probes: 1 control green, 28 caught, 5 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 aborts, 0 against declaration.** All NINE of the readers' edits FIRE. Digest identical at both ends of every pass. *Run BEFORE the browser-bundle fix in What broke (11), and unaffected by it: no probe here runs the browser rung — the five they use are `lint`, `typecheck:tests`, `typecheck:examples`, `npm test` and `check:docs`, plus `check:source` for one ceiling* |
| **W76's 25 probes, re-run HERE** | **RAN — 23 caught, 1 declared ceiling, ZERO catches** | `doc/workflow.md` rule 8's dated-ceiling clause, in the item that edits both files their anchors live in. W76's set holds entirely on this tree |
| [Q142](../open-questions.md) | **measured, does NOT fire** | `M3 = 107` against a fixture of **103** (margin 4), `M4 = 4450` against **4309** (margin 141). Predicted at the declaration step as 102 -> 103 — this item adds one file to `doc/work-items`, which neither probe cuts, and one to `doc/decisions`, which one does |
| `Owns` audit | **THREE LATE exceptions, all declared before the Record** | `git status --porcelain` by hand. `Owns` (4) + `examples/run-flow.ts` and `test/definition/l4-corpus.test.ts` (declared UP FRONT — W76's lesson taken) + **`AGENTS.md`, `README.md` and `src/scheduler/index.ts` LATE** + the six record-step files + this file and its ADR. `src/driver/driver.ts` **ZERO edits** and `scripts/**` untouched, so P20's scope tripwire is clean |
| census | **248 / 191 / 2 / 55**, 248 of 248 in exactly one cluster cell, **0 aborts** | from 244 / 187 / 2 / 55, by `dev-dist/p15/census.mjs` unchanged: Q320-Q323 raised and placed. The register's headline was stale at 241 / 185 through the whole of W76 and is corrected here — [Q253](../open-questions.md), fourth plan running |
| `npm run gate`, CONFIRMING (first run) | **GATE EXIT=1, ONE FAIL line** | `check:markdown` 136 / 5903 / 290, `check:docs` 33 / 27 / 6, L1-L5 1269 in node, deno and chromium — and **chromium RED**: `fixture not inlined in the browser bundle: src/scheduler/index.ts`. Digest `4026ddaf2d716c19` over 364 files, IDENTICAL before and after, so the tree did not move while it ran. **The gate caught what a grep had reported green** |
| `npm run gate`, CONFIRMING (over the final tree) | **GATE EXIT=0, ZERO lines beginning `FAIL` at any indent**, `selftests` **8/8 completed, 8 ok, 888.5 s wall over 6 lanes** | `check:spec` **7 / 61 / 107 — UNMOVED**; `check:docs` **33 snippets: 27 run, 6 check — UNMOVED**, `X8` still comparing its three README pairs byte for byte; `check:source` **23 published files, 16 gate entries**; `check:markdown` **136 / 5904 / 290**; L1-L5 **44 files / 1269 assertions in node 24.20.0, deno 2.9.6 and chromium**; **L6 1627 assertions, 0 failed, 53 real runs on `fyflow-scheduler` 0.5.2 in BOTH runtimes — UNMOVED**. Digest **`062f53a072581136` over 364 files, IDENTICAL before and after**, with no edit made while it ran; **this row is the ONE edit after it**, and `check:markdown` — the only rung that reads `doc/work-items/**` — was re-run over it |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `start` returns `{ driver, done }`, version moved in both manifests | **yes** — ADR 0058, the BREAKING road | `a6` (the whole revert): red at `typecheck:tests`, `typecheck:examples`, `npm test` and `check:docs`. `b1` (the interface narrowed alone): 41 + 2 typecheck errors and `X3`/`X5`. **The version itself is bound by NOTHING — `e3` and `e4` are declared ceilings and [Q322](../open-questions.md)** |
| (2) `done` resolves with the terminal state and NEVER rejects | **yes** | `b2` (made to reject): a **DECLARED CRASH** — it kills the runner rather than failing it, because most cases never attach to their handle. `a3`/`r-a1`/`r-a4` (the predicate weakened three ways): caught by the six-outcome enumeration |
| (3) ONE `RunState`, `step`ped per input, predicate at a microtask | **yes** | `a1`, `a2` (the scheduling or the step deleted): 13 and 10 failures. `a5` (the microtask removed): **7** — ADR 0058 rule 6's quiescence is genuinely load-bearing. `b3`/`r-a3` (the two alternative mechanisms): caught by the source binding, since what separates them is retention and time, which no rung weighs |
| (4) `onFoldInput` COMPOSED, the binding at THREE roads | **yes** | `b4` (the hand-on deleted): 12 failures. `d1`, `d2`, `d3` (the road dropped, neutered, compounded). `e2`/`r-a9` (the ORDER reversed): the discriminating pair. **`d4` is a declared ceiling — a PIN has one observer by construction, [Q217](../open-questions.md)** |
| (5) `done` and a caller's own fold are the same expression, neither downstream | **yes** | `b5`, `c1`, `c2` (the invariant re-sourced, alone and compounded). **`r-a3` is the reader's version of the same claim from the SUBJECT side** — the runtime computing `done` from `foldInputs()` made it one route compared with itself, at zero, until the source binding |
| (6) `RN-R1`/`RN-R2` at L3 | **yes** — every prefix, not only the end | `b6` (the prefix comparison re-sourced to itself). `r-a4`: **P20 decision 2's own named failure**, `isTerminal` reimplemented in the runtime for ZERO, caught by the source binding |

**What broke.**

1. **The readers found SIX blocking things and four of the six were claims rather than code.** The
   `failRun` door table was wrong in both directions — it listed a row that is not a door and omitted
   `resolve()`, which is the only road out of `awaiting_action`; the retention comparison
   **double-counted**, because `v8.serialize` on two roots cannot see that a fold's `result` fields
   point into the array it was folded from, so *half* is really *about the same*; *two files* was the
   scope of a five-lane measurement and the work was in three; and the reference still taught the API
   this item replaced, in the snippet this item had edited.
2. **`RunHandle` shipped declared and unexported for the whole author pass**, because the sub-path's
   type export is an ALLOWLIST and a `export type` is erased — so the existing export case, which
   compares runtime KEYS, and all five typecheckers are blind to it by construction. **Writing the
   binding found a second instance the reader had not (`RuntimeRegistry`), and widening it to the
   list found a THIRD: `BootstrapRegistry`, the first parameter type of the exported `bootstrap`
   function.** *Three in one allowlist is the argument for binding the list rather than adding the
   names.*
3. **The `stuck` row was reaching `failed`.** It asserted *settled*, *terminal* and *agrees with the
   caller's fold* — all of which `failed` satisfies — so `stuck`, one of the four outcomes ADR 0058
   rule 3 enumerates and the one ADR 0015 exists for, had no observer anywhere, and a runtime that
   hung `done` for ever on a stuck run shipped green. The label was the only thing that said `stuck`.
4. **The author pass's four CRASHES were all one defect**: a case that `await`s a promise a probe has
   stopped settling HANGS the runner rather than failing it. Closed by a helper that turns
   non-settlement and rejection into named failures — **and then reintroduced**, see 5.
5. **The final rule 8 pass ran for 2.5 hours on probe `a1` and a human asked whether it was stuck.**
   The real-pool case added for a READER's finding awaited `done` unbounded with
   `runtime.shutdown()` on the next line, and `CLAUDE.md` records that a scheduler never shut down
   keeps the process alive — so on a real scheduler the defect closed in (4) costs **no verdict at
   all** rather than exit 13. *The fix for a reader's finding reintroduced the defect the author pass
   had just closed, one case over*, which is rule 8's founding observation and exactly what v0.8's
   *re-run the set after acting on the readers* is for. [Q323](../open-questions.md).
6. **Killing that harness left the tree MUTATED.** v0.17 requires an abort to undo what it applied
   and a content digest at both ends, and both are about a probe that RETURNS: a harness killed
   between apply and restore satisfies neither. `queueMicrotask(settleIfTerminal);` was still deleted
   and the digest read `5ddc23beb8ef036c` against the `916849be7acf8fd1` it started from. Restored by
   hand and re-measured to the starting digest exactly. Same row.
7. **The source binding went red on its own PROSE.** It asserts the `done` machinery does not call
   `foldInputs()`, and the machinery's comment quotes `foldInputs()` while explaining why it does
   not — W25's *a comment that quotes the code it explains makes that code unmutatable*, in the
   mirror direction: it made correct code unreadable. Comment lines are stripped now.
8. **A shell heredoc ate `\n` escapes three times** ([Q272](../open-questions.md), the rule
   `CLAUDE.md` carries and which P19 broke eight times and W76 twice). Once it wrote a real newline
   into a string literal and the test file stopped parsing. Written as files thereafter, and the two
   literals that keep being mangled are now module-scope constants.
9. **A failed `python` in an `&&` chain meant `fnm use 24` never ran**, so a later `npm test` in the
   same command resolved Node 16 and died at `ERR_UNKNOWN_FILE_EXTENSION` — v0.19's environment
   clause, in the author's own shell rather than in the harness.
10. **Four fixtures died on the way in, every one refused BY NAME**: `FD-V11` (a node unreachable
    from entry), `FD-V23`+`FD-V6` (a join with no `of`), `FD-V24` (`decision` is not a node kind) and
    **`FD-V7`** — *a task's edges must include an unguarded default* — which means **`NoMatchingEdge`
    is not reachable from a VALID document at all**, W71's `MissingJoinPolicy` finding one refusal
    over.

11. **The browsers were reported GREEN from a grep while the rung had exited 1, and the GATE is what
    found it.** `npm run test:browser:all` was run redirected — correctly — and then read with
    `grep -E "file(s)|PARITY"`, which matched three `1269 assertions` lines and cannot match a
    `FAIL` line; `BROWSERS EXIT=1` sat unread in the same output. Three suites were failing on
    `fixture not inlined in the browser bundle: src/scheduler/index.ts`, because the type-export
    binding added for the conformity reader reads three modules the bundle does not carry. **That is
    `doc/workflow.md` section 4's *a rung is RUN, never PIPED — a line of its output is never the
    predicate*, which is [W54](w54-what-a-result-may-be-and-what-bounding-it-would-cost.md)'s defect
    verbatim and which THIS ITEM'S OWN Verification table quotes.** *The redirect was done and the
    exit code was still not the thing read* — the procedure was followed to the letter and the
    reading was the failure, which is section 6 pass 3 rule 3's sharpest kind. Fixed by inlining
    `index.ts`, `bootstrap.ts` and `envelope-worker.ts`; the browsers are `EXIT 0`, zero FAIL lines,
    95 fixtures.

**What this taught.**

**A measured PRICE has inputs a later item can move, and nothing in rule 8 names it.** P20 priced the
breaking road at 30 typecheck errors; W76 then added three suites to one of the two files it counted,
and the number this item's stop-and-ask was to be decided on was stale before the item began. It went
to **31**, so the conclusion held — but the sharper half is *why* it barely moved: **the price is a
count of USES of the returned value, not of `start` call sites**, and one file's twelve errors
collapsed to a single edit. That is [Q317](../open-questions.md)'s shape one level up — a dated
ceiling is a claim with an expiry date, and so is a dated measurement — except that a ceiling has a
harness that can re-run it and a price has nothing.

**And the scope of a price is the scope of the lanes it was taken over.** Fact 5c ran the five
typecheckers and that measurement is sound; *31 errors in two files* is what those five lanes see.
The reference's snippets are a **sixth lane** that `check:docs` extracts and compiles separately, and
three of them bound the result — so the work was in three files and the gate went red after all five
lanes were green. *A price measured over five lanes is a claim about five lanes*, which is section 1
rule 5's writing clause on a number nobody thought of as a claim.

**The sharpest single finding is the conformity reader's, and it is that the measurement which
decides a question was printed three lines above the arithmetic that got it wrong.** The identity
probe reported *`RunState.result === the driver's: 0 / DIFFERENT obj: 5* — which is exactly why the
copied block's `inputs` array and the state folded out of it **share** their results, and therefore
why adding their two `v8.serialize` figures double-counts. The harness's own closing line said only
*LESS*; the upgrade to *HALF* was added on top of it, and it flattered the decision by a factor of
two. **The decision survives on a weaker and truer claim** — `done` retains about the same as the
block it replaces and does a fifth of the work — *and the honest residue got bigger rather than
smaller*, because a consumer who kept no completion machinery at all now pays both a copy and a
`structuredClone` per settlement they did not.

**And the procedure that catches a piped rung does not catch a GREPPED one, which is the same
clause one step short.** v0.16 adopted *a rung is RUN, never PIPED: redirect it to a file and read
`$?`* because four authors across three plans had read a LINE. This item redirected every rung — and
then read the browser log with a grep whose pattern could not match a failure, while `EXIT=1` sat two
lines away in the same file. **Redirecting is what makes the exit code available; it does not make
anyone read it.** The four occurrences v0.16 names are all *the output was too long to read whole*,
and so is this one: the answer that would have worked is the one the harness already uses on every
other rung here — `grep -c` for `^\s*FAIL` and print the exit code beside the count, so a green
claim carries both numbers or neither. **One occurrence, and it is offered as an observation rather
than a proposal**, because the clause is right and it was the reading that failed; P20's retro is
where it belongs.

**Questions raised.** [Q320](../open-questions.md) (what an always-on handle retains and clones, and
the lazy road refused because the breaking road hands `done` to everyone),
[Q321](../open-questions.md) (a promise a library makes for every call cannot be bounded by a test
helper), [Q322](../open-questions.md) (nothing binds the version to the API's shape, and the two
manifests can disagree for zero), [Q323](../open-questions.md) (an unsettled await on a real
scheduler hangs rather than fails, and a harness killed mid-probe leaves the tree mutated).
**Q324-Q329 remain for W78.**
