---
id: ADR 0143
title: "UnitGroup and KeyedConcurrentLimitGroup are built-in group types, and a resident request is checked against a built-in group's declared config"
status: accepted
date: "2026-11-05"
item: W225
raised-by: P46
supersedes: ""
amends: ADR 0097 in part
resolves: ""
---

# ADR 0143 — UnitGroup and KeyedConcurrentLimitGroup are built-in group types, and a resident request is checked against a built-in group's declared config

**Status:** accepted 2026-11-05 — [W225](../work-items/w225-unit-and-keyed-concurrent-groups-and-a-resident-request.md) under
[P46](../plans/p46-what-the-scheduler-0-7-0-admission-rework-lets-a-document-declare.md), decisions 3, 4, 5 and 7, the
maintainer's (b), (c), (d) and (e), *"All as recommended"*, answering fyflow-app's pass 7 #2, #3 and #5.
`spec/flow-definition.md` v0.56. Extends P18 decision 4 (a group type is a factory) and [Q619](../questions/q619.md)
option B (a built-in keyed group held resident is refused), and **amends [ADR 0097](0097-what-start-refuses-that-the-flow-does-not-decide.md)
in part**: rule 3 below widens its rule 2 (`FD-R6` names the built-in `KeyedRateLimitGroup` factory) to the built-in
`KeyedConcurrentLimitGroup` factory too.

## Context

1. **The scheduler at the pin (0.7.0) adds two group classes and a resident request** (P46 fact 4): `UnitGroup(units, { id?,
   requestFrom? })` — units with names, a hold GRANTED the names it took — and `KeyedConcurrentLimitGroup(limit, { id?,
   keyFrom?, limitFor? })` — a concurrency limit per key; and a pool's `residentGroups` value may be `{ cost?, from?,
   prefer? }`, a request naming the units a worker may hold. A document could declare none of them: the Host wanting a card
   per worker wrote a code group type, and could not pin a pool to a card.
2. **The scheduler throws on a bad resident request when it is CONSTRUCTED** — a unit the group lacks, a cost above
   `from`'s size or above the group's limit, a request to a group with no `checkRequest`, a fractional cost, a
   `KeyedConcurrentLimitGroup` held resident (its `_bindResidentGroups` and `UnitGroup.checkRequest`, read in the dist at
   the pin). `createRuntime` is where a registry defect is named (P18 decision 1); the scheduler's message names neither the
   pool nor the document.
3. **The schema subset cannot state two of the configs' rules** (P46 fact 7): no `uniqueItems`, and `additionalProperties`
   is a boolean only — so *the units distinct* and *each per-key limit a positive integer* are not a schema.
4. **A `KeyedConcurrentLimitGroup` is keyed exactly as a `KeyedRateLimitGroup`**: `keyFrom` defaults to the task's
   `limitKey`, and a task with none throws at `addTask`.

## Decision

1. **`UnitGroup` is a built-in group type.** Config `{ units }`: an integer >= 1 (the units `0`…`n-1`) or a non-empty
   list of non-empty strings, **distinct** — a repeat refused `GroupConfigRefused` naming the group, beside the schema. The
   factory builds `new UnitGroup(units, { id: key })`; **no `requestFrom` in a document** — a task's request is its `units`,
   which `createTask` sets.
2. **`KeyedConcurrentLimitGroup` is a built-in group type.** Config `{ limit, limits? }`: `limit` an integer >= 1, `limits` an
   object whose every value is a positive integer — a bad one refused `GroupConfigRefused` naming the group, beside the
   schema. The factory builds `new KeyedConcurrentLimitGroup(limit, { id: key, limitFor })`, `limitFor(k)` reading `k`'s
   OWN entry in a COPY of `limits` taken at construction, else `limit` — so a later edit to the document moves no limit, and
   `limits` never answers an inherited name such as `constructor`. No `keyFrom`.
3. **It is held to `KeyedRateLimitGroup`'s rules**: a node reaching one with no `createTask` is `FD-R6` / `LimitKeyMissing`,
   and a derived pool holding one in `residentGroups` is `DerivationRefused` (Q619's refusal, widened by name).
4. **A `residentGroups` record value is a cost or a request.** A cost is a positive INTEGER — **a plain cost too**, where
   any number > 0 was accepted until v0.56. A request is `{ cost?, from?, prefer? }`, no other key, each key present held
   whatever its value: `cost` a positive integer, `from` and `prefer` non-empty lists of DISTINCT ids, each a non-empty
   string or an integer >= 0. `poolSpecProblem` holds this SHAPE, on every derivation's output alike. **It is STRICTER than
   the scheduler in five places**, each a value the scheduler accepts and reads as less than it says (measured against a
   real scheduler at the pin, W225's conformity reader, F1): a repeated id (the scheduler counts the set); a present
   `from: undefined` (read as no list); `prefer: []` (a hint for nothing); an undeclared request key such as `{ foo: 1 }`
   (destructured away); and an ARRAY as the value, `{ gpu: ['a'] }`, which the scheduler destructures as `{ 0: 'a' }` — a
   request for nothing.
5. **A cost and a request are held against the GROUP, after every pool is derived**, beside rule 3's refusal, each
   `DerivationRefused` naming the pool and the group: against a built-in `UnitGroup` — an id that is not one of its units,
   a cost above `from`'s size, a cost above its unit count; against a built-in `ConcurrentLimitGroup` or `RateLimitGroup` — a
   request naming `from` or `prefer` (the group takes none), and a cost above its limit (a `RateLimitGroup`'s smallest
   window `limit`, which is what the scheduler reads). `{ cost }` alone is a cost for any group. **A CODE group type's
   group is handed the request untouched WITHIN the request shape `{ cost?, from?, prefer? }`** — rule 4's shape holds for
   every group, as the scheduler's own `.d.ts` types a resident value `number | ResidentGroupRequest` — and its own
   `checkRequest` holds the rest when the scheduler is constructed. A request language beyond that shape is not declarable
   in a document.
6. **`copyResident` copies a request deeply** — the record, each request object, and its `from` and `prefer` arrays — so no
   two pools' specs share one and none shares one with the document. **It copies what a DOCUMENT type's derivation and a
   named instance produce**; a CLASS derivation's `pool()` output is the consumer's own object and is not copied, as
   `spec/flow-definition.md` section 3 says.

## Consequences

1. **A Host declares a card-per-worker group and pins a pool to its cards as data**, and every request the scheduler would
   throw on at construction is refused by `createRuntime` naming the pool, the group and the document's own words.
2. **A change in what is accepted, both ways.** The two types and the request are accepted where 0.13.0 refused them
   (`GroupTypeMissing`; `DerivationRefused` on a non-number cost); a fractional resident cost and a plain cost above a
   built-in group's limit are refused where 0.13.0 accepted them — each a pool the scheduler throws on at construction,
   so nothing that ran stops running. Package surface: `BUILT_IN_GROUP_TYPES` and `BUILT_IN_GROUP_FACTORIES` gain two
   entries; `PoolSpec.residentGroups`' record value widens to the new exported `ResidentGroupRequest`, so code READING a
   record value sees `number | ResidentGroupRequest`.
3. **Rule 5's cost-above-limit clause is wider than P46 decision 4 names** — that decision lists a `UnitGroup`'s unit count;
   the same throw, from the same scheduler line, holds for a `ConcurrentLimitGroup` and a `RateLimitGroup`, and naming one
   and not the others would leave two of three constructions failing in the scheduler's words. Stated here so a reader of the
   plan alone is not surprised.
4. **A task's request, and `requestFrom` / `keyFrom` as data, are not here** (P46 Out): a task's `units` is `createTask`'s,
   and neither is checked by the registry — the scheduler throws at `addTask`, after a run id is spent. A unit request from
   a flow or a node is a later plan's, if a flow asks for one.
5. **A `prefer` id outside `from` is accepted**, as the scheduler accepts it: it changes which unit is granted, never
   whether, so it can only be ignored.

## Alternatives rejected

| | why not |
|---|---|
| **The request handed on to the scheduler unchecked** | its throw at construction names no pool and no document key, which is the defect P18 decision 1 exists to remove |
| **`requestFrom` / `keyFrom` declarable as data** | a function; a key path would be a second key grammar with no flow asking for it (P46 Out) |
| **A cost above the limit refused for `UnitGroup` alone** | the scheduler throws on the same line for every group with a numeric limit; half the clause is a refusal by accident of which group the plan's example used |
| **Distinct units, and per-key limits, left to the factory's throw** | the scheduler's `UnitGroup` throws on a repeat, but `GroupUnusable` would name `create()` THREW, not the config; and a non-integer per-key limit throws at `addTask`, after a run started |
| **The scheduler's `ResidentGroupRequest` type re-exported** | `PoolSpec`'s fields are written out, not imported, so a key the scheduler adds is admitted by a version of the spec and not by a bump (the `messages` precedent) |
