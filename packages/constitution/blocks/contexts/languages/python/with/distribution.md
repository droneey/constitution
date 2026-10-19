# Distribution

> Governs the types, entries, manifest and floor of a distributed Python package.

## Contents

### py-typed-where-code-is-imported → distributed-unit-ships-its-types · MUST

A published package whose code a consumer imports ships `py.typed` in its import package, beside its `__init__.py`.

| Why | Tags |
|---|---|
| without the marker a consumer's type checker ignores the package's annotations. | [] |

### integration-is-a-submodule-and-an-extra → integration-is-an-entry-with-an-optional-framework · SHOULD

An integration is a submodule of the import package named after its framework, and the framework is an extra of the same name in `[project.optional-dependencies]`.

| Why | Tags |
|---|---|
| a consumer installs `<package>[<framework>]` to bring the framework along, and one who never asks for the extra never installs it. | [] |

## Manifest

### dependency-declared-with-a-floor → manifest-declares-dependencies-by-range · SHOULD

A distributed package declares each dependency with a `>=` floor, and caps it with `<` only with the reason beside the cap.

| Why | Tags |
|---|---|
| a floor lets the consumer's resolver take any later release the other packages accept, so a cap is a decision, and one with no reason blocks every later fix. | [] |

### requires-python-floor-in-the-support-window → runtime-floor-within-the-ecosystems-support-window · SHOULD

A package published on a public index floors its `requires-python` at the oldest minor released within the last three years, as SPEC 0 counts them.

| Why | Tags |
|---|---|
| a public package's consumers are unknown, and the window keeps every Python they still run while dropping those the ecosystem has left. | [] |

### classifiers-list-every-supported-minor · SHOULD

A published package's `Programming Language :: Python :: 3.<minor>` classifiers list every minor from its `requires-python` floor to the newest it supports.

| Why | Tags |
|---|---|
| a consumer reads from the classifiers which Pythons the package supports, and a missing or stale one says otherwise than the floor. | [] |
