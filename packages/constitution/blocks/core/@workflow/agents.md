# Agents

> Governs how an agent's work is designed with its person, reviewed and submitted.

## Vocabulary

A **submission** is an agent's work offered for acceptance into the project, to become an accepted change, or for sharing or for shipping.

An **accepted change** is one that whoever the project trusts with that decision has taken into what the project builds and ships from.

A **review round** is one review of a change and the fixes it asks for.

## Design

### design-settled-with-its-person-first · SHOULD

Every question of design is settled with the agent's person before code is written for it. Exempt: a question agent-asks-before-a-consequential-change already takes to the person.

| Why |
|---|
| code written on an unsettled design is rewritten when it is settled. |

### design-question-brought-with-its-cost · SHOULD

Every question of design comes to the agent's person with its cost, the code and specs it adds.

| Why |
|---|
| a person who decides without the cost chooses a design other than the one that gets built. |

### grown-design-cost-taken-back-to-the-person · SHOULD

Every design whose cost grows past what was settled goes back to the agent's person before more is built.

| Why |
|---|
| a cost that outgrew the settled one makes the settled design a decision nobody took, and the person learns of it only when the work is done. |

## Review

### agent-review-stops-after-three-rounds · SHOULD

Every review between agents of one change stops after three review rounds.

| Why |
|---|
| each round's fixes give the next round something new to find, so a loop between agents grows the change instead of settling it. |

### review-left-open-goes-to-the-person · MUST

Everything the third round of a review between agents still finds goes to the agent's person, with the fixes tried.

| Why |
|---|
| what three rounds left open is a decision for the person, and a finding dropped when the review stops ships as a defect nobody chose. |

## Submission

### person-decides-what-is-submitted · MUST

Only a person decides what of an agent's work is submitted. An agent submits only when its person asks or a standing grant names the act.

| Why |
|---|
| accepting, sharing and shipping a change are decisions made under the person's name, so an agent that takes them alone makes the person answer for what they never chose. |

### sub-agent-never-submits · MUST

Every sub-agent hands its work back to the agent that delegated to it, never submitting it.

| Why |
|---|
| the person sees only the agent they talk to, so a submission a sub-agent makes is one no person asked for or saw. |

### submitted-change-read-by-its-person · MUST

Every agent's change is submitted only once a person has read it and can explain it. Exempt: a change an agent submits under a standing grant with no person present, which a person reads and can explain before it is accepted.

| Why |
|---|
| the person who submits or accepts a change answers for it, and a change nobody read is answered for by nobody. |

### submission-carries-no-agent-attribution · MUST

Every submission made under a person's name answers to that person alone, with no attribution to an agent. No agent or language model that helped write it is named anywhere, such as in a change, its description or a document.

| Why |
|---|
| an attribution names an agent as answerable where only the person is, and readers then weigh the change by its agent instead of by its review. A co-author line in a change is also read by tools: the service that keeps the changes lists the agent as a contributor, and a contributor-agreement check there blocks a change whose co-author cannot sign. |
