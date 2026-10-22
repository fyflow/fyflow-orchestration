# P40 — What does a reference read cost inside a map, and can it cost its answer rather than the map?

**Status:** complete and retro'd 2026-10-22 — W199-W200 done, `gate:full` EXIT 0 on W200's final tree (the Record); the retro raises no stop-and-ask (section 8). Earlier: declared 2026-10-22 — on `4f21bba` (the tree clean, `origin/main` and tag `v0.9.0` at it), answering [Q735](../questions/q735.md) and fyflow-app's *pass 2 follow-up*; facts 1-10 read at this declaration; stop-and-asks (a)-(d) ANSWERED by the maintainer 2026-10-22, all as recommended; **(e) ANSWERED the same day, (e1) — as recommended** (recorded by W199, below); W199 started 2026-10-22.
**Question this plan answers:** *can a `needs` reference read inside a `map` instance cost the size of its answer — one
entry for a `one` reference, the visible entries for an `all` one — rather than every output the named node has produced,
for every case ADR 0044's visibility rule decides, without a second definition of visibility and without moving what any
node receives?*
**Exit artifact:** *on the final tree: (1) `test/fold/map-cost.test.ts`, green in `npm run gate:full` and in all three
L0-L5 runtimes, holding as a CLOCK-FREE COUNT the entries a reference read examines, PINNED to an exact derived value at
2,000 and 8,000 items for four shapes — a branch task reading the task one step back in its own instance, two steps back,
a reader inside a NESTED map, and a reader in a SIBLING map (shape per (e)) — and below **6x** between the two sizes; each
provoked red by restoring the search it holds (checked in, bounded so it cannot hang the gate); (2) Q735's driver
measurement re-taken on the final tree in node 24 and in deno — the driver alone, `post` reading `work`, at 2,000 / 8,000 /
16,000 items — beside Q735's 673 ms / 20.5 s / 96.9 s (a measurement, not a gate entry — [Q179](../questions/q179.md));
(3) one block in `examples/l6.ts`, green in node 24 and in deno, on a threaded and an inline pool, in which every payload a
`needs` composed inside a map of at least twelve items (ADR 0044 rule 3's two-digit segment) equals what ADR 0044's
predicate selects over the run's own outputs, for the four shapes; and `npm run gate:full` EXIT 0 — the LAST item runs it
(workflow v0.29).*
**Reserves:** W199-W201 (W201 expected unused), Q740-Q749, ADR 0124-0125 (ADR 0125 expected unused); no S id

```
Question: what does a reference read cost inside a map, and can it cost its answer rather than the map?
Items:    W199 (the reference index — a read costs its answer; ADR 0124), W200 (the exit artifact on real workers, the
          reply to fyflow-app, P40's Record and retro)
Reserves: W199-W201 (W201 expected unused), Q740-Q749, ADR 0124-0125 (ADR 0125 expected unused)
Raises:   no question at this declaration; no S entry
Baseline: ids derived by `npm run state` at this declaration — P40, W199, Q740, ADR 0124 from the tree and W199, Q740,
          ADR 0124 from the ledger, which AGREE. The ladder counts are NOT taken here and are W199's declaration step's
Measured: NOTHING re-run at this declaration. Facts 1-4 and 6-10 are READ, at `4f21bba`, with file:line; fact 5's
          figures are Q735's (node 24.20.0, W196's tree `4659768`, the driver alone on a scheduler double) and the app's
          (its Host, node 26.11.1), cited, not re-taken. W199's declaration step re-takes Q735's on this tree before any
          `src/` edit (P15 decision 5)
```

## Why this plan, and why now

0.9.0 is released (`4f21bba`, tag `v0.9.0`, `origin/main` at it) and took the app's 10,000-item map from 599 s to 0.73 s.
P39's last item found, by its WALL and not by any count, that a `needs` reference read inside a `map` instance searches
every output of the node it names ([Q735](../questions/q735.md)); P39's retro (h) released 0.9.0 without it and asked the
app whether its flows read their own branch's nodes. **They do**: the app's `needs` editor offers every upstream task of the
node being edited, so a branch node naming an earlier node of its own branch is one pick away, and its target is a map of
10,000 items — where that read costs **34.8 s** on its Host against **0.73 s** without it. `"."` avoids the search only where
the named node is the reader's ONLY predecessor; a node two steps back has no workaround. The app asks for Q735 to be
scheduled, with a count in the gate like pass 2 #3's, rather than warn authors off a shape its editor offers.

## What fyflow-app asked, held against this declaration

Read at `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass2-followup.md` (read, not edited),
beside the reply it answers, `fyflow-orchestration.pass2.reply.md` §6.

| the app's clause | where it is answered |
|---|---|
| *yes, our flows read nodes of their own branch by id; the editor offers it; target 10,000 items* | fact 5; the whole plan |
| the Host table — 0.43 / 2.96 / 34.8 s at 1,000 / 4,000 / 10,000 items against 0.23 / 0.44 / 0.73 s with no `needs`; *the main thread is busy for the whole 34.8 s* | fact 5 — the same curve as Q735's driver-alone figures; W200 re-takes the driver's on the final tree (exit (2)) |
| *`"."` avoids it only where the named node is the reader's only predecessor; two steps back has no workaround* | fact 6; the exit artifact's *two steps back* shape |
| **the ask** — *a reference read inside a map instance should cost the same however many instances the map has, e.g. by finding the named node's output in the reader's own instance* | decisions 1-3; W199. **Accepted for EVERY case of the visibility rule** ((b)), not only the reader's own instance — with one stated limit: a read never costs LESS than its answer, and a reader in a SIBLING map is handed every output by `FD-V28` (fact 7, (e)) |
| *with a count in your gate like pass 2 #3's* | decision 4; (a); W199 — exact values at 2,000 / 8,000 items, below 6x, provoked |
| *we would rather not warn authors away from a shape the editor offers* | nothing warns: the spec text W199 writes states what a read costs, as `FD-C1`'s section 3 states the clone's |
| *your repro notes: taken* | the reply acknowledges; nothing here |

## Facts read at this declaration

**Fact 1 — the search.** `resolveReference` (`src/driver/driver.ts:4634-4691`) takes EVERY output the named node has
produced — `produced.get(t.node)`, one entry per task that settled it, which inside a `map` is one per instance — asks
`outputIsVisible` of each and sorts the survivors (`:4661-4663`):
`.filter((e) => outputIsVisible(this.regions, atNodeId, here, t.node, e.path)).sort((x, y) => compareBranchPaths(x.path, y.path))`.
A `one` reference returns the first survivor (`:4690`), an `all` one every survivor in that order (`:4689`); none, with a
conditional reference, is `ABSENT` or `[]` (`FD-C4`, `:4664-4671`), and without one `UnresolvedReference` (`FD-R3`,
`:4673-4682`). **One expression, two callers** (W42's extraction): a node's `needs` in `compose` (`:4605-4606`) and an
edge's in `resolveNeeds` (`:4750`, `:4774`) — the only two reads of `this.outputs()` in `src/`. **So a read costs O(the
named node's outputs)** however few are visible, and a map whose branch task reads an earlier node of its own instance costs
O(items²).

**Fact 2 — the predicate is a lookup in disguise.** `outputIsVisible` (`src/definition/regions.ts:511-536`) depends on the
reader and the target only through `sharedRegionDepth(regions, readerId, targetId)` (`:473-481`, `:518`) — the common prefix
of the two REGION CHAINS, a GRAPH fact (`regionChainOf`, `:397-411`, the walk `branchPathOf` makes) — and then on equality
of the first `d` segments of the two branch paths (`:526-534`). At depth 0 every output is visible (`:523`); a path with
fewer than `d` segments, either side, is visible to nothing (`:532`). **So the visible set of a node's outputs to a reader
is exactly the outputs whose `d`-segment prefix equals the reader's** — a key derived from the output's own path. And today
the depth is re-derived per OUTPUT: two `regionChainOf` walks inside every `outputIsVisible` call, which is Q735's profile
(`outputIsVisible` 36.8% self, the filter's callback 23.0%, `resolveReference` 11.4%, `regionChainOf` 10.8%).

**Fact 3 — the order, and that it has no ties.** `compareBranchPaths` (`driver.ts:718-735`) is segment-wise numeric, a
missing segment first; its comment records that no `visible` list has ever been mixed-depth (`:723-731`). A node's outputs
are one entry per task id (`outputs()`' `tasks` slot, below), and a task id is `<runId>:<nodeId>:<branchPath>:<attempt>`
(`src/driver/ids.ts:50-61`) with the driver dispatching attempt `0` at every site (`driver.ts:3775`, `:4819`, `:4941`) and
`ID-R4` refusing a settlement it did not dispatch — **so two entries of one node never share a path, the sort has no ties,
and `Array.prototype.sort`'s stability is not part of the answer**. Read, not run: W199 re-takes it.

**Fact 4 — where the index can grow.** `outputs()` (`driver.ts:4455-4479`) is CAUGHT UP from the records appended since its
last read (ADR 0121 rule 4, W195), each record's task re-merged through `effectiveOutcome` over that task's sub-log and
handed to `place` (`:4496-4533`) — **the ONE site every change to a node's entries passes**, in five cases: a first entry
for the node; an append (the common case); an insertion at a task's FIRST-RECORD position (a resolution after a
`user_action`, `:4529-4532`); a replacement in place (`:4515-4519`); and a removal (`:4500-4511`, reachable — a repeated
settlement event, W195's C4). The projection lives in `outputsCache` (`OutputsCache`, `:645-652`; the field `:4540`), LAZY:
`null` until a `needs` first asks, so a run declaring none never builds it (ADR 0040 rule 1's *the default is unchanged*,
held of the cost). **An index grown in `place` is caught up by the same catch-up, so it stays ONE source.**

**Fact 5 — the cost, measured by others.** [Q735](../questions/q735.md): the driver alone, a map whose branch is `work` then
`post` with `post` declaring `needs: { w: 'work', it: '.' }`, `task.running` (`attemptNumber` 1) before each settlement, the
queue walked by index — **673 ms / 20,492 ms / 96,919 ms at 2,000 / 8,000 / 16,000 items**, against **68 / 215 / 394 ms**
for the same flow with `post` reading a node with ONE output: 30x for 4x the items, then 4.7x for 2x. The app's Host,
`post` declaring `needs: { w: "work" }`: **0.43 / 2.96 / 34.8 s at 1,000 / 4,000 / 10,000 items**, against **0.23 / 0.44 /
0.73 s** with no `needs`. Neither re-taken here.

**Fact 6 — `"."` is not a workaround past one step.** `"."` composes what the edge carried (`compose`, `:4590-4592`), which
is the PREDECESSOR's result; a `post` whose branch is `work` → `mid` → `post` and which needs `work` has no form but the
reference. So *two steps back* is a shape the fix must hold, not a variant of *one step back*.

**Fact 7 — `FD-V28` decides the form, and a SIBLING map's reader always reads `all`.** `spec/flow-definition.md:2469`:
`"n"` is refused where the reader is outside a `map` region containing `n`, `["n"]` where it is not. A reader in a sibling
map shares no region with the target (depth 0), so it must write `["n"]` and is handed EVERY output of `n` — the corpus's
`reference-past-a-map-arity.flow.json` (`:2590`, *every instance receives all N at every arity pair*). **So a sibling-map
read's ANSWER is the whole list**: O(the target map's items) per read by what the reference asks for, and a sibling pair of
`n` and `m` instances costs O(n·m) in clones whatever the resolver does. What the index removes there is the per-read
predicate and SORT, not the answer. A `one` reference with SEVERAL survivors is still reachable at depth > 0 — a target in a
`fanout` nested inside the reader's instance (`FD-V28`'s *a fanout region is not this case*), where the first by path is
returned.

**Fact 8 — P39's counters cannot see it, and its observer was never asked.** `taskLog.visits` counts log RECORDS handed to
`effectiveOutcome` (`driver.ts:1538-1557`, ADR 0121 rule 7) and the fold's `FoldCounter` counts the accumulator's work;
`resolveReference` reads neither. `test/fold/map-cost.test.ts`'s header says its driver arm's `post` therefore reads a node
with ONE output. **Its iteration observer counts `Array.prototype.filter`**, so it WOULD see the search — on a shape the suite
does not drive. Proposal B (below) is written for exactly this.

**Fact 9 — the recorded rules the work bears on.**

| rule | what it says, read here | how this plan's shape keeps it |
|---|---|---|
| [ADR 0044](../decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md) rules 1-3 (`0044:90-119`) | visibility is *the two paths agree on the regions their chains share*; **rule 2: two predicates would be two sources that can disagree**; rule 3: segment-wise, never by string | **Not amended.** The predicate stays the DEFINITION (decision 2). The index's key and the predicate are ONE function in `regions.ts`, so they cannot disagree by construction, and a test holds the index's answer equal to filter-and-sort anyway. Segment-wise: the key is the first `d` SEGMENTS, so `1` and `10` stay distinct |
| [ADR 0040](../decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) rule 2 and its amendments (`0040:92-103` — ADR 0117, 0118, 0121) | what a node can reach is a PROJECTION; *computed rather than maintained*, because a maintained index is a second source ([Q43](../questions/q43.md)); ADR 0121's condition: references to the log's own records and nothing derived | **Amended again, by ADR 0124** (after ADR 0117, 0118 and 0121), under ADR 0121's condition carried one level: the index holds REFERENCES to `outputs()`' own entries, grouped by a key computed from each entry's own path — no conclusion, no merge, nothing the log does not say. Grown in `place`, so it cannot lag the projection |
| [ADR 0121](../decisions/0121-the-driver-keeps-a-per-task-view-of-its-log.md) rules 2, 4 and 7 | the per-task view; `outputs()` caught up; the driver's count a private field, never observable | the index is grown from that same catch-up; its counter a field of the private `outputsCache`, read by a cast, as `taskLog.visits` is |
| `RN-R13` (`spec/run-state.md:462`) | a run's retained footprint; `outputsCache` holds results BY REFERENCE, **~88 B an entry** since v0.30; the holder sets `{inputs, log, taskLog, outputsCache}` on a flow with a `needs` | **The index IS retained memory per run, for the run's life, and RN-R13 must name it**: one more reference per entry per depth read, plus a key per bucket. **No result held twice** (entries by reference). Placed INSIDE `outputsCache`, the holder sets and `DRIVER_FIELDS` do not move; the per-entry byte figure does, re-measured by W199 by RN-R13's own method (`v8.serialize`) |
| `FD-R3` / `FD-C4` (`flow-definition.md:2546`; [ADR 0042](../decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md) rule 4) | an unconditional reference with no visible output throws; a conditional one is `ABSENT` / `[]` | an empty bucket is the same empty list the filter produced, and the two arms after it are untouched |
| `FD-C1` (`flow-definition.md:1649`), section 3's *What `needs` costs* (`:1566-`), `AGENTS.md:447-470` | each key its own copy per read; the CLONE's cost stated and measured; **the search's cost stated nowhere** | W199 adds the search's cost — a read costs its answer — beside the clone's; `X6`'s five figures (`scripts/check-docs.mjs:763`) unmoved |
| [ADR 0037](../decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md) | what a branch receives and a join carries; its *what it costs* is the per-branch CLONE (`0037:158-`) | **Does not cover the reference search**; unmoved. Its deterministic join order is `compareBranchPaths`, which the index's order reuses |
| ADR 0014, `RN-R2`, ADR 0064 | the single append order; a stepped prefix equals a fold; frozen copies | **none moves**: no element, no `FoldInput`, no `RunState` cell, no checkpoint byte — the index is read-side, in the driver |

**Fact 10 — the census at this declaration.** Spec versions: `run-state.md` v0.31, `flow-definition.md` v0.45; next free
rule id `RN-R45`. Package `0.9.0` / `0.9.0`, scheduler pin 0.6.0, `CHECKPOINT_FORMAT` 1 (`npm run state`). `DRIVER_FIELDS`
at `test/driver/retention.test.ts:269-271` and `examples/l6.ts:14617-14620`, `outputsCache` on both; the retention
suite's alias claim types `outputsCache` as `{ byNode }` (`retention.test.ts:236-244`). `LATE_SUITES`
(`test/definition/l4-corpus.test.ts:427`), map-cost's seven cases (`:998`). `sharedRegionDepth` is also read by
`examples/l6.ts` (`:114`, `:14378`, `:14439`). The corpus holds no map NESTED in a map (nine flows hold a map; the nested
case is constructed in `test/driver/map-item.test.ts`) and ONE sibling map pair (`reference-past-a-map-arity`). `Q735`
is cited by this plan, P39, W197, `q186.md` and `test/fold/map-cost.test.ts`. `check:budget` passes; no row here edits the
always-read set.

## Scope

**In** — `resolveReference`'s lookup and the index it reads (W199); the one key function in `src/definition/regions.ts`
(W199); a count of entries examined per read in the gate (W199) and the shapes it holds; `spec/flow-definition.md`
(section 3's cost note, `FD-C1`'s test text) and `spec/run-state.md` (`RN-R13`'s retained term), `spec/README.md`,
`AGENTS.md` (W199); `examples/map-cost.ts`, an L6 block, the reply (W200); ADR 0124.

**Out** — what any reference RESOLVES TO (decision 5): no composed payload, no order, no `FD-R3` / `FD-C4` arm moves;
ADR 0044's predicate as the definition; **[Q186](../questions/q186.md)** — the CLONE of a large value per read inside a
map ((c), deferred; the reply names it); the answer's own size — a sibling-map `all` read is O(its answer) by `FD-V28`
(fact 7); `FD-V28` itself; a public API (none moves, (d)); `FoldInput`, `RunState`, a checkpoint, `CHECKPOINT_FORMAT`; the
version bump, the push and the publish ((d), the maintainer's).

## Decisions taken at this declaration

*Each follows from a fact or an answer named beside it; what they leave open is (e).*

1. **The index** ((a), (b); facts 2 and 4). Per named node and per SHARED DEPTH `d` a reader asks at: the node's
   entries grouped by their `d`-segment path prefix, each group in `compareBranchPaths` order; **depth 0 is one list per
   node**, the whole node, in that order — sorted once and kept sorted, never re-sorted per read. Built for a `(node, d)`
   on its first read from the node's current entries and from then on grown in `place`, at each of fact 4's five cases,
   so it is caught up exactly when `outputs()` is. A read derives `d` (a graph fact — per read in O(chain), or memoised
   per `(reader, target)`; W199's choice, stated), takes the reader's prefix, and reads its group: **the size of its
   answer** — the group's first entry for a `one` reference, the group for an `all` one. A reader path with fewer than `d`
   segments reads the empty group (fact 2's `:532`).
2. **ONE definition of visibility** (ADR 0044 rule 2; fact 2). The `d`-segment key is ONE function in
   `src/definition/regions.ts`, and `outputIsVisible` is RESTATED through it with no change of behaviour — held by
   `test/definition/sibling-regions.test.ts` unmoved. The predicate stays the definition; the index is its extension
   computed once. **A test holds the index's answer equal to the filter-and-sort** — the same entries, the same order,
   the same object chosen for `one` — at every read of every valid corpus flow driven on a double, and on constructed
   cases the corpus lacks: a NESTED map (a reader in the inner instance reading the outer instance's node, and its own
   inner instance's), a SIBLING map, a `fanout` inside an instance read by `one` with several survivors, twelve or more
   items (the two-digit segment), a resolution after `user_action` (`place`'s insertion), a repeated settlement
   (`place`'s removal), and a resumed driver (the index rebuilt from a caught-up projection). The old expression is kept
   IN THE TEST as the oracle (section 5 rule 4) — not in `src/`.
3. **Retained, and named** (fact 9's `RN-R13` row). The index lives inside `outputsCache` and holds `outputs()`' own
   entry objects BY REFERENCE: `DRIVER_FIELDS` and the holder sets do not move, the alias claim extends to the index
   (every entry it reaches `===` a `byNode` entry), and `RN-R13`'s per-entry figure is re-measured and restated — the
   run-life cost of a read that costs its answer. Lazy as `outputsCache` is: a run with no node reference builds none.
4. **The count** ((a); proposal B). A private counter of ENTRIES EXAMINED per read, a field of `outputsCache` read by a
   cast, never public (ADR 0121 rule 7's two constraints): **pinned EXACT at 2,000 and 8,000 items** in
   `test/fold/map-cost.test.ts`, each value derived from the counted code and the inputs the case drives, for *one step
   back*, *two steps back*, *nested map* and *sibling map*; ratio ~4x, bound 6x. **It names what it does NOT count**: the
   comparisons that find a sorted position, a splice's element moves, the depth's graph walk, and the clone of each answer
   (Q186's cost) — and W199 TIMES each subject once at both sizes, a reading in its Record, never a gate entry (Q179).
   The provocations restore the filter, the per-read sort and the per-output depth, one site each (sentence E), each
   asserting it ran and the exact clauses it reddens, **each reading its count against a ceiling and stopping** — a
   restored search at 8,000 items is ~20 s of wall unbounded (fact 5). The suite's iteration observer runs each new
   subject too: it counts `filter`, so it is a SECOND observer of the restored search independent of the counter.
5. **What does NOT move**: every value a reference resolves to — the composed payload of every dispatch and the `ctx.needs`
   of every predicate, byte-identical on every corpus flow under the drains `test/driver/log-view.test.ts` uses; the order
   of an `all` answer; `FD-R3`, `FD-C4`; ADR 0014's append order, `FoldInput`, `RunState`, `snapshot()`, a checkpoint,
   `CHECKPOINT_FORMAT` 1; `RN-R2`; the public surface. **The invariant holds**: the index is the driver's read-side
   structure over its own projection, and run state is still a pure fold of the log.
6. **One ADR**: ADR 0124 (W199) — *a reference read costs its answer: the driver indexes a node's outputs by the prefix its
   readers share*, amending ADR 0040 rule 2 again (after ADR 0117, 0118 and 0121) under ADR 0121's condition, and naming ADR 0044 as unamended.
   ADR 0125 reserved, expected unused.
7. **Each changed public surface is stated where it changes** (P33 decision 7 … P39 decision 8): **none**. The cost of a
   read and the retained term move; the API does not. Hence 0.9.1 ((d)).

### Stop-and-asks — (a)-(e) ANSWERED by the maintainer, 2026-10-22, all as recommended ((e) as (e1))

**(a)-(d) are the maintainer's, each answered as recommended.** The work-item rows below are written for those answers.
**(e) ANSWERED 2026-10-22, (e1) — as recommended** (relayed to W199 mid-item, recorded here at its record step): the
sibling-map cost case gives the READING map a FIXED arity and runs the TARGET map at 2,000 / 8,000 items, so ~4x, bound 6x,
holds; the EXACT count is pinned too, and it is what turns red when the per-read filter or sort is restored (W199: a
restoration that ticks the count — one that ticks nothing is seen by neither observer, asserted as a control); the spec text
states the n·m case, both maps growing, as the price of the answer itself. W199 fixed the reading arity at THREE.
**(e) was found writing this declaration and was NOT answered at it**: W199 may start — its declaration step, the index, the
equality test, three of the four cost shapes — and **its sibling-map COST case waits on (e)**; W200 waits on W199.

| | the question | recommended | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **Scope and shape** | **ONE plan, two items.** W199: the index in `resolveReference` (decision 1), grown from `outputs()`' catch-up; ADR 0044's predicate the definition, held equal over every corpus flow plus nested- and sibling-map cases (decision 2); the count EXACT at 2,000 / 8,000 items for four shapes, ~4x bound 6x, provocations bounded (decision 4); ADR 0124; the spec text naming the cost; `gate:item`. W200: the exit artifact — the L6 block (node and deno), the repro re-taken, the reply, P40's Record and retro; `gate:full` | **Document the price** in `AGENTS.md` (Q735's second closing road): the app's 34.8 s stays, and its editor offers a shape we tell authors to avoid. **Fix only the same-instance case**: (b)'s alternative |
| **(b)** | **Which cases the index covers** | **EVERY case of the visibility rule** — every shared depth, depth 0 included (a reader sharing no region, a SIBLING map's reader among them, which is a per-read search and sort today) | **The same-instance case only** (the app's example): depth 0 and the deeper cases keep the search, so the definition is answered two ways by depth — two roads where one is enough |
| **(c)** | **[Q186](../questions/q186.md)** — a LARGE value cloned per read inside a map | **OUT of scope, stays deferred**; the reply names it beside its workaround (name a small producer, or project in the map's `needs`) | **In scope**: a second cost with a different mechanism (the clone, `JP-R11`'s per-key copy) and a decided *nothing warns*; it would reopen ADR 0040 rule 6 |
| **(d)** | **Which release** | **0.9.1 — a patch, no API change.** The bump, push and publish are the maintainer's, after the plan, only when the maintainer says so; **no item bumps or publishes** | **0.10.0**: a minor for a change with no surface |
| **(e)** | **The SIBLING-map cost shape — ANSWERED (e1), 2026-10-22.** (a) names *sibling map* among the four shapes held at ~4x, bound 6x. By fact 7 a sibling reader's answer is the WHOLE target list (`FD-V28` forces `["n"]`), so a sibling pair with BOTH maps at `n` items composes `n²` entries whatever the resolver does — 16x between 2,000 and 8,000 by its answer, which no index can bring under 6x | **The READING map at a FIXED arity (W199 states it, e.g. 3) and the TARGET map at 2,000 / 8,000**: the work then scales through the list the index holds, ~4x, and the EXACT pin — entries examined equal to the answer, plus the depth-0 list's upkeep — is what turns red when the per-read filter or sort is restored (the ratio alone would not: today's per-read cost is `n log n`, ~4.7x). The spec text states the n·m case as the answer's price, `FD-V28`'s, beside Q186's | **Both maps at `n`, the count pinned EXACT with NO ratio claim** for that shape (the answer is quadratic by definition, and the pin still discriminates the search); or **hold the ratio on entries examined BEYOND the answer** — a derived quantity, a second number to keep true |

## Work items

**P39 retro's proposal B, ADOPTED for this brief** — B′, C, D′ (with P38's sixth clause) and E carried UNCHANGED, E with
the reading P39's section 4 (c) records (*one function reached from two clauses is two probes; the cut is per CALL SITE*),
and the two brief sentences widened:

- **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
  snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the change
  adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads that floor
  (`check:docs:selftest`, `check:budget:selftest`) as well.*
- **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its confirming
  gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final tree.*
- **D′ — the census sites AND the readers in the plan's row**: every file that READS the surface the item changes, found
  by a grep for each changed name over `src/`, `scripts/`, `examples/` and `index.ts`; a grep for each PREMISE the change
  falsifies; a grep for a SIBLING of each member the change adds. **Every row touching `AGENTS.md` owns the WHOLE of it**,
  and a parenthetical in an `Owns` cell is a forecast of where in the file, not a limit.
- **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two, the
  probe is COMPOUND, and a Record counts it as killing neither clause until each is re-cut alone and killed* — **per CALL
  SITE**: `resolveReference`'s two callers are two probes.

**The brief sentences, every item's**: ***each item's Record states its readers' overlap***; ***a claim of ABSENCE is
shown able to fail by a control on the same observer, taken AFTER the event it denies — and each CLAIM carries its own
verdict, never another claim's***; and ***a COST check names what its counter does NOT count; its item derives the count's
EXACT value on the sizes it runs, and TIMES its subject once at those sizes — a reading in the Record, not a gate entry
(Q179)***. *(P39's third sentence — an owner element a resume's replay feeds is TAKEN AT REST — has no subject here: no
element is added, decision 5. The copy claim's sentence binds one place: an index entry is the projection's own object,
and a composed payload is still its own copy per key per read — provoked by an ALIAS, over a NESTED result, read both
ways.)*

**D′ applied — the sites each row moves.**

- **The readers of the changed expression**: `resolveReference` (`driver.ts:4634`) and its two callers, `compose`
  (`:4605-4606`) and `resolveNeeds` (`:4750`, `:4774`); `outputs()` (`:4455`) and `place` (`:4496`); `OutputsCache`
  (`:645-652`); `outputIsVisible` and `sharedRegionDepth` (`regions.ts:473`, `:511`) and every reader of either —
  `src/driver/driver.ts:22` and `examples/l6.ts:114`, `:14378`, `:14439` (unmoved unless a signature moves).
- **The siblings of the per-read search**: every `.filter(` and `.sort(` in `src/driver/` that runs per read
  (`:574-575`, `:754`, `:2652`, `:3090`, `:3177` at this declaration) — each re-read and classed per settlement, per
  read or per call; only the per-read reference search is this plan's, and any other found O(run) per read is a
  stop-and-ask, not an edit.
- **`RN-R13`**'s text and `spec/run-state.md` v0.32; `DRIVER_FIELDS` (`retention.test.ts:269`, `examples/l6.ts:14617`)
  and `NOT_RUN_STATE` (`examples/run-flow.ts`) — **predicted unmoved** (decision 3); the retention suite's alias claim
  (`retention.test.ts:236-244`) extended to the index.
- **`spec/flow-definition.md`** v0.46 — section 3's *What `needs` costs* and `FD-C1`'s test text; `spec/README.md`'s two
  rows; **`X6`**'s five figures (`check-docs.mjs:763`) unmoved; `AGENTS.md`'s *What it costs* (`:447-470`) and its
  `RN-R13` sentence (`:1743-1748`).
- **`LATE_SUITES`** (`l4-corpus.test.ts:427`) and the counted suites' counts, for each new suite and case; map-cost's
  membership line (`:998`).
- **`X10`** (`examples/README.md`) — W200's L6 block; `CONSTRUCTION_PRICED` (`examples/l6.ts`) if `examples/map-cost.ts`
  gains a construction.
- **The PREMISES**: *the driver arm's `post` therefore reads a node with ONE output* (`test/fold/map-cost.test.ts`'s
  header) — W199; Q735's *searches every output* (`q735.md`, resolved by W199) and its dated note in `q186.md`; *O(items)
  per read* in the 0.9.0 reply §6 (outside the tree, answered by W200's reply); `"."` as the workaround (`AGENTS.md`, if
  it says so — W199's grep).
- **The always-read set**: no row edits `CLAUDE.md`, `doc/workflow.md` or `doc/concept.md`, except W200's plan-close
  bookkeeping in `doc/workflow.md` (P39's W197 precedent, declared before the edit).

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W199 | **The reference index — a read costs its answer**; ADR 0124; decisions 1-6; (a), (b), (e) for the sibling shape; facts 1-9 | `src/driver/driver.ts`, `src/definition/regions.ts`, `test/driver/**`, `test/definition/**` (`sibling-regions.test.ts` read and run, `l4-corpus.test.ts` counted), `test/fold/map-cost.test.ts`, `spec/flow-definition.md` (section 3, `FD-C1`'s test text), `spec/run-state.md` (`RN-R13`), `spec/README.md`, `AGENTS.md`, `doc/decisions/0124-*` | (e), for its sibling-map cost case only | `gate:item`; L2 the index's answer equal to the filter-and-sort at every read of every valid corpus flow and the constructed cases of decision 2, `===` the same entries in the same order; the payloads byte-identical to `4f21bba`'s; L1 the restated predicate unmoved; the count EXACT at 2,000 / 8,000 for the four shapes and below 6x, the iteration observer below 6x, each restored search red at its ceiling; `RN-R13`'s figure re-measured; the subjects timed once |
| W200 | **The exit artifact on real workers, the reply, P40's close** — exit (2) and (3); `gate:full` | `examples/l6.ts`, `examples/README.md`, `examples/map-cost.ts`, `examples/flows/**`, `examples/workers/**`, `test/definition/l4-corpus.test.ts` (if a census moves); `doc/workflow.md` (the plan-close bookkeeping only, declared); outside this repository, `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass2-followup.reply.md` | W199 | **`gate:full`** (the plan's last item); L6 in node 24 and deno, threaded and inline; `X10` moved by its block alone |
| W201 | *reserved, expected unused* | | | |

**The two rows share `examples/l6.ts` only through W199's `DRIVER_FIELDS` forecast (unmoved) and `l4-corpus.test.ts`, so
they are SERIAL, never concurrent** (`doc/workflow.md` section 7 rule 2). **No item edits `scripts/check-register*.mjs`,
`scripts/state.mjs` or `doc/questions/README.md`**, so `gate:item` is W199's and `gate:full` W200's. **Questions reserved
per item**, so no two take one: W199 Q740-Q744, W200 Q745-Q749. **W199 closes Q735** at its record step if its gate holds
Q735's closing condition (a count in the gate at two sizes; the reader's own-instance read independent of the map's size).

**The reply to fyflow-app goes where P39's did** — `../fyflow-app/.scratch/mu-upstream-adoption/requests/`, as
`fyflow-orchestration.pass2-followup.reply.md`. **W200 writes it**, from this plan and the two Records, once its own gate
is green: the ask accepted for every case of the visibility rule ((b)); the shape (decision 1) and the count in the gate;
the driver re-taken beside Q735's and the app's figures; the sibling-map limit — a read costs its answer, and `FD-V28` makes
a sibling reader's answer the whole list ((e)'s answer); **Q186 named**, out of scope and deferred, with its workaround
((c)); `"."` no longer needed as a workaround; 0.9.1 a patch with no API change, **its release state MEASURED at the time
of writing** (npm, JSR, tags, `origin/main`) and the bump, push and publish the maintainer's ((d)).

**Each item writes its own file from its row when it starts** (`doc/work-items/TEMPLATE.md`), as W194-W197 did — no item
file is written at this declaration, so `npm run state`'s two derivations agree. What the row cannot carry is below: each
item's OUTPUTS, and what its declaration step RE-TAKES before any `src/` edit (P15 decision 5). Every item's last re-take is
the ladder counts, the baseline this plan did not take.

**W199 — outputs**: ADR 0124; the key function in `regions.ts` and `outputIsVisible` restated through it; the index inside
`outputsCache`, built per `(node, d)` on its first read and grown in `place` at each of fact 4's cases; `resolveReference`
reading it; the private counter of entries examined; the equality suite (decision 2) with the pre-change expression as its
ORACLE; the four cost shapes and their provocations in `test/fold/map-cost.test.ts`, the header's *ONE output* sentence
corrected; `spec/flow-definition.md` v0.46 (the search's cost beside the clone's, `FD-C1`'s test text), `spec/run-state.md`
v0.32 (`RN-R13`'s index term and its figure), `spec/README.md`'s two rows; `AGENTS.md`'s *What it costs* and its `RN-R13`
sentence. **Re-takes**: Q735's driver table (fact 5) on this tree, node 24 and deno, each size a fresh process, and a CPU
profile at 8,000 items before any edit; fact 3's no-ties claim (every `buildTaskId` site and `ID-R4`); fact 4's five
`place` cases, each reached by a corpus or constructed drive; fact 7's `FD-V28` reading against the validator; the
per-read `.filter(`/`.sort(` census (D′); `RN-R13`'s ~88 B by its own method before and after; whether any test reads
`outputsCache`'s shape beyond `byNode`.

**W200 — outputs**: the L6 block (exit (3)) — a map of at least twelve items on a threaded and an inline pool, its branch
`work` → `mid` → `post` with `post` reading `work` (`one`, two steps back) and `mid` (`one`, one step back), a nested map's
inner reader, and a sibling map's `all` reader; each composed payload equal to the predicate's selection over the run's own
outputs, each claim its own verdict; `examples/map-cost.ts` gaining the `needs` column (exit (2)) at 2,000 / 8,000 / 16,000
items, node and deno, beside Q735's; `X10` moved by the block alone; the reply; P40's Record and retro. **It places no
logic**: a counter or `src/` site it cannot read is an Exception named before the edit. **Re-takes**: the four cost shapes'
counts and walls in node, deno and chromium on W199's tree; facts 5 and 8 on the final tree; the release state, measured.

## Predictions, written before the items that test them

1. **W199 moves no assertion's expected VALUE in any lane** — every composed payload and `ctx.needs` is unchanged
   (decision 5). What moves is counts, `RN-R13`'s figure, and the spec and `AGENTS.md` cost text.
2. **The driver alone at 8,000 items with `post` reading `work` falls from Q735's 20.5 s to within 2x of the same flow
   reading a one-output node** (215 ms there) on the machine Q735 ran on; at 16,000 from 96.9 s to under 1 s.
3. **`DRIVER_FIELDS` and the holder sets do not move; `RN-R13`'s per-entry figure rises** — by one reference and a share of
   a bucket key per depth read, under ~2x its ~88 B on a one-depth map.
4. **The sibling-map `all` read stays O(its answer) per read** and its run O(n·m) when both maps scale; the provocation that
   restores the per-read sort is visible to the EXACT pin and not to the ratio (fact 7, (e)).
5. **No item moves `CHECKPOINT_FORMAT`, `FoldInput`, `RunState`'s shape, `snapshot()`'s value or any public signature** — an
   item that finds it must is a stop-and-ask.
6. **W200 moves `X10` by its block alone, and no existing L6 row.**

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q735](../questions/q735.md) | a reference read inside a map instance searches every output of its node — this plan's subject; `open` | W199 (closes it) |
| [Q186](../questions/q186.md) | a reference to a LARGE value inside a map — the per-read clone, unchanged here and named in the reply ((c)); `deferred` | — |
| [Q179](../questions/q179.md) | wall time is not a reproducible cost measure for this gate — why the count is the gate and the timings are readings; `icebox` | — |
| [Q206](../questions/q206.md) | the sibling-region visibility ADR 0044 answered — the shape decision 2's sibling-map case re-asserts; `resolved` | — |
| [Q43](../questions/q43.md) | the maintained second source ADR 0040 rule 2 was written against — decision 3's condition is its answer for the index | W199 (ADR 0124 cites it) |

## Record

*Written 2026-10-22 over W200's final tree, the tree held still before it. Every figure is read from the two items' own
files; none is re-measured here. Ids are bare text, as in P33's-P39's Records.*

**The items.** Each row is its own file's Record, which covers its declaration step, its provocations and its readers.

| item | built | spec | closed / raised | exceptions and rulings | the readers | L1-L5 / L6 after | confirming gate |
|---|---|---|---|---|---|---|---|
| **W199** `a2c7ec1` | `visibilityKey` and `outputIsVisible` restated through it; the index inside `outputsCache` — per node and shared depth, the node's own entries grouped by key in branch-path order, built on the first read, grown in `place` at its five cases, the depth memoised per (reader, target); `resolveReference` reading it at both call sites; the private counter `outputsCache.examined`; the equality suite with the pre-change filter-and-sort as its ORACLE; the cost subject EXACT at 2,000 / 8,000 (`2n`, `2n`, `7n`, `4n`) with its provocations; ADR 0124 | flow-definition v0.46 (section 3's search cost, `FD-C1`'s test text); run-state v0.32 (`RN-R13`) | **Q735** / — | one stop-and-ask, ANSWERED (a): `visibilityKey` an ADDITIVE public export (W191's `innermostMapOf` precedent), 0.9.1 still a patch, Q221 iceboxed. (e) answered (e1) mid-item | conformity 2 SHOULD, 5 NIT, no BLOCKER (its own 312-run differential: 0 differences); adequacy 65 mutations, five real survivors (`place`'s replacement and in-order insertion unreached, the edge site's reader id), each re-cut and KILLED. **Overlap 1** | 89 / 2155; 2805 / 228 | `gate:item` EXIT 0, selftests 1,055.0 s |
| **W200** `8c646c2` | the `W200 exit` L6 block — a map of twelve, threaded and inline, node and deno: every reader's payload equal to ADR 0044's predicate over the run's own outputs AND the worker's value by hand, four shapes each its own claim with a control, the whole payload's keys, `work` read at two depths; `examples/map-cost.ts`' four reference subjects beside W199's BEFORE; the README's copies; the reply | none | — / — | one, declared before the edit: `doc/workflow.md`'s plan-close bookkeeping | conformity 1 SHOULD (the predicate route moves with the shared key — the HAND route is the independent one), 4 NIT; adequacy 38 mutations, no SHOULD, 3 NIT. 5 probes, 5 KILLED. **Overlap 1** | 89 / 2155; **2815 / 230** | **`gate:full` EXIT 0**, 11/11 self-tests, 3,710 s |

**Both confirming gates were green on their FIRST run, one command each** (sentence C); firefox and webkit NOT RUN in
either. **W199's first `npm run gate` was EXIT 1 on chromium**: its new cost subject pushed the one-page L1-L5 bundle past
the runner's 60 s limit (W199's *What broke*), fixed by running each observer only under the provocations it exists to
see. **One question closed (Q735), none raised. One stop-and-ask answered (W199's), one exception for the plan's
bookkeeping (W200). The readers' overlap, every Record stating its own: 1, 1.**

### The exit artifact, measured

| the exit sentence's clause | what was built and measured | verdict |
|---|---|---|
| (1) `test/fold/map-cost.test.ts`, green in `gate:full` and in all three L0-L5 runtimes, holding as a clock-free COUNT the entries a reference read examines, EXACT at 2,000 and 8,000 items for four shapes and below 6x; each provoked red by restoring the search (checked in, bounded) | `outputsCache.examined` **4,000 / 16,000** (`2n`) one step back, **4,000 / 16,000** (`2n`) two steps back, **14,000 / 56,000** (`7n`) nested, **8,000 / 32,000** (`4n`) sibling of three slots — every value DERIVED, every ratio 4.00x; the iteration observer below 4x on each; the filter restored (counted and uncounted), the per-read sort restored and the depth per output, each red on the clauses it names, an uncounted sort the stated limit asserted as a control; node, deno and chromium | **met** |
| (2) Q735's driver measurement re-taken on the final tree in node 24 and in deno at 2,000 / 8,000 / 16,000 items, beside Q735's | `examples/map-cost.ts`, each size a fresh process: one step back **701 / 22,033 / 99,029 → 65 / 211 / 402 ms** (node), **474 / 12,006 / 64,208 → 78 / 267 / 505** (deno) — Q735's own 673 / 20,492 / 96,919 reproduced by W199 before the edit; two steps back 1,310 / 41,622 / 176,628 → **81 / 274 / 515**; nested 18,251 / 290,697 → **176 / 635** (1,259 at 16,000); sibling 52 / 178 → **48 / 150** (288) | **met** |
| (3) one block in `examples/l6.ts`, node 24 and deno, threaded and inline, a map of at least twelve: every `needs` payload equals ADR 0044's predicate over the run's own outputs, for the four shapes | the `W200 exit` block, ten claims over two runs, 2815 / 230, 0 failed in both runtimes. **Under one reading**: since W199 the predicate is restated through the index's own key function, so it is not independent of the code under test — the block holds every payload ALSO to the worker's value by hand, which is what turned red on the shared-key provocation (W200's conformity reader, finding 1; its P3) | **met**, with the hand route stated as the independent one |
| `npm run gate:full` EXIT 0 — the LAST item runs it | W200, one command on the final tree after the readers' fixes: the ladder, then 11/11 self-test lanes ok, `check:register:selftest` included, 3,710 s | **met** |

**The counts across the plan**, each from the items' gate tables: L1-L5 **88 / 2142 → 89 / 2155** in node, deno and
chromium; L6 **2805 / 228 → 2815 / 230** in node and deno; `check:docs` 51 `run` snippets, unmoved; `check:spec` C4 45;
spec/flow-definition **v0.45 → v0.46**, run-state **v0.31 → v0.32**, the others unmoved; next free rule id `RN-R45`,
unmoved; `DRIVER_FIELDS`, `NOT_RUN_STATE`, the holder sets, `CHECKPOINT_FORMAT`, `FoldInput`, `RunState` and
`snapshot()` unmoved; the package surface +1, `visibilityKey`, additive; `doc/concept.md` untouched.

**What the plan answered — yes, for every case of the visibility rule.** A `needs` read inside a map costs its answer —
one entry for `"n"`, the visible entries for `["n"]` — through an index over the driver's own projection, keyed by the one
function ADR 0044's predicate is now stated through (ADR 0124), with no second definition of visibility and no value any
reference resolves to moved. **The stated limit**: a read never costs less than its answer, and `FD-V28` makes a SIBLING
map's reader's answer the whole list, so two maps of `n` and `m` instances compose `n·m` entries — the answer's price,
written in `spec/flow-definition.md` section 3 beside Q186's clone. **fyflow-app's request** accepted for every case
((b)); the reply is written (`../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass2-followup.reply.md`).
**What 0.9.1 ships**: no API change; one function added to the package surface.

**Predictions, scored against the items' Records.**

| | prediction | verdict | evidence |
|---|---|---|---|
| 1 | W199 moves no assertion's expected VALUE in any lane | **HOLDS** — counts and cases moved, no value | W199 Record |
| 2 | the driver at 8,000 items within 2x of a one-output read (215 ms); at 16,000 under 1 s | **HOLDS** — 223 ms at W199, 211 at W200, against 216; 442 / 402 ms at 16,000 | W199, W200 Records |
| 3 | `DRIVER_FIELDS` and the holder sets do not move; `RN-R13`'s figure rises under 2x | **HOLDS** — 87.5 / 87.6 / 90.7 → 95.8 / 93.9 / 97.1 B an entry, ~13 B per indexed entry | W199 Record |
| 4 | the sibling `all` read stays O(its answer); the restored sort visible to the EXACT pin, not the ratio | **HOLDS** — `7n` against `4n`, still 4x | W199 Record |
| 5 | no item moves `CHECKPOINT_FORMAT`, `FoldInput`, `RunState`, `snapshot()` or a public signature | **HOLDS for every signature — one function ADDED**, the stop-and-ask W199 put and the maintainer answered (a) | W199 Record |
| 6 | W200 moves `X10` by its block alone, and no existing L6 row | **HOLDS** — 2805 / 228 → 2815 / 230 | W200 Record |

**The D′ paragraph's census predictions**, scored the same way: **right at every site it named** — `resolveReference`'s
two callers, `outputs()` and `place`, `OutputsCache`, `RN-R13` and its retention alias, `spec/README.md`'s rows, `X6`
unmoved, `LATE_SUITES` and the counted suites, `X10` at W200 alone, the PREMISES (the cost suite's *ONE output*
sentence, Q735, Q186's note). **Short at one**, found before its edit: `index.ts` re-exports `regions.ts` WHOLE, so the
one key function decision 2 placed there is public — W199's stop-and-ask. `CONSTRUCTION_PRICED` did not move:
`examples/map-cost.ts` already declared its construction.

**Questions**: **closed [Q735](../questions/q735.md)** (W199, by ADR 0124 and the count in the gate); **raised none.**
[Q186](../questions/q186.md) and [Q221](../questions/q221.md) gained dated notes at W199; Q186 stays deferred, Q221
iceboxed. `npm run q -- --where status=open` lists **none** (the register holds no open question; Q580 and Q581, open at P39's close, are resolved).

**Handed on**, each with its owner:

| hand-off | from | owner | where it is recorded |
|---|---|---|---|
| **0.9.1** — the version bump (a `chore:` commit, as 0.9.0's `4f21bba`), the push, and the publish to npm and JSR | (d) | **the maintainer** — decided at (d), *only when the maintainer says so* | this Record |
| the reply to fyflow-app | P40's *The reply* | **done** — W200 | W200's Record |
| [Q186](../questions/q186.md) — a large value cloned per read inside a map | (c) | **deferred**, no owner | Q186 |
| the byte copies `C:/tmp-w199`, `C:/tmp-w200`, and the session scratchpad's probes | both items | **the maintainer** — left in place, outside the repository; nothing reads them | each item's Record |

## Retro

*Pass 3 ran on 2026-10-22 over W200's final tree, by W200's author as the plan's last item. Every figure is read from the
two items' Records; this retro re-ran no harness. **No routing here needs the maintainer** (section 8); none is acted on
outside the record step's four files and W200's one declared exception.*

### 1. The asks

| item | widenings (rule 6), each answered | design, each answered | reader defects | raised / closed |
|---|---|---|---|---|
| P40's declaration | — | (a)-(e), all as recommended ((e) as (e1), relayed mid-W199) | — | — |
| W199 | — | **1** — `visibilityKey` public, answered (a) | 7 (2 SHOULD, 5 NIT, the conformity reader's) and five real test gaps (the adequacy reader's) | **Q735 closed** |
| W200 | — (one exception declared before the edit) | — | 5 (1 SHOULD, 4 NIT) and 3 NIT | — |
| **P40** | **0** | **6 answers, all as recommended** | **no BLOCKER; every one acted on or declared** | **0 raised, 1 closed** |

### 2. The `Owns` and the census sites — B′, C, D′ and E held

**D′ was FOLLOWED and held at every site the plan named**; the one it did not name — `index.ts` re-exporting a module
whole, so a function decision 2 placed there is public — was found by W199's conformity reader before the release and
put as a stop-and-ask. **B′ held. C held**: one confirming gate per item, each green on its first run. **E held**: W199's
provocations cut per call site; W200's one clause each.

### 3. The readers, and the overlap

| item | conformity | adequacy | overlap | ordinal |
|---|---|---|---|---|
| W199 | 2 SHOULD, 5 NIT, no BLOCKER | 65 mutations, five real survivors, each re-cut and killed | **1** — a restoration that ticks nothing (an uncounted sort, finding 1 / note 2) | 119th |
| W200 | 1 SHOULD, 4 NIT, no BLOCKER | 38 mutations, no SHOULD, 3 NIT | **1** — the payload compared key by key (NIT 2 / NIT 1) | 120th |

**Every Record states its overlap**, the fifth plan running. **Two measurements, both inside section 6's 0-4 band. The
ordinal is a hundred and twenty, so the next is the HUNDRED-AND-TWENTY-FIRST** — carried into `doc/workflow.md` by W200's
declared exception. *W200's brief to its adequacy reader ASKED which shared-key mutations the hand route catches; its
answer overlaps the conformity reader's finding 1 and is NOT counted — a shared priming, section 6's caveat.*

### 4. Rules followed that failed, and the rung (pass 3 rules 3 and 5)

| candidate | followed? | caught by | verdict |
|---|---|---|---|
| **(a) an oracle that moved with the code under test** — P40 decision 2 made visibility ONE function (ADR 0044 rule 2) and W199's equality suite kept the PRE-change expression as its oracle (section 5 rule 4, followed); W200's L6 block, written after, read the PUBLIC predicate — which W199 had restated through the index's own key | **FOLLOWED** — rule 4 says a fixture must not come from the code under test, and the block's oracle is a function, not a fixture | W200's conformity reader (its provocation C: every predicate list `[]`); the block's second, HAND route went red | **One occurrence.** Kin to section 5 rule 4, one level out: *an oracle reached through the package names which `src/` functions it shares with its subject*. Below pass 3 rule 2's bar; recorded, not proposed. The hand route, written beside it from the brief's *each claim … a control*, is what held |
| **(b) a suite's wall is a share of a budget no rung names** — the chromium lane runs the WHOLE L1-L5 bundle in one page under 60 s | **FOLLOWED** — W199 ran its suite in node and deno first (B′) | W199's `npm run gate` before its readers, chromium RED | **One occurrence** (W197's suite fit; W199's did not). The coordinator's brief to W200 named the 60 s as binding, and W200 added nothing under `test/`. Recorded, not proposed |
| **(c) a count's observers under every provocation** — P39's (a) answer, a second observer per subject | **FOLLOWED** at W199, and it COST: every observer under every provocation on every shape was ~65 s of suite | W199's chromium lane | **The answer is W199's**: a counted provocation is judged on the counter, an uncounted one on the observer it exists for — every verdict kept, the suite halved. A refinement of P39 (a), not a rule |
| **(d) a claim of absence shown able to fail by a control on the same observer** | **FOLLOWED** at W200 — each shape's control a COUNTED field | the adequacy reader (T4-T7 red) | **Held** |

**Pass 3 rule 5 over P40's defects**, by what caught them: **a rung in `gate`** — chromium's 60 s (W199); **the
authors** — W199's declaration step (the nine re-takes, before any edit); **the conformity readers** — W199's seven,
W200's five; **the adequacy readers** — W199's five survivors, W200's three NITs. **No rung would have caught** the
oracle sharing the subject's function: no command asks where an oracle's code comes from — that is section 6's reader.

**The flaky rows ([Q599](../questions/q599.md))**: none went red in P40. No note.

### 5. The scheduler

**No S entry raised. No contract found broken.** The block's threaded and inline pools ran the same flow to the same
values.

### 6. Proposals (pass 3 rule 4), ranked

**A. Recommended for the workflow: NO CHANGE to a rule.** B′, C, D′ and E held; every Record stated its overlap; no
BLOCKER reached a Record; section 4's three candidates are one occurrence each.

**B. Carried UNCHANGED for the next plan's author** — P39's proposal B as P40 adopted it (B′, C, D′, E and the brief
sentences). Section 4 (a) and (b) are recorded beside it as one-occurrence observations, not added to it.

### 7. Refusals, and what this retro changed

- **A check over `doc/` — considered and NOT proposed; it is the 39th refusal, P2-P40.** P40's text defects were an
  oracle called independent when it was not (W200's finding 1), *a resume from every rest point* over two drains (W199's
  NIT 3), two figures for one measurement (W199's NIT 5), and a sentence about sizes two shapes were not run at (W200's
  NIT 5) — each found by a reading of the code beside it; no script reads that. **No other ledger row is re-raised.**

| file | why |
|---|---|
| this plan | the Status line; this Record and Retro |
| `doc/workflow.md` | W200's declared exception: the Status line's count (FORTY, P1-P40), section 6's ordinal (a hundred and twenty; the HUNDRED-AND-TWENTY-FIRST next), the ledger's first row (39 times, P2-P40) |

`README.md`, `doc/questions/**` and `doc/decisions/**` carry nothing more: ADR 0124, ADR 0040's dated note, Q735's
closing and the notes on Q186 and Q221 are W199's.

**Ids.**

- **Issued**: W199, W200; ADR 0124; no Q; no S entry.
- **Reserved and unissued, SKIPPED and never reissued** (section 3): W201 CLOSED unissued, as expected; Q740-Q744 SPENT
  (W199's), Q745-Q749 SPENT (W200's); ADR 0125 SKIPPED.

**The next plan starts at W202, Q750 and ADR 0126.** The next S id is S13; the next plan id is P41.

### 8. Stop-and-asks for the maintainer

**None.** The release is decided — (d): 0.9.1, a patch, bumped, pushed and published by the maintainer *only when the
maintainer says so* — and is a hand-off in the Record, not a question. Proposal B is carried unchanged, as P40 adopted it.
