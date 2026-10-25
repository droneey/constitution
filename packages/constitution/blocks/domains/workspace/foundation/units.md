# Units

> Governs a unit's name, the tools that check it and where their configuration sits.

## General

### unit-named-after-its-folder · SHOULD

A unit is named after its folder under the repository's scope, in each of its languages, and no two units of the repository share a name.

| Why |
|---|
| an import then names the folder it reaches, and a package manager refuses two members of one name. |

### unit-checked-by-its-own-tools → rule-held-by-a-tool-where-one-can · MUST

In a workspace, the files of each package are checked by the tools of its own blocks with that package's configuration, and no package's checks reach another package's files.

| Why |
|---|
| a tool's configuration applied from the root either misses a package's paths, as one that names `src/` does, and passes in silence, or applies one package's configuration to the others and changes their rules. |

### unit-configuration-kept-in-its-folder · SHOULD

A package's configuration of a tool sits in the package's own folder, and the root's configuration of that tool holds only what every package shares.

| Why |
|---|
| a package then carries the rules that hold it, the root names nothing of one package's own, and a package moved to a repository of its own takes its checks with it. |

### root-configuration-serves-only-what-crosses-the-packages → configuration-takes-every-part-of-its-blocks · MUST

At the root of a workspace, a tool that has a part for the workspace takes only its workspace parts and its own: the root runs it only for what crosses the packages, and each package's configuration takes the parts of its own blocks.

| Why |
|---|
| a root that took every part of its packages would hold each package's files to settings written for another's tree, as a path written from one package's `src/` misses or refuses the files of the rest. |
