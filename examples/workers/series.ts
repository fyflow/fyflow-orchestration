/**
 * **`series` — the PER-SERIES work, which only the first file of each series may open.**
 *
 * [W94](../../doc/work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md). It is the target of the
 * `distinct` gate's `first` route, so it runs once per series in a run whatever order the files arrive in (P24
 * decision 7). **It returns the NAME of the file that opened the series**, and that is the observer of ADR 0066 rule 1
 * — *what leaves a gate is exactly what reached it*: the gate's key is `series.id` and its settings are
 * `{ key: 'series.id' }`, and neither carries the name, so a gate that handed on its key or its settings would make
 * this field empty. **It echoes EVERY field `identify` returns** — the series' id and title, the episode, the name — so
 * a gate that handed on PART of what reached it is as visible as one that handed on none of it (W94's adequacy reader,
 * finding 2: with `title` and `episode` dropped the first cut read green everywhere). `examples/l6.ts` compares all four
 * to the file table at the branch the gate recorded, never to a literal.
 */
import { type Envelope, FlowWorker } from './shared.ts';

export default class SeriesWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    const input = (envelope.input ?? {}) as { name?: unknown; series?: { id?: unknown; title?: unknown }; episode?: unknown };
    return {
      series: typeof input.series?.id === 'string' ? input.series.id : '',
      title: typeof input.series?.title === 'string' ? input.series.title : '',
      episode: typeof input.episode === 'string' ? input.episode : '',
      openedBy: typeof input.name === 'string' ? input.name : '',
    };
  }
}
