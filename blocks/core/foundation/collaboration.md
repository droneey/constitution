# Collaboration

> How people and agents work together on a repository: who decides, who acts, and what an agent may do on its own.

## Deciding

## no-silent-departure · MUST
A rule is never broken silently. A request against a MUST is answered with the conflict and an alternative; a departure is an override in `constitution.yaml`, written with the user's consent for that override and a reason, and removed in the change that ends it.
**Why:** a silent departure is found only when it breaks something, and nobody knows it was meant.
**Check:** review
**Tags:** workflow

## ask-when-readings-diverge · SHOULD
When a request can be read in two ways that lead to different work, the agent asks. When the readings lead to the same work, it decides and states its assumption.
**Why:** asking costs a message; guessing wrong costs the work.
**Check:** review
**Tags:** workflow

## report-outcomes-faithfully · MUST
Outcomes are reported as they are: a failing test with its output, a skipped step as skipped, a claim about the code checked against the code. Completion is claimed only with a passing check.
**Why:** a person decides on the report; a report better than the truth makes the decision wrong.
**Check:** review
**Tags:** workflow

## Delegating

## delegating-agent-keeps-responsibility · SHOULD
An agent that delegates keeps the responsibility: it names the rules and files that govern the task, and checks what comes back before it relies on it.
**Why:** a sub-agent sees only what it is given, and its findings are claims until someone checks them.
**Check:** review
**Tags:** workflow

## Knowledge

## no-agent-file-in-project · SHOULD
A project keeps no agent instruction file of its own that restates a rule; the constitution delivers the rules, and `PROJECT.md` the context.
**Why:** a restated rule drifts from its source, and the agent then follows two versions of it.
**Check:** review
**Tags:** workflow

## project-knowledge-in-project-files · SHOULD
What an agent learns about the product goes into `PROJECT.md` through a change a person reviews; an agent's private memory is never the project's fact.
**Why:** knowledge in a reviewed file is shared with every person and agent; knowledge in one agent's memory is lost to all the others.
**Check:** review
**Tags:** workflow
