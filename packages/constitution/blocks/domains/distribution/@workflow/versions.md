# Versions

> Governs how the versions of a distributed package are numbered, compared and kept, and when its runtime floor moves.

## General

### versions-follow-one-declared-scheme · MUST

Every version of a distributed package follows the one versioning scheme its project declares: semantic versioning, or calendar versioning under a deprecation period. Under semantic versioning major is for a breaking change of an entry, minor for an addition and patch for a fix. Under calendar versioning the version opens with its release's date, at least its year, and no entry is removed or changed in meaning before the period the project states has passed since the release that deprecated it. Under either, a pre-release carries its label after a hyphen, as `2.0.0-rc.1` or `2026.11.0-rc.1`. Exempt: a pre-release written in the form its ecosystem's version standard normalises it to, such as `2.0.0rc1`.

| Why |
|---|
| a consumer reads the version and the scheme behind it to decide whether an update is safe: semantic versioning names a break by its major, calendar versioning promises that no break comes before the stated period, and a version that keeps neither promise breaks them — Semantic Versioning, and Calendar Versioning. |

### published-version-never-replaced · MUST

No version of a distributed package is replaced once published. Its number is never reused, even after it is withdrawn, and a fix ships as a new version.

| Why |
|---|
| a consumer who installed a version must get the same code every time, and a replaced one lets whoever publishes swap it under them. |

### release-entries-compared-with-the-last-release · MUST

Every release of a distributed package compares its published entries, and its commands and their options, with those of the last release. The comparison fails on every removal or change of meaning of one of them. Exempt: the removal or change of meaning of an entry an earlier release deprecated, naming this version or an earlier one as its removal version.

| Why |
|---|
| a break nobody noticed ships in a version its consumers trust not to break them, a minor under semantic versioning or one inside the deprecation period under calendar versioning, while a removal its deprecation announced is the step its consumers were told to expect. |

### runtime-floor-raised-only-as-a-breaking-change · MUST

Every raise of a distributed package's runtime floor is released as a breaking change: as a major version under semantic versioning, and under calendar versioning only once the deprecation period has passed since a release that announced it. Exempt: a raise released otherwise where the registry's resolver skips a release whose floor the consumer's runtime misses.

| Why |
|---|
| a consumer takes without reading it every patch, every minor under a range and every calendar version inside the deprecation period, so a floor raised there breaks a consumer whose resolver does not keep it on the last release that runs — Semantic Versioning, and Calendar Versioning. |
