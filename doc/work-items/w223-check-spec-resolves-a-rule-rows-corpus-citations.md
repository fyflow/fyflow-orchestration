# W223 — `check:spec` resolves every corpus file a rule row cites, with its self-test probes

**Status:** done 2026-10-25 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; no exception, no ADR, no question raised. Earlier: declared 2026-10-25 on `b7f9031`, P45's THIRD item, ISSUED by (h1) (the maintainer,
2026-10-25, *as recommended*); serial after W221, before W222; this file written from the plan's row BEFORE any other edit
**Plan:** [P45](../plans/p45-what-a-comparison-may-compare-against-and-who-may-read-a-key-path.md) — stop-and-ask (h),
answered (h1); the defect is [P44](../plans/p44-what-a-join-hands-on-and-how-a-key-path-reaches-into-it.md)'s retro (a),
W216's adequacy reader's S1: *the renamed FD-V40 file's OLD name restored in its row, every check green*.

```
Spec:       none — this item is a check over spec/, not a change to it. What it reads is the citation spelling the
            rule rows of spec/*.md already use (measured below, M1-M4).
Owns:       from P45's W223 row, exactly: scripts/check-spec.mjs; scripts/check-spec-selftest.mjs; this file.
            Exceptions: the record step's four files (the plan's Record, README.md, doc/questions/**,
            doc/decisions/**) and nothing else. Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P45 (h1); P44 retro (a); W216's adequacy S1; the rule rows of spec/*.md at b7f9031 (W221 left FD-V42 and
            FD-V43 rows citing three new invalid files).
Outputs:    (1) C9 in scripts/check-spec.mjs — every corpus file a RULE-DECLARING row cites resolves, the failure
                naming the rule, the citation and the path it was resolved against; a C9 row in the report. After the
                readers: a DIRECTORY span (RN-R2's `spec/examples/valid/`) resolved too, and a SECOND fail() site
                refusing a corpus spelling C9 cannot resolve (`invalid/X.flow.json`, `./spec/examples/…`).
            (2) its probes and META entries in scripts/check-spec-selftest.mjs, one probe per citation SHAPE and one
                META entry per fail() site and per branch a reader showed deletable; an optional `expect` on a probe
                (its failure LINE) and the `misworded` outcome that grades it; MIN_PROBES / MIN_META ratcheted to the
                counts shipped (44 / 42); the header's fail()-site census RE-TAKEN (34).
Depends on: W221 (done)
Blocks:     W222
Tests:      the self-test probes ARE the tests (workflow section 5 rule 7): each builds a spec/ copy with one citation
            that does not resolve and declares exactly {C9}; each META entry disables one C9 fail() site and names the
            probe that must then go uncaught. Expected verdicts from this file's M1-M4, never from a run.
Gate:       gate:item (workflow v0.29: this item edits no check-register*, state.mjs or doc/questions/README.md; the
            plan row names gate:item; it carries check:spec:selftest). Before it: npm run gate on a draft; both
            readers; rule 8 on their findings with a no-op control.
Reserves:   Q797-Q798 (P45's per-item block); no ADR (P45 reserves none for W223)
```

## Measured before writing a line of the check (on `b7f9031`, read-only)

| | the measurement | the number |
|---|---|---|
| M1 | rule-declaring rows (`RULE_ROW`'s shape) across `spec/*.md` | **155**, of which **27** cite a `.flow.json` |
| M2 | citation spellings inside those rows, as code spans | **full** `spec/examples/<dir>/<name>` (27, every one resolving, `registry.json` among them) · **bare after a full** `<name>.flow.json` following a full `.flow.json` citation in the same row — the *"Cases: `spec/examples/invalid/A`, `B`, `C`"* spelling (14) · **bare alone** with no full citation before it in the row (6: `FD-C1` ×2, `FD-C3`, `FD-C4`, `FD-R3`, `RN-R13` — every one a `spec/examples/valid/` file) · **non-corpus** `.json` (21, all in `runtime-targets.md`'s `RT-R` rows: `deno.json`, `tsconfig.*.json`, `package.json` — not corpus citations, not read) |
| M3 | citations that do NOT resolve today | **ONE**: `FD-V40`'s `FD-V40--gate-key-path-with-an-index.flow.json`, written *"(until v0.53 `…`, `files[0].series`, which v0.53 accepts)"* — a FORMER name, true as history. Every other rule-row citation resolves, W221's three new invalid files included |
| M4 | outside rule rows (prose, the corpus table), out of the plan row's scope | 10 full `spec/examples/` `.json` paths (all resolve); 76 bare names (predicate: a code span matching `` `[^`\n]*\.json` `` whose content matches `^[\w.-]+\.flow\.json$` — the conformity reader got 78 and 79 under two other predicates, which is P27 decision 4's argument), mixing `spec/examples/**` and `examples/flows/**` with no directory to tell them apart — **not read**, named for the retro |

## Scope

**In**

1. **`C9`**: in every row `RULE_ROW` declares (all nine prefixes — the plan row says *refusal row*; the wider predicate
   is taken because an `FD-C`/`FD-R`/`RN-R` row's citation goes stale the same way and narrowing to `FD-V` would be a
   reason-free exclusion — a minor stop-and-ask, the recommended option, recorded), each code span that is a corpus
   citation is resolved: a **full** `spec/examples/…` path against the spec root; a **bare** `<name>.flow.json` against
   the directory of the nearest full `.flow.json` citation before it in the same row, and where there is none, against
   the corpus directories (`valid/`, `invalid/`, `wiring/`) — resolving if any one holds it.
2. **A former name is not a citation**: a span immediately preceded by `until vN.N` is the history of a rename and is
   not resolved — the one shape M3 found, and the narrowest marker that admits it.
3. The probes: one per citation shape (full; bare after a full — W216 S1's own shape, the OLD name restored where no
   `until` marks it; bare alone; the FILE deleted rather than the citation edited), plus the former-name marker removed;
   one META entry per new `fail()` site; the floors ratcheted.

**Out** — named rather than left implicit

- Prose and the section 7 corpus table (M4) — the plan row says *a refusal row*; a check over the 76 bare prose names
  would have to tell `examples/flows/` from `spec/examples/` with no directory written. Named for P45's retro.
- Whether a former name is really gone — a span marked `until vN.N` is not resolved either way.
- A bare corpus `.json` that is not `.flow.json` (`registry.json` sits in two corpus directories) — none occurs in a rule
  row; C9 does not read it.
- A bare name with no full citation before it resolves if ANY corpus directory holds it, so an `FD-C` row citing an
  `invalid/` case where it meant a `valid/` one passes (conformity NIT 4; a stated choice of Scope 1).
- Any edit to `spec/`: FD-V40's former name is true history and stays.

## Verification

- `npm run check:spec` green on the tree, C9 reporting the citations it resolved; `npm run check:spec:selftest` every
  probe caught and every META entry graded by its named probe.
- Routing (Q4, Q17, Q10, Q13, Q6): not applicable — no `src/` or flow behaviour moves.
- `npm run gate` on the draft; the two readers in worktrees under `C:/tmp-w223`; then `npm run gate:item` once, tree
  still.

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `check:spec` on the tree | RAN — EXIT 0 | C9 resolved **47** corpus citations in rule rows (46 before the readers; +1 RN-R2's directory) and skipped **1** former name — M3's |
| W216 S1, by hand | RAN — RED as wanted | a copy of `spec/` with FD-V40's full citation renamed back to `…-with-an-index.flow.json`: `check:spec` EXIT 1, `C9` alone, the line naming FD-V40, the citation and `spec/examples/invalid/…` — the reader's exact edit, green before this item (P44 retro (a)) |
| `check:spec:selftest` (draft) | RAN — EXIT 0 | 37/37 probes, 34/34 META graded. Its first run was RED at 35/37: `invalid/` removed and `registry.json` removed each now trip `C9` too — declared as cascades (`also: ['C9']`), measured not predicted |
| `npm run gate` (draft, before the readers) | RAN — EXIT 0 | the ladder; L6 2883 assertions, 0 failed |
| conformity reader (`C:/tmp-w223/rc`) | RAN | no BLOCKER; its independent census reproduces M1-M3 and the 46/1 note. SHOULD 1 (the self-test header's census never re-taken) — FIXED, re-taken: 34 sites. NIT 2 (a DIRECTORY citation, RN-R2, unread) — FIXED, resolved and probed. NIT 3 (partial spellings unread) — FIXED with the adequacy reader's 7. NIT 4 — declared in Out. NIT 5 (scope widened by the item) — carried here and for P45's retro. NIT 6 (M4's 76 not reproduced) — the predicate stated in M4 |
| adequacy reader (`C:/tmp-w223/ra`) | RAN | 15 mutations: 7 killed, **5 survived** (A1/A2 scope narrowed, A3/A4/A5 the row directory, A7b the marker's word) plus A9/A10 (message, note). Findings 1-4, 7 FIXED: one probe each (RN-R13 in `run-state.md`; `since v0.53`; nearest-not-first; a stray flow beside `registry.json`; a missing full citation, graded by COUNT 2 -> 1; a partial path) and one META entry per survivor re-introducing it; finding 4 by `expect` on the W216 S1 probe and the `misworded` outcome. Finding 5 (A6b) and 6 (A10) DECLARED below; 8 = conformity SHOULD 1 |
| rule 8 on the fixes | RAN — EXIT 0 | `check:spec:selftest` **44/44 probes caught, 42/42 META graded — 40 by the named probe, 2 by the failure COUNT**; every reader survivor is now a META entry graded NOTICED, and the no-op CONTROL (an unmutated copy) graded NOT noticed (`outcome caught`) with its guard case |
| `npm run gate:item`, the confirming gate | RAN — **EXIT 0**, one command, tree still | L1-L5 106 files / 2321 cases in node 24.20.0, deno 2.9.6 and chromium; L6 2883 assertions, 0 failed, in node and deno; selftests 10/10 ok, 1199.2 s wall, `check:register:selftest` left out by `--without`; `check:spec:selftest` 44/44 probes, 42/42 graded (357.7 s in its lane). The Record's edits after it are this file's alone |

**The readers' overlap: 3** shared subjects — the stale header census (conformity SHOULD 1, adequacy 8), the partial
spellings C9 skipped (conformity NIT 3, adequacy 7), and the bare-alone fallback accepting any corpus directory
(conformity NIT 4, adequacy 5). Their briefs were written differently: conformity was asked to census, adequacy to mutate.

**The confirming gate is `gate:item`**, not `gate:full`: workflow v0.29 names `gate:full` for the plan's last item (W222)
and for an item editing `scripts/check-register*.mjs`, `scripts/state.mjs` or `doc/questions/README.md`; this item edits
none of them, and P45's W223 row and (h1) name `gate:item`, which carries `check:spec:selftest`.

**Declared survivors, BY ID** (workflow section 5 rule 8's dated ceiling, 2026-10-25): **A6b** — the bare-alone fallback
narrowed to `valid/`: the mutant can only ADD failures, and the harness grades a count only downward; killed today only
by `MAX_CORPUS` compounded with a META entry. **A10** — the note's counts, unasserted like every `note:` line in this
check. **A2** has no META entry of its own: the RN-R13 probe that kills A1 is the one that distinguishes it (the reader's
D1).

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) C9, both fail() sites, the report row | yes | the 13 C9 probes; the META entries *C9`s fail() site disabled* and *partial-spelling fail() site disabled* |
| (1) the failure line's content | yes | the W216 S1 probe's `expect`; META *failure line no longer names…* graded `misworded` |
| (2) probes, META entries, floors, census | yes | `MIN_PROBES` 44 / `MIN_META` 42 refuse a shorter list; the per-id coverage bound refuses a C9 with no META entry |

**What broke.** The first cut read *a refusal row's corpus citation* as three spellings and missed a fourth (a directory)
and a fifth (a partial path) that a rule row could carry — the readers' constructions, not their mutations, found both.
Five of the first cut's branches were deletable for zero: every probe edited one document and one row shape.

**What this taught.** Nothing for `doc/workflow.md`. For P45's retro: (a) the scope was WIDENED by this item (all nine
prefixes, not refusal rows) under a minor stop-and-ask — the maintainer has not seen it; (b) prose citations of the
corpus (M4) stay unread; (c) the self-test's header census had been stale since W61 and nothing reads it.

**Questions raised.** None; Q797-Q798 unused.
