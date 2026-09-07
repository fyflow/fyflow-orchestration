# spec/flow-definition — the flow definition format

**Status:** v0.10 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
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
**v0.8 adds a FIFTH node kind, `map`** ([W32](../doc/work-items/w32-what-a-map-fanout-is.md) under
[P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md)), answering
[Q12](../doc/open-questions.md) by
[ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md):
**fan-out is two features over one region.** A `fanout` declares N branches known at authoring time;
a `map` declares **one** branch and a run opens N instances of it, N being known only at run time.
**Measured before the rule was written**, as v0.7 was: with `FD-V9`'s floor set aside a
**one-subgraph region** produces **no other finding** — `FD-V12`, `FD-V13`, `FD-V20` and `FD-V22`
all accept it — so the region maths is a lift rather than a redesign, and what changes is the
fan-out. **`FD-V9` is unchanged and `FD-V19` is unchanged**; `FD-V25` is the map's own rule, and
**five** rules had their text widened to name the new kind — `FD-V2`, `FD-V6`, `FD-V12`, `FD-V24`
and **`FD-V23`**. *(This read **four** and omitted `FD-V23`, whose enumeration names every kind and
so is the one rule of its family that cannot be widened by implication. The validator refused a `map`
missing `over` and a test pinned the refusal, with no rule text licensing either — `spec/README.md`
rule 4's inverse. W32's conformity reader. `FD-V17` and `FD-V21` also gained map behaviour and
genuinely needed no change, because both are stated generically.)*
**v0.9 adds `FD-R2`** ([W33](../doc/work-items/w33-a-map-at-run-time-arity.md), a declared late
exception on this document): section 2 left *"what happens when `over` names a key that is absent, or
holds something that is not an array"* to W33 by name and reserved no rule id for it. W33 built the
refusal and shipped it with no rule anywhere in `spec/`; the id is taken now, beside `FD-R1`, which is
this document's precedent for a rule about what a RUN does. **No `FD-V` changed and no node kind
changed.**

**v0.10 is [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) under
[P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md), and it is the OTHER of section 2's two
questions addressed to an item by name.** [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
answers *what `over` is a key on* and *what each map instance receives*; section 3 gains **what an
ordinary edge carries**, which no document in `spec/` had ever stated, and section 4's
*"what each receives is W33's and W34's"* sentence gains its answer. **No rule id is taken here and
that is deliberate**: this document has `FD-V*` for a validation rule and `FD-R*` for a runtime
refusal and **no prefix for a rule about what a run CARRIES** ([Q164](../doc/open-questions.md)), and
`scripts/check-spec.mjs`'s `RULE_ID` is a closed list of eight prefixes, so an invented one would be
invisible to `C2` and `C6` — a rule declared, cited and checked by nothing. The rules are `JP-R11` and
`JP-R12` in [spec/join-policy.md](join-policy.md) section 4, whose owner table already fixes what the
driver does at both ends of a region. **No `FD-V` changed, no `FD-R` changed and no node kind
changed.**

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

Five. There is **no `decision` node kind** — a decision is a property of an edge, which is
ADR 0002 rule 2 taken literally (`when: "isLowConfidence"`).

| kind | keys | |
|---|---|---|
| `task` | `id`, `kind`, `workerType`, `edges`, **`optional?`** | binds to a scheduler worker pool. Dispatched as one scheduler task |
| `fanout` | `id`, `kind`, `branches` | opens a region with **N branches declared here**. Dispatches nothing itself |
| `map` | `id`, `kind`, `over`, `branch` | opens a region with **one branch, opened N times at run time**. Dispatches nothing itself. v0.8 |
| `join` | `id`, `kind`, `of`, `edges` | closes the region opened by the `fanout` **or `map`** named in `of`. Dispatches nothing itself |
| `end` | `id`, `kind`, `outcome` | terminates one path. No edges |

**Only a `task` node is ever dispatched**, and therefore only a `task` node has a task id
([spec/task-id.md](task-id.md)), produces an outcome record, or can suspend. `fanout`, `map`, `join`
and `end` are structural: a run passes through them within a single driver turn. **This is why `end`
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

### `map` — a region whose arity is not in the document — v0.8

```json
{ "id": "split", "kind": "map", "over": "items", "branch": "score" }
```

| key | | |
|---|---|---|
| `over` | required | a **key** on the value this node receives, matching `^[A-Za-z0-9_-]{1,64}$` — `FD-V16`'s charset (`FD-V25`) |
| `branch` | required | **one** node id, whose kind is a `task` (`FD-V25`). Not a list |

**`over` is a declared reference, never a callback.**
[ADR 0002](../doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 1 binds the whole document: anything that does not survive `JSON.parse(JSON.stringify(x))` is
not a definition, so *"how many items"* is a name the driver resolves and never a function the
author supplies.

**What `over` is a key ON — v0.10, and it is settled now.** It is the value the driver hands the
map node, which for an ordinary edge is the previous node's `result` unchanged (section 3). A `map`
may be the `entry` node, and then the value is the run's start payload; that needs no rule, because
`FD-V3` refuses only a `join` or an `end`. **A map node is never itself a branch entry**
(`FD-V25` makes a map's `branch` a `task` and `FD-V9` a fanout's entries tasks), so `JP-R11` does not
reach what a map node receives — only what its instances do.

**What each INSTANCE receives is `over`'s array at that instance's index, as its own copy** —
`JP-R11` in [spec/join-policy.md](join-policy.md) section 4, and
[ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
rule 3. **That is what makes `over` mean something**: handed the whole value instead, an instance can
only find its own item by an index nothing gives it, and `over` would name an array whose sole use is
its `length`.

*(This paragraph read *"deliberately not settled here … what a node receives is
[Q11](../doc/open-questions.md) and belongs to
[W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)"*. **It is the same
shape as the `FD-R2` paragraph below and it is answered rather than left**: that one addressed a
run-time question to W33 by name, W33 built the answer and shipped it with **no rule id anywhere in
`spec/`**, and only its conformity reader caught it. The rule is `JP-R11` and it lives in
`spec/join-policy.md` because that is the document whose section 4 fixes what the driver does when it
opens a region; **[Q164](../doc/open-questions.md) is why it is not `FD-`-prefixed.** Q11 itself stays
**open in general** — a run-scoped accumulator and a per-edge mapping are both unbuilt.)*

**What happens when `over` names a key that is absent, or holds something that is not an array, is
a RUN-TIME question, and v0.9 answers it as `FD-R2`.** It was left open here for
[W33](../doc/work-items/w33-a-map-at-run-time-arity.md), because P10's *"decisions taken before
fan-out"* rule 4 said *"this plan declares no policy refusal, no construction check and no new
error class, because every candidate for one is a measurement W33 has not taken yet."* **W33 took
the measurement**, and the rule is below with `FD-R1` — the other rule in this document about what a
RUN does rather than about what a document may say.

| id | | Test owed by |
|---|---|---|
| `FD-R2` | **A `map` whose `over` does not name an ARRAY on the value it receives stops the run**, reported as an `UnresolvedMapArity` naming the node and the key. `FD-V25` checks that `over` is a key NAME in `FD-V16`'s charset and **can check nothing else**, because no validator can see a value that does not exist yet — so this is the one `map` refusal that cannot be a `FD-V`. **An empty array is NOT this**: zero items is a lawful arity and its run is `stuck` (`spec/join-policy.md` section 5). **Why its own class and not `InvalidDefinition`**: the definition is valid and the previous node did not produce what the flow says it does, which is a different person's bug — a flow author reading `InvalidDefinition` would go and read their flow, where there is nothing to find. Reported through `OR-R10` from a listener, and reported **and rethrown** from `start()` and `resolve()`, which are caller-initiated. Test: `test/driver/map.test.ts` | **W33** |

*(Recorded here rather than in `spec/join-policy.md` because it is about a `map` NODE's `over` and
not about a join — and `FD-R1` establishes that a rule about what a run does may live in this
document. W33's conformity reader found the refusal shipped with **no rule id anywhere in `spec/`**,
which `doc/workflow.md` section 1 rule 3 refuses: *a decision not in `spec/`, an ADR, or a plan did
not happen*. `spec/flow-definition.md` is [W32](../doc/work-items/w32-what-a-map-fanout-is.md)'s and
W33 took it as a declared late exception.)*

**A `map` node has no `edges`** (`FD-V25`), exactly as a `fanout` has none (`FD-V9`): its one arc is
`branch`, and the region's exit is the join.

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

**What the edge CARRIES, as opposed to which edge is taken — v0.10.** Routing above decides *which*;
this is the other half and until v0.10 no document in `spec/` stated it, which is the gap
[Q11](../doc/open-questions.md) and [Q154](../doc/open-questions.md) both lived in.

> **An ordinary edge carries the source node's effective-outcome `result`, deep-copied.** The copy is
> `spec/outcome-record.md` section 4's *"copying the field copies the reference"* applied to the one
> exit that reaches a worker: without it the next task's payload **is** the record's `result`, and an
> inline worker mutating what it was given edits a record already in the log.

**A fan-out edge and a join's exit edge are the two that are not ordinary**, and both are
[spec/join-policy.md](join-policy.md) section 4's — `JP-R11` for what each opened branch receives, and
`JP-R12` for what a satisfied join carries. They live there because that section already fixes what
the driver owes at both ends of a region, and because splitting one payload contract across documents
is what left it unstated for ten plans. **[Q164](../doc/open-questions.md)** records the other reason:
this document has an id prefix for a **validation** rule and one for a **runtime refusal**, and none
for a rule about what a run *carries*.

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

**Since v0.8 a region is opened by a `fanout` OR a `map`, and everything in this section is written
about both.** Where a rule below says *"a fanout `F`"* it means whichever kind opened the region;
the four sets, `innermost(n)`, `FD-V13`, `FD-V20` and `FD-V22` never mention branch **count** and so
needed no change. **The two places that do mention it are `FD-V9`, which stays a rule about `fanout`
alone, and `FD-V19`, which has no instance inside a map region** — see *"What a map changes, and
what it does not"* below.

> **"Edge" means two things in this document and the difference matters in section 5.** An *edge* is
> an entry in a node's `edges` array. A `fanout` has no `edges` (`FD-V9`) and its arcs to its branch
> entries are `branches[]`; **a `map` has none either (`FD-V25`) and its one arc is `branch`** — so
> there are **three** arc shapes and only one of them is an edge object. Where a rule says *"has an
> edge to X"* it means any of the three — any arc in the graph, as `reaches` follows them — and where
> it says *"an edge object"* it means only the first.
>
> **v0.8 added the third and this note is where it is stated.** The `reaches(X)` row below enumerates
> arc shapes exhaustively, so a validator written from it before this correction reported three
> `FD-V11` findings against `map-fanout.flow.json` — a **valid** example. That is section 4's own
> twice-earned warning reached from the other direction: not a refusal written against the wrong set,
> but the set itself no longer computing. `src/definition/regions.ts`'s `succ` had the third arc from
> the day the kind shipped; this table did not.

### The four sets, stated so a validator can compute them

For a region opener `F` — a `fanout` or a `map` — with join `J` and branch entries `b₁ … bₙ`
(**a `map` has exactly one, its `branch`**):

| | |
|---|---|
| **`reaches(X)`** | nodes reachable from `X` by following `edges[].to`, for a `fanout` its `branches[]`, and **for a `map` its `branch`** — three arc shapes, and the list is exhaustive. **Irreflexive** — `X ∈ reaches(X)` only if a path returns to `X`, and `FD-V10` forbids cycles, so it never does |
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

### What a map changes, and what it does not — v0.8

[ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md).
**Everything above is about a region. A map is a different fan-out over the same region**, so this
subsection is short by construction, and every claim in it was measured before it was written.

**What does not change.**

1. **The four sets.** `reaches`, `branchOf`, `region(F)` and `after(F)` are computed for a map's one
   branch exactly as for a fanout's N. `region(M)` is `branchOf(M, branch)`; `J` is a member of
   neither it nor `after(M)`.
2. **`FD-V12`, `FD-V13`, `FD-V20` and `FD-V22`.** None mentions a branch count. With `FD-V9`'s floor
   set aside, a one-subgraph region produces **no finding from any of them** — measured, and it is
   the same measurement v0.7 took before retiring `FD-V15`.
3. **`innermost(n)`, and its three stated properties.** A map region is a region; a node inside a
   map nested in a `fanout` resolves to the map, and the walk outward is unchanged. Measured on
   `map-in-fanout.flow.json`: `perItem` → `"1"`, and `merge` → `"1.0"` **when an item index of 0 is
   supplied for `perItem`**. *(This cell read *"`inner` → `1`, the mapped node → `1.0`"* — wrong
   twice. There is no node called `inner` in that fixture, which is `nested-fanout.flow.json`'s
   inner **fanout**; and `branchPathOf(regions, 'merge')` **throws** with no index, so the value
   quoted was the behaviour before `ID-R6` existed, presented in the present tense under a heading
   reading *"What does not change"*. W32's conformity reader.)*
4. **`FD-V9`.** It is a rule about `fanout` and it keeps every clause and its present scope. Its
   arity floor is a statement about the **document**, and a map's arity is not in the document, so
   there is nothing for the floor to bind. **A map of one item and a map of zero items are ordinary
   runs of a valid definition**, not defects a validator could have seen.
5. **`FD-V19`, and therefore [Q27](../doc/open-questions.md).** Its condition is *a non-`end` node in
   the `branchOf` sets of **two distinct** branch entries of the same fanout*. A map declares one
   branch, so the condition has **no instance** — measured as `0` pairs iterated, against
   `n(n-1)/2` for a fanout of `n`. **A map does not lift the refusal, weaken it, or reach it.**

**What changes, and it is one sentence.**

> **Inside a `fanout` region a branch index is a property of the NODE. Inside a `map` region it is a
> property of the DISPATCH.**

`branchIndexOf` and `branchPathOf` derive from the graph and take no run-time input, so for a node
inside a map region they have no answer — and the answer they would otherwise give is the same one
for every dispatch. **Measured before the rule was written**: for a map region over `x → y`,
`branchPathOf` returns `"0"` for `x` **and** `"0"` for `y`, so three dispatches mint one distinct id
of three and the second is a `DuplicateTaskId` at `ID-R1`.

**So the derivation refuses rather than guessing**, which is `ID-R6` in
[spec/task-id.md](task-id.md) section 3. `branchPathOf` takes an optional item index **per region**;
asked for a path that crosses a map region with none supplied for it, it refuses and names the node
and the map. A refusal that names the missing index is the same failure as `ID-R1`'s duplicate with
the right diagnosis instead of the symptom.

**How many dispatches a map opens, in what order, and what each receives are NOT this document's**
— they are [W33](../doc/work-items/w33-a-map-at-run-time-arity.md)'s and
[W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s. This section fixes
only that the index exists, that it is not derivable from the graph, and that asking for it without
supplying it is refused. **Both are answered now and neither answer is here**: the first three are
`JP-R5` and section 4's owner table in [spec/join-policy.md](join-policy.md), and *what each receives*
is **`JP-R11`** there — [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md).
Recorded here rather than left pointing at two unstarted items, which is
`doc/workflow.md` section 1 rule 5's *any copy, including your own*.

`region(F)` is computed at instantiation and is what a join policy is given
([spec/join-policy.md](join-policy.md) section 1). Region membership must be *computable*, which is
why the pairing is declared rather than inferred: without it there is no statement of what a branch
was supposed to arrive at, and **"routed away from the join" is not even well defined.**

**The definition declares structure and never a count.** There is no `waitFor: 2` anywhere in this
document. A count is derivable from `branches.length`, and one policy derives it — but writing it
into the format would make arrival-counting the format's answer to
[Q4](../doc/open-questions.md) before W4 has run.

**A `map`'s `over` is not a count and does not weaken that** — v0.8. It is a **key name**, so what
the document declares is *where the arity will be found*, not what it is; nothing in the definition
says how many items there are, and nothing can, which is the whole of why a map's arity is a
run-time fact. A policy that wanted `N` for a map region would have to be told by the run rather
than read it here, and whether any policy should be is
[W33](../doc/work-items/w33-a-map-at-run-time-arity.md)'s.

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
and `FD-V8` mean `end` is the only kind of node without an outgoing edge, `FD-V9` guarantees a
`fanout` has successors, and — **v0.8** — `FD-V23`, `FD-V2` and `FD-V25` together guarantee a `map`
has exactly one, since `branch` is required, must name a node that exists, and must name a `task`.
Nothing else is possible, so there is no rule to state and no example that could violate one.
*(The derivation named four rules and covered four kinds until v0.8 added a fifth. The conclusion was
never wrong; the argument had stopped covering the document.)*

## 5. Validation refusals

Checked at instantiation, in full, before any task is queued (ADR 0002 rule 3). Every rule has one
hand-written case in `spec/examples/invalid/`, named by its rule id; `scripts/check-spec.mjs` check
C4 fails if one is missing.

| id | The definition is rejected when |
|---|---|
| `FD-V1` | two nodes share an `id` |
| `FD-V2` | an edge's `to`, a `join`'s `of`, a `fanout`'s `branches` entry, or a `map`'s `branch` names a node that does not exist |
| `FD-V3` | `entry` names a node that does not exist, or names a `join` or an `end` |
| `FD-V4` | an edge's `when` names a predicate absent from the registry |
| `FD-V5` | a `task`'s `workerType` is not a key in the scheduler's `workerPools` |
| `FD-V6` | a `join`'s `of` does not name a `fanout` **or a `map`**, or a `fanout` **or a `map`** has zero or more than one `join` naming it |
| `FD-V7` | a `task` node has no `edges`; or no edge of a `task` node is eligible for `done`; or, for some terminal state any of its edges opts into, the eligible edges for that state contain no edge lacking `when`, contain more than one, or the one lacking `when` is not last among them. **A `join` node** is rejected unless it has exactly one edge, carrying neither `when` nor `on` |
| `FD-V8` | an `end` node has `edges`, or its `outcome` is absent or empty |
| `FD-V9` | a `fanout` has fewer than two `branches`, has a repeated branch entry, has `edges`, or names a branch entry whose kind is not `task` |
| `FD-V10` | the graph contains a cycle |
| `FD-V11` | a node is not reachable from `entry` |
| `FD-V12` | a `fanout`'s branch entry, **or a `map`'s `branch`**, is its own `join` |
| `FD-V13` | a node whose kind is not `end` is in **both** `region(F)` and `after(F)` — a branch re-entering the path the join feeds |
| `FD-V14` | **deliberately absent.** The id is held so the gap is not read as a lost rule — see section 4 |
| `FD-V15` | **Nothing. Retired at v0.7, and the id is now deliberately absent** — a held id with no rule behind it, so a gap in the sequence is not read as a rule someone lost. It refused a `fanout` inside another fanout's region; nested fan-out is expressible since [W20](../doc/work-items/w20-what-a-nested-region-is.md), and the id is **retired rather than reused**. Whether a *policy* can serve a nested region is a different question with a different home — `spec/join-policy.md`, because `validateDefinition` is not given the policy |
| `FD-V16` | `flowId` or any node `id` does not match `^[A-Za-z0-9_-]{1,64}$` — the charset is [spec/task-id.md](task-id.md)'s, and this is where it is enforced |
| `FD-V17` | a node object, **an edge object**, or the document carries a key its kind does not declare |
| `FD-V18` | an edge's `on` is present and is not a non-empty array of distinct values drawn from `"done"` and `"failed"`. **`"user_action"` is refused** — it suspends rather than routes (ADR 0004 rule 3, [Q30](../doc/open-questions.md)) |
| `FD-V19` | a node whose kind is not `end` belongs to `branchOf(F, bᵢ)` for **two distinct** branch entries of the same `fanout`. Convergent branches make `branchPath` a property of the traversal rather than of the node, and P1 refuses them ([Q27](../doc/open-questions.md)) |
| `FD-V20` | a node outside `region(F)` has an edge to `F`'s join |
| `FD-V21` | a declared key holds a value of the wrong type **or outside its declared range** — `optional` not a boolean, `edges` not an array, `outcome` not a string, `version` not an integer or below 1, and so on |
| `FD-V22` | a node in `region(F)` whose kind is not `end` has an incoming edge from a node that is neither in `region(F)` nor `F` itself. **The only way into a region is through the node that OPENED it** — its `fanout` or, since v0.8, its `map`. Section 4's *"where a rule says a fanout `F` it means whichever kind opened the region"* is scoped to that section, so this rider says it in the section where the rule lives |
| `FD-V23` | a **required key is absent** — a node without `id` or `kind`; a `task` without `workerType` or `edges`; a `fanout` without `branches`; **a `map` without `over` or `branch`**; a `join` without `of` or `edges`; an `end` without `outcome`; an edge without `to`; or the document without `flowId`, `version`, `entry` or `nodes`. **`version` is required**, matching section 1 — an omitted version is one that silently means nothing |
| `FD-V24` | a node's `kind` is not one of `task`, `fanout`, **`map`**, `join`, `end`. **`kind: "decision"` is the case this exists for** — section 2 warns the author away from that word, and until v0.4 nothing rejected it |
| `FD-V25` | a `map` has `edges`; its `branch` names a node whose kind is not `task`; or its `over` is not a string matching `^[A-Za-z0-9_-]{1,64}$`. **The map's own rule, and `FD-V9` is unchanged** — each is about one node kind, because a rule about two kinds is the confusion [ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md) exists to remove. A map declares ONE branch, so `FD-V9`'s arity floor and repeated-entry clause have nothing to say about it and are not restated here |

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
| `nested-fanout.flow.json` | **[ADR 0030](../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)'s shape** — a fan-out inside a fan-out's branch, expressible since `FD-V15` was retired at v0.7. **This row was MISSING from v0.7 until v0.8 added it**: [W20](../doc/work-items/w20-what-a-nested-region-is.md) added the file and nothing obliged it to document it, so this table was stale by one for a whole plan. `test/definition/l4-corpus.test.ts` now compares the directory and this table **both ways**, which is what found it |
| `map-fanout.flow.json` | **a `map`** — v0.8, one branch entry and an arity that is not in the document |
| `map-in-fanout.flow.json` | **a map region nested inside a static one** — the shape that shows the outer `branchPath` prefix is still derived while only the map's own segment is supplied at run time |

**This table and the directory are compared BOTH WAYS, and that is v0.8's addition rather than a
restatement.** `test/definition/l4-corpus.test.ts` asserts the set of `.flow.json` files in
`spec/examples/valid/` equals the set of filenames in this table — **equality, not a floor**, for
`S12`'s reason in `scripts/check-source.mjs`: a floor answers *are there at least N* and goes stale
in the direction of weakness ([Q102](../doc/open-questions.md)), while an equality fails both when a
file is added without a row and when a row names a file that is gone. **It had a live case the day it
was written**: `nested-fanout.flow.json` had been in the directory and out of this table since
[W20](../doc/work-items/w20-what-a-nested-region-is.md), one plan earlier. It also closes a
**wiring** hole — a corpus flow renamed out of the `.flow.json` glob was previously noticed by
nothing at all, because the only bound was *"the corpus is not empty"*
(`doc/workflow.md` section 5 rule 8 obligation (e)).

**`spec/examples/registry.json` is the registry L4 validates against**, and it is part of the
corpus rather than a fixture W3 invents: `FD-V4` and `FD-V5` are refusals *about a registry*, so
without one written down the two cases cannot be evaluated and every other example's `when` name is
unchecked. It lists the predicate names and worker types the valid corpus uses, and deliberately
**omits** the ones the `FD-V4` and `FD-V5` cases name.

`spec/examples/invalid/` — one per `FD-V*` rule, filename `<rule-id>--<slug>.flow.json`.
