# deptry

## unused-dependency-fails → no-dead-code
`deptry src` fails on a dependency of `[project]` that nothing in `src/` imports (`DEP002`).

| Why | Check | Tags |
|---|---|---|
| a dependency only the specs import, or none, still installs with the program. | tool/unused | [security] |

## dev-tool-never-imported-by-the-program → tools-in-the-dev-group
`deptry src` fails when code in `src/` imports a package of the `dev` group (`DEP004`).

| Why | Check | Tags |
|---|---|---|
| the program then breaks wherever it is installed without the tools. | tool/unused | [] |

## spec-modules-unreachable-from-src → test-code-unreachable-from-production
`deptry src` fails when code in `src/` imports a module of `tests/`, which is neither the package's own nor a declared dependency (`DEP001`).

| Why | Check | Tags |
|---|---|---|
| the specs' folder is on the import path only while the specs run, so such an import passes them and fails wherever the program is installed. | tool/unused | [] |
