# P41 — What does a reference to a large value cost inside a map, and can every instance read one shared copy?

**Status:** declared 2026-10-22 — on `6957919` (the tree clean, `main` at 0.9.1), answering [Q186](../questions/q186.md) and fyflow-app's *pass 2 follow-up 2*; facts 1-10 read at this declaration; stop-and-asks (a)-(e) ANSWERED by the maintainer 2026-10-22, all as recommended; **(f) and (g) found writing this declaration and ANSWERED by the maintainer the same day — (f) as (f2), (g) as (g1), the recommendation**; W203 waits on W202.
**Question this plan answers:** *can a `needs` reference read inside a `map` instance — a node's output, in either form, or
`"$payload"` — cost ONE copy of what it names however many instances read it, rather than one copy per instance per key,
with no node able to write to what another node reads wherever JavaScript can enforce it — and the gap where it cannot
named and pinned — and without moving any value a reference resolves to?*
**Exit artifact:** *on the final tree: (1) a cost case in `test/fold/map-cost.test.ts` or a sibling suite, green in
`npm run gate:full` and in all three L0-L5 runtimes, holding as a CLOCK-FREE COUNT the copies the driver makes for
reference reads, PINNED to an exact derived value at 2,000 and 8,000 items for the fetch-then-map shape (a `fetch` task
whose result holds the item list, a map over it, the branch task declaring `needs: { item: "$item", all: "fetch" }`), for
the same shape read through `["fetch"]`-style `all` and `"fetch?"` conditional forms where `FD-V28` allows them, and for
`"$payload"` — **one copy per distinct output read, EQUAL at both sizes**; each provoked red by restoring the per-read clone
(checked in, bounded so it cannot exhaust the heap or the chromium lane's 60 s); (2) the maintainer's driver measurement
(fact 4) re-taken on the final tree in node 24 and in deno — the driver alone at 1,000 / 2,000 / 4,000 items, time and peak
heap over baseline — beside 579 ms / 2,123 ms / 22,903 ms and 178 / 468 / 1,445 MB (a measurement, not a gate entry —
[Q179](../questions/q179.md)); (3) one block in `examples/l6.ts`, green in node 24 and in deno, on a threaded and an
inline pool, in which every instance of a map of at least twelve items receives the fetched value equal to `fetch`'s result
by hand, an INLINE worker writing into its referenced value fails that attempt with a `TypeError`, a THREADED one writing
the same does not and reaches no sibling, a predicate writing into its referenced value stops the run with that
`TypeError` ((g)), each claim with its control; and `npm run gate:full` EXIT 0 — the LAST item runs
it (workflow v0.29).*
**Reserves:** W202-W204 (W204 expected unused), Q750-Q759, ADR 0126-0127 (ADR 0127 expected unused); no S id

```
Question: what does a reference to a large value cost inside a map, and can every instance read one shared copy?
Items:    W202 (one shared deep-frozen copy per output read and for "$payload"; ADR 0126; the spec change; the count),
          W203 (the exit artifact on real workers, the reply to fyflow-app, P41's Record and retro)
Reserves: W202-W204 (W204 expected unused), Q750-Q759, ADR 0126-0127 (ADR 0127 expected unused)
Raises:   no question at this declaration; no S entry. (f) and (g) were stop-and-asks, answered, not register questions
Baseline: ids derived by `npm run state` at this declaration — P41, W202, Q750, ADR 0126 from the tree and W202, Q750,
          ADR 0126 from the ledger, which AGREE. The ladder counts are NOT taken here and are W202's declaration step's
Measured: fact 5's freeze probe, node 24.20.0, one command. Everything else is READ, at `6957919`, with file:line; fact
          4's figures are the maintainer's (node 24, the driver alone on AGENTS.md section 12's scheduler double, one size
          per process) and the app's (its Host, node 26.11.1), cited, not re-taken. W202's declaration step re-takes the
          maintainer's on this tree before any `src/` edit (P15 decision 5)
```

## Why this plan, and why now

0.9.1 took Q735 off the app's Host: a map of 10,000 items whose branch reads its own instance fell from 34.8 s to 2.6-3.1 s,
linear. **The next wall is Q186's**, which P13's W46 decided as *nothing warns* and P38 (l) and P40 (c) kept deferred: a
reference from inside a map instance to a node OUTSIDE it clones that node's whole result once per instance per key. The
app's likeliest flow — *fetch a list, then map over it*, the branch reading the list beside its item — costs **1.6 s and
160 MB at 1,000 items, 18.0 s and 800 MB at 4,000** on its Host, and it cannot guard it: its editor offers every upstream
node in `needs`, and nothing before a run says whether a result is 100 bytes or 100 KB. It already refuses `"$payload"`
inside a map (its ADR-0018) for the same reason; `"fetch"` gets through. **Q186's own row named the condition that would
force it — *an author reporting a flow whose cost surprised them* (`spec/flow-definition.md:1638`) — and that is this
request.** The maintainer answered (a)-(e) on 2026-10-22, all as recommended: every instance shares one deep-frozen copy.

## What fyflow-app asked, held against this declaration

Read at `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass2-followup-2.md` (read, not edited).

| the app's clause | where it is answered |
|---|---|
| *Q735 is gone on our Host* — 0.43 / 2.96 / 34.8 s → 0.57 / 1.23 / 2.6-3.1 s at 1,000 / 4,000 / 10,000 items, against 0.29 / 1.02 / 2.27 s with no `needs`; *our earlier no-`needs` line ran one Task per item, the wrong line* | acknowledged in the reply (W203); P40's Record stands |
| *fetch-then-map*: `needs: { item: "$item", all: "fetch" }`, fetch's result ~100 KB — 1.6 s / 160 MB at 1,000 items, 18.0 s / 800 MB at 4,000 | fact 4 — the same curve as the maintainer's driver-alone figures; W203 re-takes the driver's on the final tree (exit (2)) |
| *we can't guard it ourselves: the editor offers every upstream node; nothing before a run says a result's size* | (a) — and the reason sharing is unconditional: an opt-in recreates the trap |
| **the ask** — *a read inside a map instance of a node outside it should not cost a copy of that node's whole result per instance; e.g. an instance could share one frozen copy, since `OR-R2` already freezes results* | decisions 1-4; W202. **Accepted** for every node reference, both forms, and for `"$payload"` ((a), (b)). **One correction to its premise**: `OR-R2` CLONES a result and does not freeze it (fact 5); what the driver freezes is what it hands out, shallowly. The shared copy is a new, deep-frozen one ((c)) |
| *we'd want a count in your gate like Q735's* | decision 5; W202 — exact at 2,000 / 8,000 items, equal at both, provoked |
| *the sibling-map cost: taken* | nothing here: `FD-V28`'s n·m is the answer's price (P40 (e)); under this plan each of those entries is a shared copy, not a clone per read |

## Facts read at this declaration

**Fact 1 — the per-read clone, at every reference site.** `resolveReference` (`src/driver/driver.ts:4755`) takes the
visible entries from the index (W199) and returns **`cloneValue(e.result)` per entry for `all`, `cloneValue(visible[0].result)`
for `one`** (`:4811-4814`) — one `structuredClone` per key per read. Its two callers: a node's `needs` in `compose`
(`:4680`), and an edge's in `resolveNeeds` (`:4866`). The node-less forms clone too: in `compose`, `"."` (`:4712`),
`"$payload"` (`cloneValue(runPayload)`, `:4716`) and `"$item"` (`:4723`); in `resolveNeeds`, `"$payload"`
(`cloneValue(this.runPayload())`, `:4886`) and `"$item"` (`:4893`). `runPayload()` (`:4824`) is the header's
`entryPayload`, held for the run. `resolveNeeds` returns `Object.freeze(out)` (`:4913`) — `ctx.needs` is SHALLOW-frozen,
so a predicate's nested write lands on its own copy today. `FD-R4` composes at `start()` from the caller's OWN payload,
before a header exists (`compose`'s `runPayload` parameter, `:4680`; the comment at `:4706-4708`).

**Fact 2 — the rule that requires the clone, and the refusal this plan reverses.** `spec/flow-definition.md:1553-1555`:
*"**Each key gets its own copy**, which is `JP-R11`'s invariant applied to the one edge that is not a fan-out edge: no two
nodes ever receive the same object"*; the same at `:527` (`"$item"`, *its own copy per key per read*, `FD-C1`, `FD-C3`);
[ADR 0040](../decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 6 (`0040:141-146`); [ADR 0117](../decisions/0117-a-reference-may-name-what-reached-the-run.md) rule 4 (`0117:52-56`,
*one frozen copy shared by every instance is refused*). **[P38](p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md)
(l) refused exactly this plan's mechanism** (`p38:240`, carried into `spec/flow-definition.md:1645-1647`): *against
`JP-R11` and ADR 0040 rule 6, and a worker that mutates would throw on one road and not on another.* **That is now the
maintainer's decided consequence ((c)), not an objection.** `JP-R11` (`spec/join-policy.md:580`) states the invariant in its
HEADLINE — *"no two nodes ever receive the same object"* — about what an OPENER hands its branches; its copies are not moved
((c)), its headline sentence is (decision 3).

**Fact 3 — why N copies are live at once.** A map enters every instance in one step (`driver.ts:4126`, one `enter` per
item), so every branch task is dispatched — its payload composed, each reference cloned — before any settles. Each config is
held by the scheduler's pending queue until a worker takes it (the maintainer's double holds them in `queue`, as a real
scheduler holds its pending tasks). **So the peak is N × the referenced value**, and the time is superlinear through the
collector, not through any search (P40 removed that). [Q186](../questions/q186.md)'s W197 note: **10.8 s at 8,000 items,
89% of it `structuredClone`**.

**Fact 4 — the cost, measured.** **The maintainer**, on 0.9.1 `main`, node 24, the driver alone on AGENTS.md section 12's
scheduler double, the fetch-then-map shape (fetch's result ~100 KB holding the items; the branch `needs: { item: "$item",
all: "fetch" }`), one size per process (the session scratchpad's `perf/q186.ts`):

| items | time | peak heap over baseline |
|---|---|---|
| 1,000 | 579 ms | 178 MB |
| 2,000 | 2,123 ms | 468 MB |
| 4,000 | 22,903 ms | 1,445 MB |

3.7x for 2x the items, then 10.8x for 2x. **The app's Host**: 1.6 s / 160 MB at 1,000, 18.0 s / 800 MB at 4,000. Neither
re-taken here.

**Fact 5 — what freezing can protect, MEASURED.** `OR-R2` (`spec/outcome-record.md:161`) deep-copies a result with
`structuredClone` and does NOT freeze it; the frozen values the driver hands out are copies made at the read surface
(`freezeInput`, `driver.ts:965-975`; `frozenCopy`, `:603-608`), and shallow. **`Object.freeze` is not total over what a
result may hold** — node 24.20.0, one command at this declaration: `Object.freeze(new Uint8Array(2))` THROWS
`TypeError: Cannot freeze array buffer views with elements`; a frozen `Map` still takes `set` (size 0 → 1), a frozen `Date`
still takes `setTime`, and a frozen `ArrayBuffer`'s bytes are still written through a view. `OR-R11`
(`spec/outcome-record.md:248`) says the structured-clone algorithm's built-in types CROSS `OR-R2`'s clone, so a result may
hold every one of them. **So "deep-frozen" cannot make every result unwritable** — (f), answered (f2): every output is
shared whatever it holds, frozen where freezing can, and the rest is a named, pinned gap (decision 1).

**Fact 6 — what a worker receives, by pool.** The envelope `{ settings, input, transform? }` (`driver.ts:5007`) is a fresh
object per dispatch and `input` is `compose`'s fresh `out` (`:4688`): only the VALUES under reference keys would be shared.
An INLINE pool hands the worker the object `addTask` was given; a THREADED pool hands a clone (CLAUDE.md, W186 M3, W192 M3).
A worker is an ES module, so strict: a write into a frozen object throws `TypeError` — on an inline pool only. A worker's
throw is a failed attempt, retried by the node's `retryPolicy`, the task ending `failed` (optional) or `user_action` (not)
by [Q17](../questions/q17.md)'s rule — **so "that attempt fails" is an attempt, and the TASK's end is the retry policy's**.

**Fact 7 — what a predicate receives, and the L6 claims that say the opposite.** A decision predicate gets `ctx.needs` from
`resolveNeeds` — one resolver with a node's ([ADR 0041](../decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)
rule 4, *`ctx.needs.f` and `payload.f` mean one thing*). A predicate is asked to be pure and nothing enforces it
([ADR 0002](../decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) rule 4,
[Q9](../questions/q9.md)); a predicate that THROWS stops the run with its error (`spec/flow-definition.md:1085`). **W192's
L6 block asserts both writes SUCCEED and reach nothing**: `PI_ECHO` writes `deep.mark` into the `"$payload"` and `"$item"`
keys `settings.touch` names on an INLINE pool, and `w192Touch` writes `needs.it.deep.mark` and `needs.run.deep.mark` on its
edge (`examples/l6.ts:12118-12141`); the claims (`:12505-12507`, `:12528-12534`) read `touched-by-…` on the writer's own
object and `original` everywhere else. Under (c) the `"$payload"` writes throw — `"$item"`'s do not ((b)). So those
claims MOVE with W202's behaviour change, and `gate:item` runs L6 (`check:wiring` `G7`) — **W202 owns them**, not W203.

**Fact 8 — the L2 claims that pin per-read identity.** Each asserts two reads are DIFFERENT OBJECTS — the expected value
(c) reverses: `test/driver/needs.test.ts:165-168` (`a.run !== b.run` across two map instances' reference key);
`test/driver/decision-context.test.ts:357-359` (`a.earlier !== b.earlier`, one copy per key per edge) and `:461-463` (the
`all` form per entry per edge); `test/driver/run-payload.test.ts:85` (the entry's `"$payload"` and `"."` keys and the
caller's object, three objects — `run !== own` and `run !== payload` stay true, as `"."` keeps its clone and the shared copy
is not the caller's), `:278` and `:282` (two `"$payload"` keys, and two nodes' reads, distinct at every depth). Unmoved by
(b): `needs.test.ts:199-200` (two `"."` keys), every `"$item"` claim (`test/driver/map-item.test.ts`), `JP-R11`'s
(`test/driver/map.test.ts:282-361`).

**Fact 9 — the recorded rules the work bears on.**

| rule | what it says, read here | how this plan's shape keeps or moves it |
|---|---|---|
| ADR 0040 rule 6 (`0040:141-146`); ADR 0117 rule 4 (`0117:52-56`); P38 (l) | each key its own copy; one frozen shared copy refused | **Superseded in part, by ADR 0126**: a reference's value is ONE deep-frozen copy shared by every reader; the invariant becomes *no node can write to what another node reads*. `"."` and `"$item"` keep rule 6 as written ((b)) |
| `JP-R11` (`spec/join-policy.md:580`), ADR 0037 | an opener's branches each get their own copy | **Copies unmoved** ((c)); the headline's *no two nodes ever receive the same object* is scoped to what an opener hands, with a dated pointer to ADR 0126 (decision 3) |
| `FD-C1` / `FD-C3` (`flow-definition.md:1686`, `:1737`), section 3's cost note (`:1580-1648`), `:527`, `:1553-1555`, `:1645-1647` | the per-key copy; the cliff's table (one copy per instance); P38 (l)'s refusal | **Re-stated** at v0.47 (W202): what a reference hands, what it costs (one copy per output read), the table re-taken, P38 (l)'s sentence dated and reversed |
| `RN-R13` (`spec/run-state.md:463`), [ADR 0046](../decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md) | the retained footprint; `outputsCache` holds results BY REFERENCE, never twice; the header's entry payload once | **A new term**: one deep-frozen copy of each output a reference has READ, and of the entry payload where a `"$payload"` reader has read it — for as long as its entry: `outputsCache` lives for the run (`driver.ts:4495`, never released), so for the run's life, dropped where `place` replaces or removes the entry |
| `OR-R2`, `OR-R11` (`outcome-record.md:161`, `:248`) | a result is cloned at settlement; what crosses a clone | **Unmoved**: the stored record stays the driver's own unfrozen clone ((c)). OR-R11 is what made (f) a question, and is what the named gap is made of ((f2)) |
| ADR 0041 rule 4 | one resolver for a node's and an edge's `needs` | **Kept** ((g1)): an edge's reference is the same shared copy a node's is |
| ADR 0002 rule 4, [Q9](../questions/q9.md) | a predicate is asked to be pure; nothing enforces it | **Unmoved, and now partly enforced** ((g1)): a predicate's write into a freezable referenced value throws and stops the run — the second behaviour change (decision 8) |
| ADR 0014, `RN-R2`, `FoldInput`, `RunState`, `CHECKPOINT_FORMAT` 1 | the single append order; the fold; frozen read copies | **None moves**: the shared copy is read-side, in the driver; nothing new is appended, folded or checkpointed |
| `X6` (`scripts/check-docs.mjs:763-848`) and its probes (`scripts/check-docs-selftest.mjs:227`, `:309`) | the spec's cost table and AGENTS.md's paragraph agree, both ways; anchored on `> **71x,` and *The mechanism makes one copy* | **Moves with the table** — W202 re-takes it, so the anchors and the two probes move with it (W202's declared exception) |

**Fact 10 — the census at this declaration.** Spec versions: `flow-definition.md` v0.46, `run-state.md` v0.32,
`join-policy.md` v0.23, `outcome-record.md` v0.21. Package `0.9.1` / `0.9.1`, scheduler pin 0.6.0, `CHECKPOINT_FORMAT` 1,
L6 2815 / 230 (`npm run state`). `outputsCache` built lazily at `driver.ts:4495`, its `examined` counter W199's
(`:4811`); `DRIVER_FIELDS` at `test/driver/retention.test.ts` and `examples/l6.ts` (W199's census). Q186 is cited by this
plan, P13, P38, P40, W46, W197, W199, `spec/flow-definition.md` section 3 and `test/fold/map-cost.test.ts` (`npm run refs --
Q186` is W202's re-take). `check:budget` passes; no row here edits the always-read set except W203's plan-close bookkeeping.

## Scope

**In** — the value a node reference (`"n"`, `["n"]`, either with `?`) and `"$payload"` hand a reader, at both sites (a
node's `needs`; an edge's, (g1)); the shared deep-frozen copy and where it is held (W202); a count of reference copies in
the gate (W202); `spec/flow-definition.md` (section 3's reference rules and cost note, `FD-C1`, `FD-C3`), `spec/run-state.md`
(`RN-R13`'s new term), `spec/join-policy.md` (`JP-R11`'s headline scoped), `spec/README.md`, `AGENTS.md` (W202); the moved
L2 and L6 identity claims (W202); `examples/map-cost.ts`, an L6 block, the reply (W203); ADR 0126.

**Out** — `"."` and `"$item"` ((b): already one reader's own); `JP-R11`'s branch-entry and item copies; `OR-R2`'s clone and
the stored record; `FD-R4`'s composition at `start()` (it composes from the caller's own value before a header exists and
hands nothing to a worker — keeps its per-read clone, decision 2); an ASK's `asked` element (keeps its own copy of what
reached it, `RN-R37`, P35 (f)); a GATE's input (`decideGate` clones, `driver.ts:4416`); a size WARNING (Q186's *nothing warns*
stays decided — the cost it was about is removed instead); `FD-V28` and the sibling-map n·m; a public API (none moves);
`FoldInput`, `RunState`, a checkpoint, `CHECKPOINT_FORMAT`; the version bump, the push and the publish ((d), the
maintainer's).

## Decisions taken at this declaration

*Each follows from a fact or an answer named beside it; they leave nothing open — (f) and (g) are answered.*

1. **One shared copy per output read** ((a), (b), (c); facts 1, 3). The first time any reference reads an output entry,
   the driver makes ONE deep copy of its `result`, deep-freezes it, and keeps it beside the entry — inside `outputsCache`,
   beside W199's index; every later read of that entry, by any reader, at any depth, in either form, hands that copy. A
   `one` reference hands the copy; an `all` reference hands a FRESH array per read whose elements are the entries' copies
   (the array is the reader's own: O(the answer) references, no clone). `ABSENT` and `[]` (`FD-C4`) and `FD-R3` are
   untouched. **Always** — no option, no per-reference flag ((a)) — **and whatever the output holds** ((f2)). A primitive,
   `null` and `undefined` are handed as they are, as `cloneValue` does today.

   **The freeze, per (f2)** (fact 5): the walk recurses through plain Objects and Arrays and freezes each; it freezes
   what can be frozen and never throws. **ArrayBuffer views with elements — typed arrays and `DataView` — are shared
   UNFROZEN** (`Object.freeze` throws on them, so the walk does not try); **`Map`, `Set`, `Date` and `ArrayBuffer` are
   frozen SHALLOWLY**, which does not stop `set`, `add`, `setTime` or a write through a view. **The spec states that a
   referenced value is READ-ONLY**: enforced where JavaScript can enforce it, and the worker's (or predicate's)
   responsibility where it cannot. **It names the gap**: an INLINE worker writing into a shared `Map`, `Set`, `Date` or
   binary value changes what every other reader of that output sees; threaded pools are unaffected, since `postMessage`
   clones. **Each type in the gap is PINNED by a test**, so the gap is recorded rather than accidental. *The maintainer's
   reason for (f2) over (f1): the largest results — file contents, images, buffers — are likely exactly the unfreezable
   ones, so (f1) would have left Q186 unsolved for the values most likely to be big.*
2. **`"$payload"`: one deep-frozen copy of the header's `entryPayload` for the run** ((b), (c)), made at the first
   `"$payload"` read in a run or after a resume, handed at both sites. **`FD-R4` keeps its clone** of the caller's value
   (Out): it runs before the header and its composition reaches no worker.
3. **The invariant, restated** ((c)). From *no two nodes ever receive the same object* to ***no node can write to what
   another node reads***, for a reference's value — **where freezing can enforce it, with decision 1's named gap where it
   cannot** ((f2)): a referenced value is READ-ONLY, and in the gap that is the reader's responsibility. ADR 0126 states
   it, supersedes ADR 0040 rule 6 and ADR 0117 rule 4 IN PART (their per-key copy, for node references and `"$payload"`;
   `"."` and `"$item"` keep it) and reverses P38 (l)'s refusal by name; `JP-R11`'s copies are unchanged and its headline
   sentence is scoped to an opener's branches with a dated note. **The observable changes, two** ((c), (g1)): a worker on
   an INLINE pool that writes into a freezable value it received through a reference throws `TypeError` and that attempt
   fails (fact 6) — a THREADED worker writes into its own clone, as before; and a decision PREDICATE that writes into a
   freezable nested value of its `ctx.needs` throws `TypeError`, which stops the run (fact 7) — against ADR 0002 rule 4,
   which already asked it not to. In the gap, neither throws: an inline worker's write into a shared `Map`, `Set`, `Date`
   or binary value reaches every other reader of that output (decision 1).
4. **The stored record is untouched** ((c)). `OR-R2`'s clone stays the driver's own, unfrozen; `outputs()`' entries, fold
   inputs, `state()`, `snapshot()`, a checkpoint and every other surface hand out exactly what they do now. The shared copy
   is a SECOND copy of each output a reference reads, retained as long as its entry (fact 9's `RN-R13` row) — the price of
   the decision, named in `RN-R13`, and measured by `RN-R13`'s own method (`v8.serialize`).
5. **The count** (the app's ask; P40's precedent). A private counter of the copies made for reference reads — a field of
   `outputsCache` read by a cast, as `examined` is, never public (ADR 0121 rule 7's two constraints): **pinned EXACT at
   2,000 and 8,000 items** for the fetch-then-map shape — `one` (`"fetch"`), `all` where `FD-V28` makes it the form, `?`,
   and `"$payload"` — each value derived from the counted code, and **equal at the two sizes**. **It names what it does
   NOT count**: `"$item"`'s per-instance clone (one ELEMENT, `JP-R11`'s cheap end), `"."`'s, the deep-freeze walk, an
   `all` array's allocation, and `OR-R2`'s settlement clone. The provocation restores the per-read clone at each call site
   (sentence E: `compose`'s and `resolveNeeds`' are two probes; a node reference and `"$payload"` are two clauses), each
   asserting it ran and the exact clauses it reddens, **each bounded** — the counted case reads a SMALL fetched value, since
   the count does not depend on the value's size, so a restored clone costs neither heap nor the chromium lane's 60 s
   (P40 retro (b): W199's first gate was 65 s on chromium). The suite's iteration observer, where it applies, is a second
   observer only under the provocation it exists for (W199's refinement).
6. **What does NOT move**: every value a reference resolves to — the composed payload of every dispatch and the `ctx.needs`
   of every predicate, DEEP-EQUAL on every corpus flow under the drains `test/driver/log-view.test.ts` uses; the order of an
   `all` answer; `FD-R3`, `FD-C4`; ADR 0014's append order, `FoldInput`, `RunState`, `snapshot()`, a checkpoint,
   `CHECKPOINT_FORMAT` 1; `RN-R2`; the public signatures. **What moves is IDENTITY and WRITABILITY** — the claims fact 7 and
   fact 8 list, each re-stated from the spec, never from output (section 5 rule 1). **The fold's invariant holds**: the copy is the
   driver's read-side structure over its own projection, and run state is still a pure fold of the log.
7. **One ADR**: ADR 0126 (W202) — *a reference's value is one frozen copy shared by every reader*. ADR 0127 reserved,
   expected unused.
8. **Each changed public surface is stated where it changes** (P33 decision 7 … P40 decision 7): **no signature; TWO
   BEHAVIOURS** — the inline worker's write of decision 3, and the predicate's ((g1)); plus the named gap ((f2)), which is
   not a change: such a write already reached only the writer's copy, and now reaches every reader. Hence 0.10.0 ((d)).

### Stop-and-asks — (a)-(g) ANSWERED by the maintainer, 2026-10-22

**(a)-(e) are the maintainer's, each answered as recommended.** **(f) and (g) were found writing this declaration and
ANSWERED the same day: (f) as (f2) — NOT the recommendation, with the framing decision 1 records — and (g) as (g1), the
recommendation.** Nothing waits on the maintainer: W202 may start.

| | the question | answered / recommended | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **Whether sharing is an option** | **ANSWERED (a1)**: sharing ALWAYS applies — no option, no per-reference flag. The consumer cannot know a result's size before a run, so an opt-in recreates the trap | an option on the driver, or a per-reference marker in the document — each leaves the app's editor offering the expensive shape by default |
| **(b)** | **What is shared** | **ANSWERED (b1)**: node results read by a reference, `one` and `all` forms (each with or without `?`), AND the `"$payload"` token. `"$item"` and `"."` are already one reader's own and are unchanged | node references only (`"$payload"` keeps the cliff P38 (l) named its largest instance); or every token including `"$item"` (a copy of one element, no cost to remove) |
| **(c)** | **The mechanism and the invariant** | **ANSWERED (c1)**: ONE deep-frozen copy per output, made lazily at first read, held beside `outputsCache`'s index and released with its entry (`RN-R13`, ADR 0046); the stored record (`OR-R2`'s clone) untouched and unfrozen; every surface unchanged; for `"$payload"` one deep-frozen copy of the header's `entryPayload` for the run. The invariant becomes *no node can write to what another node reads*; threaded pools unaffected (`postMessage` clones); an INLINE worker writing a referenced value throws `TypeError` and that attempt fails. Supersedes the per-key copy in part: ADR 0126 and a spec bump | freeze the stored record in place (no second copy, but every surface that hands the record out would hand a frozen object — a change to `outputs()`, fold inputs and the checkpoint's view); or copy-on-write proxies (a worker's writes succeed, at a `Proxy` per read) |
| **(d)** | **Which release** | **ANSWERED (d1)**: **0.10.0** — a behaviour change for an inline worker that mutates referenced input. The bump, push and publish are the MAINTAINER's and are NOT part of P41's items | 0.9.2 — a patch for a change a consumer's worker can observe |
| **(e)** | **How the items run** | **ANSWERED (e1)**: one after another as subagents, each committed, nothing pushed | — |
| **(f)** | **A result freezing cannot protect** (fact 5). A value may hold a `Map`, `Set`, `Date`, `ArrayBuffer` or a typed array (`OR-R11`): `Object.freeze` THROWS on a typed array with elements, and leaves the other four writable — so (c)'s *deep-frozen* is unimplementable for them as written, and sharing them breaks *no node can write to what another node reads* | **ANSWERED (f2)** — recommended was (f1). **Every output read by a reference is shared, whatever it holds**: the deep-freeze recurses over plain Objects and Arrays and freezes what can be frozen; ArrayBuffer views with elements (typed arrays, `DataView`) are shared UNFROZEN; `Map`, `Set`, `Date` and `ArrayBuffer` are frozen shallowly, which stops none of `set`, `add`, `setTime` or a write through a view. The spec states a referenced value is READ-ONLY — enforced where JavaScript can, the worker's (or predicate's) responsibility where it cannot — and NAMES the gap: an INLINE worker writing into a shared `Map`, `Set`, `Date` or binary value changes what every other reader of that output sees; threaded pools unaffected. **Each type in the gap PINNED by a test.** The maintainer's reason: the largest results — file contents, images, buffers — are likely exactly the unfreezable ones, so (f1) would have left Q186 unsolved for the values most likely to be big | **(f1)** share an output only when every object in it is a plain `Object` or `Array`, any other keeping today's per-read clone — the invariant total, the cost kept for exactly the binary values most likely to be large. **(f3)** refuse such a result where a reference reads it (a run-time stop for a value `OR-R11` lets cross today) |
| **(g)** | **An EDGE's `needs` and a predicate's write** (fact 7). (b) names *references*, and an edge's `needs` is one: by ADR 0041 rule 4 (*one resolver*) a predicate's `ctx.needs.f` is the same shared copy a worker's `input.f` is. Then a predicate writing into a nested referenced value — today a silent write to its own copy — THROWS, and a throwing predicate STOPS THE RUN (`flow-definition.md:1085`). The maintainer's (c) named the inline worker's change and not this one | **ANSWERED (g1), the recommendation: edges share too**, one resolver kept (ADR 0041 rule 4); a predicate's write into a freezable nested referenced value now throws, which stops the run — the SECOND behaviour change (decision 8), against ADR 0002 rule 4; W192's predicate claim (`l6.ts:12532-12534`) moves with the worker's | **(g2)** an edge keeps its per-read clone: two resolutions for one reference — ADR 0041 rule 4 amended, `ctx.needs.f` and `input.f` equal in value and different in writability — and a decision on a large value inside a map keeps the cliff |

## Work items

**P39 retro's proposal B, as P40 adopted it and P40's retro carried it UNCHANGED** — B′, C, D′ (with P38's sixth clause)
and E, E per CALL SITE:

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
  SITE**: `compose`'s and `resolveNeeds`' are two probes, and a node reference and `"$payload"` two clauses at each.

**The brief sentences, every item's**: ***each item's Record states its readers' overlap***; ***a claim of ABSENCE is
shown able to fail by a control on the same observer, taken AFTER the event it denies — and each CLAIM carries its own
verdict, never another claim's***; ***a COST check names what its counter does NOT count; its item derives the count's
EXACT value on the sizes it runs, and TIMES its subject once at those sizes — a reading in the Record, not a gate entry
(Q179)***; and, from P40's retro (a) and (b), carried as observations: ***an oracle reached through the package names which
`src/` functions it shares with its subject*** (a shared copy compared with `===` to another read proves sharing, not the
VALUE — every value claim also holds the hand-written expected value), and ***a new suite's wall is a share of the
chromium lane's 60 s***.

**D′ applied — the sites each row moves.**

- **The readers of the changed expressions**: `resolveReference` (`driver.ts:4755`) and its two callers, `compose`
  (`:4680`) and `resolveNeeds` (`:4866`); the `"$payload"` arms (`:4716`, `:4886`) and `runPayload()` (`:4824`);
  `outputs()` (`:4494`) and `place` (`:4535`), where an entry is replaced or removed and its copy must go; `OutputsCache`
  (`:647`). **Unmoved, re-read**: the `"."` and `"$item"` arms (`:4712`, `:4723`, `:4893`), `decideGate`'s clone
  (`:4416`), the `asked` element's (`:5071`), the envelope (`:5007`).
- **The siblings of the per-read clone**: every `cloneValue(` and `structuredClone(` in `src/` (`driver.ts:605`, `:734`,
  `:2392`, `:3894`, `:4014`, `:4084`, `:4126`, `:4416-4424`, `:4712-4723`, `:4813-4814`, `:4886-4893`, `:5007`, `:5071`,
  `:5808` at this declaration) — each re-read and classed per settlement, per dispatch, per read or per call; only the
  reference reads and `"$payload"` are this plan's, and any other found per read inside a map is a stop-and-ask, not an edit.
- **The writers into a worker's input**: every worker under `examples/workers/**`, every inline worker source in
  `examples/l6.ts` and `test/**`, and every predicate in the corpus and the suites that writes into what it received —
  re-taken by W202, since each one that writes into a referenced value now throws on an inline pool (fact 7 found one
  worker and one predicate; a grep at this declaration found no writer under `examples/workers/**`).
- **The identity claims**: fact 8's L2 list and fact 7's L6 claims; `DRIVER_FIELDS` (`test/driver/retention.test.ts`,
  `examples/l6.ts`) and `NOT_RUN_STATE` (`examples/run-flow.ts`) — **predicted unmoved** if the payload's copy lives inside
  `outputsCache` (decision 1's holder; W202's choice, stated); the retention suite's alias claim extended — every shared copy
  is NOT a log record's `result` (it is the second copy `RN-R13` names), and no copy is held twice.
- **`spec/flow-definition.md`** v0.47 — `:527`, `:1553-1555`, the cost note (`:1580-1648`) with its table re-taken and its
  *one copy per instance* prose, `:1645-1647`, `FD-C1`, `FD-C3`; **`X6`**'s anchors and probes with it; `spec/run-state.md`
  v0.33 (`RN-R13`); `spec/join-policy.md` v0.24 (`JP-R11`'s headline only); `spec/README.md`'s rows. `AGENTS.md`: the
  reference table, *What it costs* (`:461-470`), the `"$payload"` table's *what it is* and *what it costs* rows (`:501`,
  `:508`), the `RN-R13` sentence, and every line saying a referenced value is the reader's own.
- **`LATE_SUITES`** (`test/definition/l4-corpus.test.ts`) and the counted suites' counts, for each new suite and case.
- **`X10`** (`examples/README.md`) — W202's moved W192 claims and W203's block; `CONSTRUCTION_PRICED` (`examples/l6.ts`) if
  `examples/map-cost.ts` gains a construction.
- **The PREMISES**: *nothing warns* and *the threshold waits on an author whose reference cost surprised them*
  (`q186.md`'s note; `flow-definition.md:1627-1638`) — W202 closes Q186 with the cost removed rather than warned about;
  *each its own copy* in the comments at `driver.ts:4704-4708`, `:4807-4810`, `:4884-4885`; *one frozen copy shared by every
  instance was refused* (`flow-definition.md:1645`, ADR 0117 rule 4, P38 (l)); the app's *`OR-R2` already freezes results*
  (answered in the reply); `test/fold/map-cost.test.ts`'s header (*the clone of each answer — Q186's cost*, `:506`).
- **The always-read set**: no row edits `CLAUDE.md`, `doc/workflow.md` or `doc/concept.md`, except W203's plan-close
  bookkeeping in `doc/workflow.md` (P40's W200 precedent, declared before the edit).

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W202 | **One shared copy per output read — a reference costs one copy, not one per reader**; ADR 0126; decisions 1-8; (a)-(c), (f2), (g1); facts 1-9 | `src/driver/driver.ts`, `test/driver/**`, `test/definition/l4-corpus.test.ts` (counted), `test/fold/map-cost.test.ts` and a sibling `test/fold/*-cost.test.ts` if the case is placed there, `spec/flow-definition.md`, `spec/run-state.md` (`RN-R13`), `spec/join-policy.md` (`JP-R11`'s headline), `spec/README.md`, `AGENTS.md`, `doc/decisions/0126-*`; **declared exceptions**: `scripts/check-docs.mjs` and `scripts/check-docs-selftest.mjs` (`X6`'s anchors and its two probes, moved with the table — nothing else), `examples/l6.ts` (fact 7's W192 claims and their fixtures; `DRIVER_FIELDS` if it moves), `examples/README.md` (`X10` if those claims' counts move) | nothing — (f) and (g) answered | `gate:item`; L2 the shared copy `===` across instances, readers and both sites ((g1)), frozen at every depth the walk reaches, never the stored record, an inline-shaped write throwing `TypeError` at the double, a predicate's write stopping the run; `all` a fresh array of shared elements; `?` both arms; a `place` replacement and removal dropping the copy; a resumed driver making it afresh; `"$payload"` one copy per run; every composed payload deep-equal to `6957919`'s on every corpus flow; (f2)'s gap PINNED per type — a typed array and a `DataView` shared unfrozen and `Object.freeze` never called on them, a `Map`, `Set`, `Date` and `ArrayBuffer` shared, frozen shallowly, and a write through each (`set`, `add`, `setTime`, a view) reaching every reader, each beside a freezable control that throws; the count EXACT at 2,000 / 8,000 and equal, each restored clone red at its ceiling; `RN-R13`'s term measured; the subjects timed once |
| W203 | **The exit artifact on real workers, the reply, P41's close** — exit (2) and (3); `gate:full` | `examples/l6.ts`, `examples/README.md`, `examples/map-cost.ts`, `examples/flows/**`, `examples/workers/**`, `test/definition/l4-corpus.test.ts` (if a census moves); `doc/workflow.md` (the plan-close bookkeeping only, declared); outside this repository, `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass2-followup-2.reply.md` | W202 | **`gate:full`** (the plan's last item); L6 in node 24 and deno, threaded and inline; `X10` moved by its block alone |
| W204 | *reserved, expected unused* | | | |

**The two rows share `examples/l6.ts`, `examples/README.md` and `l4-corpus.test.ts`, so they are SERIAL, never
concurrent** (`doc/workflow.md` section 7 rule 2) — which (e1) answers anyway. **No item edits
`scripts/check-register*.mjs`, `scripts/state.mjs` or `doc/questions/README.md`**, so `gate:item` is W202's and
`gate:full` W203's. **Questions reserved per item**, so no two take one: W202 Q750-Q754, W203 Q755-Q759. **W202 closes
Q186** at its record step if its gate holds the app's ask: a count in the gate at two sizes, equal, with the cost removed
rather than warned about.

**The reply to fyflow-app goes where P40's did** — `../fyflow-app/.scratch/mu-upstream-adoption/requests/`, as
`fyflow-orchestration.pass2-followup-2.reply.md`. **W203 writes it**, from this plan and the two Records, once its own gate
is green: Q735's Host table acknowledged; the ask accepted for every node reference and `"$payload"` ((a), (b)); the shape
(decision 1) and the count in the gate; the driver re-taken beside fact 4's and the app's figures; the correction to *`OR-R2`
already freezes* (fact 5); **the two behaviour changes** — an inline worker writing into a freezable referenced value now
fails that attempt with a `TypeError`, and a predicate writing into one stops the run ((g1)); **the named gap** ((f2)) — a
referenced value is read-only, and an inline worker writing into a shared `Map`, `Set`, `Date` or binary value changes what
every other reader sees, threaded pools unaffected; their ADR-0018 refusal of `"$payload"` in a map no
longer needed for cost; 0.10.0, **its release state MEASURED at the time of writing** (npm, JSR, tags, `origin/main`) and
the bump, push and publish the maintainer's ((d)).

**Each item writes its own file from its row when it starts** (`doc/work-items/TEMPLATE.md`), as W199 and W200 did — no
item file is written at this declaration, so `npm run state`'s two derivations agree. **Its `**Status:**` line's FIRST
WORD is one of the template's five** (`todo`, `in progress`, `in review`, `done`, `reserved`), which is what
`scripts/state.mjs` reads (its `STATUSES`). What the row cannot carry is below: each item's OUTPUTS, and what its
declaration step RE-TAKES before any `src/` edit (P15 decision 5). Every item's last re-take is the ladder counts, the
baseline this plan did not take.

**W202 — outputs**: ADR 0126; the shared copy per output entry inside `outputsCache`, frozen by decision 1's walk, made at
its first read, dropped where `place` replaces or removes the entry; `resolveReference` handing it at both call sites
((g1)); the `"$payload"` copy, one per run, made at its first read and afresh after a resume; the spec's READ-ONLY sentence
and its named gap ((f2)); the private counter of reference copies; the L2 suite of decision 6's and the row's claims, each expected value
from the spec; fact 8's identity claims and fact 7's L6 claims re-stated under ADR 0126 (an inline write now an attempt
failed with `TypeError`, a threaded one its own clone's, the predicate's write a stopped run); the cost case in `test/fold/map-cost.test.ts` or a sibling with
its provocations; `spec/flow-definition.md` v0.47, `spec/run-state.md` v0.33, `spec/join-policy.md` v0.24,
`spec/README.md`; `AGENTS.md`'s reference rows and *What it costs*; `X6`'s anchors and probes. **Re-takes**: fact 4's table
on this tree, node 24 and deno, each size a fresh process, and a CPU and heap profile at 4,000 items before any edit;
fact 5's freeze probe in node, deno and chromium; fact 7's writers census; fact 8's identity claims (a grep for `!==` and
`notStrictEqual` over every suite reading a composed payload or `ctx.needs`); the per-read `cloneValue(` census (D′);
`RN-R13`'s figures by its own method before and after; whether any test reads `outputsCache`'s shape beyond `byNode`,
`index` and `examined`; `npm run refs -- Q186`.

**W203 — outputs**: the L6 block (exit (3)) — the fetch-then-map shape on a map of at least twelve items, threaded and
inline: every instance's referenced value equal to `fetch`'s result BY HAND; an INLINE worker writing into its referenced
value fails that attempt with a `TypeError` read off the attempt's error (the task's end by its retry policy, fact 6),
beside a THREADED one whose write lands on its own clone and reaches no sibling; a predicate writing into its
referenced value stopping the run with that `TypeError` ((g1)); one gap type ((f2)) — an INLINE worker's write into a
shared binary or `Map` value read by a later instance — as the gap's real-worker witness; `"$payload"` read the same way; each claim
its own verdict with its control; `examples/map-cost.ts` gaining the large-read subjects (exit (2)) at 1,000 / 2,000 /
4,000 items, node and deno, BEFORE (W202's re-take) and AFTER, time and peak heap; `X10` moved by the block alone; the
reply; P41's Record and retro. **It places no logic**: a counter or `src/` site it cannot read is an Exception named
before the edit. **Re-takes**: W202's counts and walls in node, deno and chromium on W202's tree; fact 4 on the final tree;
the release state, measured.

## Predictions, written before the items that test them

1. **W202 moves no composed VALUE in any lane** — every payload and `ctx.needs` deep-equal (decision 6). What moves is
   IDENTITY (fact 8's claims flip from `!==` to `===` across reads of one output) and WRITABILITY (fact 7's L6 claims), the
   counts, `RN-R13`'s term, and the spec and `AGENTS.md` text.
2. **The driver alone at 4,000 items falls from 22,903 ms to within 2x of the same flow whose `all` names a SMALL node**,
   and its peak heap over baseline from 1,445 MB to **under 10%** of it — on the machine fact 4 ran on.
3. **`RN-R13` gains ONE term** (a shared copy per output read, and one of the entry payload where `"$payload"` is read);
   `DRIVER_FIELDS`, `NOT_RUN_STATE` and the holder sets do not move; `CHECKPOINT_FORMAT`, `FoldInput`, `RunState`,
   `snapshot()` and every public signature do not move — an item that finds one must is a stop-and-ask.
4. **The count is 1 per output read at both sizes** for the `one` shape (fetch's single output), and the restored per-read
   clone reads `n` there — the gap the pin discriminates.
5. **The existing L6 claims that move are W192's (3) alone** (fact 7) — its inline worker's and its predicate's writes
   into `"$payload"` ((g1)): no other block writes into a referenced value.
7. **Every gap type behaves as (f2) names it, in all three L0-L5 runtimes**: `Object.freeze` throws on a typed array with
   elements, and a shallowly frozen `Map`, `Set`, `Date` and `ArrayBuffer` take `set`, `add`, `setTime` and a write
   through a view — fact 5's node probe, re-taken by W202 in deno and chromium; a runtime that differs is a stop-and-ask.
6. **W203 moves `X10` by its block alone, and no existing L6 row** beyond W202's.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q186](../questions/q186.md) | a reference to a LARGE value inside a map — the per-read clone; `deferred`, *nothing warns* | W202 (closes it, by removing the cost) |
| [Q179](../questions/q179.md) | wall time is not a reproducible cost measure for this gate — why the count is the gate and the timings are readings; `icebox` | — |
| [Q154](../questions/q154.md) | a branch mutating what it was given mutated its siblings' input — `JP-R11`'s origin, the hazard (c)'s freeze answers for references | — |
| [Q22](../questions/q22.md) | whether a result must be structured-cloneable and where that constraint sits — (f2)'s neighbour: what crosses a clone is what the gap is made of; unmoved | — |
| [Q9](../questions/q9.md) | nothing enforces a predicate's purity — (g)'s ground | — |
