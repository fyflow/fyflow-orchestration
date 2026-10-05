# W16 — The decision, and what it ships

**Status:** done — **ADR 0025 answers Q24, and the two rules got different answers**
**Plan:** [P5](../plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) — the item that
answers [Q24](../questions/q24.md). **It is entitled to reach "neither", and P5 says so**: the plan
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
Reserves:   Q96-Q98, ADR 0025-0026 — **corrected 2026-08-31, before work
            started.** This line read `Q95-Q98` when P5 declared it; W15 then
            took **Q95** out of P5's Q91-Q100 block for the `at most once` latch,
            and W17 already holds Q99-Q100. The block re-cuts with no
            renumbering and no id is reused (`doc/workflow.md` section 3)
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
     byte-identical, and drags [Q5](../questions/q5.md)'s per-join configuration question in
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
- **Per-join policy configuration.** [Q5](../questions/q5.md)'s remainder. If a fourth policy
  ships, the ADR records that the question got sharper and does not answer it.
- **`src/driver/**`.** Untaken by declaration. The seam is measured working; if the decision needs a
  driver change, that is a finding for the Record and its own item — the disposition P4 gave
  `src/fold/**`.
- **A run-state change.** If the ADR wants a reported-unsatisfiable run to be distinguishable from a
  silently-hung one, `spec/run-state.md` is **W2's** and is not in this item's `Owns`. That is a
  seventh outcome or a new field, and it is its own item with its own ADR (0026 is reserved for
  exactly this).
- **[Q86](../questions/q86.md) and [Q87](../questions/q87.md).** P5's ruling sends them to P6.

## Record

**Status: done.** ADR 0025 answers Q24 and **the two rules got different answers** — `JP-R8`'s
refinement adopted as a third policy under its own id, `JP-R7`'s refused. `live-token` and
`arrival-count` are byte-identical, so ADR 0003 rules 1-4 stand and **all 36 matrix cells are
unchanged**: `node test/matrix/render.ts` is byte-identical across the decision, checked by
`git stash` and `diff` rather than by eye.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **green** | `deno lint`, and all five typecheck configs — node, browser, deno, tests, examples |
| L1 | **green** | `test/fold/policies.test.ts` gains a suite of six for the shipped policy; W2's `JP-R1` loop over `Object.entries(POLICIES)` picked the third policy up for purity, non-mutation, totality and `JsonValue` **with no edit to the loop** |
| L5 | **green** | four columns, 36 cells, **not one changed**. The refused variant keeps its column |
| check:docs + self-test | **green** | 17 snippets, **13 `run`** (was 11); `X5` reports **1 of 17**, still Q71 alone and still one; 12/12 self-test probes |
| **check:policies + self-test** | **green, and new** | `JP-R9`, and **rule 7 (c)'s first outing** after three plans carrying it. 10 probes, 10 caught — **after three failed at birth** |
| ADR 0025 | **written**, and its 36-cell table verified against `runCell` cell by cell, once, mechanically | |
| the whole gate | **green, exit 0**, three times  — at `2574de1` before any edit, at the built tree, and at the finished tree after both readers | 386 assertions in **five** runtimes (node 24.20.0, deno 2.9.6, chromium, firefox, webkit — the last two via `test:browser:all`, which `gate` itself does not run); **240 at L6** in node and deno, 15 runs each, **untouched** |
| conformity reader | **run — 2 blocking, 7 worth fixing, 9 noted; every one acted on** | It **re-derived all 36 cells from section 3 before opening a test**, and all 36 agree. Its two blocking findings are both about what the decision *said about itself elsewhere*: a **falsified sentence left standing in ADR 0003** — the same claim W16 had just corrected in the spec, in a file W16 owns and edited twice — and an **incomplete `Owns` audit**. Its sharpest non-blocking finding is a **code/definition gap**: `s.live > 0` where section 3 says *"reaches zero"*. Detail below |
| adequacy reader | **run in an isolated `git worktree` — 156 mutations, 45 survivors; 3 blocking families, all closed** | Chosen by walking `JP-R1`-`JP-R9` and section 4's obligation table. Its three blocking families were **the self-test's own machinery**, **the new check's wiring into the gate**, and **the shipped policy losing per-event cover in the promotion** — all three about the mechanisms W16 added, none about the policy. Detail below |
| re-run at `<sha>` | | *pending* |

| Declared output | Exists | What would fail without it |
|---|---|---|
| ADR 0025 | **yes** | Q24 stays open and `JP-R7`/`JP-R8` keep forbidding a build nobody may authorise. It is also the only place the four-column table is pasted |
| the shipped policy, or nothing | **yes** — `live-token-requiring-arrival` | a consumer whose fan-out branches all end elsewhere gets `completed` on a run whose join was reached by nothing. Eight tests in `test/fold/policies.test.ts` and the `all-exit` column go red without it, plus `check-policies` P1 |
| `spec/join-policy.md` amended | **yes**, v0.8 | `JP-R7`/`JP-R8` would still say both refinements are unbuilt while one is exported, and section 4's *"detected by the driver or not at all"* would be false. **`check-policies` P1 refuses the third name being absent** |
| ADR 0003 *Correction* | **yes**, *Correction 2* | *"repairs **only** the row P1 named"* is false and has been since P1, beside its own refutation. Nothing catches it — see *What broke* |
| `AGENTS.md` true, comment → assertion | **yes** | the `Object.keys(POLICIES)` comment was false the moment the third policy landed, **with the gate green**. It is a `throw` now: probe **E1** turns it red |
| **`JP-R9`** — a new normative rule in `spec/join-policy.md` section 3 | **yes** — *undeclared, added* | **This is the undeclared output, and the script below is only its test.** `Outputs:` (3) declared that `JP-R7`/`JP-R8` cite the decision and that section 4 be made true; **a new numbered rule is neither**, and the first version of this table hid it behind the check that enforces it — which is how a normative addition arrives without being argued. It is defensible on `spec/README.md` rule 1's terms and the rationale is stated in the rule and in ADR 0025 rule 6, but it is an addition and it is named here as one. Found by the conformity reader |
| **`scripts/check-policies.mjs` + self-test** | **yes** — *undeclared, added* | `JP-R9`'s test. Without it `spec/` and `POLICIES` are two hand-written copies of one claim and nothing compares them. Probes D1, D2, D5 |

### Files edited, audited by hand against `Owns`

`check-owns.mjs` is retired (P4's retro), so this is `git diff --name-only` and
`git ls-files --others --exclude-standard` read against the block, **re-taken after both readers**.

> **CORRECTED after the conformity reader, and the correction is itself the finding.** This table
> first said **"18 files: 10 inside `Owns`, 1 record-step, 7 exceptions"** and named only
> `doc/open-questions.md` as a record step. The real set is **22 files: 10 `Owns` + 5 record-step +
> 7 exceptions**. The four missing ones — `CLAUDE.md`, `README.md`, `doc/README.md` and the plan's
> Record — are exactly `doc/workflow.md` section 1 rule 5's other four, all legitimately edited and
> **none of them undeclared**. **The audit was written before the record step ran and never
> re-taken.**
>
> **Whether that is rule 5's second occurrence is a real question and this Record does not get to
> settle it.** The failure P2's retro measured, and the one that would bring `check-owns.mjs` back, is
> *"did you edit outside your `Owns`"* answered *"yes, and I did not notice"* — an **undeclared
> edit**. That did not happen here: no file was touched outside the declared set, and all seven
> exceptions were named. What happened is a **stale count in the audit of a correct set**, which is a
> different defect with the same symptom, and it was caught by a reader running the two commands
> rather than by the author re-running them last. **P5's retro decides which it is**, and the honest
> reading is that a by-hand audit taken at the wrong moment is exactly what a script would not have
> got wrong.

**25 files: 10 inside `Owns`, 5 record-step, 10 exceptions** — three more than before the readers, all three added to close a blocking finding — and the exceptions are the finding,
because **six of the seven were not foreseeable from the declaration and one of them contradicts it.**

| file | disposition |
|---|---|
| `spec/join-policy.md` · `src/fold/policies.ts` · `test/fold/policies.test.ts` · `test/matrix/{variants,variants.test,matrix.test,chain.test}.ts` · `AGENTS.md` · `doc/decisions/0003-*.md` · this file | **`Owns`** |
| `doc/open-questions.md` · `CLAUDE.md` · `README.md` · `doc/README.md` · `doc/plans/p5-*.md` | **record step** — all five of `doc/workflow.md` section 1 rule 5's files, and **all five were edited**, which the first version of this table did not say |
| `doc/decisions/0025-*.md` | **exception 1** — a new ADR file. `Reserves: ADR 0025` obliges writing it and `Owns` names only `0003-*.md`. **Every item that ever reserved an ADR had this same gap**; see *What this taught* |
| `scripts/check-policies.mjs`, `scripts/check-policies-selftest.mjs` | **exception 2** — `JP-R9`'s check. The convention is that an item adding a check names it in `Owns` (W1, W5 and W9 all do); this item did not know it would add one |
| `scripts/check-source.mjs` | **exception 8, added after the adequacy reader** — `S11`, every `check:*` script reachable from `npm run gate`. **It has to live here**: a wiring check inside the script that was dropped from the chain cannot fire. That file is in nobody's declared `Owns` |
| `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | **exception 9, added after the adequacy reader** — X4 now refuses `if (false)` in a `run` snippet, and `X4c` floors the run-snippet count. **W9's files**, taken because the reader showed this item's own Output (5) was weaker than it claimed: both `throw`s could be made unreachable, and the whole snippet deleted, with the gate green |
| `package.json` | **exception 3** — two scripts, and two links in the `gate` chain |
| `spec/README.md` | **exception 4**, and **forced rather than chosen**: `check-spec`'s `C8` fails unless the index's version column matches the document's own header, so **any** `spec/**` version bump drags this file in. It is W1's |
| `doc/decisions/README.md` | **exception 5** — the correction-rule paragraph, plus the index, which was **missing ADR 0022 and ADR 0023 entirely** |
| `src/driver/policy.ts` | **exception 6, and it contradicts this item's own `Out` list**, which says `src/driver/**` is untaken. One line, comment-only: `JoinPolicy.id`'s docstring named the two ids and *"a Q24 variant"*, which the decision made false. Leaving a false comment because of file ownership is the absorption P3's retro named; a behavioural change there would not have been taken. **W18 owns this file next and should know** |
| `examples/l6.ts` | **untouched — the ONE declared exception went unused, and its stated reason was false.** See *What broke* |

**The working tree also carries a second, unrelated changeset and this audit does not cover it.**
After both readers had reported, the maintainer moved `fyflow-scheduler` from a working-tree link to
the registries —
[ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md),
forced by an incident during this item's own adequacy pass. That touched
`package.json`, `package-lock.json`, `deno.lock`, `examples/deno-import-map.json`,
`scripts/check-scheduler{,-selftest}.mjs`, `doc/decisions/0013-*.md`, `doc/scheduler-upstream.md`,
`examples/README.md` and the four index documents, and **none of it is W16's** — it takes its own
ADR, outside every plan's reserved block, for exactly that reason. **It is written down here rather
than left for a reader to subtract**, because the blocking finding above was an audit that had
quietly gone stale, and an audit that silently absorbs a second changeset is the same defect one size
larger.

## Verification

Full `npm run gate` twice, exit 0 both times — at `2574de1` before any edit, and at the finished
tree. **Levels that ran:** L0, L1, L2, L3, L4 and L5 in five runtimes; **L6 ran and stayed green**,
unchanged, in node and deno. **Levels that did not run:** **L7** — no person has looked at a trace for
this item, and the rendered table is byte-identical to the one W15's readers saw, which is what makes
skipping it defensible rather than convenient.

```bash
npm run gate
```

**Which of the spec's named cases this item covers**, carried from the declaration with the verdicts
filled in. A branch routed away from its join (Q4): **yes — it was the subject**, and the decision
turns on `all-exit`, which is the same event three times over. `user_action` (Q17): **yes**, through
the `suspended`, `resumed` and `lost-resolved` rows, which the shipped policy treats exactly as
`live-token` does — probes A6, A7, A8 and C2 are what say so. No matching decision edge (Q10):
**yes**, the `branch.lost` rows, and they are three of the three `JP-R7` does *not* repair. A
duplicate task id (Q13): **not applicable**. A nested fan-out (Q6): **not applicable**, `FD-V15`
refuses it — and the shipped policy inherits that limit rather than answering it.

### Rule 8's provocations, written to the RULE

**60 mutations by the author (33 before the readers, 27 acting on them), and the shape of the result is the finding.** The set is the one this item's
declaration named, instantiated against `spec/join-policy.md`'s clauses rather than against the fix.
Each is a single edit, precise enough to re-run.

| family | mutations | survivors |
|---|---|---|
| **A** — every one of the six region events into the shipped policy's `step` | 8 | **0** — between 5 and 27 tests red each |
| **B** — every one of the three `status` values it can return, and the `positive` pin | 6 | **0** — between 1 and 29 tests red each |
| **C** — each row the policy is asserted not to change, one at a time | 4 | **0** |
| **D** — the `POLICIES` set in each of its homes, and the `JP-R8`-forbidden fold-in | 5 | **0** |
| **E** — `AGENTS.md` with the new member removed, and its assertion inverted | 2 | **0** |
| **F** — the two things this item CREATED: section 3's third-row wording, and ADR 0025's pasted table | 5 | **4** |
| **G** — the conformity reader's `s.live !== 0` fix, per rule 8 | 5 | **0** — including the one-line revert, which turns exactly the new test red |
| **H** — the self-test's own machinery, after the adequacy reader's family 1 | 10 | **4**, and they are the documented boundary rather than a gap: the outermost verdict of a self-grading file |
| **J** — `S11`, the gate-wiring check, per rule 8 | 5 | **0** |
| **K/L** — the per-event loop, the `describe` identity and the matrix-column subset, per rule 8 | 7 | **0**, including the two on `live-token` that no test had ever covered |

**Every probe written to a rule went red. Every probe aimed at the deliverable survived.** That is
W15's finding reproduced exactly, in a different work item, with the amendment already in force —
**two occurrences in two items**, which is `doc/workflow.md` section 6 pass 3 rule 2's bar. Detail:

- **`C` could not be run as the declaration asked, and why is a finding about the matrix rather than
  about the probe.** The nine rows produce only **four distinct final states** under this policy:
  `{live:0,positive:true,arrived:2}` (all-arrive, resumed), `{0,true,1}` (routed-away, lost-settled,
  lost-resolved, optional-null, six-events), `{1,true,1}` (suspended) and `{0,true,0}` (all-exit). A
  policy's verdict is a pure function of its state (`JP-R3`), so **no mutation of the policy can
  change exactly one of those five** — to this policy they are one row. C1-C4 break one equivalence
  class each instead, and this Record says four rather than claiming nine.
- **`D4` was vacuous on its first run and reported as a survivor.** It appended a comment to
  `live-token` and called that *"the refinement folded in"*. Rewritten to actually fold the clause
  and the counter into `liveToken`, **18 tests go red** — including `test/matrix/variants.test.ts`'s
  *"live-token is untouched"*, which exists for precisely that move. The vacuity check saw the file
  change and could not see that the behaviour had not, which is rule 7 (b)'s limit stated as a
  measurement.
- **`F` — four survivors, all inside what this item created.** `F1`/`F1b`: rewriting section 3's
  third row to demand **two** arrivals, or deleting its `unsatisfiable` clause outright, leaves the
  whole gate green — `JP-R9` compares **names**, never definitions, and nothing else reads that
  prose. `F2` is the same class. `F3`/`F4`: changing a cell of ADR 0025's pasted table, or deleting a
  whole column from it, is invisible to everything.
- **What was done about `F` rather than written about it.** ADR 0025's table was verified **once,
  mechanically**, cell by cell against `runCell`: 9 rows × 4 columns, **all 36 reproduce**. That
  turns *"I transcribed it carefully"* into a measurement. It is deliberately **not** a checked-in
  check: [Q94](../questions/q94.md) resolved that each ADR carries the table it decided from, which
  is stale-by-design, and a standing assertion would force a future item to edit a decided ADR. The
  spec-wording half has no mechanism at all and this Record does not pretend otherwise.

**What broke.**

1. **This item's `Reserves:` line was wrong before any work started** — it read `Q95-Q98`, and W15
   had taken Q95 out of P5's block for the `at most once` latch. Corrected in place to `Q96-Q98`; W17
   already holds Q99-Q100, so the block re-cuts with no id reused and nothing renumbered.
2. **The one declared exception went unused, and its stated reason was false.** The declaration said
   `examples/l6.ts:76`'s `policyId: 'arrival-count' | 'live-token'` *"stops compiling the moment
   `POLICIES` gains a member"*. It does not: the union is a **subset** of `PolicyId`,
   `POLICIES[e.policyId]` still resolves, and `typecheck:examples` and both L6 runs are green with a
   third policy shipped. **So nothing at L6 forces a row per policy** — a fact
   [W17](w17-the-all-exit-row-at-l6.md) needs before it writes one, because the type it would have
   relied on to notice is inert. The file is untouched.
3. **`check-policies.mjs` failed three of its own ten probes at birth**, and rule 7 paid for itself
   before the check shipped. **Two were holes in the check**: a spec row whose id cell was an empty
   pair of backticks parsed as a *name* and kept the row count above P3's floor, so a **malformed
   table was reported as a spec change**; and P1/P2 still ran when a half could not be parsed, burying
   the one actionable failure under three that were true of the parse. **One was a bad probe** — it
   rewrote a heading's text, which the section regex does not read, so nothing broke and nothing was
   reported.
4. **`doc/decisions/README.md`'s index was missing ADR 0022 and ADR 0023**, both shipped by P4.
   Backfilled while adding 0025. That file is not in `doc/workflow.md` section 1 rule 5's record-step
   list, so nothing obliged P4 to write them and no check noticed — a **fourth address** for *"`doc/`
   is checked by nothing"*, beside Q43, Q94, and the ADR 0003 sentence that has now been corrected
   twice by two readers a day apart.

**What this taught.**

1. **The plan's conclusion survived and its argument did not, and only the second was checkable.**
   P5 recorded that the measurements point at adopting `JP-R8` and refusing `JP-R7`, and told this
   item it was *"not entitled to inherit it"*. Both halves of the verdict are what the evidence gives
   — **and the plan's stated reason for refusing `JP-R7` is not the reason.** The plan said *"a
   three-row change to a policy that still loses on three"*; the reason is that its divergence from
   `live-token` is `waiting`-against-`satisfied` on **every** row where they differ, so its whole
   contribution is a silent hang, and that on the row it repairs it fires a join zero branches
   reached. Inheriting the conclusion would have shipped the right decision behind an argument a
   reader could refute.
2. **A reserved ADR id obliges creating a file that no `Owns` block names, and this is P4's retro's
   own finding un-generalised.** That retro fixed exactly this shape for `doc/open-questions.md` —
   *"every `Reserves:` line obliges an item to write to the register, which the list did not name"* —
   and three correct audits followed. **`Reserves:` names ADR ids too**, and `doc/decisions/` is in
   neither the record-step list nor any `Owns` block. Every item that ever reserved an ADR wrote an
   undeclared file. The fix is the same one-word fix, and it is P5's retro's to make.
3. **`spec/README.md` is not an exception a spec-owning item can decline.** `check-spec`'s `C8` makes
   the index's version column a *consequence* of any `spec/**` version bump. An item that owns a spec
   document owns that row in practice, and a declaration that says otherwise is wrong before it
   starts.
4. **The number every Record here calls "assertions" is a count of test cases.** `test/runner.ts:62`
   prints `passed + failures.length`, and `passed` is incremented once per `test()` body in
   `test/harness.ts` — not once per `equal`, `ok` or `throws`. *"386 assertions"* is 386 **cases**.
   Four plans have carried the wrong noun on the number they quote most often, which is this
   repository's own *"state the predicate that produces it"* failing on its most-quoted figure.
   [Q98](../questions/q98.md).
5. **Rule 7 (c) fired and it discriminated on its first real use** — third plan of carrying it. Nine
   of the ten probes trip exactly one check and the tenth declares a **structural** cascade: a name in
   `POLICIES` the spec does not fix can only be introduced by pointing at some existing policy
   object, whose own `id` is then not that key, so P1 and P2 are both true of it. The first version
   of that probe declared P1 alone and was reported as a hole — correctly. **And the form caught
   something membership would not have**: probe 4 tripped the **empty set**, which *"the named check
   is among those that failed"* also rejects, but only by accident — set equality is what states the
   expectation the probe was actually making.

### What the conformity reader found, and what changed

**Its method is the reason it found what it did**: it re-derived every one of the 36 cells from
`spec/join-policy.md` sections 2-3 **before opening a test or the ADR's table**, and all 36 agree —
so its verdict on the decision (*"ADR 0025 follows from the evidence"*) is an independent derivation
rather than a review of mine. Everything it found is in what the decision **said about itself**.

| | finding | done |
|---|---|---|
| **blocking** | **`doc/decisions/0003-*.md` still asserted *"neither shipped policy ever returns `unsatisfiable`"***, in its *What it does not decide* section. Three are shipped and one does. **W16 corrected the identical sentence in `spec/join-policy.md` section 4 — carefully re-scoping it from *shipped* to *pinned* — and left this one standing**, in a document it owns, in the same pass that added a superseded notice and a *Correction 2* to it | re-scoped in place to *"the two policies this ADR compares"*, with the correction visible and attributed |
| **blocking** | **the `Owns` audit said 18 files and 1 record-step; the real set is 22 and 5.** `CLAUDE.md`, `README.md`, `doc/README.md` and the plan's Record were all edited and none appeared in the table | corrected, with a note on which failure class it is and an explicit refusal to rule on that itself — see the box above |
| worth fixing | **`liveTokenRequiringArrival.status` used `s.live > 0` where section 3's third row says *"reaches zero"* and *"as `live-token`"***, whose own test is `s.live === 0`. On a **negative** count the shipped policy said `unsatisfiable` where `live-token` says `waiting` — unreachable under `JP-R5`, and it matters more here than anywhere because **this is the only shipped policy whose verdict stops a run and reports it** | fixed to `s.live !== 0`, with a named test and **five provocations, all red** (family `G`). `live-token` already had *"does not fire on a negative count"*; the policy written beside it did not, which is W15's inheritance finding one more time |
| worth fixing | **section 4's new cell attributed general stuck detection to the driver.** ADR 0015 puts it in the **fold** — `stuck` is `regions[…].joined !== true` in run state, and `joinStatusOf` is a per-region accessor | corrected, and the old sentence's error named rather than silently replaced |
| worth fixing | **`JP-R9`'s headline was wider than the rule and wider than its check.** *"A policy `id` exists in this section or it does not exist"* is literally false here — `arrival-count-decrementing` is a live `JoinPolicy`, a matrix column and a **column header in ADR 0025's own table**, kept by that ADR's rule 3 | the operative sentence is now the headline, scoped to `POLICIES`, and the refused variant is named as the thing the rule must not forbid |
| worth fixing | **`JP-R9` is an undeclared normative addition and the Outputs table hid it behind its own check** | named as the undeclared output, with the script listed as its test |
| worth fixing | **ADR 0025 rule 2 said the 36-cell identity is *"asserted rather than claimed"*; nothing asserts it.** The item's own probes `F3`/`F4` show the gate cannot see that table at all | reworded to *measured*, with the reason it is not a standing check |
| worth fixing | **`CLAUDE.md` and `doc/README.md` reintroduced *"the one row it repairs"*** — the exact phrasing *Correction 2* exists to correct. `CLAUDE.md` also still said `spec/` holds **72** rules; `check-spec` prints **73** with `JP-R9` | both corrected; the rule count is a number the gate prints on every run and no document reads |
| noted, and acted on | the refusal argument has **two unstated premises** — every branch is opened, and a region has at least two branches. Without the second a zero-branch region makes the variant `satisfied` where `live-token` waits, which is a *strengthening* and the one shape that breaks the proof. And the argument is **silent about `arrival-count`**, over which the variant is strictly better | both added to ADR 0025's *Context*, the second with the reason it earns no id |
| noted | three smaller stale sentences — section 4's *"added back by whichever policy wins"*, section 5's *"the matrix has two columns"*, and `doc/decisions/README.md`'s **"three weeks of index behind"** when both ADRs are dated today | all three corrected. **The last one is mine and it is the class I was writing about**: a false claim invented *in the paragraph complaining that `doc/` is checked by nothing* |

**What it confirmed, which is worth as much as what it found.** All 36 cells unchanged (it re-took
the byte-identical render from a `git archive` of `HEAD` rather than trusting the Record's `git
stash`); `examples/l6.ts:76`'s union does not stop compiling; the nine rows collapse to four distinct
policy states; ADR 0025's table reproduces from `runCell`; the register's arithmetic is
self-consistent at 70/25/45; `live-token` and `arrival-count` are byte-identical apart from comments;
and the supersede-inside-rule-5 shape is legitimate under `doc/decisions/README.md`. **It could not
find a flow for which `JP-R7`'s variant is right and nothing else is** — which is the ADR's central
claim, tested by someone trying to break it.

**Levels it ran and did not.** L0-L5 in Node and Deno; `check:spec`, `check:docs`, `check:policies`
and both self-tests. **It did not run the three browsers or L6 in either runtime**, so its report
does not corroborate the *"five runtimes, 240 at L6"* line — the author's two full `npm run gate`
runs do.

### What the adequacy reader found, and what changed

**156 mutations, 45 survivors** — against the author's 33 and 5. The ratio is the one
`doc/workflow.md` section 6 records for this split (W5: 19/2 by the author, 148/38 by the reader) and
it reproduces almost exactly. **All three blocking families are about the mechanisms this item added,
and none is about the policy** — which is the same sentence as the conformity reader's verdict, from
the other direction.

| | family | done |
|---|---|---|
| **blocking** | **`check-policies-selftest.mjs`'s own machinery was unguarded — 9 survivors.** `PROBES = []` reported *"0/0 probes caught"* and exited **0**; so did deleting two probes, `return 0`, `refused = true`, dropping the set-equality comparison (**rule 7 (c) itself**), and disabling the matched-nothing guard. Meanwhile **15 of 15** mutations of the *check* were caught. **The check was well probed and the probes were protected by nothing** — W9's finding one layer up, and the vacuity `check-policies`' own P3 comment cites rule 7 (b) for | a **floor** on `PROBES.length` (now 13) and on `META.length`, and a **META pass**: the whole probe suite is re-run against six deliberately broken copies of `check-policies.mjs` and must come back non-zero. **6/6 noticed.** Provoked ten ways: **6 red, 4 live** — see the boundary below |
| **blocking** | **the new check's wiring into the gate was asserted by nothing — 4 survivors.** Removing `check:policies` from the `gate` chain, removing `check:policies:selftest`, and replacing the script body with `node --version` all left `npm run gate` **green**. `JP-R9`'s test clause says *"run by `npm run gate`"*; the first half was checked and **the second half was prose** — W15's `render.ts` finding one level up | **`S11`** in `scripts/check-source.mjs`: every `check:*` script is named in `gate` **and runs a file under `scripts/` that exists**. It lives there, not in `check-policies.mjs`, because a wiring check inside the script that was dropped cannot fire. Five provocations, all red |
| **blocking** | **the promoted policy LOST clause cover in the move — 6 survivors.** `variants.test.ts`'s suite tests non-mutation over **all six event types**; `policies.test.ts`'s per-policy loop tested **`branch.opened` only**. So promoting a policy *into* `POLICIES` moved it from the stronger cover to the weaker one — the exact inverse of what the promotion was supposed to buy. Three survivors were the shipped policy mutating `S` in place, **two were `live-token` itself**, which had never had the per-event form, and one was `arrival-count` pushing into its own array. The only aliasing test in the repository was written for `arrivalCount`'s **array** and cannot see a policy whose state is all primitives | the per-policy loop now runs **all six events**, and gains a per-policy `describe(state) !== state`. Six provocations, all red — including the two on `live-token`, which no test had ever covered |
| worth closing | **a shipped policy is not required to be EXERCISED.** The reader added a fourth policy to `POLICIES` and to section 3, updated the three id literals that went red, and shipped it with **five clause assertions, no matrix column, no behavioural suite and no chain run** — 386 assertions, green. `JP-R9` makes the two *name* sets agree and says nothing about evidence, and ADR 0025 rule 3 **invites** the next refinement to arrive by that road | `SHIPPED_POLICY_IDS ⊆ MATRIX_POLICY_IDS` asserted in `matrix.test.ts`. True since P1, asserted nowhere |
| worth closing | **`AGENTS.md`'s new snippet — 4 survivors.** Both `throw`s wrapped in `if (false)` → green, because X4 counts a **textual** `throw`; the helper rewritten to fabricate both answers → green; and **the entire new `run` snippet deleted** → green, because `check-docs` prints the run-snippet count and asserts no floor on it. This lands on this item's own Output (5): *"the comment became a `throw`"* is only as load-bearing as X4's textual test | X4 now refuses `if (false)` inside a `run` snippet, and **`X4c`** puts a floor on the run-snippet count. Two new probes; `check-docs`' self-test is **14/14**. The floor is **scoped to a document that parsed** — unscoped it fired alongside five existing probes and turned each into a declared cascade, which is rule 7 (c) reporting a check that does not discriminate |
| worth closing | **two of `check-policies.mjs`'s own clauses had no probe** — the row-count floor and the unparseable-`POLICIES` case. And **`JP-R9`'s own row can be deleted from the spec** with the check that enforces it still green: a rule with a test and no declaration | three probes added (13 total), and P3 now refuses a spec that no longer declares `JP-R9` |
| noted | the spec-prose family — `JP-R7`'s ruling flippable to *"adopted"*, `JP-R9`'s test clause blankable, section 4's corrected consequence revertible, all green | **the class the author already recorded** (family `F`), confirmed independently and not closed. `JP-R9` compares names, never definitions |
| noted | **Q95's remainder is exactly as P6 has it.** The latch's *read* side is caught by `driver.test.ts`'s pre-existing *"a join fires at most once"*; the **write** side on the `unsatisfiable` path survives. W16 neither claimed nor closed it | left for W18 |
| noted | the ADR 0025 argument in `variants.test.ts` is **load-bearing**: six ways to weaken the refused variant, all red. All four id lists are tightly pinned — **16 of 16**, including a duplicated column, a reordered column and a junk id. Section 4's driver obligations for a shipped `unsatisfiable` policy: **17 of 19** caught | nothing to do |

**The boundary, measured rather than assumed, and it is the finding worth carrying.** After the META
pass, the self-test was provoked ten ways: **six red, four live** — and all four live ones are the
**outermost verdict**: `return 0`, skipping the META pass, lowering `MIN_PROBES`, and disabling the
matched-nothing guard. **Nothing inside a self-grading file can assert that the file grades.** Each
guard added has the same hole one level up, so the regress is written into
`scripts/check-policies-selftest.mjs`'s header as a map of what a reader still has to look at, rather
than closed with a fifth guard that would have a fifth hole. **Getting the META mutation right took
two wrong tries**, both recorded in place: mislabelling one of P1's two directions, then all of them,
each left the cascade probe discriminating by *cardinality* — only a full **P1↔P2 swap** makes every
probe's tripped and declared sets the same size and a different set, which is the only shape that
proves rule 7 (c)'s set equality is doing work.

**What it did not run**, and it says so: `test:deno`, the three browsers and L6 per-mutation, so a
mutation caught only there reads as a survivor in its report. The author's two full `npm run gate`
runs and `test:browser:all` cover that axis.

**Questions raised.** Q96-Q98, one line each; the full rows are in `doc/open-questions.md`:

| Q | |
|---|---|
| [Q96](../questions/q96.md) | should `live-token-requiring-arrival` be what the library tells you to pass, rather than `liveToken`? ADR 0025 rule 4 says no — a run that stops is the more expensive mistake to make by accident — **and nothing has measured which reading of `all-exit` real flows want** |
| [Q97](../questions/q97.md) | `stuck` still does not distinguish a **reported** dead join from a silent one, and this decision ships the first policy that can reach the reported case at all |
| [Q98](../questions/q98.md) | the number every document here calls *"assertions"* is a count of test cases |

**Reserved and unused: ADR 0026**, held for Q97's run-state change and **not** reissued. A seventh
outcome or a new field is its own item with its own evidence, and taking it here would have made a
`spec/run-state.md` change a side effect of a join-policy decision — which is the thing
`doc/workflow.md` forbids of spec changes in general.
