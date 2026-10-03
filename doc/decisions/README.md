# Decisions (ADRs)

One file per architectural decision, `NNNN-<slug>.md`, numbered from `0001`. Numbers are reserved
in a work item's `Reserves:` line before work starts, and are **never reused or renumbered**
(`doc/workflow.md` section 3).

**What earns an ADR:** a choice that would be expensive to reverse, that a future reader would
otherwise re-litigate, or that a piece of code silently depends on. A decision recorded only in a
chat transcript did not happen.

**What does not:** anything reversible in an afternoon, and anything already stated normatively in
`spec/`. A spec rule with a rationale paragraph is better than a spec rule plus an ADR restating
it.

An ADR is **superseded, never edited into a different decision.** The new one names the old.

**Correcting a false statement inside a decision is not changing the decision**, and is done in
place with the correction left visible, dated, and attributed to whatever found it. The test is
whether a reader who acted on the old text and one who acts on the new would do something different
*because the decision changed* — or only because one of them was working from a sentence that was
not true. [ADR 0004](0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
carries one instance: a trailing clause of rule 7 contradicted rule 4 three lines above it, and was
removed rather than superseded. **Deleting the correction notice would be the violation**, not the
edit.

**[ADR 0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) now carries two, and
the pair is worth reading together** — they are the same sentence corrected twice, by two different
readers, a day apart, and **the second refutation was already inside the first**. It is the clearest
evidence this repository has that `doc/` is upstream of every check and is checked by nothing.

**A rule superseded is not the ADR superseded.** ADR 0003's rule 5 is replaced by
[ADR 0025](0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) while
rules 1-4 stand; the notice sits **inside the rule it replaces**, so a reader cannot act on the old
text without seeing it. Marking the whole document superseded would have been false — the decision it
is named for is unchanged.

Use [TEMPLATE.md](TEMPLATE.md).

## Index

| # | Decision | Raised by | Date |
|---|---|---|---|
| [0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md) | Routing executes in the driver, outside the scheduler | Q1 | 2026-08-30 |
| [0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) | A flow definition is data, and a predicate is registered by name | Q2 | 2026-08-30 |
| [0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) | A join is satisfied when its region has no live branches, not when N have arrived | Q4 / W4 | 2026-08-30 |
| [0004](0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md) | A non-success outcome routes only where an edge opts in, and `user_action` suspends | W1 | 2026-08-30 |
| [0007](0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) | The driver normalizes every scheduler event into an immutable outcome record | Q31 | 2026-08-30 |
| [0013](0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) | `fyflow-scheduler` is a **development** dependency, reached from the working tree, and the published library depends on it not at all | Q51 / W5 | 2026-08-30 |
| [0014](0014-the-driver-produces-the-folds-ordered-input-sequence.md) | The driver produces the fold's ordered input sequence, and it is the log with the routing facts interleaved | Q41 / W5 | 2026-08-30 |
| [0015](0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) | A run whose join can no longer fire is `stuck`, the fold decides it, and `regions` did not already hold the data | Q42, Q43 / W5 | 2026-08-30 |
| [0022](0022-a-driver-takes-its-run-at-construction.md) | A `Driver` takes its run at construction, and `start()` takes only the payload | Q53 / W13 | 2026-08-31 |
| [0023](0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) | An inbound settlement is this run's only if this driver dispatched its task id | Q72 / W13 | 2026-08-31 |
| [0025](0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) | The zero-arrival join is reportable, under a third policy id; arrival-counting is not repaired | Q24 / W16 | 2026-08-31 |
| [0027](0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) | An inbound task id that does not parse was minted by no driver: report it, do not stop the run — **supersedes 0023 rule 2** | Q86 / W18 | 2026-09-02 |
| [0029](0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md) | The scheduler is a registry dependency, and nothing here reaches a working tree — **supersedes 0013 rules 3 and 5** | the maintainer | 2026-08-31 |
| [0030](0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md) | A join is transitive over nested fan-out, and a join that can never fire ends the branch it sits in | Q6 / W22 | 2026-09-02 |
| [0036](0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md) | Fan-out is **two features over one region**: a `map` is a second node kind, and a `branchPath` inside one is a property of the dispatch | Q12 / W32 | 2026-09-06 |
| [0037](0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md) | What a branch receives is a property of the **fan-out**; what a satisfied join carries is a property of the **region** | Q36, Q11, Q154 / W34 | 2026-09-07 |
| [0039](0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md) | The gate climbs the ladder, and proving the checks can fail runs concurrently | W39 / P11 | 2026-09-09 |
| [0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) | What a node can reach is the run's own outputs, and a node id names them relative to a branch path | Q11 (Q164-Q166) / W41 | 2026-09-09 |
| [0041](0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md) | A decision sees its node's outcome and whatever its own edge declares | Q8 / W42 | 2026-09-10 |
| [0042](0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md) | A reference says whether it is conditional, and the bare form means the target certainly ran | Q187 / W45 | 2026-09-10 |
| [0044](0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md) | A reference is visible when two paths agree on the regions that contain both of them | Q206 / W49 | 2026-09-10 |
| [0046](0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md) | A run retains what its tasks returned, and a region releases its collection when its join becomes terminal | Q19 / W53 | 2026-09-11 |
| [0048](0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md) | The scheduler is a declared dependency, reached by one bare specifier — **supersedes 0013 rules 1, 2 and 6** | P16 decision 1 / W57 | 2026-09-11 |
| [0049](0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md) | A node type is a registry entry, and its worker receives an envelope | P16 / W59 | 2026-09-12 |
| [0051](0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md) | A transform is a declared expression in a registered language, applied in the type's worker wrapper | P17 / W61 | 2026-09-12 |
| [0052](0052-a-second-dependency-is-declared-where-its-one-sub-path-is-reached.md) | A second dependency is declared where its one sub-path is reached | P17 / W62 | 2026-09-13 |
| [0053](0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md) | The schema validator is a built-in subset, and a keyword outside it is refused | P18 / W65 | 2026-09-15 |
| [0054](0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md) | Every task node names a TYPE, and a type is a derivation to pool options | P18 / W65 | 2026-09-15 |
| [0055](0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md) | A group factory's output is held to what the scheduler CALLS, not to what its interface requires | W66's declaration step / [S10](../scheduler-upstream.md) | 2026-09-16 |
| [0056](0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md) | An example is an ANNOTATION, validated against the schema it sits on | P19 / W72 | 2026-09-18 |
| [0058](0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md) | `runtime.start` returns a completion handle the RUNTIME keeps, and it resolves rather than rejects | Q293 / W77 | 2026-09-19 |
| [0060](0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md) | A run-time result check is a READING and never a refusal, and the callback that receives it IS the switch | P21 / W80 | 2026-09-22 |
| [0062](0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md) | A region INSTANCE is its opener and the opener's own branch path | Q160, Q156 / W84 | 2026-09-23 |
| [0064](0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md) | A checkpoint is the run's whole event sequence and a header of what it cannot regenerate, handed out as a COPY, and every event has a position | P23 / W88 | 2026-09-24 |
| [0065](0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md) | A resume replays the stored stimuli through the routing that produced them, refuses what it cannot regenerate, and re-dispatches what was in flight | P23, Q15, Q364 / W89 | 2026-09-24 |
| [0066](0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md) | A gate is a decision WITH MEMORY that names a registered type, and wires every route its type declares exactly once — *rule 7, the construction refusal, superseded by 0067* | P24 / W92 | 2026-09-25 |
| [0067](0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md) | A gate runs in the driver, its memory is the driver's, and its decision is recorded | P24 / W93 | 2026-09-25 |
| [0068](0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md) | A route guarantees what its TYPE declares, and the library derives it from the KEY PATH — *supersedes [0066](0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)'s pass-through consequence in part; answers [Q391](../open-questions.md), and adds NO rule id* | P25 / W99 | 2026-09-29 |
| [0070](0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md) | The local gate is the LADDER, and proving the checks can fail belongs to CI — *supersedes [0039](0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)'s rule that the chain's last entry is the self-test runner; its order and concurrency stand* | W103 | 2026-09-30 |
| [0072](0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md) | A scratch path carries its PROCESS, and a self-test that shares the tree says so — *supersedes part of [0039](0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md): its exclusive SET loses `check:wiring:selftest`, its mechanism stands* | W105 | 2026-10-01 |
| [0073](0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) | The README is for a PERSON, the reference is for an AGENT, and `CLAUDE.md` is for an agent working ON the library — *amends what `X8` and `X10` take as their subject: eight README pairings become three and `X10` loses README* | W107 | 2026-10-02 |
| [0074](0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md) | A predicate is a registered NAME or a DECLARED comparison over the context — *answers [Q444](../open-questions.md); the bare-string `when` is RETIRED, which breaks every existing document* | W108 | 2026-10-02 |
| [0075](0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md) | A node that only TRANSFORMS is a built-in type with no inner worker — *answers [Q445](../open-questions.md); `BUILT_IN_NODE_TYPES` is a THIRD namespace, `FD-V46` refuses a node of one with nothing to do, and the THREE-TIER rule says when not to use it* | W109 | 2026-10-02 |
| [0076](0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md) | A vacuity floor counts what the churn it guards against cannot MOVE, and the always-read set has a ceiling that only goes DOWN — *amends what `M4` takes as its subject: `6225` link instances become `120` documents that CARRY a link, because the before-and-after windows for a link count are DISJOINT and no literal spans them. `M3` is measured and deliberately NOT moved; `M5` CANNOT be re-pointed yet and W113 inherits the measured obligation. Adds `check:budget` as the gate chain’s SIXTEENTH entry* | [W112](../work-items/w112-the-budget-the-check-and-the-floors.md) | 2026-10-03 |
| [0077](0077-an-item-does-not-write-its-status-into-claude-md.md) | An item does not write its STATUS into `CLAUDE.md`, and the record step’s six become FIVE — *the maintainer’s decision at W112’s record step. The file was 556 KB and 93% `Current state` against a 25 KB budget, and this rule was what filled it; the entry was never the source, because section 1 rule 5 already says a status is read from the item’s own file and never from an index. **Amends [ADR 0073](0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) decision 1**, whose table gave `CLAUDE.md` “the state of the work”. `npm run state` is the replacement (W114’s); `doc/README.md` is deliberately unchanged* | [W112](../work-items/w112-the-budget-the-check-and-the-floors.md) | 2026-10-03 |
| [0078](0078-a-vacuity-floors-window-is-a-property-of-the-probe-suite.md) | A vacuity floor’s WINDOW is a property of the probe SUITE, and an alternative refused before a cut is not refused after it — *`M5`’s floor is 28 and the second `removes` probe DECLARES it, because every quantity and both subjects give an EMPTY window while that probe stays quiet. ADR 0076 priced this alternative and refused it on the PRE-cut tree. Adds `M7` and `M8`: the register is a table, and it is one row per question — the clause W113 narrowed corpus-wide and its adequacy reader priced scoped, at zero.* | W113 | 2026-10-03 |

**0062 was missing when W88 added 0064, the FOURTH time this table has stopped** *(**The FIFTH, counted by history at P23's retro** — the index against its directory at every commit that touched `doc/decisions/`: 29 of 46 shipped it short, in five episodes, 0022-0029, 0030-0036, 0039-0046, 0049-0058 and 0062.)* — W84 took the ADR and no item after it added the row. Derived from 0062's own header, as the notes below prescribe. **0061 and 0063 are absent on purpose**: each was reserved by its plan and skipped. [W88](../work-items/w88-what-a-checkpoint-is.md).

**The index had stopped at 0048 for FOUR plans and EIGHT rows were missing — 0049 through 0058, of which 0050 and 0057 were reserved and SKIPPED — which is the third time this file has recorded exactly that, and the third time the backfill has been done by the item that came next.** W57's note above records seven missing rows and W34's records three; *(this said NINE, counting 0060, which is this item's own row and was not missing; and SECOND, against its own first clause; and TWO for W34, quoting that note's body where its heading says three. Three counting errors in one sentence, in the note about a table that had stopped counting — W80's conformity reader, findings 5, 6 and 7.)* **the counter-measure both of them wrote down — *derive every row from its own ADR's header* — is what makes the backfill cheap and is not what makes it happen.** What makes it happen is somebody adding a row and looking up. *Nothing compares this table to `doc/decisions/`'s own listing*, and `C5`/`M1` cannot see it, because a row that is absent has no link to resolve — which is [Q214](../open-questions.md)'s shape one index over: a defect whose whole symptom is that nothing happened. **0050, 0057 and 0059 are absent on purpose**: each was reserved by a plan and SKIPPED, and `doc/workflow.md` section 3 says a skipped id is never reissued, so a gap here is the record rather than a hole. [W80](../work-items/w80-what-a-run-time-result-check-is.md).

**Seven rows were missing when W57 added its own — 0039 through 0046 — and all seven are added together, each derived from its ADR's header.** The table had stopped at 0037 for four plans, which is the defect this document's own note below records for the third time; W34's precedent (derive every row from the header, never from another index) is followed rather than re-argued.


**Three rows were missing when W34 added its own, and all three are added together.** The table
stopped at **0029** while `doc/decisions/` held 0030, 0036 and 0037 — so the index omitted the two
most recent decisions in the repository, including the one answering
[Q12](../open-questions.md), open since P1. Found by
[W34](../work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s conformity reader as a
**third occurrence of a pre-existing omission** rather than as that item's defect. **Each row was
derived from its own ADR's header** — title, `Raised by`, `Date` — and not from any other index
(`doc/workflow.md` section 1 rule 5, including its *any copy, including your own* clause). Adding only
the new row would have left the table wrong by two and made W34 the third item to walk past it, which
is `doc/` being checked by nothing in the one directory whose whole job is to be the record.

**0029 takes an id outside every reserved block, deliberately.** [P5](../plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md)
reserves 0025-0026 and [P6](../plans/p6-what-may-share-a-scheduler-with-a-driver.md) reserves
0027-0028; this decision belongs to neither, because it was forced by an **environment change and an
incident** rather than by a plan. Taking a reserved id would have made a plan's ledger false, and
gaps are free while renumbering is not (`doc/workflow.md` section 3).

**0027 is the first ADR whose index row was written by the item that took the decision.** `doc/workflow.md` v0.7 change 3 put `doc/decisions/**` on section 1 rule 5's record-step list, so W18 needed no declared exception to write this row — which is the fix for exactly the class the paragraph below describes, arriving one item after the paragraph.

**The 0022 and 0023 rows were missing until W16 added them** — both ADRs are dated 2026-08-31 and so
is the backfill, so this index was wrong for a day rather than for long, and it was wrong from the
moment each decision shipped. The file that indexes the decisions is not one of `doc/workflow.md`
section 1 rule 5's record-step files, so nothing obliged P4 to write them and no check noticed.
**A fourth address for the same class**, alongside a false register entry (Q43), a stale ADR table
(Q94) and the sentence ADR 0003 has now had corrected twice.

**W5's three are the first ADRs written after a work item ran real code**, and they divide cleanly:
0013 came from measuring an environment, 0014 from a gate that could not otherwise be written
honestly, and **0015 from a register entry being wrong**. That last one is the pattern worth
carrying: [Q43](../open-questions.md) said *"`regions` already records `{0: arrived, 1: exited}`, so
the information is present"*, and it does not — both policies produce that identical value, which is
what `RN-R6` guarantees. **Two of five conformity-pass findings and now one ADR have come from a
plausible written claim nobody had run.**

**ADR 0013 is the first one decided by measuring the environment rather than by reasoning about the
design.** Every claim in its Context is a command that was run — two registry queries, an import that
throws under one runtime and not the other, and a worker file that the sibling's own reference says
cannot work. Three of the four inputs to the decision contradicted something this repository had
written down: that 0.3.0 was *"not yet on npm"* (both registries have the package, at 0.2.1), that
`@fyflow/scheduler` on JSR was an assumption (it is there), and that a `.ts` worker needs compiling
for Node (it does not). **It is also the first ADR whose Context is mostly about a *sibling*
repository's source**, which is the shape to expect from anything downstream of ladder L6.

**Why 0005-0006 and 0008-0009 are missing.** [P1](../plans/p1-what-satisfies-a-join.md) reserves
**0003-0006**. **0003 was held for Q4's answer from the day P1 was written and is now spent** —
W4's matrix, not an argument. **0004 was allocated by W1**, which reserved 0004-0005; 0005 and 0006
are unallocated, and W2 reserved 0008-0009 and used neither. ADR 0007 did not come from P1's
work items at all — it came from reading `../fyflow-scheduler/RESOURCE_EVENTS_PLAN.md` — so it took
the next number outside the block, which is why it landed before two of P1's own. **W4 reserved
0010-0012 and used none; W5 reserved 0013-0015 and spent all three** — the only item so far to
use its whole ADR block. Gaps are free; renumbering is not
(`doc/workflow.md` section 3).

**The third gating question was settled by evidence, and the evidence changed the answer's
shape.** Q4 was [deferred to P1's spike](../plans/p1-what-satisfies-a-join.md) rather than argued,
and **[ADR 0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) went to the
leaning after all** — live tokens. That is not the interesting part. The matrix found that
arrival-counting fails on **six of nine rows** rather than on the one exotic case P1 predicted, and
that an ordinary `optional` task failing is enough to hang it. **The argument was right about the
winner and wrong about the size of the effect**, which is the clearest thing this repo has yet
recorded about deciding by argument.

**ADR 0001, 0002 and now 0003 all went to the leaning stated in `doc/concept.md` section 6.** That
is worth noticing rather than celebrating: a leaning that always wins is a leaning that was doing
the deciding. **Q4 did not break the pattern — it was supposed to be the check on it, and it
agreed.** What kept the exercise honest was that the spike was built anyway: the two guards
`JP-R7`/`JP-R8`, the losing policy shipped rather than described, and a matrix in which
arrival-counting could have won. The finding that arrival-counting fails on the *ordinary* case is
something no amount of leaning produced. The pattern is now three for three, and the next
still-open decision — [Q24](../open-questions.md) — is where to watch it.

**ADR 0007 was the first one no leaning predicted.** It came from four lines of an upstream document
written for a different consumer — a *constraint* forced it rather than a preference choosing it.

**ADR 0004 came from a verification pass rather than from design.** W1's spec-conformity reader
found that `spec/` said in one document that every settlement routes and in another that a failure
does not - **both readings conformed**, which is the failure `doc/workflow.md` section 7 rule 1
exists to prevent, discovered before either W2 or W3 had written a line against it. It is the second
ADR no leaning predicted, and the first raised by a *reader* rather than by an author. Its `optional`
rule is another argument from the substrate: the library already splits *"the flow handles this"*
from *"a human handles this"*, and this decision adopts that split rather than inventing one.

