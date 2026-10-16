---
id: ADR 0102
title: "A run the driver halts on a defect is halted, and a stored stopped element is read as one"
status: accepted
date: "2026-10-16"
item: W171
raised-by: P34
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0102 — A run the driver halts on a defect is halted, and a stored stopped element is read as one

**Status:** accepted — [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) decision 2 and stop-and-ask
(f), the maintainer's (2026-10-14/15 and 2026-10-16, *"as recommended"*), written by
[W171](../work-items/w171-the-drivers-halt-is-renamed-halted.md). It renames a value `spec/run-state.md` v0.16 and
`spec/outcome-record.md` v0.15 define, and amends no ADR: ADR 0058 rule 3's *a refused run resolves `done`*, ADR 0065's
refusals and ADR 0094 rule 3's ranking all hold under the new name.

## Context

**`stopped` named the driver's halt on a defect.** `failRun` (`OR-R10`) appended `{ kind: 'stopped', reason }`, the
fold read the run `stopped` whatever its nodes said (`RN-R8`), `RunState.stoppedBy` carried the refusal, and a resume
refused the checkpoint `stopped` (`RN-R23`). The run is terminal and not resumable.

**P34 builds a STOP that is resumable** — fyflow-app's #18, a run stopped on one runtime and resumed on another (W174,
ADR 0105). Two meanings cannot share one word. A consumer keying on *"a stopped run"*, as fyflow-app's ADR-0014 does,
would silently start matching the resumable stop if the word were kept for it.

**The kind is PERSISTED** (P34 fact 7). A checkpoint is the whole event sequence (ADR 0064), and `CHECKPOINT_FORMAT` is
`1`. Renamed with no other change, a 0.7.0 checkpoint's `stopped` element was (i) not found by `resumeRefusal`, (ii) not
fed by the replay, so the resume was refused `diverged` rather than as a halt, and (iii) `fold` THREW on it, falling
through to `input.record`.

## Decision

1. **`halted` throughout.** `RunOutcome` `'halted'`; the fold input `{ kind: 'halted', reason }`; `RunState.haltedBy`;
   `ResumeRefusalReason` `'halted'`; `OR-R10`'s and `RN-R8`'s prose. `halted` keeps `stopped`'s place in the ranking: it
   outranks every outcome.
2. **The old names leave every TYPE.** `'stopped'` is in no union and `stoppedBy` is on no interface, so a consumer's
   `outcome === 'stopped'`, `reason === 'stopped'`, `kind === 'stopped'` and `state.stoppedBy` FAIL TO COMPILE. A rename
   that left a value behind would make an old comparison silently mean something else.
3. **A DUAL READ of the stored kind, and nothing else.** An element whose `kind` is `'stopped'` is 0.7.0's name for the
   `halted` element:
   - `step` folds it exactly as `halted`, its `reason` into `haltedBy` (`RN-R8`);
   - `resumeRefusal` — so `Driver.resume` and `runtime.resume` both — refuses its checkpoint `halted`, `index` that
     element's position, the message naming the stored kind (`RN-R23`).
   It is read and NEVER WRITTEN: nothing in the library appends `'stopped'`. It is not a member of `FoldInput`; the
   stored sequence is data from before the rename.
4. **`CHECKPOINT_FORMAT` stays `1`.** A 0.7.0 checkpoint of a halted run is refused for the right reason, and one of a
   live run — which holds no halt element, and is otherwise byte-identical — still resumes.
5. **The new stop avoids the word.** W174's outcome is `interrupted`, not `stopped`, or a stored 0.7.0 halt would read
   as a resumable stop.

## Consequences

- **BREAKING**, in 0.8.0 with the rest of P34 (decision 6): `RunOutcome`, `ResumeRefusalReason`, `FoldInput` and
  `RunState` each change a name. Every comparison a consumer wrote against the old names is a compile error, not a
  behaviour change — the cost decision 2 chose.
- **The replay never meets a stored `stopped`.** `resumeRefusal` runs before the replay in both callers and refuses it,
  so the replay's prefix check is never asked to compare a stored `stopped` with a regenerated `halted`. P34's (f)
  names that equality; under rule 3 it is unreachable, and nothing builds it.
- **What a future reader will try: dropping the dual read** once 0.7.0 is old. A store may hold a 0.7.0 log for as long
  as it likes, and `fold` would throw on it again (fact 7 (iii)). The read costs one comparison in `step` and one in
  `resumeRefusal`.
- **Version notes keep the old word.** A spec version note, an item file or an ADR that says what `stopped` did at its
  version stays true of that version, and is not rewritten.

## Alternatives rejected

| | why not |
|---|---|
| **Bump `CHECKPOINT_FORMAT` to `2`** | one reading of `kind`, but every 0.7.0 checkpoint is refused `format` — including the live runs fyflow-app's ADR-0014 resumes on start |
| **Another name** — `aborted`, `failedRun` | `aborted` is the scheduler's `AbortSignal` word for a cancel; `failedRun` reads as the `failed` outcome, which a halt outranks |
| **Keep the KIND `'stopped'`** and rename only the outcome and the refusal reason | no checkpoint concern, but the log and the outcome would name one thing two ways, and the log's word is the one W174 needs free |
| **Keep `'stopped'` in `FoldInput`** as a deprecated member | the type would then admit a WRITE of the old kind, and a consumer's `kind === 'stopped'` would still compile |
