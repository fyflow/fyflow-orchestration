# W116 — A question is a file, and `check:register` holds the folder

**Status:** todo
**Plan:** [P28](../plans/p28-what-can-be-looked-up-instead-of-read.md)

```
Spec:       none — this item defines the question file format, P28 decision 1. ADR 0079: a
            register is files with front matter and its index is derived; it amends ADR 0078
            (M7 and M8 leave check-markdown with their subject)
Owns:       doc/questions/**, doc/open-questions.md, scripts/check-register.mjs,
            scripts/check-register-selftest.mjs, scripts/check-markdown.mjs,
            scripts/check-markdown-selftest.mjs, scripts/state.mjs, package.json,
            scripts/run-selftests.mjs, doc/decisions/0079-*.md, this file
            (plus whatever check-wiring requires of a new gate entry — named at the start of the
            work, before the first edit, or the item stops)
Inputs:     doc/open-questions.md at aa43cb3: 383 rows, six tables, two shapes — 302 live rows
            (question, status, owner, closes-when) under seven cluster headings, and 81 resolved
            rows (cluster, question, what resolved it); its `## Notes` paragraph that has no other
            home; P28 decisions 1 and 3
Outputs:    (1) 383 files doc/questions/q<N>.md, front matter per P28 decision 1, no body
            (2) doc/questions/README.md: the status vocabulary — four words, with what separates
                `icebox` from `deferred` (P28 decision 1) — the declared cluster list, the kept
                `## Notes` paragraph, and how to raise or icebox a question
            (3) doc/open-questions.md as a pointer of a few lines: where the rows went, and
                `npm run q` once W119 lands
            (4) check:register R1-R5, its self-test, and its gate entry
            (5) M7 and M8 deleted from check-markdown, with their self-test probes
            (6) state.mjs counting the folder rather than parsing the table
            (7) ADR 0079
Depends on: nothing
Blocks:     W117, W119, W120, W118
Tests:      the split is checked against the OLD register, never against itself: every row of
            `git show aa43cb3:doc/open-questions.md` is parsed independently and compared cell by
            cell with the file's fields. Each R clause is provoked in check-register-selftest
            (section 5 rule 7), each probe declaring the exact set it trips
Gate:       L0-L6 via gate:full; the round-trip; conformity and adequacy readers
Reserves:   Q493-Q497, ADR 0079
```

## Scope

**In**

1. **The split.** A one-shot script, run from `dev-dist/w116-split/` and not checked in — its output
   is the tree, and the round-trip is what checks it. Titles, owners, closes-when and resolved-by
   are copied **verbatim**. A live row's status cell is split at its first word: the word is
   `status`, the rest is `note`. A live row's cluster is the heading it sits under; a resolved row's
   is its own cell. `raised-by` is left empty — **the register does not carry it, and a migration
   that guesses it writes a claim nobody ran.**
2. **`check:register`**, clauses for questions:
   - **R1** every file in `doc/questions/` other than `README.md` is `q<N>.md`, and its `id` is
     `Q<N>`; no id appears twice
   - **R2** every required field is present; `status` is one of `open`, `deferred`, `icebox`,
     `resolved`; `cluster` is in the list `doc/questions/README.md` declares; **`icebox` carries a
     non-empty `note`** saying why it is a what-if. *The migration produces no `icebox` row, so the
     self-test is the only place that clause is exercised until the maintainer ices one.*
   - **R3** `status: resolved` if and only if `resolved-by` is non-empty; every `ADR`, `P` or `W` id
     named in `resolved-by` exists in the tree
   - **R4** **a question file present at `HEAD` is present in the tree** — the deletion `M8` could
     not see. *Self-test trees are copies; if a copy has no `.git`, R4 must say it did not run
     rather than pass — decided at the start of the work, and if it cannot be made to, stop and
     ask.*
   - **R5** a vacuity floor: at least 383 files, a ratchet that only moves up, as `M8`'s did
3. `M7`, `M8`, `REGISTER_ROW_FLOOR` and their probes leave `check-markdown`.
4. `state.mjs` reads `doc/questions/` for the register counts and the next free Q, and counts
   `icebox` as its own line among the live statuses.

**Out**

- Rewriting any link — W118. The links still resolve, to the pointer.
- The lookup — W119. Until it lands the pointer names the folder.
- ADR headers — W117. R3 checks that a named ADR file EXISTS, nothing about its header.

## Verification

- `npm run check:register` and `npm run check:register:selftest`, each read by exit code
  (`> log 2>&1; echo EXIT=$?`).
- **The round-trip**: an independent parser of the old register against the folder; it prints the
  count of rows compared and of cells differing, and the item's claim is *383 compared, 0 differing*.
  A control row edited in the copy must come back as one difference.
- `npm run state` before and after: the register counts (383; 302 / 81; 301 / 1) are unchanged,
  and `icebox` reads 0.
- `npm run gate:full` once, on the final tree.
- *Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — no code under `src/` changes.*

## Record

*Filled in when the item is done.*
