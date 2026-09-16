/**
 * **`echo` — the worker a node TYPE runs when the claim is WHAT ARRIVED — W63, `FD-C6`.** The `Echo`
 * type names it, and that type is THREADED on purpose.
 *
 * The value it receives is the envelope the wrapper hands its inner worker AFTER evaluating a
 * declared `transform`: `{ settings, input }` with `input` REPLACED by the expression's result
 * (ADR 0051 rule 3) — a number for a reduction over a join's record, a reshaped object for a map
 * instance's item — and no third key. Five things are observable and each is a separate claim, so a
 * row reads the value and never a projection of it:
 *
 *   - `keys` is the envelope's key set, exactly `['input', 'settings']` — the wrapper hands the
 *     inner worker two keys and consumes `transform` — and it is read off the RAW value, so a
 *     driver that wrapped a third key is red rather than invisible;
 *   - `inputType` is a second, independent expression over the same value (obligation (c)'s LIMIT):
 *     a reduction over an empty record is the NUMBER 0 where the other spelling is `undefined` —
 *     [Q263](../../doc/open-questions.md)'s third arity, told apart by TYPE rather than by equality
 *     against zero;
 *   - `markedKeys` walks the input and lists, at every depth, any own key on an ARRAY that is not an
 *     index. JSONata marks the arrays it builds and the adapter hands out plain values (ADR 0052
 *     rule 6); a deep-equal over JSON text cannot see a marker, so this is the L6 observer that
 *     makes reverting W62 cost something — and `arrays` is how many arrays that walk REACHED, the
 *     second expression over the same walk, because rule 8 measured a walk that stopped at the top
 *     level surviving with the markers kept;
 *   - `realm` is whether this worker shares the harness's global object — W62's second observer of a
 *     backend, one rung up: `run-flow.ts` marks its own realm, an inline worker sees the mark and a
 *     thread does not. The `Echo` pool is declared threaded so the adapter's worker half is loaded
 *     by URL in a fresh realm (ADR 0051 rule 2's ground);
 *   - `input` is the value itself, so the row says WHAT the worker received — from the run.
 */
import { type Envelope, FlowWorker, markedKeysOf } from './shared.ts';

export default class EchoWorker extends FlowWorker {
  protected compute(envelope: Envelope, _context?: unknown, raw?: unknown): unknown {
    const walk = markedKeysOf(envelope.input);
    return {
      keys: Object.keys((raw ?? {}) as Record<string, unknown>).sort(),
      // **A SECOND, INDEPENDENT expression over the same fact** — obligation (c)'s LIMIT, and W43's
      // answer on `weigh` one worker over. `keys` alone had ONE observer: re-sourced to the literal
      // `['input', 'settings']` it cost ZERO, because that is what every row compares it against
      // (rule 8, `c6`, an undeclared survivor of this item's author pass). This is the NEGATIVE
      // form — what should NOT be here — so a wrapper that handed a third key is red on a value the
      // row can pin without restating the declaration, and a probe re-sourcing either reading
      // leaves the other live.
      extraKeys: Object.keys((raw ?? {}) as Record<string, unknown>).filter((k) => k !== 'input' && k !== 'settings').sort(),
      settingsKeys: Object.keys(envelope.settings).sort(),
      inputType: Array.isArray(envelope.input) ? 'array' : envelope.input === null ? 'null' : typeof envelope.input,
      markedKeys: walk.marked,
      arrays: walk.arrays,
      realm: typeof (globalThis as { __L6_HARNESS_REALM__?: unknown }).__L6_HARNESS_REALM__ !== 'undefined' ? 'harness' : 'thread',
      input: envelope.input,
    };
  }
}
