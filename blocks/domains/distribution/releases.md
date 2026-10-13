# Releases

> Governs versions, breaking changes, notes and the supply chain.

## Versions

### published-version-never-replaced · MUST
A version once published is never replaced and its number never reused, even after it is withdrawn; a fix ships as a new version.

| Why | Tags |
|---|---|
| a consumer who installed a version must get the same code every time, and a replaced one lets whoever publishes swap it under them. | [security] |

### release-entries-compared-with-the-last-release · SHOULD
A release compares its public entries with those of the last release, and a difference a consumer must adapt to is released as a breaking change.

| Why | Tags |
|---|---|
| a break nobody noticed ships as a minor version and breaks every consumer who trusted the number. | [] |

### unit-checked-on-every-runtime-it-supports · MUST
A unit published for others is checked on its floor's release line and on each later line of its runtime that the runtime's maintainers still support, up to the newest stable one.

| Why | Tags |
|---|---|
| a unit that claims a runtime it was never run on breaks its consumers there first. | [testing] |

## Breaking changes and deprecations

### breaking-change-ships-its-migration · MUST
A breaking change of an entry ships with a migration a consumer can follow.

| Why | Tags |
|---|---|
| a break without a migration leaves every consumer to rediscover what changed and how to follow it. | [] |

### deprecation-names-replacement-and-removal → retired-code-marked-deprecated · MUST
A deprecated entry names its replacement and the version that removes it.

| Why | Tags |
|---|---|
| a deprecation without a replacement leaves the consumer stuck, and one without a removal version never ends. | [] |

## Notes

### release-carries-its-notes · MUST
Every release carries notes: what changed, each breaking change with its migration, and every vulnerability it fixes by its identifier.

| Why | Tags |
|---|---|
| a consumer decides on the notes whether and how to update, and a fixed vulnerability without its identifier is never matched to the advisory that names it. | [security] |

## Supply chain

### release-ships-an-sbom · SHOULD
Every release ships a software bill of materials, in SPDX or CycloneDX, listing what the unit contains.

| Why | Tags |
|---|---|
| a user learns from it whether a newly published vulnerability reaches them, and the EU's Cyber Resilience Act asks the maker to keep one with the technical documentation. | [security] |

### vulnerability-reported-privately · MUST
A distributed unit names, in its manifest or its readme, where a vulnerability in it is reported privately.

| Why | Tags |
|---|---|
| a finder with no private channel reports in public, and the users learn last. | [security] |

### exploited-vulnerability-reported-in-time · MUST
An actively exploited vulnerability in a released version is reported to the authority within the times the law that binds the product sets, such as the EU Cyber Resilience Act's 24 hours for an early warning.

| Why | Tags |
|---|---|
| the deadline runs from when the maker learns of it, and a report late is a breach of its own. | [security] |
