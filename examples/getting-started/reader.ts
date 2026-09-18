/**
 * **The PRODUCER of the authoring session** — [W74](../../doc/work-items/w74-the-assists-and-the-exit-artifact.md),
 * `AGENTS.md` section 15.
 *
 * It returns a batch: the lines it read, and where it read them from. Its `outputSchema` in the
 * session's registry says exactly that and **closes the object** (`additionalProperties: false`), so
 * the wiring check can say what a consumer will and will not receive — which is the whole point of
 * the session: `summarise.ts` beside it REQUIRES a `text` string, and *lines are not text* is a
 * defect a schema catches before a run rather than a worker catches during one.
 *
 * **It is typed by a GENERATED signature** (`session-types.ts`), emitted from the registry's own
 * schemas by `signatureOf` and checked in, so `npm run typecheck:examples` compiles this file
 * against the declaration rather than against the author's memory of it. Types catch the SHAPE and
 * not the constraints — nothing here stops this worker returning a `source` of `''`.
 *
 * Not an L6 row: `examples/l6.ts` lists `examples/workers/` on disk and compares that listing to the
 * L6 registry both ways, so a module here is outside that clause by construction (`worker.ts`'s own
 * note). What executes it is `npm run check:docs`, through section 15's snippet.
 */
import type { ReaderEnvelope, ReaderOutput } from './session-types.ts';

export default class Reader {
  run(envelope: ReaderEnvelope): ReaderOutput {
    // The fallback is a DIFFERENT word from the example's, so a worker that ignores its input is
    // red rather than lucky (W74's adequacy reader, H1: both fixtures wanted `inbox`).
    const source = typeof envelope.input.source === 'string' ? envelope.input.source : 'unnamed';
    return { lines: ['alpha', 'beta', 'gamma'], source };
  }
}
