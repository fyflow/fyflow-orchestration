/**
 * **The envelope worker — what the bootstrap helper puts around a node type's own worker** —
 * `spec/flow-definition.md` section 2 (v0.17) and `FD-C5`,
 * [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md)
 * rule 4, [W59](../../doc/work-items/w59-what-a-node-type-is.md); **and since v0.18 the place a
 * declared TRANSFORM is evaluated** — `FD-C6`,
 * [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md),
 * [W61](../../doc/work-items/w61-what-a-transform-is.md).
 *
 * A `WorkerManager` loads its worker from a script URL and instantiates the module's default
 * export, so a wrapper cannot be a function around a class — it has to BE the script the pool
 * loads. This module is that script: its pool config names the type's real worker (`worker`, a
 * module URL), that worker's own config (`config`), and — for a type some node of which declares
 * a transform — the worker-side module URL of each language those nodes name (`languages`); this
 * class loads the inner worker and the language modules in `setup()`, evaluates the envelope's
 * `transform` in `run()` when one is present, hands the inner worker **exactly `{ settings, input }`**
 * with `input` REPLACED by the evaluation's result, and tears the inner worker down with itself.
 *
 * **Why the transform is evaluated HERE and never in the driver** — P17 decision 1, the
 * maintainer's placement. The driver dispatches inside a scheduler listener in one synchronous
 * turn (`src/driver/driver.ts` has no `await`; `AGENTS.md` section 8's quiescent-point contract
 * rests on that) and a language's evaluator is asynchronous (JSONata's `evaluate()` returns a
 * Promise); a worker's `run()` is async by contract. So the driver's whole part is one key in one
 * object literal, and ladder L2 — which asserts on what `createTask` received — cannot see a
 * transformed value (P17 prediction 3). **And why the language reaches this class as a module
 * URL rather than a function** — P17 fact 7: a function in a THREADED pool's config fails the task
 * with *could not be cloned*, while a URL string crosses. So an adapter has two halves, and this
 * class holds the worker half.
 *
 * **A transform that FAILS is a TASK failure** (P17 decision 5): `TransformFailed` is thrown from
 * `run()`, naming the language, the expression and the language's own error code where it has
 * one, and the scheduler takes the road any worker throw takes — `failed` on an optional task,
 * `failed` then `user_action` on a non-optional one (measured at W61's declaration, inline and
 * threaded, both runtimes). **And so is a language module that did not LOAD** — see `setup()`:
 * a throw there would be a worker error the scheduler never reports to the task, so the load
 * failure is remembered and thrown from `run()` on exactly the tasks that need that language. A
 * transform that evaluates to `undefined` is NOT a failure: the inner worker receives `undefined`
 * as its `input`, because an adapter cannot tell a typo from an intended absence (P17 fact 4),
 * and saying otherwise would decide P19 here.
 *
 * Imports nothing from the scheduler, so a thread loading it resolves nothing but itself, the
 * inner worker's URL and the language modules' URLs; `RT-R9` — no parameter properties, no `enum`
 * — because Node loads this by stripping types.
 */
import type { Transform } from '../definition/types.ts';

/** The pool config the bootstrap helper writes for a typed pool: the inner worker, ITS config, and the languages its nodes transform in. */
export interface EnvelopePoolConfig {
  /**
   * Module URL of the type's real worker; its default export is the class. `WorkerEntry.url`, resolved
   * through the type's `worker` name (W65).
   *
   * **ABSENT for a type that only TRANSFORMS** —
   * [ADR 0075](../../doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md),
   * W109. Such a type names no worker, so there is no inner class to load and `run()` returns the
   * node's own `transform` evaluated over the value it received. The key is OMITTED rather than set to
   * `undefined`, because `poolOptionsOf` writes only what it has to say and an absent key is what
   * survives the clone into a thread.
   */
  worker?: string;
  /**
   * **Present and `true` exactly for a type that only TRANSFORMS** (ADR 0075 rule 4), written by
   * `poolOptionsOf` when the type names no worker.
   *
   * **Why a MARKER and not the absence of `worker`.** An absent `worker` is also what a malformed
   * pool config has, and this worker has refused that by name since v0.17 — *the pool config names no
   * worker URL*; since W141 the refusal is remembered by `setup()` and thrown from `run()` on every task,
   * where until then `setup()` threw it. Reading the absence as a SHAPE would turn every such defect into
   * a node that silently returns its input, which is the conflation this file's own refusal refuses one
   * construct along. So the transform-only pool DECLARES itself and an empty config stays an error:
   * the two states are told apart by what is present, never by what is missing.
   */
  transformOnly?: true;
  /** The inner worker's own constructor argument — the instance's derived `config` (`NodeTypeDeclaration.config` for the default instance). */
  config?: unknown;
  /**
   * **Language name → worker-side module URL** (`LanguageAdapter.worker`), written by the bootstrap
   * helper ONLY for a type some node of which declares a `transform`, and only for the languages
   * those nodes name — so a pool whose nodes never transform loads no engine. Loaded in `setup()`,
   * once per worker instance; each module's default export is `compile(expr) => { evaluate(input,
   * settings) }`.
   */
  languages?: Readonly<Record<string, string>>;
}

/** What a typed node's worker receives — `FD-C5`; with `transform` present, what the POOL receives — `FD-C6`. */
export interface Envelope {
  settings: Readonly<Record<string, unknown>>;
  input: unknown;
  /** Present exactly when the node declares one; consumed here and never seen by the inner worker. */
  transform?: Transform;
}

/** A typed pool was handed something that is not an envelope. A task failure, never a run refusal. */
export class NotAnEnvelope extends Error {}

/**
 * **A declared transform could not be evaluated** — P17 decision 5. Thrown from `run()`, so the
 * scheduler reports it as the TASK's failure with this message as the error: the language, the
 * expression, the language's own code (`T0412`, `T2002` — the codes JSONata throws; `P0002` from
 * the test fixture) when it set one, and why.
 */
export class TransformFailed extends Error {
  readonly lang: string;
  readonly expr: string;
  readonly code: string | undefined;
  constructor(transform: Transform, code: string | undefined, why: string) {
    super(`transform failed — ${transform.lang} ${JSON.stringify(transform.expr)}${code !== undefined ? ` [${code}]` : ''}: ${why}`);
    this.lang = transform.lang;
    this.expr = transform.expr;
    this.code = code;
  }
}

/** The worker half of an adapter: what its module's default export returns for one expression. */
interface Compiled {
  evaluate(input: unknown, settings: Readonly<Record<string, unknown>>): unknown;
}
type WorkerCompile = (expr: string) => Compiled;

/**
 * **`FD-C5`'s shape check, and the only unpacking there is — and since v0.18 `FD-C6`'s.** Accepts
 * an object carrying BOTH `settings` and `input` — `input` may hold `undefined`, because a node's
 * input may be anything a worker returned, so presence is decided by `in` and not by value — with
 * `settings` a plain object; keeps `transform` when it is present AND is exactly `{ lang, expr }`,
 * both strings, refusing any other value under that key (a hand-built payload — the driver writes
 * only what `FD-V37` accepted); and returns a fresh object of exactly those keys, dropping
 * anything beside them.
 */
export function unpackEnvelope(payload: unknown): Envelope {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new NotAnEnvelope(`typed pool: the payload is not an envelope { settings, input } — got ${brief(payload)}`);
  }
  const p = payload as Record<string, unknown>;
  for (const k of ['settings', 'input']) {
    if (!(k in p)) throw new NotAnEnvelope(`typed pool: the payload is not an envelope — it has no "${k}" key (keys: ${Object.keys(p).map((x) => `"${x}"`).join(', ') || 'none'})`);
  }
  const settings = p.settings;
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    throw new NotAnEnvelope(`typed pool: the envelope's settings is not a plain object — got ${brief(settings)}`);
  }
  const env: Envelope = { settings: settings as Readonly<Record<string, unknown>>, input: p.input };
  if ('transform' in p) {
    const t = p.transform as Record<string, unknown> | null;
    const wellFormed = typeof t === 'object' && t !== null && !Array.isArray(t) &&
      typeof t.lang === 'string' && typeof t.expr === 'string' && Object.keys(t).length === 2;
    if (!wellFormed) throw new NotAnEnvelope(`typed pool: the envelope's transform is not { lang, expr } — got ${brief(p.transform)}`);
    env.transform = { lang: t.lang as string, expr: t.expr as string };
  }
  return env;
}

function brief(v: unknown): string {
  const s = printable(v);
  return s.length > 120 ? `${s.slice(0, 117)}...` : s;
}

/**
 * **A value as text, and never a throw** — W141's two readers' shared subject. `String(v)` THROWS on
 * `Object.create(null)` (W132 met the same in `test/runner.ts`), and these run inside `setup()`'s catch,
 * where a throw is exactly F1's worker error: measured, an inner `teardown()` throwing that value made
 * `setup()` throw again, and an inner `setup()` throwing it left a message with no worker and no stage.
 */
function printable(v: unknown): string {
  try { const j = JSON.stringify(v); if (j !== undefined) return j; } catch { /* fall through */ }
  try { return String(v); } catch { return `an unprintable ${typeof v}`; }
}

function codeOf(e: unknown): string | undefined {
  const c = (e as { code?: unknown })?.code;
  return typeof c === 'string' && c.length ? c : undefined;
}
function messageOf(e: unknown): string {
  if (e instanceof Error) return e.message;
  try { return String(e); } catch { return printable(e); }
}

/** The scheduler's worker contract, structurally: `setup` and `teardown` are optional on a plain class, `run` is not. */
interface InnerWorker {
  setup?(): unknown;
  run(payload: unknown, context?: unknown): unknown;
  teardown?(): unknown;
}

export default class EnvelopeWorker {
  private readonly cfg: EnvelopePoolConfig;
  private readonly workerContext: unknown;
  private inner: InnerWorker | null = null;
  /**
   * **Set by `setup()` when the pool config names no worker — a type that only TRANSFORMS** (ADR 0075).
   * It is a SEPARATE field from `inner === null` on purpose, and that is the whole of this arm's
   * correctness: `inner` is null before `setup()` and after `teardown()` too, which are LIFECYCLE
   * states `run()` has refused by name since v0.17, so reading the absence off `inner` would turn
   * *run() before setup()* into *return the input untouched* — a run that silently hands a worker's
   * successor the wrong value instead of failing the task. Measured at W109's declaration step: before
   * this item BOTH of those states threw, and neither was an arm.
   */
  private noInner = false;
  /**
   * The worker half of each language the pool config names, loaded in `setup()` — or the reason
   * it did not load, REMEMBERED so that `run()` can fail the task with it (the maintainer's call,
   * see `setup()`).
   */
  private readonly langs = new Map<string, WorkerCompile | Error>();
  /** Each distinct `(lang, expr)` compiled ONCE per worker instance, never per task — P17 decision 3. */
  private readonly compiled = new Map<string, Compiled>();
  /**
   * **Why this worker could not set up, REMEMBERED — or `null`** —
   * [W141](../../doc/work-items/w141-a-worker-that-cannot-set-up-fails-its-tasks-and-the-registry-has-one-shape.md),
   * [Q266](../../doc/questions/q266.md), P31 decision 3: W61's road for a language, taken for the whole
   * of `setup()`. Set by `setup()` instead of throwing; read FIRST by `run()`, which fails every task
   * with it; cleared by `teardown()`, so a torn-down worker is in its constructed state again.
   */
  private setupFailure: string | null = null;

  /**
   * Both arguments are kept, and the second is forwarded to the inner worker: the scheduler passes
   * its worker-level context here, and a worker that only accepts `config` silently loses the
   * ability to self-terminate (the scheduler's own reference, §4).
   */
  constructor(config: EnvelopePoolConfig, workerContext?: unknown) {
    this.cfg = config;
    this.workerContext = workerContext;
  }

  /**
   * Loads the type's worker and runs ITS setup — a module with no default class is refused by
   * name, as at v0.17 — then the worker half of every language the pool config names, ONCE per
   * worker instance (P17 decision 3).
   *
   * **A language module that FAILS TO LOAD does not throw here; the failure is remembered and
   * every task whose transform names that language fails at `run()` with it.** Measured at W61's
   * declaration, both runtimes, inline and threaded: a wrapper whose `setup()` throws leaves every
   * task of the pool `pending` with `attempts: 0`, the pool restarts its worker, and the scheduler
   * emits nothing a driver could turn into a record — the failure is reported on the POOL as
   * `worker.setup.failed` and `task.requeue_required`, a worker error and not a task's, which is
   * P17 prediction 2's stated reversal condition. The maintainer chose this road at W61's
   * stop-and-ask (ADR 0051 rule 5): a URL that does not resolve, a module with no default compile
   * function, or an empty URL, each becomes a `TransformFailed` naming the language and the load
   * error, on exactly the tasks that need that language — a task with no transform, or one in a
   * language that did load, still runs on this worker.
   *
   * **And since W141 the same is true of the TYPE's own worker: this method never throws** — Q266,
   * P31 decision 3, W61's road taken for the whole of `setup()`. F1 is a fact about THIS method
   * throwing, whatever threw, and W141 measured it again on 0.5.2 through `createRuntime`: three
   * tasks on a worker whose `setup()` throws stay `pending` for ever in both pool modes, the pool
   * requeueing them on each worker failure until its restart limit, and the run's fold says
   * `running`. So every way the type's worker can fail to set up — the module does not load, it
   * exports no default class, its constructor throws, its own `setup()` throws — and the two
   * pool-config refusals this method made by name, are REMEMBERED in `setupFailure`, and `run()`
   * fails every task on this worker with it: an ordinary task failure, which the run routes per
   * ADR 0004 — down an `on: ["failed"]` edge on an optional node, parked `user_action` on a
   * non-optional one. **A constructed inner worker is torn down at once**, because the scheduler
   * tears down a worker whose `setup()` threw (its own reference, §6: *a failing `setup()` still
   * tears the worker down*) and this class is now the only thing that knows one did. The worker
   * stays up and fails every task until the pool is rebuilt: a setup that failed for a transient
   * reason is not retried here (W141's Out).
   */
  async setup(): Promise<void> {
    // A second `setup()` starts from nothing remembered — the conformity reader's 5: a failure kept from
    // the first call would fail every task of a worker whose second setup succeeded.
    this.setupFailure = null;
    try {
      await this.setupOrThrow();
    } catch (e) {
      this.setupFailure = messageOf(e);
      const inner = this.inner;
      this.inner = null;
      this.noInner = false;
      this.langs.clear();
      if (inner !== null) {
        try {
          await inner.teardown?.();
        } catch (t) {
          // Reported beside the setup error and never instead of it — the scheduler's own rule for a
          // teardown that throws after a failed setup (its reference, §6).
          this.setupFailure += ` (and its teardown() after the failed setup threw too: ${messageOf(t)})`;
        }
      }
    }
  }

  /** What `setup()` did until W141, throws and all; `setup()` turns each throw into `setupFailure`. */
  private async setupOrThrow(): Promise<void> {
    // **`transformOnly: true` is a type that only TRANSFORMS** (ADR 0075): nothing is imported,
    // `inner` stays null, and `run()` returns the transform's result. The two keys are mutually
    // exclusive and the contradiction is refused rather than resolved — a config carrying both says
    // two different things about what runs the task, and silently preferring either is how a pool
    // would run the wrong one of them.
    if (this.cfg?.transformOnly === true) {
      if (this.cfg.worker !== undefined) {
        throw new Error(`envelope worker: the pool config says transformOnly AND names worker ${brief(this.cfg.worker)} — a type either has an inner worker or only transforms`);
      }
      this.noInner = true;
      for (const [name, url] of Object.entries(this.cfg.languages ?? {})) {
        this.langs.set(name, await this.loadLanguage(name, url));
      }
      return;
    }
    if (typeof this.cfg?.worker !== 'string' || this.cfg.worker.length === 0) {
      throw new Error(`envelope worker: the pool config names no worker URL — got ${brief(this.cfg)}`);
    }
    const workerUrl = this.cfg.worker;
    let mod: { default?: unknown };
    try {
      mod = (await import(workerUrl)) as { default?: unknown };
    } catch (e) {
      throw new Error(`envelope worker: the type's worker ${JSON.stringify(workerUrl)} did not load: ${messageOf(e)}`);
    }
    if (typeof mod.default !== 'function' || !(mod.default as { prototype?: unknown }).prototype) {
      throw new Error(`envelope worker: the type's worker ${JSON.stringify(workerUrl)} must export a default class`);
    }
    const Inner = mod.default as new (config: unknown, workerContext?: unknown) => InnerWorker;
    try {
      this.inner = new Inner(this.cfg.config ?? {}, this.workerContext);
    } catch (e) {
      throw new Error(`envelope worker: the type's worker ${JSON.stringify(workerUrl)} threw from its constructor: ${messageOf(e)}`);
    }
    try {
      await this.inner.setup?.();
    } catch (e) {
      throw new Error(`envelope worker: the type's worker ${JSON.stringify(workerUrl)} threw from its setup(): ${messageOf(e)}`);
    }
    for (const [name, url] of Object.entries(this.cfg.languages ?? {})) {
      this.langs.set(name, await this.loadLanguage(name, url));
    }
  }

  /** One language's worker half, or the Error that stands in for it — never a throw (see `setup()`). */
  private async loadLanguage(name: string, url: unknown): Promise<WorkerCompile | Error> {
    if (typeof url !== 'string' || url.length === 0) {
      return new Error(`language "${name}" names no worker module URL in the pool config — got ${brief(url)}`);
    }
    try {
      const lm = (await import(url)) as { default?: unknown };
      if (typeof lm.default !== 'function') {
        return new Error(`language "${name}"'s worker module ${url} must export a default compile function (got ${typeof lm.default})`);
      }
      return lm.default as WorkerCompile;
    } catch (e) {
      return new Error(`language "${name}"'s worker module ${url} did not load: ${messageOf(e)}`);
    }
  }

  /**
   * `FD-C5`: the inner worker receives `{ settings, input }` and nothing else. `FD-C6`: when the
   * envelope carries a `transform`, `input` is the evaluation of that expression over the value
   * received, with the node's settings bound as `$settings`, and the third key is consumed here.
   */
  async run(payload: unknown, context?: unknown): Promise<unknown> {
    // **FIRST, before the lifecycle check below** — a worker whose setup failed has a null `inner`
    // too, and reading that as *run() before setup()* would fail the task with a false reason (W141).
    // A fresh Error per task: one object thrown from every task would be one object every record shared.
    if (this.setupFailure !== null) {
      throw new Error(`${this.setupFailure} — every task on this worker fails with this until the pool is rebuilt`);
    }
    if (this.inner === null && !this.noInner) throw new Error('envelope worker: run() before setup() — the inner worker is not loaded');
    const env = unpackEnvelope(payload);
    if (this.noInner) {
      // **A type that only transforms**: the transform IS the whole task, so a node of one that
      // declares none would be an expensive identity — `FD-V46` refuses that at `new Driver`, which is
      // why this throw has no case a valid document can reach and is here anyway: the payload is
      // whatever reached the pool, and a hand-built one is not a validated one.
      if (env.transform === undefined) {
        throw new NotAnEnvelope('typed pool: this pool`s type names no worker, so the envelope must carry a transform — ' +
          'there is nothing else for the task to do (FD-V46 refuses such a node at construction)');
      }
      return await this.transform(env.transform, env.input, env.settings);
    }
    const input = env.transform === undefined ? env.input : await this.transform(env.transform, env.input, env.settings);
    return await this.inner!.run({ settings: env.settings, input }, context);
  }

  /** Evaluates one declared transform; every failure is a `TransformFailed` naming what failed and why. */
  private async transform(t: Transform, input: unknown, settings: Readonly<Record<string, unknown>>): Promise<unknown> {
    const compile = this.langs.get(t.lang);
    if (compile === undefined) {
      const carried = Object.keys(this.cfg.languages ?? {}).map((x) => `"${x}"`).join(', ') || 'no languages';
      throw new TransformFailed(t, undefined, `language "${t.lang}" is not loaded in this pool (the pool config carries ${carried}) — ` +
        'the bootstrap helper writes an adapter URL for a type some node of which declares a transform, and needs the flow and the languages to do it');
    }
    if (compile instanceof Error) {
      // The language was named and its module did not load in setup(): the task's failure, not
      // the worker's — the maintainer's choice at W61's stop-and-ask, see setup().
      throw new TransformFailed(t, undefined, `${compile.message} — every task transforming in "${t.lang}" on this worker fails with this until the pool is rebuilt`);
    }
    const key = JSON.stringify([t.lang, t.expr]);
    let compiled = this.compiled.get(key);
    if (compiled === undefined) {
      try {
        compiled = compile(t.expr);
      } catch (e) {
        // The worker half refusing what the registry half accepted at `new Driver` — the two
        // halves DISAGREE, which is Q264's shape and a task failure here rather than a silence.
        throw new TransformFailed(t, codeOf(e), `the worker half of "${t.lang}" refused the expression the registry half accepted: ${messageOf(e)}`);
      }
      if (typeof compiled?.evaluate !== 'function') {
        throw new TransformFailed(t, undefined, `the worker half of "${t.lang}" compiled to ${brief(compiled)}, which has no evaluate(input, settings)`);
      }
      this.compiled.set(key, compiled);
    }
    try {
      return await compiled.evaluate(input, settings);
    } catch (e) {
      throw new TransformFailed(t, codeOf(e), messageOf(e));
    }
  }

  async teardown(): Promise<void> {
    await this.inner?.teardown?.();
    this.inner = null;
    // Reset with the rest, so a torn-down worker is in its CONSTRUCTED state and not in the
    // transform-only one — otherwise `run()` after `teardown()` would take the no-inner arm instead of
    // the refusal, which is the same conflation `setup()`'s comment is about.
    this.noInner = false;
    // And the remembered failure with them (W141): a torn-down worker is in its CONSTRUCTED state, so
    // `run()` after `teardown()` is refused as before rather than failing with a stale setup error.
    this.setupFailure = null;
    this.langs.clear();
    this.compiled.clear();
  }
}
