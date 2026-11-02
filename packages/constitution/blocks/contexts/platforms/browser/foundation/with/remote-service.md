# Remote service

> Governs how a tab left open across releases keeps up with the server it calls.

## Versions

### outdated-tab-moves-to-the-current-release → client-below-the-oldest-supported-release-updates-first · SHOULD

A tab older than the oldest release its server supports moves to the current release. It moves by a release reload.

| Why |
|---|
| a tab stays open for days across releases, and its next call then sends a format the server no longer reads, and fails. |
