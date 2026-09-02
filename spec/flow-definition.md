# spec/flow-definition — the flow definition format

**Status:** v0.7 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md). **v0.2** acted on the first spec-conformity pass
(ADR 0004, and `region(F)` made computable). **v0.3** acted on the second, which found that `FD-V19`
had reintroduced the v0.1 defect class under a new id — a refusal rule rejecting the valid corpus.
**v0.4** acted on the third, which found the opposite failure: a document this section could not
refuse at all. **v0.5** acted on W3's pass, which found `FD-R1` prescribing a test that cannot be constructed.
**v0.6** points `FD-R1` at `OR-R10`: *"terminates the run"* is a thing the driver does, not a throw
from a listener, which is discarded.
**v0.7 retires `FD-V15` and defines which region a node is in when it is in two**
([W20](../doc/work-items/w20-what-a-nested-region-is.md) under
[P7](../doc/plans/p7-is-a-join-transitive-over-nested-fan-out.md)): nested fan-out is expressible,
and *"a non-`end` node is in at most one region"* stops being true. **Measured before the rule was
written**: with `FD-V15` set aside, the nested example produced **no other finding** — `FD-V13`,
`FD-V19` and `FD-V22` all accept it, so this is a lift rather than a redesign.
**Binds:** [ADR 0002](../doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
(the graph is data; a predicate is a name; an unknown name fails at instantiation) and
[ADR 0004](../doc/decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
(routing is opt-in per terminal state; `user_action` suspends).

A flow definition is inert JSON. It contains no functions, no regular expressions and no class
instances — anything that does not survive `JSON.parse(JSON.stringify(x))` is not a definition
(ADR 0002 rule 1).

---

## 1. The document

```json
{
  "flowId": "score-and-publish",
  "version": 1,
  "entry": "ingest",
  "nodes": [ ... ]
}
```

| Key | Type | |
|---|---|---|
| `flowId` | string | matches `^[A-Za-z0-9_-]{1,64}$` (`FD-V16`) |
| `version` | integer >= 1 | author-managed. The driver does not interpret it |
| `entry` | string | a node id (`FD-V3`) |
| `nodes` | array | one object per node, order irrelevant |

## 2. Node kinds

Four. There is **no `decision` node kind** — a decision is a property of an edge, which is
ADR 0002 rule 2 taken literally (`when: "isLowConfidence"`).

| kind | keys | |
|---|---|---|
| `task` | `id`, `kind`, `workerType`, `edges`, **`optional?`** | binds to a scheduler worker pool. Dispatched as one scheduler task |
| `fanout` | `id`, `kind`, `branches` | opens a region. Dispatches nothing itself |
| `join` | `id`, `kind`, `of`, `edges` | closes the region opened by the `fanout` named in `of`. Dispatches nothing itself |
| `end` | `id`, `kind`, `outcome` | terminates one path. No edges |

**Only a `task` node is ever dispatched**, and therefore only a `task` node has a task id
([spec/task-id.md](task-id.md)), produces an outcome record, or can suspend. `fanout`, `join` and
`end` are structural: a run passes through them within a single driver turn. **This is why `end`
nodes are exempt from `FD-V13`, `FD-V19` and `FD-V22`** — sharing one between two paths creates no
ambiguity about anything, because nothing about it is per-path.

A `join`'s single edge carries neither `when` nor `on` (`FD-V7`): a predicate's
`DecisionContext.outcome` would have nothing to hold.

`end.outcome` is a non-empty author-defined string. **The driver does not interpret it** — the
run-level outcome vocabulary is run state's, not the definition's ([Q25](../doc/open-questions.md)).

### `optional`

`optional` is a boolean, default `false`, passed through to the scheduler task
(`AGENTS.md` section 5). It is the authoring-level form of ADR 0004 rule 7:

> **`optional: true` means the flow handles this node's failure. The default means a human does.**

That is not a convention laid over the library — it is the library's own branch. A task that fails
with no retries left reaches `state = 'failed'` **only** inside `if (task.optional)`
(`../fyflow-scheduler/core/FyflowScheduler.ts:894-897`, and again at `:1130-1133`); otherwise it
reaches `user_action` and **suspends** (ADR 0004 rule 3).

**Both kinds of node can route through an `on: ["failed"]` edge, by different roads**, and this is
the correction the second conformity pass forced:

| node | how it reaches `failed` | |
|---|---|---|
| `optional: true` | the task settles `failed` | the flow was told to handle it |
| default | it suspends, and a resolution arrives with `resolvedAs: "failed"` | **a human gave up on it**, which is a case an author will want to route |

So `optional` decides *who* decides, not *whether an `on: ["failed"]` edge is reachable*. An earlier
version of this document said `optional: true` was the only way such an edge could fire; that was
exactly inverted for the resolution road, which only non-optional nodes can take.

## 3. Edges, decisions, and which outcomes route

```json
{ "id": "score", "kind": "task", "workerType": "ScoreWorker", "optional": true, "edges": [
    { "on": ["failed"], "to": "quarantine" },
    { "when": "isLowConfidence", "to": "review" },
    { "to": "publish" }
] }
```

| Edge key | | |
|---|---|---|
| `to` | required | a node id |
| `on` | optional, default `["done"]` | the terminal states this edge is eligible for. Values: `"done"`, `"failed"` (`FD-V18`) |
| `when` | optional | a predicate name. An edge without one is the default for its eligible states |

**Routing, in order:**

1. A node's **effective outcome** ([spec/outcome-record.md](outcome-record.md) section 7) supplies a
   `terminalState`, which selects the **eligible** edges — those whose `on` contains it (ADR 0004
   rules 1-2). Eligibility is checked before anything else.
2. Among the eligible edges, **in declaration order**, the first whose `when` predicate returns true
   is taken. Later edges are not evaluated. An edge with no `when` always passes.
3. `when` is resolved against the predicate registry at instantiation, never at routing time
   (ADR 0002 rule 3). An unknown name is an instantiation error (`FD-V4`).
4. A predicate receives a single `DecisionContext` argument and returns a boolean. **P1 populates
   exactly one field, `outcome`, and it is always the node's effective outcome** — one shape, whether
   the node settled or was resolved. Whether the context also carries accumulated run state is
   [Q8](../doc/open-questions.md); adding a field later is additive rather than a signature change.
5. A predicate is pure (ADR 0002 rule 4). Purity is not enforced by this document;
   [Q9](../doc/open-questions.md) is about the mechanism.

**Rule 4's *"always the effective outcome"* is what closes a hole the second pass found.** A resumed
node has two records in the log — the `user_action` settlement and the resolution — and neither is
the right thing to hand a predicate: the first cannot see the human's answer, the second has no
`terminalState` at all. A predicate written `ctx.outcome.terminalState === "done"` must mean one
thing, so the fold derives one record and routing never sees the pair.

**A `user_action` settlement routes nowhere.** It **suspends** the path (ADR 0004 rule 3), and `on`
may not name it (`FD-V18`, [Q30](../doc/open-questions.md)). The path resumes when a resolution
record is appended ([spec/outcome-record.md](outcome-record.md) section 5).

**A settlement with no eligible edge ends that path.** This is the case an author creates by not
writing an `on: ["failed"]` edge, and it is not an error. Inside a fan-out region it is
`branch.lost` ([spec/join-policy.md](join-policy.md) section 2); outside one it ends the path with
no `end` node reached. ADR 0004's *Consequences* argues why this is not the silent stop that Q10
refused — it is declared by omission, an outcome record in the log says exactly what happened, and
the path's end has a node to point at.

### Q10 — what happens when no decision edge matches

**Answered here: it cannot happen, and if it happens the run fails loudly.** Two rules at two
different times:

- **`FD-V7`, at instantiation.** For every terminal state any of a node's edges opts into, one of
  the eligible edges has no `when` and is last among them. A definition without that default is
  rejected before any task is queued, mirroring `addTasks` validating a whole batch up front
  (`AGENTS.md` section 5).
- **`FD-R1`, at routing time.** If the driver ever reaches a node where eligible edges exist and
  none evaluates true, the run terminates with a named error naming the run and the node. `FD-V7`
  makes this unreachable; `FD-R1` is the assertion that `FD-V7` held.

**No eligible edge at all is a different thing from no matching edge**, and only the second is
`FD-R1`. The first is the declared path-end above.

**Why not the third candidate — "the node is terminal for that branch".** It is the answer that
makes a flow stop halfway with no error, and under a fan-out it produces a join that never fires
with nothing queued and nothing running. **That is character-for-character the signature P1 exists
to attribute to a join policy** (`doc/plans/p1-what-satisfies-a-join.md`, *Why this plan*). An
experiment whose observation has a second possible cause has not run, so a silent stop is refused
on the plan's own validity grounds rather than on taste.

## 4. Fan-out, join, and the region between them

```json
{ "id": "split",   "kind": "fanout", "branches": ["scoreA", "scoreB"] },
{ "id": "collect", "kind": "join",   "of": "split", "edges": [ { "to": "publish" } ] }
```

**The pairing is declared once, on the join.** A `fanout` does not name its join; the join names its
fanout. One direction cannot disagree with itself.

> **"Edge" means two things in this document and the difference matters in section 5.** An *edge* is
> an entry in a node's `edges` array. A `fanout` has no `edges` (`FD-V9`); its arcs to its branch
> entries are `branches[]`. Where a rule says *"has an edge to X"* it means either — any arc in the
> graph, as `reaches` follows them — and where it says *"an edge object"* it means only the first.

### The four sets, stated so a validator can compute them

For a fanout `F` with join `J` and branch entries `b₁ … bₙ`:

| | |
|---|---|
| **`reaches(X)`** | nodes reachable from `X` by following `edges[].to` and, for a `fanout`, `branches[]`. **Irreflexive** — `X ∈ reaches(X)` only if a path returns to `X`, and `FD-V10` forbids cycles, so it never does |
| **`branchOf(F, bᵢ)`** | `{bᵢ}` together with everything reachable from `bᵢ` with **every path cut at `J`** — traversal stops on arrival at `J`, and `J` is not a member |
| **`region(F)`** | the union of `branchOf(F, bᵢ)` over every branch entry. **`J` is not a member** |
| **`after(F)`** | `reaches(J)`. `J` is not a member of that either |

> **Three properties are stated because they are not free, and getting any of them wrong rejects the
> valid corpus.** `J` is in neither `region(F)` nor `after(F)`; both relations are irreflexive; and
> **`branchOf` is cut at `J` while `reaches` is not**. A breadth-first search that stops at `J` still
> usually *marks* `J` visited, and stock reachability usually includes its source.
>
> **This warning has been earned twice.** At v0.1 `FD-V13` was written against an uncut, reflexive
> reading and rejected two of the valid examples. At v0.2 `FD-V19` was written against `reaches`
> instead of `branchOf` — so every fan-out whose branches both lead to the join had "overlapping
> reach", and it rejected **three** valid examples including P1's own case. Same defect, new id, one
> version apart. If a fourth region rule is ever added, check it against
> `spec/examples/valid/` before writing it down.

### Which region a node is in, when it is in two — v0.7

**Before nesting, this question had a trivial answer and a comment in `src/driver/driver.ts` said
so**: a non-`end` node was in at most one region, because `FD-V19` and `FD-V22` keep a node out of
two branches of the same region and `FD-V15` kept regions from containing one another. **Retiring
`FD-V15` makes that false for non-`end` nodes**, and a lookup that answered it by taking the first
match was answering it by **node-declaration order**.

For a node `n`, let `containing(n) = { F : n ∈ region(F) }`.

| | |
|---|---|
| **`F` is inside `G`** | `F ≠ G` and `F ∈ region(G)`. The fanout node itself is the witness, and `region` is already transitive, so no new data is needed to compute it |
| **`innermost(n)`** | the `F ∈ containing(n)` that is inside every other member of `containing(n)`. **Undefined when there is no such `F`** — which is `containing(n)` being empty, and one case more |

**`FD-V22` is what makes `innermost(n)` unique, and it does so only for a NON-`end` node.** Any path
entering `region(G)` must enter through `G` itself, so a node in two regions has one of their
fanouts inside the other, and the two candidates are nested rather than merely overlapping.

**`end` nodes are exempt from `FD-V22`** (section 2), and the exemption is load-bearing here rather
than incidental: **one `end` node may be shared by two SIBLING regions**, nested in neither. Two
sequential fan-outs sharing one `end` is such a flow, it is [Q45](../doc/open-questions.md)'s shape,
and this document accepts it. **`innermost(n)` is undefined for that node, and `branchIndexOf`
returns `null`.**

> **This paragraph said `FD-V19` and `FD-V22` made it unique, full stop, and that was false.** W20's
> conformity reader measured what the first draft cost: a resolver that fell through to the first
> candidate answered `f1` or `f2` for the same graph depending on which `fanout` was declared first —
> **the exact defect this subsection was written to remove, surviving in the one case the rule
> claimed was unreachable.** `FD-V19` is what makes a node's *branch index* unique within a region,
> not its region; `FD-V22` is what makes the region unique, and only where it applies.
>
> **Saying *undefined* is the only order-independent answer.** Section 1 of
> [spec/task-id.md](task-id.md) makes `branchPath` *a property of the node*; a node in two unrelated
> regions has no such property, and picking one of them invents it. **No driver asks**: the `end`
> arm attributes a branch by the region it was OPENED in rather than by membership, which is why
> nothing observable depends on this today.

**Three properties, stated because a resolver that gets any of them wrong passes the depth-1 corpus
unchanged.**

1. **It does not depend on the order nodes are declared in — for every node, including the ones
   with no answer.** This is the whole point of the rule, and *"there isn't one"* is an answer that
   satisfies it where *"the first one"* does not.
   The same graph written with the inner `fanout` first must give the same answer — measured before
   the rule was written, the old lookup gave `outer`/branch 1 in one order and `inner`/branch 0 in
   the other, **for the same flow**.
2. **`innermost(n)` for a node in exactly one region is that region.** The depth-1 corpus must be
   unchanged, and this is the clause that says so.
3. **A join node is in no region of its own fanout** (`J ∉ region(F)`, above), so an inner join is in
   the *outer* region and nothing else — which is what makes an inner join's own `branchPath` an
   outer one.

**`branchIndexOf` answers the same question one level down** — *which branch of which region* — and
carries the same obligation. At depth 2 the honest answer to *"which branch is this node in"* is a
**path** rather than an index, and that is [spec/task-id.md](task-id.md)'s vocabulary rather than
this document's; the rule here is only that the index it returns is the **innermost** region's and
not whichever region was declared first.

`region(F)` is computed at instantiation and is what a join policy is given
([spec/join-policy.md](join-policy.md) section 1). Region membership must be *computable*, which is
why the pairing is declared rather than inferred: without it there is no statement of what a branch
was supposed to arrive at, and **"routed away from the join" is not even well defined.**

**The definition declares structure and never a count.** There is no `waitFor: 2` anywhere in this
document. A count is derivable from `branches.length`, and one policy derives it — but writing it
into the format would make arrival-counting the format's answer to
[Q4](../doc/open-questions.md) before W4 has run.

### What the region rules are each protecting

Three refusals, three different failures. Stated together because each was written in isolation and
two of them were wrong.

| rule | forbids | because |
|---|---|---|
| **FD-V13** | a non-`end` node in **both** `region(F)` and `after(F)` | a branch re-entering the path the join feeds — it would run downstream work before the join fired |
| **FD-V19** | a non-`end` node in **two branches'** `branchOf` sets | a shared node's branch index is a property of the traversal rather than of the node, so `branchPath` stops being derivable ([spec/task-id.md](task-id.md) section 1) |
| **FD-V22** | an edge **into** a non-`end` node of `region(F)` from outside it | a token arriving in a branch that was never opened, and later at a join that never counted it — which `JP-R5` gives no policy a way to account for |

**`FD-V22` is what makes `ID-R1`'s soundness argument true.** Without it a node in a region can be
entered from outside, and on that route it has no enclosing branch index at all — so the
`(nodeId, branchPath, attempt)` triple that `spec/task-id.md` section 3 claims is unique per run is
not even well defined.

### Can this format express the branch-routed-away case at all

Yes, and it is the constraint that shaped this section.
`spec/examples/valid/p1-routed-away.flow.json` is the flow: `split` fans out to `scoreA` and
`scoreB`; `scoreB` carries a decision whose first edge goes to an `end` node instead of the join;
`collect` waits.

**Three things had to be true for it to be authorable, and each is a design choice rather than an
accident:**

1. The fan-out/join pairing is declared, so the branch has a join it is *failing to reach*.
2. A branch may reach an `end` node. Nothing forbids it — see `FD-V14` below.
3. `end` is a node kind. If a terminal path were expressed as *a node with no outgoing edge*, then
   "the branch legitimately ended here" and "the author forgot an edge" would be the same document,
   and `FD-V7` could not tell them apart.

### FD-V14 — the rule that is deliberately absent

> **There is no rule requiring that every path from a fan-out branch reaches the join.**

That is the first well-formedness rule anyone writes for a fan-out region, it reads as obviously
correct, and **it makes P1's case invalid input.** In `p1-routed-away.flow.json`, `scoreB` has a path
to `collect` — its default edge — *and* a path to `abandoned`. So the rule that would forbid the case
is the **all-paths** form, not the *can-reach* form:

| candidate rule | verdict on `p1-routed-away` | |
|---|---|---|
| every path from a branch entry reaches `J` | **rejects it** | this is `FD-V14`, and it is absent |
| a branch entry *can* reach `J` | accepts it | true of `scoreB`, so this form forbids nothing P1 needs — and stating `FD-V14` this way is a wording error that would let a future reader re-add the all-paths rule believing it had been considered |

The weaker property that *is* true — every path from a branch entry terminates at an `end`, whether
or not it passes through the join — is **derived, not asserted**: `FD-V10` forbids cycles, `FD-V7`
and `FD-V8` mean `end` is the only kind of node without an outgoing edge, and `FD-V9` guarantees a
`fanout` has successors. Nothing else is possible, so there is no rule to state and no example that
could violate one.

## 5. Validation refusals

Checked at instantiation, in full, before any task is queued (ADR 0002 rule 3). Every rule has one
hand-written case in `spec/examples/invalid/`, named by its rule id; `scripts/check-spec.mjs` check
C4 fails if one is missing.

| id | The definition is rejected when |
|---|---|
| `FD-V1` | two nodes share an `id` |
| `FD-V2` | an edge's `to`, a `join`'s `of`, or a `fanout`'s `branches` entry names a node that does not exist |
| `FD-V3` | `entry` names a node that does not exist, or names a `join` or an `end` |
| `FD-V4` | an edge's `when` names a predicate absent from the registry |
| `FD-V5` | a `task`'s `workerType` is not a key in the scheduler's `workerPools` |
| `FD-V6` | a `join`'s `of` does not name a `fanout`, or a `fanout` has zero or more than one `join` naming it |
| `FD-V7` | a `task` node has no `edges`; or no edge of a `task` node is eligible for `done`; or, for some terminal state any of its edges opts into, the eligible edges for that state contain no edge lacking `when`, contain more than one, or the one lacking `when` is not last among them. **A `join` node** is rejected unless it has exactly one edge, carrying neither `when` nor `on` |
| `FD-V8` | an `end` node has `edges`, or its `outcome` is absent or empty |
| `FD-V9` | a `fanout` has fewer than two `branches`, has a repeated branch entry, has `edges`, or names a branch entry whose kind is not `task` |
| `FD-V10` | the graph contains a cycle |
| `FD-V11` | a node is not reachable from `entry` |
| `FD-V12` | a `fanout`'s branch entry is its own `join` |
| `FD-V13` | a node whose kind is not `end` is in **both** `region(F)` and `after(F)` — a branch re-entering the path the join feeds |
| `FD-V14` | **deliberately absent.** The id is held so the gap is not read as a lost rule — see section 4 |
| `FD-V15` | **Nothing. Retired at v0.7, and the id is now deliberately absent** — a held id with no rule behind it, so a gap in the sequence is not read as a rule someone lost. It refused a `fanout` inside another fanout's region; nested fan-out is expressible since [W20](../doc/work-items/w20-what-a-nested-region-is.md), and the id is **retired rather than reused**. Whether a *policy* can serve a nested region is a different question with a different home — `spec/join-policy.md`, because `validateDefinition` is not given the policy |
| `FD-V16` | `flowId` or any node `id` does not match `^[A-Za-z0-9_-]{1,64}$` — the charset is [spec/task-id.md](task-id.md)'s, and this is where it is enforced |
| `FD-V17` | a node object, **an edge object**, or the document carries a key its kind does not declare |
| `FD-V18` | an edge's `on` is present and is not a non-empty array of distinct values drawn from `"done"` and `"failed"`. **`"user_action"` is refused** — it suspends rather than routes (ADR 0004 rule 3, [Q30](../doc/open-questions.md)) |
| `FD-V19` | a node whose kind is not `end` belongs to `branchOf(F, bᵢ)` for **two distinct** branch entries of the same `fanout`. Convergent branches make `branchPath` a property of the traversal rather than of the node, and P1 refuses them ([Q27](../doc/open-questions.md)) |
| `FD-V20` | a node outside `region(F)` has an edge to `F`'s join |
| `FD-V21` | a declared key holds a value of the wrong type **or outside its declared range** — `optional` not a boolean, `edges` not an array, `outcome` not a string, `version` not an integer or below 1, and so on |
| `FD-V22` | a node in `region(F)` whose kind is not `end` has an incoming edge from a node that is neither in `region(F)` nor `F` itself. **The only way into a region is through its fanout** |
| `FD-V23` | a **required key is absent** — a node without `id` or `kind`; a `task` without `workerType` or `edges`; a `fanout` without `branches`; a `join` without `of` or `edges`; an `end` without `outcome`; an edge without `to`; or the document without `flowId`, `version`, `entry` or `nodes`. **`version` is required**, matching section 1 — an omitted version is one that silently means nothing |
| `FD-V24` | a node's `kind` is not one of `task`, `fanout`, `join`, `end`. **`kind: "decision"` is the case this exists for** — section 2 warns the author away from that word, and until v0.4 nothing rejected it |

**`FD-V19`'s second clause is derived rather than stated.** *"One branch entry is reachable from
another"* needs no rule of its own: `FD-V9` requires every branch entry to be a `task`, and a branch
entry always belongs to its own `branchOf` set, so a branch entry inside another's set is already a
non-`end` node in two sets.

**`FD-V24` closes the hole the other three left open, and the hole was shaped like a rule.** An
unrecognised `kind` slips past all of them by construction: `FD-V23` fires on an *absent* key and
`kind` is present; `FD-V21` fires on the wrong *type* and `"decision"` is a string; and `FD-V17`
compares a node's keys against **the key set its kind declares**, which for an unknown kind does not
exist — the rule is not evaluable rather than satisfied. So a definition naming a node kind this
document explicitly refuses to have (`kind: "decision"`, section 2) was accepted by every rule, and
the driver would have met it at run time with nothing to cite.

**It was also invisible to the corpus check that verified everything else.** The throwaway validator
W1 used to prove the v0.3 corpus mapped an unknown kind onto `FD-V21` — because its author believed
that is what `FD-V21` meant. The rules and the checker shared one misreading and agreed perfectly,
which is `doc/workflow.md` section 5's opening diagram with the spec in place of the code. The third
conformity pass wrote its validator from the rule text instead, and accepted the document.

**`FD-V17` is not pedantry, and it is why it names edges.** A misspelled `when` becomes an edge with
no condition, which `FD-V7` then reads as a second default — or, if it is the only edge, as a valid
unconditional hop that silently routes every workload down one branch. A misspelled `on` is worse
under ADR 0004: the edge silently reverts to `["done"]` and the failure path the author thought they
wrote does not exist. Unknown keys are how a decision disappears without a diagnostic, and edge
objects are where the keys that matter live.

**An invalid example is named for the rule it exists to exercise, and may violate others as well** —
several of these rules are entangled by construction, and contorting a case to violate exactly one
would make it stop resembling a mistake an author would actually make. A validator MUST reject the
file and MUST report the named rule among its findings.

**`FD-V13`, `FD-V19` and `FD-V22` are restrictions this repo may lift, and `FD-V15` is the one it
has.** `FD-V13` bounds P1's join/failure matrix by keeping a routed-away branch from continuing to
live outside the region ([Q23](../doc/open-questions.md)); `FD-V19` and `FD-V22` are
[Q27](../doc/open-questions.md). All were stated as refusals rather than left undefined so that
lifting one is a spec change with a rationale (`spec/README.md` rule 1) rather than a discovery —
**and `FD-V15`'s lift is what that sentence was written for**, four versions before it happened.

**`FD-V19` and `FD-V22` are load-bearing FOR nesting rather than obstacles to it**, which is worth
saying because they sit in the same family and a reader lifting one will reach for the others. They
are what keep an inner region wholly inside **one** outer branch: without `FD-V19` an inner fan-out
could straddle two outer branches and its nodes would have no derivable `branchPath`, and without
`FD-V22` a node inside a nested region could be entered from outside it with no enclosing branch
index at all. **Retiring `FD-V15` narrows the set of liftable rules from four to three and makes the
remaining two harder to lift, not easier.**

## 6. Runtime refusals

Not expressible as an invalid example, so each names the test that must exist. That coverage is the
owning item's gate, **not W1's L0**.

| id | The run terminates when | Test owed by |
|---|---|---|
| `FD-R1` | routing reaches a node, eligible edges exist for the settled terminal state, and none evaluates true. The failure names the run id and the node id and is **reported** rather than thrown out of a listener (`OR-R10`). **Unreachable through a valid definition**, and that is `FD-V7` working rather than a gap — see below. Test: assert against the routing function directly, with a node whose eligible edges are all guarded and a registry whose predicates all return false; **and a companion test that the reachable neighbour is not this rule** — no eligible edge at all is a declared path end (section 3) | W3 |

### FD-R1's test, corrected

**v0.4 and earlier prescribed a test that cannot be built**: *"a registry whose predicates all
return false against a definition that passed `FD-V7`"*. `FD-V7` guarantees a **bare** last edge for
every state any edge opts into, and a bare edge has no predicate to return false — so no definition
that passed `FD-V7` can reach `FD-R1` through the driver, whatever the registry says.

That is the rule working, not a hole. But an impossible prescribed test is a spec defect, and
`spec/README.md` rule 2 asks for the conflict to be **reported** rather than annotated in code.
W3 hit it, tested the routing function directly, and left the reasoning in a comment; this is that
finding written down where the rule lives.

**The corrected shape has two halves, and the second is the one that was missing:** assert `FD-R1`
against the pure routing function, *and* assert that the reachable neighbour is a different thing.
*No eligible edge at all* is a declared path end (section 3) and *no matching edge among eligible
ones* is `FD-R1`; a test for the first alone reads like coverage of the second.

## 7. Examples

`spec/examples/valid/` — validated by ladder L4, owned by **W3**
([doc/plans/p1](../doc/plans/p1-what-satisfies-a-join.md)): ADR 0002 rule 3 puts validation at
instantiation, and instantiation is a driver action. Hand-written, never generated
(`spec/README.md` rule 5).

| file | shows |
|---|---|
| `linear.flow.json` | sequence only |
| `decision.flow.json` | a decision with its mandatory default |
| `fanout-join.flow.json` | a fan-out where both branches reach the join |
| `p1-routed-away.flow.json` | **P1's case** — a decision inside a branch that leaves for an `end` |
| `failure-edge.flow.json` | `optional: true` with an `on: ["failed"]` edge, outside any region |
| `fanout-failure.flow.json` | **ADR 0004 inside a region** — one optional branch with a failure edge, one non-optional branch that can suspend. The shapes `branch.lost` and `branch.suspended` are defined against |

**`spec/examples/registry.json` is the registry L4 validates against**, and it is part of the
corpus rather than a fixture W3 invents: `FD-V4` and `FD-V5` are refusals *about a registry*, so
without one written down the two cases cannot be evaluated and every other example's `when` name is
unchecked. It lists the predicate names and worker types the valid corpus uses, and deliberately
**omits** the ones the `FD-V4` and `FD-V5` cases name.

`spec/examples/invalid/` — one per `FD-V*` rule, filename `<rule-id>--<slug>.flow.json`.
