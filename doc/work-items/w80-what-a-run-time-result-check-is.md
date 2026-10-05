# W80 — what a run-time result check IS

**Status:** done
**Plan:** [P21](../plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md) — *what does a
run-time schema check buy, and what does it cost against what a settlement already pays?*

```
Spec:       spec/outcome-record.md section 4 — OR-R13, new. NOT spec/flow-definition.md: `FD-R`
            is "what a RUN refuses" and this refuses nothing (plan decision 3).
Owns:       src/driver/**, src/definition/**, spec/**, test/driver/**, doc/decisions/0060-*
Inputs:     P21 facts 3 and 4, re-taken on this tree (below); ADR 0053 (the twelve-keyword
            subset); OR-R2, OR-R11 and OR-R12; FD-R4's two boundaries, as W73 shipped them.
Outputs:    (1) ADR 0060 — what the check is, where it runs, and what a finding IS
            (2) `DriverOptions.onNonconformingResult` and the `NonconformingResult` it receives
            (3) `OR-R13` in spec/outcome-record.md v0.10, with spec/README.md's row moved by C8
            (4) the CONSTRUCTED case fact 3 says the corpus no longer has, and the measurement
                of what the wiring check, `check:workers` and `FD-R4` cannot reach (prediction 3)
Depends on: nothing
Blocks:     W81
Tests:      test/driver/result-schema.test.ts at L1-L2 on a fake scheduler. Every expected value
            comes from the schema the case declares and from `findings`' own output shape, never
            from the driver. The decision-3 pair — one flow, one nonconforming settlement, run
            with and without the callback — is the item's central claim and its own control.
Gate:       L0 under all five typecheckers; L1-L2; check:spec; L6 UNMOVED
Reserves:   Q330-Q334, ADR 0060 (Q334 unused)
```

## Scope

**In**

1. **The knob**: one `DriverOptions` member, a callback, **and its presence is the switch**. Off by
   default (plan decision 1, the maintainer's answer to stop-and-ask (a)).
2. **The site**: one, named, in `src/driver/driver.ts`'s settlement path, on the value the record
   carries after `OR-R2`'s clone.
3. **The finding**: REPORTED and never routed (plan decision 3, stop-and-ask (b)) — no record
   written, no terminal state changed, no dispatch moved, `OR-R12`'s precedent.
4. **`OR-R13`**, and the subset unchanged (plan decision 4).
5. **The constructed case**, and what it reaches that nothing else does.

**Out** — with where each goes instead

- **The PRICE at L6's scale, and Q320.** W81's, whole. This item measures prediction 1's reversal
  because the plan told it to and because its own fixtures could otherwise reverse it by accident,
  and it states the number as a ratio; it changes no cost anywhere.
- **The L6 row, and the reference teaching the knob.** W82's. **L6 UNMOVED here.**
- **Anything that moves `FD-R4`.** W73 settled the entry payload and a person's resolution; this is
  a third site over the same schema and reopens neither.
- **`oneOf`, and any widening of the subset.** P19 slice 2, Q311, condition not fired.
- **A GUARD** — a driver-authored `resolution`-shaped record that routes. The mechanism exists
  (`OR-R9` composes it, `RS-R3` routes it) and plan decision 3 refuses it; ADR 0060 records the
  road rather than pretending there is none.
- **Making `findings` cheaper.** The `enum` measurement below says where the cost is; the remedy is
  a cost change and the price is W81's subject.

## The declaration step — four facts re-taken, and two of them move the plan

*Node 24.20.0 asserted, every probe RUN and redirected to `dev-dist/w80/`, tree held still at digest
`f7b0fa7bb7b1cf24` over 366 files.*

| | | |
|---|---|---|
| **fact 3** | **REPRODUCES exactly.** `0 violating of 5 checked` on the control and on the eleven-letter run; `FD-R4` throws `BoundaryRefused` naming `$.confidence above maximum 1` on the third. First twelve lines byte-identical to the declaration's own `fact3.txt` | `fact3.txt` |
| **fact 4** | **REPRODUCES in shape and in conclusion**: validation is **90.3% / 14.1% / 6.0%** of the clone against the plan's 92.9% / 14.7% / 5.9%, worst single settlement **1.48x / 0.21x / 0.17x** against 1.52x / 0.22x / 0.14x, and `publish`'s big `joinPayload` is **0.3789 ms to clone and 0.0006 ms to check — 0.00x** | `fact4.txt` |
| **fact 1** | **REPRODUCES to the decimal** — 15.0 / 486.0 / 2426.3 KiB walked, `driver.opts` refused by `v8.serialize`, `opts` skipped by name | `fact1.txt` |
| **fact 2** | **REPRODUCES**: clones 46 → 52, 94 → 106, 414 → 466, time inside the noise | `fact2.txt` |

### Finding 1 — P21 prediction 1 REVERSES, at an ordinary shape, and the plan's headline is scoped rather than wrong

The plan's reach sentence is *the share FALLS as the workload grows*, and prediction 1's reversal
condition is *a schema shape whose check is superlinear where the clone is linear — the likeliest is
a large `enum` or a deeply nested `items`, neither of which this corpus can express.* Measured
deliberately, because this item's own fixtures could have reversed it by accident:

```
  result size   enum   validate ms    clone ms    ratio
    0.5 KiB      3       0.0029      0.0027      1.07x   <<< OVER THE CLONE
    0.5 KiB    100       0.0120      0.0039      3.08x   <<< OVER THE CLONE
      4 KiB     10       0.0021      0.0051      0.41x
      4 KiB    100       0.0086      0.0052      1.65x   <<< OVER THE CLONE
     64 KiB   1000       0.0788      0.0521      1.51x   <<< OVER THE CLONE
```

**The mechanism is not nesting and it is not size.** `findings`' `enum` clause canonicalises the
value once and then **every entry of the enum, on every check** — so the check is linear in the
**SCHEMA** while the clone is linear in the **VALUE**, and the two are unrelated quantities. *Their
ratio is therefore unbounded in both directions*, which is why fact 4 reads 0.00x on this corpus
(small schemas, large values) and why one `status` field with a hundred allowed values on a 4 KiB
result reads 1.65x. A deeply nested `properties` chain is **not** the case: 200 levels came back at
**1.44x**, because that recursion is linear in the value exactly as the clone is.

*So fact 4's conclusion survives with its scope named: the share falls as the VALUE grows and rises
as the SCHEMA does.* The plan says the ratio falls *because the clone is linear in the whole value
and the check short-circuits on the schema's shape* — the second half is true of `type`, `required`
and `properties` and false of `enum`, which does not short-circuit at all. **No decision moves**:
decision 1 keeps the check off by default and this strengthens that rather than weakening it, and
the remedy is a cost change, which is W81's. `dev-dist/w80/decl-p1.txt`, `decl-p1b.txt`.

*(Measured twice. The first pass compared the enum check against a clone of a four-character string
and read **2552x** at 20 000 entries — a ratio whose denominator was the timer's floor, which is
section 4's reading clause and P21's own four-probes-measured-the-apparatus sequence. The second
pass gives the clone a realistic value to copy, and the reversal survives it.)*

### Finding 2 — the REACH has a second leg the plan does not name, and it is unreachable by any authoring-time tool BY CONSTRUCTION

Prediction 3's reach is *a bound a producer does not keep past its declared domain* — Q302's shape,
and the wiring check reads two SCHEMAS while `check:workers` runs ONE example, so a producer whose
declared bound its own code does not keep is a `fit` at every arc and green at every example.
Measured: a `split`-like worker declaring `maximum: 1` over `text.length / 10` accepts `"short"` and
returns `1.3` on `"unexceptional"`.

**The second leg**: the value a result check sees is the one the RECORD carries — **after `OR-R2`'s
clone** — and `OR-R11` says that is a different value from the one the worker returned. So the same
schema, applied by `check:workers` to what `run()` returned and by this check to what the log holds,
can **disagree**. Measured over seven shapes:

| shape | `check:workers` sees | the record carries |
|---|---|---|
| a **non-enumerable own** property | accepts | **REFUSES** `$.score required` |
| the same, **nested** one level | accepts | **REFUSES** `$.inner.n required` |
| an own accessor that **throws** | accepts | **the clone throws** — `OR-R6` |
| a **prototype getter** | REFUSES | REFUSES — *they agree* |
| an own enumerable accessor, an `Error`'s `message`, a symbol key | accepts | accepts |

*The control row matters as much as the disagreements*: a prototype getter is invisible to **both**,
because `findings` reads OWN keys and never `in` — which is W65's conformity reader's fix closing
this gap before it was looked for. **No authoring-time tool can reach the three that disagree**, for
a reason that is structural rather than an omission: none of them holds a record.
`dev-dist/w80/decl-reach.txt`, `decl-reach2.txt`.

## What ADR 0060 has to settle, and what it is decided against

1. **The callback's presence IS the switch**, over a boolean beside it. Two members are two sources:
   `true` with no callback is cost for nothing, and `false` with a callback is **a typed option
   silently dropped**, which is P20 fact 2's defect and the thing W76 exists to refuse.
2. **A plain object, not an `Error` subclass.** It is never thrown, and constructing an `Error`
   captures a stack on a hot path once per nonconforming settlement. `UnmintedTask`'s shape.
3. **Reported AFTER the record is appended.** Before it, a callback that throws would stop the
   record being written, which is a behaviour change relative to the check being off — and decision
   3 says the run proceeds exactly as it would with the check off.
4. **`done` settlements only.** `failed` and `user_action` carry `result: null` by `OR-R2`'s own
   guard, and holding `null` to an output schema would refuse every failure.
5. **Settlements only, never a resolution.** `FD-R4` already holds a person's `done` value to the
   same `outputSchema` at `resolve()`; reporting it again would be one value refused twice by two
   mechanisms with different answers.

## Verification

| clause | command |
|---|---|
| L0, five typecheckers | `npm run lint`; `npm run typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — **run SEPARATELY**, because `npm run typecheck` is five lanes chained by `&&` and a chained rung reports its first failure and is silent about everything downstream (P20's declaration) |
| L1-L2 | `npm test` (node), `npm run test:deno`, `npm run test:browser` |
| `check:spec` | `npm run check:spec` — `C8` moves `spec/README.md`'s row with `spec/outcome-record.md`'s header, and `C6` requires `OR-R13` to name an owner |
| L6 UNMOVED | `npm run test:l6` — the declared result is **1639 / 55, unchanged** |
| rule 8 | `dev-dist/w80/rule8.mjs`, twice: the author pass, and again with the readers' exact edits checked in |
| both readers | conformity and adequacy, adequacy in an isolated copy, both reporting rather than fixing |

*Routing cases (template):* **not applicable, and that is the item's central claim.** Q4, Q17, Q10,
Q13 and Q6 are all routing; this item's decision-3 pair asserts that **none** of them moves — the
log, the dispatched ids and the folded outcome are equal with the check on and off.

## Exceptions — files this item edits outside its `Owns` and outside the record step

*Seeded from P21's table, MEASURED at the declaration step, and RE-MEASURED at the build — which
is where two of them moved. **Two declared and needed, one declared and needed late, one
predicted needed and NOT needed, one predicted UNNEEDED and needed.***

| path | verdict at declaration | why |
|---|---|---|
| `src/scheduler/runtime.ts` | **NEEDED** | the nineteenth `DriverOptions` member must be reachable from `createRuntime`, or W76's orphan test fails naming it. Two lines: `StartOptions`' `Pick` and the conditional spread in `start`. *Every other per-run diagnostic callback is already on that road*, so the alternative — arguing this one off it — would be a judgement about which callbacks are worth carrying, which is exactly what W76 measured was a defect rather than a judgement |
| `test/scheduler/runtime.test.ts` | **NEEDED** | the same binding from the other side: the ORPHAN pin moves 18 → 19 deliberately (W76's own comment says *move this deliberately, with the roads*), and the observer list is `StartOptions`' membership both ways, so the new member needs a behavioural observer there |
| `test/definition/l4-corpus.test.ts` | **NEEDED** | the suite census is an equality; this item adds a suite file |
| `scripts/check-markdown.mjs` | **PREDICTED NEEDED — DECLINED at margin 2, TAKEN at margin 1** | [Q142](../questions/q142.md) never FIRED: `check:markdown:selftest` was **7/7 bounded, exit 0** throughout. **The item declined to retune and then retuned, and the reason is the whole point of the row.** After the confirming gate the margins were `M3` **1** and `M4` **2**, and the call was *not to raise a ratchet that has not fired* — every retune since W28 was made on a RED gate, and the floors' own direction is *raise as the corpus grows*. Then this item's own **Record edit** — the one edit section 1 rule 5 allows after the gate — spent the last link and `M4`'s margin became **1**. *At 1 the same reasoning inverts*: a window one link wide is a trap for whoever edits next rather than a guard. Retuned from a scratch measurement, as every retune since W28: whole tree **140 / 6092 / 301**, `doc/decisions` out **106 / 5580 / 301**, both out **106 / 4449 / 296**, so `M3` **107 -> 123** and `M4` **4450 -> 5270**, each the MIDPOINT of its own window — **margins 17 / 17 and 821 / 822**, where every earlier retune picked a number near the middle by eye. `check:markdown` and its self-test both re-run green after |
| `scripts/build-browser-tests.mjs` | **PREDICTED UNNEEDED — and NEEDED, measured** | true of the suite as the author wrote it, and false after the adequacy reader's finding 8: binding the `check:workers` MODEL to that script's shipped TEXT is a read outside `spec/examples/`. **W76 and W77 both got this prediction wrong too, so it is THREE ITEMS RUNNING** — and the failure mode was W33's better one, since the read sits inside a `test()`: chromium reported ONE named test at `fixture not inlined in the browser bundle: scripts/check-workers.mjs` rather than taking all forty-five suites down |
| `src/scheduler/index.ts` | **PREDICTED UNNEEDED — and UNNEEDED, measured** | the new type leaves `src/driver/driver.ts` and the package ROOT is `export *`, so it is exported without this list. *Noted by the adequacy reader and left alone*: a `fyflow-orchestration/scheduler` consumer cannot NAME `NonconformingResult` (inference still works), and neither can they name `DriverOptions`, `RegionEvent` or `UnmintedTask` — so it is that list's precedent rather than a defect, and W77's both-ways binding is structurally blind to it either way |
| `package.json`, `deno.json` | **PREDICTED UNNEEDED — and UNNEEDED, measured** | an optional member is additive and no version moved |
| `AGENTS.md`, `examples/**`, `scripts/check-docs.mjs` | **PREDICTED UNNEEDED — and UNNEEDED, measured** | W82 teaches the knob and W82 moves L6; this item adds no `run` snippet, `check:docs` is unmoved at 33 / 27 / 6 and L6 at 1639 / 55. *(`README.md` is the record step's, not an exception.)* |

| `doc/plans/p21-*.md` | **LATE, and it had nowhere else to go** | not the Record — **Scope > In > 1**, which still carried *refusing as a TASK's failure*, the claim the plan's own commit `c869a4b` WITHDREW when the maintainer answered stop-and-ask (b). **ADR 0060 cites P21 decision 3 as its authority, and that plan's Scope said the opposite**, so leaving it would have shipped a decision contradicting its own stated source. `doc/workflow.md` v0.7 change 3's argument one document over: *a gap that blocks a fix is worse than one that hides an edit* |

`spec/README.md` is **inside** `Owns` (`spec/**`) and is not an exception. `doc/decisions/README.md`
is a **record-step** file (section 1 rule 5) and is not one either — which is how its eight missing
rows came to be backfilled here rather than needing a declaration.

## Record

**Status: DONE.** `OR-R13` ships, ADR 0060 is taken, and **L6 is UNMOVED at 1639 assertions over 55
real runs**, which is this item's declared result.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0, five typecheckers | **RAN, green** | `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples`, each RUN SEPARATELY and read by `$?` — never through the five-lane `&&` chain, because a chained rung reports its FIRST failure and is silent about everything downstream |
| L1-L2 | **RAN, green** | **45 file(s), 1290 assertions** in node 24.20.0, deno 2.9.6 and chromium, from 44 / 1269 |
| `check:spec` | **RAN, green** | **7 documents, 61 examples, 108 rules**, `C4` at 34. `C8` moved `spec/README.md`'s row with the header; `C6` holds `OR-R13` to naming an owner |
| L6 UNMOVED | **RAN, green** | **1639 assertions, 0 failed, 55 real runs** — unchanged, as declared |
| the other seven checks | **RAN, green** | `check:source`, `check:docs`, `check:workers`, `check:wiring`, `check:markdown`, `check:scheduler`, `check:policies` |
| conformity reader | **RAN** | **20 findings, 4 blocking** — and **its central obligation came back with ZERO disagreements on the VALUES** |
| adequacy reader | **RAN** | **34 mutations, 21 survivors, 12 blocking**, in an isolated worktree with `node_modules` COPIED (zero links, scanned) |
| overlap | **2** — the **FIFTIETH** measurement | inside the 0-4 band, neither reader primed |
| rule 8, author pass | **RAN** | 31 probes, 21 caught, 9 declared ceilings, **0 undeclared survivors**, 0 crashes, 0 aborts |
| `npm run gate` | **RAN, `GATE EXIT=0`, zero lines beginning `FAIL`** | 31 chain entries; `selftests` **8/8 completed, 8 ok**, 1642.7 s wall over 6 lanes. Digest **`1987893b956b304f` over 369 files**, identical before and after — the tree HELD STILL for it. `spec` 7 / 61 / **108**; `source` 23 published files, 16 gate entries; `markdown` 140 / 6092 / 301; `workers` 14 ran on a declared example, 2 not checked; `docs` 33 snippets: 27 run, 6 check — **UNMOVED**; L1-L2 **45 / 1290** in node, deno and chromium; **L6 1639 / 0 failed / 55 real runs in BOTH runtimes** |
| *(how the gate was READ)* | **the reading instrument exited 1 and the gate did not** | the command was `npm run gate > log 2>&1; echo "GATE EXIT=$?"; grep -cE '^\s*FAIL' log`. The gate printed **`GATE EXIT=0`** and the grep printed **`0`** — and **`grep -c` exits 1 when it matches nothing**, so the shell reported the whole chain as failed. *Section 4's clause from the other side: the exit code that reached me was the READER's and not the rung's*, which is why that clause says to redirect and read `$?` **in the same command** rather than to trust whatever the pipeline ends with |
| rule 8, final pass | **RAN** | **49 probes, 37 caught, 11 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration**, control green, digest `497a3066db776889` identical at both ends, with **all nineteen of the readers' exact edits checked in** |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) **ADR 0060** — what the check is, where it runs, what a finding IS | **yes** | nothing mechanical: no rung reads English, and the ceiling `z2` measures that (`OR-R13`'s central sentence inverted in prose, `check:spec` and L1 both green). What binds the BEHAVIOUR is the pair in `test/driver/result-schema.test.ts`, and `d4` breaks it at 6 failures |
| (2) `DriverOptions.onNonconformingResult` and `NonconformingResult` | **yes** | `e4` — the call site removed — costs **10** failures; `e1`/`e2` — either of the two roads out of `createRuntime` — cost 3 and 2, naming themselves; `e5` does not COMPILE, in two typecheck lanes |
| (3) `OR-R13` in `spec/outcome-record.md` v0.10, `spec/README.md`'s row with it | **yes** | `s1` (the Test-owner cell emptied) is `C6`; `s2` (the id duplicated) is `C2`; `s3` (the version row left at v0.9) is `C8` |
| (4) the CONSTRUCTED case, and what the wiring check, `check:workers` and `FD-R4` cannot reach | **yes** | `b4` (the reach row made a tautology) costs 1; `r-a8` (the `check:workers` model re-sourced) costs 1 against that script's own shipped text; and the `FD-R4` third — which had **no assertion at all** until both readers reached it — is `r-c4`, at 2 |

### What broke

1. **The check could STOP the run, on two values `OR-R11` calls INTACT.** W80's conformity reader,
   finding 1, and it is the sharpest thing this item found. `enum` and `const` are the only two of
   ADR 0053's thirteen keywords that call `canonical`, and **`canonical` is the only expression in
   the value check that walks the WHOLE VALUE** rather than the schema's shape — every other clause
   recurses through `properties` and `items`, whose depth is the schema's, and the subset has no
   `$ref` to make that unbounded. So a **cyclic** result raises `RangeError` and a **BigInt** raises
   `TypeError`, and `OR-R11`'s own table calls both of them **intact**. From a listener that throw
   reaches `onEvent`, is reported through `onRunFailure` and stops the run: ***decision 3's headline
   invariant, broken by the reporting machinery itself***, one expression along from the append order
   the item had already guarded against for the same reason. Measured on four shapes; a cyclic ARRAY
   under `items` was tested as a third road and is **not** one, which is what pins the scope to
   `canonical`'s two callers.
2. **Of decision 3's three named consequences, two were bound and *writes a record* was not.** W80's
   adequacy reader: `reportResultSchema` receives the log's record **by reference** (`snapshot()`
   clones and freezes only on read), so it could write `attempts = 99` into a record already
   appended, and the one non-comparative assertion read **four fields of eleven**. The claim was
   carried by a pair equality — exactly the claim v0.20 tells you to tautologise — and with that
   equality made a self-comparison, the rewrite survived.
3. **Three of the pair's five equalities were collapsible to self-comparisons, and no identity
   control can refuse that here**, because `snapshot()`, `.map` and `state.nodes` all build fresh
   values on every read. **The answer is not a better control: every clause is asserted against a
   LITERAL, for EACH arm**, so there is no operand left to mis-point. The pair equality stays beside
   it as the redundant half.
4. **Three declared CONTROLS were FOURTH CLAIMS, and one of them was my own IDENTITY control.**
   v0.21 is three days old and says to ask of every control *what tree makes this fail while its
   claim passes*. Asked of `ok(on.d !== off.d, 'IDENTITY: …')`: **none** — the pair-collapse it names
   is caught by the reports control, and so is the aliasing case. Deleted. The shapes control was
   **entailed by its own claim** (the claim pins three ids and that list spans both shapes by
   construction) — W78's finding verbatim, one item on. And the `failed`/`user_action` control
   asserted a property of the VALIDATOR rather than of the observed side; replaced by driving the
   same `null` through the same driver as a `done` settlement, where it does report.
5. **A shape the rule ranges over with no instance: a NESTED region.** Every reported settlement was
   at depth 1, so a driver that silently never reported inside a nested region cost **zero**. That is
   **W76's own adequacy finding reproduced in the item that cites W76's answer** — the shapes clause
   followed and short for the fifth time, by an author who had read the clause that day.
6. **`message`, `type` and `runId` were bound by nothing**, each read at exactly one case where the
   fixture's value coincided with a constant. Asymmetric with `worker`, which the author's own
   provenance probe caught — *a provenance probe finds the field whose fixture value differs from a
   plausible constant, and is blind to the one where it does not.*
7. **A claim quoted with its worst row dropped, in four places including the sentence a CONSUMER
   reads.** This item's own fact-4 re-take is **90.3% / 14.1% / 6.0%**; four documents said
   **"6-14%"**, which is the two cheap readings with the ~90% one omitted. Nobody read anything
   wrong; the compression was made once and copied. `doc/workflow.md` section 1 rule 5's writing
   clause, on the number the feature is argued from, in the direction that flatters it.
8. **A THIRD standing copy of the withdrawn *"a TASK's failure"* claim — inside P21's own Scope.**
   The plan's commit `c869a4b` replaced decision 3 and missed its own Scope forty lines below, so
   **ADR 0060 cites as its authority a document whose Scope says the opposite**. Corrected as a late
   exception. The `CLAUDE.md` and `doc/README.md` copies are the record step's.
9. **Two of my own tests found real behaviour on their first run, and both probes were measuring the
   apparatus.** A hostile-getter result written to observe *the check did not run* measured `OR-R2`'s
   CLONE instead — it reads the getter too, so the run died at `OR-R6` with nothing appended, before
   any check could have run. And a throwing callback does not escape the listener: `onEvent` catches
   it and **stops the run**, which is the one way this option changes one.
10. **A test that passed in Node and FAILED in Deno, on a one-millisecond straddle.** The pair let
    `observedAt` float, and `observedAt` is the driver's own `Date.now()` — the one field two runs at
    two instants legitimately differ in. Section 5 rule 5, caught by the second runtime rather than
    by the first, which is what the three-runtime requirement is for.
11. **Three counting errors in one sentence — in the note I wrote about a table that had stopped
    counting.** The ADR index had stopped at **0048 for four plans**, eight rows missing; the note
    backfilling them said *nine* (counting my own new row, which was not missing), *the second time*
    (against its own first clause, which says the third), and *W34's records two* (quoting that
    note's body where its heading says three). The index is now complete **both ways, 32 and 32**.
12. **Five rule-8 aborts on the final pass, every one rule 7 (b) firing on an anchor my own fixes had
    moved**, and one of them (`d4`) names a SITE that **no longer exists**, because it provoked the
    IDENTITY control finding 4 deleted — the shape P18's retro records and no clause covers.
    Re-anchored, and `d4` re-pointed at the claim that replaced it.
13. **A declared CEILING that is a CATCH on the shipped tree, moved by the READERS' own coverage.**
    `c3` re-sources `record.result` to `record.result ?? {}`; it survived the author pass because no
    settlement anywhere carried `undefined` or `null`. Adequacy finding 10 added the first and the
    new control added the second, and it now costs **16**. *v0.17's dated-ceiling clause firing
    inside the item rather than at the retro*, which is where that clause says it belongs.
14. **A PREDICTED-UNNEEDED exception was needed: `scripts/build-browser-tests.mjs`.** Binding the
    `check:workers` model to that script's shipped TEXT means a suite reads a file outside
    `spec/examples/`. **W76 and W77 both got this prediction wrong too**, so it is three items
    running. The failure mode was W33's better one — the read is inside a `test()`, so chromium
    reported ONE named test at `fixture not inlined in the browser bundle: scripts/check-workers.mjs`
    rather than taking all forty-five suites down.

### What this taught

**The plan's headline needs its scope and gets it: *the share FALLS as the workload grows* is true of
the VALUE and false of the SCHEMA.** P21 prediction 1 **REVERSES**, measured deliberately because the
plan warned this item could reverse it by accident. The mechanism is that the two costs are linear in
**different things** — the clone in the value, the check in the schema — so their ratio is unbounded
in both directions, and `enum` is where a schema's size is unbounded, because its membership test
canonicalises every entry on every check. One `enum` of a hundred allowed values is **1.65x** of the
clone on a 4 KiB result and **3.08x** on a 0.5 KiB one; two hundred levels of nested `properties` is
**1.44x** and is *not* the same shape, because that recursion is linear in the value exactly as the
clone is. **No decision moves**: the default is off, and this strengthens the reason rather than
weakening it. The remedy is a cost change and W81 owns it.

**Prediction 3, the REACH, is CONFIRMED — and it has a second leg the plan does not name.** The
plan's leg is Q302's: a bound a producer's own code does not keep past its declared domain is a
`fits` at every arc and green at every example, because the wiring check reads two SCHEMAS and
`check:workers` runs ONE value. **The second leg is that this check reads what the RECORD carries,
after `OR-R2`'s clone, and `OR-R11` says that is a different value from the one the worker returned**
— so the same schema, applied by an authoring-time tool and by this check, can **disagree**: measured
over seven shapes, three disagreeing (a non-enumerable own property, the same nested, and an own
accessor that throws). *That half is unreachable by any authoring-time tool for a structural reason
rather than an omission: none of them holds a record.* **And the control row is what makes it a
finding rather than a coincidence**: a PROTOTYPE getter is invisible to both, because the value check
reads OWN keys and never `in` — W65's conformity reader's fix closing this gap from the other side,
before anyone had looked for it.

**Prediction 2 is CONFIRMED**: no new record kind, no new terminal state, no new run outcome — a
callback and nothing else. **Prediction 4 is untouched here** and is W81's.

**The method finding is that v0.21's clause was followed and its own question had to be asked
separately.** This item added three controls under a clause three days old, and **the clause's test
— *what tree makes this control fail while its claim passes* — refused all three**, one of them by
entailment. *Adding a control is what the clause says to do; asking its question of the control you
added is what finds that it is a fourth claim*, which is v0.13's recorded correction (*an obligation
run as a step in a set passes; the same obligation asked as a question of one artefact fires*) on the
newest clause in the document. For P21's retro.

**And a second one, which is an ANSWER rather than a complaint.** Three of the pair's equalities were
collapsible and **no identity control can refuse that class here**, because every operand is freshly
built. v0.21's prescribed answer — IDENTITY — is a property of W78's subject and not of the clause.
**What worked is asserting every clause against a LITERAL, for each arm**, so the pair has no operand
to mis-point; the pair equality then becomes the redundant half rather than the load-bearing one.
Recorded as a second shape for that clause rather than as a limit of it.

### Questions raised

| Q | |
|---|---|
| **Q330** | **A value the run CARRIES can be one the value check cannot READ, and the two facts are stated in the same document.** `OR-R11` calls a cyclic result and a BigInt INTACT; `canonical` throws on both. `OR-R13` guards it and `FD-R4` does not need to, but `scripts/check-workers.mjs` runs the same expression on a worker's return value with no guard at all |
| **Q331** | **`reportResultSchema` is handed the log's record BY REFERENCE, and `Readonly<OutcomeRecord>` closes only the accidental direction.** The adequacy reader's probe used a cast. What binds it is a test over all eleven fields, per arm — which is an assertion and not a boundary |
| **Q332** | **A control this repository's newest clause asks for can be ENTAILED by its own claim, and the clause cannot see that.** Three instances in one item, three days after the clause was adopted, all found by asking the clause's own question of the artefact rather than by following it |
| **Q333** | **The pair-collapse class v0.21 answers with IDENTITY has no identity answer where every operand is freshly built.** What works is a literal per arm. Two shapes, one clause |
