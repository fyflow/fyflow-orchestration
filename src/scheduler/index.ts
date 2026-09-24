/**
 * **`fyflow-orchestration/scheduler` — the sub-path that constructs scheduler objects**, and the
 * only one: the package root stays the pure half (P16 decision 5, ADR 0049 rule 5). Import from
 * here to turn a registry of node types into a scheduler's pools and groups; import from the root
 * for everything else. Since v0.18 (W61, ADR 0051) the envelope worker here also evaluates a
 * node's declared `transform`, and `TransformFailed` is what a task fails with when it cannot.
 */
export { bootstrap, BootstrapError, ENVELOPE_WORKER_URL, transformLanguagesByType } from './bootstrap.ts';
export type { BootstrapOptions, BootstrapRegistry, BootstrapResult, PoolFactory } from './bootstrap.ts';
export { BUILT_IN_GROUP_FACTORIES, createRuntime, GROUP_MEMBERS, GroupNotBuildable, GroupUnusable, LanguageNotBuilt, RunIdInUse, RuntimeError } from './runtime.ts';
// `RunHandle` is what `start` RETURNS, so it is the type a consumer most needs to name — and it
// shipped UNEXPORTED for the length of W77's author pass, because this list is an explicit
// allowlist rather than an `export *`. W77's conformity reader, finding 1: a LIST is a claim
// about another list, and `test/scheduler/runtime.test.ts`'s export case compares runtime KEYS,
// which is structurally blind to a missing type. *Q297's own shape one layer over — the thing
// the seam produces, unreachable on the road `AGENTS.md` recommends.*
export type { ResumeOptions, RunHandle, Runtime, RuntimeOptions, RuntimeRegistry, StartOptions } from './runtime.ts';
export { default as EnvelopeWorker, NotAnEnvelope, TransformFailed, unpackEnvelope } from './envelope-worker.ts';
export type { Envelope, EnvelopePoolConfig } from './envelope-worker.ts';
