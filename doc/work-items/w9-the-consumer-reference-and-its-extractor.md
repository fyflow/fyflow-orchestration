# W9 — The consumer reference, and the extractor that keeps it true

**Status:** **done** - built, both readers run, every finding acted on, gate re-run and committed
**Plan:** [P3](../plans/p3-a-consumer-reference-the-gate-keeps-true.md) — this item is the whole of it

```
Spec:       all six documents, read from the OUTSIDE for the first time - the
            reference describes what a consumer may rely on, and every claim it
            makes is one spec/ already fixes. It writes no spec and changes
            none: if a rule cannot be stated to a consumer without contradicting
            itself, that is a finding for the Record, not an edit
Owns:       AGENTS.md, scripts/check-docs.mjs, tsconfig.docs.json
            plus one declared exception: package.json, for the gate clause
Inputs:     index.ts's 38 exports, which is the surface being described; the
            six spec documents; examples/l6.ts, whose thirteen rows are the
            only worked flows that exist; the sibling's ../fyflow-scheduler/
            AGENTS.md as a SHAPE to mirror, never as content; and P3's
            measured extraction mechanism
Outputs:    (1) AGENTS.md - one file, the shape P3 Scope 1 lists; (2)
            scripts/check-docs.mjs, extracting every fenced snippet,
            typechecking all and executing the `run` ones; (3) a new gate
            clause; (4) whatever writing the surface down from outside exposes
            about the surface, which P3 expects to be the real result
Depends on: P1 and P2's W6 - there is no point describing a library whose
            non-success half has never run
Blocks:     nothing
Tests:      the snippets ARE the tests, and that is the whole point: a snippet
            that stops compiling or stops producing its stated output fails the
            gate. Expected OUTPUT in a snippet's comments is derived from spec/
            before running, as every L6 row's was; a snippet whose comment was
            pasted from output is a snapshot
Gate:       L0 (typecheck, lint, the new check) and L1 (every `run` snippet
            executes). Node 24; the extractor is repository tooling and RT-R7
            exempts it. Then pass 2 as doc/workflow.md v0.3 defines it - TWO
            readers
Reserves:   Q71-Q80, ADR 0019-0021
```

**Every line is fillable.** The one that needed settling first was `Outputs:` — whether a snippet can
be extracted and executed at all — and [P3](../plans/p3-a-consumer-reference-the-gate-keeps-true.md)
measured it before this was declared, which is the third consecutive item to settle its load-bearing
fact before writing its header block.

---

## Scope

**In**

1. **`AGENTS.md`**, one file, in this order — mirroring the sibling so the three repositories read
   alike, with the sections this library actually needs:

   | § | | why it exists |
   |---|---|---|
   | 1 | What this library is, and what it is **not** | the scheduler runs tasks; this decides which task runs next. A reader arriving from `fyflow-scheduler` needs the boundary before anything else |
   | 2 | **A minimal working program** | the sibling's section 2, and the thing most readers will copy |
   | 3 | The flow definition | nodes, edges, the JSON shape, and the 24 refusals — stated as *what a definition may not be* |
   | 4 | Decisions and predicates | ADR 0002: registered by name, resolved at instantiation |
   | 5 | Fan-out, join, and **choosing a policy** | ADR 0003 is the answer a consumer needs and the reason is short: `arrival-count` hangs on an ordinary failure |
   | 6 | When something fails | ADR 0004 — routing is opt-in per terminal state, and the three things a branch can do |
   | 7 | The human in the loop | `user_action`, `resolve()`, and that a suspended run is **not** stuck |
   | 8 | Run state | the fold, the six outcomes, and `isTerminal` |
   | 9 | Refusals | what throws, what is reported, and why the difference is not a style choice |
   | 10 | Common mistakes | the sibling's best section, and this library has its own list |
   | 11 | **What does NOT exist** | the sibling's strongest section. Ours: no retry, no cancel, no nested fan-out, no durability, no scheduler dependency |

2. **`scripts/check-docs.mjs`.** Extracts every fenced ` ```ts ` block, writes them under
   `dev-dist/docs/`, typechecks all of them together, and **executes** the ones tagged `run`.
   Rewrites `from 'fyflow-orchestration'` — what a consumer writes — to a relative path, so the
   published snippet is realistic and runnable at once.

3. **Three tags, and the third must be justified.** ` ```ts run ` executes; ` ```ts check `
   typechecks only, for a snippet whose point is a type or which would need a scheduler to run;
   a bare ` ```ts ` is a prose fragment and the check **refuses** it unless the line above says
   why. An unchecked snippet in a reference is exactly what this item exists to prevent.

**Out** — named rather than left implicit

- **Changing `index.ts`, `src/` or `spec/`.** The reference describes; it does not adjust what it
  describes to make itself easier to write. Anything it cannot state cleanly is a Record finding and,
  if it needs fixing, its own item.
- **A documentation site**, multiple files, or generated API docs from types. P3 Scope/Out.
- **Describing `arrival-count` as a choice a consumer should weigh.** ADR 0003 decided it;
  the reference says which to pass and why the other is still exported, and does not re-run the
  comparison in prose.
- **[Q53](../open-questions.md)'s contradiction.** `Driver`'s surface says many runs, `ID-R3` says
  one. The reference states `ID-R3`'s rule, cites Q53, and does not resolve it.

## Verification

| Clause | How it is run |
|---|---|
| L0 | `npm run check:spec`, `check:source`, `check:scheduler`, **`check:docs`**, `npm run lint`, `npm run typecheck`, `deno publish --dry-run` |
| **new: `check:docs`** | extract → typecheck all → execute every `run`. **Negative-tested at birth** (`doc/workflow.md` v0.3 section 5 rule 7): a deliberately broken snippet, a snippet whose output changes, and an untagged block must each fail it |
| L1-L6 | unchanged — 288 assertions in five runtimes, 219 at L6 in two. This item touches no `src/` file, so a failure there is this item's fixture |
| pass 2 | **two readers**, per v0.3 |

**Routing cases** (`TEMPLATE.md` asks each in turn): **none apply.** This item adds no routing and no
flow; its snippets exercise the same paths `examples/` already gates. Stated rather than left silent.

## Record

**Gate — what ran.**

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | **RAN** — pass | Node, Deno | `check-spec` (8), `check-source` (10), `check-scheduler` (5), **`check-docs` (4, new)**, `deno lint`, `tsc` × **6** configs (`tsconfig.docs.json` is new), `deno check`, `deno publish --dry-run` |
| **`check:docs`** | **RAN** — pass | Node | **15 snippets: 11 `run`, 4 `check`, 0 untagged** — was 14/7/7 before the readers. Every one typechecks against the real `index.ts`; every `run` one executes and asserts |
| **`check:docs:selftest`** | **RAN** — **12 probes, 12 caught** | Node | new, and the point is that it is **checked in**: W9's five probes were run once by hand in a scratch directory, which the adequacy reader measured the cost of |
| **X5 — the DOM lib pass** | **RAN** — reported | Node | **1 of 15 snippets**, `AGENTS.md:687`, the §12 wiring snippet. [Q71](../open-questions.md) pinned at a number instead of a caveat |
| L1-L6 | **RAN** — pass | all five; L6 in two | 288 assertions and 219 at L6, both unchanged. This item touched no `src/` file |
| **conformity reader** | **RAN** — **5 blocking, 9 defects, 6 notes** | n/a | re-derived §§3-12 from `spec/` before opening the reference; disagreed with its own derivation on six sections and **measured** most findings against the real `index.ts` rather than arguing them |
| **adequacy reader** | **RAN** — **110 mutations, 90 survivors**; 12 blocking classes | n/a | mutations chosen by walking the rule ids, in an isolated copy. **Restricted to claim-mutations: 75 applied, 70 survived (93%)** |
| re-run at `<sha>` | **RAN** — pass | all five, both L6 runtimes | the gate above **is** the re-run acting on both passes |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| `AGENTS.md`, the eleven sections P3 listed | **yes**, twelve — section 12 was added for wiring a real scheduler, which is where the item's one real finding came from | `check:docs` X1: a reference with no snippets fails rather than passing vacuously |
| `scripts/check-docs.mjs` | **yes** | itself — and each of its four checks is negative-tested, which is the only reason to believe the other rows in this table |
| a new gate clause | **yes** | `npm run gate` runs it third, before lint |
| **whatever writing the surface down from outside exposes** | **yes — [Q71](../open-questions.md)** | nothing, and that is honest: a question is not a testable output. See *What broke* 1 |

## What broke

**1. `SchedulerLike` is not satisfied by a real `FyflowScheduler` in a project that includes the DOM
lib — and this library claims browser support.** P3 predicted the plan would find something about the
surface rather than about the prose. It did, in the **first snippet that wires a real scheduler up**.

`FyflowScheduler extends EventTarget`. With `lib: ["ES2022"]` — the configuration this repository
compiles under — it is assignable. Add `"DOM"`, which every browser-targeting consumer has, and it
picks up `addEventListener(type, EventListenerOrEventListenerObject | null, options?)`, which our
narrower `(type, (e: { detail: unknown }) => void)` is not compatible with.

**The workaround is a cast, and a documented cast in a reference is a defect with an apology
attached.** `AGENTS.md` section 12 documents it and cites [Q71](../open-questions.md). **Not fixed**:
`SchedulerLike` is W3's, its two-method shape is what makes ladder L2 possible, and widening it to
the DOM signature would let anything with an `addEventListener` through. W9's declaration put exactly
this out of scope in advance.

**2. I wrote the compiler flags by hand and they were wrong, which is how the finding surfaced.** The
first `check-docs` invoked `tsc` with a list of flags rather than a project file, and those flags
pulled the DOM lib into scope — so the check failed on its own reference. Chasing that produced Q71.
It now uses `tsconfig.docs.json`, so **snippets are checked under the same configuration the rest of
the repository compiles with** rather than under a configuration invented for them.

**A check whose configuration differs from the thing it checks is checking something else**, and this
one only had a configuration at all because it was written by hand twice.

**3. `npx.cmd` reports a non-zero exit with no output on Windows.** `spawnSync('npx.cmd', ['tsc', …])`
returned failure while `npx tsc -p …` run directly passed — a failure **indistinguishable from a real
one**, which is the shape this repository keeps finding. The check now invokes TypeScript's own entry
through `process.execPath`.

**4. The extraction mechanism is stronger than the sibling's, and the sibling documented why it
needed to be.** `../fyflow-scheduler/tests/suites/docs.ts` transcribes each published snippet into a
test by hand, and its own header says the alternative was rotting *"the way `onCompleteDescendants()`
and the benchmark efficiency metric both did"*. Transcription is a copy kept in step by a person.
**Extraction is not a copy** — the snippet in the document is the code that runs.

## What the readers found

**Fourteenth and fifteenth reader-passes, and neither came back empty.** ~30 findings, **3 clean
overlaps** — consistent with W4 (1 in 13) and W5 (3 in ~35), which is now the third measurement
supporting `doc/workflow.md` section 6's two-reader split.

**1. The flagship snippet was broken, and its own assertion was what hid it.** §2's fake scheduler
collected listeners into one array and fanned every detail to all of them. The driver registers
**three** (`SETTLEMENT_EVENTS`), and `normalizeEvent` keys on the terminal state rather than the
event name — correctly, `OR-R3` — so one settlement wrote **three records**, and the run stopped on a
`DuplicateTaskId` and folded to `stopped`. The snippet still exited zero: `added.length === 2` passed
**because `ID-R1` refused the duplicate dispatches before `addTask` saw them.**

**This is the third costume of one finding.** W4's mutation survivor, W5's `setTimeout(1)`, now this:
*the author's fix cannot fail.* And it sat directly under a banner promising *"a stale snippet is a
failing gate rather than a lie"*, in the snippet this item's own Scope calls the thing most readers
will copy. **Doing the thing correctly and asserting the thing are different acts**, and this
repository has now conflated them three times in three work items.

**2. The code is 16% of the reference; the other 84% is unguarded prose.** The adequacy reader's
headline. `check:docs` proves the snippets compile and run — it says nothing about the sentences
between them, and the sentences are where *which policy to pass*, *what `optional` means* and
*whether a refusal throws* actually live. Every one of those could be inverted with the gate green:
ADR 0003's whole answer, the `optional` table, `OR-R10`'s split, the six-outcome precedence, `JP-R7`
and `JP-R8`.

**The response was not to guard the prose. It was to move the load-bearing claims into assertions** —
§3's and §5's definitions now run `validateDefinition`, §7 executes the `user_action` event pair and
a double `resolve()`, §8 executes the precedence table row by row, §9 imports the seven error classes
it names. 7 `run` snippets became 11, and four of the twelve blocking classes are now gate-checked
rather than asserted in a sentence.

**3. Five claims were simply false, and one of them was the count the format's own trap turns on.**
`FD-V14` is **deliberately absent** and the reference said there were 24 refusals — the exact
misreading `spec/flow-definition.md` section 4 was written to prevent, now in the one document a
consumer reads. Also false: *"no UI can show it"* (Q21 is about the **scheduler's** stream; this
library exports `onFoldInput`, `onRegionEvent` and `joinStatusOf`), the throw/report split stated by
refusal class rather than by stack, and *"one `.ts` worker serves Node, Deno **and the browser**"* —
a measured sentence with a third runtime added to it, contradicting `RT-R10` and ADR 0013 rule 6.

**4. Q71 was shipped as a rhetorical caveat, and it had the polarity backwards.** §12 presented the
DOM lib as opt-in. **DOM is TypeScript's default when `lib` is unset**, so the failing configuration
is the common one and the passing one is the exception — the reference's own snippets compile only
because this item wrote `tsconfig.docs.json`. Neither reader accepted the caveat as written and the
adequacy reader measured it: **1 of 15**. That number is now `X5`, reported by the gate on every run,
and it fails if it ever exceeds one.

**5. One character silently deleted a snippet from the gate.** ` ```typescript run `, ` ```TS run `
and three spaces of indentation each made a block invisible to the extractor, and X1's vacuity guard
was aggregate so the other thirteen kept it green. X2's escape hatch fired on the *word* "prose" in
an ordinary sentence. A failing assertion re-tagged `check` passed. A `run` snippet with its
assertions deleted passed. **The extractor refused none of these**, and all five are now refused.

**6. Two defects in `src/` that this item is not permitted to fix.** Both found by probing rather
than reading, and both raised rather than patched:

| | |
|---|---|
| [**Q72**](../open-questions.md) | **Two `Driver`s on one scheduler cross-route.** `ID-R3` refuses a second run on one driver; nothing refuses a second driver on one scheduler. Each receives the other's settlements, a task id is dispatched twice, and a `run-9:` event on a `run-1` driver dispatches `run-9:publish:-:0`. `MultipleRuns`' own message says *"construct a second Driver"* — **the reference's advice, followed literally, produces the defect** |
| [**Q73**](../open-questions.md) | **`onRegionEvent` hands out the driver's own live object**, while `snapshot()`, `foldInputs()` and `onFoldInput` all return frozen copies. §10's *"anything the driver gives you is safe"* now carries an exception, which is the sentence a consumer will remember |

**7. One Record row was wrong and one reader was wrong.** This Record said the gate runs `check:docs`
*third*; it runs fourth. And the adequacy reader listed *"24 refusals"* among count claims that are
*"all true today"* — it is not, which the conformity reader had measured. **Both readers are subject
to the rule they enforce**, and the disagreement is why two of them are worth the cost.

## What this taught

- **P3's question was the right half.** *"Write documentation"* would have produced prose. *"Can a
  reference be kept true by the gate"* produced a mechanism, a finding about the public API within
  its first hour, and two more from the readers pointed at it.
- **The extraction mechanism is stronger than the sibling's, and still guards a minority of the
  document.** Transcription keeps a copy in step by hand; extraction makes the snippet *be* the code.
  Neither touches the argument around the code, and in a reference the argument is most of it.
  **The lesson is not "check the prose" — it is that a claim worth relying on belongs in an
  assertion**, and the ones that stayed prose are now the ones nobody would write code from.
- **The third consecutive item to settle its load-bearing fact before declaring** — ADR 0013, P2's
  two spikes, now P3's extraction spike. **P3's retro should ask whether this belongs in
  `doc/workflow.md` section 1** rather than being rediscovered each time.
- **Rule 7 is the fastest-earning rule this repository has adopted.** On its second outing it found
  four of the five things wrong with this item; the adequacy reader then found that the probes
  proving it were **uncommitted**, and re-running them as a checked-in self-test found seven more
  holes. *A negative test that ran once is a claim about the past* — the same defect class as a
  written claim nobody ran, one level up.
- **Writing an API down from the outside is a review of the API.** Two of the three `src/` defects
  found in this item's life (Q71, Q72, Q73) came from someone trying to *use* the library rather than
  test it. Nothing else in this repository does that.

## Questions raised

**Q71-Q73** from P3's block. Q74-Q80 skipped, never reissued.

| Q | | raised by |
|---|---|---|
| Q71 | `SchedulerLike` is not satisfied by a real `FyflowScheduler` under the DOM lib | W9, writing section 12's snippet |
| Q72 | two `Driver`s sharing one scheduler cross-route, and nothing refuses it | W9's adequacy reader |
| Q73 | `onRegionEvent` hands out the driver's own live object; every other outbound path is frozen | W9's adequacy reader |

## What is still open in this item, deliberately

- **`index.ts`'s 38 exports are still undescribed.** The reference documents about a dozen. Both
  readers named it — the conformity reader as *"a claim by omission it does not defend"*, and
  finding 3 above is what that omission cost once it was stated positively. Whether the other 30 are
  public at all is a question nobody has asked, and it is not W9's to answer.
- **The prose is still unchecked, and mostly should be.** ~84% of the document's claims have no
  assertion behind them. What changed is *which* claims: the ones a consumer writes code from are now
  in `run` snippets. Guarding the rest — that `driver.cancel()` does not exist, that a count is a
  count — costs more than being wrong can, and the adequacy reader said so explicitly.
- **`AGENTS.md` is not run in Deno.** The snippets execute under Node only. L6 already covers both
  runtimes for real flows.
- **X5 reports and does not fail at 1.** The DOM configuration is the one most consumers have and one
  snippet fails under it. Fixing that is [Q71](../open-questions.md), and this item was declared
  without the right to touch `SchedulerLike`.
