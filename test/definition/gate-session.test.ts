/**
 * **The SECOND OBSERVER of `AGENTS.md` section 20's authoring session** —
 * [W101](../../doc/work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md), P25's exit
 * artifact, and it exists because of one measurement.
 *
 * **W101's adequacy reader made all NINE of that section's guards tautologies at `check:docs` EXIT 0**
 * — individually and all nine at once — and deleted two of its five steps for zero. `X4` counts a
 * `throw` textually and refuses `if (false)` by name, so `x !== x` and `includes('')` are outside both
 * tests, and `RUN_FLOOR` counts SNIPPETS rather than what is inside one. That is `doc/workflow.md`
 * v0.20's clause working: where an `Outputs` row IS an assertion, a set that only DELETES the guard
 * measures nothing. **A snippet cannot be its own second observer**, so the session's registry, gate
 * type, flow and files live in `examples/getting-started/quota-registry.ts` and this file asserts the
 * same verdicts from the same declarations. Tautologise the snippet now and `npm test` is RED.
 *
 * Every expected value here is derived from `spec/flow-definition.md` section 3's *what the schemas buy
 * an author* subsection (v0.26) and from the schemas that module declares — never from output. The
 * reader's own decomposition is worth keeping: the DERIVATION `checkWiring` performs is already bound by
 * `test/definition/wiring.test.ts` at L1-L5, so what this file adds is the SESSION's claims and the one
 * thing only the session has — a consumer's own gate type completing a run on a real scheduler, which
 * `examples/run-flow.ts` never does because its `codeFor` declares no `gateTypes` at all.
 *
 * **What remains a CEILING, stated rather than left**: this file reaches `checkWiring` and not the run,
 * because a real `FyflowScheduler` belongs to ladder L6 and `RT-R10` keeps it out of `test/**`. So the
 * session's step 5 is bound by the snippet alone, and its assertions are what make that step evidence.
 */
import { equal, ok, suite } from '../harness.ts';
import { checkWiring, type WiringVerdict } from '../../src/definition/wiring.ts';
import { distinct, validateDefinition } from '../../src/definition/validate.ts';
import type { GateType } from '../../src/definition/types.ts';
import {
  CLASSIFIED, PER_OWNER_IN, QUOTA, QUOTA_FILES, QUOTA_REGISTRY, QUOTA_WIRING, quotaFlow,
} from '../../examples/getting-started/quota-registry.ts';

suite('W101 — the authoring session`s own verdicts, from the declarations the session imports', (test) => {
  const of = async (key: string, consumer: string): Promise<WiringVerdict[]> =>
    (await checkWiring(QUOTA_WIRING, quotaFlow(key))).verdicts.filter((v) => v.consumer === consumer);

  test('the three key paths: one FITS and two are `no` at the step each stops on', async () => {
    // Derived from `readKeyPath`'s two forbidding shapes and from CLASSIFIED: the root is CLOSED over
    // `file, owner`, so `ownr` stops at `$`; `owner` is CLOSED over `id, name`, so `ident` stops at
    // `$.owner`; and `owner.id` is described at every step, so the route's guarantee applies.
    const TABLE = [
      { key: 'owner.id', kind: 'fits', at: '', names: '' },
      { key: 'ownr.id', kind: 'no', at: '$', names: 'it names file, owner' },
      { key: 'owner.ident', kind: 'no', at: '$.owner', names: 'it names id, name' },
    ] as const;
    equal(TABLE.length, 3, 'three key paths, and a list cut down is caught here rather than by the loop');
    for (const row of TABLE) {
      const arcs = await of(row.key, 'report');
      equal(arcs.length, 1, `${row.key}: report has exactly ONE arc, the one leaving by \`within\``);
      const v = arcs[0]!;
      equal([row.key, v.kind], [row.key, row.kind], `${row.key}: ${v.why}`);
      if (row.kind !== 'no') continue;
      ok(v.why.includes(`gate "quota" is keyed on "${row.key}"`), `the reason names the gate and the key: ${v.why}`);
      ok(v.why.includes(`FORBIDS at ${row.at}:`), `and the STEP it stopped on, ${row.at}: ${v.why}`);
      ok(v.why.includes('additionalProperties: false'), `and the word the schema itself uses: ${v.why}`);
      ok(v.why.includes(row.names), `and the properties that container DOES name: ${v.why}`);
      ok(v.why.includes('route "within"'), `and the ROUTE, which is what is unreachable: ${v.why}`);
    }
  });

  test('the refusal belongs to the ROUTE: one consumer, two arcs, two verdicts, and the reason says which', async () => {
    // `over` and `nokey` share the consumer `skip`, and the TYPE calls only `over` key-resolved. Swapping
    // which two routes are key-resolved gives the SAME sorted pair, so the discriminator is the reason
    // rather than the order — a verdict carries no `route` field (Q410).
    const arcs = await of('ownr.id', 'skip');
    equal(arcs.length, 2, 'two arcs into one consumer, one per route wired into it');
    equal(arcs.map((v) => v.kind).sort(), ['fits', 'no'], 'one of each, because one route is key-resolved and one is not');
    const refused = arcs.filter((v) => v.kind === 'no');
    equal(refused.length, 1, 'exactly one is refused');
    ok(refused[0]!.why.includes('route "over"'), `and it is the OVER arc, which the reason names: ${refused[0]!.why}`);
    // The CONTROL, and it is one by v0.22's test: on a tree where the refusal ignored the key path this
    // goes red while the pair above stays green.
    const right = await of('owner.id', 'skip');
    equal(right.map((v) => v.kind), ['fits', 'fits'], 'keyed on a path the producer describes, neither arc is refused');
  });

  test('the GUARANTEE is what makes the fitting arc fit — the same arc is `no` without it', async () => {
    // `CLASSIFIED` declares `owner` OPTIONAL and `PER_OWNER_IN` REQUIRES it, so on an ordinary edge this
    // is `no`. Only `required` along the key path, added because the route says the path resolved, makes
    // it fit — which is ADR 0068's whole claim, read from the consumer's side.
    ok(!(CLASSIFIED.required as string[]).includes('owner'), 'the producer does not promise `owner`');
    ok((PER_OWNER_IN.required as string[]).includes('owner'), 'and the consumer requires it');
    const { keyResolvedRoutes: none, ...silent } = QUOTA;
    equal([...(none ?? [])], ['within', 'over'], 'the type declares TWO of its three routes key-resolved');
    const blind = (await checkWiring({ ...QUOTA_WIRING, gateTypes: { quota: silent as GateType } }, quotaFlow('owner.id')))
      .verdicts.find((v) => v.consumer === 'report')!;
    equal(blind.kind, 'no', 'with no declared guarantee the arc is `no`');
    ok(blind.why.includes('consumer requires "owner", producer does not guarantee it'),
      `and for the opposite reason to a forbidden path: ${blind.why}`);
  });

  test('the built-in type declares its own two, which is where the member came from', () => {
    equal([...(distinct.keyResolvedRoutes ?? [])], ['first', 'duplicate'],
      '`distinct` calls `first` and `duplicate` key-resolved and `nokey` not — the session says so and this is what says it');
  });

  test('every document the session uses is one the GRAMMAR accepts, which is why a verdict is the only thing that catches the typo', () => {
    const registry = { ...QUOTA_REGISTRY, gateTypes: { quota: QUOTA } };
    for (const key of ['owner.id', 'ownr.id', 'owner.ident']) {
      const findings = validateDefinition(quotaFlow(key), registry as never);
      equal([key, findings.length], [key, 0], `${key}: zero findings — ${JSON.stringify(findings)}`);
    }
    // And the EMPTY key is refused, by `FD-V40`'s settingsSchema clause rather than by any verdict.
    ok(validateDefinition(quotaFlow(''), registry as never).length > 0, 'an EMPTY key path is a construction refusal');
  });

  test('the six files are what make the run`s arithmetic per-KEY rather than per-run', () => {
    // Read off the module, so the session's routes are derivable here without a scheduler: ada owns
    // three (two within a quota of two, one over), grace one, and two files reach `nokey` by the two
    // different roads — an owner whose id is EMPTY, and a name in no owner map at all.
    equal(QUOTA_FILES.length, 6, 'six files, and a list cut down is caught here');
    equal(QUOTA_FILES.map((f) => f.file), ['q1-eu.csv', 'q1-us.csv', 'q2-eu.csv', 'q1-apac.csv', 'scratch.tmp', 'unowned.csv'],
      'in the order the session feeds them, which the per-owner arithmetic does not depend on');
  });
});
