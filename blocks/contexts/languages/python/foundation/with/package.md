# Python with package

> The typed form of a published Python package.

## py-typed-in-every-package → package-ships-its-types
A published package ships `py.typed` in its import package, beside its `__init__.py`.

| Why | Check | Tags |
|---|---|---|
| without the marker a consumer's type checker ignores the package's annotations. | review | [] |

## requires-python-floor-in-the-support-window · SHOULD
A published package's `requires-python` is a `>=` floor at the oldest minor released within the last three years, as SPEC 0 counts them, and never at a minor past its end of life. Its `Programming Language :: Python :: 3.<minor>` classifiers list each minor its specs run on.

| Why | Check | Tags |
|---|---|---|
| the floor keeps every Python the package's consumers still run and drops those the ecosystem has left, and a classifier promises only what a run proves. | review | [] |

## specs-run-from-the-floor-to-the-newest · MUST
A published package's specs run on every minor from its floor to the newest, and once more on the floor with its direct dependencies at the lowest versions its manifest allows.

| Why | Check | Tags |
|---|---|---|
| a floor no run proves is a guess, and the lowest versions the manifest allows are ones a consumer's resolver may pick. | review | [testing] |
