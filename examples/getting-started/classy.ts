/**
 * **A worker that returns a CLASS INSTANCE, which is a thing you should not do.** W71.
 *
 * `OR-R11`: what crosses the boundary between a worker and a run is a value's own enumerable data.
 * The prototype does not cross, so the methods are gone, `instanceof` is false, and **nothing is
 * reported** — the loss is silent by design. `AGENTS.md` section 10 runs this on a real scheduler so
 * that the loss is the real clone's rather than a `structuredClone` the snippet called itself.
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
    return new Score(envelope.settings.value);
  }
}
