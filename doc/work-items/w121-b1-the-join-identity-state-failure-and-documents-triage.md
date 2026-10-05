# W121 — B1, the pilot: a verdict for each open question in the join, identity/state/failure and documents clusters

**Status:** done — the 38 approved verdicts applied on 2026-10-06, `shared` filled on Q17, Q19 and Q20, Q513 raised, and every gate clause EXIT 0; see the Record
**Plan:** [P29](../plans/p29-which-open-questions-still-matter.md)

```
Spec:       none — P29 decisions 1-5 and 7, and doc/questions/README.md's format
Owns:       the 38 question files listed below; doc/questions/q17.md, q19.md, q20.md (the
            `shared` field only); this item's own question files, q513.md-q516.md; and the
            `resolves` field of every ADR an approved resolution names (doc/decisions/**,
            a record-step file, named because it is the joint that makes the batches serial)
Inputs:     the register and the tree at `988ef5f`, P29's baseline; `npm run q` and
            `npm run refs` run against that commit
Outputs:    (1) the worksheet: one row per question, its verdict, its evidence and its new
                field values
            (2) the reader's findings, one per row
            (3) the maintainer's approval, with every struck or changed row
            (4) the approved rows applied: `status`, `closes-when`, `resolved-by` and `note` (the
                P29 stamp, decision 2), and the ADR `resolves` that R8 requires
            (5) `shared` filled on Q17, Q19 and Q20 (decision 7)
            (6) Q513: the divergence between our resolved Q19 and fyflow-react-components' open Q14
            (7) the calibration, recorded in this item's Record for the coordinator to hand to
                W122's declaration
Depends on: nothing
Blocks:     W122
Tests:      none under test/ — P29 prediction 1. The reader re-derives each row from the question
            and the tree, and the gate's count is compared with the approved row count
Gate:       reader report; maintainer approval; `git diff --name-status -- doc/questions/` M/A
            only; check:register, check:markdown, check:markdown:selftest EXIT 0; the stamp count
            equals the approved row count
Reserves:   Q513-Q516 (the coordinator's allocation from P29's Q513-Q532 block). No ADR, and no W
            beyond W121
```

**Q513 is earmarked** for the divergence P29 decision 7 names: our [Q19](../questions/q19.md) is
resolved and `fyflow-react-components` Q14, the same question, is still open there. Q514-Q516 are
spare; an unused id is skipped, never reissued.

**Exceptions** — every file edited outside `Owns` and outside section 1 rule 5's record step, named
before the first edit (`doc/workflow.md` section 7 rule 2): **none.** W121 never edits W122's file.

## The item's ids, from the lookup at `988ef5f`

**38 questions**: the 13 open in *The join*, the 23 open in *Identity, state, failure*, Q508 from
*Documents and indexes*, and Q92, deferred in *The join* (P29 stop-and-ask (k)). *Documents and
indexes* holds two open questions; the other, [Q494](../questions/q494.md), is W127's, resolved by
ADR 0082 (P29 decision 6). Q499 is the other deferred question and is Out (stop-and-ask (e)).

Run in a `git archive` of `988ef5f`, extracted with no links and with no `node_modules`:
`scripts/lookup.mjs` imports only `node:fs`, `node:path` and `node:url`, so the copy needs none.

```bash
eval "$(fnm env --shell bash)" && fnm use 24          # v24.20.0
S=dev-dist/w121d-33160
mkdir -p $S/base && git archive 988ef5f | tar -x -C $S/base; echo ARCHIVE_EXIT=$?      # 0
cd $S/base
node scripts/lookup.mjs q --where status=open --count                                   # 307, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=The join" --fields id                   # 13, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Identity, state, failure" --fields id   # 23, EXIT 0
node scripts/lookup.mjs q --where status=open --where "cluster=Documents and indexes" --fields id      # Q494 Q508, EXIT 0
node scripts/lookup.mjs q --where status=deferred --fields id,cluster                   # Q92 The join; Q499 Documents and indexes, EXIT 0
cd .. && find . -type l | wc -l                                                          # 0, then the copy was removed
```

| cluster | ids | n |
|---|---|---|
| The join, open | Q5, Q7, Q23, Q27, Q81, Q82, Q96, Q97, Q161, Q163, Q354, Q357, Q358 | 13 |
| The join, deferred | Q92 | 1 |
| Identity, state, failure | Q16, Q18, Q26, Q28, Q29, Q30, Q37, Q38, Q39, Q61, Q62, Q63, Q103, Q241, Q249, Q307, Q330, Q331, Q365, Q371, Q372, Q374, Q386 | 23 |
| Documents and indexes | Q508 | 1 |
| **all** | | **38** |

**The 38 owned files**, under `doc/questions/`: `q5.md`, `q7.md`, `q16.md`, `q18.md`, `q23.md`,
`q26.md`, `q27.md`, `q28.md`, `q29.md`, `q30.md`, `q37.md`, `q38.md`, `q39.md`, `q61.md`, `q62.md`,
`q63.md`, `q81.md`, `q82.md`, `q92.md`, `q96.md`, `q97.md`, `q103.md`, `q161.md`, `q163.md`,
`q241.md`, `q249.md`, `q307.md`, `q330.md`, `q331.md`, `q354.md`, `q357.md`, `q358.md`, `q365.md`,
`q371.md`, `q372.md`, `q374.md`, `q386.md`, `q508.md`.

At `988ef5f`, Q17 and Q19 are `resolved` and Q20 is `open`, and all three have `shared: ""`.

## Scope

**In**

1. One verdict per question above, from P29 decision 1's six: keep, defer, icebox, resolve,
   duplicate, obsolete — each with the fields that verdict requires.
2. The stamp, `P29 W121: <verdict>`, appended to `note` after `; ` and never replacing it; a keep
   whose other fields do not change is still stamped (decision 2).
3. For a resolve, duplicate or obsolete that names an ADR, that ADR's `resolves` gains the id (R8).
4. `shared` on Q17 (`fyflow-react-components` Q16), Q19 (its Q14) and Q20 (its Q15), with the
   repository's name attached as `doc/questions/README.md` requires. No status changes on the three.
5. Q513 raised, as `doc/questions/README.md` says to raise one.

**Out** — named rather than left implicit, with where it goes instead

- **Answering a question.** No ADR is written and nothing under `spec/`, `src/`, `examples/` or
  `test/` changes; a question whose answer is *decide now* is a keep with a `closes-when` naming the
  decision (decision 3).
- **Q20's verdict** — W122's, with a `closes-when` naming `fyflow-react-components` Q15. This item
  fills Q20's `shared` only.
- **Q494** (W127) and **Q499** (stays deferred).
- **Retitling a question or writing a body**, and any change to the lookup or a check.
- **The sibling repository.** Nothing is written there.

## Calibration

**W121 is the pilot and receives no calibration. What its reader and the maintainer change is
recorded in this item's Record and handed to W122's declaration by the coordinator** (P29 decision
5).

## The phases

P29 decision 4, in this order. A phase does not start before the one above it is complete.

1. **Propose.** Fill the worksheet: one row per question. The evidence is (a) the `npm run refs`
   count at `988ef5f`; (b) whether the code, clause, file or rule the question names still exists
   at `988ef5f`, as a path, or as a grep with its hit count and the exact pattern; (c) any later
   ADR, plan or item that answered it, by id.
2. **Check.** A fresh-context conformity reader reads each QUESTION first and the worksheet second,
   re-derives each row from the question and the tree, and reports AGREE, DISPUTE or CHANGE per row
   with its reason. It does not fix.
3. **Approve.** The maintainer approves, striking or changing rows. **Only approved rows are
   applied.** A struck row becomes a keep with a `closes-when` the maintainer states.
4. **Apply.** The approved rows' fields, the ADRs' `resolves`, `shared` on Q17/Q19/Q20, and Q513.
5. **Record.** After the gate below, with the tree still.

### Worksheet

*Filled in at phase 1.* The evidence cell holds three parts: **refs** (the count), **subject** (path,
or grep pattern and hit count, at `988ef5f`), **answered by** (ADR, P or W id, or none).

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|
*How the evidence was taken (phase 1, the propose unit).* **refs** is `node scripts/lookup.mjs refs Q<n>`
run in a `git archive` of `988ef5f` (`dev-dist/w121p-33276/base`, no links, EXIT 0 for all 38), given as
*files / mentions*. **subject** is `git grep -c -E '<pattern>' 988ef5f -- <paths>`, summed, or a
`git show 988ef5f:<path>` line. Nothing was read from the working tree.

| id | verdict | evidence | new `closes-when` / `resolved-by` / `note` |
|---|---|---|---|
| Q5 | keep | **refs** 27 / 67. **subject** `per.join` in `spec/join-policy.md` + `doc/decisions`: 3; `spec/join-policy.md` section 5 still lists *whether a policy is per-join configurable* as not fixed. **answered by** none — ADR 0025 rule 7 says ADR 0003's *premature until a second policy that does not hang* condition has FIRED, and still declines it | `closes-when`: an ADR deciding whether a join policy may be chosen per join or stays one global choice per run (ADR 0025 rule 7 says ADR 0003's precondition is met) |
| Q7 | defer | **refs** 25 / 39. **subject** `join may time out` in `spec` + `doc/decisions`: 2 (`spec/join-policy.md` section 4's open table; ADR 0025 *does not decide*). **answered by** the detection half by ADR 0015 (`stuck`) and ADR 0025 (`unsatisfiable`); the timeout half by none | `status: deferred`; note stamp `P29 W121: defer — detection is answered by ADR 0015 and ADR 0025; a join timeout is a feature nobody has asked for, and spec/join-policy.md section 4 still lists it as open` |
| Q16 | defer | **refs** 23 / 46. **subject** `flow-level retry` in `spec` `src` `AGENTS.md`: 4; `src/driver/ids.ts` keeps an `attempt` segment for it. **answered by** W58 (task half, `retryPolicy`); the flow half by none, and P16's Out says *if anything ever asks for it* | `status: deferred`; note stamp `P29 W121: defer — the task half landed at W58; the flow half (re-dispatching a node under a new attempt) waits for a consumer, as P16's Out says` |
| Q18 | keep | **refs** 9 / 10. **subject** `cancel` in `AGENTS.md` `spec` `src`: 2, and none in `src`. `AGENTS.md` lists *cancellation: nothing*; `spec/run-state.md` says *report it and abandon it*; S2 states the partial plan. **answered by** none | `closes-when`: a decision on what cancelling a run does — S2's *stop dispatching and ignore results* or a wait for an upstream `cancelTask` — written as an ADR or a spec rule |
| Q23 | defer | **refs** 5 / 5. **subject** `FD-V13` in `spec/flow-definition.md`: 11, and its section 7 calls `FD-V13`, `FD-V19` and `FD-V22` *restrictions this repo may lift*. **answered by** none (P7 and W20 name it with *no owner*) | `status: deferred`; note stamp `P29 W121: defer — FD-V13 refuses it today; lifting it is a spec change with a rationale that no flow has asked for` |
| Q26 | defer | **refs** 5 / 7. **subject** `OR-R4` in `spec/outcome-record.md`: 1, and it still says *whether the driver logs them at all is Q26*; `src/driver/listener.ts:58` cites it. **answered by** none | `status: deferred`; note stamp `P29 W121: defer — OR-R4 records no task.running or task.progress, and nothing needs them yet; Q365's fix is the first thing that would` |
| Q27 | defer | **refs** 13 / 34. **subject** `FD-V19` in `spec/flow-definition.md`: 21; ADR 0036 says *Q27 stays open exactly where it was*. **answered by** none (ADR 0036 unentangled it from Q12 and left it alone) | `status: deferred`; note stamp `P29 W121: defer — FD-V19 and FD-V22 refuse convergence, and spec/flow-definition.md section 7 says they hold nesting up; lifting them waits for a flow that needs it` |
| Q28 | defer | **refs** 7 / 7. **subject** `RS-R2` in `spec/outcome-record.md`: 1. It fixes what a resolution does today (it supplies an outcome and never re-dispatches) and names retry and reroute as *both Q28*. **answered by** RS-R2 and RS-R3 for the current behaviour; the extensions by none | `status: deferred`; note stamp `P29 W121: defer — RS-R2 fixes what a resolution does today; retry is Q16's flow half and rerouting is refused as a second routing mechanism, and neither has a consumer` |
| Q29 | resolve | **refs** 5 / 5. **subject** `never interprets it and never authenticates` in `spec/outcome-record.md`: 1 (section 5's `actor` row); `src/driver/log.ts:34` and `AGENTS.md:1092` say the same. **answered by** `spec/outcome-record.md` section 5 | `resolved-by`: No — `actor` is opaque: the library never interprets or authenticates it, so who may resolve is the caller's (spec/outcome-record.md section 5, the `actor` row) |
| Q30 | defer | **refs** 5 / 11. **subject** `FD-V18` in `spec/flow-definition.md`: 3, and `"user_action"` is refused. ADR 0004 rule 3 and its *What a future reader will try* say *refused for now*. **answered by** ADR 0004 rule 3, for now | `status: deferred`; note stamp `P29 W121: defer — ADR 0004 rule 3 and FD-V18 refuse it for now, as one concept with two mechanisms; a reopening needs a flow that cannot use a resolution` |
| Q37 | resolve | **refs** 9 / 16. **subject** `Q37` in `test/matrix/chain.test.ts`: 4, where W15 narrowed it to *whether the DRIVER owes a signal the fold already supplies*. **answered by** ADR 0058 rules 2-3: the runtime keeps the fold and `done` settles on `stuck` with no poll, and the driver never learns of it | `resolved-by`: ADR 0058 rules 2-3 — the runtime keeps the fold and its `done` handle settles on `stuck`, so nobody polls and the driver owes no signal. **Apply also adds Q37 to ADR 0058's `resolves` (R8)** |
| Q38 | defer | **refs** 5 / 8. **subject** `'stopped'` in `src/driver/driver.ts`: 6. ADR 0065 rule 2 refuses a stored `stopped` element, and `AGENTS.md` says *a STOPPED run is not resumable*. But P23 decision 10 and `spec/run-state.md` section 9 both list Q38 as declared OUT, *does NOT fix*. **answered by** ADR 0065 rule 2 for today's behaviour; the question by none | `status: deferred`; note stamp `P29 W121: defer — ADR 0065 rule 2 refuses resuming a stopped run by name; P23 decision 10 declared making one resumable OUT, and nothing has asked since` |
| Q39 | resolve | **refs** 3 / 4. **subject** `The driver ships no policy` in `spec/join-policy.md`: 1 (section 4); `export * from "./src/fold/policies.ts"` in `index.ts`: 1; `AGENTS.md` *Pass `liveToken`*, three policies exported. **answered by** `spec/join-policy.md` section 4, with W16 (what it ships) | `resolved-by`: Yes, as exported policies and not a default — the three policies and POLICIES are exported, and the driver carries none (spec/join-policy.md section 4, *The driver ships no policy*) |
| Q61 | keep | **refs** 8 / 17. **subject** `OR-R6` in `spec/outcome-record.md`: 10, `thread`: 2, and neither `thread` hit is on OR-R6. Only `examples/l6.ts:1568` and `examples/workers/uncloneable.ts` say the pool decides it. **answered by** none | `closes-when`: `spec/outcome-record.md`'s OR-R6 says a thread pool's own clone refuses the value first, or a decision that the reference need not say so |
| Q62 | keep | **refs** 3 / 6. **subject** `cumulative` in `spec/run-state.md` + `spec/join-policy.md`: 0 (EXIT 1); `suspended` in `spec/run-state.md`: 14, and RN-R6 names the field without a lifetime. `examples/l6.ts:564-571` says the fold clears it, so it is current. **answered by** none | `closes-when`: `spec/run-state.md` RN-R6 states whether `regions[*].suspended` is current, as the fold behaves, or cumulative |
| Q63 | keep | **refs** 2 / 4. **subject** `UncloneableResult: the result` in `src/driver/listener.ts`: 1; the `${f.kind}: ${f.message}` render is at `AGENTS.md:2046` and `examples/run-flow.ts:1988`. **answered by** none | `closes-when`: the `UncloneableResult` message stops opening with its class name, or a decision that the doubled render stays |
| Q81 | defer | **refs** 3 / 6. **subject** ``POLICY is still stepped with `e` `` in `src/driver/driver.ts`: 1 (the `emit` comment, *a separate question this item does not answer*); W76 left it untouched. **answered by** none | `status: deferred`; note stamp `P29 W121: defer — only a policy that writes to its event is hurt, the three shipped ones do not, and no custom policy is reported` |
| Q82 | keep | **refs** 2 / 3. **subject** ``Return a copy from `describe()` `` in `AGENTS.md`: 1, added by W12 (`d06c860`), the item that raised Q82. `spec/join-policy.md` has no copy rule. W12 measured a caller flipping a join to `satisfied`. **answered by** none — advice, not a rule | `closes-when`: a decision on whether `describe` must return a copy, by a spec rule or by the driver copying it, or that the AGENTS.md advice is enough |
| Q92 | defer | **refs** 5 / 7. **subject** `Q92` in `test/matrix/chain.test.ts`: 1 (line 303). W15 narrowed it to *should a `Cell` carry `RunState.outcome`*. **answered by** none | stays `deferred`; note stamp `P29 W121: defer — P5's deferral stands; W15 narrowed it to a test/matrix harness question, and the three dispatch channels agree on all 36 cells` |
| Q96 | defer | **refs** 5 / 9. **subject** `Q96` in `src/fold/policies.ts` + ADR 0025: 3; ADR 0025 says it is *not answerable from fixtures*; the owner reads *not before a real flow corpus exists*. **answered by** ADR 0025 rule 4 for now (`liveToken`) | `status: deferred`; note stamp `P29 W121: defer — ADR 0025 rule 4 recommends liveToken; changing that needs a real flow corpus, which does not exist` |
| Q97 | keep | **refs** 25 / 36. **subject** `Q97` in `spec` `src`: 10 hits in 5 files; `spec/join-policy.md` section 5 and `spec/run-state.md` say *open since P5 with ADR 0026 held for it*. **answered by** none | `closes-when`: ADR 0026 (held) decides whether `stuck` carries a reason that tells a reported dead join from a silently hung one, by a fourth region event or otherwise, or refuses to |
| Q161 | duplicate | **refs** 1 / 1. **subject** `Q161` in `spec` `src` `doc/decisions`: 0. W33 raised it *for whoever answers Q97*, and `spec/join-policy.md` section 5 carries its narrowing as *what this leaves for whoever answers Q97*. **answered by** none — Q97's input | `resolved-by`: duplicate of Q97 — the N = 0 fact a policy cannot see is spec/join-policy.md section 5's narrowing of Q97 |
| Q163 | icebox | **refs** 2 / 5, with 4 of the 5 reserving id ranges. **subject** `Q163` in `spec` `src` `doc/decisions`: 0. `describe` is opaque diagnostics (JP-R1), and nothing asserts it is stable mid-burst. **answered by** none | `status: icebox`; note stamp `P29 W121: icebox — an observation with no consumer and no rule it breaks; it matters only if describe is ever promised stable between verdicts` |
| Q241 | keep | **refs** 3 / 4. **subject** `OR-R12` in `spec/outcome-record.md`: 6, which records the behaviour as *recorded rather than decided*. **answered by** none | `closes-when` unchanged (*a consumer reporting a `DataCloneError` they could not attribute*); stamp only |
| Q249 | keep | **refs** 15 / 23. **subject** `no VERSION`/`carries no version` in `spec/flow-definition.md`: 2. The old `closes-when`'s first condition, *durability*, has FIRED: P23 shipped it, and decision 7 (*no migration*) kept Q249 open, as `spec/run-state.md` section 9 does. **answered by** none | `closes-when`: a registry entry changing shape under a stored definition or checkpoint, or a plan deciding what a node type's version means (durability landed at P23 and left this open) |
| Q307 | duplicate | **refs** 3 / 3. **subject** `nothing can detach it`/`cannot be detached` in `src` `AGENTS.md` `spec`: 6 hits in 4 files. Q371's title names *a `start` `FD-R4` refused*, the same un-detachable driver seen from the runtime. **answered by** none | `resolved-by`: duplicate of Q371 — a driver refused at `start()` is one of the drivers Q371 says cannot be detached (src/driver/driver.ts:315) |
| Q330 | defer | **refs** 3 / 8. **subject** `findings(w.outputSchema, out)` in `scripts/check-workers.mjs`: 1, still unguarded where OR-R13 guards the driver's. **answered by** none | `status: deferred`; note stamp `P29 W121: defer — the unguarded read is in a check over this repo's own workers, and it fires only if a worker returns a cyclic or BigInt value, which no item has reported` |
| Q331 | icebox | **refs** 1 / 1. **subject** `reportResultSchema(record` in `src/driver/driver.ts`: 2, typed `Readonly<OutcomeRecord>`. Only the library's own code holds the reference, and W80's eleven-field test binds it. **answered by** none | `status: icebox`; note stamp `P29 W121: icebox — a what-if about the library's own internal code, already bound by a test; no consumer holds the reference` |
| Q354 | keep | **refs** 2 / 3. **subject** `JP-R12` in `spec/join-policy.md`: 12. **answered by** none | `closes-when` unchanged (*a consumer reading an empty collection as a missing branch*); stamp only |
| Q357 | keep | **refs** 3 / 6. **subject** `Q357` in `spec` `src`: 0, and it is cited from W85 and W86 only. **answered by** none | `closes-when` unchanged (*a second claim about a cost whose fixture cannot produce it*); stamp only |
| Q358 | keep | **refs** 4 / 10. **subject** `Q358` in `spec` `src` `examples`: 0. W97's Out names *widening a SERIAL pool (`maxThreads` 1)* as Q358's and not done; `doc/workflow.md` section 5 rule 8 (f) arranges order rather than widening. **answered by** none — (f) answers how to get an overlap, not what a wider pool does | `closes-when`: an L6 row runs two region instances on a pool wider than one thread, or a decision that rule 8 (f)'s ARRANGED overlap is the whole answer |
| Q365 | defer | **refs** 7 / 21. **subject** `fresh retry budget` in `AGENTS.md` `spec` `doc/decisions`: 4 hits in 3 files (RN-R21, ADR 0065 consequence 2, AGENTS.md). **answered by** none — measured and stated by W89, not fixed | `status: deferred`; note stamp `P29 W121: defer — stated in RN-R21, ADR 0065 and AGENTS.md; a fix needs attempt events the log does not record (Q26, deferred too)` |
| Q371 | keep | **refs** 3 / 9. **subject** `RunIdInUse` in `src`: 5 hits in 2 files, and `nothing can detach it` as for Q307. RN-R25 states the spend as behaviour and never rules it right. **answered by** none | `closes-when`: a decision on whether a driver can be detached from its scheduler, or a spec rule making the per-runtime spend permanent (spec/run-state.md RN-R25) |
| Q372 | defer | **refs** 3 / 4. **subject** `Q372` in `AGENTS.md`: 1 (*Change a flow, change its `version`*); RN-R20 says *nothing past the stored length is compared*. **answered by** none — said in words, as the owner field records | `status: deferred`; note stamp `P29 W121: defer — RN-R20's limit is stated, and the mitigation is the flow version check; detecting a changed predicate would need a predicate identity in the checkpoint, which nobody has asked for` |
| Q374 | icebox | **refs** 3 / 5. **subject** `Q374` in `AGENTS.md`: 1 (*a store you do not trust is a store you should not resume from*); `spec/run-state.md` section 9 leaves storage to the consumer (P23 decision 1). **answered by** none | `status: icebox`; note stamp `P29 W121: icebox — checking a consumer's store is outside the library by P23 decision 1; it is a what-if until the library owns storage` |
| Q386 | duplicate | **refs** 5 / 16. **subject** `Q386` in `AGENTS.md` `examples`: 4 hits in 2 files. P24's Retro says *the shipped gate cannot resume wrong; a decision predicate with closure memory still can, which is Q9's purity one road over*. ADR 0067 puts a gate's memory in the driver. **answered by** ADR 0067 for gates; the rest is Q9 (open, W122's batch) | `resolved-by`: duplicate of Q9 — the shipped gate keeps its memory in the driver (ADR 0067); what still resumes wrong is an impure predicate, which is Q9 (P24's Retro) |
| Q508 | keep | **refs** 4 / 11. **subject** `\bgate\b` in `doc/glossary.md`: 8, still three senses. **answered by** none | `closes-when` unchanged (it already names the decision); stamp only |

**Proposal summary (phase 1): 38 rows. keep 15, defer 14, icebox 3, resolve 3, duplicate 3, obsolete
0.** 23 leave `open` (61%). One resolution names an ADR (Q37, ADR 0058), so apply edits one ADR's
`resolves`. Q92 is already `deferred` and stays so. **The apply step also fills `shared` on Q17
(`fyflow-react-components` Q16), Q19 (its Q14) and Q20 (its Q15)** (decision 7), and none of the three
changes status.

*Withdrawn at Approval: this summary is wrong. The table holds 37 rows (Q103 has none) and 14 keeps,
not 15. The applied tally is* Final approved verdicts *below.*

### Reader's findings

*Filled in at phase 2* by a fresh-context conformity reader. It read P29 decisions 1-3 and 7, then
each question at `988ef5f` (`git show`, `git grep` and a `git archive` in `dev-dist/w121r-34191/base`,
no links). It wrote its own verdict to `dev-dist/w121r-34191/my-verdicts.md` before reading the
worksheet. It reports and does not fix.

| id | AGREE / DISPUTE / CHANGE | reason |
|---|---|---|
| Q5 | AGREE | ADR 0025 rule 7 (line 130) says what the row quotes: ADR 0003's precondition has fired and per-join choice is still declined. `spec/join-policy.md` section 5 lists it as not fixed. The `closes-when` names a decision |
| Q7 | AGREE | ADR 0015 rule 6 reduces Q7 to its timeout half, and `AGENTS.md` section 11 says *a join timeout: nothing*. The reader leaned keep, but the defer reason is honest |
| Q16 | AGREE | P16 lines 181 and 387 say the flow half waits *if anything ever asks for it*, so the defer reason quotes the plan |
| Q18 | AGREE | No cancel exists (`AGENTS.md` section 11), and S2's *What we do without it* names the partial plan the `closes-when` offers. The closing condition is checkable |
| Q23 | AGREE | `spec/flow-definition.md` section 7 calls `FD-V13` a restriction *this repo may lift*. No flow asks for it, so defer is honest |
| Q26 | AGREE | `OR-R4` fixes today's behaviour and names Q26 as the *whether at all*. See Q365 for the circular trigger |
| Q27 | AGREE | ADR 0036 lines 118-130 say *Q27 stays open exactly where it was*. The same shape as Q23 |
| Q28 | AGREE | See the proposer's question below. `RS-R2` fixes today's behaviour, and its own text says the two extensions *are both Q28*, so the spec treats Q28 as where they live. Defer keeps that true |
| Q29 | AGREE | `spec/outcome-record.md` section 5, the `actor` row (line 433), cites Q29 as a reference, not as a pending point. *Never authenticates* leaves who may resolve to the caller. The resolution exists at `988ef5f` and names no ADR, so `R8` is not involved |
| Q30 | AGREE | ADR 0004 says in its own words that it is *refused for now* (*What a future reader will try*). A provisional refusal is a defer, not a resolution |
| Q37 | AGREE | ADR 0058 rules 2-3 answer *who asks*: the runtime, as a caller, and `done` settles on `stuck`. *How often* is rule 6: at every quiescent point, by `queueMicrotask`. Add rule 6 to the `resolved-by` text. A hand-built `Driver` has no `done`, but `chain.test.ts:292` narrowed Q37 to *whether the DRIVER owes a signal*, and rule 2 answers no. `R8`: ADR 0058's `resolves` gains Q37, as the row says |
| Q38 | CHANGE | **resolve**. `resolved-by`: *Terminal — a stopped run is refused by name with reason `stopped`, because the refusal that stopped it would stop it again (P23 decision 10; ADR 0065 rule 2; RN-R23)*. The heading of P23 decision 10, *A stopped run is NOT resumable and is refused by name*, is the question's answer, and it gives a reason that makes it permanent. *Declared OUT* refers to building a resume for a stopped run. The question asks whether one is resumable or terminal, and decision 10 answers that. `spec/run-state.md` line 547, *does NOT fix: resuming a stopped run*, stays true. `R8`: ADR 0065's `resolves` gains Q38 |
| Q39 | AGREE | `index.ts` exports `src/fold/policies.ts`, which holds three policies and `POLICIES`. `spec/join-policy.md` section 4 (line 562) says *The driver ships no policy*, and ADR 0025 line 147 says *no default that is right*. The question's either/or is answered: shipped, and not a default |
| Q61 | AGREE | `OR-R6` (line 200) still says nothing about the pool. ADR 0037 line 47 cites the asymmetry and does not make it a rule |
| Q62 | AGREE | `RN-R6` names the field and gives it no lifetime. The `closes-when` is checkable |
| Q63 | AGREE | `src/driver/listener.ts:86` still opens the message with `UncloneableResult: ` |
| Q81 | AGREE | The subject is live at `driver.ts:3321` (stepped with `e`) and `:3341` (the frozen copy). The reader leaned keep, but the defer reason is accurate |
| Q82 | AGREE | `driver.ts:3392` and `:3712` hand out `policy.describe(state)` verbatim. W12 finding 4 calls it a decision about where the obligation sits |
| Q92 | AGREE | The subject is live, `chain.test.ts:216`. P5's *real, not now* stands |
| Q96 | AGREE | ADR 0025 rule 4 and line 171 say it is *not answerable from* fixtures. Same shape as Q30 |
| Q97 | AGREE | There is no `0026-*` file at `988ef5f`, and `spec/run-state.md` line 362 and `spec/join-policy.md` line 615 say it is held. The `closes-when` names the decision |
| Q161 | AGREE | `spec/join-policy.md` line 640 folds the N = 0 case into Q97 (*what this leaves for whoever answers Q97*). Q97 stays open in this batch, so the target survives |
| Q163 | AGREE | No rule and no consumer. The reader leaned icebox independently |
| Q241 | DISPUTE | The row is accurate: `OR-R12` says *Recorded rather than decided* (line 442) and *What is NOT decided here*. The kept `closes-when`, *a consumer reporting a `DataCloneError` they could not attribute*, is what would reopen the question, not what would close it. That is P29 decision 1's *defer* reason. The replacement is likely defer with that event in `note`, or keep with *a decision whether OR-R6 and OR-R12 are unified*. The maintainer should decide what `closes-when` means; see Q354 |
| Q249 | AGREE | The trigger *durability* fired at P23, and decision 7 kept Q249 open. The rewritten `closes-when` adds the missing decision. The reader found the same thing independently |
| Q307 | AGREE | `driver.ts:315` and `RN-R25` give one root, *nothing can detach it*, and Q371's proposed `closes-when` is the detach decision, so it covers Q307. Q371 stays keep, so the target survives. Keeping Q307 and making Q371 the duplicate would be equally defensible |
| Q330 | AGREE | `scripts/check-workers.mjs:221` still calls `findings(w.outputSchema, out)` unguarded. The defer reason is accurate |
| Q331 | AGREE | `driver.ts:2005` is internal, and the reference never reaches a consumer |
| Q354 | DISPUTE | The same point as Q241: *a consumer reading an empty collection as a missing branch* is an event that would reopen the question, not one that closes it. `JP-R12` already fixes the behaviour (`{}` propagates). The reader's own verdict was defer, with that event as the reason |
| Q357 | DISPUTE | The same again: *a second claim about a cost whose fixture cannot produce it* is the second occurrence that section 6 pass 3 rule 2 would need before a rule. Nothing would close the question. Defer, with that event in `note`, is the more honest shape |
| Q358 | AGREE | W97 line 42 names widening a serial pool as Q358's and not done. The `closes-when` is an L6 row or a decision, and both can be checked. Icebox would also be defensible |
| Q365 | AGREE | It is measured and stated in `RN-R21`, ADR 0065 consequence 2 and `AGENTS.md`. **Caveat**: Q26's defer names *Q365's fix* as its trigger, and Q365's defer names Q26, so neither will ever wake the other. Q365's own `owner` says the real blocker is *the scheduler's attempt event*, an upstream want with no S id. The note would be more honest if it named that |
| Q371 | AGREE | `RN-R25` states the spend as behaviour and does not rule on it |
| Q372 | AGREE | `AGENTS.md` lines 3210-3214 state it, with *change a flow, change its version* as the mitigation |
| Q374 | AGREE | P23 decision 1 leaves storage to the consumer. The reader leaned defer, and icebox is equally honest |
| Q386 | CHANGE | **keep**. `closes-when`: *Q9 is decided — predicate purity enforced, or declined for good — or a resume detects a decision whose memory lives outside the driver*. Three reasons it is not a duplicate. (1) P24's Retro, line 439, says *Q386 stays open* and calls it *Q9's purity one road over*: a neighbour, not the same question. Q386 asks about resume correctness, and W93 line 293 files it as `RN-R20`'s blind tail, the mechanism of Q372. (2) P29 decision 1 requires the target to be *a question that stays*. Q9 is W122's, and its own note, *declined with a measurement by P10*, makes it a candidate to resolve. Resolving Q9 would leave Q386 pointing at a closed question. (3) This batch cannot guarantee anything about the next one |
| Q508 | AGREE | The `closes-when` already names the decision, so only the stamp changes |

**Summary: 38 rows. AGREE 33, DISPUTE 3 (Q241, Q354, Q357), CHANGE 2 (Q38 → resolve, Q386 → keep).**
If the maintainer takes both CHANGEs, the proposal becomes keep 16, defer 13, icebox 3, resolve 4,
duplicate 2. Two resolutions then name an ADR (ADR 0058 for Q37, ADR 0065 for Q38).
*Withdrawn at Approval: the table holds 37 rows and 32 AGREE, not 38 and 33, and the keep 16 above
inherits the worksheet's off-by-one. The applied tally is* Final approved verdicts *below.*

**The proposer's question: Q28, Q38 and Q30 each have a rule that fixes today's behaviour.** The test
the reader applied is whether the deciding text treats the question as still pending.
- **Q30** pends. ADR 0004 says *refused for now*: defer.
- **Q28** pends. `RS-R2` names both extensions as *both Q28*: defer, and the retry half is also Q16.
- **Q38** does not pend. P23 decision 10's heading answers it outright, and its reason, *the refusal
  that stopped it would stop it again*, makes the answer permanent rather than provisional: resolve.

**Q386 and Q9, across the batch boundary.** A duplicate whose target the next batch judges cannot be
checked from this batch. That is why the row changes to keep rather than becoming a DISPUTE.

**Outside the worksheet.** The reader noticed a false claim at `988ef5f`. `AGENTS.md` section 11
(line 1806) says *durability … nothing … it is not built*, but `runtime.resume` has shipped since P23.
Triage does not fix it, and no question was raised.

### Approval

*Filled in at phase 3: who approved, when, and every struck or changed row.*

**The maintainer, 2026-10-06, two answers:**

1. **Approval:** *"Approve, taking the reader's changes".* The approved set is **the worksheet above
   with the Reader section's CHANGE and DISPUTE rows taken.** The worksheet's rows are not rewritten;
   the table below is the resolved verdict for every row that differs from them.
2. **Calibration, for the pilot:** *"Closing condition only as recommended, but i want to be more
   aggressive in iceboxing and deferring. But send round of stop and ask for each question that you
   deem to remain open."* So a keep's `closes-when` is a condition that would ANSWER the question; a
   condition that would only reopen it makes the row a defer, with the trigger in `note`. **Every row
   still `keep` goes to the maintainer one by one, in the Stop-and-asks below, before anything is
   applied.**

| id | worksheet | approved | taken from | approved fields |
|---|---|---|---|---|
| Q38 | defer | **resolve** | Reader CHANGE | `resolved-by` as the Reader's Q38 row (P23 decision 10; ADR 0065 rule 2; RN-R23). **ADR 0065's `resolves` gains Q38 (R8)** |
| Q386 | duplicate | **keep** | Reader CHANGE | `closes-when` as the Reader's Q386 row: Q9 decided, or a resume detects a decision whose memory lives outside the driver |
| Q241 | keep | **defer** | Reader DISPUTE | `status: deferred`; the old `closes-when` (*a consumer reporting a `DataCloneError` they could not attribute*) moves into `note` as the reopening trigger |
| Q354 | keep | **defer** | Reader DISPUTE | `status: deferred`; *a consumer reading an empty collection as a missing branch* moves into `note` |
| Q357 | keep | **defer** | Reader DISPUTE | `status: deferred`; *a second claim about a cost whose fixture cannot produce it* moves into `note` |

Q28 and Q30 stay defer, as the worksheet has them. Q37's `resolved-by` takes the Reader's addition of
ADR 0058 rule 6 (an AGREE with an amendment).

**The counts, measured from the tables rather than taken from either summary.** The worksheet has
**37 rows, not 38**: **Q103 has no worksheet row and no Reader row**, although it is one of the 38
owned files and the lookup at `988ef5f` lists it. The worksheet's tally reads *keep 15*; its table
holds 14 keeps (14 defer, 3 icebox, 3 resolve, 3 duplicate). The Reader's tally reads *AGREE 33*; its
table holds 32. **The approved set is therefore keep 12, defer 16, icebox 3, resolve 4, duplicate 2
— 37 rows — and Q103 unverdicted.** The expected *keep 13* is these 12 plus Q103 counted as a keep.
Q103 goes to the keeps round below, with a recommendation, because no verdict exists for it to
approve.

**The keeps round, answered 2026-10-06:** *"keep all recommendations"* — every recommendation in the
Stop-and-asks below is the verdict. Q103's verdict is that answer, since it had no worksheet row.

#### Final approved verdicts

**38 rows: keep 4, defer 23, icebox 5, resolve 4, duplicate 2, obsolete 0** — counted from this
table, and the same tally the apply script printed. *Taken from*: **W** the worksheet, **R** the
Reader's CHANGE or DISPUTE as approved, **K** the keeps round. Every row's `note` gains the stamp
`P29 W121: <verdict>`, with the reason shown, after `; ` where the note was not empty. A field not
named is unchanged. Where a keep's `closes-when` was only a reopening trigger (Q241, Q354, Q357,
Q249), it moves into `note` and `closes-when` is cleared, as this section's Q241-Q357 rows say; the
other keeps-round defers keep the `closes-when` they had, which was empty.

| id | final | from | fields applied |
|---|---|---|---|
| Q61 | keep | K | `closes-when` as the worksheet's row; stamp *closed by one spec sentence, decidable now* |
| Q62 | keep | K | `closes-when` as the worksheet's row; stamp *closed by one spec sentence* |
| Q63 | keep | K | `closes-when` as the worksheet's row; stamp *a small, decidable message change* |
| Q508 | keep | K | `closes-when` unchanged; stamp *a naming decision the maintainer can take now* |
| Q5 | defer | K | `deferred`; stamp *waits on a flow needing two join policies in one run* (ADR 0025 rule 7) |
| Q7 | defer | W | `deferred`; the worksheet's stamp |
| Q16 | defer | W | `deferred`; the worksheet's stamp |
| Q18 | defer | K | `deferred`; stamp *waits on S2's `cancelTask` upstream or a consumer asking to cancel* |
| Q23 | defer | W | `deferred`; the worksheet's stamp |
| Q26 | defer | W | `deferred`; the worksheet's stamp |
| Q27 | defer | W | `deferred`; the worksheet's stamp |
| Q28 | defer | W | `deferred`; the worksheet's stamp |
| Q30 | defer | W | `deferred`; the worksheet's stamp |
| Q81 | defer | W | `deferred`; the worksheet's stamp |
| Q82 | defer | K | `deferred`; stamp *waits on a reported custom policy mutated through `describe`* |
| Q92 | defer | W | stays `deferred`; the worksheet's stamp |
| Q96 | defer | W | `deferred`; the worksheet's stamp |
| Q97 | defer | K | `deferred`; stamp *ADR 0026 held since P5 and unused; waits on a consumer needing the distinction* |
| Q241 | defer | R | `deferred`; `closes-when` cleared, its trigger in `note` |
| Q249 | defer | K | `deferred`; `closes-when` cleared, its trigger in `note` (its first half, durability, landed at P23) |
| Q330 | defer | W | `deferred`; the worksheet's stamp |
| Q354 | defer | R | `deferred`; `closes-when` cleared, its trigger in `note` |
| Q357 | defer | R | `deferred`; `closes-when` cleared, its trigger in `note` |
| Q365 | defer | W | `deferred`; the worksheet's stamp |
| Q371 | defer | K | `deferred`; stamp *waits on a consumer constrained by spent run ids* (RN-R25) |
| Q372 | defer | W | `deferred`; the worksheet's stamp |
| Q386 | defer | R, K | `deferred`; stamp *waits on Q9's verdict in W122* (ADR 0067 for the shipped gate) |
| Q103 | icebox | K | `icebox`; stamp *the fold sees only driver-minted ids, so a throw needs a corrupt log* |
| Q163 | icebox | W | `icebox`; the worksheet's stamp |
| Q331 | icebox | W | `icebox`; the worksheet's stamp |
| Q358 | icebox | K | `icebox`; stamp *rule 8 (f) arranges the overlap; a wider pool is a what-if* |
| Q374 | icebox | W | `icebox`; the worksheet's stamp |
| Q29 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q37 | resolve | W + R | `resolved-by`: ADR 0058 rules 2, 3 and 6 (the Reader's addition); **ADR 0058 `resolves: Q37`** |
| Q38 | resolve | R | `resolved-by` as the Reader's row; **ADR 0065 `resolves: Q38`** |
| Q39 | resolve | W | `resolved-by` as the worksheet's row; names no ADR |
| Q161 | duplicate | W | `resolved-by`: *duplicate of Q97 — …*; Q97 stays (deferred) |
| Q307 | duplicate | W | `resolved-by`: *duplicate of Q371 — …*; Q371 stays (deferred) |

### Stop-and-asks

The keeps round: one row per question whose approved verdict is `keep`, plus Q103, with a
recommendation under the calibration above. **Nothing is applied before each is answered.**

| | the question | answer |
|---|---|---|
| Q5 | Join on a failed branch: may a policy be chosen per join? Closes-when: an ADR deciding per-join policy or one global choice. **Rec: defer** — waits on a flow needing two join policies in one run; ADR 0025 rule 7 declines it with the precondition met | **defer** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q18 | What cancelling a run does, with no upstream `cancelTask`. Closes-when: an ADR or spec rule choosing S2's partial plan or the upstream wait. **Rec: defer** — waits on S2's `cancelTask` upstream or a consumer asking to cancel | **defer** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q61 | OR-R6 is reachable inline but not threaded; undocumented. Closes-when: OR-R6 says the thread pool's clone refuses first, or need not. **Rec: keep** — closed by one spec sentence, decidable now | **keep** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q62 | Is `regions[*].suspended` cumulative or current? Closes-when: RN-R6 states the field's lifetime as the fold behaves. **Rec: keep** — closed by one spec sentence; the fold's behaviour is known | **keep** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q63 | `UncloneableResult` message repeats its class name in a kind-prefixed render. Closes-when: the message drops its class-name prefix, or a decision it stays. **Rec: keep** — a small, decidable message change | **keep** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q82 | Join `describe` output is handed out uncopied; callers can mutate it. Closes-when: a spec rule or driver copy, or AGENTS.md advice declared enough. **Rec: defer** — waits on a reported custom policy mutated through `describe`; AGENTS.md advises a copy | **defer** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q97 | `stuck` cannot tell a reported dead join from a hung one. Closes-when: held ADR 0026 decides a reason on `stuck`, or refuses. **Rec: defer** — held since P5 unused; waits on a consumer needing the distinction | **defer** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q249 | Does a node type have a version against the registry? Closes-when: a registry shape change under stored state, or a plan deciding versions. **Rec: defer** — the first half is a reopening trigger; waits on a registry entry changing shape | **defer** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q358 | A real pool serialises the overlap a per-instance key needs. Closes-when: an L6 row on a wider pool, or rule 8 (f) declared enough. **Rec: icebox** — rule 8 (f) arranges the overlap; a wider pool is a what-if | **icebox** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q371 | A driver cannot release its run id; a runtime spends one per driver. Closes-when: a detach decision, or RN-R25 making the spend permanent. **Rec: defer** — waits on a consumer constrained by spent run ids | **defer** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q386 | A decision with memory outside the driver resumes wrong, silently. Closes-when: Q9 decided, or resume detecting outside memory. **Rec: defer** — waits on Q9's verdict in W122 | **defer** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q508 | *Gate* names three things; is one renamed? Closes-when: keep all three via the glossary, or rename one. **Rec: keep** — a naming decision the maintainer can take now | **keep** — 2026-10-06, maintainer: *"keep all recommendations"* |
| Q103 | `fold()` throws `InvalidTaskId`; ADR 0027 kept it. Closes-when: none — **no worksheet row**. **Rec: icebox** — the fold sees only driver-minted ids; a throw needs a corrupt log (Q374, iceboxed) | **icebox** — 2026-10-06, maintainer: *"keep all recommendations"* |

## Verification

The gate's clauses, each run redirected with its exit code read in the same command:

| clause | how |
|---|---|
| reader report | the Reader's findings table, one row per worksheet row |
| maintainer approval | the Approval section |
| name-status | `git diff --name-status -- doc/questions/ > ns.log 2>&1; echo EXIT=$?`, then read `ns.log`: only `M`, plus `A` for `q513.md`-`q516.md`; no `D`, no `R` (P29 decision 8) |
| `check:register` | `npm run check:register > reg.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown` | `npm run check:markdown > md.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `check:markdown:selftest` | `npm run check:markdown:selftest > mds.log 2>&1; echo EXIT=$?` — EXIT 0 |
| the stamp count | `npm run q -- --include-icebox --where "note~P29 W121" --count > n.log 2>&1; echo EXIT=$?` — equals the approved row count. **`--include-icebox` is required**: without it the lookup hides every icebox verdict and the count falls short by exactly those rows |

*Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — this item changes no code.*

## Record

*Filled in 2026-10-06, by the apply unit, with the tree still.* Scratch: `dev-dist/w121a-35275/`
(the apply script and every log below). Node v24 by `fnm use 24` in every shell. Nothing committed.

**Final verdicts: 38 — keep 4, defer 23, icebox 5, resolve 4, duplicate 2, obsolete 0.** 34 of the
38 leave `open` (89%); with Q92 already deferred, 33 of the 37 open ones do. The tally is the
*Final approved verdicts* table's, and the apply script printed the same one.

**Gate — what ran.** Each run redirected, with `$?` read in the same command.

| Clause | Verdict | Notes |
|---|---|---|
| reader report | done | 37 rows (Q103 has none): AGREE 32, DISPUTE 3 (Q241, Q354, Q357), CHANGE 2 (Q38 → resolve, Q386 → keep) |
| maintainer approval | done | 2026-10-06: *"Approve, taking the reader's changes"*, then the keeps round, *"keep all recommendations"* (13 rows, Stop-and-asks) |
| name-status M/A only | EXIT 0 | `ns.log`: 41 `M` (38 verdicts plus `shared` on Q17, Q19, Q20) and 1 `A` (`q513.md`, made visible with `git add -N`). No `D`, no `R` |
| `check:register` | EXIT 0 | `reg.log`: R8 compared 16 pairings, two of them new (Q37 ↔ ADR 0058, Q38 ↔ ADR 0065) |
| `check:markdown` | EXIT 0 | `md.log` |
| `check:markdown:selftest` | EXIT 0 | `mds.log` |
| stamp count | EXIT 0, **38** | `n.log`: `npm run q -- --include-icebox --where "note~P29 W121" --count` equals the 38 approved rows |
| `git diff --name-only` against Owns | in Owns | 41 question files, `q513.md`, ADR 0058 and ADR 0065 (`resolves` only), and this file. No exception |
| own-id grep, excluding `dev-dist/` | clean | `W121` appears in P28's and P29's declarations, this file, `q513.md`'s `raised-by` and the 38 stamps. The two withdrawn tallies (*keep 15*, *AGREE 33*, and the reader's *keep 16*) survive only in this file's phase records, each now marked withdrawn where it stands |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the worksheet | yes, 37 rows | the reader had nothing to re-derive |
| (2) the reader's findings | yes, 37 rows | the five changed rows would have been applied as proposed |
| (3) the maintainer's approval | yes, plus the keeps round | nothing could be applied (P29 decision 4) |
| (4) the approved rows applied | yes, 38 files and two ADRs | the stamp count is 0 and the exit artifact's third command lists nothing for B1 |
| (5) `shared` on Q17, Q19, Q20 | yes: `fyflow-react-components` Q16, Q14, Q15 | the twins stay unnamed, `shared` empty in every file |
| (6) Q513 | yes, open, with a `closes-when` and `raised-by: "W121"` | the Q19/Q14 divergence goes unrecorded |
| (7) the calibration | below, *What this taught* | W122 starts with W121's defects |

**What broke.**

1. **The proposer omitted Q103's row, and the reader did not notice.** Q103 is one of the 38 owned
   files and the lookup at `988ef5f` lists it; it reached a verdict only through the keeps round.
2. **Both tallies were off by one.** The worksheet's summary said *keep 15* over a table of 14; the
   reader's said *AGREE 33* over a table of 32. Each counted 38 rows where the table held 37. Found at
   Approval by counting the tables rather than reading the summaries. *No rung covers a tally in an
   item file; the stamp count is what catches a missing row at apply time.*
3. **P29 prediction 3 held**: the reader disputed 3 rows and changed 2.

**What this taught** — the calibration for W122, which the coordinator's ledger holds and hands to
W122's declaration:

1. **A keep's `closes-when` ANSWERS the question.** A condition that would only reopen it makes the
   row a defer, with the trigger in `note` and `closes-when` cleared (Q241, Q354, Q357, Q249).
2. **The maintainer wants more aggressive iceboxing and deferring**, and **every row still `keep`
   after approval goes to a keeps round**, one stop-and-ask each, before anything is applied. Here
   that took 13 rows to 4 keeps.
3. **Count the worksheet's rows against the lookup's id list, and count every tally from its table.**
   Both proposer and reader missed a row and miscounted by one.
4. **A duplicate's target must stay inside the batch, or already be settled.** Q386 → Q9 crossed into
   W122 and became a defer waiting on Q9's verdict.
5. **A new question file shows as `A` in `git diff --name-status` only once it is in the index**
   (`git add -N`); untracked, it is absent from that reading.

**Questions raised.** [Q513](../questions/q513.md): our [Q19](../questions/q19.md) is resolved and
`fyflow-react-components` Q14, the same question, is open there. Nothing was written in the sibling
repository. **Q514, Q515 and Q516 were not issued**: they are skipped, never reissued.
