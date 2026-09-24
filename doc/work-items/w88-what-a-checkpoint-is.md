# W88 — what a checkpoint IS

**Status:** done
**Plan:** [P23](../plans/p23-what-a-run-needs-to-outlive-its-process.md) — *what does a run need so
that it can be saved while it runs and resumed after the process that ran it is gone?*

```
Spec:       spec/run-state.md — a new section, WHAT A CHECKPOINT CARRIES, and the rules for it
            (the header's fields, the event sequence, the structuredClone contract, the sequence
            position). Rules are ADDED and no existing rule's text moves — P23 prediction 4, and
            this item is its first test.
Owns:       src/driver/**, src/fold/**, src/scheduler/**, spec/**, test/**, doc/decisions/0064-*
Inputs:     P23 decisions 1-8, RE-TAKEN at this item's declaration step rather than transcribed:
            facts 1, 2, 3 and 6 by re-running dev-dist/p23/replay.ts and footprint.ts on the tree
            this item starts from; ADR 0014 (the driver produces the ordered fold-input sequence);
            ADR 0058 (what start returns, and ADR 0014's refusal of a driver subscribing to itself);
            OR-R2, OR-R6, OR-R11 and OR-R12 (what crosses the clone); W42's finding that the entry
            payload is in no record.
Outputs:    (1) ADR 0064 — what a checkpoint is
            (2) the HEADER: a format version, runId, flowId, flow version and the ENTRY PAYLOAD,
                and the driver keeping the entry payload it was started with
            (3) driver.checkpoint() returning { header, events }, and the header on RunHandle
            (4) the structuredClone contract as a RULE, with an observer over EVERY fold-input
                kind rather than over the kinds a corpus happens to produce
            (5) each event's SEQUENCE POSITION available to a consumer appending events, so a
                stored stream can be named "everything up to N"
Depends on: nothing
Blocks:     W89
Tests:      test/driver/** at L1-L2 on a fake scheduler. Every expected header field is derived
            from the definition and the start call, never read back from checkpoint() itself; the
            round-trip is asserted against structuredClone for each fold-input kind by NAME, and
            the kind list is bound both ways to FoldInput's union (a list is a claim about another
            list — rule 8 obligation (e)).
Gate:       L0 under all five typecheck lanes and lint, EACH RUN SEPARATELY; L1-L5 in three
            runtimes; check:spec; check:docs; L6 UNMOVED at 1833 / 60 in both runtimes.
Reserves:   Q366-Q370, ADR 0064
```

## Scope

**In**

1. **The header**, its fields and its format version, and the rule that makes the format version
   the thing W89's resume refuses on.
2. **The driver keeps the entry payload** — the one thing P23 fact 2 found the log does not carry.
3. **`driver.checkpoint()`** returning a value that round-trips `structuredClone` exactly and holds
   no live reference to the driver, and **the header on `runtime.start`'s handle** (P23 decision 4).
4. **The sequence position** — how a consumer knows which event is which when it appends.
5. **What `checkpoint()` costs**: a copy or a reference, measured and decided, with the choice
   stated against P23 fact 6.

**Out** — named rather than left implicit, with where it goes instead

- **Resuming** from a checkpoint, the replay, the prefix check, the re-dispatch and every refusal —
  W89.
- **Whether a resume is RECORDED as an event** — P23 stop-and-ask (a), answered before W89.
- **The real-worker demonstration and the reference's teaching** — W90.
- **Storage, redaction and any memory option** — P23 decisions 1 and 8.

## What the declaration step must re-take before anything is edited

| # | re-take | from |
|---|---|---|
| 1 | the replay still reproduces the corpus exactly — P23 fact 1 | `dev-dist/p23/replay.ts`, re-run on this item's starting tree |
| 2 | the entry payload is still in no record, and every site that would need it at resume | fact 2, plus a grep of `src/driver/driver.ts` for every read of the start payload |
| 3 | every fold-input KIND round-trips `structuredClone` — including the kinds the corpus never produced | fact 3 re-taken over the `FoldInput` union rather than over the corpus |
| 4 | which of `examples/**`'s `DRIVER_FIELDS` lists and `test/driver/retention.test.ts`'s a new private field reaches | the seeded exceptions table's first row |

### What the re-takes found — on `810cf75`, node 24.20.0, before any edit

| # | re-take | measured | what it corrects |
|---|---|---|---|
| 1 | `dev-dist/p23/replay.ts`, re-run unchanged | reproduces the plan's numbers **exactly** — 1275 starts, 180 drivers, 169 exact, 673 prefixes, 616 / 616 payloads, 2015 events | **nothing about the conclusion, and the SAMPLE is a third of what fact 1 says.** The spike wraps `Driver.prototype.start` and pushes onto `captured` while its exit handler iterates `captured` with `for…of` — so every replay driver it starts is itself captured, up to six per flow, and replayed again. **L6 starts 62 drivers, not 1275.** Re-run with capture stopped at L6's end (`dev-dist/w88/replay-fixed.ts`): **61 captured over 30 flows, 57 reproduce exactly, 324 prefixes, 261 / 261 dispatched payloads equal, 998 events all clone exactly, all eight kinds present**; the other four are the two `FD-R4` refusals (replayed identically) and the two `OR-R6` stops. P23 fact 1's *"nine refused by `FD-R4`"* is two, and fact 5's *"22 runs / 147"* is 13 / 46. [Q366](../open-questions.md) |
| 2 | every read of the start payload in `src/driver/driver.ts` | THREE, all inside `start()`: `boundaryTargets(this.def, payload)` (`FD-R4`), `compose` through `enter`, and `enter` itself — kept nowhere after `start()` returns, and in no record | confirms fact 2; the header must carry it and the driver must keep it |
| 3 | `structuredClone` over the `FoldInput` UNION — one element per kind in a `Record<FoldInput['kind'], FoldInput>` (`dev-dist/w88/kinds.ts`) | **8 of 8 round-trip**, including `Map`, `Set`, `Date`, `BigInt` and `-0` in a result — **and the harness's own `deepEqual` calls a class instance EQUAL to its clone** (control: `deepEqual(structuredClone({r: new K()}), {r: new K()})` is `true`, the prototype gone) | the item's observer cannot be `equal`: a round trip judged with it is blind to `OR-R11`'s lossy shapes. [Q367](../open-questions.md) |
| 4 | which `DRIVER_FIELDS` lists a new private field reaches | `test/driver/retention.test.ts` (owned) and `examples/l6.ts` (seeded row, **fired**); `examples/run-flow.ts` walks by EXCLUSION (`NOT_RUN_STATE`), so a WALKED field needs no edit there; `examples/retention.ts` carries no list | the seeded row named three files and one fires — below |
| 5 | *(added)* copy against reference, P23 fact 6's run (`dev-dist/w88/copy-cost.ts`) | at 10 000 tasks: `foldInputs()` **22 / 24 / 61 ms** at 16 B / 1 KiB / 16 KiB, holding one more copy while kept; a reference **0.1-0.3 ms**; the `v8.serialize` a store pays **19 / 22 / 113 ms** | the COPY — ADR 0064 rule 4 |
| 6 | *(added)* events reaching `onFoldInput` before `start()` returns, over L6 (`dev-dist/w88/before-return.ts`) | **1 on 59 starts, 5 on one (a nested map at the entry), 0 on the two refused** | `RunHandle.header` arrives AFTER the first events, so a store keys by POSITION — ADR 0064 consequence 1 |

**Baseline, re-taken** by a full `npm run gate` on `810cf75` before any edit — `GATE EXIT=0`, zero
`FAIL` lines: L6 **1833 / 60** in node 24.20.0 and deno 2.9.6; L1-L5 **47 / 1322** in node, deno and
chromium; `check:spec` **7 / 61 / 108**; `check:docs` **35 snippets, 29 run, 6 check**;
`check:workers` **17 / 17**; `check:markdown` **149 documents, 6816 links, 363 anchored**.
*(The plan's baseline paragraph reads 147 / 6749 / 355 — taken by P22's retro before the plan's own
documents landed.)*

## Verification

**Routing:** this item adds none. Of the five states the template names, the observers checkpoint
two — `user_action` resolved (the `resolution` run) and a fan-out join (the `region` run) — and **not**
a branch routed away from its join, a missing decision edge, a duplicate id or a nested fan-out.
*(The declaration said all five were "in its observers"; they are not, and nothing here needs them —
`RN-R14` makes a checkpoint `foldInputs()`, whose kinds `RN-R17` covers by KIND rather than by
routing state.)*

| rung | what it covers here | result |
|---|---|---|
| L0 `lint` | the new surface | EXIT 0 |
| L0 `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — **each run separately** | `onFoldInput`'s second parameter through the runtime's composition; `RunHandle.header` required; `Record<FoldInput['kind'], …>` binding the kind list to the union both ways — in `typecheck:tests` ONLY, the one lane whose config includes `test/**` | EXIT 0 on all five, and `lint` — **re-taken after the readers**. *(This table read EXIT 0 before either reader ran, and `lint` and `typecheck:tests` were RED: both lanes had last run before the test file existed. Both readers found it. What broke 6.)* |
| L1-L2 `test/driver/checkpoint.test.ts` | `RN-R14`-`RN-R18`, on a fake scheduler | 13 cases |
| L1 `test/scheduler/checkpoint.test.ts` | `RunHandle.header` and the position through `createRuntime`'s composition | 3 cases |
| L1-L5 in node, deno and chromium | the whole suite, with the census binding the two new suites and COUNTING their cases from outside them | **49 files / 1339 assertions** in all three, from 47 / 1322 |
| `check:spec` | `spec/run-state.md` v0.9, five rules added | **7 / 61 / 113**, from 108 |
| `check:docs` | the public surface grew — `NotStarted` reached §9's enumeration | **35 snippets, 29 run, 6 check** — unmoved |
| L6 node and deno | **UNMOVED**, as declared | **1833 / 60** in both |
| `check:markdown` | ADR 0064 and its links | green |
| `npm run gate` | everything | **`GATE EXIT=0`, zero `FAIL` lines** — see Record |

## Exceptions — files outside `Owns`

*Should have been in this file from the declaration step, as P23 seeded it; added once the build
began, which is later than the plan asks.*

| file | why | predicted? |
|---|---|---|
| `examples/l6.ts` | the byte walk's `DRIVER_FIELDS` gains `header`, WALKED — the only L6 failure the new field cost | **yes** — seeded row 1 |
| `examples/run-flow.ts` | — | seeded, **not needed**: it walks by exclusion, so a walked field is invisible to it |
| `examples/retention.ts` | — | seeded, **not needed**: it carries no list of the driver's fields |
| `AGENTS.md` | §9's executed error-class snippet ENUMERATES the root's `Error` subclasses ([Q101](../open-questions.md)), so `NotStarted` went red at `X4`; and §8's *`runtime.start` returns `{ driver, done }`* was incomplete | **the FILE yes, the REASON no** — seeded for `RunHandle`'s literals (Q348), which fired nothing; the enumeration was seeded for W89 |
| `scripts/build-browser-tests.mjs` | — | seeded conditionally, **not needed**: no new suite reads a `spec/**` document the bundle does not inline |
| `doc/plans/p23-what-a-run-needs-to-outlive-its-process.md` | fact 1's and fact 5's numbers, and the seeded table's W88 rows, corrected in place | **no** |

*`AGENTS.md`'s edits grew after the readers — the throw table's two new rows and §2's and §12's *`{ driver, done }`* — under the same row. `README.md`, `doc/open-questions.md`, `doc/decisions/README.md` and the plan's Record are record-step files (`doc/workflow.md` section 1 rule 5). **Zero undeclared**: `git diff --name-only` against `Owns` by hand, and by the conformity reader.*

## Record

**DONE 2026-09-24.** ADR 0064; `spec/run-state.md` **v0.9** — section 8 and `RN-R14` to `RN-R18`, and
ONE clause on `RN-R13`; `Driver.checkpoint()`, `CheckpointHeader`, `Checkpoint`, `CHECKPOINT_FORMAT`,
`NotStarted`; `onFoldInput(input, seq)`; `RunHandle.header`. **L6 UNMOVED at 1833 / 60 in both
runtimes**, which is the declared result.

### Gate — on the tree this item ships, digest `b7a40981598c4f16` over 392 files, identical at both ends of the confirming `npm run gate`

| rung | result |
|---|---|
| `lint`, and `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — **each run separately** | EXIT 0, all six *(after the readers — see What broke 6)* |
| L1-L5, node 24.20.0 / deno 2.9.6 / chromium | **49 files / 1339 assertions** in all three, from 47 / 1322 — two new files and one new census case |
| `check:spec` | **7 / 61 / 113**, from 108 — the five rules |
| `check:docs` | **35 snippets: 29 run, 6 check** — unmoved |
| `check:workers` | 17 / 17 — unmoved |
| `check:markdown` | **150 documents, 6852 links, 364 anchored**, from 149 / 6816 / 363 — ADR 0064 |
| L6 node 24.20.0 and deno 2.9.6 | **1833 / 60** in both — UNMOVED |
| `npm run gate` | **`GATE EXIT=0`, zero `FAIL` lines**, `selftests` 8 / 8 |
| Q142, measured BEFORE the record step | probe 1 (`doc/decisions` cut) **114 files against `M3`'s 123 — margin 9, unmoved**; probe 2 (`doc/decisions` + `doc/plans` cut) **5052 links against `M4`'s 5270 — margin 218**, from 240; **re-measured AFTER the record step: `M3` 9, `M4` 201** — Q142 does not fire |

### Outputs

| | output | what fails without it |
|---|---|---|
| 1 | ADR 0064 | `C5` (three spec links) and `check:markdown` |
| 2 | the header and the driver keeping the entry payload | `RN-R15`'s three cases: `a1`-`a10`, `r2`, `r3`, all caught |
| 3 | `checkpoint()` and `RunHandle.header` | `RN-R14`/`RN-R17` cases and the runtime header case: `b1`-`b6`, `r1`, `r5`, `r7`; `b6` at L0 |
| 4 | the `structuredClone` contract as a rule over EVERY kind | the per-kind case and its controls: `b7`, `b8`, `d1` (L0, `typecheck:tests`), `d2`, `r11`, `r12` |
| 5 | the position | the two `RN-R18` cases and the runtime position case: `c1`, `c2`, `c2c`, `c4`, `r4`, `r14` |

### What broke, and the rung that caught it

| | what | rung |
|---|---|---|
| 1 | **P23 fact 1's sample was two-thirds the harness's own replays** — 1275 starts where L6 makes 62 ([Q366](../open-questions.md)) | none; the declaration step's re-take |
| 2 | **the harness's `deepEqual` calls a class instance EQUAL to its clone** ([Q367](../open-questions.md)) | none; re-take 3's control |
| 3 | my own `kinds.ts` probe used a constructor PARAMETER PROPERTY | node's type stripping, `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` — `RT-R9`'s trap, read correctly |
| 4 | **the environment, twice**: a bare `node` resolved to 16 in my own shell; and the rule 8 harness's environment assertion fired on its FIRST run, because a bash spawned from Python here has no fnm on PATH | the environment clause, both times, before any probe ran — it now pins node by its install directory |
| 5 | a test claimed the entry node receives the caller's own value on a flow whose entry composes `"."`, which CLONES | the suite, on its first run |
| 6 | **L0 was RED and this file's Verification table said GREEN.** `lint` (5 problems, `require-await` and `prefer-const`) and `typecheck:tests` (TS2345 in the comparator) — both in the test file, **written after** the lanes had last been run | a rung that EXISTED and was not re-run; **found by BOTH readers**. W86's confirming-gate failure a second plan running, and v0.12's *re-take on the tree the item ships* not followed at the moment the table was filled |
| 7 | author pass: `roundTrips` tautologisable (`b7`) and the per-kind loop truncatable (`d2`) for ZERO; and `c2b` declared caught when it is semantically EQUIVALENT (the length before `push` IS `push() - 1`) | rule 8's author pass, AGAINST DECLARATION |
| 8 | **the author pass's `d1` was CAUGHT FOR THE WRONG REASON** — `typecheck:tests` was already red from item 6, so dropping a kind "fired" a lane that fails without it | found only once item 6 was fixed and `d1` came back as an abort, then TS2741. **The harness counts FAIL lines and never matches them to the probe's reason** — *fires for the reason it names* is a requirement on the SET that the harness does not implement |
| 9 | the readers' blocking findings — the runtime position never on a second minted run while `RN-R18`'s Test cell said so (BOTH readers); section 8 saying the `OR-R6` stops replay identically; the copy tested for one kind; the header's order against `FD-R4` and `MultipleRuns` untested; either suite EMPTIABLE at exit 0 (W85's finding a second time) | the readers |
| 10 | **the adequacy reader's F8 was wrong**: handing out the driver's own `region` elements is NOT equivalent — the `event` is frozen, the element wrapping it is not | the every-kind copy case written for F1 — rule 8's pass 2, `r7` AGAINST DECLARATION |
| 11 | **`RN-R13` said a run's footprint IS two terms** while the driver now retains a third | the conformity reader — and it is P23 prediction 4 REVERSING (below) |
| 12 | stale copies: `{ driver, done }` in `AGENTS.md` §2 and §12 and `README.md`; *1 to 5* stated generally; *every typecheck lane*; ADR 0064 **rule 4** cited for the position in three places (it is rule 5); `RN-R15`'s own cell repeating the withdrawn *beside `RN-R13`* | the conformity reader, and section 1 rule 5's third direction (a grep) for `RN-R15`'s copy |
| 13 | `doc/decisions/README.md` had stopped at 0060 — **0062 missing, the FOURTH time** | none; adding this item's row |
| 14 | the EXCEPTIONS table was not in this file at the declaration step, as P23 seeded | none |
| 15 | two edits written through heredocs containing backticks or backslashes, against this item's own discipline | none; both outputs verified byte-for-byte (no CR, backticks balanced, the grep) |

### Predictions

**P23 prediction 4 REVERSES on its first test — by RETENTION, not by resume.** *The fold changes by
at most one input kind and no existing rule moves*: no `FoldInput` kind was added and no cell of run
state moved, and **`RN-R13`'s text did move**, gaining a clause for the header's retained copy of the
entry payload — constant in the tasks settled, proportional to the payload, and for a `map` at the
entry its whole item list. The first draft placed the term *beside* `RN-R13` in a new rule and kept
the prediction true in its letter with `RN-R13`'s sentence false; the conformity reader read the
sentence. *A prediction about which rules move can be kept true by where a clause is written, and the
test is whether every existing sentence is still true.* Predictions 1-3 are W89's and W90's.

### Rule 8

**Author pass: 31 probes, 25 caught, 2 declared ceilings, 3 AGAINST DECLARATION** (`b7`, `d2` real;
`c2b` vacuous and wrongly declared), digest identical — and `d1` among the 25 caught for a reason not
its own (What broke 8).
**Pass 2, with both readers' exact edits checked in: 46 probes — 1 control clean, 40 caught, 5
declared ceilings RUN, 0 undeclared survivors, 0 crashes, 1 abort (`d1`, its anchor moved by the L0
fix — rule 7 (b) — re-anchored and caught by TS2741) and 1 against declaration (`r7`, the reader's
equivalence claim, reclassified caught)**, digest `a3301cbfa52cc48d` identical at both ends. The five
ceilings: **`c3` and `r6` — a position counted by the runtime's wrapper, DATED: equivalent while every
driver sequence starts at the wrapper's first call, and W89's resume is the first road where it does
not, so W89 re-runs both**; `c6`, a re-source whose compound `c6b` is caught by the second observer;
`c2b` and `r10`, semantically equivalent by construction. Harness: `dev-dist/w88/rule8.py` —
environment pinned, control, per-edit anchors exactly once against current bytes, undo on abort,
byte-asserted restore, digest over tracked and untracked-unignored files, declarations in the set.

### Readers

**Conformity: 12 findings, 3 blocking — and ZERO disagreements on the VALUES**: every header field,
every run's event sequence (the `region` run's fifteen, `linear`'s five, the `stopped` run's two), each
`RUN_FOR` entry's kind, the positions, the two runtime runs and the events before `start()` returns
over L6 (`62 {"0":2,"1":59,"5":1}`, re-taken by its own preload) — derived on paper first. What it
found were CLAIMS and the red L0. **Adequacy: 32 mutations, 7 survivors, 6 blocking** (F0-F5), one of
its non-blocking classifications wrong (F8). **Overlap 2** — `typecheck:tests` red, and the runtime
position never on a second run — **the FIFTY-FOURTH measurement**, inside the 0-4 band, both
unprimed, and both readers ran concurrently on separate copies with the author's tree held still at
`1f6450ba66aecf6b` until both had reported ([Q363](../open-questions.md)'s answer, followed).

### What this taught

- **A table of green rungs filled before the last file was written is a claim about another tree.**
  Item 6 is W86's retro finding one plan on, and this Record's own gate row was re-taken last for
  exactly that reason.
- **A harness that counts FAIL lines cannot tell a probe's reason from a lane that was already red** —
  `d1`'s first catch. The control is green on every rung the CONTROL names, and `typecheck:tests` was
  not one of them.
- **v0.23's selection clause did its work on the header** — every wrong selection (`r1`, version 1, the
  composed payload, the result, clone-late, reference) was caught on the first pass — **and missed the
  one SELECTION the plan did not frame as one**: *which run* a position counter belongs to. Both
  readers found it at the default position, a first run.

### Questions raised

[Q366](../open-questions.md) (a facts harness capturing its own calls — owner W89, for fact 4's
harness) and [Q367](../open-questions.md) (the harness's `equal` is prototype-blind). **Q368-Q370
unused and not reused. ADR 0064 taken.** Census **288 / 226 / 1 / 61**, all 288 in exactly one
cluster cell, ten wide rows refused by the parser by id and classified by hand.

### What W89 inherits

- the two DATED ceilings `c3` and `r6`, to re-run once a resumed driver's sequence does not start at
  its wrapper's first call;
- the header holds what CROSSES the clone (`OR-R11`), so a resumed run's re-dispatched tasks are
  composed from a copy where an inline original was handed the caller's instance (ADR 0064
  consequence 4);
- `format: 1` as the number its refusal reads (`RN-R16`), and `NotStarted` as the only refusal
  `checkpoint()` makes — a `stopped` run checkpoints like any other, and refusing its RESUME is W89's;
- the first events arrive before the handle, so a store keys by position — a stored prefix is a
  prefix by POSITION, which is the prefix check P23 decision 9 names;
- [Q366](../open-questions.md): re-take `dev-dist/p23/kill-resume.ts` rather than inherit fact 4.
