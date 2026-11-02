# Workspace

> Governs the distribution and import names of a Python workspace's units.

## Units

### unit-names-spelled-under-the-scope → unit-named-after-its-folder · SHOULD

A unit is the distribution `<scope>-<name>`, imported as `<scope>_<name>`.

| Why |
|---|
| a unit whose distribution or import name differs from its folder's is looked for under the wrong name, and one imported without its scope can collide with another top-level package. |

## Shared data

### shared-data-read-through-its-import-package → file-lives-once-across-units · MUST

A Python package reads another unit's data through that unit's import package. It imports the import package and reads through `importlib.resources.files()` of it, never by a path or by the package's name in a string.

| Why |
|---|
| a path reaches the data only where the working tree lays it out, so the installed package misses it, and a name in a string hides the dependency from the checker of declared dependencies. |
