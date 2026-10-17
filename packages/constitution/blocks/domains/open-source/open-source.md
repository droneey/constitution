---
id: open-source
summary: "A public repository: its licence, its policies and its contributors."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
---

# Open source

> A repository published for anyone to read: under which licence its code may be used, where a finder reports a vulnerability before the public learns of it, and how others contribute.

## Licence

### public-repository-carries-a-licence · MUST

A public repository carries a licence file at its root, and names its copyright holder in it or in a `NOTICE` beside it.

| Why | Tags |
|---|---|
| code without a licence can be read but not lawfully used, and without its holder nobody knows whom to ask. | [] |

## Reporting

### public-repository-states-security-policy · SHOULD

A public repository carries a security policy, `SECURITY.md`, beside its private channel for reports, that says which versions get fixes and how soon a report gets its first answer.

| Why | Tags |
|---|---|
| a finder who knows which versions are fixed, and when to expect an answer, waits for the fix instead of going public. | [security] |

### public-repository-offers-private-reporting → vulnerability-reported-privately · MUST

A public repository offers a private channel for reporting a vulnerability — the forge's private reporting, or an address someone watches — named where a finder looks: its security policy, or its readme where it has none.

| Why | Tags |
|---|---|
| a report filed in the open tells every attacker of the flaw before its fix ships. | [security] |

## Contributing

### public-repository-carries-a-contribution-guide · SHOULD

A public repository that accepts contributions carries a contribution guide: how to set the project up, check a change and submit it.

| Why | Tags |
|---|---|
| a contributor who must guess the steps sends a change that fails review for reasons nobody wrote down. | [] |

### public-repository-carries-a-code-of-conduct · SHOULD

A public repository that accepts contributions carries a code of conduct, an adopted standard one such as the Contributor Covenant, with a contact for reports.

| Why | Tags |
|---|---|
| without stated rules and a contact, a harassed contributor has nowhere to turn and leaves. | [] |
