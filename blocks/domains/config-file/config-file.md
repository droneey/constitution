---
id: config-file
summary: "A file its user writes and the program reads: shape, secrets, schema."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# Config file

> A file its user writes and the program reads to know what to do — its configuration, a declaration of the state it should reach: its shape is the program's and parsed strictly, its secrets are references, and editors get its schema.

## Shape

### config-file-rejects-unknown-keys → own-shape-strict-other-shape-tolerant · MUST
The config file is a shape the program owns, though its user writes it: a key the program does not know fails the read.

| Why | Tags |
|---|---|
| a misspelt key would otherwise be ignored in silence, and the config file would say something the program never reads. | [data] |

### config-file-variants-selected-by-a-discriminant → illegal-state-unrepresentable · MUST
A section of the config file that takes several forms is a union selected by a discriminant field.

| Why | Tags |
|---|---|
| each form is then checked by its own schema, and a wrong one fails before anything runs, with a message that names the field. | [data, errors] |

### config-file-value-kind-has-one-syntax · SHOULD
Each kind of value in the config file — a size, a duration — is written in one syntax and read by one parser.

| Why | Tags |
|---|---|
| a user learns one way to write a size, and the program never guesses which one was meant. | [data] |

## Reading

### config-file-constraints-checked-on-read → outside-value-untyped-until-parsed · MUST
Every constraint between fields of the config file is checked when the config file is read, before the program acts on any of it, never at the point of use.

| Why | Tags |
|---|---|
| an impossible combination found mid-run fails after part of the work is done, far from the line that caused it. | [data, errors] |

## Secrets

### config-file-secret-written-as-a-reference · MUST
A secret in the config file is written as a reference by name — to the environment or to a secret store the program reads — never as its value.

| Why | Tags |
|---|---|
| the config file can then be committed, shared and reviewed without leaking what it needs. | [security] |

### config-file-reference-resolved-on-read → configuration-parsed-once-at-start · MUST
Every reference the config file makes is resolved when the config file is read — from the environment, the local environment file beside the config file, or the secret store it names — and the read fails naming every one that is missing.

| Why | Tags |
|---|---|
| a missing secret then fails before anything is done, with the full list of what to set. | [security, errors] |

## Schema

### published-schema-generated-from-code → generated-file-never-edited · MUST
The schema published for editors is generated from the program's own schema of the config file, never written by hand.

| Why | Tags |
|---|---|
| a schema written twice drifts, and editors then accept files the program rejects. | [data] |

### published-schema-copy-checked-by-a-spec · MUST
The copy of the published schema kept in the repository is compared by a spec with a fresh generation, and differs in nothing.

| Why | Tags |
|---|---|
| a stale copy is what editors fetch, and only a spec notices that the code's schema moved on without it. | [testing, data] |

### config-file-points-editors-at-the-schema · SHOULD
The config file points editors at the published schema.

| Why | Tags |
|---|---|
| the editor then checks and completes the config file as it is written. | [ux] |

## Requirements for implementation

### schema-library-rejects-unknown-keys · MUST
The schema library offers strict objects that fail on an unknown key.

| Why | Tags |
|---|---|
| without it, a config file with a misspelt key is read as if the key were not there. | [data] |

### schema-library-selects-unions-by-a-discriminant · MUST
The schema library offers unions selected by a discriminant field, with an error that names the field.

| Why | Tags |
|---|---|
| without it, a section's forms cannot each be checked by their own schema and reported as such. | [data, errors] |

### schema-library-generates-json-schema · MUST
The schema library generates a JSON Schema from the program's schema.

| Why | Tags |
|---|---|
| without it, the schema editors read cannot come from the code, and drifts. | [data] |
