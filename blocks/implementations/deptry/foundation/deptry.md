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
