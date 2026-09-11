# W58 — What a node says about its own task

**Status:** todo
**Plan:** [P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)

```
Spec:       spec/flow-definition.md section 2 (the node-kind key table, which
            FD-V17 refuses against), section 5 (validation refusals) and
            section 7 (the examples index)
Owns:       src/definition/**, src/driver/driver.ts (the `dispatch` site and
            `DriverOptions` only - W57 has closed before this starts),
            spec/flow-definition.md, spec/README.md, spec/examples/**,
            test/definition/**, test/driver/**, examples/**, AGENTS.md section 3
Inputs:     P16 facts 1 and 2, read from the PLAN's own file and RE-RUN from
            dev-dist/p16/facts.mjs rather than transcribed. ADR 0004 rule 7
            (`optional` is the precedent: a node field passed through to the
            task); ADR 0002 rule 3 (an unknown name fails at instantiation);
            the scheduler's AGENTS.md task table at 0.5.2; Q16's and Q111's
            rows; ADR 0048 (W57) for the widened TaskFactory.
Outputs:    (1) `retryPolicy` and `workerGroups` as DECLARED keys on a `task`
                node, in section 2's key table, each with a refusal:
                FD-V30 (retryPolicy shape: integer maxRetries >= 0, number
                backoffMs >= 0) and FD-V31 (workerGroups: an array of names
                every one of which the registry declares) - ids confirmed
                against section 5 at this item's start, never renumbered
            (2) `Registry.groups`, the third set beside predicates and
                workerTypes, because fact 2 measured that the scheduler
                ignores an unknown group id silently
            (3) `DriverOptions.defaultRetryPolicy`, with the merge rule in
                spec/flow-definition.md section 2: the node wins
            (4) `TaskFactory` widened and `dispatch` passing both through -
                one call site, driver.ts:1839 at declaration
            (5) fixtures: one valid corpus flow carrying both keys, and one
                invalid example per new rule under spec/examples/invalid/
            (6) TWO L6 rows in both runtimes: a worker role that fails ONCE
                and succeeds on retry, asserting `attempts === 1` on the
                outcome record; and a task carrying a group that is
                `resource.blocked` behind a ConcurrentLimitGroup(1) the row
                holds, then runs when it is released
            (7) AGENTS.md section 3's kind table gains the two keys, in a
                `run` snippet that validates a definition carrying them
Depends on: W57
Blocks:     W59
Tests:      expected values from spec/flow-definition.md, never from output.
            Negative controls: revert the passthrough and the retry row must
            report `attempts === 0` and a `user_action` (the role is
            non-optional), and the group row must run unblocked; empty
            `Registry.groups` and FD-V31's valid fixture must be REFUSED.
Gate:       L0-L6 in five runtimes, check:spec (C4 covers the new FD-V ids),
            then spec-conformity pass (two readers)
Reserves:   Q256-Q258, no ADR (P16 decision 3 is the decision, taken at the
            plan; this item adds keys to a table and rules beside them)
```

## Scope

**In**

1. **The two static task fields a node can carry, as declared keys.** Fact 1: the scheduler
   accepts eight fields and the driver passes four; of the four unreachable ones, `retryPolicy` and
   `workerGroups` are static per node, `limitKey` is per workload ([Q248](../open-questions.md)) and
   `handleRejection` is irrelevant to a driver that routes on events. **P16 decision 3 says declared
   keys, not an opaque bag**, on the ground that `FD-V17`'s whole job is refusing a key the kind
   does not declare, and an opaque bag is a hole where a typo lives until run time.
2. **A registry set for group ids.** Fact 2 is the reason: a task carrying `workerGroups:
   ["nope"]` against a scheduler with no such group **runs and settles `done`**, no throw, no
   `resource.blocked`. So the name is caught nowhere downstream, and ADR 0002 rule 3's shape — an
   unknown name fails at instantiation — is the only place it can be. `Registry.groups` is the same
   `ReadonlySet<string> | readonly string[]` the other two sets are.
3. **A global default the node overrides.** The scheduler has no pool-level retry default
   (`WorkerManagerOptions` carries none), so a global default is this library's: a driver option,
   applied when a node declares no `retryPolicy`. **The merge rule is one sentence in section 2 and
   it is asserted**: the node's policy wins, whole, never field-by-field.
4. **This is Q16's TASK half.** The scheduler retries an attempt of a task inside one task id and
   reports it on the outcome record's `attempts` field (`OR-R2` carries it through, `log.test.ts`
   asserts 2 and 3 from fixtures). The id's fourth segment is for a FLOW-level retry
   ([Q111](../open-questions.md)) and this item does not mint one; Q16's flow half stays open, with
   its row corrected to say which half landed.
5. **The retry row is the first non-zero `attempts` a scheduler has ever set at any rung** —
   prediction 2, as corrected by its own grep. `examples/workers/flow-worker.ts` gains a role that
   throws on its first call and returns on its second, and the row asserts the record.

**Out** — named rather than left implicit, with where each goes instead

- **`limitKey`.** Per workload; a `needs`-shaped reference if anything. [Q248](../open-questions.md),
  no owner.
- **Flow-level retry** — re-dispatching a node at attempt 1. Q16's other half, out of the plan.
- **A node TYPE carrying these as defaults** — W59's, and it rides on this item's passthrough.
- **A pool-level default in the scheduler** — an upstream want if anyone needs it; not raised, since
  the driver option answers it here.
- **`FD-V17`'s edge table.** An edge carries `to`, `on`, `when`, `needs` and nothing here; both
  new keys are node keys.

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint` and `npm run typecheck`, each redirected to a file and read by `$?` (section 4, v0.16) |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, redirected and read by exit code. Baseline **27 files / 703 cases in five runtimes** at `8550978`, plus this item's suites |
| L4 | `npm run check:spec` — `spec/` is **7 documents, 44 examples, 92 rules** at declaration; `C4` must report two more definition refusals and `C8` must see `spec/README.md`'s row move with the document's version |
| L6 | `npm run test:l6` and `npm run test:l6:deno`. Baseline **1061 assertions over 42 real runs**; this item adds two rows and states the new numbers in its Record, taken on the tree it ships |
| conformity reader | spec first, code second, re-deriving `FD-V30`'s and `FD-V31`'s expected findings from section 5 before reading the fixtures |
| adequacy reader | **in an isolated copy**, with the author's tree held still (section 6, v0.15). Obligation (e) on `Registry.groups` BOTH WAYS: the validator's set against the scheduler's `resourceGroups` keys is a list-about-a-list, and the bootstrap that would compare them is W59's, so this item states the direction it does NOT close |

**Rule 8 obligation (a) at v0.16: the SHAPES, not only the clauses.** Both keys are exercised on a
task at the top level, on a task inside a `fanout` branch, and on the `branch` task of a `map` —
because a map instance is dispatched N times and a per-node `retryPolicy` is then per instance,
which is the shape the feature was not built for.

**Routing coverage.** A branch routed away from its join ([Q4](../open-questions.md)), no matching
decision edge ([Q10](../open-questions.md)) and a duplicate task id ([Q13](../open-questions.md)) are
**not applicable** — nothing here changes an edge or an id. `user_action`
([Q17](../open-questions.md)) **is covered**: the retry row's role is non-optional, so with the
passthrough reverted its first failure suspends the run, which is the negative control. A nested
fan-out ([Q6](../open-questions.md)) is covered by the fanout-branch shape above.

**Before this item is done it greps the tree for `W58`** outside `doc/` — at this declaration that
returns **0** hits.

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0-L6 | | |
| L4 | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| `retryPolicy` and `workerGroups` keys, `FD-V30`/`FD-V31` | | |
| `Registry.groups` | | |
| `defaultRetryPolicy` and the merge rule | | |
| `TaskFactory` widened, `dispatch` passing through | | |
| valid and invalid fixtures | | |
| the retry row and the group row at L6 | | |
| AGENTS.md section 3 | | |

**What broke.**

**What this taught.**

**Questions raised.**
