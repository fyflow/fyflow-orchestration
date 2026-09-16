/**
 * **`weigh` — the worker that reads its DECLARED KEYS, and W43 exists because no shipped one did.**
 *
 * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
 * rule 6: a node that declares `needs` receives **exactly the object `needs` describes**, each key
 * its own copy. Every other worker here reads `input.confidence`, which under a `needs` is
 * `undefined` — so `map-with-context` ran end to end on real workers with all three instances
 * returning `{confidence: 0, score: 0}`, and the row could not tell rule 6 from its negation.
 *
 * **Three things are made observable and each is a separate rule:**
 *
 *   - `keys` is the input's own key set, which is **rule 6 itself**. Hand this node what its
 *     predecessor produced instead and the keys are `confidence, items`; hand it the whole value
 *     merged with its item and they are four. It is the one assertion here that fails on a driver
 *     that gives a node MORE than it asked for, which no count can see.
 *   - `score` is a function of **both** declared keys, so neither can be dropped for zero: `item` is
 *     the `"."` form (`FD-C1`, and ADR 0037 rule 3's *its own item*) and `run` is the node-id form
 *     resolved from outside the map region (`FD-C2`). The three instances return three DIFFERENT
 *     scores, which is W35's `text` reasoning one rule across.
 *   - `word` echoes the item's own field, so a driver handing every instance item 0 is a failure
 *     naming which item it got, rather than a number that happens to be equal.
 */
import { confidenceOf, type Envelope, FlowWorker } from './shared.ts';

export default class WeighWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    const p = (envelope.input ?? {}) as { item?: { word?: unknown; confidence?: unknown }; run?: unknown };
    const mine = typeof p.item?.confidence === 'number' ? p.item.confidence : 0;
    const theirs = confidenceOf(p.run);
    const seen = Object.keys((envelope.input ?? {}) as Record<string, unknown>);
    return {
      keys: seen.slice().sort(),
      // **A SECOND, INDEPENDENT reading of the same payload — W43's adequacy reader, BLOCKING.**
      // `keys` was the only thing anywhere that could observe a driver composing MORE than `needs`
      // describes, and a sensor cannot corroborate itself: re-sourcing it to the literal
      // `['item', 'run']` cost **0**, and with that literal in place a driver seeded with an extra
      // key cost 0 as well — where with `keys` live it costs 8. This is a different expression over
      // the same fact, so a probe that re-sources either one leaves the other live, and it is
      // deliberately the NEGATIVE form: what should not be here is what a superset makes true and an
      // exact match makes empty.
      extraKeys: seen.filter((k) => k !== 'item' && k !== 'run').sort(),
      word: typeof p.item?.word === 'string' ? p.item.word : null,
      confidence: mine,
      score: Math.round(mine * theirs * 100),
    };
  }
}
