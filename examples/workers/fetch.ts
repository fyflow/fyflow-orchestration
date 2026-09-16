/**
 * **The sample's entry worker — P18's `fetch`, and it calls NOTHING external.**
 *
 * The plan's sample worker calls `callModel(...)`, which is not a thing this repository has and
 * could not be: ladder L6 runs offline, deterministically, in two runtimes, and a worker that
 * reached the network would make every row a claim about somebody else's service. **W67's
 * stop-and-ask 3, answered by the maintainer: the sample's workers are REAL modules that compute.**
 * This one stands in for the fetch: it takes the `url` it was given and produces the document at it,
 * which here is the text the run was started with.
 *
 * Its worker entry declares an `outputSchema` requiring `text` and NO `configSchema` and NO
 * `settingsSchema` — P18 decision 3's *an absent schema means UNCHECKED*, which is why this worker
 * exists in the sample at all: `Fetch` is the type that proves the absent case is a case.
 */
import { confidenceOf, type Envelope, FlowWorker } from './shared.ts';

export default class FetchWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    const input = (envelope.input ?? {}) as { url?: unknown; text?: unknown };
    return {
      url: typeof input.url === 'string' ? input.url : null,
      text: typeof input.text === 'string' ? input.text : '',
      // Carried through, because the sample's decision edge reads it off `classify`'s result and
      // `classify` reads it from here — one payload decides which road the run takes.
      confidence: confidenceOf(envelope.input),
    };
  }
}
