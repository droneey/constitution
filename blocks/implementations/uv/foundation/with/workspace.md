# uv with workspace

> A workspace of Python units as a uv workspace.

### workspace-root-has-no-project → workspace-root-private
The root `pyproject.toml` of a uv workspace has no `[project]` table.

| Why | Tags |
|---|---|
| uv then takes the root as the workspace alone, with no package of its own to lock, build or publish. | [] |

### packages-linked-by-workspace-source → units-linked-from-the-working-tree
The root's `[tool.uv.workspace]` lists every Python package of the repository in `members`, and a package that depends on another names it in `[tool.uv.sources]` with `{ workspace = true }`; no package's `pyproject.toml` holds a `[tool.uv.workspace]`.

| Why | Tags |
|---|---|
| uv 0.12 installs each listed package from the working tree and resolves one version of every dependency for all of them, and refuses a workspace nested in a package. | [] |

### one-lock-for-the-workspace → one-version-per-dependency
`uv.lock` resolves one version of each dependency for the root and every package of its workspace.

| Why | Tags |
|---|---|
| uv resolves the workspace as one whole, so a second version of a dependency cannot enter while every manifest is listed in it. | [] |

### shared-data-linked-into-the-import-package → file-lives-once-across-units
A Python package takes the data it needs at run time from a file outside its project by a committed file symlink inside its import package, pointing at the single source, and a spec of the package reads the data through the package's resources and parses it.

| Why | Tags |
|---|---|
| uv_build 0.12 refuses a path outside the project in `source-include` and in `data`, ignores an absolute one, and follows a file symlink, writing the file's content into the sdist and the wheel, so the sdist builds alone; a checkout without symbolic links holds the link's path as text, which the spec then fails to parse. | [data] |
