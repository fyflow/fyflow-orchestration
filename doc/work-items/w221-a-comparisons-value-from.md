# W221 — A comparison's `valueFrom`: a key path in place of the literal, an absent one no match, and `needs` held to the edge's declaration

**Status:** done 2026-10-25 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; one asked exception (`spec/outcome-record.md`'s figure sentence), ADR 0140, no question raised. Earlier: declared 2026-10-25 on `c170eb0`, P45's SECOND item: (a1), (b1), (d1), (g1); decisions 2-9; facts 3-9; this file written from the plan's row BEFORE any other edit
**Plan:** [P45](../plans/p45-what-a-comparison-may-compare-against-and-who-may-read-a-key-path.md) — *what may a
comparison compare against, and who may read a key path the way a gate does?* — fyflow-app's pass 6 #1, answered (a1),
(b1) and (d1) by the maintainer; (g) and (h) answered by the maintainer 2026-10-25, *as recommended*: (g1) and (h1).

```
Spec:       spec/flow-definition.md v0.54 -> v0.55: section 3's `when` subsection (the shapes table, the path table, the
            `input` root, the operators' `value` note, `value` is a SCALAR, the kinds note, the absent rule, FD-C7),
            FD-C3 (the decision's `needs` under (g1)), section 1's schema table, section 5's FD-V42 and FD-V43 (FD-V44's
            literal clauses read as `value`'s alone), section 7's corpus table; ADR 0074 rules 4, 6, 7 and consequence 6,
            amended by ADR 0140.
Owns:       from P45's W221 row, exactly: src/definition/condition.ts; src/definition/validate.ts; src/definition/types.ts;
            src/definition/definition-schema.ts; src/driver/routing.ts (only if a comment moves); test/definition/**;
            test/driver/**; test/definition/l4-corpus.test.ts (counted); spec/examples/valid/** and
            spec/examples/invalid/** (new files only); spec/flow-definition.md (v0.55); spec/README.md; AGENTS.md (the
            whole of it, D′); scripts/check-docs.mjs (RUN_FLOOR only); doc/decisions/0140-*; this file.
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): the record step's four files; AND P45's plan
            file OUTSIDE its Record — the stop-and-asks heading and rows (g) and (h) recording the maintainer's 2026-10-25
            answers, the Status line's "(g) and (h) OPEN", and the W223 row moved from reserved to ISSUED, serial after
            W221 and before W222 — by the maintainer's instruction carried in this item's brief. Anything else found to
            need an edit is a STOP-AND-ASK.
            ASKED at the B′ run, before the edit (a minor stop-and-ask, the recommended option taken under P45 (f1) and
            recorded here, on W209's precedent — its exception (a), YES): spec/outcome-record.md, ONLY section 4's
            figure sentence -> "22 of 225", "203 (90%)", with its history clause. `test/fold/result-value.test.ts`
            re-derives the four numbers from both corpora, and `value-from.flow.json` adds four task nodes and ONE
            named (`limits`, by `score`'s edge `needs`). The alternative — a valid file with no task node, an ask
            carrying the edge — would bend the corpus document to avoid a derived count.
Inputs:     P45 decisions 2-9, facts 3-9, (a1), (b1), (d1), (g1); W220's Record (conformity NIT 2: AGENTS.md's `edgePath`
            "the roots, as FD-V43 reads them" becomes a NECESSARY condition under (g1)).
Outputs:    (1) the rule chosen: FD-V42 WIDENED, no FD-V50 — a comparison carries `path` and `op` and EXACTLY ONE of
                `value` / `valueFrom`; both, or neither, is FD-V42, the message naming the two keys. PREDICATE_LEAF_KEYS
                gains `valueFrom` (six); PREDICATE_LEAF_REQUIRED loses `value` (`path`, `op`).
            (2) leafProblem: `valueFrom` held to FD-V43's every path clause under the comparison's own scope, by ONE
                function the two keys share (`comparisonPathProblem`), not a copy; FD-V44's literal clauses `value`'s alone.
            (3) (g1): FD-V43 refuses a `path` OR a `valueFrom` rooted at `needs` whose first key past the root is not one
                that edge's `needs` declares — `{}` where it declares none — the message naming the key and the declared
                keys; asked only where the edge's `needs` is absent or a non-empty object (FD-V26 owns every other).
                `predicateProblem(v, edgeNeeds?)` gains the optional second argument the validator passes.
            (4) evalLeaf's right side: `valueFrom` read by readKeyPath over the SAME scope; undefined -> no match; an
                object or an array -> no match, every operator, `ne` included; else compared as the literal would be.
                The left side's `default` and `length` do not touch it.
            (5) PredicateLeaf a two-member union (`value` | `valueFrom`, the other `?: never`), PredicateGroup's precedent.
            (6) definitionSchema(): `valueFrom` (path's pattern, a description), `required` [path, op], and `oneOf`
                [{required:[value]}, {required:[valueFrom]}]; the `allOf` conditionals stay `value`'s.
            (7) corpus: valid `value-from.flow.json` (an edge on `needs.limit.max`, an `if` on `input.b`); invalid
                `FD-V42--a-comparison-with-value-and-value-from.flow.json`,
                `FD-V43--value-from-outside-the-roots.flow.json`, `FD-V43--a-needs-key-the-edge-does-not-declare.flow.json`.
            (8) tests: test/definition/value-from.test.ts (L1: grammar, (g1), evaluator table, schema) and
                test/driver/value-from.test.ts (L2: pass 6's flow both ways, an `if` both ways, no predicate registered);
                both in l4-corpus' census and COUNTED; predicate.test.ts' key lists moved.
            (9) spec/flow-definition.md v0.55; spec/README.md's version line (the refusal count stays 45).
            (10) ADR 0140 — amends ADR 0074 rules 1, 4, 6 and 7 and consequence 6 (rule 1 added at the conformity reader's NIT 5); its pointer note in ADR 0074 (record step).
            (11) AGENTS.md: section 4's snippet, key table and "three things to know"; W220 NIT 2's `edgePath` sentence;
                section 19's `if` table; section 21's narrowing 2 and its Q456 callout; the type change stated.
Depends on: W220 (done); (g) answered (g1)
Blocks:     W223, W222
Tests:      Outputs (8) and the corpus (7). L1 in node, deno and chromium; L2 the same; L4 the corpus; L0 in all five
            typecheck lanes and check:docs X3-X5. Expected values from section 3's sentences and P45 decisions 3-4,
            derived by hand below before the first run.
Gate:       `npm run gate:item` (not the plan's last item; no edit to scripts/check-register*.mjs, scripts/state.mjs or
            doc/questions/README.md); `npm run gate` on the B′ draft in a byte copy (C:/tmp-w221/m) before the Owns are
            fixed; sentence C — `npm run gate` before the readers; the conformity and adequacy readers, workflow section
            6, in worktrees under C:/tmp-w221; rule 8 on any fix, with a no-op control.
Reserves:   Q793-Q794, ADR 0140
```

## Scope

**In**

1. **The grammar** — Outputs (1)-(3).
2. **The evaluator** — Output (4), on an edge and in an `if`, through the one `evaluateDeclared`.
3. **The type and the schema** — Outputs (5), (6).
4. **The record of it** — Outputs (7), (9)-(11).

**Out** — named rather than left implicit, with where it goes instead

- **`valueDefault`** ((b1)); **`valueFrom` on a `switch` case** ((d1)); **`length` / `default` on the right side**.
- **The wiring check reading a predicate path** — decision 6; ADR 0074 consequence 6 extends to `valueFrom`.
- **`CHECKPOINT_FORMAT`** — decision 7; **the version bump** — (e1).
- **W223's `check:spec` clause and W222's L6 block and reply** — their items.

## Hand-derived values (written before the first run)

**The grammar** (`FD-V42`, `FD-V43`; on an edge unless marked `if`):

| comparison | verdict |
|---|---|
| `{ path, op, value }` | accepted (unmoved) |
| `{ path, op, valueFrom: 'outcome.result.max' }` | accepted |
| `{ path, op, value, valueFrom }` | `FD-V42` (both) |
| `{ path, op }` | `FD-V42` (neither) |
| `{ valueFrom: 'outcome.x' }` alone | `FD-V42` (marks no shape — unmoved) |
| `valueFrom: 'result.max'` / `'input.b'` on an edge | `FD-V43` (root) |
| `valueFrom: 'outcome'` / `'outcome[0].x'` / `'outcome.result[01]'` / `7` | `FD-V43` (root alone / index on root / grammar / not a string) |
| `valueFrom: 'outcome.result.items[0].max'` | accepted |
| `if`: `valueFrom: 'input.b'` | accepted; `'outcome.x'` -> `FD-V40` (FD-V43's grammar) |
| `op: 'lt', valueFrom` (no literal) | accepted — FD-V44's literal clauses do not apply |
| (g1) `path: 'needs.limit.max'`, edge `needs` absent | `FD-V43` |
| (g1) `valueFrom: 'needs.limit.max'`, edge `needs: { other }` | `FD-V43` |
| (g1) either, edge `needs: { limit: 'n' }` | accepted; `needs.limit[0].x` accepted (the key read up to `[`) |

**The evaluator** — left `outcome.result.l`, right `valueFrom: 'outcome.result.r'`; each row beside the literal
`value: r` where a literal is legal, the same answer:

| op | l | r | answer |
|---|---|---|---|
| eq / ne | 5 | 5 | true / false |
| eq / ne | '5' | 5 | false / true |
| lt, lte, gt, gte | 4 | 5 | true, true, false, false |
| lt, lte, gt, gte | 5 | 5 | false, true, false, true |
| startsWith | 'abc' | 'ab' | true |
| startsWith | 'xab' | 'ab' | false |
| lt / gte | 4 | 'ab' | false / false (between kinds) |
| eq / ne | true | true | true / false |
| eq / ne | null | null | true / false (a resolved null compared as null) |
| ne | 0 | null | true |
| every op | 5 | `{ a: 1 }` | false — `ne` included |
| every op | 5 | `[5]` | false — `ne` included |
| eq / ne | the SAME object (path = valueFrom) | — | false / false (`===` would make `eq` true) |
| every op | 5 | absent | false — so `gt` and `lte` both false |
| lt, `default: 3` on the left | absent | 5 | true (the left's default) |
| gt / lte, `default: 3` on the left | 5 | absent | false / false (the default does not stand in for the right) |
| gte, `length: true` | 'abc' | 3 | true (the left's length) |

**L2** — pass 6's flow: `sizeLimit` -> `stat` -> edge `{ path: 'outcome.result.size', op: 'lte', valueFrom:
'needs.limit.max' }` with `needs: { limit: 'sizeLimit' }` to `copy`, default to `skip`. `max` 100: size 50 -> `copy`,
size 150 -> `skip`, size 100 -> `copy`; `valueFrom: 'needs.limit.nope'` (declared key, absent leaf) size 50 -> `skip`.
An entry `if` `{ path: 'input.a', op: 'lt', valueFrom: 'input.b' }`: `{a:1,b:2}` -> `then`, `{a:3,b:2}` -> `else`,
`{a:1}` -> `else`.

## Predictions, written before the change

1. **P45 prediction 2**: no 0.12.0 corpus verdict moves, under (g1) too; no existing `FD-C7` case moves.
2. **P45 prediction 3**: the B′ census finds at least one, at most five, L1-L5 cases constructing an undeclared `needs`
   comparison (fact 5's census read the corpus only).
3. **P45 prediction 4**: no L6 claim moves; no `CHECKPOINT_FORMAT`.
4. **P45 prediction 5**: W210's schema suite moves only where it reads the comparison's key list.
5. **`RUN_FLOOR` stays 55**: `valueFrom` joins section 4's existing `run` snippet rather than a new one.

## Verification

The B′ draft built in `C:/tmp-w221/m` (a worktree at `c170eb0`, the diff applied, `node_modules` COPIED) and `npm run
gate` run there before the `Owns` are fixed; the readers in `C:/tmp-w221/rc` and `C:/tmp-w221/ra`; rule 8 on any fix;
`npm run gate:item` once on the final tree, held still. **Routing coverage**: an unmatched decision (Q10) — an absent
`valueFrom` routes to the default edge at L2; a branch routed away (Q4), `user_action` (Q17), a duplicate task id (Q13)
and a nested fan-out (Q6) — not applicable, no join, terminal state or id moves.

## Record

*Filled 2026-10-25, after both readers and the confirming gate. Logs in `C:/tmp-w221/` (`gate-m.log`, `rule8.log`,
`gateitem.log`); the rule 8 harness `C:/tmp-w221/rule8.mjs`; the readers' in `C:/tmp-w221/rc-scratch` and
`C:/tmp-w221/ra-scratch`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| B′ — the draft built in the byte copy `C:/tmp-w221/m` (a worktree at `c170eb0`, the diff applied, `node_modules` COPIED, 0 links, 0 reparse points, every changed file `cmp`-identical to the author's) and `npm run gate` run there | RAN — **EXIT 0**, 14:59 → 15:04 (`gate-m.log`) | L1-L5 **106 files / 2,321 cases** in node 24.20.0, deno 2.9.6 and chromium; L6 **2,883 / 0** over 252 real runs in node and deno; every check EXIT 0. Before it, `npm test` in the working tree found what B′ exists for — see *What broke* |
| sentence C — `npm run gate` before the readers | the B′ run above, on content byte-identical to the author's tree | |
| conformity reader (`C:/tmp-w221/rc`) | RAN | 0 BLOCKER, 2 SHOULD, 4 NIT; re-derived every one of this file's 76 hand-derived verdicts from the spec and agreed on all 76; its own constructed cases agreed 49/53 on validation (the four its own fixture's or underived), 103/103 on the evaluator, 15/15 on the schema |
| adequacy reader (`C:/tmp-w221/ra`) | RAN | 51 mutants plus a no-op control (green) and a CRASH grader (red for the import reason): 47 killed by `npm test`, 2 (the type union) by `tsc` at the `@ts-expect-error` lines, 1 equivalent (E-eqne), **3 survivors** (E-rightlength, E-leftdefault-null, V43-order) and 4 test weakenings `npm test` did not see (W-objects, W-absent, W-g1table, W-taut); every file restored, digests before = after |
| rule 8 on the fixes (`rule8.mjs`, in `m` synced to the final tree) | RAN — **EXIT 0** (`rule8.log`) | P0 no-op control GREEN; P1 E-rightlength, P2 E-leftdefault-null, P3 V43-order, P4 OBJECTS emptied, P5 ABSENT emptied, P6 REFUSED emptied — each RED naming the assertion the fix added; restored by digest |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 2026-10-25 16:11:16 → 16:37:15 (`gateitem.log`) | lint; typecheck (five lanes); every check; `check:docs` **61 snippets, 55 `run`**; L1-L5 **106 files / 2,321 cases** in node 24.20.0, deno 2.9.6 and chromium; L6 **2,883 / 0 failed** over 252 real runs in node and deno; selftests **10/10 ok** (1,199.5 s wall, 9 lanes), `check:register:selftest` left out by `--without`. No L6 row flaked. Written after it: this Record and the Status line — `check:markdown`, `check:budget`, `check:register`, `check:spec` re-run on it |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) FD-V42 widened; `PREDICATE_LEAF_KEYS` / `_REQUIRED` | yes — `RIGHT_SIDE_KEYS`, exactly one, message naming both | adequacy V42a-e (L1 suite, L4 corpus file, schema base, AGENTS.md X4) |
| (2) `comparisonPathProblem`, one check for both keys | yes | V43-all, -grammar, -root, -index, -alone, -msgkey; V43-order since the fix |
| (3) (g1) in FD-V43; `predicateProblem(v, edgeNeeds?)` | yes | G1-pathonly, -fromonly, -nobracket, -prefix, -nonempty, -noneedsundef, -V26empty, -V26nonobj, -default, -ignored, -group, -leaf, -msg |
| (4) `evalLeaf`'s right side | yes | E-absent, -noobj, -arrayonly, -objonly, -null, -neonly, -leftdefault, -ignored, -outcomeonly, -swap; E-rightlength and E-leftdefault-null since the fixes |
| (5) `PredicateLeaf` a union over `PredicateLeafBase` | yes | T-both, T-neither (`tsc`, TS2578) |
| (6) `definitionSchema()` | yes | S-nopattern, -needsonly, -outcomeonly, -nooneof, -anyof, -valuereq |
| (7) the four corpus files | yes | L4 per file; the schema partition; V42b, V43-all |
| (8) the two suites, counted | yes — 11 and 4 cases, `l4-corpus` counting both | W-delcase, W-empty (L1 and L2) |
| (9) spec v0.55, `spec/README.md` | yes — still 45 refusals | prose; `check:spec` |
| (10) ADR 0140 and ADR 0074's note | yes | `check:register` R6-R8 |
| (11) AGENTS.md | yes — section 4's `run` snippet extended (RUN_FLOOR stays 55), the key table, the type paragraph, the `edgePath` comment (W220's NIT 2), sections 19 and 21 | V42b, V43-all, E-noobj killed through X4 |

**Predictions.** 1 **HOLDS**: no 0.12.0 corpus verdict moved, under (g1) too; no existing `FD-C7` case. 2 (P45's 3)
**HOLDS at FOUR**: `predicate.test.ts`' `needs.outcome` and `needs.x`, `key-path-index.test.ts`' `needs.a[0]`,
`run-payload.test.ts`' `"$item"` edge — each re-cut to declare the key it reads, its claim unmoved. 3 **HOLDS**: L6 2,883 /
252 unmoved; `CHECKPOINT_FORMAT` 2. 4 **HOLDS, with a qualification**: W210's suite moved where it reads the key list AND
where it partitions the corpus — the (g1) file is the first file of a shape-only rule the schema cannot refuse
(`CROSS_KEY_FILES_OF_SHAPE_RULES`). 5 **HOLDS**: `RUN_FLOOR` 55.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity SHOULD 1 | `EDGE_DESCRIPTIONS.when` in the published schema still read `{ path, op, value, default?, length? }` | **FIXED** — `value or valueFrom` |
| conformity SHOULD 2 | spec: *"`eq` and `ne` complement over every value"* is false for a right side absent or an object | **FIXED** — the sentence qualified, pointing at the `valueFrom` table |
| conformity NIT 3 | `wiring.test.ts`' comment named a `review -> publish` arc the flow does not have | **FIXED** — `score -> publish` twice |
| conformity NIT 4 | the schema's `path` description omitted (g1) | **FIXED** |
| conformity NIT 5 | ADR 0074's note amends rule 1, ADR 0140 did not list it | **FIXED** — ADR 0140, the note, the spec's v0.55 note and Output (10) name rules 1, 4, 6, 7 and consequence 6 |
| conformity NIT 6 | the built-in `if` row did not name `valueFrom` | **FIXED** |
| adequacy E-rightlength (SHOULD) | `length` applied to the right side survived | **FIXED** — two rows: a string and an array right under `length: true`; rule 8 P1 red |
| adequacy E-leftdefault-null (SHOULD) | the left `default` standing in for a right `null` survived | **FIXED** — `5 ne null` with `default: 5` true; rule 8 P2 red |
| adequacy V43-order (NIT) | `valueFrom` asked before `path` survived | **FIXED** — both bad, the path named; rule 8 P3 red |
| adequacy W-objects, W-absent, W-g1table | a table emptied inside a case was green | **FIXED** — each table's length asserted (and the OBJECTS loop's ask count); rule 8 P4-P6 red |
| adequacy W-taut | the objects row made a tautology | **DECLARED** — one observer, W220's D1/D2 precedent; E-noobj is still killed by the same-object rows and AGENTS.md X4 |
| adequacy E-eqne | equivalent: the ordering and `startsWith` arms are type-guarded already | **DECLARED** — not a survivor |

**Decisions taken by this item** (within decisions 2-9): FD-V42 widened, no FD-V50 (ADR 0140's alternatives row); the
(g1) clause not asked where FD-V26 refuses the edge's `needs`, and a key declared with a refused reference counted as
declared — one defect, one rule; `predicateProblem`'s second argument optional, so a public caller with no edge is not
refused; `PredicateLeafBase` exported (a public type an exported union names); the literal clauses' *a length has no
prefix* and `default` clauses still asked of a `valueFrom`.

**What broke.** At B′ — the item's own census sites were complete by NAME and three readers of the WHOLE corpus moved:
`wiring.test.ts`' arc count (76 → 80), W211's registry partition (the (g1) file), and `test/fold/result-value.test.ts`'
outcome-record figure — the last outside `Owns`, taken as the asked exception above. And two prose sites the census by
name could not see (conformity SHOULD 1-2): a description string in `EDGE_DESCRIPTIONS` and a negation sentence whose
premise the object rule falsified.

**What this taught.** *For the retro*: **a corpus file is a census site of every derived count over the corpus** — three
moved here, each found only by running the lanes (B′ did its job; P44's D′ sentence *a reader of the WHOLE value is found
by running the lanes* held). **And a new rule's premise census should include the CLOSURE claims** (*complement over every
value*): a rule that adds a no-match case falsifies every sentence quantifying over all values.

**Questions raised.** None — Q793-Q794 SPENT, unissued. **Closed.** None ([Q456](../questions/q456.md) stays deferred:
`valueFrom` is now the road its callout names, and refusing a path-shaped literal is still unasked). **ADR 0140**
written. **Declared exceptions used**: P45's plan file (the (g)/(h) answers, the W223 row); `spec/outcome-record.md`'s
figure sentence. `src/driver/routing.ts` not edited.

**The readers' overlap.** **ZERO** shared subjects: the conformity reader's six were prose, a description string and the
ADR's rule list; the adequacy reader's were the evaluator's right-side modifiers, a clause order and the suite's tables.

**Leftover worktrees.** `C:/tmp-w221/m` (the B′ copy, synced to the final tree for rule 8), `rc` and `ra` (git worktrees at
`c170eb0` with the pre-reader change applied; `node_modules` COPIED; scanned: 0 links, 0 reparse points), with
`rc-scratch` and `ra-scratch` — left for the maintainer; not removed with `--force`.
