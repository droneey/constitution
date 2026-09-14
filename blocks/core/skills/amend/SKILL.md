---
name: amend
description: Record a departure from a chapter in this repository's DECISIONS.md, in the constitution's format.
argument-hint: "[title]"
disable-model-invocation: true
---

# Amend the decision log

Highest entry number this repository has ever used:

!`{ git log -p -- DECISIONS.md 2>/dev/null; cat DECISIONS.md 2>/dev/null; } | grep -oE 'ADR-[0-9]{4}' | sort -u | tail -1 || true`

Front matter of `PROJECT.md`:

!`awk 'NR == 1 && $0 != "---" { exit } NR > 1 && $0 == "---" { exit } NR > 1' PROJECT.md 2>/dev/null || true`

## Conventions

The log holds the repository's departures in force, one entry each, and nothing else: a decision the chapters already allow lives in the description of its pull request. The next entry takes the number after the highest above, so a number is never reused. Every entry carries a **`Deviates:`** line naming the chapter and section; it is the only way a repository departs from the constitution. The change that ends a departure removes its entry. The shape is the commented example at the top of `DECISIONS.md`: Context, Decision, Rejected, Why.

## Steps

1. The title is `$ARGUMENTS` when given; otherwise ask for it.
2. Name the chapter and the section the decision departs from — read the chapter first to name the exact section. When it departs from none, say so and stop: it belongs in the pull request.
3. Take the context, the decision, the rejected alternatives and the reasoning from the conversation; ask for what is missing. Never invent a rationale.
4. Draft the entry with the next number and today's date; show it; append it to `DECISIONS.md` only after confirmation.
5. Remind that the entry ships in the same change as the code or the rule it concerns, per the `workflow` chapter.
