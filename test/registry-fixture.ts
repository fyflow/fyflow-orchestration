/**
 * **The one way a suite declares the node types a fixture flow names** — v0.19 (W65, ADR 0054).
 *
 * Every task node names a `type` since v0.19, so a suite whose registry used to say
 * `workerTypes: ['IngestWorker', 'ScoreWorker']` now needs a worker entry and a node type per name.
 * This helper is that: `typesFor(names)` gives `{ workers, nodeTypes }` with one worker `test://<name>`
 * and one document-form type `{ worker: <name> }` per name — the identity derivation over nothing,
 * which is what a bare pool was. `extra` adds types with more to say (a settings schema on their
 * worker, a retry default, defaults) under their own names, and `workers` the entries those name.
 *
 * It is one file rather than a line in each suite so that the shape a validator reads of a type is
 * written once; the corpus's own registry is `spec/examples/registry.json`, a registry DOCUMENT,
 * and `test/definition/corpus-types.ts` is where a suite turns it into a `Registry`.
 */
import type { NodeTypeEntry, WorkerEntry } from '../src/definition/types.ts';

export function typesFor(
  names: Iterable<string>,
  extra: Readonly<Record<string, NodeTypeEntry>> = {},
  workers: Readonly<Record<string, WorkerEntry>> = {},
): { workers: Record<string, WorkerEntry>; nodeTypes: Record<string, NodeTypeEntry> } {
  const w: Record<string, WorkerEntry> = { ...workers };
  const t: Record<string, NodeTypeEntry> = {};
  for (const n of names) {
    w[n] ??= { url: `test://${n}` };
    t[n] = { worker: n };
  }
  for (const [n, e] of Object.entries(extra)) {
    t[n] = e;
    w[e.worker] ??= { url: `test://${e.worker}` };
  }
  return { workers: w, nodeTypes: t };
}
