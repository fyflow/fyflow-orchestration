# P37 — A runtime is its registry

**Status:** planning — a DRAFT carrying the maintainer's decisions of 2026-10-14/15; NOT declared: no ids reserved, no facts taken, stop-and-asks not yet put
**Question this plan answers:** *what may a running runtime be asked to accept — a flow published
after it started, a transform tried on given input, pool options per instance, annotated schemas —
when its registry is fixed at `createRuntime`?*
**Exit artifact:** *(draft) an L6 run in node 24 and deno that starts, on an already-running runtime
built with no `flows`, a flow with a transform on a plugin's node type, after `runtime.check(flow)`
returned no findings; a schema carrying all four admitted annotations; and `npm run gate:full` EXIT
0.*
**Reserves:** none yet — taken at its declaration, from `npm run state`

## Why this plan, and why now

fyflow-app passes one synthetic warm-up flow per node type to `createRuntime({ flows })` so every pool
carries JSONata (`languageWarmupFlows`, **#6**, P1, *worse in M2*); evaluates a transform on typed input
with its own copy of our adapter (**#7**, P1); wraps node types to give a named pool instance its own
options (**#19**); and strips `writeOnly` from every schema before we see it (`withoutWriteOnly`,
**#20**). It also asked to add node types to a running runtime (**#5**, P2, M2).

## Decisions already taken (maintainer, 2026-10-14/15)

1. **A runtime is its registry.** Node types, pools, groups and languages are fixed at
   `createRuntime`. **`runtime.register()` is DECLINED (#5)**: `fyflow-scheduler` 0.6.0 cannot add a
   pool after construction, and a plugin change builds a NEW runtime — what the app's ADR-0007/0015
   already do. Runs on the old runtime stay there or move by stop-and-resume
   ([P34](p34-what-cancelling-stopping-and-pausing-a-run-do.md)). Checked against fyflow-app's
   `runner.ts` and ADR-0015 on 2026-10-14.
2. **A flow may be checked and started on a running runtime at any time** — `runtime.check(flow)`
   returns every finding `start` would refuse on; *register* means *check, then start*.
3. **#6: a runtime's languages come from its REGISTRY, not from the flows** — every typed pool gets the
   registry's languages built in, which makes a flow published later runnable with nothing extra. This
   **reverses [ADR 0051](../decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
   rule 4** at the cost that ADR priced — every typed pool loads every registered engine (jsonata is
   242 KB in a browser bundle) — and [Q285](../questions/q285.md)'s reopen trigger is met. Whether
   `createRuntime`'s `flows` option goes or stays for early validation is this plan's.
4. **#20: the schema subset admits `title`, `description`, `readOnly` and `writeOnly` as
   annotations** — value shape checked (a string; a boolean), constraining nothing, **with no
   redaction promise**, stated in the ADR and `AGENTS.md`. The bar: *an annotation is admitted if it
   constrains nothing in JSON Schema itself and its value shape is checked.* It supersedes
   [ADR 0053](../decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)
   rule 3, consequence 2 and its rejected *whitelist* row, and
   [ADR 0056](../decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)
   consequence 4, for those four. **Still refused**: `deprecated`, `$comment`, `default` (authors
   expect it applied), `format` (reads as a constraint — Q278's hazard), `$schema`, `$id`. Touches
   `SCHEMA_KEYWORDS`, the subset table in `spec/flow-definition.md`, and `test/definition/schema.test.ts`'s
   two refusal assertions.
5. **#5, #15 and #17 are answered here** — see below.

## Constraints found by the 2026-10-14 evaluation, re-taken at declaration

- **#7** is a third `SampleSource`, `'given'`; nothing on record argues against it.
- **#19** amends [ADR 0054](../decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md);
  after P33 it also carries `cancelGraceMs` and `messages` per instance, and the pool options 0.5.2
  admitted and `DECLARED_POOL_KEYS` does not (`idleCheckIntervalMs`, `requeueFailedTasks`,
  `maxWorkerRestarts` — P33 fact 5).
- **While two runtimes overlap after a rebuild**, their pools and resource groups are separate: a
  rate limit may briefly be exceeded and a model loaded in `setup()` is loaded twice. Recorded as a
  consequence of decision 1, not built.

## Answered here, not built

| # | ask | answer |
|---|---|---|
| **#5** | add node types to a running runtime | **Declined** — decision 1; `runtime.check` (decision 2) and #6 (decision 3) are what make a running runtime take any flow its registry can run |
| **#15** | a published JSON Schema for `FlowDefinition` | **Deferred, revisit before the app's M4.** Only a SHAPE schema is expressible — the cross-node `FD-V` rules are not JSON Schema — so `validateDefinition` stays the authority; #20's `description` is what makes a later shape schema useful to an agent |
| **#17** | per-key rate limits from a flow | **Deferred** with [Q248](../questions/q248.md), whose trigger is met. **Its declaration MEASURES the suspicion first**: nothing sets `limitKey`, so a document-declared `KeyedRateLimitGroup` a node uses may make `addTask` throw — inferred from the types, never run. If it does, the fix is this plan's |

## Scope (draft)

**In** — `runtime.check`, languages from the registry (#6), `'given'` samples (#7), pool options per
instance (#19), the four annotations (#20); the specs, ADRs and `AGENTS.md`.

**Out** — `runtime.register` (#5), a `FlowDefinition` JSON Schema (#15), keyed limits from a flow
(#17) unless the measurement above finds a defect; shared resource groups across runtimes.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q285](../questions/q285.md) | which pools carry a language — reopened by decision 3 | P37 |
| [Q248](../questions/q248.md) | per-key limits from a flow — #17 | deferred |

## Record

*Filled in at the join, after the work items are merged.*
