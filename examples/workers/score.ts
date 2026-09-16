/**
 * **`score` — a score derived from the payload alone**, so the result is a function of the input and
 * the run is reproducible. The node type `ScoreWorker` names it, and that is the pool this rung runs
 * on real THREADS when a row asks (`Expectation.threaded`): it is the one place two tasks are in
 * flight at once, so it is where a dispatch race or an id collision would show.
 */
import { confidenceOf, type Envelope, FlowWorker } from './shared.ts';

export default class ScoreWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    const c = confidenceOf(envelope.input);
    return { confidence: c, score: Math.round(c * 100) };
  }
}
