# Units

> Governs a unit's name, the tools that check it and where their configuration sits.

## General

### unit-named-after-its-folder · SHOULD

A unit is named after its folder under the repository's scope, a unit in a group folder after the group and its folder, `<group>-<folder>`, and no two units of the repository share a name.

| Why |
|---|
| an import then names the folder it reaches, a package manager refuses two members of one name, and the same folder in two groups would otherwise give one. |

### unit-checked-by-its-own-tools → rule-held-by-a-tool-where-one-can · MUST

In a workspace, the files of each package are checked by the tools of its own blocks with that package's configuration, and no package's checks reach another package's files.

| Why |
|---|
| a tool's configuration applied from the root either misses a package's paths, as one that names `src/` does, and passes in silence, or applies one package's configuration to the others and changes their rules. |

### unit-configuration-kept-in-its-folder · SHOULD

A package's configuration of a tool sits in the package's own folder, and the root's configuration of that tool names nothing of a package's own.

| Why |
|---|
| a package then carries the rules that hold it, the root names nothing of one package's own, and a package moved to a repository of its own takes its checks with it. |

### root-lists-only-what-its-own-files-need → configuration-holds-what-its-blocks-compute · MUST

The root of a workspace is a unit of its own: its `constitution.yaml` lists the blocks its own files and the checks that cross the packages need, never a block only a package needs, and its configurations hold every setting of those blocks, which leave the packages' files to the packages.

| Why |
|---|
| a root that listed its packages' blocks would hold each package's files to settings written for another's tree, as a path written from one package's `src/` misses or refuses the files of the rest. |
