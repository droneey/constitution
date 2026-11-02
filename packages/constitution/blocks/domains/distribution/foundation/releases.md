# Releases

> Governs deprecations, a release's notes and its supply chain.

## Deprecations

### deprecation-names-replacement-and-removal → retired-code-marked-deprecated · MUST

A deprecated entry names its replacement and the version that removes it.

| Why |
|---|
| a deprecation without a replacement leaves the consumer stuck, and one without a removal version never ends. |

## Notes

### release-carries-its-notes · MUST

Every release carries notes. They say what changed, each breaking change with its migration, and every vulnerability the release fixes by its identifier.

| Why |
|---|
| a consumer decides on the notes whether and how to update, a break without its migration leaves every consumer to rediscover what changed and how to follow it, and a fixed vulnerability without its identifier is never matched to the advisory that names it. |

## Supply chain

### release-ships-an-sbom · SHOULD

Every release ships a software bill of materials. It is written in SPDX or CycloneDX and lists what the unit contains.

| Why |
|---|
| without it a user cannot tell whether a newly published vulnerability reaches them, and the EU's Cyber Resilience Act asks the maker to keep one with the technical documentation. |
