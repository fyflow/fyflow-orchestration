---
id: ADR 0092
title: "A gate type's routes are declared statically or derived from its node, and every reader reads the gate's resolved set"
status: accepted
date: "2026-10-13"
item: W153
raised-by: P32
supersedes: ""
amends: ADR 0066 rules 1 and 2
resolves: ""
---

# ADR 0092 — A gate type's routes are declared statically or derived from its node, and every reader reads the gate's resolved set

**Status:** accepted — P32 decisions 1-3 and 7, stop-and-asks (a) and (d) ANSWERED by the maintainer on
2026-10-13 as recommended; written by
[W153](../work-items/w153-a-gate-types-routes-may-come-from-its-node.md). It amends
[ADR 0066](0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)
rules 1 and 2: what a gate IS, and the interface every gate type is written against.

## Context

**A gate type declared ONE route list per TYPE** — `GateType.routes`, read before any gate's settings were
(P32 fact 1). So a type whose routes are its gate's own — a `switch` whose routes are its node's cases —
could not be written by anyone, while an `if` could already be written by a consumer in a few lines. That is
what makes P32 an interface change rather than two new built-ins.

**The route set is read in TEN places, every one off the TYPE** (P32 fact 2, re-taken by W153's declaration
step): `FD-V41`'s count and default at `validate.ts`, `FD-R5`'s declared check and the default edge at two
sites each in `driver.ts`, and the wiring check's default and `keyResolvedRoutes` at `wiring.ts`. Making
`routes` optional raised **nine typecheck errors in every lane at eight sites; the two `wiring.ts` sites raised
none**, because both already read through `?.` — so the compiler cannot find a wiring site left reading the
type, and those two are bound by tests.

**The type is resolved in THREE places, independently**: `validateDefinition` per gate, the `Driver` at
construction and again inside every decision, and `checkWiring`, which does not run the validator first.
And every registered type is held to `gateTypeProblem` by `checkRegistry` BEFORE any node names it — so a
rule about the type's SHAPE is refusable at the registry, and a rule about what a type derives from a gate's
settings only at the gate, because only a gate has settings.

**A declared grammar cannot be a `settingsSchema`**: ADR 0053's subset has no `pattern` and no `oneOf`, and
the only gate setting the library checks beyond a schema is `key`, by name (P32 fact 3).

## Decision

1. **A gate is a node that routes by a registered TYPE, and computes nothing.** What leaves it on the chosen
   route is exactly what reached it — ADR 0066 rule 1, unchanged. *Memory* is something a type MAY use —
   `distinct` does, and the gate's memory stays one per gate per run (ADR 0067) — and is no longer part of
   what a gate is: ADR 0066's *a decision WITH MEMORY* described the one type that shipped.
2. **A type declares its routes STATICALLY or DERIVES them from its gate — exactly one of the two.**
   `GateType` is `StaticGateType | DerivedGateType`. A static type carries `routes`, `defaultRoute` and
   `keyResolvedRoutes?`, exactly ADR 0066's and ADR 0068's members; a derived type carries
   `routesFor(settings)` returning `{ routes, defaultRoute, keyResolvedRoutes? }` IN PLACE of the three. Both
   may carry `settingsSchema?`, `settingsProblem?` and must carry `fn`. **A type carrying both forms, or
   neither, is refused** by `gateTypeProblem` — `GateTypeRefused` at the registry, `FD-V39` at a gate reached
   without one. `distinct` is a `StaticGateType`, byte-identical, and every type written against ADR 0066 is
   a static type unchanged.
3. **Each gate's ROUTE SET is resolved ONCE, by ONE function, and every reader reads that set.** `routesOf(type,
   settings)` — exported, pure and total — returns a static type's three members, or what `routesFor` returns
   for a COPY of the gate's settings, held to the route clauses a static type is held to (non-empty, distinct,
   in `FD-V16`'s charset; the default one of them; `keyResolvedRoutes` a subset without repeats) and to no
   key beside the three; it never throws, returning a problem instead. The validator asks it per gate **once
   `FD-V40` found nothing on that gate**, and reports a problem as `FD-V39` at the gate; the driver asks it per
   gate **once, at construction**, and every decision of the run reads that cache; the wiring check asks it per
   gate over the settings as given — it does not validate first — and treats a problem as it treats an unknown
   type — no default, no guarantee. **Every message describing what a type returned or threw is built so it cannot
   throw** (a BigInt, a cycle), so `routesOf` is total in fact and not only in intent (W153, conformity reader C1). **Every reader — `FD-V41`'s
   count, the default route an edge with no `route` carries, `FD-R5`'s declared check, the wiring check's
   default and `keyResolvedRoutes` — reads the gate's resolved set and never the type's members.**
4. **A type may declare `settingsProblem(settings) => string | null`**, run by `FD-V40` with a copy of the
   settings once they are a plain object the `settingsSchema` accepts. A message is the SETTINGS' defect and is
   reported under `FD-V40`; a throw, or a return that is neither a string nor `null`, is the TYPE's and is
   reported under `FD-V39` — split by what an author fixes, `FD-V28`'s precedent. An EMPTY string is a message,
   and the finding says the type gave none. A throw blocks the gate's route resolution as a refusal does. Settings
   a type's `settingsProblem` or `routesFor` would be handed but that cannot be COPIED are the SETTINGS' defect,
   `FD-V40`, and neither member is asked (W153, conformity reader C2).
5. **No rule id is added** (P32 decision 7, stop-and-ask (d)): every new defect is a clause of `FD-V39` (the
   type) or `FD-V40` (the settings). A defect of a derived set cannot have a case in `spec/examples/invalid/`
   any more than a malformed `keyResolvedRoutes` could (ADR 0068 rule 4) — a gate type is code.

## Consequences

- **`switch` becomes writable, and `FD-V41` makes it exhaustive**: a derived type's routes are its node's, so a
  case left unwired on a gate is refused at load naming the case — the forgotten case an edge chain of `when`s
  cannot catch. W154 ships it, and `if`, through this interface.
- **The validator and the driver ask `routesFor` separately, and a resume asks it again.** They agree for a
  `routesFor` that is the pure function of its settings this decision requires — the same demand Q9 makes of
  every decision and ADR 0067 makes of `fn`. **Nothing checks it.** The driver's cache removes a disagreement
  WITHIN a run; one between validation and the run, or between a run and its resume, is the impure type's
  defect, stated here rather than detected.
- **The driver gains one structure**, each gate's resolved set by gate id — configuration derived from the
  definition, constant in the task count, holding no result.
- **A derived type's gate whose settings `FD-V40` refused is not counted by `FD-V41`** — there is no set to
  count against — so an author fixes the settings first and sees the wiring findings on the next validation.
  A static type's gates are counted whatever `FD-V40` found, exactly as before.
- **`gateTypeProblem`'s shape message names seven members** and states the two forms in words after the brace,
  because its member list is bound to `GATE_TYPE_KEYS` by W99's assertion.
- **Cost**: two members on a public interface and a union where there was an interface — code that READS
  `type.routes` off a value typed `GateType` now reads `readonly string[] | undefined` and must ask `routesOf`
  or narrow to `StaticGateType`. Code that WRITES a static type compiles unchanged.

## Alternatives rejected

| | why not |
|---|---|
| **always `routesFor`** — one shape, `distinct` included | a breaking change to every consumer gate type written against ADR 0066, for a uniformity no reader needs once every reader goes through `routesOf` (P32 stop-and-ask (a)) |
| **`routes` and `routesFor` both optional on ONE interface** | the compiler then accepts a type with both or neither, and `distinct.routes` becomes `string[] \| undefined` to every reader including `examples/l6.ts`, outside W153's `Owns` (W153 re-take 1) |
| **each reader calls `routesFor` where it reads** | ten sites, three of them per decision, each a place the answer can differ within one run; one function and one cache per driver is what makes *the gate's routes* one value (W153 re-take 2) |
| **the exactly-one rule refused only at the gate** | `checkRegistry` already holds every registered type before any node names it, so a type with both forms would be accepted by the registry and refused by every flow naming it (W153 re-take 3) |
| **a rule id per built-in's settings** (`FD-V47` for `switch`, …) | the library naming a type, which P32 decision 1 refuses; `settingsProblem` is the type stating its own grammar (P32 stop-and-ask (d)) |
