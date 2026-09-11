# W53 — What a run retains that nothing reads

**Status:** done
**Plan:** [P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md)

```
Spec:       spec/run-state.md section 6 (the "Bounded retention" bullet, open
            since v0.1) and spec/join-policy.md section 4 (JP-R11, JP-R12)
Owns:       src/driver/**, test/driver/**, spec/run-state.md,
            spec/join-policy.md, doc/decisions/0046-*.md
Inputs:     P15 facts 1-4, read from the PLAN's own file and RE-RUN from
            dev-dist/p15/facts.ts rather than transcribed - which is the
            mechanism that caught P14's founding error (its retro, refusal 5).
            ADR 0037 rule 1 and rule 4; ADR 0040 rule 2; ADR 0014.
Outputs:    (1) ADR 0046 - what a run retains, what it may forget, and when
            (2) the `arrivals` clear, with the join-never-fires case answered
            (3) spec/run-state.md section 6's bullet RESOLVED rather than
                restated, with the variable named correctly (fact 2)
            (4) JP-R11/JP-R12 stating the lifetime of what a join collects
            (5) an L2 assertion that the cleared structure is empty after the
                join has fired, and NON-empty before it - the discriminating
                pair, whose difference is itself asserted (v0.13 change 3)
Depends on: nothing
Blocks:     W54, W55
Tests:      expected values from spec/ and from the ADR, never from output.
            The negative control is P15 fact 3's: clearing BEFORE the join
            reads costs 13 L1-L5 failures before this item's suite exists and
            14 with it, so the suite can see the structure.
Gate:       L0-L6, then spec-conformity pass (two readers)
Reserves:   Q233-Q237, ADR 0046
```

## Scope

**In**

1. **[Q19](../open-questions.md), decided as ADR 0046.** What a run retains, what it may forget, and
   when. The decision has to be falsifiable — `spec/run-state.md` section 6 has carried this as an
   unanswered bullet since v0.1, and a restatement is not an answer.
2. **The measured-free half**: `arrivals` is a second copy of every branch result and is **49.8%** of
   what a region-bearing run holds (fact 3). Clearing it after the join reads it costs **0 at L1-L5
   and 0 at L6**, and takes the top of P15's scale table from **3174.8 MiB to 1610.9 MiB**.
3. **The case the free half does not cover**: a region whose join never fires holds its arrivals for
   the life of the run (fact 3's own exception, measured at 65571 B on a 3-branch fanout with one
   branch settled). *A run that hangs is exactly the run that keeps everything*, and the ADR must say
   what happens to it rather than leave it to the clear site.
4. **Correcting the variable.** Fact 2 measures the footprint as *(tasks settled) x (bytes each
   returned)*; `spec/run-state.md` section 6 says *"proportional to its dispatched-node count"* and
   [Q19](../open-questions.md)'s row says *"proportional to its node count"*. Both name the smaller
   half. The corrected statement lands in the document this item owns.
5. **Naming `inputs`.** Fact 1: the register names `log` and `arrivals`; `inputs` is what actually
   holds every result and is in no row. Whatever ADR 0046 says a run retains has to name the structure
   that holds it.

**Out** — named rather than left implicit, with where each goes instead

- **Bounding `RunState.nodes[*].result`** — fact 7's 89%. It is measured **not** free: blanking every
  result takes the fold's input from 13984 B to 1612 B and **changes what `RunState` reports**. P15
  decision 1 forbids this item from taking it on the strength of fact 3. **W54's**, with the surface
  named.
- **Any eviction.** P15 decision 2: a fold over an incomplete log reports `completed` with zero nodes
  and no signal (fact 4). An eviction candidate needs a way for the fold to say it was handed less
  than the whole log, and that is a new `FoldInput` kind. **If this item finds one that costs a field
  rather than a kind, that is prediction 2's reversal and it goes to the plan's Record.**
- **`maxCompletedTasks`.** Fact 4: it caps `scheduler.tasks`, which is the scheduler's own map, and
  reaches nothing this driver holds. There is no answer to inherit. Recorded in the ADR as a candidate
  measured and refused, not as an open option.
- **[Q22](../open-questions.md)** — what a result may be. **W54's.**
- **[Q15](../open-questions.md)** — durability. Named in the ADR as what a resumed run cannot be
  handed; not decided.
- **[Q219](../open-questions.md)** — a region's collection. P15 declares it the follow-on.

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint` and `npm run typecheck`. **A rung reported GREEN means its command EXITED 0** — `doc/workflow.md` section 4, v0.15. A tail line is never the predicate, and `deno lint` prints `Checked N files` either way |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`. The baseline is 25 files / 681 cases in five runtimes; this item ships **26 / 695** |
| L6 | `npm run test:l6` and `npm run test:l6:deno`. The baseline is 942 assertions over 42 real runs |
| L4 | `npm run check:spec` — `spec/` is 7 documents, 44 examples, 89 rules at the baseline and **90** here, `RN-R13` being the one rule added, and `C8` compares `spec/README.md`'s version row |
| conformity reader | spec first, code second, re-deriving this item's expected values before looking at them |
| adequacy reader | **in an isolated copy**, and the AUTHOR's tree holds still while it reads (section 6, v0.15). Scan for links and reparse points before removing the copy; `../fyflow-w16-adequacy` is on disk from earlier work and is **not** this item's to remove |

**Routing coverage**, since this item touches the join exit: a branch routed away from its join
([Q4](../open-questions.md)) is covered — it is the case where arrivals are held and never read; a
nested fan-out ([Q6](../open-questions.md)) is covered — *(this read "because the clear is keyed by
region and a nested region has its own key", which is an ARGUMENT and was not a case: every fixture
here was depth 1 until the adequacy reader made a nested region never release for ZERO. It is a case
now)*; `user_action` ([Q17](../open-questions.md)) is covered by the
never-fires case. A duplicate task id ([Q13](../open-questions.md)) and no matching decision edge
([Q10](../open-questions.md)) are **not applicable** — neither reaches the join exit.

**Before this item is done it greps the tree for `W53`** outside `doc/` — section 1 rule 5's third
direction, with the procedure v0.15 adopted. **This declaration said it returns 1 hit and it
returns THREE**, all in `CLAUDE.md` — lines 27, 29 and 163 at `82ff3ba`. The one named here is 163,
*"the next plan starts at W53"*, which has no expiry date; the two missed include **"No item has
started"**, which is exactly the expiry-dated claim the procedure exists to find. Corrected at the
record step, and recorded in the Record because the under-count is the finding.

## Record

**Gate — what ran.** Every rung's verdict is its command's EXIT CODE (`doc/workflow.md` section 4,
v0.15); the failure counts beside them are the secondary signal.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN — green** | `npm run lint` exit 0, `npm run typecheck` exit 0 |
| L1-L5 | **RAN — green** | **26 files / 695 cases** in node 24.20.0, deno 2.9.6, chromium, firefox and webkit. Baseline 25 / 681, so this item adds one file and 14 cases |
| L6 | **RAN — green** | **942 assertions over 42 real runs**, unmoved, in node and deno. An item that adds no flow and no worker should move L6 by nothing, and it does |
| L4 | **RAN — green** | `npm run check:spec` — `spec/` is **7 documents, 44 examples, 90 rules**, from 89: `RN-R13` is the one rule added. `C8` compares `spec/README.md`'s version rows and caught both bumps before they were written |
| conformity reader | **RAN** | **16 findings, 6 blocking.** See below |
| adequacy reader | **RAN** | **27 tree edits, 21 graded provocations, 9 survivors against the shipped tree, 6 blocking.** In an isolated worktree at `../fyflow-w53-adequacy` with copied `node_modules` and zero links, verified green before it started |
| rule 8 | **RAN TWICE** | author pass **28 probes / 23 caught / 4 declared ceilings / 1 undeclared survivor / 0 aborts**; re-run with the readers' eight exact edits checked back in, **36 probes / 32 caught / 4 survivors / 0 aborts**. Every file compared back byte-identical to its baseline digest after every probe |
| `npm run gate` | **RAN — `GATE EXIT=0`** | zero lines beginning `FAIL`, 15 chain entries, taken with the tree HELD STILL: digest before and after identical |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **(1) ADR 0046** | yes, six rules | Moving the file aside: **11** `check-markdown` failures and **6** `check:spec` `C5` failures, because `spec/run-state.md`, `spec/join-policy.md`, `spec/README.md` and the driver all cite it |
| **(2) the `arrivals` release, with the join-never-fires case answered** | yes, three moments | Deleting the satisfied-exit release costs **4** L1-L5 failures; the unsatisfiable one **1**; `failRun`'s **1**; the `firedJoins` recording guard **2**; releasing every region instead of one **1**, in the pre-existing L5 matrix. **The never-fires case is answered by rule 5** and asserted on `p1-routed-away` under `arrival-count` |
| **(3) `spec/run-state.md` section 6 resolved** | yes — section 7 and `RN-R13` | Removing `RN-R13`'s id costs **1** `check:spec` `C2` failure; the version bump not reaching `spec/README.md` costs **1** `C8`. The corrected bullet itself is prose and costs **0** — a declared ceiling, and the standing *`doc/` is checked by nothing* class |
| **(4) `JP-R11`/`JP-R12` lifetime** | yes, no rule id added | **0.** Declared ceiling: the clause is prose in a rules table and `C8` compares the version column. What it STATES is bound — by the L2 cases — but the sentence is not, which is the eleventh occurrence of that class and is why the ADR carries the same rule |
| **(5) the L2 discriminating pair, difference asserted** | yes | Collapsing it in either direction costs **1** each; deleting a case from the suite's own list costs **1** naming the case; renaming the suite out of the glob costs **1** |

**What broke.**

**The negative control was 13 and is 14, and three copies said 13.** P15 fact 3's *clearing BEFORE
the join reads costs 13 L1-L5 failures* re-runs exactly — on the suite as it stood **before** this
item. On the tree this item ships it is **14**, the fourteenth being this item's own *the release is
AFTER the read*. The register row already said both; the driver comment, the test comment and the
ADR said 13. Section 1 rule 5's WHEN clause, found by the conformity reader — *an index contradicts
the document it indexes on precisely the sentence that was just corrected*, running the other way.

**`RN-R13`'s stated test was a reachability SET, and a set cannot tell an ALIAS from a COPY.** Both
readers falsified it, from opposite ends, and it is the one subject they shared. The conformity
reader ran this file's own predicate against a corpus flow that declares a `needs` and got a
**third** name — `outputsCache` holds a settled result. The adequacy reader came the other way and
made that memo `structuredClone` what it stores — **a real second copy of every result, for ZERO
failures across lint, typecheck, `check:spec`, L1-L5 and L6** — because both L2 fixtures declared no
`needs`, so the memo was `null` in all eight cases. **That is P15 fact 1's own defect reproduced
inside the test written to correct it**: fact 1 recorded `outputsCache` as `null` because it
enumerated properties on flows with no `needs`, this item corrected that by name in the ADR, and
then chose its fixtures the same way. The rule is a SET **and** an IDENTITY now.

**`RN-R13`'s second term used the wrong predicate and the item's own rule-5 case was the
counterexample.** It said *whose region is still LIVE*; `p1-routed-away` under `arrival-count` has
**zero live branches**, both terminal, and still retains. *Live* is what a BRANCH is; *terminal* is
what a JOIN becomes, and ADR 0046 rule 5's own closing sentence already used the right one — so the
rule and the ADR it points at disagreed.

**The code had THREE release moments and three documents enumerated TWO.** `failRun`'s
`arrivals.clear()` appeared only in the ADR and in the test, so a reader implementing the driver from
`spec/` alone would not have written it — and rule 5's unconditional *a region whose join never
becomes terminal holds its collection* was **false against rule 3** for exactly that region. Rule 5
is scoped *in a run that has not stopped*; all three documents name the third moment.

**`OR-R10` has a door that was already open, and this item made it SILENT.** `append` calls
`onFoldInput` un-wrapped, so a re-entrant listener reaches `failRun` from inside `settleJoin` — the
one door `failRun`'s own enumeration missed, because it is on the stack rather than ahead of it. A
stopped run routing out of a join at all pre-dates W53; what W53 changed is that the successor used
to be dispatched with the full collection and now gets **`{}`**, indistinguishable from
`live-token`'s legitimate all-exited case. `settleJoin` returns at `this.failed`: **0** failures at
L1-L5 and **0** at L6, and it tightens an existing rule rather than relaxing one.

**And the test written for it asserted the right thing by the wrong route.** The first version threw
from the listener — which unwinds out of `append` and out of `settleJoin`, so the guard below is
never reached and **removing it cost zero**. Found by rule 8's re-run with the reader's own edit
checked back in. What reaches `failRun` and comes **back** is a re-entrant scheduler event, which is
the shape the reader measured.

**Six things the adequacy reader found, every one at zero cost before it.** The walk could not see a
holder in a nested `Set` or in a **cyclic** object — and its `catch` arm asserted as fact the exact
thing the probe falsified, on a shape `structuredClone` accepts (P15 fact 7's own table). Its loop
universe could be pinned to the answer the assertions expect. A **nested** region and a **`fanout`**
region could each never release: every release case used one `map` region at depth 1, which is
[W41](w41-what-a-node-can-reach-and-what-names-it.md)'s finding verbatim and what `JP-R11`'s own Test
cell insists on. Seven of eight cases deleted for zero. And the `deadAfterTwo` stub violated `JP-R1`
— `status` was not a function of its argument — while ADR 0046 rule 4's justification rests on such
a policy being **lawful**.

**The universe binding caught the author's own wrong literal on its first run.** `DRIVER_FIELDS` was
written from `dev-dist/p15/facts.ts`, whose enumeration skips anything that is not an object, so the
two booleans `failed` and `started` were invisible to it: thirteen where the answer is fifteen.

**`git add -A` staged an embedded git repository** — a `p16-node-types` worktree under
`.claude/worktrees/`, which is not in `.gitignore`. Unstaged by hand; every commit here is from
explicit paths. [Q235](../open-questions.md).

**What this taught.**

**A REACHABILITY SET CANNOT TELL AN ALIAS FROM A COPY, and this repository had no vocabulary for the
difference.** `RN-R13`'s first form asked *which structures is this result reachable from* — which
is the natural question, is what `v8.serialize` answers in one call, and is **blind to the one
mutation that matters**: making an aliasing memo clone what it stores adds a full second copy of
every result and changes no reachability set at all. The fix is not a better set; it is a **second
predicate over the same fact** — identity — which is obligation (c)'s LIMIT arriving at a RULE
rather than at a probe.

**The item's sole observer is one L2 file, and the adequacy reader measured that rather than
asserting it.** Outside `test/driver/retention.test.ts`, ADR 0046 rules 3, 4 and 5 and the whole of
`RN-R13` have **ZERO** observers; only the read/release ORDER has a second route, the thirteen
pre-existing `JP-R12` cases. **With one observer, the observer's bounds are the decision's bounds** —
which is why that file now binds its own case list, its own walk universe and the driver's own field
names, and why five of the reader's six blocking findings were about those bounds rather than about
the driver.

**A FIXTURE CHOICE IS A CLAIM ABOUT WHAT SHAPES EXIST.** Every release-observing case used one `map`
region at depth 1 on a flow with no `needs`, and that single choice hid three separate defects: the
`fanout` half of rule 3, the nested half, and the whole of `outputsCache`. **W41 recorded this exact
shape** — *every one of the author's 37 probes used a map region, so a rule wrong about `fanout`
regions was unreachable from the set* — and P15's own fact 1 recorded it a third time from the
declaration side. *Three items, one plan apart each, and the author picks the fixture the feature was
built for every time.*

**Nothing for `doc/workflow.md`.** Every mechanism that fired here is one the document already has,
and the two that would be new are refused at one occurrence each: a rule about fixture DIVERSITY is
what obligation (a)'s *enumerate the rule's own clauses* already asks for and what W41 already
recorded, and a case-level census is the fourth list P13's retro declined three times. *The
mechanisms worked; what failed is that the author instantiated them against one shape.*

**Questions raised.**

- **[Q233](../open-questions.md)** — ADR 0046 rule 1 is a statement about what a run HOLDS and no
  public surface can observe it, so its only test reaches into a private field. Both alternatives
  measured and refused.
- **[Q234](../open-questions.md)** — emptying a test BODY costs zero and the runner's `assertions`
  figure cannot fall, because it counts `test()` **cases**. Measured in two files. **Not closed**:
  every available answer is a fourth list, and the case membership this item added catches deletion
  and not emptying — which is the count/membership distinction playing out exactly.
- **[Q235](../open-questions.md)** — `.claude/worktrees/` is not in `.gitignore`, so `git add -A`
  stages an embedded git repository.

**Q236 and Q237 reserved and unused. ADR 0046 taken; no second ADR was reserved.**

**Exceptions — files edited outside `Owns` and outside section 1's record step.**

| file | why | declared |
|---|---|---|
| `spec/README.md` | `C8` compares its version row against each document's own header, so bumping `run-state.md` to v0.6 and `join-policy.md` to v0.16 forces it. **P15 predicted this half by name** | late |
| `test/definition/l4-corpus.test.ts` | the suite census ([Q158](../open-questions.md)) is set equality over suite names both ways, so a new `.test.ts` file must be named there in the same commit. It fired on the first run, exactly as designed | late |
| `spec/flow-definition.md` | one sentence this item made false — *"its real question, whether that retention should be bounded, is untouched"*. Section 1 rule 5's third direction obliges the SEARCH; the edit needs an exception | late |
| `spec/outcome-record.md` | the same, one document across: *"The cost is real and is Q19's to measure"* | late |
| `scripts/check-markdown.mjs` | **NOT taken.** [Q142](../open-questions.md) was measured on a scratch copy before the gate and does **not** fire — see below | — |

**Four late exceptions, zero undeclared.** Three of the four were created by the CONTENT of the
change rather than by a file set: `spec/README.md` follows from a version bump, and the two `spec/`
sentences are ones this item's answer falsified. **P15's `Owns` prediction is answered
`AGENTS.md` NO, `spec/README.md` YES, `scripts/check-docs.mjs` NO** — the first item of three.

**[Q142](../open-questions.md) was re-measured BEFORE the gate and does NOT fire**, which is the
second consecutive time it has been checked and come back no. On a scratch copy outside the
repository: whole tree **102 / 4330 / 221**, `doc/decisions` removed **78 / 3954 / 221**, both
removed **62 / 3163 / 221**, against floors `M3` 90, `M4` 3490 and `M5` 60. The two-directory fixture
went 3109 → 3163 with **327 links of headroom**, and `M3`'s one-directory fixture is **unmoved at
78**, because this item's one new document is an ADR and both `removes` probes cut `doc/decisions`.

**The `W53` grep returned THREE at the declaration and this item's own file recorded ONE.**
`git grep -n 'W53' 82ff3ba -- . ':!doc/'` gives three hits, all in `CLAUDE.md` — lines 27, 29 and
163. The declaration named line 163, *"the next plan starts at W53"*, which is the one with **no**
expiry date; the two it missed include **"No item has started"**, which is precisely the
expiry-dated claim v0.15 adopted the procedure to find. **The procedure was followed and
under-counted by two, in the direction that matters**, on a clause one plan old. Corrected in
`CLAUDE.md` at the record step.

**Census CONFIRMED for the FIFTEENTH plan running — 182 / 131 / 2 / 49**, from 179 / 129 / 2 / 48:
three new ids and [Q19](../open-questions.md) moving from open to resolved. **43 ids in both
tables**, from 42, and both halves at **182 of 182 in exactly one cluster cell**, **0 aborts**. The
parser was P15's declaration parser, unchanged, run before this item's rows and after.
