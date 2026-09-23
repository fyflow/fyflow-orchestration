# CLAUDE.md — fyflow-orchestration

Guidance for Claude Code working in this repository.

## What this project is

A **flow orchestration layer over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler)**:
flows with sequence, **decision** routing, **fan-out** and **join**, instantiated per workload at
1000s-10000s scale. *(That figure is `FLOW_PLANNING.md`'s, in the scheduler repository, **which is not
on this machine** — see [P15](doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md) fact 8.
What `doc/concept.md` says, and what you can check, is **"thousands at a time"**. P15 measured a run
at both ends of that range.)*

Full context: [doc/concept.md](doc/concept.md). Do not re-derive it — read it.

**[AGENTS.md](AGENTS.md) is the consumer reference** — what the library looks like from outside, and
the only document that does. **Every snippet in it is extracted and executed by `npm run gate`**
(`scripts/check-docs.mjs`), so it cannot rot the way a hand-maintained reference does. If you change
the public surface, that check is what tells you the reference is now wrong.

## Current state: **P1-P20 are ALL complete and retro'd, `doc/workflow.md` is [v0.21](doc/workflow.md), and P21 is COMPLETE PENDING ITS RETRO — W80, W81 and W82 are all DONE. The package is `0.3.0`; L6 is 1724 assertions over 58 real runs and L1-L5 is 46 files / 1295 cases.**

**[W82](doc/work-items/w82-a-result-its-own-schema-refuses-on-real-workers.md) is DONE, it takes NO ADR, and it is P21's EXIT ARTIFACT — so P21 is COMPLETE pending its retro. L6 is 1724 assertions over 58 real runs in BOTH runtimes**, from 1639 / 55. **The item had to CONSTRUCT its own case and fact 3 is why**: re-taken at its declaration step the corpus reports **0 violating results over 93 settled `done` across NINETEEN flows**, where the plan measured 0 of 5. So `examples/workers/gauge.ts` declares a bound its own code does not keep past its declared example — Q302's arithmetic rebuilt, `load = words / 10` against `maximum: 1` — and `examples/workers/stamp.ts` **has no bug at all**: it attaches `label` with `Object.defineProperty` so it stays out of the serialised payload, which keeps it out of `structuredClone` too, so what `run()` returns CONFORMS (`required` is `hasOwnProperty`) and what `OR-R2`'s clone writes does not. **Both are GREEN at `check:workers` and every arc of the flow is `fits` at `checkWiring`** — and they are green with each defect REMOVED as well (`a5` costs 5 at L6 and `a6` costs 17, both with `check:workers` unmoved), so *the reach is measured from both sides: the corpus check cannot see either defect arriving OR leaving.* **THREE observers of one fact and the middle one is the RECORD** — the scheduler's live `detail.result` at the harness's own listener still carries the key, the record does not, the finding says `$.label required` — which is why `StampWorker` is INLINE **and must be**: measured at both pool modes, the finding is reported either way and *a thread hides the ATTRIBUTION and not the finding*, which is `tally.ts`'s constraint for the same reason one rule across. **The two-word control is what makes `gauge`'s finding a function of the DATA rather than of the node**, and `attest` reports the key set it RECEIVED, so ADR 0060's declared COST — a value that fails its schema still flows downstream — is an assertion rather than a sentence. **The check-OFF pair is decision 3 on real workers**: the same row run again with the one option removed and the same run id, identical dispatched ids, log record for record and every settled result, **with the reports the one thing they differ in** — and its cost is asserted as a COUNT and PRINTED as a ratio (0.25x / 0.37x in node against 0.18x / 0.19x in deno over the rung's 204 settled results, which is decision 5's own argument in one line). **AGENTS.md gains section 16 and README.md a fourth `X8`-paired fence**; `RUN_FLOOR` 27 → 28, `check:docs` **34 snippets: 28 run, 6 check**, `check:workers` **16 / 16 / 2**, L1-L5 **UNMOVED at 46 / 1295** in three runtimes, `check:spec` **UNMOVED at 7 / 61 / 108**. **Its adequacy reader's central finding is that EVERY OBSERVER OF THE REPORT WAS DOWNSTREAM OF THE REPORT**: the row's literal, the per-id text and the log-derived walk all read `report.nonconforming` on the actual side, so pointing each at it in one commit left all three vacuous **with every declared control green** — the walk's control became *the report is non-empty*, exactly as true as before — after which **a driver reporting `$.NOTHING garbled` for every settlement left L6 at 1720, 0 failed**. *Obligation (c)'s LIMIT one layer out: three expressions over ONE value.* What refuses it is a relation the LOG has and the report does not — **the walk reaches the CONFORMING settlements** ([Q340](doc/open-questions.md)). Its conformity reader's central obligation came back with **ZERO disagreements on the VALUES**, every finding, id, `nodeResults` entry and the whole `+15 / 1720 / 58` arithmetic derived on paper first; what it found were CLAIMS — `AGENTS.md` §9 saying a run never checks what a worker returns **four sections above the section teaching that it does**, a FOURTH standing copy of the withdrawn *rather than carrying it downstream* in the plan's own Exit-artifact line (which this item's finding 3 had declared correct after reading only the line above it), and a paragraph headed *Measured on the tree this item ships* false in four numbers. **Readers 16 / 6 blocking and 17 configurations / 13 green / 9 findings / 6 blocking, overlap 1 — the FIFTY-SECOND measurement.** Rule 8 final **52 probes, 39 caught, 12 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, digest identical at both ends, with all TEN reader edits checked in — and the author pass corrected itself four times first, including **a binding that did not bind** (the pair kept two projections per arm, so re-sourcing one left the control reading the real run) and **a ceiling bought by a CRASH** (`b6b` fired on `found[0]!` of an empty array; `X4` refuses `if (false)` BY NAME, so the tautology is `x !== x` — [Q341](doc/open-questions.md)). **THREE of the five exceptions it needed were UNPREDICTED and one that was predicted did not fire**, and all three unpredicted ones are one shape: **a corpus census pinned as a LITERAL in a file that is not the corpus** — `check-workers-selftest.mjs`'s tally regex took a GATE ENTRY red while `check:workers` stayed green, *the count living in the GRADING and not in the check* ([Q342](doc/open-questions.md)). Q340-Q343 raised, **Q344 spent, ADR 0061 SKIPPED**; census **265 / 207 / 2 / 56** — and the register's headline had been **stale at 256 / 199 / 2 / 55 through the whole of W81**, while a parser written from scratch was wrong in a fourth direction nobody had recorded: [Q87](doc/open-questions.md)'s row spans five lines, so a filter requiring one line to open AND close **dropped** it and the census read 260 with **zero aborts** — *a parser that aborts on what it cannot classify does not abort on what it never SEES* ([Q343](doc/open-questions.md)). *Read every status from the item's own file, never from this line.*

**[W81](doc/work-items/w81-what-a-settlement-costs.md) is DONE, it takes NO ADR, and [Q320](doc/open-questions.md) is RESOLVED: the always-on handle costs **exactly one more `structuredClone` per settled task** — one more copy of everything `OR-R2` already copies, a ratio of **1.00x by construction** — and **a consumer CAN decline it**, by building the `Driver` from `runtime.registry`, which is P18 decision 14's own sentence executed.** `examples/settlement-cost.ts` is the measurement, on `examples/retention.ts`'s precedent: checked in, runnable in **both runtimes**, and deliberately **NOT a gate entry** — *a cost is a property of a machine*, so a rung over one would be a ratchet on hardware. **L1-L5 46 files / 1295 cases in three runtimes** from 45 / 1290; **L6 UNMOVED at 1639 / 55** in both, which is the declared result; `check:spec` **7 / 61 / 108** unmoved. **P21 prediction 4 is NEITHER, and it is the SECOND occurrence of [Q326](doc/open-questions.md)'s class**: in COUNT Q320 bites at every shape including the smallest fact 2 measured, so *does not bite* is false; in TIME it does not bite even at **24.0 MiB of settled results**, where three back-to-back passes of one row read 1.05x, 1.26x and 1.17x — a spread as large as the effect; and *needs a shape built for it* is false twice, because `map-alias` reaches megabyte RESULTS through its own DATA and reaching them does not make the effect visible on a clock. **So stop-and-ask (c)'s permission to add a worker returning megabytes was granted and UNUSED.** **Three blocks, and two of them are CLOCK-FREE** — the check's price as a ratio on BOTH axes with only its DIRECTION asserted, the handle's as a COUNT, and the switch's as a count of how many times the driver reads a worker's `outputSchema`, which is **the only observable a check whose answer is discarded has**. That last is what makes **W80's dated ceiling `z1` a CATCH** at both rungs, exactly where its reason said it would be; W80's other **ten** ceilings were re-run here and all ten hold. **The departure is recorded rather than hidden**: P21 decision 5 says every cost is a RATIO, and *a ratio of two clocks is still two clocks* — the same values on one tree read **58% to 95%** over eight readings and 15-25% in node against 27-40% in deno, so decision 5 is necessary and not sufficient ([Q335](doc/open-questions.md)). **Its conformity reader's central obligation came back with ZERO disagreements on the VALUES** — `findings`' three reads of `schema.type`, all four count columns and every rung's figure derived from the documents and `src/` before any output was read — and what it found instead was that **the clone counter was counting the byte observer's own predecessor**: `driver.snapshot()` clones every result, so called before the count it added *exactly the quantity the block asserts*, and **17% of the printed column was the harness**. *P15's *downstream of the first's apparatus*, in the file whose header cites that clause.* **And the first fix was worse than the defect**: reading the count earlier, compounded with a driver that clones on both roads, came back GREEN — the two defects CANCEL — so the instrument is REMOVED before the log is read, which is a construction rather than a guard. **Its adequacy reader found the check ON was DECORATIVE and the binding written for it VACUOUS** (`0 === 0` on a corpus where nothing fails its schema, closed by a control run whose `tally` schema refuses), that `ARITIES` truncated to ONE value silenced block 3's headline, its v0.21 control AND its proportionality together — *a control fails where two values are EQUAL and could not fail where there is only one* — and that each of the three blocks was deletable on its own at exit 0. Readers **18 / 7 blocking** and **61 mutations / 39 survivors / 16 findings / 6 blocking**, overlap **3** — the **FIFTY-FIRST** measurement, band unmoved. Rule 8 final **51 probes, 36 caught, 14 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, control green and digest identical at both ends, with all eighteen reader edits checked in; the AUTHOR pass corrected itself six times first, including a CRASH where the artifact died on its own truncated declaration instead of reporting. A **PREDICTED-NEEDED** exception was **not** needed (`scripts/build-browser-tests.mjs` — wrong in both directions now across four items). **And the one claim this item WIDENED was put to the maintainer and came back narrower than it shipped.** The Q320 opt-out is `new Driver(flow, { ...runtime.registry, … })`, so the file that prices the two roads has to build one — which `examples/l6.ts`'s *nothing under `examples/` constructs a pool, a scheduler, a `Driver` or a built-in group* forbade. Measured on the shipped tree: with a MARKER alone, W67's adequacy reader's own mutation is still RED when it declares nothing and **GREEN the moment one comment line is typed above it** — *the claim caught the careless and stopped catching the deliberate*, because a marker is permission a file grants itself. The equality is **THREE-way** now — the constructors, the files that declare it, and a literal list in `examples/l6.ts` — so an exemption costs an edit in the file that wants it AND in the file that makes the claim, and it is **P21 decision 8** rather than an assertion's own comment (`doc/workflow.md` section 1 rule 3). Still ONE assertion, so L6 stays at 1639. Q335-Q339 raised, **Q320 RESOLVED**, Q171 extended; census **261 / 203 / 2 / 56**. *Read every status from the item's own file, never from this line.*

**[W80](doc/work-items/w80-what-a-run-time-result-check-is.md) is DONE and [ADR 0060](doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md) answers P21's question at the driver: A RUN-TIME RESULT CHECK IS A READING AND NEVER A REFUSAL, AND THE CALLBACK THAT RECEIVES IT IS THE SWITCH.** `spec/outcome-record.md` is **v0.10** and gains **`OR-R13`** — *not* an `FD-R`, because that prefix is *what a RUN refuses* and this refuses nothing, while section 4's whole subject is `result`. `DriverOptions.onNonconformingResult` is the nineteenth member, **its presence IS the switch with no boolean beside it** (two members are two sources, and both disagreements have names: a switch with no channel is cost paid for a report nobody receives, a channel with the switch off is a typed option silently dropped), and it makes the guard an **L0 assertion** — the callback is read once and handed down as a non-optional parameter, so deleting the condition does not compile. One site, in the settlement path, **AFTER the append**, because before it a throwing callback would delete a settlement from the log — *the behaviour change decision 3 forbids, caused by the reporting machinery itself*. **Both of W76's bindings FIRED BY NAME** when the nineteenth member arrived and the orphan pin moved 18 to 19 deliberately. **L1-L2 45 files / 1290 cases in three runtimes** from 44 / 1269, `check:spec` **7 / 61 / 108**, **L6 UNMOVED at 1639 / 55**, which is the declared result. **P21 prediction 1 REVERSES, measured deliberately because the plan said this item could reverse it by accident**: the clone is linear in the VALUE and the check is linear in the SCHEMA, so their ratio is unbounded in both directions — `enum` is where a schema's size is unbounded, because its membership test canonicalises every entry on every check, and one `enum` of a hundred allowed values is **1.65x** of the clone on a 4 KiB result and **3.08x** on a 0.5 KiB one, while two hundred levels of nested `properties` is **1.44x** and is not the same shape. *Fact 4's conclusion survives with its scope named: the share falls as the VALUE grows and rises as the SCHEMA does*, and the default is unmoved and better argued. **Prediction 3, the REACH, is CONFIRMED and has a SECOND LEG the plan does not name**: the check reads what the RECORD carries, after `OR-R2`'s clone, and `OR-R11` says that is a different value from the one the worker returned — so the same schema applied by `check:workers` and by this check can **disagree**, measured over seven shapes with three disagreeing, and *that half is unreachable by any authoring-time tool for a structural reason: none of them holds a record*. The control row is what makes it a finding rather than a coincidence — a PROTOTYPE getter is invisible to both, because the value check reads OWN keys and never `in`, which is W65's conformity reader's fix closing the gap from the other side before anyone looked for it. **Its conformity reader's central obligation came back with ZERO disagreements on the VALUES** — every finding list, path, walk order and task id re-derived on paper first — and what it found instead was that **the check could STOP the run on two values `OR-R11` calls INTACT**: `enum` and `const` are the only two of ADR 0053's thirteen keywords that call `canonical`, the only expression in the value check that walks the WHOLE VALUE, so a cyclic result or a BigInt threw and `onEvent` stopped the run. *Decision 3's headline invariant broken by the reporting machinery itself, one expression along from the append order the item had already guarded for the same reason.* **Its adequacy reader found that of decision 3's three named consequences, *routes differently* and *changes a terminal state* are bound and *writes a record* was NOT**: the log's records are handed over by reference, so the check could write `attempts = 99` into a record already appended, and the one non-comparative assertion read four fields of eleven. **Three of the pair's five equalities were collapsible to self-comparisons and no identity control can refuse that class here**, because every operand is freshly built — so every clause is now asserted against a LITERAL, for EACH arm. **And THREE declared CONTROLS were FOURTH CLAIMS**, three days after v0.21 adopted the clause that asks for them: asked of the author's own IDENTITY control *what tree makes this fail while its claim passes*, there is none. *Following the clause and asking its question are different acts.* Readers **20 / 4 blocking** and **34 mutations / 21 survivors / 12 blocking**, overlap **2** — the **FIFTIETH** measurement, band unmoved. Rule 8 final **49 probes, 37 caught, 11 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, digest identical at both ends, with all nineteen reader edits checked in — and **a declared ceiling that is a CATCH at 16, moved by the READERS' own coverage** (v0.17's dated-ceiling clause firing inside the item), plus one whose SITE no longer exists because the control it provoked is one the reader showed was entailed. **A PREDICTED-UNNEEDED exception was needed** — `scripts/build-browser-tests.mjs`, three items running after W76 and W77 — and **a test passed in Node and FAILED in Deno on a one-millisecond straddle**. Q330-Q333 raised, Q334 spent, Q302 extended and re-owned; census **256 / 199 / 2 / 55**. *Read every status from the item's own file, never from this line.*

**[P21](doc/plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md) is DECLARED — *what does a run-time schema check buy, and what does it cost against what a settlement already pays?* — and it is P19's slice 1, deferred twice, with **the reason both deferrals gave measured FALSE at the declaration**. P16 called it *strict mode* and put it last; P19 departed on the maintainer's argument that *per-settlement validation is the expensive way to learn it*; P20 deferred it again on *a gap outranks a price*. **Fact 4: a per-settlement `outputSchema` check costs 92.9% / 14.7% / 5.9% of the `structuredClone` the driver already pays unconditionally on the same settlement, and the share FALLS as the workload grows** — the clone is linear in the whole value and the check short-circuits on the schema's shape, so `publish`'s big `joinPayload` is 0.3647 ms to clone and 0.0006 ms to check, a ratio of **0.00x**. *Two plans deferred this as the expensive road.* **And fact 3 says the feature has NO LIVE DEFECT to point at**: Q302's two violations are both closed, one clamped in the worker's code and one refused at `start()` by `FD-R4`, both W73's — so the case must be made on CAPABILITY rather than on a bug, which the plan says at the top. **Fact 1 is the sharpest and it is about the instruments**: the only retention observer this repository has skips `opts` BY NAME, and `opts.onFoldInput`'s closure is the only thing holding the `RunState` ADR 0058 keeps — while `v8.serialize` REFUSES that field outright, so the byte road is closed. **Fact 2**: the always-on handle costs exactly +1 clone per settled task (46→52, 94→106, 414→466) and no measurable time at any shape this corpus can reach, so Q320 is true in COUNT and unshown in COST. **FOUR probes measured the apparatus before one measured the thing** — a payload that left every run `stuck`, a road through `runFlow` which installs its own callback, bytes (which give a clone and an alias the same length), and an identity read confounded by `foldInputs()`'s own clone — and only COUNTING the calls answered it. Three items, serial: **W80** (what the check IS — ADR 0060, opt-in and OFF by default, **REPORTED and never routed**; *this line said *refusing as a TASK failure on W61's precedent*, the claim P21's own commit `c869a4b` WITHDREW — W80's conformity reader, finding 3*), **W81** (the price, both halves, at a shape where Q320 bites), **W82** (the exit artifact: a worker returning a value its own schema refuses, reported by name, in both L6 runtimes). **Reserves W80-W83, Q330-Q344, ADR 0060-0061.** Census CONFIRMED for the TWENTY-SECOND plan running — 252 / 195 / 2 / 55 — and none spent. **Q142 was predicted a COIN FLIP rather than safe**: *`M4`'s margin is 31, the exact margin P18's retro fired on.* **It did not fire on any of the three items**, and the prediction was stale when it was written — W80's midpoint retune moved both floors, W81 measured 17 / 821 and W82 measured **14 files / 951 links** on the tree it ships. *It also names the wrong rung: `M3` is the tight one by three orders of magnitude.* *Read every status from the plan's own file, never from this line.***

**[P20](doc/plans/p20-what-the-runtime-owes-a-consumer.md) is COMPLETE and RETRO'D, `doc/workflow.md` is [v0.21](doc/workflow.md) — ONE change adopted, FIVE refused, and its central finding is that v0.18's CONTROLS clause was FOLLOWED by every item that ever added one and every control it has produced reads the WRONG SIDE of the comparison it guards.** Every such claim has the shape *OBSERVED equals DECLARED, both ways*; every control written for one reads *DECLARED is not empty* — so re-sourcing OBSERVED to DECLARED makes the claim compare a list with itself while the control stays **exactly as true as before**, because a re-sourced list is as non-empty as the list it came from. **That is obligation (c)'s entire probe class, invisible by construction to the mechanism v0.18 added in order to see it.** W78's adequacy reader found all three of that block's controls by asking *make each claim vacuous without tripping its control*; **the retro then asked it of the controls the clause had already produced and they fall identically** — W58's retry control at **0** (`1639 assertions, 0 failed`) and its resource-event claim, which declares no control at all, also **0**. One of W78's three was worse than weak: it asserted `stoppedBy` is a non-empty string, which the claim beside it ENTAILS, so no tree could make it fire alone — *a control entailed by its own claim is a fourth claim*. **The answer is IDENTITY**, *the two sides are different values*, which refuses the whole class for one expression and costs nothing. *Three amendments to one obligation — v0.14's count-is-not-a-membership, v0.18's name-the-controls, v0.21's what-a-control-must-do — each the previous one FOLLOWED and short, and each named a thing to ADD where none named a property the added thing must have* ([Q217](doc/open-questions.md)). **Name the rung: THIRTY-FOUR defects across the three items' own lists (9 / 12 / 13), SIXTEEN name a rung that FIRED, and FIFTEEN of the sixteen were read correctly at the first opportunity** — the sixteenth is a browser rung reported GREEN from a grep whose pattern could not match a `FAIL` line while `EXIT=1` sat two lines away, and **the GATE caught it two steps later**. Eighteen have no rung and **FIVE are in the INSTRUMENTS**: a harness reporting its own CONTROL as an undeclared survivor, one that ran 2.5 hours and produced **no verdict at all**, one killed between apply and restore that left the tree mutated, **a killed harness that KEPT RUNNING and edited the tree under its author's later measurements**, and a dated ceiling whose site the expiring item CONSUMED so rule 7 (b) could not abort. **REFUSED, five, each with a measurement**: a `doc/` check for the NINETEENTH time — **and P20 supplies the first `doc/` claim in twenty plans that a check could compare without reading English**, ADR 0058 quoting a sentence W78 deleted, defeated by the corpus itself, which carries **109 deliberate historical quotations across 52 files** of text that is CORRECTLY absent, so telling a live citation from a historical one IS reading English; an `X7`-shaped clause over the L6 counts, **NAMED for the next plan rather than refused, because neither document that must track them is under `doc/`** and eighteen refusals never covered it ([Q171](doc/open-questions.md)); the dated-ceiling HAND-OFF a THIRD time; an `Owns` pre-declaration rule for the EIGHTH plan, with no two items' late files overlapping and W78's four seeded predictions all correct; and a rule about a killed harness, at one occurrence ([Q327](doc/open-questions.md)). **ALL 92 declared probes RE-RUN at the retro on the shipped tree — 71 caught, 18 declared ceilings, ZERO catches, ZERO undeclared survivors, ZERO crashes, ZERO timeouts, ZERO aborts**, digest identical at both ends of all three sets; **zero catches for the second plan running**, and the reason is visible — W77 re-ran W76's set inside W77 and W78 re-ran both inside W78, so every ceiling had already been re-run by the item that could have moved it. **FOUR predictions: 1 CONFIRMED; 2 CONFIRMED with its MECHANISM narrowed by the item that met it** (the behavioural falsification cost ZERO, so the binding is a SOURCE binding — what separates the mechanisms is retention and time, and no rung weighs either); **3, the REACH, REVERSED on six of nine snippets — and its own stated consequence refused on a measurement**, so *a reach prediction reversed and STRENGTHENED the decision it was written against*, with P10's reading holding for the eighth plan; **and 4 NEITHER**, true at 4.6x against 26 CODE lines and false against 171 RAW ones, which is a FOURTH shape for a derived prediction — not narrower than its wording, not false underneath, not stronger than any observable, but **ambiguous between two observables that disagree** ([Q326](doc/open-questions.md)). **v0.20's TAUTOLOGY clause CONFIRMED on its first plan and ALL THREE authors instantiated it** — and every author's came back a declared CEILING while a READER found the large ones, W78's making all seven of the L6 block's claims tautologies with both counts, the subject list, the run count and all three controls unmoved and then adding BOTH `src/` reverts on top, still green at 1639. **v0.16's *a rung is RUN, never PIPED* was FOLLOWED and failed anyway** — *redirecting is what makes the exit code available and it does not make anyone read it* — and the counter-measure (print the FAIL count beside the exit code) is recorded rather than ruled. **v0.19's environment clause fired again**, in an author's own shell. Readers six passes, none empty, overlaps **2, 2, 2** — the forty-seventh to forty-ninth measurements, band unmoved, 41 blocking split 22 / 19 — **and P20 adds a shape the overlap number cannot express: two readers who SHARED a subject and DISAGREED about it**, one calling `await person` dangerous and the other inert, both right about different halves of one line. Late exceptions **2 / 3 / 1, zero undeclared**. Census **CONFIRMED for the TWENTY-FIRST plan running — 252 / 195 / 2 / 55**; the retro raises no question and extends Q171 and Q217. **W79 CLOSED unissued, Q328-Q329 reserved and unused and therefore SPENT, ADR 0059 SKIPPED.**

**[W78](doc/work-items/w78-the-run-a-consumer-holds-in-one-line.md) is DONE and it is P20's EXIT ARTIFACT — the run a consumer holds in ONE LINE, on real workers, and the only item in the plan where L6 MOVES: 1639 assertions over 55 real runs in BOTH runtimes**, from 1627 / 53. **No ADR.** One CONSUMER-ROAD block outside the row loop — and it could not be an `EXPECTED` row, because `runFlow` IS the machinery it exists not to use, which is W67's shim-run shape one plan on. **Run A** is a fan-out in which the consumer holds only `{ driver, done }`: the region events counted through `StartOptions.onRegionEvent` (W76) and the end awaited in one line (W77), with what the callback received held EQUAL to the region subsequence of the driver's own fold inputs, element for element, **on a REAL pool for the first time**. **Run B** is the pair: its driver REFUSES and `done` **RESOLVES** with `stopped` carrying `stoppedBy` rather than rejecting — **ADR 0058 rules 3 and 4, which had no observer at L6 and none on real workers anywhere.** **The revert costs P20 had no other way to learn: W76 alone 2, W77 alone 8, both 10** — additive, where each cost ZERO before this block, because both items declared L6 UNMOVED. **The reference's THIRTEEN copies are ONE and 135 lines are 16**, and the residue is MEASURED rather than asserted: four sites reduce to nothing but `done`; five keep a callback for a DIFFERENT fact — a fan-out's settlement ORDER (a `RunState` is order-free by construction), the PARK (`awaiting_action` is not terminal, so *a promise cannot tell you a run has parked, because parking is not the end*), the frozen-handle snippet's own `onFoldInput`, the failure KIND, and `driver.runId` read the instant `start` returns — and **ONE cannot reduce at all**, because §12's *driver with no scheduler* builds a `Driver` by hand and there is no runtime to keep a fold. `AGENTS.md` now teaches the two things ADR 0058 leaves it and had nowhere for: **`Promise.race([done, …])` as the deadline and `awaiting_action` as the state `done` waits THROUGH**. **It corrects the plan in FOUR places**: fact 3 MOVED (W77 moved it — **the third consecutive item in this plan whose measured input a predecessor moved**), **fact 4's HARNESS is broken by W77's own breaking change and exits 1 naming the line** — [Q253](doc/open-questions.md)'s LOUD form against W77's silent one, and *a facts harness's prose is what rots and its code is what breaks, and only one of the two is visible*; the exit artifact cannot be a row; and **prediction 3 REVERSES on SIX of nine snippets**, with its stated consequence — *this argues for a `runtime.run()`* — refused on a measurement, because the breaking road already costs such a consumer one omitted name. **Prediction 4's verdict depends on which line count you pick and it names NEITHER**: 119 lines removed against **26 CODE** lines added to `src/` HOLDS at 4.6x, against **171 RAW** it is FALSE ([Q326](doc/open-questions.md)) — in a repository whose `src/` is majority comment by house style. Readers **18 / 9 blocking** and **35 mutations / 13 survivors / 7 blocking**, **overlap 2 — the FORTY-NINTH measurement** — and *the two readers DISAGREED about one of the two shared subjects*: conformity called `await person` dangerous (unbounded, its rejections fatal) and adequacy called it inert (deletable for zero), **and both were right about different halves**. **The conformity reader's central obligation came back with ZERO disagreements on the VALUES** — every region event with its branch paths, both outcomes, `stoppedBy`'s prefix from `failRun`'s own formatting, the rule that licenses the fold equality and the assertion arithmetic, all re-derived on paper before reading any output — and it **rebuilt the W76 tree from scratch** to confirm finding A independently. What it found were claims: §2 still said `start` hands back a `Driver` while its `README.md` twin had been corrected by W77, `README.md` carried 1627 / 53 in two places, **ADR 0058's Context cited a phrase this item had DELETED**, and `examples/l6.ts`'s own header omitted the block in the paragraph that is that file's monument to exactly that defect. **The sharpest single finding was ONE EXPRESSION reached from both ends**: `stateA: settledA ?? foldedA`, a reporting convenience that handed two clauses **the caller's own fold**, so P20 decision 2's headline invariant compared one route with itself — W77's adequacy reader's shape, reintroduced one item later by the author who had read it, and it took the W77 revert from 4 to 8. **And a CONTROL that guards EMPTINESS does not guard VACUITY**: all three of this block's controls fell to the reader's *make each claim vacuous without tripping its control*, because a re-sourced list is exactly as non-empty as the one it came from — and one was ENTAILED by its own claim, so no tree could make it fire alone. **v0.18's clause FOLLOWED and SHORT for the third and fourth time**, after W63's block and W58's; replaced by IDENTITY controls, which refuse the two sides of a comparison BEING one value. **Projection at capture is what made run B immune and run A vulnerable, in one block.** Rule 8 final **33 probes, 20 caught, 12 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, all NINE reader edits checked in and digest identical at both ends; **W76's 25 and W77's 34 probes RE-RUN HERE — 23 + 28 caught, ZERO catches**, so the dated-ceiling clause yields nothing for the second plan running. **The author pass's one undeclared survivor was §7's `Promise.race`, armed AFTER the person had already resolved the parked task** — *a deadline written where its other side has already lost demonstrates the shape and cannot exercise it* ([Q325](doc/open-questions.md)) — and the restructure then put the defect back ONE LINE ALONG, which is why the readers matter. **Q323 also reproduced one line over inside the block written to close it**, and **a KILLED background harness kept running and mutated the tree under the author's own measurements**, reporting the killed rung as `EXIT=1  FAIL lines: 0` — zero cost, in the column that carries a real 10 ([Q327](doc/open-questions.md)). Q324-Q327 raised, Q328-Q329 spent, ADR 0059 skipped, W79 closed unissued; census **252 / 195 / 2 / 55**. *Read every status from the item's own file, never from this line.*

**[W77](doc/work-items/w77-what-start-returns.md) is DONE and [ADR 0058](doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md) answers [Q293](doc/open-questions.md): `runtime.start` returns `{ driver, done }` — a completion handle the RUNTIME keeps — and the package is `0.3.0`, BREAKING.** `done` resolves with the terminal `RunState` and **NEVER REJECTS**; there is **no deadline**, because *the deadline problem is solved by RETURNING a promise rather than by parameterising one* and `Promise.race([done, …])` is the consumer's one line; and what the runtime keeps is **ONE `RunState`, `step`ped per fold input**, which is `fold`'s own body (`for (const i of inputs) s = step(s, i)`) with the prefix kept rather than recomputed — a departure from P20 decision 2's LETTER that **`RN-R2`** licenses and that is recorded as one. `onFoldInput` is **COMPOSED rather than replaced**, a THIRD road beside the conditional spread and the `??` default, and **W76's binding FIRED BY NAME when it moved** (`expected: [] actual: ["onFoldInput"]`) — the ratchet working, moved deliberately. **All four stop-and-asks answered by the maintainer, three as recommended and (c) REVERSED from the plan's own lean on a measurement.** `failRun` appends the `stopped` element BEFORE calling `onRunFailure`, so a driver refusal is ALREADY TERMINAL and resolving does not hang; and on the one refusal class that is reported AND rethrown — `start()` has the caller on the stack — the reject road rejects a promise **the caller never receives**, measured in a child process with no listener at **exit 1, the process DIED**, on an authoring error the consumer had correctly caught. **Fact 5c was STALE and W76 is what made it so**: re-taken with the five lanes run separately it is **31 errors in 2 files, not 30** — and *two files* is the scope of FIVE TYPECHECK LANES, where the reference's snippets are a **SIXTH** that no typechecker reaches, so the gate went red at `X3`/`X4`/`X5` after all five were green and the work was in three files. *The price is a count of USES of the returned value, not of `start` call sites* — 24 sites, 19 errors, and one file's twelve collapsed to a single edit. L1-L5 **44 / 1269 in five runtimes** from 1251; **L6 UNMOVED at 1627 / 53** in both; `check:docs` 33 snippets — 27 run, 6 check — UNMOVED. **Its conformity reader's central obligation came back with TWO disagreements of five**, and both are sharp: the *"exactly three doors into `failRun`"* table is wrong in BOTH directions — it lists a row that is not a door and omits **`resolve()`**, which is a door AND the distinct caller-visibility class that matters most, being the only road out of `awaiting_action` — and **the retention comparison DOUBLE-COUNTS**, because `v8.serialize` on two roots cannot see that a fold's `result` fields point into the array it was folded from, so *`done` retains HALF of what the copied block does* is really **about the same, ~2% less** (87.6 KiB against ~89.7). *The identity measurement that falsifies the sum was printed three lines above the arithmetic*, the harness's own closing line said only LESS, and the upgrade to HALF was added on top of it in three places including shipped source. **The decision survives on a weaker and truer claim, and the honest residue got BIGGER**: a consumer who kept no completion machinery now pays a copy AND a `structuredClone` per settlement they did not, since `freezeInput` clones only where an `onFoldInput` is present and `start` now always installs one ([Q320](doc/open-questions.md)). **Its adequacy reader falsified P20 decision 2's OWN NAMED SENTENCE** — *an item that reimplements either has broken this decision, and that is the sentence its adequacy reader should try to falsify first* — by inlining `isTerminal`'s body into the runtime for ZERO, and by computing `done` from `fold(driver.foldInputs())`, which makes the headline invariant one route compared with itself; both are closed by a SOURCE binding, because what separates the mechanisms is retention and time and no rung weighs either. It also found **the `stuck` row reaching `failed`** — the row asserted *settled*, *terminal* and *agrees with the fold*, all of which `failed` satisfies, so one of the four outcomes ADR 0058 rule 3 enumerates had no observer anywhere. **`RunHandle` shipped DECLARED AND UNEXPORTED** for the whole author pass, because the sub-path's type export is an ALLOWLIST and a `export type` is erased — and writing the both-ways binding found `RuntimeRegistry` missing too, then widening it to the list found **`BootstrapRegistry`, the first parameter type of the exported `bootstrap` function**: *three in one allowlist is the argument for binding the list rather than adding the names.* Readers 11 / 6 blocking and 48 mutations / 25 survivors / 4 blocking, **overlap 2 — the FORTY-EIGHTH measurement**, the shared subjects being the real-pool gap and one `AGENTS.md` comment. Rule 8 final **34 probes, 1 control green, 28 caught, 5 declared ceilings RUN, 0 undeclared survivors, 0 crashes, 0 aborts, 0 against declaration**, all NINE reader edits firing, digest identical at both ends; **W76's 25 probes re-run HERE: 23 caught, 1 ceiling, ZERO catches.** **And the final pass RAN FOR 2.5 HOURS on one probe before a human asked whether it was stuck**: the real-pool case added for a READER's finding awaited `done` unbounded, and `CLAUDE.md`'s own *a scheduler never shut down keeps the process alive* turns the exit-13 the author pass had already closed into **no verdict at all** — *the fix for a reader's finding reintroduced the defect the author pass had just closed, one case over*, which is rule 8's founding observation and exactly what v0.8's re-run exists for. Killing that harness then left the tree **MUTATED**, because an undo clause and a content digest are both about a probe that RETURNS ([Q323](doc/open-questions.md)); restored by hand to the starting digest exactly. Q320-Q323 raised and Q324-Q327 taken by W78; census **248 / 191 / 2 / 55** at that item and **252 / 195 / 2 / 55** now. *Read every status from the item's own file, never from this line.*

**[W76](doc/work-items/w76-what-start-accepts.md) is DONE and [Q297](doc/open-questions.md) is RESOLVED: `onRegionEvent` is FORWARDED, and the two hand-written lists that let it go missing are BOUND BOTH WAYS.** Two lines in `src/scheduler/runtime.ts` — **prediction 1 holds** — with `src/driver/driver.ts` UNEDITED, **L6 UNMOVED at 1627 / 53** in both runtimes, L1-L5 **44 / 1251** in five runtimes, and `check:docs` **RED on `X4` first, exactly as P20 fact 2 p2 predicted**, then green at **33 / 27 / 6 unmoved**. **It corrects the plan in THREE places and the sharpest was found by its own test failing: P20 fact 1's table is NOT A PARTITION** — `2 / 6 / 6 / 7` is 21 slots over 18 members, because road (c) was read off `RuntimeOptions`' DECLARATION and four of its six are not `DriverOptions` members; derived from what `start` FORWARDS it is `2 / 6 / 2 / 7 = 17`, with `onRegionEvent` the eighteenth. *The conclusion survives and only the arithmetic under it failed, because the orphan count is 1 either way and the harness prints four road sizes and never adds them up* ([Q316](doc/open-questions.md)). Also: §10 has **no README twin**, so `X8` never fires on this item; and fact 1 reads the `Pick` and not the interface, so `runId` is on TWO roads — which [W71](doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md)'s conformity reader had measured one plan earlier and which never reached the fact. **The adequacy reader's central finding is that the forwarding was bound at EXACTLY ONE TOPOLOGY** — a two-branch `fanout` at depth 1 — and could be narrowed for ZERO three ways: four of six event variants dropped, every NESTED region's events dropped, every `map` region's events dropped. **The answer taken is an EQUALITY rather than more shapes**: what `onRegionEvent` receives IS the region subsequence of what `onFoldInput` receives, element for element, which is total over variant, kind and depth and closed FOUR survivors at once — *when a claim is bound at one shape, look for the invariant the shapes are instances of before enumerating them.* (Value equality and not identity: `freezeInput` gives `onFoldInput` its own frozen copy, and the first version of that assertion went red on its own first run.) Its conformity reader found **§10's regression guard UNREACHABLE** — `frozen.onRegionEvent` and `regionEvents` are written in one callback, so a regression removes the key and the membership check three lines up throws first, catching it with a message that says nothing about Q297. **W71's dated ceilings `f3`/`f3b` were RE-RUN HERE rather than at the retro** and yielded **one CATCH and one vacuous survivor**: this item consumed the site both anchor on, so their edits are now semantic no-ops that still match and rule 7 (b) cannot abort ([Q317](doc/open-questions.md)). Readers 19 / 7 blocking and 25 mutations / 14 survivors / 8 blocking, **overlap 2 — the FORTY-SEVENTH measurement** — and **both shared subjects are ONE LITERAL reached from opposite ends**. Rule 8 final **25 probes, 1 control green, 23 caught, 1 declared ceiling RUN, 0 undeclared survivors, 0 crashes, 0 against declaration, 3 aborts all re-anchored and then caught**, digest identical at both ends of every pass; **all NINE of the readers' edits FIRE**. Two late exceptions, both found by a reader running `git diff --name-only` by hand. Q315-Q317 raised, Q318-Q319 spent; census **244 / 187 / 2 / 55**. *Read every status from the item's own file, never from this line.*

**[P20](doc/plans/p20-what-the-runtime-owes-a-consumer.md) — *what does the runtime owe a consumer that the driver does not?* — declared 2026-09-19 on `817fd73` and **COMPLETE pending its retro**. Three items, serial, all DONE: **W76** (what `start` ACCEPTS — `onRegionEvent` forwarded, the two lists bound; no ADR), **W77** (what `start` RETURNS — a completion handle the RUNTIME keeps, **ADR 0058**), **W78** (the exit artifact — the run a consumer holds in one line, and L6 moves to 1639 / 55; no ADR). **Reserved W76-W79, Q315-Q329, ADR 0058-0059; W79 closed unissued, Q328-Q329 spent, ADR 0059 skipped.*** It takes [Q293](doc/open-questions.md) and [Q297](doc/open-questions.md), the two rows where a consumer on the road `AGENTS.md` recommends cannot do something they would ordinarily want — **and both were raised by items standing on that surface while doing something else**, which is the signature of a layer no plan has aimed at. **The maintainer's framing was CHECKED rather than inherited and it survived for a reason the framing did not give**: *what a consumer holds after `start()`* covers Q293 and not Q297, and what joins them is fact 1 — `DriverOptions` has **eighteen** members, a `createRuntime` consumer reaches them by exactly four roads, the partition is **clean with zero on two roads and exactly ONE on none**, and that one is `onRegionEvent`. So the subject is **what the seam passes through and what it owes**, and the rows are its two answers, different in kind: Q297 is a **pass-through the seam dropped**, Q293 a **composition only the seam can do**, because [ADR 0014](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) forbids the driver subscribing to itself. **Q297 alone would not have been a plan and the plan says so.** **Six facts measured first**, tree held still at digest `e3f998edc43e0498` over 360 files at both ends: **Q293's own stated case AGAINST is measured FALSE on a real `FyflowScheduler`** — exactly ONE fold input arrives before `start` returns (W67's number, reproduced), and a `.then` attached FIFTY macrotask turns after the run ended still receives `completed`, because **a promise RETAINS its resolution and the window is precisely what a promise is immune to**; **the *eight lines* are THIRTEEN copies and 135 lines in THREE disagreeing shapes**, ten with the microtask guard and no deadline, two with a deadline and no microtask, **exactly one with both**, while the reference's own prose calls the microtask *"load-bearing rather than decoration"*; **the half-fix for Q297 is FREE** — the `Pick` widened without the forwarding line is green on all five typecheckers, `npm test`, `check:source` AND `check:docs`, so a typed option is silently dropped — while **the whole fix turns `check:docs` RED** on a tripwire §10 set on purpose; `{ driver, done }` costs **30 typecheck errors in 2 files** and `Driver & { done }` costs **ZERO**; and a run with a person in the loop is `awaiting_action`, **not terminal**, so a terminality-waiting `done` **never settles** — the sharpest stop-and-ask. **The declaration records its own fact 5 wrong TWICE before it was right**: once measuring the probe rather than the consumers, once reading ONE typechecker's answer as the tree's, because `npm run typecheck` is five lanes chained by `&&` — *a chained rung reported RED reports its FIRST failure and is silent about everything downstream*, which is section 4's clause one step out, recorded at one occurrence. **It DEPARTS from P19's *slices beyond* and records why**, on P19's own precedent for a departure: slice 2's condition did not fire (prediction 3 UNTOUCHED) and slice 1, per-settlement validation, is **deferred rather than displaced** — *a gap outranks a price*. Census **CONFIRMED for the TWENTIETH plan running — 241 / 185 / 2 / 54**, none spent; Q293 and Q297 corrected and given owners, [Q289](doc/open-questions.md) declared OUT and deliberately not closed. *Read every status from the plan's own file, never from this line.*

**[P19](doc/plans/p19-what-a-schema-buys-an-author.md)'s three items [W72](doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md), [W73](doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md) and [W74](doc/work-items/w74-the-assists-and-the-exit-artifact.md) (W72 and W73 on 2026-09-18, W74 built that day and committed at 00:17 on 2026-09-19 — the only item in nineteen plans to cross midnight), and **the retro run 2026-09-19: ONE change adopted, FIVE refused. The next plan starts at W76, Q315 and ADR 0058** — derived by grep off the tree, never from this sentence.

**[P19](doc/plans/p19-what-a-schema-buys-an-author.md) is COMPLETE and RETRO'D, `doc/workflow.md` is [v0.20](doc/workflow.md), and its central finding is that the plan's own EXIT ARTIFACT — an authoring session `npm run gate` EXECUTES — can have every one of its eight claims made a TAUTOLOGY at `check:docs` exit 0.** Re-measured at the retro on the tree that ships: eight guards neutralised in `AGENTS.md` and in `README.md` (which `X8` holds byte-equal), `check:docs` **EXIT=0**, all eight checks `ok`, **27 `run` snippets** counted. **THE ONE CHANGE: rule 8 obligation (b) gains that where an `Outputs` row IS an assertion, the set makes each of its claims a TAUTOLOGY rather than deleting it** — deleting is what `X4` and `RUN_FLOOR` already catch, and `X4`'s *asserts something* is measured as **contains a `throw`**, a PRESENCE test by construction over all 27. It is **section 5 rule 3 made provocable**, exactly as v0.8 made rule 4 provocable as obligation (c), and it is **P3's own criterion running out**: P3 answered *move the load-bearing claims into assertions*, and a claim moved into an executed assertion is bound by that assertion's presence and by nothing else ([Q310](doc/open-questions.md)). **Name the rung, and P19 splits into two populations that answer it opposite ways: THIRTY-TWO BLOCKING findings across the six reader passes — 12 conformity, 20 adequacy, one subject shared — and EXACTLY ONE of the thirty-two names a rung.** That rung **FIRED, on the shipped tree, and the author did not read it** — `check:docs:selftest`, a gate entry, exits 1 because the *unclosed fence* probe now deletes the LAST fence in the reference, which is section 15's, so it trips `[X1,X8]` against its declared `[X1]`; W74's own table predicted the self-test unmoved *"to be measured at the build"* without taking the measurement, and its conformity reader took it. The other thirty-one have no rung, and **EIGHT were found at a DECLARATION STEP** — including the plan's largest finding, that the shipped corpus was miswired NINE ways on the five arc shapes the plan's own fact 3 never counted. **The items' own *What broke* lists are thirty-two MORE entries and those are the healthy half — TWENTY-ONE name a rung that fired and twenty of the twenty-one were read correctly**, the twenty-first being that same self-test; eleven have no rung and EIGHT of those are in the INSTRUMENTS. **REFUSED, five**: a `doc/` check for the EIGHTEENTH time — and P19 supplies the first instance machine-comparable in PRINCIPLE that a check would still have PASSED, because W74's fact D was wrong from being RUN TWICE with different options rather than from never being compared; the dated-ceiling HAND-OFF a second time, since P18's counter-measure cannot reach a value a later item moves that the earlier one could not name; an `Owns` pre-declaration rule for the SEVENTH plan, the first on which naming the three files would have been wrong on EVERY item; `PAGE ERROR` as a fourth secondary signal, which section 4's clause caught while naming zero; and a rule for [Q272](doc/open-questions.md) at eight instances, which `CLAUDE.md` already carries. **All 24 declared ceilings RE-RUN, ZERO catches** — 22 on their original anchors and **two of W72's ABORTED because W73 moved the values they anchor on**, re-anchored and both holding. **Rule 8 across the plan: 243 provocations, 214 caught, 24 ceilings, 2 measured, ZERO undeclared survivors, ZERO crashes, ZERO against declaration, 10 aborts all rule 7 (b) and all re-anchored.** **v0.19's environment clause CONFIRMED and it fired on the RETRO's own shell**; v0.18's two changes both fired; **v0.17's enumeration clause fired in all three items and every time a READER instantiated it.** **Predictions: 1 CONFIRMED with its reversal condition measured REAL and routed around, 2 CONFIRMED on the shipped tree and FALSE on the first cut, 3 UNTOUCHED, 4 CONFIRMED a third and fourth time.** Readers six passes, overlaps 1, 1, 1 — the forty-fourth to forty-sixth measurements — **and P19 adds a third road neither role's description names: two of its sharpest findings came from a reader with NO MUTATION AT ALL.** Census **241 / 185 / 2 / 54**, confirmed for the NINETEENTH plan; [Q142](doc/open-questions.md) did not fire and was measured BEFORE the record step. W75 closed unissued; Q308-Q309 and Q313-Q314 spent; ADR 0057 skipped. *Read every status from the plan's own file, never from this line.*

**[W74](doc/work-items/w74-the-assists-and-the-exit-artifact.md) is DONE and it is P19's EXIT ARTIFACT — an AUTHORING SESSION a human can watch, executed by `npm run gate`, and it takes NO ADR.** `src/definition/assist.ts` is a ROOT export beside `checkWiring` (two lines: the `export *` and the JSR allowlist entry, on `wiring.ts`'s own precedent of one item earlier): **`pathsOf`** — every path a value may carry, its types, and whether every step from `$` is REQUIRED, which is what an author needs before writing `a.b.c`; **`tryTransform`** — the sample-and-diff loop, and it is a SUBSTITUTION over `checkWiring` rather than a second evaluator, so the per-element evaluation rule W73's adequacy reader found is inherited rather than rediscovered; **`signatureOf`** — the TypeScript a worker's author writes against, as TEXT, 32 lines and no dependency. **`AGENTS.md` section 15 is the session** and `README.md` carries it byte-equal as its THIRD snippet under `X8`: a flow, a miswire the check names before anything runs (*consumer requires "text", producer does not guarantee it*), the producer's paths, a first transform that FAILS on its declared example, **ONE expression edit** that passes, the generated signature, and the run completing at `{ words: 3 }` on a real `createRuntime`. **All three stop-and-asks answered by the maintainer the same day, each as recommended; ADR 0057 NOT taken** — decision 9's substance (no build step, no dependency, *types catch the SHAPE and not the constraints*) is intact and the departure is in its wording. **Two declaration facts are about what the plan's own corpus CANNOT do**: the enumerator must accept a schema `schemaProblem` REFUSES, because the map record the check derives is the one shape a join successor's author most needs ([Q306](doc/open-questions.md)); and **`echo`, the consumer of BOTH transformed arcs in the L6 corpus, refuses 0 of 9 probe values** — its `inputSchema` is `{"examples":[{"a":1}]}` — so a TYPO in that flow's shipped transform still reads `transform-passes`, and the session had to bring its own two workers with OPPOSED schemas. *A loop's discriminating power belongs to the CONSUMER.* L1-L5 **44 / 1234 in five runtimes**; **L6 UNMOVED at 1627 / 53** in both runtimes, which is what an item adding a reading rather than a dispatch must show; `spec/` **UNMOVED at 7 / 61 / 107 with C4 at 34** — and the `Spec: NONE` CRITERION was WRONG while its conclusion held, because it would have kept W73's own check out of the spec too ([Q312](doc/open-questions.md)). **Readers 15 / 4 blocking and 39 mutations plus 5 by construction / 14 real / 5 blocking, overlap 1 — the FORTY-SIXTH measurement — and the conformity reader's central obligation came back with ZERO disagreements on the VALUES**, having derived every path, every verdict's exact `why`, both signatures character for character and the run's result from the schemas alone before reading any output. **What it found instead was a RED GATE ENTRY and a measurement stated BACKWARDS**: `check:docs:selftest` exits 1 because the `unclosed fence` probe deletes the LAST fence in the reference, which is now section 15's — a snippet `X8` PAIRS — so it trips `[X1,X8]` against its declared `[X1]` (rule 7 (c) discriminating exactly as designed, in a row this item had predicted unmoved *to be measured at the build*); and the *one measured difference* against `json-schema-to-typescript` was the REVERSE of what both tools emit, in the reference, the module header, the item's own fact and **a priced reason in a stop-and-ask** — the harness was run TWICE, once passing an option that CLOSES what a schema leaves open, and the later run's LINE COUNT was kept beside the earlier run's CONCLUSION. *v0.12's second question — was what it RAN what it CLAIMS — on a measurement rather than on a check.* **Both readers found `pathsOf`'s bare `in` independently**, one from `schema.ts`'s own `own()` helper and W65's comment thirty lines from the module it imports, one by construction with no mutation: a schema requiring `toString` enumerated as if the key were described while `checkWiring` gave the same arc a `no` NAMING it — the assist contradicting the check it exists to explain. The adequacy reader's other four: **section 15's seven guards are each tautologisable at `check:docs` exit 0** and two of the seven claims had no other observer ([Q310](doc/open-questions.md)); the generated file's *both ways* binding was one-sided IN POSITION, so a declaration ABOVE the marker declaration-merges into the generated envelope and widens what the worker compiles against at `npm test` AND `typecheck` exit 0; two of `tsTypeOf`'s three no-`type` roads were deletable for zero and the third DISAGREED with `pathsOf` about one schema; and `TS_NAMES` was a seven-entry list bound to nothing with two dead entries. Rule 8 final **74 probes, 1 control green, 65 caught, 8 declared ceilings each RUN against the rung its reason names, 0 measured, 0 UNDECLARED survivors, 0 crashes, 0 against declaration**, six aborts on the run every one rule 7 (b) on an anchor this item's own fixes moved — one of which had been MIS-QUOTED when it was written and had never run. Q310-Q312 raised, Q102 / Q217 / Q272 / Q302 extended, Q308-Q309 and Q313-Q314 unused; census **241 / 185 / 2 / 54**. *Read every status from the item's own file, never from this line.* **W73 is the WIRING CHECK and takes NO ADR**: `checkWiring(registry, flow)` gives every arc one of five verdicts over five shapes of *what a node receives* (edge, branch, item, `JP-R12` record, `needs`) from the schemas the workers declare — fact 3's relation with its one leniency NAMED (Q305), a transformed arc verified by RUNNING the adapter's worker half on the producer's example or witness and saying which (Q301, Q263), the join record from what the check KNOWS because the subset cannot say `additionalProperties: <schema>` (Q306); **`FD-R4`** in `spec/flow-definition.md` **v0.21** — the entry payload at `start()` and a person's resolution at `resolve()` held to the worker's schemas ONCE each as REJECTED COMMANDS (`BoundaryRefused`, the driver unstarted, the task still suspended), ON by default, `validateBoundaries: false` forwarded by the runtime; a fixture corpus `spec/examples/wiring/` with one document per verdict, held to section 7 both ways; **fact 3 re-taken over every SHAPE found the shipped L6 corpus miswired NINE ways, seven on the bound W72's reader dropped**, closed by clamping the producer (Q302's other resolution). All four stop-and-asks answered by the maintainer as recommended. L1-L5 **43 / 1197** in five runtimes, L6 **1627 / 53** in both, `spec/` 7 / 61 / 107 with C4 at 34; readers 20 / 5 and 24 / 23 / 18 / 11 plus one constructed, overlap 1, the forty-fifth measurement — **the conformity reader found the check THROWING on two documents the validator accepts** (a region inside a map region, Q160's shapes), so prediction 2's *total* held of the corpus and not of the language until re-derived on paper; **the adequacy reader found `fits` lenient for ZERO five ways under fact 3's twelve controls**, and a map's branch task composing `"."` and transforming it sampled on the WHOLE array — a correct wiring read `transform-fails`; rule 8 final 90 / 82 / 7 declared / 0 undeclared; Q305-Q307 raised, Q300 and Q301 RESOLVED, census **238 / 182 / 2 / 54**. *Read every status from the item's own file, never from this line.* **W72** (2026-09-18 — [ADR 0056](doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md): `examples` is the schema subset's thirteenth keyword and an ANNOTATION, held to its schema at construction and read by no value check, OPTIONAL by the maintainer's answer to the item's stop-and-ask; every corpus worker declares `inputSchema` and `outputSchema` with an example; **`npm run check:workers` is the eighth gate entry**, running fourteen workers on their declared examples in 0.2 s and red on fact 6's wrong schema as its self-test's first probe; `spec/flow-definition.md` **v0.20**, no `FD-V` added; L1-L5 **41 / 1119** in five runtimes, L6 **1611 / 53** in both; readers 11 / 3 and 71 / 40 / 28 / 3, overlap 1, the forty-fourth measurement — the conformity reader found two output-schema bounds the workers' code does not keep past the example, which one run cannot see, [Q302](doc/open-questions.md); rule 8 final 79 / 67 / 9 declared / 0 undeclared; Q300-Q302 raised, census **235 / 181 / 2 / 52**. **The plan's seeded exceptions missed the three seams every new CHECK reaches — the manifest, `GATE_CHAIN`, and L6's carried-schemas literal — and L6 moved where the plan's row put it outside the item's gate.** *Read every status from the item's own file, never from this line.*) — [P18](doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) answered *can a flow and the runtime it needs be defined as two DOCUMENTS and a registry of names, with the library doing every instantiation?* **YES**, in three items — [W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md), [W66](doc/work-items/w66-the-runtime-entry.md) and [W67](doc/work-items/w67-a-flow-from-documents-on-real-workers.md) (ADR 0053, 0054 and 0055; `spec/flow-definition.md` v0.19, `spec/runtime-targets.md` v0.12; the corpus and `examples/` migrated; `createRuntime` in the scheduler sub-path; the exit artifact from two JSON documents). **W68 CLOSED unissued; Q278-Q292 all used and none spent, Q279 RESOLVED; ADR 0053-0055 all taken. The next plan WAS to start at W72, Q300 and ADR 0056 as *P19, strict mode* — **and it has: [P19](doc/plans/p19-what-a-schema-buys-an-author.md) is DECLARED under a different name, below.** *(This read **W71, Q297** until 2026-09-17, when [W71](doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md) took the id and spent Q297 — the THIRD consecutive day this sentence has been falsified by the item that expired it, after W69 and W70 did the same. Three items outside any plan, three corrections, and the item that made this one wrote the claim that it had corrected it BEFORE doing so: its conformity reader found all five copies standing, one of them in a file the item had edited in the same commit.)*** **[W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) is DONE — a getting-started example a consumer can copy: `AGENTS.md` §2 is now the P18-shape minimum (one worker file, two documents as literals, one `createRuntime` call), EXECUTED by the gate; `README.md` carries the same snippet held byte-equal by `check-docs`'s new `X8`, both ways; the old §2 program moved under §12 byte-identical. Built and gated 2026-09-17 — L0, `check:docs` (30 / 24, X8 over 56 lines), L6 UNMOVED at 1610 / 53 — and **BOTH READER PASSES RUN the same day**: 10 / 2 blocking and 19 mutations / 11 undeclared survivors, overlap 1, the FORTY-FIRST measurement, with the conformity reader's central obligation coming back EMPTY. Raises Q293. An item outside any plan, on W36/W37's precedent.** **[W70](doc/work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) is DONE — a flow that DECIDES on the runtime, and a custom group TYPE: `AGENTS.md` §5 gains decision + fan-out + join on `createRuntime` (two runs, two roads, `JP-R12`'s record read off `publish`), §12 gains a group factory with ADR 0055's six members counting its own acquisitions, `README.md` carries the routing snippet as its second, and `X8` is generalised to every README fence by a declared heading list, both ways. Built and gated 2026-09-17 — `check:docs` 32 / 26, self-test 33 / 33, L6 UNMOVED at 1610 / 53 — and **BOTH READER PASSES RUN the same day**: 10 / 3 blocking and 15 mutations / 11 survivors, overlap 0, the FORTY-SECOND measurement, its conformity reader's central obligation EMPTY too. Its rule-8 set caught its own `d2` against declaration and corrected W69's Record: a re-tag is caught by `X2`, not by `X8`; a DELETED fence is what measures Q102, and `X8` closes it for the README's snippets alone. Raises no question.** **The package reads `0.3.0` and the change is BREAKING** — [W77](doc/work-items/w77-what-start-returns.md) and [ADR 0058](doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md); it read `0.2.0` from W67 until then. **[W71](doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md) is DONE — the reference stops teaching a FAKE scheduler for a USE CASE.** *(This paragraph said IN REVIEW after the item's own file said DONE, written by the same hand in the same hour — section 1 rule 5's exact case, corrected at P19's declaration.)* Raised by the maintainer on 2026-09-17 while correcting `README.md`'s *the library imports the scheduler nowhere*: an example as a use case should not build a scheduler stub, though a test may. **Measured before and after by the same walk over `AGENTS.md`'s fences: fake-scheduler snippets 7 -> 2, real-scheduler snippets 7 -> 12** — the two that remain are the two put OUT, section 1's non-executing snippet and section 12's *driver with no scheduler at all*, which is the only documentation of the seam a caller passes its own scheduler through. Five snippets converted to `createRuntime` on a real `FyflowScheduler` — the human in the loop, what a join carries downstream, refusals, and both common mistakes — with five new worker modules under `examples/getting-started/`. **Its declaration step justified it better than its argument did**: the parked-task vocabulary is `suspended` and `awaiting_action` and NOT `user_action`, and the author's own first spike polled for the scheduler's word and HUNG FOREVER, which is the mistake the old snippet invited by delivering its own event to a stub it had built. **And the conversion found two things the fake was standing in front of**: `MissingJoinPolicy` is unreachable through `createRuntime`, which always supplies a policy, and `onRegionEvent` was a `Driver` option the runtime did not forward, so a consumer on the recommended road could not subscribe to region events at all — [Q297](doc/open-questions.md), CLOSED by [W76](doc/work-items/w76-what-start-accepts.md) — the snippet could assert it ONLY because it built the driver itself ([Q297](doc/open-questions.md)). *A fake scheduler does not merely fail to prove a claim; it lets the reference demonstrate an API its readers do not have.* Built and gated 2026-09-17 — `check:docs` 32 / 26, L6 UNMOVED at 1610 / 53 — and **both readers RUN 2026-09-18: 8 / 5 blocking and 33 mutations / 15 survivors in 11 findings / 6 blocking, overlap 2, the FORTY-THIRD measurement**, the conformity reader's central obligation EMPTY for the third pass running while its adequacy reader found the class-instance worker need not contain a class, *nothing is reported* a tautology, and the frozen-handles count not a membership. Findings acted on; rule 8 re-run. **An item outside any plan, on W36/W37/W69/W70's precedent.** **[P19](doc/plans/p19-what-a-schema-buys-an-author.md) is DECLARED — *what does a schema buy an author?* — and it DEPARTS from the name P16 gave it.** P16 called it *strict mode*: input and output schemas enforced at run time, a mismatch as a runtime refusal, a driver option priced first. **The maintainer's argument of 2026-09-18 is the reason for the departure and is recorded in the plan**: the schemas were for the AUTHOR — a person or an agent wiring a flow — so a tool can say whether an edge fits, help write the JSONata transform where it does not, and hand a worker's author a typed signature; a runtime failure is a different problem, and per-settlement validation is the expensive way to learn it. Three items, serial: **W72** (the contract — `examples` joins the built-in subset as an ANNOTATION validated at construction, ADR 0056, on input AND output schemas; every corpus worker declares both with an example; a conformance check that RUNS a worker on its input example), **W73** (the wiring check — a verdict per edge, static over the subset, transformed edges verified by running the transform on the producer's example; the two runtime boundaries no static check can reach, the entry payload and a person's resolution, validated ONCE each), **W74** (the assists and the exit artifact — path enumeration, the sample-and-diff loop, a generated-signature recipe, and an AUTHORING SESSION a human can watch). **Reserves W72-W75, Q300-Q314, ADR 0056-0057.** **Six facts measured before declaring**, in `dev-dist/p19/`: twelve honest output schemas for the fourteen corpus workers stay INSIDE the twelve-keyword subset (two workers are undescribable by construction — one throws, one returns a function); the validator's existing value check takes a declared example unchanged; a compatibility relation over the subset is **45 lines and TOTAL**, fourteen corpus edges fitting and **twelve controls, eight negative, every verdict as expected**; `json-schema-to-typescript` compiles all twelve with zero surprises, installed outside the repository with zero links; a sample generator is 28 lines and self-conforming, with its limits stated; **and the author's own schema for one worker was WRONG on the first attempt — a field named `arrays` is a COUNT — while the example written beside it CONFORMED to the wrong schema.** Only running the worker found it. *A schema and its example agreeing proves the schema is self-consistent and says nothing about the worker* — prediction 4 confirmed at the declaration, in the sharper direction, and it is why W72's check executes rather than reads. **Per-settlement result validation is OUT as a default**, a type-level JSONata interpreter stays refused, no runtime dependency, and the subset is the contract language — the enabling constraint that keeps the wiring relation decidable rather than a limitation. Census **232 / 178 / 2 / 52**, none spent by the declaration. *Read every status from the plan's own file, never from this line.* *Read every status from the item's own file, never from this line.*

**[P18](doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) is COMPLETE and RETRO'D, and `doc/workflow.md` is [v0.19](doc/workflow.md) — ONE change adopted, SIX refused, and its central finding is that v0.17's dated-ceiling clause was followed in the WRITING and not in the RUNNING, by the same item, on the same clause, in the same plan.** [W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) declared two ceilings whose stated reasons NAME the item that would expire them. W67 re-ran one — `b15`, as its own `a11`, saying so in the probe's `why` — and it holds; it did not re-run the other, `e7`, **whose reason is the words *a ceiling with a date***, and re-anchored at this retro that probe is **exit 1 on the `triage LOW` row**. *A clause that tells an author to re-run something tells the author who WROTE the ceiling, not the author who EXPIRES it.* **Forty-six defects. NINE rows name a rung that FIRED and those nine name ELEVEN firings** — two the L6 rung on the migration's own first run, four the source and docs checks (`S3`, `S6`, `S4`, `X4`), two a check's self-test, two L0 and L1, one rule 7 (b) — **and every one was READ correctly; a TENTH row names a rung that did NOT fire, which is the finding above.** Thirty-six have no rung, **seven of those are in the INSTRUMENTS**, and **SIX were found at a DECLARATION STEP — the highest of any plan**: an item re-running the facts it was handed found its own ordering impossible, the plan's group-refusal list wrong in BOTH directions, the plan's own SAMPLE unable to LOAD, its own `Spec` line's premise struck, a blocker the plan did not have, and a number in its own file stale by one item.

**THE ONE CHANGE: rule 8's requirement on the HARNESS gains that it asserts the ENVIRONMENT its rungs need.** Four of W67's probes came back CRASH on a correct tree and correct edits, because the shell had no `fnm use 24` and `npm run test:l6` resolved `node` to 16 — and **a rung that cannot START is indistinguishable in the report from a rung a probe took DOWN**. One occurrence, and the argument is the mechanism: every other requirement on the harness is about a probe that RAN — the control sees what a probe ADDS, the restore what it LEFT, the anchor what it MATCHED, the digest what MOVED — and **none of them can see a constant**. It is P15's *independent excludes downstream of the first's apparatus* one case out. **REFUSED, six, each with a measurement**: a `doc/` check for the SEVENTEENTH time — and this plan is the first to SATISFY the standing refusal's own criterion, since exactly one of its eight stale claims was a number a check could derive from another file and **W65 BUILT that check**, as `X7`, while the three remaining machine-comparable ones are all the REGISTER's and the only thing that can compare them is an untracked census parser ([Q253](doc/open-questions.md), third plan running); a check over a plan's SAMPLE ([Q292](doc/open-questions.md), four defects across three items — a sample cannot be EXECUTED, its `callModel` could not exist, and a typecheck would NOT have caught the parameter property that made it unloadable); a per-case catch in a looping rung, at **three** instances and its second refusal; a rule that a Gate line's claims are INSTANTIATED, at three instances, all reader-found and blocking, with nothing in rule 8 reaching a Gate line; a dated ceiling naming its expiring item as a HAND-OFF; and an `Owns` pre-declaration rule for the SEVENTH plan running.

**FOUR of FOUR predictions CONFIRMED — the second plan to record that, after P16, with P17 at three of four in between — and prediction 4 supplies a qualification to P10's reading.** Its reach prediction's measurement was taken **at the declaration**, on the very corpus its own scope column names, so confirming it tested the corpus and not the reach — **which is v0.14's scope column working exactly as adopted**, making a pre-confirmed reach prediction legible as one instead of letting it count as a test. What is genuinely new is prediction 2: **a derived prediction whose WORDING was stronger than any observable** — *byte for byte* met as CANONICAL JSON, because the captured key order is today's object literal's and not a rule's, so *reordered* in its own reversal column is not an observable ([Q284](doc/open-questions.md)) — narrowed by the item that met it rather than by a reader. **v0.18's two changes: both CONFIRMED.** The CONTROLS clause was **followed at the first opportunity and MEASURED** — W67's block names FIVE controls beside its claims, citing the clause in the code twice, and its `d3` probe measures what that buys: four edits and a NAME a reader sees in the diff, where before it was two integers; its limit is a THIRD layer with no membership at all, which the adequacy reader took out for three edits and an integer. The SAME-CLAIM clause was **followed and short a FOURTH time** — W65's Gate line enumerated both shapes of a node type and the class shape reached no driver suite — found the way the clause predicts, by asking what the CLAIM said of the member, and **no extension taken**. **All FOURTEEN ceilings re-run**: every one of W65's six ABORTED on its original anchor (rule 7 (b), because W66 raised `RUN_FLOOR` and W67 rewrote `run-flow.ts` whole) and were re-anchored here with a control; **eleven distinct claims HOLD**, four on re-anchored text, **one is a CATCH**, and **one's SITE no longer exists** — neither confirmed nor falsified, which no clause covers. **Readers six passes, none empty, overlaps 2, 2, 1 — the thirty-eighth to fortieth measurements**, sixty-one blocking, split 29 conformity / 32 adequacy; W67's conformity reader re-derived every expected value of both exit-artifact rows on paper and came back with **zero disagreements**. **Rule 8 across the plan: 219 provocations on the final passes, 192 caught, 14 declared ceilings, 12 measurements, 0 undeclared survivors, 0 crashes, 0 against declaration, 1 abort re-anchored and caught** — and the AUTHOR passes read **fourteen undeclared survivors themselves**, seven of W67's closed in the product. **Late exceptions 10, 10, 1 — twenty-one, zero undeclared** and a TWENTY-SECOND for the retro itself, because **[Q142](doc/open-questions.md) FIRED in this retro's own confirming gate on a tree to which it had added NO DOCUMENT**: the plan predicted and paid the FILE half (`M3` 90 -> 107) and left the LINK half, where the margin was **31 links** at W67's close, and the record step's six index paragraphs wrote 35 more into files neither `removes` probe cuts — `GATE EXIT=1` with ZERO FAIL lines in the LAST of twenty-nine chain entries. `M4` retuned **3960 -> 4450**, the ninth retune and the second consecutive one found by the gate. The seeded table predicted eight rows correctly and missed twenty-one, not one of which was predictable from a file SET. **Census CONFIRMED for the EIGHTEENTH plan running — 230 / 176 / 2 / 52, 230 of 230 in exactly one cluster cell** — by a parser written from scratch that was wrong in three directions first and whose two clean findings are corrected in the register: the headline stale by THIRTEEN through the whole plan, **Q289-Q292 in no cluster cell**, and **[Q206](doc/open-questions.md) resolved with no Resolved-table row** since W49 in P14. **W68 CLOSED unissued, Q278-Q292 all used and none spent, ADR 0053-0055 all taken. The next plan WAS to start at W72, Q300 and ADR 0056 as *P19, strict mode* — **and it has: [P19](doc/plans/p19-what-a-schema-buys-an-author.md) is DECLARED under a different name, below.** *(This read **W71, Q297** until 2026-09-17, when [W71](doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md) took the id and spent Q297 — the THIRD consecutive day this sentence has been falsified by the item that expired it, after W69 and W70 did the same. Three items outside any plan, three corrections, and the item that made this one wrote the claim that it had corrected it BEFORE doing so: its conformity reader found all five copies standing, one of them in a file the item had edited in the same commit.)*** *(This read **W69, Q293** until 2026-09-17, when [W69](doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md) — an item belonging to no plan — took both ids: a claim with an expiry date, falsified by the item that expired it and corrected by that item, found by grepping the tree for its own id.)* *(And **W70, Q294** until 2026-09-17 too, when [W70](doc/work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) took W70 and reserved Q294-Q296 without using them — the same sentence falsified on two consecutive days by two items outside any plan, corrected both times by the grep section 1 rule 5 prescribes.)*

**[W67](doc/work-items/w67-a-flow-from-documents-on-real-workers.md) is DONE and it is P18's EXIT ARTIFACT: a flow and the runtime it needs, from TWO JSON DOCUMENTS and a shim, on a real `FyflowScheduler` in both L6 runtimes.** `examples/registry.json` says what exists — **fourteen worker MODULES** where there was ONE file with a twelve-arm `role` switch, five resource groups, fifteen node types, one NAMED pool instance, three predicate names, one language — `examples/flows/triage.flow.json` names registry keys and nothing else, and `examples/run-flow.ts` is a SHIM: `createRuntime` once, the four things P18 decision 7 keeps as code (a predicate, a custom group TYPE, a custom node-type CLASS, a language adapter), and observers. **No `pool()` call, no group built by hand, no `Driver` built by hand and no role switch**; the binding that replaced `ROLES`, `Role` and the switch arms is the document's worker keys against the modules ON DISK, both ways. **L6 is 1610 assertions over 53 real runs in BOTH runtimes**, from 1502 / 50; L1-L5 **41 / 1112 in five runtimes**; `spec/` unmoved at **7 / 55 / 106 with `C4` at 34**, which is what an exit artifact's must be.

**Its declaration step found FOUR things wrong with P18's own SAMPLE and one blocker the plan did not have.** W66 recorded three (the sub-path, the signature, the missing `flows`); the fourth was measured here and nobody had it — the sample's `DailyBudgetGroup` uses a constructor **PARAMETER PROPERTY**, which Node 24 refuses at load (`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`), so **the sample does not run**. That is `RT-R9`, the rule `S4` enforces over `src/` and which reaches no plan document ([Q292](doc/open-questions.md): *a plan's sample is code, is read as a specification, and is executed by nothing*). **The blocker**: a registry DOCUMENT could not declare a group only NODES name, because `createRuntime` handed every declared group to `bootstrap`, whose direction-two refusal — *a group registered and used by nothing is the silent kind* — is right for a helper taking OBJECTS and wrong for a document declaring the SET `FD-V31` reads. W58's `gate` row is exactly that case. Measured, put to the maintainer, and fixed in `createRuntime` with direction ONE untouched ([Q291](doc/open-questions.md)). **[Q279](doc/open-questions.md) is RESOLVED** by the maintainer's answer: both manifests read **`0.2.0`** and `README.md` names the breaking change, measured — a `0.1.0`-era task node is refused by `FD-V23` and `FD-V17` at construction, by name, with the key it carries.

**The two `triage` rows carry every shape the exit artifact names, each read from the RUN and never from a literal beside the row**: a DOCUMENT type (`Prompt`) and a CLASS type (`GpuModel`) over the SAME worker, so the pools they built differ in their DERIVATION alone; a node on its type's DEFAULT instance (`audit`) and one on a NAMED instance of that type (`review` on `prompt-big`), told apart by the pool the scheduler says each ran on AND by what the worker returned — four words against two, because the class derives the model from the instance's config; a BUILT-IN group and a CUSTOM one acquired by real tasks, the custom one naming its object something other than its key; the TYPE's `settings` default reaching a `Prompt` node and not a `GpuModel` one; and a declared `transform` reducing `JP-R12`'s record for the node after the join, with no reshaping node. The HIGH row is the control: one payload field different, `review` never dispatched, the reduced report six words instead of eight. **Reverting each item at L6 on the tree that ships: W65 309, W66 1, W67 1** — and W66's group-member check removed costs **0**, a refusal with no live case, recorded rather than argued.

**Its readers found FOURTEEN and NINE, overlap 1 — the FORTIETH measurement — and the conformity reader's central obligation came back EMPTY.** It re-derived every expected value of both rows on paper — the dispatched ids, what each of six workers receives and returns field by field, the join's record, the transform's reduction, the pool each task ran on, the groups each acquired — and found **zero disagreements**. What it found were CLAIMS: the L6 count shipped stale by two in the two documents a reader opens first; *thirteen node types* where the document declares fifteen; a `heldGroups` comment arguing to exclude the two tasks the literal below it declares; `spec/flow-definition.md` still saying the runtime FOLDS the helper's both-ways refusal in; and the sharpest — **`run-flow.ts` said every non-threaded row runs the document AS IT IS ON DISK, and it does not**, because the document leaves `inline` unsaid on the two threadable types precisely so the knob can set it. *The assertion was right and the three sentences citing it were not.* The adequacy reader found **bounds that were not there**, every one in a direction the author's 45 probes never took: the custom group's name/key pair carried by a string inside the factory (**W59's own finding inside the fixture built to correct it**); **`poolOfTask`'s *read off the scheduler* falsifiable at ZERO** by the expression its own note names; clause (iii)'s stated reason false of every field it read; **Outputs (1) held by nothing anywhere**, since `S16`'s scope is the published set and `examples/**` is outside it; the whole per-row layer out for three edits and an integer; and **P18 decision 10's two defaults reached by nothing** — this plan's own shim is `runtime.start(flow, payload)` with NO options, the one call this rung never made. It makes it now, on `p1-routed-away` at LOW, where the two candidate policies DISAGREE: *the run completed* IS *the default is `live-token`*, observed rather than named.

**Rule 8: author pass 45 probes, 30 caught, TEN undeclared survivors, 0 aborts; final pass with the readers' sixteen exact edits checked in — 64 probes, 51 caught, 7 declared ceilings each RUN against the rung its reason names, 0 undeclared survivors, 0 crashes, 0 aborts, 0 against declaration, 6 measured**, the tree held still by a content digest, identical at start and end. **And a crash is not a detection, in the two blocks added AFTER the guard that says so** — W59 closed that shape for the row loop, and this item's own re-run found it twice in what W67 added: the SHIM RUN sits outside the loop, and block (2e) dereferenced `reports[-1]` when a row was repointed at another document. **Also: a harness that does not pin the runtime it MEASURES reports the environment as the product** — four probes came back CRASH on a correct tree and a correct edit, because the shell had no `fnm use 24` and `npm run test:l6` resolved `node` to 16; the harness refuses to start below Node 24 now, which is v0.11's control clause one step out, since a control cannot see an environment every probe shares. **Late exceptions ONE, zero undeclared** (`spec/flow-definition.md` §3, one sentence this item made false). **Census 230 / 176 / 2 / 52**, 0 aborts on a parser written from scratch that was wrong once — adding its three declared exempt rows to the three counts and not to the TOTAL — and said so rather than printing a plausible sum. `npm run gate` **EXIT 0, zero FAIL lines**, digest `37a8669ded4dcdb8` over 328 files before and after — the first run over the final tree was cut by a machine restart at its LAST entry with zero FAIL lines, and the second ran whole. Q289-Q292 raised, Q99 extended, Q279 resolved. *Read every status from the item's own file, never from this line.*

**[W66](doc/work-items/w66-the-runtime-entry.md) is DONE: a registry DOCUMENT and one call become a running scheduler.** `createRuntime(document, code, { base, flows })` in **`fyflow-orchestration/scheduler`** — **there is no `/runtime` sub-path**, P16 decision 5 as written, the maintainer's answer to P18's own stop-and-ask — resolves the document through W65's `resolveRegistry`, creates every group through a FACTORY (the scheduler's three built in, a custom one from `code.groupTypes`), resolves every relative worker url against the consumer's `base`, builds one pool per type instance through `bootstrap`, and exposes `runtime.registry`, the object it hands its own drivers (decision 14). `runtime.start(flow, payload, opts)` returns a STARTED `Driver`, minting `r<n>` when the caller gives no id and defaulting the join policy to `live-token`. **Its declaration step found [P18](doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decision 4 WRONG IN BOTH DIRECTIONS** — measured on 0.5.2, one omission at a time, each group holding a real task, identical in both runtimes: a group with no `getMetrics` (which the plan says to REFUSE) runs to `done`; one with no `onStart` THROWS; and **one with no `onFinish` leaves every task naming it RUNNING for ever, with `stats` reporting idle** — both of the last two marked OPTIONAL by the scheduler's own interface. So the plan's list refuses a group that works and accepts one that hangs a run in silence, which is [W33](doc/work-items/w33-a-map-at-run-time-arity.md)'s *N too small completes and is silent* one interface over. **[ADR 0055](doc/decisions/0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md)** takes the UNION — `canRun`, `onStart`, `onFinish` because the scheduler CALLS them, `getMetrics`, `id`, `type` because the interface requires them — refused by name against the group's key, with `EventTarget` measured NOT required; and **[S10](doc/scheduler-upstream.md)** raises it upstream, the first item that register has raised since W37. **Three more of this item's own lines had expired premises**: the third `RT-R` rule it was declared to write is impossible (ADR 0053 put the validator in the root and named the departure), so **`RT-R13`** is a CONSTRUCTION rule instead — only `src/scheduler/**` may construct a pool, a scheduler or a group, shipped with no live offender and checked by **`S16`**; the sub-path's name; and the signature and `flows` argument the plan's sample shim implies (W67 reconciles the sample). **Both readers found what the author's 34 probes had not.** The conformity reader (22 / 10 blocking): `runtime.registry` was described as *exactly the object this runtime hands its own drivers* and carried the document's predicate NAMES, so **a `Driver` built by hand from it refused a VALID flow under `FD-V4`** — with a probe; *both ways* for predicates and languages was checked ONE way; *L1 on real pools* had every call through a seam; and three documents plus the published source still stated the refusal list ADR 0055 supersedes. The adequacy reader (46 mutations / 22 findings / 13 blocking): every option `start` forwards and every member the runtime exposes was unobserved — **including the run's own PAYLOAD** — and its sharpest is in the instrument this item had just fixed: `check-source`'s `code()` read an apostrophe inside a template literal as a string delimiter and blinded `S2`, `S3` and `S4` over **16 137 characters of `driver.ts`** (nine of twenty published files carry one, and visibility depended on APOSTROPHE PARITY, so nothing ever went red); the replacement scan had the same hole one construct over, in a REGEX literal, and could also make `S16` FALSELY fire. Every finding acted on. L1-L5 **41 files / 1111 assertions in five runtimes**; **L6 unmoved at 1502 / 50** in both, which is the declared result for an item whose exit artifact is W67's; `spec/` **7 / 55 / 106**; `check:docs` 29 / 23; `check:source`'s self-test **65 / 65 probes, 44 / 44 noticed**. **Rule 8: author pass 34 probes with 3 undeclared survivors (a member's KIND unobserved, `live-token`'s default inert because every flow was linear, and Q102's ceiling mis-declared); re-run 52 probes, 50 caught, 1 declared ceiling RUN, 0 undeclared, 0 crashes, 0 aborts.** Readers 22 / 10 and 22 / 13, **overlap 2 — the thirty-ninth measurement**. Ten late exceptions, zero undeclared. Q285-Q288 raised; census **226 / 173 / 2 / 51**. `npm run gate` **EXIT 0, zero FAIL lines**, digest `7853dccf53418d37` over 311 files before and after — red once on the first run, on a probe`s declared set this item widened. *Read every status from the item's own file, never from this line.*

**[W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) is DONE and [ADR 0054](doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md) takes the name OFF: `type` is REQUIRED on every task node, `workerType` is RETIRED, and `spec/flow-definition.md` is v0.19 — 34 refusals over `FD-V1` … `FD-V38`, `FD-V5` and `FD-V34` held and deliberately absent, `FD-V38` new (a `pool` that is not an instance of the node's type).** [ADR 0053](doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md) is the built-in twelve-keyword subset (`src/definition/schema.ts`, **4 259 bytes bundled** — the 1.5 KB was the prototype's), a keyword outside it REFUSED naming it (Q278), fact 1's fourteen cases as fixtures. **The registry is a DOCUMENT** (`src/definition/registry.ts`): workers with four schemas, two enforced; node types as DERIVATIONS — the document form is the identity derivation and reproduces P18 fact 5's captured `WorkerManagerOptions` as CANONICAL JSON with `groups` ABSENT where none is declared (prediction 2, met as canonical JSON because key order is today's literal's — Q284), a class in code any other, both outputs through ONE check; every type has a DEFAULT instance built from its own config and a type whose config fails its own schema is REFUSED, not its nodes; named instances in `pools`; group types as factories with the scheduler's three built in. **Eleven named `RegistryError` classes**, each fixtured both ways, DISCOVERED from the module in the test; `resolveRegistry(document, code)` builds NOTHING — construction is W66's — and `new Driver` runs its SHAPE half (`checkRegistry`, six classes of eleven; three documents said "every" until the readers read them). **Every task node receives the envelope** and `FD-V33` reads the worker's `settingsSchema` over the type's defaults merged under the node's; `Registry.workerTypes` and `DriverOptions.workerTypes` are gone. **The corpus migrated — 74 flow documents, 199 sites — and `examples/**` with it**: the declaration step measured the item's own ordering impossible (24 of 24 L6 flows carried `workerType`, the harness read the old type shape), the maintainer chose to pay here, and L6 is thirteen document types over ONE worker entry with no `pool()` line and every pool through `bootstrap` — **1502 / 50 in both runtimes, the typed rows unmoved**, reverting the envelope on the bare road costing **114**; W19's foreign tasks must carry the envelope too, since every pool is a type's (Q280). L1-L5 **40 / 1065 in five runtimes**; spec **7 / 55 / 105 / 34**; docs 28 / 22 with a new `X7`; `check:spec`'s `C4` binds the spec's own count paragraph. **Readers 26 / 12 blocking and 21 mutations / 16 survivors / 12 blocking, overlap 2 — the thirty-eighth measurement**: the conformity reader found claims that were false (`checkRegistry`'s reach in three documents, the subset's size as the prototype's, `FD-C5`'s row not moved, `in` walking `Object.prototype` at three keyword sites, four refusal clauses with no fixture); the adequacy reader found bounds that were not there (the schema walk observed at depth 1 only, the driver's shape half with NO undeclared-key check on a worker — a typo'd `settingSchema` silenced the schema, closed in code — the transforming road dropping a type's defaults, no class-form type reaching `new Driver` in any suite, the item's own Gate line). **Rule 8: author pass 80 probes, 65 caught, 6 declared ceilings each RUN, 6 measured, 1 undeclared (the spec's own count, closed) and 1 abort (a moved anchor whose reading found a hand-written list, closed); re-run 103 probes, 91 caught, 6 declared ceilings each RUN, 5 measured, 0 undeclared, 0 crashes, 0 against declaration on the final pass, 1 abort re-anchored and caught.** Ten late exceptions, zero undeclared. Q280-Q284 raised, Q217 extended; census **222 / 169 / 2 / 51**, 0 aborts. `npm run gate` **EXIT 0, zero FAIL lines, on the first run over the final tree**, digest `fac808027713cc4d` over 311 files before and after. *Read every status from the item's own file, never from this line.*

**[P18](doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) is DECLARED — *can a flow and the runtime it needs be defined as two DOCUMENTS and a registry of names, with the library doing every instantiation?* — and it is the FIRST plan to take a name OFF the definition grammar.** A task node's `type` becomes required and `workerType` RETIRES (ADR 0054), so every task node receives the envelope and `FD-V23`, `FD-V32` and `FD-V34` fold into one rule; a node type is a DERIVATION from an instance's config to pool options — the document form is the identity derivation, a class registered in code is any other, and both outputs pass the same validation; the WORKER owns four JSON schemas (`configSchema`, `settingsSchema`, `inputSchema`, `outputSchema`) and a built-in SUBSET validator checks the first two at construction — **ADR 0053, the maintainer's choice at the draft**: 32 lines and 1.5 KB bundled, 14 of 14 on the sample, against `@cfworker/json-schema` at 42 KB and `ajv` at 262 KB (more than jsonata); resource groups are FACTORIES `{ configSchema?, create }`, the scheduler's three built in with their three different constructors adapted, a custom class registered the same way; **every type has a default pool instance built from its own `config`**, a type whose config fails its own schema refused at construction (the maintainer's *must be present in the registry*), a node naming `pool` for a named instance of its type; `createRuntime(document, code, { base })` builds groups, pools, languages and the driver's registry from names and `start()` returns a `Driver` with a minted run id. **What stays code is exactly what is the consumer's**: predicates, language adapters (the runtime imports NO engine — ADR 0052 rule 4 kept, decision 13), custom group types, custom node type classes. Three items, serial: [W65](doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) (the registry document and its types, the validator, the grammar, the corpus migrated — ADR 0053 and 0054), [W66](doc/work-items/w66-the-runtime-entry.md) (`fyflow-orchestration/runtime`, `AGENTS.md` §12-§14 as calls), [W67](doc/work-items/w67-a-flow-from-documents-on-real-workers.md) (the exit artifact: the sample flow from two documents on real workers in both L6 runtimes, `examples/` with no role switch and no `pool()` call, the revert costs). **Nine facts measured before declaring, identical under Node 24.20.0 and Deno 2.9.6** (`dev-dist/p18/facts.mjs`): two pools over ONE worker URL are two pools; `bootstrap`'s exact options captured as the identity target (a `groups` key ABSENT when none is declared, not empty); the `ResourceGroup` interface requires `canRun` and `getMetrics` and makes `onStart`/`onFinish` optional with `(key?, cost?)` — which corrected the draft's construction check and its sample; **146 of 166 corpus task nodes carry `workerType` and every one of eleven roles reads its payload whole**; `idleTimeout: 0` with a contended resident group DEADLOCKS on 0.5.2, the waiter `pending` for ever with `stats` reading idle, exactly as upstream's reference says — so decision 9's refusal is of something real; a pool's `inline`, `maxThreads`, `groups`, `residentGroups` and `config` are readable own fields; a worker URL built from a base loads in a real thread; and **`M3`'s one-directory fixture was PREDICTED to trip on this declaration's four documents from the count (89 against 90 with the draft alone) and did** — retuned as the declared exception the plan's fact 9 named, Q142's shape predicted rather than found. Prediction 4 (the reach: the subset covers what the corpus needs) is already confirmed on the sample and kept as a reach over what a consumer will write. The exceptions each item will take are SEEDED in a table at the declaration, from three plans' late tables — P16's refused procedure applied as a table rather than a rule. **Q278 raised and decided for W65** (a schema keyword outside the subset is REFUSED at construction, never ignored — ignoring is W43's zero-score shape one layer up) and **Q279 raised with no owner** (retiring `workerType` breaks every flow document and nothing signals it; `0.1.0` to `0.2.0` at W67's close is the smallest honest move). Census **217 / 164 / 2 / 51**. Baseline re-taken at the declaration: L1-L5 **38 / 979 in five runtimes**, L6 **1501 / 50 in both**, spec **7 / 55 / 104**. *Read every status from the item's own file, never from this line.*

**[P17](doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md) is COMPLETE and RETRO'D, and `doc/workflow.md` is [v0.18](doc/workflow.md) — TWO changes adopted, SIX refused, and its central finding is that v0.14's membership clause, FOLLOWED by the item that extended the list, named the claims and not their CONTROLS.** W63 added eight subjects to `CROSS_ROW_SUBJECTS` for its ten assertions and left out the two that make the others non-vacuous; its adequacy reader deleted the positive fixture, made the validator accept every document, lowered `CROSS_ROW` and `DECLARED_TOTAL` by one, and ladder L6 was green in BOTH runtimes at 1498 — **and the retro then measured W58's block the same way and it was green too**, live for a whole plan under the clause written to prevent it. Thirty-two defects across the plan; **SEVEN had a rung and all seven fired and were read correctly**, three of them this document's own instruments doing what they were adopted for (the content digest catching a rung rewriting `deno.lock`, rule 7 (b) on eight moved anchors, the dated-ceiling clause catching two of W62's ceilings inside W62); eleven of the twenty-five without a rung were INSTRUMENTS — anchors, runner patterns, a copy script, a heredoc, a NUL byte, an untracked harness. **THE TWO CHANGES.** **(1) Obligation (d)'s membership names the CONTROLS beside its claims** — two occurrences, two plans apart. **(2) Obligation (a)'s enumeration is instantiated under the SAME claim on every member** — W63 carried `FD-C5`'s first kind only under a failing transform and its Scope said *one flow carries the four kinds* of a flow that carries three: the third time in two plans the enumeration clause was followed and short, one occurrence with the argument that an enumeration is of the values a CLAIM ranges over. **REFUSED, six, each with a measurement**: a `doc/` check for the SIXTEENTH time (six stale counts this plan — an expiry-dated sentence, a pin in prose, 1497 within the hour, *thirteen* worked flows, *twenty-one* runs, the register's headline — and exactly ONE a check could compare without reading English, the headline against the census parser's own sum, which is untracked: [Q253](doc/open-questions.md) extended); an `Owns` pre-declaration rule for the SIXTH plan running, with P16's *seed from the previous item's table* procedure TRIED once and working — late exceptions 2, 5, 2, zero undeclared, W63's both predicted; a crash-verdict pattern rule ([Q276](doc/open-questions.md)); a declared-value-not-the-default rule ([Q275](doc/open-questions.md)); a Scope-against-Outputs check; a restore set covering files a RUNG rewrites (v0.17 change 1's limit, recorded). **THREE of FOUR predictions CONFIRMED and the reach prediction REVERSED from the engine's own SOURCE before its probe ran** — P10's reading a seventh time — with a new shape on prediction 2: its reversal condition was measured TRUE (a `setup()` throw is a worker error the run never hears of) and the prediction held because the maintainer's stop-and-ask chose the road around it. **v0.17's three changes ALL CONFIRMED**, and the dated-ceiling clause did its work inside the items: this retro re-ran all **FORTY-SIX** declared ceilings through each item's own harness (ten, twenty-three, thirteen) and every one holds, three on re-anchored text, **ZERO catches** against P16's two of twenty-three and P13's two of eleven. **Rule 8 across the plan: 272 provocations, 214 caught, 46 ceilings run in the items and re-run here, 9 measurements, 0 undeclared survivors, 0 against declaration on every final pass, 8 aborts every one re-anchored**; the author passes found four REAL survivors on their own and closed them. **Readers six passes, overlaps 1, 1, 1 — the thirty-fifth to thirty-seventh measurements, band unmoved.** **Late exceptions 2, 5, 2 — nine, zero undeclared.** **The scheduler's reference is silent on a SIXTH fact** — its default retry budget is zero — learned by deleting a declaration and watching nothing change. **Census CONFIRMED for the SEVENTEENTH plan running — 215 / 162 / 2 / 51**; the retro raises no question. **W64 CLOSED unissued, Q277 spent, ADR 0051-0052 taken. The next plan starts at W65, Q278 and ADR 0053 — P18, what a node type SAYS about its input and output.**

**[W63](doc/work-items/w63-a-transformed-join-on-real-workers.md) is DONE and it is P17's EXIT ARTIFACT: a typed join successor reducing `JP-R12`'s record through `$sum([*.score])` with NO reshaping node, on a real `FyflowScheduler` in BOTH L6 runtimes, at arities TWO, ONE and ZERO — its worker receiving 990, 400 and 0, every one a NUMBER, read off the outcome record and never a literal the row alone carries ([Q263](doc/open-questions.md) as three rows); the same flow's typed `map` branch reshaping its own item through a transform reading `$settings`; and decision 5 end to end — two non-optional nodes whose transforms FAIL at run time (`T2002`, `UNBOUND`) retried once under the TYPE's policy, parked `user_action` with `TransformFailed`'s message on two observers, resolved by a person, the run completing.** No ADR. **Reverting each item at L6 on the tree that ships: W61 52, W62 19 (from W62's own 0 — the `$now()` row observes the shadows and every reshaped item's `markedKeys` the markers), W63 52.** The `Echo` pool that evaluates the expression is a real THREAD in both runtimes, loading `fyflow-orchestration/jsonata` by its module URL, and every result it returns reports the fresh realm it ran in — a claim that had NO observer until the adequacy reader said so. L6 **1501 / 50** from 1281 / 46 in both runtimes; L1-L5 **38 / 979 in five runtimes, unmoved**; spec unmoved at 7 / 55 / 104; the corpus split **16 / 166 / 150** in two declared spec exceptions; census **215 / 162 / 2 / 51**. **Two facts measured before a row was written**: which JSONata expressions MARK their arrays (`$keys($)` does, `[*.score]` does not), so the reshape carries a real marked sequence for the worker to observe plain; and **the scheduler's default retry budget is ZERO** — a type declaring zero retries was measured INERT by the first probe to delete it ([Q275](doc/open-questions.md)), so the type declares one and a failing transform is evaluated twice before it parks. **Readers 7 / 1 and 18 / 8 / 2, overlap 1 — the thirty-seventh measurement.** The conformity reader found a count stale within the hour (`examples/README.md` at 1497 while `l6.ts` declared 1499) and a stated reason that was false (JSON text DOES tell `0` from an absent key — `inputType` is a second observer, not the only one); the adequacy reader found **the two CONTROLS of the new cross-row block absent from `CROSS_ROW_SUBJECTS`** — a validator accepting everything green in both runtimes with two counts lowered, v0.14's *a count is not a membership* one layer inside the membership list — the thread claim with no observer, **`FD-C5`'s first kind carried by no successful transform** (the exit-artifact flow's entry must return an array, so it is untyped; the failure-road flow gained a fourth branch), and that **the reduction is key-blind**: `JP-R12`'s `{}` handed as `null` and the collection keyed off `branchPath` both leave the three `transformed` rows green, their observers being W17's `all-exit` row and the failure flow's untyped `publish` — so the rows say what the successor RECEIVED and nothing about the record's shape, and they now say so. **Rule 8: 82 probes, 1 control green, 62 caught, 13 declared ceilings each RUN against its rung, 6 measured, 0 undeclared, 0 crashes, 0 aborts, 0 against declaration on the final pass** — the author pass read two REAL survivors (both closed), two crashes and an abort that were the instrument (a comment-line prefix anchor; the browser runner's `FAIL` at two spaces where Node's is four, [Q276](doc/open-questions.md); W61's revert anchor for an envelope that is one expression on this tree), and one ceiling CAUGHT against its declaration (the reach clause refuses a query-string spelling of the sub-path entry — stricter than its author believed). **A deleted MIDDLE L6 row renumbers every run after it** ([Q274](doc/open-questions.md)): 15 of a deletion's 17 failures were the next row's ids, and only the last row measures the membership layer, where **2** cross-row clauses stand. `npm run gate` **EXIT 0, zero FAIL lines, on the FIRST run over the final tree**, digest `f61a83a91297a356` over 296 files before and after. Late exceptions **two** (`AGENTS.md`'s two stale counts — *two* typed flows, *thirteen* worked flows over a directory of twenty-two; the split's second move), zero undeclared. **And the register's headline had been stale by W62's own three rows** (209 / 156 where its parser said 212 / 159), corrected here. Q274-Q276 raised, Q263 shown not resolved, Q277 spent.

**[W62](doc/work-items/w62-the-jsonata-adapter.md) is DONE and [ADR 0052](doc/decisions/0052-a-second-dependency-is-declared-where-its-one-sub-path-is-reached.md) decides how a SECOND dependency is declared when ONE sub-path reaches it: `jsonata` 2.2.2 in `dependencies` at the EXACT pin and `npm:jsonata@2.2.2` in `deno.json` (no JSR package carries it) — the maintainer's choice, with the optional peer and `optionalDependencies` priced by CONSUMER INSTALLS because this package's tarball ships no code in any shape; `RT-R12` in `spec/runtime-targets.md` v0.11, `S14` (the engine reached from `src/jsonata/**` alone, by the bare specifier alone) and `S15` (one declaration at one pin, both exports, five adjacent fields refused — `bundledDependencies` after the adequacy reader shipped the engine's eight files in the tarball through it).** `fyflow-orchestration/jsonata` exports `jsonata: LanguageAdapter` whose worker half is its own `import.meta.url` — one module, one engine. **Three engine facts nobody had measured decide the adapter's shape**: jsonata throws PLAIN OBJECTS, not `Error`s, so both halves re-throw carrying code, position, token and value; it MARKS the arrays it builds with own `sequence`/`keepSingleton` keys that survive `structuredClone` across a thread and fail any deep-equal, so the worker half hands out plain values at every depth; and **`$shuffle` draws from `Math.random()`** — found in the engine's own bind list before the probe ran, which **REVERSES P17 prediction 4** exactly as that row said it would (the walk over all 63 built-ins observes 61 with a defined value and only the four differ). **[Q265](doc/open-questions.md) decided UNBOUND** — FIVE names by name, `$eval` for a construction-time-refusal reason. **The conformance suite passed on the real adapter with ONE change**: in a browser bundle `import.meta.url` is the bundle itself ([Q261](doc/open-questions.md)), so `import(adapter.worker)` yielded no default export and six clauses were red in chromium, firefox and webkit — the probes gain an optional `workerHalf` handle taken only where the URL cannot be imported, Node and Deno asserting the URL's default IS that function (the maintainer's choice; W61's Record corrected under pass 3 rule 6). **Fact 6 re-taken inside the wrapper on real pools**: inline there is no clone and the transform is the whole cost; threaded, a thousand-branch reduction adds a third to a half of the thread's own clone and a filter-and-reshape two to three. **`deno publish --dry-run` proves the presence of `node_modules` and nothing about the declaration** — it refuses every shape without `node_modules` and passes WITH it and the `deno.json` entry deleted ([Q252](doc/open-questions.md)'s shape a second time). L1-L5 **38 / 979 in five runtimes**, L6 **1281 / 46 unmoved** (reverting W62 at L6 costs 0 — W63's number to move from), spec **7 / 55 / 104**, docs 28 / 22, markdown 116 / 5088 / 257, census **212 / 159 / 2 / 51**; `npm run gate` **EXIT 0, zero FAIL lines, on the SECOND run over the final tree** — the first was red on ONE line, check-scheduler's `D8` probe deleting `deno.json`'s `imports` block by a two-line literal the `jsonata` mapping made three (rule 7 (b), re-anchored, a late exception). **Readers 13 / 3 blocking and 21 mutations / 17 survivors / 7 blocking, overlap 1 — the thirty-sixth measurement.** The conformity reader found claims that were false: section 13 still said the sub-path was *not yet on this tree*, section 14 stated the pin the spec said was written nowhere in prose (the one overlap), `package-lock.json` modified undeclared. The adequacy reader found bounds that were not there, every one a direction the author's 79 probes never took: two of the four carried error fields with no observer, the marker stripping at ARRAY-ELEMENT depth, `S14`'s form clause weakened to a PREFIX with its self-test green, two of `S15`'s enumerated fields with no probe, the array-valued `bundledDependencies`, and **the threaded half of *inline and threaded* bound by the one `inline: backend === 'inline'` expression** — closed by the inner worker reporting whether it shares the test's realm. **Rule 8: 97 probes, 1 control green, 71 caught, 23 declared ceilings each RUN against its rung, 2 measured, 0 undeclared, 0 crashes, 0 against declaration on the final pass** — and six aborts across the passes plus two ceilings that were CATCHES on the shipping tree (the by-name/by-twice pair once `eval` joined the list; the walk's timestamp member once "observed" required a defined value), every one an instrument or a value this item moved: v0.17's dated-ceiling clause firing INSIDE the item, twice. **The tree MOVED once with no probe reporting it**: a probe's `deno check` rewrote `deno.lock` for a mutated `deno.json`, outside the probe's restore set. The Node runner's crash on one suite's import failure — exit 1, zero FAIL lines — is [Q272](doc/open-questions.md). Late exceptions **five** (the conformance suite file, both locks, `AGENTS.md` section 13, and check-scheduler's self-test), zero undeclared. Q270-Q272 raised; Q252, Q261 extended; Q273 spent.

**[W61](doc/work-items/w61-what-a-transform-is.md) is DONE and [ADR 0051](doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md) answers P17's question at the definition and in the wrapper: A TRANSFORM IS A DECLARED EXPRESSION IN A REGISTERED LANGUAGE, applied in the TYPE's worker wrapper and never in the driver.** `spec/flow-definition.md` is **v0.18**: a typed `task` may carry **`transform: { lang, expr }`**; `Registry.languages` is the fifth set, an adapter `{ compile, worker, check? }` with TWO halves — a synchronous, throwing `compile` on the main thread and a worker-side MODULE URL, because a function in a threaded pool's config *could not be cloned* while a URL crosses (P17 fact 7, re-run); `FD-V35` (unregistered language, the set EMPTY when absent), `FD-V36` (an expression the language's compile refuses, with its message, position and code, at `new Driver`), `FD-V37` (a transform on a node with no type, or not `{ lang, expr }`); **`FD-C6`** for the transformed envelope — `{ settings, input, transform }`, `input` STILL the value received — with `FD-C5`'s row byte-identical. **35 refusals**, spec **7 / 55 / 103**. The envelope worker loads each language's worker half in `setup()`, evaluates in `run()` with `$` the input and `$settings` bound, compiles once per `(lang, expr)` per instance, and hands the inner worker `{ settings, input }` with `input` REPLACED; **`TransformFailed` is a TASK's failure** — `failed` on an optional node, `user_action` on a non-optional one, measured on real inline and threaded pools in both runtimes. The bootstrap helper takes `languages` and `flows` and writes a language's worker URL into a typed pool's config ONLY where a node of the type transforms. **Proved against a FAKE language shipped as a test fixture — no `jsonata` is installed** — through an ADAPTER CONFORMANCE SUITE (seven clauses: the halves agree, every case twice, `$settings` as a pair, the three unbound names BY NAME, `undefined` required not to reject) that W62's JSONata adapter runs as a second implementation of an interface that already has a suite. **P17 prediction 1 CONFIRMED** (0 failures on every existing test; the two P12 flows and `typed.flow.json` dispatch byte-identically with and without `languages`); **prediction 3 CONFIRMED and measured**: the wrapper's evaluation deleted costs **14 at L1, 0 in every L2-L5 suite, 0 at L6**. **Prediction 2's reversal condition was MEASURED REAL and then avoided by the maintainer's choice**: a wrapper whose `setup()` throws leaves the task `pending` with `attempts: 0` forever and the run never hears of it (both runtimes, inline and threaded), so a language module that fails to load is REMEMBERED in `setup()` and thrown from `run()` on exactly the tasks naming that language — one stop-and-ask, three roads priced; the type's INNER worker's `setup()` throw is W59's road and still hangs ([Q266](doc/open-questions.md)). L1-L5 **36 files / 958 cases in five runtimes** (from 32 / 858), L6 **unmoved at 1281 / 46** and reverting W61 whole at L6 costs **0** — W63's number to move from. **Its readers found ONE blocking claim and THREE blocking holes, overlap 1 — the thirty-fifth measurement.** The conformity reader (10 / 1): the spec and ADR said the conformance suite asserts the three unbound names BY NAME and it asserted a count of three. The adequacy reader (66 mutations / 10 survivors / 3 blocking): **the wrapper's memo keyed by expression TEXT alone survived** — a task in one language silently received another language's compiled expression, and the author's own probe had keyed it by LANGUAGE and been caught (W17's finding at its sixth iteration: the hole in the direction the probe did not take); **the real-pool `BACKENDS` narrowed to `inline` with 953 unmoved**, because the browser's parity check forced the backends loop INSIDE a case, which is exactly what a case count cannot see; and `FD-V37`'s *reported alone* had no COUNT observer. All closed; the readers' ten exact edits are probes. **Rule 8: 93 probes: 1 control green, 81 caught, 10 declared ceilings each RUN against its rung, 1 revert measurement, 0 undeclared survivors, 0 crashes, 0 against declaration on the final pass — 1 abort re-anchored and then caught (a13, an anchor the adequacy fix moved) and 1 author probe rewritten (r7, first aimed at the wrong branch)** — and the AUTHOR pass read one CRASH, one ABORT and one UNDECLARED SURVIVOR, two of them the instruments: a probe's `'$'` mangled by `String.replace` ([Q184](doc/open-questions.md)'s shape in a harness copied from W59's), an anchor that could not match because **the file it anchored on carried a NUL byte the author's tool had written — green at every rung, `grep` calling it binary** ([Q267](doc/open-questions.md)), and `spec/README.md`'s HEADLINE refusal count reverted to 32 at `check:spec` exit 0 because `C4` read the last count in the row — closed by a `C4` clause. **Late exceptions two, one cause**: the driver's new field reached the L6 byte walk's both-ways lists in two `examples/` files (W55's universe binding firing on W61 as on W59). **`M4` predicted not to fire and did not.** Census **209 / 156 / 2 / 51**; Q266-Q267 raised, Q184 and Q253 extended, Q268-Q269 spent. **P17's own facts harness went vacuous at exit 0 on this item's first edit to the envelope line** — Q253's shape for the second plan running.

**[P17](doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md) is DECLARED — *what may a node DO to its input before its worker sees it?*, and it is the SIXTH PRODUCT PLAN IN A ROW.** *(The declaration's paragraph, kept as its record; W61's is above it. Two of its sentences did not survive W61 — "the envelope worker's header says a third key the driver may one day add is this class's to consume" and "`unpackEnvelope` already DROPS a third key" describe v0.17: since v0.18 the wrapper KEEPS a well-formed `transform` and consumes it.)* A typed node's worker receives `{ settings, input }` where `input` is exactly what arrived, and when that is not the shape the worker reads the only remedy is a RESHAPING task node — the workaround ADR 0040 exists to remove, whose absence is W43's silent zero rather than a refusal. **The answer's placement was the maintainer's on 2026-09-11 and the plan does not reopen it**: a `transform: { lang, expr }` on a typed task node, applied in the TYPE's worker wrapper and never in the driver, the language registered by NAME with JSONata the first and only adapter as the sub-path `fyflow-orchestration/jsonata`. **Three items, serial: [W61](doc/work-items/w61-what-a-transform-is.md)** (what a transform is — **ADR 0051**: `Registry.languages`, the adapter interface with its TWO halves, `FD-V35`-`FD-V37`, `FD-C6`, the wrapper evaluating, proved against a FAKE language so no `jsonata` is needed), **[W62](doc/work-items/w62-the-jsonata-adapter.md)** (the JSONata adapter, `$now`/`$millis`/`$random` unbound by name, how a second dependency is declared — **ADR 0052** unless folded), **[W63](doc/work-items/w63-a-transformed-join-on-real-workers.md)** (the exit artifact: a typed join successor reducing `JP-R12`'s record through `$sum([*.score])` with no reshaping node, at arities two, ONE and ZERO, in both L6 runtimes). **Nine facts measured before declaring, identical under Node 24.20.0 and Deno 2.9.6 outside timings**, by `dev-dist/p17/facts.mjs` on a `jsonata` install OUTSIDE the repository: the driver has zero `async`/`await` and builds the envelope in one expression at line 2030; `jsonata` compiles synchronously (`S0203` at position 12) and evaluates to a Promise; the three nondeterministic built-ins can be shadowed per compiled expression and the shadow reaches `$eval` — **and `$millis()` returned the SAME value twice on Node**, so two-evaluation detection is flaky and the plan unbinds by NAME; a path typo is `undefined` and a type error throws; **a transform's result changes TYPE with the region's arity** — `*.score` is an array at two matches, the scalar at one, and `$sum(*.score)` over `{}` is `undefined` where `$sum([*.score])` is `0` ([Q263](doc/open-questions.md)); a reduction over a thousand branches costs a sixth of the clone the envelope already pays and a filter-and-reshape twice it; **a FUNCTION in a threaded pool's config fails the task with *could not be cloned* while a URL string crosses**, so an adapter has two halves ([Q264](doc/open-questions.md)); `unpackEnvelope` already DROPS a third key; and `jsonata` bundles for the browser at 242 190 bytes. **Q263-Q265 raised; census 207 / 154 / 2 / 51.** Baseline **32 / 858 in five runtimes, L6 1281 / 46, spec 7 / 51 / 99**, re-taken at the declaration.

**[P16](doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md) is COMPLETE and RETRO'D, and `doc/workflow.md` is [v0.17](doc/workflow.md) — THREE changes adopted, FIVE refused, and its central finding is that a harness satisfying EVERY requirement this document had written for it measured NOTHING on seven probes, while the shapes clause, FOLLOWED deliberately by two items, was one shape short of the rule's own enumeration in both.** Eighteen defects across the plan; **two had a rung, both rungs FIRED, and both were READ correctly** — [Q142](doc/open-questions.md) as a red self-test in W58's final gate, and W59's probe taking L6 down as *exit 1 with zero FAIL lines*, section 4's v0.15 clause verbatim. P15's retro found the one rung that fired reported green twice; this plan's two were read as what they were. Sixteen have no rung and every one was found by a reader or by reading rule 8's failure lines; five of the sixteen are in the INSTRUMENTS.

**THE THREE CHANGES.** **(1) Rule 8's requirement on the HARNESS gains PER-EDIT integrity**: every edit's anchor is checked against the CURRENT text, an abort undoes what it applied, and the tree is held still by a CONTENT DIGEST — because W58's harness carried a control, asserted every restore and ran every ceiling, v0.11's and v0.14's requirements satisfied throughout, and its `apply()` replaced against the ORIGINAL bytes so a two-edit probe kept only its last (W37's defect verbatim); fixed, its abort path kept an applied edit and thirteen probes crashed on it while a `git status` diff saw nothing. Three occurrences, two plans, and none of the three existing requirements could see any of them, because all three are about a probe that RAN. **(2) Obligation (a)'s shapes clause gains: where a rule ENUMERATES its values, the set is that enumeration, not *more than one*** — W59 ran three shapes on every rule under v0.16's clause and `FD-C5`'s row lists FOUR kinds of `input`, the fourth costing 0 to break; W58's three-shape list was bound by nothing but its count. **(3) v0.14's ceiling clause gains its DATE**: a set-equal-literal ceiling is a CATCH the moment the value moves, and the item that moves the value re-runs it — this retro re-ran all twenty-three ceilings on the shipped tree and **two of W58's eight are catches**, both literals W59's edits made unequal; P13's retro found the same class once.

**REFUSED, five, each with a measurement**: a `doc/` check for the FOURTEENTH time (a refusal count twelve lines below a rewritten table); an `Owns` pre-declaration rule for the FIFTH plan running, with a new datum — late exceptions ran **1, 5, 0** and **W59's six declared came from W58's late table read forward** (a procedure recorded, not ruled); tracking the declaration's facts harness ([Q253](doc/open-questions.md), wrong five ways at exit 0); a `deno publish --dry-run` rung ([Q252](doc/open-questions.md), green for the wrong reason); and a rule for a harness's per-row catch, a fix W59 made.

**FOUR of FOUR predictions CONFIRMED — the first plan since P10** — one with a FALSE mechanism under a right conclusion (fact 3's *`import type` closes Q71* measured false at W57 while the cost was 0 either way), and one narrowed by the declaration's own grep before any item ran. **v0.16's three changes: all CONFIRMED and KEPT, the shapes clause EXTENDED**; *run, never piped* is what made W59's crash legible. **Rule 8 across the plan: 240 provocations, 209 caught, 24 declared ceilings all RUN, 0 undeclared, 0 against declaration on every final pass, 1 abort re-anchored.** **Readers six passes, overlaps 0, 1, 1** — the thirty-second to thirty-fourth measurements, band unmoved. **Late exceptions 1, 5, 0 — six, zero undeclared.** **The scheduler's reference is silent on FIVE facts this plan needed** — an unknown group ignored at task and pool level, a plain object run as a task, `resource.*` emitted only when listened, a group resolved by map KEY, a group acquired once per ADMISSION — all learned by measurement, none a defect. **Census CONFIRMED for the SIXTEENTH plan running — 204 / 151 / 2 / 51**; the retro raises no question. **W60 CLOSED unissued, Q254-Q255 spent, ADR 0050 skipped.** [P15](doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s three items — [W53](doc/work-items/w53-what-a-run-retains-that-nothing-reads.md), [W54](doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) and [W55](doc/work-items/w55-a-run-at-scale-on-real-workers.md) — are done and the retro is run. **Read every status from the item's own file, never from this line.**

**[W59](doc/work-items/w59-what-a-node-type-is.md) is DONE and [ADR 0049](doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md) answers P16's question — WHAT A NODE TYPE IS: a REGISTRY entry, and the definition stays data.** `spec/flow-definition.md` is **v0.17**: a `task` may name a **`type`** instead of a `workerType` and carry **`settings`**; `Registry.nodeTypes` is the fourth set, each entry `{ worker, pool, groups, config, settings, retryPolicy }` — the settings entry a VALIDATOR function registered as a predicate is, the schema LANGUAGE left to P18; **a type's pool is keyed by its name**; and its worker receives the **envelope `{ settings, input }`**, `FD-C5`, with `input` defined as THE VALUE THIS NODE RECEIVES and never as *what `needs` composed*, so P17's transform sits between composition and the envelope without rewording the rule. `FD-V32` (unknown type, or no pool of its name), `FD-V33` (settings not a plain object, or the validator refusing by a string, a throw, or a non-null non-string verdict — absent settings reach it as `{}`; a validator that is not a function refused at construction naming the TYPE), `FD-V34` (the two halves mixed, three ways), `FD-V23` widened; **32 refusals**, spec **7 / 51 / 99**. **The bootstrap helper is a SUB-PATH, `fyflow-orchestration/scheduler`**, exported by both manifests — the maintainer's call, the JSR dry run priced — building one `WorkerManager` per type around the package's ENVELOPE WORKER (a script the pool loads, because a `WorkerManager` loads a script) and refusing the types' groups BOTH WAYS, because the scheduler ignores an unknown group at the POOL level too (measured, both runtimes). **Four stop-and-ask decisions, each measured before the maintainer chose**: `settings`/`input`; an `exports` map; node > type > driver default, whole; and the road by which a refused settings value still reaches a worker — the driver holds the definition BY REFERENCE, measured — RECORDED as [Q259](doc/open-questions.md) rather than closed. **A bare `workerType` node is unchanged to the byte**, asserted as a byte-identical dispatch comparison of the two P12 flows with and without types registered. **Prediction 3 CONFIRMED**: every refusal an `FD-V`, the envelope an `FD-C`, no `FD-R`; W60 not issued, ADR 0050 skipped.

**Its exit artifact is two rows on real workers in both L6 runtimes — L6 is 1281 assertions over 46 real runs, from 1203 / 44.** `typed`: two nodes of ONE type with DIFFERENT settings — `factor` 10 against 100 — computing 9 and 90 from one input, `high` retrying once under the TYPE's policy (the node declares none; `attempts: 1` on both observers), both holding `scorer`, the group the type declares, read back by the scheduler's KEY — registered under a key that is not the object's own name, on purpose. `typed-regions`: a typed task at path `1` inside a fanout branch feeding a typed `map` branch at `1.0`, `1.1`, `1.2`, each instance's envelope wrapping its OWN item under `JP-R11`, the three inputs asserted distinct FROM THE RUN. **What reverting each item costs at L6: W57 88, W58 11, W59 11.** L1-L5 **32 files / 858 cases in five runtimes** (from 29 / 746); census **204 / 151 / 2 / 51**, 0 aborts.

**Its readers found FOUR blocking holes the author's 93 probes never reached, and every one is a direction rather than a clause.** The adequacy reader (37 mutations, 20 caught, 4 blocking): the helper's both-ways group check had **no fixture whose map key differed from the group's own name** — ADR 0049 fact 2 was measured, written down, and then every fixture made the two equal, so a helper checking the inert name survived L1 AND L6; **`FD-C5` names FOUR kinds of `input` and the item instantiated three** — a driver handing a typed JOIN SUCCESSOR `{}` cost 0 everywhere, W41's, W53's and P15's shape a fourth time and ONE SHAPE PAST the three the item chose under v0.16's own clause; the driver's construction loop over types was bounded by single-entry fixtures; and **ADR 0049 rule 5's second half — the pure entry does not export the helper — had NO observer**: `index.ts` re-exporting the sub-path was green at `S7`, L1, lint, five typechecks and the browser bundle. All four closed (L1-L5 835 → 858, L6 1280 → 1281). **And it measured that a group is acquired once per ADMISSION, not per retry** — a threaded pool short of a worker re-admits a task with no retry at all — so [Q262](doc/open-questions.md) was corrected by its own item's reader before the item closed. The conformity reader (12 / 2 blocking) found `AGENTS.md` section 3 carrying *29 refusals over `FD-V1` … `FD-V31`* twelve lines below the table the item rewrote, and `examples/README.md` carrying 1277 from the hour before the last three assertions landed; every number confirmed, `Owns` audit clean. **Overlap 1 — the thirty-fourth measurement.**

**Rule 8: 103 provocations, 88 caught, 10 declared ceilings each RUN, 1 threaded measurement, 3 revert measurements, 1 control, 0 undeclared, 0 crashes, 0 against declaration on the final pass — and the author's first pass read one CRASH and one AGAINST DECLARATION, both the instrument.** A probe dropping `nodeTypes` from the driver took ladder L6 down with ZERO FAIL lines, the row loop having no per-row catch — W58's recorded shape, closed rather than recorded a third time; and two probes re-TAGGED a `run` snippet instead of deleting it, so `X2` caught the throws where the floor was the clause named. One abort on the re-run, `d2`, whose anchor the fourth shape had moved — rule 7 (b) firing correctly, the harness undoing what it had applied. **The harness holds the tree still by a CONTENT DIGEST over every tracked and untracked-unignored file, not `git status`**, which W58 measured cannot see a file modified either way. **Six declared exceptions, zero undeclared**: `scripts/check-spec.mjs` and its self-test (`C7` read every task's `workerType` and a typed task has none), `scripts/check-docs.mjs` and its self-test (the sub-path rewrite and `RUN_FLOOR`), and W58's two corpus-split documents — predicted this time from W58's table. `W59` outside `doc/`: **108 hits in 23 files, every one this item's own annotation** (3 at `f329620`, where the declaration said 0 — the second item running for that sentence). **[Q142](doc/open-questions.md) was PREDICTED and did NOT fire** — `M4`'s two-directory fixture measured 3537 before a document was written and 3591 on the final tree, against 3960 — because this item's prose landed under `doc/work-items/` and `doc/decisions/`, which the probe cuts; `scripts/check-markdown.mjs` was declared and not edited. `npm run gate` **EXIT 0, zero FAIL lines, on the first run over the final tree**, digest `610f08437f4d163f` before and after.

**[W58](doc/work-items/w58-what-a-node-says-about-its-own-task.md) is DONE and `spec/flow-definition.md` is v0.16: A `task` NODE SAYS TWO THINGS ABOUT ITS OWN TASK, `retryPolicy` and `workerGroups`, as DECLARED KEYS passed through to the scheduler exactly as `optional` is — [Q16](doc/open-questions.md)'s TASK half, and NO ADR (P16 decision 3 is the decision).** `FD-V30` refuses any `retryPolicy` but the scheduler's own `{ maxRetries, backoffMs }` — an integer >= 0, a finite number >= 0, no other key — and **every clause is a measurement of what the scheduler does with the shape in silence**: `{}` means *no retries*, a string `maxRetries` **retries by coercion**, an extra key is dropped. `FD-V31` refuses a `workerGroups` entry the registry's **third set, `groups`**, does not declare, because a task carrying an unknown group id **runs and settles `done` with no `resource.blocked` and no throw** (P16 fact 2, re-measured with a listener attached — the scheduler emits `resource.*` only once something listens, which its reference does not say: [Q258](doc/open-questions.md)) — and **an ABSENT set means EMPTY**, the maintainer's call with the lenient reading priced. `DriverOptions.defaultRetryPolicy` applies where a node declares none, is held to `FD-V30` at construction, and **the node wins, whole** — and rule 8 found that clause has NO falsifier on any valid document, because `FD-V30` requires both keys, so the spec says so ([Q256](doc/open-questions.md)). **No `defaultWorkerGroups` and W60 not issued**: a task's groups are a UNION with its pool's, measured, so a pool-level default exists upstream where a retry default does not. **A node that declares neither key is dispatched with the exact four-field object it was before**, byte for byte, and every corpus flow validates unchanged. **Three stop-and-ask decisions, each measured on a real scheduler before the maintainer chose.**

**Its exit rows are P16 prediction 2 CONFIRMED and fact 2 answered where it shows.** The retry row is a `map` of three whose branch task declares `maxRetries: 1` on a pool whose role fails every task id's FIRST attempt — three separate budgets from one declared object, the shape the feature was not built for (v0.16's obligation (a)), each instance retried INSIDE its own id and settling `done` with **`attempts: 1` on two observers**, the outcome record and the live task at the harness's own listener; with the passthrough reverted every instance ends `user_action` at 0 and the run suspends (**7 L6 failures**). The group row names a `ConcurrentLimitGroup(1)` the harness holds with the group's own `onStart()` — no foreign task — so the task is `resource.blocked` on dispatch and runs when the slot is given back on that very event; reverted, it runs unblocked with no resource event (**3**). **L1-L5 29 files / 746 cases in five runtimes** (from 27 / 705); **L6 1203 / 44 in both runtimes** (from 1138 / 42, +65, the count matching the arithmetic before the file was run); **spec 7 / 47 / 95**; census **200 / 147 / 2 / 51**.

**Rule 8: 83 provocations, 73 caught, 8 declared ceilings each RUN against its rung, 2 controls, 0 undeclared, 0 aborts — and the HARNESS was the defect TWICE.** The author pass first read 3 undeclared, 2 crashes and 2 against declaration, and five of the seven were `apply()` replacing every edit against the ORIGINAL bytes, so a probe with two edits on one file kept only its last — **W37's harness defect verbatim, inside a harness carrying a control and byte-asserted restores (v0.11's two requirements, satisfied throughout)**. The re-run then read 13 crashes and 4 aborts, and every one was the abort path keeping an edit it had already applied — the held-still `git status` diff blind to a file modified either way. **Readers 12 / 2 blocking and 106 mutations / 16 survivors / 3 blocking, overlap 1 — the thirty-third measurement**, and the split held: the conformity reader found a THIRD present-tense copy of W54's corpus count (`spec/run-state.md`) and a declared *0 hits* that was 6; the adequacy reader found **the item's headline claim unfalsifiable by its own suite** — the three SHAPES a literal list bound by nothing but the printed case count, the map shape deletable for zero with a rule narrowed to the other two — plus the merge pair carried by two literals (W43's shape), `schedulerGroups` with one reading the driver's registry was downstream of (v0.16's *independent*, one item after it was written), and **`defaultRetryPolicy` validated nowhere** while the predicate's own comment said the driver read it. All closed; the readers' eleven exact edits are probes. **Late exceptions FOUR** (`spec/outcome-record.md`, `spec/run-state.md` — the same count twice — `AGENTS.md` §11 and §12), zero undeclared. **Q256-Q258 raised, Q253 extended, Q16 and Q111 corrected without resolving either; W60 not issued.** **[Q142](doc/open-questions.md) FIRED in the final gate, unpredicted for the first time** — the two-directory fixture 3102 → 3532 past `M4`'s 3490, on documents no `removes` probe cuts; retuned to 3960 from a scratch copy, a fifth late exception (`scripts/check-markdown.mjs`).

**[W57](doc/work-items/w57-the-scheduler-is-a-dependency.md) is DONE and [ADR 0048](doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md) supersedes ADR 0013 rules 1, 2 and 6: THE SCHEDULER IS A DECLARED DEPENDENCY, reached by one bare specifier.** `package.json` names `fyflow-scheduler` in `peerDependencies` at EXACTLY the pin — the maintainer's call, both ranges priced with npm 11.19.0: exact and caret behave identically on every version that exists and differ only on versions upstream has not published; `deno.json` maps it to `jsr:@fyflow/scheduler` at the pin and the L6 map stays, because the two coexist and `D8` binds both (**W60 is not issued, ADR 0050 not taken**); `src/driver/driver.ts` imports `FyflowTask` for a DEFAULT `createTask`; `S7` is NARROWED to the FORM of the reach (prediction 4 confirmed — `D1`-`D3` read no source file, so a `../fyflow-scheduler` reach from `src/` was guarded by nothing but the machine's directory layout), `S8` narrowed, `S9` RETIRED, `D8` added, `RT-R11` written. **Q71 RESOLVED — and P16 fact 3's mechanism was FALSE**: an `import type` closes nothing; `SchedulerLike`'s listener parameter is `object`, the one shape of seven that the real class AND the L2-L5 fakes both satisfy in every configuration, and the type import is kept as an L0 assertion under the two typecheckers that carry the DOM lib. `AGENTS.md` section 12's cast paragraph is DELETED and its snippet is a real run on a real scheduler with no `createTask`; `tsconfig.docs.json` carries `DOM`. **L1-L5 27 / 705 in five runtimes** (703 unmoved by the import — prediction 1 confirmed with the scheduler's browser build in the bundle — plus two cases the readers forced); **L6 1138 / 42 in both runtimes, from 1061 — +77 for two observers this item had to ADD, because `FyflowScheduler.addTask` DUCK-TYPES its task**: with the default swapped for `(config) => config`, L6 stayed green — a plain object runs to `done` with `attempts` undefined and `instanceof FyflowTask` false, and the driver's listener normalises `attempts`, so no record could see it. Read from `scheduler.tasks` and from the live task at the harness's own listener, each alone costs **38**.

**Its conformity reader found the ADR's supersession ARGUMENT was a claim about ADR 0013 that ADR 0013 does not make** — rule 1 rests on context fact 4, not fact 1, and 0013 PREDICTS rules 1, 2 and 4 unchanged when the pin reaches a registry; the claim it protected, *a driver that can construct a scheduler is a driver that will*, was answered nowhere. The sentence came from P16 and had been copied into four documents; all four are corrected and the ADR now answers the real ground on ADR 0001's own terms. **Its adequacy reader found every survivor in ONE direction the author's 44-probe set never took: fields, keys and spellings ADJACENT to the ones a check reads** — `peerDependenciesMeta` beside `peerDependencies` (the peer made OPTIONAL with every check green), `scopes` beside `imports` (a working-tree path for `./src/` alone), `"0.5.2"` beside `'0.5.2'` (the bound written to close the author's own ceiling was blind to two spellings) — **and the option half of rule 5, which no fake ever asserted**: `createTask` ignored outright cost **0 of 705 and 0 of 1138**, and a default that injected `retryPolicy` or `workerGroups` (W58's two fields) was green everywhere. All five closed; the readers' ten exact edits are checked in as probes. **Rule 8: 54 provocations, 48 caught, 6 survivors all declared, 0 aborts, 0 against declaration**, the tree held still. **Readers 13 / 2 blocking and 64 / 13 / 5 blocking, overlap 0 — the thirty-second measurement**, neither primed; their split held exactly: the conformity reader found claims that were false (the argument, a stale 1061, three counts, seven stale identifiers), the adequacy reader found bounds that were not there. **Late exception ONE** (`examples/l6.ts`, on a measurement), zero undeclared. **Census 197 / 144 / 2 / 51**; **Q252** (no `deno publish --dry-run` rung — a green dry run was the wrong answer once, because `package.json`'s devDependencies resolve a bare import to the npm build) and **Q253** (P16's facts harness is UNTRACKED and misread fact 1 at exit 0 two ways, one of them from the day the plan was declared). `check:spec` **7 / 44 / 93**.

**[P16](doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md) is DECLARED — *what is a node type, and what does the library owe the scheduler to have one?*, and it is the FIFTH PRODUCT PLAN IN A ROW.** *(The declaration's paragraph, kept as its record; two of its claims did not survive W57 — *Q71 closes by `import type`* and *rule 1's forcing fact expired* — and the W57 paragraph above says how.)* A flow names a worker pool by a string and hands it a payload, and that is everything a node can say about the thing that runs it: no retry policy, no resource group, no per-node settings, no statement of what the worker expects. **Three items, serial: [W57](doc/work-items/w57-the-scheduler-is-a-dependency.md)** (the scheduler is a declared dependency, superseding [ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) rule 1 as **ADR 0048** — its forcing fact, *the pinned version is on no registry*, expired on 2026-08-31 and rule 1 is the last clause of that ADR resting on nothing it was decided on; [Q71](doc/open-questions.md) closes by `import type`), **[W58](doc/work-items/w58-what-a-node-says-about-its-own-task.md)** (`retryPolicy` and `workerGroups` as declared keys on a task node, mirroring `optional`, with a registry `groups` set because the scheduler **silently ignores an unknown group id** — measured), **[W59](doc/work-items/w59-what-a-node-type-is.md)** (a node type as a registry entry, **ADR 0049**: worker, pool defaults, groups, global config, a settings validator and the envelope `{ settings, input }` that leaves ADR 0040 rule 6 intact for untyped nodes; the bootstrap helper as a sub-path export; the exit artifact on real workers in both L6 runtimes). **Reserves W57-W60, Q248-Q262, ADR 0048-0050.** **Its follow-on slices are ordered and NOT reserved**: a per-node JSONata **transform applied in the type's worker wrapper**, never in the driver ([Q251](doc/open-questions.md) — `driver.ts` dispatches inside a listener with no `await`, and `jsonata` 2.x `evaluate()` returns a Promise), then input/output schemas with a **sample-based pre-flight** for transformed edges, then run-time strict mode. **Five facts measured before declaring, re-taken on `8550978` by `dev-dist/p16/facts.mjs`, and prediction 2 was reversed by its own grep within the hour** — L1 already carries fixture `attempts` of 2 and 3, so the claim narrowed to *the first non-zero `attempts` a SCHEDULER has ever set*. Baseline **27 files / 703 cases in five runtimes, L6 1061 / 42, spec 7 / 44 / 92, register 195 / 143 / 2 / 50**.

**[P15](doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md) is DECLARED — *what does a run
retain, and what may a result be?*, and it is the FOURTH PRODUCT PLAN IN A ROW.** It takes
**[Q19](doc/open-questions.md) and [Q22](doc/open-questions.md) as ONE question** — the two oldest
rows in the register whose owner cell says the same thing, *no owner, needs a measured run*, both
since P1 — and **this declaration took that run.** Three items, serial: **W53** (what a run retains
that nothing reads, as **ADR 0046**), **W54** (what a result may be, and what bounding it would cost),
**W55** (a run at scale on real workers). **Reserves W53-W56, Q233-Q247, ADR 0046-0047.** **All three
are DONE and are below.**

**[P15](doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md) is COMPLETE and RETRO'D, and
`doc/workflow.md` is [v0.16](doc/workflow.md) — THREE changes adopted, FIVE refused, and its central
finding is that of ELEVEN defects exactly ONE had a rung, the rung FIRED, and it was reported GREEN
twice.** Nine of the other ten were found by a reader and one by rule 8's re-run. W54 piped
`npm run test:browser:all` through a `grep` for the count line — which prints **before** the
failures — and reported three red browsers green, in the item whose own Verification table quotes
v0.15's *a line of its output is never the predicate*. **The ladder was not what failed; the reading
of it was.**

**THE THREE CHANGES.** **(1) Section 4's green clause gains a PROCEDURE: a rung is RUN, never PIPED —
redirect it and read `$?`.** Four occurrences across three plans (W42 twice, W50, W54), and all four
are an author reading a LINE because the rung's output was too long to read whole; stating the
predicate was not enough, and *do not pipe* is the one thing the four share. **(2) Rule 8 obligation
(a) gains the SHAPES a rule quantifies over, not only its clauses** — a clause is a sentence, a shape
is a value of the kind it ranges over, and **the author picks the shape the feature was built for
every time**: W41's 37 probes all used a `map` region, W53's release cases all used one `map` region
at depth 1 (hiding THREE defects), and P15's own fact 1 produced it a third time, **after which the
item written to correct it chose its fixtures the same way**. **(3) Obligation (c)'s LIMIT gains what
*independent* excludes: the second observer must not be DOWNSTREAM of the first's apparatus** — W55's
was measuring the first one's instrument, and **every mechanism in rule 8 is blind to that by
construction**, because a control can only see what a probe ADDS and the clean run is contaminated
identically.

**REFUSED, five, each with a measurement**: a **`doc/` check for the THIRTEENTH time** — *49.8%* is
right in three documents and wrong in four and the difference is **which divisor the sentence
names**, so a check would have to do arithmetic in English; an **`Owns` pre-declaration rule** for
the fourth plan running, and **P15 is the first plan to PREDICT the pattern correctly** while a rule
naming the three files would still have been wrong twice on two of three items; a **fourth membership
list** for [Q217](doc/open-questions.md)'s regress — W55 closed the per-row layer **BOTH WAYS** and
could not close the cross-row layer at all, so the answer is a **HANDLE rather than a list**; a rung
or a budget row for the plan's scale; and a rule obliging an item to re-take its own grep COUNT,
where the procedure fired in all three items and two recorded the wrong number beside it.

**THREE of four predictions CONFIRMED, and prediction 4 REVERSED in a THIRD way this document had no
name for.** P10's retro settled that only a reach prediction can reverse; P13's added *when its
measurement is narrower than its wording*; P14's added *or when the fact underneath is FALSE*. **This
one reversed because the item whose job was to try, TRIED** — the prediction's own reversal clause
named a CONSTRUCTIVE test and became W55's Scope In 4 almost verbatim. **So a reversal clause DIRECTS
an item**, which nobody had written down — **and it was wrong about the mechanism**, guessing *most
likely by asserting the footprint itself* where the footprint is reported and never asserted.

**v0.15's three changes: all CONFIRMED and KEPT, and the one that was BROKEN is the evidence FOR
it.** *Held still* was followed by all three items with zero occurrences; the *grep your own id*
procedure fired in all three and found a real expiry-dated claim each time, with its limit being the
COUNT rather than the procedure — two of three recorded the wrong number and the sentences were found
anyway. **And v0.14's ceiling clause had its first full plan with a yield of ZERO**: all **twenty-four**
declared ceilings were re-run at the retro on the tree the plan ships and every one behaves as
declared, against P13's eleven where one was false and one stale.

**Rule 8 across the plan: 112 provocations, 87 caught, 25 survivors — 24 declared and ONE undeclared
and recorded — 0 aborts, 0 against declaration**, every set run twice with the readers' own edits
checked back in. **Two re-runs found a defect in the FIX rather than in the product**, which is
v0.8's founding observation. **Readers six passes, none empty — overlaps 2 / 4 / 2**, the
twenty-ninth to thirty-first measurements, band unmoved and closed. **ELEVEN late exceptions, zero
undeclared. Census CONFIRMED for the FIFTEENTH plan running — 191 / 139 / 2 / 50, 0 aborts**, and
**[Q142](doc/open-questions.md) was measured four times and does not fire.** **W56 CLOSED as reserved
and never issued; Q233-Q246 used, Q236/Q237/Q247 spent; ADR 0046 taken, 0047 skipped. The next plan
starts at W57, Q248 and ADR 0048.**

**[W55](doc/work-items/w55-a-run-at-scale-on-real-workers.md) is DONE and it is P15's EXIT ARTIFACT
— a MEASURED NUMBER rather than a flow, which the plan's decision 3 declared before any item
started.** `examples/retention.ts` is checked in and reports what ONE run holds on a real
`FyflowScheduler`, before and after
[ADR 0046](doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md),
with both observers named — **byte-identically in both L6 runtimes**. **L6 is 1061 assertions over 42
real runs**, from 942 / 42, and **the run count does not move**, because an artifact that is a number
adds no flow. `spec/` unmoved at **7 documents, 44 examples, 92 rules**; L1-L5 unmoved at **27 files /
703 cases in five runtimes**. **NO ADR and no spec rule.**

**P15 prediction 4 REVERSES, and the reversal is NARROWER than its own reversal clause.** Reverting
ADR 0046 rule 3 cost **ZERO** L6 failures before this item and costs **29 in BOTH runtimes** after it,
across **23 distinct rows** — a count of observations rather than of knock-ons. The prediction guessed
*"most likely by asserting the footprint itself"*; **the footprint is reported and never asserted**,
and what moved the number is the **RELATION**, observed by reaching past the surface a run reports
into the driver's own `arrivals` ([Q233](doc/open-questions.md)). **What
[Q214](doc/open-questions.md) keeps is the half that matters to a consumer**: the outcome, every task
id, the log, the fold and every callback are byte-identical either way, which is exactly why the
release was safe to make. *A rung made of runs cannot see this through anything a run REPORTS; it can
see it by not being made only of what a run reports.*

**FACT 3's 49.8% IS THE SHARE OF THE PAIR, AND FOUR DOCUMENTS STATE IT AS THE EXCESS OVER
`bytes(inputs)`, WHICH IS +99.2 TO +99.4%** — wrong by a factor of two, and wrong in the direction
that **understates** the saving. Found by re-running fact 3's own harness with the release reverted
rather than transcribing it. The headline — *half of what a region-bearing run holds is a second copy*
— is the share-of-the-pair reading and is **right**, as are `JP-R12`, W53's own file and
[Q19](doc/open-questions.md)'s resolved row. **And neither ratio is a constant**: the divisor is one
copy per SETTLED RESULT, so it is a property of the FLOW as well as of the payload — **+97.5%** with
no node after the join, **+49.3%** with one that echoes the collection, **+33.0%** on the flow L6
measures. [Q243](doc/open-questions.md).

**P15 fact 5's whole table re-takes TO THE DECIMAL in both directions** — 10.2 / 101.8 / 317.4 /
**3174.8** / 1584.9 MiB before, 6.2 / 62.1 / 161.1 / **1610.9** / 803.0 after — with the two observers
agreeing within **1.7-4.2%** at the large sizes, where P15 said within 3%.

**Its sharpest finding is that the SECOND OBSERVER WAS MEASURING THE FIRST ONE'S INSTRUMENT.** The
peak sampler holds the arrived payload objects, that snapshot is reachable from `driver.opts`, and the
byte walk skips `opts` **by name** — so observer 1 could not see it and observer 2 could, and every
kept driver retained **a second copy of the very collection the decision releases**: **141.9 against
129.4 MiB**, one collection a run, confirmed at a second scale. *A sensor cannot corroborate itself*,
and here the second sensor was measuring the first one's instrument.

**And the byte observer — the item's whole deliverable — was bound by NOTHING, three separate ways**,
each costing 0 with 1050 assertions green: the serializer made unavailable, a second `continue` inside
the walk (777.5 KiB to 0.6), the reconstruction's `extra` list emptied. **`walkOf` and `retainedBytes`
were two expressions over one literal and only one reached an assertion.** The measurement takes its
key list FROM the asserted list now, and the harness's predicate gained three RELATIONS rather than
figures — the rung has a serializer, the reconstruction exceeds the end, and **what a run holds cannot
be smaller than what it released**, because a collection is a SUBSET of what `inputs` holds.

**The headline number rested on ONE `check` call that three integer edits removed**, after which the
revert cost **2 instead of 25** — [W23](doc/work-items/w23-a-nested-flow-on-real-workers.md)'s finding
at its **FIFTH** iteration, closed by `PER_ROW_SUBJECTS` bound **both ways**. **N runs on ONE shared
scheduler is O(N^2)** (115 / 277 / 884 / 3304 ms at 100 / 200 / 400 / 800) **and on their own is
linear** (108 / 183 / 313), while the driver's share is flat at 15.0-15.1 KiB a run — and
`AGENTS.md` section 9 recommends the expensive topology ([Q244](doc/open-questions.md)). **A run's
footprint is not only the driver's**: `scheduler.tasks` holds six tasks a run beside it and
**`v8.serialize` REFUSES a `FyflowTask`** ([Q245](doc/open-questions.md)).

**Readers 13 / 3 blocking and 41 mutations / 19 survivors / 6 blocking, OVERLAP 2** — the
**thirty-first** measurement, in band, neither primed, the two shared subjects reached from opposite
ends. **Rule 8: 46 probes, 34 caught, 12 declared ceilings, 0 aborts, 0 against declaration**, run
twice with the readers' sixteen exact edits in the set — and the re-run found **a CRASH where a
failure belonged**. **ONE late exception, zero undeclared. Census 191 / 139 / 2 / 50, 0 aborts;
Q243-Q246 raised, Q247 unused; [Q142](doc/open-questions.md) does NOT fire.**

**[W54](doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) is DONE and
[Q22](doc/open-questions.md) is RESOLVED by `OR-R11` in `spec/outcome-record.md` **v0.9** — open
since P1, and with [Q19](doc/open-questions.md) closed by W53 one item earlier, **BOTH of the two
oldest rows whose owner cell said *no owner, needs a measured run* are answered in one plan.**
`spec/` is **7 documents, 44 examples, 92 rules**; L1-L5 is **27 files / 703 cases in five
runtimes**; **L6 unmoved at 942 / 42**. **NO ADR — 0047 SKIPPED and not reused.**

**A result is a VALUE, not an OBJECT.** What crosses `OR-R2`'s clone is a value's own enumerable
string-keyed DATA plus the built-ins' internal state; what does not is the **prototype** (so methods,
`instanceof` and privacy), **accessors**, **non-enumerable** properties, **symbol keys**, **property
attributes** — a frozen object arrives unfrozen — and an **`Error`'s own extra fields**. **Q22's fork
is the wrong shape**: it IS the driver's constraint, and the question an author hits is *what
arrives*.

**The document W54 owns carried a FALSE sentence in the direction that matters** — it said
`structuredClone` *throws on a class instance with behaviour*, and it clones it **LOSSILY**, with no
error and no report. So the boundary has **three** answers where it named two, and the table is now
**27 rows, 5 refused / 11 intact / 11 lossy**, asserted in **all five runtimes**.

**Prediction 3's CONCLUSION is confirmed and its stated REASON reverses.** It says no ADR *because a
driver cannot tell*; measured, a prototype comparison fires on every top-level lossy shape and on no
intact one at **0.02-0.65% of one clone**. What is true is narrower: the cheap check is blind to more
than half the lossy rows, including the NESTED case a worker writes, and the walk that sees them
costs **23-60%** per settlement ([Q238](doc/open-questions.md)).

**`OR-R12` is the sharpest single finding: `OR-R6` was stated of the whole boundary and holds only at
the LISTENER.** `resolve()`'s clone is unguarded, so an uncloneable resolution throws a bare
`DataCloneError` to its caller, appends nothing, does not fail the run and never reaches
`onRunFailure` ([Q241](doc/open-questions.md)).

**Its central lesson: A SUITE THAT DEFINES ITS OWN ORACLE CANNOT DISAGREE WITH THE DOCUMENT.** The
first classifier was **the very predicate section 4 declines for being blind to the nested case**,
applied to a table whose lossy row contains that case — every row passed while the two said different
things. What fixed it was deleting the classifier, so each row asserts the property its own row
names, and the suite **reads the table out of the document** both ways. *That binding caught the
item's own first split, 5 / 10 / 12, on its first run.* **And the item broke its own rule inside the
section that states it** — section 4 closes with *quote the shape and the ratio, never the
millisecond*, four paragraphs below two percentage bands from a single run whose upper bounds sat
below every N = 100 reading.

**Readers 15 / 6 and 41 / 17 / 6, OVERLAP 4** — the thirtieth measurement, at the top of the band.
**Rule 8: 30 probes, 21 caught, 9 ceilings, 0 aborts**, the readers' edits in the set from the start.
**And the gate was RED once, `GATE EXIT=1` with ZERO `FAIL` lines** — the browser bundle inlined
neither `spec/outcome-record.md` nor the second corpus, and the browsers had been reported green
twice from a `grep` for the count line, which prints before the failures. *Section 4's v0.15 clause,
quoted in this item's own Verification table and broken while being quoted.*
**FIVE late exceptions, zero undeclared**, and P15's `Owns` test is **YES / YES / YES** against W53's
no/yes/no. **Census 187 / 135 / 2 / 50; Q238-Q242 raised, Q243-Q247 unused.**

**[W53](doc/work-items/w53-what-a-run-retains-that-nothing-reads.md) is DONE and
[ADR 0046](doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
answers [Q19](doc/open-questions.md), open since P1: a run retains *(tasks settled) x (bytes each
returned)*, plus one further copy of each result that has arrived at a join that has NOT YET BECOME
TERMINAL.** `spec/run-state.md` is **v0.6** — section 6's *Bounded retention* bullet is struck,
section 7 is new, **`RN-R13`** is the rule; `spec/join-policy.md` is **v0.16**, giving
`JP-R11`/`JP-R12` the LIFETIME of what a join collects with **no rule id added and no policy
changed**. `spec/` is **7 documents, 44 examples, 90 rules**; L1-L5 is **26 files / 695 cases in five
runtimes**; **L6 is unmoved at 942 / 42**.

**A region's collection is released at THREE moments — two per region and one per run**: routed out
of (after the read), reported `unsatisfiable` (after the latch), and the run stopped (`OR-R10`). And
**outside that window nothing is RECORDED**, because a policy may lawfully settle a join with
branches still live — [Q95](doc/open-questions.md)'s own precondition, reaching the same region
through a second door. **Measured: the `arrivals` share of a completed region-bearing run goes 49.8%
to 0.0%, and ten thousand concurrent runs go 3174.8 MiB to 1610.9 MiB** — P15 fact 3's predicted
figure, to the decimal. Releasing after the read costs **0** at L1-L5 and **0** at L6; before it,
**14** (13 on the suite as it stood before this item). **Nothing is evicted from `inputs`**, refused
on fact 4 rather than on taste: a fold over a truncated log reports `completed` with **ZERO** nodes
and no signal.

**Its central finding is that a REACHABILITY SET CANNOT TELL AN ALIAS FROM A COPY, and both readers
reached it from opposite ends — the one subject they shared.** `RN-R13`'s first form said the
structures a settled result is reachable from are *exactly `{inputs, log}`*. The conformity reader
ran that predicate on a corpus flow declaring a `needs` and got a **third** name; the adequacy reader
made `outputsCache` **clone** what it stores — a real second copy of every result — **for ZERO
failures at every rung**, because both L2 fixtures declared no `needs` so the memo was `null` in all
eight cases. **That is P15 fact 1's own defect reproduced inside the test written to correct it** —
fact 1 recorded `outputsCache` as `null` because it enumerated properties on flows with no `needs`,
and the fix for it then chose its fixtures the same way. The rule is a **SET and an IDENTITY** now.

**`OR-R10` had a door that was already open and this item made it SILENT.** `append` calls
`onFoldInput` un-wrapped, so a re-entrant listener reaches `failRun` from **inside** `settleJoin` —
the door on the STACK, which `failRun`'s own enumeration missed. A stopped run routing out of a join
pre-dates W53; before it the successor carried the full collection and after it **`{}`**. Guarded, at
**0** failures at both rungs — **and the test written for it asserted the right thing by the WRONG
ROUTE**, a throw that unwinds past the guard, so removing the guard cost zero until rule 8's re-run
checked the reader's own edit back in.

**The adequacy reader's six blocking findings are ONE fact: the rule has exactly one observer, and it
ran one region kind at one depth.** Outside `test/driver/retention.test.ts`, rules 3, 4 and 5 and the
whole of `RN-R13` have **zero** observers. So a **nested** region and a **`fanout`** region could
each never release for zero — [W41](doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)'s
finding verbatim — the walk could not see a holder in a nested `Set` or a **cyclic** object while its
`catch` arm asserted the falsehood, its loop universe could be pinned, and seven of eight cases
deleted for zero. All closed, and **the universe binding caught the author's own wrong literal on its
first run**. **Readers 16 / 6 and 9 / 6, OVERLAP 2** — the twenty-ninth measurement, in band. **Rule
8: 36 probes, 32 caught, 4 survivors, 0 aborts**, run twice. **Q233-Q235 raised, Q236-Q237 unused;
census 182 / 131 / 2 / 49, 0 aborts; [Q142](doc/open-questions.md) measured before the gate and does
NOT fire.**

**Its declaration measured EIGHT facts and FIVE correct or sharpen a row it is built on** — the
seventeenth time a plan has found one of its own inputs wrong by trying to act on it. **The headline:
HALF of what a region-bearing run holds is a SECOND COPY that nothing reads.** The driver's
`arrivals` map aliases nothing — the collection is **49.8% of `bytes([inputs, arrivals])`** at
map arities 4, 16 **and** 64 over 64 KiB results, and the stored value is neither the log record's
`result` object nor the worker's own. **Clearing it after the join reads it costs 0 at L1-L5 and 0 at
L6**, with a negative control firing at **13 failures** when it is cleared before, and it takes ten
thousand concurrent runs from **3174.8 MiB to 1610.9 MiB**. *A whole structure leaving the driver is
invisible to every rung this repository has* — [Q214](doc/open-questions.md)'s shape a third time,
from the REMOVAL side. **And it does not reach the run that matters most**: a region whose join never
fires holds its arrivals for the life of the run.

**[Q19](doc/open-questions.md)'s row names the wrong variable, and so does `spec/run-state.md`.** Four
dimensions measured one at a time: **~262 B/node, ~469 B/fan-out branch, ~456 B/map instance** — one
variable, *how many tasks settle* — and **linear in the whole of every result**, which neither
document names. **A 4-node chain returning 256 KiB retains 1025 KiB; a 128-node chain returning one
key retains 33 KiB.** The footprint is *(tasks settled) x (bytes each returned)*. **And the row names
TWO structures where the driver has four** — `inputs` is what actually holds every result, is what
`foldInputs()` returns, and is in no row of the register; `log` is its record-kind subsequence **by
reference** and costs **16 B** on top.

**THE MEASURED RUN: the target scale RUNS, and the margin is a factor of one rather than of ten.**
1 000 runs x arity 4 x 1 KiB = **10.2 MiB**; 10 000 x 4 x 1 KiB = **101.8 MiB**; **10 000 x 10 x
16 KiB = 3174.8 MiB**; 1 000 x 50 x 16 KiB = **1584.9 MiB**. Two observers — `v8.serialize` and
`heapUsed` after a forced `gc()` — agreeing within 3% at the large sizes.

**`maxCompletedTasks` is NOT inheritable and its shape is worse here than Q19's row says.** It caps
`scheduler.tasks`, the scheduler's own map, and reaches nothing the driver holds — so there is no
answer to inherit, only a shape. **`fold()` over a log evicted to its last input reports `completed`
with ZERO nodes and ZERO regions**, no throw and no signal: *a plausible wrong answer rather than a
silent one*, which is what a fold defined as a pure function of a complete log does when the log stops
being complete. **That is the half that could make P15 a spec plan**, and it is the plan's decision 2:
nothing it decides may make `fold()` return a plausible wrong answer.

**[Q22](doc/open-questions.md)'s numbers do not reproduce as its row states them, and the cloneability
boundary is not where it draws it.** Re-taken **one case per process** — W46's settled method — the
single edge-hop clone is **0.64 ms** against 1.50 and a clone per map instance at N = 1000 is
**516.77 ms** against 2207.94. **The conclusion is unchanged and the argument is stronger**: still
~800x, still quadratic for a map. Every absolute is 2-5x lower, because W34's were taken accumulated
in one process — *a register row quoting an absolute is quoting a method.* **And a class instance
CLONES: it arrives as a plain `Object`** with its prototype and methods gone, `instanceof` false, **no
error and no report.** `OR-R6` makes the loud case a run failure; nothing anywhere is a rule about the
quiet one. **The remaining retention is load-bearing**: 110 of 124 corpus task nodes (**89%**) are
named by no `needs`, so *drop a result no reference can name* is decidable from the document — and it
is **not free**, because `RunState.nodes[taskId].result` **is** the retained result.

**The exit artifact is a MEASURED NUMBER rather than a flow, decided on a measurement**: `npm run
test:l6` is **4236 ms for 42 real runs**, ~101 ms each, so a thousand real runs is already over
`doc/workflow.md` section 8's whole **90 s** plan-gate budget. **A rung and a budget row are both
refused**, and both are on the plan's stop-and-ask list.

**And the scale target this plan is named for is cited from a document this machine cannot read.**
`FLOW_PLANNING.md` is in the scheduler repository and **is not in it** — lost when
[ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
`git worktree remove --force` went through the sibling, restored from a published package that ships
no planning documents. **`doc/concept.md` says *"thousands at a time"* and contains `1000s` nowhere**,
while [ADR 0023](doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
attributed the `1000s-10000s` figure **to it** — corrected in place. The three other citations name
`FLOW_PLANNING.md` and are accurate. *The claim is not withdrawn; the provenance is.*

**Census CONFIRMED for the FIFTEENTH plan running — 179 / 129 / 2 / 48**, 42 ids in both tables, 179
of 179 in exactly one cluster cell, **0 aborts on a parser written from scratch and right first
time**. **The declaration raises NO question.** **[Q142](doc/open-questions.md) FIRES and was
PREDICTED from the pre-edit counts** — `M4`'s margin was **50 links**, and four work-item documents
land in `doc/work-items`, which neither `removes` probe cuts.

**[P14](doc/plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md)'s RETRO is
run and `doc/workflow.md` is [v0.15](doc/workflow.md) — THREE changes adopted, FIVE refused, and its
central finding is that v0.14's OWN counter-measure was followed and did not work.** v0.14 adopted
*the prediction table states the SCOPE of the measurement it rests on* as the answer to P13's derived
reversal. **P14 is the first plan to carry that column, it stated prediction 1's scope CORRECTLY, and
prediction 1 reversed anyway** — because the fact underneath was **FALSE rather than narrow**. Section
6 pass 3 rule 3's sharpest kind, on a clause three commits old.

**THREE of four predictions REVERSED — the highest rate of any plan — and three trace to ONE wrong
declaration fact.** Re-measured at the retro: `map-over-region-output`'s reader `rank` sits at path
`-` with a region chain of **length 0**, in no region at all, where `reference-past-a-map-arity`'s
`publish` has the chain `[rank]`. *The two flows do not differ in arity; they differ in where the
reference is DECLARED.* **So P13's correction to P10's sentence gains a SECOND failure mode rather
than a replacement**: a derived prediction reverses when its measurement is narrower than its own
wording, **or when it is wrong**. What caught it is an ITEM re-running the fact it was handed — W49's
`Inputs:` line — which is section 1 rule 5's provenance clause reaching a PLAN's declaration for the
first time. **Prediction 4 is the one CONFIRMED**, and the one the plan could not have derived.

**THE THREE CHANGES.** **(1) Section 4 gains: a rung reported GREEN means its command EXITED 0 — a
line of its output is never the predicate.** Three occurrences, two plans, each `GATE EXIT=1` with
**zero lines beginning `FAIL`**: W42 twice, and W50, whose author read `npm run lint | tail -1` and saw
`Checked 49 files`, which `deno lint` prints either way. **It replaces an apparent CONTRADICTION
rather than a rule** — rule 8's *read the failure LINES, not the exit code* is right in the other
direction, and the document stated only one: *to call a rung green the exit code is NECESSARY; to call
a provocation caught it is NOT SUFFICIENT.* **The sentence has been in THIS file since v0.12 and W50
reproduced it anyway**, in a third secondary signal nobody had named. **(2) Section 6 gains: a
whole-tree measurement is taken with the tree HELD STILL** — W51's conformity reader caught
`examples/l6.ts` at **six digests** and a live rule-8 probe in `src/driver/driver.ts`, one snapshot
RED on correct code; W50's first gate ran in the background while W51's edits landed; **and the
retro itself broke the rule within the hour**, starting its confirming gate in the background and
editing two index files while it ran — stopped unfinished and re-run against the final tree. **(3) Section 1
rule 5's third direction gains a procedure: an item greps the tree for its OWN ID** — measured outside
`doc/`, `W33` at W32's commit returns **19** hits, `W34` at W33's **10**, `W50` at W49's **12**, and
`W42` and `W51` **0**.

**REFUSED, five, each with a measurement**: a **`doc/` check for the TWELFTH time** (W49's three false
claims about which rule moved, one self-contradictory **inside one cell**, so a check would need the
claim in a structured field nothing writes); a **rung for the EVIDENCE**, fourth plan running (of five
defects, **one has a rung and it is the one where the rung was green by not running**); an **`Owns`
pre-declaration rule**, with `AGENTS.md` yes/yes/**no** and `spec/README.md` yes/yes/**no**, so **the
exit artifact reached neither**; a **fourth list below `CROSS_ROW_SUBJECTS`**, and **P14 is the fourth
iteration and did not add one**, computing the clause from the row definitions and from the folded run
instead; and an **obligation that an item re-run its plan's facts**, which already exists in the
template's `Inputs` row and is what worked here.

**v0.14's three changes: all CONFIRMED and KEPT, each with a limit.** The **harness's ceiling clause**
produced its best case in W50 — a ceiling whose reason named a FUTURE rung, re-run at this retro and
now reporting **L6 exit 1, 2 failures**. **All seven ceilings the plan declared were re-measured: six
hold, one is closed.** *Its limit: the clause binds the HARNESS, and W49's second ceiling is PROSE* —
inverting `spec/flow-definition.md`'s own normative sentence back to the prefix rule leaves `npm test`,
`check:spec` and `check:docs` at **exit 0 with zero FAIL lines**. **(d)'s *a count is not a
membership*** was reached by an AUTHOR — *its limit: a membership list is a claim about a LAYER, and
W51 added no layer.* **The THIRD DIRECTION fired hardest, fourteen instances** — *its limit is a
second direction it does not name: a claim with an EXPIRY DATE is written by one item and falsified by
another.*

**Rule 8 across the plan: 71 provocations, 65 caught, SEVEN declared ceilings all MEASURED at the
retro, ZERO undeclared survivors, ZERO aborts**, each set run twice with 25 reader edits checked back
in. **Readers six passes, none empty — 38 / 13 blocking and 98 mutations / 16 survivors / 13
blocking, overlap 2, 2, 1**, the twenty-sixth to twenty-eighth measurements. **Late exceptions
2 → 6 → 3 = 11, ZERO undeclared** — W50's Record said FIVE where its own table declares six, corrected
under section 6 pass 3 rule 6. **Census CONFIRMED for the FOURTEENTH plan running — 179 / 129 / 2 /
48**, 0 aborts on a parser written from scratch and right first time. **And `doc/README.md`'s plan
history table had stopped at P9 for FOUR plans**, reproducing the defect its own note records, found
the same way — by a retro trying to append to it. **Q218-Q222 used; Q223-Q232 spent and not reused;
ADR 0044 taken, 0045 skipped; W52 closed as reserved and never issued. The next plan starts at W53,
Q233 and ADR 0046.**

**[W51](doc/work-items/w51-the-sibling-region-flow-on-real-workers.md) is DONE and it is P14's EXIT
ARTIFACT.** A reader inside one region receives **every** output of a sibling region, at arities
neither derives from the other, end to end on a real `FyflowScheduler` in **both** L6 runtimes.
**L6 is 942 assertions over 42 real runs**, from 879 / 40; L1-L5 is unmoved at **681 in five
runtimes**, which is the declared result.

**Its headline is the number it exists to move.** W50 measured ladder L6 **BLIND** to
[ADR 0044](doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
— all eleven aimed references in both corpora at a shared region depth of **zero**, so reverting the
resolver cost **0** L6 failures against 6 at L1-L5. Now: **the prefix rule costs 12 and making every
entry visible costs 2**, both from zero. **Two directions, because a wrong predicate can be wrong in
two** — and it is [Q214](doc/open-questions.md)'s shape in a second mechanism, which is **prediction 4
confirmed**.

**And the 12 decomposes**, which its adequacy reader took apart: **10 on one flow and 2 on the
other**, and the 10 are one stopped run with nine knock-ons. *A failure count is not a count of
observations.*

**Its adequacy reader found EVERY property the item's Outputs claim carried by literals** — four
blocking survivors, three costing one integer edit and the fourth costing nothing: both rows deleted
back to the pre-item numbers, the two arities made EQUAL with the row's key still reading *three
items, two branches*, the within-region reference removed so the permissive direction went back to
zero, and the sibling `fanout` pair's second reader deleted at an unmoved assertion count. **W23's
finding at its FOURTH iteration**, and `ROW_KEYS` and `DECLARED_TOTAL` reach none of them. Closed by
the reader's own prescription: a cross-row clause computed **from the row definitions and from the
folded run**, plus subjects naming it.

**Its conformity reader found the row asserting a FAN-OUT COMPLETION ORDER**, which
`doc/workflow.md` section 5 rule 5 forbids by name — measured **25/25 identical at `threaded: false`
and 12/12 REVERSED at `threaded: true`**, a knob nothing asserts. *The row was green on a property of
the inline pool's timer FIFO.* Closed by `Expectation.unorderedDispatch`, with the justification
asserted rather than stated.

**AND THE TREE MOVED FIVE TIMES UNDER THAT READER, WITH ONE SNAPSHOT RED** — its copy caught
`examples/l6.ts` at six digests and, at one instant, a **live rule-8 probe** in
`src/driver/driver.ts`. Section 6's recorded contamination reached from the other side: the reader
isolated correctly and **the author did not stop editing**. The cause is that rule 8's set runs
against the live tree by construction, and this item ran it during a review. **For the retro**, with
the counter-measure stated.

**Readers 7 / 2 blocking and 10 mutations / 4 real survivors / 4 blocking, overlap 1** — the
**twenty-eighth** measurement, inside the 0-4 band, neither primed. **Rule 8: 20 probes, 19 caught,
1 declared ceiling MEASURED, 0 survivors standing, 0 aborts**, with all seven of the readers' exact
edits checked back in. **THREE late exceptions, ZERO undeclared. Census unmoved at 179 / 129 / 2 / 48
— no question raised**, which is what an exit artifact looks like when its readers' findings all land
in the artifact. **Q223-Q228 skipped; no ADR.**

**[W50](doc/work-items/w50-what-the-run-carries-at-independent-arities.md) is DONE and the RESOLVER applies
[ADR 0044](doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md).**
`resolveReference`'s visibility filter is `outputIsVisible` at both declaration sites by one
expression, and **`isPathPrefix` is DELETED** — two predicates are two sources that can disagree, and
`deno lint` said so first: with the resolver re-pointed, L0 reported `isPathPrefix is never used`
before any test ran. L1-L5 is **25 files / 681 cases in five runtimes**; **L6 is unmoved at 879 / 40**;
`spec/examples/valid/` is **15 files**. **Reverting the resolver costs 6 L1-L5 failures and ZERO at
L6**, matching ADR 0044's declared candidate-(b) figure.

**P14's question at run time: every instance receives ALL N, at every arity pair, and the array is
the same whatever the two arities are** — asserted as a pair over two runs differing in both
directions. **P14 prediction 3's reversal is confirmed with a number**: the driver is exactly where
this landed, and six L1-L5 fixtures had to move because ADR 0044 removed the road they reached
`FD-R3` and `FD-C4` by.

**THE GATE WAS RED AT L0 AND THE AUTHOR'S OWN VERIFICATION MISSED IT.** The new test was `async` with
no `await`; `deno lint` exited **1**; `lint` is the chain's FIRST entry since ADR 0039, so
`npm run gate` would have been `EXIT 1` with **zero `FAIL` lines** and nothing after entry one
running. **Both readers found it independently.** The cause is exact: the author read
`npm run lint | tail -1`, saw `Checked 49 files` — which `deno lint` prints either way — and took it
for a pass. *The exit code is the predicate and a tail line is a secondary signal*, which is this
file's own sentence, reproduced two plans after it was written.

**Moving a fixture EVICTS the assertions living in it, and nothing in rule 8 asks what a deletion
took.** Three of the four things `FD-R3` normatively names — the branch path, the declaring node, the
target — lost their only observer, each costing **zero** afterwards; so did the NODE site's `site`
label, which was W42's adequacy reader's finding 42 with the measurement in its comment. All re-sited.
**And the harness's failure channel had THIRTEEN reads and not one positive case** — neutering
`onRunFailure` cost zero, and the compound with the resolver reverted came back at the same six.

**Ladder L6 is BLIND to this decision and the conformity reader measured why**: **all 11 aimed
references in both corpora have a shared region depth of ZERO**, so the filter never enters its loop
on anything L6 runs. **[Q214](doc/open-questions.md)'s shape in a second mechanism** — W47's was *a
document the validator refuses never starts*, this is *a filter no run exercises* — and it is what
W51's exit artifact has to close. **The narrowing direction was answered with a measured ABSENCE**:
the two shapes that would give it a second observer are refused, one by `FD-V27` and one by the
DRIVER ([Q156](doc/open-questions.md)), so the single expressible shape is W41's two-digit fixture.

**Readers 16 / 5 blocking and 36 mutations / 4 real survivors / 5 blocking, overlap 2** — the
**twenty-seventh** measurement, inside the 0-4 band, neither primed. **Rule 8: 24 probes, 20 caught,
4 declared ceilings MEASURED, 0 survivors standing, 0 aborts**, with all ten of the readers' exact
edits checked back in. **FIVE late exceptions, ZERO undeclared** — and two of them are
`spec/README.md` and `AGENTS.md` carrying *the resolver follows in W50*, true when W49 wrote it and
false the moment this item shipped, which is section 1 rule 5's THIRD direction firing on a claim that
NAMES the item that falsifies it. **Census 179 / 129 / 2 / 48**; **Q222 raised, ADR 0045 SKIPPED.**

**[W49](doc/work-items/w49-what-a-reference-across-sibling-regions-means.md) is DONE and
[ADR 0044](doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
answers [Q206](doc/open-questions.md): an output is visible to a reader when their two branch paths
AGREE ON THE REGIONS THEIR TWO CHAINS SHARE, and *one path is a prefix of the other* is that rule's
SPECIAL CASE.** `spec/flow-definition.md` is **v0.15**; `spec/` is unmoved at **7 documents, 43
examples, 89 rules** because no rule id is added or retired; L1-L5 is **25 files / 674 cases in five
runtimes**; **L6 is unmoved at 879 assertions over 40 real runs**. It is **candidate (b) of the three
P14 named**, put to the maintainer with both priced — a fourth refusal costs **11** L1-L5 failures and
removes a corpus flow, the predicate change costs **6** and removes none, and the 6 are a strict
SUBSET of the 11. **The DERIVATION ships here and the RESOLVER is W50's**, which is v0.8's own split
(a `map` node kind nothing dispatched for one item) and is written into the document.

**The defect was never about a `map` and never about arity, and P14's own facts said otherwise.**
Every sibling pair in both corpora is `map`/`map`, so nothing had seen the `fanout` half: constructed,
a reference from branch **1** of a second `fanout` region to branch **0** of the first **validates
with zero findings**, is `FD-V29`-certain, and **stops the run**, while the same reference in branch 0
resolves. **P14 fact 3's mechanism is corrected in place** — `map-over-region-output` works because
its reference sits on **`rank`, the map NODE**, at path `-` and in no region, so it receives all N
before any instance exists; *the two flows differ in WHERE the reference is declared, not in their
arities.* **THREE of P14's four predictions are already reversed**, and prediction 1 reversed because
the fact it rests on was wrong.

**Its conformity reader falsified the DERIVATION and it changed the CODE rather than the prose.** Both
documents argued *`containing(n)` is a nesting chain, so the regions containing both are the outermost
k of each* — **false on a document `validateDefinition` accepts with zero findings**, where a fanout
region's JOIN inside a nested region makes one node's shared entry the **innermost** of the other's
chain. The answer survived and the justification did not, *on the eve of that expression going into
the driver*; `sharedRegionDepth` now derives from the same walk the PATH is built from, and the
reader's counterexample is a checked-in fixture because re-sourcing it back cost **zero** everywhere
else. **And its adequacy reader found ADR 0044 rule 1's own clause had NO FIXTURE** — widening the
loop to compare every segment cost **0**, because every sibling pair in the corpus is TOP-LEVEL and
every nesting pair has a prefix as long as both paths. **The discriminating shape is two sibling
regions nested inside ONE outer branch**, where the two rules disagree at depth 1, and adding it
falsified this suite's own sibling claim on the first run. *A corpus is a claim about what shapes
EXIST, not about what shapes are legal* — P14 decision 3 named the `fanout` half in advance and
nobody named the DEPTH half.

**Three more of the conformity reader's six blocking findings were CLAIMS ABOUT WHICH RULE MOVED, and
all three were false.** *"`FD-C1` is the one rule that moves"* — its row was **byte-identical** and the
only rule row edited was `FD-R3`; *"no `FD-R` changes"* — beside *"`FD-R3` loses case (a)"*, forty
words apart in one cell; and section 7's cell for `reference-past-a-map-arity` asserting both that it
keeps `FD-R3` reachable and that it no longer does, in the present tense. **`FD-C1` is amended in fact
now**, which also closed the reader's finding that the predicate had shipped with **no rule id and no
Test cell** — W33's shape. **`FD-R3` NARROWS to one road**, the join-policy one
([Q218](doc/open-questions.md)).

**Rule 8: 27 probes, 26 caught, 1 declared ceiling MEASURED, 0 survivors standing, 0 aborts**, with
all eight of the readers' exact edits checked back in — and its own set found **four** holes before
either reader saw the tree, three of them the obligations v0.13 and v0.14 added, including a probe
that was **vacuous because the literal it substituted was set-equal to the value it replaced** (W47's
`c3` verbatim). **Readers 15 / 6 blocking and 52 mutations / 8 real survivors / 4 blocking, overlap
2** — the **twenty-sixth** measurement, inside the 0-4 band, neither primed. **TWO late exceptions,
zero undeclared**: `spec/README.md` by `C8`, and **`AGENTS.md`, which no check reaches** — its *what it
costs* paragraph named two things a run can refuse a reference for and this decision removes one,
which is section 1 rule 5's THIRD direction in the copy a consumer reads first. **Census CONFIRMED
for the FOURTEENTH plan running — 178 questions, 128 open, 2 deferred, 48 resolved**; the parser was
wrong in an **eleventh** direction and it is a CLAUSE ORDER rather than a clause. **Q218-Q221 raised,
Q206 RESOLVED.**

**[P14](doc/plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md)
is DECLARED — *what does a reference mean when two regions' arities are independent?*, and it is the
THIRD PRODUCT PLAN IN A ROW**, the first run of three since P1-P2-P3. It takes
**[Q206](doc/open-questions.md)**, the only open row that says the library cannot express something an
author would ordinarily want — the position [Q12](doc/open-questions.md) held before P10 and
[Q11](doc/open-questions.md)/[Q187](doc/open-questions.md) held before P12 and P13. **Three items, serial:
W49** (what a reference across sibling regions means, as **ADR 0044**), **W50** (what the run carries
at independent arities), **W51** (the exit artifact on real workers). **Reserves W49-W52,
Q218-Q232, ADR 0044-0045**, with ADR 0045 expected skipped.

**Its declaration measured SIX facts and THREE of them correct or sharpen the row it is built on** —
the fifteenth time a plan has found one wrong by trying to act on it. **Q206's own measurement
reproduces exactly**: on `reference-past-a-map-arity.flow.json` at `items 3 / slots 1`, `publish@0`
receives **one of three** `score` outputs and the other two are reachable from nowhere; at equal
arities each instance receives **its index-matched one**; past the arity the run **stops** with
`UnresolvedReference`.

**But the shape is in FOUR corpus flows and not one, and one of them is P12's own exit artifact.**
Over both corpora — 22 region-bearing flows of 30 — a sibling pair occurs in
`map-over-region-output.flow.json` (in **both**), `reference-past-a-map-arity.flow.json` and
`map-past-a-decision.flow.json`, which is [W47](doc/work-items/w47-the-blocked-flow-on-real-workers.md)'s
and is three commits old. **Every one is `map`/`map`; no `fanout` pair occurs anywhere.**

**And the defect is ARITY-DEPENDENT, which is why `map-over-region-output` works and is celebrated.**
That flow is [Q165](doc/open-questions.md)'s answer and carries the same sibling reference; it works
because **`rank`'s `over` names the resolved reference itself**, so the two arities are equal *by
construction* and the index-matched entry is the one that instance wants. **So the plan's question is
not *is the predicate wrong*** — it is *what does a reference mean when the two arities are
INDEPENDENT*, and *the index-matched one* is right for one flow and arbitrary for the others.
*A coupling removed by making two numbers equal is not a coupling removed.*

**There is NO spelling that reaches all of a sibling region's outputs, and the natural one is refused
by a DIFFERENT RULE.** All eight the grammar admits, measured: `"score"` and `"score?"` are refused by
`FD-V28`; `["score"]` and `["score?"]` give **one** entry; `"."` gives the reader's own item;
`"regroup"` gives a reshaping node's output — **and `"collect"`, the JOIN, is refused by `FD-V27`,
because a reference's target must be a TASK.** *A region's collection is unreachable by any reference
at all*, which nobody had written down, and it means the answer an author reaches for is refused by a
rule they would not think to read. **So Q206's *there is no form* is CONFIRMED and the workaround is a
reshaping `task` node — the workaround ADR 0040 exists to remove.**

**A sibling FANOUT pair behaves the OPPOSITE way and `FD-V28` is right about it**: constructed, since
the corpus has none, `["sA1"]` is **refused** and `"sA1"` is **ACCEPTED**, resolving to the one output
there is. **So the fix must not disturb the `fanout` half** —
[W41](doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)'s conformity-reader finding one rule
along, and it is decision 3: the evidence must include a sibling fanout pair, because the corpus
cannot supply one.

**The change surface is ONE expression and twenty citations**: `isPathPrefix` is declared once with
**two** call sites, while `spec/flow-definition.md` cites `FD-V28` **20** times. And the mechanism is
sharper than Q206's row: the visible set is *path-EQUAL or ancestor/descendant*, and **for siblings
only the equality case ever fires** — `isPathPrefix('0','2')` and `isPathPrefix('2','0')` are both
false, so `publish@0` sees `score@0` **because the strings match**. *Two unrelated regions mint
indices into one namespace, and equality is the prefix relation's reflexive case.*

**Three candidates, none preferred**: a fourth refusal, a change to the visibility predicate (which is
**ADR 0040's KEY**, and P13 decision 1's refusal was about an ITEM's authority rather than about the
question), or **making a region's COLLECTION referenceable** by relaxing `FD-V27`. **Decision 2 is a
hard constraint**: whatever wins, `map-over-region-output` keeps working and its L6 row keeps its
numbers. **[Q19](doc/open-questions.md) and [Q22](doc/open-questions.md) are declared OUT** and are the next
plan's subject, with three measured inputs already waiting.

**[P13](doc/plans/p13-when-is-a-declared-reference-refused.md)'s RETRO is run and
[`doc/workflow.md`](doc/workflow.md) is v0.14 — THREE changes adopted, FIVE refused, and its central
finding is that a HARNESS can produce a verdict having run NOTHING.** All three items shipped that
code path, all three declared ceilings against it, and **v0.11's two requirements on the harness were
satisfied throughout** — a control ran, every restore was asserted — which makes it section 6 pass 3
rule 3's sharpest kind: a rule followed that did not work. What found it is
[W47](doc/work-items/w47-the-blocked-flow-on-real-workers.md)'s conformity reader **timing** a probe,
**0.26 s against 3.4 s** for one that runs.

**The retro measured all ELEVEN ceilings the plan declared, and the yield is a number rather than a
ratio.** Eight of W45's and W46's come back clean and their reasons hold. **W47's `c3` was false** —
the literal it substituted was **set-equal** to the value it replaced, so the probe changed the input
without changing anything observable, under a reason that was *about the observer rather than about
the fact*, which is (c)'s LIMIT's own closing sentence. **And W45's `e4` is stale on the tree the plan
ships**: *a member added to `ROLES` with no arm and no pool costs ZERO* was true when written and W47
closed it — the same mutation now costs **2 at L6**, which a run against L1 cannot see. **So the
clause names the rung**: run each declared survivor against the rung its own reason cites. Both
corrections are in those items' own files under pass 3 rule 6.

**Change 2: obligation (d) gains *a count is not a membership*.** (d) already asks *does anything
COUNT it from elsewhere*, and `DECLARED_TOTAL` **is** that — and the same deletion has walked out past
it three times in three plans: W23's four L6 rows for one number, W35's five more plus the whole
cross-row block for two, and **W47's entire cross-row layer for two numbers and one import line**, back
to the exact pre-item figures with every check green. So a layer declares its **members by name** —
`ROW_KEYS` and now `CROSS_ROW_SUBJECTS` — with the limit adopted alongside: both are literals, so a
member and its name are two edits in one diff ([Q217](doc/open-questions.md)), and *three iterations each
closed one layer further out is an argument that the answer is not a fourth list.*

**Change 3: section 1 rule 5's writing clause gains a THIRD direction — a WITHDRAWN claim is searched
for.** W46's two readers withdrew four claims and **all four survived in `spec/README.md`'s own row
for the document W46 had just changed, in a file W46 edited in the same commit**; W45's
`validate.ts` header said *"Twenty-four refusals"* where the file implements 27; W47's reader found
**seven** stale counts in `examples/**` whose true values that item's own new clauses compute three
lines away. *An index contradicts the document it indexes on precisely the sentence that was just
corrected, because that is the sentence somebody was looking at.*

**REFUSED, five, each with a measurement.** An **`Owns` pre-declaration rule — and P13 WAS the test
v0.13 asked for**, answered *no*: over three items `AGENTS.md` is yes/yes/**no**, `spec/README.md`
yes/yes/yes, `scripts/check-docs.mjs` **no**/yes/**no**, so only one of the three was taken by all
three and a rule naming all three would have been wrong twice on each of the other two
([Q157](doc/open-questions.md)); late exceptions fell **6 → 4 → 1** with zero undeclared. A **rung for the
EVIDENCE**, for the third plan running — **exactly one of the defects this retro discusses has a rung,
and it is the one where the rung's own shape is the finding** ([Q214](doc/open-questions.md)). A **`doc/`
check for the ELEVENTH time**, and P13 gives the sharpest instance against it: the four false claims
were prose in a table cell whose only machine-comparable field is the version column, so the check
would have to compare English — *a number in prose is checkable and a sentence is not*. A rule about
where a **detector's positive fixture** lives, at one occurrence. And a fourth list below
`CROSS_ROW_SUBJECTS`.

**TWO of four predictions REVERSED, and one is a DERIVED prediction reversing — which P10's retro
settled could not happen.** Prediction 1's own stated reversal condition is what reversed it: W45's
evidence clause obliged the item to try to construct a flow dominance refuses and an author wants,
and **it constructed twenty-two**. The literal half held — the corpus WRITES 6 and dominance refuses
0 — and the inference did not, because **the measurement answered a narrower question than the
prediction's wording**: what the corpus writes, against a corpus that ADMITS 127. P8's retro's third
count shape firing on a PREDICTION. **P10's sentence is corrected in place**: a derived prediction is
reversible exactly when the scope of its measurement is narrower than its own wording.

**v0.13's three changes: all CONFIRMED and KEPT, each with a limit found.** *Both ways* is a
**direction, not an observer count** — W47 compared three lists pairwise both ways and its reader
defeated all three with one source swap ([Q216](doc/open-questions.md)); **(c)'s LIMIT extends to a
DETECTOR**, a regex with one observer and no case that made it fire; and the **PAIR requirement found
no limit**. **And v0.12's *the author reaches none of them* is REVERSED** — three instances, and the
mechanism is visible: an obligation run as a step in a set passes, and the same obligation asked as a
question of one artefact fires.

**Rule 8 across the plan: 115 provocations, 95 caught, 15 declared survivors, 2 bound, ZERO
undeclared survivors, ZERO aborts.** **Readers six passes, none empty — 44 / 24 blocking and 90
mutations / 30 survivors / 17 blocking, overlap 2, 2, 2**, the twenty-third to twenty-fifth
measurements. **Census CONFIRMED for the THIRTEENTH plan running — 174 / 125 / 2 / 47.**
**Q199-Q217 all used; ADR 0042 taken, 0043 skipped; W48 closed as reserved and never issued. The next
plan starts at W49, Q218 and ADR 0044.**

**[W47](doc/work-items/w47-the-blocked-flow-on-real-workers.md) is DONE and it is P13's EXIT
ARTIFACT.** Both flows run end to end on a real `FyflowScheduler` in **both** L6 runtimes — the one
the plan exists for, and a second the item's own adequacy reader **built**. **L6 is 879 assertions
over 40 real runs**, from 806 / 38; `spec/` is unmoved at **7 documents, 43 examples, 89 rules** and
L1-L5 at **24 files / 656 cases in five runtimes**, which is the declared result.

**Its headline is that ladder L6 was BLIND to [ADR 0042](doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)'s
headline for a whole item.** Deleting `FD-V29` cost **ZERO** L6 failures before this item — against a
clean control both sides — while `FD-C4` cost 5 and the suffix left unparsed stopped the run from
reporting at all. **Every reference L6 runs is either `"."`, certain, or written with a `?`, because a
row IS a run and a document `FD-V29` refuses does not start.** *A rule whose whole effect is that a
run never happens is invisible to a rung made of runs* ([Q214](doc/open-questions.md)) —
[W35](doc/work-items/w35-a-map-on-real-workers.md)'s *`N` too small completes and is silent* one rule
along, from the other direction. **The scope is stated**: L6 was the only blind rung, since the same
deletion costs **7** at L1-L5 and fails `check-docs` `X4` on `AGENTS.md`'s own executed snippet. It
now costs **3**, and reverting W45 whole is **12** — additive, `FD-V29` 3 and `FD-C4` 9.

**Output (3) was answered with a measured ABSENCE and BOTH READERS took it apart from opposite
ends.** The item recorded `["n?"]` as unreachable at L6 because *"a map region inside a branch the run
loses is a flow this repository does not have"*. Its **conformity reader** measured that false on
`nested-map.flow.json`, **which L6 already runs**, and named `map-in-fanout` as a second instance —
**both are in ADR 0042's own seven-shape row**. Its **adequacy reader** measured the consequence —
`resolveReference`'s array arm, ADR 0042 rule 4's `[]` half, **deletable for ZERO** — and then
**constructed the flow that observes it**. *Two readers, opposite ends, one hole.* The coverage is
therefore **taken rather than recorded**: `map-past-a-decision.flow.json` is `map-over-region-output`
plus **one guarded edge**, which makes **all three of section 3's axes decide one reference** —
without the suffix `FD-V29`, at the one form `FD-V28`, as written accepted. Its pair is *the array
RESOLVES* against *the array is `[]`*, and the second reaches
[W33](doc/work-items/w33-a-map-at-run-time-arity.md)'s N = 0 ruling **from a reference rather than
from a worker returning an empty list**.

**The two sharpest findings are about the HARNESS rather than the artifact, and the second hid the
first.** A declared **ceiling** whose stated reason was false — the registry *is* a source both
assertions read, and the probe survived only because the literal it substituted was **set-equal to
the derived value**, which is W17's vacuous probe verbatim. And **the harness ran NOTHING for its
five declared-survivor rows**: with `red: []` the command list was empty and the verdict restated the
declaration, **0.26 s against 3.4 s for a real probe** — [Q151](doc/open-questions.md)'s shape one
obligation across. **Closing that found five more defects in the same pass.** Six more of the
conformity reader's findings were claims that were false, and **five of the six were COUNTS in files
this item owns** while the item's own new clauses computed the same lists correctly.

**Its adequacy reader's central finding is [W23](doc/work-items/w23-a-nested-flow-on-real-workers.md)'s
at its THIRD iteration**: deleting **all** of W47's cross-row work took **two integer edits and one
import line**, and L6 came back at the exact pre-W47 numbers — green, both runtimes, all five checks
at exit 0 — and each of the three blocks was separately deletable the same way. **W35 answered the
ROW half with `ROW_KEYS`, set equality and order; nothing did that for the CROSS-ROW layer**, which is
where three consecutive items have put their whole output. `CROSS_ROW_SUBJECTS` is the analogue — the
same deletion now costs 1 and **names which subject left** — and **the regress moves rather than
closing**, which is stated ([Q217](doc/open-questions.md)). Two more of its blocking findings are
**obligation (c)'s LIMIT unmet in the block that names it by id** ([Q216](doc/open-questions.md)):
sourcing one of three lists from another costs 0 and the compound comes back green, so *"each clause
is the other two's evidence"* was false, and it is **recorded as a limit rather than repaired**
because the only second derivation available is a second regex over the same text.

**Rule 8: 43 provocations, 33 CAUGHT, 7 declared survivors all MEASURED, 2 BOUND, 0 undeclared, 0
aborts, 0 wrong-reason**, run twice with **seven of the readers' exact edits checked in** — and the
re-run found a probe of the author's own reporting **WRONG-REASON because the ARTIFACT crashed** on an
unguarded dereference rather than failing an assertion, which is v0.10's own requirement on the set
firing inside the item that quotes it. **Readers 14 / 8 blocking and 27 mutations / 13 survivors / 6
blocking, overlap 2** — the **twenty-fifth** measurement, inside the 0-4 band, both unprimed. **ONE
late exception, zero undeclared** — the lowest of any product item in three plans, and it is
`spec/README.md`, whose v0.14 row carried **four claims W46's own readers had withdrawn** in a cell
`C8` does not compare. **P13's `Owns` test is answered ONE OF THREE here**, so over the plan it is `AGENTS.md` yes/yes/no, `spec/README.md` yes/yes/yes,
`scripts/check-docs.mjs` no/yes/no — **a pre-declaration rule would have been wrong twice on two of
the three** ([Q157](doc/open-questions.md)). **Census CONFIRMED for the THIRTEENTH plan running — 174
questions, 125 open, 2 deferred, 47 resolved**, 0 aborts, on a parser written from scratch that was
wrong in **three** directions first and then found a **fourth** register row rendering wrong:
unescaped pipes **inside a code span**, in the row W45 added *about a census parser*, and **the row
raised to record it carried the defect too** ([Q215](doc/open-questions.md)). **Q213-Q217 used; no
ADR — 0042 is W45's and 0043 was skipped.** `npm run gate` is **`GATE EXIT=0`, zero FAIL lines,
15 entries**, with L1-L5 **measured at 656 in all five runtimes** rather than inherited — and
**[Q142](doc/open-questions.md) was re-measured and does NOT fire**, the first time in six retunes
that the prediction has been checked and come back no.

**[W46](doc/work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md) is DONE, it takes NO
ADR, and [Q186](doc/open-questions.md) is DECIDED and deliberately NOT CLOSED.** `spec/flow-definition.md`
is **v0.14** — section 3's cost blockquote gains the measurement, the METHOD, and a four-row table of
why **nothing warns** — on [Q190](doc/open-questions.md)'s precedent: recorded in that section and
asserted at ladder L2. **[P13](doc/plans/p13-when-is-a-declared-reference-refused.md) prediction 3
predicted exactly this and is CONFIRMED**, with its stated reversal condition checked rather than
assumed. `spec/` is unmoved at **7 documents, 43 examples, 89 rules**; L1-L5 is **24 files / 656 cases
in five runtimes**; **L6 is unmoved at 806 / 38**, which is the declared result.

**Its central finding is that a VERDICT can be right for a reason that is the negation of its own
evidence.** Three of the four reasons hold. **The second was inverted**: it said the size-free static
predicate — *a reference on a node inside a map region naming one outside it* — *warns about the
feature*, on the ground that `map-with-context`'s reference is a false positive. **Measured on the
shipped document, unedited: 604.9-643.6 ms as the corpus writes it against 7.9-9.1 ms with the `run`
key removed — ~70x, on the showcase itself.** The predicate is **right**, because `ingest`'s result
*holds the array `over` names*, which is P13 fact 4 exactly. **The conclusion held and its reason was
the opposite of the truth**: it is declined because it fires on **3 of 3 intended uses and nothing
else**, so it restates the feature rather than diagnosing anything. **And it is not the only such
predicate** — both readers independently constructed a second one that fires on the same 3.
[Q193](doc/open-questions.md)'s shape, on a decision with no ADR.

**And the item's own headline METHOD claim did not reproduce.** It said the numbers this document had
carried since v0.11 were taken by a method *worth 2.5x in run POSITION*, with the two large cases
*swapping their numbers exactly*. Its conformity reader could reproduce neither: **the comparison had
been reversed-in-one-process against one-case-per-process, two variables at once**, and the isolating
comparison was never taken. Taken now, **ORDER costs nothing** — forward and reversed medians agree —
and **ACCUMULATION costs up to 4.4x**: five passes over one list in one process take a cheap row from
**6.8 to 30.1 ms** and the large row from **622 to 1632**. So *later in the process is dearer whatever
the order*, the last row of a one-process table carries the whole accumulation, **the cliff was robust
throughout, and the spread among the three cheap rows never was a measurement**.
[Q208](doc/open-questions.md).

**Two more of the four reasons were repaired rather than kept.** *There is no CHANNEL* stated an
absence where [ADR 0027](doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)'s
*ignore it, but report it* is an unweighed choice — it is weighed now, and declined because
`onUnmintedTask` reports a fact about a RUN while *resolved once per item* is a fact about the
DOCUMENT. And the **~1%** cost of measuring was unreproducible; what reproduces is **~29% of ONE
clone**, taken once per (node, key) against N clones, so **~0.03%** of what it would warn about at
N = 1000 — *a number that could not be reproduced replaced by one that can, and the argument got
stronger*.

**Q186 stays OPEN because closing it would delete the question.** *How large is too large* occurs in
**exactly one place in the register — Q186's own row** — and not in [Q22](doc/open-questions.md), which
asks whether a result must be structured-**cloneable**. Its status reads *decided as NOTHING WARNS,
and the decision is written down*, with a forcing condition. Conformity reader.

**Its L2 suite was REPLACED and both readers reached that from different ends.** The first asserted
*N instances, N distinct copies* — and **doubling the clones cost 0**, because a `Set` over what N
receivers RECEIVED is bounded by N however many copies were discarded; it was also a **fourth
restatement** of what W41 and W42 already assert 2-7 ways. Replaced by the **product** — the summed
serialised length of the N composed payloads, which *is* arity x size, at **two arities** so
*quadratic* is distinguishable from *linear in the arity* — and by the **decision**,
`map-with-context` validating with zero findings, which is what a warning channel would break.
*A clock-free proxy for a cost has to be bounded in the direction the cost grows*
([Q212](doc/open-questions.md)), and **the number of copies a driver MAKES is observable to no test here**.

**Three documents stated the same five figures and nothing compared any two** — editing either for
**zero** while destroying the `71x` claim in its own table. `check-docs` gains **`X6`**, comparing
them both ways and **by column position** rather than by magnitude, which its own first run caught.
**And `X6` produced three findings of its own, each a rule this repository already had**:
`ALL_CHECKS` was a closed allowlist, so **`X6` shipped with four clauses, no probe and no grading at
14/14, 8/8, exit 0** ([Q43](doc/open-questions.md)'s class, [Q209](doc/open-questions.md), closed here and
live in three other self-tests); `X6` then read `AGENTS.md` **by name** rather than the document the
check is pointed at, so all three of its probes exited 0 — obligation (e)'s **second question** in a
third shape and **the first of the three caught by the author's own set** ([Q210](doc/open-questions.md));
and its META entry came back **STILL CAUGHT** because both directions of the comparison co-fire —
W29's shape, closed by a probe per direction. `check:docs:selftest` is **18 probes / 10 gradings**
from 14 / 8.

**Rule 8: 22 probes, 16 caught, 5 declared ceilings, 0 survivors standing, 0 aborts**, the whole set
rebuilt because the suite the first one aimed at was replaced — **and the re-run found a guard written
to close a reader's finding**: *the ratio RISES with the arity* is satisfied by making the LOW baseline
bigger, which is what collapsing the low pair does, for **0**. **Readers 16 / 8 blocking and 22
mutations / 10 survivors / 8 blocking, overlap 2** — the **twenty-fourth** measurement, inside the 0-4
band, both unprimed, and their split is again the one the two roles predict. **FOUR late exceptions,
zero undeclared**, plus a scoping defect in the declaration's own `Owns` line — *an `Owns` line that
names a SECTION cannot bound a document whose header is checked against it*. **So P13's `Owns`
pre-declaration test is answered `AGENTS.md` YES, `spec/README.md` YES, `scripts/check-docs.mjs` YES**
— all three over the two items, exactly as P12's retro predicted and refused to act on
([Q157](doc/open-questions.md)). **Census CONFIRMED for the TWELFTH plan running — 169 questions, 120
open, 2 deferred, 47 resolved.** **Q208-Q212 used; ADR 0043 SKIPPED and not reused.**

**[W45](doc/work-items/w45-what-a-reference-must-be-able-to-say.md) is DONE and
[ADR 0042](doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)
answers [Q187](doc/open-questions.md): a reference says whether it is CONDITIONAL, and the bare form
means the target certainly ran.** `spec/flow-definition.md` is **v0.13** — section 3's reference
table gains **one row**, a `?` MODIFIER on either aimed form, and section 5 gains **`FD-V29`**, which
refuses an *unconditional* reference a run can reach the declaring node without. **`FD-V27` is the
one rule that does NOT move**, on `FD-V28`'s own stated precedent that a different fix earns a
different id. `spec/` is **7 documents, 43 examples, 89 rules**; L1-L5 is **24 files / 654 cases in
five runtimes**; **L6 is 806 assertions over 38 real runs**, from 760 / 36.

**P13 named a fork and it was not one, and the measurement that says so is one nobody had taken.**
Fact 2 reproduces exactly — the two corpora WRITE 6 aimed references and dominance refuses **0** —
**and its zero is a property of what the corpus WRITES.** The corpus **ADMITS 127**, and **plain
dominance refuses 30 in 13 of the 26 flows** while a **certainty** walk refuses **8 over 7 distinct
shapes**, a strict subset. **So 22 of the 30 are references a correct rule accepts**, one of them
`needs: {"a": "scoreA"}` after a two-branch join — a document `FD-V28`'s own note in the same file
calls *"a valid document"*. **A dominance rule would have contradicted `FD-V28` nine lines up.** The
cause is that the graph has two kinds of branching and dominance reads them alike: a `task`'s edges
are **disjunctive**, a region's branches **conjunctive** (`JP-R5`), so a branch entry never dominates
its own join and has always been dispatched by the time it fires.

**So `FD-V29` AND the modifier, and each is what makes the other affordable** — the rule can refuse
an uncertain reference only because the form gives the author something to write instead, and the
form is more than an affordance only because the rule refuses the alternative. **That is ADR 0040's
own finding about [Q11](doc/open-questions.md) one plan on** — the register presented three candidates
as a fork and they were a stack.

**Its four headline numbers were WRONG when first written, and its conformity reader re-derived every
one.** 121 / 29 / 7 / *14 of 25 flows*, from a probe whose hard-coded registry did not carry
`earlierWasLowConfidence` — so `FD-V4` fired on one of the two `decision-on-an-earlier-step` files
and the walk silently ran over 25 files where the same table's row above says 26. **`22` was the only
one of five that survived.** And re-taking it found a second thing: once `FD-V29` ships, using the
whole validator as the admission test refuses **exactly** the certainty set, so it reports *certainty
refuses 0* and the measurement is circular — measured, and the test now excludes that rule by name.
**The four properties the decision rests on are an executable L1 suite rather than prose in three
files.** [Q199](doc/open-questions.md).

**Both readers found the certainty rule's stated LIMIT had no observer of any kind, from opposite
ends** — and the item's own `Verification` row claimed it was *"asserted at L2"* while the file it
pointed at said in prose that the case was deliberately not a fixture, citing a Record that did not
yet exist. **And every one of FIVE statements of that limit named ONE ROAD**: *parked at
`user_action`* is inessential — a policy satisfied on the first arrival, with the other branch entry
simply never settling, dispatches the reader and `FD-R3` fires with no `user_action` anywhere.
Asserted now, with a **shipped-policy control** beside it so the row is a statement about `FD-V29`
rather than about any policy this repository ships.

**Its adequacy reader found `FD-V29`'s own central expression unexercised above two predecessors.**
`for (const p of ps.slice(1))` narrowed to `ps.slice(1, 2)` cost **0 failures** — every fixture in
the tree merged exactly two paths — and the rule is *"a node is on EVERY path"*. On a three-way merge
the narrowed walk **accepts** the document and the workload that skips the target dies at run time:
**Q187 re-opened for one edited slice bound.** And the grammar's four free refusals were held down by
one integer twenty lines below the comment that names that defect, so the fix GENERATES them —
sixteen spellings over two axes, three accepted — after which the four rows were deletable for zero
and were removed.

**And the sharpest finding belongs to neither the ADR nor the rule: `FD-V28` asks a REGION question,
resolution applies a PATH filter, and section 3 asserted they agree.** For **sibling** map regions at
the same depth they do not — `FD-V28` demands `["score"]` and says *one output per ITEM*, and the
array holds **at most one**, the output whose branch path is numerically equal to the reader's own
index in an unrelated region. **There is no form an author can write from inside the second region
that yields all of the first's outputs.** The cause is `FD-C1`'s prefix predicate, which is
ADR 0040's KEY and which P13 decision 1 forbids this plan from reopening —
**[Q206](doc/open-questions.md)**, recorded with the measurement in section 3.

**Rule 8: 50 provocations, 46 caught, 3 declared ceilings, 0 survivors standing, 0 aborts**, run
twice with **ten of the readers' exact edits** checked back in — and the re-run caught **`Q102`'s
shape inside the fix for a reader's finding about `Q102`'s shape**, twice. **Readers 14 / 8 blocking
and 41 mutations / 6 real survivors / 3 blocking, overlap 2** — the **twenty-third** measurement,
inside the 0-4 band, both unprimed, and their split is the one the two roles predict: the conformity
reader found **claims that were false**, four of them numbers the decision is argued from; the
adequacy reader found **bounds that were not there**, all three of its blocking findings being loop
or list bounds rather than values. **SIX late exceptions, zero undeclared**, and the answer to the
test P13 set is **`AGENTS.md` yes, `spec/README.md` yes, `scripts/check-docs.mjs` NO** — while the
two exceptions that cost real work are the ones the plan's own index row created
([Q203](doc/open-questions.md)). **Census CONFIRMED for the TWELFTH plan running — 164 questions, 115
open, 2 deferred, 47 resolved**; the parser aborted **zero** times on its first run and then found a
defect in one of its own clauses, the tenth direction ([Q204](doc/open-questions.md)).
**Q199-Q207 used, the block extended by two; ADR 0042 taken.**

**[P13](doc/plans/p13-when-is-a-declared-reference-refused.md) is DECLARED — *when is a declared
reference refused, and what does it cost?*, and it is the SECOND PRODUCT PLAN IN A ROW**, the first
back-to-back pair since P1-P2. [P12](doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)
gave an author a way to reach an earlier node's output and left **two ways to write one that does not
work**, both raised by its own readers rather than by its authors. Three items, serial: **W45**
([Q187](doc/open-questions.md) — reachability is not dominance, as **ADR 0042**), **W46**
([Q186](doc/open-questions.md) — the cost nothing warns about), **W47** (the blocked flow on real
workers). **Reserves W45-W48, Q199-Q213, ADR 0042-0043** — fifteen questions, because P11 reserved
five and extended twice and P12 reserved ten and extended once.

**Its question is [ADR 0002](doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 3 failing against a rule written four days earlier.** `FD-V27` requires **reachability** and not
**dominance**, so a reference across a decision is accepted at instantiation and refused at run time
*on the one workload that takes the other branch* — the exact shape that rule exists to prevent.
**Reproduced at the declaration**: `validateDefinition` returns **0 findings**, the LOW payload
dispatches all four tasks, and the HIGH payload dispatches two and stops with `UnresolvedReference`
naming the node, the key, the target and the path. *The message is good and the moment is wrong.*

**Its declaration measured SIX facts, and EVERY REGISTER ROW HELD — which breaks a streak of
FOURTEEN consecutive plans finding one wrong by trying to act on it.** The two things that turned out
wrong were **the declaration's own probes**, and both are recorded as such: a crude search reported an
expression for *optional* in section 3 that is the `optional` field on a task node, and the first
cost fixture named a "small" node whose result **contained** the large array. **That second error is
the plan's sharpest input**: it cost **562.6 ms**, the full cliff, from a key an author wrote in order
to get something small — because **a reference names a NODE, so it carries everything that node
returned**, which is one step further out than [Q186](doc/open-questions.md)'s row states it.

**And the objection W41 made its choice on has NO INSTANCE in this repository.** Dominance over the
entry-rooted DAG is computable, and run across **both** corpora — 26 flows, **6 aimed references** —
it would refuse **0 of the 6**, while refusing the broken flow above. [Q187](doc/open-questions.md)'s
row says a dominance rule *refuses valid flows whose every real workload takes the producing branch*;
nothing here exhibits one. **The scope is stated rather than generalised**: that measures that the
corpus contains no counter-example, not that none exists — and W45's evidence is required to try to
construct one. **[Q186](doc/open-questions.md)'s cliff re-measured on today's tree at
8.3 / 8.7 / 10.0 / 560.5 ms against W41's 6.5 / 8.0 / 10.6 / 546.6** — 64x, and which node id the
author typed is the whole of the difference.

**[Q190](doc/open-questions.md) is confirmed in BOTH shapes and declared OUT**, because its status
cell already reads *decided as ACCEPTED* and its forcing condition has not occurred — reopening it
would be section 6 pass 3 rule 1's *measuring your own output*. **And P13 is the test of a rule P12's
retro refused**: neither W45 nor W46 pre-declares `AGENTS.md`, `spec/README.md` or
`scripts/check-docs.mjs`, so if both take all three as late exceptions again, the next retro should
adopt it.


**[P12](doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md) is COMPLETE and RETRO'D, and its question — *what does a node receive, and what does a decision see?* — is answered by TWO ADRs.** What a node can reach is the run's own outputs, named by the pair `(node id, branchPath)` and reached only by DECLARING them ([ADR 0040](doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)); a decision sees its node's effective outcome plus whatever its **own edge** declares ([ADR 0041](doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)). **[Q11](doc/open-questions.md)'s row asked the wrong shape of question** — its three candidates are a **stack**, not a fork, and only the third reaches a worker at all because `createTask` takes ONE value. **Both flows the plan exists for run on real workers in both L6 runtimes**; L6 is **760 assertions over 36 real runs**, from 638 / 31.

**Its central finding is that ALL THREE items shipped a claim their own evidence could not falsify, and in each case the author had FOLLOWED this document's procedure for exactly that.** W41's 37 probes all used a map region, so a rule wrong about `fanout` regions was unreachable from the set. W42 wrote an ADR whose forcing fact was **false** and whose conclusion was right. W43 built an exit artifact in which every map instance scored **zero** and would have shipped it as evidence for a rule it could not distinguish from its negation. **Six of the plan's seven defects have NO RUNG, and every one of the six is in the EVIDENCE rather than in the product** — [P11](doc/plans/p11-what-should-the-gate-prove.md)'s finding for a second plan running, this time on a PRODUCT plan. *L0-L6 climb over what the library does; nothing climbs over whether the thing that says so could have said otherwise.*

**v0.13 adopts THREE changes and refuses FOUR.** **(1) Rule 8 obligation (e) gains a THIRD SHAPE — a LIST is a claim about another list**, four instances in three items (`RULE_PREFIXES` and an `accepted` list, `EDGE_KEYS`, and a `Role` union / `switch` arms / pool registry), procedure *find the other list and compare BOTH WAYS*. **(2) Obligation (c)'s procedure gains its LIMIT**: W34's compound probe was FOLLOWED and came back green, because the clause had exactly one observer and the probe removed it — *a sensor cannot corroborate itself* — so **count the observers** and, at one, add a second independent expression rather than a better probe. **(3) A fourth requirement on the SET: whatever makes a discriminating PAIR differ is itself a claim** — W17's two join-path rows and BOTH of W43's pairs collapsed for **0**, and with either collapsed the mechanism underneath was deletable for 0 too. **REFUSED**: a ladder level for L6's own self-test (on cost; second time a level has been proposed and refused), an `Owns` pre-declaration rule (twenty-two late exceptions, **zero undeclared**), an obligation for the evidence behind a decision's stated reason, and a `doc/` check **for the TENTH time**.

**All four predictions have a verdict, prediction 3 REVERSED, and its reversal was justified by a FALSE FACT** — the third case in the sequence P10 and P11 built, and the sharpest ([Q193](doc/open-questions.md)). **And the verdict v0.12 asked for: obligation (e)'s second question FIRED on a product item, four times** — two instances in `scripts/**`, one in `src/`, one in `examples/**`, so the shape is not a property of check-writing. **The ANSWER is not portable even though the question is**: W43's was a TYPE, which fails at L0 and is unavailable to a `.mjs` check, and **a type closes one direction only** ([Q196](doc/open-questions.md)). **The author reaches none of them** — nine instantiations of (e) as written, all nine passing, every one of the four found by a reader. **Readers six passes, overlap 1 / 2 / 2** (the twentieth to twenty-second measurements, all in the 0-4 band) — **and all three items got that ORDINAL wrong by two, each inheriting it from the one before**, corrected under section 6 pass 3 rule 6. **Rule 8 across the plan: 137 provocations, 121 caught, ZERO undeclared survivors, ZERO aborts.** **W44 CLOSED as reserved and never issued; Q184-Q198 all used, the block extended once; ADR 0040 and 0041 both taken. The next plan starts at W45, Q199 and ADR 0042.** **Census CONFIRMED for the ELEVENTH plan running — 155 questions, 107 open, 2 deferred, 46 resolved.**

**[W43](doc/work-items/w43-the-two-blocked-flows-on-real-workers.md) is DONE and it is P12's EXIT ARTIFACT: both ordinary flows this library could not express before this plan now run end to end on a real `FyflowScheduler`, in BOTH L6 runtimes.** [Q166](doc/open-questions.md)'s *score each item against the run's config* runs at `needs: {"item": ".", "run": "ingest"}`, three instances scoring 4 / 8 / 12 from **both** declared keys; [Q165](doc/open-questions.md)'s *score, then fan out over the scores* runs a second map over `needs: {"scores": ["score"]}` with **no `over: "0"` anywhere**, so the brittleness that row names is gone rather than worked around — two regions, and the second's arity comes from what the first's branches returned. Ladder L6 is **760 assertions over 36 real runs**, from 638 / 31. **`spec/` is unmoved at 7 documents, 40 examples, 87 rules and L1-L5 at 633 cases in five runtimes, which is the declared result — an exit artifact writes no rule.** **What reverting each item costs: W41 is 18 L6 failures, W42 is 2, both are 20**, additive; **W42's was 0 before this item**, because neither flow the plan named carries an edge-level `needs`.

**Its declaration step found that both flows RUN AND PROVE NOTHING.** They complete on real workers exactly as the corpus writes them, and `map-with-context`'s three instances each returned `{confidence: 0, score: 0}` — every shipped worker role reads `payload.confidence`, and under a `needs` the payload is **exactly** the object `needs` describes. *A row that cannot tell ADR 0040 rule 6 from its negation is not evidence*, which is [W35](doc/work-items/w35-a-map-on-real-workers.md)'s own `text` reasoning one rule across; and the decision pair failed the same way from the other direction, because on the corpus's spelling `ctx.outcome` and `ctx.needs` carry the same number.

**Rule 8 obligation (e)'s SECOND QUESTION ran on a PRODUCT item for the first time and it FIRED.** v0.12 earned *"was what it RAN what SHIPS"* entirely on `scripts/**`; asked here of a **DECLARATION** rather than of a command, it produced the **fourth** instance in one plan of *a LIST BOUND TO NOTHING* — `Role`, the worker's `switch` arms and the pool registry — where one letter in a pool's role makes `run()` return `undefined` and kills **the scheduler's own message handler** before any assertion runs ([Q194](doc/open-questions.md)). **The answer was a TYPE rather than a set equality**, which product code has and a `.mjs` check does not, and **it closes one direction only** ([Q196](doc/open-questions.md)) — which none of the three earlier instances did. *The question generalises; the answer does not.* **Readers 11 / 3 and 28 / 19 / 4, overlap 2**, and three of the adequacy reader's four blocking findings are ONE shape: **a discriminating pair whose discriminating property is carried by literals nothing compares** ([Q197](doc/open-questions.md)) — making either pair identical cost **zero**, after which the mechanism underneath could be deleted for zero too. **And a SENSOR CANNOT CORROBORATE ITSELF** ([Q195](doc/open-questions.md)): the author's rule 8 pass declared that a ceiling with a correct reason, and the reader measured the ceiling at **8 failures**, deletable by one fixture-side literal. **Both revert costs were WRONG when first written** — 14 and 1, taken before the item's own last two edits — which is v0.12 change 2 firing on the numbers that are the item's whole point. Rule 8 **43 / 32 / 11 declared ceilings / 0 undeclared / 0 crash / 0 aborted**; **ONE late exception**, the lowest of any product item in three plans. **Census CONFIRMED for the ELEVENTH plan running — 155 questions, 107 open, 2 deferred, 46 resolved**, and the parser, written **from scratch**, aborted **zero** times on its first run. **Q194-Q198 raised, none resolved** — which is what an exit artifact looks like in the register.

**[W42](doc/work-items/w42-what-a-decision-sees.md) answers [Q8](doc/open-questions.md), open since P1, by [ADR 0041](doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md): a decision sees its node's effective outcome and whatever its OWN EDGE declares.** `spec/flow-definition.md` is **v0.12** and an **edge** may carry a `needs` — `FD-C3`, the same grammar as a node's and the same aiming rules, **minus the `"."` form**, which `FD-V26` refuses there because *what a predicate would have received anyway* is `ctx.outcome`. `spec/` is **7 documents, 40 examples, 87 rules**; L1-L5 is **24 files / 633 cases in five runtimes**; **L6 is unmoved at 638 / 31**. **Q8's own flow runs** — `decision-on-an-earlier-step.flow.json`, the sentence that row has carried since P1 — **with the worker's payload untouched**, which is why the declaration sits on the edge.

**[P12](doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md) prediction 3 REVERSED, and the ADR's own evidence for the reversal was WRONG — that is the result to carry.** The prediction said Q8 would need no ADR; it needs one, because a predicate needs a **shape** a worker does not and a **site**, since *what the node received* is not available where a decision is made. **But the ADR's stated forcing fact was false**: it said a *diamond* made the payload underivable *because choosing between two settled predecessors needs append order*, and W42's conformity reader derived it in one expression with none — drop any settled predecessor another settled one is reachable FROM, and `FD-V19` makes the survivor unique. **The conclusion survived on two facts nobody had written down**: the **entry** node's payload is in **no record at any moment**, and re-deriving any other node's re-implements `compose`, `JP-R11` and `JP-R12` at a second site, which ADR 0040 rule 2 refuses by name. *A reach prediction can reverse on the right conclusion and the wrong evidence, and only a reader re-deriving the evidence finds that* — [Q193](doc/open-questions.md).

**And THE GATE WAS RED AT L0 TWICE with every other rung green both times.** One unused import, then a dead `const where = n.id` stranded by the fix for a reader's own finding: `deno lint` exit 1 with **zero `FAIL` lines**, and since [ADR 0039](doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md) `lint` is the chain's FIRST entry, so nothing after it would have run — while `npm test`, three runtimes, all seven checks and 26 provocations were green. *The exit code is the predicate and a FAIL count is a secondary signal*, in this file for two plans and caught for the first time here — **and then caught a SECOND time in the same item, by re-reading a 23-line gate log the item's Record had already recorded as `GATE EXIT=0`, zero `FAIL` lines.** Both of the maintainer's two stated conditions are satisfied by a chain that stopped at entry one, because `FAIL` is a word the seven checks print and `lint` does not. **Obligation (e)'s second question produced a THIRD instance of W41's own new shape, a LIST bound to nothing**: `FD-V17` refuses *a key its kind does not declare*, section 3's Edge key table is the document's only statement of what an edge declares, and `EDGE_KEYS` is a literal nothing compared to it — so for one item the code accepted `needs` on an edge while the table did not list it, which is `spec/README.md` rule 4's inverse in the ACCEPTING direction. **Three instances in one plan**, closed the same way each time. Readers **16 / 10** and **45 / 14 / 9**, overlap **2**; rule 8 **40 / 38 / 1 classified rewrite / 0 aborted**; **TEN late exceptions, zero undeclared**, and this item's own `Owns` block predicted one by name and was wrong about what to call it — the count was rewritten three times, each rewrite before the next exception arrived, which is v0.12's WHEN clause firing inside the table that records it. **[Q142](doc/open-questions.md) fired and BOTH `check-markdown` floors moved for the first time**: P12 is the first plan in four to add documents to `doc/decisions`, the directory probe 1 REMOVES, so the one-directory fixture rose 56 -> 64 against a floor of `< 64` and probe 1 went silent. `M3` **74** and `M4` **2700**, retuned from a scratch copy outside the repository — and `M3`'s `META` entry, still pinned to the literal after three plans of `M4`-only retunes, reported *"the mutation matched nothing"* and is now agnostic as `M4`'s has been since W33. **Census CONFIRMED for the TENTH plan running — 150 questions, 102 open, 2 deferred, 46 resolved**; **Q190-Q193 used**.

**[W41](doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md) answers [Q11](doc/open-questions.md) IN GENERAL by [ADR 0040](doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md): what a node can reach is the run's own outputs, and a node id NAMES them relative to a branch path.** `spec/flow-definition.md` is **v0.11** and section 3 gains **`needs`** — an optional object on a `task` or a `map` mapping payload keys to declared references, where a reference is `"."`, a node id, or a one-element array holding one. **Q11's three candidates are a STACK rather than a fork**: the previous node's output is the default, a run-scoped accumulator is the state, a declared mapping is the access — and **only the third reaches a worker at all, because `createTask` takes ONE value**. `spec/` is **7 documents, 38 examples, 86 rules**; L1-L5 is **23 files / 612 cases in five runtimes**; **L6 is unmoved at 638 / 31**, which is the declared result.

**Both flows P12 exists for now RUN.** `map-with-context.flow.json` gives a map instance its own item **and** the run's config ([Q166](doc/open-questions.md) **CLOSED**); `map-over-region-output.flow.json` maps over a whole region's output with `needs: {"scores": ["score"]}` and **no `over: "0"` anywhere**, so [Q165](doc/open-questions.md)'s coupling to branch numbering is gone rather than worked around. **[Q164](doc/open-questions.md) is RESOLVED and `FD-C` is the third prefix** — `FD-V` is what a DOCUMENT may say, `FD-R` what a RUN refuses, `FD-C` what a run **CARRIES**. **What decided the ADR is the KEY**: the pair `(node id, branchPath)`, because a node id names one output outside a map region and **N** inside one — [ADR 0036](doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s deciding fact for the **third** time, measured over **eight** region-bearing corpus flows.

**Its conformity reader found the new rule REFUSING A VALID DOCUMENT, and the same document contradicts it nine lines down.** `FD-V28` asked *is the target inside a region the reader is outside of*, which is true of a `fanout` too — so `needs: {"a": "scoreA"}` after a two-branch join was refused and the author told to write `["scoreA"]` and index `[0]`. **Every one of the author's 37 probes used a map region**, so the whole `fanout` half was unreachable from the set: *a probe set written against the cases a feature was built for cannot see a rule that is wrong about the cases it was not.* **18 findings, 7 blocking.** Its adequacy reader ran **98 mutations, 20 real survivors, 8 blocking**, and **closed [Q158](doc/open-questions.md) after three plans** — renaming W41's two `.test.ts` files out of the runner's glob gave `21 file(s), 579 assertions, all passed`, exit 0. **The fix did not have to live where that row said**: a **suite census** in `test/definition/l4-corpus.test.ts`, set equality both ways, in all five runtimes. **Overlap 1 of 116**, both unprimed.

**And obligation (e)'s SECOND QUESTION fires on a PRODUCT item, in a shape neither of v0.12's two procedures names — a LIST bound to nothing.** `RULE_PREFIXES` gained `FD-C` and was itself bound to nothing: **dropping `FD-C` costs ZERO**, because the two `FD-C` rules then match neither pattern and are neither declared nor cited — *Q164's own defect surviving inside the fix for it*. And the two new `C2` clauses had **no probe**, because `check-spec-selftest.mjs` derives at **id** granularity where `C2` already existed. **The author instantiated (e) three times as written and all three passed; the readers found both of these.** **Rule 8: 54 provocations, 51 caught, 2 survivors both classified vacuous, 0 aborted, 0 wrong-reason** — and three harness defects, all invisible in the verdict: `String.replace`'s `$'` truncated a mutation so a **crash read as a survivor** ([Q184](doc/open-questions.md), which reproduced in the script that inserted its own register row), `green` accepted `all passed` from a **sibling** child, and a probe was graded against a check whose clause only the SELF-TEST binds. **The item's own driver work was destroyed by `git checkout` on a dirty tree** — W35's defect, by hand, outside the harness whose header forbids it. **Census CONFIRMED for the NINTH plan running — 146 questions, 99 open, 2 deferred, 45 resolved**; **Q184-Q189 used**.

**[P12](doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md) is DECLARED — *what does a node receive, and what does a decision see?*, the first PRODUCT plan since P10.** [W38](doc/work-items/w38-the-dispatch-nothing-binds.md) closed [Q149](doc/open-questions.md) in seven checks; **[W39](doc/work-items/w39-what-the-gate-proves-and-what-it-costs.md) took [ADR 0039](doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md) and the gate is `npm run gate` = 15 chain entries, 393.1 s, from 516.1 — −23.8% against a ±13% band, with NOTHING deleted, no probe dropped and no bound lowered.** *(It was **318.2 s at code-complete**; the two readers' TWELVE blocking findings cost **75 s**, all of it inside `check:wiring:selftest`, which runs alone and is therefore all critical path. **Two fifths of the saving went back on the binding** — [Q176](doc/open-questions.md) at a factor of 150.)* **Read every status from the item's own file, never from this line.**

**[P12](doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md) took [Q11](doc/open-questions.md) IN GENERAL together with [Q8](doc/open-questions.md), because a predicate and a worker are two things asking to reach something the previous node did not produce.** Three items, serial: **W41** (what a node can reach and what NAMES it — **ADR 0040**), **W42** (what a decision sees), **W43** (the exit artifact on real workers). **Reserves W41-W44, Q184-Q193, ADR 0040-0041** — ten questions rather than five, because P11 spent five before its second item raised one and extended the block twice. **Its exit artifact is two ORDINARY flows this library cannot express today**: *score each item against the run's config* ([Q166](doc/open-questions.md)) and *score, then fan out over the scores* ([Q165](doc/open-questions.md)), both worked around today by a reshaping `task` node.

**Its declaration measured SIX facts and two correct the register rows it is built on — the fourteenth time a plan has found one wrong by trying to act on it.** **Q8's stated cost is ALREADY PAID**: `src/driver/driver.ts` holds `private readonly log: LogRecord[] = []` with exactly one `this.log.push` and **no** `splice`, `shift` or reassignment in 1790 lines, `OutcomeRecord.result` is on every settled task, and `Driver.snapshot()` exposes the whole of it — so **a run-scoped accumulator is a PROJECTION of state that already exists and adds ZERO retention**, measured by building one over the log with no new driver state. Q19's *"if Q8 or Q11 retains every node output"* therefore describes **today**; its premise is corrected and its real question — whether that retention should be **bounded** — is untouched and declared OUT. **And Q8's mechanism is one field and one call site**: `DecisionContext` has exactly one member, its own comment names Q8 by id, and it is built at `driver.ts:908` and nowhere else. *The decision is the whole cost.*

**The sharp fact is [ADR 0036](doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s deciding fact for the THIRD time, and it is what the plan has to decide.** The obvious accumulator is *an object keyed by node id*. Measured over **all four** region-bearing corpus flows: `fanout-join` at arity 2 and `nested-fanout` at depth 2 collapse **zero** ids — `FD-V19` refuses a node in two branch entries of one fanout, and even the dotted paths give one record each — while `map-fanout` and `map-in-fanout` collapse one each. **Exactly the map regions collapse, at any depth, and no `fanout` does: a node id names one output outside a map region and exactly N inside one.** So decision 2 is *the KEY is the decision, not the mechanism*, W41's evidence must include a map region or it does not bind, and three candidate keys are named with none preferred: the node id, the task id, and the pair `(node id, branchPath)`. **[Q164](doc/open-questions.md) is FORCED** — the ordinary edge's payload contract is prose with no id prefix, and that row's own forcing condition is P12's deliverable in one sentence. **Q11 is decided BEFORE Q8**, reversing the register's dependency direction, because the payload half has three real cases and the predicate half has one sentence.

**[P11](doc/plans/p11-what-should-the-gate-prove.md)'s RETRO is run and `doc/workflow.md` is [v0.12](doc/workflow.md) — THREE changes adopted, THREE proposals refused, and its central finding is that rule 8 obligation (e) was instantiated by the AUTHOR three times in one item and its two readers then found EIGHT more instances in the same item.** Every one of those eight was `npm run gate` at exit 0 with the self-tests silently not running, **inside the check written to make that impossible**. The author's probes broke the CHECK's wiring; the readers' broke the SUBJECT's — which is W23's loop-bounds asymmetry reproduced in a different obligation. **(1) Obligation (e) gains a SECOND QUESTION: not *was the check run*, but *was what it ran what SHIPS*** — five consecutive items, in commit order (W36's `--import-map`, W35's `test:l6` argument, W37's `D3` comparing two version strings while one of them was unfetchable, W38's `G2`, W39's `G4`), every instance found by a reader, every one blocking, with a procedure for each of the two shapes: **bind a command by EQUALITY on the whole string and run THAT command** (a deletion and a suffix are two defects — `--plan` and `echo` were closed and `|| exit 0` survived), and **where a check must CONFIGURE its subject to observe it, read the default DECLARATION rather than running it** — invented twice independently, one file apart, as `G2` and `G5`. **(2) Section 1 rule 5's writing clause gains a WHEN: a measured number is re-taken on the tree the item ships.** An item is not finished when its work is; it is finished when two readers have changed it, and rule 8 already re-runs the provocation set at that moment. **(3) Section 6 pass 3 gains rule 6: a retro may correct a false claim in the files of the items it reviews** — because (2)'s own correction had nowhere legal to land. **REFUSED**: an `Outputs`-table obligation for process items, a ladder level for the gate itself, and a `doc/` check for the ninth time.

**All four predictions CONFIRMED, and two of them were right about the CONCLUSION and wrong about the MECHANISM — both of those the reversible kind.** Prediction 1 carried a derived half and a reach half in one row and **only the reach half reversed**; prediction 4 named `check:markdown:selftest`'s ~170 s floor and was right about it — W39's VERDICT was what over-read, calling the **exclusive prefix** the binding constraint from a single run, which this retro withdrew after measuring two. Prediction 2 is the weakest — P11's own `Out` section had ruled out most of what would have reversed it. **v0.11's harness requirement: CONFIRMED and KEPT unchanged**, having fired once before either item started and at least six times inside them; its one limit is that a control is per-harness while `check-wiring-selftest.mjs` destroys its NEIGHBOUR's fixtures, which is [Q182](doc/open-questions.md).

**And the retro priced [Q182](doc/open-questions.md) from the runner's own report — needing TWO runs to state it honestly, which is change 2 firing on the retro that adopted it.** `selftests` is **356.7 / 357.6 / 358.1 s wall** over three end-to-end gates, and the exclusive prefix — `check:wiring:selftest` at 167.8 / 160.9 / 160.0 plus `check:scheduler:selftest` at 12.6 / 13.1 / 13.1 — is **180.4 / 174.0 / 173.1 s: 50.6% / 48.7% / 48.3%** of it. **The first draft said *they cost more than the other five together*, from one run; the next two both reverse it** (174.0 against a group of 183.7, then 173.1 against 185.0), so *the exclusive prefix is the binding constraint* is a claim inside [Q179](doc/open-questions.md)'s band and is **withdrawn** from ADR 0039 and from the register. **What reproduces far better is the entry's wall clock — 355.7 to 371.1 over seven runs, at most 4.3%** — because concurrency averages the variance the serial chain exposed, which nothing predicted. **And the retro made four successive claims about that spread and the next run falsified each** (±0.3%, ±0.2%, 0.7%, under 2%) — [Q179](doc/open-questions.md) firing four times inside the retro that cites it: *a number stated without its sample is a prediction wearing a measurement's clothes.* **Name the rung: NONE of P11's seven defects has one**, and every one is in the instrument rather than in the product; a level for the gate itself is proposed and refused at one occurrence, because a level number invites *climb to it and stop* and the gate's own checks are L0. **Census CONFIRMED for the EIGHTH plan running — 140 questions, 97 open, 2 deferred, 41 resolved**, 140 of 140 in exactly one cluster cell, and **the parser aborted ZERO times on its first run**, written from the register's own accumulated predicate and nothing else — *the mechanism is writing the hazard into the file the parser reads, and after seven plans it worked.* It found the standing line right and **W39's note beside it wrong at 139 / 96**, taken before [Q183](doc/open-questions.md) had a row. **W40 is CLOSED as reserved and never issued; the next plan starts at W41, ADR 0040 and Q184.**

**The answer to P11's question is the two properties of the chain nobody had ever chosen: ORDER and CONCURRENCY.** The gate now **climbs the ladder** — `lint`, `typecheck`, the seven checks cheapest-first, L1-L5, L6, and only then `selftests` — where it had run **488.9 seconds of self-test ahead of `lint`**, in a chain whose own `S12` asserts ORDER *because* `&&` in sequence is the only implementation `doc/workflow.md` section 4's ladder has. **A rule stated correctly, in the file that enforces it, over a list that broke it by a factor of five hundred.** And `npm run selftests` runs the seven `:selftest` entries **concurrently**, deriving them from `package.json` rather than from any list, with the two that cannot share the tree running alone.

**Four of the five candidates are refused with a measurement each, not on taste.** *Keep it* fails because nothing about the arrangement was chosen — the chain ran the ladder backwards and the seven ran one at a time on a twenty-core machine. *(This read *"it fails against section 8's own 90 s budget, which the gate was 5.7x over"* until P11's retro: that budget is for **L0-L6**, which is 18.6 s and inside it by a factor of five. Section 8 had **no row** for proving the checks can fail, which is the stronger statement and is the one now written down there.)* *Move them off the gate* has **no something else** — there is no CI, no workflow and no git hook, so it is two changes and the second needs a repository this one does not have. *Reduce what the two 120-second self-tests prove* buys less than concurrency does, because those two now run **at the same time as each other**. And *stop paying for a process per probe* is **137 s of real interpreter boot** (2531 starts × 54 ms) that **`NODE_COMPILE_CACHE` does not touch** — 128 ms against 129 — and that costs seven self-tests rewritten to load a check by `import` rather than by `spawnSync`. [Q180](doc/open-questions.md) keeps the numbers.

**Two of the seven cannot share the tree and only ONE of the two was predicted.** [Q148](doc/open-questions.md) named `check:scheduler:selftest`, which deletes `node_modules/fyflow-scheduler`. **Nothing had ever said `check:wiring:selftest` cannot either**: `stage()` writes every `scripts/check-*.mjs` **flat into `dev-dist/`** — the directory every other self-test uses for scratch — and runs those copies with their dispatch falsified, so one reaches the real `check-docs` body and deletes the fixed path `dev-dist/docs`, and another launches the **whole** `check-spec` self-test. Concurrently that produced *an `X4` probe uncaught*, *a probe tripping `[X1,X4]`* and *the mutant did not run: this is a crash, not a detection* — **three findings that were facts about a neighbouring process**, which is v0.11's harness requirement one process away from the harness it was written for. Isolated by measurement: green beside `check:wiring`, red beside `check:wiring:selftest`. Each now declares itself with a **`SELFTEST-EXCLUSIVE:` marker in its own file**; the runner reads it and **`G4` derives the same set independently and compares**.

**`G4` replaces the three clauses the seven lost by leaving the chain, and the binding cost 16% of the saving.** `S11`, `S12` and `G3` each refused an entry leaving the gate and all three go quiet once the seven are not in it — so `S11`'s and `G3`'s membership tests are now *reachable from the gate*, and `G4` makes that second disjunct a fact rather than an assumption: the chain must reach the runner; `--plan` with **no override set** must name exactly the manifest's `:selftest` entries with exactly their commands, both ways; the exclusive set must equal the markers'; and, pointed at a stub, the runner must report **every planned entry completed**. **`check:wiring:selftest` went 65.5 s to 96.7 s to ~200 s, and 502 starts to 765 to 2264**, all of it on the critical path — [Q176](doc/open-questions.md) reproducing inside the decision that cites it, at a factor of 150, and **the exclusive prefix is a second term BESIDE `check:markdown:selftest`'s 170 s floor and of the same size** *(this read *"is now the gate's binding constraint rather than"* until P11's retro measured three gates: 180.4 / 174.0 / 173.1 for the prefix against 176.2 / 183.7 / 185.0 for the group, the lead not a property of the tree)*. **`G5` is the clause the readers bought**: all three of `G4`'s runs set an override, so the configuration `npm run gate` executes is the one configuration `G4` never takes — `G2`'s own sentence, one file across, in the file that quotes it — and `G5` reads the nine declarations that decide it. **[Q133](doc/open-questions.md) and [Q148](doc/open-questions.md) are RESOLVED**; **[Q181](doc/open-questions.md), [Q182](doc/open-questions.md) and [Q183](doc/open-questions.md)** are what the mechanism does not bind — the marker is bound to nothing (measured: removing it alone costs **zero**), and `dev-dist/` is a shared namespace with fixed paths that nothing namespaces. **P11's block had to be extended to Q176-Q183**, twice, because all five reserved ids were spent before W39 raised a question.

**And the cost measure was declared BEFORE the change, which is the part to carry.** [Q179](doc/open-questions.md) says wall time here is not reproducible, and W39 measured the band wider than that row did: three **back-to-back** runs of `check:markdown:selftest` alone spread **127.8 to 169.2 s — 32%**. So every claim states which side of the band it falls on: the total (−23.8%) and the self-test half (488.9 → 365.0, −25.3%) clear it; the checks (+0.6 s) and L0 (+0.1 s) are **inside it and no claim is made**. The deterministic half — process starts — **reproduces run to run and is not a property of the file**: six of seven entries match the declaration's counts exactly three commits later and `check:policies:selftest` reads **170 against 222**, twice, unexplained.

**[P11](doc/plans/p11-what-should-the-gate-prove.md)'s DECLARATION, which is what the item above was
built from.** *(This paragraph said "and no item has started" for as long as W38 took to run; the
current-state line three paragraphs up is the one to read. Kept as the declaration's own record.)*
It takes [Q133](doc/open-questions.md),
[Q148](doc/open-questions.md) and [Q149](doc/open-questions.md) as one subject: **the gate is 93.2%
self-test, and the whole of that can be deleted by hand at exit 0.** Two items, serial:
**W38** closes Q149 in all six checks; **W39** takes the cost decision as **ADR 0039**, implements
it, and re-measures. W40 is reserved and expected unused. Reserves **Q176-Q180**; **ADR 0038 is spent
and not reused**, on the P9-reserved-and-skipped precedent.

**Its declaration measured four facts and two of them correct the register rows the plan is built
on** — the thirteenth time a plan has found one wrong by trying to act on it. **The gate is 433.7 s:
9.1 s of checks, 404.1 s proving they can fail, and 20.5 s for all of L0-L6 in three runtimes
including both real-scheduler rungs.** Q133's row said *"about a minute"*; P9's retro recorded
*"about 79%"* of a 438 s gate. **The share rose to 93.2% while the RATIO fell from 81x to 44.3x**,
because the checks got dearer — and **two files are 61% of the whole gate**,
`check:markdown:selftest` at 141.7 s and `check:docs:selftest` at 123.0 s against the 1.1 s and 5.1 s
they grade.

**[Q149](doc/open-questions.md) is confirmed live in ALL SIX at exit 0** — the dispatch cut by a brace
match so the file stays valid, **151 to 373 bytes**, self-test unrun, everything green. `S11` reads
the manifest and `S12` compares the chain's entry names, so both are satisfied; what is unbound is
what the script does with the flag. **And [Q148](doc/open-questions.md)'s hazard is real, wider than
its row and wrong about its own mechanism**: FOUR entries fail with `node_modules/fyflow-scheduler`
moved aside, not one, and the `AGENTS.md` snippet the row blames is tagged ` ```ts check `, so the
hazard is type resolution — `typecheck` fails the same way with no snippet involved.

**`doc/workflow.md` v0.11's harness requirement fired before any item started**, three commits after
it was adopted: the first version of the Q149 probe cut more than the dispatch and produced **exit 1
in all six** — a crash reading as a detection — caught because the control had already been run and
held.

**[P10](doc/plans/p10-is-fan-out-one-feature-or-two.md) is COMPLETE and RETRO'D, and `doc/workflow.md`
is [v0.11](doc/workflow.md).** Its question — *is fan-out one feature or two?* — is answered
**TWO FEATURES OVER ONE REGION**, and it is the first plan in ten to make the library able to express
something it could not. Four items, eight reader passes, none empty. At declaration `spec/` was 30
examples / 75 rules, L1 474 cases, L6 489 assertions over 25 runs; it closes at **33 / 80**, **574
cases in three runtimes**, and **638 assertions over 31 real runs**.

**All four predictions CONFIRMED — and the retro's account of that is the part to carry.** Three were
restatements of facts measured at the declaration step, so confirming them tested the **inference**
rather than the world; **only prediction 3 was about something nobody had measured**, and it is the
only one that could have gone either way. *A prediction derived from a measurement you already have
checks your reasoning; a prediction about a mechanism's reach checks the mechanism, and only the second
can reverse.* v0.10's *"a prediction written down before the item is what makes this a measurement"*
is corrected to **necessary and not sufficient**.

**v0.10's three changes all hold on PRODUCT items, which is what v0.10 left open.** The fifth
obligation — break the WIRING — fires in **four shapes inside the plan**: a check not RUN (W32), a
guard that runs and cannot reach its subject (W33), a value computed and never READ (W34), and **a
command that starts the right runtime and opens the wrong FILE** (W35), which could silently unrun
every exit artifact this repository has. *"Fires for the reason it names"* fired four times, and W35
adds the reading v0.10 does not state: **a probe declared to cost 0 has to be checked for whether it
SHOULD** — one of W35's declared controls was a real hole. And the WRITING clause fired **four times
outside the register**, on a Record number measured before the change it described, a check justified
from its purpose rather than its clauses, and two spec rulings written at one scope and stated at
another.

**v0.11 adopts ONE change: rule 8 gains a requirement on the HARNESS — it carries a control, and the
restore is asserted.** Three times across two plans a provocation harness produced a
plausible-looking result that was its own artefact: W31 graded a deletion it had caused and reported
`12/13 bounded` at exit 0; **W35's restored with `git checkout` on a dirty tree and deleted the item's
own uncommitted work mid-run**; W37's applied only the last edit per file and returned four probes as
WRONG-REASON, which is what a real finding looks like. **None is visible in the verdict.** The
counter-measure was invented here for the first of the three and never generalised.

**The `Owns` verdict: 5, 9, 5, 3 against P7's five-four-two-zero, and it never reached zero — and the
blocks were not too narrow.** W34 declared three trees in advance and six files left its late column,
so predicting a file set works; **not one of the five that remained, nor W35's three, was predictable
from a file set.** A plan that changes what the library can EXPRESS creates obligations in the
documents describing the old capability, and which those are is a property of the sentences.
**Twenty-two late exceptions, zero undeclared.** One is a structural gap and is **proposed and
refused at one occurrence**: once an item is done its file is on nobody's `Owns`, so W35 could correct
a false claim W34's Record made about W35 only by exception — the claim W36 had already acted on.

**And the plan's own question was answered by an eighth fact nobody thought to take.** Facts 2 and 3
said the id grammar and the join policies were ready for run-time arity — both true, both confirmed —
and they argued for *one feature*. The answer came from **`branchOf`'s key type**: a
`Map<string, Set<string>>` keyed by branch node id, so a map's repeated-entry encoding collapses to
one entry and does not express N branches even to the layer that would have to honour them. *The
declaration step's value is not that it predicts the answer — it is that it removes the questions
that would otherwise be mistaken for the answer.*

**`map` is a fifth node kind and the library can express something it could not before — the first plan in ten to change that.** `{ "kind": "map", "over": "items", "branch": "score" }`: **one** branch declared, N instances opened by the run, where a `fanout` declares N branches known at authoring time. `spec/flow-definition.md` and `spec/task-id.md` are both **v0.8** with `spec/README.md`'s rows moved by `C8`; `spec/` is **7 documents, 33 examples, 77 rules**; L1 is **20 files / 517 cases in five runtimes**, from 19 / 474. **Nothing dispatches a map yet** — the driver is W33's, and `AGENTS.md` deliberately describes the refusal class and not the feature.

**What decided the ADR is a fact about a data structure, and nobody had measured it.** `branchOf` is a `Map<string, Set<string>>` **keyed by branch NODE ID**, so `branches: ["x","x","x"]` collapses to **ONE** entry and `region(F)` is `{x}` — **the repeated-entry encoding of a map does not express N branches even to the layer that would have to honour it.** And `FD-V19` fires **`n(n-1)/2`** times on that encoding (1, 3, 6, 10, 15, 45 measured at N = 2, 3, 4, 5, 6, 10; 124 750 at N = 500) while iterating **0** pairs over a one-branch region. **The same rule, quadratic on one encoding and vacuous on the other.** What the two features share is the **REGION**; what differs is the whole of the **FAN-OUT**.

**So `FD-V9` and `FD-V19` are UNCHANGED and [Q27](doc/open-questions.md) is UNTOUCHED, which corrects the framing P10 handed the item.** P10's declaration and Q27's own row both said *"a map is `FD-V19`'s condition on purpose"* — **true of the ENCODING, false of a `map` node**, because one branch means *"two distinct branch entries"* has no instance. Both rows corrected in place. **All three of P10 fact 1's refusals are kept exactly as they are; not one is retired or restated** — a map's arity is **not in the document at all**, so `FD-V9`'s floor and `FD-V11`'s reachability cannot fire for an arity reason. *(P10 fact 1's `branches: []` row is right for the fixture it measured and does not generalise: with the branch task still declared it is **5 findings and a fourth refusal path**, `FD-V20`, rather than 3.)*

**P10 prediction 1 CONFIRMED, and `src/driver/ids.ts` was not edited at all** — the grammar, `parseTaskId` and `buildTaskId`'s signature are all unchanged, and that file is in W32's `Owns` precisely because P10 raised the possibility. `spec/task-id.md` section 1's **heading** is corrected rather than deleted: a branch index is a property of the **NODE** inside a `fanout` region and of the **DISPATCH** inside a `map` one. **`ID-R6`** is the refusal — `branchPathOf` takes an optional item index **per region** and throws `UnresolvedBranchPath`, because the measured alternative mints `r1:x:0:0` for every dispatch and dies at `ID-R1` naming a *duplicate*, the symptom rather than the cause.

**P10 prediction 3 FIRES: rule 8's fifth obligation — break the WIRING — generalises past a harness.** Three instances in W32's own paths, all named before the set was written. A **corpus flow renamed out of the `.flow.json` glob** was noticed by **nothing**, and is now closed by a **set equality both ways** against `spec/flow-definition.md` section 7's table — **which had a live case the day it was written**: `nested-fanout.flow.json` was added by [W20](doc/work-items/w20-what-a-nested-region-is.md) and never documented, so the spec's own example index was stale by one **for a whole plan**. A rule **present, correct and unreachable** was caught twice. And **a whole `*.test.ts` file renamed out of the runner's glob — 26 cases — is noticed by NOTHING** at exit 0: [Q158](doc/open-questions.md), in `test/runner.ts` and `scripts/**`, which are in nobody's `Owns`.

**Rule 8: 31 provocations, 28 caught, 0 survived, 0 aborted, 3 read by hand**, graded on the **failure lines** rather than the exit code. **One real survivor, found and closed**: `opensWith` read from `branches.length === 1` rather than from the opener's kind survives the whole suite, because `FD-V9`'s floor makes the two sources agree on every VALID document — closed by constructing an **invalid** one-branch `fanout`, which `regionSets` is handed anyway. **Three things W32 wrote down were false and its own set caught each**: two L1 fixtures made a CYCLE so `FD-V10` fired and the whole region family was skipped; the expected set named **`C4`**, which *"never opens the file"* by `spec/README.md`'s own bold sentence; and the census caught [Q156](doc/open-questions.md)'s status cell reading `open - deferred by W32`, which a classifier reads as **deferred** — one row across two columns whose totals still summed, with **no abort**.

**And W32's own Record contained a number measured BEFORE the change it described, which is how its sharpest defect was found.** The L1 row read *"506 on chromium"* from a run made before the corpus equality existed; `npm run test:browser:all` then reported **0 file(s), 1 assertion** and `PARITY FAIL` in **all three** browsers. The browser bundle inlines only `spec/examples/` JSON, suites read fixtures at **module scope**, and a `readText` throw while the bundle is LOADING takes **all twenty suites** with it — reported as *"the suite never reported"*, naming no file. **L1 was green in node and deno and broken in all three browsers.** Fixed by inlining the one document — the second late exception, on `scripts/build-browser-tests.mjs` — and provoked. **This is section 1 rule 5's provenance clause, *any copy including your own*, inside a Record describing its own item's gate**: [W23](doc/work-items/w23-a-nested-flow-on-real-workers.md)'s exact failure one plan later. `npm run gate` is **`GATE EXIT=0`, zero FAIL lines, 19 chain entries, 6m21**, L6 unmoved at **489 assertions / 25 real runs**.

**Both readers ran: conformity 12 findings / 6 blocking, adequacy 11 survivors of 29 mutations / 5 blocking, OVERLAP 2** — the fifteenth measurement, inside the settled 0-4 band, and **neither reader was primed** (unlike W31's pair), so it is comparable with the thirteen before it. **Their split is the one the two roles predict**: the conformity reader found **claims that were false or unlicensed**, the adequacy reader found **bounds that were not there** — and three of its five blocking survivors are one shape, *the new check binds a set of NAMES and nothing binds where those names came from, what the files contain, or the sibling directory.*

**The sharpest finding is aimed at what W32 was proudest of, and the second is a defect W32 CREATED.** The check built to close the corpus wiring hole **could be made vacuous by one source-expression swap** — re-source it from the disk and both set differences are empty by construction, with W32's own `e2` probe passing again underneath it; **the comment above the guard named that exact failure and then guarded it with a bound the disk listing satisfies.** And `enter()`'s switch in `src/driver/driver.ts` had four arms, no `map` arm and **no `default`** — `node.kind` is a union TypeScript does not require a switch to exhaust — so a valid map document dispatched one task of six and folded to **`completed`**: `ADR 0015`'s own false statement reached through the driver's declared surface, and the silent stop `spec/flow-definition.md` section 3 refuses **by name**. Closed by a `default` arm reporting through `OR-R10` with an **existing** error class, so P10 decision 4 holds; W33 replaces it.

**Five more written claims were false and are corrected in place**: section 4's `reaches(X)` row omits a map's arc **while enumerating arc shapes exhaustively**, so a validator written from it rejects a valid example; `FD-V23` refuses a map missing `over` with no rule text licensing it, making *"four rules widened"* **five**; `ID-R1`'s soundness argument is a closed argument from three **validator** rules and a map region has no `FD-V19` instance; `spec/join-policy.md` section 1's `branches` sentence is false for a map region **today** (that document is now **v0.11**); and `AGENTS.md` §3 said *"Four node kinds"* and *"22 refusals"* while `spec/README.md` said 23 in the same change.

**Rule 8 ran TWICE — 32/29 before the readers, 42 provocations / 39 caught / 0 survived / 0 aborted after, with ELEVEN of the readers' own edits checked back in.** **The re-run earned its place**: the fix for one reader's finding **masked another guard** — with `branchPathOf`'s `ID-R6` arm unreachable, the newly-refusing `branchIndexOf` fires in its place with the same class, citation and map name, so three assertions passed **by the wrong route**. W29's `D5` masking shape, produced by acting on a review. **Finding a discriminating phrase took three attempts**, because `ID-R6`, `split` and even `item index` appear in both messages — the new refusal helpfully says *"use `branchPathOf` with an item index"*. **A helpful error message is a worse discriminator than a terse one.**

**`Owns` audit: 23 paths, ZERO undeclared, FIVE late exceptions** — `AGENTS.md`, `scripts/build-browser-tests.mjs`, `src/driver/driver.ts`, `spec/join-policy.md` and `test/driver/driver.test.ts`. **Not one was found by reading**: two by running a check, three by the conformity reader. Five is P7's W20 number from the **opposite** cause — W20's came from a block that gave it nowhere to work — and it is an argument that **W32's `Owns` was drawn one layer too narrow for what a new node kind reaches**, which is P10's retro's to judge. `index.ts` re-exports `src/definition/regions.ts` with `export *`, so `UnresolvedBranchPath` reached the package root without W32 touching `index.ts` and section 9's executed snippet went red at `X4` ([Q101](doc/open-questions.md)). **[Q157](doc/open-questions.md)**: **no P10 item owns `AGENTS.md`**. **[Q142](doc/open-questions.md) was predicted NOT to fire and did not** — the three counts were taken before any file was added and the ADR lives in the directory both `removes` probes cut. **Census CONFIRMED for the FIFTH plan running — 118 questions, 81 open, 2 deferred, 35 resolved**, both halves at 118 of 118 in exactly one cluster cell; Q156-Q159 all used, **Q12 resolved**.


**[W33](doc/work-items/w33-a-map-at-run-time-arity.md) is DONE and a `map` DISPATCHES.** The driver
opens N branches from the previous node's output at N distinct task ids (`r1:score:0:0`, `:1:0`,
`:2:0`; `r1:merge:1.0:0` nested), emits every `branch.opened` before dispatching any (`JP-R5`), and
threads a per-region **item index** down `enter`/`dispatch`/`pathOf`/`settleJoin`, recovering it in
`advance` **from the inbound task id's own path** — sound because `ID-R4` tier 2 has already refused
any id this driver did not mint. `spec/join-policy.md` is **v0.12**, `spec/run-state.md` **v0.4**,
`spec/flow-definition.md` **v0.9**; `spec/` is **7 documents, 33 examples, 78 rules**; L1 is
**21 files / 553 cases in five runtimes**, and **L6 is unmoved at 489 / 25**, which is the declared
result. `npm run gate` is **`GATE EXIT=0`, zero FAIL lines, 19 entries, 361 s**.

**`arrival-count`'s `N` is RE-SOURCED from `branch.opened`, and what forced it is a failure direction
W4's matrix never recorded.** A map region's `branches` names the ONE declared entry whatever the run
opens, so `N` was **1 at every arity** — and on a three-item map the policy **routed the join out
after four of six region events with two branches still live**. Every failure W4 recorded was `N` too
**large**, which hangs and which ADR 0015 names; this is `N` too **small**, which **completes the run
wrong**, and there is no vocabulary for that. **It is a re-sourcing and not `JP-R7`'s refinement**,
measured rather than argued: a `fanout` emits exactly one `branch.opened` per declared entry, so the
two sources agree on **6 of the corpus's 6 static regions** and **all 36 matrix cells are unmoved**.
P1's routed-away case still hangs. **The one behaviour that moved is on a NON-CONFORMANT stream** —
a `branch.opened` after a terminal event, which `JP-R5` forbids — where the two counting policies now
agree instead of differing.

**[Q159](doc/open-questions.md) is ANSWERED NO, and the question turned out not to be about the
KIND.** The one policy that read `Region.branches` wanted *how many branches this region opened*, not
*which kind opened it* — and the event stream already carries that. Two alternatives were measured
and rejected: a fifth field would be a **second source** nothing could see disagree, and handing a map
region `branches` of length N would give `need: 0` at N=0 and **fire a join no branch reached**, which
is what ADR 0025 refused `JP-R7`'s variant for. **The sharpest form of the answer is that after the
change NOT ONE shipped policy reads its `Region` at all** — `deno lint` reported the import unused.
**P10 prediction 2 is CONFIRMED**: `live-token` and `live-token-requiring-arrival` are byte-unchanged.

**N = 0 is `stuck`, and the measurement that decided it is that the naive arm folds an empty map to
`completed`.** A map that opens nothing appended nothing, so the fold's `regions` was `{}`, `RN-R10`
iterated nothing, and a run that reached no `end` node reported success — ADR 0015's own false
statement. The answer is a new **`regionEntered`** fold input, which closes a claim
`spec/run-state.md` section 2 has made **since v0.1** — *"one entry per fan-out region ENTERED"* —
and that no input could supply while `FD-V9`'s floor made every opener open at least two. It lands as
that document's **fifth row of section 5**, whose whole subject is *what this document claimed that
its own inputs could not supply*. **It is inert on the entire corpus** (24 inputs, 0 state
differences); its only live case is one the corpus cannot express.

**Its two readers found 15 and 10, TEN blocking between them, and the two sharpest were CODE DEFECTS
the author's 31 provocations never reached.** A `map` at the **`entry`** node over an empty list
reported **`running`**, not `stuck` — nothing was dispatched, so `nodes` was empty and the fold's
nothing-yet clause returned before `RN-R10`; `RN-R12` then calls an unfinishable run unfinished and a
clock-free harness waits forever. And a map at N=0 **nested** in a branch left that branch opened with
**no terminal event at all** — a `JP-R5` violation `JP-R10` could not reach, because it triggers on a
policy answering `unsatisfiable` and the ruling is that none can. **Both are shapes section 5's ruling
was never measured at**; it was written entirely from a map at depth 1, stated no scope, and is now
corrected with the scope in the document. Fixed by having the DRIVER emit `JP-R10`'s consequence
directly, on the argument that *a region which opened zero branches can never be satisfied* is
**arithmetic over the event vocabulary** rather than a policy's judgement — and **without** reporting a
join verdict, because `RN-R11` gives `joined: false` the meaning *"a policy said unsatisfiable"* and
none did.

**And the conformity reader found [ADR 0036](doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
own central finding ONE LAYER DOWN.** The ADR decided *two features* because `branchOf` is keyed by
branch **node id** and collapses repeated entries. **Every per-region RUN-TIME structure in the driver
is keyed the same way** — `joinState`, `firedJoins`, `RegionEvent.regionId`, the fold's `regions` —
and a `map` is the first construct that enters one opener node **more than once in a run**. On a
definition `validateDefinition` accepts with **zero findings**, seven tasks all settling `done`
produced a **`stuck`** run: the second `open()` discarded the first, `firedJoins` made the second join
unreachable, one branch got no terminal event, and two regions merged into one fold entry.
**[Q160](doc/open-questions.md)** — **refused at `Driver` construction** rather than run wrong, which
also makes [Q156](doc/open-questions.md) *refused today* rather than expressible-and-undecided.
*The same fact, found twice, one layer apart, by two different readers.*

**Two more refusals, both taken from a measurement, and P10 decision 4 held.** That decision declared
*"no policy refusal, no construction check and no new error class, because every candidate for one is
a measurement W33 has not taken yet"*. W33 took the measurements and then took **two of the three**:
the construction check above, and **`UnresolvedMapArity`** — a `map` whose `over` does not name an
array at run time stops the run. `InvalidDefinition` would be a lie in the direction that matters:
**the definition is valid and the DATA is wrong**, which is a different person's bug. **No policy
refusal was needed.** It shipped with **no rule id anywhere in `spec/`** until the conformity reader
found it — `spec/flow-definition.md` section 2 had addressed that question to W33 **by name** — and it
is now **`FD-R2`**, beside `FD-R1`, that document's own precedent for a rule about what a RUN does.

**The methodological finding is that this item's gate line over-claimed what a check binds.** It
justified running `check:policies` as *"it goes red if `POLICIES` and section 3 disagree either way"*.
It compares the **id set**: reverting section 3's `arrival-count` row to its pre-W33 wording — the
sentence that IS the item's second `Outputs` row — left three checks and 543 cases **green**.
**A check that compares two halves does not necessarily compare the half you changed**, and the
justification was written from the check's PURPOSE rather than from its clauses, which one `grep` of
its `fail()` sites would have shown ([Q162](doc/open-questions.md)). **The same line was also wrong
about L5** and was settled in writing before anything was built: `check:policies` reports under
**three** clause ids, is static, and is **not a ladder rung**; L5 is the matrix, is **W34's**, and W33
runs it as a regression it must not break. Twelfth time a declaration row has been found wrong by
trying to act on it.

**Rule 8: 43 provocations, 39 caught, 4 survivors, 0 aborted**, run FOUR times — three in the author
pass and once more with **twelve of the readers' own edits checked back in**, all of which fire. The
survivors are classified rather than counted: [Q158](doc/open-questions.md) (open, not W33's), the
manifest probe (**caught by `S11`, invisible to a harness that invokes scripts directly**), one
**vacuous** by rule 8's own definition, and a spec-heading ceiling. **Three probes went inert on this
item's own edits and one on a reader's fix — all four rule 7 (b) firing correctly**, and all four were
re-anchored **agnostically** rather than re-pinned, so the next bump does not reproduce it.
**Overlap 2**, the sixteenth measurement, inside the 0-4 band, **both readers unprimed**.
**NINE late exceptions, zero undeclared** — W32 took five and argued that was evidence about the
`Owns` block rather than about the author; **this is the second data point and it is nearly double**,
and **seven of the nine are `scripts/**` or a `spec/**` document this item does not own**, which is
P8's *"paths in nobody's `Owns`"* on a product plan. P10's retro's to judge. **The browser bundle went red exactly as W32's did** — a suite reading a
`spec/**` document the bundle does not inline — **with a better failure mode**: this read is inside a
`test()` rather than at module scope, so it failed **one** test naming its own path instead of taking
all twenty-one suites down. **Census CONFIRMED: 122 questions, 84 open, 2 deferred, 36 resolved**,
all 122 in exactly one cluster cell; **Q160-Q163 all used, Q159 resolved. No ADR** — 0037 is W34's.


**[W34](doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) is DONE, and
[ADR 0037](doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
answers [Q36](doc/open-questions.md), [Q11](doc/open-questions.md) at the fan-out edge and
[Q154](doc/open-questions.md).** **A satisfied join carries the arrived branches' results keyed by
`branchPath`** — `JP-R12` — one entry per branch that emitted `branch.arrived`, keys in ascending
segment-wise-numeric order, a branch that exited or was lost having **no key**, `{}` for a join nothing
arrived at. **`settleJoin` still takes no payload parameter**: the order-dependence the `null` refused
is in *which one*, and carrying **all** of them keyed by branch is not picking one, so the guard that
kept Q36 a question is exactly where W3 put it. **`JP-R11`** fixes the other end — a `fanout` branch
receives its **own copy**, a `map` instance receives **its own item** as its own copy, and the
invariant is *no two nodes ever receive the same object*. `spec/join-policy.md` is **v0.13**,
`spec/flow-definition.md` **v0.10**, `spec/run-state.md` **v0.5**; `spec/` is **7 documents, 33
examples, 80 rules**; L1 is **21 / 574 in five runtimes** and **L6 is unmoved at 489 / 25**. `npm run
gate` is **`GATE EXIT=0`, zero FAIL lines, 19 entries, 417 s**.

**What decided it is a cost measurement rather than an argument, and the asymmetry is the finding.**
A clone per branch is **2207.94 ms against 1.50 ms at N = 1000** over a 117 KiB payload — ~1470x, and
**quadratic**, because a map's arity and its payload grow together; for a `fanout` the same fix is
**linear in a number the DOCUMENT declares** (9.3 / 14.2 / 23.0 / 44.3 ms at arity 2 / 3 / 5 / 10).
**The fix that is catastrophic for the feature that needed it is unnecessary for it and affordable for
the other.** [Q22](doc/open-questions.md) gains the measured run it has asked for since P1. And
[Q154](doc/open-questions.md)'s unmeasured half is measured: **inline**, a sibling saw the other's
write *before it ran*; **threaded**, neither did — but **`a.payload === b.payload` is `true` in
BOTH**, so the sharing is a driver-level fact and only its observability is a pool option the author
does not control. [Q61](doc/open-questions.md)'s asymmetry in the opposite direction.

**The order-dependence did not vanish when the payload was keyed — it MOVED, and it is invisible at
depth 1.** Integer-like object keys are re-ordered ascending **by the language**; **dotted keys keep
insertion order, which for a join is settlement order**. W21's and W22's shape a third time in this
tree, and the only discriminating fixture is a map at **N = 12 nested in a fan-out branch, settled
descending**.

**Its two readers found 16 and 19, ELEVEN blocking, overlap 2** — the seventeenth measurement, inside
the 0-4 band, both unprimed. **The conformity reader found a declared OUTPUT that did not exist**:
*the matrix at run-time arity*, promised by `Outputs`, Scope and a prediction, with its absence
recorded in `matrix.test.ts` in a sentence with no owner. It is now **five map rows x four columns**,
rendered as a third table — **and building it immediately found a defect nothing else could.**
`arrival-count-decrementing`, `JP-R7`'s refused variant, still read `region.branches.length` — the
**pre-W33** source, **1 at every arity** on a map region — so it fired a three-item join after **one**
arrival. **W33 re-sourced the policy and its declared variant did not follow**, and the reason it
stood is the reason W33's change looked free: on every `fanout` region the two sources agree, so all
52 cells were unmoved then and all 52 are unmoved now. *A re-sourcing that moves nothing is a
re-sourcing nothing can check, until an input exists on which the two sources differ.*

**And the sharpest cell makes a decision W33 measured at zero into a load-bearing one.** At N = 0 that
variant answers **`satisfied`** — `0 >= 0`, no `need > 0` pin — **and the join does not fire, because
the driver never asks.** W33 deleted that `settleJoin` call on the ground that *"no policy can answer
anything but `waiting`"*: true of the three **shipped** policies, false of the fourth column, and with
the call restored it would route a join's successor over a region **no branch ever reached**. The
ruling stands; its stated reason is now scoped in `spec/join-policy.md` section 5 — the **second**
correction that section has taken under the writing clause.

**The methodological finding is that a PROVENANCE probe cannot be graded against a correct
implementation.** All five of the author's obligation-(c) probes survived the first pass, because a
source swap on a working driver leaves both sources agreeing. **What discriminates is a COMPOUND
probe** — swap the source **and** break the driver, then ask whether the pair is still red — under
which four of five came back bound and one did not. Its mirror: **a negative control must sit on the
expression the probe changes**; the author's first one read a different variable and the compound
stayed green.

**Rule 8: 43 provocations, 39 caught, 4 survivors, 0 aborted**, run four times with **twelve of the
readers' own edits checked back in — all twelve fire**, one at **41 failures**. **P10 prediction 3 is
CONFIRMED for the third time in a third shape** — obligation (e) here produced **a value COMPUTED and
never READ**, distinct from W32's check-not-run and W33's guard-that-cannot-reach-its-subject — so it
generalises past a harness, and **prediction 4 is confirmed: both ADRs taken.** **FIVE late
exceptions, zero undeclared**, against W32's five and W33's nine: **declaring `spec/**`, `AGENTS.md`
and `test/driver/**` in advance moved six files out of the late column**, and **not one of the five
that remained was predictable from a file SET** — each was created by the CONTENT of the change,
including `examples/**`, which is **W35's**, because L6 pinned `joinPayload: null` as a Q36 marker.
**A `deno lint` failure also produced `GATE EXIT=1` with ZERO `FAIL` lines**, which is why the exit
code is the predicate and the FAIL count a secondary signal. **Census CONFIRMED for the SIXTH plan
running — 125 questions, 85 open, 2 deferred, 38 resolved**, all 120 live ids in exactly one cluster
cell; **Q164-Q166 used, Q167 deliberately NOT taken** — on the ground that W35 had not reserved,
**which was false**: W35's own file had reserved Q167-Q168 since P10's declaration and nobody
opened it. W36 then took and used Q167. Corrected at W35's declaration step; that item moved to
Q170-Q172 and Q167 stands.


**[W35](doc/work-items/w35-a-map-on-real-workers.md) is DONE and it is P10's EXIT ARTIFACT.** A map
runs end to end on a real `FyflowScheduler` in both L6 runtimes: `r22:score:0:0`, `:1:0` and `:2:0`
are dispatched because a worker returned three items, and **that number is in no definition field and
in no constant in the harness**. Each instance receives **its own item** and computes a **different**
score, which is what makes ADR 0037 rule 3 distinguishable from its negation; the join carries all
three back keyed by branch path; `nested-map` runs a map inside a fan-out branch at the dotted paths
`1.0` and `1.1` and hands the outer join **a collection at key `1`**; `map / N = 0` is `stuck` with
one task dispatched; and `map / FD-R2` is the one map refusal no validator can make. **L6 is 638
assertions over 31 real runs**, from 489 / 25. **Every expected value was written from `spec/` before
the first run and all five rows passed first time.**

**What reverting costs is the item's other declared output, and one number is the whole of W33's
case.** W32 — a map opens no region — **kills the run at construction** with `FD-V11: node is not
reachable from entry`, which is P10's declaration measured from the other side; W33's arity costs
**35**; W34's collection **6**. **And W33's `arrival-count` re-sourcing costs exactly ONE**, on the
map row alone, every static row unmoved: the run still says `completed`, every branch still arrives,
and the only observable is `publish` receiving **one key where three were declared**. *`N` too large
hangs and is loud; `N` too small completes and is silent.* **Before this item that revert cost 0.**

**Its headline is W36's finding one layer in: a check can bind a command's RUNTIME and its
RESOLUTION and still not require it to open the FILE.** `S12` binds the gate chain's entry names and
`D6` bound `deno run` and `--import-map`; **nothing bound either rung's ARGUMENT**, and `test:l6`
had nothing but its name bound. Pointing either rung at `examples/run-flow.ts` — which exports functions and runs
nothing — costs **zero** failures across four checks, so **every exit artifact this repository has is
in one file and could be silently unrun for one edited word**. Closed by three more `D6` clauses as a
declared exception, with four probes and three `META` entries; that self-test is **26 / 27** from
22 / 24. **And the item's own rule 8 harness deleted its work** — `git checkout -- examples/` on a
dirty tree — which is [Q151](doc/open-questions.md) one layer out and is
**[Q172](doc/open-questions.md)**. **Rule 8: 25 provocations, 23 caught, 2 declared ceilings, 0
survivors standing**, with two of the catches bought by the `D6` fix. **Census CONFIRMED — 129
questions, 89 open, 2 deferred, 38 resolved**, both halves at 129 of 129; **Q170-Q172 all used, no
ADR, no `spec/` change.**


**[W37](doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md) is DONE and the scheduler pin is
`fyflow-scheduler` 0.5.2**, from both registries. **It is the fix for [S9](doc/scheduler-upstream.md) — the only item this
repository has ever raised upstream, raised 2026-09-07 and fixed the same day**, both halves plus a
second instance of the first that our report had not found (`core/workerManager.ts:3`). It belongs to
no plan, on ADR 0029's precedent.

**The published TypeScript source now LOADS under Node, and that expires an argument two ADRs rest
on.** Measured against the JSR 0.5.2 source: `LOADED under node 24.20.0 - exports: 10`. So *"Node
reads npm's `dist/` because it CANNOT read the source"* is no longer true — **and the split stays**,
on the reason that outlived it: `dist/` is what an npm consumer gets, so L6 tests the published
artifact rather than a source tree no consumer resolves, which is what `D4` and `D5` inspect.
Corrected in place in ADR 0013 rule 2 and ADR 0029, because an agent inheriting *"Node cannot"* would
design around a constraint that no longer exists. **The bump is otherwise clean and it was measured**:
`core/FyflowScheduler.ts` is byte-identical for a second consecutive version, `AGENTS.md` §6 is
byte-identical so ADR 0007's `user_action` pair is untouched, `SpawnTaskConfig.parents` is declared
and dead at a **third** version, and the whole source diff is **six files** — `import type` splits in **four**
(`threadWrapper`, `workerManager`, `inlineWrapper`, `workerWrapper`), `deno.json` gaining
**`verbatimModuleSyntax: true`** so the class cannot recur, and `README.md`'s worker section.
*(This said **two lines**, measured over four downloaded files and written as a claim about the
whole diff — the writing clause broken in the item that cites it. W37's conformity reader.)*
**Our report named ONE file; upstream fixed four and then closed the class with the compiler flag**
our own report had called the better form and did not expect to get.

**Its headline is that the WHOLE GATE was green at 0.5.2 with six documents naming 0.5.1.** Before a
single document was edited: `package.json`, the import map and `PIN` all moved, `GATE EXIT=0`, zero
FAIL lines — while `spec/README.md` rule 6 said *"the version we pin"* was 0.5.1, `AGENTS.md` said
*"Pin the scheduler at 0.5.1"*, and four more `spec/` documents cited it as current. **`D2` compares
the manifest to `PIN` and stops at the manifest.** **`D7`** is the answer and was not in the
declaration: two sentences, in the two documents a consumer reads first, bound to `PIN`. Its
self-test is **28 probes / 28 gradings** from 26 / 27.

**And Deno refused the pin for a day while `D3` printed `ok`.** `deno run` blocks a JSR version
published less than 24 hours ago — a supply-chain control, on by default — so `D3` compared two
strings, found them equal, and reported green for a pin one runtime could not fetch. **Third instance
in three items of one shape**: W35 found `D6` binding a command's runtime but not its FILE, W36 found
`D3` binding its inputs but not its PREMISE, this is the version bound but not its REACHABILITY. The
gate did go red on `test:l6:deno`, loudly. **Waiting was chosen over disabling the control**, by the
maintainer. [Q173](doc/open-questions.md).

**Rule 8: 14 provocations, 12 caught, 2 declared ceilings, 0 survivors.** A provenance probe on `D7`
could not be graded against a correct implementation — the literal and `${PIN}` are the same string
today — so it took a **compound** probe, W34's finding restated. **And this item reproduced W36's own
central defect within the hour**: correcting `CLAUDE.md`'s S9 sentence left `and it is ready to
raise.` stranded on the next line, saying the opposite of the sentence before it — the
neighbour-of-a-corrected-line leak W36 recorded twelve times, found by re-reading rather than by any
check. **Census: 132 questions — 92 open, 2 deferred, 38 resolved**, both halves at 132 of 132;
**Q173-Q175 used, ADR 0038 SKIPPED, `deno.lock` regenerated** with its integrity hash unchanged.

**[W36](doc/work-items/w36-the-scheduler-pin-moves-to-0-5-1.md) is DONE and the scheduler pin is
`fyflow-scheduler` 0.5.1**, from both registries — npm and JSR, `latest` on both. **It belongs to no
plan**, on [ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
own precedent: an environment change belongs to no plan, and taking a reserved id would make a plan's
ledger false. It is a **work item rather than a chore** because it falsifies a sentence in the
normative layer — `spec/README.md` rule 6 named 0.3.0 as *"the version we pin"*.

**The bump is behaviourally clean and that was measured rather than assumed.**
`core/FyflowScheduler.ts` is **byte-identical** between 0.3.0 and 0.5.1 — 1851 lines, zero changed —
so all eleven lines `spec/` cites are unmoved; the `user_action` event pair holds, measured by running
it; `SpawnTaskConfig.parents` is still declared and dead, so `doc/concept.md` section 2's founding
fact is re-verified at a second version; and **L6 passes 489 assertions / 25 real runs in BOTH
runtimes**. The reference grows 858 to 887 lines and **every added line is `worker.setup.*` /
`worker.teardown.*`**, a family this library subscribes to not at all — [Q167](doc/open-questions.md).
`spec/` is **7 documents, 33 examples, 80 rules**; `task-id` **v0.9**, `outcome-record` **v0.7**,
`join-policy` **v0.14**, `runtime-targets` **v0.8**. `npm run gate` is **`GATE EXIT=0`, zero FAIL
lines, 19 entries, 455 s**.

**Its central risk is the thing it got wrong, and its readers found twelve instances.** The item's own
scope says the 167 citations of `0.3.0` split into **live** and **historical**, and that a blanket
replace *"would silently rewrite the evidence twelve items were decided from"*. **The split is
enforced by reading, and it leaked twelve times** — every one a **neighbour** of a line changed
correctly: the note beside the pin, the row below it, the second half of the same header comment, a
later section of the same `spec/` document, the Consequences under a re-dated ADR, and
`spec/task-id.md`, **named in the item's own `Spec:` line and then not touched**. A prefix replace
also put **`0.5.0`** into ADR 0029 rule 2, in the decision that IS the pin's authority. *Reasoning
about a line does not sweep what surrounds it.*

**And the adequacy reader's headline is the sharpest finding: a check bound its INPUTS tightly and
its PREMISE not at all.** Dropping `--import-map` from `test:l6:deno` makes Deno resolve the bare
specifier out of `node_modules` — **the npm package** — and L6 reports *"on deno 2.9.6"* at 489
assertions, exit 0, **with `D3` printing `ok`**; the JSR half is never loaded. Replacing the command
with `node examples/l6.ts` deletes the Deno rung entirely, also for zero. `S12` binds the gate chain's
entry NAMES; **nothing bound an entry's ARGUMENTS**, so `D3`'s premise — *ladder L6 runs in both
runtimes* — was a fact about a command string nothing checked. **`D6` closes both**, with two probes
and two `META` entries. **This is obligation (e) in a fourth shape**: not a check that is not run
(W24, W30), not a guard that cannot reach its subject (W33), not a value computed and never read
(W34), but **a check whose stated premise is a fact about a command string**.

**Two more were in code written to FIX a provenance problem.** L6's version banner read `node_modules`
in both runtimes with a comment claiming that was *"the thing that was loaded"* — true in Node, false
in Deno — and it read correctly only because `D3` forces the halves to agree, so the bug was invisible
exactly while the check it depends on passed. The discriminating test is checked in: with the npm
manifest corrupted, **Node prints 9.9.9 and Deno prints 0.5.1**. And adding `D6` produced a live
instance of a class this repository had killed as a hypothesis — `ALL_CHECKS` is a **closed
allowlist**, so `D6:` failure lines were invisible to the id parse ([Q43](doc/open-questions.md)'s class,
which W29's declaration killed for three other self-tests).

**Rule 8: 25 provocations, 19 caught, 6 declared ceilings, 0 aborted**, with twelve reader edits
checked back in — **and the re-run found that a fix for a reader's finding was HALF a fix**, which is
that obligation's founding observation. `PROBES` now carries **three** bounds it did not have —
citation, distinctness and content — the set `META` has had since W29. **Overlap 1**, the eighteenth
measurement, inside the 0-4 band, both readers unprimed. **Census: 126 questions — 86 open, 2
deferred, 38 resolved.** Q167 used; **Q168 and Q169 reserved and unused**. **No ADR**: the decision
(one exact version, from both registries, `D3` comparing the halves) is ADR 0029's and is unchanged —
[Q3](doc/open-questions.md) is **amended, not reopened**.


**[P8](doc/plans/p8-what-can-be-deleted-with-the-gate-green.md) asks *what can be deleted from this
repository with `npm run gate` still green?*, and it is the plan that owns `scripts/**` and
`package.json`** — the paths in nobody's `Owns` that blocked **two** checks in P7 alone, which P7's
retro named and deliberately refused to make a workflow rule. It also **exercises rule 7 (c)**, unused
for five plans. **Its declaration measured four load-bearing facts and three of the register rows were
wrong** — the twelfth plan running to have that happen, and the eighth to find a register row wrong by
trying to act on it:

- **[Q123](doc/open-questions.md)'s premise is FALSE.** *"`HEAD` is LF throughout"* — `git ls-files
  --eol` says **161 LF and one CRLF**, and the CRLF file is **`doc/concept.md`**, CRLF in all six
  commits that ever touched it, back to the founding commit. So a check refusing CRLF **fails on day
  one** on the document this file says to read rather than re-derive, and W26 owns a choice it would
  not otherwise have had.
- **[Q121](doc/open-questions.md) is wrong twice and incomplete once, and the third is what matters.**
  Dead file links today: **0**. Code-span false positives: **4 in three files**, not two, one of them a
  placeholder rather than a link-syntax illustration. **And it never mentions anchors** — `C5` strips
  `#…` and compares the path alone, so it is blind to **14 dead anchors over 9 targets, being all nine
  S-ids in `doc/scheduler-upstream.md`'s own index**, which `git log -S` shows were **born dead in the
  founding commit** and have never once worked. `C5` **can be lifted rather than copied** (measured:
  span-blanking leaves `spec/` at 0 → 0) but **its id must survive**, being cited in seven documents.
- **[Q126](doc/open-questions.md) was confirmed, the hole was seven times wider, and [W24](doc/work-items/w24-the-gates-own-wiring.md)
  CLOSED it.** `check-source.mjs:290` was the only thing that read `scripts.gate` and `S11` guarded
  **8 of 15** entries; one level down nothing guarded `typecheck`'s five sub-typechecks,
  `test:browser`'s `build:browser-tests`, or **`lint`'s directory list** — dropping `examples/`
  un-lints all of L6, which is rule 8's fourth obligation applied to `package.json`. **The chain is
  now 16 of 16 guarded** by `S12` — a declared list compared to `scripts.gate` **both ways and in
  order**, equality rather than a floor, so a **swapped** entry fails where a floor passes — and the
  three composed lists by `S13`, **two of whose clauses derive their bound from `package.json` and
  from disk rather than from the declaration**, so emptying the list fails rather than passes.
- **A third item was declared and DROPPED before it started, and both halves are recorded.** W26 —
  *a tracked text file's bytes* — is out on a **scope call, not a measurement**, leaving P8 at exactly
  the two checks P7 declined. **`doc/concept.md` is normalised to LF in P8's declaration commit**
  (221 CRLF pairs removed at the byte level, byte-identical to the previous `HEAD` with the CRs
  stripped, so none of the `Get-Content | Set-Content` re-encode hazard), because the file was wrong
  today and the check that would catch it is not being built. **No `.gitattributes`** — it hides the
  problem where a check would show it. **W26 and W27 are skipped and never reissued; the next plan
  starts at W28**, and [Q123](doc/open-questions.md) and [Q131](doc/open-questions.md) return to the
  register with no owner. **Q131 is deliberately NOT fixed**, so whoever builds that check has a live
  defect to fire on.
- **[Q131](doc/open-questions.md) is new and nobody had raised it.** The census parser — the
  **aborting** kind P6's retro asked for — split rows on unescaped pipes and found that **`Q119` and
  `Q71` render their Status and Owner columns wrong**: Q119's Status shows `regions` and its Owner
  shows `^2) with the inner call doubled…`, with the real `open` / `no owner` dropped off the row. In
  the file read before every work item. **The register is now 92 questions — 58 open, 2 deferred, 32
  resolved**, and the standing *"59 open"* was the right total under the wrong noun.

**[W24](doc/work-items/w24-the-gates-own-wiring.md) is DONE, [Q126](doc/open-questions.md) is
RESOLVED, and `check-source` has the first self-test it has ever had.** The gate chain is **16 of 16
entries guarded** where it was 8 of 15, plus the three lists one level down. **`S12` is set equality
AND order** — the order clause exists because a reader pointed out that `&&` in sequence is the only
implementation `doc/workflow.md` section 4's ladder has. **`S13` carries two clauses whose bound
comes from somewhere other than the declaration** — `package.json` itself for which entries compose
other scripts, and the disk for which trees must be linted — so emptying its list fails rather than
passes. `scripts/check-source-selftest.mjs` is **24 probes, 20 gradings of those probes, 3 of the
probe list itself**, ~34 s, each probe declaring the exact **set** of checks it must trip. **Rule 7
(c) fired on its first outing here**: the item's own declared table gave probe 7 as `{S11}` and the
true set is `{S11, S12}`, reported as 16/17 rather than passing.

**Four things W24 WROTE DOWN were false and measurement is what caught each.** Two of the four
self-grading ceiling holes copied from `check-policies-selftest.mjs` are **caught** here rather than
live; *"S11 guards eight of the gate's sixteen entries"* mixed the before and after counts; *"three
lists live here"* was four; and *"order is deliberately NOT asserted"* rested on a reason that was
wrong. **The item's own claimed survivor was the worst of them** — *"deleting the `lint` row from
`COMPOSED` costs 0 failures"*, measured by running `check:source` and never the self-test, which it
turns red. It was one command from being written into the register as a fact. **[Q43](doc/open-questions.md)'s
class, inside the file built to refuse it.**

**And its method finding is an axis rule 8 does not have.** Both readers independently found the same
hole in **the entry W24 adds**: `"check:source:selftest": "node scripts/check-source.mjs"` — drop
` --self-test` and the whole self-test never runs, with `npm run gate` at **exit 0**. All four
`:selftest` entries had it. Neither the author's twenty-four probes nor the item's declared thirteen
could reach it, because every one asks *what happens when the INPUT is broken* and this asks **what
happens when the CHECK IS NOT RUN**. That is not a clause, not an output row, not a provenance and not
a bound. **For P8's retro.** Its questions: [Q132](doc/open-questions.md) (the probes cover **4 of
`check-source`'s 13** checks; the other nine are pattern lists each emptiable for 0, and `check-spec`
still has none), [Q133](doc/open-questions.md) (the gate now spends about a minute proving its own
checks can fail and nothing decided that it should), [Q134](doc/open-questions.md) (`S12` subsumes
`S11`'s membership half) and [Q135](doc/open-questions.md) (a **third** register row renders wrong, by
a different mechanism than Q131's two). **[Q102](doc/open-questions.md) is ANSWERED and not closed: an
owner MOVES it, NARROWS it and MULTIPLIES it** — `Owns` is per-item rather than standing, `S12` is
equality rather than a floor, and W24 ships three more floors of Q102's own shape, two of them made to
fire by a list one level out. **No ADR: 0032 and 0033 are both skipped.**

**[W25](doc/work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) is DONE and P8 is CLOSED.**
`scripts/check-markdown.mjs` resolves every relative link and **every anchor** across
**62 documents / 1602 relative links / 80 anchored** — `M1`, `M2`, and `M3`/`M4`/`M5` for the walk's
own bounds. **`C5` is LIFTED rather than copied and keeps its id**, cited in nine documents;
`check-spec.mjs` is now a caller. **The fourteen dead anchors are fixed** — nine S-ids in
`doc/scheduler-upstream.md`'s own index, **born dead in the founding commit** and never once working,
in the file this document points at for upstream wants. [Q121](doc/open-questions.md) is RESOLVED.

**W25's declaration falsified the ARGUMENT behind one of P8's decisions**, which is W22's shape one
plan on. Decision 3 said runs are not collapsed *"which is the whole difference between the two-hyphen
and three-hyphen forms"*; four different slug rules each report **the same 14 dead of 76**. The
conclusion survives — the declared rule is what GitHub does — and its stated reason did not.

**And what replaced that reason is the item's central finding: a check can ship against a corpus that
cannot falsify its central rule.** Three clauses, one item. The four slug rules disagree about
**134, 140 and 294 of 584 headings** and **no link points at any heading they disagree about**. All
**76** anchor links are **same-file** — zero cross-file — so a provenance mutation on the anchor source
swaps one expression for an identical one, found by a META entry coming back *not noticed*. And the
file half **ships green** at 0 dead links, so `M1` would pass on an empty implementation. **Then the
item's own fix made two thirds of the first one false** — the fourteen repaired anchors ARE the
discriminating cases — and only a reader noticed. *Fixing the defect built the fixture that proves the
rule.*

**Its readers found 13 + 23 things, 2 + 7 blocking, and two were structural.** All three `M3` clauses
reported under **one id**, so set equality could not tell them apart and two of the three floors were
replaceable by `if (false)` for 0; and the probe harness could only edit **one document's text**, so
the file and link counts were unreachable from any probe. Split into `M3`/`M4`/`M5`, and the harness
gained a `removes` capability. **Four probes were wrong at birth, two more could not discriminate, and
two META entries matched a COMMENT instead of the code** — the paragraph above the floors quotes them
verbatim, so `String.replace` edited the prose and the check ran unchanged. **A comment that quotes
the code it explains makes that code unmutatable by a literal-anchored probe.**

**[Q102](doc/open-questions.md) reproduced one item later, not one plan later.** W24 predicted the
ownership half would be settled by the next plan to edit the gate chain; it took the next **item**, and
W25 declared it as a late exception. `RUN_FLOOR` went stale **silently, toward weakness**; `S12` failed
**loudly, toward safety**, naming both the entry and the file to edit.

**The cost is a decision somebody owes, and the number is 88% rather than half.** *(P8's retro wrote
*"`check:markdown:selftest` is **2m31 to 3m14** of a **4m46 to 6m00** gate … roughly half the gate,
either way"*. **The absolutes were right and the comparison was not** — it counts **one** self-test
and there are **five**. Corrected at P9's declaration by one timed pass over the gate's own eighteen
entries: `check:source:selftest` 23.1 s, `check:markdown:selftest` 129.4 s, `check:scheduler:selftest`
2.0 s, `check:policies:selftest` 6.5 s, `check:docs:selftest` 45.3 s = **206.3 s of 234.6 s**. **The
whole product-facing gate — every check, L0-L5 in three runtimes, and both L6 runtimes — is 28 s.**
That run's `check:markdown:selftest` was **2m09**, below the recorded band, which reinforces rather
than undermines the *"absolutes are not constants"* half. **A third shape for this repository's count
problem: not stale and not mis-derived, but a correct number answering a narrower question than the
sentence around it claimed.)* [Q133](doc/open-questions.md) and [Q138](doc/open-questions.md); changing what the gate
RUNS was out of P8's scope. **P8's retro proposes two `doc/workflow.md` changes and adopts neither**,
on one occurrence each with a stated argument: a **fifth** rule 8 obligation — *break the WIRING: what
happens when the check is NOT RUN* — and *a check written for a defect you just fixed has no live case,
so its probes are the whole of its evidence.* **No ADR: 0032 and 0033 both skipped.**


**[P9](doc/plans/p9-when-a-check-stops-checking-what-notices.md) is COMPLETE and RETRO'D, and
`doc/workflow.md` is [v0.10](doc/workflow.md).** Its question — *when a check clause stops checking,
what notices, and does it notice for the right reason?* — is answered on both halves. **Before P9 a
clause going inert was noticed by an EXIT CODE**, which cannot tell a detection from noise, a crash, a
sibling covering for the clause, or a harness that never ran. **After it, 118 gradings name the probe
that must break**, up from 63, over **136 probes** and **31 `SELF` entries** from 100 and 6.

**Its central finding is that the defect P9 set out to remove was living inside rule 8's own
procedure.** Rule 8 grades a provocation by *did the gate go red*, and P9 found that wrong **six times
in three items** — three `SELF` entries that bounded an ABORT while naming a floor, a probe refused by
the copy of a duplicated expression that was already covered, 17 of 21 gradings reporting the right
verdict by the wrong route, and a probe that reported *refused* by crashing. **Read the failure lines,
not the exit code.**

**v0.10's three changes**, each measured rather than argued:

1. **Rule 8 gains a FIFTH obligation: break the WIRING — what happens when the check is NOT RUN.**
   Three instances, three items: the **manifest** (W24), the **script** ([Q149](doc/open-questions.md),
   W30 — the four-line dispatch deleted, exit **0** with the self-test unrun, measured **six for six**,
   and `S11` reads the manifest so it cannot see it), and the **harness**
   ([Q151](doc/open-questions.md), W31 — mutants written into a directory the child deletes, reporting
   `12/12 bounded` at exit 0 while every grading read *"the mutant did not run"*). **Earned against a
   prediction P9 wrote down before the item that tested it.**
2. **Rule 8 gains a requirement on the SET: a provocation is evidence only when it FIRES, and only
   when it fires FOR THE REASON IT NAMES.** The first half is P8's proposal, adopted — W30 is seventeen
   instances at once, W31 constructed three cases, and W29's `D5` is the live counter-case. The second
   half is the six occurrences above.
3. **Section 1 rule 5 gains a clause about WRITING: a claim states the scope it was MEASURED at.**
   W30 measured five checks and wrote *"all five"* into six documents when there are six; W31 measured
   one file and wrote *"in any of the three"* with an owner cell naming six, **false in two**. Neither
   read anything wrong; both generalised without saying so.

**And a question P6's retro left open two plans ago is answered NO**: rule 8 stays a rule rather than
becoming a section, because *"section 5 rule 8"* is cited in four plans, eleven work items and the
register — section 3's *ids are never renumbered*, one level out. It gains an **index** instead.

**The cost is the number to remember, and it is measured in one pass rather than subtracted across
two.** The six checks cost **4.3 s**; proving they can fail costs **347.0 s** — a factor of **81**.
Against a 438 s gate that is about 79%, down from 88% at P9's declaration while the absolute rose from
206 s: **W28's contract change worked** — `check-markdown` went 129.4 s to 65.1 s — **and the coverage
ate it.** [Q133](doc/open-questions.md) stays open with a better number on both sides, and
[Q148](doc/open-questions.md) is the constraint on the obvious mitigation: two of the six cannot run
concurrently, because `check:scheduler:selftest` moves `node_modules/fyflow-scheduler` aside while an
`AGENTS.md` snippet imports it.

**Its exit artifact grew from three row shapes to NINE**, and four of the six new ones are neither a
detection nor a miss: a sibling clause reporting the same id (masking), the same but **co-firing** and
therefore detectable by the failure COUNT, a clause **unreachable by construction**, a grading that
passes as **`corpus`**, a clause noticed **under a different id**, and — W31's, and invisible to
everything this plan built — a **message-only** clause that assigns a diagnosis and touches no verdict.

**Reader passes: eight, none empty, overlap 4, 1, 2 and 0.** W31's **zero** is the fourteenth
measurement and the first outside the settled 1-4 band, so the band is corrected to **0-4** and the
conclusion is not: a zero is what *"the second reader finds what the first was not looking for"*
predicts at its limit, and that pair produced the largest yield of the four. **The caveat is recorded
with it** — W31 primed both readers with the same list of its author's uncertain claims, which no
earlier measurement did.

**`check-owns.mjs` stays retired for the fifth plan** (eleven consecutive correct `Owns` audits;
P9's four at zero, zero, two and zero). **Rule 7 (c) is EXERCISED heavily** — all 136 probes declare
their set — and W29 found its mirror image: naming one check does not discriminate because a malformed
probe trips two, and **two clauses that both trip the right one are indistinguishable**. **`doc/` is
refused for the eighth time.** **Q141-Q153 all used, the first plan to spend its whole block; one
resolved. ADR 0034 and 0035 both SKIPPED.**

**[P9](doc/plans/p9-when-a-check-stops-checking-what-notices.md) was declared as — *when a
check clause stops checking, what notices, and does it notice for the right reason?*** It takes
[Q138](doc/open-questions.md) and [Q132](doc/open-questions.md) as **one subject**, because they are
the same defect from two sides: a self-test's META pass grades a broken check by its **exit code**, so
it cannot tell *the clause I broke was caught* from *something else went wrong* — and because the
verdict is an exit code, reaching it means re-running the whole probe suite. **Three items, serial**:
[W28](doc/work-items/w28-a-grading-names-the-probe-it-breaks.md) makes a grading name the probe it
breaks; [W29](doc/work-items/w29-the-two-self-tests-that-grade-nothing.md) gives a META pass to the
two that have none; [W30](doc/work-items/w30-the-clauses-nothing-probes.md) gives probes to nine of
the sixteen clauses that have none, including **`check-spec`'s first self-test ever**. **Q ids resume
at Q142; ADR 0034-0035 reserved and expected skipped; W31 reserved and expected unused.**

**[W29](doc/work-items/w29-the-two-self-tests-that-grade-nothing.md) is DONE** — author pass, both
readers and rule 8's re-run. *(This sentence read "its two readers have NOT run" for a day after
W29's own file said `done`, here and in `doc/README.md`, where the same paragraph then said "Both
readers ran" two sentences later. `doc/workflow.md` section 1 rule 5 is what made W30 read the item
file instead; **an index contradicting itself inside one paragraph is a new shape for that class**.)* `check-scheduler-selftest.mjs` is **20 probes / 22 gradings — one per `fail()` site plus one per way
the report can lie** — from 12 and none; `check-docs-selftest.mjs` is **14 / 8**, capped at one entry
per check id plus two for the report and one for the exit path, **with the nine it leaves out named in
the file's own header** *(these three figures read 18 / 21, 14 / 7 and ten — W29's AUTHOR-PASS counts,
left behind when its readers' fixes added two probes, a grading and a clause. W29's own file,
`README.md` and `doc/README.md` all carry the shipped numbers; this paragraph did not, and W31 rewrote
the two sentences above it without touching them. Found by W31's conformity reader)*
rather than omitted. *(That list read **six** until W29's conformity reader found it undercounting by
two — in five documents at once, in the item written to refuse exactly that. One of the ten,
`check-docs`' missing-document refusal, is reachable by **no probe at all**: every probe writes its
mutated reference to disk, so none can present a document that is not there.)*
**[Q141](doc/open-questions.md) is RESOLVED** — `D5`'s empty-parse clause reproduced inert at **12/12
green, exit 0**, closed by a `CHECK_SCHEDULER_DTS` override and a **hand-written** fixture, **which
closed two more `D5` clauses that were unreachable for the same reason**. Both files also gained the
report-row **`agree`** projection, after a measurement that deleting a row from the `checks` array —
or forcing every verdict to `ok`, which erases `check-scheduler`'s **`NOT RUN`** — was invisible to
every probe in both ([Q100](doc/open-questions.md)).

**[W30](doc/work-items/w30-the-clauses-nothing-probes.md) is DONE** — author pass, both readers and
rule 8's re-run, which caught three defects in the fixes themselves.

**Its two readers found 10 and 17, seven blocking, and the split is the cleanest since W29's**: the
conformity reader found **claims that were false** — a census wrong in six documents, an `Outputs`
row attaching a check id to an unmeasured case, a cluster table still stale after the item said it
had fixed it — and the adequacy reader found **bounds that were not there**, twelve of its seventeen
survivors on rule 8's obligations (a) and (d) and not one reachable by a probe that breaks a VALUE.
**Overlap 2**, the thirteenth measurement and inside the settled band. `check-spec.mjs` has a `--self-test` for the first time since W1, and
`scripts/check-spec-selftest.mjs` is **18 probes / 21 gradings**: one of each per `fail()` site for
`C1`-`C4`, `C6`-`C8` — **seventeen, with no cap** — plus two for the report and two for the exit
path. `check-source-selftest.mjs` goes **24/20/7 to 34/24/10**, closing `S4` and `S7`, the two clauses
[Q132](doc/open-questions.md) names as having no second route anywhere and which four clause-level
mutations had just been measured to leave at **24/24 probes green**. The gate chain is **19 entries**;
`npm run gate` is **322 / 326 s**, exit 0, zero FAIL lines, with L1-L6 unmoved.

**Its central finding REVERSES P9's own written-down prediction, and that is why the prediction was
written down.** P9 predicted `S11` would catch W30's new wiring, making P8's proposed **fifth
obligation for rule 8 — break the WIRING** — unearned. `S11` catches the **manifest** four ways, all
measured and all by name. **It does not catch the SCRIPT**: delete the four-line `--self-test`
dispatch from `check-spec.mjs` and `npm run check:spec:selftest` runs the plain check, exits **0**,
and `check:source` exits 0 beside it. Measured in **all SIX** checks that carry a dispatch — for
`check-docs` that is 128 s of gradings silently not running. *(This paragraph read **five** until
W31's conformity reader found it: W30's own conformity reader corrected the count to six and W30
recorded it as *"corrected in all six"* documents, and this was one of two it missed — so this
document said **five** here and **sixth** in W31's paragraph below. The same shape W31 names for W29
one paragraph up, in the same file, one item later.)* [Q149](doc/open-questions.md), and **the obligation is earned
on the item that predicted it would not be.**

**And the claim W30 argued hardest for was FALSIFIED by its own adequacy reader.** Its file said *"a
bound whose authority is the checked artefact rather than a declaration stops the regress where it
is"*; emptying `GRADED_IDS` — the list that bound named its universe with — printed **`0/0 graded` at
exit 0**, every grading gone and green. The authority was the artefact and the **scope** was a
literal with nothing beyond it. The list is now **derived** from `check-spec.mjs` twice over and
cross-checked, and rule 8's re-run then showed the hole **moved rather than closed** — which is
`check-source-selftest.mjs`'s own sentence, quoted in W30's header and not applied to it.

**Both of W29's structural holes were LIVE in `check-source-selftest.mjs`, and W30 measured them
rather than inheriting the claim** — an entry replaced by a **duplicate** of another, and one entry's
anchor made **global** so it disabled all five `S12` sites while naming one. Each reported
`20/20 noticed` at exit 0. Both closed, and both now bounded by a `SELF` entry rather than merely
present. **And [Q150](doc/open-questions.md) is new**: a `corpus` grading is a **pass**, so dropping
W30's own import relocation made all 21 mutants non-inert and the file exited 0 saying *"0 noticed by
the named probe, 21 by the corpus"*. Closed there by a declared `MAX_CORPUS = 0`; live in the other
four.

**And a mechanism can be unreachable in the file that most needs it.** On its first run **no META
entry in `check-spec-selftest.mjs` graded `caught`**, so W29's failure-COUNT discriminator would have
shipped as decoration in the file with `C7`'s five `fail()` sites under one id. An eighteenth probe —
one flow tripping the workerType clause and the predicate clause at once — makes it reachable and it
fires at **2 → 1** with the id set unmoved. **It then paid for itself twice**: forcing
`refused = true` is refused *because* the two report entries grade STILL CAUGHT and the count does not
move either. **The report-id repair, by contrast, has NO discriminating case this corpus can express** —
every id `check-spec` reports is two characters — so it ships inert, with the `C10` case constructed
and measured rather than argued, and **no META entry**, because one would grade STILL CAUGHT and be a
lie.

**The census parser was wrong in a direction no previous one has been, and the register was stale by
three.** W30's first parser was **code-span aware** and aborted on **three rows that render
perfectly** — Q101, Q102 and Q117 each carry an odd number of backticks. GFM cuts a table row on `|`
FIRST and parses inline code afterwards, which is also exactly why [Q131](doc/open-questions.md)'s two
rows really do render wrong. **A parser more careful than the renderer reads a different document.**
Corrected, the census is **CONFIRMED for the second plan running — 109 questions, 73 open, 2 deferred,
34 resolved**, 29 ids in both tables, Q119 and Q71 carried as two **declared** exemptions. **And the
cluster table was stale by three**: Q146, Q147 and Q148 sat in no cluster cell at all, in the half the
register's own note says is checked separately. Corrected in place.

**Its declaration step changed the item's SIZE rather than its table, and that is a first in fifteen.**
A META entry is **two** check runs, because W28's readers added the inertness run — so P9's *"~46 s for
ten entries"* is optimistic by **2.3x**. Measured: **7.1 s** an entry in `check-docs` against **~0.5 s**
in `check-scheduler`, two orders of magnitude, and the coverage was bought accordingly rather than
evenly. **The obvious mitigation is unsafe today**: `check:scheduler:selftest` moves
`node_modules/fyflow-scheduler` aside and an `AGENTS.md` snippet imports it, so those two self-tests
**cannot run concurrently** — invisible while the gate's chain is `&&`, and a flaky snippet failure the
moment anyone parallelises it. [Q148](doc/open-questions.md), for whoever answers
[Q133](doc/open-questions.md).

**And the finding to carry is a limit of rule 7 (c)'s own form, one layer out — corrected once under
measurement, which is the half worth reading.** `D2`'s and `D5`'s unreadable-input clauses both came
back **STILL CAUGHT**, and the author read the same mechanism into each: **a sibling clause reporting
the SAME id firing in the disabled clause's place**, invisible to set equality. Both entries were made
to **declare** the masking, on the argument that the declaration goes red if the masking ever changes.
**That argument was FALSE and W29's conformity reader measured it**: deleting `D5`'s
`!failures.some(…'D5')` fallthrough guard left the file at **18/18, 21/21, exit 0** — the guard was
deletable for 0, a *third* instance of the class inside the mechanism written to describe it.

**The fix is the discriminator [Q146](doc/open-questions.md) itself proposed and the author had
declined: the failure COUNT.** A `caught` verdict is no longer terminal — the entry is re-run against
the unmutated check and the counts compared, one extra child for the entries that reach it (today,
one). **And it split the two cases apart the moment it ran.** `D2` is **CO-FIRING, not masking**: both
clauses report under `D2`, so disabling one moves the count **2 → 1** and the clause **is** detected —
it is graded normally now and its declaration was removed. `D5` is the real thing: same id **and**
same count, because its guard exists so the two never both report. **Co-firing is detectable by a
projection nobody was reading; masking is not.** Rule 7 (c) settled that naming *one* check does not
discriminate because a malformed probe trips two; this is the mirror image — **two clauses that both
trip the right one are indistinguishable** — and the signal that discriminates half of them was
printed in the report all along, as `(2)` versus `(1)`.

**Rule 8: 29 provocations, 14 refused, 15 survivors, eleven of them the ceiling** — wider in these two
files than in `check-source` because **neither has a `SELF` list**, and W31 is narrowed to
`check-policies`, so nothing picks them up. **Two positive tests the set structurally could not reach
both fired**, and the first closes a named gap: **[Q144](doc/open-questions.md)'s missing case is
CONSTRUCTED** — a mutant inert on the clean tree and **fatal under the probe**, reporting `ran: no`
with the guard live and the identical crash graded **`disappeared`** with it disabled. That is the
first demonstration anywhere that `ran:` fires, in a guard live in five files and provoked in none.
The second is W29's own new **ambiguous-anchor** guard, which refuses a three-way match by name.
**[Q147](doc/open-questions.md)** is the survivor worth naming: re-sourcing `tripped` to the report
rows costs **0**, because the report entries then pass as `disappeared` instead of `disagreed` — **the
right verdict by the wrong route**, which is Q138's shape one layer further in.

**The 39 check clauses split THREE ways and nobody had written the middle one down.** 13 have a probe
**and** a grading; **10 have a probe that nothing grades** — `D1`-`D5` and `X1`-`X5`, because
`check-docs` (14 probes) and `check-scheduler` (12) have **no META pass at all**, and `check-policies`
has META and no `SELF`; and 16 have **no probe**. That split is the item decomposition, and it is why
P9 is three items rather than two.

**Its declaration measured six load-bearing facts, four changed what got written, and one of the four
was a hypothesis it killed before writing it down.** [Q132](doc/open-questions.md) says `check-spec`
has *"8 more clauses, 0 probes"* — it is **7**, because
[W25](doc/work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) gave `C5` two probes one item
after Q132 was written at W24. **[Q141](doc/open-questions.md) is new and is the one live defect**:
`check-scheduler`'s `D5` empty-parse clause can be made inert with **all twelve probes green**,
because no probe supplies a `.d.ts` the parse cannot read — while four other clause-level mutations of
the same two checks were **caught**, so the yield of *no META pass* is **1 in 5** and is reported as
measured rather than assumed. **And the killed hypothesis is the `ALL_CHECKS` allowlist** W24 removed
from `check-source-selftest.mjs`: it is still in three self-tests and **renaming a reported id outside
each list was caught in all three**, because every id those checks report is declared by some probe.
[Q43](doc/open-questions.md)'s class, refused at the declaration step rather than written into the
register as a hole.

**Q138 is confirmed and sharper than its own row.** Across all 56 code-targeted META entries in
`check-source` and `check-markdown`, every grading is `r.status !== 0`; **which probe gets the credit
is an artefact of `PROBES`' ORDER** — five of `check-markdown`'s six slug-rule mutations are credited
to *a link to a file that does not exist*, while the two probes written for the slug rule sit lower and
never run; and in **7 of 56** the crediting probe declared a non-empty set and reported a **strictly
larger** one, meaning the mutant became **noisy** rather than being detected. Only **14 of 24** and
**31 of 37** probes are ever the one that notices.

**And the declaration's own four documents turned the gate RED, which is the seventh fact and the one nobody could have predicted.** `scripts/check-markdown.mjs`'s header argues its `M3`/`M4`/`M5` floors are *"a MINIMUM nobody is obliged to raise, which is what keeps them out of [Q102](doc/open-questions.md)'s shape"*. **Right about the CHECK, false about the PROBES** — `M3` and `M4` are fired only by two `removes` probes that cut directories out of a copy of the tree, so each floor must sit **above the probe's fixture and below the whole tree**. One plan and three work items took *doc/decisions removed* from 46 files to **50** against a floor of `< 50`, and `npm run gate` exited **1**. **So it IS Q102's shape and worse** — two-sided rather than one-sided — and the mitigation is the direction: `RUN_FLOOR` went stale *silently, toward weakness*; this failed *loudly, in the gate*. Retuned to **56 / 1350 / 60** from a measurement, which restores green and **does not remove the ratchet**. [Q142](doc/open-questions.md), owned by W28. *(Retuning it then broke the two META entries pinned to the old literals — rule 7 (b) firing correctly rather than passing: **a mutation pinned to a magic number is unmutatable the moment the number is right to change.**)*

**The census was CONFIRMED rather than corrected, for the first time in four plans** — 99 → 100 with
Q141, **65 open, 2 deferred, 33 resolved** — and the parser aborted three times on real hazards first.
**The third abort is the one to carry**: honouring only the strict `| a | b |` row shape **silently
merged Q87 into Q86 and lost a whole question**, and the parser did **not** abort, because a merged
row is still classifiable. *A parser that aborts on what it cannot classify does not abort on what it
misreads as something else.*

**[W31](doc/work-items/w31-the-self-list-check-policies-never-had.md) — P9's LAST item — is DONE**:
author pass, both readers and rule 8's re-run. `scripts/check-policies-selftest.mjs` is **13 probes /
6 gradings / 14 SELF**, from 13 / 6 / none, and `check:policies:selftest` goes **2.2 s to 14.7 s**
(bare `node`), against a control — `check:spec:selftest` — flat at 17-21 s on both sides.

**Its two readers found 5 and 10, eight blocking, and the OVERLAP IS 0 — the fourteenth measurement
and the first outside the settled 1-4 band.** Their only shared subject is
[Q152](doc/open-questions.md), approached from opposite ends and yielding two different corrections.
**One caveat, stated rather than buried**: both were given the same list of *claims the author was
least sure of*, a priming none of the thirteen earlier measurements had. The adequacy reader found
**guards that were not there** — four of its five blocking findings were unreachable by the author's
own set, and **three of those four are one shape: an entry written to a LIST when the thing it had to
bound was a GUARD**. The conformity reader found **claims that were false** — a register row
generalised from one file to six, a ceiling row quoting a literal the file no longer contains, and a
cost decomposition that accounts for the whole run inside one of its phases.

**The sharpest single finding is the verdict the thirteen probes exist to produce.**
`if (caught !== PROBES.length)` cost **0**, and the ceiling list had never carried it — the two
verdicts it names are the META one and the `SELF` one. **It is also what makes rule 7 (b)
load-bearing**: a probe whose mutation matches nothing prints its `FAIL … the mutation matched
nothing`, prints `12/13 probes caught`, and without that line **exits 0**. No other `SELF` entry could
reach it, because every other one breaks a LIST and this breaks the VERDICT OVER a list.

**And [Q152](doc/open-questions.md) is the register's own standing failure in a row raised to record a
different instance of it.** It generalised a measurement taken in one file to six; `check-spec` and
`check-scheduler` do NOT carry the message-only form, because W29's failure-COUNT discriminator turned
that arm into a block that can set `ok`. Disabling it costs **1** and **2** there. Corrected in the
register, here and in `doc/README.md`. **That is the cheapest self-test in the gate becoming a mid-priced one**, for a
check with three clause ids and ten `fail()` sites, and it is recorded as a number rather than a ratio.
`npm run gate` is **425 s over 19 entries, exit 0, zero FAIL lines**, with L1-L6 unmoved at 474 `test()`
cases and 489 L6 assertions.

**Its declaration was wrong in FOUR places before anything was built.** `Reserves: Q146-Q148`
**collided with W29**, which reserved the same block and used all three — corrected to **Q151-Q153**
with nothing renumbered; the gate is 19 entries, not 18; the baseline sha was W28's; and the Record's
prefilled *"one `META` entry deleted — cost 0"* is **1**, because `MIN_META` fires and the hole is the
floor being **lowered**. Eleventh time a row has been found wrong by trying to act on it, and the
first time it was the item's own file before it had run anything.

**Its headline is P9's own question one layer further out, in the entries written to close it, and its
own green run could not see it.** [Q151](doc/open-questions.md): the `SELF` mutants were written into
the scratch directory a child deletes on its first line, so no `META` grandchild could re-import them.
**All twelve entries passed — `12/12 bounded`, exit 0** — while every grading inside every child read
*"the mutant did not run: this is a crash, not a detection"*. **The whole pass was measuring the
deletion.** A grading of the shape *the child failed* cannot tell a fired floor from a broken harness,
which is [Q138](doc/open-questions.md) restated one level out. Found by rule 8's set, not by the file.
Closed by a **control run** — an unmutated copy, run as a `SELF` child, must RUN and must NOT be graded
— routed through the same expression the entries use, so the control is that expression's negative
case; reintroducing the defect is refused by name. **Live in `check-source-selftest.mjs` and
`check-markdown-selftest.mjs`.** *(It also falsified the item's own cost figure — the first "after"
reading was **8.5 s** against the broken harness, and **a performance number taken from a crashed child
is a claim about the crash**.)*

**What a `SELF` list BUYS is now measured as a pair in one file, which is what P9's retro needs from
this item.** **Thirteen** mutations cost **0 before and non-zero after**: `MIN_META` lowered alone and
compounded; `MIN_PROBES` lowered alone and its disjunct; a duplicate `META` entry; an ambiguous anchor;
a global anchor disabling all six `P3` sites while naming one; a second `wide` exemption; a grading
passing as `corpus`; the inertness run that produces it; the `ran:` guard both halves; the PROBE-PASS
verdict; set equality downgraded to cardinality in the main pass; `ALL_CHECKS` widened; and
**`MAX_WIDE -> 99`, which W30 recorded as SURVIVING in `check-source`**. *(This paragraph said **nine**
and enumerated **eight**, mixing a count of mutation rows with a count of entries — W31's conformity
reader. The list above is the mutations, which is what the sentence is about.)* **And what it buys nothing against is anything that RETURNS BEFORE IT**:
`if (!meta) -> if (true)`, `if (nestedSelf) -> if (true)` and the outermost verdict all survive, because
the mutation reaches the parent as well as the child. *The regress does not move one list further out;
it stops at the first thing that can return early.* **The item's own header argued the opposite before
it measured and corrected itself in place** — the second time in this item that a claim about what a
mechanism cannot reach was written from the mechanism instead of from the entries.

**And two of W28's three verdicts CANNOT be made load-bearing, in any file** —
[Q152](doc/open-questions.md). The ABORT and STILL-CAUGHT arms assign a message and never touch `ok`,
so each costs 0 with the `SELF` list in place exactly as without one; the item was declared to take all
three to non-zero and two of them cannot go there. **Only the `ran:` guard changes a verdict, and this
file is the only place its case exists** — W28 had to DELETE that mutation as a `META` entry because it
crashes under its own probe ([Q144](doc/open-questions.md)), and as a `SELF` entry it is exactly right,
at `6/7` exit 1 with the guard live and `7/7` exit 0 with either half disabled. **The second
demonstration anywhere that `ran:` fires.** *The mutation that could not be a `META` entry is the one
that makes a `SELF` entry for the crash guard possible.*

**Rule 8: 40 provocations, 20 refused, 20 survive, run FIVE times** — an author pass and four re-runs,
each after acting on the previous one's findings, and each re-run moved provocations. Three ride-alongs
taken with a live case measured first; the ambiguous-anchor guard taken **with no live case, stated**,
its entry constructed from `fail('P1',` — the one anchor in the check that occurs twice without being
global. **Two DECLINED on measurements**: a per-id coverage bound fires on nothing here and a per-site
one would need five new `META` entries, one impossible inside this item's `Owns`; and the failure-COUNT
discriminator would ship as decoration, because **no entry here grades `caught`**.
[Q153](doc/open-questions.md) is the third question: a `SELF` list is bounded by count and not by
content — `13/13` exit 0 with a duplicate entry — closed here and live in the two other files with one.
**[Q149](doc/open-questions.md) is confirmed for the sixth check**, and `S11`/`S12` do not fire for this
item, which adds no `package.json` entry, exactly as W30 predicted.

**The census is CONFIRMED for the THIRD plan running — 112 questions, 76 open, 2 deferred, 34
resolved** — both halves at 112 of 112 in exactly one cluster cell, so W30's cluster repair held. The
parser aborted on Q119 and Q71, carried as declared exemptions, and **twice on Q87 in two opposite
directions**: 2 cells reading its first line, 3 reading its last, for a row that renders as 4. The
width check belongs only on a first line that both opens and closes with a pipe, which is what this
file's own stated predicate has said all along. **A parser can be wrong about a row in two opposite
directions on the way to being right about it**, and neither wrong reading is visible in the rendered
table.

**[P10](doc/plans/p10-is-fan-out-one-feature-or-two.md) is DECLARED — *is fan-out one feature or
two?* — and it is the first PRODUCT plan since P7.** [Q12](doc/open-questions.md) has been open since
P1 and is **the only open question that might mean the library is missing a FEATURE rather than a
guarantee**. Four items, serial: [W32](doc/work-items/w32-what-a-map-fanout-is.md) (what a map-fanout
is, and what its `branchPath` is — **ADR 0036**),
[W33](doc/work-items/w33-a-map-at-run-time-arity.md) (the driver and the three policies at run-time
arity, and N=0), [W34](doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) (what a
branch receives and what a join carries — **ADR 0037**) and
[W35](doc/work-items/w35-a-map-on-real-workers.md) (a map on real workers). **Reserves W32-W35,
Q154-Q163, ADR 0036-0037**, and unlike P9 it expects to take **both** ADRs.

**Its declaration measured seven facts and four changed what got written. Two made it much smaller
than [Q12](doc/open-questions.md)'s row reads, and the split is between a GRAMMAR and a DERIVATION.**
The id **grammar** already admits run-time arity — 500 ids for one node at 500 indices are 500
distinct strings, and `3.11`, `137.0` and `0.9999` all round-trip — so **`spec/task-id.md` needs no
format change**, and none of the *"every fixture, every log line and every test name"* cost P1 spent
an argument reserving against. And **two of the three shipped policies never read `region.branches`**
— measured with a `Proxy` rather than read — and answer identically at N=3, N=7 and N=1, which is
[ADR 0030](doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)'s
*"it needed no mechanism"* a second time. **So P10 is a definition-and-driver plan, not a join plan.**

**What it must decide is what the DERIVATION pins.** `branchPathOf(regions, nodeId)` takes the region
sets and a node id and **no run-time input at all**, so three dispatches of one node mint **one id of
three** and the second is a `DuplicateTaskId`. That is `FD-V19`'s own stated reason for existing, and
it falsifies `spec/task-id.md` section 1's *"`branchPath` is a property of the node"* — the sentence
[W21](doc/work-items/w21-the-branch-path-is-a-path.md) made true about the code one plan ago.
**A map-fanout is refused today three different ways depending on arity**: `FD-V9`'s repeated-entry
clause at N≥2, `FD-V9`'s arity floor at N=1, and `FD-V11`'s reachability at N=0, where the join and
the `end` become unreachable from entry.

**Three of its findings are live today rather than hypothetical, and the first is the sharpest.**
`arrival-count` at a run-time arity does **not** hang: with `need` fixed from a branch list the run
does not use, it reports `satisfied` on the **first** arrival **with two branches still live** — a
join fired over a region that has not finished, which is a failure direction W4's matrix never saw,
because every failure it recorded was `need` being too **large**. **N=0 is `waiting` in all three
policies** — `live-token` hangs on ADR 0003's own *"having been positive"* clause — and `FD-V9`'s
arity floor means the static feature can **never** reach it. And **a fan-out hands ONE payload object
to every branch**: `a.payload === b.payload` is **`true`**, so a branch mutating what it was given
mutates its siblings' input. The payload **is** cloned once at the edge hop, so the log is protected
and the siblings are not, and `spec/` states no contract on it: **measured across all seven documents
there**, `payload` occurs **six times on five lines in three of them** — the outcome record's own
field, `settleJoin` taking no payload parameter, and `start(payload)`'s signature — and **not one says
what a node receives or whether two branches may share it**. [Q154](doc/open-questions.md), **measured
at ladder L2 in ONE flow with `createTask: (c) => c`; the thread-pool half is NOT measured**, which
is the scope stated rather than generalised (`doc/workflow.md` section 1 rule 5's writing clause).

**And the join's successor receives `null`, which is why [Q11](doc/open-questions.md) and
[Q12](doc/open-questions.md) are one plan.** Not because both touch a payload — **because a map that
runs N tasks and hands its successor `null` has computed N results and thrown all of them away.**
[Q36](doc/open-questions.md)'s owner cell read `W2`, an item from P1 done since. **P10 decides it
AFTER the map runs**, deliberately: a join-payload rule written before a map exists has one case and
would be generalised to the case that matters, which is P9's *"a claim written from a mechanism
instead of from the cases"*.

**[Q9](doc/open-questions.md) is declared OUT with a measurement rather than on scope, and stays
open.** Freezing the argument is already effectively done — the driver hands the predicate a clone —
and catches mutation and nothing else; **evaluating twice caught 1 of 4** impurity shapes and is
*flaky* on `Math.random()`, which is the one property `doc/concept.md` section 5 refuses; and **ladder
L3, the rung the register cites for it, structurally cannot reach a predicate** — a `FoldInput`
carries an outcome record and a region event, so routing is already decided and `selectEdge` is never
called from the fold. That last is a finding about the **ladder**, not about Q9:
[Q155](doc/open-questions.md).

**[Q142](doc/open-questions.md) was measured BEFORE the documents landed, and that is a first.** Its
two-sided window caught P9's declaration and W30; P10's declaration adds **five documents that survive
both `removes` cuts** — four work items plus the plan file — so the one-directory fixture was
predicted to go **51 → 56** against `M3`'s floor of `< 56`, stopping probe 1 firing. **It did,
exactly.** Retuned from a three-count pass to **64** and **1720** (`M5` untouched at 60 for the third
plan running), and the two `META` entries pinned to the old literals were repointed — **rule 7 (b)
firing correctly rather than passing**, which is *"a mutation pinned to a magic number is unmutatable
the moment the number is right to change."*

**Two claims P10 was handed were FALSE and checking them is what found it.** *"The Verification and
fixtures cluster has never resolved one"* is wrong by the register's own predicate — it has resolved
**two**, [Q126](doc/open-questions.md) by W24 and [Q141](doc/open-questions.md) by W29 — and two of
thirty-eight is still the worst ratio of any cluster, so the point survived and the number did not.
And a running count of *"plans that measured a load-bearing fact before declaring"* was quoted as
**sixteen** where `doc/workflow.md` section 4 says **nine** and P9's own declaration says
**thirteen**, on a wider predicate. **P10 adds no number to that**, because the predicate is stated
nowhere in one expression. *(Found in passing and deliberately NOT fixed, because it is not P10's:
this document says **"Q121 is RESOLVED"** in its W25 paragraph while that row's own status cell reads
`open`.)*

**The census is CONFIRMED for the FOURTH plan running — 114 questions, 78 open, 2 deferred, 34
resolved**, both halves at 114 of 114 in exactly one cluster cell. **The parser aborted twice on its
own conventions and was then WRONG ONCE WITHOUT ABORTING, which is the one to carry.** Counting the
empty leading and trailing cell puts *"the second-to-last cell"* on the **Owner** column — it returned
`W4` as Q4's status and said so — and the **Resolved table is THREE columns with no status cell**.
Then the cluster half: the cells write `Q8-Q12` and `Q36-Q39`, so a bare `/Q\d+/` reads the endpoints
and **silently loses everything between them**, reporting **ten** ids in no cluster cell where the
true answer was **two**. **A missing id is still a classifiable answer, so nothing fired.**

**P7's exit artifact exists.** A nested fan-out runs end to end on a real scheduler, in **both L6
runtimes**, with the outer join firing over branches it never opened. Ladder L6 is **489 assertions,
23 row labels, 25 real runs** (from 373 / 19 / 21), and it dispatches the **first dotted task ids any
rung above L2 has asserted** — `r18:scoreC:1.0:0` and its siblings, the shape `spec/task-id.md`
reserved in P1. L0-L5 are **474 in five runtimes**, unmoved by W23, which is the declared result.

**[W23](doc/work-items/w23-a-nested-flow-on-real-workers.md)'s harness had the same defect the driver
had.** `examples/l6.ts` hard-coded the literal `'split'` as *the* region in **18 places** — W22's
`Cell` finding one rung up — and its inbound `resolve()` step minted ids with `Number(branchPath)`,
which is **1** for `'1.0'`, not `NaN`: a well-formed id for a **different task**, reported as a
refusal naming the wrong cause ([Q117](doc/open-questions.md), whose own row described the failure
incorrectly twice). Both fixed. **[Q107](doc/open-questions.md) is closed for one boolean** —
`ForeignTask.optional` — and **[Q90](doc/open-questions.md) is declined with a measurement that
corrects P7's stated cost**: `ID-R4` tier 2 does not drop silently, so a foreign task carrying a
run's own id **stops that run** and cannot join a row whose claim is both runs completing.

**LOOP BOUNDS is a fourth obligation for rule 8, and it now has two occurrences in two items.** An
author's probes break VALUES — what a thing is; a reader's break BOUNDS — how many things are
iterated. W22's reader found a matrix row and a whole column deletable **for 0 failures**; W23's found
**four L6 rows and the entire foreign-task list** deletable for 0, the second taking **P6's** exit
artifact with it. **W23 ran five bounds probes deliberately and all five were caught, and its reader
still found two more** — the author bounded the lists a *row* iterates, not the lists the *file*
iterates. Both occurrences are BLOCKING and no value probe reaches either. **For P7's retro.**

**[Q6](doc/open-questions.md) — P7's own question, open since P1 — is ANSWERED by
[ADR 0030](doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md):
a join IS transitive over nested fan-out, for every policy, and it needed no mechanism.** Measured
over four depth-2 rows × the four matrix columns — **each region answers exactly as the depth-1 row
of the same shape does**, sixteen cells. `N` is per-region, so an inner branch never needed counting
by the outer join. **`spec/join-policy.md` is v0.10 and 474 assertions run in five runtimes.**

**P7's own decision was falsified by W22's declaration step, and that is a first.** The plan settled
that `arrival-count` would **REFUSE** nesting at construction, on the ground that *"`N` is fixed at
the outer branch list and an inner branch has no way to be counted"*. That is **not a mechanism** —
`arrival-count` reports `satisfied` at both depths on an all-arriving nested flow — so the refusal,
the driver construction check, the new error class and the matrix's first declared-empty cells were
**all struck**, and the plan's stated size problem dissolved with them. Nine plans have measured a
load-bearing fact before declaring; this is the first time it took out a **decision** rather than a
table. *(The plan carries the correction in place; W22's own file is what an item reasons from.)*

**What ADR 0030 actually decides is the one thing that is NOT a depth-1 behaviour one level down.**
An `unsatisfiable` join's exit emitted **nothing at all** — unobservable at depth 1, because a
top-level fanout is in no region, and at depth 2 it left an outer branch with **no terminal event**
in a run that was neither suspended nor in flight, which `JP-R5`'s own enumeration does not admit.
**`JP-R10` ends that branch and the enclosing policy decides for itself**; at depth 3 the cascade is
**emergent from one emission** — `inner` dead → `mid` dead → `outer` **satisfied**, three verdicts,
none of them the driver's. A walk outward would have put satisfaction in the driver, which ADR 0001
rule 1 forbids.

**W22's two blocking findings point in different directions and the second is the method one.** Its
conformity reader found **`spec/join-policy.md` section 2 contradicting the rule the item had just
added**: `branch.lost`'s stated condition is *"a node … reached a terminal state — by settling, or by
being resolved — and no edge was eligible"*, and a dead join satisfies **neither** — the ADR had
quoted only the trailing consequence clause and read it as a definition. Section 2 now has an (a) and
a (b). Its adequacy reader found **two LOOP BOUNDS**: a whole depth-2 row deletable for **0
failures**, and a whole column droppable from the depth-2 loop for **0 failures with the assertion
count unmoved**, while the render kept advertising four columns. **An author's probes break VALUES; a
reader's broke BOUNDS**, and 28 of the author's could reach neither — that is neither v0.7's two
obligations nor v0.8's third, and **for P7's retro**.

[ADR 0001, 0002 and 0007](doc/decisions/) settle the architecture so far: **routing executes in the
driver, outside the scheduler** — a worker computes and does not route, and `context.spawnTask()` is
not used for flow control; **a flow definition is data with predicates registered by name**, where
an unknown name fails at instantiation rather than at routing time; and **the driver normalizes
every scheduler event into an immutable outcome record at the listener boundary**, because event
details are live mutable objects and `task.failed` also fires for `user_action` tasks. Pinned to
`fyflow-scheduler` **0.5.2** since [W37](doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md), installed **from npm**, with Deno reaching `@fyflow/scheduler@0.5.2` on **JSR** — [ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md).

**[P1](doc/plans/p1-what-satisfies-a-join.md)'s five work items are all built.** `spec/` holds **six
normative documents and 73 numbered rules**; `src/` holds the definition validator, the driver and
the fold with **three** join policies (two P1's, one ADR 0025's); `test/matrix/` holds the
join/failure matrix; `examples/` holds ladder **L6**. **410 assertions in five runtimes** — Node 24,
Deno, chromium, firefox, webkit — identical in all of them, **plus 373 at L6 in Node and Deno**. *(**426 since W21, measured in all five** — `npm run gate` runs three, so `npm run test:browser:all` was run for firefox and webkit rather than the word *five* inherited. Two items running have had a reader catch that parenthetical inheriting it. **Nested fan-out is a valid definition and mints the dotted `branchPath` the grammar reserved in P1** — `spec/flow-definition.md` and `spec/task-id.md` are both v0.7.)*
*(**The two numbers count different things.** The runner counts `test()` **cases**, not `equal`/`ok` calls — [Q98](doc/open-questions.md); L6's 373 is a real count of individual assertions. Do not add them.)* **`npm run gate` runs `test:browser`, which is CHROMIUM ONLY** (`scripts/run-browser-tests.mjs:68`); firefox and webkit need `test:browser:all`, which W19 ran to measure the five above rather than inherit them. **`doc/workflow.md` is v0.7**, run to
completion by six plans.

**[P2](doc/plans/p2-the-non-success-half-on-a-real-scheduler.md) is complete and added no features.**
Ladder L6 is **nineteen row labels, 373 assertions, 21 real runs**, in Node and Deno, and **all six run
outcomes and all six region events now occur there** — `awaiting_action`, `stopped`, `branch.suspended` and
`branch.resumed` for the first time. **Nothing in `src/` broke**, which is the weaker result P2
predicted when it measured `user_action` before the plan was written: **all nine of W6's findings
were in the gate that was supposed to be checking `src/`.**

**The one behavioural surprise was not in the non-success half at all.** The join had **never once
been fired from the `lost` or `exited` path** across twelve rows, because the arriving branch always
settled last — so `settleJoin` could be deleted from both other paths and nothing noticed. That is
P1's own case, and `spec/join-policy.md` section 4 exists for it. Fixed by **arranging** the causal
order with per-role delays rather than hoping for it.

**[P3](doc/plans/p3-a-consumer-reference-the-gate-keeps-true.md) is complete and retro'd, and its
retro is what made `doc/workflow.md` v0.5.** **[AGENTS.md](AGENTS.md) is the consumer reference** and `npm run gate`
extracts, typechecks and executes its snippets. Its two readers measured the thing to know about it:
**the gate covers about 16% of the reference**, and the other 84% is prose that can be inverted with
the gate green. The response was not to guard the prose but to **move the load-bearing claims into
assertions** — 7 `run` snippets became 11, and the six-outcome precedence table, the `user_action`
event pair and a double `resolve()` are now executed rather than asserted in a sentence.

**P3's retro says that is an acceptable steady state and names what is not.** The criterion, so it is
not re-derived: *a claim a consumer writes code from belongs in an assertion; a claim they read for
orientation does not.* What is **not** acceptable is what P3 also produced — **the prose absorbed
three `src/` defects rather than the code being fixed** (`AGENTS.md` §12 documents a cast for Q71;
§§2, 9 and 10 document Q72 as a hazard). **Rot is what the gate prevents; absorption is what it
cannot see**, because an accurate description of a defect passes every check there is. Its one
adopted change is rule 7 (c): a probe now declares the **set** of checks it must trip, because naming
one does not discriminate — a merely malformed probe trips two at once.

**[P4](doc/plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) is the active plan and it
deletes two of those three apologies by fixing the code.** One subject — *what is a `Driver`'s
lifetime, and what makes an inbound event or an outbound handle **this run's*** — and three
reader-found defects: [Q53](doc/open-questions.md)'s many-run surface,
[Q72](doc/open-questions.md)'s two-drivers-one-scheduler cross-routing, and
[Q73](doc/open-questions.md)'s unfrozen region event. **W12-W14 declared**; W10 is held for
`check-owns.mjs` and W7, W8, W11 are skipped. **Its load-bearing fact was measured first and it
changed the design:** filtering `Driver.onEvent` by run id — the mechanism the register proposed —
closes **one of four** inbound holes, while `dispatched.has(taskId)` closes all four with state the
driver already keeps. Run-id-at-construction was spiked in the working tree: `src/` typechecks clean
and **all thirteen L6 rows pass**. What happens next, in order: [doc/README.md](doc/README.md).

**[P5](doc/plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) is COMPLETE and retro'd,
and it answered [Q24](doc/open-questions.md) — third and fourth policy, or repairs of the first two?**
**W15, W16 and W17 are all done**, six reader passes between them, and **`doc/workflow.md` is now
[v0.7](doc/workflow.md)**. The matrix renders at **four columns** and every one of its
nine rows runs against all four policies — 36 cells, where the refinements had previously been
executed on four. `JP-R7`'s and `JP-R8`'s effects are asserted as **exact sorted row lists** rather
than as counts, each three ways: the declared literal, a predicate over the row's own region-event
stream, and what the columns did. And the **`unsatisfiable` chain runs
end to end for the first time** — a policy's answer, through a real `Driver`, through `foldInputs()`, to
`RunState.outcome === 'stuck'` — where each of its four links previously had its own stub and nothing
ran them as one. W15 takes **no decision and writes no spec**, deliberately: ADR 0025 is W16's, and
building the evidence first is what stops it being written from the argument in P5's prose.

**Its sharpest finding is one the counts hid.** `JP-R7`'s variant, on the all-branches-exited row,
reaches `need: 0` with nothing arrived — so it **fires a join zero branches reached**, which is
precisely the cost ADR 0003 records for `live-token` and precisely what `JP-R8` removes. **The two
refinements point in opposite directions** ([Q91](doc/open-questions.md)). And its **one surviving
provocation of twenty-two**: the `at most once` latch on the driver's `unsatisfiable` path can be
deleted with all 361 assertions still green, because no policy here settles a join before every
branch is terminal ([Q95](doc/open-questions.md) — **W18 closes it with a stub**).

**Its readers found what its own provocations structurally could not, and the lesson generalises.**
Twenty-two probes, written to the rules' clauses as `doc/workflow.md` v0.6 asks, all mutated something
the suite reads — so **both** of the things W15 *created* went unmeasured: the four-column render was
produced by a script `npm run gate` never executes (**seven** surviving mutations, one of which
printed a two-column table with the whole gate green), and the two variant policies were promoted to
columns and to ADR 0025's evidence **without inheriting one of the clause-level tests the shipped pair
has** (four survivors, each with a named test for `arrival-count` or `live-token`). Both are closed:
the render is now a function the suite asserts field by field, and the variants are held to `JP-R1`,
`JP-R2` and `JP-R3` in `test/matrix/variants.test.ts`. **For P5's retro: writing provocations to the
rule finds holes in the CODE and is blind to the DELIVERABLE.**

**[W17](doc/work-items/w17-the-all-exit-row-at-l6.md) puts the `all-exit` row on real workers and
completes P5's exit artifact.** At the time it landed, ladder L6 was **19 real runs and 342 assertions**, and one run's join
is now **reported dead** — `joined: false`, `onUnsatisfiableJoin` carrying the policy's own
`describe`, and the fold reaching `stuck` — which nothing at L6 had ever reached. One flow, one
payload, three policies, three answers: `completed`, silently `stuck`, and `stuck` with a reason.

**Its two findings are both about the harness, and the second is the sharper one.** First, the three
declared rows **could not test the policy they were built for** — they run
`live-token-requiring-arrival` on one scenario where `arrived` is always zero, so deleting the
arrival count from the policy left all **316** assertions green — the count at the moment the three rows
were the whole of it; a fourth row on P1's own case closes it.
Second, **W6's causal arrangement was a load-bearing test input held down by nothing**: reversing one
`Set` literal in `examples/run-flow.ts` restores W6's original defect exactly — `settleJoin` deletable
from the `lost` path with the gate green — and drops `exit-last` from four failures to none on the
`exited` path. That is rule 8's own case one item before rule 8 existed. `Expectation.joinSettledBy`
closes it; the other three harness knobs are [Q99](doc/open-questions.md).

**Its two readers found two BLOCKING survivors, both in the harness and both the same shape.** The
termination race could be replaced by a **1200 ms sleep** — longer than the run, where W5's recorded
probe is 1 ms and truncates it — with all 341 assertions green, because `finishedBy` was read from a
flag rather than from the race's own result; and `lateInputs`' single recording could be deleted,
making `RN-R12`'s *"nothing arrived after"* a tautology on nineteen rows. **Both are this file's own
`timedOut` lesson in fields that had not inherited it**, both are fixed by deriving the value from one
source, and both fixes are provoked — the reader's exact probe now costs 22 failures and a genuinely
late input costs 18. **Overlap between the two readers: 3 of ~31**, the eighth measurement and inside
the band.

**And W17 answers P4's retro prediction 1 in the direction the first two items did not see.** W15 and
W16 both found rule-written provocations blind to what the item *created*; W17 found the thing it
created blind to a **clause of the rule**, which only the clause-by-clause walk saw. Three items, both
halves. Its other Q is [Q100](doc/open-questions.md) — **L6's rendered table is a deliverable no
assertion reads**, which is W15's renderer finding in a second file and therefore a second occurrence.

**[P6](doc/plans/p6-what-may-share-a-scheduler-with-a-driver.md) is COMPLETE and retro'd — [W18](doc/work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md), [W19](doc/work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md), and `doc/workflow.md` v0.8** —
*what may share a scheduler with a driver?* It takes the three things P5 ruled on and could not own,
because **no P5 item takes `src/driver/**`**: [Q86](doc/open-questions.md) as **ADR 0027**,
[Q87](doc/open-questions.md)'s message sentence, and [Q95](doc/open-questions.md)'s latch. **Two of
those three register rows were wrong and were corrected by trying to act on them**, which is the
fifth plan running to find one that way. `InvalidTaskId` has **three** producers — `buildTaskId`
outbound, and `parseTaskId` at `resolve()` and at the listener — and **Q86 is about the listener
alone**, which the register read as one site. And Q95 is **not dead code**: its precondition is any
policy that settles a join *before every branch is terminal*, and with the latch deleted such a
policy routes the join twice and the run dies on `DuplicateTaskId`. **Its urgency is that `AGENTS.md`
§9 already recommends the shared-scheduler topology** while one foreign task on that scheduler stopped
every driver subscribed to it.

**W18 answered Q86 with [ADR 0027](doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md),
and it took the third option — *ignore it, but report it*.** A settlement whose task id does not parse
was minted by **no** driver (`buildTaskId` emits only four-segment ids in the `ID-R2`/`FD-V16`
charsets), so it is **`ID-R5`**: decided at **tier 0**, ahead of `ID-R4`'s two tiers because both
compare a run id and an unparseable id has none; reported through the new **`onUnmintedTask`**; and
dropped, with the run still routing. **ADR 0023 rule 2 is superseded and the first of `ID-R4`'s two
preconditions is retired.**

**What decided it is not the argument the plan and the register made, and that is the part to carry.**
Both argued about the *shape* of the objection — *every clause of the against-case is about silence
rather than about stopping*. What carried it was asking **who produces an unparseable id**: a foreign
task and a worker's own `context.spawnTask()` child can **never** be ours and are the common case on
the blessed topology; a `detail.id` that stopped being what we dispatched **could** be ours and is
rare — and that is measured history, since `task.progress`'s detail changed shape at 0.3.0 with no
changelog. Stopping is right for the rare case and catastrophic for the common one, and the string
cannot discriminate — so *stop* is wrong in one direction, *ignore* in the other, and **only *report*
is wrong in neither.** **Tier 1's silence is untouched**: another run's settlement is reported by the
driver that owns it, an unparseable one by nobody, and that asymmetry is ADR 0027 rule 4.

**[W19](doc/work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md) is DONE and P6's exit
artifact exists on real workers.** Ladder L6 is **19 row labels, 21 real runs, 373 assertions** in
Node and Deno, from 18 / 19 / 342. Row 19 is one `FyflowScheduler` carrying **five ids this library
did not mint** — one per refusal `parseTaskId` makes, from `nightly-cleanup` to `pc:ingest:x:0` —
all settling **before either run settles anything**, with two `Driver`s subscribed and **both runs
`completed`**, each having dispatched all four of its own task ids and reported all five settlements
through `onUnmintedTask` under **its own** run id. It owns `examples/**` and reached into no other
directory. **Restoring ADR 0023 rule 2 costs 13 L6 failures** and leaves each run having dispatched
1 of its 4 tasks, which is the number to quote: the scheduler never breaks; the drivers go deaf while
everything around them proceeds.

**W19 is where `doc/workflow.md` v0.7 change 3 finally fired, on the first item that could hit it.**
P5's retro added `doc/decisions/**` to the record step *"so a demonstration could correct the decision
it demonstrates"*, after that gap blocked W17 from correcting ADR 0015; W19's own declaration named
itself the likely next occurrence. **ADR 0027's producer table listed three producers of an
unparseable id and could not name the one W19 built** — its third row is *"a `detail` with **no**
`id`, or an `id` that is not a string"*, while `pc:ingest:x:0` is a four-segment string in our own
shape, which is the class the decision's argument actually turns on. **Producer row 4 added, no rule
changed, no exception declared or needed.**

**And its sharpest method finding is a category rule 8 does not have.** Its rule-written probes found
the one code-level survivor (L6 injected a **colon-free** id only, so tier 0 could be narrowed by the
shape of the id with all 370 green — W17's `all-exit` finding in a second file); its
`Outputs`-written probes found that *"counts derived rather than typed"* is **unachievable** in a
markdown file ([Q100](doc/open-questions.md), two more occurrences). **Neither half found either of
the adequacy reader's two BLOCKING survivors, and both of those were the same thing — the PROVENANCE
of a harness value**: a latched flag standing in for *"both drivers were attached"*, whose guard was
deletable with everything green, and an assertion whose **source** could be swapped from the
scheduler to a driver, which the item's own `Outputs` row forbids in prose and nothing enforced. That
is neither a clause of the rule nor a row of the table, and it is the third time in `examples/**`
after `finishedBy` and `lateInputs`. **For P6's retro.** Overlap **4 of 18**, the ninth measurement
and inside the band. Its questions: [Q107](doc/open-questions.md) — `ID-R5` at L6 sees
`task.completed` and nothing else, found by both readers independently — and
[Q108](doc/open-questions.md), ADR 0027's `context.spawnTask()` producer, demonstrated nowhere at all.

**Its three side-findings are each a document that was wrong and a check that could not see it.**
**[Q95](doc/open-questions.md) is closed with a stub, and the register was corrected a third time**:
`settleJoin` has **two** latches, the register's `DuplicateTaskId` belongs to the *satisfied* one
(already covered, deleting it costs an assertion), and W15's actual survivor is the *unsatisfiable*
one — deleting it costs **0 of 386** and produces either a doubled report or, worse, **a join routed
out of after being declared dead**, taking `RunState.outcome` from `stuck` to `completed` in silence.
**[Q101](doc/open-questions.md)**: `AGENTS.md`'s executed error-class snippet was a **closed list
compared against a copy of itself** — eight classes mapped to `.name` and matched against a literal in
the same snippet — so it omitted `InvalidTaskId`, exported from the package root the whole time, with
the gate green. It now enumerates the package's own `Error` subclasses. *A list the gate executes is
not a list the gate checks*, which is the third form of **rot is what the gate prevents, absorption is
what it cannot see**. And **[Q102](doc/open-questions.md)**: `check-docs.mjs`'s `RUN_FLOOR` ratchet
obliges the item that adds a snippet to raise it, sits in **nobody's `Owns`**, and went stale
silently — the probe written to catch a deleted snippet passed at 14 - 1 = 13. **W18 took two late
exceptions, not one**: that file, and `spec/join-policy.md`, whose section 4 stated **neither** of the
two things Q95's stub asserts about the `unsatisfiable` exit. The second is `doc/workflow.md` v0.7
change 3's own argument in a directory it does not cover, and its reason generalises: **which spec
clause a stub makes load-bearing is not knowable until the stub exists.**

**At least NINETY-THREE reader-passes have run and not one came back empty — and this line said THIRTY-ONE for four plans, FIFTY-ONE for two more, SIXTY-NINE while P13's six and P14's six ran behind it, and EIGHTY-SEVEN while P18's six ran behind it.** *(P10's retro tried to re-derive it and stopped: the predicate below is sound, and the item files do not share a row format, so a grep that counts the passes W15, W16, W17, W24 and W25 recorded misses the three W3 ran, and one that catches those double-counts the items whose Verification table and Record both carry a reader row. **63 is a floor with a stated predicate** - rows in an item's own Record asserting the pass RAN - not the answer. P10 added eight, P11 four, P12 six, P13 six, P14 six, P15 six, P16 six, P17 six and P18 six, each read from that plan's own retro. The exact total needs each Record read individually, which is what this line has always been a substitute for.)* *(The predicate: one per reader
per work item, counted from each item's own Record — `doc/workflow.md` section 1 rule 5, never from
this line.)* W1 ×3, W3 ×3, W2 ×1, W4 ×2, W5 ×2, W6 ×2, W9 ×2, W12 ×2, W13 ×2, W14 ×2, **W15 ×2,
W16 ×2, W17 ×2, W18 ×2, W19 ×2**. *(Sum the list; it is 31, and the list is the predicate.)* *(This line read **twenty-one** and listed only the first ten items until
W18 re-derived it: it went stale the day P5 finished and stayed wrong for three items — the same
count-in-prose failure `doc/` keeps producing, in the paragraph that tells you to budget for the
pass.)* Most found the same shape: *the code was correct and the tests were pointed at the wrong
half.* **Budget for the pass; it is not a formality here, and section 6 asks for two readers.**
**That question is now settled and should not be re-litigated:** **ten** overlap measurements — 1, 2,
3, 3, 3, 3, 3, 4, 4, 4 shared findings. **The absolute count is what to carry**; the fraction has read 8%
to 17% across items from a one-line fix to the largest surface change here, and reading it invites
over-reading.

**W5 ran P1's case on a real scheduler and it behaves exactly as the matrix said.** `p1-routed-away`
completes under `live-token` and is **`stuck`** under `arrival-count`, with the join's successor
never dispatched. Three ADRs came out of it, and **each came from a different kind of gap**:

| | |
|---|---|
| [**0013**](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) | `fyflow-scheduler` is a **development** dependency and the published library depends on it **not at all** — `SchedulerLike` is structural and a caller passes its own scheduler in. **`S7` in `scripts/check-source.mjs` refuses any published file that imports it.** **Superseded in part 2026-08-31 by [ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)** — rule 1 stands, rules 3 and 5 do not. Node reaches **0.5.2** through **npm** → `dist/`; Deno through `examples/deno-import-map.json` → **`jsr:@fyflow/scheduler@0.5.2`** → the source; the browser not at all |
| [**0014**](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) | **The driver produces the fold's ordered input sequence** — `Driver.foldInputs()`, and `onFoldInput` for the push half. `snapshot()` is now *defined* as its record-kind subsequence. Before this, `FoldInput.pathEnded` had **no producer anywhere** |
| [**0015**](doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) | **A run whose join can no longer fire is `stuck`** — the sixth run outcome. Run state used to call such a run `completed` |

**Three things this repository believed turned out to be wrong, and each was one command away.** npm and
JSR **both carry the scheduler** — at 0.2.1 when W5 measured it, and **at 0.3.0 since 2026-08-31**,
which is what made [ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
possible; `@fyflow/scheduler` on JSR was an assumption nobody had checked. `../fyflow-scheduler/dist/`
**existed and was stale** — a pre-0.3.0 build behind a `package.json` reading `0.3.0`, which is a
directory layout that invites the assumption and asserts nothing. **That hazard is now gone with the
link**: a published tarball ships no source to be stale against, and `npm run check:scheduler` guards
the replacement hazard instead — Node's npm pin and Deno's JSR pin drifting apart.
And `AGENTS.md` §3's *"a worker must be JavaScript"* is **false at Node 24**, which is why ladder L6
runs in Deno as well as Node ([Q33](doc/open-questions.md), `RT-R10`) — the leaning that said *Node
only* rested on that claim. Both scheduler findings are [S9](doc/scheduler-upstream.md), **the only
live item in an upstream register that had nothing left to raise.**

**And one of our own register entries was wrong, which is the newest failure mode here.**
[Q43](doc/open-questions.md) said *"`regions` already records `{0: arrived, 1: exited}`, so the
information is present"*. It does not: **both policies produce that identical value**, which is
exactly what `RN-R6` guarantees. Found by trying to act on it. `doc/open-questions.md` is read before
every work item and **checked by nothing**.

**W5's two review passes — run as two readers, per W4's proposal — found ~35 things between them,
and every one is acted on.** Three are worth carrying:

1. **The L6 gate did not depend on the mechanism W5 exists to build.** Replacing its termination
   predicate with `setTimeout(1)` left every assertion passing, because `scheduler.shutdown()` drains
   the run while the fold keeps advancing. **This is W4's shape one level deeper:** the author's
   sweep found a hole, and the author's fix for it still could not fail.
2. **A `Driver` serving two runs merged them and reported `completed` for a hung run**, through its
   own declared surface. `ID-R3` refuses it; the surface still says otherwise, which is
   [Q53](doc/open-questions.md) — **now owned by P4's W13.**
3. **A mutation sweep run by its author measures what its author fears.** Mine: 19 mutations, 2
   survivors. The reader's, chosen by walking the rule ids rather than by intuition: **148 mutations
   and 38 survivors**, 10 of them blocking.

**Two readers, three overlaps, and each overlap arrived from a different direction.** W4 proposed
the split after 1 overlap in 13; this is the second occurrence in a different work item, which is
what `doc/workflow.md` section 6 rule 2 asks of a proposed rule. **For the retro.**

**Q4 is answered: [ADR 0003](doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
— a join is satisfied when its region has no live branches, having had at least one.** `live-token`
is the policy an application passes; `arrival-count` stays shipped, because the matrix is only
meaningful while both columns can be run.

**The result is bigger than the question, and this is the part to carry forward.** P1 predicted that
arrival-counting breaks on one exotic case — a decision routing a branch away from its join. W4's
matrix says it hangs on **six of nine rows**, and only one of them is that case: an ordinary
`optional` task failing is enough. Fixed-`N` is wrong whenever *"how many will arrive"* differs from
*"how many opened"*, and **every non-success outcome makes it differ.**

**[Q24](doc/open-questions.md) is answered by
[ADR 0025](doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md),
and the two rules got different answers.** `JP-R8`'s refinement is **adopted** — a third policy under
its own id, `live-token-requiring-arrival`, which is what `JP-R8` itself prescribes — so a flow can
now treat a join reached by nothing as a failure and the run folds to **`stuck`** rather than
`completed`, visible in `RunState.outcome` with no callback registered. `JP-R7`'s is **refused**: over
the nine matrix rows it is `live-token` weakened and never strengthened — every row on which they
differ, it reports `waiting` where `live-token` is `satisfied`, so its whole contribution is a silent
hang — and on the **third** row it repairs it fires a join **zero branches reached**
([Q91](doc/open-questions.md)). **`live-token` and `arrival-count` are byte-identical and `liveToken`
is still what an application passes** (ADR 0003 rule 1; whether that should change is
[Q96](doc/open-questions.md)). The refused variant stays a matrix column, because a refusal nothing
executes is a refusal nobody can falsify. **Not one of the 36 matrix cells changed.**

**W16 also fired `doc/workflow.md` rule 7 (c) for the first time in three plans.**
`scripts/check-policies.mjs` holds the new **`JP-R9`** — *a policy `id` exists in
`spec/join-policy.md` section 3 or it does not exist* — with **thirteen** checked-in probes — ten when W16's Record was written — and **three of
them failed at birth**: two were holes in the check and one was a probe that edited a heading the
parser does not read.

**And its provocation sweep reproduced W15's finding exactly, which makes it two occurrences.** 28
mutations: **every probe written to a rule went red, and four of the five aimed at what the item
CREATED survived** — section 3's third-row wording can be rewritten to demand two arrivals, and a
whole column can be deleted from ADR 0025's pasted table, with the gate green. The ADR's table was
therefore verified against `runCell` **once, mechanically**, all 36 cells.

## The fact that reframes the whole repo

> **`fyflow-scheduler` has no dependency graph.** No `dependsOn`, no `parents`, no ordering. Its own
> `AGENTS.md` section 1 lists them under *"Things that do NOT exist"*, along with `DagScheduler`.

Two consequences, and both catch people:

1. **`../fyflow-scheduler/FLOW_PLANNING.md` is written against an API that does not exist.** It
   calls the library "the existing FyFlow DAG scheduler" and passes `parents: ['extract']` to a
   constructor with no such field. Its *goals* are still ours; its premise is not. Do not use it as
   a design input without reading `doc/concept.md` section 2 first.
2. **`SpawnTaskConfig.parents` is declared and dead.** `../fyflow-scheduler/core/workerInterface.ts:50`
   declares it; nothing reads it; the spawn path (`core/FyflowScheduler.ts:1468-1473`) drops it
   silently. It typechecks and does nothing. **Confirmed by the maintainer (2026-08-30): it stays
   dead and will eventually be removed — never pass it.** [S1](doc/scheduler-upstream.md) is closed;
   do not re-raise it.

**So sequence, decision, fan-out and join are built here, not wrapped from below.**

## The invariant everything hangs off

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

Now backed by [ADR 0001](doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
rules 1 and 4, [ADR 0002](doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 4, and **[ADR 0014](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md),
which is what finally made it executable**: the driver produces the ordered `FoldInput` sequence and
`fold(driver.foldInputs())` is the whole of turning a run into run state. Until W5 **nothing produced
that sequence**, so the invariant was true of hand-written fixtures and of nothing else. A decision
predicate that calls `addTask`, a fold that reads `scheduler.tasks`, or **a fold that subscribes to
the driver** has broken it — the last is the ergonomic next step ADR 0014 spends a paragraph
forbidding.
This is what makes routing testable with no scheduler (ladder L2), makes determinism a real check
rather than an aspiration, and keeps durable runs additive. `doc/concept.md` section 5.

Task completion **order** is genuinely non-deterministic. The fold must be deterministic *given an
ordered log*; the driver is what turns unordered reality into that ordered log. Never write a test
that depends on fan-out completion order.

## How work is done

**[doc/workflow.md](doc/workflow.md) — read it before starting any work item. It is v0.21, run to
completion by TWENTY plans.** *(This line read "v0.10, run to completion by NINE plans" while v0.11
and v0.12 landed above it.)*

**v0.21 is P20's retro and its ONE change is above.** The short form: **rule 8 obligation (d)'s CONTROLS clause gains that a control must fail where its claim is VACUOUS, not only where its subject is ABSENT** — so it is an expression over the OBSERVED side or over the RELATION, never over the declared one. Every control v0.18's clause has produced reads `length > 0` on the DECLARED side of an *OBSERVED equals DECLARED* claim, so one token makes the claim compare a list with itself and leaves the control exactly as true as before; measured at the retro on W58's two blocks as well as W78's three, all at ZERO. The answer is IDENTITY, and a control ENTAILED by its own claim is a fourth claim. Five refused, including a `doc/` check for the nineteenth time — on the first `doc/` claim in twenty plans a check could compare without reading English, defeated by the 109 deliberate historical quotations the corpus carries.

**v0.20 is P19's retro and its ONE change is below.** The short form: **rule 8 obligation (b) gains
that where an `Outputs` row IS an assertion, the set makes each of its claims a TAUTOLOGY rather than
deleting it** — because P19's exit artifact, an authoring session the gate EXECUTES, had all eight of
its guards neutralised at `check:docs` exit 0 with every check green, and `X4`'s *asserts something*
is a PRESENCE test over all 27 `run` snippets. Five refused, including a `doc/` check for the
eighteenth time — on the first instance that is machine-comparable in principle and that a check would
still have passed, because the claim was wrong from a harness RUN TWICE rather than from two outputs
never being compared.

**v0.19 is P18's retro and its ONE change is above.** The short form: **rule 8's requirement on the
HARNESS gains that it asserts the ENVIRONMENT its rungs need** — four of W67's probes came back CRASH
on a correct tree and correct edits, because the shell had no `fnm use 24` and `npm run test:l6`
resolved `node` to 16, and **a rung that cannot START is indistinguishable in the report from a rung a
probe took DOWN**. One occurrence, and the argument is the mechanism: every other requirement on the
harness is about a probe that RAN — the control sees what a probe ADDS, the restore what it LEFT, the
anchor what it MATCHED, the digest what MOVED — and **none of them can see a constant**. Six refused,
including a `doc/` check for the seventeenth time (and P18 is the first plan to satisfy that refusal's
own criterion, by BUILDING `X7` for the one count a check could derive) and a check over a plan's
SAMPLE, which four defects argue for and which cannot exist, because a sample cannot be executed and a
typecheck would not have caught the one that mattered.

**v0.18 is P17's retro and its two changes are above.** The short form: **obligation (d)'s
membership clause gains that a membership names the CONTROLS beside its claims** — W63's
`CROSS_ROW_SUBJECTS` named eight claims and not the two assertions that make them non-vacuous, so a
validator accepting everything was green with two counts lowered, and the retro found W58's block
had the same hole for a whole plan; and **obligation (a)'s enumeration clause gains that every
member is instantiated under the SAME claim**, because W63 carried `FD-C5`'s first kind only under
a failing transform, the third time in two plans that clause was followed and short.

**v0.17 is P16's retro and its three changes are above.** The short form: **rule 8's harness
requirement gains PER-EDIT integrity** — every edit's anchor checked against the CURRENT text, an
abort undoing what it applied, the tree held still by a content DIGEST — because a harness satisfying
every earlier requirement measured nothing on seven probes; **obligation (a)'s shapes clause gains
that where a rule ENUMERATES its values the set is that enumeration**, because two items followed
*more than one* deliberately and were one short of the rule's own list; and **v0.14's ceiling clause
gains its DATE** — a set-equal-literal ceiling is a catch the moment the value moves, and the item
that moves it re-runs it, because the retro found two of W58's ceilings already caught by W59's edits.

**v0.16 is P15's retro and its three changes are above.** The short form: **section 4's green clause
gains a PROCEDURE — a rung is RUN, never PIPED, so redirect it and read `$?`**, because four items
across three plans have read a line instead of an exit code and the fourth did it while quoting the
clause; **rule 8 obligation (a) gains the SHAPES a rule quantifies over**, because an author picks the
shape the feature was built for and one such choice hid three defects at once; and **obligation (c)'s
LIMIT gains what *independent* excludes** — the second observer must not be downstream of the first's
apparatus, and no mechanism in rule 8 can see that, because a control only sees what a probe adds.

**v0.15 is P14's retro and its three changes are above.** The short form: **section 4 gains that a
rung reported GREEN means its command EXITED 0** — a line of its output is never the predicate, which
is the opposite direction from rule 8's *read the failure lines*, and the document stated only one of
the two while three items shipped `GATE EXIT=1` with zero `FAIL` lines; **section 6 gains that a
whole-tree measurement is taken with the tree HELD STILL**, because rule 8's set mutates the shared
tree by construction and running it during a review contaminates the review; and **section 1 rule 5's
third direction gains a procedure — an item greps the tree for its OWN ID**, which is the one case
where the phrase to search for is exact.

**v0.14 is P13's retro and its three changes are above.** The short form: **rule 8's requirement on
the HARNESS gains that every declared survivor is RUN**, against the rung its own reason names,
because three items shipped a harness that executed nothing for a ceiling and the retro's measurement
of all eleven found one false and one stale; **obligation (d) gains that a COUNT is not a
MEMBERSHIP**, because a whole layer of assertions has walked out past `DECLARED_TOTAL` three times in
three plans; and **section 1 rule 5's writing clause gains a third direction — a WITHDRAWN claim is
searched for**, because W46's readers withdrew four claims and all four survived in the index row for
the document W46 had just changed.

**v0.13 is P12's retro and its three changes are above.** The short form: **obligation (e) gains a
THIRD shape — a LIST is a claim about another list**, and the procedure is to find the other list and
compare both ways; **obligation (c)'s procedure gains its LIMIT** — when the compound probe is green,
count the observers, because a sensor cannot corroborate itself; and **rule 8 gains a fourth
requirement on the SET** — whatever makes a discriminating pair differ is itself a claim, so assert
the difference.

**v0.12 is P11's retro and its three changes are above.** The short form: **rule 8 obligation (e)
gains a second question — not *was the check run*, but *was what it RAN what SHIPS***, on five
consecutive items and with a procedure for each of its two shapes; **section 1 rule 5's writing clause
gains a WHEN** — a measured number is re-taken on the tree the item ships, because an item is finished
when its readers are, not when its work is; and **section 6 pass 3 gains rule 6**, so a retro may
correct a false claim in the files of the items it reviews.

**v0.11 is P10's retro and it adopts one change**: rule 8 gains a requirement on the HARNESS — it
carries a control, and the restore is asserted. P11 is its first full plan and it is CONFIRMED,
having fired once before either item started and at least six times inside them.

**v0.10 is P9's retro and its three changes are above.** The short form: **rule 8 gains a fifth
obligation — break the WIRING**, because a check, a grading or a guard can be present, correct and
never reached while everything is green; **rule 8 gains a requirement on the SET** — a provocation is
evidence only when it FIRES, and only when it fires FOR THE REASON IT NAMES, which is reading the
failure lines rather than the exit code; and **section 1 rule 5 gains a clause about WRITING** — a
claim states the scope it was MEASURED at. **Rule 8 now carries its own index**, having grown to five
obligations and three requirements on the set, and it stays a RULE rather than becoming a section
because its address is cited in four plans, eleven work items and the register.

**v0.9 is P7's retro, and its central finding is that rule 8's obligations are about WHAT is
asserted, WHERE THE VALUE CAME FROM, and — new — HOW MANY THINGS ARE ITERATED.** Four changes:

1. **Rule 8 gains a FOURTH obligation: break the LOOP BOUNDS.** Two occurrences, two items, four
   instances, **every one BLOCKING and every one found by an adequacy reader** — and none reachable
   by a probe of the first three kinds. A matrix row deletable for **0**; a whole column droppable
   **with the assertion count unmoved**; four L6 rows deletable for one edited number, green at 388
   with everything passing; a whole foreign-task list emptiable, taking P6's exit artifact with it.
   **W23 ran five bounds probes deliberately and all five were caught, and its reader found two
   more** — the author bounded the lists a **row** iterates, not the lists the **file** iterates.
2. **Rule 8 states the PROCEDURE for a provenance probe**: *it changes the source expression and
   nothing else.* [Q112](doc/open-questions.md) corrected v0.8's third obligation **four times across
   three items**, three of them an author repeating a correction a reader had made to them one item
   earlier. The axis was right and could not be instantiated from what it said.
3. **Section 1 rule 5's provenance clause extends from *an index* to ANY copy, including your own.**
   W23 reported a wrong count read from a file **that item had written**, for an earlier version of
   its own work.
4. **Section 7 rule 2: an item's `Owns` is written from its PLAN's index row, never from its title.**
   Late exceptions across P7: **five, four, two, zero**, with the cause stated in between.
   **`check-owns.mjs` stays retired** — a sentence did what a script was proposed for.

**Rule 7 (c) is unexercised for the fifth plan, and P7 declined TWO checks for the same reason:
`scripts/**` and `package.json` are in nobody's `Owns`** ([Q121](doc/open-questions.md),
[Q126](doc/open-questions.md)). That is v0.7 change 3's shape — a gap that blocks a fix — twice in one
plan, and it is **the next plan's scope rather than a workflow rule**.

**v0.8 is P6's retro, and its central finding is that rule 8's two obligations are both about WHAT is
asserted and neither is about WHERE THE VALUE COMES FROM.** Two changes, both to rule 8, neither
replacing anything:

1. **Break the PROVENANCE of every value an assertion reads** — substitute a different source, delete
   the guard that makes a recorded value the one it claims to be, let a later write overwrite it,
   delete one of two writers. **Section 5 rule 4 made provocable**: *"fixtures must not come from the
   code under test"* has had no procedure since v0.3, and **five instances across W14, W17 and W19
   were all BLOCKING and all found by adequacy readers**. All five are in `examples/**`, where values
   are reported rather than asserted, and the rule says so rather than overclaiming.
2. **Re-run the whole set AFTER acting on the readers' findings, and check their exact edits back in
   as probes.** An author's set is written once, before the readers report; the fixes that follow are
   the least-tested code the item ships. W18 found it — both its blocking survivors were in guards it
   had written earlier in the same item — and W19 ran it and it fired.

**Rule 7 (c) is unexercised for the fourth plan**, twice now because no check was worth building
rather than because none was possible. **`check-owns.mjs` stays retired** — seven consecutive correct
audits. **The two-reader split is settled at ten overlap measurements and closed to re-litigation.**

**v0.7 is P5's retro, and it is the first whose central finding is that a
change was RIGHT AND INCOMPLETE rather than right or wrong.** Five changes:

1. **Rule 8's set has TWO obligations — the rule's clauses AND the `Outputs` table's rows.** v0.6
   said *write to the rule*; measured over three items the readers found blocking gaps in all three,
   and the direction flipped on the third. W15 and W16 found a rule-written set blind to what the
   item **created**; **W17 found a deliverable-written set blind to a clause of the rule**, and only
   the clause-by-clause walk saw it. Neither half is redundant.
2. **Rule 8 defines *survivor*: a survivor is only a survivor once a second, independent route
   confirms the mutated clause was reachable.** Replaces W17's own weaker proposal (that rule 8 needs
   rule 7 (b)) — its adequacy reader's harness enforced 7 (b) and **all three of its vacuous probes
   passed**, reading as SURVIVED with the gate green.
3. **The record-step list gains `doc/decisions/**`** — the same one-word fix P4 made for the
   register, un-generalised. `Reserves:` names ADR ids too. **W17 is where it blocked a fix** rather
   than hiding an edit.
4. **A claim about another item's status is read from that item's own file, never from an index.**
   The one sub-case of *`doc/` is checked by nothing* that has occurred twice — and the second time
   it **reproduced**, into a fourth document.
5. **Section 6's isolated-copy rule says how to REMOVE the copy**: scan for links first. It was
   followed and cost a repository.

**Two things did NOT change**: `check-owns.mjs` stays retired (five items audited their `Owns` set
correctly; W16's failure was a stale *count*), and rule 7 (c) is **exercised** by W16 and unchanged.
**v0.6 was P4's retro and its three changes all replaced mechanisms that were *followed* and failed
anyway**: rule 8's provocations written to the **rule**; the **adequacy reader in an isolated copy**;
and the record-step list gaining **`doc/open-questions.md`**. **v0.5 is P3's retro and it changes one requirement of one rule**: a
negative-test probe declares the **set** of checks it must trip and the set must match exactly,
because naming one check does not discriminate — a merely *malformed* probe trips two at once, which
is W6's original defect surviving the requirement written for it. Measured over `check-docs`' twelve
probes, then provoked, which is **rule 8's first outing**. **Rule 8 itself is v0.4's and has the
strongest evidence of any rule in it:**
*when you act on a review finding, break the fix and watch the gate go red* — because W4, W5 and W9
each shipped a repair that could not fail, and **no rung of the ladder covers the repair.** The other
two v0.4 changes replace mechanisms that were *followed* and failed anyway: a new check's
provocations are now **checked in** rather than run once, and `Owns` is **checked** rather than
declared, after three consecutive items answered *"did you edit outside it"* with *"yes, and I did
not notice."* The short form:

```
concept -> plan -> work items -> verify (ladder, spec conformity, retro) -> record
```

- A **plan** (`doc/plans/`) answers one question and ends in something a human can look at.
- A **work item** (`doc/work-items/`) is the smallest thing with its own gate. It is **declared
  before it starts** — owns-files, tests, gate, reserved ids — using the template.
- **Verification is a ladder.** Climb from L0, stop at the first failure, and report which levels
  did not run. `workflow.md` section 4. **L2 (routing from a fixture outcome log) is where this
  repo's value is proved**, **L5 is the join/failure matrix** — the hard part — and **L6 is
  `examples/`**, the only rung that touches a real scheduler:

  ```bash
  npm run gate            # everything, both L6 runtimes included
  npm run test:l6         # ladder L6, node 24 - fifty real runs
  npm run test:l6:deno    # ladder L6, deno
  ```

  **L6 lives in `examples/**` and not in `test/**`, deliberately**: the browser bundle globs
  `test/**/*.test.ts`, so anything that imports a scheduler placed there would be bundled for a
  runtime L6 does not run in (`RT-R10`).
- Ids (`P`, `W`, `Q`, `ADR`, `S`) are reserved in blocks before fan-out, and are **never reused or
  renumbered**.

## Working rules

**`spec/` is the source of truth.** A spec change is its own change with its rationale stated, never
a side effect. If a spec looks wrong or unimplementable, **stop and report the specific conflict**
rather than patching it to make a test pass.

**Tests are part of the work item, never follow-up.** Expected values come from the spec, not from
output. A snapshot generated by running the implementation is not a test. Assertions must be able to
fail. Full rules: `workflow.md` section 5.

**"Tests pass", reported by whoever wrote the code, is a claim rather than evidence.** The
spec-conformity pass (`workflow.md` section 6) converts it into a statement about the code — run it
with a fresh context, spec first and code second, and it reports rather than fixes.

**A decision not in `spec/`, an ADR, or a plan did not happen.**

**A leaning is not a decision, and a leaning's *argument* is worth checking before its conclusion
is.** All four of `doc/concept.md` section 6's have now landed — two as ADRs, one as P1's spike, and
run-state-as-a-fold as Q14's answer — **and all four went to the leaning**, which section 6 now says
in place rather than leaving to a reader to notice. The live example is elsewhere: **[Q33](doc/open-questions.md)'s
leaning said *L6 in Node only*, on the stated ground that L6 *"needs a real worker file per
runtime"*, and that ground is false at Node 24.** W5 measured it in one command and the answer
flipped. Citing a leaning as settled is the most likely way to get this wrong; inheriting the
*reasoning* behind one without checking it is the second.

**A written claim nobody ran is this repository's most common defect, and `doc/open-questions.md` is
now one of its homes.** `spec/run-state.md` section 5 tabulates **four**: three were a spec asserting
what its own inputs could not supply, and the fourth is [Q43](doc/open-questions.md) — a register
entry, written by a reader, saying the data was already there when it was not. `spec/` has a
conformity pass; **the register has nothing.**

**A wish for `fyflow-scheduler` goes in [doc/scheduler-upstream.md](doc/scheduler-upstream.md), not
into a workaround comment.** Every item states what we do without it — an item with no workaround is
a blocker and belongs in a plan instead. **[S9](doc/scheduler-upstream.md) was the one live item and is now RAISED AND FIXED** in 0.5.2 ([W37](doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)), leaving the register with nothing waiting —
**the only item it has ever raised.**

**`src/` and `index.ts` may never import `fyflow-scheduler`.** The published npm and JSR packages
depend on it **not at all** *(until [ADR 0048](doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md), W57: they now DEPEND on it, and `S7` refuses every form of the reach but the bare specifier)* — `SchedulerLike` is a two-method structural interface and the caller
passes its own scheduler in. It is now a devDependency with the library on disk, so this is one
autocomplete away from being broken; `S7` in `scripts/check-source.mjs` is the refusal
([ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rules 1-2).

**Writing documents:** dense and decided. Tables and numbered rules over narrative. Distinguish
decided from open — open items get a Q id in `doc/open-questions.md`, not an inline TODO. Reference
paths from the repo root in prose; only markdown links are relative.

## Facts about fyflow-scheduler that catch people out

Grounded in its `AGENTS.md` at **0.5.2**, which **ships inside the npm package** — and §3 CHANGED at that version, which is why the list below no longer calls it stale: read it at
`node_modules/fyflow-scheduler/AGENTS.md`, not next door. There is **no changelog**, so a version
bump means re-reading `AGENTS.md` §6 rather than reading a diff. Re-check there rather than trusting
this list if it matters.

- **No dependencies, no ordering** — see above. This is the big one.
- **Its published TypeScript source DOES load under Node since 0.5.2, and this bullet said the
  opposite for nine days.** Until then `core/threadWrapper.ts:5` value-imported an `interface`,
  which Node's type stripping cannot erase, so importing the source threw under Node 24 and worked
  under Deno; and §3 told Node consumers a worker *"must be JavaScript"*, which was false at Node
  24. **Both were [S9](doc/scheduler-upstream.md), both were raised on 2026-09-07 and both were
  fixed in 0.5.2 the same day** — `import type` in `threadWrapper.ts` and in `workerManager.ts`
  (a second instance upstream found itself), and §3 rewritten to qualify by version rather than
  forbid. Measured against the JSR 0.5.2 source: `LOADED under node 24.20.0 - exports: 10`.
  **Node still reads npm's `dist/` and Deno still reads JSR's source, and the reason is now the
  only one left**: `dist/` is what an npm consumer gets, so L6 tests the published artifact rather
  than a source tree no consumer resolves
  ([ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md),
  whose stated reason [W37](doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md) corrects).
  **A typed `.ts` worker runs fine under Node 24**, `inline` and threaded, and that is unchanged.
- **The version is written down twice, and that is the live hazard.** `package.json` pins the npm
  package and `examples/deno-import-map.json` pins the JSR one; ladder L6 runs in both. `npm run
  check:scheduler` **D3** is what stops L6 reporting two runtimes green against two different
  schedulers. *(It replaced a stale-`dist/` check, which a published tarball cannot fail.)*
- **An event's `detail` is the live object, not a snapshot.** `detail` **is** the `FyflowTask` for
  `task.running`/`completed`/`failed`/`user_action` — **including the `timestamp` field**, so a
  retained detail reports the *most recent* event's time, not the one you received. **Never retain
  `e.detail`** — copy declared fields synchronously in the listener. `{...e.detail}` is *not*
  compliance: it still aliases `payload`, `result` and `error`.
  [ADR 0007](doc/decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md);
  upstream declined to fix it in code and documented it instead
  ([S8](doc/scheduler-upstream.md), `AGENTS.md` §6). *Not* affected: `task.progress`,
  `scheduler.completed` and `resource.*`, all copies.
- **A `user_action` task fires TWO events, and the first is called `task.failed`.** For a
  non-optional task out of retries the scheduler sets `state = 'user_action'` and then dispatches
  `task.failed` *and* `task.user_action` with the same object — at 0.3.0 in **two** places,
  `core/FyflowScheduler.ts:896-910` and `1128-1142` (the orphaned-task path). Key outcomes on
  **terminal state, not event name**, or you double-count and route a human-intervention case down
  an error edge. An *optional* task takes the other branch: `state = 'failed'`, `resolve(null)`, and
  only `task.failed` fires. **`AGENTS.md` still does not document this for the ordinary path** — it
  says *"`task.failed` fires once per failed task"*, and only the `orphaned` row records the
  pairing. Trust ADR 0007 rule 2 over that sentence.
- **`task.progress`'s detail changed shape in 0.3.0.** It is now the task **spread flat** — the id
  is `id`, *not* `taskId` — and the wrapper's `workerType` (`'inline'`/`'thread'`) overwrites the
  task's own pool key. A 0.2.1 consumer reading `detail.taskId` silently gets `undefined`.
- Task states are `pending -> running -> done | failed`, **plus `user_action`** for a non-optional
  task out of retries. Five states, not four, and it is the one every design drops (Q17).
- **Reusing a task id overwrites, silently.** Our id scheme is a correctness rule with a refusal
  test, not a convention (Q13).
- **A queued task cannot be cancelled.** Not implemented — so "cancel a run" is partial by
  construction (Q18, [S2](doc/scheduler-upstream.md)).
- `scheduler.completed` fires **every time the scheduler drains** — with a flow it will fire between
  steps routinely. It is not "the run finished".
- `onCompleteDescendants()` is **not a join**: transitive over lineage, but a failing descendant does
  not reject.
- `maxCompletedTasks` evicts terminal tasks from `scheduler.tasks` with no event to say so.
- Resource groups are **optimistic** — a limit can be briefly exceeded. Nothing is a hard cap.
- `addTask` returns `undefined` without `{ createPromise: true }`, and a scheduler that is never
  shut down keeps the process alive.

`AGENTS.md` inside the installed package is the single-file API reference and every snippet in it is
executed by that project's own test suite. **Nothing here reaches a checkout next door**, and
`check-scheduler.mjs` D1-D3 refuse the three ways that could come back — a `file:` dependency, a path
in the import map, and a symlink in `node_modules`. The last one is not hypothetical: it is how a
`git worktree remove --force` deleted most of the sibling repository on 2026-08-31
([ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)).

## Sibling repositories

`../fyflow-react-components` visualizes a scheduler. **Three of its open questions are the same as
three of ours** — `user_action` (their Q16 / our Q17), unbounded retention (their Q14 / our Q19),
one-collector-one-scheduler (their Q15 / our Q20) — and **two upstream wants are shared** (their
S1/S2 are our S5/S4). Answering a shared question differently in two repos is a bug with two homes.

**Cite another repo's ids with its name attached.** Two Q sequences, same questions.

## Environment

Windows 11. PowerShell 5.1 is the primary shell — `&&` and `||` are parser errors there, use `;` or
`if ($?)`. A Bash tool with POSIX syntax is also available and is usually the easier one.

**Node 24 is required and is not on the PATH by default** — `.node-version` pins it and **fnm** is
what selects it. In a non-login shell, activate it before running anything:

```bash
eval "$(fnm env --shell bash)" && fnm use 24
```

Node 16 is what a bare `node` resolves to here, and it fails at `??=`-era syntax long before it
reaches a test.

**`npm install` is just `npm install`.** The scheduler is a pinned registry devDependency
(`fyflow-scheduler@0.5.2` from npm; Deno reaches `jsr:@fyflow/scheduler@0.5.2`), so nothing needs to
be checked out beside this repository and **this repo writes nothing outside itself** —
[ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md),
which supersedes ADR 0013 rules 3 and 5.

**Never put a link into `node_modules`.** Not a `file:` dependency, not `npm link`, not a junction —
`check-scheduler.mjs` D1 refuses one and this is why: on 2026-08-31 a junction placed there so `tsc`
would ignore the sibling's source was **followed by `git worktree remove --force`**, which deleted
through the real repository — `.git/`, `core/`, `index.ts`, `dist/` — until it hit a lock. It was
recoverable only because 0.3.0 had been pushed publicly. Every recursive tool that touches
`node_modules` is one link away from another repository.

**Do not rewrite files with `Get-Content | Set-Content`** — PS 5.1 reads UTF-8 without a BOM as
CP1252 and silently double-encodes every non-ASCII character. Use the Edit or Write tool.

**And do not rewrite files with Python's TEXT mode either — `pathlib.Path.write_text` and
`open(p, "w")` translate a newline to a carriage-return-newline pair on Windows**, so a
read-modify-write converts the whole file to CRLF where the index is LF throughout, and the script
cannot see it.
**[Q123](doc/open-questions.md), and it has now happened three times — W22, W41 and P15's
declaration** — each time turning a small edit into a whole-file diff, each time caught only by
`check-wiring`'s `G2` going red with a message about a *dispatch block*. **Use `read_bytes()` and
`write_bytes()`**, or the Edit and Write tools. `git ls-files --eol` is the check by hand: every
tracked file here is `i/lf`.

## Git

Local identity is `tsukeero <tsukee.kage@gmail.com>`. **Commit only when asked, and push only when
asked separately** — the two are different questions and an approval to commit is not an approval to
publish. Commit subjects are scoped: `doc:`, `spec:`, `adr:`, `feat:`, `fix:`, `chore:`.

**There IS a remote and it is public.** `origin` is
`https://github.com/fyflow/fyflow-orchestration.git`, `main` tracks `origin/main`, and history has
been pushed to it since **2026-09-01**. *(This paragraph read "There is no remote yet" until that
day, while five commits sat unpushed against a remote that had been registered for some time — a
`doc/` claim in the front-door document, wrong in the direction that matters: an agent reading it
believes nothing it writes can leave the machine.)*

**A pushed commit is public and is not revisable in the way a local one is.** Four of the five
commits published on 2026-09-01 predated that session, and one of them — `75b3033` — edits a
decision's prose. **Prefer a new commit to amending or rebasing anything at or below
`origin/main`**, which is `doc/workflow.md` section 3's *"a commit message cannot be rewritten"*
applied one level out: ids leak into commit messages, and now those messages leak off the machine.
