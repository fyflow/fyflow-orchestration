# spec/outcome-record — the log the driver writes

**Status:** v0.9 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md).
**v0.9 is [W54](../doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) under
[P15](../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md), and it ANSWERS
[Q22](../doc/open-questions.md), open since P1.** Section 4 gains **`OR-R11`** — *a result is a
VALUE, not an OBJECT* — plus the three-way cloneability boundary, the re-taken `OR-R2` timings with
their METHOD, the measured reason **nothing warns**, and the price of bounding
`RunState.nodes[*].result`. **It corrects a FALSE sentence**: this document said `structuredClone`
*throws on a class instance with behaviour*, and it does not — it clones it **lossily**, with the
prototype and the methods gone and no error, which is the silent case the loud one was standing in
for. **`OR-R2` and `OR-R6` are unchanged**, which is
[P15](../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md) prediction 3's conclusion
confirmed — while its stated REASON, *a driver cannot tell*, is measured FALSE and replaced by one
about coverage and cost.

**v0.2 acts on the W1 spec-conformity pass**: the
resolution record arrives from
[ADR 0004](../doc/decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
rule 6 (finding B1), and findings D8 and D11 are addressed in place. **v0.3 acts on the second
pass**: section 6 defines the **effective outcome**, without which routing after a resolution had
three conformant readings. **v0.5 corrects how a run terminates** — the third pass measured that a
`throw` from a scheduler listener never reaches anybody. **v0.4 acts on the third**: `observedAt` still had two.
**v0.6 is [W18](../doc/work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md)
under [P6](../doc/plans/p6-what-may-share-a-scheduler-with-a-driver.md)**, and it takes a decision
about a class that had reached `OR-R10`'s path **without ever being named as a rule**:
[ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
moves `InvalidTaskId` off the listener boundary entirely, to
[`ID-R5`](task-id.md). `OR-R10` itself is unchanged; what changes is the list of what reaches it, and
section 6 now states that list rather than leaving a fourth class to arrive by accident.

**v0.7 is [W36](../doc/work-items/w36-the-scheduler-pin-moves-to-0-5-1.md), and it is a VERSION
re-dating rather than a rule change.** The `fyflow-scheduler` pin moved 0.3.0 to 0.5.1; section 3's `OR-R3` walkthrough is re-dated from 0.3.0 to 0.5.1.
**No rule id, no rule text and no test owed changed** — `core/FyflowScheduler.ts` is **byte-identical**
between the two versions, so every line this document cites is unmoved and every claim it makes about
0.3.0 is true at 0.5.1. *(The bump was first shipped with these documents edited and NOT re-versioned,
which left `spec/README.md`'s column unchanged and made `check-spec`'s `C8` vacuous for the whole
change — the one check that exists to notice a stale version row. W36's conformity reader.)*

**v0.8 is [W37](../doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md), and it is the SAME re-dating one version on.** The pin moved 0.5.1 to **0.5.2**, which is the fix for [S9](../doc/scheduler-upstream.md) — the first item in that register ever raised and fixed. **`core/FyflowScheduler.ts` is byte-identical between 0.5.1 and 0.5.2 as well**, 1851 lines with zero changed, so every line this document cites is unmoved for a second consecutive bump; the whole diff is **six files** — four `import type` splits, `deno.json` gaining `verbatimModuleSyntax: true`, and `README.md`. *(This read "two `import type` lines" and "1850": the first was measured over four downloaded files and stated of the whole diff, the second counts newlines in a file whose last line is unterminated. W37's conformity reader, and `doc/workflow.md` section 1 rule 5's writing clause both times.)* No rule id, no rule text and no test owed changed.

**Normative.** This document is what
[ADR 0007](../doc/decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
rule 1's *"declared fields"* means.

> ADR 0007's *Consequences* names the failure this document exists to catch: a `{...e.detail}`
> shallow spread **looks like compliance and is not** — it copies the top level and still aliases
> `payload`, `result` and `error`. Section 2 is a field-by-field source table so a reviewer can
> tell the two apart by reading the field list, without reasoning about aliasing.

---

## 1. The log

The log is an ordered, append-only sequence of **records**, discriminated by `kind`. Two kinds
exist:

| `kind` | written when | written by |
|---|---|---|
| `"outcome"` | a scheduler task settles | the driver's event listener |
| `"resolution"` | an external actor resolves a suspended node | the driver's inbound API |

Both are plain data: no library types, no getters, no object reachable from an event `detail`. Run
state is a pure fold of this sequence (`doc/concept.md` section 5), and **a resolution is a record
rather than a mutation** precisely so that stays true (ADR 0004 rule 6).

```jsonc
{
  "kind":               "outcome",
  "taskId":             "r7c1f:scoreB:1:0",
  "terminalState":      "done",          // "done" | "failed" | "user_action"
  "result":             { "score": 0.41 },
  "error":              null,
  "attempts":           0,
  "schedulerTimestamp": 1756512000123,
  "observedAt":         1756512000124,
  "startTime":          1756511999880,
  "endTime":            1756512000121,
  "executionTime":      238.4
}
```

The record carries **`taskId` and nothing derived from it.** The run, node, branch path and attempt
are recovered by the total parse in [spec/task-id.md](task-id.md). Storing them as well would be
two sources of truth for one string.

## 2. Where each outcome field comes from

`e` is the listener's event; `d` is `e.detail`, which for `task.completed`, `task.failed` and
`task.user_action` **is** the live `FyflowTask` (`../fyflow-scheduler/core/FyflowScheduler.ts:857,
907, 909, 1139, 1141`; `AGENTS.md` section 6). Every expression below is evaluated **synchronously,
inside the listener**.

| field | type | source | |
|---|---|---|---|
| `kind` | `'outcome'` | constant | |
| `taskId` | string | `d.id` | |
| `terminalState` | `'done' \| 'failed' \| 'user_action'` | `d.state` | **never** the event name — see `OR-R3` |
| `result` | structured-cloneable value \| `null` | `terminalState === 'done' ? structuredClone(d.result) : null` | the guard is part of the expression, not a caveat on it. See `OR-R2` and section 4 |
| `error` | string \| `null` | `d.error ?? null` | already a string on the task — `task.error = error.message` (`core/FyflowScheduler.ts:889`). The `Error` object never reaches a listener |
| `attempts` | number | `d.attempts` | the **scheduler's** retry count, not the flow-level attempt in the id |
| `schedulerTimestamp` | number | `d.timestamp` | `Date.now()` stamped immediately before dispatch. A **mutable field on the live task** |
| `observedAt` | number | the driver's own `Date.now()` | ADR 0007 rule 4. Not derived from, and not interchangeable with, `schedulerTimestamp` |
| `startTime` | number \| `null` | `d.startTime ?? null` | set at dispatch, not at worker pickup |
| `endTime` | number \| `null` | `d.endTime ?? null` | |
| `executionTime` | number \| `null` | `d.executionTime ?? null` | worker-measured ms, excludes queue wait |

**Eleven fields, and the list is closed.** A record with a twelfth field is not this record; a
record with a field named `state`, `payload`, `task` or `detail` is a review finding.

## 3. Rules

| id | | Test owed by |
|---|---|---|
| `OR-R1` | **Every field is read inside the listener.** No `e`, no `e.detail`, and no object reachable from `e.detail` is retained past the listener's return. A shallow spread of `d` does not satisfy this rule. Test: settle a task, mutate the live `FyflowTask` after the listener returns — including `timestamp`, `result` and `error` — and assert every field of the written record is unchanged. **A `{...e.detail}` implementation must fail this test** | W3 |
| `OR-R2` | **`result` is deep-copied with `structuredClone`.** It is the one field whose *value* is a reference the producer may still hold — see section 4. Test: an inline worker that returns an object and then mutates it, asserting the record is unchanged | W3 |
| `OR-R3` | **Exactly one record per settlement, keyed on `d.state`.** `task.failed` with `d.state === 'user_action'` writes **nothing**; the `task.user_action` that follows for the same object writes the record. `task.failed` with `d.state === 'failed'` (an `optional` task) writes the record, and no `task.user_action` follows. Test: one optional and one non-optional task exhausting retries, asserting one record each and the right `terminalState` | W3 |
| `OR-R4` | **`task.running` and `task.progress` produce no record of either kind.** They are not settlements and they are not resolutions. Whether the driver logs them at all, and in what shape, is [Q26](../doc/open-questions.md). Test: a task emitting progress, asserting the log length is 1 | W3 |
| `OR-R5` | **The log is ordered by append, never sorted by a timestamp.** Both stamps are `Date.now()` reads: two settlements can share a millisecond, and `schedulerTimestamp` is written by the scheduler while `observedAt` is written by us. Append order is the only total order we have, and the driver is what produces it (`doc/concept.md` section 5). Test: fold a log whose `schedulerTimestamp` order differs from its append order, asserting the fold follows append order | W2 |
| `OR-R7` | **A resolution is appended, never applied.** Nothing outside the driver's inbound API writes to run state, and the fold derives the resumed path from the record alone. Test: fold a log containing a resolution twice and deep-compare, then assert the same run state is reached by folding from scratch | W2 |

### OR-R3, spelled out, because the event names lie

At 0.5.2 a non-optional task out of retries sets `state = 'user_action'` and then dispatches
**both** events with the same object (`core/FyflowScheduler.ts:894-910`, and again at `:1130-1142`
on the orphaned-task path):

| `d.state` at dispatch | events fired | records written |
|---|---|---|
| `done` | `task.completed` | 1, `terminalState: 'done'` |
| `failed` (task was `optional`) | `task.failed` | 1, `terminalState: 'failed'` |
| `user_action` (non-optional, retries spent) | `task.failed`, **then** `task.user_action` | **1**, `terminalState: 'user_action'`, written on the second |

A driver keying on the event name writes two records for the third row and routes a
human-intervention case down an error edge. `AGENTS.md` section 5 still says *"`task.failed` fires
once per failed task"*, which reads as though the third row does not fire it; **trust ADR 0007
rule 2 over that sentence.**

**Row two requires `optional: true` on the node.** Both `state = 'failed'` assignments live inside
`if (task.optional)`, so without it the row never occurs — which is ADR 0004 rule 7 and
`spec/flow-definition.md` section 2.

## 4. OR-R2 — why `result` is the exception, what it costs, and what it is not

ADR 0007's *Consequences* resolves its tension with ADR 0001 by copying *only the fields the log
declares*, **never by a deep clone of a `FyflowTask`**. `result` is where that resolution runs out,
and this is the one place this spec adds work that ADR 0007 did not anticipate:

- `d.result` is whatever a worker returned. For a **thread** pool it has already crossed a
  structured-clone boundary and is ours. For an **inline** pool it is the worker's own object,
  returned by reference, and a worker that keeps a handle on what it returned can mutate the
  contents of a record we have already written. Copying the *field* copies the reference.
- Ten of the eleven fields are primitives, constants or `null`, so `OR-R1` is free for them.
  `result` is the only one that is not.

**So `result` is deep-copied and the other ten are not**, which keeps the hot-path cost proportional
to the payload a flow actually moves rather than to the task object. The copy is unconditional —
including for thread pools, where it is redundant — because a uniform boundary is cheaper to review
than a documented exception, which is ADR 0007 rule 5's reasoning applied to a second case.

### `result` is structured-cloneable, which is broader than JSON

**Stated because the two are easy to conflate and this document is otherwise plain JSON.**
`structuredClone` faithfully preserves `Date`, `Map`, `Set`, `RegExp`, `BigInt`, typed arrays and
`undefined`. None of those is a JSON value, and none of them throws. So:

1. **`result`'s declared type is *a structured-cloneable value*, not *a JSON value*.** A record
   whose `result` holds a `Date` is conformant.
2. **A hand-written fixture may therefore need non-JSON literals.** `doc/workflow.md` section 5
   rule 4 says fixtures are hand-written; it does not say they are JSON files, and outcome-log
   fixtures are TypeScript.
3. **Durability ([Q15](../doc/open-questions.md)) needs its own encoding**, and `JSON.stringify` is
   not it. This is a cost of the choice and it is recorded rather than discovered later.

The rejected alternative was a JSON round-trip, which would make the record literally plain JSON and
keep fixtures trivial — at the price of a `Date` silently becoming a string and `undefined`
vanishing, with no error. **Silent data loss in the log a run is folded from is worse than a
fixture that needs a `new Date()` in it.**

**The refusal that comes with it, and the SECOND boundary nobody had written down.** This document
read: *"`structuredClone` throws on a function, a class instance with behaviour, or anything else
non-cloneable."* **The middle clause is FALSE, and it is false in the direction that matters** — it
names the silent case as though it were the loud one.

**`OR-R6` is the loud half and it is unchanged.** A node result that cannot be cloned cannot be
logged, cannot be handed to a predicate deterministically, and could never be persisted.

| id | The run terminates when | Test owed by |
|---|---|---|
| `OR-R6` | `structuredClone(d.result)` throws. The run fails with `UncloneableResult` naming the task id. **At the LISTENER boundary** — the resolution path is `OR-R12` in section 5 and behaves differently. Test: a worker returning a function, asserting the named failure and that no record was written | W3 |

### `OR-R11` — a result is a VALUE, not an OBJECT

**Stated here for the first time, and it is [Q22](../doc/open-questions.md)'s real answer.** That row
asks whether *a result must be structured-cloneable* is a constraint on workers or on the driver, and
the fork is the wrong shape: it is the driver's constraint — `OR-R2`, unchanged — and the question an
author actually hits is not *may I return this* but **what arrives**.

| id | | Test owed by |
|---|---|---|
| `OR-R11` | **What crosses `OR-R2`'s clone is a value's own enumerable string-keyed DATA, plus the internal state of the built-in types the structured-clone algorithm names. Everything else does not cross, silently.** What does not: the **prototype** (so methods, `instanceof` and privacy go with it), **accessors** (a getter is read once and arrives as the data it returned), **non-enumerable** own properties, **symbol-keyed** properties, **property attributes** (a frozen object arrives unfrozen), and an **`Error`'s own extra fields** (the algorithm serialises `name`, `message`, `stack` and `cause` and nothing else). **A worker returning `new Score(0.9)` hands its successor `{value: 0.9}` with `isHigh` undefined**, and `RunState.nodes[*].result` reports the same — measured end to end through a real `Driver`, with **zero** run failures reported. The rule is not that this is wrong; it is that it is **the contract**, so a worker returns data and a consumer reads data. Test: at ladder L1, in **all five runtimes**, every row of the table below asserted for the property that row names — a refusal for the refused rows, a content round-trip for the intact ones, and the NAMED loss for each lossy one — because the boundary was measured in one runtime and a runtime that refused a class instance would make `OR-R6` fire where this rule says it does not; and at L2, the end-to-end case through a `Driver`, plus `normalizeEvent` in isolation, which is `OR-R2`'s own site and the only place the attribution can be pinned | **[W54](../doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md)** |

**The boundary, one row per shape.** *(Grouped into three rows until this version, and the grouping
is what hid the rest: the groups did not close arithmetically, and "faithful" was standing for
"did not throw and kept its prototype" rather than for "the value crossed". W54's two readers, from
opposite ends.)* Each first cell is the shape; `test/fold/result-value.test.ts` compares this column
to its own both ways, so a row cannot be added here without an assertion or asserted without a row.

| result shape | `structuredClone` | what does NOT cross |
|---|---|---|
| `a function` | **refused** | — `OR-R6` stops the run |
| `an object holding a function` | **refused** | — |
| `a Symbol` | **refused** | — |
| `a Promise` | **refused** | — |
| `a WeakMap` | **refused** | — |
| `a plain object` | **intact** | nothing |
| `an array` | **intact** | nothing |
| `a Date` | **intact** | nothing |
| `a Map` | **intact** | nothing |
| `a Set` | **intact** | nothing |
| `a RegExp` | **intact** | nothing |
| `a typed array` | **intact** | nothing |
| `a BigInt` | **intact** | nothing |
| `undefined` | **intact** | nothing |
| `null` | **intact** | nothing |
| `a cyclic object` | **intact** | nothing — **the cycle survives as a cycle** |
| `a class instance with a method` | **lossy** | the prototype, so the method and `instanceof` |
| `a class instance with a getter` | **lossy** | the accessor — it is read once and arrives as data |
| `a frozen class instance` | **lossy** | the prototype **and** the frozen-ness |
| `a frozen plain object` | **lossy** | the frozen-ness — and this row is why "intact" cannot mean "kept its prototype" |
| `an object with a non-enumerable own property` | **lossy** | that property, entirely |
| `an object with a symbol-keyed property` | **lossy** | that property, entirely |
| `Object.create(proto)` | **lossy** | the prototype |
| `a class instance nested in a plain object` | **lossy** | the INNER prototype. The outer object is a plain object and crosses intact, which is what makes this row the one a cheap detector cannot see |
| `a subclass of Array` | **lossy** | the subclass prototype and its own methods. `Array.prototype` and the elements DO cross, so `Array.isArray` still holds |
| `a subclass of Error` | **lossy** | the subclass prototype, its own methods, **and its own extra fields** |
| `an Error` | **lossy** | its own extra fields. `Error.prototype`, `name`, `message`, `stack` and `cause` cross; anything else a worker set on it does not |

**Five refused, eleven intact, eleven lossy — twenty-seven rows.** *(That split read *five, ten,
twelve* in the first draft of this version, and the suite's own comparison against this table caught
it on its first run — which is the point of comparing the two lists rather than copying one.)* *(It was asserted beside it, as "14 of 14 … none of the eight this
document blesses", and 8 + 4 does not make 14. Four documents carried four different sets. W54's
conformity reader.)*

**Why nothing warns, and the reason is measured rather than asserted.** A detector is possible, which
[P15](../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md) prediction 3 said it was not:
comparing `Object.getPrototypeOf(original)` to `Object.getPrototypeOf(clone)` fires on every lossy row
above **whose loss is at the top level**, and on none of the intact ones — `Map`, `Date`, `Set`,
`RegExp`, typed arrays and the cyclic case all stay quiet. **So prediction 3's stated reason — *a
driver cannot tell* — is FALSE.** It is declined on two measurements instead:

1. **It is blind to more than half the lossy rows, including the case a worker actually writes.** The
   top-level check cannot see a **nested** instance, a **non-enumerable** or **symbol-keyed**
   property, a lost **frozen-ness**, or an **`Error`'s** dropped fields — for each of those the
   prototype it compares is unchanged. `{ok: 1, score: new Score(0.9)}` is a plain object at the top
   level, so the cheap check is **quiet** while `score.isHigh` is gone.
2. **The complete check costs the same order as the clone it is checking.** A recursive walk comparing
   prototypes pairwise, run 21 times per reading and read five times at each of two payload sizes
   (N = 100 and N = 1000 items over a 138.6 KiB value), measures **23-60% of one clone** where the
   top-level check measures **0.02-0.65%** — on the hot path, once per settlement. That is the order
   [W46](../doc/work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md) measured for a
   size walk and declined on the same ground. **The bands are what reproduce; the individual readings
   do not**, and a first version of this paragraph quoted narrower ones taken from a single run —
   which is this section's own closing sentence broken inside this section. [Q179](../doc/open-questions.md).
3. **And there is nothing for it to say that is not already this rule.** A report would fire on every
   correct use of a class as a transfer shape, which is the ordinary way to write a worker; it would
   be `OR-R11` restated once per settlement rather than a diagnosis, which is exactly W46's finding
   about a predicate that *fires on 3 of 3 intended uses*.

**So the answer is: it is written down, and it is the one thing a worker author has to know.**
`AGENTS.md` section 10 is where a consumer meets it, as an executed snippet.

### What `OR-R2` costs, and the method the numbers were taken by

**[Q190](../doc/open-questions.md)'s precedent: the measurement goes in the section, with the
method.** Every figure below is **one case per process**, which is
[W46](../doc/work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md)'s settled method —
that item measured accumulation in one process at up to **4.4x** and run order at **nothing**, so a
one-process table's last row carries the whole accumulation. Node 24, over a **138.6 KiB** payload of
1000 items:

| | median |
|---|---|
| **the shipped single edge-hop clone** — `OR-R2`, once per settlement | **0.58 ms** |
| a clone per **map** instance at N = 1000 — what `JP-R11` would cost if a map cloned the whole value | **499.16 ms** |
| each instance receiving its own item, no clone | **0.02 ms** |
| a clone of that item — what `JP-R11` does cost | **1.68 ms** |

**The ratio is ~860x and it is QUADRATIC for a map**, because a map's arity and its payload grow
together; for a `fanout` over 278.2 KiB it is **linear in a number the document declares** — 2.61 /
3.71 / 5.91 / 11.79 ms at arity 2 / 3 / 5 / 10, against 1.17 ms for one clone.

**What reproduces and what does not, stated because a register row quoting an absolute is quoting a
method.** The SHAPE reproduces exactly — linear for a `fanout`, quadratic for a `map` — and so does
the ratio class, ~800x both times. **The ABSOLUTES do not**, even under the settled method:
[Q22](../doc/open-questions.md)'s row quoted 1.50 / 2207.94 ms from
[W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md), taken accumulated in
one process; P15's declaration re-took them at 0.64 / 516.77; this version reads 0.58 / 499.16, and
the `fanout` row is **1.8x apart from P15's on the same fixture and the same method**. So
[Q179](../doc/open-questions.md) binds harder than *one process versus many*: **quote the shape and
the ratio, never the millisecond.**

### What bounding `RunState.nodes[*].result` would cost — priced, not taken

**Named here because `OR-R2`'s copy is what makes the result big enough to be worth bounding, and
because `RN-R13` in [run-state.md](run-state.md) section 7 says a run retains the whole of every
one.** Three readers touch a stored result: the **edge hop**, which reads every one once and is
finished the moment the successor is dispatched; **reference resolution**, which reads only what a
`needs` names — **15 of 155** corpus task nodes, so **140 (90%)** are named by none *(14 of 124, 110 and 89% when W54 measured it; 14 of 136, 122 and 90% after the three flows W58 added; 14 of 150, 136 and 91% after the three flows W59 added; the one flow [W61](../doc/work-items/w61-what-a-transform-is.md) added carries five task nodes and ONE `needs`, and `test/fold/result-value.test.ts` re-derives every one of these four numbers from both corpora on every run — which is how the sentence was told it had moved)*; and the
**fold**, which is `RunState.nodes[*].result` and reads every one, for ever.

**So after the hop, a result no `needs` names has exactly one reader left, and it is the public
surface.** The saving is the whole of every result: blanking them takes a 4-task chain's fold input
to a floor of **284 B** whatever the payload, so the factor is **1.0 / 4.7 / 15.5 / 58.7 / 231.8** at
0 / 1 / 4 / 16 / 64 KiB results. *(P15 quotes **8.7x** from one fixture; the factor is
`(bytes returned) / (record overhead)` and is not a constant.)*

**What it costs is a VOCABULARY, not bytes, and that is the finding.** `RunState` has no way to say
*withheld*, because both candidates are taken and both mean something else:

| | reachable today | means |
|---|---|---|
| `result: null` with `state: 'done'` | a worker returned `null` | it returned nothing |
| `result: null` with `state: 'failed'` | `OR-R2`'s own guard | it did not succeed |
| `result: undefined`, key **present** | a worker returned `undefined`, **or** the detail carried no `result` at all | it returned nothing |

So a withheld result needs a **fourth** encoding — a new field, a new node state, or a sentinel —
and without one a consumer cannot tell *we dropped it* from *it returned nothing*. **That is
[ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
rule 2's plausible-wrong-answer shape in a second structure**: not a fold that cannot tell it was
handed a short log, but a `RunState` that cannot tell a consumer what it is not being given.

**Not taken here.** P15 decision 1 makes a change to what a consumer reads the maintainer's, and its
stop-and-ask list is where it goes.

**What reads it, counted rather than assumed.** `AGENTS.md` — the consumer reference, every snippet
of which the gate executes — **never reads it**: all four of its run-state reads are `state.outcome`.
In the rest of the tree there are **three** readers, and the third is the one that decides the price:
`test/fold/fold.test.ts` and this item's own suite, and **`examples/l6.ts` — ladder L6, driving a
real `FyflowScheduler`, where it is an ASSERTION**. So taking the bound breaks L6 rows, which is a
materially different price from *two tests*. *(This paragraph said "two tests" until W54's conformity
reader counted them.)* **And the surface is wider than the field**: `nodeOf(state, taskId)` is
exported from `src/fold/run-state.ts` and reaches the package root through `index.ts`'s `export *`,
so a consumer reaching a stored result has an accessor as well as a field — [Q101](../doc/open-questions.md)'s
shape, and neither this section nor [Q239](../doc/open-questions.md) named it before.

**The evidence against is the vocabulary table above**, and it is a shape change rather than a flag.

**Whether this constraint belongs on the driver or on workers is [Q22](../doc/open-questions.md), and
it is ANSWERED: on the DRIVER, unchanged, with `OR-R11` as the half the fork did not name.**
The alternative — declare it a contract that a worker must not retain what it returns — is cheaper
and unenforceable, and this repo has already rejected that shape of answer once:
[Q9](../doc/open-questions.md) says *"please write pure functions" is not a mechanism*. The cost is
real and is now measured above rather than deferred. *(This paragraph read *"is [Q19](../doc/open-questions.md)'s
to measure"*, corrected by [W53](../doc/work-items/w53-what-a-run-retains-that-nothing-reads.md)'s
conformity reader, and then *"the cost is real"* with no number, corrected here.)*

## 5. The resolution record

Written when an external actor resolves a node that settled `user_action` and suspended
(ADR 0004 rules 3-6). **This library does not obtain the decision** — it makes the suspended path
visible and accepts the answer.

```jsonc
{
  "kind":         "resolution",
  "taskId":       "r7c1f:review:-:0",
  "resolvedAs":   "done",              // "done" | "failed"
  "result":       { "approved": true },
  "error":        null,
  "actor":        "ops:jane",
  "observedAt":   1756512300500
}
```

| field | type | |
|---|---|---|
| `kind` | `'resolution'` | |
| `taskId` | string | the suspended task. Must name a task whose last record is an `outcome` with `terminalState: 'user_action'` — `RS-R1` |
| `resolvedAs` | `'done' \| 'failed'` | the terminal state the node is treated as having from here. Routing then runs under `spec/flow-definition.md` section 3 as though the node had settled that way |
| `result` | structured-cloneable value \| `null` | `null` unless `resolvedAs` is `done`. Deep-copied on the way in, for the same reason as `OR-R2` |
| `error` | string \| `null` | `null` unless `resolvedAs` is `failed` |
| `actor` | string | opaque. The library never interprets it and never authenticates it ([Q29](../doc/open-questions.md)) |
| `observedAt` | number | the driver's clock. There is **no** `schedulerTimestamp`: no scheduler was involved |

**There is no `attempts`, `startTime`, `endTime` or `executionTime`.** A resolution is not an
execution, and carrying those fields as `null` would invite a fold to treat the two records as one
shape.

### `OR-R12` — an uncloneable resolution value throws to the CALLER, and does not fail the run

**Recorded rather than decided, and it is a behaviour that was in no document.** Section 4's
`OR-R6` was stated of the whole boundary and holds only at the **listener**: the clone above is
`structuredClone(value.result ?? null)` with **no guard**, where the listener's is wrapped.

| id | | Test owed by |
|---|---|---|
| `OR-R12` | **A resolution whose value is not structured-cloneable throws out of `resolve()` to its caller** — a `DataCloneError`, not an `UncloneableResult` — and the run is **not** failed: nothing is appended, `OR-R10` does not fire, `onRunFailure` is not called, and the driver keeps routing. **The asymmetry is not arbitrary**: a settlement arrives from the scheduler with nobody to throw to, so `OR-R6` must turn it into a run failure; a resolution is a **synchronous call the consumer made**, and a throw reaches the one party that can fix it. **What is NOT decided here is whether the two should be the same** — the class differs, the reporting channel differs, and a `DataCloneError` is in neither section 6's enumeration of what reaches `OR-R10` nor `AGENTS.md`'s executed error-class snippet ([Q241](../doc/open-questions.md)). Test: at ladder L2, `resolve()` with an uncloneable value, asserting the throw, that no record was appended, that `onRunFailure` saw nothing, and that a later settlement still routes | **[W54](../doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md)** |

*(Found by W54's conformity reader, on this item's own subject: a sentence naming one boundary as
though it were the whole boundary. `src/driver/**` is
[W53](../doc/work-items/w53-what-a-run-retains-that-nothing-reads.md)'s `Owns`, so this version
writes the behaviour down and raises the question rather than changing it.)*

| id | | Test owed by |
|---|---|---|
| `RS-R1` | **A resolution for a task that is not suspended is refused.** *Suspended* means the task's **last** record is an `outcome` with `terminalState: 'user_action'` — so a task already resolved is not suspended, and **a second resolution is refused like any other**. The record is not appended and the run is unaffected: this is a rejected command, not a run failure, because it comes from outside and a caller can retry. Test: resolve a `done` task, an unknown task id, and **a task that was already resolved** — asserting nothing is appended in all three. An implementation keyed on *"has a `user_action` record"* rather than *"last record is"* passes the first two and fails the third | W3 |
| `RS-R2` | **A resolution supplies an outcome; it never re-dispatches the node.** *"Try that node again"* is flow-level retry, which is [Q16](../doc/open-questions.md) and out of P1's scope; *"send it somewhere else"* is a second routing mechanism competing with the definition. Both are [Q28](../doc/open-questions.md) | W3 |
| `RS-R3` | **`resolvedAs: 'failed'` routes exactly as an `optional` node's failure would** — through `on: ["failed"]` edges, or ending the path if none is eligible. A human declining the work and the flow handling a failure are the same downstream shape, deliberately. **Note this is the only road by which a non-`optional` node reaches an `on: ["failed"]` edge** (`spec/flow-definition.md` section 2) | W3 — it is a routing rule, and routing is `src/driver/**` |

**`resolvedAs` has two values, not three.** A resolution cannot leave a node in `user_action`; that
is what *not resolving it* is. And it cannot invent a fourth state, because the run-level outcome
vocabulary is run state's ([Q25](../doc/open-questions.md)) rather than this record's.

## 6. How a run terminates — corrected

**Three rules in this layer say a refusal "terminates the run": `FD-R1`, `ID-R1` and `OR-R6`.
A `throw` cannot do that, and until W3's third conformity pass all three were implemented as one.**

Every one of them is reached from inside a `scheduler.addEventListener` callback, and
`EventTarget.dispatchEvent` **discards a listener throw**. Measured on Node 24 against
`../fyflow-scheduler/core/FyflowScheduler.ts:212` (`export class FyflowScheduler extends
EventTarget`): the remaining listeners still run, `dispatchEvent` returns normally, and the error
resurfaces out of band on `process.nextTick`. In a browser it becomes a `window.onerror` report and
the page carries on.

So the run would have continued draining with the outcome record already appended, routing
abandoned, and **nothing told** — which is the silent stop `spec/flow-definition.md` section 3
refuses on P1's own validity grounds, and the third time that signature has appeared in this layer.

| id | | Test owed by |
|---|---|---|
| `OR-R10` | **A refusal that terminates a run is caught at the listener boundary, reported, and stops the run.** The driver marks the run failed so nothing routes for it again, and reports through a failure callback carrying the refusal's name. **It does not throw out of a listener**, because that is discarded. The refusal classes and their names are unchanged; what changed is that terminating a run is a thing the driver *does* rather than a thing it throws. Test: each of `FD-R1`, `ID-R1` and `OR-R6` driven through a real `EventTarget`, asserting the failure is reported and that no further task is dispatched for that run | W3 |

**A caller-initiated refusal still throws.** `Driver.start()` is called by the consumer, not by a
listener, so it both reports and rethrows: the caller is on the stack and can act on it. The
distinction is the stack, not the rule.

**`InvalidTaskId` is not one of these and no longer reaches this path.** It was never named as a rule
here — `parseTaskId` raised it at the listener and it arrived at `onRunFailure` alongside the three
above, which is how it came to be treated as a fourth without a decision ever being taken.
[ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
takes one: an inbound id that does not parse was minted by no driver, so it is **[`ID-R5`](task-id.md)**
— reported on its own channel and dropped — rather than a refusal of this run's. **No raise site the LIBRARY reaches can put it in a `RunFailure` any
more.** `InvalidTaskId` is raised at seven sites, all in `src/driver/ids.ts` — two in `buildTaskId`
and five in `parseTaskId` — and after ADR 0027 the four **callers** that could reach the listener's
failure path are all outside it: `buildTaskId`'s two calls in the driver, unreachable from a
definition `FD-V16` validated *because `FD-V16`'s charset and `ID-R2`'s are the same expression*,
and `src/fold/run-state.ts`'s two `parseTaskId` calls, unreachable while
[ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) keeps the
fold fed by a driver that appends only ids it minted. **This is a claim about the library's own raise
sites and not about the field**: `RunFailure.kind` is `err.constructor.name`, so consumer code that
throws an `InvalidTaskId` inside a predicate or a `describe` still produces one — and section 9 of
`AGENTS.md` now recommends `parseTaskId` in a `try`/`catch` to consumers, which is where that would
come from. **That last one is a live constraint
rather than a note**: ADR 0027 reports through a callback and deliberately **not** through a new
`FoldInput` kind, because an input carrying the offending string would make `fold()` — a pure
function — throw.

## 7. The effective outcome

**Routing never reads the log directly.** It reads one derived record per node, and this section is
what makes that record well defined.

> **effective outcome** of a `task` node — the outcome record of its settlement, unless a resolution
> record for the same `taskId` follows it in the log, in which case it is that settlement record
> with `terminalState`, `result` and `error` replaced by the resolution's.

| field | comes from |
|---|---|
| `kind` | `'outcome'`. An effective outcome has an outcome record's shape, which is what makes `OR-R9` say *one* shape |
| `taskId`, `attempts`, `startTime`, `endTime`, `executionTime`, `schedulerTimestamp` | the **settlement** record — they describe the dispatch that actually happened, and a resolution did not execute anything |
| `terminalState` | the resolution's `resolvedAs`, else the settlement's `terminalState` |
| `result`, `error` | the resolution's, else the settlement's |
| `observedAt` | the **resolution's**, when there is one — it is the later record **by append order**, and `OR-R5` says append order is the only total order we have |

| id | | Test owed by |
|---|---|---|
| `OR-R8` | **The effective outcome is derived by the fold and is never appended to the log.** Deriving it is a pure function of the records already there; appending it would make the log contain its own conclusions, and a second fold would derive a third record from the second. Test: fold a log containing a resolution and assert the log length is unchanged | W2 |
| `OR-R9` | **`DecisionContext.outcome` is always an effective outcome**, so a predicate sees one shape whether the node settled or was resolved and `ctx.outcome.terminalState` is never `undefined`. Test: the same predicate against a settled `done` node and a node resolved `done`, asserting identical routing | W3 |

**Why this exists.** ADR 0004 rule 4 says routing proceeds *"as though the node had settled that
way"*, and the second conformity pass found that no document said what *that* handed a predicate. A
resumed node has **two** records and neither is the right input: the settlement says
`terminalState: 'user_action'` with `result: null` and cannot see the human's answer, and the
resolution has `resolvedAs` but **no `terminalState`, no `attempts` and no timing fields at all**
(section 5). Three implementations conformed — pass the first, pass the second, or synthesize — and
a predicate written `ctx.outcome.terminalState === 'done'` behaves differently under each, reading
`undefined` under one of them.

**The choice among the three is not free, and rule 4 already made it.** *"As though the node had
settled that way"* is the synthesis, and it is also the only option under which the two roads to
`terminalState: 'failed'` — an `optional` node settling, and a human resolving with
`resolvedAs: 'failed'` — are indistinguishable to a predicate, which is what `RS-R3` promises.

**`observedAt` is defined by position, not by comparison.** *"The later of the two"* was the earlier
wording and it admitted two implementations — `Math.max` of the two stamps, or the resolution's —
which differ whenever the driver's clock steps backwards between the settlement and the resolution.
For a suspended node that interval is hours or days, not milliseconds, so an NTP correction or a
resumed VM is enough. Comparing two `Date.now()` reads to order two records is also exactly what
`OR-R5` refuses.

**A node that is suspended has no effective outcome**, which is exactly right: it has not finished,
and nothing routes. That is `branch.suspended` rather than a terminal event
([spec/join-policy.md](join-policy.md) section 2).
