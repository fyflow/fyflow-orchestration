/**
 * **`stamp` — a worker with no bug at all, whose result the RUN does not carry.**
 *
 * It returns exactly what its `outputSchema` declares: `words`, and a `label`. The label is
 * attached with `Object.defineProperty` so it stays out of the serialised payload — an ordinary
 * thing to want, and the reason `JSON.stringify` of what this returns prints `{"words":11}` while
 * `Object.getOwnPropertyNames` of the same object prints `["words","label"]`.
 *
 * **Both of those decisions are reasonable and together they produce a value the run does not
 * carry**, because `structuredClone` copies a value's own **enumerable** string-keyed data and
 * nothing else (`OR-R11`). So `OR-R2`'s clone drops the label, and the RECORD — the thing the next
 * node receives and the thing `RunState` holds — is missing a key its schema REQUIRES.
 *
 * **This is the half of `OR-R13` no authoring-time tool can reach, and the reason is structural
 * rather than an omission: none of them holds a record.**
 *
 *   - `npm run check:workers` runs this worker and validates what `run()` RETURNED. `required` is
 *     `Object.prototype.hasOwnProperty` (W65's conformity reader closed that gap from the other
 *     side, so that `in` could not walk the prototype), and a non-enumerable own property answers
 *     it. **Its verdict is GREEN.**
 *   - `checkWiring` reads the two SCHEMAS and never a value. Its verdict is `fits`.
 *   - `OR-R13` reads `record.result`, **after** the clone, and refuses it: `$.label required`.
 *
 * *The same schema, applied by two mechanisms to what is nominally one value, lawfully disagrees* —
 * [ADR 0060](../../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md)
 * decision 5, measured over seven shapes at W80's declaration step with three disagreeing, and this
 * is the first of the three to run on a real `FyflowScheduler`.
 *
 * **Its pool is INLINE and must be, for `tally.ts`'s reason one rule across.** A threaded pool
 * serialises a result at the thread boundary, so the label would be gone before the driver saw it
 * and the finding would still be reported — *the finding survives a thread and the ATTRIBUTION does
 * not*, and the attribution is the whole claim. Inline, the scheduler's own `detail.result` still
 * carries the label when it settles, which is what `examples/l6.ts` reads at its own listener as
 * the first of this row's three observers.
 */
import { type Envelope, FlowWorker } from './shared.ts';

export default class StampWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    const words = (envelope.input as { words?: unknown } | null | undefined)?.words;
    const n = typeof words === 'number' ? words : 0;
    const out: Record<string, unknown> = { words: n };
    // Kept out of the serialised payload on purpose — and therefore out of the CLONE, which is the
    // thing nobody writing these two lines is thinking about.
    Object.defineProperty(out, 'label', { value: `w${n}`, enumerable: false, writable: true, configurable: true });
    return out;
  }
}
