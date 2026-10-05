# Package

## Versions and releases

## versions-follow-semver → breaking-change-ships-its-migration
Versions follow semantic versioning: major for a breaking change of an entry, minor for an addition, patch for a fix.

| Why | Check | Tags |
|---|---|---|
| a consumer reads the version to decide whether an update is safe; a version that lies breaks them. | review | [] |

## release-job-owns-publishing → publishing-by-workflow-identity
The release job publishes every version. A new package is published once by a person with two-factor authentication, and from then on the release job alone publishes it.

| Why | Check | Tags |
|---|---|---|
| a version published from a person's machine skips the check the release job runs, and its provenance names no reviewed commit. | review | [] |
