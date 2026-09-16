/**
 * **`attest` — the worker that reports whether a KEY IS THERE — W45, `FD-C4`.**
 *
 * **TWO independent expressions over the same fact, and that is `doc/workflow.md` section 5 rule 8
 * obligation (c)'s LIMIT applied before a reader had to find it.** v0.13: *when the compound probe
 * is green, count the observers; at one, the fix is a second independent expression over the same
 * fact rather than a better probe.* `keys` is the input's own key set and `sawVerdict` is the `in`
 * operator, so a probe that re-sources either leaves the other live — where a single reading would
 * remove the only observer and make the compound measure nothing. That is exactly what W43 measured
 * on `weigh`, and it cost eight failures to find.
 *
 * **`keys` also fails on a driver that gives a node MORE than it asked for**, which no `in` test and
 * no count can see — ADR 0040 rule 6.
 */
import { type Envelope, FlowWorker } from './shared.ts';

export default class AttestWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    const p = (envelope.input ?? {}) as Record<string, unknown>;
    return {
      keys: Object.keys(p).sort(),
      sawVerdict: 'verdict' in p,
      // And the value, so a row where the key IS present says what arrived rather than only that
      // something did.
      verdict: (p.verdict ?? null) as unknown,
    };
  }
}
