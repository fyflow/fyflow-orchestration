# W118 — Every question link points at its question, and the live instructions follow

**Status:** in review
**Plan:** [P28](../plans/p28-what-can-be-looked-up-instead-of-read.md)

```
Spec:       none — P28 stop-and-ask (a), answered by the maintainer: rewrite
Owns:       every file that carries a link whose text is a Q id and whose target is
            open-questions.md — 3,616 links in 260 files at aa43cb3, re-counted at the start of
            the work; and the live instructions: CLAUDE.md, doc/workflow.md,
            doc/work-items/TEMPLATE.md, doc/README.md, this file
Inputs:     the tree after W116, W117, W119 and W120
Outputs:    (1) every `[Q<N>](<prefix>open-questions.md)` rewritten to
                `[Q<N>](<prefix>questions/q<N>.md)`, prefix preserved; text untouched
            (2) section 1 rule 5 of doc/workflow.md: the record step's register file is
                `doc/questions/**`
            (3) CLAUDE.md's register paragraph: questions are files, looked up with `npm run q`
                and `--fields` to print only what is needed; `icebox` is hidden unless asked
                for; the glossary named once
            (4) the work-item template's *Questions raised* line names `doc/questions/`
Depends on: W116, W117, W119, W120
Blocks:     nothing
Tests:      after the rewrite, a scan for any link whose text is a Q id and whose target is
            open-questions.md returns zero; M1 resolves every rewritten link; a control link
            pointed at a question file that does not exist is caught by M1
Gate:       L0-L6 via gate:full; check:budget; one conformity reader over the diff
Reserves:   Q502-Q504
```

**Exceptions** — every file edited outside `Owns` and outside section 1 rule 5's record step, named
before the first edit (`doc/workflow.md` section 7 rule 2):

| file | why |
|---|---|
| — | **none.** Every file the item edits carries a Q link, or is named in `Owns`. One edit is in `Owns` by file and outside *Outputs* by kind, so it is named here: `scripts/check-markdown-selftest.mjs`'s probe *a dead link in AGENTS.md* anchors on `'](doc/open-questions.md)'`, and after the rewrite `AGENTS.md` carries none, so rule 7 (b) would go red. It is re-anchored on `'](doc/questions/q'`, the shape of a register link, which keeps it a register-link probe (stop-and-ask 3). *(This row first named `q121.md`, the question the probe cites, but `AGENTS.md` carries no link to Q121. Corrected before that edit was made.)* |

**Stop-and-asks, answered by the maintainer on 2026-10-05, before the first edit.** Each was priced in
staged copies under `dev-dist/w118-27644/`.

| | the question | answer |
|---|---|---|
| 1 | `spec/`: 243 links in 7 files. Rewrite targets here, or in a separate spec change? | **rewrite here**: targets only, no wording changed. `check-spec` output byte-identical in the staged copies |
| 2 | `src/` (comments), `AGENTS.md`, `examples/`: in scope? | **in scope**; `typecheck`, `check:docs`, `check:source` and L6 inside `gate:full` show the product did not move |
| 3 | a self-test probe anchored on a link this item rewrites | **re-anchor it**. A scan of 5,977 self-test string literals found exactly one, the probe in *Exceptions* |
| 4 | `M3`-`M6` floors | **no question**: measured to stay put. `sources` is counted before the dead-link `continue`, so a dead Q link in a `removes` fixture keeps its document in `M4` |
| 5 | the always-read budget | **no question**: the rewrite never lengthens a link for ids below 1000 |
| 6 | `Owns`: one template or both? | **this declaration is right**. `doc/plans/TEMPLATE.md` names no register path, so P28's *both* has no subject |
| — | **Q168 and Q169 have no question file**: an issued-never gap that P11, P12 and P13 cite in 8 links | **the reference is removed**: the link markup goes, and the id stays as plain text. No file is invented |

## Scope

**In**

1. The rewrite, by a script under `dev-dist/w118-rewrite/` that **reads and writes bytes** — Q123:
   a text-mode write on Windows turns the file CRLF. `git ls-files --eol` shows `i/lf` for every
   file after.
2. Only link TEXT matching a Q id, bold or plain, is rewritten. **Any other link into the register
   is left alone and lands on the pointer**, which is why the pointer stays.
3. The live instructions. **`doc/workflow.md` has 60 bytes of headroom at `aa43cb3`**; every edit to
   it is measured, and if rule 5's new wording does not fit, the item cuts in the same file rather
   than asking `check:budget` for room.

**Out**

- Historical prose that names `doc/open-questions.md` as text — P28 *Out*. *W113 cut
  `doc/open-questions.md`* stays true of its day.
- `dev-dist/`, `node_modules/`, `.git/`.
- **Links inside a question's FRONT MATTER** — added after W116's conformity reader. Four cells
  copied verbatim carry links written relative to the old register (`](#live)` in q481, q490 and
  q492; `](decisions/0077-…)` in q466). Rewriting them breaks W116's verbatim round-trip, and
  `check-markdown` skips front matter (ADR 0079), so nothing checks them either way. They stay as
  copied; the scan in *Tests* excludes front matter and says so.

## Verification

- The zero-match scan, the before-and-after link counts, and `git ls-files --eol`.
- `npm run check:markdown` and `npm run check:budget`, each by exit code.
- `npm run gate:full` once, on the final tree.
- *Routing cases: not applicable.*

## Record

**The count, re-taken at the start on `880221b`.** Predicate:
`git grep -hoE '\[\*{0,2}Q[0-9]+\*{0,2}\]\([^)]*open-questions\.md[^)]*\)'` over tracked files.
**3,602 links in 260 files**: `doc/` 170 files / 2,770; `spec/` 7 / 243; `scripts/` 19 / 193;
`examples/` 11 / 149; `test/` 37 / 108; `src/` 14 / 84; `AGENTS.md` 49; `CLAUDE.md` 6. No link carried an
anchor. *The declaration's 3,616 is `aa43cb3`'s figure, a different tree. It is not re-derived
here.* Target prefixes: `../` 2,727, `../doc/` 579, `../../doc/` 198, `doc/` 55, none 43.

**What ran.** The rewrite is `dev-dist/w118-27644/rewrite.mjs`, not *Scope*'s `w118-rewrite/`,
because a scratch path carries its process (ADR 0072). It decodes each file as latin1, which maps
one byte to one code unit and back, and writes bytes. **3,594 links in 260 files.** It rewrote no
link whose id has no question file. **The 8 such links, Q168 ×4 and Q169 ×4 in P11 (4), P12 (2)
and P13 (2), were unlinked BY HAND before it ran**, by the maintainer's answer above. The id stays
as plain text and each sentence is unchanged.

**Gate — what ran.** Every verdict is the command's exit code (`cmd > log 2>&1; echo EXIT=$?`).

| Clause | Verdict | Notes |
|---|---|---|
| (a) the zero-match scan | **RAN** | the predicate above returns **0**, and so does the observer's |
| (b) per-file counts, independent observer | **RAN** | `dev-dist/w118-27644/observe.sh`, which uses `git grep` over the working tree, not the rewrite's walk. Q-texted links of any target **3,627 -> 3,619**; into `open-questions.md` **3,602 -> 0**; into `questions/q<N>.md` with text id = target id **20 -> 3,614**; mismatched **0 -> 0**. Per file, *any* is equal and *matching* = before's *matching* + *into the register*, in every file **except P11, P12 and P13, by exactly −4, −2 and −2**, the unlinked ids |
| (c) `refs-count` for every question | **RAN, byte-identical** | `npm run q -- --fields id,refs-count --where status~e --include-icebox --format json`, 393 records, before and after `cmp` equal: no rewrite touched text |
| (d) line endings | **RAN** | every changed file is `i/lf w/lf`, and **0** CR bytes in every one of them |
| (e) control | **RAN** | `dev-dist/w118-27644/control.sh`: `spec/task-id.md`'s first question link (`q86`) pointed at `q99999.md` made `check:markdown` **EXIT 1** with exactly one failure, `M1: spec/task-id.md links to ../doc/questions/q99999.md, which does not exist`. Restored, sha256 equal, **EXIT 0** |
| `check:markdown`, `check:budget`, `check:spec`, `check:register`, `check:source`, `check:wiring`, `check:policies`, `check:scheduler`, `check:workers`, `lint` | **RAN, EXIT 0 each**, alone | `check:markdown` reads 592 documents / **5,255** links (5,263 − 8 unlinked) / 194 sources / 83 anchored |
| `typecheck`, `check:docs` | **RAN, EXIT 0 each** | the product did not move. Of `AGENTS.md`'s 49 links, 3 sit in comments in an executed snippet |
| `check:markdown:selftest`, the re-anchored probe's file, alone | **RAN, EXIT 0** | 42/42 probes caught, 7/7 META bounded, 371 s. Before re-anchoring, the old anchor `](doc/open-questions.md)` matched **0** times in `AGENTS.md`. The new one, `](doc/questions/q`, matches 47 lines |
| `gate:full` | **RAN ONCE, EXIT 0**, 1,519 s | on the final tree, with `git diff`'s sha256 taken before and compared after: unchanged. The ladder includes both L6 runtimes, and the selftests were **11/11 ok**, 1,359 s wall over 10 lanes. *This row is the only edit made after the gate. It is a doc-only line in this file; `check:markdown` was re-run on it below* |
| conformity reader | **NOT RUN** | a separate fresh agent, afterwards |

**The floors, measured in staged copies** (`dev-dist/w118-27644/floors.sh`: documents / links /
sources / anchored, and the failing set). The *before* copy is `git archive 880221b`. *After* is
the same copy with the rewrite, before the hand edits. *Final* is the working tree that ships.

| fixture | before | after | final |
|---|---|---|---|
| whole tree | 592 / 5,263 / 194 / 83, green | same, green | 592 / 5,255 / 194 / 83, green |
| probe 1, `doc/decisions` + `doc/questions` cut | 147 / 4,630 / 145 / 76, `{M1,M3}` | same, `{M1,M3}` | 147 / 4,622 / 145 / 76, `{M1,M3}` |
| probe 2, + `doc/plans` | 118 / 3,142 / 117 / 56, `{M1,M3,M4,M5}` | same | same |
| `M5`'s probe | 592 / 5,263 / 194 / **68**, `{M5}` | same | 592 / 5,255 / 194 / 68, `{M5}` |

**No floor moves and no ADR is needed.** Only the *number* of `M1` failures in the two `removes`
fixtures changes: probe 1 570 -> 3,317 and probe 2 727 -> 2,504, because a Q link into a cut
`doc/questions` is now dead. The failing SET is what the probes grade, and it is unchanged. P28
**prediction 3 held**: `check:markdown` stayed green.

**The always-read set shrank by 97 bytes**: `CLAUDE.md` 23,754 -> **23,667**, `doc/workflow.md`
35,780 -> **35,771**, `doc/concept.md` 17,125 -> **17,124**, a total of 76,659 -> **76,562**. The
first draft of Output (3) took `CLAUDE.md` to 23,856 and the set to +92. It was cut in the same
file until the set no longer grew. P28 **prediction 4 held**, and the rewrite alone is
length-neutral or shorter for every id below 1000.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the rewrite | yes, 3,594 links | the zero-match scan (a) returns 3,594, and control (e)'s subject is gone |
| (2) workflow.md rule 5 names `doc/questions/**` | yes. Section 3's id table also reads `doc/questions/q1.md` | the withdrawn-claim grep below |
| (3) CLAUDE.md's register paragraph | yes: files, `npm run q`, `--fields`, `--where`, `--search`, `npm run refs`, `icebox` hidden unless asked for, the glossary once with `npm run term -- probe`. The record-step list and *Writing documents* name `doc/questions/` | the same grep. Every command it names was run: `q -- Q17`, `--fields`, `--where status=open`, `--search`, `--include-icebox`, `refs -- Q17` and `term -- probe`, each EXIT 0. *The first draft's `term -- floor` exited 1 and was replaced* |
| (4) the template's *Questions raised* line | yes, as code text. *A LINK there would close `M6`'s gap in probe 2, which the template's own note says* | the same grep |

**`git diff --name-only` against `Owns`**: 262 files changed. `Owns` is the 260 link-carrying files at
`880221b` plus `CLAUDE.md`, `doc/workflow.md`, `doc/work-items/TEMPLATE.md`, `doc/README.md` and
this file, 262 distinct. **The two sets are equal**: no file outside `Owns`, no file in it
untouched, nothing untracked. The record step touched nothing.

**The withdrawn-claim grep.** `git grep open-questions` outside `dev-dist/` leaves 73 files, and in
none is it a live instruction to open the register to find a question. **Not rewritten, and named:**

- `doc/README.md`'s `## Reading order` and `## Document status` rows for `open-questions.md`, both
  of which still describe it as *the register*. That file already names them as stale and defers
  them to [Q484](../questions/q484.md), and P28 *Out* limits prose changes to the live
  instructions.
- `doc/questions/README.md` still reads *until the lookup lands (W119), the file name is the
  lookup*. It is stale since W119, and it is a record-step file this item had no reason to write.
- Every other hit is historical prose, a comment, or a non-Q-texted link that lands on the stub.
  `doc/README.md`'s `[open-questions.md](open-questions.md)` is one of these, and it is now the
  subject of `check-markdown-selftest`'s *one directory too shallow* probe.

**Questions raised**: none. **Q502-Q504 are unused.**

**Overlap**: not measured. There is no adequacy reader in this item's gate.
