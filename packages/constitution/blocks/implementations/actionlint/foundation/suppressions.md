# Suppressions

> Governs how a finding of actionlint is suppressed.

## General

### actionlint-ignore-names-workflow-and-message → suppression-silences-one-finding · MUST

A finding of actionlint's own checks is silenced only in `.github/actionlint.yaml`, for one workflow. It is an `ignore` pattern of its message, under `paths` keyed by that workflow's path, with the reason above it; never by `-ignore` on the command line, nor under a key that matches several workflows.

| Why |
|---|
| actionlint has no comment that silences a finding where it stands, and a pattern matches the message alone, so one on the command line or under a broad key silences that finding in every workflow it reaches. |
