# Publishing

> Governs the identity a version is published under.

## Identity

### version-published-without-a-long-lived-token → credential-has-least-privilege · MUST

A version is published without a long-lived token: by an identity the registry issues to the one run that publishes it where the registry offers one — otherwise by a token scoped to the unit, short-lived and held only by the publishing run — or, for a unit's first version, before the registry can trust a run, by a person who proves a second factor.

| Why |
|---|
| a long-lived publishing token is the credential attackers want most, while an identity that lives for one run leaves nothing to steal. |

### version-published-with-provenance · MUST

A version a run publishes carries provenance the registry records, where the registry records it: the repository, the commit and the run it was built from.

| Why |
|---|
| a consumer can then check that the version was built from the source it claims, and one published from elsewhere stands out. |

## Requirements for implementation

### publishing-tool-supports-run-identity-and-provenance · MUST

Where the registry offers them, the publishing tool publishes by an identity issued to the run, with no stored token, and records provenance.

| Why |
|---|
| without these, the rules of publishing cannot be kept through the tool. |
