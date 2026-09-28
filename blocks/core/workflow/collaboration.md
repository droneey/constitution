# Collaboration

## Deciding

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

## sub-agent-only-does-the-work · MUST
A sub-agent does the work it is given and nothing more: it never commits, never pushes or merges, never runs a live system and never calls a real external service.
**Why:** a sub-agent acts without the person watching, so every action with consequences stays with the agent the person talks to.
**Check:** review
**Tags:** workflow, security
