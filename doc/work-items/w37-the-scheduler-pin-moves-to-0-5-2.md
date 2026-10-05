# W37 — The scheduler pin moves to 0.5.2, and S9 is fixed upstream

**Status:** done
**Plan:** none — an environment change belongs to no plan
([ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
own precedent, followed by [W36](w36-the-scheduler-pin-moves-to-0-5-1.md) one version ago). Taking a
reserved id would make a plan's ledger false, and P10's retro is still owed.

```
Spec:       spec/README.md rule 6, spec/runtime-targets.md, spec/task-id.md
            section 2, spec/outcome-record.md section 3, spec/join-policy.md
            section 2 - each cites a file and line at the pinned version and each
            is RE-DATED rather than re-decided. No rule changes.
Owns:       package.json, package-lock.json, deno.lock,
            examples/deno-import-map.json, scripts/check-scheduler*.mjs,
            spec/**, AGENTS.md, README.md, doc/concept.md,
            doc/scheduler-upstream.md, doc/decisions/0013, doc/decisions/0029
Inputs:     W36's bump, read from its OWN file; doc/scheduler-upstream.md's S9;
            the upstream 0.5.2 source and AGENTS.md, read from the registries.
Outputs:    Both pins at 0.5.2, from both registries, with D3 comparing them.
            S9 CLOSED - the first item in this register ever raised AND fixed.
            The expired ARGUMENT behind ADR 0013 rule 3 / ADR 0029 corrected:
            Node can now load the published source, so "because Node cannot" is
            no longer why the two-road split exists.
            The lines citing 0.5.1 split into live and historical: 96 tracked
            lines in all, of which 6 are lock entries and 25 are W36's own file,
            leaving 65 citations to classify.
Depends on: nothing
Blocks:     nothing. P10's retro is independent of this.
Tests:      L6 in Node 24 and Deno at 0.5.2; check:scheduler D1-D7 (D7 was
            NOT declared - see the Record); the whole
            gate. Expected values from spec/ and from the upstream source read
            at 0.5.2, NOT from what the run printed.
Gate:       L0 through L6 in both runtimes, then the spec-conformity pass (two
            readers).
Reserves:   Q173-Q175, ADR 0038 (SKIPPED - see decision 1)
```

## What was measured before this was declared

**Nine facts. Eight were clean, one blocked the item for a day, and two changed what got written.**

| fact | measured |
|---|---|
| 0.5.2 exists on both registries | **`latest` on npm AND JSR**, published 2026-09-07 16:33:38 UTC |
| **S9(a) — Node can import the published source** | **YES.** `node --input-type=module -e "import('./index.ts')"` against the JSR 0.5.2 source: `LOADED under node 24.20.0 - exports: 10`. **The defect is gone, not merely the line** |
| **S9(b) — `AGENTS.md` §3** | rewritten, and **version-qualified rather than deleted** — Node >= 22.18 (and 23.6), with `Node < 22.18` named as the range that must still ship `.js`, plus an erasable-syntax caveat naming the exact `import type` trap that caused (a) |
| the source diff is only the fix | **SIX FILES**, and this row said **two**. *(Measured over the four files this item downloaded; the whole diff is JSR's manifest, which W37's conformity reader compared. `doc/workflow.md` section 1 rule 5's writing clause, broken here.)* Four `import type` splits — `core/threadWrapper.ts:5`, `core/workerManager.ts:3`, `core/inlineWrapper.ts:1`, `core/workerWrapper.ts:4` — **`deno.json` gaining `"verbatimModuleSyntax": true`**, and `README.md`'s worker section. **Our report named ONE file. Upstream fixed four and then closed the class with the compiler flag**, which our report had named as the better form without expecting it |
| `core/FyflowScheduler.ts` | **byte-identical** to 0.5.1 — **1851 lines**, the last unterminated, which is why `wc -l` says 1850 and W36's Record says 1851. *(This row said 1850 and the repository then stated two counts for one file it calls identical across three versions. W37's conformity reader.)* Every line `spec/` cites is unmoved and behaviour cannot have changed |
| `AGENTS.md` §6 (Events) | **byte-identical**, so ADR 0007's `user_action` pair is untouched. The diff is 61 changed lines over **six hunks**, and this row said they were *"confined to §3 and one troubleshooting row"* — **two hunks are outside §3**: §4's worker example splits its import, and the §9 troubleshooting table takes **three** rows, not one. W37's conformity reader |
| `SpawnTaskConfig.parents` | still declared at `core/workerInterface.ts:50` and read **nowhere** — `doc/concept.md` section 2's founding fact re-verified at a **third** version |
| the whole gate at 0.5.2, before any document was edited | **`GATE EXIT=0`, zero FAIL lines**, L1 574 in three runtimes, **L6 638 assertions / 31 real runs in BOTH** |
| **the Deno rung** | **BLOCKED for a day** — see below |

## Two facts that changed what got written

**1. Deno refused the pin for 24 hours, and `D3` printed `ok` throughout.**

`deno run` refuses a JSR version published less than 24 hours ago — a supply-chain control, on by
default:

```
error: Could not find version of '@fyflow/scheduler' that matches specified
version constraint '0.5.2'
A newer matching version was found, but it was not used because it was newer
than the specified minimum dependency age
```

**`D3` compares the two pin STRINGS.** Both files said `0.5.2`, so it printed `ok` — while Deno
**could not load it at all**. Its stated premise is *both runtimes reach that same version*; what it
binds is that two files agree about a number.

**That is the third instance in three items of one shape.** [W35](w35-a-map-on-real-workers.md) found
`D6` binding a command's runtime and resolution but not its FILE; [W36](w36-the-scheduler-pin-moves-to-0-5-1.md)
found `D3` binding its inputs but not its PREMISE; this is the declared version bound but not its
REACHABILITY. **The gate did go red** — loudly, on `test:l6:deno` — so nothing was silent; what was
misleading was `check:scheduler` reporting six green rows for a pin one runtime could not fetch.

**Waiting was chosen over `--min-dep-age=0`**, deliberately and by the maintainer: the control was
doing exactly its job, nothing was broken at 0.5.1, and disabling a supply-chain protection to save a
day is a bad trade. The item was parked with the pins moved and resumed after the window.

**2. `deno.lock` had accumulated across two pin moves and nothing noticed.** It carried
`@fyflow/scheduler` at **0.3.0, 0.5.1 and 0.5.2** — two dead trust anchors for versions this
repository no longer pins, one of them left by W36. Regenerated rather than hand-edited: the file now
holds one JSR entry, and **the 0.5.2 integrity hash is byte-identical to the accumulated file's**, so
regenerating dropped dead entries and changed nothing that is trusted. Nothing in the gate reads
`deno.lock`.

## Decisions

**1. No ADR, and ADR 0029 is AMENDED rather than reopened — but the amendment is bigger than W36's.**

W36 moved a version and left ADR 0029 intact, because the decision — *one exact version, from both
registries, `D3` comparing the halves* — did not change. **Here the decision stands and its stated
REASON has expired.** ADR 0013 rule 3 and ADR 0029 both rest on *Node reads npm's `dist/` because it
cannot read the published TypeScript source*. **Node can now read it**, measured above.

The split is kept, on a reason that is now the only one:
[`dist/` is what an npm consumer actually gets](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md),
so running L6 against it tests the published artifact rather than a source tree no consumer resolves;
`D4` and `D5` exist for exactly that. **Switching Node to the source would delete that coverage** to
gain nothing.

This is `CLAUDE.md`'s own standing warning — *a leaning's argument is worth checking before its
conclusion is* — arriving as an upstream fix rather than as a measurement, and it is why the argument
is corrected in place rather than left to be inherited.

**2. `spec/` documents are RE-DATED, not re-decided.** `core/FyflowScheduler.ts` is byte-identical,
so every cited line is unmoved and no rule text changes. Four documents take a version bump for the
re-dating alone, on W36's precedent.

**3. S9 is CLOSED, and the register's summary line changes.** It has read *"eight of nine items are
closed, deferred, or declined; S9 is the only live item, not raised"* since P6. **S9 is now raised
and fixed** — the first item in this register ever to be either.

## Verification

| Clause | How it is run |
|---|---|
| **L0** | `npm run lint`, `npm run typecheck` |
| **L1-L5** | `npm test`, `npm run test:deno`, `npm run test:browser` — must be UNMOVED |
| **L6, both runtimes** | `npm run test:l6`, `npm run test:l6:deno` — must be unmoved at 638 / 31 |
| **the pin itself** | `npm run check:scheduler` D1-D6 and its self-test |
| **the whole gate** | `npm run gate`, written to a log with `echo "GATE EXIT=$?"` appended, and read from that line |
| **conformity** | spec first, code second |
| **adequacy** | mutation in an isolated copy |

**Rule 8, all five obligations, re-run after the readers.** **Obligation (e) is where this item's own
risk is**: the gate was green at 0.5.2 with five `spec/` documents, `AGENTS.md`, `README.md` and
`doc/concept.md` all still saying 0.5.1 — so **nothing checks that the normative layer's cited
version is the pinned one**. `D2` compares `package.json` to `PIN` and stops there.

**And the central risk is W36's, restated because it is the same one.** That item's scope said the
citations split into live and historical, that a blanket replace *"would silently rewrite the evidence
twelve items were decided from"* — and **the split leaked twelve times**, every one a neighbour of a
line changed correctly. **The same lines are here.** 96 tracked lines contain `0.5.1`; **6 are
generated lock entries and 25 are W36's own file** — all historical — leaving **65 citations to
classify**. *(This read "the same 96 lines … plus 25 more in W36's own file", which adds a set to
itself and counts the lock files as citations. W37's conformity reader.)*

## Record

**Gate — what ran.** Baseline `5a8becd`.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **pass** | `deno lint` 45 files, both `tsc` projects clean |
| L1-L5 | **pass** | **21 file(s) / 574 assertions** in node, deno and chromium — **unmoved**, which is the declared result |
| L6 node | **pass** | **638 assertions / 31 real runs on fyflow-scheduler 0.5.2** |
| L6 deno | **pass** | **638 assertions**, deno 2.9.6 — identical. **Blocked for a day first**; see below |
| `check:scheduler` | **pass** | **D1-D7**, from D1-D6 |
| its self-test | **pass** | **32 probes / 29 gradings**, from 26 / 27. Three of the eight new probes are the readers': one per `D7` site the adequacy reader added, because dropping a site with no probe cost **0** |
| whole gate | **pass** | `GATE EXIT=0`, zero FAIL lines, 19 entries |
| conformity reader | **ran** | **20 findings, 9 blocking**, all acted on |
| adequacy reader | **ran** | **46 mutations, 22 survivors, 6 blocking**, all acted on |
| re-run after the readers | **ran** | the readers' own edits checked back in; see below |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| both pins at 0.5.2, `D3` comparing them | `package.json`, `examples/deno-import-map.json`, `PIN` | probes a1, a2 — 1 failure each |
| **S9 closed** | `doc/scheduler-upstream.md`, summary + row + a closure block at the section head | — |
| the expired ARGUMENT corrected | ADR 0013 rule 2's note, ADR 0029's *"what is unchanged"* | — |
| the citations split live/historical | **18 tracked files carry a 0.5.1 → 0.5.2 edit; 16 still contain 0.5.1** as record | `C8` caught four stale version cells by name. *(This row said "10 documents moved, 6 left as record" and stated no predicate — no reading reproduces it. W37's conformity reader.)* |
| **`D7`** — not declared in advance | `scripts/check-scheduler.mjs` | probes a3, a4, b1, b2, d1 |

**What reverting the pin costs**, measured against the final state. `package.json` alone → **1**
(`D2`). The import map alone → **1** (`D3`). **`PIN` itself → 8**: `D2` twice (the installed version
*and* the manifest's declared spec), `D3` once, and `D7` on **all five** documents. *(This row said
**3** and enumerated `D2` and `D7`-on-two. W37's adequacy reader measured **5** against `D7`'s
two-site form and named the two clauses the row omitted; it is 8 now that `D7` binds five. The
direction was safe — the true cost was higher than claimed — and the row named its failing clauses
and got two of three wrong.)* **Before `D7`, moving the pin and leaving the documents cost 0.**

**Rule 8 — 22 provocations, 20 caught, 2 declared ceilings, 0 survivors standing, 0 aborted**, graded
on the failure lines. The author's 14 — obligations (a) 5, (b) 2, (c) 3, (d) 3, (e) 1 — plus the
adequacy reader's eight own mutations checked back in, **all eight caught**, including its control
(a correct pin reworded) which must cost 0 and does.

**The re-run earned its place twice.** **Six probes went inert at once** when `D7` was rewritten to
capture-and-compare — every anchor named the `includes` form — which is rule 7 (b) at a scale this
repository has not seen before, and they were re-pointed at the new expressions rather than re-pinned
to a spelling. And **one probe SURVIVED the re-run**: dropping one of the three sites the adequacy
reader added cost **0**, because only the first two had probes. *The reader's fix created a bound
nobody was watching*, and the answer is one probe per site.

**What broke.**

**1. Deno refused the pin for 24 hours, and every check said `ok`.** `deno run` blocks a JSR version
published less than 24 hours ago — a supply-chain control, on by default. Both pins said `0.5.2`, so
`D3` compared two strings, found them equal and printed `ok` for a pin one runtime **could not
fetch**. Its stated premise is *both runtimes reach that same version*.

**That is the third instance in three items of one shape**: W35 found `D6` binding a command's
runtime and resolution but not its FILE; W36 found `D3` binding its inputs but not its PREMISE; this
is the declared version bound but not its REACHABILITY. **Nothing was silent** — the gate went red on
`test:l6:deno` — and what was misleading was six green rows above it. [Q173](../questions/q173.md).

**Waiting was chosen over `--min-dep-age=0`, by the maintainer.** The control was doing its job,
nothing was broken at 0.5.1, and disabling a supply-chain protection to save a day is a bad trade.
The item was parked with the pins moved and resumed after the window opened.

**2. The whole gate was GREEN at 0.5.2 with ELEVEN documents naming 0.5.1.** Before a single document
was edited: `package.json`, the import map and `PIN` at 0.5.2, `GATE EXIT=0`, zero FAIL lines — while
`spec/README.md` rule 6 said *"the version we pin"* was 0.5.1, `AGENTS.md` said *"Pin the scheduler at
0.5.1"*, and nine more documents cited 0.5.1 as current. *(This said **six**, and the Verification
section above it said **eight**, and both propagated. Measured at `5a8becd`: eleven documents carry a
present-tense statement or citation of the pin — the four other `spec/` documents, `README.md`,
`doc/concept.md`, `doc/README.md`, `CLAUDE.md` and `examples/README.md`. W37's conformity reader,
and `doc/workflow.md` section 1 rule 5's writing clause a third time in this item.)* **`D2` compares the manifest to
`PIN` and stops at the manifest.** Nothing carried the pin into the layer that tells a consumer what
to install. **`D7` is this item's answer** and it was not in the declaration.

**3. `deno.lock` had accumulated across two pin moves.** Three `@fyflow/scheduler` entries — 0.3.0,
0.5.1, 0.5.2 — two of them dead trust anchors, one left by W36. Nothing in the gate opens that file.
Regenerated rather than hand-edited; the 0.5.2 integrity hash is byte-identical, so the cleanup
dropped dead entries and changed nothing trusted. [Q174](../questions/q174.md).

**4. I reproduced W36's own central defect within the hour.** Its Record says the live/historical
split *"leaked twelve times, every one a NEIGHBOUR of a line changed correctly"*. Correcting
`CLAUDE.md`'s S9 sentence, I replaced the clause up to a comma and left `and it is ready to raise.`
stranded on the next line — a sentence that then said the opposite of the one before it. **Found by
re-reading the file rather than by any check**, which is the whole of why that risk is restated in
this item's Verification section and still was not enough.

**5. A provenance probe could not be graded against a correct implementation.** `D7` reading the
literal `0.5.2` instead of `${PIN}` survives, because today the two are the same string — W34's
finding restated. The **compound** probe discriminates: swap the source **and** move `PIN`, and only
the site still reading `PIN` reports. Its negative control sits on the same expression: unmutated
with `PIN` moved, **both** sites report.


## The readers — 66 findings between them, 15 blocking, and both hit the same two things

**They agreed on nothing and converged on one sentence**: *this item states facts it measured on a
subset, and builds checks that bind the shape of a document rather than its state.*

### The conformity reader — 20 findings, 9 blocking

**Its first finding is the item's own headline and it was FALSE.** *"The whole source diff is two
`import type` lines"* — measured over the four files this item happened to download, written as a
claim about the whole diff, and propagated into **eight documents including four normative ones**.
JSR's manifests say **six of sixteen files differ**: four `import type` splits (not two),
`deno.json` gaining **`verbatimModuleSyntax: true`**, and `README.md`. **The real story is better
than the one that was written** — upstream fixed three files our report never named and then closed
the class with the compiler flag our own report had called the better form. `doc/workflow.md` section
1 rule 5's writing clause, broken in an item whose Record cites it.

**Four more were the live/historical split leaking, which is this item's declared central risk.**
`doc/scheduler-upstream.md`'s header re-dated the version two words before a clause asserting
`core/threadWrapper.ts` is byte-identical to 0.3.0 — false at every version, and now false about
**the file this item exists to record**. `CLAUDE.md` stated the pin as 0.5.1 in two live places, one
of them the *same sentence* as a correct edit. `doc/concept.md` carried 0.5.1's publish date under
0.5.2's version — **in the sentence W36's conformity reader had corrected for exactly that**. And
Q51's header moved while its answer stayed.

**Two were claims about the fix that the fix falsified.** `AGENTS.md` still told a consumer the
upstream reference is *stale* about `.ts` workers — in the paragraph directly above the sentence `D7`
was built around — and ADR 0013's **finding 3**, the one S9(b) actually expired, was the one the
`Outputs` row named and the one left untouched while finding 2 got the annotation.

**And two were absences rather than errors.** The Record gave rule 8 as **counts** where section 5
rule 8 asks for *an edit precise enough to re-run* — W32-W36 each shipped a table and this shipped a
total. And it contained **no `Owns` audit at all**: two undeclared edits (`examples/l6.ts`,
`examples/README.md`), where W36 reported *zero undeclared* and W35 reported five. **No claim is worse
than a wrong one**, and the cause is stated above: a bump's `Owns` is a file set, and what actually
spread was a retracted fact, whose `Owns` is a citation set.

### The adequacy reader — 46 mutations, 22 survivors, 6 blocking

**`D7` bound the presence of a sentence, not the state of a document — and failed at the exact defect
it was built for.** It was `text.includes(phrase)`: it asked *does the right sentence appear* and
never *does a wrong one*. Measured, all at **cost 0**:

- `Pin the scheduler at 0.5.2.` followed by `Pin the scheduler at 0.5.1.` in one paragraph — **the
  leftover neighbour**, which is the risk this item names and the defect it admits reproducing;
- the live statement saying 0.5.1 with the right phrase supplied from an **HTML comment or a fenced
  code block** — and a historical parenthetical quoting the old sentence verbatim is the *likely*
  edit at the next bump, not an adversarial one;
- three more documents that STATE the pin — `README.md`, `doc/concept.md`, `examples/README.md` —
  which `D7` did not bind and which [Q175](../questions/q175.md) had miscalled *citations*.

And it **failed** when a correct statement was reworded (a comma to an em dash). *Green when the pin
was wrong, red when it was right.* Rewritten to **capture and compare**: each site declares a pattern
with the version captured, there must be at least one match, and every captured version must equal
`PIN`. Five sites. The consequence is a stated constraint — **the pin-statement grammar is reserved
for the live statement** — and the failure message says so.

**Two more were bounds that could be lowered in the file they bound.** `mustProduce: null` was a
silent opt-out from the `UNCITED` content bound: two tokens dropped an exempt probe out of it for 0,
with the negative control on the same expression costing 1. Closed, and **the guard's first version
fired on every cited probe** — `must` is `undefined` for those too — which the file caught on its
first run.

**One is NOT closed and is stated rather than papered over.** Deleting a probe, deleting its
`UNCITED` exemption and decrementing `MIN_PROBES` is **three edits in one commit for 0 failures**.
A site-level coverage bound would need its own exemption list for the clauses no probe can reach, and
that list would live in the same file — which is
[W31](w31-the-self-list-check-policies-never-had.md)'s finding: *the regress does not move one list
further out; it stops at the first thing that can return early.* What was added is the **id-level**
bound, which closes the case the floor cannot see at all — a check whose **last** probe leaves while
the floor is satisfied by another id gaining one. The remainder is a reviewer's.

**And it corrected a number in the direction that flatters nobody.** The Record said reverting `PIN`
costs **3** and named the failing clauses; the reader measured **5** and named the two the row
omitted (`D2` fires twice, and `D3` fires as well). With `D7` now binding five documents it is **8**.

**Re-run after the readers.** All six of the adequacy reader's `D7` mutations are caught by the
rewrite, and the control — a correct pin reworded around — still costs **0**. Its `mustProduce`
mutation is caught. `check-scheduler`'s self-test is **29 probes / 29 gradings**, from 26 / 27 at the
author pass, and **its `ALL_CHECKS` coverage bound caught the rewrite itself**: changing `D7`'s
message left the `META` anchor matching nothing, and the file reported *a check id with no grading at
all* rather than passing. Rule 7 (b), caught by the one bound here a floor edit cannot satisfy.

**What this taught.**

**An upstream fix can expire a decision's ARGUMENT while leaving the decision right, and nothing in a
repository notices that.** `CLAUDE.md`'s standing warning is that *a leaning's argument is worth
checking before its conclusion is* — here it arrived not as a measurement but as somebody else fixing
the thing the argument rested on. Node **can** now load the published source; the two-road split
stays, because `dist/` is what an npm consumer gets and L6 should test the published artifact. **An
agent inheriting *"Node cannot load the source"* would design around a constraint that no longer
exists**, which is why both ADRs are corrected in place rather than left to be read.

**And the register's whole record is now: eight settled without asking, one raised, one fixed.** S9
was the only item this repository has ever raised upstream, and it was fixed the same day — both
halves, plus a second instance of the first that our report had not found. That is a fact about how
much of the list was worth raising rather than about how responsive upstream is.

**Questions raised.** [Q173](../questions/q173.md), [Q174](../questions/q174.md),
[Q175](../questions/q175.md).
