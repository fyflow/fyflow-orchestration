# W67 — A flow from documents, on real workers

**Status:** DONE — declared and closed 2026-09-16; both readers run, rule 8 re-run with their edits
**Plan:** [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)

```
Spec:       none — this item writes no rule; it runs P18's sample on a real
            FyflowScheduler in both L6 runtimes and migrates the L6 corpus
Owns:       examples/**
Inputs:     P18's exit-artifact paragraph and its sample (registry, flow, shim, worker
            module), read from the PLAN's own file; W65's grammar and W66's runtime;
            fact 4 (146 nodes, eleven pool keys, every role reading its payload
            whole); examples/l6.ts's ROW_KEYS, CROSS_ROW_SUBJECTS (controls included,
            v0.18) and DECLARED_TOTAL discipline
Outputs:    (1) examples/ rewritten: one worker module per worker under
                examples/workers/, no role switch; a registry document beside the
                flows; run-flow.ts reduced to observers over a runtime — no `pool()`
                call, no hand-built group, no Driver constructed by hand
            (2) the sample flow (`triage`) as L6 rows in both runtimes: a document
                type and a class type, a built-in group and a custom one, a node on
                its type's default instance and one on a named instance, every
                value what the worker RECEIVED from the run — with the pool a task
                ran on asserted off the scheduler (fact 7's readable fields) and the
                discriminating pairs asserted (default against named instance,
                document type against class type deriving the same options)
            (3) NARROWED at the declaration step, because W65 already did the
                half this row names: all 24 flows under examples/flows/ carry `type`,
                run-flow.ts has no `pool()` call, and the workers read `input` (the
                stop-and-ask's answer, taken in W65). What is LEFT is every existing
                L6 row's claims intact at a RE-TAKEN count once the harness runs from
                a DOCUMENT through a RUNTIME rather than from a TypeScript literal
                through `bootstrap` — measured, not assumed
            (4) what reverting W65, W66 and W67 EACH costs, in L6 failures, on the
                tree this item ships
            (5) examples/README.md and the counts it carries
Depends on: W66
Blocks:     nothing
Tests:      expected values from the sample's documents, from spec/ (FD-C5 for what
            a worker receives, JP-R12 for a join's record) and from the plan's
            decisions, never from output. The default-instance row and the
            named-instance row's pool keys SWAPPED must fail; the class type's
            derivation made to return the document type's options must fail the pair
            clause; a registry document with the runtime's own wiring removed
            (`flows`, `languages`) must fail the rows that transform
Gate:       L6 in both runtimes, redirected and read by exit code, at a re-taken
            count; three revert runs read by failure count; rule 8 over
            ROW_KEYS/CROSS_ROW_SUBJECTS/DECLARED_TOTAL with the controls as members;
            then spec-conformity pass (two readers), rule 8 re-run with their edits
Reserves:   Q289-Q292
```

## Scope

**In**

1. **The exit artifact**, on real workers, in both runtimes, from documents.
2. **The L6 corpus migration** — 22 flows, and the harness losing every hand-built object.
3. **The three revert costs**, taken last on the tree that ships.

**Out**

- **Any rule or refusal** — an exit artifact writes no rule (W43, W47, W51, W55, W59, W63).
- **A second sample flow** — the plan's one carries every shape the exit artifact names; if a
  reader's finding needs another, it is added here, not in a new item.

## Exceptions

*Seeded from the plan's table and from W63's late table.*

| path | why |
|---|---|
| `spec/outcome-record.md` §4, `spec/run-state.md` §7 | predicted from W58's, W59's, W61's and W63's tables: the corpus split moves if the sample flow's task nodes move the count (`test/fold/result-value.test.ts` derives it and compares) |
| `AGENTS.md` §13 | predicted from W63's table: *four worked typed flows run in `examples/`* becomes every flow, and the sentence that counts them moves |
| `scripts/check-markdown.mjs` | predicted NOT to fire: this item adds no document under `doc/`; checked against `M3`'s and `M4`'s fixtures before its record step |
| `scripts/build-browser-tests.mjs` | predicted NOT to fire: it walks `examples/flows/*.json` itself and picks up migrated documents; a registry document beside them is JSON too — checked |
| `spec/flow-definition.md` §3 | **LATE, one sentence.** The registry subsection said *the runtime entry (W66) folds this into `createRuntime`* of `bootstrap`'s both-ways group refusal — true when W66 wrote it, false the moment stop-and-ask 1 shipped, and a reader implementing a runtime from that paragraph would have built the over-refusal this item removed. **No rule moved and none was added**; `check:spec` is 7 / 55 / 106 with `C4` at 34, unchanged. Section 1 rule 5's third direction, found by the conformity reader |
| `src/scheduler/runtime.ts`, `test/scheduler/runtime.test.ts` | **declared at the declaration step, stop-and-ask 1**: a registry document cannot declare a group only NODES name, measured. `createRuntime` passes only pool-named groups to `bootstrap` and registers every declared group with the scheduler. No rule, no refusal — an over-refusal removed in one path |
| `package.json`, `deno.json` | **declared at the declaration step, stop-and-ask 2**: [Q279](../open-questions.md), `0.1.0` to `0.2.0` at this item's close, the breaking grammar change named |
| `AGENTS.md` (beyond §13), `README.md` | `README.md` carries the version and the breaking change, and is a record-step file already. **`AGENTS.md` beyond §13 is three EXECUTED snippets** in §11, §12 and §13, which named `examples/workers/flow-worker.ts` and its `role` config: one worker file became fourteen modules, so `check:docs`' `X4` is red until they are rewritten. *(The reason first written here was the version, which `AGENTS.md` does not carry — W67's conformity reader, finding 13. The path was declared either way; the reason was not.)* |

## Verification

| clause | command |
|---|---|
| L6 | `npm run test:l6`, `npm run test:l6:deno`, redirected, read by `$?`; **the baseline is 1502 assertions over 50 real runs**, re-taken at the declaration in BOTH runtimes. *(This row said `baseline W63's shipped numbers, 1501` — W63's, and stale: W65 moved it to 1502 and this file was written before that item ran. Section 1 rule 5's provenance clause, on the one number this item's gate is read against.)* |
| revert costs | three L6 runs with W65, W66 and W67 reverted in turn, each read by exit code and failure count |
| readers | conformity: the sample's documents and `FD-C5` first, every expected value re-derived on paper before a row is read; adequacy: isolated copy with `core.longpaths` set, the rows' literals, the pool observers and the pair clauses mutated |

*Routing cases: a branch routed away from its join (Q4) — **covered**, the sample's `classify`
edge; `user_action` (Q17), no matching decision edge (Q10), duplicate task id (Q13), nested
fan-out (Q6) — **covered by the migrated corpus**, whose rows keep their claims; nothing new is
added for them.*

## The declaration step

*`doc/workflow.md` section 1 rule 5: the facts this item is handed are RE-RUN rather than
transcribed. Taken 2026-09-16 on `3694000` with the tree clean, every rung redirected to
`dev-dist/w67/` and read by `$?`, the tree held still by a content digest.*

**Every pre-condition holds, and ONE of the numbers this item's own file carries did not.**

| | handed | re-taken | |
|---|---|---|---|
| digest | `74f6e5aad58ef85a` over 311 files | **identical**, at HEAD and in the working tree | ok |
| L6 | 1502 / 50 in node and deno | **1502 assertions, 0 failed, 50 real runs**, both, exit 0 | ok |
| L1-L5 | 41 / 1111 | **41 file(s), 1111 assertions** on node 24.20.0 | ok |
| `check:spec` | 7 / 55 / 106, 34 refusals | **7 documents, 55 examples, 106 rules**; `C4` covered **34** | ok |
| `check:docs` | 29 snippets, 23 run | **23 run** | ok |
| `check:markdown` | 124 / 5319 / 265 | **124 documents, 5319 relative links, 265 anchored** | ok |
| the seven checks | exit 0 | all seven **EXIT=0** | ok |
| **this file's own Verification row** | *baseline W63's shipped numbers, 1501 / 50* | **1502** since W65 | **STALE, corrected above** |

**W65 already did half of Outputs (3), and the item's row is narrowed rather than re-done.**
Measured: `grep workerType examples/flows/*.json` returns **nothing** over all 24 documents; the
twelve type names the flows carry are `PublishWorker` 25, `ScoreWorker` 22, `IngestWorker` 13,
`SplitWorker` 11, `Scorer` 7, `ReviewWorker` 5, `Echo` 5, `TallyWorker` 3, and `WeighWorker`,
`RetryWorker`, `MergeWorker`, `AttestWorker` 1 each; there is **no `pool()` construction call** left
in `examples/**`; and `flow-worker.ts` unwraps the envelope's `input` for every role but `typed` and
`echo`. So the migration's SHAPE question — the plan's open stop-and-ask — was answered in W65 by
the maintainer, and what is left here is the harness losing its hand-built objects.

### Four things the plan's own SAMPLE is wrong about, and the fourth is new

W66 recorded three (the sub-path is `/scheduler` and there is no `/runtime`; `createRuntime` takes
`(document, code, options)` and the sample calls it with two; and the sample passes no `flows`,
which a runtime needs because pools are built once and a transform's adapter reaches a pool through
its config). **The fourth was measured here and nobody had it:**

4. **The sample's `DailyBudgetGroup` does not LOAD under Node.** Its constructor is written
   `constructor(readonly id: string, private readonly tokensPerDay: number)` — a TypeScript
   **parameter property**, which Node 24 refuses at load in strip-only mode
   (`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`), measured. That is `RT-R9` exactly, the rule `S4` enforces
   for `src/` and which reaches no sample in a plan file. Written long-hand, the same class builds.

**And the shape the sample describes DOES build, once those four are fixed** — probed before a line
of the artifact was written (`dev-dist/w67/fact-sample.ts`): a class node type in `code.nodeTypes`,
a NAMED instance of it in the document's `pools`, a custom group type beside two built-ins, a
`residentGroups` map and a language. Three pools come out — `Prompt` (a document type's default),
`GpuModel` (a class type's default) and `prompt-big` (the named instance) — and P18 fact 7's fields
are all readable off the built pools, the class derivation showing `maxThreads` **4** against **1**
and `residentGroups` `{gpu:1}` against `{gpu:2}`. That is the discriminating pair this item's
`Tests:` line asks for, observable before it was declared.

### What the declaration step found that BLOCKS the migration

**A registry DOCUMENT cannot declare a group that only NODES name.** `createRuntime` hands every
group the document declares to `bootstrap`, whose direction-two refusal — *a group registered and
used by nothing is the silent kind* — is correct for the helper, where the consumer passes group
OBJECTS in, and wrong for a document, where `groups` is the SET `FD-V31` admits a node's
`workerGroups` from. Measured (`dev-dist/w67/fact-gate-group.ts`):

```
REFUSED: BootstrapError | group "gate" was given and no pool's derivation names it — …
         a group a NODE names in workerGroups is registered beside this helper`s return value,
         not through it
```

`gate` is exactly that group: W58's group row names it in a NODE's `workerGroups` and no pool
declares it, which is why `buildScheduler` registers it BESIDE `bootstrap`'s result today. A
consumer holding only a runtime has no "beside". **So either `src/scheduler/runtime.ts` stops
passing node-only groups to `bootstrap`, or this item keeps a hand-built group and Outputs (1) is
not met.** Put to the maintainer.

### A per-run knob has NO document spelling, and the one it has is inert

`Expectation.threaded` is a per-row knob; `inline` is fixed per TYPE by decision 2 and an instance
may not override it (confirmed in `src/definition/registry.ts` — the identity derivation copies
`decl.inline` and `mergeConfig` never reaches it). So a JSON document cannot carry a knob a ROW
sets, and today's `registryFor(delayMs, threaded)` writes `inline: t.inline ?? !threaded` into the
two types that declare none.

**Measured, because a claim about a knob with no assertion is worth a number:** forcing every such
type inline — `inline: t.inline ?? true`, one expression, the `threaded: true` rows then running on
the main loop — costs **ZERO**: `1502 assertions, 0 failed`, exit 0. That is
[Q99](../open-questions.md)'s *a knob held down by no assertion* with a figure, and it is why the
knob is KEPT rather than dropped: what it buys is that the fan-out pool is a real thread on the rows
that ask for one, which is where a dispatch race or an id collision would show, and W51 measured
that it changes dispatch order 12/12. Dropping it would change what L6 EXERCISES without changing
what any row CLAIMS, which is the worst of the three.

### The four stop-and-ask answers, 2026-09-16

*Each was put to the maintainer with a measurement rather than an opinion, at the declaration step
and before a line of the artifact was written.*

1. **The `gate` group: FIX `createRuntime`.** It passes only the groups some pool's derivation
   names to `bootstrap`, and registers every group the document declares with the scheduler. The
   document's `groups` is the SET `FD-V31` admits, which is what the grammar already says it is;
   `bootstrap`'s direction-two refusal stays exactly as it is for a consumer who passes group
   OBJECTS in. This removes an over-refusal in one path — **no spec rule and no new refusal**, so
   the item's *an exit artifact writes no rule* holds. Declared exception on
   `src/scheduler/runtime.ts` and `test/scheduler/runtime.test.ts` — the file the suite is
   actually in, which the Exceptions table names correctly (W67's conformity reader, finding 12).
2. **[Q279](../open-questions.md): BUMP to `0.2.0` HERE**, in this item's record step, with the
   breaking change named. The plan's own sentence, taken at the item it names. Declared exception on
   `package.json` and `deno.json`.
3. **The sample's workers are REAL, deterministic modules** — `callModel` is not a thing this
   repository has and could not be: L6 runs offline, deterministically, in two runtimes. So
   `examples/workers/prompt.ts` and `fetch.ts` compute their answer from the TYPE's config (the
   model) and the envelope's `settings` and `input`, and `model: "small"` and `model: "large"`
   return different answers — which is what lets a row tell a class type's derivation from a
   document type's by what the worker RETURNED, not by the pool observers alone.
4. **The `threaded` knob is KEPT**, as ONE exported document derivation in `run-flow.ts`. It is
   DATA, not a `pool()` call, a group or a `Driver`, so Outputs (1) holds. *(This read* **"every
   other row runs the document exactly as it is on disk and `l6.ts` asserts that"** *, and that is
   FALSE: the document leaves `inline` unsaid on the two threadable types precisely so the knob can
   set it, so the non-threaded variant writes `inline: true` into two types the file does not
   mention. What `l6.ts` asserts — correctly, and at BOTH settings — is the DIFF: `inline` on exactly
   those two types and no other key of any other section, and since the adequacy reader, the
   DIRECTION too. W67's conformity reader, finding 3.)*

## Record

**Done 2026-09-16.** P18's exit artifact: **a flow and the runtime it needs, from two JSON DOCUMENTS
and a shim, on a real `FyflowScheduler` in both L6 runtimes.** `examples/registry.json` says what
exists — fourteen worker modules, five resource groups, fifteen node types, one NAMED pool instance,
three predicate names and one language — `examples/flows/triage.flow.json` names registry keys and
nothing else, and `examples/run-flow.ts` is a SHIM: one `createRuntime` call, the four things P18
decision 7 keeps as code, and observers. **No `pool()` call, no group built by hand, no `Driver` built
by hand, and no role switch** — where there was one worker file with a twelve-arm `switch` on a
`role` its pool's config carried, there are now **fourteen modules, one per worker entry**.

### Gate

| clause | command | result |
|---|---|---|
| L0 lint | `npm run lint` | **EXIT 0** |
| L0 typecheck | `npm run typecheck` (all five) | **EXIT 0** |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all` | **41 file(s), 1112 assertions** in node 24.20.0, deno 2.9.6, chromium, firefox and webkit |
| L6 | `npm run test:l6`, `npm run test:l6:deno` | **1610 assertions over 53 real runs, 0 failed, EXIT 0** in BOTH, from 1502 / 50 |
| `check:spec` | | 7 documents, 55 examples, **106 rules**; `C4` covered **34** — unmoved, as an exit artifact's must be |
| `check:docs` | | 29 snippets, **23 run** |
| `check:markdown` | | 124 documents, 5329 relative links, 265 anchored |
| the seven checks | | all **EXIT 0** |
| gate | `npm run gate` | **EXIT 0, zero FAIL lines**, 29 chain entries, under node 24.20.0 — the FIRST run over the final tree reached the last entry, `selftests`, with zero FAIL lines and was cut by a machine restart before it reported; the second ran whole and is the verdict |
| digest | `dev-dist/w67/digest.mjs` | **`37a8669ded4dcdb8` over 328 files**, before and after the gate — and equal to the digest taken before the interrupted run, so the restart moved nothing |

Every rung RUN and never PIPED, redirected to `dev-dist/w67/` and read by `$?`.

### What reverting each item costs at L6, on the tree that ships

| | the revert | cost |
|---|---|---|
| **W65** | the envelope unwrap deleted in `workers/shared.ts`, so every worker reads the wrapper | **309** |
| **W66** | decision 14 undone — `runtime.registry` not spread into the driver `start` builds | **1** (the first row's run throws; the loop's own catch names it) |
| **W67** | its one library change, the group split in `createRuntime` | **1** (same shape: `gate` is refused and the first row throws) |

**And one that measures ZERO and says so**: W66's group-member check (ADR 0055) removed costs **0**,
because no factory this rung registers returns an object the scheduler cannot use. A refusal with no
live case, recorded rather than argued.

### Outputs

**(1) `examples/` rewritten.** `examples/registry.json` is the registry DOCUMENT; `examples/workers/`
holds **fourteen modules and `shared.ts`**, each a default-exported class, which is the scheduler's
own contract and what P18's sample writes; `run-flow.ts` imports the document, supplies the
predicates, one custom group TYPE (`DailyBudgetGroup`), one custom node-type CLASS (`GpuModel`) and
the `jsonata` adapter, and calls `createRuntime` once. **What went with the role switch**: `ROLES`,
the `Role` union, and the three lists `l6.ts` compared both ways since W47. The binding is stronger
now and is the document's: a worker entry names a URL, and the document's worker keys are compared to
the modules ON DISK both ways — a key with no module is red before a pool is built, a module no entry
names is red in the same clause.

**(2) The sample flow as two L6 rows**, in both runtimes, every value what the worker RECEIVED or what
the SCHEDULER reported: a DOCUMENT type (`Prompt`) and a CLASS type (`GpuModel`) over the SAME worker,
so the pools they built differ in their DERIVATION alone; a node on its type's DEFAULT instance
(`audit`) and one on a NAMED instance of that type (`review` on `prompt-big`), told apart by the pool
each ran on — read off `scheduler.tasks` — AND by what the worker returned, four words against two,
because the class derives the model from the instance's config; a BUILT-IN group and a CUSTOM one
acquired by real tasks, the custom one naming its object something other than its key; the TYPE's
`settings` default reaching a `Prompt` node and not a `GpuModel` one; and a declared `transform`
reducing `JP-R12`'s record for the node after the join, with no reshaping node. The HIGH row is the
control: one payload field different, `review` never dispatched, the reduced report six words instead
of eight.

**(3) NARROWED at the declaration step and then measured.** W65 had already migrated `examples/**` to
`type` (the maintainer's answer to that item's stop-and-ask), so what was left was every existing
row's claims intact once the harness runs from a DOCUMENT through a RUNTIME rather than from a
TypeScript literal through `bootstrap`. They are: no row's expectations moved except by this item's
own two additions — `extraKeys` on the sixteen typed and echoed results, and the `poolOfTask` map.

**(4)** above. **(5)** `examples/README.md` carries the counts and the new `registry.json` and
`workers/` cells.

### What broke

**The declaration step found FOUR things wrong with P18's own sample, and one blocker the plan did not
have.** W66 recorded three (the sub-path, the signature, the missing `flows`); the fourth is new and
was found by trying to LOAD it: the sample's `DailyBudgetGroup` uses a constructor **parameter
property**, which Node 24 refuses at load — `RT-R9`, the rule `S4` enforces over `src/` and which
reaches no plan document ([Q292](../open-questions.md)). **The blocker**: a registry document cannot
declare a group that only NODES name, because `createRuntime` hands every declared group to
`bootstrap`, whose direction-two refusal is right for the helper and wrong for a document. Measured,
put to the maintainer, fixed in `createRuntime` ([Q291](../open-questions.md)).

**Five things this item wrote down were false and the readers found each.** The conformity reader
(14 findings, 7 blocking) re-derived every expected value of both rows on paper and came back with
**zero disagreements** — what it found were CLAIMS: the L6 count shipped stale by two in the two
documents a reader opens first, after the fixes moved it; *thirteen node types* where the document
declares fifteen; a `heldGroups` comment arguing to exclude the two tasks the literal below it
declares; `spec/flow-definition.md` still saying the runtime FOLDS the helper's both-ways refusal in,
which this item made false; and the sharpest — **`run-flow.ts` said every non-threaded row runs the
document AS IT IS ON DISK, and it does not**: the document leaves `inline` unsaid on the two
threadable types precisely so the knob can set it, so the non-threaded variant writes `inline: true`
into two types the file does not mention. The ASSERTION was right — `l6.ts` expects the diff at both
settings — and the three sentences citing it were not.

**The adequacy reader (16 mutations, 9 survivors, 7 blocking) found every one in a direction the
author's 45 probes never took**, and two of them are this repository's own recorded classes arriving
again:

- **the custom group's *name differs from its key* rested on a string inside the factory** — making
  the two equal cost ZERO. W59's own finding (*every fixture in the tree had the two equal*)
  reproduced inside the fixture built to correct it, and v0.13's *whatever makes a discriminating pair
  differ is itself a claim*;
- **`poolOfTask`'s *read off the scheduler* was falsifiable at zero** by re-deriving it as
  `node.pool ?? node.type` — the expression its own note NAMES;
- **clause (iii)'s stated reason — *which a derived `PoolSpec` cannot say and only the built pool
  can* — was false of every field it read**, because the identity derivation COPIES `inline` and the
  class DECLARES it;
- **Outputs (1) had no observer anywhere**: a `new ConcurrentLimitGroup(99)` in the shim cost 0, since
  `S16`'s scope is the published set and `examples/**` is outside it;
- **the whole per-row `poolOfTask` layer left for three edits and an integer** — v0.14's *a count is
  not a membership*, in the file that records the clause;
- and **P18 decision 10's two defaults were reached by nothing**: the plan's own shim is
  `runtime.start(flow, payload)` with NO options, and that was the one call this rung never made.
  Both defaults could be replaced by a `throw` for zero, on the item that was the last chance to
  observe them.

All nine closed. The last is now a run: `p1-routed-away` at LOW with no options, where the two
candidate policies DISAGREE, so *the run completed* IS *the default is `live-token`* — observed
rather than named — and the minted id is read off the driver and matched against every task id the
run dispatched.

### What this taught

**A sample in a plan is code that is read as a specification and executed by nothing.** Three items
were built against P18's, and it was wrong in four ways; three were found by an item trying to BUILD
from it and one by trying to LOAD it. `check-docs` executes every snippet in `AGENTS.md` and nothing
executes a plan's — [Q292](../open-questions.md).

**A refusal that is right for one caller is wrong for another, and the argument for it reads the
same.** `bootstrap`'s *a group registered and used by nothing is the silent kind* is correct when a
consumer passes group OBJECTS in and wrong when a DOCUMENT declares the SET a node's `workerGroups`
may name. Nothing distinguished the two callers, and the message told a runtime consumer to do a
thing only a helper consumer can do — [Q291](../open-questions.md).

**And a crash is not a detection, in the two blocks added AFTER the guard that says so.** W59 closed
that shape for the row loop; this item's own rule 8 re-run found it twice in what W67 added — the
SHIM RUN sits outside the loop, so replacing a default with a `throw` took the file down with zero
failure lines; and block (2e)'s row lookup dereferenced `reports[-1]` when a row was repointed at
another document. Both now fail naming themselves. *The guard is per-block, and a new block starts
without it.*

**A harness that does not pin the runtime it measures reports the environment as the product.** Four
probes of the re-run came back CRASH on a correct tree and a correct edit, because the shell had no
`fnm use 24` and `npm run test:l6` resolved `node` to 16. The harness refuses to start below Node 24
now, and it is v0.11's *a probe that changes nothing comes back clean* one step out: the control
cannot see an environment every probe shares.

### Rule 8

**Author pass: 45 probes, 30 caught, TEN undeclared survivors, 1 crash, 0 aborts, 4 measured**, the
tree held still by a content digest, identical at start and end. Every survivor acted on; three
became declared ceilings with their reasons and a named second route, and seven closed in the
product — the resident-group COST in `derivedPools`, `inline` in the class-vs-document clause,
`extraKeys` as a second expression over the envelope's key set (W43's answer on `weigh`, one worker
over), a constructed `FD-V33` fixture for a guard with no live case, and the `inline` VALUE in the
document-diff clause, which turned the `threaded` pair from a ceiling into a catch.

**Final pass, with the readers' sixteen exact edits checked in: 64 probes, 51 caught, 7 declared
ceilings each RUN against the rung its reason names, 0 undeclared survivors, 0 crashes, 0 aborts,
0 against declaration, 6 measured.** Two aborts on the way there were rule 7 (b) firing correctly on
anchors this item's own edits had moved — re-anchored agnostically — and **one probe came back CAUGHT
AGAINST ITS DECLARATION**, which is the result to keep: it was declared a ceiling on the reasoning
that a deleted map entry is caught by the COUNT and not by a CLAIM, and the per-row membership the
adequacy reader forced now names what left. *The declaration was written before the membership existed
and was not re-taken.*

### Questions raised

[Q289](../open-questions.md) — `runtime.start` starts the run INSIDE the call, so a harness observing
per fold input has a window before it holds the driver. [Q290](../open-questions.md) — a per-run knob
has no document spelling, and the one this rung has is inert at L6 ([Q99](../open-questions.md) with a
figure). [Q291](../open-questions.md) — `bootstrap`'s `groups` argument now means two different things
depending on the caller. [Q292](../open-questions.md) — a plan's sample is executed by nothing.
**[Q279](../open-questions.md) is RESOLVED**: both manifests read `0.2.0` and `README.md` names the
breaking change. **Census 230 / 176 / 2 / 52**, 0 aborts on a parser written from scratch — and it was
wrong once before it was right, adding its three declared exempt rows to the three counts and not to
the TOTAL; it says so and exits 1 rather than printing a plausible sum, which is what an aborting
parser is for one level up.

### Readers

Conformity **14 findings / 7 blocking**; adequacy **16 mutations / 9 survivors / 7 blocking**;
**overlap 1 — the FORTIETH measurement**, inside the 0-4 band, neither primed. The one shared subject
is *the document as it is on disk*, reached from opposite ends: the conformity reader read the
sentence against the code, the adequacy reader found it while probing `THREADABLE_TYPES`. Their split
held again — the conformity reader found claims that were false (five of its seven blocking findings
are sentences or counts), the adequacy reader found bounds that were not there (all seven of its
blocking survivors are a provenance, a membership or an observer that did not exist).

### Late exceptions

**ONE, zero undeclared**: `spec/flow-definition.md` §3, one sentence, found by the conformity reader —
*the runtime entry (W66) folds this into `createRuntime`* was true when W66 wrote it and false the
moment stop-and-ask 1 shipped. No rule moved and none was added; `check:spec` is unmoved at
7 / 55 / 106 with `C4` at 34. The four seeded exceptions behaved as predicted:
`spec/outcome-record.md` §4 and `spec/run-state.md` §7 moved (169 → 175 task nodes, 153 → 159 unnamed,
which `test/fold/result-value.test.ts` derives and compares), `AGENTS.md` §13's count moved, and
`scripts/check-markdown.mjs` and `scripts/build-browser-tests.mjs` did NOT fire — checked before the
record step, as the table said to.

