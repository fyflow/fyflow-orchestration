/**
 * **`fyflow-orchestration/jsonata` — the JSONata language adapter, BOTH halves in ONE module** —
 * [W62](../../doc/work-items/w62-the-jsonata-adapter.md),
 * [ADR 0052](../../doc/decisions/0052-a-second-dependency-is-declared-where-its-one-sub-path-is-reached.md),
 * [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
 * rules 2 and 6, [P17](../../doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)
 * decisions 2, 3, 6, 7 and 10.
 *
 * A language adapter is `{ compile, worker, check? }` (`Registry.languages`, `spec/flow-definition.md`
 * section 2's `transform` subsection): **`compile`**, the registry half, runs on the main thread at
 * `new Driver`, returns nothing and THROWS on an expression JSONata refuses — what `FD-V36` reports,
 * with JSONata's own `code` (`S0203`), `position` and message; **`worker`**, the worker half, is the
 * URL of a module whose DEFAULT export compiles the same text and evaluates it, which the envelope
 * worker loads in `setup()` — a URL rather than a function because a function cannot cross to a
 * thread and a URL can (P17 fact 7). **This module is both halves**: `jsonata.worker` is its own
 * `import.meta.url`, so a consumer who imports the sub-path holds the registry half and the worker
 * half from ONE file and ONE copy of the engine, and the two cannot disagree the way two modules
 * can ([Q264](../../doc/questions/q264.md)). The default export is the worker half; the named export
 * `jsonata` is the adapter.
 *
 * **What the expression sees** (P17 decision 7): `$` is the node's `input` — the value it receives,
 * whichever of `FD-C5`'s four kinds it is — and the node's effective settings are bound as
 * **`$settings`**. **What it may NOT see** (P17 decision 6, ADR 0051 rule 6): `$now()`, `$millis()`
 * and `$random()` are shadowed on EVERY compiled expression with a function that throws naming
 * them — a transform is a function of what the run produced, because run state is a fold of the
 * log and a transform that read the clock would make two folds of one log disagree. The shadow is
 * per compiled expression (`registerFunction` on the compiled object), so a fresh compile of the
 * same text elsewhere is unaffected, and it reaches `$eval` — a run-time re-compile inside the
 * expression sees the same frame (P17 fact 3, re-measured here).
 *
 * **JSONata throws PLAIN OBJECTS, not `Error` instances** — `{ code, position, token, value,
 * message, stack }` from both `jsonata(expr)` and `evaluate()` (measured at W62's declaration, both
 * runtimes). The envelope worker's `TransformFailed` and the conformance suite both read
 * `instanceof Error`, so both halves re-throw as a real `Error` carrying the same fields; nothing
 * about the message, the code or the position is changed.
 *
 * `check` is ABSENT: P18's pre-flight hook, optional by the interface and implemented by nothing
 * (P17 decision 10).
 *
 * Imports the engine by the bare specifier `jsonata` and nothing else — `RT-R12`, `S14`: this
 * directory is the ONE place in the published source that may. The pure entry and the scheduler
 * sub-path load no engine (ADR 0049 rule 5's shape, one sub-path over).
 */
import engine from 'jsonata';
import type { LanguageAdapter } from '../definition/types.ts';

/**
 * The names this adapter unbinds, BY NAME, without the `$`. The first three are P17 decision 6's
 * and every adapter's — the list the conformance suite asserts. **`shuffle` is JSONata's own
 * fourth**: `$shuffle` draws from `Math.random()` (its source, an inside-out Fisher-Yates), so two
 * evaluations of one expression over one input differ — found by W62's walk of the engine's
 * static frame before its probe was written, which REVERSES P17 prediction 4 exactly as that row
 * said it would: the list grows, and the rule (*a transform is a function of what the run
 * produced*) was right to be stated as a property rather than as three names. **`eval` is unbound
 * for a DIFFERENT reason** — the maintainer's answer to [Q265](../../doc/questions/q265.md) at
 * W62: `$eval` re-compiles its argument at RUN time, so a syntax error inside it would land as a
 * task failure (`D3120`) that `FD-V36` never saw; a transform is declared text refused at
 * construction, and `$eval` is the one door that recompiles text the validator never read. What a
 * consumer loses is expression text built at run time, for which JSONata offers `$lookup`.
 */
export const UNBOUND_FUNCTIONS: readonly string[] = ['now', 'millis', 'random', 'shuffle', 'eval'];

/** A JSONata error, re-thrown as an `Error` with the engine's own fields kept. */
export interface JsonataError extends Error {
  /** The engine's code: `S0203` for a parse error, `T0412`/`T2002` for a type error at evaluation, `D3120` for a syntax error inside `$eval`, `UNBOUND` for a shadowed name. */
  code?: string;
  /** Character offset in the expression, where the engine sets one. */
  position?: number;
  token?: unknown;
  value?: unknown;
}

/** What the worker half's `compile` returns: one compiled expression, evaluated with `$` the input and `$settings` bound. */
export interface CompiledExpression {
  evaluate(input: unknown, settings: Readonly<Record<string, unknown>>): Promise<unknown>;
}

const CARRIED = ['code', 'position', 'token', 'value'] as const;

/** JSONata's thrown object as an `Error`, its fields carried; an `Error` is returned as it is. */
function asError(e: unknown): JsonataError {
  if (e instanceof Error) return e as JsonataError;
  const o = (typeof e === 'object' && e !== null ? e : {}) as Record<string, unknown>;
  const err = new Error(typeof o.message === 'string' && o.message.length ? o.message : String(e)) as JsonataError;
  for (const k of CARRIED) if (k in o) (err as unknown as Record<string, unknown>)[k] = o[k];
  return err;
}

/**
 * **JSONata MARKS the arrays it builds** — a path result is a *sequence*, an array carrying its own
 * enumerable `sequence: true` (and `keepSingleton: true` for `[]`-kept paths), at the top level and
 * NESTED inside a constructed object (measured at W62: `{ "scores": *.score }` carries it one level
 * down). `JSON.stringify` never shows it; `structuredClone` KEEPS it, so a threaded worker receives
 * it; and any deep-equal over own keys — the harness's, Node's `assert.deepStrictEqual` — reports
 * `[40, 20]` unequal to `[40, 20]`. So the worker half hands out a PLAIN value: every marked array
 * rebuilt without its markers, everything else untouched, and the original returned when nothing
 * was marked — one traversal, no allocation on the common reduction to a scalar.
 */
const MARKERS = ['sequence', 'keepSingleton', 'tupleStream'] as const;
function plain(v: unknown): unknown {
  if (Array.isArray(v)) {
    const marked = MARKERS.some((m) => Object.prototype.hasOwnProperty.call(v, m));
    let changed = marked;
    const out = v.map((x) => { const y = plain(x); if (y !== x) changed = true; return y; });
    return changed ? out : v;
  }
  if (typeof v === 'object' && v !== null) {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) { const y = plain(x); if (y !== x) changed = true; out[k] = y; }
    return changed ? out : v;
  }
  return v;
}

function unbound(name: string): () => never {
  return () => {
    const err = new Error(`$${name}() is unbound in a transform — a transform is a function of what the run produced (ADR 0051 rule 6)`) as JsonataError;
    err.code = 'UNBOUND';
    throw err;
  };
}

/** The REGISTRY half: synchronous, returns nothing, throws JSONata's own error as an `Error` — `FD-V36`'s detail. */
export function compile(expr: string): void {
  try {
    engine(expr);
  } catch (e) {
    throw asError(e);
  }
}

/**
 * The WORKER half, and this module's default export: compiles once, shadows the unbound names on
 * THIS compiled expression, and evaluates with `$` the input and `$settings` bound. A rejection is
 * JSONata's own error as an `Error`, which the envelope worker reports as `TransformFailed`
 * carrying the engine's code.
 */
export default function compileExpression(expr: string): CompiledExpression {
  let compiled: ReturnType<typeof engine>;
  try {
    compiled = engine(expr);
  } catch (e) {
    throw asError(e);
  }
  for (const name of UNBOUND_FUNCTIONS) compiled.registerFunction(name, unbound(name));
  return {
    async evaluate(input: unknown, settings: Readonly<Record<string, unknown>>): Promise<unknown> {
      try {
        const result = await compiled.evaluate(input, { settings });
        // The input itself carries no marker of the engine's; `$` and every path that returns the
        // input whole skip the scan — measured at W62 as the whole of the identity's cost.
        return result === input ? result : plain(result);
      } catch (e) {
        throw asError(e);
      }
    },
  };
}

/** The adapter a registry carries under `languages: { jsonata }`. Both halves are this module. */
export const jsonata: LanguageAdapter = { compile, worker: import.meta.url };
