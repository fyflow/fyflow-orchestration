# W35 — A map on real workers

**Status:** todo
**Plan:** [P10](../plans/p10-is-fan-out-one-feature-or-two.md) — *is fan-out one feature or two?*

```
Spec:       spec/runtime-targets.md (RT-R10), spec/task-id.md section 1,
            spec/join-policy.md section 2 — all read, none written
Owns:       examples/**
Inputs:     W32's definition shape, W33's running map, W34's payload contract and
            matrix — each read from that item's OWN file, never from an index.
Outputs:    P10's exit artifact — a map-fanout running end to end on a real
            FyflowScheduler, in BOTH L6 runtimes, its arity taken from the previous
            node's output, its join firing over branches nobody declared, and the
            join's successor carrying what W34 decided it carries.
            A row (or rows) in examples/l6.ts with a declared expectation.
            The measured cost of reverting W32/W33/W34's changes, in L6 failures.
Depends on: W34
Blocks:     nothing
Tests:      examples/l6.ts, run in Node 24 and Deno. Expected values from spec/ and
            from the three items' declared outputs, NOT from what the run printed.
Gate:       L6 in both runtimes, then the spec-conformity pass (two readers)
Reserves:   (none — this item allocates from P10's block only if it raises one)
```

## Scope

**In**

1. **The exit artifact.** A map-fanout on a real scheduler, real workers, end to end, **in both L6
   runtimes** — Node 24 via npm's `dist/`, Deno via `jsr:@fyflow/scheduler@0.3.0`
   ([ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)).
   The arity comes from a worker's return value, so **the number of tasks dispatched is not in the
   definition and not in the harness.**
2. **Task ids nothing declared.** P10 fact 2 measured that 500 run-time indices mint 500 distinct
   ids and that the grammar needed no change. **L6 is the only rung that can show one being
   dispatched to a scheduler that would silently overwrite on a collision** — `spec/task-id.md`'s
   whole reason for being a correctness rule rather than a convention
   ([Q13](../open-questions.md)).
3. **The join firing over branches it never opened**, and its successor carrying W34's answer. This
   is the half a fixture cannot prove: the branches settle in an order nothing controls, and
   `doc/concept.md` section 5 says that order is genuinely non-deterministic.
4. **N = 0 on real workers**, if W33's answer makes it reachable — an empty input list is the case
   `FD-V9`'s arity floor means the static feature can never produce.
5. **The cost of reverting**, measured in L6 failures and reported as a number.
   [W19](w19-a-task-we-did-not-mint-on-a-real-scheduler.md)'s *"restoring ADR 0023 rule 2 costs 13
   L6 failures"* is the shape: a demonstration that costs 0 to revert demonstrated nothing.

**Out** — named rather than left implicit, with where it goes instead

- **Anything in `src/`, `spec/` or `test/`.** All three are W32's, W33's and W34's. If this item
  finds a defect there it **reports it** and the fix is a declared exception with the reason, which
  is the one thing `doc/workflow.md` section 7 rule 2 asks to be visible before it happens.
- **`doc/decisions/**` is on the record-step list**, so a demonstration here **may correct a decision
  it demonstrates** without an exception — v0.7 change 3, which fired for the first time on
  [W19](w19-a-task-we-did-not-mint-on-a-real-scheduler.md), the previous `examples/**` item. **This
  item is the likely next occurrence** for ADR 0036 or ADR 0037, and naming that in advance is what
  made W19's a measurement.
- **The browser.** L6 does not run there and must not be placed where it would be bundled:
  `examples/**` and **not** `test/**`, because the browser bundle globs `test/**/*.test.ts`
  (`RT-R10`).

## Verification

| Clause | How it is run |
|---|---|
| **L6, Node** | `npm run test:l6` |
| **L6, Deno** | `npm run test:l6:deno` |
| **the whole gate** | `npm run gate`, written to a log with `echo "GATE EXIT=$?"` appended, and **read from that line** rather than from a shell wrapper's code or a grep |
| **conformity** | spec first, harness second — and the harness is where the last three `examples/**` items' blocking findings all were |
| **adequacy** | mutation in an isolated copy, walking the rule ids |

**Routing cases** (`doc/workflow.md` section 5 rule 6): **all of them are in scope at L6 and this
item says which it actually ran.** A branch **routed away from its join**
([Q4](../open-questions.md)), **`user_action`** ([Q17](../open-questions.md)), **optional-null**, a
**duplicate task id** ([Q13](../open-questions.md)) and a **nested fan-out**
([Q6](../open-questions.md)) each either has an L6 row here or is named as not run. Silence is not an
answer.

**Rule 8, all five obligations, re-run after the readers.** **This item's directory is where the
evidence for obligation (c) lives** — **eight recorded instances of a value whose PROVENANCE was
wrong, every one in `examples/**`, every one BLOCKING, and not one found by an author.** The
procedure is one sentence and it is the sentence to hold onto: **a provenance probe changes the
SOURCE EXPRESSION and nothing else.** The moment it also edits the projection, the expected literal,
or a second line, it is a rewrite and its survival says nothing.

**And obligation (d), LOOP BOUNDS, has its own recorded failure in this exact file.**
[W23](w23-a-nested-flow-on-real-workers.md) ran five bounds probes deliberately, all five were
caught, **and its reader still found two more** — four L6 rows deletable for one edited number, and a
whole list emptiable for 0 which took [P6](../plans/p6-what-may-share-a-scheduler-with-a-driver.md)'s
exit artifact with it. The author bounded the lists a **row** iterates; the reader bounded the lists
the **file** iterates. **A map is a loop whose bound is the feature**, so this is the item where the
two are easiest to confuse.

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L6 node | | |
| L6 deno | | |
| whole gate | | `GATE EXIT` line, chain entries, FAIL count |
| conformity reader | | |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| | | |

**The exit artifact.** *Where it is, how to reproduce it, and what reverting each of W32's, W33's and
W34's changes costs in L6 failures. A number, not an adjective.*

**What broke.**

**What this taught.**

**Questions raised.**
