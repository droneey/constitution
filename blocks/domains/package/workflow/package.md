# Package

## Versions and releases

## one-version-for-all-packages · MUST
All packages of a repository share one version; two packages at different versions are an error.

| Why | Check | Tags |
|---|---|---|
| one version says which packages were released together and work together. | tool — versions | [] |

## versions-follow-semver → breaking-change-ships-its-migration
Versions follow semantic versioning: major for a breaking change of an entry, minor for an addition, patch for a fix.

| Why | Check | Tags |
|---|---|---|
| a consumer reads the version to decide whether an update is safe; a version that lies breaks them. | review | [] |

## one-tag-publishes-every-package · SHOULD
One tag publishes every public package.

| Why | Check | Tags |
|---|---|---|
| a release is then one act that ships the packages together, never a set of packages published one at a time. | review | [] |

## changelog-from-commit-subjects · SHOULD
The changelog of a release is the commit subjects since the previous tag, features and fixes first.

| Why | Check | Tags |
|---|---|---|
| a changelog written from the history is complete by construction, and costs nothing to keep. | review | [] |
