# Repository root

> Governs what the workspace's root holds and lists, and which units are private.

## General

### root-and-internal-units-private · MUST

The root and every unit nobody outside installs are marked private.

| Why |
|---|
| a consumer who installed the root would get the repository's tooling instead of a unit, and a publish run over the whole workspace cannot release by mistake a unit nobody outside installs, with whatever it holds. |

### root-holds-only-the-workspace · SHOULD

The root of a workspace holds only the workspace and the configuration of its tools, and no code of its own.

| Why |
|---|
| a root with code of its own has something a unit could import by accident, and something that leaks into a consumer. |

### root-holds-one-workspace-per-language · SHOULD

The root holds one workspace for each language, whose members are every package of that language in the repository, and no package holds a workspace of its own.

| Why |
|---|
| a workspace nested in a package is refused by one package manager and ignored by another, so its packages are never linked. |

### root-lists-only-what-its-own-files-need → configuration-holds-what-its-blocks-compute · MUST

The root of a workspace is a unit of its own: its `constitution.yaml` lists the blocks its own files and the checks that cross the packages need, never a block only a package needs, and its configurations hold every setting of those blocks, which leave the packages' files to the packages.

| Why |
|---|
| a root that listed its packages' blocks would hold each package's files to settings written for another's tree, as a path written from one package's `src/` misses or refuses the files of the rest. |
