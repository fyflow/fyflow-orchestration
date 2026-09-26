/**
 * **`download` — the FETCH half of P24's TV-series ingest, and it calls nothing external.**
 *
 * [W94](../../doc/work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md). A `map` over files opens one
 * branch per file and this is its entry: it takes the file the map handed it and returns what a fetch would — the
 * name, its size, and where the bytes now are. Ladder L6 runs offline and in two runtimes, so the "fetch" is the
 * file description it was given, made into a local path; P18's `fetch` worker is the same decision one plan earlier
 * (W67's stop-and-ask 3: *the sample's workers are REAL modules that compute*).
 *
 * **It is not where the series is known.** The series comes from `identify`, which PARSES it out of the name — P24's
 * *fetching and processing each file is what assigns its series*. So a gate keyed on `series.id` is keyed on a value
 * a worker computed in the same branch, which is the case the gate exists for: a branch cannot see its siblings.
 *
 * Its delay is the type's `delayMs`, the SAME for every file, so the download pool settles in dispatch order and the
 * order the gate sees is decided by `identify` alone — the arrangement lives in one worker, not two.
 */
import { type Envelope, FlowWorker } from './shared.ts';

export default class DownloadWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    const file = (envelope.input ?? {}) as { name?: unknown; sizeMB?: unknown };
    const name = typeof file.name === 'string' ? file.name : '';
    const sizeMB = typeof file.sizeMB === 'number' ? file.sizeMB : 0;
    return { name, sizeMB, path: `cache/${name}` };
  }
}
