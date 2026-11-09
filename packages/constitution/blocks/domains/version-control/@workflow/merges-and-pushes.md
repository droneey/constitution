# Merges and pushes

> Governs what an agent may merge and push.

## General

### agent-never-merges · MUST

No agent merges a change request.

#### Why

Merging ships the change, so an agent that merges ships under its person's name what that person never decided to ship.

#### Examples

```text title="Avoid"
agent: checks pass and the review is approved,
       so I merged change request #128.
```

```text title="Prefer"
agent: checks pass and the review is approved.
       Change request #128 is ready for you to merge.
```

### agent-never-pushes-to-the-main-line → person-decides-what-is-submitted · MUST

No agent pushes to the main line, even where its rights would allow it.

#### Why

A holder of admin rights passes the version-control branch's protection, so an agent with those rights that pushes ships to the main line a change no person reviewed.

#### Examples

```text title="Avoid"
agent: $ push fix/131-refund-rounding:main
       pushed to main (admin rights bypassed protection)
```

```text title="Prefer"
agent: $ push fix/131-refund-rounding
       opened change request #132 into main
```

### agent-never-force-pushes → agent-asks-before-an-irreversible-action · MUST

No agent force-pushes to any version-control branch, which replaces its shared repository history.

#### Why

Repository history others have fetched is theirs as much as the agent's, and a rewrite of it is lost work nobody asked for.

#### Examples

```text title="Avoid"
agent: the branch diverged from the remote,
       so I force-pushed my version over it.
```

```text title="Prefer"
agent: the branch diverged from the remote:
       it holds two commits I do not have.
       Shall I rebase onto them, or will you?
```
