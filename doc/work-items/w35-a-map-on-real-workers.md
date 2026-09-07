# W35 — A map on real workers

**Status:** done
**Plan:** [P10](../plans/p10-is-fan-out-one-feature-or-two.md) — *is fan-out one feature or two?*

```
Spec:       spec/runtime-targets.md (RT-R10), spec/task-id.md section 1,
            spec/join-policy.md sections 2, 4 and 5 — all read, none written.
            **Understated, and corrected after the fact**: the rows cite FD-R2,
            FD-V3, FD-V5, FD-V9, FD-V25, ID-R6, JP-R5, JP-R11, JP-R12, RN-R8,
            RN-R10, RN-R11, OR-R6 and OR-R10 across FIVE documents. "None
            written" held. W35's conformity reader
Owns:       examples/**
Inputs:     W32's definition shape, W33's running map, W34's payload contract and
            matrix — each read from that item's OWN file, never from an index.
Outputs:    P10's exit artifact — a map-fanout running end to end on a real
            FyflowScheduler, in BOTH L6 runtimes, its arity taken from the previous
            node's output, its join firing over branches nobody declared, and the
            join's successor carrying what W34 decided it carries.
            A row (or rows) in examples/l6.ts with a declared expectation.
            The measured cost of reverting W32/W33/W34's changes, in L6 failures.
Depends on: W34
Blocks:     nothing
Tests:      examples/l6.ts, run in Node 24 and Deno. Expected values from spec/ and
            from the three items' declared outputs, NOT from what the run printed.
Gate:       L0 and L6 in both runtimes, then the spec-conformity pass (two
            readers). **L0 was missing**: this item edits `examples/**`, which
            `tsconfig.examples.json` typechecks and `deno lint` lints, and an
            item that changes code without declaring L0 is a rung reported by
            omission. Same defect W34 corrected in its own line.
Reserves:   Q170-Q172  (NOT Q167-Q168 - see the note below)
```

## Two rows of this declaration were wrong, and W36 caused the first one

**This is the FOURTEENTH time a declaration row has been found wrong by trying to act on it, and the
fourth running.**

| the row | measured |
|---|---|
| **`Reserves: Q167-Q168`** | **[W36](w36-the-scheduler-pin-moves-to-0-5-1.md) reserved Q167-Q169 and USED Q167**, on a claim written into three documents — [W34](w34-what-a-branch-receives-and-what-a-join-carries.md)'s Record, `CLAUDE.md` and `doc/README.md` — that *"W35 has not reserved"*. **This file has said `Reserves: Q167-Q168` since P10's declaration**, and nobody opened it. `doc/workflow.md` section 1 rule 5 says a claim about another item's status is read from that item's own file, never from an index — and this is worse than the failure that rule was adopted for: not a stale index believed, but a fact **asserted without reading anything**, written forward into three documents, and then acted on. **Q167 is used and is not renumbered**; this moves to **Q170-Q172**, and Q168/Q169 stay the gap W36 reserved and did not use |
| **`Gate: L6 in both runtimes`** | No **L0**. This item edits `examples/**`, which `tsconfig.examples.json` typechecks and `deno lint` lints — `npm run lint` covers `examples/` by name. **An item that changes code and does not declare L0 is a rung reported by omission**, which is exactly the row W34 corrected in its own declaration one item ago |

**And one row is right in a way worth keeping.** `Inputs:` says *"each read from that item's OWN
file, never from an index"* — which is the rule the first defect above broke. The row was correct and
the practice was not.

## Scope

**In**

1. **The exit artifact.** A map-fanout on a real scheduler, real workers, end to end, **in both L6
   runtimes** — Node 24 via npm's `dist/`, Deno via `jsr:@fyflow/scheduler@0.5.1`
   ([ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)).
   The arity comes from a worker's return value, so **the number of tasks dispatched is not in the
   definition and not in the harness.**
2. **Task ids nothing declared.** P10 fact 2 measured that 500 run-time indices mint 500 distinct
   ids and that the grammar needed no change. **L6 is the only rung that can show one being
   dispatched to a scheduler that would silently overwrite on a collision** — `spec/task-id.md`'s
   whole reason for being a correctness rule rather than a convention
   ([Q13](../open-questions.md)).
3. **The join firing over branches it never opened**, and its successor carrying W34's answer. This
   is the half a fixture cannot prove: the branches settle in an order nothing controls, and
   `doc/concept.md` section 5 says that order is genuinely non-deterministic.
4. **N = 0 on real workers**, if W33's answer makes it reachable — an empty input list is the case
   `FD-V9`'s arity floor means the static feature can never produce.
5. **The cost of reverting**, measured in L6 failures and reported as a number.
   [W19](w19-a-task-we-did-not-mint-on-a-real-scheduler.md)'s *"restoring ADR 0023 rule 2 costs 13
   L6 failures"* is the shape: a demonstration that costs 0 to revert demonstrated nothing.

**Out** — named rather than left implicit, with where it goes instead

- **Anything in `src/`, `spec/` or `test/`.** All three are W32's, W33's and W34's. If this item
  finds a defect there it **reports it** and the fix is a declared exception with the reason, which
  is the one thing `doc/workflow.md` section 7 rule 2 asks to be visible before it happens.
- **`doc/decisions/**` is on the record-step list**, so a demonstration here **may correct a decision
  it demonstrates** without an exception — v0.7 change 3, which fired for the first time on
  [W19](w19-a-task-we-did-not-mint-on-a-real-scheduler.md), the previous `examples/**` item. **This
  item is the likely next occurrence** for ADR 0036 or ADR 0037, and naming that in advance is what
  made W19's a measurement.
- **The browser.** L6 does not run there and must not be placed where it would be bundled:
  `examples/**` and **not** `test/**`, because the browser bundle globs `test/**/*.test.ts`
  (`RT-R10`).

## Verification

| Clause | How it is run |
|---|---|
| **L6, Node** | `npm run test:l6` |
| **L6, Deno** | `npm run test:l6:deno` |
| **the whole gate** | `npm run gate`, written to a log with `echo "GATE EXIT=$?"` appended, and **read from that line** rather than from a shell wrapper's code or a grep |
| **conformity** | spec first, harness second — and the harness is where the last three `examples/**` items' blocking findings all were |
| **adequacy** | mutation in an isolated copy, walking the rule ids |

**Routing cases** (`doc/workflow.md` section 5 rule 6): **all of them are in scope at L6 and this
item says which it actually ran.** A branch **routed away from its join**
([Q4](../open-questions.md)), **`user_action`** ([Q17](../open-questions.md)), **optional-null**, a
**duplicate task id** ([Q13](../open-questions.md)) and a **nested fan-out**
([Q6](../open-questions.md)) each either has an L6 row here or is named as not run. Silence is not an
answer.

**Rule 8, all five obligations, re-run after the readers.** **This item's directory is where the
evidence for obligation (c) lives** — **eight recorded instances of a value whose PROVENANCE was
wrong, every one in `examples/**`, every one BLOCKING, and not one found by an author.** The
procedure is one sentence and it is the sentence to hold onto: **a provenance probe changes the
SOURCE EXPRESSION and nothing else.** The moment it also edits the projection, the expected literal,
or a second line, it is a rewrite and its survival says nothing.

**And obligation (d), LOOP BOUNDS, has its own recorded failure in this exact file.**
[W23](w23-a-nested-flow-on-real-workers.md) ran five bounds probes deliberately, all five were
caught, **and its reader still found two more** — four L6 rows deletable for one edited number, and a
whole list emptiable for 0 which took [P6](../plans/p6-what-may-share-a-scheduler-with-a-driver.md)'s
exit artifact with it. The author bounded the lists a **row** iterates; the reader bounded the lists
the **file** iterates. **A map is a loop whose bound is the feature**, so this is the item where the
two are easiest to confuse.

## Exceptions declared IN ADVANCE

`Owns` is `examples/**`. **Three** files outside it were edited. Two are in `scripts/`, share one
reason, and that reason was **measured before either was touched**; the third is another item's file
and is declared here because it is not on `doc/workflow.md` section 1 rule 5's record-step list.

*(**This section read "Two files … both in `scripts/`" and was FALSE when written** — the third edit
had already been made, at this item's declaration step, and is the one it was made to record.
**W35's conformity reader**, and it is `doc/workflow.md` section 7 rule 2's own subject: an exception
table is a claim like any other, and this one was a count of the exceptions the author was thinking
about rather than of the files `git status` shows.)*

| file | why | what it changed |
|---|---|---|
| `doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md` | **W34's Record asserts something about THIS item that is false**, and correcting it is what W35's declaration step found: it says Q167-Q168 are *"the remainder of P10's block"* and that *"W35 has not reserved"*, when this file has read `Reserves: Q167-Q168` since P10's declaration. `doc/workflow.md` v0.7 change 3's own case — a gap that blocks a fix — one directory across: another item's file is on **nobody's** `Owns` once that item is done, so a false claim about you can only be corrected by an exception or not at all | the Q167 parenthetical, plus the mangled sentence a first pass at it left behind — found by the reader, not by the edit |
| `scripts/check-scheduler.mjs` | **Rule 8's obligation (e), with a live case.** `S12` binds the gate chain's entry NAMES and `D6` binds the Deno rung's *runtime* and *resolution*; **nothing bound either rung's FILE**, and nothing at all bound `test:l6`. Measured: pointing either rung at `examples/run-flow.ts` — a module that exports functions and runs nothing — costs **zero** failures across `check:source`, `check:scheduler`, `check:spec` and `check:markdown`, so ladder L6 exits 0 having asserted nothing | `D6` gains three clauses: each rung exists, invokes its runtime, and names `examples/l6.ts` |
| `scripts/check-scheduler-selftest.mjs` | The file's own convention is a probe and a `META` entry per `fail()` site; three new sites need them, or the clauses ship ungraded — which is the [Q149](../open-questions.md) shape the check was extended to close | +4 probes, +3 `META` entries, one `UNCITED` exemption; `MIN_PROBES` 22 → 26, `MIN_META` 24 → 27 |

**Why fix rather than report.** [P7](../plans/p7-is-a-join-transitive-over-nested-fan-out.md) declined two checks
because `scripts/**` was in nobody's `Owns`, and [P8](../plans/p8-what-can-be-deleted-with-the-gate-green.md)
then existed to take them — that is this repository's own precedent for *measure it, name it, do not
reach*. It does not fit here: what the hole deletes is **this item's own declared output**, and P4's,
P6's and P7's with it, because ladder L6 is one file. An exit artifact nothing requires to be RUN is
not an exit artifact. **This is the third consecutive item to take a `scripts/**` exception**
(W32 took two, W36 took seven) and P10's retro is where that pattern is judged, not here.

## Record

**Gate — what ran.** Baseline `23ea429`.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **pass** | `tsc -p tsconfig.json`, `tsc -p tsconfig.examples.json`, `deno lint src/ test/ examples/ index.ts` — 45 files |
| L6 node | **pass** | **638 assertions, 0 failed, 31 real runs** on `fyflow-scheduler 0.5.1`, node 24.20.0. *(605 / 30 at the author pass; the readers added a row and eight assertions.)* |
| L6 deno | **pass** | **638 assertions, 0 failed**, deno 2.9.6 — identical |
| whole gate | **pass** | `GATE EXIT=0`, **zero FAIL lines**, 19 chain entries. **L1 unmoved at 21 file(s) / 574 assertions** in node, deno and chromium with parity — the declared result, since this item adds no `test/**`. `check:scheduler` is D1-D6 and its self-test is **26 probes / 27 gradings**. *(The run before this one was **`GATE EXIT=1` with one FAIL line**, and it is the reason the exit code is the predicate: rewriting `D6`'s wrong-FILE clause to compare the entry point changed its message from *"does not run"* to *"does not RUN"*, so that clause's `META` anchor matched nothing — and `check-scheduler-selftest.mjs` reported **the mutation matched nothing** rather than passing. Rule 7 (b) firing correctly, caught by a check rather than by a reader.)* |
| conformity reader | **ran** | **16 findings, 6 blocking**, all acted on — see the section below. Its empty categories are information: every rule citation it checked said what the code said it said, the census reproduced independently at 129 / 89 / 2 / 38, no `spec/` sentence was falsified, and no expected value was reverse-engineered from output |
| adequacy reader | **ran** | **67 mutations, 32 survivors, 7 blocking**, in an isolated copy off the shared tree with no symlinks and no reparse points. All eleven of its named mutations are now caught — see below |
| re-run after the readers | **ran** | **36 provocations**: the author's 22 (20 caught, 2 declared ceilings), the 3 wiring probes, and **11 of the readers' own edits checked back in — all eleven fire**, at 1 to 12 failures each. One author probe went inert and was re-anchored (rule 7 (b)); the probe harness itself had a bug that read as four findings |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| a map-fanout end to end on a real scheduler, **both runtimes** | `map / live-token`, r22 | the four new cross-row clauses, and `dispatched` on three rows |
| its arity taken from the previous node's output | the `split` role returns one item per word | probe c2/c3 — sourcing the array from a constant costs 16 and 9 failures |
| its join firing over branches nobody declared | `joined: true` over `0`,`1`,`2` in a region whose `branches` is `['score']` | probe a6 — 12 failures |
| the join's successor carrying what W34 decided | `nodeResults['r22:publish:-:0'].joinPayload`, and the nested one at r25 | probe a7 — 6 failures |
| a row with a declared expectation | five rows, every expected value written from `spec/` before the first run | — |
| **the measured cost of reverting W32, W33, W34** | below | — |

**The exit artifact.** `npm run test:l6` and `npm run test:l6:deno`; rows `map / live-token`,
`map / arrival-count`, `map / N = 0`, `nested-map / live-token`, `map / FD-R2 — over names no array`
and `map / one item, two instances — ADR 0037 rule 1`.

**What reverting costs, in L6 failures.** One source-expression substitution each, applied to a clean
tree, `src/` restored and the restore verified:

| revert | cost |
|---|---|
| **W32** — a `map` opens no region (`regions.ts`) | **the run DIES at construction**: `InvalidDefinition: FD-V11 at score / collect / publish / done — node is not reachable from entry`. That is P10's declaration measured from the other side: without a map region the flow's whole tail is unreachable, which is one of the three ways a map-fanout was refused before W32 |
| **W33** — the arity is not taken from the run (`const items = []`) | **35 failures** across `map / live-token`, `map / arrival-count`, `nested-map / live-token` and the cross-row block |
| **W33** — `arrival-count`'s `N` read from `region.branches` again | **1 failure**, on `map / arrival-count` alone, and **every static row is unmoved** — which is W33's claim measured on real workers rather than argued. The one failure is `publish` receiving `{"0":{…}}` where the row declares three keys: **the join fired on the first arrival with two branches still in flight and the run reported `completed` having thrown two thirds of its work away.** Before this item that revert cost **0** at L6 |
| **W34** — a satisfied join carries `null` | **6 failures**: `fanout-join / live-token`, `all-exit / live-token`, all three map rows that reach a join, and the cross-row `JP-R12` clause |

**Routing cases — which ran, named rather than left to silence.**

| case | at L6 |
|---|---|
| a branch routed away from its join ([Q4](../open-questions.md)) | **run**, on **three of the five** `p1-routed-away` rows — the two `high` rows run the same flow with the predicate FALSE, so no branch is routed away there. *(This read "the four", which is neither the number of rows named that nor the number where a branch leaves. W35's conformity reader.)* — not by a map row, and no map flow here carries a decision edge |
| `user_action` ([Q17](../open-questions.md)) | **run**, on the two suspend rows and the dotted-path resolve — **not by a map row**: a person resolving a map instance at a run-time index is a shape nothing here reaches |
| optional-null | **run**, on the two `optional-loss` rows; no map branch is `optional` |
| a duplicate task id ([Q13](../open-questions.md)) | **NOT run, and it cannot be** — `ID-R1` refuses a repeat before dispatch, so a row would assert the refusal rather than the collision. What a map adds is that the ids are minted from a run-time index, and probe `a1` is the evidence: collapse the index and the run mints `r22:score:0:0` three times, which is **46 failures** |
| a nested fan-out ([Q6](../open-questions.md)) | **run**, on W23's four rows, and now with a **map** inside a fan-out branch on `nested-map / live-token` |

**Rule 8 — 36 provocations, 34 caught, 2 declared ceilings, 0 survivors standing, 0 aborted**,
graded on the failure LINES with each probe declaring the substring that must appear. The author's
25 — obligations (a) 7, (b) 4, (c) 5, (d) 6, (e) 3 — plus **11 of the readers' own edits checked back
in**, which is rule 8's second requirement, and **all eleven fire**, at 1 to 12 failures each.

**The re-run earned its place twice.** One author probe went **inert** on the item's own later
edits — the items construction moved into `memoisedItems` when the alias row was added, so its anchor
matched nothing — which is rule 7 (b) firing correctly, and it was re-anchored on the derivation
rather than re-pinned to the line that used to hold it. And the harness's own multi-edit bug made
four reader probes read as WRONG-REASON before it was found.

**Two of those catches are catches only because this item acted on them.** `e1` and `e2` — either L6
rung pointed at a module that runs nothing — **survived on first measurement**, and are caught by the
`D6` clauses declared as exceptions above. They are counted as catches because the set was re-run
against the fix, which is what rule 8's second requirement asks; the honest reading of the set is
**23 caught with two of the catches bought**.

The two ceilings are named rather than counted: `slice(0, 1)` on a per-definition map list is a no-op
because no flow here has two maps, and **a bound LOWERED cannot fail** — only one raised or a list
emptied can, which is why `d3b` raises it instead and is caught at 1.

**What broke.**

**1. The provocation harness deleted the item's own work.** Its first version restored with
`git checkout -- src/ examples/`, which is correct on a clean tree and catastrophic on a dirty one:
every uncommitted edit in `examples/` — the five rows, three flows, the worker role, the pool, the
`FD-V5` derivation — was gone, and the aborts that followed were the harness reporting that its own
anchors no longer existed. **This is [Q151](../open-questions.md) one layer out**: P9 found a harness
writing mutants into a directory a child deletes and grading the deletion; this is a harness whose
*restore* is the deletion. Recovered from the session transcript, verified at 605/0 in both runtimes,
and the harness now snapshots each file's bytes and writes them back, asserting the restore.
**[Q172](../open-questions.md).**

**2. Two provocations were VACUOUS and the set said so.** `b4` added `outcome: 'completed'` before
the row's own `outcome: 'stuck'` — in an object literal the last key wins, so the probe changed
nothing and read as SURVIVED; and `b3` was written as a *control* declared to cost 0 and was a
**real hole** (below). Rule 8's third requirement is *a provocation is evidence only when it fires,
and only when it fires for the reason it names*; **the reading that catches these is the other way
round — a probe declared to cost 0 has to be checked for whether it SHOULD.**

**3. `failureNames: []` disabled the assertion it declares.** The widening this item made to the
run-failure check read `e.failureNames ?? e.dispatched`, so a row could turn off the check on its own
message by declaring an empty list: `[].every(…)` is `true`. Closed with `?.length ?`, so an empty
declaration falls back to the ids and the `FD-R2` row fails. Found by probe `b3`.

**4. A META entry was paired with the wrong probe, and `check-scheduler-selftest.mjs` said so.**
The new wrong-RUNTIME clause was cited by the probe that points the Node rung at another *file* —
which trips the wrong-FILE clause instead, leaving the runtime clause **masked behind a sibling
reporting the same id at an unmoved failure count** (`1 -> 1`). That is W29's masking shape, caught by
W29's own discriminator, in a file this item was extending. Re-pointed to a probe that changes the
runtime and keeps the file.

**5. A `META` anchor went inert on this item's own fix, and the gate said so.** Rewriting `D6`'s
wrong-FILE clause for the adequacy reader changed its message, so the self-test entry pinned to the
old wording matched nothing — `GATE EXIT=1`, one FAIL line, *"the mutation matched nothing"*. **Rule
7 (b) firing correctly rather than passing**, and the second time in this item that a fix for a
reader made a probe inert; the first was an author probe re-anchored on a derivation. *A mutation
pinned to a message is unmutatable the moment the message is right to change.*

**6. `examples/README.md` was wrong by eleven assertions and had been since W23.** `git show`:
W17 and W19 have this page and `l6.ts` agreeing (342, 373); at W23 the page says **478** where
`l6.ts` declares **489**, and it stayed wrong through W34 and W36, whose Records both carry 489.
**The sentence that introduced the error is the one that corrects the previous instance of it two
clauses later**, in the paragraph whose own parenthetical says nothing checks these numbers.

**What this taught.**

**A check can bind a command's INPUTS, its RUNTIME and its RESOLUTION and still not require it to run
the FILE.** W36 found `D3` resting on a premise about a command string; one item later the same
question one level in — `D6` bound `deno run` and `--import-map` and neither rung's argument — and
the answer is that **every exit artifact this repository has could be silently unrun for one edited
word**, with the gate at exit 0 and `S12` green because the entry *names* are all still there. Rule
8's fifth obligation in its fifth shape: not a check that is not run, not a guard that cannot reach
its subject, not a value computed and never read, not a premise about a command string — **a command
that starts the right runtime and opens the wrong file.**

**And the sharpest thing a map row buys is a failure DIRECTION.** Reverting `arrival-count`'s
re-sourcing costs exactly **one** assertion and the run still says `completed`, every branch still
`arrived`, every task still dispatched and settled, `joined` still `true`. The only observable is
what the join **carried** — one key where three were declared. `N` too large hangs and is loud; `N`
too small completes and is silent, and the only thing in the repository that can see it is a value
somebody wrote down before the run.

**Questions raised.** [Q170](../open-questions.md), [Q171](../open-questions.md),
[Q172](../open-questions.md).


## The adequacy reader — 67 mutations, 32 survivors, 7 blocking, all closed

**Its seven blocking findings break something the author's set does not: three break a BOUND the
file iterates, two break a PROVENANCE, one breaks a declaration's own escape hatch, and one breaks a
command string.** Not one is reachable by a probe that breaks a value, which is the split
`doc/workflow.md` rule 8 was extended twice to name.

**1-3 and 9 — P10's exit artifact deletes for two edited numbers, and so does each row on its own.**
This item answered W23's *"four rows deletable for one edited number"* with five cross-row clauses;
the reader deleted the five map rows, the cross-row block with them, and edited **`DECLARED_TOTAL`
and `CROSS_ROW`** — **cost 0**, L6 green at 489, the pre-W35 figure. *A layer whose floor is a second
number a human writes is not a second floor.* Worse, two single-row deletions each make a `src/`
revert this item measured cost **0** again: delete `map / arrival-count` and W33's `arrival-count`
re-sourcing goes from 1 failure to none; delete `map / FD-R2` and `FD-R2` itself reverts for nothing.

Closed two ways, because either alone is the same shape again. **`ROW_KEYS`** is `S12`'s form one
rung down — the row keys declared, compared by **set equality AND order**, so a deleted row fails
**naming itself** rather than moving a total. And **a bound whose authority is outside this file at
all**: `spec/examples/valid/**` is read from disk, and L6 must run a flow containing **every node
kind the spec corpus expresses**. Deleting the map rows now costs a `spec/` edit. Measured: the
five-row deletion costs **9**, and the three single-row deletions **7**, **10** and **12**.

**4 — the `D6` clause this item declared an exception to build was defeated by four characters.**
`cmd.includes('examples/l6.ts')` is a substring test on a command string, so
`deno run --import-map=… examples/run-flow.ts --note=examples/l6.ts` passes **every** `D6` clause,
prints `ok`, leaves both self-tests at exit 0 — and `npm run test:l6:deno` then exits 0 with no
output. **The exception's stated reason was *"a command that starts the right runtime and opens the
wrong file"*, and the fix admitted exactly that case with an argument appended.** Now compared as the
**entry point**: the first non-flag token after the runtime's own words. Both of the reader's mutants
fail; the clean tree passes.

**5 — `settledByScheduler` can be read from the driver, and the two assertions that exist to prevent
it become tautologies.** `settledByScheduler: [...dispatched]` in `run-flow.ts` — one expression —
costs **0**, and `Q32`'s *"the SCHEDULER reported a settlement for every dispatched id"* and *"the two
sources agree"* become `dispatched` compared with `dispatched`. The negative control sits on the same
expression: deleting the `task.failed` listener costs **20** with the real source and **0** with the
swap. Closed on the pair row that injects foreign tasks — the scheduler settles ids **this library
did not mint**, so a driver-sourced list cannot contain them. Pre-existing rather than W35's, and
closed here because provenance is the axis this item's Verification section names.

**6 — the widening this item made carried three ways for a row to disable it.** `failureNames: ['']`
passes because every string contains the empty one; dropping one declared name passes because the
other is still there; `every` → `some` passes because a correct list agrees with both. **All three
cost 0**, and the `?.length ?` fix rule 8's own probe `b3` bought had closed one spelling of three.
Now the declaration is checked **against the row's own definition** — `FD-R2` owes the node and the
key, both of which are in `e.definition` — and the message assertion is **one per name**, so the
quantifier a mutation could weaken no longer exists.

**7 — four of the five cross-row clauses were about REGIONS, not about maps.** Swapping
`mapRegionsOf`'s `kind === 'map'` to `'fanout'` cost **1**; widening it to both cost **0**. The
pre-W35 fanout corpus satisfies *a map runs at all*, *opened more than one*, *a dotted path* and *a
three-key collection* by itself, and the filter — the only thing making the block about a map — was
pointed at by nothing. Closed with a negative control **on the expression the mutation changes**,
which is this item's own lesson from W34 restated: `mapRegionsOf(FJ)` must be `[]`.

**10 — ADR 0037's own INVARIANT was unfalsifiable at L6.** Rule 1 is *no two nodes ever receive the
same object*; the driver holds it with a per-instance `cloneValue`, and its comment names the case
exactly — *"`structuredClone` preserves aliasing WITHIN one clone, so `{items: [x, x]}` survives the
edge hop as an array holding one object twice"*. **Dropping that clone cost 0**, because every
payload here produced distinct items. Closed by building the shape: the `split` role now **memoises
per word**, so `'a a'` returns an array holding one object twice, and a new `TallyWorker` **mutates
what it is handed**. With the clone both instances read `seen: 1`; without it the second reads the
first's write and returns **`seen: 2`**, at 2 failures. *An identity fact turned into a value two
assertions compare.*

**And the probe harness had a bug that read as four findings.** Its first re-run reported r1, r2, r3
and r9 as WRONG-REASON at one failure each; the cause was that a multi-edit probe wrote
`snapshot(p).replace(a, b)` **per edit**, so a second edit to the same file overwrote the first from
the pristine snapshot and only the last was ever applied. **A harness defect that looks exactly like
a finding** — the second time in this item, after the `git checkout` restore, that the instrument was
the thing under test. [Q172](../open-questions.md) is about the first; this is its second occurrence.

## The conformity reader — 16 findings, 6 blocking, all acted on

**Its blocking six are the same shape and it is not the one this item was watching.** Not a false
claim about the map — **every rule citation it checked said what the code said it said, the census
reproduced, and `spec/` needed no change** — but **five documents that record what happened and were
not written.** `doc/README.md`'s own current-state line still read *"489 at ladder L6 — 23 row
labels, 25 real runs"* nine hundred lines above the paragraph this item added; the root `README.md`
was untouched; **`doc/plans/p10-*.md` still said "W35 has not started"** in four places while three
other documents said it was done; the `doc/work-items/w34-*.md` edit was **undeclared**, and the
exception table's own opening sentence counted the exceptions the author was thinking about rather
than the files `git status` shows; and a first pass at that edit had **orphaned a sentence fragment
across a blank line**, so W34's file rendered literal asterisks and read *"W35 had reserved / yet"*.

**[Q171](../open-questions.md) is this item's own question and it fired on this item, twice.** The
row was raised because `examples/README.md` carried a stale count; the reader then found the same
class in `doc/README.md`'s current-state line, in the root `README.md`, and in the sentence of
`examples/README.md` that this item had just rewritten — which called all three numbers *derived*
eight lines below a parenthetical saying two of them are typed and checked by nothing.

**The sixth is the one to carry, and it is `doc/workflow.md` section 1 rule 5's writing clause with
the scope going the wrong way.** The `map / N = 0` row justified `joined: null` by *"section 5 says
no policy can say anything but `waiting`"* — the **unscoped** form of a ruling that
`spec/join-policy.md` **v0.13 narrowed in place one item ago**, because `arrival-count-decrementing`
has no `need > 0` pin and reports `satisfied` at `0 >= 0`. The row's assertion is right and its
reason generalised past the document it cites — in an item whose declared `Input` is W34, the item
that did the narrowing. Corrected in the comment **and in the `why` string**, which is printed.

**Three counts did not reproduce.** *"Twelve assertions run after the derived-total check"* is
**seven** — the enumeration behind twelve counts this item's five clauses as if they had stayed below
the check, in the paragraph explaining that they were moved above it. *"The four `p1-routed-away`
rows"* is **five rows, three of which route a branch away**. And *"the corpus flow with one field
changed — diff them"* is **two**, on an invitation that does not survive being taken up; the nested
flow differs in **nine node lines** and keeps the corpus's shape rather than its text.

**Two more were in things this item widened.** The new `D6` loop re-tested `deno run` on the rung
that already had that clause, so one defect reported **two `D6` failures with near-identical
messages** — the sibling-under-one-id shape produced by a widening rather than found in one, and the
missing-rung clause beside it already carried the guard. And the run-failure assertion's label was
rewritten to interpolate the **error class**, so the `uncloneable` row printed *"UncloneableResult:
and its message names the task id"* and cited **no rule at all**, where it had cited `OR-R6`. Both
fixed; the label now names `OR-R6` or `FD-R2` by which source the row declares.
