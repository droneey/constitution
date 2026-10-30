# Tools

> Governs the schema a configuration names for the tools that read it.

## Schema

### yaml-configuration-names-its-schema → configuration-names-its-schema · SHOULD

A configuration written in YAML names its reader's schema on its first line — `# yaml-language-server: $schema=<schema URL>`.

| Why |
|---|
| the first line is where editors of YAML look for a schema. |
