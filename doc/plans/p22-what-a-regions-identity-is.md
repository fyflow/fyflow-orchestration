# P22 — What a region's IDENTITY is, and whether one may open inside a map

**Status:** **DECLARED** 2026-09-23 on `1da565f` (P1-P21 complete and retro'd, `doc/workflow.md`
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
fifth ([Q352](../open-questions.md)). **W86 is still a row in the table below and nothing more**,
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

**It takes [Q160](../open-questions.md) and [Q156](../open-questions.md) as ONE question, because
one is the mechanism and the other is the narrower case of it.** Q156 asks *may a `map`'s branch
itself open a region*; Q160 says why it cannot — **a region's identity is its opener's NODE ID, and a
map makes one opener reachable N times in a run** — and [W33](../work-items/w33-a-map-at-run-time-arity.md)
REFUSES the shape at `Driver` construction rather than letting instance 2 silently discard
instance 1.

**This is the position [Q12](../open-questions.md) held before P10, [Q11](../open-questions.md)
before P12 and [Q206](../open-questions.md) before P14: the only open rows where the library cannot
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
one that mattered with a colon-free name. *It is [Q253](../open-questions.md)'s class one notch in:
the number is re-takeable and the artefact is empty, and nothing would have said so.*
[Q345](../open-questions.md).

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
- **[Q206](../open-questions.md)** — a region's collection reachable by no reference. Still the
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
| **W86** | **The exit artifact** — *score each item, then fan out per item* on a real `FyflowScheduler` in **both** L6 runtimes, and the reference teaching it. The inner region is a **`map`** and stop-and-ask (c) grants it **ONE new worker**, returning a per-item list directly, so no transform is in the artifact's road. **It also moves the package to `0.4.0`** (stop-and-ask (b)), with `README.md` naming the break. **L6 MOVES and this row says by how much.** It must also try what no fact here measured: a REAL pool's interleaving of two region instances | `examples/**`, `AGENTS.md`, `README.md`, `examples/README.md`, `package.json`, `deno.json` | W85 | L6 in **both** runtimes; `check:docs`; `check:markdown`; the full `npm run gate` |

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
| [Q160](../open-questions.md) | *a region's identity is its opener's node id, and a map makes one opener reachable N times* — the mechanism, and the row this plan exists to answer | W84 |
| [Q156](../open-questions.md) | *may a map's branch itself open a region* — the narrower question, answerable once Q160 is | W84 |
| [Q345](../open-questions.md) | *a spike's own logs, unreadable on the machine that wrote them* — raised by this declaration, owned by nobody | no owner |
| [Q206](../open-questions.md) | *a region's collection reachable by no reference* — declared OUT, and its *sibling regions inside one map region* shape is what this plan does not reach | out, no owner |
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

**[Q142](../open-questions.md) was MEASURED at this declaration and does NOT fire.** This plan adds
ONE document, and it lands in `doc/plans/`, which is the directory probe 2 cuts — the shape that
fired on P12 and on P18's retro. `check:markdown` is **EXIT 0** and `check:markdown:selftest` is
**EXIT 0 with zero FAIL lines and 7 / 7 bounded**, so neither floor is retuned here. *Measured before
the record step rather than found by the gate, which is P15's precedent and P19's.*
