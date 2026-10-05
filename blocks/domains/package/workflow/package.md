# Package

## Versions and releases

## one-version-for-all-packages · MUST
All packages of a repository share one version; two packages at different versions are an error.

| Why | Check | Tags |
|---|---|---|
| one version says which packages were released together and work together. | tool/versions | [] |

## versions-follow-semver → breaking-change-ships-its-migration
Versions follow semantic versioning: major for a breaking change of an entry, minor for an addition, patch for a fix.

| Why | Check | Tags |
|---|---|---|
| a consumer reads the version to decide whether an update is safe; a version that lies breaks them. | review | [] |
