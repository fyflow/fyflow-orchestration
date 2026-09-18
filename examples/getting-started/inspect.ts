/**
 * **A worker that reports what it RECEIVED, rather than computing anything.** W71.
 *
 * `AGENTS.md` section 10 says the loss of a class's behaviour is what **the next node receives** —
 * and until W71's adequacy reader read it, that snippet had no next node at all: it read the LOG,
 * and two independent clones stand between a worker's return value and the log, either one of which
 * is sufficient on its own. This module is the successor that makes the section's own sentence have
 * an instance, and it separates the two clones by observing the value on the far side of both.
 *
 * It is NOT an L6 row, for the reason `worker.ts` records.
 */
export default class Inspect {
  run(envelope: { input: Record<string, unknown> }): { sawMethod: string; prototypeIs: string; keys: string[] } {
    const input = envelope.input;
    return {
      sawMethod: typeof (input as { isHigh?: unknown }).isHigh,
      prototypeIs: Object.getPrototypeOf(input) === Object.prototype ? 'Object.prototype' : 'something else',
      keys: Object.keys(input).sort(),
    };
  }
}
