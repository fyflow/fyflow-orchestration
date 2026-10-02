/**
 * One case per **clause**, not one per rule id.
 *
 * W3's conformity pass ran 85 mutations and 37 survived. The pattern was almost
 * entirely this: every clause of every multi-clause rule is implemented correctly,
 * and `spec/examples/invalid/` holds **one case per rule id**, so whenever a
 * second clause of the same rule catches the corpus file, deleting the first is
 * invisible.
 *
 * `FD-V7` was the sharp case. Its corpus file has two `when` edges and no bare
 * edge, which trips *both* the "no default" clause and the "not last" clause —
 * **each shadowed the other, so neither could ever fail.** `FD-V7` is the hardest
 * rule in the spec and it was the least covered.
 *
 * These are unit tests over the validator and they live in W3's tree. They are
 * deliberately NOT new files in `spec/examples/invalid/`: that corpus is W1's
 * normative fixture, adding to it is a spec change (`spec/README.md` rule 1), and
 * clause-level coverage of a validator is a property of the validator rather than
 * of the spec.
 *
 * Every expected value is the rule id from `spec/flow-definition.md` section 5.
 */
import { ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import type { FlowDefinition, FlowNode, Registry } from '../../src/definition/types.ts';

const registry: Registry = {
  predicates: new Set(['isLowConfidence', 'isHighConfidence']),
  ...typesFor(['ScoreWorker', 'PublishWorker']),
};

const doc = (nodes: unknown[], over: Record<string, unknown> = {}): FlowDefinition =>
  ({ flowId: 'clause', version: 1, entry: 'a', nodes, ...over }) as unknown as FlowDefinition;

const task = (id: string, edges: unknown[], over: Record<string, unknown> = {}) =>
  ({ id, kind: 'task', type: 'ScoreWorker', edges, ...over }) as unknown as FlowNode;

const end = (id: string) => ({ id, kind: 'end', outcome: 'done' }) as unknown as FlowNode;

/** Asserts the rule fires, and says which clause is under test if it does not. */
function fires(rule: string, clause: string, d: FlowDefinition): void {
  const rules = violatedRules(validateDefinition(d, registry));
  ok(
    rules.includes(rule),
    `${rule} must fire for: ${clause}\n    reported instead: ${rules.join(', ') || '(nothing — accepted)'}`,
  );
}

suite('FD-V7 — every clause, none shadowing another', (test) => {
  test('a task node with no edges', () => {
    fires('FD-V7', 'task node has no edges', doc([task('a', [])]));
  });

  test('no edge is eligible for "done"', () => {
    // Every edge opts into "failed" only, so a success has nowhere to go.
    fires('FD-V7', 'no edge eligible for "done"', doc([task('a', [{ on: ['failed'], to: 'z' }]), end('z')]));
  });

  test('no default edge for a state some edge opts into', () => {
    fires('FD-V7', 'no bare edge among those eligible for "done"',
      doc([task('a', [{ when: { predicate: 'isLowConfidence' }, to: 'z' }, { when: { predicate: 'isHighConfidence' }, to: 'z' }]), end('z')]));
  });

  test('more than one default edge for the same state', () => {
    fires('FD-V7', 'two bare edges eligible for "done"', doc([task('a', [{ to: 'z' }, { to: 'z' }]), end('z')]));
  });

  test('the default edge is not last among its eligible edges', () => {
    // This is the clause FD-V7's corpus case could never exercise: there, `bare`
    // was empty, so the "not last" comparison was reached only via `undefined`.
    fires('FD-V7', 'the bare edge precedes a guarded one',
      doc([task('a', [{ to: 'z' }, { when: { predicate: 'isLowConfidence' }, to: 'z' }]), end('z')]));
  });

  test('a join node with more than one edge', () => {
    fires('FD-V7', 'join has 2 edges', doc([
      task('a', [{ to: 'f' }]),
      { id: 'f', kind: 'fanout', branches: ['b1', 'b2'] },
      task('b1', [{ to: 'j' }]), task('b2', [{ to: 'j' }]),
      { id: 'j', kind: 'join', of: 'f', edges: [{ to: 'z' }, { to: 'z' }] },
      end('z'),
    ]));
  });

  test('a join node edge carrying `when` or `on`', () => {
    const withKey = (edge: unknown) => doc([
      task('a', [{ to: 'f' }]),
      { id: 'f', kind: 'fanout', branches: ['b1', 'b2'] },
      task('b1', [{ to: 'j' }]), task('b2', [{ to: 'j' }]),
      { id: 'j', kind: 'join', of: 'f', edges: [edge] },
      end('z'),
    ]);
    fires('FD-V7', 'join edge carries `when`', withKey({ when: { predicate: 'isLowConfidence' }, to: 'z' }));
    fires('FD-V7', 'join edge carries `on`', withKey({ on: ['done'], to: 'z' }));
  });
});

suite('FD-V9 — every clause', (test) => {
  const withFanout = (branches: unknown, extra: Record<string, unknown> = {}) => doc([
    task('a', [{ to: 'f' }]),
    { id: 'f', kind: 'fanout', branches, ...extra },
    task('b1', [{ to: 'j' }]), task('b2', [{ to: 'j' }]),
    { id: 'j', kind: 'join', of: 'f', edges: [{ to: 'z' }] },
    end('z'),
  ]);
  test('fewer than two branches', () => fires('FD-V9', 'one branch', withFanout(['b1'])));
  test('a repeated branch entry', () => fires('FD-V9', 'b1 twice', withFanout(['b1', 'b1'])));
  test('a fanout carrying edges', () => fires('FD-V9', 'fanout has edges', withFanout(['b1', 'b2'], { edges: [{ to: 'z' }] })));
  test('a branch entry that is not a task', () => fires('FD-V9', 'branch entry is an `end`', withFanout(['b1', 'z'])));
});

suite('FD-V8, FD-V16, FD-V17, FD-V21, FD-V23 — every clause', (test) => {
  test('FD-V8 — an end node with edges', () => {
    fires('FD-V8', 'end has edges', doc([task('a', [{ to: 'z' }]), { id: 'z', kind: 'end', outcome: 'x', edges: [] }]));
  });
  test('FD-V8 — an empty outcome', () => {
    fires('FD-V8', 'outcome is ""', doc([task('a', [{ to: 'z' }]), { id: 'z', kind: 'end', outcome: '' }]));
  });
  test('FD-V16 — a bad flowId charset', () => {
    fires('FD-V16', 'flowId contains ":"', doc([task('a', [{ to: 'z' }]), end('z')], { flowId: 'bad:id' }));
  });
  test('FD-V17 — an undeclared document key', () => {
    fires('FD-V17', 'document carries "extra"', doc([task('a', [{ to: 'z' }]), end('z')], { extra: 1 }));
  });
  test('FD-V17 — an undeclared node key', () => {
    fires('FD-V17', 'task carries "retries"', doc([task('a', [{ to: 'z' }], { retries: 3 }), end('z')]));
  });
  test('FD-V21 — version below 1', () => {
    fires('FD-V21', 'version is 0', doc([task('a', [{ to: 'z' }]), end('z')], { version: 0 }));
  });
  test('FD-V21 — version not an integer', () => {
    fires('FD-V21', 'version is 1.5', doc([task('a', [{ to: 'z' }]), end('z')], { version: 1.5 }));
  });
  test('FD-V21 — an edge target that is not a string', () => {
    // The one that let a run stop silently mid-flow: the graph builder filtered
    // the non-string target out before FD-V2 could see it.
    fires('FD-V21', 'edge.to is a number', doc([task('a', [{ to: 5 }])]));
  });
  test('FD-V21 — an end outcome that is not a string', () => {
    fires('FD-V21', 'outcome is a number', doc([task('a', [{ to: 'z' }]), { id: 'z', kind: 'end', outcome: 7 }]));
  });
  test('FD-V21 — branches that are not an array', () => {
    fires('FD-V21', 'branches is a string', doc([
      task('a', [{ to: 'f' }]), { id: 'f', kind: 'fanout', branches: 'b1' }, end('z'),
    ]));
  });
  test('FD-V23 — a document missing `version`', () => {
    const d = doc([task('a', [{ to: 'z' }]), end('z')]) as unknown as Record<string, unknown>;
    delete d.version;
    fires('FD-V23', 'no version key', d as unknown as FlowDefinition);
  });
  test('FD-V23 — a node missing a kind-specific required key', () => {
    fires('FD-V23', 'task without type', doc([
      { id: 'a', kind: 'task', edges: [{ to: 'z' }] }, end('z'),
    ]));
  });
});

suite('FD-V2 and FD-V6 — a join.of naming nothing violates both', (test) => {
  const orphanJoin = doc([
    task('a', [{ to: 'j' }]),
    { id: 'j', kind: 'join', of: 'nowhere', edges: [{ to: 'z' }] },
    end('z'),
  ]);
  test('FD-V2 — it names a node that does not exist', () => {
    fires('FD-V2', 'join.of names "nowhere"', orphanJoin);
  });
  test('FD-V6 — and a node that does not exist is not a fanout', () => {
    fires('FD-V6', 'join.of does not name a fanout', orphanJoin);
  });
  test('FD-V6 — a fanout with no join naming it', () => {
    fires('FD-V6', 'zero joins for one fanout', doc([
      task('a', [{ to: 'f' }]),
      { id: 'f', kind: 'fanout', branches: ['b1', 'b2'] },
      task('b1', [{ to: 'z' }]), task('b2', [{ to: 'z' }]), end('z'),
    ]));
  });
});

suite('FD-V10 and FD-V11 — a cycle does not suppress unreachability', (test) => {
  test('both fire together', () => {
    const cyclicPlusOrphan = doc([
      task('a', [{ to: 'b' }]),
      task('b', [{ to: 'a' }]),
      task('orphan', [{ to: 'z' }]),
      end('z'),
    ]);
    fires('FD-V10', 'a <-> b', cyclicPlusOrphan);
    fires('FD-V11', 'orphan is unreachable from entry — FD-V10 must not hide it', cyclicPlusOrphan);
  });
});

suite('malformed input is reported, never thrown', (test) => {
  test('a null in nodes', () => {
    fires('FD-V21', 'nodes contains null', doc([null, task('a', [{ to: 'z' }]), end('z')]));
  });
  test('a null in edges', () => {
    fires('FD-V21', 'edges contains null', doc([task('a', [null, { to: 'z' }]), end('z')]));
  });
  test('validateDefinition returns findings rather than throwing, for both', () => {
    // The contract driver.test.ts asserts: InvalidDefinition with rule ids, not an
    // opaque TypeError from inside the validator.
    for (const d of [doc([null]), doc([task('a', [null])])]) {
      const out = validateDefinition(d, registry);
      ok(Array.isArray(out) && out.length > 0, 'malformed input must produce findings');
    }
  });
});
