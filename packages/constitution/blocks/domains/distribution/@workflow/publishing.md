# Publishing

> Governs how a version of a distributed package is published: the identity it is published under and its provenance.

## Identity

### version-published-without-a-long-lived-token → credential-short-lived · MUST

Every version of a distributed package is published without a long-lived token wherever its registry offers another way. That way is the identity the registry issues to the one run that publishes it or, where it issues none, a token scoped to the package, short-lived and held only by the publishing run. Exempt: a package's first version, which a person who proves a second factor may publish before the registry can trust a run.

#### Why

A long-lived publishing token is the credential attackers want most, and once stolen it publishes in the project's name until someone notices, while an identity that lives for one run leaves nothing to steal — least privilege.

#### Examples

```text title="Avoid"
publishing run of price-kit
  credential   REGISTRY_TOKEN
  made         2024-03-02
  expires      never
```

```text title="Prefer"
publishing run of price-kit
  credential   identity the registry issues
               to this run, trusted for the
               repository's release workflow
  expires      when the run ends
```

### version-published-with-provenance · MUST

Wherever the registry records provenance, every version of a distributed package that a run publishes carries it. The provenance names the repository, the commit and the run the version was built from.

#### Why

Without it a consumer cannot check that a version was built from the source it claims, and one published from elsewhere passes for the real one.

#### Examples

```text title="Avoid"
price-kit 2.2.0 on the registry
  provenance   none
```

```text title="Prefer"
price-kit 2.2.0 on the registry
  provenance   repository code.example/shop/price-kit
               commit     3f9c2ab
               run        release 418
```
