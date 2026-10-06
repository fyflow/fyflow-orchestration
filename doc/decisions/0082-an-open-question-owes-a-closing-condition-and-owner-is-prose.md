---
id: ADR 0082
title: "An open question owes a closing condition, and owner is prose"
status: accepted
date: "2026-10-06"
item: W127
raised-by: P29
supersedes: ""
amends: ADR 0079 decision 2
resolves: Q494
---

# ADR 0082 — An open question owes a closing condition, and owner is prose

**Decided by the maintainer at [P29](../plans/p29-which-open-questions-still-matter.md)'s
declaration, 2026-10-05** — decision 6 and stop-and-asks (i) and (l) — and built by
[W127](../work-items/w127-an-open-question-says-what-closes-it.md), the plan's last item.
**Amends:** [ADR 0079](0079-a-register-is-files-with-front-matter-and-its-index-is-derived.md)
decision 2, which gave `status` its four words and bound only `icebox`.

## Context

1. **The register's live half had never been judged.** At `988ef5f` 307 questions were open; 233
   had an empty `closes-when` and 277 an `owner` reading `no owner`, so 206 told a reader neither
   who would answer them nor what would close them (P29's table). W121-W126 gave each one verdict,
   and every keep was given a `closes-when` — so the requirement is already true of the tree, and
   nothing holds it.
2. **[Q494](../questions/q494.md) asked whether `owner` is an id field or prose.** It is prose: the
   302 migrated live owners are the old register's cell verbatim (`W28 (P9)`, `no owner — P16's
   retro`), and `doc/questions/README.md` has said so since W116. A check that `owner` does not open
   `no owner` would be a check over prose, which is the refusal ledger's first row.
3. **`closes-when` is a field, not prose about one**: whether it is empty is a fact a check can read
   without judging what it says. That is the shape the ledger's first row does not refuse (P28's
   Record, *what this plan taught* 1).

## Decision

1. **An open question owes a closing condition.** Every `status: open` question has a `closes-when`
   that is non-empty after a trim. It is a CLOSING condition — what would let the question be
   resolved — not a trigger for reopening one.
2. **`check:register` holds it as `R9`**: one failure per open file whose `closes-when` is empty,
   naming the file. A file whose front matter does not parse, or that lacks `status` or
   `closes-when`, is `R2`'s, and `R9` reads no field of it.
3. **`deferred` is not bound**, because its reason is in `note`, and neither are `icebox` or
   `resolved`. A deferred, iceboxed or resolved question MAY carry a `closes-when`; nothing requires
   or clears it.
4. **`owner` stays optional prose**, present in every file as `R2` already requires and checked for
   nothing else. No migration moves it to `note`.
5. **This amends ADR 0079 decision 2**: `status` is still one of the four words and `icebox` still
   requires a `note`; `open` now also requires a `closes-when`. **Q494 is resolved by this ADR.**

## Consequences

1. **The requirement is checked, not written down**: `doc/questions/README.md` says `closes-when` is
   required while `status` is `open`, and *raising a question* asks for one, but the gate is what
   makes it so. `npm run q -- --where status=open --where closes-when=` matching nothing is the same
   fact, read by the lookup rather than the check.
2. **A question raised open with no closing condition is a red gate.** The way out is to state one,
   or to defer the question with its reason in `note`.
3. **What `R9` cannot see**: whether a `closes-when` is a real condition or a placeholder (`TBD`
   passes), and whether it is still true. It reads a field's emptiness and nothing about its
   content, by decision 2 and the ledger's first row.
4. **`owner` carries no promise.** A reader looking for who will answer a question reads prose,
   which may say `no owner`; the closing condition is what an open question owes instead.

## Alternatives rejected

| | why not |
|---|---|
| a check that `owner` names a `P` or `W` id | `owner` is migrated prose (Q494), so the check would be over prose or would need a 302-file migration the round-trip against `aa43cb3` must then account for |
| binding `deferred` too | a deferred question is real and not now, and its reason is in `note`; at W127, 64 of 65 carry no `closes-when` |
| checking that `closes-when` is not a placeholder | a check over the content of prose — the refusal ledger's first row |
| a fifth status word for a question with no closing condition | P29 stop-and-ask (b): no fifth word; `deferred` already says *real, not now* |
