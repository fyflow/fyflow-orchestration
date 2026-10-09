/**
 * **WHAT ONE RUN HOLDS, on a real `FyflowScheduler`** —
 * [W55](../doc/work-items/w55-a-run-at-scale-on-real-workers.md), and it is
 * [P15](../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s exit
 * artifact.
 *
 * ```bash
 * node examples/retention.ts                       # the artifact, and a sweep
 * node --expose-gc examples/retention.ts           # with the second observer
 * node --expose-gc examples/retention.ts scale 200 4 1
 * node --expose-gc examples/retention.ts topology 800 4 1      # W142: runtime.start alone, shared
 * node --expose-gc examples/retention.ts topology 800 4 1 own  # and on a runtime per run
 * node --expose-gc examples/retention.ts release 1000 4 4       # W151: runs one after another, nothing kept
 * node --expose-gc examples/retention.ts release 1000 4 4 keep-tasks  # with the scheduler's own retention in
 * deno run --import-map=examples/deno-import-map.json --allow-read --allow-net --allow-env \
 *   --v8-flags=--expose-gc examples/retention.ts
 * ```
 *
 * ## Why this is a NUMBER and not a flow
 *
 * P15 decision 3, on a measurement: `npm run test:l6` is ~**101 ms per real run**, so
 * a thousand real runs is already over `doc/workflow.md` section 8's whole **90 s**
 * plan-gate budget, and ten thousand is ~17 minutes. **The scale this plan is named
 * for cannot be a rung**, and adding one is on the plan's stop-and-ask list in any
 * case. So what runs on real workers is one run measured honestly, and what is
 * extrapolated says it is extrapolated.
 *
 * **This file is therefore NOT in the gate chain, and that is a choice with a cost.**
 * It is covered by ladder L0 — `npm run lint` lints `examples/` and
 * `tsconfig.examples.json` includes it, so it cannot rot into something that does not
 * compile — and by nothing else. What binds its OBSERVER is `examples/l6.ts`: the
 * peak/end entry counts this file prints are the same `Retention` value forty-four L6
 * runs assert against ADR 0046, in both runtimes. *A number nobody can re-take is not
 * evidence* (P15 decision 3), which is why it is checked in;
 * [Q242](../doc/questions/q242.md) is the row that says W54's was not.
 *
 * ## What is REPORTED here and what is ASSERTED elsewhere
 *
 * Everything this file prints is a **footprint**, and a footprint is a property of
 * one run on one machine ([Q179](../doc/questions/q179.md)). What is asserted is the
 * **RELATION** — that a region's collection is non-empty before its join becomes
 * terminal and empty after, that a region whose join never becomes terminal still
 * holds it, and that neither the run's outcome nor any task id moves — and that lives
 * in `examples/l6.ts`, where it runs at both L6 rungs on every row.
 *
 * ## The two observers, and why there are two
 *
 * A sensor cannot corroborate itself (`doc/workflow.md` section 5 rule 8, obligation
 * (c)'s LIMIT), and the number is this item's whole deliverable.
 *
 *   1. **`v8.serialize(...).length`** over the driver's own growing structures in ONE
 *      call, so an object reachable twice is counted once. Deterministic and
 *      clock-free. It is in **two** of the five runtimes — node and deno, through
 *      `node:v8`, and in none of the three browsers — and ladder L6 runs in exactly
 *      those two ([Q233](../doc/questions/q233.md)).
 *   2. **`process.memoryUsage().heapUsed` after a forced `gc()`** — the real thing,
 *      and it needs `--expose-gc` (`--v8-flags=--expose-gc` under Deno). **It is
 *      called only from the `scale` mode**, and the reason is measured rather than
 *      asserted: at one run it reads **0.7 MiB, identically on 5 of 5 consecutive
 *      readings**, against the driver's own 15.0 KiB. So it is not *noisy* — it is
 *      **dominated by fixed process overhead, by a factor of about 47**, which is a
 *      different fact and the one worth writing down. N runs held at once is what
 *      makes it a measurement of the run rather than of the interpreter.
 *      *(This paragraph said it was noisy, that this file measured a one-run noise
 *      floor, and that the artifact printed `n/a` for one run. **All three were
 *      false**: nothing called it from `artifact()` at all, so there was no `n/a` to
 *      print and no floor was ever measured. W55's conformity reader, and it is
 *      `doc/workflow.md` section 1 rule 5's writing clause on a claim about this
 *      file's own behaviour.)*
 *
 * ## The method, stated because a number without one is not re-takeable
 *
 * `examples/run-flow.ts`'s `retainedBytes` is the measurement: every own property of
 * the `Driver` except `def`, `graph` and `opts` — the definition and the caller's own
 * options, neither of which grows with the run — serialized in one call, with a `Map`
 * and a `Set` spread first. **It is the same universe and the same call
 * `dev-dist/p15/scale.ts` used for P15 fact 5**, so this rung's per-run number and
 * that table are one measurement at two scales rather than two measurements that
 * happen to agree.
 *
 * **`before` is a RECONSTRUCTION and says so**: the same call with the collection as
 * it stood at its peak added to the list. It is what the driver held before
 * [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
 * rule 3, because the release is the only thing that drops an entry — and W55
 * validated it against the real thing by reverting the two `releaseArrivals` calls
 * and re-taking every row, rather than trusting it.
 */
import { POLICIES } from '../index.ts';
import { buildRuntime, onDelivery, retainedBytes, runFlow, violations, type RunReport } from './run-flow.ts';
import mapAlias from './flows/map-alias.flow.json' with { type: 'json' };
import type { FlowDefinition } from '../index.ts';

const MAL = mapAlias as unknown as FlowDefinition;

/**
 * **Where the ARITY and the RESULT SIZE come from, and neither is in the definition.**
 *
 * `map-alias.flow.json` is `examples/l6.ts`'s own flow for ADR 0037 rule 1. Its
 * `SplitWorker` returns one item per WORD of the entry payload's `text`, memoised per
 * word, and the map's arity is that array's length — a number written down in no
 * field of the document and in no constant here. Its branch entry is `TallyWorker`,
 * whose result **echoes the item's own word**, so the bytes each branch carries into
 * the join are the length of that word.
 *
 * So `arity` distinct words of `kib` KiB each give a run of `arity` map instances
 * whose results are ~`kib` KiB — the two axes `RN-R13` is stated over, on real
 * workers, with **no new role, no new pool and no new flow**.
 */
function payloadFor(arity: number, kib: number): { confidence: number; text: string } {
  const words = Array.from(
    { length: arity },
    // Distinct, so `split`'s memo returns `arity` distinct items rather than one
    // object N times — which is the aliasing case that flow exists for and is NOT
    // what is being measured here.
    (_, i) => String.fromCharCode(97 + (i % 26)) + String(i) + 'x'.repeat(Math.max(0, kib * 1024 - 4)),
  );
  return { confidence: 0.9, text: words.join(' ') };
}

const kib = (b: number | null): string =>
  b === null ? '     n/a' : b < 0 ? '  refused' : (b / 1024).toFixed(1).padStart(9);
const mib = (b: number): string => (b / 1024 / 1024).toFixed(1).padStart(8);
const pct = (a: number, b: number): string => `${((a / b - 1) * 100).toFixed(1)}%`;

const isDeno = typeof (globalThis as Record<string, unknown>).Deno !== 'undefined';
const runtime = isDeno
  ? `deno ${(globalThis as unknown as { Deno: { version: { deno: string } } }).Deno.version.deno}`
  : `node ${(globalThis as unknown as { process: { versions: { node: string } } }).process.versions.node}`;

/**
 * **The second observer, and it reports its own absence rather than a zero.**
 *
 * `gc` is only there under `--expose-gc`; without it a `heapUsed` delta is a
 * measurement of whatever the collector happened to have done, which is not a
 * measurement. Two calls, because the first frees what the second then measures the
 * absence of.
 */
const gc = (globalThis as { gc?: () => void }).gc;
const heapUsed = (): number | null => {
  if (!gc) return null;
  gc();
  gc();
  const p = (globalThis as unknown as { process?: { memoryUsage?: () => { heapUsed: number } } }).process;
  const m = p?.memoryUsage?.();
  return m ? m.heapUsed : null;
};

const argv: string[] = isDeno
  ? (globalThis as unknown as { Deno: { args: string[] } }).Deno.args
  : (globalThis as unknown as { process: { argv: string[] } }).process.argv.slice(2);

// --- the artifact: ONE run, on real workers -------------------------------------

/**
 * **One run, and everything printed about it comes from that run.** The report's
 * `retention` is measured inside `runFlow` at the two ends of `JP-R12`'s window; the
 * outcome and the dispatched ids are printed beside it because *the relation holds
 * and the run is unchanged* is one claim, not two.
 */
async function oneRun(arity: number, sizeKib: number): Promise<RunReport> {
  return await runFlow({
    definition: MAL,
    policy: POLICIES['live-token'],
    runId: `ret${arity}x${sizeKib}`,
    payload: payloadFor(arity, sizeKib),
    // Real workers, no artificial delay: this measures what is HELD, not when.
    delayMs: 0,
    threaded: false,
  });
}

function exit(code: number): never {
  const g = globalThis as unknown as Record<string, { exit?: (c: number) => never } | undefined>;
  if (g.Deno?.exit) g.Deno.exit(code);
  g.process?.exit?.(code);
  throw new Error('unreachable');
}

/**
 * **The sweep, declared and then COUNTED** - W55's adequacy reader. It was an inline
 * literal, so truncating it to one row cost nothing and both 16 KiB rows - which carry
 * `RN-R13`'s *linear in the whole of every result* axis and produce the ratio this file
 * quotes - vanished silently. The two axes are named, and the loop's own count is
 * checked against the list below.
 */
const SWEEP: readonly (readonly [number, number])[] = [[2, 1], [4, 1], [4, 16], [16, 16]];

async function artifact(): Promise<void> {
  console.log(`\n  ladder L6 — what ONE run holds, on a real FyflowScheduler, on ${runtime}\n`);
  console.log('  flow map-alias — arity from the data, result size from the data\n');
  // **Two ratios and not one, and the reason is the finding**: P15 fact 3's 49.8% is
  // the collection as a share OF THE WHOLE, and four documents stated it as the
  // EXCESS over what the run holds without it. They differ by a factor of two.
  const failed: string[] = [];
  const held: number[] = [];
  let ran = 0;
  console.log('    arity   result      held at end   the collection    held BEFORE     excess   of the');
  console.log('               KiB           (KiB)       it released      W53 (KiB)      over      whole');
  console.log('                                                                         after');
  for (const [arity, size] of SWEEP) {
    const r = await oneRun(arity, size);
    const after = r.retention.bytesAtEnd;
    const before = r.retention.bytesBeforeRelease;
    const measured = after !== null && before !== null && after > 0 && before > 0;
    const collection = measured ? before - after : null;
    console.log(
      `    ${String(arity).padStart(5)}   ${String(size).padStart(6)}   ${kib(after)}   ${kib(collection)}` +
        `   ${kib(before)}     ${measured ? pct(before, after).padStart(6) : '   n/a'}` +
        `    ${measured ? `${((1 - after / before) * 100).toFixed(1)}%`.padStart(6) : '   n/a'}`,
    );
    // **Reported beside the bytes, because the bytes are the half nobody can
    // re-take.** These four are what `examples/l6.ts` asserts on every one of its
    // forty-four rows; here they say which run the numbers above belong to.
    console.log(
      `            outcome ${r.state.outcome}, ${r.dispatched.length} tasks, collected ` +
        `${r.retention.peakEntries} and holds ${r.retention.endEntries}` +
        `, aliasing the log: ${r.retention.peakAliasingLog}`,
    );
    for (const v of violations(r, arity)) failed.push(`arity ${arity} / ${size} KiB: ${v}`);
    held.push(after ?? 0);
    ran++;
  }
  if (ran !== SWEEP.length) failed.push(`the sweep ran ${ran} of ${SWEEP.length} declared rows`);
  // **`RN-R13` IS a monotonicity claim, and asserting it is what catches a walk that
  // stopped walking** — W55's adequacy reader, whose edit skipped `arrivals`, `inputs`
  // and `log` INSIDE the loop, leaving the byte column at 0.6 KiB on every row while
  // every relation above still held. The rule says the footprint is *(tasks settled) x
  // (bytes each returned)*, and `SWEEP` is ordered so that product rises; a number
  // that stops rising with it is not measuring the run. **No figure is asserted** —
  // only that the order of the four is the order of the products.
  const products = SWEEP.map(([a, k]) => a * k);
  for (let i = 1; i < held.length; i++) {
    if (products[i]! > products[i - 1]! && held[i]! <= held[i - 1]!) {
      failed.push(
        `arity x KiB rose ${products[i - 1]} to ${products[i]} and what the run holds did not ` +
          `(${held[i - 1]} to ${held[i]} B) — RN-R13 says the footprint is that product`,
      );
    }
  }
  if (new Set(SWEEP.map(([, k]) => k)).size < 2 || new Set(SWEEP.map(([a]) => a)).size < 2) {
    failed.push('the sweep varies only ONE of the two axes RN-R13 is stated over');
  }
  if (failed.length) {
    console.log('\n  FAIL  the relation this file exists to report does not hold:');
    for (const f of failed) console.log(`    ${f}`);
    console.log('');
    exit(1);
  }
  console.log(
    '\n  TWO RATIOS, because one of them was quoted as the other. `excess over after` is the\n' +
      '  collection over everything else the run stored; `of the whole` is its share of the pair.\n' +
      '  P15 fact 3`s **49.8%** is the second kind — the collection is HALF of what a region-bearing\n' +
      '  run holds — and on that same run the first kind reads **+99.2 to +99.4%**, rising with the\n' +
      '  arity. Four documents state the\n' +
      '  second number in the first number`s words. W55 settled it by re-running fact 3`s own\n' +
      '  harness with the release reverted (dev-dist/p15/facts.ts).\n' +
      '\n  And neither ratio is a constant, because the divisor is a property of the FLOW rather than\n' +
      '  of the driver: it is one copy per SETTLED RESULT, so it depends on how many nodes settle\n' +
      '  and how large each result is. The rows above are `map-alias`, whose entry node`s own\n' +
      '  result IS the items, so the run stores the collection`s worth of bytes three times over\n' +
      '  and the excess sits near a third; P15 fact 3`s flow has no node after the join and reads\n' +
      '  near a half. Both figures are in W55`s Record with the harness that took them — only the\n' +
      '  rows above are re-takeable from THIS file, and saying which is which is the point (Q242).\n' +
      '  That is Q240`s lesson with a second variable in it: a ratio reports the fixture`s results\n' +
      '  AND its shape.\n',
  );
}

// --- the scale mode: N runs, one scheduler, real workers throughout ---------------

/**
 * **N real runs on ONE real `FyflowScheduler`, with every driver kept alive.**
 *
 * This is what makes the second observer answerable: `heapUsed` cannot see what
 * nothing references, and `runFlow` drops its driver unless the caller asks for it
 * (`RunOptions.keepDriver`).
 *
 * **It is the same measurement as the artifact above at a larger N, and NOT the same
 * measurement as P15 fact 5's table.** That table is `dev-dist/p15/scale.ts`: ten
 * thousand drivers in one process over a stub scheduler, which is an L2-shaped run
 * and says so. This one dispatches to real worker pools, so N is bounded by the clock
 * rather than by memory — a few hundred, not ten thousand.
 */
async function scale(runs: number, arity: number, sizeKib: number, shared: boolean): Promise<void> {
  // **`shared` is a knob because the answer differs and nothing else here could say
  // so.** `AGENTS.md` §9 recommends the shared-scheduler topology and
  // [ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
  // makes it supported, so *N runs at once* has two readings — one scheduler with N
  // drivers subscribed, or N schedulers. Until ADR 0088 every settlement on a shared
  // scheduler was delivered to every driver's listener and `ID-R4` tier 1 dropped the
  // ones that were not that run's, so only the second reading was linear in N; since
  // W142 the runtime routes and the harness does too, and both are. Run both: the
  // process's share still differs, by one scheduler against N.
  // The flow handed to the runtime is inert here — no node of `map-alias` transforms, so no pool
  // loads an engine — but `createRuntime` requires the flows rather than defaulting them (W63).
  // **`delayMs: 0`** is the document override this mode exists to use: hundreds of runs want none of
  // the per-task delay the document declares for the sake of a causal settling order (W67).
  const runtime = shared ? buildRuntime(false, [MAL], undefined, 0) : null;
  const scheduler = runtime?.scheduler ?? null;
  const heap0 = heapUsed();
  const started = Date.now();
  const reports = await Promise.all(
    Array.from({ length: runs }, (_, i) =>
      runFlow({
        definition: MAL,
        policy: POLICIES['live-token'],
        runId: `s${i}`,
        payload: payloadFor(arity, sizeKib),
        delayMs: 0,
        threaded: false,
        ...(runtime ? { runtime } : {}),
        keepDriver: true,
      })),
  );
  const elapsed = Date.now() - started;
  // **What the SCHEDULER holds, which no L2 table can see and which is the reason
  // this mode runs on a real one.** ADR 0046 rule 6 measured that `maxCompletedTasks`
  // caps `scheduler.tasks` and *"reaches nothing this layer holds"* — true, and the
  // other half of it is that the scheduler's own map is retention a consumer pays
  // **beside** the driver's, at the same 1000s-of-workloads scale. A reader who took
  // `RN-R13` for the whole footprint would be wrong by whatever this column says.
  const schedulerTasks = (scheduler as unknown as { tasks?: Map<string, unknown> } | null)?.tasks;
  const schedulerHeld = schedulerTasks ? schedulerTasks.size : null;
  let schedulerBytes: number | null = null;
  if (schedulerTasks) {
    const ser = await import('node:v8').then((m) => m.serialize).catch(() => null);
    try {
      schedulerBytes = ser ? ser([...schedulerTasks]).length : null;
    } catch {
      schedulerBytes = -1;
    }
  }
  // **After the runs and before `heapUsed`**, because a scheduler that is never shut
  // down keeps the process alive (`AGENTS.md` §2) and its own queues are not the
  // driver's retention.
  if (scheduler) await scheduler.shutdown();
  const heap1 = heapUsed();
  // **Re-taken from the live drivers rather than read off the reports**, so what the
  // two observers measure is the same set of objects at the same moment.
  let serialized = 0;
  let unmeasured = 0;
  for (const r of reports) {
    const b = r.driver ? await retainedBytes(r.driver) : null;
    if (b === null || b < 0) unmeasured++;
    else serialized += b;
  }
  // **The same predicate the artifact runs, and the scale mode had NONE** - W55's
  // adequacy reader. Three separate edits printed 0.0 MiB, `n/a` and a 0.0 KiB per-run
  // figure at exit 0: the driver never handed back, observer 2 disabled, and the
  // serialized sum accumulating zero. A mode whose whole output is a number has to be
  // able to refuse to print one.
  const wrong = reports.flatMap((r) => violations(r, arity).map((v) => `${r.runId}: ${v}`));
  if (unmeasured > 0) wrong.push(`${unmeasured} of ${runs} drivers were not measured at all`);
  if (serialized <= 0) wrong.push('observer 1 summed to nothing');
  if (gc && (heap0 === null || heap1 === null)) wrong.push('observer 2 is available and produced nothing');
  const outcomes = [...new Set(reports.map((r) => r.state.outcome))].sort();
  const held = reports.reduce((n, r) => n + r.retention.endEntries, 0);
  const collected = reports.reduce((n, r) => n + r.retention.peakEntries, 0);
  console.log(
    `\n  ladder L6 at scale — ${runs} real runs on ${shared ? 'ONE shared' : `${runs} own`} ` +
      `FyflowScheduler${shared ? '' : 's'}, on ${runtime}\n`,
  );
  console.log(`    arity ${arity}, result ~${sizeKib} KiB, ${reports.reduce((n, r) => n + r.dispatched.length, 0)} tasks`);
  console.log(`    outcomes                  ${outcomes.join(', ')}`);
  console.log(`    collected / still held    ${collected} / ${held}`);
  console.log(`    serialized  (observer 1)  ${mib(serialized)} MiB${unmeasured ? `  (${unmeasured} unmeasured)` : ''}`);
  console.log(
    `    heapUsed    (observer 2)  ${
      heap0 === null || heap1 === null ? '     n/a  — run with --expose-gc' : `${mib(heap1 - heap0)} MiB`
    }`,
  );
  console.log(
    `    scheduler.tasks           ${schedulerHeld === null ? 'n/a' : `${schedulerHeld} tasks`}` +
      `${
        schedulerBytes === null
          ? ''
          : schedulerBytes < 0
          ? ', bytes REFUSED by the serializer — a FyflowTask is not a value'
          : `, ${mib(schedulerBytes)} MiB — retention BESIDE the driver's`
      }`,
  );
  console.log(`    per run                   ${(serialized / runs / 1024).toFixed(1)} KiB   |   ${elapsed} ms wall\n`);
  if (wrong.length) {
    console.log('  FAIL  the relation this mode exists to report does not hold:');
    for (const w of wrong.slice(0, 8)) console.log(`    ${w}`);
    console.log('');
    exit(1);
  }
  console.log(
    '  The extrapolation is stated AS an extrapolation: per-run bytes x N, and nothing here adds\n' +
      '  a real-worker number to an in-process one. P15 fact 5`s ten-thousand-run rows are that\n' +
      '  table`s own harness, at L2, and W55`s Record prints both columns beside each other.\n' +
      '\n  What observer 1 measures here is the DRIVER and nothing else, and it is linear in N:\n' +
      '  15.0-15.1 KiB a run over a sixteenfold range. Observer 2 measures the process, which at\n' +
      '  this rung also holds the harness`s own copy of every sequence, the reports, and — under\n' +
      '  `shared` — one scheduler carrying six tasks per run. Run both topologies: the driver`s\n' +
      '  share is the same number and the process`s is not.\n',
  );
}

// --- the topology mode: N runs through runtime.start, and NOTHING of this harness's on the scheduler -----

/**
 * **N real runs through `runtime.start` alone — W142, and it is ADR 0088's measurement.**
 *
 * **Why a second mode beside `scale`, and the reason was measured.** `scale` runs each run through
 * `runFlow`, which attaches eight listeners of its OWN to the scheduler per run — `noteDone` among
 * them, which records every settlement it hears in that run's sets — and copies `scheduler.tasks` into
 * each report. On one shared scheduler each of those heard and copied every run's, so `scale` measured
 * the harness's N² beside the library's: W142 re-took W55's figure on `7ba87df` and read **879 MiB** of
 * heap at N = 800 shared, and the same after ADR 0088 routed the drivers. **W142 then routed the
 * harness too** (the maintainer's answer (B) to its prediction-3 stop; `routeHarnessListener` in
 * `run-flow.ts`), and `scale` is linear again — but it still measures a harness with eight listeners a
 * run. This mode attaches nothing: the runs are `runtime.start(flow, payload)` and `await done`, a
 * consumer's two lines, and what it times and weighs is the library's delivery alone.
 *
 * **Two observers, and the second is a COUNT, so it is clock-free** (`doc/workflow.md` section 5 rule 8,
 * obligation (c)'s LIMIT): the wall time and `heapUsed`, which are properties of a machine (Q179), and
 * how many scheduler events each driver was HANDED (`onDelivery`, COUNTED and never kept), which is not. ADR 0088 says
 * a driver is handed its own run's settlement events and nothing of any other run's, so on the shared
 * topology the total is `N x (events per run)` — linear — where a broadcast makes it `N` times that, `N² x (events per run)`.
 *
 * **What it REFUSES to print a figure for**, because a mode whose output is a number must be able to
 * refuse (W55's adequacy reader): a run that did not complete; a driver handed another run's parseable
 * settlement (ADR 0088 rule 1 — the routing has failed, and the wall time beside it would be the
 * broadcast's); a driver handed fewer events than it dispatched tasks (the routing lost one).
 */
async function topology(runs: number, arity: number, sizeKib: number, shared: boolean): Promise<void> {
  // **Before the runtimes are built**, so the heap figure carries each topology's own runtimes: one, or N.
  const heap0 = heapUsed();
  const one = shared ? buildRuntime(false, [MAL], undefined, 0) : null;
  const runtimes = one ? [one] : Array.from({ length: runs }, () => buildRuntime(false, [MAL], undefined, 0));
  const started = Date.now();
  const handles = Array.from({ length: runs }, (_, i) => {
    const rt = one ?? runtimes[i]!;
    const h = rt.start(MAL, payloadFor(arity, sizeKib), { runId: `t${i}`, joinPolicy: POLICIES['live-token'] });
    // COUNTED, never kept: an array of every id would be the heap this mode weighs (see `onDelivery`).
    const tally = { own: 0, theirs: 0 };
    const prefix = `t${i}:`;
    onDelivery(h.driver, (id) => { if (id.startsWith(prefix)) tally.own++; else tally.theirs++; });
    return { ...h, tally };
  });
  const states = await Promise.all(handles.map((h) => h.done));
  const elapsed = Date.now() - started;
  // After the runs and before `heapUsed`, as `scale` does: a scheduler never shut down keeps the process alive.
  await Promise.all(runtimes.map((r) => r.shutdown()));
  const heap1 = heapUsed();
  const wrong: string[] = [];
  let delivered = 0;
  let foreign = 0;
  let dispatched = 0;
  for (const [i, h] of handles.entries()) {
    delivered += h.tally.own + h.tally.theirs;
    dispatched += h.driver.dispatchedIds().length;
    // **Parseable and not this run's** is ADR 0088 rule 1's violation; an id `parseTaskId` refuses
    // would be rule 3's broadcast, and this mode's runs carry none — so ANY id not opening with this
    // run's prefix here is another run's.
    foreign += h.tally.theirs;
    if (states[i]!.outcome !== 'completed') wrong.push(`t${i}: outcome ${states[i]!.outcome}`);
    if (h.tally.own < h.driver.dispatchedIds().length) {
      wrong.push(`t${i}: handed ${h.tally.own} of its own events for ${h.driver.dispatchedIds().length} dispatched tasks`);
    }
  }
  if (foreign > 0) wrong.push(`ADR 0088 rule 1: drivers were handed ${foreign} settlement(s) of runs they do not hold`);
  if (gc && (heap0 === null || heap1 === null)) wrong.push('observer 2 is available and produced nothing');
  console.log(
    `\n  ladder L6 topology — ${runs} real runs through runtime.start on ${shared ? 'ONE shared' : `${runs} own`} ` +
      `runtime${shared ? '' : 's'}, nothing of the harness on the scheduler, on ${runtime}\n`,
  );
  console.log(`    arity ${arity}, result ~${sizeKib} KiB, ${dispatched} tasks, ${runtimes.length} runtime(s) held`);
  console.log(`    outcomes                  ${[...new Set(states.map((s) => s.outcome))].sort().join(', ')}`);
  console.log(`    events handed to drivers  ${delivered}  (${(delivered / runs).toFixed(1)} per run, ${foreign} of another run's)`);
  console.log(
    `    heapUsed    (observer 2)  ${
      heap0 === null || heap1 === null ? '     n/a  — run with --expose-gc' : `${mib(heap1 - heap0)} MiB`
    }`,
  );
  console.log(`    wall                      ${elapsed} ms\n`);
  if (wrong.length) {
    console.log('  FAIL  the relation this mode exists to report does not hold:');
    for (const w of wrong.slice(0, 8)) console.log(`    ${w}`);
    console.log('');
    exit(1);
  }
}

// --- the release mode: N runs ONE AFTER ANOTHER on one runtime, and no handle kept -------------------------

/**
 * **What a long-lived runtime keeps of the runs it FINISHED — W151, and it is ADR 0091's measurement.**
 *
 * ADR 0088 rule 5 kept every driver in the runtime's router for the runtime's life, so a runtime that ran runs one
 * after another and kept no handle grew by ~160 KiB a finished run, unbounded and unreachable through its surface
 * (Q513). ADR 0091 releases a run's driver when its `done` settles and keeps only its id. This mode runs `runs` runs of
 * `map-alias` SEQUENTIALLY on one runtime through `runtime.start` and `await done`, keeps nothing of any of them, and
 * weighs the heap after a forced collection.
 *
 * **The scheduler's own retention is taken out, by default, and it is not this library's.** A `FyflowScheduler` keeps
 * every completed task in `scheduler.tasks` unless `maxCompletedTasks` caps it (its `AGENTS.md`), and `createRuntime`
 * builds its scheduler with no cap — so a figure with the tasks in is the library's AND the scheduler's. This file
 * may not build a scheduler by hand (`l6.ts`'s construction clause), so after each run the mode deletes that run's
 * dispatched ids from `scheduler.tasks`, which is what the cap does. `keep-tasks` leaves them, and is the figure Q513
 * was measured with.
 *
 * **What it refuses to print a figure for** — a run that did not complete; a heap observer that produced nothing; and
 * **a CONTROL that fails where the claim would be vacuous**: after the sequential runs it starts `HELD` more and KEEPS
 * their handles, and the heap must grow by at least `HELD_FLOOR` bytes per held run. An instrument that cannot see a
 * driver someone holds cannot see one the runtime holds either, and *flat* from it would mean nothing. **The claim**,
 * evicting the scheduler's tasks: the growth per finished run, from the warm-up mark to the end, is at most
 * `PER_RUN_CEILING` bytes — the run id ADR 0091 rule 2 keeps, and the allocator's noise.
 */
const HELD = 50;
const HELD_FLOOR = 16 * 1024;
const PER_RUN_CEILING = 1024;
async function release(runs: number, arity: number, sizeKib: number, evict: boolean): Promise<void> {
  const rt = buildRuntime(false, [MAL], undefined, 0);
  const payload = payloadFor(arity, sizeKib);
  const wrong: string[] = [];
  const warm = Math.max(1, Math.floor(runs / 10));
  const marks = new Map<number, number | null>();
  marks.set(0, heapUsed());
  let tasks = 0;
  for (let i = 0; i < runs; i++) {
    if (i === warm) marks.set(warm, heapUsed());
    const { driver, done } = rt.start(MAL, payload, { joinPolicy: POLICIES['live-token'] });
    const state = await done;
    if (state.outcome !== 'completed') wrong.push(`run ${i}: outcome ${state.outcome}`);
    const ids = driver.dispatchedIds();
    tasks += ids.length;
    if (evict) for (const id of ids) rt.scheduler.tasks.delete(id);
  }
  marks.set(runs, heapUsed());
  // THE CONTROL: the same runs, their handles KEPT.
  const held = [];
  for (let i = 0; i < HELD; i++) {
    const h = rt.start(MAL, payload, { joinPolicy: POLICIES['live-token'] });
    await h.done;
    if (evict) for (const id of h.driver.dispatchedIds()) rt.scheduler.tasks.delete(id);
    held.push(h);
  }
  const heldEnd = heapUsed();
  await rt.shutdown();
  const w0 = marks.get(warm) ?? null;
  const w1 = marks.get(runs) ?? null;
  if (w0 === null || w1 === null || heldEnd === null) wrong.push('observer 2 produced nothing — run with --expose-gc');
  const perRun = w0 === null || w1 === null ? null : (w1 - w0) / (runs - warm);
  const perHeld = w1 === null || heldEnd === null ? null : (heldEnd - w1) / HELD;
  if (perHeld !== null && perHeld < HELD_FLOOR) {
    wrong.push(`CONTROL: ${HELD} held handles grew the heap by ${(perHeld / 1024).toFixed(1)} KiB each, under ${HELD_FLOOR / 1024} KiB — the instrument cannot see a held run`);
  }
  if (evict && perRun !== null && perRun > PER_RUN_CEILING) {
    wrong.push(`ADR 0091: the heap grew by ${perRun.toFixed(0)} B per FINISHED run, over ${PER_RUN_CEILING} B — the runtime is keeping finished runs`);
  }
  console.log(`\n  release — ${runs} runs one after another on ONE runtime, no handle kept, on ${runtime}\n`);
  console.log(`    arity ${arity}, result ~${sizeKib} KiB, ${tasks} tasks, scheduler.tasks ${evict ? 'EVICTED per run' : 'KEPT (keep-tasks)'}`);
  for (const [n, h] of [...marks].sort(([a], [b]) => a - b)) {
    const b0 = marks.get(0) ?? null;
    console.log(`    after ${String(n).padStart(6)} runs   ${h === null || b0 === null ? '     n/a' : `${mib(h - b0)} MiB above base`}`);
  }
  console.log(`    per finished run          ${perRun === null ? 'n/a' : `${perRun.toFixed(0)} B`}  (warm-up mark ${warm} to ${runs})`);
  console.log(`    per HELD run (control)    ${perHeld === null ? 'n/a' : `${(perHeld / 1024).toFixed(1)} KiB`}  (${held.length} handles kept)\n`);
  if (wrong.length) {
    console.log('  FAIL  the relation this mode exists to report does not hold:');
    for (const w of wrong.slice(0, 8)) console.log(`    ${w}`);
    console.log('');
    exit(1);
  }
}

if (argv[0] === 'release') {
  await release(Number(argv[1] ?? 1000), Number(argv[2] ?? 4), Number(argv[3] ?? 4), argv[4] !== 'keep-tasks');
} else if (argv[0] === 'scale') {
  await scale(Number(argv[1] ?? 100), Number(argv[2] ?? 4), Number(argv[3] ?? 1), argv[4] !== 'own');
} else if (argv[0] === 'topology') {
  await topology(Number(argv[1] ?? 100), Number(argv[2] ?? 4), Number(argv[3] ?? 1), argv[4] !== 'own');
} else {
  await artifact();
}
