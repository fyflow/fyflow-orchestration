/**
 * **`thumbnail` — the work that runs for EVERY file, beside the gate.**
 *
 * [W94](../../doc/work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md). P24's exit artifact says
 * *thumbnails running beside it*: the gate drops every file but the first of each series, and a thumbnail is owed to
 * all of them. So this is the other branch of a `fanout` inside the map's branch — it never reaches the gate, and the
 * per-file join fires on its arrival whatever the gate decided for the file's other branch.
 */
import { type Envelope, FlowWorker } from './shared.ts';

export default class ThumbnailWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    const file = (envelope.input ?? {}) as { name?: unknown };
    const name = typeof file.name === 'string' ? file.name : '';
    return { name, thumbnail: `thumbs/${name.replace(/\.[^.]*$/, '')}.jpg` };
  }
}
