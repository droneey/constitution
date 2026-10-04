---
id: pydantic
summary: pydantic parses what crosses the program's edge into models.
requires: [python]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [pydantic, Pydantic, pydantic-settings, BaseSettings, SecretStr]
governs: ["**/models/**", "**/adapters/**", "**/root/**"]
---

# pydantic

> Parses what crosses the program's edge — a request, a response, a document, the environment — into models, and stays at the edge: the business types inside are frozen dataclasses. pydantic-settings reads the environment into one settings model.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `schema-rejects-unknown-keys` | `ConfigDict(extra='forbid')` | yes |
| `schema-discriminated-unions` | a union of models with `Field(discriminator=...)` on a `Literal` field, whose error names the field | yes |
| `schema-exports-json-schema` | `model_json_schema()`, and `TypeAdapter(...).json_schema()` for a union | yes |
