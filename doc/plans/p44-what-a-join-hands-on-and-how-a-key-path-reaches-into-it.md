# P44 — What does a join hand on, and how does a key path reach into it?

**Status:** declared 2026-10-24 — on `bdbdb1c` (the tree clean, `main` at 0.11.0, tagged `v0.11.0`, `origin/main` equal),
answering fyflow-app's *pass 5* #1-#2 and P43's two retro stop-and-asks; facts 1-10 read or MEASURED at this declaration;
stop-and-asks (a)-(f) ANSWERED by the maintainer 2026-10-24, (b) modified by the maintainer; W215-W218 each wait on the
item before them.
**Question this plan answers:** *can a flow read what a join hands on by a key path — every branch under its OWN key, one
segment, and an array element by a bracket index — and what does a run started before the change become?*
**Exit artifact:** *on the final tree: (1) an L2 and L5 suite holding a join's collection keyed by each branch's own key —
a map's item index, a fan-out's branch ENTRY NODE ID — at depth one, two and three, a branch that did not arrive having no
key, the key order a map's ascending index and a fan-out's `branches` order with integer-like ids first, every expected
value re-derived by hand; `CHECKPOINT_FORMAT` 2, a format-1 checkpoint refused `format` by name; (2) an L1-L2 suite
holding a bracket index `[n]` in a gate's `key` and a `when.path` resolved on a real array, a plain numeric segment over
an array still `undefined`, the wiring check's refinement along an index; `FD-V21` refusing a non-string `of` and branch
entry; green in all three L0-L5 runtimes with the chromium lane under its 60 s wait by a margin stated; (3) one block in
`examples/l6.ts`, green in node 24 and in deno, on a threaded and an inline pool, in which a gate keyed `input.<entry
id>.<index>` and an `if` on a bracket index route a run on real workers, and a format-1 checkpoint is refused `format`
by a runtime's resume, each claim with its control; and `npm run gate:full` EXIT 0 — the LAST item runs it (workflow
v0.29).*
**Reserves:** W214-W219 (W219 expected unused), Q780-Q789, ADR 0135-0139 (ADR 0135, ADR 0136 and ADR 0139 expected
unused); no S id

```
Question: what does a join hand on, and how does a key path reach into it?
Items:    W214 (the chromium lane's headroom), W215 (Q774: FD-V21 refuses a non-string of / branch entry),
          W216 (#2 a bracket array index in a key path), W217 (#1 a join keyed by each branch's own key;
          CHECKPOINT_FORMAT 2; its ADR), W218 (the exit artifact on real workers, the reply, P44's Record and retro)
Reserves: W214-W219 (W219 expected unused), Q780-Q789, ADR 0135-0139 (ADR 0135, 0136, 0139 expected unused)
Raises:   no question at this declaration; no S entry. Q774 is RESOLVED by W215's record step ((d1))
Baseline: ids derived by `npm run state` at this declaration — P44, W214, Q780, ADR 0135 from the tree and W214, Q780,
          ADR 0135 from the ledger, which AGREE
Measured: in a throwaway worktree C:/tmp-p44/m at `bdbdb1c`, `node_modules` COPIED, scanned for links (none): the five
          lanes green on the baseline; the chromium wall twice; the map-cost suite at a smaller pair; a draft re-keying
          (driver, then wiring) and a draft CHECKPOINT_FORMAT 2, each run through every lane and `check:docs` (facts 3-6)
```

## Why this plan, and why now

People now build real flows on fyflow-app with fan-outs and maps nested in each other, and read what a join hands on
from gates and transforms. **Today a nested join's collection cannot be reached by a key path at all**: its inner keys
are full branch paths — `"0.1"` under `"0"` — so a dotted path splits them, and a fan-out's keys are POSITIONS a reader
must count in `branches`. The app writes a Transform per nesting to reshape it (pass 5 #1). And a key path cannot index an
array (pass 5 #2). **The maintainer answered (a)-(f) on 2026-10-24**: #1 in the shape the app asked, BREAKING, with no
backward compatibility for a checkpoint written before it; #2 as a bracket index; P43's Q774 and its chromium headroom
as the first two items; everything in 0.12.0, released only when the maintainer says so.

## What fyflow-app asked, held against this declaration

Read at `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass5.md` (read, not edited).

| the app's clause | where it is answered |
|---|---|
| **#1 (a)** — *each key is the branch's own key, one segment: inside a map the item's index* | (a1): **accepted** (W217) |
| **#1 (b)** — *a fan-out's join keys its collection by branch entry node id, which FD-V9 already holds unique within a fan-out; a branch that did not arrive still has no key* | (a1): **accepted** (W217) — FD-V9's distinctness is what makes the key total (fact 2) |
| **#1 (c)** — *order: keep `branches` order however the ids look, or document that the order is the object's* | (a1): **the order is the object's, and documented** — inserted in ascending item index for a map and in `branches` order for a fan-out; JavaScript lists integer-like keys first, ascending, so the order is the object's own and deterministic. **No id is refused** (fact 2) |
| **#1 (d)** — *the rule a property of the Run, recorded in the checkpoint header, so a run started under full-path keys resumes under them* | (b), the maintainer's modification: **declined**. `CHECKPOINT_FORMAT` moves 1 → 2 and the driver carries ONE keying; a 0.12.0 driver refuses a format-1 checkpoint `format` (`RN-R16`, `RN-R23`) and a 0.11.0 driver refuses format 2 the same way. **Runs in flight across the upgrade cannot be resumed by 0.12.0 — drain or abandon them first.** The reply says so plainly |
| *nothing is lost: the full path is `regionPath` + `.` + key; task ids, `branch.*` events and `inputOf` keep the full path* | **true and kept**: `branch.*` region events, task ids, the fold's `regions` and `inputOf`'s `branchPath` are unmoved (fact 4); only the collection's KEYS move |
| **#2** — *a numeric segment indexes an array (`xs.1`), or a bracket form (`xs[1]`, `["0.1"]`), whichever fits the grammar* | (c1): **a bracket index `[n]` accepted** (W216); a plain numeric segment KEEPS its meaning (an own key of a plain object, `undefined` over an array); **the quoted-key form declined** — with #1 no key fyflow mints holds a dot |
| *P43 retro (a), Q774* | (d1): **W215** — `FD-V21` refuses a non-string `of` and branch entry; the schema tightened with it; the reply names it as a change in what is accepted |
| *P43 retro (b), the chromium lane at ~57 of 60 s* | (d1): **W214, first** — the choice made by measurement (fact 7) |

## Facts read at this declaration

**Fact 1 — the collection is built in ONE place, keyed by the full branch path.** At `bdbdb1c`: `collectArrivals`
(`src/driver/driver.ts:992-997`) sorts the arrived map's keys by `compareBranchPaths` (`:959`) and assigns
`out[path] = value`; its one call is `settleJoin`'s (`:6106`), right before `releaseArrivals`. The arrival is recorded in
`enter`'s `join` arm at `:4569-4572` — `this.arrivalsOf(region.fanoutId, rpJoin).set(fromBranch, payload)` — keyed by the
arriving branch's FULL `branchPath`, and per region INSTANCE (`rpJoin`, ADR 0062). `RegionSets`
(`src/definition/regions.ts:94-121`) carries `opensWith` and `branches` in declaration order, and **a fan-out's
`branchPath` segment is the entry's index in `branches`** (`:109-113`), so the own key is derivable at the one site with
no new state: the last segment for a map, `branches[segment]` for a fan-out. **The wiring check builds a second copy of
the same shape**: `record()` (`src/definition/wiring.ts:700-776`) keys a fan-out's record by `branchPathOf(...)` (`:753-754`)
and a map's sample by minted paths (`:770`), its schema `{ additionalProperties, branchKeys: true }` (`:773`).

**Fact 2 — what (a1)'s order and charset do, measured in node 24 and deno.** `FD-V16`'s id charset `[A-Za-z0-9_-]{1,64}`
admits an all-digit id and `__proto__` ([Q411](../questions/q411.md)). `Object.fromEntries([['b',1],['__proto__',2],['2',3]])`
lists `["2","b","__proto__"]` — integer-like first, the rest in insertion order — and keeps `__proto__` as an OWN key,
which `structuredClone` and `JSON.stringify` preserve in both runtimes. **A plain assignment `out[key] = v` — what
`collectArrivals` does today — DROPS a `__proto__` key** (it sets the prototype; `JSON.stringify` prints `{}`). Today's
keys are digits and dots, so the hazard is new with (a1). `FD-V9` refuses a duplicate entry within one fan-out, so a
fan-out's own keys are distinct; a map's are its indexes.

**Fact 3 — the reader set of the collection's keys, MEASURED, not grepped** (the brief's B′ and P43 retro section 4 (a)).
A draft re-keying — `collectArrivals` taking the region and keying by the own key, then `record()`'s three keys — applied
to the worktree (`scratchpad/p44/draft.patch`), every lane run:

| lane | baseline | the driver's re-keying | + the wiring record's | + `CHECKPOINT_FORMAT` 2 |
|---|---|---|---|---|
| L1-L5 node / deno / chromium | 2,267 cases, 0 failed | **26 failed**, the same 26 in all three | **29** | **41** |
| L6 node / deno | 2,861 / 246, 0 failed | **20 failed**, in both | (no move) | **22** |
| `check:docs` | EXIT 0 | **X4: five `run` snippets** | | the same five |
| `check:spec`, `check:policies`, `check:workers`, `check:wiring` | EXIT 0 | EXIT 0 | EXIT 0 | |

**The files**, by suite, the corpus census in `test/definition/l4-corpus.test.ts` aside:

- **the driver's re-keying (26)**: `test/matrix/matrix.test.ts` (4 — JP-R12's four whole-matrix claims; **no per-cell
  assertion moved**, because the cells assert policy statuses and arrival keys, not the collection), `test/matrix/ask.test.ts`
  (1), `test/driver/nested-regions.test.ts` (7 — JP-R12 at two levels and depth three, N = 0, the latch, the exit paths),
  `test/driver/map.test.ts` (2 — the KEY ORDER fixture at N = 12 settled descending, an opener inside a map),
  `test/driver/needs.test.ts` (2), `test/driver/ask.test.ts` (2), `test/driver/ask-control.test.ts` (2),
  `test/driver/input-of.test.ts` (2), `test/driver/retention.test.ts` (1), `test/driver/node-type.test.ts` (1),
  `test/driver/gate.test.ts` (1), `test/scheduler/input-of.test.ts` (1);
- **the wiring record's (+3)**: `test/definition/wiring.test.ts`, `test/definition/ask.test.ts`, `test/definition/gate.test.ts`;
- **`CHECKPOINT_FORMAT` 2 (+12)**: `test/driver/checkpoint.test.ts` (2), `test/driver/resume.test.ts` (2),
  `test/driver/on-header.test.ts`, `test/driver/run-payload.test.ts`, `test/driver/map-item.test.ts`,
  `test/driver/input-of.test.ts` (+1), `test/driver/gate.test.ts` (+1), `test/scheduler/checkpoint.test.ts`,
  `test/scheduler/resume.test.ts`, `test/scheduler/runtime.test.ts` (1 each) — hand-built format-1 checkpoints and the
  constant's literal;
- **L6** (`examples/l6.ts` alone — its expectations are inline): eleven rows' `Q36: what … received` — `fanout-join`,
  `nested-map`, `sibling-fanouts` (2), `typed-regions`, `transform-fails`, `fan-out-per-item` (2), `tv-ingest` (3) — and
  nine cross-row claims — JP-R12 at two levels, W182 exit (2), W206 exit (6, threaded and inline); with the format, W188
  exit (3) and W192 exit (4). **No worker under `examples/workers/` reads a collection's keys** (each `Object.keys` there
  is a census of an envelope);
- **`AGENTS.md`'s `run` snippets** at `:1233`, `:1329` (the one `README.md`'s fence copies, `X8`), `:4586`, `:4716`, `:5172`.

**The draft was keying only**: no spec, no corpus and no prose moved, so the census above is a FLOOR for W217 — the brief's
B′ clause carried from P43's retro (*the change includes its `spec/` and corpus edits*) is why W217 re-takes it.

**Fact 4 — what the keys do NOT reach.** The `dispatched` element carries a `taskId` and nothing else
(`spec/run-state.md:394-398`), so the collection reaches no fold input by itself; `branch.*` region events, the fold's
`regions` and `inputOf`'s `branchPath` are keyed by full paths and unmoved by the draft (none of the 41 is a region-event
or a `regions` assertion). **It reaches a checkpoint through three doors**: an `asked` element's `input` when an ask
follows a join (`run-state.ts:371`, compared whole by the replay's `sameData`); a `gated` decision taken on a key path
into it (`:456`); and every FED outcome whose worker read it. So a format-1 run with a fired join resumed under the new
keying would refuse `diverged` at an ask, re-route a gate, or carry a result computed from keys that no longer exist —
**which is why (b) moving the format is `RN-R16`'s own case** (*it moves only when what a checkpoint CARRIES moves*),
read at `spec/run-state.md:580`.

**Fact 5 — the format refusal already exists in both directions.** `resumeRefusal` (`driver.ts:486-489`) refuses
`h.format !== CHECKPOINT_FORMAT` as `format`, `RN-R23` (`spec/run-state.md:618`) names it, and `CHECKPOINT_FORMAT` is `1`
(`:357`) — so a 0.11.0 driver refuses a format-2 checkpoint `format` with no edit, and a 0.12.0 one refuses format 1 by
moving the constant. **Every 0.11.0 checkpoint is refused, joins or none** — the maintainer's (b): no dual path.

**Fact 6 — the key-path grammar and its readers.** `KEY_PATH_RE` (`src/definition/validate.ts:290`, exported, so its
`source` is package surface) and `keyPathProblem` (`:298-303`, `FD-V40`'s clause, the gate's `settings.key`);
`leafProblem`'s `FD-V43` (`:755-766`), which takes the ROOT as `path.split('.')[0]`; `readKeyPath`
(`src/definition/condition.ts:22-38`), one definition for the driver's gate (`driver.ts:4759`) and the declared comparison,
which answers `undefined` for an ARRAY mid-path; the wiring check's `keyPathRefusal` (`wiring.ts:530-575`, ADR 0068's
refinement, `key.split('.')`, asking only `object` and `properties` of each step); `definitionSchema()`'s pattern
(`src/definition/definition-schema.ts:205`, its description *no index*) and its anchored-flagless assertion (`:400-401`);
the comments at `types.ts:117`, `:692`, `:709`; `AGENTS.md:5164` (*no index, no wildcard, no expression*). **The
schema subset carries `items` and `minItems` and NOT `prefixItems` or `maxItems`** (`src/definition/schema.ts:79`,
ADR 0053), so a producer's schema can say an element's shape and a floor on length, and nothing about one position. **The
corpus file `spec/examples/invalid/FD-V40--gate-key-path-with-an-index.flow.json` keys a `distinct` gate on
`files[0].series`** — exactly (c1)'s form — so it flips to valid unless re-cut; W210's schema suite lists it as the one
file that moved class.

**Fact 7 — the chromium lane, measured twice on the baseline, and the alternative measured.** The whole L1-L5 bundle in
one page under `scripts/run-browser-tests.mjs`' 60 s wait (`:122`), timed in the page by W212's harness (copied to
`scratchpad/p44/chromium-wall.mjs`): **in-page 56,985 ms and 55,955 ms**, of which **the P39/P40 map-cost suite
(`test/fold/map-cost.test.ts`, `SMALL = 2000`, `LARGE = 8000` at `:83-84`) 33,964 and 33,373 ms**; the next five 6.1-6.5,
4.4-4.5, 3.4-3.5, 2.2 and 1.1 s. **The same suite at `SMALL = 500`, `LARGE = 2000`: its 9 cases green in node, and
in chromium all 2,267 green with the page at 31,855 ms and the suite at 8,757 ms** — every count in it is a formula of
`n`, derived by hand, so a smaller pair is the same claim (the ratio under 6x for 4x the items). Raising the wait to
120 s leaves the lane at ~57 s. **Its counts are clock-free** — the same in every runtime by construction — so a third
runtime finds a configuration error at the smaller pair as surely as at the larger (section 8's argument).

**Fact 8 — Q774's two clauses and their one pin.** `FD-V21`'s branch clause (`validate.ts:1568`) checks only that
`branches` is an array; `of` is read only `if (typeof of === 'string')`. `definitionSchema()` follows the validator
(`definition-schema.ts:215`, ADR 0132 rule 2); `test/definition/definition-schema.test.ts:301-302` pins both documents
as accepted by both; `AGENTS.md:815` cites Q774.

**Fact 9 — the release.** `HEAD` = `origin/main` = `bdbdb1c`, tagged `v0.11.0`; `package.json` / `deno.json` 0.11.0.
Spec versions: `flow-definition.md` v0.51, `join-policy.md` v0.24, `run-state.md` v0.35, `outcome-record.md` v0.21,
`runtime-targets.md` v0.13, `task-id.md` v0.16. Scheduler pin 0.6.0; L6 2861 / 246; L1-L5 100 files / 2,267 cases.

**Fact 10 — the register.** `npm run q -- --where status=open` lists Q774 alone (P43's Record). No question tracks #1 or
#2: [Q36](../questions/q36.md) is the collection's origin (answered by ADR 0037), [Q165](../questions/q165.md) its reducer
(deferred, unmoved — a reducer would receive the new keys).

## Scope

**In** — the chromium headroom (W214); `FD-V21` on `of` and a branch entry, the schema with it, Q774 resolved (W215); a
bracket index in a key path, its grammar, resolution, wiring refinement, schema pattern and corpus file (W216); the
collection keyed by each branch's own key, the wiring record with it, `CHECKPOINT_FORMAT` 2 and its ADR (W217); the spec,
`AGENTS.md`, `README.md` and an ADR where each item needs one; an L6 block, the reply and P44's close (W218).

**Out** — a format-1 checkpoint resumed, migrated, or read under the old keying ((b): no dual path, no header field); the
quoted-key form `["0.1"]` ((c1)); a numeric segment indexing an array ((c1)); refusing an all-digit or `__proto__` node id
((a1)); a wildcard or an expression in a key path; a join reducer ([Q165](../questions/q165.md)); any change to
`branch.*` events, task ids, `regions` or `inputOf`'s paths; the version bump, the push and the publish ((e1), the
maintainer's).

## Decisions taken at this declaration

*Each follows from a fact or an answer named beside it; they leave nothing open.*

1. **The chromium headroom: the map-cost suite runs its SMALLER PAIR in the browser** ((d1); fact 7). In chromium
   `test/fold/map-cost.test.ts` runs at 500 and 2,000 items, in node and deno at 2,000 and 8,000 — the SAME cases in all
   three, so `RT-R1`'s parity (`run-browser-tests.mjs:150`) holds by count. **Chosen over raising the wait to 120 s**
   because it returns ~25 s of the lane (56-57 s → ~32 s measured), keeps the 60 s wait as a hang detector, and moves a
   claim whose counts are runtime-independent; the cost — 8,000 items is never run in a browser — is stated in the
   suite's header and, if W214 judges `RT-R1`'s sentence moved, in `spec/runtime-targets.md`. The pair's every exact
   count is the suite's formula of `n`, re-derived at both sizes, never read off a run. No ADR (ADR 0135 expected unused).
2. **`FD-V21` owns `of` and a branch entry** ((d1); fact 8): a join's `of` that is present and not a string, and a
   `fanout`'s `branches` entry that is not a string, are refused naming the key — as `edge.to` and a map's `branch` are.
   `definitionSchema()` then holds both to the id charset unconditionally, and W210's two pins flip to REFUSED by both.
   A change in what is accepted, stated in the spec's version note and the reply. No ADR (ADR 0136 expected unused): the
   rule's own sentence already says it.
3. **A bracket index is a SUFFIX of a segment** ((c1); fact 6). The grammar is the item's within: one or more `[n]` after
   a segment (`n` a non-negative decimal integer with no leading zero but `0`, its bound W216's), never leading the path,
   so the ROOT is still the first segment — `FD-V43`'s root is read up to the first `.` or `[`. `readKeyPath` resolves
   `[n]` on a real array (`Array.isArray`, an index `< length`) and on nothing else; a plain segment is unchanged — an
   own key of a plain object, `undefined` over an array. **`KEY_PATH_RE`'s `source` changes**, a public constant's value,
   stated as such. ADR 0068's refinement steps INTO an array's `items` at an index and reads `minItems` for a guarantee
   (W99's `required` analogue); **a producer forbids an index only where its schema is not an array or its `items` refuses
   every element** — `prefixItems` and `maxItems` are outside the subset (fact 6), so W216 states it and stops if it finds
   a refinement needing a keyword outside it. The FD-V40 corpus file is re-cut to a form still refused and renamed by what
   it then holds, its move stated. ADR 0137.
4. **The collection's key is the branch's OWN key** ((a1); facts 1, 2). Built at the one site (`collectArrivals`) from
   the arrivals' full paths, so recording, the instance key, the lifetime and the release (ADR 0046) are unmoved: a map's
   key is the path's last segment, inserted in ascending item index; a fan-out's is `branches[segment]`, inserted in
   `branches` order; **built by own-property definition** (`Object.fromEntries` or `defineProperty`), never by
   assignment, so a `__proto__` entry id is a key (fact 2). The wiring check's `record()` keys the same way, so a
   successor's `inputSchema` is checked against the shape the run hands it. `JP-R12`'s order clause is restated as the
   object's own order (integer-like keys first), and its depth-2 hazard — *dotted keys keep settlement order* — is gone
   with the dotted keys; the L2 key-order fixtures keep their shapes and change their reason.
5. **`CHECKPOINT_FORMAT` is 2, and nothing reads 1** ((b); facts 4, 5): a format-1 checkpoint is refused `format` by
   `resume()`, `runtime.resume` and every `inputOf` reading, before anything is replayed; no header field records the
   keying; no dual path. `RN-R16` (*it moves only when what a checkpoint CARRIES moves*) is satisfied, not amended — fact
   4 is the argument, written into the ADR. Every test fixture writing a format-1 header is rewritten to 2, and ONE case
   keeps a format-1 checkpoint as the refusal's subject.
6. **One ADR for #1 and its format, W217's ADR 0138**: *a join hands on each branch under its own key, and a checkpoint of
   the old keying is refused by format* — amending `JP-R12`
   ([ADR 0037](../decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
   rule 4) and [ADR 0062](../decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)
   consequence 5, whose *disjoint because prefixed* argument is replaced by *disjoint because each instance holds its own
   collection* (ADR 0062's instance key, unmoved). **An item that finds it needs no ADR says so.**
7. **Each changed public surface is stated where it changes**: what a join hands on (every key); `CHECKPOINT_FORMAT`'s
   value; `KEY_PATH_RE`'s `source`; `validateDefinition`'s verdicts on two shapes (W215) and on a bracket-index path (W216);
   `definitionSchema()`'s patterns. **BREAKING — 0.12.0** ((e1)).

### Stop-and-asks — (a)-(f) ANSWERED by the maintainer, 2026-10-24

**(b) is the maintainer's modification of the recommendation; the rest are as asked.** Nothing waits on the maintainer:
W214 may start.

| | the question | answered | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **#1 — the collection's shape** | **ANSWERED (a1)**: each key of a join's collection is the branch's OWN key, one segment — a map's item index, a fan-out's branch ENTRY NODE ID (`FD-V9` keeps these unique within a fan-out); a branch that did not arrive still has no key; entries inserted in ascending item index for a map and in `branches` order for a fan-out, the plan documenting that JavaScript puts integer-like keys first in ascending order, so the order is the object's own and deterministic; no id refused. Amends `JP-R12`, ADR 0037 and ADR 0062 consequence 5's prefix argument. BREAKING | **(a2)** one segment for a map, POSITIONS kept for a fan-out — still counted in `branches`, and reordering them still moves every key. **(a3)** refuse an integer-like node id so `branches` order holds — refuses flows 0.11.0 accepts, for an order the object already makes deterministic |
| **(b)** | **#1 (d) — the rule a run resumes under** | **ANSWERED, MODIFIED by the maintainer — no backward compatibility**: `CHECKPOINT_FORMAT` 1 → 2; the new driver refuses a format-1 checkpoint by name (`format`, `RN-R16`/`RN-R23`) and a 0.11 driver refuses format 2 the same way; ONE keying, no dual code path, no header field. *"i wouldn't worry about backwards compatibility (format-1), we drop it with the new version. Library is only used by me for now so we don't care"*. The reply tells fyflow-app plainly that runs in flight across the upgrade cannot be resumed by 0.12.0 — refused `format`, so drain or abandon them first — declining #1 (d) with that reason | **(b1)** the keying rule recorded in the header, both keyings carried — two code paths for one release's runs. **(b2)** the format unmoved — a 0.11 checkpoint replays under the new keys and refuses `diverged` at an ask, re-routes a gate, or carries results computed from keys that no longer exist (fact 4) |
| **(c)** | **#2 — how a key path indexes an array** | **ANSWERED (c1)**: a BRACKET array index `[n]` (`files[0].series`, `xs[1]`), accepted by `FD-V40`/`FD-V43`'s grammar and resolved by `readKeyPath` on a real array; a plain numeric segment keeps its meaning (an own key of a plain object, `undefined` over an array); no quoted-key form. The cost: `KEY_PATH_RE`/`keyPathProblem`, `readKeyPath`, ADR 0068's refinement along the path (`items`/`minItems` — fact 6 on `prefixItems`), `definitionSchema()`'s pattern, and the FD-V40 corpus file, which flips or is re-cut | **(c2)** a numeric segment indexes an array — `xs.1` reads differently over an object and an array, so a key path's meaning depends on the value. **(c3)** add `["0.1"]` — a key with a dot, which no fyflow key holds after (a1) |
| **(d)** | **P43's two retro routings** | **ANSWERED (d1)**: the FIRST item fixes the chromium headroom — the map-cost suite's 8,000-item counts to node and deno only, or the 60 s wait raised — chosen by measurement and stated (decision 1); a small item for [Q774](../questions/q774.md): `FD-V21` refuses a non-string join `of` and fanout branch entry, as its own sentence says, the schema tightened with it, the reply naming it a change in what is accepted | **(d2)** leave the lane and meet the 60 s red at the next B′ run. **(d3)** leave Q774 open or narrow `FD-V21`'s sentence |
| **(e)** | **The release** | **ANSWERED (e1)**: everything ships in **0.12.0**, BREAKING, released ONLY when the maintainer says so; no version bump in any item | **(e2)** a release per item |
| **(f)** | **How the items run** | **ANSWERED (f1)**: items run one after another as subagents; the orchestrator comes back to the maintainer only on a stop-and-ask, and takes the recommended option on minor ones under this standing instruction — **the plan's standing answer**, as P43's (h) was | **(f2)** the maintainer asked at every item's step |

## Work items

**P39 retro's proposal B, as P40 adopted it and P40's-P43's retros carried it** — B′, C, D′ and E, E per CALL SITE —
**with P43's one clause added to B′**:

- **B′ — the census re-take, with the self-test floors, and WITH ITS SPEC**: *an item that adds a node, a field, a suite,
  a module, a snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — the
  change INCLUDING its `spec/` and corpus edits, because `examples/l6.ts` and the corpus suites read both — and, where it
  adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads that floor
  (`check:docs:selftest`, `check:budget:selftest`).* Every row that may add or remove a `run` snippet in `AGENTS.md` OWNS
  `scripts/check-docs.mjs`'s `RUN_FLOOR` (54 at this declaration) and nothing else in that file.
- **C — one confirming gate per item**: `npm run gate` before its readers; `gate:item`, or the last item's `gate:full`,
  ONCE, after them, on the final tree.
- **D′ — the census sites AND the readers in the plan's row**, by a grep for each changed name, each premise the change
  falsifies, and a sibling of each member it adds; **every row touching `AGENTS.md` owns the WHOLE of it**. **And
  beside it, P43's observation: a census by name is a census of NAMES; a reader of the WHOLE value is found by running
  the lanes** — which is why fact 3 is a measurement.
- **E — a compound probe kills nothing**, per CALL SITE: the own key's map arm and fan-out arm are two probes; the
  definition-by-property and the order are two; the wiring record's fan-out and map keys are two; `[n]`'s grammar, its
  resolution, its root rule and its refinement one each; `FD-V21`'s two clauses two.

**The brief sentences, every item's**: ***each item's Record states its readers' overlap***; ***a claim of ABSENCE is
shown able to fail by a control on the same observer, taken AFTER the event it denies***; ***an expected collection is
re-derived from the row's own steps, never from the old literal by substitution*** — a re-keyed literal written by
mapping old keys to new ones inherits whatever the old literal got wrong; ***a refusal is a claim with a control*** — a
format-1 checkpoint refused beside the same run at format 2 resuming; ***a new suite's wall is a share of the chromium
lane's 60 s***, re-taken by the harness after W214. From P43's retro: ***where a plan enumerates what a change
protects, enumerate what it BREAKS*** — here, every 0.11 checkpoint (decision 5) and every flow reading `"0.1"` or a
fan-out position.

**D′ applied — the sites each row moves.**

- **W214**: `test/fold/map-cost.test.ts` (`SMALL`/`LARGE`, `:83-84`, and every derivation reading them); the harness's
  runtime test (`test/harness.ts`' `isDeno`, `:92` — a browser is neither Node nor Deno); `RT-R1`'s sentence; the two
  sibling suites at 2,000 / 8,000 (`input-of-cost.test.ts`, `reference-copy-cost.test.ts`, 1.1 s and under) — READ, moved
  only if the measurement says so.
- **W215**: `FD-V21`'s clauses (`validate.ts:1568` and the join arm), `definition-schema.ts:215`, its suite's two pins
  (`:301-302`), `spec/flow-definition.md`'s `FD-V21` row (`:2643`) and section 7's corpus table, `AGENTS.md:815`.
- **W216**: fact 6's every site; the built-in `if`/`switch`'s `{ input }` reading (`validate.ts:560`); `distinct`'s key;
  `spec/flow-definition.md` `FD-V40` (`:2662`), `FD-V43` (`:2665`), section 3's `when` and key-path paragraphs; the FD-V40
  corpus file and `definition-schema.test.ts`' moved-class list; `AGENTS.md:5164` and every *no index* sentence. The
  PREMISE: *a key path reads own keys of plain objects* (`readKeyPath`'s docblock, ADR 0068 rule 3's container question).
- **W217**: fact 3's every file; `collectArrivals` and its docblocks (`driver.ts:992`, `:6086-6131`, `:1937`), `record()`
  (`wiring.ts:700-776`, `:12`, `:51`, `assist.ts:31`), `CHECKPOINT_FORMAT` (`driver.ts:357`, the tables at `:370`, `:413`,
  `:596`); `spec/join-policy.md` `JP-R12` (`:583`), `:48`, `:556`; `spec/run-state.md` `RN-R16` (`:580`), `RN-R23`
  (`:618`), `:394`; `AGENTS.md` section 5 (*What a join carries downstream*, `:1226`) and every snippet of fact 3;
  `README.md`'s fence (`X8`). The PREMISES: *keys are branch paths* and *the key order must be pinned because dotted
  keys keep settlement order* (`JP-R12`, `collectArrivals`' comment, `compareBranchPaths`' docblock `:959-971`).
- **W218**: `X10` (`examples/README.md`); `CONSTRUCTION_PRICED` (`examples/l6.ts`) if a construction is added.
- **The always-read set**: no row edits `CLAUDE.md`, `doc/workflow.md` or `doc/concept.md`, except W218's plan-close
  bookkeeping in `doc/workflow.md` (P40's W200 … P43's W212 precedent, declared before the edit).

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W214 | **The chromium lane's headroom — the map-cost suite's smaller pair in the browser** — (d1); decision 1; fact 7 | `test/fold/map-cost.test.ts`, `test/harness.ts` (only if a runtime test is added there), `spec/runtime-targets.md` (v0.14, only if `RT-R1`'s sentence moves), `spec/README.md` (if a version moves) | nothing — (a)-(f) answered | `gate:item`; L1-L2 in node, deno and chromium: the suite's 9 cases at 2,000 / 8,000 in node and deno and at 500 / 2,000 in chromium, every exact count its hand-derived formula at both sizes; the parity count 2,267 in all three; **the chromium in-page wall re-taken before and after** (the harness), the suite's share stated; a provocation: the browser pair forced to the larger one restores the wall (the change is what moved it) |
| W215 | **Q774 — `FD-V21` refuses a non-string `of` and branch entry** — (d1); decision 2; fact 8 | `src/definition/validate.ts`, `src/definition/definition-schema.ts`, `test/definition/**`, `test/definition/l4-corpus.test.ts` (counted), `spec/examples/invalid/**` (new files only), `spec/flow-definition.md` (v0.52: `FD-V21`, section 7's table), `spec/README.md`, `AGENTS.md`; the record step's `doc/questions/q774.md` (resolved) | W214 | `gate:item`; L1: each clause refuses `of` ∈ {`null`, `5`, `[]`, `{}`, `true`} and `["b", "c", 5]` naming the key, each beside the string form's verdict unmoved; the schema refusing both, each beside its repair accepted; W210's two pins flipped; every existing corpus verdict unmoved |
| W216 | **#2 — a bracket array index in a key path** — (c1); decision 3; fact 6 | `src/definition/validate.ts`, `src/definition/condition.ts`, `src/definition/wiring.ts`, `src/definition/definition-schema.ts`, `src/definition/types.ts` (comments), `src/driver/driver.ts` (only if the gate's resolution comment moves), `test/definition/**`, `test/driver/**`, `test/definition/l4-corpus.test.ts` (counted), `spec/examples/valid/**` and `spec/examples/invalid/**` (the FD-V40 file re-cut and renamed; new files), `spec/flow-definition.md` (v0.53: `FD-V40`, `FD-V43`, section 3's key-path paragraphs, section 7's table), `spec/README.md`, `AGENTS.md`, `scripts/check-docs.mjs` (`RUN_FLOOR` only), `doc/decisions/0137-*` | W215 | `gate:item`; L1: the grammar — every well-formed spelling accepted, every malformed one (`[]`, `[-1]`, `[01]`, `[a]`, a leading `[0]`, an unclosed bracket) refused naming the fix, on a gate's `key` AND a `when.path`, the root read before the first `[`; `readKeyPath`: `[n]` on an array, `undefined` past its length, on a plain object, and on an array-like object; a numeric segment over an array still `undefined` (the control); L2: a `distinct` gate and an `if` routed by `input.xs[1]` on a run, by hand; the wiring check — `fits` along `items`, a refusal where the producer is not an array or its `items` refuses every element, a guarantee read from `minItems`; `definitionSchema()` accepting the form; the FD-V40 file's move stated |
| W217 | **#1 — a join's collection keyed by each branch's own key; `CHECKPOINT_FORMAT` 2; ADR 0138** — (a1), (b); decisions 4-6; facts 1-5 | `src/driver/driver.ts`, `src/definition/wiring.ts`, `src/definition/assist.ts` (the comment), `src/definition/regions.ts` (only if a docblock moves), `test/driver/**`, `test/definition/**`, `test/fold/**`, `test/matrix/**`, `test/scheduler/**`, `test/definition/l4-corpus.test.ts` (counted), `examples/l6.ts` (fact 3's twenty-two claims — re-derived, no block added), `examples/README.md` (if a copy moves), `spec/join-policy.md` (v0.25: `JP-R12`, `:48`, `:556`), `spec/run-state.md` (v0.36: `RN-R16`, `RN-R23`, `:394`), `spec/flow-definition.md` (only if a sentence on the join's record moves), `spec/README.md`, `AGENTS.md`, `README.md` (the `X8` fence), `scripts/check-docs.mjs` (`RUN_FLOOR` only), `doc/decisions/0138-*` | W216 | `gate:item`; L2: the collection at depth one (a fan-out by entry id, a map by index), two and three, every expected value re-derived from the row's steps; a fan-out whose entries are `"b"` and `"2"` listing `"2"` first and one whose entry is `__proto__` carrying it as an OWN key (each a construction fact 2 names); the N = 12 descending fixtures keeping their shapes, their reason restated; a branch that did not arrive having no key; L5: every cell whose join fires and the four whole-matrix claims; the wiring record keyed the same, a successor's `inputSchema` naming an entry id checked `fits`; `CHECKPOINT_FORMAT` 2; a format-1 checkpoint refused `format` by `resume()`, `runtime.resume` and `inputOf`, its control the same run at 2 resuming; L6 green with fact 3's claims re-derived; `RUN_FLOOR` and `check:docs` green |
| W218 | **The exit artifact on real workers, the reply, P44's close** — exit (3); `gate:full` | `examples/l6.ts`, `examples/README.md`, `examples/flows/**`, `examples/workers/**`, `test/definition/l4-corpus.test.ts` (if a census moves); `doc/workflow.md` (the plan-close bookkeeping only, declared); outside this repository, `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass5.reply.md` | W217 | **`gate:full`** (the plan's last item); L6 in node 24 and deno, threaded and inline; `X10` moved by its block alone |
| W219 | *reserved, expected unused* | | | |

**The rows are SERIAL, never concurrent** — W215 and W216 share `validate.ts`, `definition-schema.ts` and
`spec/flow-definition.md`; W216 and W217 `wiring.ts` and `driver.ts`; every row from W215 `AGENTS.md`
(`doc/workflow.md` section 7 rule 2) — which (f1) answers anyway. **No item edits `scripts/check-register*.mjs`,
`scripts/state.mjs` or `doc/questions/README.md`**, so `gate:item` is W214-W217's and `gate:full` W218's. **Questions
reserved per item**, so no two take one: W214 Q780-Q781, W215 Q782-Q783, W216 Q784-Q785, W217 Q786-Q787, W218
Q788-Q789. **ADRs reserved per item**: W214 ADR 0135 and W215 ADR 0136 (each expected unused, decisions 1-2), W216 ADR
0137, W217 ADR 0138, ADR 0139 reserved, expected unused. **No item raises a question by plan**; one a NO to an asked
widening produces is raised as section 1 rule 6 says.

**Why W217 is ONE item, measured**: the re-keying and the format must land in one commit — a tree with the new keys and
format 1 would resume a 0.11 checkpoint into fact 4's three doors — and fact 3's 41 L1-L5 cases and 22 L6 claims are one
re-derivation over one rule. P43's items carried as much. **Split only on a stop-and-ask.**

**The reply to fyflow-app goes where P43's did** — `../fyflow-app/.scratch/mu-upstream-adoption/requests/`, as
`fyflow-orchestration.pass5.reply.md`. **W218 writes it**, from this plan and the five Records, once its own gate is
green: #1 (a) and (b) accepted — the example's collection in the new shape (`{"prep":{"0":1,"1":2},"side":{"xs":[1,2]}}`,
derived by hand and read on the final tree), `input.prep.1` reaching the second item; (c) the order is the object's,
integer-like ids first, documented, no id refused; **(d) declined: `CHECKPOINT_FORMAT` 2, a 0.12.0 driver refuses a 0.11
checkpoint `format` and a 0.11 driver refuses a 0.12 one — runs in flight across the upgrade cannot be resumed by 0.12.0,
so drain or abandon them first**, with the maintainer's reason; #2 accepted as `[n]`, a numeric segment unchanged, the
quoted form declined; Q774 named as a change in what is accepted (a non-string `of` or branch entry now refused);
0.12.0 BREAKING, **its release state MEASURED at the time of writing** (npm, JSR, tags, `origin/main`), and the bump,
push and publish the maintainer's ((e1)).

**Each item writes its own file from its row when it starts** (`doc/work-items/TEMPLATE.md`) — no item file is written at
this declaration, so `npm run state`'s two derivations agree. **Its `**Status:**` line's FIRST WORD is one of the
template's five**. What the row cannot carry is below: each item's OUTPUTS, and what its declaration step RE-TAKES before
any `src/` edit (P15 decision 5). Every item's last re-take is the ladder counts.

**W214 — outputs**: the browser pair and how the suite knows it is in a browser; the suite header's statement of what
the browser no longer runs; `RT-R1`'s sentence if it moves; the chromium wall before and after. **Re-takes**: fact 7's
wall on its starting tree; whether the two sibling 8,000-item suites need the same (expected NO, 1.1 s and under).

**W215 — outputs**: the two `FD-V21` clauses; the schema's two tightenings; the invalid files the clauses earn;
`spec/flow-definition.md` v0.52; Q774 resolved. **Re-takes**: every corpus verdict; whether a valid corpus or example flow
holds a non-string `of` or branch entry (expected none).

**W216 — outputs**: the grammar (its exact spelling and bound W216's, decision 3), `KEY_PATH_RE` and `keyPathProblem`;
`readKeyPath`'s array arm; `FD-V43`'s root rule; ADR 0068's refinement through `items` and `minItems`; the schema's
pattern; the re-cut FD-V40 file; ADR 0137; `spec/flow-definition.md` v0.53; `AGENTS.md`. **Re-takes**: every reader of
`KEY_PATH_RE` and `readKeyPath` (fact 6) and of `key.split('.')`; whether any valid corpus or example flow holds `[`.

**W217 — outputs**: the own key in `collectArrivals`, by own-property definition; `record()`'s keys; `CHECKPOINT_FORMAT`
2; every fixture of fact 3 re-derived; the format-1 refusal's cases; ADR 0138 and the amendment notes it carries for ADR
0037 and ADR 0062; `spec/join-policy.md` v0.25, `spec/run-state.md` v0.36; `AGENTS.md` section 5 and every snippet;
`README.md`'s fence. **Re-takes**: fact 3's census on its starting tree, built WITH its spec edits (B′); fact 2's
`__proto__` behaviour through a threaded pool's clone (the scheduler's `structuredClone`), measured.

**W218 — outputs**: the L6 block (exit (3)) — pass 5's own flow (a fan-out whose first branch holds a map, both joined),
`outer`'s successor receiving `{"prep":{"0":1,"1":2},"side":{"xs":[1,2]}}` by hand, an `if` on `input.prep.1 eq 2`
taking `then` (its control the old path `input.0.0.1` taking `else`), a gate keyed on `input.side.xs[1]` routing by the
second element (its control `input.side.xs.1` routing `nokey`), threaded and inline; a format-1 checkpoint refused
`format` by `runtime.resume` on a fresh runtime, its control the same run's format-2 checkpoint resuming; each claim its
own verdict; `X10` moved by the block alone; the reply; P44's Record and retro. **It places no logic**: a counter or
`src/` site it cannot read is an Exception named before the edit. **Re-takes**: W214-W217's counts and walls in node,
deno and chromium; the release state, measured.

## Predictions, written before the items that test them

1. **W214 takes the chromium lane under 35 s** in the page and moves no case count in any runtime.
2. **W215 moves no existing corpus verdict**; only W210's two pins flip.
3. **W216 flips the FD-V40 corpus file and no other** — no valid file and no other invalid file holds `[`.
4. **W217's census on its starting tree is fact 3's plus its spec edits' readers**: 41 L1-L5 cases and 22 L6 claims at
   least, at most five more files than fact 3 names; no `branch.*` event, task id, `regions` value or `inputOf` path moves.
5. **No L5 matrix CELL's own assertion moves under W217** — only the four whole-matrix JP-R12 claims (fact 3).
6. **W218 moves `X10` by its block alone, and no existing L6 row.**

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q774](../questions/q774.md) | `FD-V21` accepts a non-string `of` or branch entry — `open`; (d1) resolves it | W215's record step |
| [Q165](../questions/q165.md) | a join reducer — `deferred`, unmoved; a reducer would receive the new keys | — |
| [Q411](../questions/q411.md) | a bare `k in o` answering from `Object.prototype` — `icebox`; the same prototype-name class decision 4's `__proto__` entry id meets, closed there by own-property definition | — |
| *(Q780-Q789)* | none planned | each item's block, on a NO |
