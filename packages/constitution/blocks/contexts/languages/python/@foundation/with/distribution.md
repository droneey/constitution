# Distribution

> Governs the types, integrations, dependencies and floor of a distributed Python package.

## Contents

### py-typed-where-code-is-imported → distributed-package-ships-its-types · MUST

Every distributed package whose code a consumer imports ships `py.typed` in its import package, beside its `__init__.py`.

| Why |
|---|
| without the marker a consumer's type checker ignores the package's annotations. |

### integration-is-a-submodule-named-for-its-framework → integration-is-an-entry-of-its-own · SHOULD

Every distributed package's integration into a framework is a submodule of its import package, named after the framework.

| Why |
|---|
| an integration in the package's own modules is imported, and its framework with it, by every consumer, while a submodule named after the framework is imported only by those who use it and found under the name they look for. |

### integration-framework-is-an-extra-of-its-name → integration-framework-an-optional-dependency · SHOULD

Every framework a distributed package integrates into is an extra of the framework's name in `[project.optional-dependencies]`.

| Why |
|---|
| a framework declared as a plain dependency is installed by every consumer, those who never use its integration included, while an extra comes only with `<package>[<framework>]`. |

## Manifest

### dependency-declared-with-a-floor → manifest-declares-dependencies-by-range · SHOULD

Every dependency of a distributed package is declared with a `>=` floor.

| Why |
|---|
| a floor lets the consumer's resolver take any later release the other packages accept, while a pin or a narrow range leaves it no version that satisfies every package. |

### requires-python-floor-in-the-support-window → runtime-floor-within-the-ecosystems-support-window · SHOULD

Every package on a public registry floors its `requires-python` at the oldest minor first released within the last three years.

| Why |
|---|
| a public package's consumers are unknown, so a floor above the window locks out a Python they still run, and one below it claims to support, untested, a Python the ecosystem has left — SPEC 0. |
