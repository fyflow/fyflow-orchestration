# spec/flow-definition — the flow definition format

**Status:** v0.12 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
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
invisible to `C2` and `C6` — a rule declared, cited and checked by nothing. *(**v0.11 takes the
prefix**, which is what Q164's row called its forcing condition. `JP-R11` and `JP-R12` keep their ids
— section 3 of `doc/workflow.md`, ids are never renumbered — and the sentence above stays as the
record of why they are where they are.)* The rules are `JP-R11` and
`JP-R12` in [spec/join-policy.md](join-policy.md) section 4, whose owner table already fixes what the
driver does at both ends of a region. **No `FD-V` changed, no `FD-R` changed and no node kind
changed.**

**v0.11 answers [Q11](../doc/open-questions.md) IN GENERAL**
([W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md) under
[P12](../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)), by
[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md):
**what a node can reach is the run's own outputs, and a node id names them relative to a branch
path.** Section 3 gains **`needs`** — an optional declared mapping on a `task` or a `map` — and with
it the two rules this document had no prefix for. **[Q164](../doc/open-questions.md) is RESOLVED and
`FD-C*` is the third prefix**: `FD-V` is a rule about what a DOCUMENT may say, `FD-R` is a rule about
what a RUN refuses, and `FD-C` is a rule about **what a run CARRIES** — which v0.10 wrote as prose
with no id at all, because there was no prefix and `scripts/check-spec.mjs`'s `RULE_ID` is a closed
list. **Measured before the prefix was taken**: a rule declared as `FD-C1` and cited in this document
is reported by `check-spec` as *8 checks ok, 80 rules* — not counted, not checked for uniqueness, not
checked for an owner. *A rule declared, cited and checked by nothing*, exactly as Q164's row said.
**Three `FD-V` are added and none is changed**: `FD-V26`, `FD-V27` and `FD-V28` are `needs`' own
rules, and *"only a `task` or a `map` may carry it"* is deliberately **not** among them, because
`FD-V17` already refuses an undeclared key and names the kind. **`JP-R11` and `JP-R12` are NOT
reopened** (P12 decision 3) and **no node kind is added** (P12 decision 4).

**v0.12 answers [Q8](../doc/open-questions.md)**
([W42](../doc/work-items/w42-what-a-decision-sees.md) under
[P12](../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)), by
[ADR 0041](../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md):
**a decision sees its node's effective outcome and whatever its OWN EDGE declares.** `FD-C3` is the
rule and an **edge** may carry `needs` — the same grammar and the same aiming rules as a node's,
**minus the `"."` form**, which `FD-V26` refuses there because *what a predicate would have received
anyway* is `ctx.outcome` and it already has it. **[P12](../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)
prediction 3 said Q8 would need no ADR and it REVERSED**, on one measurement: a node's payload is
**not derivable from the log at routing time** — the **entry** node's payload is `start(payload)` and
appears in **no record at all**, and for every other node a derivation would re-implement `compose`,
`JP-R11` and `JP-R12` at a second site, which
[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 2 refuses by name. *(This read *"on a diamond … choosing which supplied the payload needs append
order"*, and W42's conformity reader derived the diamond in one expression with no append order at
all — drop any settled predecessor another settled one is reachable from, and `FD-V19` makes the
survivor unique. **The conclusion held and its stated reason did not.**)* **So a predicate cannot be handed
*what its node received* without retaining a payload per dispatched node**, and it does not need to
be: the references resolve from the same projection with no new state. **No node kind changed, no
`FD-V` changed** — `FD-V26`, `FD-V27` and `FD-V28` gained a second SITE and no new clause but the
`"."` refusal — and `spec/join-policy.md` section 4 is untouched.

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
| `task` | `id`, `kind`, `workerType`, `edges`, **`optional?`**, **`needs?`** | binds to a scheduler worker pool. Dispatched as one scheduler task |
| `fanout` | `id`, `kind`, `branches` | opens a region with **N branches declared here**. Dispatches nothing itself |
| `map` | `id`, `kind`, `over`, `branch`, **`needs?`** | opens a region with **one branch, opened N times at run time**. Dispatches nothing itself. v0.8 |
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
map node — **which since v0.11 is what section 3's `FD-C1` says it is**: the previous node's `result`
unchanged when the map declares no `needs`, and the object its `needs` describes when it does.
`map-over-region-output.flow.json` is the second case and it is the whole of why `join -> map` over a
region's output is expressible. *(This paragraph said only *"for an ordinary edge is the previous
node's `result` unchanged"* after v0.11 had made it one of two. W41's conformity reader.)* A `map`
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
| `needs` | optional, v0.12 | **what this edge's PREDICATE sees**, under `ctx.needs` — `FD-C3` below. Same grammar as a node's `needs`, **minus the `"."` form** (`FD-V26`). An edge with no `when` may carry one and no predicate ever reads it |

> **This table is what `FD-V17` refuses against, so `needs` being absent from it made the code
> accept a key the document did not declare.** `FD-V17` reads *"a node object, **an edge object**, or
> the document carries a key its kind does not declare"*, and section 2's node table was widened at
> v0.11 for exactly that reason while this one was not — so for one item `EDGE_KEYS` and this table
> disagreed, in the accepting direction, which is `spec/README.md` rule 4's inverse. W42's conformity
> reader. *An undeclared-key rule is only as good as the table it reads.*

**Routing, in order:**

1. A node's **effective outcome** ([spec/outcome-record.md](outcome-record.md) section 7) supplies a
   `terminalState`, which selects the **eligible** edges — those whose `on` contains it (ADR 0004
   rules 1-2). Eligibility is checked before anything else.
2. Among the eligible edges, **in declaration order**, the first whose `when` predicate returns true
   is taken. Later edges are not evaluated. An edge with no `when` always passes.
3. `when` is resolved against the predicate registry at instantiation, never at routing time
   (ADR 0002 rule 3). An unknown name is an instantiation error (`FD-V4`).
4. A predicate receives a single `DecisionContext` argument and returns a boolean. It carries
   **`outcome`** — always the node's effective outcome, one shape whether the node settled or was
   resolved — and, since v0.12, **`needs`**: what **this edge** declared, or `{}`. *(This rule read
   *"P1 populates exactly one field … whether the context also carries accumulated run state is
   [Q8](../doc/open-questions.md); adding a field later is additive rather than a signature change"*.
   **It was additive and the sentence was right about that**; what it did not predict is that the
   field would be declared on the EDGE — see `FD-C3`.)*
5. A predicate is pure (ADR 0002 rule 4). Purity is not enforced by this document;
   [Q9](../doc/open-questions.md) is about the mechanism.

**What the edge CARRIES, as opposed to which edge is taken — v0.10.** Routing above decides *which*;
this is the other half and until v0.10 no document in `spec/` stated it, which is the gap
[Q11](../doc/open-questions.md) and [Q154](../doc/open-questions.md) both lived in.

> **An ordinary edge carries the source node's effective-outcome `result`, deep-copied.** The copy is
> `spec/outcome-record.md` section 4's *"copying the field copies the reference"* applied to the one
> exit that reaches a worker: without it the next task's payload **is** the record's `result`, and an
> inline worker mutating what it was given edits a record already in the log.

### `needs` — what a node receives, when it is not the previous node's output — v0.11

[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md),
answering [Q11](../doc/open-questions.md) **in general**, with
[Q166](../doc/open-questions.md) and [Q165](../doc/open-questions.md) as its cases.

```json
{ "id": "score", "kind": "task", "workerType": "ScoreWorker",
  "needs": { "item": ".", "run": "ingest" },
  "edges": [ { "to": "collect" } ] }
```

**`needs` is optional, and a node without one receives exactly what the paragraph above says.** That
is the whole of rule 1: the default is unchanged, so every flow written against v0.10 behaves at
v0.11 exactly as it did — measured, at 574 L1-L5 cases unmoved.

A node that declares one receives **the object `needs` describes, and nothing else**. There is no
wrapper and no reserved key, because `"."` is how an author asks for what the edge carried.

| a reference is | and resolves to |
|---|---|
| `"."` | **whatever this node would have received had it declared nothing** — whichever of this document's arcs it sits on: the ordinary edge's value above, a `fanout` branch entry's own copy or a `map` instance's own item (`JP-R11`), or a satisfied join's collection (`JP-R12`). *(This row enumerated the first and the last of those and omitted the two in between; **`map-over-region-output`'s `rank` sits on a join's exit edge**, so one of the omissions is in this item's own corpus. W41's conformity reader.)* It is the one invented token in the grammar and it is safe because `.` is outside `FD-V16`'s charset, so no node may ever be called it |
| `"score"` | that node's output **on this node's own branch path**. **None, and the run stops** (`FD-R3`); more than one is unreachable, because `FD-V28` refuses this form wherever the graph admits more |
| `["score"]` | that node's outputs as an **array**, in ascending `branchPath` order compared segment-wise as numbers — `JP-R12`'s order rule, and the same reason: it is what makes the value the same whatever order the branches settled in. Legal only where this node is **outside** a region containing the named one (`FD-V28`) |

**The array form is JSON's own array syntax rather than a second sigil**, so the grammar invents one
token rather than two, and a definition still survives `JSON.parse(JSON.stringify(x))`
(ADR 0002 rule 1).

**Which form is legal is a property of the GRAPH, not of the run, and `FD-V28` is what says so.** A
node produces more than one output for a reader exactly when the reader is outside a **`map`** region
containing it — so an author is told at instantiation which form to write, and *which shape will
arrive* is never a run-time surprise.

> **A `fanout` region is NOT that case, and the rule's first version said it was.** `FD-V19` refuses
> a non-`end` node in two branch entries of one fanout, so every node in a `fanout` region has
> **one** output and the bare form is what is legal from outside it. Written against *a region* rather
> than *a map region*, `FD-V28` refused `needs: {"a": "scoreA"}` on a node after a two-branch join —
> a valid document — and told the author to write `["scoreA"]` and index `[0]` out of it. **`FD-C2`'s
> own measurement is what the rule should have been read from**: the ids collapse in exactly the
> flows with a map region and in neither with only `fanout`s, stated nine lines below, in this
> document, before the rule was written. W41's conformity reader. **This is what makes `needs` more than the accumulator**:
[Q11](../doc/open-questions.md)'s second candidate is the state and its third is the access, and only
the third can reach a worker at all, because `createTask` takes **one** value
(`{id, workerType, payload, optional}` — measured).

**What NAMES an output is the pair `(node id, branchPath)`** — `FD-C2` — and a node id alone does
not. Measured over all four region-bearing flows in `spec/examples/valid/`: the pairs are distinct
**4 of 4, 4 of 4, 5 of 5 and 6 of 6**, while the node ids collapse in exactly the two flows with a
`map` region, at any depth, and in neither flow with only `fanout`s. That is
[ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
deciding fact for the **third** time ([Q160](../doc/open-questions.md)), and it is why an author
writes a node id and the run resolves it against a path.

**An entry is visible to a node when one path is a prefix of the other**, segment-wise — `-` (no
region) being a prefix of everything. One predicate gives both forms: `ingest@-` is visible
everywhere; `extract@1` is visible to `merge@1.0`; and `merge@1.0` and `merge@1.1` are **both**
visible to a node at `-` after the join, which is the array.

> **Segment-wise and not by string.** `"1"` is a prefix of `"1.0"` and is **not** a prefix of
> `"10"`, which a `startsWith` gets wrong in exactly the case a nested region produces — `JP-R12`'s
> own *invisible at depth 1, live at depth 2*, a fourth time in this tree.

**Each key gets its own copy**, which is `JP-R11`'s invariant applied to the one edge that is not a
fan-out edge: no two nodes ever receive the same object, and a reference is the one way two nodes
could otherwise be handed one record's `result` twice.

**What a node reaches is a PROJECTION of the log and is not new retention.** The driver already
holds an append-only `log` with `result` on every settled task and already exposes the whole of it
through `snapshot()`; the projection adds **zero** fields, and it is computed on demand rather than
maintained, so a second source cannot disagree with the log.
[Q19](../doc/open-questions.md)'s *"if Q8 or Q11 retains every node output"* described **today**
before `needs` existed, and its real question — whether that retention should be **bounded** — is
untouched.

> **What `needs` costs is what you point it at, and the document is where that is visible.** The
> mechanism is linear: at a map arity of 1000, `{"item": "."}` is **8.0 ms** against **6.5 ms** for
> no `needs` at all, and one more key naming a small result is **10.6 ms**. **A key naming a large
> one is 546.6 ms**, because each instance gets its own copy of it — which is
> [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)'s
> refused per-instance clone, reached by asking for it. **That is why a reference names a whole node
> and never a path inside its value**: a path language would make *the small part of the big thing*
> expressible and would move this cost out of the document and into a selector.

**The effective outcome, never the raw record** — rule 4 above, one level out. A resumed node has two
records and neither alone is right to hand anybody; a node still suspended has **no** effective
outcome and therefore **no entry**, which is what makes `FD-R3` fire rather than a reference quietly
resolving to `undefined`.

| id | | Test owed by |
|---|---|---|
| `FD-C1` | **What a node receives.** With no `needs`, the source node's effective-outcome `result`, deep-copied — the paragraph above, unchanged. With a `needs`, **exactly** the object it describes: one key per declared key, each resolved by the table above and each its own copy. Test: at ladder L2, over `map-with-context.flow.json` and `map-over-region-output.flow.json`, asserting the composed payload of **every dispatch a `needs` composes** — which is 2 of that flow's 4 and 3 of this one's 7, the rest being nodes that declare none; and that a node with no `needs` is byte-unchanged, which the 574 unmoved L1-L5 cases assert as a whole | **[W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)** |
| `FD-C2` | **What names an output is the pair `(node id, branchPath)`.** A node id alone names one output outside a `map` region and **N** inside one, so a projection keyed by node id collapses a map's instances — which is what a reference must not do. A `needs` reference names a node **id**, because a branch path inside a map region is a property of the **dispatch** (section 4, `ID-R6`) and no author can write one. Test: at ladder L2, the pairs are distinct over all four region-bearing corpus flows **and over the two this item adds**, while the node ids collapse in exactly the map-bearing ones | **[W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)** |

### An EDGE may declare `needs` too, and what it gives is what its PREDICATE sees — v0.12

[ADR 0041](../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md),
answering [Q8](../doc/open-questions.md).

```json
{ "when": "isLowConfidence", "to": "review", "needs": { "earlier": "ingest" } }
```

**Same grammar, same aiming rules, minus the `"."` form.** A reference on an edge is a node id or a
one-element array holding one; `"."` is refused by `FD-V26`, because *what this predicate would have
received anyway* is `ctx.outcome` and it already has it. `FD-V27` and `FD-V28` ask the same two
questions of an edge's references as of a node's, **with the same reader** — an edge has no path of
its own, so the node it hangs on is what a reference resolves relative to.

**Why the EDGE and not the node**, stated because it is the whole of what
[P12](../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md) prediction 3 got wrong:

| | |
|---|---|
| a node's `needs` would rewrite what its **WORKER** receives | measured: `score` with no `needs` receives `{"flagged":true}`, and with `needs: {"own": ".", "up": "ingest"}` receives `{"own":…,"up":…}`. **Giving the predicate reach would change the worker's contract** |
| and *what the node received* is **not derivable at routing time** | The **entry** node's payload is `start(payload)` and is in **no record**: an `OutcomeRecord` carries `result` and no payload field, so that node has no derivation at all — not a hard one, none. For every other node a derivation re-implements `compose`, `JP-R11` and `JP-R12` at a second site, which [ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) rule 2 refuses by name; keeping it instead is a payload retained per dispatched node, which is [Q19](../doc/open-questions.md)'s own subject. *(This row cited a **diamond** and append order, and W42's conformity reader derived the diamond with neither.)* |
| the **references** are derivable, and cost nothing new | they resolve from the same projection `FD-C1` uses, at the moment the decision is made, with **no new driver state** |

> **A `needs` on an edge no predicate reads is ACCEPTED and INERT, and that is a decision rather
> than an oversight.** Two shapes: an edge with a `needs` and **no `when`**, which nothing evaluates;
> and a **`join`**'s single exit edge, which `FD-V7` forbids from carrying a `when` at all. Both
> validate with zero findings and neither is ever resolved. **Refusing them would put a rule about a
> KIND inside a rule about a GRAMMAR**: `FD-V26` says what a reference IS, *may a predicate sit here*
> is `FD-V7`'s question, and `FD-V17` — which owns *a key this kind does not declare* — cannot
> express *a key this kind declares and cannot use*. **The cost is that an author can write one and
> see nothing happen**, which is why it is written down rather than left to be discovered. W42's
> conformity reader; `test/driver/decision-context.test.ts` asserts both shapes.

**A predicate on an edge that declares nothing sees `ctx.needs = {}`, and the projection is not
computed at all** — which is every edge written before v0.12, so nothing changes for a flow that
declares nothing. **`{}` and never `undefined`**, for rule 4's own reason one level out: a predicate
written `ctx.needs.flag` must mean one thing.

| id | | Test owed by |
|---|---|---|
| `FD-C3` | **What a decision sees.** Its node's **effective outcome** (rule 4, unchanged since P1), and **`needs`** — the object THIS EDGE's `needs` describes, resolved by `FD-C1`'s table with the reader being the node the edge hangs on, or `{}` when the edge declares none. **A different edge of the same node may declare something different**, so the context is built per edge and only for an edge that carries a `when`. Test: at ladder L2, over `decision-on-an-earlier-step.flow.json` — one flow, two runs, the predicate answering differently because of a node it does not sit on; that a node with no `needs` anywhere has its worker payload **unchanged**; and that an edge which is never REACHED is never resolved, so a later edge's unresolvable reference does not stop a run the flow routes correctly. **On a CONSTRUCTED fixture, because that corpus flow cannot express them**: that another edge of the same node sees `{}`, which needs a node with **two guarded edges** since a default carries no `when` and so builds no context; and that a **resumed** node's predicate sees the resolution's result under `outcome` while `needs` resolves against the run. *(This cell prescribed both of those over the corpus flow, and prescribed the second as "the resolution's result under BOTH fields" — which no flow can express, because for `needs` to carry the resumed node's own result the edge would have to name its own node, and `FD-V27` refuses that. Section 6's "FD-R1's test, corrected" is the same class and this is its second occurrence in this document. W42's conformity reader.)* | **[W42](../doc/work-items/w42-what-a-decision-sees.md)** |


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
| `FD-V26` | a `needs` — **on a node OR on an edge** — is not an object, is an empty one, has a key outside `^[A-Za-z0-9_-]{1,64}$`, or has a value that is not `"."`, a node id, or a one-element array holding a node id; **or is on an EDGE and uses `"."`**, which a predicate has no use for because `ctx.outcome` already carries what it would otherwise name (v0.12). **Section 3's grammar and nothing else** — where the reference POINTS is `FD-V27`'s and `FD-V28`'s. *"Only a `task` or a `map` may carry `needs`"* is **deliberately not a clause here**: `needs` is absent from the other three kinds' key lists, so `FD-V17` already refuses it and names the kind, and a second rule saying the same thing is one `FD-V17` could never disagree with |
| `FD-V27` | a `needs` reference names a node that does not exist, names a node whose kind is not `task` (**only a `task` produces an output** — section 2), or names a node **this node is not reachable from**. The last is what makes a reference a statement about the graph rather than a hope about the run: a reference pointing sideways or backwards names a node that may not have run, and without this the only thing to say so is `FD-R3`, at run time, on the one workload that takes that branch — which is ADR 0002 rule 3's own argument for validating at instantiation |
| `FD-V28` | a `needs` reference's **form does not match the graph** — `"n"` where this node is outside a **`map`** region containing `n` (so `n` produces one output per ITEM), or `["n"]` where it is not (so `n` produces exactly one). **A `fanout` region is not this case**: `FD-V19` gives every node in one exactly one output, so the bare form is legal from outside it, and the rule's first version refused a valid document by asking *a region* where it meant *a map region*. **Its own id rather than a clause of `FD-V27`** because an author fixes the two differently: `FD-V27` is *that node cannot have produced anything for you* and this is *it produced a different NUMBER of things than you asked for*, and the message names the form to write instead |

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
| `FD-R3` | a `needs` reference names a node and **no output of that node is on this node's branch path** — a decision routed around it, or it settled `user_action` and nobody has resolved it. Reported as an `UnresolvedReference` naming the declaring node, its branch path, the key and the target. **`FD-V27` has already checked that this node is reachable FROM the named one**, which is everything the graph can say; whether it ran is a fact about this run, so no validator rule could have seen this — `FD-R2`'s own argument one door along. **Why its own class and not `UnresolvedMapArity`**: that one says *the previous node did not return an array*, which is a WORKER's bug, and this says *the node you named did not run on your path*, which is the FLOW's shape, and the two send a reader to different places. Reported through `OR-R10` from a listener, and reported **and rethrown** from `resolve()`, which is caller-initiated. **Not from `start()`, and that is a property of `FD-V27` rather than of this rule**: `start()` composes only the entry node, and a reference from the entry node names a target the entry node must be reachable from — which with `FD-V11` makes the entry reachable from it, and that is an `FD-V10` cycle. So the `start()` road is refused at instantiation and has no case. *(This row said `start()` and `resolve()`, and the test named for it asserted neither. W41's conformity reader, and it is `FD-R1`'s own *test that cannot be built* one section up.)* Test: `test/driver/needs.test.ts` | **[W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)** |

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
| `map-with-context.flow.json` | **[Q166](../doc/open-questions.md)'s flow** — *score each item against the run's config*. A map instance that receives its own item **and** the value the map node received, through `needs: {"item": ".", "run": "ingest"}`. v0.11 |
| `map-over-region-output.flow.json` | **[Q165](../doc/open-questions.md)'s flow** — *score, then fan out over the scores*. A `map` whose `over` names a key `needs: {"scores": ["score"]}` composed from a whole map region's output, **with no `over: "0"` and therefore no coupling to branch numbering**. v0.11 |
| `decision-on-an-earlier-step.flow.json` | **[Q8](../doc/open-questions.md)'s own flow, carried in that row since P1** — *route to review if an earlier step flagged low confidence*. An **edge** declares `needs: {"earlier": "ingest"}` and its predicate answers on a node it does not sit on, **with the worker's payload unchanged**. v0.12 |
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
