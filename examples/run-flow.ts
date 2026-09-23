/**
 * Ladder **L6** — one real run, on a real `FyflowScheduler`, with real workers.
 *
 * This is the only code in the repository that DRIVES the library end to end. Everything
 * under `src/` talks to `SchedulerLike`, a structural interface with two methods
 * (`ADR 0001`); since [ADR 0048](../doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
 * the published package also DEPENDS on the scheduler — a peer dependency, and one import
 * in `src/driver/driver.ts` for the default `createTask` — which is why this harness no
 * longer writes that factory itself. *(This read ADR 0013 rule 1's "depends on the scheduler
 * **not at all**" from W5 until W57 superseded that rule.)*
 *
 * ## How a run is known to be over, with no clock
 *
 * The hard question at L6, and the three obvious answers are all wrong:
 * `scheduler.completed` fires **every time the scheduler drains** and will fire
 * between the steps of any flow; `stats` reads `queued=0 running=0` for a
 * scheduler that is genuinely stalled (`AGENTS.md`, the `idleTimeout: 0` note);
 * and a `setTimeout` is how a green L6 gets written that proves nothing.
 *
 * So: fold the driver's own input sequence as it arrives
 * ([ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md))
 * and stop when `isTerminal(state)` — `RN-R12`. That is decidable, needs no
 * clock, and is the repository's central invariant applied to a real run for the
 * first time.
 *
 * **Read at the end of the driver's turn, never mid-turn.** The fold is total
 * over any prefix (`RN-R2`) and a mid-turn prefix is not a run's resting state: a
 * settlement is appended before the routing it causes, so between `ingest`
 * settling and its successor being dispatched there is momentarily nothing
 * running, and between the last branch arriving and the join firing the state is
 * momentarily `stuck`. Both are artefacts of reading a prefix inside a
 * synchronous turn. `queueMicrotask` is exactly the right boundary — the driver
 * routes synchronously inside the scheduler's listener, so a microtask queued
 * during that turn runs after all of it — and it is a **boundary, not a
 * timeout**.
 *
 * The wall-clock backstop below is not how the run is detected. It exists so a
 * hang is **reported** rather than hung on, and reaching it is a failure —
 * **except on the one row whose declared result it is**: a run parked on a person
 * cannot finish, because `RN-R12` makes `awaiting_action` non-terminal, so
 * asserting `finishedBy === 'backstop'` there is asserting that rule's negative
 * half. `Expectation.expectBackstop` marks it.
 */
// Everything from the package entry, never from `src/` — an example that reached
// past `index.ts` would be exercising a surface no consumer has.
import {
  Driver, branchIndices, buildTaskId, checkWiring, emptyState, isTerminal, step,
  type FlowDefinition, type WiringReport, type FoldInput, type JoinPolicy, type LogRecord,
  // **W82: `OR-R13`'s payload, from the package ROOT like everything else here.** `index.ts`
  // re-exports `src/driver/driver.ts` whole, so this is the name a consumer has — which is what
  // makes the callback below the one a consumer writes rather than a shape this harness invented.
  type NonconformingResult,
  type Predicate, type RunOutcome, type RunState, type UnmintedTask,
  type UnsatisfiableJoin,
} from '../index.ts';
import { FyflowTask } from 'fyflow-scheduler';
import type { ConcurrentLimitGroup, ResourceGroup } from 'fyflow-scheduler';
// **The SUB-PATH, by its published entry — W59, and since W67 it is the whole of how this harness
// builds anything.** `fyflow-orchestration/scheduler` is the one module of this package that
// constructs scheduler objects, and this file reaches it exactly as a consumer does: through the
// sub-path's entry and never a file under it. The reaches-past-index clause in `l6.ts` exempts this
// one path by name, because it IS a consumer surface. *(This imported `bootstrap` until W67; a
// registry DOCUMENT and `createRuntime` replace every call this file used to make.)*
import { createRuntime, type Runtime, type StartOptions } from '../src/scheduler/index.ts';
// **The SECOND sub-path, by its published entry — W63.** `fyflow-orchestration/jsonata` is the
// language a `transform` names, reached here exactly as a consumer reaches it (ADR 0052 rule 3);
// the reaches-past-index clause in `l6.ts` exempts this entry by name as it does the one above.
import { jsonata } from '../src/jsonata/index.ts';
import type {
  NodeTypeDeclaration, NodeTypeDefinition, PoolSpec, RegistryCode, RegistryDocument,
} from '../index.ts';
// **The registry DOCUMENT, read from disk as JSON — W67, and it is half of P18's exit artifact.**
// Everything this harness used to write in TypeScript — thirteen node types, their pools, their
// groups, their retry policies, the languages, the predicate names — is data now, in a file a
// consumer could copy. What is left in this module is the code that is genuinely theirs: the
// predicates (`l6.ts`'s), a custom group type and a custom node-type class.
import registryDocument from './registry.json' with { type: 'json' };

/**
 * **The registry DOCUMENT this rung runs, and the ONE thing this harness does to it** — W67, and it
 * is P18's exit artifact seen from the harness's side.
 *
 * Until W67 this file held the registry as a TypeScript literal — thirteen `NodeTypeDeclaration`s
 * with a `role` in each config, a `WORKERS` map over one worker file, a `registryFor(delayMs,
 * threaded)` that rewrote them per run, and a `buildScheduler` that called `bootstrap` and
 * registered one group beside its result. **All of it is `examples/registry.json` now**, and what is
 * left in this module is exactly what P18 decision 7 says stays code: the predicates, a custom group
 * TYPE, and a custom node-type CLASS.
 *
 * **Every row runs the document with ONE key written into it and nothing else, and `l6.ts` asserts
 * that as a DIFF.** The one derivation below exists because a per-run knob has NO DOCUMENT SPELLING:
 * `inline` is fixed per TYPE (P18 decision 2 — an instance's config merges into `config` and never
 * reaches it), while `Expectation.threaded` is a property of a ROW. So `registryDocumentFor` writes
 * `inline: !threaded` into the two types that declare none, and does nothing else.
 *
 * *(These sentences said **"every row but a threaded one runs the document AS IT IS ON DISK"** and
 * **"at `threaded: false` it returns the document object itself, unchanged"**. Both are FALSE and
 * were false as written: the document leaves `inline` unsaid on `ScoreWorker` and `WeighWorker`
 * precisely so the knob can set it, so the non-threaded variant writes `inline: true` into two types
 * the file does not mention — which is what the clause below expects, at BOTH settings. The first
 * draft DID return the object itself, and that made the `threaded: false` rows run those two pools
 * on threads, which moved two rows' join-settling order and was caught by L6 on its first run; the
 * prose was not corrected with the code. W67's conformity reader, finding 3, and it is the sharper
 * half of section 1 rule 5: the ASSERTION was right and the sentence that cites it was not.)*
 *
 * **Measured at W67's declaration step, because a knob with no assertion deserves a number**:
 * forcing every such type inline — which is what dropping the knob would do — costs **ZERO** L6
 * failures. That is [Q99](../doc/open-questions.md)'s *a knob held down by no assertion* with a
 * figure. It is kept because what it buys is that the fan-out pool is a real THREAD on the rows that
 * ask for one, which is the one place two tasks are in flight at once and therefore where a dispatch
 * race or an id collision would show — and W51 measured that it changes dispatch order 12/12.
 */
export const REGISTRY_DOCUMENT: RegistryDocument = registryDocument as unknown as RegistryDocument;

/**
 * **The types whose `inline` the document deliberately leaves unsaid** — derived from the document
 * rather than listed, so a type that gains or loses an `inline` moves this set with it. `l6.ts`
 * compares it to the types it expects to be threadable, both ways.
 */
export const THREADABLE_TYPES: readonly string[] = Object.entries(REGISTRY_DOCUMENT.nodeTypes ?? {})
  .filter(([, t]) => (t as NodeTypeDeclaration).inline === undefined)
  .map(([name]) => name)
  .sort();

/**
 * **The document a row runs**, which is the document on disk with `inline` written into the
 * threadable types when the row asks for threads, and the document ITSELF when it does not.
 *
 * **What it may change is bounded and asserted rather than described**: `examples/l6.ts` compares
 * the document a row runs to the document ON DISK key by key, both ways, and the only difference it
 * admits is `inline` on exactly the types `THREADABLE_TYPES` names. Every other section — the
 * workers, the groups, the pools, the predicates, the languages, and every other field of every
 * type — is the file's, byte for byte. That is what makes *this rung runs the document* a fact
 * rather than a sentence, and it is stronger than object identity would be, because identity holds
 * on one path and this holds on both.
 *
 * **`delayMs` is the SECOND override and no L6 row uses it.** `examples/retention.ts`'s scale mode
 * makes hundreds of runs and wants none of the per-task delay the document declares for the sake of
 * a causal settling order; it passes `0`, which is written into every type that declares one — so
 * the four-times relation flattens exactly where nothing depends on it. A row that overrode it would
 * flatten that relation too, which is why the L6 path does not have the option.
 */
export function registryDocumentFor(threaded: boolean, delayMs?: number): RegistryDocument {
  const nodeTypes: Record<string, NodeTypeDeclaration> = {};
  for (const [name, t] of Object.entries(REGISTRY_DOCUMENT.nodeTypes ?? {})) {
    const inline = THREADABLE_TYPES.includes(name) ? { inline: !threaded } : {};
    const config = delayMs === undefined || (t.config as { delayMs?: unknown } | undefined)?.delayMs === undefined
      ? {}
      : { config: { ...(t.config as Record<string, unknown>), delayMs } };
    nodeTypes[name] = { ...t, ...inline, ...config };
  }
  return { ...REGISTRY_DOCUMENT, nodeTypes };
}

/**
 * **This module's realm, marked so a worker can say whether it shares it — W63, W62's mechanism one
 * rung up.** The `echo` worker reports `realm: 'harness'` when it sees this mark and `'thread'` when
 * it does not; an inline pool runs its worker here and a threaded pool in a fresh realm, so a row
 * expecting `'thread'` is red the moment the `Echo` type is made inline.
 */
(globalThis as Record<string, unknown>).__L6_HARNESS_REALM__ = 1;

/**
 * **The language adapters the document NAMES — decision 13, and the runtime imports no engine.**
 * `examples/registry.json` says `"languages": ["jsonata"]`; this supplies it, and `createRuntime`
 * compares the two sets BOTH ways — a language named and not supplied is refused by the resolver, one
 * supplied and not named by the runtime. Exported so `l6.ts` can compare its keys to the languages
 * the flows themselves name (rule 8 obligation (e)).
 */
export const LANGUAGES = { jsonata } as const;

/**
 * **The three predicates this rung registers, and since W67 they live in the SHIM** — P18 decision 7's
 * *what stays code, exactly*, and P18's own sample puts the predicate beside `createRuntime`.
 *
 * The document's `predicates` names these three; `createRuntime` refuses a name it does not supply
 * and a supplied name the document does not carry, so the two halves cannot drift. Each reads what
 * `FD-C3` gives it and nothing else, and each is **total**: a result with no field of the right type
 * takes the default edge, which is what lets one flow's rows disagree while another's do not.
 *
 * *(They were `l6.ts`'s until W67, passed in per row. The map is the default now and a row may still
 * override it — `RunOptions.predicates` — which is the seam a row that wants a different predicate
 * set would use; nothing does today, and the set is compared to the document's names in `l6.ts`.)*
 */

/**
 * The corpus's `isLowConfidence`. It reads the **effective outcome** (`OR-R9`), so it sees one shape
 * whether the node settled or a human resolved it — and it is what the sample flow's `classify` edge
 * turns on: at `confidence: 0.4` the run visits `review` on the LARGE model, at `0.9` it does not.
 */
export const isLowConfidence: Predicate = (ctx) => {
  const r = ctx.outcome.result as { confidence?: number } | null;
  return typeof r?.confidence === 'number' && r.confidence < 0.5;
};

/**
 * **W43's predicate, and it reads `ctx.needs` where the one above reads `ctx.outcome`** —
 * [ADR 0041](../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)
 * and `FD-C3`: a decision sees its node's effective outcome **and whatever its own edge declares**.
 *
 * **It is deliberately NOT total in the way `isLowConfidence` is.** That one guards its read so a
 * node with no `confidence` routes down the default edge; this one does the same, and the guard is
 * what carries the claim: on `decision-on-an-earlier-step` the node it sits on is a `TallyWorker`,
 * whose result has **no `confidence` field**, so `isLowConfidence` applied to `ctx.outcome` there is
 * `false` on **both** payloads. The two predicates therefore disagree on that flow at every input,
 * which is what makes the row able to fail: a driver that left `ctx.needs` empty routes the LOW run
 * to `publish` and the row says so by name.
 *
 * **`ctx.needs` is frozen, and that is a DRIVER-level decision rather than an ADR rule** — the freeze
 * is W42's adequacy reader's and lives in `src/driver/driver.ts` beside `EMPTY_NEEDS`. This predicate
 * reads and does not write, which is what a predicate is for; [Q9](../doc/open-questions.md) is
 * untouched and still declined.
 */
export const earlierWasLowConfidence: Predicate = (ctx) => {
  const e = (ctx.needs as { earlier?: { confidence?: number } }).earlier;
  return typeof e?.confidence === 'number' && e.confidence < 0.5;
};

/**
 * **W63's predicate, and it reads `score` where `isLowConfidence` reads `confidence`** — because
 * `transformed.flow.json`'s two scorers return the SAME confidence and DIFFERENT scores (factors 100
 * and 1000 over one input), so a threshold on the score is what lets ONE payload route one branch
 * away and keep the other: at 0.9 both arrive (90, 900), at 0.4 one is routed away (40 is below 50,
 * 400 is not), at 0.04 both are (4, 40). Three payloads, three arities, one predicate —
 * [Q263](../doc/open-questions.md)'s three shapes reached from the definition's own decision edges
 * rather than from three flow documents.
 */
export const isLowScore: Predicate = (ctx) => {
  const r = ctx.outcome.result as { score?: number } | null;
  return typeof r?.score === 'number' && r.score < 50;
};

/** The three, keyed by the names `examples/registry.json` declares. Compared to that list both ways. */
export const PREDICATES: ReadonlyMap<string, Predicate> = new Map<string, Predicate>([
  ['isLowConfidence', isLowConfidence],
  ['earlierWasLowConfidence', earlierWasLowConfidence],
  ['isLowScore', isLowScore],
]);

/**
 * **A CUSTOM resource group type — P18 decision 4, and the sample's `budget`.**
 *
 * A group type is `{ configSchema?, create(config, key) }` and the three the scheduler ships are
 * pre-registered ones with three different constructors; this is a consumer's, registered the same
 * way. The class is the scheduler's own `ResourceGroup` interface, and it implements the SIX members
 * [ADR 0055](../doc/decisions/0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md)
 * holds a factory's output to — `canRun`, `onStart` and `onFinish` because the scheduler CALLS them,
 * `getMetrics`, `id` and `type` because the interface requires them.
 *
 * **Written long-hand rather than with constructor parameter properties**, because Node runs
 * TypeScript by ERASING types and a parameter property fails at load (`RT-R9`). **P18's own sample
 * shim writes it the other way and does not load** — measured at this item's declaration step,
 * `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`, and it is the fourth thing wrong with that sample after the
 * three W66 recorded.
 *
 * **It names itself something other than its key, ON PURPOSE.** ADR 0049 fact 2 says the scheduler
 * resolves a group by the map KEY and the object's own `id` is inert, and W59's adequacy reader
 * found every fixture in the tree had the two equal, so a check reading the inert name survived every
 * rung. The two BUILT-IN groups here cannot carry that any more — `createRuntime`'s factories pass
 * the document's key as the id, correctly — so the claim moves to the one place a consumer can still
 * get it wrong, which is a custom factory. `resource.acquired` reports `groupId: "budget"`, the KEY.
 */
class DailyBudgetGroup extends EventTarget implements ResourceGroup {
  readonly type = 'DailyBudgetGroup';
  readonly id: string;
  private readonly tokensPerDay: number;
  private spent = 0;

  constructor(id: string, tokensPerDay: number) {
    super();
    this.id = id;
    this.tokensPerDay = tokensPerDay;
  }

  canRun(_key?: string, cost = 0): boolean {
    return this.spent + cost <= this.tokensPerDay;
  }

  onStart(_key?: string, cost = 0): void {
    this.spent += cost;
  }

  onFinish(): void {}

  getMetrics(): { limit: number; running: number; available: number; utilization: number } {
    return {
      limit: this.tokensPerDay,
      running: this.spent,
      available: this.tokensPerDay - this.spent,
      utilization: this.tokensPerDay === 0 ? 0 : this.spent / this.tokensPerDay,
    };
  }
}

/**
 * **A node type CLASS — P18 decision 2, and it is the half of the exit artifact a document cannot
 * express.** A document-declared type is the IDENTITY derivation (merge the instance's config over
 * the declared fields); this one COMPUTES: `model: "large"` becomes one thread and two units of
 * resident VRAM, `model: "small"` four threads and one.
 *
 * **It names the SAME worker as the document-declared `Prompt` type**, on purpose: the two differ in
 * nothing but their derivation, so a clause comparing the pools they built is comparing DERIVATIONS
 * rather than workers. That is the exit artifact's second discriminating pair, and making this
 * `pool()` return `Prompt`'s options collapses it.
 *
 * **Its output passes through exactly the checks a document type's does** (decision 2's *a class
 * cannot compute around a check*): the derived `config` against the `prompt` worker's
 * `configSchema`, the spec's shape against `PoolSpec`, every group it names against the document's,
 * and decision 9's refusal of a resident group beside `idleTimeout: 0` — which is why the timeout
 * below is 30 000 and not the 0 every other type here declares.
 */
class GpuModel implements NodeTypeDefinition {
  readonly worker = 'prompt';
  readonly inline = false;
  readonly configSchema = {
    type: 'object' as const,
    required: ['model'],
    properties: { model: { enum: ['small', 'large'] } },
    additionalProperties: false,
  };
  /** The DEFAULT instance's config — validated against the schema above at `createRuntime`. */
  readonly config = { model: 'small' };
  readonly retryPolicy = { maxRetries: 1, backoffMs: 0 };

  pool(config: unknown, _key: string): PoolSpec {
    const model = (config as { model?: unknown }).model === 'large' ? 'large' : 'small';
    const large = model === 'large';
    return {
      config: { model, delayMs: 5 },
      maxThreads: large ? 1 : 4,
      // Never 0 beside a resident group: the runtime refuses it, on P18 fact 6's measured deadlock.
      idleTimeout: 30_000,
      groups: ['vendor'],
      residentGroups: { gpu: large ? 2 : 1 },
    };
  }
}

/**
 * **What stays CODE, exactly** — P18 decision 7, and this object is the whole of it: the predicates,
 * one custom group type, one custom node-type class, one language adapter. Everything else a runtime
 * needs is in `examples/registry.json`.
 */
export function codeFor(predicates: ReadonlyMap<string, Predicate>): RegistryCode {
  return {
    predicates,
    groupTypes: {
      DailyBudgetGroup: {
        configSchema: {
          type: 'object',
          required: ['tokensPerDay'],
          properties: { tokensPerDay: { type: 'number', minimum: 0 } },
          additionalProperties: false,
        },
        // The object's own name is NOT the key — see `DailyBudgetGroup` for why that is deliberate.
        create: (config, key) => new DailyBudgetGroup(`${key}-by-object-name`, (config as { tokensPerDay: number }).tokensPerDay),
      },
    },
    nodeTypes: { GpuModel: new GpuModel() },
    languages: LANGUAGES,
  };
}

/**
 * **A registry document and the consumer's code become a running scheduler — ONE call, and it is
 * P18's question answered at ladder L6.**
 *
 * This replaces `buildScheduler`, which was fifty lines of `bootstrap`, a hand-built
 * `ConcurrentLimitGroup` registered beside its result, and a `new FyflowScheduler`. **There is no
 * `pool()` call, no group constructed by hand and no `Driver` built by hand left in this file.**
 *
 * `base` is this module's own URL, so the document's relative worker urls (`./workers/ingest.ts`)
 * resolve beside it — decision 7, and the reason the runtime cannot guess it is that inside a bundle
 * `import.meta.url` is the bundle ([Q261](../doc/open-questions.md)).
 *
 * `flows` is every definition this runtime will run, because pools are built ONCE and a language
 * adapter's worker half reaches a typed pool through that pool's config (W61): the same type carries
 * the engine on a run of `transformed.flow.json` and not on a run of `typed.flow.json`.
 */
export function buildRuntime(
  threaded: boolean,
  flows: readonly FlowDefinition[],
  predicates: ReadonlyMap<string, Predicate> = PREDICATES,
  delayMs?: number,
): Runtime {
  return createRuntime(registryDocumentFor(threaded, delayMs), codeFor(predicates), {
    base: import.meta.url,
    flows,
  });
}

/**
 * **What the driver was still holding, observed at the two ends of `JP-R12`'s
 * window** — [W55](../doc/work-items/w55-a-run-at-scale-on-real-workers.md), and it is
 * [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)'s
 * only observable.
 *
 * **A footprint is REPORTED; what is ASSERTED is the RELATION** — this item's own
 * `Tests:` line, and [Q179](../doc/open-questions.md) is why: a byte count is a
 * property of one run on one machine, and the rule is about *which structures hold a
 * result and for how long*. So the two ENTRY counts below are what `examples/l6.ts`
 * asserts, and the two BYTE counts are what `examples/retention.ts` prints.
 *
 * **`bytesBeforeRelease` is a RECONSTRUCTION and says so.** It is the same
 * `v8.serialize` call with the collection as it stood at its peak added to the list,
 * so an object reachable twice is still counted once — which is exactly what the
 * driver held before ADR 0046 rule 3, because the release is the only difference and
 * nothing else drops an entry. **It is validated against the real thing rather than
 * trusted**: W55 reverted the two `releaseArrivals` calls and re-took the numbers,
 * and the item's Record carries both columns.
 */
export interface Retention {
  /** Arrival entries held, per region, at the moment that region's collection was largest. */
  peakByRegion: Readonly<Record<string, number>>;
  /** Arrival entries held, per region, when the run was declared over. */
  endByRegion: Readonly<Record<string, number>>;
  /** The two above, summed across regions. */
  peakEntries: number;
  endEntries: number;
  /**
   * **How many of the values held at the peak are the SAME OBJECT as a log record's
   * `result`** — `JP-R12`'s *second copy* claim, and it is the half a byte count
   * cannot answer. Expected **0**: what a branch carries into a join is the edge-hop
   * clone `advance` made for that hop, and the log holds `OR-R2`'s listener-boundary
   * clone. P15 fact 3 measured this at ladder L2; this is the same claim on real
   * workers.
   */
  peakAliasingLog: number;
  /**
   * **How many `result` objects the log held when that count was taken** — W55's
   * adequacy reader, BLOCKING, and it is obligation (c)'s LIMIT on a SENSOR.
   *
   * `peakAliasingLog` is a count of an intersection, so it is `0` both when nothing
   * aliases and when one of the two sets is **empty**. Measured: making
   * `loggedResults` return `[]` cost **zero** — twenty-six assertions of `JP-R12`'s
   * second-copy claim went on passing against an empty `Set`. This is the other
   * side's size, so `examples/l6.ts` can assert the observer had something to see.
   */
  loggedResults: number;
  /**
   * **How many values the peak snapshot actually holds** — W55's adequacy reader.
   *
   * `peakEntries` counts what the driver recorded; this counts what the harness kept,
   * and the two are what `bytesBeforeRelease` is a subtraction between. Measured:
   * storing an EMPTY map at the peak cost **zero** — the collection column read 0.0
   * KiB on every row while twenty-six aliasing assertions passed against nothing, and
   * the reconstruction stayed *strictly larger* than the end because an empty map is
   * still a few bytes. **Two counts of one thing is what discriminates**, and it is a
   * relation rather than a byte figure ([Q179](../doc/open-questions.md)).
   */
  snapshotEntries: number;
  /**
   * `v8.serialize(...).length` over the driver's own growing structures in ONE call.
   * `null` where `node:v8` is absent, `-1` where the serializer refused the graph —
   * two different facts, and the refusal is one this rung can actually reach
   * (`uncloneable / OR-R6` puts a function in nobody's structures, but a policy's
   * opaque state is not this file's to promise).
   */
  bytesAtEnd: number | null;
  /** The same call with the peak collection added — the shape before ADR 0046 rule 3. */
  bytesBeforeRelease: number | null;
  /**
   * **The driver's own property names the byte measurement WALKED, and the ones it
   * skipped** — obligation (e)'s third shape, *a LIST is a claim about another list*.
   *
   * `NOT_RUN_STATE` is a literal, so without this it is bound to nothing: measured,
   * adding `'arrivals'` to it costs **zero** at both L6 rungs, because every other
   * clause here reads the collection's SIZE through `arrivalsOf` and never through
   * the walk. The byte number would then have silently stopped counting the one
   * structure this whole item is about. `examples/l6.ts` compares the two lists
   * against the driver's own keys, both ways.
   */
  walked: readonly string[];
  skipped: readonly string[];
}

export interface RunReport {
  runId: string;
  flowId: string;
  policyId: string;
  /** The run-state outcome the fold settled on — the whole result. */
  state: RunState;
  /** The full sequence, for anyone who wants to re-fold or read it. */
  inputs: readonly FoldInput[];
  /** `Driver.dispatchedIds()`, for the every-node-settles assertion (Q32). */
  dispatched: readonly string[];
  /** Per dispatched id, its effective outcome's terminal state, or `null` if it never settled. */
  settled: Record<string, string | null>;
  /**
   * Task ids the **scheduler** reported a settlement event for, counted at the
   * listener boundary and independent of anything the driver recorded.
   *
   * `settled` above is built by calling `driver.terminalStateOf`, so an assertion
   * over it is an assertion about the code it is checking
   * (`doc/workflow.md` section 5 rule 4). This is the second, independent source
   * `Q32` actually needs — *every dispatched task produced an outcome* is a claim
   * about the **scheduler**, not about our bookkeeping.
   */
  settledByScheduler: readonly string[];
  log: readonly LogRecord[];
  /** Observed, not asserted on. [Q19](../doc/open-questions.md) wants a number and this is not it. */
  wallMs: number;
  /**
   * **Which of the two ended the wait.** `'run-state'` means `isTerminal(state)`
   * became true at a quiescent point. `'backstop'` means the wall clock did —
   * a failure on every row but the one that declares `expectBackstop`, where a run
   * parked on a person genuinely cannot finish.
   *
   * This exists because W5's test-adequacy pass replaced the whole termination
   * mechanism with `setTimeout(1)` and **all 72 L6 assertions still passed**:
   * `await scheduler.shutdown()` drains the run while `onFoldInput` keeps
   * advancing `state`, so everything read afterwards is correct anyway. The
   * clock-free termination is the stated reason
   * [ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)
   * exists, `RN-R12` calls it *"what makes ladder L6 clock-free"*, and nothing was
   * testing it. Recording the winner of the race is what makes it testable.
   */
  finishedBy: 'run-state' | 'backstop';
  /**
   * `finishedBy === 'backstop'`, derived rather than tracked.
   *
   * It used to be a flag the backstop callback set, which made *"never set the
   * flag"* a surviving mutation: nothing else wrote it, so nothing could notice.
   * Deriving it from the winner of the race removes the second source of truth.
   */
  timedOut: boolean;
  /**
   * **Inputs that arrived AFTER the run was declared finished.** Any is a bug in
   * the declaration, not in the run: `RN-R12` says a terminal outcome means no
   * more input is coming, so one that comes anyway means the predicate was read
   * at a point that was not quiescent.
   *
   * This exists because W5's mutation sweep found that dropping the microtask
   * boundary below **survived every assertion** — the early resolve was masked by
   * `scheduler.shutdown()` taking long enough for the run to finish anyway. A
   * latent flake reported as a pass is the worst shape of green.
   */
  lateInputs: readonly string[];
  /**
   * **What the scheduler HELD when the run was over, and how many of those were the class's
   * own — W57, ADR 0048 rule 5's only observer at L6.** `FyflowScheduler.addTask` duck-types
   * its task: rule 8 probe `a3` swapped the driver's default `createTask` for `(config) => config`
   * and every row stayed green, because a plain object runs to `done` too. Counted from
   * `scheduler.tasks`, the scheduler's own map, never from the driver.
   */
  tasksHeld: number;
  fyflowTasksHeld: number;
  /**
   * **How many settlement events the SCHEDULER reported, and how many of their live task
   * objects carried a NUMERIC `attempts`.** The second thing a plain-object task lacks —
   * `FyflowTask` sets `attempts: 0` at construction — read at the listener off the scheduler's
   * own object, which is independent of `tasksHeld` (the scheduler's map) and of the driver's
   * log (whose listener normalises `attempts`, so a record could not see this).
   */
  settlementsSeen: number;
  /** **The wiring check over the RUNTIME's registry — decision 14's object, class types included — for this row's flow** (W73). Computed beside the run, never from it. */
  wiring: WiringReport;
  numericAttemptsSeen: number;
  /**
   * **The `attempts` each settled task carried on the scheduler's LIVE object, per task id —
   * W58, the retry row's SECOND observer.** The outcome record's `attempts` is the driver's
   * listener copying the same field (`OR-R2`), so a row that read only the record would be
   * reading one observer through a normaliser; this is read at the harness's own listener,
   * synchronously and never retained (`OR-R1`), and the row asserts the two AGREE. Where
   * `numericAttemptsSeen` above counts *is it a number*, this records *which number*.
   */
  attemptsSeen: Readonly<Record<string, number>>;
  /**
   * **The error string the scheduler's live task carried at settlement, per id — W63.** A task whose
   * declared `transform` failed is parked `user_action` with `TransformFailed`'s message as its
   * error (ADR 0051 rule 5); this is that message read off the live object at the harness's own
   * listener, the second observer beside the outcome record's `error` (`OR-R2`), so a driver that
   * normalised the message away would fail one and not the other.
   */
  errorsSeen: Readonly<Record<string, string>>;
  /**
   * **What `onNonconformingResult` reported, in order — W82, `OR-R13`,
   * [ADR 0060](../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md).**
   *
   * **`[]` on every row that does not ask for the check, and that is what makes this an assertion
   * about the DRIVER rather than about one row**: the check is OFF unless `RunOptions` supplies the
   * callback, whose presence IS the switch (ADR 0060 decision 4), so a driver that checked without
   * being asked would fail every other row at once.
   *
   * Copied field by field rather than retained, for `OR-R1`'s reason applied to our own surface —
   * the driver hands out a fresh literal here, and a harness that retains what a callback gave it
   * is the habit that produced ADR 0007. `findings` is copied as a fresh array of fresh pairs for
   * the same reason.
   */
  nonconforming: readonly { taskId: string; nodeId: string; type: string; worker: string; runId: string; findings: { path: string; says: string }[]; message: string }[];
  /**
   * **The OWN PROPERTY NAMES of each settled task's result on the SCHEDULER's live object, per task
   * id — W82, and it is the first of this row's three observers of one fact.**
   *
   * `OR-R2` clones what the scheduler settled with, and `OR-R11` says the clone carries a value's
   * own **enumerable** string-keyed data and nothing else. So on an INLINE pool this is what the
   * worker returned and `record.result`'s own keys are what the run CARRIES, and the two can
   * differ — which is the half of `OR-R13` no authoring-time tool can reach, because none of them
   * holds a record.
   *
   * Read synchronously off the live detail at this harness's own listener and never retained
   * (`OR-R1`); only the NAMES, which are strings. Recorded for every settled task on every row, so
   * the rows that do not declare it are the control: a driver whose clone started keeping
   * non-enumerable properties would move a value here on one row and nowhere else.
   */
  settledOwnKeys: Readonly<Record<string, string[]>>;
  /**
   * **What the scheduler said about a task's RESOURCES, in order, per task id — W58.** The
   * four `resource.*` events the scheduler emits on the task's behalf (`AGENTS.md` §6: blocked
   * on every push onto a blocked queue, unblocked on every exit, acquired immediately after
   * `onStart`, released immediately after `onFinish`) interleaved with its `task.running`, so a
   * row can assert not only that the task was blocked but that it was blocked BEFORE it ran.
   * Empty for a task that names no group and whose pool declares none — which is every task
   * before this item, and the negative control: with the passthrough reverted the gated task
   * has no entry here at all.
   */
  resourceEvents: Readonly<Record<string, readonly string[]>>;
  /**
   * **WHICH groups a task acquired, in order, per task id — W59.** `resourceEvents` above records
   * event NAMES; this records the `groupId` of every `resource.acquired` the scheduler emitted on
   * the task's behalf, so a row can assert that a typed task held the group its TYPE declares —
   * by id, not merely that some resource event happened. Empty for every task whose pool and
   * node declare no group, which is every task outside W58's and W59's rows.
   */
  heldGroups: Readonly<Record<string, readonly string[]>>;
  /**
   * The ids of the resource groups the scheduler holds, read from `scheduler.groups` at
   * construction — the same reading the driver's `groups` option is derived from, so a
   * cross-row clause can compare what the L6 flows NAME to what the scheduler DECLARES.
   */
  schedulerGroups: readonly string[];
  /**
   * The keys of `scheduler.workerPools`, read at construction — reported so a cross-row clause can
   * compare the pools the helper built for `NODE_TYPES` to the types the flows name, both ways, from
   * the scheduler rather than from a list beside it (W59; since W65 every pool is a type's, so the
   * two sets are equal).
   */
  schedulerPools: readonly string[];
  /**
   * **Which of a worker entry's four schemas the RUNTIME carries, per worker** — W67's adequacy
   * reader (a6). P18 decision 3 enumerates four (`configSchema`, `settingsSchema`, `inputSchema`,
   * `outputSchema`) and this plan ENFORCES two; the other two are *declared, carried and enforced by
   * nothing here* (P19). *Carried* was a claim with no observer — deleting both from the sample's two
   * worker entries cost ZERO — so a runtime that silently dropped what it does not enforce would
   * have looked exactly like one that carries it. Read off `runtime.registry.workers`, which is the
   * object the driver was handed.
   */
  workerSchemas: Readonly<Record<string, readonly string[]>>;
  /**
   * **What each created group object calls ITSELF, keyed as the document declared it** — W67's
   * adequacy reader (a1), BLOCKING.
   *
   * ADR 0049 fact 2: the scheduler resolves a group by the map KEY and the object's own `id` is
   * inert, and W59's reader found every fixture in the tree had the two EQUAL. The shim's custom
   * group type names its object `budget-by-object-name` on purpose — and nothing asserted that it
   * does, so the clause built to carry the claim rested on a string in a factory, and making the
   * two equal cost ZERO. *Whatever makes a discriminating pair differ is itself a claim* (v0.13),
   * in the fixture written to correct the item that found it.
   */
  groupObjectIds: Readonly<Record<string, string>>;
  /**
   * **The node types the DRIVER was handed, read off `runtime.registry` — W67.**
   *
   * `runtime.registry` is *exactly the object this runtime hands its own drivers* (P18 decision 14),
   * so this is the registry `FD-V32` was applied against. It is the document's `nodeTypes` UNION the
   * classes the `code` argument supplied — `GpuModel` is in the second half and in no document — and
   * that union is the thing a flow's `type` is checked against, which is why no clause here can be
   * written over the document alone.
   */
  registryTypes: readonly string[];
  /**
   * **What every pool the runtime BUILT was built with, read off the scheduler — W67, P18 fact 7.**
   *
   * A `WorkerManager` exposes `inline`, `maxThreads`, `idleTimeout`, `groups`, `residentGroups` and
   * `config` as own enumerable fields, in both runtimes, so an exit artifact can assert a pool was
   * built as DECLARED without reaching into anything private. It is what makes the sample's two
   * discriminating pairs assertable from the run rather than from a literal:
   *
   *   - **a node on its type's DEFAULT instance against one on a NAMED instance of the same type** —
   *     `GpuModel` against `prompt-big`, one thread against four and `{gpu:2}` against `{gpu:1}`,
   *     because the CLASS derivation computes both from `config.model`;
   *   - **a DOCUMENT type against a CLASS type over one worker** — `Prompt` against `GpuModel`,
   *     which name the same `prompt` worker and differ in nothing but their derivation.
   *
   * Read at construction, before any task runs, as `schedulerGroups` and `schedulerPools` are.
   */
  derivedPools: Readonly<Record<string, {
    /**
     * **The script the `WorkerManager` actually loads**, which is the package's ENVELOPE WORKER for
     * every pool since W65 — and it is here because it is the one field a derived `PoolSpec` cannot
     * carry. W67's adequacy reader (a10) re-sourced this whole map from the document declarations
     * and the `GpuModel` class for **0** failures: the identity derivation copies `inline` and the
     * class DECLARES it, so a harness-side recomputation said everything the built pool said, and
     * clause (iii)'s own stated reason — *which a derived PoolSpec cannot say and only the built
     * pool can* — was false of every field it read. This is the anchor.
     */
    scriptUrl: string;
    inline: boolean;
    maxThreads: number;
    idleTimeout: number;
    groups: readonly string[];
    /** `key` where the declaration gives no cost, `key:cost` where it does — see the field's note. */
    residentGroups: readonly string[];
    config: unknown;
  }>>;
  /**
   * **Which POOL each task the scheduler held actually ran on** — W67, and it is the other half of
   * the pair above. The driver dispatches a task whose `workerType` is `node.pool ?? node.type`
   * (v0.19), and the scheduler keeps it on the task, so this is the run's own account of which of
   * the two `GpuModel` instances a node was sent to. Read off `scheduler.tasks`, never off the
   * driver — `doc/workflow.md` section 5 rule 4.
   */
  poolOfTask: Readonly<Record<string, string>>;
  /**
   * **The languages each pool's config carries, by pool name, read off the built pools — W63,
   * ADR 0051 rule 4.** `[]` for every bare pool and for a typed pool none of whose nodes transform
   * in this run's flow; the adapter names for a typed pool some node does. `examples/l6.ts` compares
   * it, on every row, to what the row's DEFINITION declares — derived there independently of the
   * helper — both ways.
   */
  poolLanguages: Readonly<Record<string, readonly string[]>>;
  /** How many times `holdGroup`'s slot was released by this harness. `0` when nothing was held. */
  heldGroupReleases: number;
  /**
   * Whether the two fan-out branches were ever in flight at the same time.
   * Symmetric, so it depends on no completion order — which nothing may
   * (`doc/concept.md` section 5).
   */
  branchesOverlapped: boolean;
  /**
   * Every distinct run-state outcome the incremental fold passed through, in
   * first-seen order. **W6's, and it is how a transient outcome is asserted at
   * all**: `awaiting_action` is real and durable — a branch is parked on a person
   * — but a run that is later resolved ends `completed`, so the final state does
   * not record that it ever happened.
   *
   * **Sampled at quiescent points only**, in the termination microtask, which is
   * what makes an *exclusion* sound as well as an inclusion. The first version
   * sampled every element and therefore contained the mid-turn artefacts
   * `spec/run-state.md` section 3 enumerates — a transient `completed` and a
   * transient `stuck` on runs that were neither. Found by W6's conformity reader,
   * and it was the second occurrence of the failure mode that produced section 3's
   * quiescence block.
   */
  outcomesSeen: readonly RunOutcome[];
  /** Task ids resolved by the inbound step, in the order it resolved them. */
  resolved: readonly string[];
  /**
   * **Where the DRIVER said each branch parked**, keyed by branch path — W23's
   * adequacy reader, BLOCKING.
   *
   * The inbound step below reads `input.event.at` to know which node to resolve.
   * Substituting the ROW's own declared node for it — `how.at ?? input.event.at`,
   * a source swap and nothing else — cost **0 failures**, and with it in place
   * `branch.suspended`'s `at` was asserted by nothing at L6: a driver emitting
   * `at: 'WRONG'` went from **5** failures to **0**. That is W19's blocking
   * finding — *an assertion whose SOURCE could be swapped, forbidden in prose and
   * enforced by nothing* — in a field W23 itself created.
   *
   * Recorded so a row can compare what the DRIVER said against what the ROW
   * declared. Two sources, not one.
   */
  suspendedAt: Readonly<Record<string, string>>;
  /**
   * Anything **`onRunFailure`** reported, as text.
   *
   * **`onUnsatisfiableJoin` used to be flattened into this array too, and W17
   * separated them.** That was harmless while no shipped policy could return
   * `unsatisfiable` — the array was empty on every row either way — and it stopped
   * being harmless the moment one could: `spec/join-policy.md` section 4 gives the
   * two callbacks different jobs. A refusal **stops the run** and `RN-R8` makes it
   * `stopped` whatever its nodes say; an unsatisfiable join stops nothing, invents
   * no run-level outcome, and leaves the fold to reach `stuck` on its own
   * (`RN-R10`). Reporting them through one channel of strings would have made
   * *"nothing was reported"* unassertable on the one row where something is.
   */
  failures: readonly string[];
  /**
   * **What `onUnsatisfiableJoin` reported, whole — W17.**
   *
   * `spec/join-policy.md` section 4: on `unsatisfiable` the driver *"reports it
   * with the policy's own `describe`, and routes nowhere"*. The `describe` is the
   * half that says **why** the join can never fire, and it is the half a string
   * summary threw away — so a row could assert that something was reported and
   * not that the policy's account of it reached the caller.
   *
   * Structural rather than counted: an empty array on every row but one is a
   * stronger claim than a zero, and it is checked on **every** row.
   */
  unsatisfiableJoins: readonly UnsatisfiableJoin[];
  /**
   * The `kind` of each reported failure, kept separate from its message.
   *
   * `RunFailure.kind` was pinned by no test anywhere: row 12's assertion read
   * `${kind}: ${message}` for a substring, and `UncloneableResult`'s message
   * begins with its own class name, so forcing `kind` to `'Error'` was green at
   * L6 **and** at L1-L5. Found by W6's adequacy reader.
   */
  failureKinds: readonly string[];
  /**
   * **What `onUnmintedTask` reported, whole — W19, and it is `ID-R5`'s only
   * outbound evidence.**
   *
   * [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
   * rule 3: a settlement whose task id no driver minted is dropped and **reported
   * on its own channel**, carrying this driver's `runId`, the scheduler event's
   * name, `detail.id` uncoerced, and `parseTaskId`'s own message. Rule 4 makes the
   * empty case load-bearing rather than decorative: a settlement carrying
   * *another run's* parseable id must NOT arrive here, so `[]` on the pair row
   * that injects nothing is an assertion about `ID-R4` tier 1 as much as about
   * this channel.
   *
   * Kept whole and separate from `failures` for the reason `unsatisfiableJoins`
   * is: the run has **not** failed, so folding it into a channel whose contract is
   * *"the driver has stopped routing"* would make *"nothing was reported"*
   * unassertable on the one row where something is.
   *
   * Copied field by field rather than retained — `OR-R1`'s habit applied to our
   * own surface.
   */
  unmintedTasks: readonly UnmintedTask[];
  /** W55 — see `Retention`. Measured on every run; asserted by the RELATION, never by the bytes. */
  retention: Retention;
  /**
   * **The `Driver` itself, and only when the caller asked for it** —
   * `RunOptions.keepDriver`.
   *
   * `examples/retention.ts`'s scale mode holds N completed drivers and measures
   * `heapUsed` after a forced `gc()`, and a driver nobody references is collected
   * before that observer can see it. Every other caller leaves it `undefined`, so
   * ladder L6 keeps forty-four drivers reachable for exactly as long as it did before
   * this field existed.
   */
  driver?: Driver;
  /** `FD-R4` at START, where the row declared `refuseAtStart`: what was thrown, and how many tasks the scheduler held at that moment (W73). */
  startRefusal?: { name: string; boundary: string; nodeId: string; message: string; dispatchedThen: number };
  /** `FD-R4` at RESOLVE: the task ids whose `refusedFirst` value was refused, in the order the inbound step tried them (W73). */
  refusedResolutions: readonly string[];
  /** And what each refusal threw, keyed by task id. */
  refusedResolutionErrors: Readonly<Record<string, { name: string; message: string }>>;
}

export interface RunOptions {
  definition: FlowDefinition;
  /**
   * **Omitted, the RUNTIME's default — `live-token`, P18 decision 10.** Every row names one, because
   * a row is about a policy; the one caller that omits both this and `runId` is the shim run, which
   * makes P18's sample's own call — `runtime.start(flow, payload)` with no options at all.
   */
  policy?: JoinPolicy;
  /**
   * **Omitted, the RUNTIME MINTS one** — `r<n>` from its own counter (decision 10), which is the
   * half of that decision no row could observe: every row names the ids it expects, so it must name
   * the run. W67's adequacy reader (a15), BLOCKING — both defaults could be replaced by a throw for
   * **0** failures, on the item that was the last chance to observe them.
   */
  runId?: string;
  payload: unknown;
  predicates?: ReadonlyMap<string, Predicate>;
  /**
   * **Every type's `delayMs` OVERRIDDEN, and only `examples/retention.ts` passes it.** Omitted — which
   * is what every L6 row does — each type's delay is the DOCUMENT's, including the four-times one a
   * settling-last worker is given. See `registryDocumentFor`.
   */
  delayMs?: number;
  /**
   * **Threads rather than the main event loop for the threadable pools.**
   *
   * *(`delayMs` used to be the value every caller passed as `5` and this file turned into a
   * `SETTLES_LAST` four-times rule; both are the DOCUMENT's now — W67 — and the option above is a
   * bare override one off-gate measurement uses. `threaded` survives as a row knob because `inline`
   * is fixed per TYPE and has no per-run document spelling — see `registryDocumentFor`.)*
   */
  threaded?: boolean;
  /** Backstop only. Reaching it fails the run; it never decides that a run finished. */
  backstopMs?: number;
  /**
   * **The inbound step — W6, and the one piece of design P2 named before it was
   * hit.** Keyed by branch path: when that branch suspends, resolve it this way.
   *
   * A suspended run **never finishes**, because `RN-R12` makes `awaiting_action`
   * explicitly non-terminal — correctly, since a run waiting on a person is not
   * over. So without this a row that suspends waits for its backstop and reports
   * a failure. This is the human, and `Driver.resolve()` is the only inbound API
   * the library has (ADR 0004 rule 5).
   *
   * **Driven by the sequence, not by a clock**, exactly as termination is: it
   * fires on the `branch.suspended` element rather than after an interval.
   *
   * **Deferred to a microtask, and the reason is not the one first written here.**
   * The original claim — that a re-entrant `resolve()` would interleave the
   * sequence with itself — is false: `Driver.append` pushes before it notifies, so
   * a re-entrant append lands after the current element rather than inside it. The
   * real reason is sharper: resolving inside the driver's own turn means the run is
   * **never quiescently `awaiting_action`**, which is the state the row exists to
   * demonstrate. A human who answers within the same synchronous turn is not a
   * human. W6's adequacy reader found the false claim; the row now fails without
   * the deferral.
   */
  resolveOnSuspend?: Record<string, { as: 'done' | 'failed'; result?: unknown; actor: string;
    /**
     * **A value the person tries FIRST, which `FD-R4` must REFUSE** — W73. The harness calls `resolve()` with
     * it, expects a `BoundaryRefused` thrown at the caller with the task still suspended, records it in
     * `RunReport.refusedResolutions`, and only then resolves with `result`. A row that declares it and is not
     * refused is red: the refusal is the claim.
     */
    refusedFirst?: unknown }>;
  /**
   * **A RUNTIME to share, rather than one of this run's own — W14, and a runtime since W67.**
   *
   * [ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
   * makes *two drivers on one scheduler* a supported topology, and P4's exit
   * artifact is that topology on **real workers**. Passing a scheduler in is the
   * whole of what W14 needed from this file: two runs then differ from two
   * sequential runs in exactly one respect, which is the respect under test.
   *
   * **The caller that supplies it owns its lifetime** — `runFlow` will not `shutdown()` a runtime
   * it did not build, because the other run is still using it. `runPair` below is that caller.
   *
   * *(It was a `FyflowScheduler` until W67. A runtime owns its pools, its groups and its scheduler,
   * so sharing the scheduler alone shares half of what a run needs — and `runtime.start` is what
   * makes a driver now, so a shared scheduler with no runtime could not start a second run at all.)*
   *
   * What this shares, and it is worth knowing before reading a report: the
   * `task.running`/`completed`/`failed` listeners this function registers see
   * **both** runs, so `branchesOverlapped` and `settledByScheduler` are
   * scheduler-wide rather than run-wide when a scheduler is shared. Everything
   * else in a `RunReport` comes from that run's own driver.
   */
  runtime?: Runtime;
  /**
   * **Hand the `Driver` back in the report — W55, and only the scale measurement
   * asks for it.** See `RunReport.driver`: an observer that reads `heapUsed` after a
   * forced `gc()` cannot see what nothing references.
   */
  keepDriver?: boolean;
  /**
   * **A resource group this HARNESS holds when the run starts, and releases once the
   * scheduler reports a task blocked behind it — W58's group row.** The group is a
   * `ConcurrentLimitGroup(1)` `buildScheduler` registers; the harness takes its one slot with
   * the group's own `onStart()` before `driver.start`, so a task whose node declares it in
   * `workerGroups` is `resource.blocked` on dispatch. The release is driven by that event and
   * not by a clock: on the first `resource.blocked` naming this group the slot is given back
   * on a microtask, and the scheduler's own heartbeat re-dispatches the task. No foreign task
   * is involved, so `onUnmintedTask` stays empty and the row is about the group alone.
   */
  holdGroup?: string;
  /**
   * **A payload tried FIRST, which `FD-R4` must REFUSE at `start()`** — W73. The harness starts a run with it
   * through the runtime (the runtime MINTS that attempt's id, so the refused, unstarted driver and the
   * row's real run never share one), expects a `BoundaryRefused` thrown at the caller, records it in
   * `RunReport.startRefusal` with how many tasks the scheduler held at that moment, and then starts the row's
   * run with `payload`. A row that declares it and is not refused is red.
   */
  refuseAtStart?: unknown;
  /**
   * **Turn `OR-R13`'s result check ON for this run — W82, and supplying it IS the switch.**
   *
   * [ADR 0060](../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md)
   * decision 4: there is no boolean beside the callback, so this option is forwarded into
   * `StartOptions` **only when the caller asks for it** and its absence is what leaves the check
   * off. That is why this is a `true` rather than a callback — the harness owns the channel, because
   * `RunReport.nonconforming` is what a row asserts, and a row supplying its own would be a second
   * source.
   *
   * **Every row that omits it asserts `nonconforming: []`**, which is what makes the switch's OFF
   * position an assertion about the driver rather than a fact about one row.
   */
  checkResults?: true;
}

/**
 * **A task this library did not mint, put onto the shared scheduler — W19.**
 *
 * The whole of what [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
 * is about, and the thing no fixture can establish: the `id` is passed to the
 * scheduler **verbatim**, so it is whatever the caller says rather than anything
 * `spec/task-id.md` section 1's grammar would produce. A real
 * `FyflowScheduler` queues it, dispatches it to a real worker and settles it, and
 * its settlement reaches every `Driver` subscribed to that scheduler.
 *
 * **`workerType` must be a pool `buildScheduler` registers**, because `addTask`
 * throws on an unknown one — which is itself the first thing a fake cannot tell
 * you, and is why W19's declaration measured it before the row was written.
 */
export interface ForeignTask {
  /**
   * Verbatim, and deliberately not built by `buildTaskId`. An id that parsed
   * would be `ID-R4`'s question, not `ID-R5`'s.
   */
  id: string;
  /** A key in `buildScheduler`'s pools — since W65 the name of a TYPE, because every pool is one type's default instance. The field keeps the scheduler's own name for it. */
  workerType: string;
  /** What the task's worker receives as its `input`. Since W65 every pool is fronted by the envelope worker, so `runPair` wraps this as `{ settings: {}, input }` — a raw payload on a typed pool is refused by the wrapper (`NotAnEnvelope`) and would settle `user_action` instead of `done`. */
  payload?: unknown;
  /**
   * **Passed through to the scheduler, and it is what `task.failed` needs** —
   * [Q107](../doc/open-questions.md), taken by
   * [W23](../doc/work-items/w23-a-nested-flow-on-real-workers.md).
   *
   * `ID-R5` at L6 had only ever been reached from `task.completed`, because every
   * foreign task W19 injected ran a worker that returns. Only an **optional** task
   * can settle `failed` (`core/FyflowScheduler.ts:894-897`), so a foreign task
   * that throws needs this flag or it ends `user_action` instead — which is a
   * third event name and a different question again.
   */
  optional?: boolean;
}

/**
 * **Two runs, two `Driver`s, ONE scheduler, on real workers — P4's exit artifact.**
 *
 * The pairing [Q72](../doc/open-questions.md) named and
 * [ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
 * closed. Before W13 this corrupted both runs **silently**: each driver received
 * the other's settlements, `run-a:publish:-:0` was dispatched twice under two
 * outcomes — `spec/task-id.md` section 2's collision — and `ID-R1` could not fire,
 * because each driver keeps its own dispatched-id set.
 *
 * The two runs are started **concurrently against one scheduler**, which is the
 * only difference from running them one after another, and is exactly the
 * difference under test. Each awaits its own clock-free termination; the shared
 * scheduler is shut down once, after both.
 */
export async function runPair(
  a: RunOptions,
  b: RunOptions,
  foreign: readonly ForeignTask[] = [],
): Promise<{ a: RunReport; b: RunReport; facts: PairFacts }> {
  // One scheduler means one set of pools, so the two runs cannot ask for
  // different worker timings. Refused rather than silently taking `a`'s, which is
  // what this did until W14's conformity reader pointed out that `b`'s were dead.
  if ((a.threaded === true) !== (b.threaded === true)) {
    throw new Error('runPair: both runs share one runtime, so `threaded` must match');
  }
  const runtime = buildRuntime(a.threaded === true, [a.definition, b.definition], a.predicates ?? PREDICATES);
  const scheduler = runtime.scheduler;

  // **Everything below is read from the SCHEDULER, before either driver exists.**
  // `doc/workflow.md` section 5 rule 4 — a fixture must not come from the code
  // under test — and W14's adequacy reader found the row breaking it: every
  // disjointness assertion read `driver.dispatchedIds()` and `driver.snapshot()`,
  // so deleting the `ID-R4` guard *and* filtering those two accessors by run id
  // left the row **green at 233/0** while `addTask` was called 55 times for 50
  // distinct ids — Q72's corruption in full, on the real scheduler, reported by
  // nothing. The harness already avoids this for `settled`, via
  // `settledByScheduler`; it did not for disjointness.
  const settlementIds: string[] = [];
  const listenersAtSettlement: number[] = [];
  const record = (e: { detail: unknown }) => {
    const id = (e.detail as { id?: string })?.id;
    // Read synchronously from the live detail and never retained (`OR-R1`); only
    // the id, which is a string. Pushed rather than added to a Set, **and that is
    // the point**: a Set makes "no id settled twice" a tautology, which is what
    // the same reader found assertion 14 asserting.
    //
    // **`record` is registered BEFORE either driver**, so for any settlement event
    // it runs first — which makes the number pushed beside each id the count of
    // listeners attached when that settlement was delivered. That is the boundary
    // that matters: a driver attached later would never have seen it.
    //
    // **One push per settlement, and the first-settlement count is READ OFF the
    // array rather than latched into a field — W19's adequacy reader.** It was
    // `if (settlementIds.length === 0) listenersAtFirstSettlement = listenersTotal;`,
    // and deleting that guard so the field is overwritten by every settlement left
    // all 370 assertions green: `listenersAtFirstSettlement === listenersTotal`
    // became a tautology, and with it the whole *"both drivers were attached when
    // the foreign settlement arrived"* half of the hostile-ordering claim, which
    // this harness leans on in as many words. **Third occurrence of one shape**:
    // `timedOut` and `lateInputs` were both a second source of truth beside the
    // thing that produced them, and both were fixed by deriving rather than
    // tracking. This is that fix a third time, and the two arrays being the same
    // length is what makes "record only the last one" fail as well.
    if (typeof id === 'string') {
      settlementIds.push(id);
      listenersAtSettlement.push(listenersTotal);
    }
  };
  scheduler.addEventListener('task.completed', record);
  scheduler.addEventListener('task.failed', record);

  let listenersTotal = 2;
  let addTaskCalls = 0;
  let shutdownCalls = 0;
  const realAdd = scheduler.addEventListener.bind(scheduler);
  const realAddTask = scheduler.addTask.bind(scheduler);
  const realShutdown = scheduler.shutdown.bind(scheduler);
  (scheduler as unknown as { addEventListener: unknown }).addEventListener =
    (type: string, fn: (e: { detail: unknown }) => void) => { listenersTotal++; return realAdd(type, fn); };
  (scheduler as unknown as { addTask: unknown }).addTask = (task: unknown, o?: unknown) => {
    addTaskCalls++;
    return realAddTask(task as never, o as never);
  };
  (scheduler as unknown as { shutdown: unknown }).shutdown = () => { shutdownCalls++; return realShutdown(); };

  // **The foreign tasks — W19, and where they go in this function is the whole
  // arrangement.**
  //
  // *After* the instrumentation, so `addTaskCalls` counts them and stays a fact
  // about the scheduler rather than about the harness; *before* `Promise.all`, so
  // they are queued ahead of everything either run dispatches.
  //
  // **The settlement must land while both runs are LIVE, and this is what makes
  // that structural rather than hoped for.** `runFlow` is synchronous up to its
  // first `await`, so both drivers attach their listeners before any timer fires,
  // and the worker's own `delayMs` means nothing can settle inside this turn.
  // **NOT all on one pool since [Q107](../doc/open-questions.md)**, and the
  // sentence this replaces was true of five of the six. It read: *"The pool these
  // go to is `IngestWorker` — `maxThreads: 1`, `inline` — so a task queued first
  // is dispatched first and settles first, and the ordering is produced by queue
  // discipline rather than by a delay comparison."*
  //
  // The five that run `IngestWorker` still serialize on one inline slot, and that
  // part is queue discipline. `weekly-report` runs `ReviewWorker` so that a
  // foreign settlement reaches `ID-R5` under `task.failed` rather than
  // `task.completed`, and **its ordering against the runs is a delay comparison
  // across two pools** — ~20 ms against each run's `ingest` at ~30 ms. The claim
  // the assertions make is unchanged; the mechanism behind one of the six is not,
  // and W23's conformity reader found this sentence still describing the old one.
  //
  // **Both halves are asserted rather than trusted**, which is W17's lesson about
  // `SETTLES_LAST`: `PairFacts.settlementIds[0]` says the foreign settlement came
  // first, and `listenersAtFirstSettlement === listenersTotal` says both drivers
  // were attached when it was delivered. `doc/workflow.md` section 5 rule 5 —
  // this ARRANGES an order and then checks the effect; nothing depends on an
  // order the spec does not fix.
  for (const f of foreign) {
    scheduler.addTask(new FyflowTask({
      id: f.id,
      workerType: f.workerType,
      // Wrapped since W65 (ADR 0054): the pool is a TYPE's and its worker receives the envelope
      // (`FD-C5`); the id is what this row is about and the payload shape is not.
      payload: { settings: {}, input: f.payload ?? null },
      // Q107: `optional` is what decides whether a throwing worker settles
      // `failed` or ends `user_action`, and the driver keys on terminal state
      // rather than on event name (ADR 0007 rule 2) — so this is how a foreign
      // settlement reaches `ID-R5` down a road that is not `task.completed`.
      optional: f.optional ?? false,
    }));
  }

  try {
    const [ra, rb] = await Promise.all([
      runFlow({ ...a, runtime }),
      runFlow({ ...b, runtime }),
    ]);
    return {
      a: ra,
      b: rb,
      facts: { settlementIds, listenersAtSettlement, listenersTotal, addTaskCalls, shutdownCalls: shutdownCalls + 1 },
    };
  } finally {
    // Once, after both — and in a `finally`, because a row that fails must not
    // also leave the process alive (`AGENTS.md` §2). Counted above as `+ 1`
    // because the report is built before this runs.
    await scheduler.shutdown();
  }
}

/**
 * What the **scheduler** saw, independent of anything either driver recorded.
 *
 * Every field here exists because W14's readers found the row's own claims
 * resting on the driver it is checking, or on an interleaving `spec/` does not
 * fix. These are timing-free: they are counts of structure, not of order.
 */
export interface PairFacts {
  /**
   * Every settlement event id the scheduler dispatched, **in order and with
   * duplicates kept**. `spec/task-id.md` section 2 point 3: two `task.completed`
   * under one id is what a real 0.3.0 collision produces, and a `Set` here would
   * discard exactly the evidence.
   */
  settlementIds: readonly string[];
  /**
   * How many listeners were registered when **each** settlement was delivered, in
   * the same order and at the same length as `settlementIds`, and the total.
   *
   * `[0] === listenersTotal` iff both runs were attached before **anything**
   * settled — which is what makes "two drivers on one scheduler" structural rather
   * than a hope about timing, because a driver attached later would never see that
   * settlement.
   *
   * **An array rather than a latched first-settlement field, since W19.** The
   * field's `if (settlementIds.length === 0)` guard was deletable with all 370
   * assertions green, which turned the claim into a tautology. Read off `[0]`
   * instead, with the two arrays' equal length asserted, and there is nothing to
   * latch and nothing a later settlement can overwrite.
   *
   * **Not the first *dispatch*:** `runFlow` is synchronous up to its first
   * `await`, so run `a` has already called `addTask` before run `b` is
   * constructed. Measured — 8 of 14 — which is why this reads settlements.
   * A sequential `runPair` leaves `[0]` strictly less than the total; a run given
   * its own scheduler leaves `addTaskCalls` at zero on this one.
   *
   * **And it proves ATTACHMENT, not that either run had `start()`ed** — a `Driver`
   * registers its listeners in its constructor (ADR 0022). That is the property
   * `ID-R5` needs and it is what the row's prose now says. W19's conformity reader.
   */
  listenersAtSettlement: readonly number[];
  listenersTotal: number;
  addTaskCalls: number;
  /** `runFlow` must not shut down a scheduler it did not build; this is one. */
  shutdownCalls: number;
}

/**
 * The pools and the scheduler, in one place so `runFlow` and `runPair` cannot
 * drift apart about what a worker does. W14 extracted it unchanged.
 */
// --- W55: the retention observer ------------------------------------------------

/**
 * **The ONE reach into the driver's private state, named once** — W55, and it is
 * `test/driver/retention.test.ts`'s reach at ladder L6.
 *
 * [Q233](../doc/open-questions.md) is the record of why it has to be a reach:
 * [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
 * rule 1 is a statement about what a run HOLDS and **no public surface can observe
 * it** — `snapshot()` and `foldInputs()` both return the log, and the region
 * collections `RN-R13`'s second term is about are reachable from neither, which is
 * that rule's own point. W53 measured both alternatives and refused both: a public
 * accessor enlarges the surface for a test's convenience ([Q53](../doc/open-questions.md)
 * — *a redundant surface is read as a permissive one*), and a byte measurement needs
 * `v8.serialize`, which exists in two of the five runtimes.
 *
 * **The shape is the field's own declaration**, and since
 * [W84](../doc/work-items/w84-what-a-regions-identity-is.md) that is THREE levels:
 * `Map<fanoutId, Map<openerPath, Map<branchPath, payload>>>`, because a `map` can
 * enter one opener N times and a collection belongs to the region INSTANCE
 * ([ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)).
 *
 * **`arrivalsOf` flattens the middle level away, and that is LOSSLESS rather than a
 * convenience.** Every branch path inside an instance begins with that instance's
 * own path, so two instances of one opener hold DISJOINT branch-path key sets —
 * which the merge asserts rather than assumes. What this file reports is per-region
 * and every flow it runs has one instance per opener, so the merge changes no
 * number here and keeps working when one does not.
 *
 * *This cast is why this file was not named by any typechecker when the shape moved:
 * a reach that restates the shape it reaches into compiles against its own
 * restatement. It surfaced as a wrong COUNT at L6 instead.*
 */
const rawArrivalsOf = (d: Driver): Map<string, Map<string, Map<string, unknown>>> =>
  (d as unknown as { arrivals: Map<string, Map<string, Map<string, unknown>>> }).arrivals;

const arrivalsOf = (d: Driver): Map<string, Map<string, unknown>> => {
  const out = new Map<string, Map<string, unknown>>();
  for (const [fanoutId, byPath] of rawArrivalsOf(d)) {
    const merged = new Map<string, unknown>();
    for (const [, held] of byPath) {
      for (const [branchPath, payload] of held) {
        // **No live case, and the number is 0 / 0** — W84's adequacy reader, finding 9:
        // `if (false)` here costs zero at both L6 rungs, because no flow this file runs
        // has two instances of one opener. It is a construction rather than a guard —
        // the merge below is only lossless while the key sets are disjoint, and this is
        // the sentence that says so executing rather than sitting in the comment above.
        // **W86 adds the first flow with two instances** and is where it acquires a case.
        if (merged.has(branchPath)) {
          throw new Error(
            `two instances of region "${fanoutId}" both hold branch path "${branchPath}" — ` +
            'a branch path inside an instance begins with that instance`s own path, so this ' +
            'merge is only lossless while they are disjoint (W84)',
          );
        }
        merged.set(branchPath, payload);
      }
    }
    out.set(fanoutId, merged);
  }
  return out;
};

/** The `result` object of every settled record in the driver's own log, **by reference**. */
const loggedResults = (d: Driver): unknown[] =>
  (d as unknown as { log: { result?: unknown }[] }).log
    .filter((r) => r && typeof r === 'object' && 'result' in r).map((r) => r.result);

/**
 * **What the walk below does NOT look in, and why each is excluded** — the same
 * three `test/driver/retention.test.ts` excludes, for the same reason. `graph`,
 * `opts` and `def` are the DEFINITION and the caller's own options: neither grows
 * with the run, which is `RN-R13`'s subject. **The list is stated rather than
 * implied**, because a byte figure whose universe is unwritten is a figure nobody
 * can re-take — and it is the same universe `dev-dist/p15/scale.ts` used, so this
 * rung's number and P15 fact 5's table are the same measurement at two scales.
 */
// `languages` since W61: the registry's languages — consumer configuration holding a compile FUNCTION
// and a worker URL, no result; the same reading as `nodeTypes` (a late exception: the driver gained a
// field and this walk enumerates every driver field both ways).
// `nodeTypes` since W59: the registry's node types — consumer configuration holding validator
// FUNCTIONS, which `v8.serialize` refuses and which hold no result. The same reading as `opts`.
// `workers` since W73: the registry's worker entries, read at FD-R4's two boundaries — declarations, no result.
const NOT_RUN_STATE = ['def', 'graph', 'languages', 'nodeTypes', 'opts', 'workers'];

/** The two halves of `NOT_RUN_STATE`'s claim, for the clause in `examples/l6.ts` that binds it. */
const walkOf = (d: Driver): { walked: string[]; skipped: string[] } => {
  const keys = Object.keys(d as unknown as Record<string, unknown>);
  return {
    walked: keys.filter((k) => !NOT_RUN_STATE.includes(k)).sort(),
    skipped: keys.filter((k) => NOT_RUN_STATE.includes(k)).sort(),
  };
};

/**
 * **`v8.serialize`, loaded once and never assumed.** It is in **two** of the five
 * runtimes — node and deno, through `node:v8`, and in none of the three browsers
 * ([Q233](../doc/open-questions.md), corrected there from *one*). Ladder L6 runs in
 * exactly those two, so it is available at both L6 rungs and at neither browser one.
 */
let serializeFn: ((v: unknown) => { length: number }) | null | undefined;
async function serializer(): Promise<((v: unknown) => { length: number }) | null> {
  if (serializeFn !== undefined) return serializeFn;
  try {
    serializeFn = (await import('node:v8')).serialize as unknown as (v: unknown) => { length: number };
  } catch {
    serializeFn = null;
  }
  return serializeFn;
}

/**
 * **What a run RETAINS, in bytes, in ONE serialize call** — so an object reachable
 * twice is counted once, which is the whole reason it is one call and not a sum.
 *
 * `extra` is what the caller wants counted **beside** the driver's own structures:
 * `runFlow` passes the collection as it stood at its peak, which reconstructs the
 * pre-ADR-0046 shape. A `Map` and a `Set` are spread first, matching P15's own
 * method exactly; a function (`now`) and the primitives are skipped, because the
 * serializer refuses the first and the second are not results.
 *
 * Returns `null` where there is no serializer and **`-1`** where it refused the
 * graph — two different facts, and collapsing them would make *this runtime cannot
 * measure* indistinguishable from *this run holds something uncloneable*.
 */
export async function retainedBytes(d: Driver, extra: readonly unknown[] = []): Promise<number | null> {
  const ser = await serializer();
  if (!ser) return null;
  const o = d as unknown as Record<string, unknown>;
  const parts: unknown[] = [];
  // **The key list comes from `walkOf` and from nowhere else** — W55's adequacy
  // reader, BLOCKING. It used to consult `NOT_RUN_STATE` itself, so `walkOf` and
  // this function were **two expressions over one literal** and only `walkOf`'s
  // output reached an assertion: measured, a second `continue` inside this loop
  // dropping `arrivals`, `inputs` and `log` cost **ZERO** at both L6 rungs while the
  // artifact's *held at end* went 777.5 KiB to 0.6 KiB. Adding `'arrivals'` to the
  // literal was caught and skipping it here was not. **One expression, so the list
  // `examples/l6.ts` asserts IS the list this measures.**
  for (const k of walkOf(d).walked) {
    const v = o[k];
    if (Array.isArray(v)) parts.push(v);
    else if (v instanceof Map) parts.push([...v]);
    else if (v instanceof Set) parts.push([...v]);
    else if (v && typeof v === 'object') parts.push(v);
  }
  for (const x of extra) parts.push(x);
  try {
    return ser(parts).length;
  } catch {
    return -1;
  }
}

/**
 * **What `examples/retention.ts` REFUSES to report, and it lives here so that ladder
 * L6 can bind it** — W55's adequacy reader, BLOCKING.
 *
 * That file is a reporter: everything else in it is a `console.log`, so it exited
 * **0** whatever it measured until this predicate existed — and then the predicate
 * itself was deletable for zero, because nothing at L6 or in the gate runs that file.
 * *A command that cannot fail is not evidence that anything held.* Declared here and
 * given a positive case in `examples/l6.ts`, which is the shape W47 settled for a
 * detector whose tree is clean: **a sensor with no case that makes it fire is bound
 * to nothing.**
 *
 * **It asserts the RELATION and never the bytes** — this item's own `Tests:` line, and
 * [Q179](../doc/open-questions.md) is why. On a run that COMPLETED,
 * [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
 * rule 3 says the collection is gone and `JP-R12` says one entry was recorded per
 * branch that arrived. The two BYTE clauses are relations too: a serializer this rung
 * is required to have (`node:v8`, in both L6 runtimes) must have produced a number,
 * and the reconstruction must exceed the end — which is what makes *the collection it
 * released* a measurement rather than a subtraction of a value from itself.
 */
export function violations(r: RunReport, arity: number): string[] {
  const bad: string[] = [];
  if (r.state.outcome !== 'completed') bad.push(`outcome ${r.state.outcome}, not completed`);
  if (r.retention.peakEntries !== arity) {
    bad.push(`JP-R12: recorded ${r.retention.peakEntries} arrivals, not ${arity}`);
  }
  if (r.retention.endEntries !== 0) {
    bad.push(`ADR 0046 rule 3: still holding ${r.retention.endEntries} after the join became terminal`);
  }
  if (r.retention.peakAliasingLog !== 0 || r.retention.loggedResults === 0) {
    bad.push(
      `JP-R12: ${r.retention.peakAliasingLog} held values ARE a log record's own result, ` +
        `against ${r.retention.loggedResults} logged`,
    );
  }
  // **The byte columns are RELATIONS here too, and the adequacy reader is why.** Three
  // separate edits turned the measurement off with every assertion green: making the
  // serializer unavailable (every column `n/a`), skipping keys inside the walk (777.5
  // KiB to 0.6), and dropping the `extra` list (the collection column to 0.0). None is
  // a claim about a NUMBER — they are *this rung has a serializer*, *it measured
  // something*, and *the reconstruction is larger than the end* — so `Q179` is
  // untouched and a measurement that stopped measuring fails.
  if (r.retention.bytesAtEnd === null) bad.push('no serializer: both L6 runtimes have node:v8');
  else if (r.retention.bytesAtEnd <= 0) bad.push(`bytesAtEnd ${r.retention.bytesAtEnd}`);
  if (arity > 0 && (r.retention.bytesBeforeRelease ?? 0) <= (r.retention.bytesAtEnd ?? 0)) {
    bad.push('the reconstruction is not larger than the end, so nothing was released');
  }
  // **What the run holds is at least what it released, and that is STRUCTURAL rather
  // than a figure** — W55's adequacy reader, whose edit put a second `continue` inside
  // the walk and dropped `inputs`, `log` and `arrivals` for **zero**, taking the byte
  // column from 777.5 KiB to 0.6 while every other relation here still held.
  //
  // `inputs` holds every settled result once (`RN-R13`'s first term) and a region's
  // collection is one entry per branch that ARRIVED — a subset of those same results.
  // So a measurement that still counts `inputs` cannot come out smaller than the
  // collection it is measuring the release of. A walk that stopped walking does.
  const released = (r.retention.bytesBeforeRelease ?? 0) - (r.retention.bytesAtEnd ?? 0);
  if (arity > 0 && (r.retention.bytesAtEnd ?? 0) < released) {
    bad.push(
      `the run holds ${r.retention.bytesAtEnd} B and released ${released} B — the collection is a ` +
        'SUBSET of what `inputs` holds, so the walk is not counting what it says it counts',
    );
  }
  if (r.retention.snapshotEntries !== r.retention.peakEntries) {
    bad.push(
      `the peak snapshot holds ${r.retention.snapshotEntries} values for ${r.retention.peakEntries} ` +
        'recorded arrivals, so the reconstruction is a subtraction over the wrong set',
    );
  }
  return bad;
}


export async function runFlow(opts: RunOptions): Promise<RunReport> {
  const { definition, policy, payload } = opts;
  const backstopMs = opts.backstopMs ?? 10_000;

  // **ONE call, from a DOCUMENT — W67.** Everything below reads the runtime's scheduler exactly as
  // it read a hand-built one; what changed is that nothing here builds a pool, a group or a driver.
  const runtime = opts.runtime ?? buildRuntime(opts.threaded === true, [definition], opts.predicates ?? PREDICATES, opts.delayMs);
  const scheduler = runtime.scheduler;
  const ownsScheduler = opts.runtime === undefined;

  const inputs: FoldInput[] = [];
  const failures: string[] = [];
  const unsatisfiableJoins: UnsatisfiableJoin[] = [];
  const unmintedTasks: UnmintedTask[] = [];
  const failureKinds: string[] = [];
  const outcomesSeen: RunOutcome[] = [];
  const resolved: string[] = [];
  const suspendedAt: Record<string, string> = {};
  const refusedResolutions: string[] = [];
  // W82: what `onNonconformingResult` reported, in order. Empty unless `opts.checkResults` asked.
  const nonconforming: RunReport['nonconforming'][number][] = [];
  const refusedResolutionErrors: Record<string, { name: string; message: string }> = {};
  let startRefusal: RunReport['startRefusal'];
  let state = emptyState();
  // **The race's two arms each RESOLVE WITH THEIR OWN NAME — W17.**
  //
  // `finishedBy` used to be `declaredFinished ? 'run-state' : 'backstop'`, read
  // after the race, and its comment claimed that *"reads which of the two won
  // rather than trusting a flag the loser also sets"*. **It did not.** W17's
  // adequacy reader replaced the whole `Promise.race` with `setTimeout(1200)` —
  // a timer LONGER than the run rather than shorter — and all 341 assertions
  // passed: the microtask still set `declaredFinished` while the harness slept,
  // so every row still reported `finishedBy: 'run-state'`. That is W5's mask
  // restored in the only form that matters, and the existing probe missed it
  // because a 1 ms timer truncates the run and a 1200 ms one does not.
  //
  // Now the value IS the race's result. Delete the race and there is no value to
  // report — `tsc` refuses it, and at runtime every row's `finishedBy` assertion
  // fails. This is the same repair the file already made for `timedOut`, applied
  // one level up: derive it from the winner rather than from a flag a participant
  // sets.
  let settle: (() => void) | null = null;
  const finished = new Promise<'run-state'>((resolve) => { settle = () => resolve('run-state'); });
  let checkQueued = false;
  // **Where the sequence stood when the predicate fired**, and the single source
  // `lateInputs` is derived from below. It used to be a parallel array pushed to
  // from the listener, and deleting that one push made all nineteen
  // *"nothing arrived after the run was declared finished"* assertions
  // tautologies with the gate green — W17's adequacy reader, and the identical
  // second-source-of-truth shape this file records as fixed for `timedOut`.
  //
  // `-1` means the predicate never fired, and the derivation below then reports
  // the WHOLE sequence as late: a harness that never recorded when the run
  // finished cannot claim nothing arrived afterwards.
  let finishIndex = -1;

  // **The peak of `JP-R12`'s window, per region — W55.**
  //
  // **Sampled on every fold input, and that is the whole of why it works.** The
  // driver records an arrival, THEN emits `branch.arrived`, THEN asks the policy
  // (`src/driver/driver.ts`'s `join` arm, and the order is stated there as a rule) —
  // so the element that reaches this callback for the last arrival is delivered
  // while the collection is still whole and the join has not yet become terminal.
  // A sample taken anywhere else would be a sample of the released state.
  //
  // **Per region rather than across regions**, because a nested run has two and they
  // peak at different moments: `max(total)` would report the larger of two maxima
  // rather than the sum of them, and a region that filled and emptied before the
  // other started would vanish from the number entirely.
  //
  // **The snapshot holds the payload OBJECTS**, which is what makes the
  // reconstruction below a measurement of the same graph rather than of a copy of
  // it — and what makes `peakAliasingLog` answerable at all.
  const peakByRegion: Record<string, number> = {};
  const peakSnapshot = new Map<string, Map<string, unknown>>();
  //
  // **`runtime.start` starts the run INSIDE the call, so there is a window in which fold inputs
  // arrive and this closure does not yet hold the driver — W67.** Before this item the driver was
  // constructed and started on two separate lines and the window did not exist. It is counted
  // rather than ignored, and the assertion that it is harmless is taken at the moment the driver
  // becomes available: nothing can have ARRIVED at a join before the entry node's first dispatch
  // returned, so a non-empty `arrivals` at that instant is a harness failure and says so.
  let sampledBeforeDriver = 0;
  const driverRef: { current: Driver | null } = { current: null };
  const samplePeak = (): void => {
    if (driverRef.current === null) { sampledBeforeDriver++; return; }
    for (const [region, held] of arrivalsOf(driverRef.current)) {
      if (held.size > (peakByRegion[region] ?? 0)) {
        peakByRegion[region] = held.size;
        peakSnapshot.set(region, new Map(held));
      }
    }
  };

  // In-flight tracking, for the overlap check. `task.running` and the settlement
  // events are the scheduler's own, and this is the example rather than the
  // library, so subscribing directly is fine — `OR-R4` only says they write no
  // outcome RECORD.
  const inFlight = new Set<string>();
  let branchesOverlapped = false;
  const noteRunning = (e: { detail: unknown }) => {
    const id = (e.detail as { id?: string })?.id;
    if (typeof id !== 'string') return;
    inFlight.add(id);
    // Two branches of one region are in flight at once. Order-free: it is true
    // whichever of them entered first.
    const branches = [...inFlight].filter((t) => !t.includes(':-:'));
    if (branches.length > 1) branchesOverlapped = true;
  };
  const settledByScheduler = new Set<string>();
  // **W57's second observer for ADR 0048 rule 5, read off the scheduler's LIVE task object at
  // the listener** (`OR-R1`, synchronously, never retained): a `FyflowTask` carries a numeric
  // `attempts` from construction and a plain object handed to `addTask` carries none. The
  // driver's own record cannot see this — its listener normalises `attempts` — so this is
  // independent of both the driver and the `instanceof` count below.
  let settlementsSeen = 0;
  let numericAttemptsSeen = 0;
  // **W58: WHICH `attempts`, per id, off the same live object** — the retry row's second
  // observer, independent of the driver's record (which is the listener's normalised copy).
  const attemptsSeen: Record<string, number> = {};
  // **W63: the task's ERROR string, per id, off the same live object** — the failing-transform
  // row's second observer of `TransformFailed`'s message, independent of the driver's record
  // (whose listener copies the same field). A string, copied synchronously, never the object.
  const errorsSeen: Record<string, string> = {};
  // **W82: the own property NAMES of the live result, read before `OR-R2` has cloned anything.**
  // The names only — strings, copied synchronously, the object never retained (`OR-R1`). This is
  // the observer that can say a key the RECORD lacks was there when the scheduler settled.
  const settledOwnKeys: Record<string, string[]> = {};
  const noteDone = (e: { detail: unknown }) => {
    const id = (e.detail as { id?: string })?.id;
    if (typeof id !== 'string') return;
    inFlight.delete(id);
    // Read synchronously from the live detail and never retained (`OR-R1`); only
    // the id, which is a string, and whether `attempts` is a number.
    settledByScheduler.add(id);
    settlementsSeen++;
    const attempts = (e.detail as { attempts?: unknown }).attempts;
    if (typeof attempts === 'number') { numericAttemptsSeen++; attemptsSeen[id] = attempts; }
    const error = (e.detail as { error?: unknown }).error;
    if (typeof error === 'string') errorsSeen[id] = error;
    const result = (e.detail as { result?: unknown }).result;
    // `getOwnPropertyNames` rather than `Object.keys`, because the whole point is a key
    // `Object.keys` cannot see and `structuredClone` therefore does not copy.
    if (typeof result === 'object' && result !== null) settledOwnKeys[id] = Object.getOwnPropertyNames(result).sort();
  };
  scheduler.addEventListener('task.running', noteRunning);
  scheduler.addEventListener('task.completed', noteDone);
  scheduler.addEventListener('task.failed', noteDone);

  // **W58: the scheduler's own account of a task's RESOURCES, per task id, with `task.running`
  // interleaved** — see `RunReport.resourceEvents`. `resource.*` is emitted only once something
  // listens (the scheduler checks for an observer before building the detail), so these
  // listeners are what make the group row observable at all; on every other row they record
  // nothing, because no task names a group and no pool declares one.
  const resourceEvents: Record<string, string[]> = {};
  const heldGroups: Record<string, string[]> = {};
  const noteResource = (name: string) => (e: { detail: unknown }) => {
    const d = e.detail as { holderKind?: string; holderId?: string; groupId?: string };
    if (d?.holderKind !== 'task' || typeof d.holderId !== 'string') return;
    (resourceEvents[d.holderId] ??= []).push(name);
    // W59: the group's ID on every acquisition, so a row can name the group a TYPE declared.
    if (name === 'resource.acquired' && typeof d.groupId === 'string') (heldGroups[d.holderId] ??= []).push(d.groupId);
    if (name === 'resource.blocked' && d.groupId === opts.holdGroup && heldGroupReleases === 0) {
      // The task the row exists for is now parked behind the slot this harness holds. Give the
      // slot back — on a microtask, after the scheduler's own turn, and exactly once.
      heldGroupReleases++;
      queueMicrotask(() => heldGroup!.onFinish());
    }
  };
  for (const n of ['resource.blocked', 'resource.unblocked', 'resource.acquired', 'resource.released']) {
    scheduler.addEventListener(n, noteResource(n));
  }
  scheduler.addEventListener('task.running', (e: { detail: unknown }) => {
    const id = (e.detail as { id?: string })?.id;
    if (typeof id === 'string' && id in resourceEvents) resourceEvents[id]!.push('task.running');
  });
  const schedulerGroups = Object.keys(scheduler.groups as Record<string, unknown>).sort();
  const schedulerPools = Object.keys(scheduler.workerPools as Record<string, unknown>).sort();
  // **W63: which languages each POOL's config carries, read off the built pools** — ADR 0051 rule 4's
  // only observable at this rung. The helper writes an adapter's worker URL into a typed pool's
  // `config.languages` for a type some node of the run's flow transforms on and nowhere else; a pool
  // whose type no node of this run transforms on carries no `languages` key and so reports none.
  // Read at construction, as the two lists above are, so it is a fact about the scheduler this run
  // was BUILT with. *(This read "a bare `pool()` carries `{ role, delayMs }`" — there has been no
  // bare pool since W65 and no `role` since W67. W67's conformity reader, finding 11.)*
  const poolLanguages: Record<string, readonly string[]> = Object.fromEntries(
    Object.entries(scheduler.workerPools as Record<string, { config?: { languages?: Record<string, unknown> } }>)
      .map(([name, pool]) => [name, Object.keys(pool.config?.languages ?? {}).sort()]),
  );
  // **What every pool was BUILT with, read off the scheduler's own `WorkerManager`s — W67, fact 7.**
  // `residentGroups` is normalised to a sorted list of the group KEYS it names, because the
  // scheduler accepts both an array and a `{ key: cost }` map and the claim is about which groups a
  // pool holds; the COSTS are visible in `config` terms nowhere, so the pair's other observers are
  // `maxThreads` and what the worker returned.
  const derivedPools: Record<string, {
    scriptUrl: string; inline: boolean; maxThreads: number; idleTimeout: number;
    groups: readonly string[]; residentGroups: readonly string[]; config: unknown;
  }> = {};
  for (const [name, pool] of Object.entries(scheduler.workerPools as Record<string, Record<string, unknown>>)) {
    const rg = pool.residentGroups;
    derivedPools[name] = {
      scriptUrl: typeof pool.scriptUrl === 'string' ? pool.scriptUrl : '(no scriptUrl — not a WorkerManager)',
      inline: pool.inline === true,
      maxThreads: typeof pool.maxThreads === 'number' ? pool.maxThreads : -1,
      idleTimeout: typeof pool.idleTimeout === 'number' ? pool.idleTimeout : -1,
      groups: [...((pool.groups ?? []) as string[])].sort(),
      // **The COST as well as the key, and the author's first version dropped it** — rule 8's `a5`,
      // an undeclared survivor: `GpuModel`'s derivation computes `{ gpu: 2 }` for the large model
      // and `{ gpu: 1 }` for the small one, and with only the KEYS recorded a class that stopped
      // computing the cost was green. The scheduler accepts an array (keys, no cost) and a map
      // (key to cost), so the two shapes are spelled apart rather than flattened into one.
      residentGroups: (Array.isArray(rg)
        ? [...rg as string[]]
        : Object.entries((rg ?? {}) as Record<string, unknown>).map(([k, v]) => `${k}:${String(v)}`)).sort(),
      config: pool.config,
    };
  }

  let heldGroupReleases = 0;
  const heldGroup = opts.holdGroup === undefined
    ? null
    : (scheduler.groups as Record<string, ConcurrentLimitGroup | undefined>)[opts.holdGroup] ?? null;
  if (opts.holdGroup !== undefined && heldGroup === null) {
    throw new Error(`holdGroup "${opts.holdGroup}" is not a group this scheduler declares (${schedulerGroups.join(', ')})`);
  }
  // Taken BEFORE `driver.start`, so the gated task finds the slot gone at its first dispatch.
  heldGroup?.onStart();

  // **The `Driver` is the RUNTIME's now, and nothing here builds one — W67, P18 decision 10.**
  //
  // `runtime.start(flow, payload, options)` constructs a driver with `runtime.registry` spread into
  // it — the predicates, the workers, the node types, the named pool instances, the groups and the
  // languages, all derived ONCE from the document — and then starts it. The six sections this call
  // used to pass by hand are gone with the helper that built them; what a row can still say about a
  // single run is `StartOptions`, and that is what is passed below.
  //
  // **No `createTask` — deliberately, since W57**, and the runtime does not pass one either. The
  // driver's default is `(config) => new FyflowTask(config)` (ADR 0048), and this is the ONE place a
  // real scheduler is driven, so omitting the option is what makes ladder L6 run the factory that
  // SHIPS rather than a copy of it written in a harness — rule 8 obligation (e), *was what it RAN
  // what SHIPS*. Restoring the explicit line is the control: it must cost nothing.
  //
  // **The run id is still the ROW's**, because a row names the ids it expects to be dispatched and a
  // minted `r<n>` would be a property of how many runs this process had made. That the runtime CAN
  // mint one is decision 10 and is asserted at L1; here the caller gives it.
  //
  // **`driver` is read inside `onFoldInput` and assigned after `start` RETURNS**, which is why the
  // closure reads a holder rather than the binding: `runtime.start` starts the run inside the call,
  // so there is no `driver` while the first elements arrive. This was `const driver = new Driver(…)`
  // followed by a separate `driver.start(payload)`, and the window did not exist.
  const startOptions: StartOptions = {
    // Present only when the caller named one — otherwise the runtime mints it, and `report.runId`
    // below is read back off the driver rather than from anything this file wrote.
    ...(opts.runId !== undefined ? { runId: opts.runId } : {}),
    ...(policy !== undefined ? { joinPolicy: policy } : {}),
    onFoldInput: (input: FoldInput) => {
      inputs.push(input);
      state = step(state, input);
      samplePeak();

      // **The inbound step.** A branch has parked on a person; this is the person.
      // Deferred to a microtask rather than called here: `resolve()` appends and
      // routes, and doing that re-entrantly from inside an append would interleave
      // the sequence with itself. The same boundary termination uses, and the same
      // reason — the driver's turn finishes first.
      if (input.kind === 'region' && input.event.type === 'branch.suspended') {
        const how = opts.resolveOnSuspend?.[input.event.branchPath];
        const at = input.event.at;
        const branchPath = input.event.branchPath;
        // **Recorded from `input.event` DIRECTLY, not from the `at` local above.**
        // The first version of this line read `suspendedAt[branchPath] = at`, which
        // is the same variable the resolve step uses — so substituting the row's
        // own node for the event's swapped BOTH sides at once and the assertion
        // compared a declaration with itself. W23's adequacy reader's probe still
        // cost 0 after the "fix". Reading the event here is what makes this a
        // second source.
        suspendedAt[branchPath] = input.event.at;
        if (how) {
          queueMicrotask(() => {
            // `resolve()` is called with no caller on the stack, so a refusal
            // during the routing it triggers would surface as an uncaught
            // rejection rather than as a result. The harness's whole design is
            // that a failure is *reported*; this is that, applied to itself.
            //
            // **`branchIndices`, not `Number` — [Q117](../doc/open-questions.md),
            // fixed by [W23](../doc/work-items/w23-a-nested-flow-on-real-workers.md).**
            // This read `Number(branchPath)`, which is right at depth 1 and wrong
            // in two different ways below it. At depth 2 `Number('1.0')` is **1**,
            // not `NaN`: the harness minted `r*:node:1:0` — a **well-formed id for
            // a different task** — and `resolve()` refused it as not-suspended,
            // reporting a real failure under a false cause. At depth 3
            // `Number('1.1.0')` **is** `NaN` and `buildTaskId` throws since W21's
            // `INDEX` test, which is why the call is now **inside** the `try`:
            // it used to sit outside it, in a `queueMicrotask`, so the throw
            // surfaced as an unhandled rejection rather than as a harness failure.
            //
            // `branchIndices` is `buildTaskId`'s exact inverse and needs no new
            // export — `index.ts` re-exports `src/driver/ids.ts` whole.
            let taskId = `<unminted ${at}:${branchPath}>`;
            try {
              taskId = buildTaskId(runId, at, branchIndices(branchPath), 0);
              // **`FD-R4` at the resolve boundary — W73.** The row's `refusedFirst` value is tried first and
              // must be REFUSED at the caller with the task still suspended; the declared `result` below is
              // then the second attempt, which is what makes the refusal observable rather than assumed.
              if (how.refusedFirst !== undefined) {
                try {
                  driverRef.current!.resolve(taskId, how.as, { result: how.refusedFirst, actor: how.actor });
                  failures.push(`FD-R4 did not refuse ${taskId}'s refusedFirst value — the resolution went through`);
                } catch (e) {
                  refusedResolutions.push(taskId);
                  refusedResolutionErrors[taskId] = { name: e instanceof Error ? e.name : 'not an Error', message: e instanceof Error ? e.message : String(e) };
                }
              }
              if (driverRef.current!.resolve(taskId, how.as, { result: how.result, actor: how.actor })) {
                resolved.push(taskId);
              } else {
                failures.push(`resolve() refused ${taskId} — RS-R1 says it was not suspended`);
              }
            } catch (e) {
              failures.push(`resolve() threw for ${taskId}: ${e instanceof Error ? e.message : String(e)}`);
            }
          });
        }
      }
      if (checkQueued) return;
      checkQueued = true;
      // **A boundary, not a timeout.** The driver routes synchronously inside the
      // scheduler's listener and appends a settlement BEFORE the routing it
      // causes, so a prefix read mid-turn is not a resting state: between
      // `ingest` settling and its successor being dispatched there is momentarily
      // nothing running (`completed`), and between the last branch arriving and
      // the join firing the state is momentarily `stuck`. A microtask queued
      // during the turn runs after all of it.
      queueMicrotask(() => {
        checkQueued = false;
        // **Sampled HERE and nowhere else.** `spec/run-state.md` section 3 defines
        // the precedence at a quiescent point, and this microtask IS that point —
        // the driver routes synchronously inside the scheduler's listener, so by
        // now its turn is over. Sampling per element instead recorded `completed`
        // and `stuck` for runs that were neither: the exact artefacts section 3's
        // quiescence block enumerates, in a list a row then asserted on. Found by
        // W6's conformity reader, and it is the second occurrence of the failure
        // mode that produced that block.
        //
        // Being quiescent is what makes an EXCLUSION sound as well as an
        // inclusion, so a row can now say which outcomes a run must never have
        // been in.
        if (!outcomesSeen.includes(state.outcome)) outcomesSeen.push(state.outcome);
        if (!isTerminal(state)) return;
        // **The whole record of "the run was declared finished", and there is no
        // longer a boolean beside it.** `declaredFinished` was deleted here: with
        // `finishedBy` coming from the race and `lateInputs` derived from this
        // index, nothing read it, and `deno lint` said so. Two fields removed, two
        // second-sources-of-truth gone — which is the same repair, twice.
        //
        // The sequence as the fold saw it at the quiescent point that declared the
        // run over. `RN-R12` says no more input is coming; `lateInputs` below is
        // that claim, checked.
        finishIndex = inputs.length;
        settle?.();
      });
    },
    // A refusal reaches the sequence as `{ kind: 'stopped' }` and the fold reports
    // `stopped`, so this exists only so a failure is legible in the report.
    onRunFailure: (f) => { failures.push(`${f.kind}: ${f.message}`); failureKinds.push(f.kind); },
    // **Kept whole, and NOT folded into `failures`.** See `RunReport.failures`:
    // the two callbacks report different things and only one of them stops a run.
    // Copied field by field rather than retained, for `OR-R1`'s reason applied to
    // our own surface — the driver hands out a fresh object here, but a harness
    // that retains what a callback gave it is the habit that produced ADR 0007.
    onUnsatisfiableJoin: (j) => {
      unsatisfiableJoins.push({
        // **`regionPath` copied too, and it is not decoration** — W84. Under ADR 0062
        // one `fanoutId` can name N joins, so a report that drops the path cannot say
        // which of them died; copying it is what lets an L6 row assert the instance.
        fanoutId: j.fanoutId, regionPath: j.regionPath,
        joinId: j.joinId, policyId: j.policyId, describe: j.describe,
      });
    },
    // **`ID-R5` — and this callback MUST NOT THROW.**
    // [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
    // invokes it inside `onEventOrThrow`, so a throw here is caught at the
    // listener boundary and stops the run under the consumer's own error class —
    // reinstating, through this harness, exactly the damage the decision removed.
    // Documented rather than guarded upstream, so the obligation is ours: four
    // field reads and a push, and nothing that can raise.
    //
    // Copied field by field for `OR-R1`'s reason applied to our own surface. The
    // driver hands out a fresh object; a harness that retains what a callback gave
    // it is the habit that produced ADR 0007.
    onUnmintedTask: (u) => {
      unmintedTasks.push({ runId: u.runId, event: u.event, taskId: u.taskId, reason: u.reason });
    },
    // **`OR-R13` — and the SPREAD is the switch, which is why this is conditional rather than a
    // callback that ignores rows.** ADR 0060 decision 4: `onNonconformingResult`'s PRESENCE is what
    // turns the check on, so a harness that always installed one would turn it on for every row and
    // the `nonconforming: []` every other row asserts would stop being about the driver.
    //
    // Copied field by field, for `OR-R1`'s reason applied to our own surface, and `findings` is
    // rebuilt as fresh pairs rather than aliased: the driver hands out a fresh literal, and a
    // harness that retains what a callback gave it is the habit that produced ADR 0007.
    //
    // **It must not throw.** Like every other callback here it is called inside the listener, so a
    // throw is caught at `onEvent`, reported through `onRunFailure` and STOPS THE RUN — which would
    // reinstate, through this harness, exactly the behaviour change ADR 0060 decision 3 forbids.
    // Six field reads and a push, and nothing that can raise.
    ...(opts.checkResults === true
      ? {
        onNonconformingResult: (f: NonconformingResult) => {
          nonconforming.push({
            runId: f.runId, taskId: f.taskId, nodeId: f.nodeId, type: f.type, worker: f.worker,
            findings: f.findings.map((x) => ({ path: x.path, says: x.says })),
            message: f.message,
          });
        },
      }
      : {}),
  };

  // **`checkWiring` over the registry this runtime hands its drivers** (W73): the one road on which a
  // CLASS-form node type (`GpuModel`, registered in code) gets a wiring verdict, since a document alone
  // cannot carry it. Taken before the run starts, from the same object `start` spreads into the driver.
  const wiring = await checkWiring(runtime.registry, definition);
  const startedAt = Date.now();
  // **`FD-R4` at the start boundary — W73.** The row's `refuseAtStart` payload goes through the runtime's
  // own `start` first, with the run id UNSET so the runtime mints one for the attempt: `runtime.start` builds
  // a driver and starts it in ONE call, so the refused driver is a value this harness never holds — what L6
  // observes is the refusal and the scheduler's task count, and the *same driver then started* half of
  // `FD-R4` is L2's (`test/driver/boundary.test.ts`; W73's adequacy reader, f1). A second driver on the SAME
  // id would be the topology ADR 0023 cannot see (two drivers minting one id set), so the attempt takes its own.
  if (opts.refuseAtStart !== undefined) {
    try {
      runtime.start(definition, opts.refuseAtStart, { ...startOptions, runId: undefined });
      failures.push('FD-R4 did not refuse the payload the row declares refused at start — the run began');
    } catch (e) {
      const err = e as { name?: unknown; boundary?: unknown; nodeId?: unknown; message?: unknown };
      startRefusal = {
        name: String(err.name), boundary: String(err.boundary), nodeId: String(err.nodeId), message: String(err.message),
        // Read off the SCHEDULER's own map, not the driver: the claim is that nothing reached it.
        dispatchedThen: scheduler.tasks.size,
      };
    }
  }
  // **`start` dispatches inside this call**, so there is no separate `driver.start(payload)` line
  // any more: the run is running when it returns.
  //
  // **Destructured since ADR 0058**, which made `start` return `{ driver, done }`, and **this
  // harness deliberately does not use `done`** — P20 stop-and-ask (e), ANSWERED by the maintainer
  // at W78 as recommended.
  //
  // `finishedBy` exists because W5's adequacy reader replaced the whole termination mechanism with
  // `setTimeout(1)` and **all 72 L6 assertions still passed**; it is ADR 0014's own Correction, and
  // the claim it carries is that the run was over *when the run-state predicate said so* rather
  // than *when a clock did*.
  //
  // **The reason is the SENSOR and not the race, and this comment's first version said the race** —
  // W78's conformity reader, finding 7. It argued that `await done` "ends the wait with no winner
  // to name, because it races nothing", which W78's own L6 block refutes three files over: that
  // block DOES race `done` against a deadline and asserts which side won. A converted `runFlow`
  // could name a winner just as easily. **What it could not do is keep the claim**: with `done`,
  // `finishedBy: 'run-state'` would mean *the LIBRARY's own fold said so* rather than *this
  // harness's own clock-free predicate did*, and the thing ADR 0014's Correction exists to hold up
  // is the second. That is the sensor corroborating itself — `doc/workflow.md` rule 8 obligation
  // (c)'s LIMIT, where the clause has exactly one observer and the change replaces it with the
  // subject. *(Measured by that reader: replacing this race with a 1500 ms clock resolving
  // `'run-state'` costs FIVE L6 failures, so the Correction is still load-bearing.)*
  //
  // **Where `done` IS asserted is BESIDE it**, in `examples/l6.ts`'s consumer-road block — W78,
  // P20's exit artifact. It builds its own runtime through this file's `buildRuntime` and holds
  // none of the termination machinery above, and it makes its own two runs: so the two are the same
  // CLAIM on DIFFERENT runs rather than two expressions over one fact, which is weaker than the
  // LIMIT's ideal and is said here rather than overstated (the same reader, finding 8).
  const { driver } = runtime.start(definition, payload, startOptions);
  driverRef.current = driver;
  // **Read OFF THE DRIVER, not from the option** — `Driver.runId` is readable since W66 precisely so
  // a caller can learn a minted one, and this is the only thing that makes the shim run's id a fact
  // about the runtime rather than about this file.
  const runId = driver.runId;
  // The window above, closed and checked. If anything had arrived while this harness did not hold
  // the driver, the peak below would be a measurement of the wrong graph — so it is asserted rather
  // than assumed, and then the sample the window missed is taken.
  for (const [region, held] of arrivalsOf(driver)) {
    if (held.size > 0) {
      failures.push(`the peak sampler missed ${held.size} arrival(s) in region ${region}: ` +
        `${sampledBeforeDriver} fold input(s) reached onFoldInput before runtime.start returned`);
    }
  }
  samplePeak();

  let timer: ReturnType<typeof setTimeout> | undefined;
  const backstop = new Promise<'backstop'>((resolve) => {
    timer = setTimeout(() => resolve('backstop'), backstopMs);
  });
  // **The winner names itself.** See the declaration of `finished` above for why
  // this is not `declaredFinished ? … : …` any more.
  const finishedBy: 'run-state' | 'backstop' = await Promise.race([finished, backstop]);
  if (timer !== undefined) clearTimeout(timer);
  // **Derived from the sequence, not tracked beside it.** On the backstop row the
  // predicate never fired, so there is no "after" to be late relative to and the
  // list is empty by definition; on every other row it is everything the driver
  // appended after the run was declared over, which `RN-R12` says is nothing.
  const lateInputs = finishedBy === 'backstop'
    ? []
    : inputs.slice(finishIndex < 0 ? 0 : finishIndex).map((i) => i.kind);
  const wallMs = Date.now() - startedAt;

  // **Read BEFORE `shutdown()`, and the order is the whole point.**
  //
  // `shutdown()` drains the scheduler, and a drain does more work: it settles
  // whatever was still in flight, the driver routes it, and the state advances.
  // Reading after it therefore reports a *finished* run no matter how the wait
  // ended — which is how a 1 ms backstop passed every assertion on the one row
  // whose declared result IS the backstop, and, one item earlier, how replacing
  // the whole termination mechanism with a timer passed all 72
  // ([ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)'s
  // *Correction*).
  //
  // **Twice now, the same shape**: `shutdown()` silently repairing a harness that
  // stopped waiting too early. Reading first is what makes the wait's outcome
  // observable at all — and it is safe precisely because `lateInputs` asserts
  // nothing arrives after a run is declared finished.
  const dispatched = driver.dispatchedIds();
  const settled: Record<string, string | null> = {};
  for (const id of dispatched) settled[id] = driver.terminalStateOf(id);
  const log = driver.snapshot();
  const finalState = state;
  // **And what the SCHEDULER holds, sampled at the same quiescent point** — W57. Not at the
  // report literal below: by then the retention observer has awaited, and the first version of
  // this read `scheduler.tasks.size` there and saw **0 on every row**, which the cross-row
  // non-vacuity clause in `l6.ts` caught on its first run.
  const tasksHeld = scheduler.tasks.size;
  const fyflowTasksHeld = [...scheduler.tasks.values()].filter((t) => t instanceof FyflowTask).length;
  // **W67, and read HERE for the same reason as the two lines above: `shutdown()` empties
  // `scheduler.tasks`.** The first version of this read it in the return object, after the drain, and
  // every entry came back `(not held)` — the exact shape the comment above records for `tasksHeld`,
  // reproduced one field along on its first run.
  const poolOfTask: Record<string, string> = Object.fromEntries(
    [...scheduler.tasks.entries()].map(([id, t]) => [id, (t as unknown as { workerType?: string }).workerType ?? '(none)']),
  );

  // **What the driver is still holding, read in the same place and for the same
  // reason `dispatched` is: BEFORE `shutdown()`** — W55. A drain settles what was in
  // flight and the driver routes it, so a collection read afterwards would be a
  // collection at a different moment in the run.
  const endByRegion: Record<string, number> = {};
  for (const [region, held] of arrivalsOf(driver)) endByRegion[region] = held.size;
  const peakValues = [...peakSnapshot.values()].flatMap((m) => [...m.values()]);
  // **Identity, not equality** — `JP-R12`'s *second copy* claim. `OR-R2` deep-copies
  // at the listener boundary and `advance` clones again for the edge hop, so an
  // arrived payload that WERE a log record's own object would mean one of those two
  // clones had stopped happening. Counted rather than asserted here: this file
  // reports, `examples/l6.ts` asserts.
  const logged = new Set<unknown>(loggedResults(driver));
  const sum = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
  const retention: Retention = {
    peakByRegion,
    endByRegion,
    peakEntries: sum(peakByRegion),
    endEntries: sum(endByRegion),
    peakAliasingLog: peakValues.filter((v) => logged.has(v)).length,
    loggedResults: logged.size,
    snapshotEntries: peakValues.length,
    bytesAtEnd: await retainedBytes(driver),
    bytesBeforeRelease: await retainedBytes(driver, [[...peakSnapshot].map(([r, m]) => [r, [...m]])]),
    ...walkOf(driver),
  };
  // **The instrument is dropped once it has been read, and that is observer 2's
  // whole standing** — W55's conformity reader, BLOCKING.
  //
  // `samplePeak` closes over `peakSnapshot`, `samplePeak` is reachable from
  // `onFoldInput`, and `onFoldInput` is on `driver.opts` — which `retainedBytes`
  // skips by name. So observer 1 could not see it and observer 2 could: under
  // `keepDriver` every kept driver transitively retained **a second copy of the very
  // collection ADR 0046 releases**. Measured at `scale 50 16 16 own`: **141.9 MiB as
  // shipped against 129.4 MiB with this line**, which is 256 KiB a run — exactly one
  // collection each, 9% of the figure being reported. *A sensor cannot corroborate
  // itself, and here the second sensor was measuring the first one's instrument.*
  peakSnapshot.clear();

  // REQUIRED, or the process stays alive (`AGENTS.md` §2) — but only for a
  // scheduler this run BUILT. A shared one belongs to the caller (`runPair`),
  // and shutting it down here would drain the other run out from under itself.
  if (ownsScheduler) await scheduler.shutdown();

  return {
    runId,
    flowId: definition.flowId,
    // A LABEL where the caller named no policy. What the runtime's default IS, is not asserted by
    // this string — it is asserted by the shim run's OUTCOME, on a flow whose two candidate policies
    // disagree: `p1-routed-away` at LOW completes under `live-token` and is `stuck` under
    // `arrival-count`, so a run that completes with no `joinPolicy` given is the default, observed.
    policyId: policy?.id ?? '(the runtime default)',
    state: finalState,
    inputs,
    dispatched,
    settled,
    log,
    settledByScheduler: [...settledByScheduler],
    tasksHeld,
    fyflowTasksHeld,
    settlementsSeen,
    wiring,
    numericAttemptsSeen,
    attemptsSeen,
    errorsSeen,
    nonconforming,
    settledOwnKeys,
    resourceEvents,
    heldGroups,
    schedulerGroups,
    schedulerPools,
    workerSchemas: Object.fromEntries(
      Object.entries(runtime.registry.workers ?? {}).map(([k, w]) => [k, Object.keys(w).filter((f) => f.endsWith('Schema')).sort()]),
    ),
    groupObjectIds: Object.fromEntries(
      Object.entries(runtime.groups).map(([key, g]) => [key, (g as unknown as { id?: unknown }).id as string]),
    ),
    registryTypes: Object.keys(runtime.registry.nodeTypes ?? {}).sort(),
    derivedPools,
    poolOfTask,
    poolLanguages,
    heldGroupReleases,
    wallMs,
    outcomesSeen,
    resolved,
    suspendedAt,
    finishedBy,
    timedOut: finishedBy === 'backstop',
    failures,
    unsatisfiableJoins,
    failureKinds,
    unmintedTasks,
    lateInputs,
    branchesOverlapped,
    retention,
    startRefusal,
    refusedResolutions,
    refusedResolutionErrors,
    driver: opts.keepDriver === true ? driver : undefined,
  };
}