/**
 * **`fyflow-orchestration/scheduler` — the sub-path that constructs scheduler objects**, and the
 * only one: the package root stays the pure half (P16 decision 5, ADR 0049 rule 5). Import from
 * here to turn a registry of node types into a scheduler's pools and groups; import from the root
 * for everything else. Since v0.18 (W61, ADR 0051) the envelope worker here also evaluates a
 * node's declared `transform`, and `TransformFailed` is what a task fails with when it cannot.
 */
export { bootstrap, BootstrapError, ENVELOPE_WORKER_URL, transformLanguagesByType } from './bootstrap.ts';
export type { BootstrapOptions, BootstrapResult, PoolFactory } from './bootstrap.ts';
export { default as EnvelopeWorker, NotAnEnvelope, TransformFailed, unpackEnvelope } from './envelope-worker.ts';
export type { Envelope, EnvelopePoolConfig } from './envelope-worker.ts';
