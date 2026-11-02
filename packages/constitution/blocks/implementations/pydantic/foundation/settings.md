# Settings

> Governs the settings model that reads the environment.

## General

### settings-model-prefixed-and-closed → configuration-enters-only-through-its-declaration · MUST

A `BaseSettings` sets an `env_prefix` and `extra='forbid'`.

| Why |
|---|
| without a prefix the settings model reads a variable of the same name that another tool in the process's environment sets, and without `extra='forbid'` a key of the local environment file it does not know, a misspelt one among them, is dropped in silence instead of failing the start. |
