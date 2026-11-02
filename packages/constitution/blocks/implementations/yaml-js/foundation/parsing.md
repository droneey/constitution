# Parsing

> Governs how the program parses YAML with `parse`: its failures.

## General

### yaml-failures-become-one-coded-error → dependency-failure-mapped-where-it-is-wrapped · MUST

Every failure of `parse` is mapped to one coded error. The code that wraps it recognises a syntax error, a `YAMLParseError`, and an alias without its anchor, which throws a `ReferenceError`.

| Why |
|---|
| the alias's failure is no `YAMLParseError`, so a catch for that type alone lets it through as a defect, though the input is at fault and its caller could act on it. |
