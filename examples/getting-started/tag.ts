/**
 * **A worker that says which node it was** — [W70](../../doc/work-items/w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md).
 *
 * It returns its input with one more key, the node's `settings.label`, set to `true`. So a value
 * that has passed through `ingest`, then `enrich`, reads `{ confidence, ingest: true, enrich: true }`
 * — the ROAD it came by is legible from the value, and a join's record (`JP-R12`) shows every branch's
 * road side by side. `AGENTS.md` section 5's runtime snippet runs it; `README.md` shows it. Not an L6
 * row, for the reason `worker.ts` beside it gives.
 */
export default class Tag {
  run(envelope: { settings: { label: string }; input: Record<string, unknown> }): Record<string, unknown> {
    return { ...envelope.input, [envelope.settings.label]: true };
  }
}
