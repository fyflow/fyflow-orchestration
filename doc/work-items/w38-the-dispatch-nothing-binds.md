# W38 — The dispatch nothing binds

**Status:** done
**Plan:** [P11](../plans/p11-what-should-the-gate-prove.md) — *what should the gate prove, and what is
it actually proving?*

```
Spec:       none - this item is about the gate's own wiring, which spec/ does
            not describe. doc/workflow.md rule 8 obligation (e) is the
            authority, and it is a process rule rather than a normative one.
Owns:       scripts/check-wiring.mjs, scripts/check-wiring-selftest.mjs
            (both NEW - see the amendment below), scripts/check-source.mjs,
            package.json's two new entries, and the `--self-test` dispatch
            block in the six scripts/check-*.mjs
            (check-source-selftest.mjs was declared and is NOT edited: the
            probes moved to the new file with the clause. Over-declared
            rather than undeclared - W38's conformity reader.)
Inputs:     P11's fact 2, read from that plan's OWN file: the dispatch cut by a
            brace match leaves all six at exit 0 with the self-test unrun.
            S11's four clauses, read from check-source.mjs itself.
Outputs:    G1 - for every `:selftest` gate entry, the script it names must
            ROUTE `--self-test` to a self-test, proved by RUNNING it rather
            than by reading it. Q149 closed, provoked in all seven.
            G2 - and the module it routes to WITH NO OVERRIDE SET must be its
            own, which is the only configuration the gate ever runs and the
            one configuration G1 structurally cannot observe. Both readers.
            G3 - and the manifest's entries for it are derived from DISK,
            both ways, so neither is repointable or deletable for zero.
            (Declared as `S14` in check-source, one clause, plus a second
            about the no-flag case. Every part of that changed under
            measurement or under a reader - see below.)
Depends on: nothing
Blocks:     W39 - P11 decision 2 orders them, on the ground that a dispatch
            nothing binds gets harder to reason about if the cost decision
            moves self-tests out of the gate.
Tests:      scripts/check-wiring-selftest.mjs - 16 probes, 8 META gradings,
            6 SELF entries. Expected values from what the dispatch DOES, not
            from what its text looks like.
            (Declared as six probes in check-source-selftest.mjs, one per
            check, plus the negative half; the file moved with the clause and
            the negative half was dropped under measurement - see below.)
Gate:       L0, check:wiring, check:wiring:selftest, check:source,
            check:source:selftest, then the whole gate, then the
            spec-conformity pass (two readers).
Reserves:   Q176-Q178
```

## Scope

**In**

*This section is the declaration, and three of its four items were changed by measurement or by a
reader. The changes are marked in place rather than rewritten away, because what the item expected is
half of what its Record is evidence for.*

1. **`S14`, and it binds behaviour rather than text.** For each `:selftest` entry in the gate chain,
   run the script it names **with** `--self-test` and an override pointing its self-test module at a
   stub, and require the stub's sentinel exit code. Then run it **without** the flag and require the
   stub *not* to be reached. Two clauses, because the first alone is satisfied by a script that
   dispatches unconditionally.
   → **Shipped as `G1` in a new `scripts/check-wiring.mjs`** (cost; see the amendment), and the
   negative half was **dropped on a measurement** — it costs 8.4 s to ask, and its absence is loud
   rather than quiet. **Two clauses became three, and neither of the two new ones is this one's
   negative half**: `G2` binds the DEFAULT the dispatch loads when nothing sets the override, and
   `G3` binds the manifest's entries to the disk. Both came from the readers.
2. **A uniform `CHECK_<NAME>_SELFTEST` override in all six.** Two have one already
   (`check-source`, `check-markdown`); the other four are given the same shape. It is the idiom this
   repository already uses eleven times over — `CHECK_SPEC_DIR`, `CHECK_SCHEDULER_DTS`,
   `CHECK_SOURCE_PKG` and the rest — and it is what makes clause 1 cost **0.109 s** per check
   instead of a self-test run.
   → **Seven, not six** — the new check has one too, which is what makes it self-covering — so
   **five new**, not four. The per-check figure is **0.13-0.19 s**; 0.109 was one reading written as
   the number.
3. **Six probes, one per check**, because P11's fact 2 is six measurements and not an extrapolation.
   → **Sixteen probes**: seven dispatch probes (the seventh being this check's own), one that breaks
   routing while leaving the dispatch's shape intact, three that break the shape while leaving routing
   intact, four manifests, and one unreadable manifest. Plus **8 `META` gradings and 6 `SELF`
   entries**, the last of which the declaration did not ask for and the adequacy reader did.

**Out** — named rather than left implicit, with where it goes instead

- **What the gate should COST.** That is **W39** — literal text and not a link, because the file does not exist yet and `check-markdown`'s `M1` chases every relative link. *(It was a link for about a minute, and `M1` said so.)* It takes **ADR 0039**. This
  item makes the existing cost harder to delete by accident and takes no view on whether it should be
  paid.
- **[Q158](../open-questions.md)** — a whole `*.test.ts` file renamed out of the runner's glob,
  noticed by nothing. It is the same class one directory across, it is in nobody's `Owns`, and P11
  declared it out by name.
- **The other five checks' clause lists.** `S14` reads the manifest for WHICH scripts to test and the
  scripts for WHETHER they route; it does not grow `check-source`'s coverage of anything else.

## Verification

| Clause | How it is run |
|---|---|
| **L0** | `npm run lint`, `npm run typecheck` — **and neither reaches this item's two files.** `lint` is `deno lint src/ test/ examples/ index.ts` and no tsconfig `include` names `scripts/`, so the rung is true and says nothing about the deliverable. There are **four** `tsc` projects plus a `deno check`, declared in `COMPOSED` in the very file this item owns. W38's conformity reader; [Q177](../open-questions.md) |
| **`G1`, `G2` and `G3` themselves** | `npm run check:wiring` |
| **they can fail** | `npm run check:wiring:selftest` — 16 probes, 8 META gradings, 6 SELF entries |
| **the amendment's own subject** | `npm run check:source`, `npm run check:source:selftest` — the entry the clause was moved OUT of, run to show what it costs now |
| **the whole gate** | `npm run gate`, written to a log with `echo "GATE EXIT=$?"` appended, and read from that line |
| **conformity** | the rule first, the code second |
| **adequacy** | mutation in an isolated copy |

**Routing cases** (`doc/workflow.md` section 5 rule 6): **not applicable.** This item touches no
definition, no driver and no policy; it adds a clause to a static check over `package.json` and
`scripts/**`. Stated rather than left silent, which is what that rule asks.

**Rule 8, all five obligations, plus v0.11's requirement on the harness.** **Obligation (e) is what
this item IS** — a check that is not run — so the interesting probes are the other four, and
especially **(c) PROVENANCE**: the clause reads which scripts to test from `package.json` and whether
they route from the scripts themselves, and a swap that reads both from one place would make it
tautological. **v0.11's harness requirement is a prediction P11 wrote down for this item**: the set
carries a control, mutations are written to the tree and restored from a byte snapshot, and **the
restore is asserted by comparing an md5 back** before the next provocation runs.

## The trap this item is most likely to fall into, named before it starts

**A substring test.** The obvious clause is *"the file contains `--self-test`"*, and that is
**precisely the defect W37's adequacy reader found in `D7` two commits ago**: a presence test passed
with a stale statement left standing beside the new one, and failed when a correct statement was
reworded — green when the thing was wrong, red when it was right. A text test here is worse, because
the string it would look for is in a **comment** in every one of the six.

**So `G1` runs the script.** The measured cost of doing it properly is **0.13 to 0.19 s** per check
— a process start, timed bare rather than through `npm run`. *(This read **0.109 s**, a single
reading written as the figure. W38's conformity reader re-measured it and the range is what is
recorded, which is section 1 rule 5's writing clause applied to a number rather than to a claim.)*

**And the trap caught the clause written to avoid it, twice.** `G2` shipped its DEFAULT-target test as
`block.includes(want)` — a presence test, in the item whose whole scope section refuses one. W38's
conformity reader repointed `check-spec.mjs`'s default at `check-source-selftest.mjs` and left
`/* was check-spec-selftest.mjs */` beside it: **`check:wiring` green, `check:spec:selftest` running
another check's 34 probes, and `check-spec`'s own 18 never running.** Rewritten to capture the
`const mod = process.env.<NAME> ?? join(ROOT, 'scripts', '<file>');` declaration and compare BOTH
captured names — which is exactly the fix W37's `D7` took one item earlier, from the other reader.
*Third instance in three items, and the second time a reader had to make it.*

## The scope was amended once, and the reason is a measurement

**`S14` was built inside `check-source.mjs` exactly as declared, and it cost too much there.**
`check-source-selftest.mjs` re-runs `check-source` for every probe, every `META` grading and every
`SELF` entry — **roughly four hundred times** — so a per-run cost is multiplied by four hundred:

| measured, as the `npm run` entry the gate pays | before | with the clause inside `check-source` | as its own entry |
|---|---|---|---|
| `check:source` | 0.7 s | **9.7 s** | 0.88 s |
| `check:source:selftest` | 81.2 s | **317 s** | 78.1 s |
| `check:wiring` | — | — | **1.4 s** (0.61 s bare) |
| `check:wiring:selftest` | — | — | **66.3 s** |
| net gate cost | — | **+236 s** | **+68 s** |

**The multiplier is the whole finding and it was counted rather than estimated.** W38's conformity
reader instrumented one `check:source:selftest` with a `NODE_OPTIONS=--import` hook logging every
process start: **588 node starts, of which 461 run the check body** — 189 plain `check-source`, 272
mutated copies, and 124 that dispatch to the self-test and never reach it. The 235.8 s delta over 461
runs is **0.51 s per run**, which is this clause's own cost. *(The item first wrote "roughly four
hundred times"; the measured number is 461.)*

**Two of those cells were measured at different scopes and the row did not say so.** `check:source`
at 9.7 s was timed with the negative half still present — 0.7 + 0.53 + 8.4 = 9.63 — while
`check:source:selftest` at 317 s was timed without it. On one scope the numbers reconcile
(0.51 × 461 = 235); on the other they do not (9.0 × 461 = 4149, off by 17.6×). The 236 s conclusion
is the one the per-run figure supports and it stands; the row now names the scope. **Section 1
rule 5's writing clause, on the table W39's decision rests on.** W38's conformity reader.

**And the self-test's own cost moved by 58 s after the readers.** It was **8.4 s** at the author pass
with 6 probes and 2 gradings; it is **66.3 s** with 16, 8 and 6, because closing the adequacy
reader's `SELF` finding means six children that each run the whole probe pass. *The declared +9 s is
now +68 s, and W39 inherits the larger number.* **The clause is still 0.6 s; what costs is proving it
can fail** — which is [P11](../plans/p11-what-should-the-gate-prove.md)'s fact 1 reproducing itself
inside P11's own first item, at a ratio of **109×**.

**+236 s on a 433.7 s gate, to close a hole, inside a plan declared because the gate costs too
much.** So the clause moved to `scripts/check-wiring.mjs` as **`G1`** — joined, after both readers, by
**`G2`** and **`G3`** — with its own self-test, and `Owns` grew by those two files and two
`package.json` entries. *The amendment was put to the
maintainer with the alternatives and the numbers, and taken deliberately rather than in passing.*

**The finding generalises past this item and W39 owes it a verdict.** *A check's price is not what it
costs to run — it is what it costs to run multiplied by how often the thing around it is re-run.*
`check-source` is re-run ~400 times by its own self-test; a clause that looks free there is not.

## Record

**Gate — what ran.** Baseline `9f760fd`.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **pass** | `deno lint` 45 files, four `tsc` projects and a `deno check` clean — **and none of them reaches `scripts/**`**, so this row says nothing about either file this item ships. [Q177](../open-questions.md) |
| `check:wiring` | **pass** | `G1`, `G2` and `G3` over **7** `:selftest` entries — it covers itself — in **0.61 s** bare, **1.4 s** as the gate entry |
| `check:wiring:selftest` | **pass** | **16/16 probes caught, 8/8 graded, 6/6 bounded**, control green, **66.3 s** |
| `check:source` | **pass** | **0.88 s**; the clause is gone from it and `GATE_CHAIN` declares the two new entries |
| `check:source:selftest` | **pass** | **78.1 s**, 34/34 — the entry the amendment is about, run to show what it costs now |
| whole gate | **`GATE EXIT=0`, zero FAIL lines, 21 entries** | from 19. L1 unmoved at **21 files / 574** in five runtimes, L6 unmoved at **638 assertions / 31 real runs** in both — the declared result, since this item touches no `src/`, no `spec/` and no `examples/`. **The first run was `GATE EXIT=1` on [Q142](../open-questions.md)** — `M4`'s link floor, third consecutive plan, see the `Owns` audit |
| conformity reader | 14 findings, **6 blocking** | |
| adequacy reader | 28 mutations, 18 survivors, **6 blocking** | |
| re-run after the readers | **8 provocations, 4 caught, 1 vacuous, 1 ceiling, 2 survivors — both closed** | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| every `:selftest` script ROUTES `--self-test`, proved by running | `G1` | the seven dispatch probes, the `G1`-only probe, and the manifest probe |
| **and the module it routes to with NO override set is its own** | `G2` — **not declared; both readers** | the three `G2` probes |
| **and the manifest's entries are derived from disk, both ways** | `G3` — **not declared; the adequacy reader** | the four manifest probes |
| a uniform `CHECK_<NAME>_SELFTEST` override | seven dispatches, five of them new | `G1` could not be affordable — the alternative is a real self-test run per check |
| probes, one per check | `scripts/check-wiring-selftest.mjs`, 16 / 8 / 6 | the floor, the per-check coverage bound and the `ALL_CHECKS` coverage bound |
| [Q149](../open-questions.md) closed | — | — |

**Two of the three clauses this item ships were not in its declaration, and both readers put them
there.** `G1` is what was declared. `G2` exists because the adequacy reader's headline was that
**`G1` sets `CHECK_<NAME>_SELFTEST` on every run and the gate never does, so the one configuration
the gate actually runs is the one configuration `G1` never observes** — verified before acting on it:
with `if (process.env.CHECK_SPEC_SELFTEST)` wrapped round `check-spec.mjs`'s exit, `check:wiring`
printed *All checks passed*, `check:wiring:selftest` reported 6/6 and 2/2, and
`npm run check:spec:selftest` printed the plain spec check at exit 0 with **18 probes never running**.
**[Q149](../open-questions.md)'s hole, verbatim, inside the check written to close it.** `G3` exists
because both new gate entries were repointable at another script, and deletable outright, for **zero**
failures — `S12` compares entry NAMES.

**What broke — nine defects, every one found by RUNNING and none by reading.**

**1. The stub was at a fixed path, and `check-source` spawns itself.** The clause ran each check as a
child; `check-source` is one of them, so its child ran the clause again, and the child's cleanup
deleted the stub the parent's remaining four children still needed. **Four of six then failed with
`ERR_MODULE_NOT_FOUND` and the clause reported them as not routing** — a harness defect wearing the
verdict of a finding, which is `doc/workflow.md` **v0.11's own subject**, inside the clause written to
close its neighbour. Closed by putting the pid in the name.

**2. The negative half cost 8.4 s and is gone.** *Does it dispatch WITHOUT the flag* can only be
answered by running the check with no flag, which runs the check. **And the property is not silent**:
an unconditional dispatch makes `npm run check:spec` print a self-test report instead of a spec
report — visible in the gate's own output on the first run, and fatal to that check's own probes,
which run the plain check and read what it prints. [Q149](../open-questions.md)'s hole is the
opposite. *A clause is worth its cost in proportion to how quiet its absence is.*

**3. and 4. Two relocation strategies failed for two different reasons, and each taught a constraint.**
The self-test has to hand the check a mutated script without touching the tree (v0.11), and every
check derives `ROOT` as `resolve(dirname(self), '..')`:

- `scripts/` copied to `dev-dist/x/scripts/` — every copy's ROOT is a level too deep, and
  **`check-policies.mjs` reads `spec/join-policy.md` at module scope ABOVE its dispatch**, so it died
  on a missing file before reaching the flag;
- one file copied to `dev-dist/` — ROOT correct, but **`check-spec.mjs` imports
  `./check-markdown.mjs`** and the sibling was not beside it.

Both reported failures that were facts about the harness. Closed by staging **all** the scripts flat
in `dev-dist/`, which is a direct child of the root, so ROOT and siblings both resolve.

**5. The `META` pass graded against the real check and reported 0/2 STILL CAUGHT.** It set
`process.env.CHECK_WIRING_SCRIPT` before running the probe — but `script` is read once at the top of
`selfTest`, so the assignment did nothing. **A harness defect reading as the strongest verdict the
file can print.** Closed by passing the script under test as an argument.

**6. `G2` matched its own definition.** `check-wiring.mjs` declares
`const DISPATCH = "if (process.argv.includes('--self-test')) {";` and `text.indexOf(DISPATCH)` found
**that declaration** — a string literal — then brace-matched from the `{` inside it, so `G2` reported
all three of its clauses against the file that defines them. **Then the probe written to test `G2` did
the same thing**: `t.replace(DISPATCH, …)` rewrote the constant instead of the dispatch, so the probe
ran a working check and reported it as SURVIVED — the direction that does not announce itself. Both
closed by anchoring to a line start. **[Q178](../open-questions.md)**: W25's *a comment that quotes
the code it explains makes that code unmutatable*, one layer out, where the literal **is** the code.

**7. `G2`'s first exit clause passed the defect it was written for.** It flattened nested `{...}`
blocks and asked whether `process.exit(await selfTest(ROOT))` survived — and the measured defect adds
no braces: `if (process.env.CHECK_SPEC_SELFTEST) process.exit(await selfTest(ROOT));` passed. **The
clause written from the reader's report failed on the reader's own reproduction**, which is
obligation (e)'s founding observation about fixes.

**8. `G3`'s first predicate made every `G1` probe trip `G3`.** It defined *a check* as a
`scripts/check-*.mjs` **carrying a dispatch**, so falsifying a dispatch stopped the file being a check
and its manifest entries became orphans — three clauses co-firing on one mutation, which is three
clauses nothing can tell apart. The naming convention is the authority now; requiring the dispatch is
`G1`'s job and requiring its shape is `G2`'s.

**9. The `G1_ONLY` probe was vacuous and the set caught it.** Its first mutation wrapped the dynamic
import in `.catch(() => ({ selfTest: async () => 0 }))` — but the import never fails, so the probe ran
a correct check and reported SURVIVED. Replaced by *a later write overrides the declared source*: the
declaration `G2` reads is untouched and the import uses something else. **Rule 8's requirement on the
set — a provocation is evidence only when it fires — enforced by the set on its own author.**

**And `check-wiring.mjs`'s own dispatch was written at the BOTTOM**, below `process.exit(1)` — where
it is unreachable on a failing run and pointless on a passing one. **`G1` would have caught it**:
`check:wiring:selftest` is one of the seven entries it tests, so the check is self-covering.

**Rule 8 — 8 provocations beyond the 30 checked in, graded on the FAILURE LINES.** The 16 probes,
8 `META` gradings and 6 `SELF` entries are the set rule 7 (b) asks to be checked in; these eight are
the mutations that set may not reach, run against `check:wiring:selftest` with each mutation written
to the tree, restored from a snapshot, and **the restore asserted by comparing an md5 back**.

| Provocation | Verdict |
|---|---|
| `G1` reports `NOT RUN` while still running and failing | **SURVIVED → closed** |
| the `G3` row is deleted from the report's `checks` array | caught, 4 failures |
| the sentinel becomes an exit code a plain check produces | caught, 6 failures |
| `G1`'s spawn timeout is one millisecond | **caught by the CONTROL**, 1 failure |
| `G3` splits the chain on a single `&` | **vacuous** — `'a && b'.split('&')` still contains every entry after trimming |
| `G2`'s brace matcher never stops at the closing brace | **SURVIVED → closed** |
| the probe set equality is downgraded to a non-empty test | caught, 6 failures |
| the control stops requiring the child to have run | **declared ceiling** — inert on a green tree; it fired four times in this item |

**4 caught, 1 vacuous, 1 ceiling, 2 survivors, both closed, control green and the tree byte-identical.**

**The first survivor was created by a fix made an hour earlier.** Closing the `NOT RUN` probe's report
disagreement by exempting any `NOT RUN` row meant that a clause forced to report `NOT RUN` **while
running and failing** was invisible to all sixteen probes — W5's third report state, erased by the
relaxation that let one probe use it. Closed by making the expectation a property of the probe:
exactly one declares `notRun: true`, and everywhere else that row is a disagreement.

**The second is a LOOP BOUND on a loop bounded by a brace, and it took two sources to close.** With
`break` removed, `G2`'s brace scan runs to the last `}` in the file and `block` becomes the whole rest
of the file — every clause below still passed, so the bound that makes `G2` about the DISPATCH rather
than about the FILE was doing nothing. A `closed` flag does not close it: a mutation that also sets
`closed` puts it straight back. **The end is now derived twice — brace matching and column-0 layout —
and the two must agree.** And the compound probe confirms which half does the work: block-end broken
alone is **red**; block-end broken with the layout guard removed is **GREEN**. *W34's finding that a
provenance guard cannot be graded against a correct implementation, third occurrence.*

**What this taught.**

**Nine defects, all in the instrument, none in the clause — and v0.11's harness requirement was
adopted three commits before this item and earned its keep five times inside it.** Its control is what
made the difference: with the control green a red probe is the subject; without it, defects 1, 3 and 4
each looked exactly like a finding — and in the provocation set above, **the one-millisecond timeout
was caught BY the control**, which turned a harness fault into a named line instead of eight
misleading verdicts. *P10's retro adopted that rule from three occurrences across two plans and it
fired on the next item.* **P11 prediction 3 is CONFIRMED.**

**The methodological finding is that a presence test came back for the third item running, and a
reader had to make the same rewrite twice.** `G2` shipped `block.includes(want)` — in the item whose
own scope section refuses a substring test by name — and the conformity reader broke it in one edit:
repoint the default and leave `/* was check-spec-selftest.mjs */` beside it. That is **W37's `D7`
verbatim**, whose adequacy reader had rewritten it as capture-and-compare one item earlier, and
**W36's leftover-neighbour class** from the other side. The fix is the same fix: capture the
`const mod = process.env.<NAME> ?? join(ROOT, 'scripts', '<file>');` declaration and compare **both**
captured names. *An author who has just written down why a presence test is wrong will still write
one, because the check that replaces it is harder and the presence test looks like it works.*

**And the cost finding is the one W39 needs, with a bigger number than the declaration had.** The
clause is 0.6 s. Inside `check-source` it was 236 s, because `check-source` is re-run **461** times by
its own self-test. Its own self-test is **66.3 s** — 109× the clause — and 58 s of that was bought by
closing one reader finding. **Where a check lives is a cost decision, and so is how hard it is
provoked, and nothing in this repository has ever treated either as one.**

**`Owns` audit: THREE late exceptions, zero undeclared, and one path declared and not used.**

- **Late: `scripts/check-policies-selftest.mjs`**, comments only. Two of its paragraphs justified its
  generated `RUNNER` by *"`check-policies.mjs` imports this file by a hard relative path with no env
  indirection"* — which **this item made false**, by giving that check the same override the other
  five have. `RUNNER` itself is left standing: it is W31's, thirteen probes and fourteen `SELF`
  entries rest on it, and replacing it is not this item's to do. **Its stated REASON is what was
  corrected**, which is `doc/workflow.md` v0.7 change 3's argument in a file this item does not own.
  Found by the conformity reader, not by reading. *And the variable name is the same one that file
  already used for its nested-`SELF` sentinel — a collision that is not one, because both mean the
  same thing: the self-test module to load.*
- **Declared and NOT used: `scripts/check-source-selftest.mjs`.** The probes moved to the new file
  with the clause. Over-declaration rather than an undeclared edit, and the `Tests:` row was false
  until the conformity reader read it.
- **Late: `scripts/check-markdown.mjs` and `scripts/check-markdown-selftest.mjs`, `M4`'s link floor
  2050 -> 2400.** **[Q142](../open-questions.md), fourth retune, third consecutive plan**, and it
  arrived exactly where it always does: `wanted [M1,M3,M4], got [M1,M3]` in the gate, after the item
  was otherwise finished. Measured on a scratch copy outside the repository — whole tree
  **78 / 2817 / 127**, `doc/decisions` removed **60 / 2564 / 127**, both removed **48 / 2061 / 127** —
  so the window is `(2061, 2817]` and 2400 is near its middle. **W38 added one work-item document**;
  what moved the fixture is the PROSE written into `doc/README.md` and `CLAUDE.md`, which is W33's
  correction to Q142's row and not what that row still describes. `M3` at 64 is inside `(60, 78]` and
  `M5` at 60 against 127, both untouched for the fourth plan running.
- **Late: `README.md`**, three counts stale from earlier items and one row added. The command table
  said **517** assertions where L1 is 574, **25** L6 runs where it is 31, `check:markdown` over
  **67 / 2025 / 99** where it is 78 / 2817 / 127, and `S12` comparing **16** gate entries where it is
  21. *(Every one is the front-door instance of the class W35's conformity reader named, and none is
  this item's doing except the last.)*
- **A behaviour change not called out at the time, recorded here**: five dispatches moved from
  `await import('./check-x-selftest.mjs')` — relative to the running file — to a ROOT-anchored
  absolute path. A staged copy now loads its self-test from `scripts/`, not from beside itself.
  Nothing depends on it today; the next staging harness will meet it.

**Questions raised.** [Q176](../open-questions.md), [Q177](../open-questions.md),
[Q178](../open-questions.md).
