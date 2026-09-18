/**
 * **A worker that FAILS, so the reference can show what a consumer does about it.** W71.
 *
 * The contract is `worker.ts`'s — a default-exported class with `run` — and this one ALWAYS throws,
 * which is what parks a non-optional task at `user_action` once its retry budget is spent. *(It had
 * a settings-controlled success arm until W71's adequacy reader measured that nothing could reach
 * it: its one consumer passes no settings, so the arm and the `input.text` it read were dead code
 * in a module whose whole purpose is to be read as an example.)* `AGENTS.md` section 7 runs it on a real scheduler so that the human-in-the-loop
 * road is shown on the thing a consumer will actually have, rather than on a hand-built stub that
 * delivers its own events.
 *
 * It is NOT an L6 row: `examples/l6.ts` lists `examples/workers/` on disk and compares that listing
 * to the L6 registry both ways, so a module in this directory is outside that clause by construction
 * ([W69](../../doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md)).
 */
export default class Flaky {
  run(): never {
    throw new Error('the thing this worker talks to is down');
  }
}
