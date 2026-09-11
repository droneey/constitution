---
name: amend
description: Record a decision in this repository's DECISIONS.md in the constitution's format, with a Deviates line when it departs from a chapter.
argument-hint: "[title]"
disable-model-invocation: true
---

# Amend the decision log

Last entry in this repository:

!`grep -oE '^## ADR-[0-9]{4}' DECISIONS.md | tail -1 || true`

Front matter of `PROJECT.md`:

!`awk 'NR == 1 && $0 != "---" { exit } NR > 1 && $0 == "---" { exit } NR > 1' PROJECT.md 2>/dev/null || true`

## Conventions

The log is **append-only** and **numbered contiguously**: the next entry takes the number after the last one above. One entry per decision. Statuses: `Accepted` · `Superseded` · `Proposed`. To change a decision, add a new entry that supersedes the old one and mark the old `Superseded by ADR-NNNN` — never rewrite an entry. A departure from a block carries a **`Deviates:`** line naming the chapter and section; it is the only way a repository departs from the constitution. The shape is the commented example at the top of `DECISIONS.md`: Context, Decision, Rejected, Why.

## Steps

1. The title is `$ARGUMENTS` when given; otherwise ask for it.
2. Take the context, the decision, the rejected alternatives and the reasoning from the conversation; ask for what is missing. Never invent a rationale.
3. When the decision departs from a chapter, name the chapter and the section in the `Deviates:` line — read the chapter first to name the exact section.
4. Draft the entry with the next number, today's date and its status; show it; append it to `DECISIONS.md` only after confirmation.
5. Remind that a decision which changes code or a rule ships in the same change as that code, per the `workflow` chapter.
