# Units

> Governs a unit's name, the tools that check it and where their configuration sits.

## General

### unit-named-after-its-folder · SHOULD

A unit is named after its folder under the repository's scope, in each of its languages, and no two units of the repository share a name.

| Why | Tags |
|---|---|
| an import then names the folder it reaches, and a package manager refuses two members of one name. | [] |

### unit-checked-by-its-own-tools → rule-held-by-a-tool-where-one-can · MUST

In a workspace, the files of each package are checked by the tools of its own blocks with that package's configuration, and no package's checks reach another package's files.

| Why | Tags |
|---|---|
| a tool's configuration applied from the root either misses a package's paths, as one that names `src/` does, and passes in silence, or applies one package's configuration to the others and changes their rules. | [] |

### unit-configuration-kept-in-its-folder · SHOULD

A package's configuration of a tool sits in the package's own folder, and the root's configuration of that tool holds only what every package shares.

| Why | Tags |
|---|---|
| a package then carries the rules that hold it, the root names nothing of one package's own, and a package moved to a repository of its own takes its checks with it; a tool that reads one configuration for the whole repository keeps each package's part in the root's under the package's path. | [] |
