# P14 — What does a reference mean when two regions' arities are independent?

**Status:** COMPLETE AND RETRO'D — W49, W50 and W51 all done, `doc/workflow.md` is [v0.15](../workflow.md).
**Baseline:** `5372147` — `doc/workflow.md` [v0.14](../workflow.md), P1-P13 complete and retro'd, tree
clean, `npm run gate` `GATE EXIT=0` with zero `FAIL` lines.

**The question in one sentence.** `spec/flow-definition.md` section 3 says a node produces more than
one output for a reader **exactly when** the reader is outside a `map` region containing it — and for
two **sibling** map regions that sentence is false in a way an author cannot work around: the array
that arrives holds **at most one** entry, chosen by numeric coincidence of two indices minted in
unrelated namespaces.

## Why this plan, and why now

**[Q206](../open-questions.md) is the only open row that says the library cannot express something an
author would ordinarily want**, which is the position [Q12](../open-questions.md) held before P10 and
[Q11](../open-questions.md)/[Q187](../open-questions.md) held before P12 and P13. It was found by
[W45](../work-items/w45-what-a-reference-must-be-able-to-say.md)'s conformity reader, recorded in
`spec/flow-definition.md` section 3 **with its measurement**, and left unowned for one stated reason:
**the fix is either a fourth refusal or a change to the visibility predicate, and that predicate is
[ADR 0040](../decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)'s
KEY, which P13 decision 1 forbade its own items from reopening.** A plan is where that decision
belongs.

**It is the third product plan in a row** — the first run of three since P1-P2-P3, and the reason is
that each of the last two left its successor a defect its own scope forbade it from fixing. P12 left
two ways to write a reference that does not work; P13 fixed one of them (`FD-V29` and the `?`
modifier) and its reader found the other in the same item.

## What was measured before this plan was declared

**Six facts, and THREE of them correct or sharpen the row this plan is built on** — the fifteenth time
a plan has found one wrong by trying to act on it. The harness is `dev-dist/p14/facts.ts`, an L2
probe over both corpora; every number below is from it, and **the probe was wrong twice before it was
right** (a flat listener array that invoked both terminal handlers per settlement, and
`allRegions`' return read as a `Map` where it is an array), both of which it reported as crashes
rather than as results.

**1. Q206's own measurement reproduces exactly, at all three arity pairs.** On
`spec/examples/valid/reference-past-a-map-arity.flow.json`, where `publish` inside `rank` declares
`needs: {"scored": ["score"]}` and `score` is inside the sibling region `split`:

| items | slots | what each `publish` instance receives |
|---|---|---|
| 3 | 1 | `publish@0` → `[{from: score#0}]` — **one of three**, and the other two outputs are reachable from nowhere |
| 2 | 2 | `publish@0` → `[score#0]`, `publish@1` → `[score#1]` — **each its index-matched one** |
| 2 | 3 | `publish@0`, `publish@1` as above; **`publish@2` stops the run** with `UnresolvedReference` (`FD-R3`) |

**2. The shape is in FOUR corpus flows, not one — and one of them is P12's own exit artifact.**
Q206's row cites one document. Measured over both corpora — **22 region-bearing flows of 30** — a
sibling pair (two regions, neither containing the other) occurs in
`map-over-region-output.flow.json` (in **both** corpora), `reference-past-a-map-arity.flow.json`, and
`map-past-a-decision.flow.json`, which is [W47](../work-items/w47-the-blocked-flow-on-real-workers.md)'s
and is three commits old. **Every one of the four is `map`/`map`; no `fanout` pair occurs anywhere.**

**3. And the defect is ARITY-DEPENDENT, which is why `map-over-region-output` works and is
celebrated.** That flow is the one [Q165](../open-questions.md) was closed by and the one P12's Record
holds up for removing the coupling to branch numbering — and it carries the same sibling reference.
It works because **`rank`'s `over` is the resolved `["score"]` itself**, so the two arities are equal
*by construction* and the index-matched entry is exactly the one that instance wants. **So the
question is not *is the predicate wrong*.** It is: **what does a reference mean when the two regions'
arities are INDEPENDENT?** — and the answer *the index-matched one* is right for one flow and
arbitrary for the others. *A coupling removed by making two numbers equal is not a coupling removed.*

**4. There is NO spelling that reaches all of `score`'s outputs, and the natural one is refused by a
DIFFERENT RULE.** All eight spellings the grammar admits, measured on the shipped document at
`items: 3, slots: 3`:

| written | result |
|---|---|
| `"score"` / `"score?"` | **refused, `FD-V28`** — the form must be the array one |
| `["score"]` / `["score?"]` | accepted; `publish@0` receives **one** entry |
| `"."` | accepted; receives `rank`'s own item, `"x"` — correct and not an answer |
| `"collect"` / `["collect"]` | **refused, `FD-V27`** — and this is the fact nobody had written down: `collect` is the JOIN, and `FD-V27` requires a reference's target to be a **task**, so **a region's collection is unreachable by any reference at all** |
| `"regroup"` | accepted; receives the reshaping node's output |

**So Q206's *there is no form an author can write* is CONFIRMED, and the workaround is a reshaping
`task` node — which is the workaround ADR 0040 exists to remove**, named in that decision and in
Q165's row. The plan's case is one line: *the feature that removed a reshaping node for one flow
requires one for its sibling.*

**5. A sibling FANOUT pair behaves the OPPOSITE way, and `FD-V28`'s answer for it is right.**
Constructed, since the corpus has none: two `fanout` regions in sequence, a reference from inside the
second to a branch of the first. `{"scored": ["sA1"]}` is **refused by `FD-V28`**; `{"scored":
"sA1"}` is **ACCEPTED** and resolves to the one output there is. That is correct — a `fanout` branch
produces exactly one output — and it means **the fix must not disturb the `fanout` half**, which is
[W41](../work-items/w41-what-a-node-can-reach-and-what-names-it.md)'s conformity-reader finding one
rule along: *`FD-V28` asked a question that is true of a `fanout` too*, and the repair for the map
case is the one that could reintroduce it.

**6. The change surface is ONE expression in code and twenty citations in prose.** `isPathPrefix` is
declared once in `src/driver/driver.ts` and called from **two** sites; `spec/flow-definition.md`
mentions *prefix* **16** times, `FD-C1` **8** and `FD-V28` **20**. And the mechanism is sharper than
Q206's row states it: the visible set is *path-EQUAL or ancestor/descendant*, and **for siblings only
the equality case ever fires** — `isPathPrefix('0','2')` and `isPathPrefix('2','0')` are both false,
so `publish@0` sees `score@0` **because the strings match**, not because of any relationship. *Two
unrelated regions mint indices into one namespace, and equality is the prefix relation's reflexive
case.*

## Scope

**In**

1. **[Q206](../open-questions.md)** — what a reference means when its target is in a sibling region,
   decided as **ADR 0044**. Three candidates, none preferred here:
   - **(a) a fourth refusal.** A new `FD-V` refuses a reference whose target is in a region the reader
     is in a *sibling* of. Cheap, safe, keeps the KEY, and makes the reshaping node explicit rather
     than a surprise — but it refuses `map-over-region-output`, which works today and is a corpus
     flow, so it needs a way to admit the equal-arity case or it is a regression.
   - **(b) change the visibility predicate.** Make a sibling region's outputs *all* visible, so
     `["score"]` means what section 3 says it means. This is ADR 0040's KEY and it is what P13
     decision 1 refused to let an item touch; it also changes what `map-over-region-output`'s three
     instances receive, which is a live L6 row.
   - **(c) make a region's COLLECTION referenceable.** Relax `FD-V27` so a `join` is a legal target,
     which is the answer an author reaches for and fact 4 says is refused by a different rule than
     the one they would read. It adds a fourth thing a reference can name and it interacts with
     `JP-R12`.
2. **What the run CARRIES and what it refuses**, wherever (1) lands — an `FD-C` rule, an `FD-R`
   refusal, or a measured statement that neither moved.
3. **The exit artifact**: the sibling-region flow on real workers in **both** L6 runtimes, at
   INDEPENDENT arities, with what reverting the decision costs measured in L6 failures.

**Out** — named rather than left implicit, with where each goes instead

- **[Q19](../open-questions.md) and [Q22](../open-questions.md)** — bounded retention, and whether a
  result must be structured-cloneable. They are the next plan's subject and they have three measured
  inputs waiting; taking them here would make this two plans.
- **[Q186](../open-questions.md)'s threshold.** W46 decided *nothing warns* and left *how large is too
  large* open deliberately. Unchanged by this plan.
- **[Q216](../open-questions.md) and [Q217](../open-questions.md)** — the retro's own two, about
  observers and about membership lists. Both are process questions and P13's retro adopted their
  clauses; this plan RUNS those clauses rather than judging them.
- **[Q214](../open-questions.md)** — a rule whose whole effect is that a run never happens. Recorded
  by W47; a second instance is what would force anything, and this plan may supply one, which is
  prediction 4.
- **The gate** ([Q181](../open-questions.md)-[Q183](../open-questions.md)) and
  [Q165](../open-questions.md)'s reducer.

## Decisions taken before fan-out

1. **The KEY is reopenable by this plan and by no item on its own.** ADR 0040's `(node id,
   branchPath)` pair is the thing candidate (b) changes, and P13 decision 1's refusal was about an
   ITEM's authority, not about the question. **W49 may take (b); it may not take it silently** — the
   ADR names the pair by id and says what moves.
2. **Whatever is decided, `map-over-region-output` keeps working and its L6 row keeps its numbers.**
   It is a corpus flow, [Q165](../open-questions.md)'s answer and a live L6 row scoring 4/8/12 from
   both declared keys. **A candidate that changes what its three instances receive is refused on that
   ground alone**, and the measurement is fact 3: the two arities there are equal by construction.
3. **The evidence must include a sibling `fanout` pair.** Fact 5 says the two kinds behave oppositely
   and the corpus contains no fanout pair at all, so a probe set drawn from the corpus **cannot see a
   rule that is wrong about the case the corpus does not have** — W41's finding by name.
4. **No new node kind.** The shape is expressible; what is missing is a meaning for a reference across
   it. If the evidence forces a sixth kind, stop and ask.

## Work items

| id | | owns |
|---|---|---|
| **W49** | *What a reference across sibling regions means.* [Q206](../open-questions.md), decided as **ADR 0044** from facts 1-5, with decision 2 as a hard constraint and decision 3 as the evidence clause. Writes the `spec/` rule and the definition half. | `src/definition/**`, `spec/flow-definition.md`, `spec/examples/**`, `test/definition/**`, `doc/decisions/0044-*.md` |
| **W50** | *What the run carries at independent arities.* The driver half and ladder L2 — what a reader receives, and what refuses when it cannot. **May be small or empty depending on W49's answer, and the plan says so rather than reserving work for it**: candidate (a) is a validator rule and moves no driver code. | `src/driver/**`, `test/driver/**`, `spec/flow-definition.md` |
| **W51** | *The sibling-region flow on real workers.* The exit artifact, in **both** L6 runtimes, at INDEPENDENT arities, with what reverting W49 costs in L6 failures. | `examples/**` |
| **W52** | **reserved and expected unused**, on P9's, P11's, P12's and P13's precedent. A reserved id that is not spent is still not free. | — |

**Serial, and the reason is section 7 rule 2**: W49 and W50 would both edit
`spec/flow-definition.md` section 3, W50's subject is decided by W49's answer, and W51 depends on
both.

**No item pre-declares `AGENTS.md`, `spec/README.md` or `scripts/check-docs.mjs`.** P13's retro
refused a pre-declaration rule with the measurement — over three items the three files were taken
yes/yes/no, yes/yes/yes and no/yes/no — and recorded the narrower reading that *an item that changes
what a reference may say will reach `spec/README.md`*. **This plan is the second data point for that
reading**, and it is a reading rather than a rule, so nothing is declared in advance.

## Predictions, written down before the items that test them

**Two derived and two reach — and each states the SCOPE of the measurement it rests on**, which is
v0.14's correction to P10's distinction: P13's prediction 1 was derived and reversed, because the
measurement it rested on answered a narrower question than its own wording.

| # | kind | prediction | rests on | scope of that measurement | what would reverse it |
|---|---|---|---|---|---|
| 1 | derived | **Candidate (a), a fourth refusal, cannot be written without an arity clause** — because it must refuse `reference-past-a-map-arity` and admit `map-over-region-output`, and the two differ only in whether `over` names the reference's own key | W49 | fact 3, measured on **the four sibling-region flows the two corpora contain** and on no constructed one | a static predicate that separates them without mentioning arity — most likely *the reader's `over` names this very key*, which is decidable from the document |
| 2 | **reach** | **The answer is (c), making a region's COLLECTION referenceable, and not (a) or (b)** — because fact 4 says the author's natural spelling is already refused by `FD-V27` rather than by the rule they would read, and a collection is the only thing that is *all* of a region's outputs regardless of arity | W49 | fact 4, measured over **the eight spellings the grammar admits**, on one document at one arity pair; it says nothing about what a fourth target class costs | `JP-R12`'s collection being unavailable at the moment a reference resolves, or a join target making `FD-V27`'s reachability question undecidable |
| 3 | derived | **W50 is SMALL: no driver code moves.** Facts 4 and 6 say the visible set is computed at one expression with two call sites, and candidates (a) and (c) are both about what a document may SAY | W50 | fact 6, measured by **counting declarations and call sites in `src/driver/driver.ts`**; it does not measure what a new target class would need at resolution time | candidate (b) winning, or (c) needing the collection at a moment the driver does not have it |
| 4 | **reach** | **This plan supplies [Q214](../open-questions.md)'s second instance** — a rule whose whole effect is that a run never happens, invisible to L6 — because every candidate refuses at instantiation and W47 measured that a refused document does not start | W51 | W47's measurement, scoped to **ladder L6 and to `FD-V29`**; it is one occurrence and Q214's row says a second is what would force a rule | the decision landing as a run-time refusal (`FD-R`) rather than a validator rule, which L6 CAN see |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q206](../open-questions.md) | `FD-V28` asks a region question and resolution applies a path filter — **the plan's question** | **W49**, by ADR 0044 |
| [Q27](../open-questions.md) | what a region's arity is a property of | read by W49; not owned |
| [Q165](../open-questions.md) | the coupling to branch numbering, which fact 3 says was removed by making two numbers equal | read by W49; **not reopened** |
| [Q214](../open-questions.md) | a refusal invisible to a rung made of runs | **W51**, as prediction 4 |
| [Q216](../open-questions.md), [Q217](../open-questions.md) | the retro's two; this plan RUNS their clauses and does not judge them | every item |

## A note on ids

**Reserves W49-W52, Q218-Q232, ADR 0044-0045.** Fifteen questions, on P13's precedent: it reserved
fifteen and **still extended twice**, and P12 reserved ten and extended once. **ADR 0045 is expected
skipped** — one decision is the plan's subject and a second would mean W50 grew a decision of its
own, which prediction 3 says it will not.

**W48 is spent and not reused** (P13 reserved it and never issued it), and neither is ADR 0043. The
next plan after this one starts at **W53** and at whatever id this plan's block reaches.

## Stop and ask a human

- **ADR 0044's answer not discriminated by any measurement this plan can take.** Take it if it is.
- **Candidate (b) winning**, because it moves ADR 0040's KEY and therefore what every existing
  reference means — that is a change to a decision two plans rest on, and the maintainer should price
  it before it is written.
- **A candidate that changes what `map-over-region-output`'s three instances receive** — decision 2
  refuses it, and overriding a plan decision is not an item's call.
- **The evidence forcing a sixth node kind** — decision 4 forbids it.
- **Amending the declared scope or an item's `Owns` in a way that changes what the plan costs**, on
  W38's precedent: put it to the maintainer with alternatives and numbers.
- **Deleting or weakening an existing `spec/` rule or check clause** rather than adding one.
  Candidate (c) *relaxes* `FD-V27`, which is exactly this shape — so if (c) wins, the relaxation is
  the thing to put up rather than to write.
- **Editing `doc/workflow.md`** — that is the retro's, and the retro is not the plan.
- **Pushing.** Commit freely; ask before anything leaves the machine.

## Record

*Filled in at the join, after the work items are merged. One row per item as it lands.*

**W49 is DONE and [ADR 0044](../decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md) answers [Q206](../open-questions.md).** An output is visible to a
reader when their two branch paths **agree on the regions their two CHAINS share**, and *one path is
a prefix of the other* is that rule's special case — candidate **(b)**, put to the maintainer with
both candidates priced, as this plan's stop-and-ask list requires. `spec/flow-definition.md` is
**v0.15**; `spec/` is unmoved at **7 documents, 43 examples, 89 rules** because no rule id is added or
retired; L1-L5 is **25 files / 674 cases in five runtimes**; **L6 is unmoved at 879 / 40**.

**THREE of this plan's four predictions are already reversed, and one reversed because a FACT it
rests on was wrong.**

| # | verdict | |
|---|---|---|
| 1 | **REVERSED** | *Candidate (a) cannot be written without an arity clause.* Its own stated reversal condition — *a static predicate that separates them without mentioning arity* — is met, and by a different predicate than the one it guessed: not *the reader's `over` names this very key* but **the reader's REGION CHAIN**. The two flows do not differ in arity at all, which is fact 3 |
| 2 | **REVERSED** | *The answer is (c), making a region's COLLECTION referenceable.* It is (b). The premise stands — the author's natural spelling really is refused by `FD-V27` rather than by the rule they would read — and it does not follow, because the missing spelling is a second, ADDITIVE gap rather than the cause of this one. [Q219](../open-questions.md) |
| 3 | **REVERSED** | *W50 is SMALL: no driver code moves.* Its stated reversal condition is *candidate (b) winning*, which it names. The driver is exactly where this lands |
| 4 | W51's | untouched |

**Fact 3 was WRONG about its mechanism, and it is the sixteenth time a plan has found one of its own
inputs wrong by trying to act on it.** It says `map-over-region-output` works because *"the two
arities are equal by construction"*; measured, that flow declares its reference on **`rank`, the map
NODE**, at branch path `-` and in **no region**, so it receives all N before any instance exists.
**The two flows differ in where the reference is DECLARED.** Prediction 1 inherited that error, which
is v0.14's own correction to P10's distinction reaching a second instance: *a derived prediction is
reversible exactly when the measurement it rests on is narrower — or wrong — in a way its own wording
hides.*

**And the plan's framing was corrected in the same direction: the defect is not about a `map` and not
about arity.** Every sibling pair in both corpora is `map`/`map`, so nothing had seen the `fanout`
half — where a reference from branch **1** of a second region to branch **0** of the first validates
with **zero findings** and **stops the run**, with no arity anywhere in it. **Decision 3 required that
evidence and is why the half was covered**; the DEPTH half — two sibling regions nested inside one
outer branch — was named by nobody and was found by W49's adequacy reader.

**W50 confirms prediction 3's REVERSAL with a number: the driver is where this landed.** The resolver
is one expression, `isPathPrefix` is gone, and **six L1-L5 fixtures had to move** because ADR 0044
removed the road they reached `FD-R3` and `FD-C4` by. *This plan predicted `W50` would be small and
that no driver code would move; it is the largest of the three items so far.*

**And L6 is BLIND to the decision, which is the thing to carry into W51.** All **11** aimed references
in both corpora have a shared region depth of **zero** — every reader sits at `-` or reads a target at
`-` — so `outputIsVisible` returns `true` without entering its loop for every reference L6 runs, and
reverting the resolver costs **0 L6 failures** against 6 at L1-L5. **[Q214](../open-questions.md)'s
shape in a second mechanism**, and prediction 4's subject arriving one item early: W47's was *a
document the validator refuses never starts*; this is *a filter no run exercises*. **W51's exit
artifact must add a flow whose shared depth is above zero, or a sibling pair**, or the plan's exit
rung proves nothing about the plan's subject.

**PREDICTION 4 IS CONFIRMED, and it is the one this plan could not have derived.** *This plan supplies
[Q214](../open-questions.md)'s second instance — a rule whose whole effect is that a run never
happens, invisible to L6.* It does, in a **different mechanism** from W47's: that was *a document the
validator refuses never starts*; this is **a filter no run exercises**. W50 measured ladder L6 blind
to ADR 0044 for a whole item — all eleven aimed references in both corpora at a shared region depth
of ZERO, so reverting the resolver cost 6 at L1-L5 and **0 at L6** — and W51 moved it to **12**, with
the opposite direction moving from 0 to **2**. Its stated reversal condition (*the decision landing as
a run-time refusal, which L6 CAN see*) did not occur: ADR 0044 is a rule about what a run CARRIES.

**So all four predictions have a verdict: 1, 2 and 3 REVERSED and 4 CONFIRMED** — the highest
reversal rate of any plan, and the cause of three of them is one thing: **fact 3's mechanism was
wrong**, and prediction 1 was derived from it.

| item | | |
|---|---|---|
| **W49** | **done** | [ADR 0044](../decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md); `spec/flow-definition.md` v0.15; `regionChainOf`/`sharedRegionDepth`/`outputIsVisible`; L1 674 in five runtimes; readers 15/6 and 52/8/4; rule 8 **27 probes, 26 caught, 0 survivors, 1 measured ceiling, 0 aborts**; overlap **2**, the 26th measurement; census **178 / 128 / 2 / 48**; **Q218-Q221** raised, **Q206** resolved |
| **W50** | **done** | the resolver applies ADR 0044 at both sites by one expression and **`isPathPrefix` is DELETED**; the six `FD-R3`/`FD-C4` fixtures moved onto roads that still exist; `sibling-fanouts.flow.json` promoted to the corpus; L1-L5 **681 in five runtimes**, L6 unmoved at **879 / 40**; reverting the resolver costs **6 L1-L5 and 0 L6**; readers 16/5 blocking and 36 mutations / 4 survivors / 5 blocking, overlap **2**, the 27th measurement; rule 8 **24 probes, 20 caught, 0 survivors, 4 measured ceilings, 0 aborts**; census **179 / 129 / 2 / 48**; **Q222** raised, **ADR 0045 SKIPPED** |
| **W51** | **done** | **P14's EXIT ARTIFACT** — a reader inside one region receiving EVERY output of a sibling region, at independent arities, on real workers in both L6 runtimes. Two flows: `sibling-fanouts` (two sequential `fanout` regions — a run that used to STOP) and `sibling-map-fanout` (a `map` of three beside a `fanout` of two, plus a WITHIN-region reference). **L6 942 / 42** from 879 / 40; L1-L5 unmoved at 681. **Reverting the resolver costs 12 L6 failures and every entry made visible costs 2, where BOTH were zero.** Readers 7/2 blocking and 10 mutations / 4 survivors / 4 blocking, overlap **1**, the 28th measurement; rule 8 **20 probes, 19 caught, 1 measured ceiling, 0 survivors, 0 aborts**; census unmoved at **179 / 129 / 2 / 48**; **no question raised, Q223-Q228 skipped, no ADR** |

## Retro

**P14'S RETRO IS RUN AND `doc/workflow.md` IS [v0.15](../workflow.md) — THREE changes adopted, FIVE
refused, and its central finding is that v0.14's OWN counter-measure was followed and did not work.**
v0.14 adopted *the prediction table states the SCOPE of the measurement it rests on* as the answer to
P13's derived reversal. **P14 is the first plan to carry that column**; prediction 1's scope cell
reads *fact 3, measured on the four sibling-region flows the two corpora contain and on no constructed
one*, which is **correct**, and prediction 1 reversed anyway — because **the fact underneath was FALSE
rather than narrow.** Section 6 pass 3 rule 3's sharpest kind, on a clause three commits old. **So
P13's correction to P10's sentence gains a SECOND failure mode rather than a replacement: a derived
prediction reverses when the measurement it rests on is narrower than its own wording, OR when it is
wrong.** What caught it is an ITEM re-running the fact it was handed — W49's `Inputs:` line — which is
section 1 rule 5's provenance clause reaching a PLAN's declaration for the first time. **Sixteenth
time a plan has found one of its own inputs wrong by trying to act on it.**

**THE THREE CHANGES.** **(1) Section 4 gains: a rung reported GREEN means its command EXITED 0 — a
line of its output is never the predicate.** Three occurrences, two plans, every one `GATE EXIT=1`
with **zero lines beginning `FAIL`**: W42 twice, and W50, whose author read `npm run lint | tail -1`
and saw `Checked 49 files`, which `deno lint` prints either way. **It replaces an apparent
CONTRADICTION rather than a rule** — rule 8 says *read the failure LINES, not the exit code*, and that
is right in the other direction: to call a rung green the exit code is NECESSARY, to call a
provocation caught it is NOT SUFFICIENT. **The sentence existed in `CLAUDE.md` since v0.12 and W50
reproduced it anyway**, in a third secondary signal nobody had named. **(2) Section 6 gains: a
whole-tree measurement is taken with the tree HELD STILL.** Two items, two observers — W51's
conformity reader caught `examples/l6.ts` at **six digests** and a **live rule-8 probe** in
`src/driver/driver.ts`, one snapshot RED on correct code; and W50's first gate ran in the background
while W51's edits landed, so its verdict was about a tree that no longer existed. Section 6 records
this contamination from the READER's side and fixed that half in v0.6; **the author's half was never
stated and is the likelier one**, because rule 8's set mutates the shared tree by construction. **And
this retro broke the rule it was adopting, within the hour** — it started its confirming gate in the
background and went on editing two index files while it ran, stopped it unfinished and re-ran it
against the final tree. *Third occurrence, and the one that says the rule is worth having.*
**(3) Section 1 rule 5's third direction gains a procedure: an item greps the tree for its OWN ID.**
Measured outside `doc/`: `W33` at W32's commit returns **19** hits in eight files, `W34` at W33's
returns **10**, `W50` at W49's returns **12**, and `W42` and `W51` return **0** — zero false positives
in the three that fire and silence in the two that do not. Two occurrences, two plans, both blocking
and both found by a conformity reader.

**REFUSED, five, each with a measurement.** A **`doc/` check for the TWELFTH time** — and P14 gives
the best instance yet, W49's three false claims about which rule moved, one of them
**self-contradictory inside one cell** forty words apart, which is why a check would need the claim in
a structured field nothing writes. A **rung for the EVIDENCE**, fourth plan running: of P14's five
defects **one has a rung and it is the one where the rung was green by not running**. An **`Owns`
pre-declaration rule**, and this is the second plan run as the test — `AGENTS.md` yes/yes/**no**,
`spec/README.md` yes/yes/**no**, `scripts/check-docs.mjs` no/no/no, so **the exit artifact reached
neither** and a rule naming them would have been wrong on both for W51. A **fourth list below
`CROSS_ROW_SUBJECTS`** — refused at v0.14 as a prediction, and **P14 is the fourth iteration and did
not add one**: W51 computed its cross-row clause from the row definitions and from the folded run
instead, which is [Q217](../open-questions.md)'s regress stopping where a clause is DERIVED. And an
**obligation that an item re-run its plan's facts**, refused because it already exists in the
template's `Inputs` row and is what worked here.

**v0.14's three changes: all three CONFIRMED and KEPT, each with a limit.** The **HARNESS's ceiling
clause** fired in all three items and produced its best case in W50 — a ceiling whose stated reason
named a FUTURE rung, re-run at this retro and now reporting **L6 exit 1, 2 failures**. **All seven
ceilings this plan declared were re-measured here: six hold and one is closed.** *Its limit: the
clause binds the HARNESS, and W49's second ceiling is PROSE* — re-measured by hand, inverting
`spec/flow-definition.md`'s own normative sentence back to the prefix rule leaves `npm test`,
`check:spec` and `check:docs` at **exit 0 with zero FAIL lines**. **(d)'s *a count is not a
membership*** was reached by an AUTHOR (W49's `CASES` list) — *its limit: a membership list is a claim
about a LAYER, and W51 added no layer, so `ROW_KEYS` and `CROSS_ROW_SUBJECTS` reached none of its four
survivors.* **The THIRD DIRECTION fired hardest — fourteen instances** — *and its limit is a second
direction it does not name: a claim with an EXPIRY DATE is written by one item and falsified by
another,* which is change 3.

**Rule 8 across the plan: 71 provocations, 65 caught, SEVEN declared ceilings all MEASURED at this
retro, ZERO undeclared survivors, ZERO aborts**, each set run twice with **25 of the readers' exact
edits checked back in**. **Readers six passes, none empty — 38 conformity findings / 13 blocking and
98 mutations / 16 real survivors / 13 blocking. Overlap 2, 2, 1**, the twenty-sixth to twenty-eighth
measurements, inside the 0-4 band, none primed. **Late exceptions 2 → 6 → 3 = 11, ZERO undeclared** —
and W50's Record said FIVE where its own table declares six, corrected under section 6 pass 3 rule 6.
**Census CONFIRMED for the FOURTEENTH plan running — 179 / 129 / 2 / 48**, 42 in both tables, 179 of
179 in one cluster cell, **0 aborts on a parser written from scratch and right first time**, the
fourth time that has happened. **Gate re-taken: `GATE EXIT=0`, zero lines beginning `FAIL`, 15 chain
entries; L1-L5 25 files / 681 cases in FIVE runtimes; L6 942 assertions over 42 real runs in both;
`spec` 7 documents / 44 examples / 89 rules; `selftests` 7/7 ok.** **Reverting ADR 0044's resolver
re-measured at 6 L1-L5 and 12 L6.**

**P14 IS COMPLETE. Three items, all done, one ADR, and the plan's question is answered: a reference
across sibling regions means what `FD-V28` always said it meant — all of the target's outputs — and
the run now delivers them, at arities neither derives from the other.** **Q218-Q222 used of Q218-Q232
reserved; Q223-Q232 are spent and not reused. ADR 0044 taken, 0045 SKIPPED and spent. W52 closed as
reserved and never issued. The next plan starts at W53, Q233 and ADR 0046.**
