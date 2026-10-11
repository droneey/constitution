# Releases

> Governs how versions are numbered.

## Versions

### versions-follow-semver · MUST
Versions follow semantic versioning: major for a breaking change of an entry, minor for an addition, patch for a fix.

| Why | Tags |
|---|---|
| a consumer reads the version to decide whether an update is safe, and a version that lies breaks them. | [] |

### runtime-floor-raised-only-in-a-minor · MUST
A unit's runtime floor is raised only in a minor or a major release, never in a patch.

| Why | Tags |
|---|---|
| a consumer that takes patches automatically must never lose its runtime to one. | [] |

