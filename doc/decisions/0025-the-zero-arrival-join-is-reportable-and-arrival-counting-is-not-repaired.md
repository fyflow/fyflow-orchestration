# ADR 0025 — The zero-arrival join is reportable, under a third policy id; arrival-counting is not repaired

**Date:** 2026-08-31
**Status:** accepted
**Raised by:** [Q24](../open-questions.md), decided by
[W16](../work-items/w16-the-decision-and-what-it-ships.md) under
[P5](../plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md), on
[W15](../work-items/w15-the-fourth-column-and-the-chain-nothing-runs.md)'s evidence

## Context

`spec/join-policy.md` `JP-R7` and `JP-R8` were written **before either policy existed**, as traps.
Each names a one-line refinement of one of the two policies P1 was comparing, and says the
refinement is *a third policy, not a repair* — because either line written into the policy it
improves would have returned *"the two policies are equivalent"* as a **passing test**, and W1 wrote
one of them itself before its own conformity pass caught it. So neither belonged in
`src/fold/policies.ts` without its own decision. **This is that decision, and the two rules get
different answers.**

**The evidence is W15's four-column matrix** — nine rows against all four policies, 36 cells, every
one carrying a status, a `describe` and a verdict, and every expected value hand-derived from
`spec/join-policy.md` sections 2-3 before it was run. `test/matrix/render.ts` prints it; this is the
table, pasted from that script:

| row | arrival-count | live-token | arrival-count-decrementing | live-token-requiring-arrival |
|---|---|---|---|---|
| **all-arrive** — both branches reach the join | `satisfied` / joined | `satisfied` / joined | `satisfied` / joined | `satisfied` / joined |
| **routed-away** — a decision sends one branch to an `end` (**P1's case**) | `waiting` / **stuck** | `satisfied` / joined | `satisfied` / joined | `satisfied` / joined |
| **lost-settled** — an `optional` branch settles `failed`, no edge opts in | `waiting` / **stuck** | `satisfied` / joined | `waiting` / **stuck** | `satisfied` / joined |
| **lost-resolved** — a human resolves a suspended branch `failed` | `waiting` / **stuck** | `satisfied` / joined | `waiting` / **stuck** | `satisfied` / joined |
| **optional-null** — an `optional` branch fails onto an `on:["failed"]` edge | `waiting` / **stuck** | `satisfied` / joined | `satisfied` / joined | `satisfied` / joined |
| **suspended** — a branch is parked on a person | `waiting` / waiting-on-human | `waiting` / waiting-on-human | `waiting` / waiting-on-human | `waiting` / waiting-on-human |
| **resumed** — that branch is resolved `done` and arrives | `satisfied` / joined | `satisfied` / joined | `satisfied` / joined | `satisfied` / joined |
| **all-exit** — every branch reaches an `end`, nothing arrives | `waiting` / **stuck** | `satisfied` / joined | `satisfied` / joined | **`unsatisfiable`** / **stuck** |
| **six-events** — one lost, one exited, one suspended-resumed-arrived | `waiting` / **stuck** | `satisfied` / joined | `waiting` / **stuck** | `satisfied` / joined |

**Read the `all-exit` row first.** Four policies, four different answers, and it is the row
[ADR 0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) records as the cost of
the policy it blessed.

### The measurement that changed what this ADR had to argue

P5 was declared believing the two refinements were symmetric measurements — a three-row change
against a one-row change. **They are not symmetric. They point in opposite directions**
([Q91](../open-questions.md)):

| | |
|---|---|
| `JP-R8`'s refinement | **removes** the zero-arrival join. On `all-exit` it declines instead of firing |
| `JP-R7`'s refinement | **adds a second road to it.** On `all-exit` it decrements `N` to **zero against an empty arrival list**, so `0 >= 0` is satisfied and it **fires a join no branch reached** — the exact defect the other one removes |

The counts *three* and *one* hid that completely, and the register carried them as the shape of the
answer. **This is the second time in this plan that a claim in `doc/` was wrong and was found by
trying to act on it**, and it is why W15 was built before W16 rather than after the argument.

### What each refinement would be for

The question a policy has to answer is not *"is it better on some row"* but *"is there a flow for
which this is the right thing to pass"*.

**`JP-R7`'s has no such flow, and that is a measured claim rather than a judgement.** Its `status` is
`arrival-count`'s, untouched, so it can never report `unsatisfiable`. Its `satisfied` requires
`arrivals + exits >= branches` — every branch terminal with none lost — which is a **strict subset**
of the states in which `live-token` sees a live count of zero having been positive. So `satisfied`
implies `live-token` `satisfied`, and the two can differ in exactly one direction. Run over all nine
rows: they differ on three, and **every one of the three is `waiting` against `satisfied`**
(`test/matrix/variants.test.ts`). The whole of its contribution over the policy this library already
recommends is a **silent hang** — and a hang is what P1 exists to attribute, not to ship.

**Two premises make that a proof rather than a summary of nine rows, and both hold here.** Every
branch of a region is opened, which is the driver obligation in `spec/join-policy.md` section 4 and
the other half of `JP-R5`; and a region has at least two branches, which `FD-V9` and the fan-out's
own shape give. Without the second, a zero-branch region would leave the variant `satisfied` at
`open` where `live-token` is `waiting` — a strengthening, and the one shape that would break the
argument. **And the argument is deliberately against `live-token` alone.** The variant is strictly
*better* than `arrival-count` — satisfied on a superset of its rows — but `arrival-count` is not a
supported choice (ADR 0003 rule 2, and `AGENTS.md` says so), so *"better than the column we keep only
to run the comparison"* earns no id.

**`JP-R8`'s does.** A fan-out whose branches all end somewhere else is either a legitimate way for a
flow to finish or a sign that the work the join was going to combine never happened, and **nothing in
a definition says which** — it is a property of the flow the author wrote. `live-token` answers the
first reading and cannot express the second; this policy expresses the second. Two readings, two
policies, one caller choosing between them is what a policy `id` is for.

## Decision

1. **`JP-R8`'s refinement is adopted, and it is built as `JP-R8` requires: a third policy under its
   own `id`.** `live-token-requiring-arrival`, exported as `liveTokenRequiringArrival`, fixed by
   `spec/join-policy.md` section 3's third row. `satisfied` when the live count reaches zero having
   been positive **and at least one `branch.arrived` was seen**; **`unsatisfiable`** when it reaches
   zero having been positive with none.
2. **`liveToken` and `arrivalCount` are unchanged, byte for byte.** The refinement was **not** folded
   into `live-token`. That is what `JP-R8` forbids, it is what would have made ADR 0003's comparison
   unreadable in hindsight, and it is what keeps every one of the 36 matrix cells identical across
   this decision. **That was measured rather than asserted, and the distinction matters**: the
   rendered table was produced from both trees and is byte-identical, but *nothing in the gate can
   see this ADR's copy of it* — W16's own probes `F3` and `F4` deleted a column from the table above
   and the whole gate stayed green. A one-time measurement is what this is, and
   [Q94](../open-questions.md) is why it is not a standing check.
3. **`JP-R7`'s refinement is refused.** It is not built, not exported, and **still run as a matrix
   column**, because a refusal that stops being executed is a refusal nobody can falsify. The reason
   is in `test/matrix/variants.test.ts` as an assertion over all nine rows, not as a sentence: it is
   `live-token` weakened and never strengthened, and it fires a join zero branches reached.
4. **`liveToken` remains what this library tells you to pass.**
   [ADR 0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) rule 1 is unchanged
   and is not weakened by a third option existing. A run that stops is the more expensive mistake to
   make by accident than a run that proceeds, and **nothing has measured which reading of `all-exit`
   is more common in real flows** — [Q96](../open-questions.md).
5. **[ADR 0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) rule 2 still holds
   and this decision does not strain it.** It keeps `arrival-count` shipped *"for as long as both
   columns can be run"*, and both columns are still run — on nine rows, unchanged, beside two more.
   **The asymmetry `JP-R8` was written to forbid does not arise**, because nothing was added to
   `live-token`: the third policy is a third column, not a thumb on the second.
6. **`JP-R9` is added to `spec/join-policy.md` section 3, and `scripts/check-policies.mjs` holds it.**
   A policy `id` exists in section 3 or it does not exist. This is what the decision makes necessary:
   the set was frozen at two by four hand-written literals and one `AGENTS.md` comment, none of which
   was ever compared to the document that fixes the names, and rules 1 and 3 above are an explicit
   invitation for the set to grow again.
7. **Which policy applies is still one global choice per run.** Per-join configuration is
   [Q5](../open-questions.md)'s remainder and this ADR does not answer it — it makes it sharper, which
   ADR 0003 predicted in terms: it called the question premature *"until Q24 produces a second policy
   that does not hang"*, and Q24 now has.

## Consequences

**What this makes possible.** A flow author who believes a join reached by nothing is a failure can
now say so, and the run says it back: `onUnsatisfiableJoin` fires with the policy's own `describe`,
the driver routes nowhere, `regions[…].joined` is `false` rather than `null`, and `RunState.outcome`
is **`stuck`**. That last part matters most — **the difference is visible without registering any
callback**, so a consumer who ignores the reporting surface entirely still gets `stuck` where they
would previously have got `completed`. `test/matrix/chain.test.ts` runs that chain end to end.

**What it costs, and the cost is a real behaviour difference rather than a migration.** On `all-exit`
a run **completes** under `liveToken` and is **`stuck`** under the new policy. Nobody's run changes:
this is a new name, and the policy a caller already passes is unchanged. But a reader comparing the
two now has to decide something ADR 0003 let them not decide, and there is no default that is right
for every flow. `AGENTS.md` says that in those terms rather than presenting the newer thing as the
better one.

**What is still true of `stuck` and is now more visible.** `spec/run-state.md` maps `joined !== true`
to `stuck`, so a run whose join was **reported** unsatisfiable and one whose join is **silently**
waiting forever are the same outcome. The difference lives in `regions[…].joined` — `false` against
`null` — and in whether `onUnsatisfiableJoin` fired. **This decision creates the first shipped way to
reach the `false` case**, which makes the conflation reachable in practice rather than in principle.
That is [Q97](../open-questions.md), and it is a run-state change: `spec/run-state.md` is W2's and
ADR 0026 was reserved for exactly this and is **not** taken here.

**What a future reader is likely to try that this forbids.** Folding the clause into `liveToken` and
deleting the third id, on the grounds that *"the refinement is just better"*. `JP-R8` refuses it and
so does rule 2 above: the two behaviours are two answers to a question about a flow, and collapsing
them removes the caller's ability to give the other one. The second is reviving `JP-R7` because it
*"repairs P1's row"* — it does, and `test/matrix/variants.test.ts` is what says the repair is a hang
on three other rows and a zero-arrival join on a fourth.

**What it does not decide.** Whether a join may time out ([Q7](../open-questions.md)) — this gives a
join no clock; it makes one more class of dead join reportable without one. Whether the policy is
per-join ([Q5](../open-questions.md)). What a satisfied join carries downstream
([Q36](../open-questions.md)) — still `null`, and a policy that declines to fire carries nothing
either way. And whether `live-token-requiring-arrival` should become the recommendation
([Q96](../open-questions.md)), which is a question about real flows and is not answerable from
fixtures.

## Alternatives rejected

| | why not |
|---|---|
| **Neither refinement — close Q24 as "both stay unbuilt"** | A real outcome, and the one this ADR came closest to taking. It fails on rule 4's own criterion: the `all-exit` row is a case where the recommended policy runs the join's successor on work that never happened, ADR 0003 records it as a cost and says *"that objection is now spent"*, and the seam that would report it was measured working end to end. Declining to build it would have left a known defect with a written apology beside it — **which is exactly the absorption P3's retro named and P4 spent an item deleting** |
| **`JP-R8`'s clause folded into `live-token`** | What `JP-R8` forbids in terms, and the asymmetry it was written to catch. It would also silently change what every existing caller's run does on `all-exit`, from `completed` to `stuck`, with no name for what changed. **The comparison being over does not license it**: the cost is not to the comparison any more, it is to the caller |
| **`JP-R7`'s refinement adopted alongside** | It would ship the zero-arrival join under a second name at the same moment the other adoption removes it, which is incoherent as a recommendation. And it earns nothing: it is `live-token` weakened on every row where they differ |
| **`JP-R7` adopted with a guard against zero arrivals** | The tempting repair, and it is `JP-R8`'s own history repeating. Adding a pin to one candidate that the other is denied is precisely the move W1 made and its conformity pass caught. A guarded `JP-R7` is also **not `JP-R7`** — it is a fifth thing, and it would need its own evidence rather than inheriting this ADR's |
| **Deleting `arrival-count` now that a third policy exists** | Out of scope by declaration and wrong on its own terms: ADR 0003 rule 2 keeps it as the falsifiable form of the simpler mechanism, and the matrix's value is that all four columns run |
| **Deciding from P5's prose rather than from W15's matrix** | It would have reached *"adopt `JP-R8`, refuse `JP-R7`"* — the same verdict — **and it would have got the reason for refusing `JP-R7` wrong.** The plan's reason was *"a three-row change to a policy that still loses on three"*. The measured reason is that it fires a join no branch reached, which nobody had seen and which no count could show. W16 was told it was not entitled to inherit the leaning; the leaning's conclusion survived and its argument did not |
