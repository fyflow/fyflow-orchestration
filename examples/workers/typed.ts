/**
 * **`typed` — the worker a node TYPE runs, and the one that reads BOTH halves of the envelope**
 * — W59, `FD-C5`. The `Scorer` type names it.
 *
 * `settings` is the node's own declaration (its own copy — a write here reaches no sibling), `input`
 * is what an untyped node in the same position would have received whole. Four things are observable
 * and each is a claim:
 *
 *   - `keys` is the envelope's key set — exactly `['input', 'settings']`, or the driver wrapped more
 *     or less than the rule says (W43's `weigh` reasoning, one rule over);
 *   - `score` is `confidence * settings.factor`, so two nodes of ONE type with DIFFERENT settings
 *     return DIFFERENT answers from the same input — P16's exit artifact's pair;
 *   - `retried` is true only on a SECOND attempt, and the first is thrown away when
 *     `settings.failFirst` says so — the retry that runs under the TYPE's policy, with
 *     `thrownOnce`'s per-process memo, so the pool must be inline;
 *   - `items` is echoed when the input carries an array of them, so a typed node can feed a `map`
 *     inside a fanout branch — the nested shape obligation (a) asks for.
 */
import { confidenceOf, type Envelope, FlowWorker, thrownOnce } from './shared.ts';
import type { TaskWorkerContext } from 'fyflow-scheduler';

export default class TypedWorker extends FlowWorker {
  protected compute(envelope: Envelope, context?: TaskWorkerContext, raw?: unknown): unknown {
    const settings = envelope.settings as { factor?: unknown; failFirst?: unknown };
    const id = context?.taskId ?? '';
    const failFirst = settings.failFirst === true;
    if (failFirst && !thrownOnce.has(id)) {
      thrownOnce.add(id);
      throw new Error(`typed worker: first attempt of ${id} fails on purpose (settings.failFirst)`);
    }
    const c = confidenceOf(envelope.input);
    const factor = typeof settings.factor === 'number' ? settings.factor : 0;
    const inputItems = (envelope.input as { items?: unknown } | null | undefined)?.items;
    return {
      // **Read off the RAW envelope, not off `envelopeOf`'s normalisation** — the whole point of the
      // clause: a driver that wrapped a THIRD key must show up here, and a key set computed from a
      // literal or from a normalised two-key object could never say so.
      keys: Object.keys((raw ?? {}) as Record<string, unknown>).sort(),
      // **A SECOND, INDEPENDENT expression over the same fact** — obligation (c)'s LIMIT, and W43's
      // answer on `weigh` one worker over. `keys` alone had ONE observer: re-sourced to the literal
      // `['input', 'settings']` it cost ZERO, because that is what every row compares it against
      // (rule 8, `c6`, an undeclared survivor of this item's author pass). This is the NEGATIVE
      // form — what should NOT be here — so a wrapper that handed a third key is red on a value the
      // row can pin without restating the declaration, and a probe re-sourcing either reading
      // leaves the other live.
      extraKeys: Object.keys((raw ?? {}) as Record<string, unknown>).filter((k) => k !== 'input' && k !== 'settings').sort(),
      settingsKeys: Object.keys(settings).sort(),
      confidence: c,
      factor,
      score: Math.round(c * factor),
      retried: failFirst && thrownOnce.has(id),
      ...(Array.isArray(inputItems) ? { items: inputItems } : {}),
    };
  }
}
