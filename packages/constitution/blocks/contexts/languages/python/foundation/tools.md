# Tools

> Governs the tools that hold the rules in Python, and their findings: how a finding is suppressed.

## Findings

### suppression-names-its-code-and-reason → suppression-silences-one-finding · MUST

A suppression comment gives its reason after its codes and ` -- `.

| Why |
|---|
| a reason placed anywhere else in the comment is read as part of its codes or missed, so a reader cannot tell at a glance whether a suppression carries one, whichever tool's comment it is. |
