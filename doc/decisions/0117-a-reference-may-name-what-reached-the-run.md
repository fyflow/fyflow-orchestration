---
id: ADR 0117
title: "A reference may name what reached the run"
status: accepted
date: "2026-10-18"
item: W190
raised-by: P38
supersedes: ""
amends: ADR 0040 rules 2 and 5; ADR 0041 in part; ADR 0101 in part
resolves: ""
---

# ADR 0117 — A reference may name what reached the run

**Status:** accepted — [P38](../plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md)
stop-and-asks (a), (b), (d), (f)-(j), (l) and (m), answered *"as recommended"* by the maintainer 2026-10-18 ((a), (b) and
(h) explicitly); written by [W190](../work-items/w190-the-runs-payload-as-a-reference.md). It defines
`spec/flow-definition.md` v0.44 (section 3's reference table, `FD-C1`, `FD-C3`, `FD-V26`'s `$` clauses, `FD-R4`'s
composition, the wiring table's `needs` row). **It amends
[ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rules 2 and 5** — what a node can reach is the run's own outputs AND what the run was handed; the grammar invents a
prefix beside its tokens — **and [ADR 0041](0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)'s
*not derivable* row**: the run's payload is in no record, and it is no derivation either — it is the header — **and, in
part, [ADR 0101](0101-a-transforming-task-is-not-held-at-start.md)**: what an entry task's `needs` composes for
`givenVerdict` is `"."` and `"$payload"`, both the payload (a dated pointer there, 2026-10-19). It resolves no question.

## Context

fyflow-app adopts the `ask` kind as P35 built it — the answer IS the ask's result, one shape (P35 (e)) — and drops its
own merge of input into the answer. P35 (e) rested on *the value that reached the ask stays reachable by naming whatever
produced it*, which is true only where the ask HAS a producer (P38 fact 3): an ask at the ENTRY has none, and a node two
hops after the entry that wants a run-level parameter relies on every node between passing it through. Measured at P38's
declaration on `c43566f`: an entry ask's successor declaring `needs: { invoice: '.', answer: 'approve' }` receives the
answer twice (fact 2); the road that exists is a pass-through task before the ask, at +1 dispatch, +4 clones and +2 log
records per node (fact 3). And the value the app asks for is already RETAINED: the driver takes `structuredClone(payload)`
at `start()` into the checkpoint header and holds it for the life of the run, and a resume restores it (fact 4, `RN-R15`,
`RN-R13`) — so naming it needs no new state. Every `$`-prefixed spelling is refused by every tree before this one
(`FD-V26`), and `$` is outside `FD-V16`'s charset (fact 1): the prefix is free, and collision-free by construction.

## Decision

1. **`"$payload"` is a reference to the value the RUN entered with** — `start(flow, payload)`'s `payload`, as the
   checkpoint header keeps it. It is a ROW of section 3's table beside `"."`, and `referenceTarget` returns it as its own
   form, `{ form: 'payload', node: null, conditional: false }` ((b), (h)).
2. **Legal everywhere the grammar is** ((d), decision 3): a node's `needs` on a `task`, a `map` or an `ask`, and an
   edge's `needs`, the entry included — where, on a task, it equals `"."` and both are accepted. **`FD-V26`'s edge clause
   refusing `"."` does not extend to it**: a predicate has no `ctx.payload`, so naming the run's payload is not
   redundant.
3. **Always there**: no `?` and no array form, and `FD-V27`-`FD-V29` never aim it — it names no node. A reader switches
   on `form`, never on `node === null`, which reads it as `"."` in silence (P38 fact 7): every such reader in the tree
   switches on `form` in this decision's item, in one change.
4. **A copy per key, per read** (decision 4, ADR 0040 rule 6, `JP-R11`): each `"$payload"` key is its own deep copy of
   the header's value, so no node — and no predicate — receives an object another holds, and a caller changing its
   payload object after `start()` changes nothing. Inside a `map` that is one copy per instance, and **nothing warns**
   ((l), Q186's recorded decision applied to a new spelling); one frozen copy shared by every instance is refused, for
   `JP-R11`.
5. **The value the run ENTERS with, handed to the composition explicitly at each door** ((f)): the header's copy in a
   run, the stored header's on a resume, and at `FD-R4` — which runs before the header exists — the caller's own value,
   from which the header's copy is taken once the check has passed, before `onHeader` and the first event. One value at every door, equal by construction.
6. **Nothing new in the log, the header or the fold** (decision 5): `CHECKPOINT_FORMAT` stays 1, `RUN_FOR`, `isFed` and
   `snapshot()` do not move, and a resume derives the same value from the stored header. **The invariant holds**:
   composition is the driver's (ADR 0001 rule 1), and `fold(driver.foldInputs())` reads nothing new. One consequence is
   written down rather than avoided ((m)): an ASK's `asked` element keeps what reached it (`RN-R37`), so a `"$payload"`
   key in an ask's `needs` writes a copy of the payload into the log per ask — which is what that element is for.
7. **The whole `$` prefix is reserved, and its refusals name the fix** ((g)) — `FD-V26` clauses, because they are about
   the grammar: an array form (*there is one: write `"$payload"`*), a `?` suffix (*it is always there*), and any other
   `$` spelling (naming the two references the prefix has). **`"$item"`** — a map instance's item, the prefix's second
   reference — is PARSED by the same function (`{ form: 'item' }`, (h)) and refused by `FD-V26` until P38's W191
   composes it and gives its aim rule, `FD-V49`; until then every reader's `item` arm is unreachable on an accepted
   document.
8. **The wiring check reads an arc composed through a `"$payload"` key `unchecked`** ((i)): the run's payload is a value
   no schema declares, so no `fits` is claimed. `boundaryTargets` composes it from the walk's own payload, so an entry
   `map` reading `over` off a `"$payload"` key is walked over the payload's elements.
9. **`givenVerdict` and `tryTransform(…, { input })` are unchanged** ((j)): the given value IS what the node receives,
   already composed, and composing it is the caller's.
10. **One public TYPE widens, stated BREAKING in 0.8.0** ((h), P38 decision 8): `referenceTarget`'s return gains the two
    variants. `Reference` does not move.

## Consequences

1. **ADR 0040 rule 2 reads, from here**: *what a node can reach is the run's own outputs — a projection of the log,
   computed rather than maintained — and the value the run was handed, which the header already keeps.* Rule 5's *invents
   one token* is history (v0.13 made it two); the grammar now invents `"."`, the `?` modifier and the `$` prefix.
2. **ADR 0041's *the entry node's payload is in no record … no derivation at all*** stays true of the LOG and of what a
   NODE received; what the RUN received is the header's, and an edge names it with `"$payload"`.
3. **The app's case 1 and case 3 need no pass-through task**: an entry ask's successor declares
   `needs: { invoice: '$payload', answer: 'approve' }`, and an edge routes on `needs.run.amount`.
4. **A consumer calling `referenceTarget`** and switching on `form` must name the two new forms; one reading
   `node === null` as `"."` must switch on `form` instead.
5. **ADR 0119 is not needed** for this half; W191's half is ADR 0118.
