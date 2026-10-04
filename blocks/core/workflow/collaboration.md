# Collaboration

## Deciding

## consent-given-in-the-chat-per-action → consent-before-irreversible-actions
Consent is given in the chat, for that action alone, and never carries over to the next.

| Why | Check | Tags |
|---|---|---|
| the chat is where the person who answers for an action sees it asked, and a go-ahead for one action says nothing of the next. | review | [] |

## consent-before-consequential-actions → consent-before-irreversible-actions
An agent asks before adding a dependency, a pattern or an abstraction, and before changing a public entry, a schema or a format. Consent is given as for an irreversible action.

| Why | Check | Tags |
|---|---|---|
| these changes reach beyond the task and are hard to take back once others build on them, so the person who answers for them decides. | review | [] |

## design-settled-in-chat-first · SHOULD
A design question is settled in the chat before code is written for it.

| Why | Check | Tags |
|---|---|---|
| code written on an unsettled design is rewritten when it is settled. | review | [] |

## Acting

## person-decides-what-is-recorded-or-shipped · MUST
Only a person decides what of an agent's work is recorded, shared or shipped: the agent records or shares work only when the person asks, and never takes the step that ships it.

| Why | Check | Tags |
|---|---|---|
| recording, sharing and shipping a change are decisions made under the person's name, and the person makes them. | review | [] |

## agent-permissions-kept-with-the-project → agent-runs-with-least-privilege
The project's permission settings for agents, deny rules included, live in the project's files, the same for every person's agent; only each person's own overrides stay on their machine.

| Why | Check | Tags |
|---|---|---|
| settings kept with the project give every person's agent the same limits. | review | [security] |

## no-tool-attribution · MUST
Nothing submitted under a person's name — a change, its description, a document — carries an attribution to the tool or model that helped write it.

| Why | Check | Tags |
|---|---|---|
| the person who submits a change answers for it; an attribution line adds noise and no accountability. | review | [] |

## Delegating

## sub-agent-only-does-the-work · MUST
A sub-agent does the work it is given and nothing more: whether that work is recorded, shared or shipped stays with the agent the person talks to.

| Why | Check | Tags |
|---|---|---|
| a sub-agent acts without the person watching, so every decision about the work's fate stays with the agent the person talks to. | review | [] |

## sub-agent-never-touches-live-systems → consent-before-irreversible-actions
A sub-agent never runs a live system and never calls a real external service.

| Why | Check | Tags |
|---|---|---|
| a sub-agent acts without the person watching and has no chat in which to ask for consent, so these actions stay with the agent the person talks to. | review | [] |

