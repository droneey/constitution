# Models

> Governs a model: how strict it is, whether it changes, the secrets it holds, and the forms of pydantic's API it uses.

## General

### owned-documents-strict-vendor-answers-tolerant → own-shape-strict-other-shape-tolerant · MUST

A model of a document the program owns sets `ConfigDict(extra='forbid', strict=True)`; a model of a vendor's answer keeps `extra='ignore'`.

| Why | Tags |
|---|---|
| `extra='forbid'` fails on an unknown key and `strict=True` on a value of another type, which pydantic otherwise converts. | [] |

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
