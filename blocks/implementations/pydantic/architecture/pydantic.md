# pydantic

## pydantic-only-at-the-edge → untrusted-input-parsed-at-edge
pydantic is imported only at the edge: by an adapter's wire models, the delivery layer's request and response models, the code under `libs/` and `shared/` that parses, and the settings under `root/`. `kernel/`, `contracts/` and a feature's `domain/` hold frozen dataclasses and import no pydantic.

| Why | Check | Tags |
|---|---|---|
| a model inside the domain ties the business types to a parsing library, and runs its validation again on data the edge has already checked. | review | [] |

## wire-model-mapped-to-the-domain → external-shapes-mapped-at-boundary
An adapter maps its wire model to the domain's dataclass, and the dataclass back to the wire model, inside the adapter; a model never crosses a contract.

| Why | Check | Tags |
|---|---|---|
| the domain's types then change with the business and the wire's with the vendor, each without the other. | review | [] |

## settings-model-built-by-the-root → environment-read-once-at-boot
The environment is read by one `BaseSettings` of pydantic-settings, with an `env_prefix`, `extra='forbid'` and `frozen=True`, built once by `root/` at boot; the rest of the program receives it, or the part of it that it needs.

| Why | Check | Tags |
|---|---|---|
| a missing or malformed variable fails at start, with every problem listed, and nothing below the root reads the process's environment. | review | [security] |
