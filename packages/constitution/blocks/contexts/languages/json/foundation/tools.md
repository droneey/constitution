# Tools

> Governs the schema a configuration names for the tools that read it.

## Schema

### json-configuration-names-its-schema · SHOULD

A configuration written in JSON names its schema in `$schema` wherever its reader publishes one and accepts the key.

| Why |
|---|
| an editor then checks and completes every key as it is written, so a misspelt or misplaced key shows before the tool ignores it. |
