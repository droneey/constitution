# Tools

> Governs the tools that read a TOML configuration: the schema it names for them.

## Schema

### toml-configuration-names-its-schema → configuration-names-its-schema · SHOULD

A configuration written in TOML names its reader's schema on its first line. The line is `#:schema <schema URL>`.

| Why |
|---|
| a schema named anywhere else is not found by TOML editors, so the file is checked and completed against nothing. |
