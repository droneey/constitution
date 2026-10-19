# Parsing

> Governs the failures of `parse`.

## General

### yaml-failures-become-one-coded-error → parse-failure-lists-every-problem · SHOULD

Every failure of `parse` becomes the one coded error: a syntax error, and an alias without its anchor, which throws a `ReferenceError`.

| Why | Tags |
|---|---|
| the alias's failure is no `YAMLParseError`, so a catch for that type alone lets it through unmapped. | [] |
