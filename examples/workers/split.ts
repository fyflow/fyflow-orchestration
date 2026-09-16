/**
 * **`split` — where a map's ARITY comes from** — W35, and the whole of what ladder L6 adds to
 * [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md)'s fixtures.
 *
 * The number of tasks the run dispatches is `items.length`, and that number appears in **no** field
 * of the flow definition and in **no** constant in the harness: the definition says `over: "items"`
 * and nothing about how many, and `examples/l6.ts` declares the ids it EXPECTS, which is what makes
 * a miscount a failure rather than a silent re-plan. A `fanout` cannot reach this shape — `FD-V9`
 * requires its branch entries to be written down.
 *
 * One item per word, each carrying a different confidence from its own word's length, memoised per
 * word: see `memoisedItems` in `./shared.ts` for why both halves of that matter.
 */
import { confidenceOf, type Envelope, FlowWorker, memoisedItems, wordsOf } from './shared.ts';

export default class SplitWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    return {
      confidence: confidenceOf(envelope.input),
      items: memoisedItems(wordsOf(envelope.input)),
    };
  }
}
