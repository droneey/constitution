# Output

> Governs the YAML the program writes.

## General

### yaml-written-without-folding · SHOULD

YAML is written with `lineWidth: 0`, so no value is folded across lines.

| Why |
|---|
| a folded value moves in a diff whenever a neighbour changes. |
