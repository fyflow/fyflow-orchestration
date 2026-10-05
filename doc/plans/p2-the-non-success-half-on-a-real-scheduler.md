# P2 — The non-success half, on a real scheduler

**Status:** **complete** — W6 built, both readers run and acted on, gate re-run, **retro done**
(`doc/workflow.md` is v0.4)
**Question this plan answers:** *Does the non-success half of a flow — a failure that **routes**, a
human resolving a suspended branch, and a refusal that stops a run — behave on a real scheduler the
way the fixtures say?*
**Exit artifact:** three more ladder-L6 rows, and the run-state outcomes **`awaiting_action`** and
**`stopped`** reached on real workers for the first time. *(Delivered as **five** rows and thirteen:
two were added because a negative test survived, which is recorded in W6 rather than smoothed into
this line.)*
**Reserves:** W6-W8, Q61-Q70, ADR 0016-0018

---

## Why this plan, and why now

[P1](p1-what-satisfies-a-join.md) answered what satisfies a join and proved it end to end. What it
proved end to end is the **success** half: of `spec/run-state.md`'s six outcomes, ladder L6 reaches
`completed`, `failed` and `stuck`. It reaches **`awaiting_action` and `stopped` not at all**, and of
`spec/join-policy.md`'s six region events it reaches four — `branch.suspended` and `branch.resumed`
have never occurred outside a fixture.

That matters here more than it would elsewhere, because **this repository's record is that
fixtures-versus-reality is exactly where it has been wrong**:

- W4's fake scheduler emitted a settlement the real library **cannot produce** — `terminalState:
  'failed'` for a non-optional task — and three mutations survived the whole suite because of it.
- `AGENTS.md` section 3 says a Node worker must be JavaScript. False at Node 24.
- The sibling's own published TypeScript cannot be loaded by Node at all.

Each was found the moment something real was run, and never before. **The non-success half is the
largest remaining body of behaviour that only fixtures have ever seen.**

## Two facts were measured before this plan was written, and both changed it

The [ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
pattern: settle the load-bearing fact first, because a plan built on a belief is a plan that finds
out late.

**1. `user_action` is reachable, and [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
rule 2 is confirmed against behaviour for the first time.** A non-optional task with no
`retryPolicy` whose worker throws produces, in order:

```
task.running      state: running
task.failed       state: user_action     <-- the event that lies about its own name
task.user_action  state: user_action
```

and an **optional** task in the same pool produces one `task.failed` with `state: 'failed'`. That is
exactly what ADR 0007 rule 2 says, and until now the rule was **read out of
`core/FyflowScheduler.ts` and never observed**. Every test of it in this repository drives a fake
that was written from the same reading.

**This lowers the plan's stakes and is recorded rather than hidden.** The single most likely surprise
was that the pairing did not behave as read; it does. What is left is whether *our* handling of it
works on a real run, which is a weaker question and still an unanswered one.

**2. `OR-R6` is reachable from an inline pool and NOT from a thread pool** — and nothing said so.
Measured with a worker returning `{ fn: () => 1 }`:

| pool | what happens |
|---|---|
| `inline: true` | the result reaches the driver **intact** (`typeof result.fn === 'function'`), and our `structuredClone` at the listener boundary is what refuses it — `OR-R6`, `onRunFailure`, run `stopped` |
| `inline: false` | **the scheduler refuses it first.** The value cannot cross the worker boundary, so the task ends `user_action` with *"() => 1 could not be cloned"* and no result ever reaches us |

So the same worker bug produces **two different failures** depending on a pool option the flow author
does not control, and `OR-R6` can only be exercised inline. Neither `spec/outcome-record.md` nor
ADR 0007 says this. It is [Q61](../questions/q61.md), and it sets the refusal row's shape.

## Scope

**In**

1. **A failure that ROUTES** — `on: ["failed"]`, the one definition feature no L6 flow reaches. It is
   ADR 0004's central mechanism and the case `spec/run-state.md` section 3 uses to define `completed`
   against `failed`: an `optional` node fails, takes its failure edge to an `end`, and the run is
   **`completed`**. W2's conformity pass found the code got that exact case wrong.
2. **A human resolving a suspended branch** — `user_action` → `branch.suspended` →
   `awaiting_action` → `Driver.resolve()` → `branch.resumed` → the branch arrives and the join
   fires. This is ADR 0004 rules 3-6, `RS-R1`-`RS-R3`, and **the only inbound API the library has**.
3. **A refusal that stops a run**, inline per fact 2 above: `OR-R6` at the listener boundary,
   reaching `onRunFailure` and folding to **`stopped`**.

**Out** — named rather than left implicit

- **New features.** P2 adds no capability. Every rule it exercises is already specified and already
  implemented; what is missing is evidence from a real scheduler.
- **[Q24](../questions/q24.md), [Q6](../questions/q6.md), [Q12](../questions/q12.md)** — the
  policy refinements, nested fan-out and map-style fan-out. Each is its own plan; this one is
  deliberately not a feature plan.
- **The browser at L6** ([Q52](../questions/q52.md)) — unchanged and still open.
- **[Q53](../questions/q53.md)** — narrowing `Driver`'s multi-run surface. It is W3's public API and
  it is not what this plan is about.
- **A second `spec/` example flow.** Whether `spec/examples/` should carry behaviour fixtures is
  [Q44](../questions/q44.md), which now has two occurrences and is not settled by adding a third.

## The known design problem, stated before it is hit

**A suspended run never finishes, and the L6 harness resolves on *finished*.** `RN-R12` makes
`awaiting_action` explicitly **non**-terminal — correctly, because a run waiting on a person is not
over — so `examples/run-flow.ts` will wait for its backstop and report a failure. The harness needs
an inbound step: a row must be able to say *"when branch 1 suspends, resolve it"*.

That is a change to W5's harness rather than to `src/`, and it is the one piece of design in this
plan. It is named here so it is not discovered halfway through.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W6 | The three rows, and the harness's inbound step | `examples/**` | P1 complete | L0-L6 — L0-L5 in all five runtimes, L6 in Node and Deno; then two readers |

W7 and W8 are reserved and unallocated. If W6 turns out to be three items rather than one, they are
there; if it does not, they are skipped and never reissued.

## Record

**Status: complete.** One work item, two reader-passes, retro run.

**Exit artifact.** Ladder L6 at **thirteen rows and 219 assertions**, in Node and Deno. **All six run
outcomes and all six region events now occur on real workers** — `awaiting_action`, `stopped`,
`branch.suspended` and `branch.resumed` for the first time in this repository's life. Three rows were
declared; five were built, because a negative test survived and two more rows were what killed it.

**What the plan answered.** *Yes, and the plan was right to lower its own stakes before starting.*
**Nothing in `src/` broke.** Every one of W6's nine findings was in the gate that was supposed to be
checking `src/`, not in the code being checked. P2 predicted the weaker result when it measured the
`user_action` event pair before a line was written, and recorded the prediction rather than
discovering it — which is the only reason the result reads as confirmation rather than as an
anticlimax.

The one behavioural surprise was not in the non-success half at all: **the join had never once been
fired from the `lost` or `exited` path** across twelve rows, because the arriving branch always
settled last. `spec/join-policy.md` section 4 says join status is asked after *every* terminal event
precisely so that a join can become satisfiable when the last live branch was lost or exited — P1's
own case — and deleting `settleJoin` from both other paths was invisible. Fixed by **arranging** the
causal order with per-role delays rather than hoping for it, plus a thirteenth row.

---

## Retro

*`doc/workflow.md` section 6 pass 3. P2 is the first plan to run the document as v0.3 amended it, so
the four changes P1 adopted are what this judges.* **`doc/workflow.md` is v0.4 as a result: two
changes adopted, two confirmed with no change.**

### The four v0.3 changes, judged

| change | what would show it was wrong | **P2's verdict** |
|---|---|---|
| **TEMPLATE gains an `Outputs` table** | every row reads "yes", making it a formality | **Right, and it earned itself in a way P1 did not anticipate.** The column that works is not *Exists* — it is **"what would fail without it"**. Two of W6's six rows could not answer it: `branch.resumed` was reached and **asserted by nothing** (deleting the emission passed all 186 assertions), and `Q61` got the honest row *"nothing. A question is not a testable output."* The table's value is that it forces a claim that can be checked, and a row that cannot make one is the finding |
| **Pass 2 is two readers** | the overlap rises, meaning one reader would have done | **Right, and now settled — stop re-litigating it.** Four items, four measurements: W4 **1 in 13**, W5 **3 in ~35**, W6 **3 in ~25**, W9 **3 in ~30**. The overlap is flat at roughly 10% and has not risen with practice. **No change**, and section 6 drops the hedging paragraph that treated it as provisional |
| **A new check is negative-tested at birth** (section 5 rule 7) | a check ships that cannot fail | **Right about the aim and wrong about the mechanism — amended.** See below; this is the retro's main output |
| **Section 7 rule 2 scoped to *concurrent* items, with a serial item declaring its exceptions** | an item's exception list is wrong | **Wrong as written, and replaced.** See below |

### Adopted 1 — a negative test is checked in, or it did not happen

**Rule 7 was followed twice and failed differently each time, which is rule 3's sharpest shape: the
mechanism is wrong, not the discipline.**

| | what happened |
|---|---|
| **W6** | Ten mutations run by hand; **one was a syntax error** rather than a mutation. The harness read only the exit code, so a parse failure was indistinguishable from a caught mutation, and it became the Record's most confident false claim (*"hangs the gate"*). Found by the adequacy reader, not by the author who ran it |
| **W9** | Five probes run by hand in a scratch directory and **never committed**. Its adequacy reader then disabled the script's own machinery one piece at a time — `if (false)` on X3, on X4, on the final `process.exit(1)` — and **8 of 9 survived** |

**Both are one root: a negative test that ran once is a claim about the past**, which is this
repository's most common defect class wearing the uniform of the rule meant to prevent it.

**Rule 7 is amended, replacing its current second sentence.** A new check's provocations are (a)
**checked in and runnable**, (b) asserted to actually change their input — a probe that matches
nothing passes for the wrong reason — and (c) required to name **which check refused them**, because
a non-zero exit alone is what let W6's malformed probe through. `scripts/check-docs-selftest.mjs`
(12 probes, in the gate) is the worked example; W9's own five probes went from 5 to 12 the moment
they were made re-runnable, and **seven of the twelve holes were found by re-running them.**

### Adopted 2 — a fix for a finding is negative-tested like a check

**Three occurrences, three work items, and it is the same sentence every time: the author's fix
cannot fail.**

| | |
|---|---|
| **W4** | the join's `null` payload could become `{}` and survive 251 assertions |
| **W5** | the L6 gate's termination predicate replaced by `setTimeout(1)` — every assertion still passed, because `scheduler.shutdown()` drained the run while the fold kept advancing |
| **W9** | §2's snippet dispatched three records for one settlement and stopped its own run, and its assertion `added.length === 2` **passed because `ID-R1` refused the duplicate dispatches** |

Each was work done *in response to a finding*, and each produced something correct that was not
**shown** to be correct. Section 5 rule 3 says an assertion must be able to fail; rule 7 says a new
*check* is provoked at birth. **Neither covers the fix for a review finding**, and that is where all
three landed.

**New rule 8:** *when you act on a review finding, break the fix and watch the gate go red before you
call it done — and record the provocation in the Record beside the fix.* It is rule 7 pointed at
fixes rather than at checks. **Naming the rung, per rule 5: none of the three has one.** L0-L6 all
check the product; nothing checks the repair.

### Adopted 3 — `Owns` is enforced, because declaring it does not work

**Section 7 rule 2's amendment was followed and failed on its first two outings, then failed again
with a warning already written down.**

| item | declared | actually touched outside it |
|---|---|---|
| W5 | — | `doc/README.md` (undeclared) |
| W6 | *"nothing"* | `doc/README.md`, `CLAUDE.md` — found by its **conformity reader running `git show --stat`** |
| **W9** | Owns + *"one declared exception: `package.json`"* | `CLAUDE.md`, `README.md`, `doc/README.md`, `doc/open-questions.md`, **`examples/l6.ts`** (W6's file) and **`scripts/check-docs-selftest.mjs`** (a new file in nobody's `Owns`) |

W6 flagged this **for this retro** in as many words, and W9 — the very next item, with the flag
already raised — undercounted by six. **A rule read in full before every work item, three times in a
row producing the honest answer *"yes, and I did not notice"*, is not a discipline problem.**

Two changes, and the first is the mechanism rule 3 demands rather than a restatement:

1. **`scripts/check-owns.mjs`** — compare `git diff --name-only` against the item's `Owns:` block
   plus its declared exceptions, and refuse the difference. This repository's own finding is that a
   written rule nobody runs is its most common defect; the fix for a rule about declarations is a
   check, not a better sentence. **Proposed as [W10](../work-items/), not built here** — a retro
   proposes, and building it inside the retro would be the third occurrence of adopted 2.
2. **Section 1's record step already names `doc/README.md` and the plan's Record**, so those were
   never exceptions. It now names **`CLAUDE.md` and `README.md`** too, because updating the front
   door is part of finishing an item and pretending otherwise is what produced two of the three
   miscounts. **Everything else stays declared** — `examples/l6.ts` was a real cross-item edit and
   should have been declared.

### Confirmed, no change

- **The verification ladder.** P1 found five defect classes with no rung, all caught by the
  conformity pass. **P2 and P3 extend the pattern without changing it**: of W6's nine findings and
  W9's ~30, the ones with a rung were caught by it, and the ones without were caught by a reader.
  The rungs are not the thing to adjust; **`doc/` and the instrument remain the unrunged surfaces**,
  which is now a four-plan observation and still not a rule.
- **L2, L5 and L6's placement.** Untouched by P2 and still cheap.
- **Two readers.** Above.
- **The cross-repo id rule (section 3).** Still unproven — no cross-repo citation occurred in P2
  either. Kept; nothing learned. *Recording "no change" twice is the point of rule 1.*

### Findings deliberately left as findings

- **`doc/` is upstream of every check and is checked by nothing.** Third and fourth sightings: W5's
  [Q43](../questions/q43.md) was a false register entry; `doc/README.md` claimed W5's and W6's
  readers were outstanding when all four had run; `examples/l6.ts`'s header said *"Twelve real runs"*
  at thirteen. **Not made a rule**, because the two candidate mechanisms are both worse than the
  problem: a doc-freshness linter would check spelling of facts it cannot verify, and a rule saying
  *"update the docs"* is what already exists. **Named as the thing most likely to bite next**, which
  is what P1's retro did with this same finding and was right to.
- **A reader can be wrong.** W9's adequacy reader listed *"24 refusals"* among count claims that are
  *"all true today"*; there are 23, which its conformity counterpart had measured. **No rule** — the
  two-reader split is already the mechanism that caught it, and adding *"readers must verify each
  other"* would double a cost that has been paying for itself at a flat 10% overlap.
- **P2 reserved W7-W8 and used neither.** Skipped, never reissued. Over-reserving costs nothing and
  under-reserving forces renumbering, which section 3 forbids. No change.

### What P2 leaves for P3's retro

1. **Does `check-owns.mjs` get built, and does it catch anything?** If W10 ships and finds nothing in
   two items, adopted 3 was a rule looking for a problem and its first clause should be deleted.
2. **Does rule 8 change anything?** Its evidence is three occurrences in three items, which is the
   strongest case any rule here has had — and the strongest case is also the easiest to over-read.
3. **The habit no rule names.** Four consecutive items have settled their load-bearing fact
   *before* declaring — ADR 0013, P2's two spikes, P3's extraction spike — and in all four the fact
   changed what got written. **W9 said this belongs in section 1 and P2's retro is not adopting it**,
   because rule 1 says "no change" is an expected verdict and a habit that is being followed
   unprompted needs no rule. If a future item skips it and pays, that is the second occurrence and
   the argument flips.
