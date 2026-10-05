---
id: ADR 0067
title: "A gate runs in the driver, its memory is the driver's, and its decision is recorded"
status: accepted
date: "2026-09-25"
item: W93
raised-by: P24
supersedes: ADR 0066 rule 7
amends: ""
resolves: ""
---

# ADR 0067 — A gate runs in the driver, its memory is the driver's, and its decision is recorded

**Plan:** [P24](../plans/p24-what-a-node-may-remember-across-a-runs-branches.md) — *what may a node
REMEMBER across a run's branches?*
**Supersedes:** [ADR 0066](0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)
**rule 7** — the construction refusal — and nothing else of it. **Answers:** P24 decisions 5-8 and
stop-and-asks (a) and (b) as a RUN; W92's two hand-overs — the driver's road for a consumer's gate types, and
`routing.ts`' `eligibleEdges` answering `[]` for a gate.

---

## Context

**ADR 0066 made a gate a valid DEFINITION and refused every flow holding one at `Driver` construction**,
because the `enter()` arm that runs one was this item's. P24 had settled what running one means — decisions
5-8, evaluated by the driver where a branch enters, one memory per gate per run, first meaning first to
arrive, an undeclared route stopping the run — and stop-and-asks (a) (memory per RUN) and (b) (the decision
RECORDED as a fold input). What none of that fixed:

| the plan said | what it left open |
|---|---|
| *the memory is the driver's and a resume rebuilds it by replay* | where it LIVES, and whether anything but a driver may ever hold it |
| *a recorded `gated` input naming the gate, the branch, the route and the key* | what *the branch* is for a node with no task id, what *the key* is when nothing resolved, and where in the sequence it goes |
| *a route the type did not declare stops the run by name* | which rule and which class; and what a type that THROWS does |
| *what leaves a gate is what reached it* | what the TYPE is handed, when a type may write into it |
| (W92's hand-over) *the driver's road for gate types* | which `DriverOptions` road, when W76 binds every member to one |
| (W92's hand-over) *`FD-R4` through an entry gate* | whether the payload is held to every route's target or to the chosen one |

**Six measurements at W93's declaration step decided them** (W93's file, *What the re-takes found*): P24
fact 4 reproducing to the position on the shipped `runtime.resume`; a gate arm PROTOTYPED in a copy of the
tree, killed at every kill point and resumed under three memory placements, in both runtimes; `enter()`'s
shape; a census of every `FoldInput`-kind dispatch site with a stated predicate; what W76's and W55's
bindings do when `DriverOptions` and the driver gain members; and the precedent for a throwing decision,
measured on the shipped driver.

---

## Decision

1. **A gate is evaluated by the DRIVER, synchronously, where a branch ENTERS it** — an arm of `enter()` with
   no dispatch, no task id and no scheduler. It asks the type's `fn` with `{ key, input, settings, memory }`:
   **`input` and `settings` are COPIES** — a predicate is handed a copy for Q9's reason, and a type writing
   into what it was handed must move nothing downstream or in the definition — and `key` is `settings.key`
   resolved by `readKeyPath` (ADR 0066 rule 6) over **that copy, the value as a `structuredClone` carries
   it**, ONCE, the same key recorded (rule 3) as a copy taken before `fn` runs. *(The first cut read the
   type's key off the copy and the recorded one off the original; for a CLASS instance in a caller's entry
   payload the two differ, and a resume — which enters from the header's clone — was refused `diverged` at 0
   on an honest checkpoint. W93's conformity reader, finding 1.)* It takes the ONE edge wired for the returned route
   (`gateEdge`, in `routing.ts` beside `selectEdge`: an edge with no `route` carries the type's DEFAULT) with
   **exactly the value that reached the gate**, and the branch, region and item indices that reached it.
2. **The memory is ONE `Map` per gate per RUN, a private field of the driver, created EMPTY with it and never
   handed in or out** — no option, no checkpoint field. Keyed by gate id alone, so every branch that reaches
   the gate shares it whatever region instance or map item it comes from (stop-and-ask (a)).
3. **A decision is RECORDED**: `{ kind: 'gated', gateId, branchPath, route, key }`, appended after the type
   answered with a declared route and BEFORE the route's target is entered — `branchPath` the gate's own,
   derived as a task's is; `key` a COPY of what resolved, ABSENT where nothing did. The fold records it in
   `RunState.gated`, in order (`pathEnds`' precedent: which branch was FIRST is a fact about order). It is a
   new `FoldInput` kind and it is REGENERATED on resume, never fed — `spec/run-state.md`'s `RN-R26`.
4. **A route the type does not declare stops the run** — `FD-R5`, a new class, **`UndeclaredRoute`**, through
   `OR-R10`, with nothing recorded for the gate. **A type that THROWS stops the run with its own error**, as a
   throwing decision predicate does.
5. **`DriverOptions.gateTypes`** — the twentieth member — carries a consumer's gate types to a driver, held by
   `checkRegistry` and handed to the validator; **the runtime's road is `RuntimeRegistry`** (W76's road (b)),
   supplied as `RegistryCode.gateTypes` and held to `GateType` by `checkGateTypes` where the runtime is BUILT.
6. **`FD-R4` through an ENTRY gate holds the payload to the target the gate CHOOSES**: the driver asks the
   entry gate's type at `start()` against a THROWAWAY memory — empty, which is exactly what the run's memory
   is before its first decision — and walks on from that route's edge alone (`boundaryTargets`' optional
   chooser). A throw or an undeclared route there holds nothing past the gate; the run stops on it for real.
7. **ADR 0066 rule 7 is LIFTED**: `new Driver` constructs a flow holding a gate.

---

## Why, and what each was chosen over

### A driver-owned memory, over one kept by the process — and it is not a matter of taste

P24 decision 6 already said *the driver's*; what the declaration step added is **why nothing else may hold
it**. A gate arm prototyped in a byte copy of the tree, the P24 flow killed after each of its six `identify`
settlements and resumed on a fresh runtime, both runtimes, identical logs:

| memory held by | identical to the run nobody killed | refused | the kill before the first decision |
|---|---|---|---|
| the driver (this decision) | 6 / 6 | 0 | identical |
| the process, keyed by run and gate | 0 / 6 | 5, all `diverged` at position 16 | **COMPLETED WRONG, IN SILENCE** — every file `duplicate`, no series set up |
| the process, cleared before the resume | 6 / 6 | 0 | identical |
| the process, recording the owning branch | 6 / 6 | 0 | identical |

The silent row is `RN-R20`'s own stated limit reached by a gate: the store held 16 elements and the first
`gated` element was the 17th, past the stored events, where nothing is compared. **Owner-recording memory also
resumes identically — and was not chosen**, because it needs the branch in `ctx` (which `GateContext` does not
carry, and ADR 0066 rule 2 fixed), and because it is correct only while every type remembers its OWNER: a
type that records a count or a set would reproduce the silent row. A memory created with the driver and never
handed in is correct for every type, because a driver is one run (`ID-R3`) and the replay is the only thing
that writes to it before the first live settlement.

### Recorded before its target, over after — and regenerated, over fed

A `gated` element appended AFTER the route's target was entered would sit behind the `dispatched` it caused,
and a reader could not tell from the sequence why that task ran. Before it, the sequence reads as the run
happened: the settlement, the decision, what the decision led to. **Regenerated, not fed**, because feeding it
would hand the replay the stored ROUTE and skip the type — so the memory would not be rebuilt, the first live
branch after a resume would see an EMPTY memory, and a duplicate would route `first`. Regenerating is what
makes `RN-R20` compare the type's answers, which is P24 stop-and-ask (b)'s own argument for recording them.

### A new class for an undeclared route, and the thrown error as it is

`FD-R1`'s class is `NoMatchingEdge`, and a gate's undeclared route is its counterpart but not its case — no
eligible edge is missing; the TYPE, which is code registered under a name, answered outside its own
declaration. `UndeclaredRoute` sends a reader to the type rather than to the document, on
`UnresolvedMapArity`'s precedent (*the definition is valid and something else is wrong*). **A throw is not
wrapped**: measured on the shipped driver, a decision predicate that throws stops the run through `OR-R10`
with its own error (`stoppedBy "Boom: …"`, one report of kind `Boom`) — and a gate is a decision with memory
(P24 decision 1). Wrapping it would make a gate's throw read differently from a predicate's for no reader's
benefit.

### Copies for the type, over the value itself

The value that reached a gate is handed ON, unchanged; a type that could write into it would change what the
next node receives, which is the one thing a gate may not do (ADR 0066 rule 1). A copy per decision costs one
`structuredClone` of the value — the price a predicate on an edge with a `when` already pays — and the
settings are copied for the same reason: they are the caller's DEFINITION. **The key is resolved off that
copy**, which is what a replay regenerates: a caller's CLASS instance is plain once cloned, so reading the
original would make a run and its replay resolve different keys.

### `RuntimeRegistry`, over `StartOptions` or `RuntimeOptions`

W76 binds every `DriverOptions` member to exactly one road through the runtime. Gate types are CODE
registered once per runtime and read by every run it starts — exactly `languages`' shape, which is road (b).
`StartOptions` would let two runs of one runtime disagree about what a type NAME means; `RuntimeOptions` is the
runtime's own configuration and forwards only policies. **`RegistryCode` is the definition layer's type**, so
this is a declared exception of W93's: a runtime consumer supplies code there already, and a second place for
one kind of code would be a second road.

### The chosen target at `FD-R4`, over every route's target

Holding the payload to every route's target — which is what `boundaryTargets` walked since W92 — refuses a
run at `start()` by a task it never reaches: measured, a payload `distinct` sends to `first` was held to the
`nokey` target's schema. *A task the payload reaches* is, through a gate, the one its route leads to, so
`FD-R4`'s TEXT does not move; what moves is the walk. The throwaway memory is what keeps the check from
writing the run's memory before the run starts — a refused start followed by a corrected one would otherwise
route the same key `duplicate`, and nothing would be dispatched. **Its cost is one more call of `fn` for an
entry gate**, which is why a type must be the pure function of its context Q9 asks every decision to be.

---

## Consequences

- **The run half of P24 is built; the exit artifact is W94's.** L6 is UNMOVED — `examples/l6.ts`' kind
  clause keeps its dated `gate` exemption until W94's row runs one on real workers. *(It did: [W94](../work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md)'s
  rows turned the clause RED on their first run and the exemption was removed; L6 is 2069 / 154, and the package `0.6.0`.)*
- **A new `FoldInput` kind is BREAKING for a consumer switching on `kind` exhaustively**, as `resumed` was —
  the package moves at W94's close ([Q381](../questions/q381.md)'s list names it with the node kind).
- **`RN-R13` gains a FOURTH term**: each gate's memory, retained for the life of the run — P24 prediction 4,
  predicted before this item and confirmed by it.
- **A checkpoint needs no new field** (P24 prediction 2): the memory is rebuilt by the replay ADR 0065
  defined, and a checkpoint produced by W92's code resumes unchanged — asserted on one.
- **`fn` may be called one more time than branches reach the gate** — once at `start()` for an entry gate,
  against a throwaway memory, when boundary checking is on.
- **Cost**: per gate decision, a `structuredClone` of the value, of the settings and of the resolved key
  (the recorded copy); one more of the key per consumer `freezeInput` hands it to; and for an entry gate one
  more decision at `start()` (rule 6) — plus one entry in the gate's memory per distinct key its type
  records, for the life of the run. *(This read *one `structuredClone` of the value*, where there are up to
  four clones — W93's conformity reader, finding 6.)*
