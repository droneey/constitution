# Python with workspace

> The distribution and import names of a Python workspace's units.

### python-unit-names-under-the-scope → unit-named-after-its-folder
A product is the distribution `<scope>-<name>`, imported as `<scope>_<name>`; `shared/` is `<scope>-shared`, imported as `<scope>_shared`; a unit of `libs/` is `<scope>-libs-<name>`, imported as `<scope>_libs_<name>`; and an integration is the submodule of its framework, installed with the extra of the same name, `<scope>-<name>[<framework>]`.

| Why | Tags |
|---|---|
| the build backend names the import package after the distribution, so the folder, the distribution and the import say one thing, and each unit is a top-level package of its own that the dependency check maps to its distribution. | [] |
