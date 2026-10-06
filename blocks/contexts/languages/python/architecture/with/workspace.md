# Python with workspace

> The distribution and import names of a Python workspace's units.

## python-unit-names-under-the-scope → unit-named-after-its-folder
`packages/<name>/` is the distribution `<scope>-<name>`, imported as `<scope>_<name>`; `shared/` is `<scope>-shared`, imported as `<scope>_shared`, its parts its subpackages, `<scope>_shared.contracts`; and `libs/<name>/` is `<scope>-libs-<name>`, imported as `<scope>_libs_<name>`.

| Why | Check | Tags |
|---|---|---|
| the build backend names the import package after the distribution, so the folder, the distribution and the import say one thing, and each unit is a top-level package of its own that the dependency check maps to its distribution. | review | [] |
