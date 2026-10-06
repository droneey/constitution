---
id: yaml-js
summary: The yaml package reads and writes YAML.
requires: [typescript]
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**/adapters/**"]
---

# yaml-js

> Reads and writes YAML. It owns no word: the package is named after the format.

### yaml-failures-become-one-coded-error → parse-failure-lists-every-problem
Every failure of `parse` becomes the one coded error: a syntax error, and an alias without its anchor, which throws a `ReferenceError`.

| Why | Tags |
|---|---|
| the alias's failure is no `YAMLParseError`, so a catch for that type alone lets it through unmapped. | [] |

### yaml-written-without-folding · SHOULD
YAML is written with `lineWidth: 0`, so no value is folded across lines.

| Why | Tags |
|---|---|
| a folded value moves in a diff whenever a neighbour changes. | [data] |
