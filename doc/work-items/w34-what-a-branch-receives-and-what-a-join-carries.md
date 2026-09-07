# W34 — What a branch receives, and what a join carries

**Status:** done - author pass, BOTH READERS, rule 8 re-run with their
twelve edits checked in, and the gate re-run after acting on them are all complete.
**Plan:** [P10](../plans/p10-is-fan-out-one-feature-or-two.md) — *is fan-out one feature or two?*

```
Spec:       spec/outcome-record.md section 4, spec/join-policy.md section 4,
            spec/flow-definition.md sections 2-4 (W32's, read not written)
Owns:       test/matrix/**, src/driver/routing.ts, and src/driver/driver.ts
            HANDED OVER SERIALLY FROM W33 — declared here rather than taken late
Inputs:     W33's running map, from W33's own file.
            P10 section 2 facts 6 and 7 — the join's successor receives `null`, and
            the fan-out hands ONE object to every branch.
            doc/open-questions.md Q11, Q36, Q154.
Outputs:    ADR 0037 — Q36's answer, what a satisfied join carries downstream.
            A payload contract for the fan-out edge, written in spec/ where there is
            currently nothing: Q11 narrowed, and Q154's aliasing decided.
            The join/failure matrix run at run-time arity — rows, columns, or both.
            The rendered matrix table, asserted field by field rather than printed.
Depends on: W33
Blocks:     W35
Tests:      test/matrix/** at ladder L5, and L2 assertions for the payload contract
            in test/driver/** (W33's tree — a declared exception if it is edited).
            Expected values derived from spec/ before running anything.
Gate:       L0-L2 and L5, plus `check:spec` and `check:policies`, then the
            spec-conformity pass (two readers). **See "Three rows of this
            declaration were wrong" below** — the line read `L1, L2, L5` with
            `check:policies` folded into L5, and both halves are false.
Reserves:   Q164-Q166, ADR 0037  (and it already OWNS Q154, raised at the declaration)
```

## Three rows of this declaration were wrong, and trying to act on them is what found it

**This is the THIRTEENTH time a declaration row has been found wrong by trying to act on it, and the
third running** — [W31](w31-the-self-list-check-policies-never-had.md)'s `Reserves` collided with
W29, P10's four work-item blocks collided with P10's own declaration, and
[W33](w33-a-map-at-run-time-arity.md)'s `Gate:` line was wrong twice. `doc/workflow.md` section 1
rule 4 — *a skipped check reported as passed makes the whole ladder worthless* — is why all three are
settled in writing here rather than absorbed.

| the row | measured |
|---|---|
| **`Gate: L1, L2, L5` — no L0** | This item edits `src/driver/routing.ts` and `src/driver/driver.ts`. **L0 is `npm run lint` and `npm run typecheck`**, and `typecheck` is **five projects**, of which `typecheck:deno` is the only thing that catches a `node:` import before a Deno consumer does (`RT-R3`, `RT-R4`, `doc/workflow.md` section 4's runtime table). **An item that changes `src/` and does not declare L0 is a rung reported by omission** |
| **the Verification table folded `check:policies` into L5** | W33 settled this in writing and the row was written anyway. `scripts/check-policies.mjs` reports under **three** clause ids — `P1`, `P2`, `P3` (`scripts/check-policies.mjs:165-167`) — and it is a **static** set comparison between `POLICIES` and `spec/join-policy.md` section 3. It reads two files and runs no flow. **It is a gate entry and not a ladder rung.** This item's version of the error is smaller than W33's, because **L5 genuinely IS this item's** — `test/matrix/**` is in the `Owns` block and the matrix is what section 4 defines L5 as — but a rung and a `check:*` entry are still two things |
| **and `check:policies` is not even the check that binds what this item changes** | It compares the policy **id set**, and this item changes **no policy and no id**. What binds this item's spec edits is **`check:spec`** — `C8` makes `spec/README.md`'s version row a consequence of any `spec/**` bump, and it fired for real in both W32 and W33. `check:policies` is therefore a **regression this item must not break**, named for what it is, and [Q162](../open-questions.md) is the standing warning that it would not see a section 3 text change either |

**Scope item 3's payload count was stale twice over and is re-derived here rather than inherited.**
It read *"`payload` appears three times across six spec documents"*. P10's declaration had already
corrected that to *"six times on five lines in three of them"*, and W33 added a seventh when a `map`
became able to be the `entry` node. **Measured now, over all seven documents in `spec/`:
7 occurrences, on 6 lines, in 4 documents** — `flow-definition.md` 1, `join-policy.md` 1,
`outcome-record.md` 3, `task-id.md` 2 (both on one line). The conclusion the count was supporting is
unchanged and is the point: **not one of them states what a node receives, and none says whether two
branches may share it.**

## Scope

**In**

1. **ADR 0037 — [Q36](../open-questions.md)'s answer: what a satisfied join carries downstream.**
   Its row names three candidates — *the arrived branches' results keyed by branch, a declared
   reducer on the join node, or nothing* — and gives the argument the current `null` rests on:
   `status` is asked after every terminal event, so **which** event satisfies a join is decided by
   fan-out completion order, and a join forwarding *"whichever branch finished last"* makes a run's
   **data** order-dependent. `doc/concept.md` section 5 forbids that for tests and it is worse for
   results. **A map is what makes the question unavoidable** — P10 fact 6: a map that runs N tasks
   and hands its successor `null` has computed N results and thrown all of them away.
   **Q36's owner cell reads W2, an item from P1 done since; it moves here.**
2. **[Q11](../open-questions.md), narrowed to the fan-out edge.** Not *what does every node receive*
   — that is the API surface its own row calls *"the one most expensive to change later"*, and this
   item does not settle it in general. What it settles is **what a branch entry receives**, because a
   map cannot use the shipped shape: one payload down every branch unchanged is exactly what a map
   must not do.
3. **[Q154](../open-questions.md) — the sibling aliasing, and it is live in shipped code.** P10
   fact 7 measured `a.payload === b.payload` as **`true`**: the payload is cloned once at the edge
   hop, which protects the log, and **that single clone is shared across every branch**, so a branch
   mutating it is visible to its siblings. **The scope this was measured at is one flow, at ladder
   L2, with `createTask: (c) => c`** — whether a **thread** pool's own structured-clone boundary
   hides it is **not measured**, and measuring that is part of this item rather than an assumption
   in it. `spec/` says nothing: **`payload` occurs 7 times on 6 lines in 4 of `spec/`'s 7
   documents** — re-derived here, see above — and never as a contract on what a node receives.
4. **The matrix at run-time arity.** P10 measured L5 as **52 cells** — 9 depth-1 rows × 4 columns,
   plus [W22](w22-what-an-inner-join-does-to-the-outer-one.md)'s 4 depth-2 rows × 4. A map is a
   **row** question, a **column** question, or both, and this item decides which from what W33 found
   rather than from this sentence. **`arrival-count`'s early fire (P10 fact 4) and N=0 (fact 5) are
   both matrix cells** once W33 has given them verdicts.
5. **The rendered table asserted field by field.** [Q100](../open-questions.md) and W15's finding: a
   renderer the gate never executes had **seven** surviving mutations, one of which printed a
   two-column table with the whole gate green. Whatever this item adds to the render is asserted, not
   printed.

**Out** — named rather than left implicit, with where it goes instead

- **[Q11](../open-questions.md) in general** — a run-scoped accumulator, or a declared per-edge
  mapping for every edge. Narrowed here to the fan-out edge and **left open** with what this item
  measured added to its row.
- **[Q8](../open-questions.md)** — what a decision sees. Shares Q11's retention cost and is P10's
  declared Out.
- **[Q19](../open-questions.md) and [Q21](../open-questions.md)** — retention and redaction. An
  answer to Q36 makes retention **measurable**, which is what Q19's row says it needs; deciding it is
  a different plan.
- **[Q22](../open-questions.md)** — whether a node result must be structured-cloneable. Reachable
  from a join that carries N results and **not forced by one**; its row says it needs a measured run,
  and if this item produces one the measurement goes on its row.
- **Real workers.** **W35.**

## Predictions, written down before the code that tests them

`doc/workflow.md` v0.10's fifth obligation was earned against a prediction P9 wrote down before the
item that tested it, and P10's declaration says *"a prediction this plan's retro reverses is worth
more than one it confirms."* **Five, and the last two are P10's own #3 and #4 reaching their third
and final data point.**

| # | prediction | what would reverse it |
|---|---|---|
| **1** | **[Q154](../open-questions.md)'s sibling aliasing is HIDDEN by a thread pool and live in an inline one.** [Q61](../open-questions.md) measured the same boundary in the opposite direction — a non-cloneable result is refused by the scheduler before it reaches us in a thread pool and by `OR-R2` in an inline one — so the symmetric expectation is that a payload crossing to a thread worker is cloned per task and two threaded branches cannot share. **P10 measured `inline` only and said so** | the sharing being observable in a thread pool too, which would make Q154 a defect in every topology rather than a property of one, and would change what a contract has to say |
| **2** | **No `FoldInput` shape changes, whatever ADR 0037 decides.** A payload is invisible to the fold: `dispatched` carries a `taskId` and nothing else (`src/fold/run-state.ts:159`), and `joinSettled` carries `fired`. So a join that carries a value adds no input kind and moves no cell of run state | the fold needing to see the value — which would put `src/fold/**` (W33's) in this item's path and make L3 a rung rather than a regression |
| **3** | **A map is a ROW question for the matrix and not a column question.** A column is a **policy** (`MATRIX_COLUMNS`, derived above as 4), and a map is not a policy; W33 already measured that **not one shipped policy reads its `Region` at all**. So the map's cases enter as rows against the existing four columns | a map needing a fifth column, which would mean it changed what a policy *is* rather than what a region *contains* |
| **4** | **Rule 8's FIFTH obligation — break the WIRING — fires on this item, in a shape neither W32 nor W33 produced.** P10's prediction 3, third and last data point. W32 answered yes for a definition item (a corpus flow renamed out of a glob); W33 answered yes for a driver item *"in a shape a definition item could not produce"* — a guard that RUNS and cannot reach its subject. **This item's named shape is a render nobody executes** ([Q100](../open-questions.md)), which is a third kind again | the obligation producing nothing a value-, bound- or provenance-probe did not already reach, which would make P10's retro's verdict *two of three* rather than three of three |
| **5** | **ADR 0037 is TAKEN.** P10's prediction 4. 0036 is spent; skipping 0037 means the plan decided less than it built | Q36 turning out to be answerable only from a case this plan cannot reach, which would have to be **recorded as a measurement** rather than asserted — the shape P10 used to decline [Q9](../open-questions.md) |

## Exceptions declared IN ADVANCE

`doc/workflow.md` section 7 rule 2. Files this item edits outside its `Owns` and outside section 1
rule 5's record step, named with the reason, **before it starts**. **The record-step six are not
exceptions**: this file, the plan's Record, `doc/README.md`, `CLAUDE.md`, `README.md`,
`doc/open-questions.md` and `doc/decisions/**`.

**Why this table is written before the work rather than after it.** [W32](w32-what-a-map-fanout-is.md)
took **five** late exceptions and argued that was evidence its `Owns` was drawn one layer too narrow
for what a new node kind reaches; [W33](w33-a-map-at-run-time-arity.md) took **nine**, *"seven of them
`scripts/**` or a `spec/**` document this item does not own"*. **This item is the third and last data
point before P10's retro**, and the specific thing under test is that **`spec/**` is in nobody's
`Owns` for a plan whose third item writes a payload contract.** Declaring it in advance and taking
**zero** late is the outcome that falsifies the pattern; taking a pile of late ones anyway is the
outcome that confirms it. Either way the number is the measurement, so the honest thing is to declare
what there is a **documented or measured** reason to expect and nothing else.

| file | why, and how certain | evidence |
|---|---|---|
| `spec/join-policy.md` | **CERTAIN.** Section 4's *"A satisfied join carries `null` downstream, and that is a placeholder rather than an answer"* paragraph **is the thing this item exists to replace**, and it names [Q36](../open-questions.md) in place | read: `spec/join-policy.md` section 4, last block |
| `spec/flow-definition.md` | **CERTAIN, and the document addresses the question to this item BY NAME.** Section 2's `map` subsection reads *"What `over` is a key ON is deliberately not settled here … what a node receives is [Q11] and belongs to W34."* **This is character for character the position W33 was in with `FD-R2`** — that document said the run-time `over` question was *"W33's"*, W33 built the refusal and shipped it with **no rule id anywhere in `spec/`**, and only its conformity reader caught it. A payload contract with no rule id would be the same defect one item later, in the same document, against the same sentence | read: `spec/flow-definition.md:135-141` |
| `spec/README.md` | **CERTAIN.** `check-spec`'s **`C8`** makes the version row a consequence of any `spec/**` bump, and this item bumps at least two documents. It fired for real in W32 and in W33 | `scripts/check-spec.mjs`, `C8` |
| `spec/outcome-record.md` | **LIKELY.** Section 4 is the one place `spec/` reasons about a value being shared by reference — *"copying the field copies the reference"* — and [Q154](../open-questions.md)'s sibling aliasing is that argument reaching a second exit. If the aliasing decision has a home it is beside `OR-R2`, not instead of it | read: `spec/outcome-record.md` section 4 |
| `AGENTS.md` | **CERTAIN, and it is [Q157](../open-questions.md)'s THIRD occurrence, predicted before it fires.** §5 carries a whole subsection titled *"What a join carries downstream"* whose text is *"`null`, currently … This is Q36 and it is open"*, and §3's map paragraph says *"a satisfied join still carries `null` — … they are W34's."* **Both are false the moment ADR 0037 lands**, and every snippet in the file is executed by `check:docs`. **No P10 item owns this file**; W33 took it late for exactly this reason | `AGENTS.md:139-142`, `AGENTS.md:399-405` |
| `test/driver/**` | **CERTAIN.** W33's tree. `test/driver/map.test.ts:230` asserts *"each instance receives the map`s OWN payload — Q11/W34, not decided here"* and W33 wrote it **so that changing it is a visible edit rather than a silent one**. Deciding Q11 at the fan-out edge turns that test red by design, and the L2 assertions for the new contract belong beside it | `test/driver/map.test.ts:230-243` |
| `scripts/check-markdown.mjs`, `scripts/check-markdown-selftest.mjs` | **LIKELY — [Q142](../open-questions.md)'s two-sided window.** W33's fourth instance of that row is the one that binds here: **an item that adds no document at all** still pushed the `removes` fixture past `M4`'s floor **by writing prose**, and this item writes an ADR, a spec contract and a long Record. Floors are `M3 < 64 / M4 < 2050 / M5 < 60`. **Measured on a scratch copy outside the repository before the Record**, per `CLAUDE.md` | W33's exceptions table, rows 8-9 |
| `scripts/check-spec-selftest.mjs`, `scripts/check-policies-selftest.mjs` | **LIKELY.** Both carry probes anchored on literals in `spec/` documents this item bumps, and both went inert on W33's own edits — **rule 7 (b) firing correctly rather than passing**. Any re-anchoring is done **agnostically** rather than re-pinned, so the next bump does not reproduce it | W33's exceptions table, rows 3-4 |
| `scripts/build-browser-tests.mjs` | **CONDITIONAL — only if a suite here reads a `spec/**` document the browser bundle does not inline.** This has now happened in **both** W32 and W33, on the same file, for the same reason. The mitigation is stated in the L1 row above: read inside the `test()`, and run `test:browser:all` | W32's and W33's exceptions tables |

**Declared and NOT expected:** `src/fold/**`, `src/driver/events.ts`, `src/driver/policy.ts`,
`src/definition/**`, `examples/**`. **A payload is invisible to the fold** — `FoldInput`'s
`dispatched` carries a `taskId` and nothing else — so a join that carries a value changes no fold
input, and that is a prediction this item's Record reports on either way.

## Verification

| Clause | How it is run |
|---|---|
| **L0** | `npm run lint` and `npm run typecheck` — **five projects**, and `typecheck:deno` is the one that catches a `node:` import (`RT-R3`/`RT-R4`). **Declared because this item edits `src/`**; the first version of this line omitted it |
| **L1** | `npm run test`, `npm run test:deno`, `npm run test:browser` — the payload contract as unit assertions. **chromium only** unless `test:browser:all` is named, and W32 and W33 each shipped a change green in node and deno and red in all three browsers. **If a suite reads a file, the read goes inside the `test()`** — that is the whole difference between W33 failing one test naming its own path and W32 taking all twenty suites down |
| **L2** | routing from a fixture log — what a branch receives and what the join's successor receives, with no scheduler. **The rung the payload contract is proved on** |
| **L3, L4** | **NOT CLIMBED — regressions.** `test/fold/**` and `test/definition/**` run inside `npm run test` whatever this item does, and both are W32's/W33's. A payload is invisible to the fold — `FoldInput`'s `dispatched` carries a `taskId` and nothing else (`src/fold/run-state.ts:159`) — so reporting L3 as covering a payload decision would be a claim about a rung that structurally cannot reach it ([Q155](../open-questions.md)) |
| **L5** | `test/matrix/**` — **the join/failure matrix, and it is genuinely this item's rung.** Every existing cell must keep answering, and what a map adds to it is this item's decision |
| **`check:spec`** | `npm run check:spec` and `check:spec:selftest`. **This is the check that binds this item's spec edits**: `C8` makes `spec/README.md`'s version row a consequence of any `spec/**` bump, and it has fired for real in both W32 and W33 |
| **`check:policies`** | `npm run check:policies` — **a regression, not a rung and not a binding.** It compares the policy **id set** under `P1`/`P2`/`P3` and this item changes no policy and no id. [Q162](../open-questions.md) is the standing warning that it would not see a section 3 **text** change either |
| **`check:docs`** | `AGENTS.md` §5's *"What a join carries downstream"* subsection and §3's map paragraph are **both false the moment ADR 0037 lands**, and every snippet there is executed. Declared as an exception below rather than taken late |
| **conformity** | spec first, code second, expected values re-derived independently |
| **adequacy** | mutation in an isolated copy off the shared tree, walking the rule ids. **Scan for symlinks and reparse points before removing the copy** (ADR 0029, and `doc/workflow.md` section 6) |

**Routing cases** (`doc/workflow.md` section 5 rule 6): a branch **routed away from its join**
([Q4](../open-questions.md)) is covered and is the case Q36's answer is hardest for — a join that
carries the arrived branches' results has to say what it carries when a branch did not arrive.
**`user_action`** ([Q17](../open-questions.md)) is covered for the same reason. **Optional-null** is
covered, being one of the matrix's own rows. A **nested fan-out** ([Q6](../open-questions.md)) is
covered by the depth-2 rows, which must keep answering as ADR 0030 says they do. A **duplicate task
id** ([Q13](../open-questions.md)) and **no matching decision edge** ([Q10](../open-questions.md))
are **not applicable** — neither is reachable from a payload decision.

**Rule 8, all five obligations, re-run after the readers with their edits checked in.** Three to
instantiate deliberately. **(c), PROVENANCE** — *change the source expression and nothing else* — is
this item's central risk, because a payload assertion that reads its expected value from the driver
proves the driver agrees with itself, and **all eight recorded instances of that class are in
`examples/**` and this item is the first to put one in `test/**`.** **(d), LOOP BOUNDS** — a matrix
row deletable for 0 and a column droppable with the assertion count unmoved are both recorded
failures of exactly this file tree ([W22](w22-what-an-inner-join-does-to-the-outer-one.md)). **(e),
WIRING** — P10 prediction 3; a render nobody executes is its known shape here, and
[Q100](../open-questions.md) is the second occurrence of it.

## Record

**Gate — what ran.** Commands under `eval "$(fnm env --shell bash)" && fnm use 24`.

| Clause | Verdict | Notes |
|---|---|---|
| **L0** | **RAN — green** | `npm run lint` — 45 files, 0 findings. `npm run typecheck` — **all five projects**, exit 0. **It caught the last defect of this item** and is the rung the declaration originally omitted — see *"what broke"* 5 |
| **L1** | **RAN — green in all FIVE runtimes** | **21 files / 574 cases**, from 553 at W33's close. node 24.20.0, deno 2.9.6, and — via **`npm run test:browser:all`** rather than the gate's chromium-only `test:browser` — chromium, firefox and webkit, each reporting **parity with node: 574**. Sub-suites **derived by running the filter**: driver **8 / 204**, fold **5 / 124**, matrix **4 / 145**, definition **5 / 118**. **Do not add them**: `test/driver/fold-inputs.test.ts` matches both the `driver` and `fold` filters, so the four figures cover 22 files against a total of 21 |
| **L2** | **RAN — green** | `test/driver/map.test.ts` — a fixture log in, an asserted node sequence and payload out, **no scheduler**. Where the payload contract is proved: `JP-R11` at map arities 1, 2, 3, 7 and 12 and at fanout arities 2 and 3, and `JP-R12`'s collection, absences, null-carrying arrivals and key order |
| **L5** | **RAN — climbed, and it is this item's rung** | `test/matrix/**`, **4 files / 145 cases** from 135. **Five map rows x four columns = 20 new cells**, and all **52** pre-existing cells unmoved — verified twice by a fingerprint of every cell's `status`/`verdict`/`describe`/`events`/`regions`, once for the fixture change and once for the variant re-sourcing |
| **L3, L4** | **NOT CLIMBED — regressions, and unmoved** | Both run inside `npm run test` whatever this item does. **Prediction 2 is CONFIRMED**: `src/fold/**` is byte-untouched, no `FoldInput` kind was added and no cell of run state moved, because a payload is invisible to the fold |
| **`check:spec`** | **RAN — green, and it FIRED twice for real** | `C8` on `spec/README.md`'s version rows, as predicted. **And `C8` itself was found broken** — see *"what broke"* 3 |
| **`check:policies`** | **RAN — green, a regression** | Three clause ids, `P1`/`P2`/`P3`. This item changes no policy id, so it binds nothing here — stated in the declaration rather than discovered |
| **`check:docs`** | **RAN — green** | 20 snippets, **15 `run`** from 14. `RUN_FLOOR` raised to 15 — [Q102](../open-questions.md)'s ratchet, taken as a late exception |
| **L6** | **NOT CLIMBED — and UNMOVED at 489 / 25** | W35's rung. **But this item edited it**, which is a late exception and the sharpest `Owns` finding — see the exceptions table |
| **rule 8 set** | **RAN FOUR TIMES — 43 provocations, 39 caught, 4 survivors, 0 aborted**, with **twelve of the readers' own edits checked back in** | `node dev-dist/w34/provoke.mjs`, graded on the **failure LINES**. Every entry declares the exact set of `check:*` ids it must trip **and** a substring that must appear among the failing TEST names, and both must match |
| conformity reader | **RAN — 16 findings, 8 blocking** | spec first, code second, every count re-derived independently. All sixteen acted on |
| adequacy reader | **RAN — 19 mutations, 12 caught, 6 survived, 1 vacuous; 3 blocking**, plus 4 reachability controls | mutation in a full copy at `%LOCALAPPDATA%\Temp\claude\w34-adequacy`, **off the shared tree**, verified green before it started. **Zero symlinks and zero reparse points, measured three times** — before copying, inside the copy, and again before removal (ADR 0029) |
| **overlap** | **2** | the **seventeenth** measurement, inside the settled 0-4 band, **both readers unprimed** — so comparable with W32's 2 and W33's 2 |
| **full `npm run gate`** | **RAN — `GATE EXIT=0`, zero FAIL lines AND zero error lines, 389 s**, at the completed state and **re-run after the last documentation edit** | Read from the log's own `GATE EXIT` line. **19 chain entries.** *(Re-run because the first "completed state" figure — 375 s — was taken before the last three record-step edits, and **a number measured before the change it describes** is W32's own recorded defect, in that item's Record, about its own gate.)* Six runs at 378, 372, 390, 417, 375 and 389 s, plus two early aborts at 9 s and 390 s; against P9's 366 and 438, W32's 6m21 and 7m18 and W33's 361 and 363, so it is quoted as a **band** rather than a constant. `spec` **7 documents / 33 examples / 80 rules**; `markdown` **74 documents / 2584 relative links / 122 anchored**; **L6 unmoved at 489 / 25** in node and deno |

**`Owns` audit — 24 paths, ZERO undeclared, FIVE late exceptions.** By `git status --short` against
the `Owns` block, by hand. **Derived in one expression**: `git status --short | wc -l` is **24**, and
it is **9 `Owns` + 4 record-step + 6 declared-in-advance + 5 late**, which sums.

| | files |
|---|---|
| **`Owns`** | `src/driver/driver.ts`, and eight of `test/matrix/**`: `matrix.test.ts`, `run.ts`, `scenarios.ts`, `flows.ts`, `variants.ts`, `variants.test.ts`, `table.ts`, `render.ts` |
| **record step** | this file, `doc/open-questions.md`, `doc/decisions/0037-*.md` (new), `README.md`, plus `doc/README.md`, `CLAUDE.md` and the plan's Record |
| **declared IN ADVANCE, and edited** | **SIX**: `spec/join-policy.md`, `spec/flow-definition.md`, `spec/README.md`, `AGENTS.md`, `test/driver/map.test.ts`, `scripts/check-spec-selftest.mjs` |
| **declared in advance and NOT needed** | `spec/outcome-record.md`, `scripts/check-markdown.mjs`, `scripts/check-markdown-selftest.mjs`, `scripts/check-policies-selftest.mjs`, `scripts/build-browser-tests.mjs`. **The last three are the browser and [Q142](../open-questions.md) hazards that hit both W32 and W33 and did not hit this item** — measured, not assumed: `M3`/`M4`/`M5`'s floors were checked on a scratch copy outside the repository — measured on the COMPLETED tree, not mid-item: `74 / 2577 / 122` whole, `56 / 2335 / 122` with `doc/decisions` cut, `45 / 1877 / 122` with `doc/plans` cut as well, against floors of `M3 < 64`, `M4 < 2050`, `M5 < 60`. **All three windows held**, and `M4`'s is the tight one: `1877 < 2050 <= 2577`. **This is the first of P10's three items not to trip it**, and W33's retune from 1720 to 2050 is what gave the headroom — so the row is recorded as a hazard that did not fire rather than one that does not exist |
| **in `Owns` and NOT edited** | `src/driver/routing.ts`. Recorded rather than omitted, and it is a **result**: `JP-R11` and `JP-R12` are about what an edge CARRIES and `selectEdge` is about which edge is TAKEN, so a payload decision needed nothing from the router |
| **LATE exceptions** | **FIVE**: `spec/run-state.md`, `scripts/check-spec.mjs`, `scripts/check-docs.mjs`, `examples/l6.ts`, `examples/workers/flow-worker.ts` |

### The five late exceptions, and why each is late

**None of the five was predictable from a file SET, and that is the finding P10's retro asked this
item for.** Declaring `spec/**`, `AGENTS.md` and `test/driver/**` in advance moved **six** files out
of the late column — every one of which W32 or W33 would have taken late. What remained is created by
the **content** of the change.

| file | why, and why late |
|---|---|
| `spec/run-state.md` | **A false normative sentence.** Section 6 said *"a satisfied join carries `null`"* and cited [Q36](../open-questions.md) as unfixed. The declaration named the four `spec/` documents a payload contract WRITES to and missed the one it merely FALSIFIES. Found by the conformity reader; the document goes **v0.4 → v0.5** and nothing else in it changed, which confirms prediction 2 from a second direction |
| `scripts/check-spec.mjs` | **`C8` did not bind what it claimed.** Found while grading a rule 8 probe — see *"what broke"* 3 |
| `scripts/check-docs.mjs` | **[Q102](../open-questions.md)'s `RUN_FLOOR` ratchet**, tripped by choosing to make the `AGENTS.md` join snippet a `run` rather than a `check`. P3's retro's criterion — *a claim a consumer writes code from belongs in an assertion* — is what forced the choice, and the obligation follows from the CONTENT of the edit rather than from the file |
| `examples/l6.ts` and `examples/workers/flow-worker.ts` | **L6 pinned `joinPayload: null` as an explicit Q36 marker**, in **W35's** `Owns`. The declaration lists `examples/**` under *"declared and NOT expected"*, and it was wrong: a payload decision reaches the item-after-next's harness because that harness asserts the payload. **The rows were derivable rather than copied** — `Math.round(0.9 * 100) = 90` per branch, collected by `JP-R12` — and L6 is unmoved at 489 |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **ADR 0037 — Q36's answer** | **yes** | probe `b1` (the file renamed out of `doc/decisions/`) costs `{M1}`. **And it was FALSE in two places when the readers reached it** — see *"what broke"* 2 |
| **A payload contract in `spec/`, where there was nothing** | **yes** — `JP-R11` and `JP-R12` in `spec/join-policy.md` section 4, plus *what an ordinary edge carries* in `spec/flow-definition.md` section 3, which **no document in `spec/` had ever stated** | probes `b2` (`{C2}`), `b3` (`{C6}`), `b4` (`{C8}`), `r12` (`{C8}`). **`r8` is the declared ceiling**: reverting a rule's PROSE costs 0, because `check:policies` compares the policy id SET and `C6` accepts any non-empty owner cell — [Q162](../open-questions.md)'s class, and the reason the arities are asserted in the tests as well as named in the rule |
| **The join/failure matrix at run-time arity** | **yes — five rows x four columns, and it was NOT built until the conformity reader found the row empty** | probe `r9` (the map list cut where it is consumed) costs **4**; `r10` (the variant un-re-sourced) costs **41**. **This row was a blank cell for most of the item** — see *"what broke"* 4 |
| **The rendered table, asserted field by field** | **yes** — a third table, `renderMap()`, asserted the way the depth-2 one is | probe `r11` (`renderMap` returns `''`) costs **2**. **What it deliberately does not show is the collected payload**, and `table.ts` carries the argument rather than the omission |

**What broke.**

**1. A python `open(path, 'w')` on Windows converted ELEVEN files to CRLF, and the gate caught it for
the right reason.** Python's default newline translation writes `os.linesep`, so every file edited
through a script gained `\r\n`. `CLAUDE.md` warns about this class for
`Get-Content | Set-Content` and this is a second tool with the same behaviour. **What found it was a
`check-spec-selftest` probe reporting *"the mutation matched nothing"*** — its `C8` regex ends `.*\n`,
and in JavaScript `.` does not match `\r`, so a CRLF row is unmatchable. **Rule 7 (b) catching a
defect it was not written for.** Fixed by stripping the CRs at the byte level; `git ls-files --eol`
is 0 non-LF, asserted after every subsequent batch.

**2. ADR 0037 was FALSE in two places and both were the conformity reader's.** It said
*"`join → map` is still not expressible"*; **measured, and false** — a `branchPath` is a string in
`FD-V25`'s `over` charset, so `{"kind": "map", "over": "0"}` after a join names branch 0's entry,
`validateDefinition` accepts it with **zero findings**, and with branch 0 settling `['x','y']` the run
dispatches `each` twice with `"x"` and `"y"`. **Re-run by hand before acting on the report**, because a
reader's measurement is a claim too. It behaves correctly, so it is an affordance the decision created
rather than a defect, and what is still not expressible is a map over ALL the collected results. And
it said *"[Q22](../open-questions.md) gains the numbers"* **while that row was untouched** — an ADR
asserting an edit it had not made, in the file read before every work item. Both corrected in place;
Q22 now carries the six cost figures.

**3. The `C8` repair had the defect it was written for, in the direction its own probe could not
see.** Grading rule 8's `b4` probe showed `spec/README.md`'s version cell could be reverted from
v0.13 to v0.12 with `check:spec` **green** — `C8` asked `row.includes('**vN.N**')`, and every row of
that table narrates its own version history in prose. **Measured: 2 of 6 rows were unbound, and they
were exactly the two documents this item bumped** — the clause binds least on the rows most likely to
be edited. Scoped to the last non-empty cell, probed, shipped. **The conformity reader then broke it
again**: filtering empties makes a BLANK version cell collapse to the prose cell, so `| … |  |`
passed. **A fix and its probe written together share the fix's blind spot**, which is rule 8's founding
observation applied to a check rather than to a repair. Now positional, with both probes.

**4. The declared output *"the matrix at run-time arity"* did not exist, and `matrix.test.ts` said so
in a sentence with no owner.** `Outputs` row 3, Scope item 4 and prediction 3 all promised it; the
item had built L2 coverage and stopped. Found by the conformity reader. **Building it immediately
found a defect nothing else could** — see *"what this taught"*.

**5. `deno lint` failed with `GATE EXIT=1` and ZERO `FAIL` lines.** Re-sourcing `JP-R7`'s variant left
`Region` unused in `test/matrix/variants.ts`; `deno lint` reports `error[no-unused-vars]`, not `FAIL`.
**This item had been quoting *"`GATE EXIT=0`, zero FAIL lines"* as a pair all the way through, and on
this run they disagreed** — the exit code is the predicate and the FAIL count is a secondary signal.
The cause is its own small result: W33 recorded *"not one SHIPPED policy reads its `Region`"* as
`deno lint` reporting that import unused in `src/fold/policies.ts`; the refused variant was the last
object satisfying `JoinPolicy` that still read one. **Now nothing that implements the interface reads
the region it is opened with.**

**6. `doc/decisions/README.md`'s index stopped at 0029**, omitting **0030, 0036 and 0037** — the two
most recent decisions in the repository, including the one answering [Q36](../open-questions.md)'s
sibling [Q12](../open-questions.md). Found by the conformity reader as a *third occurrence of a
pre-existing omission*. **All three rows added together, each derived from its own ADR's header**:
adding only the new one would have left the table wrong by two and made this the third item to walk
past it, in the one directory whose whole job is to be the record. It is a record-step file, so it is
not an exception.

**7. Three counts written into assertions were wrong and the assertions caught them**, which is the
bound doing its job on the author before a reader: 34 firing cells written as 32, 51 compared keys
written as 44, and 13 inner keys written as 16 **beside a comment that worked out 13**. Each was
derived per row and re-derived; the last is W31's *"a count of a list disagreeing with the list beside
it"* in this item's own file.

**What this taught.**

**The map rows found a policy that had gone stale one item earlier, and no static row could have.**
`arrival-count-decrementing` — `JP-R7`'s refused variant, kept executable so
[ADR 0025](../decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)'s
refusal stays falsifiable — still opened with `need: r.branches.length`, the **pre-W33** source. On a
`map` region that is **1 at every arity**, so on `map-all-arrive` it fired the join after **one of
three** arrivals and carried one key of three downstream: **P10 fact 4's early fire, alive in the
column nobody re-sourced.** W33 changed `arrival-count` and its declared variant did not follow, and
**the reason it stood is the reason W33's own change looked free**: on every `fanout` region the
counted N and the declared N agree, so all 52 cells were unmoved by that change and all 52 were
unmoved by this one. *A re-sourcing that moves nothing is a re-sourcing nothing can check, until an
input exists on which the two sources differ.*

**And the sharpest cell makes a decision W33 measured as costing zero into a load-bearing one.**
`map-zero-items` / `arrival-count-decrementing` answers **`satisfied`** — `0 >= 0`, because the
refused variant has no `need > 0` pin — **and the join does not fire, because the driver never asks at
N = 0.** W33 deleted that `settleJoin` call having measured the cost at 0 failures, on the ground that
*"no policy can answer anything but `waiting` for a region that opened nothing"*. **True of the three
shipped policies and false of the fourth column**, and with the call restored this column would route
a join's successor out over a region **no branch ever reached** — character for character what
ADR 0025 refused it for. The ruling is unchanged; the reason given for one row of it is now scoped in
`spec/join-policy.md` section 5, which is the **second** time that section has been corrected under
the writing clause.

**P10 prediction 3 — rule 8's fifth obligation fires on a `src/` item — CONFIRMED, and this is the
third data point in a third shape.** W32 answered yes for a definition item (a corpus flow renamed out
of a glob); W33 for a driver item, *"a guard that RUNS and cannot reach its subject"*. Here obligation
(e) produced `e1` (`arrivalsOf` never inserting, so it runs and can never reach its subject — 4
failures), `e2` (`collectArrivals` reached with the region's map never looked up — 4), `e3` and `r11`
(a render nobody executes — 2 each), and `e5`, which is [Q158](../open-questions.md) and still open.
**The shape a payload item adds is a value that is COMPUTED and never READ** — distinct from a check
that is not run and from a guard that cannot reach its subject. **Three items, three shapes, so it
generalises past a harness**, and P10's retro has its verdict.

**P10 prediction 4 — the plan takes BOTH ADRs — CONFIRMED.** 0037 is taken.

**Prediction 1 CONFIRMED and sharper than written**: the sibling aliasing is invisible in a thread
pool and live in an inline one — but **`a.payload === b.payload` is `true` in BOTH**. The sharing is a
driver-level fact and only its OBSERVABILITY is a pool option, which the flow author does not control
and the driver cannot see. That is why `JP-R11` is not conditioned on the pool, and it is `OR-R2`'s own
reason for cloning *including where it is redundant*.

**Prediction 3 (this item's own) CONFIRMED: a map is a ROW question, not a column one.**
`MATRIX_COLUMNS` is byte-unchanged and `MATRIX_POLICY_IDS` is unmoved at four.

**The methodological finding is that a PROVENANCE probe cannot be graded against a correct
implementation.** The author's first pass ran five obligation-(c) probes and **all five survived** — a
provenance mutation swaps an expected value's SOURCE and nothing else, so against a working driver the
two sources agree, the test still passes, and the entry looks identical whether the binding is gone or
intact. **What discriminates is a COMPOUND probe**: swap the source **and** break the driver, then ask
whether the pair is still red. Under that grading four of five came back bound and one did not, which
was a real hole. **This is rule 8's own *a survivor is one only once a second independent route
confirms the clause was reachable*, instantiated for obligation (c) rather than asserted about it** —
and the harness now carries it, so the grading is reproducible rather than a judgement.

**And the corresponding lesson on the defending side: a negative control has to sit on the expression
the probe changes.** The author's first control for the second-route test read a **different**
variable, and the compound stayed green. Moved onto `stepResults` itself — asserting that `ingest`'s
result is present there and absent from every collected payload, which no payload-derived source can
satisfy — it fires. **Rule 8 (c)'s *change the source expression and nothing else*, read from the side
that has to defend against it.**

**Two counts in this file's own tests were bounded by the list they were given rather than by what the
loop did**, which is W33's adequacy reader's finding reproduced by an author who had read it — and the
readers found two more of the same shape. Five loops now count what they ran.

**Questions raised.**

- **[Q164](../open-questions.md)** — `spec/flow-definition.md` has no id prefix for a rule about what a
  run CARRIES, and `check-spec.mjs`'s `RULE_ID` is a **closed list of eight**, so an invented prefix
  would be invisible to `C2` and `C6`. That is what put `JP-R11` and `JP-R12` in `spec/join-policy.md`,
  and it is why the ordinary edge's contract ships as prose with no id at all.
- **[Q165](../open-questions.md)** — a declared reducer on a `join` node, refused **narrowly**: a
  reducer is a function of what the join collects and cannot be specified before `JP-R12` was. Carries
  the corrected `join → map` measurement.
- **[Q166](../open-questions.md)** — a `map` instance receives its item and therefore LOSES the context
  around it, with the cost measured. Every fix is one of [Q11](../open-questions.md)-in-general's other
  two candidates, so fixing it for a map alone would answer the API question users touch most from one
  construct.
- **[Q22](../open-questions.md) gains the measured run it has asked for since P1** — six figures, and
  the finding that the answer is not one number: the same fix is affordable where the arity is authored
  and catastrophic where it is data.
- **[Q19](../open-questions.md) gains a second per-run structure** — `arrivals` retains every arrived
  branch's result for the life of the run and is never cleared, so ADR 0037 rule 1's invariant is
  stated wider than the code holds it at the join exit.
- **[Q11](../open-questions.md) is answered at the fan-out edge and stays OPEN in general**, which is
  P10's scope and this item does not exceed it.

**Q164-Q166 all used, and Q167 was NOT taken.** The `join → map` finding was folded into Q165 rather
than given the next id. *(**The reason given was FALSE and [W36](w36-the-scheduler-pin-moves-to-0-5-1.md)
acted on it**: this said Q167 and Q168 were *"the remainder of P10's block"* and that **W35 had
not reserved** — but `doc/work-items/w35-a-map-on-real-workers.md` has read `Reserves: Q167-Q168`
since P10's declaration, and this claim was written without opening it. W36 then reserved
Q167-Q169 and used Q167. **The decision not to widen the block was right; the reason was a claim
about another item's status asserted rather than read**, which is `doc/workflow.md` section 1
rule 5 — cited two paragraphs above this one. W35's reservation moved to Q170-Q172 and Q167 was
not renumbered.)* **The remainder of P10's block and W35's reservation are the same ids**, and three
consecutive items have had a `Reserves` line collide with a neighbour's
([W31](w31-the-self-list-check-policies-never-had.md) with W29, and P10's four blocks with P10's own
declaration). Recorded because *not* widening a block is invisible otherwise.
