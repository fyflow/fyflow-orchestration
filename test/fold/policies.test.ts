/**
 * Every shipped join policy — `JP-R1`, `JP-R2`, the two pins `JP-R7`/`JP-R8`,
 * and since ADR 0025 the third name section 3 fixes.
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
import { arrivalCount, liveToken, liveTokenRequiringArrival, POLICIES } from '../../src/fold/policies.ts';
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

/**
 * **Neither pinned policy carries either refinement, and after ADR 0025 that is a
 * stronger claim rather than a weaker one.** `JP-R8`'s refinement is now SHIPPED —
 * under its own id, in the suite below — so *"live-token does not require an
 * arrival"* is no longer an absence nobody could confuse with anything. It is the
 * difference between two exported policies, and a one-line regression here would
 * silently merge them.
 */
suite('the two pinned policies carry neither refinement — JP-R7 and JP-R8', (test) => {
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
      'JP-R8: requiring an arrival is a THIRD policy and it is now shipped as one — ' +
      '`live-token-requiring-arrival` answers `unsatisfiable` to this exact sequence. ADR 0025 ' +
      'left `liveToken` byte-identical, so this assertion is what says the refinement did not ' +
      'leak into the policy ADR 0003 rule 1 blesses');
  });

  test('live-token NEVER returns unsatisfiable either', () => {
    for (const seq of [[], [opened('0')], [opened('0'), exited('0')]]) {
      ok(verdict(liveToken as never, seq) !== 'unsatisfiable',
        'neither PINNED policy can say "this will never fire" — spec section 4, still true after ' +
        'ADR 0025 because neither of the two was changed. What changed is the consequence: one ' +
        'shape is now reportable by a policy rather than by the driver alone');
    }
  });
});

suite('JP-R1 — every shipped policy is pure', (test) => {
  const seq = [opened('0'), opened('1'), arrived('0'), suspended('1'), resumed('1'), exited('1')];

  for (const [id, p] of Object.entries(POLICIES)) {
    test(`${id}: the same events produce the same state, twice`, () => {
      const run = () => seq.reduce((s, e) => (p as JoinPolicy).step(s, e), (p as JoinPolicy).open(REGION));
      equal(run(), run(), 'no clock, no hidden state, no mutation of the state it was given');
    });

    test(`${id}: step does not mutate its input, on any of the six events`, () => {
      // **`branch.opened` only, until W16's adequacy reader.** That reader found
      // six survivors caused by exactly this: `test/matrix/variants.test.ts`
      // tests non-mutation over all six event types and this loop tested one, so
      // promoting a policy INTO `POLICIES` moved it from the stronger cover to
      // the weaker one. Three of the six survivors were the newly shipped policy
      // mutating `S` in place on `branch.arrived` and on the terminal events, and
      // **two were `live-token` itself** — which had never had the per-event form
      // at all.
      for (const e of [opened('0'), arrived('0'), exited('0'), lost('0'), suspended('0'), resumed('0')]) {
        const s0 = (p as JoinPolicy).open(REGION);
        const before = JSON.parse(JSON.stringify(s0));
        (p as JoinPolicy).step(s0, e);
        equal(s0, before,
          `${id}: step(${e.type}) mutated the state it was handed. JP-R1 says the same S and the ` +
          'same event sequence produce the same S, which a policy that edits S in place satisfies ' +
          'while making every caller`s retained state wrong');
      }
    });

    test(`${id}: describe does not hand out the state itself (JP-R1/JP-R2)`, () => {
      // The aliasing hazard, per policy rather than per shape. The only aliasing
      // test in the repository before W16 was written for `arrivalCount`'s
      // `arrived` ARRAY, so it could not see a policy whose state is all
      // primitives — and `live-token` and the shipped refinement are both of
      // those. `JP-R1` makes `S` opaque and `JP-R2` makes `describe` the only way
      // out; handing back `S` breaks both with one missing spread.
      const s0 = (p as JoinPolicy).open(REGION);
      const st = seq.reduce((acc, e) => (p as JoinPolicy).step(acc, e), s0);
      for (const state of [s0, st]) {
        ok((p as JoinPolicy).describe(state) !== state,
          `${id}: describe returned the policy's own state object. A caller that edits what it ` +
          'was given would be editing the policy through a display value');
      }
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

  test('the section 3 names are the only ones shipped', () => {
    equal(Object.keys(POLICIES).sort(),
      ['arrival-count', 'live-token', 'live-token-requiring-arrival'],
      'the two P1 named, and JP-R8`s refinement under its own id (ADR 0025). **JP-R7`s is NOT ' +
      'here** — it is refused, and `test/matrix/variants.ts` still runs it as a column so the ' +
      'refusal stays falsifiable. This literal is a second copy of `spec/join-policy.md` section ' +
      '3`s table and `scripts/check-policies.mjs` (JP-R9) is what compares them');
  });
});

/**
 * **`live-token-requiring-arrival` — `JP-R8`'s refinement, shipped by ADR 0025.**
 *
 * Every expected value below is derived from `spec/join-policy.md` section 3's
 * **third row**, which is the wording of the NAME, and never from running the
 * policy. That is the trap `JP-R7` and `JP-R8` were written to catch and the one
 * W1 fell into before its own conformity pass.
 *
 * The `positive`-pin test came from `test/matrix/variants.test.ts`, where W15's
 * adequacy reader added it after finding that promoting the variant to a matrix
 * column had brought none of this file's per-policy rules with it. That file's
 * own comment said to move it here if ADR 0025 shipped the variant, rather than
 * to duplicate it. It did, so it is here and it is gone from there.
 */
suite('live-token-requiring-arrival — JP-R8`s refinement, under its own id', (test) => {
  /** Both `live-token`s, one sequence — the two-policy shape this file insists on. */
  const bothTokens = (events: RegionEvent[]) => ({
    token: verdict(liveToken as never, events),
    requiring: verdict(liveTokenRequiringArrival as never, events),
  });

  test('it separates from live-token on exactly one thing: zero arrivals', () => {
    // Section 3, third row: `unsatisfiable` when the count reaches zero having
    // been positive with NO arrival. That is the all-branches-exited shape, and
    // it is the row ADR 0003 records as `live-token`'s cost.
    equal(bothTokens([opened('0'), opened('1'), exited('0'), exited('1')]),
      { token: 'satisfied', requiring: 'unsatisfiable' },
      'live-token fires a join no branch reached; this one says the join can never fire. ' +
      '**That difference IS Q24**, and ADR 0025 is what decided it belongs under a third id ' +
      'rather than inside live-token');

    equal(bothTokens([opened('0'), opened('1'), exited('0'), lost('1')]),
      { token: 'satisfied', requiring: 'unsatisfiable' },
      'and it does not care WHICH non-arrival road each branch took — `exited` and `lost` both ' +
      'decrement and neither counts as an arrival');
  });

  test('and agrees with live-token everywhere an arrival happened', () => {
    for (const seq of [
      [opened('0'), opened('1'), arrived('0'), arrived('1')],
      [opened('0'), opened('1'), arrived('0'), exited('1')],
      [opened('0'), opened('1'), arrived('0'), lost('1')],
      [opened('0'), opened('1'), arrived('0'), suspended('1'), resumed('1'), arrived('1')],
    ]) {
      equal(bothTokens(seq), { token: 'satisfied', requiring: 'satisfied' },
        `one arrival is all the clause asks for: ${JSON.stringify(seq.map((e) => e.type))}`);
    }
  });

  test('and waits wherever live-token waits, including on a person', () => {
    for (const seq of [
      [] as RegionEvent[],
      [opened('0'), opened('1')],
      [opened('0'), opened('1'), arrived('0')],
      [opened('0'), opened('1'), arrived('0'), suspended('1')],
      [opened('0'), opened('1'), exited('0')],
    ]) {
      equal(bothTokens(seq), { token: 'waiting', requiring: 'waiting' },
        'the refinement changes what a zero count MEANS, not when the count is zero — so ' +
        '`suspended` and `resumed` still do neither and a join waiting on a human is not stuck. ' +
        `sequence ${JSON.stringify(seq.map((e) => e.type))}`);
    }
  });

  test('neither verdict latches — a late branch.opened puts both back to waiting', () => {
    // Section 3's third row says so in terms, and `JP-R3` is why: `status` is a
    // pure function of the CURRENT state. `unsatisfiable` is the half that had
    // never been tested anywhere, because nothing in the repository had ever
    // emitted an event after a join was decided (Q95).
    const after = (seq: RegionEvent[]) =>
      seq.reduce((s, e) => liveTokenRequiringArrival.step(s, e), liveTokenRequiringArrival.open(REGION));

    const dead = after([opened('0'), opened('1'), exited('0'), exited('1')]);
    equal(liveTokenRequiringArrival.status(dead), 'unsatisfiable', 'zero live, zero arrived');
    equal(liveTokenRequiringArrival.status(liveTokenRequiringArrival.step(dead, opened('2'))), 'waiting',
      'a policy that recorded `unsatisfiable` in its state would keep reporting a region dead ' +
      'while it had a live branch in it');

    const done = after([opened('0'), opened('1'), arrived('0'), arrived('1')]);
    equal(liveTokenRequiringArrival.status(done), 'satisfied', 'zero live, two arrived');
    equal(liveTokenRequiringArrival.status(liveTokenRequiringArrival.step(done, opened('2'))), 'waiting',
      'and the satisfied half does not latch either, exactly as live-token`s does not');
  });

  test('JP-R8: `positive` is set only by branch.opened', () => {
    // Moved here from `test/matrix/variants.test.ts` by W16, per that suite's own
    // instruction. Setting `positive` unconditionally survives most suites,
    // because `JP-R5` puts every `branch.opened` first so no conformant stream
    // can tell the difference. A NON-conformant one can, and that is the point:
    // the pin exists so `open` itself does not report a verdict.
    equal(liveTokenRequiringArrival.status(liveTokenRequiringArrival.open(REGION)), 'waiting',
      'a bare "count is zero" is true at open — without the pin this reports `unsatisfiable` ' +
      'before a single branch has been dispatched, which is JP-R8`s own sentence');
    for (const e of [arrived('0'), exited('0'), lost('0'), suspended('0'), resumed('0')]) {
      const st = liveTokenRequiringArrival.step(liveTokenRequiringArrival.open(REGION), e);
      equal(liveTokenRequiringArrival.status(st), 'waiting',
        `${e.type} on a fresh region leaves \`positive\` false, so the verdict stays waiting`);
      equal((liveTokenRequiringArrival.describe(st) as { positive: boolean }).positive, false,
        `${e.type} must not set the pin — only branch.opened does`);
    }
  });

  test('a NEGATIVE live count is `waiting`, in this policy exactly as in live-token', () => {
    // **Found by W16's conformity reader**, and it is a divergence from section
    // 3's own words rather than a hypothetical: the third row pins both verdicts
    // to *"the count reaches zero"* and opens with *"as `live-token`"*. A count of
    // -1 has not reached zero, so the definition gives `waiting` — and the policy
    // was written with `s.live > 0`, which gave `unsatisfiable`.
    //
    // `JP-R5` makes the stream below unreachable through a conformant driver: one
    // `branch.opened` cannot be followed by two terminal events. That is exactly
    // why it needs a test rather than a matrix row, and why it matters more here
    // than anywhere else — this is the only shipped policy whose verdict STOPS a
    // run and reports it, so a driver that double-decremented would turn a silent
    // miscount into a reported dead join, in the one state where `live-token`
    // keeps waiting.
    equal(bothTokens([opened('0'), exited('0'), exited('1')]),
      { token: 'waiting', requiring: 'waiting' },
      'live goes 1, 0, -1. Neither policy reports on a count it has overshot');
    equal(bothTokens([opened('0'), arrived('0'), arrived('1')]),
      { token: 'waiting', requiring: 'waiting' },
      'and the same on the arrival road, where the refinement`s own counter is 2 — ' +
      '`arrived > 0` must not be reachable while `live` is wrong');
  });

  test('JP-R2: describe reports the refinement`s own counter', () => {
    const st = [opened('0'), opened('1'), arrived('0'), exited('1')]
      .reduce((s, e) => liveTokenRequiringArrival.step(s, e), liveTokenRequiringArrival.open(REGION));
    equal(liveTokenRequiringArrival.describe(st), { live: 0, positive: true, arrived: 1 },
      '`arrived` is what separates this policy from live-token, so a `describe` that omitted it ' +
      'would report two policies as the same state — and the matrix cell is where a human reads it');
  });
});
