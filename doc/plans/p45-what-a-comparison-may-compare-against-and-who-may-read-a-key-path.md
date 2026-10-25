# P45 — What may a comparison compare against, and who may read a key path the way a gate does?

**Status:** declared 2026-10-25 — on `a48b77c` (the tree clean, `main` at 0.12.0, tagged `v0.12.0` on `ffcc774`,
`origin/main` = `ffcc774`, one local commit ahead: Q790), answering fyflow-app's *pass 6* #1-#2; facts 1-10 read or
MEASURED at this declaration; the evaluation's stop-and-asks (a)-(f) ANSWERED by the maintainer 2026-10-25; **(g) and
(h) ANSWERED by the maintainer 2026-10-25, *as recommended*** — (g1), built in W221; (h1), W223 ISSUED, serial after W221 and
before W222 (both recorded at W221's commit, the maintainer's instruction; W221's declared exception).
**Question this plan answers:** *may a declared comparison compare a key path against ANOTHER key path over the same
context — and what does it answer when that other path does not resolve — and may a host read a key path with the
library's own reader?*
**Exit artifact:** *on the final tree: (1) an L1-L2 suite holding a comparison's `valueFrom` — exactly one of `value` /
`valueFrom` at `new Driver`, its path held to `FD-V43`'s roots and index rules on an edge and in an `if`, the resolved
value compared type-strictly as a literal would be, a resolved `null` compared as `null`, a resolved object or array no
match for every operator (`ne` included), an ABSENT `valueFrom` no match for every operator so that `x gt y` and `x lte y`
are both false where `y` is absent, every expected verdict derived by hand; `definitionSchema()` accepting the form and
refusing both-or-neither; every 0.12.0 corpus verdict unmoved; green in node, deno and chromium; (2) `keyPathSteps` and
`KeyPathStep` exported from the root entry in the node AND browser builds, beside `readKeyPath`, `KEY_PATH_RE` and
`PREDICATE_ROOTS`, all five documented in `AGENTS.md` with a `run` snippet `check:docs` executes; (3) one block in
`examples/l6.ts`, green in node 24 and in deno, on a threaded and an inline pool, in which pass 6's own flow routes by
`outcome.result.size lte needs.limit.max` both ways and an `if` routes by `input.a` against `input.b`, each with its
control — the same value as a literal, and an absent `valueFrom` taking the other route; and `npm run gate:full` EXIT 0
— the LAST item runs it (workflow v0.29).*
**Reserves:** W220-W223 (W223 expected unused unless (h1)), Q791-Q798, ADR 0140-0142 (ADR 0141 and ADR 0142 expected
unused); no S id

```
Question: what may a comparison compare against, and who may read a key path the way a gate does?
Items:    W220 (#2 the key path reader exported and documented), W221 (#1 a comparison's valueFrom; ADR 0140),
          W222 (the exit artifact on real workers, the reply, P45's Record and retro); W223 ((h1): `check:spec` resolving a
          refusal row's corpus citations; after W221, before W222)
Reserves: W220-W223, Q791-Q798, ADR 0140-0142 (ADR 0141, 0142 expected unused)
Raises:   no question at this declaration; no S entry
Baseline: `npm run state` at this declaration — P45, W220, Q791, ADR 0140 from the tree; W220, Q790, ADR 0140 from the
          ledger. THE TWO DISAGREE ON Q, and the reason is below (Ids)
Measured: in the working tree at `a48b77c`, read-only: the validator, the wiring check and the evaluator over pass 6's
          own flow (scratchpad/p45/probe.ts); a census of every corpus comparison rooted at `needs`
          (scratchpad/p45/needs-census.mjs); L1-L5 in node (facts 3, 5, 6, 8, 10)
```

## Why this plan, and why now

fyflow-app is replacing JSON with forms for conditions and gates, with a key-path picker that suggests from what reached
a node in a past run. **A form can show a comparison against a literal and cannot show one against another value the run
computed**: pass 6's case checks a file's size against a limit an earlier node worked out, and today that takes a
Transform that copies both values side by side, or a registered predicate — either moves a one-line comparison out of
the grammar a form renders (pass 6 #1, P2). And the app keeps its own copy of the key-path spelling — the indexed
segment's charset, the nine-digit index cap, a key read only on a plain object — held to ours by its own tests, because
the step parser is not exported (#2, P3). **The maintainer answered the evaluation's stop-and-asks on 2026-10-25**: #1 as
a `valueFrom` key beside `value`, an absent one no match, no `valueDefault`, `switch` untouched; #2 by exporting the two
names that are not yet public and documenting all five; non-breaking, no `CHECKPOINT_FORMAT` change, intended as 0.13.0
and released only when the maintainer says so.

## What fyflow-app asked, held against this declaration

Read at `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass6.md` (read, not edited; its own
status line *drafted, not sent*).

| the app's clause | where it is answered |
|---|---|
| **#1** — *a comparison may carry, in place of `value`, a key path over the same context, with the same roots as `path`* | (a1): **accepted as `valueFrom`** (W221) — exactly one of `value` / `valueFrom`, both or neither refused at `new Driver` |
| **#1** — *the same rules would apply to what it resolves to as to `value`: a scalar, and different kinds never match* | (a1): **accepted** — type-strict as a literal; a resolved `null` compared as `null`; a resolved object or array is **no match for every operator** (decision 3: `ne` included) |
| **#1** — *what an absent `valueFrom` means (no match, or its own `default`) is yours to choose; we only need it written* | (b1): **NO MATCH, written down** — no `valueDefault` (additive later, if a real flow needs it); the consequence stated: `x gt y` and `x lte y` are both false where `y` is absent |
| *(not asked)* `switch` cases | (d1): **not given `valueFrom`** — a case value stays a literal |
| **#2** — *export the steps and the read, from the browser entry too* | (c1): **accepted** — `readKeyPath`, `KEY_PATH_RE` and `PREDICATE_ROOTS` are ALREADY public from the root entry in both builds (fact 2); `keyPathSteps` and `KeyPathStep` are exported beside them (W220); all five documented with a `run` snippet. **No validator function is exported** ((c2) declined) — `KEY_PATH_RE` is the grammar, `keyPathSteps` the parse, `readKeyPath` the read |

## Facts read at this declaration

**Fact 1 — the request.** Two items: #1 (P2, new) and #2 (P3, new); pinned `fyflow-orchestration@0.12.0` with
`fyflow-scheduler@0.6.0`; *"we adopt releases as they come and wait on none of these"*.

**Fact 2 — what is public today, and what is not.** `index.ts` is `export *` over `src/definition/validate.ts`,
`types.ts` and twelve other modules, and is the ONE root entry `scripts/build.mjs` bundles for both platforms (`ENTRIES`,
`:45-50`; `dist/node/index.js` and `dist/browser/index.js`); `deno.json`'s `"."` is the same `index.ts`. **`readKeyPath`
is public** through `validate.ts:28`'s `export { readKeyPath } from './condition.ts'`; **`KEY_PATH_RE`** is
`validate.ts:295`, exported; **`PREDICATE_ROOTS`** is `types.ts:96`, exported. **`keyPathSteps`** (`condition.ts:40`) and
**`KeyPathStep`** (`:19`) are exported from `condition.ts` and reached by nothing public — measured: the root namespace's
`keyPathSteps` is `undefined` (`scratchpad/p45/probe.ts`). `condition.ts`' own docblock (`:9-11`) says *Not re-exported by
`index.ts` … so the package's exported names do not move* — the sentence W220 moves. `src/definition/condition.ts` is
already in `deno.json`'s publish list. No test or script pins the root namespace's name list
(`grep readKeyPath scripts/` is empty); `test/driver/surface.test.ts` is the nearest reader. `AGENTS.md` names
`KEY_PATH_RE` once (`:821`) and documents none of the five as a reader a host may call.

**Fact 3 — the evaluator, `evalLeaf` (`src/definition/condition.ts:110-158`).** Reads `p.path` by `readKeyPath`
(`:114`); absent → no match unless `default`; `default` stands in for `undefined` AND `null` (`:128-129`); `length` after
`default` (`:130-135`); then `const w = p.value` (`:136`) and the seven arms: `eq` `v === w`, `ne` `v !== w` (`:143-144`),
the four ordering arms number-and-number, `startsWith` string-and-string. **`ne` is true wherever the left side is an
object and the right a scalar** — measured: `{ path: 'outcome.r', op: 'ne', value: 5 }` over `{ r: { a: 1 } }` answers
`true`, `eq` `false`. And because `eq`/`ne` are `===`, **a right side resolving to the SAME object as the left would make
`eq` true** — a path and a `valueFrom` naming one key. So *an object or array is no match* (the maintainer's (a1)) is a
guard W221 WRITES, not one the arms already give (decision 3). `evaluateDeclared` (`:165`) is the one entry for an edge
(`src/driver/routing.ts:66`, scope the `DecisionContext`) and an `if` gate (`validate.ts:570`, scope `{ input }`).

**Fact 4 — the grammar, `leafProblem` (`src/definition/validate.ts:755-827`).** `PREDICATE_LEAF_KEYS` is `['path', 'op',
'value', 'default', 'length']` and `PREDICATE_LEAF_REQUIRED` `['path', 'op', 'value']` (`:685-686`), **both exported**, so
their VALUES are package surface; a key beside them is `FD-V42` (`:756-758`), a missing one `FD-V42` (`:760-761`). The
path's `FD-V43` clauses (`:763-784`): the key-path grammar, the root read up to the first `.` or `[`, the scope's roots
(`EDGE_SCOPE` `outcome`/`needs`; `GATE_SCOPE` `input`, `:746-752`), an index on the root, a root alone. `FD-V44`'s
literal clauses (`:785-826`) read `o.value` — scalar, numeric for an ordering op, string for `startsWith`, numeric under
`length`. **None of the literal clauses can be asked of a `valueFrom`**: its kind is known only at run time, where the
type-strict arms answer no match. `predicateShapeOf` (`:690-698`) marks a comparison by `path` or `op`, so `{ valueFrom }`
alone marks no shape (`FD-V42`). **Measured today**: a `valueFrom` beside `value`, and one in its place, are both refused
`FD-V42` — so a 0.12.0 driver refuses every document using it, by name.

**Fact 5 — `needs` on a comparison's path is NOT checked against the edge's declaration.** Measured on pass 6's flow:
`when: { path: 'needs.limit.max', … }` on an edge declaring NO `needs`, and `needs.other.max` on an edge declaring only
`needs.limit`, are **both accepted** by `validateDefinition` (no finding). `spec/flow-definition.md` `FD-C3` says why it
is silent rather than wrong: the decision's `needs` is *the object THIS EDGE's `needs` describes … or `{}` when the edge
declares none*, so an undeclared key is ABSENT and the comparison NO MATCH, for ever. **The maintainer's (a1) clause *a
`needs.X…` `valueFrom` requires X declared in that edge's `needs`, as `path` does* rests on a premise this fact
falsifies** — stop-and-ask (g). The corpus census (`scratchpad/p45/needs-census.mjs`, 121 `*.flow.json` under
`spec/examples/` and `examples/flows/`): **24 edge comparisons, 4 rooted at `needs`, 0 undeclared**; 3 `if`
comparisons.

**Fact 6 — the wiring check reads NO predicate path.** `checkWiring` (`src/definition/wiring.ts:928`) holds an arc to
the consumer's `inputSchema`; `requireAlong` (`:478`) and `keyPathRefusal` (`:550`) walk a GATE's `settings.key` only,
for a type's `keyResolvedRoutes` (`:680-696`) — and the built-in `if` declares none (`validate.ts:550`, *the refinement
that would need is priced in W154's declaration and not built*). [ADR 0074](../decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md)
consequence 6 says so: *a declared predicate's path is not checked against any schema; `checkWiring` says nothing about
it*. Measured: pass 6's flow with a `needs` path draws the same `edge` verdicts as without one. **So *the wiring check
learns `valueFrom`* has no site to learn it at**: `valueFrom` is held where `path` is — by the validator's grammar —
and nowhere in the wiring check (decision 6).

**Fact 7 — `definitionSchema()`'s comparison (`src/definition/definition-schema.ts:345-390`).** `leafSchema` builds
`path`'s pattern from `PREDICATE_ROOTS` and `KEY_PATH_RE`'s segment (`:348`), `value` a scalar, `default`, `length`;
`required` is `PREDICATE_LEAF_REQUIRED` (`:361`), `properties` one per `PREDICATE_LEAF_KEYS` member with a description
from `PREDICATE_DESCRIPTIONS` (`:168-176`) — **a key with no description throws** (`:364`), so adding `valueFrom` to the
key list without its schema and words fails loudly. `allOf` carries the `length` and ordering-operator conditionals on
`value` (`:368-`). It is the EDGE comparison only: a gate's static `settings` carry `key` alone (`:217-219`), and the
`if`'s `when` is its type's `settingsSchema`'s `{}` — held by the validator, not the schema. Measured: the schema's text
holds no `valueFrom` (22,429 characters).

**Fact 8 — the spec.** `spec/flow-definition.md` v0.54. Section 3's `when` subsection (`:1403-1540`): the shapes table
(`:1423-1427`, *`path`, `op`, `value` required*), the path table (`:1434-1451`), the `input` root (`:1453-1461`), the
operators, the scope-of-negation note, **`value` is a SCALAR** (`:1489`), the kinds note, the absent rule and `default`,
`length`; `FD-C7` (`:1531`, *one key path per comparison* — moves to two). The refusal rows `FD-V42` (`:2717`, *missing
`path`, `op` or `value`*), `FD-V43` (`:2718`), `FD-V44` (`:2719`), `FD-V45`. **The highest rule id is `FD-V49`**, so a new
rule is `FD-V50`; `spec/README.md` counts the refusals (45). ADR 0074 rules 4, 6 and 7 are the ones `valueFrom` amends.

**Fact 9 — the predicate suite reads the key lists against the spec.** `test/definition/predicate.test.ts` imports
`PREDICATE_OPS` and `PREDICATE_ROOTS` and compares the leaf key lists to section 3's tables (`validate.ts:680-683`'s
docblock: *a list is a claim about another list*), so W221 moves the spec's table and the constant together or that suite
goes red — the intended reader. The corpus' one predicate flow is `spec/examples/valid/declared-predicate.flow.json`; the
invalid files `FD-V42--…` to `FD-V45--…`, one each.

**Fact 10 — the release and the ladder.** `HEAD` `a48b77c`, one local commit (Q790) past `origin/main` = `ffcc774`
(`v0.12.0`); `package.json` / `deno.json` 0.12.0. Spec versions: `flow-definition.md` v0.54, `join-policy.md` v0.25,
`run-state.md` v0.36, `outcome-record.md` v0.21, `runtime-targets.md` v0.14, `task-id.md` v0.16. Scheduler pin 0.6.0. L1-L5
**103 files / 2,295 cases** in node, measured (`npm test` EXIT 0); L6 **2883 / 252** (`npm run state`); `check:docs`
`RUN_FLOOR` **54** (`scripts/check-docs.mjs:744`); `CHECKPOINT_FORMAT` 2.

## Scope

**In** — `keyPathSteps` and `KeyPathStep` exported from the root entry, and the five key-path names documented with a
`run` snippet (W220); a comparison's `valueFrom` — the grammar, the evaluator, the `if`'s condition, `definitionSchema()`,
the spec and ADR 0140 (W221); (g)'s answer, in W221; an L6 block, the reply and P45's close (W222); W223 if (h1).

**Out** — a `valueDefault` or any default for `valueFrom` ((b1): additive later, on a real flow); `valueFrom` on a
`switch` case ((d1)); `length` or `default` on the right side (the LEFT side's only); a validator function exported
((c2)); the wiring check reading a predicate path (fact 6, ADR 0074 consequence 6 unmoved); a comparison of two
expressions, arithmetic or a third operand; `CHECKPOINT_FORMAT` (decision 7); the version bump, the push and the publish
((e1), the maintainer's); [Q790](../questions/q790.md)'s streaming source (deferred by the maintainer, not before
fyflow-app asks); P44 retro (b)'s `stopped` dual read (no P45 row touches resume).

## Decisions taken at this declaration

*Each follows from a fact or an answer named beside it. (g) was open at this declaration and decision 5 waited on it; the
maintainer answered (g1) on 2026-10-25, and W221 built it.*

1. **#2 — two names join the root entry, beside the three already there** ((c1); fact 2). `keyPathSteps` and
   `KeyPathStep` are re-exported where `readKeyPath` is — `validate.ts`' re-export line — so `index.ts` stays a list of
   `export *` and `evalLeaf` / `evaluateDeclared` stay unexported; `condition.ts`' docblock says what is public and why.
   Both builds read the one `index.ts`, so *from the browser entry too* is true by construction and W220 MEASURES it on
   the built `dist/browser/index.js`. `AGENTS.md` gains one subsection — the five names, the grammar, the parse, the
   read, the roots — with a `run` snippet; `RUN_FLOOR` 54 → 55. **No ADR** (ADR 0141 expected unused): exporting a
   reader the library already uses decides nothing a sentence in the docblock does not.
2. **#1 — `valueFrom` is a fourth comparison key, exactly one of `value` / `valueFrom`** ((a1); facts 3, 4, 8). Both, or
   neither, is refused at `new Driver`. **The rule is W221's to choose and state** — a clause of `FD-V42` widened, or a
   new `FD-V50` beside it — and either way its message names the two keys. `valueFrom`'s path is held to `FD-V43`'s
   every clause under the comparison's own SCOPE: the key-path grammar, the roots (`outcome`/`needs` on an edge, `input`
   in an `if`), an index on the root refused, `[n]` after a key accepted, a root alone refused, an unknown root refused
   by name — `leafProblem`'s path clauses applied to a second key, not copied. `FD-V44`'s literal clauses do not apply
   to it (fact 4): its kind is a run-time fact. `PREDICATE_LEAF_KEYS` gains `valueFrom` and `PREDICATE_LEAF_REQUIRED`
   loses `value` — **two exported constants' VALUES move**, stated as such (decision 8).
3. **What a resolved `valueFrom` is compared as** ((a1); fact 3). Exactly as a literal `value` would be: type-strict,
   no coercion; a resolved `null` compared as `null` (`eq null` holds against a left `null`); **a resolved object or
   array is NO MATCH for every operator, `ne` included** — the guard is written, because `===` would make `ne` true
   against a left scalar and `eq` true where both sides name one object (fact 3). *An `ne` over an object on the LEFT
   stays true, unmoved* — the left side's rules are 0.12.0's, and a literal `value` cannot be an object; the asymmetry
   is stated in the spec and the ADR. Taken under the standing instruction as the maintainer's *an object/array is no
   match* read literally.
4. **An ABSENT `valueFrom` is NO MATCH** ((b1)). A `valueFrom` that does not resolve — `readKeyPath`'s `undefined`,
   every case section 3's absent rule names — makes the comparison false whatever the operator, and the left side's
   `default` does NOT stand in for it. **The consequence, written in the spec, the ADR and `AGENTS.md`: `x gt y` and
   `x lte y` are both false where `y` is absent** — no pair complements over an absent right side, as none did over an
   absent left side before `default`. `length` and `default` stay the LEFT side's only.
5. **`needs` on a `valueFrom` — (g)'s answer, W221's** (fact 5). Whatever (g) answers applies to `path` and `valueFrom`
   ALIKE — one rule for both sides of one comparison, never a check on one side only.
6. **The wiring check does not learn `valueFrom`, because it reads no predicate path** (fact 6; under the standing
   instruction, the maintainer's *the wiring check learns `valueFrom`* read as *wherever `path` is held*). ADR 0074
   consequence 6 extends to `valueFrom` and ADR 0140 says so; a predicate-path verdict in `checkWiring` stays out of
   scope.
7. **`definitionSchema()` learns `valueFrom`** (fact 7): its pattern built from the same roots and segment as `path`'s,
   a description, and *exactly one of `value` / `valueFrom`* (`oneOf` of two `required` sets, or the subset W221
   states); the `allOf` conditionals on `value` stay `value`'s. **Every 0.12.0 document the schema accepted it still
   accepts**, held by W210's suite. **`CHECKPOINT_FORMAT` does not move**: a checkpoint carries no definition and no
   decision's operands — `RN-R16`'s *it moves only when what a checkpoint CARRIES moves* — and a resumed run re-asks a
   `valueFrom` over a context composed from the log, as it re-asks a `path`.
8. **Non-breaking for DOCUMENTS, and the TYPE change stated** ((e1)). Every 0.12.0 document validates and routes
   unchanged (prediction 2). The surface that MOVES: `PredicateLeaf` gains `valueFrom` and `value` becomes one of two —
   W221 writes it as a two-member union, `PredicateGroup`'s precedent, so `{ path, op }` with neither fails at L0, and a
   consumer READING `leaf.value` sees `PredicateScalar | undefined` — stated in the reply; `PREDICATE_LEAF_KEYS`' and
   `PREDICATE_LEAF_REQUIRED`'s values; `definitionSchema()`'s comparison; the root entry's two new names. **Intended as
   0.13.0**, released only when the maintainer says so; no item bumps a version.
9. **One ADR, W221's ADR 0140**: *a comparison may compare against another key path over the same context, and an
   absent one is no match* — amending ADR 0074 rules 4 (the path, now two), 6 (between kinds, now on either side) and 7
   (absent, now on either side), and its consequence 6. **An item that finds it needs no ADR says so.**

### Stop-and-asks — (a)-(h) ANSWERED by the maintainer, 2026-10-25 ((g) and (h) after the declaration, *as recommended*)

| | the question | answered | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **#1 — the shape of a comparison against a key path** | **ANSWERED (a1)**: the key is `valueFrom`, not an overloaded `value: { path }`; exactly one of `value` / `valueFrom`, both or neither refused at `new Driver` (a new `FD-V` rule beside `FD-V42`, or `FD-V42` widened — the spec author's choice, stated); the same roots as `path` (`outcome`/`needs` on an edge, `input` in an `if`) and `FD-V43` extended to it; what it resolves to compared exactly as a literal: type-strict, a resolved `null` as `null`, an object or array no match; the wiring check and `definitionSchema()` learn it; `spec/flow-definition.md` bumped, ADR 0140 amending ADR 0074 | **(a2)** `value: { path }` — a `value` that is sometimes an object, which `FD-V44`'s *a SCALAR* and every reader of `value` would have to tell apart. **(a3)** decline — the Transform or the registered predicate stays the only road |
| **(b)** | **#1 — what an absent `valueFrom` means** | **ANSWERED (b1)**: NO MATCH, written down; no `valueDefault` (additive later if a real flow needs it); the consequence stated — `x gt y` and `x lte y` are both false when `y` is absent | **(b2)** a `valueDefault` now — a fifth key for a case no flow has shown |
| **(c)** | **#2 — what is exported** | **ANSWERED (c1)**: `readKeyPath`, `KEY_PATH_RE` and `PREDICATE_ROOTS` are already public from the root entry in both builds; export `keyPathSteps` and `KeyPathStep` beside them (both builds) and document all five in `AGENTS.md` with a `run` snippet | **(c2)** also export a validator function (*is this a key path, under which roots*) — **declined**: `KEY_PATH_RE` and the roots are the grammar, and a second public spelling of `FD-V43` would be a second thing to hold in step |
| **(d)** | **#1 — `switch`** | **ANSWERED (d1)**: `switch` cases are NOT given `valueFrom` | **(d2)** a case value from a key path — a table whose keys are not known at load, so `FD-V41`'s *every case wired* and the *value named by two cases* refusal lose their subject |
| **(e)** | **The release** | **ANSWERED (e1)**: non-breaking, no `CHECKPOINT_FORMAT` change, intended as **0.13.0**, released only when the maintainer says so; no item bumps a version | **(e2)** a release per item |
| **(f)** | **How the items run** | **ANSWERED (f1)**, P44's standing answer carried: items run one after another as subagents; the orchestrator returns to the maintainer only on a stop-and-ask and takes the recommended option on minor ones, recording it | **(f2)** the maintainer asked at every item's step |
| **(g)** | **#1 — `needs` on a comparison's path is NOT checked against the edge's declaration today** (fact 5). (a1) says *a `needs.X…` `valueFrom` requires X declared in that edge's `needs`, as `path` does* — and `path` does not: `needs.limit.max` on an edge declaring no `needs` is accepted and is NO MATCH for ever (`FD-C3`'s `{}`). So making the clause true is a NEW refusal, and it is one rule for both keys or an asymmetry | **ANSWERED (g1)** by the maintainer 2026-10-25, *"As recommended"* — recorded at W221's commit: refuse BOTH a `path` and a `valueFrom` rooted at `needs` whose first key is not one this edge's `needs` declares, under `FD-V43`, the message naming the key and the edge's declared keys — `FD-V43`'s own argument (*would resolve to nothing in silence and so is a wrong key rather than a question*) one step in; built in W221. **A change in what is accepted**, stated in the spec's version note and the reply; it refuses no corpus flow (fact 5: 0 of 4) and only comparisons that can never be true, so 0.13.0 stays non-breaking for any flow that routes on its `needs` | **(g2)** neither checked — `valueFrom` exactly as `path` is today, `FD-C3`'s *absent* written beside it, and the (a1) clause withdrawn; a question raised for the class. **(g3)** `valueFrom` checked and `path` not — the asymmetry decision 5 refuses |
| **(h)** | **P44 retro (a), left open at P44's close: `check:spec` does not check that a corpus file a refusal row cites EXISTS** — its recommendation was *in its own small item of the next plan that touches `spec/`*, and P45 touches `spec/flow-definition.md` (W221) | **ANSWERED (h1)** by the maintainer 2026-10-25, *"As recommended"* — W223 ISSUED, recorded at W221's commit: W223 is that item — every `spec/examples/**` path a refusal row cites resolved by `scripts/check-spec.mjs`, with its self-test probe — run AFTER W221 and BEFORE W222, so W222 stays the plan's last item and runs `gate:full`; W223's confirming gate is `gate:item` (v0.29 names `gate:full` for `check-register*`, `state.mjs` and the register's README only), which carries `check:spec:selftest` | **(h2)** not in P45 — W223 closes unissued and P44 retro (a) waits for the next plan touching `spec/`. **(h3)** raise it as a question and leave it |

*P44 retro (b) — ADR 0102's `stopped` dual read — stays open and is NOT P45's: its recommendation names the next plan
touching the driver's resume, and no P45 row does.*

## Work items

**P39 retro's proposal B, as P40 adopted it and P40's-P44's retros carried it** — B′, C, D′ and E, **with P44's three
brief sentences added**:

- **B′ — the census re-take, with the self-test floors, and WITH ITS SPEC**: *an item that adds a node, a field, a suite,
  a module, a snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — the
  change INCLUDING its `spec/` and corpus edits — and, where it adds or removes an executed snippet or moves the size of
  an always-read document, the self-test that reads that floor (`check:docs:selftest`, `check:budget:selftest`).* Every
  row that may add or remove a `run` snippet in `AGENTS.md` OWNS `scripts/check-docs.mjs`' `RUN_FLOOR` (54 at this
  declaration) and nothing else in that file.
- **C — one confirming gate per item**: `npm run gate` before its readers; `gate:item`, or the last item's `gate:full`,
  ONCE, after them, on the final tree.
- **D′ — the census sites AND the readers in the plan's row**, by a grep for each changed name, each premise the change
  falsifies, and a sibling of each member it adds; **every row touching `AGENTS.md` owns the WHOLE of it**. A census by
  name is a census of NAMES; a reader of the WHOLE value is found by running the lanes.
- **E — a compound probe kills nothing**, per CALL SITE: `valueFrom`'s exactly-one clause (both; neither) two; its
  `FD-V43` clauses one each, on an edge AND in an `if`; the evaluator's resolved-object guard, its absent rule and its
  type-strictness one each; the schema's `valueFrom` pattern and its exactly-one two; (g1)'s clause on `path` and on
  `valueFrom` two; each export one.

**The brief sentences, every item's**: ***each item's Record states its readers' overlap***; ***a claim of ABSENCE is
shown able to fail by a control on the same observer, taken AFTER the event it denies***; ***an expected collection is
re-derived from the row's own steps, never from the old literal by substitution***; ***a refusal is a claim with a
control*** — `{ value, valueFrom }` refused beside each alone accepted; ***a new suite's wall is a share of the chromium
lane's 60 s, stated with the machine state it was measured in***; ***where a plan enumerates what a change protects,
enumerate what it BREAKS*** — here, a consumer reading `leaf.value` or the two key-list constants (decision 8), and under
(g1) every flow with an undeclared `needs` comparison. From P44's retro: ***a control comparing against a value's old
SHAPE is re-derived, not re-run***; ***a change to a key's type re-asks which wrong orders each fixture still
separates***; ***an exit clause and an item's outputs paragraph are one claim written twice — write the second from the
first***.

**D′ applied — the sites each row moves.**

- **W220**: `src/definition/validate.ts:28` (the re-export line), `src/definition/condition.ts:9-11` (the docblock's *not
  re-exported* sentence), `index.ts` only if the re-export is placed there instead (decision 1 says not);
  `test/driver/surface.test.ts` (the exported surface); `AGENTS.md` (a new subsection, `:821`'s sentence, section 11's
  *does NOT exist* list if it names any of the five); `README.md` if its export list names them; `scripts/check-docs.mjs`
  `RUN_FLOOR`. The PREMISE: *`keyPathSteps` is internal* (`condition.ts:9`, `wiring.ts:95`'s import comment).
- **W221**: facts 3, 4, 7 and 8's every site — `evalLeaf` (`condition.ts:110-158`), `leafProblem` and the two key-list
  constants (`validate.ts:685-686`, `:755-827`), `predicateShapeOf` (only if `valueFrom` should mark a shape — it should
  not: `{ valueFrom }` alone is `FD-V42`'s *marks none*), `gateConditionProblem` (`:908`, the `if`'s scope),
  `PredicateLeaf` (`types.ts:115-150`, and the comments at `:117`), `leafSchema` and `PREDICATE_DESCRIPTIONS`
  (`definition-schema.ts:168-176`, `:345-390`), `spec/flow-definition.md` section 3's `when` subsection (the shapes
  table, the path table, the `input` root, `value` is a SCALAR, the kinds note, the absent rule, `FD-C7`), the rule rows
  `FD-V42`-`FD-V44` (and `FD-V50` if chosen), section 7's corpus table; `spec/README.md` (the refusal count if a rule is
  added, the version); `test/definition/predicate.test.ts` (fact 9) and W210's schema suite; `AGENTS.md` section 4 (the
  key table at `:945-951`, the *three things to know*), section 19's `if` table (`:5388`), section 21 if a UI-emitted
  flow cites the comparison's keys; ADR 0074 (an amendment note, the record step). The PREMISES: *a comparison compares
  against a LITERAL* (`types.ts:101-107`, `:126`; spec `:1489`'s argument against an object value), *one key path per
  comparison* (`FD-C7`), and — under (g1) — *`needs` under a comparison is absent where undeclared* (`FD-C3`).
- **W222**: `X10` (`examples/README.md`); `CONSTRUCTION_PRICED` (`examples/l6.ts`) if a construction is added;
  `examples/flows/**` and `examples/workers/**` for pass 6's flow and its `Limit`/`StatPath` workers.
- **W223 (if (h1))**: `scripts/check-spec.mjs`, `scripts/check-spec-selftest.mjs`.
- **The always-read set**: no row edits `CLAUDE.md`, `doc/workflow.md` or `doc/concept.md`, except W222's plan-close
  bookkeeping in `doc/workflow.md` (P40's W200 … P44's W218 precedent, declared before the edit).

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W220 | **#2 — the key path reader exported and documented** — (c1); decision 1; fact 2 | `src/definition/validate.ts` (the re-export line only), `src/definition/condition.ts` (the docblock only), `test/driver/surface.test.ts`, `test/definition/**` (a new suite), `AGENTS.md`, `README.md` (only if an export list moves), `scripts/check-docs.mjs` (`RUN_FLOOR` only) | nothing — (a)-(f) answered | `gate:item`; L0: `keyPathSteps` and `KeyPathStep` reachable from `index.ts` in the node, browser and deno typecheck lanes; L1: the root namespace holding `keyPathSteps`, `readKeyPath`, `KEY_PATH_RE` and `PREDICATE_ROOTS`, each `===` the module's own (the control: `evalLeaf` and `evaluateDeclared` ABSENT from it); `npm run build` and the built `dist/browser/index.js` and `dist/node/index.js` each exporting both functions (a measurement named in the Record); `AGENTS.md`'s `run` snippet — `files[0].name` read, its steps listed, a plain `xs.1` over an array `undefined`, a malformed path refused by `KEY_PATH_RE` — executed by `check:docs`, `RUN_FLOOR` 55 |
| W221 | **#1 — a comparison's `valueFrom`; ADR 0140** — (a1), (b1), (d1), (g); decisions 2-9; facts 3-9 | `src/definition/condition.ts`, `src/definition/validate.ts`, `src/definition/types.ts`, `src/definition/definition-schema.ts`, `src/driver/routing.ts` (only if a comment moves), `test/definition/**`, `test/driver/**`, `test/definition/l4-corpus.test.ts` (counted), `spec/examples/valid/**` and `spec/examples/invalid/**` (new files only), `spec/flow-definition.md` (v0.55: section 3's `when` subsection, `FD-V42`-`FD-V44` and `FD-V50` if chosen, `FD-C3` under (g1), `FD-C7`, section 7's table), `spec/README.md`, `AGENTS.md`, `scripts/check-docs.mjs` (`RUN_FLOOR` only), `doc/decisions/0140-*` | W220; **(g) answered** | `gate:item`; L1: exactly one of `value`/`valueFrom` — both refused, neither refused, each alone accepted — naming the rule chosen; `valueFrom`'s `FD-V43` clauses on an edge and in an `if` (an unknown root, `input` on an edge, `outcome` in an `if`, an index on the root, a root alone, a malformed path refused; `outcome.result.items[0].max` accepted); `evalLeaf` over a hand-derived table — the seven operators against a resolved number, string, boolean, `null`, object, array and an absent right side, each beside the same value as a literal, `ne` over a resolved object false, `x gt y` and `x lte y` both false where `y` is absent, a left `default` not standing in for an absent right; every existing `FD-C7` case unmoved; under (g1), an undeclared `needs` key refused on `path` and on `valueFrom`, each beside the declared form accepted; `definitionSchema()` accepting `valueFrom` and refusing both-or-neither, every W210 verdict unmoved; L2: pass 6's flow routed both ways by `lte needs.limit.max` with no predicate registered, and an `if` on `input.a` against `input.b`; L4: every 0.12.0 corpus verdict unmoved, the new files' verdicts by hand |
| W222 | **The exit artifact on real workers, the reply, P45's close** — exit (3); `gate:full` | `examples/l6.ts`, `examples/README.md`, `examples/flows/**`, `examples/workers/**`, `test/definition/l4-corpus.test.ts` (if a census moves); `doc/workflow.md` (the plan-close bookkeeping only, declared); outside this repository, `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass6.reply.md` | W221, W223 | **`gate:full`** (the plan's last item); L6 in node 24 and deno, threaded and inline; `X10` moved by its block alone |
| W223 | **ISSUED by (h1)** (the maintainer, 2026-10-25) — `check:spec` resolving every corpus path a refusal row cites, with its self-test probe; serial: after W221, before W222 | `scripts/check-spec.mjs`, `scripts/check-spec-selftest.mjs` | W221 | `gate:item`: a cited path that does not exist refused by name, its probe checked in, every refusal row's citation resolved on the final tree |

**The rows are SERIAL, never concurrent** — W220 and W221 share `validate.ts`, `condition.ts`, `AGENTS.md` and
`RUN_FLOOR`; W221 and W222 the corpus census and the spec W222's flow is held to (`doc/workflow.md` section 7 rule 2) —
which (f1) answers anyway. **No item edits `scripts/check-register*.mjs`, `scripts/state.mjs` or
`doc/questions/README.md`**, so `gate:item` is W220's, W221's and W223's (issued by (h1)), and `gate:full` W222's. **The order is W220, W221, W223,
W222.**
**Questions reserved per item**, so no two take one: W220 Q791-Q792, W221 Q793-Q794, W222 Q795-Q796, W223 Q797-Q798.
**ADRs**: W221 ADR 0140; W220 ADR 0141 (expected unused, decision 1); ADR 0142 reserved, expected unused. **No item
raises a question by plan**; one a NO to an asked widening produces is raised as section 1 rule 6 says, and under (g2) W221
raises the one (g2) names from its block.

**Why W221 is ONE item**: the grammar, the evaluator and the schema are one claim — *a document the validator accepts is
one the schema accepts and the evaluator answers* — and a tree with the key accepted and not evaluated would route a
`valueFrom` comparison by `value: undefined`. **Split only on a stop-and-ask.**

**The reply to fyflow-app goes where P44's did** — `../fyflow-app/.scratch/mu-upstream-adoption/requests/`, as
`fyflow-orchestration.pass6.reply.md`, **status UNRELEASED** until the maintainer releases 0.13.0. **W222 writes it**, from
this plan and the Records, once its own gate is green: #1 accepted as `valueFrom` — pass 6's own example in the accepted
form (`{ "path": "outcome.result.size", "op": "lte", "valueFrom": "needs.limit.max" }`, its edge declaring
`"needs": { "limit": "sizeLimit" }`), exactly one of the two keys, the same roots, type-strict, a resolved `null` as
`null`, an object or array no match (`ne` included), **an absent `valueFrom` no match, with the consequence that `x gt
y` and `x lte y` are both false where `y` is absent**, no `valueDefault`, `length` and `default` the left side's, `switch`
untouched; (g)'s answer as a change in what is accepted where it is one; #2 accepted — the five names, both builds, the
`AGENTS.md` section; the type change of decision 8; 0.13.0 non-breaking for documents, **its release state MEASURED at
the time of writing** (npm, JSR, tags, `origin/main`), and the bump, push and publish the maintainer's ((e1)).

**Each item writes its own file from its row when it starts** (`doc/work-items/TEMPLATE.md`) — no item file is written at
this declaration. **Its `**Status:**` line's FIRST WORD is one of the template's five**. What the row cannot carry is
below: each item's OUTPUTS, and what its declaration step RE-TAKES before any `src/` edit (P15 decision 5). Every item's
last re-take is the ladder counts.

**W220 — outputs**: the re-export; `condition.ts`' docblock; the surface assertions with their control; the built
bundles measured; the `AGENTS.md` subsection and its `run` snippet; `RUN_FLOOR` 55. **Re-takes**: fact 2 — every export
of the five, and whether any doc or test names `keyPathSteps` as internal.

**W221 — outputs**: the rule chosen and its sentence (decision 2); `leafProblem`'s `valueFrom` clauses, sharing the path
clauses rather than copying them; `evalLeaf`'s right side — resolution, the absent rule, the object guard; `PredicateLeaf`
as a union (decision 8); `definitionSchema()`'s `valueFrom`; (g)'s answer; the invalid files the new clauses earn and a
valid file carrying `valueFrom` on an edge and in an `if`; `spec/flow-definition.md` v0.55; ADR 0140 and the amendment note
it carries for ADR 0074; `AGENTS.md` section 4 and section 19's `if` row. **Re-takes**: fact 5's census on its starting
tree with (g1)'s clause built (B′) — every L1-L6 case and `AGENTS.md` snippet constructing an undeclared `needs`
comparison, which the corpus census cannot see; fact 3's `ne` measurement; whether any valid corpus or example flow, or any
snippet, carries `valueFrom` (expected none).

**W222 — outputs**: the L6 block (exit (3)) — pass 6's own flow: `sizeLimit` returning `{ max }`, `stat` returning
`{ size }`, its edge to `copy` `when: { path: "outcome.result.size", op: "lte", valueFrom: "needs.limit.max" }` with
`needs: { limit: "sizeLimit" }` and a default edge; one run with `size <= max` taking `copy` and one with `size > max`
taking the default, each beside its control — the same comparison with `value` the literal `max` routing the same way, and
a `valueFrom` naming an absent key (`needs.limit.nope`) taking the default where `size <= max`; and an entry `if` with
`when: { path: "input.a", op: "lt", valueFrom: "input.b" }` routing `then` and `else` on two payloads, its control an
absent `input.b` routing `else`; threaded and inline, node and deno; each claim its own verdict; `X10` moved by the block
alone; the reply; P45's Record and retro. **It places no logic**: a counter or `src/` site it cannot read is an Exception
named before the edit. **Re-takes**: W220-W221's counts and walls in node, deno and chromium; the release state,
measured.

## Predictions, written before the items that test them

1. **W220 moves no existing case** in any runtime: it adds a suite and one `run` snippet (`RUN_FLOOR` 54 → 55), and the
   built `dist/browser/index.js` exports `keyPathSteps` with no build-script edit.
2. **W221 moves no corpus verdict** — every 0.12.0 `*.flow.json` validates as before, under (g1) too (fact 5: 0 of 4
   `needs` comparisons undeclared) — and no existing `FD-C7` evaluator case.
3. **Under (g1), W221's B′ census finds at least one L1-L5 case constructing an undeclared `needs` comparison** (fact 5's
   census reads the corpus only, and `FD-C3`'s `{}` clause has a constructed test) — and at most five.
4. **W221 moves no L6 claim** (2883 / 252 unmoved until W222) and no `CHECKPOINT_FORMAT`.
5. **W210's schema suite moves only where it reads the comparison's key list** — no document's schema verdict flips.
6. **W222 moves `X10` by its block alone, and no existing L6 row.**

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q790](../questions/q790.md) | a streaming source — `deferred` by the maintainer 2026-10-25, between plans; not before fyflow-app asks | — |
| *(Q791-Q798)* | none planned; (g2) would raise one from W221's block | each item's block, on a NO |

## Ids

**`npm run state` disagrees on Q, and that is expected**: the tree's next free Q is **Q791**, the ledger's — P44's Retro
sentence, written before it — **Q790**. [Q790](../questions/q790.md) was raised by the maintainer BETWEEN plans on
2026-10-25, after P44's close (`a48b77c`, *doc: Q790 deferred - a streaming source*), so P44's ledger could not know it.
**P45's Q block therefore starts at Q791**, and Q790 is the maintainer's, not this plan's. W and ADR agree (W220, ADR
0140).

- **Reserved here**: W220-W223 (W223 expected unused unless (h1)); Q791-Q798, two per item; ADR 0140-0142 (ADR 0141 and
  ADR 0142 expected unused). No S id; the next S id is S13.
