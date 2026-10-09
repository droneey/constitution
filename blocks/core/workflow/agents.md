# Agents

> Governs the working agreement with agents.

## Deciding

### consent-given-for-the-actions-it-names · MUST
Consent a rule asks for is given by the person where the agent asks for it — a chat, an issue, a review of a change — for the actions it names, and never carries over to others; a standing grant is the only go-ahead given before an agent asks.

| Why | Tags |
|---|---|
| consent is given where the person who answers for an action sees it asked, and only for what they saw. | [security] |

### agent-asks-before-a-consequential-change · MUST
An agent asks before it adds a dependency or a layer, or changes the entry a package publishes, a schema or a stored format, and goes on only with a person’s go-ahead for that change, unless the task names that change.

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
Only a person decides what of an agent’s work is recorded, shared or shipped; the agent does so only when the person asks or a standing grant names that act.

| Why | Tags |
|---|---|
| recording, sharing and shipping a change are decisions made under the person’s name. | [] |

### submitted-change-read-by-its-person · MUST
A person submits an agent's change only once they have read it and can explain it.

| Why | Tags |
|---|---|
| the person who submits a change answers for it, and a change nobody read is answered for by nobody. | [] |

### agent-permissions-kept-with-the-project · SHOULD
The project’s permission settings for agents, deny rules included, live in the project’s files, the same for every person; only each person’s own overrides stay on their machine.

| Why | Tags |
|---|---|
| settings kept with the project give every person’s agent the same limits. | [security] |

### submission-carries-no-tool-attribution · MUST
A submission made under a person’s name — a change, its description, a document — carries no attribution to the tool or the model that helped write it, unless the policy of the project that receives it asks for a disclosure.

| Why | Tags |
|---|---|
| the person who submits a change answers for it, and an attribution line adds noise and no accountability. | [] |

## Delegating

### sub-agent-only-does-the-work · MUST
A sub-agent does the work it is given and nothing more; whether that work is recorded, shared or shipped stays with the agent the person talks to.

| Why | Tags |
|---|---|
| a sub-agent acts without the person watching. | [] |

### sub-agent-never-acts-on-a-live-system · MUST
A sub-agent never runs or changes a live system and never sends anything through a real outside service; reading one is allowed.

| Why | Tags |
|---|---|
| a sub-agent has no chat in which to ask for consent. | [] |
