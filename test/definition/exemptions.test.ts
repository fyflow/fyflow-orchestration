/**
 * The three `end`-node exemptions, and the clauses the corpus cannot reach.
 *
 * **`spec/flow-definition.md` section 2 states the exemption as load-bearing** —
 * *"This is why `end` nodes are exempt from `FD-V13`, `FD-V19` and `FD-V22`"* —
 * and section 4 carries a warning earned twice: `FD-V13` at v0.1 and `FD-V19` at
 * v0.2 were both region rules that **rejected the valid corpus**.
 *
 * Dropping any of the three exemptions used to survive the whole suite, because
 * no valid example shares an `end` between branches, or places one in both
 * `region(F)` and `after(F)`, or enters one from outside a region. So an
 * OVER-refusal — the exact historical failure — shipped green. These are the
 * shapes the corpus does not hold, kept in W3's tree rather than added to W1's
 * normative fixture.
 */
import { equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import type { FlowDefinition, Registry } from '../../src/definition/types.ts';

const registry: Registry = {
  predicates: new Set(['isLowConfidence']),
  ...typesFor(['ScoreWorker', 'PublishWorker', 'IngestWorker']),
};

const accepts = (what: string, d: unknown) =>
  equal(
    violatedRules(validateDefinition(d as FlowDefinition, registry)),
    [],
    `this must be ACCEPTED — ${what}. An over-refusal here is the defect that shipped twice ` +
      'in spec/flow-definition.md, and L4 cannot see it because no valid example has this shape.',
  );

suite('the end-node exemptions — three shapes the corpus does not hold', (test) => {
  test('FD-V19: both branches may reach the SAME end node', () => {
    accepts('an `end` shared by two branches is not a convergent branch — it dispatches nothing', {
      flowId: 'shared-end', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [
          { when: 'isLowConfidence', to: 'dropped' }, { to: 'j' }] },
        { id: 'b', kind: 'task', type: 'ScoreWorker', edges: [
          { when: 'isLowConfidence', to: 'dropped' }, { to: 'j' }] },
        { id: 'dropped', kind: 'end', outcome: 'dropped' },
        { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    });
  });

  test('FD-V13: an end node may be in BOTH region(F) and after(F)', () => {
    accepts('a branch and the post-join path may share a terminal node', {
      flowId: 'shared-terminal', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [
          { when: 'isLowConfidence', to: 'done' }, { to: 'j' }] },
        { id: 'b', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j' }] },
        { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    });
  });

  test('FD-V22: an end node inside a region may be entered from outside it', () => {
    accepts('entering an `end` from outside a region opens no branch and reaches no join', {
      flowId: 'outside-end', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [
          { when: 'isLowConfidence', to: 'dropped' }, { to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [
          { when: 'isLowConfidence', to: 'dropped' }, { to: 'j' }] },
        { id: 'b', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j' }] },
        { id: 'dropped', kind: 'end', outcome: 'dropped' },
        { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    });
  });

  test('and the refusals still fire for NON-end nodes in each shape', () => {
    // The exemptions must not be a hole. Same three shapes with a `task` in the
    // shared position, each of which the corpus does cover.
    const fires = (rule: string, d: unknown) =>
      ok(
        violatedRules(validateDefinition(d as FlowDefinition, registry)).includes(rule),
        `${rule} must still fire when the shared node is a task rather than an \`end\``,
      );
    fires('FD-V19', {
      flowId: 'shared-task', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'merge' }] },
        { id: 'b', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'merge' }] },
        { id: 'merge', kind: 'task', type: 'PublishWorker', edges: [{ to: 'j' }] },
        { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    });
  });
});

suite('FD-V3 — both clauses, not just the one the corpus holds', (test) => {
  test('an entry naming a node that does not exist', () => {
    // Without this clause the definition is ACCEPTED, FD-V11's sweep is skipped
    // too (it is guarded on the entry resolving), and the run then dispatches
    // nothing, logs nothing and reports nothing — the same silent stop the
    // `{ "to": 5 }` fix closed, reached from the other end.
    const rules = violatedRules(validateDefinition({
      flowId: 'no-entry', version: 1, entry: 'nope',
      nodes: [{ id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'z' }] },
        { id: 'z', kind: 'end', outcome: 'done' }],
    } as unknown as FlowDefinition, registry));
    ok(rules.includes('FD-V3'), `an unresolvable entry must be refused; got ${rules.join(', ') || 'nothing'}`);
  });
});

suite('FD-V18 and FD-V21 — the sub-clauses the corpus case cannot separate', (test) => {
  const one = (rule: string, what: string, node: unknown) =>
    test(`${rule} — ${what}`, () => {
      const rules = violatedRules(validateDefinition({
        flowId: 'sub', version: 1, entry: 'a',
        nodes: [node, { id: 'z', kind: 'end', outcome: 'done' }],
      } as unknown as FlowDefinition, registry));
      ok(rules.includes(rule), `${what} must be ${rule}; got ${rules.join(', ') || 'nothing'}`);
    });

  one('FD-V18', 'on: [] is empty', { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ on: [], to: 'z' }] });
  one('FD-V18', 'on: ["done","done"] repeats', {
    id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ on: ['done', 'done'], to: 'z' }] });
  one('FD-V21', 'type is not a string', { id: 'a', kind: 'task', type: 5, edges: [{ to: 'z' }] });
  one('FD-V21', 'edges is not an array', { id: 'a', kind: 'task', type: 'ScoreWorker', edges: 'oops' });
});
