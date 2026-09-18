/**
 * **A worker that returns a score after a stated delay.** W71.
 *
 * The delay is a SETTING, so a flow can ARRANGE which branch of a fan-out settles first instead of
 * hoping for an order — [W6](../../doc/work-items/w6-the-non-success-half-on-real-workers.md)'s
 * method, and the reason `AGENTS.md` section 5 can show that a join's collection is keyed by BRANCH
 * and not by arrival. `doc/workflow.md` section 5 rule 5 forbids asserting a completion order; this
 * worker exists so the order can be an INPUT to the claim rather than a property the claim rests on,
 * and the snippet reads the order it got out of the run rather than assuming the one it asked for.
 *
 * It is NOT an L6 row: `examples/l6.ts` lists `examples/workers/` on disk and compares that listing
 * to the L6 registry both ways, so a module in this directory is outside that clause by construction
 * ([W69](../../doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md)).
 */
export default class Scorer {
  async run(envelope: { settings: { score: number; ms?: number } }): Promise<{ score: number }> {
    const ms = envelope.settings.ms ?? 0;
    if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
    return { score: envelope.settings.score };
  }
}
