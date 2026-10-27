# Merges and pushes

> Governs what an agent may merge and push.

## General

### agent-never-merges → person-decides-what-is-committed-or-shipped · MUST

An agent never merges a change request; the person who answers for it does.

| Why |
|---|
| merging is the choice that ships a change, and it belongs to the person who answers for it. |

### agent-never-pushes-to-the-main-line → person-decides-what-is-committed-or-shipped · MUST

An agent never pushes to the main line, even where its rights would allow it.

| Why |
|---|
| a holder of admin rights may pass the protection, so an agent that holds them is the last guard against the push. |

### agent-never-force-pushes → agent-asks-before-an-irreversible-action · MUST

An agent never force-pushes, to any branch.

| Why |
|---|
| history others have fetched is theirs as much as the agent's, and a rewrite of it is lost work nobody asked for. |
