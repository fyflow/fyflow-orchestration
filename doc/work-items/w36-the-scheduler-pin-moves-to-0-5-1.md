# W36 — The scheduler pin moves to 0.5.1

**Status:** done - author pass, BOTH READERS, rule 8 re-run with their twelve edits
checked in, and the gate re-run after acting on them are all complete.
**Plan:** **none, deliberately** — see *"why this belongs to no plan"*.

```
Spec:       spec/README.md rule 6, spec/runtime-targets.md, spec/outcome-record.md
            section 3, spec/task-id.md section 2 — all four cite a VERSION
Owns:       package.json, examples/deno-import-map.json, scripts/check-scheduler.mjs,
            scripts/check-scheduler-selftest.mjs, spec/**, doc/scheduler-upstream.md
Inputs:     fyflow-scheduler 0.5.1 from npm and jsr:@fyflow/scheduler@0.5.1 —
            both measured present, and the reference read at 0.5.1 rather than
            diffed, because the project ships NO CHANGELOG (CLAUDE.md).
Outputs:    Three pins moved to 0.5.1 and `check:scheduler` D1-D5 green on them.
            Eleven self-test probes re-anchored VERSION-AGNOSTICALLY, not re-pinned.
            Every LIVE claim naming 0.3.0 re-verified at 0.5.1 and re-dated; every
            HISTORICAL one left alone, with the split stated.
            A verdict on each hazard CLAUDE.md lists, measured rather than assumed.
            S9's status at 0.5.1.
Depends on: nothing
Blocks:     W35 — the plan's exit artifact should demonstrate the version we ship
Tests:      L0-L6 in both runtimes; check:scheduler and its self-test are the
            checks that exist for exactly this change.
Gate:       L0-L6 both runtimes, check:scheduler + check:scheduler:selftest, then
            the spec-conformity pass (two readers)
Reserves:   Q167-Q169, ADR 0038
```

## Why this belongs to no plan, and why it is a work item rather than a chore

**No plan, on [ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
own written precedent.** That decision took an id outside every reserved block and said why:
*"this decision belongs to neither, because it was forced by an **environment change and an incident**
rather than by a plan. Taking a reserved id would have made a plan's ledger false."* A dependency
bump is the same shape — [P10](../plans/p10-is-fan-out-one-feature-or-two.md) reserves W32-W35 and
asks *is fan-out one feature or two*, and this answers nothing about that. **W36 is simply the next
free id**, which `doc/workflow.md` section 3 permits: work-item ids are one sequence across all plans,
never per plan.

**A work item rather than a `chore:` commit, because it changes `spec/`.** `spec/README.md` rule 6
reads *"a spec rule that depends on `fyflow-scheduler` behaviour cites it — a file and line at
**0.3.0**, the version we pin (Q3)"*. That sentence is **in the normative layer and names the pin**,
so the bump falsifies it; rule 1 says a spec change is its own change with its rationale stated.
Three more `spec/` documents carry version-dated claims. A chore commit would leave a false sentence
in the layer everything else is written against.

**And it runs BEFORE [W35](w35-a-map-on-real-workers.md)**, which is P10's exit artifact on real
workers: a demonstration should run against the version being shipped, not the one about to be
replaced.

## What was measured before this was declared

**Seven facts. Two changed what this item says**, and one of those is the reason it is small.

### 1. Both registries carry 0.5.1, and it is `latest` on both

npm's versions are `0.1.0, 0.1.1, 0.2.0, 0.2.1, 0.3.0, 0.4.0, 0.5.0, 0.5.1` with `latest` at 0.5.1;
JSR's `meta.json` reports the same latest. **So the two-registry pin ADR 0029 rests on survives the
bump** — which was not guaranteed, because ADR 0013 was written when *"npm and JSR both stopped at
0.2.1"* and the whole registry arrangement is younger than that.

### 2. The reference's diff is ENTIRELY ADDITIVE and entirely about a family this library never consumes

**Read rather than diffed, because there is no changelog** — `CLAUDE.md`: *"a version bump means
re-reading `AGENTS.md` §6 rather than reading a diff."* Both were read; the diff is reported because
it turned out to be legible, not because it was trusted.

`AGENTS.md` goes **858 → 887 lines**, its section headings are **identical**, and every added line is
about **`worker.setup.*` / `worker.teardown.*` / `worker.initialization.failed`** — worker lifecycle
events. **This library subscribes to none of them**: `src/driver/listener.ts` takes `task.completed`,
`task.failed` and `task.user_action`, and `spec/outcome-record.md` section 1 fixes the record set at
two kinds.

### 3. The only change to the published TYPE surface is two internal worker-message variants

`dist/types/core/workerInterface.d.ts` gains `'setup_failed' | 'teardown_started'` to a union that
types the wrapper-to-worker protocol. **Every other `.d.ts` is byte-identical** (the only other diffs
are `.d.ts.map` files). **And the `exports` map and `files` list are byte-identical**, so
`check:scheduler`'s `D4` — *every artifact `exports` selects is present* — is testing the same shape.

### 4. `SpawnTaskConfig.parents` is STILL declared and still dead

`doc/concept.md` section 2 turns on it, and its maintainer statement is that it *"stays dead and will
eventually be removed"*. **At 0.5.1 it is still declared** (`workerInterface.d.ts:41`), so that
section is unchanged and **the repository's founding fact — the scheduler has no dependency graph —
is re-verified rather than assumed** at a second version.

### 5. The `user_action` PAIR holds exactly, measured by running it

The single most load-bearing behavioural claim here:
[ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) rule 2
and `OR-R3`. Measured on 0.5.1 with a throwing worker at `maxRetries: 0`:

| task | events fired | `d.state` |
|---|---|---|
| **non-optional** | `task.failed` **then** `task.user_action` | `user_action` on **both** |
| **optional** | `task.failed` only | `failed` |

**And the two non-optional events carry the SAME detail object**, which is the aliasing ADR 0007
rule 1 exists for. Unchanged from 0.3.0.

### 6. L6 passes at 0.5.1 in BOTH runtimes, and that is the real behavioural verification

**489 assertions, 0 failed, 25 real runs, in Node 24.20.0 and Deno 2.9.6** — unmoved. L1 is **574 in
node**, also unmoved. All five `check:scheduler` clauses pass. **L6 is the evidence that matters**: it
exercises all six run outcomes and all six region events on real workers, so a change to the
event contract would surface there rather than in a reading.

### 7. **S9 is UNFIXED at 0.5.1 — both halves, same line** — and that changed what this item writes

[S9](../scheduler-upstream.md) is the **one live upstream item** and `CLAUDE.md` calls it *"ready to
raise"*. At 0.5.1:

- **(a)** `core/threadWrapper.ts:5` on JSR still value-imports `BaseWorkerContext` — an interface —
  alongside real values, which is why the published source cannot load under Node.
- **(b)** `AGENTS.md` §3 still says **ship a `.js` worker**, on the identical lines (50, 75, 78).

**So the citation moves from 0.3.0 to 0.5.1 and the defect does not move at all**, which is a
stronger case for raising it than one version's evidence was. S9's row is updated to say so rather
than left reading as a 0.3.0-only finding.

### What the gate said, and why its failure is not a behavioural one

`GATE EXIT=1`, **9 FAIL lines, all of them `check-scheduler-selftest.mjs` probes reporting *"the
mutation matched nothing"*** — every one anchored on the literal `0.3.0`. **Rule 7 (b) firing
correctly rather than passing**, and the fourth item running to hit it: W33 lost three probes this
way and W34 one. **They are re-anchored version-agnostically rather than re-pinned to 0.5.1**, which
is the fix W33 recorded and the only one that does not reproduce on the next bump.

### Two probe errors, recorded because a wrong probe is not a finding

Three of the four hazard probes came back inconclusive and **all three were my probe, not the
library.** `createPromise` is `addTask`'s **second argument**, not a task field — so passing it inside
the config was ignored, and the reference's text on it is **byte-identical between the two
versions**. And `require('fyflow-scheduler/package.json')` is refused because `exports` does not
expose that subpath — **which is equally true at 0.3.0**, measured. `doc/workflow.md` v0.10's *a
provocation is evidence only when it fires for the reason it names* applies to a measurement as
readily as to a probe.

## Scope

**In**

1. **The three pins**, and `check:scheduler` D1-D5 green on them.
2. **The eleven self-test probes**, re-anchored so the **next** bump does not reproduce this.
3. **Every LIVE claim naming 0.3.0**, re-verified and re-dated.
4. **S9's status at 0.5.1**, since the one live upstream item's evidence doubles.
5. **[Q3](../questions/q3.md)'s resolved row** — *which version do we pin* — which now answers
   0.5.1. **The DECISION is unchanged**: pin one exact version, from both registries, with `D3`
   comparing the halves. Only the number moves, so Q3 is **amended, not reopened**.

**Out** — named rather than left implicit

- **Consuming the new `worker.setup.*` / `worker.teardown.*` events.** They are additive and this
  library subscribes to three event types by design (`spec/outcome-record.md` section 1). Whether a
  driver should ever surface worker-lifecycle failures is a question, not a consequence of a bump —
  raised as [Q167](../questions/q167.md) rather than answered here.
- **Rewriting HISTORICAL citations.** **167 occurrences of `0.3.0` on 151 lines across 43 files** at `HEAD`, excluding the two lockfiles, and most are
  records of what an item measured *at the time*: W1's, W3's, W5's, W6's and W19's `Inputs` and
  Records, superseded [ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md),
  and the line citations ADR 0007 was written from. **A blanket replace would silently rewrite the
  evidence twelve items were decided from**, which is this item's central risk and the reason the
  split is stated here before any edit.

  *(This read **"153 mentions across 43 files"**, which is none of the three predicates. The file
  count reproduces; the count of *mentions* does not, under any combination — with lockfiles it is
  45 / 174 / 157. **A count in prose whose noun does not name a predicate**, which is this
  repository's most-recorded defect class, in the sentence that states this item's central risk.
  Re-derived three ways by W36's conformity reader and written as all three.)*
- **Raising S9 upstream.** Its evidence is stronger now; sending it is a separate act.
- **`examples/**` beyond its printed version banner.** That tree is W35's.

## Verification

| Clause | How it is run |
|---|---|
| **L0** | `npm run lint`, `npm run typecheck` — five projects |
| **L1** | `npm run test`, `test:deno`, and **`test:browser:all`** rather than the gate's chromium-only entry |
| **L6** | `npm run test:l6` and `test:l6:deno` — **the rung that matters here**, because it is the only one with real workers and the whole question is whether a real scheduler still behaves as `spec/` says |
| **`check:scheduler`** | D1-D5, and **`check:scheduler:selftest`**, which is the check written for exactly this hazard |
| **`check:spec`** | `C8` on any `spec/**` version bump |
| **whole gate** | written to a log with `echo "GATE EXIT=$?"` appended and **read from that line** — a `deno lint` failure produces `GATE EXIT=1` with **zero `FAIL` lines**, measured in W34 |
| **conformity** | spec first, then the claims — **every re-dated sentence is a claim about a version, and the reader's job is whether it was re-verified or find-and-replaced** |
| **adequacy** | mutation in an isolated copy, walking `D1`-`D5` |

**Rule 8, all five obligations.** **(e), the WIRING, is this item's named shape**: `check:scheduler`
is the check that exists to stop *"L6 reporting two runtimes green against two different
schedulers"*, and a pin bump is exactly when it must not be silently unwired. **(c), PROVENANCE**, is
the second: every re-dated claim's value must come from a run at 0.5.1 rather than from the sentence
it replaces.

## Record

**Gate — what ran.** Under `eval "$(fnm env --shell bash)" && fnm use 24`.

| Clause | Verdict | Notes |
|---|---|---|
| **L0** | **RAN — green** | `npm run lint` 45 files / 0 findings; `npm run typecheck` all five projects |
| **L1** | **RAN — green in all FIVE runtimes** | **21 files / 574 cases**, unmoved by the bump. node 24.20.0, deno 2.9.6, and via `test:browser:all` chromium, firefox and webkit, each at **parity with node: 574** |
| **L6** | **RAN — green in BOTH runtimes, and it is the rung that matters here** | **489 assertions / 25 real runs**, unmoved, in Node **and** Deno. It exercises all six run outcomes and all six region events on real workers, so a changed event contract would surface here rather than in a reading |
| **`check:scheduler`** | **RAN — `D1`-`D6` green**, and `D6` is NEW | Its header now names both halves: `fyflow-scheduler@0.5.1 (npm) / @fyflow/scheduler@0.5.1 (JSR)` |
| **`check:scheduler:selftest`** | **RAN — 22 probes / 24 gradings**, from 20 / 22 | `PROBES` gained three bounds it did not have |
| **`check:spec`** | **RAN — green, `C8` no longer vacuous** | Four `spec/**` documents bumped, `spec/README.md`'s column moved with them |
| **whole gate** | **RAN — `GATE EXIT=0`, zero FAIL lines, zero error lines, 455 s** | 19 chain entries. Four runs at 506, 501, 455 s and one early abort at 220 s. **The abort had `GATE EXIT=1` with nine FAIL lines**, all self-test probes pinned to `0.3.0` |
| **rule 8 set** | **RAN — 25 provocations, 19 caught, 6 declared ceilings, 0 aborted**, with **twelve of the readers' own edits checked back in** | `node dev-dist/w36/provoke.mjs`, graded on the failure LINES. Tree restored byte-identical |
| conformity reader | **RAN — 18 findings, 12 blocking** | spec first, then the diff. All eighteen acted on |
| adequacy reader | **RAN — 13 mutations, 4 caught, 8 survived, 1 vacuous; 6 blocking** | isolated copy at `%LOCALAPPDATA%\\Temp\\claude\\w36-adequacy`, **zero symlinks and zero reparse points measured three times** — before copying, inside the copy, and again before removal (ADR 0029). `node_modules` copied, not linked: 1979 files source = 1979 copy |
| **overlap** | **1** | the eighteenth measurement, inside the settled 0-4 band, **both readers unprimed**. The one shared subject is the three live 0.3.0 claims that leaked past the live/historical split — the conformity reader found them by reading, the adequacy reader by testing the ceiling that permits them |

**`Owns` audit.** `Owns` was `package.json`, `examples/deno-import-map.json`,
`scripts/check-scheduler.mjs`, `scripts/check-scheduler-selftest.mjs`, `spec/**`,
`doc/scheduler-upstream.md`. **Declared exceptions, all taken deliberately:** `examples/l6.ts` and
`examples/README.md` (the printed banner and the two-halves paragraph — `examples/**` is **W35's**),
`AGENTS.md` ([Q157](../questions/q157.md): no item owns it), `doc/concept.md` (sections 2 and 3's
version claims). Record step: this file, `doc/open-questions.md`, `doc/decisions/**`, `CLAUDE.md`,
`doc/README.md`, `README.md`.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **Three pins at 0.5.1, `D1`-`D5` green** | **yes** | probes `a1`-`a4`, `b1` — five, tripping `{D2}`, `{D3}` and `{D2,D3}` |
| **Eleven probes re-anchored version-agnostically** | **yes** — five shared regexes | `b2` and `b3`: re-pinning either regex to a literal costs 2 and 4 |
| **Every LIVE claim re-verified and re-dated; every HISTORICAL one left** | **yes, after the conformity reader found TWELVE that were not** | `r9` (`{C8}`). **This row was the item's central risk and it was the row that failed** — see *what broke* |
| **A verdict on each hazard `CLAUDE.md` lists** | **yes** — the `user_action` pair measured by running it; the rest by `core/FyflowScheduler.ts` being **byte-identical** between the two versions | `c2` (`{D2}`, 4 lines) |
| **S9's status at 0.5.1** | **yes — UNFIXED, both halves, same lines** | nothing: a `doc/**` claim, and this is the ceiling `doc/` has had refused eight times |

**What broke.**

**1. The item's own central risk is the thing it got wrong.** Its `Out` section says the 167
citations split into **live** and **historical** and that *"a blanket replace would silently rewrite
the evidence twelve items were decided from"*. **The split is enforced by reading, and it leaked
twelve times** — every one a **neighbour** of a line changed correctly: the `_note` beside the pin,
the table row below it, the second half of the same header comment, a later section of the same
`spec/` document, the Consequences under a re-dated ADR, and `spec/task-id.md`, **named in the item's
own `Spec:` line and then not touched**. Reasoning about a line does not sweep what surrounds it.

**2. A prefix replace put `0.5.0` into ADR 0029 rule 2** — `@0.3.` → `@0.5.` left the trailing digit
— in the decision that **is** the pin's authority, contradicting itself two lines apart. The exact
mechanism the scope section warns about, committed by the person who wrote the warning.

**3. Two untrue clauses were written INTO `doc/concept.md` by the re-dating.** *"landed 2026-09-07"*
— npm's own `time` field says **2026-09-03**; that date was when the pin moved, not when the version
landed — and *"and not yet on npm"*, carried forward from the 0.3.0 sentence onto a version that is
npm's `latest`. `doc/decisions/README.md` already lists *"not yet on npm"* among the claims this
repository has got wrong once.

**4. `spec/runtime-targets.md`'s *"verified in its manifests"* was re-dated over evidence that cannot
be opened.** Its `Verified at` column cited `../fyflow-scheduler/deno.json`, `package.json` and
`esbuild.config.js:179-181`. **`esbuild.config.js` is in neither published artifact** — not in npm's
tarball (`files` is `dist/**/*`, `README.md`, `AGENTS.md`) and not in JSR's allowlist — and the
`../fyflow-scheduler/` prefix is a **working-tree** path ADR 0029 abolished. Re-cited to the
published artifacts, which is what `D4` inspects and what a reader can fetch.

**5. The pins were bound and the COMMANDS THAT CONSUME THEM were not** — the adequacy reader's
headline and the sharpest finding of the item. Dropping `--import-map` from `test:l6:deno` makes Deno
resolve the bare specifier out of `node_modules` — the **npm** package — and L6 reports
`25 real runs on fyflow-scheduler 0.5.1, on deno 2.9.6`, 489 assertions, exit 0, **with `D3` printing
`ok`**. The JSR half is never loaded. Replacing the command with `node examples/l6.ts` deletes the
Deno rung entirely, also for zero. `S12` binds the chain's entry NAMES; **nothing bound an entry's
ARGUMENTS**, so `D3`'s own premise — *ladder L6 runs in both runtimes* — was a fact about a command
string nothing checked. **`D6` closes both**, and lives in `check-scheduler.mjs` rather than
`check-source.mjs` because the premise belongs to the check that rests on it.

**6. The banner written to fix a provenance problem had one.** It read `node_modules` in **both**
runtimes, with a comment claiming that was *"the thing that was loaded"* — true in Node, **false in
Deno**, which loads JSR. It read correctly only because `D3` forces the halves to agree, so the bug
was invisible exactly while the check it depends on was passing. Now each runtime reads its own half,
and the discriminating test is checked in: with the npm manifest corrupted to `9.9.9`, **Node prints
9.9.9 and Deno prints 0.5.1**; before the fix both said 9.9.9. Its `catch` also returned
*"(from the import map)"* in Node, which never consults one.

**7. `D6` immediately produced a live instance of a class this repository had killed as a
hypothesis.** `ALL_CHECKS` in the self-test is a **closed allowlist**, so `D6:` failure lines were
invisible to the id parse: both new probes reported `exited 1, wanted [D6], got []` while the report
rows plainly said `D6`. That is [Q43](../questions/q43.md)'s class — a second place the id
vocabulary is written down — which **W29's declaration killed as a hypothesis for three other
self-tests**. Here it was live, and the `agree` projection W29 added is what showed it.

**8. And rule 8's re-run found that a fix for a reader's finding was half a fix**, which is that
obligation's founding observation. The citation bound stops an uncited probe being **deleted**; the
distinctness bound stops it **duplicating** a neighbour; **neither stops it being repurposed into a
different edit that still trips the same check** — the probe passes, `D2` fires, and the `file:`
specifier shape loses its only coverage. Closed by binding each uncited probe to **the one string its
mutant must contain**, since a probe's NAME is prose and nothing can check that prose describes an
edit ([Q162](../questions/q162.md)'s class). Fixing *that* then produced two more of mine — the new
bound read the fixture directory before the fixture exists, and `r3`'s anchor moved when the list
changed shape.

**What this taught.**

**A version bump's characteristic failure is not a behavioural break; it is a sentence whose date
moved while the fact behind it went unchecked.** The behaviour was clean — `core/FyflowScheduler.ts`
is **byte-identical** across the two versions, so all eleven cited lines are unmoved, the
`user_action` pair holds, and L6 passes 489/25 in both runtimes. **Every one of the eighteen
conformity findings was documentation.** `spec/README.md` rule 6 exists to make a bump *"a reviewable
diff instead of an archaeology exercise"*, and the review is what caught them; the rule earned itself.

**And the deeper one: a check can bind its INPUTS tightly and its PREMISE not at all.** `D3` compared
two pins with five clauses and a self-test, while the command that decides whether either is ever
read was bound by nothing. That is obligation (e) — *break the WIRING* — in a shape none of the three
recorded instances had: not a check that is not run (W24, W30), not a guard that cannot reach its
subject (W33), not a value computed and never read (W34), but **a check whose stated premise is a
fact about a command string**. Worth carrying to whoever next writes a check that says *"X and Y must
agree"*: ask what makes X and Y the things actually used.

**The two-registry pin survived a bump, which was not guaranteed.** ADR 0013 was written when *"npm
and JSR both stopped at 0.2.1"*; ADR 0029's whole arrangement is younger than that and had never been
moved. It moved cleanly.

**Questions raised.**

- **[Q167](../questions/q167.md)** — should a driver surface WORKER-lifecycle failures? 0.5.1 adds a
  `worker.setup.*` / `worker.teardown.*` family this library subscribes to not at all. Raised
  **because a bump is exactly when a new event family is easiest to adopt by accident**. Its
  strongest against-argument came from the conformity reader: those events are dispatched by
  `WorkerManager`, not `FyflowScheduler`, so a `Driver` holding a two-method `SchedulerLike` cannot
  see them without widening that interface — ADR 0013 rule 1's whole point.
- **Q168 and Q169 are RESERVED AND UNUSED**, and recorded as such rather than silently dropped.

**What this item did NOT do**, named so the next reader does not assume it:

- **The five re-anchored regexes are agnostic to the version NUMBER, not to its FORMAT.** All require
  `\\d+\\.\\d+\\.\\d+`. A prerelease or four-part pin (`0.6.0-rc.1`) reproduces exactly the nine-probe
  failure this item was fixing. The claim *"the only fix that does not reproduce on the next bump"*
  holds for plain `x.y.z` bumps and is written that way now.
- **`deno.lock` still carries the dead `jsr:@fyflow/scheduler@0.3.0` specifier and its integrity
  hash** — the bump added 0.5.1's rows and pruned nothing. Measured harmless: Deno rejects an
  out-of-constraint redirect and re-downloads. It is a **fourth** place the version is written down,
  after `package.json`, `package-lock.json` and the import map, and nothing checks it.
- **`doc/concept.md` section 3's table is still dated 0.3.0, deliberately.** The rows this repository
  depends on were re-verified — the five task states and the `user_action` pair by running them,
  `detail`-is-the-live-task by its five line citations, the dead `parents` field — and **not every
  row**. The scope is stated rather than the date being moved over work that was not done. The
  conformity reader checked the row most at risk, the Events row, and confirmed it is still complete:
  `FyflowScheduler` dispatches no `worker.*` event at all.
- **S9 is not raised.** Its evidence doubled; sending it is a separate act.
