---
id: open-source
summary: "A public repository: its licence and a private channel for reports."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---

# Open source

> A repository published for anyone to read: under which licence its code may be used, and where a finder reports a vulnerability before the public learns of it.

### public-repository-carries-a-licence · SHOULD
A public repository carries a licence file that names its author.

| Why | Tags |
|---|---|
| code without a licence can be read but not lawfully used, and without an author nobody can ask. | [] |

### public-repository-states-security-policy · SHOULD
A public repository carries `SECURITY.md`, which says how to report a vulnerability privately and which versions get fixes.

| Why | Tags |
|---|---|
| a finder with no private channel reports in public or not at all, and either way the users learn last. | [security] |
