# Package

## Versions and releases

## one-version-for-all-packages · MUST
All packages of a repository share one version; two packages at different versions are an error.
**Why:** one version says which packages were released together and work together.
**Check:** tool — versions
**Tags:** process

## versions-follow-semver · MUST
Versions follow semantic versioning: major for a breaking change of an entry, minor for an addition, patch for a fix.
**Why:** a consumer reads the version to decide whether an update is safe; a version that lies breaks them.
**Check:** review
**Tags:** process
**Implements:** `breaking-change-ships-its-migration`

## one-tag-publishes-every-package · SHOULD
One tag publishes every public package.
**Why:** a release is then one act that ships the packages together, never a set of packages published one at a time.
**Check:** review
**Tags:** process

## changelog-from-commit-subjects · SHOULD
The changelog of a release is the commit subjects since the previous tag, features and fixes first.
**Why:** a changelog written from the history is complete by construction, and costs nothing to keep.
**Check:** review
**Tags:** process
