/**
 * **`tally` — the one worker here that MUTATES what it was handed.**
 *
 * It is what turns *two instances share an object* from an identity fact into an observable one:
 * sharing makes the second instance read the first's write, so the two results differ. With the
 * driver's per-instance clone in place both read `seen: 1`.
 *
 * **Deliberately not defensive.** A worker that copies its input first would be correct practice and
 * would measure nothing; ADR 0037 rule 1 exists so that a worker need not. Its pool is INLINE and
 * must be: two map instances handed one object would see each other's write, and a thread would hide
 * it.
 */
import { type Envelope, FlowWorker } from './shared.ts';

export default class TallyWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    const p = (envelope.input ?? {}) as { seen?: number; word?: string };
    p.seen = (p.seen ?? 0) + 1;
    return { seen: p.seen, word: typeof p.word === 'string' ? p.word : null };
  }
}
