# W24 — The gate's own wiring, and the first self-test `check-source` has ever had

**Status:** **done** - 2026-09-03
**Plan:** [P8](../plans/p8-what-can-be-deleted-with-the-gate-green.md)

```
Spec:       none - this item defines it. The S-ids are `scripts/check-source.mjs`'s own
            vocabulary and no spec/ document names them
Owns:       scripts/check-source.mjs           (W1)
            scripts/check-source-selftest.mjs  (new)
            package.json                       (nobody's, until P8)
Inputs:     package.json's `scripts` object - the `gate` chain and the entries it composes.
            Nothing else; this item reads no source and no spec
Outputs:    S12 (the gate chain is a DECLARED SET, compared both ways), S13 (the composed
            sub-chains), scripts/check-source-selftest.mjs with a MIN_PROBES floor, and a
            `check:source:selftest` entry that S11 then guards
Depends on: nothing
Blocks:     W25 - which adds a `check:*` entry and should land in the WIDENED list
Tests:      the probes, checked in and re-runnable (`doc/workflow.md` section 5 rule 7).
            Expected values come from package.json's declared chain, never from running it
Gate:       L0 (own coverage), L1-L6 as regression and MUST NOT MOVE, then two readers
Reserves:   Q132-Q136, ADR 0032
```

## Why this item exists

**`npm run gate`'s chain is fifteen entries and eight of them are checked.** *(Written at declaration and left in the past tense it was written in: the chain is **sixteen** entries and **all sixteen** are guarded since this item, plus the three composed lists below. The Record is the current state; this section is why the item existed.)* `scripts/check-source.mjs:290`
is the **only** expression in this repository that reads `scripts.gate`, and its loop opens
`if (!name.startsWith('check:')) continue`. Measured at [P8](../plans/p8-what-can-be-deleted-with-the-gate-green.md)'s
declaration: with ` && npm run test:l6:deno` deleted from the chain, **all eight `check:*` entries exit
0** — [Q126](../questions/q126.md).

**And one level down, three composed lists are unguarded and no register row reaches them:**

| the list | what dropping one entry costs today |
|---|---|
| `typecheck` → five sub-typechecks | dropping `typecheck:deno` drops the **only** Deno typecheck, which is `RT-R3`'s and `RT-R4`'s rung |
| `test:browser` → `build:browser-tests` | the browser rung runs against a **stale bundle** and reports green |
| `lint` → `src/ test/ examples/ index.ts` | dropping `examples/` **un-lints the whole of L6** |

**The third is `doc/workflow.md` rule 8's fourth obligation applied to `package.json`**: a list of
directories is a loop bound, and nothing counts it.

## Scope

**In**

1. **S12 — the gate chain is a declared set, compared BOTH WAYS.** A named list of every entry
   `npm run gate` must run, asserted **equal** to the chain rather than contained in it. One-way
   inclusion catches a deletion and not an addition; equality catches both, and it is the same
   set-equality form `doc/workflow.md` rule 7 (c) already requires of a probe's declared checks.
2. **S13 — the composed sub-chains**, one clause per list in the table above.
3. **`scripts/check-source-selftest.mjs`**, the first negative test either `check-source` or
   `check-spec` has ever had, with a `MIN_PROBES` floor and a META pass over its own machinery.
4. **`check:source:selftest` in `package.json`** — which S11 then guards, and which S12's named list
   must then contain. **The check ends up covering its own wiring**, which is the property S11's
   comment already argues for.

**Out** — named rather than left implicit, with where it goes instead

- **`check-spec`'s self-test.** `check-spec` and `check-source` are the two scripts with no probes,
  nineteen clauses between them, and **only `check-source` is in this item's `Owns`**. Naming it here
  so the gap is not read as closed: it is **W25's file** for a different reason (C5's lift) and W25's
  declaration should rule on whether it takes the other eight clauses too.
- **Changing what the gate RUNS.** This item makes the gate notice its own chain. Adding
  `test:browser:all` to it is a cost decision and P8 declares it out.
- **Any `src/` change.** This item reads no source. If a probe here turns red in `src/`, that is a
  finding rather than a fix.
- **[Q100](../questions/q100.md)'s class** — a derived count printed and asserted by nothing. `S12`'s
  list is asserted, not printed, which is deliberate; the L6 table is not this item's.

## The decision this item takes, and what it costs

**S12 makes the gate chain an obligation**, and that is the point rather than a side effect: a plan
that adds a runtime to the gate must add it to the list, in `scripts/check-source.mjs`, in the same
commit. **That is [Q102](../questions/q102.md)'s exact shape** — `check-docs`' `RUN_FLOOR` obliges the
item that adds a snippet to raise it, sits in nobody's `Owns`, and **went stale silently in the
direction of weakness**.

**The difference is that `scripts/**` now has an owner**, which is what P8 exists for, so the
obligation has somewhere to land. **This item should say in its Record whether that is enough to close
Q102 or merely to move it**, and it is the more interesting of the two questions it carries.

**S12 is set equality and not a floor, for a measured reason.** A floor is what `RUN_FLOOR` is, and
`RUN_FLOOR` is the thing that went stale. A floor answers *are there at least N*; equality answers
*are these exactly the ones*, and only the second fails when an entry is **swapped** rather than
removed.

## Verification

**L0 — own coverage.** Each command named, not implied:

```bash
npm run check:source          # S1-S13, 13 published files
npm run check:source:selftest # the new probes, each declaring the exact SET it trips
npm run lint                  # deno lint, 43 files
npm run typecheck             # five projects
```

**L1-L6 — regression, and they must not move.** This item reads no source and no test, so **any
movement is a finding rather than a pass**:

```bash
npm run gate                  # exit code is the result; ~4 min
```

The expected numbers, to be re-derived rather than copied at the Record: **474 assertions / 19 files
× node, deno, chromium** and **489 assertions / 25 real runs at L6 × node and deno**. *(`npm run gate`
runs `test:browser`, which is **chromium only**; firefox and webkit need `test:browser:all`, which the
gate does not run. `474` counts `test()` **cases** and `489` counts individual assertions —
[Q98](../questions/q98.md) — so they are never added.)*

**Routing cases.** *Not applicable, and stated rather than left silent*: this item touches no routing,
no definition and no driver. A branch routed away from its join (Q4), `user_action` (Q17), no matching
decision edge (Q10), a duplicate task id (Q13) and a nested fan-out (Q6) are **all out of reach** —
`check-source.mjs` reads `package.json` and the published file list and nothing else.

## The provocation set — `doc/workflow.md` rule 8, all four obligations

**Written before the readers report, and RE-RUN after acting on them** (v0.8's second change, which
fired in all four of P7's items). Each probe declares the exact **set** of checks it must trip.

**(a) the rule's own clauses** — one per S12/S13 clause, both directions:

| # | probe | must trip |
|---|---|---|
| 1 | delete ` && npm run test:l6:deno` from `gate` | `{S12}` |
| 2 | delete ` && npm run lint` from `gate` | `{S12}` |
| 3 | **add** `test:scratch` to `gate` without adding it to the list | `{S12}` — the direction one-way inclusion cannot see |
| 4 | delete `typecheck:deno` from the `typecheck` chain | `{S13}` |
| 5 | delete `npm run build:browser-tests && ` from `test:browser` | `{S13}` |
| 6 | drop `examples/` from `lint`'s argument list | `{S13}` |
| 7 | delete `check:docs` from `gate` | ~~`{S11}`~~ **`{S11, S12}` — WRONG AT BIRTH, and set equality is what said so.** Declared as `{S11}`, the run reports **16/17** with *wanted [S11], got [S11,S12]*. The cascade is structural: `S11` forces every `check:*` name into the chain and `S12` forces the chain to equal `GATE_CHAIN` |
| 8 | point `check:policies` at `node --version` | `{S11}` |

**(b) the `Outputs` table's rows** — each declared output broken in a way that leaves it *present but
inert*, which is what W15 and W16 found rule-written probes blind to.

**(c) PROVENANCE — the source expression and NOTHING else** (v0.9's procedure, after
[Q112](../questions/q112.md) corrected this four times across three items). The value to attack is
*"what the gate actually runs"*: **substitute the source** — read the chain from a literal, from
`scripts.gate`'s **keys** rather than its text, or from a second copy of the list — and change nothing
else. A probe that also edits the expected literal is a rewrite and its survival says nothing.

**(d) LOOP BOUNDS** — v0.9's fourth obligation, and **this item is the case it was written for**: the
deliverable *is* a list.

| # | probe | must trip |
|---|---|---|
| 9 | delete one entry from the **named list** (leaving `gate` alone) | `{S12}` — equality's other direction |
| 10 | **empty the named list entirely** | `{S12}` |
| 11 | delete one **probe** from `PROBES` | the self-test's `MIN_PROBES` floor |
| 12 | **empty `PROBES` entirely** | `MIN_PROBES` — the whole list leaving, which is W23's reader's finding |
| 13 | lower `MIN_PROBES` to 0 **and** shorten the list | the META pass, or **it is recorded as surviving** |

**W23 ran five bounds probes deliberately, all five were caught, and its reader still found two more** —
*the author bounded the lists a row iterates, not the lists the file iterates*. The three lists **this
file** iterates are `PROBES`, the S12 named list, and each sub-chain's parts; probes 9-13 are written
to that reading and the adequacy reader should assume they are still too narrow.

**Where this stops, and it is measured rather than assumed.** `scripts/check-policies-selftest.mjs:30-45`
records the fixed point: **nothing inside a self-grading file can assert that the file grades.** Four
of its ten META probes still survive — the outermost verdict, the `MIN_PROBES` constant, the
"mutation matched nothing" guard. **This item inherits that ceiling and must not claim to have beaten
it**; the honest Record names which of its own guards are outside its reach.

## Record

**Done 2026-09-03.** `npm run gate` exit **0**, read as an exit code and not through a grep.

| Clause | Verdict | Notes |
|---|---|---|
| L0 own coverage | **pass** | `check:source` 13 checks / 13 published files / 16 gate entries; `check:source:selftest` **24 probes, 20 META gradings, 3 SELF gradings**, ~34 s; `lint` 43 files; `typecheck` 5 projects |
| L1-L6 regression | **pass, and UNMOVED** | **474 assertions, 19 files**, in node 24.20.0, deno 2.9.6 and chromium; **489 assertions, 25 real runs, 23 row labels** at L6 in node and deno. Identical to the pre-item baseline in the same three commands. *(`npm run gate` runs `test:browser`, which is **chromium only**; firefox and webkit need `test:browser:all`, which the gate does not run and this item did not run. `474` counts `test()` **cases** and `489` counts individual assertions — [Q98](../questions/q98.md) — so they are never added. 23 labels is derived: 25 rows minus the two **pair** rows, each of which is one label producing two runs.)* |
| conformity reader | **10 findings, 1 BLOCKING**, all acted on | Its blocking one was a claim W24 made **about its own work** — see *What broke* |
| adequacy reader | **43 mutations, 11 survivors, 5 BLOCKING**, all acted on | Worked in an isolated copy verified green first; **zero symlinks, zero reparse points** before and after; copy left in place, not forced |
| overlap | **3 of 16** | The `:selftest`-gutting hole, the false `lint`-row survivor, and *the report is a list nothing counts* were each reached by both, from different directions. Union 10 + 9 - 3; inside the 1-4 absolute band section 6 declares settled. The ordinal is not stated because it is not derivable without reading four P7 item files, and this is the line this repository miscounts |
| re-run at the fixes | **fired, and it changed an outcome** | Rule 8's re-run **after** acting. It caught a probe anchor off by four spaces, a `META` entry that could not fire, and — the real one — a `SELF` entry that reported *"the floor did not fire"* against a guard that is genuinely load-bearing, because a `SELF` child skipped the pass its mutation was visible in. The readers' own edits are checked in: **8 of them**, each now costing a probe or a grading |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| S12 — the chain as a set, both ways | **yes**, and ordered as well | probes *runtime dropped*, *lint dropped*, *entry ADDED*, *entry SWAPPED*, *REORDERED*, *trailing `&&`*, *unclassifiable segment*, *entry deleted from GATE_CHAIN*, *GATE_CHAIN emptied*, *entry run TWICE* — ten, where the declaration asked for five |
| S13 — the composed sub-chains | **yes**, plus two clauses derived from sources that are not the declaration | probes *typecheck:deno dropped*, *build:browser-tests dropped*, *examples/ dropped*, *a directory ADDED*, *a part deleted from a row*, *the typecheck row deleted*, *the test:browser row deleted*, *COMPOSED emptied*, *lint left to the derived clause alone* |
| `scripts/check-source-selftest.mjs` + `MIN_PROBES` | **yes**, three floors | `SELF`: one probe deleted, `PROBES` emptied, the report-row agreement disabled |
| `check:source:selftest` in `package.json` | **yes** | **NOT `S11` as declared.** Both readers found the declaration wrong: `S11` covered the entry being **deleted** and not the entry being **gutted**, and `"check:source:selftest": "node scripts/check-source.mjs"` left the whole self-test unrun with `npm run gate` at exit 0. `S11` gained a `:selftest` clause and a probe; all four `:selftest` entries had the hole |

**What broke.**

**1. The one survivor this item claimed for itself was not a survivor.** Its header said deleting the
`lint` row from `COMPOSED` costs 0 failures and offered to raise it as a register row. It costs 0 for
`check:source` — and turns `check:source:selftest`, **which this item put in the gate**, red: the probe
*"a directory ADDED to lint's argument list"* is refused by that row and by nothing else. The
measurement stopped one command early. Under rule 8's own definition a survivor needs a second route
confirming the clause **unreachable**, and the second route showed it **refused**. It is a `META` entry
now, and the register row was not written. **This is [Q43](../questions/q43.md)'s class — a false
claim about a measurement — inside the file built to refuse it.**

**2. `check-source.mjs`'s per-check report printed `ok` on every row of a failing run**, and had since
W1. `c.slice(0, 2)` took the id from a row label, so `S10` and `S11` both read as `S1`; with `S12` and
`S13` that would have been five rows reporting one check. Measured: exit 1, four failures listed, **all
thirteen rows `ok`**. Fixed — and the conformity reader then found the fix **could not be broken**
(reverting it cost 0 probes, and the whole `checks` array could be emptied for 0). Every probe now
requires the report's `FAIL` rows and the failure lines to name the same set. [Q100](../questions/q100.md)'s
class, and the first occurrence of it to be **closed** rather than recorded.

**3. Four written claims in this item's own comments were false and were corrected by measurement.**
*(a)* Two of the four self-grading ceiling holes copied from `check-policies-selftest.mjs` are **caught**
here, not live — `MIN_PROBES → 0` and `refused = true` — because a list one level out asserts the guard
**fires** rather than that it exists. *(b)* *"S11 guards eight of the gate's sixteen entries"* mixed two
vintages: 8 of 15 at declaration, 9 of 16 after. *(c)* *"Three lists live here"* was four. *(d)* *"Order
is deliberately NOT asserted … nothing depends on the order"* — `&&` in sequence is the only
implementation `doc/workflow.md` section 4's ladder has. Order is asserted now.

**4. The item's own probe table was wrong at birth, and set equality is what said so.** Probe 7
declared `{S11}` for dropping `check:docs` from the gate; the true set is `{S11, S12}` and the run
reported 16/17 rather than passing. The cascade is **structural** — `S11` forces every `check:*` name
into the chain and `S12` forces the chain to equal `GATE_CHAIN`, so the two cannot disagree about a
`check:*` entry that leaves. Confirmed independently by the conformity reader, which re-derived all
declared sets before running them. **Rule 7 (c)'s first outing in this file, and it fired.**

**5. Two lists that were guarded are now GONE instead.** `ALL_CHECKS` — the allowlist a probe's
*observed* set was filtered from — could lose **nine of its thirteen** entries for 0, and those nine are
exactly the ids no probe declares, which is to say the ones whose job is to catch a probe tripping a
check it did **not** name. An allowlist on the observing side of a set equality narrows the equality to
a universe the author chose. It is replaced by reading the ids out of the run's own output, so the
bound does not exist to be broken. The adequacy reader found the same shape for the derived lint
clause's **source** and for the derived clause's **loop over `GATE_CHAIN`**, of whose two live entries
only one was probed; both now have probes, and the second needed a probe that breaks **both halves at
once**, because with `COMPOSED` still declaring lint's arguments no single-half probe can tell one
route from two.

**6. Two reader findings collided, and fixing one dissolved the other.** The adequacy reader found
`missingFrom`'s `pool.splice` — the line that makes the comparison a multiset — deletable for 0. The
conformity reader's order finding was acted on in between, and sequence equality implies multiset
equality, so the deletion now **changes no verdict**: a chain running `lint` twice is still refused,
by the order clause, with a message that says *in a different ORDER* about a duplicate. Recorded
beside the line as a message-quality hole rather than dressed up as a grading that fires.

**What this taught.**

**[Q102](../questions/q102.md) — does an owner for `scripts/**` close it, or only move it?**
**It MOVES it, NARROWS it, and MULTIPLIES it. It does not close it**, and the conformity reader reached
the same three parts independently.

- **Moves.** `Owns` is per-item, not standing. `scripts/**` has an owner for the length of P8 and for
  no longer, so the obligation `S12` creates — *a plan that adds a runtime to the gate edits
  `scripts/check-source.mjs` in the same commit* — lands somewhere for now and nowhere afterwards.
  **What settles it is a measurement rather than an argument**: the next plan outside P8 that touches
  the gate chain either edits that file without a **late** exception, or reproduces Q102's mechanism
  with the check in force, which is section 6 pass 3 rule 2's second occurrence.
- **Narrows.** `S12` is set equality and not a floor, and that half is real. A floor answers *are there
  at least N*; equality answers *are these exactly the ones*. Measured by the probe that **swaps** an
  entry — sixteen before, sixteen after, `test:l6` gone — which a floor passes and equality does not.
  `RUN_FLOOR` went stale in the direction of weakness; `S12` cannot, because it fires in **both**
  directions on the commit that breaks it.
- **Multiplies.** This item ships **three more floors of exactly Q102's shape**: `MIN_PROBES`,
  `MIN_META`, `MIN_SELF`. Two are made to **fire** by a list one level out; `MIN_SELF` lowered together
  with emptying `SELF` survives and is in the ceiling list. **A check that creates an obligation is
  cheaper to write than one that discharges it, and this item wrote four and discharged three.**
- **`RUN_FLOOR` itself is untouched** and still in nobody's standing `Owns`.

**And the method finding, which is about where a survivor is looked for rather than how.** Both readers
independently found the same hole in *the entry this item adds* — a `:selftest` script gutted of
`--self-test` — and neither the author's twenty-four probes nor the item's declared thirteen could
reach it, because every one of them asked *what happens when the input is broken* and this one asks
*what happens when the CHECK IS NOT RUN*. `S11`'s own recorded survivor is the same sentence one level
out (*"being named in the chain is not the same as doing anything"*), and rule 8's four obligations do
not have that axis: it is not a clause, not an output row, not a provenance, and not a bound. **The
gate can be made to run a command that does nothing, and every obligation here is about what a command
asserts once it runs.** Two occurrences in one item is one item; whether it generalises is P8's retro's.

**Questions raised.** Q132-Q135, one line each, and written to `doc/open-questions.md`. **Q136 is
unused and is skipped.**

- **[Q132](../questions/q132.md)** — the self-test covers **4 of `check-source`'s 13 checks**; the other
  nine are pattern lists each emptiable entirely for 0 failures, and `check-spec`'s 8 clauses still
  have none at all.
- **[Q133](../questions/q133.md)** — the gate now spends about a minute proving its own checks can
  fail, ~34 s of it this item's, and nothing decided that it should.
- **[Q134](../questions/q134.md)** — `S12` now subsumes `S11`'s membership half, and `S11`'s prefix
  lookahead is deletable for 0; a probe pins it, and whether the clause should be retired is open.
- **[Q135](../questions/q135.md)** — a **third** row of the register renders its cells wrong, by a
  different mechanism than [Q131](../questions/q131.md)'s two: `Q87` spans blank lines and its status
  cell sits on a line that does not begin with `|`, so GFM ends the table above it. Not fixed, so the
  check has all three shapes to fire on.

**[Q126](../questions/q126.md) is RESOLVED** — the gate chain is 16 of 16 guarded, plus the three
composed lists one level down. **No ADR taken: 0032 and 0033 are reserved by P8 and both are skipped**,
which is what the plan predicted for an item that widens a list.

**`Owns` audit — `git diff --name-only` against `d8a9ea3`, run by hand.** Exactly three files:
`package.json`, `scripts/check-source.mjs`, `scripts/check-source-selftest.mjs` (new). Plus
`doc/open-questions.md`, `doc/README.md`, `CLAUDE.md`, `README.md` and the plan's Record, which
`doc/workflow.md` section 1 rule 5 grants. **Zero exceptions, declared or late** — the second item
running to take none, and the block was written from P8's index row rather than from the title.
*(The four other `doc/` files in `git status` are P8's declaration commit and predate this item.)*
