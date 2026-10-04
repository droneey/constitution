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

## no-tool-attribution · MUST
Nothing submitted under a person's name — a change, its description, a document — carries an attribution to the tool or model that helped write it.

| Why | Check | Tags |
|---|---|---|
| the person who submits a change answers for it; an attribution line adds noise and no accountability. | review | [] |

## Delegating

## sub-agent-never-touches-live-systems → consent-before-irreversible-actions
A sub-agent never runs a live system and never calls a real external service.

| Why | Check | Tags |
|---|---|---|
| a sub-agent acts without the person watching and has no chat in which to ask for consent, so these actions stay with the agent the person talks to. | review | [] |

