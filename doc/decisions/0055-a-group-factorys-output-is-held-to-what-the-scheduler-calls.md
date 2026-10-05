---
id: ADR 0055
title: "A group factory's output is held to what the scheduler CALLS, not to what its interface requires"
status: accepted
date: "2026-09-16"
item: W66
raised-by: W66, S10
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0055 — A group factory's output is held to what the scheduler CALLS, not to what its interface requires

**Status:** accepted — taken at [W66](../work-items/w66-the-runtime-entry.md)'s declaration step by
the maintainer, on a measurement that **corrects [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)
decision 4 in both directions**. **Amends `spec/flow-definition.md`'s registry subsection**, whose
*the two REQUIRED members are `canRun` and `getMetrics` … the runtime checks the returned object for
both* is the reading this supersedes (corrected in place; W66's conformity reader found it standing).
Amends nothing else: decision 4's *a group type is a factory
`{ configSchema?, create }`*, its three pre-registered built-ins and its *the key is the group's
identity* are unchanged and are what `createRuntime` implements;
[ADR 0049](0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md) fact 2 — the
key resolves a group and the object's own name is inert — is what makes the key the id.
**Raised by:** W66's declaration step; the upstream half is [S10](../scheduler-upstream.md)

## Context

**P18 decision 4 says the runtime refuses a created group *lacking `canRun` or `getMetrics` — the
interface's two required members; `onStart` and `onFinish` are optional*.** That sentence is a
faithful reading of `fyflow-scheduler`'s own `dist/types/groups/resourceGroup.d.ts` at 0.5.2, which
is P18 fact 2 and was re-run at W66's declaration step:

```ts
interface ResourceGroup extends EventTarget {
  readonly id: string;
  readonly type: string;
  readonly keyed?: boolean;
  keyFor?(task: unknown): string | undefined;
  canRun(key?: string, cost?: number): boolean;      // required
  onStart?(key?: string, cost?: number): void;       // optional
  onFinish?(key?: string, cost?: number): void;      // optional
  getMetrics(): ResourceGroupMetrics;                // required
  getStats?(): ResourceGroupStats;
  describe?(): GaugeDescription;
  read?(key?: string): GaugeReading[];
}
```

**What the scheduler does is a different list, and W66 measured it before writing the check** — one
omission at a time, each group registered on a real `FyflowScheduler` and holding a real task
through an inline pool, **identical under Node 24.20.0 and Deno 2.9.6**
(`dev-dist/w66/facts.mjs`, `facts-node.log`, `facts-deno.log`):

| omitted | the interface says | what the task does |
|---|---|---|
| nothing | — | `done` |
| `onStart` | **optional** | **THROWS** `group.onStart is not a function` |
| `onFinish` | **optional** | **never finishes** — `running` at 2.5 s, and `shutdown()` warns *"1 task(s) still marked running … dispatched to a pool that could not complete them"* |
| `getMetrics` | **required** | `done` |
| `canRun` | required | THROWS |
| `type` | required | `done` |
| everything, on a PLAIN object with no `EventTarget` | `extends EventTarget` | `done` |

So decision 4's list is wrong in **both** directions. It **refuses a group that works** — one with
no `getMetrics`, which nothing on the admission path calls — and it **accepts one that hangs every
task naming it, in silence**, with `scheduler.stats` reporting the run idle. That second half is
[W33](../work-items/w33-a-map-at-run-time-arity.md)'s *`N` too small completes and is silent* one
interface over, and it is the failure mode P18's own decision 9 exists to refuse for resident groups.

**And `EventTarget` is not a run-time requirement**, though the interface extends it: a plain object
carrying the members holds a task and completes it. A check that tested `instanceof` or the base
class would refuse a group a consumer can legitimately write.

## Decision

1. **A group factory's output is held to the UNION of the two lists, at `createRuntime`, by name.**
   Six members, in one list (`GROUP_MEMBERS` in `src/scheduler/runtime.ts`):

   | member | kind | why it is in the list |
   |---|---|---|
   | `canRun` | function | the scheduler calls it before every admission |
   | `onStart` | function | the scheduler calls it unguarded at admission — **measured**, though the interface marks it optional |
   | `onFinish` | function | the scheduler calls it unguarded at settlement — **measured**; without it every task naming the group runs for ever |
   | `getMetrics` | function | the interface requires it, and a consumer's viewer reads it (`fyflow-react-components`) |
   | `id` | string | the interface requires it |
   | `type` | string | the interface requires it — open, so a group defined outside this library can name itself |

   **One refusal names every missing member**, not the first, because a consumer fixing a group
   wants the whole list; the message says which half each member is in and what happens without it.
   The class is `GroupUnusable`, a `RuntimeError`, carrying the group's KEY as `at`.
2. **`EventTarget` is NOT required and is not tested**, on the measurement above. A factory may
   return a class instance or a plain object.
3. **The refusal is the RUNTIME's, not the registry's.** `resolveRegistry` checks that a group type
   IS `{ configSchema?, create }` and that a group's config satisfies its schema; it never calls
   `create`, because it constructs nothing (ADR 0054 rule 7). This list is applied where the object
   is made, which is the one sub-path that may make one (`RT-R13`).
4. **The three built-ins are pre-registered factories in `src/scheduler/runtime.ts`, their schemas
   in `src/definition/registry.ts`, and the two halves are compared BOTH WAYS by a test.** They are
   separated because the root may carry a schema and may not construct a group (`RT-R13`); the
   comparison is what stops a schema without a factory being discovered when a document names it.
   Each is given the document's KEY as its id, because the key is the identity (ADR 0049 fact 2) and
   the three constructors differ: `(limit, id)`, `(windows, id)`, `(windows, { id })`.
5. **The mismatch is raised upstream as [S10](../scheduler-upstream.md)** — mark the two members
   required, or guard the two call sites — with the workaround stated, as that register requires.
   A consumer who builds their own groups and passes them to `bootstrap` is not protected by this
   decision, and nothing but the upstream fix or a documented note can protect them.

## Consequences

**What this makes easy.** A group that would hang a run is refused at construction with a message
naming the member and the group's key, in the one place a group is made. A consumer writing a custom
group has one list to satisfy and is told all of it at once. The built-ins' two halves cannot drift
apart without a test going red.

**What it costs.** The list is a claim about another codebase's behaviour, measured at **0.5.2** and
not guaranteed at the next version — so it is written where the version is pinned, with the
measurement quoted beside each member, and the upstream item is what would let it shrink back to the
interface's own required set. A group with no `getMetrics` that works today is refused; that is
deliberate, because a viewer reads it and because the interface requires it.

**What it does NOT decide.** Nothing about `keyed`, `keyFor`, `getStats`, `describe` or `read` —
each optional in the interface and each unexercised by the acquire path this measured. A group that
implements none of them is accepted.

## Alternatives rejected

| alternative | why not |
|---|---|
| **The plan's list as written** (`canRun`, `getMetrics`) | Refuses a group that works and accepts one that hangs every task naming it, in silence — measured both ways |
| **What the scheduler calls, only** (`canRun`, `onStart`, `onFinish`) | Refuses exactly what breaks a run and nothing else, but lets a group through that a consumer's viewer cannot read; the interface requires `getMetrics` and a runtime that ignores its own dependency's contract is a second source of truth |
| **Require `EventTarget`, or `instanceof` a built-in** | Measured false as a requirement: a plain object holds a task and completes it. A check for it would refuse legitimate code |
| **Check nothing and let the scheduler fail** | The `onFinish` case does not fail — it hangs, with the scheduler reporting idle, which is the one failure mode this repository refuses on sight |
| **Wait for the upstream fix** | It is not raised yet, and P18's runtime ships before any answer could land; the list shrinks when S10 is answered, and says so |
