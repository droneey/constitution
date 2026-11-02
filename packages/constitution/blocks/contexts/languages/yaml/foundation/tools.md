# Tools

> Governs the tools that read a YAML configuration: the schema it names for them.

## Schema

### yaml-configuration-names-its-schema → configuration-names-its-schema · SHOULD

A configuration written in YAML names its reader's schema on its first line. The line is `# yaml-language-server: $schema=<schema URL>`.

| Why |
|---|
| a schema named anywhere else is not found by YAML editors, so the file is checked and completed against nothing. |
