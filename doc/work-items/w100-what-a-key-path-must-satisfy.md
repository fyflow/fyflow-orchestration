# W100 — what a KEY PATH must satisfy, and what a run does when it satisfies nothing

**Status:** done — 2026-09-30; see the Record. *(This read `in progress` until 2026-10-03, while this file's own Record read `DONE 2026-09-30`. Found by `npm run state`. [W114](w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md))* Declared 2026-09-29 on `e06fa68` ([W99](w99-what-a-route-guarantees.md),
pushed), before any file under `Owns` was edited.
**Plan:** [P25](../plans/p25-what-a-route-guarantees-about-the-value-it-carries.md) — *what does a gate's
ROUTE guarantee about the value it carries, and what must its KEY PATH satisfy for that guarantee to exist?*

```
Spec:       spec/flow-definition.md section 3, *What the schemas buy an author — the wiring check*:
            ONE more clause on the arc table's GATE paragraph (the key path the producer FORBIDS) and
            ONE clause on the `fits` row's stated LENIENCY (a key the producer REQUIRES is not read as
            never emitted). **NO RULE ID** — `FD-V` is what a DOCUMENT may say and `FD-R` what a RUN
            refuses, and this refuses nothing: it is a verdict an author reads, which is P25
            stop-and-ask (b)'s answer. The count stays 37.
            **NO ADR** — ADR 0068 already decided that a route guarantees what its TYPE declares and
            that the library derives it from the key path; this is that decision's other half read in
            the refusing direction, and stop-and-ask (b) settled where it lands. ADR 0069 is P25's and
            is SKIPPED, never reused.
Owns:       src/definition/wiring.ts (the key-path walk, and the leniency's scope),
            spec/flow-definition.md, test/definition/wiring.test.ts
            — drawn from P25's work-items row and its seeded exceptions table (section 7 rule 2).
Inputs:     P25 facts 1 and 7 and prediction 4, RE-RUN here (P15 decision 5) — see the corrections
            below, where fact 7 does NOT reproduce and prediction 4 is TAKEN; ADR 0068 and the
            `keyResolvedRoutes` member W99 shipped; `readKeyPath` in src/definition/validate.ts, which
            is the DRIVER's own resolution and therefore the only definition of *the path resolved*;
            spec/flow-definition.md v0.25.
Outputs:    (1) a key path the arriving schema FORBIDS makes the arc leaving the gate by a
                key-resolved route `no`, naming the gate, the key, the failing STEP, the schema's own
                word for it, and what a run does instead
            (2) the two ways a schema forbids a step, both from `readKeyPath`'s own semantics: a step
                whose declared types cannot be a plain object, and a step a CLOSED object does not name
            (3) `unchecked` where the producer says nothing — MEASURED both ways, and a SILENCE rather
                than a word: a producer declaring no schema keeps the `unchecked` it already had, and
                an OPEN producer silent at the key path raises no key-path finding at all
            (4) `fits`'s leniency scoped: a key the PRODUCER REQUIRES is not read as never emitted,
                because `required` refutes the leniency's own premise — the unsound `fits` W99's
                refinement is the first thing in this repository that can manufacture
            (5) P25 prediction 4 MEASURED on real workers, as a pair: 7 branches to `nokey`, ZERO
                `setupSeries` tasks, 22 tasks against the control's 25, and the run `completed`
            (6) the corpus number UNMOVED at 89 arcs / 1 `no` — the shipped key is correct, so an item
                that adds a refusal must show it refuses nothing that was right
Depends on: W99 (the member, the route on the arc, and `requireAlong` are its)
Blocks:     W101 (the authoring session's misspelling is this verdict)
Tests:      L1 on the walk (each way a schema forbids a step, each way it says nothing, and the
            leniency's two sides) and L2 on the arc (the three wrong keys of fact 7 named by the
            check; the shipped key unmoved; a type declaring nothing left silent). Expected values
            from `readKeyPath`'s stated semantics and from `spec/`, never from the check's output.
Gate:       L0 (`lint`, five typecheck lanes, each separately); `npm test` (L1-L5, three runtimes);
            `check:spec` (`C4`/`C8` move with the document); `check:docs`; L6 node and deno, which
            this item leaves UNMOVED; then `npm run gate` with a content digest identical at both ends.
Reserves:   Q415-Q419
```

## What re-running P25's facts CORRECTED — four things, before any file was edited

Derived by grep and by running, on `e06fa68`: the highest W on disk is 99, the register's live table
gives Q411 (W99 used Q410-Q411 and Q412-Q414 are SPENT, never reused), `ls doc/decisions` gives 0068.

1. **P25 FACT 7 DOES NOT REPRODUCE on the tree W99 ships, and the way it fails is the item's
   sharpest input.** The fact says all five key variants give `checkWiring` verdict counts *identical
   to the correct flow*. Measured (`dev-dist/w100/d1.ts`, every verdict printed rather than counted):
   the correct `series.id` and the never-emitted `series.slug` are **4 fits / 0 `no`**, while
   `sereis.id` and `name.id` are **3 / 1**. *(This grouped **the absent key** with those two until the
   conformity reader (F6) measured it against a RESOLVED registry: with the gate's `settings` removed,
   `validateDefinition` returns **one finding** — `FD-V40 at dedupe: settings {} fail gate type
   "distinct"'s settingsSchema: $.key required` — so `new Driver` refuses the document and there is
   no arc for a verdict to catch. P25 fact 7's *only an EMPTY key is refused, by `FD-V40`'s shape clause* is
   incomplete the same way: an ABSENT key is refused too, by that rule's **settingsSchema** clause, and an
   empty one gives TWO findings. The conclusion is untouched — the three WRONG keys this item names are
   each validator-clean at 0 findings, which is the whole point.)* So three of the five DO move the counts —
   **and the fact's conclusion survives in a sharper form, because the `no` they produce reads
   `$: consumer requires "series", producer does not guarantee it`, which is [Q391](../questions/q391.md)'s
   own string VERBATIM.** W99 resolved Q391 by removing that verdict from a correct flow and, one
   misspelled letter away, it is back in the same words. *A wrong key path now produces the exact
   verdict this plan exists to have removed, so an author who has read Q391 reads the check as wrong
   again.* Still true, and it is what the fact was about: **not one verdict mentions a key, a gate or
   a route.**
2. **`series.slug` is INVISIBLE and it is the worst of the three, because the producer FORBIDS it.**
   `identify`'s `series` is `additionalProperties: false` over `id` and `title`, so no value it emits
   can carry `series.slug` — and the arc reads **`fits`** (4 / 0). The reason is W99's own refinement:
   `requireAlong` adds `slug` to the producer's `series.required` and describes nothing, the consumer
   requires `id` and `title` which the producer requires anyway, and nothing looks at `slug` again.
3. **And the refinement manufactures a FALSE `fits` — measured, and this is the finding that makes
   output (1) load-bearing rather than tidy.** With the producer CLOSED at the root and not naming the
   key path's first step, and the consumer REQUIRING that same step, the arc reads **`fits`**
   (`dev-dist/w100/d1.log`, block 2 variant 3) where the unrefined relation reads `no`: `requireAlong`
   writes `required: [… 'series']` without a `properties` entry, and `fits`'s closed-producer clause
   then SKIPS the key as one the producer *never emits*. **A `fits` the run can falsify is the unsafe
   kind** — the spec's own record row — and the run falsifies it absolutely: that route is never
   taken.
4. **P25 PREDICTION 4 IS CONFIRMED, on real workers, and the plan's row says the run was not taken.**
   `dev-dist/w100/d2.ts` runs `tv-ingest` through `examples/run-flow.ts`' own `runFlow` at three keys
   as a PAIR. The shipped `series.id`: `first` 3, `duplicate` 3, `nokey` 1, three `setupSeries` tasks,
   **25** tasks all `done`, ends `3 seriesReady / 3 dropDuplicate / 1 dropUnidentified / 1 done`.
   Either wrong key: **`nokey` 7 of 7**, the key the gate saw `undefined` every time, **ZERO
   `setupSeries` tasks**, **22** tasks all `done`, every file at `dropUnidentified` — and the run
   reports **`completed`**. *Every rung this repository has is green on a flow that did none of the
   work it exists for.* The prediction's two reversal conditions were both checked and neither holds:
   `nokey` is wired to an `end`, and the driver refuses nothing.

## Declared exceptions, at the declaration

**[P25](../plans/p25-what-a-route-guarantees-about-the-value-it-carries.md)'s own file**, for
correction 1: fact 7's row states counts *identical to the correct flow*, which was true on `787d8fc`
and is true of one of its five variants on the tree W99 ships. The row keeps its measurement and gains
a parenthetical naming where it was re-taken, because a reader of P25 would otherwise carry *nothing
catches a wrong key* forward into W101, which is the half this item changes. A plan is on nobody's
`Owns` once declared.

**And THREE more, all found by the conformity reader (F9) rather than by reading** — which is why the
sentence below was wrong:

- **`spec/README.md`**, whose version column moves with `spec/flow-definition.md`. P25's seeded table
  predicted it *likely*; the declaration then named only the plan file.
- **`test/definition/l4-corpus.test.ts`**, the suite census, which every new suite and every new case
  count reaches. In no `Owns` and in **no row** of P25's seeded table.
- **`test/driver/gate.test.ts`**, where scope In 4's L2 assertion of prediction 4 lives. Also in no row
  of that table, which gives `examples/l6.ts` to W101 and gives this file to nobody.
- **`AGENTS.md`**, one sentence, at the CONFORMITY READER's request (its F4, the half outside `Owns`):
  the consumer reference states the leniency unqualified, and P25's seeded table gives that file to
  W101. Taken here rather than left, because the sentence is now inexact in the document a consumer
  reads first and the fix is one clause. `check:docs` re-run over it.

*(This read **Its seeded exceptions table is CORRECT for this item**, that `wiring.ts`, the spec and the
wiring suite are exactly the three files, and that this was the first of P25's three items for which
that table was right first time. It is wrong in all three parts: the table was short by three, and
not one of the three is predictable from a FILE SET — each was created by what the change
CONTAINS, which is P10's retro's finding and P13's refusal of an `Owns` pre-declaration rule for the
thirteenth plan running.)*

## What the verdict IS, and the three shapes it is not

**A key path must satisfy what the value reaching the gate can CARRY, and `readKeyPath` is the only
definition of that** — the driver's own resolution (W93, `src/definition/validate.ts`), where each
segment is an OWN key of a PLAIN object and anything else is `undefined`. So the static question is
per STEP and about the CONTAINER:

| | the arriving schema at a step | what the check says |
|---|---|---|
| **(a)** | its declared types cannot include `object` — `name.id` where `name` is a string | **`no`**: no value it admits can carry the path |
| **(b)** | it can be an object, does not name the step in `properties`, and is `additionalProperties: false` — `sereis.id`, `series.slug` | **`no`**: the schema forbids the key |
| **(c)** | it can be an object, does not name the step, and is OPEN | **silence** — the producer may emit it, which is `fits`'s own leniency one question over |
| **(d)** | it names the step | recurse, and at the end refine with `required`, which is W99's |

**The LEAF's type is never read**, and the reason is ADR 0068 rule 3: `readKeyPath` returns whatever
the path ends on, and *which leaf values count as a key* is the type's judgement — `distinct` wants a
string or a finite number and the library derives no part of that. So a key path ending on a property
the producer calls an array is FINE here and `nokey` at run time, and the check says nothing about it.

**Three silences, and each is measured rather than argued:**

- **a type that declares no `keyResolvedRoutes`** gets no key-path verdict, because the check can name
  a route unreachable only where the TYPE says what the route means — ADR 0068 rule 1's *nothing is
  inferred from a type that declares nothing*, in the refusing direction. **Stated as the design's
  limit**: a consumer's own type keyed on a path nothing can carry is caught by nothing, and what
  would change that is a route whose meaning the library reads rather than the type declaring it.
- **a producer that declares NO schema** keeps the `unchecked` it already has; there is nothing to
  read the path over. This is P25 stop-and-ask (b)'s first clause, and it is literally true today.
- **case (c) above**, which is (b)'s second clause and where this item DEPARTS from its wording —
  below.

## The departure from stop-and-ask (b)'s wording, with the measurement

**(b) says an OPEN producer that says nothing is `unchecked` *rather than a false alarm*. Measured,
there is no false alarm to avoid, and making the arc `unchecked` would DELETE a sound answer.** Three
readings taken on the shipped tree (`d1.log` block 2, `d3.log`):

| the open producer | what the arc says today | is it a false alarm? |
|---|---|---|
| does not name `series`; consumer REQUIRES it | `no`: `$: consumer requires "series", producer does not guarantee it` — *(this row read ``$.series: consumer describes it, producer is open there`` until the conformity reader (F1) measured the arc: that is line 221's reason and this arc takes line 187's. And the `is open there` arm is now **UNREACHABLE**, because output (4)'s guard means the line is reached only when `creq.includes(k) || preq.has(k)`, the first of those returned earlier, and the rest have `preq.has(k)`. **This item is what killed it** — before the scope the guard was `if (!creq.includes(k)) continue;` and the arm fired for a key required by both. All four combinations measured; the arm and its string are removed, so nothing quotes a reason the code cannot print.)* | **No.** The producer's schema admits `series: 42` and the consumer wants an object — measured in `d3.log` block 3b, where the producer's own schema ACCEPTS that value and the consumer's REFUSES it |
| names `series` and nothing under it; consumer requires `series.title` | `no`: `$.series: consumer requires "title", producer does not guarantee it` | **No, and it is not about the gate at all** — `title` is no part of the key path, so an `unchecked` here would hide a finding the gate has nothing to do with |

So the check raises **no key-path finding** in case (c), which is (b)'s substance; the arc keeps its
own answer, which is (b)'s word only where the producer declares no schema. **The conclusion survives
and the stated reason did not**, and both halves are bound by a case rather than by this paragraph.

**What the open case DID turn up is output (4), and it is a defect in the relation rather than in the
gate.** `fits`'s one stated leniency is *a key the consumer DESCRIBES and does not REQUIRE, which an
open producer does not name, is read as never emitted*, argued from *an author who leaves an output
schema open means "there are keys I do not describe"*. A schema that **REQUIRES** a key has said it IS
emitted, so the premise is refuted by the same schema — and `fits` returns **`fits`** for a producer
requiring `series` and describing nothing against a consumer describing `series` as an object
(`d3.log` block 3a), for a value both schemas were asked about and only one accepts. **W99's
refinement is the first thing in this repository that manufactures a required-and-undescribed key from
an ordinary flow**, which is why this is W100's and not P19's. The leniency keeps its reason and gains
its scope; whether it moves any shipped arc is measured at the build and reported as a number.

## Scope

**In**

1. Outputs (1)-(6).
2. The walk's two refusals from `readKeyPath`'s semantics, not from a guess about what a path means.
3. The leniency's scope, and the spec sentence that states it.
4. Prediction 4's run, as a MEASUREMENT in `dev-dist/` and as an L2 assertion of the same fact — the
   run-time half belongs to no L6 row, because P25's seeded table gives `examples/l6.ts` to W101 and
   this item leaves L6 unmoved.

**Out** — named rather than left implicit, with where it goes instead

- **An `FD-V` refusal at construction** — P25 stop-and-ask (b)'s other road, named there as a
  follow-on: the validator reads no producer schema, and giving it one is a wider change than this.
- **The authoring session** — W101's, and the misspelling it starts from is this verdict.
- **The leaf's TYPE**, by ADR 0068 rule 3: the type's judgement, and `distinct`'s own.
- **A key-path verdict for a type that declares no `keyResolvedRoutes`** — the design's stated limit
  above. *What would change it is one of TWO things and the limit named only the first* (the conformity
  reader, F12): the TYPE declaring more, **or** the report gaining a shape that is not an arc verdict —
  because a check could say *this gate's key path can never resolve* with no route semantics at all, and
  what forbids that today is that `checkWiring` returns per-ARC verdicts with nowhere to put a
  gate-level finding, while a `no` on every arc would be wrong about the route the run takes.
- **An ENTRY gate** — both readers reached it (the conformity reader's F8, the adequacy reader's
  F15): a flow whose `entry` IS the gate produces **zero verdicts**, the route targets appearing under
  `report.entry` alone, so a key path misspelled there is caught by nothing this check reports.
  Structurally licensed — *the ENTRY has no arc* — and now named in `spec/` as the fourth silence.
- **A gate wired into a JOIN** — the adequacy reader's F16: the record road reads what arrives AT
  the gate, unrefined, so neither W99's refinement nor this refusal applies and both the right key and a
  forbidden one read `record fits`. Licensed by the spec's *the record is what the node before it would
  carry*; refining a record is a question about `JP-R12`'s shape, and the code now says so at that site.
- **[Q410](../questions/q410.md)** — a verdict carries no `route`, so it cannot say WHY an arc reads
  what it reads. This item adds a reason that NAMES the gate and the route in its text, which is not
  the field that row asks for; W99 raised it with no owner and this item does not take it.
- **[Q411](../questions/q411.md)**, [Q405](../questions/q405.md), [Q406](../questions/q406.md),
  [Q407](../questions/q407.md) — none is about a key path.

## Verification

How each clause of `Gate:` is actually run. Every rung RUN, never piped, and its exit code read
(`doc/workflow.md` section 4).

| Clause | How |
|---|---|
| L0 | `npm run lint`, then each of the five typecheck lanes SEPARATELY — `npm run typecheck` is five lanes chained by `&&` and a chained rung reports its FIRST failure only |
| `npm test` | L1-L5 in three runtimes. *(This said **the new cases are in `test/definition/wiring.test.ts`**  — false, and the conformity reader (F9) measured it: one new case is in `test/driver/gate.test.ts`, whose `DECLARED_CASES` went 19 to 20 and whose count in `l4-corpus.test.ts` moved with it.)* |
| `check:spec` | `C4` (the document's own counts, which must stay 37) and `C8` (`spec/README.md`'s version column) |
| `check:docs` | run, and expected UNMOVED — this item edits no snippet and no count copy |
| L6 node / deno | RUN in both, and expected **UNMOVED at 2176 / 154**: the shipped key is correct, so a new refusal that moves L6 would be refusing something that was right |
| the L6 corpus census | **89 arcs: 73 fits, 1 `no`, 5 transform-passes, 2 transform-fails, 8 unchecked**  — unmoved, and asserted as an EQUALITY in `test/definition/wiring.test.ts` rather than reported. *(This row named **`check:wiring`**, which the adequacy reader (F17) measured as a rung that says nothing about this check: `scripts/check-wiring.mjs` reports `G1`-`G5` about the GATE CHAIN's `:selftest` entries, and under its probe `b9` — the walk's steps reversed, so the shipped `series.id` becomes a refusal  — `npm test` went red at six cases while `check:wiring` stayed EXIT 0. The claim holds and the named rung was the wrong one.)* |
| conformity reader | in an isolated copy, spec first: derive the verdict of every arc of the three key variants, and of the leniency's four shapes, ON PAPER before reading output |
| adequacy reader | in an isolated copy: the walk's two refusals each deletable, the step loop bounded at one, the leniency's new condition, the run-time claim's pair collapsed |
| rule 8 | obligations (a)-(f), with the harness carrying its control, a CRASH and a WRONG-REASON grader control **ON EVERY RUNG THE SET USES** (W99's pass 1 read sixteen against declaration and fourteen were one defect: both its grader controls sat on the `l6` rung, where the reason is the line after `FAIL`, and the `test` rung's `FAIL` line carries the CASE NAME with the assertion message in a detail block at the end), per-edit anchors and a content digest |

*Routing cases this item covers:* none of Q4, Q17, Q10, Q13 or Q6 — it changes a static check and
asserts what a RUN does with a misconfigured gate, and dispatches nothing new. **Prediction 4's run is
the case it exists for.**

## Record

**DONE 2026-09-30.** A key path a producer FORBIDS makes the arc leaving its gate by a key-resolved
route **`no`**, naming the gate, the key, the failing STEP, the word the schema itself uses, the
properties that container does name, and the ROUTE — and the three shapes it says nothing about are
named as silences rather than left. `spec/flow-definition.md` is **v0.26**, no rule id is added and the
count stays **37**. The verdict is a READING, so `src/` refuses nothing new.

| | |
|---|---|
| L6 | **2176 assertions over 154 real runs**, node 24.20.0 and deno 2.9.6 — **UNMOVED**, which is the declared result: the shipped key is correct, so a refusal that moved L6 would be refusing something right |
| L1-L5 | **53 files / 1439 cases** in three runtimes, from 53 / 1430 — six declared cases plus the ONE both readers bought |
| `check:spec` | **7 / 65 / 126 UNMOVED**, `C4 covered 37` |
| `check:docs` | **37 snippets, 31 run, 6 check** — unmoved |
| `checkWiring` over `examples/flows` | **89 arcs: 73 fits, 1 `no`, 5 transform-passes, 2 transform-fails, 8 unchecked** — unmoved, and asserted as an EQUALITY |
| Census | **316 / 243 / 1 / 72**, raising Q415-Q417 and extending Q276 |

### The verdict, and the ORDER that turned out to be the decision

**`keyPathRefusal` is the whole of it**: a walk over the key path's steps that asks of each CONTAINER
whether it can be a plain object and whether it can hold the step, from `readKeyPath`'s own semantics
rather than from a guess about what a path means. Two shapes forbid a step and an OPEN producer silent
there forbids nothing. **The LEAF's type is never read** — ADR 0068 rule 3, and the four `fits` rows of
the suite's table are its only observer, which is why they are now a membership and not decoration.

**What both readers found, from opposite ends, is that the verdict was right and its PLACE in the loop
was not** (the conformity reader's F2, the adequacy reader's F6). Measured on documents
`validateDefinition` accepts with zero findings, one consumer key at a time, same flow, same forbidden
key:

| the consumer past the gate | before | after |
|---|---|---|
| plain | `no` | `no` |
| declares a `transform` | **`unchecked`** carrying the reason | `no` |
| declares `needs: {"v": "."}` | **`unchecked`** carrying the reason | `no` |
| declares `needs: {"v": "produce"}` | **`fits`**, the reason GONE | `no` |

*The fourth row is mine and neither reader reached it*, and it is the worst: `composed()` drops an
arrival it does not read, so the arc came back green with nothing to read at all. **The fix is an ORDER
rather than a case** — a refusal is about whether the route is ever TRAVERSED, and a transform runs on
a value that only exists if it is, while `needs` composes one for the same reason — so the refusal
outranks both roads and `composed` carries it. `unchecked` is documented as *a side declares no schema*
and is the verdict authors are taught to skip, so a transformed consumer past a misspelled gate key read
as green. **Obligation (a)'s shapes clause**: the rule ranges over what a consumer may declare and the
set had instantiated the plain shape alone.

### The readers

**Conformity: 12 findings, 4 BLOCKING, and its central obligation came back with ZERO disagreements on
the VALUES** — 43 derived on paper from `readKeyPath` read as the spec it is, before `wiring.ts` was
opened: the suite's ten table rows (kind, failing step, the schema's word), `tv-ingest`'s arc at four
keys, the leniency's four producer/consumer pairs and the value each accepts, and the L2 run-time pair.
It re-ran every rung and reproduced correction 1 on `git show HEAD:` and output (5) on real workers.
**The fourth plan running with zero disagreements on a conformity reader's central obligation.**

**Its F1 is the sharpest and it is about a STRING**: the departure table's row 1 quoted
`$.series: consumer describes it, producer is open there`, and that arc's reason is line 187's, not line
221's — *and the arm that prints it is UNREACHABLE*. Enumerated over all four combinations of the two
`required` lists: the guard output (4) added means the line is reached only when the consumer requires
the key or the producer does, the first returned earlier, and the rest take the other arm. **This item
is what killed it** — before the scope the guard was `if (!creq.includes(k)) continue;` and the arm
fired for a key required by both. Three sites quoted the dead string and nothing asserted it, which is
`CLAUDE.md`'s own *declared and dead* hazard; the arm and the string are gone.

**Its F3 is `doc/workflow.md` v0.14 change 3 one plan on**: the claim this item WITHDRAWS was standing
in the present tense in `CLAUDE.md` and `doc/README.md`, the two documents an agent reads first — and
its second clause was **already false on W99's tree**, which is this item's own correction 1. P25's
fact-7 row was corrected under a declared exception and these two copies were not searched for.

**Adequacy: 60 mutations, 21 SURVIVED, 19 findings, 6 BLOCKING**, its own harness's control firing first
— its digest read `e3b0c44298fc1c14`, the SHA of the EMPTY STRING, because `git ls-files` inside a copy
under an ignored directory resolves to the parent and lists nothing. *A digest over no files is identical
at both ends of every probe.* Replaced with a filesystem walk asserting a file count, and both its grader
controls behaved (a comment word changed SURVIVED green; a syntax error came back exit 1 with zero named
failures, correctly a CRASH).

| | finding | what it cost then, and now |
|---|---|---|
| F1 | **`own(props, here)` weakened to a bare `here in props`** — five verdicts flip `no` → `fits` | **0 in its copy, 1 FAIL here.** Its copy predated the `toString` rows the author added mid-pass, so it found the hole INDEPENDENTLY and the author had closed it during the pass. Re-measured to confirm |
| F2 | **the refusal carrying the schema and the sample** (`{ ...a, refused }`) | **0 then, 0 now, for different reasons at each end**: there because nothing asserted the transform consequence, here because the F6 fix makes the refusal outrank that road. A ceiling one fix subsumed |
| F3 | **the reason's ROUTE hard-coded to `"first"`** | **0**. Every reason assertion was on `onA`, the DEFAULT route, while `onB` sat in the same case with its `why` never read — v0.23's selection clause exactly. Closed by asserting the route PAIR |
| F4 | **`at` as the last segment rather than the whole prefix** | **0**, because every key in the tree and in the corpus is at most TWO segments, where the two expressions are the same string. Closed by a three-segment row |
| F5 | **a surgical read of the LEAF's type, plus deleting the row that observes it** | **1 FAIL then 0**. `forbidden` bound the `no` half alone, so all four `fits` rows were deletable and ADR 0068 rule 3 could leave with one of them. Closed by the ALLOWED membership |
| F6 | **Output (1) false in two arc shapes** | see the table above — the item's central repair, and the only one that changed `src/` |

**Non-blocking, acted on: F7** (the `nokey` control was a FOURTH CLAIM — `refused !== null` implies
`kind === 'no'`, so no tree made it fire alone; replaced by the right-key run, which v0.22's test does
pass, with the always-refuse tree as its probe), **F8** and **F9** (two truncations at 0, closed by the
count and by an equality's own shape), **F10** and **F11** (the schema's WORD at one observer, and the
property list truncatable to its first entry — obligation (c)'s LIMIT, closed by a second clause),
**F14** and the conformity reader's F7 (the reason asserted a run outcome the check cannot know, in three
ways, one of them a worker whose returned value its own `outputSchema` refuses — the class
`examples/flows/nonconforming.flow.json` ships on purpose), **F15**, **F16** and the conformity reader's
F8 (the three silences, now in `spec/` and in the register), **F17** (the Verification table named
`check:wiring`, a rung that reports `G1`-`G5` about the gate chain and says nothing about this check),
**F18** (two copies of run-time integers no check can compare, from an uncommitted probe, against a
checked-in observer with different ones — the integers are gone and the SHAPE stays).

**Declared ceilings the readers left standing: F12** (the driver case's body emptiable — W85's class,
repo-wide: `DECLARED_CASES` and two counts bind that a case REGISTERS and nothing binds that it asserts),
**F13** and **F19** (the `isPlainObject` arm, semantically equivalent by construction and now justified in
place; and the spec paragraph deletable at `check:spec` exit 0, the `doc/` class refused twenty-three
times).

**Readers — overlap 4, the SIXTY-FOURTH measurement**, at the top of the settled 0-4 band, and the four
are the item's four biggest: the consumer-shape configurations (each reader from its own end, and
neither reached the fourth), the reason's run-time clause, the ENTRY gate, and the `isPlainObject` arm.
*Two readers who share a subject and approach it from opposite ends is what the band's top looks like.*

### Rule 8

**Pass 2 — 32 probes, 22 caught, 5 declared ceilings RUN, 0 undeclared survivors, 0 against
declaration**, with **ELEVEN of the readers' own exact edits checked in as probes** (v0.8) and all four
grader controls right on every pass — a CRASH and a WRONG-REASON on EACH of the two rungs the set uses,
which is v0.24's clause read as W99's pass 1 taught it: **a grader is controlled per RUNG, not per
harness.** Content digest `06161b3d8807b563` identical at both ends.

*The author pass's own two against-declaration verdicts were both re-declarations rather than defects*
(`gX` moved to MODULE scope, because a throw inside `keyPathRefusal` is caught per case and reads as
ELEVEN named failures; `a5` re-declared a genuine ceiling once `schemaProblem`'s refusal was measured).

**And the verification pattern was wrong all along, in a way that cost nothing**: `grep -c "^FAIL"` can
never match the Node runner's four-space indent, so every green run printed a FAIL count of zero by
construction. The exit code was read every time and is the predicate, so no claim rests on it — which
is v0.15's clause holding while its own counter-measure was defeated by the literal [Q276](../questions/q276.md)
is about. Extended there.

### Gate — what ran

| Clause | Result |
|---|---|
| L0 | `lint` EXIT 0; all five typecheck lanes EXIT 0, run SEPARATELY |
| `npm test` (L1-L5) | EXIT 0, **53 files / 1439 cases** in node 24.20.0, deno 2.9.6 and chromium |
| `test:l6` / `test:l6:deno` | EXIT 0 both, **2176 assertions over 154 real runs** each — UNMOVED |
| `check:spec` | EXIT 0, **7 / 65 / 126**, `C4 covered 37` |
| `check:docs` | EXIT 0, **37 snippets, 31 run, 6 check**; `X10` over the four L6 count copies, `X11` over the ADR index |
| `check:markdown` | EXIT 0 |
| `npm run gate` | **EXIT 0**, 16 chain entries, zero `FAIL` lines |

**Content digest `6b9b19d796177e8b` before the gate and `6b9b19d796177e8b` after — IDENTICAL over 421 files.**

**[Q142](../questions/q142.md) measured BEFORE the record step and it does NOT fire**: on the tree this
item ships the whole tree is 166 files / 7613 links against floors of 142 / 6225, probe 1 (`doc/decisions`
cut) is 126 files and FIRES with an `M3` margin of **16 files**, and probe 2 (both directories cut) is 100
files / 5668 links and FIRES with an `M4` margin of **557 links**. This item adds no document — the
register's three rows are its whole contribution to the link count.

**The census was CONFIRMED by a parser written from scratch, which ABORTED ninety-one times first and was
then wrong once more.** The aborts were right and the classifier was too strict: the register's status
cells carry the WORD and then prose about it in any emphasis (`open - narrowed by W5`, `**RESOLVED**`), so
the predicate is the first word after stripping emphasis rather than the whole cell. **Then it read 244 / 71
against the headline's 243 / 72**, because it treated BOTH declared-exempt rows as `open`: Q119 is open and
**Q71 is RESOLVED** (struck in its own cluster cell, closed by W57). *An exemption list carries a per-row
FACT, not one default* — which is the fifth direction a census parser has been wrong in here, and the
first in the exemptions themselves. Corrected: **316 / 243 / 1 / 72**, 316 of 316 in exactly one cluster
cell, five ids (Q1-Q3, Q31, Q32) living in the Resolved table alone as they always have.
### What this item did NOT take

Q415-Q417 are the three silences, each measured and each in the safe direction. **Q418 and Q419 were
reserved and are unused.** No ADR: 0068 is W99's and this is its refusing half.
