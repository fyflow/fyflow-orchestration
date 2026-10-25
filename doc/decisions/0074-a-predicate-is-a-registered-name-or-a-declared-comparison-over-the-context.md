---
id: ADR 0074
title: "A predicate is a registered NAME or a DECLARED comparison over the context"
status: accepted
date: "2026-10-02"
item: W108
raised-by: P26
supersedes: ""
amends: ""
resolves: Q444
---

# ADR 0074 — A predicate is a registered NAME or a DECLARED comparison over the context

**Plan:** [P26](../plans/p26-what-a-flow-can-say-without-code.md)
**Answers:** [Q444](../questions/q444.md)
**Spec:** [spec/flow-definition.md](../../spec/flow-definition.md) v0.27 — section 3's `when`
subsection, `FD-C7`, and `FD-V42`-`FD-V45`

*A dated note, 2026-10-14, P32's record step: **since spec v0.31 a second context reads this
comparison grammar** — the built-in `if` gate's condition, over ONE root, `input`, the value that
reached the gate (spec/flow-definition.md section 3's *The `input` root*, `FD-C8`;
[P32](../plans/p32-what-a-gate-may-decide-without-memory.md) decisions 4 and 6,
[W154](../work-items/w154-the-built-in-if-and-switch.md)). Rule 4's roots, `outcome` and `needs`, are
a task edge's and do not move. **No ADR restates it**: W154's stop-and-ask (k) was answered NO, so
P32 and spec v0.31 are the record and this note is the pointer that answer named.*

*A dated note, 2026-10-25, W221's record step: **rules 1, 4, 6 and 7 and consequence 6 are AMENDED by
[ADR 0140](0140-a-comparison-may-compare-against-another-key-path-and-an-absent-one-is-no-match.md)** (spec v0.55,
[P45](../plans/p45-what-a-comparison-may-compare-against-and-who-may-read-a-key-path.md) (a1), (b1), (g1)). A comparison
carries exactly one of `value` / `valueFrom` — a second key path over the same context, held to rule 4's roots — so rule
1's `{ path, op, value, … }` reads `value` OR `valueFrom`; rule 6 holds on either side, and a resolved object or array on
the right is no match for every operator; rule 7's absent rule holds on either side, and `default` is the left side's
alone; and since v0.55 a `needs` path's first key must be one its edge's `needs` declares (`FD-V43`). The rules below are
unedited.*

## Context

A flow definition is **data** and a predicate is **a name registered in code**
([ADR 0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) rule 1), so a
decision is **half** data: the reference is data and the logic is not. Everything else a flow needs
has been made expressible — node types as a document or a class
([ADR 0054](0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md)), gate
types built-in or a consumer's
([ADR 0066](0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)),
a transform as a declared expression
([ADR 0051](0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)),
schemas as a built-in subset
([ADR 0053](0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)).
**The predicate was the one thing left that is code-only**, and the maintainer's stated reason for
the definition being data is that a different library can build a UI for flow building.

**Four facts decided the shape, and each was measured rather than argued** (W108's declaration step,
on `59e4ad6`):

1. **The existing declared-expression mechanism CANNOT be reused.** `jsonata`'s whole expression
   surface is `assign, ast, errors, evaluate, registerFunction`, its only evaluation entry returns a
   **Promise**, `selectEdge` is a synchronous pure function, and `src/driver/driver.ts` holds **ZERO**
   `async`/`await` in code. An expression cannot be evaluated where a decision is made without
   making routing async, which reaches
   [ADR 0014](0014-the-driver-produces-the-folds-ordered-input-sequence.md)'s ordered fold-input
   sequence. *That is why ADR 0051 put transforms in the worker wrapper, and it is why a subset is
   NECESSARY rather than merely cheaper.* [Q251](../questions/q251.md).
2. **A predicate is not just a path, an operator and a literal.** Ten predicate bodies over eleven
   sites in this tree: three guarded by `typeof`, one with an absent-path **default**, one a
   **negation**, three equalities, one **array length**, one **string prefix** — and the roots are
   `ctx.needs` 5, `ctx.outcome.result` 4, `ctx.outcome.taskId` 1.
3. **`readKeyPath` applies UNCHANGED at this scope.** Captured from a real `DecisionContext`:
   `ctx.outcome` (eleven own keys), `ctx.outcome.result` and the FROZEN `ctx.needs` are all **plain
   objects** — freezing does not change a prototype — so the whole context is addressable by one key
   path and the gate's own resolution reads it with zero change.
4. **A type-strict comparison with an absent-rule reproduces the tree, and the negation is what
   forces the absent-rule.** Over 1800 contexts against the ten bodies verbatim: with *absent is no
   match* alone **EIGHT of ten** agree and the negation agrees on **720 of 1800**; with a declared
   `default` it is **nine of ten**. The tenth is `isHigh`, which agrees on **1710 of 1800** under
   both rules, the 90 being `{score: "9"}` where its unguarded JS body coerces and a type-strict
   form does not — decision 6, and the divergence is in the safe direction.
   *(This row read **nine of ten** and **1800 of 1800** under the headline *reproduces the tree
   EXACTLY*, which contradicted W108's own measurement table two documents away and its own point 3.
   W108's conformity reader (3) re-took all 1800 contexts independently and got the item's figures to
   the number; the ADR's were wrong and the conclusion is unchanged.)*

## Decision

1. **A `when` is an OBJECT and is exactly one of THREE shapes**, told apart by which keys are
   present: a registered name `{ predicate }`; a **comparison** `{ path, op, value, default?,
   length? }`; or a **flat group** `{ all }` or `{ any }` whose members are comparisons. An object
   marking none of them, or more than one, is refused (`FD-V42`).

2. **The bare STRING form is retired and every document moves.** A name is written
   `{ "predicate": "x" }`. This is the maintainer's answer to W108's stop-and-ask (b), taken
   **against the recommendation** and costing a migration of **102 sites in 38 files**; the
   alternative priced was keeping the string, which breaks nothing. *One uniform shape was judged
   worth the break.*

3. **Every refusal is at CONSTRUCTION, with its position**, which is ADR 0002 rule 1's actual
   property — a predicate fails at instantiation rather than at routing time — and `FD-V36`'s
   precedent. `FD-V42` owns the form and the keys, `FD-V43` the key path, `FD-V44` the operator and
   the literal, `FD-V45` a group's members; **`FD-V4` keeps its id and its sentence** and only the
   spelling of a name moved.

4. **The path is a key path over the `DecisionContext` itself, read by `readKeyPath`, and its first
   segment is `outcome` or `needs`.** No separate `root` key: the measurement above says the
   resolution is free, and the first-segment refusal is the same clause either way. A root alone is
   refused, and any other first segment is refused **because it would resolve to nothing in
   silence** — a wrong key rather than a question, which is [Q391](../questions/q391.md)'s class.

5. **The operator enumeration is CLOSED at seven and one outside it is refused BY NAME** — ADR 0053's
   shape. `eq`, `ne`, `lt`, `lte`, `gt`, `gte`, `startsWith`. **A predicate that COMPUTES — a regular
   expression, a date window, a lookup, a negated prefix — stays a registered name**, and that
   boundary is this sentence rather than a surprise.

6. **A comparison between kinds is NO MATCH and never a coercion.** Type-strict, measured: it
   reproduces all three `typeof`-guarded bodies exactly and differs from one unguarded body on a
   string where JS coerces — `FD-V30`'s own argument one rule over.

7. **An absent path is NO MATCH, and a comparison may declare a `default`** substituted in its place
   before `length` is taken — **and a path resolving to `null` takes it too**, so the substitution is
   exactly what `??` does; where no `default` is declared a resolved `null` is compared as the scalar
   it is, so `eq null` holds. **This is what makes the comparisons closed under negation OVER THE
   VALUES THEY CAN COMPARE**, and that is why it is in the grammar rather than left out as a
   convenience: without it both `x > t` and `x <= t` are false for an absent path, so no pair of
   operators complements. **The scope is part of the rule** — `eq`/`ne` complement over everything,
   the four ordering operators over numbers and over an absent path with a `default`, and over a
   value they cannot compare both are false.
   *(Both halves are W108's readers', and they are the pair's only shared SUBJECT. The nullish half
   was found from opposite ends — by mutation and by a no-mutation measurement — and the scope half
   by re-deriving the closure claim over every value kind. Until then this decision said `default`
   made the comparisons *closed* flatly and that it *is* `?? 0`, and the substitution fired on
   `undefined` alone, so the one shape the key exists for — `!((r?.score ?? 0) > 0.5)` — was not
   reproduced on a key holding `null`.)*

8. **A group is FLAT and its members are COMPARISONS.** Nesting is refused by name, and so is a
   member naming a registered predicate — **because a group holding a function could be impure**,
   which would falsify rule 9.

9. **A DECLARED predicate CANNOT be impure**, and that is by construction rather than by unbinding.
   W62 had to unbind `$now`, `$millis`, `$random`, `$shuffle` and `$eval` BY NAME; this subset simply
   has none of them, and no way to name anything but its own argument. **Strictly stronger than
   [Q9](../questions/q9.md)'s measured result for a function**, where evaluating twice caught one
   impurity shape of four and was flaky on `Math.random()`.

## Alternatives, each priced

| | why not |
|---|---|
| **A declared JSONata expression, as `transform` is** | fact 1: there is no synchronous evaluation entry, and making routing async reaches ADR 0014. It would also drag a 242 KB engine into every consumer, which `S14` / `RT-R12` refuses by the bare specifier alone |
| **A prefix form, `{ "lt": [path, value] }`** | the key IS the operator, so a typo'd `ltt` reads as an undeclared key rather than an unknown operator — a worse message on the most likely authoring error — and a leaf and a group become the same shape, which a closed-key refusal cannot discriminate. The three declared-object precedents here (`retryPolicy`, `transform`, a gate type) are all named-key objects with a closed key set |
| **Keeping the bare string beside the object** | nothing breaks. Refused by the maintainer for one uniform shape; the cost is recorded in decision 2 rather than hidden |
| **A `not` combinator** | it opens the nesting a flat group refuses, and the six comparisons are closed under negation once `default` exists. A negated `startsWith` is the one case it would buy, and that stays a registered name |
| **Objects and arrays as `value`** | a deep-equality semantics with no instance in this tree and no obvious right answer for `NaN`, key order or a prototype |
| **Absent as a value ordered below everything** | total with no extra key, and surprising where it bites: `score lt 50` would be TRUE for a node that returned no score at all, which is `FD-R2`'s class |
| **A wiring verdict over a predicate's key path**, as W100 built for a gate | measured out on ONE root: `outcome.result` is a producer's `outputSchema` and `needs.*` is describable by machinery `wiring.ts` already has (`composed()` builds `FD-C1`'s table over one arrival), but **`outcome.taskId` and the other nine of `ctx.outcome`'s eleven own keys are the DRIVER's and no schema describes any of them**. One root of three is enough to keep the verdict out of this version, and it is the second most-read root in the tree. *(This cell read *the walk's premise is false for 2 of the 3 roots*, which is false of `needs` — W108's conformity reader, 4.)* |

## Consequences

1. **A flow a UI can emit now covers sequence, decision, fan-out, join and selection with no code
   but domain workers.** Whether that is *complete* is [P26](../plans/p26-what-a-flow-can-say-without-code.md)
   prediction 3 and [W110](../work-items/w110-a-flow-a-ui-could-have-emitted.md)'s to answer.

2. **Every existing document breaks, and the package moves at W110's close**, not here — W84/W85/W86
   and W92/W93/W94's precedent, where the breaking shape ships across a plan's items and the manifest
   moves once. *(This cell ended *with `README.md` naming every break*, and that was already false
   when it was written: [ADR 0073](0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
   deleted README's three break blockquotes four items earlier, and W110 measured the word *break* at
   **zero occurrences** in that file. The claim was standing in **SEVENTEEN** places, of which EIGHT
   were present-tense claims about what that file holds (four in `CLAUDE.md`, three in `doc/README.md`
   and this cell) and NINE are records of what a past item DELIVERED, on trees where README did name
   those breaks (P18, P22 twice, W67, W86 twice, W90, W94 twice). **This cell is the one that
   mattered**, because it was an instruction to the item that had to act on it. *(W110 first recorded
   the total as nine and then as twelve; seventeen is what the union of three phrasings finds once
   newlines are collapsed — two of the nine WRAP across lines and a single-line regex cannot see
   them. Its own Record carries the correction and the mechanism.)* **The maintainer's answer to W110's
   stop-and-ask (a) is that the breaks are named in the ADRs and in that item's Record**, on ADR
   0073's own ground: README has one audience and carries no correction archaeology, and nothing is
   published. Section 21 of `AGENTS.md` is where a consumer meets the new shape.)*

3. **The subset will be asked to grow, and the refusal is the deliverable as much as the subset is.**
   An operator outside the seven is refused by name with the enumeration in the message, so the
   pressure arrives as a refusal a person reads rather than as a silently-accepted key.

4. **Output (4)'s *strictly stronger than Q9* is a property of the SOURCE, and no rung reads the
   source.** A declared predicate cannot be impure *by construction* — the subset has no clock, no
   random source and no way to name anything but the context — and that argument is sound and
   visible in a forty-line function. What is NOT true is that a rung would catch an evaluator that
   became impure: W108's adequacy reader (10) measured an `evalLeaf` reading `Date.now()`,
   `Math.random()`, a module-level cell and the predicate registry passing **every rung at exit 0**,
   while one whose state actually MOVES an answer is caught in one failure. So the guarantee is as
   strong as the code and the claim about it is as strong as Q9's, until something reads the source.
   [Q450](../questions/q450.md).

5. **Nothing in this tree exercised `all` or `any` at v0.27.** Not one of the ten bodies is a
   conjunction of two paths — the three that look like one collapse to a single leaf under rule 6 — so
   the group cases were **CONSTRUCTED** rather than found, and `ne` and `gte` had no instance either
   and existed for rule 7's closure. Said here rather than left looking covered.

   > **`all`, `any` and `gte` have their first real instances since
   > [W110](../work-items/w110-a-flow-a-ui-could-have-emitted.md)** — P26's exit artifact, on real
   > workers in both L6 runtimes, and each member of each group decides a payload no other row covers
   > (`weak` one way, `n gte 2` at ONE item, and `any`'s two members the other two). **What still has
   > no L6 instance is `ne`, `lt` on a declared path, `lte`, `startsWith`, `length` and `default`** —
   > `lt` occurs once, on `remediate`'s own edge. Named rather than left looking covered, which is
   > what this consequence is for; W110's conformity reader (11) found it standing four cells under
   > consequence 2, which that item corrected in the same pass. *An item corrects a count where it is
   > looking and not where it is not.*

6. **A declared predicate's path is not checked against any schema.** `checkWiring` says nothing
   about it, so a path naming a key the producer cannot emit is accepted and answers *no match* for
   ever — the shape [Q391](../questions/q391.md) named for a gate, now reachable from a decision.
   The grammar catches a wrong ROOT and nothing catches a wrong LEAF.
