# pydantic

## owned-documents-strict-vendor-answers-tolerant → documents-strict-vendor-answers-tolerant
A model of a document the program owns sets `ConfigDict(extra='forbid', strict=True)`; a model of a vendor's answer keeps `extra='ignore'`.

| Why | Check | Tags |
|---|---|---|
| `extra='forbid'` fails on an unknown key and `strict=True` on a value of another type, which pydantic otherwise converts. | test | [] |

## json-schema-from-pydantic → published-schema-generated-from-code
The published JSON Schema is built from the document's model by `model_json_schema()`, or by `TypeAdapter(...).json_schema()` for a union.

| Why | Check | Tags |
|---|---|---|
| the schema editors read then comes from the code, and cannot drift from it. | test | [] |

## validation-errors-become-error-details → parse-failure-is-one-coded-error
Input is parsed by `model_validate` or `model_validate_json`, and each entry of the `ValidationError` it raises becomes a detail, its `loc` the path and its `type` the reason, read by `errors(include_input=False)`.

| Why | Check | Tags |
|---|---|---|
| `include_input=False` keeps the rejected values out of the entries pydantic returns. | review | [errors, security] |

## models-frozen → immutable-by-default
A model sets `frozen=True` in its `ConfigDict`.

| Why | Check | Tags |
|---|---|---|
| a parsed value then cannot change after the check that admitted it. | review | [] |

## secrets-typed-secret-str → no-secret-or-personal-data-in-output
A secret a model holds — a token, a password, a key — is typed `SecretStr`, and `get_secret_value()` is called only where the secret is sent.

| Why | Check | Tags |
|---|---|---|
| `SecretStr` prints and serialises as asterisks, so a model logged or dumped whole leaks no secret. | review | [security] |

## pydantic-two-forms-only → deprecated-forms-never-used
A model uses pydantic 2's forms — `model_config = ConfigDict(...)`, `field_validator` and `model_validator`, `model_validate` and `model_validate_json`, `model_dump` and `model_dump_json`, `model_copy` — never an inner `class Config`, `validator`, `root_validator`, `parse_obj`, `parse_raw`, `dict()`, `json()`, `copy()` or the `pydantic.v1` module.

| Why | Check | Tags |
|---|---|---|
| pydantic 2 deprecates the old forms and will remove them. | review | [] |

