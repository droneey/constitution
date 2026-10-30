# Versions

> Governs how versions are numbered, compared and kept, and when a runtime floor moves.

## General

### versions-follow-semver · MUST

Versions follow **semantic versioning**, **semver** for short: major for a breaking change of an entry, minor for an addition, patch for a fix; a **pre-release** carries its label after a hyphen, as `2.0.0-rc.1`.

| Why |
|---|
| a consumer reads the version to decide whether an update is safe, and a version that lies breaks them. |

### published-version-never-replaced · MUST

A version once published is never replaced and its number never reused, even after it is withdrawn; a fix ships as a new version.

| Why |
|---|
| a consumer who installed a version must get the same code every time, and a replaced one lets whoever publishes swap it under them. |

### release-entries-compared-with-the-last-release · SHOULD

A release compares its public entries with those of the last release, and a difference a consumer must adapt to is released as a breaking change.

| Why |
|---|
| a break nobody noticed ships as a minor version and breaks every consumer who trusted the number. |

### runtime-floor-never-raised-in-a-patch · MUST

A unit's runtime floor is never raised in a patch; it is raised in a minor only where the registry's resolver skips a release whose floor the consumer's runtime misses, and otherwise in a major.

| Why |
|---|
| a consumer takes every patch, and under a range every minor, without reading it; a release that drops its runtime must reach it only where its resolver keeps it on the last release that runs. |
