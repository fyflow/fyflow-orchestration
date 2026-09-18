# W71 — The reference stops teaching a FAKE scheduler for a use case

**Status:** DONE — built and gated 2026-09-17; **both reader passes RUN 2026-09-18** (8 / 5 blocking and 33 mutations / 15 survivors in 11 findings / 6 blocking, overlap 2, the forty-third measurement), their findings acted on, and **rule 8 re-run with twelve of their exact edits as probes** — 0 undeclared survivors, 0 against declaration, three ceilings declared with measurements. Declared 2026-09-17 on `6ccbcac`, on the tree W69's and W70's reader passes ship.
**Plan:** none — the third consumer-facing gap in the reference, raised by the maintainer on
2026-09-17 while correcting `README.md`'s *the library imports the scheduler nowhere*:
*"examples using a fake scheduler shouldn't really use the fake scheduler — for tests is fine, but
an example as a USE CASE should not."* [W36](w36-the-scheduler-pin-moves-to-0-5-1.md)'s,
[W37](w37-the-scheduler-pin-moves-to-0-5-2.md)'s, [W69](w69-a-getting-started-example-a-consumer-can-copy.md)'s
and [W70](w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md)'s precedent: an item outside
a plan takes the next id. **P19 therefore starts at W72, Q300 and ADR 0056** — the THIRD consecutive
day that sentence has been falsified by the item that expires it, and the third time it is corrected
by the grep section 1 rule 5 prescribes.

```
Spec:       none — no rule. What these snippets assert is already asserted of every
            executed snippet (check-docs X3/X4) and of every README fence (X8).
Owns:       AGENTS.md §5's "What a join carries downstream", §7, §9's first
            snippet and §10's two; examples/getting-started/** (with W69 and W70)
Inputs:     the maintainer's answer of 2026-09-17 (the five USE-CASE snippets, not
            §12's build-it-yourself block and not §1's non-executing one); W69's
            measured fact that examples/getting-started/ is outside every L6 walk;
            P18 decision 7 (what stays code: a worker); the six facts below
Outputs:    (1) examples/getting-started/flaky.ts — a worker that FAILS, so the
                human-in-the-loop road can be shown on the thing a consumer has
            (2) §7's human-in-the-loop snippet on a REAL runtime: a non-optional
                task parks, the FOLD reports it, a person resolves it, the run
                completes — replacing a hand-built stub that delivered its own
                `task.user_action` event and so could not show the fold's own word
            (3) §5's "what a join carries downstream" on a real fan-out and join
            (4) §9's refusals snippet: thrown vs reported, on a real runtime
            (5) §10's two common-mistakes snippets on real runtimes
            (6) each converted snippet keeps its LESSON — the Driver-level rules
                (`MultipleRuns`, the resolve signature) are shown on a driver the
                runtime handed back, not on one built around a stub
Depends on: nothing — W69 and W70 are done and pushed
Blocks:     nothing
Tests:      expected values from the documents and from spec/run-state.md's
            vocabulary, never from output — and fact 3 below is why that matters
            here: the author's own first spike polled for the WRONG WORD and hung
Gate:       L0; check:docs (X3/X4 over five rewritten `run` snippets, X8 unmoved —
            none of the five is in README.md); check:docs:selftest; check:markdown;
            L6 UNMOVED at 1610 / 53 (predicted: flaky.ts is outside every L6 walk,
            W69's measured fact); rule 8 over each converted snippet's assertions,
            the fake-scheduler count both ways, and the wiring; then the two reader
            passes and rule 8's re-run
Reserves:   Q297-Q299
```

## Exceptions

| path | why |
|---|---|
| `examples/README.md` | **LATE, and undeclared until the conformity reader found it.** That page named two workers and three sections; this item added three modules and named itself nowhere, in a file it neither owns nor took an exception for. Corrected to seven workers and six sections |
| `src/` (rule 8 only) | three probes mutate `src/driver/driver.ts`, `src/fold/run-state.ts` and `src/scheduler/runtime.ts` to measure what the snippets observe. No `src/` file is edited in the product |

## Scope

**In**: the five snippets the maintainer named, each converted to `createRuntime` on a real
`FyflowScheduler`, each keeping the lesson it teaches.

**Out**: §12's *The driver with no scheduler at all — the shape ladder L2 uses*, which is the
build-it-yourself road and the only documentation of the seam a caller passes its own scheduler
through — converting it would delete the thing it exists to show; §1's non-executing `check`
snippet; `test/**`, where a fake is the point (the maintainer said so in the same sentence).

## The declaration step

| fact | measured |
|---|---|
| the shape of the problem | of **32** reference snippets, **18** touch no scheduler at all (validation, the fold, ids, construction refusals), **7** run on a real one, and **7** build a hand-made stub — of which **5** are use cases, one is §12's build-it-yourself block and one is §1's `check` snippet |
| what a stub costs per snippet | each of the five carries **6-7 scheduler-shaped lines** — a `listeners` map, an `addTask() {}`, an `addEventListener` that records, and a loop that DELIVERS the events the snippet wants — so the consumer is shown the library's seam being faked rather than the library being used |
| **the parked-task vocabulary is `suspended` and `awaiting_action`, not `user_action`** | measured on a real runtime: the node's state in the fold is **`suspended`** and the run's outcome is **`awaiting_action`**. **The author's own first spike polled for `n.state === 'user_action'` and hung forever** — which is exactly the mistake a consumer copying §7 would make, because that snippet delivers its own `task.user_action` EVENT and never shows what the FOLD calls it. This is the item's central justification: the fake teaches the scheduler's word for a thing the consumer reads through the fold |
| **the resolve signature is three arguments** | `driver.resolve(taskId, 'done', { actor, result })`. The two-argument form a reader would guess throws a `TypeError` INSIDE the driver — *cannot read properties of undefined (reading 'actor')* — rather than a named refusal. §7's prose has the form right; no executed snippet takes the road on a real run |
| the road is cheap | the whole human-in-the-loop run — park, resolve, complete — is **32 ms** on a real inline pool, so the five conversions add no meaningful time to `check:docs` (6.5 s for 26 runs today) |
| L6 is unaffected | `examples/l6.ts` lists `examples/workers/` on disk and compares that listing to the L6 registry both ways, so a module in `examples/getting-started/` is outside that clause by construction — W69's measured fact, and `flaky.ts` inherits it |

## Verification

As W69's and W70's: `npm run check:docs`, its self-test, `check:markdown`, L6 in both runtimes,
a rule 8 set over the converted snippets, then the two reader passes and rule 8's re-run.

## Record

**Built and gated 2026-09-17 on `6ccbcac`.** Every rung RUN and redirected to `dev-dist/w71/`, read
by `$?`; the Node-24 environment asserted. Expected values from the documents and from
`spec/run-state.md`'s vocabulary — and the item's own declaration step is where that mattered, since
the author's first spike polled for a word the fold does not use and hung.

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured, and **two of the six facts are the item's justification** | the parked-task vocabulary is `suspended` / `awaiting_action` and NOT `user_action`, and `resolve` takes THREE arguments. Both were invisible in the snippet being replaced, because it delivered the scheduler's own `task.user_action` EVENT to a stub it had built, and a stub cannot show you what the fold calls the thing |
| the number this item exists to move | **fake-scheduler snippets 7 -> 2, real-scheduler snippets 7 -> 12**, measured both before and after by the same walk over `AGENTS.md`'s fences | the two that remain are the two the maintainer put OUT: §1's non-executing `check` snippet, and §12's *The driver with no scheduler at all*, which is the only documentation of the seam a caller passes its own scheduler through — converting that one would delete the thing it exists to show |
| L0 | **GREEN** | `lint` 0, `typecheck` 0 over the new worker modules under `strict` — **three** at `dade11a` and **five** after the readers (`inspect.ts` and `uncloneable.ts` close two of their blocking findings), in a directory that now holds **seven**. *(This row said *four new*, and the Outputs line said four while listing five; the commit message had it right and the item file did not — conformity reader)* |
| check:docs | **GREEN** | **32 snippets, 26 run** — unmoved, because five snippets were REWRITTEN rather than added. Every one of the five now builds its runtime with `createRuntime` and runs on a real `FyflowScheduler` |
| **§7, the human in the loop** | converted | a non-optional task whose worker throws parks; the FOLD reports `awaiting_action` with the node `suspended`; the ONE outcome record is read off a REAL `task.failed` + `task.user_action` pair rather than a hand-delivered one, which is strictly better evidence for the claim the section makes; a person resolves it with `resolve(taskId, **'failed'**, { actor })`; the run completes at the `quarantine` end. **32 ms**. *(This row said `'done'` until the conformity reader read it against the snippet. The value is load-bearing rather than incidental: `'failed'` is what takes the `on: ['failed']` edge, which is the whole lesson of the snippet and of the sentence beneath it.)* |
| **§5, what a join carries downstream** | converted | the lesson is that the collection is keyed by BRANCH and not by arrival, so the arrival order is ARRANGED by a worker whose delay is a setting — W6's method — and then **READ out of the run rather than assumed**, which is W17's. `doc/workflow.md` section 5 rule 5 forbids asserting a completion order; here the order is an INPUT to the claim and the claim is that the record did not follow it |
| **§9, refusals** | converted, **and it found a refusal the recommended road cannot reach** | the section promises a THROWN refusal and a REPORTED one, and the old snippet showed only the thrown half. Now: a registry defect thrown by `createRuntime` on your stack, and `UnresolvedMapArity` reported through `onRunFailure` from inside a listener. **`MissingJoinPolicy`, which the old snippet demonstrated, is NOT reachable through `createRuntime`** — the runtime always supplies a policy — so it is named in the snippet as belonging to §12's road |
| **§10, the frozen handles** | converted, **and it raises [Q297](../open-questions.md)** | `onRegionEvent` is a `Driver` option `StartOptions` does not forward, so a consumer on this road cannot subscribe to region events at all. **The old snippet could assert it only because it built the `Driver` itself** — which is precisely what a fake hides: a reference constructing its own driver can demonstrate options its readers have no way to pass. The snippet asserts the three handles the road HAS and says why |
| **§10, a class instance** | converted | `OR-R11` on a real worker that returns `new Score(0.9)`: the fields cross, the behaviour does not, `instanceof` is false and NOTHING is reported. Better evidence than before, because the loss is the real clone's rather than one the snippet performed on itself |
| census | **232 / 178 / 2 / 52** | Q297 raised and placed; Q298-Q299 reserved and unused, so **P19 starts at W72, Q300 and ADR 0056** |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL at any indent, `selftests` 7/7 completed and 7 ok in 816.8 s over 5 lanes** (`dev-dist/w71/gate.log`): `check:docs` **32 / 26** with all five converted snippets EXECUTING on a real `FyflowScheduler`, `check:docs:selftest` **33 probes / 20 gradings**, `check:markdown` **127 / 5467 / 272**, L1-L5 **41 / 1112** in node, deno and chromium, L6 **1610 / 53 UNMOVED in both runtimes** exactly as predicted | digest `286ced85ef97b37e` over 335 files, no edit made while it ran; this row is the ONE edit after it. **And the gate was read wrong once before it was read right**: the author's own command chained `grep -c` for failure lines after it, `grep` exits 1 when it matches NOTHING, and the harness reported the whole run as failed while `GATE EXIT=0` sat in its output — section 4's clause from the other end, where the misleading exit code was the SECOND command's and the good news was what produced it |
| rule 8, RE-RUN with the readers' edits | **12 probes: 1 control green, 8 caught, 3 declared ceilings, 0 UNDECLARED survivors, 0 crashes, 0 against declaration, 5 aborts every one re-anchored and re-run** (`dev-dist/w71/rule8-run1.log`, `rule8-run2.log`); digest `b1811613f8ddd091` over 337 files identical at both ends of both passes | **Every blocking finding the adequacy reader made now FIRES.** The class worker returning a plain object is caught, because the worker asserts its own return value — the IN side of that pair has exactly one place it can be observed from. Deleting the failure-list writer is caught, because the snippet now runs a second flow that DOES report. Flipping the resolution is caught by `pathEnds`. Re-sourcing a handle is caught by a membership where a count stood. An empty frozen array is caught. And both crash-shaped legs are now the snippet's own assertions: renaming the parked state fails on the deadline instead of a 30-second timeout, and a swallowed refusal fails on the sentinel instead of an unsettled top-level await. **Five aborts, all rule 7 (b), and all one cause**: the first pass anchored on the READERS' PROSE rather than on the source, so four anchors did not exist and one — the `quarantine` end node — was AMBIGUOUS, section 4 declaring the same flow shape. Re-anchored on text read from the files |
| `npm run gate`, CONFIRMING (after the readers) | **GATE EXIT=0, zero lines beginning FAIL at any indent** (`dev-dist/w71/gate-final.log`): `check:docs` **32 / 26** with all five converted snippets executing on a real `FyflowScheduler`, `check:docs:selftest` **33 probes**, `check:markdown` **127 / 5478 / 272**, L1-L5 **41 / 1112** in node, deno and chromium, L6 **1610 / 53 UNMOVED in both runtimes** | digest **`25b0377089c2232b` over 337 files** at the gate's end, with no edit made while it ran; this row is the ONE edit after it. *(The first draft of this row carried `b1811613f8ddd091`, which is the RULE-8 pass's digest, taken before the record-step edits that followed it — a number copied from the wrong measurement, caught by taking it again rather than by reading it back.)* |
| readers | **BOTH RAN 2026-09-18 — 8 / 5 blocking and 33 mutations / 15 survivors in 11 findings / 6 blocking, OVERLAP 2, the FORTY-THIRD measurement** | **The conformity reader's central obligation came back EMPTY for the third consecutive pass**: all five converted snippets re-derived on paper from `spec/` before a single assertion was read, zero disagreements, with every mechanical premise verified against source rather than against this file's prose — and all three headline counts re-taken by a fence classifier it wrote itself. **Everything it found is prose**, and four of its five blocking findings are ONE shape, with the evidence to prove it: stripping the fences and diffing shows `AGENTS.md`'s prose is **byte-identical** before and after this item. *The item replaced five snippets wholesale and revised not one sentence that described them.* The adequacy reader confirmed the two central mechanisms ARE falsifiable — §5's keying breaks four ways and its arranged order is bound in BOTH directions, which is the strongest pair in the five — and then found six claims that were not. **The two overlaps**: the `StartOptions` sentence, which the conformity reader measured FALSE (eight options, not seven — `runId` is declared in the interface body and the reference tells a reader to pass it) and the adequacy reader measured UNBOUND (adding the missing callback to the real list keeps the whole gate green); and `resolvedAs`, which the conformity reader found misdescribed in this Record and the adequacy reader found unobserved by the snippet |

**Outputs.** (1) worker modules under `examples/getting-started/` — `flaky.ts` (throws, so a task
parks), `scorer.ts` (a score after a stated delay, so an order can be arranged), `classy.ts` (returns
a class instance) and W69's `worker.ts` / W70's `tag.ts` reused. (2)-(5) the five snippets.
(6) each kept its lesson: the Driver-level rules are shown on a driver the RUNTIME handed back.

**What broke.** (1) The author's first spike **hung forever**, polling for `n.state === 'user_action'`
where the fold says `suspended` — the exact mistake the old snippet invited, made by the person
replacing it. (2) The second spike threw a `TypeError` from inside the driver, because `resolve`
takes three arguments and the two-argument form reads `undefined.actor`. (3) A comment predicted the
node's state would be `resolved`; it is `failed`, and the comment was corrected to the measured
value. (4) A `filter`-then-`map` did not narrow the fold-input union and `X3` said so.

**What this taught.** **A fake scheduler does not merely fail to prove a claim — it lets the reference
demonstrate an API its readers do not have.** Two of the five conversions found that directly:
`onRegionEvent`, asserted in a snippet that could pass it only because it built the driver itself,
and `MissingJoinPolicy`, a refusal the recommended road cannot raise. Neither is visible while the
snippet builds its own `Driver`, and neither is a defect in the snippet: they are facts about the
library that the fake was standing in front of.

## What the readers changed, and the three ceilings that remain

**Both readers' central verdicts were about the same failure**: the item rewrote five snippets and
revised no sentence around them. `AGENTS.md`'s prose is byte-identical across the commit, which the
conformity reader demonstrated by stripping the fences and diffing — so four of its five blocking
findings were sentences describing code that had changed underneath them. All are corrected, and
section 5's preamble now carries both of its corrections: it has been wrong twice in two days, in
OPPOSITE directions, each time because an item edited inside the fences and left the prose alone.

**Six of the adequacy reader's findings were claims nothing could falsify, and five are closed in
the product**: the class worker now asserts its own return value, so the thing being lost is known to
have existed; a second flow that DOES report gives *and nothing is reported* a case that fills it; a
successor node instantiates the sentence about what the next node receives, which had no next node;
`pathEnds` makes the resolution value observable; and the frozen handles are a MEMBERSHIP rather than
a count, each asserted non-empty because `Object.isFrozen([])` is true for free.

**THREE CEILINGS, declared with their measurements rather than closed.**

| ceiling | why it stands |
|---|---|
| `StartOptions`' membership (`f3`) | the snippet asserts the FORWARDING behaviourally — `onRegionEvent` passed through a cast and never called — so a runtime that started forwarding it is caught (`f3b`). What is NOT bound is the type's `Pick` list: adding the name there without forwarding it keeps the whole gate green. That is obligation (e)'s third shape, a LIST claiming about another list, and closing it is a check clause of the kind `X6`, `X7` and `X8` each are. **The enumeration is deleted from the prose rather than left to go stale** — the conformity reader measured the one I wrote FALSE within hours, since `StartOptions` also declares `runId` |
| an end node's `outcome` LABEL (`f4b`) | renaming it costs zero, and that is **by design**: the label is an author's and the driver does not interpret it — W69's own finding, one snippet over. The ROAD is observed (`pathEnds`), the label is not, and nothing anywhere should read it |
| one of the driver's two clones (`f6`) | two independent clones stand between a worker's return value and what the log holds, and **either alone is sufficient**, so no snippet reading the log can see one removed. L1 is the rung that does — the adequacy reader measured 7 failures there for one and 10 for the other. The successor node narrows this rather than closing it: it observes the value on the far side of BOTH |

**Questions raised.** [Q297](../open-questions.md).
