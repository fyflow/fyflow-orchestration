/**
 * The one worker file, for **both** runtimes — ladder L6, `RT-R10`.
 *
 * `AGENTS.md` §3 says a Node worker *"must be JavaScript"* and shows a
 * `typeof Deno !== 'undefined'` branch for picking `.ts` or `.js`. **Measured at
 * Node 24.20.0, that is no longer true**: this file runs unchanged in Node
 * (`inline` and threaded) and in Deno, because Node runs TypeScript by erasing
 * types. It is [S9](../../doc/scheduler-upstream.md), and it is what made
 * [Q33](../../doc/open-questions.md)'s answer *Node and Deno* rather than
 * *Node only* — the leaning's whole argument was one worker file per runtime.
 *
 * **One class, TWELVE roles**, selected by the pool's `config` — which is how
 * `examples/run-flow.ts`'s THIRTEEN pools are satisfied without thirteen near-identical
 * files. *(ELEVEN and TWELVE until W63 added `echo` and the `Echo` type's pool; TEN and ELEVEN until W59 added `typed` and the `Scorer` type's pool, which the
 * bootstrap helper builds rather than `pool()`; NINE and TEN until W58 added `retry` and
 * `RetryWorker`.)* *(These read "EIGHT" and "nine" of the state before W45 added `attest` and
 * `AttestWorker`; corrected by [W47](../../doc/work-items/w47-the-blocked-flow-on-real-workers.md),
 * whose conformity reader found five such counts in this file and one next door —
 * and whose own new clauses in `examples/l6.ts` compute all three lists, so the day
 * a tenth role lands the clause goes red where the prose cannot.)* *(This read "three roles" and "`spec/examples/registry.json`'s three
 * `workerType` names" from the day it was written; the roles have been seven since
 * W35 and the registry lists **six**. W43's conformity reader, in the file whose own
 * change is "the role list is one list" — see `ROLES`.)*
 *
 * **A worker computes and does not route** ([ADR 0001](../../doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
 * rule 2). `context.taskId` is available and **exactly one arm reads it — `retry`, since
 * W58 — to remember which ATTEMPT this is, and it derives no output from it** (see
 * `thrownOnce`): deriving a score from a branch index is the first step towards a worker
 * that decides where its own output goes. Which branch takes which road is decided by the
 * *entry payload* and the definition's predicate, and by nothing in here. *(This sentence
 * read "this file does not read it" until W58, and was true until then.)*
 */
import { BaseWorker } from 'fyflow-scheduler';
import type { BaseWorkerContext, TaskWorkerContext, WorkerConfig } from 'fyflow-scheduler';

/** What the entry payload carries, and what every hop passes along. */
export interface Confidence {
  confidence: number;
}

/**
 * **The roles this file handles, as a VALUE — W43, and a LIST BOUND TO NOTHING is
 * what rule 8 obligation (e)'s second question found.**
 *
 * There were **three** lists and nothing compared them: this union, the `switch`
 * arms in `run()`, and the `config: { role }` literals `buildScheduler` passes in
 * `../run-flow.ts`. All three said the same **seven** things before W43 added an
 * eighth, and none of them had to — and the third is **TEN** `pool()` call sites
 * naming **NINE** distinct roles, because `fail` is registered twice. *(This read
 * "nine call sites naming eight distinct roles" before W45's `AttestWorker`. W47.)* *(This paragraph
 * said "the same eight things" of the state BEFORE the eighth existed. W43's
 * conformity reader.)*
 * **Measured**: one letter changed in the pool's role — `pool('weighh', ...)` — and
 * `run()` falls off the end of the switch, returns `undefined`, and from a THREAD
 * pool the scheduler's own message handler dies with
 * `Cannot read properties of undefined (reading 'isWorkerTerminationRequest')`,
 * taking the process down before any assertion runs. Loud, and naming nothing that
 * points at the typo.
 *
 * **The list is now one list IN ONE DIRECTION, and the direction is stated because
 * the reader measured the other one.** `Role` is `typeof ROLES[number]` and
 * `buildScheduler`'s `pool()` takes a `Role`, so a role a POOL invents is a
 * **typecheck** failure — ladder L0, before anything runs (measured: `pool('weighh',
 * …)` gives `TS2345` naming all nine), and removing `'weigh'` from `ROLES` is red
 * in two files. **What is still bound to nothing is `ROLES` -> the switch**: adding
 * `'zzz'` to `ROLES` with no arm and no pool costs **zero**, at L6 and at typecheck
 * both, so the list can still grow members nothing uses. **[W47](../../doc/work-items/w47-the-blocked-flow-on-real-workers.md)
 * CLOSED that**: `examples/l6.ts` reads this file's `ROLES` block and `run()`'s arms
 * as source text and compares them to `buildScheduler`'s registry both ways, so
 * `'zzz'` now costs **2** and an arm for a role nothing declares costs **1**. That
 * is rule 8 obligation (e)'s third shape at v0.13, in the direction the TYPE above
 * cannot reach ([Q196](../../doc/open-questions.md)).**
 * [Q196](../../doc/open-questions.md). `run()` carries a `default` arm for the half
 * a type cannot reach — a config built at run time — and that arm turns the missing
 * case into a named refusal instead of the scheduler crash below. It is
 * [W32](../../doc/work-items/w32-what-a-map-fanout-is.md)'s `enter()` finding one
 * file across: *a switch over a union TypeScript does not require to be exhaustive,
 * with no `default`, returns `undefined` and the caller believes it.*
 */
export const ROLES = [
  'ingest', 'score', 'publish', 'fail', 'uncloneable', 'split', 'tally', 'weigh',
  // **W45's role, and it exists because no shipped one can observe an ABSENT key.**
  // `FD-C4` says a conditional reference whose target produced nothing leaves its
  // key out of the composed object, and every other role here reads a field by name
  // — under which *absent* and *present holding undefined* are the same thing.
  // That is W43's `weigh` finding one rule along: a role that cannot see the
  // property a decision turns on makes a row that cannot tell the rule from its
  // negation.
  'attest',
  // **W58's role, and it exists because no shipped one FAILS ONCE.** `fail` fails every
  // time, so a retry policy on it only spends the budget; this one throws on the first
  // attempt of a task id and returns on the second, which is the only way a real
  // scheduler ever sets a non-zero `attempts` on a task that settles `done`.
  'retry',
  // **W59's role, and it exists because no shipped one reads an ENVELOPE.** Every other role
  // reads its payload whole; this one reads `settings` and `input` by name (`FD-C5`), computes
  // a score from BOTH — so two nodes of one type with different settings return different
  // answers from the same input — and fails its first attempt when `settings.failFirst` says
  // so, which is how one of the two retries under the TYPE's policy. It echoes the envelope's
  // key set, so a driver that wrapped more (or less) than the two keys is red on the value.
  'typed',
  // **W63's role, and it exists because no shipped one ECHOES ITS INPUT.** The exit artifact's
  // claim is *what the worker RECEIVED* after a declared `transform` ran in the type's wrapper
  // (`FD-C6`): `typed` reads two fields of its input by name, so a reduction to a NUMBER or a
  // reshaped item would reach it as `confidence: 0`. This one returns its `input` whole, with
  // its type and — at every depth — the own keys of any array that are not indices, which is
  // the one observer of ADR 0052 rule 6's *plain values* a worker can be: JSONata marks the arrays
  // it builds, the adapter strips the markers, and `JSON.stringify` cannot see either.
  'echo',
] as const;
export type Role = typeof ROLES[number];

/**
 * **The task ids the `retry` role has already thrown for, per PROCESS.** A retry is a
 * second attempt of the SAME task id (`spec/flow-definition.md` section 2, v0.16), so
 * the memo is keyed by the id and nothing else — which is why the role reads
 * `context.taskId`, the one place in this file that does. **It is read to decide
 * whether THIS attempt throws, never to decide what is returned or where it goes**:
 * the second attempt returns a function of the payload alone, exactly as `score` does,
 * so the role computes and does not route (ADR 0001 rule 2) — the header's own warning
 * is about deriving an OUTPUT from the id, and this derives none.
 *
 * Per process, so the pool must be **inline**: a thread torn down between attempts
 * would forget, and the row would then measure the pool's lifetime rather than the
 * scheduler's retry.
 */
const thrownOnce = new Set<string>();

export default class FlowWorker extends BaseWorker {
  private readonly role: Role;
  private readonly delayMs: number;

  // Both arguments forwarded — dropping the second leaves `this.workerContext`
  // undefined and `terminateWithError()` silently does nothing (`AGENTS.md` §4).
  constructor(config: WorkerConfig = {}, workerContext?: BaseWorkerContext) {
    super(config, workerContext);
    const c = config as { role?: Role; delayMs?: number };
    this.role = c.role ?? 'score';
    this.delayMs = c.delayMs ?? 0;
  }

  // Abstract on `BaseWorker`; omitting either is a compile error.
  async setup(): Promise<void> {}
  async teardown(): Promise<void> {}

  async run(envelope: unknown, context?: TaskWorkerContext): Promise<unknown> {
    // A real await, so the two fan-out branches genuinely overlap and their
    // completion order is the scheduler's rather than this file's. Nothing may
    // depend on that order (`doc/concept.md` section 5).
    if (this.delayMs > 0) await new Promise((r) => setTimeout(r, this.delayMs));

    // **Every pool is fronted by the package's envelope worker since W65 (ADR 0054)**, so what
    // arrives here is `{ settings, input }` for EVERY role. The `typed` and `echo` roles read the
    // envelope by name, as they did at v0.17; the eleven roles that read their payload whole read
    // `input`, which is exactly the object they read as their whole payload before — P18 fact 4's
    // 146 nodes, one unwrap. Written as one expression so the roles below are otherwise untouched.
    const payload: unknown = this.role === 'typed' || this.role === 'echo'
      ? envelope
      : (envelope as { input?: unknown } | null | undefined)?.input;

    switch (this.role) {
      case 'retry':
        // **Fails ONCE per task id, then succeeds — W58.** See `thrownOnce` for why
        // the id is read and what it is not used for. The second attempt's result is
        // `score`'s shape plus a marker, so a row can tell a retried settlement from a
        // first-attempt one by the value as well as by `attempts`.
        {
          const id = context?.taskId ?? '';
          if (!thrownOnce.has(id)) {
            thrownOnce.add(id);
            throw new Error(`retry worker: first attempt of ${id} fails on purpose`);
          }
          return { confidence: confidenceOf(payload), score: Math.round(confidenceOf(payload) * 100), retried: true };
        }
      case 'typed':
        // **The role a node TYPE runs — W59, `FD-C5`.** The payload is the ENVELOPE, and this
        // arm reads its two keys by name: `settings` is the node's own declaration (its own
        // copy — a write here reaches no sibling), `input` is what an untyped node in the same
        // position would have received whole. Four things are observable and each is a claim:
        //   - `keys` is the envelope's key set — exactly `['input', 'settings']`, or the driver
        //     wrapped more or less than the rule says (W43's `weigh` reasoning, one rule over);
        //   - `score` is `confidence * settings.factor`, so two nodes of ONE type with DIFFERENT
        //     settings return DIFFERENT answers from the same input — the exit artifact's pair;
        //   - `retried` is true only on a SECOND attempt, and the first is thrown away when
        //     `settings.failFirst` is true — the retry that runs under the TYPE's policy, with
        //     `thrownOnce`'s per-process memo, so the pool must be inline (see `retry`);
        //   - `items` is echoed when the input carries an array of them, so a typed node can feed
        //     a `map` inside a fanout branch — the nested shape obligation (a) asks for.
        {
          const env = (payload ?? {}) as { settings?: Record<string, unknown>; input?: unknown };
          const settings = (env.settings ?? {}) as { factor?: unknown; failFirst?: unknown };
          const id = context?.taskId ?? '';
          const failFirst = settings.failFirst === true;
          if (failFirst && !thrownOnce.has(id)) {
            thrownOnce.add(id);
            throw new Error(`typed worker: first attempt of ${id} fails on purpose (settings.failFirst)`);
          }
          const c = confidenceOf(env.input);
          const factor = typeof settings.factor === 'number' ? settings.factor : 0;
          const inputItems = (env.input as { items?: unknown } | null | undefined)?.items;
          return {
            keys: Object.keys((payload ?? {}) as Record<string, unknown>).sort(),
            settingsKeys: Object.keys(settings).sort(),
            confidence: c,
            factor,
            score: Math.round(c * factor),
            retried: failFirst && thrownOnce.has(id),
            ...(Array.isArray(inputItems) ? { items: inputItems } : {}),
          };
        }
      case 'echo':
        // **The role a node TYPE runs when the claim is WHAT ARRIVED — W63, `FD-C6`.** The payload
        // is the envelope the wrapper hands its inner worker AFTER evaluating a declared
        // `transform`: `{ settings, input }` with `input` REPLACED by the expression's result
        // (ADR 0051 rule 3) — a number for `$sum([*.score])` over a join's record, a reshaped
        // object for a map instance's item — and no third key. Four things are observable and
        // each is a separate claim, so a row reads the value and never a projection of it:
        //   - `keys` is the envelope's key set, exactly `['input', 'settings']` — the wrapper hands
        //     the inner worker two keys and consumes `transform` (W59's `keys` reasoning);
        //   - `inputType` is a second, independent expression over the same value (obligation (c)'s
        //     LIMIT): `$sum([*.score])` over `{}` is the NUMBER 0 where `$sum(*.score)` would be
        //     `undefined` — Q263's third arity, told apart by type rather than by `0 == undefined`;
        //   - `markedKeys` walks the input and lists, at every depth, any own key on an ARRAY that
        //     is not an index (`fields:sequence`). JSONata marks the arrays it builds and the
        //     adapter hands out plain values (ADR 0052 rule 6); a deep-equal over JSON text cannot
        //     see a marker, so this is the L6 observer that makes reverting W62 cost something —
        //     and `arrays` is how many arrays that walk REACHED, the second expression over the
        //     same walk (obligation (c)'s LIMIT): rule 8 measured a walk that stopped at the top
        //     level surviving with the markers kept, because the one marked array sits one level
        //     down inside the reshaped object and an empty list is what a blind walk reports too.
        //     A reshaped item owes exactly one array; a reduced number owes none;
        //   - `realm` is whether this worker shares the harness's global object — W62's second
        //     observer of a backend, one rung up: `run-flow.ts` marks its own realm, an inline
        //     worker sees the mark and a thread does not. The `Echo` pool is declared threaded so
        //     the adapter's worker half is loaded by URL in a fresh realm (ADR 0051 rule 2's ground),
        //     and W63's adequacy reader found that sentence stated with no observer at L6;
        //   - `input` is the value itself, so the row says WHAT the worker received — 990, 400, 0
        //     at three arities, `{ word, score, fields }` for a reshaped item — from the run.
        {
          const env = (payload ?? {}) as { settings?: Record<string, unknown>; input?: unknown };
          const walk = markedKeysOf(env.input);
          return {
            keys: Object.keys((payload ?? {}) as Record<string, unknown>).sort(),
            settingsKeys: Object.keys(env.settings ?? {}).sort(),
            inputType: Array.isArray(env.input) ? 'array' : env.input === null ? 'null' : typeof env.input,
            markedKeys: walk.marked,
            arrays: walk.arrays,
            realm: typeof (globalThis as { __L6_HARNESS_REALM__?: unknown }).__L6_HARNESS_REALM__ !== 'undefined' ? 'harness' : 'thread',
            input: env.input,
          };
        }
      case 'ingest':
        return { confidence: confidenceOf(payload) };
      case 'split':
        // **A map's ARITY, and it is a fact about this return value** — W35, and
        // the whole of what ladder L6 adds to
        // [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md)'s fixtures.
        //
        // The number of tasks the run dispatches is `items.length`, and that number
        // appears in **no** field of the flow definition and in **no** constant in
        // the harness: the definition says `over: "items"` and nothing about how
        // many, and `examples/l6.ts` declares the ids it EXPECTS, which is what
        // makes a miscount a failure rather than a silent re-plan. A `fanout`
        // cannot reach this shape — `FD-V9` requires its branch entries to be
        // written down.
        //
        // **One item per word, and each carries a DIFFERENT confidence**, derived
        // from its own word's length. That is not decoration: handed the whole
        // value rather than its own item, every instance would compute the same
        // score and the row could not tell
        // [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
        // rule 3 from its negation. `'a bb ccc'` gives 0.1, 0.2, 0.3.
        //
        // **Total, like `confidenceOf`**: no text is zero items, which is a lawful
        // map (`FD-R2` says an empty array is not the refusal) and the arity
        // `FD-V9`'s floor means the static feature can never produce.
        //
        // **The items are MEMOISED per word, and that is what makes ADR 0037's own
        // INVARIANT falsifiable at L6 — W35's adequacy reader.** Rule 1 is *no two
        // nodes ever receive the same object*, and the driver's per-instance
        // `cloneValue` is what holds it: `structuredClone` preserves aliasing WITHIN
        // one clone, so an `items` array holding one object twice survives the edge
        // hop still holding it twice. **Dropping that clone cost 0 failures**, because
        // every payload here produced distinct items and L6 could not express the
        // case the driver's own comment names. One word cached per word is the
        // natural way to produce it: `'a bb ccc'` is unchanged, and `'a a'` is two
        // references to one object.
        return {
          confidence: confidenceOf(payload),
          items: memoisedItems(wordsOf(payload)),
        };
      case 'tally':
        // **A worker that MUTATES what it was handed**, and the only one here that
        // does. It is what turns *two instances share an object* from an identity
        // fact into an observable one: sharing makes the second instance read the
        // first's write, so the two results differ. With the clone in place both
        // read `seen: 1`.
        //
        // **Deliberately not defensive.** A worker that copies its input first would
        // be correct practice and would measure nothing; ADR 0037 rule 1 exists so
        // that a worker need not.
        {
          const p = (payload ?? {}) as { seen?: number; word?: string };
          p.seen = (p.seen ?? 0) + 1;
          return { seen: p.seen, word: typeof p.word === 'string' ? p.word : null };
        }
      case 'weigh':
        // **The role that reads its DECLARED KEYS, and W43 exists because no
        // shipped role did.** [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
        // rule 6: a node that declares `needs` receives **exactly the object
        // `needs` describes**, each key its own copy. Every other role here reads
        // `payload.confidence`, which under a `needs` is `undefined` — so
        // `map-with-context` ran end to end on real workers with all three
        // instances returning `{confidence: 0, score: 0}`, and the row could not
        // tell rule 6 from its negation. Measured at W43's declaration step.
        //
        // **Three things are made observable and each is a separate rule:**
        //
        //   - `keys` is `Object.keys(payload).sort()`, which is **rule 6 itself**.
        //     Hand this node what its predecessor produced instead and the keys are
        //     `confidence, items`; hand it the whole value merged with its item and
        //     they are four. It is the one assertion here that fails on a driver
        //     that gives a node MORE than it asked for, which no count can see.
        //   - `score` is a function of **both** declared keys, so neither can be
        //     dropped for zero: `item` is the `"."` form (`FD-C1`, and ADR 0037
        //     rule 3's *its own item*) and `run` is the node-id form resolved from
        //     outside the map region (`FD-C2`). The three instances return three
        //     DIFFERENT scores, which is W35's `text` reasoning one rule across.
        //   - `word` echoes the item's own field, so a driver handing every
        //     instance item 0 is a failure naming which item it got, rather than a
        //     number that happens to be equal.
        //
        // **Total, like `confidenceOf`**: a worker that throws on a shape is a
        // worker that hides a routing bug, and here it would hide the very defect
        // this role was added to see.
        {
          const p = (payload ?? {}) as { item?: { word?: unknown; confidence?: unknown }; run?: unknown };
          const mine = typeof p.item?.confidence === 'number' ? p.item.confidence : 0;
          const theirs = confidenceOf(p.run);
          const seen = Object.keys((payload ?? {}) as Record<string, unknown>);
          return {
            keys: seen.slice().sort(),
            // **A SECOND, INDEPENDENT reading of the same payload — W43's adequacy
            // reader, BLOCKING.** `keys` was the only thing anywhere that could
            // observe a driver composing MORE than `needs` describes, and a sensor
            // cannot corroborate itself: re-sourcing it to the literal
            // `['item', 'run']` cost **0**, and with that literal in place a driver
            // seeded with an extra key cost 0 as well — where with `keys` live it
            // costs 8. **One expression, one edit, and ADR 0040 rule 6's *exactly*
            // is unasserted.**
            //
            // This is a different expression over the same fact, so a probe that
            // re-sources either one leaves the other live. It is deliberately the
            // NEGATIVE form — what should not be here — because that is what a
            // superset makes true and an exact match makes empty, and an empty array
            // is a value the row can pin without restating the declaration.
            extraKeys: seen.filter((k) => k !== 'item' && k !== 'run').sort(),
            word: typeof p.item?.word === 'string' ? p.item.word : null,
            confidence: mine,
            score: Math.round(mine * theirs * 100),
          };
        }
      case 'attest':
        // **The role that reports whether a KEY IS THERE — W45, `FD-C4`.**
        //
        // **TWO independent expressions over the same fact, and that is
        // `doc/workflow.md` section 5 rule 8 obligation (c)'s LIMIT applied before a
        // reader had to find it.** v0.13: *when the compound probe is green, count
        // the observers; at one, the fix is a second independent expression over the
        // same fact rather than a better probe.* `keys` is `Object.keys(payload)`
        // and `sawVerdict` is the `in` operator, so a probe that re-sources either
        // leaves the other live — where a single reading would remove the only
        // observer and make the compound measure nothing. That is exactly what W43
        // measured on `weigh`, and it cost eight failures to find.
        //
        // **`keys` also fails on a driver that gives a node MORE than it asked
        // for**, which no `in` test and no count can see — ADR 0040 rule 6.
        {
          const p = (payload ?? {}) as Record<string, unknown>;
          return {
            keys: Object.keys(p).sort(),
            sawVerdict: 'verdict' in p,
            // And the value, so a row where the key IS present says what arrived
            // rather than only that something did.
            verdict: (p.verdict ?? null) as unknown,
          };
        }
      case 'score':
        // `score` is derived from the payload alone, so the result is a function
        // of the input and the run is reproducible.
        return { confidence: confidenceOf(payload), score: Math.round(confidenceOf(payload) * 100) };
      case 'fail':
        // **One throwing worker; what it produces is decided by the NODE.** Four
        // flows use this role and they get four different things, which is the
        // clearest demonstration in the repository that the outcome is a property
        // of the definition rather than of the worker:
        //
        //   optional, no failure edge  -> settles `failed`, branch LOST
        //   optional, `on:["failed"]`  -> settles `failed`, branch EXITED
        //   NOT optional               -> ends `user_action`, branch SUSPENDED
        //   outside a region           -> settles `failed` and routes on
        //
        // The first two are `core/FyflowScheduler.ts:894-897`'s `if (task.optional)`
        // branch; the third is the other one. ADR 0007 rule 2, measured before P2
        // was written.
        throw new Error('flaky worker: this task is meant to fail');
      case 'uncloneable':
        // **A result `structuredClone` refuses**, which is `OR-R6`'s whole
        // condition. It reaches the driver only from an **inline** pool: across a
        // worker-thread boundary the scheduler refuses it first and the task ends
        // `user_action` with no result at all ([Q61](../../doc/open-questions.md)).
        // A function is the smallest such value.
        return { fn: () => 1 };
      case 'publish':
        // **The payload here is the JOIN's collection** — an object keyed by the
        // `branchPath` of every branch that arrived, valued by what that branch
        // carried in ([ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md),
        // `JP-R12`). **It is `{}` when nothing arrived**, which `live-token` makes
        // reachable, so `?? null` is a guard for a node reached outside a region
        // rather than the join case.
        //
        // *(This read **"The payload here is `null`. A satisfied join carries
        // nothing downstream, which is a placeholder rather than an answer — and a
        // worker that assumed otherwise would be the first thing to break when Q36
        // lands."** It landed, and the thing that broke was the EXPECTATION rather
        // than this worker, because the echo was written to pass the value through
        // rather than to interpret it.)*
        return { published: true, joinPayload: payload ?? null };
      default:
        // **A role the switch does not handle is a REFUSAL, not `undefined`** —
        // W43, and the run-time half of `ROLES` above. TypeScript does not require
        // a switch over a union to be exhaustive and this one has eight arms, so
        // without this the function returns `undefined` and the scheduler crashes
        // in its own message handler. `role` is typed, so this arm is unreachable
        // from a literal; it is reachable from a `config` built at run time, which
        // is exactly how a pool is configured.
        //
        // **It throws rather than returning a marker**, because a worker that
        // returns something plausible for a role nobody wrote is the silent failure
        // this arm exists to remove — and the message names the role and the file to
        // edit, which is what the upstream crash did not.
        throw new Error(
          `flow-worker: no arm for role "${String(this.role)}". ROLES declares ` +
            `[${ROLES.join(', ')}]; add a case to run() or fix the pool's config.`,
        );
    }
  }
}

/** Total, and it never throws: a worker that rejects on a shape is a worker that hides a routing bug. */
function confidenceOf(payload: unknown): number {
  const c = (payload as Partial<Confidence> | null | undefined)?.confidence;
  return typeof c === 'number' ? c : 0;
}

/**
 * The words of `text`, and **total for the same reason `confidenceOf` is**.
 *
 * `''.split(' ')` is `['']` rather than `[]`, so the filter is what makes *no
 * text* mean *no items* — and that is the row `FD-V9`'s arity floor makes
 * unreachable for a `fanout`, so it is worth one line rather than a `?? []`.
 */
function memoisedItems(words: readonly string[]): { word: string; confidence: number }[] {
  const seen = new Map<string, { word: string; confidence: number }>();
  return words.map((word) => {
    const hit = seen.get(word);
    if (hit) return hit;
    const made = { word, confidence: word.length / 10 };
    seen.set(word, made);
    return made;
  });
}

/**
 * **Every own key on every ARRAY reachable from `v` that is not an index, as `path:key` — and how
 * many arrays the walk reached** — W63's observer of ADR 0052 rule 6. JSONata marks a sequence it
 * builds with own `sequence` / `keepSingleton` keys; `structuredClone` keeps them across a thread
 * and `JSON.stringify` drops them, so a row comparing JSON text is blind to a marker that reached
 * the worker. `arrays` is the walk's own reach stated beside its finding, so a walk that stops
 * short reports fewer arrays rather than a clean list. Total and cycle-safe, like `confidenceOf`:
 * an observer that throws on a shape hides the defect it watches.
 */
function markedKeysOf(v: unknown, path = '', seen = new Set<unknown>()): { marked: string[]; arrays: number } {
  if (typeof v !== 'object' || v === null || seen.has(v)) return { marked: [], arrays: 0 };
  seen.add(v);
  const marked: string[] = [];
  let arrays = 0;
  const into = (x: unknown, p: string) => { const r = markedKeysOf(x, p, seen); marked.push(...r.marked); arrays += r.arrays; };
  if (Array.isArray(v)) {
    arrays++;
    for (const k of Object.keys(v)) if (!/^\d+$/.test(k)) marked.push(`${path}:${k}`);
    v.forEach((x, i) => into(x, `${path}[${i}]`));
  } else {
    for (const [k, x] of Object.entries(v)) into(x, path ? `${path}.${k}` : k);
  }
  return { marked: marked.sort(), arrays };
}

function wordsOf(payload: unknown): string[] {
  const t = (payload as { text?: unknown } | null | undefined)?.text;
  return (typeof t === 'string' ? t : '').split(' ').filter((w) => w.length > 0);
}
