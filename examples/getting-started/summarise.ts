/**
 * **The CONSUMER of the authoring session, and the reason it has one** —
 * [W74](../../doc/work-items/w74-the-assists-and-the-exit-artifact.md), `AGENTS.md` section 15.
 *
 * It counts the words of a `text` its `inputSchema` REQUIRES, and that schema is closed. So wiring
 * `reader.ts` straight into it is a miswire the wiring check names — *consumer requires "text",
 * producer does not guarantee it* — and the transform that repairs it is one JSONata expression,
 * written through the sample-and-diff loop rather than guessed.
 *
 * **Why these two workers rather than the L6 corpus's.** W74's declaration measured what a diff can
 * say against each consumer the corpus declares: `echo`, the consumer of BOTH transformed arcs in
 * `examples/flows/transformed.flow.json`, has an `inputSchema` of `{"examples":[{"a":1}]}` and
 * refuses **0 of 9** probe values, so a TYPO in that flow's shipped transform still reads
 * `transform-passes`. *A loop's discriminating power belongs to the consumer*, and a session run
 * against a consumer that refuses nothing would demonstrate nothing. These two refuse.
 *
 * Typed by `session-types.ts`, generated from the registry's schemas; not an L6 row, for the reason
 * `worker.ts` beside it gives.
 */
import type { SummariseEnvelope, SummariseOutput } from './session-types.ts';

export default class Summarise {
  run(envelope: SummariseEnvelope): SummariseOutput {
    // The filter is what makes a double space one separator rather than two words; W74's adequacy
    // reader deleted it for zero, because no fixture carried one. One does now.
    return { words: envelope.input.text.split(' ').filter((w) => w.length > 0).length };
  }
}
