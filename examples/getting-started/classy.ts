/**
 * **A worker that returns a CLASS INSTANCE, which is a thing you should not do.** W71.
 *
 * `OR-R11`: what crosses the boundary between a worker and a run is a value's own enumerable data.
 * The prototype does not cross, so the methods are gone, `instanceof` is false, and **nothing is
 * reported** — the loss is silent by design. `AGENTS.md` section 10 runs this on a real scheduler so
 * that the loss is the real clone's rather than a `structuredClone` the snippet called itself.
 *
 * **`run` asserts its OWN return value before handing it over**, and that is not decoration: the
 * snippet that consumes this can see the behaviour is GONE and cannot see that there was ever any
 * behaviour to lose — measured by W71's adequacy reader, who replaced this whole class with one
 * returning a plain object and watched the entire gate stay green. The IN side of that pair has
 * exactly one place it can be observed from, which is here.
 *
 * It is NOT an L6 row: `examples/l6.ts` lists `examples/workers/` on disk and compares that listing
 * to the L6 registry both ways, so a module in this directory is outside that clause by construction
 * ([W69](../../doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md)).
 */
class Score {
  readonly value: number;
  constructor(value: number) { this.value = value; }
  isHigh(): boolean { return this.value > 0.5; }
}

export default class Classy {
  run(envelope: { settings: { value: number } }): Score {
    const score = new Score(envelope.settings.value);
    // The IN side of section 10's pair: what leaves here HAS behaviour and a prototype.
    if (!(score instanceof Score)) throw new Error('this worker must return a class instance');
    if (typeof score.isHigh !== 'function') throw new Error('the instance must carry its method');
    return score;
  }
}
