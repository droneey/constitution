---
id: open-source
summary: "A public repository: its licence, its policies and its contributors."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# Open source

> A repository published for anyone to read: under which licence its code may be used, where a finder reports a vulnerability before the public learns of it, and how others contribute.

## Licence

### public-repository-carries-a-licence · MUST
A public repository carries a licence file at its root that names its copyright holder.

| Why | Tags |
|---|---|
| code without a licence can be read but not lawfully used, and without its holder nobody knows whom to ask. | [] |

## Reporting

### public-repository-states-security-policy · SHOULD
A public repository carries a security policy, `SECURITY.md`, beside its private channel for reports, that says which versions get fixes and how soon a report gets its first answer.

| Why | Tags |
|---|---|
| a finder who knows which versions are fixed, and when to expect an answer, waits for the fix instead of going public. | [security] |

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
