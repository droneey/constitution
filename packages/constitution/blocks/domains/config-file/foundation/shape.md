# Shape

> Governs the file's shape and how it is read.

## General

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
