# Tools

> Governs the tools that read a JSON configuration: the schema it names for them.

## Schema

### schema-named-in-the-schema-key → configuration-names-its-schema · SHOULD

Where its reader accepts the key, every configuration written in JSON names its reader's schema in its `$schema` key.

| Why |
|---|
| a schema named anywhere else reaches an editor only through that editor's own configuration or a catalog entry that matches the file's name, so in every other editor a misspelt or misplaced key goes unmarked while its tool ignores it in silence. |
