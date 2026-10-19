# Edge

> Governs where pydantic is imported, how an adapter maps its wire models, and who builds the settings model.

## General

### pydantic-home-is-the-edge-and-shared-parsing → layer-imports-dependencies-by-its-role · MUST

pydantic's home is the edge — an adapter's wire models, the code under `libs/` that parses, the settings under `root/` — the request and response models of the delivery units in the `app/` of a feature or a module of composition, and `shared/`, where code parses; no other folder imports it. `kernel/` and the `domain/` of a feature or a module of composition hold frozen dataclasses.

| Why | Tags |
|---|---|
| a model inside the domain ties the business types to a parsing library, and runs its validation again on data the edge has already checked. | [] |

### wire-model-mapped-to-the-domain → outside-shape-mapped-in-the-adapter · MUST

An adapter maps its wire model to the domain's dataclass, and the dataclass back to the wire model, inside the adapter; a model never crosses a contract.

| Why | Tags |
|---|---|
| the domain's types then change with the business and the wire's with the vendor, each without the other. | [] |

### settings-model-built-by-the-root → root-alone-reads-the-environment · MUST

The environment is read by one `BaseSettings` of pydantic-settings, built once by `root/` at boot; the rest of the program receives it, or the part of it that it needs.

| Why | Tags |
|---|---|
| a missing or malformed variable fails at start, with every problem listed, and nothing below the root reads the process's environment. | [security] |
