/**
 * **W12 — every path a value leaves the driver by, and what a caller may do with
 * what it receives.**
 *
 * `OR-R7` says nothing outside the driver's inbound API writes to run state, and
 * [ADR 0014](../../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)
 * rule 2 says what leaves the driver is a **frozen copy**. Q73 was that
 * `onRegionEvent` handed out the driver's own live object.
 *
 * **Both of W12's readers corrected this file's original framing, and the header
 * records what they found rather than the claim it replaced.**
 *
 * 1. **There are not four outbound paths. There are eleven.** `OR-R7` ranges over
 *    the whole surface, not over the four ADR 0014 happens to name. The
 *    conformity reader derived that from the rule before opening the code and
 *    measured it: `dispatchedIds()`, `regionsForPolicies()`, `joinStatusOf()`,
 *    `effectiveOutcomeOf()`, `terminalStateOf()`, `onUnsatisfiableJoin`,
 *    `onRunFailure` all return **unfrozen** values. Every one is a *copy* today,
 *    which is exactly the state the first four were in before Q73 shipped — so
 *    they are asserted here **as copies**, which is the property that matters.
 * 2. **The original claim that the other three paths had no guard was false.**
 *    `test/driver/fold-inputs.test.ts:227,316-317` and
 *    `test/driver/surface.test.ts:137` already caught three of the five
 *    provocations W12 ran; the Record measured against this file alone. What
 *    those guards do *not* cover is the alias-vs-copy and deep-copy half, which
 *    is what this file adds.
 * 3. **One `branch.opened` fixture cannot guard six event variants.** Freezing
 *    only `branch.opened`, or only `opened`+`arrived`, or freezing conditional on
 *    the fixture's own `regionId`, survived every assertion here and every one of
 *    W12's provocations. `emit()` has six call sites; the first suite below drives
 *    all six.
 *
 * **`Object.isFrozen` alone is not the contract**, and asserting only that repeats
 * the mistake one level down: a shallow freeze still aliases a record's `result`,
 * which is why `cloneRecord` exists (`spec/outcome-record.md` section 4 applied to
 * the way out), and a frozen **alias** of the stored object passes `isFrozen` while
 * freezing the driver's own state as a side effect. Every case here therefore
 * attempts a write through the handle and asserts **the driver's own state read
 * back** — which is the contract whether the write throws or is silently accepted.
 *
 * Expected values come from `OR-R7` and ADR 0014 rule 2, not from what the driver
 * currently returns.
 */
import { equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { JoinPolicy, Region } from '../../src/driver/policy.ts';
// W4's fixtures, imported rather than copied. `matrix-six-events` is the only
// flow that reaches all six region events in one run; `matrix-two-regions` is the
// only one whose fan-out is not called `split`, which is what makes a
// freeze-conditional-on-regionId mutation reachable. `test/matrix/**` is W4's
// `Owns` — reading from it is not editing it, and a copy here would drift from
// the flows L5 actually runs.
import { sixEvents, twoRegions } from '../matrix/flows.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workerTypes: string[] };

/**
 * A stub, as `test/driver/driver.test.ts` uses: this suite is about what leaves
 * the driver, and a real policy would put W2's behaviour inside W12's gate.
 */
interface StubState { need: number; seen: number }
const stubPolicy: JoinPolicy<StubState> = {
  id: 'stub-arrival',
  open: (r: Region) => ({ need: r.branches.length, seen: 0 }),
  step: (st, e) => (e.type === 'branch.arrived' ? { ...st, seen: st.seen + 1 } : st),
  status: (st) => (st.seen >= st.need ? 'satisfied' : 'waiting'),
  describe: (st) => ({ need: st.need, seen: st.seen }),
};

class Fake {
  readonly added: { id: string }[] = [];
  private l = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown): void { this.added.push(t as { id: string }); }
  addEventListener(t: string, f: (e: { detail: unknown }) => void): void {
    this.l.set(t, [...(this.l.get(t) ?? []), f]);
  }
  settle(id: string, state: string, over: Record<string, unknown> = {}): void {
    const d = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', d);
    else { this.fire('task.failed', d); if (state === 'user_action') this.fire('task.user_action', d); }
  }
  private fire(t: string, detail: unknown): void { for (const f of this.l.get(t) ?? []) f({ detail }); }
}

/**
 * Attempt a write through a handle the driver gave out.
 *
 * A frozen object throws `TypeError` here — every module in this repository is
 * strict — and an unfrozen one accepts it silently. **Neither outcome is the
 * assertion.** The assertion is always the state read back afterwards, so this
 * suite fails the same way whichever half of the defect is present.
 */
function tryWrite(target: unknown, key: string, value: unknown): void {
  try {
    (target as Record<string, unknown>)[key] = value;
  } catch { /* frozen, in strict mode. The caller asserts on the driver, not on this */ }
}

function tryPush(target: unknown, value: unknown): void {
  try {
    (target as unknown[]).push(value);
  } catch { /* frozen array */ }
}

interface Rig {
  scheduler: Fake;
  driver: Driver;
  events: RegionEvent[];
  inputs: FoldInput[];
}

function rigOf(def: FlowDefinition, predicates: Record<string, () => boolean> = {}): Rig {
  const scheduler = new Fake();
  const events: RegionEvent[] = [];
  const inputs: FoldInput[] = [];
  const driver = new Driver(def, {
    runId: 'r1',
    scheduler,
    createTask: (c) => c,
    predicates: new Map(Object.entries(predicates)) as never,
    workerTypes: reg.workerTypes,
    now: () => 1000,
    joinPolicy: stubPolicy as unknown as JoinPolicy,
    onRegionEvent: (e) => events.push(e),
    onFoldInput: (i) => inputs.push(i),
  });
  return { scheduler, driver, events, inputs };
}

async function rig(flow: string, predicates: Record<string, () => boolean> = {}): Promise<Rig> {
  return rigOf(await load(flow), predicates);
}

/** One settled linear run: one outcome record, a nested `result`, no region events. */
async function linearRun(): Promise<Rig> {
  const r = await rig('valid/linear.flow.json');
  r.driver.start({});
  r.scheduler.settle('r1:ingest:-:0', 'done', { result: { nested: { a: 1 } } });
  return r;
}

/** A fan-out entered: two `branch.opened`, nothing terminal yet. */
async function fanoutRun(): Promise<Rig> {
  const r = await rig('valid/fanout-join.flow.json');
  r.driver.start({});
  r.scheduler.settle('r1:ingest:-:0', 'done', { result: null });
  return r;
}

suite('OR-R7 — every ONE of the six region events is frozen, not just the one a fixture happens to emit', (test) => {
  test('all six variants and two distinct regions occur, and every event is frozen', () => {
    // `emit()` has six call sites and `spec/join-policy.md` section 2 fixes six
    // event types. A fixture that only opens branches guards one of them: W12's
    // adequacy reader froze `branch.opened` alone, then `opened`+`arrived`, then
    // froze conditionally on **the fixture's own `regionId`**, and all three
    // survived every assertion in this file's first version.
    //
    // `matrix-six-events` reaches all six in ONE run — three branches, one per
    // terminal event, with a suspension and a resumption on the arriving one —
    // and `matrix-two-regions` is the only fixture in the repository whose
    // fan-out is not called `split`, which is what makes the third mutation
    // reachable. Both are W4's, loaded rather than copied, and both are validated
    // in full by `new Driver(...)` before anything is queued.
    const seen: RegionEvent[] = [];

    const a = rigOf(sixEvents, { isLowConfidence: () => true });
    a.driver.start({});
    a.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });           // opens all three
    a.scheduler.settle('r1:lostA:0:0', 'failed', { error: 'optional, no eligible edge' }); // lost
    a.scheduler.settle('r1:exitB:1:0', 'done', { result: { c: 0.1 } });    // routed away -> exited
    a.scheduler.settle('r1:arriveC:2:0', 'user_action', { error: 'human' }); // suspended
    a.driver.resolve('r1:arriveC:2:0', 'done', { result: {}, actor: 'ops' }); // resumed, then arrived
    seen.push(...a.events);

    // Both predicates the flow names must be registered or `FD-V4` refuses the
    // definition at construction — which is ADR 0002 rule 3 working, not a hurdle.
    const b = rigOf(twoRegions, { isHighConfidence: () => false, isLowConfidence: () => false });
    b.driver.start({});
    b.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });           // opens region `split1`
    seen.push(...b.events);

    equal([...new Set(seen.map((e) => e.type))].sort(), [
      'branch.arrived', 'branch.exited', 'branch.lost',
      'branch.opened', 'branch.resumed', 'branch.suspended',
    ], 'all six of spec/join-policy.md section 2 — an assertion that runs over five of them ' +
       'is an assertion about five of them');
    equal([...new Set(seen.map((e) => e.regionId))].sort(), ['split', 'split1'],
      'and two distinct regions, so freezing cannot be conditional on which one');
    ok(seen.every((e) => Object.isFrozen(e)),
      `OR-R7 and ADR 0014 rule 2 are about what LEAVES the driver, and all ${seen.length} of these do`);
  });

  test("a listener writing to any of them does not rewrite the driver's own sequence", async () => {
    const { driver, events } = await fanoutRun();
    for (const e of events) tryWrite(e, 'branchPath', 'CORRUPTED');
    const paths = driver.foldInputs()
      .filter((i) => i.kind === 'region')
      .map((i) => (i as { event: { branchPath: string } }).event.branchPath);
    equal(paths, ['0', '1'],
      'the measured harm in Q73: onRegionEvent received the object append had just stored, so ' +
      'a listener writing e.branchPath rewrote foldInputs() in place');
  });

  test('and does not rewrite the folded regions', async () => {
    const { driver, events } = await fanoutRun();
    for (const e of events) tryWrite(e, 'regionId', 'CORRUPTED');
    const state = fold(driver.foldInputs());
    equal(Object.keys(state.regions), ['split'],
      'RN-R6 keys regions by fanout id; a rewritable regionId is a run state a listener chooses');
  });
});

suite('OR-R7 / ADR 0014 rule 2 — snapshot() cannot be written through', (test) => {
  test('the array is frozen and a push does not reach the log', async () => {
    const { driver } = await linearRun();
    const snap = driver.snapshot();
    ok(Object.isFrozen(snap), 'the returned array is frozen');
    tryPush(snap, { taskId: 'forged', terminalState: 'done' });
    equal(driver.snapshot().length, 1,
      'OR-R7: a caller holding the array must not be able to forge a settlement — RS-R1 ' +
      'reads the LAST record, so an appended one would decide whether a resolution is legal');
  });

  test('a record is frozen and its result is a copy, not an alias', async () => {
    const { driver } = await linearRun();
    const rec = driver.snapshot()[0]!;
    ok(Object.isFrozen(rec), 'each record is frozen');
    tryWrite(rec, 'terminalState', 'failed');
    // The deeper half: Object.freeze is SHALLOW, so a frozen record whose `result`
    // is the stored object is still writable through. `spec/outcome-record.md`
    // section 4 is the argument, applied on the way out.
    tryWrite((rec as { result?: { nested?: Record<string, unknown> } }).result?.nested ?? {}, 'a', 99);
    const after = driver.snapshot()[0] as { terminalState: string; result: { nested: { a: number } } };
    equal(after.terminalState, 'done', 'the stored record is unchanged');
    equal(after.result.nested.a, 1, 'and its result was deep-copied on the way out, not aliased');
  });
});

suite('OR-R7 / ADR 0014 rule 2 — foldInputs() cannot be written through', (test) => {
  test('the array is frozen and a push does not reach the sequence', async () => {
    const { driver } = await linearRun();
    const inputs = driver.foldInputs();
    ok(Object.isFrozen(inputs), 'the returned array is frozen — the one the rule names');
    const before = inputs.length;
    tryPush(inputs, { kind: 'stopped', reason: 'forged' });
    equal(driver.foldInputs().length, before,
      'ADR 0014 rule 2: fold(driver.foldInputs()) is the whole of run state, so a caller ' +
      'that can append to it can invent an outcome');
  });

  test('every element is a fresh COPY per call, for all EIGHT kinds and not only the two that carry a record', async () => {
    // "A frozen copy" — a frozen ALIAS of the stored element passes `isFrozen`,
    // permanently freezes the driver's own array elements as a side effect, and
    // hands two callers the same object. W12's adequacy reader found the four
    // flat kinds (`dispatched`, `pathEnded`, `joinSettled`, `stopped`) returned
    // as aliases survived every assertion, because no fixture here read one.
    const { driver } = await fanoutRun();
    const a = driver.foldInputs();
    const b = driver.foldInputs();
    const kinds = [...new Set(a.map((i) => i.kind))].sort();
    ok(kinds.includes('dispatched') && kinds.includes('region') && kinds.includes('outcome'),
      `the fixture must reach the flat kinds too, not only the record ones — it reaches ${kinds.join()}`);
    ok(a.every((_, k) => a[k] !== b[k]),
      'each call returns fresh objects: an element shared between two calls is the stored one');
    ok(a.every((i) => Object.isFrozen(i)), 'and every element is frozen');
  });

  test('the record inside an element is a frozen copy, and its result is deep-copied', async () => {
    const { driver } = await linearRun();
    const outcome = driver.foldInputs().find((i) => i.kind === 'outcome')!;
    ok(Object.isFrozen((outcome as { record: object }).record), 'the record inside it is frozen');
    tryWrite((outcome as { record: { taskId: string } }).record, 'taskId', 'r1:forged:-:0');
    tryWrite(
      (outcome as { record: { result?: { nested?: Record<string, unknown> } } }).record.result?.nested ?? {},
      'a',
      99,
    );
    const again = driver.foldInputs().find((i) => i.kind === 'outcome') as
      { record: { taskId: string; result: { nested: { a: number } } } };
    equal(again.record.taskId, 'r1:ingest:-:0', "the driver's own sequence is unchanged");
    equal(again.record.result.nested.a, 1,
      'and `result` is deep-copied here too — freezing the record does not protect what it points at');
  });

  test('a region element carries a frozen event', async () => {
    // **This assertion no longer discriminates and is kept deliberately**, which
    // both readers found independently. `emit()` now freezes before `append`, so
    // every stored region element already carries a frozen event and
    // `freezeInput`'s region arm is dead as a guard: removing it leaves this
    // green. It is defence in depth against a future second producer of a
    // `region` input, and it is recorded as unfalsifiable rather than deleted —
    // `spec/join-policy.md` section 2 does the same for JP-R5's ordering clause.
    const { driver } = await fanoutRun();
    const region = driver.foldInputs().find((i) => i.kind === 'region')!;
    ok(Object.isFrozen((region as { event: object }).event),
      'RN-R3 reads this sequence in append order; an event a caller can rewrite is a region ' +
      'history a caller can rewrite');
  });
});

suite('OR-R7 / ADR 0014 rule 3 — onFoldInput cannot be written through', (test) => {
  test('what the push half hands a listener is frozen, and writing does not reach the driver', async () => {
    const { driver, inputs } = await linearRun();
    ok(inputs.length > 0, 'the listener was called at all');
    ok(inputs.every((i) => Object.isFrozen(i)), 'every element handed to the listener is frozen');
    const outcome = inputs.find((i) => i.kind === 'outcome') as
      { record: { taskId: string; result?: { nested?: Record<string, unknown> } } };
    tryWrite(outcome.record, 'taskId', 'r1:forged:-:0');
    tryWrite(outcome.record.result?.nested ?? {}, 'a', 99);
    const stored = driver.foldInputs().find((i) => i.kind === 'outcome') as
      { record: { taskId: string; result: { nested: { a: number } } } };
    equal(stored.record.taskId, 'r1:ingest:-:0',
      'a listener folding incrementally must not be able to change what a later foldInputs() reads');
    equal(stored.record.result.nested.a, 1, 'including through `result`, which the freeze does not cover');
  });
});

suite('OR-R7 — the seven outbound paths ADR 0014 does not name', (test) => {
  // Derived by W12's conformity reader from `OR-R7`'s own wording — *nothing*
  // outside the inbound API writes to run state — before it opened the code, and
  // then measured. None of these is frozen; every one is a copy, which is the
  // property `OR-R7` actually needs and the one nothing was checking. They are
  // where the next Q73 comes from: `regionsForPolicies()` is safe only because
  // `src/definition/regions.ts` spreads `branches` and `members`, and dropping
  // those two spreads let a caller rewrite the array `arrival-count`'s `N` reads.
  test('dispatchedIds() hands out a copy of the dispatched-id set', async () => {
    const { driver } = await fanoutRun();
    const ids = driver.dispatchedIds();
    const before = ids.length;
    tryPush(ids, 'r1:forged:-:0');
    equal(driver.dispatchedIds().length, before,
      "ID-R1 is asserted against this set; a caller that can add to it can suppress a refusal");
  });

  test('regionsForPolicies() hands out copies of branches and members', async () => {
    const { driver } = await fanoutRun();
    const region = driver.regionsForPolicies()[0]!;
    // Read the lengths BEFORE mutating: the push succeeds on a copy, so comparing
    // against `region` after the fact compares a mutated local with itself.
    const [branches, members] = [region.branches.length, region.members.length];
    tryPush(region.branches, 'forged');
    tryPush(region.members as unknown as string[], 'forged');
    const again = driver.regionsForPolicies()[0]!;
    equal(again.branches.length, branches, "arrival-count's N comes from branches.length — JP section 1");
    equal(again.members.length, members, 'and members is what branchIndexOf walks');
  });

  test('effectiveOutcomeOf() hands out a copy, not the stored record', async () => {
    const { driver } = await linearRun();
    const eff = driver.effectiveOutcomeOf('r1:ingest:-:0') as
      { terminalState: string; result: { nested: { a: number } } };
    tryWrite(eff, 'terminalState', 'failed');
    tryWrite(eff.result.nested, 'a', 99);
    const after = driver.snapshot()[0] as { terminalState: string; result: { nested: { a: number } } };
    equal(after.terminalState, 'done', 'OR-R8 derives the effective outcome; it does not hand out the log');
    equal(after.result.nested.a, 1, 'and `result` is deep-copied on this path too');
  });
});
