# W9 — The consumer reference, and the extractor that keeps it true

**Status:** in review - built and gated; **both readers outstanding**
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
| **`check:docs`** | **RAN** — pass | Node | **14 snippets: 7 `run`, 7 `check`, 0 untagged.** Every one typechecks against the real `index.ts`; every `run` one executes |
| negative tests | **RAN** — 5 probes, **5 caught** | Node | a snippet that stops compiling, one that stops producing its stated result, an untagged block, an unclosed fence, and a reference with no snippets at all |
| L1-L6 | **RAN** — pass | all five; L6 in two | 288 assertions and 219 at L6, both unchanged. This item touched no `src/` file |
| conformity reader | **NOT RUN** | — | |
| adequacy reader | **NOT RUN** | — | |
| re-run at `<sha>` | **NOT RUN** | — | follows both readers |

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

## What this taught

- **P3's question was the right half.** *"Write documentation"* would have produced prose. *"Can a
  reference be kept true by the gate"* produced a mechanism, and the mechanism produced a finding
  about the public API within its first hour.
- **The third consecutive item to settle its load-bearing fact before declaring** — ADR 0013, then
  P2's two spikes, now P3's extraction spike. In all three the fact changed what got written. This
  is now a habit rather than a lesson, and **P3's retro should ask whether it belongs in
  `doc/workflow.md` section 1 rather than being rediscovered each time.**
- **Rule 7 on its second outing found four of the five things wrong with this item.** The check's own
  negative tests are what forced the tsconfig, the `npx` fix and the vacuity guard. `doc/workflow.md`
  v0.3 section 5 rule 7 is earning itself faster than any rule P1's retro adopted.
- **Writing an API down from the outside is a review of the API.** Nothing else in this repository
  reads `index.ts` as a consumer would; `examples/` is a gate and `spec/` is normative for us. The
  38-export surface is still unexamined — the reference names about a dozen and says nothing about
  the rest, which is a claim by omission it does not defend.

## Questions raised

**Q71** from P3's block. Q72-Q80 skipped, never reissued.

| Q | | raised by |
|---|---|---|
| Q71 | `SchedulerLike` is not satisfied by a real `FyflowScheduler` under the DOM lib | W9, writing section 12's snippet |

## What is still open in this item, deliberately

- **Both readers.** The gate is not complete until pass 2 has run, and v0.3 asks for two. The
  adequacy reader has an unusual target here: the *reference's claims*, not its code.
- **`check:docs` typechecks under one configuration.** Q71 exists because a second configuration
  behaves differently, and the check does not run it — if it did, the gate would currently fail on a
  defect this item is not permitted to fix. **Named rather than hidden**: the check proves the
  snippets compile *for us*, not for every consumer.
- **`index.ts`'s 38 exports are undescribed.** The reference documents about a dozen. Whether the
  rest are public at all is a question nobody has asked, and it is not W9's to answer.
- **`AGENTS.md` is not run in Deno.** The snippets execute under Node only; the scheduler-wiring ones
  would need the import map. L6 already covers both runtimes for real flows.
