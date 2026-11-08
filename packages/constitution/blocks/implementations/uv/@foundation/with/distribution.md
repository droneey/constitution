# Distribution

> Governs what uv packs into a distributed Python package, its licence included.

## General

### files-shipped-named-in-pyproject → distributed-package-ships-only-what-its-manifest-names · MUST

Every distributed Python package excludes in `pyproject.toml` each file of its import package's folder that does not ship. `uv_build` packs that folder whole, so `source-exclude` under `[tool.uv.build-backend]` names each such file, and `source-include` adds a file from outside it.

| Why |
|---|
| `uv_build` puts every file of the import package's folder into the source distribution and the wheel alike, so a local configuration left there ships to every user. |

### licence-named-by-license-files → distributed-package-ships-its-licence · MUST

Every distributed Python package names its licence file in `license-files` under `[project]`.

| Why |
|---|
| `uv_build` ships the licence only when `license-files` names it, so a package without the entry reaches its users with no licence beside it. |
