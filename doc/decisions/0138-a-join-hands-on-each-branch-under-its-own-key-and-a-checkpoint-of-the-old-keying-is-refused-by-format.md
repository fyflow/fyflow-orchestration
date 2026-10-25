---
id: ADR 0138
title: "A join hands on each branch under its own key, and a checkpoint of the old keying is refused by format"
status: accepted
date: "2026-10-25"
item: W217
raised-by: P44
supersedes: ""
amends: ADR 0037 rule 4; ADR 0062 in part
resolves: ""
---

# ADR 0138 — A join hands on each branch under its own key, and a checkpoint of the old keying is refused by format

**Status:** accepted 2026-10-25 — [W217](../work-items/w217-a-join-keyed-by-each-branchs-own-key-and-checkpoint-format-2.md)
under [P44](../plans/p44-what-a-join-hands-on-and-how-a-key-path-reaches-into-it.md), decisions 4-6, the maintainer's (a1)
and (b) answering fyflow-app's pass 5 #1. **Amends**
[ADR 0037](0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
rule 4 (`JP-R12`) and
[ADR 0062](0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md) consequence 5. `spec/join-policy.md`
v0.25, `spec/run-state.md` v0.36, `spec/flow-definition.md` v0.54. **BREAKING — 0.12.0.**

## Context

1. **A nested join's collection could not be reached by a key path** (pass 5 #1). Since ADR 0037 a satisfied join
   carried an object keyed by the arriving branch's FULL `branchPath`. A map inside a fan-out's first branch handed on
   `{"0":{"0.0":1,"0.1":2},"1":{"xs":[1,2]}}`: the inner keys repeat the outer path (`"0.1"` under `"0"`), a dotted key
   path splits them (`input.0.0.1` never names `"0.1"`), and a fan-out's keys are POSITIONS a reader counts in
   `branches`, so reordering them moves every key. The app wrote a Transform per nesting to reshape it.
2. **The own key is derivable at the one site with no new state** (P44 fact 1). The collection is built in ONE place,
   `collectArrivals`, from arrivals recorded per region INSTANCE keyed by full path; a fan-out's path segment is its
   entry's index in `branches` (`RegionSets`), and a map's is the item index.
3. **What the language does with the keys** (P44 fact 2, measured in node 24 and deno): `Object.fromEntries` lists
   integer-like keys first, ascending, then the rest in insertion order, and keeps `__proto__` as an OWN key, which
   `structuredClone` and `JSON.stringify` preserve; a plain assignment `out[k] = v` with `k = "__proto__"` SETS THE
   PROTOTYPE and leaves no key. `FD-V16`'s charset admits an all-digit id and `__proto__`; `FD-V9` keeps a fan-out's
   entries distinct.
4. **A collection reaches a checkpoint through three doors** (P44 fact 4): an `asked` element's `input` when an ask
   follows a join (compared whole by the replay, `RN-R20`), a `gated` decision taken on a key path into it, and every fed
   outcome whose worker read it. A run started under the old keys and resumed under the new would be refused `diverged`
   at an ask, re-route a gate, or carry results computed from keys that no longer exist.
5. **The app asked for the keying rule in the checkpoint header** (#1 (d)), so a run resumes under the rule it started
   under. **The maintainer declined it** ((b)): *"i wouldn't worry about backwards compatibility (format-1), we drop it
   with the new version. Library is only used by me for now so we don't care"*.

## Decision

1. **The key is the branch's OWN key, one segment, at every depth.** A `map` instance's key is its ITEM INDEX — the
   arriving `branchPath`'s last segment; a `fanout` branch's is its ENTRY NODE ID — `branches[segment]`. pass 5's example
   becomes `{"prep":{"0":1,"1":2},"side":{"xs":[1,2]}}`, and `input.prep.1` reaches the second item. A branch that did not
   arrive has no key; a join nothing arrived at carries `{}`. **Nothing is lost**: the full path is `regionPath` + `.` +
   the position (the position alone at the top level, where `regionPath` is `-`), and every `branch.*` event, task id, `RunState.regions` value and `inputOf` `branchPath` keeps it.
2. **The order is the object's own, and it is deterministic.** Entries are INSERTED in ascending item index for a map and
   in `branches` order for a fan-out (`compareBranchPaths` over the full paths, unmoved); the language then lists
   integer-like keys first, ascending — so a fan-out whose entries are `"b"` and `"2"` lists `"2"` first. **No node id is
   refused** for it (P44 (a1), against (a3)). v0.24's key-order hazard — *dotted keys keep insertion order, which for a
   join is settlement order* — is gone with the dotted keys.
3. **Each entry is DEFINED as an own property** (`Object.fromEntries`), never assigned, so an entry id `__proto__` is a
   key — through a threaded pool's `structuredClone` too (W217's re-take).
4. **The wiring check keys a join's record the same way** (`checkWiring`'s `record()`): a fan-out's properties by entry
   id, a map's minted keys by item index — so a successor's `inputSchema` is checked against the shape the run hands it.
5. **`CHECKPOINT_FORMAT` is 2, and a driver reads ONE format.** `RN-R16`'s own clause — *it moves only when what a
   checkpoint CARRIES moves* — is SATISFIED, not amended: Context 4 is the argument. A format-1 checkpoint is refused
   `format` (`RN-R23`) by `resume()`, `runtime.resume` and `inputOf` — whether or not its run holds a join — before
   anything is replayed; no header field records a keying; no dual code path; no migration. A 0.11.0 driver refuses a
   format-2 checkpoint the same way, with no edit (its `resumeRefusal` compares `header.format` with its own `1`).

### Amendments this carries

- **ADR 0037 rule 4** (`JP-R12`) read *keyed by `branchPath` … in ascending `branchPath` order, compared segment-wise as
  numbers*. The key is now the branch's own key (rule 1 above) and the order the object's own (rule 2). Its *finding that
  settles it* — *all of them, keyed* — is unmoved; what is keyed moved. Its consequence *a branch's payload key and its
  task id's third segment are the same string* holds for a top-level map only, and no longer for a fan-out; and its
  `join → map` affordance now reads `over: "<entry id>"`, which is no longer coupled to the fan-out's numbering.
- **ADR 0062 consequence 5** argued that two instances of one opener hold DISJOINT collections *because* each key carries
  its instance's path as a prefix. With own keys two instances may hold the SAME key set; **they are kept apart because
  each instance holds its own collection** — ADR 0062 rule 1's instance key, the `arrivals` map's second level, which is
  unmoved and is what kept them apart all along.

## Consequences

1. **BREAKING for every reader of a collection's keys**: a flow whose expression, worker, gate key or `when.path` reads a
   full-path key (`"0.1"`) or a fan-out's position (`"0"`) reads nothing under 0.12.0. Measured on this tree: no worker
   under `examples/workers/` reads a collection's keys (P44 fact 3); the census of moved tests and claims is W217's Record.
2. **BREAKING for every checkpoint 0.11.0 wrote**, join or none. **A run in flight across the upgrade cannot be resumed
   by 0.12.0 — drain or abandon it first.** Demonstrated both ways by W217: this driver refuses a format-1 checkpoint
   `format`, and the 0.11.0 driver (`bdbdb1c`) refuses this driver's format-2 checkpoint `format`.
3. **A 0.7.0 checkpoint is refused `format` before `halted`**: ADR 0102 rule 3's `stopped` read is kept and is
   unreachable from any checkpoint a driver writes; ADR 0130 rule 2's *a checkpoint written before 0.11.0 resumes* no
   longer has a checkpoint to apply to — the same refusal comes first — and the rule itself is unmoved. Both ADRs carry
   a note saying so; neither is amended.
4. **What this forbids**: assigning a collection's entries (`out[k] = v`); refusing an id for the order's sake; reading a
   format-1 checkpoint under either keying; and a second keying behind a header field — each the alternative (b) declined.
5. **What is not bought**: a join reducer ([Q165](../questions/q165.md), deferred — it would receive the new keys), a
   quoted-key form in a key path (P44 (c3)), and any change to region events, task ids or paths.
