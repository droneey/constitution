# Config file

> Governs the schema of the config file, published for its editors.

## General

### json-schema-from-pydantic → published-schema-generated-from-code · MUST

The published JSON Schema is built from the config file's model by `model_json_schema()`, or by `TypeAdapter(...).json_schema()` for a union.

| Why |
|---|
| the schema editors read then comes from the code, and cannot drift from it. |
