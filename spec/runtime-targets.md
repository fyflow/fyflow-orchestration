# spec/runtime-targets — three runtimes, one source tree

**Status:** v0.5 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md). **v0.2 acts on the second spec-conformity pass**,
which found that v0.1's central claim — *a `node:` import is fatal to a Deno build* — is **false at
Deno 2**, and that the `*.node.ts` mechanism it described does not exist in the form it described.
**v0.3** acted on the third pass, which measured section 1's replacement claim and found *it* wrong
too — in the opposite direction, and contradicted by `RT-R3` in the same document. **v0.4 adds
`RT-R9`**, found by W3 the first time it ran its own tests: a construct `deno check` typechecks
clean and Node cannot execute.
**Normative.** These rules constrain what the source may import and what a gate must run in.
**Inherited, not chosen.** `fyflow-scheduler` runs on Deno, Node and the browser from one source
tree and publishes to JSR and npm. **We are a layer over it, so its reach is our floor** — a
consumer who can use the scheduler in the browser and cannot use the orchestration layer there has
been handed a library that does not compose with the one it wraps.

---

## 1. The targets

Mirrored from `fyflow-scheduler` 0.3.0, verified in its manifests rather than assumed:

| Target | Published as | What ships | Verified at |
|---|---|---|---|
| **Deno** | **JSR** — `@fyflow/orchestration` | **TypeScript source, directly.** No build step | `../fyflow-scheduler/deno.json` — `exports: "./index.ts"`, with an explicit `publish.exclude` allowlist |
| **Node >= 24** | **npm** | an esbuild bundle, `platform: "node"` | `../fyflow-scheduler/package.json` — `exports["."].node`, `../fyflow-scheduler/esbuild.config.js:179-181` |
| **Browser** | **npm**, same package | an esbuild bundle, `platform: "browser"` | `package.json` — `exports["."].browser`, `esbuild.config.js:191-193` |

> **The asymmetry that drives the rules below: JSR publishes the TypeScript source.** npm consumers
> get a bundle esbuild has already resolved per platform; **Deno consumers get the files as
> written.** A published file is therefore read by three toolchains with three different ideas of
> what exists.

### What a stray `node:` import actually does — corrected

**It is not a Deno failure.** Deno 2 supports `node:` specifiers natively; measured at Deno 2.9.6,
both `deno check` and `deno run` accept `import { readFileSync } from "node:fs"` with no
diagnostic. v0.1 of this document asserted the opposite and built its whole rationale on it.

What actually happens, per target:

| target | a `node:` import | a Node global (`process`, `Buffer`, `__dirname`) |
|---|---|---|
| Deno | **works**, via node-compat | mostly works, via node-compat |
| Node | works | works |
| **Browser — esbuild bundle** | **build failure** — cannot resolve it | **bundles silently**, all six |
| **Browser — `tsconfig.browser.json`** | **build failure** — `TS2307: Cannot find module 'node:fs'`, because `types: []` takes `@types/node` out of scope | **build failure** — `TS2591` for `process`/`Buffer`, `TS2304` for `__dirname`/`setImmediate`/`clearImmediate` |

**So the browser catches both — and the typecheck alone catches both, which v0.4 also got wrong in
the other direction.** Measured at tsc 5.9.2 with this repository's `tsconfig.browser.json`: a
`node:` import is `TS2307` and a Node global is `TS2591`/`TS2304`. The esbuild bundle independently
rejects the import.

**That does not retire `RT-R4`'s grep, and the reason is the word *because*.** The typecheck catches
these only *because* `types: []` removes `@types/node` from scope — a one-word config change
silently disables it, and `RT-R5` already documents one API (`localStorage`) that the **Node**
config misses for exactly the mirror-image reason. A check whose coverage is a side effect of an
unrelated setting is not a check. `scripts/check-source.mjs` is the grep, it runs in the gate, and
each of its five assertions was negative-tested.

> **v0.2 of this document said a Node global *"fails nowhere at build time"*, and that is false** —
> it fails the browser typecheck, which is ladder L0 run three times. `RT-R3` below already said so
> (*"if and only if the browser config sets `types: []` and omits `deno.ns`"*) and this paragraph
> contradicted it four lines up. **Third occurrence of one failure mode in this document family**: a
> correct observation about one tool generalised into a claim about the whole toolchain — the first
> two are recorded at section 3 (`*.node.ts`) and in [spec/task-id.md](task-id.md) section 2
> (`_settling`). This one was inside the rewrite written to record those two.
>
> `RT-R4`'s grep still earns its place: it is the **only** mechanism for the import half if the
> browser bundle is not built on every change, and it is the only one that works before the
> tsconfigs exist at all. But `RT-R3`'s *"if and only if"* is the load-bearing statement, and the
> configuration it names is a thing W2 and W3 can get wrong silently.

## 2. What "supported" means

| id | | Test owed by |
|---|---|---|
| `RT-R1` | **A runtime is supported only if the gate runs in it.** Ladder **L0-L5** run in all three — they are pure logic over fixtures and cost three cheap passes rather than three expensive ones. **L6** is the exception and is [Q33](../doc/open-questions.md). A claim of support with no gate behind it is the thing `doc/workflow.md` section 1 rule 4 forbids | **every item that ships a gate** — W2, W3, W4 and W5 |
| `RT-R2` | **One source tree. No per-runtime fork, and no runtime branch in ordinary logic.** A `typeof Deno !== 'undefined'` test inside the fold or the driver is a defect: it makes run state depend on the host, which `doc/concept.md` section 5 does not allow. Where a difference is genuinely unavoidable, section 3 says how it is expressed | W2 and W3 |
| `RT-R3` | **A published file typechecks under all three configurations** — Deno's `deno.json` `compilerOptions`, `tsconfig.node.json`, and `tsconfig.browser.json`. This is ladder L0, run three times. It catches a **browser** violation of `RT-R4` if and only if the browser config sets `types: []` and omits `deno.ns`; it does **not** catch a `node:` import on its own, and `RT-R4` is what does | W2 and W3 |

**This layer's portability problem is much smaller than the scheduler's, and the reason is worth
stating**: the scheduler owns worker execution, so it needs `worker_threads` on Node and Web Workers
in the browser and carries `core/workerWrapper.node.ts` for the split. **We own no worker code and
spawn no threads** ([ADR 0001](../doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
rule 2 — a worker computes and does not route). The driver subscribes to an `EventTarget` and calls
`addTask`.

## 3. If a per-runtime split ever becomes unavoidable

**It should not.** Nothing in the fold, the driver or the definition needs to know its host. This
section exists so that if someone reaches for the sibling's mechanism, they reach for the right one.

**The `*.node.ts` suffix is not a general esbuild feature**, and v0.1 of this document said it was,
citing `../fyflow-scheduler/esbuild.config.js:51-52`. Those lines are real and say what was quoted —
but they sit inside `workerPlugin`'s `build.onResolve({ filter: /\?worker(-direct)?$/ })`
(`esbuild.config.js:40-55`), so the swap fires **only for an import written with a `?worker` query
suffix**. It is a worker-loading convention, and this repo loads no workers. *(Correct citation,
false conclusion — the same failure mode the first conformity pass caught in
[spec/task-id.md](task-id.md) section 2, in the document written to record that lesson.)*

The mechanism that actually does the ordinary split is **`exclude` in the tsconfigs**:
`../fyflow-scheduler/tsconfig.browser.json:17` excludes `**/*.node.ts` and
`tsconfig.node.json:17` excludes `**/*.browser.ts`. A split file must therefore be excluded from the
configs that must not see it **and** from the JSR publish allowlist, in every place, by hand.

| id | | Test owed by |
|---|---|---|
| `RT-R8` | **A `*.node.ts` or `*.browser.ts` file may not be added without excluding it from the other target's tsconfig and from `deno.json`'s publish allowlist in the same change.** Three lists, no mechanism keeping them in step. **If this rule is ever exercised, first check whether the thing needing a split belongs in this repository at all** | W3 |

## 4. What the source may depend on

| id | | Test owed by |
|---|---|---|
| `RT-R4` | **No `node:` specifier and no Node-only global outside a `*.node.ts` file** — and no `*.node.ts` file inside the JSR publish set. The globals are enumerated, not left to judgement: **`process`, `Buffer`, `__dirname`, `__filename`, `require`, `global`, `setImmediate`, `clearImmediate`**. Check: a grep over the published file list for **`node:` in any import form** — `from "node:…"`, a bare side-effect `import "node:…"`, and `import("node:…")` — plus a bare `require(`, and each name above as a free identifier. Run as part of L0. **The browser typecheck catches the globals and the browser bundle catches the imports** (section 1); this grep is what works before either exists, and the only thing that covers a file neither build reaches | **W2 and W3** — both ship published source |
| `RT-R5` | **No DOM API.** No `document`, no `window`, no `localStorage`. **The mechanism is the Node tsconfig, not the Deno one**: the sibling's `deno.json` sets `lib: ["deno.ns", "dom", "dom.iterable", "esnext"]`, so a Deno typecheck sees the DOM and will not object. `tsconfig.node.json` with `lib: ["ES2022"], types: ["node"]` is the configuration that catches it | W3 |
| `RT-R6` | **The driver accepts a caller-supplied `runId` and never requires a particular id source.** Concretely this rules out reaching for `crypto.randomUUID()` as the only path: it is **secure-context-only in browsers**, so a driver that depends on it works on `localhost` and fails on a plain-HTTP page — the worst shape of portability bug, because the failure is environmental rather than logical and no fixture test can reach it. `crypto.getRandomValues` carries no such restriction and is a fine default. See [Q34](../doc/open-questions.md) | W3 |
| `RT-R9` | **Published source uses only TypeScript syntax Node can strip.** No parameter properties, no `enum`, no `namespace`, no decorators, no `import x = require()`. Node 24 runs TypeScript by **erasing types, not compiling them**, so any construct that emits runtime code is `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` — and **no typecheck catches this**: `deno check`, `tsc -p tsconfig.node.json` and `tsc -p tsconfig.browser.json` all accept a parameter property that Node refuses to load. Running the suite under Node is the only thing that finds it, which makes `RT-R1`'s *"the gate runs in it"* load-bearing rather than ceremonial. Test: the existing suite, run under Node — it fails at import time, before any assertion | W2 and W3 |
| `RT-R7` | **Repository tooling is exempt.** `scripts/check-spec.mjs`, the build config and the test harness may use `node:` freely and are not published. Only what a consumer receives is constrained, and the publish allowlist is what draws the line | — process rule, no test |

### The APIs this library is actually allowed to assume

Enumerated rather than left to judgement, because *"use only portable APIs"* is not a mechanism —
the same objection [Q9](../doc/open-questions.md) raises against *"please write pure functions"*:

| API | Deno | Node >= 24 | Browser | used for |
|---|---|---|---|---|
| `EventTarget`, `CustomEvent`, `addEventListener` | yes | yes | yes | the scheduler's whole event surface |
| `structuredClone` | yes | yes (global since 17) | yes | **`OR-R2`** — the one deep copy the outcome record makes |
| `Date.now` | yes | yes | yes | `observedAt` ([ADR 0007](../doc/decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) rule 4) |
| `Map`, `Set`, `queueMicrotask`, `AbortController` | yes | yes | yes | ordinary |
| `crypto.getRandomValues` | yes | yes | yes, **including insecure contexts** | run ids, subject to `RT-R6` |
| `crypto.randomUUID` | yes | yes | **secure contexts only** | **refused** by `RT-R6` |

**`structuredClone` being universal is what makes `OR-R2` portable**, and it is the single most
load-bearing entry in this table: if it were not, the outcome record's copy rule would need a
per-runtime implementation and `spec/outcome-record.md` section 4 would be a different document.

> **`RT-R9` is the first rule here that no static check enforces, and it was found by running the
> code rather than by reading it.** W3's driver used a constructor parameter property — ordinary
> TypeScript, accepted by all three typecheckers — and Node 24 refused to load the module. The
> asymmetry is structural: a typechecker asks *"is this well typed"* and Node's loader asks *"can
> this be turned into JavaScript by deleting characters"*, and those are different questions. This
> is the concrete form of the gap section 1 keeps circling: **each runtime rejects a different
> thing, and no single tool sees the union.**

> **One catch for whoever writes `tsconfig.node.json`.** `structuredClone` is declared in the DOM
> lib, not in `lib.es2022`. So a Node config with `lib: ["ES2022"]` and `types: []` — which is what
> `RT-R5` wants, to make `document` an error — reports **`TS2304: Cannot find name
> 'structuredClone'`**. Measured. `@types/node` declares it globally, so `types: ["node"]` on that
> config is what makes both rules hold at once: DOM stays out, `structuredClone` comes back.

## 5. Release

Process rather than normative, recorded here because the source layout answers to it.

1. **JSR, Deno only.** `deno.json` carries the version and an explicit `publish.exclude` allowlist —
   the sibling excludes `**` and then re-includes each published file by name, which fails closed
   rather than shipping whatever happens to be in the tree. **That allowlist is also `RT-R4`'s
   "published file list"**, so it has to exist before the check can run.
2. **npm, Node and browser in one package**, with conditional `exports` selecting the `dist/node` or
   `dist/browser` bundle and a shared `dist/types`.
3. **The two versions move together.** `deno.json` and `package.json` carry the same number, as the
   sibling's do at 0.3.0.
4. **No changelog** — the sibling has none, and Q3 already records that a version bump there means
   re-reading its reference rather than reading a diff. **Adopting that for our own consumers is a
   choice we have not made**; it is noted so it is made deliberately rather than by imitation.

**The manifests do not exist yet and are not W1's.** `package.json`, `deno.json` and the three
tsconfigs are created by W2 and W3, which is where the toolchain decision was deferred to
([W1](../doc/work-items/w1-the-normative-layer.md), *Scope/Out*). This document is the constraint
they must satisfy, not the files — and `RT-R3`, `RT-R4` and `RT-R5` each name a configuration
detail those files must get right, because each is a place where the check silently stops working.

## 6. Toolchain

| | |
|---|---|
| **Node** | **>= 24**, selected with **fnm**. Pinned in `.node-version` at the repository root, which fnm reads on `cd` |
| **Deno** | current stable — **2.9.6** is what section 1's claims were measured against |
| **Browser** | whatever the sibling's Playwright projects cover — chromium, firefox, webkit (`../fyflow-scheduler/package.json`, `test:browser:*`) |

**We pin higher than the scheduler does, deliberately.** Its `engines.node` is `">=22"`. Ours is
`>=24` **for development**, which is a statement about the machine that runs the gate. Whether the
*published* `engines.node` floor is also 24 is a different question with a different cost — a
consumer on Node 22 can use `fyflow-scheduler` and would be locked out of the layer above it for no
reason this document can name. That is [Q35](../doc/open-questions.md), and until it is answered the
dev pin is not evidence for the publish floor.
