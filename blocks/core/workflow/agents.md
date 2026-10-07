# Agents

> Governs the working agreement with agents in the chat.

## Deciding

### consent-given-in-the-chat-for-one-action · MUST
Consent is given in the chat, for one action, and never carries over to the next.

| Why | Tags |
|---|---|
| the chat is where the person who answers for an action sees it asked. | [security] |

### agent-asks-before-a-consequential-change · MUST
An agent asks before it adds a dependency or a layer, or changes a public entry, a schema or a stored format, and goes on only with a person’s go-ahead for that change.

| Why | Tags |
|---|---|
| these changes reach beyond the task and are hard to take back once others build on them. | [] |

### design-settled-in-the-chat-first · SHOULD
A question of design is settled in the chat before code is written for it.

| Why | Tags |
|---|---|
| code written on an unsettled design is rewritten when it is settled. | [] |

### agent-writes-tests-first-from-a-description · SHOULD
When a behaviour is described before it is built, an agent writes its tests from the description first; a person may write the code first.

| Why | Tags |
|---|---|
| tests written from the description prove what was asked, not what was built. | [testing] |

## Acting

### person-decides-what-is-recorded-or-shipped · MUST
Only a person decides what of an agent’s work is recorded, shared or shipped; the agent does so only when the person asks.

| Why | Tags |
|---|---|
| recording, sharing and shipping a change are decisions made under the person’s name. | [] |

### agent-permissions-kept-with-the-project · SHOULD
The project’s permission settings for agents, deny rules included, live in the project’s files, the same for every person; only each person’s own overrides stay on their machine.

| Why | Tags |
|---|---|
| settings kept with the project give every person’s agent the same limits. | [security] |

### submission-carries-no-tool-attribution · MUST
A submission made under a person’s name — a change, its description, a document — carries no attribution to the tool or the model that helped write it.

| Why | Tags |
|---|---|
| the person who submits a change answers for it, and an attribution line adds noise and no accountability. | [] |

## Delegating

### sub-agent-only-does-the-work · MUST
A sub-agent does the work it is given and nothing more; whether that work is recorded, shared or shipped stays with the agent the person talks to.

| Why | Tags |
|---|---|
| a sub-agent acts without the person watching. | [] |

### sub-agent-never-touches-a-live-system · MUST
A sub-agent never runs a live system and never calls a real outside service.

| Why | Tags |
|---|---|
| a sub-agent has no chat in which to ask for consent. | [] |
