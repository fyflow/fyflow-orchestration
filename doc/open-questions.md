# Open questions

**The register. One line per question — id, the question or the finding, its status, its owner,
and a closing condition where the row states one.** Ids are monotonic and **never reused and never
renumbered** (`doc/workflow.md` section 3). A work item reserves a block before it starts and fills
rows from it.

**This is a REFERENCE, not required reading.** Read the row you need, the way you read `spec/`.
*The instruction that this file is read before every work item is WITHDRAWN* —
[P27](plans/p27-what-a-register-row-is.md) decision 1, at
[W113](work-items/w113-the-register-is-a-reference.md). One line per question is still a
session’s whole reading budget on its own, and the instruction had not been literally
followable for months.

**Each row’s long body is in `git`.** Every argument, measurement and correction history that stood
in this file is in its history, and the item or plan that raised the row owns it. *A cut thing
keeps its line and its commit* (P27 decision 2).

**Status values:** `open` · `deferred` (real, not now, with a reason) · `resolved` (with what
resolved it — an ADR, a spec section, or a plan record). **Owner** is the work item or plan that
will answer it, or `no owner`, which is honest and common. **A leaning is not a decision**: nothing
here is settled until an ADR says so.

**A question’s cluster is the [Live](#live) heading its row sits under, or its row’s own cell in
[Resolved](#resolved). There is no second copy of the membership** — and there were two until W113,
which disagreed about most of the register, because the table that assigned a cluster and the
section a row happened to be appended to were different claims. W113’s Record has the figure.

---

## Live

### Control flow

*Where routing executes, and what a flow definition is. Everything else was downstream of these.*

*Every question in this cluster is resolved.*

### The join

*The genuinely hard part — what satisfies a join, and what it carries downstream.*

| Q | Question or finding | Status | Owner | Closes when |
|---|---|---|---|---|
| Q5 | What does a join do when a branch does not succeed? | open - **half answered by ADR 0003** | W4 |  |
| Q7 | Can a join time out, and what is the run's state if it does? | open - **detection answered, timeout open** | P1 |  |
| Q23 | May an edge leave a fan-out region for a node that is neither the join nor an `end`? | open - refused in P1 | no owner |  |
| Q27 | May two branches of one fan-out converge on a shared node? | open - refused in P1, **and unentangled from Q12 by ADR 0036** | no owner |  |
| Q81 | Should the join seam see a frozen region event too? | open | no owner |  |
| Q82 | `joinStatusOf().describe` and `onUnsatisfiableJoin` hand out whatever the policy returned, and nothing says it must be a copy. | open | no owner |  |
| Q92 | `Cell.verdict` and `RunState.outcome` are two independent computations of `stuck` and exactly one row compares them. | **deferred 2026-08-31 — real, not now.** | no owner |  |
| Q96 | Should `live-token-requiring-arrival` be what this library tells you to pass, rather than `live-token`? | open | no owner - **not before a real flow corpus exists** |  |
| Q97 | `stuck` still does not distinguish a REPORTED dead join from a silently hung one, and ADR 0025 is what makes that reachable. | open | no owner - **ADR 0026 held for it** |  |
| Q161 | At N = 0 the driver must act on a fact NO POLICY CAN SEE, which sharpens the fourth-event question rather than settling it. | open | no owner - **ADR 0026 held**, see Q97 |  |
| Q163 | A policy's `describe` is observable MID-BURST, and `arrival-count`'s moved on a static region without any verdict moving. | open | no owner |  |
| Q354 | `JP-R12`'s `{}` PROPAGATES: an empty collection is an ARRIVAL and not an absence, and at depth 1 there is nothing above a region for it to propagate into. | open | no owner | a consumer reading an empty collection as a missing branch |
| Q357 | The same mis-keyed latch is SILENT or LOUD depending on what the join's successor is, and the nested corpus is entirely the silent kind. | open | no owner | a second claim about a cost whose fixture cannot produce it |
| Q358 | A real pool SERIALISES the very overlap a per-instance key needs, so a real run interleaves two region instances LESS than a fake scheduler does. | open | no owner |  |

### Decisions and data

*Ordinary design, but Q12 hid two different features under one word.*

| Q | Question or finding | Status | Owner | Closes when |
|---|---|---|---|---|
| Q9 | Are decision predicates required to be pure, and how is that enforced rather than requested? | open - **declined with a measurement by P10** | no owner |  |
| Q165 | A declared reducer on a `join` node — Q36's second candidate, refused by ADR 0037 rule 5 and refused NARROWLY. | open — **the FLOW is closed; the reducer is not** | no owner |  |
| Q186 | A `needs` reference to a large value inside a map region is ADR 0037's REFUSED quadratic, made available at the author's request. | open — decided as NOTHING WARNS, and the decision is written down | W46 (P13) — decided, not closed | an author reporting a flow whose cost surprised them, a threshold arriving from anywhere, or a reference form whose size is not a property of a whole… |
| Q190 | A `needs` no predicate can ever read is ACCEPTED and INERT, in two shapes, and refusing it would put a rule about a KIND inside a rule about a GRAMMAR. | open — **decided as ACCEPTED, and the decision is written down** | no owner | an author reporting it as a bug, or a second inert declaration shape appearing |
| Q192 | `resolveReference` is shared by a node's `needs` and an edge's, and the EDGE caller contributes exactly ONE independent bound to it. | open | no owner |  |
| Q199 | A rule measured against the references a corpus WRITES is measured against its authors' habits. | open | no owner |  |
| Q200 | `FD-V29` is the first `FD-V` whose soundness rests on something the document does not contain. | open | no owner | a fourth join policy that fires over an unsettled branch, which is Q97's subject |
| Q201 | A `?` written where nothing needed it is ACCEPTED and INERT — Q190's shape, in a second rule. | open | no owner | an author reporting a `?` they wrote that meant nothing, or a third inert-declaration shape |
| Q205 | A conditional reference cannot tell *did not run* from *ran and returned `null`*. | open | no owner |  |
| Q211 | The `71x` cliff has three denominators in circulation and no document said which. | open | no owner |  |
| Q218 | `FD-R3` has one road left and it needs a join policy `validateDefinition` is not given. | open | no owner | a third narrowing |
| Q219 | A region's COLLECTION is unreachable by any reference, and the fix is a relaxation nobody has priced. | open | no owner | an author reaching for `"collect"` |
| Q238 | A result's BEHAVIOUR is lost at `OR-R2` and the loss is decidable, cheaply, at the TOP LEVEL — and the case a worker actually writes is NESTED, where it is not. | open | no owner | a `workerType`-level declaration of what a worker returns, which would make the walk static |
| Q239 | Bounding `RunState.nodes[*].result` costs a VOCABULARY and not bytes, and both candidate encodings are already taken. | open | no owner | a run at a scale where the retention is the constraint, which is W55's number |
| Q248 | `limitKey` is a per-workload task field with no home. | open | no owner | an author with a keyed group and a flow that cannot say which key |
| Q251 | A per-node INPUT TRANSFORM, declared in the flow and applied in the TYPE's worker wrapper. | open | no owner — the follow-on plan |  |
| Q259 | A definition is held by the driver BY REFERENCE, so a document mutated after `new Driver` is dispatched as mutated — for every key, and `FD-V33`'s validator is the newest thing that road bypasses. | open | no owner | a consumer sharing one definition object between a driver and something that edits it |
| Q260 | A type name colliding with a consumer's own bare pool key is seen by NOTHING before run time. | open | no owner | the helper taking the consumer's bare pools as an argument and refusing the collision — one more parameter, declined at W59 to keep the helper the… |
| Q263 | A transform's result changes TYPE with the region's arity, and the empty join is a THIRD answer. | open — **SHOWN by W63 at all three arities on real workers in both L6 runtimes** | W63 showed it; P18 owns the check |  |
| Q264 | A language adapter's two halves can DISAGREE, and the bootstrap helper cannot see it. | open | W61 records; not closed by P17 |  |
| Q265 | `$eval` re-compiles at RUN time, so a syntax error inside it escapes `FD-V36` and lands as a task failure. | open — **decided as UNBOUND, and the decision is written down** | W62 |  |
| Q270 | A language's VALUES may carry engine-private markers that survive a thread, and the conformance suite has no clause requiring plain values. | open | no owner |  |
| Q278 | A JSON Schema keyword outside the built-in subset is either IGNORED or REFUSED, and ignoring is the silent kind. | open — decided, W65 writes it | W65 |  |
| Q281 | The driver's registry and the registry DOCUMENT are two shapes of one thing. | open | W66 |  |
| Q282 | A `settingsSchema` belongs to a WORKER entry, so every type over that worker shares it — and a type whose nodes carry no settings needs a schema-less entry over the same module. | open | no owner — P19 |  |
| Q284 | P18 prediction 2's *byte for byte* is met as CANONICAL JSON, because the key order of the options `bootstrap` hands `WorkerManager` is what today's literal happens to be and not what any rule fixes. | open | no owner |  |
| Q291 | `bootstrap`'s `groups` argument now MEANS two different things depending on the caller, and nothing says so in one place. | open | no owner |  |
| Q293 | A `Driver` has no completion promise, so "the run is over" is eight lines a consumer copies. | open | P20, W77/W78 |  |
| Q305 | The wiring relation reads an OPEN producer as never emitting a key the consumer describes but does not require, and that is a stated LENIENCY rather than a soundness clause. | open | no owner |  |
| Q306 | A join successor's per-branch shape is the wiring check's own knowledge, and no author can DECLARE it: the subset cannot say `additionalProperties: <schema>`. | open | no owner |  |
| Q311 | `pathsOf` walks four keywords and an object-valued `const` or `enum` is a fifth road it does not take. | open | no owner |  |
| Q316 | P20 fact 1's partition table is not a partition, and the harness that produced it cannot see that. | open | no owner |  |
| Q322 | Nothing binds this package's VERSION to the shape of its API, and the two manifests can DISAGREE about it for zero. | open | no owner |  |
| Q336 | The schema the DRIVER reads is not the object the registry document declared, and `OR-R11`'s sentence is one layer up from where it is written. | open | no owner |  |
| Q355 | A rule's own ERROR MESSAGE reads like its condition and computes something else, and both the author and a shipped comment reasoned from the message. | open | no owner | a second rule whose message and condition disagree about what they range over |
| Q387 | An ENTRY gate's type is asked TWICE at `start()`, once for `FD-R4` against a throwaway memory and once for the run. | open | no owner |  |
| Q415 | A gate wired into a JOIN is neither refined nor refused, so a route's guarantee and a forbidden key path both vanish on that road. | open | no owner |  |
| Q416 | An ENTRY gate takes no wiring verdict of any kind, so a key path misspelled there is caught by nothing. | open | no owner |  |
| Q417 | A container declared by `enum` or `const` can forbid a key-path step, and the walk reads neither. | open | no owner |  |
| Q447 | A two-run EQUALITY cannot be bound against one side being re-sourced to the other, and v0.21's own answer is unavailable when the two sides are strings. | open | no owner |  |
| Q456 | A comparison whose `value` is MEANT to be a path is not refused, and is false for ever. | open | no owner |  |
| Q457 | A `Transform` node's realm and its resource groups are reachable by NO road a consumer can write. | open | no owner |  |

### Identity, state, failure

*Where the library’s sharp edges, and the scheduler’s, land on us.*

| Q | Question or finding | Status | Owner | Closes when |
|---|---|---|---|---|
| Q16 | Flow-level retry and task-level `retryPolicy` - who owns what, and do they compose? | open — task half landed at W58 | P1; the flow half has no owner |  |
| Q18 | What does cancelling a run actually do? | open | no owner |  |
| Q26 | Does the driver log non-settlement events at all, and in what shape? | open | W3 |  |
| Q28 | What may a resolution do? | open | no owner |  |
| Q29 | Is a resolution's `actor` interpreted, and who is allowed to resolve? | open | no owner |  |
| Q30 | May an edge opt in to `user_action`, bypassing suspension? | open - refused in P1 | no owner |  |
| Q37 | Who asks whether a join is stuck, and how often? | open - **narrowed by W15** | W4 |  |
| Q38 | Is a run that a refusal stopped resumable, or is it terminal? | open | no owner |  |
| Q39 | Does the library ship a reference join policy for testing? | open | after W4 |  |
| Q61 | `OR-R6` is reachable from an inline pool and not from a thread pool, and no document says so. | open | no owner |  |
| Q62 | Is `regions[*].suspended` cumulative or current, and does `spec/` care? | open | no owner |  |
| Q63 | `UncloneableResult`'s message begins with its own class name, so a `${kind}: ${message}` render doubles it. | open | no owner |  |
| Q103 | `fold()` — the pure function this repository's whole invariant hangs off — throws, and ADR 0027 ruled on it without changing it. | open | no owner |  |
| Q241 | `OR-R6` was stated of the whole boundary and holds only at the LISTENER: an uncloneable RESOLUTION value throws a bare `DataCloneError` to its caller and does not fail the run. | open | no owner | a consumer reporting a `DataCloneError` they could not attribute |
| Q249 | Does a node type have a VERSION, and what does a definition's `version` field mean against a registry? | open | W59 raises; not decided by P16 | durability, or a registry entry changing shape under a definition already stored |
| Q307 | A driver refused at `start()` is UNSTARTED and still SUBSCRIBED: the constructor attached its listeners, and nothing detaches them. | open | no owner |  |
| Q330 | A value a run CARRIES can be one the value check cannot READ, and the same document states both facts. | open | no owner |  |
| Q331 | The reporting machinery is handed the log's record BY REFERENCE, and a type closes only the accidental direction. | open | no owner |  |
| Q365 | A resumed task gets a FRESH retry budget, and nothing records the attempts it had already spent. | open — **MEASURED by W89**: a budget of two attempts ran THREE times across one kill; stated in `RN-R21`, not fixed | no owner — a fix needs the scheduler's attempt event (Q26) |  |
| Q371 | A driver cannot give a run id back, so a runtime spends one for EVERY driver it ever built — a finished run's, a `start` `FD-R4` refused, a resume refused mid-replay. | open | no owner |  |
| Q372 | The prefix check sees only what was STORED, so a changed predicate whose road lies past the stored events is taken SILENTLY. | open | W90 — the reference says it in words |  |
| Q374 | A resume TRUSTS the store for every element it FEEDS — a settlement's result, a person's resolution — and checks only that the replay can accept it. | open | no owner |  |
| Q386 | A decision with memory kept anywhere but the driver resumes WRONG, in silence, when its first decision lies past the stored events. | open | no owner |  |

### Scale and interop

*Answerable late, and Q19 changes the run representation if it lands badly. Q33-Q35 are the three runtimes.*

| Q | Question or finding | Status | Owner | Closes when |
|---|---|---|---|---|
| Q20 | Does one orchestrator ever drive more than one scheduler, and is a run id global? | open | no owner |  |
| Q21 | Do we emit an event family for `fyflow-react-components`? | open | W88, the stream half |  |
| Q34 | How is a `runId` generated portably? | open - **narrowed by W3** | W3 |  |
| Q52 | Must ladder L6 run in the *browser* before release? | open | no owner - before release |  |
| Q64 | Nothing in this repository tells a consumer how to use the library. | open | no owner |  |
| Q83 | The test runner imports every suite into one process, and one unreproduced failure says that may matter. | open | no owner |  |
| Q85 | Q20 is now a design question rather than a note: is a run id global? | open | no owner |  |
| Q87 | Nothing enforces that run ids are unique across the drivers sharing one scheduler, and `ID-R4` cannot see the violation. | open — **the message is FIXED (W18); the precondition stands** | W18 (P6) took the message; the enforcement half has **no owner** |  |
| Q90 | `ID-R4` tier 2 has no L6 coverage, and the two-driver row cannot give it any. | open | no owner - **the instrument is `ForeignTask` in `examples/run-flow.ts`** |  |
| Q108 | ADR 0027 names two producers of an unparseable id that can NEVER be ours, W19 demonstrates one of them, and the second is demonstrated nowhere at all. | open | no owner |  |
| Q118 | Two arguments the driver passes when opening a branch are unobservable, and the reason is a validation rule that may be lifted. | open | no owner |  |
| Q119 | P7's fork between threading and deriving a `branchPath` was decided on a cost that is not the one shipped. | open - **the cited measurement exists and is the wrong one** | no owner - **needs a TIME measurement at depth; Q19's was about space** |  |
| Q167 | Should a driver surface WORKER-lifecycle failures, and it cannot today? | open | no owner | a consumer who cannot tell a failing worker POOL from a flow of failing tasks |
| Q194 | A worker whose `run()` has no arm for its configured role returns `undefined`, and from a THREAD pool that kills the SCHEDULER'S OWN message handler rather than settling the task. | open | no owner |  |
| Q244 | N concurrent runs on ONE shared `FyflowScheduler` is O(N^2) in wall time and super-linear in heap, where N runs on their own schedulers is linear — and the topology that costs more is the one `AGENTS.md` recommends. | open | no owner |  |
| Q245 | A run's footprint is not only the driver's, and the other holder refuses to be measured. | open | no owner |  |
| Q250 | Per-variant pools against the envelope: does pool capacity per settings-variant ever matter? | open | W59 records; no owner | a type whose worker holds a resource by existing (`residentGroups`) that a settings value selects — a model loaded per variant, say |
| Q258 | The scheduler emits `resource.*` only once something LISTENS, and its reference does not say so. | open | no owner |  |
| Q261 | In a browser BUNDLE the envelope worker resolves beside the bundle, not under `src/`. | open | no owner | Q52's browser rung. Raised by W59 |
| Q262 | A task acquires its pool's resource groups once per ADMISSION — a retry is one, and so is a task admitted to a threaded pool that found no free worker — and the scheduler's reference does not say so. | open | no owner | a consumer rate-limiting by group with retries on; then it is a row for `doc/scheduler-upstream.md` |
| Q266 | A TYPE's own worker whose `setup()` throws leaves every task of the type `pending` forever, and the scheduler reports it to no run. | open | no owner | a consumer whose typed worker's `setup()` can fail (a connection, a model load) and who reads `RunState` for the run's fate. The scheduler's… |
| Q271 | `deno.lock` carries the SPECIFIER of an npm dependency and not its integrity. | open | no owner |  |
| Q275 | The scheduler's default retry budget is ZERO, it is stated nowhere in `spec/`, and a declaration of zero retries is inert at every rung. | open | no owner |  |
| Q280 | A task that is not a flow's, on a shared scheduler, must carry the envelope `{ settings, input }` now that every pool is a type's — and nothing says so to a consumer. | open | W66, or no owner |  |
| Q285 | A runtime's pools are built ONCE and a flow's languages are only known when it starts, so `createRuntime` takes the flows it will run. | open | W67, or no owner |  |
| Q286 | A consumer's node-type derivation runs TWICE per pool instance, and it is the SECOND output that becomes the pool. | open | no owner |  |
| Q287 | The runtime's own refusals are not exported from the package ROOT, so `AGENTS.md` section 9's enumeration cannot see them. | open | no owner |  |
| Q376 | `runtime.shutdown()` DRAINS, so a clean shutdown is not a kill — and a consumer has no call that STOPS a run. | open | no owner |  |

### Verification and fixtures

***The cluster that existed and was not written down.** Every row is about whether a CHECK can fail rather than about what the library does, and almost every one was raised by an item measuring its own gate.*

| Q | Question or finding | Status | Owner | Closes when |
|---|---|---|---|---|
| Q44 | Should `spec/examples/` carry fixtures for runtime behaviour, or only for definition validation? | open - **narrowed by W5** | no owner |  |
| Q45 | Two sequential fan-outs sharing one `end` node: should `spec/` refuse the shape, support it explicitly, or leave it as it is? | open - **cost lowered by ADR 0015** | no owner |  |
| Q98 | The number every Record in this repository calls "assertions" is a count of TEST CASES. | open | no owner |  |
| Q99 | The L6 harness's timing arrangement is a load-bearing test input that nothing asserts, and only one of its four knobs has been closed. | open — **one knob closed, three open** | no owner |  |
| Q100 | Ladder L6's rendered table is a deliverable no assertion reads, which is W15's renderer finding in a second file and therefore a second occurrence. | open | no owner |  |
| Q101 | `AGENTS.md`'s executed error-class snippet was a closed list compared against a copy of itself, so it omitted an exported class with the whole gate green. | open — **the array-vs-exports half is fixed; the array-vs-PROSE half is measured and open** | no owner |  |
| Q102 | A ratchet that an item is obliged to raise sits in a file no item owns, and W18 raised it undeclared. | open — **answered by W24 and not closed; `RUN_FLOOR` untouched** | no owner |  |
| Q104 | `check-docs`' `X4a` asks whether a `run` snippet contains a `throw`, and any `throw` answers it — including one that is part of the code being demonstrated. | open | no owner |  |
| Q111 | `spec/task-id.md`'s fourth segment is inert at every rung: nothing anywhere passes a non-zero attempt. | open | no owner |  |
| Q112 | `doc/workflow.md` v0.8's provenance obligation is about PROBE DISCIPLINE, and two items running have had to correct the author's account of it. | open | no owner - **P7's retro** |  |
| Q121 | Dead relative links in `doc/**` and `AGENTS.md` are mechanically checkable and nothing checks them | open | W25 — P8 |  |
| Q122 | The matrix's *whole-matrix* claims still iterate the nine depth-1 rows only, and W22 extended two of them. | open | no owner |  |
| Q123 | Nothing in this repository fixes line endings, and a whole-file conversion is invisible to every check. | open | no owner — declared as P8's W26 and cut on scope; the id is skipped and never reissued |  |
| Q124 | The correspondence suite's explicit path-rename map is discriminably better than a prefix strip, and no shipped row exercises the difference. | open | no owner, and a candidate for the depth-3 item Q113 also names |  |
| Q127 | Four coverage gaps the depth-2 L6 rows expose and cannot themselves close | open | no owner |  |
| Q132 | `check-source`'s first self-test covers 4 of its 13 checks, and the other nine are pattern lists that can each be emptied entirely for 0 failures. | open | W30 — partially (P9), taking 9 of the 16: `C1`-`C4`, `C6`-`C8`, `S4`, `S7` |  |
| Q134 | `S12` now subsumes `S11`'s membership half, and `S11`'s prefix lookahead is deletable for 0. | open | no owner |  |
| Q136 | `check-markdown` reads ONE link syntax and ONE anchor source, and ten other markdown shapes are invisible to it — one of them in the direction that makes the gate wrong rather than weak. | open | no owner |  |
| Q137 | `C5` did not inherit `M3`, so `spec/`'s link check can still pass vacuously and `doc/`'s cannot. | open | no owner |  |
| Q138 | A META pass asserts that SOME probe notices a broken check, never WHICH — and that is both a correctness gap and the whole of its cost. | open | W28 (P9) |  |
| Q142 | `check-markdown`'s floors are a two-sided window between the corpus and its own probes' fixtures, and adding four ordinary documents closed it — turning `npm run gate` RED one plan after the file's header argued it could not. | open | W28 (P9) |  |
| Q143 | A mutation whose anchor text also appears in the file doing the mutating — earlier than its target — edits the MUTATOR instead, and two of the four that did so reported BOUNDED for a reason that never happened. | open | no owner |  |
| Q144 | `check-policies.mjs`'s success line dereferences a value only one of its own clauses guarantees, so the clause that guarantees it cannot be META-tested. | open | no owner |  |
| Q145 | A META mutation that fails on the repository's own tree is graded `corpus` and PASSES, so global noise is reported rather than refused — which is one half of Q138 closed and one half deliberately left open. | open | no owner |  |
| Q146 | A clause can be made inert with every probe green because a SIBLING clause reporting the SAME id fires in its place, and a set-equality grading cannot see the difference. | open | no owner |  |
| Q147 | A META entry passes on any of four outcomes, so it can pass for a reason it does not name — Q138's own shape one layer further in. | open | no owner |  |
| Q150 | A `corpus` grading is a PASS, so a harness bug that makes every mutant non-inert reads as full coverage. | open | no owner — one declared constant per self-test, each preceded by a measurement |  |
| Q151 | A `SELF` entry grades on the child's exit code, so a `SELF` pass whose children CANNOT RUN reads as full coverage — and W31 shipped exactly that before rule 8's set found it. | open | no owner — one control run per `SELF` list, and the cost measured before it is added |  |
| Q152 | Two of W28's three verdicts are MESSAGE-ONLY and no `SELF` entry can make them load-bearing — in the FOUR self-tests that grade them with a `why =` assignment, and NOT in the two that grade them with a block. | open | no owner |  |
| Q153 | A `SELF` list is bounded by COUNT and not by CONTENT, so a duplicate entry satisfies the floor, leaves the total unmoved and silently unbounds a guard. | open | no owner |  |
| Q155 | Ladder L3 folds a log whose routing is already decided, so the rung the register cites for determinism cannot reach a decision predicate. | open | no owner |  |
| Q157 | No P10 item owns `AGENTS.md`, so the plan as declared ships a node kind the consumer reference never describes. | open | no owner - **W35** is the natural one |  |
| Q162 | `check:policies` binds the policy id SET, and nothing binds `spec/join-policy.md` section 3's definition TEXT. | open | no owner |  |
| Q170 | `CROSS_ROW` counts only the cross-row assertions that run BEFORE the derived-total check, and twelve run after it. | open | no owner |  |
| Q172 | A rule 8 harness that restores with `git checkout` deletes the work it is measuring, and the repository has no stated procedure for one. | open | no owner |  |
| Q173 | A check can bind a declared version and not its REACHABILITY, and `D3` printed `ok` for a day against a pin one runtime could not fetch. | open | no owner |  |
| Q174 | `deno.lock` accumulated dead trust anchors across two pin moves and nothing reads it. | open | no owner |  |
| Q175 | `D7` binds the pin statement in FIVE documents, and four `spec/` documents still cite the pinned version as current in prose it cannot bind. | open | no owner |  |
| Q176 | Where a check LIVES is a cost decision, and nothing here has ever treated it as one. | open | no owner |  |
| Q177 | L0 does not reach `scripts/**`, so the files that decide whether every other rung is honest are the only ones neither linted nor typechecked. | open | no owner |  |
| Q178 | A literal that quotes the pattern it searches for is a false match for itself, and it happened twice in one hour in one file. | open | no owner |  |
| Q179 | Wall time is not a reproducible cost measure for this gate, and every cost claim in the register was taken from one pass. | open | W39 — measured further, not closed |  |
| Q180 | A third of the gate is Node booting. | open | no owner |  |
| Q181 | A self-test declares that it cannot share the tree, and nothing checks whether it is telling the truth. | open | no owner |  |
| Q182 | `dev-dist/` is a shared namespace and nothing namespaces it. | open | no owner |  |
| Q183 | The gate's ORDER is a declaration compared to a copy of itself, and the decision that chose it has no independent authority. | open | no owner |  |
| Q184 | A `String.prototype.replace` mutation harness silently rewrites its replacement when the text contains a dollar-ampersand, a dollar-backtick, a dollar-quote or a dollar-digit. | open | no owner — **P12's retro** | a second occurrence, or a `SELF` list in a checked-in self-test hitting it |
| Q185 | A discriminating fixture at the right ARITY can still fail to discriminate, because of the ORDER in which it settles. | open | no owner |  |
| Q188 | A test file renamed out of the runner's glob was noticed by nothing — Q158's hole — and the fix did NOT have to live where that row said. | open — **the residue; the hole itself is closed** | no owner |  |
| Q189 | A count taken from a `grep` can be a count of the file's own PROSE, and that is how P12's fact 2 said SIX where there are five. | open | no owner — **P12's retro** |  |
| Q191 | A provocation that has to invent TWO projections to survive is a REWRITE, and `FD-V26`'s edge-site case list is where this repository's bound-in-the-same-file problem stops improving. | open | no owner — **P12's retro** |  |
| Q193 | A reach prediction can reverse on the right conclusion and the WRONG evidence, and only a reader re-deriving the evidence finds that. | open | no owner — **P12's retro** |  |
| Q195 | A SENSOR CANNOT CORROBORATE ITSELF, and the only fix is a second expression over the same fact. | open | no owner |  |
| Q196 | `ROLES` binds its USES and nothing binds it to the `switch` arms, so the list can still grow members nothing runs. | open | no owner |  |
| Q197 | A FIXTURE COINCIDENCE makes a provenance probe ungradeable, and changing the fixture MOVES it rather than removing it. | open | no owner |  |
| Q198 | A cross-row bound cannot detect its own vacuity, and ladder L6 has no self-test. | open | no owner |  |
| Q202 | `CROSS_ROW` in `examples/l6.ts` is a literal whose correct value depends on the NUMBER OF ROWS, so it is not a constant. | open | no owner |  |
| Q203 | P13's index row splits `src/driver/driver.ts` from `test/driver/**` and gives `examples/**` to a third item, and a change to the resolver cannot honour that split. | open | no owner |  |
| Q204 | A census parser can be right about the COUNTS and wrong about *exactly one*, and only the aborting form says so. | open | no owner |  |
| Q207 | `certainlySettled`'s `map` arm is REDUNDANT today, by a rule this repository has discussed lifting. | open | no owner | `FD-V25` gaining a multi-branch `map`, or a third region-opening kind |
| Q208 | A cost table taken in ONE process is not a measurement of the differences between its rows, and the cause is ACCUMULATION rather than ordering. | open | no owner |  |
| Q209 | `ALL_CHECKS` in `scripts/check-docs-selftest.mjs` was a closed allowlist, and a whole check id shipped ungraded behind it. | open | no owner |  |
| Q210 | A check that reads a PATH instead of its subject is not testing what ships, and the self-test's own substitution mechanism is what shows it. | open | no owner |  |
| Q212 | A `Set` over what N receivers RECEIVED cannot count the copies a mechanism MADE, and it was W46's substitute for a refused timing assertion. | open | no owner |  |
| Q213 | A check that lives inside the thing it checks is deletable with it, and W47 put one there on purpose. | open | no owner |  |
| Q214 | A rule whose whole effect is that a run never happens is invisible to a rung made of RUNS, and ladder L6 was blind to ADR 0042's headline for a whole item. | open | answered by W55 — a rung was written; the row stays open for the rule |  |
| Q216 | Three lists compared pairwise both ways still have ONE observer per pair, and a source swap defeats all of them. | open | no owner |  |
| Q217 | `ROW_KEYS` makes a deleted ROW fail naming itself and nothing did that for the CROSS-ROW layer, which is where three consecutive items put their whole output. | open | no owner |  |
| Q220 | The visibility predicate now needs the REGION SETS and not only two strings. | open | no owner | a third caller, or a resolution site where the region sets are not available — the EDGE site is the one to check, since an edge has no path of its… |
| Q221 | Three functions joined the published package surface and nothing asked whether they should. | open | no owner | a fourth occurrence, or a consumer depending on one and pinning us to it |
| Q222 | ADR 0044’s claim that *`FD-V28`’s biconditional becomes true* has NO OBSERVER at any rung. | open | no owner | a rule that moves either predicate |
| Q233 | ADR 0046 rule 1 is a statement about what a run HOLDS, and NO public surface can observe it — so its only test reaches into a private field. | open | no owner | a consumer that needs to know what a run holds — an event family for a UI (Q21) is the obvious one, and a `stuck`-run diagnostic the second |
| Q234 | Emptying a test BODY costs ZERO, and the `assertions` figure the runner prints cannot fall when it happens. | open | no owner | a test found empty by a reader, or an item shipping green with a body nobody wrote |
| Q235 | `.claude/worktrees/` is not in `.gitignore`, so `git add -A` stages an EMBEDDED git repository. | open | no owner | a commit that actually lands one |
| Q240 | The blanking factor is not a constant and this repository quoted one. | open | no owner |  |
| Q242 | The cost table W54 added to `spec/outcome-record.md` section 4 has NO cross-document binding, and the harness its numbers come from is not checked in. | open | no owner | a third document quoting these numbers, or one of them going stale unnoticed — which has now happened once |
| Q243 | P15 fact 3's *49.8%* is the collection's share OF THE PAIR, and four documents state it as the EXCESS over `bytes(inputs)`, which is +99.2 to +99.4%. | open | no owner |  |
| Q246 | P15 decision 3's *~101 ms per real run* is the L6 HARNESS's per-ROW cost, not the cost of a run — and the conclusion it supports survives on other grounds. | open | no owner | a plan that wants the scale as a rung, which would need the per-row cost priced separately from the per-run one |
| Q252 | The gate never runs `deno publish --dry-run`, and W57 measured that its verdict depends on `package.json` in a way no check sees. | open | no owner |  |
| Q253 | P16's facts harness is UNTRACKED, and its fact-1 anchor went silently stale on W57's first edit to the line it reads. | open | no owner — P16's retro; the parser's line is the next plan's declaration step's if it wants it |  |
| Q256 | A rule clause with no falsifier on any admitted document: *the node wins, WHOLE*. | open | no owner — P16's retro |  |
| Q257 | A retry across a WORKER TEARDOWN is unmeasured at every rung. | open | no owner |  |
| Q267 | Nothing in the gate refuses a CONTROL BYTE in a tracked text file, and one shipped through every rung. | open | no owner |  |
| Q272 | One suite's import failure ends `npm test` with ZERO `FAIL` lines. | open | no owner |  |
| Q274 | A deleted MIDDLE row of ladder L6 renumbers every run after it, so a row's deletion cost is a property of its POSITION. | open | no owner — a fact to state beside any L6 deletion cost |  |
| Q276 | The Node runner prints its failure lines at four spaces, the browser runner and ladder L6 at two; W63's harness read the browser rung with the Node pattern and reported a CATCH as a CRASH — exit 1, "zero fail lines" — with the `FAIL` line in the log (`e6`). | open | no owner — the next harness author's to lift, or the retro's to refuse |  |
| Q283 | `checkRegistry` and `resolveRegistry` are two functions that must agree on the registry's SHAPE checks, and two checks were missing from one. | open | W66 |  |
| Q288 | `RT-R13` ships with no live offender, and the blind spot its check reads source through is open-ended. | open | no owner |  |
| Q289 | A harness that observes a run per FOLD INPUT has a window before it holds the driver, because `runtime.start` starts the run INSIDE the call. | open | no owner |  |
| Q290 | A per-RUN knob has no DOCUMENT spelling, and the one this rung has is INERT. | open | no owner |  |
| Q292 | A plan's SAMPLE is code, is read as a specification, and is executed by nothing. | open | no owner |  |
| Q302 | A conformance check on ONE example confirms a schema at one value, and a bound the worker's code does not keep over its declared input domain is invisible to it. | open | W80 |  |
| Q310 | An EXECUTED snippet's assertions are bound by their PRESENCE and by nothing else: every guard in the reference's exit artifact can be made a tautology with `check:docs` at exit 0. | open | no owner |  |
| Q312 | What puts a READING in `spec/` is not what W74's criterion said, and the criterion would have kept W73's own check out. | open | no owner |  |
| Q315 | A binding that must read SOURCE TEXT has no cheap home, and the road taken costs 193 KB of browser bundle. | open | no owner |  |
| Q317 | A dated ceiling whose SITE the expiring item CONSUMES still matches its anchor, so rule 7 (b) cannot abort it and the verdict is right for the wrong reason. | open | no owner |  |
| Q321 | A promise a library creates for EVERY call cannot be bounded by a test helper, because most callers never attach to it. | open | no owner |  |
| Q323 | A test that awaits an unsettled promise on a REAL scheduler hangs for ever rather than failing, and a rule 8 harness killed mid-probe leaves the tree MUTATED. | open | no owner |  |
| Q324 | An exit artifact whose central deliverable is a DOCUMENTATION REDUCTION has no rung, and the only thing that measures it lives in no commit. | open | no owner |  |
| Q325 | A deadline TAUGHT in a position where its other side has already lost demonstrates the shape and cannot exercise it. | open | no owner |  |
| Q326 | "Lines added to `src/`" is ambiguous by a FACTOR OF SIX in this repository, and a prediction that rests on it names neither count. | open | no owner |  |
| Q327 | A killed harness keeps running, and a MEASUREMENT harness reports the rung somebody killed as ZERO COST. | open | no owner |  |
| Q333 | v0.21's prescribed answer — IDENTITY — is a property of W78's subject rather than of the clause, and the class has no identity answer where every operand is freshly built. | open | no owner |  |
| Q335 | A cost quoted as a RATIO is not reproducible across RUNTIMES either, so P21 decision 5 is necessary and not sufficient. | open | no owner |  |
| Q337 | `examples/README.md` is read by NO check, and it carries L6's counts and a link table. | open | no owner |  |
| Q338 | A checked-in MEASUREMENT that nothing runs, for the SECOND time, and the two are bound differently. | open | no owner |  |
| Q339 | Two observers, one APPARATUS — obligation (c)'s LIMIT from the side the clause does not name. | open | no owner |  |
| Q340 | Every observer of a REPORT is downstream of the report, and a membership over the observers cannot see it. | open | no owner |  |
| Q341 | `X4` refuses `if (false)` BY NAME and refuses nothing else, so v0.20's TAUTOLOGY clause has a shape it cannot reach — and the clause was adopted knowing it. | open | no owner |  |
| Q342 | A corpus census pinned as a LITERAL in a file that is not the corpus, three times, and no seeded table has ever named one. | open | no owner |  |
| Q343 | A row that spans SEVERAL LINES is invisible to a parser that aborts, because it is never presented to the classifier. | open | no owner |  |
| Q345 | A harness's own logs, EMPTY on the machine that wrote them, with every number in its report sound. | open | no owner |  |
| Q346 | A `Record<string, T>` has an OPEN index signature, so adding a LEVEL to a record is invisible to a typechecker at every read whose result is unconstrained. | open | no owner | a second nesting, or a change whose L1-L5 half a run does not reach |
| Q347 | A cast that RESTATES the shape it reaches into compiles against its own restatement. | open | no owner | a third, or one where the wrong count is not asserted |
| Q348 | An item's `Owns` block can be unable to hold the work its own `Outputs` row declares, and the rung that catches the residue can be absent from its `Gate` line. | open | no owner | an item whose `Gate` line omits the rung that would have caught a real defect |
| Q349 | A per-region structure keyed by the INSTANCE is observable only while TWO instances are LIVE AT ONCE, and an eager RELEASE is what makes that window rare. | open | no owner | a second structure whose lifetime hides its own key |
| Q350 | `RN-R6`'s cross-policy claim cannot be widened to nested regions, because under nesting its own PREMISE fails — and a reader finds that out from a red rung rather than from the rule. | open | no owner | a second rule widened into a red rung for a reason its own text already implies |
| Q351 | An enumeration written by a READER goes stale the moment a later item adds a member, and nothing binds it. | open | no owner | a prose enumeration going stale in a direction a measurement depends on |
| Q352 | A class of churn enumerated by reading the DIFF is not the class a probe measures, and it can be wrong in BOTH directions at once. | open | no owner | a second plan whose fact names a class an item then measures with a different membership |
| Q356 | A membership over SUITE names is satisfied by an EMPTY SUITE, so a whole file's cases can be deleted at exit 0 with the census green. | open | no owner | a third file shipping a whole item's output with no case-level membership |
| Q359 | A flatten justified by an argument about KEYS, relied on by a claim about TIME. | open | no owner | a second flatten whose justification and whose use are about different dimensions |
| Q360 | `spec/` carries a corpus CENSUS, so adding one corpus document obliges a NORMATIVE file — and this is the derivation WORKING rather than a defect. | open | no owner |  |
| Q361 | The version a consumer is told to expect was compared to nothing, in the one sentence that tells them which release a breaking change arrived in. | open | no owner |  |
| Q362 | Three PROJECTIONS of one walk are not three observers, and a control over any of them leaves the others free. | open | no owner |  |
| Q367 | The test harness's `deepEqual` cannot see a PROTOTYPE, so any `equal`-judged claim about a value `OR-R11` calls LOSSY is vacuous. | open | no owner |  |
| Q373 | `npm run gate`'s `selftests` took 1114 s wall at W89's baseline | open | no owner |  |
| Q377 | The manifest version is anchored by nothing ABSOLUTE. | open | no owner |  |
| Q378 | P23's exit artifact kills a RUNTIME inside one process, not a PROCESS. | open | no owner |  |
| Q382 | A suite that names its cases by INDEX into its own declared list can run two cases under EACH OTHER's names, and nothing it asserts can see it. | open | no owner |  |
| Q392 | Reverting an item that ADDED a root export crashes ladder L6 at module link, with ZERO failure lines — a crash, not a detection. | open | no owner |  |
| Q395 | `X10` holds the copies it ANCHORS, and a copy nobody anchored is invisible to it — and two existed the day it shipped, with TWO MORE measured since. | open | no owner |  |
| Q401 | Obligation (f) says *delayed past its peers*, and the order a SPEED-UP exposes is out of its reach — as is anything a single green sample hides. | open — **its first half MEASURED by W98** | no owner — P25's retro |  |
| Q405 | A derivation over ONE run can label a pair's relation two ways between runs, while its verdict on that pair never moves. | open | no owner |  |
| Q406 | `RN-R27`'s join barrier is keyed by `regionId` ALONE, where a region INSTANCE is the pair. | open | no owner |  |
| Q407 | Nothing checks that a markdown table is WELL FORMED, and TEN rows are known to render wrong, by THREE mechanisms. | **open — its TEN is 49 at W113**: 49 malformed rows in 22 documents, 20 of them DROPPING content | no owner | a clause over table cell counts, which W113 measured UNAFFORDABLE while 10 documents fire |
| Q410 | A wiring verdict cannot say WHY an arc that read `no` now reads `fits`. | open | no owner |  |
| Q411 | A bare `k in o` over a schema's `properties` answers from `Object.prototype`, and this is its THIRD and FOURTH occurrence with no mechanism against it. | open | no owner |  |
| Q420 | Nothing checks that a work item carries the declaration block its own template requires, and an item without one cannot be `Owns`-audited at all. | open | no owner |  |
| Q425 | `X4`'s per-snippet timeout is a FIXED 30 s, so on a loaded machine a sub-second snippet is KILLED and the check reports it as *the snippet does not run* — a message that names the snippet and never the clock, with the failing SET varying run to run. | open | no owner |  |
| Q427 | `doc/workflow.md` section 8 budgets *plan gate (L0-L6)* at under 90 s and it was measured at 18.6 s; the same ladder now measures 245 s, and nothing here can separate the suite's growth from the machine. | open | no owner |  |
| Q428 | Q180's process-start count is STALE and the one lane it names as the objection now exceeds the whole figure by itself. | open | no owner |  |
| Q429 | `check:docs`'s two `tsc` invocations are now 52% of it, and nobody has priced overlapping them. | open | no owner |  |
| Q430 | A `scripts/` file's census of ANOTHER `scripts/` file was stale by 33 and nothing compares them — the standing `doc/` refusal's own machine-comparable criterion, in a directory that refusal does not name. | open | no owner |  |
| Q431 | Since ADR 0070 a clause whose only observer is a PROBE is invisible to the local ladder, and no document says so. | open | no owner |  |
| Q433 | `run-selftests.mjs` sizes its pool in LANES and each lane spawns a deep process tree, so the runner over-commits the machine by a large factor — and the exclusive prefix was accidentally holding some of it back. | open | no owner |  |
| Q434 | A COMPOUND mutation whose second `replace` matches nothing still changes the file, so rule 7 (b)'s vacuity guard passes and the entry grades a mutation it did not make. | open | no owner |  |
| Q435 | Probe-level concurrency inside a lane is UNLOCKED and is a LOCAL-ONLY win, bounded by the PRODUCT rather than by the probe count. | open | no owner |  |
| Q436 | A probe of a clause that reads SOURCE TEXT becomes a site of that clause, and the second time it did so it made the probe VACUOUS. | open | no owner |  |
| Q437 | A META pass can grade fourteen mutations of a check it never ran against, and the thing that makes it visible is a CONTROL the pass did not have. | open | no owner |  |
| Q438 | Nothing says which of the three root documents a claim belongs in, and they grew into each other for twenty-five plans. | open | no owner |  |
| Q439 | `README_SNIPPET_FLOOR` can be lowered in silence, and W107 lowered it — deliberately, which is the point of the row. | open | no owner |  |
| Q440 | Removing a check's SUBJECT removes its probes, and a clause whose only observer was among them is left asserting nothing. | open | no owner |  |
| Q441 | A probe anchored on a document's FORMATTING is a probe about the formatting, and one anchored on which SECTIONS are paired is a claim about the pairing list. | open | no owner |  |
| Q442 | A markdown TABLE can be broken by one blank line and nothing notices, and the register itself had FOUR such breaks — one structural, so the larger part of it has never rendered as a table at all. | **open — the register is unbroken; nothing checks it** | no owner | a table check, which W113 measured UNAFFORDABLE: 20 content-dropping rows in 10 documents |
| Q443 | `README.md` carrying no repo status is a contract a PERSON keeps and nothing checks, and the thing it forbids can be reinstated wholesale with every gate check green. | open | no owner |  |
| Q446 | Every arc LEAVING a node that only transforms is `unchecked`, so the authoring feedback P19 built goes dark on the node a UI is most likely to emit. | open | W109 |  |
| Q448 | A test file that builds its fixtures at MODULE SCOPE turns any product break into a runner CRASH, so rule 8 cannot grade it. | open | no owner |  |
| Q449 | Nothing compares a SNIPPET or a CLAIM in `spec/**` to the grammar the same document declares, and three `workerType` snippets survived EIGHT versions inside the document that retired the key. | open | no owner |  |
| Q450 | A declared predicate cannot be impure BY CONSTRUCTION, and no rung reads the construction — so the guarantee is as strong as the code and the CLAIM about it is only as strong as Q9's. | open | no owner |  |
| Q451 | A MARKER is a PROTOCOL between two modules, and a cast is what hides it from the one thing that could compare the two names. | open | no owner |  |
| Q452 | A rule-8 grader's failure window is an ENUMERATION of the runner's output shapes, not a length — and a missing shape is indistinguishable in the report from a wrong `says`. | open | no owner |  |
| Q453 | A compensating binding CITED in N files and present in none — the second occurrence in consecutive items. | open | no owner |  |
| Q454 | A check's self-test carries a COUNT of its own subject's `fail()` sites and nothing compares them. | open | no owner |  |
| Q458 | The consumer reference's copy of a shipped flow is a COPY, and nothing compares the two. | open | no owner |  |
| Q460 | `markdownIn` throws `ENOENT` on a missing directory, and the walk it serves names three. | open | no owner |  |
| Q461 | A budget's CEILING goes stale toward WEAKNESS, which is Q102's shape in the direction no clause here has met. | open | no owner |  |
| Q462 | A `SELF` entry that REMOVES a grader clause measures the absence of a case rather than the presence of a guard, and its verdict is indistinguishable from a real hole. | open | no owner |  |
| Q463 | A mutated copy of a check must sit EXACTLY ONE level below the root, and three self-tests depend on that with no clause saying so. | open | no owner |  |
| Q464 | A diagnostic consulted only on a failure path cannot be observed on a green tree, so its scope is bound by nothing. | open | no owner |  |
| Q465 | The always-read set is three paths bound to three more paths in a self-test, with no authority in any document. | open | no owner | a document stating the membership *(the row's second clause — `a FOURTH always-read document is invisible to the budget` — was WITHDRAWN by W113, which took the instruction that made the register always-read out of every site asserting it. ADR 0077 consequence 5 says so and this row did not. W114)* |
| Q466 | Does `doc/README.md` stop carrying an item's status too, as `CLAUDE.md` has? | open | W115 |  |
| Q467 | An item that NARROWS a declared clause owes the narrower clause a PRICE too, and W113 priced only the one it refused. | open | no owner | a second occurrence, or a rule once another item narrows an Output row on a corpus-wide measurement |
| Q468 | A phrase search answers whether the WORDS have a home; W107’s method is about the FACT, and only reading the owning document answers that. | open | no owner | a third occurrence, or an item claiming a home from a grep alone |
| Q469 | A measurement that CORRECTS a figure can be wrong about the figure it corrects, when the instrument looks for the wrong words. | open | no owner | a second occurrence — W113 is the first, and its own §7 diagnoses the mechanism one section before §8 repeats it |
| Q470 | `resolveLinks` takes ABSOLUTE paths and silently reads the real tree when given relative ones, and a control that compares against the real tree PASSES. | open | no owner | a guard in `check-markdown.mjs` refusing a relative entry, which is three lines and has no live offender |
| Q471 | Twenty table rows in ten documents DROP content when rendered and twenty-eight render a declared column EMPTY, so `M7` is scoped to one file — and W113 shipped one of each into the ADR index before its own clause found them. | open | no owner | the twenty rows fixed, after which `M7`’s universe can be the corpus — see Q407 |
| Q472 | A derivation that takes the FIRST match of a name occurring eighteen times reads whichever one HISTORY left highest in the file, and a plausible wrong number passes every floor. | open | no owner | a second occurrence — `state.mjs` read `DECLARED_TOTAL` as 2174 off a comment and 2435 is the declaration |
| Q473 | An item or plan file's header `**Status:**` line can contradict its own `## Record`, and for NINE files it did — in the one place `doc/workflow.md` section 1 rule 5 names as a status's source. | open | no owner | a tenth occurrence, or a rung that compares the two for an ITEM (the PLAN side is closed by `npm run state`'s agreement clause; an item file has a Record whether it is done or not, so there is nothing to compare the word against) |
| Q474 | A clause added to a check becomes a SITE of every probe that stages its subject, and `B5` turned four of `check-budget`'s existing probes against their own declared sets. | open | no owner | a second occurrence outside `check-budget` |
| Q475 | A pattern written around one author's markdown EMPHASIS is a pattern about that author — the id ledger read W103 off the last plan whose bold happened to sit outside its ids. | open | no owner | a second occurrence, or a convention that the ledger sentence is written without emphasis inside it |
| Q476 | `npm run state` is in no gate, so its exit code is read by a person and nothing proves the derivation still runs; `S11` cannot see it because the name does not begin with `check:`. | open | no owner | a derivation shipping broken, or a cheap observer that is not a third self-test lane — W114 stop-and-ask (b) priced and refused both alternatives |
| Q477 | A PLAN's `**Status:**` line is held to no vocabulary: nine of twenty-five do not parse to a word, two plans carry no line, and one carries a CURLY apostrophe. | open | no owner | an item that owns the plan headers — P27 decision 5's preconditions name the ITEM status line and the PLAN question line and not this one |
| Q478 | `dev-dist/` holds whole-tree COPIES left by self-test runs, so any grep over the tree that does not exclude it reads a second, weeks-old copy of every document — including `CLAUDE.md`. | open | no owner | a reader or an instrument misled by one; three such trees from September were on the tree W114 shipped |
### Raised late

*Raised from upstream documents rather than from this library’s own design.*

*Every question in this cluster is resolved.*

## Resolved

*Looked up by id. The argument is in the ADR, the spec section or the item named here.*

| Q | Cluster | Question | What resolved it |
|---|---|---|---|
| Q131 | Verification and fixtures | Rows of THIS FILE render their Status and Owner columns wrong, because they contain unescaped pipes — the row said TWO, W112 measured eleven, and SEVEN is right. | Fixed BY CONSTRUCTION at W113 — every cell of the one-line register escapes its pipes. SEVEN rows rendered with Status or Owner displaced, not the eleven W112 measured: four of those ESCAPE their pipes and rendered correctly. What nothing checks is Q407. |
| Q135 | Verification and fixtures | A THIRD row of this file renders its cells wrong, by a different mechanism than Q131's two, and it is the mechanism a cell-count check would have to handle first. | Fixed at W113 — `Q87`’s row no longer spans lines, and its Status and Owner, which sat in a PARAGRAPH below the terminated table, are cells again. |
| Q215 | Verification and fixtures | A FOURTH row of this file renders wrong, and it is Q131's mechanism in a position Q131 does not name: unescaped pipes INSIDE a code span. | Fixed at W113 — the third of the three cell-splitting mechanisms, gone with the other two. A code span was never protection, because GFM cuts the row first. |
| Q1 | Control flow | Where does routing execute? | The driver, outside the scheduler |
| Q2 | Control flow | Is a flow definition data, code, or data with registered predicates? | Data, with predicates registered by name |
| Q3 | Control flow | Which `fyflow-scheduler` version do we pin? | 0.5.2 since 2026-09-08 (W37), which is the fix for S9 - the one item this repository has ever raised upstream; 0.5.1 from 2026-09-07 (W36); 0.3.0, and since 2026-08-31… |
| Q4 | The join | What satisfies a join - expected arrivals, or live tokens? | Live tokens - ADR 0003, decided by W4's matrix and not by the argument this row records. |
| Q6 | The join | Is a join transitive over nested fan-out? If a branch itself fans out, does the outer join wait for the grandchildren? | Yes, for every policy, and it needed no mechanism |
| Q8 | Decisions and data | Does a decision see only its node’s output, or accumulated run state? | Its node’s effective outcome, and whatever its OWN EDGE declares |
| Q10 | Decisions and data | What happens when no decision edge matches? | A mandatory default edge, refused at instantiation; and a named run failure if routing ever reaches a node with no matching edge |
| Q11 | Decisions and data | What does a node receive as its payload? | All three candidates at once, in a stack rather than a fork |
| Q12 | Decisions and data | Is fan-out one feature or two? | Two features over ONE region |
| Q13 | Identity, state, failure | What is the scheduler task id scheme, and what stops a collision corrupting a run? | `<runId>:<nodeId>:<branchPath>:<attempt>`, four segments always, with the driver refusing a duplicate before `addTask` sees it |
| Q14 | Identity, state, failure | Is run state a fold of an event log, and whose log? | Yes, and of OUR log |
| Q15 | Identity, state, failure | Is a run resumable across a process restart? | Yes — a resume replays the stored settlements, resolutions and earlier resumes through the routing that produced them, refuses by name what it cannot regenerate, and… |
| Q17 | Identity, state, failure | How does `user_action` surface at flow level? | Four answers from four places, and the last one is W4's. |
| Q19 | Scale and interop | Is per-run retained state bounded? | Bounded by the RUN and by nothing else, and the one second copy is released |
| Q22 | Decisions and data | Must a node result be structured-cloneable, and is that a constraint on workers or on the driver? | On the DRIVER, unchanged — and the fork is the wrong shape |
| Q24 | The join | Are the two one-line refinements of the join policies a third and fourth policy, rather than repairs of the first two? | Two answers, not one |
| Q25 | Identity, state, failure | Does the flow-level outcome vocabulary belong in the definition or in run state? | Run state's, and closed |
| Q31 | Raised late | Can the driver retain a scheduler event's `detail`? | No, and one event lies about its own name |
| Q32 | Raised late | How does P1 tell a stuck join apart from a silently dropped task? | The question dissolved - 0.3.0 fixed the drop |
| Q33 | Scale and interop | Must ladder L6 run in all three runtimes, and does P1's W5 do it? | L6 runs in Node 24 and Deno; the browser is Q52 |
| Q35 | Scale and interop | Is the *published* Node floor 24, or is 24 only the development pin? | The published floor is `>=22`; the pin stays 24 |
| Q36 | Identity, state, failure | What does a satisfied join carry downstream? | The arrived branches' results, keyed by `branchPath` |
| Q41 | Identity, state, failure | Who composes the fold's input sequence, and where does its order come from? | The driver, and it is the log with the routing facts interleaved |
| Q42 | Identity, state, failure | Where does the stuck-join predicate live? | In the fold, as a run-state outcome |
| Q43 | Identity, state, failure | Run state has no outcome for a stuck run | `stuck` is the sixth outcome |
| Q51 | Scale and interop | How do the three runtimes reach `fyflow-scheduler` (0.3.0 when asked; **0.5.2** since W37)? | A `devDependency` from a REGISTRY, and never a runtime dependency |
| Q53 | Identity, state, failure | `Driver`'s public surface says it serves many runs and `ID-R3` says it serves one — should the surface narrow? | Yes — ADR 0022, from W13. |
| Q71 | Scale and interop | Is `SchedulerLike` satisfied by a real `FyflowScheduler` under the DOM lib? | resolved 2026-09-11 — YES, and the fix was the SEAM's listener parameter, not an import — ADR 0048 rule 6, W57. |
| Q72 | Scale and interop | Two `Driver`s sharing one scheduler cross-route, and nothing refuses it | Refused at the listener, in two tiers |
| Q73 | Scale and interop | `onRegionEvent` hands out the driver's own live object while every other outbound path is frozen | Frozen — one `Object.freeze` in `emit()`, by W12. |
| Q84 | Scale and interop | Should `AGENTS.md` section 9 name every refusal class it lists? | Yes, and the list is now checked against the PACKAGE rather than against itself |
| Q86 | Scale and interop | Should a task id that does not PARSE be treated as "not ours" rather than as a defect? | Neither: report it and keep routing |
| Q91 | The join | `JP-R7`'s variant fires a join with ZERO arrivals — the exact cost `JP-R8` exists to remove | Recorded as the reason `JP-R7`'s refinement was refused |
| Q93 | The join | Two of the six region events reach no policy, so ladder L5 cannot see the driver dropping them | Covered at L2, structurally uncoverable at L5, and that is right |
| Q94 | The join | ADR 0003 carries a hand-copied two-column matrix and the renderer now emits four | Each ADR carries the table it decided from |
| Q95 | The join | The `at most once` latch on the driver's `unsatisfiable` path is unreachable, and deleting it fails nothing | Closed with a stub |
| Q107 | Scale and interop | `ID-R5` at L6 is reached from `task.completed` and nothing else | Closed by W23, and it cost one boolean. |
| Q113 | The join | `Driver.regionOf`'s call sites - and whether a JOIN POLICY needs innermost resolution at all | Yes it does, and two events are the whole of why. |
| Q114 | Scale and interop | `settleJoin` routes out of a join with no branch path at all | Closed by W21, and it took two fixes. |
| Q117 | Scale and interop | The L6 harness mints a silently wrong task id on a nested flow | Closed by W23, and this row was wrong about the failure twice. |
| Q126 | Verification and fixtures | `npm run gate`'s own wiring is checked for `check:*` and for nothing else, so a runtime can be dropped from it silently | Closed by W24, and the hole was wider than the row said. |
| Q133 | Verification and fixtures | What should `npm run gate` prove, and when? | Everything it proved before, in ladder ORDER, with the seven `:selftest` entries run CONCURRENTLY |
| Q141 | Verification and fixtures | Can `check-scheduler`'s `D5` empty-parse clause be made inert with every probe still green? | Yes, it could, and W29 closed it |
| Q148 | Verification and fixtures | Can the self-tests run concurrently? | Five of the seven can; two cannot, and the second one was found by running them |
| Q149 | Verification and fixtures | What notices when a check's `--self-test` dispatch stops routing? | Three clauses in a new check, `scripts/check-wiring.mjs` |
| Q154 | Decisions and data | Does a fan-out hand ONE payload object to every branch, so a branch mutating it mutates its siblings' input? | Yes it did, and it is closed in TWO different ways for the two features |
| Q156 | Decisions and data | May a `map`'s branch itself open a region? | YES, and the refusal is LIFTED WHOLE rather than narrowed to one of the two kinds |
| Q158 | Verification and fixtures | What notices when a whole `*.test.ts` file leaves the runner's glob? | A suite census in a test file, not a check in `scripts/**` |
| Q159 | The join | Can a join policy tell a `map` region from a `fanout` region — and should it? | NO, and the question turned out not to be about the KIND |
| Q160 | Decisions and data | What is a region's IDENTITY, given that a `map` makes one opener reachable N times in a run? | `(opener node id, the opener's OWN branchPath)`, and every per-region structure is keyed by that pair |
| Q164 | Verification and fixtures | Where does a rule about what a run CARRIES live? | `FD-C` is the third prefix in `spec/flow-definition.md`, beside `FD-V` for what a document may say and `FD-R` for what a run refuses |
| Q166 | Decisions and data | What does a `map` instance lose by receiving its own item? | Nothing it cannot ask for |
| Q171 | Verification and fixtures | Is anything holding the copies of ladder L6's counts to the file that states them? | Yes, since W96 — `check-docs`' `X10` |
| Q187 | Decisions and data | When is a declared reference refused — is reachability enough? | No, and the two candidates were one mechanism |
| Q206 | Decisions and data | Is there any form a reference can take that reaches a SIBLING region's outputs? | An output is visible when the two branch paths AGREE ON THE REGIONS THEIR TWO CHAINS SHARE, and *one path is a prefix of the other* is that rule's special case |
| Q279 | Scale and interop | Does anything signal that a grammar change is BREAKING for every flow document? | The PACKAGE's semver — `0.1.0` to `0.2.0` in both manifests, with the change named in `README.md` |
| Q297 | Decisions and data | `onRegionEvent` is a `Driver` option the RUNTIME does not forward, so a consumer on the recommended road cannot subscribe to region events at all | Forwarded — W76, and no ADR: P20 decision 4 had already settled that it is one name on `StartOptions`' `Pick` and one conditional spread, touching `RuntimeRegistry` not… |
| Q300 | Decisions and data | Do the two corpora disagree about what a schema can be checked against, and what does the wiring check do with the L4 corpus's `corpus://` workers? | They disagree by DESIGN, and the check's live corpus is the L6 one |
| Q301 | Decisions and data | Is *the verdict says which* enough, or must a witness-based verdict be a distinct kind? | The word, carried by a REQUIRED `sample` field, and a distinct kind refused |
| Q320 | Decisions and data | What does the always-on completion handle cost, and can a consumer decline it? | +1 `structuredClone` per SETTLED TASK — one more copy of everything `OR-R2` already copies, a ratio of 1.00x by construction — and the opt-out is… |
| Q332 | Verification and fixtures | Can a control written under v0.21's clause be ENTAILED by its own claim, and can the clause see that? | Yes it can, and no it cannot — so the clause loses its prescription and gains a TEST. |
| Q353 | Verification and fixtures | Is a per-instance key observable where the fixture puts the thing it distinguishes at index 0? | No — and so, where a rule SELECTS, the fixture puts the right selection where every well-formed WRONG one differs. |
| Q363 | Verification and fixtures | Does `doc/workflow.md` v0.15's *held still* answer TWO readers run concurrently? | Yes, as written, and no rule is added. |
| Q364 | Identity, state, failure | What stops a fresh runtime minting a run id a resumed run holds? | The runtime refuses a `start` or `resume` naming an id any driver of it holds, and its minted counter skips such ids |
| Q366 | Verification and fixtures | Does `kill-resume.ts` capture its own calls, as `replay.ts` did? | No — it wraps no prototype. But its re-dispatch set is `held − settled` BY CONSTRUCTION, so it cannot report a settled task re-dispatched |
| Q379 | Verification and fixtures | Can a fixture on an inline pool tell a gate that keeps the first ARRIVAL from one that keeps the first ITEM? | No — so W94 ARRANGES the order and asserts what the arrangement did |
| Q380 | Verification and fixtures | Is node-kind dispatch exhaustive enough that a new kind is loud where it must be taught? | Answered by measurement and deliberately not fixed |
| Q381 | Scale and interop | A new node kind breaks a consumer's exhaustive switch and nothing names it — who writes the list? | `README.md`'s `0.6.0` paragraph, and it has FOUR breaks |
| Q391 | Decisions and data | Can a static check know what a gate's ROUTE guarantees about the value it carries? | Yes, where the TYPE declares it |
| Q394 | Verification and fixtures | Is L6's overlap CONTROL held by construction or by a completion order? | By an ARRANGEMENT, now asserted |
| Q400 | Verification and fixtures | What justifies a row weakening a dispatch-order comparison, and which ids may it name? | Neither a row nor a flag — the RUN says it |
| Q402 | Verification and fixtures | Do `AGENTS.md` and P24 decision 7 claim more about order than a run gives? | Yes, both, and both are corrected |
| Q426 | Verification and fixtures | Does anything remove the scratch directory a self-test creates per process? | Yes since W105 and ADR 0072, and the mechanism was one line. |
| Q444 | Decisions and data | Can a flow DOCUMENT say what a branch depends on, without code? | Yes for the predicate, since W108 and ADR 0074. |
| Q445 | Decisions and data | Must a node whose whole job is to reshape data be written as code? | No, since W109 and ADR 0075. |
| Q459 | Verification and fixtures | Can the named-residue reading in `check-wiring`'s control NAME a file a killed run left? | Yes for every `.mjs`, since W112 |

## Notes

**The dated log that stood here is in `git`**, and every finding in it is held by the document that
owns it: W3’s three conformity passes, the through-line and the `OR-R10` discovery by
[w3](work-items/w3-the-driver-and-the-validator.md)’s own *What broke* list; the three-runtime
requirement by [spec/runtime-targets.md](../spec/runtime-targets.md), which that paragraph itself
named; W1’s four ambiguities and the deliberately empty `FD-V14` by
[w1](work-items/w1-the-normative-layer.md),
[spec/flow-definition.md](../spec/flow-definition.md) and
[ADR 0004](decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md);
`RESOURCE_EVENTS_PLAN` §11 by
[ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md); Q4
refused as *sufficient* by
[ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md); and
`FLOW_PLANNING.md`, `SpawnTaskConfig.parents` and the sibling repository’s three shared questions
by [doc/concept.md](concept.md), [doc/scheduler-upstream.md](scheduler-upstream.md) and
`CLAUDE.md`. Checked one paragraph at a time before cutting, which is
[ADR 0073](decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)’s method
([W113](work-items/w113-the-register-is-a-reference.md) §7).

**One paragraph is kept, because it has no home and cannot be derived from one.**

> **The useful part of an upstream document written for a *different* consumer was not the part
> addressed to a consumer at all.** `../fyflow-scheduler/RESOURCE_EVENTS_PLAN.md` is a
> counter-proposal about resource gauges this library does not consume, and the two paragraphs in it
> that were ours were addressed to nobody: §11, four lines long, on event details being live
> references — which became
> [ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) — and
> §4.4’s exit (c), a blocked task dropped with no event, which is the signature
> [P1](plans/p1-what-satisfies-a-join.md) was trying to attribute to a join policy.
> **Reading only the sections that named our concerns would have missed both.** Recorded 2026-08-30
> as *worth a rule if it recurs*; it has not recurred.
