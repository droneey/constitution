# Distribution

> Governs where a public repository of a released program names its private channel for reporting a vulnerability.

## General

### public-repository-offers-private-reporting → vulnerability-reported-privately · MUST

Every public repository of a released program names its private channel for reporting a vulnerability in its security policy, else its readme. The channel is the private reporting of the service that hosts the repository, or an address someone watches.

#### Why

A finder who reads the code looks for the channel in the repository first, so one named only on a site or in a manifest is missed and the report is filed in the open, where every attacker reads of the flaw before its fix ships.

#### Examples

```text title="Avoid"
SECURITY.md

## Reporting
Found a vulnerability? Open an issue.
```

```text title="Prefer"
SECURITY.md

## Reporting
Report a vulnerability privately,
through the repository's private
vulnerability reporting or to
security@shop.example. Never in
an issue.
```
