# Tools

> Governs the tools that read a YAML configuration: the schema it names for them.

## Schema

### schema-named-in-a-first-line-yaml-comment → configuration-names-its-schema · SHOULD

Where its reader publishes a schema, every configuration written in YAML names it in a comment on its first line. The comment takes the form its editors read.

| Why |
|---|
| a schema key in the mapping is refused by a reader that knows no such key, so a schema named anywhere else reaches an editor only through that editor's own configuration or a catalog entry that matches the file's name, and in every other editor a misspelt or misplaced key goes unmarked while its tool ignores it in silence. |
