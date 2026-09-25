# Documentation index

## Current state

**[W92](work-items/w92-what-a-gate-is.md) is DONE and [ADR 0066](decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md) says what a GATE is: a sixth node kind, a decision WITH MEMORY that names a registered TYPE and wires every route its type declares exactly once.** `spec/flow-definition.md` is **v0.23** — an edge key `route` (absent means the type's DEFAULT route, never every route), **`FD-V39`** (the type), **`FD-V40`** (the settings and the KEY PATH) and **`FD-V41`** (the routes, and `route` on every edge), **37 refusals**, `FD-V17` unmoved; `distinct` is the one built-in type and a value of the ONE interface a consumer's type is. **A gate is VALID and RUN by nothing**: `new Driver` refuses a gate flow at construction, because the declaration step measured the run-time `default` arm letting a real worker run first. **Its declaration step corrected P24 fact 5 twice** — the one typecheck error is in all FIVE lanes, and `gate` in `KINDS` alone made the validator THROW — and found `examples/l6.ts`' kind clause incompatible with the item's own *L6 UNMOVED*, resolved by an exemption that expires loudly. L1-L5 **52 / 1398** in three runtimes, L6 **UNMOVED at 1853 / 100**, `check:spec` **7 / 65 / 123**. Readers: conformity **ZERO disagreements on the VALUES** and ten false claims; adequacy **4 blocking**, three of them the pass-through bound on the DEFAULT route only. Rule 8 final **48 probes, 41 caught, 4 ceilings, both grader controls right, 0 against declaration** — and v0.24's WRONG-REASON grading found two cases running under each other's names (Q382). Q380 resolved; Q381-Q382 raised; census **299 / 233 / 1 / 65**. **W93 is next.** *Read every status from the item's own file, never from this line.*

**[P24](plans/p24-what-a-node-may-remember-across-a-runs-branches.md) is DECLARED — *what may a node REMEMBER across a run's branches?* — the maintainer's TV-series ingest: fetching and identifying each file assigns its series, and only the FIRST file of each series may open the per-series work while thumbnails run for every file.** A new node kind, **`gate`**: a decision WITH MEMORY that names a registered TYPE — one ships, **`distinct`**, with routes `first`, `duplicate` and `nokey` — whose every declared route must be wired exactly once (a drop is an edge to an `end`), evaluated SYNCHRONOUSLY by the driver where a branch enters it, its memory the driver's and REBUILT by replay on resume. **Seven facts measured with no `src/` edit**, the dedupe EMULATED by a decision whose predicate keeps closure memory: on an INLINE pool the winners were the lowest index per series in 10 of 10 runs in node and 9 of 10 in deno, and varied on threads (Q379); a drop to an `end` inside the map gives `branch.exited` and a `completed` run already; naive memory in the same process is REFUSED `diverged` on resume while fresh or owner-recording memory resumes identically; and a sixth kind is flagged by the typechecker at ONE of fifty-one node-kind dispatch sites (Q380). **All four stop-and-asks answered as recommended**: memory per RUN only; a recorded `gated` fold input, so the package moves to `0.6.0` at W94's close; a missing key routes to `nokey`; key paths are dotted object keys. Three items, serial: **W92** (what a gate IS — ADR 0066), **W93** (what a gate DOES in a run), **W94** (the exit artifact on real workers in both L6 runtimes). **Reserves W92-W95, Q379-Q393, ADR 0066-0067.** Census **297 / 232 / 1 / 64**. *Read every status from the plan's own file, never from this line.*

**[P23](plans/p23-what-a-run-needs-to-outlive-its-process.md) is COMPLETE and RETRO'D, `doc/workflow.md` is [v0.24](workflow.md) — ONE change adopted, SIX refused, and its central finding is that of the TWENTY-FOUR defects a rung FIRED on across the plan's three items, TWENTY-TWO were read correctly and BOTH misreadings were a rule 8 GRADER's.** [W88](work-items/w88-what-a-checkpoint-is.md)'s harness counted `FAIL` lines and graded `d1` caught on a lane already red for another reason; [W89](work-items/w89-what-resuming-is.md) built the reason check W88 asked for, the declared text within four lines of a failure; [W90](work-items/w90-a-run-killed-and-resumed-on-real-workers.md) inherited it and graded three CRASHES as catches, because L6's block names its own throw and the cross-row membership prints every subject's name two lines under its `FAIL` line. **Measured at the retro on the crash itself — a `throw` as block (2g)'s first statement exits 1 with FOUR named failures — the four-line window grades 28 of W90's 35 catches CAUGHT, W90's two-line fix 4, and a one-line window finds only 7 of the 35 probes' own reasons.** **THE ONE CHANGE: rule 8's harness requirement gains that its GRADER is controlled** — a probe whose right verdict is CRASH and one whose right verdict is WRONG-REASON, graded on every pass. **Name the rung: 73 defects (27 / 24 / 22), 24 fired, 49 with no rung, 14 in the INSTRUMENTS** — among them the exit artifact's KILL, since `shutdown()` DRAINS ([Q376](open-questions.md)), corrected in the plan under pass 3 rule 6. **Predictions: 1 CONFIRMED with its wording narrowed, 2 SUBSTANCE CONFIRMED and WORDING REVERSED, 3 the REACH CONFIRMED with its exceptions named, 4 REVERSED.** v0.23's selection clause FOLLOWED in all three items and short once in each, on a selection nobody framed as one — a fifth amendment REFUSED on that regress. **The `doc/` check is refused for the twenty-second time on the ENGLISH class only**: the retro measured two machine-comparable classes the refusal does not cover — `doc/decisions/README.md` short of its directory in 29 of 46 commits, and [Q171](open-questions.md)'s L6 count cell stale for six — and handed both to the next plan's declaration. **All 169 probes re-run in isolated copies, digest `e758ab75c60df81d` identical at both ends: 148 caught, 17 ceilings, zero undeclared, zero crashes, nine W88 aborts re-anchored, zero against declaration.** Overlaps **2, 2, 1** — the fifty-fourth to fifty-sixth, the list short by THREE. Census **295 / 230 / 1 / 64**, confirmed for the twenty-fifth plan. **W91 CLOSED unissued; the next plan starts at W92, Q379 and ADR 0066.** *Read every status from the plan's own file, never from this line.*

**[W90](work-items/w90-a-run-killed-and-resumed-on-real-workers.md) is DONE and it is P23's EXIT ARTIFACT, so P23 is COMPLETE pending its retro: a run KILLED at every kill point of two flows on a real `FyflowScheduler` and RESUMED on a fresh runtime through `runtime.resume`, from a store the consumer built by POSITION, in BOTH L6 runtimes — and the package is `0.5.0`, BREAKING IN SIX WAYS, every one named in `README.md`.** L6 is **1853 assertions over 100 real runs** in node 24.20.0 and deno 2.9.6, from 1833 / 60 — exactly the +20 and +40 the declaration predicted; L1-L5 UNMOVED at 51 / 1376 in three runtimes; `check:spec` UNMOVED at 7 / 61 / 120; `check:docs` **36 snippets, 30 run**, `X8` pairing six. **Its declaration step corrected the plan's own exit artifact: `runtime.shutdown()` DRAINS** — in both runtimes a run one settlement in completed inside it, while a retry on its backoff never ran — so a shutdown is not a kill: the kill is the consumer's STORE freezing, and every re-dispatched task visibly ran twice ([Q376](open-questions.md)). Block (2g): 14 kill points identical on outcome AND every node, 29 re-dispatched, 14 of them dispatched only in the lost tail, the re-dispatch read three ways — the `resumed` element, a derivation from the KILLED process, and the fresh scheduler's own task map in ORDER and with PAYLOADS; three processes appending to one positional store, where the same events keyed by arrival are refused `diverged` at 0; a mid-step and a quiescent cut of one run re-dispatching the same set; and a parked kill resolved on the resumed driver. `AGENTS.md` section 18 teaches it as an EXECUTED snippet and says in words what the snippet cannot: at-least-once and a fresh retry budget, the blind tail, the trusted store, a refused resume's spent id, the five reasons, and that `shutdown()` is not a kill. **P23 predictions 2 and 3 CONFIRMED**, 3 with its exceptions named. **Readers 7 / 2 blocking (ZERO disagreements on the VALUES) and 60 mutations / 29 survivors / 3 blocking, overlap 1 — the FIFTY-SIXTH measurement**: the scheduler-side count compared SORTED sets, claim (1) was a boolean one token from gone, a refused resume crashed the whole block, README listed two required members as additive, and three "whole rung" claims beside the one this item narrowed were false. Rule 8 final **46 probes, 35 caught, 9 declared ceilings, 0 against declaration** — after an author pass whose grader called a CRASH a catch three times, and a pass 2 that found the fix for a reader's finding had guarded one resume of four. Q376-Q378 raised, none resolved; census **295 / 230 / 1 / 64**. *Read every status from the item's own file, never from this line.*

**[W89](work-items/w89-what-resuming-is.md) is DONE and [ADR 0065](decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md) says what RESUMING is: a REPLAY of the stored settlements, resolutions and earlier resumes through the routing that produced them, every dispatch HELD, a refusal wherever the stored events are not a PREFIX of what it regenerates, and the tasks still in flight handed to a scheduler again at the SAME ids — at-least-once.** `driver.resume(checkpoint)` is `start()`'s other door into one run (`ID-R3`, `spec/task-id.md` v0.11); `runtime.resume(flow, checkpoint, options)` builds the driver through the ONE function `start` uses and returns the same `{ driver, done, header }`; `ResumeRefused` names `format`, `run`, `flow`, `stopped` or `diverged` with the position for the last two; `RunIdInUse` refuses an id any driver of the runtime holds and the minted counter skips it; and a `resumed` `FoldInput` names the re-dispatched ids, recorded by the fold in `RunState.resumes`. **Every callback fires only past the stored length, at the DRIVER's positions**, so a store that appends what it is handed holds the whole run again — and **W88's dated ceilings `c3` and `r6` are CATCHES here**. `spec/run-state.md` is **v0.10** — section 9, `RN-R19` to `RN-R25`, and a clause each on `RN-R15` and `RN-R18` — so `check:spec` is **7 / 61 / 120**; L1-L5 **51 files / 1376 in three runtimes**; **L6 UNMOVED at 1833 / 60 in both**; `check:docs` unmoved at 35 / 29 / 6. **Its declaration step corrected P23 prediction 2's WORDING**: of 29 tasks re-dispatched over 14 kill points none had settled — and **14 were dispatched only in the regenerated tail**, so the at-least-once set is the in-flight set at the END of the replay, not at the stored prefix; it re-took `kill-resume.ts` for [Q366](open-questions.md)'s shape (clean — and its re-dispatch set was `held − settled` BY CONSTRUCTION), and **MEASURED [Q365](open-questions.md)**: a budget of two attempts ran THREE times across one kill. Through the SHIPPED `runtime.resume` on real schedulers, **14 of 14 kill points complete identically**. **Readers 12 / 3 blocking (ZERO disagreements on the VALUES) and 72 mutations / 21 real survivors / 8 blocking, overlap 2 — the FIFTY-FIFTH measurement**: the runtime refused a header with no `runId` only AFTER minting and spending an id; a replay-refused driver stayed SUBSCRIBED and, with `failed` unset, would have ROUTED — both readers, from opposite ends; and v0.23's selection clause was applied to the in-flight set and not to the `stopped` refusal's own `index`, whose only fixtures sat where the wrong answers coincide. Rule 8 pass 2 **77 probes: 73 caught, 3 declared ceilings, 0 against declaration**, digest identical, **and the harness now grades a catch by the CASE its reason names** (W88's What broke 8), which reported one WRONG-REASON on its first run. [Q15](open-questions.md), [Q364](open-questions.md) and [Q366](open-questions.md) RESOLVED; Q371-Q374 raised, Q375 unused; census **292 / 227 / 1 / 64**. *Read every status from the item's own file, never from this line.*

**[W88](work-items/w88-what-a-checkpoint-is.md) is DONE and [ADR 0064](decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md) says what a CHECKPOINT is: the run's WHOLE fold-input sequence plus a HEADER of the five facts it cannot regenerate, handed out as a COPY, and every event has a POSITION.** `driver.checkpoint()` returns `{ header, events }` — `events` exactly `foldInputs()`, `header` a format version (`CHECKPOINT_FORMAT`, `1`), the run id, the flow id and version, and a `structuredClone` of the ENTRY PAYLOAD taken at `start()`, which the driver now KEEPS because no record carries it; `NotStarted` refuses an unstarted driver's checkpoint, and **an uncloneable entry payload now throws `DataCloneError` from `start()` with the driver unstarted — BREAKING**, `OR-R12`'s shape at the other caller-initiated boundary. `onFoldInput(input, seq)` hands each element its INDEX, and `runtime.start` returns `{ driver, done, header }`, the driver's header read back. `spec/run-state.md` is **v0.9**: section 8 and **`RN-R14` to `RN-R18`**, so `check:spec` is **7 / 61 / 113**; L1-L5 **49 files / 1339 in three runtimes**; **L6 UNMOVED at 1833 / 60 in both**; `check:docs` unmoved at 35 / 29 / 6. **Its declaration step corrected P23 FACT 1**: the replay spike captured its OWN replay drivers while iterating them, so *180 drivers, 169 exact, 673 prefixes* is really **L6's 62 starts, 61 captured, 57 exact, 324 prefixes, 261 / 261 payloads** — the conclusion standing on a third of the sample ([Q366](open-questions.md)); and it measured the harness's own `deepEqual` calling a class instance EQUAL to its clone, so the round trip is judged by a prototype-aware comparator with controls ([Q367](open-questions.md)). **v0.23's selection clause did its work on the header** — hard-coded `r1`, version 1, the entry node's COMPOSED payload, its result, a reference, a clone taken late: all caught on the first pass, on a flow at version 7 run as `batch42` whose entry composes `{ seed: "." }` — **and missed the one selection nobody framed as one**: *which run* a position counter belongs to. Both readers found it at the default position, a first run. **P23 prediction 4 REVERSES on its first test, by RETENTION rather than by resume**: no `FoldInput` kind was added, and `RN-R13` — *a run's footprint IS two terms* — gained a clause for the header's retained payload copy, after the first draft had kept the prediction true in its letter by writing the term beside that rule. **And L0 was RED under a Verification table that said green** — `lint` and `typecheck:tests`, both last run before the test file existed, found by BOTH readers: W86's confirming-gate failure a second plan running. Readers **12 / 3 blocking** (ZERO disagreements on the VALUES) and **32 mutations / 7 survivors / 6 blocking**, **overlap 2 — the FIFTY-FOURTH measurement**; the adequacy reader's own *equivalent* F8 was measured WRONG by the fix for its F1. Rule 8 pass 2 **46 probes: 40 caught, 5 declared ceilings RUN (two DATED to W89 — a position counted by the runtime's wrapper), 0 undeclared, 0 crashes, 1 abort re-anchored**, digest identical; and the author pass's `d1` was caught for a reason not its own, because the lane it fires was already red. Q366-Q367 raised, Q368-Q370 unused; census **288 / 226 / 1 / 61**; Q142 before the record step `M3` margin **9** files, `M4` **218** links. *Read every status from the item's own file, never from this line.*

**[P23](plans/p23-what-a-run-needs-to-outlive-its-process.md) is DECLARED — *what does a run need so that it can be saved while it runs and resumed after the process that ran it is gone, and can one stream of events serve both the saving and a live view?* — and it is [Q15](open-questions.md), deferred since P1, taken because the maintainer asked for it: the library defines the API and never the storage.** **Its central fact is that `doc/concept.md` section 5's promise — *if run state is a fold, durability is writing the log down* — HOLDS, measured with no `src/` edit**: `Driver.start` wrapped, `examples/l6.ts` run unchanged on real schedulers, and **180 captured drivers over 30 flows** replayed into fresh drivers on a fake scheduler, fed ONLY their settlements and resolutions — **169 reproduce EXACTLY**, every event and every private structure, **at all 673 prefix cut points**; the other eleven are nine runs `FD-R4` refused at start, refused identically, and two `OR-R6` stopped, whose refused result never reached the log. **Only 493 of 2015 events are stimuli; the driver regenerates the rest.** On real schedulers, two flows killed after every possible K settlements and resumed on a FRESH runtime — replay with every dispatch HELD, then the unsettled tasks handed to the new scheduler — **complete IDENTICALLY at 14 of 14 kill points**, re-running 1 to 4 tasks at the SAME task ids with no refusal. **The ENTRY PAYLOAD is the one thing the log lacks** (a `dispatched` event holds an id; the replay recomputed all 616 dispatched payloads exactly, from the original payload) — [W42](work-items/w42-what-a-decision-sees.md)'s finding, now load-bearing. **A checkpoint taken inside `onFoldInput` ends MID-STEP**, so a stored log is a PREFIX of its replay, 1-7 events short — which is why resume's divergence check is *prefix*, not *equal*, and why a consumer may lose the tail of an asynchronous store safely. **The maintainer's answers, each given after the alternatives were priced**: a CHECKPOINT is the FULL event sequence plus a HEADER (format version, run id, flow id and version, entry payload), named `checkpoint()` because `snapshot()` already means the settlement records; the header from BOTH `runtime.start` and `checkpoint()`; the contract is `structuredClone`, not JSON; resume RE-DISPATCHES the in-flight set, so it is AT-LEAST-ONCE and workers must tolerate running twice; a flow-version mismatch is REFUSED with no migration; REDACTION is declined — *not needed yet, maybe never* — and so is any memory option, measured first: one 10 000-task run holds 5.0 / 14.6 / 161.1 MiB at 16 B / 1 KiB / 16 KiB results, of which the non-settlement events are **2.3 MiB at every size**, because the results are the memory and the events SHARE them. Three items, serial: **[W88](work-items/w88-what-a-checkpoint-is.md)** (what a checkpoint IS — ADR 0064), **W89** (what RESUMING is — ADR 0065), **W90** (the exit artifact: killed mid-run on real workers in both L6 runtimes, resumed from appended events, completing identically, where L6 MOVES). **Reserves W88-W91, Q364-Q378, ADR 0064-0065**; raises [Q364](open-questions.md) (a fresh runtime mints a run id a resumed run already holds) and [Q365](open-questions.md) (a resumed task gets a fresh retry budget). **The exceptions table is SEEDED at the declaration**, which P22 did not do and its exit artifact paid for. **All three stop-and-asks ANSWERED the same day, each as recommended**: a resume IS recorded — a `resumed` event naming the re-dispatched ids, which makes the change BREAKING and the package `0.5.0` at W90's close; a runtime REFUSES a `start` or `resume` whose run id is live on it; and re-dispatch keeps the SAME task id. Census **286 / 224 / 1 / 61**. *Read every status from the plan's own file, never from this line.*

**[P22](plans/p22-what-a-regions-identity-is.md) is COMPLETE and RETRO'D, `doc/workflow.md` is [v0.23](workflow.md) — ONE change adopted, SEVEN refused, and its central finding is that all three of its items FOLLOWED rule 8 obligation (a) — the shapes, the enumeration and the same claim — and all three put the value their rule discriminates where its most plausible WRONG value is the same value.** The plan's subject is a KEY, and each item read the previous one's account of the defect before meeting it: [W84](work-items/w84-what-a-regions-identity-is.md)'s fixtures settled instances in dispatch order at ONE path segment, so reading the opener's FIRST instance and truncating the path to its first segment each cost **0**; [W85](work-items/w85-what-a-nested-region-carries-and-how-it-ends.md) — *the item written to discharge that finding* — parked both tasks in instance 0, so filing an event under the first OPENED instance cost **0 at five sites**; and [W86](work-items/w86-score-each-item-then-fan-out-per-item.md) measured the pair on real workers, where a FIFO pool closes each window before the next opens: with its ARRANGED overlap removed, opener-only keying costs **1 where it costs 3** and first-instance keying **0 where it costs 2**, each above what removing the overlap costs by itself. **A well-formed wrong selection is the one that COINCIDES with the right answer at the DEFAULT position — index 0, the first opened, one segment, dispatch order — so a fixture there cannot tell a rule from its most plausible defect however many shapes it covers.** W85 drove four exit paths where the plan named three, depth three, N = 0, retention and visibility: the enumeration was complete and every instance in it was the degenerate one. **THE ONE CHANGE: obligation (a) gains that where a rule SELECTS — a key, an index, an instance, a path — the set names the well-formed wrong selections the type admits and each fixture puts the right one where every one of them DIFFERS**, and where the corpus or the scheduler gives only the default position the author ARRANGES the other and asserts the arrangement's own effect. It is the **FOURTH amendment to obligation (a)** and the sequence has obligation (d)'s shape: each the previous one followed and short. **[Q353](open-questions.md) is RESOLVED** by it. **Name the rung: THIRTY-SEVEN defects across the three items' own lists (9 / 12 / 16), NINETEEN name a rung that FIRED, and ALL NINETEEN were read correctly at the first opportunity — the first plan in which none was misread**, including W86's confirming gate at `GATE EXIT=2` with ZERO `FAIL` lines, read as a crash on sight. Eighteen have no rung, FOUR in the INSTRUMENTS. **REFUSED, seven, each with a measurement**: a `doc/` check for the TWENTY-FIRST time, on a class with nothing to compare against — a citation of a reader's NUMBERED FINDING, wrong in two consecutive items, when no reader's report is in the tree; *act on no reader's findings until every reader has reported*, because section 6's *while a reader is reading* already names A reader and W86 broke it six times and obeyed it once — **[Q363](open-questions.md) RESOLVED as answered by its own text**; an `Owns`/`Gate` pre-declaration rule for the TENTH plan, where all three items corrected the plan's `Gate` column at their declaration step and **P22 is the first plan since P18 not to SEED an exceptions table, with W86 shipping none until its reader asked**; a rule for a gap read off a DIFF ([Q352](open-questions.md)), which P15 decision 5's re-take caught exactly where this plan made it the only road; a membership over CONTAINERS ([Q356](open-questions.md)), [Q217](open-questions.md)'s regress going INWARD; projections of one walk as observers ([Q362](open-questions.md)), which obligation (c)'s LIMIT already says at its second occurrence after [Q340](open-questions.md); and a corpus census pinned outside its corpus at its second occurrence ([Q342](open-questions.md), [Q360](open-questions.md)), every site named by a rung that fired. **ONE of FOUR predictions REVERSED and THREE CONFIRMED** — the reversed one is the derived prediction whose scope column named in advance the half that had not been measured, and the one REACH, prediction 3, confirmed with its reversal clause's mechanism false in the direction that mattered ([Q358](open-questions.md)). **All 123 probes RE-RUN at the retro on the shipped tree, in an isolated copy — 105 caught, 18 declared ceilings or classified survivors RUN, ZERO undeclared survivors, ZERO crashes, ONE abort re-anchored and then caught**, and the two dated ceilings W84 handed to W85 and W86 are CATCHES already taken by those items, so **ZERO NEW catches for the fourth plan running**. **And re-running W86's set found its Record's *0 against declaration* true of pass 3's five probes alone** — the harness prints six, every one reclassified in prose and not in the set — and its overlap-removed column stated as costs where it is increments over the removal's own 4. **Readers six passes, none empty, and ONE overlap measured — W86's 2, the FIFTY-THIRD** — while the section 6 list the ordinal derives from had stopped at the forty-ninth: P21's retro never appended its own three. Twenty-eight blocking, split 14 / 14, and **all three conformity readers' central obligations came back with ZERO disagreements on the VALUES**, the second plan running. **Late exceptions: zero undeclared in any of the three.** Census **CONFIRMED for the TWENTY-FOURTH plan running — 284 / 221 / 2 / 61**, and [Q142](open-questions.md) did not fire in any item — **though W86's index paragraphs gave its `M4` margin as 365 links where the item measured 343 BEFORE its record step, and a record step only ever narrows it**; corrected. **W87 CLOSED unissued, Q345-Q363 all used, ADR 0063 SKIPPED. The next plan starts at W88, Q364 and ADR 0064** — and `CLAUDE.md` said **ADR 0063** for it from W86's record step until this retro. *Read every status from the plan's own file, never from this line.*

**[W86](work-items/w86-score-each-item-then-fan-out-per-item.md) is DONE and it is P22's EXIT ARTIFACT — *score each item, then fan out per item* on a real `FyflowScheduler` in BOTH L6 runtimes, so the plan is COMPLETE pending its retro, and the package is `0.4.0`.** A `map` whose branch opens a second `map`: **`perShard` is ONE opener with TWO INSTANCES**, two branches wide and three, and **both arities come from data no document carries** — the shape [W33](work-items/w33-a-map-at-run-time-arity.md) refused at `Driver` construction and [ADR 0062](decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md) lifted whole. **L6 is 1833 assertions over 60 real runs** in node 24.20.0 and deno 2.9.6, from 1724 / 58; L1-L5 **UNMOVED at 47 / 1322** in three runtimes; `check:spec` **UNMOVED at 7 / 61 / 108**; `check:docs` **35 — 29 run, 6 check**; `check:workers` **17 / 17 / 0 / 2 / 0**. **P22 fact 1's headline ZERO is what this item REMOVES**: *openers inside a map region: 0 of 50 — that zero IS the refusal* reads **1 of 52 over 46 documents** on the tree it ships, and `branchPathOf` THROWS `ID-R6` for that opener, which is ADR 0062 consequence 6 from the outside. **The grant was USED** — one new worker, `shard.ts`, returning a per-item list so no transform is in the artifact's road — where P21's identical grant was measured UNUSED by W81, which is the SECOND consecutive plan to grant one and the first to use it. **Prediction 3, the REACH, is CONFIRMED and its stated reversal condition went the OTHER WAY**: the flow declares zero `needs`, zero `transform` and ONE node between the two maps, and the clause's *because a real pool interleaves two instances in a way the fake does not* is false in the direction that matters — **a `map` dispatches every instance of its branch AT ONCE, so one FIFO pool makes each instance's window close before the next opens and a real run interleaves LESS than a fake** ([Q358](open-questions.md)). **So the overlap is ARRANGED, DERIVED from the run's own fold-input sequence and asserted, never hoped for** — and the measurement is the item's central number, taken from both sides: `arrivals` keyed by the opener ALONE costs **3** with the overlap and **1** without, the two that go being *what `publish` received* and `JP-R12` at two levels; Q353's first-opened-instance keying costs **2** with it and **ZERO** without. *The wrong key gives the RIGHT answer once the windows do not overlap, because ADR 0046 rule 3 releases eagerly.* **Its adequacy reader's named target (a) SURVIVED IN PART and is the sharpest finding: the headline clause could be made a TAUTOLOGY with ALL FOUR declared controls green**, because `maxTogether`, `closedOrder` and `othersAtClose` are three PROJECTIONS of one walk and each control read a different one — v0.22's clause satisfied and short, since every control does name a tree on which it fails and *that tree fails the claim too* ([Q362](open-questions.md)). Closed by a second EXPRESSION over the same sequence, its own INDICES, which on that tree fires where the tautologised clause does not. Three more blocking: the detector's `map` arm hard-codable past a control written against a detector that hard-codes BOTH arms (closed by `ID-R6`'s refusal as a second road); two REACH clauses narrowable for free; and **this item's own crash repair shipped at one site while the identical defect went out one block over**, where a renamed field masked SIX named detections behind a `TypeError`. **Its conformity reader's central obligation came back with ZERO disagreements on the VALUES** — every dispatched id in order, every region instance's key, every collection's key set, each inner branch's ROAD, the full close order with `perShard@0` still holding at `perShard@1`'s close, what `publish` receives at two levels and both outcomes, derived on paper from `spec/` for BOTH rows before any output was read — **and its HEADLINE is a finding about the AUTHOR**: the tree was not held still under it **SIX TIMES**, because the two readers ran CONCURRENTLY and acting on the first one's six blocking findings was both obligatory and six edits under the other's pass. *`doc/workflow.md` v0.15 change 2 is written for ONE reader and section 6 asks for two* ([Q363](open-questions.md)); that reader's whole-gate verdict is about a tree that no longer exists and three of its findings were fixed while it wrote them up, which it handled by re-checking and saying which. **Readers 9 findings / 3 blocking and 34 mutations / 14 survivors / 6 blocking, OVERLAP 2** — `README_SNIPPET_FLOOR` left slack and the `CROSS_ROW_SUBJECTS` comment miscounting its own entries, both found independently. **Rule 8 final 43 probes over THREE passes, 33 caught, 10 classified — SEVEN declared CEILINGS each with the tree that fails it NAMED *(this read six, beside a list of seven and a total of ten, until P22's retro)*, two VACUOUS by rule 8's own definition (a literal set-EQUAL to what it replaces, W47's `c3`), one semantically equivalent — 0 UNDECLARED survivors, 0 crashes, 0 aborts, 0 against declaration on the final pass**, controls green and digest identical at both ends of every pass. **And the re-run found TWO defects in the AUTHOR'S FIXES and none in the product**: both reach counters read a length the mutation they were written against does not touch, so the reader's exact edits survived the fix for them — v0.8's founding observation, and what a second pass is for. **`X9` is a new `check:docs` clause** and probe `h1` is why: reverting the manifest to `0.3.0` on a tree shipping `0.4.0` cost **ZERO** everywhere ([Q361](open-questions.md)). **Five declared exceptions outside `Owns`, and the item had NO exceptions table until its conformity reader asked for one** while the file cited *the table* twice — three corpus CENSUSES pinned outside their corpus fired and only TWO were predicted, the unpredicted one being `spec/outcome-record.md` section 4, in an item whose `Spec:` line reads NONE ([Q360](open-questions.md)). Q358-Q363 raised, **none resolved**; census **284 / 223 / 2 / 59**; [Q142](open-questions.md) measured BEFORE the record step and does NOT fire (`M3` margin 11 files, `M4` margin **343** links — this read 365 until P22's retro, which is LARGER than the item's own pre-record-step figure, and a record step only ever narrows it). *Read every status from the item's own file, never from this line.*

**[W85](work-items/w85-what-a-nested-region-carries-and-how-it-ends.md) is DONE, it takes NO ADR and it adds NO RULE: what a region nested inside a `map` CARRIES and how it ENDS, asserted where [W84](work-items/w84-what-a-regions-identity-is.md) edited and did not drive.** `spec/join-policy.md` is **v0.18** and `spec/run-state.md` **v0.8**, moving THREE `Test:` cells — `JP-R10`, `JP-R12`, `RN-R13` — and nothing else, so **`check:spec` is UNMOVED at 7 / 61 / 108**; L1-L5 is **47 files / 1322 assertions in three runtimes** from 46 / 1302; **L6 is UNMOVED at 1724 / 58 in both runtimes**, which is the declared result for an item that adds no flow and no worker; `src/` is **UNTOUCHED**. **It corrects [P22](plans/p22-what-a-regions-identity-is.md) fact 5, and the correction is the item's central finding: a class of churn enumerated by reading the DIFF is not the class a probe measures, and it was wrong in BOTH directions at once.** Fact 5 named `branch.lost`, `branch.suspended` and `branch.resumed`; re-measured one site at a time, **`branch.lost` was ALREADY BOUND at 7** (the L5 `nested-inner-lost` row, whose regions sit at path `1`), two were at 0, and **four more sites the enumeration does not name were also at 0** — `firedAdd` at both of `settleJoin`'s exits, `releaseArrivals` at the `unsatisfiable` one, and `JP-R10`'s emission at N = 0 — plus **`branch.exited`**, `spec/join-policy.md` section 2's fourth branch-ending event, which W84 edited for the same reason and which *three* excludes by construction ([Q352](open-questions.md)). **And the author then bound the EASY half of the mis-keying at every one of them**: forcing `'-'` was caught, while filing the event under the opener's **FIRST OPENED instance** cost **ZERO** at `.suspended`, `.resumed`, `.exited` and both of `JP-R10`'s sites — because both parks were in instance 0, which is also `values()[0]`, and because in every fixture the region `JP-R10` names had exactly one instance. *That is [Q349](open-questions.md)'s finding reproduced by the item written to discharge it* ([Q353](open-questions.md)), found by its adequacy reader and closed by parking instance 1, settling it first, and adding a three-nested-map document in which the enclosing region has two. **Its other blocking finding is that ELEVEN of the thirteen cases the item first shipped were deletable at `npm test` EXIT 0**, taking four of its six declared Outputs with them, because the only thing binding them was a census over SUITE names and **an empty suite is still a suite** — and that census's own control, `names.length >= SUITES.length`, is defeated by a one-token re-source that empties both its set differences, which is v0.21's clause failing v0.22's test ([Q356](open-questions.md)). Closed by a case-level membership in the file itself and by a COUNT beside the census's differences, with the ceiling NAMED: re-source plus a DELETION is caught by the literal count, re-source plus a RENAME is not, and no expression inside one process can check that a list of names was written down before the run. **Its conformity reader's central obligation came back with ZERO disagreements on the VALUES** — every region instance's key, every collection's key set, every branch-exit event triple, every visibility verdict and every run outcome derived from `spec/` on paper before any output was read — and what it found were CLAIMS: *section 3 is byte-unchanged for the sixth version running* is FALSE and was already false at v0.17, because `JP-R10`'s row is INSIDE section 3 and both items edited it while incrementing the counter; a claimed `DuplicateTaskId` the item's own fixture **could not produce**, because a nested inner join routes into ANOTHER JOIN, so a doubled fire records a second arrival and mints nothing ([Q357](open-questions.md)); and *"W84's adequacy reader, finding 8"*, cited four times including in shipped test prose, **which does not exist in the tree**. **Three of the author's own expectations were wrong and the run corrected each**: `JP-R12`'s `{}` **PROPAGATES** into the enclosing branch rather than being an absence ([Q354](open-questions.md)); `FD-V28` demands the **BARE** form, because a region nested inside a `map` multiplies the READERS and not the visible outputs, and the author had reasoned from that rule's error MESSAGE rather than from its condition ([Q355](open-questions.md)); and the enclosing map's collection is live at the instant an inner instance releases. **Readers 12 / 5 blocking and 52 mutations / 10 real survivors / 6 findings / 3 blocking.** Rule 8 final **42 probes over two passes, 38 caught, 4 declared ceilings each RUN, 0 UNDECLARED survivors, 0 crashes, 0 aborts standing, 0 against declaration**, control green and digest identical at both ends of each pass, with all eleven reader edits checked in — and **the HARNESS was the last defect**: its digest read `git ls-files`, which lists TRACKED files only, so the two files this item ADDS were outside the guard while most of its test-side probes edit one of them (measured: appending a line left it unmoved three times). The restore was still asserted byte-for-byte, so nothing went unobserved — the digest's CLAIM was simply wider than its reach — and both passes were re-run whole once it was widened — and one abort on the re-run, `d3`, whose anchor pinned a list's closing bracket that this item's own sixth entry moved (rule 7 (b) firing rather than passing). **Two declared exceptions, zero undeclared**: the plan's *"W85 and W86 are still rows"*, and W84's `check:markdown` link count, stale by one and re-measured on a pristine `git archive` of `40d9343`. Q352-Q357 raised, **none resolved**; census **278 / 217 / 2 / 59**; [Q142](open-questions.md) measured BEFORE the record step and does NOT fire (`M3` margin 12 files, `M4` margin 486 links). *Read every status from the item's own file, never from this line.*

**[W84](work-items/w84-what-a-regions-identity-is.md) is DONE and [ADR 0062](decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md) answers [Q160](open-questions.md) and [Q156](open-questions.md) TOGETHER: A REGION INSTANCE IS `(opener node id, the opener's OWN branchPath)`, and W33's construction refusal is LIFTED WHOLE.** `RunState.regions` is **two-level** — `regions[openerId][openerPath]` — with **no composite string anywhere**; `RegionEvent` gains **`regionPath`** on all six variants and `UnsatisfiableJoin` gains it too; **`regionId` keeps one meaning AND its value**, which is what *L6 UNMOVED at 1724 / 58 in both runtimes* asserts rather than merely reports. `spec/run-state.md` **v0.7**, `spec/join-policy.md` **v0.17**, `spec/flow-definition.md` **v0.22**; L1-L5 **46 files / 1302 assertions in three runtimes**; `check:spec` **UNMOVED at 7 / 61 / 108**, because the refusal carried **no rule id anywhere in `spec/`** — the declaration step's fifth re-take, and the reason lifting it costs a sentence rather than a row. **The declaration step re-took all five facts and found the FOURTH wrong**: the per-region run-time structures are **FIVE and both places that state the list name FOUR** — `arrivals` is W34's and postdates W33's conformity reader, so its own doc comment said *like every other per-region structure here* while enumerating four that exclude its own subject ([Q351](open-questions.md)). **And it found a SIXTH thing the five do not cover**: `AGENTS.md`'s executed snippets carry `RegionEvent` literals that **no typecheck lane reads** and `check:docs` does, on a rung the item's own `Gate:` line does not name — so W84 as declared could have shipped a gate entry red with its own gate green ([Q348](open-questions.md)). **P22 prediction 1 REVERSES by its own stated condition, measured one for one**: *every one of the L1-L5 failures is in a file a typechecker names* is FALSE — **8 of 34 are in four files no typechecker names** — because `Record<string, T>` has an **OPEN index signature**, so `regions['split'].joined` on the two-level type still TYPES as `RegionRun` and evaluates to `undefined` ([Q346](open-questions.md)); its CONCLUSION survives on a different rung, since L1-L5 and L6 caught every one. Its sharpest form is a **cast that RESTATES the shape it reaches into** and so compiles against its own stale restatement, in both retention observers ([Q347](open-questions.md)). **Prediction 4 CONFIRMED against the diff** — zero existing region names move and the only two that appear are openers in fixtures this item newly RUNS; **prediction 2 CONFIRMED** — `JP-R12`, ADR 0044 and `checkWiring` need zero changes. **Its conformity reader's central obligation came back with ZERO disagreements on the VALUES**: it built the region sets and `branchPath` from `spec/` alone and derived every instance key on paper before reading any output, and what it found instead were **three surviving statements of the WITHDRAWN refusal** in files inside `Owns`, a churn figure stale by three sites and two files, and an `Owns` block that could not hold its own `Outputs` row. **Its adequacy reader's SECOND NAMED TARGET SURVIVED and is the item's sharpest finding**: the two-level carrier was bound at **ONE SEGMENT** — truncating the instance path to its first segment cost ZERO at every rung, and on a depth-3 document that is **W33's exact defect one depth out**, two instances of the innermost opener merging into one key and a run in which every task settles reporting `stuck`. *The spike measured depth three; the item shipped no observer for it.* Three more blocking: ADR 0062 rule 4's `map`-in-`map` half had **no driver fixture** while the ADR calls it the same case, `regionEntered`'s per-instance dedup had none (narrowing it turns a `stuck` run into `completed`), and the interleaving case's **ORDER was load-bearing and asserted by nothing** — closing the FIRST instance first leaves the probe green, because instance 0 is also `values()[0]` ([Q349](open-questions.md)). All five closed and **the readers' exact edits are checked in as probes; all six fire**. Rule 8 final **38 probes, 32 caught, 6 declared ceilings each RUN, 0 UNDECLARED survivors, 0 crashes, 0 aborts, 0 against declaration**, digest identical at both ends — and the AUTHOR pass first read six survivors of which **two were the PROBES**, one semantically equivalent by construction and one moving both sides of an equality. Q346-Q351 raised, **Q160 and Q156 RESOLVED**; census **272 / 211 / 2 / 59**; [Q142](open-questions.md) measured BEFORE the record step and does not fire (`M3` margin 13 files, `M4` margin 593 links). *Read every status from the item's own file, never from this line.*

**[P22](plans/p22-what-a-regions-identity-is.md) is DECLARED and [W84](work-items/w84-what-a-regions-identity-is.md) is DONE — *what is a region's identity, and may a region open inside a `map` region?* — and it takes [Q160](open-questions.md) and [Q156](open-questions.md) as ONE question, because one is the mechanism and the other is the narrower case of it.** Q160 says why a region cannot open inside a map: **a region's identity is its opener's NODE ID, and a map makes one opener reachable N times in a run**, so [W33](work-items/w33-a-map-at-run-time-arity.md) REFUSES the shape at `Driver` construction rather than letting instance 2 discard instance 1. **P12's retro already gave the verdict** — *keying a per-region structure by node id ALONE is a DEFECT and not a convention* — and what has been missing since is the evidence for what replaces it, which a **concluded spike** (`dev-dist/spike-nested-map/`) measured and which this declaration RE-TOOK in five facts. **The scope is narrower than *nested regions* and the plan says so**: `map`-in-`fanout` and `fanout`-in-`fanout` already run — the corpus holds six nested regions and every one is at `path=1` inside a fanout branch — so what P22 lifts is **a region inside a MAP**, which is the only construct that enters one opener more than once. **Decided before fan-out, each alternative BUILT and RUN rather than argued**: a region instance is **`(opener node id, the opener's own branchPath)`**, the carrier is **two-level `regions[openerId][openerPath]`** with no composite string anywhere, `regionId` keeps its meaning AND its value, and `RegionEvent` gains **`regionPath`**. *Qualifying the OBSERVABLE id is what breaks things and it breaks them where no type can see it* — the composite-string road measured **twelve silent failure modes** against the two-level road's **sixty typecheck errors, every one NAMED**, so the cheapest row is the one that fails in silence and the dearest is the one whose whole cost a typechecker prints. **Five facts measured on `1da565f`**, tree held still at digest `9f8a8b13d0394d78` over 377 files at both ends: the key measurement REPRODUCES and **measures what the corpus can EXPRESS rather than what either key does** — openers inside a map region are **0 of 50**, and *that zero is the refusal*; the churn reproduces at **46 edits across three files** with `src/` clean on all three source typecheck lanes; the *all churn is LOUD* claim **holds at a line that MOVED** (the spike recorded `examples/l6.ts:3891`, W82 took it to **4190**, and `typecheck:examples` names it); **DEPTH THREE works unchanged** — 16 tasks, seven region instances, four distinct keys for the innermost opener, run completed, which the spike names as NOT measured; and **the three branch-exit paths are CLEAN under nesting**, which is the one class of churn no typechecker can see. **Three items, serial: [W84](work-items/w84-what-a-regions-identity-is.md)** (the identity — ADR 0062, the refusal LIFTED, and **all sixty typecheck sites and all thirty-two L1-L5 failures**, because the change does not compile without them), **W85** (what a nested region CARRIES and how it ENDS), **W86** (the exit artifact — *score each item, then fan out per item* on real workers in both L6 runtimes, **where L6 MOVES**). **Reserves W84-W87, Q345-Q359, ADR 0062-0063**, derived by grep off the tree; **W84 is DECLARED and reserves Q346-Q351.** **All three stop-and-asks were answered the same day and TWO went AGAINST the recommendation**: (a) **nothing is checked in** — `dev-dist/` stays ignored on the twenty-one-plan precedent, which makes W84's five-row re-take table the ONLY road any fact has to the item that acts on it; (b) **`0.4.0` at W86's close**, on W77's precedent, so W84 and W85 ship the breaking shape with the manifest unmoved; (c) **a NEW WORKER is allowed** for the exit artifact, the second consecutive plan to grant that permission after W81 measured P21's UNUSED. **And the declaration corrected itself twice under measurement**: its stop-and-ask (a) cited **P15 decision 3 against the repository's own practice** and that decision is about an EXIT ARTIFACT's harness under `examples/**` — *decision 5* is what governs a declaration's facts and it already says **re-run, never transcribe**; and its *reuse `split` twice* does not work, because `split` reads `payload.text` while a map item is `{ word, confidence }`, so `split` over an item returns an empty list and decision 6 makes the inner region `stuck`. **It also raises [Q345](open-questions.md) about its own evidence**: the spike's typecheck logs are **ZERO BYTES**, because `run-pC.py` writes `pC-tc:examples.log` and a colon on Windows opens an NTFS alternate data stream — the numbers are sound and came from an in-process parse, and the artefacts for five lanes are empty with no rung saying so. Census **266 / 207 / 2 / 57**, one raised and none spent; [Q142](open-questions.md) MEASURED at the declaration and does **NOT** fire (`check:markdown` EXIT 0, self-test **7 / 7 bounded**, zero FAIL lines), although this plan adds a document to `doc/plans/`, the directory probe 2 cuts. *Read every status from the plan's own file, never from this line.*

**[P21](plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md) is COMPLETE and RETRO'D, `doc/workflow.md` is [v0.22](workflow.md) — ONE change adopted, FIVE refused, and its central finding is that v0.21's CONTROLS clause was FOLLOWED by all three items of the plan that began THREE DAYS after it was adopted, and all three produced a control the clause's own question defeats.** v0.21 says a control must fail where its claim is VACUOUS and names the answer — **IDENTITY, the two sides are different values**. [W80](work-items/w80-what-a-run-time-result-check-is.md)'s operands are **freshly built**, so the two sides are always different values AND always equal; [W81](work-items/w81-what-a-settlement-costs.md)'s were **two zeros** on a corpus where nothing fails its schema; [W82](work-items/w82-a-result-its-own-schema-refuses-on-real-workers.md)'s were **different objects with one source**, so a one-token re-source made the claim a projection of the report compared with itself and left the control exactly as true as before. ***Identity answers "are these two sides ONE VALUE"; it does not answer "can these two sides EVER DIFFER", and that is the property a control needs*** — P20's `OBSERVED equals DECLARED` over two lists is the one shape where the two questions coincide. **So the clause keeps its REQUIREMENT and loses its PRESCRIPTION: a control is one only if you can NAME THE TREE on which it fails and its claim passes.** That is W80's own sentence — *asked of the author's own IDENTITY control, what tree makes this fail while its claim passes? There is none; following the clause and asking its question are different acts* — generalised, and **none of the three repairs is identity**: a LITERAL for each arm, a CONTROL RUN whose schema refuses, and a RELATION over the DERIVATION. It is the **FOURTH amendment to obligation (d) in eight plans** and the first to name a TEST rather than a thing to add or a property to have ([Q217](open-questions.md)); **[Q332](open-questions.md) is RESOLVED**. **Name the rung: FORTY-ONE defects across the three items' own lists (14 / 18 / 9), THIRTEEN name a rung that FIRED and those thirteen name FIFTEEN firings, and TWELVE of the thirteen were read correctly at the first opportunity.** The thirteenth is new in its mechanism: W82's `b6b` came back `exit 1` with **two NAMED failures**, so rule 8's crash discriminator — *non-zero exit with ZERO named failures* — did not fire and the author read CAUGHT, while the snippet had thrown a `TypeError` and **`X4` had converted it into `X4`'s own named failure**, *the snippet does not run*. *A check that EXECUTES the thing it grades launders its subject's crash into a detection.* **Twenty-eight have no rung and FOUR are in the INSTRUMENTS**, the sharpest being a census parser that **DROPPED [Q87](open-questions.md)'s five-line row and read 260 against 261 with ZERO aborts** — this register already carries two readings of that row and both are MISREADINGS, which a classifier can refuse: *a parser that aborts on what it cannot classify does not abort on what it never SEES* ([Q343](open-questions.md)). **REFUSED, five, each with a measurement**: a `doc/` check for the TWENTIETH time — and P21 supplies the sharpest instance yet, because v0.14 ALREADY requires a WITHDRAWN claim to be searched for, W80's reader followed it and found three copies, and W82's found a FOURTH in the plan's own headline, **since the copies are PARAPHRASES and a grep is defined not to see them**; a rule for a corpus census pinned as a LITERAL outside the corpus ([Q342](open-questions.md), one item, three sites that behave three ways, and the one that BEHAVED is the one a test derives); a rule about a crash laundered into a named failure, at one occurrence and refused because rule 8 already says *fires for the reason it names* and the reason was printed on the harness's own line; an `Owns` pre-declaration rule for the NINTH plan running, with P16's seeded TABLE doing the work and all three items correcting their seeded row; and a rule about ad-hoc tooling that reports success having changed nothing, which rule 8's harness clause already covers for the harness. **ONE of FOUR predictions REVERSED, TWO CONFIRMED, ONE NEITHER — and the reversal was taken DELIBERATELY because the plan's own reversal column told an item to go and take it** ([P15](plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s *a reversal clause DIRECTS an item*, a second time); prediction 3, the REACH, is the only one of the four about something nobody had measured and is CONFIRMED with its SCOPE narrowed, because the two legs are unreachable for DIFFERENT reasons and only one is structurally so. **All 156 probes RE-RUN at the retro on the shipped tree — 116 caught, 36 declared ceilings RUN, ZERO undeclared survivors, ZERO crashes, ZERO timeouts, ZERO aborts, ONE against declaration**, digest identical at both ends of all three sets; the one is `z1` again, the catch W81 recorded INSIDE the plan, so the yield of NEW catches is **ZERO for the third plan running**. **Readers six passes, none empty, overlaps 2, 3, 1 — the fiftieth to fifty-second measurements, band unmoved, forty blocking split 17 / 23 — and P21 records something no plan has: the conformity reader's CENTRAL OBLIGATION came back with ZERO disagreements on the VALUES in ALL THREE items** (P18 had one, P19 two). **Late exceptions: zero undeclared in any of the three.** Census **CONFIRMED for the TWENTY-THIRD plan running — 265 / 206 / 2 / 57**, and [Q142](open-questions.md) did not fire in any item. **W83 CLOSED unissued, Q344 SPENT, ADR 0061 SKIPPED. The next plan starts at W84, Q345 and ADR 0062.**

**[W82](work-items/w82-a-result-its-own-schema-refuses-on-real-workers.md) is DONE, it takes NO ADR, and it is P21's EXIT ARTIFACT — so P21 is COMPLETE pending its retro. L6 is 1724 assertions over 58 real runs in BOTH runtimes**, from 1639 / 55. **The item had to CONSTRUCT its own case and fact 3 is why**: re-taken at its declaration step the corpus reports **0 violating results over 93 settled `done` across NINETEEN flows**, where the plan measured 0 of 5. So `examples/workers/gauge.ts` declares a bound its own code does not keep past its declared example — Q302's arithmetic rebuilt, `load = words / 10` against `maximum: 1` — and `examples/workers/stamp.ts` **has no bug at all**: it attaches `label` with `Object.defineProperty` so it stays out of the serialised payload, which keeps it out of `structuredClone` too, so what `run()` returns CONFORMS (`required` is `hasOwnProperty`) and what `OR-R2`'s clone writes does not. **Both are GREEN at `check:workers` and every arc of the flow is `fits` at `checkWiring`** — and they are green with each defect REMOVED as well (`a5` costs 5 at L6 and `a6` costs 17, both with `check:workers` unmoved), so *the reach is measured from both sides: the corpus check cannot see either defect arriving OR leaving.* **THREE observers of one fact and the middle one is the RECORD** — the scheduler's live `detail.result` at the harness's own listener still carries the key, the record does not, the finding says `$.label required` — which is why `StampWorker` is INLINE **and must be**: measured at both pool modes, the finding is reported either way and *a thread hides the ATTRIBUTION and not the finding*, which is `tally.ts`'s constraint for the same reason one rule across. **The two-word control is what makes `gauge`'s finding a function of the DATA rather than of the node**, and `attest` reports the key set it RECEIVED, so ADR 0060's declared COST — a value that fails its schema still flows downstream — is an assertion rather than a sentence. **The check-OFF pair is decision 3 on real workers**: the same row run again with the one option removed and the same run id, identical dispatched ids, log record for record and every settled result, **with the reports the one thing they differ in** — and its cost is asserted as a COUNT and PRINTED as a ratio (0.25x / 0.37x in node against 0.18x / 0.19x in deno over the rung's 204 settled results, which is decision 5's own argument in one line). **AGENTS.md gains section 16 and README.md a fourth `X8`-paired fence**; `RUN_FLOOR` 27 → 28, `check:docs` **34 snippets: 28 run, 6 check**, `check:workers` **16 / 16 / 2**, L1-L5 **UNMOVED at 46 / 1295** in three runtimes, `check:spec` **UNMOVED at 7 / 61 / 108**. **Its adequacy reader's central finding is that EVERY OBSERVER OF THE REPORT WAS DOWNSTREAM OF THE REPORT**: the row's literal, the per-id text and the log-derived walk all read `report.nonconforming` on the actual side, so pointing each at it in one commit left all three vacuous **with every declared control green** — the walk's control became *the report is non-empty*, exactly as true as before — after which **a driver reporting `$.NOTHING garbled` for every settlement left L6 at 1720, 0 failed**. *Obligation (c)'s LIMIT one layer out: three expressions over ONE value.* What refuses it is a relation the LOG has and the report does not — **the walk reaches the CONFORMING settlements** ([Q340](open-questions.md)). Its conformity reader's central obligation came back with **ZERO disagreements on the VALUES**, every finding, id, `nodeResults` entry and the whole `+15 / 1720 / 58` arithmetic derived on paper first; what it found were CLAIMS — `AGENTS.md` §9 saying a run never checks what a worker returns **four sections above the section teaching that it does**, a FOURTH standing copy of the withdrawn *rather than carrying it downstream* in the plan's own Exit-artifact line (which this item's finding 3 had declared correct after reading only the line above it), and a paragraph headed *Measured on the tree this item ships* false in four numbers. **Readers 16 / 6 blocking and 17 configurations / 13 green / 9 findings / 6 blocking, overlap 1 — the FIFTY-SECOND measurement.** Rule 8 final **52 probes, 39 caught, 12 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, digest identical at both ends, with all TEN reader edits checked in — and the author pass corrected itself four times first, including **a binding that did not bind** (the pair kept two projections per arm, so re-sourcing one left the control reading the real run) and **a ceiling bought by a CRASH** (`b6b` fired on `found[0]!` of an empty array; `X4` refuses `if (false)` BY NAME, so the tautology is `x !== x` — [Q341](open-questions.md)). **THREE of the five exceptions it needed were UNPREDICTED and one that was predicted did not fire**, and all three unpredicted ones are one shape: **a corpus census pinned as a LITERAL in a file that is not the corpus** — `check-workers-selftest.mjs`'s tally regex took a GATE ENTRY red while `check:workers` stayed green, *the count living in the GRADING and not in the check* ([Q342](open-questions.md)). Q340-Q343 raised, **Q344 spent, ADR 0061 SKIPPED**; census **265 / 207 / 2 / 56** — and the register's headline had been **stale at 256 / 199 / 2 / 55 through the whole of W81**, while a parser written from scratch was wrong in a fourth direction nobody had recorded: [Q87](open-questions.md)'s row spans five lines, so a filter requiring one line to open AND close **dropped** it and the census read 260 with **zero aborts** — *a parser that aborts on what it cannot classify does not abort on what it never SEES* ([Q343](open-questions.md)). *Read every status from the item's own file, never from this line.*

**[W81](work-items/w81-what-a-settlement-costs.md) is DONE, it takes NO ADR, and [Q320](open-questions.md) is RESOLVED: the always-on handle costs **exactly one more `structuredClone` per settled task** — one more copy of everything `OR-R2` already copies, a ratio of **1.00x by construction** — and **a consumer CAN decline it**, by building the `Driver` from `runtime.registry`, which is P18 decision 14's own sentence executed.** `examples/settlement-cost.ts` is the measurement, on `examples/retention.ts`'s precedent: checked in, runnable in **both runtimes**, and deliberately **NOT a gate entry** — *a cost is a property of a machine*, so a rung over one would be a ratchet on hardware. **L1-L5 46 files / 1295 cases in three runtimes** from 45 / 1290; **L6 UNMOVED at 1639 / 55** in both, which is the declared result; `check:spec` **7 / 61 / 108** unmoved. **P21 prediction 4 is NEITHER, and it is the SECOND occurrence of [Q326](open-questions.md)'s class**: in COUNT Q320 bites at every shape including the smallest fact 2 measured, so *does not bite* is false; in TIME it does not bite even at **24.0 MiB of settled results**, where three back-to-back passes of one row read 1.05x, 1.26x and 1.17x — a spread as large as the effect; and *needs a shape built for it* is false twice, because `map-alias` reaches megabyte RESULTS through its own DATA and reaching them does not make the effect visible on a clock. **So stop-and-ask (c)'s permission to add a worker returning megabytes was granted and UNUSED.** **Three blocks, and two of them are CLOCK-FREE** — the check's price as a ratio on BOTH axes with only its DIRECTION asserted, the handle's as a COUNT, and the switch's as a count of how many times the driver reads a worker's `outputSchema`, which is **the only observable a check whose answer is discarded has**. That last is what makes **W80's dated ceiling `z1` a CATCH** at both rungs, exactly where its reason said it would be; W80's other **ten** ceilings were re-run here and all ten hold. **The departure is recorded rather than hidden**: P21 decision 5 says every cost is a RATIO, and *a ratio of two clocks is still two clocks* — the same values on one tree read **58% to 95%** over eight readings and 15-25% in node against 27-40% in deno, so decision 5 is necessary and not sufficient ([Q335](open-questions.md)). **Its conformity reader's central obligation came back with ZERO disagreements on the VALUES** — `findings`' three reads of `schema.type`, all four count columns and every rung's figure derived from the documents and `src/` before any output was read — and what it found instead was that **the clone counter was counting the byte observer's own predecessor**: `driver.snapshot()` clones every result, so called before the count it added *exactly the quantity the block asserts*, and **17% of the printed column was the harness**. *P15's *downstream of the first's apparatus*, in the file whose header cites that clause.* **And the first fix was worse than the defect**: reading the count earlier, compounded with a driver that clones on both roads, came back GREEN — the two defects CANCEL — so the instrument is REMOVED before the log is read, which is a construction rather than a guard. **Its adequacy reader found the check ON was DECORATIVE and the binding written for it VACUOUS** (`0 === 0` on a corpus where nothing fails its schema, closed by a control run whose `tally` schema refuses), that `ARITIES` truncated to ONE value silenced block 3's headline, its v0.21 control AND its proportionality together — *a control fails where two values are EQUAL and could not fail where there is only one* — and that each of the three blocks was deletable on its own at exit 0. Readers **18 / 7 blocking** and **61 mutations / 39 survivors / 16 findings / 6 blocking**, overlap **3** — the **FIFTY-FIRST** measurement, band unmoved. Rule 8 final **51 probes, 36 caught, 14 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, control green and digest identical at both ends, with all eighteen reader edits checked in; the AUTHOR pass corrected itself six times first, including a CRASH where the artifact died on its own truncated declaration instead of reporting. A **PREDICTED-NEEDED** exception was **not** needed (`scripts/build-browser-tests.mjs` — wrong in both directions now across four items). **And the one claim this item WIDENED was put to the maintainer and came back narrower than it shipped.** The Q320 opt-out is `new Driver(flow, { ...runtime.registry, … })`, so the file that prices the two roads has to build one — which `examples/l6.ts`'s *nothing under `examples/` constructs a pool, a scheduler, a `Driver` or a built-in group* forbade. Measured on the shipped tree: with a MARKER alone, W67's adequacy reader's own mutation is still RED when it declares nothing and **GREEN the moment one comment line is typed above it** — *the claim caught the careless and stopped catching the deliberate*, because a marker is permission a file grants itself. The equality is **THREE-way** now — the constructors, the files that declare it, and a literal list in `examples/l6.ts` — so an exemption costs an edit in the file that wants it AND in the file that makes the claim, and it is **P21 decision 8** rather than an assertion's own comment (`doc/workflow.md` section 1 rule 3). Still ONE assertion, so L6 stays at 1639. Q335-Q339 raised, **Q320 RESOLVED**, Q171 extended; census **261 / 203 / 2 / 56**. *Read every status from the item's own file, never from this line.*

**[W80](work-items/w80-what-a-run-time-result-check-is.md) is DONE and [ADR 0060](decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md) answers P21's question at the driver: A RUN-TIME RESULT CHECK IS A READING AND NEVER A REFUSAL, AND THE CALLBACK THAT RECEIVES IT IS THE SWITCH.** `spec/outcome-record.md` is **v0.10** and gains **`OR-R13`** — *not* an `FD-R`, because that prefix is *what a RUN refuses* and this refuses nothing, while section 4's whole subject is `result`. `DriverOptions.onNonconformingResult` is the nineteenth member, **its presence IS the switch with no boolean beside it** (two members are two sources, and both disagreements have names: a switch with no channel is cost paid for a report nobody receives, a channel with the switch off is a typed option silently dropped), and it makes the guard an **L0 assertion** — the callback is read once and handed down as a non-optional parameter, so deleting the condition does not compile. One site, in the settlement path, **AFTER the append**, because before it a throwing callback would delete a settlement from the log — *the behaviour change decision 3 forbids, caused by the reporting machinery itself*. **Both of W76's bindings FIRED BY NAME** when the nineteenth member arrived and the orphan pin moved 18 to 19 deliberately. **L1-L2 45 files / 1290 cases in three runtimes** from 44 / 1269, `check:spec` **7 / 61 / 108**, **L6 UNMOVED at 1639 / 55**, which is the declared result. **P21 prediction 1 REVERSES, measured deliberately because the plan said this item could reverse it by accident**: the clone is linear in the VALUE and the check is linear in the SCHEMA, so their ratio is unbounded in both directions — `enum` is where a schema's size is unbounded, because its membership test canonicalises every entry on every check, and one `enum` of a hundred allowed values is **1.65x** of the clone on a 4 KiB result and **3.08x** on a 0.5 KiB one, while two hundred levels of nested `properties` is **1.44x** and is not the same shape. *Fact 4's conclusion survives with its scope named: the share falls as the VALUE grows and rises as the SCHEMA does*, and the default is unmoved and better argued. **Prediction 3, the REACH, is CONFIRMED and has a SECOND LEG the plan does not name**: the check reads what the RECORD carries, after `OR-R2`'s clone, and `OR-R11` says that is a different value from the one the worker returned — so the same schema applied by `check:workers` and by this check can **disagree**, measured over seven shapes with three disagreeing, and *that half is unreachable by any authoring-time tool for a structural reason: none of them holds a record*. The control row is what makes it a finding rather than a coincidence — a PROTOTYPE getter is invisible to both, because the value check reads OWN keys and never `in`, which is W65's conformity reader's fix closing the gap from the other side before anyone looked for it. **Its conformity reader's central obligation came back with ZERO disagreements on the VALUES** — every finding list, path, walk order and task id re-derived on paper first — and what it found instead was that **the check could STOP the run on two values `OR-R11` calls INTACT**: `enum` and `const` are the only two of ADR 0053's thirteen keywords that call `canonical`, the only expression in the value check that walks the WHOLE VALUE, so a cyclic result or a BigInt threw and `onEvent` stopped the run. *Decision 3's headline invariant broken by the reporting machinery itself, one expression along from the append order the item had already guarded for the same reason.* **Its adequacy reader found that of decision 3's three named consequences, *routes differently* and *changes a terminal state* are bound and *writes a record* was NOT**: the log's records are handed over by reference, so the check could write `attempts = 99` into a record already appended, and the one non-comparative assertion read four fields of eleven. **Three of the pair's five equalities were collapsible to self-comparisons and no identity control can refuse that class here**, because every operand is freshly built — so every clause is now asserted against a LITERAL, for EACH arm. **And THREE declared CONTROLS were FOURTH CLAIMS**, three days after v0.21 adopted the clause that asks for them: asked of the author's own IDENTITY control *what tree makes this fail while its claim passes*, there is none. *Following the clause and asking its question are different acts.* Readers **20 / 4 blocking** and **34 mutations / 21 survivors / 12 blocking**, overlap **2** — the **FIFTIETH** measurement, band unmoved. Rule 8 final **49 probes, 37 caught, 11 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, digest identical at both ends, with all nineteen reader edits checked in — and **a declared ceiling that is a CATCH at 16, moved by the READERS' own coverage** (v0.17's dated-ceiling clause firing inside the item), plus one whose SITE no longer exists because the control it provoked is one the reader showed was entailed. **A PREDICTED-UNNEEDED exception was needed** — `scripts/build-browser-tests.mjs`, three items running after W76 and W77 — and **a test passed in Node and FAILED in Deno on a one-millisecond straddle**. Q330-Q333 raised, Q334 spent, Q302 extended and re-owned; census **256 / 199 / 2 / 55**. *Read every status from the item's own file, never from this line.*

**[P21](plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md) is DECLARED — *what does a run-time schema check buy, and what does it cost against what a settlement already pays?* — and it is P19's slice 1, deferred twice, with **the reason both deferrals gave measured FALSE at the declaration**. P16 called it *strict mode* and put it last; P19 departed on the maintainer's argument that *per-settlement validation is the expensive way to learn it*; P20 deferred it again on *a gap outranks a price*. **Fact 4: a per-settlement `outputSchema` check costs 92.9% / 14.7% / 5.9% of the `structuredClone` the driver already pays unconditionally on the same settlement, and the share FALLS as the workload grows** — the clone is linear in the whole value and the check short-circuits on the schema's shape, so `publish`'s big `joinPayload` is 0.3647 ms to clone and 0.0006 ms to check, a ratio of **0.00x**. *Two plans deferred this as the expensive road.* **And fact 3 says the feature has NO LIVE DEFECT to point at**: Q302's two violations are both closed, one clamped in the worker's code and one refused at `start()` by `FD-R4`, both W73's — so the case must be made on CAPABILITY rather than on a bug, which the plan says at the top. **Fact 1 is the sharpest and it is about the instruments**: the only retention observer this repository has skips `opts` BY NAME, and `opts.onFoldInput`'s closure is the only thing holding the `RunState` ADR 0058 keeps — while `v8.serialize` REFUSES that field outright, so the byte road is closed. **Fact 2**: the always-on handle costs exactly +1 clone per settled task (46→52, 94→106, 414→466) and no measurable time at any shape this corpus can reach, so Q320 is true in COUNT and unshown in COST. **FOUR probes measured the apparatus before one measured the thing** — a payload that left every run `stuck`, a road through `runFlow` which installs its own callback, bytes (which give a clone and an alias the same length), and an identity read confounded by `foldInputs()`'s own clone — and only COUNTING the calls answered it. Three items, serial: **W80** (what the check IS — ADR 0060, opt-in and OFF by default, **REPORTED and never routed**; *this line said *refusing as a TASK failure on W61's precedent*, the claim P21's own commit `c869a4b` WITHDREW — W80's conformity reader, finding 3*), **W81** (the price, both halves, at a shape where Q320 bites), **W82** (the exit artifact: a worker returning a value its own schema refuses, reported by name, in both L6 runtimes). **Reserves W80-W83, Q330-Q344, ADR 0060-0061.** Census CONFIRMED for the TWENTY-SECOND plan running — 252 / 195 / 2 / 55 — and none spent. **Q142 is predicted a COIN FLIP rather than safe**: `M4`'s margin is 31, the exact margin P18's retro fired on. *Read every status from the plan's own file, never from this line.***

**[P20](plans/p20-what-the-runtime-owes-a-consumer.md) is COMPLETE and RETRO'D, `doc/workflow.md` is [v0.21](workflow.md) — ONE change adopted, FIVE refused, and its central finding is that v0.18's CONTROLS clause was FOLLOWED by every item that ever added one and every control it has produced reads the WRONG SIDE of the comparison it guards.** Each such claim is *OBSERVED equals DECLARED, both ways* and each control reads *DECLARED is not empty*, so re-sourcing OBSERVED to DECLARED makes the claim compare a list with itself while the control stays **exactly as true as before** — obligation (c)'s entire probe class, invisible to the mechanism v0.18 added to see it. W78's adequacy reader found all three of its block's controls that way; **the retro then measured W58's and they fall identically**, one of W78's being ENTAILED by its own claim and therefore unable to fire on any tree. **The answer is IDENTITY** — *the two sides are different values* — one expression, zero cost. *Three amendments to one obligation (v0.14, v0.18, v0.21), each the previous one followed and short, and each named a thing to ADD where none named a property the added thing must have* ([Q217](open-questions.md)). **Name the rung: THIRTY-FOUR defects across the items' own lists, SIXTEEN name a rung that FIRED and fifteen of the sixteen were read correctly** — the sixteenth is a browser rung reported green from a grep, which **the GATE caught two steps later**. Eighteen have no rung and **five are in the INSTRUMENTS**, including a harness that produced no verdict at all for two and a half hours and a KILLED harness that kept running and edited the tree under its author's later measurements. **REFUSED, five**: a `doc/` check for the NINETEENTH time — and P20 supplies the first `doc/` claim in twenty plans a check could compare without reading English (ADR 0058's quotation of a sentence W78 deleted), defeated by the corpus, which carries **109 deliberate historical quotations across 52 files** that are correctly absent; an `X7`-shaped clause over the L6 counts, **NAMED for the next plan rather than refused, because neither document that must track them is under `doc/`** ([Q171](open-questions.md)); the dated-ceiling HAND-OFF a THIRD time, now with its best numbers; an `Owns` pre-declaration rule for the EIGHTH plan, with no two items' late files overlapping; and a rule about a killed harness, at one occurrence. **All 92 probes RE-RUN at the retro: 71 caught, 18 declared ceilings, ZERO catches, ZERO undeclared survivors, ZERO crashes, ZERO timeouts, ZERO aborts**, digest identical at both ends of all three sets — zero catches for the second plan running, because each item re-ran its predecessors' sets. **FOUR predictions: 1 CONFIRMED, 2 CONFIRMED with its mechanism narrowed by the item that met it, 3 the REACH REVERSED — and its own stated consequence refused on a measurement, so a reach prediction reversed and STRENGTHENED the decision it was written against — and 4 NEITHER**, true against 26 CODE lines and false against 171 RAW ones, which is a fourth shape: **ambiguous between two observables that disagree** ([Q326](open-questions.md)). **v0.20's tautology clause CONFIRMED and all three authors instantiated it**, every author's coming back a declared ceiling while a reader found the large ones. **v0.16's *RUN, never PIPED* was FOLLOWED and failed anyway** — *redirecting is what makes the exit code available and it does not make anyone read it* — and the counter-measure is recorded rather than ruled. Readers six passes, overlaps **2, 2, 2**, the forty-seventh to forty-ninth measurements, **and P20 adds a shape the number cannot express: two readers who shared a subject and DISAGREED about it**, both right about different halves of one line. Late exceptions 2 / 3 / 1, zero undeclared. Census **CONFIRMED for the TWENTY-FIRST plan running — 252 / 195 / 2 / 55**. **W79 CLOSED unissued, Q328-Q329 SPENT, ADR 0059 SKIPPED; the next plan starts at W80, Q330 and ADR 0060.**

**[P20](plans/p20-what-the-runtime-owes-a-consumer.md) is COMPLETE and RETRO'D, and [W78](work-items/w78-the-run-a-consumer-holds-in-one-line.md) is its EXIT ARTIFACT: the run a consumer holds in ONE LINE, on real workers.** **L6 MOVES — 1639 assertions over 55 real runs in BOTH runtimes**, from 1627 / 53, all of it one CONSUMER-ROAD block outside the row loop in which the consumer holds only what `start` returned. **No ADR.** Run A is a fan-out watched through `StartOptions.onRegionEvent` with the end awaited in one line, and what the callback received is held EQUAL to the region subsequence of the driver's own fold inputs, element for element, on a REAL pool for the first time; run B's driver REFUSES and `done` **RESOLVES** with `stopped` carrying `stoppedBy` — **ADR 0058 rules 3 and 4, which had no observer at L6 and none on real workers anywhere**. **The revert costs the plan had no other way to learn: W76 alone 2, W77 alone 8, both 10**, additive, where each cost ZERO before this block existed. **The thirteen copies are ONE and 135 lines are 16**, and the residue is MEASURED rather than asserted: four sites reduce to nothing but `done`, five keep a callback for a DIFFERENT fact, and one cannot reduce at all because it builds a `Driver` by hand and there is no runtime to keep a fold. **It corrects the plan in FOUR places** — fact 3 MOVED (W77 moved it, the third consecutive item in this plan whose measured input a predecessor moved), **fact 4's HARNESS is broken by W77's own breaking change and exits 1** (Q253's LOUD form against W77's silent one — *a facts harness's prose is what rots and its code is what breaks*), the exit artifact **cannot be an `EXPECTED` row** because `runFlow` IS the machinery it exists not to use, and **prediction 3 REVERSES on six of nine snippets** with its stated consequence refused on a measurement. **Prediction 4's verdict depends on which line count you pick and it names neither**: 119 removed against **26 code** lines added to `src/` HOLDS at 4.6x, against **171 raw** it is FALSE ([Q326](open-questions.md)). Readers **18 / 9 blocking** and **35 mutations / 13 survivors / 7 blocking**, **overlap 2 — the FORTY-NINTH measurement** — and *the two readers DISAGREED about one shared subject*, conformity calling `await person` dangerous and adequacy calling it inert, both right about different halves. **The conformity reader's central obligation came back with ZERO disagreements on the VALUES**, every region event, outcome, `stoppedBy` prefix, licensing rule and the assertion arithmetic re-derived on paper first, and it rebuilt the W76 tree to confirm finding A. **The sharpest single finding was ONE EXPRESSION reached from both ends**: `stateA: settledA ?? foldedA`, a reporting convenience that handed two clauses the caller's own fold, which is W77's adequacy reader's shape reintroduced one item later by the author who had read it — it took the W77 revert from 4 to 8. **And a CONTROL that guards EMPTINESS does not guard VACUITY**: all three of this block's controls fell to the reader's test, because a re-sourced list is exactly as non-empty as the one it came from, and one was ENTAILED by its own claim — v0.18's clause followed and short for the third and fourth time. Replaced by IDENTITY controls. Rule 8 final **33 probes, 20 caught, 12 declared ceilings RUN, 0 undeclared survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, all NINE reader edits checked in, digest identical at both ends; **W76's 25 and W77's 34 probes RE-RUN here — 23 + 28 caught, ZERO catches**. Q324-Q327 raised, Q328-Q329 spent, ADR 0059 skipped; census **252 / 195 / 2 / 55**. *Read every status from the item's own file, never from this line.*

**[P20](plans/p20-what-the-runtime-owes-a-consumer.md) answered *what does the runtime owe a consumer that the driver does not?* in three items, all DONE and RETRO'D.** **[W77](work-items/w77-what-start-returns.md) takes [ADR 0058](decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md) and the package is `0.3.0`, BREAKING**: `runtime.start` returns `{ driver, done }`, `done` RESOLVES with the terminal `RunState` and never rejects, there is no deadline, and the mechanism is ONE `RunState` `step`ped per fold input under `RN-R2`. **Stop-and-ask (c) REVERSED the plan's lean on a measurement** — the reject road killed a child process at exit 1 on an error the consumer had correctly caught, because `start` reports AND rethrows so the caller never receives the handle. **Its conformity reader found the retention comparison DOUBLE-COUNTING** — *half* is really *about the same* — and **its adequacy reader falsified P20 decision 2's own named sentence**, reimplementing `isTerminal` in the runtime for ZERO. **`RunHandle` shipped declared and unexported, and binding the list found two more, the third being `BootstrapRegistry`, the first parameter type of `bootstrap` itself.** Readers 11 / 6 and 48 / 25 / 4, overlap 2 — the FORTY-EIGHTH measurement; rule 8 final 34 / 28 / 5 ceilings / 0 undeclared; L6 UNMOVED at 1627 / 53; census 248 / 191 / 2 / 55. *Read every status from the item's own file, never from this line.* **[Q297](open-questions.md) is RESOLVED**: `onRegionEvent` is forwarded, the `Pick` and `start`'s conditional spreads are bound BOTH WAYS by a test that reads the shipped source, and the orphan count of fact 1's partition is ZERO. **It corrects the plan in three places**, the sharpest being that **fact 1's table is not a partition at all** — `2 / 6 / 6 / 7` is 21 slots over 18 members, because road (c) was read off `RuntimeOptions`' declaration and four of its six are not `DriverOptions` members; derived from what `start` forwards it is `2 / 6 / 2 / 7 = 17`, with `onRegionEvent` the eighteenth ([Q316](open-questions.md)). Its adequacy reader found the forwarding bound at **exactly one topology** — narrowable by variant, by depth and by region kind for zero — and the answer taken is an EQUALITY rather than more shapes: **what `onRegionEvent` receives IS the region subsequence of what `onFoldInput` receives**, total over all three. *Read every status from the item's own file, never from this line.* It takes [Q293](open-questions.md) and [Q297](open-questions.md) together, the two rows where a consumer on the road `AGENTS.md` recommends cannot do something they would ordinarily want, **and both were raised by items standing on that surface while doing something else** ([W69](work-items/w69-a-getting-started-example-a-consumer-can-copy.md) and [W71](work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md)) — the signature of a layer no plan has aimed at, which `createRuntime` literally is. Three items, serial: **W76** (what `start` ACCEPTS — `onRegionEvent` forwarded, the two lists bound, no ADR), **W77** (what `start` RETURNS — a completion handle the RUNTIME keeps, **ADR 0058**), **W78** (the exit artifact: one L6 row where the consumer holds only what `start` returned). **Reserves W76-W79, Q315-Q329, ADR 0058-0059.**

**The framing was the maintainer's and it was CHECKED rather than inherited, which is what makes it one question.** *"What does a consumer hold after `start()`?"* covers Q293 and not Q297 — a callback passed IN is not something you hold — so taken at face value the plan is Q293 with a chore stapled on. **Fact 1 is what joins them**: `DriverOptions` has **eighteen** members, a `createRuntime` consumer reaches them by exactly four roads (2 supplied / 6 `RuntimeRegistry` / 6 `RuntimeOptions` / 7 `StartOptions`), and **the partition is clean — zero on two roads, exactly ONE on none.** So the subject is *what the seam passes through and what it owes*, and the two rows are that question's two answers, **different in kind**: Q297 is a **pass-through the seam dropped** (the driver already produces region events and already freezes them), Q293 is a **composition only the seam can do** ([ADR 0014](decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) forbids the driver subscribing to itself, so the runtime is the only thing that can offer a completion promise without reopening it). *A plan whose question has two answers of different kinds is a plan; one whose question has the same answer twice is an item.* **And Q297 alone would not have been a plan** — two lines in `src/` — which the plan says plainly.

**Six facts measured before declaring**, in `dev-dist/p20/`, the tree held still at digest `e3f998edc43e0498` over 360 files at both ends. **The sharpest is that Q293's own stated case AGAINST is measured FALSE on a real `FyflowScheduler`**: the row argues a promise gains nothing because `start` starts inside the call, and measured, exactly ONE fold input arrives before `start` returns (W67's number, reproduced) while **a `.then` attached fifty macrotask turns after the run was over still receives `completed`** — a promise RETAINS its resolution, so the window is precisely what a promise is immune to. [Q289](open-questions.md) is about a CLOSURE needing the driver and stays open. **And *eight lines* is THIRTEEN copies and 135 lines in THREE disagreeing shapes** — ten with the `queueMicrotask` guard and no deadline, two with a deadline and no microtask, **exactly one with both** — while the reference's own prose calls the microtask *"load-bearing rather than decoration"*. **The half-fix for Q297 is FREE** (the `Pick` widened without the forwarding line is green on all five typecheckers, `npm test`, `check:source` and `check:docs`) and **the whole fix turns `check:docs` RED**, on a tripwire §10 set on purpose. `{ driver, done }` costs **30 typecheck errors in 2 files**; `Driver & { done }` costs **ZERO**. A parked run is `awaiting_action`, **not terminal**, so a terminality-waiting `done` never settles until a person resolves it — the sharpest stop-and-ask. **The declaration also records that its own fact 5 was wrong TWICE before it was right**: once measuring the probe rather than the consumers, once reading ONE typechecker's answer as the tree's, because `npm run typecheck` is five lanes chained by `&&` — *a chained rung reported RED reports its FIRST failure and is silent about everything downstream.* **It DEPARTS from P19's *slices beyond* and says so**, on P19's own precedent: slice 2's condition did not fire (prediction 3 UNTOUCHED) and slice 1 is deferred rather than displaced, because *a gap outranks a price*. Census **CONFIRMED for the TWENTIETH plan running — 241 / 185 / 2 / 54**, none spent; [Q142](open-questions.md) predicted NOT to fire with six files of `M3` margin, measured before the record step. *Read every status from the plan's own file, never from this line.*

**[P19](plans/p19-what-a-schema-buys-an-author.md) is COMPLETE and RETRO'D, and `doc/workflow.md` is [v0.20](workflow.md) — ONE change adopted, FIVE refused, and its central finding is that the plan's own EXIT ARTIFACT, an authoring session `npm run gate` EXECUTES, can have every one of its eight claims made a TAUTOLOGY at `check:docs` exit 0.** Re-measured at the retro on the tree that ships: eight guards neutralised in `AGENTS.md` and in `README.md`, **`check:docs` EXIT=0**, all eight checks `ok`, **27 `run` snippets** counted. **THE ONE CHANGE: rule 8 obligation (b) gains that where an `Outputs` row IS an assertion, the set makes each of its claims a TAUTOLOGY rather than deleting it** — deleting is the direction an author takes because `X4` and `RUN_FLOOR` catch it, and `X4`'s *asserts something* is measured as **contains a `throw`**, a presence test by construction. It is **section 5 rule 3 made provocable**, as v0.8 made rule 4 provocable as obligation (c), and **P3's criterion running out**: a claim moved into an executed assertion is bound by that assertion's presence and by nothing else ([Q310](open-questions.md)). **Name the rung, and P19 splits into two populations: THIRTY-TWO BLOCKING findings across the six reader passes — 12 conformity, 20 adequacy, one subject shared — and EXACTLY ONE names a rung.** That rung **FIRED on the shipped tree and the author did not read it** — `check:docs:selftest`, a gate entry, exits 1 because the *unclosed fence* probe now deletes the LAST fence in the reference, which is section 15's, so it trips `[X1,X8]` against its declared `[X1]`; W74's own table predicted it unmoved *"to be measured at the build"* without taking the measurement. The other thirty-one have no rung and **EIGHT were found at a DECLARATION STEP**. **The items' own *What broke* lists are thirty-two MORE entries and those are the healthy half — TWENTY-ONE name a rung that fired, twenty read correctly**; eleven have no rung and EIGHT of those are in the INSTRUMENTS. **REFUSED, five**: a `doc/` check for the EIGHTEENTH time, on the first instance machine-comparable in PRINCIPLE that a check would still have PASSED (W74's fact D was wrong from a harness RUN TWICE with different options, not from two outputs never compared); the dated-ceiling HAND-OFF a second time; an `Owns` pre-declaration rule for the SEVENTH plan, the first on which naming the three files would have been wrong on EVERY item; `PAGE ERROR` as a fourth secondary signal; and a rule for [Q272](open-questions.md) at eight instances. **All 24 ceilings RE-RUN, ZERO catches** — two of W72's aborted because W73 moved the values they anchor on, re-anchored and both holding. **Rule 8: 243 provocations, 214 caught, 24 ceilings, 0 undeclared, 0 crashes, 0 against declaration, 10 aborts all rule 7 (b).** **v0.19's environment clause CONFIRMED and it fired on the RETRO's own shell**; v0.17's enumeration clause fired in all three items and a READER instantiated it every time. Readers six passes, overlaps 1, 1, 1, and **two of the plan's sharpest findings came from a reader with NO MUTATION AT ALL**. Census **241 / 185 / 2 / 54** for the NINETEENTH plan; the retro raises no question. **W75 closed unissued; Q308-Q309 and Q313-Q314 spent; ADR 0057 skipped. The next plan starts at W76, Q315 and ADR 0058.**

**[W74](work-items/w74-the-assists-and-the-exit-artifact.md) is DONE and it is P19's EXIT ARTIFACT — an AUTHORING SESSION a human can watch, executed by the gate.** `src/definition/assist.ts` is a root export beside `checkWiring`: `pathsOf` (every path a value may carry, and whether it is GUARANTEED), `tryTransform` (the sample-and-diff loop, a SUBSTITUTION over `checkWiring` so the per-item road W73's reader found is inherited rather than reimplemented) and `signatureOf` (the TypeScript a worker's author writes against, as text, no dependency). `AGENTS.md` **section 15** runs the whole session — a miswire the check names before anything runs, the producer's paths, a transform that FAILS on its declared example, ONE expression edit that passes, the generated signature, and the run completing at `{ words: 3 }` — and `README.md` carries it byte-equal as its third snippet under `X8`. **Three stop-and-asks, all answered as recommended; ADR 0057 NOT taken.** L1-L5 **44 / 1234 in five runtimes**; **L6 UNMOVED at 1627 / 53**; `spec/` **UNMOVED at 7 / 61 / 107, C4 at 34**. **Two declaration facts are about what the plan's own corpus cannot do**: the enumerator must accept a schema `schemaProblem` REFUSES, because the map record the check derives is the shape a join successor's author most needs; and **`echo`, the consumer of both transformed arcs in the L6 corpus, refuses 0 of 9 probe values**, so a typo in that flow's shipped transform still reads `transform-passes` and the session had to bring its own workers. *A loop's discriminating power belongs to the consumer.* **Readers 15 / 4 blocking and 39 mutations + 5 by construction / 14 real / 5 blocking, overlap 1 — the forty-sixth measurement** — the conformity reader's central obligation EMPTY on the values (every path, verdict, signature and the run derived on paper first, zero disagreements) and what it found instead was **a RED GATE ENTRY** (`check:docs:selftest`'s *unclosed fence* probe now trips `[X1,X8]`, because the last fence in the reference is section 15's) and **a measurement stated BACKWARDS in four places, one of them a priced reason in a stop-and-ask** — the generator harness run twice, once configured to CLOSE what a schema leaves open, the later run's line count kept beside the earlier run's conclusion. Both readers found `pathsOf`'s bare `in` independently, which is the overlap. Rule 8 final **74 probes, 65 caught, 8 declared ceilings each RUN, 0 undeclared, 0 crashes, 0 against declaration**. Q310-Q312 raised; census **241 / 185 / 2 / 54**.

**[W73](work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md) is DONE — P19's second item, the WIRING CHECK, no ADR: `checkWiring(registry, flow)` gives EVERY ARC of a flow one of five verdicts over five shapes of *what a node receives*** — an edge, a fan-out branch, a map item, a join's `JP-R12` record, a `needs` composition — `fits`, `no`, `transform-passes`, `transform-fails`, `unchecked`, fact 3's relation promoted verbatim in shape with its one leniency NAMED ([Q305](open-questions.md)); a transformed arc verified by RUNNING the adapter's worker half on the producer's example or witness, the verdict saying which and the arity; a join successor answered from what the check KNOWS, because the subset cannot say `additionalProperties: <schema>` ([Q306](open-questions.md)). **`FD-R4`** (`spec/flow-definition.md` v0.21): the entry payload at `start()` and a person's resolution at `resolve()` held to the worker's schemas ONCE each, as REJECTED COMMANDS — `BoundaryRefused`, the driver unstarted, the task still suspended — ON by default with `validateBoundaries: false` forwarded by the runtime; the maintainer's four stop-and-ask answers each as recommended, ADR 0057 unused. **Fact 3 re-taken over every SHAPE found the shipped L6 corpus miswired NINE ways, seven on the one bound W72's reader dropped** — closed by clamping the producer. A fixture corpus, `spec/examples/wiring/`, one document per verdict, held to section 7 both ways. L1-L5 **43 / 1197** in five runtimes; L6 **1627 / 53** in both. **Its conformity reader found the check THROWING on two documents the validator accepts** (a fan-out in a map branch, a map in a map — Q160's shapes), so P19 prediction 2's *total* held of the corpus and not of the language until a reader re-derived it on paper; **its adequacy reader found `fits` lenient for ZERO five ways** under fact 3's twelve controls and, with no mutation, a map's branch task composing `"."` and transforming it sampled on the whole array — a correct wiring read `transform-fails`. Readers 20 / 5 and 24 / 23 / 18 / 11 plus one constructed, overlap 1, the forty-fifth measurement; rule 8 final 90 / 82 / 7 declared / 0 undeclared; Q305-Q307 raised, Q300 / Q301 resolved, census **238 / 182 / 2 / 54**. *Read every status from the item's own file, never from this line.*

**[W72](work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md) is DONE — P19's first item, the CONTRACT, [ADR 0056](decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md): `examples` joins the built-in subset as its thirteenth keyword and an ANNOTATION** — held to the schema it sits on at construction at every depth (`SchemaRefused` naming the entry, field, index and finding; an empty list refused), read by no value check, OPTIONAL by the maintainer's answer to the item's stop-and-ask with fact 5's witness as the fallback and the verdict naming the road. Every corpus worker declares `inputSchema` and `outputSchema` with an example each, and **`npm run check:workers` is the eighth gate entry** — fourteen workers RUN on their declared examples in 0.2 s, twelve output schemas confirmed, two NOT CHECKED by name, red on P19 fact 6's wrong `echo` schema as its self-test's first probe (24 / 9). `spec/flow-definition.md` v0.20 with no `FD-V` added; L1-L5 **41 / 1119** in five runtimes; L6 **1611 / 53** in both. **Both readers RAN 2026-09-18 — 11 / 3 and 71 / 40 / 28 / 3, overlap 1, the forty-fourth measurement**: the conformity reader's central obligation came back empty on the mechanism and found two output-schema BOUNDS the workers' code does not keep past the example ([Q302](open-questions.md)), and the adequacy reader found the check's verdict was decoration and its gate configuration unobserved — every finding closed, thirty of their edits checked in as probes; rule 8 final 79 / 67 caught / 9 declared / 0 undeclared. Q300-Q302 raised.

**[W70](work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) is DONE — a flow that DECIDES on the runtime, and a custom group TYPE: `AGENTS.md` §5 gains decision + fan-out + join on `createRuntime` (two runs, two roads, `JP-R12`'s record read off `publish`), §12 gains a group factory with ADR 0055's six members counting its own acquisitions, `README.md` carries the routing snippet as its second, and `X8` is generalised to every README fence by a declared heading list, both ways. Built and gated 2026-09-17 — `check:docs` 32 / 26, self-test 33 / 33, L6 UNMOVED at 1610 / 53 — and **BOTH READER PASSES RUN the same day**: 10 / 3 blocking and 15 mutations / 11 survivors, overlap 0, the FORTY-SECOND measurement, its conformity reader's central obligation EMPTY too. Its rule-8 set caught its own `d2` against declaration and corrected W69's Record: a re-tag is caught by `X2`, not by `X8`; a DELETED fence is what measures Q102, and `X8` closes it for the README's snippets alone. Raises no question.**

**[W69](work-items/w69-a-getting-started-example-a-consumer-can-copy.md) is DONE — a getting-started example a consumer can copy: `AGENTS.md` §2 is now the P18-shape minimum (one worker file, two documents as literals, one `createRuntime` call), EXECUTED by the gate; `README.md` carries the same snippet held byte-equal by `check-docs`'s new `X8`, both ways; the old §2 program moved under §12 byte-identical. Built and gated 2026-09-17 — L0, `check:docs` (30 / 24, X8 over 56 lines), L6 UNMOVED at 1610 / 53 — and **BOTH READER PASSES RUN the same day**: 10 / 2 blocking and 19 mutations / 11 undeclared survivors, overlap 1, the FORTY-FIRST measurement, with the conformity reader's central obligation coming back EMPTY. Raises Q293. An item outside any plan, on W36/W37's precedent.**

**[P18](plans/p18-a-flow-and-its-runtime-from-documents-alone.md) is COMPLETE and RETRO'D, and `doc/workflow.md` is [v0.19](workflow.md) — ONE change adopted, SIX refused, and its central finding is that v0.17's dated-ceiling clause was followed in the WRITING and not in the RUNNING, by the same item, on the same clause, in the same plan.** [W65](work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) declared two ceilings whose stated reasons NAME the item that would expire them. W67 re-ran one — `b15`, as its own `a11`, saying so in the probe's `why` — and it holds; it did not re-run the other, `e7`, **whose reason is the words *a ceiling with a date***, and re-anchored at this retro that probe is **exit 1 on the `triage LOW` row**. *A clause that tells an author to re-run something tells the author who WROTE the ceiling, not the author who EXPIRES it.* **Forty-six defects. NINE rows name a rung that FIRED and those nine name ELEVEN firings** — two the L6 rung on the migration's own first run, four the source and docs checks (`S3`, `S6`, `S4`, `X4`), two a check's self-test, two L0 and L1, one rule 7 (b) — **and every one was READ correctly; a TENTH row names a rung that did NOT fire, which is the finding above.** Thirty-six have no rung, **seven of those are in the INSTRUMENTS**, and **SIX were found at a DECLARATION STEP — the highest of any plan**: an item re-running the facts it was handed found its own ordering impossible, the plan's group-refusal list wrong in BOTH directions, the plan's own SAMPLE unable to LOAD, its own `Spec` line's premise struck, a blocker the plan did not have, and a number in its own file stale by one item.

**THE ONE CHANGE: rule 8's requirement on the HARNESS gains that it asserts the ENVIRONMENT its rungs need.** Four of W67's probes came back CRASH on a correct tree and correct edits, because the shell had no `fnm use 24` and `npm run test:l6` resolved `node` to 16 — and **a rung that cannot START is indistinguishable in the report from a rung a probe took DOWN**. One occurrence, and the argument is the mechanism: every other requirement on the harness is about a probe that RAN — the control sees what a probe ADDS, the restore what it LEFT, the anchor what it MATCHED, the digest what MOVED — and **none of them can see a constant**. It is P15's *independent excludes downstream of the first's apparatus* one case out. **REFUSED, six, each with a measurement**: a `doc/` check for the SEVENTEENTH time — and this plan is the first to SATISFY the standing refusal's own criterion, since exactly one of its eight stale claims was a number a check could derive from another file and **W65 BUILT that check**, as `X7`, while the three remaining machine-comparable ones are all the REGISTER's and the only thing that can compare them is an untracked census parser ([Q253](open-questions.md), third plan running); a check over a plan's SAMPLE ([Q292](open-questions.md), four defects across three items — a sample cannot be EXECUTED, its `callModel` could not exist, and a typecheck would NOT have caught the parameter property that made it unloadable); a per-case catch in a looping rung, at **three** instances and its second refusal; a rule that a Gate line's claims are INSTANTIATED, at three instances, all reader-found and blocking, with nothing in rule 8 reaching a Gate line; a dated ceiling naming its expiring item as a HAND-OFF; and an `Owns` pre-declaration rule for the SEVENTH plan running.

**FOUR of FOUR predictions CONFIRMED — the second plan to record that, after P16, with P17 at three of four in between — and prediction 4 supplies a qualification to P10's reading.** Its reach prediction's measurement was taken **at the declaration**, on the very corpus its own scope column names, so confirming it tested the corpus and not the reach — **which is v0.14's scope column working exactly as adopted**, making a pre-confirmed reach prediction legible as one instead of letting it count as a test. What is genuinely new is prediction 2: **a derived prediction whose WORDING was stronger than any observable** — *byte for byte* met as CANONICAL JSON, because the captured key order is today's object literal's and not a rule's, so *reordered* in its own reversal column is not an observable ([Q284](open-questions.md)) — narrowed by the item that met it rather than by a reader. **v0.18's two changes: both CONFIRMED.** The CONTROLS clause was **followed at the first opportunity and MEASURED** — W67's block names FIVE controls beside its claims, citing the clause in the code twice, and its `d3` probe measures what that buys: four edits and a NAME a reader sees in the diff, where before it was two integers; its limit is a THIRD layer with no membership at all, which the adequacy reader took out for three edits and an integer. The SAME-CLAIM clause was **followed and short a FOURTH time** — W65's Gate line enumerated both shapes of a node type and the class shape reached no driver suite — found the way the clause predicts, by asking what the CLAIM said of the member, and **no extension taken**. **All FOURTEEN ceilings re-run**: every one of W65's six ABORTED on its original anchor (rule 7 (b), because W66 raised `RUN_FLOOR` and W67 rewrote `run-flow.ts` whole) and were re-anchored here with a control; **eleven distinct claims HOLD**, four on re-anchored text, **one is a CATCH**, and **one's SITE no longer exists** — neither confirmed nor falsified, which no clause covers. **Readers six passes, none empty, overlaps 2, 2, 1 — the thirty-eighth to fortieth measurements**, sixty-one blocking, split 29 conformity / 32 adequacy; W67's conformity reader re-derived every expected value of both exit-artifact rows on paper and came back with **zero disagreements**. **Rule 8 across the plan: 219 provocations on the final passes, 192 caught, 14 declared ceilings, 12 measurements, 0 undeclared survivors, 0 crashes, 0 against declaration, 1 abort re-anchored and caught** — and the AUTHOR passes read **fourteen undeclared survivors themselves**, seven of W67's closed in the product. **Late exceptions 10, 10, 1 — twenty-one, zero undeclared** and a TWENTY-SECOND for the retro itself, because **[Q142](open-questions.md) FIRED in this retro's own confirming gate on a tree to which it had added NO DOCUMENT**: the plan predicted and paid the FILE half (`M3` 90 -> 107) and left the LINK half, where the margin was **31 links** at W67's close, and the record step's six index paragraphs wrote 35 more into files neither `removes` probe cuts — `GATE EXIT=1` with ZERO FAIL lines in the LAST of twenty-nine chain entries. `M4` retuned **3960 -> 4450**, the ninth retune and the second consecutive one found by the gate. The seeded table predicted eight rows correctly and missed twenty-one, not one of which was predictable from a file SET. **Census CONFIRMED for the EIGHTEENTH plan running — 230 / 176 / 2 / 52, 230 of 230 in exactly one cluster cell** — by a parser written from scratch that was wrong in three directions first and whose two clean findings are corrected in the register: the headline stale by THIRTEEN through the whole plan, **Q289-Q292 in no cluster cell**, and **[Q206](open-questions.md) resolved with no Resolved-table row** since W49 in P14. **W68 CLOSED unissued, Q278-Q292 all used and none spent, ADR 0053-0055 all taken. The next plan WAS to start at W72, Q300 and ADR 0056 as *P19, strict mode* — **and it has: [P19](plans/p19-what-a-schema-buys-an-author.md) is DECLARED under a different name, below.** *(This read **W71, Q297** until 2026-09-17, when [W71](work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md) took the id and spent Q297 — the THIRD consecutive day this sentence has been falsified by the item that expired it, after W69 and W70 did the same. Three items outside any plan, three corrections, and the item that made this one wrote the claim that it had corrected it BEFORE doing so: its conformity reader found all five copies standing, one of them in a file the item had edited in the same commit.)*** *(This read **W69, Q293** until 2026-09-17, when [W69](work-items/w69-a-getting-started-example-a-consumer-can-copy.md) — an item belonging to no plan — took both ids: a claim with an expiry date, falsified by the item that expired it and corrected by that item, found by grepping the tree for its own id.)* *(And **W70, Q294** until 2026-09-17 too, when [W70](work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md) took W70 and reserved Q294-Q296 without using them — the same sentence falsified on two consecutive days by two items outside any plan, corrected both times by the grep section 1 rule 5 prescribes.)*

**[W67](work-items/w67-a-flow-from-documents-on-real-workers.md) is DONE and it is P18's EXIT ARTIFACT: a flow and the runtime it needs, from TWO JSON DOCUMENTS and a shim, on a real `FyflowScheduler` in both L6 runtimes.** `examples/registry.json` says what exists — **fourteen worker MODULES** where there was one file with a twelve-arm `role` switch, five resource groups, fifteen node types, one NAMED pool instance, three predicate names and one language — `examples/flows/triage.flow.json` names registry keys and nothing else, and `examples/run-flow.ts` is a SHIM: `createRuntime` once, the four things P18 decision 7 keeps as code, and observers. **No `pool()` call, no group built by hand, no `Driver` built by hand, and no role switch**, and the binding that replaced `ROLES` is the document's worker keys against the modules ON DISK, both ways. L6 is **1610 assertions over 53 real runs** in both runtimes, from 1502 / 50; L1-L5 **41 / 1112 in five runtimes**; `spec/` unmoved at **7 / 55 / 106 with `C4` at 34**, which is what an exit artifact's must be. **Its declaration step found FOUR things wrong with P18's own sample** — W66 recorded three, and the fourth is that its `DailyBudgetGroup` uses a constructor PARAMETER PROPERTY, which Node 24 refuses at load, so **the sample does not run** ([Q292](open-questions.md)) — **and one blocker the plan did not have**: a registry document could not declare a group only NODES name, because `createRuntime` handed every declared group to `bootstrap`, whose direction-two refusal is right for a helper taking objects and wrong for a document declaring the SET `FD-V31` reads. Measured, put to the maintainer, fixed with direction one untouched ([Q291](open-questions.md)). **[Q279](open-questions.md) is RESOLVED**: both manifests read **`0.2.0`** and `README.md` names the breaking change. **The two `triage` rows carry every shape the artifact names, each read from the RUN**: a DOCUMENT type and a CLASS type over ONE worker; a node on its type's DEFAULT instance and one on a NAMED instance of that type, told apart by the pool the scheduler says each ran on AND by what the worker returned; a built-in group and a custom one; the type's `settings` default reaching one and not the other; a declared transform reducing `JP-R12`'s record with no reshaping node. **Reverting each item at L6: W65 309, W66 1, W67 1**, and W66's group-member check removed costs **0** — a refusal with no live case, recorded. **Readers 14 / 7 blocking and 16 mutations / 9 survivors / 7 blocking, overlap 1 — the FORTIETH measurement**: the conformity reader re-derived every expected value of both rows on paper and found **zero disagreements**, and then found the claims — a count stale by two, *thirteen node types* where the document declares fifteen, and **`run-flow.ts` saying every non-threaded row runs the document AS IT IS ON DISK when it does not**; the adequacy reader found bounds that were not there, every one in a direction the author's 45 probes never took, including **Outputs (1) held by nothing anywhere** (`S16`'s scope is the published set) and **decision 10's two defaults reached by nothing** — the plan's own shim is `runtime.start(flow, payload)` with NO options, the one call this rung never made, and it makes it now on `p1-routed-away` at LOW, where *the run completed* IS *the default is `live-token`*. **Rule 8: author pass 45 / 30 caught / TEN undeclared survivors; final pass with the readers' sixteen edits in, 64 probes, 51 caught, 7 declared ceilings each RUN, 0 undeclared, 0 crashes, 0 aborts, 0 against declaration, 6 measured**, the tree held by a content digest — and **a crash is not a detection, in the two blocks added AFTER the guard that says so**. Late exceptions **ONE**, zero undeclared. Census **230 / 176 / 2 / 52**. `npm run gate` **EXIT 0, zero FAIL lines**, digest `37a8669ded4dcdb8` over 328 files before and after. Q289-Q292 raised, Q99 extended. **[W71](work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md) is DONE — the reference stops teaching a FAKE scheduler for a USE CASE.** *(This paragraph said IN REVIEW after the item's own file said DONE, written by the same hand in the same hour — section 1 rule 5's exact case, corrected at P19's declaration.)* Raised by the maintainer on 2026-09-17 while correcting `README.md`'s *the library imports the scheduler nowhere*: an example as a use case should not build a scheduler stub, though a test may. **Measured before and after by the same walk over `AGENTS.md`'s fences: fake-scheduler snippets 7 -> 2, real-scheduler snippets 7 -> 12** — the two that remain are the two put OUT, section 1's non-executing snippet and section 12's *driver with no scheduler at all*, which is the only documentation of the seam a caller passes its own scheduler through. Five snippets converted to `createRuntime` on a real `FyflowScheduler` — the human in the loop, what a join carries downstream, refusals, and both common mistakes — with five new worker modules under `examples/getting-started/`. **Its declaration step justified it better than its argument did**: the parked-task vocabulary is `suspended` and `awaiting_action` and NOT `user_action`, and the author's own first spike polled for the scheduler's word and HUNG FOREVER, which is the mistake the old snippet invited by delivering its own event to a stub it had built. **And the conversion found two things the fake was standing in front of**: `MissingJoinPolicy` is unreachable through `createRuntime`, which always supplies a policy, and `onRegionEvent` was a `Driver` option the runtime did not forward, so a consumer on the recommended road could not subscribe to region events at all — [Q297](open-questions.md), CLOSED by [W76](work-items/w76-what-start-accepts.md) — the snippet could assert it ONLY because it built the driver itself ([Q297](open-questions.md)). *A fake scheduler does not merely fail to prove a claim; it lets the reference demonstrate an API its readers do not have.* Built and gated 2026-09-17 — `check:docs` 32 / 26, L6 UNMOVED at 1610 / 53 — and **both readers RUN 2026-09-18: 8 / 5 blocking and 33 mutations / 15 survivors in 11 findings / 6 blocking, overlap 2, the FORTY-THIRD measurement**, the conformity reader's central obligation EMPTY for the third pass running while its adequacy reader found the class-instance worker need not contain a class, *nothing is reported* a tautology, and the frozen-handles count not a membership. Findings acted on; rule 8 re-run. **An item outside any plan, on W36/W37/W69/W70's precedent.** **[P19](plans/p19-what-a-schema-buys-an-author.md) is DECLARED — *what does a schema buy an author?* — and it DEPARTS from the name P16 gave it.** P16 called it *strict mode*: input and output schemas enforced at run time, a mismatch as a runtime refusal, a driver option priced first. **The maintainer's argument of 2026-09-18 is the reason for the departure and is recorded in the plan**: the schemas were for the AUTHOR — a person or an agent wiring a flow — so a tool can say whether an edge fits, help write the JSONata transform where it does not, and hand a worker's author a typed signature; a runtime failure is a different problem, and per-settlement validation is the expensive way to learn it. Three items, serial: **W72** (the contract — `examples` joins the built-in subset as an ANNOTATION validated at construction, ADR 0056, on input AND output schemas; every corpus worker declares both with an example; a conformance check that RUNS a worker on its input example), **W73** (the wiring check — a verdict per edge, static over the subset, transformed edges verified by running the transform on the producer's example; the two runtime boundaries no static check can reach, the entry payload and a person's resolution, validated ONCE each), **W74** (the assists and the exit artifact — path enumeration, the sample-and-diff loop, a generated-signature recipe, and an AUTHORING SESSION a human can watch). **Reserves W72-W75, Q300-Q314, ADR 0056-0057.** **Six facts measured before declaring**, in `dev-dist/p19/`: twelve honest output schemas for the fourteen corpus workers stay INSIDE the twelve-keyword subset (two workers are undescribable by construction — one throws, one returns a function); the validator's existing value check takes a declared example unchanged; a compatibility relation over the subset is **45 lines and TOTAL**, fourteen corpus edges fitting and **twelve controls, eight negative, every verdict as expected**; `json-schema-to-typescript` compiles all twelve with zero surprises, installed outside the repository with zero links; a sample generator is 28 lines and self-conforming, with its limits stated; **and the author's own schema for one worker was WRONG on the first attempt — a field named `arrays` is a COUNT — while the example written beside it CONFORMED to the wrong schema.** Only running the worker found it. *A schema and its example agreeing proves the schema is self-consistent and says nothing about the worker* — prediction 4 confirmed at the declaration, in the sharper direction, and it is why W72's check executes rather than reads. **Per-settlement result validation is OUT as a default**, a type-level JSONata interpreter stays refused, no runtime dependency, and the subset is the contract language — the enabling constraint that keeps the wiring relation decidable rather than a limitation. Census **232 / 178 / 2 / 52**, none spent by the declaration. *Read every status from the plan's own file, never from this line.* *Read every status from the item's own file, never from this line.*

**[W66](work-items/w66-the-runtime-entry.md) is DONE: `createRuntime(document, code, { base, flows })` builds a runtime from a registry DOCUMENT — groups through factories, one pool per type instance, languages both ways, the driver's registry exposed — and `runtime.start(flow, payload)` returns a started `Driver` with a minted run id.** It lives in `fyflow-orchestration/scheduler` beside `bootstrap` and **there is no `/runtime` sub-path** (P16 decision 5, the maintainer's answer to P18's own stop-and-ask). **Its declaration step found P18 decision 4 wrong in both directions**: measured one omission at a time on a real scheduler, a group with no `getMetrics` — which the plan says to refuse — runs to `done`, while one with no `onStart` throws and one with no `onFinish` leaves every task naming it RUNNING for ever with the scheduler reporting idle, both of which the interface marks optional. [ADR 0055](decisions/0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md) takes the UNION of the two lists and [S10](scheduler-upstream.md) raises the mismatch upstream. **`RT-R13`** (`spec/runtime-targets.md` v0.12) is the rule that replaced the one this item was declared to write, ADR 0053 having struck its premise: only the sub-path that constructs scheduler objects may construct them, checked by **`S16`**. **Both readers found what 34 probes had not**: `runtime.registry` was not the object the runtime hands its drivers — a `Driver` built by hand from it refused a VALID flow — *both ways* was one way for predicates and languages, *L1 on real pools* had every call through a seam, and the source scan this item rewrote (it had blinded `S2`/`S3`/`S4` over 16 137 characters of `driver.ts` through an apostrophe in a template literal) had the same hole one construct over, in a REGEX literal. L1-L5 **41 / 1111 in five runtimes**; L6 **1502 / 50, unmoved** — `examples/**` is W67's; `spec/` **7 / 55 / 106**; `check:source`'s self-test **65 / 65**. **Readers 22 / 10 and 22 / 13, overlap 2 — the thirty-ninth measurement**; rule 8 52 probes, 50 caught, 0 undeclared; ten late exceptions; Q285-Q288 raised; census **226 / 173 / 2 / 51**. `npm run gate` **EXIT 0, zero FAIL lines**, digest `7853dccf53418d37` over 311 files before and after — red once on the first run, on a probe`s declared set this item widened.

**[W65](work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) is DONE and it is the FIRST item to take a name OFF the definition grammar: [ADR 0054](decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md) makes `type` REQUIRED on every task node and RETIRES `workerType`, [ADR 0053](decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md) is the built-in twelve-keyword JSON Schema subset with a keyword outside it REFUSED naming it (Q278), and `spec/flow-definition.md` is v0.19.** The registry is a DOCUMENT — workers with four schemas, node types as DERIVATIONS from an instance's config to pool options (the document form the identity derivation, reproducing P18 fact 5's captured options as canonical JSON with `groups` absent where none is declared; a class any other, both through one check), named pool instances, group types as factories with the scheduler's three built in — resolved by `resolveRegistry(document, code)` into eleven NAMED refusal classes, each with a fixture that trips it and one that does not, and BUILDING NOTHING (construction is W66's). `FD-V5` and `FD-V34` retired and held, `FD-V38` added, **34 refusals**; every task node receives the envelope, `FD-V33` reads the worker's `settingsSchema` over the type's defaults merged under the node's; `Registry.workerTypes` gone. **The corpus migrated — 74 flow documents, 199 sites — and `examples/**` with it**, because the declaration step measured the item's own ordering impossible (24 of 24 L6 flows carried `workerType`; the maintainer's call): thirteen document types over ONE worker, no `pool()` line, every pool through `bootstrap`, L6 **1502 / 50 in both runtimes with the typed rows unmoved** (prediction 2), and reverting the envelope on the bare road costs **114** there. L1-L5 **40 / 1065 in five runtimes**; spec **7 / 55 / 105**. **Its readers found the reach of `checkRegistry` overclaimed in three documents** (it runs the registry's SHAPE half at `new Driver`, six classes of eleven), `in` walking `Object.prototype` in the subset's object keywords, a hand-built driver applying NO schema on a typo'd key (P1, closed in code), no class-form type reaching `new Driver` in any suite, and a count in prose bound by nothing three times — two are checks now (`C4` on the spec's own paragraph, `X7` on AGENTS.md's refusal count). **Readers 26 / 12 and 21 / 16 / 12, overlap 2 — the thirty-eighth measurement**; rule 8 103 probes, 91 caught, 6 declared ceilings each RUN, 5 measured, 0 undeclared, 0 crashes, 0 against declaration on the final pass, 1 abort re-anchored and caught; ten late exceptions, zero undeclared; Q280-Q284 raised, Q217 extended; census **222 / 169 / 2 / 51**, 0 aborts. `npm run gate` **EXIT 0, zero FAIL lines, on the first run over the final tree**, digest `fac808027713cc4d` over 311 files before and after.

**[P17](plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md) is COMPLETE and RETRO'D, and `doc/workflow.md` is [v0.18](workflow.md) — TWO changes adopted, SIX refused, and its central finding is that v0.14's membership clause, FOLLOWED by the item that extended the list, named the claims and not their CONTROLS: a validator accepting every document was green in both L6 runtimes with two counts lowered, and the retro then found the same shape live in W58's block for a whole plan.** Thirty-two defects across the plan; SEVEN had a rung and all seven fired and were read correctly — three of them this document's own instruments (the content digest catching a rung rewriting `deno.lock`, rule 7 (b) on eight moved anchors, the dated-ceiling clause catching two ceilings inside the item that moved their values); eleven of the twenty-five without a rung were in the INSTRUMENTS. **The two changes**: obligation (d)'s membership names the controls beside its claims (two occurrences, two plans apart); obligation (a)'s enumeration is instantiated under the SAME claim on every member (W63 carried `FD-C5`'s first kind only under a failing transform — the third time in two plans the enumeration clause was followed and short). **Refused, six**: a `doc/` check for the SIXTEENTH time (six stale counts this plan, exactly one a check could compare — the register's headline against the census parser's own sum, and the parser is untracked); an `Owns` pre-declaration rule for the sixth plan running, with P16's *seed the table from the previous item's* procedure TRIED once and working (2, 5, 2 late exceptions, zero undeclared); a crash-verdict pattern rule; a declared-value-not-the-default rule; a Scope-against-Outputs check; a restore set covering files a rung rewrites. **Three of four predictions CONFIRMED and the reach prediction REVERSED from the engine's own source**, with prediction 2 holding because its reversal condition was measured TRUE and designed around. **v0.17's three changes all CONFIRMED**: the harness clause exercised eight times with a limit found, the enumeration clause extended, and the dated-ceiling clause firing inside the items — so this retro's re-run of all **forty-six** declared ceilings through each item's own harness found ZERO catches, against P16's two and P13's two. **Rule 8 across the plan: 272 provocations, 214 caught, 46 ceilings all run twice, 9 measurements, 0 undeclared, 0 against declaration on every final pass, 8 aborts re-anchored.** Readers six passes, overlaps 1, 1, 1 — the thirty-fifth to thirty-seventh measurements. Census CONFIRMED for the SEVENTEENTH plan running — 215 / 162 / 2 / 51; the retro raises no question and extends Q253. **W64 CLOSED unissued, Q277 spent, ADR 0051-0052 taken. The next plan starts at W65, Q278 and ADR 0053** — P18, what a node type says about its input and output.

**[W63](work-items/w63-a-transformed-join-on-real-workers.md) is DONE and it is P17's EXIT ARTIFACT.** A typed `map` branch RESHAPES its own item through a declared transform reading `$settings`, two typed scorers arrive at a join, and the join's typed successor declares `transform: { lang: "jsonata", expr: "$sum([*.score])" }` with **no reshaping node**, its worker receiving **990** at arity two, **400** with one branch routed away (P1's case under `live-token`), and **0 — a NUMBER, not `undefined`** — with both routed away and the join fired over `{}`: [Q263](open-questions.md) as three rows on a real `FyflowScheduler` in **both** L6 runtimes, every value what the worker RECEIVED. The `Echo` pool that evaluates the expression is a real thread loading `fyflow-orchestration/jsonata` by URL, and every result it returns says so; every engine-built array arrives plain. **Decision 5 end to end**: two non-optional nodes whose transforms fail (`T2002`, `UNBOUND`) are retried once under the type's policy, parked `user_action` with `TransformFailed`'s message on two observers, resolved by a person, and the run completes — beside an untransformed typed node receiving `FD-C5`'s two keys to the byte and one transforming an ordinary edge's value, the fourth kind. **Reverting each item at L6 on the tree that ships: W61 52, W62 19 (from 0), W63 52.** L6 **1501 / 50** in both runtimes, L1-L5 **38 / 979 in five runtimes unmoved**, spec unmoved, corpus split 16 / 166 / 150. **Readers 7 / 1 and 18 / 8 / 2, overlap 1 — the thirty-seventh measurement**: the conformity reader a README count stale within the hour; the adequacy reader the two CONTROLS of a cross-row block missing from its membership list (a validator accepting everything green in both runtimes at 1498), the thread claim with no observer, `FD-C5`'s first kind with no successful transform, and four L1-owned clauses green at L6. **Rule 8: 82 probes, 1 control green, 62 caught, 13 declared ceilings each RUN, 6 measured, 0 undeclared, 0 crashes, 0 aborts, 0 against declaration on the final pass** — the author pass read two real survivors (a zero-retry declaration inert against the scheduler's zero default, measured; the marker walk's depth with one observer), two crashes and one abort that were the instrument, and one ceiling caught against its declaration. `npm run gate` **EXIT 0, zero FAIL lines, on the first run over the final tree**. Late exceptions two, zero undeclared; Q274-Q276 raised, Q277 spent, no ADR.

**[W62](work-items/w62-the-jsonata-adapter.md) is DONE and [ADR 0052](decisions/0052-a-second-dependency-is-declared-where-its-one-sub-path-is-reached.md) decides how a SECOND dependency is declared when ONE sub-path reaches it: `jsonata` 2.2.2 in `dependencies` at the exact pin — the maintainer's choice, with the optional peer and `optionalDependencies` priced by CONSUMER INSTALLS, because this package's tarball ships no code in any shape and `npm pack` prices only the manifest — and `npm:jsonata@2.2.2` in `deno.json`, because no JSR package carries it; `RT-R12` in `spec/runtime-targets.md` v0.11 with `S14` (the engine reached from `src/jsonata/**` alone, by the bare specifier alone — a root or scheduler-sub-path re-export refused) and `S15` (one declaration, both exports, five adjacent fields refused).** `fyflow-orchestration/jsonata` exports the adapter whose worker half is its own `import.meta.url`; both halves re-throw the engine's PLAIN OBJECTS as `Error`s, and the worker half hands out plain values because JSONata MARKS the arrays it builds with own keys that survive `structuredClone` and fail any deep-equal. **P17 prediction 4 REVERSED**: `$shuffle` draws from `Math.random()`, found in the engine's own bind list and confirmed by a walk over all 63 built-ins; **[Q265](open-questions.md) decided UNBOUND** — five names, by name. **The conformance suite passed on the real adapter with ONE change**, an optional `workerHalf` handle, because inside a browser bundle `import.meta.url` is the bundle itself and six clauses were red in three browsers ([Q261](open-questions.md), the maintainer's choice; W61's Record corrected). Fact 6 re-taken inside the wrapper: threaded, a thousand-branch reduction adds a third to a half of the thread's own clone. L1-L5 **38 / 979 in five runtimes**, L6 **1281 / 46 unmoved** (reverting W62 at L6 costs 0 — W63's number), spec **7 / 55 / 104**, census **212 / 159 / 2 / 51**. **Its readers found THREE and SEVEN blocking, overlap 1 — the thirty-sixth measurement**: the conformity reader a sentence with an expiry date in section 13, the pin literal in section 14 that the spec said was written nowhere, and an undeclared `package-lock.json`; the adequacy reader two of the four carried error fields with no observer, the marker stripping at array-element depth, `S14` weakened to a prefix and two `S15` fields with no probe, **`bundledDependencies: ["jsonata"]` shipping the engine's eight files in the tarball past every check**, and the threaded half of the real-pool suite bound by one expression. **Rule 8: 97 probes, 1 control green, 71 caught, 23 declared ceilings each RUN, 2 measured, 0 undeclared, 0 crashes, 0 against declaration on the final pass** — six aborts across the passes and two ceilings that were catches on the shipping tree, every one an instrument or a value this item moved; the tree MOVED once with no probe reporting it, `deno.lock` rewritten by a probe's `deno check`. **The first gate over the final tree was red on ONE line** — check-scheduler's `D8` probe anchored on a two-line `imports` block the `jsonata` mapping made three, rule 7 (b) on a file in nobody's `Owns`, re-anchored and the gate re-run whole. Late exceptions **five**, zero undeclared. Q270-Q272 raised, Q252 and Q261 extended, Q273 spent.

**[W61](work-items/w61-what-a-transform-is.md) is DONE and [ADR 0051](decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md) answers P17's question at the definition and in the wrapper: A TRANSFORM IS A DECLARED EXPRESSION IN A REGISTERED LANGUAGE, applied in the TYPE's worker wrapper and never in the driver.** `spec/flow-definition.md` is **v0.18**: a typed `task` may carry **`transform: { lang, expr }`**; `Registry.languages` is the fifth set, an adapter `{ compile, worker, check? }` with TWO halves — a synchronous, throwing `compile` on the main thread and a worker-side MODULE URL, because a function in a threaded pool's config *could not be cloned* while a URL crosses (P17 fact 7, re-run); `FD-V35` (unregistered language, the set EMPTY when absent), `FD-V36` (an expression the language's compile refuses, with its message, position and code, at `new Driver`), `FD-V37` (a transform on a node with no type, or not `{ lang, expr }`); **`FD-C6`** for the transformed envelope — `{ settings, input, transform }`, `input` STILL the value received — with `FD-C5`'s row byte-identical. **35 refusals**, spec **7 / 55 / 103**. The envelope worker loads each language's worker half in `setup()`, evaluates in `run()` with `$` the input and `$settings` bound, compiles once per `(lang, expr)` per instance, and hands the inner worker `{ settings, input }` with `input` REPLACED; **`TransformFailed` is a TASK's failure** — `failed` on an optional node, `user_action` on a non-optional one, measured on real inline and threaded pools in both runtimes. The bootstrap helper takes `languages` and `flows` and writes a language's worker URL into a typed pool's config ONLY where a node of the type transforms. **Proved against a FAKE language shipped as a test fixture — no `jsonata` is installed** — through an ADAPTER CONFORMANCE SUITE (seven clauses: the halves agree, every case twice, `$settings` as a pair, the three unbound names BY NAME, `undefined` required not to reject) that W62's JSONata adapter runs as a second implementation of an interface that already has a suite. **P17 prediction 1 CONFIRMED** (0 failures on every existing test; the two P12 flows and `typed.flow.json` dispatch byte-identically with and without `languages`); **prediction 3 CONFIRMED and measured**: the wrapper's evaluation deleted costs **14 at L1, 0 in every L2-L5 suite, 0 at L6**. **Prediction 2's reversal condition was MEASURED REAL and then avoided by the maintainer's choice**: a wrapper whose `setup()` throws leaves the task `pending` with `attempts: 0` forever and the run never hears of it (both runtimes, inline and threaded), so a language module that fails to load is REMEMBERED in `setup()` and thrown from `run()` on exactly the tasks naming that language — one stop-and-ask, three roads priced; the type's INNER worker's `setup()` throw is W59's road and still hangs ([Q266](open-questions.md)). L1-L5 **36 files / 958 cases in five runtimes** (from 32 / 858), L6 **unmoved at 1281 / 46** and reverting W61 whole at L6 costs **0** — W63's number to move from. **Its readers found ONE blocking claim and THREE blocking holes, overlap 1 — the thirty-fifth measurement.** The conformity reader (10 / 1): the spec and ADR said the conformance suite asserts the three unbound names BY NAME and it asserted a count of three. The adequacy reader (66 mutations / 10 survivors / 3 blocking): **the wrapper's memo keyed by expression TEXT alone survived** — a task in one language silently received another language's compiled expression, and the author's own probe had keyed it by LANGUAGE and been caught (W17's finding at its sixth iteration: the hole in the direction the probe did not take); **the real-pool `BACKENDS` narrowed to `inline` with 953 unmoved**, because the browser's parity check forced the backends loop INSIDE a case, which is exactly what a case count cannot see; and `FD-V37`'s *reported alone* had no COUNT observer. All closed; the readers' ten exact edits are probes. **Rule 8: 93 probes: 1 control green, 81 caught, 10 declared ceilings each RUN against its rung, 1 revert measurement, 0 undeclared survivors, 0 crashes, 0 against declaration on the final pass — 1 abort re-anchored and then caught (a13, an anchor the adequacy fix moved) and 1 author probe rewritten (r7, first aimed at the wrong branch)** — and the AUTHOR pass read one CRASH, one ABORT and one UNDECLARED SURVIVOR, two of them the instruments: a probe's `'$'` mangled by `String.replace` ([Q184](open-questions.md)'s shape in a harness copied from W59's), an anchor that could not match because **the file it anchored on carried a NUL byte the author's tool had written — green at every rung, `grep` calling it binary** ([Q267](open-questions.md)), and `spec/README.md`'s HEADLINE refusal count reverted to 32 at `check:spec` exit 0 because `C4` read the last count in the row — closed by a `C4` clause. **Late exceptions two, one cause**: the driver's new field reached the L6 byte walk's both-ways lists in two `examples/` files (W55's universe binding firing on W61 as on W59). **`M4` predicted not to fire and did not.** Census **209 / 156 / 2 / 51**; Q266-Q267 raised, Q184 and Q253 extended, Q268-Q269 spent. **P17's own facts harness went vacuous at exit 0 on this item's first edit to the envelope line** — Q253's shape for the second plan running.

**[P17](plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md) is DECLARED — *what may a node DO to its input before its worker sees it?* — and it is COMPLETE and RETRO'D — its three items done, its retro run 2026-09-15, `doc/workflow.md` at [v0.18](workflow.md).** *(The declaration's paragraph, kept as its record.)* A `transform: { lang, expr }` on a typed task node, applied in the TYPE's worker wrapper and never in the driver (the maintainer's placement of 2026-09-11, not reopened), the language registered by NAME with JSONata the first and only adapter as a sub-path. Three items, serial: [W61](work-items/w61-what-a-transform-is.md) (what a transform is — ADR 0051, proved against a FAKE language), [W62](work-items/w62-the-jsonata-adapter.md) (the JSONata adapter and how a second dependency is declared — ADR 0052 unless folded), [W63](work-items/w63-a-transformed-join-on-real-workers.md) (a typed join successor reducing `JP-R12`'s record with no reshaping node, at arities two, one and zero, in both L6 runtimes — [Q165](open-questions.md)'s refused reducer reached from the successor's side). **Reserves W61-W64, Q263-Q277, ADR 0051-0052.** Nine facts measured before declaring in both runtimes; the two that decide the design are that a function in a threaded pool's config *cannot be cloned* while a URL crosses — so an adapter has two halves — and that a transform's result changes TYPE with the region's arity ([Q263](open-questions.md)). Q263-Q265 raised; census **207 / 154 / 2 / 51**.

**[P16](plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md) is COMPLETE and RETRO'D, and `doc/workflow.md` is [v0.17](workflow.md) — THREE changes adopted, FIVE refused.** Its central finding: a rule 8 harness satisfying EVERY requirement this repository had written for it measured NOTHING on seven probes (W58), and the shapes clause, FOLLOWED deliberately by two items, was one shape short of the rule's own enumeration in both. **(1)** the harness requirement gains PER-EDIT integrity — anchors checked against the CURRENT text, an abort undoing what it applied, a content DIGEST for holding still; **(2)** obligation (a) gains *where a rule ENUMERATES its values, the set is that enumeration*; **(3)** v0.14's ceiling clause gains its DATE — the retro re-ran all twenty-three ceilings on the shipped tree and two of W58's are catches because W59 moved their values, the item that moves a value re-runs the ceiling. Eighteen defects, two with a rung, **both rungs fired and both were READ correctly**. Four of four predictions confirmed, the first plan since P10. Readers 0, 1, 1 (the thirty-second to thirty-fourth measurements); rule 8 240 / 209 / 24 ceilings all run / 0 undeclared; late exceptions 1, 5, 0; census **204 / 151 / 2 / 51** confirmed for the sixteenth plan, no question raised. W60 closed unissued, ADR 0050 skipped; **the next plan starts at W61, Q263 and ADR 0051**, and P16 names its subject — P17, the transform in the envelope worker.

**[W59](work-items/w59-what-a-node-type-is.md) is DONE and [ADR 0049](decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md) answers P16's question — WHAT A NODE TYPE IS: a REGISTRY entry, and the definition stays data.** `spec/flow-definition.md` is **v0.17**: a `task` may name a **`type`** instead of a `workerType` and carry **`settings`**; `Registry.nodeTypes` is the fourth set, each entry `{ worker, pool, groups, config, settings, retryPolicy }` — the settings entry a VALIDATOR function registered as a predicate is, the schema LANGUAGE left to P18; **a type's pool is keyed by its name**; and its worker receives the **envelope `{ settings, input }`**, `FD-C5`, with `input` defined as THE VALUE THIS NODE RECEIVES and never as *what `needs` composed*, so P17's transform sits between composition and the envelope without rewording the rule. `FD-V32`, `FD-V33`, `FD-V34`, `FD-V23` widened; **32 refusals**, spec **7 / 51 / 99**. **The bootstrap helper is a SUB-PATH, `fyflow-orchestration/scheduler`**, exported by both manifests, building one `WorkerManager` per type around the package's ENVELOPE WORKER and refusing the types' groups BOTH WAYS, because the scheduler ignores an unknown group at the POOL level too (measured, both runtimes). **Four stop-and-ask decisions, each measured before the maintainer chose**: `settings`/`input`; an `exports` map; node > type > driver default, whole; and the by-reference road a refused settings value takes to a worker, RECORDED as [Q259](open-questions.md). **A bare `workerType` node is unchanged to the byte.** Prediction 3 CONFIRMED; W60 not issued, ADR 0050 skipped. **Its exit artifact is two rows on real workers in both L6 runtimes — L6 is 1281 assertions over 46 real runs, from 1203 / 44**: two nodes of ONE type with DIFFERENT settings computing 9 and 90 from one input, `high` retrying once under the TYPE's policy and both holding the group the type declares by the scheduler's KEY; and a typed task inside a fanout branch feeding a typed `map` branch at arity three, each instance's envelope wrapping its OWN item, the three inputs asserted distinct from the run. **Reverting each item at L6: W57 88, W58 11, W59 11.** L1-L5 **32 files / 858 cases in five runtimes**; census **204 / 151 / 2 / 51**.

**Its readers found FOUR blocking holes the author's 93 probes never reached, every one a direction rather than a clause**: the helper's group check had no fixture whose map key differed from the group's own name (ADR 0049 fact 2 measured, written, and then unobserved — a helper checking the inert name survived L1 AND L6); **`FD-C5` names FOUR kinds of `input` and the item instantiated three**, a typed join successor handed `{}` costing 0 everywhere — the shapes clause's fourth iteration, ONE SHAPE PAST the three the item chose; the construction loop over types bounded by single-entry fixtures; and ADR 0049 rule 5's *the pure entry does not export the helper* bound by NOTHING, `index.ts` re-exporting the sub-path green at `S7`, L1, lint, five typechecks and the browser bundle. All closed (L1-L5 835 → 858, L6 1280 → 1281). **And a group is acquired once per ADMISSION, not per retry** — measured on a threaded pool with no retry — so [Q262](open-questions.md) was corrected by its own item's reader. The conformity reader (12 / 2 blocking) found `AGENTS.md` section 3 carrying *29 refusals* twelve lines below the table the item rewrote, and `examples/README.md` carrying a number from the hour before the last three assertions landed. **Overlap 1, the thirty-fourth measurement. Rule 8: 103 provocations, 88 caught, 10 declared ceilings each RUN, 0 undeclared, 0 crashes, 0 against declaration** — the author's first pass read one CRASH (a probe dropping `nodeTypes` took L6 down with ZERO FAIL lines; the row loop now fails the row by name) and one AGAINST DECLARATION (two probes re-tagged a snippet rather than deleting it), both the instrument; one abort on the re-run, an anchor the fourth shape had moved, re-anchored and caught. **The harness holds the tree still by a CONTENT DIGEST**, which `git status` cannot. **Six declared exceptions, zero undeclared**; `W59` outside `doc/` 108 hits in 23 files, every one the item's own; [Q142](open-questions.md) predicted and did NOT fire (the fixture 3591 against 3960 on the final tree); `npm run gate` EXIT 0 on the first run over the final tree, digest identical before and after.

**[W58](work-items/w58-what-a-node-says-about-its-own-task.md) is DONE and `spec/flow-definition.md` is v0.16: A `task` NODE SAYS TWO THINGS ABOUT ITS OWN TASK, `retryPolicy` and `workerGroups`, as DECLARED KEYS passed through to the scheduler exactly as `optional` is — [Q16](open-questions.md)'s TASK half, and NO ADR (P16 decision 3 is the decision).** `FD-V30` refuses any `retryPolicy` but the scheduler's own `{ maxRetries, backoffMs }` — an integer >= 0, a finite number >= 0, no other key — and **every clause is a measurement of what the scheduler does with the shape in silence**: `{}` means *no retries*, a string `maxRetries` **retries by coercion**, an extra key is dropped. `FD-V31` refuses a `workerGroups` entry the registry's **third set, `groups`**, does not declare, because a task carrying an unknown group id **runs and settles `done` with no `resource.blocked` and no throw** (P16 fact 2, re-measured with a listener attached — the scheduler emits `resource.*` only once something listens, which its reference does not say: [Q258](open-questions.md)) — and **an ABSENT set means EMPTY**, the maintainer's call with the lenient reading priced. `DriverOptions.defaultRetryPolicy` applies where a node declares none, is held to `FD-V30` at construction, and **the node wins, whole** — and rule 8 found that clause has NO falsifier on any valid document, because `FD-V30` requires both keys, so the spec says so ([Q256](open-questions.md)). **No `defaultWorkerGroups` and W60 not issued**: a task's groups are a UNION with its pool's, measured, so a pool-level default exists upstream where a retry default does not. **A node that declares neither key is dispatched with the exact four-field object it was before**, byte for byte, and every corpus flow validates unchanged. **Three stop-and-ask decisions, each measured on a real scheduler before the maintainer chose.**

**Its exit rows are P16 prediction 2 CONFIRMED and fact 2 answered where it shows.** The retry row is a `map` of three whose branch task declares `maxRetries: 1` on a pool whose role fails every task id's FIRST attempt — three separate budgets from one declared object, the shape the feature was not built for (v0.16's obligation (a)), each instance retried INSIDE its own id and settling `done` with **`attempts: 1` on two observers**, the outcome record and the live task at the harness's own listener; with the passthrough reverted every instance ends `user_action` at 0 and the run suspends (**7 L6 failures**). The group row names a `ConcurrentLimitGroup(1)` the harness holds with the group's own `onStart()` — no foreign task — so the task is `resource.blocked` on dispatch and runs when the slot is given back on that very event; reverted, it runs unblocked with no resource event (**3**). **L1-L5 29 files / 746 cases in five runtimes** (from 27 / 705); **L6 1203 / 44 in both runtimes** (from 1138 / 42, +65, the count matching the arithmetic before the file was run); **spec 7 / 47 / 95**; census **200 / 147 / 2 / 51**.

**Rule 8: 83 provocations, 73 caught, 8 declared ceilings each RUN against its rung, 2 controls, 0 undeclared, 0 aborts — and the HARNESS was the defect TWICE.** The author pass first read 3 undeclared, 2 crashes and 2 against declaration, and five of the seven were `apply()` replacing every edit against the ORIGINAL bytes, so a probe with two edits on one file kept only its last — **W37's harness defect verbatim, inside a harness carrying a control and byte-asserted restores (v0.11's two requirements, satisfied throughout)**. The re-run then read 13 crashes and 4 aborts, and every one was the abort path keeping an edit it had already applied — the held-still `git status` diff blind to a file modified either way. **Readers 12 / 2 blocking and 106 mutations / 16 survivors / 3 blocking, overlap 1 — the thirty-third measurement**, and the split held: the conformity reader found a THIRD present-tense copy of W54's corpus count (`spec/run-state.md`) and a declared *0 hits* that was 6; the adequacy reader found **the item's headline claim unfalsifiable by its own suite** — the three SHAPES a literal list bound by nothing but the printed case count, the map shape deletable for zero with a rule narrowed to the other two — plus the merge pair carried by two literals (W43's shape), `schedulerGroups` with one reading the driver's registry was downstream of (v0.16's *independent*, one item after it was written), and **`defaultRetryPolicy` validated nowhere** while the predicate's own comment said the driver read it. All closed; the readers' eleven exact edits are probes. **Late exceptions FOUR** (`spec/outcome-record.md`, `spec/run-state.md` — the same count twice — `AGENTS.md` §11 and §12), zero undeclared. **Q256-Q258 raised, Q253 extended, Q16 and Q111 corrected without resolving either; W60 not issued.** **[Q142](open-questions.md) FIRED in the final gate, unpredicted for the first time** — the two-directory fixture 3102 → 3532 past `M4`'s 3490, on documents no `removes` probe cuts; retuned to 3960 from a scratch copy, a fifth late exception (`scripts/check-markdown.mjs`).

**[W57](work-items/w57-the-scheduler-is-a-dependency.md) is DONE and [ADR 0048](decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md) supersedes ADR 0013 rules 1, 2 and 6: THE SCHEDULER IS A DECLARED DEPENDENCY, reached by one bare specifier.** `package.json` names `fyflow-scheduler` in `peerDependencies` at EXACTLY the pin — the maintainer's call, both ranges priced with npm 11.19.0: exact and caret behave identically on every version that exists and differ only on versions upstream has not published; `deno.json` maps it to `jsr:@fyflow/scheduler` at the pin and the L6 map stays, because the two coexist and `D8` binds both (**W60 is not issued, ADR 0050 not taken**); `src/driver/driver.ts` imports `FyflowTask` for a DEFAULT `createTask`; `S7` is NARROWED to the FORM of the reach (prediction 4 confirmed — `D1`-`D3` read no source file, so a `../fyflow-scheduler` reach from `src/` was guarded by nothing but the machine's directory layout), `S8` narrowed, `S9` RETIRED, `D8` added, `RT-R11` written. **Q71 RESOLVED — and P16 fact 3's mechanism was FALSE**: an `import type` closes nothing; `SchedulerLike`'s listener parameter is `object`, the one shape of seven that the real class AND the L2-L5 fakes both satisfy in every configuration, and the type import is kept as an L0 assertion under the two typecheckers that carry the DOM lib. `AGENTS.md` section 12's cast paragraph is DELETED and its snippet is a real run on a real scheduler with no `createTask`; `tsconfig.docs.json` carries `DOM`. **L1-L5 27 / 705 in five runtimes** (703 unmoved by the import — prediction 1 confirmed with the scheduler's browser build in the bundle — plus two cases the readers forced); **L6 1138 / 42 in both runtimes, from 1061 — +77 for two observers this item had to ADD, because `FyflowScheduler.addTask` DUCK-TYPES its task**: with the default swapped for `(config) => config`, L6 stayed green — a plain object runs to `done` with `attempts` undefined and `instanceof FyflowTask` false, and the driver's listener normalises `attempts`, so no record could see it. Read from `scheduler.tasks` and from the live task at the harness's own listener, each alone costs **38**.

**Its conformity reader found the ADR's supersession ARGUMENT was a claim about ADR 0013 that ADR 0013 does not make** — rule 1 rests on context fact 4, not fact 1, and 0013 PREDICTS rules 1, 2 and 4 unchanged when the pin reaches a registry; the claim it protected, *a driver that can construct a scheduler is a driver that will*, was answered nowhere. The sentence came from P16 and had been copied into four documents; all four are corrected and the ADR now answers the real ground on ADR 0001's own terms. **Its adequacy reader found every survivor in ONE direction the author's 44-probe set never took: fields, keys and spellings ADJACENT to the ones a check reads** — `peerDependenciesMeta` beside `peerDependencies` (the peer made OPTIONAL with every check green), `scopes` beside `imports` (a working-tree path for `./src/` alone), `"0.5.2"` beside `'0.5.2'` (the bound written to close the author's own ceiling was blind to two spellings) — **and the option half of rule 5, which no fake ever asserted**: `createTask` ignored outright cost **0 of 705 and 0 of 1138**, and a default that injected `retryPolicy` or `workerGroups` (W58's two fields) was green everywhere. All five closed; the readers' ten exact edits are checked in as probes. **Rule 8: 54 provocations, 48 caught, 6 survivors all declared, 0 aborts, 0 against declaration**, the tree held still. **Readers 13 / 2 blocking and 64 / 13 / 5 blocking, overlap 0 — the thirty-second measurement**, neither primed; their split held exactly: the conformity reader found claims that were false (the argument, a stale 1061, three counts, seven stale identifiers), the adequacy reader found bounds that were not there. **Late exception ONE** (`examples/l6.ts`, on a measurement), zero undeclared. **Census 197 / 144 / 2 / 51**; **Q252** (no `deno publish --dry-run` rung — a green dry run was the wrong answer once, because `package.json`'s devDependencies resolve a bare import to the npm build) and **Q253** (P16's facts harness is UNTRACKED and misread fact 1 at exit 0 two ways, one of them from the day the plan was declared). `check:spec` **7 / 44 / 93**.

**[P16](plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md) is DECLARED —
*what is a node type, and what does the library owe the scheduler to have one?* — and it is the
FIFTH PRODUCT PLAN IN A ROW, with NO ITEM STARTED** *(as declared; W57 and W58 have closed since, above)*.** A flow names a worker pool by a string and hands
it a payload, and that is everything a node can say about the thing that runs it. Three items,
serial: **[W57](work-items/w57-the-scheduler-is-a-dependency.md)** (the scheduler is a declared
dependency — **ADR 0048** superseding
[ADR 0013](decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rule 1, whose forcing fact expired on 2026-08-31; [Q71](open-questions.md) closes by `import type` — *both reversed by W57, see above*),
**[W58](work-items/w58-what-a-node-says-about-its-own-task.md)** (`retryPolicy` and `workerGroups`
as declared keys mirroring `optional`, and a registry `groups` set because the scheduler **silently
ignores an unknown group id**, measured), **[W59](work-items/w59-what-a-node-type-is.md)** (a node
type as a registry entry — **ADR 0049** — with the envelope `{ settings, input }` that leaves ADR 0040
rule 6 intact for untyped nodes, the bootstrap helper as a sub-path export, and the exit artifact on
real workers in both L6 runtimes). **Reserves W57-W60, Q248-Q262, ADR 0048-0050.** Its follow-on
slices are ordered and not reserved: a per-node JSONata **transform applied in the type's worker
wrapper** ([Q251](open-questions.md)), then schemas with a sample-based pre-flight, then strict
mode. **Five facts measured and re-taken on `8550978` by `dev-dist/p16/facts.mjs`; prediction 2
reversed by its own grep within the hour and narrowed.** Drafted and committed as a draft the same
morning P15 closed, so its six decisions lived in a plan rather than a transcript before they were
declared. **Read every status from the item's own file, never from this line.**

**[P15](plans/p15-what-a-run-retains-and-what-a-result-may-be.md) is DECLARED — *what does a run
retain, and what may a result be?* — and it is the FOURTH PRODUCT PLAN IN A ROW.** It takes
[Q19](open-questions.md) and [Q22](open-questions.md) as ONE question: they are **the two oldest rows
in the register whose owner cell says the same thing — *no owner, needs a measured run*** — and both
have said it since P1. **This declaration took that run.** Three items, serial: **W53** (what a run
retains that nothing reads, as **ADR 0046**), **W54** (what a result may be, and what bounding it
would cost), **W55** (a run at scale on real workers). **Reserves W53-W56, Q233-Q247, ADR 0046-0047.**
**W53, W54 and W55 are ALL DONE and the RETRO IS RUN. Read every status from the item's own file,
never from this line.**

**[P15](plans/p15-what-a-run-retains-and-what-a-result-may-be.md) is COMPLETE and RETRO'D, and
`doc/workflow.md` is [v0.16](workflow.md).** Its question — *what does a run retain, and what may a
result be?* — is answered on both halves: [Q19](open-questions.md) by
[ADR 0046](decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
and [Q22](open-questions.md) by `OR-R11`, **the two oldest rows in the register, both resolved in one
plan**. Three items, six reader passes, and an exit artifact that is a **measured number** rather than
a flow — the first time section 2's other option has been taken in fifteen plans. `spec/` goes
7 / 44 / **89 → 92**; L1-L5 **25 / 681 → 27 / 703**; L6 **942 → 1061** with the run count deliberately
unmoved at 42; the register **179 → 191**.

**Its central finding is that of ELEVEN defects, exactly ONE had a rung — the rung FIRED — and it was
reported GREEN twice.** Nine of the other ten were found by a reader and one by rule 8's re-run. W54
piped `npm run test:browser:all` through a `grep` for the count line, which prints **before** the
failures, and reported three red browsers green in the item whose own Verification table quotes
v0.15's *a line of its output is never the predicate*. **The ladder was not what failed; the reading
of it was.**

**v0.16 adopts THREE changes.** **(1) Section 4's green clause gains a PROCEDURE: a rung is RUN, never
PIPED — redirect it and read `$?`.** Four occurrences across three plans, and all four are an author
reading a LINE because the output was too long to read whole; stating the predicate was not enough.
**(2) Rule 8 obligation (a) gains the SHAPES a rule quantifies over, not only its clauses** — W41's
37 probes all used a `map` region, W53's release cases all used one `map` region at depth 1, and P15's
own fact 1 produced it a third time, after which the item written to correct it chose its fixtures the
same way. **(3) Obligation (c)'s LIMIT gains what *independent* excludes: the second observer must not
be DOWNSTREAM of the first's apparatus** — W55's was measuring the first one's instrument, and every
mechanism in rule 8 is blind to that by construction, because a control can only see what a probe
ADDS.

**REFUSED, five**: a `doc/` check for the **thirteenth** time (*49.8%* is right in three documents and
wrong in four, and the difference is which divisor the sentence names — a check would have to do
arithmetic in English); an `Owns` pre-declaration rule for the **fourth** plan running, and **P15 is
the first plan to PREDICT the pattern correctly** and a rule would still have been wrong twice on two
of three items; a **fourth membership list** for [Q217](open-questions.md)'s regress — W55 closed the
per-row layer **both ways** and could not close the cross-row layer at all, so the answer is a HANDLE
rather than a list; a rung or a budget row for the plan's scale; and a rule obliging an item to re-take
its own grep count, where the procedure fired in all three items and two recorded the wrong number
beside it.

**Three of four predictions CONFIRMED, and prediction 4 REVERSED in a THIRD way this document had no
name for.** P10's retro settled that only a reach prediction can reverse; P13's added *when its
measurement is narrower than its wording*; P14's added *or when the fact underneath is false*. **This
one reversed because the item whose job was to try, tried** — the prediction's own reversal clause
named a CONSTRUCTIVE test and became W55's Scope In 4 almost verbatim. **So a reversal clause DIRECTS
an item, which nobody had written down — and it was wrong about the mechanism**, guessing *by
asserting the footprint itself* where the footprint is reported and never asserted.

**v0.15's three changes: all CONFIRMED and KEPT** — and the one that was BROKEN is the evidence for
it. **And v0.14's ceiling clause had its first full plan with a yield of ZERO**: all **twenty-four**
declared ceilings re-run at the retro on the tree the plan ships, every one behaving as declared,
against P13's eleven where one was false and one stale. **Rule 8 across the plan: 112 provocations,
87 caught, 25 survivors — 24 declared and one recorded — 0 aborts, 0 against declaration.** Readers
**six passes, none empty, overlaps 2 / 4 / 2**, the twenty-ninth to thirty-first measurements, band
unmoved. **Eleven late exceptions, zero undeclared. Census CONFIRMED for the FIFTEENTH plan running —
191 / 139 / 2 / 50, 0 aborts.** **W56 closed as reserved and never issued; Q233-Q246 used, Q236/Q237/Q247
spent; ADR 0046 taken, 0047 skipped. The next plan starts at W57, Q248 and ADR 0048.**

**[W55](work-items/w55-a-run-at-scale-on-real-workers.md) is DONE and it is P15's EXIT ARTIFACT: a
MEASURED NUMBER rather than a flow, which is what [P15](plans/p15-what-a-run-retains-and-what-a-result-may-be.md)
decision 3 declared before any item started.** `examples/retention.ts` is checked in and reports what
ONE run holds on a real `FyflowScheduler` — before and after
[ADR 0046](decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md),
with both observers named — **byte-identically in both L6 runtimes**. **L6 is 1061 assertions over 42
real runs**, from 942 / 42, and **the run count does not move**, because an artifact that is a number
adds no flow. `spec/` is unmoved at **7 documents, 44 examples, 92 rules** and L1-L5 at **27 files /
703 cases in five runtimes**, which is the declared result. **NO ADR and no spec rule.**

**P15 prediction 4 REVERSES, and the reversal is narrower than its own reversal clause.** Reverting
ADR 0046 rule 3 cost **ZERO** L6 failures before this item and costs **29 in BOTH runtimes** after
it — across **23 distinct rows**, one failure each, which is a count of observations rather than of
knock-ons. The prediction guessed the rung would come *"most likely by asserting the footprint
itself"*; **the footprint is reported and never asserted** ([Q179](open-questions.md)), and what moved
the number is the **RELATION** — the collection non-empty before its join becomes terminal, empty
after, the run unchanged — observed by reaching past the surface a run reports into the driver's own
`arrivals` ([Q233](open-questions.md)). **What [Q214](open-questions.md) keeps is the half a consumer
cares about**: the outcome, every task id, the log, the fold and every callback are byte-identical
either way, which is exactly why the release was safe to make. *A rung made of runs cannot see this
through anything a run REPORTS; it can see it by not being made only of what a run reports.*

**The measured number, in both runtimes.** On `map-alias` at arity 16 over 16 KiB results, one run
holds **777.5 KiB** and released **256.4 KiB** — and **P15 fact 5's whole table re-takes to the
decimal in BOTH directions**, 10.2 / 101.8 / 317.4 / **3174.8** / 1584.9 MiB before against 6.2 /
62.1 / 161.1 / **1610.9** / 803.0 after, with the two observers agreeing within **1.7-4.2%** at the
large sizes (P15 said within 3%).

**And fact 3's 49.8% is CORRECTED: it is the share OF THE PAIR, and four documents state it as the
excess over `bytes(inputs)`, which is +99.2 to +99.4%.** Wrong by a factor of two, and wrong in the
direction that **understates** the saving — found by re-running fact 3's own harness with the release
reverted rather than transcribing its number. The headline, *half of what a region-bearing run holds
is a second copy*, is the share-of-the-pair reading and is right, as are `JP-R12`, W53's own file and
[Q19](open-questions.md)'s resolved row. **Neither ratio is a constant**: the divisor is one copy per
SETTLED RESULT, so it is a property of the FLOW as well as of the payload — **+97.5%** with no node
after the join, **+49.3%** with one that echoes the collection, **+33.0%** on the flow L6 measures.
[Q243](open-questions.md).

**Its sharpest finding is that the SECOND OBSERVER WAS MEASURING THE FIRST ONE'S INSTRUMENT.** The
peak sampler keeps the arrived payload objects, that snapshot is reachable from `driver.opts`, and the
byte walk skips `opts` **by name** — so observer 1 could not see it and observer 2 could, and every
kept driver retained **a second copy of the very collection the decision releases**: **141.9 MiB
against 129.4**, one collection a run, confirmed at a second scale. *Scope In 3 says a sensor cannot
corroborate itself and that this item is where that matters most.* W55's conformity reader.

**Its adequacy reader found the byte observer — the item's whole deliverable — bound by nothing, three
separate ways**, each costing 0 failures with 1050 assertions green: the serializer made unavailable,
a second `continue` inside the walk (777.5 KiB to 0.6), and the reconstruction's `extra` list emptied.
**The cause is that `walkOf` and `retainedBytes` were two expressions over one literal and only one
reached an assertion.** `retainedBytes` takes its key list FROM `walkOf` now, and the harness's own
predicate gained three RELATIONS rather than figures — the rung has a serializer, the reconstruction
exceeds the end, and **what a run holds cannot be smaller than what it released**, because a collection
is a SUBSET of what `inputs` holds.

**And the headline number rested on ONE `check` call that three integer edits removed** — after which
reverting the decision cost **2 instead of 25**. That is [W23](work-items/w23-a-nested-flow-on-real-workers.md)'s
finding at its **FIFTH** iteration: `ROW_KEYS` names rows, `CROSS_ROW_SUBJECTS` names cross-row blocks,
and nothing named a per-row assertion. `PER_ROW_SUBJECTS` is the analogue and is bound **both ways**;
the cross-row layer's own version of the hole is a declared ceiling, because cross-row labels share no
handle the other direction could use ([Q217](open-questions.md)).

**N runs on ONE shared scheduler is O(N^2) and on their own is linear** — 115 / 277 / 884 / 3304 ms at
N = 100 / 200 / 400 / 800 against 108 / 183 / 313 — while the **driver's** share is flat at 15.0-15.1
KiB a run. Every settlement on a shared scheduler reaches every driver's listener and `ID-R4` tier 1
drops it, which is [ADR 0023](decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
working as written, N times per settlement — and **`AGENTS.md` section 9 recommends that topology**
([Q244](open-questions.md)). **A run's footprint is also not only the driver's**: `scheduler.tasks`
holds six tasks a run beside it, and **`v8.serialize` REFUSES a `FyflowTask`**, so this repository's
own observer cannot price the other holder ([Q245](open-questions.md)) — `OR-R11` from the far side.

**Readers 13 / 3 blocking and 41 mutations / 19 survivors / 6 blocking, OVERLAP 2** — the
**thirty-first** measurement, inside the 0-4 band, neither primed, and the two shared subjects were
reached from opposite ends. **Rule 8: 46 probes, 34 caught, 12 declared ceilings, 0 aborts, 0 against
declaration**, run twice with the readers' sixteen exact edits in the set — and **the re-run found a
CRASH where a failure belonged**, the reporter's positive-case block dereferencing an `undefined` with
the decision reverted and taking the whole rung's report down before any real failure could be read.
**ONE late exception, zero undeclared**, and P15's `Owns` prediction is answered **no / no / no** for
the exit artifact. **Census 191 / 139 / 2 / 50, 0 aborts; Q243-Q246 raised, Q247 unused;
[Q142](open-questions.md) measured on a scratch copy and does NOT fire.**

**[W54](work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) is DONE and
[Q22](open-questions.md) is RESOLVED by **`OR-R11`** in `spec/outcome-record.md` **v0.9** — open
since P1, and the SECOND of the two oldest rows whose owner cell said *no owner, needs a measured
run*. With [Q19](open-questions.md) closed by
[W53](work-items/w53-what-a-run-retains-that-nothing-reads.md) one item earlier, BOTH are answered in
one plan.** `spec/` is **7 documents, 44 examples, 92 rules**; L1-L5 is **27 files / 703 cases in
five runtimes**; **L6 is unmoved at 942 / 42**. **NO ADR — 0047 is SKIPPED and not reused**, on
`doc/decisions/README.md`'s own *a spec rule with a rationale paragraph is better than a spec rule
plus an ADR restating it*.

**A result is a VALUE, not an OBJECT.** What crosses `OR-R2`'s clone is a value's own enumerable
string-keyed DATA plus the built-in types' internal state; what does not is the **prototype** (so
methods, `instanceof` and privacy), **accessors**, **non-enumerable** properties, **symbol keys**,
**property attributes** — a frozen object arrives unfrozen — and an **`Error`'s own extra fields**.
**Q22's fork is the wrong shape**: it IS the driver's constraint, `OR-R2` and `OR-R6` unchanged, and
the question an author actually hits is not *may I return this* but **what arrives**.

**The document W54 owns carried a FALSE sentence, in the direction that matters.** It said
`structuredClone` *"throws on a function, a class instance with behaviour, or anything else
non-cloneable"*. It does not throw — it clones it **lossily**, prototype gone, methods gone,
`instanceof` false, **no error and no report**. So the boundary has **three** answers where the
document named two, and it is now **27 rows, one per shape — 5 refused, 11 intact, 11 lossy** —
asserted in **all five runtimes**, which is P15 prediction 3's own stated way of being wrong checked
rather than assumed.

**Prediction 3's CONCLUSION is confirmed and its stated REASON reverses**, which is
[P12](plans/p12-what-a-node-receives-and-what-a-decision-sees.md)'s [Q193](open-questions.md) and
P14's retro's sharpest kind. It says no ADR *because a driver cannot tell a class instance from the
plain object its author meant to return*. **Measured, it can**: a prototype comparison after the
clone fires on every top-level lossy shape and on none of the intact ones, at **0.02-0.65% of one
clone**. What is true is narrower — the cheap check is **blind to more than half the lossy rows**,
including the NESTED case a worker actually writes, and the walk that sees them costs **23-60%** of
the clone per settlement ([Q238](open-questions.md)).

**`OR-R12` is new and is the sharpest single finding: `OR-R6` was stated of the whole boundary and
holds only at the LISTENER.** `resolve()`'s clone is unguarded, so an uncloneable resolution value
throws a bare `DataCloneError` to its caller, **appends nothing, does not fail the run and never
reaches `onRunFailure`** — and that class is in neither `spec/outcome-record.md` section 6's
enumeration nor `AGENTS.md`'s executed error-class snippet. The asymmetry is DEFENDED rather than
removed — a settlement has nobody to throw to; a resolution is a synchronous call the consumer made —
and whether the two should be unified is [Q241](open-questions.md).

**Its central lesson is that A SUITE THAT DEFINES ITS OWN ORACLE CANNOT DISAGREE WITH THE DOCUMENT.**
The first version classified every shape by comparing top-level prototypes — **the very predicate
section 4 declines four paragraphs later for being blind to the nested case**, applied to a table
whose lossy row contains that case. Every row passed; the table and the suite said different things;
nothing could observe the difference. **What fixed it was deleting the classifier**, so each row
asserts the property its own row names — a refusal, a content ROUND TRIP, or the NAMED loss — and the
suite **reads the table out of the document** and compares both ways. *That binding caught the item's
own first split, 5 / 10 / 12, on its first run.*

**And the item broke its own rule inside the section that states it.** Section 4 closes with *quote
the shape and the ratio, never the millisecond*, and four paragraphs above it stood two percentage
bands taken from a single run — **0.04-0.52% and 27-55%, whose stated upper bounds sat below every
N = 100 reading**. Re-taken as 21 medians per reading, five readings at two payload sizes: **0.02-0.65%
and 23-60%**. `doc/workflow.md` section 6 pass 3 rule 3's sharpest kind, inside one document.

**Four more things measured at ZERO before the readers found them**: the `rows` list was bound by
nothing — 16 of 19 left with the assertion count unmoved; `equal(seen.get(k), undefined)` **passes
when `k` is absent**; the `14 / 124 / 89%` split was a literal in `spec/` with no observer, in a tree
whose L4 suite already walks both corpora; and `OR-R11`'s claim that the loss happens at `OR-R2`
was asserted by nothing, because **three** clone sites carry it and deleting `cloneValue` left the
whole suite green. `normalizeEvent` is `OR-R2`'s own site and the attribution is pinned there now.

**Readers 15 / 6 blocking and 41 mutations / 17 survivors / 6 blocking, OVERLAP 4** — the
**thirtieth** measurement, at the TOP of the 0-4 band, neither reader primed. **Rule 8: 30 probes,
21 caught, 9 declared ceilings, 0 aborts, 0 against declaration**, with the readers' own edits in the
set **from the start** because both reported before it was written. **And the gate was RED once —
`GATE EXIT=1` with ZERO `FAIL` lines** — because the browser bundle inlined neither
`spec/outcome-record.md` nor the second corpus, and **the browsers had been reported green twice**
from a `grep` for the count line, which prints before the failures. *Section 4's v0.15 clause, quoted
in this item's own Verification table and broken while being quoted.* **FIVE late exceptions, zero
undeclared**, and **P15's `Owns` test is answered `AGENTS.md` YES, `spec/README.md` YES,
`scripts/check-docs.mjs` YES** — against W53's no/yes/no, so a pre-declaration rule would have been
wrong twice on W53 ([Q157](open-questions.md)). **[Q142](open-questions.md) measured before the gate
and does NOT fire**, for the third consecutive time. **Census 187 / 135 / 2 / 50**, 44 ids in both
tables, 0 aborts. **Q238-Q242 raised; Q243-Q247 unused** — and **Q242 was cited in five documents with
no ROW for it** until the next item's prompt was being written, which nothing checks: `M2` validates
the anchor and nothing validates a Q id.

**[W53](work-items/w53-what-a-run-retains-that-nothing-reads.md) is DONE and
[ADR 0046](decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
answers [Q19](open-questions.md), open since P1 and one of the two oldest rows in the register with
no owner: a run retains *(tasks settled) x (bytes each returned)*, plus one further copy of each
result that has arrived at a join that has NOT YET BECOME TERMINAL.** `spec/run-state.md` is
**v0.6** — section 6's *Bounded retention* bullet is struck, section 7 is new and **`RN-R13`** is the
rule; `spec/join-policy.md` is **v0.16**, giving `JP-R11`/`JP-R12` the LIFETIME of what a join
collects with **no rule id added and no policy changed**. `spec/` is **7 documents, 44 examples, 90
rules**; L1-L5 is **26 files / 695 cases in five runtimes**; **L6 is unmoved at 942 / 42**, which is
what an item that adds no flow and no worker should do to it.

**A region's collection lives from its first arrival until its join becomes TERMINAL, and is
released at three moments — two per region and one per run.** Routed out of (after the read),
reported `unsatisfiable` (after the latch), and the run stopped (`OR-R10`). **Outside that window
nothing is RECORDED**, because a policy may lawfully settle a join with branches still live, which
is [Q95](open-questions.md)'s own precondition reaching the same region through a second door.
Measured: the `arrivals` share of a completed region-bearing run goes **49.8% to 0.0%**, and ten
thousand concurrent runs go **3174.8 MiB to 1610.9 MiB** — the figure P15's fact 3 predicted, to the
decimal. Releasing after the read costs **0** at L1-L5 and **0** at L6; before it, **14** (13 on the
suite as it stood before this item).

**Nothing is evicted from `inputs`, and that is refused on a measurement rather than on taste.** A
fold over a log truncated to its last input reports **`completed` with ZERO nodes and ZERO regions**,
no throw and no signal — a plausible wrong answer rather than a silent one — so an eviction needs a
way for the fold to say it was handed less, which is a new `FoldInput` kind. **P15 decision 2 holds
and prediction 2's stated reversal did not occur.** `maxCompletedTasks` is recorded as a candidate
**measured and refused**: it caps `scheduler.tasks` and reaches nothing this layer holds.

**Its central finding is that a REACHABILITY SET CANNOT TELL AN ALIAS FROM A COPY, and both readers
found it from opposite ends — the one subject they shared.** `RN-R13`'s first form said the
structures a settled result is reachable from are *exactly `{inputs, log}`*. The conformity reader
ran that predicate on a corpus flow declaring a `needs` and got a **third** name; the adequacy reader
made `outputsCache` **clone** what it stores — a real second copy of every result — **for ZERO
failures across lint, typecheck, `check:spec`, L1-L5 and L6**, because both L2 fixtures declared no
`needs` so the memo was `null` in all eight cases. **That is P15 fact 1's own defect reproduced
inside the test written to correct it**: fact 1 recorded `outputsCache` as `null` because it
enumerated properties on flows with no `needs`. The rule is a **SET and an IDENTITY** now, and the
memo's entries are asserted `===` a log record's own result.

**Three more claims were false and the conformity reader measured each.** `RN-R13`'s second term said
*whose region is still LIVE* — but `p1-routed-away` under `arrival-count` has **zero live branches**
and still retains, because *live* is what a BRANCH is and *terminal* is what a JOIN becomes. **The
code had THREE release moments and three documents enumerated TWO**, so ADR 0046 rule 5 contradicted
rule 3 and is now scoped *in a run that has not stopped*. And the negative control is **14** on the
tree this item ships where three copies said 13.

**And `OR-R10` had a door that was already open, which this item made SILENT.** `append` calls
`onFoldInput` un-wrapped, so a re-entrant listener reaches `failRun` from **inside** `settleJoin` —
the one door `failRun`'s own enumeration missed, because it is on the stack rather than ahead of it.
A stopped run routing out of a join pre-dates W53; before it the successor carried the full
collection and after it **`{}`**, indistinguishable from `live-token`'s legitimate all-exited case.
`settleJoin` returns at `this.failed`: **0** at both rungs, and it tightens an existing rule rather
than relaxing one. **The test written for it then asserted the right thing by the WRONG ROUTE** — a
throw, which unwinds past the guard it was written for, so removing that guard cost zero. Found by
rule 8's re-run with the reader's own edit checked back in.

**The adequacy reader's six blocking findings are all one fact: the rule has exactly ONE observer,
and it ran one region kind at one depth on two fixtures declaring no `needs`.** Measured: outside
`test/driver/retention.test.ts`, rules 3, 4 and 5 and the whole of `RN-R13` have **zero** observers;
only the read/release ORDER has a second route. So a **nested** region and a **`fanout`** region
could each never release for zero — [W41](work-items/w41-what-a-node-can-reach-and-what-names-it.md)'s
finding verbatim — the walk could not see a holder in a nested `Set` or a **cyclic** object while its
`catch` arm asserted the falsehood, its loop universe could be pinned to the answer it expects, and
seven of eight cases deleted for zero. All closed; **the universe binding caught the author's own
wrong literal on its first run.**

**Readers 16 / 6 blocking and 9 survivors / 6 blocking, OVERLAP 2** — the **twenty-ninth**
measurement, inside the 0-4 band, neither reader primed. **Rule 8: 36 probes, 32 caught, 4 survivors,
0 aborts**, run twice with the readers' eight exact edits checked back in and every file compared
back byte-identical. **ONE undeclared survivor, recorded rather than closed**:
[Q234](open-questions.md) — emptying a test BODY costs zero and the runner's `assertions` figure
cannot fall, because it counts `test()` **cases**. **FOUR late exceptions, zero undeclared**, and
P15's `Owns` prediction is answered `AGENTS.md` NO, `spec/README.md` YES, `scripts/check-docs.mjs` NO
for the first of three items. **[Q142](open-questions.md) was measured before the gate and does NOT
fire**, for the second consecutive time. **Census CONFIRMED for the FIFTEENTH plan running — 182 /
131 / 2 / 49**, 43 ids in both tables, 0 aborts. **Q233-Q235 raised; Q236-Q237 unused.**

**Its declaration measured EIGHT facts and FIVE of them correct or sharpen a row it is built on** —
the seventeenth time a plan has found one of its own inputs wrong by trying to act on it. **The
headline is that half of what a region-bearing run holds is a SECOND COPY that nothing reads.** The
driver's `arrivals` map is not an alias: `bytes([inputs, arrivals])` exceeds `bytes(inputs)` by
**49.8% of the PAIR** at map arities 4, 16 **and** 64 over 64 KiB results *(as an EXCESS over
`bytes(inputs)` the same runs read **+99.2 to +99.4%**; this sentence said 49.8% of that, which is
wrong by a factor of two and understates the saving — [W55](work-items/w55-a-run-at-scale-on-real-workers.md),
[Q243](open-questions.md))*, and the stored value is neither the log
record's `result` object nor the worker's own. **Clearing it after the join reads it costs 0 at L1-L5
and 0 at L6** — with a negative control that fires at **13 failures** when it is cleared before —
and takes ten thousand concurrent runs from **3174.8 MiB to 1610.9 MiB**. *A whole structure leaving
the driver is invisible to every rung this repository has*, which is
[Q214](open-questions.md)'s shape a third time, from the removal side.

**And [Q19](open-questions.md)'s row names the wrong variable.** Four dimensions measured one at a
time: ~262 B/node, ~469 B/fan-out branch, ~456 B/map instance — **one** variable, how many tasks
settle — and **linear in the whole of every result**, which is the multiplier neither that row nor
`spec/run-state.md` section 6 names. **A 4-node chain returning 256 KiB retains 1025 KiB; a 128-node
chain returning one key retains 33 KiB** — thirty-one times the footprint at a thirty-second of the
node count. The footprint is *(tasks settled) x (bytes each returned)*.

**THE MEASURED RUN, which both rows have waited for since P1: the target scale RUNS, and the margin
is a factor of one rather than of ten.** 1 000 runs x arity 4 x 1 KiB is **10.2 MiB**; 10 000 x 4 x
1 KiB is **101.8 MiB**; **10 000 x 10 x 16 KiB is 3174.8 MiB**. Two observers — `v8.serialize` and
`heapUsed` after a forced `gc()` — agreeing within 3% at the large sizes.

**`maxCompletedTasks` is NOT inheritable, and its shape is worse here than Q19's row says.** It caps
`scheduler.tasks`, the scheduler's own map, and reaches nothing the driver holds. Applying the shape
to our own sequence: **`fold()` over a log evicted to its last input reports `completed` with ZERO
nodes and ZERO regions**, no throw and no signal. *Not a silent eviction — a plausible wrong answer*,
and it is what a fold defined as a pure function of a complete log does when the log stops being one.
**That is the half that could make P15 a spec plan rather than a driver plan**, and it is the plan's
decision 2.

**[Q22](open-questions.md)'s own numbers do not reproduce as its row states them.** Re-taken **one
case per process** — [W46](work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md)'s
settled method — the single edge-hop clone is **0.64 ms** against 1.50 and a clone per map instance at
N = 1000 is **516.77 ms** against 2207.94. **The conclusion is unchanged and the argument is
stronger**: still ~800x, still quadratic for a map. Every absolute is 2-5x lower, because W34's were
taken accumulated in one process. *A register row quoting an absolute is quoting a method.* **And the
cloneability boundary is not where that row draws it: a class instance CLONES and arrives as a plain
`Object`** — prototype gone, methods gone, `instanceof` false, **no error and no report**. `OR-R6`
makes the loud case a run failure; nothing anywhere is a rule about the quiet one.

**The exit artifact is a MEASURED NUMBER rather than a flow, and that is decided on a measurement**:
`npm run test:l6` is **4236 ms for 42 real runs**, ~101 ms each, so a thousand real runs is already
over `doc/workflow.md` section 8's whole **90 s** plan-gate budget. **Adding a rung or a budget row is
refused**, and both are on the plan's stop-and-ask list.

**And the scale target this plan is named for is cited from a document this machine cannot read.**
`FLOW_PLANNING.md` is in the scheduler repository and **is not there** — lost when
[ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
`git worktree remove --force` went through the sibling, restored from a published package that ships
no planning documents. **`doc/concept.md` says *"thousands at a time"* and contains `1000s` nowhere**,
and [ADR 0023](decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
attributed the `1000s-10000s` figure **to it** — corrected in place here. The claim is not withdrawn;
the provenance is.

**Census CONFIRMED for the FIFTEENTH plan running — 179 / 129 / 2 / 48**, 42 ids in both tables, 179
of 179 in exactly one cluster cell, **0 aborts on a parser written from scratch and right first
time** (the fifth time, and the second in a row). **The declaration raises NO question**; it gives
Q19 and Q22 their first owners in fifteen plans and corrects three rows in place.
**[Q142](open-questions.md) FIRES and was PREDICTED from the pre-edit counts** rather than found by
the gate going red — `M4`'s margin was **50 links** and four work-item documents land in
`doc/work-items`, which neither `removes` probe cuts.

**[P14](plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md) is COMPLETE and
RETRO'D, and [`doc/workflow.md`](workflow.md) is v0.15 — THREE changes adopted, FIVE refused, and its
central finding is that v0.14's OWN counter-measure was followed and did not work.** P14 asked *what
does a reference mean when two regions' arities are independent?* and answered it by
[ADR 0044](decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md):
an output is visible to a reader when their two branch paths **agree on the regions their two chains
share**, and *one path is a prefix of the other* is that rule's special case. **Read every status from
the item's own file, never from this line.**

**THREE of its four predictions REVERSED — the highest rate of any plan — and three of them trace to
ONE wrong declaration fact.** v0.14 adopted *the prediction table states the SCOPE of the measurement
it rests on* as the answer to P13's derived reversal. **P14 is the first plan to carry that column, it
stated prediction 1's scope CORRECTLY, and prediction 1 reversed anyway** — because fact 3 was **false
about its mechanism**, not narrow. Re-measured at the retro: `map-over-region-output`'s reader `rank`
sits at path `-` with a region chain of **length 0**, in no region at all, where
`reference-past-a-map-arity`'s `publish` has the chain `[rank]`. *The two flows do not differ in
arity; they differ in where the reference is DECLARED.* **So P13's correction to P10's sentence gains
a SECOND failure mode rather than a replacement: a derived prediction reverses when its measurement is
narrower than its own wording, OR when it is wrong.** What caught it is an ITEM re-running the fact it
was handed — W49's `Inputs:` line — which is section 1 rule 5's provenance clause reaching a PLAN's
declaration for the first time. **Prediction 4 is the one CONFIRMED**, and the one the plan could not
have derived: [Q214](open-questions.md)'s second instance, in a different mechanism from W47's.

**THE THREE CHANGES.** **(1) Section 4 gains: a rung reported GREEN means its command EXITED 0 — a
line of its output is never the predicate.** Three occurrences, two plans, each `GATE EXIT=1` with
**zero lines beginning `FAIL`**: W42 twice — once with its Record's gate row already written as green —
and W50, whose author read `npm run lint | tail -1` and saw `Checked 49 files`, which `deno lint`
prints either way. **It replaces an apparent CONTRADICTION
rather than a rule** — rule 8 says *read the failure LINES, not the exit code*, which is right in the
other direction. *To call a rung green the exit code is NECESSARY; to call a provocation caught it is
NOT SUFFICIENT.* **The sentence existed in `CLAUDE.md` since v0.12 and W50 reproduced it anyway.**
**(2) Section 6 gains: a whole-tree measurement is taken with the tree HELD STILL.** W51's conformity
reader caught `examples/l6.ts` at **six digests** and a **live rule-8 probe** in `src/driver/driver.ts`,
one snapshot RED on correct code; W50's first gate ran in the background while W51's edits landed, so
its verdict was about a tree that no longer existed. Section 6 fixed the READER's half of this in
v0.6; **the author's half was never stated and is the likelier one**, because rule 8's set mutates the
shared tree by construction. **And this retro broke the rule it was adopting, within the hour** —
it started its confirming gate in the background and went on editing two index files while it ran,
then stopped it unfinished and re-ran it against the final tree. *Third occurrence.* **(3) Section 1 rule 5's third direction gains a procedure: an item greps
the tree for its OWN ID.** Measured outside `doc/`: `W33` at W32's commit returns **19** hits,
`W34` at W33's **10**, `W50` at W49's **12**, and `W42` and `W51` **0** — zero false positives in the
three that fire and silence in the two that do not.

**REFUSED, five.** A **`doc/` check for the TWELFTH time** — and P14 gives the best instance yet,
W49's three false claims about which rule moved, one of them self-contradictory **inside one cell**
forty words apart, which is why a check would need the claim in a structured field nothing writes. A
**rung for the EVIDENCE**, fourth plan running: of P14's five defects **one has a rung and it is the
one where the rung was green by not running**. An **`Owns` pre-declaration rule** — `AGENTS.md`
yes/yes/**no**, `spec/README.md` yes/yes/**no**, `scripts/check-docs.mjs` no/no/no, so **the exit
artifact reached neither** and such a rule would have been wrong on both for W51. A **fourth list below
`CROSS_ROW_SUBJECTS`** — and **P14 is the fourth iteration and did not add one**, computing the
cross-row clause from the row definitions and from the folded run instead
([Q217](open-questions.md)'s regress stopping where a clause is DERIVED). And an **obligation that an
item re-run its plan's facts**, refused because it already exists in the template's `Inputs` row and
is what worked here.

**v0.14's three changes are all CONFIRMED and KEPT, each with a limit.** The **HARNESS's ceiling
clause** produced its best case in W50 — a ceiling whose reason named a FUTURE rung, re-run at this
retro and now reporting **L6 exit 1, 2 failures**. **All seven ceilings the plan declared were
re-measured here: six hold and one is closed.** *Its limit: the clause binds the HARNESS, and W49's
second ceiling is PROSE* — re-measured by hand, inverting `spec/flow-definition.md`'s own normative
sentence back to the prefix rule leaves `npm test`, `check:spec` and `check:docs` at **exit 0 with
zero FAIL lines**. **(d)'s *a count is not a membership*** was reached by an AUTHOR — *its limit: a
membership list is a claim about a LAYER, and W51 added no layer, so `ROW_KEYS` and
`CROSS_ROW_SUBJECTS` reached none of its four survivors.* **The THIRD DIRECTION fired hardest,
fourteen instances** — *and its limit is a second direction it does not name: a claim with an EXPIRY
DATE is written by one item and falsified by another.*

**Rule 8 across the plan: 71 provocations, 65 caught, SEVEN declared ceilings all MEASURED at this
retro, ZERO undeclared survivors, ZERO aborts**, each set run twice with **25 of the readers' exact
edits checked back in**. **Readers six passes, none empty — 38 conformity findings / 13 blocking and
98 mutations / 16 real survivors / 13 blocking. Overlap 2, 2, 1**, the twenty-sixth to twenty-eighth
measurements. **Late exceptions 2 → 6 → 3 = 11, ZERO undeclared**, and W50's Record said FIVE where
its own table declares six — corrected under section 6 pass 3 rule 6. **Census CONFIRMED for the
FOURTEENTH plan running — 179 / 129 / 2 / 48**, **0 aborts on a parser written from scratch and right
first time**. **Gate re-taken: `GATE EXIT=0`, zero `FAIL` lines, 15 chain entries; L1-L5 25 files /
681 cases in FIVE runtimes; L6 942 assertions over 42 real runs in both; `spec` 7 documents / 44
examples / 89 rules.** **Q218-Q222 used; Q223-Q232 spent and not reused; ADR 0044 taken and 0045
skipped; W52 closed as reserved and never issued. The next plan starts at W53, Q233 and ADR 0046.**

**[W51](work-items/w51-the-sibling-region-flow-on-real-workers.md) is DONE and it is P14's EXIT
ARTIFACT.** A reader inside one region receives **every** output of a sibling region, at arities
neither derives from the other, end to end on a real `FyflowScheduler` in **both** L6 runtimes.
**L6 is 942 assertions over 42 real runs**, from 879 / 40; L1-L5 is unmoved at **681 in five
runtimes**, which is the declared result.

**Its headline is the number it exists to move.** W50 measured ladder L6 **BLIND** to
[ADR 0044](decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
— all eleven aimed references in both corpora at a shared region depth of **zero**, so reverting the
resolver cost **0** L6 failures against 6 at L1-L5. Now: **the prefix rule costs 12 and making every
entry visible costs 2**, both from zero. **Two directions, because a wrong predicate can be wrong in
two** — and it is [Q214](open-questions.md)'s shape in a second mechanism, which is **prediction 4
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

**[W50](work-items/w50-what-the-run-carries-at-independent-arities.md) is DONE and the RESOLVER applies
[ADR 0044](decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md).**
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
on anything L6 runs. **[Q214](open-questions.md)'s shape in a second mechanism** — W47's was *a
document the validator refuses never starts*, this is *a filter no run exercises* — and it is what
W51's exit artifact has to close. **The narrowing direction was answered with a measured ABSENCE**:
the two shapes that would give it a second observer are refused, one by `FD-V27` and one by the
DRIVER ([Q156](open-questions.md)), so the single expressible shape is W41's two-digit fixture.

**Readers 16 / 5 blocking and 36 mutations / 4 real survivors / 5 blocking, overlap 2** — the
**twenty-seventh** measurement, inside the 0-4 band, neither primed. **Rule 8: 24 probes, 20 caught,
4 declared ceilings MEASURED, 0 survivors standing, 0 aborts**, with all ten of the readers' exact
edits checked back in. **FIVE late exceptions, ZERO undeclared** — and two of them are
`spec/README.md` and `AGENTS.md` carrying *the resolver follows in W50*, true when W49 wrote it and
false the moment this item shipped, which is section 1 rule 5's THIRD direction firing on a claim that
NAMES the item that falsifies it. **Census 179 / 129 / 2 / 48**; **Q222 raised, ADR 0045 SKIPPED.**

**[W49](work-items/w49-what-a-reference-across-sibling-regions-means.md) is DONE and
[ADR 0044](decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
answers [Q206](open-questions.md): an output is visible to a reader when their two branch paths
AGREE ON THE REGIONS THEIR TWO CHAINS SHARE, and *one path is a prefix of the other* is that rule's
SPECIAL CASE.** `spec/flow-definition.md` is **v0.15**; `spec/` is unmoved at **7 documents, 43
examples, 89 rules** because no rule id is added or retired; L1-L5 is **25 files / 674 cases in five
runtimes**, from 24 / 656; **L6 is unmoved at 879 assertions over 40 real runs**. The DERIVATION
ships here and the RESOLVER is **W50**'s, which is v0.8's own split — a `map` node kind nothing
dispatched for one item — and it is written into the document rather than left to be discovered.

**Candidate (b) of three, put to the maintainer with both candidates PRICED, which is what P14's
stop-and-ask list asks for.** A fourth refusal costs **11** L1-L5 failures and takes a corpus flow
with it; the predicate change costs **6** and takes none, and the 6 are a strict SUBSET of the 11 —
all of them `FD-R3`/`FD-C4` fixtures that reach those rules through the sibling road. Both leave
`map-over-region-output` untouched, so P14 decision 2 held under either.

**The defect was never about a `map` and never about arity, and the plan's own facts said otherwise.**
Every sibling pair in both corpora is `map`/`map`, so nothing had seen the `fanout` half:
constructed, a reference from branch **1** of a second `fanout` region to branch **0** of the first
**validates with zero findings**, is `FD-V29`-certain, and **stops the run**, while the same reference
written in branch 0 resolves. *Which branch the author wrote it in decided whether the run completed.*
**P14 fact 3's mechanism is corrected in place**: `map-over-region-output` works because its
reference sits on **`rank`, the map NODE**, at branch path `-` and in no region — so it receives all N
before any instance exists, and no index-matched entry is involved. **The two flows differ in WHERE
the reference is declared.**

**THREE of P14's four predictions are already reversed**, and prediction 1 reversed because the fact
it rests on was wrong — v0.14's correction to P10's distinction reaching a second instance.

**Its conformity reader falsified the DERIVATION and it changed the CODE.** Both documents argued
*`containing(n)` is a nesting chain, so the regions containing both are the outermost k of each* —
**false on a document `validateDefinition` accepts with zero findings**, where a fanout region's JOIN
inside a nested region makes one node's shared entry the innermost of the other's chain. The answer
survived; the justification did not, *on the eve of that expression going into the driver*.
`sharedRegionDepth` now derives from the same walk the PATH is built from, and the reader's
counterexample is a checked-in fixture, because re-sourcing it back cost **zero** on every other
document.

**And its adequacy reader found that ADR 0044 rule 1's own clause had no fixture** — widening the loop
to compare EVERY segment cost **0**, because every sibling pair in the corpus is TOP-LEVEL and every
nesting pair has a prefix as long as both paths. **The discriminating shape is two sibling regions
nested inside ONE outer branch**, where the two rules disagree at depth 1; adding it falsified this
suite's own sibling claim on the first run. *A corpus is a claim about what shapes EXIST, not about
what shapes are legal* — and P14 decision 3 named the `fanout` half in advance while nobody named the
DEPTH half.

**Readers 15 findings / 6 blocking and 52 mutations / 8 real survivors / 4 blocking, overlap 2** — the
**twenty-sixth** measurement, inside the 0-4 band, neither reader primed. **Rule 8: 27 probes, 26
caught, 1 declared ceiling MEASURED, 0 survivors standing, 0 aborts**, with all eight of the readers'
exact edits checked back in — and its own set found **four** holes before either reader saw the tree,
three of them the obligations v0.13 and v0.14 added. **TWO late exceptions, ZERO undeclared** —
`spec/README.md` by `C8`, and **`AGENTS.md`, which no check reaches**: its *what it costs* paragraph
named two things a run can refuse a reference for and this decision removes one. **Census CONFIRMED
for the FOURTEENTH plan running — 178 questions, 128 open, 2 deferred, 48 resolved**; the parser was
wrong in an **eleventh** direction, and it is a CLAUSE ORDER rather than a clause: applying clause 8
after the width check aborts on exactly the two rows the note tells it how to read.
**Q218-Q221 raised, Q206 RESOLVED.**

**[P14](plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md)
is DECLARED — *what does a reference mean when two regions' arities are independent?*, and it is the
THIRD PRODUCT PLAN IN A ROW**, the first run of three since P1-P2-P3. It takes
**[Q206](open-questions.md)**, the only open row that says the library cannot express something an
author would ordinarily want — the position [Q12](open-questions.md) held before P10 and
[Q11](open-questions.md)/[Q187](open-questions.md) held before P12 and P13. **Three items, serial:
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
`map-past-a-decision.flow.json`, which is [W47](work-items/w47-the-blocked-flow-on-real-workers.md)'s
and is three commits old. **Every one is `map`/`map`; no `fanout` pair occurs anywhere.**

**And the defect is ARITY-DEPENDENT, which is why `map-over-region-output` works and is celebrated.**
That flow is [Q165](open-questions.md)'s answer and carries the same sibling reference; it works
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
[W41](work-items/w41-what-a-node-can-reach-and-what-names-it.md)'s conformity-reader finding one rule
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
numbers. **[Q19](open-questions.md) and [Q22](open-questions.md) are declared OUT** and are the next
plan's subject, with three measured inputs already waiting.

**[P13](plans/p13-when-is-a-declared-reference-refused.md)'s RETRO is run and
[`doc/workflow.md`](workflow.md) is v0.14 — THREE changes adopted, FIVE refused, and its central
finding is that a HARNESS can produce a verdict having run NOTHING.** All three items shipped that
code path, all three declared ceilings against it, and **v0.11's two requirements on the harness were
satisfied throughout** — a control ran, every restore was asserted — which makes it section 6 pass 3
rule 3's sharpest kind: a rule followed that did not work. What found it is
[W47](work-items/w47-the-blocked-flow-on-real-workers.md)'s conformity reader **timing** a probe,
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
member and its name are two edits in one diff ([Q217](open-questions.md)), and *three iterations each
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
([Q157](open-questions.md)); late exceptions fell **6 → 4 → 1** with zero undeclared. A **rung for the
EVIDENCE**, for the third plan running — **exactly one of the defects this retro discusses has a rung,
and it is the one where the rung's own shape is the finding** ([Q214](open-questions.md)). A **`doc/`
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
defeated all three with one source swap ([Q216](open-questions.md)); **(c)'s LIMIT extends to a
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

**[W47](work-items/w47-the-blocked-flow-on-real-workers.md) is DONE and it is P13's EXIT ARTIFACT,
so [P13](plans/p13-when-is-a-declared-reference-refused.md) is COMPLETE and not yet retro'd.** Both
flows run end to end on a real `FyflowScheduler` in **both** L6 runtimes — the one the plan exists
for, and a second the item's own adequacy reader BUILT. **L6 is 879 assertions over 40 real runs**,
from 806 / 38. `spec/` is unmoved at **7 documents, 43 examples, 89 rules** and L1-L5 at **24 files /
656 cases in five runtimes**, which is the declared result: an exit artifact writes no rule.

**Its headline is that ladder L6 was BLIND to ADR 0042's headline for a whole item, and the reason is
structural rather than a gap in the row set.** Measured before this item's clauses existed:
**deleting `FD-V29` cost ZERO L6 failures** — `806 assertions, 0 failed, exit 0` against a clean
control both sides — while `FD-C4` cost 5 and the suffix left unparsed stopped the run from reporting
at all. **Every reference any L6 row runs is either `"."`, certain, or written with a `?`, because a
row IS a run and a document `FD-V29` refuses does not start.** *A rule whose whole effect is that a
run never happens is invisible to a rung made of runs* — [W35](work-items/w35-a-map-on-real-workers.md)'s
*`N` too small completes and is silent* one rule along, from the other direction.
**[Q214](open-questions.md)**, and **the scope is stated**: L6 was the only blind rung, since the same
deletion costs **7** at L1-L5 and fails `check-docs` `X6`'s neighbour `X4` on `AGENTS.md`'s own
executed snippet. It now costs **3**, and reverting W45 whole is **12**.

**Output (3) was answered with a measured ABSENCE and BOTH READERS took it apart from opposite
ends.** The item recorded `["n?"]` as unreachable at L6 because *"a map region inside a branch the run
loses is a flow this repository does not have"*. Its **conformity reader** measured that false on
`nested-map.flow.json`, **which this file already runs** — `["item"]` gives `FD-V29`, `["item?"]` is
ACCEPTED — and `map-in-fanout` is a second instance, **both named in ADR 0042's own seven-shape row**.
Its **adequacy reader** measured the consequence — `resolveReference`'s array arm, ADR 0042 rule 4's
`[]` half, **deletable for zero** — and then **constructed the flow that observes it.** *Two readers,
opposite ends, one hole.* So the coverage is **taken**: `map-past-a-decision.flow.json` is
`map-over-region-output` plus one guarded edge, **all three of section 3's axes decide its one
reference**, and its pair is *the array RESOLVES* against *the array is `[]`* — the second reaching
W33's N = 0 ruling from a REFERENCE rather than from a worker returning an empty list.

**The two sharpest findings are about the HARNESS rather than the artifact, and the second hid the
first.** A declared **ceiling** whose stated reason was false — the registry *is* a source both
assertions read, and the probe survived only because its literal was **set-equal to the derived
value**, which is W17's vacuous probe verbatim. And **the harness ran NOTHING for its five
declared-survivor rows**: with `red: []` the command list was empty and the verdict restated the
declaration, 0.26 s against 3.4 s — [Q151](open-questions.md)'s shape one obligation across.
**Closing it found five more defects in the same pass.**

**Its adequacy reader's central finding is [W23](work-items/w23-a-nested-flow-on-real-workers.md)'s at
its THIRD iteration**: deleting **all** of W47's cross-row work took **two integer edits and one
import line**, and L6 came back at the exact pre-W47 numbers, green, in both runtimes. **W35 answered
the ROW half with `ROW_KEYS`; nothing did that for the CROSS-ROW layer**, which is where three
consecutive items put their whole output. `CROSS_ROW_SUBJECTS` is the analogue — the same deletion now
costs 1 and **names which subject left** — and **the regress moves rather than closing**, which is
stated ([Q217](open-questions.md)). Two more of its blocking findings are **obligation (c)'s LIMIT
unmet in the block that names it by id** ([Q216](open-questions.md)), and a fourth is **a detector with
one observer and no case that made it fire** — closed with a positive fixture that **had to be
assembled from parts, because written as literals it made the file its own offender.**

**Rule 8: 43 provocations, 33 CAUGHT, 7 declared survivors all MEASURED, 2 BOUND, 0 undeclared, 0
aborts, 0 wrong-reason**, run twice with seven of the readers' exact edits checked in — and the re-run
found **a probe of the author's own reporting WRONG-REASON because the ARTIFACT crashed** on an
unguarded dereference instead of failing an assertion. **Readers 14 / 8 blocking and 27 mutations /
13 survivors / 6 blocking, overlap 2** — the twenty-fifth measurement, both unprimed. **ONE late
exception, zero undeclared** — the lowest of any product item in three plans — and **P13's
`Owns` test is answered ONE OF THREE for this item**: over the
plan it is `AGENTS.md` yes/yes/no, `spec/README.md` yes/yes/yes, `scripts/check-docs.mjs` no/yes/no,
so **a pre-declaration rule would have been wrong twice on two of the three** ([Q157](open-questions.md)).
**Census CONFIRMED for the THIRTEENTH plan running — 174 questions, 125 open, 2 deferred, 47
resolved**, 0 aborts on a parser written from scratch that was wrong in **three** directions first and
found a **fourth** register row rendering wrong — unescaped pipes **inside a code span**, in the row
W45 added *about a census parser*, and **the row raised to record that carried the defect too**
([Q215](open-questions.md)). **Q213-Q217 used; no ADR.** `npm run gate` is **`GATE EXIT=0`, zero FAIL lines, 15 entries**, L1-L5 measured at **656 in all five runtimes** rather than inherited, and **[Q142](open-questions.md) was re-measured and does NOT fire** — W46 re-centred both floors so this plan's last item would not pay the same window twice, and that is what happened.

**[W46](work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md) is DONE, it takes NO
ADR, and [Q186](open-questions.md) is DECIDED and deliberately NOT CLOSED.** `spec/flow-definition.md`
is **v0.14** — section 3's cost blockquote gains the measurement, the METHOD, and a four-row table of
why **nothing warns** — on [Q190](open-questions.md)'s precedent: recorded in that section and
asserted at ladder L2. **[P13](plans/p13-when-is-a-declared-reference-refused.md) prediction 3
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
[Q193](open-questions.md)'s shape, on a decision with no ADR.

**And the item's own headline METHOD claim did not reproduce.** It said the numbers this document had
carried since v0.11 were taken by a method *worth 2.5x in run POSITION*, with the two large cases
*swapping their numbers exactly*. Its conformity reader could reproduce neither: **the comparison had
been reversed-in-one-process against one-case-per-process, two variables at once**, and the isolating
comparison was never taken. Taken now, **ORDER costs nothing** — forward and reversed medians agree —
and **ACCUMULATION costs up to 4.4x**: five passes over one list in one process take a cheap row from
**6.8 to 30.1 ms** and the large row from **622 to 1632**. So *later in the process is dearer whatever
the order*, the last row of a one-process table carries the whole accumulation, **the cliff was robust
throughout, and the spread among the three cheap rows never was a measurement**.
[Q208](open-questions.md).

**Two more of the four reasons were repaired rather than kept.** *There is no CHANNEL* stated an
absence where [ADR 0027](decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)'s
*ignore it, but report it* is an unweighed choice — it is weighed now, and declined because
`onUnmintedTask` reports a fact about a RUN while *resolved once per item* is a fact about the
DOCUMENT. And the **~1%** cost of measuring was unreproducible; what reproduces is **~29% of ONE
clone**, taken once per (node, key) against N clones, so **~0.03%** of what it would warn about at
N = 1000 — *a number that could not be reproduced replaced by one that can, and the argument got
stronger*.

**Q186 stays OPEN because closing it would delete the question.** *How large is too large* occurs in
**exactly one place in the register — Q186's own row** — and not in [Q22](open-questions.md), which
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
([Q212](open-questions.md)), and **the number of copies a driver MAKES is observable to no test here**.

**Three documents stated the same five figures and nothing compared any two** — editing either for
**zero** while destroying the `71x` claim in its own table. `check-docs` gains **`X6`**, comparing
them both ways and **by column position** rather than by magnitude, which its own first run caught.
**And `X6` produced three findings of its own, each a rule this repository already had**:
`ALL_CHECKS` was a closed allowlist, so **`X6` shipped with four clauses, no probe and no grading at
14/14, 8/8, exit 0** ([Q43](open-questions.md)'s class, [Q209](open-questions.md), closed here and
live in three other self-tests); `X6` then read `AGENTS.md` **by name** rather than the document the
check is pointed at, so all three of its probes exited 0 — obligation (e)'s **second question** in a
third shape and **the first of the three caught by the author's own set** ([Q210](open-questions.md));
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
([Q157](open-questions.md)). **Census CONFIRMED for the TWELFTH plan running — 169 questions, 120
open, 2 deferred, 47 resolved.** **Q208-Q212 used; ADR 0043 SKIPPED and not reused.**

**[W45](work-items/w45-what-a-reference-must-be-able-to-say.md) is DONE and
[ADR 0042](decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)
answers [Q187](open-questions.md): a reference says whether it is CONDITIONAL, and the bare form
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
own finding about [Q11](open-questions.md) one plan on** — the register presented three candidates
as a fork and they were a stack.

**Its four headline numbers were WRONG when first written, and its conformity reader re-derived every
one.** 121 / 29 / 7 / *14 of 25 flows*, from a probe whose hard-coded registry did not carry
`earlierWasLowConfidence` — so `FD-V4` fired on one of the two `decision-on-an-earlier-step` files
and the walk silently ran over 25 files where the same table's row above says 26. **`22` was the only
one of five that survived.** And re-taking it found a second thing: once `FD-V29` ships, using the
whole validator as the admission test refuses **exactly** the certainty set, so it reports *certainty
refuses 0* and the measurement is circular — measured, and the test now excludes that rule by name.
**The four properties the decision rests on are an executable L1 suite rather than prose in three
files.** [Q199](open-questions.md).

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
**[Q206](open-questions.md)**, recorded with the measurement in section 3.

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
([Q203](open-questions.md)). **Census CONFIRMED for the TWELFTH plan running — 164 questions, 115
open, 2 deferred, 47 resolved**; the parser aborted **zero** times on its first run and then found a
defect in one of its own clauses, the tenth direction ([Q204](open-questions.md)).
**Q199-Q207 used, the block extended by two; ADR 0042 taken.**

**[P13](plans/p13-when-is-a-declared-reference-refused.md)'s DECLARATION, which is what the item
above was built from — *when is a declared reference refused, and what does it cost?*, and it is the
SECOND PRODUCT PLAN IN A ROW**, the first
back-to-back pair since P1-P2. [P12](plans/p12-what-a-node-receives-and-what-a-decision-sees.md)
gave an author a way to reach an earlier node's output and left **two ways to write one that does not
work**, both raised by its own readers rather than by its authors. Three items, serial: **W45**
([Q187](open-questions.md) — reachability is not dominance, as **ADR 0042**), **W46**
([Q186](open-questions.md) — the cost nothing warns about), **W47** (the blocked flow on real
workers). **Reserves W45-W48, Q199-Q213, ADR 0042-0043** — fifteen questions, because P11 reserved
five and extended twice and P12 reserved ten and extended once.

**Its question is [ADR 0002](decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
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
returned**, which is one step further out than [Q186](open-questions.md)'s row states it.

**And the objection W41 made its choice on has NO INSTANCE in this repository.** Dominance over the
entry-rooted DAG is computable, and run across **both** corpora — 26 flows, **6 aimed references** —
it would refuse **0 of the 6**, while refusing the broken flow above. [Q187](open-questions.md)'s
row says a dominance rule *refuses valid flows whose every real workload takes the producing branch*;
nothing here exhibits one. **The scope is stated rather than generalised**: that measures that the
corpus contains no counter-example, not that none exists — and W45's evidence is required to try to
construct one. **[Q186](open-questions.md)'s cliff re-measured on today's tree at
8.3 / 8.7 / 10.0 / 560.5 ms against W41's 6.5 / 8.0 / 10.6 / 546.6** — 64x, and which node id the
author typed is the whole of the difference.

**[Q190](open-questions.md) is confirmed in BOTH shapes and declared OUT**, because its status
cell already reads *decided as ACCEPTED* and its forcing condition has not occurred — reopening it
would be section 6 pass 3 rule 1's *measuring your own output*. **And P13 is the test of a rule P12's
retro refused**: neither W45 nor W46 pre-declares `AGENTS.md`, `spec/README.md` or
`scripts/check-docs.mjs`, so if both take all three as late exceptions again, the next retro should
adopt it.

**[P12](plans/p12-what-a-node-receives-and-what-a-decision-sees.md) is COMPLETE and RETRO'D, and
`doc/workflow.md` is [v0.13](workflow.md).** Its question — *what does a node receive, and what does a
decision see?* — is answered by **two ADRs**: what a node can reach is the run's own outputs, named
by the pair `(node id, branchPath)` and reached only by DECLARING them
([ADR 0040](decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md));
and a decision sees its node's effective outcome plus whatever its **own edge** declares
([ADR 0041](decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)).
**[Q11](open-questions.md)'s row asked the wrong shape of question** — its three candidates are a
**stack**, not a fork: the previous node's output is the DEFAULT, an accumulator is the STATE, a
declared mapping is the ACCESS, and only the third reaches a worker at all because `createTask`
takes ONE value. Open since P1, read by every plan since, and the correction came from trying to
build all three.

**Its central finding is that ALL THREE items shipped a claim their own evidence could not falsify —
and in each case the author had followed this document's procedure for exactly that.** W41's 37
probes all used a map region, so a rule wrong about `fanout` regions was unreachable from the set.
W42 wrote an ADR whose forcing fact was **false** and whose conclusion was right. W43 built an exit
artifact in which every map instance scored **zero**, ran it end to end on real workers, and would
have shipped it as evidence for a rule it could not distinguish from its negation. **None is
carelessness and six of the plan's seven defects have NO RUNG** — every one of the six is in the
EVIDENCE rather than in the product, which is [P11](plans/p11-what-should-the-gate-prove.md)'s
finding for a second plan running and this time on a PRODUCT plan.

**v0.13 adopts THREE changes and refuses FOUR.** **(1) Obligation (e) gains a THIRD SHAPE — a LIST
is a claim about another list**, four instances in three items, procedure *find the other list and
compare both ways*; **v0.12 stated the scope as `scripts/**` and two of the four are outside it**,
so the shape is not a property of check-writing. **(2) Obligation (c)'s procedure gains its LIMIT**:
[W34](work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s compound probe was
FOLLOWED and came back green, because the clause had exactly one observer and the probe removed it —
*a sensor cannot corroborate itself* — so when the compound is green, **count the observers**.
**(3) A fourth requirement on the SET: whatever makes a discriminating PAIR differ is itself a
claim** — W17's two join-path rows and BOTH of W43's pairs collapsed for **0**, and with either
collapsed the mechanism underneath was deletable for 0 too. **REFUSED**: a ladder level for L6's own
self-test (on cost — second time a level has been proposed and refused), an `Owns` pre-declaration
rule (twenty-two late exceptions, **zero undeclared**, so the mechanism works), an obligation for the
evidence behind a decision's stated reason, and a `doc/` check **for the TENTH time**.

**All four predictions have a verdict and prediction 3 REVERSED — and its reversal was justified by a
FALSE FACT.** ADR 0041 said a *diamond* made a node's payload underivable because choosing between
two settled predecessors needs append order; W42's conformity reader derived it in one expression
with none. The conclusion survived on two facts nobody had written down. P10's retro settled that
only a **reach** prediction can reverse and P11 found two right about the conclusion and wrong about
the mechanism; **this is the third case and the sharpest** — [Q193](open-questions.md).

**And the verdict v0.12 asked for: obligation (e)'s second question on a PRODUCT item FIRED, four
times.** `RULE_PREFIXES` and an `accepted` list (W41), `EDGE_KEYS` (W42), and a `Role` union, a
`switch`'s arms and a pool registry (W43) — **two in `scripts/**`, one in `src/`, one in
`examples/**`**. **The ANSWER is not portable even though the question is**: W43's was a TYPE, which
fails at ladder L0 and is unavailable to a `.mjs` check, and **a type closes one direction only**
([Q196](open-questions.md)). **The author reaches none of them** — nine instantiations of (e) as
written across the three items, all nine passing, and every one of the four found by a reader.

**Reader passes: six, none empty, overlap 1, 2 and 2** — the twentieth, twenty-first and
twenty-second measurements, all inside the 0-4 band, all six unprimed. **W41's 1 of 116 is the
largest denominator ever recorded here and did not move the numerator.** **And all three items got
the ORDINAL wrong by two, each inheriting it from the one before** — corrected in all three files
under section 6 pass 3 rule 6, its second use. **Rule 8 across the plan: 137 provocations, 121
caught, ZERO undeclared survivors, ZERO aborts** — and the three defects that mattered most were
found by readers rather than by it, which is why all three of v0.13's changes are about what the set
does not ask. **W44 CLOSED as reserved and never issued; Q184-Q198 all used and the block extended
once; ADR 0040 and 0041 both taken. The next plan starts at W45, Q199 and ADR 0042.** **Census
CONFIRMED for the ELEVENTH plan running — 155 questions, 107 open, 2 deferred, 46 resolved**, and
W43's parser, written from scratch, aborted **zero** times on its first run.

**[P12](plans/p12-what-a-node-receives-and-what-a-decision-sees.md)'s EXIT ARTIFACT EXISTS and
[W43](work-items/w43-the-two-blocked-flows-on-real-workers.md) is DONE.** The two ordinary flows the
plan named as *things this library cannot express today* run end to end on a real `FyflowScheduler`,
in **both** L6 runtimes: [Q166](open-questions.md)'s *score each item against the run's config* and
[Q165](open-questions.md)'s *score, then fan out over the scores*, the second with **no `over: "0"`
anywhere**. Ladder L6 is **760 assertions over 36 real runs**, from 638 / 31; `spec/` is unmoved at
**7 documents, 40 examples, 87 rules** and L1-L5 at **633 cases in five runtimes**, which is the
declared result — **an exit artifact writes no rule.** **What reverting each item costs: W41 is 18 L6
failures, W42 is 2, both are 20** — and W42's was **0** before this item, because neither flow the
plan named carries an edge-level `needs`.

**Its declaration step found that both flows RUN and PROVE NOTHING, and that is the result to
carry.** They complete on real workers exactly as written, and `map-with-context`'s three instances
each returned `{confidence: 0, score: 0}`: every shipped worker role reads `payload.confidence`, and
under a `needs` the payload is **exactly** the object `needs` describes. *A row that cannot tell
ADR 0040 rule 6 from its negation is not evidence* — [W35](work-items/w35-a-map-on-real-workers.md)'s
own `text` reasoning one rule across — and the same held for the decision pair from the other
direction, where `ctx.outcome` and `ctx.needs` carry the same number on the corpus's own spelling.

**Rule 8 obligation (e)'s SECOND QUESTION ran on a PRODUCT item for the first time and it FIRED.**
v0.12 earned *"was what it RAN what SHIPS"* entirely on `scripts/**`; asked here of a **declaration**
rather than of a command, it produced the **fourth** instance in one plan of *a LIST BOUND TO
NOTHING* — `Role`, the worker's `switch` arms and the pool registry, three lists saying the same
eight things with nothing comparing them, where one letter in a pool's role makes `run()` return
`undefined` and kills **the scheduler's own message handler** before any assertion runs
([Q194](open-questions.md)). **The answer was a TYPE rather than a set equality**, which product code
has and a `.mjs` check does not, and **it closes one direction only** — which none of the three
earlier instances did, and which only the adequacy reader's measurement established
([Q196](open-questions.md)). *The question generalises; the answer does not.*

**Its readers found 11 / 3 blocking and 28 mutations / 19 survivors / 4 blocking, overlap 2** — and
three of the adequacy reader's four blocking findings are ONE shape: **a discriminating pair whose
discriminating property is carried by literals that nothing compares.** This item added two rows
whose whole purpose is to be the other half of a row beside them, and in both cases making the pair
identical cost **zero** — after which the mechanism underneath could be deleted for zero as well
([Q197](open-questions.md)). **And a SENSOR CANNOT CORROBORATE ITSELF**
([Q195](open-questions.md)): ADR 0040 rule 6's *exactly* is observable only by a worker reading its
own payload's key set, the author's rule 8 pass declared that a ceiling with a correct reason, and
the reader measured what the ceiling cost — 8 failures, deletable by one fixture-side literal.
*A ceiling declared with a correct reason is still a hole if the reason is about the observer rather
than about the fact.* **Both revert costs were also WRONG when first written** — 14 and 1, taken
before the item's own last two edits — which is v0.12 change 2 firing on the numbers that are the
item's whole point. Rule 8: **43 provocations, 32 caught, 11 declared ceilings, 0 undeclared, 0 crash,
0 aborted**, ten reader edits checked back in and all ten firing. **ONE late exception, zero
undeclared.** **Census CONFIRMED for the ELEVENTH plan running — 155 questions, 107 open, 2 deferred,
46 resolved**, and the parser, written **from scratch**, aborted **zero** times on its first run.

**[W42](work-items/w42-what-a-decision-sees.md) is DONE and [ADR 0041](decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)
answers [Q8](open-questions.md), open since P1 — *a decision sees its node's effective outcome and
whatever its OWN EDGE declares.*** `spec/flow-definition.md` is **v0.12**: `FD-C3`, and an **edge**
may carry a `needs` — the same grammar as a node's and the same aiming rules, **minus the `"."`
form**, which `FD-V26` refuses there because *what a predicate would have received anyway* is
`ctx.outcome`. `spec/` is **7 documents, 40 examples, 87 rules**; L1-L5 is **24 files / 633 cases in
five runtimes**; **L6 is unmoved at 638 / 31**, the declared result. **Q8's own flow now runs** —
`decision-on-an-earlier-step.flow.json`, *route to review if an earlier step flagged low confidence*,
which that row has carried since P1 — **with the worker's payload untouched**, which is the whole
reason the declaration sits on the edge.

**[P12](plans/p12-what-a-node-receives-and-what-a-decision-sees.md) prediction 3 REVERSED, and its
evidence was wrong twice over — which is the result to carry.** That prediction said Q8 would need no
ADR. It needs one: a predicate needs a **shape** a worker does not, and a **site**, because *what the
node received* is not available where a decision is made. **But the ADR's stated forcing fact was
false**: it said a *diamond* — a node reachable from two settled predecessors — made the payload
underivable *because choosing between them needs append order*, and W42's conformity reader derived it
in one expression with none, the uniqueness guaranteed by `FD-V19`. **The conclusion survived on two
facts nobody had written down**: the **entry** node's payload is in **no record at any moment**, and
re-deriving any other node's means re-implementing `compose`, `JP-R11` and `JP-R12` at a second site,
which ADR 0040 rule 2 refuses by name. *A reach prediction can reverse on the right conclusion and the
wrong evidence, and only a reader re-deriving the evidence finds that* —
[Q193](open-questions.md).

**Its readers found 16 / 10 blocking and 45 mutations / 14 survivors / 9 blocking, overlap 2** — and
**the gate was RED at L0 TWICE** — an unused import, then a dead `const where = n.id` left stranded
by the fix for a reader's own finding — each time `deno lint` exit 1 with **zero `FAIL` lines**, and
since [ADR 0039](decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)
`lint` is the chain's first entry, so **both times nothing after it ran at all** and the second run's
whole log is **23 lines**. *The exit code is the predicate and a FAIL count is a secondary signal*,
recorded for two plans and caught for the first time here — **and then caught a second time in the
same item, by re-reading the log's own tail while this paragraph already said the gate was green.**
The two conditions `GATE EXIT=0` **and** zero `FAIL` lines are both satisfied by a chain that stopped
at entry one, because `FAIL` is a word the seven checks print and `lint` does not. **And
[Q142](open-questions.md) fired with BOTH `check-markdown` floors moving for the first time**: P12 is
the first plan in four to add documents to `doc/decisions`, the directory probe 1 REMOVES, so the
one-directory fixture rose 56 -> 64 against a floor of `< 64` and probe 1 went silent. `M3` is **74**
and `M4` **2700**, retuned from a scratch copy outside the repository — and `M3`'s `META` entry, still
pinned to the literal after three plans of `M4`-only retunes, reported *"the mutation matched nothing"*
and is now agnostic as `M4`'s has been since W33. **TEN late exceptions, zero undeclared.** **Obligation (e)'s second question produced a THIRD instance of W41's own new shape — a
LIST bound to nothing**: `FD-V17` refuses *a key its kind does not declare*, section 3's Edge key
table is the document's only statement of what an edge declares, and `EDGE_KEYS` is a literal in the
validator that **nothing compared to it** — so for one item the code accepted `needs` on an edge while
the table did not list it. Three instances in one plan, closed the same way each time: set equality
against the document, both ways. **Rule 8: 40 provocations, 38 caught, 1 classified a REWRITE on
[Q112](open-questions.md)'s own reasoning, 0 aborted.** **Census CONFIRMED for the TENTH plan running
— 150 questions, 102 open, 2 deferred, 46 resolved**; **Q190-Q193 used**.

**[W41](work-items/w41-what-a-node-can-reach-and-what-names-it.md) is DONE, and [ADR 0040](decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) answers [Q11](open-questions.md) IN GENERAL** — *what a
node can reach is the run's own outputs, and a node id names them relative to a branch path.*
`spec/flow-definition.md` is **v0.11** and section 3 gains **`needs`**: an optional object on a
`task` or a `map` mapping payload keys to declared references, where a reference is `"."`, a node id,
or a one-element array holding one. **Q11's three candidates turn out to be a STACK rather than a
fork** — the previous node's output is the default, a run-scoped accumulator is the state, and a
declared mapping is the access — and **only the third can reach a worker at all, because
`createTask` takes ONE value**. `spec/` is **7 documents, 38 examples, 86 rules**; L1-L5 is
**23 files / 612 cases in five runtimes**, from 574; **L6 is unmoved at 638 assertions over 31 real
runs**, which is the declared result.

**Both of the flows [P12](plans/p12-what-a-node-receives-and-what-a-decision-sees.md) exists for now
run.** `map-with-context.flow.json` gives a map instance its own item **and** the run's config —
[Q166](open-questions.md) **CLOSED**, and the reshaping node that row names as the workaround is not
needed. `map-over-region-output.flow.json` maps over a whole region's output with
`needs: {"scores": ["score"]}` and **no `over: "0"` anywhere**, so [Q165](open-questions.md)'s
coupling to branch numbering is gone rather than worked around; its reducer stays refused.
**[Q164](open-questions.md) is RESOLVED and `FD-C` is the third prefix** — `FD-V` is what a document
may say, `FD-R` what a run refuses, `FD-C` what a run **CARRIES**.

**What decided the ADR is a fact about a CHANNEL, and it is why the register's fork is a stack.**
`createTask` receives `{id, workerType, payload, optional}`, so an accumulator that is not *selected
from* and *composed into* that one value is invisible to the thing that needs it — and adding it
unconditionally would change what **every** node receives. **The accumulator half is free**: it is a
projection of a log this driver has always kept, with **no new retention**, which is P12 fact 1
confirmed from inside the driver. **So the whole cost is the KEY**, and it is the pair
`(node id, branchPath)`: a node id names one output outside a map region and **N** inside one, which
is [ADR 0036](decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
deciding fact for the **third** time. Measured over **eight** region-bearing corpus flows — four
`fanout`-only ones collapsing **nothing**, four map-bearing ones every one collapsing.

**Its conformity reader found the new rule REFUSING A VALID DOCUMENT, and the same spec document
contradicts it nine lines down.** `FD-V28` asked *is the target inside a region the reader is outside
of*, which is true of a `fanout` too — so `needs: {"a": "scoreA"}` on a node after a two-branch join
was refused and the author told to write `["scoreA"]` and index `[0]`. **`FD-C2`'s own measurement,
in the same section, says the ids collapse in exactly the map-bearing flows and in neither with only
`fanout`s.** Every one of the author's 37 probes used a map region, so the whole `fanout` half was
unreachable from the set: *a probe set written against the cases a feature was built for cannot see a
rule that is wrong about the cases it was not.* **18 findings, 7 blocking.**

**Its adequacy reader ran 98 mutations and found 20 real survivors, 8 blocking — and closed
[Q158](open-questions.md), open for three plans.** Renaming W41's two `.test.ts` files out of the
runner's glob gave **`21 file(s), 579 assertions, all passed`, exit 0**: 27 cases, the whole evidence
for six rules, gone with nothing red. **The fix did not have to live where Q158 said it would** —
that row names `test/runner.ts` and `scripts/**`, both in nobody's `Owns`, which is why nobody built
one. The runner and the browser bundle glob the same tree, so a suite that did not load is one
`collected()` does not hold: the bound is a **suite census** in `test/definition/l4-corpus.test.ts`,
set equality both ways, in all five runtimes. **Overlap 1 of 116**, both readers unprimed, and their
one shared subject was reached from opposite ends.

**And obligation (e)'s SECOND QUESTION fires on a product item — the verdict P12's Record asks for —
in a shape neither of P11's two procedures names.** Both instances are **a LIST bound to nothing**
rather than a command bound by name or an override hiding a default. `RULE_PREFIXES` gained `FD-C`
and was itself bound to nothing: **dropping `FD-C` from it costs ZERO**, because the two `FD-C` rules
then match neither pattern and are neither declared nor cited — *Q164's own defect surviving inside
the fix for it*. And the two new `C2` clauses had **no probe**, because `check-spec-selftest.mjs`
derives at **id** granularity where `C2` already existed, so two new `fail()` sites moved nothing and
it reported `20/20, 21/21, exit 0`. **The author instantiated (e) three times as written and all
three passed; the readers found both of these.**

**Rule 8: 54 provocations, 51 caught, 2 survivors — both classified vacuous with a second route — 0
aborted, 0 wrong-reason**, run with the readers' own edits checked back in. **Three harness defects,
all three invisible in the verdict**: `String.replace`'s `$'` truncated a mutation so a **crash** read
as a **survivor** ([Q184](open-questions.md), which then reproduced in the script that inserted its
own register row); `green` accepted `all passed` from a **sibling** child while the subject crashed;
and a probe graded against `check-spec` reported a survivor for a clause whose only binding is
`check-spec --self-test`. **And the item's own driver work was destroyed by `git checkout` on a
dirty tree** — W35's defect, by hand, outside the harness whose header forbids it. **Census
CONFIRMED for the NINTH plan running — 146 questions, 99 open, 2 deferred, 45 resolved**, both halves
at 146 of 146 in exactly one cluster cell; **Q184-Q189 used, Q11, Q158, Q164 and Q166 resolved**.

**[P1](plans/p1-what-satisfies-a-join.md) is complete — five work items, eleven reader-passes, and
its retro is run.** [Q4](open-questions.md) is answered:
[ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md), **a join is
satisfied when its region has no live branches** — and **W5 ran it on a real scheduler**, where
`p1-routed-away` completes under `live-token` and is **`stuck`** under `arrival-count`, with the
join's successor never dispatched. **574 assertions in five runtimes, plus 638 at ladder L6 in two — 29 row labels, 31 real runs.** *(This line read **386** and **342**, then **474** and **489**, after the counts had moved; all are re-measured here rather than carried forward. **The 474/489 pair was stale for four items** — W32, W33 and W34 each moved L1 or L6 and left this line, and W35 added a paragraph nine hundred lines below it and did the same until its conformity reader read the line itself. That is [Q171](open-questions.md)'s class in the document that raised it. The five runtimes are measured too - `npm run gate` runs `test:browser`, which is **chromium only**, so W19 ran `npm run test:browser:all` for firefox and webkit.)*
*(**The two numbers do not count the same thing and the word is the same.** `386` is `test/runner.ts`'s count of `test()` CASES, not of `equal`/`ok` calls — [Q98](open-questions.md), raised by W16 while re-deriving it. `342` is a genuine count of individual `check`/`assertThat` calls in `examples/l6.ts`. W17's conformity reader found the caveat attaching ambiguously to a sentence carrying both.)*

**The retro is in [P1's Record](plans/p1-what-satisfies-a-join.md) and `doc/workflow.md` is v0.3.**
Its central measurement, which should shape how the next plan reads that document: **of the eight
defect classes P1 produced, five have no rung on the ladder at all — and every one of those five was
found by the conformity pass.** Four changes adopted; several findings deliberately left as findings.

**[P2](plans/p2-the-non-success-half-on-a-real-scheduler.md) is COMPLETE and its retro is run —
`doc/workflow.md` is v0.4.** Two of v0.3's four changes needed nothing; the two that changed had both
been **followed** and failed anyway. **Rule 8 is new and has the strongest evidence of any rule
here**: W4, W5 and W9 each shipped a fix for a review finding that could not fail. Ladder
L6 was **thirteen rows and 219 assertions** in Node and Deno at P2's close, and **all six run outcomes occur
there** — `awaiting_action` and `stopped` for the first time, along with `branch.suspended` and
`branch.resumed`. **Nothing in `src/` broke**, which is the weaker result P2 predicted when it
measured `user_action` before the plan was written.

**The pair to read is `suspend / resolve / resume` against `suspend / nobody comes`** — the same
flow, distinguished only by whether a human turns up. The second is `awaiting_action` and **not
`stuck`**, which is what `branch.suspended` exists for, and it is the one row whose expected result
is the backstop: a run parked on a person is not over.

**What W5 changed, beyond running the flow.** Three ADRs, and each came from a different kind of
gap:

- **[0013](decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
  — the scheduler is a *development* dependency and the published library depends on it not at all.**
  The repo had no dependency on it at all until now, deliberately. **Every one of the four facts it
  rests on contradicted something written or assumed here**, and each was one command away:
  `fyflow-scheduler`
  **is** on npm and `@fyflow/scheduler` **is** on JSR (both at 0.2.1, so only 0.3.0 is unpublished);
  Node **cannot** load the sibling's TypeScript source while Deno can; and a typed `.ts` worker
  **does** run under Node 24, contrary to its `AGENTS.md` §3. The last two are
  **[S9](scheduler-upstream.md)** — the first live upstream item since the register was declared
  empty.
- **[0014](decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) — the driver
  produces the fold's input sequence** ([Q41](open-questions.md)). `FoldInput` had five variants and
  **`pathEnded` had no producer anywhere**; two of the six kinds were not observable from outside at
  all, so no caller could have built the sequence. It is what makes L6 clock-free.
- **[0015](decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) — a run whose join can no
  longer fire is `stuck`** ([Q42](open-questions.md), [Q43](open-questions.md)). Run state called
  such a run `completed`. **Q43's own stated reason was false** — `regions` does *not* already hold
  the data, because both policies produce an identical `regions` on that flow, which is exactly what
  `RN-R6` guarantees. Found by trying to act on the register.

**[Q33](open-questions.md) is answered and its leaning lost its own argument:** ladder L6 runs in
**Node and Deno**, not Node only, because the premise *"a real worker file per runtime"* is false at
Node 24. The browser half is [Q52](open-questions.md).

**[P3](plans/p3-a-consumer-reference-the-gate-keeps-true.md) is COMPLETE and its retro is run — it is
what made `doc/workflow.md` v0.5.** [AGENTS.md](../AGENTS.md) is the consumer reference and every snippet in
it is extracted, typechecked and executed by `npm run gate`. **The answer to its question is yes, and
the number is 16%** — the gate covers the snippets and not the sentences between them, and W9's
response was to move the load-bearing claims **into** assertions rather than to guard the prose.
P3's retro says why that is an acceptable steady state and what is not: **the prose absorbed three
`src/` defects** ([Q71](open-questions.md), [Q72](open-questions.md), [Q73](open-questions.md)) rather
than the code being fixed. *Rot is what the gate prevents; **absorption is what it cannot see**,
because an accurate description of a defect passes every check there is.*

**[P4](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) is COMPLETE and its retro is
run — `doc/workflow.md` was v0.6 at its close and is v0.7 now.** It deleted two of those three apologies by fixing the code. One subject — *what is a `Driver`'s
lifetime, and what makes an inbound event or an outbound handle **this run's*** — and three defects
found by readers: Q53's many-run surface, Q72's two-drivers-one-scheduler cross-routing, and Q73's
unfrozen region event. **Its load-bearing fact was measured before it was written and it changed the
design**: filtering `onEvent` by run id — the mechanism the register proposed — closes **one of four**
inbound holes, while `dispatched.has(taskId)` closes all four using state the driver already keeps.
Taking the run id at construction was spiked in the working tree: `src/` typechecks clean and **all
thirteen L6 rows pass**, with the whole cost landing in call sites and in four `AGENTS.md` snippets.

**Twenty-one reader-passes have run and every finding is acted on** — W1 ×3, W3 ×3, W2 ×1, W4 ×2,
W5 ×2, W6 ×2, W9 ×2, W12 ×2, W13 ×2, W14 ×2. **Not one has come back empty**, which is the strongest
thing this repo knows about its own process. **The two-reader overlap is now measured seven times —
1, 3, 3, 3, 3, 4, 4 — and the number to carry is that ABSOLUTE one**: two readers produce 1-4 shared
findings whatever the item's size, and the fraction (8% to 17%) is noise.

*Until P1's retro this paragraph said **"five passes"**, then "six", and gave the sequence as
"4, then 5, then 1, then 4" — W1's three plus W2's, silently dropping W3's three. **It is the
most-repeated self-descriptive claim in the repository and nobody had counted it.** Corrected by the
retro, which also names the class it belongs to: `doc/` is upstream of every check here and is
checked by nothing.*

**The first four found the same shape four times: the code was correct and the tests were pointed
at the wrong half.** W1's pass found an assertion that could not fail; W3's second found a half of
the system nothing asserted on (the join never fired); its third found a half of the *seam* nothing
asserted on; W2's found five of the fold's own rules untestable, because the spec claimed what its
inputs could not supply and the **code narrowed itself until the claim was unobservable** rather
than reporting the conflict. That last one is what `spec/README.md` rule 2 exists to catch, and it
happened because W2 wrote both the spec and the code — **a spec authored by its implementer needs
the conformity pass more, not less.**

**W4 broke the pattern and W5 extended the break.** W4's eighteen cells were all correct and **every
finding was at the edges** — the fake's fidelity, the harness's own reporting, an untested region
shape. W5's were at the edges too, and two of them are new in kind: a **latent flake reported as a
pass** (dropping the L6 harness's microtask boundary survived every assertion, because
`scheduler.shutdown()` masked it), and a **claim in `open-questions.md` that was simply false**. The
middle keeps being sound; what is not checked is the instrument and the prose.

As of 2026-08-30: `doc/concept.md` is v0.2, **Q1 and Q2 are resolved** as
[ADR 0001-0002](decisions/), **Q4 is deferred to a spike**, and
**[P1](plans/p1-what-satisfies-a-join.md)** is planned with five work items. **W1 filled `spec/`
with five normative documents and answered [Q10](open-questions.md) and
[Q13](open-questions.md)**; its spec-conformity pass found **four blocking ambiguities**, one of
which became **[ADR 0004](decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)**.
**W3 built the driver and the validator**, and **W2 built the fold, both join policies and the
sixth spec document** — answering [Q14](open-questions.md) and [Q25](open-questions.md).
**30 questions remain open, 13 resolved.**

**What is decided:** routing executes in the driver, outside the scheduler (0001) · the flow
definition is data and predicates are registered by name, failing at instantiation (0002) · **a
non-success outcome routes only where an edge opts in, and `user_action` suspends until an external
resolution record resumes it** (0004) · the driver normalizes every event into an immutable outcome
record at the listener boundary (0007) · pinned to `fyflow-scheduler` **0.5.2** (Q3) · **three
runtimes from one source tree - Deno via JSR, Node >= 24 and the browser via npm** · and the
normative layer itself, [`spec/`](../spec/README.md), six documents · **run state is a fold of our
own log, and a run has SIX outcomes** (Q14's answer lives in `spec/run-state.md` rather than an
ADR; `stuck` is [ADR 0015](decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)'s) · **a join is satisfied when its region has no live branches** (0003).

**Upstream shipped: `fyflow-scheduler` 0.3.0 landed 2026-08-30**, and **both registries carry it since 2026-08-31** - which is what [ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md) acts on. This repo has
been re-verified against **the code, not the plan** — details and the S-id map in
[scheduler-upstream.md](scheduler-upstream.md). Short version:

- **Four of our eight upstream items settled and we raised none of them** — S4 (timestamps) done,
  **S7 fixed better than we asked**, S8 declined-and-documented, S5 still deferred.
- **[Q32](open-questions.md) dissolved.** The orphaned-task drop that would have masqueraded as a
  stuck join is now a terminal failure, so **P1's validity threat is retired**.
- **[ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
  needed no rule changed** — but every line reference moved, a second dispatch site appeared, and
  timestamps arrived as a **mutable field on the live task**, which makes rule 1 protect *more* than
  it did at 0.2.1.
- **[S1](scheduler-upstream.md) is answered** — the dead `parents` field stays dead and will
  eventually be removed. That left the register with nothing to raise, and **W5 changed that**:
  [S9](scheduler-upstream.md) went live. **It was raised on 2026-09-07 and fixed in 0.5.2 the same
  day** ([W37](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)) — the only item that register has ever
  raised, and the list is back to having nothing waiting.

**[Q4](open-questions.md) is answered, and the answer is
[ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md): a join is
satisfied when its region has no live branches.** It was decided by W4's matrix rather than by the
argument P1 refused as *sufficient* — and the matrix found more than the plan asked for.
Arrival-counting does not merely fail the exotic routed-away case: it hangs on **six of nine rows**,
and an ordinary `optional` task failing is enough. Fixed-`N` is wrong whenever *"how many will
arrive"* differs from *"how many opened"*, and every non-success outcome makes it differ. **The
argument was right about the winner and wrong about the size of the effect.**

**Q24 is answered too, by [ADR 0025](decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md),
and the two one-line refinements got DIFFERENT answers.** `JP-R8`'s is **adopted** — as a third
policy under its own id, `live-token-requiring-arrival`, which is what `JP-R8` itself prescribes — so
a flow that treats a join reached by nothing as a failure can now say so, and the run folds to
**`stuck`** rather than `completed`. `JP-R7`'s is **refused**: over the nine matrix rows it is
`live-token` weakened and never strengthened, differing from it only by reporting `waiting` where
`live-token` is `satisfied`, and it fires a join **zero branches reached** on the **third** of the
**three** rows it repairs — which is `Correction 2`'s point, and the reason *"repairs only P1's row"*
was never the objection.
**`live-token` and `arrival-count` are byte-identical**, so ADR 0003 rules 1-4 stand and not one of
the 36 matrix cells changed. **`liveToken` is still what the library tells you to pass**
([Q96](open-questions.md)).

**The one thing to know before reading anything else:**

> `fyflow-scheduler` **has no dependency graph** - no `dependsOn`, no `parents`, no ordering. Its
> own reference lists them under *"Things that do NOT exist"*.

So the input document, [`FLOW_PLANNING.md`](https://github.com/fyflow/fyflow-scheduler/blob/main/FLOW_PLANNING.md) in the scheduler's repository,
**is written against an API that is not there.** It calls the library "the existing FyFlow DAG
scheduler" and passes `parents: ['extract']` to a constructor with no such field. Its goals survive;
its premise does not. This repo **builds** sequence, decision, fan-out and join rather than wrapping
them, which is a different project of a different size. Details and evidence:
[concept.md](concept.md) section 2.

The trap that made it plausible: `SpawnTaskConfig.parents` is **declared** at
`../fyflow-scheduler/core/workerInterface.ts:50` and **read nowhere** - the spawn path drops it
silently. It typechecks and does nothing — **confirmed vestigial by the maintainer**, so this no
longer rests on our own reading. [S1](scheduler-upstream.md).

**What happens next:**

1. **[S9](scheduler-upstream.md) needs nothing further — it is RAISED AND FIXED**, so this is a
   closure rather than a next step. 2026-09-07, in `fyflow-scheduler`
   **0.5.2**, both halves, plus a second instance of the first that our report had not found
   (`core/workerManager.ts:3`). It was two one-line changes with a measurement behind each:
   `import type` in `core/threadWrapper.ts:5`, and `AGENTS.md` §3's claim that a Node worker must be
   JavaScript. **The published source now loads under Node** — measured, `LOADED under node
   24.20.0 - exports: 10` — which retires the REASON for the two-road split without retiring the
   split. [W37](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md).
2. **[P5](plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) is COMPLETE and
   retro'd, and `doc/workflow.md` is now [v0.7](workflow.md) — five changes, two refusals.** [W15](work-items/w15-the-fourth-column-and-the-chain-nothing-runs.md) is **done**
   — the matrix renders at **four columns**, `JP-R7`'s and `JP-R8`'s variants are asserted as
   **exact row lists** rather than counts, and the `unsatisfiable` chain runs end to end for the
   first time. Both its readers ran and between them found that the two things W15 *created*, the
   render and the two promoted variant policies, were the least-guarded things in the item.
   **[W16](work-items/w16-the-decision-and-what-it-ships.md) is done, both readers run and every
   finding acted on**: [ADR 0025](decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
   answers Q24, adopting `JP-R8`'s refinement as a third policy and refusing `JP-R7`'s, with **not
   one of the 36 matrix cells changed** (386 assertions, up from 370). It also fired
   **`doc/workflow.md` rule 7 (c) for the first time in three plans** — `scripts/check-policies.mjs`
   holds the new `JP-R9`, and **three of its ten probes failed at birth**; the set is **thirteen** now,
   after its adequacy reader found the count vacuous at zero.
   **[W17](work-items/w17-the-all-exit-row-at-l6.md) is DONE — gated in both L6 runtimes, both readers
   run and every finding acted on — and it completed the plan's exit artifact**: L6 is **19 real runs and 342
   assertions**, and the `all-exit` shape now runs on real workers under every shipped policy —
   `completed` under `live-token`, silently `stuck` under `arrival-count`, and **`stuck` with
   `joined: false`** under `live-token-requiring-arrival`, which is the first L6 row here whose join
   is *reported* dead rather than merely never firing. **Its two findings are both about the harness
   rather than the library**: the three declared rows could not test the policy they were built for,
   because `arrived` is zero on the only scenario they run — found by a probe walking the rule's
   clauses, which is P4's amendment answering in the direction W15 and W16 did not see — and **W6's
   causal arrangement was held down by nothing**, so reversing one `Set` literal restored W6's
   original defect with the whole gate green. **Its readers then found two BLOCKING survivors, both
   in the harness**: the termination race could be replaced by a **1200 ms** sleep — longer than the
   run, where W5's recorded probe is 1 ms and truncates it — with everything green, and `lateInputs`'
   one recording could be deleted, making `RN-R12` a tautology on nineteen rows. Both fixed by
   deriving the value from its single source, both provoked. **Overlap 3 of ~31.** The other feature candidates stay where they were: [Q6](open-questions.md) (nested fan-out, nearly free under `live-token`) and
   [Q12](open-questions.md) (map-style fan-out, which makes the count dynamic).
3. **[P6](plans/p6-what-may-share-a-scheduler-with-a-driver.md) is COMPLETE and retro'd** — *what may share a scheduler with a driver?*
   It takes the three questions P5 ruled on but could not own, because **no P5 item takes
   `src/driver/**`**: [Q86](open-questions.md) as **ADR 0027** (is an unparseable task id a defect
   that stops the run, or a task that is not ours), [Q87](open-questions.md)'s one-line message
   defect, and [Q95](open-questions.md)'s unexercised latch. **Its urgency is that `AGENTS.md` §9
   already recommends the topology**: a second `Driver` on the same scheduler is the supported
   answer, and on a scheduler carrying anything else **one settlement stopped every driver on it** —
   which is what [ADR 0027](decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
   removed, so §9 now states one condition rather than two.
   Its measurement narrowed the decision before it was declared — `InvalidTaskId` is raised from
   **one** inbound site Q86 is about. *(P6's plan said **three producers**; the declaration step
   measured it and **two of those three rows were wrong** — `Driver.resolve()`'s site is unreachable
   and the fold has two call sites the plan never named. The plan carries a Correction and
   **[W18](work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md)'s own file is
   the version to reason from**.)* Exit artifact: a scheduler carrying a task this library did
   not mint, two drivers, both runs completing — **confirmed on a REAL scheduler at declaration**,
   where a foreign task settles normally and both drivers go deaf while everything around them
   proceeds. **[W18](work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md) is DONE**
   and **[W19](work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md) is DONE**;
   read each one's status from its own file rather than from this line (`doc/workflow.md` section 1
   rule 5). **The retro IS run, and it made `doc/workflow.md` [v0.8](workflow.md)** — two changes,
   both to rule 8: **break the PROVENANCE of every value an assertion reads** — five blocking
   instances across W14, W17 and W19, every one found by an adequacy reader and none by an author,
   which is section 5 rule 4 made provocable — and **re-run the set after acting on the readers'
   findings, checking their exact edits back in as probes**, which W18 found the need for and W19
   exercised. Rule 7 (c) unexercised for the fourth plan; `check-owns.mjs` retired for the third; the
   two-reader split settled at **ten** overlap measurements and closed to re-litigation. **`doc/` is
   refused a sixth time on a NEW direction**: the register's census line was *correct*, and this
   retro's own re-derivation made it wrong with a parser that could not classify three rows and
   returned a value instead of saying so. Corrected in place.

   **W18 answered Q86 with the third option and it won on evidence neither side of the register row
   had.** [ADR 0027](decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md):
   an inbound task id that does not parse was minted by **no** driver, so it is **`ID-R5`** — reported
   through `onUnmintedTask` and dropped — rather than a refusal that stops the run. **What decided it
   was asking who PRODUCES one.** A foreign task and a worker's own `context.spawnTask()` child can
   never be ours and are the common case on the blessed topology; a `detail.id` that stopped being
   what we dispatched **could** be ours and is rare — and `task.progress`'s detail changed shape at
   0.3.0 with no changelog, so that is measured history rather than a hypothetical. Stopping is right
   for the rare case and catastrophic for the common one, the string cannot tell them apart, and
   **only *report* is wrong in neither direction.** ADR 0023 rule 2 is superseded, one of `ID-R4`'s
   two preconditions is retired, and **tier 1's silence is untouched** — another run's settlement is
   reported by the driver that owns it, an unparseable one by nobody, which is the whole asymmetry.

   **Q95 is closed with a stub and the re-measurement corrected the register a third time.** There
   are **two** latches, not one: deleting the *satisfied* one costs an assertion and produces the
   `DuplicateTaskId` the register recorded; deleting the *unsatisfiable* one — W15's actual survivor
   — cost **0 of 386** and produces no refusal at all. What it produces is a second
   `joinSettled(fired: false)`, or, with a policy that says `unsatisfiable` and later `satisfied`,
   **a join routed out of after being declared dead**, taking `RunState.outcome` from `stuck` to
   `completed` silently. Expected values from `spec/join-policy.md` section 4, not from the refusal.
   **Q87's message sentence is fixed and asserted on its TEXT**; its enforcement half stays a
   precondition with no owner. **Q101 is fixed at the instance and open as a class**: `AGENTS.md`'s
   executed error-class snippet was a closed list compared against a copy of itself, and it now
   enumerates the package's own `Error` subclasses instead — **and the adequacy reader then found the
   same shape inside that fix**, since *documented* means *"in this array"* and section 9's prose can
   still be deleted with the gate green.

   **Both of W18's readers found things, and the two BLOCKING findings of each were about what the
   item had just written.** The conformity reader: five indexes said DONE over an item file reading
   `todo`, and two documents claimed an exception was declared that was not. The adequacy reader,
   35 mutations and 10 survivors: **`ID-R5` was one guard over six refusals with five never
   delivered** — every fixture was colon-free, so `if (taskId.includes(':')) throw e;` narrowed it
   back to ADR 0023 rule 2 with everything green — and **the precondition guarding Q95's stub admitted
   a trailing event that never re-enters `settleJoin`**, so one token restored Q95 exactly as W15
   measured it. Both are fixed and both fixes are provoked (6, 5 and 2 failures). **Overlap 2 of ~26**,
   the ninth measurement and inside the band. **35 rule-8 probes, all 35 tripping exactly their
   declared set** — two of them declaring the EMPTY set on purpose, because the reference's prose and
   `spec/**`'s prose have no route to red. **The harness itself then produced the item's most
   alarming finding**: two probes reached files it had not backed up, and one **deleted the
   `spec/join-policy.md` clause W18 took a late `Owns` exception to write**, with `check-spec` green
   over the damaged file. A mutation harness that does not restore is a mutation.
4. **Read `doc/workflow.md` v0.8 first**, and in particular the things six retros have refused to
   turn into rules — those are the ones most likely to bite. **A register row you are about to act
   on is unverified until you have**, and P4 is the third plan in a row to find one wrong by trying
   to act on it.
5. **Five traps are live for whoever comes next.**
   - **`JP-R7`, and only `JP-R7`** — [Q24](open-questions.md) is **answered**
     ([ADR 0025](decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md))
     and `JP-R8`'s refinement is shipped, so the live trap is the other one: **decrementing
     `arrival-count`'s `N` on `branch.exited` is refused, permanently, and it still reads like an
     obvious repair.** It lives in `test/matrix/variants.ts` and is still run as a matrix column so
     the refusal can be falsified. **W1 wrote one of these itself** before a conformity pass caught
     it. The reason to distrust it is not the one the counts suggested
     (**[Q91](open-questions.md)**): every row where it differs from `live-token` is a row where it
     **hangs**, and on the **third** of the **three** rows it repairs it fires a join **zero branches
     reached**.
   - **`FD-V14`** — the well-formedness rule whose *absence* keeps P1's case authorable, stated in
     the **all-paths** form because the *can-reach* form forbids nothing.
   - **`OR-R1`** — where a `{...e.detail}` spread looks like compliance and is not.
   - **A normative claim with no assertion.** W4 found the join's `null` payload could become `{}`
     and survive 251 assertions; W5 found the driver's `joinSettled(fired: false)` could be deleted
     and survive 278, because **neither shipped policy can reach it**. A seam with two exits and one
     reachable needs a stub, not a real run. **W15 found the third of these and it is still open**:
     the `at most once` latch on the driver's `unsatisfiable` path can be deleted and **all 361
     assertions still pass**, because no policy here settles a join before every branch is terminal
     — so nothing follows to re-enter the seam ([Q95](open-questions.md); **W18 closes it with a
     stub**). **W16 found the fourth, and it is a rung further out**: rewriting
     `spec/join-policy.md` section 3's third row to demand **two** arrivals, or deleting a whole
     column from ADR 0025's pasted table, leaves the entire gate green. Its probes written to the
     **rules** all went red and four of five aimed at what the item **created** survived — W15's
     finding, reproduced in a second item.
   - **The scheduler version is written down twice** — `package.json` pins npm's
     `fyflow-scheduler@0.5.2`, `examples/deno-import-map.json` pins JSR's `@fyflow/scheduler@0.5.2`,
     and ladder L6 runs in both. `npm run check:scheduler` **D3** is the guard.
     *(Until 2026-08-31 the hazard was a gitignored `dist/` in a checkout next door going stale;
     [ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
     removed the link and the hazard moved rather than disappearing.)*
   - **Never put a link into `node_modules`.** A junction placed there so `tsc` would skip the
     sibling's source was followed by `git worktree remove --force` and **deleted most of that
     repository**. `check-scheduler.mjs` D1 refuses one now.

   **[W19](work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md) is DONE and the exit
   artifact exists on real workers.** L6 is **19 row labels, 21 real runs, 373 assertions** in node
   and deno, from 18 / 19 / 342. Row 19 is one `FyflowScheduler` carrying **five** ids this library
   did not mint — one per refusal `parseTaskId` makes — all settling before either run settles
   anything, two `Driver`s, and **both runs `completed`**, each reporting all five through
   `onUnmintedTask` under its own run id. Restoring ADR 0023 rule 2 costs **13** L6 failures and
   leaves each run having dispatched **1 of its 4** tasks.

   **Its three method findings, and the third is the one for the retro.** First,
   **`doc/workflow.md` v0.7 change 3 fired on the first item that could hit it**: ADR 0027's producer
   table named three producers of an unparseable id and could not name the one W19 built, so
   **producer row 4 was added with no rule changed and no exception needed** — the gap that blocked
   W17 from correcting ADR 0015, closed and then used. Second, **rule 8's two halves both worked and
   both missed the blocking survivors**: the rule-written half found that L6 injected a colon-free id
   only, so tier 0 could be narrowed by the shape of the id with the gate green; the
   `Outputs`-written half found that *"counts derived rather than typed"* is unachievable in a
   markdown file. **Both of the adequacy reader's BLOCKING findings were about the provenance of a
   harness value** — a latched flag standing in for *"both drivers were attached"*, and an assertion
   whose source could be swapped from the scheduler to a driver — which is neither a clause of the
   rule nor a row of the table, and is the same shape as W17's `finishedBy` and `lateInputs`. Third,
   **W18's carried-forward proposal held**: the whole set was re-run after acting, twice, and the
   readers' exact edits are checked back in as probes. **Overlap 4 of 18**, the ninth measurement and
   inside the band. Its two questions are [Q107](open-questions.md) — `ID-R5` at L6 sees
   `task.completed` and nothing else, found by both readers independently — and
   [Q108](open-questions.md), the `context.spawnTask()` producer that is demonstrated nowhere at all.

4. **[P7](plans/p7-is-a-join-transitive-over-nested-fan-out.md) is COMPLETE and retro'd** —
   *[Q6](open-questions.md): if a branch itself fans out, does the outer join wait for the
   grandchildren?* **The first plan in six whose subject is a FEATURE rather than an edge**, and it
   takes the shape `doc/concept.md` section 2 names and the library refuses. Exit artifact: a nested
   fan-out running end to end on a real scheduler, with the outer join firing over branches it never
   directly opened, and the join/failure matrix at depth 2. **All four items are done; the detail is
   further down this page and the status is read from the plan's own file.** *(This paragraph read
   *"DECLARED and runs after P6 … nothing has started"* through the whole of P7, while the block below
   read COMPLETE — one index contradicting itself, which is `doc/workflow.md` section 1 rule 5's own
   class. Corrected at P8's declaration.)*

5. **[P8](plans/p8-what-can-be-deleted-with-the-gate-green.md) is DECLARED and runs after P7** —
   *what can be deleted from this repository with `npm run gate` still green?* **It owns `scripts/**`
   and `package.json`**, which are in nobody's `Owns` and which blocked two checks in P7 alone —
   [Q126](open-questions.md) and [Q121](open-questions.md) — and it is the plan that finally
   **exercises `doc/workflow.md` rule 7 (c)**, unused for five plans. Exit artifact: a table of
   deletions the gate accepted at `d8a9ea3` and refuses afterwards, each a checked-in probe with a
   failure count, plus **fourteen dead anchors fixed** in `doc/scheduler-upstream.md`. **[W24](work-items/w24-the-gates-own-wiring.md) and [W25](work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) are DONE and P8 is CLOSED and retro'd — read each status from its own file, not this line.** The gate chain is **16 of 16 entries guarded** where it was 8 of 15, plus the three composed lists one level down — `typecheck`'s five sub-typechecks, `test:browser`'s `build:browser-tests`, and `lint`'s **argument list**. **[Q126](open-questions.md) is resolved.** `S12` is set equality **and order**, not a floor; `S13` carries **two clauses derived from sources that are not the declaration**, so emptying its list fails rather than passes. `scripts/check-source-selftest.mjs` is **the first self-test `check-source` has ever had** — **24 probes, 20 META gradings, 3 SELF gradings**, ~34 s, each probe declaring the exact set it must trip. **W25 built `scripts/check-markdown.mjs`** — every relative link and **every anchor** across
   62 documents / 1602 links / 80 anchored, with `C5` **lifted** rather than copied and the
   **fourteen dead anchors fixed**, [Q121](open-questions.md) resolved. Its central finding:
   **a check can ship against a corpus that cannot falsify its central rule**, three clauses in one
   item — and the item's own fix then made two thirds of that false, which only a reader saw.
   **Roughly half the gate is now one self-test** — 2m31-3m14 of 4m46-6m00, two runs each *(**and the
   comparison is the wrong one: corrected at [P9](plans/p9-when-a-check-stops-checking-what-notices.md)'s
   declaration to 88%, because there are FIVE self-tests and this counts one.** One timed pass over
   the gate's own eighteen entries: **206.3 s of 234.6 s**, with the whole product-facing gate — every
   check, L0-L5 in three runtimes, both L6 runtimes — at **28 s**. The ratio moved because what was
   being compared moved, not because the machine did.)* ([Q133](open-questions.md),
   [Q138](open-questions.md)). **The next plan is P9 and starts at W28.** A third item —
   **W26, a tracked text file's bytes** — was declared in that table and **dropped before it started**,
   on a scope call rather than a measurement; **W26 and W27 are skipped and never reissued**, and the
   next plan starts at W28. Its one irreversible half was taken outside it: **`doc/concept.md` is
   normalised to LF in P8's declaration commit**, byte-identical to the previous `HEAD` with the CRs
   stripped. [Q123](open-questions.md) and [Q131](open-questions.md) return to the register with **no
   owner** — Q123's instance fixed and its mechanism unguarded, Q131 **not fixed at all**, so the two
   register rows still render their Status and Owner columns wrong.

   **Its declaration measured all four of its load-bearing facts and three were wrong** — the twelfth
   plan running to have that happen. `HEAD` is **not** LF throughout (`doc/concept.md` has been CRLF
   since the founding commit); the dead-link count is **0** and the false-positive count **4** rather
   than two; `S11` leaves **seven of the gate's fifteen entries** unguarded rather than one. And the
   census parser it wrote — the aborting kind P6's retro asked for — found a defect nobody had raised:
   **two register rows carry unescaped pipes and render their Status and Owner columns wrong**
   ([Q131](open-questions.md)).

   **Its measurement moved a work item's document, which is the ninth plan running to have the
   load-bearing fact change what got written.** The region maths is **already** nesting-ready —
   `regionSets` computes members transitively, so an outer region's set already contains the inner
   fan-out's nodes — and the defect is the **lookup**: `Driver.regionOf` is `.find()` over regions
   returned in **node-declaration order**, so with nesting a node is in two regions and the answer
   depends on which `fanout` appears first in the file. **No test can see it**, because `FD-V15`
   refuses the only input that would tell them apart. Beside it, `parseTaskId` accepts the dotted
   `branchPath` and **`buildTaskId` cannot emit one**, so the shape `spec/task-id.md` reserved in P1
   has never been produced by this library. And the seventh fact is the one that moved an item:
   `validateDefinition` does not know the policy, so *"invalid under arrival-counting"* cannot be an
   `FD-V*` rule — but `driver.ts:370` already throws `MissingJoinPolicy` at construction on exactly
   that shape. *(**That refusal was struck at W22's declaration**, on a measurement: `N` is
   per-region and `arrival-count` joins on an all-arriving nested flow. See W22's own file, which is
   what an item reasons from — `doc/workflow.md` section 1 rule 5.)* The construction refusal that
   sentence describes was never built
   rather than W20's.

   *(**Corrected by W22 and left standing as evidence.**)* One thing was settled before fan-out and it sized W22: nested fan-out is supported under
   `live-token` and its refinement, and **`arrival-count` REFUSES it** — at construction, not by
   hanging. Repairing fixed-`N` is the repair
   [ADR 0025](decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
   already refused, and reopening it would relitigate two decisions to serve a policy ADR 0003 says
   nobody should pass. **The cost is named rather than discovered**: the matrix gains its first
   declared-empty cells, and how a refusal renders in a table nobody asserts on is
   [Q100](open-questions.md)'s problem arriving in `test/matrix/**`.

   Two `spec/` documents said this was *"scheduled for P2"* — `spec/flow-definition.md` and
   `spec/join-policy.md` section 5 — and it was not taken there. **Stale by four plans, in `spec/`
   rather than in `doc/`**, which is the class six retros have refused to mechanise, one directory
   over.

   **[W20](work-items/w20-what-a-nested-region-is.md) is built, provoked and gated; its readers have
   not run.** `FD-V15` is **retired**, `spec/flow-definition.md` is **v0.7**, the corpus's nested flow
   moved from `invalid/` to `valid/`, and L1 is **416 assertions over 19 files**. **The measurement
   came first and the plan's central claim held**: with `FD-V15` set aside the nested example produced
   **no other finding**, so this was a lift rather than a redesign. The order-dependence was total
   rather than subtle — the same graph gave `outer`/branch **1** or `inner`/branch **0** for `scoreC`
   depending only on which `fanout` was declared first.

   **Two findings for the retro.** A **`Tests:` line that names assertions and not paths is a
   declaration that cannot be audited** — W20's `Owns` gave it no file it was allowed to test in, and
   both test files are late exceptions. And **`doc/workflow.md` v0.8's provenance obligation was
   refined by its own first outing** ([Q112](open-questions.md)): it does not distinguish breaking the
   **actual** side of an assertion from the **expected** side, and the second always survives — three
   of six such probes survived and none was a hole. **Rule 8's founding case also recurred inside rule
   8's own procedure**: reverting `Driver.regionOf` to `.find` cost **nothing**, because nothing drove
   a `Driver` through a nested flow. Closing it produced [Q113](open-questions.md) — `regionOf` is read
   on **three** paths only, and arrivals and openings use keyed lookups, so innermost resolution is
   load-bearing on the **non-success paths only**.

   **[P7](plans/p7-is-a-join-transitive-over-nested-fan-out.md) is COMPLETE and retro'd, and
   `doc/workflow.md` was [v0.9](workflow.md) at that point — it is v0.10 since P9's retro.** Its retro adopted four changes; the central one is that
   **rule 8 gains a fourth obligation — break the LOOP BOUNDS** — on two occurrences in two items,
   four instances, every one BLOCKING and every one found by an adequacy reader. Late `Owns`
   exceptions across its four items ran **five, four, two, zero**, and `check-owns.mjs` stayed
   retired.

   **[W23](work-items/w23-a-nested-flow-on-real-workers.md) is DONE and P7's EXIT ARTIFACT EXISTS.**
   A nested fan-out runs end to end on a real scheduler, in **both L6 runtimes**, with the outer join
   firing over branches it never opened. Ladder L6 is **489 assertions, 23 row labels, 25 real runs**,
   from 373 / 19 / 21 — and it dispatches the **first dotted task ids any rung above L2 has
   asserted**. Three rows on one flow give ADR 0030's three answers; a fourth exists because
   reverting [Q117](open-questions.md)'s fix cost **0 assertions** without it, which is rule 8's
   founding case in the item's own output.

   **Its harness had the same defect the driver had.** `examples/l6.ts` hard-coded `'split'` as *the*
   region in **18 places** — W22's `Cell` finding one rung up — and the inbound `resolve()` step minted
   with `Number(branchPath)`, which is **1** for `'1.0'`, not `NaN`: a well-formed id for a different
   task. **[Q107](open-questions.md) closed for one boolean**; **[Q90](open-questions.md) declined**
   with a measurement correcting P7's stated cost.

   **Its readers found five and three BLOCKING respectively, and the sharpest are two LOOP BOUNDS:**
   the four nested rows could be deleted for one edited number — **green at 388 with lint, typecheck
   and all five `check:*` passing**, and no dotted id dispatched anywhere above L2 — and `UNMINTED`
   had no bound at all, so all six foreign tasks could go, taking **P6's** exit artifact with them.
   **The author ran five bounds probes and all five were caught; the reader found two more**, because
   the author bounded the lists a *row* iterates and not the lists the *file* iterates.

   **[W22](work-items/w22-what-an-inner-join-does-to-the-outer-one.md) is DONE, and it answers the
   plan's question**: [Q6](open-questions.md) is closed by
   [ADR 0030](decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md) —
   **a join IS transitive over nested fan-out, for every policy, and it needed no mechanism.**
   Measured over four depth-2 rows × the four matrix columns: **each region answers exactly as the
   depth-1 row of the same shape does**, sixteen cells, statuses and `describe`s alike. `N` is
   per-region, so an inner branch never needed counting by the outer join — which is why the plan's
   `arrival-count` refusal is **struck**, and with it the driver refusal, the new error class and the
   matrix's declared-empty cells.

   **What ADR 0030 actually decides is the thing that is NOT a depth-1 behaviour one level down.** An
   `unsatisfiable` join emitted nothing at all, which was unobservable at depth 1 because a top-level
   fanout is in no region — and at depth 2 it left an outer branch with **no terminal event** in a
   quiescent run, a state `JP-R5`'s own enumeration does not admit. `JP-R10` ends that branch, the
   enclosing policy decides for itself, and the cascade at depth 3 is **emergent from one emission**:
   `inner` dead → `mid` dead → `outer` **satisfied**, three verdicts and none of them the driver's.
   `spec/join-policy.md` is **v0.10**, 474 assertions in five runtimes.

   **Its two blocking findings are one each, and they point in different directions.** The conformity
   reader found `spec/join-policy.md` **section 2** contradicting the rule the item had just added —
   `branch.lost`'s stated condition is *"a node … reached a terminal state — by settling, or by being
   resolved — and no edge was eligible"*, and a dead join satisfies **neither** clause; the ADR had
   quoted only the trailing consequence and read it as a definition. The adequacy reader found **two
   loop bounds**: a whole depth-2 row could be deleted for 0 failures, and a whole column dropped from
   the depth-2 loop for 0 failures **with the assertion count unmoved**, while the render kept
   advertising four. **An author's probes break VALUES; a reader's broke BOUNDS**, and 28 of the
   author's could not reach either.

   **[W21](work-items/w21-the-branch-path-is-a-path.md) is DONE and a nested run now mints the ids
   the grammar reserved in P1.** `spec/task-id.md` is **v0.7** and its *"`branchPath` is a property
   of the node"* is a statement about the code rather than about the result: the driver stopped
   **threading** a path and now **derives** one, both `split('.')[0]` sites are gone, and `dispatch`
   lost its `branchPath` parameter entirely — it took a path and reduced it to the outermost index,
   so the caller threaded a value the callee discarded. **The fork P7 named was closed on
   measurement**: deriving is total over the corpus, agrees with the threaded value at depth 1, and
   closed [Q114](open-questions.md) with **no new state**.

   **It also shipped a valid definition that hangs**, found by its conformity reader: Q114's first
   fix carried the path and dropped the region, so an inner join routing to an `end` inside the
   enclosing region emitted **no terminal event for the outer branch** and the outer join sat at
   `live: 1` forever. **The fix for that was then found blind at depth 2**, where the truncation its
   adequacy reader probed is the identity — a depth-3 sibling shape hangs a run under
   `arrival-count`. Three more real holes, all in what the item created: the `branchPath` grammar's
   **numeric** shape was untested, so widening it restores ADR 0027's catastrophe; `branchPathOf` was
   unasserted on the one shape both specs say has no path; and `1e21` minted an id `parseTaskId`
   rejects.

   **Two findings for the retro.** The **`Owns` gap recurred and P7's own table had the answer** —
   W21's declaration named paths, as W20's finding asked, and still narrowed `src/driver/driver.ts`
   out of a block the plan's index table had put it in. And **[Q112](open-questions.md) was corrected
   for the second item running, both times by the adequacy reader**: W20 refuted *"expected-side
   probes prove nothing"*, W21 refuted *"a source choice cannot be proved by a single-file probe"*
   with a counterexample at 1 failure. Both are about how the obligation is **instantiated**.

6. **[P9](plans/p9-when-a-check-stops-checking-what-notices.md) is DECLARED and runs after P8** —
   *when a check clause stops checking, what notices, and does it notice for the right reason?* It
   takes the two things P8 measured and declined — [Q138](open-questions.md)'s grading gap and
   [Q132](open-questions.md)'s coverage hole — **as one subject**, because they are the same defect
   from two sides: a META pass grades a broken check by its **exit code**, so it cannot tell *the
   clause I broke was caught* from *something else went wrong*, and because the verdict is an exit
   code the only way to reach it is to re-run the whole probe suite. **Three items, serial**:
   [W28](work-items/w28-a-grading-names-the-probe-it-breaks.md) makes a grading name the probe it
   breaks; [W29](work-items/w29-the-two-self-tests-that-grade-nothing.md) gives a META pass to the
   two self-tests that have none; [W30](work-items/w30-the-clauses-nothing-probes.md) gives probes to
   nine of the sixteen clauses that have none, including
   **`check-spec`'s first self-test in this repository's history**. Exit artifact: **one row per
   check clause — 39 of them — saying what notices when that clause is made present but inert.**

   **[W29](work-items/w29-the-two-self-tests-that-grade-nothing.md) is DONE** — author pass, both
   readers, and rule 8's re-run. *(This paragraph read "its two readers have NOT run, so the item is
   not done" while its own next sentence read "Both readers ran", and `CLAUDE.md` carried the stale
   half too. W29's own file has said `done` since 2026-09-04; W30 read it there, which is
   [`doc/workflow.md`](workflow.md) section 1 rule 5 working as written — **and an index
   contradicting itself inside one paragraph is a new shape for that class**.)* What it built:
   `check-scheduler-selftest.mjs` goes from **12 probes and no grading to 20 probes and 22 gradings —
   one per `fail()` site, one per way the report can lie, one for the exit path** — and
   `check-docs-selftest.mjs` from **14 probes and no grading to 14 and 8**, capped, **with the nine
   clauses it leaves out named in the file's own header** (that list read *six* until W29's conformity
   reader found it undercounting by two, in five documents at once). **Both readers ran: 7 and 19
   findings, six blocking, overlap 1** — the twelfth measurement of section 6's overlap question. [Q141](open-questions.md) is **RESOLVED**: `D5`'s empty-parse
   clause was reproduced inert at **12/12 probes green, exit 0**, and the `CHECK_SCHEDULER_DTS`
   override plus a **hand-written** fixture closed it — **and two more `D5` clauses that were
   unreachable for the same reason**.

   **Its declaration step changed the item's SIZE rather than its table, which is a first.** A META
   entry is **two** check runs — the inertness run W28's readers added — so P9's *"~46 s for ten
   entries"* is optimistic by **2.3x**: measured, `check-docs` is **7.1 s** an entry and
   `check-scheduler` **~0.5 s**, two orders of magnitude apart, and the coverage is bought
   accordingly. [Q148](open-questions.md).

   **Two things it measured are worth carrying, and the first was CORRECTED by its own conformity
   reader.** **A set-equality grading on ids cannot see a clause whose SIBLING reports the same id** —
   `D2`'s and `D5`'s unreadable-input clauses both came back STILL CAUGHT, and the author declared
   both *masked*. **The falsifiability sentence that justified keeping them was false**: deleting
   `D5`'s fallthrough guard left the file at 18/18, 21/21, **exit 0**. The fix is the discriminator
   [Q146](open-questions.md) itself proposes and the author had declined — a `caught` verdict is
   re-run against the unmutated check and the failure **COUNT** compared — and **it split the two
   cases apart**. `D2` is **co-firing**: both clauses report, the count moves 2 → 1, and the clause is
   detected after all. Only `D5` is real masking: same id *and* same count, because its guard exists
   so the two never both report. **Co-firing is detectable by a projection nobody was reading; masking
   is not**, and that distinction is worth more than the count of occurrences. Rule 7 (c)'s form
   meeting its limit one layer out.
   Second, **four `check-docs` clauses made inert are noticed under a DIFFERENT id** — `RUN_FLOOR`
   fires because each mutation deletes a snippet from the extract — so the run fails for the wrong
   reason, which is P9's own question answered four times inside one file.

   **Rule 8: 29 provocations, 14 refused, 15 survivors, and eleven of the fifteen are the ceiling** —
   wider here than in `check-source` because **neither file has a `SELF` list** and
   [W31](work-items/w31-the-self-list-check-policies-never-had.md) is narrowed to `check-policies`, so
   nothing picks these two up. Two positive tests the set could not reach both fired:
   **[Q144](open-questions.md)'s missing case is CONSTRUCTED** — inert on the clean tree, fatal under
   the probe, `ran: no` with the guard live and the identical crash graded `disappeared` with it
   disabled, which is the first demonstration that `ran:` fires anywhere — and the new
   ambiguous-anchor guard refuses a three-way match by name.

   **Its declaration measured six load-bearing facts and four of them changed what got written**, which
   is the fourteenth plan running to have that happen. **The 39 clauses split three ways, not two** —
   13 have a probe and a grading, **10 have a probe that nothing grades** (`D1`-`D5` and `X1`-`X5`;
   `check-docs` and `check-scheduler` have **no META pass at all**), and 16 have no probe. That third
   count is the plan's item decomposition. **[Q132](open-questions.md) is wrong about `check-spec`**:
   seven clauses have no probe, not eight, because
   [W25](work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) gave `C5` two probes one item
   after Q132 was written. **One live defect was found and is [Q141](open-questions.md)** —
   `check-scheduler`'s `D5` empty-parse clause can be made inert with all twelve probes green, because
   no probe supplies a `.d.ts` the parse cannot read; four other clause-level mutations of the same two
   checks were **caught**, so the yield is **1 in 5** and is reported as measured rather than assumed.
   **And a hypothesis the plan intended to build on was killed before it reached the page**: the
   `ALL_CHECKS` allowlist W24 removed is still in three self-tests and is **inert in all three**,
   measured — [Q43](open-questions.md)'s class, refused at the declaration step.

   **And the declaration's own four documents turned the gate RED, which is the seventh fact and the one nobody could have predicted.** `scripts/check-markdown.mjs`'s header argues its `M3`/`M4`/`M5` floors are *"a MINIMUM nobody is obliged to raise, which is what keeps them out of [Q102](open-questions.md)'s shape"*. **Right about the CHECK, false about the PROBES** — `M3` and `M4` are fired only by two `removes` probes that cut directories out of a copy of the tree, so each floor must sit **above the probe's fixture and below the whole tree**. One plan and three work items took *doc/decisions removed* from 46 files to **50** against a floor of `< 50`, and `npm run gate` exited **1**. **So it IS Q102's shape and worse** — two-sided rather than one-sided — and the mitigation is the direction: `RUN_FLOOR` went stale *silently, toward weakness*; this failed *loudly, in the gate*. Retuned to **56 / 1350 / 60** from a measurement, which restores green and **does not remove the ratchet**. [Q142](open-questions.md), owned by W28. *(Retuning it then broke the two META entries pinned to the old literals — rule 7 (b) firing correctly rather than passing: **a mutation pinned to a magic number is unmutatable the moment the number is right to change.**)*


   **The gate's own cost is corrected, and the correction is a factor of nearly two.**
   [P8's Record](plans/p8-what-can-be-deleted-with-the-gate-green.md) reads *"roughly half the gate,
   either way"*; one timed pass over the gate's own eighteen entries says the five self-tests are
   **206.3 s of 234.6 s — 88%**, because P8 compared **one** self-test against the total and there are
   five. **The whole product-facing gate — every check, L0-L5 in three runtimes, and both L6
   runtimes — is 28 s.** *(The absolutes are not constants: this run's `check:markdown:selftest` came
   in at 2m09, below the 2m31-3m14 band P8 recorded, with the total correspondingly below its
   4m46-6m00 band. **The ratio is what to carry**, and what moved is what was being compared.)*
   **Changing what the gate RUNS stays out of scope**, as it was for P8; the plan makes the cost go
   away rather than deciding the policy, and [Q133](open-questions.md) stays open with a better number
   if the saving is not enough.

   **And P9 owes `doc/workflow.md` two verdicts P8's retro proposed and deliberately did not adopt** —
   a **fifth obligation for rule 8, break the WIRING**, and *a check written for a defect you have just
   fixed has no live case*. **The plan is shaped so it generates evidence for both rather than
   restating them**: W30 adds `check:spec:selftest` — the wiring shape, with the prediction written
   down before it runs that `S11` catches it and the obligation is therefore **not** earned — and
   W30's nine constructed cases sit against W29's `D5`, which is a check written for a defect that
   **is** live. **Both halves, which P8's single item could not supply.**

**The fan-out gate is cleared** (`workflow.md` section 7 rule 3) — not because Q4 is answered, but
because P1 builds both of its candidate answers, so W2 and W3 can be written without knowing which
wins.


   **[W30](work-items/w30-the-clauses-nothing-probes.md) is DONE** — author pass, both readers, and
   rule 8's re-run, which caught three defects in the fixes themselves. **Its readers found 10 and 17,
   seven blocking, overlap 2** — the thirteenth measurement of section 6's overlap question. `check-spec.mjs` has a `--self-test` for the first time since W1 and
   `scripts/check-spec-selftest.mjs` is **18 probes and 21 gradings**: one probe and one grading per
   `fail()` site for `C1`-`C4`, `C6`-`C8` — **seventeen of them, no cap** — plus two for the report
   block and two for the exit path. `check-source-selftest.mjs` goes from 24/20/7 to **34/24/10**,
   closing `S4` and `S7`, the two clauses [Q132](open-questions.md) names as having **no second
   route anywhere** — measured unprobed four ways first, all four inert and all four at 24/24.
   The gate chain is **19 entries** and the gate runs **322 / 326 s**, exit 0, zero FAIL lines.

   **Its central finding reverses this plan's own written-down prediction, which is why the
   prediction was written down.** P9 predicted `S11` would catch W30's new wiring and that P8's
   proposed **fifth obligation for rule 8 — break the WIRING** — was therefore not earned. `S11`
   catches the **manifest** four ways, all measured. **It does not catch the SCRIPT**: delete the
   four-line `--self-test` dispatch from `check-spec.mjs` and `npm run check:spec:selftest` runs the
   plain check, exits **0**, and `check:source` exits 0 beside it — **in all five checks**, which
   for `check-docs` is 128 s of gradings silently not running. [Q149](open-questions.md), and **the
   obligation is earned on the item that predicted it would not be.**

   **Two more things it measured rather than inherited.** Both of W29's structural holes are LIVE
   in `check-source-selftest.mjs` — an entry replaced by a **duplicate** of another, and an entry's
   anchor made **global** so one entry disabled all five `S12` sites — each reported `20/20 noticed`
   at exit 0. Both closed and both now bounded by a `SELF` entry. And **[Q150](open-questions.md)**:
   a `corpus` grading is a **pass**, so dropping W30's own import relocation made all 21 mutants
   non-inert and the file exited 0 saying *"0 noticed by the named probe, 21 by the corpus"*. Closed
   there by a declared `MAX_CORPUS = 0`; live in the other four.

   **And the census parser was wrong in a direction no previous one has been.** W30's first one was
   **code-span aware** and aborted on **three rows that render perfectly** — Q101, Q102 and Q117 all
   carry an odd number of backticks. GFM cuts a table row on `|` FIRST and parses inline code
   afterwards, which is also exactly why [Q131](open-questions.md)'s two rows really do render wrong.
   **A parser more careful than the renderer reads a different document.** Corrected, after which the
   census is **CONFIRMED for the second plan running — 109 questions, 73 open, 2 deferred, 34
   resolved**. **The cluster table was stale by three**: Q146, Q147 and Q148 were in no cluster cell
   at all. Corrected in place.
4. **[W31](work-items/w31-the-self-list-check-policies-never-had.md) — the `SELF` list
   `check-policies` never had. DONE** — author pass, both readers and rule 8's re-run; read its status
   from its own file, not from this line. `check-policies-selftest.mjs` is **13 probes / 6 gradings /
   14 SELF**, from 13 / 6 / none, and `check:policies:selftest` is **2.2 s to 14.7 s** — the cheapest
   self-test in the gate becoming a mid-priced one, which is [Q133](open-questions.md) moving the
   wrong way for the right reason and is recorded as a number rather than a ratio.

   **Its declaration was wrong in FOUR places before anything was built**, three inherited from W28's
   state and one falsified by the first measurement: `Reserves: Q146-Q148` **collided with W29**,
   which used all three (corrected to **Q151-Q153**, nothing renumbered); the gate is **19** entries,
   not 18; the baseline sha was W28's; and the Record's prefilled *"one `META` entry deleted — cost
   0"* is **1** — `MIN_META` fires, and the hole is the floor being **lowered**, which the sentence
   did not name. Eleventh time a row has been found wrong by trying to act on it.

   **Its headline is the plan's own question one layer further out, and its own green run could not
   see it.** [Q151](open-questions.md): the `SELF` mutants were written into the scratch directory a
   child deletes on its first line, so no `META` grandchild could re-import them — **all twelve
   entries passed, `12/12 bounded` at exit 0**, while every grading inside every child read *"the
   mutant did not run: this is a crash, not a detection"*. **The whole pass was measuring the
   deletion.** Found by rule 8's set, not by the file. Closed by a **control run** — an unmutated copy,
   run as a `SELF` child, must RUN and must NOT be graded — and reintroducing the defect is refused by
   name. **Live in `check-source-selftest.mjs` and `check-markdown-selftest.mjs`.** *(It also
   falsified the item's own cost figure: the first "after" reading was **8.5 s** against the broken
   harness. A performance number taken from a crashed child is a claim about the crash.)*

   **What a `SELF` list buys, measured as a pair in one file — which is what P9's retro asked this
   item for.** **Thirteen** mutations cost **0 before and non-zero after**: `MIN_META` and `MIN_PROBES`
   lowered, alone and compounded, and the `MIN_PROBES` disjunct; a duplicate `META` entry; an ambiguous
   anchor and a global one; a second `wide` exemption; a grading passing as `corpus` and the inertness
   run that produces it; the `ran:` guard both halves; the PROBE-PASS verdict; set equality downgraded
   to cardinality; `ALL_CHECKS` widened; and **`MAX_WIDE -> 99`, which W30 recorded as SURVIVING in
   `check-source`**. *(This read **nine** and enumerated **eight** — W31's conformity reader.)* **And what it buys nothing against is anything that returns before
   it** — `if (!meta) -> if (true)`, `if (nestedSelf) -> if (true)` and the outermost verdict all
   survive, because the mutation reaches the parent as well as the child. *The regress does not move
   one list further out; it stops at the first thing that can return early.* **The item's own header
   argued the opposite before it measured, and corrected it in place.**

   **Two of W28's three verdicts CANNOT be made load-bearing and the item was declared to make all
   three so** — [Q152](open-questions.md). The ABORT and STILL-CAUGHT arms assign a message and never
   touch `ok`, so each costs 0 with the list in place exactly as without one. Only the `ran:` guard
   changes a verdict — and **this file is the only place its case exists**: W28 had to DELETE that
   mutation as a `META` entry because it crashes under its own probe ([Q144](open-questions.md)), and
   as a `SELF` entry it is exactly right. **The second demonstration anywhere that `ran:` fires.**
   *The mutation that could not be a `META` entry is the one that makes a `SELF` entry for the crash
   guard possible.*

   **Rule 8: 40 provocations, 20 refused, 20 survive, run five times** — an author pass and four
   re-runs, each after acting on the previous one's findings. Three ride-alongs taken with a live case
   measured first (`MAX_CORPUS = 0`, the `META` distinctness bound, the GLOBAL-anchor guard with one
   declared `wide` exemption); the ambiguous-anchor guard taken **with no live case, stated**, its
   entry constructed from the one anchor in the check that occurs twice. **Two DECLINED on
   measurements**: a per-id coverage bound fires on nothing here (all three ids are graded) and a
   per-site one would need five new `META` entries, one of them impossible inside this item's `Owns`;
   and the failure-COUNT discriminator would ship as decoration, because **no entry here grades
   `caught`**. [Q153](open-questions.md) is the third: a `SELF` list is bounded by count and not by
   content, measured live at `13/13` exit 0, closed here and live in the two other files that have one.
   **[Q149](open-questions.md) is confirmed for the sixth check**, and `S11`/`S12` do not fire for this
   item, which adds no `package.json` entry — exactly as W30 predicted.

   **The census is CONFIRMED for the third plan running — 112 questions, 76 open, 2 deferred, 34
   resolved**, both halves at 112 of 112 in exactly one cluster cell. *(Re-derived again after the readers,
   unchanged.)*

   **Its two readers found 5 and 10, eight blocking, and the OVERLAP IS 0** — the fourteenth
   measurement of section 6's question and the first outside the settled 1-4 band, with the caveat
   that both were primed with the same list of the author's uncertain claims. **The adequacy reader
   found guards that were not there**; four of its five blocking findings were unreachable by the
   author's own set and **three of the four are one shape — an entry written to a LIST when the thing
   it had to bound was a GUARD**. The sharpest is **the PROBE-PASS verdict**, `caught !== PROBES.length`,
   which cost **0** and which the ceiling list had never carried: it is what makes rule 7 (b)
   load-bearing, because a probe whose mutation matches nothing prints its FAIL, prints
   `12/13 probes caught`, and without it **exits 0**. **The conformity reader found claims that were
   false** — [Q152](open-questions.md) generalising a one-file measurement to six (`check-spec` and
   `check-scheduler` do not carry the message-only form, and disabling it there costs 1 and 2); a
   ceiling row quoting a literal the file no longer contains, where the live form costs **4**; and a
   cost decomposition that put the whole run inside one of its phases. **All eight closed**, and the
   re-run then found a ninth the readers had not — retargeting one entry closed `MIN_PROBES -> 0`
   alone as well as its disjunct — and took `ALL_CHECKS` from a hand-copy to a **derivation**, which
   is the one cross-count this file has and the answer to the sub-question W28's reader named and
   could not instantiate anywhere. The parser aborted on Q119 and
   Q71 (declared exemptions) and **twice on [Q87](open-questions.md) in two opposite directions** —
   2 cells reading its first line, 3 reading its last, for a row that renders as 4 — before the width
   check was put where this file's own stated predicate says it belongs. **A parser can be wrong about
   a row in two opposite directions on the way to being right about it.**

7. **[P10](plans/p10-is-fan-out-one-feature-or-two.md) is DECLARED and runs after P9. It is a
   PRODUCT plan, and it is the first since P7** — *is fan-out one feature or two?*
   [Q12](open-questions.md), open since P1, and **the only open question that might mean the library
   is missing a FEATURE rather than a guarantee.** It takes [Q36](open-questions.md) and the fan-out
   half of [Q11](open-questions.md) inside it, **not because both touch a payload but because a
   map's whole deliverable IS the join's payload**. **Four items, serial**:
   [W32](work-items/w32-what-a-map-fanout-is.md) — what a map-fanout is, and what its `branchPath`
   is (ADR 0036); [W33](work-items/w33-a-map-at-run-time-arity.md) — the driver and the three
   policies at run-time arity, and N=0 (**DONE** — read its status from its own file);
   [W34](work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) — what a branch receives
   and what a join carries (ADR 0037); [W35](work-items/w35-a-map-on-real-workers.md) — a map on
   real workers. Exit artifact: **a map-fanout running end to end on a real scheduler, its arity
   taken from the previous node's output, its join firing over branches nobody declared.**

   **[W33](work-items/w33-a-map-at-run-time-arity.md) is DONE — a map DISPATCHES, and the two
   decisions it took were both forced by a measurement.** `npm run gate` is **`GATE EXIT=0`, zero
   FAIL lines, 19 chain entries, 361 s**; L1 is **21 files / 553 cases** in all five runtimes with
   parity; **L6 is unmoved at 489 assertions / 25 real runs**, which is the declared result. `spec/`
   is **7 documents, 33 examples, 78 rules**.

   **`arrival-count`'s `N` is RE-SOURCED from `branch.opened`.** A map region's `branches` names the
   ONE declared entry whatever the run opens, so `N` was **1 at every arity** — and on a three-item
   map the policy **routed the join out after four of six region events with two branches still
   live**, measured end to end at ladder L2. Every failure W4 recorded was `N` too LARGE, which
   hangs; this was `N` too SMALL, which **completes the run wrong**. It is a re-sourcing and not
   `JP-R7`'s refinement, and that is measured rather than argued: **6 of the corpus's 6 static
   regions agree on the two sources, and all 36 matrix cells are unmoved.** **[Q159](open-questions.md)
   is ANSWERED NO** — the one policy that appeared to need the node KIND needed the **arity**, and
   after the change **not one shipped policy reads its `Region` at all**, which `deno lint` reported
   as an unused import.

   **N = 0 is `stuck`, and what forced it is that the naive arm folds an empty map to `completed`.**
   A map that opens nothing appended nothing, so `RN-R10` iterated nothing and a run that reached no
   `end` node reported success — `ADR 0015`'s own false statement. The answer is a new
   **`regionEntered`** input, which closes a claim `spec/run-state.md` section 2 has made **since
   v0.1** (*"one entry per fan-out region ENTERED"*) and could not supply while `FD-V9`'s floor made
   every opener open at least two. `spec/join-policy.md` is **v0.12**, `spec/run-state.md` **v0.4**,
   `spec/flow-definition.md` **v0.9** (`FD-R2`).

   **Its two readers found 15 and 10, TEN blocking between them, and the two sharpest were code
   defects the author's 31 provocations never reached.** A `map` at the **entry** node over an empty
   list reported **`running`**, so `RN-R12` called an unfinishable run unfinished; and a map at N = 0
   **nested** in a branch left that branch opened with **no terminal event at all**, a `JP-R5`
   violation `JP-R10` could not reach because it triggers on a policy verdict no policy can give.
   **Both are shapes the N = 0 ruling was not measured at** — it was written entirely from a map at
   depth 1 — which is `doc/workflow.md` section 1 rule 5's writing clause on a spec ruling rather
   than on a count.

   **And the conformity reader found [ADR 0036](decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
   own central finding ONE LAYER DOWN.** The ADR decided *two features* because `branchOf` is keyed
   by branch NODE ID and collapses repeated entries; **every per-region RUN-TIME structure in the
   driver is keyed the same way**, and a map is the first construct that enters one opener node more
   than once in a run. On a definition the validator accepts with **zero findings**, seven tasks all
   settling `done` produced a **`stuck`** run with two regions merged into one entry.
   **[Q160](open-questions.md)**, refused at construction rather than run wrong. *The same fact,
   found twice, one layer apart, by two different readers.*

   **Rule 8: 43 provocations, 39 caught, 4 survivors, 0 aborted**, run four times — three in the
   author pass and once more with **twelve of the readers' own edits checked back in**, all of which
   fire. **Overlap 2**, the sixteenth measurement, inside the 0-4 band, **both readers unprimed**.
   **NINE late exceptions, zero undeclared** — W32 took five; **this is the second data point and it
   is nearly double**, and seven of the nine are `scripts/**` or a `spec/**` document W33 does not own.
   **Q160-Q163 all used, Q159 resolved. No ADR** — 0037 is W34's.

   **[W34](work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) is DONE, and
   [ADR 0037](decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
   answers [Q36](open-questions.md), [Q11](open-questions.md) at the fan-out edge and
   [Q154](open-questions.md).** **A satisfied join carries the arrived branches' results keyed by
   `branchPath`** — `JP-R12` — one entry per branch that emitted `branch.arrived`, keys in ascending
   segment-wise-numeric order, a branch that exited or was lost having **no key**, and `{}` for a join
   nothing arrived at. **`settleJoin` still takes no payload parameter**: the order-dependence the
   `null` refused is in *which one*, and carrying **all** of them keyed by branch is not picking one,
   so the guard that kept Q36 a question is exactly where W3 put it. And **`JP-R11`** fixes the other
   end — a `fanout` branch receives its **own copy** of the value the fanout node received, a `map`
   instance receives **its own item** as its own copy, and the invariant is *no two nodes ever receive
   the same object*. `spec/join-policy.md` is **v0.13**, `spec/flow-definition.md` **v0.10**,
   `spec/run-state.md` **v0.5**; `spec/` is **7 documents, 33 examples, 80 rules**; L1 is **21 files /
   574 cases in five runtimes** and **L6 is unmoved at 489 / 25**. `npm run gate` is **`GATE EXIT=0`,
   zero FAIL lines, 19 entries, 417 s**.

   **The split is [ADR 0036](decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
   own split one layer on, and it is not free.** What a branch receives differs by **opener** — a
   fanout has nothing to give a branch but the value it received; a map has `over`'s array and an
   index — so the fan-out half needed **two** rules. What a satisfied join carries is **one mechanism
   for both**, because `branchPath` is already defined for both kinds. **The payload layer confirms
   ADR 0036 from a direction that ADR did not look in.**

   **What decided it is a cost measurement, not an argument.** A clone per branch is **2207.94 ms
   against 1.50 ms at N = 1000** over a 117 KiB payload — a factor of ~1470, and **quadratic**,
   because a map's arity and its payload grow together. For a `fanout` the same fix is **linear in a
   number the DOCUMENT declares**: 9.3 / 14.2 / 23.0 / 44.3 ms at arity 2 / 3 / 5 / 10. **The fix that
   is catastrophic for the feature that needed it is unnecessary for that feature and affordable for
   the other** — a map's instances no longer receive one value at all, at **2.29 ms**. And
   [Q22](open-questions.md) gains the measured run it has asked for since P1.

   **[Q154](open-questions.md)'s unmeasured half is measured, and it is [Q61](open-questions.md)'s
   asymmetry in the opposite direction.** On a real scheduler: **inline**, branch B's worker saw A's
   write in its own input *before it ran*; **threaded**, neither saw the other. **`a.payload ===
   b.payload` is `true` in BOTH** — the sharing is a driver-level fact and only its OBSERVABILITY is a
   pool option the flow author does not control and the driver cannot see, which is `OR-R2`'s own
   reason for cloning *including where it is redundant*.

   **The order-dependence did not vanish when the payload was keyed — it MOVED, and it is invisible at
   depth 1.** Integer-like object keys are re-ordered ascending **by the language**, so a depth-1 join
   is deterministic for free; **dotted keys keep insertion order, which for a join is settlement
   order**. W21's and W22's shape a third time in this tree. The only fixture that can discriminate is
   a map at **N = 12 nested in a fan-out branch, settled descending**, where unsorted, lexicographic
   and segment-wise-numeric give three different answers.

   **Its two readers found 16 and 19, ELEVEN blocking between them, overlap 2** — the seventeenth
   measurement, inside the 0-4 band, **both unprimed**. **The conformity reader found a declared
   OUTPUT that did not exist**: *the matrix at run-time arity* was promised by `Outputs`, Scope and a
   prediction, and `matrix.test.ts` recorded its absence in a sentence with no owner. It is now **five
   map rows × four columns**, rendered as a third table and asserted cell by cell — **and building it
   immediately found a defect nothing else could.** `arrival-count-decrementing`, `JP-R7`'s refused
   variant, still read `region.branches.length` — the **pre-W33** source, which is **1 at every arity**
   on a map region — so it fired a three-item join after **one** arrival. **W33 re-sourced the policy
   and its declared variant did not follow, and the reason it stood is the reason W33's change looked
   free**: on every `fanout` region the two sources agree, so all 52 cells were unmoved then and all 52
   are unmoved now. *A re-sourcing that moves nothing is a re-sourcing nothing can check, until an
   input exists on which the two sources differ.*

   **And the sharpest cell makes a decision W33 measured at zero into a load-bearing one.**
   `map-zero-items` under that variant answers **`satisfied`** — `0 >= 0`, no `need > 0` pin — **and
   the join does not fire, because the driver never asks at N = 0.** W33 deleted that `settleJoin`
   call on the ground that *"no policy can answer anything but `waiting`"*: true of the three
   **shipped** policies, false of the fourth column, and with the call restored it would route a join's
   successor over a region **no branch ever reached**. The ruling stands; the reason given for one row
   of it is now scoped in `spec/join-policy.md` section 5, the **second** correction that section has
   taken under the writing clause.

   **The adequacy reader's three blocking survivors were all real and all cost 0**: `collectArrivals`
   could drop every `null`-valued arrival — the *present-with-`null`* versus *absent* distinction the
   item argues hardest for had **zero live cases**; a `map` at **N = 1** could be handed the whole
   payload, which is the arity a `fanout` can never reach and the one where the pairwise check iterates
   **zero** pairs; and a `fanout` could copy for branch 0 only, because the fanout half was checked on
   a **two-branch** fixture while the map half got an `n(n-1)/2` loop from the start.

   **The methodological finding is that a PROVENANCE probe cannot be graded against a correct
   implementation.** All five of the author's obligation-(c) probes survived the first pass, because a
   source swap on a working driver leaves both sources agreeing. **What discriminates is a COMPOUND
   probe** — swap the source **and** break the driver, then ask whether the pair is still red — and
   under that grading four of five came back bound and one did not. **Rule 8's own *a survivor is one
   only once a second independent route confirms the clause was reachable*, instantiated for (c)
   rather than asserted about it.** Its mirror on the defending side: **a negative control must sit on
   the expression the probe changes**; the author's first one read a different variable and the
   compound stayed green.

   **Rule 8: 43 provocations, 39 caught, 4 survivors, 0 aborted**, run four times, with **twelve of
   the readers' own edits checked back in — all twelve fire**, one of them at **41 failures**.
   **P10 prediction 3 CONFIRMED for the third time in a third shape**: obligation (e) here produced **a
   value that is COMPUTED and never READ**, distinct from W32's check-not-run and W33's guard-that-
   cannot-reach-its-subject, so it generalises past a harness. **Prediction 4 CONFIRMED** — 0037 is
   taken. **SIX late exceptions, zero undeclared**, against W32's five and W33's nine — and
   **declaring `spec/**`, `AGENTS.md` and `test/driver/**` in advance moved six files out of the late
   column**, while **not one of the five that remained was predictable from a file SET**: each was
   created by the CONTENT of the change. **Census CONFIRMED for the SIXTH plan running — 125
   questions, 85 open, 2 deferred, 38 resolved**, all 120 live ids in exactly one cluster cell;
   **Q164-Q166 used and Q167 deliberately NOT taken**, on the ground that W35 had not reserved — **false, and W36 acted on it**: W35's own file had reserved Q167-Q168 since P10's declaration. Corrected at W35's declaration; that item moved to Q170-Q172. And three
   consecutive items have had a `Reserves` line collide.

   **[W35](work-items/w35-a-map-on-real-workers.md) is DONE and P10 HAS ITS EXIT ARTIFACT: a map runs
   end to end on a real `FyflowScheduler`, in both L6 runtimes, at an arity written down nowhere.**
   Ladder L6 is **638 assertions, 29 row labels, 31 real runs** from 489 / 23 / 25, and its six new
   rows are `map / live-token`, `map / arrival-count`, `map / N = 0`, `nested-map / live-token` and
   `map / FD-R2 - over names no array` and `map / one item, two instances`. `npm run gate` is **`GATE EXIT=0`, zero FAIL lines, 19
   entries**; L0-L5 are unmoved, which is the declared result. **No spec change and no ADR** — this
   item reads `spec/` and writes none of it, which its declaration says and which held.

   **The arity comes from a worker's return value, and that is the sentence to check the rows
   against.** The `split` role returns one item per word of a string, so `map.flow.json` dispatches
   `r22:score:0:0`, `:1:0` and `:2:0` because a worker returned three things — a number in no
   definition field and in no harness constant. Each instance gets **its own item** and computes a
   **different** score, which is what makes ADR 0037 rule 3 distinguishable from its negation; the
   join carries all three back keyed by branch path; and `nested-map` puts a map inside a fan-out
   branch, so its instances run at **`1.0` and `1.1` at an arity nobody declared** and the outer
   join's collection has **a collection at key `1`**. **Every expected value was written from `spec/`
   before the first run and every one of the five rows passed first time**, including the nested
   collection and the hand-computed assertion total.

   **What reverting costs, in L6 failures, is the item's other declared output.** W32 — a map opens
   no region — **kills the run at construction** with `FD-V11: node is not reachable from entry`,
   which is P10's declaration measured from the other side. W33's arity — 35. W34's collection — 6.
   **And W33's `arrival-count` re-sourcing costs exactly ONE**, on the map row alone, with every
   static row unmoved: the run still reports `completed`, every branch still arrives, and the only
   observable is that `publish` receives **one key where three were declared**. *`N` too large hangs
   and is loud; `N` too small completes and is silent.* **Before this item that revert cost 0 at L6.**

   **Its headline is [W36](work-items/w36-the-scheduler-pin-moves-to-0-5-1.md)'s finding one layer
   further in, and it is rule 8's obligation (e) in a fifth shape.** `S12` binds the gate chain's
   entry NAMES and W36's `D6` binds the Deno rung's runtime and its resolution — and **nothing bound
   either rung's FILE**, nor anything of `test:l6`'s command beyond its name. Measured: pointing either rung at
   `examples/run-flow.ts`, which exports functions and runs nothing, costs **zero** failures across
   four checks, so **every exit artifact this repository has — P4's, P6's, P7's and P10's, all in one
   file — is silently unrun for one edited word.** Closed by three more `D6` clauses, as a declared
   exception with the reason, plus four probes and three `META` entries; `check-scheduler`'s self-test
   is **26 probes / 27 gradings** from 22 / 24.

   **And the harness deleted the item's own work.** Its first version restored with
   `git checkout -- src/ examples/` — correct on a clean tree, catastrophic on a dirty one — and took
   five rows, three flows, a worker role, a pool and a provenance fix with it, reported as a run of
   anchors gone stale. **[Q151](open-questions.md) one layer out**: P9 found a harness grading a
   deletion it caused; this is a harness whose *restore* is the deletion. Recovered and re-verified;
   **[Q172](open-questions.md)** asks whether rule 8 should say anything about the harness at all.
   **Rule 8: 25 provocations, 23 caught, 2 declared ceilings, 0 survivors standing** — with **two of
   the catches bought**, being the two the `D6` fix answers. Three more things the item wrote down
   were false and its own set caught each: a probe that was **vacuous** because a duplicate object key
   is won by the last one; a *control* declared to cost 0 that was a **real hole**, `failureNames: []`
   disabling the assertion it declares; and a `META` entry paired with a probe that trips a
   **sibling** clause under the same id at an unmoved failure count, which is W29's masking shape
   caught by W29's own discriminator. **[Q171](open-questions.md)**: `examples/README.md` said
   **478 assertions** where `l6.ts` declared **489**, and `git show` dates it to the W23 commit that
   wrote it — three items and two plans, in the paragraph whose own parenthetical says nothing checks
   these numbers, written by the item correcting the previous instance of the same error two clauses
   later. **Census CONFIRMED, still the sixth plan running and the fourth confirmation inside P10 — 129
   questions, 89 open, 2 deferred, 38 resolved**, both halves at 129 of 129 in exactly one cluster cell; **Q170-Q172 all used**.


**[P12](plans/p12-what-a-node-receives-and-what-a-decision-sees.md) is DECLARED — *what does a node
receive, and what does a decision see?* — and it is the first PRODUCT plan since
[P10](plans/p10-is-fan-out-one-feature-or-two.md).** It takes [Q11](open-questions.md) **in general**
and [Q8](open-questions.md) as one subject, because a predicate and a worker are two things asking to
reach something the previous node did not produce. Three items, serial: **W41** (what a node can reach
and what NAMES it — **ADR 0040**), **W42** (what a decision sees), **W43** (both blocked flows on real
workers). **Reserves W41-W44, Q184-Q193, ADR 0040-0041**, and the Q block is **ten rather than five**
because P11 spent five before its second item raised a question and extended twice.

**Its exit artifact is two ORDINARY flows this library cannot express today** — *score each item
against the run's config* ([Q166](open-questions.md)) and *score, then fan out over the scores*
([Q165](open-questions.md)) — both blocked for the same reason, and both worked around today by a
reshaping `task` node the author should not have to write.

**Its declaration measured six facts and two correct the register rows it is built on — the
FOURTEENTH time a plan has found one wrong by trying to act on it.** **[Q8](open-questions.md)'s
stated cost is already paid**: the driver's log is append-only, has one `push` and no `splice`,
`shift` or reassignment in 1790 lines, carries `result` for every settled task, and is exposed by
`snapshot()` — so **a run-scoped accumulator is a PROJECTION of state that already exists and adds
zero retention**, measured by building one over the log with no new driver state.
[Q19](open-questions.md)'s *"if Q8 or Q11 retains every node output"* therefore describes **today**;
its premise is corrected and the question it is actually about — whether that retention should be
**bounded** — is untouched and declared OUT.

**And the sharp one is [ADR 0036](decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
deciding fact for the THIRD time.** The obvious accumulator is *an object keyed by node id*. Measured
over **all four** region-bearing corpus flows: on `fanout-join` at arity 2 and on `nested-fanout` at
depth 2, **zero** node ids collapse — `FD-V19` refuses a node in two branch entries of one fanout, and
even the dotted paths give one record each; on `map-fanout` at arity 3 and on `map-in-fanout`, one id
collapses in each. **Exactly the map regions collapse, at any depth, and no `fanout` does: a node id
names one output outside a map region and exactly N inside one** — so the plan's decision 2 is that *the KEY is the decision, not the mechanism*, and W41's
evidence must include a map region or it does not bind. Three candidate keys are named and none
preferred: the node id, the task id, and the pair `(node id, branchPath)`.

**[Q164](open-questions.md) is FORCED and its own row says so.** `spec/flow-definition.md` has
`FD-V*` for validation and `FD-R*` for a runtime refusal, and the ordinary edge's payload contract is
neither — it is prose with no id. That row's stated forcing condition is *"a second rule about what a
run carries that has no region to hang on"*, which is P12's deliverable in one sentence; it is the one
`scripts/**` edit the plan expects. **Q11 is decided BEFORE Q8**, reversing the register's dependency
direction: the payload half has three real cases and the predicate half has one sentence, and Q8's
mechanism is **one field and one call site** either way.

**[P11](plans/p11-what-should-the-gate-prove.md) is COMPLETE and RETRO'D, and `doc/workflow.md` is
[v0.12](workflow.md).** Two items —
[W38](work-items/w38-the-dispatch-nothing-binds.md) and
[W39](work-items/w39-what-the-gate-proves-and-what-it-costs.md) — **W40 reserved and never issued**,
and every one of its defects in the INSTRUMENT rather than in the product — the third process plan in
four, after P8 and P9. It touched `package.json`, `scripts/**` and documents and nothing else:
`src/`, `spec/`, `test/` and `examples/` are byte-unchanged, L1 unmoved at **574 cases in five
runtimes** and L6 at **638 assertions over 31 real runs**. *Read every status from the item's own file.*

**v0.12 adopts THREE changes, and its central finding is that obligation (e) was instantiated by the
author THREE times in one item and its two readers then found EIGHT more instances in the same item.**
(1) **Rule 8 obligation (e) gains a SECOND QUESTION — not *was the check run*, but *was what it ran
what SHIPS*** — on five consecutive items in commit order — W36's `--import-map`, W35's `test:l6` argument, W37's
`D3` comparing two version strings while one of them was unfetchable, W38's `G2` and W39's `G4` —
every instance found by a reader and every one blocking, with a procedure for each of its two shapes: bind a command by **equality on
the whole string** and run *that* command, and where a check must **configure** its subject to observe
it, **read the default declaration rather than running it**. That second procedure was invented twice
independently, one file apart — W38's `G2` and W39's `G5` — which is the argument that an author does
not reach it from the axis alone. (2) **Section 1 rule 5's writing clause gains a WHEN: a measured
number is re-taken on the tree the item ships** — three occurrences, and the sharpest is **W39, the
item whose entire subject is measurement, reporting its headline saving as `-38.3%` where its own ADR
says `-23.8%`**, because that is the figure at code-complete and its readers' twelve blocking findings
put 75 s back on afterwards. (3) **Section 6 pass 3 gains rule 6: a retro may correct a false claim in
the files of the items it reviews** — because change 2's own correction had nowhere legal to land, a
finished item's file being on nobody's `Owns`. **Three proposals refused**: an `Outputs`-table
obligation for process items (rule 8 (b) degenerates where the outputs are documents), a ladder level
for the gate itself, and a check over `doc/` for the ninth time.

**All four predictions CONFIRMED, and the result is that two were right about the conclusion and wrong
about the MECHANISM** — both of those the reversible kind. Prediction 1 carried a derived half and a
reach half in one row and **only the reach half reversed** (*"read the SCRIPT rather than the
manifest"* was wrong about the manifest: both new entries were repointable and deletable for **zero**,
because `S12` binds entry NAMES). Prediction 4 was right about ~170 s and wrong about which thing
produces it — or rather W39's verdict was: it called the **exclusive prefix** the binding constraint
from one run, and two more show the prefix (180.4 / 174.0 / 173.1) and the group (176.2 / 183.7 / 185.0)
are the same size with the lead not a property of the tree, so the prediction's named floor was right and what it missed was a
second term beside it. **v0.11's harness requirement is CONFIRMED and KEPT unchanged**, having fired once before either
item started and at least six times inside them; its one limit is that a control is per-harness and
`check-wiring-selftest.mjs` destroys its NEIGHBOUR's fixtures, which is [Q182](open-questions.md)
rather than an amendment.

**And the retro priced [Q182](open-questions.md) from the runner's own report — and needed TWO runs
to state it honestly, which is change 2 firing on the retro that adopted it.** `selftests` is
**356.7 / 357.6 / 358.1 s wall** over three end-to-end gates, and the exclusive prefix — `check:wiring:selftest`
at 167.8 / 160.9 / 160.0 plus `check:scheduler:selftest` at 12.6 / 13.1 / 13.1 — is **180.4 / 174.0 /
173.1 s: 50.6% / 48.7% / 48.3%** of it. **The first draft said *they cost more than the other five
together*, from one run; the next two both reverse it** (174.0 against a group of 183.7, then 173.1
against 185.0), so *the exclusive prefix is the binding
constraint* is a claim inside [Q179](open-questions.md)'s band and is withdrawn from ADR 0039 and from
the register. **What reproduces far better is the entry's wall clock — 355.7 to 371.1 over seven runs, at most
4.3%** —
because concurrency averages the variance the serial chain exposed. **And the retro made three
successive claims about that spread and the next run falsified each** (±0.3%, ±0.2%, 0.7%, under 2%),
which is [Q179](open-questions.md) firing four times inside the retro that cites it: *a number stated without
its sample is a prediction wearing a measurement's clothes.*

**One correction the retro owed and took: ADR 0039's refusal of candidate (a) compared across a
line.** It read *"516 s is 5.7x `doc/workflow.md` section 8's own budget"*, and that budget is *plan
gate (**L0-L6**): under 90 s* — while L0-L6 is **18.6 s**, inside it by a factor of five and always
has been. What costs 393 s is proving the checks can fail, which is **not a level of section 4** and
for which section 8 had **no row at all**. *The correct statement is the stronger one: there was
nothing to be over, which is what "nobody decided that" means.* Section 8 now carries the row; the
refusal stands on its other ground.

**Census CONFIRMED for the EIGHTH plan running — 140 questions, 97 open, 2 deferred, 41 resolved**,
36 ids in both tables, 140 of 140 in exactly one cluster cell, and **the parser aborted ZERO times on
its first run**, which is a first. It was written from the register's own accumulated predicate and
nothing else, and every clause of that predicate is there because an earlier parser got it wrong and
wrote down which way. *Writing the hazard into the file the parser reads is the mechanism, and after
seven plans it worked.* **It found the standing line right and W39's note beside it wrong** — 139 / 96
against 140 / 97, taken before [Q183](open-questions.md) had a row, with *"140 of 140 in exactly one
cluster cell"* in the same sentence.

**[ADR 0039](decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)
answers the plan's question, and the answer is the two properties of the chain nobody had ever
chosen: ORDER and CONCURRENCY.** `npm run gate` is **393.1 s from 516.1 — −23.8% against a ±13%
band — with no clause deleted, no probe dropped and no bound lowered.** *(318.2 s at code-complete;
the two readers' twelve blocking findings cost **75 s**, every second inside `check:wiring:selftest`,
which runs alone and is therefore all critical path. **Two fifths of the saving went back on the
binding.**)* Four of the five candidates
are refused with a measurement each: *keep it* fails because nothing about the arrangement was
chosen; *move them off the gate* has no **something else**, because
there is no CI, no workflow and no git hook; *reduce what the two 120-second self-tests prove* buys
less than concurrency does, since those two now run **at the same time as each other**; and *stop
paying for a process per probe* is 137 s of real interpreter boot that `NODE_COMPILE_CACHE` does not
touch and that costs seven self-tests rewritten to remove.

**The order was the ladder's inverse, and the file that enforces order says why that is wrong.** The
chain ran **488.9 s of self-test ahead of `lint`**, while the comment above `GATE_CHAIN` in
`scripts/check-source.mjs` argues that `S12` must assert ORDER because *"&& in sequence is the only
implementation section 4's ladder has"*. **A rule stated correctly, in the file that enforces it,
over a list that broke it by a factor of five hundred** — section 6 pass 3 rule 3's sharpest shape,
with neither the rule nor the check at fault.

**Two of the seven self-tests cannot share the tree, and only one of the two was predicted.**
[Q148](open-questions.md) named `check:scheduler:selftest`, which deletes
`node_modules/fyflow-scheduler`. **Nothing had ever said that `check:wiring:selftest` cannot
either**: it stages every `scripts/check-*.mjs` **flat into `dev-dist/`** — the directory every other
self-test uses for scratch — and runs those copies with their dispatch falsified, so one reaches the
real `check-docs` body and deletes the fixed path `dev-dist/docs`, and another launches the whole
`check-spec` self-test. Concurrently that produced **three findings that were facts about a
neighbouring process** — `doc/workflow.md` v0.11's harness requirement, one process away from the
harness it was written for. Each now declares itself with a `SELFTEST-EXCLUSIVE:` marker in its own
file, which `scripts/run-selftests.mjs` reads and **`G4` computes a second time and compares** — a
second computation over one source rather than a second source, which is [Q181](open-questions.md).
**And their exclusivity is a second term BESIDE the floor and of the same size**: `check:wiring:selftest`
runs alone before the concurrent group starts, because the copies it stages ARE the real checks and they
write `dev-dist`'s fixed paths — [Q182](open-questions.md) with a price on it. *(This read *"is now the
gate's binding constraint"* until P11's retro measured three gates: 180.4 / 174.0
/ 173.1 for the prefix against 176.2 / 183.7 / 185.0 for the group, the lead not a property of the
tree.)*

**`G4` is what replaces the three clauses the seven lost by leaving the chain.** `S11`, `S12` and
`G3` all refused an entry leaving the gate, and all three go quiet the moment the seven are not in
the chain — so `S11`'s and `G3`'s membership tests became *reachable from the gate*, and `G4` makes
the second disjunct a fact: it asks the runner for its plan and compares it to the manifest both
ways, including each entry's COMMAND, and then runs it against a stub and requires every planned
entry completed. **That last clause costs 0.6 s where W38 dropped its analogue for costing 8.4** — the
same argument, *a clause is worth its cost in proportion to how quiet its absence is*, coming out the
other way.

**And `G5` is what both readers bought between them.** All three of `G4`'s runs set an override, so
**the configuration `npm run gate` executes is the one configuration `G4` never takes** — `G2`'s own
sentence, one file across, in the file that quotes it. Twelve blocking findings, **every one of them
`npm run gate` at exit 0 with the self-tests silently not running**: `--plan` or `echo` in the chain
entry, `|| exit 0` appended to it, the override merely exported, `let ok = true;`, the spawn printing
instead of running, the exclusive filter falsified, the plan guarded on an override, the marker
directory moved. `G5` reads the **nine declarations** that decide an unconfigured run and compares each
to the one form it may take. [Q133](open-questions.md) and [Q148](open-questions.md) are **RESOLVED**;
[Q181](open-questions.md)-[Q182](open-questions.md) are what the mechanism does not bind, and P11's
block had to be **extended to Q176-Q183** to hold them, because all five of its reserved ids were
spent before W39 raised a question.

**P11's DECLARATION, which is what the paragraphs below were written from.**

**[P11](plans/p11-what-should-the-gate-prove.md) was DECLARED as — *what should the gate prove, and what
is it actually proving?*** It takes [Q133](open-questions.md), [Q148](open-questions.md) and
[Q149](open-questions.md) as one subject: **the gate is 93.2% self-test, and the whole of that can be
deleted by hand at exit 0.** Two items, serial: **W38** closed Q149; **[W39](work-items/w39-what-the-gate-proves-and-what-it-costs.md)**
is DECLARED and takes the cost decision as **ADR 0039**.

**W39's declaration falsifies the plan's own stated METHOD, which is the thirteenth time a plan or item
has found one of its own inputs wrong by trying to act on it.** P11's `Exit:` line asks for *the same
entries timed in one pass before and after, with the change argued from the pair* — and **two
consecutive passes over one unchanged tree differ by 13.0% at the total (482.9 s, 545.8 s) and 43.3%
at `check:docs:selftest`**, the second most expensive entry in the gate, while `check:markdown:selftest`
moved 0.0%. **It is not a scaling factor that divides out.** [Q179](open-questions.md). **A
deterministic proxy does exist and the item will use it**: the seven self-tests spawn **2583 node
processes**, a count that does not vary, and 2583 × 0.174 s reproduces the 449.8 s self-test half to
within a second — independently confirming W38's 588/461 for `check:source:selftest` at 587/463 three
commits later. **[Q180](open-questions.md): a third of the gate is Node booting** — 2583 × 59 ms =
152 s of interpreter startup doing no work — which adds a fifth candidate answer P11 did not name.
**And candidate (c) has no *something else*:** there is no CI, no workflow and no git hook in this
repository, so moving self-tests off the gate is two changes rather than one, the second reaching into
a directory that does not exist. That is what **W40** is reserved for. W40 is reserved and expected unused. Reserves **Q176-Q180**; **ADR 0038 is spent
and not reused**, on the P9-reserved-and-skipped precedent.

**Its declaration measured four facts and two of them correct the register rows the plan is built
on** — the thirteenth time a plan has found one wrong by trying to act on it. **The gate is 433.7 s:
9.1 s of checks, 404.1 s proving they can fail, and 20.5 s for all of L0-L6 in three runtimes
including both real-scheduler rungs.** Q133's row said *"about a minute"*; P9's retro recorded
*"about 79%"* of a 438 s gate. **The share rose to 93.2% while the RATIO fell from 81x to 44.3x**,
because the checks got dearer — and **two files are 61% of the whole gate**,
`check:markdown:selftest` at 141.7 s and `check:docs:selftest` at 123.0 s against the 1.1 s and 5.1 s
they grade.

**[Q149](open-questions.md) is confirmed live in ALL SIX at exit 0** — the dispatch cut by a brace
match so the file stays valid, **151 to 373 bytes**, self-test unrun, everything green. `S11` reads
the manifest and `S12` compares the chain's entry names, so both are satisfied; what is unbound is
what the script does with the flag. **And [Q148](open-questions.md)'s hazard is real, wider than
its row and wrong about its own mechanism**: FOUR entries fail with `node_modules/fyflow-scheduler`
moved aside, not one, and the `AGENTS.md` snippet the row blames is tagged ` ```ts check `, so the
hazard is type resolution — `typecheck` fails the same way with no snippet involved.

**`doc/workflow.md` v0.11's harness requirement fired before any item started**, three commits after
it was adopted: the first version of the Q149 probe cut more than the dispatch and produced **exit 1
in all six** — a crash reading as a detection — caught because the control had already been run and
held.

**[W38](work-items/w38-the-dispatch-nothing-binds.md) is DONE and [Q149](open-questions.md) is
RESOLVED — in SEVEN checks, by THREE clauses, in a check that did not exist when the item was
declared.** `scripts/check-wiring.mjs` is new: **`G1`** runs every `:selftest` script with the flag
and `CHECK_<NAME>_SELFTEST` pointing at a stub, and requires the stub's sentinel exit code — so it
binds BEHAVIOUR rather than the presence of the string `--self-test`, which is in a **comment** in
every one of them. `npm run gate` is **`GATE EXIT=0`, zero FAIL lines, 21 entries**; the self-test is
**16 probes / 8 META gradings / 6 SELF entries**, all passing.

**Two of the three clauses came from the readers, and the first is [Q149](open-questions.md)'s own
hole living inside the check written to close it.** `G1` sets `CHECK_<NAME>_SELFTEST` on every run and
**the gate never sets it** — so the one configuration the gate actually runs is the one configuration
`G1` structurally cannot observe. Verified before acting on it: with
`if (process.env.CHECK_SPEC_SELFTEST)` wrapped round `check-spec.mjs`'s exit, `check:wiring` printed
*All checks passed*, its self-test reported 6/6 and 2/2, and `npm run check:spec:selftest` printed the
plain spec check at exit 0 with **18 probes never running**. **`G2`** closes it by reading the DEFAULT
target. **`G3`** closes the other half the adequacy reader found: both new gate entries were
repointable at another script, and deletable outright, for **zero** — `S12` binds entry NAMES — so the
manifest's entries are now derived from the `scripts/` listing, both ways.

**Its scope was amended mid-item on a measurement, and that measurement is the finding.** The clause
was declared as `S14` inside `check-source.mjs` and built there. It cost **+236 s** — `check:source`
0.7 → 9.7 s, `check:source:selftest` 81.2 → 317 s — because **`check-source-selftest.mjs` re-runs
`check-source` 461 times**, counted with a process-start hook rather than estimated, so a 0.51 s
per-run clause is multiplied by 461. **A check's price is not what it costs to run — it is that
multiplied by how often the thing around it is re-run**, and the multiplier is a property of the file
you add a clause to, written down nowhere. [Q176](open-questions.md), which W39 needs.

**And the trap the item named for itself caught the clause written to avoid it.** Its scope section
refuses a substring test **by name**, citing W37's `D7`; `G2` then shipped `block.includes(want)`, and
the conformity reader broke it in one edit — repoint the default and leave
`/* was check-spec-selftest.mjs */` beside it, for `check:spec:selftest` running **another check's**
34 probes at exit 0. Rewritten as capture-and-compare, which is the identical fix `D7` took one item
earlier from the other reader. **Third instance in three items, second made by a reader.**
[Q178](open-questions.md) is its smaller sibling and happened twice in one hour: `check-wiring.mjs`
declares `const DISPATCH = "if (process.argv.includes('--self-test')) {"` and then matched **its own
declaration**; the probe written to test that clause then rewrote the constant instead of the code and
reported a working check as SURVIVED.

**Rule 8: 8 provocations beyond the 30 checked in, 4 caught, 1 vacuous, 1 declared ceiling, 2
survivors, both closed** — graded on the failure lines, each mutation restored from a snapshot with
**the restore asserted by md5**. **P11 prediction 3 is CONFIRMED five times**, and once in the
sharpest direction: *`G1`'s spawn timeout is one millisecond* was **caught BY the control**, turning a
harness fault into one named line instead of eight misleading verdicts. **Nine defects, all in the
instrument and none in the clause.** One survivor was created by a fix made an hour earlier — a
`NOT RUN` exemption that made a clause reporting `NOT RUN` *while running and failing* invisible to all
sixteen probes; the other is a loop bound on a loop bounded by a **brace**, closed only by deriving
the block's end **twice**, from brace matching and from column-0 layout, with a compound probe
confirming which half does the work. **[Q177](open-questions.md)**: L0 reaches neither file this item
ships — no lint tree and no tsconfig names `scripts/**`. **Census: 135 questions — 94 open, 2
deferred, 39 resolved**, all 135 in a cluster cell; **Q176-Q178 used, Q179-Q180 reserved and unused,
no ADR, no `spec/` change.**


**[P10](plans/p10-is-fan-out-one-feature-or-two.md) is COMPLETE and RETRO'D, and `doc/workflow.md`
is [v0.11](workflow.md).** Its question — *is fan-out one feature or two?* — is answered
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

**[W37](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md) is DONE and the scheduler pin is
`fyflow-scheduler` 0.5.2**, from both registries. **It is the fix for [S9](scheduler-upstream.md) — the only item this
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
maintainer. [Q173](open-questions.md).

**Rule 8: 14 provocations, 12 caught, 2 declared ceilings, 0 survivors.** A provenance probe on `D7`
could not be graded against a correct implementation — the literal and `${PIN}` are the same string
today — so it took a **compound** probe, W34's finding restated. **And this item reproduced W36's own
central defect within the hour**: correcting `CLAUDE.md`'s S9 sentence left `and it is ready to
raise.` stranded on the next line, saying the opposite of the sentence before it — the
neighbour-of-a-corrected-line leak W36 recorded twelve times, found by re-reading rather than by any
check. **Census: 132 questions — 92 open, 2 deferred, 38 resolved**, both halves at 132 of 132;
**Q173-Q175 used, ADR 0038 SKIPPED, `deno.lock` regenerated** with its integrity hash unchanged.

   **[W36](work-items/w36-the-scheduler-pin-moves-to-0-5-1.md) is DONE and the scheduler pin is
`fyflow-scheduler` 0.5.1**, from both registries — npm and JSR, `latest` on both. **It belongs to no
plan**, on [ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
own precedent: an environment change belongs to no plan, and taking a reserved id would make a plan's
ledger false. It is a **work item rather than a chore** because it falsifies a sentence in the
normative layer — `spec/README.md` rule 6 named 0.3.0 as *"the version we pin"*.

   **The bump is behaviourally clean and that was measured rather than assumed.**
`core/FyflowScheduler.ts` is **byte-identical** between 0.3.0 and 0.5.1 — 1851 lines, zero changed —
so all eleven lines `spec/` cites are unmoved; the `user_action` event pair holds, measured by running
it; `SpawnTaskConfig.parents` is still declared and dead, so `doc/concept.md` section 2's founding
fact is re-verified at a second version; and **L6 passes 489 assertions / 25 real runs in BOTH
runtimes**. The reference grows 858 to 887 lines and **every added line is `worker.setup.*` /
`worker.teardown.*`**, a family this library subscribes to not at all — [Q167](open-questions.md).
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
allowlist**, so `D6:` failure lines were invisible to the id parse ([Q43](open-questions.md)'s class,
which W29's declaration killed for three other self-tests).

   **Rule 8: 25 provocations, 19 caught, 6 declared ceilings, 0 aborted**, with twelve reader edits
checked back in — **and the re-run found that a fix for a reader's finding was HALF a fix**, which is
that obligation's founding observation. `PROBES` now carries **three** bounds it did not have —
citation, distinctness and content — the set `META` has had since W29. **Overlap 1**, the eighteenth
measurement, inside the 0-4 band, both readers unprimed. **Census: 126 questions — 86 open, 2
deferred, 38 resolved.** Q167 used; **Q168 and Q169 reserved and unused**. **No ADR**: the decision
(one exact version, from both registries, `D3` comparing the halves) is ADR 0029's and is unchanged —
[Q3](open-questions.md) is **amended, not reopened**.

   **Its declaration was WRONG about its own gate and it was settled in writing before anything was
   built.** The `Gate:` line said `L0-L3, L5` and mapped L5 onto `npm run check:policies`, calling it
   *"`JP-R9`'s two halves"*. That check reports under **three** clause ids, is a **static** spec↔code
   set comparison, and is **not a ladder rung at all**; L5 is the join/failure matrix and lives in
   `test/matrix/**`, which is **W34's**. The item runs L5 as a **regression it must not break** and
   does not climb it. **Twelfth time a declaration row has been found wrong by trying to act on it.**

   **Its declaration measured seven facts and four changed what got written — two of them made the
   plan substantially smaller than [Q12](open-questions.md)'s row reads.** The **id GRAMMAR already
   admits run-time arity**: 500 ids for one node at 500 indices are 500 distinct strings and the
   nested forms round-trip, so `spec/task-id.md` needs no format change. And **two of the three
   shipped policies never read `region.branches`** — measured with a `Proxy`, not read — and answer
   identically at N=3, N=7 and N=1, which is
   [ADR 0030](decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)'s
   *"it needed no mechanism"* a second time. **So P10 is a definition-and-driver plan, not a join
   plan.**

   **What it must decide is what the DERIVATION pins.** `branchPathOf(regions, nodeId)` takes no
   run-time input, so three dispatches of one node mint **one id of three** and the second is a
   `DuplicateTaskId` — which is `FD-V19`'s own stated reason for existing and falsifies
   `spec/task-id.md` section 1's *"`branchPath` is a property of the node"*, the sentence
   [W21](work-items/w21-the-branch-path-is-a-path.md) made true one plan ago.

   **And three findings are live today rather than hypothetical.** `arrival-count` at a run-time
   arity does **not** hang — it fires the join **on the first arrival with two branches still
   live**, a failure direction W4's matrix never saw. **N=0 is `waiting` in all three policies**,
   and `FD-V9`'s arity floor means the static feature can never reach it. And **a fan-out hands ONE
   payload object to every branch** — `a.payload === b.payload` is `true`, so a branch mutating what
   it was given mutates its siblings' input, with the stored record protected and `spec/` silent:
   [Q154](open-questions.md), measured at L2 in **one flow** with `createTask: (c) => c`, and the
   thread-pool half **not** measured.

   **[Q9](open-questions.md) is declared OUT with a measurement rather than on scope, and left
   open.** Freezing the argument is already effectively done and catches mutation only;
   double-evaluation caught **1 of 4** impurity shapes and is *flaky* on `Math.random()`; and
   **ladder L3, the rung the register cites for it, structurally cannot reach a predicate** —
   routing is already decided by the time the fold sees anything. That last is a finding about the
   **ladder** and is [Q155](open-questions.md).

   **[Q142](open-questions.md) was measured BEFORE the documents landed, which is a first.** Its
   window is two-sided, it caught the last two plans, and P10's declaration adds five documents that
   survive both `removes` cuts — so the one-directory fixture was predicted to go **51 → 56** against
   `M3`'s floor of `< 56`, and it did, exactly. Floors retuned to **64** and **1720** from a
   three-count pass, `M5` untouched at 60 for the third plan running, and the two `META` entries
   pinned to the old literals repointed — **rule 7 (b) firing correctly rather than passing.**

   **[W32](work-items/w32-what-a-map-fanout-is.md) — P10's FIRST item, and the first PRODUCT item
   since [W23](work-items/w23-a-nested-flow-on-real-workers.md) — has its author pass, BOTH READERS
   rule 8's re-run and the gate re-run after acting on them all DONE — the item is COMPLETE.** `npm run gate` is **`GATE EXIT=0`, zero FAIL lines, 19 entries, 7m18**, L1 **20 / 517** and L6 unmoved at **489 / 25**. *(Read its status from its own file, never from this
   line — `doc/workflow.md` section 1 rule 5.)*
   **[Q12](open-questions.md) is ANSWERED and it has been open since P1:
   [ADR 0036](decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
   — fan-out is TWO FEATURES over ONE REGION.** `map` is a fifth node kind:
   `{ "kind": "map", "over": "items", "branch": "score" }`, **one** branch declared and N instances
   opened by the run, where a `fanout` declares N branches known at authoring time.
   `spec/flow-definition.md` and `spec/task-id.md` are both **v0.8**, `spec/README.md`'s rows moved
   with them, and L1 is **20 files / 517 cases in five runtimes** (from 19 / 474), with the
   definition suite at **5 / 118** from 4 / 82 and the driver suite at **7 / 166**. `check:spec` is **7 documents, 33 examples, 77 rules**.

   **The finding that decided the ADR had not been measured before, and it is a fact about a data
   structure rather than about a feature.** `branchOf` is a `Map<string, Set<string>>` **keyed by
   branch NODE ID**, so `branches: ["x","x","x"]` collapses to **one** entry and `region(F)` is
   `{x}` — **the repeated-entry encoding of a map does not express N branches even to the layer that
   would have to honour it.** Meanwhile `FD-V19` fires **`n(n-1)/2`** times on that encoding
   (measured 1, 3, 6, 10, 15, 45 at N = 2, 3, 4, 5, 6, 10; 124 750 at N = 500) and iterates **0**
   pairs over a one-branch region. **The same rule, quadratic on one encoding and vacuous on the
   other.** What the two features share is the **region**; what differs is the whole of the
   **fan-out** — every piece that carries over (`reaches`, `branchOf`, `region(F)`, `after(F)`,
   `FD-V12`, `FD-V13`, `FD-V20`, `FD-V22`, the join, the id grammar) is region machinery.

   **So `FD-V9` is UNCHANGED, `FD-V19` is UNCHANGED, and [Q27](open-questions.md) is UNTOUCHED —
   which corrects the framing P10 handed the item.** P10's declaration and Q27's own row both said
   *"a map is `FD-V19`'s condition on purpose"*. **That is true of the ENCODING and false of a `map`
   node**: one branch means *"two distinct branch entries"* has no instance, so a map does not lift,
   weaken or reach the refusal. Both rows are corrected in place. `FD-V25` is the map's own rule —
   a separate id rather than clauses bolted onto `FD-V9`, because a rule about two kinds is the
   confusion the ADR exists to remove — and four rules had their text widened to name the new kind
   (`FD-V2`, `FD-V6`, `FD-V12`, `FD-V24`).

   **P10 prediction 1 is CONFIRMED on both halves, and `src/driver/ids.ts` was not edited at all.**
   The grammar, `parseTaskId` and **`buildTaskId`'s signature** are all unchanged — that file is in
   W32's `Owns` precisely because P10 raised the possibility, and the evidence is that it is
   untouched. What changes is `spec/task-id.md` section 1's **heading**, corrected rather than
   deleted: a branch index is a property of the **NODE** inside a `fanout` region and of the
   **DISPATCH** inside a `map` one. **`ID-R6`** is the refusal that keeps the derivation from
   guessing — `branchPathOf` takes an optional item index **per region** and throws
   `UnresolvedBranchPath` naming the node and the map, because the measured alternative is minting
   `r1:x:0:0` for every dispatch and dying at `ID-R1` naming a *duplicate*, which is the symptom
   rather than the cause. The prose half is falsified one level further than P10 stated:
   `branchPathOf` answers `"0"` for **every node of the branch subgraph**, not only its entry.

   **P10 prediction 3 FIRES — rule 8's fifth obligation generalises past a harness, and P10's retro
   owes that verdict either way.** Three instances in W32's own paths, all named in the item file
   **before** the set was written. A **corpus flow renamed out of the `.flow.json` glob** was
   noticed by **nothing** — the only bound was *"the corpus is not empty"* and `check-spec`'s `C4`
   never opens a file — and is now closed by a **set equality both ways** against
   `spec/flow-definition.md` section 7's own table. **That equality had a live case the day it was
   written**: `nested-fanout.flow.json` was added by
   [W20](work-items/w20-what-a-nested-region-is.md) and never documented, so the spec's own example
   index was stale by one **for a whole plan** with every check green. A **rule present, correct and
   unreachable** was caught twice. And **a whole `*.test.ts` file renamed out of the runner's glob —
   26 cases — is noticed by NOTHING**, at exit 0 with no line printed:
   [Q158](open-questions.md), in `test/runner.ts` and `scripts/**`, which are in nobody's `Owns`.

   **Rule 8: 31 provocations, 28 caught, 0 survived, 0 aborted, 3 read by hand**, graded on the
   **failure lines** rather than the exit code. **One real survivor was found and closed**:
   `opensWith` read from `branches.length === 1` instead of from the opener's kind survives the
   whole suite, because `FD-V9`'s floor means the two sources agree on every VALID document — closed
   by constructing the discriminating input, an **invalid** one-branch `fanout`, which `regionSets`
   is handed anyway. **Three things W32 wrote down were wrong and its own set caught each**: two L1
   fixtures made a CYCLE, so `FD-V10` fired and the whole region family was skipped (both now assert
   `!FD-V10` explicitly); the expected set named **`C4`**, which *"never opens the file"* by
   `spec/README.md`'s own bold sentence; and the census caught [Q156](open-questions.md)'s status
   cell reading `open - deferred by W32`, which a classifier reads as **deferred** — one row across
   two columns whose totals still summed, with **no abort**.

   **[Q142](open-questions.md) was predicted NOT to fire and did not**, with the three counts taken
   **before** any file was added — whole tree 72 / 2212 / 108, `doc/decisions` removed **56**, both
   removed **45 / 1565** against floors of 64 / 1720 / 60. W32's only new markdown document is the
   ADR, which lives in the directory both `removes` probes cut. **No exception on
   `scripts/check-markdown.mjs` was needed**; the tree is now **73 / 2289 / 115**.

   **`Owns` audit: 20 paths, ZERO undeclared, TWO late exceptions**, both predicted or measured
   before they fired rather than discovered at the join. `index.ts` re-exports `src/definition/regions.ts` with `export *`, so
   `UnresolvedBranchPath` reached the package root without W32 touching `index.ts`, and section 9's
   executed snippet went red at `X4` ([Q101](open-questions.md)) — the check working exactly as its
   own paragraph says it should. The edit is the minimum that is not a lie, because **no `Driver`
   dispatches a map yet**. **[Q157](open-questions.md)** is the gap behind it: **no P10 item owns
   `AGENTS.md`**, so the plan as declared ships a node kind the consumer reference never describes.

   **And the item's own Record contained a number measured BEFORE the change it described, which is
   how the sharpest defect was found.** The L1 row read *"506 on chromium"* from a run made before
   the corpus equality existed. `npm run test:browser:all` then reported **0 file(s), 1 assertion**
   and `PARITY FAIL` in **all three** browsers: the bundle inlines only `spec/examples/` JSON, suites
   read their fixtures at **module scope**, and a `readText` throw while the bundle is LOADING takes
   **all twenty suites** with it — reported as *"the suite never reported"*, naming no file.
   **L1 was green in node and deno and broken in all three browsers**, which is section 4's *"a rung
   reported green without saying which runtimes it ran in is a rung that ran in one"* catching it.
   Fixed by inlining the one document (the second late exception), and provoked: the probe restores
   `0 / 1` and prints `PAGE ERROR … fixture not inlined in the browser bundle`. **This is section 1
   rule 5's provenance clause — *any copy, including your own* — inside a Record written to describe
   an item's own gate**, which is [W23](work-items/w23-a-nested-flow-on-real-workers.md)'s exact
   failure one plan later. **`npm run gate` is `GATE EXIT=0`, zero FAIL lines, 19 chain entries,
   6m21**, with L6 unmoved at **489 assertions / 25 real runs** in node and deno.

   **BOTH READERS HAVE RUN: conformity 12 findings / 6 blocking, adequacy 11 survivors of 29
   mutations / 5 blocking, OVERLAP 2** — the fifteenth measurement and inside the settled 0-4 band.
   **Neither was primed**, unlike W31's pair, so it is comparable with the thirteen before it. Their
   two shared subjects were reached from opposite ends: the `branch: 5` guard (attribution vs
   coverage) and **a `map` as the `entry` node** (re-deriving the spec sentence vs mutating `FD-V3`
   and finding nothing failed).

   **The sharpest finding is aimed at the thing W32 was proudest of.** The check built to close the
   corpus wiring hole **could be made vacuous by one source-expression swap**: re-source
   `documentedValid` from the spec parse to the disk listing and both set differences are empty by
   construction, with the author's own `e2` probe passing again underneath it. **The comment above
   the guard named that exact failure and then guarded it with a bound the disk listing satisfies** —
   the author reasoned from the mechanism to a conclusion about what could not be bound, and all four
   of W32's provenance probes were in `regions.ts` rather than in the check it had just written.
   Closed with a discriminator the directory cannot produce: section 7's rows carry a second cell
   saying what each flow *shows*.

   **And the conformity reader found a defect W32 had CREATED in the driver.** `enter()`'s switch had
   four arms, no `map` arm and **no `default`** — and `node.kind` is a union TypeScript does not
   require a switch to exhaust, so `npm run typecheck` was green. **W32 is what made a `map`
   definition valid**, so a valid document routed into a map node and the driver did nothing: the run
   dispatched one task of six and folded to **`completed`**, which is character for character the
   false statement [ADR 0015](decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) exists
   to remove, and the silent stop `spec/flow-definition.md` section 3 refuses **by name**.
   Reproduced independently before acting on it, and closed by a **`default`** arm — the hole is the
   missing exhaustiveness, not the missing kind — reporting through `OR-R10` with an **existing**
   error class, so [P10](plans/p10-is-fan-out-one-feature-or-two.md) decision 4's *"no new error
   class"* holds. W33 replaces it.

   **Five other things W32 had written were false and the conformity reader named each**: section 4's
   `reaches(X)` row omits a map's arc **and enumerates arc shapes exhaustively**, so a validator
   written from it reports three `FD-V11` findings against a valid example; `FD-V23` refuses a map
   missing `over` and no rule text licensed it, making *"four rules widened"* **five**;
   `spec/task-id.md` section 3's `ID-R1` soundness argument is a closed argument from three
   **validator** rules and a map region has no `FD-V19` instance, so uniqueness now rests on the RUN;
   `spec/join-policy.md` section 1 says a branch's index in `branches` **is** its `branchPath`
   segment, which `toRegion` makes false for a map region today; and `AGENTS.md` §3 said *"Four node
   kinds"*, had no `map` row, and said *"22 refusals"* while `spec/README.md` said 23 **in the same
   change**. All corrected in place, two of them under late exceptions.

   **`Owns` audit: 23 paths, ZERO undeclared, FIVE late exceptions** — `AGENTS.md`,
   `scripts/build-browser-tests.mjs`, `src/driver/driver.ts`, `spec/join-policy.md` and
   `test/driver/driver.test.ts`. **Not one was found by reading**; two by running a check and three by
   the conformity reader. Five is P7's W20 number from the opposite cause — W20's came from a block
   that gave it nowhere to work — and **it is an argument that W32's `Owns` was drawn one layer too
   narrow for what a new node kind reaches**, which is P10's retro's to judge.

   **Rule 8 ran TWICE: 32/29 before the readers, 42 provocations / 39 caught / 0 survived / 0 aborted
   after**, with **eleven of the readers' own edits checked back in** and all eleven firing. **The
   re-run earned its place**: the fix for one reader's finding **masked another guard**. With
   `branchPathOf`'s `ID-R6` arm made unreachable, `branchIndexOf` — which that fix had just taught to
   refuse — fires in its place with the same class, the same `ID-R6` citation and the same map name,
   so three assertions passed **by the wrong route**. That is
   [W29](work-items/w29-the-two-self-tests-that-grade-nothing.md)'s `D5` masking shape produced inside
   this item by acting on a review, and **finding a phrase that actually discriminates took three
   attempts** — `ID-R6`, `split` and even `item index` all appear in both messages, because the new
   refusal helpfully says *"use `branchPathOf` with an item index"*. **A helpful error message is a
   worse discriminator than a terse one.**

   **The census is CONFIRMED for the FIFTH plan running — 118 questions, 81 open, 2 deferred, 35
   resolved**, both halves at 118 of 118 in exactly one cluster cell. Q156-Q159 are all used;
   **Q12 moves to resolved**. The parser handled `Q87` a **third** way: W31 hit that row from both
   sides and settled *the width check belongs only on a row that both opens AND closes*; this parser
   applies that and then **joins forward**, reconstructing the logical row from four source lines.
   **A row that has not closed yet is not a malformed row, and aborting on it is the same
   misclassification in the opposite direction.**


## Reading order

| | |
|---|---|
| [concept.md](concept.md) | **Read first.** What we are building, the substrate fact that shapes everything, and the one structural idea - run state is a pure fold of an event log |
| [workflow.md](workflow.md) | **Read before any work item.** The loop, the verification ladder, the test rules, how work is split. **v0.17, run to completion by SIXTEEN plans** - the adaptation tables at the end carry a verdict per row from P1 through P9, and stay for the next plan to re-judge. *(P16's retro bumped this cell in the same commit as the change, having read the note below first.)* *(This cell read v0.15 / FOURTEEN through P15's own retro, which changed every OTHER copy of the number and not this one — the third time this cell has gone stale that way, and it is section 1 rule 5's third direction landing on the retro that adopted a change about it.)* *(This cell read v0.10 / nine plans through the whole of P10 and P11, corrected at P11's retro; before that it read v0.9 / seven plans / P1-P7 until P9's retro: **P8 ran the document to completion and adopted none of its proposals**, which is section 6 pass 3 rule 1's expected verdict and is not the same as not having run it.)* *(This cell read v0.8 / six plans / P1-P5 through the whole of P7 — read from `doc/workflow.md`'s own header at P8's declaration.)* |
| [decisions/](decisions/) | ADR 0001, 0002, 0007. They bind `spec/` rather than being superseded by it - 0007 in particular is what [outcome-record.md](../spec/outcome-record.md) makes checkable |
| [plans/p1-...](plans/p1-what-satisfies-a-join.md) | **Complete.** Five work items, and its Record carries the exit artifact and five proposals for the retro |
| [plans/p2-...](plans/p2-the-non-success-half-on-a-real-scheduler.md) | **Complete, and its Record carries the retro that made this document v0.4.** One question, one work item, no new features. Two facts measured before it was written, both of which changed it |
| [plans/p3-...](plans/p3-a-consumer-reference-the-gate-keeps-true.md) | **Complete, and its Record carries the retro that made `workflow.md` v0.5.** Can a reference be kept true by the gate rather than by discipline? Yes — and the gate covers about **16%** of it. The retro's answer to whether the other 84% is acceptable is the part to read |
| [plans/p4-...](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) | **Complete, and its Record carries the retro that made `workflow.md` v0.6.** What is a `Driver`'s lifetime, and what makes an inbound event or an outbound handle *this run's*? Three reader-found defects fixed, two ADRs, and **the first plan whose readers found a shipped ADR rule false** |
| [plans/p15-...](plans/p15-what-a-run-retains-and-what-a-result-may-be.md) | **DECLARED, no item started.** *What does a run retain, and what may a result be?* — [Q19](open-questions.md) and [Q22](open-questions.md) as one question, and the first plan to take the measured run both rows have asked for since P1. Its *what was measured* section is the part to read: **half of a region-bearing run's footprint is a second copy nothing reads**, and removing it is invisible to every rung |
| [../AGENTS.md](../AGENTS.md) | **The consumer reference** — the only document that describes this library from outside. Every snippet is executed by the gate |
| [open-questions.md](open-questions.md) | The register. **179 questions - 129 open, 2 deferred, 48 resolved** *(re-derived at P14's retro. This cell read **140 / 97 / 2 / 41** — P11's figure — through the whole of P12, P13 and P14, **three plans behind the `Document status` row for the same file ten lines below, which was itself two plans behind**: two rows for one document in one index, stale by different amounts. Before P11 it read 34 open / 13 resolved.)* - and **it is the one artifact here that is read as authoritative and checked by nothing**, which W5 found the hard way ([Q43](open-questions.md)) |
| [scheduler-upstream.md](scheduler-upstream.md) | S1-S9, plus **the S-id map for reading `RESOURCE_EVENTS_PLAN.md`**, which uses `fyflow-react-components`' numbering. **Nothing here blocks us, and nothing is left to raise** - **S9 is the only item this repository has ever raised, and it was fixed the same day in 0.5.2** *(this cell read S1-S8 through the whole of S9's life; P11's retro)* |
| [../spec/README.md](../spec/README.md) | **The normative layer.** **Six normative documents** beside this index — seven files in all, as `CLAUDE.md` counts them — with **44 hand-written examples and 89 numbered rules**, an example corpus, and the rules for changing it. Five written by W1, [run-state.md](../spec/run-state.md) by W2. *(The two figures were **33 examples and 80 rules** — P10's — through four plans; re-derived at P14's retro from `npm run check:spec`'s own output, which is where all three numbers come from in one expression. The two document counts are of different sets and both are in use; P11's retro.)* |
| [work-items/](work-items/) | One file per work item. **[W12](work-items/w12-the-region-event-a-listener-cannot-corrupt.md), [W13](work-items/w13-one-driver-one-run-fixed-at-construction.md) and [W14](work-items/w14-two-runs-two-drivers-one-scheduler-at-l6.md) done** — P4. [W1](work-items/w1-the-normative-layer.md), [W3](work-items/w3-the-driver-and-the-validator.md), [W2](work-items/w2-the-fold-and-both-join-policies.md) and [W4](work-items/w4-the-join-failure-matrix.md) **done**; [W5](work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md) and [W6](work-items/w6-the-non-success-rows-at-l6.md) **done**; [W9](work-items/w9-the-consumer-reference-and-its-extractor.md) **done**. [W12](work-items/w12-the-region-event-a-listener-cannot-corrupt.md), [W13](work-items/w13-one-driver-one-run-fixed-at-construction.md) and [W14](work-items/w14-two-runs-two-drivers-one-scheduler-at-l6.md) **declared** — P4. **W7, W8 and W11 are skipped and never reissued; W10 is held for `check-owns.mjs`**, which P2's retro named. [TEMPLATE.md](work-items/TEMPLATE.md) |

## Document status

| Document | Status | Notes |
|---|---|---|
| `concept.md` | **v0.3** | Section 7's *"controlling a run from a UI"* non-goal carries one narrow, cited exception (ADR 0004). Section 2 is the load-bearing part and is verified against the library rather than assumed - **re-checked unchanged at 0.3.0**. **v0.3 updates section 6 only: all four leanings have landed and the table said two were still open.** Everything else has held up unchanged, which is the more interesting half - it was written before a line of code existed |
| `open-questions.md` | live | **230 questions - 176 open, 2 deferred, 52 resolved**, re-derived at P18's retro by a parser written from scratch that aborts on what it cannot classify, and was wrong in three directions before it was right — it is the parser that found the headline of that register stale by thirteen, four questions in no cluster cell, and one resolved question with no Resolved-table row. *(**And it then went stale in all FOUR of these rows for FOUR plans** — P15, P16, P17 and P18 — found the same way every previous note in this table records: by a retro reading the table it was about to append to. Re-derived at P18's retro from the directory and from `npm run check:spec`, never from a neighbouring cell.)* *(This cell read **155 / 107 / 2 / 46** — P12's retro's figure — through the whole of P13 and P14, which raised twenty-four ids and resolved two between them, and it is the FOURTH consecutive plan in which this cell has gone stale while the register's own census line moved. Before that it read **140 / 97 / 2 / 41**, P11's figure, through the whole of P12.)* *(This cell read **38 open, 16 resolved** - counted by P4, and the register's own census line said "47 questions, 34 open, 13 resolved" until then.* **Q33, Q41, Q42, Q43 and Q51 closed with W5**; Q4 and Q17 with W4, Q14 and Q25 with W2. **Q24 is the live one.** Q44 and Q45 are narrowed rather than answered. **W5 found a register entry that was false** (Q43) — this file is read before every work item and checked by nothing, which is the retro’s |
| `workflow.md` | **v0.19 — run to completion EIGHTEEN times** | *(**And it then went stale in all FOUR of these rows for FOUR plans** — P15, P16, P17 and P18 — found the same way every previous note in this table records: by a retro reading the table it was about to append to. Re-derived at P18's retro from the directory and from `npm run check:spec`, never from a neighbouring cell.)* *(This cell read **v0.13 / TWELVE times** through the whole of P13 and P14, whose retros both bumped the document's own header and left this row where it was — **the FOURTH and FIFTH times this row has gone stale while its neighbours moved**, and this is the third recorded in the cell itself. Before that it read **v0.12 / eleven times** through P12's own retro commit, which bumped the header and the Reading-order row and missed this one. It read **v0.8 / six times** for FOUR plans, while the Reading-order row twenty lines above it and the document's own header both moved. Two rows for one document in one index, disagreeing by four versions - `doc/` is checked by nothing, and P11's retro refused a check over it for the ninth time. The summaries below stop at P6 and are left as the record of what each retro changed.)* **P11's retro is v0.12: rule 8 obligation (e) gains a second question — *was what it RAN what SHIPS* — section 1 rule 5's writing clause gains a WHEN, and section 6 pass 3 gains rule 6.** **P10's retro is v0.11: rule 8 gains a requirement on the HARNESS** — it carries a control and the restore is asserted. **P9's retro is v0.10:** rule 8 gains a fifth obligation (break the WIRING), a requirement on the SET (a provocation is evidence only when it fires, and for the reason it names), and section 1 rule 5 gains a clause about WRITING. **P7's retro is v0.9:** rule 8 gains a fourth obligation (break the LOOP BOUNDS) and a procedure for provenance probes. **P6's retro is v0.8: rule 8's two obligations are both about WHAT is asserted and neither is about WHERE THE VALUE COMES FROM**, so it gains a third — break the PROVENANCE of every value an assertion reads — plus re-running the set after acting on the readers' findings. **P5's retro is v0.7, and it is the first whose central finding is that a change was RIGHT AND INCOMPLETE**: rule 8's set now has two obligations, the rule's clauses **and** the `Outputs` table's rows, because three items measured each half blind to what the other sees. It also defines *survivor* (a second, independent route must confirm the mutated clause was reachable), adds `doc/decisions/**` to the record-step list after that gap **blocked a fix**, adds a provenance clause (an item's status is read from its own file, never from an index) and says how to REMOVE an isolated copy. `check-owns.mjs` stays retired and rule 7 (c) is exercised. **Previously:** **P4's retro is v0.6, and its three changes all replace mechanisms that were followed and failed anyway**: rule 8's provocations are written to the **rule** rather than to the fix (three items, three author sets incomplete in the same direction); the **adequacy reader works in an isolated copy** (three reader pairs had run against one tree); and section 1 rule 5's record-step list gains `doc/open-questions.md`, which **retires `check-owns.mjs`** — the cause of three `Owns` miscounts was the list being wrong, not the discipline. **P3's retro is v0.5 and it changes one requirement of one rule**: rule 7 (c) — *name which check refused the probe* — does not discriminate, because a merely malformed probe trips two checks at once and so satisfies a probe declared as either. A probe now declares the **set** it must trip. Measured over `check-docs`' twelve probes (11 already trip exactly one) and provoked after building, which is **rule 8's first outing**. Everything else P3 confirmed unchanged, including the ladder, which took a *document* deliverable without bending. **P2's retro is v0.4, and it is a smaller edit than P1's because two of v0.3's four changes needed nothing.** Settled: the **two-reader** split (four measurements, flat at ~10% overlap) and the **Outputs** table (whose load-bearing column turned out to be *what would fail without it*). Amended: **rule 7's provocations are checked in** rather than run once, and **section 7 rule 2's exceptions table is replaced by a check** — both had been *followed* and failed anyway. **New rule 8**: break the fix for a review finding and watch the gate go red, after W4, W5 and W9 each shipped one that could not fail. **v0.3 was P1's retro**, and adopted: the TEMPLATE gains an **Outputs** table (six occurrences, four items, of a declared output nobody built); pass 2 is **two readers** (1 overlap in 13, then 3 in ~35); a new check is **negative-tested at birth** (section 5 rule 7); and section 7 rule 2 is about **concurrent** items, with a serial one declaring its exceptions. Several findings were deliberately **not** turned into rules. The adaptation table at the end now carries a verdict per row |
| `decisions/` | **29 ADRs**, all accepted *(**And it then went stale in all FOUR of these rows for FOUR plans** — P15, P16, P17 and P18 — found the same way every previous note in this table records: by a retro reading the table it was about to append to. Re-derived at P18's retro from the directory and from `npm run check:spec`, never from a neighbouring cell.)* *(re-counted from the directory at P18's retro: **29 files today** — 0053, 0054 and 0055 are P18's, and every ADR it reserved was taken.)* *(re-counted at P14's retro: **21 files then**, and this cell happened to be right for the first time in three plans. **P12's retro wrote 21 over a directory holding 19**, and two files have been added since — 0042 and 0044 — so a cell that was wrong by two is correct by arithmetic rather than by anyone re-deriving it. `README.md` carried **twenty-two** at the same moment, so **two indexes disagreed about a number both claimed to have derived from the same directory**. It read 18 at P12's first count and 10 at P11's)* | **0023 carries the second in-place *Correction* in this repository** — its rule 1 placed the ownership test after `normalizeEvent`, which made its own rule 3 false. None superseded. **0003 answers Q4** and carries this repository’s first in-place *Correction*. **W5 wrote 0013-0015 and is the first item to spend its whole ADR block** — one from measuring an environment, one from a gate that could not otherwise be written honestly, one from a register entry being wrong |
| `plans/p1` | **complete — question answered and exit artifact produced** | All five work items built. [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) is the answer; `examples/l6.ts` is the artifact. **279 assertions in five runtimes plus 72 at L6 in two.** W4 used Q42-Q50 and ADR 0003; **W5 used Q51-Q52 and ADR 0013-0015** |
| `scheduler-upstream.md` | live | **9 items, ALL closed, deferred or declined** — S1 answered, S3 declined by us, S4 done, S7 fixed, S8 declined by upstream, S5 deferred, S2/S6 waiting on a real need, and **[S9](scheduler-upstream.md) RAISED AND FIXED the same day** in `fyflow-scheduler` 0.5.2 ([W37](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)) — the only item this register has ever raised. *(This cell said S9 was **"live and ready to raise** — found by W5, the first item to load the library rather than a structural stand-in for it |
| `spec/` | **seven documents** | `flow-definition` **v0.19**, `task-id` **v0.10**, `outcome-record` **v0.9**, `join-policy` **v0.16**, `runtime-targets` **v0.12**, `run-state` **v0.6**, plus `README.md` itself — and **55 hand-written examples, a registry DOCUMENT, and 106 numbered rules, 34 of them definition refusals** (`npm run check:spec`, whose own output is where all three figures come from). *(**And it then went stale in all FOUR of these rows for FOUR plans** — P15, P16, P17 and P18 — found the same way every previous note in this table records: by a retro reading the table it was about to append to. Re-derived at P18's retro from the directory and from `npm run check:spec`, never from a neighbouring cell.)* *(This cell read `flow-definition v0.12`, **40 examples** and **87 rules** through P13 and P14, which moved that document three versions and added four examples and two rules. Re-derived at P14's retro from the check's output and from each document's own header.)* *(This cell read **six documents**, `flow-definition v0.6`, `join-policy v0.7`, `task-id v0.4`, `run-state v0.3`, **29 examples** and **71 rules** — every one of those figures set before P10 and left standing through three plans that moved all of them. It is the row directly below the one whose own parenthetical records going stale for four plans, in the table that exists to say what is current. Corrected at P12's retro.)* |

## Sibling repositories

Three repos, one stack, one maintainer. What each owns:

**A sibling checkout is no longer something this repository assumes.** `fyflow-scheduler` is reached
from npm and JSR ([ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)),
so the rows below link to repositories rather than to directories next door — a relative link into a
checkout is a claim about one machine's layout, and on 2026-08-31 those links went dangling when the
sibling was deleted by a recursive tool following a `node_modules` junction.

| Repo | Owns | Pinned to |
|---|---|---|
| [`fyflow-scheduler`](https://github.com/fyflow/fyflow-scheduler) | executing independent tasks: pools, resource groups, retry, spawn | — |
| **`fyflow-orchestration`** (here) | **control flow**: sequence, decision, fan-out, join | scheduler **0.5.2** |
| `fyflow-react-components` | visualizing a scheduler: collector, wire envelopes, React components | scheduler 0.2.1 — **needs the same bump**; 0.3.0 is what unblocks its `3a`/`3b` views |

Deliberate overlaps, which are coordination points rather than duplication:

1. **The same structural invariant.** Their view model is a pure fold of the scheduler's event
   stream; our run state is a pure fold of an outcome log. Adopted knowingly ([concept.md](concept.md)
   section 5), because it is what makes both testable without a live scheduler.
2. **Three questions are literally shared** - `user_action` at the top level (our Q17, their Q16),
   unbounded retention (our Q19, their Q14), one-driver-one-scheduler (our Q20, their Q15).
   **Answering these differently in two repos is a bug with two homes.**
3. **Two upstream wants were shared** - our S4/S5 are their S2/S1. Both are now answered via that repo (S4 implemented, S5 deferred), so the joint-raise is done. What remains shared is the *pattern*: raise once, from whichever repo has the stronger case. **Their S8 is our S8** and is the one that changed our architecture.
4. **They cannot see flow structure.** Which node, which branch, what a join is waiting on - none of
   it reaches the scheduler, so no UI can show it today. Whether we become a second envelope source
   family for them is [Q21](open-questions.md).

**Cite another repo's ids with its name attached, always.** Two Q sequences, same questions
(`workflow.md` section 3).

## Plan history

*One row per plan, oldest first. **A plan appears here when it closes.*** *(This table stopped at P5
through the whole of P6, P7 and P8, and its own note still described P6 as "declared, not started"
after P6 closed and two more plans ran to completion behind it. **Found by P9's retro trying to append
to it** — `doc/` is checked by nothing, in the index that records which plans are finished. P6-P9
added below.)* *(**And it then stopped at P9 for FOUR plans** — P10, P11, P12 and P13 all closed and
retro'd behind it, which is the same defect at twice the size, found the same way: by P14's retro
trying to append to it. P10-P14 added below.)*

| P | Question it answered | Exit artifact | Date |
|---|---|---|---|
| [P1](plans/p1-what-satisfies-a-join.md) | **Yes — and worse than predicted.** Arrival-counting breaks on **six of nine** matrix rows, not on the one exotic case, and an ordinary `optional` failure is enough. Live tokens survive: [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) | `test/matrix/matrix.test.ts` (18 hand-derived cells × 2 policies) and **`examples/l6.ts`** (**eight** real runs at P1's close, thirteen after P2's W6). The row that is the plan: `p1-routed-away` under `arrival-count` is **`stuck`**, with the join's successor never dispatched | 2026-08-30 |
| [P2](plans/p2-the-non-success-half-on-a-real-scheduler.md) | **Yes, and the plan was right to lower its own stakes: nothing in `src/` broke.** All nine of W6's findings were in the gate that was supposed to be checking `src/`. The one surprise was elsewhere — the join had never once fired from the `lost` or `exited` path across twelve rows, so `settleJoin` could be deleted from both paths unnoticed | `examples/l6.ts` at **thirteen rows, 219 assertions**, with all six run outcomes and all six region events occurring on real workers | 2026-08-31 |
| [P3](plans/p3-a-consumer-reference-the-gate-keeps-true.md) | **Yes — and the second half of the question was worth more than the first.** A reference *can* be kept true by the gate, and what it keeps true is **~16% of the document**. Writing the surface down from outside produced three `src/` defects inside the item's own life. The cost the plan did not predict: **the prose absorbed three of them rather than the code being fixed** | [AGENTS.md](../AGENTS.md) — 15 snippets extracted, typechecked and, for the 11 tagged `run`, executed by `npm run gate`; `check-docs` is five checks and its self-test is 12 checked-in probes | 2026-08-31 |
| [P4](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) | **A `Driver`'s lifetime is a run's, fixed at construction; a settlement is this run's iff this driver dispatched its task id; everything it hands out is a frozen copy.** [ADR 0022](decisions/0022-a-driver-takes-its-run-at-construction.md), [ADR 0023](decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) and W12's conformity fix. **The spike changed the design**: the run-id filter the register proposed closes one of four inbound holes | ladder L6's **fourteenth row** — two runs, two drivers, **one** scheduler, both completing on real workers, with the collision stated as a thing that cannot happen | 2026-08-31 |
| [P5](plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) | **Two rules, two different answers — and the plan's conclusion survived while its argument did not.** [ADR 0025](decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md): `JP-R8`'s refinement is **adopted** under its own id, `live-token-requiring-arrival`, with `live-token` byte-identical; `JP-R7`'s is **refused**, on a reason the counts could not show — it is `live-token` weakened and never strengthened, and on the row it repairs it fires a join zero branches reached. **Not one of the 36 matrix cells changed** | the matrix at **four columns, 36 cells**, and ladder L6's **`all-exit` row on real workers under every shipped policy** — one flow, one payload, three answers: `completed`, silently `stuck`, and **`stuck` with `joined: false`**, which nothing at L6 had ever reached | 2026-09-01 |
| [P6](plans/p6-what-may-share-a-scheduler-with-a-driver.md) | **An inbound task id that does not parse was minted by NO driver, so ignore it — but REPORT it.** [ADR 0027](decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md), and what decided it was not the argument the plan made: asking **who produces** an unparseable id. A foreign task can never be ours and is the common case; a `detail.id` that stopped being what we dispatched could be, and is rare. *Stop* is wrong in one direction, *ignore* in the other, and **only *report* is wrong in neither** | L6 row 19: one `FyflowScheduler` carrying **five ids this library did not mint**, two `Driver`s subscribed, **both runs completed**, all five reported through `onUnmintedTask` under their own run id | 2026-08-31 |
| [P7](plans/p7-is-a-join-transitive-over-nested-fan-out.md) | **YES, for every policy, and it needed no mechanism.** [ADR 0030](decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md), measured over four depth-2 rows x four matrix columns: **each region answers exactly as the depth-1 row of the same shape does**. `N` is per-region, so an inner branch never needed counting by the outer join. **The plan's own DECISION was falsified by W22's declaration step** — `arrival-count` does not refuse nesting, because the mechanism the refusal rested on does not exist | a nested fan-out end to end on a real scheduler in **both** L6 runtimes, with the outer join firing over branches it never opened, and the **first dotted task ids any rung above L2 has asserted** | 2026-09-01 |
| [P8](plans/p8-what-can-be-deleted-with-the-gate-green.md) | **The gate's own wiring could be, and so could every anchor in a document's index.** `scripts.gate` went from **8 of 15** entries guarded to **16 of 16**, by set equality **and order** rather than a floor; `check-markdown` resolves every relative link **and every anchor** across the tree. **Three of its four measured register rows were wrong**, and the fourteen dead anchors it fixed were **born dead in the founding commit** and had never once worked | `check-source-selftest.mjs`, the first negative test `check-source` ever had; `C5` **lifted** rather than copied, keeping its id; 62 documents / 1602 links / 80 anchored resolving | 2026-09-02 |
| [P9](plans/p9-when-a-check-stops-checking-what-notices.md) | **An exit code, which cannot tell a detection from noise, a crash, a sibling covering for the clause, or a harness that never ran — and the same defect was living inside rule 8's own procedure.** 118 gradings now name the probe that must break, from 63. **Its central finding is the second half of its own question**: rule 8 grades a provocation by *did the gate go red*, and that was wrong **six times in three items** | the census 100/63/6 -> **136 probes / 118 gradings / 31 `SELF`**; the exit artifact's three row shapes grown to **nine**; and the cost measured in one pass — the six checks are **4.3 s**, proving they can fail is **347.0 s** | 2026-09-06 |
| [P10](plans/p10-is-fan-out-one-feature-or-two.md) | **TWO FEATURES OVER ONE REGION** — [ADR 0036](decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md) and [ADR 0037](decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md), and it is the first plan in ten to make the library able to EXPRESS something it could not. What decided it is a fact about a data structure nobody had measured: `branchOf` is keyed by branch NODE ID, so a map's repeated-entry encoding collapses to one entry and does not express N branches even to the layer that would have to honour them | `map` as a fifth node kind, dispatching at RUN-TIME arity; [W35](work-items/w35-a-map-on-real-workers.md) — a map end to end on a real scheduler in both L6 runtimes, three instances scoring differently from a number in no definition field, L6 **638 assertions / 31 real runs** | 2026-09-09 |
| [P11](plans/p11-what-should-the-gate-prove.md) | **The two properties of the chain nobody had ever chosen: ORDER and CONCURRENCY** — [ADR 0039](decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md). The gate had run **488.9 seconds of self-test ahead of `lint`**, in a chain whose own `S12` asserts order. It now climbs the ladder and runs the seven `:selftest` entries concurrently, deriving them from `package.json`, with the two that cannot share the tree running alone. **Four of five candidates refused with a measurement each** | `npm run gate` at **393.1 s from 516.1 — −23.8%** against a ±13% band, with nothing deleted, no probe dropped and no bound lowered; `G4` and `G5`, which bind what the chain reaches and what `npm run gate` actually executes | 2026-09-09 |
| [P12](plans/p12-what-a-node-receives-and-what-a-decision-sees.md) | **What a node can reach is the run's own outputs, named by the pair `(node id, branchPath)` and reached only by DECLARING them; a decision sees its node's effective outcome plus whatever its OWN EDGE declares** — [ADR 0040](decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) and [ADR 0041](decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md). **[Q11](open-questions.md)'s three candidates are a STACK, not a fork**, and only the third reaches a worker at all, because `createTask` takes ONE value | [W43](work-items/w43-the-two-blocked-flows-on-real-workers.md) — both ordinary flows this library could not express before the plan, running end to end on real workers in both L6 runtimes, with **no `over: "0"` anywhere**; L6 **760 assertions / 36 real runs** | 2026-09-10 |
| [P13](plans/p13-when-is-a-declared-reference-refused.md) | **By CERTAINTY rather than by reachability or by dominance, and a reference says whether it is CONDITIONAL** — [ADR 0042](decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md): `FD-V29` refuses an unconditional reference a run can reach the declaring node without, and a `?` modifier is what says *if it ran*. **Measured: of the 127 references the two corpora ADMIT, dominance refuses 30 and `FD-V29` refuses 8**, so a dominance rule would have cost 22 valid ones. The cost half is [W46](work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md)'s and the verdict is that **nothing warns** | [W47](work-items/w47-the-blocked-flow-on-real-workers.md) — both flows on real workers in both L6 runtimes, L6 **879 assertions / 40 real runs**; and the finding that ladder L6 was BLIND to the plan's own headline for a whole item ([Q214](open-questions.md)) | 2026-09-10 |
| [P14](plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md) | **It means all of the target's outputs, which is what `FD-V28` always said — an output is visible when two branch paths AGREE ON THE REGIONS THEIR CHAINS SHARE** — [ADR 0044](decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md), and *one path is a prefix of the other* is that rule's special case. **The defect was never about a `map` and never about arity**: on a sibling `fanout` pair, which neither corpus contained, which branch the author wrote the reference in decided whether the run completed. **Three of four predictions reversed, and three trace to one wrong declaration fact** | [W51](work-items/w51-the-sibling-region-flow-on-real-workers.md) — a reader inside one region receiving EVERY output of a sibling region at arities neither derives from the other, on real workers in both L6 runtimes; L6 **942 assertions / 42 real runs**, and **reverting the resolver went from 0 L6 failures to 12** | 2026-09-11 |
| [P15](plans/p15-what-a-run-retains-and-what-a-result-may-be.md) | **A run retains what its tasks returned — *(tasks settled) x (bytes each returned)* — and a result is a VALUE, not an OBJECT** — [ADR 0046](decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md) and `OR-R11`, resolving [Q19](open-questions.md) and [Q22](open-questions.md), **the two oldest rows in the register**, in one plan. A region releases its collection when its join becomes TERMINAL — half of what a region-bearing run held was a second copy nothing reads — and what crosses `OR-R2`'s clone is a value's own data, never its behaviour, **silently**. **Its exit artifact is a MEASURED NUMBER rather than a flow**, the first time section 2's other option has been taken | [W55](work-items/w55-a-run-at-scale-on-real-workers.md) — what ONE run holds on a real `FyflowScheduler`, before and after, byte-identically in both L6 runtimes, with the extrapolation to **3174.8 → 1610.9 MiB** at ten thousand concurrent runs; L6 **1061 assertions / 42 real runs**, the run count deliberately unmoved, and **reverting the decision went from 0 L6 failures to 29** | 2026-09-11 |
| [P16](plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md) | **What the library owes the scheduler is a DECLARED dependency reached by one bare specifier, and a node type is a REGISTRY entry named by `type` whose worker receives `{ settings, input }`** — [ADR 0048](decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md) and [ADR 0049](decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md), with `retryPolicy` and `workerGroups` as declared task keys in between (W58, no ADR). Retro run 2026-09-12: `doc/workflow.md` **v0.17**, three changes adopted (per-edit harness integrity, a rule's own enumeration is the shape set, a set-equal-literal ceiling is dated) and five refused; eighteen defects, two with a rung, **both rungs fired and both were read correctly**; four of four predictions confirmed; readers 0, 1, 1 | [W59](work-items/w59-what-a-node-type-is.md) — a typed flow on real workers in **both** L6 runtimes: two typed nodes of one type at different settings, one retrying under the TYPE's policy, both holding the type's group, a typed task inside a fanout branch and a typed map branch at arity three; L6 **1281 assertions / 46 real runs**, and reverting W57, W58, W59 costs **88, 11, 11** | 2026-09-12 |
| [P17](plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md) | *declared 2026-09-12 — complete 2026-09-13, retro'd 2026-09-15 (workflow v0.18: two changes, six refused); W61 ADR 0051, W62 ADR 0052 with prediction 4 reversed, W63 no ADR.* What may a node DO to its input before its worker sees it? | **[W63](work-items/w63-a-transformed-join-on-real-workers.md)**: a typed join successor reducing the region's record through `$sum([*.score])` with no reshaping node, receiving 990 / 400 / 0 at arities two, one and zero on real workers in both L6 runtimes, and a typed map branch reshaping its own item; reverting W61, W62 and W63 costs 52, 19 and 52 L6 failures | — |
| [P18](plans/p18-a-flow-and-its-runtime-from-documents-alone.md) | **YES — a flow and the runtime it needs are TWO JSON DOCUMENTS and a shim, and the library does every instantiation** — [ADR 0053](decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md) (a built-in twelve-keyword schema subset, a keyword outside it REFUSED), [ADR 0054](decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md) (`type` required on every task node, `workerType` RETIRED, a node type is a DERIVATION to pool options) and [ADR 0055](decisions/0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md) (a group factory's output held to what the scheduler CALLS, on a measurement that corrected the plan in BOTH directions). *Declared 2026-09-15, complete and retro'd 2026-09-16 — `doc/workflow.md` [v0.19](workflow.md): ONE change adopted (the harness asserts the ENVIRONMENT its rungs need), six refused. The first plan to take a name OFF the definition grammar, and the first version bump made for a reason rather than for a pin: `0.2.0`, BREAKING.* | **[W67](work-items/w67-a-flow-from-documents-on-real-workers.md)**: `examples/registry.json` and `examples/flows/triage.flow.json` running on a real `FyflowScheduler` in both L6 runtimes over a shim of ONE `createRuntime` call — a document type and a class type over one worker, a node on its type's DEFAULT instance and one on a NAMED instance, a built-in group and a custom one, a declared transform reducing the join's record with no reshaping node; `examples/` holding **no role switch, no `pool()` call and no `Driver` built by hand**, fourteen worker modules where there was one file with a twelve-arm switch. L6 **1610 / 53** from 1502 / 50; reverting W65, W66 and W67 costs **309, 1 and 1** | 2026-09-16 |
| [P19](plans/p19-what-a-schema-buys-an-author.md) | *declared 2026-09-18 on `bc32642`; [W72](work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md) DONE the same day (ADR 0056, `examples` as an annotation, `check:workers`); [W73](work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md) DONE the same day (`checkWiring`, `FD-R4`, the wiring fixture corpus, no ADR); [W74](work-items/w74-the-assists-and-the-exit-artifact.md) DONE, built the 18th and committed at 00:17 on the 19th (the assists and the authoring session — the exit artifact). **RETRO'D 2026-09-19: `doc/workflow.md` [v0.20](workflow.md), one change adopted and five refused, its central finding that the exit artifact's eight claims are all tautologisable at `check:docs` exit 0. W75 closed unissued; ADR 0057 skipped; next plan at W76, Q315, ADR 0058.*** **What does a schema buy an AUTHOR?** — departing from P16's *strict mode* on the maintainer's argument that the schemas are for the person or agent WIRING a flow, and that a runtime failure is a different problem. `examples` joins the subset as an annotation validated at construction (ADR 0056); a worker conformance check that RUNS the worker on its input example; a wiring check with a verdict per edge, static over the subset, sample-verified over transforms; two runtime boundaries validated once each; the assists and an authoring session as the exit artifact. Six facts measured first, and one confirmed prediction 4 at the declaration: the author's own schema for a corpus worker was wrong and its example conformed to the wrong schema — only running the worker found it |
| [P20](plans/p20-what-the-runtime-owes-a-consumer.md) | *declared 2026-09-19 on `817fd73`; **W76 and W77 DONE 2026-09-19 — Q297 resolved, ADR 0058 taken, the package `0.3.0` and BREAKING**. **W76** what `start` ACCEPTS (no ADR), **W77** what it RETURNS (**ADR 0058**), **W78** the exit artifact. Reserves W76-W79, Q315-Q329, ADR 0058-0059.* **What does the runtime owe a consumer that the driver does not?** — [Q293](open-questions.md) and [Q297](open-questions.md) taken together, joined not by the maintainer's framing but by a measurement: of `DriverOptions`' **eighteen** members a `createRuntime` consumer reaches every one by four roads except **ONE**, so Q297 is the unique residue of a total partition, and Q293 is the one thing [ADR 0014](decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) makes the runtime the ONLY payer of. **Departs from P19's slice order and records why.** Six facts first, and the sharpest kills the register's own objection: Q293's case AGAINST says a promise shares `start`'s window, and a `.then` attached fifty macrotask turns after the run ended still receives `completed` | **[W78](work-items/)** — one L6 row where the consumer holds only what `start` returned: a fan-out's region events counted through `StartOptions`, the run's end awaited in ONE line, on a real `FyflowScheduler` in both runtimes; plus the reference's **thirteen** hand-rolled copies of that line, **135 lines in three disagreeing shapes**, reduced | — |
| [P21](plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md) | **A run-time result check is a READING and never a refusal, and it costs a shrinking fraction of a clone nobody chose** — [ADR 0060](decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md), `OR-R13`, and `DriverOptions.onNonconformingResult` whose PRESENCE is the switch. *declared 2026-09-19 on `eb1dbe5`; [W80](work-items/w80-what-a-run-time-result-check-is.md), [W81](work-items/w81-what-a-settlement-costs.md) and [W82](work-items/w82-a-result-its-own-schema-refuses-on-real-workers.md) DONE 2026-09-22 to 2026-09-23; retro'd 2026-09-23, `doc/workflow.md` [v0.22](workflow.md) — ONE change, FIVE refused. L6 1724 / 58 in both runtimes; [Q320](open-questions.md) and [Q332](open-questions.md) resolved; W83 closed unissued, Q344 spent, ADR 0061 skipped* |
| [P22](plans/p22-what-a-regions-identity-is.md) | **A region INSTANCE is its opener and the opener's own branch path, and a region MAY open inside a `map`** — [ADR 0062](decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md): `RunState.regions` two-level, `RegionEvent.regionPath`, `regionId` unchanged in meaning and value, and [W33](work-items/w33-a-map-at-run-time-arity.md)'s construction refusal LIFTED, so [Q160](open-questions.md) and [Q156](open-questions.md) are one question with one answer. *declared 2026-09-23 on `1da565f`; [W84](work-items/w84-what-a-regions-identity-is.md), [W85](work-items/w85-what-a-nested-region-carries-and-how-it-ends.md) and [W86](work-items/w86-score-each-item-then-fan-out-per-item.md) DONE 2026-09-23 to 2026-09-24; retro'd 2026-09-24, `doc/workflow.md` [v0.23](workflow.md) — ONE change, SEVEN refused. Package `0.4.0`, BREAKING IN TWO WAYS; [Q353](open-questions.md) and [Q363](open-questions.md) resolved; W87 closed unissued, ADR 0063 skipped* | **[W86](work-items/w86-score-each-item-then-fan-out-per-item.md)** — *score each item, then fan out per item* on a real `FyflowScheduler` in both L6 runtimes: one opener with TWO instances whose arities both come from data, their overlap ARRANGED, derived from the run and asserted — **L6 1833 / 60** | 2026-09-24 |
| [P23](plans/p23-what-a-run-needs-to-outlive-its-process.md) | **A run outlives its process as a CHECKPOINT — its whole event sequence and a header, handed out as a copy — and a RESUME that replays the stored stimuli with every dispatch held, refuses what it cannot regenerate and re-dispatches what was in flight, at-least-once** — [ADR 0064](decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md) and [ADR 0065](decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md); [Q15](open-questions.md), deferred since P1, resolved. *declared 2026-09-24 on `5d704a1`; [W88](work-items/w88-what-a-checkpoint-is.md), [W89](work-items/w89-what-resuming-is.md) and [W90](work-items/w90-a-run-killed-and-resumed-on-real-workers.md) DONE 2026-09-24; retro'd 2026-09-25, `doc/workflow.md` [v0.24](workflow.md) — ONE change, SIX refused. Package `0.5.0`, BREAKING IN SIX WAYS; W91 closed unissued* | **[W90](work-items/w90-a-run-killed-and-resumed-on-real-workers.md)** — a run KILLED at every kill point of two flows on a real `FyflowScheduler` — the consumer's positional store frozen — and RESUMED on a fresh runtime through `runtime.resume`, identical to a run nobody killed on every node, the re-dispatch counted three ways — **L6 1853 / 100** | 2026-09-25 |
