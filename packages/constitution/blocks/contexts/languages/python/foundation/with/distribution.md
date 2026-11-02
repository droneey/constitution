# Distribution

> Governs the types, entries, manifest and floor of a distributed Python package.

## Contents

### py-typed-where-code-is-imported → distributed-unit-ships-its-types · MUST

A published package whose code a consumer imports ships **`py.typed`** in its import package, beside its `__init__.py`.

| Why |
|---|
| without the marker a consumer's type checker ignores the package's annotations. |

### integration-is-a-submodule-and-an-extra → integration-is-an-entry-with-an-optional-framework · SHOULD

An integration is a submodule named after its framework, and the framework is an extra of the same name. The submodule sits in the import package, and the extra in `[project.optional-dependencies]`.

| Why |
|---|
| a framework declared as a plain dependency is installed by every consumer, those who never use its integration included, while an extra comes only with `<package>[<framework>]`. |

## Manifest

### dependency-declared-with-a-floor → manifest-declares-dependencies-by-range · SHOULD

A distributed package declares each dependency with a `>=` floor. It caps one with `<` only with the reason beside the cap.

| Why |
|---|
| a floor lets the consumer's resolver take any later release the other packages accept, so a cap is a decision, and one with no reason blocks every later fix. |

### requires-python-floor-in-the-support-window → runtime-floor-within-the-ecosystems-support-window · SHOULD

A package published on a public index floors its `requires-python` at the oldest minor released within the last three years, as SPEC 0 counts them.

| Why |
|---|
| a public package's consumers are unknown, so a floor above the window locks out a Python they still run, and one below it claims to support, untested, a Python the ecosystem has left — SPEC 0. |
