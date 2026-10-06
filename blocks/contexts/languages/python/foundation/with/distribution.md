# Python with distribution

> The typed form and the floor of a distributed Python package.

## py-typed-where-code-is-imported → ships-its-types
A published package whose code a consumer imports ships `py.typed` in its import package, beside its `__init__.py`.

| Why | Check | Tags |
|---|---|---|
| without the marker a consumer's type checker ignores the package's annotations. | review | [] |

## requires-python-floor-in-the-support-window · SHOULD
A package published for the public, on an index anyone installs from — a library, or an application distributed through it — floors its `requires-python` at the oldest minor released within the last three years, as SPEC 0 counts them, and never at a minor past its end of life.

| Why | Check | Tags |
|---|---|---|
| a public package's consumers are unknown, and the window keeps every Python they still run while dropping those the ecosystem has left. | review | [] |

## supported-minors-classified-and-pinned · MUST
A published package's `Programming Language :: Python :: 3.<minor>` classifiers list every minor from its `requires-python` floor to the newest, and the repository's toolchain pins each of them.

| Why | Check | Tags |
|---|---|---|
| a classifier tells a consumer which Python the package supports, and a minor the toolchain does not pin is one the package manager downloads or finds on the machine, unverified. | review | [] |
