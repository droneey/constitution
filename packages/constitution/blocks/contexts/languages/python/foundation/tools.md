# Tools

> Governs the tools that hold the rules in Python, and their findings: how a finding is suppressed.

## Findings

### suppression-names-its-code-and-reason → suppression-states-its-reason · MUST

A suppression comment gives its reason after its codes and ` -- `: `# noqa: S608 -- the table name comes from an enum`.

| Why |
|---|
| one separator puts the reason of every suppression in the same place, whichever tool's comment it is. |
