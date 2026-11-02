# Models

> Governs a pydantic model: how strict it is, whether it changes, the secrets it holds, the values it builds, and the forms of pydantic's API it uses.

## General

### owned-documents-strict-vendor-answers-tolerant → own-shape-strict-other-shape-tolerant · MUST

A pydantic model of a document the program owns is strict, and one of a vendor's answer tolerant. The first sets `ConfigDict(extra='forbid', strict=True)`, and the second keeps `extra='ignore'`.

| Why |
|---|
| pydantic otherwise drops an unknown key and converts a value of another type, so the program's own document passes with what the program does not know, while a vendor's answer refused for a field it added breaks on the vendor's next release; `extra='forbid'` fails on the key and `strict=True` on the value. |

### models-frozen → value-immutable-by-default · SHOULD

A pydantic model sets `frozen=True` in its `ConfigDict`.

| Why |
|---|
| a pydantic model that can change after its parse holds a value its check never saw, and every holder of it sees the change. |

### secrets-typed-secret-str → secret-kept-out-of-output · MUST

A secret a pydantic model holds is typed `SecretStr`. It may be a token, a password or a key, and `get_secret_value()` is called only where the secret is sent.

| Why |
|---|
| a secret typed `str` prints and serialises in clear, so a pydantic model logged or dumped whole leaks it, while `SecretStr` prints and serialises as asterisks. |

### pydantic-two-forms-only → deprecated-form-never-used · MUST

A pydantic model uses only pydantic 2's forms. These are `model_config = ConfigDict(...)`, `field_validator` and `model_validator`, `model_validate` and `model_validate_json`, `model_dump` and `model_dump_json`, `model_copy` — never an inner `class Config`, `validator`, `root_validator`, `parse_obj`, `parse_raw`, `dict()`, `json()`, `copy()` or the `pydantic.v1` module.

| Why |
|---|
| code on the old forms breaks when pydantic removes them, as it deprecated them to do. |

### model-builds-values-through-their-own-check → parsed-value-built-through-its-own-check · MUST

A pydantic model builds a value that keeps an invariant through the value's dataclass, in an `AfterValidator` or a `field_validator`. It raises the value's failure again as a `ValueError` or a `PydanticCustomError`.

| Why |
|---|
| pydantic lists only a `ValueError`, an `AssertionError` or a `PydanticCustomError` in its `ValidationError`, so a value's own error raised as it is escapes the parse unlisted. |
