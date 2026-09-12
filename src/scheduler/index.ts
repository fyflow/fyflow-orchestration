/**
 * **`fyflow-orchestration/scheduler` — the sub-path that constructs scheduler objects**, and the
 * only one: the package root stays the pure half (P16 decision 5, ADR 0049 rule 5). Import from
 * here to turn a registry of node types into a scheduler's pools and groups; import from the root
 * for everything else.
 */
export { bootstrap, BootstrapError, ENVELOPE_WORKER_URL } from './bootstrap.ts';
export type { BootstrapOptions, BootstrapResult, PoolFactory } from './bootstrap.ts';
export { default as EnvelopeWorker, NotAnEnvelope, unpackEnvelope } from './envelope-worker.ts';
export type { Envelope, EnvelopePoolConfig } from './envelope-worker.ts';
