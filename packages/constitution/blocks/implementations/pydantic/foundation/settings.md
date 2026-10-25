# Settings

> Governs the settings model that reads the environment.

## General

### settings-model-prefixed-and-closed → configuration-parsed-once-at-start · MUST

A `BaseSettings` sets an `env_prefix` and `extra='forbid'`.

| Why |
|---|
| the prefix keeps the program's variables apart from those of every other tool in the process's environment, and a key of the local environment file that the model does not know fails instead of being dropped. |
