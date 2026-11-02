# Version control

> Governs the toolchain's files in the history.

## General

### personal-toolchain-overrides-ignored → machine-local-files-ignored · MUST

Version control ignores `mise.local.toml`.

| Why |
|---|
| a committed `mise.local.toml` changes the toolchain of everyone who pulls it to one person's choice. |
