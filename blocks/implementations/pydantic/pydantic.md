---
id: pydantic
summary: pydantic parses what crosses the program's edge into models.
requires: [python]
extends: null
abstract: false
languages: []
dictionary: [pydantic, Pydantic, pydantic-settings, BaseSettings, SecretStr]
governs: ["**/models/**", "**/adapters/**", "**/root/**"]
---

# pydantic

> Parses what crosses the program's edge — a request, a response, a document, the environment — into models, and stays at the edge: the business types inside are frozen dataclasses. pydantic-settings reads the environment into one settings model.

### owned-documents-strict-vendor-answers-tolerant → own-shape-strict-other-shape-tolerant · MUST
A model of a document the program owns sets `ConfigDict(extra='forbid', strict=True)`; a model of a vendor's answer keeps `extra='ignore'`.

| Why | Tags |
|---|---|
| `extra='forbid'` fails on an unknown key and `strict=True` on a value of another type, which pydantic otherwise converts. | [] |

### validation-errors-become-error-details → parse-failure-lists-every-problem · SHOULD
Input is parsed by `model_validate` or `model_validate_json`, and each entry of the `ValidationError` it raises becomes a detail, its `loc` the path and its `type` the reason, read by `errors(include_input=False)`.

| Why | Tags |
|---|---|
| `include_input=False` keeps the rejected values out of the entries pydantic returns. | [errors, security] |

### settings-model-prefixed-and-closed → configuration-parsed-once-at-start · MUST
A `BaseSettings` sets an `env_prefix` and `extra='forbid'`.

| Why | Tags |
|---|---|
| the prefix keeps the program's variables apart from those of every other tool in the process's environment, and a key of the local environment file that the model does not know fails instead of being dropped. | [] |

### models-frozen → value-immutable-by-default · SHOULD
A model sets `frozen=True` in its `ConfigDict`.

| Why | Tags |
|---|---|
| a parsed value then cannot change after the check that admitted it. | [] |

### secrets-typed-secret-str → secret-and-personal-data-kept-out-of-output · MUST
A secret a model holds — a token, a password, a key — is typed `SecretStr`, and `get_secret_value()` is called only where the secret is sent.

| Why | Tags |
|---|---|
| `SecretStr` prints and serialises as asterisks, so a model logged or dumped whole leaks no secret. | [security] |

### pydantic-two-forms-only → deprecated-form-never-used · MUST
A model uses pydantic 2's forms — `model_config = ConfigDict(...)`, `field_validator` and `model_validator`, `model_validate` and `model_validate_json`, `model_dump` and `model_dump_json`, `model_copy` — never an inner `class Config`, `validator`, `root_validator`, `parse_obj`, `parse_raw`, `dict()`, `json()`, `copy()` or the `pydantic.v1` module.

| Why | Tags |
|---|---|
| pydantic 2 deprecates the old forms and will remove them; a type checker reports the deprecated calls, while an inner `class Config` and the `pydantic.v1` module carry no deprecation mark and stay with the review. | [] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `schema-rejects-unknown-keys` | `ConfigDict(extra='forbid')` | yes |
| `schema-discriminated-unions` | a union of models with `Field(discriminator=...)` on a `Literal` field, whose error names the field | yes |
| `schema-exports-json-schema` | `model_json_schema()`, and `TypeAdapter(...).json_schema()` for a union | yes |
