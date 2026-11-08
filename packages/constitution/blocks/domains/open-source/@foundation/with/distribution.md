# Distribution

> Governs where a public repository of a released program names its private channel for reporting a vulnerability.

## General

### public-repository-offers-private-reporting → vulnerability-reported-privately · MUST

Every public repository of a released program names its private channel for reporting a vulnerability in its security policy, else its readme. The channel is the private reporting of the service that hosts the repository, or an address someone watches.

| Why |
|---|
| a finder who reads the code looks for the channel in the repository first, so one named only on a site or in a manifest is missed and the report is filed in the open, where every attacker reads of the flaw before its fix ships. |
