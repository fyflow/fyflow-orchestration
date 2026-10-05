# P22 — What a region's IDENTITY is, and whether one may open inside a map

**Status:** **COMPLETE and RETRO'D 2026-09-24** — `doc/workflow.md` [v0.23](../workflow.md), ONE change adopted and SEVEN refused, in [the Retro below](#retro). Declared 2026-09-23 on `1da565f` (P1-P21 complete and retro'd, `doc/workflow.md`
[v0.22](../workflow.md)). **[W84](../work-items/w84-what-a-regions-identity-is.md) is DONE** — ADR 0062, the
refusal LIFTED, `spec/` at v0.7 / v0.17 / v0.22, L1-L5 at 46 / 1302 and **L6 UNMOVED at 1724 / 58**;
**it corrects this plan in THREE places**: the churn is **63 typecheck sites in 8 files and 34 L1-L5
failures** and not sixty-in-six and thirty-two (the difference is `UnsatisfiableJoin.regionPath`,
taken beyond decision 3 and recorded as a departure); **prediction 1 REVERSES** by its own stated
condition, with 8 of the 34 in four files no typechecker names; and the per-region structure list is
**FIVE, not four**. **[W85](../work-items/w85-what-a-nested-region-carries-and-how-it-ends.md) is DONE** — no ADR, no
rule id, `spec/join-policy.md` v0.18 and `spec/run-state.md` v0.8 moving THREE `Test:` cells and
nothing else, L1-L5 at **47 / 1322** and **L6 UNMOVED at 1724 / 58**; **it corrects fact 5**, which
named three branch-exit paths as the undriven class and is wrong in both directions — `branch.lost`
was already bound at 7, four sites the class does not name were also at 0, and `branch.exited` is a
fifth ([Q352](../questions/q352.md)). **[W86](../work-items/w86-score-each-item-then-fan-out-per-item.md) is DONE and it is this plan's
EXIT ARTIFACT** — *score each item, then fan out per item* on a real `FyflowScheduler` in BOTH L6
runtimes, **L6 1833 / 60** from 1724 / 58, L1-L5 UNMOVED at 47 / 1322, the package at **`0.4.0`**,
and the ONE new worker stop-and-ask (c) grants **USED**. **It removes fact 1's headline zero**:
*openers inside a map region: 0 of 50 — that zero IS the refusal* reads **1 of 52 over 46
documents** on the tree it ships. **And prediction 3's reversal condition went the OTHER WAY** —
*because a real pool interleaves two instances in a way the fake does not* is false in the direction
that matters, since a `map` dispatches every instance at once and one FIFO pool makes each window
close before the next opens, so a real run interleaves **LESS** ([Q358](../questions/q358.md)). The
overlap is ARRANGED, DERIVED from the run's own sequence and asserted, and measured from both sides.

*(This read "W86 is still a row in the table below and nothing more" until that item made it false,
and is corrected by it as a declared exception rather than by the retro — section 1 rule 5's third
direction, for the second consecutive item of this plan.)*

**W86 was still a row in the table below and nothing more**,
because an item is declared with its full template at the point it starts, when its declaration step
can correct what this plan handed it — which all three of P21's items did, and both of P22's have.
*(This read "W85 and W86 are still rows" until W85 made it false, and is corrected by that item as a
declared exception rather than by the retro — section 1 rule 5's third direction.)* Its facts were measured into `dev-dist/p22/` on the same
tree, and they RE-TAKE a spike run at `228a5e1` whose evidence is `dev-dist/spike-nested-map/`.
**Question this plan answers:** *What is a region's identity, and may a region open inside a `map`
region?*
**Exit artifact:** *score each item, then fan out per item* — an ordinary flow this library
**cannot express today** — running end to end on a real `FyflowScheduler` in **both** L6 runtimes.
**Reserves:** W84-W87 (W87 expected unused), Q345-Q359, ADR 0062-0063 (0063 expected unused).
*Derived by grep off the tree, never from a sentence — see [A note on ids](#a-note-on-ids).*

---

## Why this plan, and why now

**It takes [Q160](../questions/q160.md) and [Q156](../questions/q156.md) as ONE question, because
one is the mechanism and the other is the narrower case of it.** Q156 asks *may a `map`'s branch
itself open a region*; Q160 says why it cannot — **a region's identity is its opener's NODE ID, and a
map makes one opener reachable N times in a run** — and [W33](../work-items/w33-a-map-at-run-time-arity.md)
REFUSES the shape at `Driver` construction rather than letting instance 2 silently discard
instance 1.

**This is the position [Q12](../questions/q12.md) held before P10, [Q11](../questions/q11.md)
before P12 and [Q206](../questions/q206.md) before P14: the only open rows where the library cannot
express something an author would ordinarily want.** *Score each item, then fan out per item* is not
exotic. The workaround is the one [ADR 0040](../decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
exists to remove: a reshaping node and a second flow.

**And P12's retro already gave the verdict**: *keying a per-region structure by node id ALONE is a
DEFECT and not a convention.* Q160's row carries that sentence. What has been missing since is the
evidence for what replaces it — which a spike has now measured.

---

## What the design settled, and how

*Decided before fan-out (`doc/workflow.md` section 7 rule 3), and **every one of these was MEASURED
before it was chosen** — the spike built each alternative and ran it. Each is recorded with what it
was chosen over, so an item argues from the decision rather than re-deriving it.*

1. **A region INSTANCE is `(opener node id, the opener's own branchPath)` — key (b).** *Over*: key
   (c), `openerId` plus the item indices of the enclosing MAP regions only. **(c) is the minimal
   SUFFICIENT qualifier and (b) is strictly finer** — an opener is entered more than once only
   inside a MAP region, so map indices alone separate every instance, while (b) also separates
   regions in different `fanout` branches, whose openers `FD-V19` already makes distinct nodes.
   **(b) is taken anyway, and the reason is a cost rather than a discrimination**: it is derived by
   the existing `pathOf`/`branchPathOf` in ONE line with no second region-chain walk, where (c)
   costs a **composite string** whose silent failure modes the spike then counted — `joinStatusOf`
   returning `null` for every nested region, with nothing typed able to see it. *The corpus cannot
   arbitrate between them and fact 1 says why.*
2. **`RunState.regions` is TWO-LEVEL — `regions[openerId][openerPath]` — and NO composite string
   exists anywhere.** *Over*: one level keyed by a composite `"inner@1"`. **Measured on the same
   tree, three designs built and run:**

   | | L1-L5 churn | typecheck churn | silent failure modes |
   |---|---|---|---|
   | composite string + key (c) | 2 | 0 | **`joinStatusOf` returns `null` for any nested region** |
   | composite string + key (b) | 29 diffs | 0 | **12 measured** — 9 `joinStatusOf`, 3 lookups returning `[]` |
   | **two-level + key (b)** — TAKEN | 32 | **60, every one NAMED** | **none** |

   ***Qualifying the OBSERVABLE id is what breaks things, and it breaks them where no type can see
   it.*** The cheapest row is the one that fails in silence; the dearest is the one whose whole cost
   a typechecker prints.
3. **`regionId` keeps ONE meaning — the opener's node id — and never changes value for any existing
   flow.** `RegionEvent` gains **`regionPath`**, the opener's own branchPath:

   ```
   {"type":"branch.arrived","regionId":"inner","regionPath":"1","branchPath":"1.0"}
   ```

   *Over*: redefining `regionId` to carry the qualifier, which is what makes the middle row above
   cost twenty-nine diffs and twelve silent modes.
4. **The refusal is LIFTED rather than narrowed.** W33's construction check is removed, not
   conditioned. *Over*: refusing only `map`-in-`map` and allowing `fanout`-in-`map`, which would
   make the grammar's one refusal turn on which kind of region encloses which — a distinction
   [ADR 0036](../decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
   spent a plan removing.
5. **No `spec/` rule about what a region CARRIES moves.** `JP-R12` already describes the two-level
   case and was confirmed at depth 2 and at N=12 descending; ADR 0044's visibility needed **zero**
   changes over nested map regions, 9 of 9; `checkWiring` survives and traverses two joins. *The
   spike went looking for changes here and found none* — what moves is `RN-R6`'s shape and
   `RegionEvent`, not the rules about collection, visibility or wiring.
6. **N = 0 under nesting is ALREADY DECIDED and is not reopened.** *One empty inner list makes the
   whole run `stuck`* follows from `spec/join-policy.md` section 5 on the SHIPPED tree, with no
   patch — the spike measured it. W33's ruling stands.
7. **The exit artifact is a FLOW, not a number.** *Score each item, then fan out per item*, on real
   workers, in both L6 runtimes. L6 MOVES and the item that adds it says by how much.

---

## What was measured before this plan is declared

*Five facts, on `1da565f`, Node 24.20.0 asserted in every shell, every rung RUN and redirected to
`dev-dist/p22/` and read by `$?`. The tree was held still — digest **`9f8a8b13d0394d78` over 377
files**, identical before the first probe and after the last, `git status` clean at both ends. Every
probe that edited `src/` did so through the spike's `edit.py`, which verifies every anchor against
the CURRENT bytes, writes nothing if any fails, and **asserts the restore by comparing bytes back**.*

| # | fact | where |
|---|---|---|
| **1** | **The key measurement REPRODUCES, and it measures what the corpus can EXPRESS rather than what either key does.** Over both corpora: **45 documents** (44 at the spike — W82 added one), **33 region-bearing, 50 regions**. Key (b) qualifies on **6 of 50**, key (c) on **0 of 50**, and **openers inside a map region: 0 of 50** — `branchPathOf` derives a statically unique path for 50 of 50 and throws `ID-R6` for none. ***That zero is the refusal, not a fact about nesting***: the one shape both keys exist for is the shape W33 forbids, so no document in either corpus contains it, and (b)'s six are all `fanout`-nested at `path=1`, where the opener was already a distinct node. **Neither key is needed by anything that exists today, which is what makes decision 1 a cost argument** | `f1-key.log`, `f1b-key.log` |
| **2** | **The churn REPRODUCES exactly, at 46 edits across THREE files** — the spike's own `edits_c`/`edits_c2` lists re-applied unchanged, so its `+137 / −73` is inherited rather than re-taken. `typecheck:node`, `:browser` and `:deno` are **EXIT 0 — `src/` compiles clean on all three source lanes** — and `lint` is clean; `typecheck:tests` is **54 errors in 6 files** and `typecheck:examples` **6, all `examples/l6.ts`**; L1-L5 is **32 failures**; both nested documents run to `completed` with `JP-R5` clean | `f2-churn.log` |
| **3** | **The *all churn is LOUD* claim HOLDS, at a line that MOVED.** The patched L6 dies with a `TypeError` at `examples/l6.ts:4190` — the spike recorded **3891**, and W82 grew that file — and `typecheck:examples` names `[3713, 3723, 4190, 4191, 4192, 4193]`. **The crash line is in the list.** `lint` and `typecheck` are gate entries 1 and 2 and L6 is entry 13, so the crash cannot reach a run | `f2b.log` |
| **4** | **DEPTH THREE works unchanged, which the spike names as NOT MEASURED.** `map -> map -> map` at 2x2x2: the shipped tree REFUSES it (the control), and under the design it dispatches **16 tasks** at three-segment paths `0.0.0`…`1.1.1`, opens **seven region instances** — `outer@-`, `mid@0`, `mid@1`, `inner@0.0`, `inner@0.1`, `inner@1.0`, `inner@1.1` — and **completes**. *Four distinct keys for the innermost opener, and `spec/task-id.md` already reserves the grammar* | `f3.log` |
| **5** | **The THREE branch-exit paths are CLEAN under nesting, and they are the one class fact 3's claim does not cover.** The design edits `branch.lost`, `branch.suspended` and `branch.resumed` and the spike drove **none** of them — *a mis-keyed exit fires the outer join early or hangs it, and no typechecker can see that, because the key is a string either way.* Measured on Q160's own document, with the same control as fact 4 — **the shipped tree refuses it**: an optional task failing in ONE outer item puts `branch.lost` under `f2@1` alone; a task parking puts `branch.suspended` under `f2@0` alone; a person resolving it puts `branch.resumed` under `f2@0` alone and **the run completes** with no failures | `f4.log` |

### A finding about the EVIDENCE, not about the design

**The spike's own typecheck logs are ZERO BYTES on this machine, and the reason is a Windows
filename.** `run-pC.py` writes `pC-tc:examples.log`; a colon in a Windows path opens an **NTFS
alternate data stream**, so what is on disk is a single `pC-tc` at 0 bytes and the five typecheck
lanes overwrote one another's stream. **The numbers in the spike's report are sound** — they come
from an in-process parse of the captured output, not from the files — and fact 3 above re-takes the
one that mattered with a colon-free name. *It is [Q253](../questions/q253.md)'s class one notch in:
the number is re-takeable and the artefact is empty, and nothing would have said so.*
[Q345](../questions/q345.md).

---

## Scope

**In**

1. **What a region's IDENTITY is** — ADR 0062, decisions 1 to 3, and the `spec/` rules that carry it.
2. **The refusal LIFTED**, so Q160's own document and a map inside a map both run.
3. **The churn PAID** — all sixty typecheck sites and all thirty-two L1-L5 failures, every one in a
   file a typechecker names.
4. **The shapes the spike measured or flagged**: `JP-R12` at two levels, the three branch-exit paths,
   N = 0, depth 3, retention per instance, and reference visibility across nested map regions.
5. **One L6 flow** — *score each item, then fan out per item* — on real workers in both runtimes.

**Out** — named rather than left implicit, with where each goes instead

- **Any change to what a join CARRIES.** Decision 5: `JP-R12` already describes it and the spike
  confirmed it at two levels and at N=12 descending.
- **Reopening N = 0.** Decision 6; `spec/join-policy.md` section 5 already decides it.
- **[Q206](../questions/q206.md)** — a region's collection reachable by no reference. Still the
  untouched capability gap, and **sibling regions nested inside ONE map region** is its shape one
  level in, which this plan does not reach.
- **Anything on a real scheduler beyond the exit artifact.** Every behavioural fact here is ladder
  L2 on a fake, which the spike states as a RESULT rather than a gap; the exit artifact is where a
  real pool's interleaving is measured, and it is the item that must try to break it.
- **Browsers.** L0-L5 under Node only in the facts; the items run the full three-runtime ladder.

---

## Work items

*Serial. Each owns its files; the `Owns` block is written from the row here, never from the item's
title (`doc/workflow.md` section 7 rule 2).*

| | what it does | Owns | Depends on | Gate |
|---|---|---|---|---|
| [**W84**](../work-items/w84-what-a-regions-identity-is.md) | **What a region's IDENTITY is** — **ADR 0062**: key (b), the two-level carrier, `RegionEvent.regionPath`, `regionId` unchanged in meaning and in value; W33's construction refusal LIFTED; the `spec/` rules that move (`RN-R6`'s shape, and whatever `spec/run-state.md` and `spec/join-policy.md` say about `regions` being keyed by an opener). **All sixty typecheck sites and all thirty-two L1-L5 failures are this item's**, because the change does not compile without them | `src/driver/**`, `src/fold/**`, `spec/**`, `test/**`, `doc/decisions/0062-*` | nothing | L0 under all five typecheckers; L1-L5 in three runtimes; `check:spec`; **L6 UNMOVED** |
| **W85** | **What a nested region CARRIES and how it ENDS** — the shapes: `JP-R12` at two levels and at depth 3, the three branch-exit paths under nesting (fact 5's, as assertions rather than a probe), N = 0 inside a map, retention released per instance, and ADR 0044 visibility across nested map regions. **Fact 5 is the reason this is its own item**: those three paths are the one class of churn no typechecker can see | `test/**`, `spec/**` as the shapes need | W84 | L1-L5 in three runtimes; `check:spec`; **L6 UNMOVED** |
| [**W86**](../work-items/w86-score-each-item-then-fan-out-per-item.md) — **DONE** | **The exit artifact** — *score each item, then fan out per item* on a real `FyflowScheduler` in **both** L6 runtimes, and the reference teaching it. The inner region is a **`map`** and stop-and-ask (c) grants it **ONE new worker**, returning a per-item list directly, so no transform is in the artifact's road. **It also moves the package to `0.4.0`** (stop-and-ask (b)), with `README.md` naming the break. **L6 MOVES and this row says by how much.** It must also try what no fact here measured: a REAL pool's interleaving of two region instances. **DONE: L6 1833 / 60 in both runtimes, the package at `0.4.0`, the grant USED, and prediction 3 CONFIRMED with its reversal condition measured the OTHER way** — a real pool interleaves two instances LESS than a fake does, so the overlap is ARRANGED and DERIVED rather than found ([Q358](../questions/q358.md)) | `examples/**`, `AGENTS.md`, `README.md`, `examples/README.md`, `package.json`, `deno.json` | W85 | L6 in **both** runtimes; `check:docs`; `check:markdown`; the full `npm run gate` |

**W87 is reserved and expected unused**, on P19's W75, P20's W79 and P21's W83 precedent.

---

## Predictions, to be written down BEFORE the items that test them

*The scope column states what the measurement COVERED. P19's, P20's and P21's retros all found that a
scope column is correct and still does not prevent the defect, because it cannot state what nobody
thought of — so these say what was measured and make no claim beyond it.*

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **The churn is LOUD in full: every one of the sixty typecheck sites and every one of the thirty-two L1-L5 failures is in a file a typechecker names, so nothing lands silently** | facts 2 and 3, which verify the TYPECHECK half completely — including the exact line L6 dies on — and **do NOT verify that each of the 32 runtime failures maps one-for-one to a flagged site**; they are in the six flagged files and were not checked individually | one L1-L5 failure in a file no typechecker flags, which would mean a behavioural change with no static signal — the shape fact 5 exists to look for and did not find |
| 2 | **No `spec/` rule about what a region CARRIES moves, and no ADR is superseded** — `JP-R12`, ADR 0044 and `checkWiring` all need zero changes | decision 5, resting on the spike's `p4`, `p5`, `p7b`, `p7c` and `p10` probes at depth 2, plus fact 4 at depth 3; **it does not cover a real pool, sibling regions inside one map region, or the stop path (`failRun`, `arrivals.clear()`, `OR-R10`) under nesting** | the stop path needing a rule, which is the one structure the spike edited and never drove to completion |
| 3 | **REACH: a consumer writing *score each item, then fan out per item* needs no reshaping node and no second flow** — the workaround ADR 0040 exists to remove is gone for this shape | **none — this is a reach.** Every behavioural fact here is L2 on a fake scheduler, and no consumer-facing flow has been written | the exit artifact needing a reshaping node anyway — for arity, for `needs`, or because a real pool interleaves two instances in a way the fake does not |
| 4 | **`regionId` keeps its value for every existing flow, so no L6 literal and no `test/**` literal that names a region CHANGES** — only ones that name the two-level SHAPE do | decision 3 plus fact 2's churn breakdown: the 60 sites are `regions[...]` SHAPE errors, and the 6 in `examples/l6.ts` are indexing errors rather than value mismatches; **it does not cover `examples/README.md` or `AGENTS.md`, which no typechecker reads** | a row whose expected `regionId` string has to move, which would mean decision 3 did not hold and the middle row of decision 2's table is what shipped |

---

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q160](../questions/q160.md) | *a region's identity is its opener's node id, and a map makes one opener reachable N times* — the mechanism, and the row this plan exists to answer | W84 |
| [Q156](../questions/q156.md) | *may a map's branch itself open a region* — the narrower question, answerable once Q160 is | W84 |
| [Q345](../questions/q345.md) | *a spike's own logs, unreadable on the machine that wrote them* — raised by this declaration, owned by nobody | no owner |
| [Q206](../questions/q206.md) | *a region's collection reachable by no reference* — declared OUT, and its *sibling regions inside one map region* shape is what this plan does not reach | out, no owner |
| Q346-Q359 | *reserved for the items* | |

---

## Stop and ask a human — ALL THREE ANSWERED 2026-09-23, and TWO went against the recommendation

*Each was measured before the maintainer chose, on W58's and W59's precedent. The answers are
recorded where they differ from the plan's lean, on W77's — its stop-and-ask (c) reversed the plan's
own lean and the plan says so rather than quietly agreeing with itself.*

| | answer | against the lean? |
|---|---|---|
| **(a)** | **Nothing is checked in. The precedent holds.** | **YES** — the plan leaned to the harness |
| **(b)** | **`0.4.0` at W86's close** | no |
| **(c)** | **A new worker is allowed** | **YES** — the plan leaned to (ii) |


- **(a) Does a SPIKE's harness live where a declaration's facts do?** *This was drafted citing
  P15 decision 3 against the repository's own practice, and re-reading that decision falsifies the
  framing.* Decision 3 is about an **exit artifact's** harness — *checked in under `examples/**`,
  where L6 already lives*, which is `examples/retention.ts` and `examples/settlement-cost.ts`. What
  governs a declaration's facts is **decision 5**, and it says the opposite of what the draft
  implied: *every fact is RE-RUN by the item that acts on it, never transcribed*, with each item's
  `Inputs:` naming `dev-dist/p15/`. **So twenty-one plans gitignoring their facts is the precedent
  working, not a gap**, and [W84](../work-items/w84-what-a-regions-identity-is.md)'s declaration
  step is decision 5 executed. **What is genuinely open is narrower**: the re-run needs the
  HARNESS, and this plan's harness is a **concluded spike** rather than a probe an item will
  rebuild — `edit.py`, `edits_c.py`, `edits_c2.py` and the two flow documents are what make
  facts 2 to 5 re-takeable at all, and they are one machine loss from gone. **Measured, so the
  choice is priced**: the harness is **152.3 KiB over 44 files** (`.py`, `.ts`, `.mjs`, `.md`); the
  logs are **947.2 KiB over 50 files** and `dev-dist/p22/spike-snapshot/` a further **1.3 MB**,
  being the spike's pre-re-run logs, which its own re-run overwrote. **Recommendation: check in the
  HARNESS and not the logs** — a `.gitignore` negation naming the code extensions, ~152 KiB, no
  `.pyc`, no rung output, and no second copy. *A log is a number nobody can re-take; the harness is
  what re-takes it, and decision 5 is the reason that is the right half to keep.*
  **ANSWERED: NOTHING is checked in — `dev-dist/` stays ignored and the twenty-one-plan precedent
  holds, against the recommendation.** The consequence is stated rather than softened: `edit.py`,
  `edits_c.py` and `edits_c2.py` exist on ONE machine, and if that machine is lost the forty-six
  edits are rebuilt from ADR 0062's prose rather than re-applied. **What this makes load-bearing is
  decision 5**, so [W84](../work-items/w84-what-a-regions-identity-is.md)'s declaration step is no
  longer a good practice but the ONLY road by which any of facts 1 to 5 reaches the item that acts
  on them — and its five-row re-take table is the plan's whole answer to *where do the facts live*.
- **(b) Does this move the package version?** `RegionEvent` gaining `regionPath` is ADDITIVE, but
  **`RunState.regions` becoming two-level is BREAKING for anyone reading it** — and `RunState` is
  what `runtime.start(...).done` resolves with ([ADR 0058](../decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)).
  The package is `0.3.0` and W77 moved it for exactly this kind of change.
  **Recommendation: `0.4.0` at W86's close**, on W77's own precedent, with `README.md` naming the
  break. **ANSWERED: `0.4.0` at W86's close, as recommended.** So **W84 and W85 ship the breaking
  shape with the manifest UNMOVED**, and the version moves once, in the item that makes the
  capability demonstrable. *Measured while pricing it: `RunState` reaches the package root through
  `index.ts`'s `export * from "./src/fold/run-state.ts"`, so `regions` is public surface by
  re-export rather than by anyone deciding it should be — which is why the break is real and why
  `README.md` has to name it.*
- **(c) What is the exit artifact's INNER region, and does it need a new worker?** *The draft said
  "reuse `split` twice" and that does not work as written*: `split` reads `payload.text` through
  `wordsOf`, a map item is `{ word, confidence }` from `memoisedItems`, so `split` over an item
  returns an EMPTY list and decision 6 makes the inner region `stuck`. Three roads, priced:
  **(i) the inner region is a `fanout`** — its branch entries are written down (`FD-V9`), so it
  needs no list, no transform and no worker, and it exercises `fanout`-in-`map`; **(ii) the inner
  region is a `map`**, with `split` reused under a `transform: { lang: "jsonata", expr: "{\"text\":
  word}" }` — no new worker, and it exercises `map`-in-`map`, the shape that actually enters one
  opener N times from run-time data; **(iii) a new worker.** **Recommendation: (ii).** It is the
  hard case, it is the one the refusal exists for, it costs no new worker — P21's own grant of one
  was measured UNUSED by W81 — and it makes the artifact exercise the transform P17 shipped, which
  is what *reuse* should have meant. *(i) is worth having as the row's control, since the two
  differ in exactly the property ADR 0062 decides.*
  **ANSWERED: (iii) — a NEW WORKER is allowed, against the recommendation.** So W86 adds one worker
  returning a per-item list directly, the inner region is a `map`, and **no transform is in the
  exit artifact's road**. *The cost the plan named stands and is not withdrawn: this is the SECOND
  consecutive plan to grant this permission, and P21's was measured UNUSED by W81 — so whether it
  is used is a fact W86 must report either way, which is what made W81's unused grant worth
  recording.* **What the grant buys is that the artifact's flow says one thing**: with (ii) a
  failure could be the nesting or could be the transform, and W86's row would need a control to
  tell them apart. *(i) stays available to W85 as a shape rather than to W86 as a row.*

---

## A note on ids

**Reserves W84-W87, Q345-Q359, ADR 0062-0063.** **Derived by grep off the tree at this declaration**,
never from a sentence:

| | on disk | so |
|---|---|---|
| highest work item | **W82** | W83 was reserved by P21 and **closed unissued**, so it is skipped; P22 starts at **W84** |
| highest question | **Q343** in the tables | Q344 was reserved by P21 and unused, so it is **spent**; P22 starts at **Q345** |
| highest ADR | **0060** | 0061 was reserved by P21 and skipped; P22 starts at **0062** |
| highest plan | **P21** | this is **P22** |

## The baseline this plan was declared on

Re-taken on `1da565f` rather than inherited: **L6 1724 assertions over 58 real runs** in node 24.20.0
and deno 2.9.6; **L1-L5 46 files / 1295 assertions** in node, deno and chromium; `check:spec`
**7 / 61 / 108**; `check:docs` **34 snippets: 28 run, 6 check**; `check:workers` **16 / 16 / 2**;
`check:markdown` **142 documents, 6276 relative links, 319 anchored**; census **265 / 206 / 2 / 57**.

**[Q142](../questions/q142.md) was MEASURED at this declaration and does NOT fire.** This plan adds
ONE document, and it lands in `doc/plans/`, which is the directory probe 2 cuts — the shape that
fired on P12 and on P18's retro. `check:markdown` is **EXIT 0** and `check:markdown:selftest` is
**EXIT 0 with zero FAIL lines and 7 / 7 bounded**, so neither floor is retuned here. *Measured before
the record step rather than found by the gate, which is P15's precedent and P19's.*

## Retro

*Pass 3, run 2026-09-24 on `96886f7`'s tree. **ONE change adopted, SEVEN refused**, and
`doc/workflow.md` is [v0.23](../workflow.md), where the full reasoning lives. What follows is this
plan's own evidence.*

### The central finding: every item put the discriminated value where the wrong answer is the right one

**Rule 8 obligation (a) gains: where a rule SELECTS — a key, an index, an instance, a path — the set
names the well-formed WRONG selections the type admits, and each fixture puts the right one where
every one of them DIFFERS.**

This plan's subject is a KEY, and all three of its items met the same defect in it, each having read
the previous item's account of it first. **Every one of them FOLLOWED obligation (a) as it stands** —
the shapes clause, the enumeration clause and the same-claim clause — and every one was short in the
same place: not in WHICH shapes the set covered, but in WHICH INSTANCE of a shape the fixture used.

| item | what the rule selects | where the fixture put it | what the wrong selection cost |
|---|---|---|---|
| [W84](../work-items/w84-what-a-regions-identity-is.md) | a region's collection, by INSTANCE; the instance, by its opener's path | instances settled in DISPATCH ORDER; every instance at ONE path segment | reading the opener's **first** instance cost **0** ([Q349](../questions/q349.md)); truncating the instance path to its **first segment** cost **0 at every rung** — W33's defect one depth out |
| [W85](../work-items/w85-what-a-nested-region-carries-and-how-it-ends.md) | a branch-exit event and `JP-R10`'s emission, by instance | both parks in **instance 0**; every region `JP-R10` names with **one** instance | filing the event under the opener's **first opened** instance cost **0 at five sites** ([Q353](../questions/q353.md)) — *in the item written to discharge Q349* |
| [W86](../work-items/w86-score-each-item-then-fan-out-per-item.md) | `arrivals`, by instance, on real workers | what a real FIFO pool gives: each instance's window CLOSED before the next opens ([Q358](../questions/q358.md)) | with the arranged overlap removed, keying by the opener alone costs **1 where it costs 3**, and Q353's first-instance keying **0 where it costs 2** — each counted above what removing the overlap costs by itself — and the author's own `r2`, hard-coded to the one opener the fixture has, was **set-equal to the right answer** |

**The mechanism is why this generalises rather than being a fourth item.** A wrong selection that is
*well-formed* — the opener's first instance, the path's first segment, `values()[0]` — is not an
arbitrary wrong answer; it is the one that COINCIDES with the right answer at the DEFAULT position:
index 0, the first opened, a single segment, settlement in dispatch order. **A fixture at the default
position cannot tell the rule from its most plausible defect, however many shapes it covers**, and it
is the position an author reaches for because it is where every pre-existing flow already sits. W85
drove FOUR exit paths where the plan named three, depth three, N = 0, retention and visibility — the
enumeration was complete and every instance in it was the degenerate one. *Section 6 pass 3 rule 3's
sharpest kind, three items running, on a clause each of them cited.*

**What it replaces**: nothing is deleted. The shapes clause says *instantiate every value of the
kind*; this says what *instantiate* has to mean for a rule that selects — **discriminate** — and
names the three wrong selections this plan found so the next author can recognise a fourth. **It is
the FOURTH amendment to obligation (a)** — v0.16's shapes, v0.17's enumeration, v0.18's same claim,
and this — **and the sequence has the shape (d)'s did**: each amendment was the previous one
FOLLOWED and short, and each names a finer grain of the same question. [Q353](../questions/q353.md)
is **RESOLVED** by it: its forcing condition was *a third item asserting a per-instance key at
instance 0*, and W86's overlap-removed arm is exactly that and costs zero. [Q349](../questions/q349.md)
stays open on its own forcing condition — *a second STRUCTURE whose lifetime hides its own key* — which
is about a release rather than a fixture and has not occurred.

### Name the rung

**THIRTY-SEVEN defects across the three items' own *What broke* lists — 9 / 12 / 16**, counted one
per defect rather than one per paragraph (W84's first paragraph carries two probe defects and four
real survivors; W85's *three wrong expectations* are three). **NINETEEN name a rung that FIRED, and
all NINETEEN were read correctly at the first opportunity — the first plan in which none was
misread** (P19 20 of 21, P20 15 of 16, P21 12 of 13).

| the rung | what it caught |
|---|---|
| rule 8's AUTHOR pass | W84's four real undeclared survivors — the collection's read and its release under sequential settlement, `RN-R10`'s quantification, `RN-R6`'s cross-policy walk; W86's `d1`, a CRASH read as one, and its `x1`, CAUGHT for the wrong reason and read as that |
| L1-L5 | W84's eight failures in four files no typechecker names ([Q346](../questions/q346.md)) and the cast that restated its own shape ([Q347](../questions/q347.md)) |
| an item's own new suite on its FIRST run | W85's three wrong expectations — `JP-R12`'s `{}` propagating ([Q354](../questions/q354.md)), `FD-V28`'s bare form ([Q355](../questions/q355.md)), the enclosing collection live at an inner release |
| L6 on its first run | W86's `ID-R6` clause reading every throw as the refusal, and the retention peak at 6 where 7 arrived ([Q359](../questions/q359.md)) |
| L1 twice and a GATE ENTRY once | W86's three corpus censuses ([Q360](../questions/q360.md)) — `wiring.test.ts`, `result-value.test.ts`, and `check:workers:selftest` red with `check:workers` green |
| rule 8's RE-RUN | W86's two reach counters, each reading a length the mutation it was written against does not touch |
| the confirming `npm run gate` | W86's `GATE EXIT=2` with ZERO `FAIL` lines, **read as a CRASH** — `TS2304` in the second road written for a reader's finding, visible only to `typecheck:examples`, which had last run before the fix existed |

**EIGHTEEN have no rung, and FOUR are in the INSTRUMENTS**: two of W84's six first-pass survivors
were the PROBES (`c2` equivalent by construction, `d3` moving both sides of an equality); W85's
digest read `git ls-files`, tracked files only, and was blind to the two files the item ADDED; and
W86's peak sampler went on retaining the collection ADR 0046 releases, because the fix for its
arithmetic cleared a fresh local rather than the map the closure held. **Twelve were found by a
reader and two by an item's own declaration-step re-take** (W84's `Gate` line drawn from its `Owns`
list, [Q348](../questions/q348.md); W84's link count stale by one, found by W85).

**And the split by item is the one the items' KINDS predict.** W84 changed `src/` and six of its nine
fired; W86 built a flow on real workers and ten of its sixteen fired; **W85 wrote no product code at
all and three of its twelve fired** — and the nine without a rung are cases that could not fail, a
membership an empty suite satisfies, sentences about what its fixtures cover that they did not, and
one instrument. *An
item whose deliverable IS a suite has defects of the one kind no rung fires on, because an assertion
that cannot fail passes* — which is what its adequacy reader is for, and what it found.

### The predictions

| # | verdict |
|---|---|
| 1 | **REVERSED at the first item, by its own stated condition, measured one for one** — **8 of W84's 34 L1-L5 failures are in four files no typechecker names**, because `Record<string, T>`'s open index signature types `regions['split'].joined` as `RegionRun` on the two-level shape ([Q346](../questions/q346.md)). **Its scope column named EXACTLY the half that reversed** — *does NOT verify that each of the 32 runtime failures maps one-for-one to a flagged site* — which is [v0.14](../workflow.md)'s scope column doing what it was adopted for: making a prediction's unmeasured half legible before it is tested. **Its conclusion survives on a different rung**: L1-L5 and L6 caught every one, so *nothing lands silently* holds and *the churn is LOUD at L0* does not |
| 2 | **CONFIRMED.** `JP-R12`, ADR 0044 and `checkWiring` needed zero changes (W84); W85 added no rule id and moved three `Test:` cells; the stop path under nesting needed no rule. A DERIVED prediction, from decision 5 and the spike — so confirming it tested the inference, which is [P10](p10-is-fan-out-one-feature-or-two.md)'s reading for the eleventh plan |
| 3 | **CONFIRMED, and it is the only REACH — and its reversal clause's MECHANISM was false in the direction that mattered.** W86's flow declares zero `needs`, zero `transform` and one node between the two maps. The clause guessed *because a real pool interleaves two instances in a way the fake does not*; measured, **a real FIFO pool interleaves them LESS** ([Q358](../questions/q358.md)), so the overlap W86 needed had to be ARRANGED. *[P15](p15-what-a-run-retains-and-what-a-result-may-be.md)'s* a reversal clause DIRECTS an item *a third time — and the second time the direction it pointed was wrong* |
| 4 | **CONFIRMED against the diff** (W84): no existing region name moves, and L6 was UNMOVED through two items that changed the carrier under it — *which is the assertion about `regionId`'s value, not a formality*, since moving that value costs 139 at L6 |

**So: one REVERSED, three CONFIRMED** — and the reversed one is the derived prediction whose scope
column said in advance which half had not been measured. P10's reading is unmoved: prediction 3, the
one reach, is the one that could have gone either way, and it went one way for a reason nobody wrote
down.

### v0.22's one change, and the clauses this plan exercised

**v0.22's controls TEST: asked by a READER and it FIRED; asked by an AUTHOR and it was answered by
half.** W85's adequacy reader asked it of the suite census's control — `names.length >=
SUITES.length` — and found the tree at once: a one-token re-source empties both set differences and
leaves the control true ([Q356](../questions/q356.md)). W86's author asked it of four controls, and
each came back with a tree — a tree on which the CONTROL fails. **On every one of those trees the
claim failed too**, so no control ever had to discriminate, and the adequacy reader made the headline
claim a tautology with all four green ([Q362](../questions/q362.md)). The test is a CONJUNCTION —
*the control fails AND the claim passes* — and it was checked by its first conjunct. *A rule followed
by half is a rule broken, and the counter-measure is its own text.* **Not amended**: the text already
says it, and the repair — a second DERIVATION over the same sequence rather than a third projection
of one walk — is v0.16's *what independent excludes*, which that item quoted.

**v0.17's dated-ceiling clause: TWO catches, and both were already taken by the item their reasons
NAME.** W84's `c5` said *W86 adds a multi-instance flow and this becomes a CATCH there*, and its
`adq8` handed `heldArrivals`' second level to W85 by name. **Re-run here, both are CATCHES** — and
neither is new: W85's declaration step re-took `adq8`'s mutation as its re-take row 4 (*measured at
0*) and closed it, and W86's re-took `c5`'s site as its row 5 and decided it. *So the clause's yield
at this retro is ZERO NEW catches for the fourth plan running*, and the reason is visible again: the
item that moved each value re-ran the ceiling as part of its own declaration, which is the clause's
own procedure working.

**v0.15's *held still*: BROKEN six times in one item, and it is refused as a rule below.** v0.16's
*a rung is RUN, never PIPED*: followed throughout, and the one gate that came back red came back as
`GATE EXIT=2` with ZERO `FAIL` lines and was read as a crash on sight. v0.19's environment clause: all
three harnesses assert node v24 and none came back CRASH for want of it. **v0.14's WITHDRAWN-claim
direction FIRED at W84** — its conformity reader searched for the refusal ADR 0062 lifted and found
three surviving statements in files inside `Owns`, plus two it did not name. **v0.12's WHEN clause
fired on a RUNG rather than on a number** — W86's `typecheck:examples` had last run before the reader
fixes existed, and the confirming gate is what said so.

### Refused, seven, each with a measurement

**(i) A `doc/` check, for the TWENTY-FIRST time — and P22 supplies a class nothing in the tree could
be compared against.** Its stale claims are W84's churn figure (stale by three sites and two files)
and its L1-L5 count (recorded before the author's own last three fixes), W85's *section 3 is
byte-unchanged for the sixth version running* (false since v0.17), W86's `README.md` at 1827 where
the rung read 1833 — and **a citation with no referent, TWICE, in consecutive items**: W85 cited
*W84's adequacy reader, finding 8* four times, and W86 inherited *W84's conformity reader, finding 10*
from W84's own shipped comment and repeated it ten times. **Neither numbered finding is in any file**,
because a reader's REPORT is not checked in — P22 stop-and-ask (a)'s *nothing is checked in*, true of
readers as well as of facts. *A check comparing a citation to its referent has no referent to read*,
and the standing refusal's criterion is unmet again. What corrected both is the next item's reader.

**(ii) A rule for [Q363](../questions/q363.md) — *the author acts on no reader's findings until every
reader has reported*.** W86 ran its readers concurrently, the adequacy reader reported first with six
blocking findings, and the author acted on them under the conformity reader six times. **The clause
already says this**: *while a reader is reading, the AUTHOR's tree holds still* names A reader, not
THE reader — and W86 held one fix, the instrument's, until both had reported, which is the clause
obeyed once in the same item. *A rule broken by an author who could state it* is section 6 pass 3
rule 3's careless kind, and its cost is in the row: the wall clock of one reader pass. **Q363 is
RESOLVED as answered by the text it asked about.**

**(iii) An `Owns` pre-declaration rule, for the TENTH plan running — and the `Gate` line beside it,
which is W85's correction.** All three items corrected the plan's `Gate` column at their own
declaration step: W84's lacked `check:docs` ([Q348](../questions/q348.md)), and **W85's and W86's
both lacked L0**, which a new `test/**` file and every `examples/**` edit are read by. Zero shipped
red: the declaration step caught all three. **And P22 is the first plan since P18 began writing it
NOT to seed the exceptions table at its declaration** — P18, P19, P20 and P21 each did, on P16's
*refused as a rule, adopted as a table* — and W86 is the item that had NO exceptions table until its
conformity reader asked, with two of its five exceptions unpredicted. *The procedure's value is measured here from the side where it was omitted*, which is
an argument for seeding it at the next declaration rather than for a rule the table already does the
work of.

**(iv) A rule for [Q352](../questions/q352.md) — *a gap read off a DIFF is not the gap a probe
measures*.** P22 fact 5 enumerated the undriven class by reading which lines W84 edited, and W85's
re-take found it wrong in both directions. **What caught it is P15 decision 5 — every fact is RE-RUN
by the item that acts on it — and this plan's stop-and-ask (a) made that the ONLY road any fact
had.** The mechanism fired exactly where it was made load-bearing. *The declaration step's job is not
to confirm the plan's enumeration but to replace it*, and it did.

**(v) A rule for [Q356](../questions/q356.md) — *a membership over SUITE names is satisfied by an
EMPTY suite*.** One occurrence, and it is v0.14's *a count is not a membership* one layer in: the
census named CONTAINERS and the claims lived in their CASES. [Q217](../questions/q217.md) gains a
fifth instance — the regress moves inward as well as outward — and W85 closed it with a case-level
membership and a COUNT, its ceiling NAMED: *no expression inside one process can check that a list of
names was written down before the run.*

**(vi) A rule for [Q362](../questions/q362.md) — *three projections of one walk are not three
observers*.** Obligation (c)'s LIMIT already says *count the observers*, and v0.16 says the second
must not be downstream of the first's apparatus; three projections of one walk are one apparatus read
three times. It is [Q340](../questions/q340.md)'s shape at W82 — *every observer of the report was
downstream of the report* — so this is its SECOND occurrence in two plans, **and both times the
existing clause is what the repair quoted**. Recorded, with W86's sentence as the reading: *counting
observers means counting DERIVATIONS, not expressions.*

**(vii) A rule for a corpus census pinned as a LITERAL outside the corpus** —
[Q342](../questions/q342.md) at its **second** occurrence, which P21 refused at one. W86 added a
corpus flow and all three sites fired again ([Q360](../questions/q360.md)); two were predicted. **What
refuses it is that every one of the three was NAMED by a rung that fired and was read correctly** —
L1 twice and a gate entry — so the whole cost was a late row in an exceptions table. *A rule would buy
a prediction, and the rungs already buy the detection.*

### The numbers

**Rule 8 across the plan, all 123 probes RE-RUN at this retro on the shipped tree** (W84's 38,
W85's 42, W86's 43) — **in an isolated copy**: `git archive 96886f7` with `node_modules` copied in
(zero symlinks and zero reparse points, measured before copying) and each item's own harness run
unchanged against it, so the retro's documents were written while the probes ran and neither could
move the other. That is v0.15's *held still* obeyed by construction rather than by waiting, and it is
the answer [Q363](../questions/q363.md)'s cost column did not consider: **a reader's copy costs one
`git archive`.** W84's and W85's harnesses read digest `a4d4d23779aee414` over 387 files and W86's, which
computes its own, `1f3dad466cea972a` over the same 387 — each identical at both ends of every set.

| set | at this retro |
|---|---|
| W84's 38 | **34 caught — 31 as declared, `c5` and `adq8` AGAINST DECLARATION, and `s2` after ONE ABORT re-anchored — 4 declared ceilings RUN (`d2`, `d4`, `s1`, `s3`), 0 undeclared survivors, 0 crashes.** The abort is `s2`, whose anchor is `spec/run-state.md`'s *v0.7* — W85 moved that document to v0.8, so rule 7 (b) fired rather than passing; re-anchored to the current version it is **CAUGHT** at `check:spec`, one named failure, exactly its declared set. The two against declaration are the dated ceilings `c5` and `adq8`, each now a CATCH at 1, each expired by the item its own reason names and re-taken at that item's declaration step |
| W85's 42 | **38 caught, 4 declared ceilings RUN (`m8`, `m9`, `m12`, `m13`), 0 undeclared survivors, 0 crashes, 0 aborts, 0 against declaration** — exactly W85's own final verdict, both passes |
| W86's 43 | **33 caught, 10 classified RUN — the same ten the Record classifies (seven ceilings, two vacuous, one equivalent) — 0 undeclared survivors, 0 crashes, 0 aborts.** And the harness's own summary line reads **SIX AGAINST DECLARATION**, every one a probe the Record reclassified in PROSE and not in the set — `b1`, `b2`, `r1` and `r2` still declared to go RED, `h1` and `a2b` still declared to SURVIVE — exactly as at W86's own pass 2, so the Record's *0 against declaration on the final pass* is true of pass 3's FIVE probes and was written beside 43. Re-running it also found the measurement table stating INCREMENTS as COSTS: its overlap-REMOVED column (1 and 0) is counted above `x2`'s own **4**, and its Outputs row gave `x2` as 3, the figure from before the second road existed — W86's own pass-2 log already reads 4. All three corrected in W86's file under section 6 pass 3 rule 6, with its *six* ceilings, of which it lists seven |

**Across the plan: 123 probes, 105 caught, 18 declared ceilings or classified
survivors RUN, ZERO undeclared survivors, ZERO crashes, ONE abort re-anchored, and TWO against
declaration — both dated ceilings, both already taken by the item their reasons name, so the retro's
yield of NEW catches is ZERO for the fourth plan running.**

**Readers: six passes, none empty — and ONE overlap measured, where every plan since P12 has taken
three.** W86's is **2**, the **fifty-third** measurement — `README_SNIPPET_FLOOR` left slack and the
`CROSS_ROW_SUBJECTS` comment miscounting its own entries, found independently — and W84 and W85 took
none, as W35, W37 and W38 did not; the count is of measurements TAKEN. *And the list in
`doc/workflow.md` section 6 had stopped at the forty-ninth*: P21's retro wrote *the fiftieth to
fifty-second* into its own file and never appended W80, W81 and W82 to the list the ordinal is derived
from. Appended here, with W86's. **Blocking findings: W84 6 + 5, W85 5 + 3, W86 3 + 6 — twenty-eight,
split 14 conformity / 14 adequacy**, and the split held again: the conformity readers found claims
that were false and the adequacy readers bounds that were not there. **And all THREE conformity
readers' central obligations came back with ZERO disagreements on the VALUES** — every region
instance's key, every collection's key set, every branch-exit triple, every dispatched id and both
exit-artifact rows' outcomes derived on paper from `spec/` first — **the second plan running to record
three of three**, after P21.

**Late exceptions: zero undeclared in any of the three** — three declared at W84's declaration step,
two at W85's, and five at W86's of which two were unpredicted and none had a table until its reader
asked (refusal (iii)).

**Census CONFIRMED for the TWENTY-FOURTH plan running — 284 / 221 / 2 / 61, 284 of 284 in exactly one
cluster cell** (284 / 223 / 2 / 59 on arrival; this retro resolves two), by W86's parser unchanged —
which REFUSES any row that is not six cells and names the ten it refuses by id — and a cluster check
written for the retro that expands ranges. **It found the cluster table striking Q320 and not Q156,
Q160 or Q332**, three rows resolved by P21 and P22 whose ids still read as live in the cluster cells;
struck here beside this retro's two.

**[Q142](../questions/q142.md) did not fire in any of the three items** — measured before each record
step, at margins of 13 / 593, 12 / 486 and 11 / 343 (`M3` files / `M4` links) — and **measured again at this retro, BEFORE its commit, on the tree it commits: `M3` 112 files against 123 — margin 11 — and `M4` 4999 links against 5270 — margin 271**. The retro adds no document and lands most of its prose in `doc/plans/`, which probe 2 cuts; its `M4` margin still fell from W86's 343 to 271, W86's own record step and this retro's index paragraphs between them, and neither floor is retuned. **W86's record
step wrote 365 for its `M4` margin into `CLAUDE.md` and `doc/README.md`, LARGER than the 343 its own
file measured before that step, and a record step only ever narrows it**; corrected in both.

**The confirming `npm run gate` over the retro's final tree: `GATE EXIT=0`, ZERO `FAIL` lines**, `selftests`
8 / 8 ok in 1015.0 s wall, content digest `ab94cb6b840466b0` over tracked and untracked-unignored files,
identical before and after — RUN and redirected, never piped. This sentence is the one edit made after
it, and `check:markdown` was re-run over it.

**W87 CLOSED unissued. Q345-Q363 all used — the block extended by four at W86, the fifth plan to
extend one. ADR 0063 SKIPPED. The next plan starts at W88, Q364 and ADR 0064** — derived by grep off
the tree, never from this sentence. *(`CLAUDE.md` read **ADR 0063** for the next plan from W86's
record step until this retro — a reserved-and-unused ADR id is skipped, never reused, on P19's 0057,
P20's 0059 and P21's 0061.)*

## Record

*Filled in as the plan ran.*

| item | status | |
|---|---|---|
| W84 | **DONE** | **[ADR 0062](../decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)** — a region INSTANCE is `(opener node id, the opener's own branchPath)`; `RunState.regions` two-level, `RegionEvent.regionPath` on six variants, `UnsatisfiableJoin.regionPath`, `regionId` unchanged in meaning and value; W33's refusal LIFTED whole. `spec/run-state.md` v0.7, `spec/join-policy.md` v0.17, `spec/flow-definition.md` v0.22; L1-L5 **46 / 1302**; **L6 UNMOVED at 1724 / 58**; `check:spec` unmoved. **Prediction 1 REVERSED** (8 of 34 failures in files no typechecker names). Readers **16 / 6** and **47 / 17 / 12 / 5**. Rule 8 final **38 / 32 / 6 ceilings / 0 undeclared**. Raises **Q346-Q351**; **Q160 and Q156 RESOLVED** |
| W85 | **DONE** | no ADR, no rule id — `spec/join-policy.md` v0.18 and `spec/run-state.md` v0.8 move three `Test:` cells; L1-L5 **47 / 1322**; **L6 UNMOVED**; `src/` untouched. **Corrects fact 5 in both directions** ([Q352](../questions/q352.md)). Readers **12 / 5** and **52 / 10 real / 6 / 3**. Rule 8 final **42 / 38 / 4 ceilings / 0 undeclared**. Raises **Q352-Q357** |
| W86 | **DONE** | **the EXIT ARTIFACT** — *score each item, then fan out per item* on real workers in both L6 runtimes, **L6 1833 / 60**, the package **`0.4.0`**, the new-worker grant USED; `check:docs` gains `X9`. **Prediction 3 CONFIRMED with its reversal mechanism measured the other way** ([Q358](../questions/q358.md)). Readers **9 / 3** and **34 / 14 / 6**, overlap **2**. Rule 8 final **43 / 33 / 10 classified / 0 undeclared**. Raises **Q358-Q363** |
| W87 | **CLOSED unissued** | reserved at the declaration and never issued, on P19's W75, P20's W79 and P21's W83 precedent. **SKIPPED, never reused**, so the next plan starts at W88 |
