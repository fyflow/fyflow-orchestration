/**
 * **`shard` — the per-item list a SECOND map opens over, and the one worker
 * [P22](../../doc/plans/p22-what-a-regions-identity-is.md) stop-and-ask (c) grants.**
 *
 * A `map` region's branch entry is a TASK — or, since `spec/flow-definition.md` v0.42, an `ask`, whose output is
 * a person's answer rather than a list this example could compute (W182) — and a map's `over` names a key of what the previous node
 * returned — so *score each item, then fan out per item* needs a node between the two maps whose
 * output carries a list PER ITEM. `split` cannot be that node: it reads `payload.text` through
 * `wordsOf` and a map item is `{ word, confidence }` from `memoisedItems`, so `split` over an item
 * returns an EMPTY list and
 * [`spec/join-policy.md`](../../spec/join-policy.md) section 5 makes the inner region `stuck`. That
 * is the measurement the plan's stop-and-ask records, and it is why the grant exists.
 *
 * **The grant was USED, and the answer to *was it* is this file.** P21 granted the same permission
 * and [W81](../../doc/work-items/w81-what-a-settlement-costs.md) measured it UNUSED, which is what
 * made recording it worthwhile; this is the other outcome.
 *
 * **What it computes**: one shard per character of the item's word, each carrying the confidence its
 * own letter stands for — `a` is 0.1 and `j` is 1.0, a letter outside `a`-`j` is 1.0 — so a word
 * chooses BOTH the inner region's arity and each inner branch's score, from data, in one value. That
 * is what makes the two instances of the inner opener differ in width AND in road, which is what a
 * per-instance key is for.
 *
 * **`msPerChar` is an ARRANGEMENT and it is declared as one**, on the precedent
 * `examples/registry.json` already sets by giving `ReviewWorker`, `ExtractWorker` and `MergeWorker`
 * four times everyone else's `delayMs` so that a branch which must settle LAST does. Here the work
 * is proportional to the item being split, so a SHORTER word's shards open their region first — and
 * `examples/l6.ts` asserts the arrangement's EFFECT rather than trusting it
 * ([W17](../../doc/work-items/w17-the-all-exit-row-at-l6.md)'s `joinSettledBy`: *the row that exists
 * to reach a path stopped reaching it, silently, on a one-word edit to a different file*).
 *
 * It declares **no `configSchema`**, so `npm run check:workers` constructs it from `{}` and
 * `msPerChar` is 0 there: the conformance check runs the worker's ANSWER and must not pay for an
 * arrangement that only a run needs.
 */
import { type Envelope, FlowWorker } from './shared.ts';
import type { BaseWorkerContext, WorkerConfig } from 'fyflow-scheduler';

/**
 * **The confidence a letter stands for** — `a` is 0.1 through `j` is 1.0, and anything else is 1.0.
 *
 * Total, for the reason `confidenceOf` is: a worker that throws on a shape hides the routing bug it
 * would otherwise report. The scale is what lets one word's shards route down the `isLowScore` edge
 * (`score < 50`) and another word's not, which is the flow's whole discriminator — and it is a
 * property of the DATA, so the row's two payloads differ in their text and in nothing else.
 */
export function shardConfidence(ch: string): number {
  const i = 'abcdefghij'.indexOf(ch);
  return i < 0 ? 1 : Math.round((i + 1) * 10) / 100;
}

export default class ShardWorker extends FlowWorker {
  private readonly msPerChar: number;

  constructor(config: WorkerConfig = {}, workerContext?: BaseWorkerContext) {
    super(config, workerContext);
    const c = config as { msPerChar?: unknown };
    this.msPerChar = typeof c.msPerChar === 'number' ? c.msPerChar : 0;
  }

  protected async compute(envelope: Envelope): Promise<unknown> {
    const item = envelope.input as { word?: unknown } | null | undefined;
    const word = typeof item?.word === 'string' ? item.word : '';
    if (this.msPerChar > 0 && word.length > 0) {
      await new Promise((r) => setTimeout(r, this.msPerChar * word.length));
    }
    return {
      word,
      shards: [...word].map((ch) => ({ shard: ch, confidence: shardConfidence(ch) })),
    };
  }
}
