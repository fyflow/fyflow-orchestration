# W32 — What a map-fanout is, and what its `branchPath` is

**Status:** done - author pass, BOTH READERS, rule 8's re-run and the gate re-run after acting on them are all complete.
**Plan:** [P10](../plans/p10-is-fan-out-one-feature-or-two.md) — *is fan-out one feature or two?*

```
Spec:       spec/flow-definition.md sections 2-5, spec/task-id.md section 1
            (this item CHANGES both; neither currently admits a run-time arity)
Owns:       src/definition/**, src/driver/ids.ts, spec/flow-definition.md,
            spec/task-id.md, spec/README.md, spec/examples/**, test/definition/**
Inputs:     P10 section 2 facts 1 and 2 — the three refusals, and the split between
            the id GRAMMAR (which admits run-time arity) and the DERIVATION (which
            pins it). doc/open-questions.md Q12, Q27.
Outputs:    ADR 0036 — Q12's answer, one feature or two.
            A definition shape a map is expressible in, and the validator rules for it.
            branchPathOf's contract, stated for a node whose index is not a property
            of the node.
            spec/flow-definition.md and spec/task-id.md at new versions, with
            spec/README.md's version rows moved with them (C8).
            Corpus flows in spec/examples/valid and spec/examples/invalid.
Depends on: nothing
Blocks:     W33
Tests:      test/definition/** — the validator's new refusals and its new acceptances,
            expected values derived from the spec text BEFORE the code is written.
            spec/examples/** through ladder L4's corpus walk.
Gate:       L0, L1, L4, then the spec-conformity pass (two readers)
Reserves:   Q156-Q159, ADR 0036
```

## Scope

**In**

1. **ADR 0036 — [Q12](../open-questions.md)'s answer.** One primitive or two, with the evidence
   P10 section 2 measured on both sides: a map needs **no id-scheme change** and **no change to two
   of three policies** (argues *one*); it breaks `branchPath`-as-a-property-of-the-node, makes
   `FD-V9`'s arity floor meaningless, reaches an N=0 the static feature cannot, and hands
   `arrival-count` a new failure direction (argues *two*). **The ADR states which it weighed and
   how.**
2. **The definition shape.** Whichever way ADR 0036 lands, a map must be expressible: a widened
   `fanout`, or a new node kind. `src/definition/types.ts` is where it becomes a type, and ADR 0002
   rule 1 binds it — **no functions anywhere in the structure**, so *"how many items"* is a declared
   reference to a previous node's output rather than a callback.
3. **The validator.** P10 fact 1 measured three refusals firing at three arities — `FD-V9`'s
   repeated-entry clause, `FD-V9`'s arity floor, and `FD-V11`'s reachability. **Each is either
   retired for a map, kept and restated, or kept as-is**, and the item says which for all three
   rather than only for the one it had to move.
4. **`branchPath` for a node whose branch index is not a property of the node.** P10 fact 2:
   `branchPathOf(regions, nodeId)` takes no run-time input, so three dispatches of one node mint
   **one id**. This item decides what replaces it and **states the contract in
   `spec/task-id.md`**, whose section 1 currently claims the opposite in a heading.
5. **`spec/README.md`'s version rows.** `check-spec`'s `C8` makes them a consequence of any
   `spec/**` bump, so whoever owns the spec document owns the row — W16's finding, and it is why
   that file is in this `Owns` rather than on the record-step list.

**Out** — named rather than left implicit, with where it goes instead

- **The driver.** Nothing here dispatches anything. Opening N branches, the region event stream and
  the policies are **W33**, which is why `src/driver/driver.ts` is not in this `Owns` and
  `src/driver/ids.ts` is.
- **What a branch receives and what the join carries.** [Q11](../open-questions.md),
  [Q36](../open-questions.md) and [Q154](../open-questions.md) are **W34**, deliberately after the
  map runs — P10's decision 2.
- **[Q27](../open-questions.md)** — convergent branches. **Not answered**, and ADR 0036 **owes it a
  sentence** because `FD-V19` is the rule both questions turn on.
- **A map inside a map.** Whether a map's branch entry may itself fan out. Named in P10's
  *"not taken"* and gets a Q id from this block only if the shape forces one here.
- **An upper bound on arity.** Same.

## Exceptions declared

`doc/workflow.md` section 7 rule 2. Files this item edits outside its `Owns` and outside section 1
rule 5's record step, named with the reason. **The record-step six are not exceptions**: this file,
the plan's Record, `doc/README.md`, `CLAUDE.md`, `README.md`, `doc/open-questions.md` and
`doc/decisions/**`.

| file | why | when it was declared |
|---|---|---|
| `scripts/build-browser-tests.mjs` | **A SECOND late exception, and it is a defect this item introduced and its own gate caught.** The two-way corpus check reads `spec/flow-definition.md` at module scope, and the browser bundle inlines **only** `spec/examples/**/*.json` — *"every fixture L4 reads"*, which L4 had not read before. A top-level `await readText` of a file that is not inlined **throws while the bundle is loading**, so **all twenty suites die** and the runner reports *"the suite never reported: page.waitForFunction Timeout"* at **0 files / 1 assertion** in **all three** browsers. The fix widens the inlined set by one file and changes no check's semantics. `scripts/**` is in nobody's `Owns` — [Q158](../open-questions.md)'s neighbour, and P8's shape again | **late** — after `npm run test:browser:all` measured it red |
| `src/driver/driver.ts` | **A THIRD late exception, and it closes the sharpest thing either reader found.** `enter()`'s `switch (node.kind)` has arms for `task`, `fanout`, `join` and `end`, **no `map` arm and no `default`** — and no exhaustiveness assertion, so `npm run typecheck` is green. **W32 is what made a `map` definition valid**, so from this item until W33 a valid document routed into a map node and the driver did *nothing*: no dispatch, no `branch.opened`, no `pathEnded`, no `RunFailure`. Reproduced independently before acting on it: `map-fanout.flow.json` dispatches `r1:ingest:-:0` and stops, and the conformity reader measured the settled version reporting **`completed`** — *"character-for-character the false statement [ADR 0015](../decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) exists to remove"*, and the silent stop `spec/flow-definition.md` section 3 refuses **by name**. The fix is a **`default` arm** rather than a `map` arm — the hole is the missing exhaustiveness, not the missing kind — and it reports through the existing `OR-R10` path with an **existing** error class, so [P10](../plans/p10-is-fan-out-one-feature-or-two.md) decision 4's *"no new error class"* holds. **W33 replaces it with the real arm** | **late** — after the conformity reader measured it and W32 reproduced it |
| `spec/join-policy.md` | **A FOURTH late exception, for a sentence that is FALSE rather than merely absent.** Section 1's `branches` row says *"a branch's index in this array is its `branchPath` segment"*, and `toRegion` hands a policy `branches: ['score']` for a map region where the segment is the run-time item index and `branchIndexOf` answers `null`. [Q159](../open-questions.md) records the *capability* question — whether a policy should be able to tell the kinds apart, which is W33's — and a deferred field is a scope call while a **false normative sentence is not**. `doc/workflow.md` v0.7 change 3's own argument: *a gap that blocks a fix is worse than one that hides an edit*, which is why `doc/decisions/**` was added to the record step after W17 could not correct ADR 0015 | **late** — after the conformity reader measured it |
| `test/driver/driver.test.ts` | **A FIFTH late exception, and it exists because the fourth one needs a test.** `doc/workflow.md` section 1 rule 2 — *tests are part of the work item, never follow-up* — and rule 8 — *break the fix and watch the gate go red*. The `default` arm above is a **driver** behaviour and belongs in the **driver** suite; putting it in `test/definition/map.test.ts` to keep the exception count down would be wrong-layered bookkeeping, and P7's lesson was that exceptions come from a badly written `Owns` block rather than that exceptions are bad — W5 took **seven** and was right to | **late** — with the fix it tests |
| `AGENTS.md` | **One LATE exception, and it was predicted before it fired rather than discovered by the gate.** `index.ts` re-exports `src/definition/regions.ts` with `export *`, so the new `UnresolvedBranchPath` class (`ID-R6`) reaches the package root **without this item editing `index.ts`**, and section 9's executed snippet enumerates every `Error` subclass the root exports and throws on one it does not name ([Q101](../open-questions.md)). **Measured**: `check:docs` exits 1 at `X4`, `AGENTS.md:750`, before the edit. That is the check working exactly as its own paragraph says it should — *"what makes adding a refusal class in `src/` and not mentioning it here a failure rather than an omission nobody can observe"*. The edit is the minimum that is not a lie: the import, the list entry, and one sentence saying the class belongs to a feature **no driver dispatches yet** | **late** — after the design was fixed and before the edit was made |

**`scripts/check-markdown.mjs` is NOT an exception here**, and that was predicted rather than
assumed — see [Q142](../open-questions.md) in the Record.

## Verification

Node 24 is not on the PATH by default; `eval "$(fnm env --shell bash)" && fnm use 24` first.

| Clause | How it is run |
|---|---|
| **L0** | `npm run lint` and `npm run typecheck` — five typecheck projects, and `typecheck:deno` is the one that catches a `node:` import (`RT-R3`, `RT-R4`) |
| **L1** | `npm run test`, `npm run test:deno`, `npm run test:browser` — the validator's unit tests. **`test:browser` is CHROMIUM ONLY**; `npm run test:browser:all` is what adds firefox and webkit, and this item says which it ran |
| **L4** | the definition-conformance corpus — every flow in `spec/examples/**` validated, through `test/definition/l4-corpus.test.ts` and `npm run check:spec` |
| **conformity** | spec first, code second, expected values re-derived independently |
| **adequacy** | mutation, walking the rule ids, **in a copy off the shared tree**. Scan for symlinks and reparse points before removing it (ADR 0029) |

**Routing cases this item covers, and the ones it does not** (`doc/workflow.md` section 5 rule 6):
a **nested fan-out** ([Q6](../open-questions.md)) is covered — a map must not break what
[ADR 0030](../decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
settled, and `test/definition/nesting.test.ts` is where that is asserted. A **duplicate task id**
([Q13](../open-questions.md)) is covered at the id layer and **not** at the dispatch layer, which is
W33's. A branch **routed away from its join** ([Q4](../open-questions.md)), **`user_action`**
([Q17](../open-questions.md)) and **no matching decision edge** ([Q10](../open-questions.md)) are
**not applicable here** — none is reachable without a driver.

**Rule 8 applies to every fix this item makes for a reader's finding**, all five obligations, and the
set is **re-run after acting on the readers** with their exact edits checked back in as probes. The
one to instantiate deliberately here is **(e), break the WIRING** — P10 prediction 3 says it fires on
a `src/` item and P10's retro owes a verdict either way. A new validator rule that is never reached,
a corpus flow no walk picks up, and a `spec/examples/` directory nothing globs are its three shapes
in this item's own paths.

## Record

**Gate — what ran.** Commands under `eval "$(fnm env --shell bash)" && fnm use 24`.

| Clause | Verdict | Notes |
|---|---|---|
| **L0** | **RAN — green** | `npm run lint` — 44 files, 0 findings. `npm run typecheck` — **all five projects**: `typecheck:node`, `typecheck:browser`, `typecheck:deno`, `typecheck:tests`, `typecheck:examples`, exit 0 |
| **L1** | **RAN — green in all FIVE runtimes** | **20 files / 517 cases**, from 19 / 474. Measured in node 24.20.0, deno 2.9.6 and — via **`npm run test:browser:all`** rather than the gate's chromium-only `test:browser` — chromium, firefox and webkit, each reporting *parity with node*. Sub-suites, derived rather than subtracted: **definition 5 / 118** (from 4 / 82) and **driver 7 / 166**. **This row read *"three runtimes"* and a chromium **506** measured BEFORE the change it described — see *What broke* 5 — and then read **5 / 122** and **7 / 169**, which were arithmetic rather than a run. Both are the same defect and the second was committed in the sentence correcting the first** |
| **L4** | **RAN — green** | `npm run check:spec` — **7 documents, 33 examples, 77 rules**, `C1`-`C8` all ok, from 30 examples and 75 rules. `C4` covered **23** definition refusals, `FD-V14`/`FD-V15` skipped as declared absent. The corpus walk is `test/definition/l4-corpus.test.ts` and ran inside L1 above |
| **rule 8 set** | **RAN TWICE — 32/29 before the readers, 42 provocations / 39 caught / 0 survived / 0 aborted / 3 by hand after, with ELEVEN of the readers' own edits checked back in** | `node dev-dist/w32/provoke.mjs` for 31, graded on the failure LINES rather than the exit code. The 32nd was run by hand because the harness ran L1 in **node** and that probe's whole subject is a **browser** bundle: dropping `spec/flow-definition.md` from the inlined set gives `0 file(s), 1 assertion`, `PARITY FAIL`, and **`PAGE ERROR Error: fixture not inlined in the browser bundle: spec/flow-definition.md`** — the failure line naming its own reason |
| **full `npm run gate`** | **RAN — `GATE EXIT=0`, ZERO FAIL lines** | Read from the log's own `GATE EXIT` line rather than from a shell wrapper's code. **19 chain entries, 6m21 wall** — a fourth reading beside P9's 366 s and 438 s and P10's 9m40 on comparable work, so it is quoted as a band rather than a constant. `spec` **7 documents / 33 examples / 77 rules**; `markdown` **73 documents / 2322 relative links / 115 anchored**; `docs` 19 snippets, 14 run. **L6 is UNMOVED at 489 assertions and 25 real runs in node and deno**, which is the declared result: nothing here dispatches anything |
| conformity reader | **RAN — 12 findings, 6 blocking** | spec first, code second, every corpus verdict re-derived by hand from section 5 alone before looking at the author's. All twelve acted on |
| adequacy reader | **RAN — 29 mutations, 11 survivors, 5 blocking** | walking the rule ids, in a copy off the shared tree, with a second independent route confirming reachability for every survivor. One candidate reported as **structurally unreachable rather than as a survivor** |
| **re-run after acting on the readers** | **RAN — `GATE EXIT=0`, ZERO FAIL lines** | Read from the log's own `GATE EXIT` line. **19 chain entries, 7m18 wall** — a fifth reading beside P9's 366 s and 438 s, P10's 9m40 and this item's own earlier 6m21, on work that grew by 11 cases in between; quoted as a band, not a constant. `spec` **7 / 33 / 77**; `markdown` **73 documents / 2345 relative links / 115 anchored**; L1 **20 / 517** in node, deno and chromium with parity; **L6 unmoved at 489 assertions and 25 real runs** in node and deno. Nothing is committed, so the sha this names is the working tree at the end of the item rather than a commit |

**`Owns` audit — 23 paths, ZERO undeclared, FIVE late exceptions.** By `git status --short` against
the `Owns` block, by hand (`doc/workflow.md` section 7 rule 2; `check-owns.mjs` stays retired).
**Derived in one expression rather than asserted**: `git status --short | wc -l` is **23** — 18
modified and 5 new. *(This line read **15** and then **16**, both times counted off the `Owns` row
alone while the record-step files sat in the rows below it. `doc/workflow.md` section 1 rule 5's
*where a number is derivable in one expression, derive it there*, in the audit whose whole subject is
counting files.)*

| | files |
|---|---|
| **`Owns`** | `src/definition/types.ts`, `src/definition/regions.ts`, `src/definition/validate.ts`, `spec/flow-definition.md`, `spec/task-id.md`, `spec/README.md`, `spec/examples/valid/map-fanout.flow.json` (new), `spec/examples/valid/map-in-fanout.flow.json` (new), `spec/examples/invalid/FD-V25--map-branch-is-a-join.flow.json` (new), `test/definition/map.test.ts` (new), `test/definition/l4-corpus.test.ts` |
| **record step** (section 1 rule 5) | this file, `doc/open-questions.md`, `doc/decisions/0036-*.md`, plus `doc/README.md`, `CLAUDE.md`, `README.md` and the plan's Record |
| **declared exceptions** | **FIVE, all LATE, all declared before the edit, and NOT ONE found by reading.** `AGENTS.md` and `scripts/build-browser-tests.mjs` were found by running a check; `src/driver/driver.ts`, `spec/join-policy.md` and `test/driver/driver.test.ts` were found by the conformity reader and by the fix it forced. **Five is P7's W20 number and the cause is the opposite one**: W20's five came from an `Owns` block that gave it nowhere to work, and section 7 rule 2 was written for that. These five are a definition-layer item discovering that a new node kind reaches the driver, the consumer reference, the browser bundle and another spec document — **which is an argument that this item's `Owns` was drawn one layer too narrow for what it changed**, and it is P10's retro's to judge rather than this Record's |
| **in `Owns` and NOT edited** | **`src/driver/ids.ts`.** Recorded rather than omitted: it is in the block because P10 fact 2 raised the possibility that the id scheme needed widening, and **it did not** — which is prediction 1's first half, evidenced by a file that is untouched |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **ADR 0036 — Q12's answer, one feature or two** | **yes** — [0036](../decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md), *two features over one region* | **Nothing mechanical reads its content, and that is the honest cell.** Probe `b7` renamed its `## Decision` heading and **noticed 0**: no check opens an ADR. What would fail is `check-markdown`'s `M1` if the file were gone — [Q12](../open-questions.md)'s Resolved row links to it, and it is one of the 73 documents |
| **A definition shape a map is expressible in** | **yes** — `MapNode` in `src/definition/types.ts`, `kind: "map"` with `over` and `branch` | `test/definition/map.test.ts` *"a map flow is VALID"*; and probe `e5` (dropping `MapNode` from the `FlowNode` union) is caught at **L0** by both `tsc` and `deno check` — five errors in `regions.ts`, `TS2367` and `TS2339` |
| **The validator rules for it** | **yes** — `FD-V25`, plus `FD-V2`/`FD-V6`/`FD-V12`/`FD-V24` widened | probes `a1`-`a4`, `a8`, `a9`, `d2`, `e3` — eight, each naming its clause. `check-spec`'s `C2`+`C3`+`C4` fail if `FD-V25` is renamed (probe `b6`, exactly the declared set) |
| **`branchPathOf`'s contract for a node whose index is not a property of the node** | **yes** — the optional per-region `itemIndices`, `UnresolvedBranchPath`, `ID-R6` | probes `a5`, `a6`, `a7`, `c2`, `c3`, `c4`, `e4` — seven. `a5` (guess the declared index instead of refusing) costs 3 named cases; `e4` (make the arm unreachable while the refusal still reads correctly) costs 6 |
| **`spec/flow-definition.md` and `spec/task-id.md` at new versions** | **yes** — both **v0.7 to v0.8** | `check-spec`'s `C8`, which **fired for real** before `spec/README.md` was updated: two failures naming both documents |
| **`spec/README.md`'s version rows moved with them (C8)** | **yes** | probe `b5` — reverting one row to v0.7 costs exactly `{C8}` |
| **Corpus flows in `spec/examples/valid` and `spec/examples/invalid`** | **yes** — `map-fanout.flow.json`, `map-in-fanout.flow.json`, `FD-V25--map-branch-is-a-join.flow.json` | probes `b3`, `b4`, `d4`, `d5`, `d6`, `e2`. **`e2` is the one that matters**: until this item, renaming a valid corpus flow out of the glob was noticed by **nothing** |

**What broke.**

**1. `check:docs` went red, exactly as predicted, and it is this item's one late exception.**
`index.ts` re-exports `src/definition/regions.ts` with `export *`, so `UnresolvedBranchPath` reached
the package root without this item touching `index.ts`, and `AGENTS.md` section 9's executed snippet
enumerates every `Error` subclass the root exports. **`X4` at `AGENTS.md:750`, exit 1** — the check
working exactly as its own paragraph says it should. Fixed with the minimum edit that is not a lie:
the import, the list entry, and one paragraph saying the class belongs to a feature **no `Driver`
dispatches yet**. [Q157](../open-questions.md) is the gap behind it — **no P10 item owns
`AGENTS.md`**.

**2. Two of this item's own L1 fixtures made a CYCLE, so the region rules never ran and the tests
passed for the wrong reason.** The `FD-V13` and `FD-V22` map fixtures each closed a loop back into
the region; `FD-V10` then fires and the whole region family is guarded on `!cyclic`. Caught by the
assertion failing rather than by reading — and each fixture now carries an explicit
`ok(!rules.includes('FD-V10'))`, so a future one cannot pass for that reason silently. *A guard that
skips a family of rules makes every test of that family conditional on a property the test does not
assert.*

**3. This item's own expected set named a check that structurally cannot fire.** Probes `a2` and `d2`
declared `C4`, and **`C4` never opens the file** — `spec/README.md` says so in bold, and the
expectation was written from the rule's *name* instead. The L4 corpus walk is what actually
discriminates. **Rule 7 (c)'s set equality is what caught it**, on the author's own set, which is the
use P3's retro predicted for it.

**4. The census caught a row this item had written ten minutes earlier.**
[Q156](../open-questions.md)'s status cell read `open - deferred by W32`; a classifier testing
`deferred` before `open` reads that as **deferred**, and the totals still summed — *"81 open, 3
deferred"* with **no abort**. The cell was rewritten to a bare `open` rather than the parser widened,
because the register's own header declares three status values and a cell that narrates instead of
naming one is the defect.

**5. The Record claimed a number measured BEFORE the change it described, and running it for real
found a defect that broke every browser runtime.** This table's L1 row read *"20 / 506 on chromium"*,
taken from a run made **before** the two-way corpus equality existed. `npm run test:browser:all` then
reported **0 file(s), 1 assertion** and `PARITY FAIL` in **all three** browsers, with *"the suite
never reported"*. **The cause is that the browser bundle inlines only `spec/examples/` JSON**, and a
suite reads its fixtures at **module scope** — so `readText` throwing for a file the corpus does not
carry happens while the bundle is LOADING and takes **all twenty suites** with it. **A missing fixture
does not fail one test; it fails the run in a way that names no file**, until you read the page error.
Fixed by inlining the one document, declared as this item's second late exception, and provoked: the
probe restores `0 / 1` and prints `PAGE ERROR Error: fixture not inlined in the browser bundle:
spec/flow-definition.md`.

**This is `doc/workflow.md` section 1 rule 5's provenance clause — *any copy, including your own* —
inside a Record written to describe an item's own gate**, which is
[W23](w23-a-nested-flow-on-real-workers.md)'s exact failure one plan later. The rule names indexes
because indexes are where it had been seen; the mechanism is **reading a derived claim instead of
deriving it**, and here the derivation was one command. It is also this item's sharpest argument for
the runtime axis: **L1 was green in node and deno and broken in all three browsers**, and section 4's
*"a rung reported green without saying which runtimes it ran in is a rung that ran in one"* is exactly
what caught it.

**6. `CLAUDE.md`'s current-state line went stale a THIRD time, inside this item, and the mechanism
was a batched edit that failed halfway.** The line was found stale at P10's declaration and carried a
warning about that; a script correcting it here aborted on a **later** substitution in the same
batch, wrote nothing, and left *"BOTH READERS OUTSTANDING"* standing while their reports were being
acted on three paragraphs below in the same file. **A partial batch does not leave a document half
updated — it leaves it entirely un-updated while every other file moves on**, and the failure is
silent because the abort is reported against the substitution that missed rather than against the one
that mattered. Nothing checks that line. Corrected, with the mechanism recorded in place.

**What this taught.**

**P10 prediction 1 — CONFIRMED on both halves, and the second half is sharper than it was written.**
The grammar is unchanged, `parseTaskId` is unchanged and **`buildTaskId`'s signature is unchanged**:
`src/driver/ids.ts` is in this item's `Owns` and was not edited at all. 500 indices for one node mint
500 distinct strings through the shipped signature and the nested `1.137` round-trips. The prose half
is falsified one level further than P10 stated — `branchPathOf` returns `"0"` not only for the mapped
**entry** but for **every node of its branch subgraph**, so what a map breaks is not one node's index
but the whole subgraph's.

**P10 prediction 3 — FIRES. Rule 8's fifth obligation generalises past a harness.** Three instances
in this item's own paths, all three named in the item file **before** the set was written:

| | the wiring | what happened |
|---|---|---|
| **a corpus flow no walk picks up** | `map-fanout.flow.json` renamed out of the `.flow.json` glob | **noticed 0** before, **CLOSED** now. The only bound was `validNames.length > 0` and `check-spec`'s `C4` never opens a file. Replaced by a **set equality both ways** against `spec/flow-definition.md` section 7's own table |
| **a whole test file no runner globs** | `map.test.ts` renamed to `map.notatest.ts` — **26 cases gone** | **noticed 0, and still open.** `test/runner.ts`'s only bound is *"no test files found"*, a floor of one, and no `S` check counts the suite set. `test/runner.ts` and `scripts/**` are in nobody's `Owns` — [Q158](../open-questions.md) |
| **a rule present, correct and unreachable** | `FD-V25`'s arm and `ID-R6`'s arm each made unreachable with the rule text untouched | **CAUGHT**, 2 and 6 cases. So obligation (e) is not only about a thing nothing runs; it is also about a thing that runs and cannot reach its subject |

**And the corpus equality had a LIVE case the day it was written, which is the half P9's retro asks
for.** `nested-fanout.flow.json` was added by [W20](w20-what-a-nested-region-is.md) and **never added
to `spec/flow-definition.md` section 7's table** — the spec's own example index was stale by one for
a whole plan and every check passed. P9's retro says *construct the case that makes each guard fire,
and where the corpus cannot express one, record that*; here the corpus already expressed one.

**The central finding, and it is what decided ADR 0036.** `branchOf` is a `Map<string, Set<string>>`
**keyed by branch node id**, so `branches: ["x","x","x"]` has **one** entry and `region(F)` is `{x}`.
**The repeated-entry encoding of a map does not express N branches even to the layer that would have
to honour it** — and `FD-V19` fires `n(n-1)/2` times on it (**1, 3, 6, 10, 15, 45** measured at
N = 2, 3, 4, 5, 6, 10; 124 750 at N = 500) while iterating **0** pairs over a one-branch region.
**The same rule, quadratic on one encoding and vacuous on the other**, is what turned *"are these one
primitive or two"* from an argument into a measurement. What the two features share is the **region**;
what differs is the whole of the **fan-out**.

**And it corrected the framing this item was handed.** P10's declaration and
[Q27](../open-questions.md)'s row both say *"a map is `FD-V19`'s condition on purpose"*. **That is
true of the ENCODING and false of a `map` node**: one branch means *"two distinct branch entries"* has
no instance, so a map does not lift, weaken or reach `FD-V19`, and **Q27 is untouched** rather than
entangled with Q12. Both rows are corrected in place.

**P10 fact 1's N=0 row is right for the fixture it measured and does not generalise, and the design
consequence is the sharper half.** P10 recorded `branches: []` as **3 findings** (`FD-V9` +
`FD-V11` twice). Measured here with the branch task **still declared** — which is what a map's
document actually looks like — it is **5 findings and a fourth refusal path**: `FD-V9`, `FD-V11`
three times, and **`FD-V20`**, because the orphaned branch node has an arc to a join whose region is
now empty. **The scope of that measurement is the fixture, not the arity.** And a `map`'s arity is
**not in the document at all**, so `FD-V9`'s floor and `FD-V11`'s reachability cannot fire for an
arity reason on a map node: a map of one item and a map of zero items are ordinary runs of a
definition that validates. **All three of P10 fact 1's refusals are kept exactly as they are. Not one
is retired and not one is restated**, which is the answer scope item 3 asked for on all three rather
than on the one that had to move.

**Nothing in `spec/` looked wrong or unimplementable**, so nothing was reported under
`spec/README.md` rule 2.

**[Q142](../open-questions.md) was predicted NOT to fire, it did not, and the three counts were taken
before any file was added.** `check:markdown` and `check:markdown:selftest` are both green in the full
gate run above. Whole tree **72 / 2212 / 108** (the hand-off's baseline said 2211 links; 2212
measured), `doc/decisions` removed **56**, `doc/decisions` + `doc/plans` removed **45 / 1565** —
against floors of `M3 < 64`, `M4 < 1720`, `M5 < 60`. W32's only new markdown document is **ADR 0036**,
which lives in the directory **both** `removes` probes cut, so both fixtures were predicted to be
unmoved and **no exception on `scripts/check-markdown.mjs` was needed**. The tree is now
**73 / 2289 / 115**.

**Rule 8 — 32 provocations, 29 caught, 0 survived, 0 aborted, 3 read by hand.** Thirty-one run against a copy of
the tree outside the repository, grading on the **failure lines** rather than the exit code
(`doc/workflow.md` v0.10's requirement on the set). Every entry declared the exact set it must trip
and asserted it changed its input; **the harness itself was scratch under `dev-dist/` and is deleted**,
which is why the edits are transcribed below rather than only referenced.

- **(a) the rule's clauses — 9**, all caught. `FD-V25`'s three clauses one at a time; `ID-R6`'s
  refusal and its segment grammar; `branchIndexOf`'s map arm; `FD-V6`'s opener union; `FD-V24`'s kind
  list; `FD-V23`'s required set.
- **(b) the `Outputs` rows — 7.** Six caught; `b7` (an ADR's own Decision heading) noticed **0**,
  which is a ceiling rather than a defect, and the `Outputs` table says so in its cell.
- **(c) provenance — 4**, all caught, **and one was a real survivor first.** `opensWith` read from
  `branches.length === 1` instead of from the opener's kind **survived the whole file**, because
  `FD-V9`'s floor means the two sources agree on every VALID document. Closed by constructing the
  discriminating input — an **invalid** one-branch `fanout`, which `regionSets` is handed anyway
  because `validateDefinition` calls `allRegions` on whatever it is given.
- **(d) loop bounds — 6**, all caught after two rounds. The `{1,64}` ceiling could be dropped from
  the accept list for **0**, because nothing counts that list and the refuse list's `repeat(65)` is
  satisfied by any ceiling at all; the boundary is now a **named pair** rather than two entries in
  two loops.
- **(e) wiring — 5.** Three caught, one closed during the item, **one still open**
  ([Q158](../open-questions.md)).
- **the fix for `What broke` 5 — 1**, run by hand in a browser rather than in the harness, and
  caught. `doc/workflow.md` section 5 rule 8's founding case: *when you act on a finding, break the
  fix and watch the gate go red.*

**The set, as edits precise enough to re-run** (`doc/workflow.md` section 5 rule 8: *the provocation
is recorded as an edit precise enough to re-run, and that is enough*). **The harness was scratch under
`dev-dist/`, is gitignored, would not have survived into an isolated copy, and is now deleted** — so
this table is the record rather than a pointer to one. Measured: W13's and W14's readers reproduced
every provocation exactly from a Record, to the failure count, which is the standard this is written
to. **Rendered from the harness rather than retyped**, and
then reconciled against it: the renderer produced **29** rows for **31** entries, because its regex
could not read a multi-line `from` (`b2`) or an escaped apostrophe (`b5`); both were added by hand
and the two lists then matched id for id. *(The first reconciliation said 11 of 11 and was wrong —
the id pattern was `[a-z0-9-]` against ids that carry `FDV25` and `IDR6`. **Counting the artefact
with a pattern that does not match the artefact is the same defect one level down**, and it agreed
with itself perfectly.)*

| id | obligation | file | the edit | what it breaks |
|---|---|---|---|---|
| `a1-FDV25-edges` | (a) clause | `src/definition/validate.ts` | `if (nd.edges !== undefined) add('FD-V25', where, 'map has edges');` → *(deleted)* | FD-V25 clause 1: a map may not carry `edges` |
| `a2-FDV25-branch-kind` | (a) clause | `src/definition/validate.ts` | `if (typeof m.branch === 'string' && g.byId.has(m.branch) && kindOf(m.branch) !== 'task') {` → `if (false && typeof m.branch === 'string' && g.byId.has(m.branch) && kindOf(m.branch) !== 'task') {` | FD-V25 clause 2: a map's branch must be a task |
| `a3-FDV25-over-charset` | (a) clause | `src/definition/validate.ts` | `if (nd.over !== undefined && (typeof nd.over !== 'string' || !ID_RE.test(nd.over))) {` → `if (nd.over !== undefined && typeof nd.over !== 'string') {` | FD-V25 clause 3: `over` must match FD-V16 charset — the CHARSET half |
| `a4-FDV25-over-required` | (a) clause | `src/definition/validate.ts` | `map: { req: ['id', 'kind', 'over', 'branch'], opt: [] },` → `map: { req: ['id', 'kind', 'branch'], opt: ['over'] },` | FD-V23: `over` is REQUIRED — narrow the required set rather than delete the rule |
| `a5-IDR6-refusal` | (a) clause | `src/definition/regions.ts` | `const supplied = itemIndices?.get(r.fanoutId); if (supplied === undefined) {` → `const supplied = itemIndices?.get(r.fanoutId) ?? 0; if (false) {` | ID-R6: branchPathOf must refuse. Guess the declared index instead |
| `a6-IDR6-segment-grammar` | (a) clause | `src/definition/regions.ts` | `if (!INDEX.test(String(supplied))) {` → `if (!Number.isInteger(supplied)) {` | ID-R6's second half: an item index that is not a branchPath segment |
| `a7-branchIndexOf-map` | (a) clause | `src/definition/regions.ts` | `if (r.opensWith === 'map') return null;` → *(deleted)* | ADR 0036 rule 4: branchIndexOf has no answer inside a map region |
| `a8-FDV6-map-opener` | (a) clause | `src/definition/validate.ts` | `const openers = [...fanouts, ...maps];` → `const openers = [...fanouts];` | FD-V6 widened: a join may name a map, and an unpaired map is refused |
| `a9-FDV24-kind-list` | (a) clause | `src/definition/validate.ts` | `const KINDS = ['task', 'fanout', 'map', 'join', 'end'] as const;` → `const KINDS = ['task', 'fanout', 'join', 'end'] as const;` | FD-V24's kind list admits `map` |
| `b1-map-node-succ` | (b) output | `src/definition/regions.ts` | `if (n.kind === 'map') return isId(n.branch) ? [n.branch] : [];` → *(deleted)* | Output "a definition shape a map is expressible in": the graph arc |
| `b3-corpus-valid-map` | (b) output | `spec/examples/valid/map-fanout.flow.json` | `"kind": "map", "over": "items", "branch": "score"` → `"kind": "map", "over": "it ems", "branch": "score"` | Output "corpus flows in spec/examples/valid" — the map flow itself |
| `b4-corpus-invalid-FDV25` | (b) output | `spec/examples/invalid/FD-V25--map-branch-is-a-join.flow.json` | `"branch": "collect"` → `"branch": "score"` | Output "corpus flows in spec/examples/invalid" — the FD-V25 case must still name it |
| `b6-spec-FDV25-declared` | (b) output | `spec/flow-definition.md` | `| `​FD-V25`​ | a `​map`​ has `​edges`​;` → `| `​FD-V26`​ | a `​map`​ has `​edges`​;` | Output "the validator rules for it" — FD-V25 declared in the spec table |
| `b7-ADR-0036-exists` | (b) output | `doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md` | `## Decision` → `## Not a decision` | Output "ADR 0036 — Q12's answer". Delete its Decision section heading |
| `c1-opensWith-source` | (c) provenance | `src/definition/regions.ts` | `const opensWith: 'fanout' | 'map' = fan?.kind === 'map' ? 'map' : 'fanout';` → `const opensWith: 'fanout' | 'map' = fan?.kind === 'fanout' && Array.isArray(fan.branches) && fan.branches.length === 1 ? 'map' : (fan?.kind === 'map' ? 'map' : 'fanout');` | `opensWith` read from the OPENER's kind. Read it from the branch count instead — same values on today's corpus, different source |
| `c2-index-source` | (c) provenance | `src/definition/regions.ts` | `i = supplied;` → `i = 0;` | The item index read from the caller. Read it from the region instead (branchIndexOf would give 0) |
| `c3-key-source` | (c) provenance | `src/definition/regions.ts` | `const supplied = itemIndices?.get(r.fanoutId);` → `const supplied = itemIndices?.get(r.joinId);` | The index looked up by the MAP node id. Look it up by the join id instead |
| `c4-INDEX-source` | (c) provenance | `src/definition/regions.ts` | `const INDEX = /^(?:0|[1-9][0-9]*)$/;` → `const INDEX = /^-?[0-9.e+]+$/;` | regions.ts's INDEX is `spec/task-id.md`'s grammar. Substitute a looser source for it |
| `d1-allRegions-map-arm` | (d) bounds | `src/definition/regions.ts` | `if (n?.kind !== 'fanout' && n?.kind !== 'map') continue;` → `if (n?.kind !== 'fanout') continue;` | allRegions iterates openers of TWO kinds. Drop the map arm — one entry out of the list |
| `d2-maps-list-empty` | (d) bounds | `src/definition/validate.ts` | `const maps = nodes.filter((n) => n?.kind === 'map');` → `const maps = nodes.filter((n) => n?.kind === 'map').slice(0, 0);` | FD-V25's branch-kind clause iterates `maps`. Empty the WHOLE list |
| `d3-over-ceiling-pair` | (d) bounds | `src/definition/validate.ts` | `const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;` → `const ID_RE = /^[A-Za-z0-9_-]{1,63}$/;` | The {1,64} ceiling NARROWED in the validator — what the named boundary pair exists to catch, and what the two loops could not |
| `d4-corpus-glob` | (d) bounds | `test/definition/l4-corpus.test.ts` | `const validNames = (await listDir(`​${EX}/valid`​)).filter((n) => n.endsWith('.flow.json'));` → `const validNames = (await listDir(`​${EX}/valid`​)).filter((n) => n.endsWith('.flow.json')).slice(1);` | The L4 corpus walk iterates spec/examples/valid — one entry out of the list |
| `d5-section7-row-out` | (d) bounds | `spec/flow-definition.md` | `| `​map-fanout.flow.json`​ | **a `​map`​**` → `| ~~map-fanout.flow.json~~ | **a `​map`​**` | The OTHER direction of the same bound: a row leaves the spec's own table |
| `d6-section7-parse` | (d) bounds | `spec/flow-definition.md` | `## 7. Examples` → `## 7. Example flows` | The PARSE the bound rests on: move section 7's heading so the slice finds no table |
| `e1-map-test-not-globbed` | (e) wiring | `test/definition/map.test.ts` | **rename to** `test/definition/map.notatest.ts` | The whole of map.test.ts, renamed so the runner does not glob it. Does anything say the suite is gone? |
| `e2-corpus-file-not-globbed` | (e) wiring | `spec/examples/valid/map-fanout.flow.json` | **rename to** `spec/examples/valid/map-fanout.flow.json.bak` | The map corpus flow renamed out of the `.flow.json` glob. Does L4 or check-spec notice a corpus flow nothing picks up? |
| `e3-FDV25-never-reached` | (e) wiring | `src/definition/validate.ts` | `if (nd.kind === 'map') { if (nd.edges !== undefined) add('FD-V25', where, 'map has edges');` → `if (nd.kind === 'map' && nd.kind !== 'map') { if (nd.edges !== undefined) add('FD-V25', where, 'map has edges');` | FD-V25's node-level clauses live under `if (nd.kind === 'map')`. Make that branch UNREACHABLE while the rule still exists and still reads correctly |
| `e4-IDR6-unreachable-guard` | (e) wiring | `src/definition/regions.ts` | `if (r.opensWith === 'map') { // **`​ID-R6`​.**` → `if (r.opensWith === 'map' && r.branches.length > 99) { // **`​ID-R6`​.**` | The ID-R6 arm is entered on `opensWith === 'map'`. Make the ARM unreachable while both the refusal and its message stay exactly as written |
| `e5-MapNode-erased` | (e) wiring | `src/definition/types.ts` | `export type FlowNode = TaskNode | FanoutNode | MapNode | JoinNode | EndNode;` → `export type FlowNode = TaskNode | FanoutNode | JoinNode | EndNode;` | MapNode dropped from the FlowNode union — the TYPE is never consulted at run time, so does anything at L1/L4 notice? |
| `b2-regionSets-map-branch` | (b) output | `src/definition/regions.ts` | the `fan.kind === 'map' ? [fan.branch] : []` arm of `regionSets`' `branches` ternary → `[]` | Output *"branchPathOf's contract"*: `regionSets` must give a map ONE branch entry |
| `b5-spec-README-version` | (b) output | `spec/README.md` | the `flow-definition.md` row's trailing `**v0.8**` → `**v0.7**` | Output *"spec/README.md's version rows moved with them (C8)"* |

**A thirty-second, run by hand in a browser** — `scripts/build-browser-tests.mjs`, dropping
`join(ROOT, 'spec', 'flow-definition.md')` from the `fixtures` list. `npm run test:browser` then
reports `0 file(s), 1 assertion`, `PARITY FAIL`, and `PAGE ERROR Error: fixture not inlined in the
browser bundle: spec/flow-definition.md`. It is not in the harness because the harness runs L1 in
**node**, where the fixture is read from disk and the probe cannot fire.

**Two probes ABORTED on the first re-run and both were rule 7 (b) firing correctly rather than
passing** — their anchor text had been changed by fixes made earlier in the same item. That is *"a
mutation pinned to a literal is unmutatable the moment the literal is right to change"*, applied to a
fix rather than to a magic number.

**The two reader passes.** Both ran with a fresh context, **spec first and the artifact second**,
and both reported rather than fixed. The adequacy reader worked in a full copy at
`%LOCALAPPDATA%\Temp\claude\w32-adequacy`, **off the shared tree**, verified green before it started
and containing **zero symlinks and zero reparse points** — both measured before the copy was made
(ADR 0029, and `doc/workflow.md` section 6's *"scan for links before `--force` anything"*).

**Neither was primed.** They were given the spec, the ADR, the method and the environment hazards,
and **not** a list of claims the author was least sure of.
[W31](w31-the-self-list-check-policies-never-had.md) did prime both of its readers and its Record
flags that as a confound on the only measurement outside the band; thirteen of the fourteen earlier
measurements were unprimed, so this one is comparable.

| | found | blocking |
|---|---|---|
| **conformity** | **12** | **6** |
| **adequacy** | **11 survivors** of 29 mutations (+3 second-route re-runs and 1 compound = 33 runs) | **5** |
| **overlap** | **2** | |

**The overlap is 2 of 23, the FIFTEENTH measurement, and inside the settled 0-4 band.** Both shared
subjects were reached from opposite ends, which is what the band's own explanation predicts:

| subject | conformity got there by | adequacy got there by |
|---|---|---|
| the `branch: 5` guard | asking why `over: 42` reports `FD-V25` and `branch: 5` reports `FD-V21` — an **attribution** question | disabling the guard and finding **no test at all** — a **coverage** question |
| **a `map` as the `entry` node** | re-deriving the spec sentence it added and confirming it true — *"and untested anywhere"* | mutating `FD-V3` to refuse a map and finding **nothing failed** |

**Their split is the cleanest since W30's, and it is the split the two roles predict.** The
conformity reader found **claims that were false or unlicensed** — a normative table that no longer
computes, a refusal no rule text licenses, a soundness argument whose premise set went stale, a
sentence in another document that this item made wrong, and three counts in the consumer reference.
The adequacy reader found **bounds that were not there**, and **three of its five blocking survivors
are one shape**: *the new check binds a set of NAMES, and nothing binds where those names came from,
what the files contain, or the sibling directory.*

### The finding to carry, and it is the one aimed at what this item was proudest of

**The check W32 built to close a wiring hole could be made vacuous by one source-expression swap.**
`documentedValid` parsed `spec/flow-definition.md` section 7 and compared it to the directory;
re-sourced to `[...validNames]` — **the source expression and nothing else** — both set differences
are empty by construction, the non-empty guard is satisfied, and the author's own `e2` probe (a
corpus flow renamed out of the glob) **passes again underneath it**. Measured at exit 0.

**And the comment above the guard named that exact failure and then guarded it with a bound the disk
listing satisfies** — *"a MIS-parse that returned the disk listing would make both pass"*, followed
by `ok(documentedValid.length > 0)`. Its stated reason for stopping there was *"anchoring on a count
the table states nowhere would be circular"*, which is right about a **count** and does not apply to
a **discriminating value**. Section 7's rows carry a second cell saying what each flow *shows*; a
filename listing has none. **The author reasoned from the mechanism to a conclusion about what could
not be bound, and one of P9's four named failure modes is exactly that.** All four of W32's own
provenance probes were in `regions.ts`; not one touched the check it had just written.

### The other blocking findings, and what each cost

| | finding | what it was |
|---|---|---|
| **C-F1** | **A valid `map` definition was silently mis-run and the run reported `completed`.** `enter()`'s switch had four arms, no `map` arm and **no `default`**; `node.kind` is a union TypeScript does not require a switch to exhaust, so `npm run typecheck` was green. **W32 is what made such a definition valid.** Reproduced independently before acting on it | the sharpest thing either reader found, and `ADR 0015`'s own false statement reached through the driver's declared surface. Closed by a `default` arm — third late exception |
| **C-F2** | **Section 4's `reaches(X)` row omits a map's arc**, and it enumerates arc shapes exhaustively. A validator written from that row alone reports **three `FD-V11` findings against a valid example** — section 4's own twice-earned warning, reached from the other direction. `succ` had the third arc from the day the kind shipped; the table did not | the normative table no longer computing |
| **C-F3** | **`FD-V23` refuses a `map` missing `over` or `branch` and its text did not say so**, so *"four rules widened"* was wrong by one — it is **five**. A refusal fired, and a test pinned it, with no rule text licensing either | `spec/README.md` rule 4's inverse |
| **C-F4** | **`spec/task-id.md` section 3's `ID-R1` soundness argument was falsified by v0.8, in the document v0.8 bumped.** It is a closed argument from three VALIDATOR rules, and inside a map region `FD-V19` has no instance — uniqueness comes from **the run supplying distinct indices**, which no rule stated | the same correction W32 made to section 1's heading, one section further down and not made |
| **C-F5** | **`spec/join-policy.md` section 1 states something false about a map region**, and `toRegion` hands a policy exactly that value today | W22's reader's finding one plan later. Corrected under a fourth late exception: *a deferred field is a scope call and a false normative sentence is not* |
| **C-F6** | **`AGENTS.md` §3 carried three false claims** — *"Four node kinds"*, no `map` row, and *"22 refusals over `FD-V1` … `FD-V24`"* **contradicting `spec/README.md`'s 23 in the same change**. The exception row said *"the minimum that is not a lie"*; the file contained three | not documenting a feature and leaving a count that says it does not exist are different things |
| **A-S2** | **The corpus equality binds NAMES and nothing bound CONTENT.** Both map flows could be rewritten with **no `map` node in them at all**, stay valid, and leave every check green — and `map.test.ts` hand-copies them, so corpus and tests could drift in exactly that direction | `check-spec`'s `C4` never opens a file; the new equality did not either |
| **A-S4** | **The INVALID corpus walk still had only a floor of one — in the file W32 rewrote to remove exactly that shape.** `invalidNames.slice(1)` dropped **21 of 23** cases and the suite reported `all passed`. `C4` bounds the DISK and nothing bounded the WALK | [Q102](../open-questions.md)'s `RUN_FLOOR` shape, on the sibling directory |
| **A-S3 / A-S5** | the two overlap subjects above — a guard with a five-line justification and no test, and a *"this rule is deliberately absent for a map"* claim with no test, where the analogous `FD-V14` claim has a dedicated one | |

**Every one is acted on.** `C-F7` (`branchIndexOf` returning a `null` that already meant *"no
enclosing region"*, so the obvious composition minted `r1:score:-:0` for every dispatch) is closed by
making it **refuse**, which is ADR 0036 rule 5 unqualified by which derivation. `C-F8`, `C-F9`,
`C-F10`, `C-F11` and `C-F12` are corrections in place with the correction left visible. `A-S6` and
`A-S7` gained tests. **`A-S8`/`A-S9` are RECORDED rather than closed** — two defensive narrowings the
corpus cannot falsify, which is rule 8's *"where the corpus cannot express one, record that"*.
**`A-S10` went into [Q158](../open-questions.md)'s row and sharpened it**: a **suite body** can
`return` before registering a case, so counting `*.test.ts` **files** — the obvious fix — would not
catch it.

### Rule 8's re-run, and it found something the author's set had just created

**42 provocations, 39 caught, 0 survived, 0 aborted, 3 read by hand** — up from 32/29, with **eleven
of the readers' own edits checked back in**, each reproduced verbatim where the fix had not changed
its anchor. All eleven fire.

**And the re-run earned its place, which is what `doc/workflow.md` v0.8 added it for.** Probe `e4`
makes `branchPathOf`'s `ID-R6` arm unreachable and declared six cases. After the fix for **C-F7**,
three of the six stopped firing: with the arm unreachable the walk falls through to
`branchIndexOf`, which **now refuses too** — same class, same `ID-R6` citation, same map name — so
the assertions passed **by the wrong route**. **That is [W29](w29-the-two-self-tests-that-grade-nothing.md)'s
`D5` masking shape, produced inside this item by acting on a review finding**, and it is rule 8's own
founding observation (*the fixes that follow a review are the least-tested code the item ships*)
firing on the item that quoted it.

**The two guards were distinguishable and only the assertions were not** — and finding a phrase that
actually discriminates took **three attempts and a hand-run**: `ID-R6`, `split` and even
`item index` all appear in **both** messages, because `branchIndexOf`'s refusal helpfully says *"use
`branchPathOf` with an item index"*. The discriminator is `is not a non-negative integer`, which only
one arm emits. **A helpful error message is a worse discriminator than a terse one**, and that is the
half worth carrying.

**Two hand measurements the one-mutation-per-entry harness structurally cannot express**, run
separately and recorded rather than argued: the masking above, and **both map corpus flows emptied of
their `map` at once**, which the kinds bound catches (5 failing cases) and which no single-file probe
can reach.

**`a7` ABORTED on the first re-run and that was rule 7 (b) firing correctly** — its anchor was the
line the `C-F7` fix replaced, which is *"a mutation pinned to a literal is unmutatable the moment the
literal is right to change"* on a fix rather than on a magic number. Repointed.


**Questions raised.**

- **[Q156](../open-questions.md)** — may a `map`'s branch itself open a region (a map inside a map)?
  **Left expressible and undecided**, where P10's *"not taken"* left it. `branchPathOf`'s index is
  keyed **per region** rather than being a single number precisely so that neither answer costs a
  signature change.
- **[Q157](../open-questions.md)** — **no P10 item owns `AGENTS.md`**, so the plan as declared ships
  a node kind the consumer reference never describes. P8's *"paths in nobody's `Owns`"* on a product
  plan rather than a gate one. W35 is the natural owner.
- **[Q158](../open-questions.md)** — **a whole test file leaving the glob is noticed by nothing.**
  26 cases removed, three checks at exit 0, no line printed. [Q102](../open-questions.md)'s
  `RUN_FLOOR` shape one layer out, and the shape of the fix is known because this item built it for
  the corpus.
- **[Q159](../open-questions.md)** — **a join policy cannot tell a `map` region from a `fanout`
  one.** `opensWith` is on the internal `RegionSets` and deliberately not on what `toRegion` hands a
  policy, because `spec/join-policy.md` is W33's document. Owner **W33**.

**All four of Q156-Q159 used. ADR 0036 TAKEN**, which is P10 prediction 4's first half.
