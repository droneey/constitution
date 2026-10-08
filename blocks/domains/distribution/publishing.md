# Publishing

> Governs the identity a version is published under.

## Identity

### version-published-without-a-long-lived-token → credential-has-least-privilege · MUST
A run publishes a version without a long-lived token, by an identity the registry issues to that run.

| Why | Tags |
|---|---|
| a long-lived publishing token is the credential attackers want most, while an identity that lives for one run leaves nothing to steal. | [security] |

### version-published-with-provenance · MUST
A version is published only by a run, and carries provenance the registry records: the repository, the commit and the run it was built from.

| Why | Tags |
|---|---|
| a consumer can then check that the version was built from the source it claims, and one published from a laptop stands out. | [security] |

## Requirements for implementation

### publishing-tool-supports-run-identity-and-provenance · MUST
The publishing tool publishes by an identity issued to the run, records provenance, and needs no stored token.

| Why | Tags |
|---|---|
| without these, the rules of publishing cannot be kept through the tool. | [security] |
