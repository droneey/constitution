# Edge

> Governs who builds the settings model.

## General

### settings-model-built-by-the-root → root-alone-reads-the-environment · MUST

The environment is read by one `BaseSettings` of pydantic-settings, built once by `root/` at boot; the rest of the program receives it, or the part of it that it needs.

| Why |
|---|
| a missing or malformed variable fails at start, with every problem listed, and nothing below the root reads the process's environment. |
