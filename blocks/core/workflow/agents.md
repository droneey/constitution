# Agents

> Governs the working agreement with agents.

## Deciding

### design-settled-with-its-person-first · SHOULD
A question of design is settled with its person — in the chat, an issue or a review — before code is written for it.

| Why | Tags |
|---|---|
| code written on an unsettled design is rewritten when it is settled. | [] |

### agent-writes-tests-first-from-a-description · SHOULD
When a behaviour is described before it is built, an agent writes its tests from the description first; a person may write the code first.

| Why | Tags |
|---|---|
| tests written from the description prove what was asked, not what was built. | [testing] |

## Acting

### person-decides-what-is-committed-or-shipped · MUST
Only a person decides what of an agent’s work is committed, shared or shipped; the agent does so only when the person asks or a standing grant names that act.

| Why | Tags |
|---|---|
| committing, sharing and shipping a change are decisions made under the person’s name. | [] |

### submitted-change-read-by-its-person · MUST
A person submits an agent's change only once they have read it and can explain it.

| Why | Tags |
|---|---|
| the person who submits a change answers for it, and a change nobody read is answered for by nobody. | [] |

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

