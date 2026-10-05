# Questions

**The register. One file per question, `q<N>.md`, unpadded and without a slug** —
[P28](../plans/p28-what-can-be-looked-up-instead-of-read.md) decision 1, since
[W116](../work-items/w116-a-question-is-a-file.md). A link is written from the id alone, so a
retitled question never breaks one. Ids are monotonic and **never reused and never renumbered**
(`doc/workflow.md` section 3); a work item reserves a block before it starts and raises questions
from it.

**This is a REFERENCE, not required reading.** Look up the question you need, the way you read
`spec/`. `npm run q -- Q17` looks one up (W119), and the file name still works: Q17 is `q17.md`.

**`npm run check:register` holds this folder** —
[ADR 0079](../decisions/0079-a-register-is-files-with-front-matter-and-its-index-is-derived.md).
It is a gate entry, so a malformed file, an undeclared cluster or a deleted question is a red gate
rather than a sentence here.

## The format

Every file opens with front matter and nothing else is required. **All ten fields are present in
every file**, empty as `""` where there is nothing to say:

| field | what it holds |
|---|---|
| `id` | `Q<N>`, and `<N>` is the file name's |
| `title` | the question or the finding, in one line |
| `status` | one of the four words below, and nothing else |
| `cluster` | one of the clusters declared below |
| `owner` | the work item or plan that will answer it, or `no owner` — which is honest and common. **It is PROSE, not an id field**: a migrated value is the register's cell verbatim (`W28 (P9)`, `no owner — P16's retro`), and a migrated resolved question has `""`. `check:register` checks that the field is present, not its form — [Q494](q494.md) |
| `closes-when` | the closing condition, where one is stated |
| `resolved-by` | **non-empty exactly when `status` is `resolved`**: an ADR, a plan, a spec reference, or free text. Every `ADR NNNN`, `P<n>` and `W<n>` it names must exist |
| `note` | what qualifies the status — for a migrated row, what its status cell carried after the first word |
| `raised-by` | the item or plan that raised it. **Left empty by the migration rather than guessed** |
| `shared` | another repository's id for the same question, **with that repository's name attached** |

A value is either a plain word run (`status: open`) or a double-quoted string with JSON's escapes
(`title: "Where does routing execute?"`). That subset is what `check:register` and `npm run state`
read; a value in any other YAML form is refused rather than guessed at — **including an unquoted
word YAML would TYPE** (`null`, `~`, `true`, `yes`, `on`, `123`, `1.5`), which must be quoted to stay a
string. A **body** below the front
matter is optional — the migrated files carry none, and their long bodies are in `git` before
`aa43cb3`.

**A leaning is not a decision**: nothing here is settled until an ADR says so.

## Status

| word | means |
|---|---|
| `open` | real, and not yet answered |
| `deferred` | **real, not now, with a reason** — it is expected to come back |
| `icebox` | **a what-if judged unlikely to matter to most work items.** It is NOT expected to come back on its own, and that is what separates it from `deferred`. **It requires a non-empty `note` saying why.** The lookup leaves it out unless asked for |
| `resolved` | answered, with what answered it in `resolved-by` |

**Moving a question to `icebox` is a judgement about that question, and it is the maintainer's** —
P28 decision 1. The migration iced nothing.

## Clusters

The declared list. `check:register` refuses a `cluster` value that is not a row of this table, by
its first cell. *The descriptions are the register's cluster headings at `aa43cb3`, verbatim.*

| cluster | what it holds |
|---|---|
| Control flow | *Where routing executes, and what a flow definition is. Everything else was downstream of these.* |
| The join | *The genuinely hard part — what satisfies a join, and what it carries downstream.* |
| Decisions and data | *Ordinary design, but Q12 hid two different features under one word.* |
| Identity, state, failure | *Where the library’s sharp edges, and the scheduler’s, land on us.* |
| Scale and interop | *Answerable late, and Q19 changes the run representation if it lands badly. Q33-Q35 are the three runtimes.* |
| Verification and fixtures | ***The cluster that existed and was not written down.** Every row is about whether a CHECK can fail rather than about what the library does, and almost every one was raised by an item measuring its own gate.* |
| Raised late | *Raised from upstream documents rather than from this library’s own design.* |
| Documents and indexes | — *the register carried no heading and no description for it: it is Q466's own cluster cell at `aa43cb3`, the one resolved row naming a cluster no heading declares* |

## Raising a question

1. Take an id from your item's `Reserves:` block — `npm run state` prints the next free one.
2. Write `doc/questions/q<N>.md` with all ten fields: `status: open`, a declared `cluster`, the
   `owner` if one is known, and **`raised-by` set to your item or plan**.
3. Cite it as `[Q<N>](../questions/q<N>.md)` from wherever it is relevant, at that file's depth.

**To resolve one**, set `status: resolved` and fill `resolved-by`. **To ice one**, set
`status: icebox` and write in `note` why it is a what-if — the maintainer's call, never a
migration's.

## Notes

**One paragraph is kept from the register's `## Notes`, because it has no home and cannot be derived
from one.** *Verbatim, with its links re-pointed one directory deeper.*

> **The useful part of an upstream document written for a *different* consumer was not the part
> addressed to a consumer at all.** `../fyflow-scheduler/RESOURCE_EVENTS_PLAN.md` is a
> counter-proposal about resource gauges this library does not consume, and the two paragraphs in it
> that were ours were addressed to nobody: §11, four lines long, on event details being live
> references — which became
> [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) — and
> §4.4’s exit (c), a blocked task dropped with no event, which is the signature
> [P1](../plans/p1-what-satisfies-a-join.md) was trying to attribute to a join policy.
> **Reading only the sections that named our concerns would have missed both.** Recorded 2026-08-30
> as *worth a rule if it recurs*; it has not recurred.
