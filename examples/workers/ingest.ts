/**
 * **`ingest` — the entry worker: it reports the confidence it was handed.** One module, one class,
 * one default export; the node type `IngestWorker` in `examples/registry.json` names it.
 */
import { confidenceOf, type Envelope, FlowWorker } from './shared.ts';

export default class IngestWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    return { confidence: confidenceOf(envelope.input) };
  }
}
