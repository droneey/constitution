# Code

> Governs the version of TOML a file is written in and the form of its tables.

## Versions

### toml-written-in-1-0-until-every-reader-reads-1-1 · MUST

A TOML file is written in TOML 1.0 until every reader of it reads 1.1: no inline table across lines or with a trailing comma, no `\e` or `\x` escape, and no time without its seconds.

| Why | Tags |
|---|---|
| a reader of 1.0 — `tomllib` before its 3.15 among them — refuses the whole file for one construct of 1.1. | [errors] |

## Tables

### large-table-written-as-a-section · SHOULD

A table of more than a few short values, or one that holds another table, is written as a section, `[table]`; an inline table is kept to one short line.

| Why | Tags |
|---|---|
| a section holds one key to a line, so a diff shows the one key that changed, while a long inline table is one line that every change rewrites. | [] |
