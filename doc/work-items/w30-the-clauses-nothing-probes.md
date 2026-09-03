# W30 — The clauses nothing probes

**Status:** **todo**
**Plan:** [P9](../plans/p9-when-a-check-stops-checking-what-notices.md)

```
Spec:       none - this item defines it. The C-ids and S-ids are check-spec.mjs's and
            check-source.mjs's own vocabulary and no spec/ document names them
Owns:       scripts/check-spec.mjs             (W1)
            scripts/check-spec-selftest.mjs    (new)
            scripts/check-source.mjs           (W24)
            scripts/check-source-selftest.mjs  (W28)
            package.json                       (P8)
Inputs:     check-spec.mjs's own C1-C8 clauses and check-source.mjs's S4 and S7 clauses.
            Every fixture is hand-written from the clause's own text; NOTHING is captured
            from spec/ or src/ by running the check - doc/workflow.md section 5 rule 4
Outputs:    scripts/check-spec-selftest.mjs - the first negative test check-spec has ever
            had - with probes for C1-C4, C6, C7 and C8 each declaring the exact SET it
            trips, a META pass in W28's named-probe form, and MIN_PROBES / MIN_META
            floors; a `--self-test` flag on check-spec.mjs; `check:spec:selftest` in
            package.json AND in check-source.mjs's GATE_CHAIN; probes for S4 and S7 with
            the input overrides they need; and check-spec.mjs's report id read as the
            first WORD rather than the first two characters
Depends on: W28 - so this item's META entries are written in the new form rather than
            converted afterwards
Blocks:     nothing. It makes Q137 buildable and does not build it
Tests:      the probes, checked in and re-runnable. Expected values come from each
            clause's own text, never from running check-spec and recording what it said
Gate:       L0 (own coverage), L1-L6 as regression and MUST NOT MOVE, then two readers
Reserves:   Q149-Q150
```

## Why this item exists

**Sixteen of this repository's thirty-nine check clauses have no probe at all**, and all sixteen are
in the two scripts [P8](../plans/p8-what-can-be-deleted-with-the-gate-green.md) named as having none:

| | count | which |
|---|---|---|
| a probe **and** a grading | 13 | `C5`, `S8`, `S11`-`S13`, `M1`-`M5`, `P1`-`P3` |
| a probe that nothing grades | 10 | `D1`-`D5`, `X1`-`X5` — [W29](w29-the-two-self-tests-that-grade-nothing.md) |
| **no probe at all** | **16** | **`C1`-`C4`, `C6`-`C8`** (7) and **`S1`-`S7`, `S9`, `S10`** (9) |

**`check-spec.mjs` has no `--self-test` and never has had one.** It is W1's script, it holds eight
clauses over `spec/` — the directory `CLAUDE.md` calls the source of truth — and its negative tests
were run by hand once and written into a Record. That is `doc/workflow.md` rule 7 (a)'s *"a probe that
ran once is a claim about the past"*, over the oldest check here.

**[Q132](../open-questions.md) says `check-spec` has 8 clauses and 0 probes, and the count is wrong.**
`C5` has **two** — `scripts/check-markdown-selftest.mjs:386-401`, *a dead link inside `spec/`* and *a
dead ANCHOR inside `spec/`* — added by [W25](w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) one
item **after** Q132 was written at W24. **The row is right about the file and wrong about the number**:
seven clauses, not eight, and `C5`'s probes live in another script. Measured at P9's declaration.

**And one defect is already visible without running anything.** `scripts/check-spec.mjs:201` reads
`const id = c.slice(0, 2)` — **the exact expression W24 repaired in `check-source.mjs`**, where it
made `S10`-`S13` all report as `S1` and a failing run printed `ok` on every row above its own listed
failures. It is **inert today** because every C-id is two characters, and it goes live at `C10`. That
is [Q137](../open-questions.md)'s stated shape — *a lift moves an implementation and does not move the
guards the two sides needed differently* — one file across and in the opposite direction: **W24 fixed
its own copy and the sibling kept the defect.**

## Scope

**In**

1. **`scripts/check-spec-selftest.mjs`** — probes for `C1`, `C2`, `C3`, `C4`, `C6`, `C7` and `C8`,
   each declaring the exact **set** of checks it trips (rule 7 (c)), with `MIN_PROBES` and `MIN_META`
   floors because `caught === PROBES.length` is vacuously true at zero.
2. **A META pass over `check-spec.mjs` itself**, in [W28](w28-a-grading-names-the-probe-it-breaks.md)'s
   named-probe form — one entry per clause, each naming the probe it must break.
3. **`--self-test` on `check-spec.mjs`**, and **`check:spec:selftest` in `package.json`**, and **the
   same name in `scripts/check-source.mjs`'s `GATE_CHAIN`** so `S12` accepts the widened chain.
4. **Probes for `S4` and `S7`**, with the input overrides they need on the pattern of
   `CHECK_SOURCE_PKG`.
5. **`check-spec.mjs`'s report id read as the first word**, `c.slice(0, c.indexOf(' '))`, matching
   `check-source.mjs`. A repair, so rule 8 applies to it: **break it and watch the gate go red**, which
   means at least one probe has to make the report's `FAIL` rows and the failure lines disagree.

**Out** — named rather than left implicit, with where it goes instead

- **Seven of the sixteen: `S1`, `S2`, `S3`, `S5`, `S6`, `S9`, `S10`.** The cap is P9's decision 3 and
  it is stated because a silent cap reads as coverage. [Q132](../open-questions.md)'s own argument,
  checked and adopted: `S1`, `S2` and `S3` are guarded a second way by `typecheck:deno` and
  `typecheck:browser`; `S5`, `S6`, `S9` and `S10` are publish-set and reach bookkeeping with a second
  route. **`S4` and `S7` are the two the ladder has no rung for at all** — `S4` is Node's
  type-stripping list, which `RT-R9` exists for because all four typecheckers accept a construct Node
  refuses to load, and `S7` is
  [ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
  rule 1's only enforcement, which `CLAUDE.md` calls *"one autocomplete away from being broken"*.
  **The seven left out go into P9's exit artifact as *no probe*, not omitted from it.**
- **[Q137](../open-questions.md) — `C5`'s missing `M3`-style floor.** Its own row names the blocker
  this item removes: *"`check-spec`'s `C1`-`C8` have no self-test at all, so a new clause there ships
  unprobed unless that gap is closed first."* **It is still out**, because adding a floor changes what
  `check-spec` **checks** and this item's subject is its **negative tests**. This item leaves it
  buildable and says so.
- **Changing what `C1`-`C8`, `S4` or `S7` check.** The report-id repair is the one exception and it
  changes the report rather than a verdict.
- **`spec/` itself.** This item reads it and writes nothing into it. Every probe mutates a **copy**
  under `dev-dist/`, which is gitignored — W24's conformity reader's finding about leaving untracked
  files in the directory section 7 rule 2's by-hand `git status` audit reads.
- **Changing what the gate RUNS.** Adding `check:spec:selftest` is adding an entry the gate already
  implies — every other check has one — and P9 declares any *removal* out.

## The decision this item takes, and what it costs

**Every probe here is a constructed case with no live defect behind it, and that is the point rather
than an apology.** `spec/` passes `C1`-`C8` today and has passed since W1. So each probe has to build
the invalid `spec/` this repository does not contain: an example that does not parse, a rule id
declared twice, an invalid example naming no rule, a definition refusal with no case, a rule naming no
test owner, a valid flow that does not resolve against `registry.json`, a README version row that
disagrees with its document.

**That is exactly the second verdict [P8](../plans/p8-what-can-be-deleted-with-the-gate-green.md)'s
retro left open** — *a check written for a defect you have just fixed has no live case, so its probes
are not a supplement to its corpus but the whole of its evidence* — and this item is **nine instances
of it in one place**, against [W29](w29-the-two-self-tests-that-grade-nothing.md)'s counter-case where
the defect is live. **P9's retro judges the verdict on both**, and this item's Record should say which
of its nine probes it could not construct a discriminating case for, if any. W25's finding is the
warning: it shipped a check whose central rule **could not be falsified by the corpus it ships on**,
and only a reader noticed that the item's own fix had built the fixture that proved it.

**And this item is where P9 predicts the WIRING obligation is tested.** It adds `check:spec:selftest`
to `package.json` — the fourth entry of the shape both of W24's readers found broken, where dropping
` --self-test` leaves the whole self-test unrun with `npm run gate` at exit 0. **`S11`'s `:selftest`
clause now guards exactly that, and `S12`'s named list guards the entry's presence.** The prediction,
written before the item starts: **both fire, the hole already has a check, and P8's proposed fifth
obligation is therefore NOT earned.** If instead this item ships a wiring hole `S11` does not see,
that is the second occurrence and the obligation stands.

**[Q102](../open-questions.md) reproduces here for the third time, and it is predicted rather than
discovered.** `S12` obliges the literal in `scripts/check-source.mjs` whenever `package.json`'s chain
changes. W25 hit that as a **late** exception because P8's index row predated `S12`; this item's `Owns`
names the file up front. **The direction is the finding W24 recorded**: `RUN_FLOOR` went stale
*silently, toward weakness*; `S12` fails *loudly, toward safety*, naming both the entry and the file.

## Verification

**L0 — own coverage.** Each command named, not implied:

```bash
npm run check:spec               # C1-C8 over spec/, unchanged in behaviour
npm run check:spec:selftest      # the new probes, each declaring the exact SET it trips
npm run check:source:selftest    # 24 probes + S4 and S7, and S12 accepting the widened chain
```

**The provocations, checked in** (`doc/workflow.md` section 5 rule 7, all three requirements): one per
clause, committed and re-runnable, each declaring the exact set. **Three of `check-policies`' ten
failed at birth and two of those were holes in the check** — the expected outcome here is that some
fail at birth, and each one is a finding rather than something to quietly correct.

**L1-L6 — regression, and the expected result is NO MOVEMENT:**

```bash
npm run gate                     # 19 entries after this item, all exit 0
npm run test:l6                  # 23 row labels, 25 real runs, 489 assertions
```

Baseline at `76bf5e6`: **474 `test()` cases** in 19 files across Node 24.20.0, Deno 2.9.6 and
chromium; **489 assertions at L6** in Node and Deno; the gate chain is **18 entries** and becomes
**19**. *(`npm run gate` runs `test:browser`, which is **chromium only**. The two counts count
different things — [Q98](../open-questions.md) — and are never added.)*

**Rule 8's four obligations, on this item's own repairs**, written before the readers report and
**re-run after acting on them**:

| obligation | what it means here |
|---|---|
| the rule's clauses | each of `C1`-`C4`, `C6`-`C8`, `S4` and `S7` made **present but inert**, one at a time |
| the `Outputs` rows | every row of the table below, including the report-id repair and the `GATE_CHAIN` entry |
| **provenance** | each probe's expected set read from the run's own failure lines rather than from a literal the probe also writes — substitute the source expression and nothing else |
| **loop bounds** | `PROBES` and `META` here; **and `check-spec.mjs`'s own `mdFiles` and `jsonFiles` walks**, which is [Q137](../open-questions.md)'s subject and which this item probes even though it does not add the floor |

*Not applicable to this item: it touches no routing, so Q4, Q17, Q10, Q13 and Q6 are all outside it.*

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 own coverage | | |
| L1-L6 regression | | must not move |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| `scripts/check-spec-selftest.mjs`, 7 clauses probed | | |
| its META pass, in W28's named-probe form | | |
| `MIN_PROBES` and `MIN_META` | | |
| `--self-test` on `check-spec.mjs` | | |
| `check:spec:selftest` in `package.json` **and** in `GATE_CHAIN` | | |
| probes for `S4` and `S7`, with their input overrides | | |
| the report id read as the first word | | |

**What each clause cost when made inert, before and after.**

| clause | cost then | cost now |
|---|---|---|

**The probes that failed at birth, and what each one was.**

**What broke.**

**What this taught.** *Including the verdict on P8's two proposed `doc/workflow.md` changes, which
this item and [W29](w29-the-two-self-tests-that-grade-nothing.md) supply the two halves of.*

**Questions raised.** *From Q149-Q150; unused ids are skipped and never reissued.*
