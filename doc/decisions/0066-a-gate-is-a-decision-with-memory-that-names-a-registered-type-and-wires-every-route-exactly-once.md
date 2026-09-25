# ADR 0066 — A gate is a decision WITH MEMORY that names a registered type, and wires every route its type declares exactly once

**Status:** accepted 2026-09-25
**Item:** [W92](../work-items/w92-what-a-gate-is.md)
**Plan:** [P24](../plans/p24-what-a-node-may-remember-across-a-runs-branches.md) — *what may a node
REMEMBER across a run's branches?*
**Supersedes:** nothing. **Answers:** P24 decisions 1-4 and stop-and-asks (c) and (d) as a DEFINITION;
decisions 5-8 and stop-and-asks (a) and (b) are what RUNNING a gate means, and are W93's.

---

## Context

**Nothing in the library can route a branch by what its SIBLINGS have seen, and the reason is
structural** (P24's *why*): [ADR 0044](0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
makes two instances of one `map` invisible to each other, a join waits for all of them, a predicate is
asked to be pure ([Q9](../open-questions.md)), and a worker loses its memory on idle teardown and per
thread (P24 fact 7). The maintainer's case — keep the FIRST file of each TV series and drop the rest,
while thumbnails run for every file — needs memory the library holds.

**P24 settled the shape with the maintainer before this item**: a new node kind, a decision with memory,
that names a TYPE and carries SETTINGS; one built-in type, `distinct`, written against the interface a
consumer's type is; routes the type declares, a default route, every route wired, refused at load. What
this ADR decides is what those sentences mean as a GRAMMAR, which nothing fixed:

| the plan said | what it left open |
|---|---|
| *an edge with no `route` means the default route* | which rule refuses a `route` where it means nothing — on a `task`'s edge |
| *every declared route wired exactly once* | whether `when`/`on` on a gate edge is `FD-V17`'s undeclared key or the gate's own rule |
| *the key is a dotted path* | whose grammar it is — the library's or the type's — when the schema subset has no `pattern` |
| *gate types registered in code* | which registry carries them, when `DriverOptions`' members are each bound to a road through a runtime this item does not own |
| *the driver's `default` arm still refuses a gate* | at construction or at run time |

**Five measurements at W92's declaration step decided the last three** (W92's file, *What the
re-takes found*): `GateNode` in the union is ONE typecheck error in all five lanes; `gate` in `KINDS`
alone makes `validateDefinition` THROW; a validator taught the kind and a driver left alone construct,
dispatch the task before the gate, and stop only when it settles; a valid gate example turns
`examples/l6.ts`' kind clause red while no L6 row can run one; and W76's binding holds every
`DriverOptions` member to a road through `src/scheduler/runtime.ts`.

---

## Decision

1. **`gate` is the sixth node kind**: `{ id, kind: "gate", type, settings?, edges }`. It routes the branch
   that reaches it and computes nothing — **what leaves it on the chosen route is exactly what reached
   it**. It is dispatched to no scheduler, so it has no task id and **produces no output** (`FD-V27`
   refuses a reference to one, unchanged). It is a region member like a `task`; its out-arcs are
   disjunctive; it is never a region's branch entry (`FD-V9`, `FD-V25` unchanged); it may be the `entry`.
2. **A gate names a GATE TYPE, and every gate type is a value of ONE public interface** —
   `GateType { routes, defaultRoute, settingsSchema?, fn(ctx) }`, `ctx = { key, input, settings, memory }`,
   `fn` returning one of `routes`, synchronously. **`distinct` is a value of that interface and nothing
   names it anywhere else**: the validator, the wiring check and the driver read the four members off
   whatever type a gate names, and `distinct` is held to the same predicate (`gateTypeProblem`) a
   consumer's is. Its routes are `first` (the default), `duplicate` and `nokey`; its settings `{ key }`.
3. **Gate types are CODE, in the definition layer's `Registry.gateTypes`, beside the built-ins.** Absent,
   the built-ins alone; the set only ever adds; a consumer type named as a built-in is refused, never
   merged (`NameCollision`), and a value that is not a gate type is `GateTypeRefused` — both by
   `checkRegistry`, and reached through a flow directly, `FD-V39` on the gate. **`DriverOptions` does not
   carry the set in this item** — see rule 7.
4. **An edge's `route` names one of the type's routes; an edge with NO `route` carries the type's DEFAULT
   route — never every route**, and the default is whichever route the type names, not necessarily its
   first. **Every declared route is wired by exactly one edge; a drop is an edge to an `end`.**
5. **Three refusals, split by what an author FIXES** (`FD-V28`'s precedent), each at instantiation
   against the registry: **`FD-V39`** the type (unregistered, not a gate type, or registered twice);
   **`FD-V40`** the settings (not a plain object; a `key` outside the key-path grammar; refused by the
   type's `settingsSchema`); **`FD-V41`** the routes — an undeclared route, a declared route with no edge or
   with two, `when`/`on`/`needs` or a non-string `route` on a gate's edge, **and `route` on the edge of any
   node that is not a gate**. `route` is a DECLARED edge key and `FD-V41` owns it on every edge, so
   **`FD-V17`'s text does not move** — `FD-V26`'s precedent for `needs`, owned at two sites by one rule.
6. **The KEY PATH is the LIBRARY's grammar, not a type's**: `settings.key`, wherever a gate declares it, is
   dot-separated object keys each in `FD-V16`'s charset, with no index, wildcard or expression (P24
   stop-and-ask (d)); it names OWN keys of plain objects only, and anything else resolves to nothing
   (`readKeyPath`). The driver resolves it and hands the type the result as `ctx.key`, which is what a
   recorded gate decision will name (stop-and-ask (b), W93).
7. **`new Driver` refuses a flow holding a gate, at CONSTRUCTION, after validation, by name** —
   `InvalidDefinition` with no rule ids, until W93 gives `enter()` the arm that runs one. The switch keeps
   an explicit `gate` arm behind the refusal so the `never` in its `default` still makes a SEVENTH kind a
   compile error.

---

## Why, and what each was chosen over

### The refusal at construction, over the `default` arm at run time

W32 took the `default` arm for a `map` that nothing dispatched yet, and P24's row for this item said *on
W32's precedent*. **Measured, the two are not the same precedent**: W32's arm fired on the entry side of a
flow the run reached at once, while a gate sits AFTER a task. Taught to the validator with the driver left
alone, a gate flow constructed, `start()` dispatched the task before the gate, and the `default` arm
reported only when that task settled — **a real worker ran first**, on the one workload that reaches the
gate. ADR 0002 rule 3 exists to refuse that at instantiation. W33's refusal of a region inside a `map` is the
precedent actually followed: a VALID definition the driver cannot execute, refused at construction with
`InvalidDefinition` and no rule ids, *"which is what that class already means"* — so **no new class**, and
AGENTS.md section 9's enumeration moves only for the registry's.

### `route` owned by one new rule, over `FD-V17` refusing it by kind

Making a gate edge's key set its own (`to`, `route`) would put `when` on a gate edge and `route` on a task
edge under `FD-V17`, and move `FD-V17`'s text to say *an edge's keys are its node's kind's*. **Chosen
against for the message and the precedent**: `FD-V17`'s message is *undeclared key*, which tells an author
who wrote `on: ["failed"]` on a gate edge nothing about why; `FD-V7` already refuses `when` and `on` on a
JOIN's edge as the join's own clause rather than `FD-V17`'s; and `FD-V26` owns `needs` at both sites it may
appear. One rule owns `route` everywhere, and an existing rule's text stays put — P24 prediction 4.

### The key path as the library's grammar, over a clause of `distinct`'s schema

The subset has no `pattern` (ADR 0053), so no `settingsSchema` can state *dotted keys in a charset*, and a
grammar only `distinct` checked would be one a consumer's type re-implements or drops. **And the library
must know the key anyway**: stop-and-ask (b) answered that a gate's decision is RECORDED naming the key,
so the driver resolves it, not the type. So `key` is the one setting the library reads, on every gate, and
a type that keys on nothing declares none.

### `Registry.gateTypes`, over `DriverOptions.gateTypes` now

W76 bound `DriverOptions` to the runtime member by member — every member must reach a driver by one of
four roads through `src/scheduler/runtime.ts` — and that file is W93's. A member added here would be an
orphan that binding names, or a runtime edit this item does not own. The definition layer's `Registry` is
what `validateDefinition` and `checkWiring` read, so a consumer's type is fully checkable today; a
hand-built `Driver` validates against the built-ins and refuses every gate flow anyway. **W93 adds the
driver's road together with the arm that reads `fn`.**

### Wired exactly once, over a drop by omission

P24 decision 4 and its *over*: a task's terminal states are a fixed list the library owns, so omitting
`on: ["failed"]` is a statement about a closed set; a gate type's routes are the registry's, the registry
carries no version ([Q249](../open-questions.md)), and a route added to a type later would be dropped in
silence by every flow that omitted it. Exhaustiveness is the defence, and it costs an author one edge to
an `end` per dropped route.

---

## Consequences

- **A new kind must be taught in eleven places, and the typechecker names one of them.** W92's census
  found eleven sites that must learn a new kind — two of them the key TABLES the validator indexes by kind,
  which THROW rather than fall through — and one exhaustive among fifty-five regex matches. *(This read
  *"ten sites … plus key TABLES"*, which is nine plus two, against a W92 file that listed eleven and called
  it ten; the conformity reader counted both.)* *The churn surfaces at L1*, P24
  prediction 1, measured.
- **A gate is inert until W93**: valid, checkable by `validateDefinition` and `checkWiring`, refused by
  every `Driver`. `spec/examples/valid/gated-map.flow.json` is validated at L4 and its refusal asserted
  where the other region-bearing corpus flows are RUN, so W93's lift fails that assertion rather than
  passing silently; `examples/l6.ts` exempts the kind in its corpus clause, dated to W94.
- **`checkWiring` treats a gate as a pass-through**, so an arc through a gate is the arc into it — and it
  did not before this item: every arc after a gate vanished and a gate into a join lost its branch key.
- **What a gate's memory holds, when it is written, and what a resume replays are NOT decided here.**
  `GateContext.memory` is a `Map` a type reads and writes; its scope (one per gate per run) and its life
  are W93's to implement and may amend this ADR's rule 2 if running one finds `fn`'s shape wrong.
- **Cost**: an author writes an edge for every route, including the ones they would drop; a key a flow
  needs computed needs a task before the gate; and a consumer type is not reachable through
  `createRuntime` until W93 gives the runtime a road for it.
