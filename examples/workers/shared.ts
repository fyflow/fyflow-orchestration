/**
 * **What every worker module here shares, and nothing else** — ladder L6, `RT-R10`, W67.
 *
 * Until W67 there was ONE worker file with a twelve-arm `switch` over a `role` its pool's config
 * carried, because `examples/run-flow.ts` built thirteen pools by hand and thirteen near-identical
 * files was the alternative. **A registry document removes the reason**: a worker entry is a URL and
 * a set of schemas, a node type NAMES one, and two types over one worker are two pools (P18 fact 3)
 * — so each worker here is its own module, its own class and its own default export, which is the
 * scheduler's own contract (`AGENTS.md` §3) and what P18's sample writes.
 *
 * **What went with the switch**: `ROLES`, the `Role` union, and the three lists `examples/l6.ts`
 * compared both ways since W47 — a role a pool invented was a typecheck failure and a role `ROLES`
 * declared with no arm cost 2 there. **The document is the binding now, and it is stronger**: a node
 * type names a worker KEY (`WorkerMissing` at construction, by name), a worker entry names a URL,
 * and `l6.ts` compares the document's worker keys to the modules ON DISK both ways. A key with no
 * module is red before a pool is built; a module no entry names is red in the same clause.
 *
 * **Every worker's `run()` receives the ENVELOPE `{ settings, input }`** — `FD-C5`, and universally
 * since W65 (ADR 0054), because the package's envelope worker fronts every pool and there is no bare
 * road left. Most of these read only `input`, which is exactly the object they read as their whole
 * payload before W65; `TypedWorker` and `EchoWorker` read both halves by name, and say why.
 *
 * **A worker computes and does not route** ([ADR 0001](../../doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
 * rule 2). `context.taskId` is available and exactly two modules read it — `retry.ts` and `typed.ts`,
 * to remember which ATTEMPT this is — and neither derives an output from it.
 *
 * **Node runs TypeScript by ERASING types**, so nothing here may use syntax stripping cannot remove
 * — no parameter properties, no `enum`, no namespaces (`RT-R9`). P18's own sample shim breaks that
 * rule in its `DailyBudgetGroup`, measured at this item's declaration step; the version in
 * `run-flow.ts` is written long-hand.
 */
import { BaseWorker } from 'fyflow-scheduler';
import type { BaseWorkerContext, TaskWorkerContext, WorkerConfig } from 'fyflow-scheduler';

/** What the entry payload carries, and what every hop passes along. */
export interface Confidence {
  confidence: number;
}

/** The envelope every typed pool's worker receives — `FD-C5`, and since W65 that is every pool. */
export interface Envelope {
  settings: Record<string, unknown>;
  input: unknown;
}

/**
 * **The base every worker module here extends: the delay, and the envelope's two halves.**
 *
 * `delayMs` is the TYPE's config, declared in `examples/registry.json` — a real `await`, so two
 * fan-out branches genuinely overlap and their completion order is the scheduler's rather than this
 * file's. Nothing may depend on that order (`doc/concept.md` section 5). **The four-times delay a
 * worker that must settle LAST is given is in the DOCUMENT now** (`ReviewWorker`, `ExtractWorker`
 * and `MergeWorker` declare `delayMs: 20` against everyone else's `5`), where it was a
 * `SETTLES_LAST` set in the harness; `examples/l6.ts` reads the ratio off the document, so it is a
 * declared fact rather than a literal in two places. W17's adequacy reader measured the 4x inert and
 * [Q99](../../doc/open-questions.md) is the row; it is kept because the moment a pool becomes
 * threaded, dispatch order stops implying settle order.
 *
 * **`setup()` and `teardown()` are abstract on `BaseWorker` and omitting either is a compile
 * error**, so they are here once rather than in sixteen modules.
 *
 * **Both constructor arguments are forwarded** — dropping the second leaves `this.workerContext`
 * undefined and `terminateWithError()` silently does nothing (`AGENTS.md` §4).
 */
export abstract class FlowWorker extends BaseWorker {
  protected readonly delayMs: number;

  constructor(config: WorkerConfig = {}, workerContext?: BaseWorkerContext) {
    super(config, workerContext);
    const c = config as { delayMs?: unknown };
    this.delayMs = typeof c.delayMs === 'number' ? c.delayMs : 0;
  }

  async setup(): Promise<void> {}
  async teardown(): Promise<void> {}

  async run(envelope: unknown, context?: TaskWorkerContext): Promise<unknown> {
    if (this.delayMs > 0) await new Promise((r) => setTimeout(r, this.delayMs));
    return this.compute(envelopeOf(envelope), context, envelope);
  }

  /**
   * What this worker DOES, given the envelope the wrapper handed it.
   *
   * **`raw` is the value AS IT ARRIVED, and it is not decoration**: `envelopeOf` normalises, so a
   * worker reading its key set off the normalised object could never see a driver that wrapped a
   * THIRD key — the literal-re-sourcing defect W43's adequacy reader measured at eight failures.
   * `typed.ts` and `echo.ts` read `Object.keys(raw)` for exactly that claim.
   */
  protected abstract compute(envelope: Envelope, context?: TaskWorkerContext, raw?: unknown): unknown;
}

/**
 * **The envelope, read defensively and never rejected** — total for the reason `confidenceOf` is:
 * a worker that throws on a shape hides the routing bug it would otherwise report. `FD-C5` says the
 * wrapper hands `{ settings, input }`; a node that declares no `settings` has them arrive as `{}`.
 */
export function envelopeOf(v: unknown): Envelope {
  const e = (v ?? {}) as { settings?: unknown; input?: unknown };
  return {
    settings: (e.settings ?? {}) as Record<string, unknown>,
    input: e.input,
  };
}

/** Total, and it never throws: a worker that rejects on a shape is a worker that hides a routing bug. */
export function confidenceOf(payload: unknown): number {
  const c = (payload as Partial<Confidence> | null | undefined)?.confidence;
  return typeof c === 'number' ? c : 0;
}

/**
 * The words of `text`, and **total for the same reason `confidenceOf` is**.
 *
 * An empty string splits to a one-element array rather than an empty one, so the filter is what
 * makes *no text* mean *no items* — the arity `FD-V9`'s floor means the static feature can never
 * produce, and `FD-R2` says an empty array is not the refusal.
 */
export function wordsOf(payload: unknown): string[] {
  const t = (payload as { text?: unknown } | null | undefined)?.text;
  return (typeof t === 'string' ? t : '').split(' ').filter((w) => w.length > 0);
}

/**
 * **One item per word, each carrying a DIFFERENT confidence, and MEMOISED per word** — W35 and its
 * adequacy reader. Handed the whole value rather than its own item every map instance would compute
 * the same score and the row could not tell
 * [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
 * rule 3 from its negation; and the memo is what makes rule 1's *no two nodes ever receive the same
 * object* falsifiable at L6, since `structuredClone` preserves aliasing WITHIN one clone, so a
 * repeated word is two references to one object where distinct words are distinct objects.
 */
export function memoisedItems(words: readonly string[]): { word: string; confidence: number }[] {
  const seen = new Map<string, { word: string; confidence: number }>();
  return words.map((word) => {
    const hit = seen.get(word);
    if (hit) return hit;
    // **Clamped at 1 — W73.** Every input schema in the corpus that names a confidence bounds it
    // at 1, and the wiring check found this the one producer that did not keep it: an eleven-letter
    // word made 1.1, which W72 recorded as Q302 by dropping the bound. The maintainer's choice at
    // W73's stop-and-ask 4 is the other resolution — the code keeps the bound the corpus declares.
    const made = { word, confidence: Math.min(1, word.length / 10) };
    seen.set(word, made);
    return made;
  });
}

/**
 * **Every own key on every ARRAY reachable from `v` that is not an index, as `path:key` — and how
 * many arrays the walk reached** — W63's observer of ADR 0052 rule 6. JSONata marks a sequence it
 * builds with own `sequence` / `keepSingleton` keys; `structuredClone` keeps them across a thread
 * and `JSON.stringify` drops them, so a row comparing JSON text is blind to a marker that reached
 * the worker. `arrays` is the walk's own reach stated beside its finding, so a walk that stops
 * short reports fewer arrays rather than a clean list. Total and cycle-safe, like `confidenceOf`.
 */
export function markedKeysOf(v: unknown, path = '', seen = new Set<unknown>()): { marked: string[]; arrays: number } {
  if (typeof v !== 'object' || v === null || seen.has(v)) return { marked: [], arrays: 0 };
  seen.add(v);
  const marked: string[] = [];
  let arrays = 0;
  const into = (x: unknown, p: string) => { const r = markedKeysOf(x, p, seen); marked.push(...r.marked); arrays += r.arrays; };
  if (Array.isArray(v)) {
    arrays++;
    for (const k of Object.keys(v)) if (!/^\d+$/.test(k)) marked.push(`${path}:${k}`);
    v.forEach((x, i) => into(x, `${path}[${i}]`));
  } else {
    for (const [k, x] of Object.entries(v)) into(x, path ? `${path}.${k}` : k);
  }
  return { marked: marked.sort(), arrays };
}

/**
 * **The task ids a first-attempt-throwing worker has already thrown for, per PROCESS** — W58.
 * A retry is a second attempt of the SAME task id (`spec/flow-definition.md` section 2), so the memo
 * is keyed by the id and nothing else, and it is read to decide whether THIS attempt throws, never
 * to decide what is returned or where it goes (ADR 0001 rule 2). Per process, so a pool that uses it
 * must be **inline**: a thread torn down between attempts would forget, and the row would then
 * measure the pool's lifetime rather than the scheduler's retry.
 *
 * **One module-level set shared by the two modules that need it, keyed by task id.** Two pools never
 * mint the same task id (`ID-R1`), so one set is exactly as discriminating as two.
 */
export const thrownOnce = new Set<string>();
