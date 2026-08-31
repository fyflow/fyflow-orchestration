# W16 — The decision, and what it ships

**Status:** todo
**Plan:** [P5](../plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) — the item that
answers [Q24](../open-questions.md). **It is entitled to reach "neither", and P5 says so**: the plan
records which way the measurements point and explicitly does not assert it.

```
Spec:       spec/join-policy.md section 3 in full — the two policy definitions,
            and JP-R7/JP-R8, which are the rules that FORBID doing this without
            a decision. Section 4 (`unsatisfiable`, and what it is not), which
            says today that neither pinned policy ever returns it and calls that
            "a result rather than a gap". spec/run-state.md section 3 and
            RN-R10/RN-R11 for what a reported-unsatisfiable run is called.
            AND IT AMENDS ONE: spec/join-policy.md section 3, with the rationale
            stated, which is ADR 0025. A spec change is its own change, never a
            side effect of making a test pass
Owns:       spec/join-policy.md (from W1), src/fold/** and test/fold/** (from
            W2), test/matrix/** (from W4, AFTER W15 — never concurrently),
            doc/decisions/0003-*.md (from W4), AGENTS.md (from W9).
            All five owners are done; P5's takeover table is the declaration
            plus one declared exception (doc/workflow.md section 7 rule 2):
              - examples/l6.ts, for line 76 ONLY — `policyId` is typed as the
                literal union 'arrival-count' | 'live-token' rather than as
                PolicyId, so it stops compiling the moment POLICIES gains a
                member. It is W14's file and W17's Owns, and a two-word type
                change is not a takeover. If the decision ships nothing, this
                exception is unused and the Record says so
Inputs:     W15's four-column matrix and its chain assertion — the evidence,
            and the only thing this item is permitted to reason from about what
            the refinements DO. ADR 0003 in full, including rule 2 (both
            columns stay runnable) and rule 5 (neither refinement is adopted),
            which are what this decision changes or upholds. ADR 0015 and
            spec/run-state.md section 3, because `stuck` is what a declined
            join produces. P5's three named costs, which this item must answer
            rather than discover
Outputs:    (1) ADR 0025 — the decision, ruling on JP-R7 and JP-R8 SEPARATELY
            and stating what it does to ADR 0003 rule 2;
            (2) whatever it ships: a policy under its own id in
            src/fold/policies.ts and POLICIES, or nothing;
            (3) spec/join-policy.md section 3 amended — JP-R7 and JP-R8 either
            cite the decision that adopted them or state that it refused them,
            and section 4's "neither pinned policy ever returns unsatisfiable"
            is true or corrected;
            (4) a Correction in place on ADR 0003, for the false claim that
            JP-R7 "repairs only the row P1 named";
            (5) AGENTS.md's "Pass `liveToken`" section made true again, and its
            Object.keys(POLICIES) comment turned into an assertion
Depends on: W15. It cannot be started on the plan's measurements — those are a
            reason to run W15, not a substitute for it
Blocks:     W17, which needs to know what policies exist before it can write an
            L6 row per policy
Tests:      L1 and L5. If a policy ships, its expected values come from the
            amended spec/join-policy.md section 3 — the wording of the NAME —
            and never from running it, which is the exact trap JP-R7 and JP-R8
            were written to catch. The four-column matrix is already asserted by
            W15, so a shipped policy MOVES a variant from the test tree into
            src/ and must not change a single cell in doing so: that
            equivalence is the item's sharpest assertion
Gate:       L0 through L5, plus check:docs and its self-test (AGENTS.md is
            edited). All five runtimes. Then pass 2 as doc/workflow.md
            section 6 defines it — TWO readers, the adequacy one in an
            ISOLATED COPY (v0.6)
Reserves:   Q95-Q98, ADR 0025-0026
```

**Every line is fillable. Two needed settling first and both are P5's measurements:** `Inputs:` —
that the `unsatisfiable` seam works end to end, so *"a policy that can say why"* is a capability
rather than an enum value nothing consumes; and `Outputs:` (2) — that adding a member to `POLICIES`
is a public-surface change with four assertions and one `AGENTS.md` snippet behind it, so *"ship a
fourth policy"* is not a one-line edit.

---

## Scope

**In**

1. **ADR 0025, ruling on the two refinements separately.** They are not one question: `JP-R7` is a
   three-row change to a policy that still loses on three rows, `JP-R8` is a one-row change to the
   winning policy on the row ADR 0003 records as its cost. **A single verdict covering both is a
   finding that the decomposition was wrong**, not a tidy result.
2. **The three costs P5 names, answered in the ADR** rather than discovered while writing it:
   - adopting `JP-R8` turns a run that **completes** today into one that is **`stuck`**, on
     `all-exit`. That is a behaviour change to the blessed policy, not an added capability;
   - it puts a clause in one column that `arrival-count` is structurally denied, which is the
     asymmetry `JP-R8` itself forbids — at a moment when the comparison it would have distorted is
     over. ADR 0003 rule 2 keeps `arrival-count` shipped *"for as long as both columns can be run"*,
     and the ADR must say whether that still holds;
   - a **fourth policy** beside `live-token` costs a name rather than a mechanism, keeps `live-token`
     byte-identical, and drags [Q5](../open-questions.md)'s per-join configuration question in
     behind it.
3. **Whatever ships, ships under its own id**, which is `JP-R7`'s and `JP-R8`'s own wording: *"if it
   is built it is built under its own `id`"*. A refinement adopted **into** `live-token` is the other
   answer and needs the ADR to say why the rule is being changed rather than followed.
4. **`spec/join-policy.md` section 3 amended, and section 4 re-checked.** Section 4 currently states
   as fact that *"neither pinned policy ever returns `unsatisfiable`"* and builds an argument on it.
   If that stops being true it is corrected with the rationale, not left as a stale sentence.
5. **ADR 0003's *Correction*.** Its *Consequences* says `JP-R7` *"repairs **only** the row P1
   named"*; W15 will have asserted the exact list. **The refutation is already inside that ADR** —
   its own 2026-08-30 *Correction* records that `optional-null` and `all-exit` are branch-index
   permutations of `routed-away` — so this is a second *Correction* on one document, and
   `doc/decisions/README.md`'s rule stands: deleting the notice would be the violation, not the edit.
6. **`AGENTS.md` made true, and one line of prose made into an assertion.** Its
   `console.log(Object.keys(POLICIES))` snippet is tagged ` ```ts run `, so it executes — but its
   expected value is a trailing **comment**, which `check-docs` asserts nothing about. **A third
   policy would leave that comment silently false with the gate green**, which is P3's absorption
   finding one layer down. It becomes a `throw`.

**Out** — named rather than left implicit, with where it goes instead

- **Deleting `arrival-count`.** ADR 0003 rule 2 keeps it and this item does not reopen that;
  whether the two-column requirement survives a refinement is *inside* ADR 0025, but removing the
  column is not on the table.
- **Per-join policy configuration.** [Q5](../open-questions.md)'s remainder. If a fourth policy
  ships, the ADR records that the question got sharper and does not answer it.
- **`src/driver/**`.** Untaken by declaration. The seam is measured working; if the decision needs a
  driver change, that is a finding for the Record and its own item — the disposition P4 gave
  `src/fold/**`.
- **A run-state change.** If the ADR wants a reported-unsatisfiable run to be distinguishable from a
  silently-hung one, `spec/run-state.md` is **W2's** and is not in this item's `Owns`. That is a
  seventh outcome or a new field, and it is its own item with its own ADR (0026 is reserved for
  exactly this).
- **[Q86](../open-questions.md) and [Q87](../open-questions.md).** P5's ruling sends them to P6.

## Verification

```bash
npm run gate
```

L0-L5 and both doc checks are inside it; `test:l6` and `test:l6:deno` also run and **must stay
green**, which is this item's early warning that the `examples/l6.ts:76` exception was needed. W17 is
what *adds* an L6 row.

**Which of the spec's named cases this item covers.** A branch routed away from its join (Q4): **yes
— it is the subject**. `user_action` (Q17): **yes**, through the matrix rows the policies are run
against, unchanged. No matching decision edge (Q10): **yes**, the `branch.lost` rows, and they are
the three `JP-R7` does *not* repair. A duplicate task id (Q13): **not applicable**. A nested fan-out
(Q6): **not applicable**, `FD-V15` refuses it — and a policy that ships here inherits that limit
rather than answering it.

**Rule 8 binds this item** if it acts on any review finding, and **rule 7 (b) binds it now**: this is
an API change, so its provocations are written to the **rule** rather than to the fix. Enumerate:
every one of the six region events fed to a shipped policy's `step`; every one of the three `status`
values it can return; **each row the policy is asserted not to change**, one at a time — a refinement
that changes a fourth row must go red; the `POLICIES` set assertion in each of its four homes; and
the `AGENTS.md` snippet with the new member removed. **A set that only deletes the new policy is the
incomplete shape P4's retro measured three times running.**

## Record

*Filled in when the item is done. Delete the italic lines.*

| Clause | Verdict | Notes |
|---|---|---|
| L0 | | |
| L1 | | |
| L5 | | |
| check:docs + self-test | | |
| ADR 0025 | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors — **in an isolated copy** |
| re-run at `<sha>` | | |

| Declared output | Exists | What would fail without it |
|---|---|---|
| ADR 0025 | | |
| the shipped policy, or nothing | | |
| `spec/join-policy.md` amended | | |
| ADR 0003 *Correction* | | |
| `AGENTS.md` true, comment → assertion | | |

**What broke.**

**What this taught.**

**Questions raised.** *Q95-Q98, with one line each. They also go in `doc/open-questions.md`.*
