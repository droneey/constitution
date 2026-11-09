# Tools

> Governs the tools that read a TOML configuration: the schema it names for them.

## Schema

### schema-named-in-a-first-line-toml-comment → configuration-names-its-schema · SHOULD

Where its reader publishes a schema, every configuration written in TOML names it in a comment on its first line. The comment takes the form its editors read.

#### Why

TOML has no key its readers accept for a schema, so a schema named anywhere else reaches an editor only through that editor's own configuration or a catalog entry that matches the file's name, and in every other editor a misspelt or misplaced key goes unmarked while its tool ignores it in silence.

#### Examples

```toml title="Avoid"
line-length = 100

[lint]
select = ["E", "F", "I", "UP", "B"]
```

```toml title="Prefer"
#:schema https://json.schemastore.org/ruff.json
line-length = 100

[lint]
select = ["E", "F", "I", "UP", "B"]
```
