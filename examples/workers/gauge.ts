/**
 * **`gauge` — a bound its own code does not keep past its declared domain, written DELIBERATELY.**
 *
 * This is [Q302](../../doc/open-questions.md)'s shape reconstructed, and it is here because
 * [P21](../../doc/plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md) fact 3 measured
 * that the corpus has none left: `split`'s per-item confidence was clamped in the code by W73 and
 * `weigh`'s score is refused at the entry boundary by `FD-R4`, so the feature
 * [ADR 0060](../../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md)
 * decides had **no live defect to point at** and W82 had to build one. *A check written for a
 * defect you have just fixed has no live case* — P8, arriving before the item rather than in its
 * Record.
 *
 * **What it computes.** `load` is how full a batch is against a ten-word budget, so an author
 * writes `maximum: 1` in the schema because a fraction of a budget is a fraction. The code divides
 * and never clamps. **Every value in its declared example conforms** — two words is `0.2` — and
 * eleven words is `1.1`, which is the same arithmetic and the same off-by-a-domain that
 * `word.length / 10` had at an eleven-LETTER word.
 *
 * **What this is evidence FOR is what nothing else can see.** `npm run check:workers` runs this
 * worker on its declared input example and its verdict is GREEN, because one example confirms a
 * schema at ONE value; `checkWiring` reads the two SCHEMAS and calls every arc of the flow `fits`.
 * Neither is wrong and neither can see this, which is `OR-R13`'s whole capability half and
 * Q302's own closing sentence: *a bound a producer does not keep is invisible to its own check and
 * visible at every consumer's.*
 *
 * **It is not clamped, and that is the point rather than an oversight.** `shared.ts`'s
 * `memoisedItems` carries the opposite decision — the maintainer's answer to W73's stop-and-ask 4,
 * *the code keeps the bound the corpus declares* — with a comment naming Q302. The two sit beside
 * each other on purpose: one worker takes each road, and the row in `examples/l6.ts` is what says
 * the second is reported.
 */
import { type Envelope, FlowWorker, wordsOf } from './shared.ts';

/** The budget `load` is a fraction OF, and the only reason `maximum: 1` is a plausible thing to declare. */
const BUDGET = 10;

export default class GaugeWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    const words = wordsOf(envelope.input);
    return { words: words.length, load: words.length / BUDGET };
  }
}
