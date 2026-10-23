---
id: ADR 0131
title: "A reference may name a node's error"
status: accepted
date: "2026-10-23"
item: W209
raised-by: P43
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0131 — A reference may name a node's error

**Status:** accepted — [P43](../plans/p43-what-a-flow-and-a-run-say-as-data-rather-than-as-prose.md) stop-and-ask (c),
answered (c1) by the maintainer 2026-10-23 as recommended, decision 5, fact 5; written by
[W209](../work-items/w209-a-reference-to-a-nodes-error.md). It defines `spec/flow-definition.md` v0.49's `!error` row of
section 3's reference table, `FD-V26`'s three `!` clauses and `FD-C1`'s error key. It amends no ADR:
[ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)'s
whole-node rule, [ADR 0042](0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)'s
`?`, [ADR 0044](0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)'s visibility,
[ADR 0124](0124-a-reference-read-costs-its-answer.md)'s index and
[ADR 0126](0126-a-references-value-is-one-frozen-copy-shared-by-every-reader.md)'s shared copy apply to the new form as
written.

## Context

fyflow-app's *pass 4* #2 (pass 1 #12, deferred at P35 *"until an ask after a failure edge is designed"*): `lookup` fails,
an ask after its `on: ["failed"]` edge asks a person *"lookup failed: why — retry, skip, or give the value?"*, and nothing
a flow composes can say WHY. A failed task's `result` is `null` (`spec/outcome-record.md`, `OR-R2`), so a `needs`
naming it hands `null`; the error is the outcome record's `error` — already a string, the scheduler having reduced the
`Error` to its message — and a predicate reads it as `ctx.outcome.error` on the failing node's OWN edges only (P43
fact 5). The app offered three spellings: a reference form, `{ "error": "lookup" }`, or the failed edge handing
`{ error }` by default ((c2) — BREAKING: every failure edge's successor receives `{ error }` where it received `null`).

## Decision

**A `needs` reference may name a node's ERROR, written `"n!error"`: the node id, then the part `!error`, then the
optional `?`.**

1. **Four spellings, the plain reference's four**: `"n!error"`, `"n!error?"`, `["n!error"]`, `["n!error?"]`. The `?` goes
   LAST, as it does on `"n?"`. `!` is outside `FD-V16`'s id charset, so no node id is ever read as the form.
2. **It aims at the node `"n"` aims at.** `FD-V27`-`FD-V29` refuse it exactly where they refuse `"n"`, and their fixes
   spell the reference as written (`write ["n!error"]`, `Write "n!error?"`); the visible outputs, their order, `FD-R3`
   and `FD-C4` are the plain form's. **Only what is read of each visible output differs.**
3. **It resolves to the effective outcome's `error`** — the outcome record's (`d.error ?? null`), or a resolution's where
   a person resolved the node (`RS-R1`: a parked task resolved `failed`, a declined ask; `'resolved as failed'` where they
   gave none). So a string where the output failed, and **`null` where it succeeded** (the scheduler clears `task.error`
   at every dispatch; a `done` resolution writes `null`). A `"n!error?"` whose node did not run is ABSENT; `["n!error"]`
   is one per visible output in branch-path order.
4. **No copy.** The value is a string or `null`, so ADR 0126 has nothing to share: the shared-copy count does not move,
   and the output's copy of its `result` is neither made nor read by an error read.
5. **Parsed by `referenceTarget` alone**, which the validator, the driver and the wiring check all import: the aimed
   member gains an OPTIONAL `part: 'error'`, PRESENT only on this form, so every spelling before v0.49 parses to the
   object it did. `AimedReference` names the member.
6. **The whole-node rule stands**: the error is a FIELD OF THE OUTCOME, beside `result`, never a path inside it, and
   `error` is the ONE part a reference may name. `FD-V26` refuses every other `!` spelling, each naming its fix: a `?`
   before the part (`"n?!error"` — write `"n!error?"`), no node before the `!` (`"!error"`), and any other part (`"n!err"`,
   `"n!result"`, `"n!"`).
7. **The wiring check composes the key as `{ type: ['string', 'null'] }`**, never the producer's output schema, with that
   schema's witness, `''`, as its sample — so a producer declaring no schema still composes a CHECKED error key.

## Consequences

1. **The failure edge's successor reaches what failed** — measured by W209's L2 suite on
   `ask-after-a-failure.flow.json`, the corpus document for the shape: the ask after `lookup`'s failure edge is handed
   `{ why: <the record's error> }`, equal to the record's own field; the same flow's success road hands `null`.
2. **Additive.** No existing spelling, verdict, message, composed payload, fold input or checkpoint moves (P43
   prediction 3, measured over every corpus at W209); the public surface gains the form, `part` and `AimedReference`, in
   0.11.0. A consumer that deep-compares `referenceTarget`'s result for a plain spelling sees the same object.
3. **A reader that reads `referenceTarget` and ignores `part` reads the error form as the plain one** — which is right
   for an aiming rule (2) and wrong for a resolver. The library's two resolvers, the driver's and the wiring check's,
   switch on it; a consumer's own resolver must too.
4. **What this forbids**: a second part (`"n!result"`, `"n!attempts"`) without its own decision — each is a promise
   about the outcome record's shape a reference would then expose; a path after the part; and (c2)'s default `{ error }`
   on a failure edge, declined as BREAKING.
