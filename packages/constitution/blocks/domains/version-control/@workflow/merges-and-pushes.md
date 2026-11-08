# Merges and pushes

> Governs what an agent may merge and push.

## General

### agent-never-merges · MUST

No agent merges a change request.

| Why |
|---|
| merging ships the change, so an agent that merges ships under its person's name what that person never decided to ship. |

### agent-never-pushes-to-the-main-line → person-decides-what-is-submitted · MUST

No agent pushes to the main line, even where its rights would allow it.

| Why |
|---|
| a holder of admin rights passes the version-control branch's protection, so an agent with those rights that pushes ships to the main line a change no person reviewed. |

### agent-never-force-pushes → agent-asks-before-an-irreversible-action · MUST

No agent force-pushes to any version-control branch, which replaces its shared repository history.

| Why |
|---|
| repository history others have fetched is theirs as much as the agent's, and a rewrite of it is lost work nobody asked for. |
