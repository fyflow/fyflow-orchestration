/**
 * Ladder L1 — **the checkpoint through the RUNTIME**: `RunHandle.header` (P23 decision 4, ADR 0064
 * rule 5) and `onFoldInput`'s position surviving ADR 0058's composition (`RN-R18`, ADR 0064 rule 5).
 * [W88](../../doc/work-items/w88-what-a-checkpoint-is.md). `createRuntime`'s two construction seams,
 * as `test/scheduler/runtime.test.ts` uses them, so nothing here builds a thread.
 *
 * **Both claims are about a value the runtime could ASSEMBLE for itself and must not**: a header
 * built here from `flow`, `payload` and `runId` agrees with the driver's on every field but one —
 * the entry payload would be the caller's own object — and a position counted by the runtime's
 * wrapper agrees with the driver's while that wrapper sees a run from its first element. So each
 * case puts the right answer where the assembled one differs: the payload is mutated after `start`,
 * the run is the runtime's SECOND (a minted `r2`, not the default position `r1`), and the flow is at
 * version 5.
 */
import { collected, deepEqual, equal, ok, suite } from '../harness.ts';
import { createRuntime } from '../../src/scheduler/runtime.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import type { FlowDefinition, RegistryDocument } from '../../src/definition/types.ts';

const DOCUMENT = {
  workers: { w: { url: 'https://example.test/w.js' } },
  nodeTypes: { T: { worker: 'w', inline: true } },
  predicates: [],
} as unknown as RegistryDocument;
const LINEAR = {
  flowId: 'ckpt-rt', version: 5, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'b' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

function seams() {
  const added: { id: string }[] = [];
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const settle = (id: string, result: unknown) => {
    const detail = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
  };
  const createPool = (url: string, options: unknown) => ({ url, options }) as never;
  const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => ({
    workerPools: p, groups: g,
    addTask(t: unknown) { added.push(t as { id: string }); },
    addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    shutdown() { return Promise.resolve(); },
  }) as never;
  return { added, settle, createPool, createScheduler };
}

const SUITE = 'W88 — the checkpoint through the runtime: RunHandle.header and the position';
const DECLARED_CASES = [
  'the handle carries the DRIVER`s header — a copy, taken at start, for the run the runtime minted',
  'the consumer`s onFoldInput receives the DRIVER`s position through the composition',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('the handle carries the DRIVER`s header — a copy, taken at start, for the run the runtime minted', () => {
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    r.start(LINEAR, { first: true });
    const payload = { n: 1, nested: { k: 'v' } };
    // Mutated DURING start as well as after it — a consumer's `onFoldInput` runs at least once before
    // the handle exists (RN-R18), so a header re-cloned from `payload` after `start()` returned would
    // carry this and one taken at the call would not (W88's adequacy reader, F6).
    const h = r.start(LINEAR, payload, { onFoldInput: () => { payload.nested.k = 'MUTATED IN THE CALLBACK'; } });
    payload.nested.k = 'MUTATED AFTER START';
    ok(h.driver.runId !== 'r1', `the ARRANGEMENT: this is the runtime's second run, minted ${h.driver.runId}, so the default position cannot pass`);
    equal(h.header, { format: 1, runId: 'r2', flowId: 'ckpt-rt', version: 5, entryPayload: { n: 1, nested: { k: 'v' } } },
      'RunHandle.header — every field a literal from the flow and the call above, the payload as it was PASSED');
    equal(h.header, h.driver.checkpoint().header, 'and it is the driver`s header');
    ok(h.header !== h.driver.checkpoint().header && h.header.entryPayload !== h.driver.checkpoint().header.entryPayload,
      'a separate copy of it, down to the entry payload');
    ok(Object.isFrozen(h.header), 'frozen, as the driver`s is');
  });

  test('the consumer`s onFoldInput receives the DRIVER`s position through the composition', () => {
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const seen: { seq: number; input: FoldInput }[] = [];
    // **The runtime's SECOND run, with a callback on BOTH** — the arrangement `RN-R18`'s Test cell names
    // and the first version of this case did not build (both readers): on a first run a counter the
    // runtime keeps for ITSELF agrees with the driver's index, and on the second it starts where the
    // first run's elements left it.
    const earlier: number[] = [];
    r.start(LINEAR, { x: 0 }, { onFoldInput: (_i, seq) => { earlier.push(seq); } });
    for (let i = 0; i < s.added.length && i < 10; i += 1) s.settle(s.added[i]!.id, { ok: i });
    const firstRunEvents = earlier.length;
    const h = r.start(LINEAR, { x: 1 }, { onFoldInput: (input, seq) => { seen.push({ seq, input }); } });
    ok(h.driver.runId === 'r2' && firstRunEvents > 0,
      `the ARRANGEMENT: this is the runtime's second minted run (${h.driver.runId}), after one that delivered ${firstRunEvents} positions`);
    const beforeReturn = seen.length;
    for (let i = 0; i < s.added.length && i < 20; i += 1) if (s.added[i]!.id.startsWith('r2:')) s.settle(s.added[i]!.id, { ok: i });
    const all = h.driver.checkpoint().events;
    ok(beforeReturn >= 1,
      `the consumer had ${beforeReturn} element(s) before start() returned the handle — which is why the HANDLE's header cannot be written strictly first (onHeader's can, since W185 — RN-R39), and why the position exists`);
    ok(all.length > 4, `the CONTROL: a real sequence, ${all.length} elements`);
    equal(seen.map((x) => x.seq), all.map((_, i) => i), 'the positions the CONSUMER receives are the driver`s, 0 … n-1');
    for (const x of seen) ok(deepEqual(x.input, all[x.seq]), `position ${x.seq} is the element the checkpoint holds there`);
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((x) => x.suite === SUITE).flatMap((x) => x.cases.map((c) => c.name)).sort();
    equal([...DECLARED_CASES].sort().filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !DECLARED_CASES.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
