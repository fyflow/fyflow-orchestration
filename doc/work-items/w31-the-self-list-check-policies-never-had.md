# W31 — The `SELF` list `check-policies` never had

**Status:** **todo**
**Plan:** [P9](../plans/p9-when-a-check-stops-checking-what-notices.md)

```
Spec:       none - this item defines it. A self-test's list bounds are scripts/**'s own
            vocabulary and no spec/ document names them
Owns:       scripts/check-policies-selftest.mjs  (W16, then W28)
Inputs:     that file's own PROBES and META lists and the three verdicts W28 added to
            it. Nothing else; this item reads no src/, no spec/ and no document
Outputs:    a SELF list for check-policies-selftest.mjs with a MIN_SELF floor, entries
            that provoke each of the three W28 verdicts and the `ran:` guard, and the
            measured cost of check:policies:selftest on both sides
Depends on: W28 - the contract these entries provoke
Blocks:     nothing
Tests:      the SELF entries themselves. Expected values come from what each guard is
            for, never from running the file and recording what happened to fail
Gate:       L0 (own coverage), L1-L6 as regression and MUST NOT MOVE, then two readers
Reserves:   Q146-Q148
```

## Why this item exists

**This item was reserved and expected to go unused, and W28's adequacy reader is why it is not.**
[P9](../plans/p9-when-a-check-stops-checking-what-notices.md)'s work-items section reserved W31 for a
`SELF` pass and said so; [W28](w28-a-grading-names-the-probe-it-breaks.md)'s `Out` list named the
trigger in advance:

> *"If this item finds the missing `SELF` is what blocks its own grading, that is the signal to take
> W31 rather than to widen this one."*

**That is exactly what was found, and it was measured rather than argued.** W28's adequacy reader
(finding B6) put each of the three verdicts W28 shipped into `check-policies-selftest.mjs` under an
`if (false)` and ran the file:

| mutation | cost |
|---|---|
| `if (r.status === 3) why = …` — the ABORT verdict | **0** |
| `else if (r.status === 0) why = …` — STILL CAUGHT | **0** |
| `else if (!ran) why = …` — the crash guard | **0** |

**All three of them, in that copy of the contract, are unprovoked.** The other two self-tests have a
`SELF` list and each gained four entries in W28 that make those verdicts fire; this file has no list
at all, so nothing bounds `PROBES` or `META` from outside and nothing asserts that any guard in it
does anything.

**And the file has already been bitten twice by exactly that gap.** Its `MIN_META` read **5** against
a six-entry list — one grading could leave for exit 0, found independently by both of W28's readers
and mis-recorded as 5 by P9's own declaration census. And its `P3 disabled` entry was scored
*noticed* from W16 until W28 because its mutant **crashed**; the repair for that was itself still
fatal ([Q144](../open-questions.md)). Both are the kind of thing a list one level out is for.

## Scope

**In**

1. **A `SELF` list with a `MIN_SELF` floor**, because `bounded === SELF.length` is vacuously true at
   zero — W16's adequacy reader's finding on this same file, one list further out.
2. **One entry per verdict W28 added**, in the single-edit form W28 arrived at: edit the **`META`
   list** and leave the guard alone, so the question is *with the guard in place, does the run go
   red?* rather than the two-edit form, which asks it backwards and passed vacuously twice.
3. **Entries for the two bounds that have no list outside them** — one `META` entry leaving, and
   `META` emptied — which is what `MIN_META = 6` now exists for and what nothing currently fires.
4. **The cost measured on both sides.** `check:policies:selftest` is **2.7 s**, the cheapest
   self-test that grades anything; `SELF` children run `PROBES` and `META`, so the honest expectation
   is that this item makes it several times more expensive. **Say the number rather than the ratio**,
   and take two measurements, because P9 has already had to correct a duration quoted as a constant.

**Out** — named rather than left implicit, with where it goes instead

- **The `ALL_CHECKS` allowlist and the missing report-row `agree` clause.** W28's adequacy reader
  (N5) found this file did not inherit either from `check-source`, where W24 removed the allowlist
  for rule 7 (c)'s own reason. **They are a change to what the harness OBSERVES**, not to what bounds
  its lists, and P9's declaration measured the allowlist as **inert in all three files** — renaming a
  reported id to one outside each list was caught, because every id those checks report is declared
  by some probe. Named so a later item does not read this one as having closed it.
- **[Q144](../open-questions.md)** — the `names.join` on `check-policies.mjs`'s success path, which
  makes `P3`'s first clause unprobeable. The fix is one line **in `check-policies.mjs`**, which is not
  in this item's `Owns` and is a change to a check's behaviour rather than to its negative tests. It
  is the boundary P9 draws for every item in it.
- **[Q145](../open-questions.md)** — whether a `corpus` verdict should pass. A question about the
  grading's semantics in all three files, not about this file's lists.
- **Changing what `P1`-`P3` check.**

## The decision this item takes, and what it costs

**Every entry here is written to make a guard FIRE, not to remove it**, and that is W28's most
expensive lesson rather than a style preference. Four `SELF` entries were first written as *remove the
guard and supply the case it catches*; with the guard gone and the defect present the run goes
**green**, so `SELF`'s *"must exit non-zero"* reads as *the floor did not fire* whether the guard was
load-bearing or not. **Two of those four then passed VACUOUSLY for a second reason** — their anchors
quoted the guard's own source line, and that quote sits in the file **above** the guard, so
`String.replace` edited the entry rather than the guard ([Q143](../open-questions.md)).

**Both hazards are avoided by construction here**: single-edit entries that touch the `META` list,
which sits above `SELF` in the file, so nothing can self-match.

**The cost is the whole of the argument against this item**, and it should be stated plainly in the
Record rather than discovered by a reader. `check-policies:selftest` is the one self-test whose cost
is negligible, and this makes it several times larger to close three holes in a file whose check has
three clauses. **If the measured cost is disproportionate, saying so is a legitimate outcome** — but
it is a judgement to record after measuring, not a reason to skip the item, because W28's readers
measured the holes rather than predicting them.

## Verification

**L0 — own coverage:**

```bash
npm run check:policies:selftest   # 13 probes, 6 gradings, and this item`s SELF list
```

**The provocation that makes each new entry fail** (`doc/workflow.md` section 5 rule 7): for every
`SELF` entry, the guard it targets restored, and the measured cost. **The three verdicts must go from
0 to non-zero** — those exact numbers are W28's adequacy reader's finding B6 and are what this item
is judged against.

**L1-L6 — regression, and the expected result is NO MOVEMENT:**

```bash
npm run gate                      # 18 entries, all exit 0
npm run test:l6                   # 23 row labels, 25 real runs, 489 assertions
```

Baseline at `de795ad`: **474 `test()` cases** in 19 files across Node 24.20.0, Deno 2.9.6 and
chromium; **489 assertions at L6** in Node and Deno. *(`npm run gate` runs `test:browser`, which is
**chromium only**. The two counts count different things — [Q98](../open-questions.md) — and are never
added.)*

**Rule 8's four obligations**, written before the readers report and **re-run after acting on them**:

| obligation | what it means here |
|---|---|
| the rule's clauses | each `SELF` entry's own target guard, restored one at a time |
| the `Outputs` rows | every row of the Record's table, broken so it is present but inert |
| **provenance** | `bounded` read from the child's exit code and its self-test having run, not from either alone — substitute the source expression and nothing else |
| **loop bounds** | `SELF` itself: one entry out, the whole list out, and `MIN_SELF` set to 0 both alone and together with an emptied list. **The third case is the acknowledged fixed point** — `check-policies-selftest.mjs`'s own header records it and `check-source`'s re-measured it — so it is recorded rather than claimed closed |

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
| re-run after acting on the readers | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| a `SELF` list with `MIN_SELF` | | |
| an entry per W28 verdict — ABORT, STILL CAUGHT, `ran:` | | |
| entries for `META`'s two bounds | | |
| the cost, measured on both sides | | |

**What each guard cost when disabled, before and after.**

| guard | cost then | cost now |
|---|---|---|
| the ABORT verdict | 0 | |
| STILL CAUGHT | 0 | |
| the `ran:` crash guard | 0 | |
| one `META` entry deleted | 0 | |

**What broke.**

**What this taught.**

**Questions raised.** *From Q146-Q148; unused ids are skipped and never reissued.*
