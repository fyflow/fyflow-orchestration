# ADR 0039 — The gate climbs the ladder, and proving the checks can fail runs concurrently

**Status:** accepted
**Date:** 2026-09-09
**Item:** [W39](../work-items/w39-what-the-gate-proves-and-what-it-costs.md) —
[P11](../plans/p11-what-should-the-gate-prove.md), *what should the gate prove, and what is it
actually proving?*
**Supersedes:** nothing. **Superseded in part 2026-10-01 by [ADR 0072](0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md) — the exclusive SET loses `check:wiring:selftest`, because the fixed `dev-dist/` paths its staged copies wrote now carry `process.pid`. Rule 3's MECHANISM, the order and the concurrency all stand; three sentences below are corrected in place.** **Amends:** the `Owns` of `package.json`'s `gate` entry, which is P8's and
has had one shape since W1.

## Context

**`npm run gate` cost 516.1 s and 94.7% of that proved that the seven checks can still fail.**
Measured on a clean tree at `ff2d064`, every entry run as `npm run <entry>` three times and reported
as the median — the measure this item stated **before** the change, because
[Q179](../open-questions.md) says a single timed pass cannot see one:

```
TOTAL                   516.1 s   over 21 entries
the seven checks          8.9 s   ( 1.7%)
proving they can fail   488.9 s   (94.7%)      ratio 54.9x
everything else          18.3 s   ( 3.5%)      L0-L6, three runtimes, both real-scheduler rungs
```

**Nobody decided that**, and two things about the arrangement were accidents rather than choices.

**One: the chain ran the ladder backwards.** The `&&` chain was
`check:spec && check:spec:selftest && … && lint && typecheck && test && … && test:l6:deno`, so
**488.9 s of self-test ran before `lint`**. `doc/workflow.md` section 4 says *climb from L0 and stop
at the first failure*; the comment above `GATE_CHAIN` in `scripts/check-source.mjs` says
**`&&` in sequence is the only implementation that ladder has**, and gives *"a chain running
`test:l6` ahead of `lint` reports a sixty-second rung while L0 is broken"* as the reason `S12`
asserts ORDER. The rule was stated correctly, in the file that enforces it, over a list that broke
it by a factor of five hundred. *Section 6 pass 3 rule 3's sharpest shape: a rule that was followed
and did not work.*

**Two: they ran one at a time on a machine with twenty cores**, because `&&` is the only sequencing a
manifest string has, not because anything about them requires it.

**And the cost is not what the process-start count says it is.** The seven self-tests spawn **2531**
node processes, and that number reproduces run to run — **six of the seven match the declaration's
figures exactly**, three commits earlier, and `check:policies:selftest` reads **170 against its 222**,
measured twice here. *So "it does not vary between runs" is confirmed and "it is a property of the
file" is not, for one entry in seven, and this ADR does not know why.* `node -e ""` is **54 ms** here — the median of n=30, measured by
`spawnSync` from node, which is how a self-test actually spawns; the same command timed through a
shell loop reads 92 ms, and *that difference is the harness rather than the boot*. **A later reading
under load gave a 62 ms median**, so the boot cost is **137-158 s, 27-31% of the gate**, and the
statistic is named because the spread across readings is a third of the figure. Real, and **not the lever**, because the
other 73% is what those processes do and the two most expensive entries are the two that do the most
per start.

## What was considered

Five candidates. [P11](../plans/p11-what-should-the-gate-prove.md) named four and refused to prefer
one; W39's declaration added the fifth and preferred none either.

| | | verdict |
|---|---|---|
| **(a)** | keep it and record that the cost is deliberate | **refused** |
| **(b)** | run them concurrently, within the constraint [Q148](../open-questions.md) names | **ADOPTED**, with a sixth |
| **(c)** | move them off the gate, with something else requiring them | **refused** |
| **(d)** | reduce what the two most expensive self-tests prove | **refused** |
| **(e)** | stop paying for a process per probe | **refused for this item, not on the merits** |
| **(f)** | **run the chain in ladder order** — not named by either document, and found by measuring | **ADOPTED** |

**(a) is refused because nothing about the arrangement was chosen**: the chain ran the ladder
backwards and the seven ran one at a time on a twenty-core machine, and neither is a property of what
they prove. `doc/workflow.md` section 8 already prescribes the response to a slow gate — *"a gate over
budget gets a fast subset on every change and the full version at the join. A verification step nobody
waits for is a verification step nobody runs."*

*(**The first version of this paragraph refused (a) on a comparison across a line, and P11's retro
corrects it in place.** It read *"516 s is 5.7x section 8's own budget"* — but that budget is *plan
gate (**L0-L6**): under 90 s*, and 488.9 s of the 516 is self-test, which is not a level of section 4.
L0-L6 was **18.3 s** before this change and **18.6 s** after: inside the budget by a factor of five,
and it always has been. **The correct statement is the stronger one** — section 8 had no row for
proving the checks can fail, so there was no budget to be over and nothing to decide against, which is
what *"nobody decided that"* means here. Section 8 now carries the row. The refusal stands on the
sentence above it.)*

**(c) is refused on a measurement rather than on taste.** There is **no CI, no workflow and no git
hook** — `.github`, `.husky` and `.git/hooks` hold nothing, and `package.json` has no `pre*`
lifecycle entry — so there is no *something else* to move them to, and `S11`'s own sentence applies:
*a check nobody runs is a check that does not exist*. It is two changes rather than one, and the
second is a repository this one does not have.

**(d) is refused, and the refusal is quantified rather than asserted.** Every clause those probes
grade was earned by a measured hole in P8 or P9; that is P11 prediction 2 and this ADR does not
disturb it. **And the saving would have been smaller than (b)'s**: the two 120-second entries are
`check:markdown:selftest` (166.1 s over 527 starts) and `check:docs:selftest` (113.0 s over 522), and
in the arrangement below they run **concurrently with each other**, so the whole of the second one is
free. Reducing what either proves buys, at most, the difference between them.

**(e) is refused for this item and not on the merits.** 137 s of interpreter boot is the largest
single identified waste in the gate and (b) does not remove it — it hides it behind other work. What
it costs to remove is seven self-tests rewritten to load a check by `import` rather than by
`spawnSync`, and the process boundary is doing four jobs at once: the checks `process.exit()` rather
than returning; a mutant that crashes or loops must not take the harness with it; a mutated script
must be loaded fresh; and stdout must be captured per run. **`NODE_COMPILE_CACHE` was measured as the
cheap half and buys nothing** — 128 ms against 129 for `check-source`, because Node's own bootstrap
is already snapshotted and these scripts are small. [Q180](../open-questions.md) stays open with the
number attached.

## Decision

**1. What the gate proves does not change.** No clause is deleted, no probe is dropped, no bound is
lowered, no self-test is skipped. This ADR is about ORDER and CONCURRENCY, which are the two
properties of the chain that nobody had ever chosen.

**2. The gate climbs the ladder, and within a tier the cheapest entry goes first.**

```
lint  typecheck                                   L0
check:scheduler  check:policies  check:spec
check:source  check:markdown  check:wiring
check:docs                                        the static checks, CHEAPEST FIRST
test  test:deno  test:browser                     L1-L5, three runtimes
test:l6  test:l6:deno                             L6, both runtimes
selftests                                         and only then, that they can fail
```

*(The first version of this list ran spec, source, wiring, markdown, scheduler, policies, docs, and
the sentence above it was false of it: `check:wiring` is **1.74 s** against `check:scheduler` and
`check:policies` at **0.09**, so it sat third ahead of four entries 5-19x cheaper. W39's conformity
reader measured every one of them; the list is now what the sentence claims.)*

`GATE_CHAIN` in `scripts/check-source.mjs` declares that order and `S12` compares it to the manifest
both ways **and in sequence**, exactly as before. **On a green run this rule is worth nothing**; on a
red one it is worth the difference between 35 s and 460 s, and the common failure — a type error, a
lint finding, a broken test — is in the first tier.

**3. The seven `:selftest` entries leave the `&&` chain for one entry that runs them concurrently.**
`npm run selftests` is `node scripts/run-selftests.mjs`. **It carries no list**: the set is every
`*:selftest` entry in `package.json`, derived at run time, so there is nothing here to go stale
against the manifest — [Q102](../open-questions.md)'s shape, and `G3`'s own argument that *the
authority is the file*.

**4. An entry that mutates state outside its own scratch space declares itself exclusive IN ITS OWN
FILE, and runs alone.** The marker is `SELFTEST-EXCLUSIVE:` followed by the reason, in the self-test
that causes the hazard; the runner reads it and `G4` **computes the same set a second
time, from the same authority**, and compares both ways. *Not independently: it is a
second computation over one source, so what it catches is the runner ceasing to read
the marker and not the marker being wrong — which is [Q181](../open-questions.md), and
W39's conformity reader made the distinction.*
**Two files carry it and both were established by running the seven concurrently and reading the
failures:**

| | why it cannot share the tree | how it showed |
|---|---|---|
| `check-scheduler-selftest.mjs` | its install probes **delete** `node_modules/fyflow-scheduler` and restore it from a stash | [Q148](../open-questions.md), and P11's declaration measured **four** entries that fail while it is gone, not the one that row named |
| `check-wiring-selftest.mjs` | `stage()` writes every `scripts/check-*.mjs` **flat into `dev-dist/`** — the directory every other self-test uses for scratch — and runs those copies with their dispatch falsified | concurrently, `check:docs:selftest` reported an `X4` probe uncaught and another tripping `[X1,X4]`, and `check:spec:selftest` reported *the mutant did not run: this is a crash, not a detection* |

**The second one is the finding, and it was not predicted by anything.** A staged `check-docs.mjs`
whose dispatch is falsified reaches the real `check-docs` body, which `rmSync`s the fixed path
`dev-dist/docs` that `check-docs-selftest` is driving; a staged `check-spec.mjs` whose override read
is removed launches the **whole** `check-spec` self-test, which deletes and rebuilds
`dev-dist/spec-selftest`. Isolated by measurement: `check:spec:selftest` beside `check:wiring` (the
plain check) is **green**, and beside `check:wiring:selftest` is **red**. ***`dev-dist/` is a shared
namespace and nothing said so.***

**5. `G4` in `scripts/check-wiring.mjs` is what replaces the three clauses the seven lost**, and it
is not optional. Before this change, an entry leaving the gate was refused by `S11` (it is a
`check:*` and the chain does not name it), by `S12` (the declared ordered chain) and by `G3` (the
disk-derived pair). All three go quiet the moment the seven are not in the chain, so **`S11`'s and
`G3`'s membership tests become *reachable from the gate*** — in the chain, or a `:selftest` entry
when a chain entry runs the runner — and `G4` makes the second disjunct a fact rather than an
assumption. Four clauses, one id:

- the gate's chain entry is **exactly** `node scripts/run-selftests.mjs` — an equality, because
  requiring `node` first and the file somewhere after it let `node scripts/run-selftests.mjs || exit 0`
  pass, where `||`, `exit` and `0` are inert argv tokens to Node and the **shell** throws the runner's
  verdict away;
- the chain entry's **own command** is what runs — `node` followed by `scripts/run-selftests.mjs` —
  rather than a command this check composes;
- `--plan`, run with **no override set**, names exactly the manifest's `:selftest` entries — compared
  **both ways** — each with the command `npm run <entry>`, which is how the runner invokes it;
- its exclusive set equals the set the `SELFTEST-EXCLUSIVE:` markers imply, derived a second time
  here and compared both ways;
- with every entry pointed at a stub that **succeeds**, the runner reports every planned entry
  completed;
- and with every entry pointed at a stub that **fails**, it exits non-zero — a second run, because the
  first only ever runs children that succeed, and without it `let ok = true;` cost **zero**: seven
  failing self-tests, runner exit 0, gate green.

**The plan is ASKED rather than READ**, which is `G1`'s design one file across: the obvious clause is
a regex over the runner's source, and a regex over source is what broke `D7` for W37 and `G2` for
W38, in consecutive items.

**6. And `G5` reads the runner's DEFAULT behaviour, because every one of `G4`'s runs sets an
override.** `CHECK_SELFTESTS_PKG` and `CHECK_SELFTESTS_SCRIPTS` on all three of them,
`CHECK_SELFTESTS_CMD` on the two that watch the runner finish — so **the configuration `npm run gate`
executes is the one configuration `G4` never takes.** That is `G2`'s own sentence, one file across, in
the file that quotes it, and W39's adequacy reader measured four ways through it, each green in
`check:wiring`, `check:source` **and** `check:wiring:selftest`:

| the edit | what the gate then did |
|---|---|
| the spawn prints its command instead of running it | `7/7 completed, 7 ok`, **0.1 s** |
| the exclusive filter is falsified | both hazardous entries run **concurrently**, `--plan` still says `alone` |
| the plan is guarded on the `PKG` override | **`0/0 completed`**, exit 0 — the whole self-test half gone |
| the `SCRIPTS` default moves | **`0 exclusive`** under the gate's own configuration, no marker read |

**The affordable answer is `G2`'s answer: read the default rather than run it.** `G5` captures the
**nine** declarations that decide what an unconfigured run does — the manifest, the scripts directory,
the command default, the plan, the command the plan carries, the spawn, the two loops, and the verdict
over what the children returned — and compares each to the one form it may take. *It is a text clause
and it says so; what makes it not a presence test is that it captures the whole declaration.* The
alternative is a run with no override at all, which is `npm run selftests`, which is 290 s.

**And `alone` was a LABEL until `G5` existed.** Every exclusivity clause in `G4` compares the printed
plan against the markers, so *runs alone* was asserted about a string: with the filter falsified,
`--plan` printed `alone` for both and the run put all seven in five lanes. **The item's own headline
shape — the name is bound and the argument is not — one layer inside the fix for it.**

**The last clause costs ~0.6 s, and [W38](../work-items/w38-the-dispatch-nothing-binds.md) dropped
its analogue for costing 8.4.** Its argument is *a clause is worth its cost in proportion to how
quiet its absence is*, and here it comes out the other way: an unconditional dispatch prints a
self-test report where a check report belongs and is loud; **a runner that plans seven entries and
runs six is `npm run gate` at exit 0 with a self-test that did not run**, which is
[Q149](../open-questions.md) one level out — in the item after the one that closed it — and is the
quietest failure this repository has measured.

**6. The cost measure is stated before the change and does not move afterwards.** Wall time here is
not reproducible ([Q179](../open-questions.md)): two whole passes over one unchanged tree differ by
**13.0%**, and three back-to-back runs of `check:markdown:selftest` alone spread **127.8 to
169.2 s — 32%**. So every claim in the Consequences below says which side of that band it falls on,
and the reproducible half — **process starts** — is reported beside it.

## Consequences

**The gate is 393.1 s where it was 516.1** — the same work in 15 chain entries instead of 21, nothing
added and nothing removed. **A 23.8% saving against a ±13% band**: it clears the noise by not quite
twice the band's width, and it is the **only** claim below that clears it at all.

**Both numbers are sums of per-entry medians and neither is a gate wall clock, which is stated because
the two differ.** The method is the one declared before the change — each entry as
`npm run <entry>`, three times, median — and it is what makes the before and after comparable. One
end-to-end `npm run gate` on the final tree reads **414 s**, `GATE EXIT=0`, zero lines beginning
`FAIL`, 15 entries — and a second, an hour earlier on the same tree, read 463 s. A second, taken by W39's conformity reader **while another reader was gating an
isolated copy on the same machine**, read 401 s against a 318 s table. *Concurrency makes the gate
sensitive to what else is running in a way the `&&` chain was not*, which is a real consequence of
this decision — and it is P4's retro's own lesson, two readers on one machine contaminating each
other's measurements, arriving on the wall clock rather than on the tree.

```
                                   before          after
TOTAL                             516.1 s        393.1 s      -23.8%   outside the band
  L0 - lint, typecheck               7.8 s          7.9 s       +0.1 s  INSIDE the band - no claim
  the seven checks                   8.9 s          9.5 s       +0.6 s  INSIDE the band - no claim
  L1-L6, three runtimes             10.5 s         10.7 s       +0.2 s  untouched by design
  proving the checks can fail      488.9 s        365.0 s      -25.3%   outside the band
                                                                        ratio 54.9x -> 38.4x
node process starts                  2611           4466       +71.0%   deterministic
```

**Two fifths of the saving went back on the binding, and that is the number to carry.** At code-complete,
before either reader reported, the table read **318.2 s — a 38.3% saving**, and the **twelve** blocking
findings the two readers made between them cost **75 s** of it — 38% of the 197.9 s the arrangement
had bought, every second of it inside
`check:wiring:selftest`, which WAS one of the two exclusive entries (ADR 0072 retired its marker; `check:scheduler:selftest` is now the only one) and therefore **entirely on the
critical path**. That entry has gone **65.5 s → 96.7 s → ~200 s**, and **502 → 765 → 2264 process
starts**, to buy `G4` and then `G5`; the clause itself costs 1.3 s. **[Q176](../open-questions.md) at
a factor of 150**, inside the decision that cites it: *a check's price is what it costs to run
multiplied by how often the thing around it is re-run* — and, new here, **multiplied again by whether
it can share the machine**.

**The starts figure is not comparable in the way the seconds are, and the reason is a defect in the
instrument.** The counting hook wrote `argv.slice(1).join(' ')` and the counter dropped empty lines,
so **every `node -e ""` counted as zero**. Nothing in the gate spawned one before this item; `G4`'s
stub runs spawn fourteen per `check-wiring` run, and there are hundreds of those inside
`check:wiring:selftest`. The *before* figure is unaffected and the *after* figure is right; the
comparison mixes a fix to the instrument with a change to the tree, and says so.

**Three things this does NOT buy, stated because the arithmetic invites all three.**

- **It does not make the work smaller.** The serial-equivalent sum of the seven *rose* from 488.9 s
  to **494.7 s** under concurrency and to 572-600 s in the three-run spike: contention is real and
  costs 5-20%. What the gate stops paying is the waiting, not the work — which is why the process
  count is **unchanged** and is the honest measure of what was done.
- **It does not reach 90 s, and 90 s was never this half's budget.** *(This bullet read *"393.1 s is
  still 4.4x the 90 s that document allots a plan gate"*, which is the same comparison across a line
  the Context section now corrects: section 8's *plan gate (L0-L6)* is **18.6 s** after this change
  and inside its budget by a factor of five. What is 393 s is the self-test half, for which section 8
  had no row until P11's retro added one. P11's retro.)* **P11 prediction 4 is CONFIRMED**: no
  arrangement got the gate under ~170 s
  without changing what is proved, and this one did not come close. The floor `check:markdown:selftest`
  at ~170 s is where that prediction named it. *(This bullet then said the floor was **no longer the
  binding constraint** because `check:wiring:selftest` runs alone for ~200 s and the exclusive prefix
  dominates. **That half is WITHDRAWN — see the measurement below.** The prefix and the group are the
  same size and which leads is not a property of the tree; the floor was right and what it missed is a second term
  beside it. P11's retro.)* That is [Q182](../open-questions.md) with a price on it: the two
  entries that must run alone do so because `dev-dist/` holds **fixed paths** — `check-docs.mjs` wipes
  `dev-dist/docs` on every run, and a staged `check-spec.mjs` deletes `dev-dist/spec-selftest` — and
  moving where `check-wiring-selftest` stages would not help, because the copies it runs are the real
  checks and they write the real paths.

  ***P11's retro priced it, and corrected this bullet's claim in the process.*** `selftests` prints its
  own decomposition, so no instrument is needed. Three end-to-end `npm run gate` runs: **356.7 / 357.6 /
  358.1 s wall**, 668.6 / 681.9 / 687.2 serial-equivalent, 5 lanes. `check:wiring:selftest` runs alone
  in **167.8 / 160.9 / 160.0** — *not the ~200 s this bullet claimed, which was a standalone `npm run`
  reading and not what the runner pays* — plus `check:scheduler:selftest` at 12.6 / 13.1 / 13.1, giving
  an **exclusive prefix of 180.4 / 174.0 / 173.1 s: 50.6% / 48.7% / 48.3% of the wall.** The concurrent
  group is `check:markdown:selftest`, at **176.2 / 183.7 / 185.0**.

  ***So "the exclusive prefix now dominates" is WITHDRAWN as a claim inside the band.*** The prefix
  exceeds the group in the first run and the group exceeds the prefix in the second and the third; the
  two are the same size to within [Q179](../open-questions.md)'s own noise, and the reproducible
  statement is that **the two entries which must run alone are roughly half the self-test half**. That is
  [Q182](../open-questions.md)'s price. *P11's retro, which adopted `a measured number is re-taken on
  the tree the item ships` and then had it fire on its own first draft.*

  ***And one thing reproduces far better: the wall clock of the whole entry.*** **355.7 to 371.1 s over
  seven runs — at most 4.3%**, against a per-entry band of 13% and a single-entry spread of 32%.
  *Concurrency averages the variance the serial chain exposed*, which is a consequence of this decision
  that nothing predicted.
- **It does not scale past this machine.** Twenty logical cores run five lanes with room; two cores
  run five lanes badly. The lane count comes from `os.availableParallelism()`, so a smaller machine
  degrades toward the serial cost rather than toward a wrong answer — but **318.2 s is a reading from
  an i7-12700H** and is not a property of the arrangement.

**What an author now owes.** A new check still owes `package.json` two entries and `scripts/` two
files — that is `G3`, unchanged. **What is new is that a self-test which touches anything outside its
own `dev-dist/` subtree owes that marker**, and nothing can check that for you:
`G4` binds the runner to the marker, and **the marker to nothing**. Its absence is a flake with no
obvious cause, which is precisely what [Q148](../open-questions.md) predicted and what this ADR
measured twice. [Q181](../open-questions.md), and [Q182](../open-questions.md) for the other half —
`dev-dist/` held fixed paths (`dev-dist/docs`, and `.self-NN.mjs` written by **two** self-tests
under one name until this item renamed them) and nothing derived a per-check namespace.

*(**Both halves moved on 2026-10-01 —
[ADR 0072](0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md),
[W105](../work-items/w105-the-scratch-directory-is-namespaced.md).** Every scratch path under
`dev-dist/` now carries `process.pid`, so the fixed paths are gone and the per-check namespace is
derived; and **`G6`** in `check-wiring.mjs` binds HALF of what this paragraph says nothing can check —
a path construction that does not carry the pid is refused, with its exceptions declared and compared
both ways. What is still unbound is the sentence as written: a self-test that touches something
**outside `dev-dist/` altogether**, which is `check:scheduler:selftest` and `node_modules`, still
declares that in prose and nothing checks it. The flake this paragraph predicts was MEASURED there —
a `check:docs` loop beside that entry is 4 of 5 green. [Q181](../open-questions.md) stays open on that
residue.)*
