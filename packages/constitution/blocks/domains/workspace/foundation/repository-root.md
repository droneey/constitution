# Repository root

> Governs what the workspace's root holds and which units are private.

## General

### root-and-internal-units-private · MUST

The root and every unit nobody outside installs are marked private.

| Why | Tags |
|---|---|
| a consumer who installed the root would get the repository's tooling instead of a unit, and a publish run over the whole workspace cannot release by mistake a unit nobody outside installs, with whatever it holds. | [security] |

### root-holds-only-the-workspace · SHOULD

The root of a workspace holds only the workspace and the configuration of its tools, and no code of its own.

| Why | Tags |
|---|---|
| a root with code of its own has something a unit could import by accident, and something that leaks into a consumer. | [] |

### root-holds-one-workspace-per-language · SHOULD

The root holds one workspace for each language, whose members are every package of that language in the repository, and no package holds a workspace of its own.

| Why | Tags |
|---|---|
| a workspace nested in a package is refused by one package manager and ignored by another, so its packages are never linked. | [] |
