# Parsing

> Governs how the program parses YAML with `parse`: its failures.

## General

### yaml-failures-become-one-coded-error → dependency-failure-mapped-where-it-is-wrapped · MUST

Every failure of `parse` that its input causes is mapped to one coded error. The code that wraps it recognises a syntax error, a `YAMLParseError`, and the `ReferenceError` it throws for an alias without its anchor or for more aliases than `maxAliasCount` allows.

| Why |
|---|
| the aliases' failures are no `YAMLParseError`, so a catch for that type alone lets them through as defects, though the input is at fault and its caller could act on it. |
