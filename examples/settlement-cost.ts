/**
 * **WHAT ONE SETTLEMENT COSTS, on a real `FyflowScheduler`** —
 * [W81](../doc/work-items/w81-what-a-settlement-costs.md), and it is
 * [P21](../doc/plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md)'s price, both
 * halves: what `OR-R13`'s opt-in check costs against the clone `OR-R2` already pays, and what the
 * completion handle [ADR 0058](../doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)
 * installs on every run costs a consumer who never asked for it ([Q320](../doc/questions/q320.md)).
 *
 * ```bash
 * node examples/settlement-cost.ts
 * deno run --import-map=examples/deno-import-map.json --allow-read --allow-net --allow-env \
 *   examples/settlement-cost.ts
 * ```
 *
 * ## Why this is a NUMBER and not a flow, and why it is not in the gate
 *
 * `examples/retention.ts`'s precedent, one plan on: P15 decision 3 made a measured number an exit
 * artifact because a rung made of real runs cannot afford the scale the question is about. Here the
 * reason is different and the answer is the same — **a cost is a property of a machine**
 * ([Q179](../doc/questions/q179.md)), so a gate entry over one would be a ratchet on hardware. This
 * file is covered by ladder **L0** — `npm run lint` lints `examples/` and `tsconfig.examples.json`
 * includes it — and by nothing else. **What binds its two claims is
 * `test/driver/result-schema-cost.test.ts`**, at L1-L2, where both are COUNTS.
 *
 * ## PRICES-THE-CONSTRUCTION: why this file builds a `Driver` by hand, and nothing else here does
 *
 * `examples/l6.ts` asserts that the files under this directory which construct a pool, a scheduler,
 * a `Driver` or a built-in resource group are **exactly the ones that declare it** — the marker in
 * the heading above is that declaration, and before W81 the other side of that equality was `[]`.
 * The claim is [P18](../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md)'s exit
 * artifact: the library does every instantiation, from a document.
 *
 * **Block 2's whole subject is the one road that declines it.** Since
 * [ADR 0058](../doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)
 * `runtime.start` installs an `onFoldInput` on EVERY run, so every consumer pays a deep copy of
 * every result whether or not they ever read one; the only way to have a run and not that copy is
 * to build the `Driver` yourself from `runtime.registry`, which is
 * [P18](../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decision 14.
 * *So the file that prices the two roads has to hold both* — and it declares itself rather than
 * being exempted by a literal in `l6.ts`, so that a file which constructs one and says nothing is
 * still red, and a file which says this and constructs nothing is red too.
 *
 * ## Every cost here is a RATIO, and two of the three are clock-free
 *
 * P21 decision 5: *an item quoting a millisecond has quoted a machine.* This file quotes three
 * things, and it is worth knowing which is which before reading a row:
 *
 *   1. **the check's price** — `findings(schema, value)` against `structuredClone(value)` on the
 *      SAME values a real run settled. A ratio of two clocks, so it is REPORTED; what is ASSERTED
 *      is the DIRECTION it moves in, on both axes, which is W80's finding 1 made re-takeable;
 *   2. **the handle's price** — `+1 structuredClone per settled task`. A COUNT, exact, asserted;
 *   3. **what the switch costs when it is OFF** — how many times the driver reads a worker's
 *      `outputSchema`. A COUNT, exact, asserted, and it is the only thing here that can tell a
 *      check that runs for the consumer who asked from one that runs for everybody.
 *
 * ## The two axes, because the ratio is not a constant and is not even monotone in one variable
 *
 * **The clone is linear in the VALUE and the check is linear in the SCHEMA**, and the two are
 * unrelated quantities — so their ratio is unbounded in both directions. That is W80's finding 1
 * and it is why P21 prediction 1 reversed. `findings`' `enum` clause canonicalises **every entry of
 * the enum on every check**, which is where a schema's size is unbounded; `properties` and `items`
 * recurse to the schema's depth over the value's shape, which is linear in the value exactly as the
 * clone is. So a row here carries its value size AND its schema beside the number, or it is a ratio
 * about nothing.
 *
 * ## The two observers do not run in the same pass, and that is a measurement rather than tidiness
 *
 * `doc/workflow.md` section 5 rule 8, obligation (c)'s LIMIT, and P15's *independent excludes
 * DOWNSTREAM OF THE FIRST'S APPARATUS* — reached here from the other end. Block 2's observer is a
 * wrapper around `globalThis.structuredClone` and block 3's is an accessor on a schema the driver
 * reads; **both sit INSIDE the expression block 1 times.** So each is installed for its own block
 * and removed in a `finally`, and block 1 runs first, on a document with no accessor in it.
 *
 * **The effect is below this instrument's own resolution, and saying so is the honest form.** The
 * adequacy reader installed the clone counter for the whole file: block 1 read 91.1 / 16.0 / 5.3%
 * against 84.5-93.9 / 15.3-17.5 / 5.6-6.1 over three unmutated runs — inside the spread. So the
 * separation is hygiene rather than a measured correction, and the clause it obeys earned its keep
 * somewhere else in this same file: `viaStart` counted its clones AFTER `driver.snapshot()`, which
 * clones every result, and that WAS worth 17% of the column it printed.
 */
import { Driver, findings, POLICIES, type FlowDefinition, type JsonSchema } from '../index.ts';
import { createRuntime } from '../src/scheduler/index.ts';
import { codeFor, PREDICATES, registryDocumentFor } from './run-flow.ts';
import mapAlias from './flows/map-alias.flow.json' with { type: 'json' };

const MAL = mapAlias as unknown as FlowDefinition;
const BASE = new URL('./run-flow.ts', import.meta.url).href;

const isDeno = typeof (globalThis as Record<string, unknown>).Deno !== 'undefined';
const runtimeName = isDeno
  ? `deno ${(globalThis as unknown as { Deno: { version: { deno: string } } }).Deno.version.deno}`
  : `node ${(globalThis as unknown as { process: { versions: { node: string } } }).process.versions.node}`;

function exit(code: number): never {
  const g = globalThis as unknown as Record<string, { exit?: (c: number) => never } | undefined>;
  if (g.Deno?.exit) g.Deno.exit(code);
  g.process?.exit?.(code);
  throw new Error('unreachable');
}

/**
 * **Where the arity and the RESULT size come from, and neither is in the definition** —
 * `examples/retention.ts`'s own `payloadFor`, and the reason it is repeated rather than imported is
 * that this file drives it an order of magnitude further. `map-alias`'s `SplitWorker` returns one
 * item per WORD and its `TallyWorker` echoes the item's own word, so `arity` distinct words of
 * `kib` KiB each give a run of `arity` map instances whose RESULTS are ~`kib` KiB.
 *
 * **That is the finding this file is built on**: P21 fact 2 reads *this corpus's workers return
 * small values while the large payload sits at the ENTRY*, and it is a property of the three
 * SHAPES that fact measured rather than of the corpus. At `4 x 1024` the log holds **12.0 MiB** of
 * settled results, on the corpus's own flow, with no new worker and no new pool — which is why
 * P21 stop-and-ask (c)'s permission to add one is granted and unused.
 */
function payloadFor(arity: number, kib: number): { confidence: number; text: string } {
  const words = Array.from(
    { length: arity },
    (_, i) => String.fromCharCode(97 + (i % 26)) + String(i) + 'x'.repeat(Math.max(0, kib * 1024 - 4)),
  );
  return { confidence: 0.9, text: words.join(' ') };
}

/** How many times each timed expression is run. Printed rather than described, so the prose
 * cannot say 51 while the loop does 1 — the adequacy reader took it to 1 for free. */
const REPS = 51;

/** Median, because [Q179](../doc/questions/q179.md) says a mean over readings this spread is a fiction. */
function median(f: () => void, reps: number): number {
  const xs: number[] = [];
  for (let i = 0; i < reps; i++) {
    const t = performance.now();
    f();
    xs.push(performance.now() - t);
  }
  xs.sort((a, b) => a - b);
  return xs[Math.floor(xs.length / 2)]!;
}

interface Settled { taskId: string; node: string; worker: string; schema: JsonSchema; value: unknown; bytes: number }

/** `v8.serialize` where there is one — the same observer `examples/retention.ts` uses, and absent in a browser. */
const serialize: ((v: unknown) => { length: number }) | null = isDeno || typeof (globalThis as Record<string, unknown>).process !== 'undefined'
  ? await import('node:v8').then((m) => m.serialize as unknown as (v: unknown) => { length: number }).catch(() => null)
  : null;
const sizeOf = (v: unknown): number => {
  if (serialize === null) return 0;
  try { return serialize(v).length; } catch { return 0; }
};

/**
 * **Wait for the run to stop, driven by the SCHEDULER and never by the driver's own machinery.**
 *
 * Both arms of block 2 must terminate the same way or the comparison is about the termination
 * rather than about the handle: `await done` exists only on the `runtime.start` road and IS the
 * machinery under test, and polling `driver.foldInputs()` clones the whole sequence on every call,
 * which would bury a per-settlement clone under the harness's own. So this reads the scheduler's
 * settlement events — the driver's inputs, not its outputs — and the dispatched ids, which are
 * strings.
 *
 * Bounded, because [Q323](../doc/questions/q323.md) is what a probe that stops a promise settling
 * costs when nothing bounds the wait: W77 ran for two and a half hours on one.
 */
async function quiesce(driver: { dispatchedIds(): readonly string[] }, settled: Set<string>, budgetMs: number): Promise<boolean> {
  const deadline = Date.now() + budgetMs;
  let stable = 0;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4));
    const ids = driver.dispatchedIds();
    stable = ids.length > 0 && ids.every((id) => settled.has(id)) ? stable + 1 : 0;
    if (stable >= 3) return true;
  }
  return false;
}

/** A settlement counter on the scheduler's own events, so neither arm needs the driver to tell it. */
function watch(scheduler: { addEventListener(t: string, fn: (e: { detail: unknown }) => void): void }): Set<string> {
  const settled = new Set<string>();
  const note = (e: { detail: unknown }) => {
    const id = (e.detail as { id?: unknown })?.id;
    if (typeof id === 'string') settled.add(id);
  };
  for (const t of ['task.completed', 'task.failed', 'task.user_action']) scheduler.addEventListener(t, note);
  return settled;
}

// ================================================================================================
// BLOCK 1 — what the CHECK costs, against the clone the same settlement already pays
// ================================================================================================

/** One real run with the check ON, and every settled result paired with the schema its worker declares. */
async function settledPairs(arity: number, kib: number, refuse = false): Promise<{ rows: Settled[]; outcome: string; reports: number; settledDone: number }> {
  const doc = refuse ? refusingDocument() : registryDocumentFor(false, 0);
  const rt = createRuntime(doc, codeFor(PREDICATES), { base: BASE, flows: [MAL] });
  try {
    let reports = 0;
    const { driver, done } = rt.start(MAL, payloadFor(arity, kib), {
      joinPolicy: POLICIES['live-token'],
      // **The check ON, which is what the plan asks of this row — and it is LOAD-BEARING rather
      // than decorative.** The adequacy reader deleted this callback for ZERO: block 1 times
      // `findings` itself, so whether the driver ran the check during the run contributed nothing.
      // It does now — `checkPrice` asserts that the number of reports the RUN produced equals the
      // number of rows the same schemas refuse when re-checked here, which binds three things at
      // once: that the check ran, that each value is paired with the schema the DRIVER used, and
      // that the timed call is the one the driver makes.
      //
      // **And the values are a COPY taken beside it, which is what this comment used to deny.**
      // `driver.snapshot()` clones every result (`OR-R2`'s own losses do not apply twice, but the
      // object is not the record's). The conformity reader, and it is `OR-R11` one layer on: what
      // this block times is a value of the same shape, which is what a ratio needs, and saying so
      // is the difference between a measurement and a claim about one.
      onNonconformingResult: () => { reports += 1; },
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const bail = new Promise<null>((r) => { timer = setTimeout(() => r(null), 120_000); });
    const state = await Promise.race([done, bail]);
    if (timer !== undefined) clearTimeout(timer);

    const nodeOfTask = new Map<string, string>();
    for (const n of MAL.nodes) if (n.kind === 'task') nodeOfTask.set(n.id, (n as { type: string }).type);
    const types = doc.nodeTypes as Record<string, { worker: string }> | undefined;
    const workers = doc.workers as Record<string, { outputSchema?: JsonSchema }> | undefined;

    const rows: Settled[] = [];
    for (const rec of driver.snapshot()) {
      if (rec.kind !== 'outcome' || rec.terminalState !== 'done' || rec.result === null) continue;
      const node = rec.taskId.split(':')[1] ?? '';
      const typeName = nodeOfTask.get(node);
      const workerName = typeName === undefined ? undefined : types?.[typeName]?.worker;
      const schema = workerName === undefined ? undefined : workers?.[workerName]?.outputSchema;
      if (schema === undefined || workerName === undefined) continue;
      rows.push({ taskId: rec.taskId, node, worker: workerName, schema, value: rec.result, bytes: sizeOf(rec.result) });
    }
    // **A SECOND expression over the same log**, so `rows` is bound by something other than its
    // own loop: the adequacy reader stopped that loop after one row and every ratio below still
    // printed, at `1 settled`. On this flow every task node's type declares an `outputSchema`, so
    // the two counts must be EQUAL — which is also what makes *per checked settlement* below a
    // division by the checked ones rather than by all of them (the conformity reader).
    const settledDone = driver.snapshot()
      .filter((r) => r.kind === 'outcome' && r.terminalState === 'done' && r.result !== null).length;
    return { rows, outcome: state === null ? 'NEVER SETTLED' : state.outcome, reports, settledDone };
  } finally {
    await rt.shutdown();
  }
}

/**
 * **The same document with `tally`'s `outputSchema` made unsatisfiable**, so one run settles results
 * the check REFUSES — and the report equality below has something to compare.
 *
 * The adequacy reader deleted block 1's `onNonconformingResult` for ZERO and called the check ON
 * *decorative*; the equality added for it was **vacuous**, because every result this corpus settles
 * conforms, so both sides read 0. *A control must fail where its claim is vacuous and not only
 * where its subject is absent* (`doc/workflow.md` rule 8 (d), v0.21) — and the tree that makes this
 * one vacuous is the shipped corpus itself.
 */
function refusingDocument() {
  const d = registryDocumentFor(false, 0) as unknown as { workers: Record<string, Record<string, unknown>> };
  return {
    ...(d as unknown as Record<string, unknown>),
    workers: { ...d.workers, tally: { ...d.workers.tally, outputSchema: { type: 'object', required: ['noSuchKey'] } } },
  } as unknown as ReturnType<typeof registryDocumentFor>;
}

/** The sweep, DECLARED and then counted — W55's adequacy reader's finding, one file over. */
const SWEEP: readonly (readonly [number, number])[] = [[4, 1], [10, 16], [50, 16]];
/** The enum sizes block 1's second axis walks. `0` is the worker's own schema, unmodified. */
const ENUMS: readonly number[] = [0, 3, 100, 1000];

/** The worker's own schema with an `enum` of `n` allowed values bolted onto a key the value carries. */
function withEnum(schema: JsonSchema, n: number): JsonSchema {
  if (n === 0) return schema;
  const props = (schema as { properties?: Record<string, unknown> }).properties ?? {};
  const key = Object.keys(props)[0];
  if (key === undefined) return schema;
  return {
    ...(schema as Record<string, unknown>),
    properties: { ...props, [key]: { enum: Array.from({ length: n }, (_, i) => `v${i}`) } },
  } as JsonSchema;
}

/**
 * **The blocks this file declares, and each one reports that it RAN** — the adequacy reader deleted
 * each of the three calls at the bottom on its own and the file was green every time, taking
 * Outputs (2), Outputs (3) and the `z1` ceiling's only observer with it. `examples/retention.ts`
 * carries `if (ran !== SWEEP.length)` and this file's own comment claimed the same shape one layer
 * up ("the sweep, DECLARED and then counted") while counting nothing at the block level.
 *
 * A membership by NAME rather than a count, because a count of blocks is a second number a human
 * writes (v0.14, and `CROSS_ROW_SUBJECTS` is the same answer one directory over).
 */
const BLOCKS = ['the check`s price', 'the handle`s price', 'the switch`s price'] as const;
const ran = new Set<string>();

async function checkPrice(failed: string[]): Promise<void> {
  ran.add(BLOCKS[0]);
  console.log(`\n  1. WHAT THE CHECK COSTS — OR-R13 against OR-R2, on ${runtimeName}\n`);
  console.log('     flow map-alias, the check ON, timed on the values the run itself settled.');
  console.log(`     Both columns are medians of ${REPS} repetitions over the SAME value.\n`);
  console.log('       settled   results     check / clone   worst single settlement');
  const byValue: number[] = [];
  const totalBytes: number[] = [];
  // Rows are kept so the SCHEMA axis below runs on the same values rather than on fresh ones.
  const keep: { label: string; rows: Settled[] }[] = [];
  for (const [arity, kib] of SWEEP) {
    const { rows, outcome, reports, settledDone } = await settledPairs(arity, kib);
    if (outcome !== 'completed') { failed.push(`arity ${arity} / ${kib} KiB: the run reported ${outcome}`); continue; }
    if (rows.length === 0) { failed.push(`arity ${arity} / ${kib} KiB: no settled result carried a declared outputSchema`); continue; }
    if (rows.length !== settledDone) {
      failed.push(`arity ${arity} / ${kib} KiB: ${rows.length} of ${settledDone} settled results were timed — ` +
        'every task node of this flow declares an outputSchema, so the two must agree');
    }
    if (new Set(rows.map((r) => r.schema)).size < 2) {
      failed.push(`arity ${arity} / ${kib} KiB: every value was paired with ONE schema, so the pairing is unbound`);
    }
    // **The check ON, made load-bearing**: what the RUN reported must be what these same schemas
    // say about these same values. It binds the pairing, the numerator and the callback at once.
    const refusedHere = rows.filter((r) => findings(r.schema, r.value).length > 0).length;
    if (refusedHere !== reports) {
      failed.push(`arity ${arity} / ${kib} KiB: the run reported ${reports} nonconforming result(s) and re-checking ` +
        `the same values against the same schemas finds ${refusedHere} — the timed call is not the driver's`);
    }
    let v = 0, c = 0, worst = 0, worstAt = '';
    for (const r of rows) {
      const vi = median(() => { findings(r.schema, r.value); }, REPS);
      const ci = median(() => { structuredClone(r.value); }, REPS);
      v += vi; c += ci;
      const ratio = ci > 0 ? vi / ci : Infinity;
      if (ratio > worst) { worst = ratio; worstAt = r.taskId; }
    }
    const bytes = rows.reduce((n, r) => n + r.bytes, 0);
    // Block 2 refuses to state its byte claim when nothing could be measured; block 1 did not, and
    // with the sizes zeroed its whole value axis never entered its body (the adequacy reader).
    if (bytes <= 0) failed.push(`arity ${arity} / ${kib} KiB: no settled result had a measurable size, so the axis below is vacuous`);
    byValue.push(c > 0 ? v / c : Infinity);
    totalBytes.push(bytes);
    keep.push({ label: `${arity} x ${kib} KiB`, rows });
    console.log(
      `     ${String(rows.length).padStart(7)}   ${(bytes / 1024).toFixed(1).padStart(9)} KiB   ` +
        `${(c > 0 ? (v / c) * 100 : 0).toFixed(1).padStart(10)}%   ${worst.toFixed(2)}x at ${worstAt}` +
        `   (${reports} report${reports === 1 ? '' : 's'})`,
    );
  }

  // **AXIS 1 — the VALUE.** The clone is linear in the whole of it and the check is not, so the
  // share falls. ASSERTED as a direction: the rows are ordered by the bytes the run settled.
  for (let i = 1; i < byValue.length; i++) {
    if (totalBytes[i]! > totalBytes[i - 1]! && byValue[i]! >= byValue[i - 1]!) {
      failed.push(
        `the settled bytes rose ${(totalBytes[i - 1]! / 1024).toFixed(1)} -> ${(totalBytes[i]! / 1024).toFixed(1)} KiB ` +
          `and the check's share did not fall (${(byValue[i - 1]! * 100).toFixed(1)}% -> ${(byValue[i]! * 100).toFixed(1)}%)`,
      );
    }
  }

  // **The declaration is checked BEFORE the grid runs, and that ordering is a rule-8 finding**:
  // with `ENUMS` truncated to `[0]` the grid below indexed `row[1]` and the artifact died with a
  // `TypeError` instead of reporting. *A crash is not a detection* (W59), and a measurement file
  // whose own declaration can crash it reports the harness rather than the tree.
  const enumsOk = ENUMS.length >= 3 && ENUMS[0] === 0;
  if (!enumsOk) failed.push('the enum axis needs the unmodified schema and at least two sizes beyond it');
  if (SWEEP.length < 2) failed.push(`SWEEP declares ${SWEEP.length} row(s): the value axis is a direction and needs two`);
  // The constant the prose above is derived from is bound to a floor as well as to the print:
  // derived alone, `REPS = 1` moves the sentence with the loop and says nothing (the adequacy reader).
  if (REPS < 5) failed.push(`REPS is ${REPS}: a median over fewer than five readings is a reading`);
  if (new Set(SWEEP.map(([, k]) => k)).size < 2 || new Set(SWEEP.map(([a]) => a)).size < 2) {
    failed.push('the sweep varies only ONE of the two axes the check`s cost is stated over');
  }
  if (!enumsOk) return;

  // **THE CONTROL, and it is a RUN rather than an expression**: the same flow with `tally`'s output
  // schema made unsatisfiable, so the driver reports one finding per map instance and the equality
  // above is comparing two non-zero numbers somewhere. Without it, *the run reported what these
  // schemas say* is `0 === 0` on every row of a conforming corpus.
  {
    const [arity, kib] = SWEEP[0]!;
    const { rows, reports, outcome } = await settledPairs(arity, kib, true);
    const refusedHere = rows.filter((r) => findings(r.schema, r.value).length > 0).length;
    console.log(`\n     control — the same flow with tally's outputSchema made unsatisfiable: ` +
      `${outcome}, ${reports} report(s) from the RUN against ${refusedHere} on re-check`);
    if (reports === 0) failed.push('the control run reported NOTHING, so *the run reported what these schemas say* is 0 === 0 on every row');
    if (refusedHere !== reports) {
      failed.push(`the control run reported ${reports} and re-checking the same values finds ${refusedHere} — the timed call is not the driver's`);
    }
    if (reports !== arity) failed.push(`the control run reported ${reports} findings where its ${arity} map instances each settle one`);
  }

  console.log('\n     and the SECOND axis, on the same values: one `enum` on one key of the same schema\n');
  console.log('       value        enum 0      enum 3    enum 100   enum 1000');
  // The smallest and the largest value this sweep settled — one row each, so the table is a grid
  // over the two axes rather than a line along one.
  const grid: number[][] = [];
  const gridBytes: number[] = [];
  for (const which of [0, keep.length - 1]) {
    const k = keep[which];
    if (k === undefined) continue;
    const biggest = [...k.rows].sort((a, b) => b.bytes - a.bytes)[0]!;
    const clone = median(() => { structuredClone(biggest.value); }, REPS);
    const row: number[] = [];
    for (const n of ENUMS) {
      const s = withEnum(biggest.schema, n);
      const v = median(() => { findings(s, biggest.value); }, REPS);
      row.push(clone > 0 ? v / clone : Infinity);
    }
    grid.push(row);
    gridBytes.push(biggest.bytes);
    console.log(
      `     ${`${(biggest.bytes / 1024).toFixed(1)} KiB`.padStart(9)}   ` +
        row.map((r) => `${r.toFixed(2)}x`.padStart(9)).join('  '),
    );
  }
  // **AXIS 2 — the SCHEMA.** `enum` canonicalises every entry on every check, so the share rises
  // with a quantity the VALUE knows nothing about. ASSERTED as a direction with a MARGIN rather
  // than step by step: at the large value the adjacent steps sit inside the timer's own resolution
  // (0.07x against 0.07x), so a strict per-step monotonicity would be asserting the third decimal
  // of a clock — which is [Q179](../doc/questions/q179.md) in the file that quotes it. A
  // thousand-entry enum against a three-entry one on the same value is a factor this corpus reads
  // at 4x and 11x.
  for (const row of grid) {
    if (!(row[row.length - 1]! > row[0]!)) {
      failed.push(
        `the enum grew 0 -> ${ENUMS[ENUMS.length - 1]} allowed values and the check's share of the clone did not rise ` +
          `(${row[0]!.toFixed(2)}x -> ${row[row.length - 1]!.toFixed(2)}x) — W80's finding 1 says it must`,
      );
    }
    if (!(row[row.length - 1]! > 2 * row[1]!)) {
      failed.push(
        `${ENUMS[1]} -> ${ENUMS[ENUMS.length - 1]} allowed values did not even double the check's share ` +
          `(${row[1]!.toFixed(2)}x -> ${row[row.length - 1]!.toFixed(2)}x) — the check is meant to be LINEAR in the schema`,
      );
    }
  }
  // **The PAIR's own difference is a claim** — rule 8's fourth requirement on the set. With both
  // rows taken from the SAME value the clause below is satisfied by timer noise, which is what the
  // adequacy reader measured: `for (const which of [0, 0])` printed `4.1 KiB` twice at exit 0.
  if (gridBytes.length === 2 && gridBytes[0] === gridBytes[1]) {
    failed.push(`the schema axis ran both rows on a ${gridBytes[0]}-byte value, so *the ratio is a property of the PAIR* compares one value with itself`);
  }
  if (grid.length === 2) {
    // The two axes disagree by construction, and a table that showed only one of them would be the
    // sentence P21 shipped before W80 measured it. At the LARGEST enum the cheap-value row must be
    // the dearer one: that is the whole of *the ratio is a property of the PAIR*.
    const small = grid[0]![grid[0]!.length - 1]!;
    const large = grid[1]![grid[1]!.length - 1]!;
    if (!(small > large)) {
      failed.push(`at enum ${ENUMS[ENUMS.length - 1]} the SMALLER value's ratio (${small.toFixed(2)}x) is not above the larger's (${large.toFixed(2)}x)`);
    }
  } else {
    failed.push(`the schema axis ran ${grid.length} of 2 values — a single value cannot show that the ratio is a property of the PAIR`);
  }
}

// ================================================================================================
// BLOCK 2 — what the HANDLE costs, and the road by which a consumer declines it
// ================================================================================================

/**
 * **Counting `structuredClone`, because nothing else can see a clone.** P21's declaration step
 * measured this the expensive way: BYTES give a clone and an alias the same length, and IDENTITY is
 * confounded because `foldInputs()` is itself `Object.freeze(this.inputs.map(freezeInput))` and
 * clones on every call. Only counting the calls answers it.
 *
 * Installed here and removed in the caller's `finally`, because it is inside the expression block 1
 * times — see this file's header.
 */
function countClones(): { count: () => number; restore: () => void } {
  const real = globalThis.structuredClone;
  let n = 0;
  (globalThis as { structuredClone: typeof structuredClone }).structuredClone =
    ((v: unknown, o?: unknown) => { n += 1; return (real as (a: unknown, b?: unknown) => unknown)(v, o); }) as typeof structuredClone;
  // `restore` is idempotent: both arms call it explicitly before reading the log and again in their
  // own `finally`, so a throw between the two still leaves the global as it was found.
  return { count: () => n, restore: () => { (globalThis as { structuredClone: typeof structuredClone }).structuredClone = real; } };
}

interface Arm { clones: number; settled: number; resultBytes: number }

/** The road `runtime.start` puts every consumer on: a completion handle, and the `onFoldInput` it needs. */
async function viaStart(arity: number, kib: number, failed: string[]): Promise<Arm> {
  const rt = createRuntime(registryDocumentFor(false, 0), codeFor(PREDICATES), { base: BASE, flows: [MAL] });
  try {
    const settled = watch(rt.scheduler as never);
    const c = countClones();
    try {
      const { driver } = rt.start(MAL, payloadFor(arity, kib), { runId: 'start', joinPolicy: POLICIES['live-token'] });
      if (!await quiesce(driver, settled, 120_000)) failed.push(`viaStart ${arity}x${kib}: the run did not quiesce inside its budget`);
      // **The instrument is REMOVED before the reader it would otherwise count** — BOTH readers,
      // from opposite ends, and the second cut of this fix was worse than the first.
      //
      // `snapshot()` is `this.log.map((r) => Object.freeze(cloneRecord(r)))` and `cloneRecord`
      // calls `structuredClone` on every non-null result, so called while the counter is live it
      // adds **exactly one clone per settled result to each arm — precisely the quantity this block
      // asserts.** *The clone counter was counting the byte observer's own predecessor*: P15's
      // *independent excludes DOWNSTREAM OF THE FIRST'S APPARATUS*, in the file whose header cites
      // that clause. The printed absolutes were 17% the harness's.
      //
      // **Reading the count first was not enough, and rule 8's re-run is what said so.** Restoring
      // the old order in ONE arm, compounded with a driver that clones on both roads, came back
      // GREEN: the harness's `+1 per settlement` and the handle's `+1 per settlement` are the same
      // number, so the two defects CANCEL and `extra === settled` cannot tell them apart. So the
      // wrapper is taken off here instead — after that there is no ordering left to get wrong,
      // which is the difference between a guard and a construction.
      const counted = c.count();
      c.restore();
      const log = driver.snapshot();
      return {
        clones: counted, settled: settled.size,
        resultBytes: log.reduce((n, r) => n + (r.kind === 'outcome' && r.terminalState === 'done' && r.result !== null ? sizeOf(r.result) : 0), 0),
      };
    } finally { c.restore(); }
  } finally { await rt.shutdown(); }
}

/**
 * **The opt-out, and it is a decision this repository already took** —
 * [P18](../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decision 14 (NOT ADR 0055's,
 * which has five and none about the registry): `runtime.registry` IS the object a runtime hands its
 * own drivers, so a consumer can build the
 * driver themselves and install no `onFoldInput` at all. `src/driver/driver.ts`'s `append` calls
 * `freezeInput` only where one is present, so this arm makes exactly one clone fewer per settlement.
 *
 * **What it costs is in the report rather than in a footnote**: this consumer has no `done` and no
 * fold. Every road back to one either installs an `onFoldInput` — which reinstates the clone this
 * arm declined, per settlement — or calls `foldInputs()`, which clones the WHOLE sequence on every
 * call. So the opt-out is real and it is for a consumer who does not ask the driver what happened.
 */
async function viaHandBuiltDriver(arity: number, kib: number, failed: string[]): Promise<Arm> {
  const rt = createRuntime(registryDocumentFor(false, 0), codeFor(PREDICATES), { base: BASE, flows: [MAL] });
  try {
    const settled = watch(rt.scheduler as never);
    const c = countClones();
    try {
      // **No cast, and the cast it replaces was a reader's finding.** This file's header says it is
      // covered by ladder L0 and by nothing else; `as never` erased that coverage on the ONE
      // expression this block exists to price. Measured by the conformity reader: with the cast in
      // place, `scheduler` deleted, `runId: 42` and `joinPolicy` misspelled all typechecked clean.
      const driver = new Driver(MAL, {
        ...rt.registry,
        scheduler: rt.scheduler,
        runId: 'hand',
        joinPolicy: POLICIES['live-token'],
      });
      driver.start(payloadFor(arity, kib));
      if (!await quiesce(driver, settled, 120_000)) failed.push(`viaHandBuiltDriver ${arity}x${kib}: the run did not quiesce inside its budget`);
      const counted = c.count();
      c.restore();  // before `snapshot()`, which clones — see the note in `viaStart` above
      const log = driver.snapshot();
      return {
        clones: counted, settled: settled.size,
        resultBytes: log.reduce((n, r) => n + (r.kind === 'outcome' && r.terminalState === 'done' && r.result !== null ? sizeOf(r.result) : 0), 0),
      };
    } finally { c.restore(); }
  } finally { await rt.shutdown(); }
}

/** The two arities block 3 runs, and they must DIFFER — see its control. */
const ARITIES: readonly number[] = [3, 8];

/** The shapes block 2 walks. The last is where the results are MEGABYTES, on the corpus's own flow. */
const HANDLE_SHAPES: readonly (readonly [number, number])[] = [[4, 1], [10, 16], [4, 1024]];

async function handlePrice(failed: string[]): Promise<void> {
  ran.add(BLOCKS[1]);
  console.log(`\n  2. WHAT THE ALWAYS-ON HANDLE COSTS — Q320, on ${runtimeName}\n`);
  console.log('     Two roads to the same run: runtime.start, and a Driver built from runtime.registry.');
  console.log('     Both terminate on the SCHEDULER`s own events, so neither pays for the other`s machinery.\n');
  console.log('       shape          settled   results        clones  start / hand   extra copies');
  let measured = 0;
  for (const [arity, kib] of HANDLE_SHAPES) {
    const a = await viaStart(arity, kib, failed);
    const b = await viaHandBuiltDriver(arity, kib, failed);
    const extra = a.clones - b.clones;
    console.log(
      `     ${`${arity} x ${kib} KiB`.padStart(13)}   ${String(a.settled).padStart(7)}   ` +
        `${(a.resultBytes / 1024).toFixed(1).padStart(9)} KiB   ${String(a.clones).padStart(5)} / ${String(b.clones).padEnd(5)}` +
        `   +${extra}, over ${a.settled} settlements`,
    );
    // **THE CLAIM, and it is a count rather than a clock**: one more clone per settled task, which
    // is one more copy of everything `OR-R2` already copies — a ratio of 1.00x by construction.
    if (extra !== a.settled) {
      failed.push(`${arity}x${kib}: the handle cost ${extra} clone(s) over ${a.settled} settlements — Q320 says exactly one each`);
    }
    if (a.settled === 0 || b.settled === 0) failed.push(`${arity}x${kib}: an arm settled nothing, so the difference above is between two empty runs`);
    // **The label is bound to the RUN, not to the loop** — the adequacy reader made `payloadFor`
    // return one word for a four-word shape and the row still printed `4 x 1024 KiB`. `map-alias`
    // settles the entry, the N map instances and the join successor: arity + 2, from the document.
    if (a.settled !== arity + 2) {
      failed.push(`${arity}x${kib}: the run settled ${a.settled} tasks where a map-alias run of arity ${arity} settles ${arity + 2} — ` +
        'the shape printed above is not the shape that ran');
    }
    if (a.resultBytes !== b.resultBytes) {
      failed.push(`${arity}x${kib}: the two arms settled different bytes (${a.resultBytes} against ${b.resultBytes}) — they are not the same run`);
    }
    if (a.resultBytes <= 0) failed.push(`${arity}x${kib}: no settled result had a measurable size, so the byte claim below is vacuous`);
    measured++;
  }
  if (measured !== HANDLE_SHAPES.length) failed.push(`block 2 ran ${measured} of ${HANDLE_SHAPES.length} declared shapes`);
  const sizes = new Set(HANDLE_SHAPES.map(([, k]) => k));
  if (sizes.size < 2 || Math.max(...sizes) < 1024) {
    failed.push('block 2 never reaches a MEGABYTE result, which is the shape P21 prediction 4 is about');
  }
}

// ================================================================================================
// BLOCK 3 — what the SWITCH costs when it is OFF, counted rather than timed
// ================================================================================================

/**
 * **A document whose every `outputSchema` counts its own reads, one level down.**
 *
 * The accessor is on a KEY of the schema rather than on `outputSchema` itself, and that is a
 * measurement rather than a style: `src/scheduler/runtime.ts`'s `resolveWorkerUrl` spreads the
 * worker ENTRY to rewrite its URL, and a spread materialises an accessor — so a getter on
 * `outputSchema` is read exactly twice, both at construction, and never during a run. *What crosses
 * a copy is data*, which is `OR-R11`'s own sentence applied to a schema rather than to a result.
 * The schema OBJECT still crosses by reference, so an accessor on one of its keys survives.
 */
function countingDocument(counts: { n: number }) {
  const doc = registryDocumentFor(false, 0) as unknown as { workers: Record<string, Record<string, unknown>> };
  const workers: Record<string, Record<string, unknown>> = {};
  for (const [name, w] of Object.entries(doc.workers)) {
    const schema = w.outputSchema as Record<string, unknown> | undefined;
    if (schema === undefined) { workers[name] = w; continue; }
    const held = schema.type;
    const wrapped: Record<string, unknown> = { ...schema };
    delete wrapped.type;
    Object.defineProperty(wrapped, 'type', {
      enumerable: true, configurable: true,
      get() { counts.n += 1; return held; },
    });
    workers[name] = { ...w, outputSchema: wrapped };
  }
  return { ...(doc as unknown as Record<string, unknown>), workers } as never;
}

async function switchPrice(failed: string[]): Promise<void> {
  ran.add(BLOCKS[2]);
  console.log(`\n  3. WHAT THE SWITCH COSTS WHEN IT IS OFF — ADR 0060 rule 4, counted\n`);
  console.log('     How many times the driver reads a worker`s outputSchema, over two runs that settle');
  console.log('     DIFFERENT numbers of tasks. Clock-free, and one of the two things that tell a check');
  console.log('     run for the consumer who asked from one run for everybody — the other is the L2 suite,');
  console.log('     which is the half that is in the gate.\n');
  console.log('       arity   settled   construction   check OFF   check ON   per checked settlement');
  // **A MINIMUM, because the CONTROL could not supply one** — the adequacy reader's finding 1, and
  // it is v0.21's question answered in the direction that clause does not cover. Every clause below
  // is gated on `length === 2`, so `ARITIES = [3]` made the headline, its control AND the
  // proportionality all silent at exit 0, leaving only a count compared with its own declaration —
  // v0.14's *a count is not a membership*, in the file that cites the clause above it. A control
  // fails where two values are EQUAL; nothing there could fail where there is only ONE.
  if (ARITIES.length < 2) failed.push(`ARITIES declares ${ARITIES.length} value(s): every claim in this block needs two`);
  if (new Set(ARITIES).size !== ARITIES.length) failed.push('ARITIES repeats a value, so the runs it compares are the same run');
  const offReads: number[] = [];
  const settledBy: number[] = [];
  const perSettlement: number[] = [];
  for (const arity of ARITIES) {
    const readings: Record<string, number> = {};
    for (const mode of ['construction', 'off', 'on'] as const) {
      const counts = { n: 0 };
      const rt = createRuntime(countingDocument(counts), codeFor(PREDICATES), { base: BASE, flows: [MAL] });
      try {
        if (mode === 'construction') { readings[mode] = counts.n; continue; }
        const settled = watch(rt.scheduler as never);
        const { driver } = rt.start(MAL, payloadFor(arity, 1), {
          runId: mode, joinPolicy: POLICIES['live-token'],
          ...(mode === 'on' ? { onNonconformingResult: () => {} } : {}),
        });
        if (!await quiesce(driver, settled, 60_000)) failed.push(`switch/${mode}: the run did not quiesce inside its budget`);
        readings[mode] = counts.n;
        readings[`${mode}Settled`] = driver.snapshot().filter((r) => r.kind === 'outcome' && r.terminalState === 'done' && r.result !== null).length;
      } finally { await rt.shutdown(); }
    }
    const construction = readings.construction!, off = readings.off!, on = readings.on!;
    const settled = readings.onSettled!;
    const per = settled > 0 ? (on - off) / settled : 0;
    offReads.push(off);
    settledBy.push(settled);
    perSettlement.push(per);
    console.log(
      `     ${String(arity).padStart(7)}   ${String(settled).padStart(7)}   ${String(construction).padStart(12)}   ` +
        `${String(off).padStart(9)}   ${String(on).padStart(8)}   ${per.toFixed(2)}`,
    );
    if (!(on > off)) failed.push(`arity ${arity}: with the check ON the schema was read no more often than with it off (${on} against ${off})`);
    if (settled === 0) failed.push(`arity ${arity}: nothing settled with a declared outputSchema, so the counts above are about an empty run`);
    if (construction === 0) failed.push(`arity ${arity}: the accessor was never read at all — the observer is not installed`);
    if (readings.offSettled !== settled) {
      failed.push(`arity ${arity}: the two arms settled ${readings.offSettled} and ${settled} results — they are not the same run`);
    }
  }
  // **THE CLAIM, and the baseline is a SECOND RUN rather than a construction count.** With the
  // check off, the number of times the driver reads a worker`s outputSchema **does not depend on
  // how many tasks settled** — so two runs of different arities read it the same number of times.
  // *Construction is reported and not asserted on*: `start()` reads the schema too, at `FD-R4`'s
  // boundary, so a construction-only baseline is 72 reads short of an OFF run and says nothing
  // about settlements. The first cut asserted against it and was red on its own first run.
  //
  // This is the assertion that separates the shipped guard from one that walks `findings` for
  // everybody and throws the answer away — a shape no rung at L1 or L6 can see, because that
  // check`s only EFFECT is the callback.
  if (offReads.length === 2 && offReads[0] !== offReads[1]) {
    failed.push(
      `with the check OFF, ${settledBy[0]} settlements read a worker's outputSchema ${offReads[0]} times and ` +
        `${settledBy[1]} settlements read it ${offReads[1]} — the switch is not off, it is running for everybody`,
    );
  }
  // **The control, and it is over the OBSERVED side** (`doc/workflow.md` rule 8 (d), v0.21): the
  // claim above is vacuous if both runs settle the SAME number of tasks, and *the declared list is
  // not empty* would not notice. A tree that makes it fail while the claim passes is one where
  // `ARITIES` holds one value twice.
  if (settledBy.length === 2 && settledBy[0] === settledBy[1]) {
    failed.push(`both arities settled ${settledBy[0]} results, so *the OFF reading does not depend on the settlements* compares a run with itself`);
  }
  // Two arities, so *once per checked settlement* is a proportionality rather than a coincidence.
  if (perSettlement.length === 2 && perSettlement[0] !== perSettlement[1]) {
    failed.push(`the per-settlement read count differs between arities (${perSettlement[0]} against ${perSettlement[1]}) — ` +
      'the check is not run once per settlement');
  }
  if (perSettlement.length !== ARITIES.length) failed.push(`block 3 ran ${perSettlement.length} of ${ARITIES.length} arities — one cannot show a proportionality`);
  if (perSettlement.some((p) => p <= 0)) failed.push('block 3 measured no reads per settlement, so its claim is vacuous');
}

// ================================================================================================

const failed: string[] = [];
console.log(`\n  WHAT ONE SETTLEMENT COSTS — W81, P21, on ${runtimeName}`);
console.log('  Every figure is a RATIO or a COUNT. Nothing here is a millisecond a reader should keep.');
await checkPrice(failed);
await handlePrice(failed);
await switchPrice(failed);
for (const b of BLOCKS) if (!ran.has(b)) failed.push(`${b} did not run, and this file's whole output is those three blocks`);

if (failed.length) {
  console.log('\n  FAIL  a relation this file exists to report does not hold:');
  for (const f of failed) console.log(`    ${f}`);
  console.log('');
  exit(1);
}

console.log(
  '\n  WHAT TO CARRY, and which half is which.\n' +
    '\n  The CHECK is cheap on this corpus and the reason is the PAIR, not the check: the clone is\n' +
    '  linear in the VALUE and the check is linear in the SCHEMA, so block 1`s two axes move in\n' +
    '  opposite directions and a ratio quoted without both is a number about nothing. That is why\n' +
    '  ADR 0060 decision 1 keeps the check off by DEFAULT rather than off on principle: what a\n' +
    '  consumer pays depends on a schema they wrote.\n' +
    '\n  The HANDLE is not cheap and not expensive — it is EXACT. One more `structuredClone` per\n' +
    '  settled task, which is one more copy of everything OR-R2 already copies. Block 2 states it as\n' +
    '  a count, and the reason is off this table: W81`s declaration step ran the same comparison\n' +
    '  three times through `src/` at four shapes up to 24.0 MiB of settled results, and the COUNT\n' +
    '  was the same integer every time while the clock spread 1.02x to 1.35x (Q179; the numbers are\n' +
    '  in that item`s finding 2, not in this file, which makes one pass and tops out at 12.0 MiB).\n' +
    '  The opt-out is real and it is `new Driver(flow, { ...runtime.registry, ... })`, and what it\n' +
    '  costs is that this consumer has no `done` — every road back to one either reinstates the\n' +
    '  per-settlement clone or clones the whole sequence per call.\n' +
    '\n  The SWITCH costs nothing when it is off. Block 3 says so on REAL pools and\n' +
    '  `test/driver/result-schema-cost.test.ts` says the same thing at L2 — two observers, both\n' +
    '  clock-free, and only the second is in the gate.\n',
);
