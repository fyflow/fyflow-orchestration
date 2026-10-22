/**
 * Ladder L1-L2 — **what a READING costs: the stored elements its replay consumes, held as a CLOCK-FREE COUNT** —
 * [P42](../../doc/plans/p42-what-a-node-was-handed-asked-after-the-fact.md) decision 6 and its exit artifact's clause (1),
 * [W205](../../doc/work-items/w205-what-a-node-was-handed-read-by-replaying-the-run.md),
 * [ADR 0128](../../doc/decisions/0128-what-a-node-was-handed-is-read-by-replaying-the-run-to-its-composition.md),
 * `RN-R45`. A sibling of `map-cost.test.ts` and `reference-copy-cost.test.ts`.
 *
 * **The subject**: a reading of the end `exit` that each instance of a `map` reaches — the FIRST instance's and the LAST
 * one's — counted by the reading's own `replay.reading` (`fed`, the stored stimuli it was fed; `elements`, the stored
 * elements it compared), fields of the reading driver's PRIVATE replay read by a cast (never public, ADR 0121 rule 7),
 * reached through `Driver.read`, the private static the export is. **Pinned EXACT at 2,000 and 8,000 items**, each value
 * derived from the counted code on the stored run's own layout:
 *
 * | position | the stored element (n items, `w:i` settled in order) |
 * |---|---|
 * | 0, 1 | `dispatched fetch`, `outcome fetch` (FED) |
 * | 2, 3 … n+2 | `regionEntered m`, then n `branch.opened` — every one before any instance is entered (`JP-R5`) |
 * | n+3 … 2n+2 | n `dispatched w` |
 * | 2n+3+3i … 2n+5+3i | `outcome w:i` (FED), then `exit`'s `branch.exited` and `pathEnded` |
 * | 5n+3, 5n+4 | `joinSettled m`, `pathEnded done` |
 *
 * | target | `fed` | `elements` |
 * |---|---|---|
 * | `exit` at `"0"` | **2** — fetch's and w:0's settlements; CONSTANT in n | **2n + 5** — positions 0 … 2n+4, `exit`'s `branch.exited` (its own element, which confirms the cut) the last |
 * | `exit` at `"n-1"` | **n + 1** | **5n + 2** — positions 0 … 5n+1: the stored run's last three elements are never read |
 * | `exit`, every path (decision 4) | **n + 1** | **5n + 5** — the whole stored run, and n answers |
 *
 * **What it does NOT count** (P42 decision 6): the composition itself (ADR 0124's count, `outputsCache.examined`), the
 * predicates' and gates' re-runs, the header's clone, the definition's validation in `new Driver`, and — the one that
 * matters — **the work of a fed step**: `fed` counts the STEPS the replay took, and a step is replayed WHOLE up to the
 * cut. So the FIRST instance's `fed` is constant while its `elements` are LINEAR — the map's opening step regenerates
 * `regionEntered`, every `branch.opened` and every `dispatched w` before any instance can settle. `elements` is the count
 * of that work; `fed` is the count the plan predicted constant (prediction 3, which holds for `fed` and NOT for `elements`).
 *
 * **The second observer, in the same pass**: the reading driver's own log length (`inputs`), which the cut leaves at
 * exactly the confirming element — no `src/` counter shared. **And the retention** (P42 decision 6's measurement): a reading
 * holds NO dispatch's config — its replay's `held` is empty after a replay that dispatched n + 1 tasks — where a resume of
 * the same stored run held n + 1 (the control, the same replay on its own road).
 *
 * **The provocation is CHECKED IN, as a case** (`doc/workflow.md` section 5 rule 7): the CUT REMOVED — `Driver.prototype.take`
 * replaced for the duration of the case by one that keeps the answer and does NOT throw, so the replay runs to the stored
 * end — asserting it RAN and the EXACT set of clauses it turns red. Run at 2,000 items only, a share of the chromium
 * lane's 60 s. Runs in all three L0-L5 runtimes; nothing here reads a file.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, type Checkpoint, type InputOfOptions, type InputReading, type InputTarget } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const SUITE = 'L1-L2 — W205, RN-R45: what a reading costs — the stored elements its replay consumes, EXACT at 2,000 and 8,000 items for the first and last instance of a map, a second observer, nothing held, the cut`s removal red';

const SMALL = 2_000;
const LARGE = 8_000;

const COST = {
  flowId: 'reading-cost', version: 1, entry: 'fetch',
  nodes: [
    { id: 'fetch', kind: 'task', type: 'T', edges: [{ to: 'm' }] },
    { id: 'm', kind: 'map', over: 'items', branch: 'w' },
    { id: 'w', kind: 'task', type: 'T', edges: [{ when: { predicate: 'out' }, to: 'exit' }, { to: 'mj' }] },
    { id: 'exit', kind: 'end', outcome: 'exited' },
    { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

const OPTS: InputOfOptions = { predicates: new Map([['out', () => true]]), ...typesFor(['T'], {}, {}), joinPolicy: liveToken as JoinPolicy };

/** The stored run of n items: fetch hands m its items, every `w:i` settles in order and leaves through `exit`. */
function stored(n: number): Checkpoint {
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const queue: string[] = [];
  const d = new Driver(COST, {
    runId: 'r1', ...OPTS, createTask: (c) => c as never,
    scheduler: {
      addTask(t: unknown) { queue.push((t as { id: string }).id); },
      addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    },
  });
  d.start({});
  for (let q = 0; q < queue.length; q += 1) {
    const id = queue[q]!;
    const detail = { id, state: 'done', result: q === 0 ? { items: Array.from({ length: n }, (_, i) => i) } : { i: q }, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
  }
  return d.checkpoint();
}

interface Read { answer: InputReading; fed: number; elements: number; inputs: number; held: number }
/** One reading through `Driver.read` — the export's own road — and the reading driver's private counts, by a cast. */
function read(cp: Checkpoint, target: InputTarget): Read {
  const r = (Driver as unknown as { read(f: FlowDefinition, o: InputOfOptions, c: Checkpoint, t: InputTarget): { answer: InputReading; driver: Driver } })
    .read(COST, OPTS, cp, target);
  const p = r.driver as unknown as { replay: { held: Map<string, unknown>; reading: { fed: number; elements: number } }; inputs: unknown[] };
  return { answer: r.answer, fed: p.replay.reading.fed, elements: p.replay.reading.elements, inputs: p.inputs.length, held: p.replay.held.size };
}

/** Every clause, by name, against its derived value — the names a provocation's red set is declared in. */
function clauses(n: number, cp: Checkpoint): { failed: string[]; first: Read; last: Read } {
  const failed: string[] = [];
  const first = read(cp, { nodeId: 'exit', branchPath: '0' });
  const last = read(cp, { nodeId: 'exit', branchPath: String(n - 1) });
  const check = (name: string, got: unknown, want: unknown) => { if (got !== want) failed.push(`${name}@${n}`); };
  check('stored length', cp.events.length, 5 * n + 5);
  check('first answered', first.answer.ok && first.answer.inputs.length === 1 && first.answer.inputs[0]!.value !== undefined, true);
  check('last answered', last.answer.ok && last.answer.inputs.length === 1, true);
  check('first fed', first.fed, 2);
  check('first elements', first.elements, 2 * n + 5);
  check('last fed', last.fed, n + 1);
  check('last elements', last.elements, 5 * n + 2);
  return { failed, first, last };
}

const DECLARED_CASES = [
  'the subject: the first instance`s reading consumes 2 stimuli and 2n + 5 elements, the last`s n + 1 and 5n + 2 — EXACT at 2,000 and 8,000 items, the stored run`s tail unread',
  'the second observer: the reading driver`s own log ends at exactly the confirming element; and a node id alone consumes the whole stored run and answers every path in order',
  'nothing held: a reading`s replay keeps no dispatch`s config — the control, a resume of the same run, held every one',
  'the CUT REMOVED (Driver.prototype.take keeping and not throwing): it ran, and exactly the first instance`s two pins and the last`s elements go red',
  'the cases above are exactly the cases declared',
] as const;

suite(SUITE, (test) => {
  const small = stored(SMALL);
  const large = stored(LARGE);
  /** The unprovoked clauses per size, measured ONCE — the provocation measures afresh. */
  const memo = new Map<number, ReturnType<typeof clauses>>();
  const measured = (n: number) => memo.get(n) ?? (memo.set(n, clauses(n, n === SMALL ? small : large)), memo.get(n)!);

  test(DECLARED_CASES[0], () => {
    for (const n of [SMALL, LARGE]) {
      const c = measured(n);
      equal(c.failed, [], `at ${n} items every pin holds — first ${c.first.fed}/${c.first.elements}, last ${c.last.fed}/${c.last.elements}`);
      ok(c.first.answer.ok && c.first.answer.inputs[0]!.handed === 'received' && c.first.answer.inputs[0]!.value !== null, 'the answer is exit`s received');
    }
    equal(measured(SMALL).first.fed, measured(LARGE).first.fed, 'the first instance`s stimuli are the SAME at both sizes — constant in n');
  });

  test(DECLARED_CASES[1], () => {
    for (const n of [SMALL, LARGE]) {
      const c = measured(n);
      equal([c.first.inputs, c.last.inputs], [2 * n + 5, 5 * n + 2], `at ${n}: the reading driver appended exactly up to the confirming element`);
    }
    const all = read(small, { nodeId: 'exit' });
    equal([all.fed, all.elements], [SMALL + 1, 5 * SMALL + 5], 'a node id alone: every stimulus and every element of the stored run');
    ok(all.answer.ok, 'and it is answered');
    const paths = all.answer.ok ? all.answer.inputs.map((i) => i.branchPath) : [];
    equal(paths.length, SMALL, 'one answer per instance');
    ok(paths.every((p, i) => p === String(i)), 'in the order the replay reached them — 0 … n-1, the order the stored run settled them');
  });

  test(DECLARED_CASES[2], () => {
    const r = read(small, { nodeId: 'exit', branchPath: String(SMALL - 1) });
    equal(r.held, 0, 'a reading that replayed n + 1 dispatches holds no config');
    // The control: the same stored run RESUMED, `held` read at the end of its replay.
    let held = -1;
    const d = new Driver(COST, {
      runId: 'r1', ...OPTS, createTask: (c) => c as never,
      scheduler: { addTask() {}, addEventListener() {} },
    });
    const p = d as unknown as { replayStored(s: unknown): void; replay: { held: Map<string, unknown> } };
    const orig = p.replayStored;
    p.replayStored = function (this: typeof p, s: unknown) { orig.call(this, s); held = this.replay.held.size; };
    d.resume(small);
    equal(held, SMALL + 1, 'the control: a resume`s replay held EVERY dispatch`s config — fetch and every w');
  });

  test(DECLARED_CASES[3], () => {
    const proto = Driver.prototype as unknown as { take(r: { found: unknown[] }, input: unknown): void };
    const orig = proto.take;
    let ran = 0;
    proto.take = function (r: { found: unknown[] }, input: unknown) { ran += 1; r.found.push(input); };
    let failed: string[];
    try {
      failed = clauses(SMALL, small).failed;
    } finally {
      proto.take = orig;
    }
    ok(proto.take === orig, 'the prototype is restored');
    ok(ran >= 2, `the provocation RAN — the cut was reached ${ran} time(s)`);
    equal(failed.sort(), ['first elements@2000', 'first fed@2000', 'last elements@2000'],
      'removing the cut reddens exactly these: the first instance runs to the end (n + 1 stimuli, 5n + 5 elements) and the last reads the 3-element tail');
    equal(clauses(SMALL, small).failed, [], 'and restored, every pin holds again');
  });

  test(DECLARED_CASES[4], () => {
    const ran = collected().find((s) => s.suite === SUITE)!.cases.map((c) => c.name).sort();
    const declared: string[] = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
