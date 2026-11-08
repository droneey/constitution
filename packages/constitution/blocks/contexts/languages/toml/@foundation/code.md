# Code

> Governs any TOML no other chapter governs: the version a file is written in and the form of its tables.

## Versions

### toml-written-in-1-0-until-every-reader-reads-1-1 · MUST

While any reader of a TOML file reads only TOML 1.0, that file holds only what 1.0 allows. It holds nothing 1.1 added, such as an inline table across lines or with a trailing comma, a `\e` or `\x` escape, or a time without its seconds.

| Why |
|---|
| a reader of 1.0, as the parsers of many standard libraries still are, refuses the whole file for one construct of 1.1 — TOML 1.0. |

## Tables

### large-table-written-as-a-section · SHOULD

Every table whose line, written inline with its key, would be longer than 100 columns is a section, `[table]`, never inline. The 100 columns are the width `formatters-share-one-width` sets.

| Why |
|---|
| a section holds one key to a line, so a diff shows the one key that changed, while a long inline table is one line that every change rewrites. |
