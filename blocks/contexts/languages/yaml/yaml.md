---
id: yaml
summary: "YAML files: scalars, keys, aliases, loaders and the extension."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**/*.yaml", "**/*.yml"]
---

# YAML

> YAML, the format of configuration, pipelines and manifests, read by parsers that follow different versions of it: YAML 1.1 and 1.2 resolve the same unquoted word to different types, and some loaders build a language's objects from the tags a file carries.

## Code

### anchor-aliased-at-least-once → dead-code-deleted · MUST

Every anchor a file declares is used by an alias.

| Why | Tags |
|---|---|
| an anchor no alias uses labels nothing, and a reader keeps looking for the use it promises. | [] |

### collection-written-in-block-style · MUST

A sequence or a mapping is written in block style, one entry to a line; flow style — `[a, b]`, `{key: value}` — is never written, save an empty `[]` or `{}`.

| Why | Tags |
|---|---|
| an entry on a line of its own is read, changed and reviewed one line at a time, and a diff shows the one entry that changed. | [] |

## Types

### boolean-written-true-or-false · MUST

A boolean is written `true` or `false`, in lower case.

| Why | Tags |
|---|---|
| YAML 1.1 also reads `yes`, `no`, `on` and `off` as booleans while YAML 1.2 reads them as text, so any other spelling means different things to different readers. | [data] |

### ambiguous-scalar-quoted · MUST

A plain scalar meant as text that any reader might resolve to another type is quoted — `"no"`, `"on"`, `"null"`, `"~"`, `"3.10"`, `"0755"`, `"1:20"`, `"2026-10-11"` — save a key the format's own reader defines, such as a workflow's `on`.

| Why | Tags |
|---|---|
| a YAML 1.1 reader turns `no` into false, `0755` into 493, `1:20` into 80 and a date into a timestamp, and every reader turns `3.10` into 3.1, so the value changes with no error. | [data] |

### mapping-key-unique · MUST

A key appears once in its mapping.

| Why | Tags |
|---|---|
| the specification forbids a repeated key, yet many parsers keep the last value silently, so the first one reads as set while it does nothing. | [data] |

### merge-key-never-used · SHOULD

A mapping never uses the merge key `<<`, save in a format whose own reader defines it, as Compose's does.

| Why | Tags |
|---|---|
| the merge key belongs to YAML 1.1 alone: a YAML 1.2 reader takes `<<` as an ordinary key, and the readers that merge do not merge alike. | [data] |

### reader-resolves-scalars-by-the-core-schema · SHOULD

A YAML reader the program runs resolves plain scalars by YAML 1.2's core schema.

| Why | Tags |
|---|---|
| under the core schema only `true` and `false` are booleans and no word turns into a date or a base-60 number, so the program reads what the writer meant. | [data] |

## Security

### outside-yaml-loaded-by-a-safe-loader → outside-input-never-rebuilt-as-objects · MUST

YAML from outside the program is loaded by a loader that builds only mappings, sequences and plain scalars, and refuses a tag that names a type of the language.

| Why | Tags |
|---|---|
| a loader that honours such a tag builds the object the sender names and runs its constructor, which hands the sender the program. | [security] |

### alias-expansion-bounded → outside-input-bounded-before-it-is-parsed · MUST

YAML from outside the program is loaded with a bound on how many aliases to collections it expands, or with aliases refused.

| Why | Tags |
|---|---|
| a few lines of nested aliases expand into billions of nodes, so a small file exhausts the reader's memory and time. | [security, performance] |

## Layout

### yaml-file-ends-in-yaml → format-has-one-extension · SHOULD

A YAML file ends in `.yaml`, the extension YAML's own site asks for, never `.yml`, save a file a tool reads only by a fixed name.

| Why | Tags |
|---|---|
| one spelling lets every glob, tool and reader find every YAML file, and a name a tool fixes is not the project's to choose. | [] |

### yaml-file-holds-one-document · SHOULD

A YAML file holds one document, save where its format reads a stream of several, as Kubernetes manifests do.

| Why | Tags |
|---|---|
| a reader that expects one document fails on the second or reads only the first, and a schema describes one document. | [] |
