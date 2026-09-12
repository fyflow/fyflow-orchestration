/**
 * **The envelope worker — what the bootstrap helper puts around a node type's own worker** —
 * `spec/flow-definition.md` section 2 (v0.17) and `FD-C5`,
 * [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md)
 * rule 4, [W59](../../doc/work-items/w59-what-a-node-type-is.md).
 *
 * A `WorkerManager` loads its worker from a script URL and instantiates the module's default
 * export, so a wrapper cannot be a function around a class — it has to BE the script the pool
 * loads. This module is that script: its pool config names the type's real worker (`worker`, a
 * module URL) and that worker's own config (`config`), and this class loads the inner worker in
 * `setup()`, hands it **exactly `{ settings, input }`** in `run()`, and tears it down with itself.
 *
 * **Why it exists in W59 at all, when the driver already dispatches the envelope.** Two reasons,
 * one now and one next. Now: it is the ONE place a typed pool's contract is enforced at run time —
 * a payload that is not an envelope (a bare `workerType` node naming the type's pool, which
 * `FD-V34` refuses at construction and a consumer's hand-built spread cannot see) is a task failure
 * naming the pool rather than a worker reading `undefined`, measured at W59's declaration. Next:
 * [P17](../../doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)'s
 * transform is evaluated HERE, inside an async `run()`, because the driver dispatches inside a
 * scheduler listener with no `await` ([Q251](../../doc/open-questions.md)) — so `run()` hands the
 * inner worker the two keys and no others, by design, and a third key the driver may one day add
 * is this class's to consume.
 *
 * Imports nothing from the scheduler, so a thread loading it resolves nothing but itself and the
 * inner worker's URL; `RT-R9` — no parameter properties, no `enum` — because Node loads this by
 * stripping types.
 */

/** The pool config the bootstrap helper writes for a typed pool: the inner worker and ITS config. */
export interface EnvelopePoolConfig {
  /** Module URL of the type's real worker; its default export is the class. `NodeType.worker`. */
  worker: string;
  /** The inner worker's own constructor argument. `NodeType.config`. */
  config?: unknown;
}

/** What a typed node's worker receives — `FD-C5`. */
export interface Envelope {
  settings: Readonly<Record<string, unknown>>;
  input: unknown;
}

/** A typed pool was handed something that is not an envelope. A task failure, never a run refusal. */
export class NotAnEnvelope extends Error {}

/**
 * **`FD-C5`'s shape check, and the only unpacking there is.** Accepts an object carrying BOTH keys
 * — `input` may hold `undefined`, because a node's input may be anything a worker returned, so
 * presence is decided by `in` and not by value — with `settings` a plain object, and returns a
 * fresh object of exactly the two, dropping anything beside them (see the header: a third key is
 * the wrapper's to consume, never the inner worker's to see).
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
  return { settings: settings as Readonly<Record<string, unknown>>, input: p.input };
}

function brief(v: unknown): string {
  let s: string;
  try { s = JSON.stringify(v) ?? String(v); } catch { s = String(v); }
  return s.length > 120 ? `${s.slice(0, 117)}...` : s;
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
   * Both arguments are kept, and the second is forwarded to the inner worker: the scheduler passes
   * its worker-level context here, and a worker that only accepts `config` silently loses the
   * ability to self-terminate (the scheduler's own reference, §4).
   */
  constructor(config: EnvelopePoolConfig, workerContext?: unknown) {
    this.cfg = config;
    this.workerContext = workerContext;
  }

  /** Loads the type's worker and runs ITS setup. A module with no default class is refused by name. */
  async setup(): Promise<void> {
    if (typeof this.cfg?.worker !== 'string' || this.cfg.worker.length === 0) {
      throw new Error(`envelope worker: the pool config names no worker URL — got ${brief(this.cfg)}`);
    }
    const mod = (await import(this.cfg.worker)) as { default?: unknown };
    if (typeof mod.default !== 'function' || !(mod.default as { prototype?: unknown }).prototype) {
      throw new Error(`envelope worker: ${this.cfg.worker} must export a default class`);
    }
    const Inner = mod.default as new (config: unknown, workerContext?: unknown) => InnerWorker;
    this.inner = new Inner(this.cfg.config ?? {}, this.workerContext);
    await this.inner.setup?.();
  }

  /** `FD-C5`: the inner worker receives `{ settings, input }` and nothing else. */
  async run(payload: unknown, context?: unknown): Promise<unknown> {
    if (this.inner === null) throw new Error('envelope worker: run() before setup() — the inner worker is not loaded');
    const { settings, input } = unpackEnvelope(payload);
    return await this.inner.run({ settings, input }, context);
  }

  async teardown(): Promise<void> {
    await this.inner?.teardown?.();
    this.inner = null;
  }
}
