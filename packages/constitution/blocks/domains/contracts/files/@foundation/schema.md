# Schema

> Governs the schema published for editors.

## Vocabulary

The **editor schema** is the schema that editors read to check and complete the config file, wherever the file's format has a schema language: a JSON Schema for a file in JSON, YAML or TOML.

## General

### published-schema-generated-from-code → generated-file-never-edited · MUST

Every editor schema is generated from the config schema, never written by hand.

#### Why

A schema written twice drifts, and editors then accept files the program rejects — a single source of truth.

#### Examples

```text title="Avoid"
deploy-tool/
├── schema/
│   └── deploy.schema.json      written by hand
└── src/config/
    └── deploy-config.schema
```

```text title="Prefer"
deploy-tool/
├── schema/
│   └── deploy.schema.gen.json
├── scripts/
│   └── generate-editor-schema
└── src/config/
    └── deploy-config.schema
```

### committed-editor-schema-matches-a-fresh-generation · MUST

Every copy of the editor schema kept in the repository differs in nothing from a fresh generation. A spec compares the two.

#### Why

A stale copy is what editors fetch, and only a spec notices that the config schema moved on without it.

#### Examples

```pseudo title="Avoid"
test "should hold a valid editor schema"
  # Arrange
  let committed = readFile("schema/deploy.schema.gen.json")
  # Act
  let valid = isJsonSchema(committed)

  # Assert
  assert valid
```

```pseudo title="Prefer"
test "should match a fresh generation of the editor schema"
  # Arrange
  let committed = readFile("schema/deploy.schema.gen.json")
  # Act
  let fresh = toJsonSchema(deployConfigSchema)

  # Assert
  assert fresh is committed
```
