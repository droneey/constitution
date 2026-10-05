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

## specs-run-from-the-floor-to-the-newest · MUST
Whatever `requires-python` floor a published package declares, its specs run on every minor from the floor to the newest, and once more on the floor with its direct dependencies at the lowest versions its manifest allows. Its `Programming Language :: Python :: 3.<minor>` classifiers list each minor its specs run on. The repository's toolchain pins each of those minors, and every run takes its interpreter from them.

| Why | Check | Tags |
|---|---|---|
| a floor no run proves is a guess, and the lowest versions the manifest allows are ones a consumer's resolver may pick; a classifier promises only what a run proves, and a minor the toolchain does not pin is one the package manager downloads or finds on the machine, unverified. | review | [testing] |
