# Code

> Governs any TOML no other chapter governs: the version a file is written in and the form of its tables.

## Versions

### toml-written-in-1-0-until-every-reader-reads-1-1 · MUST

A TOML file is written in TOML 1.0 until every reader of it reads 1.1. It holds no inline table across lines or with a trailing comma, no `\e` or `\x` escape, and no time without its seconds.

| Why |
|---|
| a reader of 1.0 (`tomllib` before its 3.15 among them) refuses the whole file for one construct of 1.1 — TOML 1.0. |

## Tables

### large-table-written-as-a-section · SHOULD

A large table is written as a section, `[table]`. A table is large when it holds more than a few short values or another table, and an inline table is kept to one short line.

| Why |
|---|
| a section holds one key to a line, so a diff shows the one key that changed, while a long inline table is one line that every change rewrites. |
