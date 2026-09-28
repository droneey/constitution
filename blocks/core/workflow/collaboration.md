# Collaboration

## Deciding

## consent-before-consequential-actions · MUST
An agent asks before adding a dependency, a pattern or an abstraction; before changing a public surface, a schema or a format; and before pushing to a shared branch. Consent is given as for an irreversible action: in the chat, for that action alone.
**Why:** these changes reach beyond the task and are hard to take back once others build on them, so the person who answers for them decides.
**Check:** review
**Tags:** process
**Implements:** `consent-before-irreversible-actions`

## design-settled-in-chat-first · SHOULD
A design question is settled in the chat before code is written for it.
**Why:** code written on an unsettled design is rewritten when it is settled.
**Check:** review
**Tags:** process

## Acting

## agent-commits-only-when-asked · MUST
Only a person decides what is committed. The main agent commits only when a person asks it to, on the working branch.
**Why:** a commit records a decision under the person's name; the person makes it.
**Check:** review
**Tags:** process

## agent-never-merges-or-pushes-to-main · MUST
An agent never merges. It pushes its branch and opens the pull request only when a person asks.
**Why:** merging is the decision that ships a change, and it belongs to the person who answers for it.
**Check:** review
**Tags:** process

## no-tool-attribution · MUST
Commits, pull requests and documents carry no attribution to the tool or model that helped write them.
**Why:** the person who submits a change answers for it; an attribution line adds noise and no accountability.
**Check:** review
**Tags:** process

## Delegating

## sub-agent-only-does-the-work · MUST
A sub-agent does the work it is given and nothing more: it never commits, never pushes and never merges.
**Why:** a sub-agent acts without the person watching, so every decision about the history stays with the agent the person talks to.
**Check:** review
**Tags:** process
