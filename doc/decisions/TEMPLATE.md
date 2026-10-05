---
id: ADR ____
title: "<the decision, stated as a fact rather than a topic>"
status: accepted
date: "YYYY-MM-DD"
item: W_
raised-by: Q__, P_
supersedes: ""
amends: ""
resolves: ""
---

# ADR ____ — <the decision, stated as a fact rather than a topic>

*The front matter is DATA: `npm run check:register` holds it (`R6`-`R8`) and the lookup prints it.
All nine fields are present, `""` where there is nothing to say; `title` is the H1's text after the
dash, and `date` is quoted. `status` is `proposed` or `accepted` and nothing else — **superseded by
is DERIVED** from the newer ADR's `supersedes`, so an older ADR never says it in a field. `item` is
the ONE work item that DECIDED or took this ADR; `raised-by` is what raised it — a question, an
upstream want, another item, and the plan it was taken under. Both, and `resolves`, hold BARE ids
separated by `, `, none twice and none this ADR's own — `W117`, `Q4, P1`, `S10`, `ADR 0079` —
never links, because a link in front matter is checked by nothing. `supersedes` and `amends` name
only OLDER ADRs and hold `ADR NNNN` entries separated by `; `, each optionally qualified:
`ADR 0013 rules 1, 2 and 6`, `ADR 0073 decision 1`, `ADR 0066 in part`. `resolves` lists a
question only when that question's `resolved-by` names this ADR, and the two are compared both
ways. Prose about any of it goes here, under the H1. Delete this paragraph.*

## Context

*What forced the choice. The constraint, not the history.*

## Decision

*One paragraph, in the present tense, stating what is true from now on. Numbered rules if it has
more than one part - they will be cited by number.*

## Consequences

*What this makes easy, what it makes hard, and what a future reader is likely to try that this
forbids. Be honest about the cost; an ADR with no downside was not a decision.*

## Alternatives rejected

| | why not |
|---|---|
| | |
