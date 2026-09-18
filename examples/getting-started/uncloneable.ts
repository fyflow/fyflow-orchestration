/**
 * **A worker that returns something that cannot be cloned AT ALL.** W71.
 *
 * `OR-R11`'s other half, and the loud one: a class instance crosses LOSSILY and in silence, while a
 * function, a `Promise` or a `WeakMap` cannot cross at all and stops the run with
 * `UncloneableResult`. `AGENTS.md` section 10 runs both on one runtime, because the silent half's
 * claim — *and nothing is reported* — is a tautology without a case that DOES report: W71's adequacy
 * reader deleted the only writer of that snippet's failure list for zero, since the flow it ran could
 * raise no failure whatever the library did.
 *
 * It is NOT an L6 row, for the reason `worker.ts` records.
 */
export default class Uncloneable {
  run(): { work: () => number } {
    return { work: () => 1 };
  }
}
