# Units

> Governs a unit's name, the tools that check it and where their configuration sits.

## The vocabulary

In this block a unit is one package of the workspace, one it deploys or one others install, never a unit of code inside a package, as core's rules mean the word.

## General

### unit-named-after-its-folder · SHOULD

A unit is named after its folder. The name sits under the repository's scope, a unit in a group folder takes the group and its folder, `<group>-<folder>`, and no two units of the repository share a name.

| Why |
|---|
| a unit named apart from its folder sends the reader of every import to look up where it lives, a package manager refuses two members of one name, and the same folder in two groups would give two units one name. |

### unit-checked-by-its-own-tools → configuration-holds-what-its-blocks-compute · MUST

Each package is checked by its own tools. In a workspace those are the tools of its own blocks, run with that package's configuration, and no package's checks reach another package's files.

| Why |
|---|
| a tool's configuration applied from the root either misses a package's paths, as one that names `src/` does, and passes in silence, or applies one package's configuration to the others and changes their rules. |

### unit-configuration-kept-in-its-folder · SHOULD

A package's configuration of a tool sits in the package's own folder.

| Why |
|---|
| a configuration kept at the root for one package is left behind when the package moves to a repository of its own, which then runs without the checks that held it. |
