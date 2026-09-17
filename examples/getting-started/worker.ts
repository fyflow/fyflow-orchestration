/**
 * **The one file a consumer writes as code — a worker.** [W69](../../doc/work-items/w69-a-getting-started-example-a-consumer-can-copy.md).
 *
 * A worker module's DEFAULT export is a class with a `run` method, and that is the whole contract:
 * `setup` and `teardown` are optional, there is no base class to extend, and nothing is imported.
 * `run` receives the envelope `{ settings, input }` — `settings` from the flow node that named this
 * worker's type, `input` whatever the previous node returned (at the entry, the run's payload) — and
 * what it returns is the next node's `input`. THREE snippets run it — `AGENTS.md` section 2, section
 * 12's custom-group factory, and `README.md`'s copy of section 2, which `X8` holds byte-equal to it.
 * *(This named two until W70's conformity reader: that item took `examples/README.md` as a declared
 * exception for exactly this sentence and corrected it there, in the page about this directory, and
 * not in the file the sentence is about — which was inside its own `Owns`.)*
 *
 * It is NOT an L6 row: `examples/l6.ts` lists `examples/workers/` on disk and compares that listing
 * to the L6 registry both ways, so a module here is outside that clause by construction, and what
 * executes this file is `npm run check:docs` through the section-2 snippet.
 */
export default class Greeter {
  run(envelope: { settings: { say: string }; input: { text: string } }): { text: string } {
    return { text: `${envelope.input.text} ${envelope.settings.say}` };
  }
}
