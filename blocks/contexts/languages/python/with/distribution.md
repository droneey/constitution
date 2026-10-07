# Python with distribution

> The typed form and the floor of a distributed Python package.

### py-typed-where-code-is-imported → distributed-unit-ships-its-types · MUST
A published package whose code a consumer imports ships `py.typed` in its import package, beside its `__init__.py`.

| Why | Tags |
|---|---|
| without the marker a consumer's type checker ignores the package's annotations. | [] |

### requires-python-floor-in-the-support-window · SHOULD
A package published for the public, on an index anyone installs from — one whose code its consumers import, or an application distributed through it — floors its `requires-python` at the oldest minor released within the last three years, as SPEC 0 counts them, and never at a minor past its end of life.

| Why | Tags |
|---|---|
| a public package's consumers are unknown, and the window keeps every Python they still run while dropping those the ecosystem has left. | [] |

### supported-minors-classified-and-pinned · MUST
A published package's `Programming Language :: Python :: 3.<minor>` classifiers list every minor from its `requires-python` floor to the newest, and the repository's toolchain pins each of them.

| Why | Tags |
|---|---|
| a classifier tells a consumer which Python the package supports, and a minor the toolchain does not pin is one the package manager downloads or finds on the machine, unverified. | [] |

### integration-is-a-submodule-and-an-extra → integration-is-an-entry-with-an-optional-framework · SHOULD
An integration is a submodule of the import package named after its framework, and the framework is an extra of the same name in `[project.optional-dependencies]`.

| Why | Tags |
|---|---|
| a consumer installs `<package>[<framework>]` to bring the framework along, and the build writes the extra into the package's metadata as `Provides-Extra`, so nobody else installs it. | [] |
