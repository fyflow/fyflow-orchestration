/**
 * **A worker that FAILS, so the reference can show what a consumer does about it.** W71.
 *
 * The contract is `worker.ts`'s — a default-exported class with `run` — and this one throws unless
 * its input says otherwise, which is what parks a non-optional task at `user_action` once its retry
 * budget is spent. `AGENTS.md` section 7 runs it on a real scheduler so that the human-in-the-loop
 * road is shown on the thing a consumer will actually have, rather than on a hand-built stub that
 * delivers its own events.
 *
 * It is NOT an L6 row: `examples/l6.ts` lists `examples/workers/` on disk and compares that listing
 * to the L6 registry both ways, so a module in this directory is outside that clause by construction
 * ([W69](../../doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md)).
 */
export default class Flaky {
  run(envelope: { settings: { fail?: boolean }; input: { text?: string } }): { text: string } {
    if (envelope.settings.fail !== false) throw new Error('the thing this worker talks to is down');
    return { text: `${envelope.input.text ?? ''} recovered`.trim() };
  }
}
