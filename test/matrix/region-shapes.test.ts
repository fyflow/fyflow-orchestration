/**
 * **Region shapes the matrix's nine rows do not reach**, added by W4's
 * test-adequacy pass rather than by the plan.
 *
 * Every fixture in this repository — the whole `spec/examples/valid` corpus and
 * both of W4's other local flows — has **exactly one `fanout`**. `FD-V15` refuses
 * *nested* fan-out; **sequential** fan-out is legal, and so is two regions
 * sharing one `end` node, because `end` nodes are exempt from `FD-V13`, `FD-V19`
 * and `FD-V22` (`spec/flow-definition.md` section 3).
 *
 * `src/driver/driver.ts` handles it, and its comment says what happens if it does
 * not: attributing an `end` by the region *containing* it rather than by the one
 * the branch was *opened in* *"made the wrong join see a second terminal event
 * for a branch that had already arrived, breaking JP-R5"*. **That regression had
 * no test, in any of the twelve suites.** Reverting either of the two lines it
 * lives in produces no throw and no `onRunFailure` — the second join simply never
 * fires and the run stops, which is the silent hang
 * [ADR 0003](../../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
 * claims is now attributable.
 *
 * This is outside W4's declared scope, which is Q5's cases × the two policies. It
 * is here because leaving a measured silent hang untested in the same commit that
 * publishes an ADR about attributing hangs is worse than a widened work item.
 * Whether `spec/` should refuse this shape, support it explicitly, or leave it as
 * it is, is [Q45](../../doc/questions/q45.md).
 */
import { equal, ok, suite } from '../harness.ts';
import { arrivalCount, liveToken } from '../../src/fold/policies.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import { runCell } from './run.ts';
import { TWO_REGIONS } from './scenarios.ts';

/**
 * Derived from `spec/join-policy.md` section 2 and the flow, not from output.
 * Region 1 all-arrives (`isHighConfidence` is false, so `a2` takes its default
 * edge); region 2 runs P1's case (`isLowConfidence` is true, so `b2` reaches
 * `shared`). **Every event names the region the branch was opened in.**
 */
const EVENTS = [
  'opened(split1:0)', 'opened(split1:1)', 'arrived(split1:0)', 'arrived(split1:1)',
  'opened(split2:0)', 'opened(split2:1)', 'arrived(split2:0)', 'exited(split2:1)',
];

suite('two sequential fan-outs sharing one `end` node', (test) => {
  test('every terminal event reaches the region its branch was OPENED in', () => {
    // The single assertion the driver's own regression comment describes and
    // nothing checked. `shared` is in `region(split1)` AND `region(split2)`, so a
    // driver resolving it by node id sends `split2`'s exit to `split1` — which
    // gives `split1` a second terminal event for a branch that already arrived
    // (a `JP-R5` violation) and leaves `split2` one branch short forever.
    for (const [name, policy] of [['live-token', liveToken], ['arrival-count', arrivalCount]] as const) {
      const cell = runCell(TWO_REGIONS, policy as JoinPolicy);
      equal(cell.events, EVENTS,
        `${name}: a terminal event went to the wrong region. Both joins see the same branch ` +
        'paths — `0` and `1` — so without the region id in the stream this is invisible');
    }
  });

  test('region 1 satisfies under BOTH policies, so region 2 is a real two-column cell', () => {
    // Without this the row would only exercise live-token, and a comparison with
    // one column is not a comparison.
    for (const [name, policy] of [['live-token', liveToken], ['arrival-count', arrivalCount]] as const) {
      const cell = runCell(TWO_REGIONS, policy as JoinPolicy);
      ok(Object.keys(cell.payloads).includes('r1:mid:-:0'),
        `${name}: the first join did not fire, so the second region was never entered and this ` +
        'row tests nothing about it');
      ok(Object.keys(cell.payloads).includes('r1:b1:0:0'), `${name}: region 2 never opened`);
    }
  });

  test('and then the second region behaves exactly as P1s case does', () => {
    // Same divergence as the `routed-away` row, one region later. If the
    // attribution were wrong, live-token would report `waiting` here — which is
    // arrival-count's answer, arrived at by a driver bug rather than by a policy.
    const lt = runCell(TWO_REGIONS, liveToken as JoinPolicy);
    equal({ status: lt.status, describe: lt.describe, verdict: lt.verdict },
      { status: 'satisfied', describe: { live: 0, positive: true }, verdict: 'joined' },
      'live-token: region 2 has no live branches left, so `collect2` fires and `publish` runs');

    const ac = runCell(TWO_REGIONS, arrivalCount as JoinPolicy);
    equal({ status: ac.status, describe: ac.describe, verdict: ac.verdict },
      { status: 'waiting', describe: { need: 2, arrived: ['0'] }, verdict: 'stuck' },
      'arrival-count: one arrival is not two, and the run stops with nothing running');
  });

  test('the first join is never asked to fire twice', () => {
    // `spec/join-policy.md` section 4: the driver routes out of a join's single
    // edge **at most once** per region however many events follow. With the
    // attribution wrong, `split1` receives a THIRD terminal event after it has
    // already fired — so counting `mid` dispatches is what makes the violation
    // observable from outside.
    for (const [name, policy] of [['live-token', liveToken], ['arrival-count', arrivalCount]] as const) {
      const cell = runCell(TWO_REGIONS, policy as JoinPolicy);
      const region1Terminals = cell.events.filter((e) =>
        e.startsWith('arrived(split1') || e.startsWith('exited(split1') || e.startsWith('lost(split1'));
      equal(region1Terminals.length, 2,
        `${name}: region 1 has two branches and must see exactly two terminal events (JP-R5). ` +
        `Saw ${region1Terminals.length}: ${region1Terminals.join(' ')}`);
    }
  });
});
