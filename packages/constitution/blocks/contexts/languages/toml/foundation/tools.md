# Tools

> Governs the schema a configuration names for the tools that read it.

## Schema

### toml-configuration-names-its-schema · SHOULD

A configuration written in TOML names its schema on its first line — `#:schema <schema URL>` — wherever its reader publishes one.

| Why |
|---|
| an editor then checks and completes every key as it is written, so a misspelt or misplaced key shows before the tool ignores it. |
