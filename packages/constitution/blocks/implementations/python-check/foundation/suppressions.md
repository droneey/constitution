# Suppressions

> Governs how a finding of python-check is lifted.

## General

### python-check-ignore-names-its-check-and-reason → suppression-silences-one-finding · MUST

A finding of python-check is lifted only by `# python-check: ignore[function-lines] -- <reason>` on the `def` line of the function it reports, the one suppression the tool reads.

| Why |
|---|
| python-check reads no other form, so a comment of another shape lifts nothing, and the reason after `--` is what a reviewer judges the lift by. |
