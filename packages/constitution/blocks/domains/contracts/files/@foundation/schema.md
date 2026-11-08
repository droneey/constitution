# Schema

> Governs the schema published for editors.

## Vocabulary

The **editor schema** is the schema that editors read to check and complete the config file, wherever the file's format has a schema language: a JSON Schema for a file in JSON, YAML or TOML.

## General

### published-schema-generated-from-code → generated-file-never-edited · MUST

Every editor schema is generated from the config schema, never written by hand.

| Why |
|---|
| a schema written twice drifts, and editors then accept files the program rejects — a single source of truth. |

### committed-editor-schema-matches-a-fresh-generation · MUST

Every copy of the editor schema kept in the repository differs in nothing from a fresh generation. A spec compares the two.

| Why |
|---|
| a stale copy is what editors fetch, and only a spec notices that the config schema moved on without it. |
