/**
 * Ladder L1-L2 — **what a reference to a large value costs inside a map, held as a CLOCK-FREE COUNT** —
 * [P41](../../doc/plans/p41-what-a-reference-to-a-large-value-costs-inside-a-map.md) decision 5 and its exit artifact's
 * clause (1), [W202](../../doc/work-items/w202-one-shared-copy-per-output-read.md),
 * [ADR 0126](../../doc/decisions/0126-a-references-value-is-one-frozen-copy-shared-by-every-reader.md), `RN-R13` v0.33.
 * A sibling of `map-cost.test.ts` (P41's W202 row), and fyflow-app's ask: *a count in your gate like Q735's*.
 *
 * **The subject**: the copies the driver makes for REFERENCE reads — counted by `outputsCache.copies`, a field of the
 * driver's PRIVATE projection read by a cast (never public, ADR 0121 rule 7) — on the FETCH-THEN-MAP shape (a `fetch`
 * task whose result holds the item list, a `map` over it, each instance's `work` reading `fetch` beside its `"$item"`),
 * at **2,000 and 8,000 items, pinned EXACT** and equal per output read at both sizes:
 *
 * | shape | what `work` (or its edge) declares | copies, derived |
 * |---|---|---|
 * | `one` | `{ item: "$item", all: "fetch" }` | **1** — `fetch`'s one entry, made at the first instance's read and handed to all `n` |
 * | `conditional` | `{ item: "$item", all: "fetch?" }` | **1** — the same: the suffix is read only when there is nothing to copy |
 * | `payload` | `{ item: "$item", run: "$payload" }` | **1** — the run's one copy of the header's payload |
 * | `edge, node` | its guarded edge: `{ f: "fetch" }` | **1** — the EDGE site, every instance's predicate |
 * | `edge, payload` | its guarded edge: `{ run: "$payload" }` | **1** |
 * | `all, conditional` | the same, reading `["score?"]` (W202's adequacy reader, R8: the conditional array form was nowhere) | **n** |
 * | `all` | a SIBLING map of three slots, each `publish` reading `["score"]` | **n** — one per `score` output, made at the first slot's read; the other two slots reuse them. `["fetch"]` is `FD-V28`'s refusal here (fetch has ONE output), so the array form is measured where it is the form |
 *
 * **What it does NOT count** (decision 5): `"$item"`'s per-instance clone (one ELEMENT, `JP-R11`'s cheap end), `"."`'s,
 * `FD-R4`'s clone of the caller's payload at `start()`, the freeze WALK, an `all` answer's fresh array, and `OR-R2`'s
 * settlement clone of every result.
 *
 * **What NEITHER observer sees** (W202's adequacy reader, L1-L3): a per-read clone MADE and KEPT — on the entry, or anywhere
 * outside the driver — while the shared copy is still what is handed, or one made and thrown away. It ticks nothing and
 * hands nothing distinct, so only a heap or `RN-R13` byte measurement sees it — the retention suite's claim that an entry
 * holds nothing but `path`, `result` and `shared` closes the on-the-entry road; the rest is named, not observed.
 *
 * **The second observer, in the same pass**: the DISTINCT objects the run handed under the reference keys — from the
 * double's `addTask` and the predicates' own `ctx.needs`, by identity, no `src/` function shared — 1 per shape, `n` for
 * `all`. The counter shares `sharedOf` / `sharedPayload` with its subject; this does not. **It sees what the counter
 * cannot**: a per-read clone restored WITHOUT a tick (the UNCOUNTED probe below is green on every count and red here).
 *
 * **The provocations are CHECKED IN, as cases** (`doc/workflow.md` section 5 rule 7), one per CALL SITE and per CLAUSE
 * (P41 sentence E): the per-read clone restored at `compose` for a node reference, at `compose` for `"$payload"`, at
 * `resolveNeeds` for each — each by an INSTANCE override installed for the duration of that one method's call, never an
 * edit to `src/` — each asserting it RAN (its own call count above zero) and the EXACT set of clauses it turns red. **Each
 * is BOUNDED**: it clones at most `CAP` times and hands the stored value uncloned after that, still counted; and each runs
 * at 2,000 items, so it is judged on the 2,000-item clauses. The fetched value is SMALL — `n` integers — since the count
 * does not depend on its size (P40 retro (b): this suite's wall is a share of the chromium lane's 60 s).
 *
 * Runs in all three L0-L5 runtimes; nothing here reads a file, so nothing is skipped in the browser bundle.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { DecisionContext } from '../../src/driver/routing.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const SUITE = 'L1-L2 — W202, ADR 0126: a reference read inside a map costs ONE copy per output — outputsCache.copies EXACT at 2,000 and 8,000 items on seven shapes, a second observer, every restored per-read clone red';

const SMALL = 2_000;
const LARGE = 8_000;
const SLOTS = 3;
/** How many times a provocation really clones before it hands the stored value uncloned — still counted. */
const CAP = 64;

type Shape = 'one' | 'conditional' | 'payload' | 'edge, node' | 'edge, payload' | 'all' | 'all, conditional';
const SHAPES: readonly Shape[] = ['one', 'conditional', 'payload', 'edge, node', 'edge, payload', 'all', 'all, conditional'];

/** The keys whose values the second observer collects, per shape. */
const KEY: Record<Shape, string> = { one: 'all', conditional: 'all', payload: 'run', 'edge, node': 'f', 'edge, payload': 'run', all: 'all', 'all, conditional': 'all' };

function definition(shape: Shape): FlowDefinition {
  const end = { id: 'done', kind: 'end', outcome: 'completed' };
  if (shape === 'all' || shape === 'all, conditional') {
    return {
      flowId: 'sibling', version: 1, entry: 'fetch',
      nodes: [
        { id: 'fetch', kind: 'task', type: 'Work', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'score' },
        { id: 'score', kind: 'task', type: 'Work', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'regroup' }] },
        { id: 'regroup', kind: 'task', type: 'Work', edges: [{ to: 'slots' }] },
        { id: 'slots', kind: 'map', over: 'slots', branch: 'publish' },
        { id: 'publish', kind: 'task', type: 'Work', needs: { all: shape === 'all' ? ['score'] : ['score?'] }, edges: [{ to: 'gather' }] },
        { id: 'gather', kind: 'join', of: 'slots', edges: [{ to: 'done' }] },
        end,
      ],
    } as unknown as FlowDefinition;
  }
  const needs = shape === 'one' ? { item: '$item', all: 'fetch' } : shape === 'conditional' ? { item: '$item', all: 'fetch?' }
    : shape === 'payload' ? { item: '$item', run: '$payload' } : undefined;
  const edgeNeeds = shape === 'edge, node' ? { f: 'fetch' } : shape === 'edge, payload' ? { run: '$payload' } : undefined;
  return {
    flowId: 'fetch-map', version: 1, entry: 'fetch',
    nodes: [
      { id: 'fetch', kind: 'task', type: 'Work', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'work' },
      {
        id: 'work', kind: 'task', type: 'Work', ...(needs ? { needs } : {}),
        edges: edgeNeeds ? [{ when: { predicate: 'look' }, to: 'collect', needs: edgeNeeds }, { to: 'collect' }] : [{ to: 'collect' }],
      },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      end,
    ],
  } as unknown as FlowDefinition;
}

/** Settlements a completed run makes: `fetch` and `n` instances; the sibling's `regroup` and three `publish`es besides. */
const isAll = (shape: Shape) => shape === 'all' || shape === 'all, conditional';
const settledOf = (shape: Shape, n: number) => 1 + n + (isAll(shape) ? 1 + SLOTS : 0);
/** The copies, DERIVED — the table in the header: one per distinct output a reference reads. */
const copiesOf = (shape: Shape, n: number) => (isAll(shape) ? n : 1);
/** The outputs read — what `copies` is one per. */
const outputsRead = copiesOf;

class Double {
  readonly added: { id: string; payload: { input?: unknown } }[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push(task as { id: string; payload: { input?: unknown } }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
}

interface Cache { copies: number }
interface Private {
  outputsCache: Cache | null;
  compose(...a: unknown[]): unknown;
  resolveNeeds(...a: unknown[]): unknown;
  sharedOf(c: Cache, e: { result: unknown }): unknown;
  sharedPayload(): unknown;
  runPayload(): unknown;
}
const priv = (d: Driver) => d as unknown as Private;

interface Reading { copies: number; distinct: number }

/**
 * **One run of `shape` over `n` items on the double**, every settlement in turn (the queue walked by index). `provoke`
 * runs on the driver before `start`. Returns the counter and the second observer's count. **The arrangement is checked**:
 * every task settled, nothing reported.
 */
function reading(shape: Shape, n: number, provoke?: (d: Driver) => void): Reading {
  const s = new Double();
  const failures: string[] = [];
  const seen: unknown[] = [];
  const d = new Driver(definition(shape), {
    runId: 'r1', scheduler: s, createTask: (c) => c, workers: { w: { url: 'worker.js' } }, nodeTypes: { Work: { worker: 'w' } },
    predicates: new Map<string, (c: DecisionContext) => boolean>([['look', (ctx) => { seen.push(ctx.needs[KEY[shape]]); return false; }]]),
    joinPolicy: liveToken as unknown as JoinPolicy,
    onRunFailure: (f) => { failures.push(`${f.kind}: ${f.message}`); },
  });
  provoke?.(d);
  d.start({ tenant: 't1' });
  let settled = 0;
  for (let q = 0; q < s.added.length; q += 1) {
    const id = s.added[q]!.id;
    const result = id.includes(':fetch:') ? { items: Array.from({ length: n }, (_, i) => i) }
      : id.includes(':regroup:') ? { slots: Array.from({ length: SLOTS }, (_, i) => i) } : { i: q };
    s.fire('task.completed', { id, state: 'done', result, error: null, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 });
    settled += 1;
  }
  if (failures.length > 0 || settled !== settledOf(shape, n)) {
    throw new Error(`the ${n}-item ${shape} run did not complete: ${failures.join('; ')} — ${settled} of ${settledOf(shape, n)} settled`);
  }
  // The second observer: every value handed under the shape's key — to a worker (the double's `addTask`) or a predicate.
  for (const t of s.added) {
    const input = t.payload?.input as Record<string, unknown> | undefined;
    if (input && typeof input === 'object' && KEY[shape] in input) seen.push(input[KEY[shape]]);
  }
  const objects = isAll(shape) ? seen.flatMap((a) => a as unknown[]) : seen;
  ok(objects.length >= n, `the arrangement: the observer saw ${objects.length} reads, at least one per instance`);
  return { copies: priv(d).outputsCache?.copies ?? 0, distinct: new Set(objects).size };
}

/** The clauses `reading` at `n` fails, per shape — each by name, so a provocation's red SET is exact. */
function failing(shape: Shape, n: number, r: Reading): string[] {
  const out: string[] = [];
  if (r.copies !== copiesOf(shape, n)) out.push(`${shape}: copies @${n}`);
  if (r.distinct !== copiesOf(shape, n)) out.push(`${shape}: distinct @${n}`);
  return out;
}

/**
 * **The per-read clone RESTORED at one call site, for one clause** — an override on the INSTANCE, installed for the
 * duration of `site`'s call and removed after it, so the other site keeps the shared copy. **COUNTED, it is the pre-v0.47
 * read**: a clone of the stored value per read and no shared copy, each clone ticking `outputsCache.copies` as a copy.
 * **UNCOUNTED, it is the case the counter cannot see**: the shared copy made and counted as shipped, and then a clone of
 * it per read that ticks nothing. Bounded per run: at most `CAP` real clones, the value handed uncloned after that.
 */
function restore(site: 'compose' | 'resolveNeeds', clause: 'node' | 'payload', counted: boolean, calls: { n: number }) {
  return (d: Driver) => {
    const p = priv(d);
    const original = p[site];
    let here = 0;
    const clone = (v: unknown) => { calls.n += 1; here += 1; return here <= CAP ? structuredClone(v) : v; };
    const shippedOf = p.sharedOf;
    const shippedPayload = p.sharedPayload;
    p[site] = function (this: Private, ...a: unknown[]) {
      const self = this as unknown as Record<string, unknown>;
      if (clause === 'node') {
        self.sharedOf = (c: Cache, e: { result: unknown }) => {
          if (!counted) return clone(shippedOf.call(this, c, e));
          c.copies += 1;
          return clone(e.result);
        };
      } else {
        self.sharedPayload = () => {
          if (!counted) return clone(shippedPayload.call(this));
          (this as unknown as { cache(): Cache }).cache().copies += 1;
          return clone(this.runPayload());
        };
      }
      try {
        return original.apply(this, a);
      } finally {
        delete self.sharedOf;
        delete self.sharedPayload;
      }
    };
  };
}

const DECLARED_CASES = [
  'the subject: outputsCache.copies EXACT at 2,000 and 8,000 items on seven shapes — one per output read, equal per output at both sizes — and the distinct objects handed equal to it',
  'the per-read clone restored at `compose` for a NODE reference, counted — red on one, conditional and both all shapes, both observers',
  'the per-read clone restored at `compose` for "$payload", counted — red on payload alone',
  'the per-read clone restored at `resolveNeeds` for a NODE reference, counted — red on the edge`s node shape alone',
  'the per-read clone restored at `resolveNeeds` for "$payload", counted — red on the edge`s payload shape alone',
  'the per-read clone restored at `compose` for a NODE reference, UNCOUNTED — every count green, the second observer red: what the counter cannot see',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

/** One provocation's clauses at 2,000 items over every shape, and whether it ran. */
function provoked(site: 'compose' | 'resolveNeeds', clause: 'node' | 'payload', counted: boolean) {
  const calls = { n: 0 };
  const red = SHAPES.flatMap((shape) => failing(shape, SMALL, reading(shape, SMALL, restore(site, clause, counted, calls))));
  return { calls: calls.n, red };
}
const both = (shapes: Shape[]) => shapes.flatMap((s) => [`${s}: copies @${SMALL}`, `${s}: distinct @${SMALL}`]);

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    for (const shape of SHAPES) {
      const small = reading(shape, SMALL);
      const large = reading(shape, LARGE);
      equal([small.copies, large.copies], [copiesOf(shape, SMALL), copiesOf(shape, LARGE)], `${shape}: copies EXACT at ${SMALL} and ${LARGE} items (derived in the header)`);
      equal([small.distinct, large.distinct], [copiesOf(shape, SMALL), copiesOf(shape, LARGE)], `${shape}: the distinct objects handed equal the copies — the second observer`);
      equal([small.copies / outputsRead(shape, SMALL), large.copies / outputsRead(shape, LARGE)], [1, 1], `${shape}: ONE copy per output read, at both sizes`);
      equal([failing(shape, SMALL, small), failing(shape, LARGE, large)], [[], []], `${shape}: no clause red on the shipped code — the control for every probe below`);
    }
  });

  test(DECLARED_CASES[1]!, () => {
    const r = provoked('compose', 'node', true);
    ok(r.calls > 0, 'the probe RAN');
    equal(r.red, both(['one', 'conditional', 'all', 'all, conditional']), 'red on exactly the node-reference shapes read at a node, both observers');
  });

  test(DECLARED_CASES[2]!, () => {
    const r = provoked('compose', 'payload', true);
    ok(r.calls > 0, 'the probe RAN');
    equal(r.red, both(['payload']), 'red on exactly the "$payload" shape read at a node');
  });

  test(DECLARED_CASES[3]!, () => {
    const r = provoked('resolveNeeds', 'node', true);
    ok(r.calls > 0, 'the probe RAN');
    equal(r.red, both(['edge, node']), 'red on exactly the edge`s node-reference shape');
  });

  test(DECLARED_CASES[4]!, () => {
    const r = provoked('resolveNeeds', 'payload', true);
    ok(r.calls > 0, 'the probe RAN');
    equal(r.red, both(['edge, payload']), 'red on exactly the edge`s "$payload" shape');
  });

  test(DECLARED_CASES[5]!, () => {
    const r = provoked('compose', 'node', false);
    ok(r.calls > 0, 'the probe RAN');
    equal(r.red, ['one', 'conditional', 'all', 'all, conditional'].map((s) => `${s}: distinct @${SMALL}`),
      'every COUNT green — the counter cannot see a clone that does not tick — and the second observer red on each shape it restores');
  });

  test(DECLARED_CASES[6]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
