# Releases

> Governs how versions are numbered.

## Versions

### versions-follow-semver · MUST

Versions follow semantic versioning: major for a breaking change of an entry, minor for an addition, patch for a fix.

| Why | Tags |
|---|---|
| a consumer reads the version to decide whether an update is safe, and a version that lies breaks them. | [] |

### runtime-floor-never-raised-in-a-patch · MUST

A unit's runtime floor is never raised in a patch; it is raised in a minor only where the registry's resolver skips a release whose floor the consumer's runtime misses, and otherwise in a major.

| Why | Tags |
|---|---|
| a consumer takes every patch, and under a range every minor, without reading it; a release that drops its runtime must reach it only where its resolver keeps it on the last release that runs. | [] |
