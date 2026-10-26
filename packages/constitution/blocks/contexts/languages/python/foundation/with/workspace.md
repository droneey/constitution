# Workspace

> Governs the distribution and import names of a Python workspace's units.

## Units

### unit-names-spelled-under-the-scope → unit-named-after-its-folder · SHOULD

A unit is the distribution `<scope>-<name>`, imported as `<scope>_<name>`.

| Why |
|---|
| the folder, the distribution and the import then say one name, each in the spelling its form allows, and every unit is a top-level package of its own. |

## Shared data

### shared-data-read-through-its-import-package → file-lives-once-across-units · MUST

A Python package reads data another unit holds by importing that unit's import package and reading through `importlib.resources.files()` of it, never by a path or by the package's name in a string.

| Why |
|---|
| the data then comes from the installed package wherever it is installed, and the import shows a checker of the declared dependencies that the dependency is used, where a name in a string shows it nothing. |
