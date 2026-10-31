# Models

> Governs a model: how strict it is, whether it changes, the secrets it holds, the values it builds, and the forms of pydantic's API it uses.

## General

### owned-document-model-strict → own-shape-strict-other-shape-tolerant · MUST

A model of a document the program owns sets `strict=True` in its `ConfigDict`.

| Why |
|---|
| pydantic otherwise converts a value of another type, the string `"1"` to the number 1, where the parent wants it to fail. |

### models-frozen → value-immutable-by-default · SHOULD

A model sets `frozen=True` in its `ConfigDict`.

| Why |
|---|
| a parsed value then cannot change after the check that admitted it. |

### secrets-typed-secret-str → secret-kept-out-of-output · MUST

A secret a model holds — a token, a password, a key — is typed `SecretStr`, and `get_secret_value()` is called only where the secret is sent.

| Why |
|---|
| `SecretStr` prints and serialises as asterisks, so a model logged or dumped whole leaks no secret. |

### pydantic-two-forms-only → deprecated-form-never-used · MUST

A model uses pydantic 2's forms — `model_config = ConfigDict(...)`, `field_validator` and `model_validator`, `model_validate` and `model_validate_json`, `model_dump` and `model_dump_json`, `model_copy` — never an inner `class Config`, `validator`, `root_validator`, `parse_obj`, `parse_raw`, `dict()`, `json()`, `copy()` or the `pydantic.v1` module.

| Why |
|---|
| pydantic 2 deprecates the old forms and will remove them; a type checker reports the deprecated calls, while an inner `class Config` and the `pydantic.v1` module carry no deprecation mark and stay with the review. |

### model-builds-values-through-the-domain → invariant-checked-in-post-init · MUST

A model never restates the check of a value that keeps an invariant: it builds the value through its dataclass, in an `AfterValidator` or a `field_validator`, and raises the value's failure again as a `ValueError` or a `PydanticCustomError`.

| Why |
|---|
| pydantic lists only a `ValueError`, an `AssertionError` or a `PydanticCustomError` in its `ValidationError`, so the value's own error escapes the parse unlisted, and a check copied into the model drifts from the value's own. |
