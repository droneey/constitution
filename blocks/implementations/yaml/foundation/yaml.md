# yaml

## yaml-failures-become-one-coded-error → parse-failure-is-one-coded-error
Every failure of `parse` becomes the one coded error: a syntax error, and an alias without its anchor, which throws a `ReferenceError`.

| Why | Check | Tags |
|---|---|---|
| the alias's failure is no `YAMLParseError`, so a catch for that type alone lets it through unmapped. | test | [] |

## yaml-written-without-folding · SHOULD
YAML is written with `lineWidth: 0`, so no value is folded across lines.

| Why | Check | Tags |
|---|---|---|
| a folded value moves in a diff whenever a neighbour changes. | test | [data] |
