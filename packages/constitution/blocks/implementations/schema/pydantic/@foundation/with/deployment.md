# Deployment

> Governs how the settings model takes the settings its host hands the program.

## General

### settings-model-sets-an-env-prefix → configuration-enters-only-through-its-declaration · MUST

Every `BaseSettings` sets an `env_prefix`.

| Why |
|---|
| without a prefix the settings model reads a variable of the same name that another tool in the process's environment sets, so a setting nobody declared for the program enters it. |

### settings-model-keeps-extra-forbidden → configuration-enters-only-through-its-declaration · MUST

No `BaseSettings` loosens its default `extra='forbid'`.

| Why |
|---|
| with `extra` loosened, a key the settings model does not declare in a dotenv file it reads, a misspelt one among them, is dropped in silence or kept unread instead of failing the start. |
