/**
 * Ladder L2 — **a join hands on each branch under its OWN key, and a checkpoint of the old keying is refused by
 * format**: `spec/join-policy.md` v0.25 `JP-R12`, `spec/run-state.md` v0.36 `RN-R16` and `RN-R23`,
 * [ADR 0138](../../doc/decisions/0138-a-join-hands-on-each-branch-under-its-own-key-and-a-checkpoint-of-the-old-keying-is-refused-by-format.md),
 * [W217](../../doc/work-items/w217-a-join-keyed-by-each-branchs-own-key-and-checkpoint-format-2.md), P44 (a1) and (b).
 * No scheduler; L2's usual fake, and every settlement is delivered by this file.
 *
 * **Every expected collection is derived by hand from the flow written here and the values this file settles**, never
 * from the driver's output: a `map` instance's key is its ITEM INDEX, a `fanout` branch's is its ENTRY NODE ID, one
 * segment at every depth; entries inserted in ascending index and in `branches` order; the object's own order the
 * language's (integer-like keys first, ascending). **Each claim carries its control on the same run**:
 *
 * | claim | the control beside it |
 * |---|---|
 * | pass 5's own flow hands on `{"prep":{"0":1,"1":2},"side":{"xs":[1,2]}}`; an `if` on `input.prep.1` takes `then` | the same `if` on 0.11.0's path `input.0.0.1` takes `else` |
 * | a fan-out settled in REVERSE comes out in `branches` order (non-integer-like ids keep INSERTION order) | entries the language orders (`"b"`, `"2"`): `"2"` first, not `branches` order |
 * | an entry id `__proto__` is an OWN key, through `structuredClone` and through a resume's re-dispatch | the object's prototype is still `Object.prototype` — an ASSIGNMENT would have set it and left no key |
 * | the wiring check's record carries the entry id and the item index (`prep.0` described as a string is `no`) | the full path `prep.0.0` and the position `0` meet nothing (`fits`) |
 * | a format-1 checkpoint refused `format` by `resume()`, `runtime.resume` and `inputOf` — a run with a join and one without | the SAME run's format-2 checkpoint resuming and read |
 *
 * **The `__proto__` case discriminates assignment from definition in node 24 and a browser, and NOT in deno** — measured
 * by W217's re-take (the session scratchpad's `w217/proto-clone.mjs`): deno 2.9.6 has no `Object.prototype.__proto__`
 * accessor, so `o['__proto__'] = v` there defines an own key as `fromEntries` does. The case passes in all three runtimes
 * on the shipped code; a provocation of it must be graded in node.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { CHECKPOINT_FORMAT, Driver, inputOf, ResumeRefused, resumeRefusal } from '../../src/driver/driver.ts';
import type { Checkpoint, DriverOptions, InputOfOptions } from '../../src/driver/driver.ts';
import { checkWiring } from '../../src/definition/wiring.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import { createRuntime } from '../../src/scheduler/runtime.ts';
import type { FlowDefinition, JsonSchema, RegistryDocument } from '../../src/definition/types.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';

const SUITE = 'L2 — W217, ADR 0138: a join hands on each branch under its OWN key, and format 1 is refused';

const DECLARED_CASES = [
  'pass 5`s own flow: a fan-out keyed by entry id holding a map keyed by item index, and input.prep.1 reaches the second item',
  'a fan-out settled in REVERSE comes out in `branches` order, and integer-like entry ids are listed first by the language',
  'an entry id `__proto__` is an OWN key of the collection — through structuredClone, and through a resume`s re-dispatch',
  'the wiring check`s record carries the entry id and the item index — never the full path or the position',
  'a format-1 checkpoint is refused `format` by resume(), runtime.resume and inputOf — with a join and without — beside the same run at format 2',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

class FakeScheduler {
  readonly added: { id: string; payload: unknown }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push(task as { id: string; payload: unknown }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  done(id: string, result: unknown): void {
    const detail = { id, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result, error: null };
    for (const fn of this.listeners.get('task.completed') ?? []) fn({ detail });
  }
  ids(): string[] { return this.added.map((t) => t.id); }
  inputOf(id: string): unknown {
    return (this.added.find((t) => t.id === id)?.payload as { input?: unknown } | undefined)?.input;
  }
}

const TYPES = typesFor(['Echo', 'Check', 'OnThen', 'OnElse']);
const OPTS: InputOfOptions = { predicates: new Map(), ...TYPES, joinPolicy: liveToken as unknown as JoinPolicy };

function make(flow: FlowDefinition, runId = 'r1'): { driver: Driver; sch: FakeScheduler } {
  const sch = new FakeScheduler();
  const driver = new Driver(flow, {
    runId, scheduler: sch, createTask: (c) => c, ...OPTS, now: () => 0,
  } as DriverOptions);
  return { driver, sch };
}

/** fyflow-app's pass 5 #1 flow, verbatim in its nodes, with `outer`'s successor `check` a task or an `if` gate. */
const PASS5 = (after: Record<string, unknown>[]): FlowDefinition => ({
  flowId: 'pass5', version: 1, entry: 'split',
  nodes: [
    { id: 'split', kind: 'fanout', branches: ['prep', 'side'] },
    { id: 'prep', kind: 'task', type: 'Echo', edges: [{ to: 'each' }] },
    { id: 'each', kind: 'map', over: 'xs', branch: 'work' },
    { id: 'work', kind: 'task', type: 'Echo', edges: [{ to: 'inner' }] },
    { id: 'inner', kind: 'join', of: 'each', edges: [{ to: 'outer' }] },
    { id: 'side', kind: 'task', type: 'Echo', edges: [{ to: 'outer' }] },
    { id: 'outer', kind: 'join', of: 'split', edges: [{ to: 'check' }] },
    ...after,
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
}) as unknown as FlowDefinition;
const CHECK_TASK = [{ id: 'check', kind: 'task', type: 'Check', edges: [{ to: 'done' }] }];
const CHECK_IF = (path: string) => [
  { id: 'check', kind: 'gate', type: 'if', settings: { when: { path, op: 'eq', value: 2 } }, edges: [{ route: 'then', to: 'onThen' }, { to: 'onElse' }] },
  { id: 'onThen', kind: 'task', type: 'OnThen', edges: [{ to: 'done' }] },
  { id: 'onElse', kind: 'task', type: 'OnElse', edges: [{ to: 'done' }] },
];

/**
 * Drive pass 5's flow with `{ xs: [1, 2] }`: `prep` and `side` each return the value they were handed (an Echo), the
 * map's two instances each their item. Task ids by hand from `spec/task-id.md`: `prep` at branch `0`, `side` at `1`, the
 * map's instances at `0.0` and `0.1`. `side` settles FIRST and the second instance before the first, so neither the
 * settlement order nor the dispatch order is the order the keys are inserted in.
 */
function drivePass5(flow: FlowDefinition, m = make(flow)) {
  m.driver.start({ xs: [1, 2] });
  m.sch.done('r1:side:1:0', { xs: [1, 2] });
  m.sch.done('r1:prep:0:0', { xs: [1, 2] });
  m.sch.done('r1:work:0.1:0', 2);
  m.sch.done('r1:work:0.0:0', 1);
  return m;
}

/** A fan-out over `entries`, every branch a task into one join, its successor `after`. */
const FAN = (entries: string[]): FlowDefinition => ({
  flowId: 'fan', version: 1, entry: 'split',
  nodes: [
    { id: 'split', kind: 'fanout', branches: entries },
    ...entries.map((id) => ({ id, kind: 'task', type: 'Echo', edges: [{ to: 'j' }] })),
    { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'after' }] },
    { id: 'after', kind: 'task', type: 'Check', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
}) as unknown as FlowDefinition;

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const flow = PASS5(CHECK_TASK);
    equal(validateDefinition(flow, { predicates: [], ...TYPES }), [], 'pass 5`s flow validates with zero findings');
    const m = drivePass5(flow);
    const got = m.sch.inputOf('r1:check:-:0') as Record<string, Record<string, unknown>>;
    // By hand: `outer` closes `split`, entries `[prep, side]` -> keys `prep`, `side`; `prep`'s branch carries `inner`'s
    // collection, which closes the map `each` over `[1, 2]` -> keys `0`, `1`, valued by each instance's result.
    equal(got, { prep: { '0': 1, '1': 2 }, side: { xs: [1, 2] } },
      'the collection is {"prep":{"0":1,"1":2},"side":{"xs":[1,2]}} — fyflow-app`s (b), where 0.11.0 handed on ' +
      '{"0":{"0.0":1,"0.1":2},"1":{"xs":[1,2]}}');
    equal(JSON.stringify(got), '{"prep":{"0":1,"1":2},"side":{"xs":[1,2]}}',
      'and its OWN order, byte for byte: `branches` order outside (`side` settled first), ascending index inside ' +
      '(instance 1 settled first)');

    const viaIf = drivePass5(PASS5(CHECK_IF('input.prep.1')));
    equal(viaIf.sch.ids().filter((id) => id.includes(':on')), ['r1:onThen:-:0'],
      'an `if` on `input.prep.1 eq 2` takes `then` — the key path reaches the second item, one segment a level');
    const oldPath = drivePass5(PASS5(CHECK_IF('input.0.0.1')));
    equal(oldPath.sch.ids().filter((id) => id.includes(':on')), ['r1:onElse:-:0'],
      'the CONTROL: the path a reader would TRY for the old keys, `input.0.0.1`, names nothing — `else` — so the gate is not ' +
      'constant-`then`. (It named nothing under 0.11.0 either — `"0.1"` is one key a dotted path cannot reach, P44 Context — ' +
      'so this control separates a working `if` from a constant one, and the `then` above is what separates the keyings)');
  });

  test(DECLARED_CASES[1]!, () => {
    // Non-integer-like ids, declared OUT of alphabetical order and settled in reverse: only `branches` order is right.
    const rev = make(FAN(['zed', 'mid', 'alp']));
    rev.driver.start({});
    for (const id of ['alp', 'mid', 'zed']) rev.sch.done(`r1:${id}:${['zed', 'mid', 'alp'].indexOf(id)}:0`, { by: id });
    const a = rev.sch.inputOf('r1:after:-:0') as Record<string, unknown>;
    equal(Object.keys(a), ['zed', 'mid', 'alp'],
      '`branches` order — not settlement order (`alp`, `mid`, `zed`), and not sorted order (the same three)');
    equal(a, { zed: { by: 'zed' }, mid: { by: 'mid' }, alp: { by: 'alp' } }, 'and each value under its own entry');

    // TWELVE non-integer-like ids, settled IN `branches` ORDER: a LEXICOGRAPHIC sort of the paths inserts positions
    // 0, 1, 10, 11, 2 … 9 — `e0, e1, e10, e11, e2, …` — where the segment-wise numeric one keeps `branches` order. At
    // ten or fewer entries the two agree, which is why this fixture is twelve wide (the adequacy reader's M8).
    const ids = Array.from({ length: 12 }, (_, i) => `e${i}`);
    const wide = make(FAN(ids));
    wide.driver.start({});
    ids.forEach((id, i) => wide.sch.done(`r1:${id}:${i}:0`, i));
    equal(Object.keys(wide.sch.inputOf('r1:after:-:0') as object), ids,
      'twelve entries come out in `branches` order, e0 … e11 — not lexicographic path order (e0, e1, e10, e11, e2, …)');

    // Entries the LANGUAGE orders: an integer-like id is listed first, ascending, whatever its insertion (P44 fact 2).
    const lang = make(FAN(['b', '2']));
    lang.driver.start({});
    lang.sch.done('r1:b:0:0', 'B');
    lang.sch.done('r1:2:1:0', 'TWO');
    equal(Object.keys(lang.sch.inputOf('r1:after:-:0') as object), ['2', 'b'],
      'fyflow-app`s (c): entries `"b"` and `"2"` list `"2"` first — the object`s own order, documented (JP-R12 v0.25), no id refused');
    const three = make(FAN(['z', '10', '2']));
    three.driver.start({});
    for (const [id, i] of [['2', 2], ['10', 1], ['z', 0]] as const) three.sch.done(`r1:${id}:${i}:0`, id);
    equal(Object.keys(three.sch.inputOf('r1:after:-:0') as object), ['2', '10', 'z'],
      'and two integer-like ids come out ascending as NUMBERS (`2` before `10`), the rest after');
  });

  test(DECLARED_CASES[2]!, () => {
    const flow = FAN(['__proto__', 'x']);
    equal(validateDefinition(flow, { predicates: [], ...TYPES }), [], 'FD-V16 admits the id `__proto__` (Q411) — no id is refused (P44 (a1))');
    const m = make(flow);
    m.driver.start({});
    m.sch.done('r1:x:1:0', { v: 'x' });
    const cp = m.driver.checkpoint();                      // `__proto__` in flight: its re-dispatch is the resume's
    m.sch.done('r1:__proto__:0:0', { v: 'p' });
    const got = m.sch.inputOf('r1:after:-:0') as Record<string, unknown>;
    ok(Object.hasOwn(got, '__proto__'), 'the entry id `__proto__` is an OWN key of the collection');
    equal(Object.keys(got), ['__proto__', 'x'], 'both keys, in `branches` order');
    ok(Object.getPrototypeOf(got) === Object.prototype,
      'and the collection`s prototype is still Object.prototype — an assignment `out["__proto__"] = v` would have SET it to ' +
      '{ v: "p" } and left no key (node 24, a browser)');
    equal(Object.getOwnPropertyDescriptor(got, '__proto__')?.value, { v: 'p' }, 'its value is what the branch carried');
    equal(JSON.stringify(got), '{"__proto__":{"v":"p"},"x":{"v":"x"}}', 'JSON.stringify keeps it');
    const cloned = structuredClone(got);
    ok(Object.hasOwn(cloned, '__proto__') && Object.getPrototypeOf(cloned) === Object.prototype,
      'and structuredClone — a threaded pool`s boundary (postMessage) — keeps it an own key');

    // The resume re-dispatches `__proto__`'s task; its settlement fires the join again on the fresh driver.
    const r = make(flow);
    r.driver.resume(cp);
    r.sch.done('r1:__proto__:0:0', { v: 'p' });
    const again = r.sch.inputOf('r1:after:-:0') as Record<string, unknown>;
    ok(Object.hasOwn(again, '__proto__') && Object.getPrototypeOf(again) === Object.prototype,
      'and a RESUMED run builds it the same way — the replay feeds `x`, the live settlement `__proto__`');
    equal(JSON.stringify(again), JSON.stringify(got), 'the same value as the uninterrupted run');
  });

  test(DECLARED_CASES[3]!, async () => {
    const INT: JsonSchema = { type: 'integer', examples: [1] };
    const ECHO_OUT: JsonSchema = { type: 'object', required: ['xs'], properties: { xs: { type: 'array', items: { type: 'integer' } } }, additionalProperties: false, examples: [{ xs: [1, 2] }] };
    const registry = (checkIn: JsonSchema) => ({
      workers: {
        echo: { url: 'test://echo', outputSchema: ECHO_OUT },
        work: { url: 'test://work', outputSchema: INT },
        check: { url: 'test://check', inputSchema: checkIn },
      },
      nodeTypes: { Echo: { worker: 'echo' }, Work: { worker: 'work' }, Check: { worker: 'check' } },
    });
    const flow = PASS5(CHECK_TASK);
    (flow.nodes.find((n) => n.id === 'work') as { type: string }).type = 'Work';
    const verdict = async (checkIn: JsonSchema) =>
      (await checkWiring(registry(checkIn), flow)).verdicts.find((v) => v.consumer === 'check')!;
    const at = (path: string[], schema: JsonSchema): JsonSchema =>
      path.reduceRight<JsonSchema>((inner, k) => ({ type: 'object', properties: { [k]: inner } }), schema);

    const whole = await verdict(at(['prep', '0'], { type: 'integer' }));
    equal([whole.shape, whole.producer, whole.kind], ['record', 'outer', 'fits'], '`prep.0` described as an integer: fits — the item`s shape');
    const wrong = await verdict(at(['prep', '0'], { type: 'string' }));
    equal(wrong.kind, 'no', '`prep.0` described as a STRING is `no` — so the record HAS `prep` (the entry id) and, under it, the item index `0`');
    equal((await verdict(at(['side', 'xs'], { type: 'string' }))).kind, 'no', 'and `side` — the second entry id — carries Echo`s output');
    equal((await verdict(at(['prep', '0.0'], { type: 'string' }))).kind, 'fits',
      'the CONTROL: the full path `0.0` — 0.11.0`s inner key — is no key the map`s record mints, so describing it meets nothing');
    equal((await verdict(at(['0'], { type: 'string' }))).kind, 'fits',
      'and the POSITION `0` — 0.11.0`s outer key — is no key of the fan-out`s exact record');
    // BRANCH_KEY's spelling (`String(i)`: no leading zero, any length): a two-digit index is one the map record mints, a
    // leading-zero one is not.
    equal((await verdict(at(['prep', '10'], { type: 'string' }))).kind, 'no', '`prep.10` — an item index — is checked against the item`s shape');
    equal((await verdict(at(['prep', '01'], { type: 'string' }))).kind, 'fits', 'and `prep.01` is no index `String(i)` spells: it meets nothing');

    // The fan-out record's SAMPLE (read by a transformed successor) and its PROPERTIES, with an entry id `__proto__`.
    const OUT_X: JsonSchema = { type: 'object', required: ['k'], properties: { k: { type: 'integer' } }, additionalProperties: false, examples: [{ k: 1 }] };
    const fanRegistry = (afterIn: JsonSchema) => ({
      workers: { echo: { url: 'test://echo', outputSchema: OUT_X }, check: { url: 'test://check', inputSchema: afterIn } },
      nodeTypes: { Echo: { worker: 'echo' }, Check: { worker: 'check' } },
      languages: { path: PATH_LANGUAGE },
    });
    const fan = FAN(['__proto__', 'x']);
    const transformed = { ...fan, nodes: fan.nodes.map((n) => (n.id === 'after' ? { ...n, transform: { lang: 'path', expr: '$' } } : n)) } as unknown as FlowDefinition;
    const sampled = (await checkWiring(fanRegistry({ type: 'object' }), transformed)).verdicts.find((v) => v.consumer === 'after')!;
    equal([sampled.shape, sampled.kind, sampled.sample?.arity], ['record', 'transform-passes', 2], 'a transformed successor of the fan-out join: its verdict carries the record`s SAMPLE');
    const sample = sampled.sample!.value as Record<string, unknown>;
    equal(Object.keys(sample), ['__proto__', 'x'], 'the sample is keyed by the ENTRY IDS, in `branches` order — never `0` and `1`');
    ok(Object.hasOwn(sample, '__proto__') && Object.getPrototypeOf(sample) === Object.prototype,
      'and `__proto__` is an OWN key of the sample, defined — an assignment would have set its prototype (node, a browser)');
    const consumerOn = (k: string, schema: JsonSchema) => JSON.parse(JSON.stringify({ type: 'object', properties: { [k]: schema } })) as JsonSchema;
    const proto = (schema: JsonSchema) => checkWiring(fanRegistry(consumerOn('__proto__', schema)), fan).then((r) => r.verdicts.find((v) => v.consumer === 'after')!.kind);
    equal(await proto({ type: 'object', properties: { k: { type: 'string' } } }), 'no',
      'a consumer describing `__proto__.k` as a STRING is `no` — the record HAS the property `__proto__`, as an own one');
    equal(await proto({ type: 'object', properties: { k: { type: 'integer' } } }), 'fits', 'and as the integer the branch carries: fits');
  });

  test(DECLARED_CASES[4]!, () => {
    equal(CHECKPOINT_FORMAT, 2, 'the format this driver writes and reads: 2 (RN-R16 v0.36)');
    const LINEAR = {
      flowId: 'linear', version: 1, entry: 'a',
      nodes: [
        { id: 'a', kind: 'task', type: 'Echo', edges: [{ to: 'b' }] },
        { id: 'b', kind: 'task', type: 'Check', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const withJoin = PASS5(CHECK_TASK);
    const runs: [string, FlowDefinition, Checkpoint, string][] = [];
    {
      const m = make(withJoin);
      m.driver.start({ xs: [1, 2] });
      m.sch.done('r1:side:1:0', { xs: [1, 2] });
      m.sch.done('r1:prep:0:0', { xs: [1, 2] });
      m.sch.done('r1:work:0.0:0', 1);
      m.sch.done('r1:work:0.1:0', 2);                    // `outer` fired; `check` in flight
      runs.push(['a run with a join', withJoin, m.driver.checkpoint(), 'r1:check:-:0']);
    }
    {
      const m = make(LINEAR);
      m.driver.start({ n: 1 });
      m.sch.done('r1:a:-:0', { n: 1 });
      runs.push(['a run with no join', LINEAR, m.driver.checkpoint(), 'r1:b:-:0']);
    }
    let checked = 0;
    for (const [what, flow, cp2, inFlight] of runs) {
      equal(cp2.header.format, 2, `${what}: the ARRANGEMENT — this driver wrote it at format 2`);
      const cp1 = { header: { ...cp2.header, format: 1 }, events: cp2.events } as Checkpoint;

      // resume() — the refusal, then the control.
      const refused = make(flow);
      let e: unknown;
      try { refused.driver.resume(cp1); } catch (x) { e = x; }
      ok(e instanceof ResumeRefused, `${what}: resume() of the format-1 checkpoint throws ResumeRefused`);
      equal([(e as ResumeRefused).reason, (e as ResumeRefused).index], ['format', null], `${what}: refused \`format\`, by name, before anything`);
      ok((e as ResumeRefused).message.includes('header.format is 1') && (e as ResumeRefused).message.includes('format 2 only'),
        `${what}: and the message says which format it met and which it reads: ${(e as ResumeRefused).message}`);
      equal([refused.sch.ids(), refused.driver.foldInputs().length], [[], 0], `${what}: nothing replayed, nothing dispatched`);
      equal(resumeRefusal(flow, cp1, 'r1')?.reason, 'format', `${what}: and the pure pre-check agrees`);
      const resumed = make(flow);
      resumed.driver.resume(cp2);
      equal(resumed.sch.ids(), [inFlight], `${what}: the CONTROL — the same run at format 2 resumes, re-dispatching ${inFlight}`);

      // inputOf — the refusal, then the control.
      const r1 = inputOf(flow, OPTS, cp1, { taskId: inFlight });
      equal(r1.ok ? 'ANSWERED' : [r1.reason, r1.index], ['format', null], `${what}: inputOf of the format-1 run is refused \`format\``);
      const r2 = inputOf(flow, OPTS, cp2, { taskId: inFlight });
      ok(r2.ok && r2.inputs.length === 1, `${what}: the CONTROL — inputOf reads the same run at format 2`);
      checked++;
    }
    equal(checked, 2, 'both runs were checked — counted from what the loop DID');

    // runtime.resume — the same pair through createRuntime's construction seams (no thread is built).
    const DOC = { workers: { w: { url: 'https://example.test/w.js' } }, nodeTypes: { Echo: { worker: 'w', inline: true }, Check: { worker: 'w', inline: true } }, predicates: [] } as unknown as RegistryDocument;
    const seams = () => {
      const added: string[] = [];
      const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
      return {
        added,
        settle: (id: string, result: unknown) => {
          const detail = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
          for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
        },
        createPool: (url: string, options: unknown) => ({ url, options }) as never,
        createScheduler: (p: Record<string, unknown>, g: Record<string, unknown>) => ({
          workerPools: p, groups: g,
          addTask(t: unknown) { added.push((t as { id: string }).id); },
          addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
          shutdown() { return Promise.resolve(); },
        }) as never,
      };
    };
    const on = (s: ReturnType<typeof seams>) => createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const sA = seams();
    const store: FoldInput[] = [];
    const h = on(sA).start(withJoin, { xs: [1, 2] }, { onFoldInput: (i, seq) => { store[seq] = structuredClone(i); } });
    for (const [id, v] of [['r1:side:1:0', { xs: [1, 2] }], ['r1:prep:0:0', { xs: [1, 2] }], ['r1:work:0.0:0', 1], ['r1:work:0.1:0', 2]] as const) sA.settle(id, v);
    const rt2: Checkpoint = { header: h.header, events: store.slice() };
    const rt1 = { header: { ...rt2.header, format: 1 }, events: rt2.events } as Checkpoint;
    const sB = seams();
    const rtB = on(sB);
    let rtErr: unknown;
    try { rtB.resume(withJoin, rt1); } catch (x) { rtErr = x; }
    ok(rtErr instanceof ResumeRefused && rtErr.reason === 'format', 'runtime.resume refuses the format-1 checkpoint `format`');
    equal(sB.added, [], 'and hands its scheduler nothing');
    rtB.resume(withJoin, rt2);
    equal(sB.added, ['r1:check:-:0'], 'the CONTROL — the same runtime resumes the format-2 checkpoint, re-dispatching `check`');
  });

  test(DECLARED_CASES[5]!, () => {
    const ran = collected().filter((x) => x.suite === SUITE).flatMap((x) => x.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
