# Collaboration

> How people and agents work together on a repository: who decides, who acts, and what an agent may do on its own.

## Deciding

## no-silent-departure · MUST
A rule is never broken silently. A request against a MUST is answered with the conflict and an alternative; a departure is an override in `constitution.yaml`, written with the user's consent for that override and a reason, and removed in the change that ends it.
**Why:** a silent departure is found only when it breaks something, and nobody knows it was meant.
**Check:** review
**Tags:** workflow

## consent-before-consequential-actions · MUST
An agent asks before: adding a dependency, a pattern or an abstraction; changing a public surface, a schema or a format; an operation that destroys, costs money, touches a live system or sends something outward; a call to a real external service; pushing to a shared branch. Consent is given in the chat, for that action, and does not carry over to the next.
**Why:** these actions are hard to undo or reach beyond the change, so the person who answers for them decides.
**Check:** review
**Tags:** workflow, security

## design-settled-in-chat-first · SHOULD
A design question is settled in the chat before code is written for it.
**Why:** code written on an unsettled design is rewritten when it is settled.
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

## Acting

## agent-commits-only-when-asked · MUST
Only a person decides what is committed. The main agent commits only when a person asks it to, on the working branch.
**Why:** a commit records a decision under the person's name; the person makes it.
**Check:** review
**Tags:** workflow

## agent-never-merges-or-pushes-to-main · MUST
An agent never merges, never pushes to the main line, never force-pushes and never rewrites shared history. It pushes its branch and opens the pull request when asked.
**Why:** merging is the decision that ships a change, and history others have is not the agent's to rewrite.
**Check:** review
**Tags:** workflow

## no-tool-attribution · MUST
Commits, pull requests and documents carry no attribution to the tool or model that helped write them.
**Why:** the person who submits a change answers for it; an attribution line adds noise and no accountability.
**Check:** review
**Tags:** workflow

## Delegating

## delegating-agent-keeps-responsibility · SHOULD
An agent that delegates keeps the responsibility: it names the rules and files that govern the task, and checks what comes back before it relies on it.
**Why:** a sub-agent sees only what it is given, and its findings are claims until someone checks them.
**Check:** review
**Tags:** workflow

## sub-agent-only-does-the-work · MUST
A sub-agent does the work it is given and nothing more: it never commits, never pushes or merges, never runs a live system and never calls a real external service.
**Why:** a sub-agent acts without the person watching, so every action with consequences stays with the agent the person talks to.
**Check:** review
**Tags:** workflow, security

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
