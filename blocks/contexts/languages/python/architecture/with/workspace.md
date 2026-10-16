# Python with workspace

> Governs the distribution and import names of a Python workspace's units.

## Workspace

### unit-names-spelled-under-the-scope → unit-named-after-its-folder · SHOULD

An app is the distribution `<scope>-<name>`, imported as `<scope>_<name>`; a part of `shared/` is `<scope>-shared-<name>`, imported as `<scope>_shared_<name>`; a unit of `libs/` is `<scope>-libs-<name>`, imported as `<scope>_libs_<name>`.

| Why | Tags |
|---|---|
| the folder, the distribution and the import then say one name, each in the spelling its form allows, and every unit is a top-level package of its own. | [] |
