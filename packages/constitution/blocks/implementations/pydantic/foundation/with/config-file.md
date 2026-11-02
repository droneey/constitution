# Config file

> Governs the schema of the config file, published for its editors.

## General

### json-schema-from-pydantic → published-schema-generated-from-code · MUST

The published JSON Schema is built from the config file's pydantic model by `model_json_schema()`, or by `TypeAdapter(...).json_schema()` for a union.

| Why |
|---|
| a schema written by hand drifts from the pydantic model, and an editor then offers keys the program refuses and refuses keys it reads — a single source of truth. |
