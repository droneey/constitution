# Collaboration

## Deciding

## consent-given-in-the-chat-per-action → consent-before-irreversible-actions
Consent is given in the chat, for that action alone, and never carries over to the next.

| Why | Check | Tags |
|---|---|---|
| the chat is where the person who answers for an action sees it asked, and a go-ahead for one action says nothing of the next. | review | [] |

## consent-before-consequential-actions → consent-before-irreversible-actions
An agent asks before adding a dependency, a pattern or an abstraction; before changing a public entry, a schema or a format; and before pushing to a shared branch. Consent is given as for an irreversible action.

| Why | Check | Tags |
|---|---|---|
| these changes reach beyond the task and are hard to take back once others build on them, so the person who answers for them decides. | review | [] |

## design-settled-in-chat-first · SHOULD
A design question is settled in the chat before code is written for it.

| Why | Check | Tags |
|---|---|---|
| code written on an unsettled design is rewritten when it is settled. | review | [] |

## Acting

## agent-commits-only-when-asked · MUST
Only a person decides what is committed. The main agent commits only when a person asks it to, on the working branch.

| Why | Check | Tags |
|---|---|---|
| a commit records a decision under the person's name; the person makes it. | review | [] |

## agent-never-merges-or-pushes-to-main · MUST
An agent never merges and never pushes to the main line. It pushes its branch and opens the pull request only when a person asks.

| Why | Check | Tags |
|---|---|---|
| merging is the decision that ships a change, and it belongs to the person who answers for it. | review | [] |

## no-tool-attribution · MUST
Commits, pull requests and documents carry no attribution to the tool or model that helped write them.

| Why | Check | Tags |
|---|---|---|
| the person who submits a change answers for it; an attribution line adds noise and no accountability. | review | [] |

## Delegating

## sub-agent-never-touches-live-systems → consent-before-irreversible-actions
A sub-agent never runs a live system and never calls a real external service.

| Why | Check | Tags |
|---|---|---|
| a sub-agent acts without the person watching and has no chat in which to ask for consent, so these actions stay with the agent the person talks to. | review | [] |

## sub-agent-only-does-the-work · MUST
A sub-agent does the work it is given and nothing more: it never commits, never pushes and never merges.

| Why | Check | Tags |
|---|---|---|
| a sub-agent acts without the person watching, so every decision about the history stays with the agent the person talks to. | review | [] |
