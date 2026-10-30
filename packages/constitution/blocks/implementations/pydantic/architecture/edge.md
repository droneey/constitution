# Edge

> Governs where pydantic is imported and who builds the settings model.

## General

### pydantic-home-is-the-edge-and-shared-parsing → layer-imports-dependencies-by-its-role · MUST

pydantic's home is the edge — an adapter's wire models, the code under `libs/` that parses, the settings under `root/` — the request and response models of the delivery units in the presentation of a feature or a module of composition, and `shared/`, where code parses; no other folder imports it.

| Why |
|---|
| a model inside the domain ties the business types to a parsing library, and runs its validation again on data the edge has already checked. |

### settings-model-built-by-the-root → root-alone-reads-the-environment · MUST

The environment is read by one `BaseSettings` of pydantic-settings, built once by `root/` at boot; the rest of the program receives it, or the part of it that it needs.

| Why |
|---|
| a missing or malformed variable fails at start, with every problem listed, and nothing below the root reads the process's environment. |
