---
id: ADR 0048
title: "The scheduler is a declared dependency, reached by one bare specifier"
status: accepted
date: "2026-09-11"
item: W57
raised-by: P16
supersedes: ADR 0013 rules 1, 2 and 6
amends: ""
resolves: Q71
---

# ADR 0048 — The scheduler is a declared dependency, reached by one bare specifier

**Status:** accepted — **supersedes [ADR 0013](0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rules 1, 2 and 6.** Rule 4 of that ADR stands and becomes normative as `RT-R11`; rules 3 and 5 were
[ADR 0029](0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
and are untouched. ADR 0029 rule 1's second sentence — *"ADR 0013 rule 1 is unchanged … `S7` and
`S8` still refuse the two ways that could break"* — is corrected in place there, dated.
**Raised by:** [P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)
decision 1, taken by [W57](../work-items/w57-the-scheduler-is-a-dependency.md)

## Context

**ADR 0013 rule 1 — *the published library depends on the scheduler not at all* — rested on two
things, and this ADR has to name both honestly, because its first draft named neither.** Read ADR
0013's own text. Rule 1's STATED ground is **context fact 4** — *nothing in the published source may
import it, and nothing does*, because ADR 0001 rule 2 and `RT-R2` *"already imply it"* — and its
Consequences predicted, correctly, that when 0.3.0 reached a registry *"rule 3 becomes a version
range and rules 1, 2 and 4 are unchanged"*, which is exactly what ADR 0029 then did. **What context
fact 1 — *the pinned version is on no registry* — forced was not rule 1 but the SHAPE of the
alternative**: with 0.3.0 in a working tree next door, a runtime dependency was undeclarable and a
`peerDependency` was *"a false statement in a manifest"*; and that row's own reason — *"we do not
[have a runtime dependency] — rule 1"* — is rule 1 citing itself. So the sentence
[P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md) handed this
item, *the forcing fact expired*, is true of why the alternative was never PRICED (it could not be
installed, on 2026-08-31 it could — ADR 0029; and Node could not load the source, at 0.5.2 it could
— [S9](../scheduler-upstream.md), [W37](../work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)) and
**false of what rule 1 was decided on**. *(This paragraph carried the plan's version, and the same
sentence went into ADR 0013's status header, ADR 0029's rule 1 note and P16 decision 1, until W57's
conformity reader read ADR 0013 against it. All four are corrected.)*

**What rule 1 WAS protecting is the claim 0013 states in its Consequences: *"a driver that can
construct a scheduler is a driver that will"*, ending ADR 0001's separation quietly.** That is the
argument this ADR has to answer, and it answers it on ADR 0001's own terms. ADR 0001 rule 1 puts
routing in the driver, outside the scheduler; rule 2 keeps a worker from routing. **Neither says
who may IMPORT the scheduler.** The driver was already the one component that touches it —
`src/driver/driver.ts`'s own header sentence — and already handed `addTask` an object a consumer
built for it through `createTask`; importing `FyflowTask` to build that same object moves nothing
across the boundary ADR 0001 draws, and the seam that keeps ladder L2-L5 scheduler-free is a
testing decision that stays (rule 5). What the import DOES make possible is the node-type layer
(fact 1 below), which cannot exist behind a rule forbidding `src/` to name the class it configures
— and that layer builds pools in a **separate sub-path module** (P16 decision 5), so the driver still
RECEIVES its scheduler and constructs none. **The maintainer's words — *the refusal is
counterproductive* — are the decision; this paragraph is why it is safe.**

**What the rule cost while it stood**, measured at P16's declaration on `8550978` and re-taken by
this item on `3ab3f3f` from `dev-dist/p16/facts.mjs`:

| fact | measured |
|---|---|
| **1. The driver hands the scheduler four fields and the scheduler accepts eight.** | `TaskFactory` is `{ id, workerType, payload, optional }`; `new FyflowTask(config)` at 0.5.2 destructures `retryPolicy`, `workerGroups`, `handleRejection` and `limitKey` as well. A node type that configures a task cannot exist behind a rule forbidding `src/` to name the class it configures |
| **3. [Q71](../questions/q71.md) — a real `FyflowScheduler` was not a `SchedulerLike` under the DOM lib.** | `TS2322 x1` under `lib: ["ES2022", "DOM"]`, `x0` under `["ES2022"]`, and the DOM lib is TypeScript's default when `lib` is unset. `AGENTS.md` section 12 documented a cast and called it *"a defect in our type, not in yours"* |
| **4. The reference contradicted itself about the version, twenty-one sections apart.** | Section 1: *"Install whichever version you like."* Section 12: *"Pin the scheduler at 0.5.2."* The second was bound by `D7`; the first by nothing, because a manifest that declares no dependency has no place to state a range |
| **5. The browser bundle argument was never about feasibility.** | `node_modules/fyflow-scheduler/package.json` exports `.` with `node`, `browser`, `types` and `default` conditions; esbuild has resolved the browser build into a test bundle since W5's readers measured it |

**The maintainer's decision, in conversation on 2026-09-11, recorded by P16**: the scheduler is a
hard dependency, and the refusal is counterproductive. This ADR records that decision with the
measurements W57 took to price its three open parameters, each put to the maintainer with both
options priced before it was taken.

### What W57 measured before deciding the parameters

**The peer range**, with npm 11.19.0 against a packed tarball of a library declaring the peer, and a
consumer declaring the scheduler at a version of its own:

| consumer holds | peer `"0.5.2"` | peer `"^0.5.2"` |
|---|---|---|
| 0.4.0 | `ERESOLVE` | `ERESOLVE` |
| 0.5.1 | `ERESOLVE` | `ERESOLVE` |
| 0.5.2 | installs | installs |
| nothing | installs 0.5.2 | installs 0.5.2 |

The two forms behave identically on every version that exists (the registry holds 0.1.0 through
0.5.2); they differ only on versions that do not exist yet, where caret would admit any 0.5.x the
driver was never run against and exact would refuse it until this repository re-pins.

**The JSR declaration**, with `deno publish --dry-run` (Deno 2.9.6) on a copy carrying the bare import
in `src/`:

| `deno.json` | dry run | what a Deno consumer would load |
|---|---|---|
| no `imports` entry, no `package.json` | **refused** — *Import "fyflow-scheduler" not a dependency and not in import map* | — |
| no `imports` entry, **in this repository** | passes | `node_modules/fyflow-scheduler/dist/types/index.d.ts` (`deno info`) — the **npm** build, resolved through `package.json`'s `devDependencies` |
| `"fyflow-scheduler": "jsr:@fyflow/scheduler@0.5.2"` | passes | JSR's TypeScript source |
| `"fyflow-scheduler": "npm:fyflow-scheduler@0.5.2"` | passes | the npm build, which ADR 0029 refused for Deno |

And the L6 shape — `deno.json` carrying the `jsr:` entry **and** `--import-map=examples/deno-import-map.json`
passed on the command line — resolves the specifier to `https://jsr.io/@fyflow/scheduler/0.5.2/index.ts`
with no warning, so the two copies coexist.

**Q71's fix**, seven candidate shapes of `SchedulerLike` under `["ES2022"]`, `["ES2022", "DOM"]`,
the browser configuration (`["ES2022", "DOM", "DOM.Iterable", "WebWorker"]`, `types: []`) and
`deno check`, each against the real class AND the L2-L5 fakes' `(e: { detail: unknown }) => void`:

| listener parameter | real class under DOM | the fakes | verdict |
|---|---|---|---|
| `{ detail: unknown }` (as shipped) | **TS2322** | ok | Q71 |
| `Event & { detail: unknown }` | TS2322 | **TS2322** | worse both ways |
| `CustomEvent<unknown>` | TS2322 | TS2322 | worse both ways |
| `never` | TS2322 | TS2322 | worse both ways |
| `{ detail?: unknown }` | TS2322 | ok | Q71 |
| `SchedulerLike \| FyflowScheduler` as the option's type | ok | ok | **only with a cast at the boundary** — a call on the union needs a listener assignable to the intersection of both signatures, which nothing is |
| **`object`** | **ok** | **ok** | taken; `unknown` behaves identically |

The mechanism: TypeScript compares a callback parameter's OWN parameter covariantly, so the seam's
listener must accept whatever the DOM says a listener receives, and `{ detail: unknown }` is not a
supertype of `Event`. **P16 fact 3 said *"an `import type { FyflowScheduler }` in `src/` closes it
by construction"* — measured, the import alone changes nothing about assignability.** What closes
Q71 is the seam's parameter type; the type import is kept because it turns Q71 into an L0
assertion (`FyflowScheduler extends SchedulerLike`) checked under the DOM lib by two of the three
typecheckers.

**`S7`'s second route.** `check-scheduler.mjs`'s `D1`-`D3` read `node_modules/fyflow-scheduler`,
`package.json` and `examples/deno-import-map.json` and **no source file**. A relative reach into
`../fyflow-scheduler` from `src/` typechecks or fails depending on whether a sibling checkout
exists on the machine — here it fails only because the sibling is the gutted 0.3.0 checkout ADR 0029
describes, with no `index.ts` left in it. So the working-tree half of `S7` has no second observer,
and P16 prediction 4 — *narrowed rather than deleted* — is confirmed.

**What the import costs, on the tree this item ships**: `lint` and all five typechecks exit 0;
L1-L5 report **27 files / 703 cases** in node 24.20.0, deno 2.9.6, chromium, firefox and webkit, the
browser bundle now carrying the scheduler's browser build; L6 reports **1138 assertions over 42 real
runs** in both runtimes with `createTask` omitted — 1061 at the baseline plus **77 this item ADDED**
(two per-row observers on the 38 rows that run the per-row block, one cross-row clause), because the
import itself cost **0** and the default it enables had no observer, see *Decision* rule 5;
`check:docs` reports **0 of 23** snippets failing under the DOM lib; `check:spec` reports **7
documents, 44 examples, 93 rules**, from 92, for `RT-R11`. P16 prediction 1 is confirmed. *(This
paragraph read 1061 — the pre-observer number, under a heading naming the tree that ships. W57's
conformity reader; section 1 rule 5's WHEN clause.)*

## Decision

1. **`fyflow-scheduler` is a `peerDependencies` entry in `package.json`, at EXACTLY the pin** —
   `"fyflow-scheduler": "0.5.2"` — and stays a `devDependencies` entry at the same pin, which is
   what the gate installs. Exact rather than a range because the driver's listener boundary is
   written against one version's event shapes and there is no upstream changelog to read a wider
   range from ([Q3](../questions/q3.md)); the cost is stated in *Consequences*.
2. **The JSR package declares it in `deno.json`'s `imports`** — `"fyflow-scheduler":
   "jsr:@fyflow/scheduler@0.5.2"` — because a published Deno module's dependency is declared exactly
   there and nowhere else. `examples/deno-import-map.json` keeps its role as the map ladder L6 passes
   on the command line: ADR 0029 rule 2 stands, and ADR 0013's reason for keeping the mapping out of
   `deno.json` — *a path outside the package sitting in what we publish* — is not a property of a
   pinned `jsr:` specifier.
3. **`check-scheduler.mjs` gains `D8`: the two PUBLISHED manifests state the pin.** `package.json`'s
   `peerDependencies` entry equals `PIN`, and `deno.json`'s `imports` entry equals
   `jsr:@fyflow/scheduler@PIN` — present, not a path, not `npm:`. `D2` and `D3` bind what the gate
   installs; `D7` binds what the documents say; `D8` binds what an installer is told.
4. **A published file may import the scheduler, by the bare specifier `fyflow-scheduler` and by
   no other form.** `S7` is NARROWED rather than retired: it refuses `@fyflow/scheduler` (Node
   cannot resolve it), a `jsr:` or `npm:` prefix (Node and the browser cannot), a `file:` specifier
   and a relative reach into `../fyflow-scheduler` (a working tree). The resolution is configuration
   — `node_modules` for Node and the browser, `deno.json` for a Deno consumer, the L6 map for the
   rung — which is ADR 0013 rule 4 kept, and `spec/runtime-targets.md` now states it as `RT-R11`.
5. **`createTask` is OPTIONAL, and the default is `(config) => new FyflowTask(config)`.** The
   driver imports the class; a consumer wiring a real scheduler up supplies the scheduler and
   nothing else. The option stays, because ladder L2-L5 run against fakes that hand the driver
   `(c) => c` and read the plain object back — a testing seam the manifest never touched.
6. **`SchedulerLike` stays the structural seam, and a real `FyflowScheduler` satisfies it under
   every lib configuration.** Its listener parameter is `object`; the driver narrows to `detail` at
   the subscription site, which is where ADR 0007 already puts the normalisation. Q71 is RESOLVED,
   and `AGENTS.md` section 12's cast paragraph is deleted rather than apologised for.
7. **`S8` is narrowed and `S9` is retired.** `S8` refuses a `dependencies` or
   `optionalDependencies` entry naming the scheduler — a second declaration beside the peer installs
   a second copy, and two copies of `FyflowTask` are two classes — and a PATH in `deno.json`'s
   `imports`; the `peerDependencies` entry it used to refuse is what `D8` now requires. **Its
   stated limit**: a second alias KEY in `deno.json` (`"@fyflow/scheduler": "jsr:…"`) passes `S8`
   (not a path) and `D8` (which reads the `fyflow-scheduler` key alone) — inert, because `S7` refuses
   that specifier in every published file, and recorded so `RT-R11`'s *`S8` over the two manifests*
   is not over-read. `S9` — *no
   file in the browser bundle's input set imports the scheduler* — is retired because the bundle
   carries the scheduler by construction once `src/driver/driver.ts` imports it, and a rule whose
   property nothing can have is not a rule. ADR 0013 rule 6 goes with it.
8. **How the GATE reaches the scheduler is unchanged.** ADR 0029 rules 1-7 stand: registry
   devDependency at the exact pin, Node from npm's `dist/`, Deno from JSR's source through the L6
   map, nothing through a path or a link, `D1`-`D7` as they were.

## Consequences

**What this makes easy.** [P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)'s
node-type layer can exist: `src/` may name `FyflowTask`, a worker pool and a resource group. A
consumer's wiring is the scheduler and nothing else — no factory, no cast. The manifest is the
statement of what the driver was written against, and `D8` keeps it true.

**What it costs, and each is stated because the alternative table below priced it.**

1. **A consumer ahead of the pin is refused.** npm 7 and later treat a peer conflict as `ERESOLVE`,
   so the day upstream publishes 0.5.3 a consumer wanting it waits for this repository to re-pin,
   or passes `--legacy-peer-deps`. That is the exact pin's price and it is paid on purpose: the
   driver's event-shape sensitivity is real ([Q3](../questions/q3.md)) and unannounced upstream.
   *Measured with npm 11.19.0 only; pnpm and yarn resolve peers differently and were not run.*
2. **Every consumer installs the scheduler.** npm 7+ installs a peer automatically; a consumer who
   already holds it at the pin installs nothing new. The published bundle for the browser loads the
   scheduler's browser build at import time, whether or not a `FyflowScheduler` is ever constructed.
3. **The pin is written in FIVE places across FOUR files, and a check binds each.** `package.json`
   twice (`devDependencies`, `peerDependencies`), `deno.json`, `examples/deno-import-map.json`, and
   `PIN` in `check-scheduler.mjs` beside them — `D2`, `D8`, `D8` and `D3` respectively. A version
   bump edits those four files and regenerates two lockfiles —
   [W36](../work-items/w36-the-scheduler-pin-moves-to-0-5-1.md)'s and
   [W37](../work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)'s precedent, **one file wider**
   (`deno.json`). *(This read "FOUR places" over five entries and "five files … two files wider";
   neither count was right. W57's conformity reader.)*
4. **`test:deno` and `deno check` now load the scheduler at all, and from JSR's source.** Before
   this item nothing under `src/` or `test/` imported it, so L1-L5 under Deno loaded it from
   nowhere; now `deno.json`'s `imports` apply to every Deno command in this repository, and those
   rungs load — not construct — the same artifact a JSR consumer would. *(This read "rather than from
   `node_modules`", a prior state that did not exist. W57's conformity reader.)*

**What a future reader is likely to try that this forbids.** Moving the scheduler to
`dependencies` *"so consumers get it without a peer warning"* — `S8` refuses it, because a
dependency beside a consumer's own copy is two copies. Writing `npm:fyflow-scheduler` into
`deno.json` *"so Deno and Node load the same build"* — `D8` refuses the form, on ADR 0029's own
ground that reading the source under Deno is what has twice surfaced defects `dist/` hides. Widening
the peer to `^0.5.2` *"because that is what everyone does"* — `D8` refuses anything but `PIN`, and
the row below says why.

**What it does not decide.** Which version to pin next ([Q3](../questions/q3.md)) — a bump is
its own item on W36's and W37's precedent, now touching `D8`'s two sites as well. Whether the
JSR publish should be exercised by the gate — nothing here runs `deno publish --dry-run`, and this
item measured that its verdict depends on `package.json` in a way `S8` cannot see
([Q252](../questions/q252.md)).

## Alternatives rejected

| | why not |
|---|---|
| **Caret `^0.5.2`** | Identical to exact on every version that exists, and on every version that does not it admits a driver run nobody has made. Three event-shape facts changed at 0.3.0 with no changelog; `core/FyflowScheduler.ts` happened to be byte-identical 0.3.0 → 0.5.2, which is a fact about three releases and not a promise about the fourth. Priced at the peer table above; the maintainer chose exact |
| **A `dependencies` entry instead of a peer** | Installs a private copy beside whatever the consumer holds. `FyflowScheduler.addTask` takes a `FyflowTask`, and two copies of the class are two classes — `instanceof` and `Map<string, FyflowTask>` both break in ways no type sees. `S8` refuses it |
| **No JSR mapping — let `package.json` resolve it** | `deno publish --dry-run` passes in this repository, and `deno info` shows why: the bare specifier resolves through `devDependencies` to `node_modules`' npm build. A JSR consumer would be handed `npm:fyflow-scheduler` from a **dev**Dependencies field, which is ADR 0029's refused *point Deno at npm* arriving by accident. The one measurement in this item where a green dry run was the wrong answer |
| **An `npm:` mapping in `deno.json`** | Passes the dry run and hands Deno the npm build. ADR 0029 refused exactly this: reading the source under Deno has twice surfaced what `dist/` hides |
| **Moving the L6 map into `deno.json` and deleting `examples/deno-import-map.json`** | Supersedes ADR 0029 rule 2 — a second decision about a second registry, which P16 declared ADR 0050's shape and W60's first issuance condition. Measured unnecessary: the two copies coexist, resolve to the same URL, and `D8` binds the new one to the pin the old one already carries. The redundancy costs one line and buys leaving `D3`'s six probes, `D6`'s two and the rung's command untouched |
| **Retire `S7`** | `D1`-`D3` read no source file, so a `../fyflow-scheduler` reach from `src/` would be guarded by the machine's directory layout and by nothing else. The narrowed clause keeps four of its five shapes and an id cited in seven documents |
| **A union `SchedulerLike \| FyflowScheduler` for the option, `SchedulerLike` unchanged** | Typechecks only with `as SchedulerLike` at the boundary, because a call on the union needs a listener assignable to both signatures at once. That moves Q71's cast from the consumer into the library rather than removing it |
| **Keep rule 1 and widen `SchedulerLike` alone** | Closes Q71 and leaves fact 1 exactly where it was: the node-type layer still cannot name the class it configures, and section 1 still cannot state a version. Half the decision |
