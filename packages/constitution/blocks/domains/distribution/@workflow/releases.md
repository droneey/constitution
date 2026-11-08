# Releases

> Governs a release's notes and its supply chain.

## Notes

### release-carries-its-notes · SHOULD

Every release of a distributed package carries notes that say what changed.

| Why |
|---|
| a consumer decides on the notes whether and how to update, and a release without them leaves every consumer to read the diff. |

### release-notes-give-each-breaking-changes-migration · SHOULD

The notes of every release of a distributed package give each breaking change with its upgrade path. That path is the steps by which consumers adapt to the break.

| Why |
|---|
| a break without its upgrade path leaves every consumer to rediscover what changed and how to follow it. |

### release-notes-name-each-fixed-vulnerability · MUST

The notes of every release of a distributed package name each vulnerability the release fixes by its identifier.

| Why |
|---|
| a fixed vulnerability without its identifier is never matched to the advisory that names it, so a consumer who tracks the advisory never learns which release to take. |

## Supply chain

### release-ships-an-sbom · SHOULD

Every release of a distributed package ships a software bill of materials, in SPDX or CycloneDX, that lists what the package contains.

| Why |
|---|
| without it a user cannot tell whether a newly published vulnerability reaches them, and the EU's Cyber Resilience Act asks the maker to keep one with the technical documentation. |
