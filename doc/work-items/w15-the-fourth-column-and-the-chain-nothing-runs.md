# W15 — The fourth column, and the chain nothing runs

**Status:** todo
**Plan:** [P5](../plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) — the first of
its three items, and **the only one that can be built without knowing the answer**. That is why it is
first: building the evidence before the decision is what stops ADR 0025 being written from the
argument in the plan.

```
Spec:       spec/join-policy.md section 3 (what each policy NAME means, and
            JP-R7/JP-R8's claims about what a refinement DOES) and section 4
            (the seam contract: on `unsatisfiable` the driver reports with the
            policy's own describe and routes nowhere). spec/run-state.md
            section 3's precedence and RN-R10/RN-R11 for what the fold must
            then say. This item writes NO spec and changes none — if a rule
            turns out to be unstatable or false, that is a finding for the
            Record and it is W16 that acts on it
Owns:       test/matrix/**  — taken over from W4, which is done. P5's "Which
            files this plan takes over" table is the declaration; W16 takes the
            same directory AFTER this item, never concurrently
            plus one declared exception (doc/workflow.md section 7 rule 2):
              - none. doc/open-questions.md is section 1 rule 5's record-step
                file as of workflow.md v0.6, so the rows this item's Reserves
                block allocates need no exception. THIS LINE IS THE AUDIT: run
                `git diff --name-only` against this block before filling in the
                Record — check-owns.mjs was retired by P4's retro and nothing
                checks it
Inputs:     the two variant policies as they already exist, verbatim, in
            test/matrix/variants.test.ts — `arrival-count-decrementing` and
            `live-token-requiring-arrival`. They are W4's and this item does not
            change them, only what is run against them. The nine SCENARIOS and
            runCell() (W4). The driver's join seam as shipped: onUnsatisfiableJoin,
            joinStatusOf(), foldInputs() (W3, W5, W13). fold() and RunState (W2).
            P5's measurement table is the thing being made permanent, not a
            starting hypothesis to re-derive
Outputs:    (1) the matrix rendered at FOUR columns, every cell carrying status,
            describe and verdict, as a by-product of the same values the
            assertions use — renderTable() already takes a policyIds list;
            (2) an exact-list assertion of which rows each refinement changes,
            replacing the counts P5 measured;
            (3) the chain assertion: a policy returning `unsatisfiable`, through
            a real Driver, through foldInputs(), to RunState.outcome === 'stuck'
            with regions[*].joined === false and the describe reaching the
            caller — the four links exist and NOTHING runs them as one;
            (4) a recorded measurement of what a consumer who omits
            onUnsatisfiableJoin can learn (Q37), reported and not fixed
Depends on: nothing. It changes no shipped code and no spec
Blocks:     W16, which takes the same directory and needs (1)-(3) as its evidence
Tests:      L2 and L5, in test/matrix/**. Expected values come from
            spec/join-policy.md section 3 — which says what each policy NAME
            means — and from section 4's seam contract and spec/run-state.md
            section 3's precedence, NOT from running the variants. The three
            rows JP-R7 changes are derivable before the run: they are exactly
            the rows whose only non-arrival terminals are `branch.exited`,
            because that is the event it decrements on. Derive the list from
            the region-event streams, then run it
Gate:       L0 (typecheck, lint — no reference edit, so check:docs is unchanged
            but still runs) through L5. All five runtimes: the matrix is
            fixtures over a fake, so it carries no scheduler. Then pass 2 as
            doc/workflow.md section 6 defines it — TWO readers, the adequacy
            one in an ISOLATED COPY (v0.6)
Reserves:   Q91-Q94, ADR — none. This item takes no decision, by declaration
```

**Every line is fillable, and the one that had to be settled first was `Outputs:` (3)** — whether the
`unsatisfiable` chain works at all. P5 measured it before this item was declared: it does, and each
of its four links has a stub test while nothing runs them together. Had it *not* worked, this would
be a different item with a `src/driver/**` takeover, and P5 would be a different plan.

---

## Scope

**In**

1. **The fourth column.** `renderTable()` already accepts a `policyIds` list and `matrix.test.ts`
   passes two. The variants move from `variants.test.ts`'s local scope into the matrix's own policy
   list, so every row is run against four policies and the rendered table has four columns.
   `variants.test.ts` keeps its `JP-R7`/`JP-R8` claim assertions — they are what the rules ask for —
   and stops being the only place the variants are executed.
2. **Exact lists, not counts.** `JP-R7` changes `routed-away`, `optional-null` and `all-exit`;
   `JP-R8` changes `all-exit`. Asserted as sorted lists so that a policy edit that changes a
   *different* row fails rather than passing on arithmetic. **The rule this closes is a false claim
   rather than a missing test**: ADR 0003 and the register both said `JP-R7` repairs *"only the row
   P1 named"*, and the register is corrected. The ADR is W16's.
3. **The chain.** One test that starts from a policy returning `unsatisfiable` and ends at
   `RunState.outcome`, asserting at every link: `onUnsatisfiableJoin` fired once carrying the
   policy's own `describe`; `foldInputs()` contains `joinSettled(fired: false)`; the join's successor
   was **not** dispatched; `fold(driver.foldInputs()).regions[*].joined === false`; and the outcome
   is `stuck`. **The existing three stub tests stay** — this does not replace them, it connects them.
4. **What a consumer without the callback learns.** Measured and written into the Record:
   `onUnsatisfiableJoin` is optional, so the only remaining channel is `joinStatusOf()`, which is a
   poll nobody is obliged to call. That is [Q37](../open-questions.md), **reported and not fixed**.

**Out** — named rather than left implicit, with where it goes instead

- **Any change to `src/**` or `spec/**`.** By declaration. If the chain assertion cannot be written
  without one, that is the finding and it goes to W16 rather than being patched here — which is
  `spec/README.md` rule 2's shape applied to code.
- **Shipping either variant, or removing `variants.test.ts`'s *"neither has an entry in `POLICIES`"*
  assertion.** That assertion is currently **true** and must stay green through this item. It is
  W16's to falsify, and only if ADR 0025 says so.
- **Whether `stuck` should distinguish a reported join from a silent one.** P5 measured that it does
  not — `joined: false` and `joined: null` both fold to `stuck`. Asserted here as the *shape*;
  whether it should be two outcomes is a `spec/run-state.md` question and this item does not own that
  file. If W16 does not take it, it is a Q from this item's block.
- **A new check script.** None is needed and none is added, which is the third plan running without
  exercising `doc/workflow.md` rule 7 (c). Said out loud rather than left to the retro to discover.

## Verification

How each clause of `Gate:` is actually run:

```bash
npm run typecheck && npm run lint
```

```bash
npm test && npm run test:deno && npm run test:browser:all
```

L2 and L5 are inside `npm test` — `test/matrix/**` is the L5 rung and the chain assertion is L2 (a
fake scheduler, no workers). L6 is **not run by this item and is not claimed**: nothing it touches
reaches `examples/**`. `npm run gate` is what W16 and W17 run.

**Which of the spec's named cases this item covers.** A branch routed away from its join (Q4):
**yes**, `routed-away` is one of the nine and is one of the three `JP-R7` changes. `user_action`
(Q17): **yes**, through `lost-resolved`, `suspended`, `resumed` and `all-exit`, unchanged from W4.
No matching decision edge (Q10): **yes**, the `branch.lost` rows. A duplicate task id (Q13):
**not applicable** — one driver, one run, and `ID-R4` is W13's. A nested fan-out (Q6): **not
applicable**, `FD-V15` still refuses it.

**Rule 8 does not apply to this item** — it acts on no review finding. **Rule 7 does not apply
either** — it adds no check script. What it owes instead is `doc/workflow.md` section 5 rule 3: every
assertion added here must be shown able to fail, and the way to show it is to enumerate **the
clauses of the rules being asserted** rather than the ways the new test could be deleted — which is
rule 8's v0.6 amendment applied to a rule that does not formally bind. Concretely, the provocation
set must break each of: every one of the four links in the chain independently; each of the six
region-event variants inside `emit`; `joined: false` versus `joined: null`; and each of the three
rows on `JP-R7`'s list, one at a time. **A set that only deletes the new assertions is the incomplete
shape P4's retro measured three times.**

## Record

*Filled in when the item is done. Delete the italic lines.*

| Clause | Verdict | Notes |
|---|---|---|
| L0 | | |
| L1-L2 | | |
| L5 | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors — **in an isolated copy** |
| re-run at `<sha>` | | |

| Declared output | Exists | What would fail without it |
|---|---|---|
| four-column render | | |
| exact-list assertions | | |
| the chain assertion | | |
| the Q37 measurement | | |

**What broke.**

**What this taught.**

**Questions raised.** *Q91-Q94, with one line each. They also go in `doc/open-questions.md`.*
