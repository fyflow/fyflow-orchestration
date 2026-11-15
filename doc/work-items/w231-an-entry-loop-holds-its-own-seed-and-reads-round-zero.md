# W231 — an entry loop holds its OWN seed, reads its bound from it, and its body entry is held at round 0; the BREAKING list complete

**Status:** done 2026-11-15 — `npm run gate:item` EXIT 0 on the final tree (the Record); both readers RAN and every finding acted on; three spec clauses and one file asked and answered (a). Earlier: declared 2026-11-15 on `fc3e3ed` (branch `p47-loop`), before any file under `Owns` was edited
**Plan:** none — an item outside any plan, on W98's, W139's, W150's and W151's precedent. Its source is the review of
the pull request that carries P47 (W228-W230), run 2026-11-15 by a reader who did not write the code, and the
maintainer's answer the same day: *new work on the same branch*, the recursion finding as a SEPARATE item after this one.

*This file carries NO relative link: ids and paths are bare text.*

**Question:** *does a loop the PAYLOAD reaches — an entry loop, or one reached from the entry through gates — behave as
JP-R15, FD-R4 and FD-R7 say it does: its body entry held at round 0, the seed its own copy, the bound read from that copy?*

## The findings this item acts on

Five of the review's ten. Findings 1, 2 and 4 were REPRODUCED by the reviewer on the branch under node 24; none is
re-measured here until this item's own failing test shows it (workflow section 5: red first).

| | finding | where | the rule it breaks |
|---|---|---|---|
| F1 | `start()` throws a plain `Error` for a VALID entry loop whose body-entry task reads `"$iteration"` and whose worker declares an `inputSchema`: the boundary walk composes the entry's `needs` with no round index | src/driver/driver.ts, `start()`'s FD-R4 walk | FD-R4's entry-loop paragraph (spec/flow-definition.md): the body entry is held *for ROUND 0*, and round 0's `"$iteration"` is 0 (JP-R13, JP-R15) |
| F2 | the loop arm keeps the value it RECEIVED as the run's state, uncloned; for a loop the payload reaches with no `needs`, that is the CALLER's object, handed on as `last` when round 0 breaks | src/driver/driver.ts, `enter`'s `loop` arm | JP-R15: *each as its own copy … the loop keeps the value it hands on*; RN-R15: a resume reads the header's copy, so the live run and its resume hand on different values |
| F4 | `loopBound` reads `maxIterationsFrom` on the value as received — the caller's original for such a loop — where the checkpoint header holds a clone, so a payload `readKeyPath` refuses (a class instance) throws FD-R7 live and resolves on a resume | src/driver/driver.ts, `loopBound` | FD-R7 *read ONCE … by FD-V40's key-path reading*; `decideGate` clones before reading for this reason (W93 finding 1) |
| F5 | AGENTS.md flags `FlowNode` alone as BREAKING. Also changed for a consumer: `RegionSets.opensWith` gains `'loop'`, `WiringShape` / `WIRING_SHAPES` gain `'round'` and `'carry'`, `referenceTarget`'s return gains `form: 'iteration'`, and `regionsForPolicies()` omits loop regions | AGENTS.md | the reference's own practice: every earlier widening is called out where it is documented |
| F6 | `FlowNode`'s TSDoc still reads *Seven kinds since v0.42* over a union of eight | src/definition/types.ts | — |

```
Spec:       none predicted to change. F1, F2 and F4 are the driver not doing what spec/flow-definition.md's FD-R4
            entry-loop paragraph and FD-R7, and spec/join-policy.md's JP-R13 and JP-R15, already say. If a reader
            finds round 0's `"$iteration"` at start() UNSTATED rather than implied, the sentence is a spec edit of
            its own, with a version bump, and a STOP-AND-ASK before it.
Owns:       src/driver/driver.ts (start()'s FD-R4 walk; enter's `loop` arm; loopBound — nothing else in it);
            src/definition/types.ts (FlowNode's TSDoc only);
            test/driver/loop.test.ts and test/driver/checkpoint-loop.test.ts (the new cases);
            test/definition/l4-corpus.test.ts (the two suites' case counts, as every item adding a case moves);
            AGENTS.md (the BREAKING notes; section 22 where a fix changes what it says);
            the reply file in ../fyflow-app/.scratch/mu-upstream-adoption/requests/ (its Version line and
            checklist follow F5; its header's "NOT COMMITTED" follows the tree; still NOT sent);
            this file.
            Exceptions: the record step's files and nothing else predicted. Anything else is a STOP-AND-ASK.
Inputs:     the review's findings 1, 2, 4, 5 and 6 (above); the spec rules each names; the map arm's treatment of a
            value that may be the caller's (`itemMaps`); `decideGate`'s clone before `readKeyPath`.
Outputs:    (1) F1: a valid entry loop whose body entry reads `"$iteration"` STARTS under the default
                `validateBoundaries`, the entry held to its worker's `inputSchema` with `"$iteration"` composed as 0;
                a payload that fails that schema is still refused `BoundaryRefused` at start().
            (2) F2: the loop's kept state is its OWN copy: a caller mutating the payload after start() changes
                nothing the loop hands on, and a break in round 0 hands a `last` equal to the header's entry payload
                and identical to no object the caller holds.
            (3) F4: the bound is read from that same copy: a payload whose `maxIterationsFrom` key sits on a class
                instance starts, and runs the bound the header's clone resolves.
            (4) F5, F6: AGENTS.md names every consumer-visible change of the loop where it documents the thing
                changed; FlowNode's TSDoc says eight and names `loop`; the reply says the same.
Depends on: W230 (done)
Blocks:     W232 (the recursion finding — declared after this item is done)
Tests:      L2, in the two owned suites, each case written and seen RED before its fix:
            T1 entry loop + `"$iteration"` + `inputSchema`, default boundaries: start() returns; the round-0
               dispatch's input carries round 0. T1b the same flow with a schema round 0 CANNOT satisfy: refused
               BoundaryRefused at start(), nothing dispatched — so T1 cannot pass by the check being skipped.
            T2 entry loop with a break `end`: mutate the payload after start(), break round 0; the successor's
               `last` deep-equals the ORIGINAL payload, is not the caller's object, and equals the checkpoint
               header's entryPayload; a resume from that checkpoint hands on the same `last`.
            T3 `maxIterationsFrom` naming a field of a class instance in the payload, `maxIterations` above it: the
               run exhausts at the field's value (`iterations`, `exhausted: true`).
            Expected values from JP-R13, JP-R15, FD-R4, FD-R7 and RN-R15 — never from a run. No case depends on
            fan-out completion order.
Gate:       each test RED on `fc3e3ed`'s src; `npm run gate` before the readers; conformity and adequacy readers on
            isolated copies; rule 8 on what they find; `npm run gate:item` on the final tree (workflow v0.29: this
            item is no plan's last and edits no check-register*, state.mjs or doc/questions/README.md).
Reserves:   Q811-Q815; no ADR predicted (each fix applies a rule already written)
```

## Exceptions — files outside `Owns`

*Asked of the maintainer 2026-11-15 after both readers reported and before any of these edits (workflow section 1
rule 6); both answered (a).*

| file | why | asked |
|---|---|---|
| spec/flow-definition.md (v0.58 -> v0.59) | the conformity reader's findings 1 and 3: round 0's `"$iteration"` at start() was implied and not stated (FD-R4's row and its entry-loop paragraph), and the bound read on the loop's own copy was stated nowhere (FD-R7's row, section 2's `maxIterationsFrom` row). Changed FIRST, as its own edit | **yes — the `Spec:` line's stop-and-ask; (a) add all three** |
| spec/join-policy.md (v0.26 -> v0.27) | finding 2: JP-R15 said a ROUND's entry receives its own copy, not that what the loop KEEPS is one | **yes — (a)** |
| spec/run-state.md (v0.37 -> v0.38) | finding 2: RN-R15's *the copy is the header's alone* is false for a loop the payload reaches | **yes — (a)** |
| spec/README.md | the three version cells (`check-spec` C8) | **yes — follows from (a)** |
| src/definition/definition-schema.ts | finding 5: the published schema's `kind` description reads *the seven node kinds* over an enum of eight — F6's defect in a consumer-visible string | **yes — (a) as an exception** |

## Scope

**In**

1. Everything on the `Outputs:` line.

**Out** — named rather than left implicit, with where it goes instead

- Review finding 3 (each round opened from inside the previous round's settlement, so a scheduler that settles inside
  `addTask` overflows the stack near 360 rounds and the overflow is swallowed): **W232**, the maintainer's answer
  2026-11-15 — its own item, with its own readers, because it touches the order the driver appends.
- Review findings 7-10 (`loseLoop` / `fireLoop` duplicating `settleJoin`'s arms; `run.ended` as a side channel; a
  per-round clone of a state nothing reads when the loop cannot break; `conditionProblem` keyed on a display string,
  and `loopValueOf`'s unused parameter): no wrong behaviour today — one register question from this item's block,
  deferred, written at the record step.
- The version bump to 0.15.0, the release, sending the reply: the maintainer's.

## Verification

`npm test` for the owned suites while writing; `npm run gate`; the two readers; `npm run gate:item`.

Routing cases this item covers: a branch routed away from its join — T2's break in round 0; `user_action` — not
applicable; no matching decision edge — not applicable; a duplicate task id — not applicable (no id is minted
differently); a nested fan-out — not applicable (a body entry is a task or an ask, FD-V50, so the payload reaches at
most one loop).

## Record

**Author's record, 2026-11-15, on `fc3e3ed`.**

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| each test RED on `fc3e3ed`'s src | **RAN** — 3 of 3 red, each for the review's stated reason | T1: `start()` threw `iterationOf`'s plain `Error`; T2: `last` carried the caller's later write; T3: `UnresolvedLoopBound`, *holds absent there* |
| `npm run gate` before the readers | **RAN** — run 1 **RED**, run 2 **EXIT 0** | run 1: deno L6 2935 assertions, **5 failed**, all in `uncloneable / OR-R6, threaded` (a flow with no loop; node L6 green in the same gate); three reruns of `npm run test:l6:deno` green; run 2 green on the same tree — 110 files, 2387 in node, deno and chromium, L6 2935 / 0 failed in both runtimes. Not explained, not fixed: Q812 |
| conformity reader | **RAN**, on an isolated copy — 1 BLOCKING, 4 SHOULD, 3 NIT; no fix behaving wrongly | BLOCKING: the bound read on the loop's copy (F4) is a rule the spec did not state — `FD-R7` reads *the value this node receives*; SHOULD: the kept copy (F2) is a reading of `JP-R15`, not its text, and `RN-R15`'s *the copy is the header's alone* became false; round 0's `"$iteration"` at `start()` implied, not stated; `AGENTS.md` silent on what F1 and F2 changed; *seven node kinds* in the published schema. **Asked; (a), (a)** — the spec gained the three clauses FIRST, as its own edit |
| adequacy reader | **RAN**, on an isolated copy — 27 mutants, **9 survived**: 4 REAL gaps, 5 equivalent; no defect in six probed roads | real: M27 and M19 (every fix held only where the loop IS the entry — the road through an entry gate, which the code comment names, untested), M06 (the `FD-R4` lookup run only in one-loop flows), M21 (no value JSON cannot carry); M18 killed only by T3. Vacuous: T2's header and resume assertions (controls, green before the fix), `failures` equal `[]` after a `start()` that rethrows. Copy restored byte-identical |
| overlap | **1** shared subject | T2's header and resume assertions: conformity's NIT 8 (cannot fail independently) and adequacy's finding 9 (controls) |
| rule 8, author's | **RAN** — 9 of 9 RED, a no-op control GREEN | each alone in `src/driver/driver.ts`, restored byte-identical (sha256 `584f0504…` before and after): F1 reverted; M27; M06; index 1; F2/F4 reverted; M19; M18 (now by T2 as well); M21; the bound read before the copy |
| `npm run gate:item` on the final tree | **RAN — EXIT 0**, the tree unchanged at its end | the ladder: 110 files, 2387 in node, deno and chromium; L6 2935 / 0 failed in both runtimes; self-tests 10 of 10 ok, `check:register:selftest` left out as `gate:item` does. Only this row and the Status line were written after it |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) F1: a loop's body entry held at round 0 | `start()`'s walk gives a target inside a loop that loop's index 0 | `test/driver/loop.test.ts`'s *W231 FD-R4* case, on both roads and with a second loop declared first |
| (2) F2: the seed is the loop's own copy | `enter`'s `loop` arm clones what it received, once, before anything reads it | the *W231 JP-R15* case: the top-level and nested writes, the identity checks, a Date and a Set |
| (3) F4: the bound read from that copy | `loopBound` is called with the copy | the *W231 FD-R7* case, on both roads |
| (4) F5, F6: the BREAKING list complete | `AGENTS.md`'s five places, its two per-section notes, the *check, then start* recipe and section 22's row; `FlowNode`'s TSDoc; the schema's `kind` description; the reply | `check:docs` types every snippet; the prose has no check — the conformity reader verified the five claims against the exported surface |

**What the declaration got wrong.** `Owns` and `Tests` name `test/driver/checkpoint-loop.test.ts`, which is untouched
(T2's resume half sits in the loop suite); `Owns` names `loopBound`, which is unchanged (the fix is at its call site);
the F2 row quotes `JP-R15` with the words elided that made the rule about a round's ENTRY; the F4 row cites `FD-R7`
for a clone that rule did not mention. `Spec: none predicted` was wrong three times over — the three clauses are in
the Exceptions table.

**What broke.** Nothing in behaviour beyond the three defects. One L6 run failed once and did not reproduce (Q812).

**What this taught.** *The review found three defects on one road no test walked* — a loop the payload reaches — and
W229's and W230's adequacy readers ran 58 and 27 mutants and none on it, because every loop case put a task before
the loop or turned `FD-R4` off. A reader mutates the code the tests reach; a road the tests do not reach has no
mutant. **No change proposed**: one occurrence.

**Questions raised.** Closed: none. Raised: **Q811** (the review's findings 7-10, deferred) and **Q812** (the L6 run
that failed once, open). Q813-Q815 unused. The next free work item is W232, which the maintainer has named for the
review's finding 3.
