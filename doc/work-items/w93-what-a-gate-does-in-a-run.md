# W93 — what a GATE does in a run

**Status:** **DONE** 2026-09-25 — see the Record. Declared on `fb2a981` (W92's commit) before any `src/` edit; its
declaration-step findings are the section below, written before the build
**Plan:** [P24](../plans/p24-what-a-node-may-remember-across-a-runs-branches.md) — *what may a node
remember across a run's branches?* — and this is its SECOND item: the run, not the definition.

```
Spec:       spec/run-state.md — a recorded GATE decision as a fold input and its cell of run state;
            RN-R13's gate-memory term; section 9's replay rebuilding a gate's memory.
            spec/flow-definition.md — the gate subsection's run-time half (P24 decisions 5-8), the
            run-time refusal of an undeclared route as an FD-R rule, and the "RUN by nothing yet"
            sentences W92 wrote with an expiry date. spec/README.md's rows.
Owns:       src/driver/**, src/fold/**, src/scheduler/**, spec/**, test/**, doc/decisions/0067-*
            (P24's row for W93, never this item's title)
Inputs:     P24 decisions 5-8 and stop-and-asks (a)-(b), ANSWERED 2026-09-25; P24 facts 1 and 4,
            RE-RUN at this item's declaration step, never transcribed (P15 decision 5); W92's Record
            and what it handed over (the driver's road for gate types; routing.ts' eligibleEdges;
            wiring.ts' entry walk and FD-R4); ADR 0066 rules 2 and 7 (what this item replaces);
            ADR 0014 (the driver produces the sequence), 0022 (one driver, one run), 0046
            (retention), 0058 (the runtime's done), 0064 (checkpoint), 0065 (resume); Q379, Q381,
            Q382, Q9, Q249.
Outputs:    (1) enter()'s real `gate` arm: synchronous, no dispatch, no task id — settings.key
                resolved by readKeyPath over the value that reached the gate, the type's fn called
                with { key, input, settings, memory }, and the ONE edge wired for the returned
                route taken (an edge with no `route` = the type's default), handing on exactly
                what reached the gate
            (2) the constructor refusal of ADR 0066 rule 7 LIFTED; test/driver/needs.test.ts'
                refusal assertion on gated-map failing first and then turned into a census row
            (3) memory: ONE per gate per RUN, the driver's, never written down — not per region
                instance, not per map item
            (4) a recorded GATE decision: a `gated` FoldInput naming the gate, the branch path,
                the route and the key, and RunState recording it
            (5) a route fn returns that its type did not declare STOPS the run by name (OR-R10),
                the counterpart of FD-R1; what fn THROWING does, decided with a measurement
            (6) resume: the replay rebuilds each gate's memory, the prefix check compares the
                `gated` elements, no new checkpoint field, and a checkpoint taken before this item
                resumes unchanged
            (7) RN-R13 gains the gate memory as a term
            (8) the road for a consumer's gate types into a driver — DriverOptions.gateTypes — and
                the runtime's road for it, W76's binding moved deliberately
            (9) FD-R4 at start() holds the payload to the target an ENTRY gate actually chooses,
                not to every route's target
            (10) ADR 0067, or a record that ADR 0066 absorbs this item
Depends on: W92
Blocks:     W94
Tests:      L1/L2 test/driver/gate.test.ts — every Output against a value derived from the spec's
            rule text; each SELECTION below with its well-formed wrong selections made to DIFFER;
            the fold's `gated` arm; resume at every cut of a gated run; a pre-W93 checkpoint
            resumed. L1 runtime road through createRuntime. L4 the corpus census row for
            gated-map, now RUN.
Gate:       L0 under all five typecheck lanes and `lint`, EACH RUN SEPARATELY and re-run after the
            last test file is written; L1-L5 in node, deno and chromium; `check:spec`;
            `check:docs`; `check:markdown`; L6 UNMOVED at 1853 / 100 (examples/l6.ts'
            NOT_YET_AT_L6 exemption stays until W94); then the full `npm run gate` with a content
            digest identical at both ends.
Reserves:   Q386-Q390, ADR 0067
```

*Reserves derived by grep off the tree at this declaration: the highest question on disk is **Q382**;
W92 reserved Q381-Q385 and left **Q383-Q385 unused and not reused**, so this item starts at **Q386**,
inside P24's Q379-Q393. The highest ADR on disk is **0066**; **ADR 0067** is free and P24 reserved it
for this item.*

## Scope

**In**

1. **The gate arm, the memory, the recorded decision** — Outputs (1), (3), (4).
2. **The lift** — Outputs (2): the constructor refusal goes, and the one assertion written to fail
   when it goes fails first.
3. **The run-time refusals** — Outputs (5).
4. **Resume and retention** — Outputs (6), (7).
5. **The roads in** — Outputs (8), (9): `DriverOptions`, the runtime, and `FD-R4`'s entry walk.

**Out** — named rather than left implicit, with where it goes instead

- **The exit artifact, L6, `README.md`'s breaking-change list and the version** — **W94**.
  `examples/l6.ts`' `NOT_YET_AT_L6` exemption stays.
- **Memory per region instance** — P24 stop-and-ask (a), answered: out.
- **A second built-in gate type** — P24 Scope/Out.
- **Memory across runs** — P24 Scope/Out.

## What the declaration step must re-take before anything is edited

*P15 decision 5: every fact is re-run by the item that acts on it, and written here before `src/` is
edited.*

| # | re-take | against |
|---|---|---|
| 1 | P24 fact 4 on the SHIPPED code path — `runtime.resume` on this tree, and a gate arm prototyped in a byte copy — with naive (process-kept), cleared and owner-recording memory across a kill and resume, both runtimes | Outputs (3), (6); prediction 2 |
| 2 | P24 fact 1: `enter()`'s shape, where the gate arm and its route selection go | Outputs (1) |
| 3 | every `FoldInput`-kind dispatch site — fold, checkpoint, resume/replay, `isFed`, `freezeInput`, `AGENTS.md`'s executed snippets, `examples/l6.ts` — each classified for a new kind, with a STATED predicate | Outputs (4); the seeded exceptions |
| 4 | what W76's binding and `examples/l6.ts`' `DRIVER_FIELDS` do when `DriverOptions` and the driver gain members | Outputs (8); the seeded exceptions |
| 5 | Q142's margins on the tree this item starts from | `M3` 5, `M4` after W92's retune |

### What the re-takes found — 2026-09-25, before any `src/` edit

*Node 24.20.0 and deno 2.9.6, in `dev-dist/w93/`. Re-run, never transcribed. Row 1b's prototype lives in a
byte copy of `fb2a981` (`dev-dist/w93/copy`, `git archive`, zero links), patched by `proto-patch.py`; nothing in
it is shipped code.*

**Row 1a — P24 fact 4 REPRODUCES on the shipped `runtime.resume`, to the position**: `dev-dist/p24/facts.ts`
re-run unchanged on this tree, both runtimes exit 0 — naive memory kept in the same process **REFUSED `diverged`
at position 16**; cleared memory and owner-recording memory each **identical to the run nobody killed**, 6
predicate calls during the resume.

**Row 1b — the same three placements on a REAL gate, at EVERY kill point, and one result the emulation could not
show.** A gate arm prototyped in the copy (`distinct`, key `seriesId`, `first`→`setup`, `duplicate` and `nokey` to
two `end`s), the P24 flow killed after its K-th `identify` settlement for K = 1…6 and resumed on a fresh runtime
(`r1b.ts`, logs `r1b-node.log` / `r1b-deno.log`, identical):

| memory held by | identical to the run nobody killed | refused | what K = 1 did |
|---|---|---|---|
| the DRIVER — one per gate, so a fresh driver starts empty and the replay rebuilds it | **6 / 6** | 0 | identical |
| the PROCESS, keyed by run and gate (*naive*) | **0 / 6** | 5, all `diverged` at **position 16** — the first `gated` element | **COMPLETED WRONG, IN SILENCE**: every file routed `duplicate`, `setup` ran for NO series, outcome `completed` |
| the process, cleared before the resume | 6 / 6 | 0 | identical |
| the process, recording the OWNING branch | 6 / 6 | 0 | identical |

**The K = 1 row is the finding.** The store held 16 elements and the first `gated` element is the 17th, so it lies
PAST the stored events, where `RN-R20` compares nothing — that rule's own stated limit, *a divergence past the
stored events is not seen*, reached by a gate. A memory that survives in the process makes the resumed run take
a DIFFERENT road with nothing refused. **So *driver-owned* is not a convenience and not only P24 decision 6's
argument — it is the one placement that cannot resume wrong where the prefix check is blind**, because a driver is
constructed for one run (`ID-R3`) and starts EMPTY. Two consequences decided here: the memory is a private field
created with the driver and never handed out or taken in (no option, no checkpoint field — prediction 2); and the
resumed-memory SELECTION in Verification is fixtured at a kill point where the rebuilt memory, a fresh one and the
killed process's all DIFFER — after at least one decision and before the last.

**Row 2 — P24 fact 1 REPRODUCES**: `enter()` is synchronous, composes once at the top (`compose(node, payload,
itemIndices)` — identity for a gate, which declares no `needs`), and switches on the kind with seven arms: five
kinds, W92's unreachable `gate` placeholder, and the `never` in `default`. **The arm goes where the placeholder is**
and recurses with `this.enter(target, …)` in the same turn, carrying `fromBranch`, `fromRegion` and `itemIndices`
through unchanged, so an `end` or a `join` after a gate sees the branch that reached the gate. **Route selection is
ROUTING's, and pure**: `src/driver/routing.ts` gains `gateEdge(node, defaultRoute, route)` beside `selectEdge`.
`eligibleEdges` still answers `[]` for a gate and is UNREACHABLE for one, not a silent path end: it is called only
from `advance`, which runs for a settled TASK id, and a gate has none — stated in place.

**Row 3 — the `FoldInput`-kind census, predicate STATED**: `kind ===|!== '<one of the eight kinds other than
outcome>'`, `case '<kind>'`, and `FoldInput['kind']`. **`src/`: 16 matches in 2 files**; outside it: `test/` 71 in
12, `examples/` 25 in 2, `AGENTS.md` 2, `README.md` 2, `scripts/` 0. For a new, TENTH kind:

| verdict | sites |
|---|---|
| **falls through WRONG, LOUD** — must learn | `step()` in `src/fold/run-state.ts`: every kind it does not name reaches `input.record` — **measured: `TypeError: Cannot read properties of undefined (reading 'taskId')`** |
| **falls through WRONG, SILENT** — must learn | `freezeInput`'s `{ ...i }` fall-through is sound only while every remaining kind is FLAT, and a `gated` element's `key` is whatever `readKeyPath` finds — an object where the path ends on one — so a consumer would be handed the driver's own key object (W89's `resumed` finding, one kind later) |
| **loud at L0, by design** | `test/driver/checkpoint.test.ts`' `RUN_FOR: Record<FoldInput['kind'], …>` — `RN-R17`'s one-run-per-kind binding, which `typecheck:tests` refuses until the kind has a run |
| **falls through CORRECTLY** | `isFed` (a `gated` element is REGENERATED, never fed — so the replay recomputes it and `RN-R20` compares it: that is how a resume checks the gate's answers); the `stopped` finds; `append`'s record push; `sameData` (plain data); every site in `examples/`, `AGENTS.md`, `README.md` and the other eleven test files, which FILTER on a named kind — including `examples/l6.ts`' `isStimulus`, which is `outcome` or `resolution` |

**Row 4 — both bindings FIRE, and a third file must move that nobody seeded.** W76's (`test/scheduler/runtime.test.ts`):
`DriverOptions.gateTypes` makes the pin `19` red, and the orphan clause red unless a road carries it — **road (b),
`RuntimeRegistry`**, because gate types are CODE registered once per runtime exactly as `languages` are; the runtime
reads them from `RegistryCode.gateTypes` (a DEFINITION type — declared exception) and holds them with
`checkGateTypes` at `createRuntime`, so a malformed type fails where the runtime is built and not on a first
`start`. The driver gains TWO fields — `gateTypes` (the registry's, normalised once, as `languages` is) and
`gateMemory` (run state) — so `examples/l6.ts`' `DRIVER_FIELDS` moves by two and its *skipped* literal by one, and
**`examples/run-flow.ts`' `NOT_RUN_STATE` must SKIP `gateTypes`, which is NOT seeded**: the byte walk spreads every
walked `Map` into an array for `v8.serialize`, and `distinct.fn` is a function. *(This row PREDICTED an L6 crash on
every row. **Measured at the build it is not one**: `retainedBytes` catches the serializer's refusal and returns
`-1`, and L6 fails BY NAME — 2 cross-row failures, the reporter's relation clause and the skipped-list clause — with
the other 1851 assertions green. The prediction was wrong in its mechanism and right that the file must move.)* `test/driver/retention.test.ts`' own `DRIVER_FIELDS` (L2) moves too, inside `Owns`.

**Row 5 — Q142**: probe 1 (`doc/decisions` removed) **119 files, `M3` margin 4** — this item's own file took one
from W92's 5; probe 2 **5292 links, `M4` margin 933** (`q142-declaration.log`). ADR 0067 lands in `doc/decisions`,
which both probes cut, so **`M3` is predicted UNMOVED at 4** and `M4` safe.

**Two more measured before deciding** (`r6-throw.ts`, `r6.log`):
- **The precedent for a type's `fn` THROWING**: a decision PREDICATE that throws, reached from the listener, stops
  the run through `OR-R10` with **its own error unwrapped** — `stoppedBy "Boom: the predicate threw"`, one
  `onRunFailure` of kind `Boom`, the last element `stopped`. A gate is a decision with memory (P24 decision 1), so
  its `fn` takes the same road: the thrown error stops the run AS IT IS, and nothing is appended for the gate.
- **`FD-R4`'s walk for an ENTRY gate lists EVERY route's task target** — `boundaryTargets` over `{ id: 7 }` gives
  `work` AND `nokeyTask` — so a payload `distinct` sends to `first` is still held to the `nokey` target's
  `inputSchema`, and one routed to a drop could be refused by a task it never reaches. Narrowed here (Outputs (9)).

**The design the re-takes leave, decided here and argued in ADR 0067:**

| | |
|---|---|
| the arm | `key = readKeyPath(received, settings.key)` where the gate declares `key`, else `undefined`; `fn` handed `{ key, input, settings, memory }` where `input` and `settings` are COPIES (a predicate is handed a copy — `advance`'s `cloneRecord`) and `key` is read off that copy; the returned route checked against the type's `routes`; a `gated` element appended; then `enter` the one edge `gateEdge` names with `received` itself — **what reached the gate, unchanged** |
| the memory | `gateMemory: Map<gateId, Map<string, unknown>>`, created EMPTY with the driver, a gate's entry made on its first evaluation — per gate per RUN, whatever region instance or map item reaches it; never an option, never in a checkpoint |
| the recorded decision | `{ kind: 'gated', gateId, branchPath, route, key }` — `branchPath` the gate's own (`pathOf`, as a task's); `key` a CLONE of what was resolved (`undefined` where nothing was, which a store may drop and `sameData` reads as absent). **REGENERATED, not fed**, so the replay re-evaluates every gate and the prefix check compares each answer. `RunState.gated` is the ordered list, the fold's copy — `pathEnds`' precedent |
| the refusals | a route `fn` returns that the type does not declare → **`FD-R5`, `UndeclaredRoute`**, a new class, stopping the run through `OR-R10` with nothing appended for the gate (P24 decision 8); `fn` THROWING → its own error, the predicate's road (measured above) |
| the roads in | `DriverOptions.gateTypes` (the TWENTIETH member) held by `checkRegistry` and handed to `validateDefinition`; `RuntimeRegistry` carries it; `RegistryCode.gateTypes` is where a runtime consumer supplies it |
| `FD-R4` | an entry gate is EVALUATED against a THROWAWAY memory — empty, which is exactly what the run's memory is at `start()` — and only the chosen route's target is held to its schema; a `fn` that throws or returns an undeclared route there holds nothing past the gate, and the run then stops on it for real. `boundaryTargets` gains an optional chooser (`wiring.ts` — declared exception) so ONE walk serves both callers |
| retention | `RN-R13` gains a FOURTH term: each gate's memory, for the life of the run — for `distinct` one entry per distinct key seen, the key's JSON; and the `gated` elements' keys sit in `inputs`, the first term |

## Exceptions — files outside `Owns`

*Seeded from P24's table and re-measured at the declaration step.*

| file | why | predicted? |
|---|---|---|
| `examples/l6.ts` | the driver's new private fields reach `DRIVER_FIELDS` — W55's universe binding, which fired on W59, W61, W88 and W89 — **re-taken: TWO fields (`gateMemory` walked, `gateTypes` skipped), and its kind-clause comment's *refuses a gate flow at construction until W93*, which this item makes false** | P24 seed, reason widened at the declaration step |
| `AGENTS.md` | a new `FoldInput` kind reaching the executed snippets that walk `kind` — **re-taken: every such snippet FILTERS on a named kind and falls through correctly; what moves is section 9's executed class list (`UndeclaredRoute`) and two sentences this item makes false — section 3's *NOTHING RUNS ONE YET* and section 9's *`new Driver` carries no gate types of yours yet*** | P24 seed, reason corrected at the declaration step |
| `examples/run-flow.ts` | `NOT_RUN_STATE` must SKIP the driver's `gateTypes`, or the byte walk hands `v8.serialize` a function (row 4 — predicted a crash; measured at the build as two NAMED L6 failures, the walk's own `catch` returning `-1`) | **declaration step**, not seeded |
| `src/definition/types.ts` | `RegistryCode.gateTypes`, the runtime road's input (row 4); and five sentences W92 wrote with this item's id as their expiry — `GateNode`'s *RUN by nothing yet*, `GateContext`'s *W93 calls it*, `Registry.gateTypes`' *`DriverOptions` does not carry it yet* | **declaration step** — the own-id grep |
| `src/definition/validate.ts` | two sentences with this item's id as their expiry — `readKeyPath`'s *unreachable through a run today* and `distinct`'s *W93 decides its life* | **declaration step** — the own-id grep |
| `src/definition/wiring.ts` | `boundaryTargets` gains the optional chooser `FD-R4` needs (Outputs (9)), and its entry-walk comment's *the driver's `FD-R4` targets are W93's to narrow* | **declaration step** — W92's hand-over |

## Verification

**Routing:** a gate IS routing. Of the states the template names: a branch routed away from its join
(Q4) — a gate's `duplicate` route to an `end` inside a map region is exactly that, asserted with the
join firing; `user_action` (Q17) — a gate after a task resolved by a person, asserted; no matching
decision edge (Q10) — a gate's route is total over the declared routes (`FD-V41`), and a route the type
did not declare is Outputs (5); a duplicate task id (Q13) — a gate mints none; a nested fan-out (Q6) — a
gate inside a map inside a MAP, the memory shared across both instances of the enclosing one, and a gate
inside a `fanout` branch whose drop exits it while the join fires on the other. *(This read *a map inside a
fanout*, a fixture that did not exist — W93's conformity reader, finding 2; the fanout fixture was added.)*

**What this item SELECTS, and the fixture where each wrong selection DIFFERS** (rule 8 obligation (a),
v0.23):

| selection | the right one | the well-formed wrong ones, each to be shown to DIFFER |
|---|---|---|
| which branch is FIRST | the first to ARRIVE at the gate | the lowest item index; the first dispatched — the L2 fixture settles item 2 first and asserts that arrangement beside the claim; no test names which item won, only that exactly one did per key |
| the memory's scope | one per gate per RUN | per region instance; per map item — duplicates put across two instances of an ENCLOSING region, never only in instance 0 |
| the edge taken | the edge wired for the returned route | the first edge; the default edge — the returned route's edge is neither first nor default |
| the value handed on | what reached the gate | the gate's settings; the key |
| the resumed memory | the one the replay rebuilds | a fresh empty one; the killed process's |

| rung | what it covers here | result |
|---|---|---|
| L0 `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — each separately | the arm, the fold, the options | see Record |
| L1-L5 node / deno / chromium | `gate.test.ts`, the census row, the runtime road | see Record |
| `check:spec` | the new rules | see Record |
| `check:docs`, `check:markdown` | `AGENTS.md`; ADR 0067 | see Record |
| L6 node and deno | UNMOVED | see Record |
| `npm run gate` | everything, digest at both ends | see Record |

## Record

**DONE 2026-09-25.** A `gate` RUNS — [ADR 0067](../decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md), which supersedes ADR 0066 rule 7 and nothing else of it.
The driver evaluates a gate synchronously where a branch ENTERS it, asks its type's `fn` with copies of the value and the
settings, a key resolved ONCE off that copy, and the gate's memory — ONE per gate per RUN, a driver field created empty —
records the decision as a **`gated`** fold input BEFORE entering the one edge wired for the returned route, and hands on
exactly the value that reached it. `spec/flow-definition.md` is **v0.24** (the gate's run-time half and **`FD-R5`**,
`UndeclaredRoute`), `spec/run-state.md` **v0.11** (section 10, **`RN-R26`**, and `RN-R13`'s FOURTH term); `check:spec`
**7 / 65 / 125**. **No `FD-V` moved and no checkpoint field was added.**

### Outputs, each with what fails without it (measured by rule 8, below)

| # | output | shipped as | what fails without it |
|---|---|---|---|
| 1 | the `enter()` arm | `case 'gate'` → `decideGate`, `gateEdge` in `routing.ts`, the value handed on unchanged | `a1`-`a4`, `a19`, `a20`, `a26`, `c3`, `d2`, `d5` — the edge taken is neither the first nor the default, and what leaves is what reached |
| 2 | the lift | ADR 0066 rule 7's constructor refusal removed; `test/driver/needs.test.ts`' refusal assertion FAILED on this item's first run (`gated-map: … until W93 runs one: undefined`) and is now a census row, with W92's `gate.test.ts` case 13 turned the same way | `a21` (19 FAIL lines), `b9` |
| 3 | memory per gate per RUN | `gateMemory`, `memoryOf` | `a5`-`a7`, `r1`, `r2` — per enclosing instance, per item, per TYPE, one for every gate, none at all |
| 4 | the recorded decision | `{ kind: 'gated', gateId, branchPath, route, key }`, `RunState.gated`, `freezeInput`'s copy | `a10`, `a12`, `a13`, `a23`-`a25`, `r10`, `r12`, `r21`, `gW` |
| 5 | the run-time refusals | `FD-R5` / `UndeclaredRoute` from all three roads; a THROW stopping with the type's own error | `a14`-`a16`, `r6` |
| 6 | resume | `gated` REGENERATED, never fed; a checkpoint produced by W92's code resumes | `a8`, `a9`, `a11`, `c4`, `d1`, `r11`, `d6` |
| 7 | `RN-R13`'s fourth term | the rule's text, and `test/driver/retention.test.ts`' holder walk | `c5` (the memory holds the KEY and not the value) |
| 8 | the road in | `DriverOptions.gateTypes` (the TWENTIETH member), `RuntimeRegistry`, `RegistryCode.gateTypes`, `checkGateTypes` at `createRuntime` | `b1`-`b5` |
| 9 | `FD-R4` through an entry gate | `boundaryTargets`' chooser, `boundaryEdges` against a THROWAWAY memory | `a17`, `a18`, `b10`, `c2`, `r5`, `d7` |
| 10 | ADR 0067 | seven rules, each chosen over a named alternative with the measurement that decided it | `check:spec` `C5`, six links (measured before it was written) |

### Verification — every rung RUN, never piped, its exit code read

| rung | result |
|---|---|
| L0 `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — EACH separately, re-run after the last test file | **exit 0, all six**. On the first run **`typecheck:tests` exited 2 on ONE error, `RN-R17`'s `RUN_FOR: Record<FoldInput['kind'], …>`** — the census's *loud at L0, by design*, and the only L0 error the item cost |
| L1-L5 node / deno / chromium | **53 files / 1423 assertions in all three**, from 52 / 1398 (parity 1423) |
| `check:spec` | **7 documents / 65 examples / 125 rules**, from 123 — `FD-R5` and `RN-R26`; *C4 covered 37 definition refusals*, unmoved |
| `check:docs` | **36 snippets: 30 run, 6 check**, unmoved |
| `check:markdown` | **158 documents, 7209 relative links, 394 anchored**, exit 0 — from 156 / 7159 / 390 at W92's close |
| self-tests | **8/8 ok** on the pre-reader tree (informational — a test file was edited while they read the tree) and **8/8 ok, 983.9 s wall, in the confirming gate** |
| L6 node and deno | **1853 assertions over 100 real runs, UNMOVED, in both** — `examples/l6.ts`' dated `gate` exemption stays for W94 |
| Q142 | measured at the declaration (`M3` margin **4**, `M4` **933**), before the record step (**4** / **915**) and after it (**4** / **895**) — **does NOT fire**; `M3` unmoved, as predicted, because ADR 0067 lands in `doc/decisions`, which both probes cut |
| `npm run gate` | **`GATE EXIT=0`, 1086 s, ZERO `FAIL` lines**, content digest `7b1d9f92932dd260` over 408 files IDENTICAL at both ends. The rows you are reading are the one edit made after it |

### Rule 8 — two passes, v0.24's grader controls on both

`dev-dist/w93/rule8.py`, after W92's: node 24 and deno 2 asserted; a CONTROL; every anchor exactly once against the current
bytes, undone on abort; restores byte-asserted; a content digest over tracked and untracked-unignored files at both ends; a
timeout on every rung; the reason matched on the clause's OWN failure line; **`gX` (the suite throws at load — right verdict
CRASH) and `gW` (the fold records nothing, graded against the FD-R5 case it does not break — right verdict WRONG-REASON),
graded on every pass**.

| pass | probes | result |
|---|---|---|
| author | 51 | control clean, both grader controls RIGHT, 45 caught, 2 declared ceilings RUN, 0 aborts, digest `d633240b2078adfc` identical — **1 against declaration, and it was the PROBE**: `e1` was caught by the right clause and graded WRONG-REASON because its `names` gave the census SUITE where the grader reads the CASE line. Re-declared and re-run: CAUGHT |
| 2 — with the readers' 14 exact edits and 2 new loop memberships | 67 | **control clean, `gX` CRASH and `gW` WRONG-REASON as declared, 62 caught, 2 declared ceilings RUN, 0 aborts, 0 against declaration**, digest `563f9c8cab8b6031` identical at both ends. Four author probes were RE-ANCHORED first (`a12`, `a13`, `a19`, `c5`), their text moved by the fix for conformity finding 1 — rule 7 (b) would have aborted them |

**The two ceilings, each run against the rung its reason names**: `k1` — the `gated` element's `branchPath` taken from the
arriving `fromBranch` rather than `pathOf(gate)`, EQUIVALENT by construction (every road into a gate carries the gate's own
path: a task's in its region, a join successor's `pathOf(opener)`, `-` at the entry); `k2` — the arm's `edge === null` guard
returning silently, UNREACHABLE (`FD-V41` wires every declared route and `FD-R5` refuses every other), run at L1 and `tsc`.

### What broke, and which rung caught it

| # | what | caught by |
|---|---|---|
| 1 | a memory kept by the PROCESS resumes WRONG, in silence, when the kill precedes the first decision | a RUN at the declaration step (row 1b) — **no rung; `RN-R20`'s own blind tail** ([Q386](../questions/q386.md)) |
| 2 | the fold THREW on an unknown kind (`TypeError` at `input.record`) | a RUN at the declaration step, before the arm existed |
| 3 | `RN-R17`'s every-kind `Record` refused the new kind | L0, `typecheck:tests`, exit 2 — as the census predicted |
| 4 | four L1 failures on the first run: W92's refusal case, `needs.test.ts`' refusal row, `DRIVER_FIELDS`, W76's pin | L1, BY NAME — every one predicted, the two refusal assertions being the lift's designed expiry |
| 5 | the suite census, my own fixture (an entry gate leaving a task `FD-V11`-unreachable), `needs.test.ts`' map-flow count | L1, by name |
| 6 | **the declaration step PREDICTED an L6 crash from walking `gateTypes`, and there is none** — `retainedBytes` catches the serializer's refusal and returns `-1`, so two cross-row clauses fail BY NAME | L6, measured before the fix, and the prediction corrected in row 4 |
| 7 | a regex written through a heredoc, mangled | the INSTRUMENT — rewritten with the Write tool, as the discipline says |
| 8 | **the type's key read off the COPY and the recorded key off the ORIGINAL** — a class instance at an entry gate routed `first` with no key recorded, and its honest checkpoint REFUSED `diverged` at 0 | the CONFORMITY reader, with a probe — **no rung**; BLOCKING |
| 9 | ONE gate in every fixture, so memory per type or shared by all passed; no fixture for a gate with no key or no settings, for a type writing into its key, or for a throwing entry gate at `FD-R4` | the ADEQUACY reader — **no rung**; four BLOCKING |
| 10 | a Verification sentence naming a fixture that did not exist (*a map inside a fanout*), a count this item left false in `AGENTS.md` (*nineteen*), a cost stated as one clone of four, a test name overstating its discrimination | the CONFORMITY reader |
| 11 | `e1` declared against the suite name rather than the case line | rule 8's GRADER, WRONG-REASON on a correct catch |
| 12 | a test file edited while the informational self-test run read the tree | the AUTHOR, noticed at once — `test/driver/` is read by none of the self-tests, and the confirming gate re-runs them |

### Readers — both in isolated byte copies with `node_modules` copied, zero links, the tree at `d633240b2078adfc` until both reported

**Conformity: 7 findings, 1 BLOCKING, and ZERO disagreements on the VALUES** — the NESTED fixture's four `gated` elements,
setups, exits and joins; the MAPPED reference and the memory the first post-resume decision is handed; the three `FD-R4`
payloads; the `gated-map` census's 7 / 4 / 3 — all derived on paper first, and a gate in a `fanout` branch driven and derived
too. What it found was one BEHAVIOUR (finding 1, above) and CLAIMS (findings 2-7). Owns audit: **zero undeclared.**
**Adequacy: 15 mutations, 13 survivors, 4 BLOCKING** — per-type and shared memory (R1/R2), the key read off the original
(R3), a gate keyed on nothing recording the whole value (R8/R9), an entry gate that throws holding every target at `FD-R4`
(R5) — plus the prefix check comparing a route alone (R11), the fold moving a path end (R12), the message losing what was
returned (R6), absent settings as `undefined` (R7), and two narrower (R4, R21). **Every finding is acted on**: the key is
resolved ONCE off the clone — the value as a replay regenerates it — and copied before the type runs; five cases were added
(two gates, a gate in a fanout branch, a gate with no key and no settings, a type writing into its key, a class instance at
an entry gate) and five extended; the readers' 14 exact edits are probes `r1`-`r12`, `r21`, `rc1`, and all 14 are CAUGHT.
**Overlap 1 — the FIFTY-EIGHTH measurement**: one shared SUBJECT, the key's resolution, reached from opposite ends — the
conformity reader by a class instance and the grammar, the adequacy reader by a type writing into an object key.

### Exceptions — marked at the build

| file | used? |
|---|---|
| `examples/l6.ts` | **used** — `DRIVER_FIELDS` and the skipped literal (two fields, not one), and the kind clause's *refuses … until W93* |
| `AGENTS.md` | **used** — section 3's *NOTHING RUNS ONE YET*, section 9's class list and its *no gate types of yours yet*, and section 10's *nineteen* (the conformity reader's finding 3) |
| `examples/run-flow.ts` | **used** — `NOT_RUN_STATE` skips `gateTypes`; declared at the declaration step |
| `src/definition/types.ts` | **used** — `RegistryCode.gateTypes` and five expiry-dated sentences |
| `src/definition/validate.ts` | **used** — comments only (confirmed by the conformity reader's diff) |
| `src/definition/wiring.ts` | **used** — `boundaryTargets`' chooser and its comment |

**Zero undeclared** (the conformity reader's audit). `doc/decisions/0066-*` and `doc/decisions/README.md` are record-step files.

### Predictions (P24)

1. W92's; CONFIRMED there.
2. **CONFIRMED** — the memory is rebuilt by the replay P23 built, `gated` is regenerated rather than fed, no checkpoint field
   is added, and a checkpoint produced by W92's own code resumes (asserted on it). *Its reversal condition — a memory the replay
   cannot regenerate — was met by one placement at the declaration step, a memory kept by the process, which is why the shipped
   one is a driver field.*
3. W94's reach; untouched.
4. **CONFIRMED** — `RN-R13`'s TEXT moved (a fourth term) and no other existing rule's did: `FD-R4`'s row is byte-unchanged
   (what moved is the walk), `RN-R19`'s *everything else it REGENERATES* already covers the kind, and the lists that moved are
   enumerations (`FoldInput`'s kinds, `DriverOptions`' members, the retention walk's fields).

### Questions

**Raised: [Q386](../questions/q386.md)** (a decision's memory kept outside the driver resumes wrong, in silence, past the
stored events — the shipped gate cannot, a predicate with closure memory can) and **[Q387](../questions/q387.md)** (an entry
gate's type is asked twice at `start()`). **Q388-Q390 unused and not reused.** Census **301 / 235 / 1 / 65**, by W92's parser,
which first reproduced HEAD's **299 / 233 / 1 / 65**; every id in exactly one cluster cell.
