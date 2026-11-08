# Publishing

> Governs how a version of a distributed package is published: the identity it is published under and its provenance.

## Identity

### version-published-without-a-long-lived-token → credential-short-lived · MUST

Every version of a distributed package is published without a long-lived token wherever its registry offers another way. That way is the identity the registry issues to the one run that publishes it or, where it issues none, a token scoped to the package, short-lived and held only by the publishing run. Exempt: a package's first version, which a person who proves a second factor may publish before the registry can trust a run.

| Why |
|---|
| a long-lived publishing token is the credential attackers want most, and once stolen it publishes in the project's name until someone notices, while an identity that lives for one run leaves nothing to steal — least privilege. |

### version-published-with-provenance · MUST

Wherever the registry records provenance, every version of a distributed package that a run publishes carries it. The provenance names the repository, the commit and the run the version was built from.

| Why |
|---|
| without it a consumer cannot check that a version was built from the source it claims, and one published from elsewhere passes for the real one. |
