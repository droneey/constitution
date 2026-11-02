# Agents

> Governs the working agreement with the agents at work on the repository.

## Design

### design-settled-with-its-person-first · SHOULD

A question of design is settled with its person before code is written for it. It is settled in the chat, an issue or a review, and comes to the person with its cost: the code and specs it adds, the dependencies it brings and any recorded decision it touches. A cost that grows past what was settled while the work runs goes back to the person before more is built.

| Why |
|---|
| code written on an unsettled design is rewritten when it is settled, and a person who decides without the cost settles a design other than the one that gets built. |

### agent-writes-tests-first-from-a-description · SHOULD

An agent writes a described behaviour's tests first, from the description. This holds when a behaviour is described before it is built; a person may write the code first.

| Why |
|---|
| tests an agent writes after its own code prove what was built, its mistakes included, instead of what was asked — test-first development. |

## Review

### agent-review-stops-after-three-rounds · MUST

An agent's review of one change stops after three rounds. Each round holds the review and the fixes it asks for, and what the third round still finds goes to the person, with the fixes tried, instead of a fourth round.

| Why |
|---|
| each round's fixes give the next round something new to find, so a loop between agents grows the change instead of settling it, and what three rounds left open is a decision for the person. |

## Submission

### person-decides-what-is-committed-or-shipped · MUST

Only a person decides what of an agent’s work is committed, shared or shipped. The agent commits, shares or ships only when the person asks or a standing grant names that act, and a sub-agent never does.

| Why |
|---|
| committing, sharing and shipping a change are decisions made under the person’s name, so an agent that takes them on its own makes the person answer for what they never chose, and a sub-agent acts where the person does not watch. |

### submitted-change-read-by-its-person · MUST

A person submits an agent's change only once they have read it and can explain it.

| Why |
|---|
| the person who submits a change answers for it, and a change nobody read is answered for by nobody. |

### submission-carries-no-tool-attribution · MUST

A submission made under a person’s name carries no attribution to the tool or the language model that helped write it. That holds for a change, its description or a document, unless the policy of the project that receives it asks for a disclosure.

| Why |
|---|
| the person who submits a change answers for it, and an attribution line adds noise and no accountability. |
