# Remote service

> Governs how a tab left open across releases keeps up with the server it calls.

## Versions

### outdated-tab-moves-to-the-current-release → client-below-the-oldest-supported-release-updates-first · SHOULD

A tab whose release is older than the oldest its server supports moves to the current release by a full load at its next navigation, or after its user accepts a reload, keeping what they typed.

| Why |
|---|
| a tab stays open for days across releases, and its next call then sends a format the server no longer reads. |
