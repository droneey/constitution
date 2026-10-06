# pydantic

### pydantic-only-at-the-edge → outside-value-untyped-until-parsed
pydantic's home is the edge — an adapter's wire models, the delivery layer's request and response models, the code under `libs/` that parses, the settings under `root/` — and `shared/`, where code parses; no other folder imports it. `kernel/`, `contracts/` and a feature's `domain/` hold frozen dataclasses.

| Why | Tags |
|---|---|
| a model inside the domain ties the business types to a parsing library, and runs its validation again on data the edge has already checked. | [] |

### wire-model-mapped-to-the-domain → outside-shape-mapped-in-the-adapter
An adapter maps its wire model to the domain's dataclass, and the dataclass back to the wire model, inside the adapter; a model never crosses a contract.

| Why | Tags |
|---|---|
| the domain's types then change with the business and the wire's with the vendor, each without the other. | [] |

### settings-model-built-by-the-root → root-alone-reads-the-environment
The environment is read by one `BaseSettings` of pydantic-settings, built once by `root/` at boot; the rest of the program receives it, or the part of it that it needs.

| Why | Tags |
|---|---|
| a missing or malformed variable fails at start, with every problem listed, and nothing below the root reads the process's environment. | [security] |
