/**
 * **A corpus flow holding a `loop` is SPLIT OFF from a driver suite's corpus and its REFUSAL asserted, until W229 runs
 * one** — W228's declared late exception (P47, the maintainer's (a), 2026-11-14), W92's precedent for a gate flow
 * (`test/driver/needs.test.ts`'s FD-C2 census). `spec/flow-definition.md` v0.57 admits the kind and the driver that
 * RUNS one is W229's, so until then entering a loop is reported `InvalidDefinition` by `enter`'s default arm. **W229's
 * lift fails `loopRefusal`'s assertion NAMING the flow**, rather than leaving each suite silently short of the flows it
 * censuses — and W229 then deletes this file and the four splits that import it.
 */
import { readText, ROOT } from '../harness.ts';
import { Driver, InvalidDefinition } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { CORPUS_LANGUAGES } from '../definition/corpus-types.ts';

/** Does this definition hold a `loop` node? */
export const holdsLoop = (d: FlowDefinition): boolean => d.nodes.some((n) => n.kind === 'loop');

const reg = JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as {
  predicates: string[]; workers: never; nodeTypes: never; pools?: never; groups?: Record<string, unknown>;
};

/**
 * **Drive `def` until it stops, settling every dispatched task `done`, and return what the run reported** — the failure
 * kinds `onRunFailure` received and their messages. A loop flow reaches its loop and is refused there; a flow that
 * holds no loop is the CONTROL, and reports nothing.
 */
export function loopRefusal(def: FlowDefinition): { kinds: string[]; messages: string[]; dispatched: string[] } {
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const added: string[] = [];
  const sch = {
    addTask: (t: unknown) => { added.push((t as { id: string }).id); },
    addEventListener: (type: string, fn: (e: { detail: unknown }) => void) => { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    cancel: () => Promise.resolve(true),
  };
  const kinds: string[] = [];
  const messages: string[] = [];
  const d = new Driver(def, {
    runId: 'r1', scheduler: sch as never,
    predicates: new Map(reg.predicates.map((n) => [n, () => false])),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}), languages: CORPUS_LANGUAGES,
    joinPolicy: liveToken as JoinPolicy, validateBoundaries: false,
    createTask: (c) => c as never,
    // **By `instanceof`, not by `f.kind`**: `kind` is the error's CONSTRUCTOR NAME, which the browser bundle's minifier
    // renames (`_InvalidDefinition`, measured on chromium) — so the class is what is compared, and any other cause reads
    // as its own `kind`, which can then never equal the expectation.
    onRunFailure: (f) => { kinds.push(f.cause instanceof InvalidDefinition ? 'InvalidDefinition' : f.kind); messages.push(f.message); },
  });
  d.start({ items: [1], budget: { rounds: 2 } });
  for (let i = 0; i < added.length && i < 50; i++) {
    for (const fn of listeners.get('task.completed') ?? []) {
      fn({ detail: { id: added[i], state: 'done', result: { items: [1] }, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, error: null } });
    }
  }
  return { kinds, messages, dispatched: [...added] };
}
