# Shape

> Governs the file's shape and how it is read.

## General

### config-file-rejects-unknown-keys → own-shape-strict-other-shape-tolerant · MUST

The config file rejects a key the program does not know. The file is a shape the program owns, though its user writes it, so such a key fails the read.

| Why |
|---|
| a misspelt key would otherwise be ignored in silence, and the config file would say something the program never reads. |

### config-file-variants-selected-by-a-discriminant → illegal-state-unrepresentable · MUST

A section of the config file that takes several forms is a union selected by a discriminant field.

| Why |
|---|
| a section whose forms share one bag of optional fields accepts mixes no form allows, and a wrong one fails mid-run, or never, instead of on read with the field named — make illegal states unrepresentable. |

### config-file-value-kind-has-one-syntax · SHOULD

Each kind of value in the config file has one syntax. A kind such as a size or a duration is written in one syntax and read by one parser.

| Why |
|---|
| two syntaxes for one kind make a user guess which one a field takes, and let two parsers read one value two ways. |

## Reading

### config-file-constraints-checked-on-read → outside-value-untyped-until-parsed · MUST

Every constraint between fields of the config file is checked when the file is read. It is checked before the program acts on any of the file, never at the point of use.

| Why |
|---|
| an impossible combination found mid-run fails after part of the work is done, far from the line that caused it — fail fast. |

## Requirements for implementation

### schema-library-rejects-unknown-keys · MUST

The schema library offers strict objects that fail on an unknown key.

| Why |
|---|
| without it, a config file with a misspelt key is read as if the key were not there. |

### schema-library-selects-unions-by-a-discriminant · MUST

The schema library offers unions selected by a discriminant field, with an error that names the field.

| Why |
|---|
| a union tried form by form fails a section with the errors of every form, none naming the field that chose it, so the user cannot tell which form the section was meant to take. |
