---
id: ADR 0140
title: "A comparison may compare against another key path, and an absent one is no match"
status: accepted
date: "2026-10-25"
item: W221
raised-by: P45
supersedes: ""
amends: ADR 0074 in part
resolves: ""
---

# ADR 0140 — A comparison may compare against another key path, and an absent one is no match

**Status:** accepted 2026-10-25 — [W221](../work-items/w221-a-comparisons-value-from.md) under
[P45](../plans/p45-what-a-comparison-may-compare-against-and-who-may-read-a-key-path.md), decisions 2-9, the maintainer's
(a1), (b1), (d1) and (g1) answering fyflow-app's pass 6 #1. **Amends**
[ADR 0074](0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md) rules 1 (a comparison's
keys: `value` OR `valueFrom`), 4 (the path, now two, and a `needs` key held to the edge), 6 (between kinds, on either side), 7 (absent, on either side) and consequence 6
(no schema reads a predicate path, now two). `spec/flow-definition.md` v0.55.

## Context

1. **A declared comparison compared a key path against a LITERAL and nothing else** (ADR 0074 rule 1). fyflow-app's pass 6
   checks a file's size against a limit an earlier node worked out — `outcome.result.size lte needs.limit.max` — and that
   took a `Transform` node copying both values side by side, or a registered predicate: either moves a one-line
   comparison out of the grammar a form renders.
2. **The evaluator's arms are `===` and type-guarded orderings** (P45 fact 3): with a right side that resolves at run
   time, `===` alone makes `ne` TRUE against any left scalar where the right is an object, and `eq` TRUE where both sides
   name one object — so *an object is no match* is a guard to write, not one the arms give.
3. **A `needs` path the edge does not declare was ACCEPTED and absent for ever** (P45 fact 5): `ctx.needs` is exactly what
   the edge's `needs` composed, `{}` where it declares none (`FD-C3`), so `needs.limit.max` on an edge declaring no
   `limit` drew no finding and could never be true. 0 of the corpus's 4 `needs` comparisons were undeclared; 4 L1 cases
   constructed one (W221's B′ census).
4. **No reader of a predicate path exists outside the validator's grammar and the evaluator** (P45 fact 6): the wiring
   check reads none, so `valueFrom` has one place to be held — where `path` is.

## Decision

1. **A comparison carries `path`, `op` and EXACTLY ONE of `value` / `valueFrom`.** Both, or neither, is `FD-V42` — widened,
   not a rule beside it: which keys a comparison carries is that rule's question. `PREDICATE_LEAF_KEYS` gains `valueFrom`
   and `PREDICATE_LEAF_REQUIRED` loses `value`. `valueFrom` does not MARK a comparison; `{ valueFrom }` alone marks none.
2. **`valueFrom` is a key path held to `FD-V43`'s every clause under the comparison's own scope** — the grammar, the roots
   (`outcome` / `needs` on a task's or a join's edge, `input` in an `if`), an index on the root, a root alone — by the ONE
   check `path` takes. `FD-V44`'s literal clauses are `value`'s alone; *a length has no prefix* and the `default` clauses
   are asked whichever side a comparison names. **`switch` cases are not given `valueFrom`** ((d1)).
3. **What `valueFrom` resolves to is compared exactly as a literal `value` would be** — read by `readKeyPath` over the
   scope the path is read over, when the comparison is asked; type-strict; a resolved `null` compared as `null`. **A
   resolved object or array is NO MATCH for every operator, `ne` included** (P45 decision 3). The LEFT side is unmoved: an
   object on the left with `ne` against a scalar right stays true, as against a literal.
4. **An ABSENT `valueFrom` is NO MATCH for every operator, and no `default` stands in for it** ((b1)). `default` and
   `length` are the LEFT side's. **So `x gt y` and `x lte y` are both false where `y` is absent** — no pair complements
   over an absent right side, as none did over an absent left side before `default`. No `valueDefault`.
5. **A `needs` path's first key past the root is one THIS EDGE's `needs` declares** ((g1)), on `path` and `valueFrom`
   alike, refused `FD-V43` otherwise — the key read up to its first `[`, the message naming it and the declared keys. Not
   asked where the edge's `needs` is one `FD-V26` refuses. `predicateProblem` takes the declared keys as an optional second
   argument; with none it does not ask.
6. **`definitionSchema()` carries rules 1 and 2** — `valueFrom` with `path`'s pattern and a `oneOf` of the two `required`
   sets — **and not rule 5**, a relation between a path and a sibling key of its edge that a `pattern` cannot state.
7. **ADR 0074 consequence 6 extends**: no schema reads a predicate path, `path` or `valueFrom`; `checkWiring` says nothing
   about either. **`CHECKPOINT_FORMAT` does not move**: a checkpoint carries no definition and no operand, and a resumed run
   re-asks a `valueFrom` over a context composed from the log, as it re-asks a `path`.

## Consequences

1. **A form can render a comparison between two values the run computed**, and pass 6's flow needs no Transform and no
   registered predicate.
2. **A change in what is accepted, both ways.** A document using `valueFrom` is refused `FD-V42` by 0.12.0 and accepted by
   0.13.0; rule 5 refuses a document 0.12.0 accepted — only a comparison that could never be true. Package surface that
   moves: two constants' values, `PredicateLeaf` (a two-member union over a new exported `PredicateLeafBase`, so code
   READING `leaf.value` sees `PredicateScalar | undefined`), `predicateProblem`'s optional argument, and the schema's
   comparison. Intended as 0.13.0, released when the maintainer says so (P45 (e1)).
3. **The negation scope narrows further, and it is stated rather than closed**: over an absent right side no pair of
   operators complements, and there is no key that makes one. A flow that needs `not (x gt y)` where `y` may be absent
   writes both branches explicitly or waits on a `valueDefault` a real flow asks for.
4. **The left/right asymmetry on an object is the price of not moving 0.12.0's left side** — `ne` over an object on the left
   is true, on the right false. A later change making the left match the right is a change in what routes, and is its own
   decision.
5. **A key path past a declared `needs` key is still not checked** — `needs.limit.nope` on an edge declaring `limit` is
   accepted and absent at run time. Rule 5 checks the key the edge composes, not what the referenced node produces; that
   is consequence 6 of ADR 0074, unmoved.

## Alternatives rejected

| | why not |
|---|---|
| **`value: { path }`** ((a2)) | a `value` that is sometimes an object, which `FD-V44`'s *a SCALAR* and every reader of `value` would have to tell apart |
| **A new rule `FD-V50` for exactly-one** | a second rule for a question `FD-V42` already owns — *a comparison missing `value`* was its clause, and both-or-neither is the same question; a new id would split one shape check across two rows and add a corpus case for a sentence that already had a home |
| **`valueDefault` now** ((b2)) | a fifth key for a case no flow has shown; additive later |
| **`valueFrom` on `switch` cases** ((d2)) | a table whose keys are not known at load, so `FD-V41`'s *every case wired* and *one value in two cases* lose their subject |
| **(g2) `needs` unchecked on both sides** | keeps a comparison that can never be true accepted in silence — `FD-V43`'s own class one step in |
| **(g3) `valueFrom` checked and `path` not** | one comparison with two rules for its two sides |
| **An object on the right compared by `===`** | `ne` true against every scalar and `eq` true on one object named twice — a deep-equality semantics by accident, the one ADR 0074 refused on purpose |
