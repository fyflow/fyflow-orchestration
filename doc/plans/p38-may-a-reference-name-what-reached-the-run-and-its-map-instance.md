# P38 — May a reference name what reached the run, and what opened its map instance?

**Status:** complete and retro'd 2026-10-19 — declared 2026-10-18 on `c43566f` (the tree clean), answering fyflow-app's *pass 1 follow-up, before the 0.8.0 publish*; facts 1-12 measured at this declaration; stop-and-asks (a)-(n) ANSWERED by the maintainer 2026-10-18, all as recommended — both references, in 0.8.0 (a), (k); spelled `$payload` (b); the union widened (h); W190-W192 done 2026-10-19; the exit artifact met on W192's final tree, `gate:full` EXIT 0 (Record below); the retro ran 2026-10-19 over `997c898`, and the maintainer answered its stop-and-asks (o)-(t) the same day, all as recommended, and asked for a `README.md` cleanup folded into this close (Retro section 8)
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

*Corrected at the Record, by pass 3 rule 6, 2026-10-19:* **(e)'s *released when that INSTANCE's branch goes terminal …
after which no node of that instance can be entered* is FALSE** where a join NESTED in the instance is fired before every
branch is terminal by a consumer's policy: the instance's branch arrives while a nested branch can still enter a node that
reads `"$item"` (W191's conformity reader, C1, a BLOCKER). (e)'s horizon is the clause after the dash; W191 releases on
it — the instance's branch terminal AND no branch of a region nested in it live (ADR 0118 rule 5, `RN-R13` v0.28). **And
decision 7's *a fourth retained term* is ADR 0046's count**: in `RN-R13` the term is its SIXTH (W191 prediction 1).

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

## Record

*Written 2026-10-19 over `997c898`, the tree clean before it. Every figure is read from the three items' own files; none
is re-measured here. Ids are bare text, as in P33's-P37's Records.*

**The items.** Each row is its own file's Record, which covers its declaration step, its provocations and its readers.

| item | built | spec | closed / raised | exceptions and rulings | the readers | L1-L5 / L6 after | confirming gate |
|---|---|---|---|---|---|---|---|
| **W190** `68f9f3b` | `"$payload"` on every `needs` site — a node's and an edge's, on a task, a map and an ask; `referenceTarget`'s union +2 MEMBERS, `'payload'` and `'item'` (BREAKING, a type; R2: two members, not (h)'s one); `FD-V26`'s `$` clauses at both sites — an array form, a `?` suffix, any other `$` token — each naming the fix; `"$item"` PARSED and REFUSED until W191 (R1); `compose` and `resolveNeeds` composing from the run's payload handed in explicitly at each door — the caller's at `FD-R4`, the header's in a run and on a resume, a copy per key per read; `entryWalk`'s map arm; an arrival composed through any `"$payload"` key wholly `unchecked` (R3); the L6 censuses' `NOT_YET_AT_L6` (R4); ADR 0117; one `run` snippet (the app's entry ask) | flow-definition v0.44 | — / — | none; **S-1** — a PRE-EXISTING `FD-R4` crash its own L2 case surfaced: `start()` threw a raw `UnresolvedBranchPath` for an ENTRY map whose branch task declared ANY `needs` and whose worker declared an `inputSchema`. **Answered by the maintainer 2026-10-19: W191 fixes it.** A first relay of that answer read alternative (b), *fix it in W190*; the fix was BUILT and then REVERTED on the maintainer's correction, byte-compared against the round-1 tree. ADR 0040 rules 2 and 5, ADR 0041's *not derivable* row and ADR 0101:50 (found by the premise grep, not named by this plan) a dated pointer each | conformity C1-C5, no BLOCKER — C1 (a test comment's *only "." at an entry*), C2, C3, C5 fixed, **C4 left** (`test/fold/result-value.test.ts:589`, outside `Owns`, harmless: `FD-V16`); **S-1 widened** (`"$payload"` on such a task crashes the same way); adequacy **A1** (*a copy per KEY* untested with two keys on one node or edge), **A2** (a resume ALIASING the stored header's payload), A3, A4, A6 fixed, A5 declared (R6); 34 probes, 31 killed, 3 declared equivalents (P19, P21, R6). **Overlap 1** | 82 / 2071; 2767 / 214 | `gate:item` EXIT 0, selftests 985.4 s |
| **W191** `9aa51b1` | `"$item"` composed: the INNERMOST map region containing the reader as a member (`innermostMapOf`, an ADDITIVE export, R1); `FD-V26`'s interim refusal RETIRED; `FD-V49` at a node and an edge, naming both fixes; `Driver.items` — `kept` from the document, `held` per instance BY REFERENCE (its OWN copy where the element may be the CALLER's, R3), released once nothing of the instance may still be entered — its branch terminal AND no branch of a region nested in it live — and at the four run-level moments (R4), rebuilt by the replay; `FD-R4` composing from the walk's element; `compose` deriving a branch path only for a NODE reference (S-1 FIXED, a `"."` and a `"$payload"` regression case); `checkWiring` over the enclosing map's item arrival, `unchecked` for an entry map or two arrivals (R7); `DRIVER_FIELDS` +1; ADR 0118; one `run` snippet (the app's map-branch ask) | flow-definition v0.45 (`FD-V49`), run-state v0.28 (`RN-R13`'s SIXTH term) | — / — | none; W190's S-1 fixed as answered; W190's R6 no longer an equivalent (D8 KILLED); ADR 0117 rule 7, ADR 0040 rule 2 and ADR 0046 rule 3 a dated pointer each; Q166 a dated note | round 1 — conformity **C1 BLOCKER** (an item released EARLY: a join NESTED in the instance, fired at its first arrival by a consumer's policy, let the instance's branch arrive while the nested fanout's other branch could still enter a node reading `"$item"` — `itemOf` threw, the run HALTED on a valid document; ADR 0118 rule 5's and `RN-R13`'s *after which no node of the instance is entered* false), C2-C6; adequacy **A1** (*per INSTANCE, never with the region's join* untested — every case `liveToken`), A2-A5. **Round 2**, one reader on C1's fix alone: the fix CORRECT over thirteen shapes, FOUR clauses unbound (the instance key's depth, a nested branch ending `lost` or `exited`, per-instance counting, nesting deeper than one level), two declared equivalents, one text NIT. 61 probes, 56 killed, 5 declared equivalents. **Overlap 1** (round 1; round 2 a single reader, none measured) | 84 / 2098; 2767 / 214 | `gate:item` EXIT 0, selftests 1036.6 s |
| **W192** `997c898` | the `W192 exit` block — the header's five clauses and a sixth beyond it (the release horizon on real workers), **22 claims over 8 runs**, on a threaded and an inline pool; `NOT_YET_AT_L6` REMOVED, the reference censuses reading the block's own flows (X11, X12) | none | — / — | none; readings R1-R6 (R4: *no kind the control lacks* as a set difference — the resumed run's kinds less the control's exactly `interrupted` and `resumed` — ACCEPTED by the conformity reader) | conformity **C1 SHOULD** (the copy flow's *the caller's write reaches none* could not fail — its entry is a map, so every `touch` is handed INSIDE `start()`, before the caller writes), C2-C4 NITs; adequacy **A1 SHOULD** ((5)'s *nothing handed* could not fail — the refused flow entered through an ask, which hands nothing anyway), A2-A4, and its own seven mutants E1-E7 KILLED in node and deno; the author's first pass found the POOL claims unbound (X1, X14, X15 — each read a TYPE NAME's pool); 40 probes, 39 killed, D17 declared. **Overlap 1** (clause (6)'s instance-1 race, C2 = A2) | 84 / 2098; **2789 / 222** | **`gate:full` EXIT 0**, 11/11 self-tests, 2272.9 s |

**Every confirming gate was green on its FIRST run, one command each** (sentence C), firefox and webkit NOT RUN in any;
every `npm run gate` the three Records report before and after their readers was EXIT 0. **No item raised a question
or closed one. No item took an exception — the second plan running. The readers' overlap, every Record stating its own:
1, 1, 1** (W191's round 2, a single reader, measured none).

### The exit artifact, measured

| the exit sentence's clause | what was built and measured (W192's Record and its *How each exit clause is asserted*) | verdict |
|---|---|---|
| on the final tree, ONE cross-row block in `examples/l6.ts`, green in node 24 and in deno | the `W192 exit` block; **2789 / 222, 0 failed in node 24.20.0 and deno 2.9.6** — in `npm run gate` and `test:l6` / `test:l6:deno` 4/4 each before the readers (none flaked: clauses (2) and (6) are arranged by latches and hold times), after them, and in `gate:full` | **met** |
| (1) an ENTRY ask answered, its successor on a THREADED pool receiving `{ invoice, answer }`; an edge predicate on that task routing on `needs.run.amount`, one run each way | two runs, 120 and 50, each the other's control: nothing handed at the park, the `asked` element `{ invoice: P }`; `pay` handed `{ invoice: P, answer: { approved: true, by: 'ana' } }` on a pool read back off the HANDED task as `threaded` (C3); 120 handed `[pay, audit, file]` and 50 `[pay, file]`, `completed`. The predicate is the `when` subset (R2), the app's and `AGENTS.md`'s own example; X13 (both runs at 120) kills the route | **met** |
| (2) a `map` whose branch is an ask followed by a task on an INLINE pool, each task its OWN item beside its own answer, at an arity of at least three | three instances, answered OUT OF ORDER (2, 0, 1), each next answer only after the previous instance's branch ARRIVED (R6 — the map's `branch.arrived` order `['2', '0', '1']` is a claim); each `pay` handed `{ invoice: item_i, answer: { approved: true, by: 'p<i>' } }` on `inline`; `audit` for 0 and 2 only, on `threaded`, reading `"$item"`, `"$payload"` and `"."` two hops in. D11 (the first held instance's item) and X4 (answered in order) kill it | **met** |
| (3) the copy claim over a NESTED payload and NESTED items, both ways — a caller mutating after `start()`, a worker mutating a nested field — changing nothing any other node or instance receives | TWO keys of each token on ONE node and ONE edge (W190's A1); an INLINE worker and a registered predicate writing a nested field of each, every writer's own object SHOWING its write (X2, X3, X9) beside the second key, the next THREADED node and the other instances reading `original`; the caller's direction read off `check`, handed AFTER both writes (C1's fix), and off clause (1)'s header, `asked` element and hand-offs. Killed by an ALIAS and a SHALLOW copy of each of `compose`'s and `resolveNeeds`' two arms (D1-D8, node and deno) | **met** |
| (4) a run parked at an ask in a map instance, STOPPED and resumed on a fresh runtime: the successors the uninterrupted control's values, the header the five keys at `format: 1`, no fold-input kind the control lacks | instance 1 answered and ARRIVED on A before the stop (R5, W191's C5), the asks stored with no resolution `[review:0, review:2]` (C4); the header `[entryPayload, flowId, format, runId, version]`, `format` 1; on B `completed`, B handed exactly `[audit@0, audit@2, pay@0, pay@2]`, equal to clause (2)'s run; the kinds against that run both ways `[['interrupted', 'resumed'], []]` — R4's reading of *no kind the control lacks*. D16 (no rebuild) kills it; a store rebuilt from the WRONG element is refused by the replay's divergence check first (A4, noted) | **met**, under R4's reading |
| (5) a flow naming the item outside any map instance refused at construction with the finding that names the fix | `validateDefinition`: `['FD-V49']` at `report`, the detail naming `"."` and *move this node inside the map*, its `"."` control `[]`; `start()` of a flow whose ENTRY task reads `"$item"` throwing `InvalidDefinition` naming `FD-V49` with nothing handed, beside its `"."` control that STARTS and IS handed (A1's fix — the eighth run) | **met** |
| `npm run gate:full` EXIT 0 — the LAST item runs it | W192, ONE command on the final tree after the readers' items: the ladder, then 11/11 self-test lanes ok, `check:register:selftest` included, 2272.9 s | **met** |
| *beyond the header* — (6) the release horizon on real workers (R1) | three instances each nesting a fanout in a fanout, both inner joins fired at their FIRST arrival by a consumer's policy, the reader two levels down: instances 0 and 2 ARRIVE before their `x` is entered, instance 1 after, held at `l` AND `p` so neither branch of the race fires first (C2/A2's fix); each `x` its own item, `completed`. W191's C1 restored (D12) halts the run | **met** |

**The counts across the plan**, each from the items' gate tables: L1-L5 **80 / 2047 → 84 / 2098** in node, deno and
chromium; L6 **2767 / 214 → 2789 / 222** in node and deno; `check:spec` **7 / 81 / 151 → 7 / 86 / 152**; `check:docs`
**47 → 49 `run` snippets** (6 `check`); `spec/examples/invalid/` **47 → 52**; spec/flow-definition **v0.43 → v0.45**,
run-state **v0.27 → v0.28**, outcome-record, join-policy and task-id unmoved; next free rule ids `FD-V50`, `FD-C9`,
`FD-R7`, `RN-R43`, `OR-R14`; `DRIVER_FIELDS` +1; `NOT_RUN_STATE`, `CHECKPOINT_FORMAT`, `RUN_FOR`, `isFed` and
`snapshot()` unmoved; `doc/concept.md` untouched.

**What the plan answered — yes, both references.** A `needs` reference may name the value that reached the RUN,
`"$payload"` (ADR 0117), and inside a `map` instance the item that opened it, `"$item"` (ADR 0118) — on a node's `needs`
and an edge's, on a task, a map and an ask; always there, so neither has a `?` form; each a copy per key per read; refused
at construction where it means nothing (`FD-V26`'s `$` clauses for the form, `FD-V49` for an item outside any map
instance); and derived again on a resume with nothing new in the checkpoint — `"$payload"` reads the header the driver
already kept, `"$item"` state the map arm writes and the replay rebuilds, `CHECKPOINT_FORMAT` 1. The app's two cases need
no pass-through task (fact 3). **Beside it**, a pre-existing crash was removed: `start()` no longer throws
`UnresolvedBranchPath` for an entry map's branch task with any `needs` and an `inputSchema` (S-1, W191).
**fyflow-app's request**: every clause BUILT as (a)-(n) answered, in the spelling (b) chose — `"$payload"`, not the app's
`"$input"`; (j)'s two sites compose nothing, as the plan said. **What 0.8.0 ships as BREAKING from this plan** ((h)):
`referenceTarget`'s return type gains `{ form: 'payload' }` and `{ form: 'item' }`, each with `node: null`. Additive: the
two tokens (refused by every tree before), `FD-V49`, `innermostMapOf`.

**Predictions, scored against the items' Records.**

| | prediction | verdict | evidence |
|---|---|---|---|
| 1 | W190 moves no fold input and no dispatched payload of any existing flow; what moves at L0-L5 only reads the PARSE; `examples/l6.ts`'s forms census does NOT move unless an `EXPECTED` flow uses the token | **HOLDS for `src/`** — the `src/` change alone moved nothing, L0-L6; **REFUTED for the census half**: two L6 censuses and the L1 table bound moved with NO flow using the token, because they count the spec TABLE's rows — the predicate was wrong | W190 M2, M3 |
| 2 | W191's store empty on every existing flow; `DRIVER_FIELDS` moves by its NAME, no retention assertion by a VALUE; `RN-R13`'s text by one term | **HOLDS** — the term is `RN-R13`'s SIXTH (decision 7's *fourth* was ADR 0046's count, corrected above) | W191 M2, M5, prediction 1 |
| 3 | No item moves `CHECKPOINT_FORMAT`, `RUN_FOR`, `isFed` or `snapshot()` | **HOLDS** — none edited; the header five keys at `format` 1 at L2 (W190, W191) and at L6 (W192 (4)) | W190 M5; W191 prediction 2; W192 (4) |
| 4 | W192 moves `X10` by its block alone, and no existing L6 row | **HOLDS** — 2767 / 214 → 2789 / 221, the block's 22 claims and 7 runs, and 2789 / 222 after its readers ((5)'s control run); no `EXPECTED` row, pair row or other block moved | W192 prediction 1 |
| 5 | (k) answered YES costs the publish three items and no BREAKING change beyond (h)'s one type | **HOLDS** — three items, W193 unused; the one BREAKING change is (h)'s type; `innermostMapOf` is ADDITIVE (W191 R1) and S-1's fix removes a crash | W190-W192 |

**The D′ paragraph's census predictions** (*Work items*), scored the same way: **right at every site it named but
one** — `RUN_FLOOR` 47 → 48 → 49; `LATE_SUITES` +2 and a count case at W190 and W191, none at W192; `spec/README.md`'s rows
(v0.44, v0.45, v0.28); `DRIVER_FIELDS` +1 at W191 and not at W190; `X10` at W192 alone; the four L6 reference censuses
at W190; `spec/examples/invalid/` one per new clause. **The one it over-forecast**: `NOT_RUN_STATE`, which W191 measured
UNMOVED (the byte walk serialises `items`). **Short at three sites**, each found by its own lane or grep before an edit,
none needing an exception: `check:spec`'s two count sentences (W191, in `Owns`); ADR 0101:50's *at an entry only `"."`*
(W190 M6, the PREMISE grep, a record-step file); and the census-reading-the-TABLE predicate (prediction 1). **And W190
designed AROUND its `Owns`**: a new L6 census clause would have moved `X10` in `examples/README.md`, outside the row, so
R4 named the not-yet-run rows in a list the two EXISTING clauses read instead (W190 M3) — which W192 removed.

**Questions**: **raised none; closed none.** [Q166](../questions/q166.md) gained a dated note at W191's record step;
[Q599](../questions/q599.md) (no P38 run turned its rows red) and [Q583](../questions/q583.md) (W191's C1 is its shape,
reached through the public seam) gain one each at this Record; both stay deferred. [Q186](../questions/q186.md) is applied
by (l) unchanged. `npm run q -- --where status=open` lists **Q580, Q581**.

**Handed on**, each with its owner — gathered from the three items' Out sections, Notes and readers:

| hand-off | from | owner | where it is recorded |
|---|---|---|---|
| **the reply to fyflow-app** — the spellings `"$payload"` and `"$item"` ((b), not `"$input"`), the rule ids (`FD-V26`'s `$` clauses, `FD-V49`), `AGENTS.md` section 3's two subsections and their `run` snippets, (j)'s two sites unchanged and why, (l)'s cost, and that 0.8.0 is committed and UNPUBLISHED until (s) | (n) | **the coordinator — OWED**, written from this Record, outside this repository | this Record |
| orchestration **0.8.0**, published after this plan (P36 (v) deferred it for the maintainer's chores; (k) put P38 in it) | (k); P36 (v) | **the maintainer** — (s) | Retro section 8 |
| (e)'s premise, *after which no node of that instance can be entered*; decision 7's *a fourth retained term* | W191 C1; W191 prediction 1 | **done** — corrected in place at this Record (pass 3 rule 6) | this plan |
| W190's S-1 — the pre-existing `FD-R4` crash on an entry map's branch task with `needs` | W190 | **done** — W191, as the maintainer answered | W191's Record |
| `test/fold/result-value.test.ts:589` reads a spelling `!== '.'` as a node id | W190 C4 | **left** — harmless (`FD-V16`); outside every row — no owner | W190's Record |
| `test/definition/needs.test.ts`'s case names *the five spellings* (seven now), and `test/driver/map-item.test.ts`'s suite name *released by its branch's terminal event* (the horizon is now wider) | W191 | **left** — case and suite NAMES are census-bound (`l4-corpus`) — no owner | W191's Record |
| D17 — the release horizon not tracked during a replay — survives at L6: a leak, never a value | W192 | **stands** — L2 holds the rebuilt store across an ended instance (W191's C5 case) | W192's Record |
| a store rebuilt from the WRONG element is refused by the replay's divergence check, not by clause (4)'s values | W192 A4 | **noted** — D16 (no rebuild) is killed by the values | W192's Record |
| an INLINE pool hands the worker the composed object itself; a threaded pool clones (W192 M3) | W192 | **the maintainer** — (r) | Retro section 5 |
| P36's retro (s): B′, C, D′ with five clauses, E, the three brief sentences | P36's retro | **done** — copied into the declaration and FOLLOWED; Retro section 2 | this plan |
| the byte copies and probes `C:/tmp-w190`-`C:/tmp-w192` and the session scratchpad's probes | every item | **the maintainer** — left in place, outside the repository; nothing reads them | each item's Record |

## Retro

*Pass 3 ran on 2026-10-19 over `997c898`, the working tree clean before it, in a subagent at the coordinator's request.
Every figure is read from the three items' Records; this retro re-ran no harness and no measurement, and `npm run gate`
only to confirm its own edits. **Its routings and proposals are put to the maintainer in section 8; none is acted on
outside the record step's four files.***

### 1. The asks

| item | widenings (rule 6), each answered | design, each answered | reader defects | raised / closed |
|---|---|---|---|---|
| P38's declaration | — | (a)-(n), all as recommended | — | — |
| W190 | — | **S-1** — the maintainer: *W191 fixes it* (after one mis-relay, built and reverted) | 2 (A1 a copy per key, A2 a resume's alias — test gaps; S-1 pre-existing, found by the item's own case) | — |
| W191 | — | — | 5 (C1 BLOCKER; round 2's four unbound clauses — one family: the release horizon) | — |
| W192 | — | — | 2 (C1, A1 — two vacuous absence claims, one family) | — |
| **P38** | **0 exceptions** | **1 maintainer answer (S-1)** | **9**, three families | **0 raised, 0 closed** |

**No exception in any item, the second plan running.** The one design ask was a PRE-EXISTING defect, asked under
section 1 rule 6 rather than raised — and the cost was in the relay, not the rule (section 4 (g)).

### 2. The `Owns` and the census sites — B′, C, D′ and E held

**D′ was FOLLOWED as written and held**: every row touching `AGENTS.md`, `spec/flow-definition.md` and `examples/l6.ts`
owned the whole file and said so (*a parenthetical is a forecast*, P36's clause — W190 and W191 both cite it); the PREMISE
grep found ADR 0101:50, which the plan did not name (W190 M6); the SIBLING grep found no other list naming `FD-V47`'s
siblings (W191 M6). **B′ held**: every census site was found by its own lane in the copy before its edit (Record, *The D′
paragraph's census predictions*). **C held**: every confirming gate green on its first run. **E held**: every probe ONE
clause; the readers' survivors were re-cut alone (W190 R1-R12, W191 R1r-R12r and H1-H5, W192 R1-R6).

**What D′ still did not say** is one thing, met once and then applied as a prediction that held:

| site | met at | cost |
|---|---|---|
| a census that reads a SPEC TABLE — `referenceFormsInSpec()`, `REFERENCE_SPELLINGS_IN_SPEC`, `needs.test.ts`'s table bound — moves with the TABLE's rows, not with the flows that use them | W190 M3 (prediction 1's *unless an `EXPECTED` flow uses the token*); applied by W191 as its prediction 3, and it HELD | no exception: two L6 clauses and an L1 bound red in the copy, before the edit; and W190's R4, a design chosen to keep `X10` inside `Owns` |

### 3. The readers, and the overlap

| item | conformity | adequacy | overlap | ordinal |
|---|---|---|---|---|
| W190 | C1-C5, no BLOCKER; S-1 widened | A1-A6; 34 probes, 31 killed, 3 equivalents | **1** — `FD-R4` over an entry map's branch task (A5, the walked value; the widening of S-1) | 112th |
| W191 | C1 BLOCKER, C2-C6; **round 2**: one reader, the fix correct, four clauses unbound | A1-A5; 61 probes, 56 killed, 5 equivalents | **1** — the per-INSTANCE release under a join that fires before every branch is terminal (C1, nested; A1, the map's own join) | 113th |
| W192 | C1 SHOULD, C2-C4 | A1 SHOULD, A2-A4; E1-E7 KILLED; 40 probes, 39 killed | **1** — clause (6)'s instance-1 race (C2, A2) | 114th |

**Every Record states its overlap** — the brief sentence held for the third plan running. **Three measurements, all
inside section 6's 0-4 band.** W191's round 2 was ONE reader and measures nothing. **The ordinal is a hundred and
fourteen, so the next is the HUNDRED-AND-FIFTEENTH** — for `doc/workflow.md` by (q).

**The readers are the mechanism for the thirteenth plan running**, and **this plan adds a second ROUND to it.** Every
defect of P38 that reached a reader was found AFTER the author's own set ran green over it: W191's C1 after 42 of 45 probes
killed and three declared equivalents — a horizon the plan's own (e) stated wrongly and every case exercised under
`liveToken`; then W191's round 2, after 52 probes killed, found four clauses of the FIX unbound, one of which (the instance
key's depth under an outer fanout) was C1 again. W192's C1 and A1 after 33 of 34. The authors' finds were MEASUREMENTS and
PROVOCATIONS, each before the readers: W190 M3 (the census reads the table), W190 P4 (a refusal message's prefix), W191
W3 (a map with two arrivals), W192 M3 (an inline pool does not clone) and X1/X14/X15 (the pool claims unbound).

### 4. Rules followed that failed, and the rung (pass 3 rules 3 and 5)

| candidate | followed? | caught by | verdict |
|---|---|---|---|
| **(a) the COPY claim's probe set** — P36's third brief sentence, *an ALIAS and a SHALLOW copy, over a NESTED fixture, read both ways* | **FOLLOWED** in all three items; at W190 it was met one DIMENSION over: *a copy per KEY* satisfied by a copy per SITE, because no case put two keys on one node or edge (A1) | the adequacy reader (W190 A1) | **The set extended by one clause, then HELD**: W191 and W192 carried *two keys on one node and one edge*, and W192's adequacy reader's E5 and E6 (one clone shared by two keys) were KILLED at L6 in both runtimes. P36's finding (b) — *a lesson stated as a layer is met at the next layer* — recurred once and was closed by naming the dimension. Proposal B carries it in the sentence |
| **(b) an observer is vacuous until a control shows it sees** — carried by every brief since P35 | **FOLLOWED** at W192: every writer's own object SHOWS its write (X2, X3, X9), the observers live — and still TWO claims of ABSENCE could not fail: *the caller's write reaches none* was read on objects handed INSIDE `start()`, before the caller could write (C1); *nothing handed* was read on a flow that hands nothing at its start anyway (A1) | the conformity and adequacy readers, one finding from two sides | **The sharpest finding of P38 (rule 3)**: the control showed the observer SEES; it did not show the observer could see THIS event. **Kin to W182's A3** (an event observer never shown live on B) and P36's (b). Proposal B states it as the probe: *a claim of absence is shown able to fail by a control on the SAME observer, taken AFTER the event it denies* |
| **(c) a premise the plan WROTE rather than measured** — (e)'s *released when that INSTANCE's branch goes terminal … after which no node of that instance can be entered* | the item built to the plan's words; its cases all used `liveToken`, under which the premise is true | **W191's conformity reader, constructing a counterexample** (a consumer's early-firing policy on a NESTED join) — a BLOCKER; round 2 then found the fix's own depth, per-instance and deeper-nesting clauses unbound | **The third plan running** (P35's `sameData`, P36:409-411, P38 (e)) — and the first where it shipped to the readers as a BLOCKER. D′'s premise grep finds premises in the TREE; this one was in the PLAN, about a horizon, and the item cited it. **Corrected in place** (rule 6). Proposal B: *a premise sentence about when something can no longer happen is attacked with a constructed counterexample at the declaration step* — and *a release horizon is provoked by an early-firing policy, by nesting deeper than one level, and per instance with at least two instances* |
| **(d) a census that reads a spec table** | — | W190's B′ copy (M3), before an edit | **D′ gains a clause** (section 2); W191 applied it and held |
| **(e) a second, focused reader round after a BLOCKER's fix** | not a rule: W191's coordinator ran one, as P35's W180 ran a second round of both readers | the round-2 reader: four unbound clauses, one of them the BLOCKER again under an outer fanout | **Two occurrences, two items, two plans** (W180: R4 and R13 found in round 2; W191: R2-1 to R2-5) — and W184's BLOCKER fix (P36) had no second round, so no measurement there. Rule 2's bar is met. Proposal C, (p) |
| **(f) test and harness lessons** — a substring assertion on a refusal message that is a PREFIX of a sibling clause's message (W190 P4: the array clause disabled for nothing); a fixture SPREADING its overrides before `edges`, so the first L1 edge cases tested nothing (W191); a pool claim reading a TYPE NAME's pool rather than the pool the task was handed to (W192 X1, X14, X15, and C3 one step further: the definition's pool rather than the hand-off's); an arrangement held by delay on ONE branch of a race (W192 C2/A2); pool capacity and an inline pool's aliasing as part of the arrangement (W192 M3, M4) | each caught by the author's own one-clause provocations and its grader control (G2 graded CLEAN where WRONG-REASON was declared — the control did its job by failing), by a failing assertion, or by the readers | the provocations; G2; the readers | **No change to a rule**: one occurrence each, and the mechanisms worked. The race and the pool claim go into Proposal B's sentence beside (b), where they share a cause: an observation taken on a different object, or at a different time, than the claim's |
| **(g) S-1's answer, relayed** — the maintainer's terse answer to a three-option stop-and-ask was relayed as alternative (b) where the maintainer meant the recommendation | section 1 rule 6 was FOLLOWED (asked, not raised); the item acted on the relay as given | the maintainer, correcting it | **Not the workflow's**: the item could not tell; the coordinator could have. One build and one byte-compared revert. (t) |

**Pass 3 rule 5 over P38's defects**, by what caught them: **a rung in `gate`** — `check:spec`'s count sentences (W191),
L6 `cross-row` and the L1 table bound (W190 M3, W191 M3), `DRIVER_FIELDS` (W191 M2), every census site in B′'s copies;
**the authors, measuring and provoking** — W190 M3, P4; W191 W3 and the fixture order; W192 M3, X1/X14/X15; **the
conformity readers** — W190 C1-C5 and S-1's widening; W191 C1-C6; W192 C1-C4; **the adequacy readers** — W190 A1-A6;
W191 A1-A5; W192 A1-A4; **the second round** — W191 R2-1 to R2-7. **No rung would have caught** the early release (a
consumer's policy at L2 would have — no case had one), the two vacuous absence claims, or the per-key copy: each is an
arrangement no lane can see is missing.

**The flaky rows ([Q599](../questions/q599.md)).** **None went red in any P38 run its Records report** — every gate of
W190 and W191 that reached L6, W192's four node and four deno runs before its readers, its runs after them and its
`gate:full`. A dated note is added; it stays deferred.

### 5. The scheduler

**No S entry raised.** **Measured at the pin, none of them an S entry**: **an INLINE pool hands the worker the object
`addTask` was given ITSELF, and a THREADED pool a clone** (W192 M3) — so an alias or a shallow copy in the driver's
composition is visible on real workers only through an INLINE writer; its `AGENTS.md` says `context.emit`'s `data` is
cloned *on inline pools too* and says nothing of the task's input. The second inline-pool fact in two plans: P36's was
*`task.running` fires inside `addTask`* (W186 M3), left out of `CLAUDE.md` by P36 (u). And the default pool —
`maxThreads: 2 × maxConcurrentTasks: 1` — serialises held tasks (W192 M4, documented). **No contract was found broken.**
(r).

### 6. Proposals (pass 3 rule 4), ranked

**A. Recommended for the workflow: NO CHANGE to a rule** but (p)'s, which is offered with the alternative of a brief
sentence. B′, C, D′ and E held; every Record stated its overlap; no item took an exception; every defect was caught before
its Record by a reader or the author's own provocations.

**B. Recommended, for the NEXT plan's author, not the workflow** — B′, C and E carried UNCHANGED; D′ carried with its five
clauses and **one added** (section 2): *a census that reads a SPEC TABLE moves with the table's rows, not with the flows
that use them*. **The three brief sentences**, the copy sentence widened by its own dimension — *a COPY claim is provoked by
an ALIAS and by a SHALLOW copy, over a fixture whose value is NESTED, read in both directions, **and with two keys on one
node and one edge where the claim is per key*** — and **three added** (section 4 (b), (c), (f)):
- ***a claim of ABSENCE is shown able to fail by a control on the SAME observer, taken AFTER the event it denies; an
  arrangement held by delay holds BOTH branches of its race; a claim about a pool reads the pool the TASK was handed to***;
- ***a premise sentence about when something can no longer happen is attacked with a constructed counterexample at the
  declaration step, not cited***;
- ***a retention or release horizon is provoked by an early-firing policy, by nesting deeper than one level, and per
  instance with at least two instances***.
- **Replaces**: P38's D′ and brief sentences in the next plan's declaration.
- **Saves**: W191's BLOCKER and its round-2 findings; W192's C1 and A1; W190's A1.
- **Ledger**: kin to the *`Owns` pre-declaration* row (14 refusals), as P34's-P36's B were — not proposed as a rule or a
  check. **No next plan is named** anywhere in the tree, so B is carried HERE, for its author to copy as P38 copied P36's.

**C. Offered for the workflow, or for the brief: a BLOCKER's fix is read again** — section 4 (e), (p).

**D. Offered for `CLAUDE.md`: the inline pool's two facts in one bullet** — section 5, (r).

### 7. Refusals, and what this retro changed

- **A check over `doc/` — considered and NOT proposed; it would be the 37th refusal, P2-P38.** P38's text defects were a
  spec row's value list omitting `"$item"` (W191 C2), an `AGENTS.md` sentence true only of one shape (W191 C3), a test
  comment stating a falsified premise (W190 C1) — each found by a reading, and the census that DOES read the spec (the
  table censuses) did its job. The row's standing ground holds. **No other ledger row is re-raised.**

| file | why |
|---|---|
| this plan | the Status line; the dated correction under the stop-and-asks of (e)'s premise and decision 7's count (pass 3 rule 6, W191 C1 and prediction 1); this Record and Retro |
| `doc/questions/q599.md` | a dated paragraph — none of its three rows red in any P38 run its Records report; still `deferred` |
| `doc/questions/q583.md` | a dated paragraph — a consumer's policy through `StartOptions.joinPolicy` already fires a join early, and W191's C1 was that shape releasing a map instance's item; the library is now tested under it at L2 and L6; still `deferred` |
| `README.md` | *More examples* gains two rows for what 0.8.0 ships from this plan — a reference to what reached the run, `"$payload"`, and to what opened the map instance, `"$item"` (both section 3); no snippet, no claim beyond `AGENTS.md`'s |

`doc/decisions/**` already carries every pointer the items' record steps owed (ADR 0040, 0041, 0046, 0101, 0117) and the
two new ADRs; Q166's note was W191's. **Not edited**: `doc/workflow.md` ((p), (q)), `CLAUDE.md` ((r)).

**Ids.**

- **Issued**: W190, W191, W192; ADR 0117, ADR 0118; no question; no S entry.
- **Reserved and unissued, SKIPPED and never reissued** (section 3):
  - W193 CLOSED unissued, as the declaration expected;
  - Q700-Q704 SPENT (W190's), Q705-Q709 SPENT (W191's), Q710-Q713 SPENT (W192's), Q714-Q719 SPENT (the plan's). None
    exists in the tree;
  - ADR 0119 SKIPPED — every answer fitted the two ADRs decision 7 named.

**The next plan starts at W194, Q720 and ADR 0120.** The next S id is S13; the next plan id is P39.

*`npm run state` before this section printed the tree's W193 / Q710 / ADR 0119 against the ledger's W190 / Q700 /
ADR 0117, the ledger being P36's sentence. P38 closes W193, Q710-Q719 and ADR 0119 unissued — P36's precedent for W189,
Q680-Q699 and ADR 0115-0116; after this section the two AGREE at P39, W194, Q720 and ADR 0120. None of section 8's
recommendations takes an id.* **No plan or retro names the next plan**; the candidates the tree holds are the two open
questions, [Q580](../questions/q580.md) and [Q581](../questions/q581.md) — both about text that ships — and (s).

### 8. Stop-and-asks for the maintainer

**Lettered after the declaration's (a)-(n). Each site is OUTSIDE the record step's four files and is NOT edited here.**
**ANSWERED by the maintainer, 2026-10-19: (o)-(t) as recommended.** (o) and (p) are carried in section 6 for the next plan's author; (q)'s three edits and (r)'s bullet are made in this close's commit, `check:budget` and `check:budget:selftest` re-run; (s) — publish from the commit carrying this Record after the chores, when the maintainer says so; nothing is published here; (t) is the coordinator's own note, outside this repository.

**And a chore the maintainer asked for at this close, folded into its commit**: `README.md` trimmed to what a person using the library needs ([ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) decision 1) — the opening's reasoning, the install section's two paragraphs, and the section introductions shortened; and the comments inside its three examples cut to what the code does (ADR and rule-id citations and internal reasoning removed, the assertions kept under one *Verified by the docs gate* line). `X8` holds each example byte for byte to its `AGENTS.md` snippet, so sections 2, the routing section's runtime snippet and 15 of `AGENTS.md` carry the same cut. The `X8` and selftest anchors (*THE REGISTRY — what exists.*, *THE FLOW — a DECISION, a FAN-OUT, a JOIN.*, the `hello world !` literal) are kept. The release sentence changed, so [Q581](../questions/q581.md) gains a dated note.
The package ships `dist/`, `README.md` and `AGENTS.md` only, so nothing below but (s) touches what it ships.

| | the question | recommended | the alternatives |
|---|---|---|---|
| **(o)** | **Proposal B** (section 6): what the next plan's author copies into its declaration | **YES — carried in this retro**: B′, C and E unchanged; D′ with its five clauses and one more (*a census that reads a spec TABLE moves with the table*); the three brief sentences, the copy one widened (*with two keys on one node and one edge where the claim is per key*), and three added — *a claim of absence shown able to fail by a control on the same observer, taken after the event it denies; an arrangement held by delay holds both branches of its race; a pool claim reads the pool the task was handed to*; *a premise about when something can no longer happen is attacked with a counterexample at the declaration step*; *a release horizon is provoked by an early-firing policy, nesting deeper than one level, and per instance with at least two instances* | **Carry P38's sentences unchanged** — the absence claims, the horizon and the premise are then found by readers again, at the cost P38 paid (a BLOCKER, a second round, two SHOULDs); or **make any of them a workflow rule** — the *`Owns`* ledger row's fifteenth refusal, against `doc/workflow.md`'s 168 bytes of headroom |
| **(p)** | **A second, focused reader round after a BLOCKER's fix.** W191's found four clauses of the fix unbound, one of them the BLOCKER again under an outer fanout; P35's W180 second round found two defects. Two occurrences, two plans | **As a sentence in the next plan's brief, not a rule**: *a BLOCKER's fix is read again before the confirming gate, by one reader on the fix alone, who reports the fix's clauses no case binds*. No bytes in the always-read set | **A rule in `doc/workflow.md` section 6**, after *both **report; they do not fix***: *"**A BLOCKER's fix is read again, by one reader on the fix alone, before the confirming gate** — W180's and W191's second rounds each found it incomplete."* — about 160 bytes of the 164 left after (q), v0.31 and a version-index line, which do not fit; or **neither** — the next BLOCKER's fix is confirmed by the author's re-run alone, which killed 52 of 55 probes over W191's fix while four of its clauses were unbound |
| **(q)** | **`doc/workflow.md`'s bookkeeping**, the three edits P33's-P37's retros made: the Status line *run to completion THIRTY-SEVEN times*, by P1 through P37 → ***THIRTY-EIGHT times**, by P1 through P38*; section 6 *a hundred and eleven, so the next is the HUNDRED-AND-TWELFTH* → *a hundred and fourteen, so the next is the HUNDRED-AND-FIFTEENTH*; the ledger's first row ***36 times**, P2-P37* → ***37 times**, P2-P38*. And does P38 join the *adopted nothing* list? | **YES to the three edits** (+4 bytes of 168), **no version, no index entry**; **P38 does NOT join the list** if (o) is answered YES — B is adopted sentences, the reading at P33 (i) … P36 (t) | **The next plan's retro makes them**; or **P38 joins the list** if (o) and (p) are NO |
| **(r)** | **`CLAUDE.md`'s *Facts about fyflow-scheduler that catch people out*** lacks two inline-pool facts, now met in two plans: `task.running` fires inside `addTask` (P36, W186 M3 — (u) answered LEAVE), and the worker is handed the input object ITSELF where a threaded pool clones it (P38, W192 M3). Neither is in the scheduler's `AGENTS.md` | **One bullet, both facts** (about 290 bytes of 470): *"- **An INLINE pool fires `task.running` inside `addTask`, and does not clone**: the worker is handed the object `addTask` was given, where a threaded pool hands a clone — so an alias is visible on real workers only through an inline writer (W186 M3, W192 M3)."* — `check:budget` and `check:budget:selftest` re-run with it. Rule 2's two occurrences are met, which (u) was not | **LEAVE it again** — `RN-R40`, W192's M3 and its L6 writers hold both where the code meets them, and each was caught by a measurement before harm; or **raise an S entry (S13)** asking upstream to state both in its `AGENTS.md` — the workaround is the driver's own per-key copy, so it is a wish, not a blocker |
| **(s)** | **Publishing orchestration 0.8.0** — P36 (v) deferred it for your chores, and (k) put P38 in it. Nothing in the four files blocks it: the manifests read `0.8.0`, the scheduler peer is 0.6.0 in both registries, `AGENTS.md` states (h)'s BREAKING change where it changes, and this record step added `README.md`'s two rows. **The two open questions, Q580 and Q581, both concern text that ships** (a sentence that the envelope worker is served beside a bundle; the README's release statement) | **Publish from the commit that carries this Record**, `npm run gate:full` green on it first (a doc-only diff over W192's `gate:full` tree), `runtimeCompat` set on jsr.io by the maintainer; no version bump and no repository edit — after the chores, and with Q580 and Q581 answered or explicitly left if they are among them | **Hold for the chores** (the state since P36 (v)); or **publish from `997c898`**, without this Record's `README.md` rows |
| **(t)** | **The relay of a terse answer.** S-1's answer was relayed as alternative (b) where the maintainer meant the recommendation; W190's author built (b) and reverted it on the correction. Section 4 (g) | **A coordinator's working note, outside this repository** (its own memory): *a one-word answer to a stop-and-ask with lettered alternatives is confirmed BY LETTER before it is relayed as an instruction*. No repository edit | **A sentence in `doc/workflow.md` section 1 rule 6** — the workflow governs items, and the item could not have known; or **nothing** — one occurrence, one build and one byte-compared revert |
