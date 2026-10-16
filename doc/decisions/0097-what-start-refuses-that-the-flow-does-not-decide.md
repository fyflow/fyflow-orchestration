---
id: ADR 0097
title: "What `start` refuses that the flow does not decide — a node reaching a built-in keyed group, and `defaultRetryPolicy`"
status: accepted
date: "2026-10-15"
item: W163
raised-by: P37
supersedes: ""
amends: ADR 0096 rules 4 and 5
resolves: ""
---

# ADR 0097 — What `start` refuses that the flow does not decide — a node reaching a built-in keyed group, and `defaultRetryPolicy`

**Status:** accepted — [P37](../plans/p37-a-runtime-is-its-registry.md) decision 7 and stop-and-asks (b) and (c),
ANSWERED by the maintainer on 2026-10-15 as recommended; the shape of the keyed refusal inside `check`'s `Finding[]`
— a rule id, `FD-R6`, thrown as `LimitKeyMissing` — is [W163](../work-items/w163-what-start-refuses-that-the-flow-does-not-decide.md)'s
stop-and-ask S1, ANSWERED by the maintainer on 2026-10-15 as recommended (option A), with its two exceptions (E1, the
sub-path exporting the class; E2, `Finding.rule`'s comment) answered YES. It **amends
[ADR 0096](0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md) rules 4 and 5**: `check` returns one
finding no validator rule states, and `start` throws it as its own class rather than as `InvalidDefinition`. It does
**not** resolve [Q248](../questions/q248.md) — a key DERIVED from the flow stays deferred there; this ADR refuses, by
name and before a driver exists, the run that would have needed one.

## Context

**P37 fact 1 measured a defect.** A registry document may declare a group of the built-in type
`KeyedRateLimitGroup`, and the runtime builds it as `new KeyedRateLimitGroup(windows, { id: key })` — with no
`keyFrom`, so the group's key is the task's `limitKey`. Nothing in `src/` sets `limitKey`. The scheduler resolves a
key for every keyed group a task belongs to — the task's `workerGroups` and its pool's `groups` — inside `addTask`,
and THROWS *Missing limit key for group "…" on task "…"* when there is none. So every task of a node reaching such a
group threw: from `start` when the node was the entry, AFTER the run id was spent and a driver built; and from inside
a settlement when it was not, which the driver turns into a run `stopped` with the scheduler's message. Two roads
worked: a `createTask` that sets `limitKey` on the task it builds (measured: `done` `completed`, the group's active keys
`["tenant-a"]`), and a CODE group type (`code.groupTypes`) whose `create` builds a keyed group with a `keyFrom`. The
first is a `StartOptions` member, so it is known at `start` and at no other moment.

**The scheduler is right, and the gap is ours** — confirmed by the maintainer with S1's answer, 2026-10-15. Its throw is
the correct behaviour for a keyed limit with no key: a keyless task would otherwise share one bucket with every other
keyless task, or skip the limit — both found only once something is throttled. What is missing is on this side: a
registry or flow DOCUMENT cannot supply a key ([Q248](../questions/q248.md)). **So no upstream fix is needed and
`doc/scheduler-upstream.md` gains no entry**, and the later fix is ours too — a document-declared key derivation handed
to the group as its `keyFrom`, which the scheduler already accepts. Until then this ADR refuses, by name and early, the
run that would have needed one.

**P37 fact 6 measured the other refusal no flow causes**: `createRuntime` forwarded `defaultRetryPolicy` to every
driver unread, so a malformed one was accepted at construction and `start` threw `FD-V30` from `new Driver` on every
flow, every time — a RUNTIME defect reported against each flow.

## Decision

1. **A task node REACHES a group** when the group's key is in the node's `workerGroups`, or in the `groups` of the
   pool the node runs on — its `pool` when it names one, else its type's default instance — as `resolveRegistry`
   DERIVED that pool. Those two sets are exactly what the scheduler unions to find a task's groups. A pool's
   `residentGroups` are not among them: the scheduler resolves no key for a resident group. *(Measured by W163: a
   built-in keyed group held only as resident is counted in ONE `""` bucket, silently — whether to refuse it is
   [Q619](../questions/q619.md), P37's.)* *(Answered 2026-10-16: option B — refused at `createRuntime` as
   `DerivationRefused`, naming the pool and the group, `spec/flow-definition.md` v0.39,
   [W169](../work-items/w169-a-resident-keyed-group-is-refused-and-p37s-six-stale-sites.md). This rule is unchanged: `FD-R6`
   still does not read `residentGroups`.)*
2. **A node reaching a group of the BUILT-IN type `KeyedRateLimitGroup` is `FD-R6`** (`spec/flow-definition.md`
   section 6), reported by `runtime.check(flow)` as one finding per such node — `{ rule: 'FD-R6', at: <node id>,
   detail }`, the detail naming every BUILT-IN keyed group the node reaches, both working roads and Q248. A group a CODE group
   type builds is never `FD-R6`, keyed or not: its factory is the consumer's, and may give it a `keyFrom`.
3. **`check` reads as `start` given no `createTask`** (stop-and-ask (c)): it has no `createTask` to read, so it
   reports `FD-R6` whatever the caller will pass. A caller who starts with a `createTask` setting `limitKey` filters
   `FD-R6` out of what `check` returns, by its rule id.
4. **`start` and `resume` refuse from the SAME call** (ADR 0096 rule 5, amended). Before a run id is minted or a
   driver built: the findings `check` returns OTHER than `FD-R6` — exactly `validateDefinition`'s — are thrown as
   `InvalidDefinition`, as before; then, when no `createTask` was given, the `FD-R6` findings are thrown as
   **`LimitKeyMissing`**, a `RuntimeError` exported from `fyflow-orchestration/scheduler`, whose `at` is the first such
   node in the flow's order and whose message carries every `FD-R6` finding's detail. **A refused start spends no run
   id.** Given a `createTask`, `FD-R6` refuses nothing: a factory that sets no key still meets the scheduler's own throw,
   and that is the factory's to own.
5. **`createRuntime` holds `defaultRetryPolicy` to `FD-V30` at construction**, first, before the document is resolved
   or anything is built — the check `new Driver` makes, under the same class (`InvalidDefinition`, rules `['FD-V30']`)
   and the same message. So `check` stays a function of the flow and the runtime: a runtime that exists has a valid
   default policy.

## Consequences

**What this makes easy.** A document that declares a keyed group and a flow that reaches it fail together, at the first
call, with the class naming the problem and the message naming both roads out — instead of a bare scheduler `Error`
after a run id is spent, or a run that starts and `stops` at its second node. An editor sees the condition on `check`
before any run exists.

**What it costs.**

1. **`check` reports `FD-R6` to a caller who will pass a `createTask`**, because `check` cannot know (rule 3). That
   caller filters one rule id; the alternative — a `check` option — is a second parameter for one finding, the shape
   stop-and-ask (b) refused for the payload's.
2. **`check`'s `Finding[]` now carries a rule that is not `validateDefinition`'s.** `check` equal to the validator is
   true of every flow that reaches no built-in keyed group — the whole spec corpus among them (P37 prediction 3) — and
   no longer of every flow. `InvalidDefinition`'s `rules` never carry `FD-R6`.
3. **A flow with BOTH a definition defect and an `FD-R6` node is `InvalidDefinition` first**; once fixed, it is
   `LimitKeyMissing`. Two errors in sequence rather than one carrying both, so that `InvalidDefinition` stays exactly
   what `new Driver` throws for the same flow.
4. **A `Driver` built by hand is not covered**: the condition is the RUNTIME's — it reads the derived pools and knows
   which group a built-in factory made — and `src/driver/**` is no P37 item's. Such a driver still meets the
   scheduler's throw in `addTask`.
5. **Rule 5 moves `FD-V30` on `defaultRetryPolicy` from every `start` to `createRuntime`**: a caller that caught it at
   `start` now catches it one call earlier, with the same class and message — **BREAKING** only in WHEN, in 0.8.0.

**What a future reader is likely to try that this forbids.** Deriving the key from the flow or the payload — Q248's,
deferred. Removing `KeyedRateLimitGroup` from the document's built-ins — refused at stop-and-ask (c), option B: it closes
the `createTask` road for a document group, which works today. Refusing `FD-R6` at `createRuntime` when a TYPE's pool
names a keyed group — a runtime may be started only with `createTask`, and construction cannot know.

## Alternatives rejected

| | why not |
|---|---|
| **B — remove `KeyedRateLimitGroup` from the document's built-in group types** | simplest, and closes fact 1's working `createTask` road for a document group, which Q248's future derivation would reopen. Stop-and-ask (c), refused |
| **C — document it, change nothing** | the throw stays bare and late, and an entry node still spends a run id. Stop-and-ask (c), refused |
| **`check(flow, { createTask })`** — `check` told what `start` will be given | (c) says `check` reads as `start` with none; a second parameter for one finding is (b)'s refused shape. W163's S1, refused |
| **The keyed finding under the class name as its `rule`**, with no spec id | a `rule` a consumer filters on that `spec/` does not declare and `check:spec` does not hold; every other `rule` is a spec id. W163's S1, refused |
| **`check` returns `FD-V30` for a malformed `defaultRetryPolicy` on every flow** | a runtime defect reported against each flow. Stop-and-ask (b), refused (ADR 0096) |
