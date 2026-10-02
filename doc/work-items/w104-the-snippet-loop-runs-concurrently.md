# W104 — The snippet loop runs concurrently

```
Spec: NONE expected — no rule moves. `doc/workflow.md` section 8's budget prose carries
      the number if it changes.
Owns: scripts/check-docs.mjs, scripts/check-docs-selftest.mjs,
      doc/work-items/w104-the-snippet-loop-runs-concurrently.md
Inputs: W103's measurements (below) — RE-TAKE them, never transcribe (P15 decision 5);
        Q180 (~2531 process starts); Q425 (the 30 s per-snippet cap);
        ADR 0070 (the self-tests are CI's, so this lane's cost is CI's wall clock)
Outputs: (1) `check-docs.mjs` executes its `run` snippets CONCURRENTLY at a declared width
         (2) a snippet's crash, its `process.exit`, its timeout and its THROW are each still
             told apart — `X4`'s verdicts are unchanged in meaning and in message
         (3) the before/after measured as a RATIO on one tree, with the spawn health stated
         (4) `check:docs:selftest`'s 50 probes and 28 gradings all still fire
Depends on: W103 (ADR 0070)
Blocks: W105, which edits `check-docs-selftest.mjs` as well — these two are SERIAL
Tests: `check:docs` and `check:docs:selftest` in full; the gate's ladder
Gate: check:docs, check:docs:selftest, npm run gate
Reserves: W104, Q428-Q432, ADR 0071 (expected SKIPPED — making a loop concurrent is
          implementation, and ADR 0039 and 0070 already own the gate's structure)
```

## Why

`check:docs:selftest` is **1298.9 s of the 1324 s** self-test wall — six lanes running at once,
hiding behind their slowest. It is the only lane worth touching: halving the other seven moves the
total by single digits.

## What W104 measured before being declared

Taken 2026-09-30 and **2026-10-01 on a healthy machine** (`node -e ''` at 54 ms, Q180's own
baseline), and every one is to be RE-TAKEN rather than inherited:

| | |
|---|---|
| `check:docs` | **15 s for 38 snippets, 32 run** → **469 ms each** |
| of which process startup | **81 ms — 17%.** The other 83% is snippets doing real work |
| 38 noop `.ts`, sequential processes | **3112 ms** (today's shape: `spawnSync` in a loop) |
| the same at pool width 4 / 8 / 16 | **1014 / 651 / 586 ms** → **5.3× at width 16** |
| the same with `worker_threads` | 1725 / 814 / 429 / **334 ms** → a further **1.75×** |
| `check:docs-selftest` | **50 probes**, `MIN_META` 28, ~2 check-docs runs per META entry |

**The site is one expression**: `scripts/check-docs.mjs:237`,
`spawnSync(process.execPath, [join(OUT, w.name)], { cwd: ROOT, encoding: 'utf8', timeout: 30_000 })`.

## The decision this item does NOT take

**Processes, not `worker_threads`, and the reason is one variable rather than safety.** Workers were
measured safe on all four properties that could have refused them: TypeScript loads in a worker,
`process.exit()` is contained to the thread, `terminate()` kills a spinning snippet on a deadline, and
a worker that spawns its own `FyflowScheduler` pool has that pool reaped with it. They are worth a
further 1.75× and they are **W106's**, after this.

The async restructure is the risky part — it is what breaks anchors and what could turn a crash into a
pass. Doing it with processes changes exactly ONE thing, sequential to concurrent, so any behaviour
change is attributable to concurrency alone. Doing both at once changes two. *That is this
repository's own compound-probe discipline turned on its own tooling.*

## What to be careful of

1. **A crash must not read as a detection.** `X4` today distinguishes a snippet that throws (a
   detection) from one that is killed (`exit null`, [Q425](../open-questions.md)) from one that
   crashes. Concurrency puts several children in flight, so the mapping from child to snippet must
   stay exact — and rule 8's requirement on the SET is that a probe fires FOR THE REASON IT NAMES.
2. **The 30 s cap is per snippet and load-sensitive.** Running 8–16 at once makes each slower in wall
   terms. [Q425](../open-questions.md) is the row: under load a sub-second snippet was killed at
   30 s and reported as *the snippet does not run*. Pick the width against that, and consider whether
   the cap should scale with the width — the cheapest fix Q425 names is the MESSAGE, one branch.
3. **Output interleaving.** `check-docs` reports per snippet with a line number; concurrent children
   must not interleave into an unreadable report, and `X4`'s detail lines are what the self-test's
   gradings match on.
4. **Determinism.** Snippets that bind a port, write a fixed path under `dev-dist/`, or share a
   scheduler will collide when run at once. This is [Q182](../open-questions.md)'s class and
   **W105 is the item for it** — if a collision appears here, record it and narrow the width rather
   than fixing the namespace in this item.
5. **~50 probes are anchored on this file's text.** Rule 7 (b) aborts are expected, not a surprise;
   re-anchor them agnostically rather than re-pinning to a new line.

## Record

**DONE. `scripts/check-docs.mjs` executes its `run` snippets through a pool EIGHT wide, and
`check:docs:selftest` is 1096 s -> 624 s — 1.76x, and 1.83x net of the one probe this item ADDS.**
No ADR; **0071 is SKIPPED and is not reused.** No spec rule moves.

**Its central finding is that every one of the clauses W104 added to keep its own deliverable honest
was itself unbound in some direction, and its two readers found all of them.** The item wrote a
membership clause, a second source for it, a width floor, a peak-concurrency clause and an overlap
clause — each in answer to a named obligation, each argued in a comment — and: the membership clause
compared seat names SORTED, and then compared only the NAME where the report prints the LINE; its
second source was missing from the file's own census of what this item adds; the floor sat at 2
against a width of 8, so half the saving left for one character; and the two concurrency clauses
SHARED their expectation, so two edits in one file serialised the pool with everything green. *A
clause written to discharge an obligation is not thereby bound, and the comment arguing that it was
turned out to be wrong every time.*

### The spawn health, first, because every number below is inside it

Measured the way a self-test actually spawns — `spawnSync` from node, n=20: **`node -e ""` median
49.1 ms** (min 45.8, max 87.2) against [Q180](../open-questions.md)'s 54 ms baseline, and
**`cmd /c exit` median 19.2 ms** against the 27 ms-to-8 649 ms range [Q427](../open-questions.md)
records for this machine. Twenty cores, node v24.20.0. **The machine is at the good end** — the
conformity reader independently read 57 ms and the adequacy reader 48.7 ms in the same regime, so all
three sessions are comparable.

### The Inputs RE-TAKEN — FOUR corrected, one SUBJECT replaced, one held (P15 decision 5)

| the declaration says | re-taken | |
|---|---|---|
| `check:docs` **15 s**, 38 snippets, 32 run -> 469 ms each | **9314 ms median** (8725 / 9068 / 9314 / 9396 / 9420, spread 8.0%, all EXIT 0) -> **291 ms each** | **1** |
| of which startup **81 ms — 17%**, the other 83% snippets doing real work | the 81 ms is right for a NOOP `.ts` (80 ms median) and the SHARE is the reverse: the floor a snippet pays is **130 ms** — boot, type-stripping and `import index.ts` — and the median snippet is ~150 ms, so **85% of the loop is startup and ~13% is the snippet working** | **2, and it reverses the row's conclusion** |
| 38 noop `.ts` sequential, **3112 ms** | not a correction and not re-taken: a **different subject**. The real 32 `run` snippets read 5010 / 4812 ms in a separate harness and **6283 / 6471 ms measured inside the check** — see the decomposition | **a SUBSTITUTION, so the honest tally is FOUR corrected and not five** |
| width 4 / 8 / 16 = 1014 / 651 / 586 -> **5.3x at 16** | 4 / 8 / 16 / 20 / 32 = **1614 / 1201 / 1048 / 1082 / 1129 ms** -> **4.7x at 16** | **3** |
| `check:docs:selftest` is **1298.9 s** of CI's self-test wall | **1096 s**, EXIT 0, 50/50 probes, 28/28 noticed | **4** |
| 50 probes, `MIN_META` 28, ~2 check-docs runs per META entry | **confirmed, all three** | HELD |

**And one claim inside correction 3 is WITHDRAWN.** *20 and 32 are measurably WORSE than 16* rested on
1048 / 1082 / 1129 ms — gaps of 3-7%. The adequacy reader re-ran the sweep and read **2223 / 2140 /
1929**, monotonically DECREASING. Those gaps sit inside the spread this Record states elsewhere (8%
before, 38% after) and the table named no sample, which is [Q179](../open-questions.md)'s own
sentence. *The width decision does not rest on it* — the under-load measurement does — so the claim
goes rather than the choice.

### What the check is made of — the Amdahl bound, re-measured INSIDE the check

The first decomposition did not sum: 1238 + 1201 + 4911 + ~900 = **8250** against a stated 9314, with
**1064 ms unaccounted in a section headed *what the 9.3 s is made of***, and its two conclusions
needed different loop figures. The conformity reader instrumented phase timers at the X3/X4/X5
boundaries and measured the loop **in situ**, which is the term that was wrong: a separate harness
with a warm cache reads 4911 ms and the check's own loop reads **6283 / 6471 ms**.

| | before (width 1, in-check) | after (width 8, in-check) |
|---|---|---|
| parse and write 38 files | ~30 ms | 27 / 29 / 38 ms |
| X3 `tsc -p tsconfig.docs.json` | ~1240 ms | 1161 / 1249 / 1636 ms |
| **the snippet loop** | **6283 / 6471 ms** | **1275 / 1336 / 1256 ms** |
| X5 `tsc` under the DOM lib | ~1200 ms | 1180 / 1659 / 2226 ms |
| everything else (X6-X11) | ~900 ms | ~900 ms |

**So the loop is ~64% of the check and not 53%** — and the in-check figure is what RECONCILES the
measured 2.04x ratio, which 4911 did not. *The Amdahl conclusion survived and the term under it was
wrong, which only an instrument inside the subject could show.* The two `tsc` runs are now **52% of a
4.6 s check** and are its dominant term: [Q429](../open-questions.md), raised and deliberately not
taken, because overlapping them is a second variable.

### The width, and the measurement that decides it — confirmed on a BETTER approximation

| | idle | 8 CPU burners | **3 real concurrent self-test lanes** | 20 burners |
|---|---|---|---|---|
| width 1 | 9084 ms | 11606 ms | — | — |
| width 2 | — | — | 7348 ms | 21082 ms |
| width 4 | 5610 ms | — | 6342 ms | 16359 ms |
| **width 8** | 4904 ms | **6017 ms** | **5572 ms** | **14512 ms** |
| width 16 | **4483 ms** | 6469 ms | 6421 ms | 14819 ms |

**`npm run gate:full` runs six lanes at once, so the condition this ships in is a busy machine** — and
there width 16 LOSES. The item chose 8 on eight CPU burners, a 7% margin; the adequacy reader replaced
the burners with `check:markdown`, `check:source` and `check:spec` running concurrently, which is the
condition itself rather than an approximation of it, and the margin is **15%** — larger, in the same
direction. At twenty burners it narrows to 2%, so the secondary reasons carry more of the choice at
the heaviest load: per-snippet WALL rises 1.7x at width 8 against 2.6x at 16 against a fixed deadline,
and **CI's runner has four cores**, where 16 is 4x oversubscribed and 8 is 2x.

**And width 1 is the cleanest control this item has**: 9084 ms reproduces the pre-change 9314 ms
median, so **the asynchronous restructure costs nothing by itself and the whole difference is the
width** — the one-variable claim measured rather than asserted, and reproduced by the conformity
reader at ~10.5 s on its own machine.

### The result

| | before | after | |
|---|---|---|---|
| `node scripts/check-docs.mjs` | 8725 / **9314** / 9420 ms | 3709 / **4574** / 5125 ms | **2.04x** |
| `check:docs:selftest` | **1096 s**, 50/50, 28/28 | **624 s**, 51/51, 28/28 | **1.76x, -43.1%** |
| `npm run gate` (the ladder) | — | **EXIT 0, 174 s, zero FAIL lines** | |

**The bands do not overlap, which is how [Q179](../open-questions.md) is answered rather than
ignored**: the WORST after-reading (5125 ms) beats the BEST before-reading (8725 ms) by 1.70x. The
after spread is 38% against 8% before, because a concurrent pool is sensitive to scheduling where a
serial loop is not — stated rather than averaged away.

**The lane's ratio has a SECOND observer that is not its own clock**: 106 `check-docs` bodies exist in
both runs (the 107th is this item's new probe), and 106 x (9.314 - 4.574) = **502 s** predicted
saving against **472 s** measured, plus the **+26 s** the deadline probe costs = 498 against 502,
agreeing to **under 1%**.

**And the wall this is actually about, DERIVED from ADR 0070's own per-lane figures** — `gate:full` is
CI's to measure and W104 did not re-run it: the exclusive prefix is 25.2 s and the concurrent group
*(**both halves of this derivation are WRONG, and [W105](w105-the-scratch-directory-is-namespaced.md)
measured them**: ADR 0070's 3.0 s for `check:wiring:selftest` is a lane that EXITED AT ITS CONTROL, so
the prefix is **243.1 s**, and `check:source:selftest`'s 82.7 s is **578.4 s**. The wall is **851.3 s**
end to end rather than the ~649 derived below, and `check:docs:selftest` is **71%** of it rather than
96%. The halving this item measured stands; what does not is a wall derived from a table with two bad
entries. Corrected here as well as in `doc/workflow.md`, because an item's own file is where a status is
read from.)*
becomes `max(624, 477.3, 125.1, 82.7, 53.8, 43.2)`, so the self-test wall is **~649 s against 1324 s**
(2.04x) and `gate:full` **~894 s against 1571 s** (1.76x). **`check:docs:selftest` is STILL the
binding lane** at 624 s against `check:markdown:selftest`'s 477.3 — what that second lane caps is the
NEXT halving, worth ~1.3x on the wall rather than another 2x. *The conformity reader found this
missing entirely: the Record did the Amdahl arithmetic for the CHECK and not for the LANE, which is
the number ADR 0070 and `doc/workflow.md` section 8 are about.*

### [Q425](../open-questions.md)'s fix, measured on the same mutation

```
X4: AGENTS.md:946 — the snippet does not run: exit null
X4: AGENTS.md:946 — the snippet did not exit: killed by SIGTERM after 30043 ms against a 30 s
    deadline, with up to 8 snippet(s) running at once
```

Exactly one snippet killed and 31 unaffected, so attribution is exact under concurrency. **The
deadline is NOT scaled with the width** and the reason is Q425's own — a scaled cap makes a hung
snippet cost eight minutes — with the headroom measured instead: 30 s is ~88x the 341 ms worst case
the pool produces. **This is a declared DEPARTURE from Outputs row (2)'s letter** (*unchanged in
meaning and in message*), on the ground that the row's subject is the four verdicts staying TOLD
APART: the THROW and `process.exit(n)` messages are byte-identical to the pre-W104 ones, verified
against `git show HEAD:scripts/check-docs.mjs`, and the deadline and could-not-spawn cases had no
message of their own to be unchanged — today's code renders a timeout, a kill and a spawn that never
happened as the same `exit null`. The conformity reader confirmed the departure is recorded where a
reader meets the claim, and that Q425 does make the argument cited for refusing the scaled cap.

### The hazards, re-measured — and TWO of the five are corrected

**Hazard 4 is measured ABSENT rather than not-yet-fired**, and both readers reproduced the census
independently: zero of the 32 extracted `run` snippets contains `writeFileSync`, `mkdirSync`,
`appendFile`, `listen(`, `localhost:`, `tmpdir`, a `process.cwd` write, `child_process`, `spawn` or
`fork`; the imports are `index.ts` x35, `src/scheduler/index.ts` x17, `fyflow-scheduler` x2,
`src/jsonata/index.ts` x2 and two `examples/getting-started/*` registries, which write nothing either.
Run at widths 4, 8, 16, 20 and 32: **0 non-zero at every width.** So [Q182](../open-questions.md)'s
class does not reach this loop's children — `dev-dist/docs` is written ONCE by the parent before the
pool starts. *It is also what holds back the one unbounded-wait mode this change adds*: `close` fires
only after the stdio pipes close, so a grandchild inheriting stderr would defer it past the kill with
no deadline left. Nothing here spawns one.

**Hazard 5 is WRONG IN DIRECTION.** It says ~50 probes are anchored on this file's text. Measured:
`PROBES` is 50 and **every one anchors on `AGENTS.md` or `README.md`**; the **28 `META` entries** are
what anchor on `check-docs.mjs`, and **ZERO of the 46 textual anchors land in the loop**. The
conformity reader confirmed it on the SHIPPED tree rather than the pre-change one — every `META`
divergence point outside the new block, `idAt` resolving each to its own id, coverage complete with
none missing. **Expected rule 7 (b) aborts zero, observed zero** from the shipped edit.

### What broke, and who found it

**The author pass, before either reader:**

1. **The membership clause compared SORTED lists.** `seats[closed]` for `seats[at]` fills every seat
   once with the right snippet's own data, so the set and the count are unmoved and only the report's
   order changes — **cost ZERO**. Closed by comparing seat `i` to snippet `i`.
2. **`wanted` re-sourced from the seats made the clause the pool against itself**, and the under-run
   then cost **ZERO** — obligation (c)'s entire probe class. Closed by a SECOND source, from `all`.
3. **A declared ceiling's stated reason was wrong in its number** — `a8` said *0 of 32 snippets
   produce any stdout*; measured, **23 of 32 do**. Both readers re-took it and agreed (3167 bytes by
   Buffer length, 3159 decoded; biggest 708).
4. **`check-docs-selftest.mjs`'s header census was stale by 33 `fail()` sites** — it said *17 clauses:
   14 `fail()` sites*, W29's count, where the file's own `grep -c "fail('X"` gives **47** before this
   item.
5. **The HARNESS was wrong twice, and the controlled grader is what said so.** An INSERTING mutation
   keeps its own anchor, so re-applying it is not a uniqueness test — two probes aborted as *matched
   MORE THAN ONCE*. And the first serialisation probe put an `await` inside `pump`, which is not an
   async function: a SyntaxError, graded **CRASH** rather than CAUGHT, which is what v0.24's grader
   clause exists for.
6. **`d1`'s declaration went STALE inside the item** when finding 2's fix turned it into a catch.
7. **Removing the zero-snippet guard is EXIT 13, not a hang** — Node detects the unsettled top-level
   `await`. Loud rather than silent, and the guard is still right.

**The CONFORMITY reader — 16 findings, 4 blocking** — and its central obligation came back with **ZERO
disagreements on the VALUES**: it derived all four verdicts from `child_process.spawn`'s contract
before reading the code, then measured each against both the shipped check and `HEAD`.

8. **BLOCKING — the corrected census was short by ONE, and the ungraded list by the same clause.** 54,
   not 53, because the count was taken before the second-source clause existed and never re-taken; and
   that clause was absent from the five-entry *unreachable by any probe* list. *One cause, both
   symptoms, in the paragraph whose own subject is a stated cap that undercounts* — its third
   occurrence there, and the final count is **55 with X4 at 13** once the readers' fixes landed.
9. **BLOCKING — the before-decomposition did not sum** (above).
10. **BLOCKING — `doc/workflow.md` section 8 was left standing at 1298.9 s**, and this item's own
    `Spec:` line nominates that file *if the number changes*. It changed. ADR 0070's consequences 2
    and 3 carry it too, and **W103 — the item W104 depends on, with the identical Spec sentence — DID
    edit `doc/workflow.md` in its own commit**, so the precedent existed and was not followed. Both
    corrected; the derived wall above is the other half of this finding.
11. **BLOCKING — `596 s` shipped in source** at `check-docs-selftest.mjs`, a mid-build prediction never
    re-taken, in the file whose census this item had just corrected for being stale.
12. **And a THIRD instance of the same class, found at the record step**: `README.md`'s own row for
    `check:docs:selftest` read **19 probes, 10 gradings** and **17 clauses** — W46-era figures, stale
    through W69, W70, W86, W96 and W104 — against the real **51 / 28 / 58**. Corrected. *Three stale
    censuses in one item, in three files, none of them compared to the file it is about*
    ([Q430](../open-questions.md)).
13. **Its parser found that the twelve wide register rows are SIX.** Six have every pipe escaped and
    render as four cells; only Q119, Q71, Q343, Q411 and Q415 are wrong, plus Q87's multi-line row. *A
    parser that splits on every pipe is LESS careful than the renderer* — W30's finding inverted, and
    [Q131](../open-questions.md)'s row carries the correction. **And this item then broke Q131's own
    row while writing that correction**, with an unescaped pipe inside a code span; caught by re-running
    the parser, fixed, and every row W104 touches re-verified at four cells.
14. **One finding REFUTED.** It reported the ten-row list as W88's; the register's W86 note names all
    ten by id with the open/resolved split, and W88's says *the same ten*. The back-reference was read
    as the origin. Attribution unchanged.

**The ADEQUACY reader — 35 mutations, 12 standing survivors, 14 findings, 5 blocking** — with its own
digest `73db0796bddd1991` identical at both ends and a control clean before and after.

14. **BLOCKING — the width floor was 2 against a width of 8**, and `X4_WIDTH = 2` was EXIT 0 at the
    check, EXIT 0 at the cross-file bound, and every probe still caught, for **half the saving** (5964
    against 4344 ms idle; +32% under three real lanes; roughly +170 s on a 624 s lane). The comment
    claimed the floor was *declared as `RUN_FLOOR` and `README_SNIPPET_FLOOR` are* and **it was not** —
    both of those sit AT the current value. **Raised to 8**, with the self-test's bound raised with it.
15. **BLOCKING — the two concurrency clauses shared `expectedPeak`**, so narrowing `pump` AND
    re-pointing that one expression — **two edits in ONE file** — was EXIT 0, with the note printing
    *pool 8 wide — peak 1 in flight* and the cross-file bound passing, because that bound reads the
    literals and not whether they are used. **Each clause now derives its own expectation**, which
    makes it three edits; the residual is a declared ceiling, because a mutation that moves the
    behaviour and every expectation of it together cannot be caught from inside the check.
16. **BLOCKING — the seat was asserted on NAME and the report prints LINE.** `line: runnable[0].line`
    was EXIT 0 on a clean tree and reported **`AGENTS.md:77`** for the snippet at line 946, with the
    self-test's probe still reading `outcome: caught`, because the gradings read the id SET and the
    report ROWS and never the line. *W90's handed-on value compared on two fields of four, one plan
    on.* `misseated` now compares both.
17. **BLOCKING — the REPORT loop was deletable with EXIT 0 on a reference whose snippet throws.** The
    restructure split one `for` that both ran and reported into two, and all five new clauses read
    `seats` rather than what was emitted from it — *this item's own argument for the membership clause
    applying verbatim to the half it was not applied to*. Closed by a RELATION between the halves: the
    failures emitted against the failing seats. **And it is why [Q431](../open-questions.md) is
    raised**: since ADR 0070 `npm run gate` carries no `:selftest` entry, so a clause whose only
    observer is a probe has none on the local ladder at all.
18. **BLOCKING — a claim in shipped source that this Record contradicted.** The deadline probe's
    comment said *without this the whole branch could be deleted at 50/50 and 28/28*; measured, it is
    deletable at **51/51**, because the deadline arm and the plain arm report under the same id and
    emit the same count. Ceiling `a6b` said exactly that and the comment said the opposite. **What the
    26 s actually buys is that the DEADLINE EXISTS** — delete `timeout: X4_DEADLINE_MS` and that
    probe's document never exits (no exit in 75 s), a clause with no other observer anywhere. The
    comment now says so.
19. Non-blocking and acted on: the stderr accumulator is observed by nothing ([Q100](../open-questions.md)'s
    class, declared) and `+= d` on Buffers mojibakes a multi-byte character straddling a chunk — now
    **`setEncoding('utf8')`**; `spawnSync`'s implicit **1 MiB `maxBuffer`** went with the restructure
    undeclared and is recorded; the branch ORDER is asserted by nothing, so with the spawn arm disabled
    a 15 ms failure read *killed by no signal after 15 ms against a 30 s deadline* — **the deadline arm
    now requires a SIGNAL**; the note **went silent exactly when something was wrong**, so it prints
    unconditionally; and the overlap clause's *this may exceed the counter by one* is wrong, because
    the sort puts every open before every close, so k simultaneous closes inflate it by k.

**The one thing the two readers DISAGREED about was measured rather than adjudicated.** Conformity
said `error` fires and then `close`, so the `settledHere` guard is load-bearing; adequacy said removing
it cost zero even with every spawn failing, so the guard is inert. Measured directly: a nonexistent
executable emits **`error(ENOENT)` at 3.3 ms AND `close(-4058, null)` at 4.1 ms — two settling
events**. The guard is load-bearing, and **removing it is a RACE** — `closed` double-counts, so
`settle()` can fire at the sixteenth of thirty-two — which is why one reader measured one run as
identical. *A racy probe is worse than one that fails*, so it is a declared ceiling rather than a
graded catch. **And the comment's own stated consequence was the one thing it cannot be**: `finish`
captures `at` and `w`, so a second call rewrites the SAME snippet's seat and never another's.

### Rule 8

**49 probes on the final pass: 2 controls clean, 2 grader controls as declared, 26 CAUGHT, 2 WRONG
REASON, 2 CRASH as declared, 15 declared CEILINGS each RUN against the rung its own reason names, 0
UNDECLARED survivors, 0 aborts, 0 against declaration.** Digest `5d7bd4b151021fdc` identical at both
ends, restore asserted byte for byte after every entry. **Nineteen of the forty-nine are the readers'
own exact edits checked back in**, as v0.8 requires, and every blocking fix is a probe that now fires
by name: `r-m1` the floor, `r-m3` and `r-m3b` the line, `r-N1` the report loop, `r-m9b` the un-shared
expectation, `r-m15` the deadline's real purchase.

**The re-run earned its place twice.** Seven entries came back ABORT or WRONG REASON on the first full
pass — every one an anchor or a declared reason that **this item's own fixes had moved** (the floor's
value, the deadline arm's condition, both concurrency clauses, `misseated`) — which is rule 7 (b)
firing correctly rather than passing. Re-anchored agnostically, all seven hold. *And the re-anchoring
itself put a literal newline into a probe string through a shell heredoc, which is the hazard
`CLAUDE.md` names and which `node --check` caught before the set ran.*

Five rungs, because the ceiling clause says to name the one a reason names: **`docs`**,
**`broken-snippet`** (a staged document whose snippet throws — added for the report half, and the
author pass had no such rung, which is how that loop shipped deletable), **`deadline-message`** (the
failure LINE read directly), **`hang`** (the same with a 75 s bound, where a TIMEOUT is the catch) and
**`selftest-head`** (`--self-test` read for the bounds that return before the 51 probes).

**The sharpest ceiling is `a6b`**: `X4`'s deadline arm and its plain arm report under the **same id**
and emit the **same number** of failures, so the self-test's grading — set equality over ids plus the
FAIL rows — cannot tell them apart. W29's **co-firing** shape with its one discriminator also gone,
which is `D5`'s **masking** case. *A META entry there would read STILL CAUGHT and be a lie*, which is
why the message is graded at a rung that reads the failure line, and by nothing in the lane.

### What shipped

`check-docs.mjs`: `spawn` beside `spawnSync`; `X4_WIDTH = 8` and `X4_WIDTH_FLOOR = 8` declared with
the measurement; the pool, with each verdict recorded AT ITS OWN INDEX; stdout drained and stdin
`ignore`; stderr decoded on the stream; the report in SOURCE order; **four branches where there was
one**; and **six clauses** — the width floor, the membership set equality over name AND line, its
second source from `all`, the report-against-run relation, the peak-concurrency clause and the overlap
clause, the last two each deriving their own expectation. Neither concurrency clause is a clock
BUDGET; both are relations that hold at any speed, because `pump` spawns `min(width, n)` children
synchronously before the event loop can deliver a single `close`.

`check-docs-selftest.mjs`: the DEADLINE probe (`MIN_PROBES` 50 -> **51**, Q102's ratchet), the source
bound that reads `X4_WIDTH` and `X4_WIDTH_FLOOR` and is the THIRD edit a width reversion needs, and
the header census corrected to **55 sites across eleven ids** with the scope of what was re-taken
stated.

**[Q180](../open-questions.md) is NOT touched by this item**: concurrency changes WHEN children start,
not HOW MANY — 34 per `check-docs` body either way, and the lane makes ~3638 such starts before and
after.

### Verification

| | |
|---|---|
| `npm run check:docs` | **EXIT 0**, 38 snippets / 32 run, 3709-5125 ms over 5 runs |
| `npm run check:docs:selftest` | **EXIT 0**, 624 s, **51/51 probes caught, 28/28 noticed**, zero FAIL lines |
| `npm run gate` (ADR 0070's ladder, 15 entries) | **EXIT 0, 174 s, zero lines beginning `FAIL`**, digest `5632a671f52eed49` over 433 files identical at both ends |
| `npm run gate:full` | not run locally — it is CI's (ADR 0070); its two halves are the rows above, and the wall is DERIVED rather than measured |
| rule 8 | 49 probes, above; digest identical at both ends |
| readers | conformity **16 / 4 blocking**, adequacy **14 / 5 blocking**, each in its own worktree with `node_modules` COPIED and verified green first |
| `Owns` audit | `git diff --name-only` is **NINE** paths, counted by running it: `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` and this file (`Owns`); `doc/open-questions.md`, `CLAUDE.md`, `doc/README.md`, `README.md` and `doc/decisions/0070-*.md` (section 1 rule 5's record step, five of its six); and **`doc/workflow.md` as a DECLARED exception** — this item's `Spec:` line names that file and the condition it names occurred. **Zero undeclared.** *(This row said SIX, and the number was written from the list rather than from the command — the same defect both readers found in its predecessor, in the row whose whole subject is what the command prints. Corrected by running it.)* |
| `W104` outside `doc/` | the two files it owns, both its own annotations; `W105`'s claim that per-probe scratch *dwarfs anything W104 can win inside a single check* re-read and **HOLDS** |

**Readers: overlap SIX, which is outside the 0-4 band that has held for forty-five measurements, and
the caveat is recorded with it.** The shared subjects are the width floor, the overlap clause's
independence, the *snippets' own clocks* wording, the `settledHere` guard (where they disagreed), the
106/107 count and the stderr handling. **Both readers were given a numbered list of specific things to
check and the two lists overlapped** — which is W31's recorded caveat, the only other occasion the band
moved, and it is at least as likely to have driven them together as apart. *An overlap is counted as a
shared SUBJECT and the two findings on it need not agree*: on `settledHere` they reached opposite
conclusions, and a measurement settled it against the more confident one.

**Questions.** [Q428](../open-questions.md) (Q180's start count is stale — it records 2531/2583 for
all SEVEN self-tests and this ONE lane now makes ~3638), [Q429](../open-questions.md) (the two `tsc`
runs are 52% of the check W104 leaves behind, unpriced), [Q430](../open-questions.md) (a `scripts/`
file's census of another was stale by 33 and nothing compares them) and
**[Q431](../open-questions.md)** (since ADR 0070 a clause whose only observer is a PROBE has none on
the local ladder — raised by the adequacy reader, out of the hole in this item's own report loop).
**[Q425](../open-questions.md) HALF-ANSWERED and extended**: the message is fixed, the cap is not, and
the pool makes that row more likely to fire. [Q427](../open-questions.md) and
[Q131](../open-questions.md) extended. **Q432 unused and SPENT. ADR 0071 SKIPPED and not reused.**
Census **324 / 251 / 1 / 72**, 324 of 324 in exactly one cluster cell.
