# Dependencies

> Governs the dev group, the pinned Python and the private names of a dependency.

## Pinning

### tools-in-the-dev-group → tool-pinned-exactly-by-the-repository · MUST

A tool PyPI publishes is pinned with `==` in the `dev` group of `[dependency-groups]` in `pyproject.toml`.

| Why | Tags |
|---|---|
| a dependency group is installed in the repository and never published with a package built from it. | [] |

### requires-python-at-the-pinned-minor · SHOULD

A unit that no registry distributes floors its `requires-python` in `[project]` at the minor of the interpreter the repository pins: `>=3.14`.

| Why | Tags |
|---|---|
| the floor is the language the code is written for, and a lower one withholds features the pinned interpreter offers while claiming a support nobody tests. | [] |

## Choosing and using

### private-name-of-a-dependency-never-imported → dependency-reached-through-its-public-entry · MUST

Code never imports, from another distribution, a module or a name whose path has a segment that opens with `_`.

| Why | Tags |
|---|---|
| a leading underscore is Python's mark of what a package keeps to itself and changes without notice. | [] |
