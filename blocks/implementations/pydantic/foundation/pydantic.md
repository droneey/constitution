# pydantic

### owned-documents-strict-vendor-answers-tolerant → documents-strict-vendor-answers-tolerant
A model of a document the program owns sets `ConfigDict(extra='forbid', strict=True)`; a model of a vendor's answer keeps `extra='ignore'`.

| Why | Tags |
|---|---|
| `extra='forbid'` fails on an unknown key and `strict=True` on a value of another type, which pydantic otherwise converts. | [] |

### validation-errors-become-error-details → parse-failure-is-one-coded-error
Input is parsed by `model_validate` or `model_validate_json`, and each entry of the `ValidationError` it raises becomes a detail, its `loc` the path and its `type` the reason, read by `errors(include_input=False)`.

| Why | Tags |
|---|---|
| `include_input=False` keeps the rejected values out of the entries pydantic returns. | [errors, security] |

### settings-model-prefixed-and-closed → environment-names-declared-in-one-place · MUST
A `BaseSettings` sets an `env_prefix` and `extra='forbid'`.

| Why | Tags |
|---|---|
| the prefix keeps the program's variables apart from those of every other tool in the process's environment, and a key of the local environment file that the model does not know fails instead of being dropped. | [] |

### models-frozen → immutable-by-default
A model sets `frozen=True` in its `ConfigDict`.

| Why | Tags |
|---|---|
| a parsed value then cannot change after the check that admitted it. | [] |

### secrets-typed-secret-str → no-secret-or-personal-data-in-output
A secret a model holds — a token, a password, a key — is typed `SecretStr`, and `get_secret_value()` is called only where the secret is sent.

| Why | Tags |
|---|---|
| `SecretStr` prints and serialises as asterisks, so a model logged or dumped whole leaks no secret. | [security] |

### pydantic-two-forms-only → deprecated-forms-never-used
A model uses pydantic 2's forms — `model_config = ConfigDict(...)`, `field_validator` and `model_validator`, `model_validate` and `model_validate_json`, `model_dump` and `model_dump_json`, `model_copy` — never an inner `class Config`, `validator`, `root_validator`, `parse_obj`, `parse_raw`, `dict()`, `json()`, `copy()` or the `pydantic.v1` module.

| Why | Tags |
|---|---|
| pydantic 2 deprecates the old forms and will remove them; a type checker reports the deprecated calls, while an inner `class Config` and the `pydantic.v1` module carry no deprecation mark and stay with the review. | [] |
