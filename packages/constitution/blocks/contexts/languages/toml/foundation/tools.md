# Tools

> Governs the tools that read a TOML configuration: the schema it names for them.

## Schema

### toml-configuration-names-its-schema → configuration-names-its-schema · SHOULD

A configuration written in TOML names its reader's schema on its first line — `#:schema <schema URL>`.

| Why |
|---|
| the first line is where editors of TOML look for a schema. |
