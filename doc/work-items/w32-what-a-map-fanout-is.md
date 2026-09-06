# W32 — What a map-fanout is, and what its `branchPath` is

**Status:** todo
**Plan:** [P10](../plans/p10-is-fan-out-one-feature-or-two.md) — *is fan-out one feature or two?*

```
Spec:       spec/flow-definition.md sections 2-5, spec/task-id.md section 1
            (this item CHANGES both; neither currently admits a run-time arity)
Owns:       src/definition/**, src/driver/ids.ts, spec/flow-definition.md,
            spec/task-id.md, spec/README.md, spec/examples/**, test/definition/**
Inputs:     P10 section 2 facts 1 and 2 — the three refusals, and the split between
            the id GRAMMAR (which admits run-time arity) and the DERIVATION (which
            pins it). doc/open-questions.md Q12, Q27.
Outputs:    ADR 0036 — Q12's answer, one feature or two.
            A definition shape a map is expressible in, and the validator rules for it.
            branchPathOf's contract, stated for a node whose index is not a property
            of the node.
            spec/flow-definition.md and spec/task-id.md at new versions, with
            spec/README.md's version rows moved with them (C8).
            Corpus flows in spec/examples/valid and spec/examples/invalid.
Depends on: nothing
Blocks:     W33
Tests:      test/definition/** — the validator's new refusals and its new acceptances,
            expected values derived from the spec text BEFORE the code is written.
            spec/examples/** through ladder L4's corpus walk.
Gate:       L0, L1, L4, then the spec-conformity pass (two readers)
Reserves:   Q156-Q159, ADR 0036
```

## Scope

**In**

1. **ADR 0036 — [Q12](../open-questions.md)'s answer.** One primitive or two, with the evidence
   P10 section 2 measured on both sides: a map needs **no id-scheme change** and **no change to two
   of three policies** (argues *one*); it breaks `branchPath`-as-a-property-of-the-node, makes
   `FD-V9`'s arity floor meaningless, reaches an N=0 the static feature cannot, and hands
   `arrival-count` a new failure direction (argues *two*). **The ADR states which it weighed and
   how.**
2. **The definition shape.** Whichever way ADR 0036 lands, a map must be expressible: a widened
   `fanout`, or a new node kind. `src/definition/types.ts` is where it becomes a type, and ADR 0002
   rule 1 binds it — **no functions anywhere in the structure**, so *"how many items"* is a declared
   reference to a previous node's output rather than a callback.
3. **The validator.** P10 fact 1 measured three refusals firing at three arities — `FD-V9`'s
   repeated-entry clause, `FD-V9`'s arity floor, and `FD-V11`'s reachability. **Each is either
   retired for a map, kept and restated, or kept as-is**, and the item says which for all three
   rather than only for the one it had to move.
4. **`branchPath` for a node whose branch index is not a property of the node.** P10 fact 2:
   `branchPathOf(regions, nodeId)` takes no run-time input, so three dispatches of one node mint
   **one id**. This item decides what replaces it and **states the contract in
   `spec/task-id.md`**, whose section 1 currently claims the opposite in a heading.
5. **`spec/README.md`'s version rows.** `check-spec`'s `C8` makes them a consequence of any
   `spec/**` bump, so whoever owns the spec document owns the row — W16's finding, and it is why
   that file is in this `Owns` rather than on the record-step list.

**Out** — named rather than left implicit, with where it goes instead

- **The driver.** Nothing here dispatches anything. Opening N branches, the region event stream and
  the policies are **W33**, which is why `src/driver/driver.ts` is not in this `Owns` and
  `src/driver/ids.ts` is.
- **What a branch receives and what the join carries.** [Q11](../open-questions.md),
  [Q36](../open-questions.md) and [Q154](../open-questions.md) are **W34**, deliberately after the
  map runs — P10's decision 2.
- **[Q27](../open-questions.md)** — convergent branches. **Not answered**, and ADR 0036 **owes it a
  sentence** because `FD-V19` is the rule both questions turn on.
- **A map inside a map.** Whether a map's branch entry may itself fan out. Named in P10's
  *"not taken"* and gets a Q id from this block only if the shape forces one here.
- **An upper bound on arity.** Same.

## Verification

Node 24 is not on the PATH by default; `eval "$(fnm env --shell bash)" && fnm use 24` first.

| Clause | How it is run |
|---|---|
| **L0** | `npm run lint` and `npm run typecheck` — five typecheck projects, and `typecheck:deno` is the one that catches a `node:` import (`RT-R3`, `RT-R4`) |
| **L1** | `npm run test`, `npm run test:deno`, `npm run test:browser` — the validator's unit tests. **`test:browser` is CHROMIUM ONLY**; `npm run test:browser:all` is what adds firefox and webkit, and this item says which it ran |
| **L4** | the definition-conformance corpus — every flow in `spec/examples/**` validated, through `test/definition/l4-corpus.test.ts` and `npm run check:spec` |
| **conformity** | spec first, code second, expected values re-derived independently |
| **adequacy** | mutation, walking the rule ids, **in a copy off the shared tree**. Scan for symlinks and reparse points before removing it (ADR 0029) |

**Routing cases this item covers, and the ones it does not** (`doc/workflow.md` section 5 rule 6):
a **nested fan-out** ([Q6](../open-questions.md)) is covered — a map must not break what
[ADR 0030](../decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
settled, and `test/definition/nesting.test.ts` is where that is asserted. A **duplicate task id**
([Q13](../open-questions.md)) is covered at the id layer and **not** at the dispatch layer, which is
W33's. A branch **routed away from its join** ([Q4](../open-questions.md)), **`user_action`**
([Q17](../open-questions.md)) and **no matching decision edge** ([Q10](../open-questions.md)) are
**not applicable here** — none is reachable without a driver.

**Rule 8 applies to every fix this item makes for a reader's finding**, all five obligations, and the
set is **re-run after acting on the readers** with their exact edits checked back in as probes. The
one to instantiate deliberately here is **(e), break the WIRING** — P10 prediction 3 says it fires on
a `src/` item and P10's retro owes a verdict either way. A new validator rule that is never reached,
a corpus flow no walk picks up, and a `spec/examples/` directory nothing globs are its three shapes
in this item's own paths.

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.** *One row per clause above. Each verdict starts with `RAN` or `NOT RUN`; a
clause with no row reads as did not run. The last row is the gate re-run at the commit that acts on
the review findings, and it names that commit.*

| Clause | Verdict | Notes |
|---|---|---|
| L0 | | |
| L1 | | |
| L4 | | |
| conformity reader | | |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.** *One row per item on the `Outputs:` line, and for each, the
assertion or command that would fail if it did not exist. A blank cell is the finding.*

| Declared output | Exists | What would fail without it |
|---|---|---|
| | | |

**What broke.**

**What this taught.**

**Questions raised.** *Q ids from the reserved block, one line each. They also go in
`doc/open-questions.md`.*
