/**
 * Ladder L2 — **what a run retains, and when a region releases its collection.**
 * [W53](../../doc/work-items/w53-what-a-run-retains-that-nothing-reads.md) under
 * [P15](../../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md),
 * asserting
 * [ADR 0046](../../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
 * and `RN-R13`.
 *
 * **Every expected value here is derived from `spec/` and from the ADR, never from
 * output:**
 *
 * | what | from |
 * |---|---|
 * | which structures may hold a settled result | `RN-R13` in [spec/run-state.md](../../spec/run-state.md) section 7 — `inputs`, and `log` as its record-kind subsequence |
 * | when a region's collection is released | `JP-R11`/`JP-R12` in [spec/join-policy.md](../../spec/join-policy.md) section 4, and ADR 0046 rule 3 |
 * | what a satisfied join carries | `JP-R12` — one entry per branch that emitted `branch.arrived`, keyed by `branchPath`, ascending segment-wise-numeric |
 * | `stuck` on `p1-routed-away` under `arrival-count` | `RN-R10`, and `spec/join-policy.md` section 3's first row |
 * | that a stopped run releases | `OR-R10`, and ADR 0046 rule 3's second moment |
 *
 * ---
 *
 * ### Why this file reaches for a private field, stated rather than left as a smell
 *
 * `doc/workflow.md` section 5 rule 5 says *test the contract, not the
 * implementation*. **Retention IS the contract here** — ADR 0046 rule 1 is a
 * statement about what a run holds — and it is observable through **no** public
 * surface: `snapshot()` and `foldInputs()` both return the log, and `arrivals` is
 * reachable from neither, which is exactly `RN-R13`'s point. The alternatives were
 * both worse. A public accessor would enlarge the surface for a test's convenience,
 * which is [Q53](../../doc/open-questions.md)'s own finding (*a redundant surface is
 * read as a permissive one*); and a byte measurement would need `v8.serialize`,
 * which does not exist in three of the five runtimes L1-L5 must be green in
 * (`spec/runtime-targets.md`).
 *
 * **So the reach is deliberate, it is one named helper rather than casts scattered
 * through the file, and it is recorded here as the cost of the rule being
 * unobservable from outside.** [Q233](../../doc/open-questions.md).
 */
import { deepEqual, equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import { arrivalCount, liveToken } from '../../src/fold/policies.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workerTypes: string[] };

/** The whole scheduler, for level 2. It queues nothing and runs nothing. */
class FakeScheduler {
  readonly added: { id: string; workerType: string; payload: unknown }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void {
    this.added.push(task as { id: string; workerType: string; payload: unknown });
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  settle(id: string, state: 'done' | 'failed' | 'user_action', over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', detail);
    else {
      this.fire('task.failed', detail);
      if (state === 'user_action') this.fire('task.user_action', detail);
    }
  }
  private fire(type: string, detail: unknown): void {
    for (const fn of this.listeners.get(type) ?? []) fn({ detail });
  }
}

function harness(def: FlowDefinition, policy: JoinPolicy, predicates = new Map<string, () => boolean>()) {
  const scheduler = new FakeScheduler();
  const events: RegionEvent[] = [];
  const failures: { kind: string; message: string }[] = [];
  const unsatisfiable: unknown[] = [];
  const driver = new Driver(def, {
    runId: 'r1',
    scheduler,
    createTask: (c) => c,
    predicates: predicates as never,
    workerTypes: reg.workerTypes,
    joinPolicy: policy,
    onRegionEvent: (e) => events.push(e),
    onUnsatisfiableJoin: (i) => unsatisfiable.push(i),
    onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
  });
  return {
    scheduler, driver, events, failures, unsatisfiable,
    ids: () => scheduler.added.map((t) => t.id),
    payloadOf: (id: string) => scheduler.added.find((t) => t.id === id)?.payload,
  };
}
type H = ReturnType<typeof harness>;

/**
 * **The one reach into the driver, named once** — see the header. The shape is
 * `Map<fanoutId, Map<branchPath, payload>>`, which is the field's own declaration.
 */
const arrivalsOf = (d: Driver): Map<string, Map<string, unknown>> =>
  (d as unknown as { arrivals: Map<string, Map<string, unknown>> }).arrivals;

/** How many arrival entries the driver is holding, across every region. */
const heldArrivals = (d: Driver): number => {
  let n = 0;
  for (const [, m] of arrivalsOf(d)) n += m.size;
  return n;
};

/**
 * **`RN-R13`'s own observer: which of the driver's structures a settled result's
 * text is reachable from.** Identity cannot answer this — `OR-R2` deep-copies
 * `result` at the listener boundary, so the worker's own object is in none of them —
 * and a byte count cannot, because `v8.serialize` is Node-only. A unique marker
 * string and a JSON walk work in all five runtimes and say exactly what the rule is
 * about: *how many places hold it*, not how big they are.
 *
 * `graph`, `opts` and `def` are excluded because they are the DEFINITION and the
 * caller's options — neither grows with the run, which is the rule's subject.
 */
function holdersOf(d: Driver, marker: string): string[] {
  const o = d as unknown as Record<string, unknown>;
  const out: string[] = [];
  for (const k of Object.keys(o)) {
    if (k === 'graph' || k === 'opts' || k === 'def') continue;
    const v = o[k];
    const flat = v instanceof Map || v instanceof Set ? [...v] : v;
    if (!flat || typeof flat !== 'object') continue;
    let text: string;
    try {
      text = JSON.stringify(flat, (_key, val) => (val instanceof Map ? [...val] : val));
    } catch {
      continue; // a cyclic structure holds no settled result here
    }
    if (typeof text === 'string' && text.includes(marker)) out.push(k);
  }
  return out.sort();
}

/** A 3-item map over `over: "items"`, so the arity is the RUN's and not the document's. */
const MAP_FANOUT = 'valid/map-fanout.flow.json';
const THREE = { items: ['a', 'b', 'c'], rows: ['x', 'y'] };

suite('ADR 0046 / RN-R13 — a region releases its collection when its join becomes terminal', (test) => {
  /**
   * **THE DISCRIMINATING PAIR, and `doc/workflow.md` section 5 rule 8's fourth
   * requirement on the set is why the difference is asserted too.** Two runs of ONE
   * definition at ONE arity, differing in exactly one thing: whether the last branch
   * settled. Collapse that — settle all three in both, or two in both — and one half
   * of this test fails naming which, rather than the suite quietly getting smaller.
   */
  test('the pair — arrivals are EMPTY once the join has fired and NON-EMPTY before it', async () => {
    const fired = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    fired.driver.start({});
    fired.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    const settledInFired = ['r1:score:0:0', 'r1:score:1:0', 'r1:score:2:0'];
    for (const id of settledInFired) fired.scheduler.settle(id, 'done', { result: { s: id } });

    const waiting = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    waiting.driver.start({});
    waiting.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    const settledInWaiting = ['r1:score:0:0', 'r1:score:1:0'];
    for (const id of settledInWaiting) waiting.scheduler.settle(id, 'done', { result: { s: id } });

    // **What makes the two differ, asserted rather than assumed.** The arity is the
    // same in both — three instances dispatched from one `items` array — so the pair
    // turns on SETTLEMENT and on nothing else. Section 5 rule 8's fourth requirement.
    equal(fired.ids().length, waiting.ids().length - 0 + 1,
      'the fired run dispatched one more task than the waiting one — the join`s successor. ' +
      'If these were equal the pair would be two copies of one run');
    equal(settledInFired.length, 3, 'three branches settled in the fired run — the whole region');
    equal(settledInWaiting.length, 2, 'two in the waiting run — one short, which is what keeps its join open');
    equal(
      fired.events.filter((e) => e.type === 'branch.arrived').length -
        waiting.events.filter((e) => e.type === 'branch.arrived').length,
      1,
      'and the difference reaches the region event stream as exactly one arrival, so the ' +
      'fixtures` disagreement is a fact about the RUN rather than about two literals',
    );

    // THE RULE. ADR 0046 rule 3.
    equal(heldArrivals(fired.driver), 0,
      'ADR 0046 rule 3 — the join became terminal, so the region`s collection is released. ' +
      'Before W53 this was 3 and stayed 3 for the life of the driver',
    );
    equal(arrivalsOf(fired.driver).size, 0,
      'and the region`s entry itself is gone, not merely emptied — an empty inner Map per ' +
      'region would still grow with the number of regions a run enters',
    );
    equal(heldArrivals(waiting.driver), 2,
      'JP-R12`s window is still OPEN in the other half: two branches have arrived at a join ' +
      'that has not become terminal, and the driver is holding exactly those two',
    );
  });

  /**
   * **The SECOND observer on the same fact, and it is what makes the release`s ORDER
   * load-bearing rather than a comment** — `doc/workflow.md` section 5 rule 8
   * obligation (c)'s LIMIT: a clause with one observer cannot corroborate itself.
   * The test above reads the driver's own map; this reads what the join CARRIED.
   * A release moved before `collectArrivals` leaves the first assertion green and
   * this one red — which is P15 fact 3's negative control, measured at **13**
   * L1-L5 failures.
   */
  test('the release is AFTER the read — the join carries all three, keyed by branchPath', async () => {
    const h = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    for (const i of [0, 1, 2]) h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { s: i } });

    const carried = h.payloadOf('r1:publish:-:0');
    ok(
      deepEqual(carried, { 0: { s: 0 }, 1: { s: 1 }, 2: { s: 2 } }),
      'JP-R12 — one entry per branch that emitted branch.arrived, keyed by branchPath, in ' +
      'ascending segment-wise-numeric order. Released BEFORE this read, it is `{}`',
    );
    equal(Object.keys(carried as object), ['0', '1', '2'],
      'all three keys, so the collection was complete at the moment it was read',
    );
    equal(heldArrivals(h.driver), 0, 'and released immediately after, which is the pair');
  });

  /**
   * **`RN-R13` — which structures hold a settled result.** The rule says a run's
   * footprint is *(tasks settled) x (bytes each returned)* and names `inputs` as
   * what holds it; this is that claim made falsifiable. A second copy introduced
   * anywhere the driver can reach fails here naming the field it landed in.
   */
  test('RN-R13 — a settled branch result is reachable from `inputs` and `log`, and nothing else', async () => {
    const MARK = 'W53-MARKER-9f3c';
    const h = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });

    // BEFORE the join becomes terminal: two branches in, one still live.
    h.scheduler.settle('r1:score:0:0', 'done', { result: { s: MARK } });
    h.scheduler.settle('r1:score:1:0', 'done', { result: { s: MARK } });
    equal(holdersOf(h.driver, MARK), ['arrivals', 'inputs', 'log'],
      'inside JP-R12`s window the collection is a THIRD holder, and P15 fact 3 measured it ' +
      'as a second COPY rather than an alias — 49.8% of what a region-bearing run holds',
    );

    // AFTER: the join fires and the window closes.
    h.scheduler.settle('r1:score:2:0', 'done', { result: { s: MARK } });
    equal(holdersOf(h.driver, MARK), ['inputs', 'log'],
      'RN-R13 — `inputs` is what holds every result and `log` is its record-kind subsequence ' +
      'BY REFERENCE, so these two are one copy. A third name here is a second copy',
    );
    ok(
      JSON.stringify(h.driver.snapshot()).includes(MARK),
      'and the result itself is UNTOUCHED — rule 2. What was released is the copy nothing ' +
      'reads, never the log the fold is a pure function of',
    );
  });

  /**
   * **Decision 2, asserted rather than argued.** P15 forbids anything that makes
   * `fold()` return a plausible wrong answer. The release cannot, and the reason is
   * structural: no `FoldInput` kind carries a join's collection at all — `dispatched`
   * carries a `taskId` and nothing else, which is `spec/run-state.md` section 6's own
   * sentence. **This is also the [Q15](../../doc/open-questions.md) finding**: a run
   * resumed from a persisted log cannot be handed a collection no log carries.
   */
  test('nothing the fold reads moved — no FoldInput carries what a join collected', async () => {
    const MARK = 'W53-COLLECTED-4d71';
    const h = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    for (const i of [0, 1, 2]) h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { [MARK]: i } });

    // **`publish` is settled too, and the reason is `RN-R7`/`RN-R10`'s precedence
    // rather than tidiness**: the join's successor is dispatched and not yet settled,
    // so the run is `running` — which outranks `completed` and says nothing about
    // this rule. The first draft asserted `completed` here and the suite caught it.
    h.scheduler.settle('r1:publish:-:0', 'done', { result: { ok: true } });

    const inputs = h.driver.foldInputs();
    const nonRecord = inputs.filter((i: FoldInput) => i.kind !== 'outcome' && i.kind !== 'resolution');
    ok(nonRecord.length > 0, 'the sequence carries region events, dispatches and a joinSettled');
    equal(
      nonRecord.filter((i: FoldInput) => JSON.stringify(i).includes(MARK)).map((i: FoldInput) => i.kind),
      [],
      'no non-record input carries a result at all, so the collection a join carries is in ' +
      'NO element of the fold`s sequence — which is why releasing it cannot change fold()',
    );
    const state = fold(inputs);
    equal(state.outcome, 'completed',
      'RN-R10 — every live path reached an `end`, and it still does with the collection released',
    );
    equal(Object.keys(state.nodes).length, 5,
      'ingest, three instances and publish — one entry per DISPATCHED task (RN-R4), unmoved',
    );
  });

  /**
   * **ADR 0046 rule 3's OTHER site, and it is the reachable half of the exception.**
   * A policy reporting `unsatisfiable` latches `firedJoins` and routes nowhere, so
   * the region's collection is dead without ever having been read.
   *
   * **The policy is a STUB and that is recorded rather than argued** —
   * `doc/workflow.md` section 5 rule 8: *construct the case that makes each guard
   * fire, and where the corpus cannot express one, RECORD that*. None of the three
   * shipped policies reaches this shape: `arrival-count` fires on the N-th arrival,
   * and both live-token variants answer `unsatisfiable` only when every branch is
   * terminal and **none arrived**, so the one region they can declare dead holds an
   * empty collection and could not discriminate a release from its absence. A policy
   * that declares a region dead with arrivals recorded is lawful under `JP-R3` and is
   * what this asserts.
   */
  test('the unsatisfiable exit releases too — a region declared dead with arrivals in it', async () => {
    let terminals = 0;
    const deadAfterTwo: JoinPolicy = {
      id: 'w53-dead-after-two',
      open: () => ({}),
      step: (s: unknown, e: RegionEvent) => {
        if (e.type === 'branch.arrived' || e.type === 'branch.exited' || e.type === 'branch.lost') terminals++;
        return s;
      },
      status: () => (terminals >= 2 ? 'unsatisfiable' : 'waiting'),
      describe: () => 'w53 — declared dead with one branch already arrived',
    } as unknown as JoinPolicy;

    const h = harness(await load(MAP_FANOUT), deadAfterTwo);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });

    h.scheduler.settle('r1:score:0:0', 'done', { result: { s: 0 } });
    equal(heldArrivals(h.driver), 1,
      'one arrival recorded and the policy still waiting — the window is open, which is what ' +
      'makes the next assertion a release rather than an empty map',
    );

    h.scheduler.settle('r1:score:1:0', 'done', { result: { s: 1 } });
    equal(h.unsatisfiable.length, 1, 'the policy declared the region dead on the second terminal event');
    equal(heldArrivals(h.driver), 0,
      'ADR 0046 rule 3 — `firedJoins` latched, so no later settleJoin for this region runs and ' +
      'no later arrival is recorded. The collection is unreachable and is released',
    );

    // **The third instance is settled so the run reaches a quiescent point with
    // nothing running** — `RN-R10`'s precedence puts `running` above `stuck`, so a
    // region with a live branch says nothing about a dead join. It also exercises
    // rule 4 in passing: this arrival reaches a join that is already terminal.
    h.scheduler.settle('r1:score:2:0', 'done', { result: { s: 2 } });
    equal(heldArrivals(h.driver), 0, 'and rule 4 held for it — nothing was recorded');

    const state = fold(h.driver.foldInputs());
    equal(state.outcome, 'stuck',
      'RN-R10 — a joinSettled with fired:false gives the region joined:false, and nothing ' +
      'downstream of the join is ever dispatched. The release did not change that',
    );
    equal(state.regions['split']?.joined, false,
      'RN-R11 — `false` means a policy reported it unsatisfiable, which is this row`s whole shape',
    );
  });

  /**
   * **ADR 0046 rule 4's opening bound.** Without it the release is a leak with a
   * narrower mouth: an arrival reaching a join that has already become terminal would
   * mint a fresh inner map and store a payload nothing can read, once per late
   * arrival, for the life of the run.
   *
   * **Constructed, for the same reason as the row above** — no shipped policy fires a
   * join with branches still live, which is precisely the precondition
   * [Q95](../../doc/open-questions.md) records for `settleJoin`'s own `at most once`
   * latch. The same hypothetical policy, reaching the same region through a second
   * door.
   */
  test('rule 4 — an arrival at a join that has ALREADY become terminal records nothing', async () => {
    const eagerly: JoinPolicy = {
      id: 'w53-satisfied-at-once',
      open: () => ({}),
      step: (s: unknown) => s,
      status: () => 'satisfied',
      describe: () => 'w53 — satisfied on the first terminal event, with branches still live',
    } as unknown as JoinPolicy;

    const h = harness(await load(MAP_FANOUT), eagerly);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });

    h.scheduler.settle('r1:score:0:0', 'done', { result: { s: 0 } });
    ok(h.ids().includes('r1:publish:-:0'), 'the join fired on the first arrival and routed out');
    equal(heldArrivals(h.driver), 0, 'and released what it read');

    // The two branches that were still live now arrive at a join that is terminal.
    h.scheduler.settle('r1:score:1:0', 'done', { result: { s: 1 } });
    h.scheduler.settle('r1:score:2:0', 'done', { result: { s: 2 } });
    equal(heldArrivals(h.driver), 0,
      'ADR 0046 rule 4 — outside JP-R12`s window nothing is recorded. Without the firedJoins ' +
      'guard in `enter`s join arm these two payloads are held for the life of the run and ' +
      'are readable by nothing, which is the defect rule 3 exists to remove',
    );
    equal(arrivalsOf(h.driver).size, 0,
      'and no entry was MINTED for the region either — `arrivalsOf` creates on first touch, so ' +
      'a guard placed on the `set` alone would leave one empty Map per late arrival`s region',
    );
  });

  /**
   * **ADR 0046 rule 3's run-level moment.** `OR-R10` — the driver has stopped
   * routing, so no join of any region will settle again and every collection is
   * unreadable whether or not its join had fired.
   */
  test('a refusal that stops the run releases every region, and leaves the log whole', async () => {
    const MARK = 'W53-STOPPED-7b20';
    const h = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });

    h.scheduler.settle('r1:score:0:0', 'done', { result: { s: MARK } });
    equal(heldArrivals(h.driver), 1, 'one branch has arrived and the join is still waiting');

    // OR-R6 — an uncloneable result stops the run at the listener boundary.
    h.scheduler.settle('r1:score:1:0', 'done', { result: { bad: () => 1 } });
    equal(h.failures.map((f) => f.kind), ['UncloneableResult'],
      'OR-R6 — structuredClone throws and the run is stopped, naming the task id',
    );
    equal(heldArrivals(h.driver), 0,
      'ADR 0046 rule 3 — the run stopped, so nothing can route again and every region`s ' +
      'collection is released. This is not per-region: the whole map is cleared',
    );
    ok(
      JSON.stringify(h.driver.snapshot()).includes(MARK),
      'rule 2 — and the LOG is untouched. A stopped run is a run a consumer folds to find out ' +
      'what happened, so releasing what the fold reads is the plausible wrong answer P15 ' +
      'decision 2 forbids',
    );
    equal(fold(h.driver.foldInputs()).outcome, 'stopped', 'RN-R8 — stopped outranks everything');
  });

  /**
   * **ADR 0046 rule 5 — the exception, on a corpus flow, with the fold`s own word for
   * it.** A region whose join never becomes terminal holds its collection until the
   * driver is released, and the driver cannot know: `stuck` is decided in the FOLD at
   * a quiescent point (`RN-R10`), and moving that determination into the driver is
   * what ADR 0014 rule 4 and ADR 0001 rule 1 both forbid.
   *
   * **This is the run whose footprint matters most and the one the release does not
   * reach**, which is why the rule states the bound over LIVE regions rather than
   * over the run.
   */
  test('rule 5 — a run the FOLD calls `stuck` still holds its collection, and that is the bound', async () => {
    const h = harness(
      await load('valid/p1-routed-away.flow.json'),
      arrivalCount as JoinPolicy,
      new Map([['isLowConfidence', () => true]]),
    );
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { confidence: 0.1 } });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: { s: 'a' } });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { s: 'b' } });

    equal(h.events.filter((e) => e.type === 'branch.arrived').map((e) => e.branchPath), ['0'],
      'P1`s case — scoreB routes away to `abandoned`, so exactly one branch arrives and ' +
      'arrival-count is short of its N forever',
    );
    equal(
      h.driver.foldInputs().filter((i: FoldInput) => i.kind === 'joinSettled').length, 0,
      'the join never became terminal — no policy said unsatisfiable and the driver never ' +
      'routed out, so neither of ADR 0046 rule 3`s per-region moments occurred',
    );
    equal(heldArrivals(h.driver), 1,
      'ADR 0046 rule 5 — the collection is RETAINED, and that is the rule rather than a leak. ' +
      'A run that hangs is exactly the run that keeps everything',
    );
    equal(fold(h.driver.foldInputs()).outcome, 'stuck',
      'RN-R10 says `stuck` and the DRIVER was never told — which is why the bound is stated ' +
      'over regions whose join is still live rather than over the run',
    );
  });
});
