/**
 * Both join policies — `JP-R1`, `JP-R2`, and the two pins `JP-R7`/`JP-R8`.
 *
 * **These tests must not be shaped like an arrival counter.** W3's third
 * conformity pass found every one of its seam tests using an arrival-counting
 * stub, so every one asked only the question `arrival-count` can answer — and a
 * one-line regression that made `live-token` behave like `arrival-count` survived
 * a green suite in five runtimes. W2's declaration names that as this item's
 * likeliest blind spot, so the shape here is deliberate:
 *
 *   **every behavioural case runs BOTH policies and asserts they differ where the
 *   spec says they differ, and agree where it says they agree.**
 *
 * A test that ran one policy could not tell a correct `live-token` from a
 * `live-token` that had quietly become `arrival-count`, which is the exact false
 * result `JP-R7` and `JP-R8` exist to forbid.
 */
import { equal, ok, suite } from '../harness.ts';
import { arrivalCount, liveToken, POLICIES } from '../../src/fold/policies.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { JoinPolicy, Region } from '../../src/driver/policy.ts';

const REGION: Region = {
  fanoutId: 'split', joinId: 'collect',
  branches: ['scoreA', 'scoreB'],
  members: ['abandoned', 'scoreA', 'scoreB'],
};

const opened = (b: string): RegionEvent => ({ type: 'branch.opened', regionId: 'split', branchPath: b });
const arrived = (b: string): RegionEvent => ({ type: 'branch.arrived', regionId: 'split', branchPath: b });
const exited = (b: string): RegionEvent =>
  ({ type: 'branch.exited', regionId: 'split', branchPath: b, at: 'abandoned' });
const lost = (b: string): RegionEvent =>
  ({ type: 'branch.lost', regionId: 'split', branchPath: b, reason: 'failed' });
const suspended = (b: string): RegionEvent =>
  ({ type: 'branch.suspended', regionId: 'split', branchPath: b, at: 'scoreB' });
const resumed = (b: string): RegionEvent =>
  ({ type: 'branch.resumed', regionId: 'split', branchPath: b, at: 'scoreB', resolvedAs: 'done' });

/** Run a whole event sequence through a policy and report its verdict. */
function verdict(p: JoinPolicy<never>, events: RegionEvent[]): string {
  let s = (p as JoinPolicy).open(REGION);
  for (const e of events) s = (p as JoinPolicy).step(s, e);
  return (p as JoinPolicy).status(s);
}

/** Both policies, one sequence — the shape every behavioural case here takes. */
function both(events: RegionEvent[]): { arrival: string; token: string } {
  return {
    arrival: verdict(arrivalCount as never, events),
    token: verdict(liveToken as never, events),
  };
}

suite('where the two policies AGREE — the cases that separate nothing', (test) => {
  test('both wait before anything has happened', () => {
    equal(both([]), { arrival: 'waiting', token: 'waiting' },
      "live-token's `positive` latch is what makes this true: a bare \"count is zero\" would " +
      'report satisfied at open, which is why JP-R8 calls the latch a pin rather than a refinement');
  });

  test('both wait with the region open and nothing settled', () => {
    equal(both([opened('0'), opened('1')]), { arrival: 'waiting', token: 'waiting' }, 'two live branches');
  });

  test('both wait on a partial result', () => {
    equal(both([opened('0'), opened('1'), arrived('0')]), { arrival: 'waiting', token: 'waiting' },
      'one of two');
  });

  test('both are satisfied when every branch arrives', () => {
    equal(both([opened('0'), opened('1'), arrived('0'), arrived('1')]),
      { arrival: 'satisfied', token: 'satisfied' },
      'the happy path separates nothing, which is exactly why it is not evidence about Q4');
  });

  test('both keep waiting while a branch is suspended', () => {
    equal(both([opened('0'), opened('1'), arrived('0'), suspended('1')]),
      { arrival: 'waiting', token: 'waiting' },
      'a branch waiting on a person is still live — this is what keeps "waiting on a human" ' +
      'distinguishable from "stuck" (Q7)');
  });

  test('and both proceed once it resumes and arrives', () => {
    equal(both([opened('0'), opened('1'), arrived('0'), suspended('1'), resumed('1'), arrived('1')]),
      { arrival: 'satisfied', token: 'satisfied' }, 'resume then arrive');
  });
});

suite("where they DIFFER — P1's question, as an executable case", (test) => {
  test("a branch routed away from its join: this is the whole plan", () => {
    // The case P1 exists to run. `doc/plans/p1-what-satisfies-a-join.md`: "the
    // branch legitimately never arrives; an arrival counter never completes; the
    // run hangs with no error."
    const seq = [opened('0'), opened('1'), arrived('0'), exited('1')];
    equal(both(seq), { arrival: 'waiting', token: 'satisfied' },
      'arrival-count waits forever for an arrival that will never come; live-token sees the ' +
      'region empty and fires. **This difference IS Q4** — and W4 decides which is right, not this ' +
      'test and not this item');
  });

  test('a branch lost inside the region', () => {
    equal(both([opened('0'), opened('1'), arrived('0'), lost('1')]),
      { arrival: 'waiting', token: 'satisfied' },
      'Q5’s failure row separates them the same way, for the same reason');
  });

  test('every branch leaves without arriving', () => {
    equal(both([opened('0'), opened('1'), exited('0'), lost('1')]),
      { arrival: 'waiting', token: 'satisfied' },
      'live-token reports SATISFIED with nothing arrived. Whether that is right is exactly ' +
      'JP-R8’s question — the variant that would say `unsatisfiable` here is a THIRD policy (Q24)');
  });
});

suite('JP-R7 and JP-R8 — the two refinements that are deliberately absent', (test) => {
  test('arrival-count does NOT decrement on branch.exited', () => {
    // One line would make it survive P1's case, and would return "the two
    // policies are equivalent" as a passing test.
    const s0 = arrivalCount.open(REGION);
    const afterExit = arrivalCount.step(arrivalCount.step(arrivalCount.step(s0, opened('0')), opened('1')), exited('1'));
    equal(arrivalCount.describe(afterExit), { need: 2, arrived: [] },
      'JP-R7: `need` is fixed at open and never adjusted. The decrementing variant is Q24, ' +
      'built after W4 under its own id');
  });

  test('arrival-count ignores every event that is not an arrival', () => {
    const s = [opened('0'), opened('1'), exited('0'), lost('1'), suspended('0'), resumed('0')]
      .reduce((acc, e) => arrivalCount.step(acc, e), arrivalCount.open(REGION));
    equal(arrivalCount.describe(s), { need: 2, arrived: [] }, '"Every other event is ignored"');
  });

  test('arrival-count NEVER returns unsatisfiable', () => {
    // The property W4 is measuring. A policy that cannot say "this will never
    // fire" reports P1's case as a hang — which is Q4's argument as a testable claim.
    const sequences = [[], [opened('0')], [opened('0'), exited('0')],
      [opened('0'), opened('1'), exited('0'), lost('1')]];
    for (const seq of sequences) {
      ok(verdict(arrivalCount as never, seq) !== 'unsatisfiable',
        `arrival-count must never report unsatisfiable; sequence ${JSON.stringify(seq.map((e) => e.type))}`);
    }
  });

  test('live-token does NOT require an arrival before reporting satisfied', () => {
    equal(verdict(liveToken as never, [opened('0'), exited('0')]), 'satisfied',
      'JP-R8: requiring an arrival is the third policy, and it is the one that would hand ' +
      'live-token a graceful answer arrival-count is structurally denied — the asymmetry the rule forbids');
  });

  test('live-token NEVER returns unsatisfiable either', () => {
    for (const seq of [[], [opened('0')], [opened('0'), exited('0')]]) {
      ok(verdict(liveToken as never, seq) !== 'unsatisfiable',
        'neither pinned policy can say "this will never fire" — so a stuck join in W4 is ' +
        "detected by the driver or not at all, which is Q7's pressure with a name");
    }
  });
});

suite('JP-R1 — both policies are pure', (test) => {
  const seq = [opened('0'), opened('1'), arrived('0'), suspended('1'), resumed('1'), exited('1')];

  for (const [id, p] of Object.entries(POLICIES)) {
    test(`${id}: the same events produce the same state, twice`, () => {
      const run = () => seq.reduce((s, e) => (p as JoinPolicy).step(s, e), (p as JoinPolicy).open(REGION));
      equal(run(), run(), 'no clock, no hidden state, no mutation of the state it was given');
    });

    test(`${id}: step does not mutate its input`, () => {
      const s0 = (p as JoinPolicy).open(REGION);
      const before = JSON.parse(JSON.stringify(s0));
      (p as JoinPolicy).step(s0, opened('0'));
      equal(s0, before, 'this is what lets a fold replay a prefix and get the same answer');
    });

    test(`${id}: status is total — every reachable state answers one of three`, () => {
      let s = (p as JoinPolicy).open(REGION);
      const seen = new Set<string>([(p as JoinPolicy).status(s)]);
      for (const e of seq) { s = (p as JoinPolicy).step(s, e); seen.add((p as JoinPolicy).status(s)); }
      for (const v of seen) {
        ok(['waiting', 'satisfied', 'unsatisfiable'].includes(v), `JP-R3: "${v}" is not a status`);
      }
    });

    test(`${id}: describe returns JsonValue (JP-R2)`, () => {
      let s = (p as JoinPolicy).open(REGION);
      for (const e of seq) {
        s = (p as JoinPolicy).step(s, e);
        const d = (p as JoinPolicy).describe(s);
        equal(JSON.parse(JSON.stringify(d)), d,
          'it is how W4 reports what the policy thought it was waiting for, and how a UI would ' +
          'ever show a join. A policy whose state is not describable is not usable');
      }
    });
  }

  test("live-token's satisfied does not latch: a late branch.opened puts it back to waiting", () => {
    // `status` is a pure function of state (`JP-R3`), and `live-token`'s state has
    // one latch — `positive` — and it is deliberately the ONLY one. So a region
    // that reached zero and is then opened again reports `waiting`, not
    // `satisfied`. This is the last untested half of that shape: the conformity
    // pass checked the latch turning ON and nothing checked it not turning the
    // verdict permanent.
    let s = liveToken.open(REGION);
    for (const e of [opened('0'), opened('1'), arrived('0'), arrived('1')]) s = liveToken.step(s, e);
    equal(liveToken.status(s), 'satisfied', 'both branches arrived, so the count is back to zero');

    const late = liveToken.step(s, opened('2'));
    equal(liveToken.status(late), 'waiting',
      'the verdict follows the live count, and one branch is live again. A policy that cached ' +
      '"satisfied" would fire a join whose region still has work in it');
    equal(liveToken.describe(late), { live: 1, positive: true },
      '`positive` stays latched — that is the pin JP-R8 names — while `live` is what moves');

    // And the same stream on `arrival-count`, because a test that ran one policy
    // could not tell these two apart. Its counter has no notion of a branch
    // opening at all, so it stays satisfied — the two DIVERGE here, and that
    // divergence is the point.
    let a = arrivalCount.open(REGION);
    for (const e of [opened('0'), opened('1'), arrived('0'), arrived('1')]) a = arrivalCount.step(a, e);
    equal(arrivalCount.status(a), 'satisfied', 'two distinct arrivals against a need of two');
    equal(arrivalCount.status(arrivalCount.step(a, opened('2'))), 'satisfied',
      'arrival-count ignores every event but an arrival, so a third branch opening is invisible ' +
      'to it. Neither answer is wrong here — the stream is not conformant (JP-R5 puts opens ' +
      'first) — and which behaviour a join WANTS is exactly what W4 measures');
  });

  test('the two are the only ones shipped', () => {
    equal(Object.keys(POLICIES).sort(), ['arrival-count', 'live-token'],
      "W2 ships the two P1 named and nothing else. Q24's variants are built after W4, if at all — " +
      'and whichever wins becomes ADR 0003, which is W4 to write');
  });
});
