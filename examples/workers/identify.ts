/**
 * **`identify` — where a file's SERIES is assigned, and where P24's exit artifact ARRANGES the order the gate sees.**
 *
 * [W94](../../doc/work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md). It parses the series out of the
 * file name the way a TV library names its files — `Dark.S01E02.mkv` is series `dark`, episode `S01E02` — and a name
 * that carries no series (`trailer.mkv`) comes back with NO `series` key at all. That absence is what `distinct`'s
 * `nokey` route is for (P24 stop-and-ask (c)): the gate's key path `series.id` resolves to nothing, and the file is
 * dropped as unidentified rather than as a duplicate of "undefined".
 *
 * **`msPerMB` is an ARRANGEMENT and it is declared as one**, on `shard.ts`' precedent: identifying a file takes time
 * proportional to its size, so the row decides the order branches REACH the gate by the sizes it declares.
 * [Q379](../../doc/questions/q379.md) is why this exists: on an inline pool, *first to arrive* IS *lowest index*, so a
 * row that did not arrange the order could not tell a gate that keeps the first ARRIVAL from one that keeps the first
 * ITEM. **And the pool must be as wide as the map** — W94's declaration measured a serial pool running identify in
 * dispatch order whatever the delays, so `examples/registry.json` gives `Identify` eight threads.
 *
 * It declares **no `configSchema`**, so `npm run check:workers` constructs it from `{}` and `msPerMB` is 0 there: the
 * conformance check runs the worker's ANSWER and must not pay for an arrangement only a run needs.
 *
 * **`realm` says whether it ran in the harness's own realm or a fresh one** — `echo.ts`' observer (W63), because
 * `Identify` is the one THREADABLE type of the TV ingest and W94's adequacy reader (finding 4) found the threaded row
 * green with `threaded: false`: nothing read what the pool was. `run-flow.ts` marks its realm; an inline pool sees the
 * mark (`harness`), a thread does not (`thread`) — and nor does any process that is not ladder L6.
 */
import { type Envelope, FlowWorker } from './shared.ts';
import type { BaseWorkerContext, WorkerConfig } from 'fyflow-scheduler';

/** `Show.S01E02.ext` → `{ id: 'show', title: 'Show' }` and `S01E02`; anything else → no series. Total: it never throws. */
export function seriesOf(name: string): { series?: { id: string; title: string }; episode?: string } {
  const m = /^([A-Za-z][A-Za-z0-9]*)\.(S\d{2}E\d{2})\./.exec(name);
  return m ? { series: { id: m[1]!.toLowerCase(), title: m[1]! }, episode: m[2]! } : {};
}

export default class IdentifyWorker extends FlowWorker {
  private readonly msPerMB: number;

  constructor(config: WorkerConfig = {}, workerContext?: BaseWorkerContext) {
    super(config, workerContext);
    const c = config as { msPerMB?: unknown };
    this.msPerMB = typeof c.msPerMB === 'number' ? c.msPerMB : 0;
  }

  protected async compute(envelope: Envelope): Promise<unknown> {
    const file = (envelope.input ?? {}) as { name?: unknown; sizeMB?: unknown };
    const name = typeof file.name === 'string' ? file.name : '';
    const sizeMB = typeof file.sizeMB === 'number' ? file.sizeMB : 0;
    if (this.msPerMB > 0 && sizeMB > 0) await new Promise((r) => setTimeout(r, this.msPerMB * sizeMB));
    return { name, ...seriesOf(name), realm: typeof (globalThis as { __L6_HARNESS_REALM__?: unknown }).__L6_HARNESS_REALM__ !== 'undefined' ? 'harness' : 'thread' };
  }
}
