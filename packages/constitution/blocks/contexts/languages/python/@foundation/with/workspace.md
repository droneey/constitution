# Workspace

> Governs the distribution and import names of a Python workspace's packages, and the data one reads of another.

## Names

### distribution-name-opens-with-the-namespace → package-name-under-the-repositorys-namespace · SHOULD

Every Python package of the repository is distributed under a name that opens with `<namespace>-`, its `<namespace>` the repository's own.

| Why |
|---|
| a registry with no namespaces of its own gives a name to whoever claims it first, so a package named without the repository's prefix collides with another owner's, and its consumer cannot tell which packages come from one repository. |

### import-name-opens-with-the-namespace · SHOULD

Every Python package of the repository is imported by its distribution's name with an underscore for each hyphen. Its import name thus opens with the repository's namespace and an underscore.

| Why |
|---|
| an import name apart from the distribution's is looked for under the wrong name, and one without the repository's prefix can collide with another installed top-level package. |

## Shared data

### shared-data-read-through-its-import-package → file-lives-once-across-units · MUST

Every Python package reads another package's data through that package's import package. It imports the import package and reads through `importlib.resources.files()` of it, never by a path or by the package's name in a string.

| Why |
|---|
| a path reaches the data only where the working tree lays it out, so the installed package misses it, and a name in a string hides the dependency from the checker of declared dependencies. |
