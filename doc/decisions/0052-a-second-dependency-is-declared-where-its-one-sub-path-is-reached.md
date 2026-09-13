# ADR 0052 — A second dependency is declared where its one sub-path is reached

**Date:** 2026-09-13
**Status:** accepted — answers the half of [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)'s
question [ADR 0051](0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
left open: how the engine behind the first language adapter is DECLARED, and by whom it is loaded.
Its own record by the maintainer's answer at P17's declaration, on
[ADR 0048](0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)'s
precedent. Amends nothing: `RT-R11` stays the scheduler's rule and `RT-R12` is this one.
**Raised by:** P17, taken by [W62](../work-items/w62-the-jsonata-adapter.md)

## Context

**The package gains a second dependency that its root never loads.** ADR 0051 made a transform a
declared expression in a registered language and shipped the interface against a FAKE language, so
the first real one — JSONata 2.2.2, the maintainer's choice of 2026-09-11 — arrives as a sub-path,
`fyflow-orchestration/jsonata`, exactly as the scheduler helper did (ADR 0049 rule 5): the pure
entry and the scheduler sub-path load none of it. A dependency reached from one sub-path is a
different question from ADR 0048's, whose subject is a dependency the driver itself imports, and
three manifest shapes can express it. **W62 priced all three on scratch copies before the
maintainer chose**, with npm 11.19.0 and Deno 2.9.6:

| shape | a consumer installing the tarball gets | with `--omit=optional` | a consumer already holding `^2.1.0` |
|---|---|---|---|
| `dependencies` at `2.2.2` | jsonata 2.2.2 | 2.2.2 | 2.2.2, deduped upward, no `ERESOLVE` |
| `peerDependencies` + `peerDependenciesMeta` optional | **nothing** | nothing | 2.2.2 |
| `optionalDependencies` | 2.2.2 | **nothing** | 2.2.2 |

**Six facts under the table, each measured.**

| fact | measured |
|---|---|
| **1. The npm tarball ships no code in any shape.** | `npm pack` packs `README.md` and `package.json` alone: `files` names `dist/**` and nothing in this repository builds it. So `npm pack` prices the MANIFEST, and a consumer-install into a scratch directory is what prices the shape |
| **2. Deno has ONE shape whatever npm does.** | No JSR package carries jsonata (`deno info jsr:@jsonata/jsonata`: not found); `npm:jsonata@2.2.2` loads under Deno as a CJS default export and compiles `$sum(` to `S0203`. A JSR package declares that in `deno.json`'s `imports`, so the mapping is `"jsonata": "npm:jsonata@2.2.2"` in every row above |
| **3. `deno publish --dry-run` proves the presence of `node_modules` and nothing about the declaration** — [Q252](../open-questions.md)'s shape a second time. | With the `imports` entry and NO `node_modules`, every shape is refused (*Could not find "jsonata" in a node_modules folder*); with `node_modules` present and the `deno.json` entry DELETED, it passes, resolving through `package.json`'s field. A green dry run says the engine is installed here |
| **4. Under the optional peer, a consumer who imports the sub-path without installing the engine meets a module-not-found at import time** with no warning at install, because the optional flag suppresses it; under `optionalDependencies` the same whenever optional installs are omitted. | Table rows 2 and 3, `jsonata=ABSENT`, then the sub-path's `import engine from 'jsonata'` |
| **5. The peer's reason for the scheduler does not apply.** | ADR 0048 rule 1 made the scheduler a peer because two copies of `FyflowTask` are two classes. jsonata is a pure-function engine: the adapter's `compile` and `evaluate` live in this package's own module, a consumer's copy never meets ours, and the table's third column shows npm deduping upward rather than nesting |
| **6. The adapter relies on the engine's INTERNALS, which is what earns an exact pin.** | jsonata throws PLAIN OBJECTS `{ code, position, token, value, message, stack }` from both `jsonata(expr)` and `evaluate()`, not `Error` instances; it MARKS the arrays it builds with own `sequence` and `keepSingleton` properties, at the top level and nested, which survive `structuredClone` across a thread; and its `$eval` re-compiles at run time with its own `D3120`/`D3121` codes. A minor release may change any of them; the driver's exact pin on the scheduler (ADR 0048) is the precedent, and a bump is its own item on W36's and W37's |

**The maintainer's answers, 2026-09-13, to the three questions W62 put with the pricing above:**
`dependencies` at exactly the pin; `$eval` UNBOUND; and the conformance suite gains a handle for a
runtime that cannot import a URL (the browser bundle, below).

## Decision

1. **`jsonata` is a `dependencies` entry in `package.json`, at EXACTLY the pin — `"jsonata": "2.2.2"`
   — and no other field names it.** Not a peer (fact 5), not optional (fact 4), and exact rather than
   a range (fact 6). `peerDependencies`, `optionalDependencies`, `peerDependenciesMeta`,
   `devDependencies`, `bundledDependencies` and `bundleDependencies` are refused as a second
   declaration, because the hole W57's adequacy reader found was in the field ADJACENT to the one a
   check reads — and W62's adequacy reader found the next one in the same direction:
   `bundledDependencies: ["jsonata"]` put the engine's eight files into the tarball (`npm pack`:
   10 files where the baseline ships 2) with every check green, because an array's keys are its
   indices. `dependencies` installs the engine for the gate as well, so no dev entry is needed.
2. **`deno.json` maps it in `imports` to `npm:jsonata@2.2.2` — the one registry form Deno can reach
   it by (fact 2) — in `imports` and in no `scopes` block.** ADR 0048 refused `npm:` for the
   scheduler because JSR carried its source; here JSR carries nothing, and the choice is npm or
   nothing.
3. **The sub-path `./jsonata` is exported by BOTH manifests** — `package.json` with the scheduler
   sub-path's shape (`node`/`browser`/`types`/`default` under `dist/*/jsonata/`), `deno.json` as
   `./src/jsonata/index.ts` — and the module is in the JSR allowlist (`S6`). Bound by a check
   because ladder L6's manifest clause (2c) names the scheduler sub-path by literal and reads
   nothing else, measured at W62: removing the `deno.json` export cost 0 at L6.
4. **The engine is reached from `src/jsonata/**` alone, by the bare specifier `jsonata` and by no
   other form** — `RT-R12`, `S14`. No published file outside that directory may import the engine
   OR the adapter module: a root or scheduler-sub-path re-export would carry the engine to every
   consumer, which is ADR 0049 rule 5's finding one sub-path over (its reader found the pure entry's
   non-export had no observer; here it has one). Inside the directory, `npm:jsonata`, a path to the
   engine's file and a URL are refused — each resolves in one runtime and not the others, or beside
   the copy the manifests declare.
5. **The pin is written ONCE, as `S15`'s `JSONATA_PIN`, and `S15` holds both manifests to it.**
   `package.json`'s field, `deno.json`'s mapping, the absence of a second field, the absence of a
   scopes mapping and both exports are each a clause with a probe and a grading. No CONSUMER document
   states the number — `AGENTS.md` section 14 says *the one exact version `package.json` names* —
   and this record names the value it decides, as a decision does. W37's `D7` bound two
   sentences to the scheduler's pin because two documents stated it; the cheaper answer is to state it
   nowhere but the check.
6. **The adapter's two halves are ONE module, `worker` its own `import.meta.url`, and both halves
   re-throw the engine's plain objects as `Error`s carrying `code`, `position`, `token` and `value`
   unchanged** (fact 6): `FD-V36` reads the registry half's throw and `TransformFailed` reads the
   worker half's rejection, and both read `instanceof Error`. The worker half hands out PLAIN values —
   every array the engine marked rebuilt without its markers, at every depth, the original returned
   when nothing was marked — because a marked array crosses a thread and fails any deep-equal a
   consumer's worker or test runs over own keys.
7. **Five names are unbound on every compiled expression, by name: `now`, `millis`, `random`
   (ADR 0051 rule 6's three, every adapter's), `shuffle` and `eval`.** `$shuffle` draws from
   `Math.random()` — found by walking the engine's static frame, which REVERSED P17 prediction 4
   exactly as that row said it would, the list growing under a rule stated as a property. `$eval` is
   unbound for a different reason, the maintainer's answer to [Q265](../open-questions.md): it
   re-compiles its argument at RUN time, so a syntax error inside it would land as a task failure
   (`D3120`) that `FD-V36` never saw, and a transform is declared text refused at construction. What a
   consumer loses is expression text built at run time; `$lookup` reads a computed key without
   recompiling anything. The walk over all 63 built-ins observes 61 with a defined value and finds
   exactly the four nondeterministic ones, with `$eval` the one declared deterministic exception.
8. **In a browser bundle the worker half cannot be reached by URL, and the conformance suite says so
   rather than pretending.** esbuild leaves `import.meta.url` as the bundle's own URL
   ([Q261](../open-questions.md)), so `import(adapter.worker)` yields the bundle's entry namespace —
   six conformance clauses red in chromium, firefox and webkit, measured, with parity intact. The
   suite's probes gain an optional `workerHalf` handle: where the URL CAN be imported (Node, Deno) the
   suite imports it and asserts its default export IS that function; only a runtime that cannot load
   it takes the handle. An adapter that needs no handle — the fake language, a `data:` URL — leaves it
   out and the suite is unchanged for it. A bundled consumer serves the sub-path's worker half beside
   their bundle as a module of its own, as they already must the envelope worker.

## Consequences

**What this makes easy.** `import { jsonata } from 'fyflow-orchestration/jsonata'`, one object into
`Registry.languages` and into the bootstrap helper, and a join's successor reduces its collection in
one line. A consumer who never transforms installs 834 KiB once and loads none of it; a bundler
includes the engine only in a bundle that imports the sub-path (237 KiB — P17 fact 9's 242 190 bytes).

**What it costs, each stated because the table above priced it.**

1. **Every npm consumer installs the engine**, transforming or not: one package, no dependencies of
   its own, 834 KiB unpacked (853 605 bytes). The optional-peer shape would have saved that install and cost a
   module-not-found at import time for the consumer who forgot it (fact 4); the maintainer paid the
   install.
2. **A consumer ahead of the pin gets a nested copy, not a refusal.** `dependencies` at an exact
   version dedupes upward when the consumer's range admits it and nests a second copy when it does
   not — harmless (fact 5) and invisible, where the scheduler's peer would have refused.
3. **The pin is written in FOUR places across four files, and one check binds the two that are
   manifests**: `package.json` and `deno.json` under `S15`; `package-lock.json` and `deno.lock` are
   the installers' — a lock out of step is refused by `npm ci`, not by a check (W62's adequacy
   reader, m15), and `deno.lock` carries the specifier with no integrity, because Deno resolves the
   npm package through `node_modules` ([Q271](../open-questions.md)). A bump edits two files and
   regenerates two locks.
4. **`deno publish --dry-run` still has no rung**, and this decision measured a second reason: its
   verdict is about `node_modules` (fact 3). [Q252](../open-questions.md) stays open with that row
   extended.
5. **Inside a bundle the worker half is the consumer's asset** (rule 8), which is Q261's cost
   arriving at the second module a thread must load.
6. **What the walk cannot see**: a built-in whose nondeterminism needs an argument shape the walk
   does not try. The walk observes 61 of 63 names with a defined value over 27 shapes and lists the
   two it cannot — `$error`, which throws by definition, and `$assert`, which returns nothing on
   success (W62's adequacy reader, m08: an `undefined` twice had been counted as observed); the rule
   stays a property and the list stays by name.

**What a future reader is likely to try that this forbids.** Moving jsonata to `peerDependencies`
*"so consumers who never transform install nothing"* — rule 1 and fact 4: the consumer who does
transform then meets a module-not-found with no warning, and `S15` refuses the field. Writing
`jsr:` or a path into `deno.json` — rule 2: no JSR package exists, and a path is ADR 0029's
incident. Re-exporting the adapter from the root *"for one import"* — rule 4 and `S14`: the engine
in every consumer's bundle. Returning the engine's values as they come *"they are just arrays"* —
rule 6: a marked array crosses a thread and fails a deep-equal. Binding `$eval` back *"for dynamic
expressions"* — rule 7: `$lookup`, and the door `FD-V36` cannot see through.

**What it does not decide.** Which version to pin next — a bump is its own item on W36's and W37's
precedent, now regenerating two locks. A second language, and whether its engine is declared the
same way — a second adapter is a future item's, and this rule is stated for `jsonata` by name.
Whether a bundled consumer's worker half should be built for them (a `dist/browser/jsonata/worker.js`)
— [Q261](../open-questions.md)'s row, now with a second module in it.

## Alternatives rejected

| | why not |
|---|---|
| **An optional peer** (`peerDependencies` + `peerDependenciesMeta`) | The shape W57's reader found adjacent to the one a check reads, and the table's second row: a consumer installing the tarball gets NOTHING, and the sub-path fails at import time with no install-time warning. It is the right shape for a dependency a consumer already holds for their own reasons; nobody holds a JSONata engine for the driver's |
| **`optionalDependencies`** | Meant for platform-specific packages whose install may fail; here `--omit=optional` silently produces the module-not-found of the row above, and an install failure would be tolerated in silence |
| **A caret range `^2.2.2`** | The adapter reads the engine's internals (fact 6) — the plain-object errors, the sequence markers, the `$eval` codes — none of which a minor release promises to keep. ADR 0048's argument for the scheduler, and the same precedent for a bump |
| **`jsr:` for Deno** | No JSR package carries jsonata (fact 2). `npm:` is not a preference here, it is the only registry |
| **The pin written in prose and bound by a `D7`-shaped clause** | Two documents stated the scheduler's pin, so W37 bound both. Nothing needs to state jsonata's, so `S15` holds it once and `AGENTS.md` says *one exact version* |
| **Keeping `$eval` bound** | Priced: a syntax error inside it is `D3120` at evaluation, a task failure `FD-V36` never saw, for the benefit of expression text built at run time — which `$lookup` covers for the case an author reaches for. The maintainer unbound it |
| **Skipping the conformance suite in the browser, or padding it with vacuous cases for parity** | The six clauses that reach the worker half meaning nothing in three browsers, or a suite whose count differs by runtime and fails the parity check. The handle keeps every clause live and states which runtime can bind the URL |
| **A second browser bundle serving the worker half** | Changes the bundle script and the runner for a URL the adapter cannot know; and the shipped adapter would still name the bundle in a consumer's build. Rule 8 states the consumer's obligation instead |
