# Publishing

> Governs how a version is published: the identity it is published under and its provenance.

## Identity

### version-published-without-a-long-lived-token → credential-has-least-privilege · MUST

A version is published without a long-lived token. It is published by an identity the registry issues to the one run that publishes it, where the registry offers one — otherwise by a token scoped to the unit, short-lived and held only by the publishing run — or, for a unit's first version, before the registry can trust a run, by a person who proves a second factor.

| Why |
|---|
| a long-lived publishing token is the credential attackers want most, and once stolen it publishes in the project's name until someone notices, while an identity that lives for one run leaves nothing to steal — least privilege. |

### version-published-with-provenance · MUST

A version a run publishes carries provenance, where the registry records it. The provenance names the repository, the commit and the run the version was built from.

| Why |
|---|
| without it a consumer cannot check that a version was built from the source it claims, and one published from elsewhere passes for the real one. |

## Requirements for implementation

### publishing-tool-supports-run-identity-and-provenance · MUST

The publishing tool publishes by the run's identity and records provenance, where the registry offers them. It publishes by an identity issued to the run, with no stored token.

| Why |
|---|
| a tool that publishes only by a stored token leaves a long-lived credential to steal, and one that records no provenance publishes versions no consumer can trace to their source. |
