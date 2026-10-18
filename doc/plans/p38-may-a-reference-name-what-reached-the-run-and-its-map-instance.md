# P38 — May a reference name what reached the run, and what opened its map instance?

**Status:** declared 2026-10-18 — on `c43566f` (the tree clean), answering fyflow-app's *pass 1 follow-up, before the 0.8.0 publish*; facts 1-12 measured at this declaration; stop-and-asks (a)-(n) ANSWERED by the maintainer 2026-10-18, all as recommended — both references, in 0.8.0 (a), (k); spelled `$payload` (b); the union widened (h); no item started
**Question this plan answers:** *may a `needs` reference name the value that reached the RUN and, inside a `map`
instance, the item that opened it — always there, copied like any reference, refused where it means nothing, and
derived again on a resume with nothing new in the checkpoint?*
**Exit artifact:** *on the final tree, one cross-row block in `examples/l6.ts`, green in node 24 and in deno, in which:
(1) an ENTRY ask is answered and its successor, a task on a THREADED pool, receives `{ invoice, answer }` — `invoice`
the run's payload's own, `answer` the person's — and an edge predicate on that task routes on `needs.run.amount`, one
run each way; (2) a `map` whose branch is an ask followed by a task on an INLINE pool hands each task its OWN item
beside its own answer, at an arity of at least three; (3) the copy claim over a NESTED payload and NESTED items, read
both ways: a caller mutating its payload after `start()`, and a worker mutating a nested field of what it received,
changes nothing any other node or instance receives; (4) a run parked at an ask in a map instance, STOPPED and resumed on a
fresh runtime, whose successors receive the same values as the uninterrupted control, its checkpoint header the same
five keys at `format: 1` and its fold inputs no kind the control lacks; (5) a flow naming the item outside any map
instance refused at construction with the finding that names the fix; and `npm run gate:full` EXIT 0 — the LAST item
runs it (workflow v0.29).* *(Written for (a)-(n) answered as recommended; (a) answered `$payload` only drops clause (2)
and the item half of (3) and (4).)*
**Reserves:** W190-W193 (W193 expected unused), Q700-Q719, ADR 0117-0119 (ADR 0119 expected unused); no S id

```
Question: may a reference name the run's payload and its map instance's item?
Items:    W190 (the run's payload as a reference, definition to driver to wiring — ADR 0117), W191 (the map instance's
          item as a reference, and what an instance keeps for it — ADR 0118), W192 (the exit artifact, on real workers in
          both runtimes)
Reserves: W190-W193 (W193 expected unused), Q700-Q719, ADR 0117-0119 (ADR 0119 expected unused)
Raises:   no question; no S entry
Baseline: ids derived by `npm run state` at this declaration — P38, W190, Q700, ADR 0117 from the tree and W190, Q700,
          ADR 0117 from the ledger (P36's Retro), which AGREE. The ladder counts are NOT taken here and are W190's
          declaration step's
Measured: 2026-10-18 on the CLEAN tree at `c43566f`, READ ONLY — one L1/L2 probe script outside the repository
          (the session scratchpad's `p38/probe.ts`), importing `index.ts` by file URL and driving a `Driver` over a
          scheduler double; nothing in the tree was edited or linked. Node 24.20.0 ONLY: deno NOT run at this
          declaration, and no real scheduler — each item's B′ copy re-takes what it relies on
```

## Why this plan, and why now

fyflow-app adopts the `ask` kind as P35 built it — the answer IS the ask's result, one shape whatever the answer
(P35 (e)) — and drops its own merge of input into the answer. P35 (e) rested that on a sentence: *"the value that
reached the ask stays reachable by `needs` on whatever produced it"* (P35:264), which `AGENTS.md` repeats (`:1276-1277`).
**That premise is true only where the ask HAS a producer** (fact 3): an ask at the ENTRY has none, and an ask as a
`map` branch has none for its item. The app asks for one reference that names what reached the RUN, and one that names
what opened the MAP INSTANCE, before 0.8.0 is published, so it adopts one release instead of two. **0.8.0 is
committed and unpublished** — P36 (v) DEFERRED the publish for the maintainer's chores (P36 Retro section 8) — so the
window the app names exists, and (k) asks whether to use it.

## What fyflow-app asked, held against this declaration

Read at the session scratchpad's `app-request-pass1-followup.md` (the app's request, in full) beside our earlier reply,
`../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass1.reply.md` (read, not edited).

| the app's clause | where it is answered |
|---|---|
| a reference to the run's payload and to the current map instance's item, e.g. `"$input"`, `"$item"`; *"name, spelling and exact scope are yours"* | (a), (b), (c) |
| on every node that may declare `needs` (task, map, ask) and on an edge's `needs`, so a predicate routes on `needs.input.amount` | decision 3; W190, W191 |
| deep-copied like any other reference; the payload is the value `start()` cloned; the item the element under `over` | decision 4, fact 4; (l) |
| always certain — no `?` form, nothing like `FD-V29`; refused at construction where it makes no sense (an item outside any map instance, an array form), naming the fix | (d), (g); facts 1, 7 |
| cannot collide with a node id | **already true of any `$` token** — fact 1: `FD-V16` refuses `$` in an id |
| survives resume and replay, derived from the header's payload and the log; `CHECKPOINT_FORMAT` stays 1 | decision 5, facts 5, 6; (e) |
| composed the same everywhere a payload is composed: `start`, `FD-R4`, `boundaryTargets`, `givenVerdict`, `tryTransform` | **three of the five compose; two compose NOTHING** — fact 8: `givenVerdict`/`tryTransform(…, { input })` take the value the node RECEIVES, already composed. (i), (j) |
| additive, no change to a flow that does not use it | decision 2; prediction 1 — **one public TYPE widens**, (h) |
| a worked example in `AGENTS.md`: an entry ask whose successor declares `needs: { invoice: "$input", answer: "approve" }`, and a map branch ask whose successor reaches its item | W190, W191 (each one `run` snippet), in the spelling (b) chooses |
| the rule ids, the refusals, the section they live in | decision 6; (g) |
| *"If you decline or reshape it, say which road you intend instead for case 1"* | fact 3 — the road that exists today, and its measured cost; (a), (k) |
| not asked: the ask's result shape, `NodeRun.input` through `needs`, any other part of run state | held — decision 1 |

## Facts measured at this declaration

**Fact 1 — today both tokens are refused, by `FD-V26`, at both sites, and no node can be called either.**
`validateDefinition` on a task declaring `needs: { x: "$input" }` reports `FD-V26@b: needs["x"] is "$input", which is
not "." , a node id with an optional "?" suffix, or a one-element array holding one`; on an edge, the edge form of the
same clause; likewise `"$item"`, `["$input"]` and `"$input?"` — eight cases, eight `FD-V26` findings, nothing else.
A node with `id: "$input"` is `FD-V16@$input: node id is not [A-Za-z0-9_-]{1,64}`. The parse is `referenceTarget`
(`src/definition/validate.ts:1043-1061`): `"."` is the one string it accepts outside `ID_RE` (`:30`, `:1048`), and
`aimed` strips one `?` and holds the rest to `ID_RE` (`:1057-1060`). **So any `$`-prefixed token is free to define,
cannot collide with a node id by construction, and is refused by every tree before this plan** — no flow that
validates today changes meaning.

**Fact 2 — case 1, today (L2, a double).** Entry `approve` (an ask, `answerSchema { approved: boolean }`) → `pay`;
`start({ invoice: { id: 'INV-1', amount: 120 } })`, `resolve(…, 'done', { result: { approved: true } })`: `pay` is
handed `{ settings: {}, input: { approved: true } }`. `needs: { invoice: '.', answer: 'approve' }` on `pay` validates
with zero findings and `"."` is the answer again — **no reference reaches the payload**: the ask's `asked.input` is in
the log (`src/driver/driver.ts:4651`) and `NodeRun.input` on the fold, and neither is a `needs` target (FD-V27 names a
NODE's result).

**Fact 3 — case 1's and case 2's road TODAY, and its cost.** A pass-through task before the ask: entry `copy` (a task
returning what it received) → `approve` → `pay` with `needs: { invoice: 'copy', answer: 'approve' }` validates with
zero findings and `pay` receives `{ invoice: <copy's result>, answer: { approved: true } }`. The library's own
pass-through is a built-in `Transform` node with an identity expression (`AGENTS.md` section 13, ADR 0075), measured at
**+1 dispatch, +4 clones, +2 log records** per node and, inside a `map`, N of them, and **1.93x** inline / **~1.47x**
threaded for a map whose branch is a `Transform` node (W109, `AGENTS.md:3065-3069`). Case 2 takes the same road with
the pass-through as the map's branch entry, before the ask. **So nothing the app asks is unreachable today; what it
asks is to stop paying a task to reach it.** This is the road named to the app if (a) declines.

**Fact 4 — the run's payload IS retained for the life of the run, in one place, and a resume restores it.** The
driver takes `structuredClone(payload)` at `start()` (`driver.ts:2134`) into `this.header` (`:1596`, `:2135`, `:2153`)
and holds it until the run ends; `resume()` sets it from the stored header (`:2234-2235`) and replays from a copy of it
(`:2333`). Probe F5: `checkpoint().header.entryPayload` is the started payload, on a run whose entry consumed it.
`spec/run-state.md` `RN-R13` already states the retention (*"the driver now retains a copy of the entry payload for
the life of the run"*, `:72-73`). **A `$payload` reference needs NO new state** — it reads the header the driver
already keeps, in both doors.

**Fact 5 — a map instance's item is NOT retained anywhere a later node of the instance can name.** The map arm
(`driver.ts:3799` `mapItems`, `:3858-3859`) hands each instance `cloneValue(items[i])` and keeps nothing; `itemIndices`
is threaded down, and a settled node's indices are READ BACK OUT OF ITS PATH (`:4807-4810`), which carries no item.
Probe F6 — `ingest` → map over `items` → `first` → `second`, all settled: the string marking item 1 is held at exactly
one place, **`log.0.result.items.1.marker` — the PRODUCER's record**, never as the instance's item. Probe F4 — an
ENTRY map whose branch is an ask: the item is held in the ask's `asked.input` (`inputs.5.input`) and in the header,
because there the map's own input IS the payload. **So a `$item` reference needs either new driver state or a
re-derivation of what the map received** — and the second is the derivation ADR 0041 and `FD-C3`'s row refuse by name
(*"a derivation re-implements `compose`, `JP-R11` and `JP-R12` at a second site, which ADR 0040 rule 2 refuses"*,
`spec/flow-definition.md:1611`, `driver.ts:3580-3587`). (e).

**Fact 6 — a resume re-runs the map arm, so state the map arm writes is REBUILT by the replay.** `RN-R19`'s replay
enters the entry with the header's payload (`driver.ts:2333`) and feeds the stored stimuli, so every `enter` —
the map arm included — runs again in log order; `RN-R13`'s other per-region structure (a region's collection,
ADR 0046) is rebuilt the same way. An ask's `asked` element is REGENERATED by the replay with its composed input
(`RN-R37`), so a `$payload` or `$item` key in an ask's `needs` is regenerated from the same header and the same items.
**Nothing new is written to the log or the header** — `CHECKPOINT_FORMAT` (`driver.ts:354`) stays 1, `RUN_FOR` and
`isFed` do not move (no fold-input kind is added).

**Fact 7 — `FD-V27`, `FD-V28` and `FD-V29` skip every reference whose `node` is `null`** (`validate.ts:1833`: *"FD-V26's,
or the `"."` form"*), and `regions` and `certainlySettled` are computed once there (`:1815-1818`). A token that parses
with `node: null` is therefore exempt from all three by construction — the *always certain, no `?`* the app asks for —
and **ALSO silently treated as `"."` by every other reader that tests `node === null`** (fact 9). Whether a reader is
inside a map instance is a region-chain question the same block can answer (`allRegions`, `opensWith === 'map'`, the
walk `branchPathOf` makes); `FD-V49` is the next free validation id (`FD-V48` the last, `AGENTS.md:510`).

**Fact 8 — where a payload is COMPOSED, and where it is not.** Three of the app's five sites compose `needs`:

| site | file:line | what it composes today |
|---|---|---|
| `start` → `enter` → `compose` | `driver.ts:2156`, `:3684`, `:4338-4374` | every declared key; `"."` from `edgeValue`, a node id through `resolveReference` |
| `FD-R4` at `start` | `driver.ts:2099-2124` | `this.compose(n, value, new Map())` — **with EMPTY item indices, and BEFORE `this.header` is set** (`:2153`): a `$payload` read from the header there would read `null`, and a `$item` read through `itemIndices` would read nothing — the value must be HANDED to the composition |
| `boundaryTargets` / `entryWalk` | `src/definition/wiring.ts:332-383` | a map's own `needs` composed by `filter(([, r]) => r === '.')` (`:375-376`) — **a `$payload` key there is DROPPED**, so the map's `over` would be read off the wrong object; the premise *"a `"."` is the only reference an entry can carry"* (`:319`, `driver.ts:2093-2095`) becomes false |
| an edge's predicate — `resolveNeeds` | `driver.ts:4465-4494` | node ids only; `FD-V26` refuses `"."` there (`validate.ts:1591-1592`, by `target.node === null`) — **which would refuse `$payload` too, with a message about `ctx.outcome`** |
| `checkWiring` — `composed` | `wiring.ts:757-795` | `t.node === null` is read as `"."` (`:772-775`) and joins the `dot` keys that take each element of a per-item sample (`:789-792`) |
| `givenVerdict` / `tryTransform(…, { input })` | `wiring.ts:944-990`, `src/definition/assist.ts:145-198` | **NOTHING** — *"`input` IS `$` — what the node receives, so no `needs` is composed over it"* (`wiring.ts:952`); ADR 0101 and `driver.ts:196` make composing the given value the CALLER's |

**Fact 9 — the sibling grep: every reader of the `"."` form, by its two spellings.** `grep` over `src/`, `index.ts`,
`scripts/` and `examples/` for `=== '.'`, `node === null` and `'self'` (D′'s sibling clause): `validate.ts:1048`,
`:1495` (the message), `:1591-1592`, `:1833`; `wiring.ts:375-376`, `:772-775`; `driver.ts:4360`, `:4478` (a cast that
asserts `node: string`); `examples/l6.ts:6459`, `:12534-12566` (a census whose expected FORMS set is
`['all', 'one', 'self', 'suffix']`), `:13551` and `:13608` (two censuses over `EXPECTED` that skip `"."` and would read
a `$` token as a NODE ID). No `scripts/` hit. **`referenceTarget` is a PUBLIC root export** (`index.ts:3` re-exports
`validate.ts`), typed `{ form: 'self'; node: null; … } | { form: 'one' | 'all'; node: string; … } | null`; `Reference`
(`src/definition/types.ts:50`) is `string | readonly [string]`, so the TOKENS need no type change and the PARSE does. (h).

**Fact 10 — the premises this plan falsifies, by a grep for the PREMISE.** *the one / only invented token(s)*
(`types.ts:43`, `:48`; `validate.ts:1027`; `spec/flow-definition.md:1374`, `:1379`, `:1388`); *a `"."` is the only
reference an entry can carry* / *at an entry `FD-V27` admits no reference but `"."`* (`wiring.ts:319`,
`driver.ts:2093-2095`); *what a node can reach is the run's own OUTPUTS* (ADR 0040's title and rule 2;
`spec/flow-definition.md:81`; `routing.ts:33`); *the entry node's payload is in no record … no derivation at all*
(`spec/flow-definition.md:104`, `:1611`; `driver.ts:3581-3584`; `AGENTS.md:717`) — still true of the LOG, and no longer
the end of the sentence; *the value that reached the ask stays reachable by naming whatever produced it*
(`AGENTS.md:1276-1277`, P35 (e)); Q166's *"Nothing it cannot ask for"* — true of the branch ENTRY, false one hop later
(fact 5). `spec/run-state.md:556`'s *no record at any moment* is about the log and stays true.

**Fact 11 — what a reference costs inside a map is what it points at, and `$payload` is the large case.** Each
instance receives its own copy of each key (`resolveReference`'s per-key clone, `driver.ts:4442-4448`; `JP-R11`), so a
`$payload` key read in every instance of an N-item map clones the whole payload N times — Q186's measured cliff
(**613.6 ms** against **8.7 ms** at N = 1000 over ~126 KiB, `spec/flow-definition.md:1522-1531`), reached through a new
spelling. Q186 is `deferred` with its decision recorded: *nothing warns*. (l).

**Fact 12 — the census at this declaration.** `RUN_FLOOR` **47** (`scripts/check-docs.mjs:738`); `X10` **2767 / 214**
(`examples/README.md:38`, `:70`); `DRIVER_FIELDS` at `examples/l6.ts:13790` and `test/driver/retention.test.ts:264`;
`NOT_RUN_STATE` at `examples/run-flow.ts:1573`; `spec/examples/invalid/` **47** files, one or more per `FD-V` (five for
`FD-V26`-`FD-V29`), read by `test/definition/l4-corpus.test.ts` and `scripts/check-spec.mjs`; `AGENTS.md:510`'s *44
refusals over `FD-V1` … `FD-V48`*. Spec versions: `flow-definition.md` v0.43, `run-state.md` v0.27, `outcome-record.md`
v0.21, `join-policy.md` v0.23, `task-id.md` v0.16; next free ids `FD-V49`, `FD-C9`, `FD-R7`, `RN-R43`, `OR-R14`.
`check:budget` passes (B1-B7); no row here edits the always-read set. Package `0.8.0` / `0.8.0`, scheduler pin 0.6.0
(`npm run state`).

## Scope

**In** — a `needs` reference naming the run's payload (W190) and one naming the innermost enclosing map instance's item
(W191), at every site that may declare `needs` (a `task`, a `map`, an `ask`, and an edge); their refusals at
construction; their composition at `start`, `FD-R4`, `boundaryTargets`, an edge's predicate and `checkWiring`'s
arcs; what an instance keeps for `$item` and when it lets go; the specs `flow-definition.md` (section 3's table,
`FD-C1`, `FD-C3`, section 5) and `run-state.md` (`RN-R13`); `spec/README.md`; `AGENTS.md` (the app's two worked
examples); two ADRs; the exit artifact at L6 in both runtimes (W192).

**Out** — the ask's result shape (P35 (e), held); `NodeRun.input` or any other run-state cell as a `needs` target (not
asked); a PATH inside a referenced value (ADR 0040 rule 5's refusal, unchanged); an outer map's item from inside an
inner one ((c)); a library helper that composes a GIVEN value for `tryTransform` ((j)); a size warning ((l), Q186);
anything written to the log or the header (decision 5); a store, a serializer, or any write the library makes
(P23 decision 1).

## Decisions taken at this declaration

*Each follows from a fact or a precedent named beside it; what the facts leave open is a stop-and-ask below.*

1. **The ask's result keeps ONE shape** — P35 (e) holds; this plan completes its premise (fact 3, fact 10) rather than
   reversing it, and adds nothing to `NodeRun`, `FoldInput` or `OutcomeRecord` (P36 constraint 1: nothing derived on a
   fold input).
2. **Additive by construction** — every tree before this plan REFUSES both tokens (fact 1), so no flow that validates
   today composes differently; a node or edge declaring neither never reads the header or the item store.
3. **One grammar, both sites, every kind that may declare `needs`** — a node's `needs` and an edge's (ADR 0041's *same
   grammar*), on a `task`, a `map` and an `ask`. `FD-V26`'s edge clause refusing `"."` does NOT extend to the new tokens:
   a predicate has no `ctx.payload`, so naming it is not redundant (fact 8's fourth row).
4. **A COPY per key, per read, like every reference** (ADR 0040 rule 6, `JP-R11`): `$payload` is a clone of the
   header's payload, `$item` a clone of the instance's item; no node ever receives an object another holds.
5. **Nothing new in the log, the header or the fold** — `$payload` reads `this.header` (fact 4); `$item` reads state
   the map arm writes and the replay rebuilds (fact 6). `CHECKPOINT_FORMAT` stays 1; `RUN_FOR`, `isFed` and
   `snapshot()` do not move. **The invariant holds**: composition is the driver's (ADR 0001 rule 1), the fold reads
   nothing new, and `fold(driver.foldInputs())` is unchanged for every run.
6. **Rule ids**: the FORM refusals (an array form, a `?` suffix, a `$` token that is neither of the two) are `FD-V26`
   clauses — it owns the grammar; the AIMING refusal (the item named where no map instance contains the reader) is a
   new `FD-V49` ((g)) — `FD-V28`'s precedent, *a different fix earns a different id*. Composition is `FD-C1` (and
   `FD-C3` for an edge) widened, no new `FD-C` id; `$item`'s retention is `RN-R13`'s text. Each refusal has a failing
   example under `spec/examples/invalid/`, as every `FD-V` does (fact 12).
7. **Two ADRs** — ADR 0117 (W190): *a reference may name what reached the run*, amending ADR 0040 rules 2 and 5 (the
   run's own outputs AND its payload; two more tokens) and ADR 0041's *not derivable* row (the header is not a log
   record and is not a derivation). ADR 0118 (W191): *a map instance keeps its item while a node of it may still be
   entered*, amending ADR 0040 rule 2 (*computed rather than maintained*) for one structure and ADR 0046 (a fourth
   retained term). ADR 0119 reserved for an answer that needs a third.
8. **Each changed public surface is stated where it changes** (P33 decision 7 … P36 decision 8) — here one TYPE ((h)).

### Stop-and-asks — ANSWERED by the maintainer, 2026-10-18

**Each is the maintainer's, and each was answered as recommended**: (a) and (k) explicitly — both references, and
P38 ships in 0.8.0; (b) explicitly — `$payload`, not the app's `$input`; (h) explicitly — the union widened; the rest
as recommended. The work-item rows below are written for every one answered as recommended; the alternatives say
what each would have moved.

| | the question | recommended | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **Scope** — which of the two references this plan builds | **BOTH: the run's payload and the map instance's item** (W190, W191, W192). The app's case 1 needs the first, its case 2 the second, and each one alone leaves one of the two asks it adopted the `ask` kind for on a pass-through task (fact 3) | **The payload only** (W190, W192; W191 dropped): no new driver state at all (fact 4) and the cheapest item; case 2 keeps the pass-through branch entry, N extra tasks per map (fact 3). **Neither — decline**: the app puts a pass-through in front of every entry ask and every map-branch ask (fact 3's road and its measured cost), and P35 (e)'s premise is corrected in `AGENTS.md` instead (fact 10) |
| **(b)** | **Spelling** | **`"$payload"` and `"$item"`**. `$` is outside `FD-V16`'s charset, so neither can be a node id (fact 1), and the whole `$` prefix is RESERVED — any other `$` token is an `FD-V26` finding naming the two. *payload* because this library calls it that everywhere (`start(flow, payload)`, `entryPayload`, *the run's payload*), while *input* already names two other things a reader will confuse it with: the envelope's `input` (what THIS node receives, which is `"."`) and `NodeRun.input` (the ask's kept input — which the app says it is NOT asking to reach) | **`"$input"` and `"$item"`** — the app's own example, one word shorter; the cost is the two collisions above, and a worked example reading `needs: { invoice: "$input" }` beside a worker reading `envelope.input`. **A non-`$` sigil** (`"@payload"`, `"^"`) — equally collision-free, and further from JSONata's `$`-variables, which a `transform` beside a `needs` already uses (`$settings`); unlike anything an author has read here. **An object form** (`{ "run": "payload" }`) — widens `Reference`, BREAKING for every `needs` reader and outside ADR 0040 rule 5's *JSON's own syntax, no new shape* |
| **(c)** | **Which item `$item` names in NESTED maps, and on a map node** | **The INNERMOST map region that CONTAINS the reader as a member** — never a region the reader OPENS, so a `map` node's own `$item` is its ENCLOSING instance's item; a node in a `fanout` inside a map instance names the map's item. An outer item is reached the way any value is: a node of the outer instance that declares it passes it down — or a later plan, on a second user | **A depth suffix** (`"$item^1"`) — the outer items too, a third token and a counting rule, for no second user. **The outermost** — surprising inside a nested map, and the inner instance's own item then has no name |
| **(d)** | **Where the two are LEGAL, beyond the obvious** | **Everywhere the grammar is: `$payload` on any node (the entry included, where it equals `"."` for a task) and on any edge; `$item` on any node or edge whose reader is inside a map instance (the branch entry included, where it equals `"."`)** — one rule per token, no case where a correct value is refused | **Refuse the redundant cases** (`$payload` at the entry, `$item` at a branch entry) as `".?"` is refused: a third and fourth clause, and an author who later inserts a node before the entry or the branch entry would have to rewrite a reference that was right |
| **(e)** | **What a map instance keeps for `$item`, and when it lets go** (facts 5, 6) | **Each instance's item BY REFERENCE to the map's own received element** (no extra copy; a read clones), **kept only where the region has a `$item` reader** (decided from the document at construction), and **released when that INSTANCE's branch goes terminal** — it arrives at the join, is lost, or ends — after which no node of that instance can be entered. A suspended node (an ask, a parked task) keeps its instance alive; a resume rebuilds every live instance by replay (fact 6). A new `Driver` field: `DRIVER_FIELDS` +1, `RN-R13` a new term, ADR 0118 | **Released with the region's collection, when its JOIN becomes terminal** (ADR 0046 rule 3's window, one existing call site): simpler, but a third-party policy that fires before every branch is terminal ([Q583](../questions/q583.md)'s shape — no shipped policy does) leaves a late branch whose next node reads `$item` with nothing, so *always certain* stops being true. **For the life of the run**: simplest, and bounded by what the log already keeps of the producer's result (fact 5's F6), but at 10000s of items a second copy of every `over` array a `$item` reader touches, for ever |
| **(f)** | **Where `$payload` reads from, at each door** | **The value the run ENTERS with, handed to the composition explicitly**: at `FD-R4` the caller's payload (the header does not exist yet, fact 8), at `start` and in a run the header's copy (fact 4), on `resume` the stored header's — one value at every door, equal by construction, each read cloned | **Read `this.header` everywhere** — `FD-R4` would read `null` (fact 8): the boundary check would hold a DIFFERENT value than the run receives, the defect class Q633 was. **Move `FD-R4` after the header** — reorders `RN-R39`'s *after `FD-R4` and the clone, before anything is appended* (ADR 0112) for no gain |
| **(g)** | **The refusals, their ids and messages** | **`FD-V26`** (the form): `["$payload"]` / `["$item"]` — *"there is one; write "$payload""*; `"$payload?"` / `"$item?"` — *"it is always there; write it without `?`"*; any other `$` token — naming the two. **`FD-V49`** (new, the aim): `$item` on a node — or an edge of a node — that no map region contains, *"… is not inside a map instance; name the item where a map's branch receives it (`"."`), or move this node inside the map"*. Each with a failing example in `spec/examples/invalid/` | **Fold `FD-V49` into `FD-V27`** (*names a node that cannot have produced anything for you*): no new id, but `FD-V27` is about a NODE and its fix is to re-point, where this fix is to move the reader. **Everything under `FD-V26`**: one id, but `FD-V26` is computed before regions exist (`validate.ts:1491` against `:1815`) |
| **(h)** | **`referenceTarget`, a public export, and its return type** (fact 9) | **Widen the union with `{ form: 'payload' \| 'item'; node: null; conditional: false }`, stated BREAKING (a type) in 0.8.0 beside P33-P36's**; every reader of `node === null` in the tree switches on `form` instead (fact 9's list, each a site of W190 or W191) | **Return `form: 'self'` with an extra field** — no new variant, and every consumer reading `'self'` as `"."` is silently wrong, which is the one failure a type exists to prevent. **Return `null` for `$` tokens and parse them elsewhere** — no type change; a consumer calling `referenceTarget` on a valid document then reads *not a reference*. **Stop exporting it** — BREAKING by removal |
| **(i)** | **`checkWiring`'s arcs over a `$` key** (fact 8, `composed`) | **`$payload`: the key's schema is UNCHECKED** — *"the run's payload, which no schema declares"* — so an arc through it reads `unchecked`, never a false `fits`. **`$item`: the enclosing map's ITEM arrival** (`Wiring.item`, its schema and per-item sample), composed with the `dot` keys' per-element rule, and `unchecked` where the map has no single arrival. `boundaryTargets` composes both from the walk's own payload and item | **Borrow the entry task's `inputSchema` for `$payload`** — a real schema where the entry is a task with no `needs` and no `transform`, and three special cases to say where it is not. **Leave `checkWiring` alone** — every such arc misreads its key as `"."` (fact 8), a wrong verdict |
| **(j)** | **`givenVerdict` and `tryTransform(…, { input })`** — the app lists them as composing sites | **No change; the premise does not hold** (fact 8): the given `input` IS what the node receives, and composing it — `$payload` and `$item` included — is the caller's, as for any `needs` today (ADR 0101, `AGENTS.md` section 15). `AGENTS.md` says so in the `$` subsection, and the reply to the app says why | **A new export composing a given value** (`composeGiven(flow, nodeId, { payload, item, outputs })`) — the app's *"a given input and a run agree"*, as new public surface and a second caller of the composition; not asked in that form, and a later plan if the app asks |
| **(k)** | **Does P38 ship in 0.8.0?** (decision 8; P36 (v) deferred the publish) | **YES — P38 runs before the publish, and 0.8.0 ships it.** Cost: three items, the size of P36's W185 plus one item with state (W191) plus an exit artifact — P36 ran five items in one day. The one type change (h) is free in a release already BREAKING and is not free in a patch: in a 0.8.1 it is a breaking change under a patch number, so the honest later home is **0.9.0**. And the app adopts once | **Publish 0.8.0 as it stands, P38 in 0.9.0**: the app adopts twice, putting a pass-through before each entry ask and map-branch ask meanwhile (fact 3) and removing them later. **`$payload` in 0.8.0, `$item` in 0.9.0** — W191 and its retention moved out, case 2 on the pass-through until then |
| **(l)** | **What `$payload` costs inside a map** (fact 11) | **A copy per instance per key, as every reference — and NOTHING warns**, Q186's recorded decision applied to a new spelling; `AGENTS.md`'s cost paragraph names `$payload` as the large case and the remedy (name the small part's PRODUCER, or a `map` with `needs` that projects what each instance needs) | **One frozen copy shared by every instance**: O(1), and against `JP-R11` and ADR 0040 rule 6 (*no two nodes ever receive the same object*) — a worker that mutates would throw on one road and not another. **A warning** — reopens Q186 against its own recorded verdict |
| **(m)** | **An `ask` keeps the composed input on its `asked` element** (`RN-R37`) — a `$payload` key in an ask's `needs` therefore writes a copy of the whole payload into the LOG per ask | **Accept it, and say so** in `AGENTS.md`'s ask section: it is what `asked.input` is for (P35: the composed input, *no size cap*), and the replay regenerates it (fact 6) | **Exclude `$` keys from `asked.input`** — then `NodeRun.input` is not what the ask received, which is the field's whole definition |
| **(n)** | **The reply to fyflow-app** | **Written by the coordinator after (a)-(m) are answered**, from this file — the rule ids, the refusals, the section, the road for case 1 if declined — outside this repository; this plan's Record names it | **Wait for the Record** — the app plans its adoption tickets on the answer to (k), not on the build |

## Work items

**The sentences P36's retro proposal B carried, copied as its section 8 (s) directs (the maintainer: YES, 2026-10-18)** —
B′, C and E UNCHANGED; D′ with P35's three clauses and the two P36 added; the two brief sentences and a third:

- **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
  snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the change
  adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads that floor
  (`check:docs:selftest`, `check:budget:selftest`) as well.*
- **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its confirming
  gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final tree.*
- **D′ — the census sites AND the readers in the plan's row**: *the plan's index row names, for each item, the census
  sites its kind of change moves — a new suite → `test/definition/l4-corpus.test.ts`; a spec version →
  `spec/README.md`'s row; an L6 assertion or run → `examples/README.md`'s `X10` copies; an executed snippet →
  `scripts/check-docs.mjs`'s `RUN_FLOOR`; a driver field → `examples/l6.ts`'s and `test/driver/retention.test.ts`'s
  `DRIVER_FIELDS`; a fact `AGENTS.md` states → the whole of `AGENTS.md` — and every file that READS the surface the
  item changes, found by a grep for each changed name over `src/`, `scripts/`, `examples/` and `index.ts`: the module's
  export list, the caller that hands the value on, the publish smokes (which no lane typechecks), and the comments and
  messages that state the rule being changed.* **Every row touching `AGENTS.md` owns the WHOLE of it.** **P35's three**:
  *a new case in a COUNTED suite → `l4-corpus`'s per-suite count and its message*; *a flow added under `spec/examples/`
  → the corpus censuses (`spec/flow-definition.md` section 7's table, `spec/outcome-record.md` section 4's `OR-R11`
  sentence and its suite, `test/definition/wiring.test.ts`'s L4 arc total, `test/driver/needs.test.ts`'s region
  census)*; *a grep for each PREMISE the change falsifies, not only each changed name*. **P36's two**: ***a parenthetical
  in an `Owns` cell is a forecast of where in the file, not a limit — the row owns the whole of each file it names, as it
  owns the whole of `AGENTS.md`***; and ***a grep for a SIBLING of each member the change adds — another refusal,
  another callback, another kind — to find every list and rule that should now name it, in any spec, not only the
  row's***.
- **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two, the
  probe is COMPOUND, and a Record counts it as killing neither clause until each is re-cut alone and killed.*

**Three sentences for every item's brief**: ***each item's Record states its readers' overlap***; ***an owner element
a resume's replay feeds is TAKEN AT REST, between two steps*** (`RN-R19`) — no element is added here (decision 5), so it
binds W191's retention at the replay's feed: the item store a replay rebuilds is written where the map arm runs,
never by a caller's call; and ***a COPY claim is provoked by an ALIAS and by a SHALLOW copy, over a fixture whose value
is NESTED, and read in both directions*** — every `$payload` and `$item` row's copy claim, at L2 and at L6.

**D′ applied — the sites each row moves.**

- **The siblings of `"."`** (fact 9 — the new forms' siblings): `referenceTarget` and its union (`validate.ts:1043-1061`),
  `FD-V26`'s node and edge clauses and messages (`:1491-1497`, `:1586-1593`), the `FD-V27`-`FD-V29` loop's skip
  (`:1833`), `compose` (`driver.ts:4338-4374`), `resolveNeeds` (`:4465-4494`), `FD-R4` (`:2099-2124`), `entryWalk`
  (`wiring.ts:375-376`), `composed` (`:757-795`), `types.ts`'s `Reference` comment (`:33-49`), and `examples/l6.ts`'s
  four reference censuses (`:6459`, `:12534-12566`, `:13551`, `:13608`) — W190 for `$payload`, W191 for `$item`.
- **The siblings of `FD-V29` / `FD-V27`** (the new refusal `FD-V49`): `spec/flow-definition.md` section 5's table and
  its count sentences, `AGENTS.md:510`'s *44 refusals* and its parenthetical, `spec/examples/invalid/` (one file per
  new clause), `test/definition/l4-corpus.test.ts`, `scripts/check-spec.mjs`'s rule census — W191; `FD-V26`'s new
  clauses' examples — W190.
- **`RUN_FLOOR`** (47) with each `run` snippet — W190 (the entry-ask example), W191 (the map-branch-ask example).
- **`LATE_SUITES`** and every counted suite's per-suite count with every new suite and case — W190, W191.
- **`spec/README.md`** rows: `flow-definition.md` v0.44 (W190), v0.45 (W191); `run-state.md` v0.28 (W191, `RN-R13`).
- **`DRIVER_FIELDS`** (`examples/l6.ts:13790`, `test/driver/retention.test.ts:264`) and **`NOT_RUN_STATE`**
  (`examples/run-flow.ts:1573`) — W191's item store, if (e) is answered as recommended; W190 adds no field (fact 4).
- **`X10`** (`examples/README.md:38`, `:70`) — W192.
- **The corpus censuses** — only if an item adds a flow under `spec/examples/valid/`; none is planned (the invalid
  examples are `FD-V` fixtures, read by `l4-corpus` and `check-spec`).
- **The PREMISES** (fact 10): *the one / only invented token* — W190 (and W191 for the item); *a `"."` is the only
  reference an entry can carry* — W190; *what a node can reach is the run's own outputs* (ADR 0040, `FD-C1`'s
  section, `routing.ts:33`) — W190; *the entry node's payload is in no record, no derivation at all* (`FD-C3`'s row,
  `driver.ts:3581`, `AGENTS.md:717`) — W190; *the value that reached the ask stays reachable by naming whatever
  produced it* (`AGENTS.md:1276-1277`) — W190 (entry) and W191 (map branch); Q166's answer — W191, a dated note at its
  record step.
- **The always-read set**: no row edits `CLAUDE.md`, `doc/workflow.md` or `doc/concept.md`.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W190 | **The run's payload as a reference** — `$payload` ((b)), on every `needs` site; ADR 0117; (a), (b), (d), (f)-(j), (l), (m); facts 1, 4, 7-11 | `src/definition/validate.ts`, `src/definition/types.ts`, `src/definition/wiring.ts`, `src/driver/driver.ts`, `src/driver/routing.ts` (a comment), `spec/flow-definition.md` (section 3's table and prose, `FD-C1`, `FD-C3`, section 5's `FD-V26` row), `spec/README.md`, `spec/examples/invalid/**`, `test/definition/**`, `test/driver/**`, `examples/l6.ts` (the four reference censuses only), `AGENTS.md`, `scripts/check-docs.mjs`, `doc/decisions/0117-*` | — | `gate:item`; L1 `referenceTarget` on every form, the new variant included, and `FD-V26` on `["$payload"]`, `"$payload?"`, `"$other"` at BOTH sites, each message naming the fix; L2 `$payload` composed at the entry, two hops later, on a map node (its `over` read off the composed object), an ask (`asked.input` carrying the copy), and an EDGE whose predicate routes on `needs.run.amount` both ways; `FD-R4` holding an entry task's composed `$payload` key to its `inputSchema` (refused and accepted); a run RESUMED from a checkpoint composing the same; the COPY claim — a caller mutating its payload after `start()`, a worker mutating a nested field of a received `$payload`, alias and shallow both read — over a NESTED payload; every flow declaring neither byte-identical in its fold inputs and dispatched payloads; `checkWiring` over a `$payload` key `unchecked`; the app's entry-ask worked example as a `run` snippet |
| W191 | **The map instance's item as a reference, and what an instance keeps for it** — `$item` ((b)); ADR 0118; (a), (c)-(e), (g)-(i); facts 5-7, 9 | `src/definition/validate.ts`, `src/definition/regions.ts` (if a region-chain helper is added), `src/definition/wiring.ts`, `src/driver/driver.ts`, `spec/flow-definition.md` (section 3, `FD-C1`, section 5's `FD-V26` and a new `FD-V49`, its count sentences), `spec/run-state.md` (`RN-R13`), `spec/README.md`, `spec/examples/invalid/**`, `test/definition/**`, `test/driver/**`, `examples/l6.ts` (`DRIVER_FIELDS`, the censuses), `examples/run-flow.ts` (`NOT_RUN_STATE`), `AGENTS.md`, `scripts/check-docs.mjs`, `doc/decisions/0118-*` | W190 | `gate:item`; L1 `FD-V49` on a node and on an edge outside any map instance, beside a node inside a `fanout` inside a map (accepted) and a `map` node inside a map (its ENCLOSING item, (c)); L2 `$item` on the branch entry, two hops into the instance after an ASK, on an edge predicate, in a NESTED map (the innermost) and at an arity of eleven or more (`"1"` against `"10"`, section 3's segment-wise rule); the store EMPTY for a region with no `$item` reader; released when each instance's branch goes terminal — read by `DRIVER_FIELDS`' retention case — and a parked instance's item kept until its answer; a run stopped at a parked map-branch ask and RESUMED, its successor receiving the same item (the store rebuilt by the replay); `FD-R4` over an entry map's branch task composing `$item` and `$payload` from the walk's own values; `checkWiring`'s `$item` arc over the map's item arrival, per item; the COPY claim over NESTED items, both ways; the app's map-branch-ask worked example as a `run` snippet |
| W192 | **The exit artifact** — the header's five clauses on real workers, a threaded and an inline pool | `examples/l6.ts`, `examples/flows/**`, `examples/workers/**`, `examples/README.md` | W191 | **`gate:full`** (the plan's last item); L6 in node 24 and deno |
| W193 | *reserved, expected unused* | | | |

**Every row shares `src/driver/driver.ts`, `spec/flow-definition.md` or `AGENTS.md` with its neighbour, so the three
are SERIAL in the order above, never concurrent** (`doc/workflow.md` section 7 rule 2). **W190 must land the
`referenceTarget` variant AND every `node === null` reader switching on `form` in ONE item**: a tree on which the
validator accepts `$payload` and `compose` still reads `node === null` as `"."` hands a worker the wrong value with
every lane green (fact 7). **No item edits `scripts/check-register*.mjs`, `scripts/state.mjs` or
`doc/questions/README.md`**, so `gate:item` is every row's but the last.

**Questions reserved per item**, so no two take one: W190 Q700-Q704, W191 Q705-Q709, W192 Q710-Q713; Q714-Q719 the
plan's, expected unused.

## Predictions, written before the items that test them

1. **W190 moves no fold input and no dispatched payload of any existing flow**, in any lane (decision 2); what moves at
   L0-L5 is only what reads the PARSE — a `referenceTarget` caller typed on its old union, an assertion on `FD-V26`'s
   message text, the counted suites' counts — each named by W190's B′ copy. **`examples/l6.ts`'s forms census
   (`:12566`) does NOT move** unless an `EXPECTED` flow uses the token, which none does.
2. **W191's store is empty on every existing flow** (no corpus flow declares `$item`), so `DRIVER_FIELDS` moves by its
   NAME and no retention assertion moves by a VALUE; `RN-R13`'s text moves by one term.
3. **No item moves `CHECKPOINT_FORMAT`, `RUN_FOR`, `isFed` or `snapshot()`** (decision 5) — an item that finds it must
   is a stop-and-ask, not an edit.
4. **W192 moves `X10` by its block alone**, and no existing L6 row.
5. **(k) answered YES costs the publish three items and no BREAKING change beyond (h)'s one type.**

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q186](../questions/q186.md) | a reference to a large value inside a map — `$payload` is its largest instance (fact 11); `deferred`, its decision recorded, applied by (l) | — |
| [Q583](../questions/q583.md) | a join that fires before every branch settles — why (e) releases per INSTANCE, not per region; `deferred` | — |
| [Q166](../questions/q166.md) | *what does a map instance lose by receiving its own item* — `resolved`, *"Nothing it cannot ask for"*; true of the branch entry, false one hop later until W191 (fact 10) | W191 (a dated note) |
