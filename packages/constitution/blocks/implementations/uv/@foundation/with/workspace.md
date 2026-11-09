# Workspace

> Governs a workspace of Python units as a uv workspace: its root, its members, how they link, which are marked unpublishable, and how one ships the data a group shares.

## Root

### workspace-root-has-no-project → package-nobody-installs-marked-unpublishable · MUST

The root `pyproject.toml` of a uv workspace has no `[project]` table, so the root is no package.

#### Why

A root with a `[project]` table is a package uv locks, builds and can publish, with whatever the root holds, while a root without one has nothing a publish run can upload.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/pyproject.json
# pyproject.toml
[project]
name = "shop"
version = "0.0.0"

[tool.uv.workspace]
members = ["packages/*/python", "apps/api"]
```

```toml title="Prefer"
#:schema https://json.schemastore.org/pyproject.json
# pyproject.toml
[tool.uv.workspace]
members = ["packages/*/python", "apps/api"]
```

## Members

### uv-workspace-globbed-by-the-tree → root-holds-one-workspace-per-language · MUST

The uv workspace's `members` matches only the Python packages, by the tree. It lists the glob `packages/*/python`, which matches only the Python package of each group, and the path of every other Python package: an app, `apps/<name>` or `apps/<group>/<name>`, a package in Python alone, `packages/<name>`, and a group's `shared/` that a Python package reads, `packages/<group>/shared`.

#### Why

Uv 0.13 refuses a folder a glob matches without a `pyproject.toml`, another language's package included, unless `exclude` names it, so a glob of `apps/*` or `packages/<group>/*` would take every package of another language with it, and `exclude`, whose `*` crosses a slash, can drop a language's folder by mistake.

#### Examples

```toml title="Avoid"
[tool.uv.workspace]
members = ["packages/*", "apps/*"]
```

```toml title="Prefer"
[tool.uv.workspace]
members = ["packages/*/python", "packages/billing/shared", "apps/api"]
```

### packages-linked-by-workspace-source → own-package-resolved-from-the-working-tree · SHOULD

Every Python package that depends on another member names it in `[tool.uv.sources]` with `{ workspace = true }`.

#### Why

A package named without `{ workspace = true }` is installed from the registry instead of the working tree, so a change to it is not tested by its users before it is published.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/pyproject.json
# apps/api/pyproject.toml
[project]
dependencies = ["shop-billing"]

[tool.uv.sources]
shop-billing = { path = "../../packages/billing/python", editable = true }
```

```toml title="Prefer"
#:schema https://json.schemastore.org/pyproject.json
# apps/api/pyproject.toml
[project]
dependencies = ["shop-billing"]

[tool.uv.sources]
shop-billing = { workspace = true }
```

### uv-workspace-table-only-at-the-root → root-holds-one-workspace-per-language · MUST

No member's `pyproject.toml` holds a `[tool.uv.workspace]`.

#### Why

Uv 0.13 resolves one version of every dependency for all the members of the root's workspace and refuses a workspace nested in one of them, so a member that declares its own fails every lock.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/pyproject.json
# packages/billing/python/pyproject.toml
[project]
name = "shop-billing"

[tool.uv.workspace]
members = ["../shared"]
```

```toml title="Prefer"
#:schema https://json.schemastore.org/pyproject.json
# packages/billing/python/pyproject.toml
[project]
name = "shop-billing"
```

### unpublished-member-classified-do-not-upload → package-nobody-installs-marked-unpublishable · MUST

Every member nobody outside the repository installs lists `Private :: Do Not Upload` among the `classifiers` of its `[project]`.

#### Why

The Python Package Index refuses an upload whose classifiers include one that opens with `Private ::`, so a publish run over the whole repository cannot release by mistake a member nobody outside installs.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/pyproject.json
# apps/api/pyproject.toml
[project]
name = "shop-api"
version = "0.0.0"
```

```toml title="Prefer"
#:schema https://json.schemastore.org/pyproject.json
# apps/api/pyproject.toml
[project]
name = "shop-api"
version = "0.0.0"
classifiers = ["Private :: Do Not Upload"]
```

## Shared data

### shared-data-packed-as-a-namespace-package → file-lives-once-across-units · MUST

Every group's shared package that a Python package reads is a namespace package. It sets `module-root = ""` and `namespace = true` under `[tool.uv.build-backend]`, with its data inside the folder of its import package's name.

#### Why

Uv_build 0.13 refuses a path outside the project, so the data reaches an installed package only as a package of its own; a namespace package needs no `__init__.py`, so the shared package holds no Python, and its wheel holds the folder of the data alone, whatever else its root holds.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/pyproject.json
# packages/billing/shared/pyproject.toml
[tool.uv.build-backend]
module-name = "billing_shared"
```

```toml title="Prefer"
#:schema https://json.schemastore.org/pyproject.json
# packages/billing/shared/pyproject.toml
[tool.uv.build-backend]
module-name = "billing_shared"
module-root = ""
namespace = true
```
