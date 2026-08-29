# ADR 0002 — A flow definition is data, and a predicate is registered by name

**Date:** 2026-08-30
**Status:** accepted
**Raised by:** Q2

## Context

A flow definition can be **data** (serializable, but predicates then need an expression language),
**code** (expressive and typed, but a closure cannot cross a process boundary), or **data with
predicates referenced by name**.

The constraint that decides it: three separate things want to read a definition that no running
process produced — a validator (ladder L4), a UI that draws the graph
(`fyflow-react-components`, Q21), and a future resumed run (Q15). Closures serve none of them. But
an expression language is a sub-project of its own, and nothing here needs one yet.

The library already resolves behaviour by string name: `workerType` is a key into `workerPools`, and
`addTask` **throws** on an unknown one, validating a whole batch before queueing any of it
(`AGENTS.md` section 5). Adopting that same shape for predicates is an argument from the substrate
rather than from taste.

## Decision

1. **The graph is data.** Nodes, edges, fan-out and join are JSON-serializable, with no functions
   anywhere in the structure.
2. **A decision edge references a predicate by string name** — `when: "isLowConfidence"` — resolved
   against a predicate registry, exactly as `workerType` resolves against `workerPools`.
3. **An unknown predicate name is an error at instantiation, not at routing time.** A definition is
   validated in full against the registry before any task is queued, mirroring `addTasks`. A typo
   must not become a routing failure discovered on the one workload that takes that branch.
4. **A predicate is pure.** It may not call the scheduler, perform IO, or mutate run state. This is
   what ADR 0001 rule 4 is protecting, and what makes determinism (ladder L3) a real check.
5. **A definition is portable; a deployment is not.** The graph travels alone, but it only *runs*
   where matching predicate code and worker pools exist. The two are versioned together.

## Consequences

**Easy.** Definitions validate, diff, render and version. A UI can draw a flow it has never run
(Q21). Q15 stays genuinely open rather than being foreclosed by the format, which is most of what
this decision was protecting. Predicates stay ordinary typed functions with ordinary unit tests.

**Hard.** Rule 5 is a half-truth that will mislead someone: "the definition is portable" reads as
"a flow can be moved anywhere", and it cannot — it needs its registry. Say the whole sentence, every
time. Predicate identity is also a *string*, so there is no type flow from a predicate's parameter
into the edge that names it; rule 3 converts that from a latent runtime failure into an early one,
but it does not give it back type safety.

**What a future reader will try.** Putting a small inline function into a definition "just for this
one edge" — perhaps a lambda in a TypeScript-authored flow, which will look harmless because it
typechecks. It breaks rules 1 and 3 silently: the definition stops serializing, and nothing fails
until someone tries to persist or render it.

## Alternatives rejected

| | why not |
|---|---|
| **Pure data with an expression language** | Fully self-contained, and the only option where a definition truly travels alone. But designing, parsing, sandboxing and versioning a language is a sub-project, and nothing needs it yet. Revisit if a non-developer ever authors flows |
| **Code — closures and typed functions** | Most expressive and fully type-safe. But it forecloses Q15, Q21 and ladder L4 at once: no serialization means no resume, no rendering, no validation of a definition at rest |
