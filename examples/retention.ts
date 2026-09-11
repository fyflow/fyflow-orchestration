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
 * peak/end entry counts this file prints are the same `Retention` value forty-two L6
 * runs assert against ADR 0046, in both runtimes. *A number nobody can re-take is not
 * evidence* (P15 decision 3), which is why it is checked in;
 * [Q242](../doc/open-questions.md) is the row that says W54's was not.
 *
 * ## What is REPORTED here and what is ASSERTED elsewhere
 *
 * Everything this file prints is a **footprint**, and a footprint is a property of
 * one run on one machine ([Q179](../doc/open-questions.md)). What is asserted is the
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
 *      those two ([Q233](../doc/open-questions.md)).
 *   2. **`process.memoryUsage().heapUsed` after a forced `gc()`** — the real thing,
 *      and noisy. It needs `--expose-gc` (`--v8-flags=--expose-gc` under Deno) and it
 *      is **below its own noise floor for one run**, which this file measures rather
 *      than asserts: it is reported for the scale mode, where N runs are held at
 *      once, and printed as `n/a` for one.
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
import { buildScheduler, retainedBytes, runFlow, type RunReport } from './run-flow.ts';
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

/**
 * **The harness's own predicate, and it exists because rule 8 measured its absence.**
 *
 * Everything else here is a `console.log`, so `node examples/retention.ts` exited **0**
 * whatever it measured: pointing it at a flow with no region at all, or making it
 * report a driver that had run nothing, both survived. *A command that cannot fail is
 * not evidence that anything held*, which is `doc/workflow.md` section 5 rule 3 asked
 * of a reporter rather than of a test.
 *
 * **It asserts the RELATION and never the bytes** — the item's own `Tests:` line. On a
 * run that COMPLETED, ADR 0046 rule 3 says the collection is gone and `JP-R12` says one
 * entry was recorded per branch that arrived; a footprint is not checked here and is
 * not checkable ([Q179](../doc/open-questions.md)).
 */
function violations(r: RunReport, arity: number): string[] {
  const bad: string[] = [];
  if (r.state.outcome !== 'completed') bad.push(`outcome ${r.state.outcome}, not completed`);
  if (r.retention.peakEntries !== arity) {
    bad.push(`JP-R12: recorded ${r.retention.peakEntries} arrivals, not ${arity}`);
  }
  if (r.retention.endEntries !== 0) {
    bad.push(`ADR 0046 rule 3: still holding ${r.retention.endEntries} after the join became terminal`);
  }
  if (r.retention.peakAliasingLog !== 0) {
    bad.push(`JP-R12: ${r.retention.peakAliasingLog} held values ARE a log record's own result`);
  }
  return bad;
}

function exit(code: number): never {
  const g = globalThis as unknown as Record<string, { exit?: (c: number) => never } | undefined>;
  if (g.Deno?.exit) g.Deno.exit(code);
  g.process?.exit?.(code);
  throw new Error('unreachable');
}

async function artifact(): Promise<void> {
  console.log(`\n  ladder L6 — what ONE run holds, on a real FyflowScheduler, on ${runtime}\n`);
  console.log('  flow map-alias — arity from the data, result size from the data\n');
  // **Two ratios and not one, and the reason is the finding**: P15 fact 3's 49.8% is
  // the collection as a share OF THE WHOLE, and four documents stated it as the
  // EXCESS over what the run holds without it. They differ by a factor of two.
  const failed: string[] = [];
  console.log('    arity   result      held at end   the collection    held BEFORE     excess   of the');
  console.log('               KiB           (KiB)       it released      W53 (KiB)      over      whole');
  console.log('                                                                         after');
  for (const [arity, size] of [[2, 1], [4, 1], [4, 16], [16, 16]] as const) {
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
    // forty-two rows; here they say which run the numbers above belong to.
    console.log(
      `            outcome ${r.state.outcome}, ${r.dispatched.length} tasks, collected ` +
        `${r.retention.peakEntries} and holds ${r.retention.endEntries}` +
        `, aliasing the log: ${r.retention.peakAliasingLog}`,
    );
    for (const v of violations(r, arity)) failed.push(`arity ${arity} / ${size} KiB: ${v}`);
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
      '  run holds — and on that same run the first kind reads **+99.2%**. Four documents state the\n' +
      '  second number in the first number`s words. W55 settled it by re-running fact 3`s own\n' +
      '  harness with the release reverted (dev-dist/p15/facts.ts).\n' +
      '\n  And neither ratio is a constant, because the divisor is a property of the FLOW rather than\n' +
      '  of the driver: it is one copy per settled result, so it depends on how many nodes settle\n' +
      '  and how large each result is. Measured on one map shape at arity 16 over 16 KiB — no node\n' +
      '  after the join **+97.5%**, a node after the join that echoes the collection **+49.3%**, and\n' +
      '  `map-alias` above **+33.0%**, whose entry node`s own result IS the items. That is Q240`s\n' +
      '  lesson with a second variable in it: a ratio reports the fixture`s results AND its shape.\n',
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
  // drivers subscribed, or N schedulers. Every settlement on a shared scheduler is
  // delivered to **every** driver's listener and `ID-R4` tier 1 drops the ones that
  // are not that run's, so the second reading is the one that is linear in N. Run
  // both; the difference is the topology's, not the driver's.
  const scheduler = shared ? buildScheduler(0, false) : null;
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
        ...(scheduler ? { scheduler } : {}),
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

if (argv[0] === 'scale') {
  await scale(Number(argv[1] ?? 100), Number(argv[2] ?? 4), Number(argv[3] ?? 1), argv[4] !== 'own');
} else {
  await artifact();
}
