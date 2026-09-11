# fyflow-orchestration

Flow orchestration over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler). Define a
flow once; run thousands of workloads through it.

> **Status: the layer is built and gated.** Sequence, decision routing, fan-out and join, with
> **three** join policies, a definition validator, and run state as a pure fold. **A `map` is a fifth node kind: one branch declared, N instances opened by the run at an arity no definition states.** **One driver serves one run, fixed at construction, and two drivers may share a scheduler — with anything else on it.** **A node may declare `needs` and reach an output the previous node did not produce — the run's own outputs, keyed by `(node id, branchPath)` — and an EDGE may declare one for its predicate.** **Both of the flows this made possible run on real workers**: *score each item against the run's config*, and *score, then fan out over the scores*. **And a reference may say *if it ran*** — a `?` suffix, `FD-V29` refusing the bare form where a run can reach you without the target having run ([ADR 0042](doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)). **And a reference across SIBLING regions means what the document says it means** — an output is visible when the two branch paths agree on the regions their two region CHAINS share, where the prefix rule they replaced handed a reader the one output whose index happened to match its own ([ADR 0044](doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)). **681 assertions in five
> runtimes** — Node 24, Deno, chromium, firefox, webkit — **plus 942 across 42 runs against a real
> scheduler** in Node and Deno — where the scheduler also carries five tasks this library did not mint, and both
> runs still complete. Not published; no version has been released.
>
> *(`npm run gate` runs the browser rung in **chromium only**; firefox and webkit are
> `npm run test:browser:all`.)*

## The idea

A task enters a flow and passes through workers. **Decision blocks** route it onward based on what a
worker returned. Routing can **fan out** into parallel branches and later **collect** them at a
join.

```
                       +--> [enrich] --+
  [ingest] --> <score?> |               +--> (join) --> [publish]
                       +--> [classify]-+
                        \
                         +--> [review]        (low confidence routes away entirely)
```

The scheduler runs tasks. This repository decides **which task runs next, and why**.

## The thing to know before reading the code

**`fyflow-scheduler` has no dependency graph.** No `dependsOn`, no `parents`, no topological order —
its own reference lists them under *"Things that do NOT exist"*. Tasks are independent and run as
soon as a worker slot and their resource limits allow.

So every ordering primitive above — sequence, decision, fan-out, join — **is built here**, not
wrapped from below. The scheduler contributes execution, pooling, resource limits and retry. It
contributes no control flow at all.

This matters because the planning document that seeded this repo
(`../fyflow-scheduler/FLOW_PLANNING.md`) assumes the opposite throughout. See
[doc/concept.md](doc/concept.md) section 2 for the evidence.

## The one structural idea

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

The same invariant the sibling
[fyflow-react-components](https://github.com/fyflow/fyflow-react-components) is built on, adopted
deliberately. It is what makes a flow testable with no scheduler, no workers and no timers — feed a
fixture log of task outcomes, assert where the run went — and what keeps durable runs an additive
change rather than a rewrite.

It became executable in
[ADR 0014](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md): the driver
produces one ordered input sequence, and `fold(driver.foldInputs())` is the whole of turning a run
into run state.

## What is here

| | |
|---|---|
| **Flow definition** | nodes bound to worker types, decision edges, fan-out and join — one template, many runs. **23 validation refusals** over the id range `FD-V1` … `FD-V25`, every one with a failing example — `FD-V14` **and `FD-V15`** are deliberately absent. **Nested fan-out is expressible since `FD-V15` was retired**, and a task inside a nested region is dispatched at its whole dotted `branchPath`. **`map` is a FIFTH node kind since v0.8** — it declares ONE branch and a RUN opens N instances of it, and since [W33](doc/work-items/w33-a-map-at-run-time-arity.md) a `Driver` executes one. *(This read **22** and `FD-V1 … FD-V24`, which W32 corrected in `AGENTS.md` and `spec/README.md` and did not correct here — the divergence P3's retro names, in the front-door document. Both numbers are derived: `check-spec` reports the count and the rules table the range.)* |
| **Driver** | the only component that touches the scheduler: subscribes, routes, dispatches. The library imports the scheduler **nowhere** — a caller passes its own in |
| **Run state** | a fold: where a run is, what each node returned, what a join is waiting on. **Six outcomes**, including `stuck` |
| **Join policies** | `live-token`, `arrival-count` and `live-token-requiring-arrival`, behind one interface, all three shipped. **Pass `live-token`** |
| **Examples** | [ladder L6](examples/) — **twenty-one** real runs on a real scheduler, in Node and Deno: a run in which **every branch is abandoned** under all three policies; two runs sharing one scheduler; and the same pair on a scheduler that also carries **tasks this library did not mint**, which used to stop every driver subscribed to it |

## The hard question, and its answer

**Q4 — what satisfies a join?** *"Wait for all the fan-out to return"* breaks the moment a decision
inside a branch routes it away from the join: the branch legitimately never arrives, an arrival
counter never completes, and the run hangs with no error — while the scheduler reports itself idle.

Live-token accounting answers that, and **the argument was refused as sufficient.**
[P1](doc/plans/p1-what-satisfies-a-join.md) built both policies behind one interface and let the case
decide, as a test.

**[ADR 0003](doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md): a join
is satisfied when its region has no live branches, having had at least one.** The result was larger
than the question — arrival-counting fails on **six of nine** matrix rows, not on the one exotic
case, and **an ordinary `optional` task failing is enough**. Fixed-`N` is wrong whenever *"how many
will arrive"* differs from *"how many opened"*, and every non-success outcome makes it differ.

**The follow-up question, and its answer.** That decision recorded one cost: on a flow where *every*
branch is routed away, `live-token` fires a join **no branch reached** and carries an **empty
collection** into whatever comes after it — `{}` since
[ADR 0037](doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md);
it carried `null` when ADR 0025 was written, and the cost that sentence records is unchanged either
way. Two one-line refinements of the two policies had been written into `spec/`
before either existed, precisely so nobody could quietly apply one and call it a repair.
**[ADR 0025](doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
answers both, differently.** The refinement that declines a join with zero arrivals is **built, as a
third policy under its own name** — `live-token-requiring-arrival`, which reports the join as
unfireable and folds the run to `stuck` instead of `completed`. The refinement that would make
arrival-counting survive P1's case is **refused**: measured over the whole matrix, it is `live-token`
weakened, and every row on which they differ is a row where it waits forever.
**`live-token` and `arrival-count` are unchanged**, so this adds a name and breaks nothing.

**A driver's scheduler may carry work this library did not mint.**
[ADR 0027](doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md): a
settlement whose task id does not parse was minted by **no** driver, so it is reported through
`onUnmintedTask` and dropped rather than stopping the run. Until it, one plain non-flow task settling
— a nightly cleanup, another library's work, a worker's own `spawnTask` child — stopped **every**
driver subscribed to that scheduler, on the very topology the line above recommends. The one
remaining condition is that drivers sharing a scheduler have **different run ids**, which nothing can
enforce and which the library's own error message now says.

## Running it

Node **24** (`.node-version`, selected with fnm) and a current Deno.

```bash
npm install
npm run gate
```

**`npm install` is all the setup there is.** [`fyflow-scheduler`](https://github.com/fyflow/fyflow-scheduler)
is pinned to **0.5.2** and installed from **npm**; Deno reaches the same version on JSR as
`@fyflow/scheduler`, which is why `examples/deno-import-map.json` exists. That is a development
dependency only: **the published library depends on the scheduler not at all** — `SchedulerLike` is a
two-method structural interface and a consumer passes its own scheduler in, at whichever version it
wants. [ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rule 1, and [ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
for how it is reached.

| | |
|---|---|
| `npm run gate` | everything below, **in ladder order** — `lint` and `typecheck`, then the seven checks cheapest-first, then L1-L5 and L6, and only then `selftests`. **393.1 s**, of which **365.0 is `selftests`** ([ADR 0039](doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md); it was 516.1 s and it ran 488.9 s of self-test ahead of `lint`). *A sum of per-entry medians; end-to-end runs have read 401, 414 and 463 s* |
| `npm run selftests` | **the seven `:selftest` entries, CONCURRENTLY**, derived from `package.json` rather than from any list — with the two that mutate state outside their own scratch space (`check-scheduler:selftest` deletes `node_modules/fyflow-scheduler`; `check-wiring:selftest` stages every check flat into `dev-dist/` and runs it) declaring themselves with a `SELFTEST-EXCLUSIVE:` marker in their own file and running alone. **`G4` in `check-wiring.mjs` asks it for its plan and compares it to the manifest both ways** — the entries, their COMMANDS, and the exclusive set — then runs it against a stub and requires every planned entry completed |
| `npm test` · `npm run test:deno` · `npm run test:browser:all` | **656** `test()` cases, five runtimes — `npm run gate` runs three of them, and `test:browser:all` is what adds firefox and webkit |
| `npm run test:l6` · `npm run test:l6:deno` | a real scheduler, **40 runs, 879 assertions** |
| `npm run check:markdown` | **every relative link and every anchor** across **91** documents, **3822** links, **197** anchored — `check-spec`s `C5` lifted here and still reported as `C5` |
| `npm run check:spec:selftest` | **the first negative test `check-spec` has ever had** — `check-spec.mjs` shipped with W1 and its probes were run by hand once. **22 probes and 23 gradings** *(this row read 18, then 20; the file prints its own count on every gate run — P11's retro)*: one probe and one grading per `fail()` site for `C1`-`C4`, `C6`-`C8` (**19** of them, `C2` having gained **two** at W41 for the `RULE_PREFIXES` binding), two for the report block, two for the exit path, plus one probe that trips **two `C7` clauses at once** so the failure-COUNT discriminator is reachable at all. `C5` is not here — W25 lifted it to `check-markdown` and it is probed and graded from there |
| `npm run check:source:selftest` | **the gate's own wiring, negative-tested** — **35** probes, **24** gradings of those probes, **10** of the probe list itself. W30 added ten: `S4` and `S7`, the two clauses no second mechanism guards, each reachable only through a copied published tree (`CHECK_SOURCE_SRC`) — and **one probe per entry of both pattern lists**, after its adequacy reader measured that three of five entries in each could leave for **0**. `S12` compares `gate`'s **15** entries to a declared list both ways and in order — and **seven of this file's probes went vacuous when ADR 0039 reordered that chain**, rule 7 (b) firing correctly, so all seven are now anchored AGNOSTICALLY (*the last entry whatever it is called*, *the first two whatever they are called*) rather than re-pinned to names; `S13` takes the three chains it composes. *(This row read **3** until W29 corrected it: W28 added four `SELF` entries and did not raise it. `doc/` is checked by nothing, and this is that class in the front-door document.)* |
| `npm run check:wiring:selftest` | **the gate's own wiring one layer in — the check that proves a `:selftest` entry actually runs a self-test**, [W38](doc/work-items/w38-the-dispatch-nothing-binds.md). **34 probes, 14 gradings, 6 `SELF` entries.** `G1` RUNS each of the seven `:selftest` scripts with the flag and an override pointing its self-test at a stub, and requires the stub's sentinel — a text test would be satisfied by the word `--self-test` in a comment. `G2` reads the DEFAULT that dispatch loads when nothing sets the override, **which is every run the gate makes and the one configuration `G1` cannot observe**. `G3` derives the manifest's two entries per check from the `scripts/` listing, both ways, because both of this check's own gate entries were otherwise repointable and deletable for **0**. **`G4` is [ADR 0039](doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)'s**: with the seven `:selftest` entries out of the `&&` chain, `S11`, `S12` and `G3` all stop seeing them, so `G4` asks `scripts/run-selftests.mjs` for its plan and compares it to the manifest both ways — names, COMMANDS and the exclusive set — and then runs it against a stub and requires every planned entry completed. **`G5` is the half `G4` structurally cannot reach**: all three of `G4`'s runs set an override, so the branch `npm run gate` takes is the one branch no `G4` clause observes — W39's adequacy reader made the runner report `7/7 completed, 7 ok` in **0.1 s** with four checks green, four different ways. `G5` reads the nine declarations that decide the runner's DEFAULT behaviour and compares each to the one form it may take, which is `G2`'s answer to `G2`'s question. Its self-test is **96.7 s**, of which `G4` bought **31**, which is [Q176](doc/open-questions.md)'s subject in one row |
| `npm run check:scheduler:selftest` | **20 `PROBES` entries and 22 gradings — one per `fail()` site (18), one per way the report can lie (3), and one for the exit path**. *(The file prints **32**, which is `PROBES` plus the `.d.ts` and install probe sets; 20 is a correct number for a narrower set than this sentence claimed — P11's retro.)* Of the 22: **20** are noticed by the probe the entry names, **1** only by the failure COUNT, which the id set cannot see, and **1** is a declared **masking** — a sibling clause reporting the same id *in its place*, so that one clause is deletable for 0 and the entry says so ([Q146](doc/open-questions.md)) |
| `npm run check:policies:selftest` | **13 probes, 6 gradings, and 14 bounds on those two lists** — the `SELF` list this file went three items without. Every entry is one edit to a list that sits ABOVE it, so nothing self-matches, and each makes the run go red **with the guard in place** rather than removing the guard. **Eight of the fourteen entries bound a mutation that cost 0 before W31** — `MIN_META` lowered, a duplicate entry, a global anchor, an ambiguous anchor, a grading passing as `corpus`, a second `wide` exemption, the `ran:` guard, the probe-pass verdict — and its readers added three more. **It is 2.2 s to 14.7 s for that**, which is the honest number and is recorded rather than a ratio ([Q133](doc/open-questions.md)) |
| `npm run check:docs:selftest` | **18 probes, 10 gradings** — one per check id, two for the report block, one for the exit path, and two more per direction of `X6`s comparison ([W46](doc/work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md)). **Capped deliberately and the cap is stated**: `check-docs.mjs` has **17** clauses, an entry here is two `check-docs` runs at ~7.1 s against `check-scheduler`'s ~0.5 s, and the **nine** left ungraded are named in that file's own header — one of them reachable by no probe at all ([Q148](doc/open-questions.md)) |

## Documentation

**Using the library: [AGENTS.md](AGENTS.md)** — the reference. Twelve sections, from a minimal
working program to what does not exist. **Every snippet in it is extracted, typechecked and executed
by `npm run gate`**, so a stale snippet is a failing gate rather than a lie. That covers **about 16%
of the document**; what the other 84% is allowed to be, and why, is
[P3's Record](doc/plans/p3-a-consumer-reference-the-gate-keeps-true.md).

**Working on the library: [doc/README.md](doc/README.md)** — current state, reading order, and what
happens next.

- [doc/concept.md](doc/concept.md) — what we are building and why
- [spec/](spec/README.md) — **the normative layer**: **six normative documents, 92 numbered rules, 44 hand-written examples**. *(89 until [W53](doc/work-items/w53-what-a-run-retains-that-nothing-reads.md) added `RN-R13`, what a run RETAINS, and [W54](doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) added `OR-R11`, a result is a VALUE not an OBJECT, and `OR-R12`.)* *(`check-spec` prints **7 documents** and `doc/README.md` says 7: it counts `spec/README.md`, which is the index and normative in its own eight rules. Two counts counting different things — [Q98](doc/open-questions.md)'s shape — and both are stated rather than reconciled.)* Since **v0.8** the definition has a **fifth node kind, `map`** — [ADR 0036](doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md) answering [Q12](doc/open-questions.md): fan-out is **two features over one region**, and since W33 a `Driver` RUNS one. **Since v0.11 a node may declare `needs`** — [ADR 0040](doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) answering [Q11](doc/open-questions.md) in general — and `spec/flow-definition.md` gains a THIRD id prefix, `FD-C`, for a rule about what a run **carries**. **v0.12 answers [Q8](doc/open-questions.md)** — [ADR 0041](doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md), and an **edge** may declare a `needs` for its own predicate. **v0.13 answers [Q187](doc/open-questions.md)** — [ADR 0042](doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md): a reference says whether it is **conditional**, and the bare form is a CLAIM that the target ran, refused by the new `FD-V29`. **It is not dominance, and that is a measurement** — of the 127 references the two corpora ADMIT, dominance refuses 30 and `FD-V29` refuses 8. *(`npm run check:spec` reports **7 documents** because it counts `spec/README.md` itself; the six are the normative ones. Re-derived from the check's own output at P10's declaration, where this line read 72 and 29.)*
- [doc/decisions/](doc/decisions/) — **twenty-two ADRs**, **five** carrying an in-place `## Correction` section — 0003, 0013, 0014, 0015 and 0023. *(Re-derived from the directory at P14's retro by counting the files, which is one expression. **It read twenty-two, and it read that at P13's retro too — where the directory held TWENTY**, so the number that claimed to have been re-derived was wrong by two at the moment it was written, and by one today. **`doc/README.md`'s own status row said 21 at the same moment, over a directory holding 19** — two indexes disagreeing about a number both claimed to have derived from the same directory, and neither agreeing with it. Before that it read **eighteen**, re-derived at P11's retro from *fifteen*, and ten at P10's declaration. **The first number has now been stale at FOUR consecutive re-derivations and the second at none**, which is what a count nobody derives in one expression looks like beside one nobody edits. v0.14's third direction on section 1 rule 5 is the clause it lands under.)*
- [doc/plans/](doc/plans/) — **P1-P15 all complete and retro'd, and [P16](doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md) DECLARED** — *what is a node type, and what does the library owe the scheduler to have one?*, three items W57-W59 and none started — `doc/workflow.md` at [v0.16](doc/workflow.md), the most recent complete plan being **[P15](doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md)** — [W53](doc/work-items/w53-what-a-run-retains-that-nothing-reads.md), [W54](doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) and [W55](doc/work-items/w55-a-run-at-scale-on-real-workers.md) — *what does a run retain, and what may a result be?*, which takes [Q19](doc/open-questions.md) and [Q22](doc/open-questions.md) as one question and is the first plan to make the measured run both rows have asked for since P1. *(This line read P1-P9 with P10 running, and before that P1-P4 while five more plans closed behind it — `doc/` is checked by nothing, and this is the front-door document.)*
- [doc/open-questions.md](doc/open-questions.md) — the register
- [doc/workflow.md](doc/workflow.md) — how work is planned, split and verified
- [doc/scheduler-upstream.md](doc/scheduler-upstream.md) — what we want from the scheduler

**How the work is done is itself documented and is unusual**: every change is a declared work item
with its own gate, and every one is read afterwards by two reviewers who did not write it — one
against the spec, one by mutation. **Eighty-one such passes have run and not one has come back empty.** *(This line read **twenty-one**
while thirty more ran, **fifty-one** while twelve more did, and **sixty-nine** while its own arithmetic summed to
seventy-three — *four in P13 so far* having been written mid-plan and never re-taken when that plan's
fifth and sixth passes ran. The predicate is one pass per reader per work item, counted from each item's
own Record — `doc/workflow.md` section 1 rule 5 — and the figure here is **summed from the per-plan
totals**: 31 through W19 as `CLAUDE.md` enumerates them, plus eight in P7, four in P8, eight in P9, eight in P10, four in P11, six in P12, six in P13 and six in P14,
each read from that plan's own retro. **Stated that way rather than as a fresh count of the item
files**, because a `grep` over their Record tables does not agree with itself across the two Record
formats those files use, and a number that cannot be derived in one expression should say where it
came from.)*

## Licence

MIT, as declared in `package.json` and `deno.json`. **There is no `LICENSE` file yet.**
