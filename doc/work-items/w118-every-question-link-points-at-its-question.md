# W118 — Every question link points at its question, and the live instructions follow

**Status:** todo
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

*Filled in when the item is done.*
