# Tools

> Governs the schema a configuration names for the tools that read it.

## Schema

### yaml-configuration-names-its-schema · SHOULD

A configuration written in YAML names its schema on its first line — `# yaml-language-server: $schema=<schema URL>` — wherever its reader publishes one.

| Why |
|---|
| an editor then checks and completes every key as it is written, so a misspelt or misplaced key shows before the tool ignores it. |
