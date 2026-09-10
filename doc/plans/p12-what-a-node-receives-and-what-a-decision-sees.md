# P12 — What does a node receive, and what does a decision see?

**Status:** COMPLETE and RETRO'D 2026-09-10. `doc/workflow.md` is now [v0.13](../workflow.md).
*(Declared 2026-09-09, after [P11](p11-what-should-the-gate-prove.md) closed and `doc/workflow.md`
reached v0.12.)*
**It is a PRODUCT plan, and it is the first since [P10](p10-is-fan-out-one-feature-or-two.md).**
*Read every status from the item's own file.*

```
Question:   What does a node receive, and what does a decision see?
Reserves:   W41-W44 (W44 expected unused), Q184-Q198, ADR 0040-0041
            (TEN questions, not five. P11 reserved five, spent them before its
            second item raised one, and extended the block TWICE. Section 3
            says reserve generously; five is not generous and the last plan
            measured that.)
            EXTENDED to Q198 at W43's declaration, and TEN was not generous
            either: W41 spent Q184-Q189 and W42 spent Q190-Q193, so the block
            was empty before the plan's last item had started. This is the
            THIRD consecutive plan to extend, after P11 twice - and unlike
            P11's it is an extension made at a declaration rather than
            mid-item. It changes no scope, no Owns block and nothing the plan
            costs; an id block is a numbering reservation, and section 3's
            *never reused or renumbered* is what it protects.
Exit:       two ordinary flows that this library cannot express today, running
            end to end on a real `FyflowScheduler` in both L6 runtimes:
              1. *score each item AGAINST THE RUN'S CONFIG* - a map whose
                 instances can see something other than their own item (Q166)
              2. *score, then fan out over the scores* - a map over what a
                 join collected, without coupling the flow to branch
                 NUMBERING (Q165)
            Both are blocked today for the same reason and the workaround for
            both is a reshaping `task` node the author should not have to write.
```

## Why this plan, and why now

**[Q11](../open-questions.md) is HALF answered, which is the state that invites the other half to be
got wrong.** [ADR 0037](../decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
settled what a **fan-out** branch receives and what a satisfied join carries, and
`spec/flow-definition.md` section 3 v0.10 states what an **ordinary** edge carries. That is Q11's
first candidate written down at last. **Its other two — a run-scoped accumulator and a declared
per-edge mapping — are both unbuilt**, and Q11's own row says this is *"the API surface users touch
most, so the one most expensive to change later."*

**[Q8](../open-questions.md) is the same question with a different consumer.** *Does a decision see
only its node's output, or accumulated run state?* A predicate and a worker are two things asking to
reach something the previous node did not produce, and answering one without the other is how a
mechanism gets invented twice. `src/driver/routing.ts` has said so since P1, in the type: *"What a
predicate receives. P1 populates exactly one field; Q8 is whether it grows."*

**And two questions the last plan's product work left behind are the same defect from below.**
[Q166](../open-questions.md): a `map` instance receives its own item and therefore **loses the
context around it** — and that row already says every fix for it *is* one of Q11's other two
candidates, so fixing it for a map alone would answer the API question from **one** construct.
[Q165](../open-questions.md): *score, then fan out over the scores* is blocked, and its workaround is
a reshaping `task` between the join and the map. **Three ordinary flows, one cause.**

**The argument against declaring it** is that this is the API surface hardest to change and Q11 has
been open since P1 for that reason. The argument for is that it is now half-decided, and a half-answer
with two unbuilt candidates is worse than an open question: the next item to need one will build it
from the case in front of it. *That is P10's own lesson — a claim written from a mechanism instead of
from the cases — and it is why this plan starts from three cases rather than from a mechanism.*

**The counter-argument about balance is recorded rather than left implicit.** Four of the last five
plans were about the gate ([P8](p8-what-can-be-deleted-with-the-gate-green.md),
[P9](p9-when-a-check-stops-checking-what-notices.md), [P11](p11-what-should-the-gate-prove.md)), and
*Verification and fixtures* is **51 open of 56** — 53% of every open question in the register.
**P12 does not touch it.** [Q181](../open-questions.md), [Q182](../open-questions.md) and
[Q183](../open-questions.md) stay live, unowned and available; Q182 is priced at roughly half of
`selftests`' ~358 s and is the largest measured saving anyone has written down.

## What was measured before this plan was declared

**Six facts, at ladder L2 with no scheduler. Two of them correct the register rows this plan is built
on, which is the FOURTEENTH time a plan has found one wrong by trying to act on it.**

### 1. Q8's stated cost is ALREADY PAID — the run retains every node's output today

Q8's row says accumulated state *"is what makes [Q19](../open-questions.md) urgent, because it means
the run retains every node's output rather than just the last."* **It already does.**
`src/driver/driver.ts` holds `private readonly log: LogRecord[] = []`, there is exactly **one**
`this.log.push` and **no** `splice`, `shift` or reassignment anywhere in 1790 lines, and
`OutcomeRecord.result` is on every settled task. `Driver.snapshot()` returns the whole of it,
publicly, frozen.

Measured on `linear.flow.json`: 2 tasks dispatched, **2 records retained**, and an accumulator built
over the log with **no new driver state** reproduces both results after the run has finished. On
`map-fanout.flow.json` at arity 3: 5 tasks, **5 records**, same.

```
An accumulator over the log, built with NO new driver state:
  {"r1:ingest:-:0": {...}, "r1:publish:-:0": {...}}
ALL of it is reachable AFTER the run, from the public snapshot(). New retention: 0.
```

**So a run-scoped accumulator is a PROJECTION of state that already exists, not new state.** Q8's
stated objection to it is a fact about the log rather than about Q8, and it was true before Q8 was
written. [Q19](../open-questions.md)'s *"if Q8 or Q11 retains every node output"* is not a
hypothetical; it describes today, and that row already carries a second instance
(`arrivals`) found by W34's conformity reader. **Both rows corrected in place at this plan's
declaration commit.** *(What Q19 asks — whether the retention should be BOUNDED — is untouched and
stays open. What is corrected is the claim that this plan's answer would create it.)*

### 2. Q8's mechanism is ONE field and ONE call site

`DecisionContext` in `src/driver/routing.ts` has exactly one member, `outcome`, and its doc comment
names Q8 by id. It is constructed at **one** site — `driver.ts:908`,
`const ctx = { outcome: cloneRecord(outcome) };` — and `selectEdge` is the only consumer. A second
field is a type change and one expression.

**This is recorded because it is the opposite of what the row implies.** Q8 reads as a design question
with an implementation behind it; the implementation is nearly free and **the decision is the whole
cost**. The same is true of the payload half: `this.enter(...)` has **five** call sites, of which the
ordinary edge is one — `cloneValue(outcome.result)` at `driver.ts:942`.

*(**This read SIX and there are FIVE**, corrected in place by
[W41](../work-items/w41-what-a-node-can-reach-and-what-names-it.md) as a declared late exception on
this file. `grep -n 'this\.enter('` returns six lines and one of them — `driver.ts:1668` — is inside a
**comment**, quoting the historical form `` `this.enter(runId, edge.to, null)` `` that W21 replaced.
The live sites are `start`, `advance`'s ordinary edge, the `fanout` arm, the `map` arm and
`settleJoin`'s exit. **The fifteenth time a plan or register row has been found wrong by trying to
act on it, and the first where the wrong number came from a grep counting its own file's prose** —
`doc/workflow.md` section 1 rule 5's *any copy, including your own*, applied to a count taken from a
tool rather than from a reading.)*

### 3. **A node-id key works for a `fanout` and does not express a `map` — and it is ADR 0036's deciding fact for the THIRD time**

The obvious accumulator is *"an object keyed by node id."* Measured, by running every region-bearing
flow in the corpus to completion and grouping the log by the node segment of each task id:

| flow | region | node ids whose id does not identify ONE output |
|---|---|---|
| `fanout-join.flow.json` | one `fanout`, arity 2 | **0** — `scoreA` and `scoreB` are distinct node ids, and `FD-V19` refuses a node in two branch entries of one fanout |
| `nested-fanout.flow.json` | two `fanout`s, depth 2 | **0** — even at the dotted paths, `scoreC` is `r1:scoreC:1.0:0` and `scoreD` is `r1:scoreD:1.1:0`, one record each |
| `map-fanout.flow.json` | one `map`, arity 3 | **1** — `score` holds `r1:score:0:0`, `r1:score:1:0`, `r1:score:2:0` under one id |
| `map-in-fanout.flow.json` | a `map` inside a `fanout` branch | **1** — `merge` holds `r1:merge:1.0:0` and `r1:merge:1.1:0`; the enclosing fanout's four other nodes do not collapse |

**All four region-bearing corpus flows, and exactly the map regions collapse — at any depth, and no
`fanout` does. A node id identifies at most one output outside a map region and exactly N inside
one.** *(The first draft of this fact measured the first and third rows and generalised from two;
`doc/workflow.md` section 1 rule 5's writing clause, applied to this declaration before an item acted
on it. The other two were run before the plan was committed and the conclusion did not move.)* That is
[ADR 0036](../decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
own deciding fact — `branchOf` is a `Map` keyed by branch node id, so a map's repeated-entry encoding
collapses to one entry — and W33 then found **every per-region run-time structure in the driver keyed
the same way** ([Q160](../open-questions.md)). **This is its third occurrence, and it is what this
plan has to decide**: not whether a node can reach an earlier output, but **what names one**.

### 4. Q166 reproduced, and the loss is total rather than partial

Given `{items: ['a','b'], config: {threshold: 7}, runLabel: 'nightly'}`, the two instances receive:

```
r1:score:0:0 received: "a"
r1:score:1:0 received: "b"
```

**`config` and `runLabel` are reachable from a `score` worker by no route at all** — not narrowed,
not renamed: absent. That is ADR 0037 rule 3 behaving exactly as decided, and it is what *map* means
in every language that has one; Q166 records it as a stated cost. The workaround is a reshaping node
plus **a copy of the context per item**, measured by W34 at 7.99 ms against 2.29 ms at N = 1000.

### 5. Q165's affordance is REAL, and so is its limit

`{"kind": "map", "over": "0"}` after a join validates with zero findings and **runs**: with two
branches settling, the run dispatched `r1:each:0:0` and `r1:each:1:0`. So *map over one branch's
result* works. **What does not exist is a key holding all the results as a list**, because `JP-R12`
collects them keyed by `branchPath` — deliberately, since an array index would be *position in the
arrival set* rather than the branch index. So *map over every result* has no `over`, and `over: "0"`
**couples the flow to branch numbering**: insert a branch and it silently re-points.

### 6. [Q164](../open-questions.md) is FORCED, and its own row says so

`spec/flow-definition.md` has `FD-V*` for a **validation** rule and `FD-R*` for a **runtime refusal**,
and the ordinary edge's payload contract is neither — it lives in section 3 as **prose with no id at
all**. `check-spec.mjs`'s `RULE_ID` is a closed list of eight prefixes, so a new one is invisible to
`C2` and `C6`: *a rule declared, cited, and checked by nothing.* W34 dodged it by putting `JP-R11`
and `JP-R12` in `spec/join-policy.md` section 4, which works because both have a region to hang on.

**Q164's stated forcing condition is *"a second rule about what a run carries that has no region to
hang on"*, and that is this plan's deliverable in one sentence.** It is in scope, and it is the one
`scripts/**` edit P12 expects to make.

## Scope

**In**

1. **[Q11](../open-questions.md) in general — what a node receives**, decided across its two
   remaining candidates and taken as **ADR 0040**, with Q166's and Q165's flows as the cases.
2. **[Q8](../open-questions.md) — what a decision sees**, decided from the same mechanism rather
   than beside it. **ADR 0041** if it needs one.
3. **[Q164](../open-questions.md)** — where a rule about what a run carries lives, and whether
   `RULE_ID` grows. Forced by 1.
4. **The exit artifact**: both blocked flows on real workers, in both L6 runtimes.

**Out** — named rather than left implicit, with where it goes instead

- **[Q19](../open-questions.md)'s actual question — whether retained state is BOUNDED.** Fact 1
  corrects its premise and does not answer it. Eviction is a run-lifetime decision with the
  scheduler's own sharp edge (`maxCompletedTasks` evicts silently) and it needs a measured run at
  1000s of workloads, which this repository does not have.
- **[Q21](../open-questions.md) redaction and [Q15](../open-questions.md) resumability.** Both are
  named in Q11's row as interacting; both are their own plan.
- **[Q9](../open-questions.md) — predicate purity.** [P10](p10-is-fan-out-one-feature-or-two.md)
  declined it with a measurement and it stays declined: nothing that widens `DecisionContext` makes
  a predicate more or less enforceable, and P10 measured that no mechanism worth its cost exists.
- **[Q22](../open-questions.md)'s constraint decision.** W34 supplied its measurements; what it needs
  is a decision about the *constraint* on workers, and that is not what a node receives.
- **The gate.** [Q181](../open-questions.md)-[Q183](../open-questions.md) are live and unowned and
  this plan does not take them.

## Decisions taken before fan-out

**1. Q11 is decided BEFORE Q8, which reverses the register's dependency direction, and the argument
is fact 2.** Q8's row is written as though a decision's context were the smaller, safer question to
settle first. It is not: a predicate and a worker want the same thing, the mechanism costs one field
either way, and answering Q8 first would let *"what is cheap to hand a predicate"* decide what a
worker receives. **The payload half has three real cases and the predicate half has one sentence**,
so the cases go first. *This is [P5](p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md)'s
W15 precedent — build the evidence before writing the decision — and P10's decision 2, which ordered
Q36 after the map ran for the same reason.*

**2. The KEY is the decision, not the mechanism.** Fact 3 says a node id names one output outside a
map region and N inside one. Whatever ADR 0040 decides, it must say what identifies an output, and it
must be checkable against a map — so **W41's evidence includes a map region or it is not evidence**.
The three candidate keys are named and none is preferred here: the **node id** (collapses), the
**task id** (unambiguous and couples the flow to `spec/task-id.md`'s format), and the pair
**(node id, branchPath)** (unambiguous and is what `branchPathOf` already computes).

**3. Nothing in `spec/join-policy.md` section 4 is reopened.** `JP-R11` and `JP-R12` are ADR 0037's,
they are the fan-out edge and the join's exit, and both are settled. **P12 is about the edges that
are ordinary** — which is the half section 3 owns and the half that has no id.

**4. No new node kind.** `map` was P10's and it was the first new kind in ten plans. Every candidate
here is a property of an edge or of what the driver hands `enter`, and a plan that reached for a
sixth kind would be answering a payload question with a graph change.

## Work items

| id | | owns |
|---|---|---|
| **W41** | *What a node can reach, and what NAMES it.* Q11's two remaining candidates, decided as **ADR 0040** from Q166's and Q165's cases plus fact 3's key problem. Builds the projection and the `spec/` rule, which forces **Q164**. Its evidence must include a **map** region or it does not bind. | `src/driver/driver.ts`, `src/driver/routing.ts`, `src/definition/**`, `spec/flow-definition.md`, `spec/examples/**`, `test/driver/**`, `test/definition/**`, `doc/decisions/0040-*.md`, and `scripts/check-spec.mjs` if Q164 lands |
| **W42** | *What a decision sees.* [Q8](../open-questions.md), from W41's mechanism rather than beside it. One field on `DecisionContext`, one construction site, and the same key. **ADR 0041** only if W41's answer does not already decide it — which is the prediction below. | `src/driver/routing.ts`, `src/driver/driver.ts`, `spec/flow-definition.md` section 3, `test/driver/**`, `doc/decisions/0041-*.md` |
| **[W43](../work-items/w43-the-two-blocked-flows-on-real-workers.md)** | *The two blocked flows on real workers.* P12's exit artifact: *score each item against the run's config*, and *score, then fan out over the scores*, end to end on a real `FyflowScheduler` in **both** L6 runtimes, with what reverting each item costs measured in L6 failures. | `examples/**` |
| **W44** | **reserved and expected unused**, on P9's and P11's precedent. If ADR 0040 needs a second implementation item, this is the id. A reserved id that is not spent is still not free. | — |

**Serial, and the reason is section 7 rule 2**: W41 and W42 would both edit `src/driver/driver.ts`
and `spec/flow-definition.md` section 3, so two concurrent items editing one file are one item. W43
depends on both.

## Predictions, written down before the items that test them

**P10's retro settled the distinction and P11's sharpened it**: a prediction derived from a
measurement you already have checks your **reasoning**; a prediction about a mechanism's **reach**
checks the mechanism, and only the second can reverse — *and a reach prediction can be confirmed and
still be wrong about its own mechanism*, which happened twice in P11. **Two of each.**

| # | kind | prediction | tested by | what would reverse it |
|---|---|---|---|---|
| 1 | derived | **The accumulator adds no retention and the ADR will say so.** Fact 1 measured it; this checks whether the inference survives contact with the driver — in particular whether the *projection* can be computed at the moment `enter` needs it, rather than only after the run | W41 | a projection that needs state the log does not hold, which would make it new retention after all and put [Q19](../open-questions.md) back in scope |
| 2 | **reach** | **The KEY is what the ADR turns on, and a node-id key will be refused.** Fact 3 is a measurement of two corpus flows; this is a claim about what a decision must honour, and it is the reversible one — ADR 0036's key collapsed for a map and so does this one, **unless a map's instances turn out not to need naming at all** | W41 | an accumulator keyed by node id that is sound because a map instance never reaches one, which would make fact 3 true and irrelevant |
| 3 | **reach** | **W42 needs no ADR.** Fact 2 says Q8 is one field and one call site, and decision 1 says the mechanism is W41's — so Q8 should be a consequence rather than a decision. **ADR 0041 is reserved and expected SKIPPED** | W42 | a predicate needing something a worker does not — a shape, a key, or a guarantee — which would make Q8 its own decision and earn 0041 |
| 4 | derived | **[Q164](../open-questions.md) fires, and `RULE_ID` grows by exactly one prefix.** Its own row states the forcing condition and this plan meets it; what is derived is that the answer is a prefix rather than a relocation, because fact 6 says the ordinary edge has no region to move the rule to | W41 | a placement that needs no new prefix — most likely `spec/outcome-record.md`, which already owns what a `result` is |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q11](../open-questions.md) | what a node receives — **the plan's question**, in general rather than at the fan-out edge | **W41**, by ADR 0040 |
| [Q8](../open-questions.md) | what a decision sees | **W42** |
| [Q164](../open-questions.md) | no id prefix for a rule about what a run CARRIES | **W41**, forced |
| [Q166](../open-questions.md) | a map instance loses the context around its item | **W41**'s case; closed or explicitly not |
| [Q165](../open-questions.md) | `join -> map` over all results, and `over: "0"`'s coupling to branch numbering | **W41**'s second case |
| [Q19](../open-questions.md) | is retained state bounded — **premise corrected by fact 1, question untouched** | no owner |
| [Q22](../open-questions.md) | must a node result be structured-cloneable | no owner — named because ADR 0040 may add a third clone site |
| [Q160](../open-questions.md) | per-region run-time structures keyed by node id | no owner — **fact 3 is its third occurrence** and this plan will say whether it is one defect or a convention |

## A note on ids

**W40 is spent and unused** ([P11](p11-what-should-the-gate-prove.md) reserved it, ADR 0039 needed no
second item), so this plan starts at **W41**. **ADR 0038 is likewise spent and unused**
([W37](../work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)); 0039 is P11's; this plan starts at
**0040**. Q ids resume at **Q184**, with [Q168](../open-questions.md)-[Q169](../open-questions.md)
remaining a gap, which is free.

**The block is TEN rather than five, and that is a measurement rather than caution.** P11 reserved
Q176-Q180, spent all five before its second item raised a question, and extended the block twice —
once at W39's record step and once after its readers reported. Section 3 says *reserve generously*;
five has not been generous in either of the last two plans.

## The baseline this plan starts from

`876fbec`, clean tree, `GATE EXIT=0`, zero FAIL lines, 15 chain entries.

```
401 s wall, of which 371.1 is `selftests` (7/7 completed, 5 lanes)
574 test() CASES, 21 files, in node 24.20.0, deno 2.9.6 and chromium
638 assertions at L6, 0 failed, in node and deno
spec — 7 documents, 33 examples, 80 rules
markdown — 80 documents, 2978 relative links, 140 anchored
register — 140 questions, 97 open, 2 deferred, 41 resolved
```

**Three things about those numbers.** `npm run gate` runs `test:browser`, which is **chromium only**;
firefox and webkit need `test:browser:all`. **574 counts `test()` cases and 638 counts individual
assertions ([Q98](../open-questions.md)) — they are never added.** And the 401 s is one reading in a
range of 386-463 across nine runs ([Q179](../open-questions.md)); the reproducible half is
`selftests`, at 355.7-371.1 over seven.

## Record

*Filled in at the join, after the work items are merged.*

**W43 — done, and P12's EXIT ARTIFACT EXISTS.** *The two blocked flows on real workers.*
**Both ordinary flows this library could not express before this plan now run end to end on a real
`FyflowScheduler`, in BOTH L6 runtimes.** Ladder L6 is **760 assertions over 36 real runs**, from
638 / 31. [Q166](../open-questions.md)'s *score each item against the run's config* runs at
`needs: {"item": ".", "run": "ingest"}`, three instances scoring 4 / 8 / 12 from **both** declared
keys; [Q165](../open-questions.md)'s *score, then fan out over the scores* runs a second map over
`needs: {"scores": ["score"]}` with **no `over: "0"` anywhere**, so the brittleness that row names
is gone rather than worked around — two regions, and the second's arity comes from what the first's
branches returned. **No ADR, no `spec/` change, no new rule**: `spec/` is unmoved at 7 / 40 / 87 and
L1-L5 at 633, which is the declared result.

**What reverting each item costs, in L6 failures: W41 is 18, W42 is 2, and both are 20** — additive,
neither masking the other. **Before this item W42's was 0**, because neither flow the plan named
carries an edge-level `needs`: that is the item's third declared output and it was found at the
declaration step by reading its own plan row's last clause.

**Its declaration step found the two flows RUN and PROVE NOTHING**, which is the finding to carry.
Both corpus documents complete on real workers today, and `map-with-context`'s three instances each
returned `{confidence: 0, score: 0}` — every shipped worker role reads `payload.confidence`, which
under a `needs` is not there. **A row that cannot tell ADR 0040 rule 6 from its negation is not
evidence**, and it took a worker role that reads its declared keys. The same held for the decision
pair from the other side: on the corpus's own spelling both `ctx.outcome` and `ctx.needs` carry the
same number, so reverting W42 would have cost nothing.

**Obligation (e)'s SECOND QUESTION was instantiated on a PRODUCT item for the first time and it
FIRED** — a fourth instance in one plan of *a LIST BOUND TO NOTHING*, and the first outside
`scripts/**` and `src/`: `Role`, the worker's `switch` arms and the pool registry all said the same
thing and nothing compared them, and one letter in a pool's role kills the SCHEDULER's own message
handler before any assertion runs ([Q194](../open-questions.md)). Closed in one direction by a type;
**the other direction is still open and only the adequacy reader's measurement says so**
([Q196](../open-questions.md)).

Readers **11 / 3 blocking** and **28 mutations / 19 survivors / 4 blocking**, overlap **2**. Rule 8
**43 / 32 / 11 declared ceilings / 0 undeclared / 0 crash / 0 aborted**, with ten of the readers'
edits checked back in and all ten firing. **ONE late exception**, zero undeclared — the lowest of any
product item in three plans, and structurally so: an exit artifact owns one tree and writes no rule.
**Census CONFIRMED for the ELEVENTH plan running — 155 / 107 / 2 / 46**, and the parser, written from
scratch, aborted **zero** times on its first run. Q194-Q198 raised, none resolved.

**W42 — done.** *What a decision sees.* **[ADR 0041](../decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)
— and prediction 3 REVERSED.** A decision sees its node's effective outcome and whatever its **own
EDGE** declares: `FD-C3`, an edge-level `needs`, same grammar minus the `"."` form, resolved from
ADR 0040's projection with no new state. `spec/flow-definition.md` is **v0.12**; `spec/` is 7 / 40 /
87; L1-L5 is **633 cases in five runtimes**, L6 unmoved at 638. **[Q8](../open-questions.md) is
RESOLVED**, open since P1, and its own row's fork turns out to be the wrong shape.

**Prediction 3's reversal is the plan's sharpest result and its evidence was wrong twice over.** The
reversal condition — *a predicate needing something a worker does not* — is met on a **shape** (no
`"."`) and on a **site**, and the ADR's stated forcing fact for the site was **a diamond makes a
node's payload underivable**. Its conformity reader derived the diamond in one expression with no
append order at all. The conclusion survived on two facts nobody had written down: **the entry node's
payload is in no record at any moment**, and re-deriving any other node's re-implements `compose`,
`JP-R11` and `JP-R12` at a second site, which ADR 0040 rule 2 refuses by name.
[Q193](../open-questions.md).

Readers **16 / 10** and **45 mutations / 14 survivors / 9 blocking**, overlap **2**. Rule 8
**40 / 38 / 1 classified rewrite / 0 aborted**. **The gate was RED at L0 TWICE**, each time on one unused
binding with zero `FAIL` lines, the second stranded by a reader's own fix and caught by re-reading a
23-line log the Record had already called green. **TEN late exceptions**, zero undeclared, the count rewritten three
times and each rewrite before the next arrived; **[Q142](../open-questions.md) fired and BOTH
`check-markdown` floors moved for the first time** — `M3` to 74, `M4` to 2700. This item's own `Owns` block
predicted one of them by name and was wrong about what to call it. Q190-Q193 raised.

**W41 — done.** *What a node can reach, and what NAMES it.* **[ADR 0040](../decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)**: what a node can reach is the
run's own outputs, and a node id names them relative to a branch path. `spec/flow-definition.md`
v0.11 gains **`needs`**, **`FD-C1`**, **`FD-C2`**, **`FD-V26`-`FD-V28`** and **`FD-R3`**;
`spec/` is 7 / 38 / 86 and L1-L5 is 612 cases in five runtimes, with L6 unmoved at 638.
**Q11 is answered in general, Q164, Q166 and Q158 are resolved, and Q165's FLOW is expressible while
its reducer stays refused.** Prediction 1 **CONFIRMED and wrong about its own mechanism** (the
projection needed no new retention and did need a memo — one field); prediction 2 **CONFIRMED**;
prediction 4 **CONFIRMED**, `RULE_ID` grew by exactly one prefix. Readers **18 / 7** and
**98 mutations / 20 real survivors / 8 blocking**, overlap **1**. Rule 8 **54 / 51 / 2 / 0**. Five
late exceptions, zero undeclared. Q184-Q189 raised.

**Exit artifact.** *The two flows, on real workers, in both runtimes — and what reverting each item
costs in L6 failures.*

**What the plan answered.** *Q11 in general, and Q8.*

**Retro — RUN.** *`doc/workflow.md` section 6 pass 3, and `doc/workflow.md` is now
[v0.13](../workflow.md). Everything below is the retro; the item rows above are the items'.*

## The plan's question, answered

**What does a node receive?** Whatever it DECLARES, out of the run's own outputs, named by the pair
`(node id, branchPath)` — [ADR 0040](../decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md).
**What does a decision see?** Its node's effective outcome and whatever its OWN EDGE declares —
[ADR 0041](../decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md).

**The answer to the first half is that [Q11](../open-questions.md)'s row asked the wrong shape of
question.** It presents three candidates as a fork — the previous node's output, a run-scoped
accumulator, a declared per-edge mapping — and they are a **stack**: the previous node's output is
the DEFAULT, the accumulator is the STATE, and the declared mapping is the ACCESS. **Only the third
can reach a worker at all, because `createTask` takes ONE value.** A row open since P1, read by
every plan since, and the correction came from trying to build all three.

## The four predictions

| # | kind | prediction | verdict |
|---|---|---|---|
| 1 | derived | the accumulator adds no retention and the ADR will say so | **CONFIRMED.** ADR 0040 rule 2: what a node can reach is a PROJECTION of the log, computed and not maintained. The driver gained no field; `outputs()` groups the log in one pass and is memoised on `log.length` |
| 2 | **reach** | the KEY is what the ADR turns on, and a node-id key will be refused | **CONFIRMED, and right about its mechanism.** The pair `(node id, branchPath)`, decided from a measurement over **eight** region-bearing corpus flows — the ids collapse in exactly the map-bearing ones. [ADR 0036](../decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s deciding fact for the third time |
| 3 | **reach** | **W42 needs no ADR** | **REVERSED.** A predicate needs a **shape** a worker does not (no `"."`) and a **SITE**, because *what the node received* is not available where a decision is made |
| 4 | derived | [Q164](../open-questions.md) fires, and `RULE_ID` grows by exactly one prefix | **CONFIRMED.** `FD-C` is the third prefix — `FD-V` what a DOCUMENT may say, `FD-R` what a RUN refuses, `FD-C` what a run CARRIES |

**Prediction 3 is the result, and it reversed on evidence that was itself FALSE.** ADR 0041's stated
forcing fact was *a diamond makes a node's payload underivable, because choosing between two settled
predecessors needs append order.* W42's conformity reader derived it in one expression with no append
order at all — drop any settled predecessor another settled one is reachable **from**, and `FD-V19`
makes the survivor unique. **The conclusion survived on two facts nobody had written down**: the
**entry** node's payload is in **no record at any moment**, and re-deriving any other node's
re-implements `compose`, `JP-R11` and `JP-R12` at a second site, which ADR 0040 rule 2 refuses by
name. [Q193](../open-questions.md).

**Where that sits in the sequence this repository has been building.**
[P10](p10-is-fan-out-one-feature-or-two.md)'s retro settled that a **derived** prediction checks your
reasoning and a **reach** prediction checks the mechanism, and only the second can reverse.
[P11](p11-what-should-the-gate-prove.md) found two that were right about the conclusion and wrong
about the mechanism. **P12 adds the third case and it is the sharpest: a reach prediction that
reversed, and whose reversal was justified by a fact that was not true.** It would have stood as this
repository's account of why Q8 needed a decision at all, and **only a reader re-deriving the evidence
rather than reading it could have found that** — which is what pass 2 asks of the conformity reader
in one sentence and had never before been the thing that caught a DECISION.

**And prediction 4 confirmed with a defect inside the confirmation.** `RULE_ID` did grow by exactly
one prefix — and the constant it grew was itself bound to nothing, so dropping `FD-C` cost **zero**.
*A derived prediction can be confirmed by a mechanism that does not work.*

## Name the rung: ONE of seven, and it is the same verdict P11 reached

| defect | rung |
|---|---|
| `FD-V28` refused a valid document (a `fanout` region read as a map region) | **L1 — and the fixture did not exist.** All 37 of the author's probes used a map region, so the whole `fanout` half was unreachable from the set. *A probe set written against the cases a feature was built for cannot see a rule that is wrong about the cases it was not* |
| ADR 0041's forcing fact was false | **none, and none could be.** Nothing in sections 4-6 covers a decision's ARGUMENT |
| `RULE_PREFIXES`, `EDGE_KEYS`, the role lists — bound to nothing | **none.** Each is a declaration agreeing with another declaration, and the gate compares neither |
| both of W43's discriminating pairs collapsed for 0 | **none.** L6 was green and stayed green |
| `map-with-context` scored every instance 0 — the exit artifact proving nothing | **none.** It ran, it completed, and every assertion passed |
| two revert costs measured before the tree they describe | **none.** A Record number |
| the gate RED at L0 twice with zero `FAIL` lines | **L0, and it RAN** — the one that worked, and only because the exit code is the predicate |

**Six of seven have no rung, and every one of the six is in the EVIDENCE rather than in the
product.** That is [P11](p11-what-should-the-gate-prove.md)'s finding for a second plan running, and
this one is a PRODUCT plan where P11's was about the gate — so the reading generalises: **L0-L6 climb
over what the library does, and nothing climbs over whether the thing that says so could have said
otherwise.** A level for it is proposed and refused below, for the second time.

## `doc/workflow.md` v0.13 — three changes adopted, four proposals refused

**Adopted.** (1) **Obligation (e) gains a THIRD SHAPE — a LIST is a claim about another list** —
four instances in three items, and the procedure is *find the other list and compare both ways*.
(2) **Obligation (c)'s procedure gains its LIMIT** — when the compound probe is green, count the
observers; at one, the fix is a second independent expression, not a better probe. (3) **A fourth
requirement on the SET: whatever makes a discriminating PAIR differ is itself a claim.** The full
text and the evidence for each is in [`doc/workflow.md`](../workflow.md).

**Refused, each with a measurement.** A **ladder level for L6's own self-test**
([Q198](../open-questions.md)) — the cost is ~20 s a run against a check's ~1 s, so a self-test over
W43's 43 mutations is the whole of what ADR 0039 bought back; **second time a level has been proposed
and refused.** An **`Owns` pre-declaration rule** for the three documents a `spec/`-rule item always
reaches — refused because **twenty-two late exceptions across three items were declared and ZERO were
undeclared**, so the mechanism works; [Q157](../open-questions.md) and [Q102](../open-questions.md)
stay open and **the next product plan should adopt it if the pattern repeats**. An **obligation for
the evidence behind a DECISION's stated reason** — nothing could reach it and the two-reader pass is
what caught it. And a **`doc/` check, for the TENTH time.**

## The verdict v0.12 asked for: obligation (e)'s second question on a PRODUCT item

**v0.12 earned it entirely on `scripts/**` — five consecutive items, all checks over the gate's own
wiring — and stated that scope in place. P12 is the first plan to instantiate it on a product item,
and it FIRED, four times.** The instances are `RULE_PREFIXES` and an `accepted` list (W41),
`EDGE_KEYS` (W42), and the `Role`/`switch`/pool triple (W43). **Two are `scripts/**`, one is
`src/` and one is `examples/**`**, which is the first evidence that the shape is not a property of
check-writing.

**Three things the retro carries beyond *it works*.**

1. **The shape is neither of v0.12's two procedures**, and W41 said so on one item with an argument
   before W42 and W43 supplied the occurrences. v0.12's procedures ask about a **command**; this asks
   about a **declaration**, and the question that reaches it is *what does this list have to agree
   with, and what would say so?*
2. **The ANSWER is not portable even though the question is.** W43's was a TYPE — `Role` is
   `typeof ROLES[number]` and the pool constructor takes one, so an invented role fails **typecheck
   at L0**, earlier and cheaper than any assertion and unavailable to a `.mjs` check. **And a type
   closes one direction only**: a member added to the list with no use costs zero
   ([Q196](../open-questions.md)), where the three `scripts/**` and `src/` instances were closed by
   **set equality both ways**. *The question generalises; the answer does not.*
3. **The author reaches none of them.** Across the three items the authors instantiated (e) as
   written nine times and **all nine passed**; every one of the four was found by a reader or by
   asking the declaration question deliberately. **W39's asymmetry for the third plan running** — the
   author breaks the CHECK's wiring, the reader breaks the SUBJECT's.

## Reader passes

**Six passes, none empty, overlap 1, 2 and 2** — the twentieth, twenty-first and twenty-second
measurements, all inside the settled 0-4 band, **all six readers unprimed**. **W41's 1 of 116 is the
largest denominator ever recorded here and it did not move the numerator**, which is the clearest
single datum against reading the fraction.

**And all three items got the ORDINAL wrong, by two, each inheriting it from the one before.** W41
wrote *eighteenth*, which is W36's; W42 and W43 incremented from it. The list is in
`doc/workflow.md` section 6 and counting it is the whole derivation. **Corrected in all three files
under section 6 pass 3 rule 6** — the rule P11's retro added for exactly this, and its second use.
*Section 1 rule 5's provenance clause, on a number nothing had to derive.*

**The split is what the two roles predict, three times out of three.** The conformity readers found
**claims that were false**: a rule refusing a valid document, an ADR's own forcing fact, a table the
code had outgrown, two revert costs, four counts in a README, a rule citation, a `flowId`
convention. The adequacy readers found **bounds that were not there**: 20 real survivors of 98, 14 of
45, 19 of 28 — and **W43's four blocking findings are three of one shape**, *a discriminating pair
whose difference is carried by literals nothing compares*, which is v0.13's third change.

## Rule 8 across the plan

| | probes | caught | survivors | aborted |
|---|---|---|---|---|
| W41 | 54 | 51 | 2, both classified vacuous | 0 |
| W42 | 40 | 38 | 1, classified a REWRITE on [Q112](../open-questions.md)'s reasoning | 0 |
| W43 | 43 | 32 | 11, **all declared ceilings** | 0 |

**137 provocations, 121 caught, ZERO undeclared survivors and ZERO aborts across three items.** The
set is doing its work — and **the three defects that mattered most in this plan were found by
readers, not by it**, which is why v0.13's three changes are all about what the set does not ask.

**W41's harness produced three defects invisible in its own verdict**, which is v0.11's harness
requirement earning its place a fourth time: `String.replace`'s `$` vocabulary truncated a
replacement so a **crash read as a SURVIVOR** ([Q184](../open-questions.md), which then reproduced in
the script inserting its own register row), a `green` predicate accepted `all passed` from a
**sibling** child, and a probe was graded against a check whose clause only the self-test binds.
**And W41's own driver work was destroyed by `git checkout` on a dirty tree** — W35's defect, by
hand, outside the harness whose header forbids invoking git.

## What the plan answered, and what it did not

**Answered.** [Q11](../open-questions.md) in general, [Q8](../open-questions.md) (open since P1),
[Q164](../open-questions.md), [Q166](../open-questions.md), [Q165](../open-questions.md)'s FLOW and
[Q158](../open-questions.md) — the last after three plans in which its own row named a fix in files
nobody owned. **[Q160](../open-questions.md) gets the verdict the plan promised it: keying a
per-region structure by node id alone is a DEFECT and not a convention**, and ADR 0040 is the
**third** mechanism in three plans to reach for the pair `(node id, branchPath)` after `branchOf`
and the driver's run-time maps. The row stays open because its own subject — the driver's four
run-time structures — is refused at construction rather than fixed.

**Not answered, and named.** [Q165](../open-questions.md)'s **reducer** is not built and stays
unowned; the flow that forced it now runs without one. [Q19](../open-questions.md)'s real question —
whether retention is BOUNDED — is untouched, and ADR 0040 makes it sharper rather than softer, since
a projection over the whole log is exactly what a bound would have to bite on.
[Q22](../open-questions.md) gains its **third clone site**: `resolveReference` copies per key, which
the plan predicted it might and which is now measured rather than hypothetical.

## Ids

**W41, W42 and W43 all used. W44 is CLOSED as reserved and never issued** — the
third consecutive plan to reserve a trailing item and not need it, which is section 3's *reserve
generously* working rather than failing. **ADR 0040 and 0041 both taken**, which P12 predicted and
P9 and P11 did not manage. **Q184-Q198 all used — fifteen, and the block was extended once**, at
W43's declaration, because ten was not generous either: W41 spent six and W42 four, so the block was
empty before the plan's last item started. **Third consecutive plan to extend.**

**The next plan starts at W45, Q199 and ADR 0042.**

## Census — CONFIRMED for the ELEVENTH plan running

**155 questions — 107 open, 2 deferred, 46 resolved**, 41 ids in both tables, and both halves at
**155 of 155 in exactly one cluster cell**. The retro raises no question and resolves none.

**W43's parser was written FROM SCRATCH from the register's own note and aborted ZERO times on its
first run** — the second time that has happened, after P11's retro, and **the first on a product
item**. It then aborted **five** times, correctly, on that item's own new ids sitting in no cluster
cell, which is [W34](../work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s instance
for the **fourth consecutive item**. *Four items running, the only thing an aborting census has
caught is the item running it — which is either the mechanism working or the mechanism having
nothing left to find, and the two are not distinguishable from here.*

## What this plan taught, in one paragraph

**Every one of P12's three items shipped a claim its own evidence could not falsify, and in each case
the author had followed this document's procedure for exactly that.** W41's 37 probes all used a map
region, so a rule wrong about `fanout` regions was unreachable from the set. W42 wrote an ADR whose
forcing fact was false and whose conclusion was right. W43 built an exit artifact in which every map
instance scored zero, ran it end to end on real workers, and would have shipped it as evidence for a
rule it could not distinguish from its negation — then measured both revert costs before its own last
two edits. **None of the three is carelessness and none has a rung.** What they have in common is
that the thing under test was fine and the thing doing the testing agreed with itself: a probe set
agreeing with the cases the feature was built for, a decision agreeing with its own argument, a
fixture pair agreeing about the variable that made it a pair. **v0.13's three changes are all one
question asked in three places — *what would this have to disagree with, and does anything ask?* —
and the reason it takes three changes rather than one is that the answer is different every time:
another list, another expression, another fixture.**


